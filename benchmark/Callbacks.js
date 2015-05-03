var async = require('async');
var redis = require('redis');
var client = redis.createClient();

var iterations = 100000;
var Benchmark = require('./Benchmark');
var benchmark = new Benchmark({events: ['reqs']});


function Callbacks() {}


Callbacks.prototype.read = function(cb) {
  if (iterations <= benchmark.event('reqs')) return cb(undefined, null);
  client.rpoplpush(['queued:critical', 'processed:critical'], function(err, data) {
    cb(undefined, data);
  });
};


Callbacks.prototype.error = function(err) {
  console.log('callbacks error', err);
};


Callbacks.prototype.end = function() {
  var results = benchmark.getResults();

  console.log('callbacks ended', results);
};


benchmark.start();


console.log('callbacks started');

var callbacks = new Callbacks();

async.timesSeries(iterations, function(n, next) {
  callbacks.read(function(err, data) {
    if (err) return callbacks.error(err);

    //console.log('callbacks read', data);
    next();
  });
}, function() {
  callbacks.end();
});

