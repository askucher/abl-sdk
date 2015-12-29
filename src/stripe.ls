angular
  .module(\ablsdk)
  .factory do
    * \stripe
    * ($root-scope, safe-apply)->
        const model = {}
        const init = ->
          model.set-publishable-key = Stripe.set-publishable-key
          const c = Stripe.card
          model.create-token = (card, callback)->
            if !c.validate-card-number(card.number)
              return callback 'Card number is not correct'
            if !c.validate-expiry(card.exp_month, card.exp_year)
              return callback 'Expiration Month/Year is not correct'
            if !c.validateCVC(card.cvc)
              return callback 'CVV is not correct. Your CVV number can be located by looking on your credit or debit card'
            c.create-token do
                * number: card.number
                  cvc: card.cvc
                  exp_month: card.exp_month
                  exp_year: card.exp_year
                  name: card.full-name
                  address_line1: card.location?street_address
                  address_city: card.location?city
                  address_country: card.location?country
                  state: card.location?state
                * (status, resp)->
                    if resp.id?
                       safe-apply ->
                         callback null, resp.id
                    else 
                       safe-apply ->
                         callback resp.error.message
        if typeof window.Stripe is \undefined
           throw 'please add <script src="https://js.stripe.com/v2/"></script>'
        else 
           init!
        model