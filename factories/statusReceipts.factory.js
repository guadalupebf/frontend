(function () {

  'use-strict';

  var app = angular.module('inspinia');

  app.factory('statusReceiptsFactory', [function() {

    var status = {};

    status.receipts = function (parStatus) {

      switch (parseInt(parStatus)) {
        case 1:
          return'Pagado';
          break;
        case 2:
          return 'Cancelado';
          break;
        case 3:
          return 'Prorrogado';
          break;
        case 4:
          return'Pendiente de pago';
          break;
        case 5:
          return'Liquidado';
          break;
        case 6:
          return'Conciliado';
          break;
        case 7:
          return'Cerrado';
          break;
        case 8:
          return'Precancelado';
          break;
        case 9:
          return'Pago Parcial';
          break;
        case 10:
          return'Anulado';
          break;
        case 11:
          return'Pre-anulado';
          break;
        default:
          return 'Pendiente de pago';
      }
    };


    return status ;

  }]);

}());