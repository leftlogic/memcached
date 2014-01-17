/* jshint expr: true*/
/* globals describe, it, before, after, beforeEach, afterEach */

var should        = require('should'),
    express       = require('express'),
    SessionStore  = require('../index.js')(express);

describe('SessionStore', function(){

  var cb = function () {};
  var instance = new SessionStore({
    hosts: ['localhost:11211']
  });
  var memstore = instance.memstore;

  beforeEach(function() {
    memstore.flush(cb);
  });

  it('should be an EventEmitter', function() {
    instance.on.should.be.ok;
  });

  describe.skip('#get', function() {
    
    it('should return the record linked via the result of the first get', function(done){
      
      memstore.set('123456789', 'allouis', 60000, cb); 
      memstore.set('allouis', { awesome: true }, 60000, cb);

      instance.get('123456789', function (err, val) {
        val.should.be.type('object');
        val.awesome.should.be.true;
        done();
      });

    });

  });

  describe.skip('#set', function() {
    
    it('should create two records', function(done) {
      
      function checkValueIsNotThere (err, val) {
        val.should.not.be.ok;
      }

      memstore.get('123456789', checkValueIsNotThere);
      memstore.get('allouis', checkValueIsNotThere);


      instance.set('123456789', { name: 'allouis', awesome: true}, 60000, function(err) {
        memstore.get('123456789', function(err, val){
          val.should.be.ok;
          memstore.get('allouis', function(err, val){
            val.should.be.ok;
            done();
          });
        });
      });

    });

    it('should link those records by name attribute', function() {
        
      instance.set('123456789', { name: 'allouis', awesome: true}, 60000, function(){
        instance.get('123456789', function(err, val) {
          val.awesome.should.be.true;
          val.name.should.equal('allouis');
        });
      });

    });


  });

  describe.skip('#destroy', function() {
  
    it('should remove both records', function(done) {

      instance.set('123456789', { name: 'allouis', awesome: true}, 60000, function() {
        memstore.get('123456789', function(err, val){
          val.should.be.ok;
          memstore.get('allouis', function(err, val){
            val.should.be.ok;
            instance.destroy('123456789', function(){
              memstore.get('123456789', function(err, val){
                val.should.not.be.ok;
                memstore.get('allouis', function(err, val){
                  val.should.not.be.ok;
                  instance.get('123456789', function(err, val){
                    val.should.not.be.ok;
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

  describe.skip('#clear', function() {
  
    it('should remove all records', function(done) {
      
      function checkValueIsNotThere (err, val) {
        val.should.not.be.ok;
      }
      instance.set('123456789', { name: 'allouis', awesome: true}, 60000, function() {  
        instance.set('12345678', { name: 'alloui', awesome: true}, 60000, function() {  
          instance.set('1234567', { name: 'allou', awesome: true}, 60000, function() {  
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
