'use strict';

var request = require('request');
var _ = require('lodash');

/**
 * What3Words API wrapper for the API version 2.0.
 *
 * @param options Configuration options
 * @return Instance of {@link Geocoder}
 */
function Geocoder(options) {
    if (!options) {
        options = {};
    }

    if (!options.apiKey) {
        throw new Error('API Key not set');
    }

    this.version = '1.0';
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint || 'https://api.what3words.com/v2/';
    this.language = options.language || 'en';
    this.userAgent = options.userAgent || 'JS Geo::Geocoder';
}

module.exports = Geocoder;

/**
 * Convert GPS co-ordinates into 3 words.
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * coords: a string containing lat,long
 */
Geocoder.prototype.reverse = function(options) {
    options.lang = options.lang || this.language;
    options.coords = options.position ||  options.coords; // backwards compatibility

    return new Promise(_.bind(function(resolve, reject) {
        if (!this.validateLatLng(options.coords)) {
            reject({
                error: 301,
                message: "Invalid or non-existent coordinates."
            });
        }

        this.execute('reverse', options)
            .then(function(res) {
                if (!options.full || options.format.toLowerCase() === 'json') {
                    resolve(res.words);
                } else {
                    resolve(res);
                }
            })
            .catch(function(err) {
                reject(err);
            });
    }, this));
};

// Backwards compatibility
Geocoder.prototype.positionToWords = function(options) {
    return this.reverse(options);
};


/**
 * Convert 3 words or a OneWord into GPS coordinates
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * addr: a string containing 3 dot separated words
 */
Geocoder.prototype.forward = function(options) {
    options.lang = options.lang || this.language;
    options.addr = options.words ||  options.addr; // backwards compatibility

    return new Promise(_.bind(function(resolve, reject) {

        if (!this.validateWord(options.addr)) {
            reject({
                error: 300,
                message: "Invalid or non-existent 3 word address."
            });
        }

        this.execute('forward', options)
            .then(function(res) {
                if (!options.full || options.format.toLowerCase() === 'json') {
                    resolve(res.geometry.lat + ',' + res.geometry.lng);
                } else {
                    resolve(res);
                }
            })
            .catch(function(err) {
                reject(err);
            });
    }, this));
};

// Backwards compatibility
Geocoder.prototype.wordsToPosition = function(options) {
    return this.forward(options);
};


/**
 * Returns a list of 3 word addresses based on user input and other parameters.
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * addr: a string containing 3 dot separated words
 */
Geocoder.prototype.autosuggest = function(options) {
    options.lang = options.lang || this.language;

    return new Promise(_.bind(function(resolve, reject) {
        if (!options.addr) {
            reject({
                code: 400,
                msg: "\/autosuggest: missing required parameter"
            });
        }

        this.execute('autosuggest', options)
            .then(function(res) {
                resolve(res);
            })
            .catch(function(err) {
                reject(err);
            });
    }, this));
};

/**
 * Returns a blend of the three most relevant 3 word address candidates for a given location,
 * based on a full or partial 3 word address.
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * addr: a string containing 3 dot separated words
 */
Geocoder.prototype.standardBlend = function(options) {
    options.lang = options.lang || this.language;

    return new Promise(_.bind(function(resolve, reject) {
        if (!options.addr) {
            reject({
                code: 400,
                msg: "\/autosuggest: missing required parameter"
            });
        }

        this.execute('standardblend', options)
            .then(function(res) {
                resolve(res);
            })
            .catch(function(err) {
                reject(err);
            });
    }, this));
};

/**
 * Returns a section of the 3m x 3m what3words grid for a given area.
 * @param  {[object]}   options  Can contain the following properties:
 *          * lang: alternative language, default will be usef if this is not declared.
 *          * addr: a string containing 3 dot separated words
 */
Geocoder.prototype.grid = function(options) {
    options.lang = options.lang || this.language;

    return new Promise(_.bind(function(resolve, reject) {
        if (!options.bbox) {
            reject({
                code: 400,
                msg: "\/autosuggest: missing required parameter"
            });
        }

        this.execute('grid', options)
            .then(function(res) {
                resolve(res);
            })
            .catch(function(err) {
                reject(err);
            });
    }, this));
};

/**
 * Returns a list of the W3W available languages
 * @param  {[object]}   options  Can contain the following properties:
 *          * full: Return the full response
 */
Geocoder.prototype.getLanguages = function(options) {
    return new Promise(_.bind(function(resolve, reject) {
        this.execute('languages', options)
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
 *  Validations
 */
Geocoder.prototype.validateWord = function(word) {
    return word.match(/^\w+\.\w+\.\w+$/);
};

Geocoder.prototype.validateLatLng = function(latlng) {
    var coordinates = latlng.split(',');
    if (coordinates.length === 2) {
        var lat = Number(coordinates[0]),
            lng = Number(coordinates[1]);
        if ((lng > -180 && lng < 180) && (lat > -90 && lat < 90)) {
            return true;
        }
    }
    return;
};

/**
 * Getters
 */
Geocoder.prototype.getLanguage = function() {
    return this.language;
};

Geocoder.prototype.getUserAgent = function() {
    return this.userAgent;
};

Geocoder.prototype.getEndpoint = function() {
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
Geocoder.prototype.execute = function(method, params) {
    return new Promise(_.bind(function(resolve, reject) {
        var finalParams = _.extend({
            key: this.apiKey
        }, params);

        var options = {
            url: this.endpoint + method,
            qs: finalParams
        };

        request.get(options, function(error, response, body) {
            if (error) {
                reject({
                    code: 404,
                    msg: error
                });
            } else {
                if (response.statusCode !== 200) {
                    reject({
                        code: response.statusCode,
                        msg: 'Unable to connect to the API endpoint ' + options.url
                    });
                } else if (response.body.error) {
                    reject(response.body);
                }
                if (body) {
                    if (params.format && params.format.toLowerCase() !== 'json') {
                        resolve(response.body);
                    } else {
                        resolve(JSON.parse(response.body));
                    }
                }
            }
        });
    }, this));
};
