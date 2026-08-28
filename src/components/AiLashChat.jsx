import { useEffect, useRef, useState } from 'react'
import { ChatIcon, CloseIcon, SendIcon } from './Icons'

const GREETING =
  "Hiya, I'm Mini Sanji 💕 Tell me a bit about what you're after (occasion, natural vs glam, everyday vs special) and I'll point you to the right style."

// Floating "Mini Sanji" AI chat widget for lash advice
export default function AiLashChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // Sends the typed message to the AI backend and shows the reply
  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/lash-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? "Couldn't reach the AI chat server. Run it with npm run dev:all."
          : err.message,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blush-600 text-white shadow-lift transition hover:bg-blush-700 active:scale-95"
        aria-label={open ? 'Close Mini Sanji chat' : 'Chat with Mini Sanji'}
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <ChatIcon className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-[1.5rem] border border-blush-200 bg-cream shadow-lift">
          <div className="flex items-center gap-2 border-b border-blush-100 bg-blush-50 px-4 py-3">
            <ChatIcon className="h-4 w-4 text-blush-600" />
            <p className="font-display text-sm font-bold text-plum-800">Mini Sanji</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-blush-100 px-3 py-2 text-sm text-plum-800">
              {GREETING}
            </div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto rounded-br-sm bg-gold-600 text-white'
                    : 'rounded-bl-sm bg-blush-100 text-plum-800'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-blush-100 px-3 py-2 text-sm text-plum-500">
                Thinking…
              </div>
            )}
            {error && (
              <div className="max-w-[95%] rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-blush-100 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about our lashes..."
              className="min-h-[40px] flex-1 rounded-full border border-blush-200 bg-white px-4 text-sm text-plum-800 outline-none focus:border-blush-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-600 text-white transition hover:bg-blush-700 disabled:opacity-40"
              aria-label="Send message"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
