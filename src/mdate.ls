angular
  .module \ablsdk
  .filter \mdate, (debug)->
      (obj, mask)->
        if obj? then obj.format(mask) else null 