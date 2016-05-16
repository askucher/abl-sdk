describe 'calc', ->
  beforeEach module('ablsdk')
    
  services =
    ablcalc: {}
  beforeEach inject (_ablcalc_)->
     ablcalc = _ablcalc_
  console.log services.ablcalc