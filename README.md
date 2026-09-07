# B-Table · 感應光寓 桌面感應投影

> 2026 寶舖大安段策展 — **展區 B「感應光寓」** 的桌面短焦投影 App。

桌面往下投的 **NFC 放置提示介面**:引導訪客把「邀請卡 / 角色鑰匙圈」放到桌上的感應區,並在刷卡成功時給回饋。整個客廳的光 / 空氣 / 溫濕度 / 聲音情境切換與場景視覺由**牆上電視機(另一個 App)**呈現 — 本 repo 只負責桌面投影。

---

## 體驗流程

單一感應區,訪客依序刷卡,畫面在三個狀態間切換:

| 狀態 | 畫面 | 觸發 |
|---|---|---|
| **置卡 `place-card`** | 「把邀請卡放在這裡」+ 脈動感應環(待機吸引狀態) | 預設 / `reset` |
| **選角色 `place-character`** | 「放上角色鑰匙圈」 | 刷到邀請卡後 |
| **情境 `scene`** | 顯示選到的角色(如孕婦「極致純淨」),環鎖定角色色,提示換下一個 | 刷到角色鑰匙圈後 |

每次刷到註冊的卡片都會疊一層**成功漣漪**動畫。拿起鑰匙圈會回到「選角色」狀態,方便連續體驗不同角色。

### 五個情境角色

| id | 名稱 | 對象 |
|---|---|---|
| `anti-aging` | 生理逆齡 | 成年人 — 抗衰老 |
| `child` | 原生健康 | 兒童 — 提高免疫力 |
| `elder` | 安全守護 | 老人 — 在宅終老 |
| `pregnancy` | 極致純淨 | 孕婦 — 在家休養 |
| `nomad` | 數位遊牧 | 高效 — 在家辦公 |

---

## 架構

```
[ 桌上 NFC Reader ] → [ NFC daemon / WS server :8788 ] → [ 本 App (桌面投影) ]
                                                       ↘ [ 牆上電視機 App (另一 repo) ]
```

- **狀態機自洽**:App 直接從原始 NFC 事件(`tag-present` / `tag-remove`)推導要顯示哪個畫面,不依賴外部 session 服務。日後 cue-server / 電視機要接管時,可送 `reset`(或擴充 `step`)覆蓋。
- **WS 協議沿用 F 區 `vibenfc` 桌面端**(已驗證可用),真實 NFC daemon 可直接驅動本 App,不需改動。
- **動畫全用 CSS**(無 framer-motion):畫面顯示邏輯走「永遠掛載 + `.screen--active` class 切換」,確定性高、不會有殘影堆疊。感應環固定在畫面正中央,跨所有狀態位置一致,方便投影對準實體 reader。

---

## 埠口(展覽同網域,固定不漂移)

展覽現場所有 zone 共用同一台主機 / 網域,**埠口寫死且 `strictPort`**,被占就報錯、絕不自動漂移去撞別區。

| Zone | App | Web | WS |
|---|---|---|---|
| F(既有) | 桌面 / 牆面 / 平板 | 5173 / 5174 / 5175 | 8787 |
| **B** | **桌面投影(本 repo)** | **5273** | 連 **8788** |
| B | TV display(另一 repo,待做) | 5274(預留) | 連 8788 |
| B | NFC WS server | — | **8788** |

> ⚠️ B 區的 NFC server 必須跑在 **8788**(F 的 server 占用 8787)。

## 一鍵啟動(展覽 / 換電腦用)

**雙擊 `啟動.bat`** — 一鍵啟動**桌面投影 + 電視 + 共用 NFC server**:檢查環境、裝相依、建置兩邊、開 NFC server(8788)+ 桌面 web(5273)+ 電視 web(5274),並用 Chrome 全螢幕開兩個畫面。要停就雙擊 `stop.bat`(會停 5273 / 5274 / 8788)。

> 前提:電視專案 `b-tv` 與本 `b-livingroom` 放在**同一層資料夾**(`啟動.bat` 會去 `..\b-tv` 找)。電視的 3D 機位先用 `b-tv\啟動-機位設定工具.bat` 設定一次(存到共用的 Chrome profile)。

換到新電腦只要先裝好兩個東西,其餘 `啟動.bat` 會自己處理:

| 前置需求 | 下載 | 備註 |
|---|---|---|
| **Node.js 18+** | https://nodejs.org | 找不到會提示;若裝在非標準路徑,改 bat 裡的 `C:\nvm4w\nodejs` |
| **Python 3.11+** | https://python.org | 安裝時勾「Add to PATH」 |
| (實體刷卡才需要)ACR122U 讀卡機 | — | 沒插也能跑,只是不能實體刷卡;鍵盤模擬照常 |

> `啟動.bat` 每次啟動都會重新 `npm run build` 兩邊,確保跑到最新程式。
> **雙螢幕**:兩個全螢幕視窗預設都在主螢幕(會疊住)。把其中一個拖到另一台顯示器,或編輯 `啟動.bat` 最上方的 `TV_POS`(例:`--window-position=1920,0`)指定第二台螢幕。

## 開發模式

需要 Node 18+。

```bash
npm install
npm run dev        # http://localhost:5273 (固定;被占會直接報錯)
```

production build:

```bash
npm run build      # 輸出到 dist/
npm run preview    # 同樣固定 5273
```

預設連線 `ws://localhost:8788`(B 區 NFC server)。僅特殊情況(如遠端 daemon)才用環境變數覆蓋:

```bash
VITE_WS_URL=ws://192.168.1.50:8788 npm run dev
```

---

## 開發模擬器(免硬體)

沒接讀卡機時,直接用鍵盤模擬刷卡(任何畫面聚焦下):

| 按鍵 | 動作 |
|---|---|
| `c` | 刷邀請卡 |
| `1` ~ `5` | 刷五個角色鑰匙圈(依上表順序) |
| `空白鍵` / `x` | 拿起卡片 |
| `r` / `Esc` | 重置 session 回到置卡 |

---

## WebSocket 事件協議

Server → Client 廣播,皆為 JSON(沿用 vibenfc,詳見 `vibenfc/SYNC-SPEC.md`):

```jsonc
// 讀卡機連上 / 拔除
{ "type": "reader-connected",    "slot_index": 0, "reader": "..." }
{ "type": "reader-disconnected", "slot_index": 0 }

// 卡片刷上 / 拿走。data 由 server 端 uid-map 查出
{ "type": "tag-present", "slot_index": 0, "uid": "04...", "known": true,
  "data": { "id": "pregnancy", "kind": "character", "label": "極致純淨" } }
{ "type": "tag-remove", "slot_index": 0 }

// 展務員手動重置(可由 cue-server 送)
{ "type": "reset" }
```

本 App 只關心 `data.kind`:`"card"` → 開場;`"character"` → 切角色(`data.id` 對應角色)。其餘未註冊卡片忽略。

---

## NFC UID 設定

`server/uid-map.json` 把實體卡片 UID 對應到 token。**目前 UID 是 placeholder**,實體 NTAG215 燒錄後請替換。`id` 字串必須與 `src/personas.js` 對齊。

```jsonc
{
  "04AA01AA01AA01": { "id": "invite",     "kind": "card",      "label": "邀請卡" },
  "04BB01BB01BB01": { "id": "anti-aging", "kind": "character", "label": "生理逆齡" }
  // ... 其餘四個角色
}
```

---

## 專案結構

```
src/
├── App.jsx                  狀態機 + WS client + 鍵盤模擬器
├── personas.js              5 個角色顯示資料(名稱/色/文案)
├── style.css                設計 token + 全 CSS 動畫
└── components/
    ├── SensorRing.jsx       中央感應環(CSS 脈動 + 掃描)
    ├── PlacePrompt.jsx      置卡 / 選角色提示
    ├── SceneActive.jsx      情境啟動畫面
    ├── ConfirmRipple.jsx    刷卡成功漣漪
    ├── StatusDot.jsx        角落連線狀態(僅供展務員)
    └── icons.jsx
server/
└── uid-map.json             UID → token(供真實 NFC daemon 使用)
```

---

## 待辦 / 未決

- [ ] 替換 `server/uid-map.json` 的真實 NTAG215 UID
- [ ] 場勘投影面尺寸 / 投影機選型,校正感應環對位到實體 reader
- [ ] **牆上電視機 App**(另一 session / repo)
- [ ] cue-server 整合(多畫面 session 狀態同步、`step` 權威來源)
- [ ] 情境切換的環境設備指令(燈 / 空氣 / 聲)— 走寶舖既有管道或直打設備

---

## 相關

- F 區參考實作(NFC 桌面投影、WS server、同步規格):`../vibenfc/`(`VistwinProject/B-F-NFC`)
- B 區規格:寶舖 showcase vault `zones/B-感應光寓.md`
