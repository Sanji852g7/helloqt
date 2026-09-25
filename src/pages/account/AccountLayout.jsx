import { useEffect, useState } from 'react'
import { Navigate, Outlet, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { toTitleCase } from '../../lib/text'
import { ProfileAvatar, timeGreeting } from './shared'

// Shared shell for every /account/* page: checks the customer is logged in,
// loads their orders and profile once, and shows the same identity header
// (avatar, greeting, email) everywhere so it's always clear whose account
// this is, no matter which section they're looking at
export default function AccountLayout() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileReloadKey, setProfileReloadKey] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('[helloqt] failed to load orders:', error.message)
        setOrders(data ?? [])
        setOrdersLoading(false)
      })
  }, [user])

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('[helloqt] failed to load profile:', error.message)
        setProfile(data ?? null)
      })
  }, [user, profileReloadKey])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  // Older accounts made before sign-up asked for a name won't have one set
  const fullName = [user.user_metadata?.first_name, user.user_metadata?.surname]
    .filter(Boolean)
    .map(toTitleCase)
    .join(' ')

  // The greeting prefers a nickname, but falls back to their first name
  const greetingName =
    user.user_metadata?.nickname ||
    (user.user_metadata?.first_name ? toTitleCase(user.user_metadata.first_name) : '')

  return (
    <div className="section py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Your account</h1>
      <div className="mt-5 flex items-center gap-4">
        <ProfileAvatar fullName={fullName} email={user.email} />
        <div>
          <p className="text-lg font-semibold text-plum-800">
            {timeGreeting()}
            {greetingName ? `, ${greetingName}` : ''} 💕
          </p>
          <p className="text-plum-600">{user.email}</p>
        </div>
      </div>

      <div className="mt-8">
        <Outlet
          context={{
            user,
            orders,
            ordersLoading,
            profile,
            refreshProfile: () => setProfileReloadKey((k) => k + 1),
          }}
        />
      </div>
    </div>
  )
}

// Typed accessor so each account sub-page doesn't have to know the context shape
export function useAccountData() {
  return useOutletContext()
}
