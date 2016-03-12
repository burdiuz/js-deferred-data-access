var DataAccessInterface = (function() {

  function _DataAccessInterface() {
    Object.defineProperties(this, {
      poolRegistry: {
        value: TargetPoolRegistry
      },
      pool: {
        value: TargetPoolRegistry.createPool()
      },
      resourceConverter: {
        value: ResourceConverter
      },
      IConvertible: {
        value: IConvertible
      }
    });
  }

  function _parse(data) {
    return this.resourceConverter.parse(data);
  }

  function _toJSON(data) {
    return this.resourceConverter.toJSON(data);
  }

  _DataAccessInterface.prototype.parse = _parse;
  _DataAccessInterface.prototype.toJSON = _toJSON;

  return new _DataAccessInterface();
})();

