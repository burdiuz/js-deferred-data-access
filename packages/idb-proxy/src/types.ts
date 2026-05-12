export interface IdbProxyOptions {
  version?: number;
  upgrade?: (db: IDBDatabase, oldVersion: number, newVersion: number | null) => void;
}

export interface IdbStoreProxy {
  get(key: IDBValidKey | IDBKeyRange): Promise<unknown>;
  getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<unknown[]>;
  put(value: unknown, key?: IDBValidKey): Promise<IDBValidKey>;
  add(value: unknown, key?: IDBValidKey): Promise<IDBValidKey>;
  delete(key: IDBValidKey | IDBKeyRange): Promise<void>;
  count(query?: IDBValidKey | IDBKeyRange | null): Promise<number>;
  clear(): Promise<void>;
  iterate(
    query: IDBValidKey | IDBKeyRange | null | undefined,
    callback: (value: unknown) => void,
  ): Promise<void>;
  index(name: string): IdbIndexProxy;
}

export interface IdbIndexProxy {
  get(key: IDBValidKey | IDBKeyRange): Promise<unknown>;
  getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<unknown[]>;
  count(query?: IDBValidKey | IDBKeyRange | null): Promise<number>;
  iterate(
    query: IDBValidKey | IDBKeyRange | null | undefined,
    callback: (value: unknown) => void,
  ): Promise<void>;
}

export type IdbProxy = Record<string, IdbStoreProxy>;
