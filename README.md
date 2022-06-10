[![what3words](https://what3words.com/assets/images/w3w_square_red.png)](https://developer.what3words.com)
# what3words JavaScript API Wrapper

[![CircleCI](https://circleci.com/gh/what3words/w3w-node-wrapper.svg?style=svg)](https://github.com/what3words/w3w-node-wrapper)

A JavaScript library to make requests to the [what3words REST API][api]. __Now with better support for use within both browser and node based environments!__ See the what3words public API [documentation](apidocs) for more information about how to use our REST API.

## Table of Contents

* [Overview](#overview)
* [Install](#install)
* [Usage](#usage)
  * [JavaScript](#javascript)
  * [Typescript](#typescript)
* [Documentation](#documentation)
  * [What3wordsService](#what3words-service)
  * [Clients](#clients)
  * [Transport](#transport)
* [Examples](#examples)
  * [CustomTransport](#custom-transport)
  * [Autosuggest](#autosuggest)
  * [Convert to Coordinates](#convert-to-coordinates)
  * [Convert to Three Word Address](#convert-to-three-word-address)
  * [Available Languages](#available-languages)
  * [Grid Section](#grid-section)

## Overview

The what3words JavaScript wrapper gives you programmatic access to:

* [Convert a 3 word address to coordinates](https://developer.what3words.com/public-api/docs#convert-to-coords)
* [Convert coordinates to a 3 word address](https://developer.what3words.com/public-api/docs#convert-to-3wa)
* [Autosuggest functionality which takes a slightly incorrect 3 word address, and suggests a list of valid 3 word addresses](https://developer.what3words.com/public-api/docs#autosuggest)
* [Obtain a section of the 3m x 3m what3words grid for a bounding box.](https://developer.what3words.com/public-api/docs#grid-section)
* [Determine the currently support 3 word address languages.](https://developer.what3words.com/public-api/docs#available-languages)

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
const what3words, { fetchTransport } = require("@what3words/api");

const apiKey = '<YOUR_API_KEY>';
const config = {
  host: 'https://api.what3words.com',
  apiVersion: 'v3',
}
const transport = fetchTransport(); // or you can import 'axiosTransport' instead
const w3wService = what3words(apiKey, config, { transport });

// you can uncomment the following lines to set your api key and config after instantiation of the w3w service
// w3wService.setApiKey(apiKey);
// w3wService.setConfig(config);
```

### Typescript

```typescript
import what3words, { ApiVersion, Transport, What3wordsService, axiosTransport } from '@what3words/api';

const apiKey: string = '<YOUR_API_KEY>';
const config: {
  host: string,
  apiVersion: ApiVersion,
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

| Parameter   | Datatype          | Default value                |
| ----------- | ----------------- | ---------------------------- |
| apiKey      | string            | `''`                         |
| config      | config.host       | `https://api.what3words.com` |
|             | config.apiVersion | `v3`                         |

### Transport

The transport is a function responsible for executing the request against the API. Given a `ClientRequest` the transport should return a promise that resolves to `TransportResponse`.

A `ClientRequest` consists of the following properties:

| Property         | Datatype                             |
| ---------------- | ------------------------------------ |
| __host__*        | `string`                             |
| __url__*         | `string`                             |
| __method__*      | `get` or `post`                      |
| __query__        | `object`                             |
| __headers__      | `object`                             |
| __body__         | `object`                             |
| __format__*      | `json` or `geojson`. Default: `json` |

A `TransportResponse` consists of the following properties:

| Property         | Datatype          |
| ---------------- | ----------------- |
| __status__*      | `number`          |
| __statusText__*  | `string`          |
| __body__*        | `any`             |
| __headers__      | `object`          |

There are two built-in transports available with this library that you can use; either [cross-fetch][] or [axios][]. By specifying which transport you would like to use on initialisation of the `What3wordsService` or a client, if you wish to instantiate a client for yourself.

#### Built-ins

There are two built-in transports available:

* [Cross-fetch][cross-fetch]
* [Axios][axios]

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
const config = {} // This will ensure we do not override the defaults

async function customTransport(request: ClientRequest): Promise<TransportResponse> {
  const { method, host, url, query = {}, headers = {}, body = {}, format } = request;
  return superagent[method](`${host}${url}`)
    .query({ ...query, format })
    .send(body)
    .set(headers)
    .end((err, res) => {
      if (err) throw err;
      const reponse: TransportResponse = {
        status: res.status,
        statusText: res.
        headers: res.headers,
        body: res.body,
      };
      return response;
    })
}

const service = what3words(API_KEY, config, { transport: customTransport });
service.availableLanguages()
  .then(({ languages }) => console.log('Available languages', languages));
```

### Autosuggest

```typescript
import { ApiVersion, AutosuggestClient, AutosuggestOptions, AutosuggestResponse } from '@what3words/api';

const API_KEY: string = '<YOUR_API_KEY>';
const client: AutosuggestClient = AutosuggestClient.init(API_KEY);
const options: AutosuggestOptions = {
  input: 'filled.count.s',
};
client.run(options)
  .then((res: AutosuggestResponse) =>
    console.log(`suggestions for "${autosuggestOptions.input}"`, res)
  );
```

### Convert to Coordinates

```typescript
import { ConvertToCoordinatesClient, ConvertToCoordinatesOptions, ConvertToCoordinatesResponse } from '@what3words/api';

const API_KEY = '<YOUR_API_KEY>';
const client: ConvertToCoordinatesClient = ConvertToCoordinatesClient.init(API_KEY)
const options: ConvertToCoordinatesOptions = { words: 'filled.count.soap' };
client.run(options)
  .then((res: ConvertToCoordinatesResponse) => console.log('Convert to coordinates', res));
```

### Convert to Three Word Address

```typescript
import { ConvertTo3waClient, ConvertTo3waOptions, ConvertTo3waResponse } from '@what3words/api';

const API_KEY = '<YOUR_API_KEY>';
const client: ConvertTo3waClient = ConvertTo3waClient.init(API_KEY)
const options: ConvertTo3waOptions = { coordinates: { lat: 51.520847, lng: -0.195521 } };
client.run(options)
    .then((res: ConvertTo3waResponse) => console.log('Convert to 3wa', res));
```

### Available Languages

```typescript
import { AvailableLanguagesClient, AvailableLanguagesResponse } from '@what3words/api';

const API_KEY = '<YOUR_API_KEY>';
const client: AvailableLanguagesClient = AvailableLanguagesClient.init(API_KEY);
client.run()
    .then((res: AvailableLanguagesResponse) => console.log('Available Languages', res));
```

### Grid Section

```typescript
import { GridSectionClient, GridSectionOptions, GridSectionResponse } from '@what3words/api';

const API_KEY = '<YOUR_API_KEY>';
const client: AvailableLanguagesClient = AvailableLanguagesClient.init(API_KEY);
const options: GridSectionOptions = {
  southwest: { lat: 52.208867, lng: 0.117540 },
  northeast: { lat: 52.207988, lng: 0.116126 }
};
client.run(options)
    .then((res: GridSectionResponse) => console.log('Grid Section', res));
```

> __The requested box must not exceed 4km from corner to corner, or a BadBoundingBoxTooBig error will be returned. Latitudes must be >= -90 and <= 90, but longitudes are allowed to wrap around 180. To specify a bounding-box that crosses the anti-meridian, use longitude greater than 180.__

##

[npm]: https://www.npmjs.com/

[yarn]: https://yarnpkg.com/

[api]: https://developer.what3words.com/public-api/

[apidocs]: https://developer.what3words.com/public-api/docs

[cross-fetch]: https://www.npmjs.com/package/cross-fetch

[axios]: https://www.npmjs.com/package/axios
