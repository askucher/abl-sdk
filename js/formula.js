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
    var ref$, merge, onlyDefault, onlyAdult, all, mergedAdults, mergedAll, mergedDefault, max, min, final;
    if ((ac != null ? (ref$ = ac.timeslots) != null ? ref$.length : void 8 : void 8) > 0) {
      merge = function(arrays){
        return [].concat.apply([], arrays);
      };
      onlyDefault = function(slot){
        var ref$;
        return p.map(function(it){
          return it.amount;
        })(
        p.filter(function(it){
          return it.status === 'active';
        })(
        p.filter(function(it){
          return it.isDefault;
        })(
        (ref$ = slot != null ? slot.charges : void 8) != null
          ? ref$
          : [])));
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
        var ref$, this$ = this;
        return p.map(function(it){
          return it.amount;
        })(
        p.filter(function(it){
          return it.status === 'active';
        })(
        (ref$ = slot != null ? slot.charges : void 8) != null
          ? ref$
          : []));
      };
      mergedAdults = merge(ac.timeslots.map(onlyAdult));
      mergedAll = merge(ac.timeslots.map(all));
      mergedDefault = merge(ac.timeslots.map(onlyDefault));
      max = function(array){
        return Math.max.apply(Math, array);
      };
      min = function(array){
        return Math.min.apply(Math, array);
      };
      final = (function(){
        switch (false) {
        case !(mergedDefault.length > 0):
          return min(mergedDefault);
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