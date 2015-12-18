// Generated by LiveScript 1.3.1
angular.module('ablsdk', []);
// Generated by LiveScript 1.3.1
angular.module('ablsdk').service('ablapi', function($xabl){
  return {
    timeslots: function(options){
      var req;
      req = $.param({
        activity: options.activityId,
        dateRange: [moment(options.startTime).clone().startOf('day').startOf('month').toISOString(), moment(options.endTime).clone().startOf('day').endOf('month').endOf('day').toISOString()]
      });
      return $xabl.get("timeslots?" + req);
    }
  };
});
// Generated by LiveScript 1.3.1
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
// Generated by LiveScript 1.3.1
angular.module('ablsdk').service('ablcalc', function($xabl){
  var sum;
  sum = function(arr){
    switch (false) {
    case typeof arr !== 'undefined':
      return 0;
    case typeof arr !== null:
      return 0;
    case arr.length !== 0:
      return 0;
    default:
      return arr.reduce(function(x, y){
        return x + y;
      });
    }
  };
  return function(charges){
    var makeEditable, byPrice, state, calcSubtotal, calcTaxFee, calcTaxesFees, showPrice, calcPrice, showAddonPrice, calcAddonPrice, totalAddons, calcCoupon, calcTotal, coupon;
    makeEditable = function(charge){
      var ref$;
      return {
        name: charge.name,
        quantity: (ref$ = charge.count) != null ? ref$ : 0,
        amount: charge.amount,
        _id: charge._id
      };
    };
    byPrice = function(a, b){
      return b.amount - a.amount;
    };
    state = {
      attendees: charges != null ? charges.filter(function(it){
        return it.type === 'aap';
      }).map(makeEditable).sort(byPrice) : void 8,
      addons: charges != null ? charges.filter(function(it){
        return it.type === 'addon';
      }).map(makeEditable) : void 8
    };
    calcSubtotal = function(){
      return sum(
      state.attendees.map(calcPrice)) + totalAddons();
    };
    calcTaxFee = function(charge){
      switch (false) {
      case charge.type !== 'tax':
        return calcSubtotal() / 100 * charge.amount;
      case charge.type !== 'fee':
        return sum(
        state.attendees.map(function(it){
          return it.quantity;
        })) * charge.amount;
      default:
        return 0;
      }
    };
    calcTaxesFees = function(){
      return sum(
      charges.map(calcTaxFee));
    };
    showPrice = function(attendee){
      var ref$, ref1$, ref2$;
      return (ref$ = (ref1$ = charges.filter(function(it){
        return it.type === 'aap' && it.name === attendee.name;
      })) != null ? (ref2$ = ref1$[0]) != null ? ref2$.amount : void 8 : void 8) != null ? ref$ : 0;
    };
    calcPrice = function(attendee){
      return showPrice(attendee) * attendee.quantity;
    };
    showAddonPrice = function(addon){
      return sum(
      state.addons.filter(function(it){
        return it.name === addon.name;
      }).map(function(it){
        return it.amount;
      }));
    };
    calcAddonPrice = function(addon){
      return showAddonPrice(addon) * addon.quantity;
    };
    totalAddons = function(){
      return sum(
      state.addons.map(calcAddonPrice));
    };
    calcCoupon = function(){
      var subtotal, amountOff, _;
      subtotal = calcSubtotal();
      amountOff = function(){
        switch (false) {
        case !(coupon.codes[0].amountOff < subtotal):
          return coupon.codes[0].amountOff;
        default:
          return subtotal;
        }
      };
      _ = (function(){
        switch (false) {
        case coupon.codes.length !== 0:
          return 0;
        case coupon.codes[0].amountOff == null:
          return amountOff();
        case coupon.codes[0].percentOff == null:
          return subtotal / 100 * coupon.codes[0].percentOff;
        default:
          return 0;
        }
      }());
      return _;
    };
    calcTotal = function(){
      return calcSubtotal() + calcTaxesFees() - calcCoupon();
    };
    coupon = {
      codes: [],
      calc: calcCoupon,
      remove: function(c){
        var index;
        index = coupon.codes.indexOf(c);
        if (index > -1) {
          return coupon.codes.splice(index, 1);
        }
      },
      add: function(activity){
        var ref$, apply;
        if (((ref$ = coupon.code) != null ? ref$ : "").length === 0) {
          return;
        }
        coupon.error = "";
        apply = function(data){
          var success;
          success = function(){
            coupon.codes.push(data);
            coupon.code = "";
            return "";
          };
          return coupon.error = (function(){
            switch (false) {
            case !(data.maxRedemptions !== 0 && data.maxRedemptions <= data.redemptions):
              return "This coupon has been fully redeemed.";
            case !(moment().diff(moment(data.redeemBy), 'minutes') > 0):
              return "This coupon is expired";
            case !(data.activities.length > 0 && data.activities[0] !== activity):
              return "This coupon is not valid for this activity.";
            default:
              return success();
            }
          }());
        };
        return $xabl.get("coupon/" + coupon.code).success(function(data){
          return apply(data);
        }).error(function(data){
          var ref$, ref1$;
          return coupon.error = (ref$ = data != null ? (ref1$ = data.errors) != null ? ref1$[0] : void 8 : void 8) != null ? ref$ : "Coupon not found";
        });
      },
      code: ""
    };
    return {
      coupon: coupon,
      addons: state.addons,
      attendees: state.attendees,
      totalWithoutTaxesfees: calcSubtotal,
      calcCoupon: calcCoupon,
      calcTaxFee: calcTaxFee,
      calcTaxesFees: calcTaxesFees,
      showPrice: showPrice,
      calcPrice: calcPrice,
      showAddonPrice: showAddonPrice,
      calcAddonPrice: calcAddonPrice,
      totalAddons: totalAddons,
      calcSubtotal: calcSubtotal,
      calcTotal: calcTotal
    };
  };
});
// Generated by LiveScript 1.3.1
var toString$ = {}.toString;
angular.module('ablsdk').service('crud', function($xabl, $rootScope, debug, $mdDialog, safeApply, watcher){
  return function(url, initOptions){
    var parsedUrl, state, factory, provider, ref$, configureUrl, $scope, i, removeFromMemory, save, update, add, success, fetch, splice, remove, watchers, improve;
    parsedUrl = url.split('@');
    url = parsedUrl[0];
    state = {
      loading: false
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
        remove: function(item){
          return $xabl['delete'](url + "/" + item._id).success(function(){
            return removeFromMemory(item);
          });
        },
        update: function(item, callback){
          return $xabl.update(url + "/" + item._id, item).success(function(data){
            state.loading = false;
            return typeof callback == 'function' ? callback(data) : void 8;
          });
        },
        add: function(item, callback){
          return $xabl.create(url, item).success(function(data){
            debug('backend-success', data);
            success(data);
            return typeof callback == 'function' ? callback(data) : void 8;
          });
        },
        fetch: function(){
          return $xabl.get(configureUrl(url), i.options).success(function(data, status, headers){
            var params, r;
            i.length = 0;
            params = function(name){
              var header, parser;
              header = headers()[name];
              if (header != null) {
                parser = document.createElement('a');
                parser.href = headers()[name];
                return JSON.parse('{"' + decodeURI(parser.search.substr(1, 2000)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
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
      var name;
      for (name in i.urlOptions) {
        url = url.replace(':' + name, i.urlOptions[name]);
      }
      return url;
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
      if (item._id != null) {
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
      var array;
      array = (function(){
        switch (false) {
        case toString$.call(data).slice(8, -1) !== 'Array':
          return data;
        case toString$.call(data[url]).slice(8, -1) !== 'Array':
          return data[url];
        case toString$.call(data).slice(8, -1) !== 'Object':
          return [data];
        default:
          return [];
        }
      }());
      Array.prototype.push.apply(i, array);
      return state.loading = false;
    };
    i.options = {};
    i.urlOptions = {};
    fetch = function(options){
      debug('fetch', state.loading);
      if (state.loading) {
        return;
      }
      switch (typeof options) {
      case 'Number':
        i.options.page = options;
        break;
      case 'Object':
        i.urlOptions = $.extend({}, typeof options.$url == 'function' ? options.$url({}, i.options.urlOptions) : void 8);
        delete options.$url;
        i.options = $.extend({}, options, i.options);
        i.page = 1;
      }
      state.loading = true;
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
      var defaultOptions, ref$;
      if (state.loading) {
        return;
      }
      defaultOptions = {
        title: "Deletion",
        content: "Are you that you want to delete this item?",
        ok: "Confirm",
        cancel: "Cancel"
      };
      return $mdDialog.show($mdDialog.confirm().title((ref$ = options != null ? options.title : void 8) != null
        ? ref$
        : defaultOptions.title).content((ref$ = options != null ? options.content : void 8) != null
        ? ref$
        : defaultOptions.content).ok((ref$ = options != null ? options.ok : void 8) != null
        ? ref$
        : defaultOptions.ok).cancel((ref$ = options != null ? options.cancel : void 8) != null
        ? ref$
        : defaultOptions.cancel).targetEvent($event)).then(function(){
        return provider.remove(item);
      }, function(){});
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
// Generated by LiveScript 1.3.1
angular.module('ablsdk').service('abldate', function(debug){
  return function(timeZone){
    var hack, dst;
    hack = function(input, tz){
      var d, z;
      d = bind$(moment(input), 'format');
      z = bind$(tz, 'format');
      return moment(d('YYYY-MM-DD HH:mm ') + z('Z'), "YYYY-MM-DD HH:mm Z");
    };
    dst = function(d, date){
      return d.add(moment(date).tz(timeZone).utcOffset() - d.utcOffset(), 'minute');
    };
    return {
      backendify: function(date){
        var d;
        d = hack(date, moment().tz(timeZone)).tz(timeZone);
        debug('timezone', timeZone);
        dst(d);
        return d.tz("UTC").format("YYYY-MM-DD\\THH:mm:ss\\Z");
      },
      frontendify: function(date){
        var d;
        d = moment(date).tz(timeZone);
        debug('timezone', timeZone);
        dst(d, d);
        return hack(d, moment(date)).toDate();
      }
    };
  };
});
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
// Generated by LiveScript 1.3.1
var toString$ = {}.toString;
angular.module('ablsdk').factory('debug', function(enabledDebug){
  return function(input){
    var ref$;
    if (enabledDebug) {
      switch (toString$.call(input).slice(8, -1)) {
      case 'Function':
        return input();
      default:
        return typeof console != 'undefined' && console !== null ? (ref$ = console.log) != null ? ref$.apply(console, arguments) : void 8 : void 8;
      }
    }
  };
});
// Generated by LiveScript 1.3.1
angular.module('ablsdk').service('formula', function(p, debug){
  var getSlotPrice, getVisualPrice;
  getSlotPrice = function(type, slot){
    var arr, ref$;
    arr = (ref$ = slot != null ? slot.charges : void 8) != null
      ? ref$
      : [];
    return function(it){
      var ref$;
      return (ref$ = it != null ? it.amount : void 8) != null ? ref$ : 0;
    }(
    p.find(function(it){
      return it.type === type || it.subtype === type || it.description === type;
    })(
    arr));
  };
  getVisualPrice = function(ac){
    var ref$, merge, onlyAdult, all, mergedAdults, mergedAll, max, final;
    if ((ac != null ? (ref$ = ac.timeslots) != null ? ref$.length : void 8 : void 8) > 0) {
      merge = function(arrays){
        return [].concat.apply([], arrays);
      };
      onlyAdult = function(slot){
        var type, ref$;
        type = 'Adult';
        return p.map(function(it){
          return it.amount;
        })(
        p.filter(function(it){
          return it.status === 'active';
        })(
        p.filter(function(it){
          return it.type === type || it.subtype === type || it.description === type;
        })(
        (ref$ = slot != null ? slot.charges : void 8) != null
          ? ref$
          : [])));
      };
      all = function(slot){
        var ref$;
        return p.map(function(it){
          return it.amount;
        })(
        (ref$ = slot != null ? slot.charges : void 8) != null
          ? ref$
          : []);
      };
      mergedAdults = merge(ac.timeslots.map(onlyAdult));
      mergedAll = merge(ac.timeslots.map(all));
      max = function(array){
        return Math.max.apply(Math, array);
      };
      final = (function(){
        switch (false) {
        case !(mergedAdults.length > 0):
          return max(mergedAdults);
        case !(mergedAll.length > 0):
          return max(mergedAll);
        default:
          return 0;
        }
      }());
      return final;
    } else {
      return 'Non';
    }
  };
  return {
    getSlotPrice: function(slot){
      return getSlotPrice('Adult', slot);
    },
    getVisualPrice: getVisualPrice,
    getAdultPrice: function(ac){
      var ref$;
      return getSlotPrice('Adult', ac != null ? (ref$ = ac.timeslots) != null ? ref$[0] : void 8 : void 8);
    },
    getYouthPrice: function(ac){
      var ref$;
      return getSlotPrice('Youth', ac != null ? (ref$ = ac.timeslots) != null ? ref$[0] : void 8 : void 8);
    }
  };
});
// Generated by LiveScript 1.3.1
angular.module('ablsdk').service('p', function(){
  var first;
  return {
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
    map: curry$(function(f, xs){
      var i$, len$, x, results$ = [];
      for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
        x = xs[i$];
        results$.push(f(x));
      }
      return results$;
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
// Generated by LiveScript 1.3.1
angular.module('ablsdk').service('safeApply', function($rootScope){
  return function(fn){
    var phase;
    phase = $rootScope.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      return fn();
    } else {
      return $rootScope.$apply(fn);
    }
  };
});
// Generated by LiveScript 1.3.1
angular.module('ablsdk').service('ablslot', function(abldate, ablcalc, ablapi, formula, p){
  return function(activity, model){
    var state, getDay, newDate, generateCalendar, getMonth, hackDate, merge, makeAvailable, performChooseSlot, actualEvent, isEmpty, slotsByDay, select, isFitToSlot, isNotFitToAnySlot, inPast, createMonth, startMonth, setCalendars, scroll, nextMonth, calendar, loadEvents, isDummy, isDisabledDay, selectDay, notSelected, disabledSlot, notAvailableSlot, close, chooseSlot, isActiveDay, isDisabledMonth, isActiveMonth, isCalendarUpDisabled, calendarUp, calendarDown, x$;
    state = {
      slots: [],
      model: model,
      calendars: [],
      activeSlots: []
    };
    getDay = function(date){
      var res;
      if (date === null) {
        null;
      } else {
        res = (date != null ? date.format : void 8) != null
          ? date
          : moment(date);
      }
      return parseInt(
      res.format('YYYYMMDD'));
    };
    newDate = function(){
      var d;
      d = moment.apply(null, arguments).tz(activity.timeZone);
      return d;
    };
    generateCalendar = function(date, callback){
      var d, year, month, toDate, lastDay, days, day, dummies;
      d = newDate(date);
      year = d.year();
      month = d.month();
      toDate = function(number){
        return newDate([year, month, number]);
      };
      lastDay = d.endOf('month').date();
      days = p.map(toDate)(
      (function(){
        var i$, to$, results$ = [];
        for (i$ = 1, to$ = lastDay; i$ <= to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }()));
      day = newDate(days[0]).day();
      dummies = p.map(function(){
        return null;
      })(
      (function(){
        var i$, to$, results$ = [];
        for (i$ = 1, to$ = day; i$ <= to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }()));
      return {
        time: d,
        days: dummies.concat(days),
        headers: ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']
      };
    };
    getMonth = function(date){
      return Math.ceil(getDay(date) / 100);
    };
    hackDate = function(input, tz){
      var d, z;
      d = bind$(moment(input), 'format');
      z = bind$(tz, 'format');
      return moment(d('YYYY-MM-DD HH:mm ') + z('Z'), "YYYY-MM-DD HH:mm Z");
    };
    merge = function(date, time){
      var ndate, ntime;
      ndate = date != null
        ? date
        : hackDate(date, moment());
      ntime = time != null
        ? time
        : hackDate(time, moment());
      return moment([ndate.year(), ndate.month(), ndate.date(), ntime.hours(), ntime.minutes(), 0]);
    };
    makeAvailable = curry$(function(slot, arg){
      return slot.available - eval(([0].concat(state.model.attendees.map(function(it){
        return it.quantity;
      }))).join('+'));
    });
    performChooseSlot = function(slot){
      var day, merged, transform, attendees, makeAttendee;
      if (slot.available === 0) {
        return;
      }
      day = state.model.value;
      merged = merge(day, slot.startTime);
      state.model.date.start = merged;
      transform = abldate(activity.timeZone);
      state.model.date.origin = transform.backendify(state.model.date.start).replace(/[\:-]/ig, '');
      state.model.date.end = slot.endTime;
      state.model.charges = slot.charges;
      state.model.calc = ablcalc(slot.charges.concat(activity.charges));
      state.model._id = slot._id;
      attendees = state.model.attendees;
      makeAttendee = function(timeslot){
        var q;
        q = attendees.filter(function(it){
          return it.name === timeslot.name;
        });
        return {
          quantity: (function(){
            switch (false) {
            case !(q.length > 0):
              return q[0].quantity;
            case timeslot.name !== 'Adult':
              return 1;
            default:
              return 0;
            }
          }()),
          name: timeslot.name,
          amount: timeslot.amount
        };
      };
      state.model.attendees = slot.charges.filter(function(it){
        return it.type === 'aap';
      }).map(makeAttendee);
      return state.model.available = makeAvailable(slot);
    };
    actualEvent = curry$(function(day, event){
      return getDay(event.startTime) === getDay(day);
    });
    isEmpty = function(day){
      var actual;
      actual = actualEvent(day);
      return function(it){
        return it.length === 0;
      }(
      p.filter(isFitToSlot(day))(
      state.slots));
    };
    slotsByDay = function(day){
      var actual, transformSlot;
      actual = actualEvent(day);
      transformSlot = function(slot){
        var start, duration, events, available, ref$;
        start = merge(day, slot.startTime);
        duration = slot.endTime - slot.startTime;
        events = slot.events.filter(actual).map(function(it){
          return it.available;
        });
        available = (ref$ = events[0]) != null
          ? ref$
          : slot.maxOcc;
        return {
          startTime: start,
          time: start.valueOf(),
          endTime: start.clone().add(duration, 'milliseconds'),
          charges: slot.charges,
          price: formula.getVisualPrice({
            timeslots: [slot]
          }),
          available: available,
          _id: slot._id,
          duration: moment.duration(duration).format("M[M] d[d] h[h] m[m]").replace(/((^| )0[a-z])|[ ]/ig, ''),
          taken: slot.maxOcc - available
        };
      };
      return p.sortBy(function(it){
        return it.time;
      })(
      p.map(transformSlot)(
      p.filter(isFitToSlot(day))(
      state.slots)));
    };
    select = function(day){
      state.model.value = day;
      state.activeSlots.length = 0;
      return slotsByDay(day).forEach(function(slot){
        return state.activeSlots.push(slot);
      });
    };
    isFitToSlot = curry$(function(date, slot){
      var single, a, outOfActivityInterval, day, outOfWeek, check;
      single = slot.daysRunning.length === 0;
      a = activity;
      outOfActivityInterval = (function(){
        switch (false) {
        case !(getDay(slot.startTime) !== getDay(date) && single):
          return true;
        case !(getDay(slot.startTime) > getDay(date) && !single):
          return true;
        case !(getDay(slot.untilTime) < getDay(date) && !single):
          return true;
        default:
          return false;
        }
      }());
      day = function(date){
        var d, _;
        d = date != null ? typeof date.day == 'function' ? date.day() : void 8 : void 8;
        return _ = (function(){
          switch (false) {
          case d !== null:
            return null;
          case d !== 0:
            return 6;
          default:
            return d - 1;
          }
        }());
      };
      outOfWeek = !single && p.notAny(function(it){
        return it === day(date);
      })(
      slot.daysRunning);
      check = (function(){
        switch (false) {
        case !outOfWeek:
          return false;
        case !outOfActivityInterval:
          return false;
        default:
          return true;
        }
      }());
      return check;
    });
    isNotFitToAnySlot = function(date){
      switch (false) {
      case !p.notAny(function(it){
        return it.available > 0;
      })(
      slotsByDay(date)):
        return true;
      case !p.notAny(isFitToSlot(date))(
        state.slots):
        return true;
      default:
        return false;
      }
    };
    inPast = function(date){
      return getDay(date) < getDay(newDate()) || date.diff(newDate(), 'hours') < 24;
    };
    createMonth = function(date){
      return newDate([date.year(), date.month(), 15]);
    };
    startMonth = createMonth(newDate());
    setCalendars = function(f, s, callback){
      state.calendars.length = 0;
      state.calendars.push(f);
      state.calendars.push(s);
      return loadEvents(callback);
    };
    scroll = {
      activeDate: function(){
        var start, up, get, isActive, scrollTo, active;
        scroll.activeDate = function(){};
        start = state.calendars[0];
        up = function(step){
          return generateCalendar(start.time.clone().add(step, 'month'));
        };
        get = function(step){
          if (step === 0) {
            return start;
          } else {
            return up(step);
          }
        };
        isActive = function(step){
          return typeof get(step).days.find(function(it){
            return !isDisabledDay(it);
          }) !== 'undefined';
        };
        scrollTo = function(i){
          return (function(){
            var i$, to$, results$ = [];
            for (i$ = 1, to$ = i; i$ <= to$; ++i$) {
              results$.push(i$);
            }
            return results$;
          }()).forEach(bind$(calendar, 'down'));
        };
        active = [0, 1, 2, 3, 4, 5, 6].find(isActive);
        if (active > 0) {
          return scrollTo(active);
        }
      }
    };
    nextMonth = function(d, x){
      return date.clone().add(x, 'months');
    };
    calendar = {
      first: startMonth,
      second: startMonth.clone().add(1, 'months'),
      move: function(direction){
        calendar.first = calendar.first.clone().add(direction, 'month');
        calendar.second = calendar.second.clone().add(direction, 'month');
        return setCalendars(generateCalendar(calendar.first), generateCalendar(calendar.second));
      },
      down: function(){
        return calendar.move(1);
      },
      up: function(){
        return calendar.move(-1);
      }
    };
    loadEvents = function(callback){
      return ablapi.timeslots({
        startTime: state.calendars[0].time,
        endTime: state.calendars[1].time,
        activityId: activity._id
      }).success(function(loadedSlots){
        var transform, comp, transformDate;
        transform = abldate(activity.timeZone);
        comp = compose$(transform.frontendify, moment);
        transformDate = function(slot){
          slot.startTime = comp(slot.startTime);
          slot.endTime = comp(slot.endTime);
          slot.untilTime = comp(slot.untilTime);
          return slot;
        };
        state.slots = loadedSlots.timeslots.map(transformDate);
        scroll.activeDate();
        return typeof callback == 'function' ? callback() : void 8;
      });
    };
    isDummy = function(date){
      switch (false) {
      case date !== null:
        return true;
      default:
        return false;
      }
    };
    isDisabledDay = function(date){
      switch (false) {
      case !isDummy(date):
        return true;
      case !isEmpty(date):
        return true;
      case !inPast(date):
        return true;
      case !isNotFitToAnySlot(date):
        return true;
      default:
        return false;
      }
    };
    selectDay = function(day){
      if (isDisabledDay(day)) {
        return;
      }
      select(day);
      return performChooseSlot(
      state.slots[0]);
    };
    notSelected = function(){
      switch (false) {
      case state.model.date.start !== null:
        return true;
      case state.model.chosen !== false:
        return true;
      default:
        return false;
      }
    };
    disabledSlot = function(slot){
      switch (false) {
      case slot.available !== 0:
        return "This event is full";
      default:
        return "";
      }
    };
    notAvailableSlot = function(slot){
      return slot.available <= 0;
    };
    close = function(chosen){
      state.model.visible = false;
      return state.model.closed(chosen, state.model);
    };
    chooseSlot = function(slot){
      if (notAvailableSlot(slot)) {
        return;
      }
      performChooseSlot(slot);
      state.model.chosen = true;
      return close(true);
    };
    isActiveDay = function(date){
      return getDay(date) === getDay(state.model.value);
    };
    isDisabledMonth = function(date){
      switch (false) {
      case !(getDay(date) < getDay(newDate())):
        return true;
      default:
        return false;
      }
    };
    isActiveMonth = function(date){
      return getMonth(date) === getMonth(state.model.value);
    };
    isCalendarUpDisabled = function(){
      return getMonth(state.calendars[0].time) < getMonth(newDate());
    };
    calendarUp = function(){
      if (isCalendarUpDisabled()) {
        return;
      }
      return calendar.up();
    };
    calendarDown = function(){
      return calendar.down();
    };
    x$ = state;
    x$.setCalendars = setCalendars;
    x$.selectDay = selectDay;
    x$.generateCalendar = generateCalendar;
    x$.calendarUp = calendarUp;
    x$.calendarDown = calendarDown;
    x$.close = close;
    x$.isActiveMonth = isActiveMonth;
    x$.isDisabledDay = isDisabledDay;
    x$.isDisabledMonth = isDisabledMonth;
    x$.isCalendarUpDisabled = isCalendarUpDisabled;
    x$.isDummy = isDummy;
    x$.isActiveDay = isActiveDay;
    x$.notSelected = notSelected;
    x$.chooseSlot = chooseSlot;
    x$.notAvailableSlot = notAvailableSlot;
    x$.disabledSlot = disabledSlot;
    return state;
  };
});
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
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
function compose$() {
  var functions = arguments;
  return function() {
    var i, result;
    result = functions[0].apply(this, arguments);
    for (i = 1; i < functions.length; ++i) {
      result = functions[i](result);
    }
    return result;
  };
}
// Generated by LiveScript 1.3.1
angular.module('ablsdk').service('watcher', function($rootScope, browser, debug){
  var ugly, standard, r;
  ugly = function(){
    return {
      unwatch: function(array, func){
        return typeof func.unwatch == 'function' ? func.unwatch() : void 8;
      },
      watch: function(array, func){
        var $scope;
        $scope = $rootScope.$new();
        $scope.array = array;
        return func.unwatch = $scope.$watch('array', func, true);
      }
    };
  };
  standard = function(){
    return {
      unwatch: function(array, func){
        return Array.unobserve(array, func);
      },
      watch: function(array, callback){
        var createWatch, watch, ref$;
        createWatch = function(){
          var n;
          n = $rootScope.$new();
          return function(array, func){
            n.array = array;
            return n.$watch('array', func);
          };
        };
        watch = (ref$ = Array.observe) != null
          ? ref$
          : createWatch();
        return watch(array, callback);
      }
    };
  };
  debug(browser.name);
  r = (function(){
    switch (false) {
    case browser.name !== 'firefox':
      return ugly();
    case browser.name !== 'unknown':
      return ugly();
    case browser.name !== 'safari':
      return ugly();
    default:
      return ugly();
    }
  }());
  return r;
});
