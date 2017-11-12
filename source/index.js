import DataAccessInterface, { create, dummy } from './DataAccessInterface';
import Deferred, { createDeferred } from './utils/Deferred';
import Descriptor from './command/Descriptor';
import Reserved from './command/Reserved';
import RequestCommands from './command/internal/RequestCommands';
import ProxyCommands from './command/internal/ProxyCommands';
import Target from './request/Target';
import ResourcePool from './resource/ResourcePool';
import PoolRegistry from './resource/PoolRegistry';
import Converter from './resource/Converter';
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
  Descriptor,
  Reserved,
  RequestCommands,
  ProxyCommands,
  Target,
  ResourcePool,
  PoolRegistry,
  Converter,
  IConvertible,
  isResourceConvertible,
  getRawResource,
  getResourceData,
  getResourceId,
  getResourcePoolId,
  getResourceType,
  isResource,
};
