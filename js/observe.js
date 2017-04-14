angular.module('ablsdk').service('observ', function(){
  return function(func){
    var observers, notify, scope;
    observers = [];
    notify = function(name, obj){
      var notify, this$ = this;
      notify = function(item){
        return item[1](obj);
      };
      return observers.filter(function(it){
        return it[0] === name;
      }).forEach(notify);
    };
    scope = func(notify);
    scope.on = function(name, callback){
      return observers.push([name, callback]);
    };
    scope.off = function(callback){
      var remove, this$ = this;
      remove = function(item){
        var index;
        index = observers.indexOf(item);
        return observers.splice(index, 1);
      };
      return observers.filter(function(it){
        return it[1] === callback;
      }).forEach(remove);
    };
    return scope;
  };
});