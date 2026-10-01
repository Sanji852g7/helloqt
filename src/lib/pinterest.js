// Pinterest's conversion tag, loaded lazily and only once a Tag ID is
// actually configured - so the site works exactly as before until
// VITE_PINTEREST_TAG_ID is set, instead of shipping a half-wired tracker.
const TAG_ID = import.meta.env.VITE_PINTEREST_TAG_ID

let loaded = false

// Injects Pinterest's own base script the first time it's needed. This is
// their standard snippet, just written out instead of pasted as a <script>.
function ensureLoaded() {
  if (loaded || !TAG_ID) return
  loaded = true

  window.pintrk = function () {
    window.pintrk.queue.push(Array.prototype.slice.call(arguments))
  }
  window.pintrk.queue = []
  window.pintrk.version = '3.0'

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://s.pinimg.com/ct/core.js'
  document.head.appendChild(script)

  window.pintrk('load', TAG_ID)
}

// Reports a page view - call on first load and on every in-app route
// change, since a single-page app only ever triggers Pinterest's own
// initial load once.
export function pinterestPageVisit() {
  if (!TAG_ID) return
  ensureLoaded()
  window.pintrk('page')
}

// Reports a standard Pinterest event (e.g. 'AddToCart', 'Checkout') with its
// matching parameters, used to measure how Pinterest ads turn into sales.
// Pass the same `event_id` used for the matching server-side Conversions
// API call so Pinterest can dedupe the two into a single conversion.
export function pinterestTrack(event, params) {
  if (!TAG_ID) return
  ensureLoaded()
  window.pintrk('track', event, params)
}
