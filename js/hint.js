angular.module('ablsdk').directive('hint', function($timeout, debug){
  return {
    restrict: 'A',
    replace: true,
    scope: {},
    link: function($scope, element, $attrs){
      var $element, state;
      $element = $(element);
      state = {
        hint: null
      };
      return $attrs.$observe('hint', function(value){
        $element.mouseover(function(){
          var offset, width, left;
          offset = $element.offset();
          width = 250;
          state.hint = $("<div>" + value + "</div>").css("position", "absolute").css("background", "gray").css("border-radius", "5px").css("width", width).css("box-sizing", "border-box").css("padding", "5px").css("text-align", "center").css("color", "white").css("z-index", "9999").css("opacity", "0").css("bottom", offset.bottom);
          state.hint.css("top", offset.top - state.hint.height() * 2);
          left = offset.left - width / 2;
          state.hint.css('left', Math.max(left, 0));
          state.hint.animate({
            opacity: 1
          }, 500);
          debug("mouseover", offset);
          return $(document.body).append(state.hint);
        });
        return $element.mouseout(function(){
          debug("mouseout");
          return state.hint.remove();
        });
      });
    }
  };
});