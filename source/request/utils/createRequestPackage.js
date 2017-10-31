const createRequestPackage = (type, args, targetId) => {
  const result = {
    type,
    cmd: args[0], // cmd,
    value: args[1], // value,
    target: targetId,
  };

  // FIXME why?
  Object.defineProperty(result, 'args', {
    value: args,
  });

  return result;
};

export default createRequestPackage;
