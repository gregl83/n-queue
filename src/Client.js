var util = require('util');
var Duplex = require('stream').Duplex;

var config = require('config');
var async = require('async');
var redis = require('redis');

var Task = require('./Task');


/**
 * nQueue Client for all queue CRUD operations
 *
 * CAUTION: Error Event Handler Should Be Implemented
 *
 * Client is a Stream and will throw an exception if an error occurs without
 * at least one error event handler bound.
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

  Duplex.call(self, {objectMode: true});  // todo setup stream options

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
 * Convert a Task object to a Redis Sorted Set Member
 *
 * @param {task} task
 * @param {function} cb
 * @callback
 */
Client.convertTaskToMember = function(task, cb) {
  if (task instanceof Task) cb(undefined, task.meta.id + ':' + JSON.stringify(task));
  else cb(new Error('task must be instanceof Task'));
};


/**
 * Push task to queue
 *
 * @param {string} task
 * @param {function} cb
 * @private
 */
Client.prototype._pushTask = function(task, cb) {
  this.write(task, function(err) {
    cb(err);
  });
};


/**
 * Push task to tail of queue
 * Stream.write
 *
 * @param {task|{task}[]} tasks
 * @param {function} [cb]
 * @async
 */
Client.prototype.pushTasks = function(tasks, cb) {
  var self = this;
  var error = undefined;

  if (!Array.isArray(tasks)) tasks = [tasks];

  var queue = async.queue(function (task, callback) {
    self._pushTask(task, function(err) {
      if (!err) return callback();

      error = err;
      callback(err);
    });
  }, 10);

  queue.drain = function() {
    if ('function' === typeof cb) cb(error);
  };

  queue.push(tasks);
};


/**
 * Shift task from set and push to another set atomically
 *
 * @private
 */
Client.prototype._shiftPush = function() {
  var self = this;

  /*
   client = redis.createClient(), multi;

   // start a separate multi command queue
   multi = client.multi();
   multi.incr("incr thing", redis.print);
   multi.incr("incr other thing", redis.print);

   // runs immediately
   client.mset("incr thing", 100, "incr other thing", 1, redis.print);

   // drains multi queue and runs atomically
   multi.exec(function (err, replies) {
   console.log(replies); // 101, 2
   });

   // you can re-run the same transaction if you like
   multi.exec(function (err, replies) {
   console.log(replies); // 102, 3
   client.quit();
   });
   */

  // var multi = self.store.multi();

  // todo multi exec to perform atomic sets shift/push
};


/**
 * Called by Stream.write
 * See Streams API
 *
 * @private
 * @inheritdoc
 */
Client.prototype._write = function(task, encoding, cb) {
  var self = this;

  Client.convertTaskToMember(task, function(err, member) {
    if (err) return cb(err);

    self.store.zadd([task.meta.set, task.meta.set, member], function(err, response) {
      if (err) return cb(err);

      // todo handle response (will be count of elements)
      cb();
    });
  });
};


/**
 * Get task from head of queue
 * Stream.read
 *
 * @async
 */
Client.prototype.readTasks = function() {
  //var self = this;
  //var task = JSON.parse(chunk.toString('utf8'));
  //self.store.zadd([task.meta.set, task.meta.set, chunk], function(err, response) {
  //  // todo handle response (will be count of elements)
  //  if (err) return cb(err);
  //  cb();
  //});
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