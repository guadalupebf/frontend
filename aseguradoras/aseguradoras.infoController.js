(function() {
    'use strict';
    /* jshint devel: true */

    angular.module('inspinia')
        .controller('AseguradorasInfoCtrl', AseguradorasInfoCtrl);

    AseguradorasInfoCtrl.$inject = ['url', '$http', '$state', '$stateParams', '$q', 'helpers', '$uibModal', 'providerService', 'contactService', 'toaster', 'MESSAGES', '$localStorage',
                                  'SweetAlert', '$sessionStorage','$scope'];

    function AseguradorasInfoCtrl(url, $http, $state, $stateParams, $q, helpers, $uibModal, providerService, contactService, toaster, MESSAGES, $localStorage, SweetAlert,
                                  $sessionStorage,$scope) {

        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);


        var vm = this;
        vm.providers = [];
        vm.openModal = openModal;
        vm.cancel = cancel;
        vm.save = save;

        //Contacts
        vm.deleteContacts = deleteContacts;
        vm.addContact = addContact;
        vm.user = usr;
        vm.address_list = [];
        vm.addAddress = addAddress;
        vm.deleteAddress = deleteAddress;
        vm.changeRamo = changeRamo;
        vm.changeSubramo = changeSubramo;

        activate();

        function addAddress() {
            var address = {
                //     compania: '',
                rfc: '',
                raw: '',
                street_address: '',
                intersection: '',
                political: '',
                administrative_area_level_1: '',
                administrative_area_level_1_short: '',
                administrative_area_level_2: '',
                administrative_area_level_3: '',
                colloquial_area: '',
                sublocality: '',
                neighborhood: '',
                premise: '',
                subpremise: '',
                natural_feature: '',
                country: '',
                country_code: '',
                locality: '',
                postal_code: '',
                route: '',
                street_number: '',
                street_number_int: '',
                formatted: '',
                latitude: '',
                longitude: '',
                details: '',
                composed: '',
            }
            vm.address_list.push(address);
        }

        function deleteAddress(address, index) {
            if (address.url) {
                SweetAlert.swal({
                    title: "¿Está seguro?",
                    text: "You will not be able to recover this imaginary file!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Si, Estoy seguro.",
                    cancelButtonText: "Cancelar",
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function(isConfirm) {
                    if (isConfirm) {
                        $http.delete(address.url).then(function() {
                            swal("Deleted!", "Your imaginary file has been deleted.", "success");
                        });

                    } else {
                        swal("Cancelled", "Your imaginary file is safe :)", "error");
                        return;
                    }
                });
            } else {
                vm.address_list.splice(index, 1);
            }

        }




        function activate() {
            vm.ramos = []
            vm.contact_list = [];
            providerService.getProviderFull($stateParams)
                .then(function(provider) {
                    vm.form = provider;
                    if(provider){
                        if(provider.contact_provider){
                            provider.contact_provider.forEach(function(contact) {
                                vm.contact_list.push(contact)
                                vm.contact_list.forEach(function(c) {
                                    vm.contacto = c;
                                    if(contact.ramo){
                                        $http.get(contact.ramo).then(function(cont_ramo) {
                                            vm.ramos = cont_ramo.data;
                                            // vm.form.contact_provider.ramo = cont_ramo;
                                            contact.ramo_s = cont_ramo
                                            vm.ramo_contacto = cont_ramo
                                            vm.ramos = [
                                                {ramo_name: vm.ramos.ramo_name, 
                                                id: vm.ramos.id, 
                                                url: vm.ramos.url,
                                                provider: vm.ramos.provider, 
                                                ramo_code:vm.ramos.ramo_code,
                                                conramo: vm.ramos.ramo_name,
                                                }
                                            ];
                                            vm.ramos.forEach(function(info_c) {
                                                vm.form.contact_provider.forEach(function(form_c) {
                                                    form_c.conramo = info_c;
                                                    form_c.consubramo = cont_ramo.data.subramo_ramo
                                                    info_c.subramo_ramo = cont_ramo.data.subramo_ramo
                                                    changeRamo(vm.form.contact_provider,info_c)
                                                })
                                            })
                                        })
                                    }
                                    // 
                                    if(contact.subramo){
                                        $http.get(contact.subramo).then(function(cont_subramo) {
                                            vm.subramos = cont_subramo.data;
                                            vm.subramo_contacto = cont_subramo
                                            contact.subramo_s = cont_subramo
                                            vm.subramos = [
                                                {subramo_name: vm.subramos.subramo_name, 
                                                id: vm.subramos.id, 
                                                url: vm.subramos.url,
                                                ramo: vm.subramos.ramo, 
                                                subramo_code:vm.subramos.subramo_code,
                                                consubramo: vm.subramos.subramo_name, 
                                                }
                                            ];
                                            vm.subramos.forEach(function(info_cs) {
                                                vm.form.contact_provider.forEach(function(form_cs) {
                                                    vm.ramos.conramo = vm.ramos
                                                    form_cs.consubramo = info_cs;
                                                    changeSubramo(vm.form.contact_provider,info_cs)
                                                })
                                            })
                                        })
                                    }
                                })
                            })
                        }
                    }
                    provider.address_provider.forEach(function(address) {
                        vm.address_list.push(address)
                    })
                    var nums = [];
                    setTimeout(function() {
                        $('.telefono').each(function(telefono) {
                            var actual = $(this);
                            nums.push(actual);
                        });

                        $http.get(url.IP+'ramos-by-provider/'+provider.id).then(function(ramos) {
                            vm.ramos = ramos.data;  
                        })
                    }, 500);
                });

            $q.when()
                .then(function() {
                    var defer = $q.defer();
                    defer.resolve(helpers.getStates());
                    return defer.promise;
                })
                .then(function(data) {
                    vm.statesArray = data.data;
                });
        }

        function changeRamo(obj, ramo){
            obj.ramo = ramo.url;
          if (!ramo){
            vm.subramos = []
            return
          }
          try{
            vm.subramos = ramo.subramo_ramo;
          }
          catch(e){}
        }

        function changeSubramo(obj, subramo){
            if(subramo){
                obj.subramo = subramo.url;
            }
        }

        function openModal() {
            var modalInstance = $uibModal.open({ //jshint ignore:line
                templateUrl: 'templates/delete.html',
                controller: ModalInstanceCtrl,
                //windowClass: 'animated fadeIn'
            });
        }

        function ModalInstanceCtrl($scope, $uibModalInstance) {
            $scope.name = 'proveedor';
            $scope.ok = function() {
                return providerService.deleteProvider($stateParams)
                    .then(function() {
                        $uibModalInstance.close();
                        $state.go('aseguradoras.aseguradoras');
                    });
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }


        function save() {
            var flag = false;
            var nums = [];
            $('.telefono').each(function(telefono) {
                var actual = $(this);
                // var valActual = $(this).val();
                nums.push(actual);
            })
            vm.form.contact_provider.forEach(function(contact) {
                if (!validateEmail(contact.email) || !contact.name || !contact.phone_number) {
                    SweetAlert.swal("ERROR", MESSAGES.ERROR.SELADDRES, "error");
                    flag = true;
                    return;
                }
            });
            if (flag) {
                return;
            }

            var form = angular.copy(vm.form);
            return providerService.updateProvider(form)
                .then(function(data) {
                    form.contact_provider.forEach(function(elem, index) { //jshint ignore:line
                        elem.provider = data.data.url;
                        if (!elem.url) {
                            contactService.createContact(elem);
                        } else {
                            contactService.updateContact(elem);
                        }
                    });
                    vm.address_list.forEach(function(address) {
                        if (address.url) {
                            $http.put(address.url, address);
                        } else {
                            address.aseg = vm.form.url;
                            $http.post(url.IP + 'v1/address/', address);
                        }
                    })
                    toaster.success('Se ha editado correctamente un nuevo proveedor');
                    $state.go('aseguradoras.aseguradoras');
                });

        }

        function cancel() {
            $state.go('aseguradoras.aseguradoras');
        }

        // Contacts
        function deleteContacts(url, index) {
            $localStorage.indx = index;
            $localStorage.urll = url;
            var modalInstance = $uibModal.open({ //jshint ignore:line
                templateUrl: 'app/aseguradoras/aseguradoras.deleteContact.html',
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
                                    vm.form.contact_provider.splice(index, 1); //jshint ignore:line
                                    toaster.success(MESSAGES.OK.DELETECONTRACTOR);
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
                    vm.form.contact_provider.splice(index, 1); //jshint ignore:line
                }
                $uibModalInstance.dismiss('cancel');
            };

            $scope.cancel = function() {
                if ($uibModalInstance)
                    $uibModalInstance.dismiss('cancel');
            };
        }




        function addContact() {
            var contact = {
                    name: '',
                    phone_number: '',
                    email: '',
                    ramo: '',
                    subramo: ''
                } //jshint ignore:line
            vm.form.contact_provider.push(contact); //jshint ignore:line
        }

    }
})();
