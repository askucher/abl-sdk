angular
  .module \ablsdk
  .service \ablapi, ($xabl)->
      timeslots: (options)->
        req = $.param do
           activity : options.activity-id
           date-range :
              * moment(options.start-time).clone!.start-of(\day).start-of(\month).toISOString!
              * moment(options.end-time).clone!.start-of(\day).end-of(\month).end-of(\day).toISOString!
        $xabl.get("timeslots?#req") 