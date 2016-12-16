// jshint -W030
var should = require('chai').should(),
  Geocoder = require('../lib/W3W.Geocoder'),
  API_KEY = process.env.W3W_API_KEY ||  null;

describe('what3words API Wrapper', function() {
  var w3w;

  describe('Initialising', function() {
    it('without any arguments', function() {
      (function() {
        w3w = new Geocoder();
      }).should.throw();
    });

    it('with a valid API KEY', function() {
      (function() {
        w3w = new Geocoder({
          apiKey: API_KEY
        });
        w3w.getLanguages({});
      }).should.not.throw();
    });

    it('with additional arguments', function() {
      w3w = new Geocoder({
        apiKey: API_KEY,
        language: 'ru',
        userAgent: 'custom'
      });

      w3w.getLanguage().should.be.equal('ru').and.be.a.String;
      w3w.getUserAgent().should.be.equal('custom').and.be.a.String;
      w3w.getEndpoint().should.be.equal('https://api.what3words.com/v2/').and.be.a.String;
    });
  });

  describe('API responses', function() {
    beforeEach(function(done) {
      w3w = new Geocoder({
        apiKey: API_KEY
      });
      done();
    });

    it('should return all languages', function(done) {
      w3w.languages({}).then(function(res) {
        //res.should.eql(['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'sv', 'sw', 'tr']);
        //regarding evolving languages just check this is an array
        res.should.be.a.array;
        res.length.should.be.greaterThan(0);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should return all languages (legacy)', function(done) {
      w3w.getLanguages({}).then(function(res) {
        //res.should.eql(['de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'sv', 'sw', 'tr']);
        //regarding evolving languages just check this is an array
        res.should.be.a.array;
        res.length.should.be.greaterThan(0);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to forward geocode (translate 3 word address to coordinates)', function(done) {
      w3w.forward({
        addr: 'prom.cape.pump'
      }).then(function(res) {
        res.should.eql('51.484463,-0.195405').and.be.a.String;
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to forward geocode with full response (translate 3 word address to coordinates)', function(done) {
      w3w.forward({
        addr: 'prom.cape.pump',
        full: true
      }).then(function(res) {
        res.should.have.property('words');
        res.words.should.eql('prom.cape.pump').and.be.a.String;
        res.should.have.property('geometry');
        res.geometry.should.have.property('lat');
        res.geometry.should.have.property('lng');
        res.geometry.lat.should.eql(51.484463);
        res.geometry.lng.should.eql(-0.195405);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to forward geocode french with full response (translate 3 word address to coordinates)', function(done) {
      w3w.forward({
        addr: 'concevoir.époque.amasser',
        lang: 'fr',
        full: true
      }).then(function(res) {
        res.should.have.property('words');
        res.words.should.eql('concevoir.époque.amasser').and.be.a.String;
        res.should.have.property('geometry');
        res.geometry.should.have.property('lat');
        res.geometry.should.have.property('lng');
        res.geometry.lat.should.eql(51.484463);
        res.geometry.lng.should.eql(-0.195405);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to forward geocode in v1 legacy mode (translate 3 word address to coordinates)', function(done) {
      w3w.wordsToPosition({
        addr: 'prom.cape.pump'
      }).then(function(res) {
        res.should.eql('51.484463,-0.195405').and.be.a.String;
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to reverse geocode (translate coordinates to 3 word address)', function(done) {
      w3w.reverse({
        coords: '51.484463,-0.195405'
      }).then(function(res) {
        res.should.eql('prom.cape.pump').and.be.a.String;
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to reverse geocode with full response (translate coordinates to 3 word address)', function(done) {
      w3w.reverse({
        coords: '51.484463,-0.195405',
        full: true
      }).then(function(res) {
        res.should.have.property('words');
        res.words.should.eql('prom.cape.pump').and.be.a.String;
        res.should.have.property('geometry');
        res.geometry.should.have.property('lat');
        res.geometry.should.have.property('lng');
        res.geometry.lat.should.eql(51.484463);
        res.geometry.lng.should.eql(-0.195405);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to reverse geocode in v1 legacy mode (translate coordinates to 3 word address)', function(done) {
      w3w.positionToWords({
        coords: '51.484463,-0.195405'
      }).then(function(res) {
        res.should.eql('prom.cape.pump').and.be.a.String;
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to autosuggest 3 word addresses', function(done) {
      w3w.autosuggest({
        addr: 'plan.clips.a'
      }).then(function(res) {
        res.should.be.json;
        res.suggestions.should.be.array;
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able to return a blend', function(done) {
      w3w.standardBlend({
        addr: 'plan.clips.a'
      }).then(function(res) {
        res.should.be.json;
        res.blends.should.be.array;
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('should be able return a grid', function(done) {
      w3w.grid({
        bbox: '52.208867,0.117540,52.207988,0.116126'
      }).then(function(res) {
        res.should.be.json;
        res.lines.should.be.array;
        done();
      }).catch(function(err) {
        done(err);
      });
    });
  });
});
