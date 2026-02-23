(function() {
    'use strict';

    angular.module('inspinia')
        .controller('ReporteOperacionController', ReporteOperacionController);

    ReporteOperacionController.$inject = ['statusReceipt','$localStorage', '$state', 'SweetAlert', 'MESSAGES', 'providerService','url', '$scope','$http', 'toaster', '$parse','exportFactory','$uibModal'];

    function ReporteOperacionController(statusReceipt,$localStorage, $state, SweetAlert, MESSAGES, providerService, url, $scope, $http, toaster, $parse, exportFactory,$uibModal) {
        $('.datepicker-me input').datepicker();

        $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
        $.fn.datepicker.defaults.startView = 0;
        $.fn.datepicker.defaults.autoclose = true;
        $.fn.datepicker.defaults.language = 'es';
        
        var vm = this;
        vm.Generar = Generar;
        vm.tableRes = {};
        vm.formatearNumero = formatearNumero;
        vm.form = {
            provider: 0, 
            ramo: 0,
            subramo: 0,
            since: convertDate(new Date()),
            until: convertDate(new Date()),
            created_at: convertDate(new Date()),
            payment: 0,
            status: 0,
            contratante: 0,
            group: 0,
            recibos_pagados : true,
            recibos_no_pagados: false,
            recibos_liquidados: false,
            recibos_conciliados: false,
            num_poliza: "",
            cve_agente: "",
            ot_rep: true,
            identifier : ""
        };
    if ($localStorage.url_operation == '/operacion.semanal') {
        vm.Generar(1,1,1)
    }else{
        $state.go('index.main');
    }
    $scope.showSpecific1_a = false;
    $scope.showSpecific1_b = false;
    $scope.showSpecific2_a = false;
    $scope.showSpecific2_b = false;
    $scope.showSpecific2_c = false;
    $scope.showSpecific2_d = false;
    $scope.showSpecific3_a = false;
    $scope.showSpecific3_b = false;
    $scope.showSpecific3_c = false;
    $scope.showSpecific4_a = false;
    $scope.showSpecific5_a = false;
    $scope.showSpecific5_b = false;
    $scope.showSpecific6_a = false;
    $scope.showSpecific6_b = false;
    $scope.showAll = true;

    $scope.status_rec = function (value){
        switch(value){
            case 1:
                return 'Pagado'
            case 2:
                return 'Cancelado'
            case 3:
                return 'Prorrogado'
            case 4:
                return 'Pendiente de pago'
            case 5:
                return 'Liquidado'
            case 6:
                return 'Conciliado'
            case 7:
                return 'Cerrado'
            case 0:
                return 'Desactivado'
            default:
                return 'Vencido'
        }
    }
    $scope.forma_pago = function (parValue) {
        switch (parValue) {
        case 1:
          return 'Mensual';
          break;
        case 2:
          return 'Bimestral';
          break;
        case 3:
          return 'Trimestral';
          break;
        case 5:
          return 'Contado';
          break;
        case 6:
          return 'Semestral';
          break;
        case 12:
          return 'Anual';
          break;
        case 24:
          return 'Quincenal';
          break;
        default:
          return 'No especificada';
        }
    }

    $scope.status = function (parValue) {

      switch (parValue) {
        case 1:
          return 'En trámite';
          break;
        case 2:
          return 'OT Cancelada';
          break;
        case 4:
          return 'Precancelada';
          break;
        case 10:
          return 'Por iniciar';
          break;
        case 11:
          return 'Cancelada';
          break;
        case 12:
          return 'Renovada';
          break;
        case 13:
          return 'Vencida';
          break;
        case 14:
          return 'Vigente';
          break;
        case 15:
          return 'No renovada';
          break;
        default:
          return 'Pendiente';
      }
    }
    $scope.status_sin = function(parSttaus) {
        switch(parSttaus) {
          case 1:
            return "Pendiente";
            break;
          case 2:
            return "En trámite";
            break;
          case 3:
            return "Completado";
            break;
          case 4:
            return "Cancelado";
            break;
          case 5:
            return "Rechazado";
            break;
          case 6:
            return "En espera";
            break;
        }
    }

    $scope.status_endoso = function(parSttaus) {
        switch(parSttaus) {
          case 1:
            return "Pendiente";
            break;
          case 2:
            return "Registrado";
            break;
          case 3:
            return "Rechazado";
            break;
          case 4:
            return "Cancelado";
            break;
          case 5:
            return "En trámite";
            break;
        }
    }

    $scope.status_fianza = function (parValue) {

        switch (parValue) {
          case 1:
            return 'En trámite';
            break;
          case 2:
            return 'OT Cancelada';
            break;
          case 10:
            return 'Por iniciar';
            break;
          case 11:
            return 'Cancelada';
            break;
          case 12:
            return 'Anulada';
            break;
          case 13:
            return 'Rechazada';
            break;
          case 14:
            return 'Vigente';
            break;
          case 15:
            return 'Renovada';
            break;
          default:
            return '';
        }
    }



      function formatearNumero(nStr) {
          nStr += '';
          var x = nStr.split('.');
          var x1 = x[0];
          var x2 = x.length > 1 ? '.' + x[1] : '';
          var rgx = /(\d+)(\d{3})/;
          while (rgx.test(x1)) {
                  x1 = x1.replace(rgx, '$1' + ',' + '$2');
          }

          return x1 + x2;
      }


    activate();

    function toDate(dateStr) {
      var dateString = dateStr;
      var dateParts = dateString.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

      return dateObject;
    }

    function convertDate(inputFormat) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    }

    function activate(){
        vm.Generar(1,1);
    }



    $scope.showButtonExcel = false;

    function Generar(tipo) {
        var since = toDate(vm.form.since).getTime();
        var until = toDate(vm.form.until).getTime();
        var created_at = toDate(vm.form.created_at).getTime();
        var diff = until - since;
        var antiguedad = parseInt(diff/(1000*60*60*24))

        var fecha=new Date();
        var lunes_pasado =new Date(fecha.getTime() - (24*60*60*1000)*7);
        var viernes_pasado =new Date(fecha.getTime() + (24*60*60*1000)*7);
        var dias = new Array('Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado')
        var day  = dias[fecha.getDay()]
        var hoy=new Date();
        // Milisegundos de 4 días mas
        var suma4dias= 4*24*60*60*1000; 
        var fecha_lunes = lunes_pasado.getTime()+(4*24*60*60*1000);
        var viernes_pasado = new Date(fecha_lunes);

        if (day == 'Lunes') {
            var date_lunes = lunes_pasado;
            var date_viernes = viernes_pasado;
        }else{
            var date_lunes = lunes_pasado;
            var date_viernes = viernes_pasado;
        }

        var params = {
            since: lunes_pasado ? convertDate(lunes_pasado): vm.form.si,
            until: viernes_pasado ? convertDate(viernes_pasado) : vm.form.un,
            tipo: tipo ? tipo : 1,
        }
        params.since = params.since+ " " + "00:00:00";
        params.until = params.until+ " " + "23:59:59";
        $scope.filtros = params;
        $http({
        method: 'POST',
        url: url.IP + 'reporte-operacion/',
        data: params
        }).then(function success(response) {
        if(response.status == 200 || response.status ==201){
            vm.resultados = response.data
            $scope.showButtonExcel = true;
        }else{
            toaster.warning("Error en la llamada registros");
        }
        })
    }


    $scope.exportData = function (param){
    
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        if (param == 1) {
            $http({
              method: 'POST', 
              url: url.IP +'reporte-operacion-excel' ,
              data: $scope.filtros,
              headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
              responseType: "arraybuffer"})
            .then(function(data, status, headers, config) {
              if(data.status == 200){
                l.stop();
                var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                saveAs(blob, 'Reporte_Operacion.xls');
              } else {
                toaster.error("Error", "Ha ocurrido un error al descargar el reporte", "error")
                l.stop()
              }
            });
        }
    }
    
    $scope.specificShow = function (tipo,categoria){        
        switch(tipo){
            case 1:
                if (categoria == 1) {   
                    $scope.showAll = false;                 
                    $scope.showSpecific1_a = true;
                    $scope.showSpecific1_b = false;
                }else if (categoria == 2) {   
                    $scope.showAll = false;     
                    $scope.showSpecific1_b = true;       
                    $scope.showSpecific1_a = false;                   
                }
                break;
            case 2:
                if (categoria == 1) {   
                    $scope.showAll = false;
                    $scope.showSpecific2_a = true;
                    $scope.showSpecific2_b = false;
                    $scope.showSpecific2_c = false;
                    $scope.showSpecific2_d = false;
                }else if (categoria == 2) {   
                    $scope.showAll = false;                    
                    $scope.showSpecific2_a = false;
                    $scope.showSpecific2_b = true;
                    $scope.showSpecific2_c = false;
                    $scope.showSpecific2_d = false;
                }else if (categoria == 3) {   
                    $scope.showAll = false;                    
                    $scope.showSpecific2_a = false;
                    $scope.showSpecific2_b = false;
                    $scope.showSpecific2_c = true;
                    $scope.showSpecific2_d = false;
                }else if (categoria == 4) {   
                    $scope.showAll = false;
                    $scope.showSpecific2_a = false;
                    $scope.showSpecific2_b = false;
                    $scope.showSpecific2_c = false;
                    $scope.showSpecific2_d = true;
                }
                break;
            case 3:
                if (categoria == 1) {   
                    $scope.showAll = false;                    
                    $scope.showSpecific3_a = true;
                    $scope.showSpecific3_b = false;
                    $scope.showSpecific3_c = false;
                }else if (categoria == 2) {   
                    $scope.showAll = false;                                    
                    $scope.showSpecific3_a = false;
                    $scope.showSpecific3_b = true;
                    $scope.showSpecific3_c = false;
                }else if (categoria == 3) {   
                    $scope.showAll = false;                                    
                    $scope.showSpecific3_a = false;
                    $scope.showSpecific3_b = false;
                    $scope.showSpecific3_c = true;
                }
                break;
            case 4:
                if (categoria == 1) {   
                    $scope.showAll = false;                    
                    $scope.showSpecific4_a = true;
                }
            case 5:
                if (categoria == 1) {   
                    $scope.showAll = false;                    
                    $scope.showSpecific5_a = true;
                    $scope.showSpecific5_b = false;
                }else if (categoria == 2) {   
                    $scope.showAll = false;                    
                    $scope.showSpecific5_a = false;
                    $scope.showSpecific5_b = true;
                }
                break;
            case 6:
                if (categoria == 1) {    
                    $scope.showAll = false;                   
                    $scope.showSpecific6_a = true;
                    $scope.showSpecific6_b = false;
                }else if (categoria == 2) {    
                    $scope.showAll = false;                   
                    $scope.showSpecific6_a = false;
                    $scope.showSpecific6_b = true;
                }
                break;
            default:
                $scope.showAll = true;
                break;
        }
    }

     
    $scope.status = function (parValue) {
        switch (parValue) {
          case 1:
            return 'En trámite';
            break;
          case 2:
            return 'OT Cancelada';
            break;
          case 4:
            return 'Precancelada';
            break;
          case 10:
            return 'Por iniciar';
            break;
          case 11:
            return 'Cancelada';
            break;
          case 12:
            return 'Renovada';
            break;
          case 13:
            return 'Vencida';
            break;
          case 14:
            return 'Vigente';
            break;
          case 15:
            return 'No renovada';
            break;
          default:
            return 'Pendiente';
        }
    }

    }
})();