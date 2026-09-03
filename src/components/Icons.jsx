const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': 'true',
}

// Shopping bag icon for cart/basket links
export const BagIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
)

// Heart icon for favourites/love accents
export const HeartIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z" />
  </svg>
)

// Gift box icon for packaging/delivery mentions
export const BoxIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3.5 8.5 12 4l8.5 4.5L12 13 3.5 8.5Z" />
    <path d="M3.5 8.5V16l8.5 4.5V13" />
    <path d="M20.5 8.5V16L12 20.5" />
  </svg>
)

// Sparkle icon for quality/highlight callouts
export const SparkleIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9 12 3.5Z" />
    <path d="M18.5 15.5 19 17.5l2 .5-2 .5-.5 2-.5-2-2-.5 2-.5.5-2Z" />
  </svg>
)

// Leaf icon for cruelty-free/vegan messaging
export const LeafIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M5 19c0-7 5-12 14-12 0 8-4.5 12-9.5 12H5Z" />
    <path d="M5 19c2.5-3.5 5.5-6 9-7.5" />
  </svg>
)

// Delivery truck icon for shipping info
export const TruckIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M3 7h11v9H3V7Z" />
    <path d="M14 10h4l3 3v3h-7v-6Z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </svg>
)

// Repeat/reuse icon for durability messaging
export const RepeatIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 10a6 6 0 0 1 6-6h5" />
    <path d="m13 2 2.5 2L13 6" />
    <path d="M20 14a6 6 0 0 1-6 6H9" />
    <path d="m11 22-2.5-2L11 18" />
  </svg>
)

// Chat bubble icon for the AI assistant
export const ChatIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 5h16v11H8l-4 4V5Z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
)

// Paper-plane icon for sending a chat message
export const SendIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 12 20 4l-6 16-2.5-6.5L4 12Z" />
  </svg>
)

// Filled star icon for ratings/reviews
export const StarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="m12 3.6 2.5 5.1 5.6.8-4 3.9 1 5.6L12 16.4l-5.1 2.6 1-5.6-4-3.9 5.6-.8L12 3.6Z" />
  </svg>
)

// Hamburger icon for the mobile nav toggle
export const MenuIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

// X icon for closing menus/modals
export const CloseIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

// Right arrow icon for forward navigation/links
export const ArrowRightIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

// Left arrow icon for back navigation
export const ArrowLeftIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M20 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
)

// Checkmark icon for confirmations/selections
export const CheckIcon = (props) => (
  <svg {...base} {...props}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
)

// Map pin icon for location/kicker labels
export const PinIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

// Envelope icon for email contact links
export const MailIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
)

// Instagram icon for the social link
export const InstagramIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
  </svg>
)

// Trash icon for removing cart items
export const TrashIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M7 7l.8 12.1A1.5 1.5 0 0 0 9.3 20.5h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7" />
  </svg>
)

// Padlock icon for secure checkout messaging
export const LockIcon = (props) => (
  <svg {...base} {...props}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" />
  </svg>
)

// Person icon for account/login links
export const UserIcon = (props) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-4 3.2-6.5 7-6.5s7 2.5 7 6.5" />
  </svg>
)
