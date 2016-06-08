describe \crud ,  (...)->
  before-each module \test
  state =
     crud: null
     httpBackend: null
  before-each inject (_crud_, $injector, $timeout)->
    window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
    state.httpBackend = $injector.get(\$httpBackend)
    state.crud = _crud_
    state.timeout = $timeout
    #jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
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
    #state.httpBackend.flush!
  post = (response)->
    state.httpBackend
          .when \POST, "#url/activities"
          .respond do 
             * 200
             * response
    #state.httpBackend.flush!
  put = (response)->
    state.httpBackend
          .when \PUT, "#url/activities"
          .respond do 
             * 200
             * response
    #state.httpBackend.flush!
  get = (response)->
    state.httpBackend
          .when \GET, "#url/activities"
          .respond do 
             * 200
             * response
    state.httpBackend.flush!
  
  #Testing of default object properties and method. They should be overrided by converter
  it \properties , (done)->
    activities = state.crud("activities")
    fields =
     * [\options, \Object]
     * [\converter, \Function]
     * [\getOptions, \Function]
     * [\listen, \Function]
     * [\loading, \Function]
     * [\toArray, \Function]
     * [\fetchOn, \Function]
     * [\watch, \Function]
     * [\map, \Function]
     * [\filter, \Function]
     * [\push, \Function]
     * [\save, \Function]
     * [\fetch, \Function]
     * [\remove, \Function]
     * [\splice, \Function]
    expect(activities).to-be-defined!
    fields.for-each (field)->
      expect(activities[field.0]).to-be-defined!
      expect(typeof! activities[field.0]).to-equal field.1
    
    done "ok"
  
  #Testing of the loading indicator
  it \loading-indicator , (done)->
      activities = state.crud(\activities)
      expect(activities).to-be-defined!
      expect(activities.loading!).to-equal yes
      get do 
           * list: 
               * item: 1
               * item: 2
               * item: 3
      wait ->
            expect(activities.loading!).to-equal no
            done "ok"
  
  
  
  #By Default the crud service fill the object array with data comming from the server
  it \default-converter , (done)->
      activities = state.crud(\activities)
      expect(activities).to-be-defined!
      get do 
           * list: 
               * item: 1
               * item: 2
               * item: 3
      wait ->
            expect(activities.0.item).to-equal 1
            expect(activities.1.item).to-equal 2
            expect(activities.2.item).to-equal 3
            done "ok"
  
  #Invoking the data twice and checking the loading() insdicator
  it \test-fetch-again , (done)->
      activities = state.crud(\activities)
      expect(activities).to-be-defined!
      expect(activities.loading!).to-equal yes
      test = (callback)->
        get do 
           * list:
                 * item: 1
                 * item: 2
                 * item: 3
        wait ->
              expect(activities.loading!).to-equal no
              expect(activities.0.item).to-equal 1
              expect(activities.1.item).to-equal 2
              expect(activities.2.item).to-equal 3
              callback!
      test ->
         activities.fetch!
         test ->
           done "ok"
          
  #This object can be transformed into another object by applying the converter 
  it \custom-converter , (done)->
      converter = 
        frontendify: (server-data)->
           server-data: server-data
           somefield: \somefield
        backendify: (frontend-data)->
          
      activities = state.crud(\activities).converter(converter)
      expect(activities).to-be-defined!
      get do 
           * list: []
             another-field: \anotherfield
      wait ->
            expect(activities.somefield).to-equal \somefield
            expect(activities.server-data.another-field).to-equal \anotherfield
            done "ok"
   
  #The data can be filtered once it is loaded
  it \filter-test , (done)->
      
      activities = state.crud(\activities).filter(-> it.item is 2)
      expect(activities).to-be-defined!
      get do 
           * list: 
               * item: 2
               * item: 2
               * item: 3
      wait ->
            expect(activities.length).to-equal 2
            done "ok"
  
  #The data can be transformed by 'map' function once it is loaded
  it \map-test , (done)->
      activities = state.crud(\activities).map(-> it.item * 2)
      expect(activities).to-be-defined!
      get do 
           * list: 
               * item: 2
               * item: 2
               * item: 3
      wait ->
            expect(activities.0).to-equal 4
            expect(activities.1).to-equal 4
            expect(activities.2).to-equal 6
            done "ok"
  
  #Test custom options
  it \custom-option-test , (done)->
      activities = state.crud(\activities, { custom: 5 })
      expect(activities).to-be-defined!
      expect(activities.get-options!.custom).to-equal 5
      done!
  
  #Test of chaging of custom options
  it \custom-option-test , (done)->
      activities = state.crud(\activities, { custom: 5 })
      expect(activities).to-be-defined!
      expect(activities.get-options!.custom).to-equal 5
      activities.fetch custom: 6
      expect(activities.get-options!.custom).to-equal 5  
      expect(activities.loading!).to-equal yes  
      done!
  
  #Test of chaging of custom options
  it \custom-option-test2 , (done)->
      activities = state.crud(\activities, { custom: 5 })
      expect(activities).to-be-defined!
      expect(activities.get-options!.custom).to-equal 5
      get list: []
      wait ->
        expect(activities.loading!).to-equal no
        activities.fetch custom: 6
        expect(activities.get-options!.custom).to-equal 6
        done!
  
  
  #Test page option
  it \page-option-test , (done)->
      activities = state.crud(\activities, { page: 5 })
      expect(activities).to-be-defined!
      expect(activities.get-options!.page).to-equal 4 #page - 1
      done!
      
  #Imutable state test
  it \imutable-test , (done)->
      activities = state.crud(\activities).to-array!
      expect(activities).to-be-defined!
      get list: [1,2,3]
      wait ->
        expect(activities.length).to-equal 0 #because to-array made imutable array
        done!
  
  #test watch another object
  it \watch-test , (done)->
      some-object = 
        param: 1
      activities = state.crud(\activities).watch(some-object)
      get list: [1,2,3]
      wait ->
        expect(activities.loading!).to-equal no
        some-object.param = 2
        state.timeout ->
          #will start reloading at the end of the digest loop
          expect(activities.loading!).to-equal yes
        done!
  
  #Save object on server and memory
  it \save-test , (done)->
      activities = state.crud(\activities)
      get do 
        * list: 
            * item: 1
            * item: 2
            * item: 3
      wait ->
        new-item = 
          item: 4
        activities.0.item = 5
        activities.save activities.0
        put [activities.0]
        wait ->
          expect(activities.0.item).to-equal 5
          done!
  return
  #Insert object into server and memory
  it \push-test , (done)->
      activities = state.crud(\activities)
      get do 
        * list: 
            * item: 1
            * item: 2
            * item: 3
      wait ->
        new-item = 
          item: 4
        activities.push new-item
        post [new-item]
        wait ->
          expect(activities.length).to-equal 4
          done!
  #Delete object from server and memory
  it \delete-test , (done)->
      activities = state.crud(\activities)
      get do 
        * list: 
            * item: 1
            * item: 2
            * item: 3
      wait ->
        activities.remove activities.0
        remove activities.0
        wait ->
          expect(activities.length).to-equal 2
          done!
 