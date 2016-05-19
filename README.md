# abl-sdk [<img src="http://benschwarz.github.io/bower-badges/badge@2x.png" width="140" height="32">](https://libraries.io/bower/abl-sdk)

![abl-sdk](http://content.screencast.com/users/a.stegno/folders/Jing/media/24a1e61b-195a-44e9-a870-23d84e116bd1/00000337.png)

##Install

```bash
bower install abl-sdk
```

```Javascript
angular
  .module("app", [ablsdk])
  .controller("yourCtrl", function(ablsdk) {
  
    //use abldate and ablcalc services here
  
  })
```


```Javascript
angular
  .module "app", [ablsdk]
  .controller "yourCtrl", (ablsdk)->
  
    ablsdk.activity.load ->
       
       //Working with activity model
       
       all-activities =  ablsdk.activity.all 
       
       console.log all-activities //=> a loaded activities 
       
       ablsdk.activity.choose all-activities.0  //=> choose a first activity
       
       console.log ablsdk.activity.current //=> chosen activity
       
       //Working with slots model
       
       for calendar in ablsdk.slot.calendars
         for day in calendar.days
            statuses = 
              chosen: ablsdk.slot.isActiveDay(day) //=> user chosen that day
              enabled: ablsdk.slot.isDisabledDay(day)  //=> this day can be chosen
              empty: ablsdk.slot.isDummy(day) //=> this is not a day but free space reserved by previous month
            if statuses.enabled 
               ablsdk.slot.select-day day
               return
            
       console.log ablsdk.slot.active-slots //=> show all active slots available for this day
       
       ablsdk.slot.choose-slot ablsdk.slot.active-slots.0
       
       //Working with book model
       
       
       form = ablsdk.book.form
       calc = ablsdk.book.calendar.calc
       
       console.log "Available Slots", ablsdk.book.calendar.available!
       
       calc.attendees.0.quontaty = 5
       calc.addons.0.quontaty = 5
       
       calc.coupon.code = "COUPONCODE"
       calc.coupon.add!
       
       //when you change the model in angular view please add attributes event="book.handle(event)" and name="email" or appropriate in order to show inline errors to user
       
       form.email = "yourEmail@gmail.com"
       form.name = "Your Name"
       form.phone = "+1XXXXXXXXX" 
       form.address = "New York City, ..." 
       form.notes = "New York City, ..." 
       form.creditCard.card = "0000 0000 0000 0000"
       form.creditCard.cvv = "123"
       form.creditCard.exp-date = "12/07"
       
       ablsdk.book.agree! // => Agree with terms and conditions
       
       console.log "Subtotal", calc.calcSubtotal! 
       console.log "Taxes / Fees", calc.calcTaxesFees! 
       console.log "Coupon", calc.calcCoupon!
       console.log "Total", calc.calcTotal! 
       
       ablsdk.book.checkout!
       
       
```


###How to run tests 

```
npm run test 

#if you need to modify tests on fly - run
#npm run lsc
```

