var toString$ = {}.toString;
angular.module('ablsdk').service('p', function(){
  var flatten, first, this$ = this;
  flatten = function(xs){
    var x;
    return [].concat.apply([], (function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
        x = ref$[i$];
        if (toString$.call(x).slice(8, -1) === 'Array') {
          results$.push(flatten(x));
        } else {
          results$.push(x);
        }
      }
      return results$;
    }()));
  };
  return {
    take: curry$(function(n, xs){
      if (n <= 0) {
        return xs.slice(0, 0);
      } else {
        return xs.slice(0, n);
      }
    }),
    drop: curry$(function(n, xs){
      if (n <= 0) {
        return xs;
      } else {
        return xs.slice(n);
      }
    }),
    head: first = function(xs){
      return xs[0];
    },
    each: curry$(function(f, xs){
      var i$, len$, x;
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        f(x);
      }
      return xs;
    }),
    isItNaN: function(x){
      return x !== x;
    },
    all: curry$(function(f, xs){
      var i$, len$, x;
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        if (!f(x)) {
          return false;
        }
      }
      return true;
    }),
    map: curry$(function(f, xs){
      return xs.map(f);
    }),
    fold: curry$(function(f, memo, xs){
      var i$, len$, x;
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        memo = f(memo, x);
      }
      return memo;
    }),
    filter: curry$(function(f, xs){
      var i$, len$, x, results$ = [];
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        if (f(x)) {
          results$.push(x);
        }
      }
      return results$;
    }),
    find: curry$(function(f, xs){
      var i$, len$, x;
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        if (f(x)) {
          return x;
        }
      }
    }),
    pairsToObj: function(object){
      var i$, len$, x, resultObj$ = {};
      for (i$ = 0, len$ = object.length; i$ < len$; ++i$) {
        x = object[i$];
        resultObj$[x[0]] = x[1];
      }
      return resultObj$;
    },
    objToPairs: function(object){
      var key, value, results$ = [];
      for (key in object) {
        value = object[key];
        results$.push([key, value]);
      }
      return results$;
    },
    values: function(object){
      var key, value, results$ = [];
      for (key in object) {
        value = object[key];
        results$.push(value);
      }
      return results$;
    },
    any: curry$(function(f, xs){
      var i$, len$, x;
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        if (f(x)) {
          return true;
        }
      }
      return false;
    }),
    notAny: curry$(function(f, xs){
      var i$, len$, x;
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        if (f(x)) {
          return false;
        }
      }
      return true;
    }),
    sum: function(xs){
      var result, i$, len$, x;
      result = 0;
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        result += x;
      }
      return result;
    },
    sort: function(xs){
      return xs.concat().sort(function(x, y){
        if (x > y) {
          return 1;
        } else if (x < y) {
          return -1;
        } else {
          return 0;
        }
      });
    },
    concat: function(xss){
      return [].concat.apply([], xss);
    },
    concatMap: curry$(function(f, xs){
      var x;
      return [].concat.apply([], (function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
          x = ref$[i$];
          results$.push(f(x));
        }
        return results$;
      }()));
    }),
    flatten: flatten,
    groupBy: curry$(function(f, xs){
      var results, i$, len$, x, key;
      results = {};
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        key = f(x);
        if (key in results) {
          results[key].push(x);
        } else {
          results[key] = [x];
        }
      }
      return results;
    }),
    sortWith: curry$(function(f, xs){
      return xs.concat().sort(f);
    }),
    sortBy: curry$(function(f, xs){
      return xs.concat().sort(function(x, y){
        if (f(x) > f(y)) {
          return 1;
        } else if (f(x) < f(y)) {
          return -1;
        } else {
          return 0;
        }
      });
    }),
    reverse: function(xs){
      return xs.concat().reverse();
    },
    split: curry$(function(sep, str){
      return str.split(sep);
    }),
    join: curry$(function(sep, xs){
      return xs.join(sep);
    }),
    lines: function(str){
      if (!str.length) {
        return [];
      }
      return str.split('\n');
    },
    unlines: function(it){
      return it.join('\n');
    },
    words: function(str){
      if (!str.length) {
        return [];
      }
      return str.split(/[ ]+/);
    },
    unwords: function(it){
      return it.join(' ');
    },
    chars: function(it){
      return it.split('');
    },
    unchars: function(it){
      return it.join('');
    },
    repeat: curry$(function(n, str){
      var result, i$;
      result = '';
      for (i$ = 0; i$ < n; ++i$) {
        result += str;
      }
      return result;
    }),
    maximum: function(xs){
      var max, i$, ref$, len$, x;
      max = xs[0];
      for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
        x = ref$[i$];
        if (x > max) {
          max = x;
        }
      }
      return max;
    },
    minimum: function(xs){
      var min, i$, ref$, len$, x;
      min = xs[0];
      for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
        x = ref$[i$];
        if (x < min) {
          min = x;
        }
      }
      return min;
    },
    maximumBy: curry$(function(f, xs){
      var max, i$, ref$, len$, x;
      max = xs[0];
      for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
        x = ref$[i$];
        if (f(x) > f(max)) {
          max = x;
        }
      }
      return max;
    }),
    minimumBy: curry$(function(f, xs){
      var min, i$, ref$, len$, x;
      min = xs[0];
      for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
        x = ref$[i$];
        if (f(x) < f(min)) {
          min = x;
        }
      }
      return min;
    }),
    capitalize: function(str){
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    camelize: function(it){
      return it.replace(/[-_]+(.)?/g, function(arg$, c){
        return (c != null ? c : '').toUpperCase();
      });
    },
    dasherize: function(str){
      return str.replace(/([^-A-Z])([A-Z]+)/g, function(arg$, lower, upper){
        return lower + "-" + (upper.length > 1
          ? upper
          : upper.toLowerCase());
      }).replace(/^([A-Z]+)/, function(arg$, upper){
        if (upper.length > 1) {
          return upper + "-";
        } else {
          return upper.toLowerCase();
        }
      });
    }
  };
});
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}