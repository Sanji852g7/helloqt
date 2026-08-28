export const collections = {
  suitcase: {
    id: 'suitcase',
    volume: 'Vol. 01',
    name: 'Suitcase Set',
    length: '25mm',
    tagline: 'Big, dramatic and ready to travel.',
    description:
      'Our longest, boldest lashes, 25mm of full-blown drama, tucked inside a little pink travel suitcase so they are just as fun to unbox as they are to wear.',
    cover: '/media/king.JPG',
    accent: 'plum',
  },
  compact: {
    id: 'compact',
    volume: 'Vol. 02',
    name: 'Compact Set',
    length: '15mm',
    tagline: 'Our everyday 15mm, with a mirror built right in.',
    description:
      'The size we reach for most. 15mm of soft, wearable definition, finished in a rose gold compact with a built-in mirror for touch-ups wherever you are.',
    cover: '/media/royalty.JPG',
    accent: 'blush',
  },
}

export const products = [
  // Vol. 01 — Suitcase (25mm, dramatic)
  {
    slug: 'angel',
    name: 'Angel',
    collection: 'suitcase',
    image: '/media/angel.JPG',
    price: 10.99,
    style: 'Wispy Dramatic',
    length: '25mm',
    curl: 'C Curl',
    material: 'Silky Vegan Fibres',
    wears: '20+ wears',
    badge: 'Bestseller',
    tagline: 'Full length, feather-light finish.',
    description:
      'Angel proves long does not have to mean heavy. Feathered, criss-crossed layers build all the way out to 25mm without ever tugging at your lash line. Packed in her own little pink suitcase, ready for her close-up.',
  },
  {
    slug: 'cherish',
    name: 'Cherish',
    collection: 'suitcase',
    image: '/media/cherish.JPG',
    price: 10.99,
    style: 'Textured Dramatic',
    length: '25mm',
    curl: 'C Curl',
    material: 'Silky Vegan Fibres',
    wears: '20+ wears',
    badge: null,
    tagline: 'The one you will reach for on a big night.',
    description:
      'Cherish takes our 25mm length and softens it with texture through the centre, so the drama still feels like you. Comes home in the signature HelloQT suitcase case.',
  },
  {
    slug: 'king',
    name: 'King',
    collection: 'suitcase',
    image: '/media/king.JPG',
    price: 10.99,
    style: 'Bold Spike Dramatic',
    length: '25mm',
    curl: 'D Curl',
    material: 'Premium Silky Vegan Fibres',
    wears: '25+ wears',
    badge: null,
    tagline: 'Our boldest spike, full 25mm.',
    description:
      'Sharp, fanned-out spikes with plenty of gaps for a wet, textured finish. King is the statement lash for anyone who does not do subtle, housed in our mini travel suitcase.',
  },
  {
    slug: 'luck',
    name: 'Luck',
    collection: 'suitcase',
    image: '/media/luck.JPG',
    price: 10.99,
    style: 'Feathered Dramatic',
    length: '25mm',
    curl: 'D Curl',
    material: 'Silky Vegan Fibres',
    wears: '20+ wears',
    badge: null,
    tagline: 'Feathery drama that still feels light.',
    description:
      'Luck fans out into soft, feathery spikes so the full 25mm length reads as glamorous rather than heavy. Comes packed in her own pink suitcase, buckle and all.',
  },

  // Vol. 02 — Compact (15mm, everyday)
  {
    slug: 'classy',
    name: 'Classy',
    collection: 'compact',
    image: '/media/classy.JPG',
    price: 9.99,
    style: 'Elegant Flutter',
    length: '15mm',
    curl: 'C Curl',
    material: 'Silky Vegan Fibres',
    wears: '15+ wears',
    badge: null,
    tagline: 'A lifted flutter that does all the work.',
    description:
      'Graduated lengths build gently towards the outer corner for a soft lift. Classy is our everyday 15mm, tucked into a rose gold mirror compact for touch-ups on the go.',
  },
  {
    slug: 'dolledup',
    name: 'Dolled Up',
    collection: 'compact',
    image: '/media/dolledup.JPG',
    price: 9.99,
    style: 'Full Glam Mini',
    length: '15mm',
    curl: 'D Curl',
    material: 'Silky Vegan Fibres',
    wears: '15+ wears',
    badge: null,
    tagline: 'All the glam, none of the length.',
    description:
      'Dense and dark through the centre for a proper glam finish, without going past our everyday 15mm. Comes home in its own mirrored compact.',
  },
  {
    slug: 'goddess',
    name: 'Goddess',
    collection: 'compact',
    image: '/media/goddess.JPG',
    price: 9.99,
    style: 'Volume Fluff',
    length: '15mm',
    curl: 'D Curl',
    material: 'Premium Silky Vegan Fibres',
    wears: '20+ wears',
    badge: null,
    tagline: 'Big, fluffy, impossible to ignore.',
    description:
      'Our fluffiest volume style. Feather-light spikes stacked over a full base give you that editorial, freshly-lifted look at our everyday 15mm length, mirror compact included.',
  },
  {
    slug: 'halo',
    name: 'Halo',
    collection: 'compact',
    image: '/media/halo.JPG',
    price: 9.99,
    style: 'Soft Volume',
    length: '15mm',
    curl: 'C Curl',
    material: 'Silky Vegan Fibres',
    wears: '15+ wears',
    badge: null,
    tagline: 'Rounded, doe-eyed and dreamy.',
    description:
      'Fullest through the centre for a soft, rounded doe-eye. A gorgeous everyday pick for almond and hooded eye shapes, in our signature mirror compact.',
  },
  {
    slug: 'lust',
    name: 'Lust',
    collection: 'compact',
    image: '/media/lust.JPG',
    price: 9.99,
    style: 'Glitter Luxe',
    length: '15mm',
    curl: 'D Curl',
    material: 'Premium Silky Vegan Fibres',
    wears: '20+ wears',
    badge: null,
    tagline: 'Housed in our sparkliest mirror compact.',
    description:
      'Lust arrives in a shimmering rose gold compact with a built-in mirror, so touch-ups on a night out are effortless. A sultry, tapered everyday-length style.',
  },
  {
    slug: 'royalty',
    name: 'Royalty',
    collection: 'compact',
    image: '/media/royalty.JPG',
    price: 9.99,
    style: 'Luxe Volume',
    length: '15mm',
    curl: 'D Curl',
    material: 'Premium Silky Vegan Fibres',
    wears: '20+ wears',
    badge: 'My Pick',
    tagline: 'The full HelloQT experience.',
    description:
      'Layered, glossy and richly full, our most luxurious everyday style, finished in premium mirror-compact packaging. Royalty is the one you save for the moments that matter.',
  },
]

// Finds a single product by its URL slug
export const getProduct = (slug) => products.find((p) => p.slug === slug)
// Looks up a collection's details by id
export const getCollection = (id) => collections[id]
// Filters products belonging to one collection
export const productsInCollection = (id) => products.filter((p) => p.collection === id)
