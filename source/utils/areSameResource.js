export default (resource1, resource2) => (
  isResource(resource1)
  && isResource(resource2)
  && getResourceId(resource1) === getResourceId(resource2)
  && getResourcePoolId(resource1) === getResourcePoolId(resource2)
);
