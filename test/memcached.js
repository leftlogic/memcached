module.exports = function FakeMemcached() {
  this._store = {};
  this.get = function (key, cb) {
    var val = this._store[key],
        err = null;
    if (val === undefined) {
      val = null;
      err = 'Not found';
    }
    cb(err, val);
  };
  this.set = function (key, val, lifetime, cb) {
    this._store[key] = val;
    cb(null, val);
  };
  this.flush = function(cb) {
    this._store = {};
    cb(null, true);
  };

  this.del = function(key, cb) {
    delete this._store[key];
    cb(null, true);
  };
};
