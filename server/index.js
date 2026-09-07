import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { products, collections } from '../src/data/products.js'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8787

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
app.post('/api/lash-chat', async (req, res) => {
  const { messages } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
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

// Raw GitHub URLs so email clients can load images before the site has real hosting
const MEDIA_BASE = 'https://raw.githubusercontent.com/Sanji852g7/helloqt/main/public/media'
const LOGO_URL = `${MEDIA_BASE}/helloqtlogo.JPG`

// Builds the order confirmation email's HTML body
function orderEmailHtml({ orderRef, fullName, items, total }) {
  const itemRows = items
    .map((item) => {
      const imageUrl = `${MEDIA_BASE}/${item.image.split('/').pop()}`
      return `
        <tr>
          <td style="padding:10px 0; width:56px;">
            <img src="${imageUrl}" alt="${item.name}" width="48" height="48"
              style="border-radius:8px; object-fit:cover; display:block;" />
          </td>
          <td style="padding:10px 0;">${item.name} × ${item.quantity}</td>
          <td style="padding:10px 0; text-align:right;">£${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    })
    .join('')

  return `
    <div style="font-family:sans-serif; max-width:480px; margin:0 auto; color:#3a2233;">
      <img src="${LOGO_URL}" alt="HelloQT" width="56" height="56"
        style="border-radius:50%; display:block; margin-bottom:12px;" />
      <h1 style="color:#ec5c8d;">Thank you, ${fullName || 'lovely'}! 💕</h1>
      <p>Your order <strong>${orderRef}</strong> is confirmed and will be on its way within 2-3 working days.</p>
      <table style="width:100%; border-collapse:collapse; margin-top:16px;">${itemRows}</table>
      <p style="margin-top:16px; font-weight:bold;">Total: £${Number(total).toFixed(2)}</p>
      <p style="margin-top:24px; font-family:cursive;">xo, Sanji</p>
    </div>
  `
}

// Emails the customer their order confirmation via Resend
app.post('/api/send-order-confirmation', async (req, res) => {
  const { to, orderRef, fullName, items, total } = req.body

  if (!to || !orderRef || !Array.isArray(items) || total == null) {
    return res.status(400).json({ error: 'to, orderRef, items, and total are required' })
  }

  if (!resend) {
    return res.status(503).json({
      error: 'Email sending is not configured yet. Add RESEND_API_KEY to a .env file and restart the server.',
    })
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your HelloQT order ${orderRef} is confirmed`,
      html: orderEmailHtml({ orderRef, fullName, items, total }),
    })
    res.json({ sent: true })
  } catch (error) {
    console.error('[helloqt-server] Resend API error:', error)
    res.status(500).json({ error: 'Something went wrong sending the confirmation email.' })
  }
})

// Starts the Express server for the AI chat backend
app.listen(PORT, () => {
  console.log(`[helloqt-server] AI chat backend running on http://localhost:${PORT}`)
})
