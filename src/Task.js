/*
{
 meta: {
   schedule: {
    // schedule options...
   },
   sets: [
     {
      set: scheduled,
      date: [
        // Date
      ]
     },
     {
      set: queued,
      date: [
        // Date
      ]
     },
     {
      set: processing,
      date: [
        // Date
      ]
     },
     {
      set: done,
      date: Date
     }
   ],
   attempts: {
    max: number
   },
   holds: {
    duration: number
   },
   status: string,
   errors: [
    // Error
   ]
 },
 data: {
  // ...
 }
}
 */


/**
 * Queue Task object
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
      schedule: {},
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


Task.prototype.setPriority = function(priority) {
  // todo support strings (human readable)
  this.meta.priority = priority;
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