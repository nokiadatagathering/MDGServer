angular.module('mdg.ui.cascadeQuestion',[])
  .directive('cascadeQuestion',
  function ($compile) {
    'use strict';
    return {
      restrict: 'A',
      transclude: true,
      require: 'questionBuilder',
      scope: {
        cascades: '=cascadeQuestion',
        selectedOption: '=',
        parentCascade: '=',
        prevQuestionId: '=',
        cascadeIndex: '='
      },
      controller: [
        '$scope', '$element', '$compile', '$attrs', '$rootScope', function ($scope, $element, $compile, $attrs, $rootScope) {
          $scope.cascadeNextName = 'cascade' + (parseInt($scope.cascadeIndex) + 1);
          $scope.newOption = {};
          $scope.showAddOption = false;

          var scrollDistance = parseInt($scope.cascadeIndex) * 260 + 260;
          $element.offsetParent().scrollLeft(scrollDistance);

          var makeCacadeChild = function (questionValue, item) {
              var categoryId = $scope.parentCascade.categoryId,
                questionId = $scope.prevQuestionId,
                cascadeIndex = parseInt($scope.cascades[$scope.selectedOption].cascadeIndex),
                cascadeId = $rootScope.generateUUID(),

                newCascade = {
                  id: cascadeId,
                  addOption: false,
                  constraint: '',
                  items: [],
                  label: $scope.parentCascade.label,
                  required: false,
                  tagName: 'select1',
                  type: 'cascade' + cascadeIndex,
                  parentid: $scope.parentCascade.id,
                  relevantOptions: {
                    categoryId: categoryId,
                    questionId: questionId,
                    questionValue: questionValue
                  },
                  cascadeIndex: cascadeIndex + 1
                };
              newCascade.items.push(item);
              return newCascade;
            },

            generateCascadeTmpl = function () {
              var cascadeNextIndex = parseInt($scope.cascadeIndex) + 1,
                cascadeString = '<div cascade-question="parentCascade.cascades[cascadeNextName]" selected-option="cascades.selectedOption" ' +
                  'parent-cascade="parentCascade" cascade-index="' + cascadeNextIndex + '" prev-question-id="cascades[selectedOption].id"></div>',
                newCascadeTmpl = $compile(cascadeString)($scope),
                classCascade = '.' + $scope.cascadeNextName + '-tmpl';
              $element.find(classCascade).html(newCascadeTmpl);
            },

            makeOptionValue = function (text) {
              return text.toString().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`'"~()/?/@/±<>§"|+\[\]\s]/g, '').toLowerCase();
            };

          $scope.selectOption = function (item) {
            var cascadeType = 'cascade' + (parseInt($scope.cascadeIndex) + 1);
            _.each($scope.parentCascade.cascades, function (cascade, key) {
              var index = key.substr(7, key.length);
              if (index >= $scope.cascadeIndex) {
                $scope.parentCascade.cascades[key].selectedOption = '';
              }
            });
            $scope.cascades.selectedOption = item.value;
            if (!$scope.parentCascade.cascades[cascadeType]) {
              $scope.parentCascade.cascades[cascadeType] = {};
            }
            generateCascadeTmpl();
          };

          $scope.addOption = function (text, event) {
            if (event && event.keyCode !== 13) {
              return;
            }

            if (text) {
              var value = makeOptionValue(text),
                checkRepeatedOptions = function (value) {
                  var repeatedItems = 0;

                  _.each($scope.cascades, function (cascade, cIndex) {
                    var repeatedItem = _.find(cascade.items, function (item) {
                      return item.value == value;
                    });
                    if (repeatedItem) {
                      repeatedItems++;
                    }
                  });
                  return repeatedItems;
                };
              if ($.isEmptyObject($scope.cascades[$scope.selectedOption])) {
                if (!checkRepeatedOptions(value)) {
                  $scope.cascades[$scope.selectedOption] = {cascadeIndex: $scope.cascadeIndex};
                  $scope.cascades[$scope.selectedOption] = makeCacadeChild($scope.selectedOption, {
                    text: text,
                    value: value
                  });
                  $scope.newOption = {};
                  $scope.showAddOption = false;
                } else {
                  $scope.newOption.error = true;
                  console.error('Duplicated option value! ', value);
                }
              } else {
                if (!checkRepeatedOptions(value)) {
                  $scope.cascades[$scope.selectedOption].items.push({text: text, value: value});
                  $scope.newOption = {};
                  $scope.showAddOption = false;
                } else {
                  $scope.newOption.error = true;
                  console.error('Duplicated option value! ', value);
                }
              }
            } else {
              $scope.showAddOption = false;
            }
            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
              $scope.$apply();
            }
          };

          $scope.editOption = function (item, index, event) {
            var value = makeOptionValue(item.text),
              cascadeNextType = 'cascade' + ($scope.cascadeIndex + 1),
              repeatedItem,
              repeatedItems = 0;

            if (event && event.keyCode !== 13) {
              return;
            }

            if (item.text === '') {
              item.text = item.prevText;
              item.edit = false;
              return;
            }

            if ($scope.cascades[$scope.selectedOption].items[index].value == value) {
              item.error = false;
              item.edit = false;
            } else {

              _.each($scope.cascades, function (cascade, cIndex) {
                repeatedItem = _.find(cascade.items, function (item) {
                  return item.value == value;
                });
                if (repeatedItem) {
                  repeatedItems++;
                }
              });

              if (!repeatedItems) {
                if ($scope.parentCascade.cascades[cascadeNextType] && $scope.parentCascade.cascades[cascadeNextType][item.value]) {
                  $scope.parentCascade.cascades[cascadeNextType][item.value].relevantOptions.questionValue = value;
                  $scope.parentCascade.cascades[cascadeNextType][value] = angular.copy($scope.parentCascade.cascades[cascadeNextType][item.value]);
                  $element.find('.' + cascadeNextType + '-tmpl').html('');
                  delete $scope.parentCascade.cascades[cascadeNextType][item.value];
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
            if ($scope.parentCascade.cascades[cascadeType]) {
              for (var i in items) {
                item = items[i];
                if ($scope.parentCascade.cascades[cascadeNextType] && $scope.parentCascade.cascades[cascadeNextType][item.value]) {
                  deleteCascadeLevel(cascadeIndex + 1, $scope.parentCascade.cascades[cascadeNextType][item.value].items, item);
                  delete $scope.parentCascade.cascades[cascadeType][item.value];
                }
              }
              delete $scope.parentCascade.cascades[cascadeType][itemToDel.value];
            }
          };
          $scope.deleteOption = function (item) {
            var index = $scope.cascades[$scope.selectedOption].items.indexOf(item),
              cascadeIndex = parseInt($scope.cascadeIndex),
              cascadeType = 'cascade' + (cascadeIndex + 1);

            if ($scope.parentCascade.cascades[cascadeType] && $scope.parentCascade.cascades[cascadeType][item.value]) {
              if ($scope.cascades.selectedOption == item.value) {
                $element.find('.' + cascadeType + '-tmpl').html('');
              }
              deleteCascadeLevel(cascadeIndex, $scope.parentCascade.cascades[cascadeType][item.value].items, item);
            }

            $scope.cascades[$scope.selectedOption].items.splice(index, 1);

            if ($scope.cascades[$scope.selectedOption].items.length === 0) {
              delete $scope.cascades[$scope.selectedOption];
            }
          };

        }
      ],
      templateUrl: 'components/ui/cascade-question/cascade-question.html'
    };
  }
);
