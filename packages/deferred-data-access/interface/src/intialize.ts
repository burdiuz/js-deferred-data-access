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

/*
{
  id,
  type,
  root,
  remoteId, // we might expect a connection with matching ID
  subscribe,
  unsubscribe,
  sendMessage,
  handshakeTimeout,
  responseTimeout,
  handshakeInterval,
  preprocessResponse,
}
*/
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

  const pendingRequests = new Map(); // {[key: string]: { resolve: (value) => void, reject: (error) => void }}

  const isMessage = createIsMessage(id);
  const createRequest = createRequestMessage(id, remoteId);
  const createResponse = createResponseMessage(id);

  const messageHandler = async (event: unknown) => {
    const data = getMessageEventData(preprocessResponse(event)) as MessageBase;

    if (!isMessage(data)) {
      return;
    }

    switch (data.type) {
      case MessageType.REQUEST:
        {
          const request = data as RequestMessage;
          try {
            const value = await applyRemoteRequest(request);

            sendMessage(createResponse(request, value));
          } catch (error: any) {
            sendMessage(
              createResponse(request, undefined, { message: error.message })
            );
          }
        }
        break;
      case MessageType.RESPONSE:
        {
          const { id, value, error } = data as ResponseMessage;
          const { resolve, reject } = pendingRequests.get(id) || {};

          // if error present call reject, if not -- call resolve
          if (reject && error) {
            reject(error);
          } else if (resolve) {
            resolve(value);
          }
        }
        break;
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
      // wrap() is a partially applied handle(), so it makes possible to apply same command handlers to other objects
      wrap: (context: CommandContext, command?: ICommandChain) => unknown
    ) => {
      const { responseTimeout } = params;

      /*
      If target is not a resource, there are no need to send command to remote, it can be resolved immediately.
      Need to know if there will be such cases.
    */

      const id = generateMessageId();
      const timeoutError = `Could not receive command ${command.type}/${String(
        command.name
      )} response in ${responseTimeout}ms.`;

      const resultPromise = resolveOrTimeout({
        handler: async (resolve, reject) => {
          try{
            const request = await createRequest(command, context, id);
            sendMessage(request);
            pendingRequests.set(id, { resolve, reject });
          } catch(error) {
            reject(error);
          }
        },
        timeout: responseTimeout || 0,
        timeoutError,
        onTimeout: () => {
          const rq = pendingRequests.get(id);

          if (!rq) {
            return;
          }

          rq.reject(new Error(timeoutError));
          pendingRequests.delete(id);
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
