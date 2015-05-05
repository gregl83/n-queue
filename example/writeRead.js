var nQueue = require('../');


var client = nQueue.createClient('localhost', 6379, {queue: 'test'});

client.on('error', function(err) {
  console.log(err);
});

client.on('readable', function(job) {
  console.log(job);
});

client.on('end', function() {
  console.log('completed');
});


var job = nQueue.createJob();

client.write(job, function(err) {
  client.read();
});