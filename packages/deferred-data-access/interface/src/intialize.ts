import { handle } from '@actualwave/deferred-data-access';
import {
  isResourceObject,
  Resource,
} from '@actualwave/deferred-data-access/resource';
import {
  ICommandList,
  CommandContext,
  ICommandChain,
} from '@actualwave/deferred-data-access/utils';
import { handshake } from './handshake';
import { pool, applyRemoteRequest } from './request';
import {
  HandshakeData,
  MessageBase,
  RequestMessage,
  ResponseMessage,
  InitConfig,
} from './types';
import {
  createIsMessage,
  createRequestMessage,
  createResponseMessage,
  generateId,
  generateMessageId,
  getMessageEventData,
  MessageType,
  resolveOrTimeout,
} from './utils';

export const initialize = async ({
  id: initId,
  root: apiRoot,
  ...params
}: InitConfig) => {
  const id = initId || generateId();
  const root = apiRoot
    ? (pool.set(apiRoot as any) as Resource).toObject()
    : undefined;

  const {
    subscribe,
    unsubscribe,
    sendMessage,
    preprocessResponse = (data: unknown) => data,
  } = params;

  const { id: remoteId, root: remoteRoot } = await handshake({
    id,
    root,
    ...params,
  } as HandshakeData);

  // Tracks in-flight requests: messageId → { resolve, reject }
  const pendingRequests = new Map<string, { resolve: (v: unknown) => void; reject: (e: unknown) => void }>();

  const isMessage = createIsMessage(id);
  const createRequest = createRequestMessage(id, remoteId);
  const createResponse = createResponseMessage(id);

  const messageHandler = async (event: unknown) => {
    const data = getMessageEventData(preprocessResponse(event)) as MessageBase;

    if (!isMessage(data)) {
      return;
    }

    switch (data.type) {
      case MessageType.REQUEST: {
        const request = data as RequestMessage;
        try {
          const value = await applyRemoteRequest(request);
          sendMessage(createResponse(request, value));
        } catch (error: any) {
          sendMessage(
            createResponse(request, undefined, { message: error.message })
          );
        }
        break;
      }
      case MessageType.RESPONSE: {
        const { id, value, error } = data as ResponseMessage;
        const pending = pendingRequests.get(id);

        if (!pending) {
          return;
        }

        pendingRequests.delete(id);

        // Settle exactly once — delete before calling to prevent double-settle
        if (error) {
          pending.reject(error);
        } else {
          pending.resolve(value);
        }
        break;
      }
    }
  };

  subscribe(messageHandler);
  const stop = () => unsubscribe(messageHandler);

  if (!remoteRoot) {
    return { stop, pool };
  }

  const wrap = handle(
    async (
      command: ICommandList,
      context: CommandContext | undefined,
      wrap: (context: CommandContext, command?: ICommandChain) => unknown
    ) => {
      const { responseTimeout } = params;

      const msgId = generateMessageId();
      const timeoutError = `Could not receive command ${command.type}/${String(
        command.name
      )} response in ${responseTimeout}ms.`;

      const resultPromise = resolveOrTimeout({
        handler: async (resolve, reject) => {
          try {
            const request = await createRequest(command, context, msgId);
            // Register before sending to eliminate the race between send and response arrival
            pendingRequests.set(msgId, { resolve, reject });
            sendMessage(request);
          } catch (error) {
            reject(error);
          }
        },
        timeout: responseTimeout || 0,
        timeoutError,
        onTimeout: () => {
          // resolveOrTimeout already rejected the race promise.
          // We only need to clean up the pending entry here.
          pendingRequests.delete(msgId);
        },
      });

      const result = await resultPromise;

      if (isResourceObject(result)) {
        return wrap(resultPromise, command);
      }

      return resultPromise;
    },
    false
  );

  return {
    stop,
    pool,
    wrap,
    pendingRequests,
    root: remoteRoot ? wrap(remoteRoot) : null,
  };
};
