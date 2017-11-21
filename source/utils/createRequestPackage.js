export default (type, args, targetId) => {
  const result = {
    type,
    args,
    cmd: args[0], // cmd,
    value: args[1], // value,
    target: targetId,
  };

  return result;
};
