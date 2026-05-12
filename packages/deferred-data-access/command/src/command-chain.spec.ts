import { CommandChain } from './command-chain';
import { Command } from './command';

const makeChain = (...types: string[]): CommandChain => {
  // Build chain: first item in array is tail (no prev), last is head
  let current: CommandChain | undefined;
  for (const type of types) {
    current = new CommandChain(current, type, `name_${type}`, `val_${type}`);
  }
  return current!;
};

describe('CommandChain', () => {
  describe('constructor', () => {
    it('should create a chain node with prev', () => {
      const prev = new CommandChain(undefined, 'first', 'a', 1);
      const head = new CommandChain(prev, 'second', 'b', 2);
      expect(head.type).toBe('second');
      expect(head.prev).toBe(prev);
    });

    it('should create a tail node with no prev', () => {
      const node = new CommandChain(undefined, 'P:get', 'prop');
      expect(node.prev).toBeUndefined();
      expect(node.isTail()).toBe(true);
    });
  });

  describe('isTail', () => {
    it('should return true for single node', () => {
      const chain = new CommandChain(undefined, 'P:get');
      expect(chain.isTail()).toBe(true);
    });

    it('should return false when prev exists', () => {
      const chain = makeChain('first', 'second');
      expect(chain.isTail()).toBe(false);
    });
  });

  describe('Symbol.iterator', () => {
    it('should iterate from head to tail', () => {
      const chain = makeChain('A', 'B', 'C');
      const types = [...chain].map((n) => n.type);
      expect(types).toEqual(['C', 'B', 'A']);
    });

    it('should work on a single node', () => {
      const chain = new CommandChain(undefined, 'only');
      const items = [...chain];
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('only');
    });
  });

  describe('forEach', () => {
    it('should visit every node from head to tail', () => {
      const chain = makeChain('X', 'Y', 'Z');
      const visited: string[] = [];
      chain.forEach((node) => visited.push(node.type));
      expect(visited).toEqual(['Z', 'Y', 'X']);
    });

    it('should call callback once for single node', () => {
      const chain = new CommandChain(undefined, 'solo');
      const visited: string[] = [];
      chain.forEach((n) => visited.push(n.type));
      expect(visited).toEqual(['solo']);
    });
  });

  describe('map', () => {
    it('should transform each node', () => {
      const chain = makeChain('A', 'B', 'C');
      const result = chain.map((node) => node.type.toLowerCase());
      expect(result).toEqual(['c', 'b', 'a']);
    });

    it('should return an array of same length as chain', () => {
      const chain = makeChain('1', '2', '3', '4');
      const result = chain.map((n) => n);
      expect(result).toHaveLength(4);
    });
  });

  describe('reduce', () => {
    it('should accumulate a result across all nodes', () => {
      const chain = makeChain('A', 'B', 'C');
      const result = chain.reduce((acc, node) => acc + node.type, '');
      expect(result).toBe('CBA');
    });

    it('should return base value for single node', () => {
      const chain = new CommandChain(undefined, 'only');
      const result = chain.reduce((acc, node) => acc + 1, 0);
      expect(result).toBe(1);
    });
  });

  describe('fromCommand', () => {
    it('should create a CommandChain from an ICommand', () => {
      const ctx = Promise.resolve({});
      const cmd = new Command('P:get', 'myProp', 'myVal', ctx);
      const chain = CommandChain.fromCommand(cmd);
      expect(chain.type).toBe('P:get');
      expect(chain.name).toBe('myProp');
      expect(chain.value).toBe('myVal');
      expect(chain.context).toBe(ctx);
      expect(chain.prev).toBeUndefined();
    });

    it('should set prev when provided', () => {
      const prevChain = new CommandChain(undefined, 'prev-type');
      const cmd = new Command('next-type', 'n', 'v');
      const chain = CommandChain.fromCommand(cmd, prevChain);
      expect(chain.prev).toBe(prevChain);
      expect(chain.type).toBe('next-type');
    });
  });

  describe('toObject (inherited from Command)', () => {
    it('should serialize chain node to object', () => {
      const chain = new CommandChain(undefined, 'P:set', 'key', 99);
      const obj = chain.toObject();
      expect(obj.type).toBe('P:set');
      expect(obj.name).toBe('key');
      expect(obj.value).toBe(99);
    });
  });

  describe('withoutPrev', () => {
    it('should return a new node with no prev link', () => {
      const chain = makeChain('A', 'B', 'C');
      const severed = chain.withoutPrev();
      expect(severed.prev).toBeUndefined();
      expect(severed.isTail()).toBe(true);
    });

    it('should preserve type, name, value, and context', () => {
      const ctx = Promise.resolve({});
      const prev = new CommandChain(undefined, 'prev');
      const node = new CommandChain(prev, 'P:get', 'myProp', 42, ctx);
      const copy = node.withoutPrev();
      expect(copy.type).toBe('P:get');
      expect(copy.name).toBe('myProp');
      expect(copy.value).toBe(42);
      expect(copy.context).toBe(ctx);
    });

    it('should not mutate the original chain', () => {
      const chain = makeChain('first', 'second');
      const originalPrev = chain.prev;
      chain.withoutPrev();
      expect(chain.prev).toBe(originalPrev);
    });

    it('should return a CommandChain instance', () => {
      const chain = new CommandChain(undefined, 'P:get', 'x');
      expect(chain.withoutPrev()).toBeInstanceOf(CommandChain);
    });

    it('should work on a tail node (no prev to begin with)', () => {
      const tail = new CommandChain(undefined, 'P:get', 'prop');
      const copy = tail.withoutPrev();
      expect(copy.prev).toBeUndefined();
      expect(copy.type).toBe('P:get');
    });

    it('severed copy is independent — iterating it yields only one node', () => {
      const chain = makeChain('A', 'B', 'C');
      const severed = chain.withoutPrev();
      expect([...severed]).toHaveLength(1);
    });
  });
});
