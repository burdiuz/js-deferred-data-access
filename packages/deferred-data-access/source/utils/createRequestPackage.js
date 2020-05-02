/**
 * All arguments are required
 * @param command Command name, Descriptor's name
 * @param propertyName Property name, this is the name of the handler called against target object
 * @param args Arguments passed to handler
 * @param target JSON object representing resource or target, its raw value
 * @returns {{command: *, args: *, target: *}}
 */
export default (propertyName, command, args, target) => ({
  propertyName,
  command,
  args,
  target,
});
