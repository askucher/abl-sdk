angular.module('ablsdk').service('ablapi', function($xabl){
  return {
    timeslots: function(options){
      var req;
      req = $.param({
        activity: options.activityId,
        "status[event]": 'all',
        dateRange: [moment(options.startTime).clone().startOf('day').startOf('month').toISOString(), moment(options.endTime).clone().startOf('day').endOf('month').endOf('day').toISOString()],
        pageSize: 100
      });
      return $xabl.get("timeslots?" + req);
    }
  };
});