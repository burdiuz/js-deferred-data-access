import { PropertyName } from '@actualwave/deferred-data-access/utils';
import { CommandChain } from '@actualwave/deferred-data-access/command';
import { ProxyCommand, getMethodCallContext } from './command';
import { API_PROP, EXCLUSIONS } from './types';

export const isNameExcluded = (name: PropertyName) => name === API_PROP || Object.hasOwn(EXCLUSIONS, name);

export const isNameSymbol = (name: PropertyName) => typeof name === 'symbol';

/**
 * Walks a CommandChain and resolves it against a live target.
 * Only GET and APPLY commands are supported — all other command types
 * (SET, DELETE_PROPERTY, METHOD_CALL) are write/side-effect operations
 * that cannot be replayed safely and will throw.
 */
export const followCommandChain = async <T = unknown>(
  head: CommandChain,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any
): Promise<T> => {
  let target = context;

  if (context === undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target = head.prev
      ? await followCommandChain(head.prev as CommandChain)
      : await head.context;
  }

  const { type, name, value } = head;

  switch (type) {
    case ProxyCommand.GET:
      return target[name as PropertyName];
    case ProxyCommand.APPLY:
      return target.apply(getMethodCallContext(head), value as never[]);
    case ProxyCommand.CONSTRUCT:
      return new target(...(value as unknown[]));
    default:
      throw new Error(
        `Command "${type}" cannot be followed. Only ProxyCommand.GET and ProxyCommand.APPLY are supported by followCommandChain.`
      );
  }
};
