var app = angular.module('inspinia')
.directive('graphic', ['$http', 'url','exportFactory','$localStorage','$sessionStorage',function ($http, url,exportFactory,$localStorage,$sessionStorage) {

    return {
        restrict: 'EA',
        scope: {
          model : '=',
          lc : '=',
          gsource: '=',
          gtype: '@',
          id : '@',
          greenClick: '&',
          yellowClick: '&',
          orangeClick: '&',
          redClick: '&',
          parentVm: '=?'   // 👈 NUEVO
        },
        templateUrl: 'app/directivas/graphic/graphic.html',
        link: function(scope, element, $watch) {
          // var greatGrandFather = scope.$parent.$parent.$parent.main;
          // Si me pasaron el padre explícito, úsalo
          var greatGrandFather = scope.parentVm;

          // Fallbacks por si todavía no actualizas todos los templates viejos
          if (!greatGrandFather) {
            greatGrandFather =
              (scope.$parent && scope.$parent.main) ||
              (scope.$parent && scope.$parent.$parent && scope.$parent.$parent.main) ||
              (scope.$parent && scope.$parent.$parent && scope.$parent.$parent.$parent && scope.$parent.$parent.$parent.main);
          }

          if (!greatGrandFather) {
            console.warn('graphic directive: no se pudo resolver main (parentVm/main)');
            return;
          }
          var infoUser = $sessionStorage.infoUser;

          if(scope.gtype) {
            switch (scope.gtype) {
              case 'ot':
                httpCall('chart-polizas/')
                break;
              case 'receipts':
                httpCall('chart-recibos/');
                break;
              case 'renewals':
                httpCall('chart-renovaciones/')
                break;
              case 'sinister':
                httpCall('chart-siniestros/')
                break;
              default:

            }
          }
          // 👇 NUEVO: función global para recargar la gráfica de recibos
          if (scope.gtype === 'receipts') {
            greatGrandFather.reloadReceiptsGraphic = function() {
              // 1) refrescar donut / resumen
              httpCall('chart-recibos/');

              // 2) refrescar el listado con el último filtro usado
              //    (color y orden guardados en localStorage por la propia directiva)
              var parType = $localStorage.type_rec || greatGrandFather.color || 'green';
              var order   = $localStorage.order_rec || 1;
              var asc     = $localStorage.asc_rec   || 1;
              console.log('función actualizar gráfica')
              scope.gtype = 'receipts';
              scope.getItems(parType, order, asc);
            };
          }
          function httpCallEndo(parUrl, parType, titleID, title,order,asc) {
            greatGrandFather.showEndV = false
            if(parType) {
              if(parType == 'blue'){
                var par = {polizaId: 0};
                scope.polizaId = par;
                scope.order = order;
                scope.asc = asc;
              } else{
                var par = { tipo: parType, order : order, asc: asc}
              }
            } else {
              var par = {tipo: null,order : order, asc: asc};
            }
            if (parUrl == 'graficas-endosos/') {
              var met = 'POST'
              var p = 'data'
              var d = par
              var u = {
                method: 'POST',
                url: url.IP+'graficas-endosos/',
                data: par
              }
            }else{
              var met = 'GET'
              var p = 'params'
              var d = par
              var u = {
                method: 'GET',
                url: url.IP+parUrl,
                params: par
              }
            }
            // $http({
            //   method: 'GET',
            //   url: url.IP +parUrl,
            //   params: par
            // })
            $http(u)
            .then(
              function success(response) {
                if(response.status === 200 || response.status === 201) {
                  if(parType) {
                    switch (scope.gtype) {
                      case 'ot':
                        greatGrandFather.endo = [];
                        var today = new Date();
                        today = today.getTime();
                        response.data.results.forEach(function (item) {
                          var fechaInicio = new Date(item.created_at).getTime();
                          var diff = today - fechaInicio;
                          item.antiguedad = parseInt(diff/(1000*60*60*24))
                          greatGrandFather.endo.push(item);
                        });
                        greatGrandFather.policyTable = true;
                        greatGrandFather.coverageTable = false;
                        greatGrandFather.renewalTable = false;
                        greatGrandFather.sinisterTable = false;
                        greatGrandFather.titleID = titleID;
                        greatGrandFather.title = title;
                        greatGrandFather.vida_pagination = {
                          count: response.data.count,
                          next: response.data.next,
                          previous: response.data.previous
                        };
                        greatGrandFather.show_paginationVida = true;
                        greatGrandFather.show_vida_pagination = true;
                      }
                  }
                }
            });

          }

          function httpCall(parUrl, parType, titleID, title,order,asc) {
            greatGrandFather.titleID = titleID;
            greatGrandFather.title = title;
            greatGrandFather.orden = order
            greatGrandFather.asce = asc
            greatGrandFather.show_paginationOt = false;
            greatGrandFather.show_ots_pagination = false;
            greatGrandFather.show_paginationReceipts = false;
            greatGrandFather.show_receipts_pagination = false;
            greatGrandFather.show_paginationRenewals = false;
            greatGrandFather.show_renovaciones_pagination = false;
            greatGrandFather.show_paginationRenewals = false;
            greatGrandFather.show_renovaciones_pagination = false;
            greatGrandFather.show_sinisters_pagination = false;



            if(parType) {
              if(parType == 'blue'){
                var par = {polizaId: 0,order : order, asc: asc, vendedor: 0, type_contractor: 0, contratante: 0, grupo: 0};
                scope.polizaId = par;
                scope.order = order;
                scope.asc = asc;
              } else{
                var par = { tipo: parType, order : order, asc: asc};
              }
            } else {
              var par = {tipo: null,order : order, asc: asc};
            }
            if (parUrl == 'graficas-polizas/') {
              var met = 'POST'
              var p = 'data'
              var d = par
              var u = {
                method: 'POST',
                url: url.IP+'graficas-polizas/',
                data: par
              }
            }else{
              var met = 'GET'
              var p = 'params'
              var d = par
              var u = {
                method: 'GET',
                url: url.IP+parUrl,
                params: par
              }
            }
            // $http({
            //   method: met,
            //   url: url.IP +parUrl,
            //   p: par
            // })
            $http(u)
            .then(
              function success(response) {
                if(response.status === 200 || response.status === 201) {
                  if(parType) {
                    switch (scope.gtype) {
                      case 'ot':

                        greatGrandFather.insurances = [];

                        var today = new Date();
                        today = today.getTime();
                        response.data.results.forEach(function (item) {
                          var fechaInicio = new Date(item.created_at).getTime();
                          var diff = today - fechaInicio;
                          item.antiguedad = parseInt(diff/(1000*60*60*24))
                          greatGrandFather.insurances.push(item);
                        });
                        greatGrandFather.insurances.forEach(function(value){
                          if (value.old_policies) {
                          value.old_policies.forEach(function(old){
                            if (old) {
                              if (value.id == old.base_policy.id) {
                                if (value.renewed) {
                                  value.historic =' Renovada';
                                }else{
                                  value.historic = ' por renovar'
                                }
                              }else if (value.id == old.new_policy.id) {
                                value.historic ='de Renovación';
                              }else{
                                value.historic = ' nueva'
                              }
                            }else{
                              value.historic = ' nueva'
                            }

                          })
                          if (value.historic) {
                          }else{
                            value.historic = ' nueva'
                          }
                        }
                          // $http({
                          //   method: 'GET',
                          //   url: url.IP + 'historic-policies/',
                          //   params: {
                          //     actual_id: value.id
                          //   }
                          // }).then(function success(response) {
                          //   if(response.data.results.length){
                          //     response.data.results.forEach(function function_name(old) {
                          //       if(old.base_policy){
                          //         if(value.id == old.new_policy.id){
                          //           if (old.new_policy) {
                          //             value.historic ='de Renovación';
                          //           }
                          //         } else {
                          //             value.historic = ' nueva'
                          //         }
                          //       }else{
                          //         value = ''
                          //       }
                          //     })
                          //   }else{
                          //       value.historic = ' nueva'

                          //   }
                          // })
                        })
                        greatGrandFather.policyTable = true;
                        greatGrandFather.coverageTable = false;
                        greatGrandFather.coverageModal = false;
                        greatGrandFather.renewalTable = false;
                        greatGrandFather.sinisterTable = false;
                        greatGrandFather.titleID = titleID;
                        greatGrandFather.title = title;
                        greatGrandFather.ot_pagination = {
                          count: response.data.count,
                          next: response.data.next,
                          previous: response.data.previous
                        };
                        // greatGrandFather.show_paginationOt = true;
                        // greatGrandFather.show_ots_pagination = true;
                        break;
                      case 'receipts':
                        if(parUrl == 'get-notas/'){
                          greatGrandFather.notascredito = response.data.results;
                          greatGrandFather.notas = true;
                          greatGrandFather.coverageTable = false;
                          greatGrandFather.coverageModal = false;
                          greatGrandFather.config_receipts = false
                          greatGrandFather.show_paginationReceipts = false;
                          greatGrandFather.show_receipts_pagination = false;
                          greatGrandFather.config_notes = {
                            count: response.data.count,
                            next: response.data.next,
                            previous: response.data.previous
                          };
                          greatGrandFather.show_paginationNote = true;
                          greatGrandFather.show_note_pagination = true;
                          } else {
                            if (parUrl && parUrl.indexOf('/graficas-recibos') !== -1) {
                              var queryString = parUrl.split('?')[1] || '';
                              var params = {};
                              queryString.split('&').forEach(function (pair) {
                                if (!pair) return;
                                var parts = pair.split('=');
                                var key = decodeURIComponent(parts[0]);
                                var value = decodeURIComponent(parts[1] || '');
                                params[key] = value;
                              });
                              var page = params.page || '1';
                              $localStorage.graficas_recibos_page = page;
                              $localStorage.graficas_recibos_url = parUrl;
                            }
                            // if (!$localStorage.graficas_recibos_url) {
                            var queryString = parUrl.split('?')[1] || '';
                            var params = {};
                            queryString.split('&').forEach(function (pair) {
                              if (!pair) return;
                              var parts = pair.split('=');
                              var key = decodeURIComponent(parts[0]);
                              var value = decodeURIComponent(parts[1] || '');
                              params[key] = value;
                            });
                            var page = params.page || '1';
                            $localStorage.graficas_recibos_page = page;
                            $localStorage.graficas_recibos_url = parUrl;
                            // }
                            greatGrandFather.notas = false;
                            greatGrandFather.coverageTable = true;
                            greatGrandFather.receipts = response.data.results;

                            for (var i = 0; i < greatGrandFather.receipts.length; i++) {
                              // greatGrandFather.receipts[i].receipt_type = greatGrandFather.receipts[i].receipt_type == 1 ? "Póliza" : "Endoso";
                              if (greatGrandFather.receipts[i].poliza){
                                greatGrandFather.receipts[i].poliza.status = greatGrandFather.receipts[i].poliza.status == 1 ? "En trámite" :
                                greatGrandFather.receipts[i].poliza.status == 2 ? "OT Cancelada" : greatGrandFather.receipts[i].poliza.status == 10 ? "Por Iniciar" :
                                greatGrandFather.receipts[i].poliza.status == 11 ? "Cancelada" : greatGrandFather.receipts[i].poliza.status == 12 ? "Renovada" :
                                greatGrandFather.receipts[i].poliza.status == 13 ? "Vencida" : greatGrandFather.receipts[i].poliza.status == 14 ? "Vigente" : "Vigente";
                              }else if (greatGrandFather.receipts[i].fianza) {
                                greatGrandFather.receipts[i].fianza.status = greatGrandFather.receipts[i].fianza.status == 1 ? "En trámite" :
                                greatGrandFather.receipts[i].fianza.status == 2 ? "OT Cancelada" : greatGrandFather.receipts[i].fianza.status == 10 ? "Por Iniciar" :
                                greatGrandFather.receipts[i].fianza.status == 11 ? "Cancelada" : greatGrandFather.receipts[i].fianza.status == 12 ? "Anulada" :
                                greatGrandFather.receipts[i].fianza.status == 13 ? "Rechazada" : greatGrandFather.receipts[i].fianza.status == 15 ? "Renovada" : "Vigente";
                              }

                              if(greatGrandFather.receipts[i].status == 1){
                                greatGrandFather.receipts[i].status = "Pagado"
                              }else if (greatGrandFather.receipts[i].status == 2){
                                greatGrandFather.receipts[i].status = "Cancelado"
                              } else if (greatGrandFather.receipts[i].status == 3 ){
                                greatGrandFather.receipts[i].status = "Prorrogado"
                              }else if (greatGrandFather.receipts[i].status == 4){
                                greatGrandFather.receipts[i].status = "Pendiente de pago"
                              } else if (greatGrandFather.receipts[i].status == 5) {
                                greatGrandFather.receipts[i].status = "Liquidado"
                              }else if (greatGrandFather.receipts[i].status == 6){
                                greatGrandFather.receipts[i].status = "Conciliado"
                              }else if (greatGrandFather.receipts[i].status == 7){
                                greatGrandFather.receipts[i].status = "Cerrado"
                              } else if (greatGrandFather.receipts[i].status == 0 ){
                                greatGrandFather.receipts[i].status = "Desactivado"
                              }else{
                                greatGrandFather.receipts[i].status = "Sin estatus"
                              }

                              if (greatGrandFather.receipts[i].poliza) {
                                if(greatGrandFather.receipts[i].poliza.forma_de_pago == 1){
                                  greatGrandFather.receipts[i].poliza.forma_de_pago = "Mensual"
                                }else if (greatGrandFather.receipts[i].poliza.forma_de_pago == 2){
                                  greatGrandFather.receipts[i].poliza.forma_de_pago = "Bimestral"
                                } else if (greatGrandFather.receipts[i].poliza.forma_de_pago == 3 ){
                                  greatGrandFather.receipts[i].poliza.forma_de_pago = "Trimestral"
                                }else if (greatGrandFather.receipts[i].poliza.forma_de_pago == 5){
                                  greatGrandFather.receipts[i].poliza.forma_de_pago = "Contado"
                                } else if (greatGrandFather.receipts[i].poliza.forma_de_pago == 6) {
                                  greatGrandFather.receipts[i].poliza.forma_de_pago = "Semestral"
                                }else if (greatGrandFather.receipts[i].poliza.forma_de_pago == 12){
                                  greatGrandFather.receipts[i].poliza.forma_de_pago = "Anual"
                                }else{
                                  greatGrandFather.receipts[i].poliza.forma_de_pago = "Sin estatus"
                                }
                              }
                            }
                            greatGrandFather.config_receipts = {
                              count: response.data.count,
                              next: response.data.next,
                              previous: response.data.previous
                            };
                          }

                          greatGrandFather.policyTable = false;
                          greatGrandFather.renewalTable = false;
                          greatGrandFather.sinisterTable = false;
                          greatGrandFather.endorsementTable = false;

                          greatGrandFather.titleID = titleID;
                          greatGrandFather.title = title;

                          greatGrandFather.show_paginationReceipts = true;
                          greatGrandFather.show_receipts_pagination = true;
                          break;
                      case 'renewals':
                        greatGrandFather.show_renewal = false
                        greatGrandFather.policies = response.data.results;
                        // hacer el config y el show
                        // greatGrandFather == main
                        greatGrandFather.notas = false;
                        greatGrandFather.renewalTable = true;
                        greatGrandFather.policyTable = false;
                        greatGrandFather.coverageTable = false;
                        greatGrandFather.coverageModal = false;
                        greatGrandFather.sinisterTable = false;
                        greatGrandFather.endorsementTable = false;
                        greatGrandFather.config_renovaciones = {
                          count: response.data.count,
                          next: response.data.next,
                          previous: response.data.previous
                        };
                        greatGrandFather.show_paginationRenewals = true;
                        greatGrandFather.show_renovaciones_pagination = true;
                        break;
                      case 'sinister':
                        greatGrandFather.sinisters = response.data.results;
                        greatGrandFather.sinisterTable = true;
                        greatGrandFather.notas = false;
                        greatGrandFather.renewalTable = false;
                        greatGrandFather.policyTable = false;
                        greatGrandFather.coverageTable = false;
                        greatGrandFather.coverageModal = false;
                        greatGrandFather.endorsementTable = false;
                        greatGrandFather.titleID = titleID;
                        greatGrandFather.title = title;
                        greatGrandFather.config_sinisters = {
                          count: response.data.count,
                          next: response.data.next,
                          previous: response.data.previous
                        };
                        greatGrandFather.show_sinisters_pagination = true;
                        break;
                      default:
                        console.log('vvvvvvvvvv',$localStorage['graficas_recibos_url'])
                    }
                  } else {
                    scope.data = response.data;
                  }
                  if (scope.gtype == 'ot'){
                    var order = 1;
                    var asc = 1;
                    greatGrandFather.vida = false
                    httpCallEndo('graficas-endosos/', parType, titleID, title,order,asc)
                  }
                } else {
                  console.log('Error en graphic', response.data);
                }

              },
              function error(response) {
                console.log('ERROR', response);
              });
          }
          greatGrandFather.changePolicyDash = changePolicyDash;
          function changePolicyDash(par,asc){
            greatGrandFather.ots = true
            greatGrandFather.vida = false
            greatGrandFather.gastos = false
            greatGrandFather.d = false
            switch(par) {
                case 1:
                  scope.gtype = 'ot';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.policy_type_asc = asc;
                  greatGrandFather.policy_folio_asc = 0;
                  greatGrandFather.policy_fint_asc = 0;
                  greatGrandFather.policy_cont_asc = 0;
                  greatGrandFather.policy_subr_asc = 0;
                  greatGrandFather.policy_aseg_asc = 0;
                  greatGrandFather.policy_fcre_asc = 0;
                  break;
                case 2:
                  scope.gtype = 'ot';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.policy_folio_asc = asc;
                  greatGrandFather.policy_type_asc = 0;
                  greatGrandFather.policy_fint_asc = 0;
                  greatGrandFather.policy_cont_asc = 0;
                  greatGrandFather.policy_subr_asc = 0;
                  greatGrandFather.policy_aseg_asc = 0;
                  greatGrandFather.policy_fcre_asc = 0;
                  break;
                case 3:
                  scope.gtype = 'ot';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.policy_fint_asc = asc;
                  greatGrandFather.policy_type_asc = 0;
                  greatGrandFather.policy_folio_asc = 0;
                  greatGrandFather.policy_cont_asc = 0;
                  greatGrandFather.policy_subr_asc = 0;
                  greatGrandFather.policy_aseg_asc = 0;
                  greatGrandFather.policy_fcre_asc = 0;
                  break;
                case 4:
                  scope.gtype = 'ot';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.policy_cont_asc = asc;
                  greatGrandFather.policy_folio_asc = 0;
                  greatGrandFather.policy_type_asc = 0;
                  greatGrandFather.policy_fint_asc = 0;
                  greatGrandFather.policy_subr_asc = 0;
                  greatGrandFather.policy_aseg_asc = 0;
                  greatGrandFather.policy_fcre_asc = 0;
                  break;
                case 5:
                  scope.gtype = 'ot';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.policy_subr_asc = asc;
                  greatGrandFather.policy_type_asc = 0;
                  greatGrandFather.policy_folio_asc = 0;
                  greatGrandFather.policy_fint_asc = 0;
                  greatGrandFather.policy_cont_asc = 0;
                  greatGrandFather.policy_aseg_asc = 0;
                  greatGrandFather.policy_fcre_asc = 0;
               case 6:
                  scope.gtype = 'ot';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.policy_aseg_asc = asc;
                  greatGrandFather.policy_type_asc = 0;
                  greatGrandFather.policy_folio_asc = 0;
                  greatGrandFather.policy_fint_asc = 0;
                  greatGrandFather.policy_cont_asc = 0;
                  greatGrandFather.policy_subr_asc = 0;
                  greatGrandFather.policy_fcre_asc = 0;
                  break;
               case 7:
                  scope.gtype = 'ot';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.policy_type_asc = 0;
                  greatGrandFather.policy_folio_asc = 0;
                  greatGrandFather.policy_fint_asc = 0;
                  greatGrandFather.policy_cont_asc = 0;
                  greatGrandFather.policy_subr_asc = 0;
                  greatGrandFather.policy_aseg_asc = 0;
                  greatGrandFather.policy_fcre_asc = asc;
                  break;
            }
          }
          greatGrandFather.showEndV = false
          greatGrandFather.changeEndDashV = changeEndDashV;
          function changeEndDashV(par,asc){
            greatGrandFather.vida = true
            greatGrandFather.gastos = false
            greatGrandFather.d = false
            greatGrandFather.ots = false
            switch(par) {
                case 1:
                  scope.gtype = 'ot';
                  httpCallEndo('graficas-endosos/',greatGrandFather.color,greatGrandFather.titleID,greatGrandFather.title,par, asc);
                  greatGrandFather.vida_type_asc = asc;
                  greatGrandFather.vida_cont_asc = 0;
                  greatGrandFather.vida_nump_asc = 0;
                  greatGrandFather.vida_aseg_asc = 0;
                  greatGrandFather.vida_creac_asc = 0;
                  break;
                case 2:
                  scope.gtype = 'ot';
                  httpCallEndo('graficas-endosos/',greatGrandFather.color,greatGrandFather.titleID,greatGrandFather.title,par, asc);
                  greatGrandFather.vida_cont_asc = asc;
                  greatGrandFather.vida_type_asc = 0;
                  greatGrandFather.vida_nump_asc = 0;
                  greatGrandFather.vida_aseg_asc = 0;
                  greatGrandFather.vida_creac_asc = 0;
                  break;
                case 3:
                  scope.gtype = 'ot';
                  httpCallEndo('graficas-endosos/',greatGrandFather.color,greatGrandFather.titleID,greatGrandFather.title,par, asc);
                  greatGrandFather.vida_nump_asc = asc;
                  greatGrandFather.vida_type_asc = 0;
                  greatGrandFather.vida_cont_asc = 0;
                  greatGrandFather.vida_aseg_asc = 0;
                  greatGrandFather.vida_creac_asc = 0;
                  break;
                case 4:
                  scope.gtype = 'ot';
                  httpCallEndo('graficas-endosos/',greatGrandFather.color,greatGrandFather.titleID,greatGrandFather.title,par, asc);
                  greatGrandFather.vida_aseg_asc = asc;
                  greatGrandFather.vida_cont_asc = 0;
                  greatGrandFather.vida_type_asc = 0;
                  greatGrandFather.vida_nump_asc = 0;
                  greatGrandFather.vida_creac_asc = 0;
                  break;
                case 5:
                  scope.gtype = 'ot';
                  httpCallEndo('graficas-endosos/',greatGrandFather.color,greatGrandFather.titleID,greatGrandFather.title,par, asc);
                  greatGrandFather.vida_creac_asc = asc;
                  greatGrandFather.vida_type_asc = 0;
                  greatGrandFather.vida_cont_asc = 0;
                  greatGrandFather.vida_nump_asc = 0;
                  greatGrandFather.vida_aseg_asc = 0;
                  break;
            }
          }


          greatGrandFather.changeReceipt = changeReceipt;
          greatGrandFather.show_cobranza = false
          function changeReceipt(par,asc){
            switch(par) {
              case 1:
                scope.gtype = 'receipts';
                scope.getItems(greatGrandFather.color,par, asc);
                greatGrandFather.receipt_num_asc = asc;
                greatGrandFather.receipt_cont_asc = 0;
                greatGrandFather.receipt_nump_asc = 0;
                greatGrandFather.receipt_vig_asc = 0;
                greatGrandFather.receipt_subr_asc = 0;
                greatGrandFather.receipt_aseg_asc = 0;
                greatGrandFather.receipt_venc_asc = 0;
                greatGrandFather.receipt_pneta= 0;

                break;
              case 2:
                scope.gtype = 'receipts';
                scope.getItems(greatGrandFather.color,par, asc);
                greatGrandFather.receipt_cont_asc = asc;
                greatGrandFather.receipt_num_asc = 0;
                greatGrandFather.receipt_nump_asc = 0;
                greatGrandFather.receipt_vig_asc = 0;
                greatGrandFather.receipt_subr_asc = 0;
                greatGrandFather.receipt_aseg_asc = 0;
                greatGrandFather.receipt_venc_asc = 0;
                greatGrandFather.receipt_pneta= 0;
                break;
              case 3:
                scope.gtype = 'receipts';
                scope.getItems(greatGrandFather.color,par, asc);
                greatGrandFather.receipt_nump_asc = asc;
                greatGrandFather.receipt_num_asc = 0;
                greatGrandFather.receipt_cont_asc = 0;
                greatGrandFather.receipt_vig_asc = 0;
                greatGrandFather.receipt_subr_asc = 0;
                greatGrandFather.receipt_aseg_asc = 0;
                greatGrandFather.receipt_venc_asc = 0;
                greatGrandFather.receipt_pneta= 0;
                break;
              case 4:
                scope.gtype = 'receipts';
                scope.getItems(greatGrandFather.color,par, asc);
                greatGrandFather.receipt_vig_asc = asc;
                greatGrandFather.receipt_cont_asc = 0;
                greatGrandFather.receipt_num_asc = 0;
                greatGrandFather.receipt_nump_asc = 0;
                greatGrandFather.receipt_subr_asc = 0;
                greatGrandFather.receipt_aseg_asc = 0;
                greatGrandFather.receipt_venc_asc = 0;
                greatGrandFather.receipt_pneta= 0;
                break;
              case 5:
                scope.gtype = 'receipts';
                scope.getItems(greatGrandFather.color,par, asc);
                greatGrandFather.receipt_subr_asc = asc;
                greatGrandFather.receipt_num_asc = 0;
                greatGrandFather.receipt_cont_asc = 0;
                greatGrandFather.receipt_nump_asc = 0;
                greatGrandFather.receipt_vig_asc = 0;
                greatGrandFather.receipt_aseg_asc = 0;
                greatGrandFather.receipt_venc_asc = 0;
                greatGrandFather.receipt_pneta= 0;
                break;
              case 6:
                scope.gtype = 'receipts';
                scope.getItems(greatGrandFather.color,par, asc);
                greatGrandFather.receipt_subr_asc = 0;
                greatGrandFather.receipt_num_asc = 0;
                greatGrandFather.receipt_cont_asc = 0;
                greatGrandFather.receipt_nump_asc = 0;
                greatGrandFather.receipt_vig_asc = 0;
                greatGrandFather.receipt_aseg_asc = asc;
                greatGrandFather.receipt_venc_asc = 0;
                greatGrandFather.receipt_pneta= 0;
                break;
              case 7:
                scope.gtype = 'receipts';
                scope.getItems(greatGrandFather.color,par, asc);
                greatGrandFather.receipt_subr_asc = 0;
                greatGrandFather.receipt_num_asc = 0;
                greatGrandFather.receipt_cont_asc = 0;
                greatGrandFather.receipt_nump_asc = 0;
                greatGrandFather.receipt_vig_asc = 0;
                greatGrandFather.receipt_aseg_asc = 0;
                greatGrandFather.receipt_venc_asc = asc;
                greatGrandFather.receipt_pneta= 0;
                break;
              case 8:
                scope.gtype = 'receipts';
                scope.getItems(greatGrandFather.color,par, asc);
                greatGrandFather.receipt_subr_asc = 0;
                greatGrandFather.receipt_num_asc = 0;
                greatGrandFather.receipt_cont_asc = 0;
                greatGrandFather.receipt_nump_asc = 0;
                greatGrandFather.receipt_vig_asc = 0;
                greatGrandFather.receipt_aseg_asc = 0;
                greatGrandFather.receipt_venc_asc = 0;
                greatGrandFather.receipt_pneta= asc;
                break;
            }
          }

          greatGrandFather.changeNCr = changeNCr;
          greatGrandFather.show_nota = false
          function changeNCr(par,asc){
            switch(par) {
                case 1:
                  scope.gtype = 'receipts';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.nota_cont_asc = asc;
                  greatGrandFather.nota_folio_asc = 0;
                  greatGrandFather.nota_numend_asc = 0;
                  greatGrandFather.nota_numpol_asc = 0;
                  greatGrandFather.nota_fecha_asc = 0;
                  greatGrandFather.nota_ptotal_asc = 0;
                  greatGrandFather.nota_pago_asc = 0;
                  greatGrandFather.nota_moneda_asc = 0;
                  break;
                case 2:
                  scope.gtype = 'receipts';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.nota_folio_asc = asc;
                  greatGrandFather.nota_cont_asc = 0;
                  greatGrandFather.nota_numend_asc = 0;
                  greatGrandFather.nota_numpol_asc = 0;
                  greatGrandFather.nota_fecha_asc = 0;
                  greatGrandFather.nota_ptotal_asc = 0;
                  greatGrandFather.nota_pago_asc = 0;
                  greatGrandFather.nota_moneda_asc = 0;
                  break;
                case 3:
                  scope.gtype = 'receipts';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.nota_numend_asc = asc;
                  greatGrandFather.nota_cont_asc = 0;
                  greatGrandFather.nota_folio_asc = 0;
                  greatGrandFather.nota_numpol_asc = 0;
                  greatGrandFather.nota_fecha_asc = 0;
                  greatGrandFather.nota_ptotal_asc = 0;
                  greatGrandFather.nota_pago_asc = 0;
                  greatGrandFather.nota_moneda_asc = 0;
                  break;
                case 4:
                  scope.gtype = 'receipts';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.nota_numpol_asc = asc;
                  greatGrandFather.nota_folio_asc = 0;
                  greatGrandFather.nota_cont_asc = 0;
                  greatGrandFather.nota_numend_asc = 0;
                  greatGrandFather.nota_fecha_asc = 0;
                  greatGrandFather.nota_ptotal_asc = 0;
                  greatGrandFather.nota_pago_asc = 0;
                  greatGrandFather.nota_moneda_asc = 0;
                  break;
                case 5:
                  scope.gtype = 'receipts';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.nota_fecha_asc = asc;
                  greatGrandFather.nota_cont_asc = 0;
                  greatGrandFather.nota_folio_asc = 0;
                  greatGrandFather.nota_numend_asc = 0;
                  greatGrandFather.nota_numpol_asc = 0;
                  greatGrandFather.nota_ptotal_asc = 0;
                  greatGrandFather.nota_pago_asc = 0;
                  greatGrandFather.nota_moneda_asc = 0;
                  break;
                case 6:
                  scope.gtype = 'receipts';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.nota_fecha_asc = 0;
                  greatGrandFather.nota_cont_asc = 0;
                  greatGrandFather.nota_folio_asc = 0;
                  greatGrandFather.nota_numend_asc = 0;
                  greatGrandFather.nota_numpol_asc = 0;
                  greatGrandFather.nota_ptotal_asc = asc;
                  greatGrandFather.nota_pago_asc = 0;
                  greatGrandFather.nota_moneda_asc = 0;
                  break;
                case 7:
                  scope.gtype = 'receipts';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.nota_fecha_asc = 0;
                  greatGrandFather.nota_cont_asc = 0;
                  greatGrandFather.nota_folio_asc = 0;
                  greatGrandFather.nota_numend_asc = 0;
                  greatGrandFather.nota_numpol_asc = 0;
                  greatGrandFather.nota_ptotal_asc = 0;
                  greatGrandFather.nota_pago_asc = asc;
                  greatGrandFather.nota_moneda_asc = 0;
                  break;
                case 8:
                  scope.gtype = 'receipts';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.nota_fecha_asc = 0;
                  greatGrandFather.nota_cont_asc = 0;
                  greatGrandFather.nota_folio_asc = 0;
                  greatGrandFather.nota_numend_asc = 0;
                  greatGrandFather.nota_numpol_asc = 0;
                  greatGrandFather.nota_ptotal_asc = 0;
                  greatGrandFather.nota_pago_asc = 0;
                  greatGrandFather.nota_moneda_asc = asc;
                  break;
            }
          }
          greatGrandFather.show_renewal = false
          greatGrandFather.changeRen = changeRen
          function changeRen(par,asc){
            greatGrandFather.show_renewal = false
            switch(par) {
                case 1:
                  scope.gtype = 'renewals';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.ren_nump_asc = asc;
                  greatGrandFather.ren_cont_asc = 0;
                  greatGrandFather.ren_subr_asc = 0;
                  greatGrandFather.ren_aseg_asc = 0;
                  greatGrandFather.ren_vig_asc = 0;
                  break;
                case 2:
                  scope.gtype = 'renewals';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.ren_cont_asc = asc;
                  greatGrandFather.ren_nump_asc = 0;
                  greatGrandFather.ren_subr_asc = 0;
                  greatGrandFather.ren_aseg_asc = 0;
                  greatGrandFather.ren_vig_asc = 0;
                  break;
                case 3:
                  scope.gtype = 'renewals';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.ren_subr_asc = asc;
                  greatGrandFather.ren_nump_asc = 0;
                  greatGrandFather.ren_cont_asc = 0;
                  greatGrandFather.ren_aseg_asc = 0;
                  greatGrandFather.ren_vig_asc = 0;
                  break;
                case 4:
                  scope.gtype = 'renewals';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.ren_aseg_asc = asc;
                  greatGrandFather.ren_cont_asc = 0;
                  greatGrandFather.ren_nump_asc = 0;
                  greatGrandFather.ren_subr_asc = 0;
                  greatGrandFather.ren_vig_asc = 0;
                  break;
                case 5:
                  scope.gtype = 'renewals';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.ren_vig_asc = asc;
                  greatGrandFather.ren_nump_asc = 0;
                  greatGrandFather.ren_cont_asc = 0;
                  greatGrandFather.ren_subr_asc = 0;
                  greatGrandFather.ren_aseg_asc = 0;
                  break;
              }
            }
          greatGrandFather.show_sinister = false
          greatGrandFather.changeSin = changeSin;
          function changeSin(par,asc){
            greatGrandFather.show_sinister = false
            switch(par) {
                case 1:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_afec_asc = asc;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 2:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_cont_asc = asc;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 3:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_aseg_asc = asc;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 4:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_nump_asc = asc;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 5:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_nums_asc = asc;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 6:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_subr_asc = asc;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 7:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = asc;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 9:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = asc;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 10:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = asc;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 11:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = asc;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 12:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = asc;
                  greatGrandFather.sin_compromiso_asc = 0;
                  break;
                case 13:
                  scope.gtype = 'sinister';
                  scope.getItems(greatGrandFather.color,par, asc);
                  greatGrandFather.sin_nums_asc = 0;
                  greatGrandFather.sin_afec_asc = 0;
                  greatGrandFather.sin_cont_asc = 0;
                  greatGrandFather.sin_aseg_asc = 0;
                  greatGrandFather.sin_nump_asc = 0;
                  greatGrandFather.sin_subr_asc = 0;
                  greatGrandFather.sin_fecha_asc = 0;
                  greatGrandFather.sin_status_asc = 0;
                  greatGrandFather.sin_reclamado_asc = 0;
                  greatGrandFather.sin_tipopad_asc = 0;
                  greatGrandFather.sin_ingreso_asc = 0;
                  greatGrandFather.sin_compromiso_asc = asc;
                  break;
              }
            }

          scope.getItems = function(parType,order,asc) {
            greatGrandFather.cadena = ''
            scope.lc = parType ? parType : '';
            greatGrandFather.last_color = scope.lc;
            var myDiv = $("html, body");
            var scrollto = myDiv.offset().top + (myDiv.height() / 2);
            myDiv.animate({ scrollTop: scrollto });

            greatGrandFather.cadena = "";
            greatGrandFather.serie = "";

            greatGrandFather.btn_all = false;
            greatGrandFather.show_cobranza = false;
            greatGrandFather.show_renewal= false;
            greatGrandFather.show_sinister = false;
            greatGrandFather.color = parType;
            greatGrandFather.show_binnacle = false;
            greatGrandFather.show_binnacle_receipt = false;
            greatGrandFather.show_binnacle_renewal = false;


            switch (scope.gtype) {
              case 'ot':
              greatGrandFather.autos = false;
              greatGrandFather.gastos = false;
              greatGrandFather.vida = false;
              greatGrandFather.d = false
                if(parType == 'green'){
                  var titleID = 1;
                  var title = "En tiempo"
                }else if(parType == 'yellow'){
                  var titleID = 2;
                  var title = "Se acerca su vencimiento"//"Fuera de tiempo"
                }else if(parType == 'orange'){
                  var titleID = 3;
                  var title = "Con atraso importante"
                }else if(parType == 'red'){
                  var titleID = 4;
                  var title = "Atención urgente"
                }
                httpCall('graficas-polizas/', parType, titleID, title,order,asc)

                greatGrandFather.exportData = exportData;
                function exportData(param){
                  greatGrandFather.btn_all = false
                  if (param == 1){
                     $http({
                        method: 'GET',
                        url: url.IP +'excel-graficas-polizas/',
                        params:{
                          tipo: parType,
                          order: order,
                          asc: asc
                        },
                        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                        responseType: "arraybuffer"
                      })
                      .then(
                        function success(data) {
                          if(data.status == 200){
                            var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                            saveAs(blob, 'Reporte_Dash_OTs.xls');
                          } else {
                            SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
                          }
                    });
                  }
                  else if (param == 2){
                     $http({
                        method: 'GET',
                        url: url.IP +'excel-graficas-endosos/',
                        params:{
                          tipo: parType,
                          order: order,
                          asc: asc
                        },
                        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                        responseType: "arraybuffer"
                      })
                      .then(
                        function success(data) {
                          if(data.status == 200){
                            var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                            saveAs(blob, 'Reporte_Endosos_Dash.xls');
                          } else {
                            SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
                          }
                    });
                  }
              }
                break;
              case 'receipts':

                if(parType == 'green'){
                  var titleID = 1;
                  var title = "En tiempo"
                  httpCall('graficas-recibos/', parType, titleID, title, order, asc)
                }else if(parType == 'yellow'){
                  var titleID = 2;
                  var title = "Se acerca su vencimiento"//"Fuera de tiempo"
                  httpCall('graficas-recibos/', parType, titleID, title, order, asc)
                }else if(parType == 'orange'){
                  var titleID = 3;
                  var title = "Gestionar cobranza urgente"
                  httpCall('graficas-recibos/', parType, titleID, title, order, asc)
                }else if(parType == 'red'){
                  var titleID = 4;
                  var title = "Recibos vencidos"
                  httpCall('graficas-recibos/', parType, titleID, title, order, asc)
                } else if(parType == 'blue'){
                  var titleID = 5;
                  var title = "Notas de crédito"
                  httpCall('get-notas/', parType, titleID, title, order, asc)
                }

                $localStorage.order_rec = order;
                $localStorage.asc_rec = asc;
                $localStorage.type_rec = parType;
                greatGrandFather.exportDataReceipts = exportDataReceipts;
                greatGrandFather.exportDataReceiptsAll = exportDataReceiptsAll;
                function exportDataReceiptsAll(param){
                  var lrc = Ladda.create( document.querySelector( '.ladda-button3' ) );
                  lrc.start();
                  parType = 'all'
                  if (greatGrandFather.cadena) {
                    var params = {
                          tipo: parType,
                          order: order,
                          asc: asc,
                          cadena: greatGrandFather.cadena,
                          serie : greatGrandFather.serie ? greatGrandFather.serie : null,
                        }
                  }else{
                    var params = {
                          tipo: parType,
                          order: order,
                          asc: asc,
                          serie : greatGrandFather.serie ? greatGrandFather.serie : null,
                          cadena: greatGrandFather.cadena ? greatGrandFather.cadena : null
                        }
                  }
                  greatGrandFather.show_cobranza = false
                  if (param == 2){
                    var excel_receipt_all  = 'service_reporte-recibosDash-excel';
                     $http({
                        method: 'GET',
                        url: url.IP + excel_receipt_all,
                        params: params,
                        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                        responseType: "arraybuffer"
                      })
                      .then(
                        function success(response) {
                          if(response.status === 200 || response.status === 201) {
                            lrc.stop();
                            var blob = new Blob([response.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                            saveAs(blob, 'Reporte_Cobranza.xls');
                          }else{
                            lrc.stop();
                          }
                    });
                  }
                }
                function exportDataReceipts(param){
                  var lrc = Ladda.create( document.querySelector( '.ladda-button3' ) );
                  lrc.start();
                  greatGrandFather.show_cobranza = false
                  if (greatGrandFather.cadena) {
                    var params = {
                          tipo: parType,
                          order: order,
                          asc: asc,
                          cadena: greatGrandFather.cadena,
                          serie : greatGrandFather.serie ? greatGrandFather.serie : null,
                        }
                  }else{
                    var params = {
                          tipo: parType,
                          order: order,
                          asc: asc,
                          serie : greatGrandFather.serie ? greatGrandFather.serie : null,
                          cadena: greatGrandFather.cadena ? greatGrandFather.cadena : null
                        }
                  }
                  if (param == 2){
                    var excel_receipt  = 'service_reporte-recibosDash-excel';
                    $http({
                        method: 'GET',
                        url: url.IP + excel_receipt,
                        params:params,
                        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                        responseType: "arraybuffer"
                      })
                      .then(
                        function success(response) {
                          if(response.status === 200 || response.status === 201) {
                            lrc.stop()
                            var blob = new Blob([response.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                            saveAs(blob, 'Reporte_Cobranza.xls');
                          }else{
                            lrc.stop()
                          }
                    });
                  }
                  if (param == 5){
                    $http({
                        method: 'GET',
                        url: url.IP + 'excel-graficas-notas/',
                        params:{
                          polizaId: scope.polizaId.polizaId,
                          order : order,
                          asc : asc
                        }
                      })
                      .then(
                        function success(response) {
                          if(response.status === 200 || response.status === 201) {
                            exportFactory.excel(response.data, 'Notas_Crédito');

                        }
                    });
                  }
              }
                break;
              case 'renewals':
                if(parType == 'green'){
                  var titleID = 1;
                  var title = "En tiempo"
                }else if(parType == 'yellow'){
                  var titleID = 2;
                  var title = "Se acerca su vencimiento"//"Fuera de tiempo2"
                }else if(parType == 'orange'){
                  var titleID = 3;
                  var title = "Con atraso importante"
                }else if(parType == 'red'){
                  var titleID = 4;
                  var title = "Polizas vencidas"
                }
                httpCall('graficas-renovaciones/', parType, titleID, title, order, asc)
                greatGrandFather.exportDataRenewal = exportDataRenewal;
                function exportDataRenewal(param){
                  var lr = Ladda.create( document.querySelector( '.ladda-button2' ) );
                  lr.start();
                  if (greatGrandFather.cadena) {
                    var params = {
                          tipo: parType,
                          order: order,
                          asc: asc,
                          cadena: greatGrandFather.cadena,
                        }
                  }else{
                    var params = {
                          tipo: parType,
                          order: order,
                          asc: asc,
                        }
                  }
                  if (param == 3){
                    var excel_renewal = 'service_reporte-renovacionesDash-excel';
                    $http({
                        method: 'GET',
                        url: url.IP + excel_renewal,
                        params: params,
                        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                        responseType: "arraybuffer"
                      })
                      .then(
                        function success(data) {
                          if(data.status == 200){
                            lr.stop();
                            var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                            saveAs(blob, 'Reporte_Renovaciones_Dash.xls');
                          } else {
                            lr.start();
                            SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
                          }
                    });
                  }
              }
                break;
              case 'sinister':
                if(parType == 'green'){
                    var titleID = 1;
                    var title = "En tiempo"
                  }else if(parType == 'yellow'){
                    var titleID = 2;
                    var title = "Se acerca su vencimiento"//"Fuera de tiempo3"
                  }else if(parType == 'orange'){
                    var titleID = 3;
                    var title = "Con atraso importante"
                  }else if(parType == 'red'){
                    var titleID = 4;
                    var title = "Atención urgente"
                  }
                httpCall('graficas-siniestros/', parType, titleID, title, order, asc)
                greatGrandFather.exportDataSinister = exportDataSinister;
                function exportDataSinister(param){
                  var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                  l.start();
                  if (greatGrandFather.cadena) {
                    var params = {
                          order : order,
                          asc : asc,
                          tipo : parType,
                          cadena: greatGrandFather.cadena,
                        }
                  }else{
                    var params = {
                          order : order,
                          asc : asc,
                          tipo : parType,
                        }
                  }
                  if (param == 4){
                    var excel_sinister = 'service_reporte-siniestrosDash-excel';
                    $http({
                        method: 'GET',
                        url: url.IP + excel_sinister,
                        params:params,
                        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                        responseType: "arraybuffer"
                      })
                      .then(
                        function success(data) {
                          if(data.status == 200){
                            l.stop();
                            var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                            saveAs(blob, 'Reporte_Siniestros_Dash.xls');
                          } else {
                            l.stop();
                            SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
                          }
                    });
                  }else{
                    l.stop();
                  }
              }
              default:

            }

          }
        }
      }
    }]
);
