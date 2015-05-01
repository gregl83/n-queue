var should = require('should');
var sinon = require('sinon');

var Task = require('../src/Task');


describe('task', function() {
  it('new task sans args', function(done) {
    var task = new Task();

    (task.meta).should.be.instanceOf(Object);
    (task.data).should.be.eql({});

    done();
  });

  it('new task object task arg', function(done) {
    var oldTask = {meta: {type: "meta" /* meta in array */}, data: {type: "data" /* data in array */}};

    var task = new Task(oldTask);

    (task.meta).should.be.eql(oldTask.meta);
    (task.data).should.be.eql(oldTask.data);

    done();
  });

  it('new task string task arg', function(done) {
    var oldTask = {meta: {type: "meta" /* meta in array */}, data: {type: "data" /* data in array */}};
    var taskString = JSON.stringify(oldTask);

    var task = new Task(taskString);

    (task.meta).should.be.eql(oldTask.meta);
    (task.data).should.be.eql(oldTask.data);

    done();
  });

  it('new task invalid task arg', function(done) {
    var oldTask = [{type: "meta" /* meta in array */}, {type: "data" /* data in array */}]; // array not supported

    var task = new Task(oldTask);

    (task.meta).should.not.eql(oldTask[0]);
    (task.data).should.not.eql(oldTask[1]);

    done();
  });

  it('set attempt', function(done) {
    var task = new Task();

    var newAttempt = 305;

    (task.meta.attempt.max).should.not.eql(newAttempt);

    task.setAttempt(newAttempt);

    (task.meta.attempt.max).should.be.eql(newAttempt);

    done();
  });

  it('set attempt max invalid', function(done) {
    var task = new Task();

    var newAttempt = '305';

    should.throws(function() {
      task.setAttempt(newAttempt);
    });

    done();
  });

  it('set priority', function(done) {
    var task = new Task();

    var newPriority = 'low';

    (task.meta.priority).should.not.eql(newPriority);

    task.setPriority(newPriority);

    (task.meta.priority).should.be.eql(newPriority);

    done();
  });

  it('set invalid priority', function(done) {
    var task = new Task();

    var newPriorityString = 'invalid'; // hardcoded

    should.throws(function() {
      task.setPriority(newPriorityString);
    });

    done();
  });

  it('get data reference', function(done) {
    var oldTask = {meta: {type: "meta" /* meta in array */}, data: {type: "data" /* data in array */}};

    var task = new Task(oldTask);

    var dataReference = task.getData();

    (dataReference).should.be.eql(oldTask.data);

    dataReference.referenceChange = true;

    (task.data).should.not.eql({type: "data" /* data in array */}); // copied oldTask data due to pass reference

    done();
  });

  it('set data', function(done) {
    var oldTask = {meta: {type: "meta" /* meta in array */}, data: {type: "data" /* data in array */}};

    var task = new Task(oldTask);

    (task.data).should.be.eql(oldTask.data);

    task.setData({});

    (task.data).should.not.eql(oldTask.data);

    done();
  });

  it('set invalid data', function(done) {
    var task = new Task();

    var newData = 'invalid';

    should.throws(function() {
      task.setDate(newData);
    });

    done();
  });

  it('set status', function(done) {
    var task = new Task();

    var statusA = 'scheduled';
    var statusB = 'queued';

    task.setStatus(statusA);

    (task.meta.status).should.be.eql(statusA);
    (task.meta.log).should.have.length(1);
    (task.meta.log[0].status).should.be.eql(statusA);

    task.setStatus(statusB);

    (task.meta.status).should.be.eql(statusB);
    (task.meta.log).should.have.length(2);
    (task.meta.log[1].status).should.be.eql(statusB);

    done();
  });

  it('set existing status', function(done) {
    var task = new Task();

    var status = 'scheduled';

    task.setStatus(status);
    task.setStatus(status);

    (task.meta.status).should.be.eql(status);
    (task.meta.log[0].status).should.be.eql(status);
    (task.meta.log[0].date).should.have.length(2);

    done();
  });

  it('set invalid status', function(done) {
    var task = new Task();

    var status = 'invalid';

    should.throws(function() {
      task.setStatus(status);
    });

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