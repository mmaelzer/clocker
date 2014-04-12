var _ = require('underscore');
var fs = require('fs');
var http = require('http');
var shoe = require('shoe');
var ecstatic = require('ecstatic')(__dirname + '/static');

var file = 'cycles.txt';
var separator = '\n';

if (!fs.existsSync(file)) {
  fs.appendFileSync(file, '');
}

var records = fs.readFileSync(file, 'utf8').split(separator);

var port = 9999;
var server = http.createServer(ecstatic);
server.listen(port);
console.log('=== clocker server running on port', port, '===');

shoe(function(stream) {
  stream.on('data', function(time) {
    fs.appendFileSync(file, time + separator);
    records.push(time);
    stream.write(time);
  });
}).install(server, '/record');

shoe(function(stream) {
  stream.on('data', function() {
    records.forEach(stream.write.bind(stream));
  });
}).install(server, '/records');

shoe(function(stream) {
  stream.on('data', function(time) {
    records = _.without(records, time);
    fs.writeFileSync(file, records.join(separator));
    stream.write(time);
  });
}).install(server, '/delete');