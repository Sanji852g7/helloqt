import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useQuiz } from '../context/QuizContext'
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SparkleIcon, TruckIcon, UserIcon } from './Icons'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

const accountLinks = [
  { to: '/account/collection', label: 'My QT Collection', icon: SparkleIcon },
  { to: '/account/orders', label: 'My Orders', icon: TruckIcon },
  { to: '/account/favourites', label: 'Favourites', icon: HeartIcon },
  { to: '/account/details', label: 'My Details', icon: UserIcon },
]

// Sticky site header with nav links, cart badge, mobile menu
// A press has to release within this many pixels of where it started to
// count as a tap - further than that and it's a drag/swipe passing over the
// button (mouse or touch - pointer events cover both)
const TAP_TOLERANCE = 10

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { user, signOut } = useAuth()
  const { openQuiz } = useQuiz()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const pointerStartRef = useRef(null)
  const handledByPointerRef = useRef(false)

  const handleLogOut = () => {
    setOpen(false)
    signOut()
    navigate('/')
  }

  const handleFindMatch = () => {
    setOpen(false)
    openQuiz()
  }

  const handleMenuPointerDown = (e) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMenuPointerUp = (e) => {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (!start) return
    const movedTooFar =
      Math.abs(e.clientX - start.x) > TAP_TOLERANCE ||
      Math.abs(e.clientY - start.y) > TAP_TOLERANCE
    // Either way, the click that follows this pointer sequence is already decided here
    handledByPointerRef.current = true
    if (!movedTooFar) setOpen((v) => !v)
  }

  const handleMenuClick = () => {
    // Skip a click that already came from a pointer tap/drag we just judged above -
    // this only fires standalone for keyboard activation (Enter/Space), which has no pointer events
    if (handledByPointerRef.current) {
      handledByPointerRef.current = false
      return
    }
    setOpen((v) => !v)
  }

  useEffect(() => setOpen(false), [pathname])

  // Stops the page scrolling behind the drawer while it's open, by
  // cancelling the wheel/touch/keyboard events that would cause it, rather
  // than touching body/html's own CSS. Both overflow:hidden and
  // position:fixed on body break the header's position:sticky - sticky
  // needs a genuinely scrolling ancestor to compute against, and freezing
  // body removes that, so the header renders at its natural (and, once
  // scrolled down, off-screen) position instead of pinned to the viewport.
  //
  // Scrolling inside the drawer itself is only let through as far as the
  // drawer's own content actually has room to move - CSS overscroll-behavior
  // is meant to stop it chaining through to the page past that point, but
  // isn't reliable enough here (the drawer's own list is almost always
  // shorter than the drawer, i.e. nothing to scroll at all), so the bounds
  // are also checked by hand before letting an event through.
  useEffect(() => {
    if (!open) return
    const nav = document.getElementById('mobile-nav')

    const drawerHasRoom = (deltaY) => {
      if (!nav || nav.scrollHeight <= nav.clientHeight) return false
      if (deltaY < 0) return nav.scrollTop > 0
      return nav.scrollTop + nav.clientHeight < nav.scrollHeight
    }

    const preventWheel = (e) => {
      if (nav?.contains(e.target) && drawerHasRoom(e.deltaY)) return
      e.preventDefault()
    }

    let touchStartY = null
    const onTouchStart = (e) => {
      touchStartY = e.touches[0]?.clientY ?? null
    }
    const preventTouchMove = (e) => {
      const currentY = e.touches[0]?.clientY ?? touchStartY
      const deltaY = touchStartY === null ? 0 : touchStartY - currentY
      if (nav?.contains(e.target) && drawerHasRoom(deltaY)) {
        touchStartY = currentY
        return
      }
      e.preventDefault()
    }

    const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
    const preventKeyScroll = (e) => {
      if (scrollKeys.includes(e.key) && !nav?.contains(e.target)) e.preventDefault()
    }

    document.addEventListener('wheel', preventWheel, { passive: false })
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', preventTouchMove, { passive: false })
    document.addEventListener('keydown', preventKeyScroll)
    return () => {
      document.removeEventListener('wheel', preventWheel)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', preventTouchMove)
      document.removeEventListener('keydown', preventKeyScroll)
    }
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-blush-200/70 bg-cream/85 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-blush-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
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
            onClick={handleMenuClick}
            onPointerDown={handleMenuPointerDown}
            onPointerUp={handleMenuPointerUp}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-plum-700 transition hover:bg-blush-100"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Dims the rest of the page behind the drawer, and closes it on tap */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 top-16 z-30 bg-plum-900/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        aria-hidden={!open}
        className={`fixed right-0 top-16 z-40 h-[calc(100dvh-4rem)] w-1/2 max-w-xs overflow-y-auto overscroll-contain border-l border-blush-200 bg-cream px-5 pb-6 pt-3 shadow-lift transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
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

          <button
            type="button"
            onClick={handleFindMatch}
            className="mt-1 flex min-h-[48px] w-full items-center gap-2.5 rounded-2xl px-4 text-base font-semibold text-plum-700 transition hover:bg-blush-50"
          >
            <SparkleIcon className="h-4 w-4" />
            Find your match
          </button>

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
        </div>
      </nav>
    </header>
  )
}
