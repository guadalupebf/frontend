(function() {
  'use strict';

  angular.module('inspinia')
      .controller('FianzasColectividadesRenewalCtrl', FianzasColectividadesRenewalCtrl);

  FianzasColectividadesRenewalCtrl.$inject = ['$sessionStorage', '$scope', 'FileUploader', 'providerService', '$http', 'url', 
                                       '$state', 'SweetAlert', 'MESSAGES', '$uibModalInstance', '$timeout', '$rootScope',
                                       '$localStorage', 'dataFactory', '$stateParams', '$location'];

  function FianzasColectividadesRenewalCtrl($sessionStorage, $scope, FileUploader, providerService, $http, url, $state, 
                                     SweetAlert, MESSAGES, $uibModalInstance, $timeout, $rootScope, $localStorage, dataFactory,
                                     $stateParams, $location) {

    /* Información de usuario */
    var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
    
    var order = this;
    order.renewal = {};
    order.renewal.is_renewable = 1;
    order.renewal.options = [
        {'value':1,'label':'Renovable'},
        {'value':2,'label':'No Renovable'},
    ];
    $scope.surety = {};
    $scope.showPF = true;
    $scope.origin_renewable = false;
    $scope.providers = [];
    $scope.claves = [];
    $scope.ramos = [];
    $scope.subramos = [];
    $scope.currencys = [
      {'value':1, 'label':'Pesos'},
      {'value':2, 'label':'Dólares'}
    ];
    
    $scope.month={};
    $scope.month.month_selected = 1;
    $scope.month.options = [
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
    $scope.currencySelected = $scope.currencys[0].value;
    $rootScope.show_contractor = false;
    $scope.create_natural = true;
    $scope.create_juridical = true;
    $scope.referenciadores = [];
    $scope.referenciadorArray = [];
    $scope.referenciadoresSelected = [];
    $scope.categories = [
      {
        name: '',
        deductible: '',
        observations: '',
        document_type: 5
      }
    ];
    $scope.beneficiaries = [
      {
        type_person: 1,
        first_name: '',
        last_name: '',
        second_last_name: '',
        j_name: '',
        full_name: '',
        rfc: '',
        email: '',
        phone_number: '',
        poliza: null,
        usuario: null
      }
    ];
    $scope.directiveReceipts = [];
    $scope.dataToSave = [];

    $scope.all_certificate = [];
    $scope.dataSurety = [];
    $scope.dataCategories = [];

    $scope.show_certificates = false;
    $scope.showTableCertificates = false;
    $scope.optionsViews = [
      {'value':10, 'label':'10'},
      {'value':25, 'label':'25'},
      {'value':50, 'label':'50'}
    ];
    $scope.optionViews = $scope.optionsViews[0];
    $scope.valueInitial = 1;
    $scope.valueFinal = 10;
    $scope.excelJsonViews = [];
    $scope.loader = false;
    $scope.certificates = [];

    order.accesos = $sessionStorage.permisos;
    if(order.accesos){
      order.accesos.forEach(function(perm){
        if(perm.model_name == 'Fianzas'){
          order.acceso_fianzas = perm
          order.acceso_fianzas.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar fianzas') {
              if (acc.checked == true) {
                order.acceso_adm_fia = true
              }else{
                order.acceso_adm_fia = false
              }
            }else if (acc.permission_name == 'Ver fianzas') {
              if (acc.checked == true) {
                order.acceso_ver_fia = true
              }else{
                order.acceso_ver_fia = false
              }
            }
          })
        }else if (perm.model_name == 'Reportes') {
          order.acceso_reportes = perm;
          order.acceso_reportes.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Reporte fianzas') {
              if (acc.checked == true) {
                order.acceso_rep_fia = true
              }else{
                order.acceso_rep_fia = false
              }
            }else if (acc.permission_name == 'Reporte Siniestros') {
              if (acc.checked == true) {
                order.acceso_rep_sin = true
              }else{
                order.acceso_rep_sin = false
              }
            }else if (acc.permission_name == 'Reporte Endosos') {
              if (acc.checked == true) {
                order.acceso_rep_end = true
              }else{
                order.acceso_rep_end = false
              }
            }else if (acc.permission_name == 'Reporte pólizas') {
              if (acc.checked == true) {
                order.acceso_rep_pol = true
              }else{
                order.acceso_rep_pol = false
              }
            }else if (acc.permission_name == 'Reporte renovaciones') {
              if (acc.checked == true) {
                order.acceso_rep_ren = true
              }else{
                order.acceso_rep_ren = false
              }
            }else if (acc.permission_name == 'Reporte cobranza') {
              if (acc.checked == true) {
                order.acceso_rep_cob = true
              }else{
                order.acceso_rep_cob = false
              }
            }
          })
        }else if(perm.model_name == 'Ordenes de trabajo'){
          order.acceso_ot = perm
          order.acceso_ot.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar OTs') {
              if (acc.checked == true) {
                order.acceso_adm_ot = true
              }else{
                order.acceso_adm_ot = false
              }
            }else if (acc.permission_name == 'Ver OTs') {
              if (acc.checked == true) {
                order.acceso_ver_ot = true
              }else{
                order.acceso_ver_ot = false
              }
            }
          })
        }else if (perm.model_name == 'Contratantes y grupos') {
          order.acceso_contg = perm;
          order.acceso_contg.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Administrar contratantes y grupos') {
              if (acc.checked == true) {
                order.acceso_adm_cont = true
              }else{
                order.acceso_adm_cont = false
              }
            }else if (acc.permission_name == 'Ver contratantes y grupos') {
              if (acc.checked == true) {
                order.acceso_ver_cont = true
              }else{
                order.acceso_ver_cont = false
              }
            }
          })
        }else if(perm.model_name == 'Archivos'){
          order.acceso_files = perm
          order.acceso_files.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar archivos sensibles') {
              if (acc.checked == true) {
                order.permiso_archivos = true
              }else{
                order.permiso_archivos = false
              }
            }
          })
        }
      })
    }

    if (($location.path().indexOf('reexpedir') != -1)) {
      $scope.reexpedir = true;
    }else{
      $scope.reexpedir = false;
    }

    activate();

    $scope.hideButtonOT = function(){
      $scope.showPF = true;
    };

    $scope.hideButtonSurety = function(){
      $scope.showPF = false;
    };

    $scope.checkDate = function(param){
      if(param.length == 10){
        var date_initial = (param).split('/');
        var day = date_initial[0];
        var month = date_initial[1];
        var year = parseInt(date_initial[2]);
        
        day = day - 1;
        if(day < 1){
          month = month - 1;
          if(month < 1){
            month = 12;
            year = year - 1;
          }
          if(month == 4 || month == 6 || month == 9 || month == 11){
            day = 30;
          }else if(month == 2){
            day = 28;
          }else{
            day = 31;
          }
        }
        if(day.length == 1){
          day = '0' + day;
        }
        if(month.length == 1){
          month = '0' + month;
        }

        $scope.startDate = param;
        $scope.endDate = convertDate(new Date(month + '/' + day + '/' + (year + 1)));
        $scope.surety.start_of_validity = toDate(param);
        $scope.surety.end_of_validity = toDate($scope.endDate);
      }
      else{
        var day = new Date().getDate();
        var month = new Date().getMonth() + 1;
        var year = new Date().getFullYear();

        day = day - 1;
        if(day < 1){
          month = month - 1;
          if(month < 1){
            month = 12;
            year = year - 1;
          }
          if(month == 4 || month == 6 || month == 9 || month == 11){
            day = 30;
          }else if(month == 2){
            day = 28;
          }else{
            day = 31;
          }
        }
        if(day.length == 1){
          day = '0' + day;
        }
        if(month.length == 1){
          month = '0' + month;
        }

        $scope.endDate = convertDate(new Date(month + '/' + day + '/' + (year + 1)));
        $scope.surety.start_of_validity = toDate(param);
        $scope.surety.end_of_validity = toDate($scope.endDate);
      }
      $scope.directiveReceipts.startDate = param;
      var date1 = new Date($scope.surety.start_of_validity);
      var date2 = new Date($scope.surety.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      $scope.directiveReceipts.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if($scope.directiveReceipts.policy_days_duration > 365){
        $scope.directiveReceipts.endingDate = $scope.endDate;
      }else{
        var date_initial = (param).split('/');
        var day = date_initial[0];
        var month = date_initial[1];
        var year = parseInt(date_initial[2]);

        if(day.length == 1){
          day = '0' + day;
        }
        if(month.length == 1){
          month = '0' + month;
        }

        $scope.directiveReceipts.endingDate = convertDate(new Date(month + '/' + day + '/' + (year + 1)));
      }
    };

    $scope.checkEndDate = function(param){
      if(param.length == 10){
        if(process(param) < process($scope.startDate)){
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATERANGE, "error");
          return;
        }

        function process(date){
          var parts = date.split("/");
          var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
          return date.getTime();
        }

        var date_initial = (param).split('/');
        var day = date_initial[0];
        var month = date_initial[1];
        var year = parseInt(date_initial[2]);

        if(day.length == 1){
          day = '0' + day;
        }
        if(month.length == 1){
          month = '0' + month;
        }
        $scope.surety.end_of_validity = toDate(param);
      }
      var date1 = new Date($scope.surety.start_of_validity);
      var date2 = new Date($scope.surety.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      $scope.directiveReceipts.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if($scope.directiveReceipts.policy_days_duration > 365){
        $scope.directiveReceipts.endingDate = param;
      }else{
        var date_initial = ($scope.startDate).split('/');
        var day = date_initial[0];
        var month = date_initial[1];
        var year = parseInt(date_initial[2]);
        
        if(day.length == 1){
          day = '0' + day;
        }
        if(month.length == 1){
          month = '0' + month;
        }

        $scope.directiveReceipts.endingDate = convertDate(new Date(month + '/' + day + '/' + (year + 1)));
      }
    };

    function activate(){
      dataFactory.post('information_collectivesurety/', {caratula: $stateParams.polizaId})
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          $scope.surety = response.data.data.collectivitySurety;
          $scope.original_surety = angular.copy(response.data.data.collectivitySurety);
          response.data.data.childs.forEach(function function_name(ct) {
            ct.deductible = ct.deductible ? parseFloat(ct.deductible) : 0
          });
          $scope.categories = response.data.data.childs;
          $scope.beneficiaries = response.data.data.collectivitySurety.beneficiaries_poliza_many;
          $scope.startDate = convertDate($scope.surety.end_of_validity);
          $scope.aseguradoraSelected = $scope.surety.aseguradora;
          $scope.getClaves($scope.aseguradoraSelected, 1);
          $scope.currencySelected = $scope.surety.f_currency;

          // if($scope.surety.natural){
          //   order.contacto.value = $scope.surety.natural;
          //   order.contacto.val = $scope.surety.natural.full_name;
          // }else{
          //   order.contacto.value = $scope.surety.juridical;
          //   order.contacto.val = $scope.surety.juridical.j_name;
          // }
          order.contacto.value = $scope.surety.contractor;
          order.contacto.val = $scope.surety.contractor.full_name;
          $scope.addressSelected = $scope.surety.address;

          $scope.copy_contract_poliza = $scope.surety.contract_poliza;
          $scope.surety.contract_poliza = {};
          $scope.surety.contract_poliza.guarantee_amount = parseFloat($scope.copy_contract_poliza.guarantee_amount);
          $scope.surety.bono_variable = $scope.surety.bono_variable ? parseFloat($scope.surety.bono_variable) : 0;
          $scope.surety.contract_poliza.rate = parseFloat($scope.copy_contract_poliza.rate);
          $scope.surety.contract_poliza.activity = $scope.copy_contract_poliza.activity;
          $scope.surety.contract_poliza.no_employees = $scope.copy_contract_poliza.no_employees;
          $scope.surety.contract_poliza.description = $scope.copy_contract_poliza.description;
          order.renewal.is_renewable = $scope.surety.is_renewable;
          $scope.dataToSave.is_renewable =  $scope.surety.is_renewable;
        }
        fillProvider();

        $scope.showPrograma = false;

        $http.get(url.IP + 'get-vendors/')
        .then(function(user){
          user.data.forEach(function(u){              
            u.first_name = u.first_name.toUpperCase();
            u.last_name = u.last_name.toUpperCase()
            u.name = u.first_name.toUpperCase() + ' ' + u.last_name.toUpperCase();
          })
          $scope.referenciadores = user.data;
          var vendedor = {
            referenciador: '',
            comision_vendedor: ''
          };
          $scope.referenciadorArray.push(vendedor);
          $scope.checkDate($scope.startDate);
        })
        .catch(function(e){
          console.log('error', e);
        });

        $scope.policy_history = {};
        $http({
          method: 'GET',
          url: url.IP + 'historic-policies/',
          params: {
            actual_id: $scope.surety.id
          }
        })
        .then(function success(response) {
          if(response.data.results.length){
            $scope.showHistoric = true;
          }
          $scope.policy_history = [];
          response.data.results.forEach(function function_name(old) {
            if($scope.surety.id != old.base_policy.id){
              $scope.origin_renewable = true;
               $scope.policy_history = old.base_policy;
            }
          })
        })
        .catch(function (e) {
          console.log('error - caratula - catch', e);
        });
      })
      .catch(function(e){
        console.log('error', e);
      });

      getInternalNumber();
    };

    function getInternalNumber(){
      $http({
        method: 'POST',
        url: url.IP + 'internal-number/'
      })
      .then(function success(response){
        if((response.status === 200) || (response.status === 201)){            
          $scope.surety.internal_number = 'OT000' + response.data.id;
        }
      }, 
      function error(error){

      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    function fillProvider() {
      var d = $scope.startDate;
      try{
        var day = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();
      }catch(error){
        var from = d.split("/")
        var f = new Date(from[2], from[1] - 1, from[0])
        var day = f.getDate();
        var month = f.getMonth() + 1;
        var year = f.getFullYear();
      }

      var date = year + "-" + month + "-" + day;
      providerService.getProviderFiByKey(date)
      .then(function success(data) {
        $scope.providers = data.data;
      },
      function error(err) {
        console.log('error', err);
      });
    };

    function convertDate(inputFormat) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    };

    function toDate(dateStr) {
      if(dateStr){
        var dateString = dateStr; // Oct 23
        var dateParts = dateString.split("/");
        var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).toISOString(); // month is 0-based
        return dateObject;
      }
    };

    $scope.getClaves = function(param, value){
      $scope.surety.aseguradora = param;
      $http.get(url.IP + 'claves-by-provider/' + $scope.surety.aseguradora.id)
      .then(function success (clavesResponse){
        $scope.claves = clavesResponse.data;
        if($scope.claves.length == 1){
          $scope.surety.clave = $scope.claves[0].url;
          $scope.claveSelected = $scope.claves[0];
        }
      })
      .catch(function(error) {
        console.log('Error - claves-by-provider - catch', error);
      });

      $http.get(url.IP + 'ramos-by-provider/' + $scope.surety.aseguradora.id)
      .then(function success(response){
        $scope.ramos = response.data;
        $scope.ramos.forEach(function(item){
          if(item.ramo_name == 'Fidelidad'){
            $scope.ramoSelected = item;
            $scope.surety.ramo = item.url;
            $scope.subramos = item.subramo_ramo;
            $scope.subramos.forEach(function(subramo){
              if(subramo.subramo_name == 'Colectivas'){
                $scope.subramoSelected = subramo;
                $scope.surety.subramo = subramo.url;
                $scope.subramosTypes = subramo.type_subramo;

                if(value == 1){
                  $scope.subramosTypes.forEach(function(item){
                    if(item.url == $scope.surety.fianza_type.url){
                      $scope.subramoTypeSelected = item;
                    }
                  });
                }

                $scope.directiveReceipts.subramo = subramo;

                var comisiones = [];
                if($scope.claveSelected.clave_comision.length){
                  $scope.claveSelected.clave_comision.forEach(function(item){
                    if(param.subramo_name == item.subramo) {
                      comisiones.push(item);
                    }
                  });
                }

                $scope.directiveReceipts.comisiones = comisiones;
                $scope.directiveReceipts.domiciliado = false;
                $scope.directiveReceipts.payment = 5;

                var data = {
                  caratula: $scope.surety.id,
                  status: 0,
                  parent: 0,
                  page: 1
                }
                $http.post(url.IP + 'information_certCollSurety/', data)
                .then(function(response){
                  if(response.status == 200 || response.status == 201){
                    $scope.all_certificate = response.data.results;
                    if(response.data.count > 10){
                      var total = response.data.count / 10;
                      var array_certificate = (total.toString()).split(".");
                      var integer = parseFloat(array_certificate[0]);
                      var float = parseFloat(array_certificate[1]);
 
                      if(float > 0){
                        integer++;
                      }
                      for(var i = 2; i <= integer; i++){
                        var data = {
                          caratula: $scope.surety.id,
                          status: 0,
                          parent: 0,
                          page: i
                        }
                        $http.post(url.IP + 'information_certCollSurety/', data)
                        .then(function(response){
                          response.data.results.forEach(function(certificate){
                            $scope.all_certificate.push(certificate);
                          });
                        })
                        .catch(function(e){
                          console.log('error - caratula - catch', e);
                        });
                      }
                    }
                  }
                })
                .catch(function(e){
                  console.log('error - caratula - catch', e);
                });
              }
            });
          }
        });
      },
      function error(e){
        console.log('Error - ramos-by-provider', e);
      })
      .catch(function(error){
        console.log('Error - ramos-by-provider - catch', error);
      });
    };

    $scope.refreshProvider = function(){
      fillProvider();
    };

    $scope.changeClave = function(param){
      if(param){
        $scope.surety.clave = param.url;
        $scope.claveSelected = param;
      }
    };

    $scope.changeSubramoType = function(param){
      $scope.surety.fianza_type = param.url;
    };

    $scope.changeCurrency = function(param){
      $scope.surety.f_currency = param;
    };

    $scope.contratanteCreatorModalEvent = function(){
      $rootScope.show_contractor = true;
      $scope.orderInfo = vm;
      $localStorage.orderForm = JSON.stringify($scope.surety);
    };

    $scope.matchesContractors = function(parWord){
      if(parWord) {
        if(parWord.val.length >= 3) {
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   $scope.show_contratante = 'v2/contratantes/contractors-match/';
          $scope.show_contratante = 'contractors-match-fianzas/';
          $http.post(url.IP + $scope.show_contratante, 
          {
            'matchWord': parWord.val,
            'poliza': false
          })
          .then(function(response){
            if(response.status === 200 && response.data != 404){
              var source = [];
              // var juridicals = response.data.juridicals;
              // var naturals = response.data.naturals;

              // if(juridicals.length) {
              //   juridicals.forEach(function(item){
              //     var obj = {
              //       label: item.j_name,
              //       value: item
              //     };
              //     source.push(obj);
              //   });
              // }
              // if(naturals.length) {
              //   naturals.forEach(function(item){
              //     if(item.full_name) {
              //       var obj = {
              //         label: item.full_name,
              //         value: item
              //       };
              //     } else {
              //      var obj = {
              //         label: item.first_name+' '+ item.last_name+' '+ item.second_last_name,
              //         value: item
              //       }; 
              //     }
              //     source.push(obj);
              //   });
              // }
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

    $scope.$watch("order.contacto.value", function(newValue, oldValue){
      if(order.contacto){
        $scope.addresses = [];
        // if(order.contacto.value.address_natural || order.contacto.value.address_juridical){
        if(order.contacto.value.address_contractor){
          // if(order.contacto.value.address_natural){
          //   $scope.surety.natural = order.contacto.value.url;
          //   $scope.surety.juridical = null;
          //   if(order.contacto.value.address_natural[0].id){
          //     $scope.addresses = order.contacto.value.address_natural;
          //   }else{
          //     order.contacto.value.address_natural.forEach(function(address){
          //       $http.get(address).then(function(addressResponse){
          //         $scope.addresses.push(addressResponse.data);
          //       });
          //     });
          //   }
          // }else{
          //   $scope.surety.natural = null;
          //   $scope.surety.juridical = order.contacto.value.url;
          //   if(order.contacto.value.address_juridical[0].id){
          //     $scope.addresses = order.contacto.value.address_juridical;
          //   }else{
          //     order.contacto.value.address_juridical.forEach(function(address){
          //       $http.get(address).then(function(addressResponse){
          //         $scope.addresses.push(addressResponse.data);
          //       });
          //     });
          //   }
          // }
          $scope.surety.contractor = order.contacto.value.url;
          if(order.contacto.value.address_contractor[0].id){
            $scope.addresses = order.contacto.value.address_contractor;
          }else{
            order.contacto.value.address_contractor.forEach(function(address){
              $http.get(address).then(function(addressResponse){
                $scope.addresses.push(addressResponse.data);
              });
            });
          }
          if($scope.addresses.length == 1){
            $scope.addressSelected = $scope.addresses[0];
            $scope.surety.address = $scope.addresses[0].url;
          }
        }
      }
    });

    $scope.changeAddress = function(param){
      if(param){
        $scope.surety.address = param.url;
      }
    };

    $scope.addReferenciador = function(){
      var addReferenciadores = {
        referenciador: '',
        comision_vendedor: ''
      };
      $scope.referenciadorArray.push(addReferenciadores);
    };

    $scope.deleteReferenciador = function(index){
      $scope.referenciadorArray.splice(index, 1);
    };

    $scope.changeComRef = function(param, index){
      $scope.referenciadorArray[index].comision_vendedor = param;
    };

    $scope.valuePercentageRate = function(item){
      if(item < 0){
        $scope.surety.contract_poliza.rate = 0;
      }else if(item > 100){
        $scope.surety.contract_poliza.rate = 100;
      }
    };

    $scope.addCategorie = function(){
      var category = {
        name: '',
        deductible: '',
        observations: '',
        document_type: 9
      }
      $scope.categories.push(category);
    };

    $scope.deleteCategorie = function(index){
      $scope.categories.splice(index, 1);
    };

    $scope.valuePercentage = function(item, index){
      if(item < 0){
        $scope.categories[index]. deductible = 0;
      }else if(item > 100){
        $scope.categories[index]. deductible = 100;
      }
    };
    
    $scope.createIdentifier = function(){
      $scope.surety.identifier = '';
      $scope.surety.identifier = $scope.subramoSelected.subramo_name + '_' + $scope.categories[0].name;
    };

    $scope.matchesBeneficiary = function(parWord) {
      $scope.beneficiaries_data = [];
      var word_data = parWord;
      if(word_data) {
        if(word_data.length >= 3) {
            // if($scope.infoUser.staff && !$scope.infoUser.superuser){
            //   $scope.show_contratante = 'v2/BeneficiariesExistentes/';
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

    $scope.addBeneficiaries = function(item){
      if($scope.beneficiaries.length == 1){
        if($scope.beneficiaries[0].first_name == "" && $scope.beneficiaries[0].last_name == "" && $scope.beneficiaries[0].j_name == "" && $scope.beneficiaries[0].rfc == ""){
          $scope.beneficiaries[0] = item;
        }
        else{
          var beneficiary = {
            type_person: item.type_person,
            first_name: item.first_name,
            last_name: item.last_name,
            second_last_name: item.second_last_name,
            j_name: item.j_name,
            full_name: '',
            rfc: item.rfc,
            email: item.email,
            phone_number: item.phone_number,
            id: item.id,
            url: item.url,
            poliza: null,
            usuario: null
          }
          $scope.beneficiaries.push(beneficiary);
        }
      }else{
        var beneficiary = {
          type_person: item.type_person,
          first_name: item.first_name,
          last_name: item.last_name,
          second_last_name: item.second_last_name,
          j_name: item.j_name,
          full_name: '',
          rfc: item.rfc,
          email: item.email,
          phone_number: item.phone_number,
          id: item.id,
          url: item.url,
          poliza: null,
          usuario: null
        }
        $scope.beneficiaries.push(beneficiary);
      }
    };

    $scope.addBeneficiary = function(){
      var beneficiary = {
        type_person: 1,
        first_name: '',
        last_name: '',
        second_last_name: '',
        j_name: '',
        full_name: '',
        rfc: '',
        email: '',
        phone_number: '',
        poliza: null,
        usuario: null
      }
      $scope.beneficiaries.push(beneficiary);
    };

    $scope.deleteBeneficiary = function(index){
      $scope.beneficiaries.splice(index, 1);
    };

    $scope.typePerson = function(param, index){
      $scope.beneficiaries[index].type_person = param;
    };

    $scope.matchesShows = function(parWord){
      if(parWord) {
        if(parWord.length >= 3) {
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   $scope.show_contratante = 'v2/contratantes/contractors-match/';
          $scope.show_contratante = 'contractors-match-fianzas/';
          $http.post(url.IP + $scope.show_contratante, 
          {
            'matchWord': parWord,
            'poliza': true
          })
          .then(function(response){
            if(response.status === 200 && response.data != 404){
              var source = [];
              var juridicals = response.data.juridicals;
              var naturals = response.data.naturals;

              if(juridicals.length) {
                juridicals.forEach(function(item){
                  var obj = {
                    label: item.j_name,
                    value: item
                  };
                  source.push(obj);
                });
              }
              if(naturals.length) {
                naturals.forEach(function(item){
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
                  source.push(obj);
                });
              }
              $scope.contractors_data = source;
            }
          });
        }
      }
    };

    $scope.$watch("order.contratante.value",function(newValue, oldValue){
      if(order.contratante){
        if(order.contratante.value.address_contractor){
          if(order.contratante.value.address_contractor){
            $scope.programa_contractor = order.contratante.value.url;
            $scope.has_programa_de_proveedores = true;
          }
        }
      }
    });

    /** Uploader files */
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
    //   name: 'customFilter',
    //   fn: function(item, options){
    //     return this.queue.length < 20;
    //   }
    // });

    // ALERTA SUCCES UPLOADFILES
    uploader.onSuccessItem = function(fileItem, response, status, headers){
      if($uibModalInstance){
        $uibModalInstance.dismiss('cancel');
      }
      $scope.okFile++;
      if($scope.okFile == $scope.uploader.queue.length){
        $timeout(function(){
          SweetAlert.swal('¡Listo!', 'Renovación creada exitosamente.', 'success');
          $scope.show_certificates = true;

          if($uibModalInstance){
            $uibModalInstance.close(200);
          }
        }, 1000);
      }
    };

    // ALERTA ERROR UPLOADFILES
    uploader.onErrorItem = function(fileItem, response, status, headers){
      
    };

    uploader.onAfterAddingFile = function(fileItem){
      fileItem.formData.push({
        arch: fileItem._file,
        nombre: fileItem.file.name
      });
      $scope.specialchar = []
      var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-="
      var specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

      var str = fileItem.file.name;   
      for(i = 0; i < specialChars.length;i++){ 
        if(str.indexOf(specialChars[i]) > -1){         
          if (specialChars[i] == " " || specialChars[i] == "_" || specialChars[i] == "~" || specialChars[i] == "%" || specialChars[i] == "=" || specialChars[i] == "-" || specialChars[i] == " " || specialChars[i] == "_" || specialChars[i] == "#" || specialChars[i] == "(" || specialChars[i] == ")" || specialChars[i] == ":" || specialChars[i] == '"') {
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
            str = str.split('~').join('');
            fileItem.file.name = fileItem.file.name.split('~').join('');
            str = str.split('%').join('');
            fileItem.file.name = fileItem.file.name.split('%').join('');
            str = str.split('=').join('');
            fileItem.file.name = fileItem.file.name.split('=').join('');
            str = str.split('_').join('');
            fileItem.file.name = fileItem.file.name.split('_').join('');
            str = str.split(" ").join("")
            fileItem.file.name = fileItem.file.name.split(' ').join('');
          }else{         
            $scope.specialchar.push(specialChars[i])  
          }
        } 
      }
      fileItem.file.name = fileItem.file.name.replace(/[&\/\\#^+()$~%'":*=_?<>{}!@]/g, '').replace(/ /g,'')
      fileItem.file.name = fileItem.file.name.trim()
      if ($scope.specialchar.length > 0) {
        $scope.uploader.queue.splice($scope.uploader.queue.indexOf(fileItem),1)
        SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales: '+$scope.specialchar,'error') 
      }
      if(fileItem){
        $scope.countFile++;
      }
    };

    uploader.onBeforeUploadItem = function(item){
      if(item.file.sensible != undefined){
        item.formData[0].sensible = item.file.sensible;
      }
      item.url = $scope.userInfo.url;
      item.formData[0].nombre = item.file.name;
      item.alias = '';
      item.formData[0].owner = $scope.userInfo.id;
    };

    function uploadFiles(polizaId){
      $scope.userInfo = {
        id: polizaId
      };
      $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
      $scope.files = [];
      $scope.files_ = [];

      $timeout(function(){
        $scope.uploader.uploadAll();    
      }, 1000);  
    }

    $scope.validityInsurance = function(){
      if(!$scope.showPF){
        if(!$scope.surety.poliza_number){
          SweetAlert.swal("Error", MESSAGES.ERROR.POLICYNOREQUIRED, "error");
          return;
        }
        if(!$scope.dataToSave.recibos_poliza){
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRECEIPTS, "error");
          return;
        }
      }
      if(!$scope.surety.aseguradora){
        SweetAlert.swal("Error", MESSAGES.ERROR.PROVIDERREQUIRED, "error");
        return;
      }
      if(!$scope.surety.clave){
        SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
        return;
      }
      if(!$scope.surety.ramo){
        SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
        return;
      }
      if(!$scope.surety.subramo){
        SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
        return;
      }
      if(!$scope.surety.fianza_type){
        SweetAlert.swal("Error", "Agrega un tipo de subramo de fidelidad colectiva.", "error");
        return;
      }
      if(!order.contacto.val){
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORCONTRACTOR, "error");
        return;
      }
      if(!$scope.surety.address){
        SweetAlert.swal("Error", MESSAGES.ERROR.ADDRESS, "error");
        return;
      }
      if(!$scope.surety.contract_poliza.guarantee_amount){
        SweetAlert.swal("Error", "Agrega el monto a garantizar.", "error");
        return;
      }
      if(!$scope.surety.contract_poliza.rate){
        SweetAlert.swal("Error", "Agrega el monto a garantizar.", "error");
        return;
      }
      if(!$scope.surety.contract_poliza.activity){
        SweetAlert.swal("Error", "Agrega el giro de la empresa.", "error");
        return;
      }
      if(!$scope.surety.contract_poliza.no_employees){
        SweetAlert.swal("Error", "Agrega el número de empleados.", "error");
        return;
      }
      if(!$scope.surety.contract_poliza.description){
        SweetAlert.swal("Error", "Agrega el detalle adicional de garantía.", "error");
        return;
      }
      var categoryFlag = false;
      $scope.categories.forEach(function(item, index){
        if(item.name == ''){
          SweetAlert.swal('Error', 'Agrega un nombre a la carátula ' + (index + 1) + '.', 'error');
          categoryFlag = true;
        }
        if(item.deductible == ''){
          SweetAlert.swal('Error', 'Agrega un porcentaje del deducible a la carátula ' + (index + 1) + '.', 'error');
          categoryFlag = true;
        }
      });
      var beneficiaryFlag = false;
      $scope.beneficiaries.forEach(function(item, index){
        if(item.type_person == 1){
          if(item.name == ''){
            SweetAlert.swal('Error', 'Agrega un nombre al beneficiario ' + (index + 1) + '.', 'error');
            beneficiaryFlag = true;
          }
          if(item.last_name == ''){
            SweetAlert.swal('Error', 'Agrega un apellido paterno al beneficiario ' + (index + 1) + '.', 'error');
            beneficiaryFlag = true;
          }
          if(item.second_last_name == ''){
            SweetAlert.swal('Error', 'Agrega un apellio materno al beneficiario ' + (index + 1) + '.', 'error');
            beneficiaryFlag = true;
          }
        }else{
          if(item.j_name == ''){
            SweetAlert.swal('Error', 'Agrega una razón social al beneficiario ' + (index + 1) + '.', 'error');
            beneficiaryFlag = true;
          }
        }
        // if(item.rfc == ''){
        //     SweetAlert.swal('Error', 'Agrega un rfc al beneficiario ' + (index + 1) + '.', 'error');
        //     beneficiaryFlag = true;
        //   }
      });
      if(!$scope.surety.identifier){
        SweetAlert.swal("Error", MESSAGES.ERROR.IDENTIFIERREQUIRED, "error");
        return;
      }
      $scope.referenciadorArray.forEach(function(item){
        $scope.referenciadoresSelected = [];
        if(item.referenciador != ''){
          if(item.comision_vendedor == ''){
            item.comision_vendedor = 0;
          }
          $scope.referenciadoresSelected.push(item);
        }
      });
      if(beneficiaryFlag || categoryFlag){
        return;
      }else{
        $scope.saveSurety();
      }
    };

    $scope.renewalSelection = function(ren) {
      $scope.dataToSave.is_renewable = order.renewal.selected;
    }
    $scope.saveSurety = function(){
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      
      if($scope.referenciadoresSelected.length == 0){
        l.stop();
        SweetAlert.swal("Error", "Agrega un referenciador para la fidelidad colectiva.", "error");
        return;
      }

      if($scope.dataToSave.recibos_poliza){
        $scope.dataToSave.recibos_poliza.forEach(function(item){
          item.fecha_inicio = toDate(item.startDate);
          item.fecha_fin = toDate(item.endingDate);
          item.vencimiento = toDate(item.vencimiento);
        });
      }

      $scope.surety.poliza_number = null;
      $scope.surety.document_type = 8;
      $scope.surety.forma_de_pago = 5;
      $scope.surety.aseguradora = $scope.surety.aseguradora.url;
      $scope.surety.folio = '';
      $scope.surety.fianza_type = $scope.subramoTypeSelected.url;
      $scope.surety.address = $scope.surety.address.url;
      $scope.surety.emision_date = null;
      $scope.surety.fecha_anuencia = null;
      $scope.surety.status = $scope.showPF ? 1 : 14;
      $scope.surety.status_emision = 1;
      $scope.surety.monto_afianzado = null;
      $scope.surety.tarifa_afianzada = null;
      $scope.surety.p_neta = $scope.dataToSave.p_neta ? $scope.dataToSave.p_neta : 0;
      $scope.surety.descuento = $scope.dataToSave.descuento ? $scope.dataToSave.descuento : 0;
      $scope.surety.rpf = $scope.dataToSave.rpf ? $scope.dataToSave.rpf : 0;
      $scope.surety.derecho = $scope.dataToSave.derecho ? $scope.dataToSave.derecho : 0;
      $scope.surety.sub_total = $scope.dataToSave.sub_total ? $scope.dataToSave.sub_total : 0;
      $scope.surety.iva = $scope.dataToSave.iva ? $scope.dataToSave.iva : 0;
      $scope.surety.p_total = $scope.dataToSave.p_total ? $scope.dataToSave.p_total : 0;
      $scope.surety.comision = $scope.dataToSave.comision ? $scope.dataToSave.comision : 0;
      $scope.surety.comision_percent = $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0;
      $scope.surety.recibos_poliza = $scope.dataToSave.recibos_poliza ? $scope.dataToSave.recibos_poliza : [];
      $scope.surety.total_receipts = $scope.dataToSave.recibos_poliza ? $scope.dataToSave.recibos_poliza.length : 0;
      $scope.surety.ref_policy = $scope.referenciadoresSelected;
      $scope.surety.beneficiaries_poliza = $scope.beneficiaries;
      $scope.surety.is_renewable =order.renewal ? $scope.dataToSave.is_renewable : 2;
      $scope.surety.bono_variable = $scope.surety.bono_variable ? $scope.surety.bono_variable : 0;

      $scope.surety.programa_de_proveedores_contractor = $scope.programa_contractor ? $scope.programa_contractor : null;
      $scope.surety.has_programa_de_proveedores = $scope.has_programa_de_proveedores ? true : false;

      $scope.surety.date_emision_factura = $scope.surety.date_emision_factura ? datesFactory.toDate($scope.surety.date_emision_factura ): null,
      $scope.surety.month_factura =  $scope.surety.month ? $scope.surety.month.month_selected : 0,
      $scope.surety.folio_factura = $scope.surety.folio_factura ? $scope.surety.folio_factura : '',

      $http.post(url.IP + 'fianzas_collective/', $scope.surety)
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          $scope.dataSurety = response.data;
          $scope.categories.forEach(function(item, index){
            item.parent = response.data.id;
            item.caratula = response.data.id;     
          });
          $http.post(url.IP + 'categories_collectivesurety/', $scope.categories)
          .then(function(request){
            if(request.status == 200 || request.status == 201){
              $scope.dataCategories = request.data.data;
                uploadFiles($scope.dataSurety.id);

                if($scope.reexpedir){
                  if($scope.origin_renewable){
                    var obj = {
                      reason_rehabilitate: null,
                      reason_cancel: $rootScope.reason_cancel,
                      concept_annulment: $rootScope.concept_annulment,
                      status: 17,
                      renewed_status: 1
                    }
                    $http.patch($scope.policy_history.url, obj)
                    .then(function(respuesta){
                      if(respuesta.status == 200){
                        
                        // Log fianza
                        var params = {
                          'model': 13,
                          'event': "PATCH",
                          'associated_id': $scope.policy_history.id,
                          'identifier': respuesta.data.status == 24 ? 'actualizó la fianza colectiva por preanulacion' : 'actualizó la fianza colectiva por anulación.'
                        }
                        dataFactory.post('send-log/', params).then(function success(response){
                        });
                      }//response patch
                    })
                    .catch(function(e){
                      console.log('error', e);
                    });
                  }
                  var obj = {
                    reason_rehabilitate: null,
                    reason_cancel: $rootScope.reason_cancel,
                    concept_annulment: $rootScope.concept_annulment,
                    status: 17,
                    renewed_status: 1
                  }
                  $http.patch($scope.original_surety.url, obj)
                  .then(function(respuesta){
                    if(respuesta.status == 200){
                      
                      // Log fianza
                      var params = {
                        'model': 13,
                        'event': "PATCH",
                        'associated_id': $scope.original_surety.id,
                        'identifier': respuesta.data.status == 24 ? 'actualizó la fianza colectiva por preanulacion' : 'actualizó la fianza colectiva por anulación.'
                      }
                      dataFactory.post('send-log/', params).then(function success(response){
                      });
                    }//response patch
                  })
                  .catch(function(e){
                    console.log('error', e);
                  });
                }else{
                  /* Actualiza la póliza antigua */
                  var data = {
                    status: 12,
                    renewed_status: 1,
                    fecha_cancelacion:$scope.original_surety.fecha_cancelacion,
                  }
                  $http.patch($scope.original_surety.url, data)
                  .then(function(resp){

                  })
                  .catch(function(e){
                    l.stop();
                    console.log('error - caratula - catch', e);
                  });
                }

                /* Relación con la póliza original */
                if($scope.original_surety.poliza_number){
                  var oldPolicy = {
                    policy: $scope.original_surety.poliza_number,
                    base_policy: $scope.original_surety.url,
                    new_policy: $scope.dataSurety.url
                  }
                }else{
                  var oldPolicy = {
                    base_policy: $scope.original_surety.url,
                    new_policy: $scope.dataSurety.url
                  }
                }
                $http.post(url.IP + 'v1/polizas/viejas/', oldPolicy)
                .then(function(res){

                })
                .catch(function(e){
                  l.stop();
                  console.log('error - caratula - catch', e);
                });

                var params = {
                  'model': 13,
                  'event': "POST",
                  'associated_id': $scope.original_surety.id,
                  'identifier': $scope.original_surety.poliza_number ? " renovó la fianza colectiva." : " renovó el proyecto de fianza."
                }
                dataFactory.post('send-log/', params).then(function success(response){

                });

                SweetAlert.swal('¡Listo!', 'Renovación creada exitosamente.', 'success');
                $scope.show_certificates = true;
            }
          })
          .catch(function (e) {
            l.stop();
            console.log('error - caratula - catch', e);
          });
        }
      })
      .catch(function (e) {
        l.stop();
        console.log('error - caratula - catch', e);
      });
    };

    $scope.cancel = function(){
      $state.go('fianzas.list');
    };

    $scope.validateExcel = function(param){
      $scope.excelJson = [];
      var flagCertificate = false;
      if(param.TITULARES){
        $scope.excelJson = param.TITULARES;
        $scope.excelJson.forEach(function(item){
          if(!item.CERTIFICADO){
            SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna CERTIFICADO, corrige el error y vuelve a subir el excel.', 'error');
            flagCertificate = true;
          }
          if(!item.NOMBRE){
            SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna NOMBRE, corrige el error y vuelve a subir el excel.', 'error');
            flagCertificate = true;
          }
          if(!item.APELLIDO_PATERNO){
            SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna APELLIDO_PATERNO, corrige el error y vuelve a subir el excel.', 'error');
            flagCertificate = true;
          }
          if(!item.APELLIDO_MATERNO){
            SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna APELLIDO_MATERNO, corrige el error y vuelve a subir el excel.', 'error');
            flagCertificate = true;
          }
          if(!item.PUESTO){
            SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PUESTO, corrige el error y vuelve a subir el excel.', 'error');
            flagCertificate = true;
          }
          if(!item.ACTIVIDAD){
            SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna ACTIVIDAD, corrige el error y vuelve a subir el excel.', 'error');
            flagCertificate = true;
          }
          if(!item.CATEGORIA){
            SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna CATEGORIA, corrige el error y vuelve a subir el excel.', 'error');
            flagCertificate = true;
          }
        });
        if(!flagCertificate){
          $scope.selectedCertificates = param;
          $scope.addViews(0);
        }
      }else{
        SweetAlert.swal('Error', 'El layout no corresponde a ninguno de nuestros formatos. Revisa el layout seleccionado', 'error');
      }
    };

    $scope.changeViews = function(){
      $scope.excelJsonViews = [];
      $scope.excelJson.forEach(function(item, index){
        if((index + 1) >= $scope.valueInitial && index < $scope.valueFinal){
          $scope.excelJsonViews.push(item);
        }
      });
    };

    $scope.selectViews = function(value){
      $scope.optionViews = value;
      $scope.addViews(0);
    };

    $scope.addViews = function(value){
      $scope.showTableCertificates = true;
      if(value == 0){
        $scope.valueInitial = 1;
        $scope.valueFinal = $scope.optionViews.value;
        if($scope.valueFinal > $scope.excelJson.length){
          $scope.valueFinal = $scope.excelJson.length;
        }
      }else if(value == 1){
        $scope.valueInitial = $scope.valueInitial + $scope.optionViews.value;
        $scope.valueFinal = $scope.valueInitial + ($scope.optionViews.value - 1);
        if($scope.valueFinal > $scope.excelJson.length){
          $scope.valueFinal = $scope.excelJson.length;
        }
      }else{
        $scope.valueInitial = $scope.valueInitial - $scope.optionViews.value;
        $scope.valueFinal = $scope.valueInitial + ($scope.optionViews.value - 1);
      }
      $scope.changeViews();
    };

    $scope.cancelCertificates = function(){
      $scope.showTableCertificates = false;
      $scope.selectedCertificates = [];
      $scope.excelJson = [];
      $scope.excelJsonViews = [];
    };

    $scope.saveCertificates = function(){
      $scope.loader = true;
      $scope.certificates = [];

      if($scope.selectedCertificates.TITULARES){
        $scope.selectedCertificates.TITULARES.forEach(function(item){
          var personal = {
            certificate_number: parseInt(item.CERTIFICADO),
            email: item.CORREO ? item.CORREO : null,
            first_name: item.NOMBRE,
            last_name: item.APELLIDO_PATERNO,
            second_last_name: item.APELLIDO_MATERNO,
            rfc: item.RFC ? item.RFC : null,
            workstation: item.PUESTO ? item.PUESTO : null
          }
          var certificateData = {
            caratula: $scope.dataSurety.id,
            certificate_number: parseInt(item.CERTIFICADO),
            parent: item.CATEGORIA,
            poliza_number: $scope.dataSurety.poliza_number + ' - INC. ' + item.CERTIFICADO,
            start_of_validity: $scope.dataSurety.start_of_validity,
            end_of_validity: $scope.dataSurety.end_of_validity,
            status: $scope.dataSurety.status,
            beneficiaries_poliza: personal,
            contract_poliza: {
              activity: item.ACTIVIDAD,
              amount: item.MONTO_A_GARANTIZAR ? item.MONTO_A_GARANTIZAR : null
            },
            observations: item.OBSERVACIONES ? item.OBSERVACIONES : null,
            document_type: 10,
            identifier: item.NOMBRE + '_' + item.APELLIDO_PATERNO + '_' + item.APELLIDO_MATERNO,
          };
          $scope.certificates.push(certificateData);
        });
      }

      $http({
        method: 'POST',
        url: url.IP + 'certificates_collectivesurety/',
        data: $scope.certificates
      })
      .then(function success (response) {
        if(response.status === 201 || response.status === 200){
          $scope.loader = false;
          SweetAlert.swal("¡Listo!", MESSAGES.OK.CERTIFICATESDONE, 'success');
          $state.go('fianzas.details', {polizaId: $scope.dataSurety.id});
        }else{
          $scope.loader = false;
          // SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORCERTIFICATES ,"error");
          SweetAlert.swal("ERROR",response.data ,"error");
        }
      })
      .catch(function(e){
        console.log('error - caratula - catch', e);
      });
    };

    $scope.goToInformation = function(){
      $state.go('fianzas.details', {polizaId: $scope.dataSurety.id});
    };

  }

})();
