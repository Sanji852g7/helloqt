import { Link } from 'react-router-dom'
import { formatPrice, useCart } from '../context/CartContext'
import { ArrowRightIcon, BagIcon, LockIcon, TrashIcon } from '../components/Icons'

// Basket page listing cart items with quantity controls
export default function Cart() {
  const { items, subtotal, shipping, total, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="section py-20 text-center sm:py-28">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blush-100 text-blush-500">
          <BagIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">Your basket is empty</h1>
        <p className="mx-auto mt-3 max-w-md text-plum-600">
          Nothing in here yet. Have a browse, there is a lash for every mood.
        </p>
        <Link to="/shop" className="btn-primary mt-8">
          Shop the collection
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  const remaining = 40 - subtotal

  return (
    <div className="section py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Your basket</h1>
      <p className="mt-2 text-plum-600">
        {items.length} {items.length === 1 ? 'style' : 'styles'} ready to go.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-blush-200 border-y border-blush-200">
          {items.map((item) => (
            <li key={item.slug} className="flex gap-4 py-6 sm:gap-6">
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <img
                  src={item.image}
                  alt={`${item.name} lashes`}
                  width="160"
                  height="160"
                  className="h-24 w-24 rounded-2xl border border-blush-200 bg-white object-cover sm:h-32 sm:w-32"
                />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold">
                      <Link to={`/product/${item.slug}`} className="transition hover:text-blush-700">
                        {item.name}
                      </Link>
                    </h2>
                    <p className="mt-0.5 text-sm text-plum-500">{item.style}</p>
                  </div>
                  <p className="font-display text-lg font-bold tabular-nums text-plum-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                  <div className="flex items-center rounded-full border border-blush-200 bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-lg font-bold text-plum-600 transition hover:bg-blush-50"
                      aria-label={`Decrease ${item.name} quantity`}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-lg font-bold text-plum-600 transition hover:bg-blush-50"
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.slug)}
                    className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-plum-500 transition hover:bg-blush-50 hover:text-blush-700"
                    aria-label={`Remove ${item.name} from basket`}
                  >
                    <TrashIcon className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-3xl border border-blush-200 bg-white p-7 shadow-soft lg:sticky lg:top-28">
          <h2 className="font-display text-xl font-bold">Order summary</h2>

          <dl className="mt-6 space-y-3 text-sm">
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
          </dl>

          {remaining > 0 && (
            <div className="mt-5 rounded-2xl bg-blush-50 p-4">
              <p className="text-sm text-plum-700">
                Spend <strong>{formatPrice(remaining)}</strong> more for free UK delivery.
              </p>
              <div
                className="mt-2.5 h-2 overflow-hidden rounded-full bg-blush-200"
                role="progressbar"
                aria-valuenow={Math.round((subtotal / 40) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress towards free delivery"
              >
                <div
                  className="h-full rounded-full bg-blush-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / 40) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-between border-t border-blush-200 pt-5">
            <span className="font-display text-lg font-bold">Total</span>
            <span className="font-display text-lg font-bold tabular-nums">
              {formatPrice(total)}
            </span>
          </div>

          <Link to="/checkout" className="btn-primary mt-6 w-full">
            <LockIcon className="h-4 w-4" />
            Checkout
          </Link>

          <Link
            to="/shop"
            className="mt-3 flex min-h-[44px] items-center justify-center text-sm font-semibold text-blush-700 transition hover:text-blush-800"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}
