var nQueue = require('../');

var client = nQueue.createClient('localhost', 6379, {queue: 'test'});

// todo