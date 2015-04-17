var redis = require('redis');

/**
 * nQueue Client for all queue CRUD operations
 *
 * @param {string} host
 * @param {string|number} port
 * @param {object} options
 * @constructor
 */
function Client(host, port, options) {
  var self = this;
  console.log('>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<');
  self.store = redis.createClient(port, host, options);
}

// todo write n-queue client

module.exports = Client;