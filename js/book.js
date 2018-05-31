angular.module('ablsdk').service('ablbook', function($xabl, p, stripe, debug, prefill, safeApply){
  return function(activity, globalCallback){
    var state, getDay, investigateDate, valid, issue, error, closeError, resetIdempotencyKey, few, sum, disabledOrder, cardify, cardify2, getEventInstanceId, bookingProcess, stripeProcess, paymentSetup, validate, bookingSuccess, checkout, agree, isError, showErrorLogical, showError, fields, patterns, messagePatterns, tryCheckout, message, placeholder, x$;
    state = {
      triedCheckout: false,
      typing: '',
      braintreeClient: null,
      loading: false,
      idempotencyKey: null,
      form: {
        error: "",
        agreed: false,
        email: '',
        name: '',
        phone: '',
        address: '',
        location: {},
        notes: '',
        date: {
          start: null,
          end: null
        },
        creditCard: {
          card: '',
          expDate: '',
          cvv: '',
          address_zip: ''
        }
      },
      calendar: {
        value: null,
        visible: false,
        currentActivity: activity,
        closed: function(chosen){
          debug('closed-calendar', chosen);
          state.form.date.start = state.calendar.date.start;
          state.form.date.end = state.calendar.date.end;
          return globalCallback('slot-chosen', chosen);
        }
      }
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
    investigateDate = function(bag){
      var _;
      return _ = (function(){
        switch (false) {
        case bag.start !== null:
          return 'none';
        case getDay(bag.start) === getDay(bag.end):
          return 'different';
        default:
          return 'same';
        }
      }());
    };
    valid = function(form){
      return !state.loading && form.$valid;
    };
    issue = function(form){
      var field, text;
      for (field in fields) {
        if (fields.hasOwnProperty(field)) {
          text = message(form, field);
          if ((text != null ? text.length : void 8) > 0) {
            return text;
          }
        }
      }
      return "Please check the form";
    };
    error = function(message){
      return state.form.error = message;
    };
    closeError = function(){
      return error("");
    };
    resetIdempotencyKey = function(){
      var s;
      return state.idempotencyKey = (s = function(){
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }, s() + s() + '-' + s() + '-' + s() + '-' + s() + '-' + s() + s() + s());
    };
    resetIdempotencyKey();
    few = function(arr){
      var ref$;
      return (ref$ = arr != null ? typeof arr.filter == 'function' ? arr.filter(function(it){
        return it.quantity > 0;
      }) : void 8 : void 8) != null
        ? ref$
        : [];
    };
    sum = function(arr){
      switch (false) {
      case typeof arr !== 'undefined':
        return 0;
      case typeof arr !== null:
        return 0;
      case arr.length !== 0:
        return 0;
      default:
        return arr.reduce(function(x, y){
          return x + y;
        });
      }
    };
    disabledOrder = function(){
      return sum(state.calendar.calc.attendees.map(function(it){
        return it.quantity;
      })) === 0;
    };
    cardify = function(val, val2){
      var newval;
      newval = (function(){
        switch (false) {
        case val.length !== 4:
          return val + " ";
        case val.length !== 9:
          return val + " ";
        case val.length !== 14:
          return val + " ";
        case val.length !== 19:
          return val + " ";
        default:
          return val;
        }
      }());
      return newval + val2;
    };
    cardify2 = function(val, val2){
      var newval;
      newval = (function(){
        switch (false) {
        case val.length !== 4:
          return val + " ";
        case val.length !== 11:
          return val + " ";
        default:
          return val;
        }
      }());
      return newval + val2;
    };
    getEventInstanceId = function(){
      var eventId;
      if (state.calendar._id == null) {
        throw "Cannot get event instance id because calendar._id is not defined";
      }
      eventId = function(it){
        return it != null ? it.eventId : void 8;
      }(
      p.find(function(it){
        return it._id === state.calendar._id;
      })(
      activity.timeslots));
      if (eventId == null) {
        throw "event id is not found by id " + state.calendar._id + " in [" + activity.timeslots.map(function(it){
          return it._id;
        }).join(',') + "]";
      }
      return eventId + '_' + state.calendar.date.origin;
    };
    bookingProcess = function(token, callback){
      var f, a, makeNulls, coupon, agentCode, free, req, ref$;
      f = state.form;
      a = activity;
      makeNulls = function(total){
        return p.map(function(){
          return null;
        })(
        (function(){
          var i$, to$, results$ = [];
          for (i$ = 1, to$ = total; i$ <= to$; ++i$) {
            results$.push(i$);
          }
          return results$;
        }()));
      };
      coupon = state.calendar.calc.coupon.codes.length > 0;
      agentCode = state.calendar.calc.agent.codes.length > 0;
      free = state.calendar.calc.calcTotal() === 0;
      req = {
        isMobile: (ref$ = f.isMobile) != null ? ref$ : false,
        stripeToken: token,
        couponId: coupon ? state.calendar.calc.coupon.codes[0].couponId : undefined,
        paymentMethod: (function(){
          switch (false) {
          case !(free && coupon):
            return 'gift';
          case !free:
            return 'cash';
          default:
            return 'credit';
          }
        }()),
        agentCode: agentCode ? state.calendar.calc.agent.codes[0].code : undefined,
        eventInstanceId: getEventInstanceId(),
        addons: p.pairsToObj(
        p.map(function(a){
          return [a._id, makeNulls(a.quantity)];
        })(
        state.calendar.calc.addons)),
        attendees: p.pairsToObj(
        p.map(function(a){
          return [a._id, makeNulls(a.quantity)];
        })(
        state.calendar.calc.attendees)),
        answers: p.pairsToObj(
        p.map(function(a){
          return [a._id, a.answer];
        })(
        state.calendar.questions)),
        adjustments: state.calendar.calc.adjustment.list,
        fullName: f.name,
        email: f.email,
        phoneNumber: f.phone,
        notes: f.notes,
        location: f.location,
        currency: 'usd',
        operator: activity.operator._id || activity.operator,
        _customHeaders: {
          "Idempotency-Key": state.idempotencyKey
        }
      };
      return $xabl.post('bookings', req).success(function(data){
        var ref$, ref1$;
        if (data.bookingId != null) {
          f.bookingId = data.bookingId;
          resetIdempotencyKey();
          return callback(data);
        } else {
          return error((ref$ = (ref1$ = e.errors) != null ? ref1$[0] : void 8) != null ? ref$ : "Server error");
        }
      }).error(function(e){
        var ref$, ref1$;
        return error((ref$ = (ref1$ = e.errors) != null ? ref1$[0] : void 8) != null ? ref$ : "Server error");
      })['finally'](function(){
        return state.loading = false;
      });
    };
    stripeProcess = function(key, callback){
      var cc, expDate, f, req, ref$;
      if (typeof key === 'undefined') {
        state.loading = false;
        return error("Stripe key is not defined");
      }
      stripe.setPublishableKey(key);
      cc = state.form.creditCard;
      expDate = cc.expDate.split('/');
      f = state.form;
      req = {
        number: cc.card,
        cvc: cc.cvv,
        address_zip: cc.address_zip,
        exp_month: expDate[0],
        exp_year: "20" + expDate[1],
        fullName: (ref$ = f.fullName) != null
          ? ref$
          : f.name,
        location: f.location,
        state: f.state
      };
      return stripe.createToken(req, function(err, token){
        if (err != null) {
          state.loading = false;
          return error(err);
        }
        return bookingProcess(token, callback);
      });
    };
    paymentSetup = function(){
      return $xabl.get("payments/setup?operator=" + (activity.operator._id || activity.operator));
    };
    validate = function(form){
      var isValid;
      if (state.loading === true) {
        return false;
      }
      state.triedCheckout = true;
      isValid = valid(form);
      if (!isValid) {
        error(issue(form));
      }
      return isValid;
    };
    bookingSuccess = function(booking){
      state.booking = booking;
      return globalCallback('success', booking);
    };
    checkout = function(form, moreData){
      if (validate(form)) {
        state.loading = true;
        if (state.calendar.calc.calcTotal() > 0) {
          return paymentSetup().success(function(data){
            return stripeProcess(data.publicKey, bookingSuccess);
          }).error(function(err){
            state.loading = false;
            error(err);
            return globalCallback('error', error);
          });
        } else {
          return bookingProcess("", bookingSuccess);
        }
      }
    };
    agree = function(){
      state.form.agreed = !state.form.agreed;
      return tryCheckout();
    };
    isError = function(v){
      return v.required || v.pattern || v.minlength || v.maxlength || v.phone;
    };
    showErrorLogical = function(name, v){
      var s, show;
      s = fields[name].state;
      show = (function(){
        switch (false) {
        case !state.triedCheckout:
          return true;
        case !(!s.touched && !state.triedCheckout):
          return false;
        case !(s.active && !state.triedCheckout):
          return false;
        case !(!s.active && s.touched):
          return true;
        default:
          return false;
        }
      }());
      if (show) {
        return showError(name, v);
      } else {
        return "";
      }
    };
    showError = function(name, v){
      var ref$, ref1$, ref2$, ref3$, ref4$, ref5$;
      switch (false) {
      case !v.required:
        return (ref$ = (ref1$ = fields[name].messages) != null ? ref1$.required : void 8) != null
          ? ref$
          : fields[name].title + " is required";
      case !v.pattern:
        return (ref$ = (ref2$ = fields[name].messages) != null ? ref2$.pattern : void 8) != null
          ? ref$
          : "Please enter a valid " + fields[name].example;
      case !v.minlength:
        return (ref$ = (ref3$ = fields[name].messages) != null ? ref3$.minlength : void 8) != null
          ? ref$
          : fields[name].title + " is too short";
      case !v.maxlength:
        return (ref$ = (ref4$ = fields[name].messages) != null ? ref4$.maxlength : void 8) != null
          ? ref$
          : fields[name].title + " is too long";
      case !v.phone:
        return (ref$ = (ref5$ = fields[name].messages) != null ? ref5$.phone : void 8) != null
          ? ref$
          : fields[name].title + " is not valid phone number";
      default:
        return "please check " + fields[name].title;
      }
    };
    fields = {
      email: {
        title: "Email Address",
        pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
        example: 'nickname@email.com',
        placeholder: 'Email',
        state: {
          index: 1,
          touched: false,
          active: false
        }
      },
      name: {
        pattern: '',
        title: "Full Name",
        example: 'Your name',
        placeholder: 'Name',
        state: {
          index: 2,
          touched: false,
          active: false
        }
      },
      phone: {
        title: "Phone Number",
        pattern: /^[0-9]{3}[-][0-9]{3}[-][0-9]{3,5}$/i,
        placeholder: "Phone +1 123-456-1234",
        example: "+1 123-456-1234",
        state: {
          index: 3,
          touched: false,
          active: false
        }
      },
      address: {
        pattern: '',
        title: "Address",
        example: 'Address',
        placeholder: 'Home address',
        state: {
          index: 4,
          touched: false,
          active: false
        }
      },
      notes: {
        pattern: '',
        title: "Notes",
        example: "Notes",
        placeholder: "Notes",
        state: {
          index: 5,
          touched: false,
          active: false
        }
      },
      address_zip: {
        pattern: '',
        example: '12345',
        title: "Postal Code",
        placeholder: "Postal Code",
        normalize: function(value){
          return value;
        },
        state: {
          index: 6,
          touched: false,
          active: false
        }
      },
      card: {
        pattern: /(^[0-9]{4} [0-9]{4} [0-9]{4} [0-9]{4}$)|(^[0-9]{4} [0-9]{6} [0-9]{5}$)/i,
        example: 'Card Number',
        title: "Credit Card Number",
        placeholder: "Credit Card Number",
        normalize: function(value){
          var stripValue, cvv, mask;
          if (typeof value === 'undefined') {
            return;
          }
          stripValue = value.split(' ').join('');
          if (stripValue.length < 15) {
            return;
          }
          cvv = function(number){
            fields.cvv.pattern = fields.cvv.patterns[number];
            return fields.cvv.messages.pattern = fields.cvv.messages.patterns[number];
          };
          mask = function(func){
            return state.form.creditCard.card = function(it){
              return it.substr(0, 19);
            }(
            p.fold(func, "")(
            stripValue));
          };
          debug('strip-value', stripValue.length, stripValue);
          if (stripValue.length === 15) {
            mask(cardify2);
            return cvv(4);
          } else if (stripValue.length === 16) {
            mask(cardify);
            return cvv(3);
          }
        },
        state: {
          index: 7,
          touched: false,
          active: false
        }
      },
      expDate: {
        pattern: /[0-9]{2}\/[0-9]{2}/i,
        example: "05/15",
        title: "Exp Date",
        placeholder: 'Exp Date (MM/YY)',
        normalize: function(value, keyCode){
          var e, ref$, t;
          e = (ref$ = value != null ? value.replace('/', '') : void 8) != null ? ref$ : "";
          t = function(it){
            return it != null ? it : "";
          };
          return state.form.creditCard.expDate = (function(){
            switch (false) {
            case !(e.length === 2 && keyCode === 8):
              return e[0] + e[1];
            case e.length !== 2:
              return e[0] + e[1] + '/';
            case !(e.length > 2):
              return e[0] + e[1] + '/' + t(e[2]) + t(e[3]);
            default:
              return e;
            }
          }());
        },
        state: {
          index: 8,
          touched: false,
          active: false
        }
      },
      startDate: {
        state: {
          index: 11,
          touched: false,
          active: false
        }
      },
      cvv: (patterns = {
        3: /^[0-9]{3}$/i,
        4: /^[0-9]{4}$/i
      }, messagePatterns = {
        3: "CVV must be 3 digits (e.g. 123)",
        4: "CVV must be 4 digits (e.g. 1234)"
      }, {
        pattern: patterns[3],
        patterns: patterns,
        example: "000",
        title: "CVV",
        placeholder: "CVV",
        state: {
          index: 9,
          touched: false,
          active: false
        },
        messages: {
          pattern: messagePatterns[3],
          patterns: messagePatterns
        }
      }),
      agreed: {
        title: "Confirmation",
        pattern: 'true',
        messages: {
          required: "Please accept the terms and conditions"
        },
        state: {
          index: 10,
          touched: false,
          active: false
        }
      }
    };
    tryCheckout = function(){
      if (state.form.agreed) {
        return state.triedCheckout = true;
      }
    };
    message = function(form, name){
      var sorted, field, val, ref$, this$ = this;
      sorted = p.pairsToObj(
      p.sortBy(function(it){
        return it[1].state.index;
      })(
      p.objToPairs(
      fields)));
      for (field in sorted) {
        if (fields.hasOwnProperty(field)) {
          val = (ref$ = form[field]) != null ? ref$.$error : void 8;
          if (val && isError(val)) {
            if (field === name) {
              return showErrorLogical(field, val);
            }
            return "";
          }
        }
      }
      return "";
    };
    placeholder = function(name){
      return fields[name].placeholder;
    };
    prefill(function(){
      var f, c;
      f = state.form;
      f.email = "a.stegno@gmail.com";
      f.name = "Test User";
      f.phone = "+380665243646";
      f.address = "664 Cypress Lane, Campbell, CA, United States";
      f.notes = "Some test notes";
      c = state.form.creditCard;
      c.card = "5105 1051 0510 5100";
      c.address_zip = "12345";
      c.expDate = "05/17";
      c.cvv = "333";
      return state.form.agreed = true;
    });
    x$ = state;
    x$.handle = function(event){
      return safeApply(function(){
        var name, type, value, field;
        name = event.target.name;
        type = event.type;
        value = event.target.value;
        field = fields[name];
        if (field == null) {
          return;
        }
        switch (type) {
        case 'keyup':
          return typeof field.normalize == 'function' ? field.normalize(value, event.keyCode) : void 8;
        case 'focus':
          field.state.active = true;
          return field.state.touched = true;
        case 'blur':
          return field.state.active = false;
        }
      });
    };
    x$.setIndex = function(name, index){
      var field;
      field = fields[name];
      if (field == null) {
        return index;
      }
      field.state.index = index;
      return index;
    };
    x$.investigateDate = investigateDate;
    x$.getEventInstanceId = getEventInstanceId;
    x$.placeholder = placeholder;
    x$.closeError = closeError;
    x$.checkout = checkout;
    x$.validate = validate;
    x$.agree = agree;
    x$.fields = fields;
    x$.few = few;
    x$.disabledOrder = disabledOrder;
    x$.message = message;
    return state;
  };
});