describe 'calc', ->
  beforeEach module('ablsdk')
  describe 'Constructor', ->
    it 'assigns a name', ->
      expect(new Person('Ben')).to.have.property 'name', 'Ben'
