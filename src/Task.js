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
      date: Date
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
  if ('string' === typeof task) task = JSON.encode(task);
  else if ('object' !== typeof task || Array.isArray(task)) task = {};

  this.meta = ('object' === typeof task.meta && !Array.isArray(task.meta)) ? task.meta : {};
  this.data = ('object' === typeof task.data && !Array.isArray(task.data)) ? task.data : {};
}


/**
 * Convert Task to JSON string
 *
 * @returns {string} task in JSON string format
 */
Task.prototype.toString = Task.prototype.toJSON = function() {
  return JSON.toString({
    meta: this.meta,
    data: this.data
  });
};


module.exports = Task;