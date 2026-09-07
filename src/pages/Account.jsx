import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../context/CartContext'
import { supabase } from '../lib/supabaseClient'

// Account page showing the logged-in user's details and orders
export default function Account() {
  const { user, loading, signOut } = useAuth()
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('[helloqt] failed to load orders:', error.message)
        setOrders(data ?? [])
        setOrdersLoading(false)
      })
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="section py-12 sm:py-16">
      <h1 className="font-display text-4xl font-bold sm:text-5xl">Your account</h1>
      <p className="mt-2 text-plum-600">{user.email}</p>

      <div className="mt-8 rounded-3xl border border-blush-200 bg-white p-7 shadow-soft">
        <h2 className="font-display text-xl font-bold">Your orders</h2>

        {ordersLoading ? (
          <p className="mt-2 text-sm text-plum-600">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <p className="mt-2 text-sm text-plum-600">
            No orders yet.{' '}
            <Link to="/shop" className="font-semibold text-blush-700 hover:text-blush-800">
              Go find your lash
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-blush-200">
            {orders.map((order) => (
              <li key={order.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-plum-800">{order.order_ref}</p>
                  <p className="text-sm text-plum-500">
                    Order placed on{' '}
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <ul className="mt-3 space-y-3">
                  {order.items.map((item) => (
                    <li key={item.slug} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={`${item.name} lashes`}
                        width="56"
                        height="56"
                        className="h-14 w-14 shrink-0 rounded-xl border border-blush-200 bg-white object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-plum-800">{item.name}</p>
                        <p className="text-sm text-plum-500">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-plum-700">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-sm font-semibold text-plum-800">
                  Total: {formatPrice(order.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" onClick={signOut} className="btn-secondary mt-6">
        Log out
      </button>
    </div>
  )
}
