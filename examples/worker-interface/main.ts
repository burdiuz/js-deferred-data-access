import { initializeHost } from '@actualwave/worker-interface';

// ---------------------------------------------------------------------------
// Main thread — spawns a worker and calls its computation API
// ---------------------------------------------------------------------------

// API the main thread exposes to the worker (e.g. progress callbacks)
const mainApi = {
  onProgress(pct: number, label: string) {
    const bar = document.getElementById('progress') as HTMLProgressElement;
    if (bar) bar.value = pct;
    console.log(`Progress: ${pct}% — ${label}`);
  },
  getConfig() {
    return {
      threads:  navigator.hardwareConcurrency,
      locale:   navigator.language,
    };
  },
};

const { root: workerApi, stop } = await initializeHost({
  worker: new URL('./worker.ts', import.meta.url),
  root:   mainApi,
  handshakeTimeout: 5_000,
  responseTimeout:  30_000,
});

// ---------------------------------------------------------------------------
// Run CPU-heavy tasks off the main thread
// ---------------------------------------------------------------------------

const api = workerApi as any;

const { primes, elapsed } = await api.findPrimes(2, 1_000_000);
console.log(`Found ${primes.length} primes in ${elapsed}ms`);

const hash = await api.sha256('hello world');
console.log('SHA-256:', hash);

const compressed = await api.compress(new Uint8Array([1, 2, 3, 4, 5]));
console.log('Compressed bytes:', compressed.byteLength);

window.addEventListener('beforeunload', stop);
