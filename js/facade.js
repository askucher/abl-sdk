angular.module('ablsdk').service('ablfacade', function(ablbook, ablslot){
  return function(activity, callback){
    var book, slot;
    book = ablbook(activity, callback);
    slot = ablslot(activity, book.calendar);
    return {
      book: book,
      slot: slot
    };
  };
});