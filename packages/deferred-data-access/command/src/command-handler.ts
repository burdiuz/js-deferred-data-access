import {
  CommandHandler,
  ICommandList,
} from '@actualwave/deferred-data-access/utils';

/*
  Creates a function that calls handler depending on command type
*/
export const createCommandHandler =
  ({
    handlers,
    defaultHandler,
  }: {
    handlers: { [key: string]: CommandHandler };
    defaultHandler?: CommandHandler;
  }): CommandHandler =>
  (command: ICommandList, ...args) => {
    const { type } = command;
    const handler = (handlers && handlers[type]) || defaultHandler;

    if (handler) {
      return handler(command, ...args);
    }

    return Promise.resolve(undefined);
  };
