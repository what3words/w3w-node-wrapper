var should = require('should'),
    What3Words  = require('../lib/geo.what3words'),
    API_KEY = process.env.W3W_APIKEY || null;

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
      w3w.getEndpoint().should.be.exactly('https://api.what3words.com/v2/').and.be.a.String;
    });

  });


  describe('API responses', function() {

    beforeEach(function(done){
      w3w = new What3Words(API_KEY);
      done();
    });

    it('should return all languages', function(done) {
      w3w.getLanguages({}).then(function(res) {
        //res.should.eql(['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'sv', 'sw', 'tr']);
        //regarding evolving languages just check this is an array
        res.should.be.a.array;
        res.length.should.be.greaterThan(0);
        done();
      });
    });

    it('should be able to forward (translate words to position)', function(done) {
      w3w.wordsToPosition({
        addr: 'prom.cape.pump'
      }).then(function(res) {
        res.should.eql('51.484463,-0.195405').and.be.a.String;
        done();
      });
    });

    it('should be able to reverse (translate position to words)', function(done) {
      w3w.positionToWords({
        coords: '51.484463,-0.195405'
      }).then(function(res) {
        res.should.eql('prom.cape.pump').and.be.a.String;
        done();
      });
    });

    it('should be able to autosuggest words', function(done) {
      w3w.autosuggest({
        addr: 'plan.clips.a'
      }).then(function(res) {
        res.should.be.json;
        res.suggestions.should.be.array;
        done();
      });
    });

    it('should be able to return a blend', function(done) {
      w3w.standardBlend({
        addr: 'plan.clips.a'
      }).then(function(res) {
        res.should.be.json;
        res.blends.should.be.array;
        done();
      });
    });

    it('should be able return a grid', function(done) {
      w3w.grid({
        bbox: '52.208867,0.117540,52.207988,0.116126'
      }).then(function(res) {
        res.should.be.json;
        res.lines.should.be.array;
        done();
      });
    });

  });

});
