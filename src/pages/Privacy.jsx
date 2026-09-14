import PolicyLayout, { BUSINESS, EmailLink, Section } from '../components/PolicyLayout'

const sections = [
  { id: 'who-i-am', title: 'Who I am' },
  { id: 'what-i-collect', title: 'What I collect' },
  { id: 'why-and-lawful-basis', title: 'Why, and my lawful basis' },
  { id: 'who-i-share-with', title: 'Who I share it with' },
  { id: 'outside-the-uk', title: 'Data outside the UK' },
  { id: 'how-long', title: 'How long I keep it' },
  { id: 'marketing', title: 'Marketing emails' },
  { id: 'cookies', title: 'Cookies and your basket' },
  { id: 'mini-sanji', title: 'Mini Sanji, the AI advisor' },
  { id: 'security', title: 'Keeping it safe' },
  { id: 'your-rights', title: 'Your rights' },
  { id: 'complaints', title: 'Complaints' },
  { id: 'children', title: 'Children' },
  { id: 'changes', title: 'Changes to this policy' },
]

// Each thing HelloQT does with personal data, and the legal reason for it.
// The ICO expects this link to be spelled out rather than described in general
// terms, which is why it is set out as a table.
const lawfulBases = [
  {
    purpose: 'Taking payment and sending you your order',
    data: 'Name, email, delivery address, phone (if given), order details',
    basis: 'Performance of a contract',
  },
  {
    purpose: 'Emailing your order confirmation and delivery tracking',
    data: 'Name, email, order details, tracking number',
    basis: 'Performance of a contract',
  },
  {
    purpose: 'Running your account and showing your order history',
    data: 'Email, password (stored encrypted), order history',
    basis: 'Performance of a contract',
  },
  {
    purpose: 'Sending your 10% code and occasional emails about HelloQT',
    data: 'Email address',
    basis: 'Consent, which you can withdraw at any time',
  },
  {
    purpose: 'Replying to your message or Mini Sanji question',
    data: 'Name, email, what you wrote',
    basis: 'Legitimate interests (answering customers)',
  },
  {
    purpose: 'Keeping the site secure and preventing fraud',
    data: 'IP address, request history',
    basis: 'Legitimate interests (protecting the shop)',
  },
  {
    purpose: 'Keeping business and tax records',
    data: 'Order and payment records',
    basis: 'Legal obligation',
  },
]

// Privacy policy: what data HelloQT collects, why, and how to control it
export default function Privacy() {
  return (
    <PolicyLayout
      eyebrow="Privacy policy"
      title="Your privacy"
      sections={sections}
      intro={`${BUSINESS.name} is a small, one-woman lash brand run by me, Sanji, in London. This page explains exactly what personal information I collect when you use this site, why I collect it, who else sees it and what you can ask me to do about it. I only ever use your details to run your order and, if you have asked for them, my emails.`}
    >
      <Section id="who-i-am" title="Who I am">
        <p>
          {BUSINESS.name} is run by {BUSINESS.owner}, trading from {BUSINESS.tradingAddress}. For
          anything in this policy, including any request about your data, email <EmailLink />.
        </p>
        <p>
          I am the data controller for the information described here, which means I am the one
          responsible for how it is looked after.
        </p>
      </Section>

      <Section id="what-i-collect" title="What I collect">
        <p>Depending on how you use the site, I may collect:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-plum-800">When you order:</strong> your name, email address,
            delivery address, phone number if you give one, and what you bought
          </li>
          <li>
            <strong className="text-plum-800">When you create an account:</strong> your email
            address and a password, which is stored encrypted and which I cannot see
          </li>
          <li>
            <strong className="text-plum-800">When you sign up for 10% off:</strong> your email
            address
          </li>
          <li>
            <strong className="text-plum-800">When you get in touch:</strong> your name, email and
            whatever you write to me, including messages to Mini Sanji
          </li>
          <li>
            <strong className="text-plum-800">Automatically:</strong> your IP address and basic
            request information, used to keep the site secure and stop it being abused
          </li>
        </ul>
        <p>
          <strong className="text-plum-800">I never see your card details.</strong> Payment is
          handled entirely by Stripe. Your card number goes directly to them and never reaches my
          website or my records.
        </p>
      </Section>

      <Section id="why-and-lawful-basis" title="Why, and my lawful basis">
        <p>
          Data protection law says I must have a specific legal reason for each thing I do with your
          information. Here is every one of them:
        </p>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-blush-200">
                <th className="py-2 pr-4 font-display font-bold text-plum-900">What for</th>
                <th className="py-2 pr-4 font-display font-bold text-plum-900">What I use</th>
                <th className="py-2 font-display font-bold text-plum-900">Legal reason</th>
              </tr>
            </thead>
            <tbody>
              {lawfulBases.map((row) => (
                <tr key={row.purpose} className="border-b border-blush-100 align-top">
                  <td className="py-3 pr-4 text-plum-700">{row.purpose}</td>
                  <td className="py-3 pr-4 text-plum-600">{row.data}</td>
                  <td className="py-3 text-plum-600">{row.basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          I do not use your information to make any automated decision about you, and I never sell
          it or share it for anyone else's marketing.
        </p>
      </Section>

      <Section id="who-i-share-with" title="Who I share it with">
        <p>
          I use a few trusted companies to actually run the shop. They only ever receive what they
          need for their part of it:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-plum-800">Stripe</strong> — takes your payment securely and
            receives your name, email and payment details
          </li>
          <li>
            <strong className="text-plum-800">Supabase</strong> — stores your account and order
            records
          </li>
          <li>
            <strong className="text-plum-800">Resend</strong> — sends your order, delivery and
            account emails on my behalf
          </li>
          <li>
            <strong className="text-plum-800">Anthropic</strong> — powers Mini Sanji, and receives
            only the messages you choose to send it
          </li>
          <li>
            <strong className="text-plum-800">Royal Mail</strong> — receives your name and delivery
            address so your parcel can reach you
          </li>
        </ul>
        <p>
          I may also share information where I am legally required to, for example with HMRC for tax
          records.
        </p>
      </Section>

      <Section id="outside-the-uk" title="Data outside the UK">
        <p>
          Some of the companies above are based in, or store data in, countries outside the UK,
          including the United States. Where that happens, they are required to protect your
          information to a standard recognised by UK law, using safeguards such as the UK's
          International Data Transfer Agreement or an adequacy decision. If you would like more
          detail about a specific one, just ask.
        </p>
      </Section>

      <Section id="how-long" title="How long I keep it">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-plum-800">Order and payment records:</strong> six years from the
            end of the tax year they fall in, because HMRC requires it
          </li>
          <li>
            <strong className="text-plum-800">Your account:</strong> until you ask me to close it
          </li>
          <li>
            <strong className="text-plum-800">Marketing sign-ups:</strong> until you unsubscribe.
            After that I keep a note of your unsubscribe so I do not email you again by mistake
          </li>
          <li>
            <strong className="text-plum-800">Messages you send me:</strong> up to two years, so I
            have context if you get back in touch
          </li>
        </ul>
      </Section>

      <Section id="marketing" title="Marketing emails">
        <p>
          I only send marketing emails to people who have asked for them, or who have bought from me
          and were offered the choice to opt out at the time. Every single marketing email has an
          unsubscribe link at the bottom, and unsubscribing takes effect straight away.
        </p>
        <p>
          Order confirmations and delivery updates are not marketing, so you will still receive
          those for any order you place, even if you have unsubscribed.
        </p>
      </Section>

      <Section id="cookies" title="Cookies and your basket">
        <p>
          This site stores your basket and a couple of small preferences, such as whether you have
          already seen the discount pop-up, in your own browser on your own device. It does not
          track you across other websites, and there are no advertising or analytics trackers.
        </p>
        <p>
          Stripe may set its own cookies on its payment page to prevent fraud. That is covered by
          Stripe's own privacy policy.
        </p>
      </Section>

      <Section id="mini-sanji" title="Mini Sanji, the AI advisor">
        <p>
          Mini Sanji is an AI lash advisor, not me personally, and it will tell you so if you ask.
          When you send it a message, that message is sent to Anthropic to generate a reply. Please
          do not type anything sensitive into it. Your chat is not linked to your account or used to
          market to you.
        </p>
      </Section>

      <Section id="security" title="Keeping it safe">
        <p>
          The site is served over an encrypted connection, passwords are stored hashed so nobody
          including me can read them, and access to order records is restricted so one customer can
          never see another customer's details. If anything ever did go wrong in a way that put your
          rights at risk, I am required to tell both you and the ICO.
        </p>
      </Section>

      <Section id="your-rights" title="Your rights">
        <p>Under UK data protection law you have the right to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Ask for a copy of the personal information I hold about you</li>
          <li>Have anything inaccurate corrected</li>
          <li>Ask me to delete your information, where I am not legally required to keep it</li>
          <li>Ask me to restrict what I do with it, or object to a particular use</li>
          <li>Ask for your information in a portable, machine-readable format</li>
          <li>Withdraw your consent to marketing at any time</li>
        </ul>
        <p>
          Email <EmailLink /> and I will respond within one month. It is free, and I will not ask you
          why.
        </p>
      </Section>

      <Section id="complaints" title="Complaints">
        <p>
          If you are unhappy with how I have handled your information, please tell me first and I
          will do my best to put it right. You also have the right to complain to the Information
          Commissioner's Office, the UK's data protection regulator, at{' '}
          <a
            href="https://ico.org.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blush-700"
          >
            ico.org.uk
          </a>{' '}
          or on 0303 123 1113.
        </p>
      </Section>

      <Section id="children" title="Children">
        <p>
          This shop is intended for adults. I do not knowingly collect information from anyone under
          16. If you believe a child has given me their details, email me and I will delete them.
        </p>
      </Section>

      <Section id="changes" title="Changes to this policy">
        <p>
          If this policy changes I will update this page and the date at the top. The version shown
          here is always the current one.
        </p>
      </Section>
    </PolicyLayout>
  )
}
