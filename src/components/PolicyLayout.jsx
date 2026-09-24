import { PinIcon } from './Icons'

/**
 * Business details shown on the legal pages.
 *
 * tradingAddress needs to become a real, full address before launch. The
 * Electronic Commerce Regulations 2002 require an online seller to show a
 * geographic address, and "London, United Kingdom" on its own is not one.
 *
 * You do NOT have to publish your home address to satisfy this. A virtual
 * business address service (roughly £25–£60 a year) gives you a real address
 * that forwards or scans your post, and is what most sole traders working
 * from home use. Swap the line below once you have one.
 */
export const BUSINESS = {
  name: 'HelloQT',
  owner: 'Sanji Gurung',
  tradingAddress: 'London, United Kingdom',
  email: 'helloqts@hotmail.com',
  instagram: 'https://www.instagram.com/helloqtcos/',
}

export const LAST_UPDATED = '24 September 2026'

// One numbered section of a policy, linkable from the contents list
export function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-blush-200 py-8">
      <h2 className="font-display text-xl font-bold text-plum-900">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-plum-600">{children}</div>
    </section>
  )
}

// A plain email link in the brand's colour
export function EmailLink() {
  return (
    <a href={`mailto:${BUSINESS.email}`} className="font-semibold text-blush-700">
      {BUSINESS.email}
    </a>
  )
}

// Shared page frame for the privacy and terms pages: header, intro, contents
export default function PolicyLayout({ eyebrow, title, intro, sections, children }) {
  return (
    <div>
      <section className="bg-cream py-8 sm:py-10">
        <div className="section max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-300 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
            <PinIcon className="h-3.5 w-3.5" />
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-plum-500">Last updated {LAST_UPDATED}</p>
        </div>
      </section>

      <div className="section max-w-2xl py-12 sm:py-16">
        <p className="leading-relaxed text-plum-700">{intro}</p>

        {/* Long documents are much easier to use with a way to jump around */}
        <nav aria-label="On this page" className="mt-8 rounded-3xl border border-blush-200 bg-cream p-6">
          <h2 className="font-display text-base font-bold text-plum-900">On this page</h2>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {sections.map(({ id, title }, index) => (
              <li key={id}>
                <a href={`#${id}`} className="text-plum-600 transition hover:text-blush-700">
                  <span className="text-plum-400">{index + 1}.</span> {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-4">{children}</div>

        <p className="mt-8 rounded-2xl bg-blush-50 p-5 text-sm leading-relaxed text-plum-600">
          Any questions about this page? Email <EmailLink /> and I'll answer personally.
        </p>
      </div>
    </div>
  )
}
