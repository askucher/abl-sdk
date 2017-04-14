angular.module('ablsdk').directive('mdLongLabel', function(debug){
  return {
    restrict: 'C',
    link: function($scope, $element){
      var label;
      label = $($element[0]).find('label');
      return setTimeout(function(){
        return $($element[0]).css('margin-top', (function(){
          switch (false) {
          case label.height() !== 0:
            return 0;
          case label.height() !== 20:
            return 0;
          default:
            return label.height();
          }
        }()));
      }, 100);
    }
  };
});