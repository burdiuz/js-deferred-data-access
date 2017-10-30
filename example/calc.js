var num = '0';
$(function() {
  $('.container').on('click', 'button.operation', function(event) {
    var target = $(event.target);
    apply(target.attr('data-value'));
  });
  $('.container').on('click', 'button.number', function(event) {
    var target = $(event.target);
    displayAddNumber(target.text());
  });
  displaySet(num);
});

function displaySet(value) {
  var display = $('.display');
  display.text(value || '0');
  displayScroll();
}

function displayAdd(value) {
  var display = $('.display');
  display.text(display.text() + value);
  displayScroll();
}

function displayGet() {
  return $('.display').text();
}

function displayAddNumber(value) {
  if (value !== '.' || num.indexOf('.') < 0) {
    if (num === '0') {
      num = '';
    }
    if (value === '.' && !num) {
      num = '0';
    }
    displaySetNumber(num + value);
  }
}

function displaySetNumber(value) {
  num = value;
  var display = displayGet();
  displaySet(display.replace(/-?\d+(\.\d+)?$/, num));
}

function displayScroll() {
  $('.display').scrollLeft(Number.MAX_SAFE_INTEGER);
}

function addOp(operator) {
  var display = displayGet();
  if (num) { //display.match(/\d$/)) {
    num = '';
    displayAdd(` ${operator} `);
  }
}

function opChangeSign() {
  if (parseFloat(num)) {
    if (num.charAt(0) === '-') {
      num = num.substr(1);
    } else {
      num = '-' + num;
    }
  }
  displaySetNumber(num);
}

function opClearLastNumber() {
  var display = displayGet().replace(/(\s[^\d]\s)?-?\d+(\.\d+)?$/, '');
  var lastNumber = display.match(/-?\d+(?:\.\d+)?$/);
  displaySet();
}

function opRemoveLastChar() {
  if (num) {
    displaySetNumber(num.substr(0, num.length - 1));
  }
}

function apply(operation) {
  switch (operation) {
    case 'Rm': // remove last number
      opRemoveLastChar();
      break;
    case 'CE':
      opClearLastNumber();
      break;
    case 'Si':
      opChangeSign()
      break;
    case 'Ml':
      addOp('*');
      break;
    case 'Dv':
      addOp('/');
      break;
    case 'Ad':
      addOp('+');
      break;
    case 'Su':
      addOp('-');
      break;
    default:
      send(operation).then((data) => {
        num = data.num;
        displaySet(data.text);
      });
      break;
  }
}

function send(type) {
  var data = {
    text: displayGet(),
    num: num,
    type: type
  };
  return new Promise((res, rej) => {
    res(opExecute(data));
  });
}

var memory = 0;

function opExecute(data) {
  switch (data.type) {
    case 'MC':
      memory = 0;
      break;
    case 'MR':
      break;
    case 'MS':
      break;
    case 'Mp':
      break;
    case 'Mm':
      break;
  }
}

function successHandler(result) {
  displayResult(result);
  current = null;
  send();
}

function displayResult(result) {
  $('.input').val(result.input);
  var display = $('.history');
  if (result.history) {
    result.history.forEach(function(value) {
      display.append('<div class="row"><div class="col-xs-5 display">' + value + '</div></div>');
    });
  }
}
