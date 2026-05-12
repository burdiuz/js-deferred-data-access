import { createGuardedProxy, PermissionError } from './proxy-guard';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeApi = () => ({
  name: 'service',
  value: 42,
  nested: {
    data: 'secret',
    compute: (x: number) => x * 2,
  },
  items: ['a', 'b'],
  greet(who: string) { return `Hello ${who}`; },
});

// ---------------------------------------------------------------------------
// Basic pass-through (no rules = default allow)
// ---------------------------------------------------------------------------

describe('no rules / default allow', () => {
  it('allows GET and returns the value', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, { rules: [] });
    expect(await (g as any).value).toBe(42);
  });

  it('allows nested GET', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, { rules: [] });
    expect(await (g as any).nested.data).toBe('secret');
  });

  it('allows method calls and returns the result', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, { rules: [] });
    expect(await (g as any).greet('World')).toBe('Hello World');
  });

  it('allows nested method calls', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, { rules: [] });
    expect(await (g as any).nested.compute(5)).toBe(10);
  });

  it('allows SET and mutates the target', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, { rules: [] });
    (g as any).name = 'updated';
    await Promise.resolve(); // let async handler run
    expect(api.name).toBe('updated');
  });
});

// ---------------------------------------------------------------------------
// defaultPolicy: 'deny'
// ---------------------------------------------------------------------------

describe("defaultPolicy: 'deny'", () => {
  it('rejects when no rule matches', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, { rules: [], defaultPolicy: 'deny' });
    await expect((g as any).value).rejects.toBeInstanceOf(PermissionError);
  });

  it('allows when a matching allow rule exists', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, {
      rules: [{ match: { name: 'value' }, allow: true }],
      defaultPolicy: 'deny',
    });
    expect(await (g as any).value).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// allow rules
// ---------------------------------------------------------------------------

describe('allow rules', () => {
  it('allow: true passes the command', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, { rules: [{ allow: true }] });
    expect(await (g as any).value).toBe(42);
  });

  it('allow: false denies and throws PermissionError', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, { rules: [{ allow: false }] });
    await expect((g as any).value).rejects.toBeInstanceOf(PermissionError);
  });

  it('allow function returning true allows', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, {
      rules: [{ allow: () => true }],
    });
    expect(await (g as any).value).toBe(42);
  });

  it('allow function returning false denies', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, {
      rules: [{ allow: () => false }],
    });
    await expect((g as any).value).rejects.toBeInstanceOf(PermissionError);
  });

  it('async allow function is awaited', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, {
      rules: [{ allow: async () => { await Promise.resolve(); return true; } }],
    });
    expect(await (g as any).value).toBe(42);
  });

  it('allow receives the guard command', async () => {
    const api = makeApi();
    const received: any[] = [];
    const g = createGuardedProxy(api, {
      rules: [{ allow: (cmd) => { received.push(cmd); return true; } }],
    });
    await (g as any).value;
    expect(received[0]).toMatchObject({ type: ProxyCommand.GET, name: 'value', path: 'value' });
  });
});

// ---------------------------------------------------------------------------
// deny rules
// ---------------------------------------------------------------------------

describe('deny rules', () => {
  it('deny: true throws PermissionError', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, {
      rules: [{ match: { name: 'nested' }, deny: true }],
    });
    await expect((g as any).nested).rejects.toBeInstanceOf(PermissionError);
  });

  it('deny function returning custom Error throws that error', async () => {
    const api = makeApi();
    const customError = new Error('nope');
    const g = createGuardedProxy(api, {
      rules: [{ deny: () => customError }],
    });
    await expect((g as any).value).rejects.toBe(customError);
  });

  it('deny takes precedence when both allow and deny are in the same rule', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, {
      rules: [{ allow: true, deny: true }],
    });
    await expect((g as any).value).rejects.toBeInstanceOf(PermissionError);
  });
});

// ---------------------------------------------------------------------------
// context factory
// ---------------------------------------------------------------------------

describe('context factory', () => {
  it('context is passed to allow function', async () => {
    const api = makeApi();
    const received: any[] = [];
    const g = createGuardedProxy(api, {
      context: () => ({ user: 'admin' }),
      rules: [{ allow: (cmd, ctx) => { received.push(ctx); return true; } }],
    });
    await (g as any).value;
    expect(received[0]).toEqual({ user: 'admin' });
  });

  it('async context factory is awaited', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, {
      context: async () => ({ role: 'admin' }),
      rules: [{
        match: { type: ProxyCommand.DELETE_PROPERTY },
        allow: (_, ctx: any) => ctx.role === 'admin',
      }],
    });
    delete (g as any).name;
    await Promise.resolve(); // flush DDA context promise
    await Promise.resolve(); // flush async context factory
    expect(api.name).toBeUndefined();
  });

  it('conditional rule using context', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, {
      context: () => ({ role: 'guest' }),
      rules: [{
        match: { name: 'nested' },
        allow: (_, ctx: any) => ctx.role === 'admin',
      }],
    });
    await expect((g as any).nested).rejects.toBeInstanceOf(PermissionError);
  });
});

// ---------------------------------------------------------------------------
// transform
// ---------------------------------------------------------------------------

describe('transform', () => {
  it('transform can modify the command value before SET', async () => {
    const api = makeApi();
    const g = createGuardedProxy(api, {
      rules: [{
        match: { type: ProxyCommand.SET, name: 'name' },
        transform: (cmd) => ({ ...cmd, value: (cmd.value as string).toUpperCase() }),
      }],
    });
    (g as any).name = 'alice';
    await Promise.resolve();
    expect(api.name).toBe('ALICE');
  });
});

// ---------------------------------------------------------------------------
// before / after hooks
// ---------------------------------------------------------------------------

describe('before / after hooks', () => {
  it('before hook is called before execution', async () => {
    const api = makeApi();
    const log: string[] = [];
    const g = createGuardedProxy(api, {
      rules: [{
        before: (cmd) => { log.push(`before:${cmd.name}`); },
        allow: true,
      }],
    });
    await (g as any).value;
    expect(log).toContain('before:value');
  });

  it('after hook is called with the result', async () => {
    const api = makeApi();
    const results: unknown[] = [];
    const g = createGuardedProxy(api, {
      rules: [{
        after: (_, __, result) => { results.push(result); },
        allow: true,
      }],
    });
    await (g as any).value;
    expect(results).toContain(42);
  });

  it('before hook can be async', async () => {
    const api = makeApi();
    const called: boolean[] = [];
    const g = createGuardedProxy(api, {
      rules: [{
        before: async () => { await Promise.resolve(); called.push(true); },
        allow: true,
      }],
    });
    await (g as any).value;
    expect(called).toContain(true);
  });
});

// ---------------------------------------------------------------------------
// match filters
// ---------------------------------------------------------------------------

describe('rule match filters', () => {
  it('match.name filters by leaf name', async () => {
    const api = makeApi();
    const hits: string[] = [];
    const g = createGuardedProxy(api, {
      rules: [
        { match: { name: 'value' }, before: (cmd) => hits.push(cmd.name), allow: true },
        { allow: true },
      ],
    });
    await (g as any).value;
    await (g as any).name;
    expect(hits).toEqual(['value']);
  });

  it('match.name accepts RegExp', async () => {
    const api = makeApi();
    const hits: string[] = [];
    const g = createGuardedProxy(api, {
      rules: [
        { match: { name: /^n/ }, before: (cmd) => hits.push(cmd.name), allow: true },
        { allow: true },
      ],
    });
    await (g as any).name;
    await (g as any).nested;
    await (g as any).value;
    expect(hits.sort()).toEqual(['name', 'nested']);
  });

  it('match.type accepts array of types', async () => {
    const api = makeApi();
    const hits: string[] = [];
    const g = createGuardedProxy(api, {
      rules: [
        {
          match: { type: [ProxyCommand.GET, ProxyCommand.APPLY] },
          before: (cmd) => hits.push(cmd.type),
          allow: true,
        },
      ],
    });
    await (g as any).greet('X');
    expect(hits).toContain(ProxyCommand.GET);
    expect(hits).toContain(ProxyCommand.APPLY);
  });

  it('match.type METHOD_CALL matches APPLY in reactive mode', async () => {
    const api = makeApi();
    const hits: string[] = [];
    const g = createGuardedProxy(api, {
      rules: [
        { match: { type: ProxyCommand.METHOD_CALL }, before: (cmd) => hits.push(cmd.name), allow: true },
        { allow: true },
      ],
    });
    await (g as any).greet('Y');
    expect(hits).toContain('greet');
  });

  it('match.path accepts RegExp', async () => {
    const api = makeApi();
    const hits: string[] = [];
    const g = createGuardedProxy(api, {
      rules: [
        { match: { path: /^nested/ }, before: (cmd) => hits.push(cmd.path), allow: true },
        { allow: true },
      ],
    });
    await (g as any).nested.data;
    await (g as any).value;
    expect(hits.some(p => p.startsWith('nested'))).toBe(true);
    expect(hits.some(p => p === 'value')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// rule.continue
// ---------------------------------------------------------------------------

describe('rule.continue', () => {
  it('multiple rules with continue: true all fire', async () => {
    const api = makeApi();
    const log: number[] = [];
    const g = createGuardedProxy(api, {
      rules: [
        { before: () => { log.push(1); }, allow: true, continue: true },
        { before: () => { log.push(2); }, allow: true, continue: true },
        { before: () => { log.push(3); }, allow: true },
      ],
    });
    await (g as any).value;
    expect(log).toEqual([1, 2, 3]);
  });
});
