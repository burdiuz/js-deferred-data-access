import { initializeWorker } from '@actualwave/worker-interface';

// ---------------------------------------------------------------------------
// Web Worker — GUEST that exposes computation APIs to the main thread
// ---------------------------------------------------------------------------

const workerApi = {
  async findPrimes(from: number, to: number) {
    const start = performance.now();
    const primes: number[] = [];
    for (let n = Math.max(2, from); n <= to; n++) {
      let isPrime = true;
      for (let d = 2; d * d <= n; d++) {
        if (n % d === 0) { isPrime = false; break; }
      }
      if (isPrime) primes.push(n);
    }
    const elapsed = Math.round(performance.now() - start);
    return { primes, elapsed };
  },

  async sha256(text: string) {
    const encoded = new TextEncoder().encode(text);
    const buf     = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async compress(data: Uint8Array) {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    writer.write(data);
    writer.close();
    return new Response(stream.readable).arrayBuffer();
  },
};

const { root: mainApi, stop } = await initializeWorker({
  root: workerApi,
  handshakeTimeout: 5_000,
});

// Worker can call back into the main thread
const config = await (mainApi as any).getConfig();
console.log('[worker] hardware concurrency:', config.threads);

// Report progress during a long task
await (mainApi as any).onProgress(50, 'halfway there');

self.addEventListener('close', stop);
