import { products } from './products.js'

// Delivery is free once the basket reaches this subtotal
export const FREE_SHIPPING_THRESHOLD = 40
// Flat Royal Mail delivery charge on smaller orders
export const SHIPPING_FEE = 3.5
// The welcome code takes this fraction off the subtotal
export const DISCOUNT_RATE = 0.1
// Sanity cap so nobody can order a silly quantity of one lash
export const MAX_QUANTITY_PER_ITEM = 20

// Rounds a money value to whole pence, avoiding floating point drift
export const toPence = (value) => Math.round(value * 100) / 100

// Finds a product by its slug, or undefined if the slug is made up
export const findProduct = (slug) => products.find((p) => p.slug === slug)

// Works out delivery cost for a given subtotal
export const shippingFor = (subtotal, itemCount) =>
  itemCount === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

/**
 * Turns a list of {slug, quantity} into a fully priced order.
 *
 * Prices always come from the catalogue here, never from the caller, so the
 * same maths runs in the cart and on the server and the browser can never
 * talk the server into a cheaper total.
 */
export function priceOrder(requestedItems, { discountApplied = false } = {}) {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    return { error: 'Your basket is empty.' }
  }

  const items = []

  for (const requested of requestedItems) {
    const product = findProduct(requested?.slug)
    if (!product) return { error: `We could not find the product "${requested?.slug}".` }

    const quantity = Number(requested?.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return { error: `Choose between 1 and ${MAX_QUANTITY_PER_ITEM} of ${product.name}.` }
    }

    // Rebuilt entirely from the catalogue, so name, price and photo are trusted
    items.push({
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      style: product.style,
      quantity,
    })
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = toPence(items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const shipping = shippingFor(subtotal, count)
  const discount = discountApplied ? toPence(subtotal * DISCOUNT_RATE) : 0
  const total = toPence(subtotal + shipping - discount)

  return { items, count, subtotal, shipping, discount, total }
}
