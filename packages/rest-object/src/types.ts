/* eslint-disable @typescript-eslint/no-explicit-any */
type RESTMethod = (
  queryParams?: { [key: string]: string | number | boolean },
  body?: BodyInit | { [key: string]: any } | any[],
  config?: RequestInit
) => Promise<unknown>;

interface RESTPathMethods extends Promise<unknown> {
  create: RESTMethod;
  read: RESTMethod;
  patch: RESTMethod;
  update: RESTMethod;
  delete: RESTMethod;
}

type RESTPath = RESTPathMethods & { [key: string]: RESTPath };

export interface RESTObject {
  [key: string]: RESTPath;
}