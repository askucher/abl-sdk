angular
  .module do
    * \ablsdk
  .factory do
      * \debug
      * (enabledDebug, $window)->
          (input)->
            if enabled-debug
              mtch = input.match('<<[a-z]+>>')
              if mtch and $window.catch is mtch.0.replace('<<','').replace('>>','')
                 debugger
              else
                switch typeof! input
                  case \Function
                    input!
                  else
                    console?log?apply console, arguments