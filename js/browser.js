angular.module('ablsdk').service('browser', function($window){
  var name;
  name = function(){
    var userAgent, browsers, key;
    userAgent = $window.navigator.userAgent;
    browsers = {
      chrome: /chrome/i,
      safari: /safari/i,
      firefox: /firefox/i,
      ie: /msie/i
    };
    for (key in browsers) {
      if (browsers[key].test($window.navigator.userAgent)) {
        return key;
      }
    }
    return 'unknown';
  };
  return {
    name: name()
  };
});