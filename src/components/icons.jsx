// Minimal line icons for the placement prompts. Sized to inherit currentColor.
export function CardIcon({ className = '' }) {
  return (
    <span className={`glass-card ${className}`} aria-hidden="true">
      <span className="glass-card__surface" />
      <span className="glass-card__edge" />
      <span className="glass-card__brand">ANLB</span>
      <span className="glass-card__caption">INVITATION</span>
      <svg className="glass-card__nfc" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M9 9a5 5 0 0 1 0 6M13 6a9 9 0 0 1 0 12M17 3a13 13 0 0 1 0 18" />
      </svg>
    </span>
  )
}

export function KeyringIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="18" cy="18" r="9" />
      <circle cx="18" cy="18" r="3" />
      <path d="M24.4 24.4 L37 37" />
      <path d="M33 33 l4 -4 3 3 -4 4 z" />
    </svg>
  )
}

// Concentric NFC "waves" — the universal contactless glyph.
export function NfcWaves(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" {...props}>
      <path d="M18 14 a14 14 0 0 1 0 20" />
      <path d="M24 18 a8 8 0 0 1 0 12" />
      <circle cx="29" cy="24" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  )
}
