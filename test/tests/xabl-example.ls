describe \xabl ,  (...)->
  before-each module \test
  state =
     xabl: null
     httpBackend: null
  before-each inject (_$xabl_, _$http_, $injector)->
    state.httpBackend = $injector.get(\$httpBackend)
    state.httpBackend
      .when \GET, \https://staging-api.adventurebucketlist.com/api/v1/activities
      .respond 200, {list: []}
    _$http_.defaults.useXDomain = yes
    window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000
    state.xabl = _$xabl_
    state.http = _$http_
  after-each ->
  
  it \test-http, (done)->
    

    
    state.http 
       .get do 
         * \https://staging-api.adventurebucketlist.com/api/v1/activities
         * headers: 
             "X-ABL-Access-Key": "475e2a00b7f6cb4008bbe0b98df460c82d19d83d7c55eb36f5001b78d414ff6374ea7d2360f3c3bd1988f82c109f6d569273611fddc753ad263b6d9d7482c4d3"
       .success (data)->
         expect(data.list).to-be-defined!
         expect(typeof! data.list).to-equal \Array
       .error ->
         expect(yes).to-equal(no)
       .finally done
    
    
    state.httpBackend
      .flush!
       
  
  it \request , (done)->
    state.xabl
       .get \activities
       .success (data)->
           expect(data.list).to-be-defined!
           expect(typeof! data.list).to-equal \Array
       .error ->
           expect(yes).to-equal(no)
       .finally done
    state.httpBackend
      .when \GET, \https://staging-api.adventurebucketlist.com/api/v1/activities
      .respond 200, {list: []}
    state.httpBackend.flush!