function RedisClientMock() {
  var self = this;

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

  if ('string' !== typeof sha) return cb(new Error('ERR syntax error'));

  if ('undefind' === typeof self[sha]) return cb(new Error('ERR syntax error'));

  self[sha](args, function(err, response) {
    if (err) return cb(err);

    cb(undefined, response);
  });
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