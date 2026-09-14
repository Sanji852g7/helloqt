import { Link } from 'react-router-dom'
import { PinIcon } from '../components/Icons'

const LAST_UPDATED = '14 September 2026'

// One section of the terms: a heading plus its body content
function Section({ title, children }) {
  return (
    <section className="border-t border-blush-200 py-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-bold text-plum-900">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-plum-600">{children}</div>
    </section>
  )
}

// Terms & conditions: the rules of shopping with HelloQT
export default function Terms() {
  return (
    <div>
      <section className="bg-cream py-8 sm:py-10">
        <div className="section max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-300 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
            <PinIcon className="h-3.5 w-3.5" />
            Terms &amp; conditions
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Shopping with HelloQT
          </h1>
          <p className="mt-3 text-sm text-plum-500">Last updated {LAST_UPDATED}</p>
        </div>
      </section>

      <div className="section max-w-2xl py-12 sm:py-16">
        <p className="leading-relaxed text-plum-700">
          These are the terms that apply when you buy from HelloQT. They're written in plain
          English on purpose — if anything here isn't clear, just ask.
        </p>

        <Section title="About us">
          <p>
            HelloQT is a small, cruelty-free strip lash brand run by Sanji Gurung, based in London,
            United Kingdom. You can reach me any time at{' '}
            <a href="mailto:helloqts@hotmail.com" className="font-semibold text-blush-700">
              helloqts@hotmail.com
            </a>
            .
          </p>
        </Section>

        <Section title="Products and prices">
          <p>
            All prices are shown in pounds sterling (GBP) and include delivery costs shown separately
            at checkout. Product photos are taken to represent each style as accurately as possible,
            but slight variation between what you see on screen and the product itself can happen.
          </p>
        </Section>

        <Section title="Placing an order">
          <p>
            Adding items to your basket doesn't reserve them. Your order is placed once your payment
            is successfully taken by Stripe, at which point I'll email you a confirmation with your
            order number. That confirmation is my acceptance of your order.
          </p>
        </Section>

        <Section title="Payment">
          <p>
            Payment is handled entirely by Stripe, a regulated payment processor. Your card details
            are sent directly to Stripe and are never seen, collected or stored by HelloQT.
          </p>
        </Section>

        <Section title="Delivery">
          <p>
            Orders are sent by Royal Mail and usually arrive within 2–3 working days of dispatch.
            Delivery is £3.50, or free on orders of £40 and over. Once your order is posted, I'll
            email you your tracking number where one is provided.
          </p>
        </Section>

        <Section title="Your right to cancel">
          <p>
            As a UK consumer buying online, you have a legal right to cancel your order within 14
            days of receiving it, without giving a reason, under the Consumer Contracts Regulations
            2013.
          </p>
          <p>
            Because lashes are a hygiene product, this right does not apply once the packaging has
            been opened, unless the item is faulty, damaged, or not what you ordered — for hygiene
            reasons, opened lashes can't be resold. To cancel an unopened order, email{' '}
            <a href="mailto:helloqts@hotmail.com" className="font-semibold text-blush-700">
              helloqts@hotmail.com
            </a>{' '}
            within 14 days of delivery.
          </p>
        </Section>

        <Section title="Faulty, damaged or incorrect items">
          <p>
            If your order arrives faulty, damaged, or isn't what you ordered, email me within 14
            days with a photo where possible, and I'll sort out a replacement or refund straight
            away, at no cost to you.
          </p>
        </Section>

        <Section title="Discount codes">
          <p>
            Discount codes such as the 10% welcome code are limited to one use per customer and
            cannot be combined with other offers unless stated otherwise.
          </p>
        </Section>

        <Section title="Intellectual property">
          <p>
            All content on this site — text, photos, the HelloQT name and logo — belongs to HelloQT
            and may not be copied or reused without permission.
          </p>
        </Section>

        <Section title="Our liability">
          <p>
            I'll always do my best to get your order right. Nothing in these terms limits your legal
            rights as a consumer under UK law, including your rights around faulty goods under the
            Consumer Rights Act 2015.
          </p>
        </Section>

        <Section title="Governing law">
          <p>
            These terms are governed by the laws of England and Wales, and any disputes will be
            handled by the courts of England and Wales.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            If these terms change, I'll update this page and the date at the top. The terms that
            applied when you placed your order are the ones that apply to it.
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
