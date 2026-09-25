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
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLinkValid(Boolean(data.session))
      setCheckingLink(false)
    })
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
              This reset link is no longer valid - links only work once and expire after a
              while. Request a new one from the login page.
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
