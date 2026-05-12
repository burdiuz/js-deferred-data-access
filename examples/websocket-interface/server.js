'use strict';

const express = require('express');
const { Server: WebSocketServer } = require('ws');
const { initializeServer } = require('./websocket-interface.umd.js');

const app = express();
const wss = new WebSocketServer({ noServer: true });

let lastId = 20;

const customers = (() => {
  const fnames = ['Alex', 'Mark', 'David', 'Pater', 'Meg', 'Stewie', 'Oleg', 'Steve', 'Bill', 'John'];
  const lnames = ['Mile', 'Testovich', 'Meter', 'Inch', 'Cm', 'Tonn', 'Pound', 'Currency', 'Whatelse', 'Whoknows', 'Doe'];
  const cmpnies = ['Campaney', 'Comp Inc', 'Windows Inc', 'Beds Inc', 'Bottle Inc', 'Table Inc', 'Chair Inc', 'Phone Inc', 'Elgoog Inc', 'Employee Inc', 'Slavery Inc', 'Dark Science of XX Century Inc'];
  const data = {};
  let length = lastId;
  while (length--) {
    const item = {
      id: String(length + 1),
      name: fnames[(Math.random() * fnames.length) >> 0] + ' ' + lnames[(Math.random() * lnames.length) >> 0],
      company: cmpnies[(Math.random() * cmpnies.length) >> 0],
      age: 25 + parseInt(Math.random() * 35),
      phone: '000-555-55-55',
      address: String((Math.random() * 500) >> 0) + ' Street st.',
    };
    data[item.id] = item;
  }
  return data;
})();

const root = {
  listCustomers() {
    return Object.values(customers).map(({ id, name }) => ({ id, name }));
  },

  addCustomer(data) {
    if (data && data.name) {
      data.id = String(++lastId);
      customers[data.id] = data;
      return { success: true, id: data.id };
    }
    return { success: false };
  },

  getCustomer(id) {
    return customers[id] ?? { success: false };
  },

  updateCustomer(id, data) {
    if (customers[id] && data && data.name && data.id === id) {
      customers[id] = data;
      return { success: true };
    }
    return { success: false };
  },

  removeCustomer(id) {
    if (customers[id]) {
      delete customers[id];
      return { success: true };
    }
    return { success: false };
  },
};

wss.on('connection', async (ws) => {
  const api = await initializeServer({
    ws,
    root,
    preprocessResponse: ({ data }) => JSON.parse(data),
  });

  // Push an updated list to the client every 2.5 s
  const intervalId = setInterval(async () => {
    try {
      await api.root.updateList(root.listCustomers());
    } catch {
      // client disconnected
    }
  }, 2500);

  ws.onclose = () => clearInterval(intervalId);
});

app.use(express.static('.'));

const server = app.listen(8081, () => {
  console.log('WebSocket Interface example running at http://localhost:8081');
});

server.on('upgrade', (req, sock, head) => {
  if (req.url !== '/rpc') {
    sock.destroy();
    return;
  }
  wss.handleUpgrade(req, sock, head, (ws) => wss.emit('connection', ws, req));
});
