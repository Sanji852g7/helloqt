import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { HeartIcon, SparkleIcon, TruckIcon, UserIcon } from '../../components/Icons'
import { useAccountData } from './AccountLayout'

// Dashboard shown at /account: a tile per section, so a customer can jump
// straight to what they want instead of scrolling one long page
export default function AccountOverview() {
  const { user, orders, ordersLoading, profile } = useAccountData()
  const [pairCount, setPairCount] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('lash_collection')
      .select('id', { count: 'exact', head: true })
      .eq('archived', false)
      .then(({ count, error }) => {
        if (error) console.error('[helloqt] failed to load collection count:', error.message)
        setPairCount(count ?? 0)
      })
  }, [user])

  const tiles = [
    {
      to: '/account/collection',
      icon: SparkleIcon,
      label: 'My QT Collection',
      detail: pairCount === null ? '…' : `${pairCount} pair${pairCount === 1 ? '' : 's'}`,
    },
    {
      to: '/account/orders',
      icon: TruckIcon,
      label: 'My Orders',
      detail: ordersLoading ? '…' : `${orders.length} order${orders.length === 1 ? '' : 's'}`,
    },
    {
      to: '/account/favourites',
      icon: HeartIcon,
      label: 'Favourites',
      detail: 'Coming soon',
    },
    {
      to: '/account/details',
      icon: UserIcon,
      label: 'My Details',
      detail: profile?.address1 ? 'Edit profile' : 'Add your details',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {tiles.map((tile) => (
        <Link
          key={tile.to}
          to={tile.to}
          className="group flex flex-col gap-3 rounded-3xl border border-blush-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-blush-300 hover:shadow-lift"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blush-50 text-blush-600 transition group-hover:bg-blush-100">
            <tile.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-base font-bold text-plum-900">{tile.label}</p>
            <p className="mt-0.5 text-sm text-plum-500">{tile.detail}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
