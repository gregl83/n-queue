var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');

var nQueue = require('../');


mockery.enable({
  useCleanCache: true,
  warnOnReplace: false,
  warnOnUnregistered: false
});

var mockRedis = {
  createClient: function() {}
};
sinon.stub(mockRedis, "createClient");
mockery.registerMock('redis', mockRedis);


describe('factory', function() {
  after(function() {
    mockery.disable();
  });

  it('create client sans options', function(done) {
    var host = "127.0.0.1";
    var port = 6379;

    mockRedis.createClient.calledWithExactly(host, port);

    nQueue.createClient(host, port);

    done();
  });

  it('create client empty options', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var options = {};

    mockRedis.createClient.calledWithExactly(host, port, options);

    nQueue.createClient(host, port, options);

    done();
  });

  it('create client invalid options', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var options = ["a", "b", "c"];

    mockRedis.createClient.calledWithExactly(host, port, options);

    should.throws(function() {
      nQueue.createClient(host, port, options);
    });

    done();
  });

  it('create client invalid host', function(done) {
    var host = 127001;
    var port = 6379;

    mockRedis.createClient.calledWithExactly(host, port);

    should.throws(function() {
      nQueue.createClient(host, port);
    });

    done();
  });

  it('create client port string number', function(done) {
    var host = "127.0.0.1";
    var port = "6379";

    mockRedis.createClient.calledWithExactly(host, port);

    nQueue.createClient(host, port);

    done();
  });

  it('create client invalid port', function(done) {
    var host = "127.0.0.1";
    var port = [6379];

    mockRedis.createClient.calledWithExactly(host, port);

    should.throws(function() {
      nQueue.createClient(host, port);
    });

    done();
  });
});