import { hasOwn } from '@actualwave/has-own';
import { handle } from '@actualwave/deferred-data-access';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy/index.js';
import fetch from 'node-fetch';

const CRUD_METHODS = {
  create: 'POST',
  read: 'GET',
  patch: 'PATCH',
  update: 'PUT',
  delete: 'DELETE',
};

const httpMethodByType = (type) => {
  switch (type) {
    case ProxyCommand.GET:
      return 'GET';
    case ProxyCommand.SET:
      return 'PUT';
    case ProxyCommand.DELETE_PROPERTY:
      return 'DELETE';
    case ProxyCommand.APPLY:
    case ProxyCommand.METHOD_CALL:
      return 'POST';
  }
};

const httpMethodByName = (name) => CRUD_METHODS[name];

const getBodyByType = ({ type, value }) => {
  switch (type) {
    case ProxyCommand.SET:
      return value;
    case ProxyCommand.APPLY:
    case ProxyCommand.METHOD_CALL:
      return value[0];
    default:
      return undefined;
  }
};

const prepareBody = (body) => {
  if (!body) {
    return body;
  }

  const proto = Object.getPrototypeOf(body);

  if (
    proto === Object.prototype ||
    proto === Array.prototype ||
    typeof body.toJSON === 'function'
  ) {
    return JSON.stringify(body);
  }

  return body;
};

const isCRUDMethod = (name) => hasOwn(CRUD_METHODS, name);

const getURLFromChain = async (chain) => {
  let last = chain;

  const url = chain.reduce((part, item) => {
    last = item;

    return `/${item.name}${part}`;
  }, '');

  const base = await last.context;

  return `${base || ''}${url}`;
};

const generateRequest = async (command) => {
  const { type, name, value } = command;

  const base = await command.reduce((_, chain) => chain, null).context;

  if (type !== ProxyCommand.METHOD_CALL && !isCRUDMethod(name)) {
    const url = await getURLFromChain(command);
    const body = getBodyByType(command);

    return {
      url,
      method: httpMethodByType(type),
      body: prepareBody(body),
    };
  }

  const [queryParams, body, config] = value;
  const url = await getURLFromChain(command.prev);
  const query = queryParams ? new URLSearchParams(queryParams).toString() : '';

  return {
    url: query ? `${url}&${query}` : url,
    method: httpMethodByName(name),
    body: prepareBody(body),
    ...config,
  };
};

export const createRESTObject = (baseUrl, requestFn = (r) => r) => {
  const wrap = handle(async (command) => {
    const request = requestFn(await generateRequest(command));
    const response = await fetch(request.url, request);
    const contentType = response.headers.get('Content-Type');
    let body = response.body;

    if (/^\w+\/json(?:[^a-z]|$)/i.test(contentType)) {
      body = await response.json();
    } else if (/^text\//i.test(contentType)) {
      body = await response.text();
    } else if (contentType.indexOf('multipart/form-data') === 0) {
      body = await response.formData();
    }

    return {
      body,
      contentType,
      response,
    };
  });

  return wrap(baseUrl);
};
