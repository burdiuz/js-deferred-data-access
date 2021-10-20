import { CommandChain } from '@actualwave/deferred-data-access/command';
import {
  PropertyName,
  CommandContext,
  ICommandChain,
} from '@actualwave/deferred-data-access/utils';

export enum ProxyCommand {
  GET = 'P:get',
  SET = 'P:set',
  APPLY = 'P:apply',
  DELETE_PROPERTY = 'P:del',
  // If proxy works in lazy mode and APPLY command has previous GET command, this will be generated.
  METHOD_CALL = 'P:call',
}

export const generateProxyCommand = (
  head: ICommandChain | undefined,
  type: ProxyCommand,
  name: PropertyName | undefined,
  value: unknown,
  context: CommandContext,
  lazy: boolean
): CommandChain => {
  if (type === ProxyCommand.APPLY && lazy && head?.type === ProxyCommand.GET) {
    return new CommandChain(
      head.prev,
      ProxyCommand.METHOD_CALL,
      head.name,
      value,
      head.context
    );
  }

  return new CommandChain(head, type, name, value, context);
};

export const getMethodName = ({ prev }: CommandChain) => prev?.name;
export const getMethodCallContext = ({ prev }: CommandChain) => prev?.context;
