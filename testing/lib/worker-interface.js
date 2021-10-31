'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _interface = require('@actualwave/deferred-data-access/interface');

const initializeWorker = async ({ worker, eventEmitter = _interface.findEventEmitter(worker), messagePort = _interface.findMessagePort(worker), ...params }) => _interface.initialize({
    ...params,
    type: _interface.InterfaceType.GUEST,
    sendMessage: (message) => messagePort.postMessage(message),
    ..._interface.createSubscriberFns(eventEmitter),
});
const initializeHost = async ({ worker, //: Worker | string
...params }) => {
    let instance = worker;
    if (typeof worker === 'string') {
        if (typeof Worker === 'undefined') {
            throw new Error('Worker class is not available globally.');
        }
        instance = new Worker(worker);
    }
    return _interface.initialize({
        ...params,
        type: _interface.InterfaceType.HOST,
        sendMessage: (message) => instance.postMessage(message),
        ..._interface.createSubscriberFns(instance),
    });
};

exports.initializeHost = initializeHost;
exports.initializeWorker = initializeWorker;
//# sourceMappingURL=worker-interface.js.map
