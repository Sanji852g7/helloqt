import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../context/CartContext'
import { supabase } from '../lib/supabaseClient'
import { toTitleCase } from '../lib/text'
import { BagIcon, CheckIcon, EditIcon, PinIcon, StarIcon, TruckIcon } from '../components/Icons'

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

// Starting values for the edit form: whatever's already saved, falling back
// to the account's own name and the last order that had an address on file
function addressDefaults(user, profile, fallbackOrder) {
  return {
    firstName: user.user_metadata?.first_name ? toTitleCase(user.user_metadata.first_name) : '',
    surname: user.user_metadata?.surname ? toTitleCase(user.user_metadata.surname) : '',
    nickname: user.user_metadata?.nickname ?? '',
    phone: profile?.phone ?? fallbackOrder?.phone ?? '',
    address1: profile?.address1 ?? fallbackOrder?.address1 ?? '',
    address2: profile?.address2 ?? fallbackOrder?.address2 ?? '',
    city: profile?.city ?? fallbackOrder?.city ?? '',
    postcode: profile?.postcode ?? fallbackOrder?.postcode ?? '',
  }
}

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

// Editable name + default delivery address card. Saved separately from any
// order, so changing it never rewrites what was actually shipped in the past
function AddressCard({ user, profile, fallbackOrder, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState(() => addressDefaults(user, profile, fallbackOrder))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const startEditing = () => {
    setValues(addressDefaults(user, profile, fallbackOrder))
    setError(null)
    setSaved(false)
    setEditing(true)
  }

  const handleChange = (id, value) => setValues((v) => ({ ...v, [id]: value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)

    const firstName = toTitleCase(values.firstName.trim())
    const surname = toTitleCase(values.surname.trim())
    const address1 = values.address1.trim()
    const city = values.city.trim()
    const postcode = values.postcode.trim().toUpperCase()

    if (!firstName) return setError('Enter your first name.')
    if (!surname) return setError('Enter your surname.')
    if (!address1) return setError('Enter the first line of your address.')
    if (!city) return setError('Enter your town or city.')
    if (!UK_POSTCODE.test(postcode)) return setError('Enter a valid UK postcode.')

    setSaving(true)
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          surname,
          nickname: values.nickname.trim(),
        },
      })
      if (authError) throw authError

      // full_name and email are kept here too (not just in auth.users) purely
      // so Sanji can tell rows apart in Table Editor without joining tables -
      // same reason orders already stores them per row instead of just a user_id
      const { error: dbError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        full_name: `${firstName} ${surname}`.trim(),
        email: user.email,
        phone: values.phone.trim(),
        address1,
        address2: values.address2.trim(),
        city,
        postcode,
        updated_at: new Date().toISOString(),
      })
      if (dbError) throw dbError

      setEditing(false)
      setSaved(true)
      onSaved?.()
    } catch (err) {
      setError(err.message || 'Something went wrong, please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Whatever we'd show read-only: the saved profile, or the last order's
  // address if nothing has been saved to the profile yet
  const display = profile ?? fallbackOrder
  const displayName = [user.user_metadata?.first_name, user.user_metadata?.surname]
    .filter(Boolean)
    .map(toTitleCase)
    .join(' ')

  const formFields = [
    { id: 'firstName', label: 'First name', type: 'text', autoComplete: 'given-name' },
    { id: 'surname', label: 'Surname', type: 'text', autoComplete: 'family-name' },
    {
      id: 'nickname',
      label: 'Nickname',
      type: 'text',
      autoComplete: 'nickname',
      optional: true,
      hint: "Shown in your greeting instead of your first name - we'll use your first name if you leave this blank.",
    },
    { id: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', optional: true },
    { id: 'address1', label: 'Address line 1', type: 'text', autoComplete: 'address-line1' },
    { id: 'address2', label: 'Address line 2', type: 'text', autoComplete: 'address-line2', optional: true },
    { id: 'city', label: 'Town or city', type: 'text', autoComplete: 'address-level2' },
    { id: 'postcode', label: 'Postcode', type: 'text', autoComplete: 'postal-code' },
  ]

  return (
    <div className="mt-8 rounded-3xl border border-blush-200 bg-white p-7 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <PinIcon className="h-5 w-5 text-blush-500" />
          Your details
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-1.5 rounded-full bg-blush-50 px-3.5 py-1.5 text-sm font-semibold text-blush-700 transition hover:bg-blush-100"
          >
            <EditIcon className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      {!editing ? (
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-plum-400">Name</p>
            <p className="mt-0.5 text-plum-700">{displayName || display?.full_name || 'Not set yet'}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-plum-400">Nickname</p>
            {user.user_metadata?.nickname ? (
              <p className="mt-0.5 text-plum-700">{user.user_metadata.nickname}</p>
            ) : (
              <p className="mt-0.5 text-plum-500">Not set - add one to use in your greeting instead of your first name.</p>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-plum-400">Email</p>
            <p className="mt-0.5 text-plum-700">{user.email}</p>
          </div>

          {display?.phone && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-plum-400">Phone</p>
              <p className="mt-0.5 text-plum-700">{display.phone}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-plum-400">
              Delivery address
            </p>
            {display?.address1 ? (
              <address className="mt-0.5 not-italic leading-relaxed text-plum-700">
                {display.address1}
                <br />
                {display.address2 && (
                  <>
                    {display.address2}
                    <br />
                  </>
                )}
                {display.city}
                <br />
                {display.postcode}
              </address>
            ) : (
              <p className="mt-0.5 text-plum-500">Not added yet - we'll suggest it at checkout once you do.</p>
            )}
          </div>

          {saved && <p className="text-xs font-semibold text-green-700">Saved!</p>}
        </div>
      ) : (
        <form onSubmit={handleSave} className="mt-4">
          <div className="mb-4">
            <label htmlFor="account-email" className="mb-1.5 block text-sm font-semibold text-plum-700">
              Email
            </label>
            <input
              id="account-email"
              type="email"
              value={user.email}
              disabled
              className="field cursor-not-allowed text-plum-400"
            />
            <p className="mt-1.5 text-xs text-plum-500">
              Can't be changed here yet -{' '}
              <Link to="/contact" className="font-semibold text-blush-700 hover:text-blush-800">
                contact me
              </Link>{' '}
              if you need it updated.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {formFields.map((field) => {
              const wide = ['address1', 'address2', 'nickname'].includes(field.id)
              return (
                <div key={field.id} className={wide ? 'sm:col-span-2' : ''}>
                  <label htmlFor={field.id} className="mb-1.5 block text-sm font-semibold text-plum-700">
                    {field.label}
                    {!field.optional && (
                      <span className="ml-1 text-blush-600" aria-hidden="true">
                        *
                      </span>
                    )}
                    {field.optional && (
                      <span className="ml-1.5 font-normal text-plum-400">(optional)</span>
                    )}
                  </label>
                  {field.hint && (
                    <p id={`${field.id}-hint`} className="mb-1.5 text-xs text-plum-500">
                      {field.hint}
                    </p>
                  )}
                  <input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    value={values[field.id] ?? ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required={!field.optional}
                    placeholder={field.id === 'nickname' ? values.firstName : undefined}
                    aria-describedby={field.hint ? `${field.id}-hint` : undefined}
                    className="field"
                  />
                </div>
              )
            })}
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}

          <div className="mt-5 flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              disabled={saving}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// Account page showing the logged-in user's details and orders
export default function Account() {
  const { user, loading, signOut } = useAuth()
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
            {greetingName ? `, ${greetingName}` : ''} 💕
          </p>
          <p className="text-plum-600">{user.email}</p>
        </div>
      </div>

      <AddressCard
        user={user}
        profile={profile}
        fallbackOrder={savedAddress}
        onSaved={() => setProfileReloadKey((k) => k + 1)}
      />

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
