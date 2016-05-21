describe \preferences ,  (...)->
  before-each module \test
  state =
     sdk: null
  before-each inject (_ablsdk_)->
    state.sdk = _ablsdk_
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
  after-each ->
    state.sdk.destoy!
   
  it \available , (done)->
    #console.log state.sdk
    state.sdk.widget.load!.then ->
      #console.log state.sdk.user.preferences
      expect(state.sdk.widget.preferences).to.not.equal(null)