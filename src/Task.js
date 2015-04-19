/*
{
 meta: {
   attempts: {
    max: 3
   },
   sets: [
     {
      set: scheduled,
      date: Date
     },
     {
      set: queued,
      date: Date
     },
     {
      set: processing,
      date: Date,
      attempts: [
        // dates ...
      ]
     },
     {
      set: done,
      date: Date,
      errors: []
     }
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

  this.meta = ('object' === typeof task.meta && !Array.isArray(task.meta)) ? task.meta : {};
  this.data = ('object' === typeof task.data && !Array.isArray(task.data)) ? task.data : {};
}


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


Task.prototype.setAttempts = function() {
  // todo
};


Task.prototype.setData = function() {
  // todo
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