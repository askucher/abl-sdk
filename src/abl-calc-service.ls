angular
  .module \ablsdk
  .service \ablcalc, ($xabl)->
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
          state = 
            attendees: charges.filter(-> it.type is \aap).map(make-editable)
            addons: charges.filter(-> it.type is \addon).map(make-editable)
          total-without-taxesfees = ->
              (state.attendees.map(calc-price) |> sum) + total-addons!
          calc-tax-fee = (charge)->
            | charge.type is \tax => total-without-taxesfees! / 100 * charge.amount
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
          calc-total = ->
              total = total-without-taxesfees! + calc-taxes-fees!
              total - coupon.calc(total)
          
          coupon = 
            codes: []
            calc: (total)->
              | coupon.codes.length is 0 => 0
              | coupon.codes.0.amount-off => coupon.codes.0.amount-off
              | coupon.codes.0.percent-off => total / 100 * coupon.codes.0.percent-off
              | _ => 0 
            remove: (c)->
               index = coupon.codes.index-of c
               if index > -1
                 coupon.codes.splice index, 1
            add: ->
              return if (coupon.code ? "").length is 0
              coupon.error = ""
              apply = (data)->
                coupon.codes.push data
                coupon.code = ""
              $xabl
                .get "coupon/#{coupon.code}"
                .success (data)->
                    apply data
                .error (data)->
                    coupon.error = data?errors?0 ? "Not found"
                    #apply do 
                    #  _id: '6345cfe789abc'
                    #  activity: '123cfe098abc'
                    #  code: 'FALL25OFF'
                    #  duration: 'forever'
                    #  amountOff: 25
                    #  currency: 'CAD'
                    #  percentOff: 25
                    #  maxRedemptions: 25
                    #  redeemBy: 'ISO 8601 Datetime'
                    #apply do 
                    #
                    #  code: coupon.code
                    #  not-found: yes
              
            code: ""
          coupon: coupon
          addons: state.addons
          attendees: state.attendees
          total-without-taxesfees: total-without-taxesfees
          calc-tax-fee: calc-tax-fee
          calc-taxes-fees: calc-taxes-fees
          show-price: show-price
          calc-price: calc-price
          show-addon-price: show-addon-price
          calc-addon-price: calc-addon-price
          total-addons: total-addons
          calc-total: calc-total