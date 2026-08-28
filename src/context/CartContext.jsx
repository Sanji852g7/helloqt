import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'helloqt-cart'

// Loads saved cart items from localStorage
const readStoredCart = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Shares cart state and actions across the whole app
export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage can be unavailable in private browsing; cart stays in memory.
    }
  }, [items])

  const value = useMemo(() => {
    // Adds a product to the cart, or bumps its quantity
    const addItem = (product, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.slug === product.slug)
        if (existing) {
          return current.map((item) =>
            item.slug === product.slug
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        }
        return [
          ...current,
          {
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.image,
            style: product.style,
            quantity,
          },
        ]
      })
    }

    // Changes an item's quantity, removing it if zero or less
    const updateQuantity = (slug, quantity) => {
      setItems((current) =>
        quantity <= 0
          ? current.filter((item) => item.slug !== slug)
          : current.map((item) => (item.slug === slug ? { ...item, quantity } : item)),
      )
    }

    // Removes a single item from the cart
    const removeItem = (slug) =>
      setItems((current) => current.filter((item) => item.slug !== slug))

    // Empties the whole cart
    const clearCart = () => setItems([])

    const count = items.reduce((total, item) => total + item.quantity, 0)
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
    const shipping = items.length === 0 || subtotal >= 40 ? 0 : 3.49
    const total = subtotal + shipping

    return {
      items,
      count,
      subtotal,
      shipping,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Gives components access to the shared cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}

// Formats a number as GBP currency
export const formatPrice = (value) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)
