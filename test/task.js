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
    var oldTask = {meta: {/* meta in array */}, data: {/* data in array */}};

    var task = new Task(oldTask);

    (task.meta).should.be.eql(oldTask.meta);
    (task.data).should.be.eql(oldTask.data);

    done();
  });

  it('new task string task arg', function(done) {
    var oldTask = {meta: {/* meta in array */}, data: {/* data in array */}};
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

  it('set attempts', function(done) {
    var task = new Task();

    var newAttempts = 305;

    (task.meta.attempts.max).should.not.eql(newAttempts);

    task.setAttempts(newAttempts);

    (task.meta.attempts.max).should.be.eql(newAttempts);

    done();
  });

  it('set attempts max invalid', function(done) {
    var task = new Task();

    var newAttempts = '305';

    should.throws(function() {
      task.setAttempts(newAttempts);
    });

    done();
  });

  it('set priority', function(done) {
    var task = new Task();

    var newPriority = 25;

    (task.meta.priority).should.not.eql(newPriority);

    task.setPriority(newPriority);

    (task.meta.priority).should.be.eql(newPriority);

    done();
  });

  it('set priority string', function(done) {
    var task = new Task();

    var newPriority = 25;
    var newPriorityString = 'critical'; // hardcoded

    (task.meta.priority).should.not.eql(newPriority);

    task.setPriority(newPriorityString);

    (task.meta.priority).should.be.eql(newPriority);

    done();
  });

  it('set priority invalid string', function(done) {
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


  it('push one set', function(done) {
    var task = new Task();

    var setName = 'scheduled';

    task.pushSet(setName);

    (task.meta.sets[0].set).should.be.eql(setName);

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