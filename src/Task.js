/**
 * Queue Task object
 *
 * Literal Object Structure:
 * {
 *  "meta" : {
 *    "schedule" : { ... },
 *    "sets" : [
 *      { "set" : "scheduled", "date" : [ date, ... ] },
 *      { "set" : "queued", "date" : [ date, ... ] },
 *      { "set" : "processing", "date" : [ date, ... ] },
 *      { "set" : "done", "date" : [ date, ... ] }
 *    ],
 *    "attempts" : { "max" : number },
 *    "holds" : { "duration" : number }
 *    "status" : string,
 *    "errors" : [ error, ... ]
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
      schedule: {}, // reserved for scheduler
      priority: Task.getPriorityScore('high'),
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


/**
 * Task Sets
 *
 * @type {string[]}
 */
Task.sets = ['scheduled', 'queued', 'processing', 'done'];


/**
 * Set Task number of Attempts
 *
 * @param {number} max
 */
Task.prototype.setAttempts = function(max) {
  if ('number' !== typeof max) throw new Error('attempts max must be a number');
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


/**
 * Gets Task Data object
 *
 * @returns {object} data reference
 */
Task.prototype.getData = function() {
  return this.data;
};


/**
 * Set Task Data
 *
 * @param {object} data
 */
Task.prototype.setData = function(data) {
  if ('object' !== typeof data) throw new Error('data must be an object');
  this.data = data;
};


/**
 * Push Set to Task or update existing Set
 * @param setName
 */
Task.prototype.pushSet = function(setName) {
  var self = this;

  var setIndex = Task.sets.indexOf(setName);
  if (-1 === setIndex) throw new Error('invalid set');

  var setsIndex = null;

  self.sets.every(function(key) {
    var taskSet = self.sets[key].set;

    if (setName === taskSet) {
      setIndex = key;
      return false;
    }
    else return true;
  });

  if (null !== setsIndex) {
    self.sets[setIndex].date.push(new Date());
  } else {
    self.sets.push({
      set: setName,
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