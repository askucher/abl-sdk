angular
  .module \ablsdk
  .service \ablcalc, ($http)->
      sum = (arr)->
        | typeof arr is \undefined => 0
        | typeof arr is null => 0
        | arr.length is 0 => 0
        | _ => arr.reduce((x, y)-> x + y)
      (charges)->
          make-editable = (charge)-> 
            name: charge.name
            quantity: charge.count ? 0
            amount: charge.amount
            _id: charge._id
          by-price = (a, b)->
              b.amount - a.amount
          state = 
            attendees: charges.filter(-> it.type is \aap).map(make-editable).sort(by-price)
            addons: charges.filter(-> it.type is \addon).map(make-editable)
          calc-subtotal = ->
              (state.attendees.map(calc-price) |> sum) + total-addons!
          calc-tax-fee = (charge)->
            | charge.type is \tax => calc-subtotal! / 100 * charge.amount
            | charge.type is \fee => (state.attendees.map(-> it.quantity) |> sum) * charge.amount
            | _ => 0
          calc-taxes-fees = ->
              charges.map(calc-tax-fee) |> sum
          show-price = (attendee)->
              (charges.filter(-> it.type is \aap and it.name is attendee.name)?0?amount ? 0)
          calc-price = (attendee)->
              show-price(attendee) * attendee.quantity
          show-addon-price = (addon)->
              state.addons.filter(-> it.name is addon.name).map(-> it.amount) |> sum
          calc-addon-price = (addon)->
              show-addon-price(addon) * addon.quantity
          total-addons = ->
              state.addons.map(calc-addon-price) |> sum
          calc-coupon = ->
              subtotal = calc-subtotal!
              amount-off = ->
                  | coupon.codes.0.amount-off < subtotal => coupon.codes.0.amount-off
                  | _ => subtotal
              
              _ =
                | coupon.codes.length is 0 => 0
                | coupon.codes.0.amount-off? => amount-off!
                | coupon.codes.0.percent-off? => subtotal / 100 * coupon.codes.0.percent-off
                | _ => 0
              _
          calc-total = ->
              calc-subtotal! + calc-taxes-fees! - calc-coupon!
          coupon = 
            codes: []
            calc: calc-coupon
            remove: (c)->
               index = coupon.codes.index-of c
               if index > -1
                 coupon.codes.splice index, 1
            add: (activity)->
              return if (coupon.code ? "").length is 0
              coupon.error = ""
              apply = (data)->
                if moment!.diff(moment(data.redeem-by), \minutes)
                   coupon.error = "This coupon is expired"
                if data.activities.length > 0 and data.activities.0 isnt activity
                   coupon.error = "This coupon is not valid for this activity."
                else
                   coupon.codes.push data
                   coupon.code = ""
              $http
                .get "api/v1/coupon/#{coupon.code}"
                .success (data)->
                    apply data
                .error (data)->
                    coupon.error = data?errors?0 ? "Coupon not found"
                    
              
            code: ""
          coupon: coupon
          addons: state.addons
          attendees: state.attendees
          total-without-taxesfees: calc-subtotal
          calc-coupon: calc-coupon
          calc-tax-fee: calc-tax-fee
          calc-taxes-fees: calc-taxes-fees
          show-price: show-price
          calc-price: calc-price
          show-addon-price: show-addon-price
          calc-addon-price: calc-addon-price
          total-addons: total-addons
          calc-subtotal: calc-subtotal
          calc-total: calc-total