import { handle } from '@actualwave/deferred-data-access';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';
import type { ICommandList, ICommandChain } from '@actualwave/deferred-data-access/utils';
import { connectMFEInterface } from './mfe-interface';
import { Connection, MFEInterfaceConfig } from './types';

// Replays a DDA command chain on `target` from tail (shallowest) to head
// (deepest), reconstructing the same sequence of property accesses and calls
// on the target object.
//
// command.map() yields [head, ..., tail]; reversed = root-first traversal.
// Each step operates on the result of the previous one, so nested paths like
// `module.subMethod(args)` are correctly forwarded as `target.module.subMethod(args)`.
const replayChain = (command: ICommandList, target: unknown): unknown => {
  const nodes = command.map((node: ICommandChain) => node).reverse();
  let current: any = target;

  for (const node of nodes) {
    switch (node.type) {
      case ProxyCommand.GET:
        current = current[node.name as string];
        break;
      case ProxyCommand.METHOD_CALL:
        current = current[node.name as string](...((node.value as unknown[]) ?? []));
        break;
      case ProxyCommand.APPLY:
        current = current(...((node.value as unknown[]) ?? []));
        break;
      case ProxyCommand.SET:
        current[node.name as string] = node.value;
        current = undefined;
        break;
      case ProxyCommand.DELETE_PROPERTY:
        delete current[node.name as string];
        current = undefined;
        break;
    }
  }

  return current;
};

// Creates a DDA proxy that intercepts every command and forwards the full
// chain to the real target root once `targetDeferred` resolves.
//
// MFE-A sees this as the shell API. In reality every call is silently
// re-executed on MFE-B's root proxy — making the relay transparent.
const createRelayRoot = (targetDeferred: Promise<unknown>): unknown => {
  const wrap = handle(async (command: ICommandList) => {
    const target = await targetDeferred;
    return replayChain(command, target);
  });
  return wrap({});
};

// A bidirectional relay channel between two MFEs.
// Each MFE's exported API is forwarded to the other side so calls from
// MFE-A arrive at MFE-B (and vice versa) without the shell manually
// bridging individual methods.
export class MFEInterfaceChannel {
  constructor(
    readonly connectionA: Connection,
    readonly connectionB: Connection,
  ) {}

  stop(): void {
    this.connectionA.stop();
    this.connectionB.stop();
  }

  // Connects two MFEs and wires their APIs as relay targets for each other.
  //
  // Any `root` in configA or configB is overridden by the relay root.
  // Connect each MFE separately with `connectMFEInterface` if the shell also
  // needs to expose its own API alongside the relay.
  static async create(
    configA: MFEInterfaceConfig,
    configB: MFEInterfaceConfig,
  ): Promise<MFEInterfaceChannel> {
    let resolveTargetForA!: (root: unknown) => void;
    let resolveTargetForB!: (root: unknown) => void;

    // Each relay root waits on this deferred before forwarding any call.
    // Resolved immediately after both handshakes complete.
    const targetForA = new Promise<unknown>((r) => (resolveTargetForA = r));
    const targetForB = new Promise<unknown>((r) => (resolveTargetForB = r));

    const [connA, connB] = await Promise.all([
      connectMFEInterface({ ...configA, root: createRelayRoot(targetForB) }),
      connectMFEInterface({ ...configB, root: createRelayRoot(targetForA) }),
    ]);

    // Wire up: relay for MFE-A forwards to MFE-B's root, and vice versa.
    resolveTargetForA(connA.root);
    resolveTargetForB(connB.root);

    return new MFEInterfaceChannel(connA, connB);
  }
}
