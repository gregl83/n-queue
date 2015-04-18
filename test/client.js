var Buffer = require('buffer').Buffer;
var Duplex = require('stream').Duplex;

var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');
var config = require('config');

mockery.enable({
  useCleanCache: true,
  warnOnReplace: false,
  warnOnUnregistered: false
});

var redisMock = {
  createClient: function() {}
};
sinon.stub(redisMock, "createClient");
mockery.registerMock('redis', redisMock);


var Client = require('../src/Client');


describe('client', function() {
  after(function() {
    mockery.deregisterAll();
  });

  it('new client redis server', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var queue = 'queue';
    var options = {};

    var clientMock = {};
    redisMock.createClient.returns(clientMock);

    var client = new Client(host, port, queue, {});

    redisMock.createClient.calledWithExactly(host, port, options);

    (client).should.be.instanceOf(Duplex);
    (client.store).should.be.eql(clientMock);

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

    var tasks = {/* task data */};

    client.pushTasks(tasks, function(err) {
      should(err).be.undefined;

      sinon.assert.calledOnce(_pushTask);
      sinon.assert.calledWithExactly(_pushTask, JSON.stringify(tasks), sinon.match.func);

      sinon.assert.calledOnce(write);
      sinon.assert.calledWithExactly(write, JSON.stringify(tasks), 'utf8', sinon.match.func);

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

    var tasks = [{/* task data */}, {/* task data */}];

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