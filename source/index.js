import DataAccessInterface, {
  create,
  dummy,
} from './DataAccessInterface';
import {
  createDeferred,
  Deferred,
} from './utils';
import {
  CommandDescriptor,
  Reserved,
  RequestTargetCommands,
  ProxyCommands,
} from './commands';
import { RequestTarget } from './request';
import {
  ResourcePool,
  ResourcePoolRegistry,
  ResourceConverter,
} from './resource';
import {
  IConvertible,
  isResourceConvertible,
  getRawResource,
  getResourceData,
  getResourceId,
  getResourcePoolId,
  getResourceType,
  isResource,
} from './resource/utils';

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
