const api = RESTObject.createRESTObject('/example/api');
const customers = api.portal.users.customers;

$(() => {
  reloadList();

  $('button.save').on('click', async (event) => {
    event.preventDefault();
    const item = getFormData();
    item.id = $('form.edit').data('item').id;
    // PUT /example/api/portal/users/customers/:id via proxy SET + forLatest()
    customers[item.id] = item;
    await customers.forLatest();
    reloadList();
  });

  $('button.add').on('click', async (event) => {
    event.preventDefault();
    // POST /example/api/portal/users/customers via proxy call
    try {
      await customers(getFormData());
      reloadList();
    } catch (error) {
      console.error(error);
      alert('Error happened when adding new customer.');
    }
  });
});

const reloadList = async () => {
  // GET /example/api/portal/users/customers
  try {
    const { body } = await customers.read();
    displayList(body);
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
  // GET /example/api/portal/users/customers/:id via proxy GET
  try {
    const { body } = await customers[item.id];
    displayForm(body);
  } catch (error) {
    console.error(error);
    alert('Error happened while loading customer info.');
  }
};

const deleteCustomer = async (item) => {
  if (!confirm('Delete customer?')) return;
  // DELETE /example/api/portal/users/customers/:id via proxy delete
  delete customers[item.id];
  await customers.forLatest();
  $(`.list tr.customer-${item.id}`).remove();
};
