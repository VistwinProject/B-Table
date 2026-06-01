import SensorRing from './SensorRing.jsx'
import { CardIcon, KeyringIcon } from './icons.jsx'

const COPY = {
  card: {
    eyebrow: '感應光寓',
    icon: CardIcon,
    title: '把邀請卡放在這裡',
    sub: '開始你的專屬居家體驗',
  },
  character: {
    eyebrow: '選擇一種生活',
    icon: KeyringIcon,
    title: '放上角色鑰匙圈',
    sub: '房子會調整光、空氣、溫濕度與聲音來照顧你',
  },
}

export default function PlacePrompt({ kind }) {
  const c = COPY[kind]
  const Icon = c.icon
  return (
    <div className="prompt">
      <p className="prompt__eyebrow">{c.eyebrow}</p>

      <SensorRing>
        <Icon className="prompt__glyph" />
      </SensorRing>

      <div className="prompt__text">
        <h1 className="prompt__title">{c.title}</h1>
        <p className="prompt__sub">{c.sub}</p>
      </div>
    </div>
  )
}
