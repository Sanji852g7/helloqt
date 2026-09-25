import { Link } from 'react-router-dom'
import { getProduct } from '../../data/products'
import ProductCard from '../../components/ProductCard'
import { BackToAccount } from './shared'
import { useAccountData } from './AccountLayout'

// /account/collection: every distinct lash this customer has bought before,
// pulled from their order history - a quick way to spot an old favourite
// and reorder it, no new data of its own
export default function AccountCollection() {
  const { orders, ordersLoading } = useAccountData()

  const slugs = [...new Set(orders.flatMap((order) => order.items.map((item) => item.slug)))]
  const products = slugs.map(getProduct).filter(Boolean)

  return (
    <div>
      <BackToAccount />

      <div className="mt-3 rounded-3xl border border-blush-200 bg-white p-7 shadow-soft">
        <h2 className="font-display text-xl font-bold">My collection</h2>
        <p className="mt-1 text-sm text-plum-500">Every lash you've bought so far.</p>

        {ordersLoading ? (
          <p className="mt-4 text-sm text-plum-600">Loading your collection…</p>
        ) : products.length === 0 ? (
          <p className="mt-4 text-sm text-plum-600">
            Nothing here yet.{' '}
            <Link to="/shop" className="font-semibold text-blush-700 hover:text-blush-800">
              Go find your first lash
            </Link>
            .
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
