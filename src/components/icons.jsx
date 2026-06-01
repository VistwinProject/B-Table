// Minimal line icons for the placement prompts. Sized to inherit currentColor.
export function CardIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7" y="13" width="34" height="22" rx="3" />
      <line x1="7" y1="20" x2="41" y2="20" />
      <line x1="13" y1="28" x2="22" y2="28" />
      <circle cx="33" cy="29" r="2.5" />
    </svg>
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
