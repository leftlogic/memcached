var Memcached = require('memcached');

var fakecb = function () {};

function createSessionStore(express) {
  
  var ExpressStore = express.session.Store;

  function SessionStore(options) {
    ExpressStore.call(this, options); 
    this.memstore = new Memcached(options.host, options);
    this['getByName'] = this.memstore.get.bind(this.memstore);
  }

  function getSession(memstore, cb) {
    cb = cb || fakecb;
    return function (err, name) {
      if (err) {
        return cb(err, null);
      } 
      memstore.get(name, cb);
    };
  }

  function setSession(memstore, val, lifetime, cb) {
    cb = cb || fakecb;
    return function (err) {
      if (err) {
        // Not a problem, the sid already existed
      } 
      memstore.set(val.name, val, lifetime, cb);
    };
  }

  function removeSession(memstore, id, cb){
    cb = cb || fakecb;
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

    set: function(id, val, lifetime, cb) {
      if (val.constructor === Object && !!val.name) {
        this.memstore.add(id, val.name, lifetime, setSession(this.memstore, val, lifetime, cb));
      }
    },

    destroy: function(id, cb) {
      this.memstore.get(id, removeSession(this.memstore, id, cb)); 
    },

    clear: function(cb) {
      cb = cb || fakecb;
      this.memstore.flush(cb);  
    },

    __proto__: ExpressStore.prototype

  };

  return SessionStore;

}

module.exports = createSessionStore;
