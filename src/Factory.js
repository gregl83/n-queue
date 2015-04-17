
var Client = require('./Client');

module.exports.createClient = function(options) {
  return new Client(options);
};