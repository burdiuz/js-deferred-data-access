import descriptorGeneratorFactory from '../descriptor/descriptorGeneratorFactory';
import ProxyCommandNames from './ProxyCommandNames';
import ProxyPropertyNames from './ProxyPropertyNames';

class ProxyCommandsClass {
  constructor() {
    Object.freeze(this);
  }

  createGETDescriptor = descriptorGeneratorFactory(
    ProxyCommandNames.GET,
    ProxyPropertyNames.get,
  );
  createSETDescriptor = descriptorGeneratorFactory(
    ProxyCommandNames.SET,
    ProxyPropertyNames.set,
  );
  createAPPLYDescriptor = descriptorGeneratorFactory(
    ProxyCommandNames.APPLY,
    ProxyPropertyNames.apply,
  );
}

const ProxyCommands = new ProxyCommandsClass();

export default ProxyCommands;
