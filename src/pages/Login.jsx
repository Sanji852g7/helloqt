import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginHeartAnimation from '../components/LoginHeartAnimation'
import { EyeIcon, EyeOffIcon } from '../components/Icons'

// Login/signup page toggling between the two modes
export default function Login() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (user && !success) return <Navigate to="/account" replace />

  // Submits the sign-in or sign-up form to Supabase
  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const { data, error: authError } =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, { firstName, surname })

    setSubmitting(false)

    if (authError) {
      setError(authError.message)
      return
    }

    if (mode === 'signup') {
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'account_signup' }),
      }).catch((err) => console.error('[helloqt] failed to subscribe on signup:', err))
    }

    if (data?.session) {
      setSuccess(true)
      window.setTimeout(() => navigate('/account'), 2000)
    } else {
      setInfo('Account created! You can now log in.')
      setMode('signin')
    }
  }

  return (
    <div className="section flex justify-center py-16 sm:py-20">
      <div className="w-full max-w-sm rounded-3xl border border-blush-200 bg-white p-7 text-center shadow-soft sm:p-8">
        {success ? (
          <>
            <LoginHeartAnimation />
            <h1 className="mt-1 font-display text-xl font-bold">Welcome back!</h1>
            <p className="mt-1 text-sm text-plum-600">Taking you to your account…</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold">
              {mode === 'signin' ? 'Log in' : 'Create an account'}
            </h1>
            <p className="mt-1.5 text-sm text-plum-600">
              {mode === 'signin' ? 'Welcome back, QT 💕' : 'Track your orders and check out faster.'}
            </p>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            )}
            {info && (
              <p className="mt-4 rounded-xl bg-blush-50 px-3 py-2 text-sm font-medium text-blush-700">
                {info}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1.5 block text-sm font-semibold text-plum-700"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="field"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="surname"
                      className="mb-1.5 block text-sm font-semibold text-plum-700"
                    >
                      Surname
                    </label>
                    <input
                      id="surname"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="field"
                    />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-plum-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-plum-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
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

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Please wait…' : mode === 'signin' ? 'Log in' : 'Sign up'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError(null)
                setInfo(null)
              }}
              className="mt-5 w-full text-center text-sm font-semibold text-blush-700 transition hover:text-blush-800"
            >
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
