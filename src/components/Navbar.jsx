import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { BagIcon, CloseIcon, MenuIcon } from './Icons'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

// Sticky site header with nav links, cart badge, mobile menu
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { pathname } = useLocation()

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

      <div className="section flex h-[76px] items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3" aria-label="HelloQT home">
          <img
            src="/media/helloqtlogo.JPG"
            alt=""
            width="48"
            height="48"
            className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-300"
          />
          <span className="font-display text-xl font-bold text-plum-900">HelloQT</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-plum-700 transition hover:bg-blush-100 hover:text-blush-700"
            aria-label={count > 0 ? `Basket, ${count} items` : 'Basket, empty'}
          >
            <BagIcon className="h-6 w-6" />
            {count > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blush-600 px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-plum-700 transition hover:bg-blush-100 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
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
        </nav>
      )}
    </header>
  )
}
