import {
  initialize,
  createSubscriberFns,
  InterfaceType,
  getMessageEventData,
} from '@actualwave/deferred-data-access/interface';
import { InitConfig } from './types';

const createInitializer =
  (type: InterfaceType) =>
  async ({
    ws,
    eventEmitter = ws,
    messageSender = ws,
    ...params
  }: Partial<InitConfig>) =>
    initialize({
      sendMessage: (message: unknown) =>
        (messageSender as { send: (msg: string) => void }).send(
          JSON.stringify(message)
        ),
      preprocessResponse: (data: unknown): unknown =>
        JSON.parse(getMessageEventData(data) as string),
      ...createSubscriberFns(eventEmitter),
      ...params,
      type,
      handshakeInterval: 0,
    });

export const initializeServer = createInitializer(InterfaceType.GUEST);

export const initializeClient = createInitializer(InterfaceType.HOST);

export const forWebSocketToConnect = async (
  ws: WebSocket
): Promise<WebSocket> => {
  const { readyState } = ws;

  switch (readyState) {
    case 0:
      return new Promise((resolve, reject) => {
        const unsubscribe = () => {
          ws.removeEventListener('open', openHandler);
          ws.removeEventListener('close', closeHandler);
          ws.removeEventListener('error', closeHandler);
        };

        const openHandler = () => {
          resolve(ws);
          unsubscribe();
        };

        const closeHandler = (event: Event) => {
          reject(event);
          unsubscribe();
        };

        ws.addEventListener('open', openHandler);
        ws.addEventListener('close', closeHandler);
        ws.addEventListener('error', closeHandler);
      });
    case 1:
      return ws;
    case 2:
      throw new Error(
        'WebSocket: The connection is in the process of closing.'
      );
    case 3:
      throw new Error(
        "WebSocket: The connection is closed or couldn't be opened."
      );
    default:
      throw new Error(`WebSocket: Unknown readyState value "${readyState}".`);
  }
};
