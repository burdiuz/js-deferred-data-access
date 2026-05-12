import { createWorkerInterface } from '@actualwave/serviceworker-interface';

// ---------------------------------------------------------------------------
// Service worker — HOST side. One DDA session is created per connecting page.
// ---------------------------------------------------------------------------

declare const self: ServiceWorkerGlobalScope;

// API the service worker exposes to each page
const makeSwApi = (clientId: string) => ({
  async getCacheStats() {
    const cache = await caches.open('app-v1');
    const keys  = await cache.keys();
    return { count: keys.length, bytes: -1 }; // byte count needs Response.arrayBuffer
  },

  async fetchFresh(url: string) {
    const response = await fetch(url, { cache: 'no-store' });
    return response.json();
  },

  async clearExpiredCache() {
    const cache = await caches.open('app-v1');
    const keys  = await cache.keys();
    // Remove entries older than 24 h (stored in a Map for demo)
    console.log(`[sw] ${clientId}: clearing ${keys.length} entries`);
    await Promise.all(keys.map(k => cache.delete(k)));
  },
});

const server = createWorkerInterface({
  root: makeSwApi('__pending__'), // root is overridden per-session below
  handshakeTimeout: 5_000,
  onConnect({ clientId, root: pageApi, stop }) {
    console.log(`[sw] Client connected: ${clientId}`);

    const page = pageApi as any;

    // Ask the page about its preferences
    page.getPreferences().then((prefs: any) => {
      console.log(`[sw] ${clientId} locale:`, prefs.locale);
    });

    // Notify the page when a background sync finishes
    setTimeout(async () => {
      await page.notifyUser('Background sync complete!');
    }, 2_000);
  },
});

// Stop the server when the SW is deactivated
self.addEventListener('activate', () => server.stop());
