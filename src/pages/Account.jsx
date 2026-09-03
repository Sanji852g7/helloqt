import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Account page showing the logged-in user's details
export default function Account() {
  const { user, loading, signOut } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="section py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Your account</h1>
      <p className="mt-2 text-plum-600">{user.email}</p>

      <div className="mt-8 rounded-3xl border border-blush-200 bg-white p-7 shadow-soft">
        <h2 className="font-display text-xl font-bold">Your orders</h2>
        <p className="mt-2 text-sm text-plum-600">
          Order history is coming soon, this is where past orders will appear.
        </p>
      </div>

      <button type="button" onClick={signOut} className="btn-secondary mt-6">
        Log out
      </button>
    </div>
  )
}
