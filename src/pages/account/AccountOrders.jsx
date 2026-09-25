import { Link } from 'react-router-dom'
import { formatPrice } from '../../context/CartContext'
import { TruckIcon } from '../../components/Icons'
import {
  BackToAccount,
  OrderItemThumbnail,
  OrderTracker,
  ReviewButton,
  royalMailTrackingUrl,
} from './shared'
import { useAccountData } from './AccountLayout'

// /account/orders: every order this customer has placed, with tracking and
// a one-click review link once it's delivered
export default function AccountOrders() {
  const { orders, ordersLoading } = useAccountData()

  return (
    <div>
      <BackToAccount />

      <div className="mt-3 rounded-3xl border border-blush-200 bg-white p-7 shadow-soft">
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

                <OrderTracker status={order.status} />

                {order.tracking_number && (
                  <a
                    href={royalMailTrackingUrl(order.tracking_number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-blush-50 px-4 py-2 text-sm font-semibold text-blush-700 transition hover:bg-blush-100"
                  >
                    <TruckIcon className="h-4 w-4" />
                    Track with Royal Mail · {order.tracking_number}
                  </a>
                )}

                {order.status === 'delivered' && <ReviewButton orderRef={order.order_ref} />}

                <ul className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <li key={item.slug} className="flex items-center gap-3">
                      <OrderItemThumbnail src={item.image} alt={`${item.name} lashes`} />
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
    </div>
  )
}
