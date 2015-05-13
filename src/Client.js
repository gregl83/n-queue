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
  self._store = redis.createClient(port, host);

  self.redisCommandsSHA = {
    plpush: Client.getCommandSHA('plpush'),
    pllen: Client.getCommandSHA('pllen'),
    plremlpush: Client.getCommandSHA('plremlpush'),
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
 * Write Data to head of priority list
 *
 * @param {string} key
 * @param {string} priority
 * @param {*} data
 * @param {string} encoding
 * @param {function} cb
 * @async
 */
Client.prototype.write = function(key, priority, data, encoding, cb) {
  var self = this;

  self._store.evalsha([self.redisCommandsSHA.plpush, 2, key, priority, data.toString(encoding)], function(err) {
    cb(err);
  });
};


/**
 * Read Data from tail of priority list (highest to lowest priority)
 *
 * @param {string} source
 * @param {string} destination
 * @param {function} cb
 * @async
 */
Client.prototype.read = function(source, destination, cb) {
  var self = this;

  self._store.evalsha([self.redisCommandsSHA.prpoplpush, 6, source, destination, 'critical', 'high', 'medium', 'low'], function(err, res) {
    cb(err, res);
  });
};


/**
 * Push data to EventEmitter (readable)
 *
 * @param {*} data
 * @fires Client#data
 * @private
 */
Client.prototype._push = function(data) {
  var self = this;

  if (!data) return self.close();

  self.emit('data', data);
};


/**
 * Pipe Job from source to destination
 *
 * Caution: This is NOT the same as Readable.pipe from NodeJS Streams
 *
 * @param {string} source
 * @param {string} destination
 * @param {string} priority
 * @param {*} data
 * @param {function} cb
 * @async
 */
Client.prototype.pipe = function(source, destination, priority, data, cb) {
  var self = this;

  self._store.evalsha([self.redisCommandsSHA.plremlpush, 3, source, destination, priority, 0, data], function(err, res) {
    cb(err, res);
  });
};


/**
 * Get size of queue (from data store)
 *
 * @param {string} source
 * @param {function} cb
 * @async
 */
Client.prototype.size = function(source, cb) {
  var self = this;

  self._store.evalsha([self.redisCommandsSHA.pllen, 5, source, 'critical', 'high', 'medium', 'low'], function(err, res) {
    cb(err, res);
  });
};


/**
 * Enqueue Job (to data store)
 *
 * @param {Job|{Job}[]} jobs
 * @param {function} [cb] optional
 * @fires Client#error
 * @async
 */
Client.prototype.enqueueJobs = function(jobs, cb) {
  var self = this;
  var error;

  if (!Array.isArray(jobs)) jobs = [jobs];

  var queue = async.queue(function (job, callback) {
    if (!(job instanceof Job)) {
      error = new Error('job must be instanceof Job');
      return callback(error);
    }

    job.setStatus('queued');

    self.write('queued', job.meta.priority, job, 'utf8', function(err) {
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
 * Dequeue Job (from data store)
 *
 * @fires Client#error
 * @async
 */
Client.prototype.dequeueJob = function() {
  var self = this;

  self.read('queued', 'processing', function(err, res) {
    if (err) self.emit('error', err);

    if (!res) self._push(res);
    else self._push(new Job(res));
  });
};


/**
 * Close Job (in data store)
 *
 * @param {Job} job
 * @param {function} [cb] optional
 * @fires Client#error
 */
Client.prototype.closeJob = function(job, cb) {
  var self = this;

  if (!(job instanceof Job)) {
    var error = new Error('job must be instanceof Job');

    if ('function' === typeof cb) cb(error);

    return self.emit('error', error);
  }

  if (job.meta.error.length) job.setPriority('fail');
  else job.setPriority('success');

  self.pipe('processing', 'done', job.meta.priority, job, function(err, res) {
    if (err) self.emit('error', err);
    if ('function' === typeof cb) cb(err, res);
  });
};


/**
 * Get status of Queue
 *
 * @param {string|array} sources
 * @param {function} [cb]
 * @fires Client#status
 * @fires Client#error
 * @async
 */
Client.prototype.getStatus = function(sources, cb) {
  var self = this;
  var error = undefined;
  var status = {};

  if (!Array.isArray(sources)) sources = [sources];

  var queue = async.queue(function (source, callback) {
    self.size(source, function(err, res) {
      if (err) {
        error = err;
        return callback(err);
      }
      if ('undefined' === typeof status[source]) status[source] = {};
      for (var i=0; i<res.length; i++) status[source][res[i]] = res[++i];
      callback();
    });
  }, 10);

  queue.drain = function() {
    if (error) self.emit('error', error);
    else self.emit('status', status);

    if ('function' === typeof cb) cb(error, status);
  };

  queue.push(sources);
};


/**
 * Close client
 *
 * @fires Client#end
 */
Client.prototype.close = function() {
  var self = this;

  self.emit('end');

  self._store.quit();
};


module.exports = Client;