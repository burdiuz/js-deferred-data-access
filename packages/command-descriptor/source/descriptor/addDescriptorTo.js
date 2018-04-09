export default (descriptor, target) => {
  if (target instanceof Array) {
    target.push(descriptor);
  } else if (target) {
    target[descriptor.propertyName] = descriptor;
  }
};
