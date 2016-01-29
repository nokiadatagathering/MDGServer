var
  _ = require('underscore'),
  moment = require('moment'),
  Survey = require('../models/Survey');

function findParentId (categoryData, relevant) {
  var
    parentQuestion,
    questionId = relevant.match(/\/data\/.+\/(.+?)=/)[1];

  parentQuestion = _.find(categoryData.inputs, function (questionData) {
    if (questionData.id === questionId) {
      return true;
    }
  });

  if (parentQuestion.type === 'cascade1') {
    return parentQuestion.id;
  } else {
    return findParentId (categoryData, parentQuestion.relevant);
  }
}

function getQuestions (categoryData, surveyData) {
  var
    cascadeMatch,
    parentId,
    question = {};

  return _.map(categoryData.inputs, function (questionData) {
    question = _.clone(questionData);

    question.label = surveyData.translations.eng[question.label];
    delete question.ref;

    cascadeMatch = /cascade/.test(question.type);

    if (cascadeMatch) {
      if (question.type !== 'cascade1') {
        question.parentid = findParentId(categoryData, question.relevant);
      }
    }

    if (question.type === 'date' && question.defaultValue) {
      question.defaultValue = moment(question.defaultValue).format('YYYY-MM-DD');
    }

    if (questionData.items) {
      question.items = questionData.items.map(function (item) {
        return {
          value: item.value,
          text: surveyData.translations.eng[item.text]
        };
      });
    }

    return question;
  });
}

function getCategories (surveyData) {
  var category = {};

  return _.map(surveyData.groups, function (categoryData) {
    category = {};

    category.title = surveyData.translations.eng[categoryData.title];
    category.id = categoryData.id;
    category.relevant = categoryData.relevant;
    category._questions = getQuestions(categoryData, surveyData);

    return category;
  });
}

function transformRelevantForEnketo (relevantValue) {
  if (!relevantValue) {
    return;
  }

  var
    relevant = '',
    xpath = '',
    value,
    match,
    conditionRegexp = new RegExp("\\. (>=|<=|<|>|=) ([\\d-]+( and)?)(|$|\\))", 'g'),
    relevantRegexp = new RegExp("(/data/.+/.+)='(.+)'");

  xpath = relevantValue.match(relevantRegexp)[1];
  value = relevantValue.match(relevantRegexp)[2];

  if (value.match(/\(.+?\)/)) {
    _.each(value.split(') ('), function (option, index) {
      conditionRegexp.lastIndex = 0;

      relevant += index !== 0 ? ' or' : '';

      while ((match = conditionRegexp.exec(option)) !== null) {
        relevant += ' int(' + xpath + ')' + match[1] + match[2];
      }
    });
  } else {
    _.each(value.split(' '), function (value, index) {
      relevant += index !== 0 ? ' or ' : '';
      relevant += 'selected(' + xpath + ", '"   + value + "')";
    });
  }

  return relevant;
}

exports.composeSurvey = function (survey, surveyData) {
  survey.title = surveyData.title;
  survey._categories = getCategories(surveyData);

  return survey;
};

exports.composeSurveyData = function (survey, enketo) {
  var surveyData = {
    title: survey.title,
    instance: {
      id: survey._id,
      categories: []
    },
    defaults: {},
    translations: {
      eng: {}
    },
    __binds: {},
    groups: []
  };

  _.map(survey._categories, function (surveyCategory) {
    var
      category = {
        id: surveyCategory.id,
        questions: []
      },
      group = {
        title: "/data/" + surveyCategory.id + ":label",
        id: surveyCategory.id,
        inputs: []
      };

    surveyData.translations.eng["/data/" + surveyCategory.id + ":label"] = surveyCategory.title;

    if (surveyCategory.relevant !== undefined) {
      surveyData.__binds["/data/" + surveyCategory.id] = {
        type: "group",
        relevant: enketo ? transformRelevantForEnketo(surveyCategory.relevant) : surveyCategory.relevant
      };

      group.ref = "/data/" + surveyCategory.id;
    } else {
      group.ref = "/data/" + surveyCategory.id;

      surveyData.__binds["/data/" + surveyCategory.id] = { type: "group" };
    }

    _.map(surveyCategory._questions, function (surveyQuestion) {
      var items = [];
      category.questions.push(surveyQuestion);

      if (surveyQuestion.defaultValue !== undefined) {
        surveyData.defaults[surveyQuestion.id] = surveyQuestion.defaultValue;
      }

      surveyData.translations.eng["/data/" + surveyCategory.id + "/" + surveyQuestion.id + ":label"] = surveyQuestion.label;

      surveyData.__binds["/data/" + surveyCategory.id + "/" + surveyQuestion.id] = {
        type: surveyQuestion.type,
        relevant: enketo ? transformRelevantForEnketo(surveyQuestion.relevant) : surveyQuestion.relevant,
        constraint: surveyQuestion.constraint,
        required: surveyQuestion.required
      };

      if (surveyQuestion.items !== undefined) {
        surveyQuestion.items.map(function (option) {
          surveyData.translations.eng["/data/" + surveyCategory.id + "/" + surveyQuestion.id + ":option" + option.value] = option.text;

          items.push({
            value: option.value,
            text: "/data/" + surveyCategory.id + "/" + surveyQuestion.id + ":option" + option.value
          });
        });
      }

      surveyQuestion.mediatype = surveyQuestion.type === 'binary' ? (surveyQuestion.mediatype || 'image') : null;

      group.inputs.push({
        type: surveyQuestion.type,
        required: surveyQuestion.required,
        relevant: enketo ? transformRelevantForEnketo(surveyQuestion.relevant) : surveyQuestion.relevant,
        constraint: surveyQuestion.constraint,
        mediatype: surveyQuestion.mediatype,
        label: "/data/" + surveyCategory.id + "/" + surveyQuestion.id + ":label",
        ref: "/data/" + surveyCategory.id + "/" + surveyQuestion.id,
        tagName: surveyQuestion.tagName,
        defaultValue: surveyQuestion.defaultValue,
        items: items,
        id: surveyQuestion.id
      });
    });

    surveyData.instance.categories.push(category);
    surveyData.groups.push(group);
  });

  return surveyData;
};

exports.sortSurveyQuestions = function (survey) {
  _.each(survey._categories, function (c) {
    var questions = [];

    _.each(c._questions, function (q) {
      if (/cascade/.test(q.type)) {
        if (q.type === 'cascade1') {
          questions.push(q);
          questions = questions.concat(_.filter(c._questions, function (item) {
            return item.parentid === q.id;
          }));
        }
      } else {
        questions.push(q);
      }
    });

    c._questions = questions;

  });

  return survey;
};
