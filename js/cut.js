angular.module('ablsdk').filter('cut', function(){
  return function(value, trim){
    switch (false) {
    case typeof value !== 'undefined':
      return value;
    case value !== null:
      return value;
    case !(value.length - 3 > trim):
      return value.substr(0, trim) + '...';
    default:
      return value;
    }
  };
});