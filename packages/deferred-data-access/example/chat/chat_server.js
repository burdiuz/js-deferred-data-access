'use strict';
const clients = new Map();
const ids = new Map();
const resources = new Map();

var WebSocketServer = require('websocket-server');
var Client = WebSocketServer.Client;
var DataAccessInterface = require('../../dist/deferred-data-access');

function convertMessage(client, message) {
  return {
    type: message.type,
    source: resources[ids.get(client)],
    data: message.data
  }
}

function systemMessage(message) {
  return {
    source: {
      name: 'System'
    },
    type: 'system',
    data: message
  }
}

function participantAddHandler(target, pack, deferred) {
  var client = pack.cmd;
  var resource = api.pool.set(client).toJSON();
  var id = DataAccessInterface.getResourceId(resource);
  resource.name = pack.value;
  // send participantAdd
  chat.broadcast({
    source: resource,
    type: 'participantAdd'
  });
  clients.set(id, client);
  ids.set(client, id);
  resources.set(id, resource);
  participants.push(resource);
  // send participants to new client
  client.send({
    source: chatResource,
    type: 'participants',
    data: participants
  });
  deferred.resolve();
}
function participantRemoveHandler(target, pack, deferred) {
  var client = pack.cmd;
  var id = clients.get(client);
  var resource = resources.get(id);
  var index = participants.indexOf(resource);
  if (index >= 0) {
    participants.splice(index, 1);
  }
  clients.delete(id);
  ids.delete(client);
  resources.delete(id);
  chat.broadcast({
    source: resource,
    type: 'participantRemove'
  });
}

function serverHandler(target, pack, deferred) {
// Handling HTTP requests to start WebSocket connection
  var httpServer = pack.cmd;
  httpServer.on('upgrade', WebSocketServer);
  deferred.resolve();
}

function broadcastHandler(target, pack, deferred) {
  for (let entry of clients) {
    entry[1].send(pack.cmd);
  }
}

/**
 * @type {DataAccessInterface}
 */
const api = DataAccessInterface.create({
  server: serverHandler,
  broadcast: broadcastHandler,
  participantAdd: participantAddHandler,
  participantRemove: participantRemoveHandler
});
const chatResource = DataAccessInterface.dummy();
const participants = [chatResource];
const chat = api.parse(chatResource);

chatResource.name = 'To Everyone';
module.exports = chat;

WebSocketServer.addEventListener(WebSocketServer.CLIENT_CONNECTED, function(event) {
  var client = event.data;
  client.addEventListener(Client.MESSAGE_RECEIVED, function(event) {
    var id, receiver;
    var message = JSON.parse(event.data.value);
    switch (message.type) {
      case 'init':
        chat.participantAdd(client, message.data);
        break;
      case 'message':
        if (DataAccessInterface.areSameResource(message.target, chatResource)) {
          chat.broadcast(convertMessage(client, message));
        } else {
          id = DataAccessInterface.getResourceId(message.target);
          receiver = clients.get(id);
          if (receiver) {
            receiver.send(convertMessage(client, message));
          } else {
            client.send(systemMessage('Sorry, receiver could not be found.'));
          }
        }
        break;
    }
  });
});

WebSocketServer.addEventListener(WebSocketServer.CLIENT_DISCONNECTED, function(event) {
  var client = event.data;
  chat.participantRemove(client);
});
/*FIXME Is it possible to reject client? What condition should not meet for rejection?
 Communication Schema
 Steps for connection:
 1. Client connects to server
 2. Server sends own Resource object as Communication counterpart
 3. Client tells its name
 4. Server sends full list of participants to client
 5. Server tells everyone else that new Client arrived

 Steps for sending message:
 1. Client uses Communication counterpart resource to send message
 2. Server checks target
 2a. If its the target, then broadcast message
 2b. If specific client is a target, then send to client message
 3. Send message back to sending Client

 Message format From client:
 {target: null|Resource, type: {enum}, data: string|array}
 init - client sends its name
 message - send/receive message

 Message format To client:
 {source: Object|Resource, type: {enum}, data: string|array|null}
 participants - all resources with their names
 participantAdd -
 participantRemove -
 message - ---
 system -
 */
