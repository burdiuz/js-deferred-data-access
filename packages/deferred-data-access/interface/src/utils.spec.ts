import {
  InterfaceType,
  MessageType,
  createRequestMessage,
  createResponseMessage,
  createIsHandshakeMessage,
  createIsMessage,
  resolveOrTimeout,
  getMessageEventData,
  generateId,
  generateMessageId,
} from './utils';
import { CommandChain } from '@actualwave/deferred-data-access/command';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';

describe('InterfaceType', () => {
  it('should have HOST and GUEST values', () => {
    expect(InterfaceType.HOST).toBe('host');
    expect(InterfaceType.GUEST).toBe('guest');
  });
});

describe('MessageType', () => {
  it('should have REQUEST and RESPONSE values', () => {
    expect(MessageType.REQUEST).toBe('request');
    expect(MessageType.RESPONSE).toBe('response');
  });
});

describe('generateId', () => {
  it('should return a string starting with "wi/"', () => {
    const id = generateId();
    expect(id).toMatch(/^wi\//);
  });

  it('should return unique values', () => {
    const ids = new Set([generateId(), generateId(), generateId()]);
    expect(ids.size).toBe(3);
  });
});

describe('generateMessageId', () => {
  it('should return a string starting with "m/"', () => {
    const id = generateMessageId();
    expect(id).toMatch(/^m\//);
  });

  it('should return unique values', () => {
    const ids = new Set([generateMessageId(), generateMessageId(), generateMessageId()]);
    expect(ids.size).toBe(3);
  });
});

describe('createRequestMessage', () => {
  const source = 'src-1';
  const target = 'tgt-1';

  it('should build a request message for GET command', async () => {
    const createRequest = createRequestMessage(source, target);
    const ctx = Promise.resolve({});
    const command = new CommandChain(undefined, ProxyCommand.GET, 'myProp', undefined, ctx as any);
    const msg = await createRequest(command, ctx);

    expect(msg.type).toBe(MessageType.REQUEST);
    expect(msg.source).toBe(source);
    expect(msg.target).toBe(target);
    expect(msg.command.type).toBe(ProxyCommand.GET);
    expect(msg.command.name).toBe('myProp');
    expect(typeof msg.id).toBe('string');
  });

  it('should use provided id when given', async () => {
    const createRequest = createRequestMessage(source, target);
    const ctx = Promise.resolve({});
    const command = new CommandChain(undefined, ProxyCommand.GET, 'foo', undefined, ctx as any);
    const msg = await createRequest(command, ctx, 'my-custom-id');
    expect(msg.id).toBe('my-custom-id');
  });

  it('should build a request message for APPLY command with context and args', async () => {
    const createRequest = createRequestMessage(source, target);
    const execCtx = Promise.resolve({});
    const prevNode = new CommandChain(undefined, ProxyCommand.GET, 'method', undefined, execCtx as any);
    const applyNode = new CommandChain(prevNode, ProxyCommand.APPLY, undefined, ['arg1', 'arg2'], execCtx as any);
    const ctxPromise = Promise.resolve({});
    const msg = await createRequest(applyNode, ctxPromise);

    expect(msg.command.type).toBe(ProxyCommand.APPLY);
    // value should be [exeContext, args]
    expect(Array.isArray(msg.command.value)).toBe(true);
  });
});

describe('createResponseMessage', () => {
  const sourceId = 'source-worker';

  const fakeRequest = {
    id: 'msg-123',
    source: 'remote-worker',
    type: MessageType.REQUEST,
    target: sourceId,
    command: {} as any,
    context: undefined,
  };

  it('should create a response with matching id and flipped source/target', () => {
    const createResponse = createResponseMessage(sourceId);
    const response = createResponse(fakeRequest, 'result-value');
    expect(response.id).toBe('msg-123');
    expect(response.source).toBe(sourceId);
    expect(response.target).toBe('remote-worker');
    expect(response.type).toBe(MessageType.RESPONSE);
    expect(response.value).toBe('result-value');
    expect(response.error).toBeUndefined();
  });

  it('should include error when provided', () => {
    const createResponse = createResponseMessage(sourceId);
    const errObj = { message: 'something went wrong' };
    const response = createResponse(fakeRequest, undefined, errObj);
    expect(response.error).toEqual(errObj);
    expect(response.value).toBeUndefined();
  });
});

describe('createIsHandshakeMessage', () => {
  it('should return true for objects with id starting with "wi"', () => {
    const isHandshake = createIsHandshakeMessage();
    expect(isHandshake({ id: 'wi/123' })).toBe(true);
  });

  it('should return false for objects with non-wi id when no expected id given', () => {
    const isHandshake = createIsHandshakeMessage();
    expect(isHandshake({ id: 'm/123' })).toBe(false);
  });

  it('should return true when ids match exactly', () => {
    const isHandshake = createIsHandshakeMessage('wi/specific-id');
    expect(isHandshake({ id: 'wi/specific-id' })).toBe(true);
  });

  it('should return false when ids do not match', () => {
    const isHandshake = createIsHandshakeMessage('wi/specific-id');
    expect(isHandshake({ id: 'wi/other-id' })).toBe(false);
  });

  it('should return false for null', () => {
    const isHandshake = createIsHandshakeMessage();
    expect(isHandshake(null)).toBe(false);
  });

  it('should return false when id is not a string', () => {
    const isHandshake = createIsHandshakeMessage();
    expect(isHandshake({ id: 123 })).toBe(false);
  });

  it('should return a strict boolean true (not a truthy array)', () => {
    const isHandshake = createIsHandshakeMessage();
    const result = isHandshake({ id: 'wi/abc' });
    expect(result).toBe(true);
    expect(typeof result).toBe('boolean');
  });

  it('should return a strict boolean false (not null or empty string)', () => {
    const isHandshake = createIsHandshakeMessage();
    expect(isHandshake(null)).toBe(false);
    expect(isHandshake({ id: 'other' })).toBe(false);
  });
});

describe('createIsMessage', () => {
  it('should return true for messages targeting the given id', () => {
    const isMessage = createIsMessage('worker-A');
    expect(isMessage({ id: 'msg-1', target: 'worker-A' })).toBe(true);
  });

  it('should return false for messages targeting a different id', () => {
    const isMessage = createIsMessage('worker-A');
    expect(isMessage({ id: 'msg-1', target: 'worker-B' })).toBe(false);
  });

  it('should return false for null or non-objects', () => {
    const isMessage = createIsMessage('worker-A');
    expect(isMessage(null)).toBe(false);
    expect(isMessage('string')).toBe(false);
  });

  it('should return false when id is missing', () => {
    const isMessage = createIsMessage('worker-A');
    expect(isMessage({ target: 'worker-A' })).toBe(false);
  });
});

describe('resolveOrTimeout', () => {
  it('should resolve with the handler value when it completes in time', async () => {
    const result = await resolveOrTimeout({
      handler: (resolve) => resolve('done'),
      timeout: 1000,
      timeoutError: 'too slow',
    });
    expect(result).toBe('done');
  });

  it('should reject with timeoutError when handler exceeds timeout', async () => {
    await expect(
      resolveOrTimeout({
        handler: (resolve) => setTimeout(resolve, 200),
        timeout: 20,
        timeoutError: 'timed out!',
      })
    ).rejects.toBe('timed out!');
  });

  it('should resolve without timeout when timeout is 0', async () => {
    const result = await resolveOrTimeout({
      handler: (resolve) => resolve('immediate'),
      timeout: 0,
      timeoutError: 'should not appear',
    });
    expect(result).toBe('immediate');
  });

  it('should accept a Promise directly as handler', async () => {
    const result = await resolveOrTimeout({
      handler: Promise.resolve('from-promise'),
      timeout: 1000,
      timeoutError: 'too slow',
    });
    expect(result).toBe('from-promise');
  });

  it('should call onTimeout when timeout is reached', async () => {
    const onTimeout = jest.fn();
    await expect(
      resolveOrTimeout({
        handler: (resolve) => setTimeout(resolve, 300),
        timeout: 20,
        timeoutError: 'timeout msg',
        onTimeout,
      })
    ).rejects.toBeDefined();

    // Allow microtasks to flush
    await new Promise((r) => setTimeout(r, 50));
    expect(onTimeout).toHaveBeenCalledWith('timeout msg');
  });
});

describe('getMessageEventData', () => {
  it('should return data property from an Event-like object', () => {
    // Create a minimal Event-like instance
    class FakeEvent {
      data: any;
      constructor(data: any) { this.data = data; }
    }
    // Make it pass instanceof Event check
    const origEvent = global.Event;
    (global as any).Event = FakeEvent;

    const event = new FakeEvent({ hello: 'world' });
    const result = getMessageEventData(event);
    expect(result).toEqual({ hello: 'world' });

    (global as any).Event = origEvent;
  });

  it('should return the value itself when not an Event', () => {
    const data = { id: 'msg-1', type: 'request' };
    expect(getMessageEventData(data)).toBe(data);
  });
});
