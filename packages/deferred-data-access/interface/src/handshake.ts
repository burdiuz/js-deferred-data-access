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

// leader
const handshakeHost =
  ({
    id,
    root,
    isMessage,
    subscribe,
    unsubscribe,
    sendMessage,
    preprocessResponse = (data: unknown) => data,
  }: HandshakeReceiverData) =>
  (resolve: (data: HandshakeResponse) => void) => {
    const handshakeHandler = (event: unknown) => {
      const data = getMessageEventData(preprocessResponse(event));

      if (!isMessage(data)) {
        return;
      }

      unsubscribe(handshakeHandler);
      sendMessage({ id, root });
      resolve(data);
    };

    subscribe(handshakeHandler);
  };

// follower
const handshakeGuest =
  ({
    id,
    root,
    isMessage,
    subscribe,
    unsubscribe,
    sendMessage,
    handshakeInterval,
    preprocessResponse = (data: unknown) => data,
  }: HandshakeSenderData) =>
  (resolve: (data: HandshakeResponse) => void) => {
    let intervalId: number;

    const handshakeHandler = (event: unknown) => {
      const data = getMessageEventData(preprocessResponse(event));

      if (!isMessage(data)) {
        return;
      }

      unsubscribe(handshakeHandler);
      clearInterval(intervalId);
      resolve(data);
    };

    subscribe(handshakeHandler);

    const intervalFn = () => sendMessage({ id, root });

    if (handshakeInterval) {
      // FIXME TS2322: Type 'Timer' is not assignable to type 'number'.
      intervalId = setInterval(
        intervalFn,
        handshakeInterval
      ) as unknown as number;
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
      : handshakeGuest(data as HandshakeSenderData);

  return resolveOrTimeout<HandshakeResponse>({
    handler,
    timeout: handshakeTimeout,
    timeoutError: `Handshake sequence could not complete in ${handshakeTimeout}ms.`,
  });
};
