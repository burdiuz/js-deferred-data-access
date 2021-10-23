///<reference path="../../../typings/@actualwave/has-own/index.d.ts" />
import { hasOwn } from '@actualwave/has-own';
import { PropertyName } from '@actualwave/deferred-data-access/utils';
import { CommandChain } from '@actualwave/deferred-data-access/command';
import { ProxyCommand, getMethodCallContext } from './command';
import { EXCLUSIONS } from './types';

export const isNameExcluded = (name: PropertyName) => hasOwn(EXCLUSIONS, name);

export const isNameSymbol = (name: PropertyName) => typeof name === 'symbol';

export const followCommandChain = async <T = unknown>(
  head: CommandChain,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any
): Promise<T> => {
  let target = context;

  if (!context) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target = head.prev
      ? await followCommandChain(head.prev as CommandChain)
      : head.context;
  }

  const { type, name, value } = head;

  switch (type) {
    case ProxyCommand.GET:
      return target[name as PropertyName];
    case ProxyCommand.APPLY:
      return target.apply(getMethodCallContext(head), value as never[]);
  }

  throw new Error(
    `Unknown command "${type}" cannot be followed, only ProxyCommand.GET and APPLY are allowed.`
  );
};
