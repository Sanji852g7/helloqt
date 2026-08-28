import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { collections, productsInCollection } from '../data/products'
import ProductCard from '../components/ProductCard'
import { Squiggle } from '../components/Doodles'

// Renders one collection's header card and product grid
function CollectionSection({ collection, id }) {
  const items = productsInCollection(collection.id)
  const tint = collection.accent === 'plum' ? 'gold' : 'blush'

  return (
    <section id={id} className="scroll-mt-24 pb-14 pt-6 sm:pb-16 sm:pt-8">
      <div className="overflow-hidden rounded-[2rem] border border-blush-200 bg-blush-50/60">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${
                tint === 'gold' ? 'bg-gold-600 text-white' : 'bg-blush-600 text-white'
              }`}
            >
              {collection.volume}
            </p>
            <div className="inline-block">
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                {collection.name}
              </h2>
              <Squiggle
                className={`mt-1.5 h-3 w-full ${tint === 'gold' ? 'text-gold-500' : 'text-blush-400'}`}
              />
            </div>
            <p className="mt-3 max-w-md leading-relaxed text-plum-600">{collection.description}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-plum-800">
              Length: {collection.length}
              <span className="text-plum-300">·</span>
              {items.length} styles
            </p>
          </div>

          <img
            src={collection.cover}
            alt=""
            width="220"
            height="220"
            className="hidden h-40 w-40 rotate-2 rounded-3xl border-4 border-white object-cover shadow-lift sm:block"
          />
        </div>

        <div className="grid gap-6 p-7 pt-0 sm:grid-cols-2 sm:p-10 sm:pt-0 lg:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Shop page: jump nav plus both collection sections
export default function Shop() {
  const [searchParams] = useSearchParams()
  const scrolled = useRef(false)

  useEffect(() => {
    const target = searchParams.get('collection')
    if (target && !scrolled.current) {
      scrolled.current = true
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [searchParams])

  return (
    <div className="section pb-12 pt-6 sm:pb-16 sm:pt-8">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">The lash collection</h1>
        <p className="mt-3 font-script text-2xl text-blush-600">
          Enhance your beauty with HelloQT
        </p>
        <p className="mt-4 leading-relaxed text-plum-600">
          Two little collections, ten hand-finished styles. Suitcase for the nights you want to be
          seen, Compact for the days you just want to feel put together.
        </p>
      </header>

      <nav aria-label="Jump to collection" className="mt-8 flex flex-wrap gap-3">
        {Object.values(collections).map((collection) => (
          <a
            key={collection.id}
            href={`#${collection.id}`}
            className="min-h-[44px] cursor-pointer rounded-full border-2 border-blush-200 bg-white px-5 py-2.5 text-sm font-semibold text-plum-700 transition hover:border-blush-400 hover:text-blush-700"
          >
            {collection.volume}, {collection.name}
          </a>
        ))}
      </nav>

      <CollectionSection collection={collections.suitcase} id="suitcase" />

      <CollectionSection collection={collections.compact} id="compact" />
    </div>
  )
}
