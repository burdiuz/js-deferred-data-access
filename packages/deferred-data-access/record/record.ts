import { unwrapProxy } from '@actualwave/deferred-data-access/proxy';
import {
  CommandContext,
  CommandHandler,
  ICommandChain,
  ICommandList,
} from '@actualwave/deferred-data-access/utils';

const calls = new Map<CommandContext, Promise<unknown>>();
let latest: Promise<unknown> = Promise.resolve();

// Silently swallow unhandled rejections from tracked calls so that cleanup
// always runs — callers are responsible for handling errors on the original promise.
const noop = () => undefined;

export const latestCall = (): Promise<unknown> => latest;

export const latestCallFor = (context: CommandContext): Promise<unknown> | undefined =>
  calls.get(unwrapProxy(context));

export const clearLatestCalls = (): void => calls.clear();

export const recordHandlerCalls =
  (handler: CommandHandler) =>
  (
    command: ICommandList,
    context: CommandContext | undefined,
    wrap: (context: CommandContext, command?: ICommandChain) => unknown
  ): Promise<unknown> => {
    const promise = handler(command, context, wrap);

    // Only track the *first* call per context — subsequent calls for the same
    // context update `latest` but do not overwrite the stored per-context entry.
    // Use strict identity (not truthiness) so falsy-but-valid contexts aren't skipped.
    if (context !== undefined && context !== null && !calls.has(context)) {
      calls.set(context, promise);
      // Clean up the entry once the call settles (regardless of outcome)
      promise.then(() => calls.delete(context), noop);
    }

    latest = promise;
    return promise;
  };
