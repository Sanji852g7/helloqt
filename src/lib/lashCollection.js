// A soft guide, not a hard limit - customers are told to check condition
// around this point, never that the pair must be thrown away
export const MAX_WEARS = 25

// A little HelloQT personality at the wear-count milestones that matter
export function milestoneMessage(count) {
  if (count === 1) return "She's officially part of the collection 💕"
  if (count === 10) return 'Still going strong ✨'
  if (count === 20) return '20 wears! Give her a little extra care 💗'
  if (count >= MAX_WEARS) {
    return "She's had a good run 💕 Check your lashes are still in good condition before your next wear."
  }
  return null
}
