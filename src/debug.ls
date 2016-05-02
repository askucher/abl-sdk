angular
  .module do
    * \ablsdk
  .factory do
      * \debug
      * (enabledDebug, $window)->
          (input)->
            if enabled-debug
              mtch = | typeof! input?match is \Function => input.match('<<[a-z]+>>')
                     | _ => null
              if mtch and $window.catch is mtch.0.replace('<<','').replace('>>','')
                 debugger
              else
                switch typeof! input
                  case \Function
                    input!
                  else
                    console?log?apply console, arguments