import { useState } from 'react'
import { Link } from 'react-router-dom'
import { collections, products } from '../data/products'
import ProductCard from '../components/ProductCard'
import LashQuiz from '../components/LashQuiz'
import FounderLetter from '../components/FounderLetter'
import { Squiggle } from '../components/Doodles'
import { ArrowRightIcon, SparkleIcon } from '../components/Icons'

const promises = [
  {
    emoji: '🐇',
    title: 'Cruelty-free, always',
    body: 'Never tested on animals, every lash is 100% cruelty-free, no exceptions.',
  },
  {
    emoji: '📦',
    title: 'Never lose a lash again',
    body: "Every pair comes home in its own little box, so it's never rattling around your bag or bin.",
  },
  {
    emoji: '☁️',
    title: 'Comfort you forget about',
    body: 'Lightweight with a flexible band, so it moves with you, not against you.',
  },
  {
    emoji: '✦',
    title: 'Handmade with care',
    body: 'Each lash is handcrafted, not mass-produced, so the fibres stay soft and full.',
  },
  {
    emoji: '↻',
    title: 'Built to last',
    body: 'Reusable 15 to 25 times with proper care, so your favourite style stays in rotation.',
  },
  {
    emoji: '🚚',
    title: 'Free UK delivery',
    body: 'Free on every order over £40, UK-wide.',
  },
]

const steps = [
  { n: '01', title: 'Pick your style', body: 'Suitcase for drama, Compact for every day.' },
  { n: '02', title: 'Measure & trim', body: 'Trim the band to fit your lash line before applying.' },
  { n: '03', title: 'Apply & go', body: 'A thin line of glue, wait 30 seconds, press into place.' },
]

const badgePriority = { 'My Pick': 0, Bestseller: 1, 'New In': 2 }

// Homepage: hero, promises, collections, favourites, CTA
export default function Home() {
  const [quizOpen, setQuizOpen] = useState(false)
  const favourites = products
    .filter((p) => p.badge)
    .sort((a, b) => (badgePriority[a.badge] ?? 9) - (badgePriority[b.badge] ?? 9))
    .slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="section relative grid items-center gap-12 pb-16 pt-8 lg:grid-cols-2 lg:pb-24 lg:pt-10">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-300 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
              hey QT 💕
            </p>

            <h1 className="mt-6 text-balance font-display text-[2.6rem] font-bold leading-[1.12] text-plum-900 sm:text-6xl">
              Pack a lash for every{' '}
              <span className="relative inline-block">
                <span className="relative z-10">occasion</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-0.1em] bottom-[0.08em] z-0 h-[0.22em] -rotate-1 rounded-full bg-blush-300/80"
                />
              </span>
              .
            </h1>

            <p className="mt-4 font-script text-3xl text-blush-600 sm:text-4xl">
              Enhance your beauty with HelloQT
            </p>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-plum-600 sm:text-lg">
              Never lose a lash again, every pair comes home in its own little box. Handmade,
              cruelty-free, in two collections: the Suitcase Set for full-drama nights, and the
              Compact Set for everyday glam.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop?collection=suitcase#suitcase" className="btn-primary">
                Shop the Suitcase Set
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <button type="button" onClick={() => setQuizOpen(true)} className="btn-secondary">
                Match me to a lash
              </button>
            </div>
          </div>

          {/* Hero image collage */}
          <div className="relative">
            <div className="relative mx-auto flex w-full max-w-lg items-center justify-center gap-4 sm:max-w-xl sm:gap-6">
              <svg width="0" height="0" className="absolute">
                <defs>
                  <clipPath id="hero-heart-clip" clipPathUnits="objectBoundingBox">
                    <path d="M0.5,0.978 C0.22,0.756 0.06,0.533 0.06,0.333 C0.06,0.167 0.18,0.044 0.32,0.044 C0.40,0.044 0.47,0.089 0.5,0.167 C0.53,0.089 0.60,0.044 0.68,0.044 C0.82,0.044 0.94,0.167 0.94,0.333 C0.94,0.533 0.78,0.756 0.5,0.978 Z" />
                  </clipPath>
                </defs>
              </svg>

              <div className="relative w-1/2 animate-float" style={{ aspectRatio: '100 / 90' }}>
                <img
                  src="/media/king.JPG"
                  alt="King lashes in the Suitcase Set travel case"
                  width="1080"
                  height="1080"
                  style={{
                    clipPath: 'url(#hero-heart-clip)',
                    objectPosition: 'center',
                  }}
                  className="h-full w-full bg-white object-contain"
                />
                <svg
                  viewBox="0 0 100 90"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full text-blush-500"
                >
                  <path
                    d="M50,88 C22,68 6,48 6,30 C6,15 18,4 32,4 C40,4 47,8 50,15 C53,8 60,4 68,4 C82,4 94,15 94,30 C94,48 78,68 50,88 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              <div className="relative w-1/2 animate-float-reverse" style={{ aspectRatio: '100 / 90' }}>
                <img
                  src="/media/royalty.JPG"
                  alt="Royalty lashes in the Compact Set mirror case"
                  width="1080"
                  height="1080"
                  style={{
                    clipPath: 'url(#hero-heart-clip)',
                    objectPosition: 'center',
                  }}
                  className="h-full w-full bg-white object-contain"
                />
                <svg
                  viewBox="0 0 100 90"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 h-full w-full text-blush-500"
                >
                  <path
                    d="M50,88 C22,68 6,48 6,30 C6,15 18,4 32,4 C40,4 47,8 50,15 C53,8 60,4 68,4 C82,4 94,15 94,30 C94,48 78,68 50,88 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promise strip */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="section text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blush-600">
            The HelloQT promise
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
            Why QT's choose us
          </h2>
        </div>

        <div className="section mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map(({ emoji, title, body }) => (
            <div key={title} className="rounded-3xl bg-white p-7 shadow-soft">
              <span className="text-3xl text-blush-500" role="img" aria-hidden="true">
                {emoji}
              </span>
              <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
              <p className="mt-2 leading-relaxed text-plum-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two collections */}
      <section className="section py-16 sm:py-20">
        <div className="inline-block max-w-2xl pr-10">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blush-600">
            <SparkleIcon className="h-4 w-4" />
            Two little collections
          </p>
          <Squiggle className="mt-2 h-3 w-full text-blush-400" />
        </div>

        <div className="mt-9 grid gap-6 md:grid-cols-2">
          {Object.values(collections).map((collection) => {
            const isSuitcase = collection.id === 'suitcase'
            return (
              <Link
                key={collection.id}
                to={`/shop?collection=${collection.id}#${collection.id}`}
                className={`group flex items-center gap-6 overflow-hidden rounded-[2rem] border bg-white p-8 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift ${
                  isSuitcase ? 'border-gold-200' : 'border-blush-200'
                }`}
              >
                <div className="flex-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white ${
                      isSuitcase ? 'bg-gold-600' : 'bg-blush-600'
                    }`}
                  >
                    {collection.volume}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold">{collection.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-plum-600">
                    {collection.tagline}
                  </p>
                  <p className="mt-4 text-sm font-bold text-plum-800">{collection.length} length</p>

                  <span
                    className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${
                      isSuitcase ? 'text-plum-700' : 'text-blush-700'
                    }`}
                  >
                    Shop {collection.name}
                    <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>

                <img
                  src={collection.cover}
                  alt=""
                  width="140"
                  height="140"
                  className={`h-32 w-32 shrink-0 rounded-3xl border-4 border-white object-cover shadow-lift transition duration-300 group-hover:scale-105 ${
                    isSuitcase ? 'rotate-3' : '-rotate-3'
                  }`}
                />
              </Link>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="section">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              New to strip lashes? It takes 60 seconds.
            </h2>
            <p className="mt-3 text-plum-600">
              No appointment, no infills, no damage to your natural lashes.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.n}
                className="rounded-3xl border border-blush-200 bg-white p-7 shadow-soft"
              >
                <span className="font-display text-4xl font-bold text-blush-200">{step.n}</span>
                <h3 className="mt-3 font-display text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-plum-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Founder note, styled like a real letter */}
      <section className="section py-16 sm:py-20">
        <FounderLetter />
      </section>

      {/* Favourites */}
      <section className="section pb-16 pt-8 sm:pb-20 sm:pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blush-600">
              <SparkleIcon className="h-4 w-4" />
              My personal favourites
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Loved by you (and me)</h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blush-700 transition hover:gap-3 hover:text-blush-800"
          >
            View all 10 styles
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favourites.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section pt-16 sm:pt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush-200 via-blush-300 to-gold-200 px-8 py-14 text-center sm:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/30 blur-2xl"
          />
          <h2 className="relative font-display text-3xl font-bold text-plum-900 sm:text-4xl">
            Ready to find your signature lash?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-plum-700">
            Free UK delivery on orders over £40. Reusable up to 25 times.
          </p>
          <Link
            to="/shop"
            className="relative mt-8 inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-blush-700 shadow-lift transition hover:bg-blush-50 active:scale-[0.98]"
          >
            Shop all lashes
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <LashQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />
    </>
  )
}
