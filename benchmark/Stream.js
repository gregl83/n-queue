var util = require('util');
var Duplex = require('stream').Duplex;

var redis = require('redis');
var client = redis.createClient();
var redisCommands = require('n-redis-commands');
var SHA = redisCommands('prpoplpush');

var Benchmark = require('./Benchmark');
var benchmark = new Benchmark({iterations: 10000000});


function Stream() {
  var self = this;
  Duplex.call(self, {objectMode: true});
}


util.inherits(Stream, Duplex);


Stream.prototype._read = function() {
  var self = this;

  var request = benchmark.request();

  if (benchmark._iterations <= request) self.push(null);
  else {
    client.evalsha([SHA, 2, 'queued', 'processed', 'critical'], function(err, data) {
      self.push(data);
    });
  }
};


benchmark.start();


console.log('stream started');

var stream = new Stream();

stream.on('readable', function() {
  var obj;
  while (null !== (obj = stream.read())) {
    //console.log('stream read', obj);
  }
});

stream.on('error', function(err) {
  console.log('stream error', err);
});

stream.on('end', function() {
  benchmark.end();
  benchmark.results();

  console.log('stream ended');
});