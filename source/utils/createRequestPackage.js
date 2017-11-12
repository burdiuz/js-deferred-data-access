export default (type, args, targetId) => {
  const result = {
    type,
    cmd: args[0], // cmd,
    value: args[1], // value,
    target: targetId,
  };

  // FIXME why? probably to make it not enumerable?.. fuck, dunno
  Object.defineProperty(result, 'args', {
    value: args,
  });

  return result;
};
