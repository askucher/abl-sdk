angular
  .module do
    * \ablsdk
  .factory do
      * \prefill
      * (debug, safe-apply, $window)->
          (func)->
            debug ->
              $window.prefill = ->
                 params = Array.prototype.slice.call(arguments)
                 STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg
                 ARGUMENT_NAMES = /([^\s,]+)/g
                 get-params = (func)->
                    const fnStr = func.toString!.replace(STRIP_COMMENTS, '')
                    const result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
                    if result is null
                       []
                    else
                      result
                 required-params = get-params func
                 if params.length is 0 and required-params.length > 0
                   for i of required-params
                      params[i] = prompt "Put value for required #i param"
                 safe-apply ->
                    func.apply null, params
              if $window.parent?
                 $window.parent.prefill = $window.prefill