bing-pulse
=========

[![NPM version](https://badge.fury.io/js/bing-pulse.png)](http://badge.fury.io/js/bing-pulse)
[![Dependency Status](https://gemnasium.com/przemyslawpluta/bing-pulse.png)](https://gemnasium.com/przemyslawpluta/bing-pulse)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/przemyslawpluta/bing-pulse?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Consume [Microsoft Bing Pulse API](https://www.bingpulse.com/)

## Installation

With [npm](https://www.npmjs.com/) do:

```
npm install bing-pulse
```

## Example

``` js

  var pulse = require('bing-pulse').create();

  pulse.init({
    pulseApiKey: '',
    customerApiKey: ''
  });

  pulse.on('questions', function questions(data) {});

  pulse.on('pulses', function pulses(data) {});

  pulse.on('annotations', function annotations(data) {});

  pulse.on('error', function error(err) {});

```

## Methods

Require and create new pulse.

``` js
  var pulse = require('bing-pulse').create();
```

## pulse.init(opts)
Initialize pulse by passing your bing pulse and customer API keys.

``` js
  var opts = {
    pulseApiKey: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    customerApiKey: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' //optional
  };

  pulse.init(opts);
```

Available options:

- `opts.pulseApiKey` your bing pulse API key
- `opts.customerApiKey` your bing customer API key (optional)
- `opts.interval` how often to check the pulse `in seconds` (optional)
- `opts.inactive` set to `neutral` to default graph point to 0 or `previous` to default graph point to previous one if users inactive (optional)

By default bing pulse API returns only graph points if users actually voted. Assuming you're plotting in `5s` intervals you'd expect to get 6 graph points in 30s. If no users voted you'll get 0 graph points. Use `opts.inactive` to plot the points or omit to get the default bing pulse API behaviour.

## pulse.endpoints(cb)
Get an array of available API endpoints you can listen on.

``` js
  pulse.endpoints(function endpoints(data) {});
```

## Events

List of available events.

## pulse.on('questions', cb);
Listen on questions.

``` js
  pulse.on('questions', function questions(data) {});
```

## pulse.on('pulses', cb);
Listen on pulses.

``` js
  pulse.on('pulses', function pulses(data) {});
```

## pulse.on('annotations', cb)
Listen on pulse annotations.

``` js
  pulse.on('annotations', function annotations(data) {});
```

## pulse.on('stats', cb)
Listen on request stats.

``` js
  pulse.on('stats', function stats(data) {});
```

## pulse.on('error', cb)
Listen on errors.

``` js
  pulse.on('error', function error(err) {});
```

## Listen on endpoints
Listen on available bing pulse API endpoints.

``` js
  pulse.on('endpoints:meta', function meta(data) {});

  pulse.on('endpoints:pulses', function pulses(data) {});

  pulse.on('endpoints:questions', function questions(data) {});

  pulse.on('endpoints:customer', function customer(data) {});
```

## To do
- [x] questions
- [x] pulses
- [x] annotations
- [ ] quizzes


## License
MIT
