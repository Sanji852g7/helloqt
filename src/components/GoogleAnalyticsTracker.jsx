import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { gaPageView } from '../lib/googleAnalytics'

// Reports a Google Analytics page view on every route change - runs after
// DocumentTitle so the title GA records matches the page just navigated to
export default function GoogleAnalyticsTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    gaPageView(pathname, document.title)
  }, [pathname])

  return null
}
