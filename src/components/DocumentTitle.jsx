import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getProduct } from '../data/products'

const SITE_TITLE = 'HelloQT - Made to make you feel QT'

const TITLES = {
  '/': 'HelloQT 💕',
  '/shop': 'Shop lashes 🛍️',
  '/cart': 'Your basket 🛍️',
  '/checkout': 'Checkout 💳',
  '/checkout/success': 'Order confirmed 💕',
  '/about': 'My story 💌',
  '/contact': 'Get in touch 💬',
  '/privacy': 'Privacy policy',
  '/terms': 'Terms',
  '/login': 'Log in 💕',
  '/reset-password': 'Reset your password',
  '/account': 'Your account 💕',
  '/account/collection': 'My QT Collection ✨',
  '/account/orders': 'My orders 📦',
  '/account/favourites': 'Favourites 💗',
  '/account/details': 'My details',
}

// Sets a playful, page-specific browser tab title on every route change -
// the tag in index.html only ever covers the very first load
export default function DocumentTitle() {
  const { pathname } = useLocation()

  useEffect(() => {
    const productSlug = pathname.match(/^\/product\/([^/]+)$/)?.[1]
    const product = productSlug ? getProduct(productSlug) : null

    if (product) {
      document.title = `${product.name} lashes 💕 · HelloQT`
    } else if (pathname.startsWith('/review/')) {
      document.title = `Leave a review 💕 · HelloQT`
    } else if (TITLES[pathname]) {
      document.title = `${TITLES[pathname]} · HelloQT`
    } else {
      document.title = SITE_TITLE
    }
  }, [pathname])

  return null
}
