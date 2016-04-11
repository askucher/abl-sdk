angular.module \ablsdk
 .filter \price, ($filter) ->
    (amount, config) ->
       view = amount / 100
       r = 
        | config is '00.00 $' => $filter('currency')(view).replace("$",'').trim! + " $"
        | config is "$ 00" => \$ + Math.round(view)
        | _ => $filter('currency')(view)