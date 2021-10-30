import { handle } from '@actualwave/deferred-data-access';
import { latestCallFor, recordHandlerCalls } from '@actualwave/deferred-data-access/record';
import { generateRequest, Request } from './request';
import { callFetchFn } from './fetch';
import {
  ICommandList,
  CommandContext,
} from '@actualwave/deferred-data-access/utils';
import { RESTObject } from './types';
import { ProxyCommand } from '@actualwave/deferred-data-access/proxy';

const LATEST_METHOD = 'forLatest';

const getResponse = async (
  response: Response,
  contentType: string
): Promise<unknown> => {
  if (/^\w+\/json(?:[^a-z]|$)/i.test(contentType)) {
    return response.json();
  } else if (/^text\//i.test(contentType)) {
    return response.text();
  } else if (contentType.indexOf('multipart/form-data') === 0) {
    return response.formData();
  }

  return response.body;
};

export const createRESTObject = (
  baseUrl: string,
  requestFn: (r: Request) => Request = (r) => r
) => {
  const wrap = handle(
    recordHandlerCalls(
      async (command: ICommandList, context?: CommandContext) => {
        if (
          context &&
          command.type === ProxyCommand.METHOD_CALL &&
          command.name === LATEST_METHOD
        ) {
          return latestCallFor(context);
        }

        const request: Request = requestFn(await generateRequest(command));
        const response: Response = await callFetchFn(request.url, request);
        const contentType: string = response.headers.get('Content-Type') || '';

        const body = await getResponse(response, contentType);

        return {
          body,
          contentType,
          response,
        };
      }
    )
  );

  return wrap(baseUrl) as RESTObject;
};
