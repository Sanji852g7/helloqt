import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pinterestPageVisit } from '../lib/pinterest'

// Reports a Pinterest page visit on every route change - Pinterest's own
// base tag only ever fires once on its own, for the very first page load
export default function PinterestPageTracker() {
  const { pathname } = useLocation()

  useEffect(() => {
    pinterestPageVisit()
  }, [pathname])

  return null
}
