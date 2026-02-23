(function() {
    'use strict';

    var app = angular.module('inspinia');

    app.filter('fileName', function() {
        return function(input) {
            var urls = /[^/]+$/g;
            if (input.match(urls)) {
                input = input.substring((input.lastIndexOf('/') + 1), input.length);
            }
            return input;
        };
    });

    app.filter('receipts', function(statusReceipt) {
        return function(param) {
            if (param) {
                switch (param) {
                    case 1:
                        return statusReceipt[0].label;
                    case 2:
                        return statusReceipt[1].label;
                    case 3:
                        return statusReceipt[2].label;
                    case 4:
                        return statusReceipt[3].label;
                    case 5:
                        return statusReceipt[4].label;
                    case 6:
                        return statusReceipt[5].label;
                    case 7:
                        return statusReceipt[6].label;
                    case 8:
                        return statusReceipt[7].label;
                    case 10:
                        return statusReceipt[8].label;
                    case 11:
                        return statusReceipt[9].label;
                }
            }
        };
    });

    app.filter('endorsement', function(endorsement) {
        return function(param) {
            if (param) {
                switch (parseInt(param)) {
                    case 1:
                        return endorsement[0].label;
                    case 2:
                        return endorsement[1].label;
                    case 3:
                        return endorsement[2].label;
                    case 4:
                        return endorsement[3].label;
                    case 5:
                        return endorsement[4].label;
                    default:
                        return 'Error en su estado.'
                }

            }
        };
    });

    app.filter('payformtype', function(payform) {
        return function(param) {
            if (param) {
                switch (param) {
                    case 1:
                        return payform[0].label;
                    case 2:
                        return payform[1].label;
                    case 3:
                        return payform[2].label;
                    case 4:
                        return payform[3].label;
                    case 6:
                        return payform[4].label;
                    case 5:
                        return 'Contado';
                    case 12:
                        return payform[5].label;
                }
            }
        };
    });

    app.filter('order', function(ot) {
        return function(ot) {
            if (ot === '0') {
                return "Orden";
            }
        };
    });

    app.filter('policystatus', function(status) {
        return function(param) {
            switch (param) {
                case 1:
                    return status[0].label;
                case 2:
                    return status[1].label;
                case 10:
                    return status[2].label;
                case 11:
                    return status[3].label;
                case 12:
                    return status[4].label;
                case 13:
                    return status[5].label;
                case 14:
                    return status[6].label;
            }
        };
    });

    app.filter('relationship', function(status) {
        return function(param) {
            switch (param) {
                case 1:
                    return 'Titular';
                case 2:
                    return 'Conyuge';
                case 3:
                    return 'Hijo';
                default: 
                    return '';
            }
        };
    });


    app.filter('curr_rate_options', function(curr_rate_options) {
        return function(param) {
            switch (param) {
                case 1:
                    return curr_rate_options[0].label;
                case 2:
                    return curr_rate_options[1].label;
                case 3:
                    return curr_rate_options[2].label;
                case 4:
                    return curr_rate_options[3].label;
                case 5:
                    return curr_rate_options[4].label;
            }
        };
    });

    app.filter('capitalize', function() {
      return function(input, scope) {
        if (!input){
          return input;
        }
        input = input.toLowerCase();
        return input.substring(0,1).toUpperCase()+input.substring(1);
      }
    });

    app.filter('percentage', function() {
      return function (input) {
        return input + '%';
      };
    });

})();
