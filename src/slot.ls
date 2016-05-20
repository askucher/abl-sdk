angular
 .module \ablsdk
 .service \ablslot, (abldate, ablcalc, ablapi, formula, p, debug, $xabl, $root-scope, types)->
    (activity, input-model)->
       transform-charge = (item)->
         _id: item._id
         name: item.name
         quantity: 0
         amount: item.amount
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
          d = moment.apply(null, arguments)
          d
       generate-calendar = (date, callback)->
         d = new-date(date)
         year = d.year!
         month = d.month!
         to-date = (number)->
           new-date(moment.tz([year, month, number], activity.time-zone))
         last-day = d.endOf(\month).date!
         #debug \generate-calendar, date, new-date(date).format(), last-day, to-date(0).format(), to-date(1).format()
         days = [1 to last-day] |> p.map to-date |> p.map types.cast (.Day)
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
           correct = (val)->
               | val is null => no 
               | typeof val is \undefined => no
               | typeof! val is \Number => yes
               | typeof! val is \String and val.length is 0 => no
               | typeof! val is \String and val.match('^[0-9]+$')?0?length is val.length => yes
               | _ => no
           quantities = 
               model.calc.attendees |> p.map (.quantity) 
                                    |> p.filter correct
           available = 
              if \inactive is slot.status
              then 0
              else slot.available - eval(([0] ++ quantities).join('+'))
           available
       define-date-start = (day, slot)->
           merged = merge(day, slot.start-time)
           model.date.start = merged
       perform-choose-slot = (slot)->
           debug \perform-choose-slot, slot
           if !slot?
             throw "Slot is undefined"
           if !slot.available?
             throw "Slot doesn't have required 'available' field"
           return if slot.available is 0
           day = model.value
           
           define-date-start day, slot
           transform = abldate activity.time-zone
           
           model.date.origin =
                transform.backendify(model.date.start).replace(/[\:-]/ig,'')
           model.date.end = slot.end-time
           model.title = slot.title ? activity.title
           model.charges = slot.charges
           model.calc = ablcalc(slot.charges ++ activity.charges)
           if !slot._id?
             throw "Slot doesn't have required field '_id'"
           model._id = slot._id
           
           timeslot =
             activity.timeslots |> p.find (._id is slot._id) 
           if !timeslot?
             throw "Slot has not been found by id #{slot._id} in [#{activity.timeslots.map(-> it._id).join(',')}]"
           if !timeslot?event-id?
             throw "Event id field has not been found in timeslot #{JSON.stringify(timeslot)}"
           model.event-id = timeslot.event-id
           attendees = model.attendees
           make-attendee = (timeslot)->
               q = attendees.filter(-> it.name is timeslot.name)
               quantity:
                   | q.length > 0 => q.0.quantity
                   | timeslot.name is \Adult => 1
                   | _ => 0
               name: timeslot.name
               amount: timeslot.amount
           model.attendees = slot.charges.filter(-> it.type is \aap).map(make-attendee)
           model.available = make-available slot
       actual-event = (day, event)-->
            get-day(event.start-time) is get-day(day) 
       is-empty = (day)->  
           #actual = actual-event day
           slots |> p.filter (is-fit-to-slot day)
                 |> (.length is 0)       
       #slot = ->
       #abbit = new slot
       #alert( abbit instanceof slot )
       #class Timeslot
       
       transform-slot = (day)->
             actual = actual-event day
             (slot)->
               start = merge(day, slot.start-time)
               duration = slot.end-time - slot.start-time
               event = slot.events |> p.find(actual)
               available =
                  event?available ? slot.max-occ
               native-slot: slot
               status:  event?status
               start-time: start
               time: start.value-of!
               end-time: start.clone!.add(duration, \milliseconds)
               charges: slot.charges
               price: formula.get-visual-price(timeslots: [slot])
               available: if event?status is \inactive then 0 else available
               title: event?title
               _id: slot._id
               duration:
                 moment.duration(duration).format("M[M] d[d] h[h] m[m]").replace(/((^| )0[a-z])|[ ]/ig, '')
               taken: slot.max-occ - available
       
       slots-by-day-without-filters = (day)->
           slots |> p.filter (is-fit-to-slot-full yes, day)
                 |> p.map transform-slot day
                 |> p.map types.cast (.Timeslot)
                 |> p.sort-by (.time)
       slots-by-day = (day)->
           slots |> p.filter (is-fit-to-slot day)
                 |> p.map transform-slot day
                 |> p.map types.cast (.Timeslot)
                 |> p.sort-by (.time)
       select = (day)->
           model.value = day
           
           active-slots.length = 0
           possible-slots.length = 0
           slots-by-day-without-filters(day).for-each (slot)->
               possible-slots.push slot
           slots-by-day(day).for-each (slot)->
               active-slots.push slot
           pref = 
             $root-scope.user?preferences?widget?display?timeslot ? {}
           if pref.duration + pref.price + pref.availability + pref.startTime is 0 and active-slots.length > 0
              choose-slot active-slots.0
              
             
           
       is-fit-to-slot-full = (include-past, date, slot) -->
          single = slot.days-running.length is 0
          a = activity
          out-of-activity-interval =
              | single => get-day(slot.start-time) isnt get-day(date) #allow when single event match to current day
              | get-day(slot.until-time) < get-day(date) => yes #block when multi-event is finished
              | get-day(slot.start-time) > get-day(date) => yes #return if current day between slot's start-time and end-time (2 rule)
              | _ => no
          
         
          
          today = merge(date, slot.start-time)
          
          in-past = today.diff(new-date!, \minutes) - cutoff
            
          
          
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
              | include-past is no and in-past <= 0 => no 
              | _ => yes
          check
       is-fit-to-slot = is-fit-to-slot-full no
       is-not-fit-to-any-slot = (date)->
          | slots-by-day(date) |> p.not-any(-> it.available > 0)  => yes
          | slots |> p.not-any (is-fit-to-slot date) => yes
          | _ => no
       cutoff = 
           | $root-scope.user?preferences?widget?display?event?isSiteWide is yes =>  $root-scope.user.preferences.widget.display.event.cutoff
           | (activity.cutoff ? -1) > -1 => activity.cutoff
           | _=> 48 * 60
       in-past = (date, flags)->
           if flags? and flags.index-of('include_nearest') > -1
             get-day(date) < get-day(new-date!) 
           else
             get-day(date) < get-day(new-date!)
       
       create-month = (date)->
         new-date([date.year!, date.month!, 15])  
       start-month =
         create-month new-date!
       set-calendars = (f, s, callback)->
          calendars.length = 0
          calendars.push f
          calendars.push s
          load-events callback
       scroll =
         active-date: ->
             scroll.active-date = ->
             start = calendars.0
             up = (step)->
               generate-calendar start.time.clone!.add(step, \month)
             get = (step)->
               if step is 0 then start
               else up step
             is-active = (step)->
               typeof (get(step).days |> p.find(-> !is-disabled-day(it))) isnt \undefined
             scroll-to = (i)->
               [1 to i].for-each calendar~down
             active = [0 to 6] |> p.find(is-active)
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
       find-chosen-event = ->
           return if (state.chosen-event ? "").length is 0
           return if slots.length is 0
           pairs = state.chosen-event.split(\_)
           id = pairs.0
           date-transform = abldate activity.time-zone
           day = moment(date-transform.frontendify(moment(pairs.1, \YYYYMMDDHHmmssZ).to-date!))
           slot =
             slots |> p.find (.event-id is id)
           if slot? 
              if not is-disabled-day(day)
                  select-day day
                  debug do
                       active-slots: active-slots
                       possible-slots: possible-slots
                       current-slot: slot._id
                  slot = active-slots |> p.find (._id is slot._id)
                  if slot?
                    slot |> choose-slot
                  else 
                    observer.notify \event-not-found
              else 
                visual-slot = 
                   slots-by-day(day) |> p.find (._id is slot._id)
                if !slot?
                   observer.notify \event-not-found
                if not-available-slot(visual-slot)
                   observer.notify \event-sold-out
                else if in-past(day)
                   observer.notify \event-too-close
                else
                   observer.notify \event-not-found
           else 
              observer.notify \event-not-found  
       load-events = (callback)->
         ablapi
           .timeslots do
               start-time: calendars.0.time
               end-time: calendars.1.time
               activity-id: activity._id
           .success (loaded-slots)->
                 transform = abldate activity.time-zone
                 comp = transform.frontendify >> moment
                 transform-date = (slot)->
                     slot.start-time = comp slot.start-time
                     slot.end-time = comp slot.end-time
                     slot.until-time = comp slot.until-time
                     slot
                 slots.length = 0
                 loaded-slots.list.map(transform-date).for-each (item)->
                     slots.push item
                 find-chosen-event!
                 scroll.active-date!
                 callback?!
       is-dummy = (date)->
           | date is null => yes
           | _ => no
       is-disabled-day = (date, flags)->
           | is-dummy(date) => yes
           | is-empty(date) => yes
           | in-past(date, flags) => yes
           | is-not-fit-to-any-slot(date) => yes
           | _ => no
       select-day-anyway = (day)->
           select day
           define-date-start day, slots.0
           #slots.0 |> perform-choose-slot
       select-day = (day)->
           return if is-disabled-day(day)
           select-day-anyway day
       not-selected = ->
           | model.date.start is null => yes
           | model.chosen is no => yes
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
           model.attendees.for-each set-default
           model.chosen = chosen
           model.visible = no
           model.closed? chosen
       choose-slot = (slot)->
           return if not-available-slot(slot)
           perform-choose-slot slot
           close yes
       choose-slot-anyway = (slot)->
           perform-choose-slot slot
           close yes
       is-active-day = (date)->
           get-day(date) is get-day(model.value)
       is-disabled-month = (date)->
           | get-day(date) < get-day(new-date!) => yes
           | _ => no
       is-active-month = (date)->
           get-month(date) is get-month(model.value)
       is-calendar-up-disabled = ->
           get-month(calendars.0.time) < get-month(new-date!)
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
                 select-day model.value
       
       move = (booking-id)->
         $xabl
           .put do
              * "bookings/#{booking-id}/move"
              * event-instance-id: create-event-instance-id!
       event-instance-id = (model)->
         transform = abldate activity.time-zone  
         model.event-id + \_ + transform.backendify(model.date.start).replace(/[\:-]/ig,'')
       create-event-instance-id = ->
         event-instance-id(model)
       model = input-model ? {}
       slots = []
       calendars = []
       active-slots = []
       possible-slots = []
       model 
          ..date =
              start: null
              end: null
          ..value= null
          ..event-id= null
          .._id = null
          ..charges= []
          ..attendees= []
          ..addons= activity.charges.filter(-> it.type is \addon).map(transform-charge)
          ..questions= activity.questions ? []
          ..bg= activity.image
       setup!
       state = 
           chosen-event: null
       observer = 
            list: []
            observe: (func)->
              observer.list.push func
            notify: (name, data)->
              observer.list |> p.each (watch)->
                watch name, data
       observe: observer.observe
       choose-event:  (id)->
          state.chosen-event = id
          find-chosen-event!
       model: model
       active-slots: active-slots
       possible-slots: possible-slots
       move: move
       select-day: select-day
       select-day-anyway: select-day-anyway
       calendars: calendars
       create-event-instance-id: create-event-instance-id
       calendar-up: calendar-up
       calendar-down: calendar-down
       close: close
       is-active-month: is-active-month
       is-disabled-day: is-disabled-day
       is-disabled-month: is-disabled-month
       is-calendar-up-disabled: is-calendar-up-disabled
       is-dummy: is-dummy
       is-active-day: is-active-day
       not-selected: not-selected
       choose-slot: choose-slot
       choose-slot-anyway: choose-slot-anyway
       not-available-slot: not-available-slot
       disabled-slot: disabled-slot
        
