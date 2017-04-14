var toString$ = {}.toString;
angular.module('ablsdk').factory('debug', function(enabledDebug, $window){
  return function(input){
    var mtch, ref$;
    if (enabledDebug) {
      mtch = (function(){
        switch (false) {
        case toString$.call(input != null ? input.match : void 8).slice(8, -1) !== 'Function':
          return input.match(/<<[a-z]+>>/i);
        default:
          return null;
        }
      }());
      if (mtch && window['catch'] === mtch[0].replace('<<', '').replace('>>', '')) {
        debugger;
      } else {
        switch (toString$.call(input).slice(8, -1)) {
        case 'Function':
          return input();
        default:
          return typeof console != 'undefined' && console !== null ? (ref$ = console.log) != null ? ref$.apply(console, arguments) : void 8 : void 8;
        }
      }
    }
  };
});