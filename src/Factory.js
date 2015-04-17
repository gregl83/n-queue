var Client = require('./Client');

module.exports.createClient = function(host, port, options) {
  return new Client(host, port, options);
};