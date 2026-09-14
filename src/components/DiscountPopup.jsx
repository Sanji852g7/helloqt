import { useEffect, useState } from 'react'
import { CloseIcon } from './Icons'

const DISMISSED_KEY = 'helloqt-discount-popup-dismissed'

// Popup offering 10% off first order in exchange for an email
export default function DiscountPopup() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return
    const timer = window.setTimeout(() => setOpen(true), 4000)
    return () => window.clearTimeout(timer)
  }, [])

  // Closes the popup and remembers not to show it again
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
      // Always the same reply, so the popup cannot be used to test whether an
      // email already shops here
      setStatus('sent')
    } catch (err) {
      setStatus('idle')
      setError(err.message)
    }
  }

  if (!open) return null

  return (
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
              Pop your email below and we'll send your code straight over.
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
  )
}
