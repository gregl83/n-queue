var util = require('util');
var Duplex = require('stream').Duplex;

var config = require('config');
var async = require('async');
var redis = require('redis');
var redisCommands = require('n-redis-commands');

var Job = require('./Job');


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

  // todo setup stream options
  Duplex.call(self, {objectMode: true});

  self.keyspace = Client.getKeyspace(options.prefix, queue);

  // todo set redis database
  self.store = redis.createClient(port, host);

  self.redisCommandsSHA = {
    plpush: Client.getCommandSHA('plpush'),
    prpoplpush: Client.getCommandSHA('prpoplpush')
  };
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
 * Get Redis Command SHA
 *
 * @param {string} command
 * @returns {string} commandSHA
 */
Client.getCommandSHA = function(command) {
  return redisCommands(command);
};


/**
 * Push Job(s) to stream (head of queue)
 * Stream.write
 *
 * @param {job|{job}[]} jobs
 * @param {function} [cb]
 * @async
 */
Client.prototype.pushJob = function(jobs, cb) {
  var self = this;
  var error = undefined;

  if (!Array.isArray(jobs)) jobs = [jobs];

  var queue = async.queue(function (job, callback) {
    self.write(job, function(err) {
      if (!err) return callback();

      error = err;
      callback(err);
    });
  }, 10);

  queue.drain = function() {
    if ('function' === typeof cb) cb(error);
  };

  queue.push(jobs);
};


/**
 * Pushes Job to Data Store
 *
 * Called by Stream.write
 * See Streams API
 *
 * @private
 * @inheritdoc
 */
Client.prototype._write = function(job, encoding, cb) {
  var self = this;

  if (!(job instanceof Job)) return cb(new Error('job must be instanceof Job'));

  self.store.evalsha([self.redisCommandsSHA.plpush, job.meta.status, job.meta.priority, job.toString()], function(err) {
      if (err) return cb(err);
      cb(undefined);
  });
};


/**
 * Get job from head of queue
 * Stream.read
 *
 * @async
 */
Client.prototype.readJob = function() {
  // todo use n-redis-commands

  //var self = this;
  //var job = JSON.parse(chunk.toString('utf8'));
  //self.store.zadd([job.meta.set, job.meta.set, chunk], function(err, response) {
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
  // todo get job(s) from queue and push to stream
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