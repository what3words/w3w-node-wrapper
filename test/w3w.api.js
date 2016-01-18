var should = require('should'),
    What3Words  = require('../lib/geo.what3words'),
    API_KEY = 'YOUR_API_KEY';

describe('What3Words API Wrapper', function(){
  var w3w;

  describe('Initializating', function() {

    it('without any arguments', function() {
      (function() {
        w3w = new What3Words();
      }).should.throw();
    });

    it('with a valid API KEY', function() {
      (function() {
        w3w = new What3Words(API_KEY);
        w3w.getLanguages({});
      }).should.not.throw();
    });

    it('with additional arguments', function() {
      w3w = new What3Words(API_KEY, {
        language: 'ru',
        userAgent: 'custom'
      });

      w3w.getLanguage().should.be.exactly('ru').and.be.a.String;
      w3w.getUserAgent().should.be.exactly('custom').and.be.a.String;
      w3w.getEndpoint().should.be.exactly('http://api.what3words.com/').and.be.a.String;
    });

  });


  describe('API responses', function() {

    beforeEach(function(done){
      w3w = new What3Words(API_KEY);
      done();
    });

    it('should return all languages', function(done) {
      w3w.getLanguages({}).then(function(res) {
        res.should.eql(['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'sv', 'sw', 'tr']);
        done();
      });
    });

    it('should be able to translate words to position', function(done) {
      w3w.wordsToPosition({
        words: 'prom.cape.pump'
      }).then(function(res) {
        res.should.eql('51.484463,-0.195405').and.be.a.String;
        done();
      });
    });

    it('should be able to translate position to words', function(done) {
      w3w.positionToWords({
        position: '51.484463,-0.195405'
      }).then(function(res) {
        res.should.eql('prom,cape,pump').and.be.a.String;
        done();
      });
    });

    it('should be able to check if a word is available', function(done) {
      w3w.oneWordAvailable({
        word: 'nestoria'
      }).then(function(res) {
        res.should.eql('1').and.be.a.Number;
        done();
      });
    });

  });

});
