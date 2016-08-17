angular
  .module \ablsdk
  .filter \mdate, (debug)->
      (obj, mask)->
        | not obj? => null 
        | obj.format? => obj.format(mask)
        | _ => moment(obj).format(mask)