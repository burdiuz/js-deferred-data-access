import {
  CommandHandler,
  CommandContext,
  PropertyName,
  isReservedPropertyName,
  ReservedPropertyNames,
  ICommandChain,
} from '@actualwave/deferred-data-access/utils';
import {
  Command,
  CommandChain,
} from '@actualwave/deferred-data-access/command';
import {
  wrapWithProxy,
  createProxyTrapsObject,
  ProxyCommand,
  generateProxyCommand,
} from '@actualwave/deferred-data-access/proxy';

const EMPTY_PROMISE = Promise.resolve(undefined);

const isPromiseActivity = (command: ICommandChain) => {
  const { type } = command;

  if (type === ProxyCommand.GET || type === ProxyCommand.METHOD_CALL) {
    return isReservedPropertyName(command.name as PropertyName);
  }

  if (type === ProxyCommand.APPLY) {
    return isReservedPropertyName(command.prev?.name as PropertyName);
  }

  return false;
};

const executePromiseMethod = (
  context: CommandContext,
  name: PropertyName,
  args: never[]
) => {
  switch (name) {
    case ReservedPropertyNames.THEN:
      return context.then(...args);
    case ReservedPropertyNames.CATCH:
      return context.catch(...args);
    default:
      throw new Error(
        `Unexpected Error: Promise method "${String(
          name
        )}" could not be called.`
      );
  }
};

const applyPromiseActivity = (
  command: CommandChain,
  commandHandler: CommandHandler,
  lazy: boolean,
  wrap: (context: CommandContext, command?: ICommandChain) => unknown
) => {
  switch (command.type) {
    case ProxyCommand.GET: {
      const { name, prev } = command;
      let { context } = command;

      if (lazy) {
        // then() / catch() on lazy means we should call handler and subscribe to promise

        if (!prev) {
          throw new Error(
            `Unexpected Error: Proxy command GET has unknown context.`
          );
        }

        // When lazy, context is a dummy promise, so we have to call handler with previous command and then use it as a context.
        context = commandHandler(prev as CommandChain, prev.context, wrap);
      } else {
        // then() / catch() on non-lazy means we handler already called, just subscribe to promise of it
        /* 
           When not lazy, this promise was already created and is a context to this action.
           Without wrapper we may get this error:
           Uncaught TypeError: Method Promise.prototype.then called on incompatible receiver undefined
        */
        //return (context as any)[name as string](...(value as never[]));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: never[]) => (context as any)[name as string](...args);
    }
    case ProxyCommand.METHOD_CALL:
      if (!command.context) {
        throw new Error(
          `Unexpected Error: Could not apply Promise method of unknown context.`
        );
      }

      return executePromiseMethod(
        command.context,
        command.name as PropertyName,
        command.value as never[]
      );
    case ProxyCommand.APPLY:
      {
        const { prev } = command;
        if (!prev?.context || !prev?.name) {
          throw new Error(
            `Unexpected Error: Could not apply Promise method of unknown context.`
          );
        }

        return executePromiseMethod(
          prev.context,
          prev.name,
          command.value as never[]
        );
      }
      break;
    default:
      throw new Error(
        `Command type "${command.type}" could not be executed as a Promise command.`
      );
      break;
  }
};

export const handle =
  (commandHandler: CommandHandler, lazy = true) =>
  (context?: unknown, command?: Command): unknown => {
    const wrap = (
      context: CommandContext,
      command?: ICommandChain
    ): unknown => {
      const traps = createProxyTrapsObject(
        (
          type: ProxyCommand,
          name: PropertyName | undefined,
          value: unknown,
          context: CommandContext
        ) => {
          const childCommand = generateProxyCommand(
            command,
            type,
            name,
            value,
            context,
            lazy
          );

          let result;

          if (isPromiseActivity(childCommand)) {
            return applyPromiseActivity(
              childCommand,
              commandHandler,
              lazy,
              wrap
            );
          } else if (
            (type === ProxyCommand.APPLY || type === ProxyCommand.GET) &&
            lazy
          ) {
            result = EMPTY_PROMISE;
          } else {
            result = commandHandler(childCommand, context, wrap);
          }

          // anything coming not from Promise methods is always wrapped
          return wrap(result as Promise<CommandContext>, childCommand);
        }
      );

      return wrapWithProxy(context, traps, {
        getCommand() {
          return command;
        },
        dropCommandChain() {
          if (command) {
            delete command.prev;
          }
        },
      });
    };

    return wrap(
      Promise.resolve(context),
      command ? CommandChain.fromCommand(command) : undefined
    );
  };
