describe \crud ,  (...)->
  before-each module \test
  state =
     crud: null
  before-each inject (_crud_)->
    window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
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
    expect(activities).toBeDefined!
    fields.for-each (field)->
      console.log field.0
      expect(activities[field.0]).toBeDefined!
    
    done "ok"