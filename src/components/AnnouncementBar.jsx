import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// How long each message stays up, and how long the fade between them takes
const ROTATE_MS = 4500
const FADE_MS = 300

const MESSAGES = [
  { text: '🎀 HelloQT is officially back - shop the relaunch now', to: '/shop' },
  { text: '✨ Find your perfect lash with Mini Sanji Chatbot', openChat: true },
  { text: '💗 Track your lash wears with QT Collection', to: '/account/collection' },
]

// Rotating promo strip above the navbar. Cycles through MESSAGES on a timer
// with a short fade, pausing while a visitor is hovering or has it focused
// so it never changes mid-read. Each message is a single clickable link/
// button for its own destination - the chatbot one opens the existing Mini
// Sanji widget via a custom event rather than navigating, since that widget
// is mounted globally and already has its own open/closed state.
export default function AnnouncementBar() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const rotate = window.setInterval(() => {
      setVisible(false)
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length)
        setVisible(true)
      }, FADE_MS)
    }, ROTATE_MS)
    return () => window.clearInterval(rotate)
  }, [paused])

  const message = MESSAGES[index]

  // No longer truncated to one line - on a narrow phone these messages can
  // run to two lines, so the text wraps and the banner grows to fit instead
  // of cutting words off
  const textClassName = `block px-10 text-center text-[11px] font-bold uppercase leading-snug tracking-[0.15em] text-white transition-opacity motion-reduce:transition-none ${
    visible ? 'opacity-100 duration-300' : 'opacity-0 duration-0'
  }`

  return (
    <div
      className="overflow-hidden bg-plum-900 py-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {message.openChat ? (
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event('open-mini-sanji'))}
          className="block w-full"
        >
          <span className={textClassName}>{message.text}</span>
        </button>
      ) : (
        <Link to={message.to} className="block w-full">
          <span className={textClassName}>{message.text}</span>
        </Link>
      )}
    </div>
  )
}
