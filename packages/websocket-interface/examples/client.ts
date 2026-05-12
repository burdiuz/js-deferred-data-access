import {
  initializeClient,
  forWebSocketToConnect,
} from '@actualwave/websocket-interface';

// ---------------------------------------------------------------------------
// Browser client — connects to the server and calls its API
// ---------------------------------------------------------------------------

// API this client exposes to the server (e.g. receive push events)
const clientApi = {
  onPush(event: { type: string; payload: unknown }) {
    console.log('[client] Push received:', event.type, event.payload);
  },
};

const ws = await forWebSocketToConnect(new WebSocket('wss://api.example.com/dda'));

const { root: serverApi, stop } = await initializeClient({
  ws,
  root:             clientApi,
  handshakeTimeout: 5_000,
  responseTimeout:  10_000,
});

// ---------------------------------------------------------------------------
// Call server methods via the proxy
// ---------------------------------------------------------------------------

const server = serverApi as any;

const user = await server.auth.login('alice', 's3cr3t');
console.log('Logged in as:', user.name);

const messages = await server.inbox.list({ unread: true, limit: 10 });
console.log('Unread messages:', messages.length);

await server.inbox.markAllRead();

// ---------------------------------------------------------------------------
// Subscriptions — server calls clientApi.onPush whenever something happens
// ---------------------------------------------------------------------------

await server.subscribe('new-message');

ws.addEventListener('close', stop);
