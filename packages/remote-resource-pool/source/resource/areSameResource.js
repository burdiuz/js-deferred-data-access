import isResource from './isResource';
import getResourceId from './getResourceId';
import getResourcePoolId from './getResourcePoolId';

export default (resource1, resource2) => (
  isResource(resource1)
  && isResource(resource2)
  && (
    resource1 === resource2
    || (
      getResourceId(resource1) === getResourceId(resource2)
      && getResourcePoolId(resource1) === getResourcePoolId(resource2)
    )
  )
);
