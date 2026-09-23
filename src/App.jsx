import { useEffect, useReducer, useRef, useCallback } from 'react'
import { PERSONAS, PERSONA_ORDER } from './personas.js'
import { createBrowserSync, isBrowserPreview } from './browserSync.js'
import { initial, reducer, deriveStep } from './session.js'
import SensorRing from './components/SensorRing.jsx'
import RightPanel from './components/RightPanel.jsx'
import { CardIcon, KeyringIcon } from './components/icons.jsx'

// Same WS contract as the F-region desktop (vibenfc), so B's NFC daemon can
// drive this unchanged. B has a single reader (slot 0); card + 5 keyrings are
// scanned sequentially on it.
// PORT IS FIXED TO 8788 — the exhibition shares one host, and F's server owns
// 8787. B's NFC server MUST run on 8788 to avoid colliding with F. Override via
// VITE_WS_URL only for special setups (e.g. a remote daemon).
const WS_URL       = import.meta.env.VITE_WS_URL || 'ws://localhost:8788'
const RECONNECT_MS = 3000
const browserPreview = isBrowserPreview(window.location)

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial)
  const wsRef    = useRef(null)
  const previewRef = useRef(null)
  const timerRef = useRef(null)

  // Single ingress for both the real socket and the dev simulator.
  const ingest = useCallback((msg) => {
    switch (msg.type) {
      case 'reader-connected':    dispatch({ type: 'reader-connected' }); break
      case 'reader-disconnected': dispatch({ type: 'reader-disconnected' }); break
      case 'tag-present':         dispatch({ type: 'tag-present', data: msg.data, flowId: msg.flowId }); break
      case 'tag-remove':          dispatch({ type: 'tag-remove' }); break
      case 'intro':               dispatch(msg); break
      case 'outro':               dispatch(msg); break
      case 'tv-phase':            dispatch(msg); break
      case 'reset':               dispatch({ type: 'reset' }); break
      default: break
    }
  }, [])

  // ── WebSocket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (browserPreview) {
      const preview = createBrowserSync(ingest)
      previewRef.current = preview
      return () => { preview.close(); previewRef.current = null }
    }
    let alive = true
    const connect = () => {
      // WebSocket 建構式會「同步 throw」的情境:https 頁面連 ws:// 被擋成 mixed
      // content、URL 不合法等。不接住的話例外會冒出 useEffect 之外,整棵樹被卸載
      // 變成白畫面。接住後降級成 disconnected + 定時重試,跟斷線是同一條路徑。
      let ws
      try {
        ws = new WebSocket(WS_URL)
      } catch {
        if (!alive) return
        dispatch({ type: 'ws-status', status: 'disconnected' })
        timerRef.current = setTimeout(connect, RECONNECT_MS)
        return
      }
      wsRef.current = ws
      ws.onopen    = () => { if (alive) { dispatch({ type: 'ws-status', status: 'connected' }); clearTimeout(timerRef.current) } }
      ws.onmessage = ({ data }) => { try { ingest(JSON.parse(data)) } catch { /* ignore */ } }
      ws.onclose   = () => {
        if (!alive) return
        dispatch({ type: 'ws-status', status: 'disconnected' })
        timerRef.current = setTimeout(connect, RECONNECT_MS)
      }
      ws.onerror   = () => ws.close()
    }
    connect()
    return () => { alive = false; clearTimeout(timerRef.current); wsRef.current?.close() }
  }, [ingest])

  // ── Dev simulator (no hardware needed) ────────────────────────────────────────
  //   c = scan invite card | 1-5 = scan persona keyring | space/x = lift | r = reset
  //   把模擬事件「ws.send 進 8788 server」→ server 廣播給所有 client(桌面 + 電視同步)。
  //   未連線時 fallback 成本機 ingest(純桌面測試)。需 server 端有 dev 注入(放行
  //   tag-present/tag-remove/reset 並原樣 broadcast)。
  useEffect(() => {
    const relay = (msg) => {
      if (previewRef.current) { previewRef.current.send(msg); return }
      const ws = wsRef.current
      if (ws && ws.readyState === WebSocket.OPEN) { try { ws.send(JSON.stringify(msg)) } catch { ingest(msg) } }
      else ingest(msg)
    }
    const onKey = (e) => {
      if (e.repeat || e.target.isContentEditable || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return
      if (e.key === 'c' || e.key === 'C') relay({ type: 'tag-present', data: { id: 'invite', kind: 'card' } })
      else if (e.key >= '1' && e.key <= '5') {
        const id = PERSONA_ORDER[Number(e.key) - 1]
        relay({ type: 'tag-present', data: { id, kind: 'character' } })
      }
      else if (e.key === 'o' || e.key === 'O') relay({ type: 'outro' })
      else if (e.key === ' ' || e.key === 'x' || e.key === 'X') relay({ type: 'tag-remove' })
      else if (e.key === 'r' || e.key === 'R' || e.key === 'Escape') relay({ type: 'reset' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ingest])

  const step    = deriveStep(state)
  const persona = state.character ? PERSONAS[state.character] : null

  // Keep the projected target fixed over the reader beneath the table.
  return (
    <div className={`stage stage--${step}${step === 'connected' ? ' stage--place-card' : ''}`} style={persona ? { '--scene-accent': persona.accent } : undefined}>
      <div className={`connection-background${step === 'connected' ? ' connection-background--active' : ''}`} aria-hidden="true" />
      <div className={`selection-background${step === 'place-character' ? ' selection-background--active' : ''}`} aria-hidden="true" />
      {step === 'connected' && <div key={state.flowId} className="connection-bloom" aria-hidden="true"><i /><i /><i /></div>}
      <div className="scene-backgrounds" aria-hidden="true">
        {PERSONA_ORDER.map(id => (
          <div key={id} className={`scene-backdrop${state.character === id ? ' scene-backdrop--active' : ''}`}
               style={{ '--scene-accent': PERSONAS[id].accent }}>
            <div className="scene-backdrop__beam" />
          </div>
        ))}
      </div>
      <div className="stage__vignette" aria-hidden="true" />

      <div className="panels" aria-hidden={step === 'farewell'}>
        <div className="panel panel--left">
          <SensorRing accent={persona ? '#fff' : 'var(--accent)'} pulse={step !== 'scene'}>
            {step === 'scene' && persona
              ? <span className="sensor-name">{persona.name}</span>
              : step === 'place-character'
                ? <KeyringIcon className="sensor-glyph" />
                : <CardIcon className="sensor-glyph" />}
          </SensorRing>


        </div>

        <div className="panel panel--right">
          <RightPanel step={step} persona={persona} />
        </div>
      </div>
      {step === 'farewell' && <section className="table-farewell" aria-label="體驗結束">
        <div className="table-farewell__background" aria-hidden="true" />
        <h1>感謝您的觀看，請往下個展區體驗</h1>
        <span className="table-farewell__logo" role="img" aria-label="ANLB" />
      </section>}

    </div>
  )
}
