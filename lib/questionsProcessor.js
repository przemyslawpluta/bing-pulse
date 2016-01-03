/*
 * bing-pulse
 *
 * Copyright (c) 2015-2016 Przemyslaw Pluta
 * Licensed under the MIT license.
 * https://github.com/przemyslawpluta/bing-pulse/blob/master/LICENSE
 */

var _ = require('lodash'),
    filters = require('./filters');

function filterAdditionalQuestions(question, demo, questionId, data, originalQuestion, cleanUpList) {

    'use strict';
    var groupList = {}, i;
    for (i = 0; i < demo.length; i++) {
        var target = _.find(data, {Id: demo[i].id}), groupTitle = demo[i].groupTitle, list, item;
        if (!groupList[groupTitle]) { groupList[groupTitle] = {}; }
        item = filters.options(((target && target.Questions) ?  target.Questions : []), questionId, originalQuestion);
        if (item) {
            list = _.zipObject([[demo[i].sort, {title: demo[i].title, data: item}]]);
            _.assign(groupList[groupTitle], list);
        }
    }

    cleanUpList.forEach(function items(item) {
        question.list.push({ title: item, data: filters.mapIt(groupList[item]) });
    });

}

function filterSection(data, group) {

    'use strict';
    var questions = [],
        demo = filters.demographics(data, 'Demographics'),
        cleanUpList = _.uniq(demo.map(function items(item) { return item.groupTitle; })), i;

    for (i = 0; i < data.meta[group].length; i++) {

        var questionGroup = _.find(data.questions, {Id: 0}), answears, metaElement;

        if (questionGroup) {

            answears = _.find(questionGroup.Questions, {Id: data.meta[group][i].QuestionId});
            metaElement = data.meta[group][i];

            questions[i] = {
                title: metaElement.Question.Content,
                count: (answears) ? answears.TotalCount : 0,
                status: data.questionStatuses[metaElement.Question.QuestionStatus],
                list: [{ title: 'Overall', data: filters.options(((questionGroup && questionGroup.Questions) ?  questionGroup.Questions : []), metaElement.QuestionId, metaElement.Question.Options) || [] }]
            };

            filterAdditionalQuestions(questions[i], demo, metaElement.QuestionId, data.questions, metaElement.Question.Options, cleanUpList);
        }
    }

    cleanUpList.unshift('Overall');

    return {questions: questions, filters: cleanUpList};
}

module.exports = function process(data, callback) {

    'use strict';
    callback(null, filterSection(data, 'PollQuestions'));

};
