import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProduct, products } from '../data/products'
import { formatPrice, useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard'
import {
  ArrowLeftIcon,
  BagIcon,
  CheckIcon,
  LeafIcon,
  RepeatIcon,
  StarIcon,
  TruckIcon,
} from '../components/Icons'

// Single product page with gallery, specs, and add-to-cart
export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const product = getProduct(slug)
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="section py-24 text-center">
        <h1 className="font-display text-3xl font-bold">We can’t find that lash</h1>
        <p className="mt-3 text-plum-600">It may have sold out or the link is out of date.</p>
        <Link to="/shop" className="btn-primary mt-8">
          Back to the collection
        </Link>
      </div>
    )
  }

  // Adds the chosen quantity to the cart and shows confirmation
  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2200)
  }

  const specs = [
    { label: 'Style', value: product.style },
    { label: 'Length', value: product.length },
    { label: 'Curl', value: product.curl },
    { label: 'Material', value: product.material },
    { label: 'Reusable', value: product.wears },
    { label: 'Band', value: 'Soft cotton, flexible' },
    { label: 'Glue', value: 'Not included' },
  ]

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 4)

  return (
    <div className="section py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-plum-500">
          <li>
            <Link to="/" className="transition hover:text-blush-700">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/shop" className="transition hover:text-blush-700">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-plum-700" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-5 inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-semibold text-blush-700 transition hover:text-blush-800"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back
      </button>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative">
          <img
            src={product.image}
            alt={`${product.name}, ${product.style} lashes by HelloQT`}
            width="800"
            height="800"
            className="aspect-square w-full rounded-[2rem] border border-blush-200 bg-white object-cover shadow-soft"
          />
          {product.badge && (
            <span className="absolute left-5 top-5 rounded-full bg-gold-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              {product.badge}
            </span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blush-600">
            {product.style}
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex" role="img" aria-label="Rated 4.9 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="h-4 w-4 text-gold-400" />
              ))}
            </div>
            <span className="text-sm text-plum-500">4.9 · 38 reviews</span>
          </div>

          <p className="mt-5 font-display text-3xl font-bold text-plum-900">
            {formatPrice(product.price)}
          </p>

          <p className="mt-4 text-lg leading-relaxed text-plum-700">{product.tagline}</p>
          <p className="mt-3 leading-relaxed text-plum-600">{product.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border-2 border-blush-200 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-xl font-bold text-plum-600 transition hover:bg-blush-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span
                className="w-10 text-center font-display text-lg font-bold tabular-nums"
                aria-live="polite"
                aria-label={`Quantity: ${quantity}`}
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                disabled={quantity >= 10}
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-xl font-bold text-plum-600 transition hover:bg-blush-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button type="button" onClick={handleAdd} className="btn-primary flex-1 sm:flex-none">
              {added ? <CheckIcon className="h-5 w-5" /> : <BagIcon className="h-5 w-5" />}
              {added ? 'Added to basket' : 'Add to basket'}
            </button>
          </div>

          <p className="sr-only" role="status">
            {added ? `${product.name} added to your basket` : ''}
          </p>

          <div className="mt-7 grid gap-3 rounded-3xl border border-blush-200 bg-blush-50/70 p-5 sm:grid-cols-3">
            {[
              { icon: LeafIcon, text: 'Cruelty-free' },
              { icon: RepeatIcon, text: product.wears },
              { icon: TruckIcon, text: 'Free over £40' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm font-semibold text-plum-700">
                <Icon className="h-5 w-5 shrink-0 text-blush-600" />
                {text}
              </div>
            ))}
          </div>

          <dl className="mt-8 divide-y divide-blush-200 border-y border-blush-200">
            {specs.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-6 py-3.5">
                <dt className="text-sm font-semibold text-plum-500">{spec.label}</dt>
                <dd className="text-sm font-semibold text-plum-800">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-bold">You may also love</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
