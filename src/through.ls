angular
  .module \ablsdk
  .service \through, (p, $timeout)->
      (func)-> 
            state = 
                result: null
                has-result: no
                observers: []
            func (scope)->
                state.result = scope
                state.has-result = true
                state.observers |> p.each (-> it scope)
            then: (cb)->
              if state.has-result is yes
                 cb state.result
              state.observers.push cb