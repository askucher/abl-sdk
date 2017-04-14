angular.module('ablsdk').service('ablsdk', function(ablslot, ablbook, loader, through, p, observ, types){
  return observ(function(notify){
    var widget, chooseActivity;
    widget = {
      book: null,
      slot: null,
      calc: null,
      activities: [],
      currentActivity: null,
      preferences: null,
      choose: function(item){
        switch (false) {
        case !(item instanceof types.Day):
          return widget.slot.selectDay(item);
        case !(item instanceof types.Timeslot):
          return widget.slot.chooseSlot(item);
        case !(item instanceof types.Activity):
          return chooseActivity(item);
        default:
          throw "Type of object is not supported";
        }
      }
    };
    chooseActivity = function(item){
      widget.currentActivity = item;
      widget.book = ablbook(item, function(status, data){
        return notify(status, data);
      });
      widget.slot = ablslot(item, widget.book.calendar);
      widget.calc = function(){
        return widget.book.calendar.calc;
      };
      return widget.slot.observe(function(name){
        return notify(name);
      });
    };
    widget.load = function(config){
      return through(function(cb){
        return loader.activities({
          page: 0,
          location: ""
        }, function(scope){
          widget.activities.length = 0;
          p.each(bind$(widget.activities, 'push'))(
          scope.activities);
          widget.preferences = scope.preferences;
          return cb(scope);
        });
      });
    };
    return {
      widget: widget,
      destoy: function(){
        return widget.activities.length = 0;
      }
    };
  });
});
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}