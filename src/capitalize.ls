angular.module \ablsdk
 .filter \capitalize ->
    (input) ->
       if (angular.isString(input) && input.length > 0) then input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() else input
 .filter \capitalizeAll ->
    (input) ->
       if (angular.isString(input) && input.length > 0) then input.split(' ').map(-> it.charAt(0).toUpperCase() + it.substr(1).toLowerCase()).join(' ') else input