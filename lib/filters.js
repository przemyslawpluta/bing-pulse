/*
 * bing-pulse
 *
 * Copyright (c) 2015-2016 Przemyslaw Pluta
 * Licensed under the MIT license.
 * https://github.com/przemyslawpluta/bing-pulse/blob/master/LICENSE
 */

var _ = require('lodash');

function filterOptions(currentMetaGroup, groups) {

    'use strict';
    var i;
    for (i = 0; i < currentMetaGroup.Options.length; i++) {
        groups.push({
            groupId: currentMetaGroup.Id,
            groupTitle: currentMetaGroup.Content,
            title: currentMetaGroup.Options[i].Content,
            sort: currentMetaGroup.Options[i].SortOrder,
            id: currentMetaGroup.Options[i].Id
        });
    }
}

module.exports = {

    demographics: function demographics(currentData, group) {

        'use strict';
        var groups = [], i;
        for (i = 0; i < currentData.meta[group].length; i++) {
            filterOptions(currentData.meta[group][i], groups);
        }
        return groups;
    },

    mapIt: function mapIt(data) {

        'use strict';
        return Object.keys(data).map(function items(item) {
            return {title: data[item].title, data: data[item].data};
        });
    },

    options: function options(source, id, data) {

        'use strict';
        var target = _.find(source, {Id: id}), answears = [], i, base;
        if (target) {
            for (i = 0; i < data.length; i++) {
                base = _.find(target.Options, {Id: data[i].Id});

                answears[i] = {
                    title: data[i].Content,
                    count: ((base) ? base.Count : 0),
                    perc: ((base) ? base.Percentage : 0)
                };
            }
        } else {
            for (i = 0; i < data.length; i++) {
                answears[i] = {
                    title: data[i].Content,
                    count: 0,
                    perc: 0
                };
            }
        }
        return answears;
    },

    responses: function responses(currentData, item) {

        'use strict';
        return _.compact(currentData.meta.ResponseTheme.ResponseOptions.map(function options(option) {
            var current = _.find(item, {Id: option.Id});
            if (current) { return {count: current.Count, state: option.Content}; }
        }));
    }

};
