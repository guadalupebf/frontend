var app = angular.module('inspinia')
.directive('calculateReceipts', ['toaster', 'MESSAGES', 'helpers', 'datesFactory', '$filter', 'SweetAlert','$sessionStorage','$location',
  function (toaster, MESSAGES, helpers, datesFactory, $filter, SweetAlert, $sessionStorage, $location) {

    return {
        restrict: 'EA',
        scope: {
          model : '=',
          poliza: '=',
          form: '=',
          tosave: '=',
          type: '='
        },
        templateUrl: 'app/directivas/calculateReceipts/calculate.receipts.template.html',
        link: function(scope, element, $watch, attrs) {


          scope.active_calculate = true;

          scope.recibo_liquidado_conciliado = false;
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
            })
          }
          // if ($location.path().indexOf('editar')) {
          if (($location.path().indexOf('editar') != -1)) {            
            try{
              if (scope.form.noRecalculateReceipts == false || scope.form.noRecalculateReceipts == true) {
                scope.noRecalculateReceipts = scope.form.noRecalculateReceipts;
              }else{
                scope.noRecalculateReceipts = true;
              }
            }catch(err){
              scope.noRecalculateReceipts = true;
              console.log('error recalculate',err)
            }            
          }else{
            scope.noRecalculateReceipts = false;
          }
          scope.checkValue = function(parIndex, $event, param, parType) {

            switch(parType) {
              case 1:
                scope.poliza[param] = String(scope.poliza[param]).replace(/[A-Za-z]/, '');
                scope.poliza[param] = String(scope.poliza[param]).replace(/,/g, '');
                break;

              case 2: 
                scope.receipts[parIndex][param] = String(scope.receipts[parIndex][param]).replace(/[A-Za-z]/, '');
                scope.receipts[parIndex][param] = String(scope.receipts[parIndex][param]).replace(/,/, '');
                break;

              default:
                break;
            }

          };

          scope.calculateInputs = function(param) {

            // letras y caracteres especiales
            // var letters = /^[A-Za-z]+$/;

            scope.poliza[param] = String(scope.poliza[param]).replace(/[A-Za-z]/g, '');
            scope.poliza[param] = String(scope.poliza[param]).replace(/,/g, '');
            // scope.poliza.primaNeta = String(scope.poliza.primaNeta).replace(/[A-Za-z]/g, '');

            if(scope.poliza.descuento) {
               if(parseFloat(scope.poliza.descuento) > 100) {
                  // alert('El porcentaje no puede ser mayor a 100');
                  scope.poliza.descuento = 100;
                  SweetAlert.swal('Error','El descuento no pude ser mayor al 100%.','error');
                  return;
                }
            }

            if(!scope.poliza.primaNeta || scope.poliza.primaNeta == undefined) {
              var primaNeta_ = 0;
            } else {
              var primaNeta_ = parseFloat(scope.poliza.primaNeta);
            }

            if(!scope.poliza.descuento || scope.poliza.descuento == undefined) {

              var desceunto_importe = 0;

            } else {


              if(scope.poliza.aplicarDescuento) {

                var descuento_percent = parseInt(scope.poliza.descuento) / 100;
                var desceunto_importe = primaNeta_ * descuento_percent;
              } else {
                var desceunto_importe = 0;
              }
            }

            if(!scope.poliza.rpf || scope.poliza.rpf == undefined) {
              var rpf_ = 0;
            } else {
              var rpf_ = parseFloat(scope.poliza.rpf);
            }

            if(!scope.poliza.derecho || scope.poliza.derecho == undefined) {
              var derecho_ = 0;
            } else {
              var derecho_ = parseFloat(scope.poliza.derecho);
            }

            if(desceunto_importe == undefined) {
              desceunto_importe = 0;
            }

            var p_neta_descuento = primaNeta_ - desceunto_importe;
    

            var subtotal_ = p_neta_descuento + rpf_ + derecho_;
            var iva_importe = subtotal_ * 0.16;
            var primaTotal_ = subtotal_ + iva_importe;

            var ramo_code = scope.form.ramo.ramo_code;
           
            scope.poliza.primaTotal = (primaTotal_).toFixed(2);

            if(ramo_code == 1) {
              scope.poliza.iva = 0;
              // scope.poliza.primaTotal = parseFloat(scope.poliza.subTotal).toFixed(2);
              scope.poliza.primaTotal = subtotal_;

            } else {
              
              if(scope.edited_iva) {
                scope.poliza.iva = scope.poliza.iva;
                scope.poliza.primaTotal = (parseFloat(scope.poliza.subTotal) + parseFloat(scope.poliza.iva)).toFixed(2);

              } else {
                scope.poliza.iva = (iva_importe).toFixed(2);
              }
    
            }

            if(isNaN(scope.poliza.subTotal) && scope.poliza.subTotal !== undefined) {
              scope.poliza.subTotal = 0
            } else {
              scope.poliza.subTotal = (subtotal_).toFixed(2);
            }
          };

          if(!scope.poliza) {
            scope.poliza = {};
          }

          scope.checkReceipts = function(parReceipts) {

            parReceipts.forEach(function(item) {

              if(item.status) {
                if(item.status > 4) {
                  scope.recibo_liquidado_conciliado = true;
                }  
              }

            });
          };

          if(scope.tosave.receipts) {

            scope.receipts = scope.tosave.receipts;

            // checa si tiene startDate y endingDate, si no, se agrega
            scope.receipts.forEach(function(item) {

              // console.log('item', item);

              if(item.prima_neta) {
                item.prima = item.prima_neta;
              } 

              if(item.prima_total) {
                item.total = item.prima_total;
              }

              if(!item.startDate) {
                if(item.fecha_inicio) {
                  item.startDate = datesFactory.convertDate(item.fecha_inicio);
                }
              }

              if(!item.endingDate) {
                if(item.fecha_fin) {
                  item.endingDate = datesFactory.convertDate(item.fecha_fin);

                }
              }

              item.vencimiento = datesFactory.convertDate(item.vencimiento);

            });

            scope.showreceipts = true;
            if(scope.tosave.poliza) {
              scope.poliza = scope.tosave.poliza;
            }

            if(scope.type == 2){
              // console.log('????????????????');
              scope.receipts.forEach(function(receipt, index) {
                // console.log('receipt_'+index, receipt);
                receipt.initDate = datesFactory.convertDate(receipt.fecha_inicio);
                receipt.endingDate = datesFactory.convertDate(receipt.fecha_fin);
                if(receipt.status == 5 || receipt.status == 6) {
                  scope.active_calculate = false;
                }
              })
            }

          } else {
            scope.receipts = [];
            scope.showreceipts = false;
          }

          // console.log('poliza', scope.poliza);
          if(scope.poliza.subTotal) {
            scope.poliza.subTotal = (parseFloat(scope.poliza.subTotal)).toFixed(2);
          } else {
            if(scope.poliza.primaNeta) {
              // console.log('ok');
              scope.calculateInputs(scope.poliza)
            }
          } 

          if(!scope.form) {
            if(scope.tosave.form) {
              var form = scope.tosave.form;
              if(!form.payment) {
                if(form.forma_de_pago) {
                  if(form.forma_de_pago.value) {
                    form.payment = form.forma_de_pago;
                  } else {
                    form.payment = {
                      value: form.forma_de_pago
                    };
                  }
                }


              } else {
                if(!form.payment.value) {
                  form.payment = {
                    value: form.payment
                  }
                }
              }
            }
          } else {

            var form = scope.form;
          }

          if(!scope.poliza) {
            scope.poliza = {
              iva: 16,
              primaTotal: 0
            };
          }



          if(scope.poliza.descuento) {
            var descuento_ = parseFloat(scope.poliza.descuento) / 100;
          } else {
            var descuento_ = 0;
          }

          var cantidad_desc = parseFloat(scope.poliza.primaNeta) * descuento_;
          scope.p_neta_desc = parseFloat(scope.poliza.primaNeta) - parseFloat(cantidad_desc);

          scope.calculateComision = function () {

              var prima_ = parseFloat(scope.poliza.primaNeta);
              var percent = parseFloat(form.comision_percent) / 100;
              if(scope.poliza.descuento) {

                var descuento_ = parseFloat(scope.poliza.descuento) / 100;
               
                var cantidad_descuento = parseFloat(prima_ * descuento_);
                var prima_descuento = prima_ - cantidad_descuento;

                scope.poliza.comision = (prima_ * percent).toFixed(2);
                scope.comision_desc = (prima_descuento * percent).toFixed(2);

              } else {
                // TODO: comision neta
                scope.poliza.comision = (prima_ * percent).toFixed(2);
                scope.comision_desc = 0;
              }
            // } else {
            //   // scope.poliza.descuento = 0;
            // }


          }

          if(scope.poliza.primaNeta == 0) {
            scope.poliza.primaNeta = 0;
          }

          if(scope.poliza.rpf == 0) {
            scope.poliza.rpf = 0;
          }

          if (scope.poliza.derecho == 0) {
            scope.poliza.derecho = 0;
          }

          if(scope.poliza.descuento == 0) {
            scope.poliza.descuento = 0;
          }

          scope.activarPP = function(param) {
            // console.log('pp', param);
            if(param) {
              scope.poliza.pp_percent_comision = null;
            }
          };

          scope.changeIva = function (poliza){
            if(poliza.ivaStatus == true){
                scope.calculate(poliza);
                var primaNeta = poliza.primaNeta;

                var desc = parseFloat(scope.poliza.descuento) * 0.01;
                var primaNetaDesc = primaNeta - (primaNeta * desc);
                scope.poliza.iva = parseFloat(primaNetaDesc) * 0.16;

                poliza.iva = parseFloat(primaNetaDesc) * 0.16;
                var subTotal = poliza.subTotal;

                poliza.primaTotal = parseFloat(subTotal) + parseFloat (poliza.iva);
                scope.poliza.primaTotal = poliza.primaTotal.toFixed(2);

                scope.poliza.iva = parseFloat(poliza.iva);               
                scope.poliza.iva = poliza.iva.toFixed(2);

                scope.calculateInputs(poliza);
               
              }
              if(poliza.ivaStatus == false){
                scope.calculate(poliza);

                var primaNeta = poliza.primaNeta;

                var desc = parseFloat(scope.poliza.descuento) * 0.01;
                var primaNetaDesc = primaNeta - (primaNeta * desc);

                scope.poliza.iva = parseFloat(primaNetaDesc) * 0.16;
                //Las pólizas que no sean de IVA llevan obligatorio el IVA
                //si el checkbox se manipula se pone en false y se hace lo mismo que en true
                poliza.iva = parseFloat(primaNetaDesc) * 0.16;
                var subTotal = poliza.subTotal;

                poliza.primaTotal = parseFloat(subTotal) - parseFloat (poliza.iva);
                scope.poliza.primaTotal = poliza.primaTotal.toFixed(2);

                scope.poliza.iva = parseFloat(poliza.iva);               
                scope.poliza.iva = poliza.iva.toFixed(2);
                scope.calculateInputs(poliza);
              }      
                 
          }

          scope.showIva = true;
         

          scope.activarDescuento = function(value) {
            scope.calculateInputs();
            scope.calculate(scope.poliza);
          }

          scope.firstYear = function(value) {
            if(scope.first_year){
              scope.first_year = false;
            } else {
              scope.first_year = true;
            }
          }

          scope.editIva = function (param) {

            scope.poliza[param] = String(scope.poliza[param]).replace(/^[A-Za-z]+$/, '');

            scope.edited_iva = true;
            if(scope.poliza.iva) {
              var iva_edited = scope.poliza.iva;
            } else {
              var iva_edited = 0;
            }
            scope.poliza.primaTotal = (parseFloat(scope.poliza.subTotal) + parseFloat(iva_edited)).toFixed(2);
          }

          scope.editPTotal = function() {
            scope.edited_ptotal = true;
            scope.ptotal_edited = angular.copy(scope.poliza.primaTotal);

          };

          scope.formatNumber =function (valor) {
            var nums = new Array();
            var simb = ",";

            if(!valor) {
              return;
            }

            if(typeof(valor) == 'number') {
              return valor;
            } else {
              
              valor = valor.toString();
              nums = valor.split("");
              var long = nums.length - 1;
              var patron = 3;
              var prox = 2;
              var res = "";

              while (long > prox) {
              if (prox == 2) {

              } else {
              nums.splice((long - prox), 0, simb);
              }
              prox += patron;

              }
              nums.splice(0, 0);


              for (var i = 0; i <= nums.length - 1; i++) {

              res += nums[i];
              }

              return valor;
            }

          }
       
          scope.showInput = false;
          scope.canDeleteReceipts = false;
          scope.editTable = function(param) {
            if (scope.form.policy_days_duration < 365) {
              if (scope.receipts.length > 1) {
                scope.canDeleteReceipts = true;
              }else{
                scope.canDeleteReceipts = false;
              }
            }else{
              scope.canDeleteReceipts =false;
            }
            scope.editedReceipts = true;
            if(scope.showInput == false){
              scope.showInput = true;
            } else {
              scope.showInput = false;
            }

            if(param) {
              SweetAlert.swal('¡Atención!','Revise la información de primas y fechas de cada recibo ya que pueden no ser exactas','warning');
              // fechas
              scope.receipts.forEach(function(obj) {

                 // validar fechas de cada recibo
                // Fechas de inicio 
                var date_obj_inicio = new Date(datesFactory.mesDiaAnio(obj.startDate));
                var date_form_inicio  = new Date(datesFactory.mesDiaAnio(form.startDate));

                // Fechas de fin

                if(date_obj_inicio < date_form_inicio) {
                  toaster.warning('La fecha de inició del recibo es menor a la fecha de inicio de la póliza.');
                  obj.startDate = '';
                  obj.fecha_inicio = '';

                }

                // fin
                var date_obj_fin = new Date(datesFactory.mesDiaAnio(obj.endingDate));
                var date_form_fin  = new Date(datesFactory.mesDiaAnio(form.endingDate));

                // Fechas de fin

                if(date_obj_fin > date_form_fin && scope.type != 2) {
                  toaster.warning('La fecha de fin del recibo es mayor a la fecha de fin de la póliza.');
                  obj.endingDate = '';
                  obj.fecha_fin = '';
                }

              });

              var demo = angular.copy(scope.receipts);

              demo.forEach(function(obj) {

                obj.recibo_numero = obj.recibo_numero;
                obj.prima_neta = parseFloat(obj.prima).toFixed(2);
                obj.rpf = parseFloat(obj.rpf).toFixed(2);
                obj.derecho = parseFloat(obj.derecho).toFixed(2);
                obj.iva =  parseFloat(obj.iva).toFixed(2);
                obj.subTotal =  parseFloat((obj.subTotal)).toFixed(2);
                obj.prima_total = parseFloat((obj.total)).toFixed(2);
                obj.total = parseFloat((obj.total)).toFixed(2);
                obj.receipt_type =  1;
                obj.comision = parseFloat((obj.comision)).toFixed(2);
                obj.fecha_inicio = obj.startDate;
                obj.vencimiento = obj.vencimiento ? obj.vencimiento : obj.startDate;
                obj.startDate = obj.startDate;
                obj.endingDate = obj.endingDate;
                obj.fecha_fin = obj.endingDate;
                obj.is_cat = obj.is_cat;
              });

              scope.tosave.recibos_poliza = demo;
              scope.tosave.receipts = demo;
            } else {
              scope.getValuesPoliza();
            }
            scope.getValuesPoliza();
          };

          // calculate
          function getSubtotal(parPoliza) {
            var sum = parseFloat(parPoliza.primaNeta) + parseFloat(parPoliza.rpf) + parseFloat(parPoliza.derecho);

            return Number((sum).toFixed(2));
          };

        
          scope.recalc_receipt = function(parReceipt, receipt_index) {
          
            var receipt_subtotal = parseFloat(parReceipt.prima) + parseFloat(parReceipt.rpf) + parseFloat(parReceipt.derecho);

            if(scope.form.ramo.ramo_code == 1) {
              parReceipt.iva = parseFloat(0).toFixed(2);
              parReceipt.total = parseFloat(receipt_subtotal).toFixed(2);

            } else {
              parReceipt.iva = parseFloat(receipt_subtotal * 0.16).toFixed(2);
              parReceipt.total = parseFloat(receipt_subtotal * 1.16).toFixed(2);
            }            
          };

          scope.validateFloatKeyPress = function(e, parReceipt, receipt_index, parType) {
            // enter
            if(e.keyCode == 13) {    

              var rec_prima = parseFloat(parReceipt.prima);
              var rec_rpf = parseFloat(parReceipt.rpf);
              var rec_derecho = parseFloat(parReceipt.derecho);
              var rec_iva = parseFloat(parReceipt.iva);
              var rec_total = parseFloat(parReceipt.total);
              var rec_comision = parseFloat(parReceipt.comision);


              if(parReceipt.recibo_numero == 1) {
                scope.prima_restante = angular.copy(scope.prima_c_descuento) - rec_prima;  
                scope.rpf_restante = angular.copy(scope.poliza.rpf) - rec_rpf;  
                scope.derecho_restante = angular.copy(scope.poliza.derecho) - rec_derecho;  
                scope.iva_restante = angular.copy(scope.poliza.iva) - rec_iva;  
                scope.total_restante = angular.copy(parseFloat(scope.poliza.primaTotal)) - rec_total; 
                // console.log('comision_importe', scope.comision_importe); 
                scope.comision_restante = angular.copy(scope.comision_importe) - rec_comision;  
              }

              if(parReceipt.recibo_numero > 1) {

                if(!isNaN(rec_prima)) {
                  scope.prima_restante = scope.prima_restante - rec_prima;
                }
                if(!isNaN(rec_rpf)) {
                  scope.rpf_restante = scope.rpf_restante - rec_rpf;
                }
                if(!isNaN(rec_derecho)) {
                  scope.derecho_restante = scope.derecho_restante - rec_derecho;
                }
                if(!isNaN(rec_iva)) {
                  scope.iva_restante = scope.iva_restante - rec_iva;
                }
                if(!isNaN(rec_total)) {
                  scope.total_restante = scope.total_restante - rec_total;
                } 
                if(!isNaN(rec_comision)) {
                  scope.comision_restante = scope.comision_restante - rec_comision;
                }

              }

              var receipts_lenght = angular.copy(scope.receipts.length);


              scope.receipts.forEach(function(rec_item, rec_item_index) {
                var item__ = rec_item_index + 1;
           
                if(item__ <= parReceipt.recibo_numero) {

                  receipts_lenght = receipts_lenght - 1; 

                  if(item__ == parReceipt.recibo_numero) {
                    var prima___ = scope.new_prima_restante ? scope.new_prima_restante : scope.prima_restante;
                    scope.prima_x_recibo = prima___  / receipts_lenght;

                    var rpf__ = scope.rpf_restante;
                    scope.rpf_x_recibo = rpf__ / receipts_lenght;

                    var derecho__ = scope.derecho_restante;
                    scope.derecho_x_recibo = derecho__ / receipts_lenght;
                    
                    var iva__ = scope.iva_restante;
                    scope.iva_x_recibo = iva__ / receipts_lenght;
                    
                    var total__ = scope.total_restante;
                    scope.total_x_recibo = total__ / receipts_lenght;
                    
                    var comision__ = scope.comision_restante;
                    scope.comision_x_recibo = comision__ / receipts_lenght;
                  }

                } else {
                  if(parType == 1) {

                    rec_item.prima = angular.copy(scope.prima_x_recibo).toFixed(2);
                    rec_item.prima_neta = angular.copy(scope.prima_x_recibo).toFixed(2);
                    scope.recalc_receipt(rec_item, rec_item_index);
                  }

                  rec_item.rpf = angular.copy(scope.rpf_x_recibo).toFixed(2);
                  rec_item.derecho = angular.copy(scope.derecho_x_recibo).toFixed(2);
                  rec_item.iva = angular.copy(scope.iva_x_recibo).toFixed(2);
                  if(parType == 5) {
                    rec_item.total = angular.copy(scope.total_x_recibo).toFixed(2);
                  }  else if (parType == 6) {
                    rec_item.comision = angular.copy(scope.comision_x_recibo).toFixed(2);
                  }
                } 

              });

            }
          };

          scope.getValuesPoliza = function() {
            // console.log('poliza', scope.poliza);

            var desc__ = angular.copy(parseFloat(scope.poliza.descuento));
            var prima_neta__ = angular.copy(parseFloat(scope.poliza.primaNeta)); 
            var desc_import__ = angular.copy(parseFloat(prima_neta__ / 100) * desc__);

            if(scope.form.comision) {
              scope.comision_importe = angular.copy(parseFloat(prima_neta__ / parseInt(scope.form.comision.comission)));
                // console.log('comision_importe', comision_importe);
            } else if(scope.form.comision_percent) {
              scope.comision_importe = angular.copy(parseFloat(prima_neta__ / parseFloat(scope.form.comision_percent)));

            }

            if(scope.poliza.aplicarDescuento) {
              scope.prima_c_descuento = angular.copy(prima_neta__ - desc_import__);
            } else {
              scope.prima_c_descuento = angular.copy(prima_neta__);
            }
            // console.log('aaa', scope.prima_c_descuento);
          };

          // diferencia entre fechas
          function monthDiff(d1, d2) {
              var months;
              months = (d2.getFullYear() - d1.getFullYear()) * 12;
              months -= d1.getMonth() + 1;
              months += d2.getMonth();
              return months <= 0 ? 0 : months;
          }

          function editar_fecha(fecha, intervalo) {
 
            // var separador = separador || "-";
            var separador = '/';
            var arrayFecha = fecha.split(separador);
            var dia = arrayFecha[0];
            var mes = arrayFecha[1];
            var anio = arrayFecha[2]; 
            
            var fechaInicial = new Date(anio, mes - 1, dia);
            var fechaFinal = fechaInicial;
            // if(dma=="m" || dma=="M"){
              fechaFinal.setMonth(fechaInicial.getMonth()+parseInt(intervalo));
            // }else if(dma=="y" || dma=="Y"){
            //   fechaFinal.setFullYear(fechaInicial.getFullYear()+parseInt(intervalo));
            // }else if(dma=="d" || dma=="D"){
            //   fechaFinal.setDate(fechaInicial.getDate()+parseInt(intervalo));
            // }else{
            //   return fecha;
            // }
            dia = fechaFinal.getDate();
            mes = fechaFinal.getMonth() + 1;
            anio = fechaFinal.getFullYear();
           
            dia = (dia.toString().length == 1) ? "0" + dia.toString() : dia;
            mes = (mes.toString().length == 1) ? "0" + mes.toString() : mes;
           
            return dia + "/" + mes + "/" + anio;
          }

          scope.delete_receipt = function(event, param, index,m) {
            // if (scope.permiso_delRecibo) {
              if(scope.receipts.length > 1) {
                if(!scope.tosave.delete_receitps) {
                  scope.tosave.delete_receitps = [];
                }
                scope.tosave.delete_receitps.push(param);
                if (param.poliza) {
                  scope.recPoliza = param.poliza
                }else{
                  scope.recPoliza = ''
                }
                
                scope.receipts.splice(index, 1);
              } else {
                SweetAlert.swal('Debe mantener por lo menos un recibo.');
              }
            // }else{
            //   SweetAlert.swal('No tiene permiso de eliminar recibos');
            // }
          }

          scope.add_receipt = function() {

            var new_receipt = {
              "recibo_numero": scope.receipts.length + 1,
              "prima_neta": 0,
              "prima": 0,
              "rpf": 0,
              "derecho": 0,
              "iva": "",
              "subTotal": 0,
              "prima_total": "",
              "total": "",
              "comision": "",
              "receipt_type": 2,
              "fecha_inicio": "",
              "vencimiento": "",
              "startDate": "",
              "endingDate": "",
              "fecha_fin": "",
              "delivered": false
            }
            scope.receipts.push(new_receipt);
          };

          scope.pp_percent_comision = null;


          function swalReceipts() {
            // if (scope.permiso_delRecibo) {
              SweetAlert.swal({
                title: '¿Está seguro?',
                text: "Al recalcular el recibo de la fianza, perderá su información de pago ¿Está de acuerdo?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si, estoy seguro.",
                cancelButtonText: "Cancelar",
                closeOnConfirm: true
              }, function(isConfirm) {
                  if (isConfirm) {
                    scope.continue_1 = true;
                    scope.calculate(scope.poliza);
                  }
                  else {
                    scope.continue_ = false;
                  }
              });
            // }else{
            //   SweetAlert.swal('No tiene permiso de eliminar recibos, por lo que no puede recalcularlos');              
            // }
          }


          scope.calculate = function (poliza) {
            scope.tosave.delete_receitps = [];
            // console.log('form', scope.form);
            SweetAlert.swal('¡Atención!','Revise la información de primas y fechas de cada recibo ya que pueden no ser exactas','warning');
            if(!scope.form.payment && scope.type !== 2) {
              SweetAlert.swal('¡Cuidado!','No has seleccionado una frecuencia de pago','error');
              return;
            }

            scope.continue_ = true;
            // for de recibos de fianza
            if(scope.type == 2 && scope.receipts.length) {

              for (var i in scope.receipts) {
                var item = scope.receipts[i]; 
                if(item.status == 1 && item.receipt_type == 1) {
                  if(scope.continue_ && scope.continue_1) {
                  } else {
                    swalReceipts();                  
                    scope.continue_ = false;
                  }

                }
              }  

              if(!scope.continue_) {
                return;
              }   

            }

            // console.log('Calculando.......');
            if(scope.poliza.fy) {
              scope.first_year = true;
            }

            if(!scope.form.comision_percent) {
              scope.form.comision_percent = 0;
            }

            if(form.ceder_porcentaje) {
              var porcentaje_cedido = scope.tosave.give_comision;
              var porcentaje_final = 100 - parseInt(porcentaje_cedido);
            }

            // REVISAR SI ES O NO MULTIANUAL 
            if(form.startDate && form.endingDate) {
              var date_1 = (form.startDate).split('/');
              var date_2 = (form.endingDate).split('/');
            }

            var anio_inicio = parseInt(date_1[2]);
            var anio_fin    = parseInt(date_2[2]);

            // años de vigencia póliza
            var anios_vigencia = anio_fin - anio_inicio;

              if (form.payment == '1') {
                var total_recibos = 12
              } else if (form.payment == '2') {
                var total_recibos = 6
              } else if (form.payment == '3') {
                var total_recibos = 4
              } else if (form.payment == '6') {
                var total_recibos = 2
              } else if (form.payment == '12') {
                var total_recibos = 1
              } else if (form.payment == '5') {
                var total_recibos = 1
              }

              if(anios_vigencia > 1){
                var total_recibos = total_recibos * anios_vigencia
              }

              if(scope.poliza.descuento) {
                if(parseFloat(scope.poliza.descuento) > 100) {
                  scope.poliza.descuento = 100;
                  SweetAlert.swal('Error','El descuento no pude ser mayor al 100%.','error');

                  return;
                }
              }

              if(form.policy_days_duration < 365) {
                scope.poliza_menor_anio = true;
              } else {
                scope.poliza_menor_anio = false;
              }


              if(scope.poliza.configDerecho || scope.poliza.configRPF) {
                if (scope.edited_iva) {
                  SweetAlert.swal('Los resultados en los recibos pueden no ser exactos, favor de revisarlos manualmente.');
                }
              }

              if(!scope.poliza.descuento) {
                scope.poliza.descuento = 0;
              }
              scope.poliza.aplicarDescuento = poliza.aplicarDescuento;
              if(poliza.aplicarDescuento) {            
                var desc_percent =  parseFloat(scope.poliza.descuento) / 100;
                var desc_importe = parseFloat(angular.copy(scope.poliza.prima)) * parseFloat(desc_percent);

              } else {
                var desc_importe = 0;
              }

              if(isNaN(desc_importe)) {
                desc_importe = 0;
              }

              if(poliza.aplicarDescuento) {
                desc_importe = 0;
              }

              poliza.prima = parseFloat(angular.copy(poliza.prima)) - desc_importe;
              poliza.rpf = poliza.rpf;
              poliza.derecho = poliza.derecho;
              scope.receipts = [];

              var ramo_code = scope.form.ramo.ramo_code;
              if(ramo_code == 1){
                poliza.ivaStatus = false;
                scope.showIva = false;
                poliza.iva = 0.00;
                scope.poliza.iva = 0.00;               
              }else{
                poliza.ivaStatus = true;
                scope.showIva = true;
              }
              if(scope.type == 2){
                var form_ = 5
              } else {
                if(!form.payment.value) {
                  if(form.payment) {
                    var form_ = form.payment;
                  }
                } else {
                  var form_ = form.payment.value;
                }
              }

              if(!poliza.derecho) {
                poliza.derecho = 0;
              }

              if(!poliza.rpf) {
                poliza.rpf = 0;
              }

              if(poliza.descuento) {
                var descuento_ = parseFloat(poliza.descuento) / 100;
              } else {
                var descuento_ = 0;
              }

              if(poliza.aplicarDescuento) {
                var desc_percent =  parseFloat(poliza.descuento) / 100;
                var desc_importe = parseFloat(angular.copy(poliza.primaNeta)) * parseFloat(desc_percent);
                var cantidad_desc = parseFloat(poliza.primaNeta) - desc_importe;

              } else {

                var cantidad_desc = parseFloat(poliza.primaNeta) ;
              }

              scope.p_neta_desc = parseFloat(cantidad_desc);
              scope.subtotal_desc = parseFloat(scope.p_neta_desc) + parseFloat(poliza.rpf) + parseFloat(poliza.derecho);
              
              if(scope.edited_iva) {
                scope.iva_desc = scope.poliza.iva;
              } else {
                scope.iva_desc = parseFloat(scope.subtotal_desc) * 0.16;
              }
              scope.p_total_desc = parseFloat(scope.subtotal_desc) + parseFloat(scope.iva_desc);
              var prima_neta = parseFloat(poliza.primaNeta);
              var derecho = parseFloat(poliza.derecho);
              var rpf = parseFloat(poliza.rpf);

              if(!scope.edited_iva) {
                scope.poliza.iva = (parseFloat(scope.iva_desc)).toFixed(2);
              } else {
                scope.poliza.iva = (parseFloat(scope.poliza.iva)).toFixed(2);
                
                if(scope.edited_ptotal) {
                   scope.poliza.primaTotal = scope.ptotal_edited; 
                } else {
                  scope.poliza.primaTotal = (parseFloat(scope.poliza.subTotal) + parseFloat(scope.poliza.iva)).toFixed(2);
                }
              }


              scope.tosave.p_neta = prima_neta;
              scope.tosave.derecho = derecho;
              scope.tosave.rpf = rpf;
              if(scope.tosave.give_comision) {
                scope.tosave.give_comision.descuento = poliza.descuento ? poliza.descuento : 0;
              }

              if(scope.form.comision_percent && scope.poliza.primaNeta) {
                // console.log('asdkfklsd');
                var primaNeta = parseFloat(scope.poliza.primaNeta);
                var comision = parseFloat(scope.form.comision_percent);

                comision = parseFloat(comision / 100);

                scope.tosave.comision_currency = parseFloat(prima_neta * comision).toFixed(2); 
                scope.tosave.comision_currency = parseFloat(scope.tosave.comision_currency);

              }


              var IVA = 0;
              var TOTAL_IVA = 1;

              if(!scope.edited_iva) {
                var poliza_iva = scope.iva_desc;
              } else {
                var poliza_iva = (parseFloat(scope.poliza.iva)).toFixed(2);
              }


              scope.tosave.iva = (parseFloat(poliza_iva)).toFixed(2);

              poliza.iva = scope.tosave.iva;

              if(!form.payment || scope.type == 2) {
                if(scope.type !== 2){
                  toaster.info(MESSAGES.ERROR.SELPAY);
                } else {
                  form.payment = 5;
                function getNumber (num) {
                  var num2 = Math.ceil(num);
                  return new Array(num2)
                };
              

                function getTotal (poliza) {


                  if(scope.edited_ptotal) {
                    var p_total = parseFloat(scope.ptotal_edited);
                    poliza.primaTotal = parseFloat(scope.ptotal_edited);
                  } else {
                    var p_total = parseFloat(scope.p_total_desc);
                  }



                  scope.tosave.p_total = (p_total).toFixed(2);          
                  return parseFloat(p_total);
                };

                function getPrimaTotalReceipt (parObj, parAmonunts) {

                  var prima_neta_ = parseFloat(parObj.prima);
                  var subtotal_ = parseFloat(prima_neta_) + parseFloat(parObj.rpf) + parseFloat(parObj.derecho)
                  var iva_ = getIva(parObj, parAmonunts);

                  if(scope.edited_ptotal) {
                    var prima_total_ = parseFloat(parObj.primaTotal);
                  } else {
                    var prima_total_ = parseFloat(subtotal_ + parseFloat(iva_));
                  }



                  return (prima_total_).toFixed(2);
                };

                function getIva (parValue, parAmonunts) {
                  
                  var prima_neta_ = parseFloat(parValue.prima);
                  var subtotal_ = parseFloat(prima_neta_) + parseFloat(parValue.rpf) + parseFloat(parValue.derecho)
                  

                  if(scope.edited_iva) {
                    var iva_ = parseFloat(scope.poliza.iva) / parAmonunts;
                  } else {
                    var iva_ = subtotal_ * 0.16;
                  }
         
                  if(ramo_code == 1) {
                    var iva_ = 0.00;
                  }

                  return (iva_).toFixed(2);
                };

                function comissionCalc(parPneta) {


                  var p_neta_ = parPneta;

                  if(form.comision_percent) 
                  {
                    var comision_ = parseFloat(form.comision_percent) / 100;
                  }
                  else if(form.comision) 
                  {
                    if(form.comision.comission) {
                      var comision_ = parseFloat(form.comision.comission) / 100;
                    } else if(form.comision_percent) {
                      var comision_ = parseFloat(form.comision_percent) / 100;
                    }
                  } else 
                  {
                    var comision_ = 0;
                  }

                 if(form.ceder_comision) {
   
                    var comision_ = parseFloat(form.comision_percent) / 100;
                    scope.tosave.comision_percent = form.comision_percent;
                    if(!scope.tosave.comision) {

                      scope.tosave.comision = comision_;
                    }
                    scope.tosave.udi = form.comision_percent; 
                  }

                  if(comision_) {

                    var res_comision_pol = parseFloat(p_neta_ * comision_).toFixed(2);

                    if(form.ceder_porcentaje) {
                      var comision_ceder = (100 - parseFloat(scope.tosave.give_comision)) / 100;
                      var res_comision_cedida = parseFloat(res_comision_pol) * comision_ceder;
                      var result = res_comision_cedida;

                    } else {
                      var result = res_comision_pol;
                    }

                  } else {
                    var result = poliza.comision
                  }

                  scope.poliza.comision_insurance = parseFloat(result).toFixed(2);


                  if(scope.type == 2) {
     
                    if(scope.poliza.pp) {
                      var pp_percent      = parseFloat(scope.poliza.pp_percent_comision);
                      var new_comision    = pp_percent / 100; 
                      var fianzas_result  = parseFloat(result * new_comision);

                      return (fianzas_result).toFixed(2);
                    } else {
                      return result;
                    }
                  } else {
                    return result;
                  }
                };

                receipts = [];
                scope.showreceipts = true;
                if(form.startDate){
                  if(form.cambioPago){
                    var initDate = new Date(form.start_of_validity);
                  } else {
                    var initDate = new Date(datesFactory.mesDiaAnio(form.startDate));
                  }
                } else {
                  var initDate = new Date(form.start_of_validity);
                }
                if(isNaN(initDate)) {
                  initDate = new Date(form.startDate);
                }
             
                poliza.primaTotal = getTotal(poliza).toFixed(2);

                amountReceipts = Math.ceil(amountReceipts);

                if(form.payment == 5) {
                  amountReceipts = 1;
                  initDate = new Date(datesFactory.toDate(form.startDate));
                  endDate = angular.copy(initDate)
                  endDate = new Date(endDate.setYear(endDate.getFullYear() + 1));
                } 

                var prima_neta_total = 0;
                var arrayLen = getNumber(amountReceipts);

                if(poliza.aplicarDescuento) {
                  var percent_ = parseFloat(poliza.descuento) /100;
                  var importe_ = parseFloat(poliza.primaNeta) * percent_;
                  var prima_ =  parseFloat(poliza.primaNeta) - importe_;
                } else {
                  var prima_ =  parseFloat(poliza.primaNeta);
                }

                if(scope.edited_iva) {
                  poliza.iva = scope.poliza.iva;
                  poliza.primaTotal = scope.poliza.primaTotal
                }
                var obj = {
                  prima: prima_ / amountReceipts,
                  rpf: poliza.rpf / amountReceipts,
                  derecho: poliza.derecho / amountReceipts,
                  iva: poliza.iva,
                  subTotal: poliza.subTotal / amountReceipts,
                  primaTotal: poliza.primaTotal / amountReceipts,
                };


                for (var i = 0; i < arrayLen.length; i++) {
                  // Check options
                  if (poliza.configDerecho) {
                   
                    if (i === 0) {
                      if(poliza.derecho) {
                        obj.derecho = parseFloat(poliza.derecho);
                      } else {
                        obj.derecho = 0;
                      }
                    } else {
                      obj.derecho = 0;
                    }
                  }

                  if (poliza.configRPF) {
                   
                    if (i === 0) {
                      if(poliza.rpf) {
                        obj.rpf = parseFloat(poliza.rpf);
                      } else {
                        obj.rpf = 0;
                      }
                    } else {
                      obj.rpf = 0;
                    }
                  }

                  var date_policy = new Date(datesFactory.toDate(form.startDate));
                  var day_policy = date_policy.getDate();

                  var date_receipt = new Date(initDate);
                  var day_ = date_receipt.getDate();
                  var month_ = date_receipt.getMonth() + 1;
                  var year_ = date_receipt.getFullYear();

                  function sumarDias(fecha, dias){
                    fecha.setDate(fecha.getDate() + dias);
                    return fecha;
                  }
            
                  function sumMonths (parDate, parNum) {

                    var new_value = sumarDias(parDate, 1);
                    var new_month =  parDate.setMonth(new_value.getMonth() + parNum);
                    var ok_value = sumarDias(new Date(new_month), -1);

                    return ok_value;
                  }

                  if(scope.type == 1){
                    if(day_ !== day_policy) {
                        endDate = new Date(new Date(year_, month_, day_policy)).setHours(11, 59, 59);  
                    } else {
                      endDate = new Date(new Date(moment(initDate).add(form_, 'months')).setHours(11,59,59));
                    }
                  }


                  var subTotal = obj.prima + obj.rpf + obj.derecho;

                  prima_neta_total + parseFloat((obj.prima).toFixed(2));

                  var receipt = {
                    'recibo_numero': i+1,
                    'prima_neta': parseFloat((obj.prima).toFixed(2)),
                    'prima': parseFloat((obj.prima).toFixed(2)),
                    'rpf': parseFloat((obj.rpf).toFixed(2)),
                    'derecho': parseFloat((obj.derecho).toFixed(2)),
                    'iva': getIva(obj, amountReceipts),
                    'subTotal': parseFloat((subTotal).toFixed(2)),
                    'prima_total': getPrimaTotalReceipt(obj, amountReceipts),
                    'total': getPrimaTotalReceipt(obj, amountReceipts),
                    'receipt_type': 1,
                    'comision': parseFloat(comissionCalc(parseFloat((obj.prima).toFixed(2)))),
                    'delivered': false,
                  };

                  if(scope.form.domiciliado == 'true') {
                    receipt.is_cat = true;
                  }
                  receipt.fecha_inicio = datesFactory.convertDate(initDate);
                  receipt.vencimiento = datesFactory.convertDate(initDate) ? datesFactory.convertDate(initDate) : null;

                  receipt.startDate = datesFactory.convertDate(initDate);
                  receipt.endingDate = datesFactory.convertDate(endDate);
                  receipt.fecha_fin = datesFactory.convertDate(endDate);

                  initDate = new Date(endDate);

                  scope.receipts.push(angular.copy(receipt));
              

                  
                  scope.tosave.poliza = scope.poliza;
                  scope.tosave.recibos_poliza = scope.receipts;
                  scope.tosave.receipts = scope.receipts;
                }

                if(ramo_code == 1) {
                  poliza.ivaStatus = false;
                  scope.showIva = false;
                  poliza.iva = 0.00;
                  scope.poliza.iva = 0.00; 
                  primaTotalNum =  poliza.subTotal;
                  primaTotalNum = parseFloat(primaTotalNum).toFixed(2);
                  scope.poliza.primaNeta = scope.formatNumber(poliza.primaNeta);
                  scope.poliza.rpf= scope.formatNumber(poliza.rpf);
                  scope.poliza.derecho = scope.formatNumber(poliza.derecho);
                  subTotalNum =  poliza.subTotal;
                  subTotalNum = parseFloat(subTotalNum).toFixed(2);
                  scope.poliza.subTotal = scope.formatNumber(subTotalNum);
                  scope.poliza.iva = scope.formatNumber(poliza.iva);

                  if(scope.edited_ptotal) {
                     scope.poliza.primaTotal = scope.ptotal_edited; 
                  } else {
                    scope.poliza.primaTotal = scope.formatNumber(primaTotalNum); 
                  }

                  //---------normal-------

                } else {
                  poliza.ivaStatus = true;
                  scope.showIva = true;
                  scope.poliza.primaNeta = scope.formatNumber(poliza.primaNeta);
                  scope.poliza.rpf= scope.formatNumber(poliza.rpf);
                  scope.poliza.derecho = scope.formatNumber(poliza.derecho);
                  subTotalNum =  poliza.subTotal;
                  subTotalNum = parseFloat(subTotalNum).toFixed(2);
                  scope.poliza.subTotal = scope.formatNumber(subTotalNum);
                  scope.poliza.iva = scope.formatNumber(poliza.iva);
                  primaTotalNum =  poliza.primaTotal;
                  primaTotalNum = parseFloat(primaTotalNum).toFixed(2);
                  if(scope.edited_ptotal) {
                     scope.poliza.primaTotal = scope.ptotal_edited; 
                  } else {
                    scope.poliza.primaTotal = scope.formatNumber(primaTotalNum); 
                  }
                }               

                if (!scope.receipts[0].startDate) {
                  toaster.warning("Agregar manualmente las fechas.");
                }

              }
            } else {
              function getNumber (num) {
                var num2 = Math.ceil(num);
                return new Array(num2)
              };
            

              function getTotal (poliza) {
                
                if(scope.edited_ptotal) {
                  var p_total = parseFloat(scope.ptotal_edited); 
                  poliza.primaTotal = parseFloat(scope.ptotal_edited);
                } else {
                  var p_total = parseFloat(scope.p_total_desc);
                }

                scope.tosave.p_total = (p_total).toFixed(2);          
                return parseFloat(p_total);
              };

              function getPrimaTotalReceipt (parObj, parAmonunts) {

                var prima_neta_ = parseFloat(parObj.prima);
                var subtotal_ = parseFloat(prima_neta_) + parseFloat(parObj.rpf) + parseFloat(parObj.derecho);
                var iva_ = getIva(parObj, parAmonunts);

                if(scope.edited_ptotal) {
                  var prima_total_ = parseFloat(parObj.primaTotal);
                } else {
                  var prima_total_ = parseFloat(subtotal_ + parseFloat(iva_));
                }

                return (prima_total_).toFixed(2);

              }

              function getIva (parValue, parAmonunts) {
                
                var prima_neta_ = parseFloat(parValue.prima);
                var subtotal_ = parseFloat(prima_neta_) + parseFloat(parValue.rpf) + parseFloat(parValue.derecho);

                if(scope.edited_iva) {
                  var iva_ = parseFloat(scope.poliza.iva) / parAmonunts;
                } else {
                  var iva_ = subtotal_ * 0.16;
                }
       
                if(ramo_code == 1) {
                  var iva_ = 0.00;
                }

                return (iva_).toFixed(2);
              }

              function comissionCalc(parPneta) {
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
                  })
                }
                  var p_neta_ = parPneta;

                  if(scope.tosave.comision) {
                    // var comision_ = scope.tosave.comision;
                  } else {

                      var comision_ = parseFloat(form.comision_percent) / 100;

                    if(form.comision_percent) 
                    {
   
                      var comision_ = parseFloat(form.comision_percent) / 100;

                    }
                    else if(form.comision) 
                    {

                      if(form.comision.comission) {
                        var comision_ = parseFloat(form.comision.comission) / 100;
                      } else if(form.comision_percent) {
                        var comision_ = parseFloat(form.comision_percent) / 100;
                      }
                    } else {
                      var comision_ = 0;
                    }
                  }

                 if(form.ceder_comision) {
                    scope.tosave.comision_percent = form.comision_percent;
                    var comision_ = parseFloat(form.comision_percent) / 100;
                    scope.tosave.comision = comision_;

                    scope.tosave.udi = form.comision_percent; 
                  }


                  if(comision_ || comision_ == 0) {

                    var res_comision_pol = parseFloat(p_neta_ * comision_).toFixed(2);

                    if(form.ceder_porcentaje) {
                      var comision_ceder = (100 - parseFloat(scope.tosave.give_comision)) / 100;
                      var res_comision_cedida = parseFloat(res_comision_pol) * comision_ceder;
                      var result = res_comision_cedida;

                    } else {
                      var result = res_comision_pol;
                    }

                  } else {
                    var result = poliza.comision
                  }

                  scope.poliza.comision_insurance = parseFloat(result).toFixed(2);

                  if(scope.type == 2) {
     
                    // result es el 100%
                    if(scope.poliza.pp) {
                      // scope.poliza.pp_percent_comision
                      var pp_percent      = parseFloat(scope.poliza.pp_percent_comision);
                      var new_comision    = pp_percent / 100; 
                      var fianzas_result  = parseFloat(result * new_comision);

                      return (fianzas_result).toFixed(2);
                    } else {
                      return result;
                    }
                  } else {

                    return parseFloat(result).toFixed(2);
                  }
                };

                // Termina calcComission

              receipts = [];
              scope.showreceipts = true;
              if(form.startDate){
                if(form.cambioPago){
                  var initDate = new Date(form.start_of_validity);
                } else {
                  var initDate = new Date(datesFactory.mesDiaAnio(form.startDate));
                }
              } else {
                var initDate = new Date(form.start_of_validity);
              }
              if(form.endingDate){
                var endDate = new Date(datesFactory.mesDiaAnio(form.endingDate));
              } else {
                var endDate = new Date(form.end_of_validity)
              }

              if(isNaN(initDate)) {
                initDate = new Date(form.startDate);
              }

              if(isNaN(endDate)) {
                endDate = new Date(form.endingDate);
              }

              var months = helpers.monthDiff(initDate, endDate);

              // Calculate diff between dates
              var dateDiff = moment(endDate).diff(moment(initDate), 'days');
              var amountReceipts = months / form_;
              
              /* Solución a recibos en el mismo mes*/
              if(amountReceipts == 0) {
                amountReceipts = 1;
              }
                              
              poliza.primaTotal = getTotal(poliza).toFixed(2);

              amountReceipts = Math.ceil(amountReceipts);

              if(form.payment == 5) {
                amountReceipts = 1;
             
                initDate = new Date(datesFactory.toDate(form.startDate));
                endDate = new Date(datesFactory.toDate(form.endingDate));
              } else if(form.payment.value == 5) {
                amountReceipts = 1;
             
                initDate = new Date(datesFactory.toDate(form.startDate));
                endDate = new Date(datesFactory.toDate(form.endingDate));
              }

              // console.log('initDate', initDate);

              var prima_neta_total = 0;
              var arrayLen = getNumber(amountReceipts);
              // Logic from vm

              if(poliza.aplicarDescuento) {
                var percent_ = parseFloat(poliza.descuento) /100;
                var importe_ = parseFloat(poliza.primaNeta) * percent_;
                var prima_ =  parseFloat(poliza.primaNeta) - importe_;
              } else {
                var prima_ =  parseFloat(poliza.primaNeta);
              }

              if(scope.edited_iva) {
                poliza.iva = scope.poliza.iva;
                poliza.primaTotal = scope.poliza.primaTotal
              }

              function amountFirstReceipt (parAmount) {

                if(parAmount) {
                  var value_ = parseFloat(parAmount);
                  return value_;
                } else {
                  return 0;
                }

              };

              var obj = {
                // prima: poliza.primaNeta / amountReceipts,
                prima: prima_ / amountReceipts,
                rpf: poliza.rpf / amountReceipts,
                derecho: poliza.derecho / amountReceipts,
                iva: poliza.iva,
                subTotal: poliza.subTotal / amountReceipts,
                primaTotal: poliza.primaTotal / amountReceipts
              };

              function pad(d) {
                  return (d < 10) ? '0' + d.toString() : d.toString();
              }

              for (var i = 0; i < arrayLen.length; i++) {

                var start_date = (form.startDate).split('/');
                var year_initDate = new Date(initDate).getFullYear();
                var month_initDate = pad(new Date(initDate).getMonth() + 1);
                var day_initDate = pad(new Date(initDate).getDate());
                var date_init = day_initDate + '/'+ month_initDate + '/' + year_initDate;
                var date_end = start_date[0] + '/' + start_date[1] + '/' + String(parseInt(start_date[2]) +1);

                // console.log('first_year', scope.first_year);
                if(scope.first_year){
                  // console.log('first_year');
                  if(anios_vigencia > 1) {
                    if(date_init == date_end) {
                      break;
                    } 
                  }
                }

                if (poliza.configDerecho) {
                  
                  if(scope.poliza_menor_anio) {
                    if(i == (arrayLen.length -1)) {
                      obj.derecho = amountFirstReceipt(poliza.derecho);
                    } else {
                      obj.derecho = 0;
                    }

                  } else {
                    if(i == 0) {
                      obj.derecho = amountFirstReceipt(poliza.derecho);
                    } else {
                      obj.derecho = 0;
                    }
                  }
                }

                if (poliza.configRPF) {
                  if(scope.poliza_menor_anio) {
                    if(i == (arrayLen.length -1)) {
                      obj.rpf = amountFirstReceipt(poliza.rpf);
                    } else {
                      obj.rpf = 0;
                    }

                  } else {
                    if(i == 0) {
                      obj.rpf = amountFirstReceipt(poliza.rpf);
                    } else {
                      obj.rpf = 0;
                    }
                  }
                }

                var date_policy = new Date(datesFactory.toDate(form.startDate));
                var day_policy = date_policy.getDate();

                var date_receipt = new Date(initDate);
                var day_ = date_receipt.getDate();
                var month_ = date_receipt.getMonth() + 1;
                var year_ = date_receipt.getFullYear();

                function sumarDias(fecha, dias){
                  fecha.setDate(fecha.getDate() + dias);
                  return fecha;
                }
          
                function sumMonths (parDate, parNum) {

                  var new_value = sumarDias(parDate, 1);
                  var new_month =  parDate.setMonth(new_value.getMonth() + parNum);
                  var ok_value = sumarDias(new Date(new_month), -1);

                  return ok_value;
                }


                if(day_ !== day_policy) {

                    var date_1 = new Date(year_, month_, day_policy);
                    var date_2 = new Date(year_, date_receipt.getMonth() + form_, 0);

                    if(day_policy == 31 || day_policy == 30 || day_policy == 28 || day_policy == 29) {

                      var day__ = 0;
                      var month___ = date_receipt.getMonth() + parseInt(form_) +1;
                      if(day_policy == 30) {
                        day__ = 30; 
                        month___ = date_receipt.getMonth() + parseInt(form_);
                      } else if(day_policy == 28) {
                        day__ = 28; 
                        month___ = date_receipt.getMonth() + parseInt(form_);
                      } else if(day_policy == 29) {
                        day__ = 29; 
                        month___ = date_receipt.getMonth() + parseInt(form_);
                      }

                      endDate = new Date(new Date(year_, month___, day__)).setHours(11, 59, 59);  
                    
                    } else {
                      endDate = new Date(new Date(year_, month_ , day_policy)).setHours(11, 59, 59);  
                    }
                
                } else {
                  endDate = new Date(new Date(moment(initDate).add(form_, 'months')).setHours(11,59,59));
                }

                var subTotal = obj.prima + obj.rpf + obj.derecho;

                prima_neta_total + parseFloat((obj.prima).toFixed(2));

                if(scope.poliza_menor_anio) {

                  var receipt = {
                    'recibo_numero': (arrayLen.length) - i,
                    'prima_neta': parseFloat((obj.prima).toFixed(2)),
                    'prima': parseFloat((obj.prima).toFixed(2)),
                    'rpf': parseFloat((obj.rpf).toFixed(2)),
                    'derecho': parseFloat((obj.derecho).toFixed(2)),
                    'iva': getIva(obj, amountReceipts),
                    'subTotal': parseFloat((subTotal).toFixed(2)),
                    'prima_total': getPrimaTotalReceipt(obj, amountReceipts),
                    'total': getPrimaTotalReceipt(obj, amountReceipts),
                    'receipt_type': 1,
                    'comision': parseFloat(comissionCalc(parseFloat((obj.prima).toFixed(2)))),
                    'delivered': false,
                  };

                  if(scope.domiciliado == 'true') {
                    receipt.is_cat = true;
                  }

                  var pay_form_ = String(form.payment);

                  if(pay_form_ !== '5' || pay_form_ !== '12') {

                    if(i == 0) {
                      endDate = form.endingDate;
                      initDate = editar_fecha((form.endingDate), -form_);                      
                    } else {
                      endDate = initDate;
                      initDate = editar_fecha((endDate), -form_);
                      if(i+1 == arrayLen.length) {
                        initDate = form.startDate;
                      }
                     
                    }
                  }

                  var init__ = datesFactory.toDate(initDate);
                  var init_policy__ = datesFactory.toDate(form.startDate);

                  if(pay_form_ !== '5' || pay_form_ !== '12') {
                    if(init__.getTime() < init_policy__.getTime()) {
                      initDate = form.startDate;
                    } else if(arrayLen.length == 1) { 
                      initDate = form.startDate;
                    }

                  } else {
                    initDate = form.startDate;
                  }

                  if(receipt.recibo_numero == 1) {
                    var vencimiento = sumarDias(angular.copy(datesFactory.toDate(initDate)), 30);
                    var vencimiento_date = datesFactory.convertDate(vencimiento);
                  } else {
                    var vencimiento_date = initDate;
                  }

                  receipt.startDate = initDate;
                  receipt.endingDate = endDate;
                  receipt.vencimiento = vencimiento_date;

                  scope.receipts.unshift(receipt);
                  endDate = receipt.startDate;

                } else {

                  var receipt = {
                    'recibo_numero': i+1,
                    'prima_neta': parseFloat((obj.prima).toFixed(2)),
                    'prima': parseFloat((obj.prima).toFixed(2)),
                    'rpf': parseFloat((obj.rpf).toFixed(2)),
                    'derecho': parseFloat((obj.derecho).toFixed(2)),
                    'iva': getIva(obj, amountReceipts),
                    'subTotal': parseFloat((subTotal).toFixed(2)),
                    'prima_total': getPrimaTotalReceipt(obj, amountReceipts),
                    'total': getPrimaTotalReceipt(obj, amountReceipts),
                    'receipt_type': 1,
                    'comision': comissionCalc(parseFloat((obj.prima).toFixed(2))),
                    'delivered': false,
                  };
                  if(scope.form.domiciliado == 'true') {
                    receipt.is_cat = true;
                  }

                  if(receipt.recibo_numero == 1) {
                    var vencimiento_date = sumarDias(angular.copy(initDate), 30);
                  } 

                  receipt.fecha_inicio = datesFactory.convertDate(initDate);

                  if(receipt.recibo_numero == 1){
                    receipt.vencimiento = datesFactory.convertDate(vencimiento_date) ? datesFactory.convertDate(vencimiento_date) : null;
                  } else {
                    receipt.vencimiento = datesFactory.convertDate(initDate) ? datesFactory.convertDate(initDate) : null;
                    
                  }

                  receipt.startDate = datesFactory.convertDate(initDate);
                  receipt.endingDate = datesFactory.convertDate(endDate);
                  receipt.fecha_fin = datesFactory.convertDate(endDate);  

                  if(form.payment == 5 || form.payment.value == 5) {
                    receipt.fecha_inicio = form.startDate;
                    receipt.startDate = form.startDate;
                    receipt.endingDate = form.endingDate;
                    receipt.fecha_fin = form.endingDate;
                    receipt.vencimiento = receipt.vencimiento ? receipt.vencimiento : form.startDate;
                  } 

                  initDate = new Date(endDate);

                  scope.receipts.push(angular.copy(receipt));
                }

                
                scope.tosave.poliza = scope.poliza;
                scope.tosave.recibos_poliza = scope.receipts;
                scope.tosave.receipts = scope.receipts;

              }

              var date  = (form.endingDate).split('/');
              var date2 = (form.startDate).split('/');
              
              if(anios_vigencia >= 1) {
                var original_endYear = parseInt(date[2]) + (anios_vigencia -1);
                var original_endDate = date[0] + '/' + date[1] + '/' +  String(original_endYear);
              } 


              if(form.ceder_porcentaje) {
                var percent_comision = porcentaje_final / 100;
                poliza.comision = parseFloat(poliza.comision) * percent_comision;
              } else if(form.comision){
                if(form.comision.comission){
                  var percent_comision = parseFloat(form.comision.comission) / 100;
                  poliza.comision = parseFloat(scope.poliza.primaNeta) * percent_comision; 
                }else{
                  poliza.comision = 0
                }
              }else{
                poliza.comision = 0
              }

              poliza.comision = (poliza.comision).toFixed(2);


              if(ramo_code == 1) {
                poliza.ivaStatus = false;
                scope.showIva = false;
                poliza.iva = 0.00;
                scope.poliza.iva = 0.00; 
                primaTotalNum =  poliza.subTotal;
                primaTotalNum = parseFloat(primaTotalNum).toFixed(2);
                scope.poliza.primaNeta = scope.formatNumber(poliza.primaNeta);
                scope.poliza.rpf= scope.formatNumber(poliza.rpf);
                scope.poliza.derecho = scope.formatNumber(poliza.derecho);
                subTotalNum =  poliza.subTotal;
                subTotalNum = parseFloat(subTotalNum).toFixed(2);
                scope.poliza.subTotal = scope.formatNumber(subTotalNum);
                scope.poliza.iva = scope.formatNumber(poliza.iva);
                scope.poliza.primaTotal = scope.formatNumber(primaTotalNum); 

                  //---------normal-------

              } else {
                poliza.ivaStatus = true;
                scope.showIva = true;
                scope.poliza.primaNeta = scope.formatNumber(poliza.primaNeta);
                scope.poliza.rpf= scope.formatNumber(poliza.rpf);
                scope.poliza.derecho = scope.formatNumber(poliza.derecho);
                subTotalNum =  poliza.subTotal;
                subTotalNum = parseFloat(subTotalNum).toFixed(2);
                scope.poliza.subTotal = scope.formatNumber(subTotalNum);
                scope.poliza.iva = scope.formatNumber(poliza.iva);
                primaTotalNum =  poliza.primaTotal;
                primaTotalNum = parseFloat(primaTotalNum).toFixed(2);
                scope.poliza.primaTotal = scope.formatNumber(primaTotalNum);
              }               

              if (!scope.receipts[0].startDate) {
                toaster.warning("Agregar manualmente las fechas.");
              }


              if(scope.form.ramo.ramo_code == 1) {
                scope.tosave.iva = 0;
                scope.tosave.p_total = scope.poliza.primaTotal;
              }

            }

          }
        }
      }
    }]
);