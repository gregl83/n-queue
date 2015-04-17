var redis = require('redis');

function Client(options) {
  var self = this;

  // todo create redis client using options

  self.store = redis.createClient();
}

// todo write n-queue client

module.exports = Client;