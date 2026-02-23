(function() {
    'use strict';

    angular.module('inspinia')
        .controller('TareasModalCtrl', TareasModalCtrl);

    TareasModalCtrl.$inject = ['$http', '$scope', '$uibModal', '$uibModalInstance', 'dataFactory', 'task', 'datesFactory', 
                               'SweetAlert', 'MESSAGES', 'data', 'associated', 'route', 'modelo', '$state','$sessionStorage', 
                               'FileUploader', 'url', 'receipt', 'appStates', '$localStorage','$location'];

    function TareasModalCtrl($http, $scope, $uibModal, $uibModalInstance, dataFactory, task, datesFactory, SweetAlert, MESSAGES, 
                             data, associated, route, modelo, $state,$sessionStorage, FileUploader, url, receipt, appStates,
                             $localStorage,$location) {

        /* Información de usuario */
        var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);

        $('.datepicker-me input').datepicker();

        $('.js-example-basic-multiple').select2();
        $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
        $.fn.datepicker.defaults.startView = 0;
        $.fn.datepicker.defaults.autoclose = true;
        $.fn.datepicker.defaults.language = 'es';
        $scope.historic_email = false;
        

        $scope.vm = this;
        var vm = this;

        vm.email_send_historic = '';
        $scope.involved = []

        $scope.priorities = [{
            id: 1,
            name: 'Alta'
          }, {
            id: 2,
            name: 'Media'
          }, {
            id: 3,
            name: 'Baja'
          }]

        $scope.concepts = [{
            id: 1,
            name: 'Cotización'
          }, {
            id: 2,
            name: 'Emisión'
          }, {
            id: 3,
            name: 'Endoso A'
          }, {
            id: 4,
            name: 'Corrección'
          }, {
            id: 5,
            name: 'Cancelación'
          }, {
            id: 6,
            name: 'Renovación'
          }, {
            id: 7,
            name: 'Otro'
          }, {
            id: 8,
            name: 'Reembolso'
          }, {
            id: 9,
            name: 'Programación de cirugía'
          }, {
            id: 10,
            name: 'Endoso B'
          }, {
            id: 11,
            name: 'Endoso D'
          },{
            id: 12,
            name: 'Reconocimiento de antigüedad'
          },{
            id:13,
            name:'Carta de antigüedad'
          }]

        vm.showRecordatorios = showRecordatorios
        function showRecordatorios() {
          vm.infoFlag = false;
          vm.recordatoriosFlag = true;
        }
        $scope.createRecordatorio = function(registroSelected, tipo) {
          $uibModalInstance.close();
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
                return $scope.vm.form;
              }
            },
          backdrop: 'static', /* this prevent user interaction with the background */
          keyboard: false
          });
          modalInstance.result.then(function(receipt) {
            activate()
          });
        }
        angular.element(document).ready(function(){
          $('.js-example-basic-multiple').select2();
        });
        activate();

        function activate() {

          if (($location.path().indexOf('info') != -1) || ($location.path().indexOf('polizas') != -1) || ($location.path().indexOf('endoso') != -1) ||
            ($location.path().indexOf('flotillas') != -1) || ($location.path().indexOf('info') != -1) || ($location.path().indexOf('cotizacion') != -1)) {
            $scope.desdeOT = true;
          }else{
            $scope.desdeOT = false;
          }
          $scope.emails_users = []
          vm.accesos = $sessionStorage.permisos
          if (vm.accesos) {
              vm.accesos.forEach(function(perm){
                if(perm.model_name == 'Pólizas'){
                  vm.acceso_polizas = perm
                  vm.acceso_polizas.permissions.forEach(function(acc){
                    if (acc.permission_name == 'Administrar pólizas') {
                      if (acc.checked == true) {
                        vm.acceso_adm_pol = true
                      }else{
                        vm.acceso_adm_pol = false
                      }
                    }else if (acc.permission_name == 'Ver pólizas') {
                      if (acc.checked == true) {
                        vm.acceso_ver_pol = true
                      }else{
                        vm.acceso_ver_pol = false
                      }
                    }else if (acc.permission_name == 'Cancelar pólizas') {
                      if (acc.checked == true) {
                        vm.acceso_canc_pol = true
                      }else{
                        vm.acceso_canc_pol = false
                      }
                    }else if (acc.permission_name == 'Eliminar pólizas') {
                      if (acc.checked == true) {
                        vm.acceso_elim_pol = true
                      }else{
                        vm.acceso_elim_pol = false
                      }
                    }
                  })
                }else if (perm.model_name == 'Reportes') {
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
                }else if (perm.model_name == 'Contratantes y grupos') {
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
                }else if (perm.model_name == 'Siniestros') {
                  vm.acceso_sin = perm;
                  vm.acceso_sin.permissions.forEach(function(acc) {
                    if (acc.permission_name == 'Administrar siniestros') {
                      if (acc.checked == true) {
                        vm.acceso_adm_sin = true
                      }else{
                        vm.acceso_adm_sin = false
                      }
                    }
                  })
                }else if (perm.model_name == 'Mensajeria') {
                  vm.acceso_mns = perm;
                  vm.acceso_mns.permissions.forEach(function(acc) {
                    if (acc.permission_name == 'Mensajeria') {
                      if (acc.checked == true) {
                        vm.acceso_mns = true
                      }else{
                        vm.acceso_mns = false
                      }
                    }
                  })
                }else if (perm.model_name == 'Formatos') {
                  vm.acceso_form = perm;
                  vm.acceso_form.permissions.forEach(function(acc) {
                    if (acc.permission_name == 'Formatos') {
                      if (acc.checked == true) {
                        vm.acceso_form = true
                      }else{
                        vm.acceso_form = false
                      }
                    }
                  })
                }else if (perm.model_name == 'Correos electronicos') {
                  vm.acceso_correo = perm;
                  vm.acceso_correo.permissions.forEach(function(acc) {
                    if (acc.permission_name == 'Correos') {
                      if (acc.checked == true) {
                        vm.acceso_cor = true
                      }else{
                        vm.acceso_cor = false
                      }
                    }
                  })
                }else if(perm.model_name == 'Cobranza'){
                  vm.acceso_cob = perm
                  vm.acceso_cob.permissions.forEach(function(acc){              
                    if (acc.permission_name == 'Ver cobranza') {
                      if (acc.checked == true) {
                        vm.acceso_ver_cob = true
                      }else{
                        vm.acceso_ver_cob = false
                      }
                    }else if (acc.permission_name == 'Despagar recibos') {
                      if (acc.checked == true) {
                        vm.acceso_desp_cob = true
                      }else{
                        vm.acceso_desp_cob = false
                      }
                    }else if (acc.permission_name == 'Pagar y prorrogar') {
                      if (acc.checked == true) {
                        vm.acceso_pag_cob = true
                      }else{
                        vm.acceso_pag_cob = false
                      }
                    }else if (acc.permission_name == 'Desconciliación de recibos') {
                      if (acc.checked == true) {
                        vm.acceso_desco_cob = true
                      }else{
                        vm.acceso_desco_cob = false
                      }
                    }else if (acc.permission_name == 'Conciliar recibos') {
                      if (acc.checked == true) {
                        vm.acceso_conc_cob = true
                      }else{
                        vm.acceso_conc_cob = false
                      }
                    }else if (acc.permission_name == 'Liquidar recibos') {
                      if (acc.checked == true) {
                        vm.acceso_liq_cob = true
                      }else{
                        vm.acceso_liq_cob = false
                      }
                    }
                  })
                }else if(perm.model_name == 'Referenciadores'){
                  vm.acceso_ref = perm
                  vm.acceso_ref.permissions.forEach(function(acc){
                    if (acc.permission_name == 'Administrar referenciadores') {
                      if (acc.checked == true) {
                        vm.acceso_adm_ref = true
                      }else{
                        vm.acceso_adm_ref = false
                      }
                    }else if (acc.permission_name == 'Pagar a referenciadores') {
                      if (acc.checked == true) {
                        vm.acceso_pag_ref = true
                      }else{
                        vm.acceso_pag_ref = false
                      }
                    }else if (acc.permission_name == 'Cambiar refrenciador en pólizas') {
                      if (acc.checked == true) {
                        vm.acceso_chg_ref = true
                      }else{
                        vm.acceso_chg_ref = false
                      }
                    }
                  })
                }else if(perm.model_name == 'Fianzas'){
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
              })
          }
          if(task){
              $scope.ticket1= angular.copy(task);
              $scope.vm.form = angular.copy(task);
              $scope.original_assigned = $scope.vm.form.assigned;
              if(!$scope.original_assigned.url){
                $http.get(url.IP + 'usuarios/'+ $scope.original_assigned.id).then(function(response){
                  $scope.original_assigned = response.data;
                  $scope.vm.form.assigned = response.data;
                });
              }
              $scope.title = "Tarea";
              $scope.vm.form.compromiso = datesFactory.convertDate($scope.vm.form.date);
              $scope.vm.form.priority = $scope.priorities[$scope.vm.form.priority - 1];
              $scope.vm.form.concept = $scope.concepts[$scope.vm.form.concept - 1];
              var selected_user = [];
              if(task.model==7){
                dataFactory.get('contractor/'+task.associated)
                .then(function(request) {
                  $scope.contractorNew=request.data
                })
                .catch(function(e) {
                  console.log('e', e);
                });
              }
              $.each(task.involved_task, function(i,e){
                 selected_user.push(e.person.id);
              });
              $scope.selected_user = selected_user;
              var params = {
                  'model': 22,
                  'id_model': task.id
                }
              dataFactory.get('comments/', params)
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

              $http.get(url.IP + 'ticket/'+ task.id +'/archivos/').then(function(response) {
                  if(response.status === 200) {
                    vm.files = response.data.results;
                    $scope.files = response.data.results;
                    $scope.show_files_policy = true;
                  } else if(response.status === 403) {
                    $scope.show_files_policy = false; 
                  }
                });

              vm.polizaId = task.id;
          } else if(data){
              $scope.vm.form = {};
              $scope.title = "Crear nueva tarea"
              $scope.vm.form.title = data
              $scope.vm.form.route = route;
          } else {
              $scope.task = {}
              $scope.title = "Crear nueva tarea"
          }
          $http.post(url.IP+'emailsUsers').then(function(response) {                         
            $scope.emails_users = response.data.emails
            $scope.historic_email = false;
          });
          dataFactory.get('usuarios/')
          .then(function(data){
            $scope.users = data.data.results;
            if ($scope.selected_user){
              var selected_user = []
              $.each(data.data.results, function(i,e){
                if($scope.selected_user.includes(e.id)){
                  selected_user.push(e);
                }
              });
                $scope.select_user =  selected_user;
              }
          });

          $scope.track_task_id = '';
          $scope.track_task_entity_number = ''
          switch(vm.form.model){
            case 1:
              $scope.origin_task = 'póliza';
              $scope.track_task_id = '';
              break;
            case 2:
              $scope.origin_task = 'endoso';
              $http.get(url.IP + 'endorsement-single/'+vm.form.associated + '/').then(function(responseEndoso){
                if (responseEndoso.data['number_endorsement'] != ''){
                  $scope.track_task_entity_number = 'Número de endoso: '+ responseEndoso.data['number_endorsement'];
                }
                if (responseEndoso.data['numero_poliza'] != ''){
                  $scope.track_task_entity_number = $scope.track_task_entity_number + ' - ' +'Número de póliza: '+ responseEndoso.data['numero_poliza'];
                }
                $scope.track_task_id = 'Folio de endoso: '+ responseEndoso.data['internal_number'];
              });
              break;
            case 3:
              $scope.origin_task = 'póliza';
              $scope.track_task_id = '';
              break;
            case 4:
              $scope.origin_task = 'póliza';
              $scope.track_task_id = '';
              break;
            case 5:
              $scope.origin_task = 'póliza';
              $scope.track_task_id = '';
              break;
            case 6:
              $scope.origin_task = 'siniestro';
              $scope.track_task_id = '';
              break;
            case 7:
              $scope.origin_task = 'contratante';
              $scope.track_task_id = '';
              break;
            case 8:
              $scope.origin_task = 'fianza';
              $scope.track_task_id = '';
              break;
            case 9:
              $scope.origin_task = 'endoso';
              $scope.track_task_id = '';
              break;
            case 18:
              $scope.origin_task = 'Póliza de grupo';
              $scope.track_task_id = '';
              break;
            case 28:
              $scope.origin_task = 'colectividad';
              $scope.track_task_id = '';
              break;
            case 30:
              $scope.origin_task = 'Cotización';
              $scope.track_task_id = '';
              break;
            default:
            break;
          };

        }
        
        $scope.close = function () {
          $uibModalInstance.close();
        };
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
          $uibModalInstance.close();
          $localStorage.tab_states = appStates.states;
          $state.go($scope.route_for_new_tab, params); 
        }
        $scope.selectUser = function (obj){
            $scope.involved = [];
            obj.forEach(function(child) {
                child.person = child.url;
            })
            $scope.involved = obj;
        }

        $scope.saveTask = function (){
            var data_to_send = vm.form; 
            data_to_send.involved_task = $scope.involved
            data_to_send.assigned = vm.form.assigned.url;
            data_to_send.priority = vm.form.priority.id;
            data_to_send.concept = vm.form.concept ? vm.form.concept.id : 7;
            data_to_send.date = new Date(datesFactory.toDate(vm.form.compromiso));
            data_to_send.associated = associated;
            data_to_send.route = route;
            data_to_send.model = modelo;
            dataFactory.post('save-ticket/', data_to_send).
            then(function success(response) {
              if(response.status === 200 || response.status === 201){
                var params = {
                  'model': 22,
                  'event': "POST",
                  'associated_id': response.data.id,
                  'identifier': "creó la tarea."
                }

                dataFactory.post('send-log/', params).then(function success(response) {
                  
                });

                if(receipt){
                  var params = {
                    'model': 4,
                    'event': "POST",
                    'associated_id': receipt,
                    'identifier': "creó una tarea con este recibo."
                  }

                  dataFactory.post('send-log/', params).then(function success(response) {
                    
                  });
                }

                uploadFiles(response.data);
                SweetAlert.swal("¡Hecho!", MESSAGES.OK.SAVETICKET, "success")
                $uibModalInstance.close();
              }
            })
        }

        $scope.updateTask = function (){
            $scope.name_assiged = vm.form.assigned.first_name + ' '+ vm.form.assigned.last_name;
            $scope.original_assigned_name = $scope.original_assigned.first_name + ' ' + $scope.original_assigned.last_name ;
            vm.form.involved_task = $scope.involved;
            vm.form.assigned = vm.form.assigned.id;
            vm.form.priority = vm.form.priority.id;
            vm.form.concept = vm.form.concept ? vm.form.concept.id : 7;;
            vm.form.route = vm.form.route;
            vm.form.owner = vm.form.owner.url;
            vm.form.model = vm.form.model;
            vm.form.date = new Date(datesFactory.toDate(vm.form.compromiso));
            if(vm.form.closedBy){
              vm.form.closedBy = vm.form.closedBy.url;
            }
            $scope.changeAssigned = false;
            if (vm.form.assigned != $scope.original_assigned.url) {
              $scope.changeAssigned = true;
            }
            delete vm.form.archived;

            $http.patch(vm.form.url, vm.form).
            then(function success(response) {
              if(response.status === 200 || response.status === 201){
                var involved_list =[]
                response.data.involved_task.forEach(function(inv){
                  var url= inv.person;
                  var id_person = inv.id;
                  $http.get(url).then(function(response) {
                    if (response.status === 200){
                      involved_list.push({"id":id_person, "person":response.data});
                    }
                  }
                    );
                });
                task.involved_task = involved_list;
                var params = {
                  'model': 22,
                  'event': "POST",
                  'associated_id': response.data.id,
                  'identifier': "actualizó la tarea."
                }

                dataFactory.post('send-log/', params).then(function success(response) {
                  
                });
                if ($scope.changeAssigned) {
                  var params = {
                    'model': 22,
                    'event': "PATCH",
                    'associated_id': response.data.id,
                    'identifier': "actualizó la tarea; reasignándola de "+ $scope.original_assigned_name + " a "+ $scope.name_assiged+'.'
                  }

                  dataFactory.post('send-log/', params).then(function success(response) {
                    console.log('----------response log-----reasignación----',response)
                  });
                }
                uploadFiles(response.data);

                $uibModalInstance.close({'response':response});
                SweetAlert.swal("¡Listo!", MESSAGES.INFO.QUOTATIONCHANGE, "success");
                $state.reload();
              }
            });
        }

        $scope.goToRegis = function() {
          var params = {}
          if(vm.form.model == 1){
            if (vm.acceso_ver_ot) {
              var name = 'Información póliza';
              var route = 'polizas.info';
              params = {
                polizaId: vm.form.associated
              }
            }
          } else if(vm.form.model == 2){
            if (vm.acceso_ver_ot) {
              var name = 'Información endoso';
              var route = 'endorsement.info';
            }
          } else if(vm.form.model == 3 || vm.form.model == 4){
            if (vm.acceso_ver_pol) {
              var name = 'Información póliza';
              var route = 'polizas.info';
            }
          } else if(vm.form.model == 5){
            if (vm.acceso_ver_pol) {
              var name = 'Información póliza';
              var route = 'polizas.info';
            }
          } else if(vm.form.model == 7){
            if (vm.acceso_ver_cont) {
              if($scope.contractorNew.type_person == 1 || $scope.contractorNew.type_person == 'Física'){
                var name = 'Información contratante';
                var route = 'contratantes.info';
                params={
                  type: 'fisicas',
                  contratanteId: $scope.contractorNew.id
                }
              } else if($scope.contractorNew.type_person == 2 || $scope.contractorNew.type_person == 'Moral'){
                var name = 'Información contratante';
                var route = 'contratantes.info';
                params={
                  type: 'morales',
                  contratanteId: $scope.contractorNew.id
                }
              }
            }
          } else if(vm.form.model == 8){
            if (vm.acceso_ver_fia) {
              var name = 'Información fianza';
              var route = 'fianzas.info';
            }
          } else if(vm.form.model == 9){
            if (vm.acceso_ver_ot) {
              var name = 'Información endoso';
              var route = 'endorsement.info';
            }
          }else if(vm.form.model == 6){
            var name = 'Información siniestro';
            var route = 'siniestros.info';
          }else if(vm.form.model == 18){
            var name = 'Información colectividad';
            var route = 'colectividades.info';
          }else if(vm.form.model == 28){
            var name = 'Información flotilla';
            var route = 'flotillas.info';
          }else if(vm.form.model == 30){
            var name = 'Información Cotización';
            var route = 'cotizacion.info';
            var params = {id: vm.form.associated}
          }
          
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
              href: $state.href($scope.route_for_new_tab,params),
            }
          }
          $localStorage.tab_states = appStates.states;
          $localStorage.tab_index = $localStorage.tab_states.length -1;
          // Si esto se va a modificar, analizar con backend porque estan ligados directamente a los modelos 
          // de creación de rutas para las tareas desde la bitacora
            if(vm.form.model == 1){
                if (vm.acceso_ver_ot) {
                    $state.go('polizas.info', {polizaId: vm.form.associated})
                    $scope.close();
                }
            } else if(vm.form.model == 2){
                if (vm.acceso_ver_ot) {
                    $state.go('endorsement.info', {endosoId: vm.form.associated})
                    $scope.close();
                }
            } else if(vm.form.model == 3 || vm.form.model == 4){
                if (vm.acceso_ver_pol) {
                    $state.go('polizas.info', {polizaId: vm.form.associated})
                    $scope.close();
                }
            } else if(vm.form.model == 5){
                if (vm.acceso_ver_pol) {
                    $state.go('polizas.info', {polizaId: vm.form.associated})
                    $scope.close();
                }
            } else if(vm.form.model == 7){
                if (vm.acceso_ver_cont) {
                  if($scope.contractorNew.type_person == 1){
                    $state.go('contratantes.info', {
                        type: 'fisicas',
                        contratanteId: $scope.contractorNew.id
                    });
                    $scope.close();
                  } else if($scope.contractorNew.type_person == 2){
                    $state.go('contratantes.info', {
                        type: 'morales',
                        contratanteId: $scope.contractorNew.id
                    });
                    $scope.close();
                  }
              }
          } else if(vm.form.model == 8){
              if (vm.acceso_ver_fia) {
                  $state.go('fianzas.info', {fianzaId: vm.form.associated})
                  $scope.close();
              }
          } else if(vm.form.model == 9){
              if (vm.acceso_ver_ot) {
                  $state.go('endorsement.info', {endosoId: vm.form.associated})
                  $scope.close();
              }
          }else if(vm.form.model == 6){
            $state.go('siniestros.info', {siniestroId: vm.form.associated})
            $scope.close();
          }else if(vm.form.model == 18){
            $state.go('colectividades.info', {polizaId: vm.form.associated})
            $scope.close();
          }else if(vm.form.model == 28){
            $state.go('flotillas.info', {polizaId: vm.form.associated})
            $scope.close();
          }else if(vm.form.model == 30){
            $state.go('cotizacion.info', {polizaId: vm.form.associated})
            $scope.close();
          }
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        // Change User
        vm.emails_selected = []
        $scope.changeEmailSendH = function(x,y) {
          vm.emails_selected = [];
          x.forEach(function(r) {
              vm.emails_selected.push(r); 
          })
        };
        $scope.selectManualEmails = function(x,y) {
          vm.emails_selected_manual = [];          
          x.forEach(function(r) {
            $scope.invalidEmail =r;
            vm.emails_selected_manual.push(r); 
          })
        };

        $scope.send_historic_email = function() {          
          if($scope.historic_email){
            $scope.historic_email = false;
          }
          else{
            $scope.historic_email = true;
          }
        }
        // Send historic task to email
        $scope.send_historic = function(obj) {
          vm.emails_manuales = []
          $scope.validate_email = false;
          $scope.invalidEmail = ''
          if ($scope.email_x == 2 || $scope.email_x == '2') {
            if (vm.emails_selected) {
              if (vm.emails_selected.length > 0) {
                $scope.validate_email = true;
              }else{
                $scope.validate_email = false;
              }
            }else{
              $scope.validate_email = false;
            }
          }else if ($scope.email_x == 1 || $scope.email_x == '1') {
            vm.emails_selected = [];
            $scope.validate_email = true
            vm.email_tags = vm.emails_selected_manual
            if (vm.email_tags) {
              vm.email_tags.forEach(function(email) {
                if(!validateEmail(email)){
                  $scope.invalidEmail = email;
                  SweetAlert.swal("Correo inválido",MESSAGES.ERROR.REVIEWEMAIL+' '+email, "error");
                  $scope.validate_email = false
                  return
                }else{
                  vm.emails_manuales.push(email)
                }
                
              })
            }
          }
          if ($scope.validate_email) {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            $http.post(url.IP+'send-historic-email',{'email':vm.emails_manuales, 'id_tarea':obj.id,'type_email': $scope.email_x,'emails_selected':vm.emails_selected}).then(function(response) {
              if (response.data.status == 'send') {
                SweetAlert.swal("Enviado",MESSAGES.OK.HISTSENDEMAIL, "success");
                vm.email_send_historic = ''
                l.stop();
                $scope.historic_email = false;
              }else{
                SweetAlert.swal("No Enviado",MESSAGES.ERROR.HISTERRORSENDEMAIL, "error");
                l.stop();
                $scope.historic_email = false;
              }
              
            });
          }else{
            SweetAlert.swal("Correo inválido",MESSAGES.ERROR.REVIEWEMAIL+' '+$scope.invalidEmail,"error");
          }   
                 
        }
        
        /* Uploader files */
        
        $scope.countFile = 0;
        $scope.okFile = 0;

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

        // ALERTA SUCCES UPLOADFILES
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          $scope.okFile++;
          if($scope.okFile == $scope.countFile){
          }
        };

        // ALERTA ERROR UPLOADFILES
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          if(response.status == 413){
            SweetAlert.swal("ERROR", MESSAGES.ERROR.FILETOOLARGE, "error");
          } else {
            SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
          }
        };

        uploader.onAfterAddingFile = function(fileItem) {
          fileItem.formData.push({
            arch: fileItem._file,
            nombre: fileItem.file.name
          });

          if(fileItem){
            $scope.countFile++;
          }
        };

        uploader.onBeforeUploadItem = function(item) {
            if (item.ramo == undefined){
                item.ramo = 2;
            }
            item.url = $scope.userInfo.url;
            item.formData[0].nombre = item.file.name;
            item.alias = '';
            item.formData[0].owner = $scope.userInfo.id;
            item.formData[0].ramo = item.ramo;
        };

        function uploadFiles(ticketId) {
          console.log(ticketId);
          $scope.userInfo = {
            id: ticketId.id
        };
          $scope.userInfo.url = url.IP + 'ticket/' + ticketId.id+ '/archivos/';
          $scope.uploader.uploadAll();
        }

        $scope.changeSensible = function(sensible, index) {
            uploader.queue[index].formData[0].sensible = sensible;
            console.log(uploader.queue);
        }

        $scope.saveFile = function(file) {
          $http.patch(file.url,{'nombre':file.nombre, 'sensible':file.sensible});
        }
    }
})();
