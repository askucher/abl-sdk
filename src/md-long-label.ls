angular
  .module \ablsdk
  .directive \mdLongLabel, (debug)->
     restrict: \C
     link: ($scope, $element)->
         label = $($element.0).find(\label)
         #debug \padding-top, label.height!
         set-timeout do 
           * ->
              $($element.0).css do 
                * \margin-top, 
                * | label.height! is 0 => 0
                  | label.height! is 20 => 0
                  | _ => label.height!
           * 100