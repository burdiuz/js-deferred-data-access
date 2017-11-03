import CommandDescriptor, { createCommandDescriptor } from '../commands/CommandDescriptor';
import Reserved from '../commands/Reserved';


/**
 * Checks for CommandDescriptor uniqueness and reserved words usage.
 * @param {DataAccessInterface.CommandDescriptor} descriptor
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 * @private
 */
const applyDescriptor = (descriptor, descriptors, properties) => {
  const { name } = descriptor;
  if (name in Reserved.names) {
    throw new Error(`Name "${name}" is reserved and cannot be used in descriptor.`);
  }
  if (
    Object.prototype.hasOwnProperty.call(descriptors, name)
    && descriptors[name] instanceof CommandDescriptor
  ) {
    throw new Error(`Field names should be unique, "${String(name)}" field has duplicates.`);
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
  handlers.forEach((value) => {
    if (value instanceof CommandDescriptor) {
      applyDescriptor(value, descriptors, properties);
    }
  });
};

/**
 * @param {Object} handlers
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 * @private
 */
const filterHash = (handlers, descriptors, properties) => {
  if (!handlers) return;
  ([
    ...Object.getOwnPropertyNames(handlers),
    ...Object.getOwnPropertySymbols(handlers),
  ]).forEach((name) => {
    let value = handlers[name];
    if (typeof value === 'function') {
      value = createCommandDescriptor(name, value);
    }
    if (value instanceof CommandDescriptor) {
      applyDescriptor(value, descriptors, properties);
    }
  });
};

/**
 * @method RequestHandlers.filterHandlers
 * @param {Array|Object} handlers
 * @param {Object.<string, DataAccessInterface.CommandDescriptor>} descriptors
 * @param {Array.<number, DataAccessInterface.CommandDescriptor>} properties
 */
export default (handlers, descriptors, properties) => {
  if (handlers instanceof Array) {
    filterArray(handlers, descriptors, properties);
  } else {
    filterHash(handlers, descriptors, properties);
  }
};
