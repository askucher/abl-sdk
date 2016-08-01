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
  
    //Your code here
  
  })
```

###DEBUG service example

```Livescript 
angular
  .module "app", [ablsdk]
  .controller "yourCtrl", ($scope, debug)->
    console.log \show
    debug \show #console.log analogue but prints only when constant enabledDebug=true  
    
    debug ->
       console.log "Run this script only in debug mode"
    
```


###CRUD example

```Livescript 
angular
  .module "app", [ablsdk]
  .controller "yourCtrl", ($scope, crud)->
    activities = crud \activities  #=> use ng:repeat="activity in activities"
    
    #activity will be removed from activities array and DELETE /api/activities will be produced
    remove = (activity)->
      activities.remove activity
    
    #activity will be added to activities array and POST /api/activities will be produced
    add = (new-activity)->
      activities.push new-activity
    
    $scope.add = add 
    $scope.remove = remove
    $scope.activities = activities  
    
```

##Book an activity example

```Livescript
angular
  .module "app", [ablsdk]
  .controller "yourCtrl", (ablsdk, $timeout)->
    widget = ablsdk.widget
    
    widget.load!.then ->
       
       #Working with activity model
       
       widget = ablsdk.widget
       
       console.log widget.activities #=> a loaded activities 
       
       ablsdk.choose widget.activities.0  #=> choose a first activity
       
       console.log widget.current-activity #=> chosen activity
       
       #Working with slots model
       
       $timeout ->
       
           for calendar in widget.slot.calendars
             for day in calendar.days
                statuses = 
                  chosen: widget.slot.isActiveDay(day) #=> user chosen that day
                  enabled: not widget.slot.isDisabledDay(day)  #=> this day can be chosen
                  empty: widget.slot.isDummy(day) #=> this is not a day but free space reserved by previous month
                if statuses.enabled 
                   widget.choose day
                   return
                
           console.log widget.slot.active-slots #=> show all active slots available for this day
           
           widget.choose widget.slot.active-slots.0
           
           #Working with book model
           
           
           form = widget.book.form
           
           console.log "Available Slots", widget.book.calendar.available!
           calc = widget.calc!
           calc.attendees.0.quantity = 5
           calc.addons.0.quantity = 5
           
           calc.coupon.code = "COUPONCODE"
           calc.coupon.add!
           
           #when you change the model in angular view please add attributes event="book.handle(event)" and name="email" or appropriate in order to show inline errors to user
           
           form.email = "yourEmail@gmail.com"
           form.name = "Your Name"
           form.phone = "+1XXXXXXXXX" 
           form.address = "New York City, ..." 
           form.notes = "New York City, ..." 
           form.creditCard.card = "0000 0000 0000 0000"
           form.creditCard.cvv = "123"
           form.creditCard.exp-date = "12/07"
           
           widget.book.agree! # => Agree with terms and conditions
           
           console.log "Subtotal", calc.calcSubtotal! 
           console.log "Taxes / Fees", calc.calcTaxesFees! 
           console.log "Coupon", calc.calcCoupon!
           console.log "Total", calc.calcTotal! 
           
           widget.book.checkout {$valid: yes} #pass the real angular form object here
       
       
```


###How to run tests 

```
npm run test 
```

