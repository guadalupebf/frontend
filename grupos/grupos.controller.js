(function() {
    'use strict';
    /* jshint devel: true */

    angular.module('inspinia')
        .controller('GrupoCtrl', GrupoCtrl);

    GrupoCtrl.$inject = ['url','$scope', '$localStorage', '$timeout', '$state', '$q', 'groupService', 'contactService', 'helpers', 'MESSAGES', 'toaster', 'FileUploader',
                '$sessionStorage','$http', 'SweetAlert', 'exportFactory'];

    function GrupoCtrl(url, $scope, $localStorage, $timeout, $state, $q, groupService, contactService, helpers, MESSAGES, toaster, FileUploader, $sessionStorage, $http,
                        SweetAlert, exportFactory) {   
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);

        var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);


        delete $localStorage.group;

        $scope.uploader = new FileUploader();

        var vm = this;
        vm.groups = [];
        vm.pageTitle = 'Grupos';
        vm.submit = submit;
        vm.editGroup = editGroup;
        vm.showData = [];
        vm.showInfo = showInfo;        
        vm.buttonReport = false;
        vm.form = {
            group_name: '',
            description: '',
            contact_group: []
        };
        vm.user = usr;
        //Contacts
        vm.deleteContacts = deleteContacts;
        vm.saveLocalstorage = saveLocalstorage;
        vm.addContact = addContact;
        vm.searchGroups = searchGroups;
        vm.activate = activate;
        vm.search = search;
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

        $scope.infoUser = $sessionStorage.infoUser;

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

        $scope.changeSensible = function(sensible, index) {
            uploader.queue[index].formData[0].sensible = sensible;
        }

        $scope.saveFile = function(file) {
          $http.patch(file.url,{'nombre':file.nombre, 'sensible':file.sensible});
        }

        /** Uploader files */
        $scope.userInfo = {
            id: 0
        };
        var uploader = $scope.uploader = new FileUploader({
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            },
        });

        // uploader.filters.push({
        //     name: 'customFilter',
        //     fn: function(item /*{File|FileLikeObject}*/ , options) { //jshint ignore:line
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
        
        $scope.exportData = function (group) {
            var data = {}
            // if($scope.infoUser.staff && !$scope.infoUser.superuser){
                // // $scope.excel_groups = 'v2/contratantes/reporte-grupos/';
                // $scope.excel_groups = 'service_reporte-v2-grupo-excel' 
            $scope.excel_groups = 'service_reporte-grupo-excel'
            $http({
              method: 'POST', 
              url: url.IP + $scope.excel_groups,
              data: data,
              headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
              responseType: "arraybuffer"})
            .then(function(data, status, headers, config) {
              if(data.status == 200){
                var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                saveAs(blob, 'Reporte Grupos.xls');
              } else {
                SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDOWNLOADREP, "error")
              }
            });
            // $http.get(url.IP + $scope.excel_groups)
            // .then(
            //     function success(request) {
            //         exportFactory.excel(request.data, 'Grupos')
            //     }, 
            //     function error(error) {
            //         console.log('error', error);
            //     }
            // )
            // .catch(function(e) {
            //     console.log(e);
            // })
        };
        

        // activate();

        $http.get(url.IP + 'usuarios/')
        .then(function(user) {
        
          $scope.users = user.data.results;
        
          $scope.show_pagination = true;
          activate();
        });

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        function submit() {
            if(vm.groups_results.length) {
       
                vm.groups_results.forEach(function(item) {

                    if(item.label == vm.form.group_name.val) {

                        SweetAlert.swal({
                          title: '¡El grupo ya existe!',
                          type: "warning",
                          confirmButtonColor: "#DD6B55",
                          confirmButtonText: "Aceptar",
                          cancelButtonText: "Cancelar",
                          closeOnConfirm: true
                        }, 
                        function(isConfirm) {
                          if (isConfirm) {
                           return;
                          }
                        });
                    } else {
                        saveGroup();
                    }
                });
            } else {
                saveGroup();
            }

            $localStorage.grupos = {};
        }
        

        function saveGroup () {
            if(!vm.form.responsable){
              SweetAlert.swal("ERROR", "Selecciona un responsable.", "error");
              return;
            }
            var flag_item = false;
            $scope.subgroups.forEach(function(item, index){
              if(!item.group_name){
                flag_item = true;
                SweetAlert.swal("ERROR", "Agrega el nombre del subgrupo " + (index+1) + ".", "error");
              }
            });
            if(flag_item){
              return;
            }
            var name = vm.form.group_name.val;

            var bd_group_name = [];
            var flag = false;
          
            if (flag) {
                return;
            }

            vm.form.group_name = name;
            var form = angular.copy(vm.form);
            var arr = [];

            vm.form.contact_group.forEach(function(elem) {
                arr.push(elem);
            });

            form.contact = arr;
            if (vm.form.responsable) {
                if (vm.form.responsable.url) {
                    form.responsable = vm.form.responsable.url
                }else{
                    form.responsable = vm.form.responsable
                }
            }
            return groupService.createGroup(form)
                .then(function(data) {
                    if (!data) {
                        SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORCREATEGROUP, "error");
                    } else {
                        form.contact.forEach(function(contact) {
                            if (contact.phone_number.length > 15) {
                                SweetAlert.swal("ERROR", MESSAGES.ERROR.MINIMUMPHONELENGTH, "error");
                                flag = true;
                                return;
                            }

                            if (!validateEmail(contact.email) || !contact.name || !contact.phone_number) {
                                SweetAlert.swal("ERROR", MESSAGES.ERROR.SELADDRES, "error");
                                flag = true;
                                return;
                            }
                            contact.group = data.data.url;
                            contactService.createContact(contact);
                        });


                        if (flag) {
                            return;
                        }


                        SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWGROUP, "success");
                        $localStorage.grupos = {};
                        if(vm.acceso_ver_cont){
                            $state.go('grupos.grupos');
                        }else{
                            $state.go('index.main');
                        }
                        $scope.userInfo = {
                            id: data.data.id
                        };
                        $scope.userInfo.url = $scope.uploader.url = data.data.url + 'archivos/';
                        $q.when()
                            .then(function() {
                                var defer = $q.defer();
                                defer.resolve($scope.uploader.uploadAll());
                                return defer.promise;
                            })
                            .then(function() {
                                $timeout(function() {
                                    // $state.go('index.main');
                                    if(vm.acceso_ver_cont){
                                        $state.go('grupos.grupos');
                                    }else{
                                        $state.go('index.main');
                                    }
                                }, 1000);
                            });

                        if ($scope.subgroups.length > 0) {
                          $scope.subgroups.forEach(function(item){
                            var datas = {
                              group_name: item.group_name,
                              responsable: data.data.responsable,
                              parent: data.data.url,
                              type_group: 2
                            }

                            $http({
                              method: 'POST',
                              url: url.IP + 'grupos/',
                              data: datas
                            })
                            .then(function (request) {
                              if(request.status === 200 || request.status === 201) {
                                if (item.sub_subgroup.length > 0) {
                                  item.sub_subgroup.forEach(function(sub){
                                    var data_sub = {
                                      group_name: sub.group_name,
                                      responsable: data.data.responsable,
                                      parent: request.data.url,
                                      type_group: 3
                                    }

                                    $http({
                                      method: 'POST',
                                      url: url.IP + 'grupos/',
                                      data: data_sub
                                    })
                                    .then(function (response) {
                                      if(response.status === 200 || response.status === 201) {
                                        
                                      }
                                    })
                                    .catch(function (e) {
                                      console.log('e', e);
                                    });
                                  });
                                }
                              }
                            })
                            .catch(function (e) {
                              console.log('e', e);
                            });
                          });
                        }
                      $state.go('grupos.info', {grupoId: data.data.id})
                    }
                });

            return;
        }
        $scope.changeResponsable = function(data){
          vm.form.responsable = data;
        }
        vm.changeResponsable1 = changeResponsable1;
        function changeResponsable1 (data){
            $scope.users.forEach(function(item){
                if (item.url == data) {
                    vm.form.responsable = item
                }
            })
        }
        function activate() {            
            vm.buttonReport = false;
            $localStorage['grupos'] = $localStorage['grupos'] ? $localStorage['grupos'] : {}
            vm.form.group_name = $localStorage['grupos']['group_name'];
            vm.form.responsable = $localStorage['grupos']['responsable'];
            vm.form.description = $localStorage['grupos']['description']
            $scope.subgroups = $localStorage['grupos']['subgroups'] ? $localStorage['grupos']['subgroups'] : [];
            vm.form.contact_group = $localStorage['grupos']['contact_group']  ? $localStorage['grupos']['contact_group']  :[]
            $scope.cadena = $localStorage['grupos']['cadena'] ;
            vm.groups = $localStorage['grupos']['groups'] ? $localStorage['grupos']['groups'] : [];
            vm.groups_results = $localStorage['grupos']['groups_results'] ?  $localStorage['grupos']['groups_results']: [];
            changeResponsable1(vm.form.responsable);
            getGroups();
        }
        function saveLocalstorage() {
          $localStorage['grupos'] = $localStorage['grupos'] ? $localStorage['grupos'] : {}
          $localStorage['grupos']['group_name'] = vm.form.group_name;
          $localStorage['grupos']['responsable'] = vm.form.responsable;
          $localStorage['grupos']['description'] = vm.form.description ? vm.form.description : ''
          $localStorage['grupos']['subgroups'] = $scope.subgroups ? $scope.subgroups : [];
          $localStorage['grupos']['contact_group'] = vm.form.contact_group ? vm.form.contact_group : [];
          $localStorage['grupos']['cadena'] = $scope.cadena;
          $localStorage['grupos']['groups'] = vm.groups ? vm.groups : [];
          $localStorage['grupos']['groups_results'] = vm.groups_results;

        }
        function returnToGroup(param) {
            if(param) {
              vm.show_binnacle= false;
            } else {
              vm.show_binnacle = false;
            }

          }

        vm.showBinnacle = showBinnacle;
        vm.returnToGroup = returnToGroup;
        //-----------------------------------------------------------comments
        function showBinnacle(param) {
          vm.show_binnacle = true;
          vm.group_id = param.id;
          $http({
            method: 'GET',
            url: url.IP+'comments/',
            params: {
              'model': 8,
            'id_model': param.id
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
        };
        //-------------------------------------------------------------comments

        function searchGroups(param) {
            vm.show_binnacle = false;
            if(param){
                $http.post(url.IP+'groups-match/', 
                {
                    word: param.val
                })
                .then(
                    function success(request) {
                       
                        vm.groups_results = [];
                        if(request.status === 200) {
                            request.data.forEach(function(item){
                                var obj = {
                                    label: item.group_name,
                                    value: item.group_name
                                };

                                vm.groups_results.push(obj);
                            });
                        }
                    }, 
                    function error(error) {
                        console.log('error - groups', error);
                    }
                )
                .catch(function(e) {
                    console.log('error - groups', e);
                });
            }

        }
        function search(cadena){
        $scope.param_cadena = cadena;
        if (cadena.length) {
            vm.show_binnacle= false;
          $scope.show_pagination = false;
            // if($scope.infoUser.staff && !$scope.infoUser.superuser){
            //     $scope.search_group = 'v2/generics/seeker-groups/';
            $scope.search_group = 'seeker-groups/';
          $http({
              method: 'GET',
              url: url.IP + $scope.search_group, 
              params: {
                  cadena: cadena
              }
          })
          .then( 
              function success(request) {
                vm.groups = [];
                if(request.status === 200 && request.data.results.length) {
                  vm.groups = request.data.results;
                  vm.config_pagination =request.data;
                  $scope.show_pagination = true;
                  
                  vm.groups.forEach(function(r){
                    if(r.responsable){
                      $http.get(r.responsable )
                      .then(
                        function success(request) {
                          if(request.status === 200) {
                            r.responsable = request.data
                          }
                        },
                        function error(error) {

                        }
                      )
                      .catch(function(e){
                          console.log(e);
                      });
                    }
                  }); 
                } else {
                    toaster.warning("No se encontraron registros");
                }
                vm.buttonReport = true;
              }, 
              function error(error) {

              }
          )
          .catch(function(e){
              console.log(e);
          });
        }else{
            vm.groups =[];
          }
        }

        function getGroups() {
                vm.groups = [];
                vm.show_binnacle= false;
                return groupService.getTableGroups()
                .then(function(data) {
                    //vm.groups = data;
                    vm.groups = data.data.results;
                    vm.groups.forEach(function(r) {
                        if(r.responsable){
                            $http.get(r.responsable )
                            .then(
                                function success(request) {
                                  if(request.status === 200) {
                                    r.responsable = request.data
                                  }
                                },
                                function error(error) {

                                }
                            )
                            .catch(function(e){
                                console.log(e);
                            });
                        }
                    });
                    
                    vm.config_pagination = data.config;
                    $scope.show_pagination = true;

                });
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   var search_group = 'v2/generics/seeker-groups/';
          var search_group = 'seeker-groups/';
          $http({
              method: 'GET',
              url: url.IP + search_group,
              params: {
                  cadena: ""
              }
          })
          .then( 
              function success(data) {
                vm.groups = data.data.results;
                vm.config_pagination = data.data;
                    vm.groups.forEach(function(r) {
                        if(r.responsable){
                            $http.get(r.responsable )
                            .then(
                                function success(request) {
                                  if(request.status === 200) {
                                    r.responsable = request.data
                                  }
                                },
                                function error(error) {

                                }
                            )
                            .catch(function(e){
                                console.log(e);
                            });
                        }
                    });
              }, 
              function error(error) {

              }
          )
          .catch(function(e){
              console.log(e);
          });
        }

        $scope.goToGroup = function(id){
            $state.go(grupos.info({grupoId: id}));
        }

        function editGroup(data) {
            $localStorage.group = data;
        }

        
        $scope.exportDataSeeker = function (param){ 
            var data = {cadena : $scope.param_cadena};          
            if(param == 1) { // naturales seeker

            // if($scope.infoUser.staff && !$scope.infoUser.superuser){
            //     // $scope.excel_groups_seeker = 'v2/contratantes/reporte-seekerGrupos/';
            //     $scope.excel_groups_seeker = 'service_reporte-v2-seekerGrupos-excel';
            $scope.excel_groups_seeker = 'service_reporte-seekerGrupos-excel';
            $http({
              method: 'POST', 
              url: url.IP + $scope.excel_groups_seeker,
              data: data,
              headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
              responseType: "arraybuffer"})
            .then(function(data, status, headers, config) {
              if(data.status == 200){
                var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                saveAs(blob, 'Reporte Grupos.xls');
              } else {
                SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDOWNLOADREP, "error")
              }
            });
            // $http({
            //   method: 'GET',
            //   url: url.IP + $scope.excel_groups_seeker,
            //   params: data
            // })
            // .then(function (request) {
            //   if(request.status === 200) {
            //       exportFactory.excel(request.data, 'Grupos');
            //   }

            // })
            // .catch(function (e) {
            //   console.log('e', e);
            // });


          }
        }

        function showInfo(data) {
            var concatArr = data.natural_group.concat(data.juridical_group); //jshint ignore:line
            vm.showData = concatArr;
        }

        // Contacts
        function deleteContacts(index) {
            vm.form.contact_group.splice(index, 1); //jshint ignore:line
        }

        function addContact() {
            var contact = {
                    name: '',
                    phone_number: '',
                    email: ''
                } //jshint ignore:line
            vm.form.contact_group.push(contact); //jshint ignore:line
        }

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
          $scope.sub_subgroups.push(obj);
        };

        $scope.deleteSubsubgroup = function (index) {
          $scope.sub_subgroups.splice(index, 1);
        };

    }
})();
