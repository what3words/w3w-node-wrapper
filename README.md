[![what3words](https://what3words.com/assets/images/w3w_square_red.png)](https://developer.what3words.com)

# what3words JavaScript API Wrapper

[![CircleCI](https://circleci.com/gh/what3words/w3w-node-wrapper.svg?style=svg)](https://github.com/what3words/w3w-node-wrapper)

A JavaScript library to make requests to the [what3words REST API][api]. **Now with better support for use within both browser and node based environments!** See the what3words public API [documentation](apidocs) for more information about how to use our REST API.

## Table of Contents

- [Overview](#overview)
- [Install](#install)
- [Usage](#usage)
  - [JavaScript](#javascript)
  - [Typescript](#typescript)
- [Documentation](#documentation)
  - [What3wordsService](#what3words-service)
  - [Clients](#clients)
  - [Transport](#transport)
  - Examples
    - [Vanilla Autosuggest](docs/examples/vanilla/autosuggest/README.md)
    - [Vanilla Map](docs/examples/vanilla/map/README.md)
- [Examples](#examples)
  - [CustomTransport](#custom-transport)
  - [Autosuggest](#autosuggest)
  - [Convert to Coordinates](#convert-to-coordinates)
  - [Convert to Three Word Address](#convert-to-three-word-address)
  - [Available Languages](#available-languages)
  - [Grid Section](#grid-section)

## Overview

The what3words JavaScript wrapper gives you programmatic access to:

- [Convert a 3 word address to coordinates](https://developer.what3words.com/public-api/docs#convert-to-coords)
- [Convert coordinates to a 3 word address](https://developer.what3words.com/public-api/docs#convert-to-3wa)
- [Autosuggest functionality which takes a slightly incorrect 3 word address, and suggests a list of valid 3 word addresses](https://developer.what3words.com/public-api/docs#autosuggest)
- [Obtain a section of the 3m x 3m what3words grid for a bounding box.](https://developer.what3words.com/public-api/docs#grid-section)
- [Determine the currently support 3 word address languages.](https://developer.what3words.com/public-api/docs#available-languages)

## Install

[npm][]:

```sh
npm install @what3words/api
```

[yarn][]:

```sh
yarn add @what3words/api
```

If you wish to use the built-in transports you will also need to install the peer dependencies for them. For more information on the default transports read the section on [Transports](#transport).

## Usage

### JavaScript

```javascript
const what3words,
  { fetchTransport } = require('@what3words/api');

const apiKey = '<YOUR_API_KEY>';
const config = {
  host: 'https://api.what3words.com',
  apiVersion: 'v3',
};
const transport = fetchTransport(); // or you can import 'axiosTransport' instead
const w3wService = what3words(apiKey, config, { transport });

// you can uncomment the following lines to set your api key and config after instantiation of the w3w service
// w3wService.setApiKey(apiKey);
// w3wService.setConfig(config);
```

### Typescript

```typescript
import what3words, {
  ApiVersion,
  Transport,
  What3wordsService,
  axiosTransport,
} from '@what3words/api';

const apiKey = '<YOUR_API_KEY>';
const config: {
  host: string;
  apiVersion: ApiVersion;
} = {
  host: 'https://api.what3words.com',
  apiVersion: ApiVersion.Version3,
};
const transport: Transport = axiosTransport();
const w3wService: What3wordsService = what3words(apiKey, config, { transport });

// code continues...
```

## Documentation

### what3words Service

The `What3wordsService` provides a quick and easy way to instantiate the API clients that can be used to make requests against the what3words API. It also provides helper functions for setting API configuration, such as host and API version and your API key across the what3words API clients.

### Clients

The what3words API clients in this library are used to validate request options, serialise and handle request/response and errors against an API endpoint. Each client extends the abstract `ApiClient` class.

There is a specific client for each request and you can use them independently of the `What3wordsService`. This can be particularly useful if you want to extend the client behaviour, minimise your code or, in a more extreme example, use a custom transport to handle requests differently in each client.

Every client accepts the following parameters:

| Parameter | Datatype          | Default value                |
| --------- | ----------------- | ---------------------------- |
| apiKey    | string            | `''`                         |
| config    | config.host       | `https://api.what3words.com` |
|           | config.apiVersion | `v3`                         |

### Transport

The transport is a function responsible for executing the request against the API. Given a `ClientRequest` the transport should return a promise that resolves to `TransportResponse`.

A `ClientRequest` consists of the following properties:

| Property     | Datatype                             |
| ------------ | ------------------------------------ |
| **host**\*   | `string`                             |
| **url**\*    | `string`                             |
| **method**\* | `get` or `post`                      |
| **query**    | `object`                             |
| **headers**  | `object`                             |
| **body**     | `object`                             |
| **format**\* | `json` or `geojson`. Default: `json` |

A `TransportResponse` consists of the following properties:

| Property         | Datatype |
| ---------------- | -------- |
| **status**\*     | `number` |
| **statusText**\* | `string` |
| **body**\*       | `any`    |
| **headers**      | `object` |

There are two built-in transports available with this library that you can use; either [cross-fetch][] or [axios][]. By specifying which transport you would like to use on initialisation of the `What3wordsService` or a client, if you wish to instantiate a client for yourself.

#### Built-ins

There are two built-in transports available:

- [Cross-fetch][cross-fetch]
- [Axios][axios]

In order to use either of these you will need install the peer dependency. By default [cross-fetch][cross-fetch] is assumed by the `What3wordsService` or any instantiated client where no override is provided.

[npm][]:

```sh
npm install cross-fetch
```

or

```sh
npm install axios
```

[yarn][]:

```sh
yarn add cross-fetch
```

or

```sh
yarn add axios
```

#### Custom

You can provide your own custom transport, if you wish to use another library for handling requests, which might be useful if you have other integrations or you are already using a http library elsewhere.

In order to do so you need to define your own `Transport` and pass it into the `What3wordsService` or client to use it.

The custom `Transport` you create should be a function that accepts a `ClientRequest` as an argument and returns a promise that resolves to a `TransportResponse`.

## Examples

### Custom Transport

```typescript
import what3words, { ClientRequest, TransportResponse } from '@what3words/api';
import superagent from 'superagent';

const API_KEY = '<YOUR_API_KEY>';
const config = {}; // This will ensure we do not override the defaults

function customTransport<ResponseType>(
  request: ClientRequest
): Promise<TransportResponse<ResponseType>> {
  const {
    method,
    host,
    url,
    query = {},
    headers = {},
    body = {},
    format,
  } = request;
  return new Promise(resolve =>
    superagent[method](`${host}${url}`)
      .query({ ...query, format })
      .send(body || {})
      .set(headers)
      .end((err, res) => {
        if (err || !res)
          return resolve({
            status: err.status || 500,
            statusText: err.response.text || 'Internal Server Error',
            headers: err.headers || {},
            body: err.response.text || null,
          });
        const response: TransportResponse<ResponseType> = {
          status: res.status,
          statusText: res.text,
          headers: res.headers,
          body: res.body,
        };
        resolve(response);
      })
  );
}

const service = what3words(API_KEY, config, { transport: customTransport });
service
  .availableLanguages()
  .then(({ languages }) => console.log('Available languages', languages));
```

### Autosuggest

```typescript
import {
  AutosuggestClient,
  AutosuggestOptions,
  AutosuggestResponse,
} from '@what3words/api';

const API_KEY = '<YOUR_API_KEY>';
const client: AutosuggestClient = AutosuggestClient.init(API_KEY);
const options: AutosuggestOptions = {
  input: 'filled.count.s',
};
client
  .run(options)
  .then((res: AutosuggestResponse) =>
    console.log(`suggestions for "${options.input}"`, res)
  );
```

### Convert to Coordinates

```typescript
import {
  ConvertToCoordinatesClient,
  ConvertToCoordinatesOptions,
  FeatureCollectionResponse,
  LocationGeoJsonResponse,
  LocationJsonResponse,
} from '@what3words/api';

const API_KEY = '<YOUR_API_KEY>';
const client: ConvertToCoordinatesClient =
  ConvertToCoordinatesClient.init(API_KEY);
const options: ConvertToCoordinatesOptions = { words: 'filled.count.soap' };

// If you want to retrieve the JSON response from our API
client
  .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
  .then((res: LocationJsonResponse) =>
    console.log('Convert to coordinates', res)
  );

// If you want to retrieve the GeoJsonResponse from our API
client
  .run({ ...options, format: 'geojson' })
  .then((res: FeatureCollectionResponse<LocationGeoJsonResponse>) =>
    console.log('Convert to coordinates', res)
  );
```

### Convert to Three Word Address

```typescript
import {
  ConvertTo3waClient,
  ConvertTo3waOptions,
  FeatureCollectionResponse,
  LocationGeoJsonResponse,
  LocationJsonResponse,
} from '@what3words/api';

const API_KEY = '<YOUR_API_KEY>';
const client: ConvertTo3waClient = ConvertTo3waClient.init(API_KEY);
const options: ConvertTo3waOptions = {
  coordinates: { lat: 51.520847, lng: -0.195521 },
};

// If you want to retrieve the JSON response from our API
client
  .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
  .then((res: LocationJsonResponse) => console.log('Convert to 3wa', res));

// If you want to retrieve the GeoJsonResponse from our API
client
  .run({ ...options, format: 'geojson' })
  .then((res: FeatureCollectionResponse<LocationGeoJsonResponse>) =>
    console.log('Convert to 3wa', res)
  );
```

### Available Languages

```typescript
import {
  AvailableLanguagesClient,
  AvailableLanguagesResponse,
} from '@what3words/api';

const API_KEY = '<YOUR_API_KEY>';
const client: AvailableLanguagesClient = AvailableLanguagesClient.init(API_KEY);
client
  .run()
  .then((res: AvailableLanguagesResponse) =>
    console.log('Available Languages', res)
  );
```

### Grid Section

```typescript
import {
  GridSectionClient,
  GridSectionOptions,
  FeatureCollectionResponse,
  GridSectionGeoJsonResponse,
  GridSectionJsonResponse,
} from '../src';

const API_KEY = '<YOUR_API_KEY>';
const client: GridSectionClient = GridSectionClient.init(API_KEY);
const options: GridSectionOptions = {
  boundingBox: {
    southwest: { lat: 52.208867, lng: 0.11754 },
    northeast: { lat: 52.207988, lng: 0.116126 },
  },
};

// If you want to retrieve the JSON response from our API
client
  .run({ ...options, format: 'json' }) // { format: 'json' } is the default response
  .then((res: GridSectionJsonResponse) => console.log('Grid Section', res));

// If you want to retrieve the JSON response from our API
client
  .run({ ...options, format: 'geojson' }) // { format: 'json' } is the default response
  .then((res: FeatureCollectionResponse<GridSectionGeoJsonResponse>) =>
    console.log('Grid Section', res)
  );
```

> **The requested box must not exceed 4km from corner to corner, or a BadBoundingBoxTooBig error will be returned. Latitudes must be >= -90 and <= 90, but longitudes are allowed to wrap around 180. To specify a bounding-box that crosses the anti-meridian, use longitude greater than 180.**

### Input validation

```typescript
import {
  GridSectionClient,
  GridSectionOptions,
  FeatureCollectionResponse,
  GridSectionGeoJsonResponse,
  GridSectionJsonResponse,
} from '../src';

const API_KEY = '<YOUR_API_KEY>';
const client: GridSectionClient = GridSectionClient.init(API_KEY);
const options: GridSectionOptions = {
  boundingBox: {
    southwest: { lat: 52.208867, lng: 0.11754 },
    northeast: { lat: 52.207988, lng: 0.116126 },
  },
};

// Search a string for any character sequences that could be three word addresses
client.findPossible3wa('filled.count.soap'); // returns ['filled.count.soap']
client.findPossible3wa(
  'this string contains a three word address substring: filled.count.soap'
); // returns ['filled.count.soap']
client.findPossible3wa('filled.count'); // returns []

// Search a string for any character sequences that could be three word addresses
client.isPossible3wa('filled.count.soap'); // returns true
client.isPossible3wa(
  'this string contains a three word address substring: filled.count.soap'
); // returns false
client.isPossible3wa('filled.count'); // returns false

// Search a string for any character sequences that could be three word addresses
client.isValid3wa('filled.count.soap'); // returns Promise<true>
client.isValid3wa(
  'this string contains a three word address substring: filled.count.soap'
); // returns Promise<false>
client.isValid3wa('filled.count.negative'); // returns Promise<false>
```

##

[npm]: https://www.npmjs.com/
[yarn]: https://yarnpkg.com/
[api]: https://developer.what3words.com/public-api/
[apidocs]: https://developer.what3words.com/public-api/docs
[cross-fetch]: https://www.npmjs.com/package/cross-fetch
[axios]: https://www.npmjs.com/package/axios
