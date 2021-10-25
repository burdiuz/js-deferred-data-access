export type FetchFn = (
  url: string,
  params?: { [key: string]: unknown }
) => Promise<Response>;

let fetchFn: FetchFn =
  typeof fetch === 'function'
    ? fetch
    : () => {
        throw new Error('fetch() global function is not available.');
      };

export const getFetchFn = () => fetchFn;

export const setFetchFn = (fn: FetchFn) => {
  fetchFn = fn;
};

export const callFetchFn = (url: string, params?: { [key: string]: unknown }) =>
  fetchFn(url, params);
