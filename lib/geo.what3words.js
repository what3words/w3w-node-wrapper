var http    = require('http'),
    unirest = require('unirest'),
    _       = require('lodash');

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
 * Convert GPS co-ordinates into 3 words.
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * position: a string containing lat,long
 *          * full: Return the full response
 */
What3Words.prototype.positionToWords = function (options, callback) {
  var language = options.lang || this.language;

  this.execute('position', {position: options.position, lang: language}, function(response) {

      if (options.full) {
        callback(response);  
      }
      
      callback(response.words.join('.'));
  });
};


/**
 * Convert 3 words or a OneWord into GPS coordinates
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * words: a string containing 3 dot separated words
 *          * full: Return the full response
 */
What3Words.prototype.wordsToPosition = function (options, callback) {
  var language = options.lang || this.language;

  this.execute('w3w', {string: options.words, lang: language}, function(response) {

      if (options.full) {
        callback(response);  
      }

      callback(response.position.join(','));
  });
};


/**
 * Returns a list of the W3W available languages
 * @param  {[object]}   options  Can contain the following properties:
 *          * full: Return the full response
 */
What3Words.prototype.getLanguages = function (options, callback) {
  this.execute('get-languages', {}, function(response) {

      if (options.full) {
        callback(response);
      }

      callback(_.pluck(response.languages, 'code'));
  });
};


/**
 * Sends a given request as a JSON object to the W3W API and finally
 * calls the given callback function with the resulting JSON object.
 * 
 * @param  {[type]}   method   W3W API method to call
 * @param  {[type]}   params   Object containg parameters to call the API with
 * @param  {Function} callback To be called on success
 */
What3Words.prototype.execute = function (method, params, callback) {
  var finalParams = _.extend({ key:  this.apiKey }, params);

  unirest.post(this.endpoint + method)
    .headers({ 
      'Accept': 'application/json',
      'User-Agent': this.userAgent
    })
    .send(finalParams)
    .end(function (response) {
      if (response.code !== 200) {
        throw new Error('Unable to connect to the What3Words API endpoint.');
      } else if (response.body.error) {
        throw new Error(response.body.error + '. Message: ' + response.body.message);
      }

      callback(response.body);
    });
};
