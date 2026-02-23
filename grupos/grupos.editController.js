(function() {
    'use strict';
    /* jshint devel: true */

    angular.module('inspinia')
        .controller('GrupoEditCtrl', GrupoCtrl);

    GrupoCtrl.$inject = ['$scope', '$stateParams', '$state', '$uibModal', '$localStorage', '$timeout',
        'groupService', 'contactService', 'generalService', '$sessionStorage', 'dataFactory', 
        'toaster', 'FileUploader', 'fileService', 'MESSAGES', 'helpers', 'SweetAlert', '$http'
    ];

    function GrupoCtrl($scope, $stateParams, $state, $uibModal, $localStorage, $timeout,
        groupService, contactService, generalService, $sessionStorage, dataFactory, 
        toaster, FileUploader, fileService, MESSAGES, helpers, SweetAlert, $http) {


        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);

        var vm = this;
        vm.save = save;
        vm.cancel = cancel;
        vm.openModal = openModal;

        // Contacts
        vm.addContact = addContact;
        vm.deleteContacts = deleteContacts;
        vm.user = usr;
        $scope.archivos = {};
        $scope.archivos = {
            headers: [
              'Archivo',
              'Tamaño',
              'Progreso',
              'Opciones',
              'Documento'
            ]
        };

        $scope.changeSensible = function(sensible, index) {
            uploader.queue[index].formData[0].sensible = sensible;
        }

        $scope.saveFile = function(file) {
          $http.patch(file.url,{'nombre':file.nombre, 'sensible':file.sensible});
        }

        
        /** Upload files  */
        var uploader = $scope.uploader = new FileUploader({
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            },
        });

        setTimeout(function() {
            var nums = [];
            $('.telefono').each(function() {
                var actual = $(this);
                nums.push(actual);
            })

            vm.form.contact_group.forEach(function(contacto, index) {

            })
        }, 500);

        // uploader.filters.push({
        //     name: 'customFilter',
        //     fn: function(item /*{File|FileLikeObject}*/ , options) {
        //         return this.queue.length < 20;
        //     }
        // });

        // ALERTA SUCCES UPLOADFILES
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            toaster.success(MESSAGES.OK.UPLOADFILES);
            $timeout(function() {
                $state.go('grupos.grupos');
            }, 1500);
        };

        // ALERTA ERROR UPLOADFILES
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");

        };

        uploader.onAfterAddingFile = function(fileItem) {
            fileItem.formData.push({
                arch: fileItem._file
            });
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

        activate();

        function activate() {
            

            dataFactory.get('usuarios/')
            .then(function(user) {
              $scope.users = user.data.results;
              $scope.show_pagination = true;

              groupService.getGroup($stateParams)
                  .then(function(group) {
                      vm.form = group;
                      $http.get(vm.form.responsable).then(function success(response) {
                          vm.form.responsable = response.data;
                      })
                  });
              getFiles();

            });
        }

        function addContact() {
            var contact = {
                    name: '',
                    phone_number: '',
                    email: ''
                } //jshint ignore:line
            vm.form.contact_group.push(contact); //jshint ignore:line
        }

        function deleteContacts(url, index) {
            $localStorage.indx = index;
            $localStorage.urll = url;
            var modalInstance = $uibModal.open({ //jshint ignore:line
                templateUrl: 'app/grupos/grupos.deleteContact.html',
                controller: ModalInstanceCtrlDeleteContact,
                //windowClass: 'animated fadeIn'
            });
        }

        function ModalInstanceCtrlDeleteContact($scope, $uibModalInstance) {
            var index = $localStorage.indx;
            var url = $localStorage.urll;
            $scope.ok = function() {
                if (url && index || url && !index) {
                    if (usr.permiso.eliminar) {
                        try {
                            return contactService.deleteContact(url)
                                .then(function() {
                                    vm.form.contact_group.splice(index, 1); //jshint ignore:line
                                    SweetAlert.swal("ERROR", MESSAGES.ERROR.DELETECONTACT, "error");
                                    $uibModalInstance.dismiss('cancel');
                                });
                        } catch (err) {
                            throw (err); // toaster.error('Agregue al menos un contacto' + err.message);
                        }
                        $uibModalInstance.dismiss('cancel');
                    } else {
                        SweetAlert.swal("Oops...", "No tienes permiso para eliminar registros", "error");
                    }
                } else {
                    vm.form.contact_group.splice(index, 1);
                }
                $uibModalInstance.dismiss('cancel');
            }


            $scope.cancel = function() {
                if ($uibModalInstance)
                    $uibModalInstance.dismiss('cancel');
            };
        }


        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        function openModal() {
            var modalInstance = $uibModal.open({ //jshint ignore:line
                templateUrl: 'templates/delete.html',
                controller: ModalInstanceCtrl,
                //windowClass: 'animated fadeIn'
            });
        }

        function ModalInstanceCtrl($scope, $uibModalInstance) {
            $scope.name = 'grupo';
            $scope.ok = function() {
                return groupService.deleteGroup(vm.form)
                    .then(function() {
                        $uibModalInstance.close();
                        $state.go('grupos.grupos');
                    });
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        }

        function getFiles() {
            // return generalService.getFiles($stateParams.grupoId)
            return groupService.getFiles($stateParams)
                .then(function(data) {
                    if(data) {

                    }
                    vm.files = data;
                });
        }

        function save() {
            var flag = false;
            var name = vm.form.group_name;
            var bd_group_name = [];

            var form = angular.copy(vm.form);
            if (form.responsable) {
                if (form.responsable.url) {
                    form.responsable = form.responsable.url
                }else{
                    form.responsable = form.responsable
                }
            }
            // if (!helpers.hasAtLeastOneContact(vm.form.contact_group)) {
            //     toaster.error(MESSAGES.ERROR.ADDATLEASTONECONTACT);
            //     return;
            // }

            if(form.group_name.length > 70){
                SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORGROUPMAX, "error");
            }

            return groupService.updateGroup(form)
                .then(function(data) {
                    if(data.status === 200) {

                        var nums = [];
                        $('.telefono').each(function(telefono) {
                            var actual = $(this);
                            // var valActual = $(this).val();
                            nums.push(actual);
                        })

                        form.contact_group.forEach(function(elem, index) { //jshint ignore:line
                            if (!validateEmail(elem.email) || !elem.name || !elem.phone_number) {
                                SweetAlert.swal("ERROR", MESSAGES.ERROR.SELADDRES, "error");
                                flag = true;
                                return;
                            }
                            elem.group = data.data.url;

                            if (!elem.url) {
                                contactService.createContact(elem);
                            } else {
                                contactService.updateContact(elem);
                            }
                        });
                        if (flag) {
                            return;
                        }
                        $scope.userInfo = {
                            id: data.data.id
                        };
                        $scope.userInfo.url = $scope.uploader.url = data.data.url + 'archivos/';
                        $scope.uploader.uploadAll();
                        toaster.success('Se han guardado correctamente sus cambios');
                        getFiles();

                        $state.go('grupos.grupos');
                    }
                });
        }

        function cancel() {
          $state.go('grupos.info',{grupoId: vm.form.id});
        }

        $scope.deleteFile = deleteFile;

        function deleteFile(file) {
          fileService.deleteFile(file, vm.files);
        }

        $scope.openModalGroup = function(level){
            var modalInstance = $uibModal.open({ //jshint ignore:line
                templateUrl: 'app/grupos/grupos.form.html',
                controller: ModalInstanceCtrl,
                resolve: {
                  level: function() {
                    return level;
                  },
                  group: function() {
                    return level == 2 ? vm.form : {};
                  }
                },
                backdrop: 'static', /* this prevent user interaction with the background */
                keyboard: false
                // windowClass: 'animated fadeIn'
            });
        }

        function ModalInstanceCtrl($scope, $uibModalInstance, level, group, url) {
          $scope.level = level;
          $scope.groupForm = {};
          $scope.subgroupForm = {};
          $scope.subgroups = [];
          $scope.sub_subgroups = [];

          $scope.addSubgroups = function () {
            var obj = {name: '', observations: '', sub_subgroup: []};
            $scope.subgroups.push(obj);
          };

          $scope.deleteSubgroup = function (index) {
            $scope.subgroups.splice(index, 1);
          };

          $scope.addSubsubgroups = function () {
            var obj = {name: '', observations: '', sub_subgroup: []};
            $scope.sub_subgroups.push(obj);
          };

          $scope.deleteSubsubgroup = function (index) {
            $scope.sub_subgroups.splice(index, 1);
          };

          $http.get(url.IP + 'usuarios/')
          .then(function(user) {
            $scope.users = user.data.results;

            $scope.show_pagination = true;
          });

          $scope.changeResponsable = function(data, type){
            $scope.responsables_natural = [];
            $scope.responsables_juridical = [];
            if(type == 1){
              $scope.responsables_natural.push(data);
            } else {
              $scope.responsables_juridical.push(data);
            }
          };

          $scope.oksub = function() {
            if(!group.responsable){
              SweetAlert.swal("ERROR", "Selecciona un responsable.", "error");
              return;
            }
            $scope.subgroupForm.responsable = group.responsable.url;
            $scope.subgroupForm.parent = group.url;
            $scope.subgroupForm.type_group = 2;

            $http({
              method: 'POST',
              url: url.IP + 'grupos/',
              data: $scope.subgroupForm
            })
            .then(function (request) {
              if(request.status === 200 || request.status === 201) {
                if ($scope.sub_subgroups.length > 0) {
                  $scope.sub_subgroups.forEach(function(item){
                    var datas = {
                      group_name: item.group_name,
                      responsable: group.responsable.url,
                      parent: request.data.url,
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
                  });
                }
                SweetAlert.swal("¡Listo!", "Subgrupo creado exitosamente.", "success");
                $scope.cancel();
              }
            })
            .catch(function (e) {
              console.log('e', e);
            });

          };

          $scope.cancel = function() {
            if ($uibModalInstance) {
              $uibModalInstance.dismiss('cancel');
              $("#modalContratate").parent().parent().parent().css("display", "block");
            }
          };
        }
    }
})();
