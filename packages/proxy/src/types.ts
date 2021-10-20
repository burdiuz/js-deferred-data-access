import {
  PropertyName,
  CommandContext,
} from '@actualwave/deferred-data-access/utils';
import { ProxyCommand } from './command';

export const EXCLUSIONS = {
  /*
   INFO arguments and caller were included because they are required function properties
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/arguments
   */
  arguments: true,
  caller: true,
  prototype: true,
};

export const API_PROP = Symbol('P:api');

export type APIObject = { [key: string]: () => unknown };

export type APIOwner = { [API_PROP]: APIObject };

export type ProxyWrapper = APIOwner & { (): void; target: CommandContext };

export type ProxyHandler = (
  type: ProxyCommand,
  name: PropertyName | undefined,
  value: unknown,
  context: CommandContext
) => unknown;