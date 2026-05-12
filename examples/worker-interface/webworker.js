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

    // Demonstrates passing a function reference from the main thread as a callback.
    // The worker receives it as a DDA proxy and can call it remotely.
    callHandler(handler) {
      return handler();
    },

    async getPrivateAPI(secret) {
      if (secret !== 'password1') return null;

      const { pool } = await api;
      const resource = pool.set(privateAPI);
      return resource.toObject();
    },
  },
});

console.log('Worker script loaded.');
