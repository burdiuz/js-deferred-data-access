///<reference path="../../../typings/@actualwave/deferred-data-access/utils/index.d.ts" />
///<reference path="../../../typings/@actualwave/deferred-data-access/proxy/index.d.ts" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import { hasOwn } from '@actualwave/has-own';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';
import {
  ICommand,
  ICommandChain,
  ICommandList,
  PropertyName,
} from '@actualwave/deferred-data-access/utils';

const CONTENT_TYPE = 'Content-Type';
const JSON_TYPE = 'application/json';

const CRUD_METHODS: { [key: string]: string } = {
  create: 'POST',
  read: 'GET',
  patch: 'PATCH',
  update: 'PUT',
  delete: 'DELETE',
};

const httpMethodByType = (type: string): string => {
  switch (type) {
    case ProxyCommand.SET:
      return 'PUT';
    case ProxyCommand.DELETE_PROPERTY:
      return 'DELETE';
    case ProxyCommand.APPLY:
    case ProxyCommand.METHOD_CALL:
      return 'POST';
    default:
      return 'GET';
  }
};

const httpMethodByName = (name: string): string => CRUD_METHODS[name];

const getBodyByType = ({ type, value }: ICommand): unknown => {
  switch (type) {
    case ProxyCommand.SET:
      return value;
    case ProxyCommand.APPLY:
    case ProxyCommand.METHOD_CALL:
      return (value as unknown[])[0];
    default:
      return undefined;
  }
};

const defineContentTypeHeader = (request: Request): Request => {
  let { headers } = request;

  if (!headers) {
    headers = {};
  }

  const headersImpl = headers as {
    set: (name: string, value: string) => void;
    get: (name: string) => string | undefined;
  };

  if (typeof headersImpl.set === 'function') {
    if (!headersImpl.get(CONTENT_TYPE)) {
      headersImpl.set(CONTENT_TYPE, JSON_TYPE);
    }

    return request;
  }

  const headersObj = headers as { [key: string]: string };

  if (!headersObj[CONTENT_TYPE]) {
    request = {
      ...request,
      headers: {
        ...headersObj,
        [CONTENT_TYPE]: JSON_TYPE,
      },
    };
  }

  return request;
};

const prepareBody = (body: any, request: Request): Request => {
  if (!body) {
    return request;
  }

  const proto = Object.getPrototypeOf(body);

  if (
    proto === Object.prototype ||
    proto === Array.prototype ||
    typeof body.toJSON === 'function'
  ) {
    return defineContentTypeHeader({
      ...request,
      body: JSON.stringify(body),
    });
  }

  return body;
};

const isCRUDMethod = (name: PropertyName): boolean =>
  hasOwn(CRUD_METHODS, name);

const getURLFromChain = async (chain: ICommandList): Promise<string> => {
  let last: ICommandChain = chain;

  const url = chain.reduce((part: string, item: ICommandChain) => {
    last = item;

    return `/${String(item.name)}${part}`;
  }, '');

  const base = await last.context;

  return `${base || ''}${url}`;
};

export type Request = {
  url: string;
  method: string;
  body?: unknown;
  headers?: unknown;
};

export const generateRequest = async (
  command: ICommandList
): Promise<Request> => {
  const { type, name, value } = command;

  if (
    type !== ProxyCommand.METHOD_CALL ||
    !isCRUDMethod(name as PropertyName)
  ) {
    const url = await getURLFromChain(command);
    const body = getBodyByType(command);

    return prepareBody(body, {
      url,
      method: httpMethodByType(type),
    });
  }

  const [queryParams, body, config] = value as any[];
  const url = await getURLFromChain(command.prev as ICommandList);
  const query = queryParams ? new URLSearchParams(queryParams).toString() : '';

  return {
    ...prepareBody(body, {
      url: query ? `${url}&${query}` : url,
      method: httpMethodByName(String(name)),
    }),
    ...config,
  };
};
