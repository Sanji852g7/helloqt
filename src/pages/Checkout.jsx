import { useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { formatPrice, useCart } from '../context/CartContext'
import { CheckIcon, LockIcon } from '../components/Icons'

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
  const { items, subtotal, shipping, total, clearCart } = useCart()
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [orderRef, setOrderRef] = useState(null)
  const summaryRef = useRef(null)

  if (items.length === 0 && !orderRef) return <Navigate to="/cart" replace />

  if (orderRef) {
    return (
      <div className="section py-20 text-center sm:py-28">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blush-100 text-blush-600">
          <CheckIcon className="h-10 w-10" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Thank you, lovely!</h1>
        <p className="mx-auto mt-3 max-w-md text-plum-600">
          Your order <strong className="text-plum-800">{orderRef}</strong> is confirmed. We have
          sent a confirmation email and your lashes will be on their way within two working days.
        </p>
        <p className="mt-6 font-script text-3xl text-blush-600">
          Enhance your beauty with HelloQT
        </p>
        <Link to="/shop" className="btn-primary mt-8">
          Continue shopping
        </Link>
      </div>
    )
  }

  // Updates one field's value and re-validates if touched
  const setField = (id, value) => {
    setValues((v) => ({ ...v, [id]: value }))
    if (touched[id]) {
      setErrors(validate({ ...values, [id]: value }))
    }
  }

  // Marks a field touched and re-runs validation on blur
  const handleBlur = (id) => {
    setTouched((t) => ({ ...t, [id]: true }))
    setErrors(validate(values))
  }

  // Validates the form, then fakes placing the demo order
  const handleSubmit = (event) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched(Object.fromEntries(fields.map((f) => [f.id, true])))

    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      setOrderRef(`HQT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`)
      clearCart()
      setSubmitting(false)
    }, 900)
  }

  const errorList = fields.filter((f) => errors[f.id] && touched[f.id])

  return (
    <div className="section py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Checkout</h1>
      <p className="mt-2 text-plum-600">Almost there, just your delivery details.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} noValidate>
          {errorList.length > 0 && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="mb-8 rounded-2xl border-2 border-red-300 bg-red-50 p-5"
            >
              <h2 className="font-display text-lg font-bold text-red-800">
                There {errorList.length === 1 ? 'is 1 problem' : `are ${errorList.length} problems`}{' '}
                with your details
              </h2>
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
              This is a demo checkout, no payment is taken and no card details are collected.
            </p>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full sm:w-auto">
            {submitting ? 'Placing your order…' : `Place order · ${formatPrice(total)}`}
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

          <dl className="mt-6 space-y-3 border-t border-blush-200 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-plum-600">Subtotal</dt>
              <dd className="font-semibold tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-plum-600">Delivery</dt>
              <dd className="font-semibold tabular-nums">
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-blush-200 pt-3">
              <dt className="font-display text-lg font-bold">Total</dt>
              <dd className="font-display text-lg font-bold tabular-nums">{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}
