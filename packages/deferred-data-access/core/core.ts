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
        `Unexpected Error: Promise method "${String(name)}" could not be called.`
      );
  }
};

const applyPromiseActivity = (
  command: CommandChain,
  commandHandler: CommandHandler,
  lazy: boolean,
  wrap: (context: CommandContext, command?: ICommandChain) => unknown,
  rawContext: CommandContext
) => {
  switch (command.type) {
    case ProxyCommand.GET: {
      const { name, prev } = command;
      let { context } = command;

      if (lazy) {
        if (!prev) {
          // Root lazy access to a reserved name (then/catch) — no chain to resolve
          // through, so use the raw context (the promise passed to wrap) directly.
          context = rawContext;
        } else {
          // When lazy, context is a dummy promise, so we call handler with the previous
          // command and use the result as the context to subscribe to.
          context = commandHandler(prev as CommandChain, prev.context, wrap);
        }
      }
      // When not lazy, context is already the live promise result — subscribe directly.

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
    case ProxyCommand.APPLY: {
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
    default:
      throw new Error(
        `Command type "${command.type}" could not be executed as a Promise command.`
      );
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
              wrap,
              context
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
        /**
         * Returns a new chain with the prev link severed rather than mutating
         * the existing command in-place. Safe for callers holding references.
         */
        dropCommandChain() {
          if (command) {
            // Replace the reference with a severed copy rather than mutating
            command = (command as CommandChain).withoutPrev?.() ?? command;
          }
        },
      });
    };

    return wrap(
      Promise.resolve(context),
      command ? CommandChain.fromCommand(command) : undefined
    );
  };
