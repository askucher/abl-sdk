angular
  .module \ablsdk
  .service do
     * \observ
     * ->
         (func)->
             const observers = []
             const notify = (name, obj)->
                 const notify = (item)->
                    item.1 obj
                 observers
                    .filter (.0 is name)
                    .for-each notify
             const scope = 
                func notify
             scope.on = (name, callback)->
                 observers.push [name, callback]
             scope.off = (callback)->
                const remove = (item)->
                  const index =
                    observers.index-of item
                  observers.splice index, 1
                observers
                  .filter (.1 is callback)
                  .for-each remove
             scope