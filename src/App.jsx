import { useEffect, useReducer, useRef, useCallback } from 'react'
import { PERSONAS, PERSONA_ORDER } from './personas.js'
import PlacePrompt from './components/PlacePrompt.jsx'
import SceneActive from './components/SceneActive.jsx'
import ConfirmRipple from './components/ConfirmRipple.jsx'
import StatusDot from './components/StatusDot.jsx'

// Same WS contract as the F-region desktop (vibenfc), so B's NFC daemon can
// drive this unchanged. B has a single reader (slot 0); card + 5 keyrings are
// scanned sequentially on it.
// PORT IS FIXED TO 8788 — the exhibition shares one host, and F's server owns
// 8787. B's NFC server MUST run on 8788 to avoid colliding with F. Override via
// VITE_WS_URL only for special setups (e.g. a remote daemon).
const WS_URL       = import.meta.env.VITE_WS_URL || 'ws://localhost:8788'
const RECONNECT_MS = 3000
const CONFIRM_MS   = 1800

// ── Session state machine ────────────────────────────────────────────────────
// Display step is *derived* from the session, never set directly:
//   !cardScanned                 → 'place-card'      (attract / resting state)
//   cardScanned && !character    → 'place-character'
//   character                    → 'scene'
const initial = {
  wsStatus:    'connecting',
  connected:   false,   // reader present
  cardScanned: false,
  character:   null,    // persona id of the keyring currently driving the scene
  onReader:    null,    // 'card' | 'character' | null — what is physically on now
  confirm:     null,    // transient { kind, id, seq } for the success ripple
  seq:         0,
}

function reducer(state, action) {
  switch (action.type) {
    case 'ws-status':
      return { ...state, wsStatus: action.status }

    case 'reader-connected':
      return { ...state, connected: true }

    case 'reader-disconnected':
      // reader unplugged — keep session step, just drop the live-reader flag
      return { ...state, connected: false, onReader: null }

    case 'tag-present': {
      const kind = action.data?.kind
      const seq  = state.seq + 1
      if (kind === 'card') {
        return { ...state, cardScanned: true, onReader: 'card',
                 confirm: { kind: 'card', id: 'invite', seq }, seq }
      }
      if (kind === 'character' && PERSONAS[action.data.id]) {
        return { ...state, cardScanned: true, character: action.data.id, onReader: 'character',
                 confirm: { kind: 'character', id: action.data.id, seq }, seq }
      }
      return state // unknown / unregistered tag — ignore on the guide
    }

    case 'tag-remove':
      // lifting a keyring returns the guide to "place next character"
      return { ...state, onReader: null,
               character: state.onReader === 'character' ? null : state.character }

    case 'confirm-clear':
      return state.confirm?.seq === action.seq ? { ...state, confirm: null } : state

    case 'reset': // operator override (WS) or dev key
      return { ...initial, wsStatus: state.wsStatus, connected: state.connected }

    default:
      return state
  }
}

function deriveStep(s) {
  if (s.character)   return 'scene'
  if (s.cardScanned) return 'place-character'
  return 'place-card'
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initial)
  const wsRef    = useRef(null)
  const timerRef = useRef(null)

  // Single ingress for both the real socket and the dev simulator.
  const ingest = useCallback((msg) => {
    switch (msg.type) {
      case 'reader-connected':    dispatch({ type: 'reader-connected' }); break
      case 'reader-disconnected': dispatch({ type: 'reader-disconnected' }); break
      case 'tag-present':         dispatch({ type: 'tag-present', data: msg.data }); break
      case 'tag-remove':          dispatch({ type: 'tag-remove' }); break
      case 'reset':               dispatch({ type: 'reset' }); break
      default: break
    }
  }, [])

  // ── WebSocket ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true
    const connect = () => {
      const ws = new WebSocket(WS_URL)
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

  // ── Auto-clear the confirm ripple ─────────────────────────────────────────────
  useEffect(() => {
    if (!state.confirm) return
    const seq = state.confirm.seq
    const t = setTimeout(() => dispatch({ type: 'confirm-clear', seq }), CONFIRM_MS)
    return () => clearTimeout(t)
  }, [state.confirm])

  // ── Dev simulator (no hardware needed) ────────────────────────────────────────
  //   c = scan invite card | 1-5 = scan persona keyring | space/x = lift | r = reset
  //   把模擬事件「ws.send 進 8788 server」→ server 廣播給所有 client(桌面 + 電視同步)。
  //   未連線時 fallback 成本機 ingest(純桌面測試)。需 server 端有 dev 注入(放行
  //   tag-present/tag-remove/reset 並原樣 broadcast)。
  useEffect(() => {
    const relay = (msg) => {
      const ws = wsRef.current
      if (ws && ws.readyState === WebSocket.OPEN) { try { ws.send(JSON.stringify(msg)) } catch { ingest(msg) } }
      else ingest(msg)
    }
    const onKey = (e) => {
      if (e.key === 'c' || e.key === 'C') relay({ type: 'tag-present', data: { id: 'invite', kind: 'card' } })
      else if (e.key >= '1' && e.key <= '5') {
        const id = PERSONA_ORDER[Number(e.key) - 1]
        relay({ type: 'tag-present', data: { id, kind: 'character' } })
      }
      else if (e.key === ' ' || e.key === 'x' || e.key === 'X') relay({ type: 'tag-remove' })
      else if (e.key === 'r' || e.key === 'R' || e.key === 'Escape') relay({ type: 'reset' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ingest])

  const step    = deriveStep(state)
  const persona = state.character ? PERSONAS[state.character] : null

  // Screens are always mounted and crossfaded via a CSS `is-active` class — no
  // mount/unmount churn, no animation-library dependency for the critical
  // visibility logic. Exactly one screen carries `screen--active` at a time.
  return (
    <div className="stage" style={persona ? { '--scene-accent': persona.accent } : undefined}>
      <div className="stage__vignette" />

      <div className={`screen${step === 'place-card' ? ' screen--active' : ''}`}>
        <PlacePrompt kind="card" />
      </div>
      <div className={`screen${step === 'place-character' ? ' screen--active' : ''}`}>
        <PlacePrompt kind="character" />
      </div>
      <div className={`screen${step === 'scene' ? ' screen--active' : ''}`}>
        {persona && <SceneActive persona={persona} />}
      </div>

      {state.confirm && (
        <ConfirmRipple
          key={state.confirm.seq}
          accent={state.confirm.kind === 'character' ? PERSONAS[state.confirm.id]?.accent : null}
        />
      )}

      <StatusDot wsStatus={state.wsStatus} connected={state.connected} />
    </div>
  )
}
