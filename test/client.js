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

mockery.registerMock('n-redis-commands', function(command) {
  return '_' + command;
});

var Client = require('../src/Client');


var sandbox;

describe('client', function() {
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  after(function() {
    mockery.deregisterAll();
  });

  afterEach(function() {
    RedisMock.createClient.reset();
    sandbox.restore();
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

  it('write data to queue', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, undefined);

    var job = new Job();
    job.setStatus('queued');

    client.write('queued', job.meta.priority, job, 'utf8', function(err) {
      should(err).be.undefined;

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plpush', 2, 'queued', job.meta.priority, job.toString()], sinon.match.func);

      done();
    });
  });

  it('enqueue job', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var write = sandbox.spy(client, 'write');
    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, undefined);

    var job = new Job();

    client.enqueueJobs(job, function(err) {
      should(err).be.undefined;

      sinon.assert.calledOnce(write);
      sinon.assert.calledWithExactly(write, 'queued', 'medium', job, 'utf8', sinon.match.func);

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plpush', 2, 'queued', job.meta.priority, job.toString()], sinon.match.func);

      done();
    });
  });

  it('enqueue job array', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var write = sandbox.spy(client, 'write');
    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, undefined);

    var jobs = [new Job(), new Job()];

    client.enqueueJobs(jobs, function(err) {
      should(err).be.undefined;

      sinon.assert.calledTwice(write);
      sinon.assert.calledWithExactly(write, 'queued', jobs[0].meta.priority, jobs[0], 'utf8', sinon.match.func);
      sinon.assert.calledWithExactly(write, 'queued', jobs[1].meta.priority, jobs[1], 'utf8', sinon.match.func);

      sinon.assert.calledTwice(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plpush', 2, 'queued', jobs[0].meta.priority, jobs[0].toString()], sinon.match.func);
      sinon.assert.calledWithExactly(evalsha, ['_plpush', 2, 'queued', jobs[1].meta.priority, jobs[1].toString()], sinon.match.func);

      done();
    });
  });

  it('enqueue invalid job', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var error = sinon.spy();
    client.on('error', error);

    var jobs = 'invalid';

    client.enqueueJobs(jobs, function(err) {
      should(err).not.be.undefined;

      sinon.assert.calledOnce(error);
      sinon.assert.calledWith(error, sinon.match.instanceOf(Error));

      done();
    });
  });

  it('enqueue job evalsha error', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var error = new Error('evalsha error');

    var write = sandbox.spy(client, 'write');
    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, error);

    var onError = sinon.spy();
    client.on('error', onError);

    var job = new Job();

    client.enqueueJobs(job, function(err) {
      should(err).not.be.undefined;

      sinon.assert.calledOnce(write);
      sinon.assert.calledWithExactly(write, 'queued', job.meta.priority, job, 'utf8', sinon.match.func);

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plpush', 2, 'queued', job.meta.priority, job.toString()], sinon.match.func);

      sinon.assert.calledOnce(onError);
      sinon.assert.calledWithExactly(onError, sinon.match.instanceOf(Error));

      done();
    });
  });

  it('read data from queue', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, undefined, 'data');

    client.read('queued', 'processing', function(err, res) {
      should(err).be.undefined;
      (res).should.be.eql('data');

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_prpoplpush', 6, 'queued', 'processing', 'critical', 'high', 'medium', 'low'], sinon.match.func);

      done();
    });
  });


  it('dequeue job', function(done) {
    var source = 'queued';
    var destination = 'processing';

    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var job = new Job();
    job.setStatus(source);

    var read = sandbox.spy(client, 'read');
    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, null, job.toString());
    var _push = sandbox.spy(client, '_push');

    var onData = sinon.spy();
    client.on('data', onData);

    var onError = sinon.spy();
    client.on('error', onError);

    client.dequeueJob(source, destination);

    sinon.assert.calledOnce(read);
    sinon.assert.calledWithExactly(read, source, destination, sinon.match.func);

    sinon.assert.calledOnce(evalsha);
    sinon.assert.calledWithExactly(evalsha, ['_prpoplpush', 6, source, destination, 'critical', 'high', 'medium', 'low'], sinon.match.func);

    sinon.assert.calledOnce(_push);
    sinon.assert.calledWithExactly(_push, sinon.match(JSON.parse(job)));

    sinon.assert.calledOnce(onData);
    sinon.assert.calledWithExactly(onData, sinon.match(JSON.parse(job)));

    sinon.assert.notCalled(onError);

    done();
  });

  it('dequeue empty queue', function(done) {
    var source = 'queued';
    var destination = 'processing';

    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, null, null);

    var onData = sinon.spy();
    client.on('data', onData);

    var onError = sinon.spy();
    client.on('error', onError);

    var onEnd = sinon.spy();
    client.on('end', onEnd);

    client.dequeueJob(source, destination);

    sinon.assert.notCalled(onData);

    sinon.assert.notCalled(onError);

    sinon.assert.calledOnce(onEnd);

    done();
  });

  it('dequeue evalsha error', function(done) {
    var source = 'queued';
    var destination = 'processing';

    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var error = new Error('evalsha error');
    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, error);

    var onData = sinon.spy();
    client.on('data', onData);

    var onError = sinon.spy();
    client.on('error', onError);

    var onEnd = sinon.spy();
    client.on('end', onEnd);

    client.dequeueJob(source, destination);

    sinon.assert.notCalled(onData);

    sinon.assert.calledOnce(onError);
    sinon.assert.calledWith(onError, sinon.match.instanceOf(Error));

    sinon.assert.calledOnce(onEnd);

    done();
  });

  it('pipe data in queue', function(done) {
    var source = 'processing';
    var destination = 'done';

    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, undefined, 1);

    var job = new Job();

    var onError = sinon.spy();
    client.on('error', onError);

    client.pipe(source, destination, job.meta.priority, job, function(err, res) {
      should(err).be.undefined;
      (res).should.be.zero;

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plremlpush', 3, source, destination, job.meta.priority, 0, job], sinon.match.func);

      sinon.assert.notCalled(onError);

      done();
    });
  });

  it('close job', function(done) {
    var source = 'processing';
    var destination = 'done';

    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var job = new Job();

    var setPriority = sandbox.stub(job, 'setPriority');
    var pipe = sandbox.spy(client, 'pipe');
    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, null, 1);

    var onError = sinon.spy();
    client.on('error', onError);

    client.closeJob(job, function(err, data) {
      should(err).be.null;
      (data).should.be.one;

      sinon.assert.calledOnce(setPriority);
      sinon.assert.calledWithExactly(setPriority, 'success');

      sinon.assert.calledOnce(pipe);
      sinon.assert.calledWithExactly(pipe, source, destination, job.meta.priority, job, sinon.match.func);

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plremlpush', 3, source, destination, job.meta.priority, 0, job], sinon.match.func);

      sinon.assert.notCalled(onError);

      done();
    });
  });

  it('close job with error', function(done) {
    var source = 'processing';
    var destination = 'done';

    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var error = new Error('job error');

    var job = new Job();
    job.setError(error);

    var setPriority = sandbox.stub(job, 'setPriority');
    var pipe = sandbox.spy(client, 'pipe');
    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, null, 1);

    var onError = sinon.spy();
    client.on('error', onError);

    client.closeJob(job, function(err, data) {
      should(err).be.null;
      (data).should.be.one;

      sinon.assert.calledOnce(setPriority);
      sinon.assert.calledWithExactly(setPriority, 'fail');

      sinon.assert.calledOnce(pipe);
      sinon.assert.calledWithExactly(pipe, source, destination, job.meta.priority, job, sinon.match.func);

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plremlpush', 3, source, destination, job.meta.priority, 0, job], sinon.match.func);

      sinon.assert.notCalled(onError);

      done();
    });
  });

  it('close invalid job', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var job = 'invalid';

    var pipe = sandbox.spy(client, 'pipe');
    var evalsha = sandbox.stub(client._store, 'evalsha');

    var onError = sinon.spy();
    client.on('error', onError);

    client.closeJob(job, function(err, data) {
      (err).should.be.error;
      should(data).be.undefined;

      sinon.assert.notCalled(pipe);

      sinon.assert.notCalled(evalsha);

      sinon.assert.notCalled(onError);

      done();
    });
  });

  it('close job evalsha error', function(done) {
    var source = 'processing';
    var destination = 'done';

    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var job = new Job();

    var error = new Error('pipe error');

    var pipe = sandbox.spy(client, 'pipe');
    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, error, 0);

    var onError = sinon.spy();
    client.on('error', onError);

    client.closeJob(job, function(err, data) {
      (err).should.be.eql(error);
      (data).should.be.zero;

      sinon.assert.calledOnce(pipe);
      sinon.assert.calledWithExactly(pipe, source, destination, job.meta.priority, job, sinon.match.func);

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_plremlpush', 3, source, destination, job.meta.priority, 0, job], sinon.match.func);

      sinon.assert.calledOnce(onError);

      done();
    });
  });

  it('get size of queue', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, undefined, 1);

    var onError = sinon.spy();
    client.on('error', onError);

    client.size('queued', function(err, res) {
      should(err).be.undefined;
      (res).should.be.one;

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_pllen', 5, 'queued', 'critical', 'high', 'medium', 'low'], sinon.match.func);

      sinon.assert.notCalled(onError);

      done();
    });
  });

  it('get status', function(done) {
    var stats = {'queued': ['critical', 100, 'high', 75, 'medium', 50, 'low', 25]};

    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var evalsha = sandbox.stub(client._store, 'evalsha');
    evalsha.onFirstCall().callsArgWith(1, undefined, stats['queued']);

    var onStatus = sinon.spy();
    client.on('status', onStatus);

    var onError = sinon.spy();
    client.on('error', onError);

    client.getStatus('queued', function(err, status) {
      should(err).be.undefined;

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_pllen', 5, 'queued', 'critical', 'high', 'medium', 'low'], sinon.match.func);

      sinon.assert.calledOnce(onStatus);
      sinon.assert.calledWithExactly(onStatus, status);

      sinon.assert.notCalled(onError);

      should.deepEqual(status, {
        queued: {critical: stats['queued'][1], high: stats['queued'][3], medium: stats['queued'][5], low: stats['queued'][7]}
      });

      done();
    });
  });

  it('get status error', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var error = new Error('evalsha error');

    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, error);

    var onStatus = sinon.spy();
    client.on('status', onStatus);

    var onError = sinon.spy();
    client.on('error', onError);

    client.getStatus('queued', function(err, status) {
      should(err).not.be.undefined;

      sinon.assert.calledOnce(evalsha);
      sinon.assert.calledWithExactly(evalsha, ['_pllen', 5, 'queued', 'critical', 'high', 'medium', 'low'], sinon.match.func);

      sinon.assert.notCalled(onStatus);

      sinon.assert.calledOnce(onError);
      sinon.assert.calledWithExactly(onError, sinon.match.instanceOf(Error));

      done();
    });
  });

  it('get statuses', function(done) {
    var sources = ['queued', 'processing', 'done'];

    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var evalsha = sandbox.stub(client._store, 'evalsha').callsArgWith(1, undefined, []);

    var onStatus = sinon.spy();
    client.on('status', onStatus);

    var onError = sinon.spy();
    client.on('error', onError);

    client.getStatus(sources, function(err, status) {
      should(err).be.undefined;

      sinon.assert.calledThrice(evalsha);

      sinon.assert.calledOnce(onStatus);
      sinon.assert.calledWithExactly(onStatus, status);

      sinon.assert.notCalled(onError);

      done();
    });
  });

  it('close', function(done) {
    var client = new Client("127.0.0.1", 6379, 'queue', {});

    var quit = sandbox.stub(client._store, 'quit');

    var onError = sinon.spy();
    client.on('error', onError);

    var onEnd = sinon.spy();
    client.on('end', onEnd);

    client.close();

    sinon.assert.notCalled(onError);
    sinon.assert.calledOnce(onEnd);

    sinon.assert.calledOnce(quit);

    done();
  });
});