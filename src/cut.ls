angular.module(\ablsdk).filter do
    * \cut
    * ->
        (value, trim)->
          | typeof value is \undefined => value
          | value is null => value
          | value.length - 3 > trim => value.substr(0, trim) + \...
          | _ => value