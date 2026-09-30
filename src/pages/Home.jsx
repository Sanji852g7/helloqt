import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { collections, products } from '../data/products'
import { formatPrice } from '../context/CartContext'
import { useQuiz } from '../context/QuizContext'
import FounderLetter from '../components/FounderLetter'
import FaqAccordion from '../components/FaqAccordion'
import { Squiggle } from '../components/Doodles'
import { ArrowLeftIcon, ArrowRightIcon, SparkleIcon } from '../components/Icons'

// Same heart-shaped photo frame as the hero collage, reused for favourites
const HEART_CLIP_PATH =
  'M0.5,0.978 C0.22,0.756 0.06,0.533 0.06,0.333 C0.06,0.167 0.18,0.044 0.32,0.044 C0.40,0.044 0.47,0.089 0.5,0.167 C0.53,0.089 0.60,0.044 0.68,0.044 C0.82,0.044 0.94,0.167 0.94,0.333 C0.94,0.533 0.78,0.756 0.5,0.978 Z'
const HEART_OUTLINE_PATH =
  'M50,88 C22,68 6,48 6,30 C6,15 18,4 32,4 C40,4 47,8 50,15 C53,8 60,4 68,4 C82,4 94,15 94,30 C94,48 78,68 50,88 Z'

const promises = [
  { emoji: '🐇', title: 'Cruelty-free', body: 'Never tested on animals.' },
  { emoji: '💕', title: 'Handmade', body: 'Made with care.' },
  { emoji: '♻️', title: 'Reusable', body: 'Wear up to 25 times.' },
  { emoji: '🧳', title: 'Travel-ready', body: 'Every lash has its own home.' },
]

const steps = [
  { n: '01', title: 'Pick your style', body: 'QT Luggage Set for drama, QT Vanity Set for every day.' },
  { n: '02', title: 'Measure & trim', body: 'Trim the band to fit your lash line before applying.' },
  { n: '03', title: 'Apply & go', body: 'A thin line of glue, wait 30 seconds, press into place.' },
]

const badgePriority = { 'My Pick': 0, Bestseller: 1, 'New In': 2 }

// Homepage: hero, promises, collections, favourites, CTA
export default function Home() {
  const { openQuiz } = useQuiz()
  const [heroHover, setHeroHover] = useState(null) // 'left' | 'right' | null
  // Some tablets report (hover: hover) as true even though they're touch-first,
  // which let stray compatibility mouse events interfere with the tap-to-reveal
  // arrow there. Tying this to the same lg breakpoint used everywhere else in
  // the hero is more predictable - only genuine desktop widths get hover,
  // tablet and phone always use tap regardless of what the device claims to
  // support. Reactive to resize/rotation, not just read once on mount.
  const [isDesktopWidth, setIsDesktopWidth] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  )
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktopWidth(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])
  const favourites = products
    .filter((p) => p.badge)
    .sort((a, b) => (badgePriority[a.badge] ?? 9) - (badgePriority[b.badge] ?? 9))
    .slice(0, 3)

  // Touch has no hover - the first tap reveals a side instead of navigating
  // straight away, so people can see what it is before committing. Tapping
  // the same side again (or the Shop now button) goes through as normal.
  // Wired to BOTH touchend and click: a real touch's own native click (which
  // would otherwise follow ~immediately) is stopped by preventDefault-ing the
  // touchend itself, but tablets/laptops used with an actual mouse or
  // trackpad never fire a touch event at all - only click - so the same
  // check needs to run there too, or a plain click would go straight through
  // unblocked. Whichever event fires first does the work; if both fire (a
  // real tap that wasn't prevented), the second is a no-op since the ref
  // already matches.
  const revealedSideRef = useRef(null)

  const handleHeroActivate = (side) => (e) => {
    if (isDesktopWidth) return
    if (revealedSideRef.current !== side) {
      e.preventDefault()
      revealedSideRef.current = side
      setHeroHover(side)
    }
    // else: already revealed - let this navigate normally
  }

  return (
    <>
      {/* Hero - pure photography. On phones/tablets it rests at a modest height
          showing both full photos uncropped, then grows tall with a dramatic
          full-bleed crop once a side is tapped open. Large screens keep the
          constant full-viewport-height treatment regardless of hover state. */}
      <section
        className={`relative overflow-hidden bg-cream flex transition-[height] duration-700 ease-out ${
          heroHover ? 'h-[65dvh]' : 'h-[52dvh]'
        } lg:h-[calc(100dvh-6rem)]`}
      >
        {/* Split collection backdrop, side by side at every screen size. Hovering
            (or tapping, on touch) a side expands it to fill the section and
            reveals that collection's story and CTA. */}
        <div className="relative flex w-full">
          {/* Marks the seam between the two collections - disappears as soon as either
              side starts expanding, and only reappears once both have fully shrunk
              back to resting size (matches the panels' own 700ms transition) */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 left-1/2 z-20 w-[3px] -translate-x-1/2 bg-white/80 shadow-[0_0_10px_rgba(0,0,0,0.2)] transition-opacity duration-300 ${
              heroHover ? 'opacity-0' : 'opacity-100 delay-700'
            }`}
          />
          <Link
            to="/shop?collection=suitcase#suitcase"
            onMouseEnter={isDesktopWidth ? () => setHeroHover('left') : undefined}
            onMouseLeave={isDesktopWidth ? () => setHeroHover(null) : undefined}
            onFocus={() => setHeroHover('left')}
            onBlur={() => setHeroHover(null)}
            onTouchEnd={handleHeroActivate('left')}
            onClick={handleHeroActivate('left')}
            className={`relative min-h-0 min-w-0 overflow-hidden transition-all duration-700 ease-out ${
              heroHover === 'right' ? 'basis-[0%]' : heroHover === 'left' ? 'basis-full' : 'basis-1/2'
            }`}
            aria-label="Shop the QT Luggage Set"
          >
            <img
              src="/media/king.JPG"
              alt="King lashes in the QT Luggage Set travel case"
              width="1080"
              height="1080"
              className={`h-full w-full ${
                heroHover === 'left' ? 'object-cover' : 'object-contain bg-white lg:object-cover lg:bg-transparent'
              }`}
            />
            {/* Crossfades in to focus on the lash itself once this side takes over the screen */}
            <img
              src="/media/king-lash.jpg"
              alt=""
              aria-hidden="true"
              width="590"
              height="470"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                heroHover === 'left' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              className={`absolute inset-0 bg-plum-900/55 transition-opacity duration-500 ${
                heroHover === 'left' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center text-white transition-opacity duration-500 ${
                heroHover === 'left' ? 'opacity-100 delay-150' : 'pointer-events-none opacity-0'
              }`}
            >
              <span className="font-display text-2xl font-bold sm:text-3xl">The QT Luggage Set 🧳</span>
              <span className="max-w-xs text-sm text-white/85">
                Our boldest, most dramatic lashes, tucked into their own little travel case.
              </span>
              <span className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-plum-800 shadow-lift transition hover:bg-blush-50">
                Shop now
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <Link
            to="/shop?collection=compact#compact"
            onMouseEnter={isDesktopWidth ? () => setHeroHover('right') : undefined}
            onMouseLeave={isDesktopWidth ? () => setHeroHover(null) : undefined}
            onFocus={() => setHeroHover('right')}
            onBlur={() => setHeroHover(null)}
            onTouchEnd={handleHeroActivate('right')}
            onClick={handleHeroActivate('right')}
            className={`relative min-h-0 min-w-0 overflow-hidden transition-all duration-700 ease-out ${
              heroHover === 'left' ? 'basis-[0%]' : heroHover === 'right' ? 'basis-full' : 'basis-1/2'
            }`}
            aria-label="Shop the QT Vanity Set"
          >
            <img
              src="/media/royalty.JPG"
              alt="Royalty lashes in the QT Vanity Set mirror case"
              width="1080"
              height="1080"
              className={`h-full w-full transition-[object-position] duration-700 ease-out ${
                heroHover === 'right'
                  ? 'object-cover'
                  : 'object-contain bg-white lg:object-cover lg:bg-transparent'
              }`}
            />
            <div
              className={`absolute inset-0 bg-plum-900/55 transition-opacity duration-500 ${
                heroHover === 'right' ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center text-white transition-opacity duration-500 ${
                heroHover === 'right' ? 'opacity-100 delay-150' : 'pointer-events-none opacity-0'
              }`}
            >
              <span className="font-display text-2xl font-bold sm:text-3xl">The QT Vanity Set 🪞</span>
              <span className="max-w-xs text-sm text-white/85">
                Cute, compact everyday lashes with their own mirrored little home.
              </span>
              <span className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-plum-800 shadow-lift transition hover:bg-blush-50">
                Shop now
                <ArrowRightIcon className="h-4 w-4" />
              </span>
            </div>
          </Link>

          {/* Phone/tablet only - switches to the other side without navigating,
              since there's no hover there to reveal it by moving the mouse away */}
          <button
            type="button"
            onClick={() => {
              revealedSideRef.current = 'right'
              setHeroHover('right')
            }}
            aria-label="Show the QT Vanity Set"
            className={`absolute right-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-plum-700 shadow-lift transition-opacity duration-200 lg:hidden ${
              heroHover === 'left' ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              revealedSideRef.current = 'left'
              setHeroHover('left')
            }}
            aria-label="Show the QT Luggage Set"
            className={`absolute left-3 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-plum-700 shadow-lift transition-opacity duration-200 lg:hidden ${
              heroHover === 'right' ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Hero headline - sits below the photos, letting them read as pure photography */}
      <section className="bg-cream py-14 sm:py-16">
        <div className="section text-center">
          <div className="animate-fade-up">
            <h1 className="text-balance font-display text-[2.6rem] font-bold leading-[1.12] text-plum-900 sm:text-6xl">
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

            <p className="mt-3 font-script text-2xl text-blush-600 sm:text-3xl">
              Made to make you feel QT 💕
            </p>

            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-plum-600 sm:text-lg">
              Handcrafted, reusable and cruelty-free lashes, each with its own little home.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/shop" className="btn-primary">
                Shop lashes
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={openQuiz}
                className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full border border-plum-300 bg-white px-7 py-3 font-semibold text-plum-600 transition duration-200 hover:border-plum-400 hover:text-plum-800 active:scale-[0.98]"
              >
                Find your match
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Favourites */}
      <section className="section py-16 sm:py-20">
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

        <div className="mt-10 flex flex-wrap justify-center gap-10 sm:gap-14">
          {favourites.map((product, i) => {
            const heartClipId = `fav-heart-${product.slug}`
            return (
              <Link
                key={product.slug}
                to={`/product/${product.slug}`}
                className="group w-44 sm:w-52"
              >
                <div
                  className={`relative transition duration-300 group-hover:scale-[1.03] ${
                    i % 2 === 0 ? 'animate-float' : 'animate-float-reverse'
                  }`}
                  style={{ aspectRatio: '100 / 90' }}
                >
                  {product.badge && (
                    <span className="absolute left-2 top-0 z-10 rounded-full bg-gold-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                      {product.badge}
                    </span>
                  )}
                  <svg width="0" height="0" className="absolute">
                    <defs>
                      <clipPath id={heartClipId} clipPathUnits="objectBoundingBox">
                        <path d={HEART_CLIP_PATH} />
                      </clipPath>
                    </defs>
                  </svg>
                  <img
                    src={product.image}
                    alt={`${product.name}, ${product.style} lashes by HelloQT`}
                    width="1080"
                    height="1080"
                    style={{ clipPath: `url(#${heartClipId})` }}
                    className="h-full w-full bg-white object-contain"
                  />
                  <svg
                    viewBox="0 0 100 90"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full text-blush-500"
                  >
                    <path
                      d={HEART_OUTLINE_PATH}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <p className="mt-1.5 text-center">
                  <span className="block font-display text-sm font-bold text-plum-800">
                    {product.name}
                  </span>
                  <span className="text-xs text-plum-500">{product.style}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-blush-700 transition group-hover:text-blush-800">
                    {formatPrice(product.price)} · Shop &rarr;
                  </span>
                </p>
              </Link>
            )
          })}
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

        <div className="section mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map(({ emoji, title, body }) => (
            <div
              key={title}
              className="rounded-3xl bg-white p-6 text-center shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-lift"
            >
              <span
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush-50 text-2xl"
                role="img"
                aria-hidden="true"
              >
                {emoji}
              </span>
              <h3 className="mt-3 font-display text-base font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-snug text-plum-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Founder note, styled like a real letter */}
      <section className="section py-16 sm:py-20">
        <FounderLetter />
      </section>

      {/* QT Collection showcase */}
      <section className="section py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blush-600 lg:justify-start">
              <SparkleIcon className="h-4 w-4" />
              Only at HelloQT
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Track every wear</h2>
            <p className="mx-auto mt-4 max-w-md text-plum-600 lg:mx-0">
              Every account gets its own QT Collection - see every lash you&apos;ve bought, log
              each wear with a tap, watch your count grow, and prepare to be amazed at how many
              wears you actually get out of one pair.
            </p>
            <Link to="/login" className="btn-secondary mt-6 inline-flex">
              Create your account
            </Link>
          </div>

          {/* Illustrative preview - not a live account */}
          <div className="mx-auto w-full max-w-sm rounded-3xl border border-blush-200 bg-white p-5 shadow-lift">
            <div className="flex gap-4">
              <img
                src="/media/angel.JPG"
                alt=""
                width="80"
                height="80"
                className="h-20 w-20 shrink-0 rounded-2xl border border-blush-200 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-plum-900">Angel</p>
                <p className="text-xs text-plum-500">Purchased 12 Sept 2026</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-plum-600">
                    <span>8 / 25 wears</span>
                    <span>Last worn 2 days ago</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-blush-100">
                    <div className="h-full w-[32%] rounded-full bg-blush-500" />
                  </div>
                </div>
                <p className="mt-2.5 text-sm font-medium text-blush-700">Still going strong ✨</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blush-600 px-4 py-2.5 text-sm font-semibold text-white">
              + Wore today
            </span>
          </div>
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

      {/* FAQ */}
      <section className="section py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <FaqAccordion />
        </div>
      </section>

      {/* CTA */}
      <section className="section pt-16 sm:pt-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush-200 via-blush-300 to-gold-200 px-8 py-12 text-center sm:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/30 blur-2xl"
          />
          <h2 className="relative font-display text-3xl font-bold text-plum-900 sm:text-4xl">
            Ready to find your signature lash?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-plum-700">
            UK delivery only, free over £40. Reusable up to 25 times.
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
    </>
  )
}
