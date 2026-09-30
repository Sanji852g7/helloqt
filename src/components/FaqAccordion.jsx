import { useState } from 'react'

export const faqs = [
  {
    q: 'How long does UK delivery take?',
    a: 'Orders placed before 2pm are posted the same working day via Royal Mail. Standard delivery usually arrives in 2–3 working days, and it is free on orders over £40. I currently only ship within the UK.',
  },
  {
    q: 'Can I return lashes?',
    a: 'For hygiene reasons we cannot accept returns on opened lashes. If your order arrives damaged or incorrect, email us within 14 days and we will put it right straight away.',
  },
  {
    q: 'Do you sell lash glue?',
    a: 'Lash glue is not included. We recommend any clear latex-free lash adhesive so the band stays invisible.',
  },
  {
    q: 'Are the lashes suitable for sensitive eyes?',
    a: 'Yes, they are suitable for sensitive eyes. The band is thin, flexible cotton rather than a stiff synthetic strip, so it sits lightly on the lid, and the fibres are 100% vegan silk, which is soft and breathable rather than heavy or irritating. Every band is latex-free too. As always, patch test your adhesive first if you have sensitive skin.',
  },
]

// The "Frequently asked" accordion, used on both Home and Contact.
// Keep this the single source of truth - do not copy/paste this markup
// elsewhere, or the two copies will drift out of sync.
export default function FaqAccordion() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <>
      <h2 className="font-display text-2xl font-bold sm:text-3xl">Frequently asked</h2>
      <div className="mt-6 divide-y divide-blush-200 overflow-hidden rounded-3xl border border-blush-200 bg-white">
        {faqs.map((faq, index) => {
          const open = openFaq === index
          return (
            <div key={faq.q}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : index)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${index}`}
                  className="flex min-h-[56px] w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left font-semibold text-plum-800 transition hover:bg-blush-50"
                >
                  {faq.q}
                  <span
                    aria-hidden="true"
                    className={`shrink-0 text-xl text-blush-600 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
                  >
                    +
                  </span>
                </button>
              </h3>
              {open && (
                <div id={`faq-panel-${index}`} className="px-6 pb-5">
                  <p className="text-sm leading-relaxed text-plum-600">{faq.a}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
