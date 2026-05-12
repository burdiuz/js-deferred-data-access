/*
  Property name could be a string or an instance of Symbol.
*/
export type PropertyName = string | symbol;

export interface IResource {
  id: string;
  poolId: string;
  type: string;
}

/*
  CommandContext is always a Promise. The resolved value may be either a plain
  object/value or an IResource descriptor (used over message-passing boundaries).
  `Promise<unknown>` is intentionally broad here — callers narrow as needed.
*/
export type CommandContext = Promise<unknown>;

export interface ICommand {
  type: string;
  name?: PropertyName;
  value?: unknown;
  context?: CommandContext;
}

export interface ICommandChain extends ICommand {
  readonly prev?: ICommandChain;
  toObject(includeContext?: boolean): ICommand;
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
  Function supplied by the user, called once per command.
  - command: the full command chain describing what was intercepted
  - context: the Promise that resolves to the target object, if known
  - wrap: partially-applied handle() — lets the handler recursively proxy
    return values with the same command handler
*/
export type CommandHandler = (
  command: ICommandList,
  context: CommandContext | undefined,
  wrap: (context: CommandContext, command?: ICommandChain) => unknown
) => Promise<unknown>;
