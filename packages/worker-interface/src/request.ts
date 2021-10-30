import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';
import {
  getRegistry,
  isResourceObject,
  Resource,
  ResourceObject,
} from '@actualwave/deferred-data-access/resource';
import { PropertyName } from '@actualwave/deferred-data-access/utils';
import { RequestMessage } from './types';

const registry = getRegistry();
export const pool = registry.createPool();

const extractResourceFrom = (value: unknown): any => {
  if (!isResourceObject(value as any)) {
    return value;
  }

  const { poolId, id } = value as ResourceObject;

  const pool = getRegistry().get(poolId);

  if (!pool) {
    throw new Error(`Resource Pool "${poolId}" does not exist.`);
  }

  const target = pool.getById(id);

  if (!target) {
    throw new Error(`Resource "${id}" does not exist, pool "${poolId}".`);
  }

  return target;
};

export const applyRemoteRequest = ({
  command,
  command: { type, value },
  context,
}: RequestMessage) => {
  const target = extractResourceFrom(context);
  const name = command.name as PropertyName;

  if (!target) {
    throw new Error(
      `Cannot excute command ${type}/${String(
        name
      )} on non existent target(${target}).`
    );
  }

  let result;

  switch (type) {
    case ProxyCommand.GET:
      result = target[name];
      break;
    case ProxyCommand.SET:
      return (target[name] = extractResourceFrom(value));
    case ProxyCommand.DELETE_PROPERTY:
      return delete target[name];
    case ProxyCommand.APPLY:
      {
        const [exeContext, args] = value as [unknown, unknown[]];
        result = target.apply(
          extractResourceFrom(exeContext),
          args.map(extractResourceFrom)
        );
      }
      break;
    case ProxyCommand.METHOD_CALL:
      result = target[name](...(value as unknown[]).map(extractResourceFrom));
      break;
  }

  if (result && typeof result === 'function') {
    const resource = pool.set(result) as Resource;
    return resource.toObject();
  }

  return result;
};
