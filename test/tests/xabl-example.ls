describe \xabl ,  (...)->
  before-each module \test
  state =
     xabl: null
     httpBackend: null
  before-each inject (_$xabl_, _$http_, $injector)->
    state.httpBackend = $injector.get(\$httpBackend)
    _$http_.defaults.useXDomain = yes
    window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000
    state.xabl = _$xabl_
    state.http = _$http_
  after-each ->
  
  wait = (func)->
    set-timeout do 
        * func
        * 50
  url = \https://staging-api.adventurebucketlist.com/api/v1
  remove = (response)->
    state.httpBackend
          .when \DELETE, "#url/activities"
          .respond do 
             * 200
             * response
    state.httpBackend.flush!
  post = (response)->
    state.httpBackend
          .when \POST, "#url/activities"
          .respond do 
             * 200
             * response
    state.httpBackend.flush!
  put = (response)->
    state.httpBackend
          .when \PUT, "#url/activities"
          .respond do 
             * 200
             * response
    state.httpBackend.flush!
  get = (response)->
    state.httpBackend
          .when \GET, "#url/activities"
          .respond do 
             * 200
             * response
    state.httpBackend.flush!
  
  
  it \properties , (done)->
    activities = state.xabl
    fields =
     * [\get, \Function]
     * [\post, \Function]
     * [\create, \Function]
     * [\update, \Function]
     * [\put, \Function]
     * [\patch, \Function]
     * [\delete, \Function]
     
     
    expect(activities).to-be-defined!
    fields.for-each (field)->
      expect(activities[field.0]).to-be-defined!
      expect(typeof! activities[field.0]).to-equal field.1
    
    done "ok" 
  
  it \request , (done)->
    state.xabl
       .get \activities
       .success (data)->
           expect(data.list).to-be-defined!
           expect(typeof! data.list).to-equal \Array
           expect(data.list.0).to-equal 1
           expect(data.list.1).to-equal 2
           expect(data.list.2).to-equal 3
       .error ->
           expect(yes).to-equal(no)
       .finally done
    get do 
      * list: [1,2,3]
    wait ->
       done!
  
  it \request , (done)->
    state.xabl
       .post do 
          * \activities
          * {}
       .success (data)->
           expect(data.success).to-equal yes
           done!
       .error ->
           expect(yes).to-equal(no)
       .finally done
    post do 
      * success: yes
  it \request , (done)->
    state.xabl
       .put do 
          * \activities
          * {}
       .success (data)->
           expect(data.success).to-equal yes
           done!
       .error ->
           expect(yes).to-equal(no)
       .finally done
    put do 
      * success: yes
  it \request , (done)->
    state.xabl
       .create do 
          * \activities
          * {}
       .success (data)->
           expect(data.success).to-equal yes
           done!
       .error ->
           expect(yes).to-equal(no)
       .finally done
    post do 
      * success: yes
  it \request , (done)->
    state.xabl
       .update do 
          * \activities
          * {}
       .success (data)->
           expect(data.success).to-equal yes
           done!
       .error ->
           expect(yes).to-equal(no)
       .finally done
    put do 
      * success: yes
  it \request , (done)->
    state.xabl
       .delete do 
          * \activities
          * {}
       .success (data)->
           expect(data.success).to-equal yes
           done!
       .error ->
           expect(yes).to-equal(no)
       .finally done
    remove do 
      * success: yes