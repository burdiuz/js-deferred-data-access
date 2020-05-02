import requiredProxyCommands from './requiredProxyCommands';
import ProxyPropertyNames from './ProxyPropertyNames';

export default (handlers, throwError = false) => {
  let result = true;
  requiredProxyCommands().forEach((name) => {
    if (!(ProxyPropertyNames[name] in handlers)) {
      result = false;
      if (throwError) {
        throw new Error(`For Proxy interface, handler "${name}" should be set.`);
      }
    }
  });

  return result;
};
