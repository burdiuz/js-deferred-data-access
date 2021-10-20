const {handle} = require('@actualwave/deferred-data-access');

const wrap = handle(async (...args) => {
  console.log(args);
});

const api = wrap();

console.log(api);
api.some.thing.anyhow.then((value) => {
  console.log('VALUE: ', value);
});