import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AiLashChat from './components/AiLashChat'
import DiscountPopup from './components/DiscountPopup'
import CustomCursor from './components/CustomCursor'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import About from './pages/About'
import Contact from './pages/Contact'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import Account from './pages/Account'
import Review from './pages/Review'

// Scrolls to top on route change, or to a hash anchor
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

// Root layout: navbar, page routes, footer, AI chat
export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <Navbar />
      <main id="main" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<Account />} />
          <Route path="/review/:orderRef" element={<Review />} />
        </Routes>
      </main>
      <Footer />
      <AiLashChat />
      <DiscountPopup />
      <CustomCursor />
    </div>
  )
}
