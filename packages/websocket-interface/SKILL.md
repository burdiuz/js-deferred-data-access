---
name: "websocket-interface"
description: "Bidirectional DDA RPC over WebSocket. Use when wiring a Node.js WebSocket server and a browser client with transparent method calls, waiting for a WebSocket connection to be ready, or initialising the server and client sides of a DDA channel."
license: "MIT"
compatibility: "Node.js 18+ (server). Browser (client). TypeScript 5+."
metadata:
  author: "Oleg Galaburda <burdiuz@gmail.com>"
  version: "1.0.0"
  package: "@actualwave/websocket-interface"
---

# @actualwave/websocket-interface

Wraps a WebSocket (or `ws` socket) in DDA's `initialize()`. Server is **GUEST** (initiates handshake); client is **HOST** (waits).

## Key exports

```typescript
import {
  initializeServer,      // GUEST — Node.js ws side
  initializeClient,      // HOST  — browser / ws client side
  forWebSocketToConnect, // await a connecting WebSocket
} from '@actualwave/websocket-interface';
```

## Pattern

```typescript
// Server (Node.js + ws)
wss.on('connection', async (socket) => {
  const { root: clientApi, stop } = await initializeServer({
    socket,
    root: serverApi,
  });
  socket.on('close', stop);
});

// Browser client
const ws = new WebSocket('wss://example.com');
const open = await forWebSocketToConnect(ws, 5_000);
const { root: serverApi, stop } = await initializeClient({
  socket: open,
  root: clientApi,
});
```

## `forWebSocketToConnect(socket, timeout?)`

Resolves when `readyState === OPEN`. Rejects if already CLOSING/CLOSED or if timeout (ms) expires.

## Config (`InitConfig`)

`socket` (WebSocket / ws socket, required), `root?`, `id?`, `remoteId?`, `handshakeTimeout?`, `responseTimeout?`.

## Key invariants

- `initializeServer` = `InterfaceType.GUEST`; `initializeClient` = `InterfaceType.HOST`. The naming reflects which *side* of the connection each sits on, not the DDA host/guest concept.
- Messages are `JSON.stringify`/`JSON.parse` — non-serialisable values will throw.
- Call `stop()` in the socket's `close` event to dispose pending requests.
