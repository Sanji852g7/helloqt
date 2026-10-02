// Google Analytics (GA4), loaded lazily and only once a Measurement ID is
// actually configured - so the site works exactly as before until
// VITE_GA_MEASUREMENT_ID is set.
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID

let loaded = false

// Injects Google's own gtag.js script the first time it's needed
function ensureLoaded() {
  if (loaded || !MEASUREMENT_ID) return
  loaded = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function () {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  // Page views are sent manually on each route change instead (see
  // GoogleAnalyticsTracker), so a single-page app doesn't log every route
  // as the same first page load
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)
}

// Reports a page view - call on first load and on every in-app route change
export function gaPageView(path, title) {
  if (!MEASUREMENT_ID) return
  ensureLoaded()
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  })
}
