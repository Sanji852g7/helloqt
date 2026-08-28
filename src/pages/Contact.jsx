import { useRef, useState } from 'react'
import { CheckIcon, InstagramIcon, MailIcon, PinIcon, TruckIcon } from '../components/Icons'

const faqs = [
  {
    q: 'How long does UK delivery take?',
    a: 'Orders placed before 2pm are posted the same working day via Royal Mail. Standard delivery usually arrives in 2–3 working days, and it is free on orders over £40.',
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

// Checks the contact form fields and returns any errors
const validate = (values) => {
  const errors = {}
  if (!values.name?.trim()) errors.name = 'Enter your name so we know who we are replying to.'
  if (!values.email?.trim()) {
    errors.email = 'Enter your email address so we can reply.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter an email address in the format name@example.com.'
  }
  if (!values.message?.trim()) errors.message = 'Let us know how we can help.'
  return errors
}

// Contact page: message form, FAQ accordion, contact cards
export default function Contact() {
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [sent, setSent] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const summaryRef = useRef(null)

  // Updates one form field and re-validates if already touched
  const setField = (id, value) => {
    setValues((v) => ({ ...v, [id]: value }))
    if (touched[id]) setErrors(validate({ ...values, [id]: value }))
  }

  // Demo only: no email is actually sent. Wire this to a real email service
  // (e.g. via the server/ backend) before launch, alongside the AI chat API key.
  // Validates the message, then fakes sending it (demo only)
  const handleSubmit = (event) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched({ name: true, email: true, message: true })

    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setSent(true)
    setValues({})
    setTouched({})
  }

  const errorEntries = Object.entries(errors).filter(([id]) => touched[id])

  return (
    <div className="section pb-12 pt-6 sm:pb-16 sm:pt-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Get in touch 🫶</h1>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {sent ? (
            <div
              role="status"
              className="rounded-3xl border-2 border-blush-300 bg-blush-50 p-8 text-center"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush-600 text-white">
                <CheckIcon className="h-8 w-8" />
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">Message sent</h2>
              <p className="mt-2 text-plum-600">
                Thank you for getting in touch, we will reply within one working day.
              </p>
              <button type="button" onClick={() => setSent(false)} className="btn-secondary mt-6">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {errorEntries.length > 0 && (
                <div
                  ref={summaryRef}
                  tabIndex={-1}
                  role="alert"
                  className="mb-7 rounded-2xl border-2 border-red-300 bg-red-50 p-5"
                >
                  <h2 className="font-display text-lg font-bold text-red-800">
                    There{' '}
                    {errorEntries.length === 1
                      ? 'is 1 problem'
                      : `are ${errorEntries.length} problems`}{' '}
                    with your message
                  </h2>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {errorEntries.map(([id, message]) => (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          className="font-semibold text-red-700 underline underline-offset-2 hover:text-red-900"
                        >
                          {message}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-5 rounded-3xl border border-blush-200 bg-white p-6 sm:p-8">
                {[
                  { id: 'name', label: 'Your name', type: 'text', autoComplete: 'name' },
                  { id: 'email', label: 'Email address', type: 'email', autoComplete: 'email' },
                ].map((field) => {
                  const invalid = Boolean(errors[field.id] && touched[field.id])
                  return (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        className="mb-1.5 block text-sm font-semibold text-plum-700"
                      >
                        {field.label}
                        <span className="ml-1 text-blush-600" aria-hidden="true">
                          *
                        </span>
                      </label>
                      <input
                        id={field.id}
                        type={field.type}
                        autoComplete={field.autoComplete}
                        value={values[field.id] ?? ''}
                        onChange={(e) => setField(field.id, e.target.value)}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, [field.id]: true }))
                          setErrors(validate(values))
                        }}
                        aria-invalid={invalid}
                        aria-describedby={invalid ? `${field.id}-error` : undefined}
                        className={`field ${invalid ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                      />
                      {invalid && (
                        <p
                          id={`${field.id}-error`}
                          className="mt-1.5 text-sm font-medium text-red-700"
                        >
                          {errors[field.id]}
                        </p>
                      )}
                    </div>
                  )
                })}

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-semibold text-plum-700"
                  >
                    Message
                    <span className="ml-1 text-blush-600" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={values.message ?? ''}
                    onChange={(e) => setField('message', e.target.value)}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, message: true }))
                      setErrors(validate(values))
                    }}
                    aria-invalid={Boolean(errors.message && touched.message)}
                    aria-describedby={errors.message && touched.message ? 'message-error' : undefined}
                    className={`field resize-y ${errors.message && touched.message ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                  />
                  {errors.message && touched.message && (
                    <p id="message-error" className="mt-1.5 text-sm font-medium text-red-700">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button type="submit" className="btn-primary w-full sm:w-auto">
                  Send message
                </button>
              </div>
            </form>
          )}

          <section id="faq" className="mt-14 scroll-mt-24">
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
          </section>
        </div>

        <aside className="h-fit space-y-4">
          {[
            {
              icon: PinIcon,
              title: 'Where we are',
              body: 'London, UK',
              note: 'Posted UK-wide, no local collection.',
            },
            {
              icon: MailIcon,
              title: 'Email us',
              body: 'helloqts@hotmail.com',
              href: 'mailto:helloqts@hotmail.com',
              note: 'We reply within one working day.',
            },
            {
              icon: InstagramIcon,
              title: 'Instagram',
              body: '@helloqtcos',
              href: 'https://www.instagram.com/helloqtcos/',
              external: true,
              note: 'New styles and restocks land here first.',
            },
            {
              icon: TruckIcon,
              title: 'Delivery',
              body: 'Free on orders over £40',
              note: 'Royal Mail, 2–3 working days.',
            },
          ].map(({ icon: Icon, title, body, note, href, external }) => (
            <div
              key={title}
              className="rounded-3xl border border-blush-200 bg-white p-6 shadow-soft"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blush-100 text-blush-600">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-lg font-bold">{title}</h2>
              {href ? (
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="mt-1 inline-block font-semibold text-blush-700 transition hover:text-blush-800"
                >
                  {body}
                </a>
              ) : (
                <p className="mt-1 font-semibold text-plum-700">{body}</p>
              )}
              <p className="mt-1.5 text-sm text-plum-500">{note}</p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  )
}
