angular.module('ablsdk').service('types', function(p){
  var types, Day, Activity, Timeslot;
  types = {
    Day: Day = (function(){
      Day.displayName = 'Day';
      var prototype = Day.prototype, constructor = Day;
      function Day(){}
      return Day;
    }()),
    Activity: Activity = (function(){
      Activity.displayName = 'Activity';
      var prototype = Activity.prototype, constructor = Activity;
      function Activity(){}
      return Activity;
    }()),
    Timeslot: Timeslot = (function(){
      Timeslot.displayName = 'Timeslot';
      var prototype = Timeslot.prototype, constructor = Timeslot;
      function Timeslot(){}
      return Timeslot;
    }()),
    is: function(get, obj){
      var Type;
      Type = get(types);
      return obj instanceof Type;
    },
    cast: curry$(function(get, obj){
      var Type, nobj, fill;
      Type = get(types);
      nobj = new Type;
      fill = function(prop){
        return nobj[prop[0]] = prop[1];
      };
      p.each(fill)(
      p.objToPairs(
      obj));
      return nobj;
    })
  };
  return types;
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