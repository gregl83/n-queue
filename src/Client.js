var config = require('config');
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
  self.store = redis.createClient(port, host, options);
}


/**
 * Push task to tail of queue
 *
 * @param {string} queue name
 * @param {number} priority level of task
 * @param {object} task to queue
 * @param {function} cb
 * @async
 */
Client.prototype.push = function(queue, priority, task, cb) {
  // todo
};


/**
 * Get task from head of queue
 *
 * @param {string} queue name
 * @param cb
 * @async
 */
Client.prototype.shift = function(queue, cb) {
  // todo
};


module.exports = Client;