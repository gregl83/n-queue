function RedisClientMock() {
  var self = this;

  self.lists = {
    /* key string : list array */
  };
  self.setsIndex = [
    /* priority number : index number */
  ];
  self.sets = [
    /* index number : set array */
  ];
}


// number_keys keys args
RedisClientMock.prototype.evalsha = function(args, cb) {
  var self = this;

  // check for to make sure args is array
  if (!Array.isArray(args)) return cb(new Error('ERR syntax error'));

  var sha = args.shift();

  if ('string' !== typeof sha || 'undefined' === typeof self[sha]) return cb(new Error('ERR syntax error'));

  self[sha](args, function(err, response) {
    if (err) return cb(err);

    cb(undefined, response);
  });
};


RedisClientMock.prototype._prpush = function(args, cb) {
  var self = this;

  var key = args.shift();
  var priority = args.shift();

  if ('string' !== typeof key || 'string' !== typeof priority) return cb(new Error('ERR syntax error'));

  var keyspace = key + ':' + priority;

  if (!Array.isArray(self.lists[keyspace])) self.lists[keyspace] = [];

  var response = 0;

  args.forEach(function(val) {
    self.lists[keyspace].push(val);
    response++;
  });

  cb(undefined, response);
};


RedisClientMock.prototype._prpoplpush = function(args, cb) {
  var self = this;

  var keysCount = args.shift();
  var source = args.shift();
  var destination = args.shift();

  if ('number' !== typeof keysCount || 'string' !== typeof source || 'string' !== destination) return cb(new Error('ERR syntax error'));

  var response = null;

  args.every(function(val) {
    var sourceKey = source + ':' + val;

    if ('undefined' === typeof self.lists[sourceKey]) {
      self.lists[sourceKey] = [];
      return true;
    }

    if (0 === self.lists[sourceKey].length) return true;

    var destinationKey = destination + ':' + val;
    if ('undefined' === typeof self.lists[destinationKey]) self.lists[destinationKey] = [];

    response = self.lists[sourceKey].pop();

    self.lists[destinationKey].unshift(response);

    return false;
  });

  cb(undefined, response);
};


RedisClientMock.prototype.zadd = function(args, cb) {
  var self = this;

  // check for to make sure args is array
  if (!Array.isArray(args)) return cb(new Error('ERR syntax error'));

  var setKey = args.shift();

  // check for valid values in args after removing set name
  if ('string' !== typeof setKey || 0 != args.length % 2) return cb(new Error('ERR syntax error'));

  var setArgs = [];

  for (var i=0; i==args.length-1; i+2) {
    setArgs.push(args.slice(i,i+1));
  }

  var err;

  setArgs.every(function(key) {
    var arg = setArgs[key];

    if (2 != arg.length) {
      err = new Error('ERR syntax error');
      return false;
    }

    return true;
  });

  if (err) return cb(err, undefined);

  var response = 0;

  setArgs.forEach(function(arg) {
    if ('undefined' === typeof self.setsIndex[arg[0]]) {
      self.sets.push([]);
      self.setsIndex[arg[0]] = self.sets.length - 1;
    }

    self.sets[self.setsIndex[arg[0]]].push(arg[1]);
    response++;
  });

  // perform sort on sets (binary insert not needed for test data) to simulate lexicographical sorting
  self.sets.forEach(function(val, key) {
    self.sets[key].sort(function(a, b) {
      return a > b;
    });
  });

  cb(undefined, response);
};


function RedisMock() {}

RedisMock.prototype.createClient = function() {
  return new RedisClientMock();
};


module.exports = RedisMock;