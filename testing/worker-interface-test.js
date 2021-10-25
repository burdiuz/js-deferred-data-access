import { Worker } from 'worker_threads';
import { initializeHost } from '@actualwave/worker-interface';

(async () => {
  const api = await initializeHost({ worker: new Worker('./worker.js') });
  console.log('HOST API:', api.root);
  await new Promise((res) => setTimeout(() => res(), 500));
  const result = await api.root.myMethod(1, 'abc', { param: true });

  console.log('RESULT:', result);
})();
