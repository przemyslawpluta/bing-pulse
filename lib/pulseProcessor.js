/*
 * bing-pulse
 *
 * Copyright (c) 2015-2016 Przemyslaw Pluta
 * Licensed under the MIT license.
 * https://github.com/przemyslawpluta/bing-pulse/blob/master/LICENSE
 */

var _ = require('lodash'),
    moment = require('moment'),
    accounting = require('accounting'),
    decamelizeKeys = require('decamelize-keys'),
    filters = require('./filters');

function buildGroup(base, data) {
    'use strict';
    return base.map(function items(item) { return {title: item, data: data[item]}; });
}

function rebuildPulse(data, pulse, max) {

    'use strict';

    var timePoint = data.meta.Event.StartDateTimeUtc ? moment.utc(data.meta.Event.StartDateTimeUtc) : moment.utc(),
        intervalSeconds = data.meta.GraphGroupingIntervalSeconds,
        total = 0, maxPoint = [], points = [], pointOffset, point, i;

    for (i = 0; i <= max; i++) {
        point = _.find(pulse, {TimeInterval: i});
        pointOffset = timePoint.clone().add(i*intervalSeconds,'s').toISOString();

        if (point) {
            total = total + point.TotalCount;
            maxPoint.push({interval: point.TimeInterval, total: point.TotalCount, time: pointOffset});

            points[i] = {
                interval: point.TimeInterval,
                graph: accounting.toFixed(point.GraphPoint, 2),
                total: point.TotalCount,
                time: pointOffset,
                sentiment: accounting.toFixed(point.NetSentiment, 2),
                responses: filters.responses(data, point.Responses)
            };
        }

        if (!point && data.inactive) {
            points[i] = {
                interval: i,
                graph: ((data.inactive !== 'previous') ? 0 : ((points[i-1]) ? points[i-1].graph : 0)),
                total: 0,
                time: pointOffset,
                sentiment: 0,
                responses: []
            };
        }

    }

    return {
        stats: {
            total: total,
            max: _.max(maxPoint, 'total'),
            min: _.min(maxPoint, 'total')
        },
        points: _.compact(points)
    };

}

function processPoints(data) {

    'use strict';
    var demo = filters.demographics(data, 'Demographics'),
        customer = (data.customer) ? decamelizeKeys(_.find(data.customer, {'ApiKey': data.pulseApiKey}), '') : null,
        filterList = ['Overall'].concat(_.uniq(demo.map(function items(item) { return item.groupTitle; })));

    var details = {
        title: data.meta.Title || '',
        name: data.meta.Event.Name,
        theme: data.meta.ResponseTheme.Name || '',
        interval: data.meta.ResponseTheme.TimeBetweenPulses,
        timepoint: data.meta.Event.StartDateTimeUtc ? moment.utc(data.meta.Event.StartDateTimeUtc).toISOString() : moment.utc().toISOString()
    };

    var pulsesStatus = { paused: data.meta.ResponseTheme.IsPulsingDisabled },
        stats = {}, pulses = {}, i;

    if (customer) {
        _.assign(pulsesStatus, _.omit(customer, ['id', 'apikey', 'name', 'eventstatustext', 'eventstatus']));
        pulsesStatus.current = data.eventStatuses[customer.eventstatus];
    }

    demo.unshift({id: 0, groupTitle: 'Overall'});

    for (i = 0; i < demo.length; i++) {
        var pulse = _.find(data.pulses, {Id: demo[i].id}),
            base = {};

        if (pulse) {
            var max = _.max(pulse.Intervals, 'TimeInterval').TimeInterval,
                sentiment = accounting.toFixed(pulse.NetSentiment, 2),
                groupTitle = demo[i].groupTitle;

            base = rebuildPulse(data, pulse.Intervals, max);
            if (base.stats) { base.stats.sentiment = sentiment; }

            if (demo[i].id !== 0) {
                if (!pulses[groupTitle]) {pulses[groupTitle] = [];}
                if (!stats[groupTitle]) {stats[groupTitle] = [];}
                pulses[groupTitle].push({title: demo[i].title, data: base.points});
                stats[groupTitle].push({title: demo[i].title, data: base.stats});
            } else {
                pulses[groupTitle] = {title: groupTitle, data: rebuildPulse(data, pulse.Intervals, max).points};
                stats[groupTitle] = base.stats;
            }
        }
    }

    return {
        details: details,
        status: pulsesStatus,
        filters: filterList,
        stats: buildGroup(filterList, stats),
        pulses: buildGroup(filterList, pulses)
    };

}

module.exports = function process(data, callback) {

    'use strict';
    callback(null, processPoints(data));

};
