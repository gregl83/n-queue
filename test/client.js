var Buffer = require('buffer').Buffer;
var Duplex = require('stream').Duplex;

var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');

var Task = require('../src/Task');


mockery.enable({
  useCleanCache: true,
  warnOnReplace: false,
  warnOnUnregistered: false
});

var RedisMock = require('./support/RedisMock');
var redisMock = new RedisMock();

sinon.spy(redisMock, "createClient");
mockery.registerMock('redis', redisMock);


var Client = require('../src/Client');


describe('client', function() {
  after(function() {
    mockery.deregisterAll();
  });

  afterEach(function() {
    redisMock.createClient.reset();
  });

  it('new client redis server', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};
    var keyspace = 'nqueue:' + queue;

    var client = new Client(host, port, queue, {});

    redisMock.createClient.calledWithExactly(host, port, options);

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

    redisMock.createClient.calledWithExactly(host, port, options);

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

    var _pushTask = sinon.spy(client, '_pushTask');
    var write = sinon.spy(client, 'write');
    var _write = sinon.spy(client, '_write');

    var task = new Task();

    task.pushSet('queued');

    client.pushTasks(task, function(err) {
      should(err).be.undefined;

      sinon.assert.calledOnce(_pushTask);
      sinon.assert.calledWithExactly(_pushTask, JSON.stringify(task), sinon.match.func);

      sinon.assert.calledOnce(write);
      sinon.assert.calledWithExactly(write, JSON.stringify(task), 'utf8', sinon.match.func);

      sinon.assert.calledOnce(_write);
      sinon.assert.calledWithExactly(_write, sinon.match.instanceOf(Buffer), 'buffer', sinon.match.func);

      done();
    });
  });

  it('push task array to queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var client = new Client(host, port, queue, options);

    var _pushTask = sinon.spy(client, '_pushTask');
    var write = sinon.spy(client, 'write');
    var _write = sinon.spy(client, '_write');

    var tasks = [new Task(), new Task()];

    tasks[0].pushSet('scheduled');
    tasks[1].pushSet('queued');

    client.pushTasks(tasks, function(err) {
      should(err).be.undefined;

      sinon.assert.calledTwice(_pushTask);
      sinon.assert.calledWithExactly(_pushTask, JSON.stringify(tasks[0]), sinon.match.func);
      sinon.assert.calledWithExactly(_pushTask, JSON.stringify(tasks[1]), sinon.match.func);

      sinon.assert.calledTwice(write);
      sinon.assert.calledWithExactly(write, JSON.stringify(tasks[0]), 'utf8', sinon.match.func);
      sinon.assert.calledWithExactly(write, JSON.stringify(tasks[1]), 'utf8', sinon.match.func);

      sinon.assert.calledTwice(_write);
      sinon.assert.calledWithExactly(_write, sinon.match.instanceOf(Buffer), 'buffer', sinon.match.func);
      sinon.assert.calledWithExactly(_write, sinon.match.instanceOf(Buffer), 'buffer', sinon.match.func);

      done();
    });
  });

  it('push task to queue _write error', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var client = new Client(host, port, queue, options);

    var error = new Error('error pushing task to queue');

    var write = sinon.stub(client, 'write');

    write.callsArgWith(2, error);

    var tasks = {/* task data */};

    client.pushTasks(tasks, function(err) {
      should(err).not.be.undefined;

      done();
    });
  });

  

  // todo readTasks tests
});