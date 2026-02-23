(function(){
  'use strict';
  /* jshint devel: true */

  angular.module('inspinia')
      .controller('GrupoInfoCtrl', GrupoInfoCtrl);

  GrupoInfoCtrl.$inject = ['ContratanteService','$localStorage', '$state',  '$stateParams', '$uibModal', '$scope',
                           'groupService', '$sessionStorage', 'SweetAlert',
                           'toaster', 'helpers', 'FileUploader', 'generalService', 'fileService', '$http','url', 'exportFactory'];

  function GrupoInfoCtrl(ContratanteService,$localStorage, $state, $stateParams, $uibModal, $scope,
      groupService, $sessionStorage, SweetAlert,
      toaster, helpers, FileUploader, generalService, fileService, $http,url, exportFactory) {

        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);
        var currentOrg = usr && usr.org && usr.org.urlname ? usr.org.urlname : (usr.urlname || usr.orgname || '');

      $scope.deleteFile = deleteFile;
      delete $localStorage.group;
      var vm = this;
      vm.user = usr;
      /** Uploader files */
      var uploader = $scope.uploader = new FileUploader({
          headers: {'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
      });
       vm.org_name = currentOrg;
       vm.accesos = $sessionStorage.permisos;
      if (vm.accesos) {
        vm.accesos.forEach(function(perm){
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
              }else if (acc.permission_name == 'Eliminar grupos') {
                if (acc.checked == true) {
                  vm.acceso_del_group = true
                }else{
                  vm.acceso_del_group = false
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

        function exportGroupComments() {
          if (!vm.groupId || vm.commentsExportLoading) {
            return;
          }
          vm.commentsExportLoading = true;

          var resetLoading = function() {
            vm.commentsExportLoading = false;
          };

          var params = {
            model: 8,
            id_model: vm.groupId
          };
          if (currentOrg) {
            params.org = currentOrg;
          }

          toaster.info('Generando...', 'El archivo se está generando, espera un momento.');

          exportFactory.commentsExport({
            params: params,
            downloadName: 'bitacora-grupo-' + vm.groupId + '.xlsx',
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
      // uploader.filters.push({
      //     name: 'customFilter',
      //     fn: function(item, options) {
      //         return this.queue.length < 20;
      //     }
      // });

      // ALERTA SUCCES UPLOADFILES
      uploader.onSuccessItem = function(fileItem, response, status, headers) {
        toaster.success(MESSAGES.OK.UPLOADFILES);
      };

      // ALERTA ERROR UPLOADFILES
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
      };

      uploader.onAfterAddingFile = function(fileItem) {
          fileItem.formData.push({
              arch: fileItem._file
              // owner: $scope.userInfo.id
          });
      };

      uploader.onBeforeUploadItem = function(item) {
          item.url = $scope.userInfo.url;
          item.formData[0].nombre = item.file.name;
          item.alias = '';
          item.formData[0].owner = $scope.userInfo.id;
      };

      vm.groups = [];
      vm.contact_group = []; //jshint ignore:line
      // vm.editGroup = editGroup;
      vm.openModalDeleteGroup = openModalDeleteGroup;
      vm.checkType = checkType;

      activate();

      function activate() {        
        vm.groupId = $stateParams.grupoId
          groupService.getGroup($stateParams)
            .then(function(data) {
              vm.group = data;
              if(vm.group.responsable){
                $http.get(vm.group.responsable).then(function success(response) {
                  vm.group.responsable = response.data;
                })
              }
              ContratanteService.getContratantesByGroup(vm.group.id)
              .then(function(res) {
                var contractors = [];
                res.results.forEach(function(contratante, index) {
                  if(contratante.phone_number) {
                    var phone_number = contratante.phone_number.replace( /^\D+/g, '').replace( "'}", '');
                    contratante.phone_number = phone_number;
                  }
                  contractors.push(contratante);
                });
                vm.groupsNatural = contractors;
                vm.config_pagination = res;
                $scope.show_pagination = true;
              });
              vm.contact_group = data.contact_group;
              return vm.groups;
          });
          getFiles()

          $http({
          method: 'GET',
          url: url.IP+'comments/',
          params: {
              'model': 8,
              'id_model': vm.groupId
          }
        })
        .then(function(request) {
          vm.comments_data = request.data.results;
          vm.comments_config = {
              count: request.data.count,
              next: request.data.next,
              previous: request.data.previous
          };
        })
        .catch(function(e) {
            console.log('e', e);
        });
      }

      $scope.deleteGroup = function(url) {
        SweetAlert.swal({
          title: '¿Está seguro?',
          text: "Se eliminara la información",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Si",
          cancelButtonText: "No",
          closeOnConfirm: false
        },
        function(isConfirm) {
          if (isConfirm) {
            if(vm.groupsNatural == undefined){
              vm.groupsNatural = [];
            }
            if(!vm.groupsNatural.length){
              $http.delete(url).then(function success(response) {
                if(response.status == 204){
                  SweetAlert.swal("¡Listo!", "Se ha eliminado el grupo", "success");
                  $state.go('grupos.grupos');
                }
              })
            } else {
              SweetAlert.swal("Error", "No se puede eliminar un grupo que contiene contratantes", "error");
            }
          }
        });
      }

      function getFiles(){
          return groupService.getFiles($stateParams)
              .then(function(data) {
                  if(!data.detail) {
                    vm.files = data;
                  } else {
                    
                  }
              });
      }

      // Check data and redirect to contractor editor
      function checkType(type){
          return helpers.checkType(type);
      }

      // function editGroup(data){
      //     $localStorage.group = data;
      // }

      // Delete group
      function openModalDeleteGroup(){
          var modalInstance = $uibModal.open({ //jshint ignore:line
              templateUrl: 'templates/delete.html',
              controller: ModalInstanceCtrl,
              //windowClass: 'animated fadeIn'
          });
      }

      function ModalInstanceCtrl($scope, $uibModalInstance) {
          $scope.name = 'grupo';
          $scope.ok = function () {
              return groupService.deleteGroup(vm.group)
                  .then(function(data){
                      $uibModalInstance.close();
                      $state.go('grupos.grupos');
                  });
          };

          $scope.cancel = function () {
              $uibModalInstance.dismiss('cancel');
          };
      }

      function deleteFile(file){
        fileService.deleteFile(file, vm.files);
      }

      $scope.editSubroup = function(param){
        $scope.edit_subgroup = true;
        $scope.sub_group = angular.copy(param);
      };

      $scope.edit_subgroup = false;
      $scope.subgroups = [];
      $scope.sub_subgroups = [];

      $scope.addSubgroups = function () {
        var obj = {group_name: '', observations: '', sub_subgroup: []};
        $scope.subgroups.push(obj);
      };

      $scope.deleteSubgroup = function (index) {
        $scope.subgroups.splice(index, 1);
      };

      $scope.addSubsubgroups = function () {
        var obj = {group_name: '', observations: '', sub_subgroup: []};
        $scope.sub_group.subsubgrupos.push(obj);
      };

      $scope.deleteSubsubgroup = function (param, index) {
        if(param.url){
          SweetAlert.swal({
            title: '¿Está seguro?',
            text: "Se eliminara la información",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si",
            cancelButtonText: "No",
            closeOnConfirm: false
          },
          function(isConfirm) {
            if (isConfirm) {
              $http.delete(param.url).then(function success(response) {
                if(response.status == 204){
                  SweetAlert.swal("¡Listo!", "Se ha eliminado exitosamante.", "success");
                }
              });
              $scope.sub_group.subsubgrupos.splice(index, 1);
            }
          });
        }else{
          $scope.sub_group.subsubgrupos.splice(index, 1);
        }
      };

      $scope.returnSub = function(){
        $scope.edit_subgroup = false;
      };

      $scope.upgrade = function(){ 

        $http.patch($scope.sub_group.url, {group_name: $scope.sub_group.group_name})
        .then(function success(request){
          $scope.sub_group.subsubgrupos.forEach(function(item, index){
            if(item.url){
              $http.patch(item.url, {group_name: item.group_name})
              .then(function success(request){
                      
              }).catch(function(e){
                console.log(e);
              });
            }else{
              var datas = {
                group_name: item.group_name,
                responsable: vm.group.responsable.url,
                parent: $scope.sub_group.url,
                type_group: 3
              }

              $http({
                method: 'POST',
                url: url.IP + 'grupos/',
                data: datas
              })
              .then(function (request) {
                if(request.status === 200 || request.status === 201) {
                  
                }
              })
              .catch(function (e) {
                console.log('e', e);
              });
            }

            if($scope.sub_group.subsubgrupos.length == (index + 1)){
              $scope.returnSub();
              $state.reload();
            }
          });
        }).catch(function(e){
          console.log(e);
        });


      };

  }
})();
