angular
  .module \ablsdk
  .service do 
    * \safeApply
    * ($root-scope)->
        (fn, $scope) ->
            $current = $scope ? $root-scope
            const phase = $current.$$phase
            if phase is \$apply or phase is \$digest
              fn!
            else
              $current.$apply fn
        