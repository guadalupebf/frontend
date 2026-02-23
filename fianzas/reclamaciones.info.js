(function() {
    'use strict';

    angular.module('inspinia')
        .controller('FianzasReclamacionesInfoCtrl', FianzasReclamacionesInfoCtrl);

    FianzasReclamacionesInfoCtrl.$inject = ['$timeout','url','FileUploader', '$stateParams', 'dataFactory', '$scope', '$http', 'SweetAlert','$sessionStorage', 
                                            '$uibModal', '$state'];

    function FianzasReclamacionesInfoCtrl($timeout,url,FileUploader, $stateParams, dataFactory, $scope, $http, SweetAlert, $sessionStorage, $uibModal, $state) {
        var vm = this;
        /* Información de usuario */
        var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);
        activate();

        function activate() {
        	dataFactory.get('claims-list/' + $stateParams.claimId + '/')
        	.then(function success(response) {
        		vm.insurance = response.data;
            dataFactory.get('claims/' + vm.insurance.id + '/archivos/').then(function success(response) {
                $scope.files = response.data.results;
                vm.files = response.data.results;
            })
            $http.get(response.data.poliza.url)
            .then(function success(response1) {
              vm.insurance.poliza = response1.data;
              $http.get(response1.data.subramo)
              .then(function success(response3) {
                vm.insurance.poliza.subramo = response3.data.subramo_name;
              })
              $http.get(response1.data.contractor)
              .then(function success(response4) {
                vm.insurance.poliza.contractor = response4.data;
              })
              $http.get(response1.data.aseguradora)
              .then(function success(response2) {
                vm.insurance.poliza.aseguradora = response2.data.alias;
              })
            })
        	})
        }
        
        vm.accesos = $sessionStorage.permisos;
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

        $scope.status = function(parStatus) {
          switch(parStatus){
            case 1:
              return 'Presentación'
              break;
            case 2:
              return 'En integración'
              break;
            case 3:
              return 'Reclamo Formal'
              break;
            case 4:
              return 'Respuesta afianzadora'
              break;
            case 5:
              return 'Respuesta cliente'
              break;
            case 6:
              return 'Reconsideración'
              break;
            case 7:
              return 'Rechazada'
              break;
            case 8:
              return 'Pagada'
              break;
            case 9:
              return 'Desistimiento'
              break;
            case 10:
              return 'Recuperación'
              break;
            case 11:
              return 'Cerrada'
              break;
            default:
              return 'Pendiente'
              break;
          }
        }

        $scope.type = function(parType) {
          switch(parType){
            case 1:
              return 'Aviso Previo'
              break;
            case 2:
              return 'Reclamo Formal'
              break;
            case 3:
              return 'Reconsideración'
              break;
            default:
              return 'Sin tipo'
          }
        }

        $scope.getLog = function() {
          dataFactory.get('get-specific-log', {'model': 13, 'associated_id': vm.insurance.id})
          .then(function success(response) {
            var modalInstance = $uibModal.open({
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
          })
        }

        $scope.changeStatus = function(parStatus) {
        	$http.patch(vm.insurance.url, {status: parStatus})
        	.then(function success(response) {
            activate()
        		SweetAlert.swal("Hecho", "Se ha actualizado el estatus", "success");
        	})
        }

        $scope.deleteFianza = function(item){
          SweetAlert.swal({
            title: 'Eliminar Reclamo',
            text: "Se eliminará la reclamación y no se podrá recuperar después, ¿Estás Seguro?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si, estoy seguro.",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false
          },
          function(isConfirm){
            if(isConfirm){
              $http.delete(item.url)
              .then(function(response){
                if(response.status == 204){
                  SweetAlert.swal("¡Listo!", "Reclamación eliminada exitosamente.", "success");
                  $state.go('fianzas.reclist');
                }
              });
            }
          });
        };
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
        /* Alerta success uploadfiles */
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          $scope.okFile++;
          if($scope.okFile == $scope.countFile){
            $state.go('fianzas.reclinf', {claimId: vm.insurance.id});
            $state.reload();
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
        $scope.saveFiles = function(param){
          $scope.countFile = $scope.uploader.queue.length
          uploadFiles(param.id);
        };
        $scope.changeSensible = function(sensible, index) {
          uploader.queue[index].formData[0].sensible = sensible;
        }
        $scope.saveFile = function(file) {
          var urls = file.url;
          if(urls == undefined){
            urls = url.IP+'polizas/'+file.owner+'/archivos/'+file.id
          }
          $http.patch(urls,{'nombre':file.nombre, 'sensible':file.sensible});
        }
        function uploadFiles(reclamacionId) {
          $scope.userInfo = {
            id: reclamacionId
          };
          $scope.userInfo.url = $scope.uploader.url = url.IP + 'claims/' + reclamacionId + '/archivos/';
          $scope.files = [];
          $scope.uploader.uploadAll();
          activate()
        }
    }
})();
