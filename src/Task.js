var uuid = require('node-uuid');


/**
 * Queue Task object
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
 * @param {string} task in JSON string format
 * @constructor
 */
function Task(task) {
  if ('string' === typeof task) task = JSON.parse(task);
  else if ('object' !== typeof task || Array.isArray(task)) task = {};

  // todo consider making ALL the meta properties optional
  if ('object' === typeof task.meta && !Array.isArray(task.meta)) this.meta = task.meta;
  else {
    this.meta = {
      id: Task.getID(),
      schedule: {}, // reserved for scheduler
      priority: 'medium',
      attempt: {max: 3},
      hold: {duration: 600},
      status: null,
      log: [],
      error: []
    };
  }

  this.data = ('object' === typeof task.data && !Array.isArray(task.data)) ? task.data : {};
}


/**
 * Get Unique Task ID
 * Note: RFC4122 v1 UUID is generated using node-uuid module
 *
 * @returns {string}
 */
Task.getID = function() {
  return uuid.v1();
};


/**
 * Valid Task Priorities
 *
 * @type {string}[]
 */
Task.priorities = [
  'critical',
  'high', // default
  'medium',
  'low'
];


/**
 * Validate Task Priority (critical, high, medium, low)
 *
 * @param {string} priority
 * @throws {error}
 */
Task.validatePriority = function(priority) {
  if (-1 === Task.priorities.indexOf(priority)) throw new Error('invalid priority');
};


/**
 * Task Statuses
 *
 * @type {string[]}
 */
Task.statuses = ['scheduled', 'queued', 'processing', 'done'];


/**
 * Set Task attempt maximum
 *
 * @param {number} max
 * @throws {error}
 */
Task.prototype.setAttempt = function(max) {
  if ('number' !== typeof max) throw new Error('attempt max must be a number');
  this.meta.attempt.max = max;
};


/**
 * Set Task priority
 *
 * @param {string|number} priority
 */
Task.prototype.setPriority = function(priority) {
  Task.validatePriority(priority);
  this.meta.priority = priority;
};


/**
 * Get Task data object
 *
 * @returns {object} data reference
 */
Task.prototype.getData = function() {
  return this.data;
};


/**
 * Set Task data
 *
 * @param {object} data
 * @throws {error}
 */
Task.prototype.setData = function(data) {
  if ('object' !== typeof data) throw new Error('data must be an object');
  this.data = data;
};


/**
 * Set status of Task
 *
 * @param {string} status
 * @throws {error}
 */
Task.prototype.setStatus = function(status) {
  var self = this;

  var statusIndex = Task.statuses.indexOf(status);
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


// todo build task statuses


/**
 * Convert Task to JSON string
 *
 * @returns {string} task in JSON string format
 */
Task.prototype.toString = function() {
  return JSON.stringify({
    meta: this.meta,
    data: this.data
  });
};


module.exports = Task;