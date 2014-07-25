# JS.Geo.What3Words

A node.js wrapper for the What3Words API.

Turns WGS84 coordinates into three words or OneWords and vice-versa using what3words.com HTTP API

Further information on the What3Words API and its features is available at [http://what3words.com/api/reference](http://what3words.com/api/reference). 

## Installation

Installing using npm (node package manager):

    npm install what3words
    
If you don't have npm installed or don't want to use it:

    cd ~/.node_libraries
    git clone git://github.com/lokku/js-geo-what3words.git what3words

Please note that parts of this library depend on [unirest](https://github.com/Mashape/unirest-nodejs) by [Mashape](https://github.com/Mashape/). This library needs to be installed for the API to work.


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
    	language: ''ru',
    	userAgent: ''Your custom UA'
    });
```

### Words2Position ###
```javascript
w3w.wordsToPosition({
  words: 'prom.cape.pump'
}, function(response) {
  console.log(response); // 51.484463,-0.195405 
});
```

Optional parameters:

* _full_ returns the full response of the api
* _lang_ sets a different language for the response

### Position2Words ###
```javascript
w3w.positionToWords({
  position: '51.484463,-0.195405'
}, function(response) {

  console.log(response); //prom.cape.pump
});
```

Optional parameters:

* _full_ returns the full response of the api
* _lang_ sets a different language for the response

### OneWordAvailable ###
```javascript
w3w.oneWordAvailable({
  word: 'nestoria'
}, function(response) {

  console.log(response); // 1
});
```

Optional parameters:

* _full_ returns the full response of the api
* _lang_ sets a different language for the response


### GetLanguages ###
```javascript
w3w.getLanguages({}, function(response) {
  console.log(response); // [ 'de', 'en', 'es', 'fr', 'pt', 'ru', 'sv', 'tr' ]
});
```

Optional parameters:

* _full_ returns the full response of the api
* _lang_ sets a different language for the response 


## License

_JS.Geo.What3Words_ is licensed under the MIT License. (See [LICENSE](https://github.com/lokku/js-geo-what3words/blob/master/LICENCe.md))