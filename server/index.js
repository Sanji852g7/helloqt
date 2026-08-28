import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
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

// Starts the Express server for the AI chat backend
app.listen(PORT, () => {
  console.log(`[helloqt-server] AI chat backend running on http://localhost:${PORT}`)
})
