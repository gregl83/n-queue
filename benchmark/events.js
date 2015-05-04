var EventEmitter = require('events').EventEmitter;
var util = require('util');

var redis = require('redis');
var client = redis.createClient();

var iterations = 100000;
var Benchmark = require('quick-bench');
var benchmark = new Benchmark();


function Events() {
  var self = this;

  EventEmitter.call(self);

  self.buffer = [];
}


util.inherits(Events, EventEmitter);


Events.prototype.push = function(data) {
  var self = this;

  if (null === data) return self.emit('end');

  self.buffer.push(data); // fake buffer

  self.emit('readable', self.buffer.shift()); // remove from fake buffer
};


Events.prototype._read = function() {
  var self = this;

  if (iterations <= benchmark.event('reqs')) self.push(null);
  else {
    client.rpoplpush(['queued:critical', 'processed:critical'], function(err, data) {
      self.push(data);
    });
  }
};


Events.prototype.read = function() {
  var self = this;

  self._read();
};



benchmark.start();


console.log('events started');

var events = new Events();

events.on('readable', function(obj) {
  //console.log('events read', obj);
  events.read();
});

events.on('error', function(err) {
  console.log('events error', err);
});

events.on('end', function() {
  var results = benchmark.results();

  console.log('events ended', results);
  process.exit();
});

events.read();