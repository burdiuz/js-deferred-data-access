import { isNameExcluded, isNameSymbol, followCommandChain } from './utils';
import { API_PROP, EXCLUSIONS } from './types';
import { ProxyCommand } from './command';
import { CommandChain } from '@actualwave/deferred-data-access/command';

describe('isNameExcluded', () => {
  it('should return true for API_PROP symbol', () => {
    expect(isNameExcluded(API_PROP)).toBe(true);
  });

  it('should return true for "arguments"', () => {
    expect(isNameExcluded('arguments')).toBe(true);
  });

  it('should return true for "caller"', () => {
    expect(isNameExcluded('caller')).toBe(true);
  });

  it('should return true for "prototype"', () => {
    expect(isNameExcluded('prototype')).toBe(true);
  });

  it('should return false for normal property names', () => {
    expect(isNameExcluded('foo')).toBe(false);
    expect(isNameExcluded('bar')).toBe(false);
    expect(isNameExcluded('myProp')).toBe(false);
  });

  it('should return false for other symbols', () => {
    expect(isNameExcluded(Symbol('random'))).toBe(false);
  });
});

describe('isNameSymbol', () => {
  it('should return true for Symbol values', () => {
    expect(isNameSymbol(Symbol('test'))).toBe(true);
    expect(isNameSymbol(Symbol.iterator)).toBe(true);
  });

  it('should return false for strings', () => {
    expect(isNameSymbol('string')).toBe(false);
    expect(isNameSymbol('')).toBe(false);
  });
});

describe('followCommandChain', () => {
  it('should follow a GET command and retrieve a property', async () => {
    const target = { greeting: 'hello' };
    const ctx = Promise.resolve(target);

    const chain = new CommandChain(undefined, ProxyCommand.GET, 'greeting', undefined, ctx);
    const result = await followCommandChain(chain, target);
    expect(result).toBe('hello');
  });

  it('should follow an APPLY command and call the function', async () => {
    const fn = jest.fn().mockReturnValue('applied');
    const ctx = Promise.resolve(fn);

    // APPLY needs prev to determine context for .apply()
    const getNode = new CommandChain(undefined, ProxyCommand.GET, 'fn', undefined, ctx);
    const applyNode = new CommandChain(getNode, ProxyCommand.APPLY, undefined, ['arg1'], ctx);

    const result = await followCommandChain(applyNode, fn);
    expect(fn).toHaveBeenCalledWith('arg1');
    expect(result).toBe('applied');
  });

  it('should throw for unknown command types', async () => {
    const ctx = Promise.resolve({});
    const chain = new CommandChain(undefined, 'P:unknown' as any, 'foo', undefined, ctx);
    await expect(followCommandChain(chain, {})).rejects.toThrow(
      'Command "P:unknown" cannot be followed'
    );
  });

  it('should resolve context from chain when none provided', async () => {
    const target = { value: 42 };
    const ctx = Promise.resolve(target);
    const chain = new CommandChain(undefined, ProxyCommand.GET, 'value', undefined, ctx);
    const result = await followCommandChain(chain);
    expect(result).toBe(42);
  });
});
