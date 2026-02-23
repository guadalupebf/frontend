var app = angular.module('inspinia')
.directive('receiptsEndorsement', ['MESSAGES', 'SweetAlert', '$location', '$sessionStorage',
  function ( MESSAGES, SweetAlert, $location, $sessionStorage) {

    return {
      restrict: 'EA',
      scope: {
        form: '=',
        tosave: '=',
        type: '='
      },
      templateUrl: 'app/directivas/calculateReceipts/receiptsEndorsement.html',
      link: function(scope, element, $watch, attrs) {

        // Variables
        scope.comision_seleccion = "";
        scope.accesos = $sessionStorage.permisos;
        if (scope.accesos) {          
          scope.accesos.forEach(function(perm){
            if(perm.model_name == 'Comisiones'){
              scope.acceso_dash = perm
              scope.acceso_dash.permissions.forEach(function(acc){
                if (acc.permission_name == 'Comisiones') {
                  if (acc.checked == true) {
                    scope.permiso_comisiones = true
                  }else{
                    scope.permiso_comisiones = false
                  }
                }
              })
            }
            if(perm.model_name == 'Cobranza'){
              scope.acceso_dash = perm
              scope.acceso_dash.permissions.forEach(function(acc){
                if (acc.permission_name == 'Eliminar recibos') {
                  if (acc.checked == true) {
                    scope.permiso_delRecibo = true
                  }else{
                    scope.permiso_delRecibo = false
                  }
                }
              })
            }
            if(perm.model_name == 'Pólizas'){
              scope.acceso_dash = perm
              scope.acceso_dash.permissions.forEach(function(acc){
                if (acc.permission_name == 'Comisión no obligatoria') {
                  if (acc.checked == true) {
                    scope.permiso_comision_no_obligatoria = true
                  }else{
                    scope.permiso_comision_no_obligatoria = false
                  }
                }
              })
            }
          })
        }
        scope.datareceipt = {
          'primaNeta': 0,
          'rpf': 0,
          'derecho': 0,
          'subTotal': 0,
          'iva': null,
          'primaTotal': 0,
          'comision': 0
        };

        scope.option_descuento = [
          {'name': '$', 'value': 1},
          {'name': '%', 'value': 2}
        ];
        scope.tipo_descuento = scope.option_descuento[0];

        scope.option_rpf = [
          {'name': '$', 'value': 1},
          {'name': '%', 'value': 2}
        ];
        scope.tipo_rpf = scope.option_rpf[0];

        scope.option_iva = [
          {'name': '$', 'value': 1},
          {'name': '%', 'value': 2}
        ];
        scope.tipo_iva = scope.option_iva[0];

        var agregar_comision = 0;

        var valor_primaNeta;
        var valor_descuento;
        var valor_rpf;
        var valor_derecho;
        var valor_iva;
        var valor_prima_descuento;
        var valor_comision;
        var valor_suma_comision;

        var copy_primaNeta = 0;
        var copy_rpf = 0;
        var copy_subTotal = 0;

        scope.newPrima = {};
        scope.todos_prima = [0];
        scope.todos_subtotal = [0];

        scope.mostrarPrimerRecibo = false;
        scope.mostrarTodosRecibo = false;
        scope.editar_recibos = false;

        scope.editar = false;
        scope.recalcular = true;
        
        scope.obj_rpf = null;

        scope.obj_rpf = null;

        scope.verComisiones = function(){
          var sin_comision = {
            'comission': '0',
            'comission_derecho': '0',
            'comission_rpf': '0',
            'derecho': '0',
            'efective_date': 'Sin fecha',
            'expire_date': null,
            'nombre': 'Sin comisión',
            'observations': '-',
            'others': '0',
            'others_derecho': '0',
            'others_rpf': '0',
            'periodo_inicial': 0,
            'periodo_subsecuente': 0,
            'ramo': '-',
            'rpf_mensual': '0',
            'rpf_bimestral': '0',
            'rpf_trimestral': '0',
            'rpf_trimestral': '0',
            'rpf_anual': '0',
            'subramo': '-',
            'udi': '0',
            'udi_derecho': '0',
            'udi_rpf': '0'
          }

          if(scope.form.comisiones){
            if(scope.form.subramo && agregar_comision == 0){
              scope.form.comisiones.push(sin_comision);
              agregar_comision++;
            }
          }else{
            if(scope.form.subramo && agregar_comision == 0){
              scope.form.comisiones = [];
              scope.form.comisiones.push(sin_comision);
              agregar_comision++;
            }
          }
        };

        // Asignar valores segun comision seleccionada
        scope.asignarValores = function(comission){
          scope.comission = comission;
          if((!scope.form.num_receipts && scope.type == 2) || (scope.form.num_receipts == "" && scope.type == 2)){
            scope.comision_seleccion = "";
            SweetAlert.swal("¡Error!", "Selecciona  un número de recibos.", "error");
            return;
          }else{
            if(!scope.editar){
              if(scope.type == 1){
                scope.datareceipt.num_receipts = 1;
                scope.datareceipt.payment = 12;
              }else{
                scope.datareceipt.num_receipts = scope.form.num_receipts;
                scope.datareceipt.payment = scope.form.payment;
              }
            }else{
              scope.numeroRecibos = scope.datareceipt.numeroRecibos;
              scope.recalcular = scope.tosave.recalcular;
            }

            scope.datareceipt.subramo = scope.form.subramo.subramo_name;

            scope.datareceipt.derecho = parseFloat(comission.derecho);
            scope.datareceipt.prima_comision = parseFloat(comission.comission);
            scope.datareceipt.rpf_comision = parseFloat(comission.comission_rpf);
            scope.datareceipt.derecho_comision = parseFloat(comission.comission_derecho);
            scope.datareceipt.periodo_inicial = parseFloat(comission.periodo_inicial);
            scope.datareceipt.periodo_subsecuente = parseFloat(comission.periodo_subsecuente);

            scope.calcularTotales();
          }
        };

        scope.porcentageRpf = function(){
          if(!scope.editar){
            if(scope.type == 1){
              scope.datareceipt.num_receipts = 1;
              scope.datareceipt.payment = 1;
            }else{
              scope.datareceipt.num_receipts = scope.form.num_receipts;
              scope.datareceipt.payment = scope.form.payment;
            }
          }else{
            scope.datareceipt.num_receipts = scope.form.num_receipts;
            scope.datareceipt.payment = scope.form.payment;
          }

          if(scope.type == 2){
            scope.datareceipt.percent_rpf = 3.5;
          }else{
            scope.datareceipt.percent_rpf = 3.5;

            // switch(parseFloat(scope.datareceipt.payment)){
            //   case 1:
            //     scope.datareceipt.percent_rpf = scope.comission.rpf_mensual;
            //     break;
            //   case 2:
            //     scope.datareceipt.percent_rpf = scope.comission.rpf_bimestral;
            //     break;
            //   case 3:
            //     scope.datareceipt.percent_rpf = scope.comission.rpf_trimestral;
            //     break;
            //   case 5:
            //     scope.datareceipt.percent_rpf = scope.comission.rpf_anual;
            //     break;
            //   case 6:
            //     scope.datareceipt.percent_rpf = scope.comission.rpf_semestral;
            //     break;
            //   case 12:
            //     scope.datareceipt.percent_rpf = scope.comission.rpf_anual;
            //     break;
            //   default:
            //     break;
            // }
          }
        };

        // Calcula pesos o porcetaje de rpf
        scope.calcularRpf = function(){
          if(scope.tipo_rpf.value == 2){
            if(scope.datareceipt.rpf != 0){
              scope.rpfPesos = (valor_prima_descuento * scope.datareceipt.rpf) / 100;
            }else{
              scope.rpfPesos = 0;
            }
          }else{
            if(scope.datareceipt.rpf != 0){
              scope.rpfPorcentaje = ((scope.datareceipt.rpf * 100) / valor_prima_descuento).toFixed(2);
            }else{
              scope.rpfPorcentaje = 0;
            }
          }
        };

        // Calcula pesos o porcetaje de iva
        scope.calcularIva = function(){
          if(scope.tipo_iva.value == 2){
            if(scope.datareceipt.iva != 0){
              scope.ivaPesos = (scope.datareceipt.subTotal * scope.datareceipt.iva) / 100; 
            }else{
              scope.ivaPesos = 0;
            }
          }else{
            if(scope.datareceipt.iva != 0){
              scope.ivaPorcentaje = ((scope.datareceipt.iva * 100) / scope.datareceipt.subTotal).toFixed(2); 
            }else{
              scope.ivaPorcentaje = 0;
            }
          }
        };

        // Calcula totales de las primas
        scope.calcularTotales = function(){
          if(!scope.datareceipt.primaNeta || scope.datareceipt.primaNeta == undefined){
            valor_primaNeta = 0;
          }else{
            valor_primaNeta = parseFloat(scope.datareceipt.primaNeta);
          }

          valor_prima_descuento = valor_primaNeta;
          scope.porcentageRpf();

          if(copy_primaNeta != scope.datareceipt.primaNeta){
            scope.datareceipt.rpf = parseFloat((valor_prima_descuento * (parseFloat(scope.datareceipt.percent_rpf) / 100)).toFixed(2));
            copy_rpf = angular.copy(scope.datareceipt.rpf)
          }else{
            if(scope.datareceipt.aplicarDescuento && copy_rpf == scope.datareceipt.rpf){
              scope.datareceipt.rpf = parseFloat((valor_prima_descuento * (parseFloat(scope.datareceipt.percent_rpf) / 100)).toFixed(2));
              copy_rpf = angular.copy(scope.datareceipt.rpf)
            }
          }

          if(!scope.datareceipt.rpf || scope.datareceipt.rpf == undefined){
            copy_primaNeta = angular.copy(scope.datareceipt.primaNeta);
            valor_rpf = 0;
          }else{
            if(scope.tipo_rpf.value == 2){
              if(scope.datareceipt.rpf > 100){
                if(scope.type == 1){
                  SweetAlert.swal('Error', 'El Derecho no puede ser mayor a 100%.', 'error');
                }else{
                  SweetAlert.swal('Error', 'El recargo por pago fraccionado no puede ser mayor a 100%.', 'error');
                }
                scope.datareceipt.rpf = 0;
                valor_rpf = 0;
              }else{
                valor_rpf = (valor_prima_descuento * scope.datareceipt.rpf) / 100;
              }
            }else{
              copy_primaNeta = angular.copy(scope.datareceipt.primaNeta);
              valor_rpf = scope.datareceipt.rpf;
            }
          }
          scope.calcularRpf();

          if(!scope.datareceipt.derecho || scope.datareceipt.derecho == undefined){
            valor_derecho = 0;
          }else{
            valor_derecho = parseFloat(scope.datareceipt.derecho);
          }

          scope.datareceipt.subTotal = parseFloat((valor_prima_descuento + valor_rpf + valor_derecho).toFixed(2));
          
          if(!scope.datareceipt.iva || scope.datareceipt.iva == undefined){
            scope.datareceipt.iva = parseFloat((scope.datareceipt.subTotal * 0.16).toFixed(2));
            valor_iva = scope.datareceipt.iva;
          }else{
            if(scope.tipo_iva.value == 2){
              if(scope.datareceipt.iva > 100){
                SweetAlert.swal('Error', 'El iva no puede ser mayor a 100%.', 'error');
                scope.datareceipt.iva = 0;
                valor_iva = 0;
              }else{
                valor_iva = (scope.datareceipt.subTotal * scope.datareceipt.iva) / 100;
              }
            }else{
              if(copy_subTotal == scope.datareceipt.subTotal){
                valor_iva = scope.datareceipt.iva;
              }else{
                copy_subTotal = angular.copy(scope.datareceipt.subTotal);
                scope.datareceipt.iva = parseFloat((scope.datareceipt.subTotal * 0.16).toFixed(2));
                valor_iva = scope.datareceipt.iva;
              }
            }
          }
          scope.calcularIva();

          scope.datareceipt.primaTotal = parseFloat((scope.datareceipt.subTotal + valor_iva).toFixed(2));
          // if(scope.datareceipt.prima_comision <= 0 || scope.datareceipt.prima_comision > 100 || scope.datareceipt.prima_comision == null){
          //   scope.datareceipt.prima_comision = 0;
          // }
          // if(scope.datareceipt.rpf_comision <= 0 || scope.datareceipt.rpf_comision > 100 || scope.datareceipt.rpf_comision == null){
          //   scope.datareceipt.rpf_comision = 0;
          // }
          // if(scope.datareceipt.derecho_comision <= 0 || scope.datareceipt.derecho_comision > 100 || scope.datareceipt.derecho_comision == null){
          //   scope.datareceipt.derecho_comision = 0;
          // }
          
          scope.valor_prima_comision = valor_prima_descuento * (scope.datareceipt.prima_comision / 100);
          scope.valor_rpf_comision = valor_rpf * (scope.datareceipt.rpf_comision / 100);
          scope.valor_derecho_comision = valor_derecho * (scope.datareceipt.derecho_comision / 100);

          valor_suma_comision = 0;
          scope.datareceipt.comision = 0;
          if(scope.valor_prima_comision != 0){
            scope.datareceipt.comision = parseFloat(scope.valor_prima_comision);
            valor_suma_comision = valor_prima_descuento;
          }
          if(scope.valor_rpf_comision != 0){
            scope.datareceipt.comision = scope.datareceipt.comision + parseFloat(scope.valor_rpf_comision);
            valor_suma_comision = valor_suma_comision + valor_rpf;
          }
          if(scope.valor_derecho_comision != 0){
            scope.datareceipt.comision = scope.datareceipt.comision + parseFloat(scope.valor_derecho_comision);
            valor_suma_comision = valor_suma_comision + valor_derecho;
          }

          scope.datareceipt.comision = parseFloat((scope.datareceipt.comision).toFixed(2));

          scope.comisionPorcentaje = ((scope.datareceipt.comision * 100) / valor_suma_comision).toFixed(2);

          if(scope.comisionPorcentaje == 'NaN'){
            scope.comisionPorcentaje = 0;
          }

          scope.tosave.comision = scope.datareceipt.comision;
          scope.tosave.comision_percent = scope.comisionPorcentaje;
        };

        // Calcula el porcentaje de la comisión
        scope.calcularComision = function(){
          scope.comisionPorcentaje = ((scope.datareceipt.comision * 100) / scope.datareceipt.subTotal).toFixed(2);
          scope.form.comision_percent = scope.comisionPorcentaje;
          scope.generarToSave();
        };

        // Calcula el primer recibo
        scope.calcularPrimerRecibo = function(){
          if (! scope.permiso_comision_no_obligatoria && !scope.form.is_fianza ){
            if(scope.datareceipt.prima_comision == 0 || scope.datareceipt.prima_comision == '0' || scope.datareceipt.prima_comision == ''){
              SweetAlert.swal("¡Error!", "La comisión de prima neta es obligatoria.", "error");
              scope.mostrarPrimerRecibo = false;
              return
            }
          } 


          if(!scope.comision_seleccion){
            SweetAlert.swal("¡Error!", "Debe elegir un valor de comisión.", "error");
            return;
          }

          if(scope.type == 1){
            scope.datareceipt.startDate = scope.form.startDate;
            scope.datareceipt.endingDate = scope.form.endingDate;
          }else{
            scope.datareceipt.startDate = scope.form.start_of_validity;
            scope.datareceipt.endingDate = scope.form.end_of_validity;
          }

          if(!scope.editar){
            if(scope.type == 1){
              scope.datareceipt.num_receipts = 1;
              scope.datareceipt.payment = 12;
            }else{
              scope.datareceipt.num_receipts = scope.form.num_receipts;
              scope.datareceipt.payment = scope.form.payment;
              scope.datareceipt.type_endorsement = scope.form.type_endorsement;
            }
          }else{
            if(scope.type == 1){
              scope.datareceipt.num_receipts = 1;
              scope.datareceipt.payment = 12;
            }else{
              scope.datareceipt.num_receipts = scope.form.num_receipts;
              scope.datareceipt.payment = scope.form.payment;
              scope.datareceipt.type_endorsement = scope.form.endorsement_type;
            }
          }

          if(scope.type == 2 && scope.datareceipt.type_endorsement == 'A'){
            scope.noteColor = {'color': 'inherit'};
          }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
            scope.noteColor = {'color': '#ff0000'};
          }

          scope.datareceipt.policy_days_duration = scope.form.policy_days_duration;

          scope.datareceipt.primaNeta = parseFloat(scope.datareceipt.primaNeta);
          scope.datareceipt.derecho = parseFloat(scope.datareceipt.derecho);
          scope.datareceipt.subTotal = parseFloat(scope.datareceipt.subTotal);
          scope.datareceipt.comision = parseFloat(scope.datareceipt.comision);

          if(scope.recalcular){
            switch(parseFloat(scope.datareceipt.payment)){
              case 1:
                scope.numeroRecibos = 12;
                break;
              case 2:
                scope.numeroRecibos = 6;
                break;
              case 3:
                scope.numeroRecibos = 4;
                break;
              case 5:
                scope.numeroRecibos = 1; //contado
                break;
              case 6:
                scope.numeroRecibos = 2;
                break;
              case 12:
                scope.numeroRecibos = 1; //anual
                break;
              default:
                break;
            }

            if(scope.type == 1){
              scope.calcularRecibos(1);
            }else{
              if(scope.datareceipt.policy_days_duration <= 366){
                scope.calcularRecibosCortos(1);
              }else if(scope.datareceipt.policy_days_duration > 366){
                scope.calcularRecibosCortos(1);
              }
            }
            if(scope.type = 1){
              scope.calcularSiguientesRecibos();
            }else{
              SweetAlert.swal('¡Atención!', 'Introduce las primas para el primer recibo, después genera los recibos subsecuentes.', 'warning');
            }
          }else{
            SweetAlert.swal('¡Error se modificaron primas!', 'Y existen recibos pagados, las primas de la póliza se podrán guardar pero cada recibo se deberá que modificar de manera manual desde la información.', 'error');
          }
        };

        // Recalcula el primer recibo
        scope.calcularTotalPrimerRecibo = function(){
          if(scope.todos_prima[0] == scope.datareceipt.receipts[0].prima_neta){
            scope.datareceipt.receipts[0].rpf = scope.datareceipt.receipts[0].rpf;
          }else{
            scope.todos_prima = [];
            scope.datareceipt.receipts.forEach(function(receipt){
              scope.todos_prima.push(receipt.prima_neta);
            });
            if(scope.obj_rpf != null){
              scope.datareceipt.receipts[0].rpf = scope.obj_rpf;
            }else{
              scope.datareceipt.receipts[0].rpf = scope.datareceipt.receipts[0].prima_neta * (((valor_rpf * 100) / scope.datareceipt.primaNeta) / 100);
            }
          }

          if(scope.datareceipt.receipts[0].derecho == null){
            scope.datareceipt.receipts[0].derecho = 0;
          }

          scope.datareceipt.receipts[0].sub_total = scope.datareceipt.receipts[0].prima_neta + scope.datareceipt.receipts[0].rpf +scope.datareceipt.receipts[0].derecho;
          
          if(scope.todos_subtotal[0] == scope.datareceipt.receipts[0].sub_total){
            scope.datareceipt.receipts[0].iva = scope.datareceipt.receipts[0].iva;
          }else{
            scope.todos_subtotal = [];
            scope.datareceipt.receipts.forEach(function(receipt){
              scope.todos_subtotal.push(receipt.sub_total);
            });
            scope.datareceipt.receipts[0].iva = scope.datareceipt.receipts[0].sub_total * (((valor_iva * 100) / scope.datareceipt.subTotal) / 100);
          }
          scope.datareceipt.receipts[0].prima_total = scope.datareceipt.receipts[0].sub_total + scope.datareceipt.receipts[0].iva;

          var comision_primer_recibo_prima = scope.datareceipt.receipts[0].prima_neta * (scope.datareceipt.prima_comision / 100);
          var comision_primer_recibo_rpf = scope.datareceipt.receipts[0].rpf * (scope.datareceipt.rpf_comision / 100);
          var comision_primer_recibo_derecho = scope.datareceipt.receipts[0].derecho * (scope.datareceipt.derecho_comision / 100);

          scope.datareceipt.receipts[0].comision = comision_primer_recibo_prima + comision_primer_recibo_rpf + comision_primer_recibo_derecho;

          scope.datareceipt.receipts[0].prima_neta = parseFloat((scope.datareceipt.receipts[0].prima_neta).toFixed(2));
          scope.datareceipt.receipts[0].rpf = parseFloat((scope.datareceipt.receipts[0].rpf).toFixed(2));
          scope.datareceipt.receipts[0].derecho = parseFloat((scope.datareceipt.receipts[0].derecho).toFixed(2));
          scope.datareceipt.receipts[0].sub_total = parseFloat((scope.datareceipt.receipts[0].sub_total).toFixed(2));
          scope.datareceipt.receipts[0].iva = parseFloat((scope.datareceipt.receipts[0].iva).toFixed(2));
          scope.datareceipt.receipts[0].prima_total = parseFloat((scope.datareceipt.receipts[0].prima_total).toFixed(2));
          scope.datareceipt.receipts[0].comision = parseFloat((scope.datareceipt.receipts[0].comision).toFixed(2));
        };

        // Calcula recibos subsecuentes con cambios en primer recibo
        scope.calcularSiguientesRecibos = function(){
          scope.firstReceipt = angular.copy(scope.datareceipt.receipts[0]);
 
          if(scope.datareceipt.primaNeta >= scope.datareceipt.receipts[0].prima_neta){
            if(scope.type == 2 && scope.datareceipt.type_endorsement == 'A'){
              scope.newPrima.primaNeta = scope.datareceipt.primaNeta - scope.datareceipt.receipts[0].prima_neta;
            }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
              scope.newPrima.primaNeta = scope.datareceipt.primaNeta + scope.datareceipt.receipts[0].prima_neta;
            }
          }else{
            if(scope.type == 1){
              scope.newPrima.primaNeta = 0;
            }else{
              SweetAlert.swal('Error', 'La prima neta del primer recibo es mayor a la prima neta de la póliza.', 'error');
              return;
            }
          }

          if(valor_rpf >= scope.datareceipt.receipts[0].rpf){
            if(scope.type == 2 && scope.datareceipt.type_endorsement == 'A'){
              scope.newPrima.rpf = valor_rpf - scope.datareceipt.receipts[0].rpf;
            }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
              scope.newPrima.rpf = valor_rpf + scope.datareceipt.receipts[0].rpf;
            }
          }else{
            if(scope.type == 1){
              scope.newPrima.rpf = 0;
            }else{
              SweetAlert.swal('Error', 'El RPF del primer recibo es mayor al RPF de la póliza.', 'error');
              return;
            }
          }

          if(scope.datareceipt.derecho >= scope.datareceipt.receipts[0].derecho){
            if(scope.type == 2 && scope.datareceipt.type_endorsement == 'A'){
              scope.newPrima.derecho = scope.datareceipt.derecho - scope.datareceipt.receipts[0].derecho;
            }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
              scope.newPrima.derecho = scope.datareceipt.derecho + scope.datareceipt.receipts[0].derecho;
            }
          }else{
            if(scope.type == 1){
              scope.newPrima.derech = 0;
            }else{
              SweetAlert.swal('Error', 'El derecho del primer recibo es mayor al derecho de la póliza.', 'error');
              return;
            }
          }

          if(scope.datareceipt.subTotal >= scope.datareceipt.receipts[0].sub_total){
            if(scope.type == 2 && scope.datareceipt.type_endorsement == 'A'){
              scope.newPrima.subTotal = scope.datareceipt.subTotal - scope.datareceipt.receipts[0].sub_total;
            }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
              scope.newPrima.subTotal = scope.datareceipt.subTotal + scope.datareceipt.receipts[0].sub_total;
            }
          }else{
            scope.newPrima.subTotal = 0;
          }

          if(valor_iva >= scope.datareceipt.receipts[0].iva){
            if(scope.type == 2 && scope.datareceipt.type_endorsement == 'A'){
              scope.newPrima.iva = valor_iva - scope.datareceipt.receipts[0].iva;
            }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
              scope.newPrima.iva = valor_iva + scope.datareceipt.receipts[0].iva;
            }
          }else{
            if(scope.type == 1){
              scope.newPrima.iva = 0;
            }else{
              SweetAlert.swal('Error', 'El iva del primer recibo es mayor al iva de la póliza.', 'error');
              return;
            }
          }

          if(scope.datareceipt.primaTotal >= scope.datareceipt.receipts[0].prima_total){
            if(scope.type == 2 && scope.datareceipt.type_endorsement == 'A'){
              scope.newPrima.primaTotal = scope.datareceipt.primaTotal - scope.datareceipt.receipts[0].prima_total;
            }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
              scope.newPrima.primaTotal = scope.datareceipt.primaTotal + scope.datareceipt.receipts[0].prima_total;
            }
          }else{
            if(scope.type == 1){
              scope.newPrima.primaTotal = 0;
            }else{
              SweetAlert.swal('Error', 'La prima total del primer recibo es mayor a la prima total de la póliza.', 'error');
              return;
            }
          }

          if(scope.datareceipt.comision >= scope.datareceipt.receipts[0].comision){
            if(scope.type == 2 && scope.datareceipt.type_endorsement == 'A'){
              scope.newPrima.comision = scope.datareceipt.comision - scope.datareceipt.receipts[0].comision;
            }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
              scope.newPrima.comision = scope.datareceipt.comision + scope.datareceipt.receipts[0].comision;
            }
          }else{
            scope.newPrima.comision = 0;
          }

          if(scope.type == 1){
            scope.calcularRecibos(2);
          }else{
            if(scope.datareceipt.policy_days_duration <= 366){
              scope.calcularRecibosCortos(2);
            }else if(scope.datareceipt.policy_days_duration > 366){
              scope.calcularRecibosCortos(2);
            }
          }
        };

        // Calcula recibos de menos de un año de vigencia
        scope.calcularRecibosCortos = function(value){
          scope.datareceipt.receipts = [];

          scope.nuevoNumeroRecibos = angular.copy(scope.numeroRecibos);

          var recibos_fracionados = (scope.datareceipt.policy_days_duration * scope.numeroRecibos) / 366;
          var arreglo_recibos = (recibos_fracionados.toString()).split(".");
          var recibos_completos = parseFloat(arreglo_recibos[0]);
          if(arreglo_recibos[1] == undefined){
            arreglo_recibos[1] = 0;
          }
          var recibos_incompletos = '0.' + arreglo_recibos[1];
          recibos_incompletos = parseFloat(recibos_incompletos);

          if(scope.datareceipt.policy_days_duration > 366){
            scope.nuevoNumeroRecibos = angular.copy(recibos_completos);
          }

          if(scope.datareceipt.num_receipts < scope.nuevoNumeroRecibos){
            if(recibos_completos <= recibos_fracionados){
              scope.nuevoNumeroRecibos = recibos_completos + 1;
            }
            for(var j = scope.datareceipt.num_receipts; j < scope.nuevoNumeroRecibos; j++){
              recibos_incompletos = recibos_incompletos + 1;
              recibos_completos = recibos_completos - 1;
            }
          }

          if(recibos_incompletos == 0){
            recibos_incompletos = 1;
            recibos_completos = recibos_completos - 1;
          }

          if(value == 1){
            scope.obj = {
              prima_neta: (recibos_incompletos * scope.datareceipt.primaNeta) / recibos_fracionados,
              rpf: (valor_rpf ? (recibos_incompletos * valor_rpf) : 0) / recibos_fracionados,
              derecho: (scope.datareceipt.derecho ? (recibos_incompletos * scope.datareceipt.derecho) : 0) / recibos_fracionados,
              subTotal: (recibos_incompletos * scope.datareceipt.subTotal) / recibos_fracionados,
              iva: (valor_iva ? (recibos_incompletos * valor_iva) : 0) / recibos_fracionados,
              primaTotal: (scope.datareceipt.primaTotal ? (recibos_incompletos * scope.datareceipt.primaTotal) : 0) / recibos_fracionados,
              comision: (scope.datareceipt.comision ? (recibos_incompletos * scope.datareceipt.comision) : 0) / recibos_fracionados
            }

            if(scope.datareceipt.aplicarDescuento){
              scope.obj.prima_neta = (recibos_incompletos * valor_prima_descuento) / recibos_fracionados;
            }

            scope.mostrarPrimerRecibo = true;
            scope.mostrarTodosRecibo = false;
          }else{
            scope.obj = {
              prima_neta: scope.newPrima.primaNeta / recibos_completos,
              rpf: (scope.newPrima.rpf ? scope.newPrima.rpf : 0) / recibos_completos,
              derecho: (scope.newPrima.derecho ? scope.newPrima.derecho : 0) / recibos_completos,
              subTotal: scope.newPrima.subTotal / recibos_completos,
              iva: (scope.newPrima.iva ? scope.newPrima.iva : 0) / recibos_completos,
              primaTotal: (scope.newPrima.primaTotal ? scope.newPrima.primaTotal : 0) / recibos_completos,
              comision: (scope.newPrima.comision ? scope.newPrima.comision : 0) / recibos_completos
            }

            if(scope.datareceipt.aplicarDescuento){
              scope.obj.prima_neta = (scope.newPrima.primaNeta - valor_descuento) / recibos_completos;
            }

            scope.mostrarPrimerRecibo = false;
            scope.mostrarTodosRecibo = true;

            if(recibos_completos <= recibos_fracionados){
              scope.numeroRecibos = recibos_completos + 1;
            }
          }

          for(var i = 0; i < scope.numeroRecibos; i++){
            if(scope.datareceipt.aplicarDerecho){
              if(i === 0){
                if(scope.datareceipt.derecho){
                  scope.obj.derecho = parseFloat(scope.datareceipt.derecho);
                }else{
                  scope.obj.derecho = 0;
                }
              }else{
                scope.obj.derecho = 0;
              }
            }

            if(scope.datareceipt.aplicarRpf){
              if(i === 0) {
                if(scope.datareceipt.rpf){
                  scope.obj.rpf = parseFloat(scope.datareceipt.rpf);
                }else{
                  scope.obj.rpf = 0;
                }
              }else{
                scope.obj.rpf = 0;
              }
            }

            if(scope.type == 1){
              var receipt = {
                'recibo_numero': i + 1,
                'prima_neta': parseFloat((scope.obj.prima_neta).toFixed(2)),
                'rpf': parseFloat((scope.obj.rpf).toFixed(2)),
                'derecho': parseFloat((scope.obj.derecho).toFixed(2)),
                'iva': parseFloat((scope.obj.iva).toFixed(2)),
                'sub_total': parseFloat((scope.obj.subTotal).toFixed(2)),
                'prima_total': parseFloat((scope.obj.primaTotal).toFixed(2)),
                'comision': parseFloat((scope.obj.comision).toFixed(2)),
                'receipt_type': 1,
                'delivered': false,
                'startDate': scope.obtenerVigenciaInicialCorta(i, recibos_completos),
                'endingDate': scope.obtenerVigenciaFinalCorta(recibos_completos)
              };
            }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'A'){
              var receipt = {
                'recibo_numero': i + 1,
                'prima_neta': parseFloat((scope.obj.prima_neta).toFixed(2)),
                'rpf': parseFloat((scope.obj.rpf).toFixed(2)),
                'derecho': parseFloat((scope.obj.derecho).toFixed(2)),
                'iva': parseFloat((scope.obj.iva).toFixed(2)),
                'sub_total': parseFloat((scope.obj.subTotal).toFixed(2)),
                'prima_total': parseFloat((scope.obj.primaTotal).toFixed(2)),
                'comision': parseFloat((scope.obj.comision).toFixed(2)),
                'receipt_type': 2,
                'delivered': false,
                'startDate': scope.obtenerVigenciaInicialCorta(i, recibos_completos),
                'endingDate': scope.obtenerVigenciaFinalCorta(recibos_completos)
              };
            }else if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
              var receipt = {
                'recibo_numero': i + 1,
                'prima_neta': parseFloat((scope.obj.prima_neta).toFixed(2)) * -1,
                'rpf': parseFloat((scope.obj.rpf).toFixed(2)) * -1,
                'derecho': parseFloat((scope.obj.derecho).toFixed(2)) * -1,
                'iva': parseFloat((scope.obj.iva).toFixed(2)) * -1,
                'sub_total': parseFloat((scope.obj.subTotal).toFixed(2)) * -1,
                'prima_total': parseFloat((scope.obj.primaTotal).toFixed(2)) * -1,
                'comision': parseFloat((scope.obj.comision).toFixed(2)) * -1,
                'receipt_type': 3,
                'delivered': false,
                'startDate': scope.obtenerVigenciaInicialCorta(i, recibos_completos),
                'endingDate': scope.obtenerVigenciaFinalCorta(recibos_completos)
              };
            }

            receipt.vencimiento = scope.obtenerVencimiento(i, receipt.startDate);

            scope.datareceipt.receipts.push(angular.copy(receipt));

            recibos_completos--;
          }

          if(value == 2){
            scope.datareceipt.receipts[0] = scope.firstReceipt;
          }

          scope.generarToSave(value);
        };

        // Calcula recibos de un año de vigencia
        scope.calcularRecibos = function(value){
          scope.datareceipt.receipts = [];

          scope.numeroRecibosNuevos = scope.numeroRecibos - 1;
          if(scope.numeroRecibosNuevos < 1){
            scope.numeroRecibosNuevos = 1;
          }

          if(value == 1){
            scope.obj = {
              prima_neta: scope.datareceipt.primaNeta / scope.numeroRecibos,
              rpf: (valor_rpf ? valor_rpf : 0) / scope.numeroRecibos,
              derecho: (scope.datareceipt.derecho ? scope.datareceipt.derecho : 0) / scope.numeroRecibos,
              subTotal: scope.datareceipt.subTotal / scope.numeroRecibos,
              iva: (valor_iva ? valor_iva : 0) / scope.numeroRecibos,
              primaTotal: (scope.datareceipt.primaTotal ? scope.datareceipt.primaTotal : 0) / scope.numeroRecibos,
              comision: (scope.datareceipt.comision ? scope.datareceipt.comision : 0) / scope.numeroRecibos
            }

            if(scope.datareceipt.aplicarDescuento){
              scope.obj.prima_neta = valor_prima_descuento / scope.numeroRecibos;
            }

            scope.mostrarPrimerRecibo = true;
            scope.mostrarTodosRecibo = false;
          }else{
            scope.obj = {
              prima_neta: scope.newPrima.primaNeta / scope.numeroRecibosNuevos,
              rpf: (scope.newPrima.rpf ? scope.newPrima.rpf : 0) / scope.numeroRecibosNuevos,
              derecho: (scope.newPrima.derecho ? scope.newPrima.derecho : 0) / scope.numeroRecibosNuevos,
              subTotal: scope.newPrima.subTotal / scope.numeroRecibosNuevos,
              iva: (scope.newPrima.iva ? scope.newPrima.iva : 0) / scope.numeroRecibosNuevos,
              primaTotal: (scope.newPrima.primaTotal ? scope.newPrima.primaTotal : 0) / scope.numeroRecibosNuevos,
              comision: (scope.newPrima.comision ? scope.newPrima.comision : 0) / scope.numeroRecibosNuevos
            }

            if(scope.datareceipt.aplicarDescuento){
              scope.obj.prima_neta = (scope.newPrima.primaNeta - valor_descuento) / scope.numeroRecibosNuevos;
            }

            scope.mostrarPrimerRecibo = false;
            scope.mostrarTodosRecibo = true;
          }

          for(var i = 0; i < scope.numeroRecibos; i++){
            if(scope.datareceipt.aplicarDerecho){
              if(i === 0){
                if(scope.datareceipt.derecho){
                  scope.obj.derecho = parseFloat(scope.datareceipt.derecho);
                }else{
                  scope.obj.derecho = 0;
                }
              }else{
                scope.obj.derecho = 0;
              }
            }

            if(scope.datareceipt.aplicarRpf){
              if(i === 0){
                if(scope.datareceipt.rpf){
                  scope.obj.rpf = parseFloat(scope.datareceipt.rpf);
                }else{
                  scope.obj.rpf = 0;
                }
              }else{
                scope.obj.rpf = 0;
              }
            }

            var receipt = {
              'recibo_numero': i + 1,
              'prima_neta': parseFloat((scope.obj.prima_neta).toFixed(2)),
              'rpf': parseFloat((scope.obj.rpf).toFixed(2)),
              'derecho': parseFloat((scope.obj.derecho).toFixed(2)),
              'iva': parseFloat((scope.obj.iva).toFixed(2)),
              'sub_total': parseFloat((scope.obj.subTotal).toFixed(2)),
              'prima_total': parseFloat((scope.obj.primaTotal).toFixed(2)),
              'comision': parseFloat((scope.obj.comision).toFixed(2)),
              'receipt_type': 1,
              'delivered': false,
              'startDate': scope.obtenerVigenciaInicial(i),
              'endingDate': scope.obtenerVigenciaFinal(i),
            };

            receipt.vencimiento = scope.obtenerVencimiento(i, receipt.startDate);

            scope.datareceipt.receipts.push(angular.copy(receipt));
          }

          if(value == 2){
            scope.datareceipt.receipts[0] = scope.firstReceipt;
          }
          scope.generarToSave(value);
        };

        // Calcula recibos de mas de año de vigencia
        scope.calcularRecibosMultianuales = function(value){
          scope.datareceipt.receipts = [];

          if(!scope.datareceipt.startDate){
            scope.datareceipt.startDate = scope.form.startDate;
            scope.datareceipt.endingDate = scope.form.endingDate;
          }

          var date_initial = (scope.datareceipt.startDate).split('/');
          var date_final = (scope.datareceipt.endingDate).split('/');
          var anio_initial = parseInt(date_initial[2]);
          var anio_final = parseInt(date_final[2]);
          var total_anios = anio_final - anio_initial;

          scope.numeroRecibosAnios = scope.numeroRecibos * total_anios;

          scope.numeroRecibosAniosNuevos = scope.numeroRecibosAnios - 1;
          if(scope.numeroRecibosAniosNuevos < 1){
            scope.numeroRecibosAniosNuevos = 1;
          }

          if(value == 1){
            scope.obj = {
              prima_neta: scope.datareceipt.primaNeta / scope.numeroRecibosAnios,
              rpf: (valor_rpf ? valor_rpf : 0) / scope.numeroRecibosAnios,
              derecho: (scope.datareceipt.derecho ? scope.datareceipt.derecho : 0) / scope.numeroRecibosAnios,
              subTotal: scope.datareceipt.subTotal / scope.numeroRecibosAnios,
              iva: (valor_iva ? valor_iva : 0) / scope.numeroRecibosAnios,
              primaTotal: (scope.datareceipt.primaTotal ? scope.datareceipt.primaTotal : 0) / scope.numeroRecibosAnios,
              comision: (scope.datareceipt.comision ? scope.datareceipt.comision : 0) / scope.numeroRecibosAnios
            }

            if(scope.datareceipt.aplicarDescuento){
              scope.obj.prima_neta = valor_prima_descuento / scope.numeroRecibosAnios;
            }

            scope.mostrarPrimerRecibo = true;
            scope.mostrarTodosRecibo = false;
          }else{
            scope.obj = {
              prima_neta: scope.newPrima.primaNeta / scope.numeroRecibosAniosNuevos,
              rpf: (scope.newPrima.rpf ? scope.newPrima.rpf : 0) / scope.numeroRecibosAniosNuevos,
              derecho: (scope.newPrima.derecho ? scope.newPrima.derecho : 0) / scope.numeroRecibosAniosNuevos,
              subTotal: scope.newPrima.subTotal / scope.numeroRecibosAniosNuevos,
              iva: (scope.newPrima.iva ? scope.newPrima.iva : 0) / scope.numeroRecibosAniosNuevos,
              primaTotal: (scope.newPrima.primaTotal ? scope.newPrima.primaTotal : 0) / scope.numeroRecibosAniosNuevos,
              comision: (scope.newPrima.comision ? scope.newPrima.comision : 0) / scope.numeroRecibosAniosNuevos
            }

            if(scope.datareceipt.aplicarDescuento){
              scope.obj.prima_neta = (scope.newPrima.primaNeta - valor_descuento) / scope.numeroRecibosAniosNuevos;
            }

            scope.mostrarPrimerRecibo = false;
            scope.mostrarTodosRecibo = true;
          }

          var j = 0;
          var index_anual = 0;
          var numero_anio = 0;

          for(var i = 0; i < scope.numeroRecibosAnios; i++){
            if(scope.datareceipt.aplicarDerecho){
              if(i === 0){
                if(scope.datareceipt.derecho){
                  scope.obj.derecho = parseFloat(scope.datareceipt.derecho);
                }else{
                  scope.obj.derecho = 0;
                }
              }else{
                scope.obj.derecho = 0;
              }
            }

            if(scope.datareceipt.aplicarRpf){
              if(i === 0) {
                if(scope.datareceipt.rpf){
                  scope.obj.rpf = parseFloat(scope.datareceipt.rpf);
                }else{
                  scope.obj.rpf = 0;
                }
              }else{
                scope.obj.rpf = 0;
              }
            }

            if(scope.datareceipt.fy){
              if(i >= scope.numeroRecibos){
                scope.obj = {
                  prima_neta: 0,
                  rpf: 0,
                  derecho: 0,
                  subTotal: 0,
                  iva: 0,
                  primaTotal: 0,
                  comision: 0
                }
              }
            }

            if(j >= scope.numeroRecibos){
              j = 1;
            }else{
              j++;
            }

            var receipt = {
              'recibo_numero': j,
              'prima_neta': parseFloat((scope.obj.prima_neta).toFixed(2)),
              'rpf': parseFloat((scope.obj.rpf).toFixed(2)),
              'derecho': parseFloat((scope.obj.derecho).toFixed(2)),
              'iva': parseFloat((scope.obj.iva).toFixed(2)),
              'sub_total': parseFloat((scope.obj.subTotal).toFixed(2)),
              'prima_total': parseFloat((scope.obj.primaTotal).toFixed(2)),
              'comision': parseFloat((scope.obj.comision).toFixed(2)),
              'receipt_type': 1,
              'delivered': false,
              'startDate': scope.obtenerVigenciaInicialMultianual(index_anual, numero_anio),
              'endingDate': scope.obtenerVigenciaFinalMultianual(index_anual, numero_anio)
            };

            receipt.vencimiento = scope.obtenerVencimiento(i, receipt.startDate);

            scope.datareceipt.receipts.push(angular.copy(receipt));

            index_anual++;
            if(index_anual >= scope.numeroRecibos){
              index_anual = 0;
              numero_anio++;
            }
          }

          if(value == 2){
            scope.datareceipt.receipts[0] = scope.firstReceipt;
          }

          scope.generarToSave(value);
        };

        // Calcula las fechas de inicio de los recibos menores de un año de vigencia
        scope.obtenerVigenciaInicialCorta = function(index, value){
          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);

          if(parseFloat(scope.datareceipt.payment) == 5){
            var date_initial = (scope.datareceipt.startDate).split('/');
            var anio = parseInt(date_initial[2]);
          }

          mes = mes - ((value + 1) * parseFloat(scope.datareceipt.payment));

          if(mes < 0){
            mes = mes + 12;
            anio = anio - 1;
          }else if(mes == 0){
            mes = 12;
            anio = anio - 1;
          }

          if(index == 0){
            date_initial = (scope.datareceipt.startDate).split('/');
            dia = parseInt(date_initial[0]);
            mes = parseInt(date_initial[1]);
            anio = parseInt(date_initial[2]);
          }

          if(dia == 31){
            if(mes == 4 || mes == 6 || mes == 9 || mes == 11){
              dia = 30;
            }else if(mes == 2){
              dia = 28;
            }
          }

          if(dia > 28 && mes == 2){
            dia = 28;
          }

          if(dia.toString().length == 1){
            dia = '0' + dia;
          }

          if(mes.toString().length == 1){
            mes = '0' + mes;
          }

          return dia + '/' + mes + '/' + anio;
        };

        // Calcula las fechas de inicio de los recibos con un año de vigencia
        scope.obtenerVigenciaInicial = function(index){
          var date_initial = (scope.datareceipt.startDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);

          mes = mes + (index * parseFloat(scope.datareceipt.payment));

          if(mes > 12){
            mes = mes - 12;
            anio = anio + 1;
          }

          if(dia == 31){
            if(mes == 4 || mes == 6 || mes == 9 || mes == 11){
              dia = 30;
            }else if(mes == 2){
              dia = 28;
            }
          }

          if(dia > 28 && mes == 2){
            dia = 28;
          }

          if(dia.toString().length == 1){
            dia = '0' + dia;
          }

          if(mes.toString().length == 1){
            mes = '0' + mes;
          }

          return dia + '/' + mes + '/' + anio;
        };

        // Calcula las fechas de inicio de los recibos con mayores de un año de vigencia
        scope.obtenerVigenciaInicialMultianual = function(value, number){
          var date_initial = (scope.datareceipt.startDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);

          mes = mes + (value * parseFloat(scope.datareceipt.payment));

          if(mes > 12){
            mes = mes - 12;
            anio = anio + 1;
          } 

          if(dia == 31){
            if(mes == 4 || mes == 6 || mes == 9 || mes == 11){
              dia = 30;
            }else if(mes == 2){
              dia = 28;
            }
          }

          if(dia > 28 && mes == 2){
            dia = 28;
          }

          if(dia.toString().length == 1){
            dia = '0' + dia;
          }

          if(mes.toString().length == 1){
            mes = '0' + mes;
          }

          anio = anio + number;

          return dia + '/' + mes + '/' + anio;
        };

        // Calcula las fechas de fin de los recibos menores de un año de vigencia
        scope.obtenerVigenciaFinalCorta = function(value){
          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);

          if(parseFloat(scope.datareceipt.payment) == 5){
            mes = mes - (value * 12);
          }else{
            mes = mes - (value * parseFloat(scope.datareceipt.payment));
          }

          if(mes < 0){
            mes = mes + 12;
            anio = anio - 1;
          }else if(mes == 0){
            mes = 12;
            anio = anio - 1;
          }

          if(dia == 31){
            if(mes == 4 || mes == 6 || mes == 9 || mes == 11){
              dia = 30;
            }else if(mes == 2){
              dia = 28;
            }
          }

          if(dia > 28 && mes == 2){
            dia = 28;
          }

          if(dia.toString().length == 1){
            dia = '0' + dia;
          }

          if(mes.toString().length == 1){
            mes = '0' + mes;
          }
          return dia + '/' + mes + '/' + anio;
        };

        // Calcula las fechas de fin de los recibos con un año de vigencia
        scope.obtenerVigenciaFinal = function(index){
          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);

          if(dia > 28 && mes == 2){
            dia = 28;
          }
          if (scope.datareceipt.policy_days_duration <= 366){
            dia = dia - 1;
          }
          if(dia == 0){
            if(mes == 1 || mes == 2 || mes == 4 || mes == 6 || mes == 8 || mes == 9 || mes == 11){
              dia = 31;
            }else if(mes == 3){
              dia = 28;
            }else if(mes == 5 || mes == 7 || mes == 10 || mes == 12){
              dia = 30;
            }
            mes = mes - 1;
          }
          if(dia.toString().length == 1){
            dia = '0' + dia;
          }

          if(mes.toString().length == 1){
            mes = '0' + mes;
          }
          // if (mes == '00') {
          //   mes = 12
          // }
          if(mes < 0){
            mes = mes + 12;
            anio = anio - 1;
          }else if(mes == 0){
            mes = 12;
            anio = anio - 1;
          }
          // console.log('-d--',dia,mes,anio)
          return dia + '/' + mes + '/' + anio;
        };

        // Calcula las fechas de fin de los recibos con mayores de un año de vigencia
        scope.obtenerVigenciaFinalMultianual = function(index, number){
          var date_initial = (scope.datareceipt.startDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);

          if(parseFloat(scope.datareceipt.payment) == 5){
            mes = mes + ((index + 1) * 12);
          }else{
            mes = mes + ((index + 1) * parseFloat(scope.datareceipt.payment));
          }

          if(mes > 12){
            mes = mes - 12;
            anio = anio + 1;
          }

          if(dia == 31){
            if(mes == 4 || mes == 6 || mes == 9 || mes == 11){
              dia = 30;
            }else if(mes == 2){
              dia = 28;
            }
          }

          if(dia > 28 && mes == 2){
            dia = 28;
          }

          if(dia.toString().length == 1){
            dia = '0' + dia;
          }

          if(mes.toString().length == 1){
            mes = '0' + mes;
          }

          anio = anio + number;

          return dia + '/' + mes + '/' + anio;
        };

        // Calcula las fechas de vencimiento de los recibos
        scope.obtenerVencimiento = function(index, date){
          var date_initial = (date).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);

          if(index == 0){
            dia = dia + scope.datareceipt.periodo_inicial;
          }else{
            dia = dia + scope.datareceipt.periodo_subsecuente;
          }

          if(mes == 4 || mes == 6 || mes == 9 || mes == 11){
            if(dia > 30){
              dia = dia - 30;
              mes = mes + 1;
              if(mes > 12){
                mes = mes - 12;
                anio = anio + 1;
              }
            }
          }else if(mes == 2){
            if(dia > 28){
              dia = dia - 28;
              mes = mes + 1;
            }
          }else{
            if(dia > 31){
              dia = dia - 31;
              mes = mes + 1;
              if(mes > 12){
                mes = mes - 12;
                anio = anio + 1;
              }
            }
          }

          if(dia.toString().length == 1){
            dia = '0' + dia;
          }

          if(mes.toString().length == 1){
            mes = '0' + mes;
          }

          return dia + '/' + mes + '/' + anio;
        };

        // Recalcula un recibo
        scope.recalcularRecibo = function(index){
          if(scope.todos_prima[index] == scope.datareceipt.receipts[index].prima_neta){
            scope.datareceipt.receipts[index].rpf = scope.datareceipt.receipts[index].rpf;
          }else{
            scope.todos_prima[index] = scope.datareceipt.receipts[index].prima_neta;
            scope.datareceipt.receipts[index].rpf = scope.datareceipt.receipts[index].prima_neta * (((valor_rpf * 100) / scope.datareceipt.primaNeta) / 100);
          }

          if(scope.datareceipt.receipts[index].derecho == null){
            scope.datareceipt.receipts[index].derecho = 0;
          }

          scope.datareceipt.receipts[index].sub_total = scope.datareceipt.receipts[index].prima_neta + scope.datareceipt.receipts[index].rpf +scope.datareceipt.receipts[index].derecho;

          if(scope.todos_subtotal[index] == scope.datareceipt.receipts[index].sub_total){
            scope.datareceipt.receipts[index].iva = scope.datareceipt.receipts[index].iva;
          }else{
            scope.todos_subtotal[index] = scope.datareceipt.receipts[index].sub_total;
            scope.datareceipt.receipts[index].iva = scope.datareceipt.receipts[index].sub_total * (((valor_iva * 100) / scope.datareceipt.subTotal) / 100);
          }
          scope.datareceipt.receipts[index].prima_total = parseFloat(scope.datareceipt.receipts[index].sub_total + scope.datareceipt.receipts[index].iva);

          var comision_prima = scope.datareceipt.receipts[index].prima_neta * (scope.datareceipt.prima_comision / 100);
          var comision_rpf = scope.datareceipt.receipts[index].rpf * (scope.datareceipt.rpf_comision / 100);
          var comision_derecho = scope.datareceipt.receipts[index].derecho * (scope.datareceipt.derecho_comision / 100);

          scope.datareceipt.receipts[index].comision = comision_prima + comision_rpf + comision_derecho;

          scope.datareceipt.receipts[index].prima_neta = parseFloat((scope.datareceipt.receipts[index].prima_neta).toFixed(2));
          scope.datareceipt.receipts[index].rpf = parseFloat((scope.datareceipt.receipts[index].rpf).toFixed(2));
          scope.datareceipt.receipts[index].derecho = parseFloat((scope.datareceipt.receipts[index].derecho).toFixed(2));
          scope.datareceipt.receipts[index].sub_total = parseFloat((scope.datareceipt.receipts[index].sub_total).toFixed(2));
          scope.datareceipt.receipts[index].iva = parseFloat((scope.datareceipt.receipts[index].iva).toFixed(2));
          scope.datareceipt.receipts[index].prima_total = parseFloat((scope.datareceipt.receipts[index].prima_total).toFixed(2));
          scope.datareceipt.receipts[index].comision = parseFloat((scope.datareceipt.receipts[index].comision).toFixed(2));
        };

        scope.recalcularTotal = function(index){
          scope.datareceipt.receipts[index].prima_total = parseFloat((scope.datareceipt.receipts[index].prima_total).toFixed(2));
        };

        // Racalcula la comision de un recibo
        scope.recalcularComision = function(index){
          scope.datareceipt.receipts[index].comision = parseFloat((scope.datareceipt.receipts[index].comision).toFixed(2));
          scope.datareceipt.comision = 0;
          scope.datareceipt.receipts.forEach(function(receipt){
            scope.datareceipt.comision = scope.datareceipt.comision + parseFloat(receipt.comision);
          });

          scope.datareceipt.comision = parseFloat(scope.datareceipt.comision.toFixed(2));

          scope.calcularComision();
        };

        // Muestra la edición de los recibos
        scope.editarRecibos = function(){
          scope.editar_recibos = true;
        };

        scope.validarFechaInicio = function(receipt, index){
          if(index > 0){
            scope.datareceipt.receipts[index - 1].endingDate = receipt.startDate;
          }
        };

        scope.validarFechaFin = function(receipt, index){
          if((scope.datareceipt.receipts.length - 1) > index){
            scope.datareceipt.receipts[index + 1].startDate = receipt.endingDate;
          }
        };

        // Revisa que las fechas de los recibos no se salgan de la vigencia de la póliza
        scope.guardarRecibos = function(){
          var fechas_vacias = false;

          if(scope.type == 2){
            scope.datareceipt.receipts.forEach(function(item, index){
              if(!item.startDate || !item.endingDate || !item.vencimiento){
                SweetAlert.swal('Error', 'No se pueden quedar fechas vacías, revisa que los recibos tengan todas las fechas.', 'error');
                fechas_vacias = true;
                return;
              }else{
                if((process(item.startDate) < process(scope.datareceipt.startDate) || process(item.startDate) > process(scope.datareceipt.endingDate)) || (process(item.endingDate) < process(scope.datareceipt.startDate) || process(item.endingDate) > process(scope.datareceipt.endingDate))){
                  //if(scope.type == 1){
                    //SweetAlert.swal('Error', 'Las fechas del recibo ' + (index+1) + ' se sale de la vigencia de la fianza.', 'error');
                  //}else{
                    //SweetAlert.swal('Error', 'Las fechas del recibo ' + (index+1) + ' se sale de la vigencia del endoso.', 'error');
                  //}
                  //fechas_vacias = true;
                  //return;
                }else{
                  // if(process(item.vencimiento) < process(item.startDate)){
                  //   SweetAlert.swal('Error', 'La fecha de vencimiento del recibo ' + (index+1) + ' no puede ser menor a la de su inicio.', 'error');
                  //   fechas_vacias = true;
                  //   return;
                  // }
                }
              }
            });
          }


          function process(date){
            var parts = date.split("/");
            var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
            return date.getTime();
          }

          if(scope.type == 2){
            var total_prima = 0;
            var total_rpf = 0;
            var total_derecho = 0;
            var total_iva = 0;
            var total_total = 0;

            for(var i = 0; i < scope.datareceipt.receipts.length; i++){
              total_prima = total_prima + scope.datareceipt.receipts[i].prima_neta;
              total_rpf = total_rpf + scope.datareceipt.receipts[i].rpf;
              total_derecho = total_derecho + scope.datareceipt.receipts[i].derecho;
              total_iva = total_iva + scope.datareceipt.receipts[i].iva;
              total_total = total_total + scope.datareceipt.receipts[i].prima_total;
            }

            if(scope.type == 2 && scope.datareceipt.type_endorsement == 'D'){
              total_prima = total_prima * -1;
              total_rpf = total_rpf * -1;
              total_derecho = total_derecho * -1;
              total_iva = total_iva * -1;
              total_total = total_total * -1;
            }

            if((scope.datareceipt.primaNeta + 0.99) < total_prima || (scope.datareceipt.primaNeta - 0.99) > total_prima){
              SweetAlert.swal('Error', 'La suma de las primas netas de todos los recibos no coincide con la prima neta de la póliza.', 'error');
              fechas_vacias = true;
              return;
            }else if((valor_rpf + 0.99) < total_rpf || (valor_rpf - 0.99) > total_rpf){
              SweetAlert.swal('Error', 'La suma de los rpf de todos los recibos no coincide con el rpf de la póliza.', 'error');
              fechas_vacias = true;
              return;
            }else if((scope.datareceipt.derecho + 0.99) < total_derecho || (scope.datareceipt.derecho - 0.99) > total_derecho){
              SweetAlert.swal('Error', 'La suma de los derechos de todos los recibos no coincide con el derecho de la póliza.', 'error');
              fechas_vacias = true;
              return;
            }else if((valor_iva + 0.99) < total_iva || (valor_iva - 0.99) > total_iva){
              SweetAlert.swal('Error', 'La suma de los iva de todos los recibos no coincide con el iva de la póliza.', 'error');
              fechas_vacias = true;
              return;
            }else if((scope.datareceipt.primaTotal + 0.99) < total_total || (scope.datareceipt.primaTotal - 0.99) > total_total){
              SweetAlert.swal('Error', 'La suma de las primas totales de todos los recibos no coincide con la prima total de la póliza.', 'error');
              fechas_vacias = true;
              return;
            }
          }

          if(fechas_vacias){
            scope.editar_recibos = true;
          }else{
            scope.editar_recibos = false;
          }
        };

        // Completa el json con la información de los recibos para enviarla a la póliza
        scope.generarToSave = function(value){
          if(value == 1){
            if(scope.datareceipt.aplicarRpf || scope.datareceipt.aplicarDerecho){
              scope.todos_prima[0] == scope.datareceipt.receipts[0].prima_neta;
              scope.datareceipt.receipts[0].sub_total = parseFloat(scope.datareceipt.receipts[0].prima_neta + scope.datareceipt.receipts[0].rpf + scope.datareceipt.receipts[0].derecho);
              scope.todos_subtotal[0] == scope.datareceipt.receipts[0].sub_total;
              scope.datareceipt.receipts[0].iva = scope.datareceipt.receipts[0].sub_total * (((valor_iva * 100) / scope.datareceipt.subTotal) / 100);
              scope.datareceipt.receipts[0].prima_total = parseFloat(scope.datareceipt.receipts[0].sub_total + scope.datareceipt.receipts[0].iva);
              var comision_prima = scope.datareceipt.receipts[0].prima_neta * (scope.datareceipt.prima_comision / 100);
              var comision_rpf = scope.datareceipt.receipts[0].rpf * (scope.datareceipt.rpf_comision / 100);
              var comision_derecho = scope.datareceipt.receipts[0].derecho * (scope.datareceipt.derecho_comision / 100);
              scope.datareceipt.receipts[0].comision = comision_prima + comision_rpf + comision_derecho;
              if(scope.datareceipt.aplicarRpf){
                scope.obj_rpf = scope.datareceipt.receipts[0].rpf;
              }
              scope.datareceipt.receipts[0].prima_neta = parseFloat((scope.datareceipt.receipts[0].prima_neta).toFixed(2));
              scope.datareceipt.receipts[0].rpf = parseFloat((scope.datareceipt.receipts[0].rpf).toFixed(2));
              scope.datareceipt.receipts[0].derecho = parseFloat((scope.datareceipt.receipts[0].derecho).toFixed(2));
              scope.datareceipt.receipts[0].sub_total = parseFloat((scope.datareceipt.receipts[0].sub_total).toFixed(2));
              scope.datareceipt.receipts[0].iva = parseFloat((scope.datareceipt.receipts[0].iva).toFixed(2));
              scope.datareceipt.receipts[0].prima_total = parseFloat((scope.datareceipt.receipts[0].prima_total).toFixed(2));
              scope.datareceipt.receipts[0].comision = parseFloat((scope.datareceipt.receipts[0].comision).toFixed(2));
            }
          }else{
            scope.obj_rpf = null;
          }
          scope.tosave.p_neta = parseFloat(valor_primaNeta.toFixed(2));
          scope.tosave.rpf = parseFloat(valor_rpf.toFixed(2));
          scope.tosave.derecho = parseFloat(valor_derecho.toFixed(2));
          scope.tosave.sub_total = parseFloat(scope.datareceipt.subTotal.toFixed(2));
          scope.tosave.iva = parseFloat(valor_iva.toFixed(2));
          scope.tosave.p_total = parseFloat(scope.datareceipt.primaTotal.toFixed(2));
          scope.tosave.comision = parseFloat(scope.datareceipt.comision.toFixed(2));
          scope.tosave.comision_percent = scope.comisionPorcentaje;
          scope.tosave.poliza = {
            primaNeta: parseFloat(scope.datareceipt.primaNeta.toFixed(2)),
            rpf: parseFloat(valor_rpf.toFixed(2)),
            derecho: parseFloat(scope.datareceipt.derecho.toFixed(2)),
            iva: parseFloat(valor_iva.toFixed(2)),
            subTotal: parseFloat(scope.datareceipt.subTotal.toFixed(2)),
            primaTotal: parseFloat(scope.datareceipt.primaTotal.toFixed(2))
          };
          scope.tosave.recibos_poliza = scope.datareceipt.receipts;
        };

        if(scope.tosave){
          if(scope.tosave.receipts){
            scope.datareceipt = scope.tosave.poliza;
            scope.datareceipt.receipts = scope.tosave.receipts;

            valor_iva = scope.datareceipt.iva;

            scope.editar = true;

            scope.mostrarPrimerRecibo = false;
            scope.mostrarTodosRecibo = true;
          }
        }
      }
    }
  }]
);