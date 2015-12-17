angular
  .module \ablsdk
  .service do 
    * \safeApply
    * ($root-scope)->
        (fn) ->
            const phase = $root-scope.$$phase
            if phase is \$apply or phase is \$digest
              fn!
            else
              $root-scope.$apply fn
        