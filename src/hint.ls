angular.module(\ablsdk).directive do
    * \hint
    * ($timeout, debug)->
        #require: \^activityWidget
        restrict: \A
        replace: yes
        scope: {}
        link: ($scope, element, $attrs) ->
            $element = $ element
            state =
                hint: null
            $attrs.$observe \hint, (value)->
                $element.mouseover ->
                    offset = $element.offset!
                    width = 250
                    state.hint = 
                      $("<div>#{value}</div>")
                        .css("position", "absolute")
                        .css("background", "gray")
                        .css("border-radius", "5px")
                        .css("width", width)
                        .css("box-sizing", "border-box")
                        .css("padding", "5px")
                        .css("text-align", "center")
                        .css("color", "white")
                        .css("z-index", "9999")
                        .css("opacity", "0")
                        .css("bottom", offset.bottom)
                    state.hint.css("top", offset.top - state.hint.height! * 2)
                    left = offset.left - width / 2
                    state.hint.css do
                        * \left
                        * Math.max(left, 0)
                    state.hint.animate {opacity: 1}, 500
                    debug "mouseover", offset
                    $(document.body).append(state.hint)
                $element.mouseout ->
                    debug "mouseout"
                    state.hint.remove!