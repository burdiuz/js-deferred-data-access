import { createDataChannelInterface, waitForOpen } from '@actualwave/webrtc-interface';
import { InterfaceType } from '@actualwave/deferred-data-access/interface';

// ---------------------------------------------------------------------------
// Peer-to-peer game state sync over a WebRTC data channel
//
// Both peers call this setup function after RTCPeerConnection signalling.
// The HOST peer runs a full authoritative game state; the GUEST peer
// submits moves and reads back the result.
// ---------------------------------------------------------------------------

async function setupGameChannel(
  channel: RTCDataChannel,
  role: InterfaceType,
  localGameApi: object,
) {
  const openChannel = await waitForOpen(channel, 5_000);

  const { root: peerApi, stop } = await createDataChannelInterface({
    channel: openChannel,
    type:    role,
    root:    localGameApi,
    handshakeTimeout: 5_000,
  });

  return { peerApi, stop };
}

// ---------------------------------------------------------------------------
// HOST peer — owns the authoritative game state
// ---------------------------------------------------------------------------

const gameState = {
  board:   Array(9).fill(null) as (string | null)[],
  turn:    'X' as 'X' | 'O',
  winner:  null as string | null,
};

const hostApi = {
  move(index: number, player: 'X' | 'O') {
    if (gameState.winner)               return { error: 'Game over' };
    if (gameState.board[index] !== null) return { error: 'Cell taken' };
    if (gameState.turn !== player)       return { error: 'Not your turn' };
    gameState.board[index] = player;
    gameState.turn = player === 'X' ? 'O' : 'X';
    return { ok: true, board: [...gameState.board], turn: gameState.turn };
  },
  getState() {
    return { ...gameState };
  },
};

// Assume `hostChannel` was created during WebRTC offer/answer signalling.
declare const hostChannel: RTCDataChannel;
const { peerApi: guestProxy, stop: stopHost } = await setupGameChannel(
  hostChannel, InterfaceType.HOST, hostApi,
);

// ---------------------------------------------------------------------------
// GUEST peer — submits moves, reads back updated board
// ---------------------------------------------------------------------------

declare const guestChannel: RTCDataChannel;
const { peerApi: hostProxy, stop: stopGuest } = await setupGameChannel(
  guestChannel, InterfaceType.GUEST, { /* guest exposes nothing */ },
);

const host = hostProxy as typeof hostApi;

const r1 = await (host as any).move(4, 'X');
console.log('Move result:', r1); // { ok: true, board: [...], turn: 'O' }

const state = await (host as any).getState();
console.log('Board:', state.board);
