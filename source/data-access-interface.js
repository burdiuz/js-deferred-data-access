/**
 * Created by Oleg Galaburda on 25.02.16.
 */
//=include interface/utils.js
//=include interface/core.js
//=include interface/target-pool.js
//=include interface/base-interface.js
if (typeof(Proxy) === 'function') {
  //=include interface/proxy.js
} else {
  //=include interface/worker-interface.js
}
//=include interface/shared-api.js

var DataAccessInterface = (function() {

  function DataAccessInterface() {
    Object.defineProperties(this, {
      pool: {
        value: DataAccessInterface_poolFactory()
      }
    });
  }

  function DataAccessInterface_poolFactory() {
    return new TargetPool();
  }

  DataAccessInterface.poolFactory = DataAccessInterface_poolFactory;

  Object.defineProperties(DataAccessInterface, {
    instance: {
      value: new DataAccessInterface()
    }
  });

  return DataAccessInterface;
})();

