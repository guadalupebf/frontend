(function() {
    'use strict';

    angular.module('inspinia')
        .controller('AseguradorasCtrl', AseguradorasCtrl)
        .directive('fooRepeatDone', function() {
            return function($scope, element) {
                if ($scope.$last) { // all are rendered
                    $('.table').trigger('footable_redraw');
                }
            }
        });

    AseguradorasCtrl.$inject = ['SweetAlert', '$scope','$state', '$http', '$q', 'url', 'contactService', 'providerService', 'toaster', 'helpers', 'MESSAGES', '$localStorage',
            '$sessionStorage', 'exportFactory','PersistenceFactory'];

    function AseguradorasCtrl(SweetAlert, $scope,$state, $http, $q, url, contactService, providerService, toaster, helpers, MESSAGES, $localStorage, $sessionStorage,
        exportFactory, PersistenceFactory) {
        var vm = this;
        vm.groups = [];
        vm.submit = submit;
        vm.providers = [];
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
        vm.ramos = []
        vm.ramos = [
                {ramo_name: 'Vida', id: '1'},
                {ramo_name: 'Accidentes y Enfermedades', id: '2'},
                {ramo_name: 'Daños', id: '3'},
        ];
        vm.subramos = []

        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);

        vm.user = usr;

        /* Información de usuario */
        $scope.infoUser = $sessionStorage.infoUser;

        //Contacts
        vm.deleteContacts = deleteContacts;
        vm.addContact = addContact;
        vm.addAddress = addAddress;
        vm.deleteAddress = deleteAddress;
        vm.returnToProvider = returnToProvider;
        vm.getAll = getAll;
        vm.ramos_ = []
        vm.showBinnacle = showBinnacle;
        vm.search = search;
        vm.activate = activate;
        vm.changeRamo = changeRamo;
        vm.changeSubramo = changeSubramo;
        $scope.showCompany = false;
        vm.infoProvider = infoProvider;
        function infoProvider (provider){
            $state.go('aseguradoras.info', {aseguradoraId: provider.id})
        }

        $scope.keyReport = function() {
            var l = Ladda.create( document.querySelector( '.ladda-button2' ) );
            l.start();
            // if($scope.infoUser.staff && !$scope.infoUser.superuser){
            //     // var excel_key = 'v2/claves/claves-excel';
            //     var excel_key = 'service_reporte-v2-claves-excel';  
            var excel_key = 'service_reporte-claves-excel';
            $http({
            method: 'GET',
            url: url.IP + excel_key,
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

        function changeRamo(obj, ramo, index){
            if(ramo){
                if(ramo.id){
                    $http({
                          method: 'GET',
                          url: url.IP + 'ramo-by-id/'+ramo.id
                    })
                    .then(
                      function success(request) {
                        if(request.status === 200 && request.data) {
                            vm.ramos_ = request.data;
                            obj.ramo = vm.ramos_.url;
                            $scope.ramo_url = obj.ramo;
                            if(vm.ramos_.url){
                                $http.get(url.IP+'subramos-by-ramo/'+ramo.id).then(function(subramos) {
                                    vm.subramos = subramos.data;
                                })
                            }
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
                }
            }else{
                toaster.warning("Seleccione un ramo")
            }
            // obj.ramo = vm.ramos_.url;
          if (!ramo){
            vm.subramos = []
            return
          }
          try{
            vm.subramos = ramo.subramo_ramo;
          }
          catch(e){}
        }
        function changeSubramo(obj, subramo, index){
            if(subramo){
                if(subramo.url){
                    obj.subramo= subramo.url;
                }
            }else{
                // SweetAlert.swal("error",'Selecciona un subramo', "error");
                toaster.warning("Seleccione un subramo")
                return;
            }

        }

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


        function submit(isValid) {
            var flag = false;
            if(vm.form.contact_provider.length) {
                vm.form.contact_provider.forEach(function(contact) {
                    if (!validateEmail(contact.email) || !contact.name || !contact.phone_number) {
                        toaster.error(MESSAGES.ERROR.SELADDRES)
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
            if(form.contact.conramo){
                form.contact.conramo.url = $scope.ramo_url
            }
            form.polizas_provider = [];

            return providerService.createProvider(form)
                .then(function(data) {
                    if (!data) {
                        toaster.error('Se ha generado un error al guardar su aseguradora, favor de revisar su información.');
                        return '';
                    } else {
                         if(vm.afianzadora){
                            vm.form.ramos_afianzadora.provider_id = data.id
                            $http.post(url.IP+'create-ramos-afianzadora', vm.form.ramos_afianzadora).success(function(response) {
                              SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWFASTENER, "success");
                            })
                         } else {
                            vm.form.ramos_provider.provider_id = data.id
                            $http.post(url.IP+'create-ramos-provider', vm.form.ramos_provider).success(function(response) {
                                SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWCOMPANY, "success");
                            })
                         }
                        form.contact.forEach(function(contact) {
                            contact.provider = data.url;
                            // contact.conramo.url = $scope.ramo_url
                            contactService.createContact(contact);

                        });
                        $scope.showCompany = false;
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
            // if($scope.infoUser.staff && !$scope.infoUser.superuser){
            //   // var excel_provider = 'v2/aseguradoras/reporte-aseguradoras/';
            //   var excel_provider = 'service_reporte-v2-aseguradoras-excel';  
            var excel_provider = 'service_reporte-aseguradoras-excel';
           
          $http({
            method: 'POST',
            url: url.IP + excel_provider,
            headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
            responseType: "arraybuffer"})
          .then(function(data, status, headers, config) {
            if(data.status == 200){
              var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
              saveAs(blob, 'Reporte_Aseguradora(s).xls');
            } else {
              SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
            }
            l.stop();
          });
        };

        $scope.exportDataSeeker = function (param){
            var data = {cadena : $scope.param_cadena};
            if(param == 1) { // naturales seeker
                // if($scope.infoUser.staff && !$scope.infoUser.superuser){
                //   // var excel_provider_seeker = 'v2/aseguradoras/reporte-seekerProviders/';
                //   var excel_provider_seeker ='service_reporte-v2-seekerAseguradoras-excel';
                var excel_provider_seeker ='service_reporte-seekerAseguradoras-excel';
                
              $http({
                method: 'POST',
                url: url.IP + excel_provider_seeker,
                data: data,
                headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                responseType: "arraybuffer"})
              .then(function(data, status, headers, config) {
                if(data.status == 200){
                  var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                  saveAs(blob, 'Reporte_Aseguradora(s).xls');
                } else {
                  SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
                }
              });
          }
        }
        //-- Peticion de persistencia--//

        var json_data = {};
        var form = document.getElementsByTagName("form");
        var elementos ={};
        //Valores reutilizables
        var interval,interval1, valor;
        var count = 0;

        function set_dataForm(json){
          $scope.showCompany = true;

          interval1 = setInterval(function(){
            if(form.length>1){
              //PersistenceFactory.set_inputs(json);
              seguir();
              clearInterval(interval1);
            }
          },1000)

          function seguir(){

            if(json['vm.form.compania']){
              vm.form.compania = json['vm.form.compania'][0].valor
            }
            if(json['vm.form.alias']){
              vm.form.alias = json['vm.form.alias'][0].valor
            }
            if(json['vm.form.rfc']){
              vm.form.rfc = json['vm.form.rfc'][0].valor
            }
            if(json['vm.form.phone']){
              vm.form.phone = json['vm.form.phone'][0].valor
            }
            if(json['vm.form.website']){
              vm.form.website = json['vm.form.website'][0].valor
            }
          }
        }

        interval = setInterval(function(){
          if(form != undefined && PersistenceFactory.count == 0){//&& PersistenceFactory.count == 0
            PersistenceFactory.inicial(vm.user.org,'Aseguradoras',vm.user.nameFull,PersistenceFactory.get_dataForm(form));
          }
          if(PersistenceFactory.init_return != ''){
            clearInterval(interval);
            if(PersistenceFactory.init_return.status == 'data_view' ){
              set_dataForm(PersistenceFactory.json_return);
            }
            PersistenceFactory.interval = setInterval(function(){
              PersistenceFactory.editado(PersistenceFactory.get_dataForm(form));
            }, PersistenceFactory.intervalTime); /* */
          }
        }, 2000);
        //-- End Peticion de persistencia--//
    }
})();
