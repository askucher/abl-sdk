angular
  .module \ablsdk
  .directive \event, (p, safe-apply)->
      restrict: \A
      scope: 
        event: \&
      link: ($scope, element, $attrs)->
        $element = $ element
        setup = (event-name)->
          $element[event-name] (event)->
            apply = ->
              $scope.event do
                event: event
            safe-apply apply, $scope
        [\blur, \focus, \keyup] |> p.each setup