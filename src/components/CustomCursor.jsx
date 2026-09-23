import { useEffect, useRef } from 'react'

// Replaces the system cursor with a pink pointer — a pink hand over
// clickable things, a pink I-beam over text fields — with small hearts
// blinking around it. Self-hosted (drawn inline, no third-party asset to
// break or slow the page down) and skipped entirely on touch devices.
const HEARTS = [
  { dx: 18, dy: -4, size: 9, delay: '0s' },
  { dx: 24, dy: 14, size: 7, delay: '0.5s' },
  { dx: 8, dy: 22, size: 6, delay: '1s' },
]

const CLICKABLE_SELECTOR = 'a, button, [role="button"], summary, select'
const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"]'

// The cursor's own pink, as perceived brightness (0-1) — used to decide
// whether pink or white will actually stand out against a given background
const CURSOR_LUMINANCE = 0.46

// Walks up from the hovered element to find the nearest solid background
// colour behind it (skipping transparent ancestors), so a pink icon sat on
// a transparent wrapper over a pink button is still detected correctly
function nearestBackground(el) {
  let node = el
  while (node && node !== document.documentElement) {
    const bg = getComputedStyle(node).backgroundColor
    const match = bg.match(/rgba?\(([\d.]+), ?([\d.]+), ?([\d.]+)(?:, ?([\d.]+))?\)/)
    if (match) {
      const [, r, g, b, a = '1'] = match
      if (Number(a) > 0.5) return [Number(r), Number(g), Number(b)]
    }
    node = node.parentElement
  }
  return [255, 255, 255]
}

// True if white would stand out against this background better than the
// cursor's own pink does — e.g. a pink button under a pink cursor
function needsWhiteCursor(el) {
  const [r, g, b] = nearestBackground(el)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return Math.abs(luminance - 1) > Math.abs(luminance - CURSOR_LUMINANCE)
}

export default function CustomCursor() {
  const groupRef = useRef(null)
  const handRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    document.body.classList.add('custom-cursor-active')

    const handleMove = (event) => {
      const el = groupRef.current
      if (!el) return
      el.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`
      el.style.opacity = '1'
      if (handRef.current) {
        const clickableEl = event.target?.closest?.(CLICKABLE_SELECTOR)
        const isText = Boolean(event.target?.closest?.(TEXT_SELECTOR))
        handRef.current.classList.toggle('is-hand', Boolean(clickableEl))
        handRef.current.classList.toggle('is-text', isText)
        handRef.current.classList.toggle('on-dark', Boolean(clickableEl && needsWhiteCursor(clickableEl)))
      }
    }
    const handleLeave = () => {
      const el = groupRef.current
      if (el) el.style.opacity = '0'
    }

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseleave', handleLeave)

    return () => {
      document.body.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div ref={groupRef} className="custom-cursor-hearts" aria-hidden="true" style={{ opacity: 0 }}>
      <div ref={handRef} className="custom-cursor-arrow">
        <svg viewBox="0 0 24 24" className="custom-cursor-arrow-shape">
          <path d="M4 2 4 20 8.5 16 11 22 13.5 21 11 15 17 15Z" fill="#DB3F7D" />
        </svg>
        {/* Solid version of Font Awesome Free's "hand-pointer" glyph (CC BY
            4.0 — fontawesome.com) — the finger-crease detail lines from the
            original are dropped so it reads as one clean pink silhouette */}
        <svg viewBox="0 0 448 512" className="custom-cursor-hand-shape" fill="#DB3F7D">
          <path d="M128 40c0-22.1 17.9-40 40-40s40 17.9 40 40l0 148.2c8.5-7.6 19.7-12.2 32-12.2c20.6 0 38.2 13 45 31.2c8.8-9.3 21.2-15.2 35-15.2c25.3 0 46 19.5 47.9 44.3c8.5-7.7 19.8-12.3 32.1-12.3c26.5 0 48 21.5 48 48l0 48 0 16 0 48c0 70.7-57.3 128-128 128l-16 0-64 0-.1 0-5.2 0c-5 0-9.9-.3-14.7-1c-55.3-5.6-106.2-34-140-79L8 336c-13.3-17.7-9.7-42.7 8-56s42.7-9.7 56 8l56 74.7L128 40Z" />
        </svg>
        {/* Classic serif I-beam shape, for text fields */}
        <svg viewBox="0 0 24 24" className="custom-cursor-text-shape" fill="#DB3F7D">
          <path d="M8 2h8v2.5h-2.75v15h2.75V22H8v-2.5h2.75v-15H8V2Z" />
        </svg>
      </div>
      {HEARTS.map((heart, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="#F0669C"
          className="custom-cursor-heart"
          style={{
            left: heart.dx,
            top: heart.dy,
            width: heart.size,
            height: heart.size,
            animationDelay: heart.delay,
          }}
        >
          <path d="M12 21s-7.5-4.6-10-9.3C.5 8.4 2.3 5 5.8 5c2 0 3.4 1 4.2 2.4C10.8 6 12.2 5 14.2 5c3.5 0 5.3 3.4 3.8 6.7C19.5 16.4 12 21 12 21Z" />
        </svg>
      ))}
    </div>
  )
}
