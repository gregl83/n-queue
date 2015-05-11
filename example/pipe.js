var nQueue = require('../');


var client = nQueue.createClient('localhost', 6379, {queue: 'test'});
console.log('created client');


client.on('error', function(err) {
  console.log('Client#error', err);
});

client.on('readable', function(job) {
  console.log('Client#readable');
  console.log(job);
});

client.on('status', function(status) {
  console.log('Client#status');
  console.log(status);
});

client.on('end', function() {
  console.log('Client#end');

  // cleanup store
  client._store.del('queued:medium', 'done:medium');

  console.log('closing client');
});



var job = nQueue.createJob();

job.setStatus('queued');

client.write(job, function(err) {
  if (err) console.log('client.write error', err);
  console.log('job written');

  client.pipe('queued', 'done', job);

  client.close();
});