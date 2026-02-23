var app = angular.module('inspinia')

.directive('formatCurrency', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$formatters.unshift(function (a) {

              if(ctrl.$modelValue) {

                if((ctrl.$modelValue).toString().search(/[A-Za-z]/g) > -1 || (ctrl.$modelValue).search(/[0-9]%/g) > -1 ) {
  
                  return  ctrl.$modelValue;

                } else {
                  var x = $filter('currency')(ctrl.$modelValue); 
   
                  if(isNaN(ctrl.$modelValue)) {
                    return ctrl.$modelValue;
                  } else {

                    return x;
                  }
                }
              }
            });

            elem.bind('blur', function(event) {
                
                var num = elem.val();
                
                if(num.search(/[A-Za-z]/g) > -1  || (ctrl.$modelValue).search(/[0-9]%/g) > -1 ) {
                  elem.val(ctrl.$modelValue);
                } else {
                  var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
                  elem.val($filter('currency')(plainNumber));
                }

            });
        }
    };
}])

.directive('currencyFormat', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$formatters.unshift(function (a) {

              if(ctrl.$modelValue) {

                if((ctrl.$modelValue).toString().search(/[A-Za-z]/g) > -1 || (ctrl.$modelValue).search(/[0-9]%/g) > -1 ) {
  
                  return  ctrl.$modelValue;

                } else {
                  var x = $filter('currency')(ctrl.$modelValue); 
   
                  if(isNaN(ctrl.$modelValue)) {
                    return ctrl.$modelValue;
                  } else {

                    return x;
                  }
                }
              }
            });

            elem.bind('keydown', function(event) {
              console.log('ok', elem.val());
                
                var num = elem.val();
                
                if(num.search(/[A-Za-z]/g) > -1  || (ctrl.$modelValue).search(/[0-9]%/g) > -1 ) {
                  elem.val(ctrl.$modelValue);
                } else {
                  var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
                  elem.val($filter('currency')(plainNumber));
                }

            });
        }
    };
}])
.directive('formatReceipt', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            console.log('attrs', attrs);

            ctrl.$formatters.unshift(function (a) {
              // return $filter('currency')(ctrl.$modelValue);
              elem.val($filter('currency')(ctrl.$modelValue));
            });

            // console.log('ctrl', ctrl);
            $(elem).change(function(event) {
              console.log('oki');
              var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
               elem.val($filter('currency')(plainNumber));
            });

            // elem.bind('keydown keyup', function(event) {

            //     console.log('asdadfad------', elem.val());

            //     var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
            //     elem.val($filter('currency')(plainNumber));
            // });
        }
    };
}])


.directive('format_currency_respaldo', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;

            ctrl.$formatters.unshift(function (a) {
                return $filter(attrs.format)(ctrl.$modelValue)
            });

            elem.bind('blur', function(event) {
                console.log('asdadfad------', elem.val());

                var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter(attrs.format)(plainNumber));
            });
        }
    };
}])



.directive('inputCurrency', [function () {

    return {
        restrict: 'EA',
        scope: {
          model : '=',
          ngdisabled : '=',
          ngHide : '=',
          change : '&',
          blur: '&'
        },
        template: '<input ng-hide = "ngHide" ng-blur="blur()" ng-disabled = "ngdisabled" class="form-control" ng-model="model"  ng-change="onChange(model)" type="text" ng-keypress="validateFloatKeyPress($event)">',
        link: function(scope, element, attrs) {

          scope.validateFloatKeyPress = function(evt) {
            if ( !isIntegerChar() ) {
              evt.preventDefault();
            }
              
            function isIntegerChar() {
              return /[0-9]|(\.)/.test(
                String.fromCharCode(evt.which))
            }

            var value = scope.model;

            scope.onChange = function(param){
              scope.change();
            };


            if(value) {
              var v = value.toString();
              var charCode = (evt.which) ? evt.which : event.keyCode;
              var number = v.split('.');
              var caratPos = number[0].length;
              if(number[1]) {
                var dotPos = number[1].length;
              }               
              
              // if( caratPos > dotPos && dotPos>-1 && (number[1].length > 1)){
              //   console.log('ok');
              //     evt.preventDefault();
              // }
                 
              if(dotPos) {
                if(dotPos == 2) {
                  if(caratPos) {
                    evt.preventDefault();
                  } else {
                    // console.log('ok');
                  }
                }
                
              } 
            }
          }
          // scope.calculateInputs = function(poliza){
          //   console.log('poliza',poliza)
          // }
        } // termina link
      } // termina return
    }]
);
