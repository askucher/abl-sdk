angular
 .module \ablsdk
 .service \ablslot, (abldate, ablcalc, ablapi, formula, p, debug, $xabl)->
    (activity, input-model)->
       model = input-model ? {}
       transform-charge = (item)->
         _id: item._id
         name: item.name
         quantity: 0
         amount: item.amount
       state =
         slots: []
         model: model
         calendars: []
         active-slots: []
       state.model 
          ..date =
              start: null
              end: null
          ..value= null
          ..event-id= null
          ..charges= []
          ..attendees= []
          ..addons= activity.charges.filter(-> it.type is \addon).map(transform-charge)
          ..questions= activity.questions ? []
          ..bg= activity.image
       get-day = (date)->
          if date?
             res = do
              if date?format?
                date
              else
                moment(date)
             res.format(\YYYYMMDD) |> parse-int
          else null
       new-date = ->
          d = moment.apply(null, arguments).tz(activity.time-zone)
          d
       generate-calendar = (date, callback)->
         d = new-date(date)
         year = d.year!
         month = d.month!
         to-date = (number)->
           new-date([year, month, number])
         last-day = d.endOf(\month).date!
         days = [1 to last-day] |> p.map to-date
         day = new-date(days.0).day!
         dummies = [1 to day] |> p.map (-> null)
         time: d
         days: dummies ++ days
         headers: 
            * \Su
            * \M
            * \Tu
            * \W
            * \Th
            * \F
            * \Sa
       get-month = (date)->
         Math.ceil(get-day(date) / 100)
       hack-date = (input, tz)->
                d = moment(input)~format
                z = tz~format
                moment(d('YYYY-MM-DD HH:mm ') + z(\Z), "YYYY-MM-DD HH:mm Z")
       merge = (date, time) ->
           ndate = date ? hack-date(date, moment!)
           ntime = time ? hack-date(time, moment!)
           moment([ndate.year!, ndate.month!, ndate.date!, ntime.hours!, ntime.minutes!, 0])
       make-available = (slot, arg)-->
           available = 
              slot.available - eval(([0] ++ state.model.calc.attendees.map(-> it.quantity)).join('+'))
           available
       perform-choose-slot = (slot)->
           return if slot.available is 0
           day = state.model.value
           merged = merge(day, slot.start-time)
           state.model.date.start = merged
           transform = abldate activity.time-zone
           state.model.date.origin =
                transform.backendify(state.model.date.start).replace(/[\:-]/ig,'')
           state.model.date.end = slot.end-time
           state.model.charges = slot.charges
           state.model.calc = ablcalc(slot.charges ++ activity.charges)
           state.model._id = slot._id
           state.model.event-id = activity.timeslots.filter(-> it._id is slot._id).0.event-id
           attendees = state.model.attendees
           make-attendee = (timeslot)->
               q = attendees.filter(-> it.name is timeslot.name)
               quantity:
                   | q.length > 0 => q.0.quantity
                   | timeslot.name is \Adult => 1
                   | _ => 0
               name: timeslot.name
               amount: timeslot.amount
           state.model.attendees = slot.charges.filter(-> it.type is \aap).map(make-attendee)
           state.model.available = make-available slot
       actual-event = (day, event)-->
            get-day(event.start-time) is get-day(day) 
       is-empty = (day)->  
           actual = actual-event day
           state.slots |> p.filter (is-fit-to-slot day)
                       |> (.length is 0)       
       slots-by-day = (day)->
           actual = actual-event day
           transform-slot = (slot)->
               start = merge(day, slot.start-time)
               duration = slot.end-time - slot.start-time
               events = slot.events.filter(actual).map(-> it.available)
               
               available =
                  events.0 ? slot.max-occ
               start-time: start
               time: start.value-of!
               end-time: start.clone!.add(duration, \milliseconds)
               charges: slot.charges
               price: formula.get-visual-price(timeslots: [slot])
               available: available
               _id: slot._id
               duration: 
                 moment.duration(duration).format("M[M] d[d] h[h] m[m]").replace(/((^| )0[a-z])|[ ]/ig, '')
               taken: slot.max-occ - available
           state.slots |> p.filter (is-fit-to-slot day)
                       |> p.map transform-slot
                       |> p.sort-by (.time)
       select = (day)->
           state.model.value = day
           state.active-slots.length = 0
           slots-by-day(day).for-each (slot)->
               state.active-slots.push slot
           #activity-widget.title(\timeslots)
       is-fit-to-slot = (date, slot) -->
          single = slot.days-running.length is 0
          a = activity
          out-of-activity-interval =
              | get-day(slot.start-time) isnt get-day(date) and  single => yes
              | get-day(slot.start-time)   >  get-day(date) and !single => yes
              | get-day(slot.until-time)   <  get-day(date) and !single => yes
              | _ => no
          day = (date)->
              d = date?day?!
              _ =
                | d is null => null
                | d is 0 => 6
                | _ => d - 1
          out-of-week =
              !single and (slot.days-running |> p.not-any (-> it is day(date)))
          check =
              | out-of-week => no
              | out-of-activity-interval => no
              | _ => yes
          check
       is-not-fit-to-any-slot = (date)->
          | slots-by-day(date) |> p.not-any(-> it.available > 0)  => yes
          | state.slots |> p.not-any (is-fit-to-slot date) => yes
          | _ => no
       in-past = (date)->
           get-day(date) < get-day(new-date!) or date.diff(new-date!, \hours) < 24
       create-month = (date)->
         new-date([date.year!, date.month!, 15])  
       start-month =
         create-month new-date!
       set-calendars = (f, s, callback)->
          state.calendars.length = 0
          state.calendars.push f
          state.calendars.push s
          load-events callback
       scroll =
         active-date: ->
             scroll.active-date = ->
             start = state.calendars.0
             up = (step)->
               generate-calendar start.time.clone!.add(step, \month)
             get = (step)->
               if step is 0 then start
               else up step
             is-active = (step)->
               typeof get(step).days.find(-> !is-disabled-day(it)) isnt \undefined
             scroll-to = (i)->
               [1 to i].for-each calendar~down
             active = [0 to 6].find(is-active)
             scroll-to(active) if active > 0
       next-month = (d, x) ->
         date.clone!.add(x, \months)
       calendar = 
           first: start-month
           second: start-month.clone!.add(1, \months)
           move: (direction)->
               calendar.first = calendar.first.clone!.add(direction, \month)
               calendar.second = calendar.second.clone!.add(direction, \month)
               set-calendars do
                 * generate-calendar calendar.first
                 * generate-calendar calendar.second
           down: ->
             calendar.move 1
           up: ->
             calendar.move -1
       load-events = (callback)->
         ablapi
           .timeslots do
               start-time: state.calendars.0.time
               end-time: state.calendars.1.time
               activity-id: activity._id
           .success (loaded-slots)->
                 transform = abldate activity.time-zone
                 comp = transform.frontendify >> moment
                 transform-date = (slot)->
                     slot.start-time = comp slot.start-time
                     slot.end-time = comp slot.end-time
                     slot.until-time = comp slot.until-time
                     slot
                 state.slots =
                     loaded-slots.timeslots.map(transform-date)
                 scroll.active-date!
                 callback?!
       is-dummy = (date)->
           | date is null => yes
           | _ => no
       is-disabled-day = (date)->
           | is-dummy(date) => yes
           | is-empty(date) => yes
           | in-past(date) => yes
           | is-not-fit-to-any-slot(date) => yes
           | _ => no
       select-day = (day)->
           return if is-disabled-day(day)
           select day
           state.slots.0 |> perform-choose-slot
       not-selected = ->
           | state.model.date.start is null => yes
           | state.model.chosen is no => yes
           | _ => no
       disabled-slot = (slot)->
           | slot.available is 0 => "This event is full"
           | _ => "" 
       not-available-slot = (slot)->
           slot.available <= 0
       close = (chosen)->
           set-default = (attendee)->
                    if attendee.quantity is 0 and attendee.name is \Adult
                        attendee.quantity = 1
           state.model
             ..attendees.for-each set-default
             ..chosen = chosen
             ..visible = no
           state.model.closed? chosen
       choose-slot = (slot)->
           return if not-available-slot(slot)
           perform-choose-slot slot
           close yes
       is-active-day = (date)->
           get-day(date) is get-day(state.model.value)
       is-disabled-month = (date)->
           | get-day(date) < get-day(new-date!) => yes
           | _ => no
       is-active-month = (date)->
           get-month(date) is get-month(state.model.value)
       is-calendar-up-disabled = ->
           get-month(state.calendars.0.time) < get-month(new-date!)
       calendar-up = ->
           return if is-calendar-up-disabled!
           calendar.up!
       calendar-down = ->
           calendar.down!
       setup = ->
         set-calendars do
             * generate-calendar start-month.clone!
             * generate-calendar start-month.clone!.add(1, \month)
             * ->
                 select-day state.model.value
       
       move = (booking-id)->
         $xabl
           .put do
              * "bookings/move/#{booking-id}"
              * event-instance-id: create-event-instance-id!
       create-event-instance-id = ->
         transform = abldate activity.time-zone
         state.model.event-id + \_ + transform.backendify(state.model.date.start).replace(/[\:-]/ig,'')
     
       
       state
         ..move = move
         ..setup = setup
         ..create-event-instance-id = create-event-instance-id
         ..start-month = start-month
         ..set-calendars = set-calendars
         ..select-day = select-day
         ..generate-calendar = generate-calendar
         ..calendar-up = calendar-up
         ..calendar-down = calendar-down
         ..close = close
         ..is-active-month = is-active-month
         ..is-disabled-day = is-disabled-day
         ..is-disabled-month = is-disabled-month
         ..is-calendar-up-disabled = is-calendar-up-disabled
         ..is-dummy = is-dummy
         ..is-active-day = is-active-day
         ..not-selected = not-selected
         ..choose-slot = choose-slot
         ..not-available-slot = not-available-slot
         ..disabled-slot = disabled-slot
       setup!
       state  
        