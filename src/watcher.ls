angular
 .module \ablsdk
 .service do
   * \watcher
   * ($root-scope, browser, debug)->
        ugly = ->
            unwatch: (array, func)->
                func.unwatch?!
            watch: (array, func)->
                $scope = $root-scope.$new!
                $scope.array = array
                func.unwatch = 
                   $scope.$watch \array, func, yes
        standard = ->
            unwatch: (array, func)->
                Array.unobserve array, func
            watch: (array, callback)->
                 create-watch = ->
                     n =
                        $root-scope.$new!
                     (array, func)->
                         n.array = array
                         n.$watch \array, func
                 watch = Array.observe ? create-watch!
                 watch array, callback
        r =
          | browser.name is \firefox => ugly!
          | browser.name is \unknown => ugly!
          | browser.name is \safari => ugly!
          | _ => ugly!
        r