import { Link } from 'react-router-dom'
import { formatPrice, useCart } from '../context/CartContext'
import { getCollection } from '../data/products'
import { BagIcon } from './Icons'

// Shows one product's image, price, and add-to-cart button
export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const collection = getCollection(product.collection)

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-blush-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:rotate-[-0.4deg] hover:border-blush-300 hover:shadow-lift">
      <Link
        to={`/product/${product.slug}`}
        className="block overflow-hidden bg-white"
        aria-label={`View ${product.name} lashes`}
      >
        <img
          src={product.image}
          alt={`${product.name}, ${product.style} lashes by HelloQT`}
          width="600"
          height="600"
          loading="lazy"
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="absolute left-4 top-4 flex flex-col items-start gap-1.5">
        {product.badge && (
          <span className="rounded-full bg-gold-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            {product.badge}
          </span>
        )}
      </div>

      <span className="absolute right-4 top-4 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-plum-700 backdrop-blur-sm">
        {collection?.volume} · {product.length}
      </span>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-blush-600">
          {product.style}
        </p>
        <h3 className="mt-1.5 font-display text-xl font-bold">
          <Link
            to={`/product/${product.slug}`}
            className="transition hover:text-blush-700 focus-visible:text-blush-700"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-plum-600">{product.tagline}</p>
        <p className="mt-1.5 text-xs text-plum-400">Lash glue not included</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-display text-lg font-bold text-plum-900">
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-blush-600 px-4 text-sm font-semibold text-white transition duration-200 hover:bg-blush-700 active:scale-[0.97]"
            aria-label={`Add ${product.name} to basket`}
          >
            <BagIcon className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  )
}
