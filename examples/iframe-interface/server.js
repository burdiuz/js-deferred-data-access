'use strict';

(function (express) {
  this.use(express.static('.'));
  this.listen(8083, () => {
    console.log('iframe-interface example running at http://localhost:8083');
  });
}).apply(require('express')(), [require('express')]);
