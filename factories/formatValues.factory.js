(function () {

  'use-strict';

  var app = angular.module('inspinia');

  app.factory('formatValues', [function() {

    var values = {};

    values.currency = function (parValue) {

      if(parValue) {
        parValue = parValue.toString();

        if(parValue.search(/[A-Za-z]/g) > -1 || parValue.search(/[0-9]%/g) > -1) {
         
          return parValue;

        }  else {

          var num = parseFloat(parValue);
          var num_format = '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
      
          return num_format;
          // return parValue;

        }
      } 


    };

    return values;

  }]);

}());