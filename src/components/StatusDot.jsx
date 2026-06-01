// Tiny ops-only indicator in a corner — invisible to the experience but tells a
// docent at a glance whether the cue-server / reader is live. Not for visitors.
export default function StatusDot({ wsStatus, connected }) {
  const ok    = wsStatus === 'connected'
  const label = !ok ? '連線中' : connected ? '讀卡機就緒' : '等待讀卡機'
  const tone  = !ok ? 'down' : connected ? 'live' : 'idle'
  return (
    <div className={`statusdot statusdot--${tone}`} title={`${wsStatus} · reader:${connected}`}>
      <span className="statusdot__led" />
      <span className="statusdot__label">{label}</span>
    </div>
  )
}
