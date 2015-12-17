angular
  .module \ablsdk
  .service \crud, ($xabl, $root-scope, debug, $md-dialog, safe-apply, watcher)->
     (url, init-options)->
        parsed-url = url.split(\@)
        url = parsed-url.0
        state =
          loading: no
          
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
                  $xabl
                   .get do 
                     * configure-url url
                     * i.options 
                   .success (data, status, headers)->
                     i.length = 0
                     params = (name)->
                        header = headers![name]
                        if header?
                           parser = document.createElement \a
                           parser.href = headers![name]
                           JSON.parse('{"' + decodeURI(parser.search.substr(1, 2000)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
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
          for name of i.url-options
             url = url.replace(':' + name, i.url-options[name])
          url
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
          array = 
              | typeof! data is \Array => data
              | typeof! data[url] is \Array => data[url]
              | typeof! data is \Object => [data]
              | _ => []
          Array.prototype.push.apply i, array
          state.loading = no
        i.options = {}
        i.url-options = {}
        fetch = (options)->
          debug \fetch, state.loading
          return if state.loading
          switch typeof options
            case \Number
                i.options.page = options
            case \Object
                i.url-options = $.extend({}, options.$url? {}, i.options.url-options)
                delete options.$url
                i.options = $.extend({}, options, i.options)
                i.page = 1
          state.loading = yes
          provider.fetch!
        fetch init-options
        splice = ->
           return if state.loading
           removed = Array.prototype.splice.apply i, arguments
           removed.for-each provider.remove
        remove = (item, $event, options)->
          return if state.loading
          default-options = 
            title: "Deletion"
            content: "Are you that you want to delete this item?"
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