import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { CloseIcon } from './Icons'

const DISMISSED_KEY = 'helloqt-discount-popup-dismissed'
const CLAIMED_KEY = 'helloqt-discount-claimed'

// Popup offering 10% off first order in exchange for an email. Closing it
// only stops the auto-popup - a small tab stays on screen so a shopper who
// wasn't ready yet can still get to it later, unless they've already
// claimed a code or aren't eligible for one
export default function DiscountPopup() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [tabHidden, setTabHidden] = useState(() => !!localStorage.getItem(CLAIMED_KEY))
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (tabHidden) return

    let cancelled = false
    let timer

    // A logged-in shopper who's already spent their code should never see
    // this again, even on a browser that hasn't dismissed it before
    const checkEligible = async () => {
      if (!user) return true
      try {
        const { data: session } = await supabase.auth.getSession()
        const accessToken = session?.session?.access_token
        const res = await fetch('/api/my-discount-status', {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        })
        const data = await res.json()
        return !data.usedOrNotEligible
      } catch {
        // If the check fails, fall back to treating them as eligible
        return true
      }
    }

    checkEligible().then((eligible) => {
      if (cancelled) return
      if (!eligible) {
        localStorage.setItem(CLAIMED_KEY, 'true')
        setTabHidden(true)
        return
      }
      if (!localStorage.getItem(DISMISSED_KEY)) {
        timer = window.setTimeout(() => setOpen(true), 4000)
      }
    })

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [user, tabHidden])

  // Closes the popup but keeps the side tab around to reopen it later
  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setOpen(false)
  }

  // Submits the email to get a 10% off code sent by email
  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('submitting')
    setError(null)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'popup' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      localStorage.setItem(DISMISSED_KEY, 'true')
      localStorage.setItem(CLAIMED_KEY, 'true')
      // Always the same reply, so the popup cannot be used to test whether an
      // email already shops here
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      setError(err.message)
    }
  }

  return (
    <>
      {!open && !tabHidden && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ writingMode: 'vertical-rl' }}
          className="fixed left-0 top-1/2 z-40 -translate-y-1/2 rounded-r-2xl bg-blush-500 px-2 py-4 text-sm font-bold tracking-wide text-white shadow-lift transition hover:bg-blush-600"
        >
          10% off ✦ join us
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-plum-900/40 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-[1.75rem] bg-cream p-7 text-center shadow-lift sm:p-8">
            <button
              type="button"
              onClick={dismiss}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-blush-100 text-plum-700 transition hover:bg-blush-200"
              aria-label="Close"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            {status === 'sent' ? (
              <>
                <h2 className="mt-2 font-display text-2xl font-bold">You're in! 💕</h2>
                <p className="mt-3 text-sm leading-relaxed text-plum-600">
                  Check your inbox, your 10% off code is on its way.
                </p>
                <button type="button" onClick={dismiss} className="btn-primary mt-6">
                  Continue shopping
                </button>
              </>
            ) : (
              <>
                <h2 className="mt-2 font-display text-2xl font-bold">10% off your first order</h2>
                <p className="mt-2 text-sm leading-relaxed text-plum-600">
                  Join the HelloQT newsletter for your code, plus first access to new drops and
                  restocks.
                </p>

                {error && (
                  <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                    {error}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field"
                    aria-label="Email address"
                  />
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-primary w-full"
                  >
                    {status === 'submitting' ? 'Sending…' : 'Send my code'}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-4 text-sm font-semibold text-plum-500 underline"
                >
                  No thanks
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
