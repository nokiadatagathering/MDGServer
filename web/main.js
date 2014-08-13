define('jquery', [], function () {
  return window.jQuery;
});

define('angular', [], function () {
  return window.angular;
});

require(['application'], function () {
  angular.bootstrap($('html'), ['Application']);
});
