/*
 * bing-pulse
 *
 * Copyright (c) 2015-2016 Przemyslaw Pluta
 * Licensed under the MIT license.
 * https://github.com/przemyslawpluta/bing-pulse/blob/master/LICENSE
 */

var util = require('util'),
    request = require('request');

function getApiPath(endPoint, target) {

    'use strict';
    return util.format('/%s/%s/%s', endPoint.apiRoot, endPoint.apiVersion, endPoint.endpoints[target]);
}

function getPulseAggregatesOptions(endpoint, timeInterval) {

    'use strict';
    var options = {
        uri: 'http://' + endpoint.host + getApiPath(endpoint, 'pulseAggregates'),
        json: true,
        headers: {
            accept: 'application/json',
            authorization: endpoint.pulseApiKey
        }
    };

    if (timeInterval && !isNaN(+timeInterval)) {
        options.path += '?timeInterval=' + timeInterval;
    }

    return options;
}

function getQuestionAggregatesOptions(endpoint) {

    'use strict';
    return {
        uri: 'http://' + endpoint.host + getApiPath(endpoint, 'questionAggregates'),
        json: true,
        headers: {
            accept: 'application/json',
            authorization: endpoint.pulseApiKey
        }
    };
}

function getMetadataOptions(endpoint) {

    'use strict';
    return {
        uri: 'http://' + endpoint.host + getApiPath(endpoint, 'metadata'),
        json: true,
        headers: {
            accept: 'application/json',
            authorization: endpoint.pulseApiKey
        }
    };
}

function getCustomerPulsesSummaryOptions(endpoint, opts) {

    'use strict';
    var options = {
        uri: 'http://' + endpoint.host + getApiPath(endpoint, 'customerPulsesSummary'),
        json: true,
        headers: {
            accept: 'application/json',
            authorization: endpoint.customerApiKey
        }
    };

    if (!opts) {
        return options;
    }

    var statuses = opts.statuses,
        hasPoll = opts.hasPoll,
        hasPulse = opts.hasPulse,
        querystring = [];


    if (statuses && statuses.length) {
        querystring.push(util.format('statuses=%s', encodeURIComponent(statuses.join(','))));
    }

    if (typeof(hasPoll) !== 'undefined') {
        querystring.push(util.format('hasPoll=%s', !!hasPoll));
    }

    if (typeof(hasPulse) !== 'undefined') {
        querystring.push(util.format('hasPulse=%s', !!hasPulse));
    }

    if (querystring.length) {
        options.path += util.format('?%s', querystring.join('&'));
    }

    return options;
}

function getRequest(options, callback) {

    'use strict';

    request(options, function get(err, resp, body) {
        if (err) { return callback(err); }
        if (resp.statusCode === 200) { return callback(null, body); }
        callback(new Error(body.Message || body || resp.statusCode));
    });
}

function getPulseAggregates(endpoint, timeInterval, callback) {

    'use strict';
    if (typeof timeInterval === 'function') { callback = timeInterval; }
    return getRequest(getPulseAggregatesOptions(endpoint, timeInterval), callback);
}

function getQuestionAggregates(endpoint, callback) {

    'use strict';
    return getRequest(getQuestionAggregatesOptions(endpoint), callback);
}

function getMetadata(endpoint, callback) {

    'use strict';
    return getRequest(getMetadataOptions(endpoint), callback);
}

function getCustomerPulsesSummary(endpoint, opts, callback) {

    'use strict';
    if (typeof opts === 'function') {
        callback = opts;
        opts = null;
    }
    return getRequest(getCustomerPulsesSummaryOptions(endpoint, opts), callback);
}

module.exports = {
    getPulseAggregates: getPulseAggregates,
    getQuestionAggregates: getQuestionAggregates,
    getMetadata: getMetadata,
    getCustomerPulsesSummary: getCustomerPulsesSummary
};
