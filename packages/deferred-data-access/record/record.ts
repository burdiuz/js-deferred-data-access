import { unwrapProxy } from '@actualwave/deferred-data-access/proxy';
import {
  CommandContext,
  CommandHandler,
  ICommandChain,
  ICommandList,
} from '@actualwave/deferred-data-access/utils';

const calls = new Map<CommandContext, Promise<unknown>>();
let latest: Promise<unknown> = Promise.resolve();

const noop = () => null;

export const latestCall = (): Promise<unknown> => latest;
export const latestCallFor = (context: Promise<unknown>) =>
  calls.get(unwrapProxy(context));
export const clearLatestCalls = () => calls.clear();

export const recordHandlerCalls =
  (handler: CommandHandler) =>
  (
    command: ICommandList,
    context: CommandContext | undefined,
    wrap: (
      context: CommandContext,
      command?: ICommandChain | undefined
    ) => unknown
  ) => {
    const promise = handler(command, context, wrap);

    if (context && !calls.has(context)) {
      calls.set(context, promise);

      promise.catch(noop).then(() => calls.delete(context));
    }

    latest = promise;
    return promise;
  };
