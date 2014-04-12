var $ = require('jquery');
var domready = require('domready');
var shoe = require('shoe');
var hogan = require('hogan.js');
var moment = require('moment');
var _ = require('underscore');

var template = hogan.compile('<tr class="{{status}}" data-time="{{value}}">' + 
                             '<td>{{time}}</td>' +
                             '<td>{{date}}</td>' +
                             '<td>{{length}}</td>' +
                             '<td><button type="button" class="close" aria-hidden="true">&times;</button></td>' +
                             '</tr>');

domready(function () {
  var writer = shoe('/record');
  var reader = shoe('/records');
  var deleter = shoe('/delete');

  var $recordsTable = $('#records');

  var records = [];

  var prepend = function(time) {
    if (!time) return;
 
    time = Number(time);

    if (records.indexOf(time) !== -1) return;

    var curr = new Date(time);
    var prev = _.first(records);
    var diff = prev ? getTimeDiff(time, prev) : null;

    var record = {
      status: getStatus(prev ? (curr - prev) : Infinity),
      time: moment(curr).format('h:mm A'),
      date: curr.toLocaleDateString(),
      length: diff || '-',
      value: time
    };

    $recordsTable.prepend(template.render(record));
    records.unshift(time);
  };

  reader.on('data', prepend);
  writer.on('data', prepend);

  // Get data
  reader.write('ping');

  $('#record-btn').on('click', function() {
    var now = Date.now();

    prepend(now);

    writer.write(now);
  });

  $(document).on('click', '.close', function() {
    var $row = $(this).closest('tr');
    var time = Number($row.data('time'));
    records = _.without(records, time);
    $row.remove();
    deleter.write(time);
  });
});

function getTimeDiff(time1, time2) {
  var diff = Math.abs(time1 - time2);
  var hours = Math.round(diff / (60 * 60 * 1000));
  var mins = Math.round(diff / (60 * 1000)) % 60 + 'm';

  return hours > 0 ? (hours + 'h ' + mins) : mins;
}

function getStatus(time) {
  if (time >= hours(2)) {
    return 'success';
  } else {
    return 'warning';
  }
}

function hours(n) {
  return n * (60 * 60 * 1000);
}