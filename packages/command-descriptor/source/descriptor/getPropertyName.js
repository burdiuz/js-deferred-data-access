export default (propertyName, command) => {
  if (propertyName === undefined) {
    return command;
  }

  if (propertyName === null || typeof propertyName === 'symbol') {
    return propertyName;
  }

  return String(propertyName);
};
