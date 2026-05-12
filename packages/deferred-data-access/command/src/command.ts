import {
  CommandContext,
  ICommand,
  PropertyName,
} from '@actualwave/deferred-data-access/utils';

export class Command implements ICommand {
  constructor(
    public readonly type: string,
    public readonly name?: PropertyName,
    public readonly value?: unknown,
    public readonly context?: CommandContext
  ) {
    Object.defineProperty(this, 'type', { value: type, writable: false, configurable: false });
    Object.defineProperty(this, 'name', { value: name, writable: false, configurable: false });
  }

  toObject(includeContext = false): ICommand {
    const { type, name, value, context } = this;
    return {
      type,
      name,
      value,
      context: includeContext ? context : undefined,
    };
  }

  toJSON(includeContext = false): string {
    const { type, name, value, context } = this;
    return includeContext
      ? JSON.stringify([type, name, value, context])
      : JSON.stringify([type, name, value]);
  }

  static fromJSON(jsonString: string): ICommand {
    const [type, name, value, context] = JSON.parse(jsonString);
    return new Command(type, name, value, context);
  }
}
