var Client = require('./Client');

module.exports.createClient = function(host, port, options) {
  if ('string' !== typeof host) throw new Error('host must be a string');

  if ('string' !== typeof port && 'number' !== typeof port) throw new Error('port must be a number or string number');

  if ('undefined' === typeof options) options = {};
  else if ('object' !== typeof options || Array.isArray(options)) throw new Error('options must be an object');

  return new Client(host, port, options);
};