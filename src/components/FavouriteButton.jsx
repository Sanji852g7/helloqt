import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { toTitleCase } from '../lib/text'
import { HeartIcon } from './Icons'

// Heart toggle for saving a product to the customer's favourites. A guest
// (not logged in) is sent straight to sign up instead, since favourites
// need an account to actually keep them.
export default function FavouriteButton({ slug, className, iconClassName = 'h-4 w-4' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setSaved(false)
      return
    }
    let cancelled = false
    supabase
      .from('favourites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_slug', slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('[helloqt] failed to load favourite status:', error.message)
        if (!cancelled) setSaved(Boolean(data))
      })
    return () => {
      cancelled = true
    }
  }, [user, slug])

  const handleClick = async (event) => {
    event.preventDefault()
    event.stopPropagation()

    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    if (saved) {
      const { error } = await supabase
        .from('favourites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_slug', slug)
      if (!error) setSaved(false)
    } else {
      // full_name and email are cached here too (not just in auth.users) so
      // Sanji can tell rows apart in Table Editor without joining tables -
      // same reason profiles and lash_collection already store them
      const fullName = [user.user_metadata?.first_name, user.user_metadata?.surname]
        .filter(Boolean)
        .map(toTitleCase)
        .join(' ')
      const { error } = await supabase.from('favourites').insert({
        user_id: user.id,
        full_name: fullName,
        email: user.email,
        product_slug: slug,
      })
      if (!error) setSaved(true)
    }
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={saved ? 'Remove from favourites' : 'Save to favourites'}
      aria-pressed={saved}
      className={className}
    >
      <HeartIcon
        className={iconClassName}
        fill={saved ? 'currentColor' : 'none'}
      />
    </button>
  )
}
