var toString$ = {}.toString;
angular.module('ablsdk').service('ablslot', function(abldate, ablcalc, ablapi, formula, p, debug, $xabl, $rootScope, types){
  return function(activity, inputModel, options){
    var transformCharge, getDay, newDate, generateCalendar, getMonth, hackDate, merge, makeAvailable, defineDateStart, performChooseSlot, actualEvent, isEmpty, transformSlot, slotsByDayWithoutFilters, slotsByDay, skipSlots, select, isFitToSlotFull, isFitToSlot, isNotFitToAnySlot, cutoff, inPast, isTooClose, createMonth, startMonth, _eventDate, _pairs, _dateTransform, _month, setCalendars, scroll, nextMonth, calendar, statusSlot, findChosenEvent, loadEvents, isDummy, isDisabledDay, selectDayAnyway, selectDay, notSelected, disabledSlot, notAvailableSlot, close, chooseSlot, chooseSlotAnyway, isActiveDay, isDisabledMonth, isActiveMonth, isCalendarUpDisabled, setMonth, calendarUp, calendarDown, setup, move, eventInstanceId, createEventInstanceId, model, slots, calendars, activeSlots, possibleSlots, x$, ref$, state, observer, dayHasBookableSlot;
    debug(function(){
      if (activity == null) {
        return console.warn("Activity is Not Defined for Ablslot ");
      }
    });
    transformCharge = function(item){
      return {
        _id: item._id,
        name: item.name,
        quantity: 0,
        amount: item.amount
      };
    };
    getDay = function(date){
      var res;
      if (date != null) {
        res = (date != null ? date.format : void 8) != null
          ? date
          : moment(date);
        return parseInt(
        res.format('YYYYMMDD'));
      } else {
        return null;
      }
    };
    newDate = function(){
      var d;
      d = moment.apply(null, arguments);
      return d;
    };
    generateCalendar = function(date, callback){
      var d, year, month, toDate, lastDay, days, day, dummies, this$ = this;
      d = newDate(date);
      year = d.year();
      month = d.month();
      toDate = function(number){
        return newDate(moment.tz([year, month, number], activity.timeZone));
      };
      lastDay = d.endOf('month').date();
      days = p.map(types.cast(function(it){
        return it.Day;
      }))(
      p.map(toDate)(
      (function(){
        var i$, to$, results$ = [];
        for (i$ = 1, to$ = lastDay; i$ <= to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }())));
      day = newDate(days[0]).day();
      dummies = p.map(function(){
        return null;
      })(
      (function(){
        var i$, to$, results$ = [];
        for (i$ = 1, to$ = day; i$ <= to$; ++i$) {
          results$.push(i$);
        }
        return results$;
      }()));
      return {
        time: d,
        days: dummies.concat(days),
        headers: ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa']
      };
    };
    getMonth = function(date){
      return Math.ceil(getDay(date) / 100);
    };
    hackDate = function(input, tz){
      var d, z;
      d = bind$(moment(input), 'format');
      z = bind$(tz, 'format');
      return moment(d('YYYY-MM-DD HH:mm ') + z('Z'), "YYYY-MM-DD HH:mm Z");
    };
    merge = function(date, time){
      var ndate, ntime;
      ndate = date != null
        ? date
        : hackDate(date, moment());
      ntime = time != null
        ? time
        : hackDate(time, moment());
      return moment([ndate.year(), ndate.month(), ndate.date(), ntime.hours(), ntime.minutes(), 0]);
    };
    makeAvailable = curry$(function(slot, arg){
      var correct, quantities, available, this$ = this;
      correct = function(val){
        var ref$, ref1$;
        switch (false) {
        case val !== null:
          return false;
        case typeof val !== 'undefined':
          return false;
        case toString$.call(val).slice(8, -1) !== 'Number':
          return true;
        case !(toString$.call(val).slice(8, -1) === 'String' && val.length === 0):
          return false;
        case !(toString$.call(val).slice(8, -1) === 'String' && ((ref$ = val.match('^[0-9]+$')) != null ? (ref1$ = ref$[0]) != null ? ref1$.length : void 8 : void 8) === val.length):
          return true;
        default:
          return false;
        }
      };
      quantities = p.filter(correct)(
      p.map(function(it){
        return it.quantity;
      })(
      model.calc.attendees));
      available = 'inactive' === slot.status
        ? 0
        : slot.available - eval(([0].concat(quantities)).join('+'));
      return available;
    });
    defineDateStart = function(day, slot){
      var merged;
      merged = merge(day, slot.startTime);
      return model.date.start = merged;
    };
    performChooseSlot = function(slot){
      var day, transform, ref$, timeslot, attendees, makeAttendee, this$ = this;
      debug('perform-choose-slot', slot);
      if (slot == null) {
        throw "Slot is undefined";
      }
      if (slot.available == null) {
        throw "Slot doesn't have required 'available' field";
      }
      day = model.value;
      defineDateStart(day, slot);
      transform = abldate(activity.timeZone);
      model.date.origin = transform.backendify(model.date.start).replace(/[\:-]/ig, '');
      model.date.end = slot.endTime;
      model.title = (ref$ = slot.title) != null
        ? ref$
        : activity.title;
      model.charges = slot.charges;
      model.calc = ablcalc(slot.charges.concat(activity.charges));
      if (slot._id == null) {
        throw "Slot doesn't have required field '_id'";
      }
      model._id = slot._id;
      debug("slots", slots);
      timeslot = p.find(function(it){
        return it._id === slot._id;
      })(
      slots);
      if (timeslot == null) {
        throw "Slot has not been found by id " + slot._id + " in [" + activity.timeslots.map(function(it){
          return it._id;
        }).join(',') + "]";
      }
      if ((timeslot != null ? timeslot.eventId : void 8) == null) {
        throw "Event id field has not been found in timeslot " + JSON.stringify(timeslot);
      }
      model.eventId = timeslot.eventId;
      attendees = model.attendees;
      makeAttendee = function(timeslot){
        var q;
        q = attendees.filter(function(it){
          return it.name === timeslot.name;
        });
        return {
          quantity: (function(){
            switch (false) {
            case !(q.length > 0):
              return q[0].quantity;
            case timeslot.name !== 'Adult':
              return 1;
            default:
              return 0;
            }
          }()),
          name: timeslot.name,
          amount: timeslot.amount
        };
      };
      model.attendees = slot.charges.filter(function(it){
        return it.type === 'aap';
      }).map(makeAttendee);
      return model.available = makeAvailable(slot);
    };
    actualEvent = curry$(function(day, event){
      return getDay(event.startTime) === getDay(day);
    });
    isEmpty = function(day){
      var this$ = this;
      return function(it){
        return it.length === 0;
      }(
      p.filter(isFitToSlot(day))(
      slots));
    };
    transformSlot = function(day){
      var actual;
      actual = actualEvent(day);
      return function(slot){
        var start, duration, event, maxOcc, title, available, ref$;
        start = merge(day, slot.startTime);
        duration = slot.endTime - slot.startTime;
        event = p.find(actual)(
        slot.events);
        maxOcc = null;
        title = event != null ? event.title : void 8;
        if (slot.events.length > 0 && event) {
          angular.forEach(slot.events, function(v, k){
            if (moment(v.startTime).format('YYYYMMDDHHmmss') === moment(start).format('YYYYMMDDHHmmss')) {
              maxOcc = v.maxOcc;
              title = v.title;
            }
          });
          if (maxOcc === null) {
            if (event) {
              maxOcc = event.maxOcc;
            } else {
              maxOcc = slot.maxOcc;
            }
          }
        } else {
          maxOcc = slot.maxOcc;
        }
        available = (ref$ = event != null ? event.available : void 8) != null
          ? ref$
          : maxOcc - (event ? event.attendees : 0);
        return {
          nativeSlot: slot,
          status: (ref$ = event != null ? event.status : void 8) != null
            ? ref$
            : slot.status,
          startTime: start,
          time: start.valueOf(),
          endTime: start.clone().add(duration, 'milliseconds'),
          charges: slot.charges,
          price: formula.getVisualPrice({
            timeslots: [slot]
          }),
          available: (event != null ? event.status : void 8) === 'inactive' ? 0 : available,
          title: title,
          _id: slot._id,
          duration: moment.duration(duration).format("M[M] d[d] h[h] m[m]").replace(/((^| )0[a-z])|[ ]/ig, ''),
          taken: maxOcc - available
        };
      };
    };
    slotsByDayWithoutFilters = function(day){
      var this$ = this;
      return p.sortBy(function(it){
        return it.time;
      })(
      p.map(types.cast(function(it){
        return it.Timeslot;
      }))(
      p.map(transformSlot(day))(
      p.filter(isFitToSlotFull(true, day))(
      slots))));
    };
    slotsByDay = function(day){
      var this$ = this;
      return p.sortBy(function(it){
        return it.time;
      })(
      p.map(types.cast(function(it){
        return it.Timeslot;
      }))(
      p.map(transformSlot(day))(
      p.filter(isFitToSlot(day))(
      slots))));
    };
    skipSlots = function(){
      var pref, ref$, ref1$, ref2$, ref3$, ref4$;
      pref = (ref$ = (ref1$ = $rootScope.user) != null ? (ref2$ = ref1$.preferences) != null ? (ref3$ = ref2$.widget) != null ? (ref4$ = ref3$.display) != null ? ref4$.timeslot : void 8 : void 8 : void 8 : void 8) != null
        ? ref$
        : {};
      return pref.availability + pref.startTime === 0 && activeSlots.length > 0;
    };
    select = function(day){
      model.value = day;
      activeSlots.length = 0;
      possibleSlots.length = 0;
      slotsByDayWithoutFilters(day).forEach(function(slot){
        return possibleSlots.push(slot);
      });
      slotsByDay(day).forEach(function(slot){
        if (slot.status === 'active') {
          return activeSlots.push(slot);
        }
      });
      if (skipSlots()) {
        return chooseSlot(activeSlots[0]);
      }
    };
    isFitToSlotFull = curry$(function(includePast, date, slot){
      var single, a, outOfActivityInterval, today, inPast, day, outOfWeek, check;
      single = slot.daysRunning.length === 0;
      a = activity;
      outOfActivityInterval = (function(){
        switch (false) {
        case !single:
          return getDay(slot.startTime) !== getDay(date);
        case !(getDay(slot.untilTime) < getDay(date)):
          return true;
        case !(getDay(slot.startTime) > getDay(date)):
          return true;
        default:
          return false;
        }
      }());
      today = merge(date, slot.startTime);
      inPast = today.diff(newDate(), 'minutes') - cutoff;
      day = function(date){
        var d, _;
        d = date != null ? typeof date.day == 'function' ? date.day() : void 8 : void 8;
        return _ = (function(){
          switch (false) {
          case d !== null:
            return null;
          case d !== 0:
            return 6;
          default:
            return d - 1;
          }
        }());
      };
      outOfWeek = !single && p.notAny(function(it){
        return it === day(date);
      })(
      slot.daysRunning);
      check = (function(){
        switch (false) {
        case !outOfWeek:
          return false;
        case !outOfActivityInterval:
          return false;
        case !(includePast === false && inPast <= 0):
          return false;
        default:
          return true;
        }
      }());
      return check;
    });
    isFitToSlot = isFitToSlotFull(false);
    isNotFitToAnySlot = function(date){
      switch (false) {
      case !p.notAny(function(it){
        return it.available > 0;
      })(
      slotsByDay(date)):
        return true;
      case !p.notAny(isFitToSlot(date))(
        slots):
        return true;
      default:
        return false;
      }
    };
    cutoff = (function(){
      var ref$, ref1$, ref2$, ref3$, ref4$, ref5$;
      switch (false) {
      case ((ref$ = $rootScope.user) != null ? (ref1$ = ref$.preferences) != null ? (ref2$ = ref1$.widget) != null ? (ref3$ = ref2$.display) != null ? (ref4$ = ref3$.event) != null ? ref4$.isSiteWide : void 8 : void 8 : void 8 : void 8 : void 8) !== true:
        return $rootScope.user.preferences.widget.display.event.cutoff;
      case !(((ref5$ = activity.cutoff) != null
          ? ref5$
          : -1) > -1):
        return activity.cutoff;
      default:
        return 48 * 60;
      }
    }());
    inPast = function(date, flags){
      if (flags != null && flags.indexOf('include_nearest') > -1) {
        return getDay(date) < getDay(newDate());
      } else {
        return getDay(date) < getDay(newDate());
      }
    };
    isTooClose = function(date){
      return date.isBefore(moment().add(cutoff, 'minute'));
    };
    createMonth = function(date){
      return newDate([date.year(), date.month(), 15]);
    };
    if (location.search.indexOf('event=') === -1) {
      startMonth = createMonth(newDate());
    } else {
      _eventDate = location.search.substr(location.search.indexOf('event=')).split('=');
      _pairs = _eventDate[1].split('_');
      _dateTransform = abldate(activity.timeZone);
      _month = moment(_dateTransform.frontendify(moment(_pairs[1], 'YYYYMMDDHHmmssZ').toDate()));
      startMonth = _month;
    }
    setCalendars = function(f, s, callback){
      calendars.length = 0;
      calendars.push(f);
      calendars.push(s);
      return loadEvents(callback);
    };
    scroll = {
      activeDate: function(){
        var start, up, get, isActive, scrollTo, active;
        scroll.activeDate = function(){};
        start = calendars[0];
        up = function(step){
          return generateCalendar(start.time.clone().add(step, 'month'));
        };
        get = function(step){
          if (step === 0) {
            return start;
          } else {
            return up(step);
          }
        };
        isActive = function(step){
          var func;
          func = (function(){
            switch (false) {
            case (options != null ? options.activeDayStrategy : void 8) !== 'dayHasBookableSlot':
              return dayHasBookableSlot;
            default:
              return isDisabledDay;
            }
          }());
          return typeof p.find(function(it){
            return !func(it);
          })(
          get(step).days) !== 'undefined';
        };
        scrollTo = function(i){
          return (function(){
            var i$, to$, results$ = [];
            for (i$ = 1, to$ = i; i$ <= to$; ++i$) {
              results$.push(i$);
            }
            return results$;
          }()).forEach(bind$(calendar, 'down'));
        };
        active = p.find(isActive)(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
        if (active > 0) {
          return scrollTo(active);
        }
      }
    };
    nextMonth = function(d, x){
      return date.clone().add(x, 'months');
    };
    calendar = {
      first: startMonth,
      second: startMonth.clone().add(1, 'months'),
      move: function(direction){
        calendar.first = calendar.first.clone().add(direction, 'month');
        calendar.second = calendar.second.clone().add(direction, 'month');
        return setCalendars(generateCalendar(calendar.first), generateCalendar(calendar.second));
      },
      down: function(){
        return calendar.move(1);
      },
      up: function(){
        return calendar.move(-1);
      }
    };
    statusSlot = null;
    findChosenEvent = function(){
      var ref$, pairs, id, dateTransform, day, slot, visualSlot, this$ = this;
      debug('find-chosen-event');
      if (((ref$ = state.chosenEvent) != null ? ref$ : "").length === 0) {
        return;
      }
      if (slots.length === 0) {
        return;
      }
      pairs = state.chosenEvent.split('_');
      id = pairs[0];
      dateTransform = abldate(activity.timeZone);
      day = moment(dateTransform.frontendify(moment(pairs[1], 'YYYYMMDDHHmmssZ').toDate()));
      slot = p.find(function(it){
        return it.eventId === id;
      })(
      slots);
      if (slot != null) {
        if (inPast(day)) {
          statusSlot = 'not-found';
          return observer.notify('event-not-found');
        }
        if (isTooClose(day)) {
          statusSlot = 'too-close';
          return observer.notify('event-too-close');
        }
        if (!isDisabledDay(day)) {
          selectDay(day);
          slot = p.find(function(it){
            return it._id === slot._id;
          })(
          activeSlots);
          debug('slot', slot);
          if (slot != null) {
            debug('choose-slot', slot);
            if (notAvailableSlot(slot)) {
              debug('not-available', slot);
              return observer.notify('event-sold-out');
            } else {
              debug('available', slot);
              return chooseSlot(
              slot);
            }
          } else {
            debug('event-not-found');
            return observer.notify('event-not-found');
          }
        } else {
          visualSlot = p.find(function(it){
            return it._id === slot._id;
          })(
          slotsByDay(day));
          if (slot == null) {
            return observer.notify('event-not-found');
          }
          if (notAvailableSlot(visualSlot)) {
            statusSlot = 'sold-out';
            return observer.notify('event-sold-out');
          } else {
            return observer.notify('event-not-found');
          }
        }
      } else {
        return observer.notify('event-not-found');
      }
    };
    loadEvents = function(callback){
      slots.length = 0;
      return ablapi.timeslots({
        startTime: calendars[0].time,
        endTime: calendars[1].time,
        activityId: activity._id
      }).success(function(loadedSlots){
        var transform, comp, transformDate;
        transform = abldate(activity.timeZone);
        comp = compose$(transform.frontendify, moment);
        transformDate = function(slot){
          slot.startTime = comp(slot.startTime);
          slot.endTime = comp(slot.endTime);
          slot.untilTime = comp(slot.untilTime);
          return slot;
        };
        slots.length = 0;
        if (loadedSlots.length === 0) {
          debug('event-not-found');
          observer.notify('event-not-found');
        } else {
          loadedSlots.list.map(transformDate).forEach(function(item){
            debug('add-slot');
            return slots.push(item);
          });
        }
        if (statusSlot !== 'sold-out') {
          findChosenEvent();
        }
        scroll.activeDate();
        observer.notify('load-slot-list-complete');
        return typeof callback == 'function' ? callback() : void 8;
      }).error(function(){
        return observer.notify('event-not-found');
      });
    };
    isDummy = function(date){
      switch (false) {
      case date !== null:
        return true;
      default:
        return false;
      }
    };
    isDisabledDay = function(date, flags){
      switch (false) {
      case !isDummy(date):
        return true;
      case !isEmpty(date):
        return true;
      case !inPast(date, flags):
        return true;
      case !isNotFitToAnySlot(date):
        return true;
      default:
        return false;
      }
    };
    selectDayAnyway = function(day){
      select(day);
      return defineDateStart(day, slots[0]);
    };
    selectDay = function(day){
      if (isDisabledDay(day)) {
        return;
      }
      return selectDayAnyway(day);
    };
    notSelected = function(){
      switch (false) {
      case model.date.start !== null:
        return true;
      case model.chosen !== false:
        return true;
      default:
        return false;
      }
    };
    disabledSlot = function(slot){
      switch (false) {
      case slot != null:
        return "Event Not Found";
      case slot.available !== 0:
        return "This event is full";
      default:
        return "";
      }
    };
    notAvailableSlot = function(slot){
      return slot == null || slot.available <= 0;
    };
    close = function(chosen){
      var setDefault;
      setDefault = function(attendee){
        if (attendee.quantity === 0 && attendee.name === 'Adult') {
          return attendee.quantity = 1;
        }
      };
      model.attendees.forEach(setDefault);
      model.chosen = chosen;
      model.visible = false;
      return typeof model.closed == 'function' ? model.closed(chosen) : void 8;
    };
    chooseSlot = function(slot){
      if (notAvailableSlot(slot)) {
        return;
      }
      performChooseSlot(slot);
      return close(true);
    };
    chooseSlotAnyway = function(slot){
      performChooseSlot(slot);
      return close(true);
    };
    isActiveDay = function(date){
      return getDay(date) === getDay(model.value);
    };
    isDisabledMonth = function(date){
      switch (false) {
      case !(getDay(date) < getDay(newDate())):
        return true;
      default:
        return false;
      }
    };
    isActiveMonth = function(date){
      return getMonth(date) === getMonth(model.value);
    };
    isCalendarUpDisabled = function(){
      return getMonth(calendars[0].time) < getMonth(newDate());
    };
    setMonth = function(date, max){
      var iter, current, desired;
      iter = max != null ? max : 99;
      iter = iter - 1;
      if (iter < 0) {
        return;
      }
      current = getMonth(calendars[0].time);
      desired = getMonth(date);
      debug('set-month', current, desired);
      if (current > desired) {
        calendar.up();
        return setMonth(date, iter);
      } else if (current < desired) {
        calendar.down();
        return setMonth(date, iter);
      }
    };
    calendarUp = function(){
      if (isCalendarUpDisabled()) {
        return;
      }
      return calendar.up();
    };
    calendarDown = function(){
      return calendar.down();
    };
    setup = function(){
      return setCalendars(generateCalendar(startMonth.clone()), generateCalendar(startMonth.clone().add(1, 'month')), function(){
        return selectDay(model.value);
      });
    };
    move = function(bookingId){
      return $xabl.put("bookings/" + bookingId + "/move", {
        eventInstanceId: createEventInstanceId()
      });
    };
    eventInstanceId = function(model){
      var transform;
      transform = abldate(activity.timeZone);
      return model.eventId + '_' + transform.backendify(model.date.start).replace(/[\:-]/ig, '');
    };
    createEventInstanceId = function(){
      return eventInstanceId(model);
    };
    model = inputModel != null
      ? inputModel
      : {};
    slots = [];
    calendars = [];
    activeSlots = [];
    possibleSlots = [];
    x$ = model;
    x$.date = {
      start: null,
      end: null
    };
    x$.value = null;
    x$.eventId = null;
    x$._id = null;
    x$.charges = [];
    x$.attendees = [];
    x$.addons = activity.charges.filter(function(it){
      return it.type === 'addon';
    }).map(transformCharge);
    x$.questions = (ref$ = activity.questions) != null
      ? ref$
      : [];
    x$.bg = activity.image;
    setup();
    state = {
      chosenEvent: null
    };
    observer = {
      list: [],
      observe: function(func){
        return observer.list.push(func);
      },
      notify: function(name, data){
        return p.each(function(watch){
          return watch(name, data);
        })(
        observer.list);
      }
    };
    dayHasBookableSlot = function(day){
      return slotsByDayWithoutFilters(day).length > 0;
    };
    return {
      observe: observer.observe,
      chooseEvent: function(id){
        state.chosenEvent = id;
        return findChosenEvent();
      },
      isChosenEvent: function(){
        var ref$;
        return ((ref$ = state.chosenEvent) != null ? ref$ : "").length > 0;
      },
      setMonth: setMonth,
      model: model,
      activeSlots: activeSlots,
      possibleSlots: possibleSlots,
      move: move,
      selectDay: selectDay,
      selectDayAnyway: selectDayAnyway,
      calendars: calendars,
      createEventInstanceId: createEventInstanceId,
      calendarUp: calendarUp,
      calendarDown: calendarDown,
      close: close,
      isActiveMonth: isActiveMonth,
      isDisabledDay: isDisabledDay,
      dayHasBookableSlot: dayHasBookableSlot,
      isDisabledMonth: isDisabledMonth,
      isCalendarUpDisabled: isCalendarUpDisabled,
      isDummy: isDummy,
      isActiveDay: isActiveDay,
      notSelected: notSelected,
      chooseSlot: chooseSlot,
      chooseSlotAnyway: chooseSlotAnyway,
      notAvailableSlot: notAvailableSlot,
      disabledSlot: disabledSlot,
      skipSlots: skipSlots
    };
  };
});
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
function compose$() {
  var functions = arguments;
  return function() {
    var i, result;
    result = functions[0].apply(this, arguments);
    for (i = 1; i < functions.length; ++i) {
      result = functions[i](result);
    }
    return result;
  };
}