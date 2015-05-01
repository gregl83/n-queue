var should = require('should');

var Job = require('../src/Job');


describe('job', function() {
  it('new job sans args', function(done) {
    var job = new Job();

    (job.meta).should.be.instanceOf(Object);
    (job.data).should.be.eql({});

    done();
  });

  it('new job object job arg', function(done) {
    var oldJob = {meta: {type: "meta" /* meta in array */}, data: {type: "data" /* data in array */}};

    var job = new Job(oldJob);

    (job.meta).should.be.eql(oldJob.meta);
    (job.data).should.be.eql(oldJob.data);

    done();
  });

  it('new job string job arg', function(done) {
    var oldJob = {meta: {type: "meta" /* meta in array */}, data: {type: "data" /* data in array */}};
    var jobString = JSON.stringify(oldJob);

    var job = new Job(jobString);

    (job.meta).should.be.eql(oldJob.meta);
    (job.data).should.be.eql(oldJob.data);

    done();
  });

  it('new job invalid job arg', function(done) {
    var oldJob = [{type: "meta" /* meta in array */}, {type: "data" /* data in array */}]; // array not supported

    var job = new Job(oldJob);

    (job.meta).should.not.eql(oldJob[0]);
    (job.data).should.not.eql(oldJob[1]);

    done();
  });

  it('set attempt', function(done) {
    var job = new Job();

    var newAttempt = 305;

    (job.meta.attempt.max).should.not.eql(newAttempt);

    job.setAttempt(newAttempt);

    (job.meta.attempt.max).should.be.eql(newAttempt);

    done();
  });

  it('set attempt max invalid', function(done) {
    var job = new Job();

    var newAttempt = '305';

    should.throws(function() {
      job.setAttempt(newAttempt);
    });

    done();
  });

  it('set priority', function(done) {
    var job = new Job();

    var newPriority = 'low';

    (job.meta.priority).should.not.eql(newPriority);

    job.setPriority(newPriority);

    (job.meta.priority).should.be.eql(newPriority);

    done();
  });

  it('set invalid priority', function(done) {
    var job = new Job();

    var newPriorityString = 'invalid'; // hardcoded

    should.throws(function() {
      job.setPriority(newPriorityString);
    });

    done();
  });

  it('get data reference', function(done) {
    var oldJob = {meta: {type: "meta" /* meta in array */}, data: {type: "data" /* data in array */}};

    var job = new Job(oldJob);

    var dataReference = job.getData();

    (dataReference).should.be.eql(oldJob.data);

    dataReference.referenceChange = true;

    (job.data).should.not.eql({type: "data" /* data in array */}); // copied oldJob data due to pass reference

    done();
  });

  it('set data', function(done) {
    var oldJob = {meta: {type: "meta" /* meta in array */}, data: {type: "data" /* data in array */}};

    var job = new Job(oldJob);

    (job.data).should.be.eql(oldJob.data);

    job.setData({});

    (job.data).should.not.eql(oldJob.data);

    done();
  });

  it('set invalid data', function(done) {
    var job = new Job();

    var newData = 'invalid';

    should.throws(function() {
      job.setDate(newData);
    });

    done();
  });

  it('set status', function(done) {
    var job = new Job();

    var statusA = 'scheduled';
    var statusB = 'queued';

    job.setStatus(statusA);

    (job.meta.status).should.be.eql(statusA);
    (job.meta.log).should.have.length(1);
    (job.meta.log[0].status).should.be.eql(statusA);

    job.setStatus(statusB);

    (job.meta.status).should.be.eql(statusB);
    (job.meta.log).should.have.length(2);
    (job.meta.log[1].status).should.be.eql(statusB);

    done();
  });

  it('set existing status', function(done) {
    var job = new Job();

    var status = 'scheduled';

    job.setStatus(status);
    job.setStatus(status);

    (job.meta.status).should.be.eql(status);
    (job.meta.log[0].status).should.be.eql(status);
    (job.meta.log[0].date).should.have.length(2);

    done();
  });

  it('set invalid status', function(done) {
    var job = new Job();

    var status = 'invalid';

    should.throws(function() {
      job.setStatus(status);
    });

    done();
  });

  it('to JSON string', function(done) {
    var oldJob = {meta: {/* meta in array */}, data: {/* data in array */}};
    var jobString = JSON.stringify(oldJob);

    var job = new Job(oldJob);

    var toString = job.toString();
    var stringify = JSON.stringify(job);

    (jobString).should.be.eql(toString);
    (jobString).should.be.eql(stringify);

    done();
  });
});