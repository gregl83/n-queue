var config = require('config');

var Client = require('./Client');
var Job = require('./Job');

/**
 * Creates a new nQueue Client
 *
 * @param {string} host
 * @param {string|number} port
 * @param {object=object} options
 * @throws {error} invalid params
 * @returns {client}
 */
module.exports.createClient = function(host, port, options) {
  if ('string' !== typeof host) throw new Error('host must be a string');

  if ('string' !== typeof port && 'number' !== typeof port) throw new Error('port must be a number or string number');

  if ('undefined' === typeof options) options = {};
  else if ('object' !== typeof options || Array.isArray(options)) throw new Error('options must be an object');

  // get queue from options of fallback on default.json config
  var queue = ('undefined' !== typeof options.queue) ? options.queue : config.get('stores')[0].queue;

  return new Client(host, port, queue, options);
};


/**
 * Creates a new nQueue Job
 *
 * @param {string} [job]
 * @returns {Job}
 */
module.exports.createJob = function(job) {
  return new Job(job);
};