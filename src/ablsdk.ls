#  ABLSDK VERSION V2  
#  The goal of this version is to provide perfect interface

#  If you don't agree with something and think that some thing should be improved please contact to a.stegno@gmail.com
#  I can easily change it because it doesn't work in production yet

#
angular
  .module \ablsdk
  .service \ablsdk, (ablslot, ablbook, loader, through, p, observ)->
      observ (notify)->
         state =
            book: null
            slot: null
         user =
            preferences: null
         activity =
             all: []
             load: (config)->
                 through (cb)->
                     loader.activities (scope)->
                        scope.list |> p.each activity.all~push 
                        user.preferences = scope.preferences
                        cb scope
             current: null
             choose: (item)->
                 activity.current = item
                 state.book =
                    ablbook item, (status, data)->
                        notify status, data
                        #if status is \success
                        #   widget.change \success
                        #if status is \slot-chosen and data
                        #   widget.change \pricing
                 state.slot =
                    ablslot item, state.book.calendar
                 state.slot.observe (name)->
                    notify name
         activity: activity
         user: user
         destoy: ->
             activity.all.length = 0
             activity.current = null
             user.preferences = null
             state.slot = null
             state.book = null