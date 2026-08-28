// Small hand-drawn accents echoing the HelloQT logo (gold ring, plum heart-stem, blush wash)
// so the site reads as made-by-hand rather than templated.

// Wavy hand-drawn line used under headings
export const Squiggle = ({ className = '' }) => (
  <svg
    viewBox="0 0 220 18"
    className={className}
    aria-hidden="true"
    preserveAspectRatio="none"
  >
    <path
      d="M2 12c14-14 28 4 42-4s28 12 42 4 28-12 42-4 28 12 42 4 28-10 42-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
)

// Little heart-topped stem doodle for the letter section
export const HeartStem = ({ className = '' }) => (
  <svg viewBox="0 0 40 90" className={className} aria-hidden="true">
    <path
      d="M20 88V30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M20 30c0-7-6-11-11-8-4 2.4-4.4 8 1 11 3.4 2 7-.6 10-3Z"
      fill="currentColor"
    />
    <path
      d="M20 46c0-7-6.5-11.5-11.6-8.3-4.4 2.7-4.6 8.6 1 11.7 3.6 2 7.4-.7 10.6-3.4Z"
      fill="currentColor"
    />
    <path
      d="M20 62c0-7-6.5-11.5-11.6-8.3-4.4 2.7-4.6 8.6 1 11.7 3.6 2 7.4-.7 10.6-3.4Z"
      fill="currentColor"
    />
    <circle cx="20" cy="78" r="2.4" fill="currentColor" />
    <circle cx="27" cy="83" r="1.6" fill="currentColor" />
  </svg>
)

// Scalloped-edge divider shape between sections (currently unused)
export const ScallopDivider = ({ className = '', flip = false }) => (
  <svg
    viewBox="0 0 200 12"
    className={className}
    aria-hidden="true"
    preserveAspectRatio="none"
    style={flip ? { transform: 'scaleY(-1)' } : undefined}
  >
    <path
      d="M0 0c8 12 17 12 25 0s17-12 25 0 17 12 25 0 17-12 25 0 17 12 25 0 17-12 25 0 17 12 25 0 17-12 25 0v12H0Z"
      fill="currentColor"
    />
  </svg>
)

// Decorative washi-tape strip for photo corners
export const TapeStrip = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none block h-7 w-20 -rotate-3 border border-white/40 bg-gold-200/70 shadow-sm ${className}`}
    style={{
      clipPath: 'polygon(4% 0, 100% 2%, 96% 100%, 0 98%)',
    }}
  />
)

// Dashed stitch-style underline accent
export const StitchUnderline = ({ className = '' }) => (
  <svg
    viewBox="0 0 160 10"
    className={className}
    aria-hidden="true"
    preserveAspectRatio="none"
  >
    <line
      x1="2"
      y1="5"
      x2="158"
      y2="5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray="0.5 11"
    />
  </svg>
)
