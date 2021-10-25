/*
  Property name could be a string or an instance of Symbol
*/
export type PropertyName = string | symbol;

export interface IResource {
  id: string;
  poolId: string;
  type: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandContext = Promise<unknown | IResource>;

export interface ICommand {
  type: string;
  name?: PropertyName;
  value?: unknown;
  context?: CommandContext;
}

export interface ICommandChain extends ICommand {
  prev?: ICommandChain;
  toObject(): ICommand;
}

export interface ICommandList extends ICommandChain {
  isTail(): boolean;
  forEach(callback: (item: ICommandChain) => void): void;
  map<T = unknown>(callback: (item: ICommandChain) => T): Array<T>;
  reduce<T = unknown>(
    callback: (result: T, item: ICommandChain) => T,
    base: T
  ): T;
}

/*
 Function supplied by user, it is being called for a command
*/
export type CommandHandler = (
  command: ICommandList,
  context: CommandContext | undefined,
  // wrap() is a partially applied handle(), so it makes possible to apply same command handlers to other objects
  wrap: (context: CommandContext, command?: ICommandChain) => unknown
) => Promise<unknown>;
