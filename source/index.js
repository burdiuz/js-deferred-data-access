import DataAccessInterface, { create, dummy } from './DataAccessInterface';
import Deferred, { createDeferred } from './utils/Deferred';
import CommandDescriptor from './commands/CommandDescriptor';
import Reserved from './commands/Reserved';
import RequestTargetCommands from './commands/RequestTargetCommands';
import ProxyCommands from './commands/ProxyCommands';
import RequestTarget from './request/RequestTarget';
import ResourcePool from './resource/ResourcePool';
import ResourcePoolRegistry from './resource/ResourcePoolRegistry';
import ResourceConverter from './resource/ResourceConverter';
import IConvertible from './utils/IConvertible';
import isResourceConvertible from './utils/isResourceConvertible';
import getRawResource from './utils/getRawResource';
import getResourceData from './utils/getResourceData';
import getResourceId from './utils/getResourceId';
import getResourcePoolId from './utils/getResourcePoolId';
import getResourceType from './utils/getResourceType';
import isResource from './utils/isResource';

export default DataAccessInterface;

export {
  create,
  dummy,
  createDeferred,
  Deferred,
  CommandDescriptor,
  Reserved,
  RequestTargetCommands,
  ProxyCommands,
  RequestTarget,
  ResourcePool,
  ResourcePoolRegistry,
  ResourceConverter,
  IConvertible,
  isResourceConvertible,
  getRawResource,
  getResourceData,
  getResourceId,
  getResourcePoolId,
  getResourceType,
  isResource,
};
