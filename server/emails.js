import 'dotenv/config'
import crypto from 'node:crypto'

const PORT = process.env.PORT || 8787

// TODO: update these once the site and this backend are deployed publicly —
// email links use these to build real, clickable URLs
export const SITE_BASE_URL = process.env.SITE_BASE_URL || 'http://localhost:5173'
export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || `http://localhost:${PORT}`

// The one shared 10%-off code every subscriber gets; usage is tracked per email
export const WELCOME_CODE = 'WELCOME10'

// Raw GitHub URLs so email clients and Stripe can load images before the site
// has real hosting
const MEDIA_BASE = 'https://raw.githubusercontent.com/Sanji852g7/helloqt/main/public/media'
const LOGO_URL = `${MEDIA_BASE}/helloqtlogo.JPG`

// Turns a local image path like /media/angel.JPG into a publicly reachable URL
export function mediaUrl(imagePath) {
  return `${MEDIA_BASE}/${encodeURIComponent(String(imagePath).split('/').pop())}`
}

// Signs unsubscribe links so only a real HelloQT email can unsubscribe someone.
// Derived from the service role key when no dedicated secret is configured.
const UNSUBSCRIBE_SECRET =
  process.env.UNSUBSCRIBE_SECRET ||
  (process.env.SUPABASE_SERVICE_ROLE_KEY
    ? crypto
        .createHash('sha256')
        .update(`helloqt-unsubscribe:${process.env.SUPABASE_SERVICE_ROLE_KEY}`)
        .digest('hex')
    : null)

// Escapes user text so it can never inject HTML or scripts into an email
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Creates the signature proving an unsubscribe link came from a HelloQT email
export function unsubscribeToken(email) {
  if (!UNSUBSCRIBE_SECRET) return null
  return crypto
    .createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(String(email).toLowerCase())
    .digest('hex')
    .slice(0, 32)
}

// Creates the signature proving a review link came from a genuine delivered-
// order email, not a guessed URL — the same secret as unsubscribe links,
// since both just need to prove "this really came from us"
export function reviewToken(orderRef) {
  if (!UNSUBSCRIBE_SECRET) return null
  return crypto
    .createHmac('sha256', UNSUBSCRIBE_SECRET)
    .update(`review:${orderRef}`)
    .digest('hex')
    .slice(0, 32)
}

// Wraps email content in a full, table-based HTML document so phone and
// desktop mail apps render it the same way, instead of a bare styled div
function emailLayout(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>HelloQT</title>
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #fdf8f3; }
</style>
</head>
<body bgcolor="#fdf8f3" style="margin:0; padding:0; background-color:#fdf8f3;">
  <table role="presentation" bgcolor="#fdf8f3" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fdf8f3; width:100%; min-width:100%;">
    <tr>
      <td align="center" bgcolor="#fdf8f3" style="background-color:#fdf8f3; padding:24px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px; width:100%;">
          <tr>
            <td style="font-family:Helvetica, Arial, sans-serif; font-size:15px; line-height:1.5; color:#3a2233;">
              ${bodyHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// Builds the shared footer appended to every outgoing email
function emailFooter({ unsubscribeEmail } = {}) {
  const token = unsubscribeEmail ? unsubscribeToken(unsubscribeEmail) : null
  // Signed so the link only works from a real HelloQT email, not a guessed URL
  const unsubscribeUrl = token
    ? `${BACKEND_BASE_URL}/api/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}&t=${token}`
    : null

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:36px; border-top:1px solid #f0d6dd;">
      <tr>
        <td style="padding-top:24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align:middle;">
                <img src="${LOGO_URL}" alt="" width="32" height="32" style="border-radius:50%; display:block;" />
              </td>
              <td style="padding-left:8px; vertical-align:middle; font-size:15px; font-weight:bold; color:#3a2233;">HelloQT</td>
            </tr>
          </table>
          <p style="margin:10px 0 14px; font-size:12px; color:#8a5a68; line-height:1.6;">
            Handcrafted, reusable and cruelty-free lashes, packed with love by me.<br />
            London, UK
          </p>
          <p style="margin:0 0 14px; font-size:12px;">
            <a href="${SITE_BASE_URL}/shop" style="color:#ab5a76; text-decoration:none;">Shop</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE_BASE_URL}/about" style="color:#ab5a76; text-decoration:none;">My story</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE_BASE_URL}/contact" style="color:#ab5a76; text-decoration:none;">Contact</a>
            &nbsp;&middot;&nbsp;
            <a href="https://www.instagram.com/helloqtcos/" style="color:#ab5a76; text-decoration:none;">Instagram</a>
          </p>
          <p style="margin:0; font-size:11px; color:#b498a2;">
            &copy; ${new Date().getFullYear()} HelloQT. All rights reserved.
            ${
              unsubscribeUrl
                ? ` &middot; <a href="${unsubscribeUrl}" style="color:#b498a2;">Unsubscribe</a>`
                : ''
            }
          </p>
        </td>
      </tr>
    </table>
  `
}

// Builds the order confirmation email's HTML body
export function orderEmailHtml({ orderRef, fullName, items, total }) {
  const itemRows = items
    .map((item) => {
      const imageUrl = mediaUrl(item.image)
      return `
        <tr>
          <td style="padding:10px 0; width:56px;">
            <img src="${imageUrl}" alt="${escapeHtml(item.name)}" width="48" height="48"
              style="border-radius:8px; display:block;" />
          </td>
          <td style="padding:10px 0; font-size:14px;">${escapeHtml(item.name)} × ${Number(item.quantity)}</td>
          <td style="padding:10px 0; font-size:14px; text-align:right;">£${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    })
    .join('')

  return emailLayout(`
    <img src="${LOGO_URL}" alt="HelloQT" width="56" height="56"
      style="border-radius:50%; display:block; margin-bottom:12px;" />
    <h1 style="color:#ec5c8d; font-size:22px; margin:0 0 12px;">Thank you, ${escapeHtml(fullName) || 'lovely'}! 💕</h1>
    <p style="margin:0 0 12px;">Your order <strong>${escapeHtml(orderRef)}</strong> is confirmed and will be on its way within 2-3 working days.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${itemRows}</table>
    <p style="margin-top:16px; font-weight:bold;">Total: £${Number(total).toFixed(2)}</p>
    <p style="margin-top:24px; font-family:cursive, Georgia, serif; font-size:20px;">xo, Sanji</p>
    ${emailFooter()}
  `)
}

// Builds the welcome discount code email's HTML body
export function welcomeEmailHtml({ email }) {
  return emailLayout(`
    <img src="${LOGO_URL}" alt="HelloQT" width="56" height="56"
      style="border-radius:50%; display:block; margin-bottom:12px;" />
    <h1 style="color:#ec5c8d; font-size:22px; margin:0 0 12px;">Welcome to HelloQT! 💕</h1>
    <p style="margin:0 0 12px;">Here's 10% off your first order, just enter this code at checkout:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="font-size:22px; font-weight:bold; letter-spacing:1px; background:#fdf0f4; padding:12px 16px; border-radius:12px;">${WELCOME_CODE}</td>
      </tr>
    </table>
    <p style="margin-top:16px;">One code, one use per customer, valid on your first order.</p>
    <p style="margin-top:24px; font-family:cursive, Georgia, serif; font-size:20px;">xo, Sanji</p>
    ${emailFooter({ unsubscribeEmail: email })}
  `)
}

// Builds the Royal Mail tracking page URL for a given tracking number
function royalMailTrackingUrl(trackingNumber) {
  return `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(trackingNumber)}`
}

// Builds the shipping notification email's HTML body
export function shippingEmailHtml({ orderRef, fullName, trackingNumber }) {
  return emailLayout(`
    <img src="${LOGO_URL}" alt="HelloQT" width="56" height="56"
      style="border-radius:50%; display:block; margin-bottom:12px;" />
    <h1 style="color:#ec5c8d; font-size:22px; margin:0 0 12px;">Your order's on its way! 📦</h1>
    <p style="margin:0 0 12px;">Hi ${escapeHtml(fullName) || 'lovely'}, your order <strong>${escapeHtml(orderRef)}</strong> has been posted with Royal Mail.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="font-size:18px; font-weight:bold; letter-spacing:0.5px; background:#fdf0f4; padding:12px 16px; border-radius:12px;">${escapeHtml(trackingNumber)}</td>
      </tr>
    </table>
    <p style="margin-top:16px;">
      <a href="${royalMailTrackingUrl(trackingNumber)}" style="color:#ec5c8d; font-weight:bold;">Track your parcel with Royal Mail &rarr;</a>
    </p>
    <p style="margin-top:24px; font-family:cursive, Georgia, serif; font-size:20px;">xo, Sanji</p>
    ${emailFooter()}
  `)
}

// Builds the "how was it?" review request email's HTML body, sent once an
// order is marked delivered
export function reviewRequestEmailHtml({ orderRef, fullName, reviewUrl }) {
  return emailLayout(`
    <img src="${LOGO_URL}" alt="HelloQT" width="56" height="56"
      style="border-radius:50%; display:block; margin-bottom:12px;" />
    <h1 style="color:#ec5c8d; font-size:22px; margin:0 0 12px;">How was it, ${escapeHtml(fullName) || 'lovely'}? 💕</h1>
    <p style="margin:0 0 12px;">Your order <strong>${escapeHtml(orderRef)}</strong> should have landed with you by now. I'd love to know what you thought!</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
      <tr>
        <td style="border-radius:14px; background:#ec5c8d;">
          <a href="${reviewUrl}" style="display:inline-block; padding:14px 24px; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none;">Leave a review &rarr;</a>
        </td>
      </tr>
    </table>
    <p style="margin-top:20px; font-size:13px; color:#8a5a68;">Takes less than a minute, and it means the world to a small business like mine.</p>
    <p style="margin-top:24px; font-family:cursive, Georgia, serif; font-size:20px;">xo, Sanji</p>
    ${emailFooter()}
  `)
}

// Builds the email that lands in Sanji's own inbox when someone uses the
// contact form. Not a marketing email, so no unsubscribe footer — this one
// goes to her, not a customer.
export function contactEnquiryEmailHtml({ name, email, message }) {
  // Preserve the customer's paragraph breaks without ever trusting their
  // text as HTML — escape first, then turn plain newlines into <br>s
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>')
  return emailLayout(`
    <h1 style="color:#ec5c8d; font-size:22px; margin:0 0 12px;">New enquiry from your site 💌</h1>
    <p style="margin:0 0 4px;"><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
      <tr>
        <td style="background:#fdf0f4; border-radius:12px; padding:16px; line-height:1.6;">${safeMessage}</td>
      </tr>
    </table>
    <p style="margin-top:18px; font-size:13px; color:#8a5a68;">Just hit reply, it'll go straight to ${escapeHtml(name)}.</p>
  `)
}
