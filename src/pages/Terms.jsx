import PolicyLayout, { BUSINESS, EmailLink, Section } from '../components/PolicyLayout'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../data/pricing'
import { formatPrice } from '../context/CartContext'

const sections = [
  { id: 'about-us', title: 'About us' },
  { id: 'who-can-buy', title: 'Who can buy' },
  { id: 'products', title: 'Products and prices' },
  { id: 'your-order', title: 'Placing your order' },
  { id: 'payment', title: 'Payment' },
  { id: 'delivery', title: 'Delivery' },
  { id: 'cancelling', title: 'Cancelling your order' },
  { id: 'hygiene', title: 'The hygiene exception' },
  { id: 'faulty', title: 'Faulty or wrong items' },
  { id: 'refunds', title: 'How refunds are paid' },
  { id: 'safe-use', title: 'Using lashes safely' },
  { id: 'discounts', title: 'Discount codes' },
  { id: 'accounts', title: 'Your account' },
  { id: 'our-rights', title: 'Content and copyright' },
  { id: 'liability', title: 'My responsibility to you' },
  { id: 'complaints', title: 'Complaints' },
  { id: 'general', title: 'General' },
  { id: 'law', title: 'Governing law' },
]

// Terms & conditions: the rules of shopping with HelloQT
export default function Terms() {
  return (
    <PolicyLayout
      eyebrow="Terms &amp; conditions"
      title="Shopping with HelloQT"
      sections={sections}
      intro="These are the terms that apply when you buy from HelloQT. I have written them in plain English on purpose, because terms nobody can read are no use to anybody. Nothing here takes away the rights you have by law as a UK consumer."
    >
      <Section id="about-us" title="About us">
        <p>
          {BUSINESS.name} is a small, cruelty-free strip lash brand run by {BUSINESS.owner}, trading
          from {BUSINESS.tradingAddress}. You can reach me any time at <EmailLink />, and I aim to
          reply within two working days.
        </p>
        <p>
          HelloQT is not currently VAT registered, so no VAT is charged on your order and the price
          you see is the price you pay.
        </p>
      </Section>

      <Section id="who-can-buy" title="Who can buy">
        <p>
          You need to be at least 18 to place an order, and I currently only deliver within the
          United Kingdom.
        </p>
      </Section>

      <Section id="products" title="Products and prices">
        <p>
          All prices are in pounds sterling. Delivery is shown separately at checkout before you pay,
          so you always see the full amount first.
        </p>
        <p>
          Every pair is photographed as honestly as I can manage, but screens vary and these are
          handmade, so slight differences between the photo and the lashes in your hand are normal.
          Lash glue is not included with your lashes.
        </p>
        <p>
          If a price is ever listed wrongly by mistake, I will contact you before dispatching and you
          can choose to go ahead at the correct price or cancel for a full refund.
        </p>
      </Section>

      <Section id="your-order" title="Placing your order">
        <p>
          Putting items in your basket does not reserve them. Your order is accepted, and a contract
          between us formed, when I email you an order confirmation with your order number. If
          something is out of stock after you order, I will tell you and refund you in full.
        </p>
        <p>
          Please check your delivery address carefully before paying. If a parcel is returned to me
          because the address given was wrong or incomplete, I will happily resend it, but I will
          need to ask you to cover the postage again.
        </p>
      </Section>

      <Section id="payment" title="Payment">
        <p>
          Payment is taken by Stripe, a regulated payment provider. Your card details go directly to
          Stripe and are never seen, handled or stored by HelloQT.
        </p>
      </Section>

      <Section id="delivery" title="Delivery">
        <p>
          Orders are sent with Royal Mail and usually arrive within 2–3 working days of dispatch.
          Delivery costs {formatPrice(SHIPPING_FEE)}, and is free on orders of{' '}
          {formatPrice(FREE_SHIPPING_THRESHOLD)} and over.
        </p>
        <p>
          Where a tracking number is available, I will email it to you when your parcel is posted,
          and you can also see it in your account. By law your order will be delivered within 30 days
          unless we have agreed otherwise.
        </p>
      </Section>

      <Section id="cancelling" title="Cancelling your order">
        <p>
          As a UK consumer buying online, you have a legal right to cancel within 14 days of
          receiving your order, without giving any reason. This comes from the Consumer Contracts
          (Information, Cancellation and Additional Charges) Regulations 2013.
        </p>
        <p>
          To cancel, just email <EmailLink /> and tell me you would like to cancel, quoting your
          order number. You do not need a special form or a reason. Once you have told me, you then
          have a further 14 days to send the items back.
        </p>
        <p>
          <strong className="text-plum-800">Return postage:</strong> if you are cancelling simply
          because you changed your mind, you pay the cost of returning the items to me. If the items
          are faulty, damaged or not what you ordered, I cover the return postage instead.
        </p>
      </Section>

      <Section id="hygiene" title="The hygiene exception">
        <p>
          Lashes are a hygiene product worn against the eye, so once the packaging has been opened
          they cannot be resold and the right to cancel above no longer applies to them. This is
          allowed under the same Regulations, which make an exception for sealed goods that are not
          suitable for return once unsealed for health or hygiene reasons.
        </p>
        <p>
          In plain terms: if your lashes are still sealed and unopened, you can change your mind
          within 14 days. Once you have opened them, I can only help if something is wrong with them,
          which is covered next.
        </p>
      </Section>

      <Section id="faulty" title="Faulty or wrong items">
        <p>
          The hygiene exception never affects your rights over faulty goods. Under the Consumer
          Rights Act 2015 your lashes must be of satisfactory quality, fit for purpose and as
          described.
        </p>
        <p>
          If your order arrives damaged, faulty or is not what you ordered, email me within a
          reasonable time, with a photo if you can, and I will put it right with a replacement or a
          full refund including any postage you paid. Opened or not, and I cover the return cost.
        </p>
      </Section>

      <Section id="refunds" title="How refunds are paid">
        <p>
          Refunds go back to the card you paid with, within 14 days of me receiving the items back,
          or of you proving you have sent them, whichever is sooner. For a cancellation, that
          includes the standard delivery you originally paid.
        </p>
      </Section>

      <Section id="safe-use" title="Using lashes safely">
        <p>
          Strip lashes are applied close to the eye, so please take care. Follow the instructions on
          whichever lash glue you use, and patch test that glue at least 24 to 48 hours beforehand,
          as a small number of people react to lash adhesives.
        </p>
        <p>
          Do not use lashes on broken, irritated or infected skin or eyes, never share them with
          anybody else, and stop using them and speak to a pharmacist or doctor if you notice any
          irritation. Keep them away from young children.
        </p>
      </Section>

      <Section id="discounts" title="Discount codes">
        <p>
          The 10% welcome code is one use per customer, applies to the value of the lashes rather
          than delivery, and cannot be combined with another offer unless I say otherwise. I may
          withdraw or change a code at any time, though never on an order you have already placed.
        </p>
      </Section>

      <Section id="accounts" title="Your account">
        <p>
          If you create an account, please keep your password to yourself and let me know if you
          think somebody else has got hold of it. You can ask me to close your account at any time by
          emailing <EmailLink />.
        </p>
      </Section>

      <Section id="our-rights" title="Content and copyright">
        <p>
          The HelloQT name, logo, photographs and words on this site are mine, and cannot be copied
          or reused for anything else without my permission.
        </p>
      </Section>

      <Section id="liability" title="My responsibility to you">
        <p>
          If I fail to meet these terms, I am responsible for loss that is a foreseeable result of
          that, but not for anything unforeseeable, and not for business losses, as this shop is for
          personal use.
        </p>
        <p>
          Nothing in these terms limits or removes your legal rights as a consumer, and nothing here
          limits my liability for death or personal injury caused by negligence, or for fraud. If any
          part of these terms turns out to be unenforceable, the rest still applies.
        </p>
      </Section>

      <Section id="complaints" title="Complaints">
        <p>
          If something has gone wrong, please email <EmailLink /> and I will always try to sort it
          out personally and quickly. HelloQT does not currently belong to an alternative dispute
          resolution scheme, so if we cannot resolve it between us, you are free to take the matter
          to the courts, or to get free advice from Citizens Advice on 0808 223 1133.
        </p>
      </Section>

      <Section id="general" title="General">
        <p>
          I may update these terms from time to time, for example if I change delivery options. The
          terms that apply to your order are the ones published when you placed it, so updating them
          never changes an order already made.
        </p>
        <p>
          I am not responsible for delays outside my control, such as postal strikes or extreme
          weather, but I will always keep you updated and you can cancel for a full refund if a delay
          becomes substantial.
        </p>
      </Section>

      <Section id="law" title="Governing law">
        <p>
          These terms are governed by the law of England and Wales, and any dispute can be brought in
          the courts of England and Wales. If you live in Scotland or Northern Ireland, you can bring
          proceedings in your own country instead.
        </p>
      </Section>
    </PolicyLayout>
  )
}
