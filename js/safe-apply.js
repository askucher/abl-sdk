angular.module('ablsdk').service('safeApply', function($rootScope){
  return function(fn, $scope){
    var $current, phase;
    $current = $scope != null ? $scope : $rootScope;
    phase = $current.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      return fn();
    } else {
      return $current.$apply(fn);
    }
  };
});