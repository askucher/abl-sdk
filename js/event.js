angular.module('ablsdk').directive('event', function(p, safeApply){
  return {
    restrict: 'A',
    scope: {
      event: '&'
    },
    link: function($scope, element, $attrs){
      var $element, setup;
      $element = $(element);
      setup = function(eventName){
        return $element[eventName](function(event){
          var apply;
          apply = function(){
            return $scope.event({
              event: event
            });
          };
          return safeApply(apply, $scope);
        });
      };
      return p.each(setup)(
      ['blur', 'focus', 'keyup']);
    }
  };
});