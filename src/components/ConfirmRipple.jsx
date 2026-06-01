// Brief success flash on a registered scan — bright rings snap outward and a
// check pops, centred on the sensor. CSS-animated (see style.css); App removes
// it via a timer after CONFIRM_MS, so it never depends on an animation callback.
export default function ConfirmRipple({ accent }) {
  const color = accent || 'var(--accent-2)'
  return (
    <div className="confirm" style={{ '--confirm-accent': color }}>
      <span className="confirm__ring" />
      <span className="confirm__ring confirm__ring--2" />
      <span className="confirm__check">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="3"
             strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 17 l5 5 L24 10" />
        </svg>
      </span>
    </div>
  )
}
