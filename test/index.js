/* jshint expr: true*/
/* globals describe, it, beforeEach */

var SessionStore  = require('./SessionStore.js'),
    should = require('should');

describe('SessionStore', function(){

  var cb = function () {};
  var instance = new SessionStore({
    hosts: ['localhost:11211']
  });
  var memstore = instance.memstore;
  var session = {
    user: {
      name: 'allouis',
      awesome: true
    },
    cookie: {
      maxAge: 60000        
    }
  };

  var session2 = {
    user: {
      name: 'alloui',
      awesome: true
    },
    cookie: {
      maxAge: 60000        
    }
  };

  var session3 = {
    user: {
      name: 'allou',
      awesome: true
    },
    cookie: {
      maxAge: 60000        
    }
  };

  beforeEach(function() {
    memstore.flush(cb);
  });

  it('should be an EventEmitter', function() {
    instance.on.should.be.ok;
  });

  describe('#get', function() {
    
    it('should return the record linked via the result of the first get', function(done){
      
      memstore.set('123456789', 'allouis', 60000, cb); 
      memstore.set('allouis', session, 60000, cb);

      instance.get('123456789', function (err, val) {
        val.should.be.type('object');
        val.user.awesome.should.be.true;
        done();
      });

    });

  });

  describe('#set', function() {
    
    it('should create two records', function(done) {
      
      function checkValueIsNotThere (err, val) {
        should.not.exist(val);
      }

      memstore.get('123456789', checkValueIsNotThere);
      memstore.get('allouis', checkValueIsNotThere);


      instance.set('123456789', session, function() {
        memstore.get('123456789', function(err, val){
          should.exist(val);
          memstore.get('allouis', function(err, val){
            should.exist(val);
            done();
          });
        });
      });

    });

    it('should link those records by name attribute', function() {
        
      instance.set('123456789', session, function(){
        instance.get('123456789', function(err, val) {
          val.user.awesome.should.be.true;
          val.user.name.should.equal('allouis');
        });
      });

    });


  });

  describe('#destroy', function() {
  
    it('should remove both records', function(done) {

      instance.set('123456789', session, function() {
        memstore.get('123456789', function(err, val){
          should.exist(val);
          memstore.get('allouis', function(err, val){
            should.exist(val);
            instance.destroy('123456789', function(){
              memstore.get('123456789', function(err, val){
                should.not.exist(val);
                memstore.get('allouis', function(err, val){
                  should.not.exist(val);
                  instance.get('123456789', function(err, val){
                    should.not.exist(val);
                    done();
                  });
                });
              });
            });
          });
        });
      });
    }); 

  });

  describe('#clear', function() {
  
    it('should remove all records', function(done) {
      
      function checkValueIsNotThere (err, val) {
        should.not.exist(val);
      }
      instance.set('123456789', session, function() {  
        instance.set('12345678', session2, function() {  
          instance.set('1234567', session3, function() {  
            instance.clear(function() {
              instance.get('123456789', checkValueIsNotThere); 
              instance.get('12345678', checkValueIsNotThere); 
              instance.get('1234567', checkValueIsNotThere); 
              instance.get('allouis', checkValueIsNotThere); 
              instance.get('alloui', checkValueIsNotThere); 
              instance.get('allou', checkValueIsNotThere); 
              done();
            });
          });
        });
      });
    
    });

  });

});
