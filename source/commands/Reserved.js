/**
 * Reserved words
 * @namespace {Object} DataAccessInterface.Reserved
 */
const Reserved = Object.freeze({
  /**
   * Contains property names that cannot be used for CommandDescriptor's
   * @member {DataAccessInterface.Reserved~names} DataAccessInterface.Reserved.names
   * @see DataAccessInterface.CommandDescriptor#name
   */
  names: Object.freeze({
    //INFO Exposed Promise method, cannot be overwritten by type
    then: true,
    //INFO Exposed Promise method, cannot be overwritten by type
    catch: true
  }),
});

export default Reserved;
