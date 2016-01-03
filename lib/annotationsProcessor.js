/*
 * bing-pulse
 *
 * Copyright (c) 2015-2016 Przemyslaw Pluta
 * Licensed under the MIT license.
 * https://github.com/przemyslawpluta/bing-pulse/blob/master/LICENSE
 */

function processAnnotations(data) {

    'use strict';
    var i, points = [];
    for (i = 0; i < data.meta.Annotations.length; i++) {
        points[i] = {
            title: data.meta.Annotations[i].Content,
            start: data.meta.Annotations[i].StartDateTimeUtc,
            end: data.meta.Annotations[i].EndDateTimeUtc
        };
    }
    return points;
}

module.exports = function process(data, callback) {

    'use strict';
    callback(null, processAnnotations(data));

};
