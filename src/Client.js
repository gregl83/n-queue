var redis = require('redis');

function Client(host, port, options) {
  var self = this;
  self.store = redis.createClient(port, host, options);
}

// todo write n-queue client

module.exports = Client;