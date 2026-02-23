var app = angular.module('inspinia')
.directive('endorsementReceipts', ['toaster', 'MESSAGES', 'helpers', 'datesFactory', '$filter', 'SweetAlert', '$location', '$sessionStorage',
  function (toaster, MESSAGES, helpers, datesFactory, $filter, SweetAlert, $location, $sessionStorage) {

    return {
        restrict: 'EA',
        scope: {
          model : '=',
          poliza: '=',
          form: '=',
          tosave: '=',
          policy: '='
        },
        templateUrl: 'app/directivas/calculateReceipts/endorsement.receipts.template.html',
        link: function(scope, element, $watch, attrs) {

          $('.datepicker-me input').datepicker();

          $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
          $.fn.datepicker.defaults.startView = 0;
          $.fn.datepicker.defaults.autoclose = true;
          $.fn.datepicker.defaults.language = 'es';
          
          scope.endoso_date = angular.copy(scope.form);
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
          // console.log('endoso_date', scope.endoso_date);
          // console.log('form', scope.form);
          if (scope.policy) {
            scope.policy_dates = {
              start : angular.copy(scope.policy.start_of_validity),
              end : angular.copy(scope.policy.end_of_validity)
            };
          }else if (scope.form) {
            scope.policy_dates = {
              start : angular.copy(scope.form.start_of_validity),
              end : angular.copy(scope.form.end_of_validity)
            };
          }

          if (($location.path().indexOf('edit') != -1)) {
            scope.noRecalculateReceipts = true;
          }else{
            scope.noRecalculateReceipts = false;
          }

          scope.endoso = {};

          if(!scope.endoso) {
            scope.endoso = {};
          }

          if(scope.endoso.subTotal) {
            scope.endoso.subTotal = (parseFloat(scope.endoso.subTotal)).toFixed(2);
          } 

          var form = angular.copy(scope.form);
          // console.log('______',form)
          if(scope.tosave.receipts) {

            scope.tosave.delete_receitps = [];
            if (scope.form.policy) {
              form.policy_starting_date = scope.form.policy.start_of_validity;
            }else if (scope.form.fianza) {
              form.policy_starting_date = scope.form.fianza.start_of_validity;
            }
            scope.endoso_date.start_of_validity = scope.form.start_of_validity;
            scope.receipts = scope.tosave.receipts;

            if(scope.receipts.length) {

              scope.receipts.forEach(function(item) {
                // console.log('item', item);
                item.startDate = datesFactory.convertDate(item.fecha_inicio);
                item.endingDate = datesFactory.convertDate(item.fecha_fin);
                item.vencimiento = datesFactory.convertDate(item.vencimiento);
                item.prima = item.prima_neta;
                item.total = item.prima_total;

              });
            }


            scope.showreceipts = true;
            if(scope.tosave.poliza) {
              scope.endoso = scope.tosave.poliza;
            }

          } else {
            scope.receipts = [];
            scope.showreceipts = false;
          }

          scope.back_up_poliza = angular.copy(scope.policy); 

          // form.payment = scope.form.num_receipts;
          if(form.type == 'INDIVIDUAL') {

            // if(scope.form.description.label == 'CAMBIO DE FORMA DE PAGO') {
            //   form.startDate = scope.policy.startDate;
            //   form.start_of_validity= scope.policy.start_of_validity;
            // } else {
              
              form.startDate = datesFactory.toDate(scope.endoso_date.start_of_validity);
              form.start_of_validity= datesFactory.toDate(scope.endoso_date.start_of_validity);
            // }

            form.endingDate = scope.policy.endingDate;
            form.end_of_validity = scope.policy.end_of_validity;

          } else {       
          if (scope.policy) {    
              form.startDate = scope.policy.startDate;
              form.start_of_validity= scope.policy.start_of_validity;
              form.endingDate = scope.policy.endingDate;
              form.end_of_validity = scope.policy.end_of_validity;
            }else if (scope.form) {
              form.startDate = scope.form.startDate;
              form.start_of_validity= scope.form.start_of_validity;
              form.endingDate = scope.form.endingDate;
              form.end_of_validity = scope.form.end_of_validity;
            }
          }


          if(!scope.endoso) {
            scope.endoso = {
              iva: 16,
              primaTotal: 0
            };
          }

          var descuento_ = 0;
          var cantidad_desc = parseFloat(scope.endoso.primaNeta) * descuento_;
          scope.p_neta_desc = parseFloat(scope.endoso.primaNeta) - parseFloat(cantidad_desc);

          if(scope.endoso.primaNeta == 0) {
            scope.endoso.primaNeta = '';
          }

          if(scope.endoso.rpf == 0) {
            scope.endoso.rpf = '';
          }

          if (scope.endoso.derecho == 0) {
            scope.endoso.derecho = '';
          }

          scope.showIva = true;

          scope.delete_receipt = function(event, param, index) {
            if(scope.receipts.length > 1) {
              if(!scope.tosave.delete_receitps) {
                scope.tosave.delete_receitps = [];
              }
              scope.tosave.delete_receitps.push(param);
              scope.receipts.splice(index, 1);
            } else {
              SweetAlert.swal('Debe mantener por lo menos un recibo.');
            }
          }

          scope.add_receipt = function() {

            // console.log('add_receipt');
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

          scope.editPTotal = function() {
            scope.edited_ptotal = true;
            scope.ptotal_edited = angular.copy(scope.endoso.primaTotal);

          };

          scope.calculateComision = function () {

            var prima_ = parseFloat(scope.endoso.primaNeta);
            var percent = parseFloat(form.comision_percent) / 100;
            scope.endoso.comision = (prima_ * percent).toFixed(2);
            scope.comision_desc = 0;
          };

          scope.deleteSpecialCharacters = function() {
          };

          scope.recalc_receipt = function(parReceipt, receipt_index) {
          
            // console.log('policy', scope.policy);

            var receipt_subtotal = parseFloat(parReceipt.prima) + parseFloat(parReceipt.rpf) + parseFloat(parReceipt.derecho);

            if(scope.policy.ramo.ramo_code == 1) {
              parReceipt.iva = parseFloat(0).toFixed(2);
              parReceipt.total = parseFloat(receipt_subtotal).toFixed(2);

            } else {
              parReceipt.iva = parseFloat(receipt_subtotal * 0.16).toFixed(2);
              parReceipt.total = parseFloat(receipt_subtotal * 1.16).toFixed(2);
            }    

            // comision
            // if(scope.policy.comision_percent) {
            //   var percent__ = parseFloat(scope.policy.comision_percent);

            //   if(percent__ > 0) {

            //     var prima_rec = parseFloat(angular.copy(parReceipt.prima));
            //     var comision_impr = parseFloat(prima_rec) / parseFloat(percent__);
              
            //     parReceipt.comision = comision_impr.toFixed(2);
            //   } else {
            //     parReceipt.comision = 0.00;
            //   }
            // }


          };

          scope.validateFloatKeyPress = function(e, parReceipt, receipt_index, parType) {
            // console.log('event', e.type);
            // enter
            if(e.keyCode == 13 || e.type == "click") {    

              var rec_prima = parseFloat(parReceipt.prima);
              var rec_rpf = parseFloat(parReceipt.rpf);
              var rec_derecho = parseFloat(parReceipt.derecho);
              var rec_iva = parseFloat(parReceipt.iva);
              var rec_total = parseFloat(parReceipt.total);
              var rec_comision = parseFloat(parReceipt.comision);

              if(parReceipt.recibo_numero == 1) {
                scope.prima_restante = angular.copy(scope.prima_c_descuento) - rec_prima;  
                if (scope.endoso.rpf > 0) {
                  scope.rpf_restante = angular.copy(scope.endoso.rpf) - rec_rpf;  
                } else {
                  scope.rpf_restante = 0;  
                }
                scope.derecho_restante = angular.copy(scope.endoso.derecho) - rec_derecho;  

                scope.total_restante = angular.copy(parseFloat(scope.endoso.primaTotal)) - rec_total; 
                // console.log('aaa', scope.form); 

                // console.log('comision_importe', scope.comision_importe);
                if(scope.comision_importe > 0) {
                  scope.comision_restante = angular.copy(scope.comision_importe) - rec_comision;  
                } else {
                  scope.comision_restante = 0;
                }

                if(scope.endoso.iva) {
                  scope.iva_restante = angular.copy(scope.endoso.iva) - rec_iva;  
                } else {
                  scope.iva_restante = 0;
                }
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

                    rec_item.total = angular.copy(scope.total_x_recibo).toFixed(2);
                    // rec_item.comision = angular.copy(scope.comision_x_recibo).toFixed(2);

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
            // console.log('polizaaaaaaaaaaa', scope.poliza_);

            var desc__ = angular.copy(parseFloat(scope.endoso.descuento ? scope.endoso.descuento : 0));
            var prima_neta__ = angular.copy(parseFloat(scope.endoso.primaNeta)); 
            var desc_import__ = angular.copy(parseFloat(prima_neta__ / 100) * desc__);

            // var comision___ = scope.form.comision ? scope.form.comision.comission : 0;
            // if(comision___) {
            //   scope.comision_importe = angular.copy(parseFloat(prima_neta__ / parseInt(scope.form.comision.comission)));
            // } else {
            //   scope.comision_importe = 0;
            // }
            // console.log('poliza_',scope.poliza_);
            if(scope.poliza_) {

              if(scope.poliza_.comision_percent) {
                var importe_prop = parseFloat(prima_neta__) / 100;
                var importe = importe_prop * parseFloat(scope.poliza_.comision_percent);
                // console.log('importe', importe);
                scope.comision_importe = importe;
              } else {
                scope.comision_importe = 0;
              }
            }


            if(scope.endoso.aplicarDescuento) {
              scope.prima_c_descuento = angular.copy(prima_neta__ - desc_import__);
            } else {
              scope.prima_c_descuento = angular.copy(prima_neta__);
            }
            // console.log('aaa', scope.prima_c_descuento);
          };

          scope.calculateInputs = function(param) {

            // console.log('ok', scope.endoso);
            // scope.back_up_poliza = angular.copy(scope.poliza);

            if(!scope.endoso.primaNeta || scope.endoso.primaNeta == undefined) {
              var primaNeta_ = 0;
            } else {
              var primaNeta_ = parseFloat(scope.endoso.primaNeta);
            }

            if(!scope.endoso.descuento || scope.endoso.descuento == undefined) {

              var desceunto_importe = 0;

            } else {


              if(scope.endoso.aplicarDescuento) {

                var descuento_percent = parseInt(scope.endoso.descuento) / 100;
                var desceunto_importe = primaNeta_ * descuento_percent;
              } else {
                var desceunto_importe = 0;
              }
            }

            if(!scope.endoso.rpf || scope.endoso.rpf == undefined) {
              var rpf_ = 0;
            } else {
              var rpf_ = parseFloat(scope.endoso.rpf);
            }

            if(!scope.endoso.derecho || scope.endoso.derecho == undefined) {
              var derecho_ = 0;
            } else {
              var derecho_ = parseFloat(scope.endoso.derecho);
            }

            if(desceunto_importe == undefined) {
              desceunto_importe = 0;
            }

            var p_neta_descuento = primaNeta_ - desceunto_importe;
     
            // console.log('policy', scope.policy);
            // if(scope.policy.ramo.ramo_code == 1) {

            // }

            var subtotal_ = p_neta_descuento + rpf_ + derecho_;
            var iva_importe = subtotal_ * 0.16;

            var ramo_code = scope.policy.ramo.ramo_code;
           
            if(ramo_code == 1) {
              var primaTotal_ = subtotal_;
              scope.endoso.iva = 0;

            } else { 
              var primaTotal_ = subtotal_ + iva_importe;
              scope.endoso.iva = (iva_importe).toFixed(2);
            }

            scope.endoso.primaTotal = (primaTotal_).toFixed(2);

            if(scope.endoso.subTotal == undefined) {
              scope.endoso.subTotal = (subtotal_).toFixed(2);
            }

            if(isNaN(scope.endoso.subTotal)) {
              scope.endoso.subTotal = 0
            } else {
              scope.endoso.subTotal = (subtotal_).toFixed(2);
            }
          };

          if(scope.receipts) {
            scope.endoso.primaNeta = parseFloat(scope.endoso.primaNeta);
            scope.endoso.derecho = parseFloat(scope.endoso.derecho); 
            // scope.endoso.derecho = parseFloat(scope.endoso.derecho); 
            // scope.endoso.derecho = parseFloat(scope.endoso.derecho); 


            scope.calculateInputs();
          }

          scope.showInput = false;

          scope.editTable = function(param) {

            scope.editedReceipts = true;
            if(scope.showInput == false){
              scope.showInput = true;
            } else {
              scope.showInput = false;
            }

            if(param) {

              // var init_poliza = new Date(scope.form.start_of_validity);
              var init_poliza = new Date(form.policy_starting_date);
              var end_poliza = new Date(scope.form.end_of_validity);

              scope.receipts.forEach(function(obj, obj_index) {
                
                obj.fecha_inicio = obj.startDate;
                obj.fecha_fin = obj.endingDate;

                if(obj_index == 0) {

                  var init_first_receipt = new Date(datesFactory.toDate(obj.startDate));

                  // console.log('init_first_receipt', init_first_receipt);
                  // console.log('init_poliza       ', init_poliza);
                  var Hoy = new Date(init_poliza);//Fecha actual del sistema
                  var Fecha1 = new Date(init_first_receipt);
 
                  var AnyoFecha = Fecha1.getFullYear();
                  var MesFecha = Fecha1.getMonth();
                  var DiaFecha = Fecha1.getDate();
                   
                  var AnyoHoy = Hoy.getFullYear();
                  var MesHoy = Hoy.getMonth();
                  var DiaHoy = Hoy.getDate();
                   
                  if (AnyoFecha < AnyoHoy){
                      // alert ("La fecha introducida es anterior a Hoy");
                  }
                  else{
                      if (AnyoFecha == AnyoHoy && MesFecha < MesHoy){
                          // alert ("La fecha introducida es anterior a Hoy");     
                      }
                      else{
                          if (AnyoFecha == AnyoHoy && MesFecha == MesHoy && DiaFecha < DiaHoy){
                              // alert ("La fecha introducida es anterior a Hoy");
                            toaster.warning('La fecha de inicio del recibo es menor a la fecha de inicio de la póliza.');
                            // obj.startDate = datesFactory.convertDate(scope.form.start_of_validity);
                            // obj.fecha_inicio = obj.startDate;
                            obj.startDate = datesFactory.convertDate(init_poliza); 
                            obj.fecha_inicio = obj.startDate;
                                                      }
                          else{
                              if (AnyoFecha == AnyoHoy && MesFecha == MesHoy && DiaFecha == DiaHoy){
                                   // alert ("Has introducido la fecha de Hoy");
                              }
                              else{
                                  // alert ("La fecha introducida es posterior a Hoy");
                              }
                          }
                      }
                  }
                  

                  // if(init_first_receipt.getTime() < init_poliza.getTime()) {

                  //   toaster.warning('La fecha de inicio del recibo es menor a la fecha de inicio de la póliza.');
                  //   // obj.startDate = datesFactory.convertDate(new Date());
                  //   obj.startDate = datesFactory.convertDate(scope.form.start_of_validity);
                  //   obj.fecha_inicio = obj.startDate;

                  // }
                } 
                else if(obj_index == (scope.receipts.length -1)) {
                
                  var end_last_receipt = new Date(datesFactory.toDate(obj.endingDate)); 
                
                  if(end_last_receipt.getTime() > end_poliza.getTime()) {
                  
                    toaster.warning('La fecha de fin del recibo es mayor a la fecha de fin de la póliza.');
                    obj.endingDate = datesFactory.convertDate(end_poliza);
                    obj.fecha_fin = obj.endingDate;
                  
                  } 
                  else {
                    obj.fecha_fin = obj.endingDate;
                  }
                }

              });

              var demo = angular.copy(scope.receipts);
              // console.log('receipts', scope.receipts);

              demo.forEach(function(obj) {
                // console.log('demo');

                obj.recibo_numero = obj.recibo_numero;
                obj.prima_neta = parseFloat(obj.prima).toFixed(2);
                obj.rpf = parseFloat(obj.rpf).toFixed(2);
                obj.derecho = parseFloat(obj.derecho).toFixed(2);
                obj.iva =  parseFloat(obj.iva).toFixed(2);
                obj.subTotal =  parseFloat((obj.subTotal)).toFixed(2);
                obj.prima_total = parseFloat((obj.total)).toFixed(2);
                obj.total = parseFloat((obj.total)).toFixed(2);
                obj.receipt_type =  scope.receipts[0].receipt_type;
                obj.comision = parseFloat((obj.comision)).toFixed(2);
                obj.fecha_inicio = obj.startDate;
                obj.vencimiento = obj.vencimiento ? obj.vencimiento : obj.startDate;
                obj.startDate = obj.startDate;
                obj.endingDate = obj.endingDate;
                obj.fecha_fin = obj.endingDate
              });

              scope.tosave.recibos_poliza = demo;
              scope.tosave.receipts = demo;
            } else {
              scope.getValuesPoliza();
            } 
            scope.getValuesPoliza();
          };
         scope.editIva = function (param) {

          scope.endoso[param] = String(scope.endoso[param]).replace(/^[A-Za-z]+$/, '');

          scope.edited_iva = true;
          if(scope.endoso.iva) {
            var iva_edited = scope.endoso.iva;
          } else {
            var iva_edited = 0;
          }
          scope.endoso.primaTotal = (parseFloat(scope.endoso.subTotal) + parseFloat(iva_edited)).toFixed(2);
        }
          // calculate
          function getSubtotal(parPoliza) {
            var sum = parseFloat(parPoliza.primaNeta) + parseFloat(parPoliza.rpf) + parseFloat(parPoliza.derecho);

            return Number((sum).toFixed(2));
          };

          scope.formatNumber =function (valor) {
            // console.log('valor', valor);
            var nums = new Array();
            var simb = ",";

            if(!valor) {
              return;
            }
            // console.log(typeof(valor));
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

          function sumarDias(fecha, dias){
            fecha.setDate(fecha.getDate() + dias);
            return fecha;
          }

          scope.$watch('form.num_receipts', function(new_value, old_value) {
            // console.log('new_value', new_value);
            form.num_receipts = new_value;
          });


          scope.checkVenDate = function(parReceipt) {

            var init_date_ = datesFactory.toDate(parReceipt.startDate);
            var ven_date_  =  datesFactory.toDate(parReceipt.vencimiento);
            if(ven_date_.getTime() < init_date_.getTime()) {
              SweetAlert.swal('La fecha de vencimiento no puede ser menor a la fecha de inicio del recibo.');
              parReceipt.vencimiento = '';
            }
          };

          scope.calculate = function (poliza) {
            scope.prima_restante = 0;
            scope.rpf_restante = 0;
            scope.derecho_restante = 0;
            scope.iva_restante = 0;
            scope.total_restante = 0;
            scope.comision_restante = 0;
            if(scope.form.description == 'CAMBIO DE FORMA DE PAGO')  {
         
              if(scope.form.num_receipts !== scope.policy.forma_de_pago) {
                scope.non_dates = true;
                SweetAlert.swal('La cantidad de recibos que ha seleccionado no concuerda con la frecuencia de pago seleccionada, puede haber errores en los recibos generados.');
              } else {
                scope.non_dates = false;
              }
            } else {
               scope.non_dates = false;
            }

            if(scope.endoso.configDerecho || scope.endoso.configRPF) {
              // swal
              if (scope.edited_iva) {
                SweetAlert.swal('Los resultados en los recibos pueden no ser exactos, favor de revisarlos manualmente.');
              }
            }
            scope.endoso.descuento = 0;

            var desc_importe = 0;

            poliza.prima = parseFloat(angular.copy(poliza.prima)) - desc_importe;
            poliza.rpf = poliza.rpf;
            poliza.derecho = poliza.derecho;
            scope.receipts = [];

            // console.log('adads', scope.poliz);
            var ramo_code = scope.policy.ramo.ramo_code;
            if(ramo_code == 1){
              poliza.ivaStatus = false;
              scope.showIva = false;
              poliza.iva = 0.00;
              scope.endoso.iva = 0.00;               
            }else{
              poliza.ivaStatus = true;
              scope.showIva = true;
            }

            if(form.receipts) {
              scope.tosave.delete_receitps = form.receipts;
              form.receipts = [];
              if (!form.num_receipts) {
                if(scope.form.forma_de_pago) {
                  form.num_receipts = scope.form.forma_de_pago;
                } else {
                  form.num_receipts = scope.policy.forma_de_pago;
                }
              }
            }

            // console.log('--------', form.num_receipts);
            
            if(form.num_receipts >= 7 && form.num_receipts <= 11 ) {
              var form_ = 1;
            } else {
              var form_ = form.num_receipts;
            }

              // var form_ = form.num_receipts;

            
            if(!poliza.derecho) {
              poliza.derecho = 0;
            }

            if(!poliza.rpf) {
              poliza.rpf = 0;
            }

            var descuento_ = 0;
            var cantidad_desc = parseFloat(poliza.primaNeta);

            scope.p_neta_desc = parseFloat(cantidad_desc);
            scope.subtotal_desc = parseFloat(scope.p_neta_desc) + parseFloat(poliza.rpf) + parseFloat(poliza.derecho);
            
            if(scope.edited_iva) {
              scope.iva_desc = scope.endoso.iva;
            } else {
              scope.iva_desc = parseFloat(scope.subtotal_desc) * 0.16;
            }


            if(scope.back_up_poliza.ramo.ramo_code == 1) {
              scope.p_total_desc = parseFloat(scope.subtotal_desc);
            } else {
              scope.p_total_desc = parseFloat(scope.subtotal_desc) + parseFloat(scope.iva_desc);
            }
            var prima_neta = parseFloat(poliza.primaNeta);
            var derecho = parseFloat(poliza.derecho);
            var rpf = parseFloat(poliza.rpf);

            scope.endoso.iva = (parseFloat(scope.endoso.iva)).toFixed(2);
            scope.endoso.primaTotal = (parseFloat(scope.endoso.subTotal) + parseFloat(scope.endoso.iva)).toFixed(2);
          
            scope.tosave.p_neta = prima_neta;
            scope.tosave.derecho = derecho;
            scope.tosave.rpf = rpf;
            scope.tosave.descuento = poliza.descuento ? poliza.descuento : 0;
            scope.tosave.p_total = parseFloat(poliza.primaTotal);

            var IVA = 0;
            var TOTAL_IVA = 1;

            if(!scope.edited_iva) {
              var poliza_iva = scope.iva_desc;
            } else {
              var poliza_iva = (parseFloat(scope.endoso.iva)).toFixed(2);
            }

            scope.tosave.iva = (parseFloat(poliza_iva)).toFixed(2);

            poliza.iva = scope.tosave.iva;
           
            // console.log('---------------------');
            // console.log(form);
            if((form.num_receipts) || form.endorsement_receipt) {
              if(!form.num_receipts && form.endorsement_receipt) {
                form.num_receipts = 5; 
              }
   
              // TODO: checar esta función
              function getNumber (num) {
                var num2 = Math.ceil(num);
                return new Array(num2)
              };
            

              function getTotal (poliza) {

                if(scope.edited_ptotal) {
                  var p_total = parseFloat(scope.ptotal_edited);
                  scope.endoso.primaTotal = parseFloat(scope.ptotal_edited);
                } else {
                  // poliza.primaTotal = getTotal(poliza).toFixed(2);
                  var p_total = parseFloat(scope.p_total_desc);
                }

                // var p_total = parseFloat(scope.p_total_desc);
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

                // var prima_total_ = parseFloat(subtotal_ + parseFloat(iva_));

                return (prima_total_).toFixed(2);
              }

              function getIva (parValue, parAmonunts) {
                
                var prima_neta_ = parseFloat(parValue.prima);
                var subtotal_ = parseFloat(prima_neta_) + parseFloat(parValue.rpf) + parseFloat(parValue.derecho)
                

                if(scope.edited_iva) {
                  var iva_ = parseFloat(scope.endoso.iva) / parAmonunts;
                } else {
                  var iva_ = subtotal_ * 0.16;
                }
       
                if(ramo_code == 1) {
                  var iva_ = 0.00;
                }

                return (iva_).toFixed(2);

              }

              function comissionCalc(parPneta) {

                var p_neta_ = parPneta;
                // console.log('policy_comision', scope.policy.comision);

                scope.poliza_ = scope.policy;

                if(scope.policy.comision) {
                  if(scope.policy.comision.comission) {
                    var comision_ = parseFloat(scope.policy.comision.comission) / 100;
                  } else if(scope.policy.comision_percent) {
                    var comision_ = parseFloat(scope.policy.comision_percent) / 100;
                  }
                  
                  if(scope.policy.ceder_comision) {
                    var comision_ = parseFloat(scope.policy.comision_percent) / 100;
                  }


                } else {
                  if(scope.policy.comision_percent) {
                    var comision_ = parseFloat(scope.policy.comision_percent) / 100;
                  } else {
                    var comision_ = 0;
                  }
                }

                var result = parseFloat(p_neta_ * comision_).toFixed(2);

                return result;
              }

              // console.log('-----------------', form);

              receipts = [];
              scope.showreceipts = true;
              if(form.startDate){
                if(form.cambioPago){
            
                  // var initDate = new Date(form.start_of_validity);
                  var initDate = new Date(form.policy_starting_date);

                } else {
  
                  // var initDate = form.startDate;
                  var initDate = new Date(form.policy_starting_date);
                  // console.log('initDate', initDate);

                }
              } else {
                // var initDate = new Date(form.start_of_validity);
                  var initDate = new Date(form.policy_starting_date);

              }

              if(form.endingDate){
                var endDate = new Date(datesFactory.mesDiaAnio(form.endingDate));
              } else {
                var endDate = new Date(form.end_of_validity)
              }

              if(isNaN(initDate)) {
                // initDate = new Date(form.startDate);
                initDate = new Date(form.policy_starting_date);

              }



              if(isNaN(endDate)) {
                // console.log('++++++++ END DATE');
                endDate = new Date(form.endingDate);
              } 


              var months = helpers.monthDiff(initDate, endDate);

              // Calculate diff between dates
              var dateDiff = moment(endDate).diff(moment(initDate), 'days');

              var amountReceipts = months / form_;
              if (scope.form.tipo_endoso == 2 || scope.form.tipo_endoso == 1) {
                if (form_ == 6) {
                  var amountReceipts = 2
                }else if (form_ == 4) {
                  var amountReceipts = 3
                }else if (form_ == 3) {
                  var amountReceipts = 4
                }else if (form_ == 2) {
                  var amountReceipts = 6
                }else if (form_ == 1) {
                  var amountReceipts = 12
                }
              }
              // var amountReceipts = form.num_receipts;

              if(amountReceipts == 0) {
                amountReceipts = 1;
              }
              if (form_ == 0) {
                amountReceipts = 0
              }     
              //Calculate poliza results
              poliza.primaTotal = getTotal(poliza).toFixed(2);
              // console.log('-->',poliza.primaTotal);
 
              amountReceipts = Math.ceil(amountReceipts);

              scope.total_receipts = form.num_receipts;
              // console.log('num_receipts', form.num_receipts);
              if(form.num_receipts == 5) {
                amountReceipts = 1;
                initDate = new Date(datesFactory.toDate(datesFactory.convertDate(form.startDate)));
                endDate = new Date(datesFactory.toDate(form.end_of_validity));
              } else if(form.num_receipts.value == 5) {
                amountReceipts = 1;
             
                initDate = new Date(datesFactory.toDate(form.startDate));
                endDate = new Date(datesFactory.toDate(form.end_of_validity));
              } 


              // if(form.num_receipts == 7 || form.num_receipts == 8 || form.num_receipts == 9 || form.num_receipts == 11) {
              //   // console.log('ok');
              //   amountReceipts = 7;
             
              //   // initDate = new Date(datesFactory.toDate(form.startDate));
              //   // endDate = new Date(datesFactory.toDate(form.end_of_validity));
              // } else if(form.num_receipts == 5.5) {
              //   amountReceipts = 12;
              // }
              switch(form.num_receipts) {
                case 5.5:
                  amountReceipts = 5;
                  break;
                case 7:
                  amountReceipts = 7;
                  break;
                case 8:
                    amountReceipts = 8;
                  break;
                case 9:
                    amountReceipts = 9;
                  break;
                case 10:
                  amountReceipts = 10;
                  break;
                case 11:
                  amountReceipts = 11;
                  break;
              }
              
              // var start_poliza = new Date(form.policy_starting_date);
              if(form.initDate == 'Invalid Date') {
                var start_poliza = new Date(datesFactory.toDate(form.init_date));
              } else if(form.init_date) {
                // console.log();
                if((form.init_date).search('/') > -1) {

                  var date = (form.init_date).split('/');
                  start_poliza = new Date(date[2], date[1]-1, date[0]);
                
                } else {
                  start_poliza = new Date(form.init_date);                  
                }


                // console.log('start_poliza_2', start_poliza);


              }else {
                var start_poliza = new Date(form.startDate);
                // console.log('start_poliza_3', start_poliza);

              }

              // console.log('start_poliza', start_poliza);
  
              initDate = start_poliza;

                 // console.log('initDate', initDate);


              var prima_neta_total = 0;
              // console.log('amountReceipts', amountReceipts);
              var arrayLen = getNumber(amountReceipts);
              // console.log('arrayLen', arrayLen);
              // Logic from vm

              if(poliza.aplicarDescuento) {
                var percent_ = parseFloat(poliza.descuento) /100;
                var importe_ = parseFloat(poliza.primaNeta) * percent_;
                var prima_ =  parseFloat(poliza.primaNeta) - importe_;
              } else {
                var prima_ =  parseFloat(poliza.primaNeta);
              }

              if(scope.edited_iva) {
                poliza.iva = scope.endoso.iva;
                poliza.primaTotal = scope.endoso.primaTotal
              }

              var obj = {
                // prima: poliza.primaNeta / amountReceipts,
                prima: prima_ / amountReceipts,
                rpf: poliza.rpf / amountReceipts,
                derecho: poliza.derecho / amountReceipts,
                iva: poliza.iva,
                subTotal: poliza.subTotal / amountReceipts,
                primaTotal: poliza.primaTotal / amountReceipts,
              };

              var empty_receipts = 0;
              var empty_rec_array = [];

              for (var i = 0; i < arrayLen.length; i++) {

                if(scope.total_receipts > 5) {
                  var x = i+1;

                  if(x > scope.total_receipts) {
                    break;
                  }
                }
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
                    if(obj.rpf) {
                      obj.rpf = parseFloat(poliza.rpf);
                    } else {
                      obj.rpf = 0;
                    }
                  } else {
                    obj.rpf = 0;
                  }
                }

                // console.log('start_poliza', start_poliza);
                // console.log('form_', form_);
                // endDate = new Date(new Date(moment(start_poliza).add(form_, 'months')).setHours(11,59,59));

                // console.log('policy', scope.policy);
                // console.log(form);
                if(i == 0) {
                  endDate = new Date(new Date(moment(form.policy_starting_date).add(form_, 'months')).setHours(11,59,59)); 
                  // console.log('++++++++++++++ endDate', endDate);
                } else {
                  endDate = new Date(new Date(moment(initDate).add(form_, 'months')).setHours(11,59,59));
                  // console.log('______________ endDate', endDate);
                }

                if(i == 0 && scope.policy.document_type == 7) {
                  // console.log('form', form);
                  if(form.end_date) {
                    // if(isNaN(new Date(form.end_date))){
                    //   endDate = form.end_date;
                    // } else {
                    //   endDate = new Date(form.end_date);
                    // }
                    // console.log('end_date', form.end_date);
                    endDate = new Date(datesFactory.toDate(form.end_date));
                    // console.log('asdasdf', endDate);

                  } else if(form.end_of_validity) {
                    endDate = new Date(form.end_of_validity);
                  }
                }

                // console.log('endingDate', endDate);
                // console.log('----------------------------');

                // var val_start_2 = new Date(datesFactory.toDate(scope.endoso_date.start_of_validity));
                // var val_end_2   = new Date(endDate);

                // console.log('val_start_2', val_start_2);
                // console.log('val_end_2', val_end_2);
                // console.log('initDate', initDate);

                var subTotal = obj.prima + obj.rpf + obj.derecho;

                prima_neta_total + parseFloat((obj.prima).toFixed(2));

                // console.log('policy', form);
                // console.log('initDate', initDate);
               

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
                  'comision': comissionCalc(parseFloat((obj.prima).toFixed(2))),
                  'receipt_type': 2,
                  'delivered': false
                };

                if (dateDiff === 364 || dateDiff === 365 || dateDiff === 366) {
                  receipt.fecha_inicio = datesFactory.convertDate(initDate);
                  receipt.vencimiento = datesFactory.convertDate(initDate) ? datesFactory.convertDate(initDate) : null;
                  receipt.startDate = datesFactory.convertDate(initDate);
                  receipt.endingDate = datesFactory.convertDate(endDate);
                  receipt.fecha_fin = datesFactory.convertDate(new Date(endDate));
                } 
                else {
                  receipt.startDate = '';
                  receipt.vencimiento  = '';
                  receipt.endingDate = '';
                  receipt.fecha_inicio = '';
                  receipt.fecha_fin = '';
                }


                if(form.num_receipts == 5 || scope.policy.document_type == 7) {
                  receipt.fecha_inicio = form.startDate;
                  receipt.startDate = form.startDate;
                  receipt.endingDate = form.endingDate;
                  receipt.fecha_fin = form.endingDate;
                  receipt.vencimiento = form.startDate ? form.startDate : null;
                }


                // console.log(scope.endoso_date.start_of_validity);
                // console.log(endDate);
                // console.log('------------------------');
                // console.log('scope.endoso_date.start_of_validity', scope.endoso_date.start_of_validity);

                // var val_start = new Date(datesFactory.toDate(scope.endoso_date.start_of_validity));
                // console.log('initDate', form);
                if(form.init_date) {
                  var val_start = new Date(datesFactory.toDate(form.init_date));
                  // console.log('añlkdsjlkfjs');
                } else {
                  // console.log('----------------');
                  var val_start = new Date((form.startDate));
                }

                var val_policy_end = new Date((form.end_of_validity));


                // console.log('val_start', val_start);

                var val_end   = new Date(endDate);

                // if (new Date().getTime() > endDate.getTime()) {
                if (val_start.getTime() > endDate.getTime()) {

                  // console.log('---- FECHA FUERA DE RANGO ----');
                  // empty_receipts = empty_receipts +1;
                  // receipt.startDate = '';
                  // receipt.vencimiento  = '';
                  // receipt.endingDate = '';
                  // receipt.fecha_inicio = '';
                  // receipt.fecha_fin = '';
                  // initDate = endDate;
                  // empty_rec_array.push(receipt);
                  // continue;

                  receipt.startDate = '';
                  receipt.fecha_inicio = '';
                  receipt.endingDate = '';
                  receipt.fecha_fin = '';
                  receipt.vencimiento = '';

                  // console.log('val_start', val_start);
                  // initDate = new Date(val_start);

                  // if(receipt.recibo_numero == 1) {

                  //   receipt.fecha_inicio = datesFactory.convertDate(initDate);
                  //   receipt.startDate = datesFactory.convertDate(initDate);
                  // }

                  // scope.new_amounts = angular.copy(amountReceipts) -1;
                  // scope.new_prima = obj.prima / scope.new_amounts;
                  // scope.new_derecho =  obj.derecho / scope.new_amounts;
                  // scope.new_rpf =  obj.rpf / scope.new_amounts;
                  // scope.new_iva =  obj.iva / scope.new_amounts;
                  // scope.new_subTotal =  obj.subTotal / scope.new_amounts;
                  // scope.new_primaTotal =  obj.primaTotal / scope.new_amounts;
                  // scope.new_comision =  angular.copy(receipt.comision) / scope.new_amounts;
                  // // continue;
                  // console.log('--------------');

                } else {

                  // console.log('*************');

                  receipt.recibo_numero = parseInt(receipt.recibo_numero) - empty_receipts;

                  if(scope.new_prima) {
                    receipt.recibo_numero = receipt.recibo_numero -1;
                    receipt.prima = receipt.prima + scope.new_prima;
                    receipt.prima_neta = receipt.prima + scope.new_prima;

                    receipt.derecho = receipt.derecho +scope.new_derecho;
                    receipt.rpf = receipt.rpf +scope.new_rpf;
                    receipt.iva = scope.new_iva;
                    receipt.subTotal = receipt.subTotal +scope.new_subTotal;
                    receipt.primaTotal = parseFloat(receipt.prima_total) +scope.new_primaTotal;
                    receipt.total = parseFloat(receipt.prima_total) +scope.new_primaTotal;
                    receipt.comision = parseFloat(receipt.comision) +scope.new_comision;

                  }

                  // if(receipt.recibo_numero == 1) {

                  // console.log('initDate', initDate);
                  // console.log('endDate', endDate);
                  if(initDate.getTime() < val_start.getTime()) {
                    initDate = val_start;
                    // console.log('============');
                  }

                  // console.log('val_start', val_start);
                  // console.log('initDate', initDate);
                  // console.log('endDate', endDate);
                  // console.log('init_date', form.init_date);
                  // console.log('endDate', form.end_of_validity);
                  // console.log('.................................', new Date(datesFactory.toDate(new Date(form.end_of_validity))));
                  // console.log('.................................');
                  if(val_start.getTime() > initDate && val_start.getTime() < endDate.getTime()) {

                    if(form.type == 'INDIVIDUAL') {
               
                      if(scope.form.description == 'CAMBIO DE FORMA DE PAGO') {
                        receipt.startDate = datesFactory.convertDate(scope.policy.start_of_validity);
                        receipt.start_of_validity = datesFactory.convertDate(scope.policy.start_of_validity);
                      } else {
                        receipt.startDate = datesFactory.convertDate(scope.endoso_date.start_of_validity);
                        var start___ = (scope.endoso_date.start_of_validity).search('/');
                        if(start___ > -1) {
                          receipt.fecha_inicio = (scope.endoso_date.start_of_validity);
                          receipt.startDate = (scope.endoso_date.start_of_validity);

                        } else {
                          receipt.fecha_inicio = datesFactory.convertDate(scope.endoso_date.start_of_validity);
                          receipt.startDate = datesFactory.convertDate(scope.endoso_date.start_of_validity);

                        }
                        
                      }

                      receipt.endingDate = endDate;
                      receipt.end_of_validity = endDate;

                      var ven_date = datesFactory.convertDate(sumarDias(datesFactory.toDate(receipt.fecha_inicio), 30));
                      receipt.vencimiento = ven_date;

                    } else {

                      console.log('bbb');

                      var date_init = angular.copy(datesFactory.toDate(receipt.fecha_inicio));

                      if(new Date().getTime() > new Date(date_init).getTime()) {
                        receipt.fecha_inicio = datesFactory.convertDate(new Date());
                        receipt.startDate = datesFactory.convertDate(new Date());
                        var ven_date = datesFactory.convertDate(sumarDias(datesFactory.toDate(receipt.fecha_inicio), 30));
                        receipt.vencimiento = ven_date;

                      }
                    }
                    
                    receipt.endingDate = datesFactory.convertDate(endDate);
                    receipt.end_of_validity = datesFactory.convertDate(endDate);

                    initDate = endDate;

                  } else {

                    receipt.startDate = datesFactory.convertDate(initDate);
                    receipt.start_of_validity = datesFactory.convertDate(initDate);
                    receipt.endingDate = datesFactory.convertDate(endDate);
                    receipt.end_of_validity = datesFactory.convertDate(endDate);
                    receipt.vencimiento = datesFactory.convertDate(initDate);

                    if(initDate.getTime() > val_policy_end.getTime()) {

                      receipt.start_of_validity = '';
                      receipt.startDate = '';
                      receipt.fecha_inicio = '';
                      receipt.vencimiento = '';
                    }

                    val_end.setHours(11,59,59);
                    val_policy_end.setHours(11,59,59);

                    if(val_end.getTime() > val_policy_end.getTime()) {         
                    
                      receipt.endingDate = '';
                      receipt.fecha_fin = '';
                      receipt.end_of_validity = '';
                      // receipt.vencimiento = '';

                      if(scope.policy.document_type == 7 && arrayLen.length == 1) {

                        receipt.endingDate = datesFactory.convertDate(val_policy_end);
                        receipt.fecha_fin = datesFactory.convertDate(val_policy_end);
                        receipt.end_of_validity = datesFactory.convertDate(val_policy_end);
                      }
                    }

                    initDate = endDate;
                  }

                }

                if(scope.non_dates) {
                  receipt.startDate = '';
                  receipt.vencimiento  = '';
                  receipt.endingDate = '';
                  receipt.fecha_inicio = '';
                  receipt.fecha_fin = '';
                }

                initDate = endDate;


                scope.receipts.push(angular.copy(receipt));
                
                scope.tosave.endoso = scope.endoso;
                scope.tosave.recibos_poliza = scope.receipts;
                scope.tosave.receipts = scope.receipts;

              }

              // console.log('empty_receipts', empty_receipts);
              if (empty_receipts > 0) {
                // console.log('empty_rec_array',empty_rec_array);
                for(var j in empty_rec_array) {

                  var item = empty_rec_array[j];

                  item.recibo_numero = parseInt(item.recibo_numero) + scope.receipts.length;

                  scope.receipts.push(angular.copy(item));
                
                  scope.tosave.endoso = scope.endoso;
                  scope.tosave.recibos_poliza = scope.receipts;
                  scope.tosave.receipts = scope.receipts

                }

                SweetAlert.swal('La cantidad de recibos no coinicide con la fecha de endoso.');
              }

              if(ramo_code == 1) {
                poliza.ivaStatus = false;
                scope.showIva = false;
                poliza.iva = 0.00;
                scope.endoso.iva = 0.00; 

                primaTotalNum =  poliza.subTotal;
                primaTotalNum = parseFloat(primaTotalNum).toFixed(2);
                scope.endoso.primaNeta = scope.formatNumber(poliza.primaNeta);
                scope.endoso.rpf= scope.formatNumber(poliza.rpf);
                scope.endoso.derecho = scope.formatNumber(poliza.derecho);
                subTotalNum =  poliza.subTotal;
                subTotalNum = parseFloat(subTotalNum).toFixed(2);
                scope.endoso.subTotal = scope.formatNumber(subTotalNum);
                scope.endoso.iva = scope.formatNumber(poliza.iva);
                // scope.endoso.primaTotal = scope.formatNumber(primaTotalNum); 

                  //---------normal-------

              } else {

                poliza.ivaStatus = true;
                scope.showIva = true;
                scope.endoso.primaNeta = scope.formatNumber(poliza.primaNeta);
                scope.endoso.rpf= scope.formatNumber(poliza.rpf);
                scope.endoso.derecho = scope.formatNumber(poliza.derecho);
                subTotalNum =  poliza.subTotal;
                subTotalNum = parseFloat(subTotalNum).toFixed(2);
                scope.endoso.subTotal = scope.formatNumber(subTotalNum);
                scope.endoso.iva = scope.formatNumber(poliza.iva);
                // primaTotalNum =  poliza.primaTotal;
                // primaTotalNum = parseFloat(primaTotalNum).toFixed(2);
                // scope.endoso.primaTotal = scope.formatNumber(primaTotalNum);
              }               

              if(scope.receipts.length) {
                scope.datesN = false;
                scope.receipts.forEach(function(rec,e){
                  if ((rec.fecha_inicio == 'Invalid Date' || rec.fecha_fin == 'Invalid Date') || (rec.fecha_inicio == '' || rec.fecha_fin == '') ){
                    scope.datesN = true;
                  }
                })
                if (scope.datesN) {
                  toaster.warning("Agregar manualmente las fechas y, guarde cambios");                  
                  scope.editTable(true);
                }
                if (!scope.receipts[0].startDate) {
                  scope.editTable(true);
                  toaster.warning("Agregar manualmente las fechas y, guarde cambios");
                }
              }

            }

          }
        }
      }
    }]
);