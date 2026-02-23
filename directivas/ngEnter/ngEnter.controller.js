 var app = angular.module('inspinia')
 .directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind('keypress', function(e) {
                if (e.charCode === 13 || e.keyCode ===13 ) {
                  scope.$apply(attrs.ngEnter);
                }
            });
        };
    });