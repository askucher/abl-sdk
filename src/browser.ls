angular
 .module \ablsdk
 .service \browser, ($window)->
     name = ->
       user-agent = $window.navigator.user-agent
       browsers =
          chrome: /chrome/i
          safari: /safari/i
          firefox: /firefox/i
          ie: /msie/i
       for key of browsers
          if browsers[key].test($window.navigator.user-agent)
             return key
       \unknown 
     name: name! 
       