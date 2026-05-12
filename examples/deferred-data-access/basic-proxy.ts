import { handle } from '@actualwave/deferred-data-access';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';

// ---------------------------------------------------------------------------
// 1. Build a handler and wrap a real object
// ---------------------------------------------------------------------------

const db = {
  users: {
    alice: { age: 30, role: 'admin' },
    bob:   { age: 25, role: 'user' },
  },
};

const wrap = handle(async (command, context) => {
  const target = await context as any;

  switch (command.type) {
    case ProxyCommand.GET:
      return target[command.name as string];

    case ProxyCommand.SET:
      target[command.name as string] = command.value;
      return command.value;

    case ProxyCommand.METHOD_CALL:
      return (target[command.name as string] as Function)(
        ...((command.value as unknown[]) ?? []),
      );

    default:
      throw new Error(`Unhandled command type: ${command.type}`);
  }
});

const proxy = wrap(db) as typeof db;

// ---------------------------------------------------------------------------
// 2. Read a nested value
// ---------------------------------------------------------------------------

const age = await (proxy as any).users.alice.age;
console.log('Alice age:', age); // 30

// ---------------------------------------------------------------------------
// 3. Mutate through the proxy
// ---------------------------------------------------------------------------

(proxy as any).users.bob.role = 'moderator';
// db.users.bob.role is now 'moderator'

// ---------------------------------------------------------------------------
// 4. Lazy mode: the handler fires once at the await boundary with the full
//    command chain — walk command.prev to see earlier steps
// ---------------------------------------------------------------------------

const chainWrap = handle(async (command) => {
  const steps: string[] = [];
  command.forEach(node => steps.push(`${node.type}(${String(node.name ?? '')})`));
  console.log('Chain (head→tail):', steps.join(' → '));
  return 'result';
});

const chainProxy = chainWrap({});
await (chainProxy as any).a.b.c;
// Chain (head→tail): P:get(c) → P:get(b) → P:get(a)
