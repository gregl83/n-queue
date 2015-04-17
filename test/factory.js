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

  it('create client', function(done) {
    var host = "127.0.0.1";
    var port = 6379;
    var options = {};

    nQueue.createClient(host, port, options);

    mockRedis.createClient.calledWithExactly(host, port, options);

    done();
  });
});