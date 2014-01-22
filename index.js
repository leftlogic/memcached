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
      if (name.constructor === Object) {
        return cb(null, name);
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
      memstore.set(val.user.name, val, lifetime, cb);
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

    getKey: function(id) { return id; },

    get: function(id, cb) {
      console.log('SessionStore#get:: ', id);
      this.memstore.get(id, getSession(this.memstore, cb));  
    },

    set: function(id, val,/* lifetime,*/ cb) {
      console.log('SessionStore#set:: ', id, val);
      var lifetime = val.cookie.maxAge;
      if(!val.user) {
        return this.memstore.set(id, val, lifetime, (cb || noop));
      }
      val.memstoreID = id;
      this.memstore.set(id, val.user.name, lifetime, setSession(this.memstore, val, lifetime, cb));
    },

    destroy: function(id, cb) {
      this.memstore.get(id, removeSession(this.memstore, id, cb)); 
    },

    destroyByName: function(name, cb) {
      cb = cb || noop;
      this.memstore.get(name, function(err, val){
        this.memstore.del(val.memstoreID, function(){
          this.memstore.del(name, cb); 
        }.bind(this)); 
      }.bind(this));                
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
