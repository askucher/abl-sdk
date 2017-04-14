angular.module('ablsdk').service('test', function(debug){
  return function(input){
    return debug(function(){
      var test;
      test = input();
      if (test !== true) {
        throw "[FAILED TEST]" + input.toString();
      }
    });
  };
});