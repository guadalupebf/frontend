(function () {

  'use-strict';

  var app = angular.module('inspinia');

  app.factory('priceFactory', [function() {

    var valor = {};

    valor.decimales = function (value){
      var RE = /^\d*(\.\d{1})?\d{0,1}$/;
      if (RE.test(value)){
        return false;
      }
      else{
        return true;
      }
    };

    valor.comas = function (value){
      value = value.toString();
      if(value.indexOf(',') != -1){
        return true;
      }
      else{
        return false;
      }
    };

    return valor;

  }]);

}());