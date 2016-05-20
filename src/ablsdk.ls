#  ABLSDK VERSION V2  
#  The goal of this version is to provide perfect interface

#  If you don't agree with something and think that some thing should be improved please contact to a.stegno@gmail.com
#  I can easily change it because it doesn't work in production yet

#
angular
  .module \ablsdk
  .service \ablsdk, (ablslot, ablbook, loader, through, p, observ, types)->
      observ (notify)->
         widget =
            book: null
            slot: null
            calc: null
            activities: []
            current-activity: null
            preferences: null
            choose: (item)->
                | item instanceof types.Day => widget.slot.select-day item
                | item instanceof types.Timeslot => widget.slot.choose-slot item
                | item instanceof types.Activity => choose-activity item
                | _ => throw "Type of object is not supported"
            
         choose-activity = (item)->
             widget.current-activity = item
             widget.book =
                ablbook item, (status, data)->
                    notify status, data
             widget.slot =
                ablslot item, widget.book.calendar
             widget.calc = widget.book.calendar.calc
             widget.slot.observe (name)->
                notify name
         widget.load = (config)->
                 through (cb)->
                     loader.activities (scope)->
                        widget.activities.length = 0
                        scope.list |> p.each widget.activities~push 
                        widget.preferences = scope.preferences
            
         widget: widget
         destoy: ->
             widget.activities.length = 0
             