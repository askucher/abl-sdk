angular
  .module \ablsdk
  .service \typecheck, (debug, p)->
    build-parse-type = -> 
        # helpers
        identifier-regex = /[\$\w]+/
        
        function peek tokens # use instead of 'tokens.0' when it is required that the next token exists
          token = tokens.0
          throw new Error 'Unexpected end of input.' unless token?
          token
        
        function consume-ident tokens
          token = peek tokens
          throw new Error "Expected text, got '#token' instead." unless identifier-regex.test token
          tokens.shift!
        
        function consume-op tokens, op
          token = peek tokens
          throw new Error "Expected '#op', got '#token' instead." unless token is op
          tokens.shift!
        
        function maybe-consume-op tokens, op
          token = tokens.0
          if token is op then tokens.shift! else null
        
        # structures
        function consume-array tokens
          consume-op tokens, '['
          throw new Error "Must specify type of Array - eg. [Type], got [] instead." if (peek tokens) is ']'
          types = consume-types tokens
          consume-op tokens, ']'
          {structure: 'array', of: types}
        
        function consume-tuple tokens
          components = []
          consume-op tokens, '('
          throw new Error "Tuple must be of at least length 1 - eg. (Type), got () instead." if (peek tokens) is ')'
          for ever
            components.push consume-types tokens
            maybe-consume-op tokens, ','
            break if ')' is peek tokens
          consume-op tokens, ')'
          {structure: 'tuple', of: components}
        
        function consume-fields tokens
          fields = {}
          consume-op tokens, '{'
          subset = false
          for ever
            if maybe-consume-op tokens, '...'
              subset := true
              break
            [key, types] = consume-field tokens
            fields[key] = types
            maybe-consume-op tokens, ','
            break if '}' is peek tokens
          consume-op tokens, '}'
          {structure: 'fields', of: fields, subset}
        
        function consume-field tokens
          key = consume-ident tokens
          consume-op tokens, ':'
          types = consume-types tokens
          [key, types]
        
        # core
        function maybe-consume-structure tokens
          switch tokens.0
          | '[' => consume-array tokens
          | '(' => consume-tuple tokens
          | '{' => consume-fields tokens
        
        function consume-type tokens
          token = peek tokens
          wildcard = token is '*'
          if wildcard or identifier-regex.test token
            type = if wildcard then consume-op tokens, '*' else consume-ident tokens
            structure = maybe-consume-structure tokens
            if structure then structure <<< {type} else {type}
          else
            structure = maybe-consume-structure tokens
            throw new Error "Unexpected character: #token" unless structure
            structure
        
        function consume-types tokens
          if '::' is peek tokens
            throw new Error "No comment before comment separator '::' found."
          lookahead = tokens.1
          if lookahead? and lookahead is '::'
            tokens.shift! # remove comment
            tokens.shift! # remove ::
          types = []
          types-so-far = {} # for unique check
          if 'Maybe' is peek tokens
            tokens.shift!
            types =
              * type: 'Undefined'
              * type: 'Null'
            types-so-far = {+Undefined, +Null}
          for ever
            {type}:type-obj = consume-type tokens
            types.push type-obj unless types-so-far[type]
            types-so-far[type] = true
            break unless maybe-consume-op tokens, '|'
          types
        
        # single char ops used : , [ ] ( ) } { | *
        token-regex = //
            \.\.\.                       # etc op
          | ::                           # comment separator
          | ->                           # arrow (for error generation purposes)
          | #{ identifier-regex.source } # identifier
          | \S                           # all single char ops - valid, and non-valid (for error purposes)
          //g
        
        (input) ->
          throw new Error 'No type specified.' unless input.length
          tokens = (input.match token-regex or [])
          if '->' in tokens
            throw new Error "Function types are not supported.
                           \ To validate that something is a function, you may use 'Function'."
          try
            consume-types tokens
          catch
            throw new Error "#{e.message} - Remaining tokens: #{ JSON.stringify tokens } - Initial input: '#input'"
    build-parsed-type-check = ->
        any = p.any 
        all = p.all 
        is-it-NaN = p.is-it-NaN
        types =
          Number:
            type-of: 'Number'
            validate: -> not is-it-NaN it
          NaN:
            type-of: 'Number'
            validate: is-it-NaN
          Int:
            type-of: 'Number'
            validate: -> not is-it-NaN it and it % 1 is 0 # 1.0 is an Int
          Float:
            type-of: 'Number'
            validate: -> not is-it-NaN it # same as number
          Date:
            type-of: 'Date'
            validate: -> not is-it-NaN it.get-time! # make sure it isn't an invalid date
        default-type =
          array: 'Array'
          tuple: 'Array'
        function check-array input, type
          all (-> check-multiple it, type.of), input
        function check-tuple input, type
          i = 0
          for types in type.of
            return false unless check-multiple input[i], types
            i++
          input.length <= i # may be less if using 'Undefined' or 'Maybe' at the end
        
        function check-fields input, type
          input-keys = {}
          num-input-keys = 0
          for k of input
            input-keys[k] = true
            num-input-keys++
          num-of-keys = 0
          for key, types of type.of
            return false unless check-multiple input[key], types
            num-of-keys++ if input-keys[key]
          type.subset or num-input-keys is num-of-keys
        
        function check-structure input, type
          return false if input not instanceof Object
          switch type.structure
          | 'fields' => check-fields input, type
          | 'array'  => check-array input, type
          | 'tuple'  => check-tuple input, type
        
        function check input, type-obj
          {type, structure} = type-obj
          if type
            return true if type is '*' # wildcard
            setting = custom-types[type] or types[type]
            if setting
              setting.type-of is typeof! input and setting.validate input
            else
              # Booleam, String, Null, Undefined, Error, user defined objects, etc.
              type is typeof! input and (not structure or check-structure input, type-obj)
          else if structure
            return false unless that is typeof! input if default-type[structure]
            check-structure input, type-obj
          else
            throw new Error "No type defined. Input: #input."
        
        function check-multiple input, types
          throw new Error "Types must be in an array. Input: #input." unless typeof! types is 'Array'
          any (-> check input, it), types
        var custom-types
        (parsed-type, input, options = {}) ->
          custom-types := options.custom-types or {}
          check-multiple input, parsed-type
    parse-type = build-parse-type!
    parsed-type-check = build-parsed-type-check!
    (type, input, options)->
       debug ->
          parsed-type-check (parse-type type), input, options