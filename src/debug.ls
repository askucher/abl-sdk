angular
  .module do
    * \ablsdk
  .factory do
      * \debug
      * (enabledDebug)->
          (input)->
            if enabled-debug
              switch typeof! input
                case \Function
                  input!
                else
                  console?log?apply console, arguments