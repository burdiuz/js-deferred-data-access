import { parentPort } from 'worker_threads';

parentPort.addEventListener('message', (e) => {
  console.log(e.data);
});

console.log(parentPort.postMessage);
console.log(WeakRef);