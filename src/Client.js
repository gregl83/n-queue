var util = require('util');
var EventEmitter = require('events').EventEmitter;

var config = require('config');
var async = require('async');
var redis = require('redis');
var redisCommands = require('n-redis-commands');

var Job = require('./Job');


/**
 * nQueue Client for all queue CRUD operations
 *
 * Client inherits from EventEmitter
 *
 * @param {string} host
 * @param {string|number} port
 * @param {string} queue
 * @param {object} options
 * @constructor
 * @augments EventEmitter
 */
function Client(host, port, queue, options) {
  var self = this;

  EventEmitter.call(self);

  self.keyspace = Client.getKeyspace(options.prefix, queue);

  // todo set redis database
  self.store = redis.createClient(port, host);

  self.redisCommandsSHA = {
    plpush: Client.getCommandSHA('plpush'),
    prpoplpush: Client.getCommandSHA('prpoplpush')
  };
}


util.inherits(Client, EventEmitter);


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
 * Write Job(s) to Data Store (head of queue)
 *
 * @param {job|{job}[]} jobs
 * @param {function} [cb] optional
 * @async
 */
Client.prototype.write = function(jobs, cb) {
  var self = this;
  var error = undefined;

  if (!Array.isArray(jobs)) jobs = [jobs];

  var queue = async.queue(function (job, callback) {
    self._write(job, 'utf8', function(err) {
      if (!err) return callback();

      error = err;
      callback(err);
    });
  }, 10);

  queue.drain = function() {
    if (error) self.emit('error', error); // fixme handle errors with job
    if ('function' === typeof cb) cb(error);
  };

  queue.push(jobs);
};


/**
 * Write Job to Data Store
 *
 * @param {job} job
 * @param {string} encoding
 * @param {function} cb
 * @private
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
 * Read Job(s) from Data Store
 *
 * @param {string} source
 * @param {string} destination
 */
Client.prototype.read = function(source, destination) {
  this._read(source, destination);
};


/**
 * Read Job(s) from Data Store in order of priority
 *
 * @param {string} source
 * @param {string} destination
 * @private
 */
Client.prototype._read = function(source, destination) {
  var self = this;

  self.store.evalsha([self.redisCommandsSHA.prpoplpush, 2, source, destination, 'critical', 'high', 'medium', 'low'], function(err, data) {
    if (err) self.emit('error', err);
    self._push(data);
  });
};


/**
 * Push Job to EventEmitter (readable)
 *
 * @fires Client#end
 * @fires Client#readable
 * @private
 */
Client.prototype._push = function(job) {
  var self = this;

  if (!job) return self.emit('end');

  self.emit('readable', job);
};


/**
 * Get status of Queue
 *
 * @async
 */
//Client.prototype.getStatus = function() {
  // todo return status of queue data
//};


module.exports = Client;