import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SparkleIcon, TruckIcon, UserIcon } from './Icons'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const accountLinks = [
  { to: '/account/collection', label: 'My Collection', icon: SparkleIcon },
  { to: '/account/orders', label: 'My Orders', icon: TruckIcon },
  { to: '/account/favourites', label: 'Favourites', icon: HeartIcon },
  { to: '/account/details', label: 'My Details', icon: UserIcon },
]

// Sticky site header with nav links, cart badge, mobile menu
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { user, signOut } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleLogOut = () => {
    setOpen(false)
    signOut()
    navigate('/')
  }

  useEffect(() => setOpen(false), [pathname])

  const navClass = ({ isActive }) =>
    [
      'relative rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition',
      isActive
        ? 'text-blush-700 after:absolute after:inset-x-4 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-blush-500'
        : 'text-plum-600 hover:text-blush-700',
    ].join(' ')

  return (
    <header className="sticky top-0 z-40 border-b border-blush-200/70 bg-cream/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-blush-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="section flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" aria-label="HelloQT home">
          <img
            src="/media/helloqtlogo.JPG"
            alt=""
            width="40"
            height="40"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-300"
          />
          <span className="font-display text-lg font-bold text-plum-900">HelloQT</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            to={user ? '/account' : '/login'}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-plum-700 transition hover:bg-blush-100 hover:text-blush-700"
            aria-label={user ? 'Your account' : 'Log in'}
          >
            <UserIcon className="h-5 w-5" />
          </Link>

          <Link
            to="/cart"
            className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-plum-700 transition hover:bg-blush-100 hover:text-blush-700"
            aria-label={count > 0 ? `Basket, ${count} items` : 'Basket, empty'}
          >
            <BagIcon className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blush-600 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-plum-700 transition hover:bg-blush-100 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-blush-200 bg-cream px-5 pb-4 pt-2 md:hidden"
          aria-label="Mobile"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                [
                  'flex min-h-[48px] items-center rounded-2xl px-4 text-base font-semibold transition',
                  isActive ? 'bg-blush-100 text-blush-700' : 'text-plum-700 hover:bg-blush-50',
                ].join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}

          {user && (
            <div className="mt-3 border-t border-blush-200 pt-3">
              <p className="px-4 text-xs font-semibold uppercase tracking-wide text-plum-400">
                Account
              </p>
              {accountLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'mt-1 flex min-h-[48px] items-center gap-2.5 rounded-2xl px-4 text-base font-semibold transition',
                      isActive ? 'bg-blush-100 text-blush-700' : 'text-plum-700 hover:bg-blush-50',
                    ].join(' ')
                  }
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleLogOut}
                className="mt-1 flex min-h-[48px] w-full items-center rounded-2xl px-4 text-base font-semibold text-plum-700 transition hover:bg-blush-50"
              >
                Log out
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
