angular
  .module \ablsdk
  .service \abldate, (debug)->
      (time-zone)->
          hack = (input, tz)->
            d = moment(input)~format
            z = tz~format
            moment(d('YYYY-MM-DD HH:mm ') + z(\Z), "YYYY-MM-DD HH:mm Z")
          dst = (d, date)->
            d.add(moment(date).tz(time-zone).utcOffset! -  d.utcOffset!, \minute)
          backendify: (date)->
              d = hack(date, moment().tz(time-zone)).tz(time-zone)
              debug \timezone, time-zone
              dst d
              d.tz("UTC").format("YYYY-MM-DD\\THH:mm:ss\\Z")
          frontendify: (date)->
              d = moment(date).tz(time-zone)
              #w d.format!
              debug \timezone, time-zone
              dst d, d
              hack(d, moment(date)).to-date!