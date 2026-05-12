'use strict';

(function (express) {
  this.use(express.static('.'));
  this.listen(8084, () => {
    console.log('idb-proxy example running at http://localhost:8084');
  });
}).apply(require('express')(), [require('express')]);
