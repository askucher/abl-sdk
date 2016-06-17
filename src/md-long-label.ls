angular
  .module \ablsdk
  .directive \mdLongLabel, (debug)->
     restrict: \C
     link: ($scope, $element)->
         label = $($element.0).find(\label)
         #debug \padding-top, label.height!
         set-timeout do 
           * ->
              $($element.0).css \margin-top, label.height!
           * 100