angular.module('ablsdk').service('watcher', function($rootScope, browser, debug){
  var ugly, standard, r;
  ugly = function(){
    return {
      unwatch: function(array, func){
        return typeof func.unwatch == 'function' ? func.unwatch() : void 8;
      },
      watch: function(array, func){
        var $scope;
        $scope = $rootScope.$new();
        $scope.array = array;
        return func.unwatch = $scope.$watch('array', func, true);
      }
    };
  };
  standard = function(){
    return {
      unwatch: function(array, func){
        return Array.unobserve(array, func);
      },
      watch: function(array, callback){
        var createWatch, watch, ref$;
        createWatch = function(){
          var n;
          n = $rootScope.$new();
          return function(array, func){
            n.array = array;
            return n.$watch('array', func);
          };
        };
        watch = (ref$ = Array.observe) != null
          ? ref$
          : createWatch();
        return watch(array, callback);
      }
    };
  };
  r = (function(){
    switch (false) {
    case browser.name !== 'firefox':
      return ugly();
    case browser.name !== 'unknown':
      return ugly();
    case browser.name !== 'safari':
      return ugly();
    default:
      return ugly();
    }
  }());
  return r;
});