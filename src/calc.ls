angular
  .module \ablsdk
  .service \ablcalc, ($xabl, $timeout)->
      sum = (arr)->
        | typeof arr is \undefined => 0
        | typeof arr is null => 0
        | arr.length is 0 => 0
        | _ => arr.reduce((x, y)-> x + y)
      (input-charges)->
          charges = input-charges?filter(-> it.status is \active)
          make-editable = (charge)->
            name: charge.name
            quantity: charge.count ? 0
            amount: charge.amount
            _id: charge._id
          by-price = (a, b)->
              b.amount - a.amount
          state =
            attendees: charges?filter(-> it.type is \aap).map(make-editable).sort(by-price)
            addons: charges?filter(-> it.type is \addon).map(make-editable)
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
          calc-previous-total = ->
              calc-total!
          calc-balance-due = ->
              64
          adjustment = 
            list: []
            add: (item)->
              adjustment.list.push item
            remove: (item)->
              index = adjustment.list.index-of(item)
              adjustment.list.splice index, 1
          coupon =
            codes: []
            calc: calc-coupon
            remove: (c)->
              index = coupon.codes.index-of c
              if index > -1
                 coupon.codes.splice index, 1
            add: (activity)->
              return if (coupon.code ? "").length is 0
              coupon.code = coupon.code.to-upper-case!
              coupon.error = 
                 | coupon.code.length is 0 => "Code is required"
                 | coupon.code.length < 6 => "6 chars are required"
                 | _ => ""
              return if coupon.error.length > 0
              apply = (data)->
                success = ->
                  coupon.codes.push data
                  coupon.code = ""
                  coupon.success = "Coupon #{data.couponId} added successfully"
                  $timeout do 
                     * ->
                         delete coupon.success
                     * 3000
                  ""
                coupon.error =
                  | data.max-redemptions isnt 0 and data.max-redemptions <= data.redemptions => "This coupon has been fully redeemed."
                  | moment!.diff(moment(data.redeem-by), \minutes) > 0 => "This coupon is expired"
                  | data.activities.length > 0 and data.activities.0 isnt activity => "This coupon is not valid for this activity."
                  | _ => success!

              $xabl
                .get "coupon/#{coupon.code}"
                .success (data)->
                    apply data
                .error (data)->
                    coupon.error = data?errors?0 ? "Coupon not found"
            code: ""
          coupon: coupon
          adjustment: adjustment
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
          calc-previous-total: calc-previous-total
          calc-balance-due: calc-balance-due
