describe \crud ,  (...)->
  before-each module \test
  state =
     crud: null
  before-each inject (_crud_)->
    state.crud = _crud_
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
  after-each ->
    
  it \available , (done)->
    expect(state.crud('activities')).to.not.equal(null)