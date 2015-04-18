var Duplex = require('stream').Duplex;

var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');


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
    var options = {};

    var clientMock = {};

    redisMock.createClient.returns(clientMock);
    redisMock.createClient.calledWithExactly(host, port, options);

    var client = new Client(host, port);

    (client).should.be.instanceOf(Duplex);
    (client.store).should.be.eql(clientMock);

    done();
  });

  it('push task to queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var options = {};

    var client = new Client(host, port, options);

    var tasks = {/* task data */};

    client.pushTasks(tasks, function() {
      // todo verify task is in queue

      done();
    });
  });

  it('push task array to queue', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var options = {};

    var client = new Client(host, port, options);

    var tasks = [{/* task data */}, {/* task data */}];

    client.pushTasks(tasks, function() {
      // todo verify task is in queue

      done();
    });
  });

  // todo readTasks tests
});