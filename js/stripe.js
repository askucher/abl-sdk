angular.module('ablsdk').factory('stripe', function($rootScope, safeApply){
  var model, init;
  model = {};
  init = function(){
    var c;
    model.setPublishableKey = Stripe.setPublishableKey;
    c = Stripe.card;
    return model.createToken = function(card, callback){
      var ref$, ref1$, ref2$, ref3$;
      if (!c.validateCardNumber(card.number)) {
        return callback('Card number is not correct');
      }
      if (!c.validateExpiry(card.exp_month, card.exp_year)) {
        return callback('Expiration Month/Year is not correct');
      }
      if (!c.validateCVC(card.cvc)) {
        return callback('CVV is not correct. Your CVV number can be located by looking on your credit or debit card');
      }
      return c.createToken({
        number: card.number,
        cvc: card.cvc,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        name: card.fullName,
        address_line1: (ref$ = card.location) != null ? ref$.street_address : void 8,
        address_city: (ref1$ = card.location) != null ? ref1$.city : void 8,
        address_country: (ref2$ = card.location) != null ? ref2$.country : void 8,
        address_state: (ref3$ = card.location) != null ? ref3$.state : void 8
      }, function(status, resp){
        if (resp.id != null) {
          return safeApply(function(){
            return callback(null, resp.id);
          });
        } else {
          return safeApply(function(){
            return callback(resp.error.message);
          });
        }
      });
    };
  };
  if (typeof window.Stripe === 'undefined') {
    throw 'please add <script src="https://js.stripe.com/v2/"></script>';
  } else {
    init();
  }
  return model;
});