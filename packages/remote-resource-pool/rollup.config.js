import config from '../../rollup.helpers';

export const LIBRARY_FILE_NAME = 'remote-resource-pool'; // dummy, replace with project name
export const LIBRARY_VAR_NAME = 'RemoteResourcePool'; // dummy, replace with project name

console.log(config(LIBRARY_FILE_NAME, LIBRARY_VAR_NAME));

export default config(LIBRARY_FILE_NAME, LIBRARY_VAR_NAME);
