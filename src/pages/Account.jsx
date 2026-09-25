import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../context/CartContext'
import { supabase } from '../lib/supabaseClient'
import { BagIcon, CheckIcon, PinIcon, StarIcon, TruckIcon } from '../components/Icons'

// Builds the Royal Mail tracking page URL for a given tracking number
const royalMailTrackingUrl = (trackingNumber) =>
  `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(trackingNumber)}`

// A friendly greeting that matches whatever time it actually is for the visitor
function timeGreeting() {
  const hour = new Date().getHours()
  if (hour < 5) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

const TRACKING_STAGES = [
  { key: 'paid', label: 'Order placed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

// Visual progress tracker for an order's fulfilment status
function OrderTracker({ status }) {
  const currentIndex = Math.max(
    0,
    TRACKING_STAGES.findIndex((stage) => stage.key === status),
  )

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {TRACKING_STAGES.map((stage, i) => (
          <div key={stage.key} className="flex flex-1 items-center last:flex-none">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                i <= currentIndex ? 'bg-blush-600 text-white' : 'bg-blush-100 text-plum-400'
              }`}
            >
              {i < currentIndex ? <CheckIcon className="h-3 w-3" /> : i + 1}
            </span>
            {i < TRACKING_STAGES.length - 1 && (
              <span
                className={`mx-1 h-0.5 flex-1 ${i < currentIndex ? 'bg-blush-600' : 'bg-blush-100'}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 grid grid-cols-4 gap-1">
        {TRACKING_STAGES.map((stage, i) => (
          <span
            key={stage.key}
            className={`text-center text-[10px] font-semibold leading-tight ${
              i <= currentIndex ? 'text-plum-700' : 'text-plum-400'
            }`}
          >
            {stage.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// Circular initials avatar for the account header, matching the style used in chat and reviews
function ProfileAvatar({ fullName, email }) {
  const initials = fullName
    ? fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('')
    : (email?.[0] ?? '?').toUpperCase()

  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blush-600 text-xl font-bold text-white ring-4 ring-blush-100">
      {initials}
    </span>
  )
}

// Order item photo that falls back to a plain icon if the image is missing or fails to load
function OrderItemThumbnail({ src, alt }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blush-200 bg-blush-50 text-blush-400">
        <BagIcon className="h-6 w-6" />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width="56"
      height="56"
      onError={() => setFailed(true)}
      className="h-14 w-14 shrink-0 rounded-xl border border-blush-200 bg-white object-cover"
    />
  )
}

// Takes a delivered order straight to its review page, fetching the same
// signed token the "please review" email would have carried
function ReviewButton({ orderRef }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: session } = await supabase.auth.getSession()
      const accessToken = session?.session?.access_token
      const res = await fetch(`/api/my-orders/${encodeURIComponent(orderRef)}/review-token`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      navigate(`/review/${encodeURIComponent(orderRef)}?t=${data.token}`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-2 text-sm font-semibold text-gold-700 transition hover:bg-gold-200"
      >
        <StarIcon className="h-4 w-4" />
        {loading ? 'One sec…' : 'Leave a review'}
      </button>
      {error && <p className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}
    </div>
  )
}

// Account page showing the logged-in user's details and orders
export default function Account() {
  const { user, loading, signOut } = useAuth()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

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

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  // Older accounts made before sign-up asked for a name won't have one set
  const fullName = [user.user_metadata?.first_name, user.user_metadata?.surname]
    .filter(Boolean)
    .join(' ')

  // The newest order that actually has an address on file, used as the
  // "saved" one — orders are already sorted newest first
  const savedAddress = orders.find((order) => order.address1)

  return (
    <div className="section py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Your account</h1>
      <div className="mt-5 flex items-center gap-4">
        <ProfileAvatar fullName={fullName} email={user.email} />
        <div>
          <p className="text-lg font-semibold text-plum-800">
            {timeGreeting()}
            {user.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''} 💕
          </p>
          <p className="text-plum-600">{user.email}</p>
        </div>
      </div>

      {savedAddress && (
        <div className="mt-8 rounded-3xl border border-blush-200 bg-white p-7 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <PinIcon className="h-5 w-5 text-blush-500" />
            Delivery address
          </h2>
          <p className="mt-1 text-sm text-plum-500">
            From your last order - we'll suggest this one at checkout.
          </p>
          <address className="mt-3 text-sm not-italic leading-relaxed text-plum-700">
            {savedAddress.full_name}
            <br />
            {savedAddress.address1}
            <br />
            {savedAddress.address2 && (
              <>
                {savedAddress.address2}
                <br />
              </>
            )}
            {savedAddress.city}
            <br />
            {savedAddress.postcode}
          </address>
        </div>
      )}

      <div className="mt-8 rounded-3xl border border-blush-200 bg-white p-7 shadow-soft">
        <h2 className="font-display text-xl font-bold">Your orders</h2>

        {ordersLoading ? (
          <p className="mt-2 text-sm text-plum-600">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <p className="mt-2 text-sm text-plum-600">
            No orders yet.{' '}
            <Link to="/shop" className="font-semibold text-blush-700 hover:text-blush-800">
              Go find your lash
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-blush-200">
            {orders.map((order) => (
              <li key={order.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-plum-800">{order.order_ref}</p>
                  <p className="text-sm text-plum-500">
                    Order placed on{' '}
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <OrderTracker status={order.status} />

                {order.tracking_number && (
                  <a
                    href={royalMailTrackingUrl(order.tracking_number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-blush-50 px-4 py-2 text-sm font-semibold text-blush-700 transition hover:bg-blush-100"
                  >
                    <TruckIcon className="h-4 w-4" />
                    Track with Royal Mail · {order.tracking_number}
                  </a>
                )}

                {order.status === 'delivered' && <ReviewButton orderRef={order.order_ref} />}

                <ul className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <li key={item.slug} className="flex items-center gap-3">
                      <OrderItemThumbnail src={item.image} alt={`${item.name} lashes`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-plum-800">{item.name}</p>
                        <p className="text-sm text-plum-500">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-plum-700">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-sm font-semibold text-plum-800">
                  Total: {formatPrice(order.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" onClick={signOut} className="btn-secondary mt-6">
        Log out
      </button>
    </div>
  )
}
