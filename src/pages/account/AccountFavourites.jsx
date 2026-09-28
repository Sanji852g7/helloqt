import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { getProduct } from '../../data/products'
import ProductCard from '../../components/ProductCard'
import { HeartIcon } from '../../components/Icons'
import { BackToAccount } from './shared'
import { useAccountData } from './AccountLayout'

// /account/favourites: every lash this customer has saved with the heart
// button on the shop and product pages
export default function AccountFavourites() {
  const { user } = useAccountData()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('favourites')
      .select('product_slug')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('[helloqt] failed to load favourites:', error.message)
        setProducts((data ?? []).map((row) => getProduct(row.product_slug)).filter(Boolean))
        setLoading(false)
      })
  }, [user])

  return (
    <div>
      <BackToAccount />

      <div className="mt-3">
        <h2 className="font-display text-xl font-bold">Favourites</h2>

        {loading ? (
          <p className="mt-4 text-sm text-plum-600">Loading your favourites…</p>
        ) : products.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-blush-200 bg-white p-8 text-center shadow-soft">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush-50 text-blush-400">
              <HeartIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">No favourites yet</h3>
            <p className="mt-1.5 text-sm text-plum-500">
              Tap the heart on any lash you love to save it here.
            </p>
            <Link to="/shop" className="btn-primary mt-5">
              Go to shop
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
