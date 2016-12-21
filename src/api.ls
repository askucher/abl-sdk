angular
  .module \ablsdk
  .service \ablapi, ($xabl)->
      timeslots: (options)->
        req = $.param do
           activity : options.activity-id
           "status[event]" : \all
           date-range :
              * moment(options.start-time).clone!.start-of(\day).start-of(\month).toISOString!
              * moment(options.end-time).clone!.start-of(\day).end-of(\month).end-of(\day).toISOString!
           pageSize: 100
        $xabl.get("timeslots?#req")