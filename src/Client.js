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
 * @param {string} queue
 * @param {object} options
 * @constructor
 * @augments Stream
 */
function Client(host, port, queue, options) {
  var self = this;

  Duplex.call(self, {});  // todo setup stream options

  self.keyspace = Client.getKeyspace(options.prefix, queue);

  self.store = redis.createClient(port, host);
  // todo set redis database
}


util.inherits(Client, Duplex);


/**
 * Get Redis Keyspace for Queue
 * If prefix is undefined this value will be retrieved from the default.json config
 *
 * @param {string} prefix
 * @param {string} queue
 */
Client.getKeyspace = function(prefix, queue) {
  return (('undefined' !== typeof prefix) ? prefix : config.get('prefix')) + ':' + queue;
};


/**
 * Push task to queue
 *
 * @param {string} task
 * @param {function} cb
 * @private
 */
Client.prototype._pushTask = function(task, cb) {
  this.write(task, 'utf8', function(err) {
    cb(err);
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
  var error = undefined;

  if (!Array.isArray(tasks)) tasks = [tasks];

  var queue = async.queue(function (task, callback) {
    task = JSON.stringify(task);

    self._pushTask(task, function(err) {
      if (!err) return callback();

      error = err;
      callback(err);
    });
  }, 10);

  queue.drain = function() {
    cb(error);
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
  var self = this;

  var task = chunk.toString('utf8');

  console.log(task);

  // todo values below should be included in the chunk/task
  var sortedSet = 'scheduled'; // fixme hard coded sorted set
  var priority = 25; // fixme need to set priority

  self.store.zadd([sortedSet, priority, chunk], function(err, response) {
    // todo handle response (will be count of elements)
    if (err) return cb(err);
    cb();
  });
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


/**
 * Get status of Queue
 *
 * @async
 */
Client.prototype.stat = function() {
  // todo return status of queue data
};


module.exports = Client;