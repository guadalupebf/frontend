(function() {
    'use strict';

    angular.module('inspinia')
        .controller('FianzasReclamacionesCtrl', FianzasReclamacionesCtrl);

    FianzasReclamacionesCtrl.$inject = ['appStates','$state', '$sessionStorage', '$scope', 'FileUploader', 'dataFactory', '$http', 'datesFactory', 'SweetAlert', 'url','$timeout','MESSAGES', '$localStorage'];

    function FianzasReclamacionesCtrl(appStates, $state, $sessionStorage, $scope, FileUploader, dataFactory, $http, datesFactory, SweetAlert, url, $timeout, MESSAGES, $localStorage) {
        var vm = this;

        $scope.types_options = [{
          label: 'Aviso previo',
          id: 1
        },{
          label: 'Reclamo Formal',
          id: 2
        },{
          label: 'Reconsideración',
          id: 3
        }]

        $scope.status_options = [{
          label: 'Presentación',
          id: 1
        },{
          label: 'En integración',
          id: 2
        },{
          label: 'Reclamo Formal',
          id: 3
        },{
          label: 'Respuesta Afianzadora',
          id: 4
        },{
          label: 'Respuesta Cliente',
          id: 5
        },{
          label: 'Reconsideración',
          id: 6
        },{
          label: 'Rechazada',
          id: 7
        },{
          label: 'Pagada',
          id: 8
        },{
          label: 'Desistimiento',
          id: 9
        },{
          label: 'Recuperación',
          id: 10
        },{
          label: 'Cerrada',
          id: 11
        }]
        vm.contacts =[]
        vm.form = {
          presentacion: datesFactory.convertDate(new Date())
        }

        $scope.infoUser = $sessionStorage.infoUser;

        /* Información de usuario */
        var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);
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
            }else if(perm.model_name == 'Archivos'){
              vm.acceso_files = perm
              vm.acceso_files.permissions.forEach(function(acc){
                if (acc.permission_name == 'Administrar archivos sensibles') {
                  if (acc.checked == true) {
                    vm.permiso_archivos = true
                  }else{
                    vm.permiso_archivos = false
                  }
                }
              })
            }
          })
        }
        /* Uploader files */
        $scope.userInfo = {
            id: 0
        };
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

        activate();

        function activate() {
          vm.selected_affect = $localStorage['save_create_reclamacion'] ? $localStorage['save_create_reclamacion']['selected_affect'] : '';
          vm.form.number = $localStorage['save_create_reclamacion'] ? $localStorage['save_create_reclamacion']['number'] : '';
          vm.form.claim_type = $localStorage['save_create_reclamacion'] ? $localStorage['save_create_reclamacion']['claim_type'] : '';
          vm.form.status = $localStorage['save_create_reclamacion'] ? $localStorage['save_create_reclamacion']['status'] : '';
          vm.form.reason = $localStorage['save_create_reclamacion'] ? $localStorage['save_create_reclamacion']['reason'] : '';
          vm.form.observations = $localStorage['save_create_reclamacion'] ? $localStorage['save_create_reclamacion']['observations'] : '';
          if(vm.selected_affect){
            getInfoFianza(vm.selected_affect);
          }
        }

        if ('save_create_reclamacion' in $localStorage){}
        else{
          $localStorage['save_create_reclamacion'] = {};
        }

        $scope.saveLocalstorange = function(){
          $localStorage['save_create_reclamacion']['selected_affect'] =  vm.selected_affect ? vm.selected_affect : '';
          $localStorage['save_create_reclamacion']['number'] =  vm.form.number ? vm.form.number : '';
          $localStorage['save_create_reclamacion']['claim_type'] =  vm.form.claim_type ? vm.form.claim_type : '';
          $localStorage['save_create_reclamacion']['status'] =  vm.form.status ? vm.form.status : '';
          $localStorage['save_create_reclamacion']['reason'] =  vm.form.reason ? vm.form.reason : '';
          $localStorage['save_create_reclamacion']['observations'] =  vm.form.observations ? vm.form.observations : '';
        }

        $scope.matchBeneficiares = function(word) {
          var source = []
          if(word){
            if(word.length >= 3){
              // if($scope.infoUser.staff && !$scope.infoUser.superuser){
              //   $scope.show_bens = 'v2/fianzas/bens-match/';
              $scope.show_bens = 'bens-match/';
              dataFactory.post($scope.show_bens, {matchWord: word})
              .then(function success(response) {
                if (response.data == []){
                  $scope.bens_data = [];
                }
                $scope.bens = response.data;
                if ($scope.bens.length > 0) {
                  var fianza = ''
                  $scope.fianza_ben = {}
                  
                  $scope.bens.forEach(function(item) {
                      if(item.first_name){
                        if (item.fianza != null) {
                          fianza = item.fianza
                        }else{
                          fianza = ''
                        }
                        var obj = {
                         label: item.full_name + ' - Fianza: ' + item.poliza_number,
                         value: item.poliza,
                         id_fianza: item.poliza,
                         url: item.poliza
                        };
                        // if (item.poliza_many.length >0) {
                        //   // dataFactory.get(item.poliza_many[0])
                        //   $http.get(item.poliza_many[0])
                        //   .then(function success(responseF) {
                        //     $scope.fianza_ben = responseF.data;
                        //     fianza = $scope.fianza_ben.poliza_number
                        //     obj.value = responseF.data.id;
                        //     obj.id_fianza = responseF.data.id;
                        //     obj.label= item.first_name + ' ' + item.last_name + ' ' + item.second_last_name + ' - Fianza: ' + responseF.data.poliza_number;
                        //   })
                        // }else if (item.poliza) {
                        //   // dataFactory.get(item.poliza_many[0])
                        //   $http.get(item.poliza)
                        //   .then(function success(responseF) {
                        //     $scope.fianza_ben = responseF.data;
                        //     fianza = $scope.fianza_ben.poliza_number
                        //     obj.value = responseF.data.id;
                        //     obj.id_fianza = responseF.data.id;
                        //     obj.label= item.first_name + ' ' + item.last_name + ' ' + item.second_last_name + ' - Fianza: ' + responseF.data.poliza_number;
                        //   })
                        // }
                        
                      } else {
                        if (item.fianza != null) {
                          fianza = item.fianza
                        }else{
                          fianza = ''
                        }
                        var obj = {
                         label: item.j_name + '- Fianza: ' + fianza,
                         value: $scope.fianza_ben.id,
                         id_fianza: $scope.fianza_ben.id,
                         url: item.url
                        };
                        if (item && item.poliza_many && item.poliza_many.length >0) {
                          $http.get(item.poliza_many[0])
                          .then(function success(responseF) {
                            $scope.fianza_ben = responseF.data;
                            fianza = $scope.fianza_ben.poliza_number;
                            obj.value = responseF.data.id;
                            obj.id_fianza = responseF.data.id;
                            obj.label= (item.first_name ? item.first_name + ' ' + item.last_name + ' ' + item.second_last_name : item.full_name) + ' - Fianza: ' + responseF.data.poliza_number;
                          })
                        }else if (item.poliza) {                          
                          try{
                            $http.get(item.poliza)
                            .then(function success(responseF) {
                              $scope.fianza_ben = responseF.data;
                              fianza = $scope.fianza_ben.poliza_number
                              obj.value = responseF.data.id;
                              obj.id_fianza = responseF.data.id;
                              obj.label= (item.first_name ? item.first_name + ' ' + item.last_name + ' ' + item.second_last_name : item.full_name) + ' - Fianza: ' + responseF.data.poliza_number;
                            })
                          }catch(i){
                            dataFactory.get('polizas/'+item.poliza)
                            .then(function success(polizaData){
                              if (polizaData) {                                
                                  $scope.fianza_ben = polizaData.data;
                                  fianza = $scope.fianza_ben.poliza_number;
                                  obj.value = polizaData.data.id;
                                  obj.id_fianza = polizaData.data.id;
                                  if (item.first_name) {
                                      var fullName = '';
                                      if (item.first_name) fullName += item.first_name + ' ';
                                      if (item.last_name) fullName += item.last_name + ' ';
                                      if (item.second_last_name) fullName += item.second_last_name + ' ';
                                      // Si no hay apellidos, usa full_name
                                      if ((!item.last_name && !item.second_last_name) && item.full_name) {
                                          fullName = item.full_name + ' ';
                                      }
                                      obj.label = fullName.trim() + ' - Fianza: ' + polizaData.data.poliza_number  +
                                          ' - Vigencia: ' +
                                          datesFactory.convertDate(polizaData.data.start_of_validity) +
                                          ' ' +
                                          datesFactory.convertDate(polizaData.data.end_of_validity);;
                                  } else {
                                      var fn =item.full_name ? item.full_name+' - ' : ''
                                      obj.label = fn +
                                          polizaData.data.poliza_number +
                                          ' - Vigencia: ' +
                                          datesFactory.convertDate(polizaData.data.start_of_validity) +
                                          ' ' +
                                          datesFactory.convertDate(polizaData.data.end_of_validity);
                                  }
                              }
                            })
                            .catch(function (error) {
                              console.log('Error - claves-by-provider - catch', error);
                            });
                          }
                        }
                        
                      }
                      
                      source.push(obj);
                  });
                  $scope.bens_data = source;
                }else{     
                  // SweetAlert.swal('Advertencia','Intente nuevamente','warning')            
                  // $scope.bens_data = [];
                }
              })
            } else {
              $scope.bens_data = [];
            }
          }
        }

        vm.getInfoFianza = getInfoFianza;

        function getInfoFianza(parInfo) {
          $scope.benefited = parInfo.url;
          dataFactory.get('leer-fianzas-info/' + parInfo.value)
          .then(function success(response) {
            $scope.fianza = response.data;
          })
        }

        $scope.getInfo = function(parInfo) {
          $scope.benefited = parInfo.url;
          dataFactory.get('leer-fianzas-info/' + parInfo.value)
          .then(function success(response) {
            $scope.fianza = response.data;
          })
        }

        $scope.addContact = function() {
            $scope.count_contact = false;
            var contact = {
                first_name: '',
                phone: '',
                email: '',
                references: ''
            }
            vm.contacts.push(contact);        
        }
        $scope.saveClaim = function() {
          vm.form.introduction_date = new Date(datesFactory.toDate(vm.form.presentacion));
          vm.form.poliza = $scope.fianza.url;
          vm.form.benefited = $scope.benefited;
          dataFactory.post('claims/', vm.form)
          .then(function success(response) {
            console.log(response)
            if(response.status == 200 || response.status == 201){
              $scope.reclamacion = response.data;
              var params = {
                'model': 13,
                'event': "POST",
                'associated_id': $scope.fianza.id,
                'identifier': "creó la reclamación No." + response.data.number + "."
              }
              dataFactory.post('send-log/', params).then(function success(response) {

              });
              SweetAlert.swal("Hecho", "Se ha creado la reclamación", "success");
              $scope.countFile = $scope.uploader.queue.length;
              if ($scope.uploader.queue.length == 0) {  
                $localStorage.save_create_reclamacion = {};

                var name = 'Reclamación Fianza';
                var route = 'fianzas.reclinf';

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

                $state.go($scope.route_for_new_tab, {claimId: response.data.id});
              }else{
                uploadFiles(response.data.id);
              }
            }
          })
        }

        /* Alerta success uploadfiles */
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          $scope.okFile++;
          if($scope.okFile == $scope.countFile){
            var name = 'Reclamación Fianza';
            var route = 'fianzas.reclinf';

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
            $state.go($scope.route_for_new_tab, {claimId: $scope.reclamacion.id});
            // $state.go('fianzas.reclinf', {claimId: $scope.reclamacion.id});
          }
        };

        /* Alerta error uploadfiles */
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
        };

        uploader.onAfterAddingFile = function(fileItem) {
          fileItem.formData.push({
              arch: fileItem._file,
              nombre: fileItem.file.name
          });
          $scope.specialchar = []
          var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-=" 
          var str = fileItem.file.name;    
          for(i = 0; i < specialChars.length;i++){ 
            if(str.indexOf(specialChars[i]) > -1){         
              if (specialChars[i] == "-" || specialChars[i] == " " || specialChars[i] == "_" || specialChars[i] == "#" || specialChars[i] == "(" || specialChars[i] == ")" || specialChars[i] == ":" || specialChars[i] == '"') {
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
              }else{            
                $scope.specialchar.push(specialChars[i])  
              }
            } 
          }
          if ($scope.specialchar.length > 0) {
            $scope.uploader.queue.splice($scope.uploader.queue.indexOf(fileItem),1)
            SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales: '+$scope.specialchar,'error') 
          }
          if(fileItem){
            $scope.countFile++;
          }
        };

        uploader.onBeforeUploadItem = function(item) {
          item.url = $scope.userInfo.url;
          item.formData[0].nombre = item.file.name;
          item.alias = '';
          item.formData[0].owner = $scope.userInfo.id;
        };

        function uploadFiles(reclamacionId) {
          $scope.userInfo = {
            id: reclamacionId
          };
          $scope.userInfo.url = $scope.uploader.url = url.IP + 'claims/' + reclamacionId + '/archivos/';

          $scope.files = [];

          $timeout(function() {
            $scope.uploader.uploadAll();
          }, 1000);
        }

        vm.cancel = cancel;

        function cancel(){
          $state.go('fianzas.reclist')
        }

    }
})();
