/**
 * Benchmarking tool
 *
 * @param {object} options
 * @constructor
 */
function Benchmark(options) {
  var self = this;

  self._iterations = ('undefined' !== typeof options.iterations) ? options.iterations : 10000000;
  self._start = self._end = Date.now();
  self._reqs = 0;

  self._results = {
    r: 0,
    ms: 0,
    rps: 0
  };
}


/**
 * Get Results
 */
Benchmark.getResults = function() {
  var self = this;

  self._results.r = self._reqs;
  self._results.ms = self._end - self._start;
  self._results.rps = Math.floor(self._results.r / (self._results.ms / 1000));
};


/**
 * Start Time
 */
Benchmark.prototype.start = function() {
  this._start = Date.now();
};


/**
 * End Time
 */
Benchmark.prototype.end = function() {
  this._end = Date.now();
  Benchmark.getResults.call(this);
};


/**
 * Increment Request Count
 */
Benchmark.prototype.request = function() {
  return ++this._reqs;
};


/**
 * Output Results
 */
Benchmark.prototype.results = function() {
  console.log(this._results);
};


module.exports = Benchmark;