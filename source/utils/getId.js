const base = `DA/${Date.now()}/`;
let index = 0;
export default () => `${base}${++index}/${Date.now()}`;
