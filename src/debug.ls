angular
  .module do
    * \ablsdk
  .factory do
      * \debug
      * (enabled-debug)->
          (input)->
            if enabled-debug
              mtch = | typeof! input?match is \Function => input.match(/<<[a-z]+>>/i)
                     | _ => null
              if mtch and window.catch is mtch.0.replace('<<','').replace('>>','')
                 debugger
              else
                switch typeof! input
                  case \Function
                    input!
                  else
                    console?log?apply console, arguments