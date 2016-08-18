angular.module \ablsdk
 .filter \price, ($filter) ->
    (amount, config) ->
       view = 
          | typeof! amount is \String => parse-int(amount) / 100
          | typeof! amount is \Number => amount / 100
          | _ => "ERR"
       return view if view is \ERR
       r = 
        | config is '00.00$' => $filter('currency')(view).replace("$",'').trim! + "$"
        | config is "$00" => \$ + Math.round(view)
        | _ => $filter('currency')(view)