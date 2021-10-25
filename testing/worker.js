import { parentPort } from 'worker_threads';
import { initializeWorker } from '@actualwave/worker-interface';

const api = initializeWorker({
  worker: parentPort,
  root: {
    myMethod: (...args) => {
      console.log('myMethod called!', ...args);
      return 'Something to return';
    },
  },
});
