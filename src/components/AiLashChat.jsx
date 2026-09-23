import { useEffect, useRef, useState } from 'react'
import { ChatIcon, CloseIcon, SendIcon } from './Icons'

const GREETING =
  "Hello QT! I'm Mini Sanji 👋💕\nThink of me as the AI version of Sanji, the founder, and your lash bestie. Ask me about our lashes, QT sets, lash care, delivery, returns, or anything else you'd like to know! ✨"

// Circular profile photo shown beside Mini Sanji's messages
function SanjiAvatar() {
  return (
    <img
      src="/media/me.JPG"
      alt="Sanji"
      width="28"
      height="28"
      className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-white"
    />
  )
}

// Circular "QT" initials shown beside the customer's own messages
function CustomerAvatar() {
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-plum-700 text-[10px] font-bold text-white ring-2 ring-white"
      aria-hidden="true"
    >
      QT
    </div>
  )
}

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
        className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blush-600 text-white shadow-lift transition hover:bg-blush-700 active:scale-95 sm:bottom-5 sm:right-5 sm:h-14 sm:w-14"
        aria-label={open ? 'Close Mini Sanji chat' : 'Chat with Mini Sanji'}
      >
        {open ? (
          <CloseIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <ChatIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[1.5rem] border border-blush-200 bg-cream shadow-lift sm:bottom-24 sm:right-5 sm:max-w-[calc(100vw-2.5rem)]">
          <div className="flex items-center gap-2 border-b border-blush-100 bg-blush-50 px-4 py-3">
            <ChatIcon className="h-4 w-4 text-blush-600" />
            <p className="font-display text-sm font-bold text-plum-800">Mini Sanji</p>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            <div className="flex items-end gap-2">
              <SanjiAvatar />
              <img
                src="/media/sanjiwave.png"
                alt="Sanji waving hello"
                width="112"
                height="112"
                className="h-24 w-24 animate-sway object-contain"
              />
            </div>
            <div className="flex items-end gap-2">
              <SanjiAvatar />
              <div className="max-w-[75%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-blush-100 px-3 py-2 text-sm text-plum-800">
                {GREETING}
              </div>
            </div>
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="flex items-end justify-end gap-2">
                  <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-gold-600 px-3 py-2 text-sm leading-relaxed text-white">
                    {m.content}
                  </div>
                  <CustomerAvatar />
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2">
                  <SanjiAvatar />
                  <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-blush-100 px-3 py-2 text-sm leading-relaxed text-plum-800">
                    {m.content}
                  </div>
                </div>
              ),
            )}
            {loading && (
              <div className="flex items-end gap-2">
                <SanjiAvatar />
                <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-blush-100 px-3 py-2 text-sm text-plum-500">
                  Thinking…
                </div>
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
