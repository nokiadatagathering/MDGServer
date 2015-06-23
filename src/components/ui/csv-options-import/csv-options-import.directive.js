angular.module('mdg.ui.csvOptionsImport', [])
  .directive('csvOptionsImport',
  function () {
    'use strict';
    return {
      restrict: 'A',
      replace: false,
      require: '^questionBuilder',
      transclude: true,
      scope: {
        question: '=',
        addoption: '='
      },
      controller: [
        '$scope', '$element', '$attrs', '$rootScope', function ($scope, $element, $attrs, $rootScope) {
          $scope.newOption = {};
          $scope.readFileEvent = function (event) {
            $scope.fileData = [];
            $scope.fileData.length = 0;

            var files = event.target.files,
              reader = new FileReader(),
              str;
            if (files[0].type == 'text/csv') {
              reader.onload = function (theFile) {

                str = theFile.target.result;
                var lines = str.split(/[\r\n|\n]+/),
                  findNonEmptyString = function (x) {
                    if (x !== '') {
                      return true;
                    }
                  };

                for (var i = 0; i < lines.length; i++) {
                  lines[i] = lines[i].replace(/(\r\n|\n|\r|)/gm, '').split(/[,;]+/);
                  lines[i] = lines[i].filter(findNonEmptyString);
                  if ((lines[i].length !== 0) && (lines[i][0][0] !== '#')) {
                    for (var x = 0; x < lines[i].length; x++) {
                      var result = parseFloat(lines[i][x]);
                      if (!isNaN(result)) {
                        lines[i][x] = result;
                      }
                    }
                    $scope.fileData.push(lines[i]);
                  }
                }
                $scope.addOptions();
              };
              reader.onerror = function () {
                console.error('Error reading file');
              };
              reader.readAsText(files[0]);
            } else {
              $rootScope.$broadcast('wrong_file_type');
              $scope.$apply();
              console.error('Wrong file type!');
            }

            $(event.target).replaceWith($(event.target).clone(true));        //reset checked file

          };

          $scope.addOptions = function () {
            if ($scope.addoption) {
              _.each($scope.fileData, function (data) {
                $scope.addoption(data[0]);
              });

              return;
            }

            var findRepeatedItems = function (value) {
              return _.find($scope.question.items, function (item) {
                return item.value == value;
              });
            };

            _.each($scope.fileData, function (data) {
              var
                text = data[0],
                value = text.toString().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`'"~()/?/@/±<>§"|+\[\]\s]/g, '').toLowerCase(),
                repeatedItems = findRepeatedItems(value);

              if (!repeatedItems) {
                $scope.question.items.push({text: text, value: value});
                $scope.question.addOption = false;
                $scope.newOption = {};
              } else {
                $scope.newOption.error = true;
                console.error('Duplicated option value! ', value);
              }
              $scope.$apply();
            });

            $rootScope.$broadcast('dirty_survey');
          };
          $element.on('change', $scope.readFileEvent);
        }
      ]
    };
  }
);