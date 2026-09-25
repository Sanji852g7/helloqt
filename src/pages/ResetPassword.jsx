import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { EyeIcon, EyeOffIcon } from '../components/Icons'

// Page a customer lands on after clicking the emailed reset link, to set a
// new password. Supabase turns that link into a real (short-lived) session
// on load, which is what lets updatePassword below actually work.
export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [checkingLink, setCheckingLink] = useState(true)
  const [linkValid, setLinkValid] = useState(false)
  const [linkErrorMessage, setLinkErrorMessage] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Supabase reports an already-used or genuinely expired link this way,
    // as a query param or in the hash depending on the flow — surface its
    // real reason instead of a generic message when it does
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const description =
      params.get('error_description') || hashParams.get('error_description')
    if (description) {
      setLinkErrorMessage(description.replace(/\+/g, ' '))
      setCheckingLink(false)
      return
    }

    let settled = false

    // Turning the emailed link into a real session happens asynchronously
    // (Supabase exchanges a code in the URL after the page has already
    // loaded), so a single getSession() call right away can easily lose that
    // race and wrongly report the link as invalid. Listening for the auth
    // event it fires once that exchange completes is the reliable way to
    // catch it, whichever flow the link uses.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        settled = true
        setLinkValid(true)
        setCheckingLink(false)
      }
    })

    // Covers the case where the session was already established by the time
    // this component mounted, so no new event is going to fire
    supabase.auth.getSession().then(({ data }) => {
      if (settled) return
      if (data.session) {
        settled = true
        setLinkValid(true)
        setCheckingLink(false)
      }
    })

    // Give the exchange a few seconds before giving up and calling the link
    // expired, rather than failing the instant the first check comes back empty
    const timeout = window.setTimeout(() => {
      if (!settled) setCheckingLink(false)
    }, 4000)

    return () => {
      listener.subscription.unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Your password needs to be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Those passwords do not match.')
      return
    }

    setSubmitting(true)
    const { error: updateError } = await updatePassword(password)
    setSubmitting(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    window.setTimeout(() => navigate('/account'), 2000)
  }

  return (
    <div className="section flex justify-center py-16 sm:py-20">
      <div className="w-full max-w-sm rounded-3xl border border-blush-200 bg-white p-7 text-center shadow-soft sm:p-8">
        {checkingLink ? (
          <p className="text-sm text-plum-600">Checking your link…</p>
        ) : !linkValid ? (
          <>
            <h1 className="font-display text-2xl font-bold">Link expired</h1>
            <p className="mt-2 text-sm text-plum-600">
              {linkErrorMessage ||
                'This reset link is no longer valid - links only work once and expire after a while. Request a new one from the login page.'}
            </p>
            <Link to="/login" className="btn-primary mt-6 inline-flex">
              Back to log in
            </Link>
          </>
        ) : done ? (
          <>
            <h1 className="font-display text-2xl font-bold">Password updated! 💕</h1>
            <p className="mt-2 text-sm text-plum-600">Taking you to your account…</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold">Set a new password</h1>
            <p className="mt-1.5 text-sm text-plum-600">Choose something you'll remember.</p>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-sm font-semibold text-plum-700"
                >
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-plum-400 transition hover:text-plum-600"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="mb-1.5 block text-sm font-semibold text-plum-700"
                >
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="field pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showConfirmPassword}
                    className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-plum-400 transition hover:text-plum-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
