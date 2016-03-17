function __createRequestTargetData() {
  var target = {};
  target[TARGET_DATA] = {id: '1111', type: 'target-object', poolId: '22222'};
  return target;
}
function __createDataResolvedPromise() {
  return Promise.resolve(__createRequestTargetData());
}
function __createRequestTarget(promise) {
  return RequestTarget.create(promise !== undefined ? promise : __createDataResolvedPromise(), {});
}
function __createRequestTargetProxy(promise) {
  return RequestProxyFactory.applyProxy(RequestTarget.create(promise !== undefined ? promise : __createDataResolvedPromise(), {}));
}
function __createTargetResource() {
  return TargetResource.create({id: '111111'}, {}, 'target-type', '2222222');
}
