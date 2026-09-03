# B-Table · 桌面感應投影 UI 規格

> 展區 B「感應光寓」桌面短焦投影 App 的**全部**畫面資訊:文字、字體、字級、字距、行高、顏色、尺寸、動畫時間。
>
> 實際值以 `src/style.css`、`src/personas.js`、`src/components/RightPanel.jsx` 為準;本文件是那三個檔案的人類可讀版。
>
> **字級全部是 `clamp(下限, N vh, 上限)`** —— 跟著投影高度縮放。下表的 px 是 **1920×1080** 實測值(用瀏覽器 `getComputedStyle` 量的,不是手算),換投影解析度請照 `clamp()` 重算。

---

## 1. 版面骨架

投影面 = `100vw × 100vh`,左右分半、**沒有分隔線**:

| 區 | 寬 | 內容 |
|---|---|---|
| 左 `.panel--left` | `46%`(@1920 = 883px) | 感應環(對準桌上實體 NFC reader)+ 刷卡成功漣漪 |
| 右 `.panel--right` | `54%` | 全部文字 |

- 右側文字群組在自己那半區內**置中**,群組內每行**共用同一條左緣**(是段落,不是居中對齊)。
- 文字區 padding:`6vh 6%`(@1920×1080 = 64.8px / 62.2px)。
- 文字元素之間 gap:`clamp(16px, 3vh, 36px)`(@1080p = 32.4px)。
- 感應環直徑 `--d: clamp(220px, 34vh, 360px)` → @1080p **360px**(34vh = 367px,被上限截住)。位置固定在左半區正中央,**跨所有狀態不移動**,方便投影對準實體 reader。

三個文字區塊(置卡 / 選角色 / 情境)**永遠掛載在 DOM**,靠 `opacity` 0↔1 交叉淡出(`0.6s`)。這是刻意的:卸載式切換在投影上會留殘影。

---

## 2. 字型資源

### 本地字型檔(`public/fonts/`)

| 字型 | 檔案 | 字重 |
|---|---|---|
| TASA Orbiter | `TASAOrbiter-VariableFont_wght.ttf` | 400–800(變體) |
| GlowSans TC Condensed | `GlowSansTC-Condensed-{Light,Regular,Medium,Bold}.otf` | 300 / 400 / 500 / 700 |

### Google Fonts(`index.html`)

`Chiron Hei HK` 400/500/700、`JetBrains Mono` 400/500/700、`Space Grotesk` 400/500/600/700

### 字型堆疊變數

| 變數 | 堆疊 |
|---|---|
| `--font-cjk` | `'TASA Orbiter', 'GlowSans TC', 'Chiron Hei HK', sans-serif` |
| `--font-display` | `'TASA Orbiter', 'GlowSans TC', 'Space Grotesk', sans-serif` |
| `--font-hud` | `'TASA Orbiter', 'GlowSans TC', 'JetBrains Mono', monospace` |

> **重要**:TASA Orbiter 只有拉丁字母與數字,**中文字會自動 fallback 到第二順位 `GlowSans TC`**(Condensed,字寬 ≈0.9 的窄體)。所以下表凡是標「GlowSans TC Condensed」的行,`font-family` 寫的其實是 `--font-cjk` / `--font-hud`,只是中文實際落在 GlowSans。
>
> **第一頁(置卡)例外**:三行字全部指定 `'Chiron Hei HK', 'Microsoft JhengHei', 'Noto Sans TC', sans-serif`,比照 B-TV 待機頁,刻意不用窄體、字身回到 1:1 正比例。Chiron 沒有 300 字重(只有 400/500/700),沿用深底版的 300 會變成瀏覽器合成的假細體,所以大標取 500。

---

## 3. 第一頁 · 置卡 `place-card`

**白底藍字。** 色票沿用 B-TV 待機頁白版(`--idle-bg-1/2/3` 那組)。預設狀態 / 收到 `reset` 時顯示。

### 文字

| 元素 | 文案 |
|---|---|
| eyebrow | 感應光寓 |
| 大標 | 把邀請卡 / 放在感應區(手動 `<br>` 斷行) |
| 副標 | 開始一場,為你而調的居家體驗。 |

### 排版

| 元素 | 字體 | 字重 | 字級 | @1080p | 字距 | 行高 | 其他 |
|---|---|---|---|---|---|---|---|
| `.rblock__eyebrow` | Chiron Hei HK | 400 | `clamp(14px, 1.9vh, 22px)` | **20.5px** | `0.4em` | normal | `text-indent: 0.4em` 補償尾端字距 |
| `.rblock__title` | Chiron Hei HK | 500 | `clamp(40px, 7vh, 84px)` | **75.6px** | `0.16em` | `1.28` | 字身漸層 + 脈動發光(見下) |
| `.rblock__sub` | Chiron Hei HK | 400 | `clamp(18px, 2.7vh, 32px)` | **29.2px** | `0.03em` | `1.8` | `max-width: 18em`(= 524.9px) |

> `max-width` 第一頁用 `em` 不用 `ch`:`ch` 是以 `0` 的字寬換算的,換成 Chiron 之後 `22ch` 只放得下約 11 個中文字,副標會折行掉一個孤字。中文用 `em` 對字數才準(1em ≈ 1 個全形字)。

### 顏色

| 項目 | 值 |
|---|---|
| 底(主) | `linear-gradient(122deg, #ffffff 0%, #ffffff 26%, #eef5ff 58%, #d7e6fa 100%)` |
| 底(環側淡藍暈) | `radial-gradient(ellipse 52% 66% at 24% 50%, rgba(150,195,250,0.34), rgba(150,195,250,0.10) 44%, transparent 72%)` |
| 格線 | `rgba(70,110,180,0.10)`,`60px` 網格,徑向遮罩淡出 |
| eyebrow / 副標 | `--c-text-dim` = `#6a8cc8` |
| 大標字身 | `linear-gradient(to top, #1b3f8f 0%, #1b3f8f 34%, #2e59a8 72%, #4a76c4 100%)`(`background-clip: text`) |
| 大標發光 | `prompt-glow-light` 三層淡藍灰陰影,`rgba(120,155,215,.20~.34)` 等 |
| 副標桌面反光 | `-webkit-box-reflect: below -0.46em`,`rgba(60,105,180,0→0.18)` |
| 感應環 / 圖示 | `--accent` = `#2f8dfb`、`--accent-2` = `#7cc0ff`;圖示 `color-mix(ring-accent 55%, #14357e)` |

環內圖示:**卡片 icon**(`CardIcon`)。環有 3 圈往外擴的脈動漣漪(待機吸引狀態)。

---

## 4. 第二頁 · 選角色 `place-character`

**深藍底白字。** 刷到邀請卡後進入;拿起角色鑰匙圈也會回到這頁。

### 文字

| 元素 | 文案 |
|---|---|
| eyebrow | 選擇一種生活 |
| 大標 | 放上角色鑰匙圈 |
| 副標 | 說出你的牽掛, / 房子會回應你的需要。(手動 `<br>` 斷行) |

### 排版

| 元素 | 字體 | 字重 | 字級 | @1080p | 字距 | 行高 | 其他 |
|---|---|---|---|---|---|---|---|
| `.rblock__eyebrow` | GlowSans TC Condensed | 400 | `clamp(14px, 1.9vh, 22px)` | **20.5px** | `0.4em` | normal | |
| `.rblock__title` | GlowSans TC Condensed | 300 | `clamp(40px, 7vh, 84px)` | **75.6px** | `0.16em` | `1.28` | 白色字身漸層 + 脈動發光 |
| `.rblock__sub` | GlowSans TC Condensed | 500 | `clamp(18px, 2.7vh, 32px)` | **29.2px** | `0.03em` | `1.8` | `max-width: 22ch`(= 404.8px) |

> 副標用 500 不用 400:GlowSans 是窄體,400 在投影上太細。

### 顏色

| 項目 | 值 |
|---|---|
| 底 | 深藍徑向堆疊 `#12285a → #0c1d44 44% → #081633 72% → #050e22`,加左偏藍光暈、頂部藍白柔光、邊緣壓暗 `rgba(1,4,12,0.62)` |
| 格線 | `rgba(150,190,255,0.045)`,`60px` |
| eyebrow / 副標 | `--c-text-dim` = `#7f96bd` |
| 大標字身 | `linear-gradient(to top, #ffffff 0%, #ffffff 34%, #d6e6ff 72%, #a9c8f0 100%)` |
| 大標發光 | `prompt-glow` 五層白 / 藍白外暈(峰值 `rgba(255,255,255,.88)` 等) |
| 感應環 | `--accent` = `#2f7bff` |

環內圖示:**鑰匙圈 icon**(`KeyringIcon`)。脈動漣漪照常。

---

## 5. 第三頁 · 情境 `scene`(1–5)

**整個底 = 該角色的色票本人。** 刷到角色鑰匙圈後進入。環內從圖示換成角色名,環停止脈動(鎖定狀態)。

### 文字

| 元素 | 內容 | 來源 |
|---|---|---|
| `.rblock__role` | 角色副標,如「孕婦 · 在家休養」 | `personas.js` → `title` |
| `.rblock__q` | 一句話問句(L2) | `personas.js` → `question` |
| `.rblock__pain` | 詳細痛點長句(L3),**以資料裡的 `\n` 手動斷行** | `personas.js` → `pain` |
| `.rblock__sign` | 你的痛點,寶舖有解方。 | 寫死在 `RightPanel.jsx` |
| `.sensor-name` | 角色名,如「極致純淨」 | `personas.js` → `name` |

### 排版

| 元素 | 字體 | 字重 | 字級 | @1080p | 字距 | 行高 | 其他 |
|---|---|---|---|---|---|---|---|
| `.rblock__role` | GlowSans TC Condensed | 400 | `clamp(14px, 1.9vh, 22px)` | **20.5px** | `0.32em` | normal | `text-indent: 0.32em` |
| `.rblock__q` | GlowSans TC Condensed | 500 | `clamp(34px, 6vh, 76px)` | **64.8px** | `0.02em` | `1.4` | `max-width: 16ch`(= 654.2px) |
| `.rblock__pain` | GlowSans TC Condensed | 500 | `clamp(18px, 2.7vh, 32px)` | **29.2px** | `0.04em` | `1.95` | `white-space: pre-line` |
| `.rblock__sign` | GlowSans TC Condensed | 400 | `clamp(17px, 2.4vh, 30px)` | **25.9px** | `0.12em` | normal | `margin-top: clamp(4px, 1vh, 12px)` = 10.8px |
| `.sensor-name` | GlowSans TC Condensed | 300 | `clamp(22px, 3.4vh, 38px)` | **36.7px** | `0.16em` | normal | 環內置中,`white-space: nowrap` |

### 顏色

文字**一律白字、只用透明度分階**(平塗底不壓黑,原本混 `--scene-accent` 的字色會與底同色而糊掉):

| 元素 | 色 |
|---|---|
| `.rblock__role` | `rgba(255,255,255,0.72)` |
| `.rblock__q` | `#f4f7f7` |
| `.rblock__pain` | `rgba(255,255,255,0.88)` |
| `.rblock__sign` | `rgba(255,255,255,0.75)` |
| `.sensor-name` | `#ffffff` |
| 環描邊 | 白色 `conic-gradient`,沿圓周 0.18→0.80 明暗變化,兩圈相位錯開(外圈 210°、內圈 30°) |

底色算法 = **B-TV `sceneColorStore.js` 的 `fillColor()`**:色票混 20% 暖灰 `#4a4a30`。那 20% 純粹是為了白字(色票原值亮度偏高,直接鋪白字會糊),**除此之外不混黑**。深淺變化用白光提亮,邊緣只用同色系深一階 `color-mix(fill 86%, #241f14)` 收邊。

> ⚠️ 原本的黑色暈邊是為了「讓投影融進桌面」。現在底接近平塗實色,**投在桌面上會看得出一塊明顯矩形光**。場勘時若太搶眼,把 `.stage--scene` 最後那道 `radial-gradient` 的 `86%` 往下調(例如 70%)加深收邊,色票仍認得出來。

---

## 6. 五個情境角色

| 鍵 | id | 環內名 | 副標 | 色票(色卡主色) | 實際鋪底(混 20% 暖灰) |
|---|---|---|---|---|---|
| `1` | `anti-aging` | 生理逆齡 | 成年人 · 抗衰老 | `#7394A5` 居家抗老 | `#6B858E` |
| `2` | `child` | 原生健康 | 兒童 · 提高免疫力 | `#8BA78D` 兒童免疫 | `#7E947A` |
| `3` | `elder` | 安全守護 | 老人 · 在宅終老 | `#C47F75` 在宅樂齡 | `#AC7467` |
| `4` | `pregnancy` | 極致純淨 | 孕婦 · 在家休養 | `#C5B192` 孕婦照護 | `#AC9C7E` |
| `5` | `nomad` | 數位遊牧 | 高效 · 在家辦公 | `#3A446F` 數位遊牧 | `#3D4562` |

> `5 數位遊牧` 的色票明度比其他四個低一階(另外四個是粉彩調),投影上會明顯較沉。這是色卡原值,沒有另外提亮。

### 全部文案

**1 生理逆齡**
- 問句:熬夜、壓力與老化,怎麼讓身體回到修復狀態?
- 痛點:長期晚睡與壓力讓晝夜節律紊亂、 / 氧化壓力升高,睡眠品質變差、修復不足, / 身體與外貌都加速老化。

**2 原生健康**
- 問句:怎麼保護發育中的孩子,少生病、長得好?
- 痛點:兒童發育中的肺部與視力脆弱, / 容易受空汙與藍光傷害;抵抗力弱、 / 易過敏生病,睡眠也常被干擾而影響發育。

**3 安全守護**
- 問句:怎麼讓長輩在家安全、安心地終老?
- 痛點:長者視覺退化、夜間容易跌倒; / 慢性病讓血壓波動與失溫風險升高, / 緊急狀況也常無人即時察覺。

**4 極致純淨**
- 問句:怎麼給孕媽咪一個零毒害、能好好休養的家?
- 痛點:孕期對甲醛等毒害極度敏感、擔心影響胎兒; / 身心壓力大、睡眠不安,體感也容易不適。

**5 數位遊牧**
- 問句:在家怎麼維持專注,不被環境拖累效率?
- 痛點:在家工作容易分心、午後倦怠; / CO₂ 累積讓頭腦昏沉、決策力下降, / 環境噪音也干擾深度工作。

> `/` = 資料裡的 `\n` 手動斷行位置。分工:電視顯示 L1/L2 + 解方,桌面顯示 L3 詳細痛點。

---

## 7. 感應環 · 漣漪 · 狀態燈

### 感應環 `.sensor`

直徑 `--d: clamp(220px, 34vh, 360px)`(@1080p = 360px)。部件由外而內:

| 部件 | 尺寸 | 說明 |
|---|---|---|
| `.sensor__pulse` × 3 | `1×d` → `scale(0.55→1.5)` | 往外擴的吸引漣漪,`2px` 描邊。有卡片在讀卡機上時 `visibility: hidden`(不卸載,否則回待機會與大標發光脫拍) |
| `.sensor__ring--outer` | `1×d` | `1.5px` 描邊 + `60px` 外暈 + `50px` 內暈 |
| `.sensor__sweep` | 置卡頁 `0.92×d`;其餘 `1×d` 壓在外圈線上 | 旋轉掃描帶,`conic-gradient` 60° 亮帶 |
| `.sensor__ring--inner` | `0.6×d` | `1.5px` 描邊,比外圈濃(75% vs 55%) |
| `.sensor__core` | `0.6×d` | 中心柔光 `radial-gradient`,22% 濃度 |
| `.sensor__icon` | `0.3×d` | 卡片 / 鑰匙圈圖示。放角色名時改為 `width/height: auto`、關掉外暈 |

### 刷卡成功漣漪 `.confirm`

每次刷到**已註冊**的卡片就疊一層。色 = 角色色票(邀請卡用 `--accent-2`)。

| 部件 | 尺寸 @1080p | 動畫 |
|---|---|---|
| `.confirm__ring` × 2 | 360px(同環徑) | `confirm-ring 1s ease-out`,`scale(0.4→1.8)`、`opacity 0.8→0`;第二圈 `delay 0.12s` |
| `.confirm__check` | 110px(`clamp(70px, 11vh, 110px)`) | `confirm-check 1.4s`,`scale 0→1.15→1→1`,尾段淡出 |

App 端 `CONFIRM_MS = 1800ms` 後移除節點(不依賴動畫回呼)。

### 狀態燈 `.statusdot`(僅供展務員,不是體驗的一部分)

固定右下 `bottom: 18px / right: 22px`,`--font-hud` **11px**、字距 `0.18em`、`opacity: 0.5`,7px 圓點。

| 狀態 | 文字 | 色 |
|---|---|---|
| WS 未連上 | 連線中 | `--down` `#f43f5e` |
| WS 已連、無讀卡機 | 等待讀卡機 | `--warn` `#f59e0b` |
| WS 已連、讀卡機就緒 | 讀卡機就緒 | `--accent-2`(+ 8px 光暈) |

---

## 8. 色彩 token

### `:root`(深底版 · 第二頁與情境頁的基準)

| Token | 值 |
|---|---|
| `--accent` | `#2f7bff` |
| `--accent-2` | `#5b9dff` |
| `--accent-deep` | `#1657d6` |
| `--accent-glow` | `rgba(47,123,255,0.28)` |
| `--c-bg` | `#050d1f` |
| `--c-text` | `#eaf1ff` |
| `--c-text-dim` | `#7f96bd` |
| `--good` / `--warn` / `--info` / `--down` | `#2f7bff` / `#f59e0b` / `#6f8ba0` / `#f43f5e` |
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` |

### `.stage--place-card` 覆蓋(第一頁)

| Token | 值 |
|---|---|
| `--accent` | `#2f8dfb` |
| `--accent-2` | `#7cc0ff` |
| `--c-text` | `#17357a` |
| `--c-text-dim` | `#6a8cc8` |

### `.stage--scene`(情境頁)

`--scene-accent` 由 App 依角色 inline 設定;`--scene-fill = color-mix(in srgb, var(--scene-accent) 80%, #4a4a30)`。

---

## 9. 動畫時間表

| 動畫 | 時長 | 說明 |
|---|---|---|
| `.rblock` 交叉淡出 | `0.6s var(--ease)` | 三個文字區塊互切 |
| `.stage` 背景 | `0.8s var(--ease)` | 換頁換底色 |
| `sensor-pulse` | `2.6s ease-out infinite` × 3 | `delay 0 / 0.86s / 1.72s` |
| `prompt-glow` / `prompt-glow-light` | `2.6s ease-out infinite` | **刻意與 `sensor-pulse` 同時長、同起跑**,大標亮度跟著漣漪呼吸。峰值放 `78%` 不放 `100%`(0%/100% 在 loop 裡是同一瞬間,峰值擺 100% 會在接縫上瞬跳) |
| `sensor-sweep` | `4s linear infinite` | 旋轉掃描帶 |
| `confirm-ring` | `1s ease-out forwards` | 第二圈 `delay 0.12s` |
| `confirm-check` | `1.4s ease-out forwards` | |

**全部動畫是純 CSS,沒有 framer-motion。** 原因寫在 `SensorRing.jsx`:`repeat: Infinity` 的 framer 動畫永遠不會 settle,`AnimatePresence` 就不會 unmount,投影上會疊出殘影。同理 `main.jsx` 刻意不用 StrictMode。

---

## 10. 開發模擬器(免硬體)

任何畫面聚焦下按鍵。事件會 `ws.send` 進 8788 server 再廣播給所有 client(桌面 + 電視同步);未連線時 fallback 成本機事件。

| 按鍵 | 動作 |
|---|---|
| `c` | 刷邀請卡 → 第二頁 |
| `1`~`5` | 刷五個角色鑰匙圈 → 情境頁 |
| `空白鍵` / `x` | 拿起卡片 → 回第二頁 |
| `r` / `Esc` | 重置 → 回第一頁 |

---

## 11. 其他

- 瀏覽器標題:`感應光寓 · 桌面感應`;`<html lang="zh-Hant" data-theme="dark">`;`<meta name="robots" content="noindex, nofollow">`
- `body`:`cursor: none`(投影面不要指標)、`user-select: none`、`overflow: hidden`
- **部件識別配色**:在 `index.html` 的 `<html>` 加 `data-debug-parts` 屬性,感應環各部件會上識別色(外圈紅 `#ff2d2d`、掃描帶黃 `#ffd400`、內圈藍 `#00a2ff`、中心核綠 `#00e05a`、脈動洋紅 `#ff00d0`、圖示橘 `#ff8a00`),方便溝通時指名道姓。不是設計稿的一部分,拿掉屬性即失效。
