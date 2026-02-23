(function(angular) {
  'use strict';
  var app = angular.module('inspinia');
  app.directive('limitToDecimals', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelCtrl) {
        function fromUser(text) {
          if(text) {
            var transformedInput = text.toString().match(/^\d+(\.\d{0,4})?/);
            if (transformedInput) {
              transformedInput = transformedInput[0];
              ngModelCtrl.$setViewValue(transformedInput);
              ngModelCtrl.$render();
            }
            return parseFloat(transformedInput || 0);
          }
          return undefined;
        }            
        ngModelCtrl.$parsers.push(fromUser);
      }
    }; 
  });
})(window.angular);
