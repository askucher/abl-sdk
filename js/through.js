angular.module('ablsdk').service('through', function(p, $timeout){
  return function(func){
    var state;
    state = {
      result: null,
      hasResult: false,
      observers: []
    };
    func(function(scope){
      state.result = scope;
      state.hasResult = true;
      return p.each(function(it){
        return it(scope);
      })(
      state.observers);
    });
    return {
      then: function(cb){
        if (state.hasResult === true) {
          cb(state.result);
        }
        return state.observers.push(cb);
      }
    };
  };
});