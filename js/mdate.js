angular.module('ablsdk').filter('mdate', function(debug){
  return function(obj, mask){
    switch (false) {
    case obj != null:
      return null;
    case obj.format == null:
      return obj.format(mask);
    default:
      return moment(obj).format(mask);
    }
  };
});