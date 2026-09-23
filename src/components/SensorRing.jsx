// Persistent concentric light waves stay centred over the physical NFC reader.
export default function SensorRing({ accent = 'var(--accent)', pulse = true, children }) {
  return (
    <div className={`sensor${pulse ? '' : ' sensor--locked'}`} style={{ '--ring-accent': accent }}>
      <div className="sensor__light" aria-hidden="true">
        <span className="sensor__aura" />
        {[0, 1, 2, 3].map(i => <span key={i} className="sensor__wave" style={{ '--wave-index': i }} />)}
        <span className="sensor__rim" />
        <span className="sensor__orbit" />
        <span className="sensor__well" />
      </div>
      <div className="sensor__icon">{children}</div>
    </div>
  )
}
