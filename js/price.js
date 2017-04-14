var toString$ = {}.toString;
angular.module('ablsdk').filter('price', function($filter){
  return function(amount, config){
    var view, r;
    view = (function(){
      switch (false) {
      case toString$.call(amount).slice(8, -1) !== 'String':
        return parseInt(amount) / 100;
      case toString$.call(amount).slice(8, -1) !== 'Number':
        return amount / 100;
      default:
        return "ERR";
      }
    }());
    if (view === 'ERR') {
      return view;
    }
    return r = (function(){
      switch (false) {
      case config !== '00.00$':
        return $filter('currency')(view).replace("$", '').trim() + "$";
      case config !== "$00":
        return '$' + Math.round(view);
      default:
        return $filter('currency')(view);
      }
    }());
  };
});