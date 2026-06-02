"""
B 區 感應光寓 — NFC WebSocket server

沿用 F 區 vibenfc 的協議與多讀卡機架構,差別只在:
  - WS_PORT = 8788(F 區占用 8787,展覽同網域必須避開)
  - uid-map 為 B 區的邀請卡 + 5 角色鑰匙圈(server/uid-map.json)

B 區實際只用 1 台讀卡機(slot 0),卡 + 鑰匙圈依序刷同一點;但仍保留多 slot
支援以便日後改多感應區。沒接讀卡機時 server 照常啟動,只是不廣播 tag 事件 —
前端(B-Table)WS 連得上、右下角狀態燈會顯示「等待讀卡機」。
"""
import asyncio
import json
import os

from smartcard.System import readers as get_readers

# ── uid-map ───────────────────────────────────────────────────────────────────
SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
UID_MAP_PATH = os.path.join(SCRIPT_DIR, 'uid-map.json')
uid_map: dict = {}
try:
    with open(UID_MAP_PATH, 'r', encoding='utf-8') as f:
        raw = json.load(f)
    # 允許 uid-map.json 內含 _comment 等非 UID 的說明欄位
    uid_map = {k: v for k, v in raw.items() if isinstance(v, dict) and 'id' in v}
    print(f'[MAP]  Loaded {len(uid_map)} UID entries')
except Exception as e:
    print(f'[MAP]  uid-map.json: {e}')

# ── Config ────────────────────────────────────────────────────────────────────
WS_PORT      = 8788          # ← B 區固定埠口(F 區為 8787)
POLL_SEC     = 0.3
GET_UID_APDU = [0xFF, 0xCA, 0x00, 0x00, 0x00]
MAX_SLOTS    = 9

# Dev 注入:無硬體時,前端鍵盤模擬器把事件 ws.send 進來,server 原樣廣播給所有
# client(桌面投影 + 電視同步)。正式接 reader 後這條不影響真實事件。
# 只放行這幾種已知 type,避免亂送。
SIM_RELAY_TYPES = {'tag-present', 'tag-remove', 'reset', 'intro', 'outro'}

# ── Per-slot state (index 0-8) ────────────────────────────────────────────────
def _empty_slot():
    return {'connected': False, 'reader_name': '', 'last_uid': None, 'current_card': None}

slot_state: list[dict] = [_empty_slot() for _ in range(MAX_SLOTS)]

# reader_name → assigned slot_index
reader_to_slot: dict[str, int] = {}

# ── WebSocket clients ─────────────────────────────────────────────────────────
clients: set = set()

async def broadcast(payload: dict):
    msg = json.dumps(payload, ensure_ascii=False)
    dead = set()
    for ws in list(clients):
        try:
            await ws.send(msg)
        except Exception:
            dead.add(ws)
    clients.difference_update(dead)

async def ws_handler(websocket):
    clients.add(websocket)
    print('[WS]   Client connected')
    try:
        # Send full current state to new client
        for i, state in enumerate(slot_state):
            if state['connected']:
                await websocket.send(json.dumps({
                    'type': 'reader-connected',
                    'slot_index': i,
                    'reader': state['reader_name'],
                }))
            if state['current_card']:
                await websocket.send(json.dumps(state['current_card'], ensure_ascii=False))

        # 收前端訊息:dev 注入(模擬刷卡)原樣廣播給所有 client,讓桌面 + 電視同步
        async for raw in websocket:
            try:
                msg = json.loads(raw)
            except Exception:
                continue
            if isinstance(msg, dict) and msg.get('type') in SIM_RELAY_TYPES:
                print(f"[SIM]  relay {msg.get('type')} {msg.get('data', '')}")
                await broadcast(msg)
    finally:
        clients.discard(websocket)
        print('[WS]   Client disconnected')

# ── Slot assignment ───────────────────────────────────────────────────────────
def assign_slot(reader_name: str) -> int:
    """Return next free slot index, or -1 if all full."""
    used = set(reader_to_slot.values())
    for i in range(MAX_SLOTS):
        if i not in used:
            return i
    return -1

# ── NFC polling loop ──────────────────────────────────────────────────────────
async def nfc_loop():
    print(f'[NFC]  Polling every {int(POLL_SEC * 1000)} ms — connect ACR122U readers.')

    while True:
        try:
            available     = get_readers()
            current_names = {str(r) for r in available}
            known_names   = set(reader_to_slot.keys())

            # ── New readers ───────────────────────────────────────────────────
            for reader in available:
                rname = str(reader)
                if rname not in reader_to_slot:
                    idx = assign_slot(rname)
                    if idx < 0:
                        print(f'[NFC]  No free slot for: {rname}')
                        continue
                    reader_to_slot[rname] = idx
                    slot_state[idx].update({'connected': True, 'reader_name': rname})
                    print(f'[NFC]  Slot {idx}: {rname}')
                    await broadcast({'type': 'reader-connected', 'slot_index': idx, 'reader': rname})

            # ── Removed readers ───────────────────────────────────────────────
            for rname in known_names - current_names:
                idx = reader_to_slot.pop(rname)
                slot_state[idx] = _empty_slot()
                print(f'[NFC]  Slot {idx} disconnected ({rname})')
                await broadcast({'type': 'reader-disconnected', 'slot_index': idx})

            # ── Poll each connected reader for a card ─────────────────────────
            for reader in available:
                rname = str(reader)
                if rname not in reader_to_slot:
                    continue
                idx   = reader_to_slot[rname]
                state = slot_state[idx]

                try:
                    conn = reader.createConnection()
                    conn.connect()
                    data, sw1, sw2 = conn.transmit(GET_UID_APDU)
                    conn.disconnect()

                    if sw1 == 0x90 and sw2 == 0x00:
                        uid = ''.join(f'{b:02X}' for b in data)
                        if uid != state['last_uid']:          # debounce
                            state['last_uid'] = uid
                            card_data = uid_map.get(uid)
                            known     = card_data is not None
                            label     = card_data['label'] if known else '(unknown)'
                            print(f'[NFC]  Slot[{idx}] {uid} → {label}')

                            event = {
                                'type':       'tag-present',
                                'slot_index': idx,
                                'uid':        uid,
                                'known':      known,
                                'data':       card_data,
                            }
                            state['current_card'] = event
                            await broadcast(event)

                    else:
                        if state['last_uid'] is not None:
                            state['last_uid']     = None
                            state['current_card'] = None
                            print(f'[NFC]  Slot[{idx}] card removed')
                            await broadcast({'type': 'tag-remove', 'slot_index': idx})

                except Exception:
                    if state['last_uid'] is not None:
                        state['last_uid']     = None
                        state['current_card'] = None
                        print(f'[NFC]  Slot[{idx}] card removed')
                        await broadcast({'type': 'tag-remove', 'slot_index': idx})

        except Exception as e:
            print(f'[NFC]  Error: {e}')

        await asyncio.sleep(POLL_SEC)

# ── Entry point ───────────────────────────────────────────────────────────────
async def main():
    import websockets
    print(f'[WS]   B 區 WebSocket server on ws://localhost:{WS_PORT}')
    async with websockets.serve(ws_handler, 'localhost', WS_PORT):
        print(f'[WS]   Ready.')
        await nfc_loop()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print('\n[WS]   Stopped.')
