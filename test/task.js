var should = require('should');
var sinon = require('sinon');
var config = require('config');

var Task = require('../src/Task');


describe('task', function() {
  it('new task object task param', function(done) {
    var task = {meta: {/* meta in array */}, data: {/* data in array */}};

    task = new Task(task);

    (task.meta).should.be.eql(task.meta);
    (task.data).should.be.eql(task.data);

    done();
  });

  it('new task string task param', function(done) {
    var task = {meta: {/* meta in array */}, data: {/* data in array */}};
    var taskString = JSON.stringify(task);

    task = new Task(taskString);

    (task.meta).should.be.eql(task.meta);
    (task.data).should.be.eql(task.data);

    done();
  });

  it('new task invalid task param', function(done) {
    var task = [{/* meta in array */}, {/* data in array */}];

    task = new Task(task);

    (task.meta).should.not.eql(task[0]);
    (task.data).should.not.eql(task[1]);

    done();
  });

  it('to JSON string', function(done) {
    var task = {meta: {/* meta in array */}, data: {/* data in array */}};
    var taskString = JSON.stringify(task);

    task = new Task(task);

    var toString = task.toString();
    var stringify = JSON.stringify(task);

    (taskString).should.be.eql(toString);
    (taskString).should.be.eql(stringify);

    done();
  });
});