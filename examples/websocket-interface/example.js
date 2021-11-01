let api;

$(() => {
  $('button.save').on('click', async (event) => {
    event.preventDefault();
    var item = getFormData();
    item.id = $('form.edit').data('item').id;
    try {
      await api.root.updateCustomer(item.id, item);
      reloadList();
    } catch (error) {
      console.log(error);
    }
  });

  $('button.add').on('click', async (event) => {
    event.preventDefault();
    try {
      await api.root.addCustomer(getFormData());
      reloadList();
    } catch (error) {
      console.log(error);
      alert('Error happened when adding new customer.');
    }
  });
});

const reloadList = async () => {
  $('.list tbody').empty();
  try {
    const list = await api.root.listCustomers();
    displayList(list);
  } catch (error) {
    console.log(error);
    alert('Error happened while loading customers list.');
  }
};

const displayList = (list) => {
  var $container = $('.list tbody');
  $container.empty();
  $.each(list, (index, item) => {
    var $el = $(
      `<tr>
          <td>${item.name}</td>
          <td><a href="" class="delete">Delete</a></td>
       </tr>`
    );
    $el.addClass('customer-' + item.id);
    $el.on('click', 'td', () => {
      editCustomer(item);
    });
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
    console.log(error);
    alert('Error happened while loading customer info.');
  }
};

const deleteCustomer = async (item) => {
  if (!confirm('Delete customer?')) {
    return;
  }

  try {
    await api.root.removeCustomer(item.id);
    $('.list tr.customer-' + item.id).remove();
  } catch (error) {
    console.log(error);
  }
};

// we have to keep copy of API object to not let Garbage Collector take it.
const root = {
  // can be called by server
  updateList(list) {
    displayList(list);
  },
};

(async () => {
  const ws = new WebSocket('ws://localhost:8081/rpc');

  api = await WebSocketInterface.initializeClient({
    ws,
    root,
  });

  reloadList();
})();
