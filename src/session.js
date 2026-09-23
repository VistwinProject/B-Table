import { PERSONAS } from './personas.js'

// ── Session state machine ────────────────────────────────────────────────────
// Display step is *derived* from the session, never set directly:
//   !cardScanned                 → 'place-card'      (attract / resting state)
//   cardScanned && !choosing     → 'connected' (wait for TV narration)
//   cardScanned && choosing      → 'place-character'
//   character                    → 'scene'
export const initial = {
  wsStatus:    'connecting',
  connected:   false,   // reader present
  cardScanned: false,
  choosing: false,
  farewell: false,
  flowId: null,
  character:   null,    // persona id of the keyring currently driving the scene
  onReader:    null,    // 'card' | 'character' | null — what is physically on now
}

export function reducer(state, action) {
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
      if (kind === 'card') {
        if (state.onReader === 'card' && state.flowId === action.flowId) return state
        return { ...state, cardScanned: true, farewell: false, choosing: false, character: null, flowId: action.flowId, onReader: 'card' }
      }
      if (kind === 'character' && PERSONAS[action.data.id]) {
        return { ...state, cardScanned: true, farewell: false, flowId: action.flowId, choosing: true, character: action.data.id, onReader: 'character' }
      }
      return state // unknown / unregistered tag — ignore on the guide
    }

    case 'intro':
      return { ...state, cardScanned: true, choosing: true, farewell: false, character: null, flowId: action.flowId }

    case 'outro':
      return { ...state, flowId: action.flowId }

    case 'tv-phase':
      if (action.screen === 'farewell' && (state.flowId == null || action.flowId === state.flowId)) {
        return { ...state, farewell: true, character: null, flowId: action.flowId }
      }
      return state.cardScanned && !state.character && action.flowId === state.flowId
        ? { ...state, choosing: action.screen === 'choose' } : state

    case 'tag-remove':
      // lifting a keyring returns the guide to "place next character"
      return { ...state, onReader: null,
               character: state.onReader === 'character' ? null : state.character }

    case 'reset': // operator override (WS) or dev key
      return { ...initial, wsStatus: state.wsStatus, connected: state.connected }

    default:
      return state
  }
}

export function deriveStep(s) {
  if (s.farewell) return 'farewell'
  if (s.character)   return 'scene'
  if (s.cardScanned) return s.choosing ? 'place-character' : 'connected'
  return 'place-card'
}

