var Memcached = require('memcached');

var noop = function () {};

function createSessionStore(express) {
  
  var ExpressStore = express.session.Store;

  function SessionStore(options) {
    ExpressStore.call(this, options); 
    this.memstore = new Memcached(options.host, options);
    this.getByName = this.memstore.get.bind(this.memstore);
  }

  function getSession(memstore, cb) {
    cb = cb || noop;
    return function (err, name) {
      if (err) {
        return cb(err, null);
      } 
      memstore.get(name, cb);
    };
  }

  function setSession(memstore, val, lifetime, cb) {
    cb = cb || noop;
    return function (err) {
      if (err) {
        // Not a problem, the sid already existed
      } 
      memstore.set(val.user.name, val, 50000, cb);
    };
  }

  function removeSession(memstore, id, cb){
    cb = cb || noop;
    return function (err, name) {
      if (err) {
        return cb(err, null);
      }
      memstore.del(name, function(err) {
        if (err) {
          return cb(err, null);
        }
        memstore.del(id, cb);   
      });
    };
  }

  SessionStore.prototype = {

    get: function(id, cb) {
      this.memstore.get(id, getSession(this.memstore, cb));  
    },

    set: function(id, val,/* lifetime,*/ cb) {
      console.log('SessionStore#set:: ', id, val);
      var lifetime = val.cookie.maxAge;
      if(!val.user) {
        return this.memstore.set(id, val, lifetime, (cb || noop));
      }
    },

    destroy: function(id, cb) {
      this.memstore.get(id, removeSession(this.memstore, id, cb)); 
    },

    clear: function(cb) {
      cb = cb || noop;
      this.memstore.flush(cb);  
    },

    __proto__: ExpressStore.prototype

  };

  return SessionStore;

}

module.exports = createSessionStore;
