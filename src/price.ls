angular.module \ablsdk
 .filter \price, ($filter) ->
    (amount, config) ->
       view = amount / 100
       r = 
        | config is 'right' => $filter('currency')(view).replace("$",'').trim! + " $"
        | config is 0 or config is "0" => \$ + Math.round(view)
        | _ => $filter('currency')(view)