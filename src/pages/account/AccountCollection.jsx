import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { MAX_WEARS, milestoneMessage } from '../../lib/lashCollection'
import { HeartIcon, MoreIcon } from '../../components/Icons'
import { BackToAccount } from './shared'
import { useAccountData } from './AccountLayout'

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

// The customer's own local date, not UTC - so the daily reset happens at
// their actual midnight, not skewed by an hour during British Summer Time
const todayStr = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// One purchased pair: wear tracker, milestone message, and an overflow menu
// to archive it once it's finished, damaged, or lost
function CollectionCard({ item, onChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logging, setLogging] = useState(false)
  const [undoState, setUndoState] = useState(null)
  const [error, setError] = useState(null)

  // Once a day, so an accidental extra tap (after the immediate Undo window
  // has passed) can't quietly inflate the count
  const loggedToday = item.last_worn_date === todayStr()

  const handleWoreToday = async () => {
    if (loggedToday) return
    setLogging(true)
    setError(null)
    const previous = { wear_count: item.wear_count, last_worn_date: item.last_worn_date }
    const { data, error: updateError } = await supabase
      .from('lash_collection')
      .update({ wear_count: item.wear_count + 1, last_worn_date: todayStr() })
      .eq('id', item.id)
      .select()
      .single()
    setLogging(false)
    if (updateError) return setError('Something went wrong, please try again.')
    onChange(data)
    setUndoState(previous)
  }

  const handleUndo = async () => {
    if (!undoState) return
    const { data, error: updateError } = await supabase
      .from('lash_collection')
      .update(undoState)
      .eq('id', item.id)
      .select()
      .single()
    if (!updateError) onChange(data)
    setUndoState(null)
  }

  const handleArchiveToggle = async () => {
    setMenuOpen(false)
    const { data, error: updateError } = await supabase
      .from('lash_collection')
      .update({ archived: !item.archived })
      .eq('id', item.id)
      .select()
      .single()
    if (!updateError) onChange(data)
  }

  const message = milestoneMessage(item.wear_count)
  const progress = Math.min(item.wear_count / MAX_WEARS, 1) * 100

  return (
    <div className="rounded-3xl border border-blush-200 bg-white p-5 shadow-soft">
      <div className="flex gap-4">
        <img
          src={item.product_image}
          alt={`${item.product_name} lashes`}
          width="80"
          height="80"
          className="h-20 w-20 shrink-0 rounded-2xl border border-blush-200 bg-white object-cover"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold text-plum-900">
                {item.product_name}
              </p>
              <p className="text-xs text-plum-500">Purchased {formatDate(item.created_at)}</p>
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="More options"
                aria-expanded={menuOpen}
                className="flex h-8 w-8 items-center justify-center rounded-full text-plum-400 transition hover:bg-blush-50 hover:text-plum-700"
              >
                <MoreIcon className="h-4 w-4" />
              </button>
              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-2xl border border-blush-200 bg-white py-1 shadow-lift">
                    <button
                      type="button"
                      onClick={handleArchiveToggle}
                      className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-plum-700 hover:bg-blush-50"
                    >
                      {item.archived ? 'Restore pair' : 'Archive pair'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {item.archived ? (
            <p className="mt-3 text-sm text-plum-500">
              Archived after {item.wear_count} wear{item.wear_count === 1 ? '' : 's'}.
            </p>
          ) : (
            <>
              <div className="mt-3">
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-plum-600">
                  <span>
                    {item.wear_count} / {MAX_WEARS} wears
                  </span>
                  {item.last_worn_date && <span>Last worn {formatDate(item.last_worn_date)}</span>}
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-blush-100">
                  <div
                    className="h-full rounded-full bg-blush-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {message && <p className="mt-2.5 text-sm font-medium text-blush-700">{message}</p>}
            </>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-xs font-medium text-red-700">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!item.archived &&
          (undoState ? (
            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
            >
              Logged today ✓ · Undo
            </button>
          ) : loggedToday ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blush-50 px-4 py-2.5 text-sm font-semibold text-plum-400">
              Already logged today
            </span>
          ) : (
            <button
              type="button"
              onClick={handleWoreToday}
              disabled={logging}
              className="inline-flex items-center gap-1.5 rounded-full bg-blush-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blush-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {logging ? 'Logging…' : '+ Wore today'}
            </button>
          ))}
        <Link
          to="/about#care"
          className="inline-flex items-center gap-1.5 rounded-full bg-blush-50 px-4 py-2.5 text-sm font-semibold text-blush-700 transition hover:bg-blush-100"
        >
          Care guide
        </Link>
        {item.archived && (
          <Link
            to={`/product/${item.product_slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-blush-50 px-4 py-2.5 text-sm font-semibold text-blush-700 transition hover:bg-blush-100"
          >
            Buy again
          </Link>
        )}
      </div>
    </div>
  )
}

// /account/collection: every individually purchased pair, with its own wear
// count - buying the same lash twice makes two separate tracked pairs
export default function AccountCollection() {
  const { user } = useAccountData()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  useEffect(() => {
    if (!user) return
    supabase
      .from('lash_collection')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('[helloqt] failed to load collection:', error.message)
        setItems(data ?? [])
        setLoading(false)
      })
  }, [user])

  const handleItemChange = (updated) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
  }

  const active = items.filter((item) => !item.archived)
  const archived = items.filter((item) => item.archived)
  const visible = tab === 'active' ? active : archived

  return (
    <div>
      <BackToAccount />

      <div className="mt-3">
        <h2 className="font-display text-xl font-bold">My QT Collection</h2>

        {loading ? (
          <p className="mt-4 text-sm text-plum-600">Loading your collection…</p>
        ) : items.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-blush-200 bg-white p-8 text-center shadow-soft">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blush-50 text-blush-400">
              <HeartIcon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold">Your QT Collection is waiting 💕</h3>
            <p className="mt-1.5 text-sm text-plum-500">Your purchased lashes will appear here.</p>
            <Link to="/shop" className="btn-primary mt-5">
              Shop lashes →
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 inline-flex rounded-full border border-blush-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setTab('active')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === 'active' ? 'bg-blush-600 text-white' : 'text-plum-600 hover:text-blush-700'
                }`}
              >
                My Collection ({active.length})
              </button>
              <button
                type="button"
                onClick={() => setTab('archived')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === 'archived' ? 'bg-blush-600 text-white' : 'text-plum-600 hover:text-blush-700'
                }`}
              >
                Archived ({archived.length})
              </button>
            </div>

            {visible.length === 0 ? (
              <p className="mt-5 text-sm text-plum-500">
                {tab === 'active' ? 'Nothing active right now.' : "You haven't archived any pairs yet."}
              </p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {visible.map((item) => (
                  <CollectionCard key={item.id} item={item} onChange={handleItemChange} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
