(function() {
    'use strict';

    angular.module('inspinia')
        .controller('ReclamacionEditCtrl', ReclamacionEditCtrl);

    ReclamacionEditCtrl.$inject = ['$stateParams','$state', '$sessionStorage', '$scope', 'FileUploader', 'dataFactory', '$http', 'datesFactory', 'SweetAlert', 'url','$timeout','MESSAGES', '$localStorage', 'appStates'];

    function ReclamacionEditCtrl($stateParams, $state, $sessionStorage, $scope, FileUploader, dataFactory, $http, datesFactory, SweetAlert, url, $timeout, MESSAGES, $localStorage, appStates) {
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

        uploader.filters.push({
            name: 'customFilter',
            fn: function(item, options) {
                return this.queue.length < 20;
            }
        });

        var uploader = $scope.uploader = new FileUploader({
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            },
        });

        uploader.filters.push({
            name: 'customFilter',
            fn: function(item, options) {
                return this.queue.length < 20;
            }
        });

        activate();

        function activate() {
          dataFactory.get('claims-list/' + $stateParams.reclId + '/')
          .then(function success(response) {
            vm.form = response.data;
            dataFactory.get('claims/' + vm.form.id + '/archivos/').then(function success(response) {
                $scope.files = response.data.results;
                vm.files = response.data.results;
            })
            dataFactory.get('leer-fianzas-info/' + response.data.poliza.id)
            .then(function success(response) {
              $scope.fianza = response.data;
              vm.selected_affect = {};
              vm.selected_affect.val = $scope.fianza.beneficiaries_poliza_many[0].j_name ? $scope.fianza.beneficiaries_poliza_many[0].j_name : $scope.fianza.beneficiaries_poliza_many[0].full_name+' - Fianza: '+$scope.fianza.poliza_number;
              vm.selected_affect.value = $scope.fianza.beneficiaries_poliza_many[0].j_name ? $scope.fianza.beneficiaries_poliza_many[0].j_name : $scope.fianza.beneficiaries_poliza_many[0].full_name+' - Fianza: '+$scope.fianza.poliza_number;
              var autocomplete = document.getElementById('autocomplete');
              var autocomplete2 = document.getElementById('id');
              var buttons = document.getElementById('buttonsearch');
              try{
                autocomplete.disabled = true;
                autocomplete2.disabled = true;
              }catch(u){}
              buttons.disabled = true;
            })
            vm.form.presentacion = datesFactory.convertDate(vm.form.introduction_date);
          })
        }

        $scope.saveClaim = function() {
          vm.form.introduction_date = new Date(datesFactory.toDate(vm.form.presentacion));
          vm.form.poliza = $scope.fianza.url;
          vm.form.benefited = $scope.benefited;

          dataFactory.update('claims/'+vm.form.id+'/', vm.form)
          .then(function success(response) {
            if(response.status == 200 || response.status == 201){
              $scope.reclamacion = response.data;
              var params = {
                'model': 13,
                'event': "POST",
                'associated_id': $scope.fianza.id,
                'identifier': "actualizo la reclamación No." + response.data.number + "."
              }
              dataFactory.post('send-log/', params).then(function success(response) {

              });
              SweetAlert.swal("Hecho", "Se ha actualizado la reclamación", "success");
              $scope.countFile = $scope.uploader.queue.length;
              if ($scope.uploader.queue.length == 0) {

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
            $state.go('fianzas.reclinf', {claimId: $scope.reclamacion.id});
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

    }
})();
