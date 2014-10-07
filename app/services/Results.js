var
  _ = require('underscore'),

  Configuration = require('../helpers/Configuration'),

  Result = require('../models/Result'),

  ImagesService = require('./Images');

function getQuestionResults (categoryData, surveyCategory, resultsId) {
  var
    results = [],
    questionData = {},
    cascadeData,
    cascadeMatch,
    questionResults = {};

  _.each(surveyCategory._questions, function (surveyQuestion) {
    questionResults = {};

    questionResults.id = surveyQuestion.id;

    questionData = _.find(categoryData.questions, function (question) {
      return question.id.toLowerCase() == questionResults.id.toLowerCase();
    });

    questionData = questionData ? questionData : {};

    cascadeMatch = /cascade/.test(surveyQuestion.type);

    if (questionData.result === 'undefined' || questionData.result === 'null') {
      questionData.result = undefined;
    }

    if (cascadeMatch) {
      questionResults.result = questionData.result;

      if (surveyQuestion.type === 'cascade1') {
        cascadeData = questionData.result ? true : false;

      } else if ((cascadeData && !questionData.result) || !cascadeData) {
        return;
      }
    } else if (surveyQuestion && (surveyQuestion.type === 'binary' || surveyQuestion.type === 'binary#image') && questionData.result) {
      ImagesService.saveImage(questionData.result, resultsId + '_' + questionResults.id + '.jpg');
      questionResults.result = resultsId + '_' + questionResults.id + '.jpg';
    } if (questionData.result && surveyQuestion.type === 'date') {
      questionResults.result = new Date(questionData.result);
    } else {
      questionResults.result = questionData.result;
    }

    results.push(questionResults);
  });

  return results;
}

function getCategoryResults (resultsData, survey, resultId) {
  var
    resultCategory = {},
    categoryResults = {};

  return survey._categories.map(function (surveyCategory) {
    categoryResults = {};

    categoryResults.id = surveyCategory.id;

    resultCategory = _.find(resultsData.categories, function (category) {
      return category.id == surveyCategory.id;
    });

    resultCategory = resultCategory ? resultCategory : {};

    categoryResults._questionResults = getQuestionResults(resultCategory, surveyCategory, resultId);

    return categoryResults;
  });
}

exports.composeResults = function (results, resultsData, survey, cb) {
  Result.find({ _survey: survey._id, instanceID: resultsData.instanceID })
    .sort('count')
    .exec(function (err, sameTitleResults) {
    results._survey = survey._id;
    results.instanceID = resultsData.instanceID;
    results.deviceID = resultsData.deviceID;
    results.timeStart = new Date(resultsData.timeStart);
    results.timeEnd = new Date(resultsData.timeEnd);
    results.geostamp = resultsData.geostamp;
    results.count = 0;

    if (sameTitleResults.length !== 0) {
      if (sameTitleResults[0].count === 0) {
        results.count = sameTitleResults.length;

        sameTitleResults.shift();

        _.find(sameTitleResults, function (result, index) {
          if (result.count !== (index + 1)) {
            results.count = index + 1;
            return true;
          }

          return false;
        });
      }
    }

    results._categoryResults = getCategoryResults(resultsData, survey, results._id);

    cb(results);
  });
};

function checkRelevant (relevantValue, results) {
  var
    conditionRegexp = new RegExp("\\. (>=|<=|<|>|=) ([\\d-]+)( and|$|\\))", 'g'),
    relevant,
    conditions = [],
    validValues = [],
    match,
    questionId,
    categoryId;

  if (!relevantValue) {
    return true;
  }

  categoryId = relevantValue.match(/\/data\/(.+)\//)[1];
  questionId = relevantValue.match(/\/data\/.+\/(.+?)=/)[1];

  relevant = relevantValue.match(/\/data\/.+\/.+='(.+)'/)[1];

  if (relevant.match(/\(.+?\)/)) {
    _.each(relevant.split(') ('), function (option, index) {
      conditionRegexp.lastIndex = 0;
      conditions[index] = {};

      while ((match = conditionRegexp.exec(option)) !== null) {
        conditions[index][match[1]] = parseInt(match[2], 10);
      }
    });
  } else {
    _.each(relevant.split(' '), function (option) {
      conditions.push ({
        '=': option
      });
    });
  }

  _.each(results._categoryResults, function (category) {

    if (category.id == categoryId) {

      _.each(category._questionResults, function (question) {

        if (question.id == questionId) {

          validValues = _.map(conditions, function (condition) {
            var valid = true;

            _.each(condition, function (value, sign) {
              switch (sign) {
                case '=' :
                  if (value != question.result) {
                    valid = false;
                  }
                  break;
                case '>' :
                  if (value >= question.result) {
                    valid = false;
                  }
                  break;
                case '<' :
                  if (value <= question.result) {
                    valid = false;
                  }
                  break;
                case '>=':
                  if (value > question.result) {
                    valid = false;
                  }
                  break;
                case '<=':
                  if (value < question.result) {
                    valid = false;
                  }
                  break;
              }
            });

            return valid;
          });
        }
      });
    }
  });

  return _.find(validValues, function (validValue) {
    return validValue;
  });
}

exports.gatherCategoryResults = function (result, survey) {
  var
    results = [],
    surveyCategory = {},
    category = {},
    surveyQuestion = {},
    question = {},
    index;

  _.each(result._categoryResults, function (categoryResult, categoryIndex) {
    category = {
      _questionResults: []
    };

    surveyCategory =  survey._categories[categoryIndex];

    if (surveyCategory.relevant && !checkRelevant(surveyCategory.relevant, result)) {
      return;
    }

    category.title = surveyCategory.title;
    category.id = categoryResult.id;

    _.each(categoryResult._questionResults, function (questionResult, questionIndex) {
      question = {};

      surveyQuestion = _.find(surveyCategory._questions, function (question) {
        return question.id == questionResult.id;
      });

      if (Configuration.get('general.questionsTypes').indexOf(surveyQuestion.type) == -1 && !/cascade/.test(surveyQuestion.type)) {
        return;
      }

      if (surveyQuestion.relevant && !checkRelevant(surveyQuestion.relevant, result)) {
        return;
      }

      question.label = surveyQuestion.label;
      question.type = surveyQuestion.type;
      question.id = questionResult.id;

      if (/cascade/.test(surveyQuestion.type) && surveyQuestion.type !== 'cascade1' && !questionResult.result) {

        return;
      } else if (/cascade/.test(surveyQuestion.type) && surveyQuestion.type === 'cascade1' && questionResult.result) {
        question.result = _.find(surveyQuestion.items, function (item) {

          return item.value == questionResult.result;
        }).text;
      } else if (/cascade/.test(surveyQuestion.type) && surveyQuestion.type !== 'cascade1' && questionResult.result) {
        index = category._questionResults.length - 1;

        category._questionResults[index].result = category._questionResults[index].result + ' \u2192 ' +
          _.find(surveyQuestion.items, function (item) {

          return item.value == questionResult.result;
        }).text;

        return;
      } else if (questionResult.result && (surveyQuestion.type === 'binary' || surveyQuestion.type === 'binary#image')) {
        question.result = '/resultsImage/' + questionResult.result;

      } else if (surveyQuestion.type === 'select' || surveyQuestion.type === 'select1') {
        var resultArr = questionResult.result ? questionResult.result.toString().split(' ') : [];

        question.result = surveyQuestion.items.map(function (item) {
          return {
            text: item.text,
            value: resultArr.indexOf(item.value) !== -1 ? true : false
          };
        });
      } else if (surveyQuestion.type === 'time' && questionResult.result && /(\d{2}:\d{2})/.test(questionResult.result)) {
        question.result = /(\d{2}:\d{2})/.exec(questionResult.result)[1];
      } else {
        question.result = questionResult.result;
      }

      category._questionResults.push(question);
    });

    results.push(category);
  });

  return results;
};
