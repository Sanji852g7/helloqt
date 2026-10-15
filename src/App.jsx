import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import AnnouncementBar from './components/AnnouncementBar'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AiLashChat from './components/AiLashChat'
import DiscountPopup from './components/DiscountPopup'
import CustomCursor from './components/CustomCursor'
import DocumentTitle from './components/DocumentTitle'
import PinterestPageTracker from './components/PinterestPageTracker'
import GoogleAnalyticsTracker from './components/GoogleAnalyticsTracker'
import LashQuiz from './components/LashQuiz'
import { useQuiz } from './context/QuizContext'

// Each page loads as its own small file, fetched only when someone
// actually visits it - a visitor landing on the homepage was previously
// downloading the checkout, account and every other page's code upfront
// too, all bundled into one 560kB+ file
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Login = lazy(() => import('./pages/Login'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'))
const AccountOverview = lazy(() => import('./pages/account/AccountOverview'))
const AccountOrders = lazy(() => import('./pages/account/AccountOrders'))
const AccountDetails = lazy(() => import('./pages/account/AccountDetails'))
const AccountCollection = lazy(() => import('./pages/account/AccountCollection'))
const AccountFavourites = lazy(() => import('./pages/account/AccountFavourites'))
const Review = lazy(() => import('./pages/Review'))

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
  const { quizOpen, closeQuiz } = useQuiz()

  return (
    <div className="flex min-h-dvh flex-col">
      <ScrollToTop />
      <DocumentTitle />
      <GoogleAnalyticsTracker />
      <PinterestPageTracker />
      <div className="sticky top-0 z-40">
        <AnnouncementBar />
        <Navbar />
      </div>
      <main id="main" className="flex-1">
        <Suspense fallback={null}>
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
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<AccountOverview />} />
              <Route path="orders" element={<AccountOrders />} />
              <Route path="details" element={<AccountDetails />} />
              <Route path="collection" element={<AccountCollection />} />
              <Route path="favourites" element={<AccountFavourites />} />
            </Route>
            <Route path="/review/:orderRef" element={<Review />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <AiLashChat />
      <DiscountPopup />
      <CustomCursor />
      <LashQuiz open={quizOpen} onClose={closeQuiz} />
    </div>
  )
}
