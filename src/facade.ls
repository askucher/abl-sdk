angular
  .module \ablsdk
  .service \ablfacade, (ablbook, ablslot)->
     (activity, callback)->
       book =
          ablbook activity, callback
       slot = 
          ablslot activity, book.calendar
       book: book
       slot: slot