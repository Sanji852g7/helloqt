import { Link } from 'react-router-dom'
import { InstagramIcon, MailIcon, PinIcon } from './Icons'

// Site footer with brand blurb, nav links, and contact info
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-blush-200 bg-gradient-to-b from-blush-50 to-blush-100">
      <div className="section grid grid-cols-2 gap-8 py-10 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/media/helloqtlogo.JPG"
              alt=""
              width="40"
              height="40"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-300"
            />
            <span className="font-display text-lg font-bold text-plum-900">HelloQT</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-plum-600">
            Handcrafted, reusable and cruelty-free lashes, packed with love by me.
          </p>
          <p className="mt-2 font-script text-lg text-plum-500">xo, Sanji</p>
        </div>

        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className="font-display text-base font-bold text-plum-900">
            Shop
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {[
              { to: '/shop', label: 'All lashes' },
              {
                to: '/shop?collection=suitcase#suitcase',
                label: 'Vol. 01, The QT Luggage Set',
              },
              { to: '/shop?collection=compact#compact', label: 'Vol. 02, The QT Vanity Set' },
              { to: '/cart', label: 'Your basket' },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="inline-block py-1 text-plum-600 transition hover:text-blush-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-help">
          <h2 id="footer-help" className="font-display text-base font-bold text-plum-900">
            Help
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {[
              { to: '/about', label: 'My story' },
              { to: '/contact', label: 'Contact us' },
              { to: '/contact#faq', label: 'Delivery & returns' },
              { to: '/about#care', label: 'Lash care guide' },
            ].map((item, i) => (
              <li key={`${item.label}-${i}`}>
                <Link
                  to={item.to}
                  className="inline-block py-1 text-plum-600 transition hover:text-blush-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-base font-bold text-plum-900">Find us</h2>
          <ul className="mt-3 space-y-2 text-sm text-plum-600">
            <li className="flex items-start gap-2.5">
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-blush-500" />
              <span>London, UK</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-blush-500" />
              <a
                href="mailto:helloqts@hotmail.com"
                className="transition hover:text-blush-700"
              >
                helloqts@hotmail.com
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <InstagramIcon className="mt-0.5 h-4 w-4 shrink-0 text-blush-500" />
              <a
                href="https://www.instagram.com/helloqtcos/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-blush-700"
              >
                @helloqtcos
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="h-px gold-rule" />
      <div className="section flex flex-col gap-2 py-4 text-center text-xs text-plum-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>© {new Date().getFullYear()} HelloQT. All rights reserved.</p>
        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:justify-end">
          <Link to="/privacy" className="transition hover:text-blush-700">
            Privacy policy
          </Link>
          <Link to="/terms" className="transition hover:text-blush-700">
            Terms &amp; conditions
          </Link>
          <span>Cruelty-free · Vegan friendly · Made with love</span>
        </p>
      </div>
    </footer>
  )
}
