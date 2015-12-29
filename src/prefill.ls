angular
  .module do
    * \ablsdk
  .factory do
      * \prefill
      * (debug, safe-apply, $window)->
          (func)->
            debug ->
              $window.prefill = ->
                 params = arguments
                 safe-apply ->
                    func.apply null, params
              if $window.parent?
                 $window.parent.prefill = $window.prefill