# JS.Geo.What3Words

A node.js wrapper for the [What3Words](http://what3words.com/) API.

Turns WGS84 coordinates into three words or OneWords and vice-versa using what3words.com HTTP API

Further information on the What3Words API and its features is available at [http://what3words.com/api/reference](http://what3words.com/api/reference).

## Installation

Installing using npm (node package manager):

    npm install geo.what3words

If you don't have npm installed or don't want to use it:

    cd ~/.node_libraries
    git clone git://github.com/lokku/js-geo-what3words.git what3words

Please note that parts of this library depend on [request](https://github.com/request/request). This library needs to be installed for the API to work.


## Usage ##

### Initialization ###
```javascript
var What3Words = require('./lib/geo.what3words.js'),
    w3w = new What3Words('YOUR_API_KEY');
```

The constructor function also takes an optional configuration object:

```javascript
var What3Words = require('./lib/geo.what3words.js'),
    w3w = new What3Words('YOUR_API_KEY', {
    	language: 'ru',
    	userAgent: 'Your custom UA'
    });
```

### Forward ###
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
* _full_ returns the full response of the api
* You can pass all [request params](https://docs.what3words.com/api/v2/#forward-params)  

### Reverse ###
```javascript
w3w.reverse({
  coords: '51.484463,-0.195405'
}).then(function(response) {
  console.log(response); //prom.cape.pump
});
```

Optional parameters:

* _full_ returns the full response of the api
* _lang_ sets a different language for the response
* You can pass all [request params](https://docs.what3words.com/api/v2/#reverse-params)

### Autosuggest ###
```javascript
w3w.autosuggest({
  addr: 'plan.clips.a'
}).then(function(response) {
  console.log(response);
});
```

Optional parameters:

* _full_ returns the full response of the api
* _lang_ sets a different language for the response
* You can pass all [request params](https://docs.what3words.com/api/v2/#autosuggest-params)

### StandardBlend ###
```javascript
w3w.standardBlend({
  addr: 'plan.clips.a'
}).then(function(response) {
  console.log(response);
});
```

Optional parameters:

* _lang_ sets a different language for the response
* You can pass all [request params](https://docs.what3words.com/api/v2/#standardblend)

### Grid ###
```javascript
w3w.grid({
  bbox: '52.208867,0.117540,52.207988,0.116126'
}).then(function(response) {
  console.log(response);
});
```

Optional parameters:

* You can pass all [request params](https://docs.what3words.com/api/v2/#grid-params)


### GetLanguages ###
```javascript
w3w.getLanguages({}).then(function(response) {
  console.log(response); // [ 'de', 'en', 'es', 'fr', 'it', 'pt', 'ru', 'sv', 'sw', 'tr' ]
});
```

Optional parameters:

* _full_ returns the full response of the api
* _lang_ sets a different language for the response


### Errors ###

All the methods return a promise.

## License

_JS.Geo.What3Words_ is licensed under the MIT License. (See [LICENSE](https://github.com/lokku/js-geo-what3words/blob/master/LICENCe.md))
