var toString$ = {}.toString;
angular.module('ablsdk').service('loader', function($xabl, types, p){
  return {
    activities: function(options, callback){
      var config, ref$;
      config = $.param({
        location: (ref$ = options.location) != null ? ref$ : "",
        pageSize: 100,
        page: (ref$ = options.page) != null ? ref$ : 0,
        noEmpty: false,
        dateRange: [moment().startOf('day').format(), moment().clone().add(18, 'months').endOf('day').format()]
      });
      return $xabl.get("operators/" + $xabl.options.key).error(function(){
        throw "An error occurred getting Operator information for key " + $xabl.options.key;
      }).success(function(info){
        return $xabl.get("activities?" + config).success(function(resp){
          var this$ = this;
          if (toString$.call(resp.list).slice(8, -1) !== 'Array') {
            throw ".list is not Array";
          }
          if (toString$.call(resp.preferences).slice(8, -1) !== 'Object') {
            throw ".preferences is not Object";
          }
          return callback({
            activities: p.map(types.cast(function(it){
              return it.Activity;
            }))(
            resp.list),
            preferences: resp.preferences,
            info: info
          });
        });
      });
    }
  };
});