angular.module('ablsdk').filter('capitalize', function(){
  return function(input){
    if (angular.isString(input) && input.length > 0) {
      return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
    } else {
      return input;
    }
  };
}).filter('capitalizeAll', function(){
  return function(input){
    if (angular.isString(input) && input.length > 0) {
      return input.split(' ').map(function(it){
        return it.charAt(0).toUpperCase() + it.substr(1).toLowerCase();
      }).join(' ');
    } else {
      return input;
    }
  };
});