define(function () {
  'use strict';
  return function ($compile) {
    return {
      restrict: 'A',
      transclude: true,

      scope: {
        question: '=questionData',
        type: '=questionType',
        deleteOption: '=deleteOption',
        category: '=categoryData',
        updateOption: '=updateOption'
      },
      controller: [
        '$scope', '$element', '$attrs', '$rootScope', '$compile', function ($scope, $element, $attrs, $rootScope, $compile) {
          $scope.question.addOption = false;
          $scope.newOption = {};
          $scope.digitsPattern = "^[0-9]*$";
          $scope.decimalPattern = "^[0-9]*\\.?[0-9]*$";

          var makeOptionValue = function (text) {
            return text.toString().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`'"~()/?/@/±<>§"|+\[\]\s]/g,'').toLowerCase();
          };

          $scope.question.items = $scope.question.items ? $scope.question.items : [];

          $scope.$watch('question.type', function (newVal) {
            if (newVal == 'cascade1' && !$scope.question.cascades) {
              $scope.question.tagName = 'select1';
              $scope.question.cascades = {};
              $scope.question.cascades.cascade2 = {};
            }
          });

          $scope.selectOption = function (item) {
            $scope.question.selectedOption = item.value;
            $scope.question.categoryId = $scope.category.id;
            _.each($scope.question.cascades, function (cascade, index) {
              $scope.question.cascades[index].selectedOption = '';
            });
            var cascadeString = '<div cascade-question="question.cascades.cascade2" selected-option="question.selectedOption" ' +
                'parent-cascade="question" cascade-index="2" prev-question-id="question.id"></div>',
              cascadeParentTmpl = $compile(cascadeString)($scope);

            $element.find('.cascade2-tmpl').html(cascadeParentTmpl);
          };

          $scope.addOption = function (text, event) {
            if (event && event.keyCode !== 13) {
              return;
            }

            if (text) {
              var
                value = makeOptionValue(text),
                repeatedItems = _.find($scope.question.items, function (item) {
                  return item.value == value;
                });

              if (!repeatedItems) {
                $scope.question.items.push({ text: text, value: value, prevText: text });
                $scope.question.addOption = false;
                $scope.newOption = {};
              } else {
                $scope.newOption.error = true;
                console.error('Duplicated option value!');
              }
            } else {
              $scope.question.addOption = false;
            }
          };

          $scope.editOption = function (item, index, event) {
            var value = makeOptionValue(item.text),
              repeatedItems;

            if (event && event.keyCode !== 13) {
              return;
            }

            if (item.text === '') {
              item.text = item.prevText;
              item.edit = false;
              return;
            }

            if ($scope.question.items[index].value == value) {
              item.error = false;
              item.edit = false;
            } else {
              repeatedItems = _.find($scope.question.items, function (item) {
                return item.value == value;
              });

              if (!repeatedItems) {
                if ($scope.question.cascades.cascade2[item.value]) {
                  $scope.question.cascades.cascade2[item.value].relevantOptions.questionValue = value;
                  $scope.question.cascades.cascade2[value] = angular.copy($scope.question.cascades.cascade2[item.value]);
                  $element.find('.cascade2-tmpl').html('');
                  delete $scope.question.cascades.cascade2[item.value];
                }

                item.value = value;
                item.error = false;
                item.edit = false;
              } else {
                item.error = true;
                console.error('Duplicated option value!');
              }
            }
          };

          var deleteCascadeLevel = function (cascadeIndex, items, itemToDel) {
            var cascadeType = 'cascade' + (cascadeIndex + 1),
              cascadeNextType = 'cascade' + (cascadeIndex + 2),
              item;
            if ($scope.question.cascades[cascadeType]) {
              for (var i in items) {
                item = items[i];
                if ($scope.question.cascades[cascadeNextType] && $scope.question.cascades[cascadeNextType][item.value]) {
                  deleteCascadeLevel(cascadeIndex + 1, $scope.question.cascades[cascadeNextType][item.value].items, item);
                  delete $scope.question.cascades[cascadeType][item.value];
                }
              }
              delete $scope.question.cascades[cascadeType][itemToDel.value];
            }
          };

          $scope.deleteCascadeOption = function (item) {
            var index = $scope.question.items.indexOf(item);

            if ($scope.question.items.length === 1) {
              $rootScope.$broadcast("empty_question", $scope.question.dropdownSelect.value);
              return;
            }
            if ($scope.question.cascades.cascade2 && $scope.question.cascades.cascade2[item.value]) {
              if ($scope.question.selectedOption == item.value) {
                $element.find('.cascade2-tmpl').html('');
              }
              deleteCascadeLevel(1, $scope.question.cascades.cascade2[item.value].items, item);
            }
            $scope.question.items.splice(index,1);
          };

          $scope.checkMinMaxValues = function (question, changeChecked) {
            if (changeChecked) {
              question[changeChecked] = !question[changeChecked];
            }

            question.minmaxError = false;
            $rootScope.surveyErrors.minmaxError = false;

            if (question.minValue && question.minValue.length > 0) {
              question.minValue = isNaN(parseFloat(question.minValue)) ? "" : parseFloat(question.minValue);
            }

            if (question.maxValue && question.maxValue.length > 0) {
              question.maxValue = isNaN(parseFloat(question.maxValue)) ? "" : parseFloat(question.maxValue);
            }

            if (question.maxChecked && question.minChecked &&
              question.minValue !== "" && question.maxValue !== "" &&
              question.minValue >= question.maxValue) {
              question.minmaxError = true;
              $rootScope.surveyErrors.minmaxError = true;
            } else {
              $scope.$parent.$parent.$parent.checkSLIntValueError(question);
              $scope.checkDefaultValue(question);
            }
          };

          $scope.checkDefaultValue = function (question) {
            question.defaultValueError = false;
            $rootScope.surveyErrors.defaultValueError = false;

            question.minValue = parseFloat(question.minValue);
            question.maxValue = parseFloat(question.maxValue);

            if (typeof question.defaultValue == 'string') {
              question.defaultValue = isNaN(parseFloat(question.defaultValue)) ? "" : parseFloat(question.defaultValue);
            }

            if (question.defaultValue !== "" &&
              question.minChecked && question.minValue > question.defaultValue ||
              question.maxChecked && question.maxValue < question.defaultValue) {
              question.defaultValueError = true;
              $rootScope.surveyErrors.defaultValueError = true;
            }
          };
        }
      ],
      templateUrl: '/partials/templates/questionBuilder.html'
    };
  };
});
