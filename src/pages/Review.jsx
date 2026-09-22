import { useEffect, useState } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { CheckIcon, StarIcon } from '../components/Icons'

// Interactive 1-5 star picker
function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          onClick={() => onChange(n)}
          className="cursor-pointer p-1"
        >
          <StarIcon className={`h-8 w-8 ${n <= value ? 'text-gold-400' : 'text-blush-200'}`} />
        </button>
      ))}
    </div>
  )
}

// Review submission page, reached only via the signed link in a "delivered"
// email — proves the reviewer genuinely bought the product, no login needed
export default function Review() {
  const { orderRef } = useParams()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t') ?? ''

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [items, setItems] = useState([])
  const [slug, setSlug] = useState(null)
  const [rating, setRating] = useState(0)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch(`/api/review-context/${encodeURIComponent(orderRef)}?t=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'That review link is invalid or has expired.')
        setItems(data.items)
        setSlug(data.items.find((item) => !item.alreadyReviewed)?.slug ?? data.items[0]?.slug ?? null)
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [orderRef, token])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!rating) {
      setSendError('Choose a star rating.')
      return
    }

    setSending(true)
    setSendError(null)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderRef, t: token, slug, rating, body }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong saving your review.')
      setSent(true)
    } catch (err) {
      setSendError(err.message)
    } finally {
      setSending(false)
    }
  }

  const selected = items.find((item) => item.slug === slug)

  return (
    <div className="section flex justify-center py-16 sm:py-20">
      <div className="w-full max-w-sm rounded-3xl border border-blush-200 bg-white p-7 text-center shadow-soft sm:p-8">
        {loading ? (
          <p className="text-plum-600">Loading…</p>
        ) : loadError ? (
          <>
            <h1 className="font-display text-xl font-bold">Link not found</h1>
            <p className="mt-2 text-sm text-plum-600">{loadError}</p>
          </>
        ) : sent ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush-600 text-white">
              <CheckIcon className="h-8 w-8" />
            </span>
            <h1 className="mt-5 font-display text-xl font-bold">Thank you! 💕</h1>
            <p className="mt-2 text-plum-600">
              Your review has been sent. It helps a small business like mine improve, so thank you
              so much for your time.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold">How was it?</h1>
            <p className="mt-1.5 text-sm text-plum-600">Your review helps other QTs shop with confidence.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-left">
              {items.length > 1 && (
                <div>
                  <label htmlFor="product" className="mb-1.5 block text-sm font-semibold text-plum-700">
                    Which lash?
                  </label>
                  <select
                    id="product"
                    className="field"
                    value={slug ?? ''}
                    onChange={(e) => setSlug(e.target.value)}
                  >
                    {items.map((item) => (
                      <option key={item.slug} value={item.slug} disabled={item.alreadyReviewed}>
                        {item.name}
                        {item.alreadyReviewed ? ' (already reviewed)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selected?.alreadyReviewed ? (
                <p className="rounded-xl bg-blush-50 px-3 py-2 text-sm font-medium text-blush-700">
                  You have already reviewed {selected.name}, thank you!
                </p>
              ) : (
                <>
                  <div className="text-center">
                    <p className="mb-2 text-sm font-semibold text-plum-700">Your rating</p>
                    <div className="flex justify-center">
                      <StarPicker value={rating} onChange={setRating} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="body" className="mb-1.5 block text-sm font-semibold text-plum-700">
                      Your review
                    </label>
                    <textarea
                      id="body"
                      rows={5}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="What did you think of the fit, comfort and finish?"
                      className="field resize-y"
                    />
                  </div>

                  {sendError && (
                    <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                      {sendError}
                    </p>
                  )}

                  <button type="submit" disabled={sending} className="btn-primary w-full">
                    {sending ? 'Sending…' : 'Submit review'}
                  </button>
                </>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
