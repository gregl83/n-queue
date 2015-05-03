var util = require('util');
var Duplex = require('stream').Duplex;

var redis = require('redis');
var client = redis.createClient();

var iterations = 100000;
var Benchmark = require('quick-bench');
var benchmark = new Benchmark();


function Stream() {
  var self = this;
  Duplex.call(self, {objectMode: true});
}


util.inherits(Stream, Duplex);


Stream.prototype._read = function() {
  var self = this;

  if (iterations == benchmark.event('reqs')) self.push(null);
  else {
    client.rpoplpush(['queued:critical', 'processed:critical'], function(err, data) {
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
  var results = benchmark.results();

  console.log('stream ended', results);
  process.exit();
});