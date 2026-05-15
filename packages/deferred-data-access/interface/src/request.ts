import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';
import {
  getRegistry,
  isResourceObject,
  Resource,
  ResourceObject,
  ResourcePool,
} from '@actualwave/deferred-data-access/resource';
import { PropertyName } from '@actualwave/deferred-data-access/utils';
import { RequestMessage } from './types';

let pool: ResourcePool;

export const getPool = () => {
  if (!pool) {
    pool = getRegistry().createPool();
  }

  return pool;
};

const extractResourceFrom = (value: unknown): any => {
  if (!isResourceObject(value as any)) {
    return value;
  }

  const { poolId, id } = value as ResourceObject;

  const resourcePool = getRegistry().get(poolId);

  if (!resourcePool) {
    throw new Error(`Resource Pool "${poolId}" does not exist.`);
  }

  const target = resourcePool.getById(id);

  if (target === undefined) {
    throw new Error(`Resource "${id}" does not exist, pool "${poolId}".`);
  }

  return target;
};

type CommandDispatch = (
  target: any,
  name: PropertyName,
  value: unknown,
) => unknown;

const commandDispatch: Partial<Record<ProxyCommand, CommandDispatch>> = {
  [ProxyCommand.GET]: (target, name) => target[name],

  [ProxyCommand.SET]: (target, name, value) => {
    target[name] = extractResourceFrom(value);
    return target[name];
  },

  [ProxyCommand.DELETE_PROPERTY]: (target, name) => delete target[name],

  [ProxyCommand.APPLY]: (target, _name, value) => {
    const [exeContext, args] = value as [unknown, unknown[]];
    return target.apply(
      extractResourceFrom(exeContext),
      (args as unknown[]).map(extractResourceFrom),
    );
  },

  [ProxyCommand.METHOD_CALL]: (target, name, value) =>
    target[name](...(value as unknown[]).map(extractResourceFrom)),

  [ProxyCommand.CONSTRUCT]: (target, _name, value) =>
    new target(...(value as unknown[]).map(extractResourceFrom)),
};

export const applyRemoteRequest = ({
  command,
  command: { type, value },
  context,
}: RequestMessage) => {
  const target = extractResourceFrom(context);
  const name = command.name as PropertyName;

  if (type !== ProxyCommand.APPLY && !target) {
    throw new Error(
      // Fix typo: "excute" → "execute"
      `Cannot execute command ${type}/${String(name)} on non-existent target (${target}).`,
    );
  }

  const dispatch = commandDispatch[type as ProxyCommand];

  if (!dispatch) {
    throw new Error(
      `Unknown command type "${type}" cannot be applied remotely.`,
    );
  }

  const result = dispatch(target, name, value);

  // For SET and DELETE, return the result directly without wrapping
  if (type === ProxyCommand.SET || type === ProxyCommand.DELETE_PROPERTY) {
    return result;
  }

  if (result !== null && result !== undefined) {
    if (typeof result === 'function' || type === ProxyCommand.CONSTRUCT) {
      const resource = getPool().set(result as object) as Resource;
      return resource.toObject();
    }
  }

  return result;
};
