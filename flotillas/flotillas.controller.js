/* global angular */
(function() {
    'use strict';

    angular.module('inspinia')
      .controller('FlotillasCtrl', FlotillasCtrl)

    FlotillasCtrl.$inject = ['$scope', '$http', 'url', '$stateParams', '$sessionStorage', 'MESSAGES', 'SweetAlert', '$state', 
                              'providerService', 'helpers', 'dataFactory', 'FileUploader', 'formatValues', '$rootScope',
                              '$localStorage', '$timeout', 'coverageService', 'datesFactory'];

  function FlotillasCtrl($scope, $http, url, $stateParams, $sessionStorage, MESSAGES, SweetAlert, $state, providerService, 
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
    $scope.businessline = [
        {'id':1,'name':'Comercial'},
        {'id':2,'name':'Personal'},
        {'id':0,'name':'Otro'},
    ]
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
          order.acceso_refereciador = perm
          order.acceso_refereciador.permissions.forEach(function(acc){
            if (acc.permission_name == 'Referenciador no obligatorio') {
              if (acc.checked == true) {
                order.acc_referenciador_obligatorio = true
              }else{
                order.acc_referenciador_obligatorio = false
              }
            }
            if (acc.permission_name == 'Ver referenciadores') {
              if (acc.checked == true) {
                order.acceso_ver_ref = true
              }else{
                order.acceso_ver_ref = false
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
      })
    }

    activate();

    function activate(){
      order.acceso_ver_ref = true
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
      $scope.startDate = datesFactory.convertDate(new Date());
      fillProvider();
      $http.get(url.IP + 'usuarios/')
      .then(function(user){        
        user.data.results.forEach(function(vendor1) {
          vendor1.first_name = vendor1.first_name.toUpperCase();
          vendor1.last_name = vendor1.last_name.toUpperCase()
          vendor1.name = vendor1.first_name.toUpperCase() + ' ' + vendor1.last_name.toUpperCase();
        });
        $scope.users = user.data.results;
        $scope.usersLay = user.data.results;
        $scope.checkDate($scope.startDate);
      });

      $http.get(url.IP + 'sucursales-to-show-unpag/')
      .then(function(reesp){
        $scope.sucursalesLay = reesp.data;
      });

      // dataFactory.get('celula_contractor/')
      dataFactory.post('celula_contractor_info/')
      .then(function(response) {
        $scope.celulas = response.data;
        if($localStorage['save_create_flotilla']){
          if($localStorage['save_create_flotilla']['celula']){
            $scope.celulas.forEach(function(item){
              if(item.id == $localStorage['save_create_flotilla']['celula']){
                $scope.celulaSelected = item;
              }
            });
          }
        }
      });

      dataFactory.get('groupingLevel-resume/')
      .then(function(response) {
        $scope.agrupaciones = response.data;
        if($localStorage['save_create_flotilla']){
          if($localStorage['save_create_flotilla']['agrupacion']){
            $scope.agrupaciones.forEach(function(item){
              if(item.id == $localStorage['save_create_flotilla']['agrupacion']['id']){
                $scope.grouping_levelSelected = item;
                $scope.sub_asignaciones = item.subgrupos
              }
            });
          }
        }
      });

      $http.get(url.IP + 'get-vendors/')
      .then(function(user){        
        user.data.forEach(function(vnd) {
          vnd.first_name = vnd.first_name.toUpperCase();
          vnd.last_name = vnd.last_name.toUpperCase()
          vnd.name = vnd.first_name.toUpperCase() + ' ' + vnd.last_name.toUpperCase();
        });
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
      if($localStorage.save_create_flotilla){
        $scope.caratula = $localStorage.save_create_flotilla;
        order.contratante = $localStorage.save_create_flotilla.contratante;
        $scope.aseguradoraSelected = $localStorage.save_create_flotilla.aseguradora;
        $scope.grouping_levelSelected = $localStorage.save_create_flotilla.agrupacion ? $localStorage.save_create_flotilla.agrupacion : {};
        $scope.subgroupingSelected = $localStorage.save_create_flotilla.subagrupacion ? $localStorage.save_create_flotilla.subagrupacion : {};
        
        $scope.sub_subasignaciones = $scope.subgroupingSelected && $scope.subgroupingSelected['subsubgrupos'] ? $scope.subgroupingSelected['subsubgrupos'] : [];
        $scope.subsubgroupingSelected = $localStorage.save_create_flotilla && $localStorage.save_create_flotilla.subsubagrupacion ? $localStorage.save_create_flotilla.subsubagrupacion : {};
        if ($localStorage.save_create_flotilla['referenciadores'] && $localStorage.save_create_flotilla['referenciadores'].length > 0){
          $scope.referenciadorArray = $localStorage.save_create_flotilla['referenciadores'];
          $scope.referenciadorArray = $scope.referenciadorArray.filter(function(item){
            if (item.referenciador){
              return true;
            } else {
              return false;
            }
          })
        }
        
        if($scope.aseguradoraSelected){
          $http.get(url.IP + 'claves-by-provider/' + $scope.caratula.aseguradora.id)
          .then(
            function success (clavesResponse){
              $scope.claves = clavesResponse.data;
              if($localStorage.save_create_flotilla){
                $scope.claves.forEach(function(item){
                  if (item.id == $localStorage.save_create_flotilla.clave){
                    $scope.claveSelected = item;
                  }
                });
              }
              if($scope.claves.length == 1){
                $scope.caratula.clave = $scope.claves[0].id;
                $scope.claveSelected = $scope.claves[0];
              }
            }
          ).catch(function(error) {
            console.log('Error - claves-by-provider - catch', error);
          });

          $http.get(url.IP + 'ramos-by-provider/' + $scope.caratula.aseguradora.id)
          .then(
            function success(response){
              $scope.ramos = response.data;
            },
            function error(e){
              console.log('Error - ramos-by-provider', e);
            })
          .catch(function(error){
            console.log('Error - ramos-by-provider - catch', error);
          });
        }

        $scope.ramoSelected = $localStorage.save_create_flotilla.ramo;
        if($scope.ramoSelected){
          $scope.subramos = $scope.ramoSelected.subramo_ramo;
        }
        $scope.subramoSelected = $localStorage.save_create_flotilla.subramo;
        if($localStorage['save_create_flotilla']['type_policy']){
          $scope.types.forEach(function(item){
            if(item.value == $localStorage['save_create_flotilla']['type_policy']['value']){
              $scope.typeSelected = item;
            }
          });
        }
        $scope.currencySelected = $localStorage.save_create_flotilla.f_currency;
        $scope.lineaSelected = $localStorage.save_create_flotilla.business_line;
        $scope.responsableSelected = $localStorage.save_create_flotilla.responsable;
        if($localStorage['save_create_flotilla']['is_renewable']){
          $scope.renewals.forEach(function(item){
            if(item.value == $localStorage['save_create_flotilla']['is_renewable']){
              $scope.renewalSelected = item;
            }
          });
        }
         $scope.grouping_levelSelected = $localStorage.save_create_flotilla.groupinglevel ? $localStorage.save_create_flotilla.groupinglevel : $localStorage.save_create_flotilla.agrupacion ? $localStorage.save_create_flotilla.agrupacion : '';
        $scope.ejecutivoCobranzaSelected = $localStorage.save_create_flotilla.collection_executive;
      }
    };

    if ('save_create_flotilla' in $localStorage){
    }else{
      $localStorage['save_create_flotilla'] = {};
    }

    $scope.save_info_tab = function(){
      $localStorage.save_create_flotilla = angular.copy($scope.caratula);
      $localStorage.save_create_flotilla.contratante = order.contratante;
      $localStorage.save_create_flotilla.address = $scope.addressSelected;
      $localStorage.save_create_flotilla.grouping_levelSelected = $scope.grouping_levelSelected
      $localStorage.save_create_flotilla['referenciadores'] = $scope.referenciadorArray;

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

    $scope.changeComRef = function(param, index, com){
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
        // if(order.contratante.value.address_natural || order.contratante.value.address_juridical){
        //   if(order.contratante.value.address_natural){
        //     $scope.caratula.natural = order.contratante.value.id;
        //     $scope.caratula.juridical = null;
        //     $scope.addresses = order.contratante.value.address_natural;
        //   }else{
        //     $scope.caratula.natural = null;
        //     $scope.caratula.juridical = order.contratante.value.id;
        //     $scope.addresses = order.contratante.value.address_juridical;
        //   }
        //   if($scope.addresses.length == 1){
        //     $scope.addressSelected = $scope.addresses[0];
        //     $scope.caratula.address = $scope.addresses[0].id;
        //   }
        // }
        if(order.contratante.value.address_contractor){
          if(order.contratante.value.address_contractor){
            $scope.caratula.contractor = order.contratante.value.id;
            $scope.addresses = order.contratante.value.address_contractor;
          }
          if($scope.addresses.length == 1){
            $scope.addressSelected = $scope.addresses[0];
            $scope.caratula.address = $scope.addresses[0].id;
          }
        }

        if(order.contratante.value.cellule){
          $scope.celulas.forEach(function(item){
            if(String(item.url) == String(order.contratante.value.cellule.url ? order.contratante.value.cellule.url : order.contratante.value.cellule)){
              $scope.celulaSelected = item;
              $scope.changeCelula($scope.celulaSelected);
            }
          });
        }
        $scope.info_sub = order.contratante.value;
        if(order.contratante.value.groupinglevel){
          // $scope.agrupaciones.forEach(function(item){
          //   if(String(item.url) == (order.contratante.value.groupinglevel.url ? String(order.contratante.value.groupinglevel.url) : String(order.contratante.value.groupinglevel))){
          //     $scope.grouping_levelSelected = item;
          //     $scope.changeAgrupacion($scope.grouping_levelSelected);
          //   }
          // });
          // $http.get(order.contratante.value.groupinglevel.url ? order.contratante.value.groupinglevel.url : order.contratante.value.groupinglevel)
          // .then(function success(respons) {
          //   if(respons.data.type_grouping == 3){
          //     $scope.subsubgroupingSelected = respons.data;
          //     $http.get(respons.data.parent)
          //     .then(function success(respon) {
          //       $scope.subgroupingSelected = respon.data;
          //       $http.get(respon.data.parent)
          //       .then(function success(respo) {
          //         $scope.grouping_levelSelected = respo.data;
          //         $scope.changeAgrupacion(respo.data);
          //       });
          //     });
          //   }else if(respons.data.type_grouping == 2){
          //     $scope.subgroupingSelected = respons.data;
          //     $http.get(respons.data.parent)
          //     .then(function success(respon) {
          //       $scope.grouping_levelSelected = respon.data;
          //       $scope.changeAgrupacion(respon.data);
          //     });
          //   }else if(respons.data.type_grouping == 1){
          //     $scope.grouping_levelSelected = respons.data;
          //     $scope.changeAgrupacion(respons.data);
          //   }
          // });
          if(order.contratante.value.groupinglevel){
            $http.get(order.contratante.value.groupinglevel.url ? order.contratante.value.groupinglevel.url : order.contratante.value.groupinglevel)
            .then(function success(respons) {
              if(respons.data.type_grouping == 3){
                $scope.caratula.groupinglevel = respons.data.id;
                order.grouping_level = respons.data;
                $scope.info_sub.subsubgrouping = respons.data;
                $scope.subsubgroupingSelected = respons.data;
                $http.get(respons.data.parent)
                .then(function success(respon) {
                  $scope.info_sub.subgrouping = respon.data;
                  $scope.subgroupingSelected = respon.data;
                  $http.get(respon.data.parent)
                  .then(function success(respo) {
                    order.grouping_level = respo.data;
                    $scope.grouping_levelSelected = respo.data;
                    $scope.changeAgrupacion(respo.data);
                  });
                  order.subgrouping == respon.data;
                });
                order.subsubgrouping == respons.data;
              }else if(respons.data.type_grouping == 2){
                $scope.info_sub.subgrouping = respons.data;
                $scope.subgroupingSelected = respons.data;
                $http.get(respons.data.parent)
                .then(function success(respon) {
                  order.grouping_level = respon.data;
                  $scope.grouping_levelSelected = respon.data;
                  $scope.changeAgrupacion(respon.data);
                });
                order.subgrouping == respons.data;
              }else if(respons.data.type_grouping == 1){
                order.grouping_level = respons.data;
                $scope.grouping_levelSelected = respons.data;
                $scope.changeAgrupacion(respons.data);
              }
            });
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
        // if(order.searchContratante.value.address_natural || order.searchContratante.value.address_juridical){
        //   $scope.contractorLayout.id = order.searchContratante.value.id;
        //   $scope.contractorLayout.name = order.searchContratante.val;
        //   $scope.contractorLayout.contractor = order.searchContratante.value;
        //   if(order.searchContratante.value.address_natural){
        //     $scope.contractorLayout.type = 1;
        //     $scope.contractorLayout.address = order.searchContratante.value.address_natural;
        //   }else{
        //     $scope.contractorLayout.type = 2;
        //     $scope.contractorLayout.address = order.searchContratante.value.address_juridical;
        //   }
        // }
      }
    });

    $scope.paqueteAll = function(paq){
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
    
    $scope.getClaves = function(param){
      $scope.caratula.aseguradora = param;
      $scope.aseguradoraSelected = param;
      $scope.ramoSelected=null;
      $scope.subramoSelected=null;
      $scope.caratula.ramo=null;
      $scope.caratula.subramo=null;
      if ($localStorage.save_create_flotilla){
        $localStorage.save_create_flotilla['aseguradora'] = param;
      }
      $http.get(url.IP + 'claves-by-provider/' + $scope.caratula.aseguradora.id)
      .then(
        function success (clavesResponse){
          $scope.claves = clavesResponse.data;
          if($scope.claves.length == 1){
            $scope.caratula.clave = $scope.claves[0].id;
            $scope.claveSelected = $scope.claves[0];
          }
        }
      ).catch(function(error) {
        console.log('Error - claves-by-provider - catch', error);
      });

      $http.get(url.IP + 'ramos-by-provider/' + $scope.caratula.aseguradora.id)
      .then(
        function success(response){
          $scope.ramos = response.data;
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
    $scope.changeSensible = function(sensible, index) {
      uploader.queue[index].formData[0].sensible = sensible;
    }
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
        if(localStorage.save_create_flotilla){
          localStorage.save_create_flotilla['ramo'] = param;
        }
      }
    };

    $scope.changeSubramo = function(param){
      if(param){
        $scope.caratula.subramo = param;
        $scope.subramoSelected = param;
        $scope.layout.subramo = param;
        $localStorage.save_create_flotilla.subramo = param;
        $scope.paqueteAll(param);
      }
    };

    $scope.changeBline = function(param){
      $scope.caratula.business_line = param;
      $localStorage.save_create_flotilla.business_line = param;
    };

    $scope.changeType = function(param){
      $scope.caratula.type = param;
      $localStorage.save_create_flotilla.type_policy = param;
    };

    $scope.changeResponsableLay = function(param){
      $scope.responsableLay = param;
      $localStorage.save_create_flotilla.responsableLay = param;
    };

    $scope.changeSucursalLay = function(param){
      $scope.sucursalLay = param;
      $localStorage.save_create_flotilla.sucursal = param;
    };

    $scope.changeCurrency = function(param){
      $scope.caratula.f_currency = param;
      $localStorage.save_create_flotilla.f_currency = param;
    };

    $scope.changeRenewal = function(param){
      $scope.caratula.is_renewable = param.value;
      $localStorage.save_create_flotilla.is_renewable = param;
    };

    $scope.changeCelula = function(param){
      $scope.caratula.celula = param.id;
      $localStorage.save_create_flotilla.celula = param;
    };

    $scope.changeAgrupacion = function(data){
      $localStorage.save_create_flotilla['agrupacion'] = data;
      $scope.sub_asignaciones = data.subgrupos;
      $scope.caratula.groupinglevel = data.id;
      if($scope.info_sub.subgrouping){
        $scope.sub_asignaciones.forEach(function(item){
          if(parseInt(item.id) == parseInt($scope.info_sub.subgrouping.id)){
            $scope.subgroupingSelected = item;
            $scope.changeSubagrupacion(item);
          }
        });
      }
      if($localStorage['save_create_flotilla']){
        if($localStorage['save_create_flotilla']['subagrupacion']){
          $scope.agrupaciones.forEach(function(item){
            if(item.id == $localStorage['save_create_flotilla']['subagrupacion']['id']){
              $scope.subgroupingSelected = item;
              $scope.sub_subasignaciones = item.subsubgrupos
               $scope.changeSubagrupacion($scope.subgroupingSelected);
            }
          });
        }
      }
    };

    $scope.changeSubagrupacion = function(data){
      if (data) {
        $localStorage.save_create_flotilla['subagrupacion'] = data;
        if(data.subsubgrupos){
          $scope.sub_subasignaciones = data.subsubgrupos;
          $scope.caratula.groupinglevel = data.id;
          if($scope.info_sub.subsubgrouping){
            $scope.sub_subasignaciones.forEach(function(item){
            if(parseInt(item.id) == parseInt($scope.info_sub.subsubgrouping.id)){
              $scope.subsubgroupingSelected = item;
              
              $scope.caratula.groupinglevel = item.id;
            }
          });
          }
        }else{
          $scope.sub_subasignaciones =[]          
        }
      }else{
        $scope.sub_subasignaciones =[]
      }
    };

    $scope.changeSubsubagrupacion = function(data){
      $localStorage.save_create_flotilla['subsubagrupacion'] = data;
      if (data) {
        $scope.caratula.groupinglevel = data.id;       
      }else{
        console.log('--data',data)
      }
    };

    $scope.changeEjecutivoCobranza = function(param){
      $scope.caratula.collection_executive = param;
      $localStorage.save_create_flotilla.collection_executive = param;
    };

    $scope.changeResponsable = function(param){
      $scope.caratula.responsable = param;
      $localStorage.save_create_flotilla.responsable = param;
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

    function isString(x) {
      return Object.prototype.toString.call(x) === "[object String]"
    }

    $scope.validityInsurance = function(){      
      var lb = Ladda.create( document.querySelector( '.ladda-button' ) );
      lb.start();
      $scope.referenciadores_copy =  $scope.referenciadorArray.filter(function(item){
        return item && item.referenciador && isString(item.referenciador);
      })
      
      if(!order.acc_referenciador_obligatorio && $scope.referenciadores_copy.length <= 0){
        SweetAlert.swal("Error", "Seleccione al menos un referenciador", "error");
        lb.stop();
        return;
      }

      // SweetAlert.swal("Succes", "Si pasa", "success");
      // lb.stop();
      // return;


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
      var lb = Ladda.create( document.querySelector( '.ladda-button' ) );
      lb.start();
      $scope.caratula.business_line = $scope.lineaSelected ? $scope.lineaSelected.id : 1;
      $scope.caratula.aseguradora = $scope.aseguradoraSelected ? $scope.aseguradoraSelected.id : $scope.caratula.aseguradora.id;
      $scope.caratula.ramo = $scope.ramoSelected ? $scope.ramoSelected.id : $scope.caratula.ramo.id;
      $scope.caratula.subramo = $scope.subramoSelected ? $scope.subramoSelected.id : $scope.caratula.subramo.id;
      $scope.caratula.type_policy = $scope.caratula.type ? $scope.caratula.type.value : $scope.typeSelected ? $scope.typeSelected.value : 1;
      $scope.caratula.f_currency = $scope.caratula.f_currency ? $scope.caratula.f_currency : $scope.currencySelected ? $scope.currencySelected : 1;
      $scope.caratula.is_renewable = $scope.caratula.is_renewable ? $scope.caratula.is_renewable : $scope.renewalSelected ? $scope.renewalSelected.value : null;
      $scope.caratula.responsable = $scope.caratula.responsable ? $scope.caratula.responsable : null;
      $scope.caratula.document_type = 11;
      $scope.caratula.status = 14;
      if ($scope.caratula.celula && typeof($scope.caratula.celula) === 'object') {
        $scope.caratula.celula= $scope.caratula.celula.id || null;
      } else {
          $scope.caratula.celula = $scope.caratula.celula;
      }
      $scope.caratula.celula = $scope.caratula.celula ? $scope.caratula.celula : null;
      $scope.caratula.groupinglevel = $scope.caratula.groupinglevel ? $scope.caratula.groupinglevel : null;

      $scope.referenciadoresSelected = [];
      $scope.referenciadorArray.forEach(function(item){
        if(item.referenciador != '' && item.referenciador !=null){
          if(item.comision_vendedor == ''){
            item.comision_vendedor = 0;
          }
          $scope.referenciadoresSelected.push(item);
        }else{
          $scope.referenciadorArray.splice(item, 1);
        }
      });
      $scope.contractorToSave = {};

      if(order.contratante.value.email || order.contratante.value.phone_number){
        if(order.contratante.value.phone_number){
          $scope.contractorToSave.phone_number = order.contratante.value.phone_number;
        } 
        if(order.contratante.value.email){
          $scope.contractorToSave.email = order.contratante.value.email
        }
      }
      $http.patch(order.contratante.value.url, $scope.contractorToSave).then(function(data){

      });
      $scope.caratula.ref_policy = $scope.referenciadoresSelected;
      if($rootScope.from_task && $rootScope.task_associated && $rootScope.task_associated.url){
        $scope.caratula.from_task=$rootScope.from_task
        $scope.caratula.task_associated=$rootScope.task_associated.id
      }
      $http.post(url.IP + 'colectividades_polizas/', $scope.caratula)
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          if($rootScope.from_task && $rootScope.task_associated && $rootScope.task_associated.url){
            $http.patch($rootScope.task_associated.url,{'ot_model':1, 'ot_id_reference':response.data.id});
          }
          lb.stop();
          $scope.dataCaratula = response.data;
          $scope.paqueteAll($scope.caratula)
          $scope.showCar = true;
          $scope.showPol = false;
          SweetAlert.swal("¡Listo!", "Carátula creada exitosamente.", "success");
          $localStorage['save_create_flotilla'] = {};
          $state.go('flotillas.info', {polizaId: $scope.dataCaratula.id});
        }else{
          lb.stop();
          SweetAlert.swal("Error", response.data, "error");
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
              // if(!item.COLOR){
              //   SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna COLOR, corrige el error y vuelve a subir el excel.', 'error');
              //   flagCertificate = true;
              // }
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
              }
              if(!item.PORCENTAJE_COMISION){
                SweetAlert.swal('Error', 'Esta vacía la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna PORCENTAJE_COMISION, corrige el error y vuelve a subir el excel.', 'error');
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
                var receipt = {
                  comision: item.COMISION_RECIBO,
                  delivered: false,
                  derecho: item.DERECHO_RECIBO,
                  fecha_fin: item.FIN_RECIBO,
                  fecha_inicio: item.INICIO_RECIBO,
                  iva: item.IVA_RECIBO,
                  prima_neta: item.PRIMA_RECIBO,
                  prima_total: item.TOTAL_RECIBO,
                  recibo_numero: item.NO_RECIBO,
                  rpf: item.RPF_RECIBO,
                  sub_total: item.SUBTOTAL_RECIBO,
                  vencimiento: item.VENCIMIENTO_RECIBO,
                  poliza: item.NO_POLIZA,
                  receipt_type: 1
                };
                $scope.allReceipts.push(receipt);
              }
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
            item.ANIO = item.AÑO;
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
                email: item.CORREO ? item.CORREO : '', 
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
                beneficiary_address: item.BENEFICIARIO_DIRECCION ? item.BENEFICIARIO_DIRECCION : null,
              }
            ];

            $scope.allReceipts.forEach(function(receipt, index){
              if(receipt.prima_neta && receipt.rpf && receipt.derecho){
                if(receipt.poliza == item.NO_POLIZA){
                  if((receipt.fecha_inicio).toString().length > 10){
                    receipt.fecha_inicio = datesFactory.convertDate(receipt.fecha_inicio);
                  }
                  receipt.fecha_inicio = datesFactory.toDate(receipt.fecha_inicio);

                  if((receipt.fecha_fin).toString().length > 10){
                    receipt.fecha_fin = datesFactory.convertDate(receipt.fecha_fin);
                  }
                  receipt.fecha_fin = datesFactory.toDate(receipt.fecha_fin);
                  if((receipt.vencimiento).toString().length > 10){
                    receipt.vencimiento = datesFactory.convertDate(receipt.vencimiento);
                  }
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
            if (item.TIPO_CONTRATANTE) {
              $scope.contractorP = item.CONTRATANTE
            }
            // if (parseInt(item.TIPO_CONTRATANTE) ==1) {
            //   $scope.naturalP = item.CONTRATANTE
            //   $scope.juridicalP = null
            // }else if (parseInt(item.TIPO_CONTRATANTE) ==2) {
            //   $scope.naturalP = null
            //   $scope.juridicalP = item.CONTRATANTE
            // }

            var certificateData = {
              accidents_policy: [],
              address: parseInt(item.DIRECCION),
              aseguradora: $scope.dataCaratula.aseguradora,
              automobiles_policy: dataCar,
              business_line: $scope.dataCaratula.business_line,
              responsable: $scope.dataCaratula.responsable,
              caratula: $scope.dataCaratula.id,
              celula: $scope.dataCaratula.celula,
              clave: $scope.dataCaratula.clave,
              coverageInPolicy_policy: [],
              damages_policy: [],
              document_type: 12,
              end_of_validity: datesFactory.toDate(item.VIGENCIA_FIN),
              endorsement: false,
              collection_executive: $scope.caratula.collection_executive,
              f_currency: parseInt(item.MONEDA),
              folio: item.FOLIO ? item.FOLIO : '',
              forma_de_pago: parseInt(item.FRECUENCIA_PAGO),
              groupinglevel: $scope.caratula.groupinglevel,
              identifier: item.MARCA + '_' + item.MODELO + '_' + item.AÑO,
              internal_number: null,
              is_renewable: item.RENOVABLE ? item.RENOVABLE : null,
              life_policy: [],
              // natural: parseInt($scope.naturalP),
              // juridical: parseInt($scope.juridicalP),
              contractor: parseInt($scope.contractorP),
              old_policies: [],
              paquete: parseInt(item.PAQUETE),
              parent: $scope.dataCaratula.url,
              // poliza: $scope.obj_poliza,
              poliza_number: item.NO_POLIZA,
              ramo: $scope.dataCaratula.ramo,
              recibos_poliza: $scope.recibosIndividuales,
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
              conducto_de_pago : item.CONDUCTO_DE_PAGO
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