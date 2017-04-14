angular.module('ablsdk').factory('prefill', function(debug, safeApply){
  return function(func){
    return;
    return debug(function(){
      return;
      return $.prefill = function(){
        var params, STRIP_COMMENTS, ARGUMENT_NAMES, getParams, requiredParams, i;
        params = Array.prototype.slice.call(arguments);
        STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        ARGUMENT_NAMES = /([^\s,]+)/g;
        getParams = function(func){
          var fnStr, result;
          fnStr = func.toString().replace(STRIP_COMMENTS, '');
          result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
          if (result === null) {
            return [];
          } else {
            return result;
          }
        };
        requiredParams = getParams(func);
        if (params.length === 0 && requiredParams.length > 0) {
          for (i in requiredParams) {
            params[i] = prompt("Put value for required " + i + " param");
          }
        }
        return safeApply(function(){
          return func.apply(null, params);
        });
      };
    });
  };
});