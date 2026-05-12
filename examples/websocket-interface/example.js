let api;

$(() => {
  $('button.save').on('click', async (event) => {
    event.preventDefault();
    const item = getFormData();
    item.id = $('form.edit').data('item').id;
    try {
      await api.root.updateCustomer(item.id, item);
      reloadList();
    } catch (error) {
      console.error(error);
    }
  });

  $('button.add').on('click', async (event) => {
    event.preventDefault();
    try {
      await api.root.addCustomer(getFormData());
      reloadList();
    } catch (error) {
      console.error(error);
      alert('Error happened when adding new customer.');
    }
  });
});

const reloadList = async () => {
  try {
    const list = await api.root.listCustomers();
    displayList(list);
  } catch (error) {
    console.error(error);
    alert('Error happened while loading customers list.');
  }
};

const displayList = (list) => {
  const $container = $('.list tbody');
  $container.empty();

  $.each(list, (index, item) => {
    const $el = $(
      `<tr class="customer-${item.id}">
        <td>${item.name}</td>
        <td><a href="" class="delete">Delete</a></td>
      </tr>`
    );
    $el.on('click', 'td', () => editCustomer(item));
    $el.on('click', 'a.delete', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      deleteCustomer(item);
    });
    $el.data('item', item);
    $container.append($el);
  });
};

const displayForm = (data) => {
  $('#name').val(data.name);
  $('#company').val(data.company);
  $('#age').val(data.age);
  $('#phone').val(data.phone);
  $('#address').val(data.address);
  $('form.edit').data('item', data);
  $('button.save').removeClass('hidden');
};

const getFormData = () => ({
  id: undefined,
  name: $('#name').val(),
  company: $('#company').val(),
  age: $('#age').val(),
  phone: $('#phone').val(),
  address: $('#address').val(),
});

const editCustomer = async (item) => {
  try {
    const body = await api.root.getCustomer(item.id);
    displayForm(body);
  } catch (error) {
    console.error(error);
    alert('Error happened while loading customer info.');
  }
};

const deleteCustomer = async (item) => {
  if (!confirm('Delete customer?')) return;
  try {
    await api.root.removeCustomer(item.id);
    $(`.list tr.customer-${item.id}`).remove();
  } catch (error) {
    console.error(error);
  }
};

// Exposed to server — server calls updateList() to push real-time updates
const root = {
  updateList(list) {
    displayList(list);
  },
};

(async () => {
  const ws = new WebSocket('ws://localhost:8081/rpc');

  api = await WebSocketInterface.initializeClient({ ws, root });

  $('#status').text('Connected ✓');
  reloadList();
})();
