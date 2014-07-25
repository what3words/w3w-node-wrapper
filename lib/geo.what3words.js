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
