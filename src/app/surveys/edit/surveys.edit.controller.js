(function () {
  'use strict';

angular.module('mdg.app.surveys')
  .controller('SurveysEditController',
  function ($scope, $rootScope, $http, $location, $window, $stateParams, $state,
            surveysService) {
    $rootScope.surveyErrors = {};

    $scope.maskPattern = "^[A-Za-z0-9-]*$";
    $scope.digitsPattern = "^[0-9]*$";
    $scope.surveyData = {};
    $scope.ddListOptionsInt = [
      { translateId: 'survey_builder.SL_Int_conditions.equal', value: '=' },
      { translateId: 'survey_builder.SL_Int_conditions.between', value: '<>' },
      { translateId: 'survey_builder.SL_Int_conditions.less_than', value: '<' },
      { translateId: 'survey_builder.SL_Int_conditions.greater_than', value: '>' }
    ];
    $scope.ddSelectOptionsInt = {
      equal: { translateId: 'survey_builder.SL_Int_conditions.equal', value: '=' },
      between: { translateId: 'survey_builder.SL_Int_conditions.between', value: '<>' },
      less: { translateId: 'survey_builder.SL_Int_conditions.less_than', value: '<' },
      greater: { translateId: 'survey_builder.SL_Int_conditions.greater_than', value: '>' }
    };
    $scope.dropdownList = [
      { translateId: 'survey_builder.question_types.string', value: 'string' },
      { translateId: 'survey_builder.question_types.int', value: 'int' },
      { translateId: 'survey_builder.question_types.decimal', value: 'decimal' },
      { translateId: 'survey_builder.question_types.date', value: 'date' },
      { translateId: 'survey_builder.question_types.time', value: 'time' },
      { translateId: 'survey_builder.question_types.geopoint', value: 'geopoint' },
      { translateId: 'survey_builder.question_types.binary', value: 'binary' },
      { translateId: 'survey_builder.question_types.select1', value: 'select1' },
      { translateId: 'survey_builder.question_types.select', value: 'select' },
      { translateId: 'survey_builder.question_types.note', value: 'note' },
      { translateId: 'survey_builder.question_types.cascade', value: 'cascade1' }
    ];
    $scope.dropdownSelect = {
      string: { translateId: 'survey_builder.question_types.string', value: 'string' },
      int: { translateId: 'survey_builder.question_types.int', value: 'int' },
      decimal: { translateId: 'survey_builder.question_types.decimal', value: 'decimal' },
      date: { translateId: 'survey_builder.question_types.date', value: 'date' },
      time: { translateId: 'survey_builder.question_types.time', value: 'time' },
      geopoint: { translateId: 'survey_builder.question_types.geopoint', value: 'geopoint' },
      binary:  { translateId: 'survey_builder.question_types.binary', value: 'binary' },
      select1: { translateId: 'survey_builder.question_types.select1', value: 'select1' },
      select: { translateId: 'survey_builder.question_types.select', value: 'select' },
      note: { translateId: 'survey_builder.question_types.note', value: 'note' },
      cascade1: { translateId: 'survey_builder.question_types.cascade', value: 'cascade1' }
    };

    $scope.sortableQuestionsOptions = {
      forcePlaceholderSize: true,
      cursor: 'move',
      cancel: '.disableddragquestion',
      connectWith: '.questions-box',
      placeholder: 'sortable-placeholder',
      dropOnEmpty: true,
      update: function (event, ui) {
        var
          category = ui.item.sortable.droptarget.context.parentElement,
          length = $(category).children('li').length;

        if (category && length <= 1) {
          ui.item.sortable.cancel();
        }
      },
      stop: function (event, ui) {
        if (!ui.item.sortable.droptarget) {
          return;
        }

        var
          length = $scope.surveyData._categories.length,
          cIndex = $('ol.category-box li.category-item').index(ui.item.sortable.droptarget[0].parentElement),
          qIndex = ui.item.sortable.dropindex,
          question = $scope.surveyData._categories[cIndex]._questions[qIndex];

        surveyDirty = true;

        deleteSLSelect(question.id, length);

        if (question.type === 'select1' || question.type === 'int') {
          $scope.selectQuestionType(question, cIndex, qIndex, true);
        }
      }
    };
    $scope.sortableCategoriesOptions = {
      placeholder: 'sortable-placeholder',
      forcePlaceholderSize: true,
      cursor: 'move',
      cancel: '.disableddragcategory',
      connectWith: '.builder',
      stop: function (event, ui) {
        if (!ui.item.sortable.droptarget) {
          return;
        }

        var
          length = $scope.surveyData._categories.length,
          cIndex = ui.item.sortable.dropindex,
          category = $scope.surveyData._categories[cIndex];

        surveyDirty = true;

        deleteSLSelect(category.id, length, true);

        _.each(category._questions, function (q, qIndex) {
          if (q.type === 'select1' || q.type === 'int') {
            $scope.selectQuestionType(q, cIndex, qIndex, true);
          }
        });
      }
    };

    var
      defaultOption = {
        text: 'Option 1',
        prevText: 'Option 1',
        value: 'option1'
      },
      newQuestion = {
        addOption: false,
        constraint: '',
        dropdownSelect: {
          translateId: 'survey_builder.question_types.string',
          value: 'string'
        },
        isVisible: true,
        label: 'New question',
        prevTitle: 'New question',
        maxChecked: true,
        maxLength: '30',
        minChecked: true,
        required: false,
        tagName: 'input',
        titleEdit: true,
        type: 'string',
        items: [defaultOption]
      },
      newCategory = {
        isVisible: false,
        title: 'New category',
        prevTitle: 'New category',
        titleEdit: true,
        _questions: []
      },
      newSurvey = {
        title: 'New survey',
        prevTitle: 'New survey',
        _categories: [
          {
            title: 'Example category',
            prevTitle: 'Example category',
            id: 'category0',
            _questions: [
              {
                type: 'string',
                required: false,
                constraint: 'string-length( . ) <= 30',
                label: 'Example question',
                prevTitle: 'Example question',
                tagName: 'input',
                id: 'question00',
                items: [defaultOption]
              }
            ]
          }
        ]
      },
      surveyDirty = false,

      findErrors = function () {
        return _.find($rootScope.surveyErrors, function (err) {
          return err === true;
        });
      },

      getLength = function (constraint, mask) {
        if (!constraint || mask) {
          return null;
        }

        return  constraint.substr(22, constraint.length - 22);
      },

      getDefaultValues = function (defaultValue) {
        if (!defaultValue) {
          return {};
        }

        return {
          hours: parseInt(defaultValue.split(':')[0], 10),
          minutes: parseInt(defaultValue.split(':')[1], 10)
        };
      },

      getMinMaxValue = function (constraint) {
        if (!constraint) {
          return { minValue: null, maxValue: null };
        }

        var dateString = constraint.substr(2, constraint.length - 3),
          minIndex = dateString.search('<='),
          maxIndex = dateString.search('>='),
          length = dateString.length,
          andIndex = dateString.search('and'),
          minResult = null,
          maxResult = null;

        if (andIndex !== -1) {
          if (minIndex < andIndex) {
            maxResult = dateString.substr(minIndex + 3, andIndex - minIndex - 4);
            minResult = dateString.substr(maxIndex + 3, length);
          } else {
            maxResult = dateString.substr(minIndex + 3, length);
            minResult = dateString.substr(maxIndex + 3, andIndex - maxIndex - 4);
          }
        } else {
          if (minIndex === -1) {
            minResult = dateString.substr(maxIndex + 3, length);
          } else {
            maxResult = dateString.substr(minIndex + 3, length);
          }
        }

        return { minValue: minResult, maxValue: maxResult };
      },

      parseRelevant = function (relevantValue, defaultRelevant, cIndex, ddSelectQuestions) {
        var
          conditionRegexp = new RegExp("\\. (>=|<=|<|>|=) ([\\d-]+)( and|$|\\))", 'g'),
          relevant,
          questionValues = [],
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
            questionValues[index] = {
              signs: [],
              values: []
            };

            while ((match = conditionRegexp.exec(option)) !== null) {
              questionValues[index].signs.push(match[1]);
              questionValues[index].values.push(match[2]);
            }
          });
        } else {
          questionValues = relevant.split(' ');
        }

        _.each(_.first($scope.surveyData._categories, cIndex + 1), function (c) {

          if (c.id == categoryId) {

            _.each(c._questions, function (q) {
              if (q.id == questionId) {

                if (defaultRelevant) {
                  q.skipLogicSelect = ddSelectQuestions;

                  return;
                }

                _.each(questionValues, function (questionValue, index) {
                  if (q.type === 'select1') {
                    q.skipLogicOptions.push({
                      ddListOptions: q.items,
                      ddSelectOptions: angular.copy(_.find(q.items, function (item) {
                        return questionValue == item.value;
                      })),
                      ddSelectQuestions: angular.copy(ddSelectQuestions)
                    });

                    return;
                  }

                  if (q.type === 'int') {
                    var slIndex = q.skipLogicOptions.length;

                    q.skipLogicOptions[slIndex] = {};
                    q.skipLogicOptions[slIndex].ddListOptions = $scope.ddListOptionsInt;
                    q.skipLogicOptions[slIndex].ddSelectQuestions = angular.copy(ddSelectQuestions);

                    if (questionValue.signs.length === 2) {
                      q.skipLogicOptions[slIndex].ddSelectOptions = angular.copy($scope.ddSelectOptionsInt.between);
                      q.skipLogicOptions[slIndex].firstInput = questionValue.values[0];
                      q.skipLogicOptions[slIndex].secondInput = questionValue.values[1];
                      return;
                    }

                    if (questionValue.signs[0] === '>') {
                        q.skipLogicOptions[slIndex].ddSelectOptions = $scope.ddSelectOptionsInt.greater;
                      q.skipLogicOptions[slIndex].firstInput = questionValue.values[0];
                      return;
                    }

                    if (questionValue.signs[0] === '<') {
                      q.skipLogicOptions[slIndex].ddSelectOptions = $scope.ddSelectOptionsInt.less;
                      q.skipLogicOptions[slIndex].firstInput = questionValue.values[0];
                      return;
                    }

                    if (questionValue.signs[0] === '=') {
                      q.skipLogicOptions[slIndex].ddSelectOptions = $scope.ddSelectOptionsInt.equal;
                      q.skipLogicOptions[slIndex].firstInput = questionValue.values[0];
                      return;
                    }
                  }
                });
              }
            });
          }
        });

        return { categoryId: categoryId, questionId: questionId, questionValue: relevant };
      },

      makeDefaultValue = function (params) {
        var
          defaultValue = '',
          date = [];

        if (params.hours !== undefined || params.minutes !== undefined) {
          defaultValue = (params.hours ? params.hours : '00') + ':' + (params.minutes ? params.minutes : '00');
        } else if (params.date) {
          date = params.date.split('/');
          defaultValue = date[2] + '-' + date[1] + '-' + date[0];
        }

        return defaultValue;
      },

      makeConstraint = function (params) {
        var
          constraint = '',
          parseParam = function (param) {
            param = (typeof(param) === 'string') ? param.split('/') : [param];

            if (param.length === 3) {
              return param[2] + '-' + param[1] + '-' + param[0];
            } else {
              return param[0];
            }
          };

        if (params.mask) {
          constraint = '=' + params.mask
            .replace(/[A-Za-z]/g, 'A')
            .replace(/[0-9]/g, '9')
            .replace(/-+/g, '-');
          return constraint;
        }

        if (params.maxLength !== undefined && params.maxLength !== '' && params.maxLength !== 0) {
          constraint = 'string-length( . ) <= ' + params.maxLength;
          return constraint;
        }

        if (params.maxChecked && params.maxValue) {
          constraint = '(. <= ' + parseParam(params.maxValue);
        }

        if (params.minChecked && params.minValue) {
          constraint = '(. >= ' + parseParam(params.minValue);
        }

        if (params.maxChecked && params.minChecked && params.minValue && params.maxValue) {
          constraint = constraint + ' and . <= ' + parseParam(params.maxValue);
        }

        return constraint === '' ? '' : constraint + ')';
      },

      editItemTitle = function (item, type, itemTitle, cIndex, event) {
        console.log('editItemTitle', item, type, itemTitle, cIndex, event);
        var text;

        if (event && event.keyCode !== 13) {
          return;
        }

        item.titleEdit = !item.titleEdit;

        if (item.titleEdit) {
          item.focus = true;
          return;
        }

        if (item[itemTitle] === '') {
          item[itemTitle] = item.prevTitle;
          return;
        }

        item.prevTitle = item[itemTitle];

        if (type === 'survey' || item.titleEdit) {
          return;
        }

        if (type === 'question') {
          text = item.label;
        } else if (type === 'category') {
          text = item.title;
        }

        _.find($scope.surveyData._categories, function (c, index) {
          if (index === cIndex && type === 'category') {
            return true;
          }

          _.find(c._questions, function (q) {
            if (q.id === item.id) {
              return true;
            }

            if (q.type !== 'select1' && q.type !== "int") {
              return false;
            }

            if (q.skipLogicSelect.value === item.id) {
              q.skipLogicSelect.text = text;
            }

            _.each(q.skipLogicOptions, function (options) {
              if (options.ddSelectQuestions.value === item.id) {
                options.ddSelectQuestions.text = text;
              }
            });
          });

          if (index === cIndex) {
            return true;
          }
        });
      },

      checkSLOptionError = function (question) {
        var sameOptions = {};

        question.slOptionError = false;
        $rootScope.surveyErrors.slOptionError = false;

        _.each(question.skipLogicOptions, function (opt, index) {
          opt.errorOption = false;

          if (opt.ddSelectOptions.value && sameOptions[opt.ddSelectOptions.value]) {
            sameOptions[opt.ddSelectOptions.value].push(index);
            return;
          }

          sameOptions[opt.ddSelectOptions.value] = [index];
        });

        _.each(sameOptions, function (option) {
          if (option.length > 1) {
            question.slOptionError = true;
            $rootScope.surveyErrors.slOptionError = true;

            _.each(option, function (index) {
              question.skipLogicOptions[index].errorOption = true;
            });
          }
        });
      },

      deleteSLSelect = function (item, cIndex, category) {
        _.find($scope.surveyData._categories, function (c, index) {
          _.each(c._questions, function (q) {

            if (category && (item === c.id)) {
              deleteSLSelect(q.id, cIndex);
            }

            if (q.skipLogicSelect && q.skipLogicSelect.value === item) {
              q.skipLogicSelect = {
                text: 'Next question',
                value: 'nextquestion'
              };
            }

            _.each(q.skipLogicOptions, function (option) {
              if (option.ddSelectQuestions && option.ddSelectQuestions.value === item) {
                option.ddSelectQuestions = {};
              }
            });
          });

          return index === cIndex;
        });
      },

      clearSurveyData = function (survey) {
        var fields = {
            default: ['type', 'required', 'label', 'tagName', 'id', 'relevant', 'defaultRelevant'],
            string: ['mask', 'constraint', 'defaultValue'],
            int: ['constraint', 'defaultValue'],
            decimal: ['constraint', 'defaultValue'],
            date: ['constraint', 'defaultValue'],
            time: ['defaultValue'],
            geopoint: [],
            binary: ['mediatype'],
            select: ['items'],
            select1: ['items'],
            note: ['defaultValue'],
            cascade1: ['items', 'parentid']
          },

          pickItems = function (item) {
            return _.pick(item, 'text', 'value');
          },
          addCascades = function (cIndex, question) {
            _.each(extractCascades(question), function (cascade) {
              cascade = _.pick(cascade, fields.default, fields.cascade1);
              cascade.items = _.map(cascade.items, pickItems);
              clearedSurvey._categories[cIndex]._questions.push(cascade);
            });
          },
          clearedSurvey = {
            title: survey.title,
            _categories: []
          };

        _.each(survey._categories, function (category, cIndex) {
          clearedSurvey._categories[cIndex] = _.pick(category, ['id', 'title', 'relevant', 'defaultRelevant']);
          clearedSurvey._categories[cIndex]._questions = [];

          _.each(survey._categories[cIndex]._questions, function(q) {
            if (q.type === 'select' || q.type === 'select1' || q.type.indexOf('cascade') !== -1) {
              q.items = _.map(q.items, pickItems);
            }

            clearedSurvey._categories[cIndex]._questions.push(_.pick(q, fields.default, fields[q.type]));

            if (q.type == 'cascade1') {
              addCascades(cIndex, q);
            }
            console.log(clearedSurvey._categories[cIndex]._questions);
          });
        });

        return clearedSurvey;
      },

      extractCascades = function (cascade1) {
        var
          cascadesArray = [],
          makeArray = function (cascades, parentId) {
            _.each(cascades, function (cascade, index) {
              cascade.relevant = $scope.makeRelevantCascade(cascade);
              cascadesArray.push(cascade);
            });
          };

        for (var k in cascade1.cascades) {
          delete cascade1.cascades[k].selectedOption;
          makeArray(cascade1.cascades[k], cascade1.id);
        }

        return cascadesArray;
      };

    $rootScope.$on('dirty_survey', function () {
      surveyDirty = true;
    });

    $scope.checkSLIntValueError = function (question) {
      question.slValueError = false;
      $rootScope.surveyErrors.slValueError = false;

      _.each(question.skipLogicOptions, function (option) {
        option.errorValue = false;
      });

      _.each(question.skipLogicOptions, function (optToCheck, index) {
        var
          greater,
          less,
          equal;

        if (question.maxChecked &&
          (parseInt(optToCheck.firstInput, 10) > parseInt(question.maxValue, 10) ||
          parseInt(optToCheck.secondInput, 10) > parseInt(question.maxValue, 10))) {
          question.slValueError = true;
          optToCheck.errorValue = true;
          $rootScope.surveyErrors.slValueError = true;
        }

        if (question.minChecked &&
          (parseInt(optToCheck.firstInput, 10) < parseInt(question.minValue, 10) ||
          parseInt(optToCheck.secondInput, 10) < parseInt(question.minValue, 10))) {
          question.slValueError = true;
          optToCheck.errorValue = true;
          $rootScope.surveyErrors.slValueError = true;
        }

        if (optToCheck.ddSelectOptions.value == '<>') {
          greater = optToCheck.firstInput ? parseInt(optToCheck.firstInput, 10) : true;
          less = optToCheck.secondInput ? parseInt(optToCheck.secondInput, 10) : true;

          if (greater !== true && less !== true && greater >= less) {
            question.slValueError = true;
            optToCheck.errorValue = true;
            $rootScope.surveyErrors.slValueError = true;
          }
        }

        if (optToCheck.ddSelectOptions.value == '=') {
          equal = parseInt(optToCheck.firstInput, 10);
        }

        if (optToCheck.ddSelectOptions.value == '<') {
          less = optToCheck.firstInput ? parseInt(optToCheck.firstInput, 10) : true;

          if ((question.minChecked && less === parseInt(question.minValue, 10)) || less === 0) {
            question.slValueError = true;
            optToCheck.errorValue = true;
            $rootScope.surveyErrors.slValueError = true;
          }
        }

        if (optToCheck.ddSelectOptions.value == '>') {
          greater = optToCheck.firstInput ? parseInt(optToCheck.firstInput, 10) : true;

          if (question.maxChecked && (greater === parseInt(question.maxValue, 10))) {
            question.slValueError = true;
            optToCheck.errorValue = true;
            $rootScope.surveyErrors.slValueError = true;
          }
        }

        _.each (_.rest(question.skipLogicOptions, index + 1), function (option) {
          var
            greater1,
            less1,
            equal1;

          if (option.ddSelectOptions.value == '<>') {
            greater1 = option.firstInput ? parseInt(option.firstInput, 10) : true;
            less1 = option.secondInput ? parseInt(option.secondInput, 10) : true;
          }

          if (option.ddSelectOptions.value == '=') {
            equal1 = parseInt(option.firstInput, 10);
          }

          if (option.ddSelectOptions.value == '<') {
            less1 = option.firstInput ? parseInt(option.firstInput, 10) : true;
          }

          if (option.ddSelectOptions.value == '>') {
            greater1 = option.firstInput ? parseInt(option.firstInput, 10) : true;
          }

          if (greater !== undefined && less !== undefined) {
            if (greater1 !== undefined && less1 !== undefined &&
              greater1 !== true && less1 !== true && greater !== true && less !== true &&
              (greater <= greater1 && less >= greater1 ||
              less >= less1 && greater <= less1)) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (greater1 !== undefined && greater1 !== true && !less1 && greater1 < less) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (less1 !== undefined && less1 !== true && !greater1 && less1 > greater) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (equal1 !== undefined && equal1 >= greater && equal1 <= less) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }
          }

          if (equal !== undefined) {
            if (greater1 !== undefined && less1 !== undefined &&
              greater1 !== true && less1 !== true && equal >= greater1 && equal <= less1) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (greater1 !== undefined && greater1 !== true && !less1 && greater1 < equal) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (less1 !== undefined && less1 !== true && !greater1 &&  less1 > equal) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (equal1 !== undefined &&  equal1 === equal) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }
          }

          if (greater !== undefined && !less) {
            if (greater1 !== undefined && less1 !== undefined && greater !== true && less1 !== true && (greater < less1)) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (greater1 !== undefined && !less1) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (less1 !== undefined && less1 !== true && !greater1 && less1 > greater) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (equal1 !== undefined && equal1 > greater) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }
          }

          if (less && !greater) {
            if (greater1 !== undefined && less1 !== undefined && greater1 !== true && (less > greater1)) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (less1 !== undefined && !greater1) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (greater1 !== undefined && greater1 !== true && !less1 && less > greater1) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }

            if (equal1 !== undefined && equal1 < less) {
              option.errorValue = true;
              optToCheck.errorValue = true;
              question.slValueError = true;
              $rootScope.surveyErrors.slValueError = true;

              return;
            }
          }
        });
      });
    };

    $scope.checkSLQuestionError = function (question) {
      var
        indexes = {},
        selectedOptions = [],
        forbiddenOptions = [],
        invalidValues = [],

        findForbidden = function (opt) {
          _.find($scope.surveyData._categories, function (c) {
            if (opt.type === 'category') {
              if (opt.value === c.id) {
                _.each(c._questions, function (q) {
                  forbiddenOptions.push(q.id);
                });

                return true;
              }
            } else {
              _.find(c._questions, function (q) {
                if (q.id === opt.value) {
                  forbiddenOptions.push(c.id);
                  return true;
                }
              });
            }
          });
        };

      question.slQuestionError = false;
      $rootScope.surveyErrors.slQuestionError = false;
      question.errorDefaultQuestion = false;
      $rootScope.surveyErrors.errorDefaultQuestion = false;

      _.each(question.skipLogicOptions, function (opt, index) {
        opt.errorQuestion = false;

        if (opt.ddSelectQuestions && opt.ddSelectQuestions.value) {
          selectedOptions.push(opt.ddSelectQuestions.value);
          indexes[opt.ddSelectQuestions.value] = index;

          findForbidden(opt.ddSelectQuestions);
        }

        if (question.skipLogicSelect.value === opt.ddSelectQuestions.value) {
          question.errorDefaultQuestion = true;
          question.slQuestionError = true;
          $rootScope.surveyErrors.slQuestionError = true;
          $rootScope.surveyErrors.errorDefaultQuestion = true;
        }
      });

      if (question.skipLogicSelect.value !== 'nextquestion') {
        findForbidden(question.skipLogicSelect);
        selectedOptions.push(question.skipLogicSelect.value);
      }

      invalidValues = _.intersection(selectedOptions, forbiddenOptions);

      _.each(invalidValues, function (value) {
        if (question.skipLogicOptions[indexes[value]]) {
          question.skipLogicOptions[indexes[value]].errorQuestion = true;
        } else {
          question.errorDefaultQuestion = true;
        }

        question.slQuestionError = true;
        $rootScope.surveyErrors.slQuestionError = true;
        $rootScope.surveyErrors.errorDefaultQuestion = true;
      });
    };

    $scope.updateSLDropDown = function (question, cIndex, qIndex) {
      var
        forbiddenItems = [],
        relatedForbiddenItems = [];

      question.skipLogicList = [{
        text: 'Next question',
        value: 'nextquestion'
      }];

      _.each($scope.surveyData._categories, function (c, catIndex) {
        if (catIndex > cIndex) {
          question.skipLogicList.push({
            text: c.title,
            value: c.id,
            type: 'category'
          });
        }

        _.each(c._questions, function (q, questIndex) {
          if (q.id !== question.id) {
            if (q.skipLogicSelect && q.skipLogicSelect.value !== 'nextquestion') {
              forbiddenItems.push(q.skipLogicSelect.value);
            }

            _.each(q.skipLogicOptions, function (opt) {
              if (opt.ddSelectQuestions && opt.ddSelectQuestions.value) {
                forbiddenItems.push(opt.ddSelectQuestions.value);
              }
            });
          }

          if (forbiddenItems.indexOf(q.id) !== -1) {
            relatedForbiddenItems.push(c.id);
          }

          if (forbiddenItems.indexOf(c.id) !== -1) {
            relatedForbiddenItems.push(q.id);
          }

          if ((catIndex === cIndex && questIndex > qIndex) || catIndex > cIndex) {
            if (q.type.indexOf('cascade') === -1 || (q.type === 'cascade1')) {
              question.skipLogicList.push({
                text: q.label,
                value: q.id,
                type: 'question'
              });
            }
          }
        });
      });

      forbiddenItems = _.union(forbiddenItems, relatedForbiddenItems);

      question.skipLogicList = _.filter(question.skipLogicList, function (option, index) {
        return forbiddenItems.indexOf(option.value) === -1;
      });

      _.each(question.skipLogicOptions, function (opt) {
        opt.ddListQuestions = _.rest(question.skipLogicList, 1);
      });
    };

    $scope.selectQuestionType = function (question, cIndex, qIndex, copy) {
      var
        questionId,
        categoryId = $scope.surveyData._categories[cIndex].id,
        idMap = {},
        setCascadeIds = function (cascade) {
          idMap[cascade.id] = $rootScope.generateUUID();
          cascade.id = idMap[cascade.id];
          delete cascade._id;

          questionId = idMap[cascade.relevantOptions.questionId] ? idMap[cascade.relevantOptions.questionId] : question.id;
          cascade.relevantOptions.questionId = questionId;
          cascade.relevantOptions.categoryId = categoryId;
          cascade.parentid = question.id;
        };

      surveyDirty = true;
      question.type = question.dropdownSelect.value;
      delete question.mediatype;

      switch (question.type) {
        case 'binary':
          question.tagName = 'upload';
          question.mediatype = 'image';
          break;
        case 'select':
          question.tagName = 'select';
          break;
        case 'select1':
        case 'cascade1':
          question.tagName = 'select1';
          break;
        default:
          question.tagName = 'input';
      }

      if ((question.type === 'select' || question.type === 'select1' || question.type === 'cascade1') &&
        (!question.items || question.items.length === 0)) {
        question.items = [defaultOption];
      }

      if (question.type == 'cascade1' && !question.cascades) {
        question.cascades = {};
        question.cascades.cascade2 = {};
      } else {
        for (var k in question.cascades) {
          delete question.cascades[k].selectedOption;

          _.each(question.cascades[k], setCascadeIds);
        }
      }

      if (!copy) {
        question.maxValue = null;
        question.minValue = null;
        question.minChecked = false;
        question.maxChecked = false;
        question.defaultValue = null;
        question.minmaxError = false;

        $rootScope.surveyErrors.minmaxError = false;
      }

      if (question.type === 'select1' || question.type === 'int') {
        question.skipLogicSelect = {
          text: 'Next question',
          value: 'nextquestion'
        };

        question.skipLogicOptions = [];
      }

      question.slValueError = false;
      question.slQuestionError = false;
      question.slOptionError = false;
      question.errorDefaultQuestion = false;
      question.defaultValueError = false;

      $rootScope.surveyErrors.slValueError = false;
      $rootScope.surveyErrors.slQuestionError = false;
      $rootScope.surveyErrors.slOptionError = false;
      $rootScope.surveyErrors.errorDefaultQuestion = false;
    };

    $scope.ddSelectOptionForSL = function (question) {
      surveyDirty = true;

      if (question.type === "select1") {
        checkSLOptionError(question);
      }

      if (question.type === "int") {
        $scope.checkSLIntValueError(question);
      }
    };

    $scope.deleteSLOption = function (q, index, cIndex) {
      q.skipLogicOptions.splice(index, 1);

      $scope.checkSLQuestionError(q);

      if (q.type === "select1") {
        checkSLOptionError(q);
      }

      if (q.type === "int") {
        $scope.checkSLIntValueError(q);
      }
    };

    $scope.updateOption = function (question, item, index, event) {
      var oldValue = question.items[index].value,
        value = item.text.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`'"~()/?/@/±<>§"|+\[\]\s]/g, '').toLowerCase(),
        repeatedItems = _.find(question.items, function (item) {
          return item.value == value;
        });

      surveyDirty = true;

      if (event && event.keyCode !== 13) {
        return;
      }

      if (item.text === '') {
        item.text = item.prevText;
        item.edit = false;
        return;
      }

      if (question.items[index].value == value) {
        item.error = false;
        item.edit = false;
        return;
      }

      if (!repeatedItems) {
        question.items[index].value = value;
        item.prevText = item.text;

        item.error = false;
        item.edit = false;

        _.each(question.skipLogicOptions, function (options) {
          if (options.ddSelectOptions.value === oldValue) {
            options.ddSelectOptions = angular.copy(question.items[index]);
          }
        });

      } else {
        item.error = true;
        console.error('Duplicated option value!');
      }
    };

    $scope.deleteOption = function (question, index) {
      var value = question.items[index].value;

      surveyDirty = true;

      if (question.items.length === 1) {
        $rootScope.$broadcast("empty_question", question.dropdownSelect.value);
        return;
      }

      _.each(question.skipLogicOptions, function (options) {
        if (options.ddSelectOptions.value === value) {
          options.ddSelectOptions = {};
        }
      });

      question.items.splice(index, 1);
    };

    $scope.editItemTitle = _.throttle(editItemTitle, 300, { trailing: false });

    $scope.addSLOption = function (q) {
      if (q.type === 'select1') {
        q.skipLogicOptions.push({
          ddListOptions: q.items,
          ddSelectOptions: {},
          ddSelectQuestions: {}
        });

        return;
      }

      if (q.type === 'int') {
        q.skipLogicOptions.push({
          ddListOptions: $scope.ddListOptionsInt,
          ddSelectOptions: angular.copy($scope.ddSelectOptionsInt.equal),
          ddSelectQuestions: {}
        });
      }
    };

    $scope.getSurveyData = function (surveyId) {
      var addProperties = function () {
        $scope.surveyData.prevTitle = $scope.surveyData.title;

        _.each($scope.surveyData._categories, function (category, cIndex) {
          category.isVisible = true;
          category.prevTitle = category.title;

          if (category.relevant) {
            category.relevantOptions = parseRelevant(category.relevant, category.defaultRelevant, cIndex, {
              text: category.title,
              value: category.id,
              type: 'category'
            });

            category.relevant = '';
          }

          category._questions = _.filter(category._questions, function (question, qIndex) {

            if (question.type === 'binary#image') {
              question.type = 'binary';
            }

            question.isVisible = true;
            question.skipLogicOptions = [];
            question.dropdownSelect = _.clone($scope.dropdownSelect[question.type]);
            question.prevTitle = question.label;

            if (question.relevant) {
              question.relevantOptions = parseRelevant(question.relevant, question.defaultRelevant, cIndex, {
                text: question.label,
                value: question.id,
                type: 'question'
              });

              question.relevant = '';
            }

            if (question.type.indexOf('cascade') >= 0 && (question.type !== 'cascade1')) {
              var cascadeIndex = question.type.substr(7, question.type.length - 7),
                questionValue = question.relevantOptions.questionValue;

              question.cascadeIndex = cascadeIndex;
              _.each(category._questions, function (parentQuestion) {
                if (parentQuestion.type == 'cascade1' && parentQuestion.id == question.parentid) {
                  parentQuestion.cascades = parentQuestion.cascades ? parentQuestion.cascades : {};
                  parentQuestion.cascades[question.type] = parentQuestion.cascades[question.type] ? parentQuestion.cascades[question.type] : {};
                  parentQuestion.cascades[question.type][questionValue] = angular.copy(question);
                }
              });

              return;
            }

            if (question.type === 'cascade1' || question.type === 'select' || question.type === 'select1') {
              _.each(question.items, function (item) {
                item.prevText = item.text;
              });
            }

            if (question.type === 'string') {
              question.maxLength = getLength(question.constraint, question.mask);
            }

            if (question.type === 'time') {
              question.defaultValueHH = getDefaultValues(question.defaultValue).hours;
              question.defaultValueMM = getDefaultValues(question.defaultValue).minutes;
            }

            if (question.type === 'decimal' || question.type === 'int' || question.type === 'date') {
              var constraint = getMinMaxValue(question.constraint);
              question.minValue = constraint.minValue;
              question.maxValue = constraint.maxValue;
              question.minChecked = !!question.minValue;
              question.maxChecked = !!question.maxValue;
            }

            if (question.type === 'select1' || question.type === 'int') {
              question.skipLogicSelect = question.skipLogicSelect ? question.skipLogicSelect : {
                text: 'Next question',
                value: 'nextquestion'
              };
            }
            return true;
          });
        });
      };

      if (!surveyId) {
        $scope.surveyData = angular.copy(newSurvey);
        addProperties();
      } else {
        surveysService.surveyInfo(surveyId).then(
          function success (config) {
            $scope.surveyData = config.data;
            $scope.ddSelectSelected = {};
            addProperties();
          },

          function failed (err) {
            console.log("error:", err);
          });
      }
    };

    $scope.addCategory = function () {
      var cIndex = $scope.surveyData._categories.length;

      surveyDirty = true;

      $scope.surveyData._categories[cIndex] = angular.copy(newCategory);
      $scope.surveyData._categories[cIndex].id = $rootScope.generateUUID();
      newQuestion.id = $rootScope.generateUUID();
      $scope.surveyData._categories[cIndex]._questions.push(angular.copy(newQuestion));
    };

    $scope.deleteCategory = function (category) {
      if ($scope.surveyData._categories.length == 1) {
        $rootScope.$broadcast('empty_survey');
        return;
      }

      var index = $scope.surveyData._categories.indexOf(category);

      surveyDirty = true;
      deleteSLSelect(category.id, index, true);
      $scope.surveyData._categories.splice(index,1);
    };

    $scope.copyCategory = function (category) {
      var cIndex = $scope.surveyData._categories.length;

      surveyDirty = true;

      $scope.surveyData._categories[cIndex] = angular.copy(category);
      delete $scope.surveyData._categories[cIndex]._id;
      $scope.surveyData._categories[cIndex].id = $rootScope.generateUUID();

      _.each($scope.surveyData._categories[cIndex]._questions, function (question, index) {
        delete question._id;
        question.id = $rootScope.generateUUID();
        $scope.selectQuestionType(question, cIndex, index, true);
      });
    };

    $scope.addQuestion = function (category) {
      var qIndex = category._questions.length;

      surveyDirty = true;

      category._questions[qIndex] = angular.copy(newQuestion);
      category._questions[qIndex].id = $rootScope.generateUUID();
      category.isVisible = true;
    };

    $scope.deleteQuestion = function (category, question, cIndex) {
      if (category._questions.length == 1) {
        $rootScope.$broadcast('empty_category');
        return;
      }

      var index = category._questions.indexOf(question);

      surveyDirty = true;

      category._questions.splice(index, 1);
      deleteSLSelect(question.id, cIndex);
    };

    $scope.copyQuestion = function (category, question, cIndex) {
      var qIndex = category._questions.length;

      delete question._id;

      category._questions[qIndex] = angular.copy(question);
      category._questions[qIndex].id = $rootScope.generateUUID();
      $scope.selectQuestionType(category._questions[qIndex], cIndex, qIndex, true);
    };

    var makeRelevantValue = function (question, option) {
        var value = '';

        if (question.type === 'select1' && option.ddSelectOptions.value) {
          value = option.ddSelectOptions.value;

          _.find(question.items, function (item) {
            return item.value === option.ddSelectOptions.value;
          }).checked = true;
        } else {
          if (option.firstInput && option.firstInput !== '-') {
            if (option.ddSelectOptions.value === '=') {
              value = '(. = ' + option.firstInput + ')';
            }

            if (option.ddSelectOptions.value === '>') {
              value = '(. > ' + option.firstInput + ')';
            }

            if (option.ddSelectOptions.value === '<') {
              value = '(. < ' + option.firstInput + ')';
            }

            if (option.ddSelectOptions.value === '<>' && option.secondInput && option.secondInput !== '-') {
              value = '(. >= ' + option.firstInput + ' and . <= ' + option.secondInput + ')';
            }
          }
        }

        return value;
      },

      makeRelevantSL = function (question, cIndex, survey) {
        var path = "/data/" + survey._categories[cIndex].id + "/" + question.id + "='";

        _.each(question.skipLogicOptions, function (option) {
          _.each(_.rest(survey._categories, cIndex), function (c) {
            var value = makeRelevantValue(question, option);

            if (option.ddSelectQuestions.type === 'category') {
              if (option.ddSelectQuestions.value === c.id && value !== '') {
                if (c.relevant && c.relevant.length > 0) {
                  c.relevant = c.relevant.slice(0, -1) + ' ' + value + "'";
                } else {
                  c.relevant = path + value + "'";
                  c.defaultRelevant = false;
                }
              }

              return;
            }

            if (option.ddSelectQuestions.type === 'question') {
              _.each(c._questions, function (q) {
                if (option.ddSelectQuestions.value === q.id && value !== '') {
                  if (q.relevant && q.relevant.length > 0) {
                    q.relevant = q.relevant.slice(0, -1) + ' ' + value + "'";
                  } else {
                    q.relevant = path + value + "'";
                    q.defaultRelevant = false;
                  }
                }
              });
            }
          });
        });

        if (question.type === 'select1' && question.skipLogicSelect.value !== 'nextquestion') {
          var
            relevant = '',
            addItem = '';

          _.each(question.items, function (item) {
            if (!item.checked) {
              addItem = (relevant === '') ? item.value : (' ' + item.value);
              relevant = relevant + addItem;
            }
          });

          if (relevant.length > 0) {
            _.each(_.rest(survey._categories, cIndex), function (c) {
              if (question.skipLogicSelect.value === c.id) {
                c.defaultRelevant = true;
                c.relevant = path + relevant + "'";

                return;
              }

              _.each(c._questions, function (q) {
                if (question.skipLogicSelect.value === q.id) {
                  q.defaultRelevant = true;
                  q.relevant = path + relevant + "'";
                }
              });
            });
          }
        }
      };

    $scope.makeRelevantCascade = function (cascade) {
      if (!cascade) {
        return '';
      }
      var categoryId = cascade.relevantOptions.categoryId,
        questionId = cascade.relevantOptions.questionId,
        questionValue = cascade.relevantOptions.questionValue;
      return '/data/' + categoryId + '/' + questionId + '=\'' +  questionValue + '\'';
    };

    $scope.saveSurvey = function (buttonClick) {
      if (findErrors()) {
        $rootScope.$broadcast('invalid_survey');
        return;
      }

      var survey = angular.copy($scope.surveyData);
      _.each(survey._categories, function (category, cIndex) {
        _.each(category._questions, function (question) {

          if (question.type === 'select1' || question.type === 'int') {
            makeRelevantSL(question, cIndex, survey);
          }

          if (question.type === 'string') {
            question.constraint = makeConstraint({ maxLength: question.maxLength, mask: question.mask });
          }

          if (question.type === 'decimal' || question.type === 'int' || question.type === 'date') {
            question.constraint = makeConstraint({
              minValue: question.minValue,
              maxValue: question.maxValue,
              minChecked: question.minChecked,
              maxChecked: question.maxChecked
            });
          }

          if (question.type === 'time') {
            question.defaultValue = makeDefaultValue({ hours: question.defaultValueHH, minutes: question.defaultValueMM });
          }

          if (question.type === 'date') {
            question.defaultValue = makeDefaultValue({ date: question.defaultValue });
          }
        });
      });

      if ($stateParams.surveyId) {
        return surveysService.editSurvey({ id: $stateParams.surveyId, body: clearSurveyData(survey) }).then(
          function success (config) {
            $rootScope.$broadcast('saved_survey', survey.title);
            surveyDirty = false;
            $scope.surveyEdit.$dirty = false;

            if ($rootScope.offlineMode === false) {
              $scope.surveyData.__v = $scope.surveyData.__v + 1;
            }
          },
          function failed (err) {
            if (err.status === 409) {
              $rootScope.$broadcast('invalid_version', 'survey');
              $state.go('page.surveys.edit', { surveyId: $stateParams.surveyId }, {reload: true});
            }

            console.log("error:", err);
          });
      } else {
        return surveysService.createSurvey({ body: clearSurveyData(survey) }).then(
          function success (config) {
            if (buttonClick) {
              $state.go('page.surveys.edit', { surveyId: config.data.id }, {reload: true})
            }

            $rootScope.$broadcast('saved_survey', survey.title);
            surveyDirty = false;
            $scope.surveyEdit.$dirty = false;
            $scope.surveyData.__v = $scope.surveyData.__v + 1;
          },
          function failed (err) {
            console.log("error:", err);
          });
      }
    };

    $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (toState.name !== "page.surveys.edit" &&
        ($scope.surveyEdit.$dirty || surveyDirty) &&
        confirm("You are leaving this page.\nDo you want to save changes to your survey?")) {

        if (findErrors()) {
          $rootScope.$broadcast('invalid_survey');
          event.preventDefault();
          return;
        }

        $rootScope.saveSurveyPromise = $scope.saveSurvey();
      }
    });

    $scope.getSurveyData($stateParams.surveyId);
  });
})();
