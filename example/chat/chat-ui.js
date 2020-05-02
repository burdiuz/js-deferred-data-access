/**
 * Created by Oleg Galaburda on 11.04.16.
 */
var colors = {};
var participants;
function color() {
  var result;

  function part() {
    return Math.round(Math.random() * 5) * 0x33;
  }

  function html(color) {
    var result = color.toString(16);
    while (result.length < 6) {
      result = '0' + result;
    }
    return '#' + result;
  }

  do {
    result = html(part() << 16 | part() << 8 | part());
  } while (result === '#ffffff'); // should not be white and should be unique
  return result;
}

function nameHtml(participant) {
  var id = DataAccessInterface.getResourceId(participant);
  if (!colors.hasOwnProperty(id)) {
    colors[id] = color();
  }
  return '<span style="color: ' + colors[id] + ';">' + participant.name + '</span>';
}

function updateParticipants(list) {
  participants = list;
  if (participants.length > 25) { // not more than 25 participants
    //TODO send system message with names who wasn't connected, add limit handling to server-side script
    participants = participants.slice(0, 25);
  }
  displayParticipants();
  if (!getSelectedParticipant()) {
    setSelectedParticipant(participants.length ? participants[0] : null);
  }
}

function displayParticipants() {
  var panel = $('.participants-panel');
  panel.empty();
  participants.forEach(function(participant) {
    var $node = $('<div class="participant">' + nameHtml(participant) + '</div>');
    $node.data('value', participant);
    panel.append($node);
  });
}

function setSelectedParticipant(participant) {
  var $node = $('.selected-participant');
  $node.data('value', participant);
  if (participant) {
    $node.html(nameHtml(participant));
    enableInput();
  } else {
    $node.html('');
    disableInput();
  }
}

function getSelectedParticipant() {
  return $('.selected-participant').data('value');
}

function enableInput() {
  $('.message-input').removeAttr('disabled');
}

function disableInput() {
  $('.message-input').attr('disabled', 'disabled');
}

function displayMessage(data) {

}

function sendMessage(message) {
  var participant = getSelectedParticipant();
  participant.send(message);
}

$(function() {
  $('.participants-panel').on('click', '.participant', function() {
    var $node = $(this);
    console.log($node, $node.data('value'));
    setSelectedParticipant($node.data('value'));
  });
  $('.input-panel .message-input').keyup(function(event) {
    if (event.keyCode == 13) {
      var message = $(this).val();
      if (message.trim()) {
        sendMessage(message);
      }
      $(this).val('');
    }
  });
  disableInput();
});
