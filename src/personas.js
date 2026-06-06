// ── B 區 5 個情境角色 ──────────────────────────────────────────────────────────
// keyed by `id`(全 client 共用、與 NFC daemon tag-present.data.id 一致)。
// 桌面投影負責呈現「痛點」(分工:電視顯示 L1/L2 + 解方;桌面顯示 L3 詳細痛點)。
//   question = L2 一句話問句(感性開場)
//   pain     = L3 詳細痛點長句(桌面主要呈現)
// 顏色沿用 OTA120 v6 情境卡表頭色。
export const PERSONAS = {
  'anti-aging': {
    id: 'anti-aging',
    name: '生理逆齡',
    title: '成年人 · 抗衰老',
    accent: '#3a6ea5',
    question: '熬夜、壓力與老化,怎麼讓身體回到修復狀態?',
    pain: '長期晚睡與壓力讓晝夜節律紊亂、\n氧化壓力升高,睡眠品質變差、修復不足,\n身體與外貌都加速老化。',
  },
  child: {
    id: 'child',
    name: '原生健康',
    title: '兒童 · 提高免疫力',
    accent: '#3f8f6b',
    question: '怎麼保護發育中的孩子,少生病、長得好?',
    pain: '兒童發育中的肺部與視力脆弱,\n容易受空汙與藍光傷害;抵抗力弱、\n易過敏生病,睡眠也常被干擾而影響發育。',
  },
  elder: {
    id: 'elder',
    name: '安全守護',
    title: '老人 · 在宅終老',
    accent: '#8a5a2b',
    question: '怎麼讓長輩在家安全、安心地終老?',
    pain: '長者視覺退化、夜間容易跌倒;\n慢性病讓血壓波動與失溫風險升高,\n緊急狀況也常無人即時察覺。',
  },
  pregnancy: {
    id: 'pregnancy',
    name: '極致純淨',
    title: '孕婦 · 在家休養',
    accent: '#8d3a5a',
    question: '怎麼給孕媽咪一個零毒害、能好好休養的家?',
    pain: '孕期對甲醛等毒害極度敏感、擔心影響胎兒;\n身心壓力大、睡眠不安,體感也容易不適。',
  },
  nomad: {
    id: 'nomad',
    name: '數位遊牧',
    title: '高效 · 在家辦公',
    accent: '#2c5f78',
    question: '在家怎麼維持專注,不被環境拖累效率?',
    pain: '在家工作容易分心、午後倦怠;\nCO₂ 累積讓頭腦昏沉、決策力下降,\n環境噪音也干擾深度工作。',
  },
}

export const PERSONA_ORDER = ['anti-aging', 'child', 'elder', 'pregnancy', 'nomad']
