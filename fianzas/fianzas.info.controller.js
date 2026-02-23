(function() {
    'use strict';

    angular.module('inspinia')
        .controller('FianzasInfoCtrl', FianzasInfoCtrl);

    FianzasInfoCtrl.$inject = ['$rootScope','datesFactory','toaster','$q','url', 'dataFactory', '$stateParams', '$scope', '$http', 'FileUploader', 'SweetAlert', '$sessionStorage', '$uibModal','$state','statusReceiptsFactory','$localStorage','emailService', 'appStates', 'exportFactory'];

    function FianzasInfoCtrl($rootScope, datesFactory, toaster, $q, url, dataFactory, $stateParams, $scope, $http, FileUploader, SweetAlert, $sessionStorage, $uibModal, $state, statusReceiptsFactory,$localStorage,emailService, appStates, exportFactory) {
      var vm = this;

      /* Información de usuario */
      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
      var usr = JSON.parse(decryptedUser);
      var token = JSON.parse(decryptedToken);

      vm.getLog = getLog;
      vm.createRecordatorio = createRecordatorio;
      vm.showRecordatorios = showRecordatorios;
      vm.deleteFile = deleteFile;
      vm.viewContractor = viewContractor;

        /* Variables */
      vm.table = {
          headers: [
            'Serie',
            'Prima primera',
            'Derecho',
            'Gastos',
            'Iva',
            'Prima Total',
            'Estatus',
            'Acciones',
            'Vigencia'
          ]
      };

      vm.isCollapsed = false;

      // Function to toggle the collapse state
      vm.toggleCollapse = function() {
        vm.isCollapsed = !vm.isCollapsed;
      };
      // function showEndorsements(insurance) {

      $scope.showEndorsements = function(insurance){
        vm.infoFlag = false;
        vm.endoFlag = true;

        $http({
          method: 'GET',
          url: url.IP + 'view-endosos',
          params: {
            policy: insurance.id
          }
        }).then(function success(response) {
          $scope.endososFianza = response.data.endosos;
        })
      }
      $scope.concept = function(parConcept){
        switch(parConcept){
          case 34: 
            return 'CAMBIOS EN EL BENEFICIARIO';
            break;
          case 53: 
            return 'DETALLE DE GARANTÍA';
            break;
          case 54: 
            return 'PRORROGA DE VIGENCIA';
            break;
          case 55: 
            return 'ANUENCIA';
            break;
          case 58: 
            return 'AUMENTO';
            break;
          case 59: 
            return 'DISMINUCIÓN';
            break;
          case 60: 
            return 'ANULACIÓN';
            break;
          case 61: 
            return 'CANCELACIÓN';
            break;
          case 58: 
            return 'AUMENTO';
            break;
          case 24: 
            return 'ALTA DE CERTIFICADOS';
            break;
          case 25: 
            return 'BAJA DE CERTIFICADOS';
            break;
          case 56: 
            return 'CORRECCIÓN DE CERTIFICADOS';
            break;
          case 4: 
            return 'ENDOSOS TEXTO/OTRO';
            break;
          default: 
            return 'OTRO';
        }
      };
      $scope.monthEmision = function(parConcept){
        switch(parConcept){
          case 0: 
            return '';
            break;
          case 1: 
            return 'Enero';
            break;
          case 2: 
            return 'Febrero';
            break;
          case 3: 
            return 'Marzo';
            break;
          case 4: 
            return 'Abril';
            break;
          case 5: 
            return 'Mayo';
            break;
          case 6: 
            return 'Junio';
            break;
          case 7: 
            return 'Julio';
            break;
          case 8: 
            return 'Agosto';
            break;
          case 9: 
            return 'Septiembre';
            break;
          case 10: 
            return 'Octubre';
            break;
          case 11: 
            return 'Noviembre';
            break;
          case 12: 
            return 'Diciembre';
            break;
          default: 
            return '';
        }
      };
      vm.accesos = $sessionStorage.permisos
      if (vm.accesos) {
        vm.accesos.forEach(function(perm){
          if(perm.model_name == 'Fianzas'){
            vm.acceso_fianzas = perm
            vm.acceso_fianzas.permissions.forEach(function(acc){
              if (acc.permission_name == 'Administrar fianzas') {
                if (acc.checked == true) {
                  vm.acceso_adm_fia = true
                }else{
                  vm.acceso_adm_fia = false
                }
              }else if (acc.permission_name == 'Ver fianzas') {
                if (acc.checked == true) {
                  vm.acceso_ver_fia = true
                }else{
                  vm.acceso_ver_fia = false
                }
              }else if (acc.permission_name == 'Cancelar fianzas') {
                if (acc.checked == true) {
                  vm.acceso_canc_fia = true
                }else{
                  vm.acceso_canc_fia = false
                }
              }else if (acc.permission_name == 'Eliminar fianzas') {
                if (acc.checked == true) {
                  vm.acceso_elim_fia = true
                }else{
                  vm.acceso_elim_fia = false
                }
              }
            })
          }
          if(perm.model_name == 'Endosos'){
            $scope.acceso_endosos = perm
            $scope.acceso_endosos.permissions.forEach(function(acc){
              if (acc.permission_name ==  'Registrar endosos') {
                if (acc.checked == true) {
                  $scope.acceso_adm_end = true
                }else{
                  $scope.acceso_adm_end = false
                }
              }
            })
          }
          if (perm.model_name == 'Reportes') {
            vm.acceso_reportes = perm;
            vm.acceso_reportes.permissions.forEach(function(acc) {
              if (acc.permission_name == 'Reporte fianzas') {
                if (acc.checked == true) {
                  vm.acceso_rep_fia = true
                }else{
                  vm.acceso_rep_fia = false
                }
              }else if (acc.permission_name == 'Reporte Siniestros') {
                if (acc.checked == true) {
                  vm.acceso_rep_sin = true
                }else{
                  vm.acceso_rep_sin = false
                }
              }else if (acc.permission_name == 'Reporte Endosos') {
                if (acc.checked == true) {
                  vm.acceso_rep_end = true
                }else{
                  vm.acceso_rep_end = false
                }
              }else if (acc.permission_name == 'Reporte pólizas') {
                if (acc.checked == true) {
                  vm.acceso_rep_pol = true
                }else{
                  vm.acceso_rep_pol = false
                }
              }else if (acc.permission_name == 'Reporte renovaciones') {
                if (acc.checked == true) {
                  vm.acceso_rep_ren = true
                }else{
                  vm.acceso_rep_ren = false
                }
              }else if (acc.permission_name == 'Reporte cobranza') {
                if (acc.checked == true) {
                  vm.acceso_rep_cob = true
                }else{
                  vm.acceso_rep_cob = false
                }
              }
            })
          }else if(perm.model_name == 'Ordenes de trabajo'){
            vm.acceso_ot = perm
            vm.acceso_ot.permissions.forEach(function(acc){
              if (acc.permission_name == 'Administrar OTs') {
                if (acc.checked == true) {
                  vm.acceso_adm_ot = true
                }else{
                  vm.acceso_adm_ot = false
                }
              }else if (acc.permission_name == 'Ver OTs') {
                if (acc.checked == true) {
                  vm.acceso_ver_ot = true
                }else{
                  vm.acceso_ver_ot = false
                }
              }else if (acc.permission_name == 'Cancelar OTs') {
                if (acc.checked == true) {
                  vm.acceso_canc_ot = true
                }else{
                  vm.acceso_canc_ot = false
                }
              }else if (acc.permission_name == 'Eliminar OTs') {
                if (acc.checked == true) {
                  vm.acceso_elim_ot = true
                }else{
                  vm.acceso_elim_ot = false
                }
              }
            })
          }
          if (perm.model_name == 'Contratantes y grupos') {
            vm.acceso_contg = perm;
            vm.acceso_contg.permissions.forEach(function(acc) {
              if (acc.permission_name == 'Administrar contratantes y grupos') {
                if (acc.checked == true) {
                  vm.acceso_adm_cont = true
                }else{
                  vm.acceso_adm_cont = false
                }
              }else if (acc.permission_name == 'Ver contratantes y grupos') {
                if (acc.checked == true) {
                  vm.acceso_ver_cont = true
                }else{
                  vm.acceso_ver_cont = false
                }
              }
            })
          }
          if(perm.model_name == 'Comisiones'){
            vm.acceso_dash = perm
            vm.acceso_dash.permissions.forEach(function(acc){
              if (acc.permission_name == 'Comisiones') {
                if (acc.checked == true) {
                  vm.permiso_comisiones = true
                }else{
                  vm.permiso_comisiones = false
                }
              }
            })
          }
          if(perm.model_name == 'Archivos'){
            vm.acceso_files = perm
            vm.acceso_files.permissions.forEach(function(acc){
              if (acc.permission_name == 'Administrar archivos sensibles') {
                if (acc.checked == true) {
                  vm.permiso_archivos = true
                }else{
                  vm.permiso_archivos = false
                }
              }// Administrar adjuntos //no agregar, no eliminar, no renombrar, no marcar sensible
              if (acc.permission_name == 'Administrar adjuntos') {
                if (acc.checked == true) {
                  vm.permiso_administrar_adjuntos = true
                }else{
                  vm.permiso_administrar_adjuntos = false
                }
              }
            })
          }
          if(perm.model_name == 'Cobranza'){
            vm.acceso_cobranza = perm
            vm.acceso_cobranza.permissions.forEach(function(acc){
              if (acc.permission_name == 'Eliminar recibos') {
                if (acc.checked == true) {
                  vm.permiso_delete_cobranza = true
                }else{
                  vm.permiso_delete_cobranza = false
                }
              }
              if (acc.permission_name == 'No permitir editar recibos Pagados/Liquidados') {
                if (acc.checked == true) {
                  vm.acceso_pl_cob = true //no se editan
                }else{
                  vm.acceso_pl_cob = false//se pueden editar pagados-liquidados
                }
              }
            })
          }
          if (perm.model_name == 'Correos electronicos') {
            vm.acceso_correo = perm;
            vm.acceso_correo.permissions.forEach(function(acc) {
              if (acc.permission_name == 'Correos') {
                if (acc.checked == true) {
                  vm.permiso_correo = true
                }else{
                  vm.permiso_correo = false
                }
              }
            })
          }
          if(perm.model_name == 'Referenciadores'){
            vm.acceso_ref = perm
            vm.acceso_ref.permissions.forEach(function(acc){
              if (acc.permission_name == 'Ver referenciadores') {
                if (acc.checked == true) {
                  vm.acceso_ver_ref = true
                }else{
                  vm.acceso_ver_ref = false
                }
              }
            })
          }

        })
      }
      $scope.changeSensible = function(sensible, index) {
          uploader.queue[index].formData[0].sensible = sensible;
      }
      function deleteFile (file, container) {
        SweetAlert.swal({
            title: '¿Está seguro?',
            text: "No será posible recuperar este archivo.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si, estoy seguro.",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                // deleteIT(url, file.id)
                var urls = file.url;
                if(urls == undefined){
                  urls = url.IP+'fianzas-cancel/'+file.id+'/archivos/'
                }
                $http.delete(urls)
                    .then(function(response) {
                        container.splice(container.indexOf(file), 1);
                        SweetAlert.swal("¡Eliminado!", "El archivo fue eliminado.", "success");
                    });
            }
        });

      }
      $scope.saveFile = function(file) {
        var urls = file.url;
        if(urls == undefined){
          urls = url.IP+'fianzas-cancel/'+file.owner+'/archivos/'+file.id
        }
        $http.patch(urls,{'nombre':file.nombre, 'sensible':file.sensible});
      }


      /* Funciones */
      vm.changeStatusModal = changeStatusModal;
      vm.cancelFianza = cancelFianza;
      vm.anularFianza = anularFianza;
      vm.rehabilitarFianza = rehabilitarFianza;
      vm.reexpedicion = reexpedicion;
      vm.renovacion = renovacion;
      vm.crearEndoso = crearEndoso;
      vm.deleteFianza = deleteFianza;
      vm.showBinnacleReceipt = showBinnacleReceipt;
      vm.showBinnacleReceiptEndorsement = showBinnacleReceiptEndorsement;
      
      vm.returnToReceipts = returnToReceipts;
      vm.returnToReceiptsEnd = returnToReceiptsEnd;
      vm.changeEndorsement = changeEndorsement;
      vm.saveAsInsurance = saveAsInsurance;
      vm.checkStatusReceipts = checkStatusReceipts;
      vm.showChange = showChange;
      vm.cancelPolicy = cancelPolicy;
      vm.recordatoriosFlag = false;
      /* Uploader files */
        var uploader = $scope.uploader = new FileUploader({
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            },
        });

        // uploader.filters.push({
        //     name: 'customFilter',
        //     fn: function(item, options) {
        //         return this.queue.length < 20;
        //     }
        // });

        function showBinnacleReceipt(param) {
          $http({
            method: 'GET',
            url: url.IP+'comments/',
            params: {
              'model': 4,
            'id_model': param.id
            }
          })
          .then(function(request) {

            vm.comments_data_receipt = request.data.results;
            vm.comments_config_receipt = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            }
          })
          .catch(function(e) {
            console.log('e', e);
          });
          vm.receipt_id = param.id;
          vm.show_binnacle_receipt = true;

        };

        function viewContractor(name, route) {
          $scope.name_for_new_tab = name;
          $scope.route_for_new_tab = route;

          var existe = false;
          if (name && route){
            $scope.route_for_new_tab = route;
            $scope.name_for_new_tab = name;
            appStates.states.forEach(function(state) {
              if (state.route == $scope.route_for_new_tab){
                existe = true;
              }
            });
          }

          if (!existe){
            var active_tab = appStates.states.findIndex(function(item){
              if (item.active){
                return true
              }
              return false;
            });
            
            appStates.states[active_tab] = { 
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab),
            }
          }
          $localStorage.tab_states = appStates.states;

          $stateParams.contractor = $scope.contratante
          if($scope.contratante.type_person == 'Física'){
            $state.go($scope.route_for_new_tab, {
                type: 'fisicas',
                contratanteId: vm.insurance.contractor.id,
                contractor:$scope.contratante
            });
          } else if($scope.contratante.type_person == 'Moral'){
            $state.go($scope.route_for_new_tab, {
                type: 'morales',
                contratanteId: vm.insurance.contractor.id,
                contractor:$scope.contratante
            });
          }
        }

        function showBinnacleReceiptEndorsement(param) {
          $http({
            method: 'GET',
            url: url.IP+'comments/',
            params: {
              'model': 4,
            'id_model': param.id
            }
          })
          .then(function(request) {

            vm.comments_data_receipt_endoso = request.data.results;
            vm.comments_config_endoso = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            }
          })
          .catch(function(e) {
            console.log('e', e);
          });
          vm.receipt_id = param.id;
          vm.show_binnacle_receipt_end = true;

        };

        function createRecordatorio(registroSelected, tipo) {
          var insurance = registroSelected
          var modalInstance = $uibModal.open({
            templateUrl: 'app/recordatorios/desde-registro/desderegistro.modal.html',
            controller: 'RecordatorioRegistroCtrl',
            size: 'lg',
            resolve: {
              poliza: function() {
                return registroSelected;
              },
              tipoRegistro: function() {
                return tipo;
              },
              from: function(){
                return null;
              },
              parent: function(){
                return vm.insurance;
              }
            },
          backdrop: 'static', /* this prevent user interaction with the background */
          keyboard: false
          });
        }
        $scope.goToRecordatorio = function (rec) {
          if (rec.recordatorio) {
            $scope.name_for_new_tab = 'Recordatorio desde registro';
            $scope.route_for_new_tab = 'recordatorios.desde_registro_show';
            var params = {id: rec.recordatorio.id}
          }
          var existe = false;
          if (name && route){
            $scope.route_for_new_tab = route;
            $scope.name_for_new_tab = name;
            appStates.states.forEach(function(state) {
              if (state.route == $scope.route_for_new_tab){
                existe = true;
              }
            });
          }

          if (!existe){
            var active_tab = appStates.states.findIndex(function(item){
              if (item.active){
                return true
              }
              return false;
            });
            
            appStates.states[active_tab] = { 
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab,params),
            }
          }
          $localStorage.tab_states = appStates.states;
          $state.go($scope.route_for_new_tab, params); 
        }        
        function showRecordatorios() {
          vm.recordatoriosFlag = true;
        }
        function getLog() {
          dataFactory.get('get-specific-log', {'model': 13, 'associated_id': vm.insurance.id})
          .then(function success(response) {
            var modalInstance = $uibModal.open({ //jshint ignore:line
              templateUrl: 'app/cobranzas/log.modal.html',
              controller: 'LogCtrl',
              size: 'lg',
              resolve: {
                log: function() {
                  return response.data;
                }
              },
              backdrop: 'static', /* this prevent user interaction with the background */
              keyboard: false
            });
            modalInstance.result.then(function(receipt) {
              vm.receipts.splice(index, 1);
              activate();
            });
          })
        };

        function returnToReceipts() {
          vm.show_binnacle_receipt = false;
        }

        function returnToReceiptsEnd() {
          vm.show_binnacle_receipt_end = false;
        }

        activate();

        $scope.status = function (parValue) {
        switch (parValue) {
          case 1:
            return 'En trámite';
            break;
          case 2:
            return 'OT Cancelada';
            break;
          case 17:
            return 'Anulada';
            break;
          case 24:
            return 'Pre-anulada';
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
          case 14:
            return 'Vigente';
            break;
          case 13:
            return 'Vencida';
            break;
          case 15:
            return 'No Renovada';
            break;
          case 0:
            return 'Eliminada';
            break;
          default:
            return 'Vigente';
        }
      }

      function showChange(endoso) {
        var modalInstance = $uibModal.open({ //jshint ignore:line
          templateUrl: 'app/cobranzas/infoChange.modal.html',
          controller: 'InfoChangeCtrl',
          size: 'lg',
          resolve: {
            endoso: function() {
              return endoso;
            }
          },
            backdrop: 'static', /* this prevent user interaction with the background */
            keyboard: false
        });
      }


      function activate() {
        vm.infoFlag = true;
        vm.endorsement_receipts_show = [];
        dataFactory.get('leer-fianzas-info/' + $stateParams.polizaId)
        .then(function success(response) {
          if(response.status == 200){
            $http({
              method: 'GET',
              url: url.IP + 'view-endosos',
              params: {
                policy: response.data.id
              }
            })
            .then(function success(response_endosos) {
              $scope.endososFianza = response_endosos.data.endosos;
              $scope.endososFianza.forEach(function(endoso) {
                endoso.endorsement_receipt.forEach(function(recibo) {
                  if(vm.endorsement_receipts_show.indexOf(recibo)== -1){
                    vm.endorsement_receipts_show.push(recibo);
                  }
                });
              });
            })
            .catch(function(e){
              console.log('error', e);
            });
            vm.insurance = response.data;
            $scope.getComments();
            if(vm.insurance.recibos_fianza){
                vm.insurance.recibos_fianza.forEach(function(r_f, index) {
                    if(r_f.status == 1){
                        r_f.status = "Pagado"
                    }else if (r_f.status == 2){
                        vm.insurance.recibos_fianza[index].status = "Cancelado"
                    }else if (r_f.status == 3){
                        vm.insurance.recibos_fianza[index].status = "Prorrogado"
                    }else if (r_f.status == 4){
                        vm.insurance.recibos_fianza[index].status = "Pendiente de pago"
                    }else if (r_f.status == 5){
                        vm.insurance.recibos_fianza[index].status = "Liquidado"
                    }else if (r_f.status == 6){
                        vm.insurance.recibos_fianza[index].status = "Conciliado"
                    }else if (r_f.status == 7){
                        vm.insurance.recibos_fianza[index].status = "Cerrado"
                    }else if (r_f.status == 0){
                        vm.insurance.recibos_fianza[index].status = "Desactivado"
                    }else if (r_f.status == 8){
                        vm.insurance.recibos_fianza[index].status = "Precancelado"
                    }else if (r_f.status == 9){
                        vm.insurance.recibos_fianza[index].status = "Pago parcial"
                    }
              });
            }

            // if(vm.insurance.natural){
            //  $scope.contratante = vm.insurance.natural;
            // } else {
            //   $scope.contratante = vm.insurance.juridical;
            // }
            $scope.contratante = vm.insurance.contractor;

            if(vm.insurance.address){
              $http.get(vm.insurance.address)
              .then(function success(response) {
                $scope.addressContratante = response.data;
              })
            }

            if(vm.insurance.programa_de_proveedores_contractor){
              if(vm.insurance.programa_de_proveedores_contractor){
                $scope.url_programa = vm.insurance.programa_de_proveedores_contractor;
              }
              $http.get($scope.url_programa)
              .then(function(request) {
                $scope.programa = angular.copy(request.data)
              });
            }

            $scope.contrato = vm.insurance.contract_poliza;

            vm.receipts = []
            for(var i=0 ; i<vm.insurance.recibos_poliza.length;i++){
              for(var j=0 ; j<vm.insurance.recibos_poliza.length;j++){
                if(i+1 == vm.insurance.recibos_poliza[j].recibo_numero){
                  if(vm.insurance.recibos_poliza[j].receipt_type == 2) {
                    $scope.show_endosos_receipt = true;
                  }

                  vm.receipts.push(vm.insurance.recibos_poliza[j]);
                }
              }
            }

            if (vm.insurance.recibos_poliza) {
              vm.policy_receipts_show = [];
              

              vm.insurance.recibos_poliza.forEach(function(receipt) {
                if(receipt.status == 0 || receipt.status == '0' || receipt.status == 'Desactivado'){
                  return;
                }
                if(receipt.receipt_type == 1){
                  vm.policy_receipts_show.push(receipt);
                }
                // else{
                //   if(receipt.receipt_type == 2){
                //     vm.endoso_receipts_show.push(receipt);
                //   }
                //   else{
                //     vm.notes_receipts_show.push(receipt);
                //   }
                //     function findCoincidences(argument) {
                //       return argument === receipt.endo_aux;
                //     }
                //     if(!vm.endosos_options.find(findCoincidences)){
                //       $http.get(receipt.url).then(function success(data) {
                //         receipt = data.data;
                //         vm.endorsement_receipts_show.push(receipt);
                //         vm.endorsement_receipts_show_bak.push(receipt);
                //         if(vm.endosos_options.length == 0){
                //           vm.endosos_options.push(receipt.endo_aux);
                //         }
                //         else{
                //           if(vm.endosos_options.indexOf(receipt.endo_aux) == -1){
                //             vm.endosos_options.push(receipt.endo_aux);
                //           }
                //         }
                //       })
                //     }
                // }
              });
            }

            var params = {
                actual_id: vm.insurance.id
            }
            dataFactory.get('historic-policies/',params)
            .then(function success(response) {
              if(response.data.results.length){
                vm.showHistoric = true;
              }
              vm.fianza_history = [];
              response.data.results.forEach(function function_name(old) {
                if(vm.insurance.id != old.base_policy.id){
                  vm.fianza_history.push(old.base_policy);
                } else {
                  vm.fianza_history.push(old.new_policy);
                }
              });

            })
            $http({
              method: 'GET',
              url: url.IP+'comments/',
              params: {
                'model': 13,
              'id_model': vm.insurance.id
              }
            })
            .then(function(request) {

              vm.comments_data = request.data.results;
              vm.comments_config = {
                count: request.data.count,
                previous: request.data.previous,
                next: request.data.next
              }
            })
            .catch(function(e) {
              console.log('e', e);
            });
            vm.insurance.id = vm.insurance.id;
            vm.show_binnacle = true;

            dataFactory.get('polizas/' + response.data.id + '/archivos/').then(function success(response) {
                $scope.files = response.data.results;
            })

            dataFactory.get('fianzas-cancel/' + response.data.id + '/archivos/').then(function success(response) {
                $scope.filesCancel = response.data.results;
            })
            $scope.getFilesFianza(vm.insurance);
          }
        })
      }

      $scope.openModal = function(task) {
        var modalInstance = $uibModal.open({
          templateUrl: 'app/tasks/task.modal.html',
          controller: 'TareasModalCtrl',
          size: 'lg',
          resolve: {
          task: function() {
            return task;
          },
          data: function() {
            return null;
          },
          associated: function() {
            return null;
          },
          receipt: function() {
            return null;
          },
          route: function() {
            return null;
          },
          modelo: function() {
            return null;
          }
        }
      });
      modalInstance.result
        .then(function (response) {
          activate()
        }, function () {
        console.info('modal closed');
      });
      }
      $scope.getComments = function(){
        $http({
          method: 'GET',
          url: url.IP + 'comments/',
          params: {
            'model': 13,
            'id_model': vm.insurance.id
          }
        })
        .then(function(response){
          $scope.comments_data = response.data.results;
          $scope.comments_config = {
              count: response.data.count,
              next: response.data.next,
              previous: response.data.previous
          };
        })
        .catch(function(e){
          console.log('e', e);
        });
      };

      function exportFianzaComments() {
        if (!vm.insurance || !vm.insurance.id || vm.commentsExportLoading) {
          return;
        }
        vm.commentsExportLoading = true;

        var resetLoading = function() {
          vm.commentsExportLoading = false;
        };

        var params = {
          model: 13,
          id_model: vm.insurance.id
        };
        if (vm.org_name) {
          params.org = vm.org_name;
        }

        toaster.info('Generando...', 'El archivo se está generando, espera un momento.');

        
        exportFactory.commentsExport({
          params: params,
          downloadName: 'bitacora-fianzas.xlsx',
          token: token
        })
        .then(function() {
          SweetAlert.swal({
              title: 'Listo',
              icon: 'success',
              text: 'La bitacora se descargo exitosamente',
              timer: 5000
            });
        })
        .catch(function(error) {
          console.error('Error exportando comentarios', error);
          SweetAlert.swal('Error', 'No se pudo exportar los comentarios. Intenta nuevamente.', 'error');
        })
        .finally(function() {
          resetLoading();
        });
      }

      $scope.getFilesFianza = function(val){
        dataFactory.get('polizas/' + val.id + '/archivos/').then(function success(response) {
            $scope.files = response.data.results;
        })

        dataFactory.get('fianzas-cancel/' + val.id + '/archivos/').then(function success(response) {
            $scope.filesCancel = response.data.results;
        })
      };

      function checkStatusReceipts (parStatus) {
        return statusReceiptsFactory.receipts(parStatus);
      };

      function changeEndorsement(endorsement) {
        if(endorsement){
          vm.endorsement_receipts_show = []
          vm.endorsement_receipts_show_bak.forEach(function(child) {
            if(child.endo_aux == endorsement){
              vm.endorsement_receipts_show.push(child);
            }
          })
        } else {
          vm.endorsement_receipts_show = vm.endorsement_receipts_show_bak;
        }
      }
      $scope.goToEndorsementInfo = function(endorsement){
        // ui-sref="endorsement.details({endosoId: endorsement.id})"
        $scope.open_in_same_tab('Información Endoso', 'endorsement.details',{endosoId: endorsement.id}, endorsement.id , null);

      }

      function cancelPolicy(suret){
        $rootScope.suretyInfo = suret;
        var modalInstance = $uibModal.open({
          templateUrl: 'app/fianzas/cancel.fianzas.html',
          controller: FianzaCancelModalCtrl,
          controllerAs: 'vmm',
          size: 'md',
          resolve: {
            suretyInfo: function(){
              return suret;
            },
            endosos: function(){
              return $scope.endososFianza;
            }
          },
          backdrop: 'static',
          keyboard: false
        });
        // SweetAlert.swal({
        //   title: "Cancelar",
        //   text: "Se cancelará la fianza, ¿Está seguro?",
        //   type: "warning",
        //   showCancelButton: true,
        //   confirmButtonColor: "#DD6B55",
        //   confirmButtonText: "¡Si!",
        //   cancelButtonText: "No",
        //   closeOnConfirm: true,
        //   closeOnCancel: false
        // },
        // function(isConfirm){
        //   if (isConfirm) {
        //     $http.patch(vm.insurance.url,{'status':11})
        //     .then(function(response){
        //       if(response.status == 200 || response.status == 201){
        //         var paramsE = {
        //           'model': 13,
        //           'event': "PATCH",
        //           'associated_id': vm.insurance.id,
        //           'identifier': " canceló la fianza."
        //         }
        //         dataFactory.post('send-log', paramsE);
        //         activate();
        //       }
        //     })
        //     .catch(function(e){
        //       console.log('e', e);
        //     });
        //   }
        // });
      }

      function FianzaCancelModalCtrl(url, $http, $rootScope, suretyInfo, $scope, $uibModalInstance, datesFactory,endosos){
        var vmm = this;
        vmm.surety = {
          fecha_cancelacion: datesFactory.convertDate(new Date()),
          monto_cancelacion: 0,
          status: 11
        }
        console.log('---e',endosos)
        $scope.cancelSurety = function(){
          vmm.surety.fecha_cancelacion = datesFactory.toDate(vmm.surety.fecha_cancelacion);
          $http.patch(suretyInfo.url, vmm.surety)
          .then(function(data) {
            if(endosos){
              endosos.forEach(function(end) {
                if(end.status ==2){
                  $http.patch(end.url,{status:4})
                  .then(function(dataend) {
                    console.log('patch endo reg to cancel',dataend)
                  })
                }
              })
            }
            var paramsE = {
              'model': 13,
              'event': "PATCH",
              'associated_id': suretyInfo.id,
              'identifier': " canceló la fianza."
            }
            dataFactory.post('send-log', paramsE);
            activate();
            $uibModalInstance.dismiss('cancel');
            swal("¡Listo!", "Se ha cancelado definitivamente la Fianza", "success");
          });
        }


        $scope.close = function(){
          $uibModalInstance.dismiss('cancel');
        };
      }

        // ALERTA SUCCES UPLOADFILES
      uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $scope.okFile++;
        if($scope.okFile == $scope.uploader.queue.length){
          $timeout(function() {
            if($scope.param == 'poliza'){
              SweetAlert.swal('Listo','Fianza Actualizada', "", "success");
            }
            if($scope.param == 'ot'){
              SweetAlert.swal("¡Listo!",'Proyecto de Fianza Actualizada', "success");
            }
            $state.go('fianzas.info', {polizaId: polizaId})
          }, 1000);
        }
      };

      // ALERTA ERROR UPLOADFILES
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        if(response.status == 413){
          SweetAlert.swal("ERROR", MESSAGES.ERROR.FILETOOLARGE, "error");
          order.options.checkDate('initial');
        } else {
          SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
          order.options.checkDate('initial');
        }
      };

      uploader.onAfterAddingFile = function(fileItem) {
        $scope.specialchar = []
        var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-="
        var specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

        var str = fileItem.file.name;   
        for(i = 0; i < specialChars.length;i++){ 
          if(str.indexOf(specialChars[i]) > -1){         
            if (specialChars[i] == " " || specialChars[i] == "_" || specialChars[i] == "~" || specialChars[i] == "%" || specialChars[i] == "=" || specialChars[i] == "-" || specialChars[i] == " " || specialChars[i] == "_" || specialChars[i] == "#" || specialChars[i] == "(" || specialChars[i] == ")" || specialChars[i] == ":" || specialChars[i] == '"') {
              str=str.replace(/-/g,"");
              fileItem.file.name = fileItem.file.name.replace(/-/g,"");
              str=str.replace(/ /g,"");
              fileItem.file.name = fileItem.file.name.replace(/ /g,"");
              str=str.replace(/_/g,"");
              fileItem.file.name = fileItem.file.name.replace(/_/g,"");
              str=str.replace(/#/g,"");
              fileItem.file.name = fileItem.file.name.replace(/#/g,"");
              str = str.split(')').join('');
              fileItem.file.name = fileItem.file.name.split(')').join('');
              str = str.split('(').join('');
              fileItem.file.name = fileItem.file.name.split('(').join('');
              str = str.split(':').join('');
              fileItem.file.name = fileItem.file.name.split(':').join('');
              str = str.split('"').join('');
              fileItem.file.name = fileItem.file.name.split('"').join('');
              str = str.split('+').join('');
              fileItem.file.name = fileItem.file.name.split('+').join('');
              str = str.split('$').join('');
              fileItem.file.name = fileItem.file.name.split('$').join('');
              str = str.split('#').join('');
              fileItem.file.name = fileItem.file.name.split('#').join('');
              str = str.split('$#').join('');
              fileItem.file.name = fileItem.file.name.split('$#').join('');
              str = str.split('~').join('');
              fileItem.file.name = fileItem.file.name.split('~').join('');
              str = str.split('%').join('');
              fileItem.file.name = fileItem.file.name.split('%').join('');
              str = str.split('=').join('');
              fileItem.file.name = fileItem.file.name.split('=').join('');
              str = str.split('_').join('');
              fileItem.file.name = fileItem.file.name.split('_').join('');
              str = str.split(" ").join("")
              fileItem.file.name = fileItem.file.name.split(' ').join('');
            }else{         
              $scope.specialchar.push(specialChars[i])  
            }
          } 
        }
        fileItem.file.name = fileItem.file.name.replace(/[&\/\\#^+()$~%'":*=_?<>{}!@]/g, '').replace(/ /g,'')
        fileItem.file.name = fileItem.file.name.trim()
        fileItem.formData.push({
          arch: fileItem._file,
          nombre: fileItem.file.name,
        });

        if(fileItem){
          $scope.countFile++;
        }
        if ($scope.specialchar.length > 0) {
          $scope.uploader.queue.splice($scope.uploader.queue.indexOf(fileItem),1)
          SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales, renombre y, vuelva a cargarlo. '+$scope.specialchar,'error') 
        }
      };
      uploader.onBeforeUploadItem = function(item) {
        if(item.file.sensible != undefined){
            item.formData[0].sensible = item.file.sensible;
          }
        item.url = $scope.userInfo.url;
        item.formData[0].nombre = item.file.name;
        item.alias = '';
        item.formData[0].owner = $scope.userInfo.id;        
      };


      $scope.saveFiles = function(poliza) {
        $q.all([uploadFiles(poliza)]).then(function() {
          toaster.success('Archivo cargado correctamente');
        });
      }

      function uploadFiles(polizaId) {
        $scope.userInfo = {
          id: polizaId
        };
        $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
        $scope.uploader.uploadAll();
      }

      function checkStatusReceipts (parStatus) {
        return statusReceiptsFactory.receipts(parStatus);
      };

      function changeStatusModal(receipt,fianza) {
        receipt.poliza = fianza.fianza_number;
        fianza.poliza =  fianza.fianza_number
        if(fianza.contractor){
            receipt.contratante = fianza.contractor;
        }else {
            receipt.contratante = '';
        }
        if(vm.insurance.document_type == 7 || vm.insurance.document_type == 8){
          fianza.document_type = vm.insurance.document_type;
        }
        var index = vm.insurance.recibos_poliza.indexOf(receipt);
        var modalInstance = $uibModal.open({ //jshint ignore:line
          templateUrl: 'app/cobranzas/cobranzas.modal.html',
          controller: 'CobranzasModal',
          size: 'lg',
          resolve: {
            receipt: function() {
              return receipt;
            },
              insurance: function() {
                return fianza;
              },
            from: function(){
              return null;
            },bono: function(){
              return null;
            }
          },
            backdrop: 'static', /* this prevent user interaction with the background */
            keyboard: false
        });
        modalInstance.result.then(function(receipt) {
          activate();
        });
      }

      //---guardar como poliza
      function saveAsInsurance(myInsurance) {
        var modalInstance = $uibModal.open({
            templateUrl: 'app/fianzas/otAsFianzaModal.html',
            controller: FianzaPendingModalCtrl,
            controllerAs: 'vmm',
            size: 'lg',
            resolve: {
              policyModal: function() {
                return vm.insurance;
              }
            },
          backdrop: 'static', /* this prevent user interaction with the background */
          keyboard: false
        });
        modalInstance.result.then(function(receipt) {
          activate();
        });
      }


      //------modal conversion
      function FianzaPendingModalCtrl(datesFactory, $localStorage, $scope, toaster, MESSAGES, policyModal, $uibModalInstance, dataFactory, SweetAlert, $state, insuranceService, receiptService, url, $http, $rootScope,emailService,helpers) {
        var vmm = this;
 
        vmm.form = {
          folio: '',
          comisiones: [],
          document_type: policyModal.document_type,
        };

        vmm.options = {
            save: save,
            cancel: cancel
        };
        vmm.policyInfo = policyModal;
        // 
        vmm.id_fianza=policyModal.id
        $scope.cansamenumberpolicy=false
        $http({
          method: 'GET',
          url: url.IP + 'historic-policies/',
          params: {
            actual_id: policyModal.id
          }
        }).then(function success(response) {
          if(response.data.results.length){
            vmm.showHistoric = true;
          }
          vmm.policy_history = [];
          vmm.policy_history.renovada = [];
          response.data.results.forEach(function (old) {
            if(old.new_policy.id ==vmm.id_fianza){
              $scope.cansamenumberpolicy=true
            }
            if(vmm.id_fianza != old.base_policy.id){
              vmm.policy_history.push(old.base_policy);
            } else {
              vmm.policy_history.push(old.new_policy);
            }
            if(vmm.id_fianza == old.base_policy.id){
              vmm.policy_history.renovada.push(old.base_policy);
            } 
          })
        })
        $scope.changeNoPoliza = function () {
          if(vmm.form.fianza && $scope.cansamenumberpolicy==false){
            helpers.existPolicyNumber(vmm.form.fianza)
            .then(function(request) {
              if(request == true) {
                SweetAlert.swal("Error", "El número de fianza ya existe.", "error");
                vmm.form.fianza = '';
              }
            })
            .catch(function(err) {

            });
          }
        };

        $scope.checkFechaFactura = function (date) {
          var date_initial = (date).split('/');
          var day = date_initial[0];
          var month = date_initial[1];
          var year = parseInt(date_initial[2]);
          vmm.form.month.month_selected = parseInt(month)
          vmm.form.year_factura = year
        };
        $scope.years=[]
        var actualYear = new Date().getFullYear();
        var oldYear = actualYear - 80;
        for (var i = actualYear + 10; i >= oldYear; i--) {
          $scope.years.push(i);
        }

        vmm.form.month={};
        vmm.form.month.month_selected = 1;
        vmm.form.month.options = [
            {'value':0,'label':''},
            {'value':1,'label':'Enero'},
            {'value':2,'label':'Febrero'},
            {'value':3,'label':'Marzo'},
            {'value':4,'label':'Abril'},
            {'value':5,'label':'Mayo'},
            {'value':6,'label':'Junio'},
            {'value':7,'label':'Julio'},
            {'value':8,'label':'Agosto'},
            {'value':9,'label':'Septiembre'},
            {'value':10,'label':'Octubre'},
            {'value':11,'label':'Noviembre'},
            {'value':12,'label':'Diciembre'},
        ]
        $http.get(url.IP+'claves-by-provider/' + vmm.policyInfo.aseguradora.id)
        .then(
          function success(clavesResponse) {
            clavesResponse.data.forEach(function(clave) {
              clave.clave_comision.forEach(function(item) {
                item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
                if(vmm.policyInfo.subramo == item.subramo) {
                  vmm.form.comisiones.push(item);
                }
              });
            });
          },
          function error (e) {
            console.log('Error - claves-by-provider', e);
          })
        .catch(function (error) {
            console.log('Error - claves-by-provider - catch', error);
        });

        vmm.form.startDate = convertDate(vmm.policyInfo.start_of_validity);
        vmm.form.emision_date = datesFactory.convertDate(new Date());
        vmm.form.endingDate = convertDate(vmm.policyInfo.end_of_validity);
        vmm.form.subramo = vmm.policyInfo.subramo;
        vmm.form.subramo = vmm.policyInfo.subramo;
        vmm.form.policy_days_duration = 365;

        function save(){
          var sd = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].startDate));
          var ed = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].endingDate));
          var psd = new Date(vmm.policyInfo.start_of_validity);
          var ped = new Date(vmm.policyInfo.end_of_validity);
          if (sd < psd || sd > ped ){
            toaster.error('La fecha de inicio del recibo esta fuera de la fecha de la fianza');
            return;
          }
          if (ed < psd || ed > ped ){
            toaster.error('La fecha de fin del recibo esta fuera de la fecha de la fianza');
            return;
          }
          vmm.form.emision_date = datesFactory.toDate(vmm.form.emision_date);
          $scope.dataFianza = {
            'folio': vmm.form.folio,
            'poliza_number': vmm.form.fianza,
            'status': 14,
            'p_neta': vmm.policyInfo.poliza.primaNeta,
            'rpf': vmm.policyInfo.poliza.rpf,
            'derecho': vmm.policyInfo.poliza.derecho,
            'iva': vmm.policyInfo.poliza.iva,
            'p_total': vmm.policyInfo.poliza.primaTotal,
            'comision': vmm.policyInfo.comision,
            'comision_percent': vmm.policyInfo.comision_percent,
            'emision_date' : vmm.form.emision_date,
            'fecha_cancelacion':vmm.policyInfo.fecha_cancelacion,
            'monto_cancelacion':vmm.policyInfo.monto_cancelacion,
            "date_emision_factura": vmm.form.date_emision_factura ? datesFactory.toDate(vmm.form.date_emision_factura ): null,
            "date_maquila": vmm.form.date_maquila ? datesFactory.toDate(vmm.form.date_maquila ): null,
            "year_factura": vmm.form.year_factura ? vmm.form.year_factura: 0,
            "month_factura": vmm.form.month ? vmm.form.month.month_selected : 0,
            "folio_factura": vmm.form.folio_factura ? vmm.form.folio_factura : '',
            "maquila": vmm.form.maquila ? parseFloat(vmm.form.maquila).toFixed(2) : 0,
            "exchange_rate": vmm.form.exchange_rate ? parseFloat(vmm.form.exchange_rate).toFixed(2) : 0,
          }

          $http.patch(vmm.policyInfo.url, $scope.dataFianza)
          .then(function(response) {
            if(response.status == 200){

              vmm.policyInfo.recibos_poliza.forEach(function(item) {
                item.fecha_inicio = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].startDate));
                item.fecha_fin = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].endingDate));
                item.vencimiento = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].vencimiento));

                item.poliza = response.data.url;

                dataFactory.post('recibos/', item)
                .then(function success(req) {

                }, function error(error) {
                  console.log(error);
                });
              });

              $state.go('fianzas.info', { polizaId: response.data.id });
              activate();
              vmm.options.cancel();
              SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWFIANZAOK, "success");
              // location.reload();
                
              var params = {
                'model': 13,
                'event': "POST",
                'associated_id': response.data.id,
                'identifier': "convirtió la OT en fianza."
              }
              dataFactory.post('send-log/', params).then(function success(response) {

              });
            }
          })
        }

        function cancel() {
          $uibModalInstance.dismiss('cancel');
        }

        function convertDate(inputFormat,indicator) {
          function pad(s) { return (s < 10) ? '0' + s : s; }
          var d = new Date(inputFormat);
          var date = inputFormat;
          if(inputFormat.length != 10){
            function pad(s) { return (s < 10) ? '0' + s : s; }
              var d = new Date(inputFormat);
              if(indicator){
                date = [pad(d.getDate()+1), pad(d.getMonth()+1), d.getFullYear()].join('/');
              } else {
                date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
              }
          }
          return date;
        }
      }

      function cancelFianza(fianza){
        var modalInstance = $uibModal.open({
            templateUrl: 'app/fianzas/cancel.fianzas.html',
            controller: cancelFianzaModalView,
            controllerAs: 'vm',
            size: 'lg',
            resolve: {
                fianza: function() {
                    return fianza;
                }
            },
            backdrop: 'static', /* this prevent user interaction with the background */
            keyboard: false
          });
          modalInstance.result.then(function(fianza) {
          vm.insurance = fianza;
        });
      }

      $scope.changeFechaCancelacion = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Fecha de cancelación',
          text:'Escribe el formato de fecha como DD/MM/AAAA.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many: $scope.benmany,monto_cancelacion: vm.insurance.monto_cancelacion, fecha_cancelacion: datesFactory.toDate(inputValue), status: 11})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó la fecha de cancelación."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.changeMontoCancelacion = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Monto de cancelación',
          text:'Este cambio se aplicará en la fianza.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {
          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many: $scope.benmany,monto_cancelacion: parseFloat(inputValue).toFixed(2), fecha_cancelacion: vm.insurance.fecha_cancelacion, status: 11})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó el monto de cancelación."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.changeFechaComision = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Fecha de Pago de Comisión',
          text:'Escribe el formato de fecha como DD/MM/AAAA.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many: $scope.benmany,status: vm.insurance.status,fecha_pago_comision: datesFactory.toDate(inputValue),fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó la fecha de pago de comisión."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.changeFechaEmisionF = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Fecha Emisión factura',
          text:'Escribe el formato de fecha como DD/MM/AAAA.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many: $scope.benmany,status: vm.insurance.status,date_emision_factura: datesFactory.toDate(inputValue),fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó la fecha emisión de factura de comisión."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.changeFechaMaquila = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Fecha Maquila',
          text:'Escribe el formato de fecha como DD/MM/AAAA.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many: $scope.benmany,status: vm.insurance.status,date_maquila: datesFactory.toDate(inputValue),fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó la fecha maquila de fianza."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.changeFechaEntrega = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Fecha Entrega',
          text:'Escribe el formato de fecha como DD/MM/AAAA.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {fecha_entrega: datesFactory.toDate(inputValue)})
            .then(function(response){  
              vm.insurance.fecha_entrega =   datesFactory.toDate(inputValue)   
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó la fecha entrega de fianza."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.changeFechaBono = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Fecha de Bono',
          text:'Escribe el formato de fecha como DD/MM/AAAA.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many: $scope.benmany,status: vm.insurance.status,date_bono: datesFactory.toDate(inputValue),fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó la fecha de bono de fianza."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.changeBono = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Bono Afianzadora',
          text:'Escribe monto del Bono.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many: $scope.benmany,status: vm.insurance.status,bono_variable: parseFloat(inputValue).toFixed(2),fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó la cantidad del bono de fianza."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.years=[]
      var actualYear = new Date().getFullYear();
      var oldYear = actualYear - 80;
      for (var i = actualYear + 10; i >= oldYear; i--) {
        $scope.years.push(i);
      }
      $scope.changeFolioF = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Folio factura',
          text:'Escribe el folio de la factura.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many:$scope.benmany,status: vm.insurance.status,folio_factura: inputValue,fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó el folio de la factura."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.changeMaquila = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Maquila',
          text:'Escribe el monto de la Maquila',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many:$scope.benmany,status: vm.insurance.status,maquila: parseFloat(inputValue).toFixed(2),fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó el monto de la maquila."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.changeTipoC = function(){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        var data_alert = {
          title: 'Tipo de Cambio(captura)',
          text:'Escribe el monto de la Tipo de Cambio(captura)',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch(vm.insurance.url, {beneficiaries_poliza_many:$scope.benmany,status: vm.insurance.status,exchange_rate: parseFloat(inputValue).toFixed(2),fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó el monto de la Tipo de Cambio(captura)."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.month={};
      $scope.month.month_selected = 1;
      $scope.month.options = [
          {'value':0,'label':''},
          {'value':1,'label':'Enero'},
          {'value':2,'label':'Febrero'},
          {'value':3,'label':'Marzo'},
          {'value':4,'label':'Abril'},
          {'value':5,'label':'Mayo'},
          {'value':6,'label':'Junio'},
          {'value':7,'label':'Julio'},
          {'value':8,'label':'Agosto'},
          {'value':9,'label':'Septiembre'},
          {'value':10,'label':'Octubre'},
          {'value':11,'label':'Noviembre'},
          {'value':12,'label':'Diciembre'},
      ]
      $scope.openMonth = false;
      $scope.changeMesF = function(){
        $scope.openMonth = true;
      };
      $scope.changeMesF1= function(mes){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        $scope.openMonth = false;
        $http.patch(vm.insurance.url, {beneficiaries_poliza_many: $scope.benmany,status: vm.insurance.status, month_factura: mes,fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
        .then(function(response){       
          SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
          activate();
        });
        var paramsRec = {
          'model': 13,
          'event': "PATCH",
          'associated_id': vm.insurance.id,
          'identifier': " actualizó el mes emisión de la factura."
        }
        dataFactory.post('send-log/', paramsRec).then(function success(response){

        });
      }
      $scope.openYear = false;
      $scope.changYearF = function(){
        $scope.openYear = true;
      };
      $scope.changeYearF1= function(year){
        $scope.benmany = vm.insurance.beneficiaries_poliza_many;
        $scope.benmany.forEach(function(item) {
         try{delete item['poliza_many'];}catch(e){}
        });
        $scope.openYear = false;
        $http.patch(vm.insurance.url, {beneficiaries_poliza_many: $scope.benmany,status: vm.insurance.status, year_factura: year,fecha_cancelacion: vm.insurance.fecha_cancelacion,monto_cancelacion: vm.insurance.monto_cancelacion})
        .then(function(response){       
          SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
          activate();
        });
        var paramsRec = {
          'model': 13,
          'event': "PATCH",
          'associated_id': vm.insurance.id,
          'identifier': " actualizó el año emisión de la factura."
        }
        dataFactory.post('send-log/', paramsRec).then(function success(response){

        });
      }
      $scope.changecomission = function(value){
        var data_alert = {
          title: value == 1 ? 'Comisión' : 'Porcentaje Comisión',
          text:'Este cambio se aplicará en el recibo y la fianza.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }

        SweetAlert.swal(data_alert, function (inputValue) {
          if(inputValue) {
            if(value == 1){
              var data = {
                comision: parseFloat(inputValue).toFixed(2),
                comision_percent: ((parseFloat(inputValue).toFixed(2) * 100) / vm.insurance.p_neta).toFixed(2)
              }
            }else{
              if(parseFloat(inputValue) > 100){
                SweetAlert.swal('Error', 'El porcentaje no puede ser mayor a 100%.', 'error');
                return;
              }
              var data = {
                comision: ((vm.insurance.p_neta * parseFloat(inputValue).toFixed(2)) / 100).toFixed(2),
                comision_percent: parseFloat(inputValue).toFixed(2)
              }
            }
            $scope.benmany = vm.insurance.beneficiaries_poliza_many;
            $scope.benmany.forEach(function(item) {
             try{delete item['poliza_many'];}catch(e){}
            });
            data.beneficiaries_poliza_many = $scope.benmany
            data.monto_cancelacion= vm.insurance.monto_cancelacion
            data.fecha_cancelacion= vm.insurance.fecha_cancelacion
            
            $http.patch(vm.insurance.url, data)
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Comisiones actualizadas exitosamente.', 'success');
              activate();
            });
            vm.insurance.recibos_poliza.forEach(function(receipt){
              $http.patch(receipt.url, { comision: data.comision })
              .then(function(response){       

              });
            })
            var paramsRec = {
              'model': 18,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó la comisión del recibo."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };
      $scope.conducto_de_pago={};
      $scope.conducto_de_pago.options = [
          {'value':1,'label':'No domiciliada'},
          {'value':2,'label':'Agente'},
          {'value':3,'label':'CAC'},
          {'value':4,'label':'CAT/Domiciliado'},
          {'value':5,'label':'Nómina'},
          {'value':6,'label':'CUT'},
      ]
      $scope.changeDom =false;
      $scope.changedomiciliado = function(){
        $scope.changeDom = true;
      };
      $scope.changedomiciliado1 = function(val){
        $scope.changeDom = false;
        if(val) {
            var data = {
              conducto_de_pago: val,
            }
            $scope.benmany = vm.insurance.beneficiaries_poliza_many;
            $scope.benmany.forEach(function(item) {
            try{delete item['poliza_many'];}catch(e){}
            });
            data.beneficiaries_poliza_many = $scope.benmany
            data.monto_cancelacion= vm.insurance.monto_cancelacion
            data.fecha_cancelacion= vm.insurance.fecha_cancelacion
            
            $http.patch(vm.insurance.url, data)
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Domiciliación(Conducto de Pago) actualizado exitosamente.', 'success');
              activate();
            });
            vm.insurance.recibos_poliza.forEach(function(receipt){
              $http.patch(receipt.url, { conducto_de_pago: data.conducto_de_pago })
              .then(function(response){      

              });
            })
            var paramsRec = {
              'model': 18,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': " actualizó el conducto de pago(domiciliación) del recibo."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      }
      function reexpedicion (fianza_id){
          $scope.reexpedir = 1;
          // $state.go('polizas.info', { polizaId: myInsurance.id });
          $state.go('fianzas.reexpedir',{polizaId: fianza_id, reexpedir : $scope.reexpedir});
      }

      function renovacion (fianza_id){
          $scope.renovar = 2;
          // $state.go('polizas.info', { polizaId: myInsurance.id });
          $state.go('fianzas.renovar',{polizaId: fianza_id, renovacion : $scope.renovar});
      }

      function crearEndoso (name, route, fianza_id){
          $scope.renovar = 2;
          // $state.go('polizas.info', { polizaId: myInsurance.id });

          $scope.name_for_new_tab = name;
          $scope.route_for_new_tab = route;

          var existe = false;
          if (name && route){
            $scope.route_for_new_tab = route;
            $scope.name_for_new_tab = name;
            appStates.states.forEach(function(state) {
              if (state.route == $scope.route_for_new_tab){
                existe = true;
              }
            });
          }

          if (!existe){
            var active_tab = appStates.states.findIndex(function(item){
              if (item.active){
                return true
              }
              return false;
            });
            
            appStates.states[active_tab] = { 
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab),
            }
          }
          $localStorage.tab_states = appStates.states;
          $localStorage.tab_index = $localStorage.tab_states.length -1;
          if (route == 'endorsement.fianza') {
            $localStorage['save_created_endoso_fianza'] = {}
          }
          $state.go($scope.route_for_new_tab, {fianzaId: fianza_id});
      }


      $scope.open_in_same_tab = function(name, route, params, identifier, type){
        var existe = false;
        if (name && route){
          $scope.route_for_new_tab = route;
          $scope.name_for_new_tab = name;
          // appStates.states.forEach(function(state) {
          //   if (state.route == $scope.route_for_new_tab){
          //     existe = true;
          //   }
          // });
        }
  
        // if (!existe){
          var active_tab = appStates.states.findIndex(function(item){
            if (item.active){
              return true
            }
            return false;
          });
          if (type){
            appStates.states[active_tab] = { 
              id: identifier,
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab),
              type : type
            }
          } else {
            appStates.states[active_tab] = {
              id: identifier,
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab)
            }
          }
        // }
        $localStorage.tab_states = appStates.states;
        $localStorage.tab_index = $localStorage.tab_states.length -1;
  
        $state.go($scope.route_for_new_tab, params);
      }


      function rehabilitarFianza(suret){
        $rootScope.suretyInfo = suret;
        var modalInstance = $uibModal.open({
          templateUrl: 'app/fianzas/fianza_rehabilitar_modal.html',
          controller: FianzaRehabilitateModalCtrl,
          controllerAs: 'ann',
          size: 'lg',
          resolve: {
            suretyInfo: function(){
              return suret;
            },
          },
          backdrop: 'static',
          keyboard: false
        });
      };

      function FianzaRehabilitateModalCtrl($q, url,$http,$rootScope,suretyInfo,$scope,$uibModalInstance, datesFactory,toaster){
        var ann = this;
        ann.suretyInfo = suretyInfo;
        ann.suretyInfo.startValidity = datesFactory.convertDate(suretyInfo.start_of_validity);
        ann.suretyInfo.endValidity = datesFactory.convertDate(suretyInfo.end_of_validity);
        ann.suretyInfo.polizaNumber = (suretyInfo.poliza_number);

        $http({
          method: 'GET',
          url: url.IP + 'view-endosos',
          params: {
            policy: ann.suretyInfo.id
          }
        })
        .then(function success(response) {
          $scope.endososFianza = response.data.endosos;
        })
        .catch(function(e){
          console.log('error', e);
        });
        // ((1, 'Preanulada'),(2, 'Por error de captura'),(3, 'Por reexpedición'),(4, 'Por falta de pago'), (5, 'Otro(Anulación)'), (0, 'No aplica'))
        

        $scope.conceptAnnSelection = function(val){
          
        };

        $scope.savesuretyAnnulment = function(suretyA){
          if(!ann.suretyInfo.reason_rehabilitate){
            toaster.error('Agrega la razón de rehabilitación');
            return;
          }

          var obj = {
            reason_rehabilitate : ann.suretyInfo.reason_rehabilitate,
            status : 14
          }

          $q.all([$http.patch(suretyA.url, obj)
          .then(function(response){
            if(response.status == 200){
              var params = {
                'model': 13,
                'event': "PATCH",
                'associated_id': suretyA.id,
                'identifier': ' rehabilitó la fianza a un estatus vigente'
              }
              dataFactory.post('send-log/', params)
            }

            if(ann.suretyInfo.recibos_poliza.length > 0){
              if(ann.suretyInfo.recibos_poliza[0].status == 11 || ann.suretyInfo.recibos_poliza[0].status == 10){
                // Actualizar recibo de fianza a pendiente de pago
                $http({
                  method: 'PATCH',
                  url: ann.suretyInfo.recibos_poliza[0].url,
                  data: {
                    status: 4
                  }
                }).then(function success(response){
                  if(response.status == 200){
                    var params = {
                      'model': 4,
                      'event': "PATCH",
                      'associated_id': ann.suretyInfo.recibos_poliza[0].id,
                      'identifier': ' actualizó el recibo a Pre-anulado.'
                    }
                    dataFactory.post('send-log/', params).then(function success(response){
                      
                    });
                    toaster.success("Recibo de fianza actualizado exitosamente");
                    // activate();
                  }
                });
              }
            }

            $scope.endososFianza.forEach(function(endoso) {
              if(endoso.status == 6 || endoso.status == 2){
                $http.patch(endoso.url,{status : 2, endorsement_receipt: []}).then(function(endorsement_updated) {
                  toaster.success('Endoso actualizado');
                })
                if(endoso.endorsement_receipt && endoso.endorsement_receipt[0] && endoso.endorsement_receipt[0].url){
                  if(endoso.endorsement_receipt[0].status == 10 || endoso.endorsement_receipt[0].status == 11){
                      $http({
                      method: 'PATCH',
                      url: endoso.endorsement_receipt[0].url,
                      data: { status: 4 }
                    }).then(function(response_endosos_fianza) {
                      if(response_endosos_fianza.status == 200){
                        var params = {
                          'model': 4,
                          'event': "PATCH",
                          'associated_id': endoso.endorsement_receipt[0].id,
                          'identifier': ' actualizó el recibo a Pre-anulado.'
                        }
                        dataFactory.post('send-log/', params);
                        toaster.success("Recibo de endoso actualizado exitosamente.");
                      }
                    });
                  }
                }
              }
            });
            $uibModalInstance.dismiss('cancel');
          })
          .catch(function(e){
            console.log('error', e);
          })]).then(function() {
            activate();
          })
        }

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };
      };


      function anularFianza(suret){
        $rootScope.suretyInfo = suret;
        var modalInstance = $uibModal.open({
          templateUrl: 'app/fianzaGpo/annulment.ChangeModal.html',
          controller: FianzaAnnulmentModalCtrl,
          controllerAs: 'ann',
          size: 'lg',
          resolve: {
            suretyInfo: function(){
              return suret;
            },
          },
          backdrop: 'static',
          keyboard: false
        });
      };

      function FianzaAnnulmentModalCtrl(url,$http,$rootScope,suretyInfo,$scope,$uibModalInstance, datesFactory,toaster){
        var ann = this;
        ann.suretyInfo = suretyInfo;
        ann.suretyInfo.startValidity = datesFactory.convertDate(suretyInfo.start_of_validity);
        ann.suretyInfo.endValidity = datesFactory.convertDate(suretyInfo.end_of_validity);
        ann.suretyInfo.polizaNumber = (suretyInfo.poliza_number);

        $http({
          method: 'GET',
          url: url.IP + 'view-endosos',
          params: {
            policy: ann.suretyInfo.id
          }
        })
        .then(function success(response) {
          $scope.endososFianza = response.data.endosos;
        })
        .catch(function(e){
          console.log('error', e);
        });

        if (ann.suretyInfo.status == 14) {        
          ann.conceptAnn = [
            {'value':1,'label':'PreAnulada'},
            {'value':2,'label':'Por error de captura'},
            {'value':3,'label':'Por reexpedición'},
            {'value':4,'label':'Por falta de pago'},
            {'value':5,'label':'Otro (sólo anular)'}
          ];
        }else{        
          ann.conceptAnn= [
            {'value':2,'label':'Por error de captura'},
            {'value':3,'label':'Por Reexpedición'},
            {'value':4,'label':'Por falta de Pago'},
            {'value':5,'label':'Otro (Sólo anular)'}
          ];
        }
        // ((1, 'Preanulada'),(2, 'Por error de captura'),(3, 'Por reexpedición'),(4, 'Por falta de pago'), (5, 'Otro(Anulación)'), (0, 'No aplica'))
        ann.conceptAnnulment = ann.conceptAnn[0].value;

        $scope.conceptAnnSelection = function(val){
          
        };

        $scope.savesuretyAnnulment = function(suretyA){
            
          if(!ann.suretyInfo.reason_cancel){
            toaster.error('Agrega la razón de anulación');
            return;
          }

          if (ann.conceptAnnulment == 1) {
            var obj = {
              reason_rehabilitate: null,
              reason_cancel: ann.suretyInfo.reason_cancel,
              concept_annulment: ann.conceptAnnulment,
              status : 24//PreAnulada
            }

            $http.patch(suretyA.url, obj) //Actualizar la fianza a preanulado
            .then(function(response){
              if(response.status == 200){
                var params = {
                  'model': 13,
                  'event': "PATCH",
                  'associated_id':suretyA.id,
                  'identifier': ' actualizó la fianza a Pre-anulado.'
                }
                dataFactory.post('send-log/', params)
              }

              if(ann.suretyInfo.recibos_poliza.length > 0){
                if(ann.suretyInfo.recibos_poliza[0].status == 4){
                  // Actualizar recibo de fianza a preanulado
                  $http({
                    method: 'PATCH',
                    url: ann.suretyInfo.recibos_poliza[0].url,
                    data: {
                      status: 11
                    }
                  }).then(function success(response){
                    if(response.status == 200){
                      var params = {
                        'model': 4,
                        'event': "PATCH",
                        'associated_id': ann.suretyInfo.recibos_poliza[0].id,
                        'identifier': ' actualizó el recibo a Pre-anulado.'
                      }
                      dataFactory.post('send-log/', params).then(function success(response){
                        
                      });
                      toaster.success("Recibo de fianza actualizado exitosamente");
                      activate();
                    }
                  });
                }
              }

              $scope.endososFianza.forEach(function(endoso) {
                if(endoso.status == 2){
                  if(endoso.endorsement_receipt[0].status == 4){
                    // Actualizar recibo de endoso a preanulado
                    $http({
                      method: 'PATCH',
                      url: endoso.endorsement_receipt[0].url,
                      data: { status: 11 }
                    }).then(function(response_endosos_fianza) {
                      if(response_endosos_fianza.status == 200){
                        var params = {
                          'model': 4,
                          'event': "PATCH",
                          'associated_id': endoso.endorsement_receipt[0].id,
                          'identifier': ' actualizó el recibo a Pre-anulado.'
                        }
                        dataFactory.post('send-log/', params);
                        toaster.success("Recibo de endoso actualizado exitosamente.");

                      }
                    });
                  }
                }
              });
            })
            .catch(function(e){
              console.log('error', e);
            });
          }
          else if(ann.conceptAnnulment == 4){
            var recibos_pagados_flag = false;
            suretyA.recibos_poliza.forEach(function(rec) {
              if(rec.status == 1){
                recibos_pagados_flag = true;
              }
            })

            if(recibos_pagados_flag){
              SweetAlert.swal({
                title: "Anular fianza",
                text: "¿Esta fianza contiene recibos pagados, solo se veran afectados los recibos pendientes de pago, desea continuar?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Anular",
                cancelButtonText: "Cancelar",
                closeOnConfirm: true,
                closeOnCancel: false
              }, 
              function(isConfirm){
                if(isConfirm){
                  var obj = {
                    reason_rehabilitate: null,
                    reason_cancel: ann.suretyInfo.reason_cancel,
                    concept_annulment: ann.conceptAnnulment,
                    status : 17//Anulada
                  }

                  $q.all([
                  $http.patch(suretyA.url, obj) //Actualizar la fianza a preanulado
                  .then(function(response){
                    if(response.status == 200){
                      var params = {
                        'model': 13,
                        'event': "PATCH",
                        'associated_id': suretyA.id,
                        'identifier': ' actualizó la fianza a Anulado.'
                      }
                      dataFactory.post('send-log/', params)
                    }

                    if(ann.suretyInfo.recibos_poliza.length > 0){
                      if(ann.suretyInfo.recibos_poliza[0].status == 4 || ann.suretyInfo.recibos_poliza[0].status == 11){
                        // Actualizar recibo de fianza a preanulado
                        $http({
                          method: 'PATCH',
                          url: ann.suretyInfo.recibos_poliza[0].url,
                          data: {
                            status: 10
                          }
                        }).then(function success(response){
                          if(response.status == 200){
                            var params = {
                              'model': 4,
                              'event': "PATCH",
                              'associated_id': response.data.id,
                              'identifier': ' actualizó el recibo a Anulado.'
                            }
                            dataFactory.post('send-log/', params).then(function success(response){
                              
                            });
                            toaster.success("Recibo de fianza actualizado exitosamente");
                            activate();
                          }
                        });
                      }
                    }

                    $scope.endososFianza.forEach(function(endoso) {
                      if(endoso.status == 2){
                          // Actualizar recibo de endoso a preanulado
                              $http.patch(endoso.url,{status:6}).then(function(response_endoso_updated) {
                                if(response.status == 200){
                                  var params = {
                                    'model': 10,
                                    'event': "PATCH",
                                    'associated_id': response_endoso_updated.data.id,
                                    'identifier': ' actualizó la fianza a Anulado.'
                                  }
                                  dataFactory.post('send-log/', params)
                                  if(endoso.endorsement_receipt[0].status == 4 || ann.suretyInfo.recibos_poliza[0].status == 11){
                                    $http({
                                    method: 'PATCH',
                                    url: endoso.endorsement_receipt[0].url,
                                    data: { status: 10 }
                                    }).then(function(response_endosos_fianza) {
                                      if(response_endosos_fianza.status == 200){
                                        var params = {
                                          'model': 4,
                                          'event': "PATCH",
                                          'associated_id': endoso.endorsement_receipt[0].id,
                                          'identifier': ' actualizó el recibo a Anulado.'
                                        }
                                        dataFactory.post('send-log/', params);
                                        toaster.success("Recibo de endoso actualizado exitosamente.");

                                      }
                                    });
                                  }
                                }
                            })
                      }
                    });
                  })
                  .catch(function(e){
                    console.log('error', e);
                  })]).then(function() {activate();});
                }
                else{
                  SweetAlert.swal("¡Cancelado!", "La fianza no fue anulada", "error"); 
                  return;
                }
              });
            }
            else{
              var obj = {
                reason_rehabilitate: null,
                reason_cancel: ann.suretyInfo.reason_cancel,
                concept_annulment: ann.conceptAnnulment,
                status : 17//Anulada
              }

              $q.all([
              $http.patch(suretyA.url, obj) //Actualizar la fianza a preanulado
              .then(function(response){
                if(response.status == 200){
                  var params = {
                    'model': 13,
                    'event': "PATCH",
                    'associated_id': suretyA.id,
                    'identifier': ' actualizó la fianza a Anulado.'
                  }
                  dataFactory.post('send-log/', params)
                }

                if(ann.suretyInfo.recibos_poliza.length > 0){
                  if(ann.suretyInfo.recibos_poliza[0].status == 4 || ann.suretyInfo.recibos_poliza[0].status == 11){
                    // Actualizar recibo de fianza a preanulado
                    $http({
                      method: 'PATCH',
                      url: ann.suretyInfo.recibos_poliza[0].url,
                      data: {
                        status: 10
                      }
                    }).then(function success(response){
                      if(response.status == 200){
                        var params = {
                          'model': 4,
                          'event': "PATCH",
                          'associated_id': response.data.id,
                          'identifier': ' actualizó el recibo a Anulado.'
                        }
                        dataFactory.post('send-log/', params).then(function success(response){
                          
                        });
                        toaster.success("Recibo de fianza actualizado exitosamente");
                        activate();
                      }
                    });
                  }
                }

                $scope.endososFianza.forEach(function(endoso) {
                  if(endoso.status == 2){
                      // Actualizar recibo de endoso a preanulado
                          $http.patch(endoso.url,{status:6}).then(function(response_endoso_updated) {
                            if(response.status == 200){
                              var params = {
                                'model': 10,
                                'event': "PATCH",
                                'associated_id': response_endoso_updated.data.id,
                                'identifier': ' actualizó la fianza a Anulado.'
                              }
                              dataFactory.post('send-log/', params)
                              if(endoso.endorsement_receipt[0].status == 4 || ann.suretyInfo.recibos_poliza[0].status == 11){
                                $http({
                                method: 'PATCH',
                                url: endoso.endorsement_receipt[0].url,
                                data: { status: 10 }
                                }).then(function(response_endosos_fianza) {
                                  if(response_endosos_fianza.status == 200){
                                    var params = {
                                      'model': 4,
                                      'event': "PATCH",
                                      'associated_id': endoso.endorsement_receipt[0].id,
                                      'identifier': ' actualizó el recibo a Anulado.'
                                    }
                                    dataFactory.post('send-log/', params);
                                    toaster.success("Recibo de endoso actualizado exitosamente.");

                                  }
                                });
                              }
                            }
                        })
                  }
                });
              })
              .catch(function(e){
                console.log('error', e);
              })]).then(function() {activate();});
            }
          }

          else if(ann.conceptAnnulment == 5){
            var recibos_pagados_flag = false;
            suretyA.recibos_poliza.forEach(function(rec) {
              if(rec.status == 1){
                recibos_pagados_flag = true;
              }
            })

            if(recibos_pagados_flag){
              SweetAlert.swal({
                title: "Anular fianza",
                text: "¿Esta fianza contiene recibos pagados, solo se veran afectados los recibos pendientes de pago, desea continuar?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Anular",
                cancelButtonText: "Cancelar",
                closeOnConfirm: true,
                closeOnCancel: false
              }, 
              function(isConfirm){
                if(isConfirm){
                  var obj = {
                    reason_rehabilitate: null,
                    reason_cancel: ann.suretyInfo.reason_cancel,
                    concept_annulment: ann.conceptAnnulment,
                    status : 17//Anulada
                  }

                  $q.all([
                  $http.patch(suretyA.url, obj) //Actualizar la fianza a preanulado
                  .then(function(response){
                    if(response.status == 200){
                      var params = {
                        'model': 13,
                        'event': "PATCH",
                        'associated_id': suretyA.id,
                        'identifier': ' actualizó la fianza a Anulado.'
                      }
                      dataFactory.post('send-log/', params)
                    }

                    if(ann.suretyInfo.recibos_poliza.length > 0){
                      if(ann.suretyInfo.recibos_poliza[0].status == 4 || ann.suretyInfo.recibos_poliza[0].status == 11){
                        // Actualizar recibo de fianza a preanulado
                        $http({
                          method: 'PATCH',
                          url: ann.suretyInfo.recibos_poliza[0].url,
                          data: {
                            status: 10
                          }
                        }).then(function success(response){
                          if(response.status == 200){
                            var params = {
                              'model': 4,
                              'event': "PATCH",
                              'associated_id': response.data.id,
                              'identifier': ' actualizó el recibo a Anulado.'
                            }
                            dataFactory.post('send-log/', params).then(function success(response){
                              
                            });
                            toaster.success("Recibo de fianza actualizado exitosamente");
                            activate();
                          }
                        });
                      }
                    }

                    $scope.endososFianza.forEach(function(endoso) {
                      if(endoso.status == 2){
                          // Actualizar recibo de endoso a preanulado
                              $http.patch(endoso.url,{status:6}).then(function(response_endoso_updated) {
                                if(response.status == 200){
                                  var params = {
                                    'model': 10,
                                    'event': "PATCH",
                                    'associated_id': response_endoso_updated.data.id,
                                    'identifier': ' actualizó la fianza a Anulado.'
                                  }
                                  dataFactory.post('send-log/', params)
                                  if(endoso.endorsement_receipt[0].status == 4 || ann.suretyInfo.recibos_poliza[0].status == 11){
                                    $http({
                                    method: 'PATCH',
                                    url: endoso.endorsement_receipt[0].url,
                                    data: { status: 10 }
                                    }).then(function(response_endosos_fianza) {
                                      if(response_endosos_fianza.status == 200){
                                        var params = {
                                          'model': 4,
                                          'event': "PATCH",
                                          'associated_id': endoso.endorsement_receipt[0].id,
                                          'identifier': ' actualizó el recibo a Anulado.'
                                        }
                                        dataFactory.post('send-log/', params);
                                        toaster.success("Recibo de endoso actualizado exitosamente.");

                                      }
                                    });
                                  }
                                }
                            })
                      }
                    });
                  })
                  .catch(function(e){
                    console.log('error', e);
                  })]).then(function() {activate();});
                }
                else{
                  SweetAlert.swal("¡Cancelado!", "La fianza no fue anulada", "error"); 
                  return;
                }
              });
            }
            else{
              var obj = {
                reason_rehabilitate: null,
                reason_cancel: ann.suretyInfo.reason_cancel,
                concept_annulment: ann.conceptAnnulment,
                status : 17//Anulada
              }

              $q.all([
              $http.patch(suretyA.url, obj) //Actualizar la fianza a preanulado
              .then(function(response){
                if(response.status == 200){
                  var params = {
                    'model': 13,
                    'event': "PATCH",
                    'associated_id': suretyA.id,
                    'identifier': ' actualizó la fianza a Anulado.'
                  }
                  dataFactory.post('send-log/', params)
                }

                if(ann.suretyInfo.recibos_poliza.length > 0){
                  if(ann.suretyInfo.recibos_poliza[0].status == 4 || ann.suretyInfo.recibos_poliza[0].status == 11){
                    // Actualizar recibo de fianza a preanulado
                    $http({
                      method: 'PATCH',
                      url: ann.suretyInfo.recibos_poliza[0].url,
                      data: {
                        status: 10
                      }
                    }).then(function success(response){
                      if(response.status == 200){
                        var params = {
                          'model': 4,
                          'event': "PATCH",
                          'associated_id': response.data.id,
                          'identifier': ' actualizó el recibo a Anulado.'
                        }
                        dataFactory.post('send-log/', params).then(function success(response){
                          
                        });
                        toaster.success("Recibo de fianza actualizado exitosamente");
                        activate();
                      }
                    });
                  }
                }

                $scope.endososFianza.forEach(function(endoso) {
                  if(endoso.status == 2){
                      // Actualizar recibo de endoso a preanulado
                        $http.patch(endoso.url,{status:6}).then(function(response_endoso_updated) {
                          if(response.status == 200){
                            var params = {
                              'model': 10,
                              'event': "PATCH",
                              'associated_id': response_endoso_updated.data.id,
                              'identifier': ' actualizó la fianza a Anulado.'
                            }
                            dataFactory.post('send-log/', params)
                            if(endoso.endorsement_receipt[0].status == 4 || ann.suretyInfo.recibos_poliza[0].status == 11){
                              $http({
                              method: 'PATCH',
                              url: endoso.endorsement_receipt[0].url,
                              data: { status: 10 }
                              }).then(function(response_endosos_fianza) {
                                if(response_endosos_fianza.status == 200){
                                  var params = {
                                    'model': 4,
                                    'event': "PATCH",
                                    'associated_id': endoso.endorsement_receipt[0].id,
                                    'identifier': ' actualizó el recibo a Anulado.'
                                  }
                                  dataFactory.post('send-log/', params);
                                  toaster.success("Recibo de endoso actualizado exitosamente.");

                                }
                              });
                            }
                          }
                      })
                  }
                });
              })
              .catch(function(e){
                console.log('error', e);
              })]).then(function() {activate();});
            }
          }
          else if(ann.conceptAnnulment == 3 || ann.conceptAnnulment == 2){
            var obj = {
              reason_rehabilitate: null,
              reason_cancel: ann.suretyInfo.reason_cancel,
              concept_annulment: ann.conceptAnnulment
            }
            $http.patch(suretyA.url, obj).then(function(response) {
              reexpedicion(suretyA.id);
            })
            
          }
          $uibModalInstance.dismiss('cancel');
        
        }

        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };
      };




      $scope.addEmailsConfirmPolicy = function(insurance, natural, juridical,contractor){
      // if(natural){
      //   insurance.contratante = natural;
      // }else if(juridical){
      //   insurance.contratante = juridical;
      // }
      insurance.contratante = contractor
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/cobranzas/add.emails.reminder_pay.html',
        controller: 'CobranzasCtrl',
        controllerAs: 'vm',
        size: 'lg',
        resolve: {
          insurance: function() {
            return insurance;
          },
          valueReceipt: function() {
            return insurance;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });
      modalInstance.result.then(function(receipt) {

      });
    };

      function cancelFianzaModalView($scope, $uibModalInstance, fianza, url, $http, toaster, MESSAGES){

          /* Información de usuario */
          var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
          var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
          var usr = JSON.parse(decryptedUser);
          var token = JSON.parse(decryptedToken);

          /* Uploader files */
          var uploader = $scope.uploader = new FileUploader({
              headers: {
                  'Authorization': 'Bearer ' + token,
                  'Accept': 'application/json'
              },
          });

          // uploader.filters.push({
          //     name: 'customFilter',
          //     fn: function(item, options) {
          //         return this.queue.length < 20;
          //     }
          // });

          $scope.close = function () {
            if($uibModalInstance)
                $uibModalInstance.dismiss('cancel');
          };

          $scope.cancelFianza = function() {
              $scope.userInfo = {
                id: fianza.id
              }; 
              $scope.userInfo.url = $scope.uploader.url = url.IP + 'fianzas-cancel/' + fianza.id + '/archivos/';
              $scope.uploader.uploadAll();

              $http({
                  method: 'GET',
                  url: url.IP + 'cancel-fianza/',
                  params: {
                      status: 11,
                      id: fianza.id
                  }
              })
              .then(function success(response) {
                if (response) {
                  var paramsE = {
                    'model': 13,
                    'event': "PATCH",
                    'associated_id': fianza.id,
                    'identifier': "cancelo la fianza : "+fianza.fianza_number
                  }
                  dataFactory.post('send-log', paramsE);
                }
                  if($uibModalInstance)
                    $uibModalInstance.close(response.data);
                  if($localStorage.email_config){

                    emailService.sendEmailAtm(17,vm.insurance.id)
                  }
              })
          }

          // ALERTA SUCCES UPLOADFILES
          uploader.onSuccessItem = function(fileItem, response, status, headers) {
            toaster.success(MESSAGES.OK.UPLOADFILES);
          };

          // ALERTA ERROR UPLOADFILES
          uploader.onErrorItem = function(fileItem, response, status, headers) {
            toaster.error(MESSAGES.ERROR.ERRORONUPLOADFILES);
          };

          uploader.onAfterAddingFile = function(fileItem) {
              fileItem.formData.push({
                  arch: fileItem._file,
                  nombre: ''
                  // owner: $scope.userInfo.id
              });
              // toaster.success('Archivo cargado correctamente')
          };

          uploader.onBeforeUploadItem = function(item) {
              item.url = $scope.userInfo.url;
              item.formData[0].nombre = item.file.name;
              item.alias = '';
              item.formData[0].owner = $scope.userInfo.id;

          };
      }

      function deleteFianza(id){
        SweetAlert.swal({
            title: "¿Está seguro?",
            text: "Los cambios no podrán revertirse",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "¡Si!",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: false
        },
        function(isConfirm){
          if (isConfirm) {

              // $http.delete(vm.insurance.url)
              $http.patch(vm.insurance.url,{'status':0})
                  .then(deleteFianzaComplete)
                  .catch(deleteFianzaFailed);

              function deleteFianzaComplete(response, status, headers, config) {
                var paramsE = {
                  'model': 13,
                  'event': "PATCH",
                  'associated_id': id,
                  'identifier': "elimino la fianza: "+vm.insurance.fianza_number
                }
                dataFactory.post('send-log', paramsE);
                var data_email = {
                    id: vm.insurance.id,
                    model: 4,
                    type_person: 0,
                  }
                  dataFactory.post('send-email-admins-deletes/', data_email).then(function success(req) {
                      
                  });
                  SweetAlert.swal("¡Listo!", 'La fianza ha sido eliminada', "success");

                  $state.go('fianzas.list');
              }

              function deleteFianzaFailed(response, status, headers, config) {
                  return response;
              }
          } else {
              SweetAlert.swal("Cancelado", "La fianza no se ha eliminado", "error");
          }
        });
      }

      $scope.editReceipt = function(receipt,index){
        var texto = "Esta es una alternativa de emergencia, No se validarán las primas y ni las fechas al editar este recibo. ¿Deseas continuar?"
        if (vm.acceso_pl_cob == false && (receipt.status ==1 || receipt.status == 'Pagado')) {
          var texto = "Esta es una alternativa de emergencia, No se validarán las primas y ni las fechas al editar este recibo.  \nEstas editando un recibo PAGADO, para posteriores casos te recomendamos revisar bien las primas antes del proceso de pago/liquidación, ya que este tipo de acciones no son recomendables.\n ¿Deseas continuar?"
        }else if (vm.acceso_pl_cob == false && (receipt.status ==5 || receipt.status == 'Liquidado')){
          var texto = "Esta es una alternativa de emergencia, No se validarán las primas y ni las fechas al editar este recibo.  \nEstas editando un recibo LIQUIDADO, para posteriores casos te recomendamos revisar bien las primas antes del proceso de pago/liquidación, ya que este tipo de acciones no son recomendables.\n ¿Deseas continuar?"
        }
        if((receipt.status == 4 || receipt.status == 'Pendiente de pago') || (vm.acceso_pl_cob == false && ((receipt.status ==5 || receipt.status == 'Liquidado') || (receipt.status ==1 || receipt.status == 'Pagado')))){
          SweetAlert.swal({
            title: "Advertencia",
            text: texto,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: false
          },
          function(isConfirm){
            if (isConfirm) {
              var modalInstance = $uibModal.open({
                templateUrl: 'app/fianzas/receipt-modal.html',
                controller: EditReceiptModalCtrl,
                controllerAs: 'rec',
                size: 'lg',
                resolve: {
                  recibo: function() {
                    return receipt;
                  },
                  index: function() {
                    return index;
                  },
                  endoso: function() {
                    return vm.insurance;
                  },
                  acceso_pl_cob:function(){
                    return vm.acceso_pl_cob;
                  }
                },
                backdrop: 'static', /* this prevent user interaction with the background */
                keyboard: false
              });
            }else{
              SweetAlert.swal("Cancelado", "El recibo no ha sido actualizado", "error");
            }
          });
        }
        else{
          SweetAlert.swal("Advertencia", "El recibo no se puede editar porque no esta pendiente de pago.", "warning");
        }
      }

      function EditReceiptModalCtrl(url,$http,$rootScope,recibo,index,endoso,$scope,$uibModalInstance,acceso_pl_cob){
        var rec = this;
        rec.recibo = recibo;
        rec.recibo.fecha_inicio = convertDate(recibo.fecha_inicio);
        rec.recibo.fecha_fin = convertDate(recibo.fecha_fin);
        rec.recibo.vencimiento = convertDate(recibo.vencimiento);
        // $scope.recibo.sub_total = (parseFloat(recibo.prima_neta) + parseFloat(recibo.rpf) + parseFloat(recibo.derecho)).toFixed(2);

        function convertDate(inputFormat, indicator) {
          function pad(s) { return (s < 10) ? '0' + s : s; }
          var d = new Date(inputFormat);
          if(indicator){
            var date = [pad(d.getDate()+1), pad(d.getMonth()+1), d.getFullYear()].join('/');
          } else {
            var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
          }

          return date;
        };

        function toDate(dateStr) {
          if(dateStr){
            var dateString = dateStr; // Oct 23
            var dateParts = dateString.split("/");
            var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based
            return dateObject;
          }
        };

        $scope.validateDecimal = function(form){
          form = String(form).replace(/[A-Za-z]/g, '');
          form = String(form).replace(/,/g, '');
          return form;
        };

        $scope.changePrimas = function(data){
          rec.recibo.sub_total = (parseFloat(data.prima_neta) + parseFloat(data.rpf) + parseFloat(data.derecho)).toFixed(2);
          rec.recibo.prima_total = (parseFloat(rec.recibo.sub_total) + parseFloat(data.iva)).toFixed(2);
        };
        $scope.habilitate=true;
        $scope.saveReceipt = function(receipt){
          var obj = {
            fecha_inicio: new Date(toDate(receipt.fecha_inicio)),
            fecha_fin: new Date(toDate(receipt.fecha_fin)),
            prima_neta: receipt.prima_neta,
            rpf: receipt.rpf,
            derecho: receipt.derecho,
            iva: receipt.iva,
            prima_total: receipt.prima_total,
            comision: receipt.comision,
            vencimiento: new Date(toDate(receipt.vencimiento)),
            delivered: receipt.delivered
          }

          $http.patch(receipt.url, obj).then(function(response) {
            var update_poliza = {
              'p_neta': obj.prima_neta  ,
              'p_total': obj.prima_total ,
              'derecho': obj.derecho ,
              'rpf': obj.rpf ,
              'sub_total': response.sub_total ,
              'iva': obj.iva ,
              'comision': obj.comision,
            }
            $http.patch(endoso.url, update_poliza).then(function(response){
              endoso['p_neta'] = response.data['p_neta'];
              endoso['p_total'] = response.data['p_total'];
              endoso['derecho'] = response.data['derecho'];
              endoso['rpf'] = response.data['rpf'];
              endoso['sub_total'] = response.data['sub_total'];
              endoso['iva'] = response.data['iva'];
              endoso['comision'] = response.data['comision'];
            });
            var texto_log = 'edito el recibo '
            if ((receipt.status ==1 || receipt.status == 'Pagado') && acceso_pl_cob ==false) {
              var texto_log = " EDICION DE RECIBO PAGADO"
            }
            if ((receipt.status ==5 || receipt.status == 'Liquidado') && acceso_pl_cob ==false) {
              var texto_log = " EDICION DE RECIBO LIQUIDADO"
            }
            var params = {
              'model': 13,
              'event': "PATCH",
              'associated_id': endoso.id,
              'identifier': "actualizó el recibo " + receipt.recibo_numero + texto_log+' '+"."
            }
            dataFactory.post('send-log/', params).then(function success(response) {

            });
            var params = {
              'model': 4,
              'event': "POST",
              'associated_id': receipt.id,
              'identifier': 'actualizó el recibo, '+texto_log ? texto_log : '.'
            }
            dataFactory.post('send-log/', params).then(function success(response) {

            });
            SweetAlert.swal("Listo", "El recibo ha sido actualizado", "success");
            $scope.cancel();
          });
        }
        $scope.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };
      }

      $scope.calculatePrima = function(receipts){
        var total_comision = 0;
        for (var i = 0; i < receipts.length; i++) {
          if (receipts[i].receipt_type ==1) {
            total_comision = parseFloat(total_comision) + parseFloat(receipts[i].prima_neta);
          }
        }
        return (total_comision).toFixed(2);
      }
      $scope.calculateDerecho = function(receipts){
        var total_comision = 0;
        for (var i = 0; i < receipts.length; i++) {
          if (receipts[i].receipt_type ==1) {
            total_comision = parseFloat(total_comision) + parseFloat(receipts[i].rpf);
          }
        }
        return (total_comision).toFixed(2);
      }
      $scope.calculateRpf = function(receipts){
        var total_comision = 0;
        for (var i = 0; i < receipts.length; i++) {
          if (receipts[i].receipt_type ==1) {
            total_comision = parseFloat(total_comision) + parseFloat(receipts[i].derecho);
          }
        }
        return (total_comision).toFixed(2);
      }
      $scope.calculateIva = function(receipts){
        var total_comision = 0;
        for (var i = 0; i < receipts.length; i++) {
          if (receipts[i].receipt_type ==1) {
            total_comision = parseFloat(total_comision) + parseFloat(receipts[i].iva);
          }
        }
        return (total_comision).toFixed(2);
      }
      $scope.calculateComision = function(receipts){
        var total_comision = 0;
        for (var i = 0; i < receipts.length; i++) {
          if (receipts[i].receipt_type ==1) {
            total_comision = parseFloat(total_comision) + parseFloat(receipts[i].comision);
          }
        }
        return (total_comision).toFixed(2);
      }
      $scope.calculatePrimaTotal = function(receipts){
        var total_comision = 0;
        for (var i = 0; i < receipts.length; i++) {
          if (receipts[i].receipt_type ==1) {
            total_comision = parseFloat(total_comision) + parseFloat(receipts[i].prima_total);
          }
        }
        return (total_comision).toFixed(2);
      }

    
    }
})();
