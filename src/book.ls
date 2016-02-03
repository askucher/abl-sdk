angular
  .module \ablsdk
  .service \ablbook, ($xabl, p, stripe, debug, prefill, ablcalc)->
      (activity, global-callback)->
            state =
               tried-checkout: no
               typing: ''
               braintree-client: null
               loading: no
               idenpotency-key: null
               form:
                  error: ""
                  agreed: no
                  email: ''
                  name: ''
                  phone: ''
                  address: ''
                  location: {}
                  notes: ''
                  date:
                    start: null
                    end: null
                  credit-card:
                    card: ''
                    exp-date: ''
                    cvv: ''
               calendar:
                 value: null
                 visible: no
                 current-activity: activity
                 closed: (chosen)->
                   state.form.date.start = state.calendar.date.start
                   state.form.date.end = state.calendar.date.end
                   global-callback \slot-chosen, chosen
            get-day = (date)->
              if date?
                 res = do
                  if date?format?
                    date
                  else
                    moment(date)
                 res.format(\YYYYMMDD) |> parse-int
              else null
            investigate-date = (bag)->
              _ =
                | bag.start is null => \none
                | get-day(bag.start) isnt get-day(bag.end) => \different
                | _ => \same
            #different-days = (bag)->
            #  get-day(bag.start) isnt get-day(bag.end)
            valid = (form)->
              !state.loading and form.$valid
            issue = (form)->
              for field of fields
                if fields.has-own-property field
                  text =
                    message form, field
                  if text.length > 0
                     return text
              "Please check the form"
            error = (message)->
              state.form.error = message
            close-error = ->
              error ""
            typing = (name)->
              state.tried-checkout = no
              state.typing-input = name
            reset-idenpotency-key = ->
               state.idenpotency-key = do
                  s = ->
                    Math.floor((1 + Math.random!) * 0x10000).toString(16).substring(1)
                  s! + s! + \- + s! + \- + s! + \- + s! + \- + s! + s! + s!
            reset-idenpotency-key!
            few = (arr)->
              arr?filter?(-> it.quantity > 0) ? []
            #more-then-one = ->
            #  few(state.calendar.attendees).length > 0
            #nobody = ->
            #  state.calendar.attendees.filter(-> it.quantity > 0).length is 0
            sum = (arr)->
                | typeof arr is \undefined => 0
                | typeof arr is null => 0
                | arr.length is 0 => 0
                | _ => arr.reduce((x, y)-> x + y)
            disabled-order = ->
               sum(state.calendar.calc.attendees.map(-> it.quantity)) is 0
            cardify = (val, val2)->
              const newval =
                  | val.length is 4 => val + " "
                  | val.length is 9 => val + " "
                  | val.length is 14 => val + " "
                  | val.length is 19 => val + " "
                  | _ => val
              newval + val2
            exp-date-changed = ->
               value = event.target.value
               e = value?replace(\/,'') ? ""
               t = ->
                 it ? ""
               state.form.credit-card.exp-date =
                 | e.length is 0 => e.0 + e.1 + \/
                 | e.length > 2 => e.0 + e.1 + \/ + t(e.2) + t(e.3)
                 | _ => e
            get-event-instance-id = ->
              event-id = activity.timeslots.filter(-> it._id is state.calendar._id).0.event-id
              event-id + \_ + state.calendar.date.origin
            card-changed = (event)->
              value = event.target.value
              return if typeof value is \undefined
              state.form.credit-card.card =
                 value |> (.split(' ').join(''))
                       |> p.fold cardify, ""
                       |> (-> it.substr(0, 19))
            stripe-process = (key, callback)->
               if typeof key is \undefined
                 state.loading = no
                 return error "Stripe key is not defined"
               stripe.set-publishable-key key
               cc = state.form.credit-card
               exp-date =
                    cc.exp-date.split(\/)
               f = state.form
               req =
                 number: cc.card
                 cvc: cc.cvv
                 exp_month: exp-date.0
                 exp_year: "20#{exp-date.1}"
                 full-name: f.name
                 location: f.location
                 state: f.state
               stripe
                   .create-token do
                      * req
                      * (err, token)->
                          if err?
                            state.loading = no
                            return error err
                          a = activity
                          
                          
                          
                          req =
                            stripe-token: token
                            coupon-id: if state.calendar.calc.coupon.codes.length > 0 
                                    then state.calendar.calc.coupon.codes.0.coupon-id
                                    else undefined
                            payment-method: \credit
                            event-instance-id: get-event-instance-id!
                            addons: state.calendar.calc.addons |> p.map ((a)-> [a._id, a.quantity])
                                                               |> p.pairs-to-obj
                            attendees:  state.calendar.calc.attendees |> p.map ((a)-> [a.name, a.quantity])
                                                                      |> p.pairs-to-obj
                            answers: state.calendar.questions |> p.map ((a)-> [a._id, a.answer])
                                                              |> p.pairs-to-obj
                            adjustments: state.calendar.calc.adjustment.list
                            full-name: f.name
                            email: f.email
                            phone-number: f.phone
                            notes: f.notes
                            location: f.location
                            currency: \usd
                            _custom-headers:
                              "Idempotency-Key" : state.idenpotency-key
                          $xabl
                            .post do
                              * \bookings
                              * req
                            .success (data)->
                              if data.booking-id?
                                 reset-idenpotency-key!
                                 callback data
                              else
                                 error data.error
                            .error (e)->
                                 error(e.errors?0 ? "Server error")
                            .finally ->
                               state.loading = no
            payment-setup = ->
              $xabl
                  .get \payments/setup
            validate = (form)->
              return if state.loading is yes
              if !valid(form)
                 error issue(form)
            checkout = (form)->
              return if state.loading is yes
              state.tried-checkout = yes
              if valid(form)
                state.loading = yes
                payment-setup!
                  .success (data)->
                      stripe-process data.public-key, (booking)->
                        state.booking = booking
                        global-callback \success, booking
                  .error (err)->
                      state.loading = no
                      error err
                      global-callback \error, error
              else
                error issue(form)
            agree = ->
              state.form.agreed = !state.form.agreed
              try-checkout!
            is-error = (v) ->
              v.required or v.pattern or v.minlength or v.maxlength or v.phone
            show-error = (name, v) ->
              | v.required => fields[name]?message?required ? "#name is required"
              | v.pattern => "Please follow the example #{fields[name].example}"
              | v.minlength => "#name is too short"
              | v.maxlength => "#name is too long"
              | v.phone => "#name is not valid phone number"
              | _ => "please check #name"
            fields =
              email:
                  pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
                  example: 'nickname@email.com'
                  placeholder: 'Email'
              name:
                  pattern: ''
                  example: 'Your name'
                  placeholder: 'Name'
              phone:
                  pattern: /^[0-9]{3}[-][0-9]{3}[-][0-9]{3,5}$/i
                  placeholder: "Phone +1 123-456-1234"
                  example: "+1 123-456-1234"
              address:
                  pattern: ''
                  example: 'Address'
                  placeholder: 'Home address'
              notes:
                  pattern: ''
                  example: "Notes"
                  placeholder: "Notes"
              card:
                  pattern: /[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}/i
                  example: '0000 0000 0000 0000'
                  placeholder: "Card Number (0000 0000 0000 0000)"
              exp-date:
                  pattern: /[0-9]{2}\/[0-9]{2}/i
                  example: "05/15"
                  placeholder: 'Exp Date (MM/DD)'
              start-date: {}
              cvv:
                  pattern: /[0-9]{3,4}/i
                  example: "000"
                  placeholder: "CVV"
              agreed: 
                  pattern: \true
                  message: 
                    required: "Please accept the terms and conditions"
            try-checkout = ->
              if state.form.agreed 
                state.tried-checkout = yes
            message = (form, name)->
              if state.tried-checkout is yes
                for field of fields
                  if fields.has-own-property field
                    val = form[field]?$error
                    
                    if val and is-error(val)
                      if field is name
                        return show-error field, val
                      return ""
                ""
              else
                for field of fields
                  if fields.has-own-property(field)
                    val = form[field]?$error
                    if val and is-error(val) and val.maxlength
                      if field is name
                        return show-error field, val
                      return ""
                if state.typing-input is name
                  #show example during typing
                  if form[name]?$error?pattern? and fields[name].example?length > 0
                    return "example: " + fields[name].example
            placeholder = (name)->
                if state.typing-input is name
                then fields[name].example
                else fields[name].placeholder
            prefill ->
              f = state.form
              f.email = "test@debug.com"
              f.name = "Test User"
              f.phone = "+380665243646"
              f.address = "664 Cypress Lane, Campbell, CA, United States"
              #f.location =
              #  city: "London"
              #  coordinates: [-0.12775829999998223, 51.5073509]
              #  country: "United Kingdom"
              #  street_address: "London, UK"
              f.notes = "Some test notes"
              c = state.form.credit-card
              c.card = "5105 1051 0510 5100"
              c.exp-date = "05/17"
              c.cvv = "333"
              state.form.agreed = yes
            state
              ..investigate-date = investigate-date
              ..get-event-instance-id = get-event-instance-id
              ..placeholder = placeholder
              ..close-error = close-error
              ..checkout = checkout
              ..validate = validate
              ..agree = agree
              ..fields = fields
              ..few = few
              ..exp-date-changed = exp-date-changed
              ..card-changed = card-changed
              ..disabled-order = disabled-order
              ..typing = typing
              ..message = message
              #..nobody = nobody
              #..different-days = different-days
              #..more-then-one = more-then-one
            state