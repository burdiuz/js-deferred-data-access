import { initializeServer } from '@actualwave/websocket-interface';
import { WebSocket, WebSocketServer } from 'ws'; // Node.js ws package

// ---------------------------------------------------------------------------
// Node.js server — one DDA session per connected client
// ---------------------------------------------------------------------------

const wss = new WebSocketServer({ port: 8080 });
console.log('DDA WebSocket server listening on :8080');

wss.on('connection', async (ws: WebSocket) => {
  // API this server exposes to the connected browser client
  const serverApi = {
    auth: {
      async login(username: string, password: string) {
        // Validate credentials (simplified)
        if (password !== 's3cr3t') throw new Error('Invalid credentials');
        return { id: 1, name: username, role: 'user' };
      },
    },
    inbox: {
      async list({ unread, limit }: { unread?: boolean; limit?: number } = {}) {
        return [
          { id: 1, from: 'bob', subject: 'Hello', read: false },
          { id: 2, from: 'carol', subject: 'Meeting', read: unread ? false : true },
        ].slice(0, limit);
      },
      async markAllRead() {
        console.log('[server] Marked all messages as read');
      },
    },
    async subscribe(event: string) {
      console.log('[server] Client subscribed to', event);
    },
  };

  const { root: clientApi, stop } = await initializeServer({
    ws,
    root:             serverApi,
    handshakeTimeout: 5_000,
  });

  // Push events to the client at any time
  const pushInterval = setInterval(() => {
    (clientApi as any)?.onPush({ type: 'heartbeat', payload: { ts: Date.now() } });
  }, 30_000);

  ws.on('close', () => {
    clearInterval(pushInterval);
    stop();
  });
});
