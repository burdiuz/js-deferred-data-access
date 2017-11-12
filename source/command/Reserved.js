/**
 * Reserved words
 */
export default Object.freeze({
  /**
   * Contains property names that cannot be used for Descriptor's
   */
  names: Object.freeze({
    // INFO Exposed Promise method, cannot be overwritten by type
    then: true,
    // INFO Exposed Promise method, cannot be overwritten by type
    catch: true,
  }),
});
