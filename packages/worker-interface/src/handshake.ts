import {
  HandshakeData,
  HandshakeReceiverData,
  HandshakeResponse,
  HandshakeSenderData,
} from './types';
import {
  createIsHandshakeMessage,
  getMessageEventData,
  InterfaceType,
  resolveOrTimeout,
} from './utils';

const handshakeHost =
  ({
    id,
    root,
    isMessage,
    subscribe,
    unsubscribe,
    postMessage,
  }: HandshakeReceiverData) =>
  (resolve: (data: HandshakeResponse) => void) => {
    const handshakeHandler = (event: unknown) => {
      const data = getMessageEventData(event);

      if (!isMessage(data)) {
        return;
      }

      unsubscribe(handshakeHandler);
      postMessage({ id, root });
      resolve(data);
    };

    subscribe(handshakeHandler);
  };

const handshakeWorker =
  ({
    id,
    root,
    isMessage,
    subscribe,
    unsubscribe,
    postMessage,
    handshakeInterval,
  }: HandshakeSenderData) =>
  (resolve: (data: HandshakeResponse) => void) => {
    let intervalId: number;

    const handshakeHandler = (event: unknown) => {
      const data = getMessageEventData(event);

      if (!isMessage(data)) {
        return;
      }

      unsubscribe(handshakeHandler);
      clearInterval(intervalId);
      resolve(data);
    };

    subscribe(handshakeHandler);

    const intervalFn = () => postMessage({ id, root });

    if (handshakeInterval) {
      intervalId = setInterval(intervalFn, handshakeInterval);
    } else {
      intervalFn();
    }
  };

export const handshake = ({
  type,
  remoteId,
  handshakeTimeout,
  ...params
}: HandshakeData): Promise<HandshakeResponse> => {
  const data = {
    ...params,
    isMessage: createIsHandshakeMessage(remoteId),
  };

  const handler =
    type === InterfaceType.HOST
      ? handshakeHost(data as HandshakeReceiverData)
      : handshakeWorker(data as HandshakeSenderData);

  return resolveOrTimeout<HandshakeResponse>({
    handler,
    timeout: handshakeTimeout,
    timeoutError: `Handshake sequence could not complete in ${handshakeTimeout}ms.`,
  });
};
