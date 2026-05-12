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

// leader (HOST): waits for guest to initiate, then replies
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

// follower (GUEST): initiates handshake by sending its identity, waits for host reply
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
    // Use ReturnType to avoid the TS2322 Timer/number mismatch across environments
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const handshakeHandler = (event: unknown) => {
      const data = getMessageEventData(preprocessResponse(event));

      if (!isMessage(data)) {
        return;
      }

      unsubscribe(handshakeHandler);

      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }

      resolve(data);
    };

    subscribe(handshakeHandler);

    const intervalFn = () => sendMessage({ id, root });

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
      : handshakeGuest(data as HandshakeSenderData);

  return resolveOrTimeout<HandshakeResponse>({
    handler,
    timeout: handshakeTimeout,
    timeoutError: `Handshake sequence could not complete in ${handshakeTimeout}ms.`,
  });
};
