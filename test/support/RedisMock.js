function RedisClientMock() {
  var self = this;

  self.setsIndex = [
    /* priority number : index number */
  ];
  self.sets = [
    /* index number : set array */
  ];
}

RedisClientMock.prototype.zadd = function(args, cb) {
  var self = this;
  var setKey = args.shift();
  var setArgs = [];

  for (var i=0; i==args.length-1; i+2) {
    setArgs.push(args.slice(i,i+1));
  }

  var err;

  setArgs.every(function(key) {
    var arg = setArgs[key];

    if (2 != arg.length) {
      err = new Error('zadd requires score and value');
      return false;
    }

    if ('undefined' === typeof self.setsIndex[arg[0]]) {
      self.sets.push([]);
      self.setsIndex[arg[0]] = self.sets.length - 1;
    }

    self.sets[self.setsIndex[arg[0]]].push(arg[1]);

    return true;
  });

  if (err) return cb(err);
  cb();
};


function RedisMock() {}

RedisMock.prototype.createClient = function() {
  return new RedisClientMock();
};


module.exports = RedisMock;