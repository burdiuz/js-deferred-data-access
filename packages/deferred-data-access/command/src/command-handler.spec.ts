import { createCommandHandler } from './command-handler';
import { CommandChain } from './command-chain';

const makeCommand = (type: string): CommandChain =>
  new CommandChain(undefined, type, 'prop', 'val');

const mockWrap = jest.fn();
const mockContext = Promise.resolve({}) as any;

describe('createCommandHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a function', () => {
    const handler = createCommandHandler({ handlers: {} });
    expect(typeof handler).toBe('function');
  });

  it('should dispatch to the correct handler by type', async () => {
    const getHandler = jest.fn().mockResolvedValue('get-result');
    const setHandler = jest.fn().mockResolvedValue('set-result');

    const handler = createCommandHandler({
      handlers: {
        'P:get': getHandler,
        'P:set': setHandler,
      },
    });

    const getCmd = makeCommand('P:get');
    await handler(getCmd, mockContext, mockWrap);
    expect(getHandler).toHaveBeenCalledWith(getCmd, mockContext, mockWrap);
    expect(setHandler).not.toHaveBeenCalled();
  });

  it('should call defaultHandler when no specific handler matches', async () => {
    const defaultHandler = jest.fn().mockResolvedValue('default-result');
    const handler = createCommandHandler({
      handlers: {},
      defaultHandler,
    });

    const cmd = makeCommand('P:unknown');
    const result = await handler(cmd, mockContext, mockWrap);
    expect(defaultHandler).toHaveBeenCalledWith(cmd, mockContext, mockWrap);
  });

  it('should return resolved undefined when no handler and no default', async () => {
    const handler = createCommandHandler({ handlers: {} });
    const cmd = makeCommand('P:unknown');
    const result = await handler(cmd, mockContext, mockWrap);
    expect(result).toBeUndefined();
  });

  it('should prefer specific handler over defaultHandler', async () => {
    const specificHandler = jest.fn().mockResolvedValue('specific');
    const defaultHandler = jest.fn().mockResolvedValue('default');

    const handler = createCommandHandler({
      handlers: { 'P:get': specificHandler },
      defaultHandler,
    });

    const cmd = makeCommand('P:get');
    await handler(cmd, mockContext, mockWrap);
    expect(specificHandler).toHaveBeenCalled();
    expect(defaultHandler).not.toHaveBeenCalled();
  });

  it('should forward all arguments to the matched handler', async () => {
    const myHandler = jest.fn().mockResolvedValue(null);
    const handler = createCommandHandler({
      handlers: { 'P:apply': myHandler },
    });

    const cmd = makeCommand('P:apply');
    await handler(cmd, mockContext, mockWrap);
    expect(myHandler).toHaveBeenCalledWith(cmd, mockContext, mockWrap);
  });

  it('should handle multiple commands dispatched in sequence', async () => {
    const results: string[] = [];
    const handler = createCommandHandler({
      handlers: {
        'P:get': jest.fn().mockImplementation(async (cmd) => {
          results.push('get:' + String(cmd.name));
          return 'ok';
        }),
        'P:set': jest.fn().mockImplementation(async (cmd) => {
          results.push('set:' + String(cmd.name));
          return 'ok';
        }),
      },
    });

    await handler(makeCommand('P:get'), mockContext, mockWrap);
    await handler(makeCommand('P:set'), mockContext, mockWrap);
    await handler(makeCommand('P:get'), mockContext, mockWrap);

    expect(results).toEqual(['get:prop', 'set:prop', 'get:prop']);
  });
});
