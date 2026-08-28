import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getProduct } from '../data/products'
import { ArrowRightIcon, CloseIcon, SparkleIcon } from './Icons'

const suitcaseStyles = [
  { label: 'Wispy & feather-light', slug: 'angel' },
  { label: 'Textured, soft glam', slug: 'cherish' },
  { label: 'Bold spikes, no subtlety', slug: 'king' },
  { label: 'Feathery but full', slug: 'luck' },
]

const compactStyles = [
  { label: 'Soft, elegant flutter', slug: 'classy' },
  { label: 'Full glam, mini length', slug: 'dolledup' },
  { label: 'Big, fluffy volume', slug: 'goddess' },
  { label: 'Doe-eyed & dreamy', slug: 'halo' },
  { label: 'Sparkly, night-out ready', slug: 'lust' },
  { label: 'Luxe everyday treat', slug: 'royalty' },
]

// Multi-step quiz modal that recommends a lash style
export default function LashQuiz({ open, onClose }) {
  const [step, setStep] = useState('occasion')
  const [resultSlug, setResultSlug] = useState(null)

  if (!open) return null

  // Resets the quiz back to its first step
  const reset = () => {
    setStep('occasion')
    setResultSlug(null)
  }

  // Closes the modal, then resets it after the fade-out
  const handleClose = () => {
    onClose()
    setTimeout(reset, 200)
  }

  // Saves the chosen style and jumps to the result step
  const pickStyle = (slug) => {
    setResultSlug(slug)
    setStep('result')
  }

  const result = resultSlug ? getProduct(resultSlug) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-plum-900/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[1.75rem] bg-cream p-6 shadow-lift sm:p-8">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-blush-100 text-plum-700 transition hover:bg-blush-200"
          aria-label="Close"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blush-600">
          <SparkleIcon className="h-4 w-4" />
          Match me to a lash
        </p>

        {step === 'occasion' && (
          <>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              What&apos;s the occasion?
            </h2>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => setStep('suitcase-style')}
                className="rounded-2xl border-2 border-plum-200 bg-white p-4 text-left font-semibold text-plum-800 transition hover:border-plum-400 hover:bg-plum-50"
              >
                A big night, I want drama (25mm Suitcase)
              </button>
              <button
                type="button"
                onClick={() => setStep('compact-style')}
                className="rounded-2xl border-2 border-blush-200 bg-white p-4 text-left font-semibold text-plum-800 transition hover:border-blush-400 hover:bg-blush-50"
              >
                Everyday wear, keep it natural (15mm Compact)
              </button>
              <button
                type="button"
                onClick={() => pickStyle('royalty')}
                className="rounded-2xl border-2 border-gold-300 bg-white p-4 text-left font-semibold text-plum-800 transition hover:border-gold-500 hover:bg-gold-100"
              >
                Not sure, just show me your favourite
              </button>
            </div>
          </>
        )}

        {(step === 'suitcase-style' || step === 'compact-style') && (
          <>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              Pick your vibe
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {(step === 'suitcase-style' ? suitcaseStyles : compactStyles).map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => pickStyle(s.slug)}
                  className="rounded-2xl border-2 border-blush-200 bg-white p-4 text-left font-semibold text-plum-800 transition hover:border-blush-400 hover:bg-blush-50"
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep('occasion')}
              className="mt-4 text-sm font-semibold text-plum-500 underline"
            >
              Back
            </button>
          </>
        )}

        {step === 'result' && result && (
          <>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              Meet your lash bestie
            </h2>
            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-blush-200 bg-white p-5 sm:flex-row sm:items-center">
              <img
                src={result.image}
                alt={`${result.name}, ${result.style} lashes by HelloQT`}
                width="140"
                height="140"
                className="h-28 w-28 shrink-0 self-center rounded-2xl object-cover"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blush-600">
                  {result.style}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold">{result.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-plum-600">{result.tagline}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/product/${result.slug}`} onClick={handleClose} className="btn-primary">
                Shop {result.name}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <button type="button" onClick={reset} className="btn-secondary">
                Start over
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
