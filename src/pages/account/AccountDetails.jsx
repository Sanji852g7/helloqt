import { AddressCard, BackToAccount } from './shared'
import { useAccountData } from './AccountLayout'

// /account/details: editable name, nickname, and default delivery address
export default function AccountDetails() {
  const { user, orders, profile, refreshProfile } = useAccountData()

  // The newest order that actually has an address on file, used to prefill
  // the form until the customer has saved their own default - orders are
  // already sorted newest first
  const savedAddress = orders.find((order) => order.address1)

  return (
    <div>
      <BackToAccount />
      <div className="mt-3">
        <AddressCard user={user} profile={profile} fallbackOrder={savedAddress} onSaved={refreshProfile} />
      </div>
    </div>
  )
}
