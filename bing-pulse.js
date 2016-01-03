/*
 * bing-pulse
 *
 * Copyright (c) 2015-2016 Przemyslaw Pluta
 * Licensed under the MIT license.
 * https://github.com/przemyslawpluta/bing-pulse/blob/master/LICENSE
 */

var util = require('util'),
    events = require('events'),
    wait = require('waitjs'),
    _ = require('lodash'),
    sortObj = require('sort-object'),
    prettyMs = require('pretty-ms'),
    config = require('./config.json'),
    api = require('./lib/api'),
    questionsProcessor = require('./lib/questionsProcessor'),
    pulseProcessor = require('./lib/pulseProcessor'),
    annotationsProcessor = require('./lib/annotationsProcessor');

var apiList = [
    {id: 'meta', target: 'getMetadata'},
    {id: 'pulses', target: 'getPulseAggregates'},
    {id: 'questions', target: 'getQuestionAggregates'},
    {id: 'customer', target: 'getCustomerPulsesSummary'}
];

function pushError(_this, err, extra) {

    'use strict';
    if (_this.listeners('error').length) {
        if (extra) { err.message = err.message + ' ' + extra; }
        _this.emit('error', err);
    }
}

function processData(_this, statistics, stash) {

    'use strict';
    statistics.featched = prettyMs(process.hrtime(statistics.hrstart)[1]/1000000);
    statistics.list = sortObj(statistics.list);

    if (_this.listeners('questions').length) {
        questionsProcessor(stash, function done(err, data) { _this.emit('questions', data); });
    }

    if (_this.listeners('pulses').length) {
        pulseProcessor(stash, function done(err, data) { _this.emit('pulses', data); });
    }

    if (_this.listeners('annotations').length) {
        annotationsProcessor(stash, function done(err, data) { _this.emit('annotations', data); });
    }

    if (_this.listeners('stats').length) { _this.emit('stats', _.omit(statistics, ['hrstart', 'count'])); }
}

function handleData(_this, data, statistics, id, stash) {

    'use strict';
    var currentLn = data.length;
    stash[id] = (id !== 'meta') ? data : data[0];
    statistics.list[id] = currentLn;
    if (statistics.count === 0) { processData(_this, statistics, stash); }
}

function pushRaw(_this, group, data) {
    'use strict';
    _.values(group).forEach(function items(item) {
        if (_this.listeners('endpoints:' + item).length) {
            _this.emit('endpoints:' + item, data);
        }
    });
}

function checkListeners(_this, list) {
    'use strict';
    return _.remove(list.map(function items(item) { return _this.listeners(item).length; })).length;
}

function getData(_this, endpoint, stash) {

    'use strict';
    var reject = [];
    if (!endpoint.customerApiKey || !checkListeners(_this, ['pulses', 'endpoints:pulses', 'endpoints:customer'])) { reject.push('customer'); }
    if (!checkListeners(_this, ['questions', 'endpoints:questions'])) { reject.push('questions'); }
    if (!checkListeners(_this, ['pulses', 'endpoints:pulses'])) { reject.push('pulses'); }

    reject.forEach(function items(item) { apiList = _.reject(apiList, {id: item}); });

    var statistics = {
        list: {},
        hrstart: process.hrtime(),
        count: apiList.length
    };

    stash.pulseApiKey = endpoint.pulseApiKey;
    stash.eventStatuses = endpoint.eventStatuses;
    stash.questionStatuses = endpoint.questionStatuses;
    if (endpoint.inactive) { stash.inactive = endpoint.inactive; }

    apiList.forEach(function items(item) {
        api[item.target](endpoint, function list(err, data) {
            if (err) { return pushError(_this, err, '[ ' + item.target + ' ]'); }
            pushRaw(_this, item, data);
            statistics.count = statistics.count - 1;
            if (item.id === 'meta') { data = [data]; }
            handleData(_this, data, statistics, item.id, stash);
        });
    });

}

function init() {

    'use strict';

    return {

        endpoints: function endpoints(callback) {
            callback(apiList.map(function items(item) { return item.id; }));
        },

        init: function init(opt) {

            if (!opt || (opt && (!opt.pulseApiKey))) {
                return console.log(new Error('Missing Pulse API Key'));
            }

            var endpoint = _.assign(_.clone(config),
                _.pick(opt, 'pulseApiKey', 'customerApiKey', 'inactive')),
                stash = {}, _this = this;

            process.nextTick(function nextTick() {

                getData(_this, endpoint, stash);

                if (opt && opt.interval) {
                    repeat(opt.interval * 1000, function repeatIt() { getData(_this, endpoint, stash); });
                }

            });

        }

    };

}

var Notify = function Notify() {
    'use strict';
    _.assign(this, init());
    events.EventEmitter.call(this);
};

util.inherits(Notify, events.EventEmitter);

module.exports = Notify;

module.exports.create = function create() {
    'use strict';
    return new Notify();
};
