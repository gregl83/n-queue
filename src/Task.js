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

  this.meta = ('object' === typeof task.meta && !Array.isArray(task.meta)) ? task.meta : {};
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


Task.prototype.setAttempts = function() {
  // todo
};


Task.prototype.setPriority = function() {
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