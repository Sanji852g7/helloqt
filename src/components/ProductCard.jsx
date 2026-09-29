import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, useCart } from '../context/CartContext'
import { getCollection } from '../data/products'
import { playPop } from '../lib/sound'
import FavouriteButton from './FavouriteButton'
import { BagIcon, CheckIcon } from './Icons'

// The heart-shaped image frame used on the homepage favourites - moved here
// from the old hero collage so it can be reused on any card via `heartImage`
const HEART_CLIP_PATH =
  'M0.5,0.978 C0.22,0.756 0.06,0.533 0.06,0.333 C0.06,0.167 0.18,0.044 0.32,0.044 C0.40,0.044 0.47,0.089 0.5,0.167 C0.53,0.089 0.60,0.044 0.68,0.044 C0.82,0.044 0.94,0.167 0.94,0.333 C0.94,0.533 0.78,0.756 0.5,0.978 Z'
const HEART_OUTLINE_PATH =
  'M50,88 C22,68 6,48 6,30 C6,15 18,4 32,4 C40,4 47,8 50,15 C53,8 60,4 68,4 C82,4 94,15 94,30 C94,48 78,68 50,88 Z'

// Shows one product's image, price, and add-to-cart button. The favourite
// heart defaults to the size used on Shop's wide grid - pass `compact` for
// denser grids (like the account pages) where that size looks oversized.
// Pass `heartImage` to frame the photo in the heart shape instead of a plain square.
export default function ProductCard({ product, compact = false, heartImage = false }) {
  const { addItem } = useCart()
  const collection = getCollection(product.collection)
  const [added, setAdded] = useState(false)
  const heartClipId = `heart-clip-${product.slug}`

  const handleAdd = () => {
    addItem(product)
    playPop()
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-blush-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:rotate-[-0.4deg] hover:border-blush-300 hover:shadow-lift">
      <Link
        to={`/product/${product.slug}`}
        className="block overflow-hidden bg-white"
        aria-label={`View ${product.name} lashes`}
      >
        {heartImage ? (
          <div className="relative aspect-square w-full">
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
              width="600"
              height="600"
              loading="lazy"
              style={{ clipPath: `url(#${heartClipId})` }}
              className="h-full w-full bg-white object-contain transition duration-500 group-hover:scale-105"
            />
            <svg
              viewBox="0 0 100 90"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full text-blush-500"
            >
              <path d={HEART_OUTLINE_PATH} fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        ) : (
          <img
            src={product.image}
            alt={`${product.name}, ${product.style} lashes by HelloQT`}
            width="600"
            height="600"
            loading="lazy"
            className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </Link>

      <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
        {product.badge && (
          <span className="rounded-full bg-gold-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            {product.badge}
          </span>
        )}
      </div>

      <FavouriteButton
        slug={product.slug}
        iconClassName={compact ? 'h-5 w-5' : 'h-8 w-8 sm:h-9 sm:w-9 lg:h-11 lg:w-11'}
        className={
          compact
            ? 'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-blush-600 backdrop-blur-sm transition hover:bg-white'
            : 'absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/85 text-blush-600 backdrop-blur-sm transition hover:bg-white sm:h-16 sm:w-16 lg:h-20 lg:w-20'
        }
      />

      <span
        className={
          compact
            ? 'absolute right-3 top-14 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-plum-700 backdrop-blur-sm'
            : 'absolute right-4 top-20 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-plum-700 backdrop-blur-sm sm:top-24 lg:top-28'
        }
      >
        {collection?.volume} · {product.length}
      </span>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl font-bold">
          <Link
            to={`/product/${product.slug}`}
            className="transition hover:text-blush-700 focus-visible:text-blush-700"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 flex-1 text-sm font-semibold text-blush-600">{product.style}</p>

        <div className={compact ? 'mt-3 flex flex-col gap-2' : 'mt-3 flex items-center justify-between gap-3'}>
          <p className="font-display text-lg font-bold text-plum-900">
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            onClick={handleAdd}
            className={`inline-flex min-h-[44px] cursor-pointer items-center rounded-full bg-blush-600 font-semibold text-white transition duration-200 hover:bg-blush-700 active:scale-[0.97] ${compact ? 'w-full justify-center gap-1.5 px-3 text-xs' : 'gap-2 px-4 text-sm'} ${added ? 'animate-add-pop' : ''}`}
            aria-label={`Add ${product.name} to basket`}
          >
            {added ? (
              <CheckIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            ) : (
              <BagIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            )}
            {added ? 'Added!' : 'Add to basket'}
          </button>
        </div>
        <p className="mt-2 text-xs text-plum-400">Lash glue not included</p>
      </div>
    </article>
  )
}
