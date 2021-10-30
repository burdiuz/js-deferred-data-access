/**
 * Created by Oleg Galaburda on 10.02.16.
 */
importScripts('./worker-interface.umd.js');

const api = WorkerInterface.initializeWorker({
  worker: self,
  root: {
    requestTime() {
      return Date.now();
    },
    callHandler(handler) {
      /*
        This is just an example of executing a callback function
        passed from a web application that is actually a refrence to "requestTime".
      */
      return handler();
    },
  },
});

console.log('Worker script was imported.');
