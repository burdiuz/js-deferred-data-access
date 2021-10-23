import { Worker } from 'worker_threads';


const w = new Worker('./worker.js');

let index = 1;

setInterval(() => {
    w.postMessage({ test: 'ABC!:', prop: index++ });
}, 1000);
