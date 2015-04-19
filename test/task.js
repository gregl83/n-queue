var should = require('should');
var sinon = require('sinon');
var config = require('config');

var Task = require('../src/Task');


describe('task', function() {
  it('new task', function(done) {
    var task = new Task();

    (task.meta).should.be.eql({});
    (task.data).should.be.eql({});

    done();
  });

  it('new task object task param', function(done) {
    var oldTask = {meta: {/* meta in array */}, data: {/* data in array */}};

    var task = new Task(oldTask);

    (task.meta).should.be.eql(oldTask.meta);
    (task.data).should.be.eql(oldTask.data);

    done();
  });

  it('new task string task param', function(done) {
    var oldTask = {meta: {/* meta in array */}, data: {/* data in array */}};
    var taskString = JSON.stringify(oldTask);

    var task = new Task(taskString);

    (task.meta).should.be.eql(oldTask.meta);
    (task.data).should.be.eql(oldTask.data);

    done();
  });

  it('new task invalid task param', function(done) {
    var oldTask = [{type: "meta" /* meta in array */}, {type: "data" /* data in array */}];

    var task = new Task(oldTask);

    (task.meta).should.not.eql(oldTask[0]);
    (task.data).should.not.eql(oldTask[1]);

    done();
  });

  it('to JSON string', function(done) {
    var oldTask = {meta: {/* meta in array */}, data: {/* data in array */}};
    var taskString = JSON.stringify(oldTask);

    var task = new Task(oldTask);

    var toString = task.toString();
    var stringify = JSON.stringify(task);

    (taskString).should.be.eql(toString);
    (taskString).should.be.eql(stringify);

    done();
  });
});