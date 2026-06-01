import SensorRing from './SensorRing.jsx'

// Shown while a persona keyring drives the scene. The table holds the keyring in
// place, so the ring stops pulsing (steady "locked" state) and the persona is
// announced. The TV runs the rich environment animation; the table just
// confirms the selection and invites the swap to the next character.
export default function SceneActive({ persona }) {
  return (
    <div className="scene">
      <p className="scene__status">
        <span className="scene__dot" />房子正在為你調整
      </p>

      <SensorRing accent={persona.accent} pulse={false}>
        <span className="scene__name">{persona.name}</span>
      </SensorRing>

      <div className="scene__text">
        <h1 className="scene__title">{persona.title}</h1>
        <p className="scene__line">{persona.line}</p>
        <p className="scene__hint">拿起鑰匙圈，換下一個情境</p>
      </div>
    </div>
  )
}
