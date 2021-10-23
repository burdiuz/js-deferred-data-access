/* eslint-disable @typescript-eslint/no-this-alias */
import {
  CommandContext,
  ICommand,
  ICommandList,
  ICommandChain,
  PropertyName,
} from '@actualwave/deferred-data-access/utils';
import { Command } from './command';

export class CommandChain extends Command implements ICommandList {
  constructor(
    public prev: ICommandChain | undefined,
    type: string,
    name?: PropertyName,
    value?: unknown,
    context?: CommandContext
  ) {
    super(type, name, value, context);
  }

  *[Symbol.iterator]() {
    let item: ICommandChain | undefined = this;

    while (item) {
      yield item;
      item = item.prev;
    }
  }

  isTail(): boolean {
    return !this.prev;
  }

  forEach(callback: (item: ICommandChain) => void): void {
    let node: ICommandChain | undefined = this;

    do {
      callback(node);
      node = node.prev;
    } while (node);
  }

  map<T = unknown>(callback: (item: ICommandChain) => T): Array<T> {
    let node: ICommandChain | undefined = this;
    const list = [];

    do {
      list.push(callback(node));
      node = node.prev;
    } while (node);

    return list;
  }

  reduce<T = unknown>(
    callback: (result: T, item: ICommandChain) => T,
    base: T
  ): T {
    let node: ICommandChain | undefined = this;
    let result = base;

    do {
      result = callback(result, node);
      node = node.prev;
    } while (node);

    return result;
  }

  static fromCommand(
    { type, name, value, context }: ICommand,
    prev?: ICommandChain
  ): CommandChain {
    return new CommandChain(prev, type, name, value, context);
  }
}
