/**
 * Queue Task object
 *
 * Literal Object Structure:
 * {
 *  "meta" : {
 *    "schedule" : { ... },
 *    "sets" : [
 *      { "set" : "scheduled", "date" : [ date, ... ]},
 *      { "set" : "queued", "date" : [ date, ... ]},
 *      { "set" : "processing", "date" : [ date, ... ]},
 *      { "set" : "done", "date" : [ date, ... ]}
 *    ],
 *    "attempts" : { "max" : number },
 *    "holds" : { "duration" : number }
 *    "status" : string,
 *    "errors" : [ error, ... ]
 *
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

  if ('object' === typeof task.meta && !Array.isArray(task.meta)) this.meta = task.meta;
  else {
    this.meta = {
      schedule: {}, // reserved for scheduler
      priority: 20,
      sets: [],
      attempts: {max: 3},
      holds: {duration: 600},
      status: 'new',
      errors: []
    };
  }

  this.data = ('object' === typeof task.data && !Array.isArray(task.data)) ? task.data : {};
}


/**
 * String Priority to numerical Sorted Set Score
 *
 * @type {{critical: number, high: number, medium: number, low: number}}
 */
Task.priorityScores = {
  'critical': 25,
  'high': 50, // default
  'medium': 75,
  'low': 100
};


/**
 * Get a Priority Score for a string Priority label (critical, high, medium, low)
 *
 * @param {string} priority
 * @returns {number}
 */
Task.getPriorityScore = function(priority) {
  if ('undefined' !== typeof Task.priorityScores[priority]) return Task.priorityScores[priority];
  return Task.priorityScores['high'];
};


// sets


Task.createScheduledSet = function() {
  // todo
};


Task.createQueuedSet = function() {
  // todo
};


Task.createProcessingSet = function() {
  // todo
};


Task.createDoneSet = function() {
  // todo
};


// methods


Task.prototype.setAttempts = function(max) {
  this.meta.attempts.max = max;
};


/**
 * Sets the Task Priority
 *
 * @param {string|number} priority
 */
Task.prototype.setPriority = function(priority) {
  if ('number' === typeof priority) this.meta.priority = Task.getPriorityScore(priority);
  else this.meta.priority = Task.getPriorityScore(priority);
};


// reference
Task.prototype.getData = function() {
  return this.data;
};


Task.prototype.setData = function(data) {
  // todo type check
  this.data = data;
};


Task.prototype.pushSet = function() {
  // todo
};


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