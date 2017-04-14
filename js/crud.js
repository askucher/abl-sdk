var toString$ = {}.toString;
angular.module('ablsdk').service('crud', function($xabl, $rootScope, debug, $mdDialog, safeApply, watcher, p){
  return function(url, initOptions){
    var parsedUrl, state, factory, provider, ref$, configureUrl, $scope, i, removeFromMemory, save, update, add, success, fetch, splice, remove, watchers, improve;
    parsedUrl = url.split('@');
    url = parsedUrl[0];
    state = {
      loading: false,
      id: "_id",
      frontendify: function(data, url){
        var parts, part, array;
        parts = url.split('/');
        part = parts[parts.length - 1];
        return array = (function(){
          switch (false) {
          case toString$.call(data).slice(8, -1) !== 'Array':
            return data;
          case toString$.call(data.list).slice(8, -1) !== 'Array':
            return data.list;
          case toString$.call(data[part]).slice(8, -1) !== 'Array':
            return data[part];
          case toString$.call(data).slice(8, -1) !== 'Object':
            return [data];
          default:
            return [];
          }
        }());
      }
    };
    factory = {
      localStorage: {
        remove: function(item){},
        add: function(item){},
        update: function(item){},
        fetch: function(item){}
      },
      memory: {
        remove: function(item){
          return removeFromMemory(item);
        },
        add: function(item, callback){
          Array.prototype.push.call(i, item);
          return typeof callback == 'function' ? callback(item) : void 8;
        },
        update: function(item, callback){
          return typeof callback == 'function' ? callback(item) : void 8;
        },
        fetch: function(){
          return state.loading = false;
        }
      },
      backend: {
        remove: function(item, options){
          var ref$;
          return $xabl['delete'](((ref$ = options.url) != null ? ref$ : url) + "/" + item[state.id]).success(function(){
            var onItemRemovedDefault, onItemRemoved, ref$;
            onItemRemovedDefault = function(){
              return removeFromMemory(item);
            };
            onItemRemoved = (ref$ = options.onItemRemoved) != null ? ref$ : onItemRemovedDefault;
            return onItemRemoved();
          });
        },
        update: function(item, callback){
          return $xabl.update(url + "/" + item[state.id], item).success(function(data){
            state.loading = false;
            return typeof callback == 'function' ? callback(data) : void 8;
          });
        },
        add: function(item, callback){
          return $xabl.create(url, item).success(function(data){
            success(data);
            return typeof callback == 'function' ? callback(data) : void 8;
          });
        },
        fetch: function(){
          var options;
          options = angular.copy(
          i.options);
          delete options.total;
          delete options.$url;
          return $xabl.get(configureUrl(url), {
            params: options
          }).success(function(data, status, headers){
            var params, r;
            i.length = 0;
            params = function(name){
              var header, parser, err;
              header = headers()[name];
              if (header != null) {
                parser = document.createElement('a');
                parser.href = headers()[name];
                try {
                  return JSON.parse('{"' + decodeURI(parser.search.substr(1, 2000)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
                } catch (e$) {
                  err = e$;
                  console.error(err, parser.search);
                  return undefined;
                }
              } else {
                return undefined;
              }
            };
            i.options.total = (r = params('x-last-page-url'), r != null
              ? parseInt(r.page) * parseInt(r.pageSize)
              : data.length);
            i.options.pageSize = (r = params('x-first-page-url'), r != null
              ? parseInt(r.pageSize)
              : data.length);
            state.loading = false;
            return success(data);
          });
        }
      }
    };
    provider = factory[(ref$ = parsedUrl[1]) != null ? ref$ : 'backend'];
    configureUrl = function(url){
      var state, replace, u;
      state = {
        url: url
      };
      replace = function(pair){
        return state.url = state.url.replace(':' + pair[0], pair[1]);
      };
      u = i.getOptions().$url;
      if (u != null) {
        p.each(replace)(
        p.objToPairs(
        u));
      }
      return state.url;
    };
    $scope = $rootScope.$new();
    $scope.items = [];
    i = $scope.items;
    state.loading = false;
    removeFromMemory = function(item){
      var index;
      index = i.indexOf(item);
      if (index > -1) {
        return Array.prototype.splice.call(i, index, 1);
      }
    };
    save = function(item, callback){
      if (item[state.id] != null || item[state._id] != null) {
        return update(item, callback);
      } else {
        return add(item, callback);
      }
    };
    update = function(item, callback){
      if (state.loading) {
        return;
      }
      return provider.update(item, callback);
    };
    add = function(item, callback){
      if (state.loading) {
        return;
      }
      return provider.add(item, callback);
    };
    success = function(data){
      var result, type, extendObject;
      result = state.frontendify(data, url);
      type = toString$.call(result).slice(8, -1);
      switch (type) {
      case 'Array':
        Array.prototype.push.apply(i, result);
        break;
      case 'Object':
        extendObject = function(pair){
          return i[pair[0]] = pair[1];
        };
        p.each(extendObject)(
        p.objToPairs(
        result));
      }
      return state.loading = false;
    };
    i.options = {};
    i.converter = function(converter){
      state.frontendify = converter.frontendify;
      state.backendify = converter.backendify;
      return i;
    };
    i.id = function(id){
      state.id = id;
      return i;
    };
    i.getOptions = function(){
      return i.options;
    };
    fetch = function(options){
      if (state.loading) {
        return;
      }
      switch (toString$.call(options).slice(8, -1)) {
      case 'Function':
        i.getOptions = options;
        return fetch({});
      case 'Number':
        i.options.page = options;
        break;
      case 'Object':
        i.options = angular.extend({}, i.getOptions(), options);
      }
      state.loading = true;
      if (i.options.page != null) {
        i.options.page -= 1;
      }
      return provider.fetch();
    };
    fetch(initOptions);
    splice = function(){
      var removed;
      if (state.loading) {
        return;
      }
      removed = Array.prototype.splice.apply(i, arguments);
      return removed.forEach(provider.remove);
    };
    remove = function(item, $event, options){
      var defaultOptions, confirm;
      if (state.loading) {
        return;
      }
      defaultOptions = {
        title: "Confirm Delete",
        content: "Deleting this pricing level will remove all prices associated with it in the timeslot section and on your booking widgets. This action cannot be undone, are you sure you want to delete this pricing level?",
        ok: 'Confirm',
        cancel: 'Cancel'
      };
      confirm = $mdDialog.confirm({
        controller: 'confirm2',
        templateUrl: 'confirm',
        locals: {
          options: angular.extend({}, defaultOptions, options)
        },
        targetEvent: $event
      });
      return $mdDialog.show(confirm).then(function(result){
        if (result === true) {
          return provider.remove(item, options);
        }
      });
    };
    watchers = [];
    improve = function(source){
      var observers, bind;
      observers = [];
      bind = curry$(function(name, func){
        var bound, mutate;
        bound = [];
        improve(bound);
        mutate = function(){
          var mutated;
          mutated = Array.prototype[name].call(source, func);
          bound.length = 0;
          return Array.prototype.push.apply(bound, mutated);
        };
        observers.push(mutate);
        mutate();
        return bound;
      });
      source.loading = function(){
        return state.loading;
      };
      source.toArray = function(){
        var a;
        a = [];
        Array.prototype.push.apply(a, source);
        return a;
      };
      source.fetchOn = function(array, $scope){
        $scope.$watch(array, bind$(i, 'fetch'), true);
        return source;
      };
      source.watch = function(array, $scope){
        var func;
        func = function(){
          return safeApply(function(){
            return observers.forEach(function(it){
              return it();
            });
          });
        };
        if ($scope != null) {
          watchers.push({
            array: $scope[array],
            func: func
          });
          $scope.$watch(array, func, true);
        } else {
          watchers.push({
            array: array,
            func: func
          });
          watcher.watch(array, func);
        }
        return source;
      };
      source.watch(source);
      ['map', 'filter'].forEach(function(item){
        return source[item] = bind(item);
      });
      source.push = add;
      source.save = save;
      source.fetch = fetch;
      source.remove = remove;
      source.splice = splice;
      return source.toArray = function(){
        return angular.copy(source);
      };
    };
    i.listen = function($scope){
      $scope.$on('$destroy', function(){
        var i$, ref$, len$, item, results$ = [];
        for (i$ = 0, len$ = (ref$ = watchers).length; i$ < len$; ++i$) {
          item = ref$[i$];
          results$.push(watcher.unwatch(item.array, item.func));
        }
        return results$;
      });
      return i;
    };
    improve(i);
    return i;
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
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}