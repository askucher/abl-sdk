angular
  .module do
    * \ablsdk
  .factory do
      * \debug
      * (enabled-debug, $window)->
          if enabled-debug
            $window._trackJs = { token: 'ABL_SDK' }
            $.get-script do 
              * \https://rawgit.com/askucher/7e5b657d5b95b0126f768eb63880087d/raw/d86ba927cbc0614921a9e687957c01d45bc02b79/track.js
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