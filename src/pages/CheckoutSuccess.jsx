import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { CheckIcon } from '../components/Icons'
import ConfettiBurst from '../components/ConfettiBurst'
import { playSuccessSound } from '../lib/sound'
import { pinterestTrack } from '../lib/pinterest'

// How long to keep checking for the order before showing the gentler message
const MAX_ATTEMPTS = 12
const RETRY_DELAY = 1000

// Pinterest's own dedup only reliably matches an event sent by the tag
// against one sent by the Conversions API - it does not promise to catch two
// tag-only sends with the same event_id. Reloading or revisiting this page
// after an order completed would otherwise fire the checkout event again
// every time, inflating reported conversions for a single real sale.
const TRACKED_KEY_PREFIX = 'helloqt-pinterest-checkout-tracked-'
const alreadyTracked = (orderRef) => {
  try {
    return localStorage.getItem(TRACKED_KEY_PREFIX + orderRef) === '1'
  } catch {
    return false
  }
}
const markTracked = (orderRef) => {
  try {
    localStorage.setItem(TRACKED_KEY_PREFIX + orderRef, '1')
  } catch {
    // Private browsing or storage disabled - worst case this order can
    // fire again, same as before this fix
  }
}

// Thank-you page shown after a successful Stripe payment
export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()
  const [orderRef, setOrderRef] = useState(null)
  const [stillLooking, setStillLooking] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)
  const cartCleared = useRef(false)

  useEffect(() => {
    if (!sessionId) return

    // The payment went through, so the basket has done its job
    if (!cartCleared.current) {
      cartCleared.current = true
      clearCart()
      playSuccessSound()
      setShowConfetti(true)
      window.setTimeout(() => setShowConfetti(false), 3500)
    }

    let cancelled = false
    let attempts = 0

    // Stripe tells our server about the payment separately, so the order can
    // take a second or two to appear; keep checking rather than guessing
    const check = async () => {
      attempts += 1
      try {
        const res = await fetch(`/api/order-by-session?session_id=${encodeURIComponent(sessionId)}`)
        const data = await res.json()
        if (cancelled) return
        if (data.orderRef) {
          setOrderRef(data.orderRef)
          setStillLooking(false)

          // Tells Pinterest the sale happened, so ad spend can be measured
          // against it. event_id matches the server-side Conversions API
          // event sent from the same order, so Pinterest counts it once -
          // but only the first time we ever load this page for this order,
          // so a reload or revisit never reports the same sale twice
          if (!alreadyTracked(data.orderRef)) {
            markTracked(data.orderRef)
            pinterestTrack('checkout', {
              value: data.total,
              currency: 'GBP',
              order_id: data.orderRef,
              event_id: data.orderRef,
              line_items: (data.items ?? []).map((item) => ({
                product_id: item.slug,
                product_name: item.name,
                product_price: item.price,
                product_quantity: item.quantity,
              })),
            })
          }
          return
        }
      } catch {
        // A failed check is not worth showing; we simply try again
      }
      if (cancelled) return
      if (attempts >= MAX_ATTEMPTS) return setStillLooking(false)
      window.setTimeout(check, RETRY_DELAY)
    }

    check()
    return () => {
      cancelled = true
    }
  }, [sessionId, clearCart])

  if (!sessionId) return <Navigate to="/" replace />

  return (
    <div className="section py-20 text-center sm:py-28">
      {showConfetti && <ConfettiBurst />}
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blush-100 text-blush-600">
        <CheckIcon className="h-10 w-10" />
      </span>

      <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Thank you, lovely!</h1>

      <p className="mx-auto mt-3 max-w-md text-plum-600">
        {orderRef ? (
          <>
            Your payment went through and your order{' '}
            <strong className="text-plum-800">{orderRef}</strong> is confirmed. We have sent a
            confirmation email and your lashes will be on their way within 2-3 working days.
          </>
        ) : stillLooking ? (
          <>Your payment went through. Just confirming your order…</>
        ) : (
          <>
            Your payment went through and your confirmation email is on its way. If it has not
            arrived in a few minutes, email helloqts@hotmail.com and I will sort it out.
          </>
        )}
      </p>

      <p className="mt-6 font-script text-3xl text-blush-600">Made to make you feel QT</p>

      <Link to="/shop" className="btn-primary mt-8">
        Continue shopping
      </Link>
    </div>
  )
}
