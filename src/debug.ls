angular
  .module do
    * \ablsdk
  .factory do
      * \debug
      * (enabledDebug)->
          (input)->
            if enabledDebug
              switch typeof! input
                case \Function
                  input!
                else
                  console?log?apply console, arguments