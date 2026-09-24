// Short synthesised "pop" used for chat messages and adding to basket
export function playPop() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(650, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.16)
    osc.onended = () => ctx.close()
  } catch {
    // Web Audio isn't available — silently skip the sound
  }
}

// Plays the success chime used for a completed login and a confirmed payment
export function playSuccessSound() {
  try {
    const audio = new Audio('/media/success.mp3')
    audio.volume = 0.6
    audio.play().catch(() => {
      // Browsers can block audio before any user interaction; fail silently
    })
  } catch {
    // Audio isn't available in this environment — silently skip
  }
}

// Soft two-note synthesised chime (A5 -> C#6), used until a real chime file
// replaces it — quieter and gentler than the success sound
export function playChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    const notes = [
      { freq: 880, start: 0, duration: 0.5 },
      { freq: 1108.73, start: 0.12, duration: 0.6 },
    ]

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + start)
      gain.gain.setValueAtTime(0, now + start)
      gain.gain.linearRampToValueAtTime(0.12, now + start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + duration)
    })

    setTimeout(() => ctx.close(), 900)
  } catch {
    // Web Audio isn't available — silently skip
  }
}
