(function() {
    'use strict';

    angular.module('inspinia')
        .controller('AseguradorasCtrl', AseguradorasCtrl)

    AseguradorasCtrl.$inject = ['SweetAlert', '$scope','$state', '$http', '$q', 'url', 'contactService', 'providerService', 'toaster', 'helpers', 'MESSAGES', '$localStorage',
            '$sessionStorage', 'exportFactory','$uibModalInstance'];

    function AseguradorasCtrl(SweetAlert, $scope,$state, $http, $q, url, contactService, providerService, toaster, helpers, MESSAGES, $localStorage, $sessionStorage,
        exportFactory,$uibModalInstance) {

        // console.log('ñlklkejñijreiworuweoi');

        var vm = this;
        vm.groups = [];
        vm.submit = submit;
        vm.providers = [];
        $scope.showCompany = false;

        vm.address_list = [{
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
        }];
        vm.form = {
            compania: '',
            rfc: '',
            description: '',
            phone: '',
            website:'',
            contact_provider: [],
            ramo_provider: [],
            ramos_provider : {
                vida: true,
                accidentes : true,
                autos : true,
                danios : true,
                provider_id: 0
            },
            ramos_afianzadora: {
                fidelidad: true,
                judiciales: true,
                administrativas: true,
                credito: true,
                fideicomiso: true,
                provider_id: 0
            }

        };

        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);

        vm.user = usr;

        //Contacts
        vm.deleteContacts = deleteContacts;
        vm.addContact = addContact;
        vm.addAddress = addAddress;
        vm.deleteAddress = deleteAddress;
        vm.returnToProvider = returnToProvider;
        vm.getAll = getAll;
        vm.showBinnacle = showBinnacle;
        vm.search = search;
        vm.activate = activate;
        vm.commentsExportLoading = false;
        vm.exportProviderComments = exportProviderComments;
        // vm.keyReport = keyReport;

        /* Información de usuario */
        $scope.infoUser = $sessionStorage.infoUser;

        activate();

        function addAddress() {
            var address = {
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

        function deleteAddress(index) {
            vm.address_list.splice(index, 1);
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        $scope.filterValue = function($event){
          if(isNaN(String.fromCharCode($event.charCode))){
            $event.preventDefault();
          }
        };

        $scope.keyReport = function() {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            $http({
            method: 'GET',
            // url: url.IP +'claves-excel',
            url: url.IP +'service_reporte-claves-excel',
            headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
            responseType: "arraybuffer"})
          .then(function(data, status, headers, config) {
            if(data.status == 200){
              var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
              saveAs(blob, 'Reporte_Claves.xls');
            } else {
              SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
            }
            l.stop();
          });
        }

        function submit(isValid) {
            var flag = false;
            if(vm.form.contact_provider.length) {

                vm.form.contact_provider.forEach(function(contact) {
                    if (!validateEmail(contact.email) || !contact.name || !contact.phone_number) {
                        SweetAlert.swal("ERROR", MESSAGES.ERROR.SELADDRES, "error");
                        flag = true;
                        return;
                    }
                });
            }
            if(!vm.afianzadora){
                if(vm.form.ramos_provider) {
                    if(!vm.form.ramos_provider.accidentes){
                        if(!vm.form.ramos_provider.danios){
                            if(!vm.form.ramos_provider.vida){
                                if(!vm.form.ramos_provider.autos){
                                    SweetAlert.swal("Error", "Debe capturar al menos un ramo", "error");
                                    return;
                                }
                            }
                        }
                    }
                }
                vm.form.provider_type = 1;
            } else {
                vm.form.provider_type = 2;
                if(vm.form.ramos_afianzadora) {
                    if(!vm.form.ramos_afianzadora.fidelidad){
                        if(!vm.form.ramos_afianzadora.judiciales){
                            if(!vm.form.ramos_afianzadora.administrativas){
                                if(!vm.form.ramos_provider.credito){
                                    if(!vm.form.ramos_afianzadora.fideicomiso){
                                        SweetAlert.swal("Error", "Debe capturar al menos un ramo", "error");
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (flag) {
                return;
            }
            var form = angular.copy(vm.form);
            var arr = [];
            var nums = [];

            $('.telefono').each(function(telefono) {
                var actual = $(this);
                nums.push(actual);
            })

            if(vm.form.contact_provider.length) {

                vm.form.contact_provider.forEach(function(elem, index) {
                    arr.push(elem);
                });
            }

            form.contact = arr;
            form.polizas_provider = [];

            return providerService.createProvider(form)
                .then(function(data) {
                    if (!data) {
                        SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORCREATECOMPANY, "error");
                        return '';
                    } else {
                         if(vm.afianzadora){
                            vm.form.ramos_afianzadora.provider_id = data.id
                            $http.post(url.IP+'create-ramos-afianzadora', vm.form.ramos_afianzadora).success(function(response) {
                            })
                         } else {
                            vm.form.ramos_provider.provider_id = data.id
                            $http.post(url.IP+'create-ramos-provider', vm.form.ramos_provider).success(function(response) {
                            })
                         }
                        form.contact.forEach(function(contact) {
                            contact.provider = data.url;
                            contactService.createContact(contact);

                        });
                        toaster.success('Se ha agregado correctamente una nueva aseguradora');
                    }
                    vm.providers.push(data);
                    vm.form = {};
                    vm.address_list.forEach(function(address) {
                        address.administrative_area_level_1 = address.administrative_area_level_1.state;
                        address.administrative_area_level_2 = address.administrative_area_level_2.city;
                        address.aseg = data.url;
                        $http.post(url.IP + 'v1/address/', address).then(function(response) {
                        });
                    });
                    vm.address_list = [];
                    addAddress();

                    vm.form = {
                        compania: '',
                        rfc: '',
                        description: '',
                        phone: '',
                        contact_provider: [],
                        ramo_provider: [],
                        ramos_provider : {
                            vida: true,
                            accidentes : true,
                            autos : true,
                            danios : true,
                            provider_id: 0
                        },
                        ramos_afianzadora: {
                            fidelidad: true,
                            judiciales: true,
                            administrativas: true,
                            credito: true,
                            fideicomiso: true,
                            provider_id: 0
                        }
                    }
                });
            $scope.showCompany = false;
        }


        $scope.cancel = function(){
            $scope.showCompany = false;
            if ($uibModalInstance) {
                $uibModalInstance.dismiss('cancel');
            }
        }

        function activate() {

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


        function getAll() {
            vm.providers = [];
            vm.buttonReport = false;
            return getProviders();
        }

        function returnToProvider() {
            vm.show_binnacle= false;
        }


        function search(cadena) {
            $scope.param_cadena = cadena;
            vm.show_binnacle = false;

            $scope.show_pagination = false;
            vm.providers = [];
            if (cadena.length) {
                // if($scope.infoUser.staff && !$scope.infoUser.superuser){
                //   var filter_provider = 'v2/generics/seeker-provider/';
                var filter_provider = 'seeker-provider/';
              $http({
                  method: 'GET',
                  url: url.IP + filter_provider,
                  params: {
                      cadena: cadena
                  }
              })
              .then(
                  function success(request) {
                    if(request.status === 200 && request.data.results.length) {
                      vm.providers = request.data.results;
                        vm.config_pagination =request.data;
                        $scope.show_pagination = true;
                    } else {
                        toaster.warning("No se encontraron registros")
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
                vm.providers = [];
              }
        }

        function getProviders() {
            vm.show_binnacle = false;
             return providerService.getReadListTableProviders()
                .then(function(data) {
                    vm.providers = data.data.results;
                    vm.config_pagination = data.config;
                    $scope.show_pagination = true;

                });
        }
        //-----------------------------------------------------------comments
        function showBinnacle(param) {
          vm.show_binnacle = true;
          vm.provider_id = param.id;
          $http({
            method: 'GET',
            url: url.IP+'comments/',
            params: {
              'model': 11,
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

        function exportProviderComments() {
            if (!vm.provider_id || vm.commentsExportLoading) {
                return;
            }
            vm.commentsExportLoading = true;

            var resetLoading = function() {
                vm.commentsExportLoading = false;
                $scope.$evalAsync(function() {});
            };

            var paramsObj = {
                model: 11,
                id_model: vm.provider_id
            };
            if (vm.org_name) {
                paramsObj.org = vm.org_name;
            }

            toaster.info('Generando...', 'El archivo se está generando, espera un momento.');

            exportFactory.commentsExport({
                params: paramsObj,
                downloadName: 'bitacora-proveedor.xlsx',
                token: vm.token
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

        // Contacts
        function deleteContacts(url, index) {
            if (url && index || url && !index) {
                try {
                    return contactService.deleteContact(url)
                        .then(function() {
                            vm.form.contact_provider.splice(index, 1); //jshint ignore:line
                            toaster.success(MESSAGES.OK.DELETECONTRACTOR);
                        });
                } catch (err) {
                    throw (err); // toaster.error('Agregue al menos un contacto' + err.message);
                }
                $uibModalInstance.dismiss('cancel');
            } else {
                vm.form.contact_provider.splice(index, 1); //jshint ignore:line
            }
        }

        function addContact() {
            var contact = {
                    name: '',
                    phone_number: '',
                    email: '',
                    departament: ''
                } //jshint ignore:line
            vm.form.contact_provider.push(contact);
        }

        vm.clearFilter = function() {
            $('.filter-status').val('');
            $('.footable').trigger('footable_clear_filter');
        };

        vm.filteringEventHandler = function(e) {
            var selected = $('.filter-status').find(':selected').text();
            if (selected && selected.length > 0) {
                e.filter += (e.filter && e.filter.length > 0) ? ' ' + selected : selected;
                e.clear = !e.filter;
            }
        };

        vm.filterByStatus = function() {
            $('.footable').trigger('footable_filter', {
                filter: $('#filter').val()
            });
        };

        vm.filter = {
            status: null
        };

        $scope.exportData = function (aseguradoras) {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            $http.get(url.IP + 'reporte-aseguradoras/')
            .then(
                function success(request) {
                    l.stop();
                    exportFactory.excel(request.data, 'Aseguradoras')
                },
                function error(error) {
                    l.stop();
                    console.log('error', error);
                }
            )
            .catch(function(e) {
                l.stop();
                console.log(e);
            })

        };
        $scope.exportDataSeeker = function (param){
            var data = {cadena : $scope.param_cadena};
            if(param == 1) { // naturales seeker
            $http({
              method: 'GET',
              url: url.IP +'reporte-seekerProviders/',
              params: data
            })
            .then(function (request) {
              if(request.status === 200) {
                  exportFactory.excel(request.data, 'Paquetes');
              }

            })
            .catch(function (e) {
              console.log('e', e);
            });


          }
        }

    }
})();
