var EventEmitter = require('events').EventEmitter;
var util = require('util');

var redis = require('redis');
var client = redis.createClient();
var redisCommands = require('n-redis-commands');
var SHA = redisCommands('prpoplpush');

var iterations = 1000000;
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

  self.emit('read', self.buffer.shift()); // remove from fake buffer
};


Events.priorities = ['critical', 'high', 'medium', 'low'];


Events.prototype.nativePriority = function(src, dest, cb) {
  client.rpoplpush([src+':'+Events.priorities[0], dest+':'+Events.priorities[0]], function(err, res) {
    if (res) return cb(err, res);
    client.rpoplpush([src+':'+Events.priorities[1], dest+':'+Events.priorities[1]], function(err, res) {
      if (res) return cb(err, res);
      client.rpoplpush([src+':'+Events.priorities[2], dest+':'+Events.priorities[2]], function(err, res) {
        if (res) return cb(err, res);
        client.rpoplpush([src+':'+Events.priorities[3], dest+':'+Events.priorities[3]], function(err, res) {
          cb(err, res);
        });
      });
    });
  });
};


Events.prototype.customPriority = function(src, dest, cb) {
  client.evalsha([SHA, 2, src, dest, Events.priorities[0], Events.priorities[1], Events.priorities[2], Events.priorities[3]], function(err, data) {
    cb(err, data);
  });
};


Events.prototype._read = function() {
  var self = this;

  if (iterations <= benchmark.event('reqs')) self.push(null);
  else {
    self.customPriority('queued', 'processing', function(err, data) {
      self.push(data);
    });
  }
};


Events.prototype.read = function() {
  var self = this;

  self._read();
};



benchmark.start();


console.log('priorities started');

var events = new Events();

events.on('read', function(obj) {
  //console.log('priorities read', obj);
  events.read();
});

events.on('error', function(err) {
  console.log('priorities error', err);
});

events.on('end', function() {
  var results = benchmark.results();

  console.log('priorities ended', results);
  process.exit();
});

events.read();