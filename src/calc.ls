angular
  .module \ablsdk
  .service \ablcalc, ($xabl, $timeout, p, debug, test, typecheck)->
      
      
      sum = (arr)->
        | typeof arr is \undefined => 0
        | typeof arr is null => 0
        | _ => arr |> p.sum
      (input-new-charges, input-prevous-charges, paid)->
            
          
          prevous-charges = input-prevous-charges ? []
          new-charges = input-new-charges?filter(-> it.status is \active) ? []
          
          #debug -> 
          #  options =
          #    custom-types:
          #      CHARGE:
          #        type-of: '{_id: String, amount: Number, created: String, name: String, percentage: Boolean, status: String, type: String}'
          #        validate: -> yes
          #  typecheck '[CHARGE]', prevous-charges, options
          #  typecheck '[CHARGE]', new-charges, options
          debug do
             prevous-charges: prevous-charges
             new-charges: new-charges
             input-new-charges: input-new-charges
             input-prevous-charges: input-prevous-charges
             
             
          
            
          
          make-new-charge = (charge)->
            name: charge.name
            quantity: 0
            amount: charge.amount
            _id: charge._id #for widget
          by-price = (a, b)->
            b.amount - a.amount
          make-old-charge = (arr)->
            #debug \make-old, arr
            name: arr.0.name
            amount: arr.0.amount
            quantity: arr.length
            _ids: arr |> p.map (._id)
          old-amounts = (type)->
            prevous-charges |> p.filter (.type is type)
                            |> p.group-by (-> it.name + it.amount)
                            |> p.obj-to-pairs 
                            |> p.map (.1)
                            |> p.map make-old-charge
                            |> p.sort-with by-price
          exclude = (type, charge)-->
            old =
              old-amounts(type) |> p.find (-> charge.name is it.name and charge.amount is it.amount)
            if old?
             old.old = yes
            !old?
          available-amounts = (type)->
            new-charges  |> p.filter (.type is type)
                         |> p.map make-new-charge
                         |> p.filter exclude type
                         |> p.sort-with by-price
          get-amounts = (type)->
             [old-amounts, available-amounts] |> p.map (-> it type) |> p.concat
          test ->
             get-amounts(\aap).length > 0
            
          test ->
            top =
               get-amounts(\app) |> p.head
            return yes if !top
            return no  if !top.amount? or !top.quantity? or !top.name?
          
          
          
          state =
            attendees: get-amounts \aap
            addons: get-amounts \addon
          total-adjustment = ->
             adjustment.list |> p.map (.amount) |> p.sum
          calc-subtotal = ->
              (state.attendees.map(calc-price) |> sum) + total-adjustment! + total-addons!
          calc-tax-fee = (charge)->
            | charge.type is \tax => calc-subtotal! / 100 * charge.amount
            | charge.type is \fee => (state.attendees.map(-> it.quantity) |> sum) * charge.amount
            | _ => 0
          calc-taxes-fees = ->
              new-charges.map(calc-tax-fee) |> sum
          show-price = (attendee)->
              (new-charges.filter(-> it.type is \aap and it.name is attendee.name)?0?amount ? 0)
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
          warning = (charge, name)->
              removed =
                charge.status is \inactive
              type = charge.type
              changed = charge.old
              name = 
                | type is \aap => "pricing level"
                | type is \addon => "add-on"
              res = 
                | removed and name is \removed => "Warning: This #name no longer exists. You can only reduce the quantity at this #name. If you wish to offer another #name at this price, please create on Adjustment to currect the price."
                | changed and name is \changed => "Warning: This #name has changed since the booking was created. You can only reduce the quantity at this #name. If you wish to offer the old #name, please create an Adjustment."
                | (removed or changed) and name is \mutated => yes
                | _ => ""
              res
          calc-total = ->
              calc-subtotal! + calc-taxes-fees! - calc-coupon!
          calc-previous-total = ->
              prevous-charges |> p.map (.amount)
                              |> p.sum
          deposit = (paid ? []) |> p.map (.amount)
                                |> p.sum
          calc-balance-due = ->
              -(calc-total! - deposit)
          adjustment = 
            list: prevous-charges |> p.filter(-> it.type is \adjustment)
            add: (item)->
              new-item = angular.copy item
              new-item.amount *= 100
              adjustment.list.push new-item
            removable: (item)->
              !item._id?
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
          warning: warning
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
