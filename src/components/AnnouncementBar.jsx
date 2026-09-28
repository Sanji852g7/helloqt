const MESSAGES = [
  'Free UK delivery over £40',
  'Cruelty-free',
  'Handmade with love',
  'UK shipping only',
]

function MessageRow({ hideOnReducedMotion = false }) {
  return (
    <div
      className={`flex shrink-0 items-center gap-10 pr-10 ${hideOnReducedMotion ? 'motion-reduce:hidden' : ''}`}
      aria-hidden="true"
    >
      {MESSAGES.map((message) => (
        <span
          key={message}
          className="flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.15em] text-white"
        >
          {message}
          <span className="text-white/50">✦</span>
        </span>
      ))}
    </div>
  )
}

// Slow, continuous scrolling strip of trust signals, sat above the navbar.
// Content is duplicated back to back so the translateX(-50%) loop is seamless;
// the duplicate is hidden for prefers-reduced-motion so it reads as one static line.
export default function AnnouncementBar() {
  return (
    <div
      role="note"
      aria-label={MESSAGES.join(' · ')}
      className="overflow-hidden bg-plum-900 py-2"
    >
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        <MessageRow />
        <MessageRow hideOnReducedMotion />
      </div>
    </div>
  )
}
