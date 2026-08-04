// The physical NFC sensor target, projected onto the table — the spot the
// visitor places the card / keyring onto, so it must read as "put it HERE".
//
// All perpetual motion (pulses, scan sweep) is pure CSS, NOT framer-motion:
// AnimatePresence will not fire "safe to remove" while an exiting subtree still
// has framer animations running, and `repeat: Infinity` never settles — so a
// framer-driven ring would leave ghost screens stacked on the projection.
//
// `pulse` toggles the outward ripples (the attract invitation). With a tag on
// the reader the caller drops pulse so the ring holds a steady "locked" state.
export default function SensorRing({ accent = 'var(--accent)', pulse = true, children }) {
  return (
    <div className={`sensor${pulse ? '' : ' sensor--locked'}`} style={{ '--ring-accent': accent }}>
      {/* 常駐、不卸載 — 只用 CSS 藏起來。卸載會讓動畫重新起跑,而標題的 prompt-glow
          是跟這組脈動鎖相的(圓最小=全暗、最大=最亮),重起跑就會失去相位。 */}
      {[0, 1, 2].map((i) => (
        <span key={i} className="sensor__pulse" />
      ))}

      <span className="sensor__ring sensor__ring--outer" />
      <span className="sensor__sweep" />
      <span className="sensor__ring sensor__ring--inner" />
      <span className="sensor__core" />

      <div className="sensor__icon">{children}</div>
    </div>
  )
}
