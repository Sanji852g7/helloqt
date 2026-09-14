import { Link } from 'react-router-dom'
import { PinIcon } from '../components/Icons'

const LAST_UPDATED = '14 September 2026'

// One section of the policy: a heading plus its body content
function Section({ title, children }) {
  return (
    <section className="border-t border-blush-200 py-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-bold text-plum-900">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-plum-600">{children}</div>
    </section>
  )
}

// Privacy policy: what data HelloQT collects, why, and how to control it
export default function Privacy() {
  return (
    <div>
      <section className="bg-cream py-8 sm:py-10">
        <div className="section max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-300 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
            <PinIcon className="h-3.5 w-3.5" />
            Privacy policy
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Your privacy</h1>
          <p className="mt-3 text-sm text-plum-500">Last updated {LAST_UPDATED}</p>
        </div>
      </section>

      <div className="section max-w-2xl py-12 sm:py-16">
        <p className="leading-relaxed text-plum-700">
          HelloQT is a small, one-woman lash brand based in London, UK, run by me, Sanji. This page
          explains what personal information I collect when you use this website, why, and what
          choices you have about it. I only ever use your details to run your order and, if you've
          asked for them, my emails, never anything else.
        </p>

        <Section title="Who I am">
          <p>
            HelloQT is operated by Sanji Gurung, based in London, United Kingdom. If you have any
            question about your data, email me at{' '}
            <a href="mailto:helloqts@hotmail.com" className="font-semibold text-blush-700">
              helloqts@hotmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="What I collect">
          <p>Depending on how you use the site, I may collect:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Your name, email address, delivery address and phone number, when you check out</li>
            <li>Your email address, when you sign up for 10% off or create an account</li>
            <li>Your account login details, if you create an account</li>
            <li>Messages you send through the contact form or to Mini Sanji, the AI lash advisor</li>
            <li>
              Basic technical information your browser sends automatically (like your basket
              contents, saved on your own device so it's there next time you visit)
            </li>
          </ul>
          <p>
            I never ask for or store your card details. Payment is handled entirely by Stripe, a
            regulated payment provider; your card information goes straight to them and I never see
            or hold it.
          </p>
        </Section>

        <Section title="Why I collect it">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To take payment for and deliver your order, and to email you about its status</li>
            <li>To send your 10% off code and, if you've agreed, occasional emails about HelloQT</li>
            <li>To let you log in and see your past orders and delivery tracking</li>
            <li>To answer questions you send through the contact form or Mini Sanji</li>
            <li>To keep the site secure and stop it being misused</li>
          </ul>
        </Section>

        <Section title="Who I share it with">
          <p>
            I use a small number of trusted companies to run HelloQT, and your information is only
            ever shared with them for the purpose of running this shop, never sold or shared for
            anyone else's marketing:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong className="text-plum-800">Stripe</strong> — processes your payment securely
            </li>
            <li>
              <strong className="text-plum-800">Supabase</strong> — securely stores your account and
              order details
            </li>
            <li>
              <strong className="text-plum-800">Resend</strong> — sends order, shipping and account
              emails on my behalf
            </li>
            <li>
              <strong className="text-plum-800">Anthropic</strong> — powers Mini Sanji; only messages
              you choose to send it are shared, and only to generate a reply
            </li>
          </ul>
        </Section>

        <Section title="How long I keep it">
          <p>
            Order information is kept for as long as needed for accounting and to handle any
            after-sales questions. If you unsubscribe from marketing emails, I stop emailing you but
            may keep a record that you unsubscribed, so that choice is respected.
          </p>
        </Section>

        <Section title="Cookies and your basket">
          <p>
            This site stores your shopping basket and a couple of small preferences (like whether
            you've already seen the discount pop-up) directly in your browser, on your own device.
            It never tracks you across other websites.
          </p>
        </Section>

        <Section title="Your rights">
          <p>Under UK data protection law, you can ask me at any time to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>See what personal information I hold about you</li>
            <li>Correct anything that's wrong</li>
            <li>Delete your information, where I'm not required to keep it (such as for tax records)</li>
            <li>Stop using your information for marketing</li>
          </ul>
          <p>
            Just email{' '}
            <a href="mailto:helloqts@hotmail.com" className="font-semibold text-blush-700">
              helloqts@hotmail.com
            </a>{' '}
            and I'll sort it out. You can also unsubscribe from marketing emails any time using the
            link at the bottom of any HelloQT email, or complain to the UK's Information
            Commissioner's Office (ico.org.uk) if you're unhappy with how I've handled your data.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If this policy changes, I'll update this page and the date at the top. Please check back
            occasionally.
          </p>
        </Section>

        <p className="mt-8 text-sm text-plum-500">
          Questions? See the{' '}
          <Link to="/contact" className="font-semibold text-blush-700">
            contact page
          </Link>
          , or email{' '}
          <a href="mailto:helloqts@hotmail.com" className="font-semibold text-blush-700">
            helloqts@hotmail.com
          </a>
          .
        </p>
      </div>
    </div>
  )
}
