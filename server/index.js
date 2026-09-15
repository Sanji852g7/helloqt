import 'dotenv/config'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { products, collections } from '../src/data/products.js'
import { DISCOUNT_RATE, priceOrder } from '../src/data/pricing.js'
import {
  BACKEND_BASE_URL,
  SITE_BASE_URL,
  WELCOME_CODE,
  mediaUrl,
  orderEmailHtml,
  shippingEmailHtml,
  unsubscribeToken,
  welcomeEmailHtml,
} from './emails.js'
import { MAINTENANCE_EXEMPT_PATHS, isMaintenanceMode, maintenancePageHtml } from './maintenance.js'

const app = express()

const PORT = process.env.PORT || 8787

/**
 * Pauses the whole shop for a bigger change, without touching any code —
 * just the MAINTENANCE_MODE environment variable in Render, flipped on and
 * off as needed. Checked first, before CORS, parsing or rate limiting, so a
 * paused shop does as little work as possible.
 *
 * Stripe's and Supabase's webhooks are exempt on purpose: they are reporting
 * something that has ALREADY happened (a payment went through, an order
 * shipped), so dropping those during maintenance would lose a real
 * customer's order or tracking email, not just show them a "back soon" page.
 */
app.use((req, res, next) => {
  if (!isMaintenanceMode() || MAINTENANCE_EXEMPT_PATHS.includes(req.path)) return next()

  res.status(503)
  if (req.path.startsWith('/api/')) {
    return res.json({ error: 'HelloQT is closed for a quick update, back very soon.' })
  }
  res.send(maintenancePageHtml())
})

// Only the real shop may call the API from a browser, so a copycat site
// cannot quietly use it to place orders or send emails. This only needs to
// guard /api/* — the shop's own JS, CSS and images are public files with
// nothing to protect, and gating them by origin used to break the site
// whenever it was served from anywhere other than the Vite dev port.
// BACKEND_BASE_URL is included because this server now serves the shop
// itself, so legitimate calls arrive from its own address.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
  .concat([
    SITE_BASE_URL,
    BACKEND_BASE_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    `http://localhost:${PORT}`,
  ])

app.use(
  '/api',
  cors({
    // No origin means a server-to-server call (webhooks, curl), which CORS does not guard anyway
    origin: (origin, callback) =>
      !origin || ALLOWED_ORIGINS.includes(origin)
        ? callback(null, true)
        : callback(new Error('Origin not allowed')),
  }),
)
// Small cap so nobody can tie the server up with a giant JSON payload.
// Stripe's webhook is skipped because its signature is checked against the
// exact raw bytes Stripe sent, which parsing would destroy.
const parseJson = express.json({ limit: '100kb' })
app.use((req, res, next) =>
  req.path === '/api/stripe-webhook' ? next() : parseJson(req, res, next),
)

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

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    '\n[helloqt-server] STRIPE_SECRET_KEY is not set. Add it to a .env file to take payments.\n',
  )
}

// Handles card payments. Everything Stripe is told comes from the catalogue,
// never from the browser, so the amount charged is always the real price.
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null

// Proves an incoming payment notification genuinely came from Stripe
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || null

if (stripe && !STRIPE_WEBHOOK_SECRET) {
  console.warn(
    '\n[helloqt-server] STRIPE_WEBHOOK_SECRET is not set. Orders will not be saved after payment until it is.\n',
  )
}

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

/**
 * Sends an email through Resend and actually checks whether it worked.
 *
 * Resend's SDK does not throw on a failed send — it resolves normally with
 * `{ error }` set instead. A plain try/catch around resend.emails.send()
 * never sees that, so a failed send would previously look identical to a
 * successful one and go completely unnoticed. This logs either way and
 * reports back whether the email genuinely went out.
 */
async function sendEmail(label, message) {
  if (!resend) return false
  try {
    const { data, error } = await resend.emails.send(message)
    if (error) {
      console.error(`[helloqt-server] ${label} was rejected by Resend:`, error)
      return false
    }
    console.log(`[helloqt-server] ${label} sent, Resend id ${data?.id}`)
    return true
  } catch (error) {
    // A genuine network/connection failure, not an API-level rejection
    console.error(`[helloqt-server] ${label} failed to send:`, error)
    return false
  }
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
/* Payment and orders                                                  */
/* ------------------------------------------------------------------ */

// Turns pounds into the whole pence Stripe works in
const toStripeAmount = (pounds) => Math.round(pounds * 100)

// Checks, without using it up, whether this email has an unused welcome code
async function discountIsAvailable(email, code) {
  if (!supabaseAdmin) return false
  if (cleanText(code, 40).toUpperCase() !== WELCOME_CODE) return false
  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .select('used')
    .eq('email', email)
    .maybeSingle()
  return Boolean(!error && data && !data.used)
}

/**
 * Starts a card payment.
 *
 * The browser sends only which lashes and how many. Every price, the delivery
 * charge and the discount are worked out here from the real catalogue, and it
 * is those figures that are handed to Stripe — so the amount charged can never
 * be talked down by editing the page.
 *
 * No order is saved yet: the order row is only created once Stripe confirms
 * the money actually arrived.
 */
app.post('/api/create-checkout-session', orderLimit, async (req, res) => {
  const { items: requestedItems, discountCode } = req.body
  const email = cleanText(req.body.email, 254).toLowerCase()
  const fullName = cleanText(req.body.fullName, 100)

  if (!isValidEmail(email)) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (!fullName) return res.status(400).json({ error: 'Enter your full name.' })
  if (!stripe) return res.status(503).json({ error: 'Card payments are not set up yet.' })

  // Logged-in shoppers send their Supabase token; the order is filed against
  // the account that token really belongs to, never an id the browser claims
  const user = await userFromRequest(req)

  const discountApplied = await discountIsAvailable(email, discountCode)
  const priced = priceOrder(requestedItems, { discountApplied })
  if (priced.error) return res.status(400).json({ error: priced.error })

  // The basket is remembered on the payment itself, so the order can be
  // rebuilt from the catalogue again once the payment is confirmed
  const cart = JSON.stringify(priced.items.map((item) => [item.slug, item.quantity]))
  if (cart.length > 480) {
    return res.status(400).json({ error: 'That basket is too large, please order in two goes.' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: priced.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'gbp',
          unit_amount: toStripeAmount(item.price),
          product_data: {
            name: item.name,
            description: `${item.style} lashes`,
            images: [mediaUrl(item.image)],
          },
        },
      })),
      // Delivery is charged separately so the shopper sees it broken out,
      // and so a percentage discount never comes off the postage
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            display_name: priced.shipping === 0 ? 'Free delivery' : 'Royal Mail delivery',
            fixed_amount: { amount: toStripeAmount(priced.shipping), currency: 'gbp' },
          },
        },
      ],
      discounts: discountApplied
        ? [
            {
              coupon: (
                await stripe.coupons.create({
                  percent_off: DISCOUNT_RATE * 100,
                  duration: 'once',
                  name: 'HelloQT welcome 10% off',
                })
              ).id,
            },
          ]
        : undefined,
      metadata: {
        email,
        fullName,
        cart,
        userId: user?.id ?? '',
        discountApplied: discountApplied ? '1' : '0',
      },
      success_url: `${SITE_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_BASE_URL}/checkout?cancelled=1`,
    })

    res.json({ url: session.url })
  } catch (error) {
    console.error('[helloqt-server] Stripe session error:', error)
    res.status(500).json({ error: 'Something went wrong starting your payment.' })
  }
})

// Saves a paid order and emails the confirmation. Only ever called after
// Stripe has confirmed the money arrived.
async function savePaidOrder(session) {
  const { email, fullName, cart, userId, discountApplied } = session.metadata ?? {}
  if (!email || !cart) throw new Error('payment is missing its order details')

  // Already handled? Stripe retries webhooks, and a customer refreshing the
  // success page must never produce a second order
  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('order_ref')
    .eq('stripe_session_id', session.id)
    .maybeSingle()
  if (existing) return existing.order_ref

  const wasDiscounted = discountApplied === '1'
  // Rebuilt from the catalogue again, never from anything the browser sent
  const priced = priceOrder(
    JSON.parse(cart).map(([slug, quantity]) => ({ slug, quantity })),
    { discountApplied: wasDiscounted },
  )
  if (priced.error) throw new Error(priced.error)

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: userId || null,
      email,
      full_name: fullName,
      items: priced.items,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
      stripe_session_id: session.id,
    })
    .select('order_ref')
    .single()

  if (error) throw error
  const orderRef = data.order_ref

  // Now the order exists, the code is genuinely spent
  if (wasDiscounted) {
    await supabaseAdmin
      .from('subscribers')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false)
  }

  // The order and the payment are both already safe, so a failed email here
  // never undoes the checkout — sendEmail logs it either way
  await sendEmail(`Order confirmation for ${orderRef}`, {
    from: FROM_EMAIL,
    to: email,
    subject: `Your HelloQT order ${orderRef} is confirmed`,
    html: orderEmailHtml({ orderRef, fullName, items: priced.items, total: priced.total }),
  })

  console.log(`[helloqt-server] Payment received, saved order ${orderRef}`)
  return orderRef
}

// Stripe calls this the moment a payment succeeds. The signature check means
// nobody else can announce a payment that never happened.
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Payments are not fully set up yet.' })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      STRIPE_WEBHOOK_SECRET,
    )
  } catch (error) {
    console.error('[helloqt-server] Stripe signature check failed:', error.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  if (event.type !== 'checkout.session.completed') return res.json({ ignored: true })

  const session = event.data.object
  if (session.payment_status !== 'paid') return res.json({ ignored: true, reason: 'not paid' })

  try {
    const orderRef = await savePaidOrder(session)
    res.json({ received: true, orderRef })
  } catch (error) {
    console.error('[helloqt-server] Failed to save paid order:', error)
    // A non-2xx tells Stripe to try again, so a paid order is never lost
    res.status(500).json({ error: 'Could not save the order' })
  }
})

// Lets the thank-you page show the order number once the payment lands
app.get('/api/order-by-session', async (req, res) => {
  const sessionId = cleanText(req.query.session_id, 100)
  if (!sessionId || !supabaseAdmin) return res.status(400).json({ error: 'session_id is required' })

  const { data } = await supabaseAdmin
    .from('orders')
    .select('order_ref')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  res.json({ orderRef: data?.order_ref ?? null })
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

      await sendEmail(`Welcome code for ${email}`, {
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

  const sent = await sendEmail(`Shipping notice for ${record.order_ref}`, {
    from: FROM_EMAIL,
    to: record.email,
    subject: `Your HelloQT order ${record.order_ref} has shipped!`,
    html: shippingEmailHtml({
      orderRef: record.order_ref,
      fullName: record.full_name,
      trackingNumber: record.tracking_number,
    }),
  })

  if (!sent) return res.status(502).json({ error: 'Something went wrong sending the shipping email.' })
  res.json({ sent: true })
})

/**
 * Serves the built shop itself, so one Render service is the whole site —
 * no separate frontend host, no cross-origin calls between them. Only kicks
 * in once `npm run build` has produced a dist/ folder (it hasn't in local
 * dev, where Vite's own dev server handles the frontend instead).
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))

  // Any route that isn't an API call is a page in the React app, so let
  // React Router handle it client-side instead of a 404
  app.get(/^(?!\/api\/).*/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
} else {
  console.log('[helloqt-server] No dist/ folder found — run `npm run build` to serve the shop from here.')
}

// Starts the Express server: the API, and the shop itself once built
app.listen(PORT, () => {
  console.log(`[helloqt-server] running on http://localhost:${PORT}`)
})
