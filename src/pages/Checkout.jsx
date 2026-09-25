import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { formatPrice, useCart } from '../context/CartContext'
import { DISCOUNT_RATE } from '../data/pricing'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { LockIcon } from '../components/Icons'
import { toTitleCase } from '../lib/text'

const fields = [
  { id: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name' },
  { id: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
  { id: 'phone', label: 'Phone number', type: 'tel', autoComplete: 'tel', optional: true },
  { id: 'address1', label: 'Address line 1', type: 'text', autoComplete: 'address-line1' },
  {
    id: 'address2',
    label: 'Address line 2',
    type: 'text',
    autoComplete: 'address-line2',
    optional: true,
  },
  { id: 'city', label: 'Town or city', type: 'text', autoComplete: 'address-level2' },
  {
    id: 'postcode',
    label: 'Postcode',
    type: 'text',
    autoComplete: 'postal-code',
    hint: 'For example, GU14 6XR',
  },
]

// Checks delivery form fields and returns any error messages
const validate = (values) => {
  const errors = {}
  if (!values.fullName?.trim()) errors.fullName = 'Enter your full name so we know who to post to.'
  if (!values.email?.trim()) {
    errors.email = 'Enter your email address for your order confirmation.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter an email address in the format name@example.com.'
  }
  if (!values.address1?.trim()) errors.address1 = 'Enter the first line of your address.'
  if (!values.city?.trim()) errors.city = 'Enter your town or city.'
  if (!values.postcode?.trim()) {
    errors.postcode = 'Enter your postcode.'
  } else if (!/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(values.postcode.trim())) {
    errors.postcode = 'Enter a valid UK postcode, for example GU14 6XR.'
  }
  return errors
}

// Checkout page: delivery form, order summary, demo submit
export default function Checkout() {
  const { user } = useAuth()
  const { items, subtotal, shipping, total, clearCart } = useCart()
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState(null)
  const [discountCode, setDiscountCode] = useState('')
  const [appliedCode, setAppliedCode] = useState(null)
  const [discountStatus, setDiscountStatus] = useState('idle')
  const summaryRef = useRef(null)
  const cancelled = new URLSearchParams(useLocation().search).get('cancelled')

  // Fills the form in from their saved default address, falling back to
  // whichever address they last posted to — never overwrites anything
  // they've already started typing themselves
  useEffect(() => {
    if (!user) return

    const applyPrefill = (data) => {
      if (!data) return
      setValues((v) => ({
        fullName: v.fullName || data.full_name || '',
        email: v.email || data.email || user.email || '',
        phone: v.phone || data.phone || '',
        address1: v.address1 || data.address1 || '',
        address2: v.address2 || data.address2 || '',
        city: v.city || data.city || '',
        postcode: v.postcode || data.postcode || '',
      }))
    }

    supabase
      .from('profiles')
      .select('phone, address1, address2, city, postcode')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data: profile }) => {
        if (profile) {
          const fullName = [user.user_metadata?.first_name, user.user_metadata?.surname]
            .filter(Boolean)
            .map(toTitleCase)
            .join(' ')
          applyPrefill({ ...profile, full_name: fullName })
          return
        }

        supabase
          .from('orders')
          .select('full_name, email, phone, address1, address2, city, postcode')
          .eq('user_id', user.id)
          .not('address1', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(({ data: order }) => applyPrefill(order))
      })
  }, [user])

  // Shown to the shopper only; the real total is always recalculated server-side
  const discountAmount = appliedCode ? subtotal * DISCOUNT_RATE : 0
  const discountedTotal = total - discountAmount

  if (items.length === 0) return <Navigate to="/cart" replace />

  // Updates one field's value and re-validates if touched
  const setField = (id, value) => {
    setValues((v) => ({ ...v, [id]: value }))
    if (touched[id]) {
      setErrors(validate({ ...values, [id]: value }))
    }
    // Discount was validated against the old email, so re-check is required
    if (id === 'email' && appliedCode) {
      setAppliedCode(null)
      setDiscountStatus('idle')
    }
  }

  // Marks a field touched and re-runs validation on blur
  const handleBlur = (id) => {
    setTouched((t) => ({ ...t, [id]: true }))
    setErrors(validate(values))
  }

  // Checks the discount code against this checkout's email and applies it if valid
  const applyDiscountCode = async () => {
    const code = discountCode.trim().toUpperCase()
    if (!code) return

    if (!values.email?.trim()) {
      setDiscountStatus('needs_email')
      return
    }

    setDiscountStatus('checking')
    try {
      const res = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email: values.email.trim() }),
      })
      const data = await res.json()

      setAppliedCode(data.valid ? code : null)
      setDiscountStatus(data.valid ? 'applied' : 'invalid')
    } catch {
      setDiscountStatus('invalid')
    }
  }

  // Validates the form, then hands over to Stripe's secure payment page
  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched(Object.fromEntries(fields.map((f) => [f.id, true])))

    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    setSubmitting(true)
    setOrderError(null)

    try {
      // Logged-in shoppers send their session token so the backend can file the
      // order against their real account without trusting anything we send
      const { data: session } = await supabase.auth.getSession()
      const accessToken = session?.session?.access_token

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        // Only the lashes and quantities: every price is worked out server-side
        body: JSON.stringify({
          email: values.email.trim(),
          fullName: values.fullName.trim(),
          phone: values.phone?.trim() ?? '',
          address1: values.address1.trim(),
          address2: values.address2?.trim() ?? '',
          city: values.city.trim(),
          postcode: values.postcode.trim(),
          items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
          discountCode: appliedCode,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong starting your payment.')

      // The cart is deliberately left alone until the payment actually
      // succeeds, so nothing is lost if they change their mind on Stripe
      window.location.href = data.url
    } catch (err) {
      console.error('[helloqt] failed to start payment:', err)
      setOrderError(err.message)
      setSubmitting(false)
      window.requestAnimationFrame(() => summaryRef.current?.focus())
    }
  }

  const errorList = fields.filter((f) => errors[f.id] && touched[f.id])

  return (
    <div className="section py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Checkout</h1>
      <p className="mt-2 text-plum-600">Almost there, just your delivery details.</p>

      {cancelled && (
        <p className="mt-6 rounded-2xl border border-blush-200 bg-blush-50 p-4 text-sm text-plum-700">
          No payment was taken and your basket is exactly as you left it. Whenever you're ready.
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} noValidate>
          {(errorList.length > 0 || orderError) && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="mb-8 rounded-2xl border-2 border-red-300 bg-red-50 p-5"
            >
              <h2 className="font-display text-lg font-bold text-red-800">
                {orderError
                  ? 'We could not place your order'
                  : `There ${errorList.length === 1 ? 'is 1 problem' : `are ${errorList.length} problems`} with your details`}
              </h2>
              {orderError ? (
                <p className="mt-3 text-sm font-medium text-red-700">{orderError}</p>
              ) : (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {errorList.map((field) => (
                    <li key={field.id}>
                      <a
                        href={`#${field.id}`}
                        className="font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
                      >
                        {errors[field.id]}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <fieldset className="rounded-3xl border border-blush-200 bg-white p-6 sm:p-8">
            <legend className="px-2 font-display text-xl font-bold">Delivery details</legend>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              {fields.map((field) => {
                const invalid = Boolean(errors[field.id] && touched[field.id])
                const wide = ['address1', 'address2'].includes(field.id)
                return (
                  <div key={field.id} className={wide ? 'sm:col-span-2' : ''}>
                    <label
                      htmlFor={field.id}
                      className="mb-1.5 block text-sm font-semibold text-plum-700"
                    >
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
                      onChange={(e) => setField(field.id, e.target.value)}
                      onBlur={() => handleBlur(field.id)}
                      required={!field.optional}
                      aria-invalid={invalid}
                      aria-describedby={
                        [field.hint ? `${field.id}-hint` : null, invalid ? `${field.id}-error` : null]
                          .filter(Boolean)
                          .join(' ') || undefined
                      }
                      className={`field ${invalid ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />

                    {invalid && (
                      <p id={`${field.id}-error`} className="mt-1.5 text-sm font-medium text-red-700">
                        {errors[field.id]}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="mt-6 text-xs text-plum-500">
              <span className="text-blush-600" aria-hidden="true">
                *
              </span>{' '}
              Required field. We only use your details to deliver your order.
            </p>
          </fieldset>

          <div className="mt-6 flex items-center gap-2.5 rounded-2xl border border-gold-300 bg-gold-100/60 p-4 text-sm text-plum-700">
            <LockIcon className="h-5 w-5 shrink-0 text-gold-700" />
            <p>
              Payment is handled securely by Stripe. Your card details go straight to them and
              are never seen by HelloQT.
            </p>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full sm:w-auto">
            {submitting ? 'Taking you to payment…' : `Pay ${formatPrice(discountedTotal)}`}
          </button>
        </form>

        <aside className="h-fit rounded-3xl border border-blush-200 bg-white p-7 shadow-soft lg:sticky lg:top-28">
          <h2 className="font-display text-xl font-bold">Your order</h2>

          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.slug} className="flex items-center gap-3.5">
                <img
                  src={item.image}
                  alt=""
                  width="64"
                  height="64"
                  className="h-16 w-16 rounded-xl border border-blush-200 bg-white object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="text-sm text-plum-500">Qty {item.quantity}</p>
                </div>
                <p className="font-semibold tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-blush-200 pt-5">
            <label htmlFor="discount" className="mb-1.5 block text-sm font-semibold text-plum-700">
              Discount code
            </label>
            <div className="flex gap-2">
              <input
                id="discount"
                type="text"
                placeholder="Enter code"
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value)
                  if (appliedCode) {
                    setAppliedCode(null)
                    setDiscountStatus('idle')
                  }
                }}
                className="field"
              />
              <button
                type="button"
                onClick={applyDiscountCode}
                disabled={discountStatus === 'checking' || !discountCode.trim()}
                className="btn-secondary shrink-0 px-5"
              >
                Apply
              </button>
            </div>
            {discountStatus === 'applied' && (
              <p className="mt-2 text-sm font-semibold text-blush-700">10% off applied!</p>
            )}
            {discountStatus === 'invalid' && (
              <p className="mt-2 text-sm font-medium text-red-700">
                That code isn't valid for this email, or it's already been used.
              </p>
            )}
            {discountStatus === 'needs_email' && (
              <p className="mt-2 text-sm font-medium text-red-700">
                Add your email address above first, then apply your code.
              </p>
            )}
          </div>

          <dl className="mt-6 space-y-3 border-t border-blush-200 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-plum-600">Subtotal</dt>
              <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            {appliedCode && (
              <div className="flex justify-between text-blush-700">
                <dt>Discount (10%)</dt>
                <dd className="font-semibold tabular-nums">-{formatPrice(discountAmount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-plum-600">Delivery</dt>
              <dd className="font-semibold tabular-nums">
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-blush-200 pt-3">
              <dt className="font-display text-lg font-bold">Total</dt>
              <dd className="font-display text-lg font-bold tabular-nums">
                {formatPrice(discountedTotal)}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}
