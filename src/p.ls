angular
  .module(\ablsdk)
  .service do 
      * \p
      * ->
            head: first = (xs) ->
              xs.0
            each: (f, xs) -->
              for x in xs
                f x
              xs
            map: (f, xs) -->
              [f x for x in xs]
            filter: (f, xs) -->
              [x for x in xs when f x]
            find: (f, xs) -->
              for x in xs when f x
                return x
              void
            pairs-to-obj: (object) ->
              {[x.0, x.1] for x in object}
            obj-to-pairs: (object) ->
              [[key, value] for key, value of object]
            values: (object)->
              [value for key, value of object]
            any: (f, xs) -->
              for x in xs when f x
                return yes
              no
            not-any: (f, xs) -->
              for x in xs when f x
                return no
              yes
            sum: (xs) ->
              result = 0
              for x in xs
                result += x
              result
            sort: (xs) ->
              xs.concat!.sort (x, y) ->
                if x > y
                  1
                else if x < y
                  -1
                else
                  0
            sort-with: (f, xs) -->
              xs.concat!.sort f
            sort-by: (f, xs) -->
              xs.concat!.sort (x, y) ->
                if (f x) > (f y)
                  1
                else if (f x) < (f y)
                  -1
                else
                  0
            reverse: (xs) ->
              xs.concat!.reverse!