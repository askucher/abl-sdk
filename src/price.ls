angular.module \ablsdk
 .filter \price, ($filter) ->
    (amount, config) ->
       view = amount / 100
       | config is 0 => \$ + Math.round(view)
       | _ => $filter('currency')(view)