import generateId from './utils/generateId';
import Resource from './Resource';

export default (pool, value, resourceType, id = null) => (
  new Resource(pool, value, resourceType, id || generateId())
);
