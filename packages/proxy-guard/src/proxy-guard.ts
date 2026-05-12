import { handle } from '@actualwave/deferred-data-access';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';
import type { ICommandList } from '@actualwave/deferred-data-access/utils';

const PATH_KEY: unique symbol = Symbol('guardPath');

type TaggedContext = {
  [PATH_KEY]: string[];
  value: unknown;
  parent: unknown;
};

const isTagged = (v: unknown): v is TaggedContext =>
  v != null && typeof v === 'object' && PATH_KEY in (v as object);

const isPromiseLike = (v: unknown): v is Promise<unknown> =>
  v != null && typeof (v as any).then === 'function';

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermissionError';
  }
}

export interface GuardCommand {
  type: string;
  path: string;
  name: string;
  args?: unknown[];
  value?: unknown;
}

export type AllowFn<Ctx> = (cmd: GuardCommand, ctx: Ctx) => boolean | Promise<boolean>;
export type DenyFn<Ctx> = (cmd: GuardCommand, ctx: Ctx) => Error | Promise<Error | undefined>;
export type TransformFn<Ctx> = (cmd: GuardCommand, ctx: Ctx) => GuardCommand | Promise<GuardCommand>;
export type HookFn<Ctx> = (cmd: GuardCommand, ctx: Ctx, result?: unknown) => unknown;

export interface RuleMatcher {
  type?: string | string[];
  name?: string | RegExp | string[];
  path?: string | RegExp;
}

export interface Rule<Ctx> {
  match?: RuleMatcher;
  allow?: boolean | AllowFn<Ctx>;
  deny?: boolean | DenyFn<Ctx>;
  transform?: TransformFn<Ctx>;
  before?: HookFn<Ctx>;
  after?: HookFn<Ctx>;
  continue?: boolean;
}

export interface GuardOptions<T, Ctx> {
  context?: () => Ctx | Promise<Ctx>;
  rules: Rule<Ctx>[];
  defaultPolicy?: 'allow' | 'deny';
}

// ---------------------------------------------------------------------------
// Rule matching helpers
// ---------------------------------------------------------------------------

const normalizeType = (t: string) =>
  t === ProxyCommand.METHOD_CALL ? ProxyCommand.APPLY : t;

const matchesType = (ruleType: RuleMatcher['type'], cmdType: string): boolean => {
  if (ruleType === undefined) return true;
  const types = (Array.isArray(ruleType) ? ruleType : [ruleType]).map(normalizeType);
  return types.includes(normalizeType(cmdType));
};

const matchesName = (ruleName: RuleMatcher['name'], cmdName: string): boolean => {
  if (ruleName === undefined) return true;
  if (Array.isArray(ruleName)) return ruleName.includes(cmdName);
  if (ruleName instanceof RegExp) return ruleName.test(cmdName);
  return ruleName === cmdName;
};

const matchesPath = (rulePath: RuleMatcher['path'], cmdPath: string): boolean => {
  if (rulePath === undefined) return true;
  if (rulePath instanceof RegExp) return rulePath.test(cmdPath);
  return rulePath === cmdPath;
};

const ruleMatches = (rule: Rule<unknown>, cmd: GuardCommand): boolean => {
  if (!rule.match) return true;
  return (
    matchesType(rule.match.type, cmd.type) &&
    matchesName(rule.match.name, cmd.name) &&
    matchesPath(rule.match.path, cmd.path)
  );
};

// ---------------------------------------------------------------------------
// createGuardedProxy
// ---------------------------------------------------------------------------

export const createGuardedProxy = <T extends object, Ctx = unknown>(
  target: T,
  { context: contextFactory, rules, defaultPolicy = 'allow' }: GuardOptions<T, Ctx>,
): T => {
  const guardHandler = async (command: ICommandList, contextPromise: unknown, wrapFn: unknown) => {
    // Avoid unnecessary await: root-level commands arrive with the target object
    // as context (not a Promise). Chained commands arrive with Promise<TaggedContext>.
    const rawCtx = isPromiseLike(contextPromise) ? await contextPromise : contextPromise;

    const prevPath: string[] = isTagged(rawCtx) ? rawCtx[PATH_KEY] : [];
    const prevValue: unknown = isTagged(rawCtx) ? rawCtx.value : (rawCtx ?? target);
    const prevParent: unknown = isTagged(rawCtx) ? rawCtx.parent : undefined;

    // APPLY has no name field; derive the function name from the preceding GET path.
    let name: string;
    let currentPath: string[];
    if (command.type === ProxyCommand.APPLY && !command.name) {
      name = prevPath[prevPath.length - 1] ?? '';
      currentPath = prevPath;
    } else {
      name = command.name != null ? String(command.name) : '';
      currentPath = name ? [...prevPath, name] : prevPath;
    }
    const pathStr = currentPath.join('.');

    const cmd: GuardCommand = {
      type: command.type,
      path: pathStr,
      name,
      args: command.type === ProxyCommand.APPLY ? ((command.value as unknown[]) ?? []) : undefined,
      value: command.type === ProxyCommand.SET ? command.value : undefined,
    };

    // Only await the context factory result if it's actually a Promise.
    const ctxRaw = contextFactory ? contextFactory() : undefined;
    const userCtx: Ctx = isPromiseLike(ctxRaw) ? await ctxRaw : (ctxRaw as Ctx);

    let effectiveCmd = cmd;
    let allowed = defaultPolicy === 'allow';
    let denyError: Error | undefined;
    const matchedRules: Rule<Ctx>[] = [];

    for (const rule of rules as Rule<Ctx>[]) {
      if (!ruleMatches(rule as Rule<unknown>, effectiveCmd)) continue;
      matchedRules.push(rule);

      if (rule.before) {
        const r = rule.before(effectiveCmd, userCtx);
        if (isPromiseLike(r)) await r;
      }
      if (rule.transform) {
        const r = rule.transform(effectiveCmd, userCtx);
        effectiveCmd = isPromiseLike(r) ? await r : r;
      }

      if (rule.deny !== undefined) {
        const errRaw = typeof rule.deny === 'function'
          ? rule.deny(effectiveCmd, userCtx)
          : rule.deny ? new PermissionError(`Access denied: ${pathStr}`) : undefined;
        const errOrFalse = isPromiseLike(errRaw) ? await errRaw : errRaw;
        if (errOrFalse) {
          denyError = errOrFalse instanceof Error ? errOrFalse : new PermissionError(String(errOrFalse));
          allowed = false;
          if (!rule.continue) break;
          continue;
        }
      }

      if (rule.allow !== undefined) {
        const okRaw = typeof rule.allow === 'function'
          ? rule.allow(effectiveCmd, userCtx)
          : rule.allow;
        const ok = isPromiseLike(okRaw) ? await okRaw : okRaw;
        allowed = ok;
        if (!ok && !denyError) {
          denyError = new PermissionError(`Access denied: ${pathStr}`);
        }
      } else {
        allowed = true;
      }

      if (!rule.continue) break;
    }

    if (!allowed) throw denyError ?? new PermissionError(`Access denied: ${pathStr}`);

    let result: unknown;
    switch (command.type) {
      case ProxyCommand.GET:
        result = (prevValue as any)[effectiveCmd.name];
        break;
      case ProxyCommand.APPLY: {
        const callRaw = (prevValue as Function).apply(prevParent, effectiveCmd.args ?? []);
        result = isPromiseLike(callRaw) ? await callRaw : callRaw;
        break;
      }
      case ProxyCommand.SET:
        (prevValue as any)[effectiveCmd.name] = effectiveCmd.value;
        result = effectiveCmd.value;
        break;
      case ProxyCommand.DELETE_PROPERTY:
        delete (prevValue as any)[effectiveCmd.name];
        result = true;
        break;
    }

    for (const rule of matchedRules) {
      if (rule.after) {
        const r = rule.after(effectiveCmd, userCtx, result);
        if (isPromiseLike(r)) await r;
      }
      if (!rule.continue) break;
    }

    if (result != null && (typeof result === 'object' || typeof result === 'function')) {
      const tagged: TaggedContext = {
        [PATH_KEY]: currentPath,
        value: result,
        parent: prevValue,
      };
      return (wrapFn as Function)(Promise.resolve(tagged), command);
    }

    return result;
  };

  const wrap = handle(guardHandler as any, false);
  return wrap(target) as T;
};
