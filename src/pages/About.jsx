import { Link } from 'react-router-dom'
import { ArrowRightIcon, BoxIcon, LeafIcon, PinIcon, SparkleIcon } from '../components/Icons'
import { Squiggle } from '../components/Doodles'
import FounderLetter from '../components/FounderLetter'

const values = [
  {
    icon: LeafIcon,
    title: 'Never tested on animals',
    body: 'Every style is 100% vegan silk fibre. Soft, glossy and completely cruelty-free.',
  },
  {
    icon: SparkleIcon,
    title: 'Built to be reused',
    body: 'Look after them and a single pair will see you through 15 to 25 wears.',
  },
  {
    icon: BoxIcon,
    title: 'Never lose them again',
    body: 'Every pair comes home in its own little box, so it always has a place to live.',
  },
]

const careSteps = [
  'Peel the lash band gently from the outer corner inwards, never pull from the middle.',
  'Remove leftover glue from the band with tweezers once it has fully dried.',
  'If you wear mascara, dab the lashes with micellar water on a cotton bud.',
  'Reshape around your finger and return them to their case so the curl holds.',
]

// About page: founder letter, values, and care guide
export default function About() {
  return (
    <div>
      <section className="bg-cream py-8 sm:py-10">
        <div className="section max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-300 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
            <PinIcon className="h-3.5 w-3.5" />
            My story
          </p>
        </div>
      </section>

      <section className="section pb-16 pt-6 sm:pb-20 sm:pt-8">
        <FounderLetter headingLevel="h1" />
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="section">
          <div className="inline-block">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">What I stand for</h2>
            <Squiggle className="mt-2 h-3 w-full text-blush-400" />
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-blush-200 bg-cream p-7 shadow-soft"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-100 text-blush-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-plum-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="care" className="section scroll-mt-24 pb-16 pt-6 sm:pb-20 sm:pt-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              How to make them last 25 wears
            </h2>
            <p className="mt-3 leading-relaxed text-plum-600">
              Our lashes are reusable, but only if you treat them kindly. Four small habits make all
              the difference.
            </p>
          </div>
          <ol className="space-y-4">
            {careSteps.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-2xl border border-blush-200 bg-white p-5 shadow-soft"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-plum-700">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section pt-16 sm:pt-20">
        <div className="rounded-[2rem] bg-gradient-to-br from-blush-200 via-blush-300 to-gold-200 px-8 py-14 text-center sm:px-14">
          <h2 className="font-display text-3xl font-bold text-plum-900 sm:text-4xl">
            Come find your style
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-plum-700">
            Ten hand-finished styles across two collections, from 15mm every day to 25mm drama.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-blush-700 shadow-lift transition hover:bg-blush-50 active:scale-[0.98]"
          >
            Shop all lashes
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
