var http     = require('http'),
    unirest  = require('unirest'),
    Promise  = require('bluebird'),
    _        = require('lodash');

/**
 * What3Words API wrapper for the API version 1.0.
 *
 * @param apiKey The API key to access the What3Words API with
 * @param options Configuration options
 * @return Instance of {@link What3Words}
 */
function What3Words (apiKey, options) {

  if (!options) {
    options = {};
  }

  if (!apiKey) {
    throw new Error('API Key not set');
  }

  this.version     = '1.0';
  this.apiKey      = apiKey;
  this.endpoint    = options.endpoint || 'http://api.what3words.com/';
  this.language    = options.language || 'en';
  this.userAgent   = options.userAgent || 'JS Geo::What3Words';
}

module.exports = What3Words;


/**
 * Checks if oneWord is available
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * word: a string containing the oneWord
 *          * full: Return the full response
 */
What3Words.prototype.oneWordAvailable = function (options) {
  var language = options.lang || this.language;

  return new Promise(_.bind(function(resolve, reject) {
    this.execute('oneword-available', {word: options.word, lang: language})
      .then(function(res) {
        if (options.full) {
          resolve(res);
        } else {
          resolve(res.available);
        }
      })
      .catch(function(err) {
        reject(err)
      });
  }, this));
};


/**
 * Convert GPS co-ordinates into 3 words.
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * position: a string containing lat,long
 *          * full: Return the full response
 */
What3Words.prototype.positionToWords = function (options) {
  var language = options.lang || this.language;

  return new Promise(_.bind(function(resolve, reject) {
    this.execute('position', {position: options.position, lang: language})
      .then(function(res) {
        if (options.full) {
          resolve(res);
        } else {
          resolve(res.words.join('.'));
        }
      })
      .catch(function(err) {
        reject(err)
      });
  }, this));
};


/**
 * Convert 3 words or a OneWord into GPS coordinates
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * words: a string containing 3 dot separated words
 *          * full: Return the full response
 */
What3Words.prototype.wordsToPosition = function (options) {
  var language = options.lang || this.language;

  return new Promise(_.bind(function(resolve, reject) {
    this.execute('w3w', {string: options.words, lang: language})
      .then(function(res) {
        if (options.full) {
          resolve(res);
        } else {
          resolve(res.position.join(','));
        }
      })
      .catch(function(err) {
        reject(err)
      });
  }, this));
};


/**
 * Returns a list of the W3W available languages
 * @param  {[object]}   options  Can contain the following properties:
 *          * full: Return the full response
 */
What3Words.prototype.getLanguages = function (options) {
  return new Promise(_.bind(function(resolve, reject) {
    this.execute('get-languages', {})
      .then(function(res) {
        if (options.full) {
          resolve(res);
        } else {
          resolve(_.pluck(res.languages, 'code'));
        }
      })
      .catch(function(err) {
        reject(err);
      });
  }, this));
};

/**
 * Getters
 */
What3Words.prototype.getLanguage = function () {
  return this.language;
};

What3Words.prototype.getUserAgent = function () {
  return this.userAgent;
};

What3Words.prototype.getEndpoint = function () {
  return this.endpoint;
};


/**
 * Sends a given request as a JSON object to the W3W API and returns
 * a promise which if resolved will contain the resulting JSON object.
 *
 * @param  {[type]}   method   W3W API method to call
 * @param  {[type]}   params   Object containg parameters to call the API with
 * @param  {Function} Promise
 */
What3Words.prototype.execute = function (method, params) {
  return new Promise(_.bind(function(resolve, reject) {
    var finalParams = _.extend({ key:  this.apiKey }, params);

    unirest.post(this.endpoint + method)
      .headers({
        'Accept': 'application/json',
        'User-Agent': this.userAgent
      })
      .send(finalParams)
      .end(function (response) {
        if (response.code !== 200) {
          reject('Unable to connect to the What3Words API endpoint.');
        } else if (response.body.error) {
          reject(response.body.error + '. Message: ' + response.body.message);
        }

        resolve(response.body);
      });
  }, this));
};
