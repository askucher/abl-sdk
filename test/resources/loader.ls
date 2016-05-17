angular
  .module \test
  .service \loader, ($xabl)->
      load: (callback)->
            config = $.param do
              location: state.location
              page-size: 100
              page: state.page
              no-empty: no
              date-range: 
                * moment!.start-of(\day).format!
                * moment!.clone!.add(12, \months).end-of(\day).format!
            $xabl
                .get "operators/#{$xabl.options.key}"
                .error ->
                  throw "An error occurred getting Operator information for key #{$xabl.options.key}"
                .success (info)->
                   $xabl
                      .get "activities?#config"
                      .success (resp)->
                        callback do 
                            activities: resp.list
                            preferences: resp.preferences
                            info: info
                                
                    
                