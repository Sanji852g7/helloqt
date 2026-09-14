# HelloQT

A full-stack e-commerce shop for a real cruelty-free strip lash brand, built and run
by its founder. Ten hand-finished lash styles across two collections, with real card
payments, customer accounts, order tracking and an AI lash advisor.

This is a working business, not a tutorial project. Everything here handles real
money, real customer data and real UK consumer law.

**Status:** feature complete, running against Stripe's sandbox. Pending go-live:
hosting, domain, and switching Stripe to live keys.

---

## What it does

| Area | Built |
|---|---|
| **Shop** | 10 products, 2 collections, filtering, product pages, basket |
| **Payments** | Stripe Checkout, prices calculated server-side, webhook-confirmed orders |
| **Accounts** | Supabase Auth, order history, 4-stage delivery tracker |
| **Fulfilment** | Automatic order + shipping emails with Royal Mail tracking |
| **Marketing** | Email capture, one-per-customer welcome code, signed unsubscribe links |
| **AI** | Mini Sanji, a lash advisor grounded in the live product catalogue |
| **Legal** | UK-researched privacy policy and terms, GDPR lawful-basis table |

---

## Stack

**Frontend** — React 18, Vite, React Router 6, Tailwind CSS
**Backend** — Node, Express 5
**Data & auth** — Supabase (Postgres + Auth, with Row Level Security)
**Payments** — Stripe Checkout
**Email** — Resend
**AI** — Claude API (`@anthropic-ai/sdk`)

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

Each fix was re-tested by re-running the original attack. Escaping is covered by a
script that asserts raw payloads never survive into rendered email HTML.

---

## Automation

- **Payment → order → email**, triggered by Stripe's webhook, no manual step
- **Shipping emails** fire from a Supabase database webhook the moment an order's
  status first becomes `shipped`, including the Royal Mail tracking link
- **Order references** (`HQT-1001`, guest `HQTG-1001`) generated by a Postgres
  `BEFORE INSERT` trigger off a shared sequence
- **Welcome emails** sent automatically on signup, with a signed unsubscribe link
- **Rate limiting** on every endpoint

---

## Mini Sanji

An AI lash advisor built on the Claude API. The system prompt is generated at
startup from the live product catalogue, so it can only ever recommend lashes that
actually exist, at the correct prices, and never goes stale when the catalogue
changes.

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

### Environment

See [`.env.example`](.env.example). Secrets stay server-side — only
`VITE_`-prefixed variables reach the browser, and the build is checked to confirm
no service key, Stripe secret or webhook secret appears in the bundle.

---

## Structure

```
src/
  data/pricing.js     single source of truth for prices, shared with the server
  data/products.js    the catalogue
  context/            cart and auth state
  pages/              routes, including checkout, account, privacy, terms
  components/         UI, AI chat, lash quiz
server/
  index.js            API: payments, webhooks, discounts, subscriptions, AI chat
  emails.js           HTML email templates, escaping, signed unsubscribe tokens
```

---

## Still to do

- [ ] Deploy (site + API) and point the domain at it
- [ ] Verify the domain with Resend so customer emails reach non-test inboxes
- [ ] Switch Stripe to live keys once business verification completes
- [ ] Add the Anthropic key to enable Mini Sanji in production
- [ ] Point the Supabase shipping webhook at the deployed URL
- [ ] Reset the order sequence and clear test data before launch
- [ ] Once live: update the **Status** line at the top, add the live URL, and
      delete this checklist. Nothing else in this README goes out of date.

---

Built in London by Sanji Gurung.
