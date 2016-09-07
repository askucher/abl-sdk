angular
  .module do
    * \ablsdk
  .factory do
      * \debug
      * (enabled-debug, $window)->
          if enabled-debug
            $window._trackJs = { token: 'ABL_SDK' }
            $.get-script do 
              * \//adventurebucketlist.flyber.net/cdn/track.js
              * ( data, textStatus, jqxhr )-> 
                   console?log "loaded js tracker"
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