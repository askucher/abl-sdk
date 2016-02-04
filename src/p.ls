angular
  .module(\ablsdk)
  .service do 
      * \p
      * -> 
            flatten = (xs) -->
              [].concat.apply [], [(if typeof! x is 'Array' then flatten x else x) for x in xs]
            head: first = (xs) ->
              xs.0
            each: (f, xs) -->
              for x in xs
                f x
              xs
            map: (f, xs) -->
              xs.map(f)
            fold: (f, memo, xs) -->
              for x in xs
                memo = f memo, x
              memo
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
            concat: (xss) ->
               [].concat.apply [], xss
            concat-map: (f, xs) -->
               [].concat.apply [], [f x for x in xs]
            flatten: flatten
            group-by: (f, xs) -->
              results = {}
              for x in xs
                key = f x
                if key of results
                  results[key].push x
                else
                  results[key] = [x]
              results
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
            split: (sep, str) -->
              str.split sep
            join: (sep, xs) -->
              xs.join sep
            lines: (str) ->
              return [] unless str.length
              str.split '\n'
            unlines: (.join '\n')
            words: (str) ->
              return [] unless str.length
              str.split /[ ]+/
            unwords: (.join ' ')
            chars: (.split '')
            unchars: (.join '')
            repeat: (n, str) -->
              result = ''
              for til n
                result += str
              result
            capitalize: (str) ->
              (str.char-at 0).to-upper-case! + str.slice 1
            camelize: (.replace /[-_]+(.)?/g, (, c) -> (c ? '').to-upper-case!)
            dasherize: (str) ->
                str
                  .replace /([^-A-Z])([A-Z]+)/g, (, lower, upper) ->
                     "#{lower}-#{if upper.length > 1 then upper else upper.to-lower-case!}"
                  .replace /^([A-Z]+)/, (, upper) ->
                     if upper.length > 1 then "#upper-" else upper.to-lower-case!