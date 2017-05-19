# <img src="https://what3words.com/assets/images/w3w_square_red.png" width="32" height="32" alt="what3words">&nbsp;w3w-node-wrapper [![Build Status](https://travis-ci.org/what3words/w3w-node-wrapper.svg?branch=master)](https://travis-ci.org/what3words/w3w-node-wrapper)

A [Node.js](https://nodejs.org/en/) wrapper to authenticate and interact with v2 of the [what3words RESTful API](https://docs.what3words.com/api/v2/).

## Credits

Originally developed by the [Lokku](http://lokku.com/) and [OpenCage Data](http://www.opencagedata.com/) teams as `js-geo-what3words`; thanks and credit are due to all the contributors and to OpenCage Data for donating this repository to what3words.

## Installation

### Via NPM

Installing using npm (node package manager):

```bash
$ npm install w3w-node-wrapper
```

### Via Git Clone

If you don't have `npm` installed or don't want to use it:

```
$ cd ~/.node_libraries
$ git clone git://github.com/what3words/w3w-node-wrapper what3words
```

Please note that parts of this wrapper depend on [request](https://github.com/request/request), which is installed as part of the wrapper's dependencies.

### Via Download

The latest version is always available for download from https://github.com/what3words/w3w-node-wrapper/archive/master.zip

## Getting Started

You'll need to [register](https://what3words.com/register?dev=true) for a what3words API key to access the API. The key is passed to a new instance of the `W3W.Geocoder` class.

### Initialization ###
```javascript
var Geocoder = require('w3w-node-wrapper');
var options = {
        apiKey: 'API-KEY'   // Mandatory
        language: 'fr'      // optional
        userAgent: 'Custom UserAgent string' // optional
};
var w3w = new Geocoder(options);
```

## Forward Geocoding

Forward geocodes a 3 word address to a position, expressed as coordinates of latitude and longitude.

See also the [what3words API forward geocoding documentation](https://docs.what3words.com/api/v2/#forward) for more detailed information.

```javascript
w3w.forward({
    addr: 'prom.cape.pump'
}).then(function(response) {
    console.log(response); // 51.484463,-0.195405
}).catch(function(err) {
    console.log(err);
});
```

Optional parameters:

* _lang_ sets a different language for the response
* _full_ returns the full response payload from the API
* You can pass all supported [`forward` API request parameters](https://docs.what3words.com/api/v2/#forward-params) as part of the `options` object literal

## Reverse Geocoding

Reverse geocodes coordinates, expressed as latitude and longitude to a 3 word address.

See also the [what3words API reverse geocoding documentation](https://docs.what3words.com/api/v2/#reverse) for more detailed information.

```javascript
w3w.reverse({
    coords: '51.484463,-0.195405'
}).then(function(response) {
    console.log(response); //prom.cape.pump
});
```

Optional parameters:

* _lang_ sets a different language for the response
* _full_ returns the full response payload from the API
* You can pass all supported [`reverse` API request parameters](https://docs.what3words.com/api/v2/#reverse-params) as part of the `options` object literal

## AutoSuggest

Returns a list of 3 word addresses based on user input and other parameters.

This method provides corrections for the following types of input error:

* typing errors
* spelling errors
* misremembered words (e.g. singular vs. plural)
words in the wrong order

The `autosuggest` method determines possible corrections to the supplied 3 word address string based on the probability of the input errors listed above and returns a ranked list of suggestions. This resource can also take into consideration the geographic proximity of possible corrections to a given location to further improve the suggestions returned.

See also the [what3words API autosuggest documentation](https://docs.what3words.com/api/v2/#autosuggest) for more detailed information.

```javascript
w3w.autosuggest({
    addr: 'plan.clips.a'
}).then(function(response) {
    console.log(response);
});
```

Optional parameters:

* _lang_ sets a different language for the response
* _full_ returns the full response payload from the API
* You can pass all supported [`autosuggest` API request parameters](https://docs.what3words.com/api/v2/#autosuggest-params) as part of the `options` object literal

## StandardBlend

Returns a blend of the three most relevant 3 word address candidates for a given location, based on a full or partial 3 word address.

The specified 3 word address may either be a full 3 word address or a partial 3 word address containing the first 2 words in full and at least 1 character of the 3rd word. The `standardblend` method provides the search logic that powers the search box on [map.what3words.com](map.what3words.com) and in the what3words mobile apps.

See also the [what3words API standardblend documentation](https://docs.what3words.com/api/v2/#standardblend) for more detailed information.

```javascript
w3w.standardBlend({
    addr: 'plan.clips.a'
}).then(function(response) {
    console.log(response);
});
```

Optional parameters:

* _lang_ sets a different language for the response
* You can pass all supported [`standardblend` API request parameters](https://docs.what3words.com/api/v2/#standardblend-params) as part of the `options` object literal

## Grid

Returns a section of the 3m x 3m what3words grid for a given area.

See also the [what3words API grid documentation](https://docs.what3words.com/api/v2/#grid) for more detailed information.

```javascript
w3w.grid({
    bbox: '52.208867,0.117540,52.207988,0.116126'
}).then(function(response) {
    console.log(response);
});
```

Optional parameters:

* You can pass all supported [`grid` API request parameters](https://docs.what3words.com/api/v2/#grid-params) as part of the `options` object literal

## Get Languages

Retrieves a list of the currently loaded and available 3 word address languages.

See also the [what3words API languages documentation](https://docs.what3words.com/api/v2/#lang) for more detailed information.

```javascript
w3w.languages({}).then(function(response) {
    console.log(response); // [ 'de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'sv', 'sw', 'tr' ]
});
```
