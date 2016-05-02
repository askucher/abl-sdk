angular
  .module do
    * \ablsdk
  .factory do
      * \debug
      * (enabledDebug, $window)->
          (input)->
            if enabled-debug
              match = input.match('<<[a-z]+>>')
              if match and $window.catch is match.0.replace('<<','').replace('>>','')
                 debugger
              else
                switch typeof! input
                  case \Function
                    input!
                  else
                    console?log?apply console, arguments