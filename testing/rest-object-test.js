import { createRESTObject, setFetchFn } from "@actualwave/rest-object";
import fetch from 'node-fetch';

setFetchFn(fetch);

const base = createRESTObject('https://gorest.co.in');

(async () => {
  const api = base.public.v1;

  const {
    body: { data: users },
  } = await api.users;

  for (let { id, name } of users.slice(0, 3)/* don't want to DDOS api */) {
    const {
      body: { data: todos },
    } = await api.users[id].todos;

    console.log(`${name} has ${todos.length} todos.`);
  }
})();

(async () => {
  const api = base.public.v1;

  const {
    body: { data: users },
  } = await api.users.read();

  for (let { id, name } of users.slice(0, 3)/* don't want to DDOS api */) {
    const {
      body: { data: todos },
    } = await api.users[id].todos.read();

    console.log(`${name} has ${todos.length} todos.`);
  }
})();
