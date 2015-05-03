var EventEmitter = require('events').EventEmitter;
var util = require('util');

var redis = require('redis');
var client = redis.createClient();
var redisCommands = require('n-redis-commands');
var SHA = redisCommands('prpoplpush');

var Benchmark = require('./Benchmark');
var benchmark = new Benchmark({iterations: 10000000});


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

  self.emit('read', self.buffer.shift()); // remove from fake buffer
};


Events.prototype._read = function() {
  var self = this;

  var request = benchmark.request();

  if (benchmark._iterations <= request) self.push(null);
  else {
    // using native function (manage keys in code)
    client.rpoplpush(['queued:critical', 'processed:critical'], function(err, data) {
      self.push(data);
    });

    // todo remove sha usage and redis-commands lib
    // using sha
    //client.evalsha([SHA, 2, 'queued', 'processed', 'critical'], function(err, data) {
    //  self.push(data);
    //});
  }
};


Events.prototype.read = function() {
  var self = this;

  self._read();
};



benchmark.start();


console.log('events started');

var events = new Events();

events.on('read', function(obj) {
  //console.log('events read', obj);
  events.read();
});

events.on('error', function(err) {
  console.log('events error', err);
});

events.on('end', function() {
  benchmark.end();
  benchmark.results();

  console.log('events ended');
});

events.read();