'use strict';

const express = require('express');

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

const app = express();
app.use(express.json());

app.get('/example/api/portal/users/customers', (req, res) => {
  const list = Object.values(customers).map(({ id, name }) => ({ id, name }));
  res.json(list);
});

app.post('/example/api/portal/users/customers', (req, res) => {
  const data = req.body;
  if (data && data.name) {
    data.id = String(++lastId);
    customers[data.id] = data;
    res.json({ success: true, id: data.id });
  } else {
    res.status(400).json({ success: false });
  }
});

app.route('/example/api/portal/users/customers/:id')
  .get((req, res) => {
    const { id } = req.params;
    customers[id] ? res.json(customers[id]) : res.status(404).json({ success: false });
  })
  .put((req, res) => {
    const { id } = req.params;
    const data = req.body;
    if (customers[id] && data && data.name && data.id === id) {
      customers[id] = data;
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  })
  .delete((req, res) => {
    const { id } = req.params;
    if (customers[id]) {
      delete customers[id];
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false });
    }
  });

app.use(express.static('.'));

app.listen(8081, () => {
  console.log('REST Object example running at http://localhost:8081');
});
