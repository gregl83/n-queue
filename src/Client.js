var util = require('util');
var Duplex = require('stream').Duplex;

var config = require('config');
var redis = require('redis');


/**
 * nQueue Client for all queue CRUD operations
 *
 * @param {string} host
 * @param {string|number} port
 * @param {object} options
 * @constructor
 * @augments Stream
 */
function Client(host, port, options) {
  var self = this;

  Duplex.call(self, {});  // todo setup stream options

  self.store = redis.createClient(port, host, options);
}


util.inherits(Client, Duplex);


/**
 * Add task to tail of queue
 * Stream.write
 *
 * @param {string} queue name
 * @param {number} priority level of task
 * @param {object} task to queue
 * @param {function} cb
 * @async
 */
Client.prototype.addTask = function(queue, priority, task, cb) {
  // todo call stream.write
};


/**
 * Gets called by Stream.write
 * See Streams API
 *
 * @inheritdoc
 */
Client.prototype._write = function(chunk, encoding, cb) {
  // todo write task to queue
};


/**
 * Get task from head of queue
 * Stream.read
 *
 * @param {string} queue name
 * @param cb
 * @async
 */
Client.prototype.getTask = function(queue, cb) {
  // todo call stream.read
};


/**
 * Gets called by Stream.read
 * See Streams API
 *
 * @inheritdoc
 */
Client.prototype._read = function(size) {
  // todo get task(s) from queue and push to stream
};


module.exports = Client;