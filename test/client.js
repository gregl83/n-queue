var Duplex = require('stream').Duplex;

var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');

var Task = require('../src/Task');


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

    (client).should.be.instanceOf(Duplex);
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

    (client).should.be.instanceOf(Duplex);
    (client.keyspace).should.be.eql(keyspace);

    done();
  });

  it('push task to queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var client = new Client(host, port, queue, options);

    var write = sinon.spy(client, 'write');
    var _write = sinon.spy(client, '_write');
    var _plpush = sinon.spy(client.store, '_plpush');

    var task = new Task();

    task.setStatus('queued');

    client.pushTasks(task, function(err) {
      should(err).be.undefined;

      sinon.assert.calledOnce(write);
      sinon.assert.calledWithExactly(write, task, sinon.match.func);

      sinon.assert.calledOnce(_write);
      sinon.assert.calledWithExactly(_write, task, 'utf8', sinon.match.func);

      sinon.assert.calledOnce(_plpush);
      sinon.assert.calledWithExactly(_plpush, [task.meta.status, task.meta.priority, task.toString()], sinon.match.func);

      done();
    });
  });

  it('push task array to queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var client = new Client(host, port, queue, options);

    var write = sinon.spy(client, 'write');
    var _write = sinon.spy(client, '_write');
    var _plpush = sinon.spy(client.store, '_plpush');

    var tasks = [new Task(), new Task()];

    tasks[0].setStatus('scheduled');
    tasks[1].setStatus('queued');

    client.pushTasks(tasks, function(err) {
      should(err).be.undefined;

      sinon.assert.calledTwice(write);
      sinon.assert.calledWithExactly(write, tasks[0], sinon.match.func);
      sinon.assert.calledWithExactly(write, tasks[1], sinon.match.func);

      sinon.assert.calledTwice(_write);
      sinon.assert.calledWithExactly(_write, tasks[0], 'utf8', sinon.match.func);
      sinon.assert.calledWithExactly(_write, tasks[1], 'utf8', sinon.match.func);

      sinon.assert.calledTwice(_plpush);
      sinon.assert.calledWithExactly(_plpush, [tasks[0].meta.status, tasks[0].meta.priority, tasks[0].toString()], sinon.match.func);
      sinon.assert.calledWithExactly(_plpush, [tasks[1].meta.status, tasks[1].meta.priority, tasks[1].toString()], sinon.match.func);

      done();
    });
  });

  it('push invalid task to queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var client = new Client(host, port, queue, options);

    var error = sinon.spy();

    client.on('error', error);

    var tasks = 'invalid';

    client.pushTasks(tasks, function(err) {
      should(err).not.be.undefined;

      sinon.assert.calledOnce(error);
      sinon.assert.calledWith(error, sinon.match.instanceOf(Error));

      done();
    });
  });

  // todo readTasks tests
});