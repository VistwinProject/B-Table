// ── B 區 5 個情境角色 ──────────────────────────────────────────────────────────
// keyed by `id` (the string frozen across all clients — same id the NFC daemon
// puts in tag-present `data.id`). The table projection only needs short display
// copy + an accent colour; the full environment dataset (光/空氣/溫濕度/聲音)
// lives on the TV. Colours follow the OTA120 v6 scenario card headers.
export const PERSONAS = {
  'anti-aging': {
    id: 'anti-aging',
    name: '生理逆齡',
    title: '成年人 — 抗衰老',
    accent: '#3a6ea5',
    line: '校正晝夜節律，啟動深層修復',
  },
  child: {
    id: 'child',
    name: '原生健康',
    title: '兒童 — 提高免疫力',
    accent: '#3f8f6b',
    line: '保護發育中的肺部與視力',
  },
  elder: {
    id: 'elder',
    name: '安全守護',
    title: '老人 — 在宅終老',
    accent: '#8a5a2b',
    line: '補償視覺退化，預防意外與跌倒',
  },
  pregnancy: {
    id: 'pregnancy',
    name: '極致純淨',
    title: '孕婦 — 在家休養',
    accent: '#8d3a5a',
    line: '零毒害微環境，緩解身心壓力',
  },
  nomad: {
    id: 'nomad',
    name: '數位遊牧',
    title: '高效 — 在家辦公',
    accent: '#2c5f78',
    line: '啟動認知潛能，維持深層專注',
  },
}

export const PERSONA_ORDER = ['anti-aging', 'child', 'elder', 'pregnancy', 'nomad']
