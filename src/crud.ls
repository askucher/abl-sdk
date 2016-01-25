angular
  .module \ablsdk
  .service \crud, ($xabl, $root-scope, debug, $md-dialog, safe-apply, watcher, p)->
     (url, init-options)->
        parsed-url = url.split(\@)
        url = parsed-url.0
        state =
          loading: no
          frontendify: (data, url)->
              parts = url.split(\/)
              part = parts[parts.length - 1]
              array = 
                  | typeof! data is \Array => data
                  | typeof! data[part] is \Array => data[part]
                  | typeof! data is \Object => [data]
                  | _ => []
        factory =
           local-storage:
             remove: (item)->
             add: (item)->
             update: (item)->
             fetch: (item)->
           memory:
             remove: (item)->
               remove-from-memory item
             add: (item, callback)->
               Array.prototype.push.call i, item
               callback? item
             update: (item, callback)->
               callback? item
             fetch: ->
               state.loading = no
           backend: 
              remove: (item)->
                $xabl
                  .delete "#{url}/#{item._id}"
                  .success ->
                     remove-from-memory item
              update: (item, callback)->
                $xabl
                   .update do
                      * "#{url}/#{item._id}"
                      * item
                   .success (data)->
                      state.loading = no
                      callback? data
              add: (item, callback)->
                 $xabl
                   .create do
                      * url
                      * item
                   .success (data)->
                      debug \backend-success, data
                      success data
                      callback? data
              
              fetch: ->
                  debug do
                     * \fetch
                     * configure-url url
                     * i.options
                  options = 
                    angular.copy(i.options)
                  delete options.$url
                  $xabl
                   .get do 
                     * configure-url url
                     * params: options 
                   .success (data, status, headers)->
                     i.length = 0
                     params = (name)->
                        header = headers![name]
                        if header?
                           parser = document.createElement \a
                           parser.href = headers![name]
                           try 
                             return JSON.parse('{"' + decodeURI(parser.search.substr(1, 2000)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
                           catch err
                             console.error err, parser.search
                             return undefined
                        else 
                           undefined
                     i.options.total = do
                        r = params(\x-last-page-url)
                        if r?
                          parse-int(r.page) * parse-int(r.page-size)
                        else 
                          data.length
                     i.options.page-size = do 
                        r = params(\x-first-page-url)
                        if r?
                          parse-int(r.page-size)
                        else 
                          data.length
                     state.loading = no
                     success data
        provider = factory[parsed-url.1 ? \backend]
        configure-url = (url)->
          state =
              url: url
          replace = (pair)->
             state.url = state.url.replace( (':' + pair.0), pair.1) 
          u = i.get-options!.$url
          if u?
             u |> p.obj-to-pairs |> p.each replace
          state.url
        $scope = $root-scope.$new!
        $scope.items = []
        i = $scope.items
        state.loading = no
        remove-from-memory = (item)->
          index = i.index-of item
          if index > -1
              Array.prototype.splice.call i, index, 1
        save = (item, callback)->
            if item._id? 
            then
              update item, callback
            else
              add item, callback
        update = (item, callback)->
         return if state.loading   
         provider.update item, callback
        add = (item, callback)->
         return if state.loading
         provider.add item, callback
        success = (data)->
          result = 
            state.frontendify data, url
          type = 
              typeof! result
          switch type
             case \Array
               Array.prototype.push.apply i, result
             case \Object
               extend-object = (pair)->
                   i[pair.0] = pair.1
               result |> p.obj-to-pairs |> p.each extend-object
          state.loading = no
        i.options = {}
        i.converter = (converter)->
            state.frontendify = converter.frontendify
            state.backendify = converter.backendify
            i
        i.get-options = -> 
          i.options
        fetch = (options)->
          
          return if state.loading
          switch typeof! options
            case \Function 
                i.get-options = options
                return fetch {}
            case \Number
                i.options.page = options
            case \Object
                i.options = angular.extend({}, i.get-options!, options)
          state.loading = yes
          if i.options.page?
            if i.options.page is 1
               delete i.options.page
            else 
               i.options.page -= 1
          provider.fetch!
        fetch init-options
        splice = ->
           return if state.loading
           removed = Array.prototype.splice.apply i, arguments
           removed.for-each provider.remove
        remove = (item, $event, options)->
          return if state.loading
          default-options = 
            title: "Confirm Delete"
            content: "Are you sure you want to delete this item?"
            ok: "Confirm"
            cancel: "Cancel"
          $md-dialog
              .show do
                 $md-dialog.confirm!
                    .title(options?title ? default-options.title)
                    .content(options?content ? default-options.content)
                    .ok(options?ok ? default-options.ok)
                    .cancel(options?cancel ? default-options.cancel)
                    .targetEvent($event)
              .then do 
                  * -> provider.remove(item)
                  * ->
        watchers = []
        improve = (source)->
          observers = []
          bind = (name, func) -->
              bound = []
              improve bound
              mutate = ->
                mutated =
                    Array.prototype[name].call(source, func)
                bound.length = 0
                Array.prototype.push.apply bound, mutated
              observers.push mutate
              
              mutate!
              bound
          source.loading = ->
              state.loading
          source.to-array = ->
              a = []
              Array.prototype.push.apply a, source
              a
          source.fetch-on = (array, $scope)->
              $scope.$watch do 
                  * array
                  * i~fetch
                  * yes
              source
          source.watch = (array, $scope)->
              func = ->
                      safe-apply ->
                         observers.for-each(-> it!)
              if $scope?
                  watchers.push do
                      array: $scope[array]
                      func: func
                  $scope.$watch array, func, yes
              else 
                  watchers.push do
                      array: array
                      func: func
                  watcher.watch array, func
              source
          source.watch source
          [\map, \filter].for-each (item)->
            source[item] = bind(item)
          source.push = add
          source.save = save
          source.fetch = fetch
          source.remove = remove
          source.splice = splice
          source.to-array = ->
              angular.copy source
        i.listen = ($scope)->
          $scope.$on \$destroy, ->
              for item in watchers
                watcher.unwatch item.array, item.func
          i
        improve i
        i