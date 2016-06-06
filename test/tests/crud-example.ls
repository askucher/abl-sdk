describe \crud ,  (...)->
  before-each module \test
  state =
     crud: null
     httpBackend: null
  before-each inject (_crud_, $injector)->
    window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
    state.httpBackend = $injector.get(\$httpBackend)
    state.crud = _crud_
    #jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
  after-each ->
  
  
  
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
  
  
    
  it \converter , (done)->
      converter = 
        frontendify: (server-data)->
           server-data: server-data
           somefield: \somefield
        backendify: (frontend-data)->
          
      activities = state.crud(\activities).converter(converter)
      expect(activities).to-be-defined!
      state.httpBackend
        .when \GET, \https://staging-api.adventurebucketlist.com/api/v1/activities
        .respond 200, {list: []}
      state.httpBackend.flush!
      set-timeout do 
        * ->
            expect(activities.somefield).to-equal \somefield
            done "ok"
        * 2000
      
    
      
      