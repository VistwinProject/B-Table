import { useRef } from 'react'

// Right half of the table projection — the *words*. Three crossfading blocks
// (card / character / scene), only one active per step. The scene block is the
// emotional centrepiece: it voices the persona's pain (L3) so the visitor feels
// seen before the TV answers with the solution.
export default function RightPanel({ step, persona }) {
  // Retain the last persona so the scene text fades OUT gracefully when the
  // keyring is lifted (persona goes null the instant we leave 'scene').
  const lastRef = useRef(null)
  if (persona) lastRef.current = persona
  const p = persona || lastRef.current

  return (
    <div className="rpanel">
      <div className={`rblock rblock--card${step === 'place-card' ? ' rblock--active' : ''}`}>
        <div className="rblock__inner">
          <p className="rblock__eyebrow">感光公寓</p>
          <h1 className="rblock__title">把邀請卡<br />放在感應區</h1>
          <p className="rblock__sub">開始一場,為你而調的居家體驗。</p>
        </div>
      </div>

      <div className={`rblock rblock--card${step === 'connected' ? ' rblock--active' : ''}`}>
        <div className="rblock__inner">
          <p className="rblock__eyebrow">感光公寓</p>
          <h1 className="rblock__title">已連接智慧系統</h1>
          <p className="rblock__sub">感受房子，如何照顧你的生活。</p>
        </div>
      </div>

      <div className={`rblock rblock--character${step === 'place-character' ? ' rblock--active' : ''}`}>
        <div className="rblock__inner">
          <p className="rblock__eyebrow">選擇一種生活</p>
          <h1 className="rblock__title">放上角色鑰匙圈</h1>
          <p className="rblock__sub">說出你的牽掛,<br />房子會回應你的需要。</p>
        </div>
      </div>

      <div className={`rblock rblock--scene${step === 'scene' ? ' rblock--active' : ''}`}>
        {p && (
          <div className="rblock__inner">
            <p className="rblock__role">{p.title}</p>
            <p className="rblock__q">{p.question}</p>
            <p className="rblock__pain">{p.pain}</p>
            <p className="rblock__sign">你的痛點,寶舖有解方。</p>
          </div>
        )}
      </div>
    </div>
  )
}
