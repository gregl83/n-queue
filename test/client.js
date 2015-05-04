var EventEmitter = require('events').EventEmitter;

var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');

var Job = require('../src/Job');


mockery.enable({
  useCleanCache: false,
  warnOnReplace: false,
  warnOnUnregistered: false
});

var RedisMock = require('./support/RedisMock');

sinon.spy(RedisMock, "createClient");
mockery.registerMock('redis', RedisMock);


var Client = require('../src/Client');

sinon.stub(Client, 'getCommandSHA', function(command) {
  return '_' + command;
});


describe('client', function() {
  after(function() {
    mockery.deregisterAll();
  });

  afterEach(function() {
    RedisMock.createClient.reset();
  });

  it('new client redis server', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};
    var keyspace = 'nqueue:' + queue;

    var client = new Client(host, port, queue, {});

    RedisMock.createClient.calledWithExactly(host, port, options);

    (client).should.be.instanceOf(EventEmitter);
    (client.keyspace).should.be.eql(keyspace);

    done();
  });

  it('new client prefix options override', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};
    var keyspace = 'prefix:' + queue;

    var client = new Client(host, port, queue, {prefix: 'prefix'});

    RedisMock.createClient.calledWithExactly(host, port, options);

    (client).should.be.instanceOf(EventEmitter);
    (client.keyspace).should.be.eql(keyspace);

    done();
  });

  it('write job to queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var client = new Client(host, port, queue, options);

    var _write = sinon.spy(client, '_write');
    var evalsha = sinon.spy(client.store, 'evalsha');

    var job = new Job();

    job.setStatus('queued');

    client.write(job, function(err) {
      should(err).be.undefined;

      sinon.assert.calledOnce(_write);
      sinon.assert.calledWithExactly(_write, job, 'utf8', sinon.match.func);

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plpush', job.meta.status, job.meta.priority, job.toString()], sinon.match.func);

      done();
    });
  });

  it('write job array to queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var client = new Client(host, port, queue, options);

    var _write = sinon.spy(client, '_write');
    var evalsha = sinon.spy(client.store, 'evalsha');

    var jobs = [new Job(), new Job()];

    jobs[0].setStatus('scheduled');
    jobs[1].setStatus('queued');

    client.write(jobs, function(err) {
      should(err).be.undefined;

      sinon.assert.calledTwice(_write);
      sinon.assert.calledWithExactly(_write, jobs[0], 'utf8', sinon.match.func);
      sinon.assert.calledWithExactly(_write, jobs[1], 'utf8', sinon.match.func);

      sinon.assert.calledTwice(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plpush', jobs[0].meta.status, jobs[0].meta.priority, jobs[0].toString()], sinon.match.func);
      sinon.assert.calledWithExactly(evalsha, ['_plpush', jobs[1].meta.status, jobs[1].meta.priority, jobs[1].toString()], sinon.match.func);

      done();
    });
  });

  it('write invalid job to queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var client = new Client(host, port, queue, options);

    var error = sinon.spy();

    client.on('error', error);

    var jobs = 'invalid';

    client.write(jobs, function(err) {
      should(err).not.be.undefined;

      sinon.assert.calledOnce(error);
      sinon.assert.calledWith(error, sinon.match.instanceOf(Error));

      done();
    });
  });

  it('read job from queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var source = 'queued';
    var destination = 'processing';

    var client = new Client(host, port, queue, options);

    var job = new Job();
    job.setStatus(source);
    var jobString = job.toString();

    var _read = sinon.spy(client, '_read');
    var evalsha = sinon.stub(client.store, 'evalsha').callsArgWith(1, null, jobString);
    var _push = sinon.spy(client, '_push');

    client.read(source, destination);

    sinon.assert.calledOnce(_read);
    sinon.assert.calledWithExactly(_read, source, destination);

    sinon.assert.calledOnce(evalsha);
    sinon.assert.calledWithExactly(evalsha, ['_prpoplpush', 2, source, destination, 'critical', 'high', 'medium', 'low'], sinon.match.func);

    sinon.assert.calledOnce(_push);
    sinon.assert.calledWithExactly(_push, jobString);

    done();
  });

  // todo readJobs tests
});