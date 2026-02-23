(function() {
    'use strict';

    angular.module('inspinia')
        .controller('FianzasEditCtrl', FianzasEditCtrl);

    FianzasEditCtrl.$inject = ['$q', '$rootScope','SweetAlert', 'insuranceService', '$parse', 
      'MESSAGES', '$state', 'toaster', 'url', '$http', 'dataFactory', '$stateParams', '$sessionStorage', 
      '$scope', 'FileUploader', 'datesFactory', 'providerService','$localStorage','emailService', 
      '$location', 'helpers', '$uibModal'];

    function FianzasEditCtrl($q, $rootScope, SweetAlert, insuranceService, $parse, MESSAGES, $state, 
        toaster, url, $http, dataFactory, $stateParams, $sessionStorage, $scope, FileUploader, 
        datesFactory, providerService,$localStorage,emailService, $location, helpers, $uibModal) {
          
        var vm = this;

        /* Información de usuario */
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);

        // varibles
        vm.show = {
            firstTab: true,
            ot: true
        };

        vm.org_name = usr.org;
        $scope.create_natural = true;
        $scope.create_juridical = true;

        var dateOffset = (24*60*60*1000) * 1; //1 days
        var now = new Date()
        var endDate = now.setFullYear(now.getFullYear() + 1)
        endDate = new Date(endDate).setTime(new Date(endDate).getTime() - dateOffset );
        vm.defaults = {};
        vm.form = {
            contratante: '',
            folio: '',
            afianzadora: '',
            start_of_validity: datesFactory.convertDate(new Date()),
            end_of_validity: datesFactory.convertDate(endDate),
            emision: datesFactory.convertDate(new Date()),
            date_emision_factura: '',
            date_maquila: '',
            year_factura: '',
            date_bono: '',
            ceder_comision: false,
            comision_percent: 0.0,
            udi: 0.0,
            vendor : '',
            benefiaciario_seleccionado : '',
            status: 1,
            identifier : ''

        };
        
        $rootScope.show_contractor = false;


        $scope.dataToSave = {};
        vm.form.referenciadores = [{referenciador:''}];
        vm.fianza_history = null;
        vm.fianza_info = null;
        // funciones
        vm.contratanteCreatorModalEvent = contratanteCreatorModalEvent;
        vm.aseguradoraSelection = aseguradoraSelection;
        vm.changeRamo = changeRamo;
        vm.changeSubramo = changeSubramo;
        vm.changeTipo = changeTipo;
        vm.addBene = addBene;
        vm.deleteBene = deleteBene;
        vm.cancel = cancel;
        vm.checkDate = checkDate;
        // diccionarios // 
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
            }else if(perm.model_name == 'Referenciadores'){
              vm.acceso_refereciador = perm
              vm.acceso_refereciador.permissions.forEach(function(acc){
                if (acc.permission_name == 'Cambiar refrenciador en pólizas') {
                  if (acc.checked == true) {
                    vm.acceso_chng_ref = true
                  }else{
                    vm.acceso_chng_ref = false
                  }
                }
                if (acc.permission_name == 'Ver referenciadores') {
                  if (acc.checked == true) {
                    vm.acceso_ver_ref = true
                  }else{
                    vm.acceso_ver_ref = false
                  }
                }
              })
            }
            if (perm.model_name == 'Reportes') {
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
            }else if(perm.model_name == 'Comisiones'){
                vm.acceso_dash = perm
                vm.acceso_dash.permissions.forEach(function(acc){
                  if (acc.permission_name == 'Comisiones') {
                    if (acc.checked == true) {
                      vm.permiso_comisiones = true
                    }else{
                      vm.permiso_comisiones = false
                    }
                  }
                })
              }
          })
        }

        /* Watchs */
        $scope.$watch('vm.form.contratante.value', function(newValue, oldValue) {
          if(vm.form.contratante) {
            if(vm.vendors){
              vm.vendors.some(function(user) {
                if (user.url == vm.form.contratante.value.vendor){
                  if(true){
                    vm.form.vendor = user.id;
                    user.name = user.first_name + ' '+user.last_name;
                    vm.form.vendor = user;
                  }
                }
              })
            }

            if(vm.form.contratante.value.j_name) {
              vm.form.contratante.val = vm.form.contratante.value.j_name
            }

            if(vm.form.contratante.value.full_name) {
              vm.form.contratante.val = vm.form.contratante.value.full_name
            }

            // if (vm.form.contratante.value.address_natural){
            //     vm.defaults.address = vm.form.contratante.value.address_natural
            // } else{
            //     vm.defaults.address = vm.form.contratante.value.address_juridical
            // }
            vm.defaults.address = vm.form.contratante.value.address_contractor

            if (vm.form.contratante.value.phone_number){
              vm.form.contratante.phone_number = vm.form.contratante.value.phone_number
            }

            if (vm.form.contratante.value.email){
              vm.form.contratante.email = vm.form.contratante.value.email
            }

            try{
              if(vm.defaults.address.length == 1){
                vm.form.address = vm.defaults.address[0];
              } else if(vm.defaults.address.length > 1) {
                vm.form.address = vm.defaults.address[0];
              }
            }
            catch (err){

            }
          }
        });


        $scope.checkFechaFactura = function (date) {
          var date_initial = (date).split('/');
          var day = date_initial[0];
          var month = date_initial[1];
          var year = parseInt(date_initial[2]);
          vm.form.month.month_selected = parseInt(month)
          vm.form.year_factura = year
        };

        // funciones iniciales
        var curr_date = now.getDate();
        var curr_month = now.getMonth() + 1;
        var curr_year = now.getFullYear();

        $http.get(url.IP + 'usuarios/')
        .then(function(users) {
            $scope.usuarios = users.data.results;
        });


        $scope.renewalSelection = function(ren) {
          $scope.dataToSave.is_renewable = vm.form.renewal.is_renewable;
          if(!$localStorage.save_edition_fianza){
            $localStorage.save_edition_fianza = angular.copy(vm.form);
          }
          $localStorage.save_edition_fianza['is_renewable'] = vm.form.renewal.is_renewable;
        }

        $scope.years=[]
        var actualYear = new Date().getFullYear();
        var oldYear = actualYear - 80;
        for (var i = actualYear + 10; i >= oldYear; i--) {
          $scope.years.push(i);
        }
        activate();
        function activate() {
          $scope.esrenovacion = false;
          $scope.reexpedir = 0;
          if (($location.path().indexOf('renovacion') != -1)) {
            $scope.titulo_vista = 'Renovación';
            $scope.esrenovacion = true;
          }else{
            $scope.titulo_vista = 'Edición';
          }

          dataFactory.get('leer-fianzas-edit/' + $stateParams.polizaId)
          .then(function success(response) {
            vm.id_fianza = response.data.id
            $scope.cansamenumberpolicy=false
            $http({
              method: 'GET',
              url: url.IP + 'historic-policies/',
              params: {
                actual_id: vm.id_fianza
              }
            }).then(function success(response) {
              if(response.data.results.length){
                vm.showHistoric = true;
              }
              vm.policy_history = [];
              vm.policy_history.renovada = [];
              response.data.results.forEach(function (old) {
                if(old.new_policy.id ==vm.id_fianza){
                  $scope.cansamenumberpolicy=true
                }
                if(vm.id_fianza != old.base_policy.id){
                  vm.policy_history.push(old.base_policy);
                } else {
                  vm.policy_history.push(old.new_policy);
                }
                if(vm.id_fianza == old.base_policy.id){
                  vm.policy_history.renovada.push(old.base_policy);
                } 
              })
            })
            if($localStorage.save_edition_fianza){
              if($localStorage.save_edition_fianza['id'] == response.data.id){
                vm.form = $localStorage.save_edition_fianza;
                $scope.copy_form = angular.copy($localStorage.save_edition_fianza);
              }else{
                vm.form = response.data;
                $scope.copy_form = angular.copy(response.data);
              }
            }else{
              vm.form = response.data;
              $scope.copy_form = angular.copy(response.data);
            }
            vm.form = response.data;
            vm.form.start_of_validity = datesFactory.convertDate(response.data['start_of_validity']);
            vm.form.end_of_validity = datesFactory.convertDate(response.data['end_of_validity']);
            vm.form.date_emision_factura = response.data['date_emision_factura'] ? datesFactory.convertDate(response.data['date_emision_factura']): '';
            vm.form.date_bono = response.data['date_bono'] ? datesFactory.convertDate(response.data['date_bono']): '';
            vm.form.date_maquila = response.data['date_maquila'] ? datesFactory.convertDate(response.data['date_maquila']): '';
            vm.form.renewal = {};
            if($localStorage.save_edition_fianza && $localStorage.save_edition_fianza['id'] ==vm.form.id){
              vm.form.renewal.is_renewable = $localStorage.save_edition_fianza['is_renewable'];
            }else{
              vm.form.renewal.is_renewable = vm.form.is_renewable ? vm.form.is_renewable : 2;
            }
            vm.form.renewal.options = [
                {'value':1,'label':'Renovable'},
                {'value':2,'label':'No Renovable'},
            ]
            if($stateParams.renovacion && $stateParams.renovacion == 2){
              var end_date_aux = datesFactory.toDate(vm.form.end_of_validity)
              vm.form.start_of_validity = vm.form.end_of_validity;
              
              var end_date_aux = end_date_aux.setFullYear(end_date_aux.getFullYear() + 1)
              


              var dateOffset = (24*60*60*1000) * 1; //1 days
              end_date_aux = new Date(end_date_aux).setTime(new Date(end_date_aux).getTime() - dateOffset );


              var endDate = end_date_aux;

              vm.form.end_of_validity = datesFactory.convertDate(end_date_aux);
              vm.form.status = 1;
              vm.form.internal_number = '';
            }
            if($localStorage.save_edition_fianza && $localStorage.save_edition_fianza['id'] ==vm.form.id){
              vm.form.bono_variable = $localStorage.save_edition_fianza['bono_variable'];
            }else{
              vm.form.bono_variable = response.data.bono_variable;
            }

            $scope.showPrograma = vm.form.has_programa_de_proveedores;
            if(vm.form.programa_de_proveedores_contractor){
              if(vm.form.programa_de_proveedores_contractor){
                $scope.url_solidario = vm.form.programa_de_proveedores_contractor;
              }
              $http.get($scope.url_solidario)
              .then(function(request) {

                vm.contratante = {};
                if(request.data.address_contractor){
                  vm.contratante.val = request.data.full_name;
                  vm.contratante.value = request.data;
                }
              });
            }

            if($stateParams.reexpedir && $stateParams.reexpedir == 1){
              $scope.reexpedir = $stateParams.reexpedir;
              dataFactory.get('leer-fianzas-info/' + $stateParams.polizaId)
              .then(function success(response) {
                vm.fianza_info = response.data;
                if(response.status == 200){
                  $http({
                    method: 'GET',
                    url: url.IP + 'view-endosos',
                    params: {
                      policy: response.data.id
                    }
                  })
                  .then(function success(response_endosos) {
                    $scope.endososFianza = response_endosos.data.endosos;
                  })
                  .catch(function(e){
                    console.log('error', e);
                  });


                  dataFactory.get('historic-policies/',{ actual_id: response.data.id})
                  .then(function success(response_historic) {
                    response_historic.data.results.forEach(function function_name(old) {
                      if(response.data.id == old.new_policy.id){
                        vm.fianza_history = old.base_policy;
                      }
                    });
                  });

                }
              })
            }
            
            // vm.form.emision_date = datesFactory.convertDate(new Date());
            vm.form.emision_date = response.data['emision_date'] ? datesFactory.convertDate(response.data['emision_date']): datesFactory.convertDate(new Date());
            if($localStorage.save_edition_fianza && $localStorage.save_edition_fianza['id'] ==vm.form.id){
              vm.form.tipo = $localStorage.save_edition_fianza['tipo'];
            }else{
              vm.form.tipo = vm.form.fianza_type;
            }
            delete vm.form.fianza_type;
            vm.form.currency={};
            vm.form.currency.options = [
                {'value':1,'label':'PESOS'},
                {'value':2,'label':'DOLARES'},
            ]

            vm.form.month={};
            vm.form.month.options = [
                {'value':0,'label':''},
                {'value':1,'label':'Enero'},
                {'value':2,'label':'Febrero'},
                {'value':3,'label':'Marzo'},
                {'value':4,'label':'Abril'},
                {'value':5,'label':'Mayo'},
                {'value':6,'label':'Junio'},
                {'value':7,'label':'Julio'},
                {'value':8,'label':'Agosto'},
                {'value':9,'label':'Septiembre'},
                {'value':10,'label':'Octubre'},
                {'value':11,'label':'Noviembre'},
                {'value':12,'label':'Diciembre'},
            ]
            
            vm.form.month.month_selected =response.data['month_factura'];

            if($localStorage.save_edition_fianza ){
              if($localStorage.save_edition_fianza && $localStorage.save_edition_fianza['id'] ==vm.form.id){
                vm.form.currency.currency_selected = $localStorage.save_edition_fianza['currency']['currency_selected'];
              }else{
                vm.form.currency.currency_selected = response.data['f_currency'];
              }
            }else{
              vm.form.currency.currency_selected = response.data['f_currency'];
            }

            vm.form.contratante = {};
            vm.defaults.address = vm.form.contractor.address_contractor;
            vm.form.contratante.value = vm.form.contractor ;
            vm.form.contratante.val = vm.form.contractor.full_name;
            // }
            if(vm.form.address){
              $http.get(vm.form.address).then(function(addressResponse){
                vm.form.address = addressResponse.data;
              });              
            }else{
              toaster.error('Sin dirección en la Fianza, se tomará la primera del Fiado')
            }

            // vm.form.referenciadores = vm.form.ref_policy ? vm.form.ref_policy : $scope.usuarios;
            vm.form.referenciadores = [];
            vm.form.subforms = {};
            $http.get(url.IP + 'get-vendors/')
            .then(function(user){
              $scope.referenciadores = user.data;
              var vendedor = {
                referenciador: '',
                comision_vendedor: ''
              };
              $scope.referenciador = vendedor
              // vm.form.referenciadores.push(vendedor);
            })
            .catch(function(e){
              console.log('error', e);
            });
            // Referenciadores
            if(vm.form.ref_policy){
              if(vm.form.ref_policy.length > 0){
                vm.form.ref_policy.forEach(function(refs){
                  $http.get(refs.referenciador).then(function success(response_ref_plicy){
                    if(response_ref_plicy){
                      refs.data = response_ref_plicy.data
                      refs.referenciador = response_ref_plicy.data.url
                      refs.selectedRef = true
                      vm.form.referenciadores.push(refs)
                    }
                  })
                });
              }else{
                vm.form.referenciadores.push($scope.referenciador)
              }
            }
            else{
              vm.form.referenciadores.push($scope.referenciador)
            }
            // Referenciadores---
            if($localStorage.save_edition_fianza ){
              if($localStorage.save_edition_fianza && $localStorage.save_edition_fianza['id'] ==vm.form.id){
                vm.form.subforms.contract = $localStorage.save_edition_fianza['contract_poliza']; 
              }else{
                vm.form.subforms.contract = vm.form.contract_poliza;
              }
            }else{
              vm.form.subforms.contract = vm.form.contract_poliza;
            }
            // vm.form.renewal.is_renewable = vm.form.is_renewable;
            try{
              vm.form.subforms.contract.amount = parseFloat(vm.form.subforms.contract.amount ? vm.form.subforms.contract.amount : 0);
            }catch(err){}
            try{
              vm.form.subforms.contract.amount_iva = parseFloat(vm.form.subforms.contract.amount_iva);
            }catch(err){}
            try{
              vm.form.subforms.contract.guarantee_amount = parseFloat(vm.form.subforms.contract.guarantee_amount ? vm.form.subforms.contract.guarantee_amount : 0);
            }catch(err){}
            try{
              vm.form.subforms.contract.guarantee_percentage = parseFloat(vm.form.subforms.contract.guarantee_percentage);
            }catch(err){}
            try{
              vm.form.subforms.contract.no_employees = parseFloat(vm.form.subforms.contract.no_employees);
            }catch(err){}
            try{
              vm.form.subforms.contract.number_inclusion = parseFloat(vm.form.subforms.contract.number_inclusion);
            }catch(err){}
            try{
              vm.form.subforms.contract.rate = parseFloat(vm.form.subforms.contract.rate);
            }catch(err){}
            try{
              vm.form.subforms.contract.deductible_percentage = parseFloat(vm.form.subforms.contract.deductible_percentage);
            }catch(err){}

            try{
              vm.form.subforms.contract.start = datesFactory.convertDate(vm.form.subforms.contract.start);
              vm.form.subforms.contract.end = datesFactory.convertDate(vm.form.subforms.contract.end);
              vm.form.subforms.contract.sign_date = datesFactory.convertDate(vm.form.subforms.contract.sign_date);
            }
            catch(err){
              console.log('***********',vm.form.subforms.contract)
            }
            vm.form.subforms.beneficiaries_fianza = vm.form.beneficiaries_poliza_many;
            if (vm.form.subforms.beneficiaries_fianza.length == 0){
                vm.form.subforms.beneficiaries_fianza = [{
                    first_name: '',
                    last_name: '',
                    second_last_name: '',
                j_name: '',
                    rfc: '',
                    email: '',
                    phone_number: '',
                type_person: 1,
                }];
            }

            dataFactory.get('polizas/' + $stateParams.polizaId + '/archivos/').then(function success(response) {
              if($stateParams.renovacion && $stateParams.renovacion == 2){
                $scope.files = []
              }else{
                $scope.files = response.data.results;
              }
            })         

            dataFactory.get('ramos-by-provider/'+vm.form.aseguradora)
              .then(
                function success (response) {
                  vm.defaults.ramos = response.data;
                  vm.defaults.ramos.forEach(function(ramo) {
                    if(ramo.id == vm.form.ramo.id){
                      vm.defaults.subramos = ramo.subramo_ramo;
                      vm.changeSubramo();
                      vm.defaults.subramos.forEach(function(subramo) {
                        if(subramo.id == vm.form.subramo.id){
                            vm.defaults.types = subramo.type_subramo;
                        }
                      })
                    }
                  })
                },
                function error (e) {
                  console.log('Error - ramos-by-provider', e);
                })
               .catch(function (error) {
                 console.log('Error - ramos-by-provider - catch', error);
               });

              dataFactory.get('afianzadoras/'+vm.form.aseguradora)
              .then(function success(response) {
                vm.form.aseguradora = response.data;
                get_claves();
              })
          })


            insuranceService.getVendors()
            .then(function success(data) {
            vm.vendors = data.data;
            vm.vendors.forEach(function(vendor) {
              vendor.name = vendor.first_name + ' ' + vendor.last_name;
            });
            },
            function error(error) {
              SweetAlert.swal('No pudieron ser cargados referenciadores', "", "error");
            })


        

            var curr_date = now.getDate();
            var curr_month = now.getMonth() + 1;
            var curr_year = now.getFullYear();
            providerService.getProviderFiByKey(curr_year + "-" + curr_month + "-" + curr_date)
              .then(
                  function success(data) {
                    vm.defaults.providers = data.data;
                  },
                  function error(err) {
                    console.log('error', err);
              });

        }

        $scope.save_info_tab = function(){
          if(!$localStorage.save_edition_fianza){
            $localStorage.save_edition_fianza = angular.copy(vm.form);
          }
          $localStorage.save_edition_fianza['contract_poliza'] = vm.form.subforms.contract;
        }

        $scope.changeFolio = function(){
          if(!$localStorage.save_edition_fianza){
            $localStorage.save_edition_fianza = angular.copy(vm.form);
          }
          $localStorage.save_edition_fianza['internal_number'] = $scope.surety.internal_number;
        }

        $scope.changeProgram = function(param){
          $scope.showPrograma = param;
        };

        $scope.checkNumFianza = function () {
          if(vm.form.poliza_number){
            if($scope.copy_form.poliza_number != vm.form.poliza_number){
              if($scope.cansamenumberpolicy){
                console.log('viene de renovación',$scope.cansamenumberpolicy)
              }else{
                helpers.existPolicyNumber(vm.form.poliza_number)
                .then(function(request) {
                  if(request == true) {
                    SweetAlert.swal("Error", "El número de fianza ya existe.", "error");
                    vm.form.poliza_number = '';
                  }
                })
                .catch(function(err) {
                });
              }
            }else{
              if(!$localStorage.save_edition_fianza){
                $localStorage.save_edition_fianza = angular.copy(vm.form);
              }
              $localStorage.save_edition_fianza['poliza_number'] = vm.form.poliza_number;
            }
          }
        };


        $scope.agregarBeneficiario = function(parWord) {
          var beneficiario = parWord.value;
          if(vm.form.subforms.beneficiaries_fianza.length == 1){
            
            if(vm.form.subforms.beneficiaries_fianza[0].first_name == "" && vm.form.subforms.beneficiaries_fianza[0].j_name == "" && vm.form.subforms.beneficiaries_fianza[0].rfc == "" && vm.form.subforms.beneficiaries_fianza[0].email == ""){
              vm.form.subforms.beneficiaries_fianza[0] = beneficiario;
            }
            else{
              vm.form.subforms.beneficiaries_fianza.push({
                first_name: beneficiario.first_name,
                last_name: beneficiario.last_name ,
                second_last_name: beneficiario.second_last_name ,
                j_name: beneficiario.j_name ,
                rfc: beneficiario.rfc ,
                email: beneficiario.email ,
                phone_number: beneficiario.phone_number ,
                type_person:beneficiario.type_person ,
                url : beneficiario.url,
                id: beneficiario.id
              });
            }

            // vm.form.subforms.beneficiaries_fianza[0] = beneficiario;
          }
          else{
            vm.form.subforms.beneficiaries_fianza.push({
              first_name: beneficiario.first_name,
              last_name: beneficiario.last_name ,
              second_last_name: beneficiario.second_last_name ,
              j_name: beneficiario.j_name ,
              rfc: beneficiario.rfc ,
              email: beneficiario.email ,
              phone_number: beneficiario.phone_number ,
              type_person:beneficiario.type_person ,
              url : beneficiario.url,
              id: beneficiario.id
            });
          }

        }


        function checkDate(parDate) {
          if(parDate == 'initial'){
            var dateOffset = (24*60*60*1000) * 1; //1 days
            var now = datesFactory.toDate(vm.form.start_of_validity);
            var endDate = now.setFullYear(now.getFullYear() + 1)
            vm.form.end_of_validity = datesFactory.convertDate(new Date(endDate).setTime(new Date(endDate).getTime() - dateOffset ));
          } 
        }



        function contratanteCreatorModalEvent() {
          $rootScope.show_contractor = true;
          $scope.orderInfo = vm;
          $localStorage.orderForm = JSON.stringify(vm.form);
        }


        $scope.matchesContractors = function(parWord) {
          $scope.contractors_data = 0;
          var word_data = vm.form.contratante.val;
          if(word_data) {
            if(word_data.length >= 3) {
              if(vm.org_name =='ancora'){
                $scope.show_contratante = 'contractors-match-fianzas/';
              }else{
                $scope.show_contratante = 'contractors-match/';
              }
              $http.post(url.IP + $scope.show_contratante,
                {
                  'matchWord': parWord
                })
              .then(function(response) {

                // if(response.status === 200 && (response.data.juridicals || response.data.naturals)) {
                if(response.status === 200 && (response.data.contractors)) {
                  var source = [];
                  var contratactorsFound = response.data.contractors;
                  if(contratactorsFound.length) {
                    contratactorsFound.forEach(function(item) {
                      if(item.full_name) {
                        var obj = {
                          label: item.full_name,
                          value: item
                        };
                      } else {
                       var obj = {
                          label: item.first_name+' '+ item.last_name+' '+ item.second_last_name,
                          value: item
                        }; 
                      }                  
                      source.push(obj)
                    });
                  }
                  $scope.contractors_data = source;
                }
              });
            }
          } else {
            $scope.contractors_data = [];
          }
        };


        $scope.matchesBeneficiary = function(parWord) {
          $scope.beneficiaries_data = [];
          var word_data = parWord;
          if(word_data) {
            if(word_data.length >= 3) {
                $scope.show_contratante = 'BeneficiariesExistentes/';
              // $http.post(url.IP + $scope.show_contratante,
              //   {
              //     'matchWord': parWord
              //   })
              $http({
                method: 'GET',
                url: url.IP+$scope.show_contratante,
                params: {
                  'matchWord': parWord,
                }
              })
              .then(function(response) {
                if(response.status === 200) {
                  response.data.results.forEach(function(item) {
                    $scope.beneficiaries_data.push({
                      label: item.type_person == 1 ? item.full_name:item.j_name,
                      value: item
                    });
                  });
                }
              });
            }
          }
        };


        function aseguradoraSelection() {
            if(vm.form.aseguradora){
              get_claves();
            }

         $http.get(url.IP + 'ramos-by-provider/'+vm.form.aseguradora.id)
         .then(
           function success (response) {
             vm.defaults.ramos = response.data;
           },
           function error (e) {
             console.log('Error - ramos-by-provider', e);
           })
          .catch(function (error) {
            console.log('Error - ramos-by-provider - catch', error);
          });
        };


        function get_claves() {

            var date = new Date(vm.form.start_of_validity);
            if(isNaN(date)) {
                var date = new Date(datesFactory.mesDiaAnio(vm.form.start_of_validity));
            }
            if(vm.form.aseguradora && vm.form.aseguradora.id){
              $http.get(url.IP+'claves-by-provider/'+vm.form.aseguradora.id)
              .then(
                function success(clavesResponse) {
                clavesResponse.data.forEach(function(clave) {
                    clave.clave_comision.forEach(function(item) {
                        item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
                    });
                });

                vm.defaults.claves=clavesResponse.data;
                if(vm.defaults.claves.length== 1) {
                    vm.form.clave = vm.defaults.claves[0];
                    try{
                        vm.form.comision_percent = (vm.form.clave.comission);
                        vm.form.udi = (vm.form.clave.udi);
                    }
                    catch(e){}
                    }
                },
                function error (e) {
                    console.log('Error - claves-by-provider', e);
                })
                .catch(function (error) {
                    console.log('Error - claves-by-provider - catch', error);
                });
        
            }
        }

        function changeRamo() {
            vm.defaults.subramos = vm.form.ramo.subramo_ramo;
            vm.defaults.subramos.forEach(function (subramo,index) {
              if (subramo.subramo_name == 'Colectivas'){
                vm.defaults.subramos.splice(index, 1);
              }
            })
        };

        function changeSubramo(s) {
          if(vm.form.subramo){
            vm.defaults.types = vm.form.subramo.type_subramo;
            get_claves();
          }

          vm.defaults.formInfo = {
            code: vm.form.subramo.subramo_code,
            name: vm.form.subramo.subramo_name
          };
          vm.defaults.comisiones = [];

          if(vm.form.clave){
            if(vm.form.clave.clave_comision.length) {
              vm.form.clave.clave_comision.forEach(function(item) {
                if(vm.form.subramo.subramo_name == item.subramo) {
                  vm.defaults.comisiones.push(item);
                }
              });

              if(vm.defaults.comisiones){
                if(!vm.defaults.comisiones.length) {
                   SweetAlert.swal({
                      title: 'Error',
                      text: "Debe tener al menos una comisión capturada para la clave seleccionada",
                      type: "error",
                      showCancelButton: false,
                      confirmButtonColor: "#DD6B55",
                      confirmButtonText: "Aceptar",
                      cancelButtonText: "Cancelar",
                      closeOnConfirm: true
                  }, function(isConfirm) {
                      if (isConfirm) {
                      }
                  });
                }
              }

              if(vm.defaults.comisiones.length == 1){
                vm.form.comision = vm.defaults.comisiones[0];
              }
            }
          }
        };

        function changeTipo(tipo) {
          if(!$localStorage.save_edition_fianza){
            $localStorage.save_edition_fianza = angular.copy(vm.form);
          }
          $localStorage.save_edition_fianza['tipo'] = tipo;
        }

        $scope.changeCurrency = function() {
          if(!$localStorage.save_edition_fianza){
            $localStorage.save_edition_fianza = angular.copy(vm.form);
          }
          $localStorage.save_edition_fianza['currency'] = vm.form.currency;
        }

        $scope.changeBono = function(param) {
          if(!$localStorage.save_edition_fianza){
            $localStorage.save_edition_fianza = angular.copy(vm.form);
          }
          $localStorage.save_edition_fianza['bono_variable'] = param;
        }


        $scope.addReferenciador = function(type) {
          var addReferenciadores = {
            referenciador: ''
          };
          vm.form.referenciadores.push(addReferenciadores);
        }

        $scope.deleteReferenciador = function(index, type) {
          vm.form.referenciadores.splice(index, 1);
            
        }

        function addBene(){
            var beneficiario = {
                first_name: '',
                last_name: '',
                second_last_name: '',
            j_name: '',
                rfc: '',
                email: '',
                phone_number: '',
            type_person: 1,
            };
            vm.form.subforms.beneficiaries_fianza.push(beneficiario);
        }

        function deleteBene(index){
            if(vm.form.subforms.beneficiaries_fianza.length > 1){
                vm.form.subforms.beneficiaries_fianza.splice(index, 1);
            }
        }
        $scope.formatearNumero = function(nStr) {
          nStr += '';
          var x = nStr.split('.');
          var x1 = x[0];
          var x2 = x.length > 1 ? '.' + x[1] : '';
          
          var cadenas = x1.split(",");
          var cadena_sin_comas = "";
          for(i = 0; i < cadenas.length;i++){
            cadena_sin_comas = cadena_sin_comas+cadenas[i];
          }
          if (cadena_sin_comas != undefined && cadena_sin_comas != 'undefined' && cadena_sin_comas !='NaN' && cadena_sin_comas !=NaN) {
            return cadena_sin_comas+x2;  
          }else{
            return nStr;
          }
        }
        $scope.validateDecimalMontoTotal = function(input){
          if(parseFloat(input) < 0){
            vm.form.subforms.contract.value = 0;
            vm.form.subforms.contract.amount_iva = 0;          
          }
          else{
            vm.form.subforms.contract.value = parseFloat(input).toFixed(2);
            var valor_am = parseFloat($scope.formatearNumero(vm.form.subforms.contract.amount)).toFixed(2);
            if (vm.form.subforms.contract.amount) {

              if (valor_am == 'NaN') { 
                toaster.error('Revise el formato del Monto del Contrato.');
                vm.form.subforms.contract.amount_iva = parseFloat(0).toFixed(2);  
                return;
              }else if (valor_am) {
                vm.form.subforms.contract.amount_iva = parseFloat(parseFloat(parseFloat(valor_am) * .16) + parseFloat(valor_am)).toFixed(2);          
              }
            }
          } 
  
          if(!$localStorage.save_edition_fianza){
            $localStorage.save_edition_fianza = angular.copy(vm.form);
          }
          $localStorage.save_edition_fianza['contract_poliza'] = vm.form.subforms.contract;

        };

        $scope.percentageRange = function(input){
          if(parseFloat(input) < 0){
            vm.form.tarifa = 0;
          };
          if(parseFloat(input) > 100){
            vm.form.tarifa = 100;
          };
          if(input.toString().length > 5){
            vm.form.tarifa = parseFloat(input.toFixed(2));
          }
          if(!$localStorage.save_edition_fianza){
            $localStorage.save_edition_fianza = angular.copy(vm.form);
          }
          $localStorage.save_edition_fianza['contract_poliza'] = vm.form.subforms.contract;
        };

        $scope.matchesShows = function(parWord){
          if(parWord) {
            if(parWord.length >= 3) {
              if(vm.org_name =='ancora'){
                $scope.show_contratante = 'contractors-match-fianzas/';
              }else{
                $scope.show_contratante = 'contractors-match/';
              }
              $http.post(url.IP + $scope.show_contratante, 
              {
                'matchWord': parWord,
                'poliza': false,
                'pp':true
              })
              .then(function(response){
                if(response.status === 200 && response.data != 404){
                  var source = [];
                  var contratactorsFound = response.data.contractors;
                  if(contratactorsFound.length) {
                    contratactorsFound.forEach(function(item) {
                      if(item.full_name) {
                        var obj = {
                          label: item.full_name,
                          value: item
                        };
                      } else {
                       var obj = {
                          label: item.first_name+' '+ item.last_name+' '+ item.second_last_name,
                          value: item
                        }; 
                      }                  
                      source.push(obj)
                    });
                  }
                  $scope.contractors_data = source;
                }
              });
            }
          }
        };

        $scope.$watch("vm.contratante.value",function(newValue, oldValue){
          if(vm.contratante){
            if(vm.contratante.value.address_contractor){
              if(vm.contratante.value.address_contractor){
                $scope.programa_contractor = vm.contratante.value.url;
                $scope.has_programa_de_proveedores = true;
              }
            }
          }
        });

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
          if($scope.okFile == $scope.uploader.queue.length){
            $timeout(function() {
              if($scope.param == 'poliza'){
                SweetAlert.swal(MESSAGES.OK.UPGRADEPOLICY, "", "success");
              }
              if($scope.param == 'ot'){
                SweetAlert.swal("¡Listo!", MESSAGES.OK.UPGRADEOT, "success");
              }
              $state.go('fianzas.info', {polizaId: polizaId})
            }, 1000);
          }
        };

        // ALERTA ERROR UPLOADFILES
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          if(response.status == 413){
            SweetAlert.swal("ERROR", MESSAGES.ERROR.FILETOOLARGE, "error");
            order.options.checkDate('initial');
          } else {
            SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
            order.options.checkDate('initial');
          }
        };

        uploader.onAfterAddingFile = function(fileItem) {
          $scope.specialchar = []
          var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-="
          // var specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

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
                str = str.split('+').join('');
                fileItem.file.name = fileItem.file.name.split('+').join('');
                str = str.split('$').join('');
                fileItem.file.name = fileItem.file.name.split('$').join('');
                str = str.split('#').join('');
                fileItem.file.name = fileItem.file.name.split('#').join('');
                str = str.split('$#').join('');
                fileItem.file.name = fileItem.file.name.split('$#').join('');
              }else{            
                $scope.specialchar.push(specialChars[i])  
              }
            } 
          }
          // fileItem.file.name = fileItem.file.name.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '')
          fileItem.formData.push({
            arch: fileItem._file,
            nombre: fileItem.file.name,
          });

          if(fileItem){
            $scope.countFile++;
          }
          if ($scope.specialchar.length > 0) {
            $scope.uploader.queue.splice($scope.uploader.queue.indexOf(fileItem),1)
            SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales, renombre y, vuelva a cargarlo. '+$scope.specialchar,'error') 
          }
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

        $scope.saveFiles = function(poliza) {
          uploadFiles(poliza);
        }

        function uploadFiles(polizaId) {
          $scope.userInfo = {
            id: polizaId
          };
          $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
          $scope.uploader.uploadAll();
        }
        // save
        $scope.save = function(param){       
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          if(vm.form.recibos_poliza.length > 0){
            if (!vm.form.poliza_number){
              SweetAlert.swal('Agrega un número de fianza', '', "error");
              l.stop();
              return;
            }
          }
          if (!vm.form.aseguradora && !vm.form.aseguradora.url){
            SweetAlert.swal('Seleccione una afianzadora', '', "error");
            l.stop();
            return;
          }
          if (!vm.form.ramo){
            SweetAlert.swal('Seleccione un ramo', '', "error");
            l.stop();
            return;
          }
          if (!vm.form.subramo){
            SweetAlert.swal('Seleccione un subramo', '', "error");
            l.stop();
            return;
          }
          if (!vm.form.clave){
            SweetAlert.swal('Seleccione una clave', '', "error");
            l.stop();
            return;
          }
          if (!vm.form.tipo && vm.defaults.types.length > 0){
            SweetAlert.swal('Seleccione un tipo', '', "error");
            l.stop();
            return;
          }
          if (!vm.form.contratante.value){
            SweetAlert.swal('Seleccione un contratante', '', "error");
            l.stop();
            return;
          }
          if (!vm.form.address){
            SweetAlert.swal('Seleccione una direccion', '', "error");
            l.stop();
            return;
          }

          // var flag = false;
          // if (vm.form.referenciadores.length > 0){
          //   vm.form.referenciadores.forEach(function(ref){
          //     if(!ref.referenciador){
          //       SweetAlert.swal('Seleccione un referenciador', '' ,"error");

          //       flag  = true;
          //     }


          //     if(!ref.comision_vendedor && vm.form.referenciadores.length != 1){
          //       SweetAlert.swal('Todos los referenciadores deben tener porcentaje de comision', '', "error");

          //       flag  = true;
          //     }
          //   });
          // }

          // if (flag){
          l.stop();
          //   return;
          // }

          if (!vm.form.subforms.contract.description){
            l.stop(); 
            toaster.error('Agrega la descripción en el Detalle de Garantía');
            return;
          }
          if (vm.form.subforms.contract.guarantee_amount != '0'){
            if (!vm.form.subforms.contract.guarantee_amount){
              l.stop(); 
              toaster.error('Agrega el monto a garantizar en el Detalle de Garantía, número');
              return;
            }
          }
          if (vm.form.subforms.contract.rate != 0){
            if (!vm.form.subforms.contract.rate){
              l.stop(); 
              toaster.error('Agrega la tarifa en el Detalle de Garantía');
              return;
            }
          }

          var ben_flag = false;
          vm.form.subforms.beneficiaries_fianza.forEach(function(beneficiario){
            if(beneficiario.type_person == 1){
              if (beneficiario.first_name  == '' ){
                SweetAlert.swal('Ingrese campo de nombre', '', "error");
                l.stop();
                ben_flag = true;                  
              }
              if (beneficiario.last_name  == '' ){
                SweetAlert.swal('Ingrese campo de apellido', '', "error");
                l.stop();
                ben_flag = true;
              }
              // if (beneficiario.rfc  == '' ){
              //   SweetAlert.swal('Ingrese campo de RFC', '', "error");

              //   ben_flag = true;
              // }
              // if (beneficiario.email  == '' ){
              //   SweetAlert.swal('Ingrese campo de email ', '', "error");

              //   ben_flag = true;
              // }
              // if (beneficiario.phone_number  == '' ){
              //   SweetAlert.swal('Ingrese campo de teléfono', '', "error");

              //   ben_flag = true;
              // }
              beneficiario.j_name = '';
            } 
            else{
              if (beneficiario.j_name  == '' ){
                SweetAlert.swal('Ingrese campo de razon social', '', "error");
                l.stop();
                ben_flag = true;                  
              }
              // if (beneficiario.rfc  == '' ){
              //   SweetAlert.swal('Ingrese campo de RFC', '', "error");

              //   ben_flag = true;
              // }
              // if (beneficiario.email  == '' ){
              //   SweetAlert.swal('Ingrese campo de email ', '', "error");

              //   ben_flag = true;
              // }
              // if (beneficiario.phone_number  == '' ){
              //   SweetAlert.swal('Ingrese campo de teléfono', '', "error");

              //   ben_flag = true;
              // }
              beneficiario.first_name = '';
              beneficiario.last_name = '';
            }
          });

          if(ben_flag){
            l.stop();
            return;
          }
          try{
            var val = ($scope.formatearNumero(vm.form.subforms.contract.amount));
            if (val == 'NaN') {   
              SweetAlert.swal("Error","Revise el monto de garantía", "error");
              l.stop();
              return; 
            }else{
              console.log('--------',val)
            }
          }
          catch(err){
            console.log('idddddddd',err)
          }
          try{
            var val = parseFloat($scope.formatearNumero(vm.form.subforms.contract.guarantee_amount)).toFixed(2);
            if (val == 'NaN') {  
              // toaster.error('Revise el formato del Monto a Garantizar.');
              SweetAlert.swal('Revise el formato del Monto a Garantizar', '', "error");
              l.stop();
              return; 
            }
          }
          catch(err){
            console.log('idddddddd',err)
          }
          var payload = {
              "address": vm.form.address.url,
              "aseguradora": vm.form.aseguradora.url,
              "clave": vm.form.clave.url,
              "contract_poliza": 
              {
                "start": (vm.form.subforms.contract && vm.form.subforms.contract.start) ? vm.form.subforms.contract.start : null,
                "end": (vm.form.subforms.contract && vm.form.subforms.contract.end) ? vm.form.subforms.contract.end : null,
                "number": (vm.form.subforms.contract && vm.form.subforms.contract.number) ? vm.form.subforms.contract.number : null,
                "contract_object": (vm.form.subforms.contract && vm.form.subforms.contract.contract_object) ? vm.form.subforms.contract.contract_object : null,
                "amount": (vm.form.subforms.contract && vm.form.subforms.contract.amount) ? parseFloat($scope.formatearNumero(vm.form.subforms.contract.amount)).toFixed(2) : null,
                "amount_iva": (vm.form.subforms.contract && vm.form.subforms.contract.amount_iva) ? vm.form.subforms.contract.amount_iva : null,
                "guarantee_percentage": (vm.form.subforms.contract && vm.form.subforms.contract.guarantee_percentage) ? vm.form.subforms.contract.guarantee_percentage : null,
                "guarantee_amount": (vm.form.subforms.contract && vm.form.subforms.contract.guarantee_amount) ? parseFloat($scope.formatearNumero(vm.form.subforms.contract.guarantee_amount)).toFixed(2) : null,
                "rate": (vm.form.subforms.contract && vm.form.subforms.contract.rate) ? vm.form.subforms.contract.rate : 0,
                "sign_date": (vm.form.subforms.contract && vm.form.subforms.contract.sign_date) ? vm.form.subforms.contract.sign_date : null,
                "activity": (vm.form.subforms.contract && vm.form.subforms.contract.activity) ? vm.form.subforms.contract.activity : null,
                "business_activity": (vm.form.subforms.contract && vm.form.subforms.contract.business_activity) ? vm.form.subforms.contract.business_activity : null,
                "employee_name": (vm.form.subforms.contract && vm.form.subforms.contract.employee_name) ? vm.form.subforms.contract.employee_name : null,
                "no_employees": (vm.form.subforms.contract && vm.form.subforms.contract.no_employees) ? vm.form.subforms.contract.no_employees : null,
                "description": (vm.form.subforms.contract && vm.form.subforms.contract.description) ? vm.form.subforms.contract.description : null,
                "deductible_percentage": (vm.form.subforms.contract && vm.form.subforms.contract.deductible_percentage) ? vm.form.subforms.contract.deductible_percentage : null,
              },
              "emision_status": 1,
              "end_of_validity": vm.form.end_of_validity,
              "fianza_type": vm.form.tipo ? vm.form.tipo.url : null,
              "folio": vm.form.folio,
              // "natural":( vm.form.contratante && vm.form.contratante.value.type_person && vm.form.contratante.value.type_person == 'Fisica' ) ? vm.form.contratante.value.url : null ,
              // "juridical":( vm.form.contratante && vm.form.contratante.value.type_person && vm.form.contratante.value.type_person == 'Moral' ) ? vm.form.contratante.value.url : null ,
              "contractor": vm.form.contratante.value.url,
              "ramo": vm.form.ramo.url,
              "start_of_validity": vm.form.end_of_validity,
              "subramo": vm.form.subramo.url,
              "beneficiaries_poliza_many" : [],
              "beneficiaries_poliza" : [],
              "ref_policy" : [],
              "observations" :vm.form.observations,
              'status': vm.form.status,
              "is_renewable": vm.form.renewal ? $scope.dataToSave.is_renewable : 2,
              "f_currency": vm.form.currency ? vm.form.currency.currency_selected : 1,
              'bono_variable': vm.form.bono_variable ? parseFloat(vm.form.bono_variable).toFixed(2) : 0,
              "emision_date": vm.form.date_emision_factura ? datesFactory.toDate(vm.form.date_emision_factura ): null,
              "month_factura": vm.form.month ? vm.form.month.month_selected : 0,
              "folio_factura": vm.form.folio_factura ? vm.form.folio_factura : '',
              "maquila": vm.form.maquila ? parseFloat(vm.form.maquila).toFixed(2) : 0,
              "exchange_rate":  vm.form.exchange_rate ? parseFloat(vm.form.exchange_rate).toFixed(2) : 0,
              "date_maquila": vm.form.date_maquila ? datesFactory.toDate(vm.form.date_maquila ): null,
              "date_bono": vm.form.date_bono ? datesFactory.toDate(vm.form.date_bono ): null,
              "year_factura": vm.form.year_factura ? vm.form.year_factura: 0,
          }

          try{
            payload.start_of_validity = datesFactory.toDate(vm.form.start_of_validity);
          }
          catch(err){
            SweetAlert.swal('Revise la fecha de inicio', '', "error");
            l.stop();
            return; 
          }
          try{
            payload.end_of_validity = datesFactory.toDate(vm.form.end_of_validity);
          }
          catch(err){
            SweetAlert.swal('Revise la fecha de inicio', '', "error");
            l.stop();
            return; 
          }
          // if (vm.form.status != 1 && new Date() >= payload.start_of_validity && new Date() < payload.end_of_validity){
          //   payload.status = 14;
          // }

          // if (new Date() > payload.end_of_validity){
          //   payload.status = 13;
          // }
          // if (new Date() < payload.start_of_validity){
          //   payload.status = 10;
          // }
          if (vm.form.subramo.subramo_code == 20 || vm.form.subramo.subramo_code == 21){
            try{
              payload.contract_poliza['end'] = datesFactory.toDate(vm.form.subforms.contract['end']);
              payload.contract_poliza['start'] = datesFactory.toDate(vm.form.subforms.contract['start']);
              payload.contract_poliza['sign_date'] = datesFactory.toDate(vm.form.subforms.contract['sign_date']);
            }
            catch(err){
              SweetAlert.swal('Revise las fechas del contrato', '', "error");
              l.stop();
              return; 
            }
          } 
          else{ 
              payload.contract_poliza['end'] = new Date();
              payload.contract_poliza['start'] = new Date();
              payload.contract_poliza['sign_date'] = new Date();
          }


          var nombres = [];
          vm.form.subforms.beneficiaries_fianza.forEach(function(beneficiario){
            var ref = {
                    "email": beneficiario.email,
                    "first_name": beneficiario.first_name,
                    "full_name": beneficiario.first_name + ' ' + beneficiario.last_name + ' ' + beneficiario.second_last_name,
                    "j_name": beneficiario.j_name,
                    "last_name": beneficiario.last_name,
                    "type_person": beneficiario.type_person,
                    "phone_number": beneficiario.phone_number,
                    "rfc": beneficiario.rfc,
                    "second_last_name": beneficiario.second_last_name,
                    "url": beneficiario.url ? beneficiario.url : null,
                    "id": beneficiario.id ? beneficiario.id : null
                }
            payload["beneficiaries_poliza_many"].push(ref);
            if(beneficiario.type_person == 2){
              nombres.push(beneficiario.j_name);
            }
            else{
              nombres.push(beneficiario.first_name + '_' + beneficiario.last_name + '_' + beneficiario.second_last_name);
            }
          });

          
          var bname = vm.form.ramo.ramo_name;
       
          if (nombres.length > 0)bname = nombres[0];  
          if (vm.form.identifier){
            payload['identifier'] = vm.form.identifier;
          }  else{
            payload['identifier'] = vm.form.subramo.subramo_name + '_' + bname + '_' + payload['contract_poliza']['description']
          }      

          

          vm.form.referenciadores.forEach(function(referenciador){
            if(referenciador.referenciador){
              var ref = {
                  "referenciador": referenciador.referenciador,
                  "comision_vendedor": referenciador.comision_vendedor ? referenciador.comision_vendedor : 0,
              }
              payload["ref_policy"].push(ref);
            }
          });
          
          if (vm.form.status != 1){
           
            payload['poliza_number'] = vm.form.poliza_number;
            payload['folio'] = vm.form.folio
            payload['emision_date']   = datesFactory.toDate(vm.form.emision_date);
          }

          if($scope.showPrograma){
            payload.has_programa_de_proveedores = true;
            payload.programa_de_proveedores_contractor = $scope.programa_contractor ? $scope.programa_contractor : null;
          }else{
            payload.has_programa_de_proveedores = false;
            payload.programa_de_proveedores_contractor = null;
          }

          if(!$stateParams.renovacion && !$stateParams.reexpedir){
            $http.patch(vm.form.url.replace('polizas', 'fianzas'), payload).then(function success(response) {
              if (response.status==200 || response.status==201) {
                var paramsE = {
                  'model': 13,
                  'event': "PATCH",
                  'associated_id': vm.form.id,
                  'identifier': vm.form.status == 1 ?  "actualizó la fianza : "+vm.form.internal_number :  "actualizó la fianza : "+vm.form.poliza_number
                }
                dataFactory.post('send-log', paramsE);
                $state.go('fianzas.info',{polizaId:$stateParams.polizaId});
              }else{
                if(response.data && response.data.contract_poliza && response.data.contract_poliza.rate){
                  SweetAlert.swal("Ocurrió un error", "Revise la información (Tarifa aplicable), no sé guardaron cambios ", "error");
                }else{
                  SweetAlert.swal("Ocurrió un error", "Revise la información, no sé guardaron cambios ", "error");
                }
              }
            },
            function error(err) {
              SweetAlert.swal("Ocurrió un error", "Revise la información "+err, "error");
              console.log('error', err);
            });
          }


          if($stateParams.renovacion && $stateParams.renovacion == 2){
            payload.status = 1;
              $http.post(url.IP + 'fianzas/', payload).then(function(response){
              if (response.status == 201) {
                var data = {
                  // renewed: true,
                  // status: 12,
                  renewed_status: 1,
                  fecha_cancelacion: null,
                  monto_cancelacion: null
                }
                $http.patch(vm.form.url, data);
                
                /* Relación con la póliza original */
                if(vm.form.poliza_number){
                  var oldPolicy = {
                    policy: vm.form.poliza_number,
                    base_policy: vm.form.url,
                    new_policy: response.data.url
                  }
                }else{
                  var oldPolicy = {
                    base_policy: vm.form.url,
                    new_policy: response.data.url
                  }
                }
                $http.post(url.IP + 'v1/polizas/viejas/', oldPolicy)
                .then(function(res){
                  // SweetAlert.swal('Fianza renovada', "", "success");
                  var paramsE = {
                    'model': 13,
                    'event': "POST",
                    'associated_id': vm.form.id,
                    'identifier': vm.form.status == 1 ?  "renovó la fianza : "+vm.form.internal_number :  "renovó la fianza : "+vm.form.poliza_number
                  }
                  dataFactory.post('send-log', paramsE);


                  var modalInstance = $uibModal.open({
                      templateUrl: 'app/fianzas/otAsFianzaModal.html',
                      controller: FianzaPendingModalCtrl,
                      controllerAs: 'vmm',
                      size: 'lg',
                      resolve: {
                        policyModal: function() {
                          return response.data;
                        },
                        ren: function(){
                          return $scope.esrenovacion;
                        }
                      },
                    backdrop: 'static', /* this prevent user interaction with the background */
                    keyboard: false
                  });
                  modalInstance.result.then(function(receipt) {
                    activate();
                  });
                  
                  // $state.go('fianzas.info',{polizaId:response.data.id});
                })
                .catch(function(e){
                  SweetAlert.swal("Ocurrió un error", "", "error");
                  return;
                });
              }

            });
          }


          if($stateParams.reexpedir && $stateParams.reexpedir == 1){  
            payload['poliza_number'] = ''
            payload.poliza_number = ''
            var recibos_pagados_flag = false;
            vm.fianza_info.recibos_poliza.forEach(function(rec) {
              if(rec.status == 1){
                recibos_pagados_flag = true;
              }
            })

            if(recibos_pagados_flag){
              SweetAlert.swal({
                title: "Anular fianza",
                text: "¿Esta fianza contiene recibos pagados, solo se verán afectados los recibos pendientes de pago, desea continuar?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Anular",
                cancelButtonText: "Cancelar",
                closeOnConfirm: true,
                closeOnCancel: false
              }, 
              function(isConfirm){
                if(isConfirm){
                  var obj = {
                    status : 17//Anulada
                  }

                  $q.all([
                  $http.patch(vm.form.url, obj) //Actualizar la fianza a preanulado
                  .then(function(response){
                    if(response.status == 200){
                      var params = {
                        'model': 13,
                        'event': "PATCH",
                        'associated_id': vm.form.id,
                        'identifier': ' actualizó la fianza a Anulado.'
                      }
                      dataFactory.post('send-log/', params)
                    }

                    if(vm.form.recibos_poliza.length > 0){
                      if(vm.form.recibos_poliza[0].status == 4 || vm.form.recibos_poliza[0].status == 11){
                        // Actualizar recibo de fianza a preanulado
                        $http({
                          method: 'PATCH',
                          url: vm.form.recibos_poliza[0].url,
                          data: {
                            status: 10
                          }
                        }).then(function success(response){
                          if(response.status == 200){
                            var params = {
                              'model': 4,
                              'event': "PATCH",
                              'associated_id': response.data.id,
                              'identifier': ' actualizó el recibo a Anulado.'
                            }
                            dataFactory.post('send-log/', params).then(function success(response){
                              
                            });
                            toaster.success("Recibo de fianza actualizado exitosamente");
                            activate();
                          }
                        });
                      }
                    }

                    $scope.endososFianza.forEach(function(endoso) {
                      if(endoso.status == 2){
                          // Actualizar recibo de endoso a anulado
                          $http.patch(endoso.url,{status:6}).then(function(response_endoso_updated) {
                            if(response.status == 200){
                              var params = {
                                'model': 10,
                                'event': "PATCH",
                                'associated_id': response_endoso_updated.data.id,
                                'identifier': ' actualizó la fianza a Anulado.'
                              }
                              dataFactory.post('send-log/', params)
                              if(endoso.endorsement_receipt)  {
                                if(endoso.endorsement_receipt[0].status == 4 || vm.form.recibos_poliza[0].status == 11){
                                  $http({
                                  method: 'PATCH',
                                  url: endoso.endorsement_receipt[0].url,
                                  data: { status: 10 }
                                  }).then(function(response_endosos_fianza) {
                                    if(response_endosos_fianza.status == 200){
                                      var params = {
                                        'model': 4,
                                        'event': "PATCH",
                                        'associated_id': endoso.endorsement_receipt[0].id,
                                        'identifier': ' actualizó el recibo a Anulado.'
                                      }
                                      dataFactory.post('send-log/', params);
                                      toaster.success("Recibo de endoso actualizado exitosamente.");
                                    }
                                  });
                                }
                              }
                          }
                        })
                      }
                    });
                  })
                  .catch(function(e){
                    console.log('error', e);
                  })]).then(function() {
                    // Crear la reexpedicion de la finaza
                    $http.post(url.IP + 'fianzas/', payload).then(function(response){
                      if (response.status == 201) {
                        /* Relación con la póliza original */
                        if(vm.fianza_history){
                          var oldPolicy = {
                            policy: vm.fianza_history.poliza_number,
                            base_policy: vm.fianza_history.url,
                            new_policy: response.data.url
                          }
                        }
                        else{
                          var oldPolicy = {
                            policy: vm.form.poliza_number,
                            base_policy: vm.form.url,
                            new_policy: response.data.url
                          }
                        }
                        $http.post(url.IP + 'v1/polizas/viejas/', oldPolicy)
                        .then(function(res){
                          SweetAlert.swal('Fianza reexpedida', "", "success");
                          var paramsE = {
                            'model': 13,
                            'event': "POST",
                            'associated_id': vm.form.id,
                            'identifier': vm.form.status == 1 ?  "reexpidió la fianza : "+vm.form.internal_number :  "reexpidió la fianza : "+vm.form.poliza_number
                          }
                          dataFactory.post('send-log', paramsE);
                          $state.go('fianzas.info',{polizaId:response.data.id});
                        })
                        .catch(function(e){
                          SweetAlert.swal("Ocurrió un error", "", "error");
                          return;
                        });
                      }
                    });
                  });
                }
                else{
                  SweetAlert.swal("¡Cancelado!", "La fianza no fue anulada", "error"); 
                  return;
                }
              });
            }
            else{
              var obj = {
                status : 17//Anulada
              }

              $q.all([
              $http.patch(vm.form.url, obj) //Actualizar la fianza a preanulado
              .then(function(response){
                if(response.status == 200){
                  var params = {
                    'model': 13,
                    'event': "PATCH",
                    'associated_id': vm.form.id,
                    'identifier': ' actualizó la fianza a Anulado.'
                  }
                  dataFactory.post('send-log/', params)
                }

                if(vm.form.recibos_poliza.length > 0){
                  if(vm.form.recibos_poliza[0].status == 4 || vm.form.recibos_poliza[0].status == 11){
                    // Actualizar recibo de fianza a preanulado
                    $http({
                      method: 'PATCH',
                      url: vm.form.recibos_poliza[0].url,
                      data: {
                        status: 10
                      }
                    }).then(function success(response){
                      if(response.status == 200){
                        var params = {
                          'model': 4,
                          'event': "PATCH",
                          'associated_id': response.data.id,
                          'identifier': ' actualizó el recibo a Anulado.'
                        }
                        dataFactory.post('send-log/', params).then(function success(response){
                          
                        });
                        toaster.success("Recibo de fianza actualizado exitosamente");
                      }
                    });
                  }
                }

                $scope.endososFianza.forEach(function(endoso) {
                  if(endoso.status == 2){
                      // Actualizar recibo de endoso a preanulado
                        $http.patch(endoso.url,{status:6}).then(function(response_endoso_updated) {
                          if(response.status == 200){
                            var params = {
                              'model': 10,
                              'event': "PATCH",
                              'associated_id': response_endoso_updated.data.id,
                              'identifier': ' actualizó la fianza a Anulado.'
                            }
                            dataFactory.post('send-log/', params)
                              if(endoso.endorsement_receipt)  {
                                  if(endoso.endorsement_receipt[0].status == 4 || vm.form.recibos_poliza[0].status == 11){
                                    $http({
                                    method: 'PATCH',
                                    url: endoso.endorsement_receipt[0].url,
                                    data: { status: 10 }
                                    }).then(function(response_endosos_fianza) {
                                      if(response_endosos_fianza.status == 200){
                                        var params = {
                                          'model': 4,
                                          'event': "PATCH",
                                          'associated_id': endoso.endorsement_receipt[0].id,
                                          'identifier': ' actualizó el recibo a Anulado.'
                                        }
                                        dataFactory.post('send-log/', params);
                                        toaster.success("Recibo de endoso actualizado exitosamente.");
    
                                      }
                                    });
                                  }
                                }
                          }
                      })
                  }
                });
              })
              .catch(function(e){
                console.log('error', e);
              })]).then(function() {
                payload['status'] = 1;
                $http.post(url.IP + 'fianzas/', payload).then(function(response){
                  if (response.status == 201) {                      
                    /* Relación con la póliza original */
                    if(vm.fianza_history){
                      var oldPolicy = {
                        policy: vm.fianza_history.poliza_number,
                        base_policy: vm.fianza_history.url,
                        new_policy: response.data.url
                      }
                    }
                    else{
                      var oldPolicy = {
                        policy: vm.form.poliza_number,
                        base_policy: vm.form.url,
                        new_policy: response.data.url
                      }
                    }
                    $http.post(url.IP + 'v1/polizas/viejas/', oldPolicy)
                    .then(function(res){
                      SweetAlert.swal('Fianza reexpedida', "", "success");
                      var paramsE = {
                        'model': 13,
                        'event': "POST",
                        'associated_id': vm.form.id,
                        'identifier': vm.form.status == 1 ?  "reexpidió la fianza : "+vm.form.internal_number :  "reexpidió la fianza : "+vm.form.poliza_number
                      }
                      dataFactory.post('send-log', paramsE);
                      $state.go('fianzas.info',{polizaId:response.data.id});
                    })
                    .catch(function(e){
                      SweetAlert.swal("Ocurrió un error", "", "error");
                      return;
                    });
                  }
                });
              });
            }


          }

        }

        function FianzaPendingModalCtrl(datesFactory, $localStorage, $scope, toaster, MESSAGES, policyModal, $uibModalInstance, dataFactory, SweetAlert, $state, insuranceService, receiptService, url, $http, $rootScope,emailService,helpers,ren) {
          var vmm = this;
   
          vmm.form = {
            folio: '',
            comisiones: [],
            document_type: policyModal.document_type,
          };
  
          vmm.options = {
            cancel: cancel,
            save: save,
          };
          vmm.policyInfo = policyModal;
          $scope.changeNoPoliza = function () {
            if(vmm.form.fianza){
              if(ren ==false){
                helpers.existPolicyNumber(vmm.form.fianza)
                .then(function(request) {
                  if(request == true) {
                    SweetAlert.swal("Error", "El número de fianza ya existe.", "error");
                    vmm.form.fianza = '';
                  }
                })
                .catch(function(err) {
    
                });                
              }
            }
          };
  
          $scope.checkFechaFactura = function (date) {
            var date_initial = (date).split('/');
            var day = date_initial[0];
            var month = date_initial[1];
            var year = parseInt(date_initial[2]);
            vmm.form.month.month_selected = parseInt(month)
            vmm.form.year_factura = year
          };
          $scope.years=[]
          var actualYear = new Date().getFullYear();
          var oldYear = actualYear - 80;
          for (var i = actualYear + 10; i >= oldYear; i--) {
            $scope.years.push(i);
          }
  
          vmm.form.month={};
          vmm.form.month.month_selected = 1;
          vmm.form.month.options = [
              {'value':0,'label':''},
              {'value':1,'label':'Enero'},
              {'value':2,'label':'Febrero'},
              {'value':3,'label':'Marzo'},
              {'value':4,'label':'Abril'},
              {'value':5,'label':'Mayo'},
              {'value':6,'label':'Junio'},
              {'value':7,'label':'Julio'},
              {'value':8,'label':'Agosto'},
              {'value':9,'label':'Septiembre'},
              {'value':10,'label':'Octubre'},
              {'value':11,'label':'Noviembre'},
              {'value':12,'label':'Diciembre'},
          ]
          $http.get(url.IP+'claves-by-provider/' + vmm.policyInfo.aseguradoradata.id)
          .then(
            function success(clavesResponse) {
              clavesResponse.data.forEach(function(clave) {
                clave.clave_comision.forEach(function(item) {
                  item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
                  if(vmm.policyInfo.subramo == item.subramo) {
                    vmm.form.comisiones.push(item);
                  }
                });
              });
            },
            function error (e) {
              console.log('Error - claves-by-provider', e);
            })
          .catch(function (error) {
              console.log('Error - claves-by-provider - catch', error);
          });
  
          vmm.form.startDate = convertDate(vmm.policyInfo.start_of_validity);
          vmm.form.emision_date = datesFactory.convertDate(new Date());
          vmm.form.endingDate = convertDate(vmm.policyInfo.end_of_validity);
          vmm.form.subramo = vmm.policyInfo.subramo;
          vmm.form.subramo = vmm.policyInfo.subramo;
          vmm.form.policy_days_duration = 365;
          function normalizeDate(date) {
            var d = new Date(date);
            d.setHours(0, 0, 0, 0);  // Elimina hora, minutos, segundos, ms
            return d;
          }
          function save(){
            var sd = normalizeDate(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].startDate));
            var ed = normalizeDate(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].endingDate));
            var psd = normalizeDate(vmm.policyInfo.start_of_validity);
            var ped = normalizeDate(vmm.policyInfo.end_of_validity);
            if (sd < psd || sd > ped ){
              // toaster.error('La fecha de inicio del recibo esta fuera de la fecha de la fianza');
              SweetAlert.swal("Error", "La fecha de inicio del recibo esta fuera de la fecha de la fianza", "error");
              return;
            }
            if (ed < psd || ed > ped ){
              // toaster.error('La fecha de fin del recibo esta fuera de la fecha de la fianza');
              SweetAlert.swal("Error", "La fecha de fin del recibo esta fuera de la fecha de la fianza", "error");
              return;
            }
            vmm.form.emision_date = datesFactory.toDate(vmm.form.emision_date);
            $scope.dataFianza = {
              'folio': vmm.form.folio,
              'poliza_number': vmm.form.fianza,
              'status': 14,
              'p_neta': vmm.policyInfo.poliza.primaNeta,
              'rpf': vmm.policyInfo.poliza.rpf,
              'derecho': vmm.policyInfo.poliza.derecho,
              'iva': vmm.policyInfo.poliza.iva,
              'p_total': vmm.policyInfo.poliza.primaTotal,
              'comision': vmm.policyInfo.comision,
              'comision_percent': vmm.policyInfo.comision_percent,
              'emision_date' : vmm.form.emision_date,
              'fecha_cancelacion':vmm.policyInfo.fecha_cancelacion,
              'monto_cancelacion':vmm.policyInfo.monto_cancelacion,
              "date_emision_factura": vmm.form.date_emision_factura ? datesFactory.toDate(vmm.form.date_emision_factura ): null,
              "date_maquila": vmm.form.date_maquila ? datesFactory.toDate(vmm.form.date_maquila ): null,
              "year_factura": vmm.form.year_factura ? vmm.form.year_factura: 0,
              "month_factura": vmm.form.month ? vmm.form.month.month_selected : 0,
              "folio_factura": vmm.form.folio_factura ? vmm.form.folio_factura : '',
              "maquila": vmm.form.maquila ? parseFloat(vmm.form.maquila).toFixed(2) : 0,
              "exchange_rate": vmm.form.exchange_rate ? parseFloat(vmm.form.exchange_rate).toFixed(2) : 0,
            }
            $http.patch(vmm.policyInfo.url, $scope.dataFianza)
            .then(function(response) {
              if(response.status == 200){
  
                vmm.policyInfo.recibos_poliza.forEach(function(item) {
                  item.fecha_inicio = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].startDate));
                  item.fecha_fin = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].endingDate));
                  item.vencimiento = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].vencimiento));
  
                  item.poliza = response.data.url;
  
                  dataFactory.post('recibos/', item)
                  .then(function success(req) {
  
                  }, function error(error) {
                    console.log(error);
                  });
                });
                
                
                $state.go('fianzas.info', { polizaId: response.data.id });
                activate();
                vmm.options.cancel();
                SweetAlert.swal("¡Listo!", MESSAGES.OK.RENEWALFIANZA, "success");
                // location.reload();                
                $uibModalInstance.dismiss('cancel');
                var params = {
                  'model': 13,
                  'event': "POST",
                  'associated_id': response.data.id,
                  'identifier': "convirtió la OT en fianza."
                }
                dataFactory.post('send-log/', params).then(function success(response) {
  
                });
              }
            })
          }
  
          function cancel() {
            $uibModalInstance.dismiss('cancel');
          }
  
          function convertDate(inputFormat,indicator) {
            function pad(s) { return (s < 10) ? '0' + s : s; }
            var d = new Date(inputFormat);
            var date = inputFormat;
            if(inputFormat.length != 10){
              function pad(s) { return (s < 10) ? '0' + s : s; }
                var d = new Date(inputFormat);
                if(indicator){
                  date = [pad(d.getDate()+1), pad(d.getMonth()+1), d.getFullYear()].join('/');
                } else {
                  date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
                }
            }
            return date;
          }
        }

        function cancel() {
          $state.go('fianzas.info',{polizaId:$stateParams.polizaId});
        }
        function deleteBene(index, item,all){
          if(vm.form.subforms.beneficiaries_fianza.length > 1){
            // vm.subforms.beneficiaries_fianza_many.splice(1, 1);
            if (item.id){
              SweetAlert.swal({
                title: 'Información',
                text: "El Beneficiario se eliminará de esta Fianza",
                type: "warning",
                showCancelButton: false,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Aceptar",
                cancelButtonText: "Cancelar",
                closeOnConfirm: true
              }, function(isConfirm) {
                  if (isConfirm) {                    
                    vm.subforms.beneficiaries_fianza_many.splice(index,1)
                    $scope.beneficiarie_to_delete.push(vm.subforms.beneficiaries_fianza_many[index])
                  }
              });
            }
            else{
              vm.form.subforms.beneficiaries_fianza.splice(index,1);
            }
        	}
        }

    }
})();
