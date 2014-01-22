var express = require('express'),
    _SS = require('../index.js')(express),
    FakeMemcached = require('./memcached.js');

function SessionStore (options) {
  _SS.call(this, options);
  this.memstore = new FakeMemcached();
  this.getByName = this.memstore.get.bind(this.memstore);
  this.setByName = this.memstore.set.bind(this.memstore);
  return this;
}

SessionStore.prototype = _SS.prototype;

module.exports = SessionStore;
