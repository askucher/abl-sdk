angular
  .module do
    * \ablsdk
  .factory do
      * \test
      * (debug)->
          (input)->
            debug ->
             test = input!
             if test isnt yes
                debug "[FAILED]", test