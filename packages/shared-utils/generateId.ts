export const createIdGenerator = (prefix:string) => {
    const str = `${prefix}/${Date.now()}/`;
    let index = 0;

    return () => `${str}${++index}`;
  }
}

export default createIdGenerator('ID');
