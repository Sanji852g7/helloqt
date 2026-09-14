import 'dotenv/config'
import crypto from 'node:crypto'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { products, collections } from '../src/data/products.js'
import { priceOrder } from '../src/data/pricing.js'
import {
  SITE_BASE_URL,
  WELCOME_CODE,
  orderEmailHtml,
  shippingEmailHtml,
  unsubscribeToken,
  welcomeEmailHtml,
} from './emails.js'

const app = express()

const PORT = process.env.PORT || 8787

// Only the real shop may call this API from a browser, so a copycat site
// cannot quietly use our backend to place orders or send emails
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .concat([SITE_BASE_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'])

app.use(
  cors({
    // No origin means a server-to-server call (webhooks, curl), which CORS does not guard anyway
    origin: (origin, callback) =>
      !origin || ALLOWED_ORIGINS.includes(origin)
        ? callback(null, true)
        : callback(new Error('Origin not allowed')),
  }),
)
// Small cap so nobody can tie the server up with a giant JSON payload
app.use(express.json({ limit: '100kb' }))

// Turns a blocked origin or malformed JSON into a clean reply, not a crash page
app.use((err, req, res, next) => {
  if (err?.message === 'Origin not allowed') return res.status(403).json({ error: 'Not allowed.' })
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large.' })
  if (err instanceof SyntaxError) return res.status(400).json({ error: 'Invalid request.' })
  return next(err)
})

// Rate limiters count per IP, so only trust a proxy header when we are behind one
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY))

// Builds a per-IP rate limiter with a friendly message
const limiter = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
  })

const generalLimit = limiter(15, 200, 'Too many requests, please slow down and try again shortly.')
const orderLimit = limiter(15, 10, 'Too many orders from this connection, please try again later.')
const emailLimit = limiter(60, 5, 'Too many requests, please try again in a little while.')
const codeLimit = limiter(15, 20, 'Too many code checks, please try again in a few minutes.')
const chatLimit = limiter(10, 30, 'Mini Sanji needs a little break, please try again shortly.')

app.use('/api/', generalLimit)

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    '\n[helloqt-server] ANTHROPIC_API_KEY is not set. Add it to a .env file in the project root before using the AI chat.\n',
  )
}

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null

if (!process.env.RESEND_API_KEY) {
  console.warn(
    '\n[helloqt-server] RESEND_API_KEY is not set. Add it to a .env file to send order confirmation emails.\n',
  )
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
// Resend's shared test address; only delivers to your own Resend account
// email until a real domain is verified with Resend.
const FROM_EMAIL = 'HelloQT <onboarding@resend.dev>'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '\n[helloqt-server] SUPABASE_SERVICE_ROLE_KEY is not set. Add it to a .env file to use the discount code feature.\n',
  )
}

// Admin client with elevated access, used only server-side to read/write the
// subscribers table (which has no public RLS policies on purpose)
const supabaseAdmin =
  process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null

// Shared password Supabase must send with every order webhook call
const ORDER_WEBHOOK_SECRET = process.env.ORDER_WEBHOOK_SECRET || null

if (!ORDER_WEBHOOK_SECRET) {
  console.warn(
    '\n[helloqt-server] ORDER_WEBHOOK_SECRET is not set. Shipping emails are disabled until it is, so nobody can trigger fake ones.\n',
  )
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

// Checks a string looks like a real email address and is a sensible length
function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

// Trims a free-text field and cuts it off at a maximum length
function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

// Compares two secrets without leaking which character differed
function secretsMatch(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return crypto.timingSafeEqual(bufferA, bufferB)
}

// Reads the logged-in user from the request's Supabase access token, if any
async function userFromRequest(req) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ') || !supabaseAdmin) return null
  const { data, error } = await supabaseAdmin.auth.getUser(header.slice(7))
  if (error || !data?.user) return null
  return data.user
}

const catalogSummary = products
  .map((p) => {
    const c = collections[p.collection]
    return `- ${p.name} (${p.slug}): ${p.style}, ${p.length} length, £${p.price}, part of the ${c.name}. ${p.tagline}`
  })
  .join('\n')

const SYSTEM_PROMPT = `You are Mini Sanji, the friendly AI lash advisor for HelloQT, a one-woman, cruelty-free strip lash brand based in London, UK, run by Sanji. You are a lighthearted AI stand-in for Sanji, not the real her, and you can say so if asked.

Your job is to help customers find the right lash style from HelloQT's real catalog below. Only recommend products that exist in this list, never invent styles, prices, or details.

Catalog:
${catalogSummary}

Collections:
- Suitcase Set (25mm, dramatic, for big nights out, packed in a little travel suitcase case)
- Compact Set (15mm, everyday wear, packed in a mirror compact)

Keep replies short, warm, and a little cute (this is a girly, homey brand), and always end by naming one specific recommended product by name when you have enough information. If you need more detail to recommend well, ask one short follow-up question at a time.`

// Sends the chat history to Claude and returns its reply
app.post('/api/lash-chat', chatLimit, async (req, res) => {
  const { messages } = req.body

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return res.status(400).json({ error: 'messages must be a list of 1 to 30 messages' })
  }

  // Reject anything that is not a normal short chat turn, so the chat cannot
  // be repurposed as a free general-purpose Claude endpoint
  const validShape = messages.every(
    (m) =>
      m &&
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length <= 2000,
  )

  if (!validShape) {
    return res.status(400).json({ error: 'Each message needs a role and text under 2000 characters' })
  }

  if (!client) {
    return res.status(503).json({
      error: 'AI chat is not configured yet. Add ANTHROPIC_API_KEY to a .env file and restart the server.',
    })
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    res.json({ reply: textBlock?.text ?? '' })
  } catch (error) {
    console.error('[helloqt-server] Claude API error:', error)
    res.status(500).json({ error: 'Something went wrong talking to the AI. Please try again.' })
  }
})

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

// Places an order. The browser only says which lashes and how many — every
// price, the delivery charge, the discount and the total are worked out here
// from the real catalogue, so the total can never be tampered with.
app.post('/api/create-order', orderLimit, async (req, res) => {
  const { items: requestedItems, discountCode } = req.body
  const email = cleanText(req.body.email, 254).toLowerCase()
  const fullName = cleanText(req.body.fullName, 100)

  if (!isValidEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (!fullName) return res.status(400).json({ error: 'Enter your full name.' })

  if (!supabaseAdmin) return res.status(503).json({ error: 'Orders are not configured yet.' })

  // Logged-in shoppers send their Supabase token; the order is filed against
  // the account that token really belongs to, never an id the browser claims
  const user = await userFromRequest(req)

  // Only consider a discount if this email genuinely has an unused code
  let discountApplied = false
  if (discountCode && cleanText(discountCode, 40).toUpperCase() === WELCOME_CODE) {
    const { data: consumed } = await supabaseAdmin
      .from('subscribers')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false)
      .select('id')
      .maybeSingle()
    discountApplied = Boolean(consumed)
  }

  const priced = priceOrder(requestedItems, { discountApplied })

  // Hand the code back if the basket itself turned out to be invalid
  if (priced.error) {
    if (discountApplied) {
      await supabaseAdmin.from('subscribers').update({ used: false }).eq('email', email)
    }
    return res.status(400).json({ error: priced.error })
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      email,
      full_name: fullName,
      items: priced.items,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
    })
    .select('order_ref')
    .single()

  if (error) {
    console.error('[helloqt-server] Order creation error:', error)
    if (discountApplied) {
      await supabaseAdmin.from('subscribers').update({ used: false }).eq('email', email)
    }
    return res.status(500).json({ error: 'Something went wrong placing your order.' })
  }

  const orderRef = data.order_ref

  // Confirmation is sent from the order we just saved, so the email always
  // matches the real order and cannot be triggered on its own
  if (resend) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: `Your HelloQT order ${orderRef} is confirmed`,
        html: orderEmailHtml({ orderRef, fullName, items: priced.items, total: priced.total }),
      })
    } catch (emailError) {
      // The order is already safe in the database, so never fail the checkout
      console.error('[helloqt-server] Confirmation email error:', emailError)
    }
  }

  res.json({
    orderRef,
    discountApplied,
    subtotal: priced.subtotal,
    shipping: priced.shipping,
    discount: priced.discount,
    total: priced.total,
  })
})

/* ------------------------------------------------------------------ */
/* Email capture and discount codes                                    */
/* ------------------------------------------------------------------ */

const SUBSCRIBE_SOURCES = ['popup', 'account_signup']

// Signs an email up for the welcome discount and emails them the code
app.post('/api/subscribe', emailLimit, async (req, res) => {
  const email = cleanText(req.body.email, 254).toLowerCase()
  const { source } = req.body

  if (!isValidEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (!SUBSCRIBE_SOURCES.includes(source)) {
    return res.status(400).json({ error: 'Unknown signup source.' })
  }

  if (!supabaseAdmin || !resend) {
    return res.status(503).json({ error: 'Email capture is not configured yet.' })
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    // Already-subscribed people get the same reply as new ones, so this page
    // can never be used to find out who does and does not shop here
    if (!existing) {
      const { error: insertError } = await supabaseAdmin
        .from('subscribers')
        .insert({ email, source })
      if (insertError) throw insertError

      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Your 10% off HelloQT code',
        html: welcomeEmailHtml({ email }),
      })
    }

    res.json({ ok: true })
  } catch (error) {
    console.error('[helloqt-server] Subscribe error:', error)
    res.status(500).json({ error: 'Something went wrong signing you up. Please try again.' })
  }
})

// Checks whether the shared code is valid for this email, without consuming it
app.post('/api/validate-discount', codeLimit, async (req, res) => {
  const email = cleanText(req.body.email, 254).toLowerCase()
  const code = cleanText(req.body.code, 40).toUpperCase()

  if (!code || !isValidEmail(email)) {
    return res.status(400).json({ error: 'code and a valid email are required' })
  }

  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Discount codes are not configured yet.' })
  }

  if (code !== WELCOME_CODE) return res.json({ valid: false })

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('used')
    .eq('email', email)
    .maybeSingle()

  // One shared answer for "never signed up" and "already used it", so this
  // cannot be used to test whether an email is a HelloQT customer
  res.json({ valid: Boolean(!error && data && !data.used) })
})

/* ------------------------------------------------------------------ */
/* Unsubscribe                                                         */
/* ------------------------------------------------------------------ */

// Builds a plain confirmation page shown after clicking "Unsubscribe"
function unsubscribePageHtml({ success }) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><title>HelloQT</title></head>
<body style="font-family:Helvetica, Arial, sans-serif; background:#fdf8f3; color:#3a2233; text-align:center; padding:60px 20px;">
  <h1 style="color:#ec5c8d;">${success ? "You're unsubscribed" : 'Something went wrong'}</h1>
  <p>${success ? "You won't get any more marketing emails from HelloQT. Order updates will still be sent." : 'Please use the link from your email, or email helloqts@hotmail.com.'}</p>
</body>
</html>`
}

// Marks an email as unsubscribed, reached by clicking the signed "Unsubscribe"
// link in an email. The signature means only the real recipient can do this.
app.get('/api/unsubscribe', emailLimit, async (req, res) => {
  const email = cleanText(req.query.email, 254).toLowerCase()
  const token = cleanText(req.query.t, 64)

  if (!isValidEmail(email) || !supabaseAdmin || !secretsMatch(token, unsubscribeToken(email) ?? '')) {
    return res.status(400).send(unsubscribePageHtml({ success: false }))
  }

  const { error } = await supabaseAdmin
    .from('subscribers')
    .update({ unsubscribed: true })
    .eq('email', email)

  res.send(unsubscribePageHtml({ success: !error }))
})

/* ------------------------------------------------------------------ */
/* Shipping webhook                                                    */
/* ------------------------------------------------------------------ */

// Called by a Supabase Database Webhook whenever an order row changes;
// sends a shipping email the moment status first flips to "shipped".
// The shared secret header stops anyone else sending fake tracking emails.
app.post('/api/order-webhook', async (req, res) => {
  if (!ORDER_WEBHOOK_SECRET || !secretsMatch(req.headers['x-webhook-secret'] ?? '', ORDER_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { type, table, record, old_record } = req.body

  if (table !== 'orders' || type !== 'UPDATE') {
    return res.json({ skipped: true })
  }

  const justShipped =
    record?.status === 'shipped' && old_record?.status !== 'shipped' && record?.tracking_number

  if (!justShipped) {
    return res.json({ skipped: true })
  }

  if (!resend) {
    return res.status(503).json({ error: 'Email sending is not configured yet.' })
  }

  if (!record.email) {
    console.warn(`[helloqt-server] Order ${record.order_ref} shipped but has no email on file`)
    return res.json({ skipped: true, reason: 'no email on order' })
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: record.email,
      subject: `Your HelloQT order ${record.order_ref} has shipped!`,
      html: shippingEmailHtml({
        orderRef: record.order_ref,
        fullName: record.full_name,
        trackingNumber: record.tracking_number,
      }),
    })
    res.json({ sent: true })
  } catch (error) {
    console.error('[helloqt-server] Shipping email error:', error)
    res.status(500).json({ error: 'Something went wrong sending the shipping email.' })
  }
})

// Starts the Express server for the AI chat backend
app.listen(PORT, () => {
  console.log(`[helloqt-server] AI chat backend running on http://localhost:${PORT}`)
})
