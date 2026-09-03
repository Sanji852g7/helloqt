import { useEffect, useRef } from 'react'

const HEART_PATH =
  'M32 50C18 40 6 29 6 17.5C6 9 12.5 3 20.5 3C25.5 3 30 6 32 11C34 6 38.5 3 43.5 3C51.5 3 58 9 58 17.5C58 29 46 40 32 50Z'

const CONFETTI_COLORS = ['#D9A441', '#EC5C8D', '#F2A1C2', '#4A2B3F']
const CONFETTI_EMOJI = ['🎉', '💕', '✨']

// Little hand-drawn heart, confetti burst, and stitch line played on login success
export default function LoginHeartAnimation() {
  const pathRef = useRef(null)
  const fillRef = useRef(null)
  const wrapRef = useRef(null)
  const stitchRef = useRef(null)
  const sparkleHostRef = useRef(null)

  useEffect(() => {
    const path = pathRef.current
    const stitch = stitchRef.current
    if (path) {
      const length = path.getTotalLength()
      path.style.setProperty('--path-length', length)
      path.style.strokeDasharray = length
      path.classList.add('heart-draw-path')
    }
    if (stitch) {
      const length = stitch.getTotalLength()
      stitch.style.setProperty('--stitch-length', length)
      stitch.style.strokeDasharray = `${length}`
    }

    const fillTimer = window.setTimeout(() => {
      fillRef.current?.classList.add('heart-fill-path')
      wrapRef.current?.classList.add('heart-pop-settle')
      stitchRef.current?.classList.add('stitch-draw-line')
      spawnConfetti(sparkleHostRef.current)
    }, 700)

    return () => window.clearTimeout(fillTimer)
  }, [])

  return (
    <div className="relative flex flex-col items-center py-2" ref={sparkleHostRef}>
      <div ref={wrapRef} className="relative h-14 w-16">
        <svg viewBox="0 0 64 56" className="absolute inset-0 h-full w-full overflow-visible">
          <path
            ref={pathRef}
            d={HEART_PATH}
            fill="none"
            stroke="#EC5C8D"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path ref={fillRef} d={HEART_PATH} fill="#EC5C8D" className="opacity-0" />
        </svg>
      </div>

      <svg viewBox="0 0 140 10" className="mt-1 h-2.5 w-36 overflow-visible">
        <line
          ref={stitchRef}
          x1="2"
          y1="5"
          x2="138"
          y2="5"
          stroke="#D9A441"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="0.5 10"
        />
      </svg>
    </div>
  )
}

// Scatters a big burst of confetti across the whole screen from the heart
function spawnConfetti(host) {
  if (!host) return
  const rect = host.getBoundingClientRect()
  const originX = rect.left + rect.width / 2
  const originY = rect.top + rect.height / 2 - 8

  for (let i = 0; i < 28; i += 1) {
    const el = document.createElement('div')
    el.className = 'pointer-events-none fixed left-0 top-0 z-[9999]'
    el.style.marginLeft = `${originX}px`
    el.style.marginTop = `${originY}px`
    // Start fully hidden so there is no flash before the burst actually plays
    el.style.opacity = '0'
    el.style.transform = 'translate(-50%, -50%) scale(0)'

    const isEmoji = i % 4 === 3
    if (isEmoji) {
      el.textContent = CONFETTI_EMOJI[i % CONFETTI_EMOJI.length]
      el.style.fontSize = `${16 + Math.random() * 8}px`
    } else {
      const isCircle = Math.random() > 0.5
      const size = 6 + Math.random() * 6
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      el.style.width = `${size}px`
      el.style.height = `${size}px`
      el.style.background = color
      el.style.borderRadius = isCircle ? '50%' : '2px'
    }

    // Launch mostly upward and outward, like a real confetti pop, then let gravity pull it back down
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15
    const dist = 110 + Math.random() * 200
    const gravityDrop = 60 + Math.random() * 90
    el.style.setProperty('--sx', `${Math.cos(angle) * dist}px`)
    el.style.setProperty('--sy-peak', `${Math.sin(angle) * dist}px`)
    el.style.setProperty('--sy-end', `${Math.sin(angle) * dist + gravityDrop}px`)
    el.style.setProperty('--srot', `${(Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 60)}deg`)
    el.style.animationDelay = '0s'

    document.body.appendChild(el)

    // Force a paint of the hidden state, then start the animation next frame
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        el.style.opacity = ''
        el.style.transform = ''
        el.classList.add('sparkle-scatter')
      })
    })

    window.setTimeout(() => el.remove(), 1600)
  }
}
