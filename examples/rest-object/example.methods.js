const api = RESTObject.createRESTObject('/example/api');
const customers = api.portal.users.customers;

$(() => {
  reloadList();
  $('button.save').on('click', async (event) => {
    event.preventDefault();
    var item = getFormData();
    item.id = $('form.edit').data('item').id;
    // PUT /example/api/portal/users/customers/:id -- update customer info
    try {
      await customers[item.id].update(null, item);
      reloadList();
    } catch (error) {
      console.log(error);
    }
  });

  $('button.add').on('click', async (event) => {
    event.preventDefault();
    // POST /example/api/portal/users/customers -- create new customer
    try {
      await customers.create(null, getFormData());
      reloadList();
    } catch (error) {
      console.log(error);
      alert('Error happened when adding new customer.');
    }
  });
});

const reloadList = async () => {
  $('.list tbody').empty();
  // GET /example/api/portal/users/customers -- get list of customers
  try {
    const { body } = await customers.read();
    displayList(body);
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
  // GET /example/api/portal/users/customers/:id -- get customer info
  try {
    const { body } = await customers[item.id].read();
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

  // DELETE /example/api/portal/users/customers/:id
  try {
    await customers[item.id].delete();
    $('.list tr.customer-' + item.id).remove();
  } catch (error) {
    console.log(error);
  }
};
