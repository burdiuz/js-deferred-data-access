export default ((hasOwnProperty) =>
  (target, property) =>
    hasOwnProperty.call(target, property))(Object.prototype.hasOwnProperty);
