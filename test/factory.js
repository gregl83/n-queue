var should = require('should');
var mockery = require('mockery');
var sinon = require('sinon');


mockery.enable({
  useCleanCache: true,
  warnOnReplace: false,
  warnOnUnregistered: false
});

exports.Client = function() {/* Client constructor Mock */};

var ClientSpy = sinon.spy(exports, 'Client');

mockery.registerMock('./Client', ClientSpy);


var nQueue = require('../');


describe('factory', function() {
  after(function() {
    mockery.deregisterAll();
  });

  afterEach(function() {
    ClientSpy.reset();
  });

  it('create client sans options', function(done) {
    var host = "127.0.0.1";
    var port = 6379;

    nQueue.createClient(host, port);

    sinon.assert.calledWithExactly(ClientSpy, host, port, sinon.match.string, sinon.match.object);

    done();
  });

  it('create client empty options', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var options = {};

    nQueue.createClient(host, port, options);

    sinon.assert.calledWithExactly(ClientSpy, host, port, sinon.match.string, options);

    done();
  });

  it('create client invalid options', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var options = ["a", "b", "c"];

    should.throws(function() {
      nQueue.createClient(host, port, options);
    });

    sinon.assert.notCalled(ClientSpy);

    done();
  });

  it('create client invalid host', function(done) {
    var host = 127001;
    var port = 6379;

    should.throws(function() {
      nQueue.createClient(host, port);
    });

    sinon.assert.notCalled(ClientSpy);

    done();
  });

  it('create client port string number', function(done) {
    var host = "127.0.0.1";
    var port = "6379";

    nQueue.createClient(host, port);

    sinon.assert.calledWithExactly(ClientSpy, host, port, sinon.match.string, sinon.match.object);

    done();
  });

  it('create client invalid port', function(done) {
    var host = "127.0.0.1";
    var port = [6379];

    should.throws(function() {
      nQueue.createClient(host, port);
    });

    sinon.assert.notCalled(ClientSpy);

    done();
  });
});