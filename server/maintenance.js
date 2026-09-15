// Whether the shop is currently paused, checked live on every request so
// flipping MAINTENANCE_MODE in Render (and letting it redeploy) is the only
// step needed — no code change required.
export const isMaintenanceMode = () => process.env.MAINTENANCE_MODE === 'true'

// Custom note shown under the heading, so a specific update can say what's
// happening (e.g. "updating prices") instead of the generic message
const customMessage = () => process.env.MAINTENANCE_MESSAGE?.trim() || ''

// Paths that must keep working during maintenance: Stripe and Supabase are
// reporting something that has ALREADY happened (a payment went through, an
// order shipped) — dropping those would lose a real order or tracking email,
// not just show a visitor a "back soon" page
export const MAINTENANCE_EXEMPT_PATHS = ['/api/stripe-webhook', '/api/order-webhook']

// The plain, on-brand page every visitor sees while the shop is paused
export function maintenancePageHtml() {
  const message = customMessage()
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>HelloQT — back very soon</title>
<style>
  @font-face { font-family: fallback; src: local(""); }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(160deg, #FFEDF4 0%, #FFFBF7 55%, #FBF3DF 100%);
    font-family: Georgia, 'Playfair Display', serif;
    color: #4C2246;
    text-align: center;
  }
  .card {
    max-width: 460px;
    background: #FFFBF7;
    border: 1px solid #FFD6E6;
    border-radius: 28px;
    padding: 48px 36px;
    box-shadow: 0 18px 40px -18px rgba(110, 24, 57, 0.28);
  }
  .heart {
    font-size: 40px;
    line-height: 1;
    margin-bottom: 8px;
  }
  h1 {
    margin: 0 0 12px;
    font-size: 28px;
    font-weight: 700;
    color: #93214E;
  }
  p {
    margin: 0 0 8px;
    font-family: 'Quicksand', ui-sans-serif, system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.6;
    color: #63305A;
  }
  .note {
    margin-top: 16px;
    padding: 12px 16px;
    background: #FFF7FA;
    border-radius: 14px;
    font-size: 14px;
    color: #B92C63;
    font-weight: 600;
  }
  a {
    color: #DB3F7D;
    text-decoration: none;
    font-weight: 600;
  }
  .sign-off {
    margin-top: 22px;
    font-family: 'Parisienne', cursive;
    font-size: 22px;
    color: #DB3F7D;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="heart">💕</div>
    <h1>Back very soon</h1>
    <p>HelloQT is having a little makeover behind the scenes.</p>
    <p>Thanks so much for your patience, normal service (and lashes) will be back shortly.</p>
    ${message ? `<div class="note">${escapeForMaintenancePage(message)}</div>` : ''}
    <p style="margin-top:18px;">Something urgent? Email
      <a href="mailto:helloqts@hotmail.com">helloqts@hotmail.com</a>
    </p>
    <p class="sign-off">xo, Sanji</p>
  </div>
</body>
</html>`
}

// Keeps a custom maintenance message from being able to inject HTML, since
// it comes from an environment variable someone could mistype or copy-paste
function escapeForMaintenancePage(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
