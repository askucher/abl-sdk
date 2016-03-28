angular
  .module \ablsdk
  .directive \event, (p)->
      restrict: \A
      scope: 
        event: \&
      link: ($scope, element, $attrs)->
        $element = $ element
        setup = (event-name)->
          $element[event-name] (event)->
            $scope.event do
                event: event
        [\blur, \focus, \keyup] |> p.each setup