var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');


mockery.enable({
  useCleanCache: false,
  warnOnReplace: false,
  warnOnUnregistered: false
});

var Client = sinon.stub();
var Job = sinon.stub();

mockery.registerMock('./Client', Client);
mockery.registerMock('./Job', Job);


var nQueue = require('../');


describe('factory', function() {
  after(function() {
    mockery.deregisterAll();
  });

  afterEach(function() {
    Client.reset();
    Job.reset();
  });

  it('create client sans options', function(done) {
    var host = "127.0.0.1";
    var port = 6379;

    nQueue.createClient(host, port);

    sinon.assert.calledWithExactly(Client, host, port, sinon.match.string, sinon.match.object);

    done();
  });

  it('create client empty options', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var options = {};

    nQueue.createClient(host, port, options);

    sinon.assert.calledWithExactly(Client, host, port, sinon.match.string, options);

    done();
  });

  it('create client invalid options', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var options = ["a", "b", "c"];

    should.throws(function() {
      nQueue.createClient(host, port, options);
    });

    sinon.assert.notCalled(Client);

    done();
  });

  it('create client invalid host', function(done) {
    var host = 127001;
    var port = 6379;

    should.throws(function() {
      nQueue.createClient(host, port);
    });

    sinon.assert.notCalled(Client);

    done();
  });

  it('create client port string number', function(done) {
    var host = "127.0.0.1";
    var port = "6379";

    nQueue.createClient(host, port);

    sinon.assert.calledWithExactly(Client, host, port, sinon.match.string, sinon.match.object);

    done();
  });

  it('create client invalid port', function(done) {
    var host = "127.0.0.1";
    var port = [6379];

    should.throws(function() {
      nQueue.createClient(host, port);
    });

    sinon.assert.notCalled(Client);

    done();
  });

  it('create new job', function(done) {
    var job = nQueue.createJob();

    sinon.assert.calledOnce(Job);
    (job).should.be.instanceOf(Job);

    done();
  });

  it('create new job from string', function(done) {
    var jobString = 'job string';
    var job = nQueue.createJob(jobString);

    sinon.assert.calledOnce(Job);
    sinon.assert.calledWithExactly(Job, jobString);
    (job).should.be.instanceOf(Job);

    done();
  });
});