var util = require('util');
var Duplex = require('stream').Duplex;

var config = require('config');
var async = require('async');
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

  // todo set queue name here

  self.store = redis.createClient(port, host, options);
}


util.inherits(Client, Duplex);


/**
 * Push task to queue
 *
 * @param {string} task
 * @param {function} cb
 * @private
 */
Client.prototype._pushTask = function(task, cb) {
  this.write(task, 'utf8', function() {
    // todo handle arguments
    cb();
  });
};


/**
 * Push task to tail of queue
 * Stream.write
 *
 * @param {{priority:number, task:object}[]} tasks
 * @param {function} cb
 * @async
 */
Client.prototype.pushTasks = function(tasks, cb) {
  var self = this;

  if (!Array.isArray(tasks)) tasks = [tasks];

  var queue = async.queue(function (task, callback) {
    task = JSON.stringify(task);
    self._pushTask(task, function() {
      // todo handle arguments
      callback();
    });
  }, 10);

  queue.drain = function() {
    // todo handle arguments

    cb();
  };

  queue.push(tasks);
};


/**
 * Called by Stream.write
 * See Streams API
 *
 * @private
 * @inheritdoc
 */
Client.prototype._write = function(chunk, encoding, cb) {
  // todo write task to queue
  cb();
};


/**
 * Get task from head of queue
 * Stream.read
 *
 * @async
 */
Client.prototype.readTasks = function() {
  // todo call stream.read
};


/**
 * Called by Stream.read
 * See Streams API
 *
 * @private
 * @inheritdoc
 */
Client.prototype._read = function(size) {
  // todo get task(s) from queue and push to stream
};


module.exports = Client;