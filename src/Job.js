var uuid = require('node-uuid');


/**
 * Queue Job object
 *
 * Literal Object Structure:
 * {
 *  "meta" : {
 *    "id" : string,
 *    "schedule" : { ... },
 *    "priority" : string.
 *    "attempt" : { "max" : number },
 *    "hold" : { "duration" : number }
 *    "status" : string,
 *    "log" : [
 *      { "status" : "scheduled", "date" : [ date, ... ] },
 *      { "status" : "queued", "date" : [ date, ... ] },
 *      { "status" : "processing", "date" : [ date, ... ] },
 *      { "status" : "done", "date" : [ date, ... ] }
 *    ],
 *    "error" : [ error, ... ]
 *  },
 *  "data" : { ... }
 * }
 *
 * @param {string} job in JSON string format
 * @constructor
 */
function Job(job) {
  if ('string' === typeof job) job = JSON.parse(job);
  else if ('object' !== typeof job || Array.isArray(job)) job = {};

  // todo consider making ALL the meta properties optional
  if ('object' === typeof job.meta && !Array.isArray(job.meta)) this.meta = job.meta;
  else {
    this.meta = {
      id: Job.getID(),
      schedule: {}, // reserved for scheduler
      priority: 'medium',
      attempt: {max: 3},
      hold: {duration: 600},
      status: null,
      log: [],
      error: []
    };
  }

  this.data = ('object' === typeof job.data && !Array.isArray(job.data)) ? job.data : {};
}


/**
 * Get Unique Job ID
 * Note: RFC4122 v1 UUID is generated using node-uuid module
 *
 * @returns {string}
 */
Job.getID = function() {
  return uuid.v1();
};


/**
 * Valid Job Priorities
 *
 * @type {string}[]
 */
Job.priorities = [
  'critical',
  'high', // default
  'medium',
  'low',
  'fail',
  'success'
];


/**
 * Validate Job Priority (critical, high, medium, low)
 *
 * @param {string} priority
 * @throws {error}
 */
Job.validatePriority = function(priority) {
  if (-1 === Job.priorities.indexOf(priority)) throw new Error('invalid priority');
};


/**
 * Job Statuses
 *
 * @type {string[]}
 */
Job.statuses = ['scheduled', 'queued', 'processing', 'done'];


/**
 * Set Job attempt maximum
 *
 * @param {number} max
 * @throws {error}
 */
Job.prototype.setAttempt = function(max) {
  if ('number' !== typeof max) throw new Error('attempt max must be a number');
  this.meta.attempt.max = max;
};


/**
 * Set Job priority
 *
 * @param {string|number} priority
 */
Job.prototype.setPriority = function(priority) {
  Job.validatePriority(priority);
  this.meta.priority = priority;
};


/**
 * Get Job data object
 *
 * @returns {object} data reference
 */
Job.prototype.getData = function() {
  return this.data;
};


/**
 * Set Job data
 *
 * @param {object} data
 * @throws {error}
 */
Job.prototype.setData = function(data) {
  if ('object' !== typeof data) throw new Error('data must be an object');
  this.data = data;
};


/**
 * Set status of Job
 *
 * @param {string} status
 * @throws {error}
 */
Job.prototype.setStatus = function(status) {
  var self = this;

  var statusIndex = Job.statuses.indexOf(status);
  if (-1 === statusIndex) throw new Error('invalid status');

  self.meta.status = status;

  var logIndex = null;

  self.meta.log.every(function(log, key) {
    if (status === log.status) {
      logIndex = key;
      return false;
    }
    else return true;
  });

  if (null !== logIndex) {
    self.meta.log[logIndex].date.push(new Date());
  } else {
    self.meta.log.push({
      status: status,
      date: [new Date()]
    });
  }
};


/**
 * Set job error
 *
 * Note: multiple errors can be set on a single job
 *
 * @param {Error} error
 * @throws error
 */
Job.prototype.setError = function(error) {
  var self = this;

  if (!(error instanceof Error)) throw new Error('error must be instance of Error');

  self.meta.error.push(error);
};


/**
 * Convert Job to JSON string
 *
 * @returns {string} job in JSON string format
 */
Job.prototype.toString = function() {
  return JSON.stringify({
    meta: this.meta,
    data: this.data
  });
};


module.exports = Job;