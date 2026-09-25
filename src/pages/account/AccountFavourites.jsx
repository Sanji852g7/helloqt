import { Link } from 'react-router-dom'
import { HeartIcon } from '../../components/Icons'
import { BackToAccount } from './shared'

// /account/favourites: the section exists, but saving a favourite from the
// shop isn't built yet - so it's always this empty state for now
export default function AccountFavourites() {
  return (
    <div>
      <BackToAccount />

      <div className="mt-3 rounded-3xl border border-blush-200 bg-white p-7 shadow-soft text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush-50 text-blush-400">
          <HeartIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold">No favourites yet</h2>
        <p className="mt-1.5 text-sm text-plum-500">
          Saving a lash to your favourites is coming soon. For now, have a browse.
        </p>
        <Link to="/shop" className="btn-primary mt-5">
          Go to shop
        </Link>
      </div>
    </div>
  )
}
