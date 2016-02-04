angular.module \ablsdk
 .filter \price, ($filter) ->
    (amount) ->
       $filter('currency')(amount / 100)