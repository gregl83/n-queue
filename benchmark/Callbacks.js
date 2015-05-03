var async = require('async');
var redis = require('redis');
var client = redis.createClient();
var redisCommands = require('n-redis-commands');
var SHA = redisCommands('prpoplpush');

var Benchmark = require('./Benchmark');
var benchmark = new Benchmark({iterations: 10000000});


function Callbacks() {}


Callbacks.prototype.read = function(cb) {
  var request = benchmark.request();

  if (benchmark._iterations <= request) cb(undefined, null);
  client.evalsha([SHA, 2, 'queued', 'processed', 'critical'], function(err, data) {
    cb(undefined, data);
  });
};


Callbacks.prototype.error = function(err) {
  console.log('callbacks error', err);
};


Callbacks.prototype.end = function() {
  benchmark.end();
  benchmark.results();

  console.log('callbacks ended');
};


benchmark.start();


console.log('callbacks started');

var callbacks = new Callbacks();

async.timesSeries(benchmark._iterations, function(n, next) {
  callbacks.read(function(err, data) {
    if (err) return callbacks.error(err);

    //console.log('callbacks read', data);
    next();
  });
}, function() {
  callbacks.end();
});

