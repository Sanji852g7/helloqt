# HelloQT

A full-stack e-commerce shop for a real cruelty-free strip lash brand, built and run
by its founder. Ten hand-finished lash styles across two collections, with real card
payments, customer accounts, order tracking, a wear-tracking loyalty feature, verified
reviews, and an AI lash advisor.

This is a working business, not a tutorial project. Everything here handles real
money, real customer data and real UK consumer law.

**Status:** live at [helloqt.co.uk](https://www.helloqt.co.uk), taking real payments
on Stripe's live keys.

---

## What it does

| Area | Built |
|---|---|
| **Shop** | 10 products, 2 collections, filtering, product pages, basket |
| **Payments** | Stripe Checkout, prices calculated server-side, webhook-confirmed orders, saved Stripe Customer records |
| **Accounts** | Supabase Auth, a dashboard (orders, favourites, collection, details), editable name/address, forgot-password flow |
| **Fulfilment** | Automatic order + shipping emails with Royal Mail tracking |
| **Favourites** | Save products while logged in, revisit them from the account dashboard |
| **My QT Collection** | Each delivered pair becomes a trackable item with once-a-day wear logging and milestones |
| **Reviews** | Review link emailed on delivery, proof-of-purchase via a signed token, manually moderated before going live |
| **Marketing** | Email capture, one-per-customer welcome code, signed unsubscribe links, GA4 and Pinterest tracking (client tag + server-side Conversions API) |
| **AI** | Mini Sanji, a lash advisor grounded in the live product catalogue and site FAQs, kept on-topic |
| **Ops** | Maintenance-mode toggle (one env var, payment/order webhooks stay exempt), a contact form with working replies |
| **Legal** | UK-researched privacy policy and terms, GDPR lawful-basis table |

---

## Stack

**Frontend** — React 18, Vite, React Router 6, Tailwind CSS
**Backend** — Node, Express 5 (also serves the built frontend — one deployable service)
**Data & auth** — Supabase (Postgres + Auth, with Row Level Security)
**Payments** — Stripe Checkout
**Email** — Resend, sending from a verified `helloqt.co.uk` domain
**AI** — Claude API (`@anthropic-ai/sdk`), model `claude-haiku-4-5`
**Analytics** — Google Analytics 4, Pinterest tag + Conversions API

---

## How an order actually works

The interesting part of this project is what happens between "Pay" and "order
confirmed", because every step is designed on the assumption that **the browser is
lying**.

```
Browser                    Server                     Stripe            Supabase
   │                          │                          │                  │
   ├─ "2× angel, 1× classy" ─▶│                          │                  │
   │   (slugs and quantities  │                          │                  │
   │    only — no prices)     │                          │                  │
   │                          ├─ look up real prices     │                  │
   │                          │  from the catalogue      │                  │
   │                          ├─ create session ────────▶│                  │
   │◀─ redirect to Stripe ────┤                          │                  │
   │                                                     │                  │
   ├────────── customer pays on Stripe's page ──────────▶│                  │
   │                          │                          │                  │
   │                          │◀─ signed webhook ────────┤                  │
   │                          │   "payment succeeded"    │                  │
   │                          ├─ verify signature        │                  │
   │                          ├─ re-price from catalogue │                  │
   │                          ├─ create order ──────────────────────────────▶│
   │                          ├─ send confirmation email │                  │
   │◀─ thank-you page polls for the order ───────────────────────────────────┤
```

**No order row exists until Stripe confirms the money arrived.** Abandoned
checkouts leave nothing behind, so order numbers stay sequential and every number
in the table is a real, paid order.

Delivery isn't the end of it either. The same Supabase order webhook that fires
order and shipping emails fires again the moment an order's status first becomes
`delivered`: each purchased item drops into My QT Collection, and a signed,
per-item review link goes out by email — both only for the order that actually
changed status, and both exactly once.

---

## Engineering decisions worth explaining

### Prices are never sent by the browser

The checkout sends only product slugs and quantities. Everything — item prices,
delivery, the discount, the total — is recalculated server-side from the catalogue
in [`src/data/pricing.js`](src/data/pricing.js), and again at webhook time.

This was not theoretical. Before the fix, sending `{"total": 0.01}` for £20 of
lashes created a 1p order. Verified fixed against Stripe's own records:

```
Attacker requested:       £0.05  (5 lashes at "1p each")
Stripe actually charged:  £50.00 (5 × £10, from the catalogue)
```

### One pricing module, two runtimes

`pricing.js` is imported by both the React cart and the Express server, so the
total shown to the customer and the total charged can never drift apart. Changing
the delivery fee updates the basket, the Stripe session and the terms page at once.

### Duplicate payments can't create duplicate orders

Stripe retries webhooks, and customers refresh success pages. Each order stores its
`stripe_session_id` under a unique constraint, and the handler checks for an
existing order before inserting. The same payment processed twice produces one order.

### Discounts consume with rollback

The welcome code is one-use-per-customer. It's marked used *before* the order is
inserted, and rolled back if the insert fails — so a failed order never silently
burns someone's discount.

### Row Level Security, not application checks

Order visibility is enforced in Postgres (`auth.uid() = user_id`), not in React.
Even with the public API key, one customer querying all orders gets `[]`. Guest
orders are written server-side with the service role key, so the public key has no
write access to the orders table at all.

### Review authenticity without an account

Review links only go out after Supabase reports an order as delivered, and the link
itself carries a signed token tied to that exact order rather than a login. Anyone
with the link can leave one review per item on that order; nobody can forge one for
an order that isn't theirs, and guest customers who never created an account can
still leave a genuine review.

### A wear count that can't be gamed by timezone

My QT Collection's once-a-day logging cap compares against the UK calendar date
(`Europe/London`), not the device's own clock, so a customer travelling abroad — or
one who just changes their phone's timezone — can't log the same pair twice in a day.

### Maintenance mode fails open for money, closed for everyone else

Flipping `MAINTENANCE_MODE` on serves a "back soon" page to every browser and a 503
to every API call, except Stripe's and Supabase's webhooks. A paused shop still has
to record a payment that already happened or a status that's already changed —
refusing those would lose a real customer's order, not just inconvenience them.

### One Express process, not two

Production used to need separate hosting for the frontend and the API. Now Express
serves the Vite build (`dist/`) directly alongside the API, so there's a single
deployable service. Locally, `npm run dev:all` still runs two processes, so Vite's
dev server (hot reload) and the API stay independent while developing.

### Purchases get credited even when the browser doesn't say so

Pinterest's Conversions API reports every paid order server-side — hashed, and keyed
to the same event ID as the client-side tag — so an ad blocker, Safari's tracking
prevention, or a customer closing the tab before the pixel fires doesn't make a real
sale invisible to ad spend reporting.

---

## Security

After discovering that guest orders were readable by anyone holding the public key,
the whole surface was audited. **17 tests, 8 vulnerabilities found and fixed:**

| Issue | Fix |
|---|---|
| Client-controlled prices | Server-side pricing from the catalogue |
| Open email relay | Public send endpoint removed; email only sent as part of a real order |
| Forgeable shipping emails | Shared-secret header on the webhook, failing closed |
| HTML injection via customer name | All interpolated values escaped |
| Discount codes burnable by anyone | Public consume endpoint removed |
| Customer email enumeration | Single shared response for "used" and "not subscribed" |
| Anyone could unsubscribe anyone | HMAC-signed unsubscribe links |
| No rate limiting | Per-IP limits on every endpoint |

Each fix was re-tested by re-running the original attack. Every customer-entered
value interpolated into an email (name, address, phone, message) passes through
[`escapeHtml`](server/emails.js) first, so raw HTML or script tags can never reach
a rendered email.

---

## Automation

- **Payment → order → email**, triggered by Stripe's webhook, no manual step
- **Shipping emails** fire from a Supabase database webhook the moment an order's
  status first becomes `shipped`, including the Royal Mail tracking link
- **Delivery emails** fire the same way on `delivered`, adding each item to My QT
  Collection and sending a signed, per-item review link
- **Order references** (`HQT-1001`, guest `HQTG-1001`) generated by a Postgres
  `BEFORE INSERT` trigger off a shared sequence
- **Welcome emails** sent automatically on signup, with a signed unsubscribe link
- **Purchase conversions** reported to Pinterest server-side, independent of the browser
- **Rate limiting** on every endpoint

---

## Mini Sanji

An AI lash advisor built on the Claude API (`claude-haiku-4-5`). The system prompt
is generated at startup from the live product catalogue and the site's own FAQ
answers, so it can only ever recommend lashes that actually exist, at the correct
prices, and never goes stale when the catalogue or FAQs change.

It handles style comparisons, application troubleshooting, removal and care advice,
and a one-time nudge toward an unused welcome code for logged-in customers — but
it's explicitly instructed to stay on topic and decline anything unrelated to lashes
or the shop, so it can't be redirected into being a general-purpose assistant.

Messages are validated for role and length before reaching the API, and the
endpoint is rate limited, so it can't be repurposed as a general-purpose Claude
proxy at the shop's expense.

---

## Running locally

```bash
npm install
cp .env.example .env    # then fill in your keys
npm run dev:all         # site on :5173, API on :8787
```

`npm run dev:all` runs the Vite dev server and the Express API together. Vite
proxies `/api/*` through to the backend.

To test payments end to end you'll also need the Stripe CLI relaying webhooks:

```bash
stripe listen --forward-to localhost:8787/api/stripe-webhook
```

Test card `4242 4242 4242 4242`, any future expiry, any CVC.

In production there's no separate frontend host: `npm run build` produces `dist/`,
and the same Express server (`npm run start`) serves it alongside the API.

### Environment

See [`.env.example`](.env.example). Secrets stay server-side — only
`VITE_`-prefixed variables reach the browser, and the build is checked to confirm
no service key, Stripe secret or webhook secret appears in the bundle.

---

## Structure

```
src/
  data/pricing.js      single source of truth for prices, shared with the server
  data/products.js     the catalogue
  context/             cart and auth state
  pages/account/        dashboard, favourites, My QT Collection, details, overview
  pages/                routes, including checkout, account, review, privacy, terms
  components/           UI, AI chat, lash quiz, favourites, announcement bar
  lib/                   lash collection logic, analytics tags, text helpers
server/
  index.js              API: payments, webhooks, discounts, reviews, contact, AI chat
  emails.js             HTML email templates, escaping, signed tokens
  maintenance.js         maintenance-mode toggle and exempt paths
```

---

Built in London by Sanji Gurung.
