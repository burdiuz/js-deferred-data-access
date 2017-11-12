'use strict';

var http = require('http');
var server = http.createServer();
/*
var chat = require('./example/chat_server.js');
chat.server(server);
*/
// Express app for handling static files HTTP requests
var express = require('express');
var app = express();
app.use(function(req, res, next) {
  console.log(req.path);
  if (req.path === '/ws') {
    console.log(req.headers);
  } else {
    next();
  }
});
app.use(express.static('.'));
var calc = require('./example/calc/calc_server.js');
calc(app);
server.on('request', app);
server.listen(8081);
/**
 app.listen(8081, function() {
 console.log('Server started...');
 });



 socket upgrade! { host: 'localhost:8081',
 connection: 'Upgrade',
 pragma: 'no-cache',
 'cache-control': 'no-cache',
 upgrade: 'websocket',
 origin: 'http://localhost:8081',
 'sec-websocket-version': '13',
 dnt: '1',
 'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML,
 like Gecko) Chrome/49.0.2623.110 Safari/537.36',
 'accept-encoding': 'gzip, deflate, sdch',
 'accept-language': 'en-US,en;q=0.8',
 'sec-websocket-key': '9HOTB6shTn+cUmuE+wL06Q==',
 'sec-websocket-extensions': 'permessage-deflate; client_max_window_bits' }
 */
