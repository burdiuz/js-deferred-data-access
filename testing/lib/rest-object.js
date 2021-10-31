'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var hasOwn = require('@actualwave/has-own');
var proxy = require('@actualwave/deferred-data-access/proxy');
var deferredDataAccess = require('@actualwave/deferred-data-access');
var record = require('@actualwave/deferred-data-access/record');

let fetchFn = typeof fetch === 'function'
    ? fetch
    : () => {
        throw new Error('fetch() global function is not available.');
    };
const getFetchFn = () => fetchFn;
const setFetchFn = (fn) => {
    fetchFn = fn;
};
const callFetchFn = (url, params) => fetchFn(url, params);

/* eslint-disable @typescript-eslint/no-explicit-any */
const CONTENT_TYPE = 'Content-Type';
const JSON_TYPE = 'application/json';
const CRUD_METHODS = {
    create: 'POST',
    read: 'GET',
    patch: 'PATCH',
    update: 'PUT',
    delete: 'DELETE',
};
const httpMethodByType = (type) => {
    switch (type) {
        case proxy.ProxyCommand.SET:
            return 'PUT';
        case proxy.ProxyCommand.DELETE_PROPERTY:
            return 'DELETE';
        case proxy.ProxyCommand.APPLY:
        case proxy.ProxyCommand.METHOD_CALL:
            return 'POST';
        default:
            return 'GET';
    }
};
const httpMethodByName = (name) => CRUD_METHODS[name];
const getBodyByType = ({ type, value }) => {
    switch (type) {
        case proxy.ProxyCommand.SET:
            return value;
        case proxy.ProxyCommand.APPLY:
        case proxy.ProxyCommand.METHOD_CALL:
            return value[0];
        default:
            return undefined;
    }
};
const defineContentTypeHeader = (request) => {
    let { headers } = request;
    if (!headers) {
        headers = {};
    }
    const headersImpl = headers;
    if (typeof headersImpl.set === 'function') {
        if (!headersImpl.get(CONTENT_TYPE)) {
            headersImpl.set(CONTENT_TYPE, JSON_TYPE);
        }
        return request;
    }
    const headersObj = headers;
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
const prepareBody = (body, request) => {
    if (!body) {
        return request;
    }
    const proto = Object.getPrototypeOf(body);
    if (proto === Object.prototype ||
        proto === Array.prototype ||
        typeof body.toJSON === 'function') {
        return defineContentTypeHeader({
            ...request,
            body: JSON.stringify(body),
        });
    }
    return body;
};
const isCRUDMethod = (name) => hasOwn.hasOwn(CRUD_METHODS, name);
const getURLFromChain = async (chain) => {
    let last = chain;
    const url = chain.reduce((part, item) => {
        last = item;
        return `/${String(item.name)}${part}`;
    }, '');
    const base = await last.context;
    return `${base || ''}${url}`;
};
const generateRequest = async (command) => {
    const { type, name, value } = command;
    if (type !== proxy.ProxyCommand.METHOD_CALL ||
        !isCRUDMethod(name)) {
        const url = await getURLFromChain(command);
        const body = getBodyByType(command);
        return prepareBody(body, {
            url,
            method: httpMethodByType(type),
        });
    }
    const [queryParams, body, config] = value;
    const url = await getURLFromChain(command.prev);
    const query = queryParams ? new URLSearchParams(queryParams).toString() : '';
    return {
        ...prepareBody(body, {
            url: query ? `${url}&${query}` : url,
            method: httpMethodByName(String(name)),
        }),
        ...config,
    };
};

const LATEST_METHOD = 'forLatest';
const getResponse = async (response, contentType) => {
    if (/^\w+\/json(?:[^a-z]|$)/i.test(contentType)) {
        return response.json();
    }
    else if (/^text\//i.test(contentType)) {
        return response.text();
    }
    else if (contentType.indexOf('multipart/form-data') === 0) {
        return response.formData();
    }
    return response.body;
};
const createRESTObject = (baseUrl, requestFn = (r) => r) => {
    const wrap = deferredDataAccess.handle(record.recordHandlerCalls(async (command, context) => {
        if (context &&
            command.type === proxy.ProxyCommand.METHOD_CALL &&
            command.name === LATEST_METHOD) {
            return record.latestCallFor(context);
        }
        const request = requestFn(await generateRequest(command));
        const response = await callFetchFn(request.url, request);
        const contentType = response.headers.get('Content-Type') || '';
        const body = await getResponse(response, contentType);
        return {
            body,
            contentType,
            response,
        };
    }));
    return wrap(baseUrl);
};

exports.callFetchFn = callFetchFn;
exports.createRESTObject = createRESTObject;
exports.generateRequest = generateRequest;
exports.getFetchFn = getFetchFn;
exports.setFetchFn = setFetchFn;
//# sourceMappingURL=rest-object.js.map
