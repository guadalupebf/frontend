(function(){
    'use strict';
    /* jshint devel: true */

    angular.module('inspinia')
        .controller('RenewalModalCtrl', RenewalModalCtrl);

    RenewalModalCtrl.$inject = ['MESSAGES','$rootScope','appStates','formatValues', 'insuranceService', '$stateParams', 'dataFactory', 'SweetAlert', '$sce','coverageService', '$sessionStorage','$scope', '$uibModalInstance', '$uibModal', 'myPolicy', '$http', '$state', 'url','$location','$localStorage'];

    function RenewalModalCtrl(MESSAGES, $rootScope, appStates,formatValues, insuranceService, $stateParams, dataFactory, SweetAlert, $sce, coverageService, $sessionStorage, $scope, $uibModalInstance, $uibModal, myPolicy, $http, $state, url,$location,$localStorage) {

        function setRenewalDraft(policy) {
          $rootScope.renewalDraftPolicy = angular.copy(policy) || null;
        }

        function clearRenewalDraft() {
          $rootScope.renewalDraftPolicy = null;
        }

      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var usr = JSON.parse(decryptedUser);
        var vm = $scope;
        vm.user = usr;
        vm.forms = {};
        vm.cancel = cancel;
        vm.renewal = renewal;
        vm.cancelRenovate = cancelRenovate;

        var url_ = url;
        var url = null;

        // Menú rapido
        vm.deletePolicy = deletePolicy;
        vm.cancelPolicy = cancelPolicy;
        vm.getPDF = getPDF;
        vm.openRenovateModal = openRenovateModal;
        vm.goToEdit = goToEdit;
        vm.goToPolicy = goToPolicy;
        vm.viewCarta = viewCarta;

        function deletePolicy(policy){
          vm.policy_history_1 = [];
          $http({
            method: 'GET',
            url: url_.IP + 'historic-policies/',
            params: {
              actual_id: policy.id
            }
          })
          .then(function success(response) {
            $scope.policy_history = [];
            if(response.data.results.length){
              response.data.results.forEach(function function_name(old, index) {
                if(policy.id != old.base_policy.id){
                  $scope.policy_history.push(old.base_policy);
                  if(index == 0){
                    $scope.copy_policy_history = angular.copy(old.base_policy);   
                  }
                }else if(old.new_policy){
                  $scope.policy_history.push(old.new_policy);
                }
              });
            }
          })
          .catch(function (e) {
            console.log('error - caratula - catch', e);
          });
          // dataFactory.get('has-del-policy-permission')
          // .then(function success(response) {
          //  if(response.data){
            SweetAlert.swal({
                title: "¿Está seguro?",
                text: "Los cambios no podrán revertirse",
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
                    console.log('policy',policy)
                  if(policy.document_type == 1){
                    $scope.text_patch_ant = ''
                    $scope.status_ant = ''
                    $scope.text_patch_ant = ''
                    if (policy.status == 1 || policy.status == 2) {
                      if (vm.policy_history_1.length > 0) {
                        if (vm.policy_history_1[0].status != 12) {
                          $scope.text_patch_ant = ' \nSe cambiará el estatus de la póliza: '+vm.policy_history_1[0].poliza_number+' asociada'
                          $scope.status_ant = vm.policy_history_1[0].status
                        }else{
                          if(vm.policy_history_1[0].status == 12){
                            $scope.text_patch_ant = ''
                            $scope.status_ant = vm.policy_history_1[0].status
                          }
                          $scope.text_patch_ant = ''
                          $scope.status_ant = vm.policy_history_1[0].status
                        }
                      }
                    }
                    if (vm.policy_history_1.length > 0) {
                      $scope.date1 = convertDate(datesFactory.toDate(convertDate(vm.policy_history_1[0].end_of_validity)))
                      if(process($scope.date1) < process(convertDate(new Date()))){
                        $scope.status_ant = 13
                      }else if(process($scope.date1) > process(convertDate(new Date()))){
                        $scope.status_ant = 14
                      }else{
                        $scope.status_ant = vm.policy_history_1[0].status
                      }
                    }

                    function process(date){
                      var parts = date.split("/");
                      var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
                      return date.getTime();
                    }                   
                    $http.patch(policy.url,{'status': 0})
                    // $http.patch(policy.url)
                        .then(deletePolicyComplete)
                        .catch(deletePolicyFailed);
                    function deletePolicyComplete(response, status, headers, config) {
                      if(response.status === 200 || response.status === 201){
                        var data_email = {
                          id: policy.id,
                          model: 2,
                          type_person: 0,
                        }
                        dataFactory.post('send-email-admins-deletes/', data_email).then(function success(req) {
                            
                        });
                        if (vm.policy_history_1.length > 0) {
                          $http.patch(vm.policy_history_1[0].url, { renewed_status: 0, status : $scope.status_ant})
                          .then(function(xPolicy) {
                              var params = {
                                'model': 1,
                                'event': "PATCH",
                                'associated_id': vm.policy_history_1[0].id,
                                'identifier': "cambio el estatus de renovación de la póliza: "+vm.policy_history_1[0].poliza_number+" al eliminar la OT: "+ vm.insurance.internal_number
                              }
                              dataFactory.post('send-log/', params).then(function success(response) {    });

                          });
                        }
                        SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETEPOLICY, "success");

                        var params = {
                          'model': 1,
                          'event': "POST",
                          'associated_id': policy.id,
                          'identifier': "elimino la póliza."
                        }
                        dataFactory.post('send-log/', params).then(function success(response) {    });

                        policy.recibos_poliza.forEach(function(receipt) {
                          if (receipt.id) {
                            var params = {
                              'model': 4,
                              'event': "PATCH",
                              'associated_id':receipt.id,
                              'identifier': ' actualizo recibo a desactivado por eliminación de póliza',
                            }
                            dataFactory.post('send-log/', params).then(function success(response) {                              
                            });
                          }
                          $http.patch(receipt.url, {status: 0})
                        })                                            
                        $uibModalInstance.dismiss('cancel');
                        $state.reload();
                      }
                    }
                    function deletePolicyFailed(response, status, headers, config) {
                        return response;
                    }                      
                    // return $http.post(url_.IP + 'delete-policy', {'id':policy.id})
                    //   .then(deletePolicyComplete)
                    //   .catch(deletePolicyFailed);

                    // function deletePolicyComplete(response, status, headers, config) { //jshint ignore:line
                    //   SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETEPOLICY, "success");
                    //   setTimeout(function() {                      
                    //     $uibModalInstance.dismiss('cancel');
                    //     $state.reload();
                    //   }, 1000);
                    // }

                    // function deletePolicyFailed(response, status, headers, config) { //jshint ignore:line
                    //   return response;
                    // }

                  }
                  else if(policy.document_type == 3){
                    return $http.post(url_.IP + 'delete-colectivity/', {'id': policy.id})
                      .then(deletePolicyComplete)
                      .catch(deletePolicyFailed);

                    function deletePolicyComplete(response, status, headers, config) { //jshint ignore:line
                      SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETECOLLECTIVITY, "success");
                      if($scope.copy_policy_history){
                        if($scope.copy_policy_history.url){
                          if(process(convertDate($scope.copy_policy_history.start_of_validity)) > process(convertDate(new Date()))){
                            var data = {
                              status: 10,
                              renewed_status: 0
                            }
                          }else{
                            if(process(convertDate($scope.copy_policy_history.end_of_validity)) > process(convertDate(new Date()))){
                              var data = {
                                status: 14,
                                renewed_status: 0
                              }
                            }else{
                              var data = {
                                status: 13,
                                renewed_status: 0
                              }
                            }
                          }
                          function process(date){
                            var parts = date.split("/");
                            var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
                            return date.getTime();
                          }
                          $http.patch($scope.copy_policy_history.url, data)
                          .then(function success(request){
                            if(request.status === 200){
                              var paramsRec = {
                                'model': 18,
                                'event': "PATCH",
                                'associated_id': $scope.copy_policy_history.id,
                                'identifier':" eliminó la renovación."
                              }
                              dataFactory.post('send-log/', paramsRec).then(function success(response){

                              });
                            }
                          })
                          .catch(function(e){
                            console.log('error', e);
                          });
                        }
                      }
                      setTimeout(function() {                        
                        $uibModalInstance.dismiss('cancel');
                        $state.reload();
                      }, 1000);
                    }

                    function deletePolicyFailed(response, status, headers, config) { //jshint ignore:line
                      return response;
                    }
                  }
                  else if(policy.document_type == 4){
                    return $http.post(url_.IP + 'delete-colectivity/', {'id': policy.caratula})
                      .then(deletePolicyComplete)
                      .catch(deletePolicyFailed);

                    function deletePolicyComplete(response, status, headers, config) { //jshint ignore:line
                      SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETECOLLECTIVITY, "success");
                      var data_email = {
                        id: policy.id,
                        model: 2,
                        type_person: 0,
                      }
                      dataFactory.post('send-email-admins-deletes/', data_email).then(function success(req) {
                        
                      });
                      setTimeout(function() {                        
                        $uibModalInstance.dismiss('cancel');
                        $state.reload();
                      }, 1000);
                    }

                    function deletePolicyFailed(response, status, headers, config) { //jshint ignore:line
                      return response;
                    }
                  }
                } else {
                  SweetAlert.swal("Cancelado", "La póliza no se ha eliminado", "error");
                }
              }); 
          //   } else {
          //     SweetAlert.swal('Error', 'No tienes permiso para realizar esta acción', "error");
          //   }
          // });
        }

        function cancelPolicy(id){
          // dataFactory.get('has-cancel-policy-permission')
          // .then(function success(response) {
          //   if(response.data){
              SweetAlert.swal({
                title: "Cancelar póliza",
                text: "Elija una opción",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#581845  ",
                confirmButtonText: "Por endoso tipo D",
                cancelButtonText: "Precancelación",
                closeOnConfirm: true,
                closeOnCancel: false
              },
              function(isConfirm){
                if (isConfirm) {
                  var params = { 'myInsurance': vm.insurance, 'contractor': $scope.contratante }
                  $state.go('endosos.endosos',params);
                } else {
                  var data = {
                    status: 4
                  }
                  // SweetAlert.swal("Se ha enviando un correo al administrador", "info");
                  // $http.patch(url.IP + 'polizas/'+ id + '/', data).then(function success(response) {
                  // }) Manda correo
                  $scope.emails = [];
                  $scope.emails.push("ivan.tello@miurabox.com");
                  $http.post(url_.IP + 'cancel-policy-manual/', {'id': id, 'emails': $scope.emails})
                  .then(
                    function success(request) {
                      if(request.status === 200) {
                        swal("¡Listo!", "Se ha enviado un correo al administrador", "success");
                      } else {
                        toaster.warning("No se envió la póliza. Contacte a su administrador.");
                      }
                    },
                    function error(error) {
                      console.log('error - email', error);
                    }
                  )
                  .catch(function(e) {
                    console.log('error - catch', e);
                  });
                }
              });
          //   } else {
          //     SweetAlert-swal("Error", "No tienes permiso para realizar esta acción", "error");
          //   }
          // })
        }

        $scope.dismis = function(forms, receipt) {
          $scope.policy = forms;
          if(forms.contractor){
            receipt.contratante = forms.contractor;
          }
          receipt.poliza = {
            aseguradora: forms.aseguradora,
            id: forms.id,
            contractor: forms.contractor ? forms.contractor.full_name : null,
            polizaId: forms.id,
            poliza_number: forms.poliza_number,
            subramo: forms.subramo,
            url: forms.url,
          };
          $uibModalInstance.dismiss('cancel');
          changeStatusModal(receipt);
        };

        function changeStatusModal(receipt) {
          var modalInstance = $uibModal.open({ //jshint ignore:line
            templateUrl: 'app/cobranzas/cobranzas.modal.html',
            controller: 'CobranzasModal',
            size: 'lg',
            resolve: {
              receipt: function() {
                  return angular.copy(receipt);
              },
              insurance: function() {
                  return $scope.policy;
              },
              from: function() {
                  return null;
              },bono: function(){
                return null;
              }
            },
            backdrop: 'static', /* this prevent user interaction with the background */ 
            keyboard: false
          });
        }

        function getPDF(poliza) {
          $http({
            method: 'GET',
            url: url_.IP + 'get-pdf-ot/',
            params: {
              'id': poliza
            }
          }).then(function success(response) {
            var file = new Blob([response.data], {type: 'application/pdf'});
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(file);
            }
            else{               
              var fileURL = URL.createObjectURL(file);
              $scope.content = $sce.trustAsResourceUrl(fileURL);
              window.open($scope.content);
            }
            // $scope.pdf = response.data;
            // $http({
            //   method: 'GET',
            //   url: url_.IP + 'get-pdf',
            //   params: {
            //     'pdf_name': $scope.pdf.pdf_name
            //   }
            // }).then(function success(response) {
                
            // })
          })
        }

        function openRenovateModal(myInsurance, type){
          $stateParams.myInsurance = myInsurance
          // ---------------------------
          // evaluate
          $scope.existeRenovacion = false;
          $scope.conteo=0
          $scope.totalp=vm.policy_history ? vm.policy_history.length : 0
          if(vm.policy_history){
            vm.policy_history.forEach(function(old) {
              $scope.conteo=$scope.conteo+1
              if(old.status == 1){
                $scope.existeRenovacion = true
                SweetAlert.swal("Información","La póliza ya tiene una OT de renovación", "info");
                $state.go('index.main');
                clearRenewalDraft();
                return
              }
            });
          }
          if($scope.conteo == $scope.totalp && $scope.existeRenovacion==false){
            if(myInsurance.document_type == 1){
              if(myInsurance.renewed){
                SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRENEWPOLICY, "error");
                clearRenewalDraft();
              }
              else{
                $scope.id_for_new_tab = myInsurance.id
                var name = 'Renovación Póliza';
                var route = 'renovaciones.polizas';
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
                var params = { 'polizaId': myInsurance.id, myInsurance: myInsurance }
                setRenewalDraft(myInsurance);
                $state.go($scope.route_for_new_tab, params);
              }
            }
            else if(myInsurance.document_type == 3){
              if(myInsurance.renewed){
                SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRENEWPOLICY, "error");
              }
              else{
                if(type == 1){
                  var params = { polizaId: myInsurance.id, tipo: 1 }             
                  $scope.id_for_new_tab = myInsurance.id
                  var name = 'Renovar Póliza';
                  var route = 'colectividades.renewal';
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
                  // var params = { 'polizaId': myInsurance.id }
                  $state.go($scope.route_for_new_tab, params);
                }
                else if(type == ''){
                  var params = { polizaId: myInsurance.id, tipo: '' }            
                  $scope.id_for_new_tab = myInsurance.id
                  var name = 'Renovar Póliza';
                  var route = 'colectividades.renewal';
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
                  // var params = { 'polizaId': myInsurance.id }
                  $state.go($scope.route_for_new_tab, params);
                }
              }
            }
            else if(myInsurance.document_type == 4){
              if(myInsurance.renewed){
                SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRENEWPOLICY, "error");
              }
              else{
                if(type == 1){
                  var params = { polizaId: myInsurance.caratula, tipo: 1 }
                  // $state.go('colectividades.renewal', params);
                  $scope.route_for_new_tab = 'colectividades.renewal';
                  $scope.route_for_new_tab = 'colectividades.renewal';
                  $scope.id_for_new_tab = myInsurance.id
                  $scope.name_for_new_tab = 'Renovar Póliza'
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
                  $state.go($scope.route_for_new_tab, params);
                }
                else if(type == ''){
                  var params = { polizaId: myInsurance.caratula, tipo: '' }
                  // $state.go('colectividades.renewal', params);
                  $scope.route_for_new_tab = 'colectividades.renewal';
                  $scope.id_for_new_tab = myInsurance.id
                  $scope.name_for_new_tab = 'Renovar Póliza'
                  var existe = false;
                  appStates.states.forEach(function(state) {
                    if (state.route == $scope.route_for_new_tab && state.id == $scope.id_for_new_tab){
                      existe = true;
                    }
                  });
                  if(appStates.states.length > 3){
                    SweetAlert.swal("Error", "No se pueden abrir más pestañas.", "error");
                  }else{
                    if (!existe){
                      appStates.states.push(
                        { 
                          id: $scope.id_for_new_tab, 
                          name: $scope.name_for_new_tab, 
                          heading: $scope.name_for_new_tab, 
                          route: $scope.route_for_new_tab, 
                          active: true, 
                          isVisible: true, 
                          href: $state.href($scope.route_for_new_tab, params)
                        }
                      );
                      $localStorage.tab_states = appStates.states;
                      $state.go($scope.route_for_new_tab, params)
                    }
                  }
                  $state.go($scope.route_for_new_tab, params);
                }
              }
            }
            if($uibModalInstance){
              $uibModalInstance.dismiss('cancel');
            };            
          }else{
            $state.go('index.main');
          }
          // *****************************+
        }

        function goToEdit(poliza) {
          console.log('poliza**',poliza)
          if(poliza.document_type == 1){
            $stateParams.myInsurance = poliza
            // $state.go('polizas.editar', {polizaId: poliza.id});
            // $state.go('colectividades.edit', {polizaId: poliza.id});
            var params = { polizaId: poliza.id}            
            $scope.id_for_new_tab = poliza.id
            var name = 'Editar Póliza';
            var route = 'polizas.editar';
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
            $state.go($scope.route_for_new_tab, params);
          }
          else if(poliza.document_type == 3){
            $rootScope.edit_collective = poliza;
            $stateParams.myInsurance = poliza
            // $state.go('colectividades.edit', {polizaId: poliza.id});
            var params = { polizaId: poliza.id, tipo: '' }            
            $scope.id_for_new_tab = poliza.id
            var name = 'Editar Póliza de Grupo';
            var route = 'colectividades.edit';
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
            $state.go($scope.route_for_new_tab, params);
          }
          else if(poliza.document_type == 4){
            // $state.go('colectividades.edit', {polizaId: poliza.caratula});              
            $rootScope.edit_collective = poliza.parent;
            $stateParams.myInsurance = poliza.parent
            // $state.go('colectividades.edit', {polizaId: poliza.id});
            var params = { polizaId: poliza.caratula, tipo: '' }            
            $scope.id_for_new_tab = poliza.caratula
            var name = 'Editar Póliza de Grupo';
            var route = 'colectividades.edit';
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
            $state.go($scope.route_for_new_tab, params);
          }
          if($uibModalInstance){
            $uibModalInstance.dismiss('cancel');
          };
        }

        function goToPolicy(poliza) {
          if(poliza.document_type == 1){
            $scope.open_in_same_tab('Información Póliza', 'polizas.info',{polizaId: poliza.id}, poliza.id , null);
            // $state.go('polizas.info', {polizaId: poliza.id});
          }
          else if(poliza.document_type == 3){
            $scope.open_in_same_tab('Información Póliza', 'colectividades.info',{polizaId: poliza.id}, poliza.id , null);
            // $state.go('colectividades.info', {polizaId: poliza.id})
          }
          else if(poliza.document_type == 4){
            $scope.open_in_same_tab('Información Póliza', 'colectividades.info',{polizaId: poliza.caratula}, poliza.caratula , null);
            // $state.go('colectividades.info', {polizaId: poliza.caratula});
          }
          if($uibModalInstance){
            $uibModalInstance.dismiss('cancel');
          };
        }

        $scope.formatCoverage = function(parValue) {
          var res = parValue.replace("$","");      
          if(res) {
            var model = formatValues.currency(res);  
            return model;
          } else {
            return '';
          }
        };
        if ($location.$$path == "/index/main") {
          $localStorage.ubication = $location.$$path;
        }else{
        }
        function cancelRenovate(poliza) {
          swal({
            title: "No renovar",
            text: "Motivo:",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
          }, function (inputValue) {
            if (inputValue === false) return false;
            if (inputValue === "") {
              swal.showInputError("Necesita especificar un motivo");
              return false
            }
            var data = {
              reason_ren: inputValue,
              status: 15
            }
            $http.patch(poliza.url, data).then(function(ren) {
                var params = {
                  'model': 1,
                  'event': "PATCH",
                  'associated_id': poliza.id,
                  'identifier': " cancelo la renovación por: "+ren.data.reason_ren+" de la póliza: "+ poliza.poliza_number+"."
                }
                dataFactory.post('send-log/', params).then(function success(response) {
                  
                });
            });        
            if ($location.$$path == "/index/main") {
              $http({
                method: 'GET',
                url: url_.IP + 'chart-renovaciones/'}).then(function(ren) {
                  $localStorage.renovaciones_count = ren.data
                  $state.go('index.main')
                  $state.reload();
              });
            }
            swal("Hecho", "La póliza se ha cerrado y no se vera más en el listado de renovaciones", "success");
            $uibModalInstance.dismiss("No renovada");
          });
        }

        activate();

        function activate() {
          $http({
            method: 'GET',
            url: url_.IP + 'historic-policies/',
            params: {
              actual_id: myPolicy.id
            }
          }).then(function success(response) {
            if(response.data.results.length){              
            vm.policy_history = [];
            vm.policy_history.renovada = [];
            response.data.results.forEach(function function_name(old) {
              if(myPolicy.id != old.base_policy.id){
                vm.policy_history.push(old.base_policy);
              } else if(old.new_policy){
                vm.policy_history.push(old.new_policy);
              }
              if(myPolicy.id == old.base_policy.id){
                vm.policy_history.renovada.push(old.base_policy);
              }
            })
            }
          })
          insuranceService.getVendors()
          .then(function success(data) {
            $scope.vendors = data.data;
            $scope.vendors.forEach(function(vendor) {
              vendor.name = vendor.first_name + ' ' + vendor.last_name;
            });
          },
          function error(error) {
            toaster.ERROR('No pudieron ser cargados eferenciadores')
          })
          $http({
            method: 'GET',
            url: url_.IP+'comments/',
            params: {
              'model': 6,
              'id_model': myPolicy.id
            }
          })
          .then(function(request) {
            $scope.comments_data = request.data.results;
            $scope.comments_config = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            }            
          })
          .catch(function(e) {
            console.log('e', e);
          });      
          $scope.renewal_id = myPolicy.id;
          $scope.view_cartas = true;
          // dataFactory.get('has-view-cartas-permission')
          // .then(function(req) {
          //     if(req.status == 200) {
          //         $scope.view_cartas = req.data;
          //     }
          // });
          forms();
          $http({
            method: 'GET',
            url: url_.IP + 'cartas-by-model',
            params: {
              model: 3
            }
          }).then(function success(response) {
            $scope.cartas = response.data;
          })     
        }

        function viewCarta(poliza, carta) {
          var params = {
              'id_poliza': poliza,
              'id_carta': carta
            }
          dataFactory.get('get-pdf-form/', params)
          .then(function success(response) {
            var file = new Blob([response.data], {type: 'application/pdf'});
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(file);
            }
            else{               
              var fileURL = URL.createObjectURL(file);
              $scope.content = $sce.trustAsResourceUrl(fileURL);
              window.open($scope.content);
            }
            // $scope.pdf = response.data;
            // var par = {
            //     'pdf_name': $scope.pdf.pdf_name
            //   }
            // dataFactory.get('get-pdf', par)
            // .then(function success(response) {
                
            //   })
          })
        }

        function cancel(param) {
          if($uibModalInstance)
            $uibModalInstance.dismiss('cancel', param);
        }

        function forms(){
            vm.forms = myPolicy;
            return vm.forms;
        }

        function mesDiaAnio (parDate) {
          var d = new Date(toDate(parDate));
          var date = (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
          return date;
        }

        function convertDate(inputFormat) {
          function pad(s) { return (s < 10) ? '0' + s : s; }
          var d = new Date(inputFormat);
          var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
          return date;
        }


        $scope.coberturas = myPolicy.coverageInPolicy_policy;

        if(myPolicy.contractor)
          url = myPolicy.contractor.url;

        var recibos = [];
        myPolicy.recibos_poliza.forEach(function(recibo) {
        var item = parseFloat(recibo)
          recibos.push(item);
          // recibos.push(recibo.data.prima_total);
          // TODO: suma de recibos y ordenado de los mismos.
        })

        $scope.recibos = recibos.sort();

        $scope.prima_total = function() {
          return recibos.reduce(getSum);
        }

        function getSum(total, num) {
          return total + num;
        }

          $http({
            method: 'GET',
            url: url
          }).then(
            function success(response) {
              $scope.contratante = response.data;
              if(myPolicy.contractor)
                $scope.addressContratante = response.data.address_contractor[0];
            
            }, function error(response) {
              console.log('error', response);
            });

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

        function renewal(myInsurance){
          $scope.existeRenovacion = false;
          $scope.conteo=0
          $scope.totalp=vm.policy_history ? vm.policy_history.length : 0
          if(vm.policy_history){
            vm.policy_history.forEach(function(old) {
              $scope.conteo=$scope.conteo+1
              if(old.status == 1){
                $scope.existeRenovacion = true
                SweetAlert.swal("Información","La póliza ya tiene una OT de renovación", "info");
                $state.go('index.main');
                clearRenewalDraft();
                return
              }
            });
          }
          if($uibModalInstance && $scope.conteo == $scope.totalp && $scope.existeRenovacion==false){
            $uibModalInstance.close();
            $stateParams.myInsurance = myInsurance
            if(vm.forms.document_type == 1){
              $scope.id_for_new_tab = myInsurance.id
              var name = 'Renovación Póliza';
              var route = 'renovaciones.polizas';
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
              var params = { 'polizaId': myInsurance.id, myInsurance: myInsurance }
              setRenewalDraft(myInsurance);
              $state.go($scope.route_for_new_tab, params);
            } else if (vm.forms.document_type == 3) {
              var params = { 'polizaId': myInsurance.id }
              $scope.id_for_new_tab = myInsurance.id
              var name = 'Renovar Póliza';
              var route = 'colectividades.renewal';
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
              var params = { 'polizaId': myInsurance.id }
              $state.go($scope.route_for_new_tab, params);
            }else if (vm.forms.document_type == 7) {
              // $state.go('fianzas.renovar',{polizaId: vm.forms.id, renovacion : 2});
              var params = {
                polizaId: vm.forms.id,
                renovacion: 2
              };

              $scope.route_for_new_tab = 'fianzas.renovar';
              $scope.id_for_new_tab = myInsurance.id;
              $scope.name_for_new_tab = 'Renovar Fianza';
              $stateParams.renovacion = 2;
              var existe = false;
              appStates.states.forEach(function(state) {
                if (state.route == $scope.route_for_new_tab && state.id == $scope.id_for_new_tab){
                  existe = true;
                }
              });
              if(appStates.states.length > 3){
                SweetAlert.swal("Error", "No se pueden abrir más pestañas.", "error");
              }else{
                if (!existe){
                  appStates.states.push(
                    { 
                      id: $scope.id_for_new_tab, 
                      name: $scope.name_for_new_tab, 
                      renovacion:2,
                      heading: $scope.name_for_new_tab, 
                      route: $scope.route_for_new_tab, 
                      active: true, 
                      isVisible: true, 
                      href: $state.href($scope.route_for_new_tab, params)
                    }
                  );
                  $localStorage.tab_states = appStates.states;
                  $state.go($scope.route_for_new_tab, params)
                }
              }
              $state.go($scope.route_for_new_tab, params)
            }else if (vm.forms.document_type == 8) {
              // $state.go('fianzas.reissue', {polizaId: vm.forms.id});
              var params = { 'polizaId': myInsurance.id}     
              $scope.route_for_new_tab = 'fianzas.reissue';
              $scope.id_for_new_tab = myInsurance.id
              $scope.name_for_new_tab = 'Renovar Fianza'
              var existe = false;
              appStates.states.forEach(function(state) {
                if (state.route == $scope.route_for_new_tab && state.id == $scope.id_for_new_tab){
                  existe = true;
                }
              });
              if(appStates.states.length > 3){
                SweetAlert.swal("Error", "No se pueden abrir más pestañas.", "error");
              }else{
                if (!existe){
                  appStates.states.push(
                    { 
                      id: $scope.id_for_new_tab, 
                      name: $scope.name_for_new_tab, 
                      heading: $scope.name_for_new_tab, 
                      route: $scope.route_for_new_tab, 
                      active: true, 
                      isVisible: true, 
                      href: $state.href($scope.route_for_new_tab, params)
                    }
                  );
                  $localStorage.tab_states = appStates.states;
                  $state.go($scope.route_for_new_tab, params)
                }
              }
              $state.go($scope.route_for_new_tab, params)
            }else if (vm.forms.document_type == 11) {
              // $state.go('flotillas.renewal', {polizaId: vm.forms.id});
              var params = { 'polizaId': myInsurance.id}     
              $scope.route_for_new_tab = 'flotillas.renewal';
              $scope.id_for_new_tab = myInsurance.id
              $scope.name_for_new_tab = 'Renovar Colectividad'
              var existe = false;
              appStates.states.forEach(function(state) {
                if (state.route == $scope.route_for_new_tab && state.id == $scope.id_for_new_tab){
                  existe = true;
                }
              });
              if(appStates.states.length > 3){
                SweetAlert.swal("Error", "No se pueden abrir más pestañas.", "error");
              }else{
                if (!existe){
                  appStates.states.push(
                    { 
                      id: $scope.id_for_new_tab, 
                      name: $scope.name_for_new_tab, 
                      heading: $scope.name_for_new_tab, 
                      route: $scope.route_for_new_tab, 
                      active: true, 
                      isVisible: true, 
                      href: $state.href($scope.route_for_new_tab, params)
                    }
                  );
                  $localStorage.tab_states = appStates.states;
                  $state.go($scope.route_for_new_tab, params)
                }
              }
              $state.go($scope.route_for_new_tab, params)
            }else if (vm.forms.document_type == 12) {
              SweetAlert.swal('Advertencia', 'Las pólizas de colectividad solo se pueden renovar mediante layout.', 'warning');
              // $state.go('flotillas.renewal', {polizaId: myInsurance.caratula});
            }
          }else{
            $state.go('index.main');
          }
        }

      $scope.show_button_save_sum = false;
      $scope.show_button_save_ded = false;

      $scope.demo = function(param) {
        var model = formatValues.currency(param);  
        return model;

      };

      $scope.saveSum = function (parValue, parCoverage) {
      
        var obj = {
          sum_insured : parValue,
          default : false,
          coverage_sum: parCoverage.url
        };

        coverageService.createSumInsured(obj)
        .then(function(req) {
          if(req.id) {
            $scope.result_ = false;
            parCoverage.sums_coverage.push(req);
          }
        });

      };

      $scope.saveDed = function (parValue, parCoverage) {
      
        var obj = {
          deductible : parValue,
          default : false,
          coverage_deductible: parCoverage.url
        };

        coverageService.createDeducible(obj)
        .then(function(req) {
          if(req.id) {
            $scope.result_ded = false;
            parCoverage.deductible_coverage.push(req);
          }
        });

      };

    }
  })();