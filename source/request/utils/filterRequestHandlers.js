'use strict';

import { Reserved, CommandDescriptor } from '../../commands';

/**
 * Checks for CommandDescriptor uniqueness and reserved words usage.
 * @param {DataAccessInterface.CommandDescriptor} descriptor
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 * @private
 */
const applyDescriptor = (descriptor, descriptors, properties) => {
  const name = descriptor.name;
  if (name in Reserved.names) {
    throw new Error('Name "' + name + '" is reserved and cannot be used in descriptor.');
  }
  if (descriptors.hasOwnProperty(name) && descriptors[name] instanceof CommandDescriptor) {
    throw new Error('Field names should be unique, "' + String(name) + '" field has duplicates.');
  }
  descriptors[name] = descriptor;
  if (!descriptor.virtual) {
    properties.push(descriptor);
  }
};

/**
 * @param {Array} handlers
 * @param {Object} descriptors
 * @private
 */
const filterArray = (handlers, descriptors, properties) => {
  const length = handlers.length;
  for (let index = 0; index < length; index++) {
    const value = handlers[index];
    if (value instanceof CommandDescriptor) {
      applyDescriptor(value, descriptors, properties);
    }
  }
};

/**
 * @param {Object} handlers
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 * @private
 */
const filterHash = (handlers, descriptors, properties) => {
  if (!handlers) return;
  const keys = Object.getOwnPropertyNames(handlers).concat(Object.getOwnPropertySymbols(handlers));
  const length = keys.length;
  for (let index = 0; index < length; index++) {
    const name = keys[index];
    let value = handlers[name];
    if (typeof(value) === 'function') {
      value = CommandDescriptor.create(name, value);
    }
    if (value instanceof CommandDescriptor) {
      applyDescriptor(value, descriptors, properties);
    }
  }
};

/**
 * @method RequestHandlers.filterHandlers
 * @param {Array|Object} handlers
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 */
const filterRequestHandlers = (handlers, descriptors, properties) => {
  if (handlers instanceof Array) {
    filterArray(handlers, descriptors, properties);
  } else {
    filterHash(handlers, descriptors, properties);
  }
};

export default filterRequestHandlers;
