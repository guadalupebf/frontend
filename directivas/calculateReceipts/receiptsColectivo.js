var app = angular.module('inspinia')
.directive('receiptsColectivo', ['MESSAGES', 'SweetAlert', '$location', '$sessionStorage',
  function ( MESSAGES, SweetAlert, $location, $sessionStorage) {

    return {
      restrict: 'EA',
      scope: {
        form: '=',
        tosave: '=',
        type: '='
      },
      templateUrl: 'app/directivas/calculateReceipts/receiptsColectivo.html',
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
          'descuento': null,
          'rpf': 0,
          'derecho': 0,
          'subTotal': 0,
          'iva': null,
          'primaTotal': 0,
          'comision': 0,
          'aplicarDescuento': false,
          'comision_percent': 0,
          'comision_derecho_percent': 0,
          'comision_rpf_percent': 0
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

        scope.sobrePrimas = [
          {'value': 1, 'name': 'Prima Neta Pagada'},
          {'value': 2, 'name': 'Prima Neta Pactada'}
        ];

        scope.arreglo_escalones = [
          {'porcentaje': null, 'comision': 0}
        ];
        scope.suma_porcentaje = 0;
        scope.noteColor = {'color': '#ff0000'};

        scope.verComisiones = function(){
          var sin_comision = {
            'comission': '0',
            'comission_derecho': '0',
            'comission_rpf': '0',
            'derecho': '0',
            'efective_date': '-',
            'expire_date': null,
            'nombre': 'Sin Comisión',
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
            'rpf_semestral': '0',
            'rpf_anual': '0',
            'subramo': '-',
            'udi': '0',
            'udi_derecho': '0',
            'udi_rpf': '0'
          }
          if(scope.form.comisiones && scope.form.comisiones.length > 0){
            scope.form.comisiones.forEach(function(item){
              if(item.nombre == 'Sin Comisión' && item.efective_date == '-' && item.observations == '-'){
                agregar_comision++;
              }
            });
            if(scope.form.subramo && agregar_comision == 0){
              scope.form.comisiones.push(sin_comision);
              agregar_comision++;
            }
          }else{
            if(scope.form.subramo && agregar_comision == 0){
              scope.form.comisiones = [];
              scope.form.comisiones.push(sin_comision);
              agregar_comision++;
            }else{
              if(scope.form.comisiones.length == 0){
                scope.form.comisiones.push(sin_comision);
              }
            }
          }
          if (scope.form) {
            if (scope.form.comision_seleccion) {
              scope.comision_seleccion = scope.form.comision_seleccion
            }
            if (scope.form.primaNeta) {
              scope.datareceipt.primaNeta = scope.form.primaNeta ? scope.form.primaNeta : 0
            }
            if (scope.form.derecho) {
              scope.datareceipt.derecho = scope.form.derecho ? scope.form.derecho : 0
            }
            if (scope.form.rpf) {
              scope.datareceipt.rpf = scope.form.rpf ? scope.form.rpf : 0
            }
          }
        };

        // Asignar valores segun comision seleccionada
        scope.asignarValores = function(comission){
          if (scope.form && scope.form.primaNeta) {
            if (scope.form.comision_seleccion) {
              scope.comision_seleccion = scope.form.comision_seleccion
            }
            if (scope.form.primaNeta) {
              scope.datareceipt.primaNeta = scope.form.primaNeta ? scope.form.primaNeta : 0
            }
            if (scope.form.primaTotal) {
              scope.datareceipt.primaTotal = scope.form.primaTotal ? scope.form.primaTotal : 0
            }
            if (scope.form.derecho) {
              scope.datareceipt.derecho = scope.form.derecho ? scope.form.derecho : 0
            }
            if (scope.form.rpf) {
              scope.datareceipt.rpf = scope.form.rpf ? scope.form.rpf : 0
            }
          }
          scope.comission = comission;
          if(!scope.form.payment || scope.form.payment == ""){
            scope.comision_seleccion = "";
            SweetAlert.swal("¡Error!", MESSAGES.ERROR.SELPAY, "error");
            return;
          }else{
            if(!scope.editar){
              try{
                scope.datareceipt.payment = scope.form.payment;
              } catch (err){
                scope.datareceipt = {};
                scope.datareceipt['payment'] = scope.form.payment;
              }
            }else{
              scope.numeroRecibos = scope.datareceipt.numeroRecibos;
              scope.recalcular = scope.tosave.recalcular;
            }
            scope.datareceipt.subramo = scope.form.subramo.subramo_name;                
            if(scope.form.derecho && scope.form.from_pdf){
              scope.datareceipt.derecho = parseFloat(scope.form.derecho);
              scope.datareceipt.rpf = parseFloat(scope.form.rpf);
            }else{
              scope.datareceipt.derecho = parseFloat(comission && comission.derecho ? comission.derecho : 0);
              scope.datareceipt.rpf = parseFloat(comission && comission.rpf ? comission.rpf : 0);
            }       
            if(scope.form.rpf && scope.form.from_pdf){
              scope.datareceipt.rpf = parseFloat(scope.form.rpf);
            }else{
              scope.datareceipt.rpf = parseFloat(comission && comission.rpf ? comission.rpf : 0);
            }
            if(scope.form.descuento && scope.form.from_pdf){
              scope.datareceipt.descuento = parseFloat(scope.form.descuento);
            }   
            if(scope.form.iva && scope.form.from_pdf){
              scope.datareceipt.iva = parseFloat(scope.form.iva);
            }  
            if(scope.form.descuento && scope.form.from_pdf){
              scope.datareceipt.descuento = parseFloat(scope.form.descuento);
            }
            // scope.datareceipt.derecho = parseFloat(comission.derecho);
            scope.datareceipt.prima_comision = parseFloat(comission.comission);
            scope.datareceipt.rpf_comision = parseFloat(comission.comission_rpf);
            scope.datareceipt.derecho_comision = parseFloat(comission.comission_derecho);
            scope.datareceipt.periodo_inicial = parseFloat(comission.periodo_inicial);
            scope.datareceipt.periodo_subsecuente = parseFloat(comission.periodo_subsecuente);

            scope.datareceipt.domiciliado = scope.form.domiciliado;

            scope.calcularTotales();
          }
        };

        scope.porcentageRpf = function(){
          if(!scope.editar){
            scope.datareceipt.payment = scope.form.payment;
          }else{
            scope.datareceipt.payment = scope.form.payment.value ? scope.form.payment.value : scope.form.payment;
          }

          switch(parseFloat(scope.datareceipt.payment)){
            case 1:
              scope.datareceipt.percent_rpf = scope.comission.rpf_mensual;
              break;
            case 2:
              scope.datareceipt.percent_rpf = scope.comission.rpf_bimestral;
              break;
            case 3:
              scope.datareceipt.percent_rpf = scope.comission.rpf_trimestral;
              break;
            case 5:
              scope.datareceipt.percent_rpf = scope.comission.rpf_anual;
              break;
            case 6:
              scope.datareceipt.percent_rpf = scope.comission.rpf_semestral;
              break;
            case 12:
              scope.datareceipt.percent_rpf = scope.comission.rpf_anual;
              break;
            default:
              scope.datareceipt.percent_rpf = 0;
              break;
          }
        };

        // Calcula pesos o porcentaje de descuento
        scope.calcularDescuento = function(){
          if(scope.tipo_descuento.value == 2){
            if(scope.datareceipt.descuento != 0){
              scope.descuentoPesos = (scope.datareceipt.primaNeta * scope.datareceipt.descuento) / 100;
            }else{
              scope.descuentoPesos = 0;
            }
          }else{
            if(scope.datareceipt.descuento != 0){
              scope.descuentoPorcentaje = ((scope.datareceipt.descuento * 100) / scope.datareceipt.primaNeta).toFixed(2);
            }else{
              scope.descuentoPorcentaje = 0;
            }
          }
        };

        // Calcula pesos o porcentaje de rpf
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
          if(scope.form.primaTotal && scope.form.from_pdf && parseFloat(scope.datareceipt.primaTotal)==0.00){
            scope.datareceipt.primaTotal=scope.form.primaTotal
            scope.datareceipt.subTotal=scope.form.subTotal
          }
        };

        // Calcula pesos o porcentaje de iva
        scope.calcularIva = function(ivaval){
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
          // if(scope.datareceipt.iva !=scope.form.iva && scope.form.from_pdf){
          // if((scope.datareceipt.iva !=scope.form.iva && scope.form.from_pdf) && parseFloat(scope.datareceipt.iva?scope.datareceipt.iva:0).toFixed(0)==0.00){
          //   scope.datareceipt.iva = parseFloat((scope.form.iva).toFixed(2));
          //   scope.calcularTotales();
          // }

          if(ivaval ==0){
            scope.datareceipt.iva = parseFloat((ivaval).toFixed(2));
            valor_iva = ivaval;   
            scope.ivaPorcentaje = 0;  
            scope.ivaPesos = 0;           
          }
          if(((scope.datareceipt.iva !=scope.form.iva && scope.form.from_pdf) && (!ivaval || ivaval==undefined)) || parseFloat(scope.datareceipt.iva?scope.datareceipt.iva:0).toFixed(0)==0.00){
            // scope.datareceipt.iva = parseFloat((scope.form.iva).toFixed(2));
            var ivaRaw = scope.form && scope.form.iva;
            var ivaNum = parseFloat(ivaRaw);
            scope.datareceipt.iva = isNaN(ivaNum) ? 0 : +ivaNum.toFixed(2);
            // scope.calcularTotales();
          }
          if(scope.datareceipt.primaNeta ==0){
            scope.datareceipt.primaTotal=0
          }
        };

        // Calcula totales de las primas
        scope.calcularTotales = function(tipodesc,ivaval){
          if (tipodesc){
            scope.tipo_descuento = tipodesc;
          }
          if(!scope.datareceipt.primaNeta || scope.datareceipt.primaNeta == undefined){
            valor_primaNeta = 0;
          }else{
            valor_primaNeta = parseFloat(scope.datareceipt.primaNeta);
          }

          if(!scope.datareceipt.descuento || scope.datareceipt.descuento == undefined){
            valor_descuento = 0;
          }else{
            if(scope.datareceipt.aplicarDescuento){
              if(scope.tipo_descuento.value == 2){
                if(scope.datareceipt.descuento > 100){
                  SweetAlert.swal('Error', 'El descuento no puede ser mayor a 100%.', 'error');
                  scope.datareceipt.descuento = 0;
                  valor_descuento = 0;
                }else{
                  valor_descuento = (scope.datareceipt.primaNeta * scope.datareceipt.descuento) / 100;
                }
              }else{
                valor_descuento = scope.datareceipt.descuento;
              }
            }else{
              valor_descuento = scope.datareceipt.descuento ? scope.datareceipt.descuento : 0;
            }
          }
          scope.calcularDescuento();

          valor_prima_descuento = valor_primaNeta - valor_descuento;
          scope.porcentageRpf();
          if(copy_primaNeta != scope.datareceipt.primaNeta){
            if(scope.form.rpf && scope.form.from_pdf){
              scope.datareceipt.rpf = parseFloat(scope.form.rpf);
            }else{
              scope.datareceipt.rpf = parseFloat((valor_prima_descuento * (parseFloat(scope.datareceipt.percent_rpf) / 100)).toFixed(2));
            }
            copy_rpf = angular.copy(scope.datareceipt.rpf)
          }else{
            if(scope.datareceipt.aplicarDescuento && copy_rpf == scope.datareceipt.rpf){
              if(scope.form.rpf && scope.form.from_pdf){
                scope.datareceipt.rpf = parseFloat(scope.form.rpf);
              }else{
                scope.datareceipt.rpf = parseFloat((valor_prima_descuento * (parseFloat(scope.datareceipt.percent_rpf) / 100)).toFixed(2));
              }
              copy_rpf = angular.copy(scope.datareceipt.rpf)
            }
          }
          // if(copy_primaNeta != scope.datareceipt.primaNeta){
          //   scope.datareceipt.rpf = parseFloat((valor_prima_descuento * (parseFloat(scope.datareceipt.percent_rpf) / 100)).toFixed(2));
          //   copy_rpf = angular.copy(scope.datareceipt.rpf)
          // }else{
          //   if(scope.datareceipt.aplicarDescuento && copy_rpf == scope.datareceipt.rpf){
          //     scope.datareceipt.rpf = parseFloat((valor_prima_descuento * (parseFloat(scope.datareceipt.percent_rpf) / 100)).toFixed(2));
          //     copy_rpf = angular.copy(scope.datareceipt.rpf)
          //   }
          // }

          if(!scope.datareceipt.rpf || scope.datareceipt.rpf == undefined){
            copy_primaNeta = angular.copy(scope.datareceipt.primaNeta);
            valor_rpf = 0;
          }else{
            if(scope.tipo_rpf.value == 2){
              if(scope.datareceipt.rpf > 100){
                SweetAlert.swal('Error', 'El recargo por pago fraccionado no puede ser mayor a 100%.', 'error');
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
            if((scope.datareceipt.subramo == "Vida" || scope.form.subramo =='Vida') || (scope.datareceipt.subramo == "Funerarios" || scope.form.subramo =='Funerarios')){
              copy_subTotal = angular.copy(scope.datareceipt.subTotal);
              scope.datareceipt.iva = 0;
              valor_iva = 0;
            }else{
              // console.log('sssss',scope.datareceipt.iva,tipodesc,ivaval)
              if(ivaval ==0){
                scope.datareceipt.iva = parseFloat((ivaval).toFixed(2));
                valor_iva = ivaval;                
              }else{
                scope.datareceipt.iva = parseFloat((scope.datareceipt.subTotal * 0.16).toFixed(2));
                valor_iva = scope.datareceipt.iva;                
              }
            }
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
          scope.calcularIva(ivaval);

          scope.datareceipt.primaTotal = parseFloat((scope.datareceipt.subTotal + valor_iva).toFixed(2));
          if(scope.datareceipt.prima_comision <= 0 || scope.datareceipt.prima_comision > 100 || scope.datareceipt.prima_comision == null){
            scope.datareceipt.prima_comision = 0;
          }
          if(scope.datareceipt.rpf_comision <= 0 || scope.datareceipt.rpf_comision > 100 || scope.datareceipt.rpf_comision == null){
            scope.datareceipt.rpf_comision = 0;
          }
          if(scope.datareceipt.derecho_comision <= 0 || scope.datareceipt.derecho_comision > 100 || scope.datareceipt.derecho_comision == null){
            scope.datareceipt.derecho_comision = 0;
          }
          
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

          scope.comisionPorcentaje = ((scope.datareceipt.comision * 100) / valor_suma_comision).toFixed(4);

          if(scope.comisionPorcentaje == 'NaN'){
            scope.comisionPorcentaje = 0;
          }

          scope.tosave.comision = scope.datareceipt.comision;
          scope.tosave.comision_percent = scope.comisionPorcentaje;
        };

        // Calcula el porcentaje de la comisión
        scope.calcularComision = function(){
          scope.comisionPorcentaje = ((scope.datareceipt.comision * 100) / scope.datareceipt.subTotal).toFixed(4);
          scope.form.comision_percent = scope.comisionPorcentaje;
          scope.generarToSave();
        };

        // Calcula el primer recibo
        scope.calcularPrimerRecibo = function(){
          scope.form.canCreate = false;

          if (! scope.permiso_comision_no_obligatoria){
            if(scope.datareceipt.prima_comision == 0 || scope.datareceipt.prima_comision == '0' || scope.datareceipt.prima_comision == ''){
              SweetAlert.swal("¡Error!", "La comisión de prima neta es obligatoria.", "error");
              scope.form.canCreate = false;
              scope.mostrarPrimerRecibo = false;
              return
            }
          }  


          if(!scope.comision_seleccion && scope.type == 1){
            SweetAlert.swal("¡Error!", "Debe elegir un valor de comisión.", "error");
            return;
          }
          scope.datareceipt.startDate = scope.form.startDate;
          scope.datareceipt.endingDate = scope.form.endingDate;

          if(!scope.editar){
            scope.datareceipt.payment = scope.form.payment;
          }else{
            scope.datareceipt.payment = scope.form.payment.value ? scope.form.payment.value : scope.form.payment;
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
              case 7:
                scope.numeroRecibos = 52;
                break;
              case 14:
                scope.numeroRecibos = 26;
                break;
              case 15:
                scope.numeroRecibos = 24;
                break;
              case 24:
                scope.numeroRecibos = 24;
                break;
              case 12:
                scope.numeroRecibos = 1; //anual
                break;
              default:
                break;
            }
            // if(scope.datareceipt.policy_days_duration < 365){
            //   scope.calcularRecibosCortos(1);
            // }else if(scope.datareceipt.policy_days_duration == 365 || scope.datareceipt.policy_days_duration == 366){
            //   scope.calcularRecibos(1);
            // }else if(scope.datareceipt.policy_days_duration > 366){
            //   scope.calcularRecibosMultianuales(1);
            // }
            if(scope.datareceipt.payment == 7 || scope.datareceipt.payment == 14 || scope.datareceipt.payment == 15){
              scope.calcularRecibosDia(1);
            }else if(scope.datareceipt.payment == 24){
              scope.calcularRecibosQuincena(1);
            }else if(scope.datareceipt.payment == 1 || scope.datareceipt.payment == 2 || scope.datareceipt.payment == 3 || scope.datareceipt.payment == 5 || scope.datareceipt.payment == 6 || scope.datareceipt.payment == 12){
              scope.calcularRecibosMes(1);
            }

            SweetAlert.swal('¡Atención!', 'Introduce las primas para el primer recibo, después genera los recibos subsecuentes.', 'warning');
          }else{
            SweetAlert.swal('¡Error se modificaron primas!', 'Y existen recibos pagados, las primas de la póliza se podrán guardar pero cada recibo se deberá que modificar de manera manual desde la información.', 'error');
          }
        };

        // Recalcula el primer recibo
        scope.calcularTotalPrimerRecibo = function(){
          scope.form.canCreate = false;
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
            scope.newPrima.primaNeta = scope.datareceipt.primaNeta - scope.datareceipt.receipts[0].prima_neta;
          }else{
            SweetAlert.swal('Error', 'La prima neta del primer recibo es mayor a la prima neta de la póliza.', 'error');
            return;
          }

          if(valor_rpf >= scope.datareceipt.receipts[0].rpf){
            scope.newPrima.rpf = valor_rpf - scope.datareceipt.receipts[0].rpf;
          }else{
            SweetAlert.swal('Error', 'El RPF del primer recibo es mayor al RPF de la póliza.', 'error');
            return;
          }

          if(scope.datareceipt.derecho >= scope.datareceipt.receipts[0].derecho){
            scope.newPrima.derecho = scope.datareceipt.derecho - scope.datareceipt.receipts[0].derecho;
          }else{
            SweetAlert.swal('Error', 'El derecho del primer recibo es mayor al derecho de la póliza.', 'error');
            return;
          }

          if(scope.datareceipt.subTotal >= scope.datareceipt.receipts[0].sub_total){
            scope.newPrima.subTotal = scope.datareceipt.subTotal - scope.datareceipt.receipts[0].sub_total;
          }else{
            scope.newPrima.subTotal = 0;
          }

          if(valor_iva >= scope.datareceipt.receipts[0].iva){
            scope.newPrima.iva = valor_iva - scope.datareceipt.receipts[0].iva;
          }else{
            SweetAlert.swal('Error', 'El iva del primer recibo es mayor al iva de la póliza.', 'error');
            return;
          }

          if(scope.datareceipt.primaTotal >= scope.datareceipt.receipts[0].prima_total){
            scope.newPrima.primaTotal = scope.datareceipt.primaTotal - scope.datareceipt.receipts[0].prima_total;
          }else{
            SweetAlert.swal('Error', 'La prima total del primer recibo es mayor a la prima total de la póliza.', 'error');
            return;
          }

          if(scope.datareceipt.comision >= scope.datareceipt.receipts[0].comision){
            scope.newPrima.comision = scope.datareceipt.comision - scope.datareceipt.receipts[0].comision;
          }else{
            scope.newPrima.comision = 0;
          }

          scope.form.canCreate = true;

          if(scope.datareceipt.payment == 7 || scope.datareceipt.payment == 14 || scope.datareceipt.payment == 15){
            scope.calcularRecibosDia(2);
          }else if(scope.datareceipt.payment == 24){
            scope.calcularRecibosQuincena(2);
          }else if(scope.datareceipt.payment == 1 || scope.datareceipt.payment == 2 || scope.datareceipt.payment == 3 || scope.datareceipt.payment == 5 || scope.datareceipt.payment == 6 || scope.datareceipt.payment == 12){
            scope.calcularRecibosMes(2);
          }
        };

        // Valida que el porcentaje de siniestralidad no supere el 100%
        scope.validarPorcentaje = function(){
          if(scope.datareceipt.accident_rate < 0){
            scope.datareceipt.accident_rate = 0;
          }else if(scope.datareceipt.accident_rate > 100){
            scope.datareceipt.accident_rate = 100;
          }else{
            scope.datareceipt.accident_rate.toFixed(2);
          }
        };

        // Agregar nuevo escalon
        scope.agregarEscalon = function(){
          var data_step = {
            porcentaje: null,
            comision: 0
          }
          scope.arreglo_escalones.push(data_step);
        };

        // Eliminar escalon
        scope.quitarEscalon = function(index){
          scope.arreglo_escalones.splice(index, 1);
          scope.sumarPorcentajes();
        };

        // Verifica que todos los escalones sean 100%
        scope.sumarPorcentajes = function(){
          scope.suma_porcentaje = 0;
          scope.arreglo_escalones.forEach(function(item){
            if(item.porcentaje == null){
              item.porcentaje = 0;
            }else if(item.porcentaje < 0){
              item.porcentaje = 0;
            }else if(item.porcentaje > 100){
              item.porcentaje = 100;
            }
            scope.suma_porcentaje = scope.suma_porcentaje + item.porcentaje;
            if(scope.suma_porcentaje > 100){
              SweetAlert.swal('Error', 'La sumatoria de todos los porcentajes de cada escalon no pueden superar el 100%, verifica los porcentajes.', 'error');
            }
          });
          scope.tosave.sumaPorcentaje = scope.suma_porcentaje;
        };

        // Calcula recibos por prima minima
        scope.calcularRecibosPrimaMinima = function(){
          if(!scope.comision_seleccion){
            SweetAlert.swal("¡Error!", "Debe elegir un valor de comisión.", "error");
            return;
          }
          if(!scope.datareceipt.accident_rate){
            SweetAlert.swal("¡Error!", "Debe agregar un porcentaje de siniestralidad.", "error");
            return;
          }
          if(scope.suma_porcentaje != 100){
            SweetAlert.swal('Error', 'La sumatoria de todos los porcentajes de cada escalon no pueden ser diferente al 100%, verifica los porcentajes.', 'error');
            return;
          }
          scope.arreglo_escalones.forEach(function(item, index){
            if(item.porcentaje == null || item.porcentaje <= 0){
              scope.arreglo_escalones.splice(index, 1);
            }
          });
          scope.datareceipt.receipts = [];
          scope.datareceipt.startDate = scope.form.startDate;
          scope.datareceipt.endingDate = scope.form.endingDate;
          scope.recibos_totales = scope.arreglo_escalones.length;

          scope.arreglo_escalones.forEach(function(item, index){
            var receipt = {
              'recibo_numero': index + 1,
              'prima_neta': 0,
              'rpf': 0,
              'derecho': 0,
              'iva': 0,
              'sub_total': 0,
              'prima_total': 0,
              'comision': 0,
              'receipt_type': 1,
              'delivered': false,
              'fecha_inicio': scope.form.startDate,
              'fecha_fin': scope.form.endingDate,
              'vencimiento': scope.obtenerVencimiento(index, scope.form.startDate),
            };
            receipt.prima_neta = parseFloat(((scope.datareceipt.primaNeta * item.porcentaje) / 100).toFixed(2));
            if(index == 0){
              receipt.rpf = parseFloat((scope.datareceipt.rpf).toFixed(2));
              receipt.derecho = parseFloat(parseFloat(scope.datareceipt.derecho).toFixed(2));
            }else{
              receipt.rpf = 0;
              receipt.derecho = 0;
            }
            receipt.sub_total = parseFloat((parseFloat(receipt.prima_neta) + parseFloat(receipt.rpf) + parseFloat(receipt.derecho)).toFixed(2));
            receipt.iva = parseFloat(((receipt.sub_total * parseFloat(scope.ivaPorcentaje)) / 100).toFixed(2));
            receipt.prima_total = parseFloat((parseFloat(receipt.sub_total) + parseFloat(receipt.iva)).toFixed(2));
            receipt.comision = parseFloat(((scope.datareceipt.comision * item.porcentaje) / 100).toFixed(2));
            scope.datareceipt.receipts.push(angular.copy(receipt));
          });
          var receipt = {
            'recibo_numero': 1,
            'prima_neta': (scope.datareceipt.receipts[0].prima_neta - parseFloat(scope.datareceipt.primaNeta)).toFixed(2),
            'rpf': (scope.datareceipt.receipts[0].rpf - parseFloat(scope.datareceipt.rpf)).toFixed(2),
            'derecho': (scope.datareceipt.receipts[0].derecho - parseFloat(scope.datareceipt.derecho)).toFixed(2),
            'iva': (scope.datareceipt.receipts[0].iva - parseFloat(scope.datareceipt.iva)).toFixed(2),
            'sub_total': (scope.datareceipt.receipts[0].sub_total - parseFloat(scope.datareceipt.subTotal)).toFixed(2),
            'prima_total': (scope.datareceipt.receipts[0].prima_total - parseFloat(scope.datareceipt.primaTotal)).toFixed(2),
            'comision': (scope.datareceipt.receipts[0].comision - parseFloat(scope.datareceipt.comision)).toFixed(2),
            'receipt_type': 3,
            'delivered': false,
            'fecha_inicio': scope.form.startDate,
            'fecha_fin': scope.form.endingDate,
            'vencimiento': scope.obtenerVencimiento(1, scope.form.startDate),
          };
          scope.datareceipt.receipts.push(angular.copy(receipt));

          scope.mostrarPrimerRecibo = false;
          scope.mostrarTodosRecibo = true;
          scope.form.canCreate = true;
          scope.generarToSave();
        };

        // Calcula recibos semanal, catorcenal
        scope.calcularRecibosDia = function(value){
          scope.datareceipt.receipts = [];

          var recibos_fracionados = (scope.datareceipt.policy_days_duration * scope.numeroRecibos) / 365;
          var arreglo_recibos = (recibos_fracionados.toString()).split(".");
          var recibos_completos = parseFloat(arreglo_recibos[0]);
          var recibos_incompletos = '0.' + arreglo_recibos[1];
          recibos_incompletos = parseFloat(recibos_incompletos);

          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);

          var date1 = new Date(mes + '/' + dia + '/' + (anio - 1));
          var date2 = new Date(mes + '/' + dia + '/' + anio);
          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          scope.duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

          var dias_bisiesto = scope.datareceipt.policy_days_duration % scope.duration;
          var diferencia = (Math.abs(date2.getTime() - date1.getTime()));

          if(((scope.datareceipt.policy_days_duration - dias_bisiesto) % scope.duration == 0) && diferencia == 366){
            recibos_incompletos = recibos_incompletos + 1;
            recibos_completos = recibos_completos - 1;
          }

          if(recibos_incompletos == 0){
            recibos_incompletos = 1;
            recibos_completos = recibos_completos - 1;
          }

          scope.recibos_totales = 0;
          if(recibos_completos <= recibos_fracionados){
            scope.recibos_totales = recibos_completos + 1;
          }

          if(recibos_incompletos < 0.08){
            recibos_fracionados = angular.copy(recibos_completos);
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
            scope.form.canCreate = true;
          }

          scope.dias_resta = scope.recibos_totales * scope.datareceipt.payment;
          scope.dias_resta_fin = (scope.recibos_totales * scope.datareceipt.payment) - scope.datareceipt.payment;

          for(var i = 0; i < scope.recibos_totales; i++){
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
                // if(scope.datareceipt.rpf){
                //   scope.obj.rpf = parseFloat(scope.datareceipt.rpf);
                // }else{
                //   scope.obj.rpf = 0;
                // }
                if(scope.tipo_rpf.value == 2){
                  if(scope.datareceipt.rpf != 0){
                    scope.rpfPesos = (valor_prima_descuento * scope.datareceipt.rpf) / 100;
                    scope.obj.rpf = parseFloat(scope.rpfPesos);
                  }else{
                    scope.obj.rpf = 0;
                  }
                }else{
                  if(scope.datareceipt.rpf != 0){
                    scope.rpfPorcentaje = ((scope.datareceipt.rpf * 100) / valor_prima_descuento).toFixed(2);
                    scope.obj.rpf = parseFloat(scope.rpfPorcentaje);
                  }else{
                    scope.obj.rpf = 0;
                  }
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
              'fecha_inicio': scope.obtenerVigenciaInicialDia(i, scope.dias_resta),
              'fecha_fin': scope.obtenerVigenciaFinalDia(scope.dias_resta_fin),
            };

            receipt.vencimiento = scope.obtenerVencimiento(i, receipt.fecha_inicio);

            scope.datareceipt.receipts.push(angular.copy(receipt));

            scope.dias_resta = scope.dias_resta - scope.datareceipt.payment;
            scope.dias_resta_fin = scope.dias_resta_fin - scope.datareceipt.payment;
          }

          if((value == 2 && scope.type == 1) || (value == 2 && scope.type == 2)){
            scope.datareceipt.receipts[0] = scope.firstReceipt;
          }

          scope.generarToSave(value);
        };

        // Calcula recibos quincenal
        scope.calcularRecibosQuincena = function(value){
          console.log(scope.datareceipt)
          scope.datareceipt.receipts = [];

          if(scope.type == 1){
            scope.numeroRecibosNuevos = scope.numeroRecibos - 1;
          }else{
            scope.numeroRecibosNuevos = scope.numeroRecibos;
          }
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
            scope.form.canCreate = true;
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
              'fecha_inicio': scope.obtenerVigenciaInicial(i),
              'fecha_fin': scope.obtenerVigenciaFinal(i),
            };

            receipt.vencimiento = scope.obtenerVencimiento(i, receipt.fecha_inicio);

            scope.datareceipt.receipts.push(angular.copy(receipt));
          }

          if(value == 2 && scope.type == 1){
            scope.datareceipt.receipts[0] = scope.firstReceipt;
          }
          scope.generarToSave(value);
        };

        // Calcula recibos mensual, bimestral, trimestral, semestral, anual, contado
        scope.calcularRecibosMes = function(value){
          scope.datareceipt.receipts = [];

          var recibos_fracionados = (scope.datareceipt.policy_days_duration * scope.numeroRecibos) / 365;
          var arreglo_recibos = (recibos_fracionados.toString()).split(".");
          var recibos_completos = parseFloat(arreglo_recibos[0]);
          var recibos_incompletos = '0.' + arreglo_recibos[1];
          recibos_incompletos = parseFloat(recibos_incompletos);

          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);

          var date1 = new Date(mes + '/' + dia + '/' + (anio - 1));
          var date2 = new Date(mes + '/' + dia + '/' + anio);
          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          scope.duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

          var dias_bisiesto = scope.datareceipt.policy_days_duration % scope.duration;
          var diferencia = (Math.abs(date2.getTime() - date1.getTime()));

          if(((scope.datareceipt.policy_days_duration - dias_bisiesto) % scope.duration == 0) && diferencia == 366){
            recibos_incompletos = recibos_incompletos + 1;
            recibos_completos = recibos_completos - 1;
          }

          if(recibos_incompletos == 0){
            recibos_incompletos = 1;
            recibos_completos = recibos_completos - 1;
          }

          scope.recibos_totales = 0;
          if(scope.datareceipt.payment == 5 || scope.datareceipt.payment == 12){
            recibos_fracionados = 1;
            recibos_completos = 1;
            recibos_incompletos = 1;
            scope.recibos_totales = 1;
          }else{
            if(recibos_incompletos < 0.08){
              recibos_fracionados = angular.copy(recibos_completos);
              recibos_incompletos = 1;
              recibos_completos = recibos_completos - 1;
            }

            if(recibos_completos < recibos_fracionados){
              scope.recibos_totales = recibos_completos + 1;
            }else{
              scope.recibos_totales = recibos_completos;
            }
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
            scope.form.canCreate = true;
          }

          scope.meses_resta = scope.recibos_totales * scope.datareceipt.payment;
          scope.meses_resta_fin = (scope.recibos_totales * scope.datareceipt.payment) - scope.datareceipt.payment;

          for(var i = 0; i < scope.recibos_totales; i++){
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
                // if(scope.datareceipt.rpf){
                //   scope.obj.rpf = parseFloat(scope.datareceipt.rpf);
                // }else{
                //   scope.obj.rpf = 0;
                // }
                if(scope.tipo_rpf.value == 2){
                  if(scope.datareceipt.rpf != 0){
                    scope.rpfPesos = (valor_prima_descuento * scope.datareceipt.rpf) / 100;
                    scope.obj.rpf = parseFloat(scope.rpfPesos);
                  }else{
                    scope.obj.rpf = 0;
                  }
                }else{
                  if(scope.datareceipt.rpf != 0){
                    scope.rpfPorcentaje = ((scope.datareceipt.rpf * 100) / valor_prima_descuento).toFixed(2);
                    scope.obj.rpf = parseFloat(scope.datareceipt.rpf);
                  }else{
                    scope.obj.rpf = 0;
                  }
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
              'fecha_inicio': scope.obtenerVigenciaInicialMes(i, scope.meses_resta),
              'fecha_fin': scope.obtenerVigenciaFinalMes(scope.meses_resta_fin)
            };

            receipt.vencimiento = scope.obtenerVencimiento(i, receipt.fecha_inicio);

            scope.datareceipt.receipts.push(angular.copy(receipt));

            scope.meses_resta = scope.meses_resta - scope.datareceipt.payment;
            scope.meses_resta_fin = scope.meses_resta_fin - scope.datareceipt.payment;
          }

          if((value == 2 && scope.type == 1) || (value == 2 && scope.type == 2)){
            scope.datareceipt.receipts[0] = scope.firstReceipt;
          }

          scope.generarToSave(value);
        };

        function convertDate(inputFormat) {
          function pad(s) { return (s < 10) ? '0' + s : s; }
          var d = new Date(inputFormat);
          var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
          return date;
        };

        // Calcula las fechas de inicio semanal, catorcenal
        scope.obtenerVigenciaInicialDia = function(index, value){
          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);
          var fecha = new Date(mes + '/' + dia + '/' + anio);
          fecha.setDate(fecha.getDate() - value);

          if(index == 0){
            return scope.datareceipt.startDate;
          }else{
            return convertDate(fecha);
          }
        };

        // Calcula las fechas de inicio quincena
        scope.obtenerVigenciaInicialQuincena = function(index, value){
          console.log(value)
          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);
          var fecha = new Date(mes + '/' + dia + '/' + anio);
          console.log("mes",fecha.getMonth())
          fecha.setMonth((fecha.getMonth()) - value);

          if(index == 0){
            return scope.datareceipt.startDate;
          }else{
            return convertDate(fecha);
          }
        };

        // Calcula las fechas de inicio mensual, bimestral, trimestral, semestral, anual, contado
        scope.obtenerVigenciaInicialMes = function(index, value){
          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);
          var fecha = new Date(mes + '/' + dia + '/' + anio);

          fecha.setMonth((fecha.getMonth()) - value);

          if(index == 0){
            return scope.datareceipt.startDate;
          }else{
            return convertDate(fecha);
          }
        };

        // Calcula las fechas de fin semanal, catorcenal
        scope.obtenerVigenciaFinalDia = function(value){
          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);
          var fecha = new Date(mes + '/' + dia + '/' + anio);
          fecha.setDate(fecha.getDate() - value);

          return convertDate(fecha);
        };

        // Calcula las fechas de fin quincenal
        scope.obtenerVigenciaFinalQuincena = function(index){
          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);
          var fecha = new Date(mes + '/' + dia + '/' + anio);

          fecha.setDate(fecha.getDate() - value);

          return convertDate(fecha);
        };

        // Calcula las fechas de fin mensual, bimestral, trimestral, semestral, anual, contado
        scope.obtenerVigenciaFinalMes = function(value){
          var date_initial = (scope.datareceipt.endingDate).split('/');
          var dia = parseInt(date_initial[0]);
          var mes = parseInt(date_initial[1]);
          var anio = parseInt(date_initial[2]);
          var fecha = new Date(mes + '/' + dia + '/' + anio);

          fecha.setMonth((fecha.getMonth()) - value);

          return convertDate(fecha);
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
          if(!scope.comision_seleccion && scope.type == 1){
            SweetAlert.swal("¡Error!", "Debe elegir un valor de comisión.", "error");
            return;
          }else{
            scope.editar_recibos = true;
          }
        };

        scope.validarFechaInicio = function(receipt, index){
          if(index > 0){
            scope.datareceipt.receipts[index - 1].fecha_fin = receipt.fecha_inicio;
          }
        };

        scope.validarFechaFin = function(receipt, index){
          if((scope.datareceipt.receipts.length - 1) > index){
            scope.datareceipt.receipts[index + 1].fecha_inicio = receipt.fecha_fin;
          }
        };

        // Revisa que las fechas de los recibos no se salgan de la vigencia de la póliza
        scope.guardarRecibos = function(){
          var fechas_vacias = false;

          scope.datareceipt.receipts.forEach(function(item, index){
            if(!item.fecha_inicio || !item.fecha_fin || !item.vencimiento){
              SweetAlert.swal('Error', 'No se pueden quedar fechas vacías, revisa que los recibos tengan todas las fechas.', 'error');
              fechas_vacias = true;
              return;
            }else{
              if((process(item.fecha_inicio) < process(scope.datareceipt.startDate) || process(item.fecha_inicio) > process(scope.datareceipt.endingDate)) || (process(item.fecha_fin) < process(scope.datareceipt.startDate) || process(item.fecha_fin) > process(scope.datareceipt.endingDate))){
                SweetAlert.swal('Error', 'Las fechas del recibo ' + (index+1) + ' se sale de la vigencia de la póliza.', 'error');
                fechas_vacias = true;
                return;
              }else{
                // if(process(item.vencimiento) < process(item.fecha_inicio)){
                //   SweetAlert.swal('Error', 'La fecha de vencimiento del recibo ' + (index+1) + ' no puede ser menor a la de su inicio.', 'error');
                //   fechas_vacias = true;
                //   return;
                // }
              }
            }
          });

          function process(date){
            var parts = date.split("/");
            var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
            return date.getTime();
          }

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
              if(scope.type != 2){
                var comision_prima = scope.datareceipt.receipts[0].prima_neta * (scope.datareceipt.prima_comision / 100);
                var comision_rpf = scope.datareceipt.receipts[0].rpf * (scope.datareceipt.rpf_comision / 100);
                var comision_derecho = scope.datareceipt.receipts[0].derecho * (scope.datareceipt.derecho_comision / 100);
                scope.datareceipt.receipts[0].comision = comision_prima + comision_rpf + comision_derecho;
              }
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
          scope.tosave.accident_rate = scope.datareceipt.accident_rate;
          if(scope.type == 3){
            scope.tosave.steps = scope.arreglo_escalones;
          }else{
            scope.tosave.steps = [];
          }
          scope.tosave.p_neta = parseFloat(valor_primaNeta.toFixed(2));
          scope.tosave.descuento = parseFloat(valor_descuento.toFixed(2));
          scope.tosave.rpf = parseFloat(valor_rpf.toFixed(2));
          scope.tosave.aplicarRpf = scope.datareceipt.aplicarRpf;
          scope.tosave.derecho = parseFloat(valor_derecho);
          scope.tosave.aplicarDerecho = scope.datareceipt.aplicarDerecho;
          scope.tosave.sub_total = parseFloat(scope.datareceipt.subTotal.toFixed(2));
          scope.tosave.iva = parseFloat(valor_iva.toFixed(2));
          scope.tosave.p_total = parseFloat(scope.datareceipt.primaTotal.toFixed(2));
          scope.tosave.comision = parseFloat(scope.datareceipt.comision.toFixed(2));
          scope.tosave.comision_percent = scope.comisionPorcentaje;
          scope.tosave.prima_comision = scope.datareceipt.prima_comision;
          scope.tosave.poliza = {
            primaNeta: parseFloat(scope.datareceipt.primaNeta.toFixed(2)),
            descuento: parseFloat(valor_descuento.toFixed(2)),
            aplicarDescuento: scope.datareceipt.aplicarDescuento,
            rpf: parseFloat(valor_rpf.toFixed(2)),
            derecho: parseFloat(scope.datareceipt.derecho).toFixed(2),
            iva: parseFloat(valor_iva.toFixed(2)),
            subTotal: parseFloat(scope.datareceipt.subTotal.toFixed(2)),
            primaTotal: parseFloat(scope.datareceipt.primaTotal.toFixed(2)),
            comision_derecho_percent: parseFloat(scope.datareceipt.derecho_comision),
            comision_rpf_percent: parseFloat(scope.datareceipt.rpf_comision),
          };
          scope.tosave.recibos_poliza = scope.datareceipt.receipts;
        };

        if(scope.tosave){
          if(scope.tosave.receipts){
            scope.datareceipt = scope.tosave.poliza;
            if(scope.type == 3){
              scope.datareceipt.accident_rate = scope.tosave.accident_rate;
              scope.arreglo_escalones = scope.tosave.steps.length > 0 ? scope.tosave.steps : [{'porcentaje': null, 'comision': 0}];
              scope.sumarPorcentajes();
            }
            scope.datareceipt.receipts = scope.tosave.receipts;

            valor_iva = scope.datareceipt.iva;

            scope.editar = true;

            scope.mostrarPrimerRecibo = false;
            scope.mostrarTodosRecibo = true;
            scope.form.canCreate = true;

            if (($location.path().indexOf('convertir') != -1)) {
              scope.mostrarTodosRecibo = false;
            }else{
              scope.mostrarTodosRecibo = true;
              scope.form.canCreate = true;
            }
          }
        }

        if(scope.type == 2){
          scope.datareceipt = scope.tosave.poliza;
          valor_primaNeta = scope.tosave.poliza.primaNeta;
          valor_descuento = 0;
          valor_rpf = scope.tosave.poliza.rpf;
          valor_derecho = scope.tosave.poliza.derecho;
          valor_iva = scope.tosave.poliza.iva;

          scope.datareceipt.payment = scope.form.payment;
          scope.datareceipt.subramo = scope.form.subramo;
          scope.datareceipt.startDate = scope.form.startDate;
          scope.datareceipt.endingDate = scope.form.endingDate;
          scope.datareceipt.policy_days_duration = scope.form.policy_days_duration;

          scope.datareceipt.prima_comision = 0;
          scope.datareceipt.rpf_comision = 0;
          scope.datareceipt.derecho_comision = 0;
          scope.datareceipt.periodo_inicial = 0;
          scope.datareceipt.periodo_subsecuente = 0;
          scope.datareceipt.domiciliado = scope.form.domiciliado;

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
        }
      }
    }
  }]
);