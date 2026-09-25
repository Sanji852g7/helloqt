import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

// Tracks the logged-in Supabase user across the app
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      loading,
      // Creates a new account with email and password, plus a real name so
      // reviews and order records show more than just an email address
      signUp: (email, password, { firstName, surname } = {}) =>
        supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName, surname } },
        }),
      // Logs an existing user in with email and password
      signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
      // Logs the current user out
      signOut: () => supabase.auth.signOut(),
      // Emails a one-time link that lets a user set a new password
      resetPasswordForEmail: (email) =>
        supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      // Sets a new password once the user has followed that emailed link
      updatePassword: (password) => supabase.auth.updateUser({ password }),
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Gives components access to the shared auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
