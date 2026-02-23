/* global angular */
(function() {
    'use strict';

    angular.module('inspinia')
      .controller('FlotillasRenewalCtrl', FlotillasRenewalCtrl)

    FlotillasRenewalCtrl.$inject = ['$scope', '$http', 'url', '$stateParams', '$sessionStorage', 'MESSAGES', 'SweetAlert', '$state', 
                              'providerService', 'helpers', 'dataFactory', 'FileUploader', 'formatValues', '$rootScope',
                              '$localStorage', '$timeout', 'coverageService', 'datesFactory'];

  function FlotillasRenewalCtrl($scope, $http, url, $stateParams, $sessionStorage, MESSAGES, SweetAlert, $state, providerService, 
                          helpers, dataFactory, FileUploader, formatValues, $rootScope, $localStorage, $timeout, coverageService, 
                          datesFactory) {
    
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);

    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);

    $scope.infoUser = $sessionStorage.infoUser;

    var order = this;
    $scope.showOt = true;
    $scope.showRenewal = false;
    $scope.caratula = {};
    $scope.layout = {};
    $rootScope.show_contractor = false;
    $scope.create_natural = true;
    $scope.create_juridical = true;
    $scope.claves = [];
    $scope.types = [
      {'value':1, 'label':'Abierta'},
      {'value':2, 'label':'Cerrada'}
    ];
    $scope.typeSelected = $scope.types[0];
    $scope.renewals = [
      {'value':1, 'label':'Renovable'},
      {'value':2, 'label':'No Renovable'}
    ];
    $scope.renewalSelected = $scope.renewals[0];
    $scope.currencys = [
      {'value':1, 'label':'Pesos'},
      {'value':2, 'label':'Dólares'},
      {'value':3, 'label':'UDI'},
      {'value':4, 'label':'Euros'}
    ];

    $scope.businessline = [
      {'id':1,'name':'Comercial'},
      {'id':2,'name':'Personal'},
      {'id':0,'name':'Otro'},
  ];

    $scope.currencySelected = $scope.currencys[0].value;

    $scope.referenciadorArray = [];

    $scope.dataCaratula = [];

    $scope.contractorLayout = {};

    $scope.showTableCertificates = false;
    $scope.excelJson = [];
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
    $scope.certifcados = [];

    $scope.celulas = [];
    $scope.agrupaciones = [];
    $scope.sub_asignaciones = [];
    $scope.sub_subasignaciones = [];

    // var myInsurance = $stateParams.myInsurance;
    // if(myInsurance.url){
    //   order  = {
    //     contratante : {}
    //   }
      
    //   order.contratante.value = $stateParams.myInsurance;
    //   if(order.contratante.value.email){
    //     order.contratante.value.email = $stateParams.myInsurance.email
    //   }
    // }

    order.accesos = $sessionStorage.permisos
    if (order.accesos) {
      order.accesos.forEach(function(perm){
        if(perm.model_name == 'Pólizas'){
          order.acceso_polizas = perm
          order.acceso_polizas.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar pólizas') {
              if (acc.checked == true) {
                order.acceso_adm_pol = true
              }else{
                order.acceso_adm_pol = false
              }
            }else if (acc.permission_name == 'Ver pólizas') {
              if (acc.checked == true) {
                order.acceso_ver_pol = true
              }else{
                order.acceso_ver_pol = false
              }
            }
          })
        }
        if (perm.model_name == 'Formatos') {
          order.acceso_form = perm;
          order.acceso_form.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Formatos') {
              if (acc.checked == true) {
                order.acceso_form = true
              }else{
                order.acceso_form = false
              }
            }
          })
        }
        if(perm.model_name == 'Ordenes de trabajo'){
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
        }
        if (perm.model_name == 'Contratantes y grupos') {
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
        }
        if(perm.model_name == 'Comisiones'){
          order.coms = perm
          order.coms.permissions.forEach(function(acc){
            if (acc.permission_name == 'Comisiones') {
              if (acc.checked == true) {
                order.permiso_comisiones = true
              }else{
                order.permiso_comisiones = false
              }
            }
          })
        }
        if(perm.model_name == 'Archivos'){
          order.acceso_files = perm
          order.acceso_files.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar archivos sensibles') {
              if (acc.checked == true) {
                order.permiso_archivos = true
              }else{
                order.permiso_archivos = false
              }
            }// Administrar adjuntos //no agregar, no eliminar, no renombrar, no marcar sensible
            if (acc.permission_name == 'Administrar adjuntos') {
              if (acc.checked == true) {
                order.permiso_administrar_adjuntos = true
              }else{
                order.permiso_administrar_adjuntos = false
              }
            }
          })
        }
        if(perm.model_name == 'Referenciadores'){
          order.acceso_ref = perm
          order.acceso_ref.permissions.forEach(function(acc){
            if (acc.permission_name == 'Ver referenciadores') {
              if (acc.checked == true) {
                order.acceso_ver_ref = true
              }else{
                order.acceso_ver_ref = false
              }
            }
          })
        }
      })
    }

    activate();

    function activate(){
      $scope.campo_agrupacion = false;
      $scope.campo_celula = false;
      $scope.campo_lineanegocio = false;
      $scope.moduleName = 'Célula';  
      dataFactory.get('orginfo/')
      .then(function success(response) {
          if(response.data.results.length){
            $scope.configuracionGlobal = response.data.results[0]
            $scope.campo_agrupacion = $scope.configuracionGlobal.filtros_agrupacion;
            $scope.campo_celula = $scope.configuracionGlobal.filtros_celula;
            $scope.campo_lineanegocio = $scope.configuracionGlobal.filtros_lineanegocio;
            if($scope.configuracionGlobal.moduleName){
              $scope.moduleName=$scope.configuracionGlobal.moduleName;
            }
          }
      })
      $http.get(url.IP + 'leer-polizas-info/' + $stateParams.polizaId)
      .then(function success(response){
        if(response.status == 200){
          if($localStorage.save_renewal_flotilla){
            if($localStorage.save_renewal_flotilla.id == response.data.id){
              $scope.caratula = $localStorage.save_renewal_flotilla;
            }else{
              $scope.copy_caratula = angular.copy(response.data);
              $scope.caratula = response.data
            }
          }else{
            $scope.caratula = response.data;
          }
          $scope.copy_caratula = angular.copy(response.data);
          $scope.originalCaratula = angular.copy(response.data);
          $scope.caratula.poliza_number = "";
          $scope.startDate = datesFactory.convertDate(response.data.end_of_validity);
          var date_initial = (datesFactory.convertDate(response.data.end_of_validity)).split('/');
          var day = date_initial[0];
          var month = date_initial[1];
          var year = parseInt(date_initial[2]);

          if($scope.businessline && $scope.businessline.length > 0){
            $scope.businessline.forEach(function(item){
              if(item.id == response.data.business_line){
                $scope.lineaSelected = item;
              }
            })
          }

          if(day.length == 1){
            day = '0' + day;
          }
          if(month.length == 1){
            month = '0' + month;
          }

          $scope.endDate = datesFactory.convertDate(new Date(month + '/' + day + '/' + (year + 1)));
          // $scope.endDate = datesFactory.convertDate(response.data.end_of_validity);
          $scope.checkDate($scope.startDate);
          fillProvider();

          $scope.currencys.forEach(function(item1){
            if(item1.value == $scope.caratula.f_currency){
              $scope.currencySelected = item1.value;
              $scope.caratula.f_currency = item1.value;
            }
          });

          $scope.types.forEach(function(item){
            if(item.value == $scope.caratula.type_policy){
              $scope.typeSelected = item;
              $scope.caratula.type_policy = item.value;
            }
          });

          order.contratante = {};  
          $scope.aseguradoraSelected = $scope.caratula.aseguradora;

          // if ($scope.caratula.juridical) {
          //   var url_aux = url.IP + 'morales-resume-medium/' + $scope.caratula.juridical + '/';
          // } else {
          //   var url_aux = url.IP + 'fisicas-resume-medium/' + $scope.caratula.natural + '/';
          // }
          // console.log('$scope.caratula.contractor', $scope.caratula.contractor);
          var get_contratante = $scope.caratula.contractor && $scope.caratula.contractor.id ? $scope.caratula.contractor.id : $scope.caratula.contractor; 
          var url_aux = url.IP + 'contractors-resume-medium/' + get_contratante + '/';
          $http({method: 'GET', url: url_aux})
          .then(function success(response) {
            $scope.contratante = response.data;
            // if ($scope.caratula.natural) {
            //   $scope.addresses = $scope.contratante.address_natural;
            //   $scope.contratante.address_natural.forEach(function(address){
            //     if(address.id == $scope.caratula.address.id){
            //       $scope.addressSelected = $scope.caratula.address;
            //     }
            //   });
            //   order.contratante.val = $scope.contratante.full_name;
            //   order.contratante.value = $scope.contratante;
            // } else if ($scope.caratula.juridical) {
            //   $scope.addresses = $scope.contratante.address_juridical;
            //   $scope.contratante.address_juridical.forEach(function(address){
            //     if(address.id == $scope.caratula.address.id){
            //       $scope.addressSelected = $scope.caratula.address;
            //     }
            //   });
            //   order.contratante.val = $scope.contratante.j_name;
            //   order.contratante.value = $scope.contratante;
            // }
            if ($scope.caratula.contractor) {
              $scope.caratula.address = $scope.copy_caratula.address;
              $scope.addresses = $scope.contratante.address_contractor;
              if($scope.contratante && $scope.contratante.address_contractor){
                  $scope.contratante.address_contractor.forEach(function(address){
                  if(address.id == $scope.caratula.address.id){
                    $scope.addressSelected = $scope.caratula.address;
                  }
                });
              }
              order.contratante.val = $scope.contratante.full_name;
              order.contratante.value = $scope.contratante;
              $scope.contratante.direccion = $scope.caratula.address;
            }
          }, function error(response) {
            console.log('error', response);
          })
          .catch(function (e) {
            console.log('error', e);
          });

          // Referenciadores
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
          })
          .catch(function(e){
            console.log('error', e);
          });
          if($scope.caratula.ref_policy.length > 0){
            $scope.caratula.ref_policy.forEach(function(refs){
              $http.get(refs.referenciador).then(function success(response_ref_plicy){
                if(response_ref_plicy){
                  refs.data = response_ref_plicy.data
                  refs.referenciador = response_ref_plicy.data.url
                  refs.selectedRef = true
                  $scope.referenciadorArray.push(refs)
                }
              })
            });
          }
          // $scope.allCertificates();
          $http.get(url.IP + 'usuarios/')
          .then(function(user){
            user.data.results.forEach(function(u){              
              u.first_name = u.first_name.toUpperCase();
              u.last_name = u.last_name.toUpperCase()
              u.name = u.first_name.toUpperCase() + ' ' + u.last_name.toUpperCase();
            })
            $scope.users = user.data.results;
            $scope.usersLay = user.data.results;
            if($scope.caratula.responsable){
              $scope.users.forEach(function(item){
                if(item.id == $scope.caratula.responsable.id){
                  $scope.responsableSelected = item.id;
                }
              });
            }
            if($scope.caratula.collection_executive){
              $scope.users.forEach(function(item){
                if(item.id == $scope.caratula.collection_executive.id){
                  $scope.ejecutivoCobranzaSelected = item.id;
                }
              });
            }

            $scope.getClaves($scope.aseguradoraSelected);
          })
          .catch(function(e){
            console.log('error', e);
          });

          dataFactory.get('sucursales-to-show-unpag/')
          .then(function success(response){
            if(response.status === 200 || response.status === 201){
              $scope.sucursalesLay = response.data;
            }
          })
          .catch(function(e){
            console.log('error', e);
          });

          dataFactory.post('celula_contractor_info/')
          .then(function(response) {
            $scope.celulas = response.data;
          });

          dataFactory.get('groupingLevel-resume/')
          .then(function(response) {
            $scope.agrupaciones = response.data;
          });

          if($scope.caratula.celula){
            if($scope.caratula.celula.id){
              $http.get($scope.caratula.celula.url)
              .then(function(response) {
                $scope.celulaSelected = response.data;
                $scope.changeCelula($scope.celulaSelected);
              });
            }else{
              $http.get($scope.caratula.celula)
              .then(function(response) {
                $scope.celulaSelected = response.data;
                $scope.changeCelula($scope.celulaSelected);
              });
            }
          }

          if($scope.caratula.grouping_level){
            $http.get(url.IP + 'groupinglevel/' + $scope.caratula.grouping_level.id)
            .then(function(response) {
              $scope.grouping_levelSelected = response.data;
              $scope.info_sub = $scope.caratula;
              $scope.changeAgrupacion($scope.grouping_levelSelected);
            });
          }
        }
      })
      .catch(function (e) {
        console.log('error', e);
      });      
    };

    $scope.save_info_tab = function(){
      $localStorage.save_edition_flotilla = angular.copy($scope.caratula);
    }

    function fillProvider() {
      var d = $scope.startDate;
      try{
        var day = d.getDate();
        var month = d.getMonth() + 1; //Months are zero based
        var year = d.getFullYear();
      }catch(error){
        var from = d.split("/")
        var f = new Date(from[2], from[1] - 1, from[0])
        var day = f.getDate();
        var month = f.getMonth() + 1; //Months are zero based
        var year = f.getFullYear();
      }

      var date = year + "-" + month + "-" + day;
      providerService.getProviderByKey(date)
      .then(function success(data) {
        $scope.providers = data.data;
      },
      function error(err) {
        console.log('error', err);
      });
    };

    $scope.checkNumPolicy = function(){
      if($scope.caratula.poliza_number){
        helpers.existPolicyNumber($scope.caratula.poliza_number)
        .then(function(request){
          if(request == true) {
            SweetAlert.swal("Error",MESSAGES.ERROR.POLICYEXIST, "error")
            $scope.caratula.poliza_number = '';
          }
        })
        .catch(function(err) {
          console.log('Error', err)
        });
      }
    };

    $scope.changeAddress = function(param){
      $scope.caratula.address = param.id;
    };

    $scope.contratanteCreator = function(){
      $rootScope.show_contractor = true;
      $localStorage.orderForm = JSON.stringify($scope.caratula);
    };

    $scope.checkDate = function(param){
      if(param.length == 10){
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

        $scope.startDate = param;
        $scope.endDate = datesFactory.convertDate(new Date(month + '/' + day + '/' + (year + 1)));
        $scope.caratula.start_of_validity = new Date(month + '/' + day + '/' + year).toISOString();
        $scope.caratula.end_of_validity = new Date(month + '/' + day + '/' + (year + 1)).toISOString();

        if(process(param) > process($scope.endDate)){
          SweetAlert.swal("Error", "La fecha inicio no puede ser mayor a la fecha fin.", "error");
          return;
        }

        function process(date){
          var parts = date.split("/");
          var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
          return date.getTime();
        }
      }
      else{
        var day = new Date().getDate();
        var month = new Date().getMonth() + 1;
        var year = new Date().getFullYear();

        $scope.startDate = param;
        $scope.endDate = datesFactory.convertDate(new Date(month + '/' + day + '/' + (year + 1)));
        $scope.caratula.start_of_validity = new Date(month + '/' + day + '/' + year).toISOString();
        $scope.caratula.end_of_validity = new Date(month + '/' + day + '/' + (year + 1)).toISOString();
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

        $scope.caratula.end_of_validity = datesFactory.toDate(param);
      }
    };

    $scope.matchesContractors = function(parWord){
      if(parWord) {
        if(parWord.val.length >= 3) {
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   $scope.show_contratante = 'v2/contratantes/contractors-match/';
          $scope.show_contratante = 'contractors-match/';
          $http.post(url.IP + $scope.show_contratante, 
          {
            'matchWord': parWord.val,
            'poliza': true
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
              //     if (item.full_name) {
              //       var obj = {
              //         label: item.full_name,
              //         value: item
              //       };
              //     } else {
              //      var obj = {
              //         label: item.first_name + ' ' + item.last_name + ' ' + item.second_last_name,
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
   
    $scope.$watch("order.contratante.value",function(newValue, oldValue){
      if(order.contratante){
        if($scope.referenciadores){
          $scope.referenciadores.some(function(user){
            if(user.url == order.contratante.value.vendor){
              $scope.referenciadorArray[0] = {
                referenciador: user.url,
                comision_vendedor: ''
              }
            }
          });
        }
        if (order.contratante.value) {
          if(order.contratante.value.address_contractor){
            $scope.caratula.contractor = order.contratante.value;
            $scope.addresses = order.contratante.value.address_contractor;
            
            if($scope.addresses.length == 1){
              $scope.addressSelected = $scope.addresses[0];
              $scope.caratula.address = $scope.addresses[0].url;
            }
          }          
        }
      }
    });

    $scope.$watch("order.searchContratante.value",function(newValue, oldValue){
      if(order.searchContratante){
        if(order.searchContratante.value.address_contractor){
          $scope.contractorLayout.id = order.searchContratante.value.id;
          $scope.contractorLayout.name = order.searchContratante.val;
          $scope.contractorLayout.contractor = order.searchContratante.value;
          if(order.searchContratante.value.type_person ==1 || order.searchContratante.value.type_person == 'Física'){
            $scope.contractorLayout.type = 1;
            $scope.contractorLayout.address = order.searchContratante.value.address_contractor;
          }else{
            $scope.contractorLayout.type = 2;
            $scope.contractorLayout.address = order.searchContratante.value.address_contractor;
          }
        }
      }
    });

    $scope.getClaves = function(param){
      $scope.caratula.aseguradora = param;
      $scope.aseguradoraSelected = param;
      $scope.ramoSelected=null;
      $scope.subramoSelected=null;
      $scope.caratula.ramo=null;
      $scope.caratula.subramo=null;
      $http.get(url.IP + 'claves-by-provider/' + $scope.caratula.aseguradora.id)
      .then(
        function success (clavesResponse){
          $scope.claves = clavesResponse.data;
          if($scope.claves.length == 1){
            $scope.caratula.clave = $scope.claves[0].id;
            $scope.claveSelected = $scope.claves[0];
          }else{
            $scope.claves.forEach(function(item){
              if(item.id == $scope.caratula.clave.id){
                $scope.caratula.clave = item.id;
                $scope.claveSelected = item;
              }
            });
          }
        }
      ).catch(function(error) {
        console.log('Error - claves-by-provider - catch', error);
      });

      $http.get(url.IP + 'ramos-by-provider/' + $scope.caratula.aseguradora.id)
      .then(
        function success(response){
          $scope.ramos = response.data;
          $scope.ramos.forEach(function(item){
          if(item.ramo_name == $scope.originalCaratula.ramo){
            $scope.ramoSelected = item;
            $scope.caratula.ramo = item;
            $scope.subramos = item.subramo_ramo;
            $scope.subramos.forEach(function(subramo){
              if(subramo.subramo_name == $scope.originalCaratula.subramo){
                $scope.subramoSelected = subramo;
                $scope.caratula.subramo = subramo;
                $scope.layout = {
                  subramo: subramo
                };
                $scope.getPackage();
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

    $scope.getPackage = function(paq){
      $http.post(url.IP+ 'paquetes-data-by-subramo/',
        {'ramo': $scope.ramoSelected.id, 'subramo':$scope.subramoSelected.id,'provider':$scope.aseguradoraSelected.id })
      .then(
        function success (response) {
          if(response.data.length) {
            $scope.paquetesLayout = response.data;
          }else{
            $scope.paquetesLayout  = [];
          }
        },
        function error (e) {
          console.log('Error - paquetes-data-by-subramo', e);
          $scope.paquetesLayout  = [];
        }
      ).catch(function (error) {
        console.log('Error - paquetes-data-by-subramo - catch', error);
        $scope.paquetesLayout = [];
      });
    }

    $scope.refreshProvider = function(){
      fillProvider();
    };

    $scope.changeClave = function(param){
      if(param){
        $scope.caratula.clave = param.id;
        $scope.claveSelected = param
        if($scope.caratula.subramo){
          $scope.changeSubramo($scope.caratula.subramo);
        }
      }
    };

    $scope.changeRamo = function(param){
      if(param){
        $scope.caratula.ramo = param;
        $scope.ramoSelected = param;
        $scope.subramos = param.subramo_ramo;
        if(!$localStorage.save_renewal_flotilla){
          $localStorage.save_renewal_flotilla = angular.copy($scope.caratula);
        }
        $localStorage.save_renewal_flotilla['ramo'] = param;
      }
    };

    $scope.changeSubramo = function(param){
      if(param){
        $scope.caratula.subramo = param;
        $scope.subramoSelected = param;
        $scope.layout.subramo = param;
        $scope.paqueteAll(param);
        if(!$localStorage.save_renewal_flotilla){
          $localStorage.save_renewal_flotilla = angular.copy($scope.caratula);
        }
        $localStorage.save_renewal_flotilla['subramo'] = param;
      }
    };

    $scope.changeType = function(param){
      $scope.caratula.type = param;
      if(!$localStorage.save_renewal_flotilla){
        $localStorage.save_renewal_flotilla = angular.copy($scope.caratula);
      }
      $localStorage.save_renewal_flotilla['type'] = param;
    };

    $scope.changeResponsableLay = function(param){
      $scope.responsableLay = param;
    };

    $scope.changeSucursalLay = function(param){
      $scope.sucursalLay = param;
    };

    $scope.changeCurrency = function(param){
      $scope.caratula.f_currency = param;
      if(!$localStorage.save_renewal_flotilla){
        $localStorage.save_renewal_flotilla = angular.copy($scope.caratula);
      }
      $localStorage.save_renewal_flotilla['f_currency'] = param;
    };

    $scope.changeRenewal = function(param){
      $scope.caratula.is_renewable = param.value;
      if(!$localStorage.save_renewal_flotilla){
        $localStorage.save_renewal_flotilla = angular.copy($scope.caratula);
      }
      $localStorage.save_renewal_flotilla['is_renewable'] = param;
    };

    $scope.changeResponsable = function(param){
      $scope.caratula.responsable = param;
      if(!$localStorage.save_renewal_flotilla){
        $localStorage.save_renewal_flotilla = angular.copy($scope.caratula);
      }
      $localStorage.save_renewal_flotilla['responsable'] = param;
    };

    $scope.changeEjecutivoCobranza = function(param){
      $scope.users.forEach(function(item){
        if(item.id == param){
          $scope.caratula.collection_executive = item;
          if(!$localStorage.save_renewal_flotilla){
            $localStorage.save_renewal_flotilla = angular.copy($scope.caratula);
          }
          $localStorage.save_renewal_flotilla['collection_executive'] = param;
        }
      });
    };

    $scope.changeCelula = function(param){
      $scope.caratula.celula = param.id;
      if(!$localStorage.save_renewal_flotilla){
        $localStorage.save_renewal_flotilla = angular.copy($scope.caratula);
      }
      $localStorage.save_renewal_flotilla['celula'] = param;
    };

    $scope.changeAgrupacion = function(data){
      $scope.sub_asignaciones = data.subgrupos;
      $scope.caratula.groupinglevel = data.id;
      if($scope.info_sub.subgrouping_level){
        $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subgrouping_level.id)
        .then(function(response) {
          $scope.subgroupingSelected = response.data;
          $scope.sub_asignaciones.forEach(function(item){
            if(item.id == $scope.subgroupingSelected.id){
              $scope.changeSubagrupacion(item);
            }
          });
        });
      }
    };

    $scope.changeSubagrupacion = function(data){
      if(data.subsubgrupos){
        $scope.sub_subasignaciones = data.subsubgrupos;
        $scope.caratula.groupinglevel = data.id;
        if($scope.info_sub.subsubgrouping_level){
          $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subsubgrouping_level.id)
          .then(function(response) {
            $scope.subsubgroupingSelected = response.data;
            $scope.caratula.groupinglevel = response.data.id;
          });
        }
      }
    };

    $scope.changeSubsubagrupacion = function(data){
      $scope.caratula.groupinglevel = data.id;
    };

    $scope.addReferenciador = function(){
      var addReferenciadores = {
        referenciador: '',
        comision_vendedor: ''
      };
      $scope.referenciadorArray.push(addReferenciadores);
    };

    $scope.changeComRef = function(param, index, com){
      $scope.referenciadorArray[index].comision_vendedor = param;
      if (com.comision_vendedor > 100) {
        com.comision_vendedor = 0;
      } else if (com.comision_vendedor < 0) {
        com.comision_vendedor = 0;
      }
      $scope.checkTotalComision(com);
    }
    $scope.checkTotalComision = function(item) {
      var totalComision = $scope.referenciadorArray.reduce(function(sum, item) {
        return sum + (parseFloat(item.comision_vendedor) || 0); // Convert to number, default to 0 if undefined
      }, 0);
      if (totalComision > 100) {
        $scope.comisionError = "La suma de las comisiones no puede superar el 100%";
        item.comision_vendedor = 0
      } else {
        $scope.comisionError = null; // No error if total is within limit
      }
    };
    $scope.deleteReferenciador = function(index){
      $scope.referenciadorArray.splice(index, 1);
    };

    $scope.validityInsurance = function(){
      var lb = Ladda.create( document.querySelector( '.ladda-buttoncrear' ) );
      lb.start();
      if(!$scope.aseguradoraSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.PROVIDERREQUIRED, "error");
        lb.stop();
        return;
      }
      if(!$scope.caratula.poliza_number){
        SweetAlert.swal("Error", MESSAGES.ERROR.POLICYNOREQUIRED, "error");
        lb.stop();
        return;
      }
      if(!$scope.caratula.identifier){
        SweetAlert.swal("Error", MESSAGES.ERROR.IDENTIFIERREQUIRED, "error");
        lb.stop();
        return;
      }
      if(!order.contratante.val){
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORCONTRACTOR, "error");
        lb.stop();
        return;
      }
      if(!$scope.caratula.address){
        SweetAlert.swal("Error", MESSAGES.ERROR.ADDRESS, "error");
        lb.stop();
        return;
      }
      if(!$scope.caratula.clave){
        SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
        lb.stop();
        return;
      }
      if(!$scope.ramoSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
        lb.stop();
        return;
      }
      if(!$scope.subramoSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
        lb.stop();
        return;
      }
      $scope.saveInsurance();
    };

    $scope.saveInsurance = function(){
      var lb = Ladda.create( document.querySelector( '.ladda-buttoncrear' ) );
      lb.start();
      if ($scope.caratula.celula) {
        if($scope.caratula.celula.id){
          $scope.caratula.celula = $scope.caratula.celula.id;
        }
      }
      $scope.caratula.address = $scope.addressSelected ? $scope.addressSelected.id : $scope.caratula.address.id;
      $scope.caratula.aseguradora = $scope.aseguradoraSelected ? $scope.aseguradoraSelected.id : $scope.caratula.aseguradora.id;
      $scope.caratula.ramo = $scope.ramoSelected ? $scope.ramoSelected.id : $scope.caratula.ramo.id;
      $scope.caratula.subramo = $scope.subramoSelected ? $scope.subramoSelected.id : $scope.caratula.subramo.id;
      $scope.caratula.type = $scope.caratula.type ? $scope.caratula.type : $scope.typeSelected ? $scope.typeSelected.value : 1;
      $scope.caratula.f_currency = $scope.caratula.f_currency ? $scope.caratula.f_currency : $scope.currencySelected ? $scope.currencySelected : 1;
      $scope.caratula.is_renewable = $scope.caratula.is_renewable ? $scope.caratula.is_renewable : $scope.renewalSelected ? $scope.renewalSelected.value : null;
      $scope.caratula.responsable = $scope.caratula.responsable && $scope.caratula.responsable.id ? $scope.caratula.responsable.id : $scope.caratula.responsable ? $scope.caratula.responsable : null;
      $scope.caratula.collection_executive = $scope.caratula.collection_executive ? $scope.caratula.collection_executive.id : null;
      $scope.caratula.document_type = 11;
      $scope.caratula.status = 14;
      $scope.caratula.celula = $scope.caratula.celula ? $scope.caratula.celula : null;
      $scope.caratula.groupinglevel = $scope.caratula.groupinglevel ? $scope.caratula.groupinglevel : null;
      $scope.caratula.contractor = $scope.caratula.contractor ? $scope.caratula.contractor.id : null;

      if(process(datesFactory.convertDate($scope.caratula.start_of_validity)) > process(datesFactory.convertDate(new Date()))){
        $scope.caratula.status = 10;
      }else{
        $scope.caratula.status = 14;
      }

      function process(date){
        var parts = date.split("/");
        var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
        return date.getTime();
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

      $scope.caratula.ref_policy = $scope.referenciadoresSelected;
      $http.post(url.IP + 'colectividades_polizas/', $scope.caratula)
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          $scope.dataCaratula = response.data;
          $scope.showCar = true;
          $scope.showPol = false;          
          SweetAlert.swal("¡Listo!", "Carátula guardada exitosamente.", "success");
          /* Actualiza la póliza antigua */
          if(process(datesFactory.convertDate($scope.copy_caratula.start_of_validity)) > process(datesFactory.convertDate(new Date()))){
            var data = {
              renewed_status: 2
            }
          }else{
            var data = {
              status: 12,
              renewed_status: 1
            }
          }

          $http.patch($scope.copy_caratula.url, data)
          .then(function(resp){

          })
          .catch(function(e){
            l.stop();
            console.log('error - caratula - catch', e);
          });

          /* Relación con la póliza original */
          if($scope.copy_caratula.poliza_number){
            var oldPolicy = {
              policy: $scope.copy_caratula.poliza_number,
              base_policy: $scope.copy_caratula.url,
              new_policy: $scope.dataCaratula.url
            }
          }
          $http.post(url.IP + 'v1/polizas/viejas/', oldPolicy)
          .then(function(res){

          })
          .catch(function(e){
            l.stop();
            console.log('error - caratula - catch', e);
          });
          lb.stop();
          $state.go('flotillas.info', {polizaId: $scope.dataCaratula.id});
        }
      })
      .catch(function (e) {
        lb.stop();
        console.log('error - caratula - catch', e);
      });

    };

    $scope.goToPolicy = function(){
      $state.go('flotillas.info', {polizaId: $scope.dataCaratula.id});
    };

    $scope.validateEmail = function(email){
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    };

    $scope.validateDate = function(date){
      var date_initial = (date).split('/');
      var day = parseInt(date_initial[0]);
      var month = parseInt(date_initial[1]);
      var year = parseInt(date_initial[2]);

      if(month > 12){
        return false;
      }else{
        if(String(year).length != 4){
          return false;
        }else{
          return true;
        }
      }
    };

    $scope.validateExcel = function(param){
      $scope.excelJson = [];
      if(!$scope.dataCaratula.id){
        SweetAlert.swal('¡Error!', 'Debes crear la carátula primero para poder cargar certificados.', 'error');
        return;
      }else{
        var flagCertificate = false;
        if(param.FLOTILLA){
          if($scope.layout.subramo.subramo_name == 'Automóviles'){
            $scope.allReceipts = [];
            $scope.excelJson = param.FLOTILLA;
            $scope.excelJson.forEach(function(item){
              if(!item.CLASE){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna CLASE, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.NO_CARATULA){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna NO_CARATULA, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              // if(!item.FOLIO){
              //   SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna FOLIO, corrige el error y vuelve a subir el excel.', 'error');
              //   flagCertificate = true;
              // }
              if(!item.NO_POLIZA){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna NO_POLIZA, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.CONTRATANTE){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna CONTRATANTE, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.TIPO_CONTRATANTE){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna TIPO_CONTRATANTE, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.DIRECCION){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna DIRECCION, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              // if(!item.CORREO){
              //   SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna CORREO, corrige el error y vuelve a subir el excel.', 'error');
              //   flagCertificate = true;
              // }else{
              //   if(!$scope.validateEmail(item.CORREO)){
              //     SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna CORREO, corrige el error y vuelve a subir el excel.', 'error');
              //     flagCertificate = true;
              //   }
              // }
              // if(!item.TELEFONO){
              //   SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna TELEFONO, corrige el error y vuelve a subir el excel.', 'error');
              //   flagCertificate = true;
              // }
              if(!item.VIGENCIA_INICIO){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna VIGENCIA_INICIO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }else{
                if(!$scope.validateDate(item.VIGENCIA_INICIO)){
                  SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna VIGENCIA_INICIO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
              }
              if(!item.VIGENCIA_FIN){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna VIGENCIA_FIN, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }else{
                if(!$scope.validateDate(item.VIGENCIA_FIN)){
                  SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna VIGENCIA_FIN, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
              }
              if(!item.FRECUENCIA_PAGO){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna FRECUENCIA_PAGO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.RENOVABLE){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna RENOVABLE, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.MONEDA){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna MONEDA, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.PAQUETE){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PAQUETE, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }else{
                if(isNaN(item.PAQUETE)){
                  SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PAQUETE, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
              }
              // if(!item.LINEA_NEGOCIO){
              //   SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna LINEA_NEGOCIO, corrige el error y vuelve a subir el excel.', 'error');
              //   flagCertificate = true;
              // }
              // if(!item.SUCURSAL){
              //   SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna SUCURSAL, corrige el error y vuelve a subir el excel.', 'error');
              //   flagCertificate = true;
              // }
              if(!item.TIPO){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna TIPO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.PROCEDENCIA){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PROCEDENCIA, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }else{
                if(isNaN(item.PROCEDENCIA)){
                  SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PROCEDENCIA, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }else{
                  if(item.PROCEDENCIA < 0 || item.PROCEDENCIA > 4){
                    SweetAlert.swal('Error', 'Los valores de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PROCEDENCIA no son válidos, corrige el error y vuelve a subir el excel.', 'error');
                    flagCertificate = true;
                  }
                }
              }
              // if(!item.CONDUCTOR){
              //   SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna CONDUCTOR, corrige el error y vuelve a subir el excel.', 'error');
              //   flagCertificate = true;
              // }
              if(!item.MARCA){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna MARCA, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.MODELO){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna MODELO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.AÑO){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna AÑO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.VERSION){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna VERSION, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.SERIE){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna SERIE, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.MOTOR){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna MOTYOR, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.COLOR){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna COLOR, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.MATRICULA){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna MATRICULA, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.USO){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna USO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }else{
                if(isNaN(item.USO)){
                  SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna USO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }else{
                  if(item.USO < 1 || item.USO > 3){
                    SweetAlert.swal('Error', 'Los valores de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna USO no son válidos, corrige el error y vuelve a subir el excel.', 'error');
                    flagCertificate = true;
                  }
                }
              }
              if(!item.SERVICIO){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna SERVICIO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.PRIMA_NETA){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PRIMA_NETA, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.DESCUENTO){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna DESCUENTO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.RPF){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna RPF, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.DERECHO){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna DERECHO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.IVA){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna IVA, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.PRIMA_TOTAL){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PRIMA_TOTAL, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
              if(!item.COMISION){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna COMISION, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }else{
                if(parseFloat(item.PORCENTAJE_COMISION) > 100.00){
                    SweetAlert.swal('Error', 'Esta linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PORCENTAJE_COMISION, excede el 100%, corrige el error y vuelve a subir el excel.', 'error');
                    flagCertificate = true;
                }
                if(parseFloat(item.PORCENTAJE_COMISION) < 0.00){
                    SweetAlert.swal('Error', 'Esta linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PORCENTAJE_COMISION, no puede ser menor a 0, corrige el error y vuelve a subir el excel.', 'error');
                    flagCertificate = true;
                }
              }
              if (parseInt(item.CLASE) == 2) {
                if(!item.NO_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna NO_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
                if(!item.PRIMA_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PRIMA_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
                if(!item.RPF_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna RPF_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
                if(!item.DERECHO_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna DERECHO_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
                if(!item.IVA_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna IVA_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
                if(!item.TOTAL_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna TOTAL_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
                if(!item.COMISION_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna COMISION_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }
                if(!item.INICIO_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna INICIO_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }else{
                  if(!$scope.validateDate(item.INICIO_RECIBO)){
                    SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna INICIO_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                    flagCertificate = true;
                  }
                }
                if(!item.FIN_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna FIN_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }else{
                  if(!$scope.validateDate(item.FIN_RECIBO)){
                    SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna FIN_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                    flagCertificate = true;
                  }
                }
                if(!item.VENCIMIENTO_RECIBO){
                  SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna VENCIMIENTO_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                  flagCertificate = true;
                }else{
                  if(!$scope.validateDate(item.VENCIMIENTO_RECIBO)){
                    SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna VENCIMIENTO_RECIBO, corrige el error y vuelve a subir el excel.', 'error');
                    flagCertificate = true;
                  }
                }
              }
              var receipt = {
                comision: item.COMISION_RECIBO,
                delivered: false,
                derecho: item.DERECHO_RECIBO,
                fecha_fin: item.FIN_RECIBO,
                fecha_inicio: item.INICIO_RECIBO,
                iva: item.IVA,
                prima_neta: item.PRIMA_RECIBO,
                prima_total: item.TOTAL_RECIBO,
                recibo_numero: item.NO_RECIBO,
                rpf: item.RPF_RECIBO,
                sub_total: item.SUBTOTAL_RECIBO,
                vencimiento: item.VENCIMIENTO_RECIBO,
                poliza: item.NO_POLIZA,
                receipt_type: 1,
                conducto_de_pago : item.CONDUCTO_DE_PAGO
              };
              $scope.allReceipts.push(receipt);
            });

            if(!flagCertificate){
              $scope.selectedCertificates = param;
              $scope.addViews(0);
            }
          }else{
            SweetAlert.swal('Error', 'El layout no corresponde al subramo de la carátula. Revisa el layout seleccionado.', 'error');
          }
        }else{
          SweetAlert.swal('Error', 'El layout no corresponde a ninguno de nuestros formatos. Revisa el layout seleccionado', 'error');
        }
      }
    };

    $scope.changeViews = function(){
      $scope.excelJsonViews = [];
      $scope.excelJson.forEach(function(item, index){
        if((index + 1) >= $scope.valueInitial && index < $scope.valueFinal){
          if(item.AÑO_CONSTRUCCION){
            item.ANO_CONSTRUCCION = item.AÑO_CONSTRUCCION;
            item.ANO_RECONSTRUCCION = item.AÑO_RECONSTRUCCION;
          }
          if(item.AÑO){
            item.AÑO = item.AÑO;
          }
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
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      $scope.loader = true;
      $scope.certifcados = [];

      if($scope.selectedCertificates.FLOTILLA){
        $scope.selectedCertificates.FLOTILLA.forEach(function(item){
          if(item.CLASE == 1){
            $scope.recibosIndividuales = [];
            var dataCar = [
              {
                brand: item.MARCA,
                charge_type: 0,
                color: item.COLOR ? item.COLOR : null,
                driver: item.CONDUCTOR ? item.CONDUCTOR : null,
                email: item.CORREO, 
                engine: item.MOTOR ? item.MOTOR : null,
                license_plates: item.MATRICULA ? item.MATRICULA : null,
                model: item.MODELO,
                policy_type: item.TIPO ? parseInt(item.TIPO) : null,
                procedencia: parseInt(item.PROCEDENCIA),
                serial: item.SERIE,
                service: item.SERVICIO,
                usage: parseInt(item.USO),
                version: item.VERSION,
                year: item.AÑO,
                no_employee: null,
                sum_insured: null,
                adjustment: item.ADAPTACIONES ? item.ADAPTACIONES : null,
                mont_adjustment: item.MONTO_ADAPTACIONES ? item.MONTO_ADAPTACIONES : null,
                special_team: item.EQUIPAMIENTO ? item.EQUIPAMIENTO : null,
                mont_special_team: item.MONTO_EQUIPAMIENTO ? item.MONTO_EQUIPAMIENTO : null,
                beneficiary_name: null,
                preferential_benefiaciary: item.BENEFICIARIO_PREFERENTE ? item.BENEFICIARIO_PREFERENTE : null,
                beneficiary_rfc: item.BENEFICIARIO_RFC ? item.BENEFICIARIO_RFC : null,
                beneficiary_address: item.BENEFICIARIO_DIRECCION ? item.BENEFICIARIO_DIRECCION : null
              }
            ];

            $scope.allReceipts.forEach(function(receipt){
              if(receipt.prima_neta && receipt.rpf && receipt.derecho){
                if(receipt.poliza == item.NO_POLIZA){
                  receipt.fecha_inicio = datesFactory.toDate(receipt.fecha_inicio);
                  receipt.fecha_fin = datesFactory.toDate(receipt.fecha_fin);
                  receipt.vencimiento = datesFactory.toDate(receipt.vencimiento);
                  receipt.conducto_de_pago = item.CONDUCTO_DE_PAGO;
                  $scope.recibosIndividuales.push(receipt);
                }
              }
            });
            
            $scope.obj_poliza = {
              aplicarDescuento: false,
              primaNeta: item.PRIMA_NETA ? item.PRIMA_NETA : 0,
              descuento: item.DESCUENTO ? item.DESCUENTO : 0,
              rpf: item.RPF ? item.RPF : 0,
              derecho: item.DERECHO ? item.DERECHO : 0,
              iva: item.IVA ? item.IVA : 0,
              primaTotal: item.PRIMA_TOTAL ? item.PRIMA_TOTAL : 0,
              subTotal: parseFloat(item.PRIMA_NETA) + parseFloat(item.RPF) + parseFloat(item.DERECHO),
            };
            // if (parseInt(item.TIPO_CONTRATANTE) ==1) {
            //   $scope.naturalP = item.CONTRATANTE
            //   $scope.juridicalP = null
            // }else if (parseInt(item.TIPO_CONTRATANTE) ==2) {
            //   $scope.naturalP = null
            //   $scope.juridicalP = item.CONTRATANTE
            // }
            if (item.TIPO_CONTRATANTE) {
              $scope.contractorP = item.CONTRATANTE
            }

            var certificateData = {
              accidents_policy: [],
              address: parseInt(item.DIRECCION),
              aseguradora: $scope.dataCaratula.aseguradora,
              automobiles_policy: dataCar,
              business_line: parseInt(item.LINEA_NEGOCIO),
              caratula: $scope.dataCaratula.id,
              celula: $scope.caratula.celula,
              clave: $scope.dataCaratula.clave,
              coverageInPolicy_policy: [],
              damages_policy: [],
              document_type: 12,
              end_of_validity: datesFactory.toDate(item.VIGENCIA_FIN),
              endorsement: false,
              f_currency: $scope.dataCaratula.f_currency,
              folio: item.FOLIO ? item.FOLIO : '',
              forma_de_pago: parseInt(item.FRECUENCIA_PAGO),
              groupinglevel: $scope.caratula.groupinglevel,
              identifier: item.MARCA + '_' + item.MODELO + '_' + item.AÑO,
              internal_number: null,
              is_renewable: item.RENOVABLE ? item.RENOVABLE : null,
              life_policy: [],
              // natural:$scope.naturalP,
              // juridical:$scope.juridicalP,
              contractor: $scope.contractorP,
              old_policies: [],
              paquete: parseInt(item.PAQUETE),
              parent: $scope.dataCaratula.url,
              caratula_renovada: $scope.copy_caratula.id,
              poliza_number: item.NO_POLIZA,
              ramo: $scope.dataCaratula.ramo,
              recibos_poliza: $scope.recibosIndividuales,
              responsable: item.RESPONSABLE ? parseInt(item.RESPONSABLE) : null,
              start_of_validity: datesFactory.toDate(item.VIGENCIA_INICIO),
              state_circulation: item.ESTADO_CIRCULACION ? parseInt(item.ESTADO_CIRCULACION) : '',
              status: 14,
              sucursal: item.SUCURSAL ? parseInt(item.SUCURSAL) : null,
              subramo: $scope.dataCaratula.subramo,
              observations: item.OBSERVACIONES ? item.OBSERVACIONES : null,
              p_neta: item.PRIMA_NETA ? item.PRIMA_NETA : 0,
              descuento: item.DESCUENTO ? item.DESCUENTO : 0,
              rpf: item.RPF ? item.RPF : 0,
              derecho: item.DERECHO ? item.DERECHO : 0,
              iva: item.IVA ? item.IVA : 0,
              p_total: item.PRIMA_TOTAL ? item.PRIMA_TOTAL : 0,
              comision: item.COMISION ? item.COMISION : 0,
              comision_percent: item.PORCENTAJE_COMISION ? item.PORCENTAJE_COMISION : 0,
              sub_total: $scope.obj_poliza.subTotal ? parseFloat($scope.obj_poliza.subTotal).toFixed(2) : 0,
              conducto_de_pago : item.CONDUCTO_DE_PAGO ? parseInt(item.CONDUCTO_DE_PAGO) : 1
            };
            $scope.certifcados.push(certificateData);
          }
        });
      }

      $http({
        method: 'POST',
        url: url.IP + 'save_caratula_polizas/',
        data: $scope.certifcados
      })
      .then(function success (response) {
        l.stop();
        if(response.status === 201 || response.status === 200){
          $scope.loader = false;
          SweetAlert.swal("¡Listo!", "Pólizas individuales creadas exitosamente.", 'success');
          $state.go('flotillas.info', {polizaId: $scope.dataCaratula.id});
        }else{
          l.stop();
          $scope.loader = false;
          SweetAlert.swal("ERROR", "Ócurrio un error al cargar las pólizas." ,"error");
        }
      })
      .catch(function (e) {
        l.stop();
        console.log('error - caratula - catch', e);
      });
    };

  }

})();
