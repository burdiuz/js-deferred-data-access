import { handle } from '@actualwave/deferred-data-access';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';
import type { IdbProxyOptions, IdbProxy } from './types';

const READWRITE_OPS = new Set(['put', 'add', 'delete', 'clear']);
const STORE_ONLY_OPS = new Set(['put', 'add', 'delete', 'clear']);

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      const err = new Error(request.error?.message ?? 'IDB request failed');
      (err as Error & { cause: unknown }).cause = request.error;
      reject(err);
    };
  });
}

function openDatabase(name: string, options: IdbProxyOptions): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, options.version);

    if (options.upgrade) {
      const upgradeCallback = options.upgrade;
      request.onupgradeneeded = (event) => {
        upgradeCallback(request.result, event.oldVersion, event.newVersion);
      };
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      const err = new Error(`Failed to open IndexedDB "${name}"`);
      (err as Error & { cause: unknown }).cause = request.error;
      reject(err);
    };
  });
}

function idbIterate(
  target: IDBObjectStore | IDBIndex,
  query: IDBValidKey | IDBKeyRange | null | undefined,
  callback: (value: unknown) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const request = target.openCursor(query ?? null);
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        callback(cursor.value);
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => {
      const err = new Error(request.error?.message ?? 'IDB cursor error');
      (err as Error & { cause: unknown }).cause = request.error;
      reject(err);
    };
  });
}

export function createIdbProxy(dbName: string, options: IdbProxyOptions = {}): IdbProxy {
  let dbPromise: Promise<IDBDatabase> | null = null;

  const getDb = (): Promise<IDBDatabase> => {
    if (!dbPromise) dbPromise = openDatabase(dbName, options);
    return dbPromise;
  };

  const wrap = handle(async (command) => {
    const nodes = command.map((node) => node);
    const tail = nodes[nodes.length - 1];
    const head = nodes[0];

    if (head.type !== ProxyCommand.METHOD_CALL) {
      throw new Error(
        `idb-proxy: expected a method call (e.g. db.store.get()), got: ${head.type}`,
      );
    }

    if (tail.type !== ProxyCommand.GET) {
      throw new Error(
        `idb-proxy: expected a store name access (e.g. db.users), got: ${tail.type}`,
      );
    }

    const storeName = String(tail.name);
    const opName = String(head.name);
    const opArgs = (head.value as unknown[]) ?? [];

    let isIndex = false;
    let indexName: string | undefined;

    if (nodes.length >= 3) {
      const middle = nodes[1];
      if (middle.type !== ProxyCommand.METHOD_CALL || middle.name !== 'index') {
        throw new Error(
          `idb-proxy: unexpected chain segment: ${middle.type}(${String(middle.name)})`,
        );
      }
      indexName = String(((middle.value as unknown[]) ?? [])[0]);
      isIndex = true;
    }

    if (isIndex && STORE_ONLY_OPS.has(opName)) {
      throw new Error(`idb-proxy: cannot perform "${opName}" on an index`);
    }

    const mode = READWRITE_OPS.has(opName) ? 'readwrite' : 'readonly';
    const db = await getDb();
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const target: IDBObjectStore | IDBIndex = isIndex ? store.index(indexName!) : store;

    switch (opName) {
      case 'get':
        return idbRequest(target.get(opArgs[0] as IDBValidKey | IDBKeyRange));
      case 'getAll':
        return idbRequest(
          target.getAll(
            opArgs[0] as IDBValidKey | IDBKeyRange | null | undefined,
            opArgs[1] as number | undefined,
          ),
        );
      case 'put':
        return idbRequest(
          (target as IDBObjectStore).put(opArgs[0], opArgs[1] as IDBValidKey | undefined),
        );
      case 'add':
        return idbRequest(
          (target as IDBObjectStore).add(opArgs[0], opArgs[1] as IDBValidKey | undefined),
        );
      case 'delete':
        return idbRequest(
          (target as IDBObjectStore).delete(opArgs[0] as IDBValidKey | IDBKeyRange),
        );
      case 'count':
        return idbRequest(
          target.count((opArgs[0] ?? undefined) as IDBValidKey | IDBKeyRange | undefined),
        );
      case 'clear':
        return idbRequest((target as IDBObjectStore).clear());
      case 'iterate':
        return idbIterate(
          target,
          opArgs[0] as IDBValidKey | IDBKeyRange | null | undefined,
          opArgs[1] as (value: unknown) => void,
        );
      default:
        throw new Error(`idb-proxy: unknown IDB operation: "${opName}"`);
    }
  });

  return wrap({}) as unknown as IdbProxy;
}
