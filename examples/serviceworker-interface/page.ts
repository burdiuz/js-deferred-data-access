import { createPageInterface } from '@actualwave/serviceworker-interface';

// ---------------------------------------------------------------------------
// Page — registers a service worker and establishes a DDA connection to it
// ---------------------------------------------------------------------------

// API the page exposes to the service worker
const pageApi = {
  notifyUser(message: string) {
    const banner = document.getElementById('notification');
    if (banner) { banner.textContent = message; banner.hidden = false; }
  },
  getPreferences() {
    return {
      locale:    navigator.language,
      darkMode:  window.matchMedia('(prefers-color-scheme: dark)').matches,
    };
  },
};

// Register the service worker first
const registration = await navigator.serviceWorker.register('/sw.js');
await navigator.serviceWorker.ready;

// Open the DDA channel
const { root: swApi, stop } = await createPageInterface({
  root: pageApi,
  handshakeTimeout: 5_000,
});

// ---------------------------------------------------------------------------
// Call the service worker's API
// ---------------------------------------------------------------------------

const sw = swApi as any;

const stats = await sw.getCacheStats();
console.log('Cached entries:', stats.count, 'Total bytes:', stats.bytes);

const fresh = await sw.fetchFresh('/api/config');
console.log('Config:', fresh);

await sw.clearExpiredCache();
console.log('Cache cleared');

window.addEventListener('beforeunload', stop);
