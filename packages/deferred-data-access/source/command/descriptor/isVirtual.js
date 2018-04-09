// since descriptor may be any object and Descriptor class is VO,
// I have to move "methods" out of the class into separate package
// also this conforms with current library style(Request uses similar architecture)
export default (descriptor) => (
  descriptor.propertyName === undefined
  || descriptor.propertyName === null
);
