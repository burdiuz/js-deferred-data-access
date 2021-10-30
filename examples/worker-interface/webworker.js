/**
 * Created by Oleg Galaburda on 10.02.16.
 */
importScripts('./worker-interface.umd.js');

const privateAPI = {
  secretData() {
    return 'Aliens are real!';
  },
};

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
    async getPrivateAPI(secret) {
      if (secret !== 'password1') {
        return null;
      }

      const { pool } = await api;

      const resource = pool.set(privateAPI);

      return resource.toObject();
    },
  },
});

console.log('Worker script was imported.');
