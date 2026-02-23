/* global angular */
(function() {
  'use strict';

  angular.module('inspinia')
    .controller('FlotillasEditCtrl', FlotillasEditCtrl);
  FlotillasEditCtrl.$inject = ['$uibModal', '$sessionStorage','$scope', '$state', '$stateParams', '$http', 'url', 'SweetAlert', 
                                'MESSAGES', 'FileUploader','$timeout', '$parse', 'dataFactory', '$rootScope', 'datesFactory', 'generalService',
                                '$sce','providerService','$localStorage'];

  function FlotillasEditCtrl($uibModal, $sessionStorage, $scope, $state, $stateParams, $http, url, SweetAlert, MESSAGES, FileUploader, 
                              $timeout, $parse, dataFactory, $rootScope, datesFactory, generalService, $sce, providerService, $localStorage){

    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);

    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);

    var order = this;
    $rootScope.show_contractor = false;
    $scope.showOt = true;
    $scope.show_caratula = true;
    $scope.show_certificado = false;
    $scope.okFile = 0;
    $scope.countFile = 0;
    $scope.incompleteOT = {
      complete: true,
      caratule: [],
      subgroups: [],
      packages: [],
      certificates: []
    };
    $scope.renewals = [
      {'value':1, 'label':'Renovable'},
      {'value':2, 'label':'No Renovable'}
    ];
    $scope.currencys = [
      {'value':1, 'label':'Pesos'},
      {'value':2, 'label':'Dólares'},
      {'value':3, 'label':'UDI'},
      {'value':4, 'label':'Euros'}
    ];
    $scope.frequencies = [
      {'value':7, 'label':'Semanal'},
      {'value':14, 'label':'Catorcenal'},
      // {'value':24, 'label':'Quincenal'},
      {'value':1, 'label':'Mensual'},
      {'value':2, 'label':'Bimestral'},
      {'value':3, 'label':'Trimestral'},
      {'value':6, 'label':'Semestral'},
      {'value':12, 'label':'Anual'},
      {'value':5, 'label':'Contado'},
    ];
    $scope.businessline = [
        {'id':1,'name':'Comercial'},
        {'id':2,'name':'Personal'},
        {'id':0,'name':'Otro'},
    ]
    $scope.referenciadores = [];
    $scope.referenciadorArray = [];
    $scope.referenciadoresSelected = [];
    $scope.directiveReceipts = {};
    $scope.types = [
      {'value':1, 'label':'Abierta'},
      {'value':2, 'label':'Cerrada'}
    ];
    activate();

    $scope.show_section = function(value){
      switch(value){
        case 1:
          $scope.show_caratula = true;
          $scope.show_subgrupo = false;
          $scope.show_paquete = false;
          $scope.show_certificado = false;
          break;
        case 2:
          $scope.show_caratula = false;
          $scope.show_certificado = true;
          break;
        default:
          $scope.show_caratula = true;
          $scope.show_certificado = false;
      }
    };

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
          if($localStorage.save_edition_flotilla){
            if($localStorage.save_edition_flotilla.id == response.data.id){
              $scope.caratula = $localStorage.save_edition_flotilla;
            }else{
              $scope.caratula = response.data
            }
          }else{
            $scope.caratula = response.data;
          }
          $scope.originalCaratula = angular.copy(response.data);
          $scope.startDate = convertDate(response.data.start_of_validity);
          $scope.endDate = convertDate(response.data.end_of_validity);
          fillProvider();
          $scope.currencys.forEach(function(item1){
            if(item1.value == $scope.caratula.f_currency){
              $scope.currencySelected = item1.value;
              $scope.caratula.f_currency = item1.value;
            }
          });
          $scope.businessline.forEach(function(item){
            if(item.id == $scope.caratula.business_line){
              $scope.lineaSelected = item;
              $scope.caratula.business_line = item;
            }
          });
          $scope.types.forEach(function(item){
            if ($scope.caratula.type_policy){
              if(item.value == $scope.caratula.type_policy){
                $scope.typeSelected = item;
                // $scope.caratula.type_policy = item.value;
              }
            }
          });
          if($scope.caratula.is_renewable == 1){
            $scope.renewalSelected = $scope.renewals[0];
          }else{
            $scope.renewalSelected = $scope.renewals[1];
          }
          order.contratante = {};  
          $scope.aseguradoraSelected = $scope.caratula.aseguradora;

          $http({
            method: 'POST',
            url: url.IP + 'get_caratula_polizas/',
            data:{
              status: 0,
              caratula: $scope.caratula.id,
              parent: 0
            }
          })
          .then(function success(response1){
            if (response1.status == 200) {
              $scope.allCerificatesCaratula = response1.data.certificates;
            }
          })
          .catch(function(e){
            console.log('error', e);
          });

          if ($scope.caratula.contractor.id) {
            var idC = $scope.caratula.contractor.id;
          } else {
            var idC =  $scope.caratula.contractor;
          }
          // $http({method: 'GET', url: url_aux})
          $http.get(url.IP+'contractors-resume-medium/'+idC+'/')
          .then(function success(response) {
            $scope.contratante = response.data;
            if ($scope.caratula.contractor) {
              $scope.addresses = $scope.contratante.address_contractor;
              if ($scope.contratante && $scope.contratante.address_contractor) {
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

          $http.get(url.IP + 'polizas/'+ $scope.caratula.id + '/archivos/')
          .then(function(response) {
            $scope.filesCover = response.data.results;
          })
          .catch(function (e) {
            console.log('error', e);
          });
          // Referenciadores
          $http.get(url.IP + 'get-vendors/')
          .then(function(user){
            user.data.forEach(function(item){   
              item.first_name = item.first_name.toUpperCase();
              item.last_name = item.last_name.toUpperCase()
              item.name = item.first_name.toUpperCase() + ' ' + item.last_name.toUpperCase();
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

          $http.get(url.IP + 'usuarios/')
          .then(function(user){
            user.data.results.forEach(function(item){   
              item.first_name = item.first_name.toUpperCase();
              item.last_name = item.last_name.toUpperCase()
              item.name = item.first_name.toUpperCase() + ' ' + item.last_name.toUpperCase();
            });
            $scope.users = user.data.results;
            if($scope.caratula.responsable){
              $scope.users.forEach(function(item){   
                item.first_name = item.first_name.toUpperCase();
                item.last_name = item.last_name.toUpperCase()
                item.name = item.first_name.toUpperCase() + ' ' + item.last_name.toUpperCase();
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
              $scope.sucursales = response.data;
              if($scope.caratula.sucursal){
                $scope.sucursales.forEach(function(item){
                  if(item.id == $scope.caratula.sucursal.id){
                    $scope.sucursalSelected = item;
                  }
                });
              }
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

          $scope.paymentSelected = $scope.caratula.forma_de_pago;

          if($scope.caratula.celula){
            $http.get($scope.caratula.celula)
            .then(function(response) {
              $scope.celulaSelected = response.data;
              $scope.changeCelula($scope.celulaSelected);
            });
          }

          $scope.info_sub = $scope.caratula;
          if($scope.caratula.grouping_level){
            $http.get(url.IP + 'groupinglevel/' + $scope.caratula.grouping_level.id)
            .then(function(response) {
              $scope.grouping_levelSelected = response.data;
              $scope.info_sub = $scope.caratula;
              $scope.changeAgrupacion($scope.grouping_levelSelected);
            });
          }

          if($localStorage.save_edition_flotilla){
            if($localStorage.save_edition_flotilla['id'] == $scope.caratula.id){
              $scope.caratula.poliza_number = $localStorage.save_edition_flotilla && $localStorage.save_edition_flotilla['poliza_number'] ? $localStorage.save_edition_flotilla['poliza_number'] : '';
              $scope.caratula.identifier = $localStorage.save_edition_flotilla && $localStorage.save_edition_flotilla['identifier'] ? $localStorage.save_edition_flotilla['identifier'] : '';
            }
          }
        }
      })
      .catch(function (e) {
        console.log('error', e);
      });  
      order.accesos = $sessionStorage.permisos
      if (order.accesos) {
        order.accesos.forEach(function(perm){          
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
    };

    $scope.save_info_tab = function(){
      $localStorage.save_edition_flotilla = angular.copy($scope.caratula);
    }

    $scope.changeCelula = function(param){
      $scope.caratula.celula = param.url;
      try{
        $localStorage.save_edition_flotilla['celula'] = param.url;
      } catch(err){}
    };

    $scope.changeAgrupacion = function(data){
      $scope.subgroupingSelected = {}
      $scope.subsubgroupingSelected = {}
      $scope.sub_asignaciones = data.subgrupos;
      $scope.grouping_levelSelected = data;
      if($scope.info_sub.subgrouping_level){
        $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subgrouping_level.id)
        .then(function(response) {
          $scope.subgroupingSelected = response.data;
          if ($scope.subgroupingSelected.parent != data.url) {
            $scope.subgroupingSelected = {}
          }
          $scope.sub_asignaciones.forEach(function(item){
            if(item.id == $scope.subgroupingSelected.id){
              $scope.subgroupingSelected = item
              $scope.changeSubagrupacion(item);
            }
          });
        });
      }
    };

    $scope.changeSubagrupacion = function(data){
      $scope.subsubgroupingSelected = {}
      if(data.subsubgrupos){
        $scope.sub_subasignaciones = data.subsubgrupos;
        $scope.subgroupingSelected = data;
        if($scope.info_sub.subsubgrouping_level){
          $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subsubgrouping_level.id)
          .then(function(response) {
            $scope.subsubgroupingSelected = response.data;
            if ($scope.subsubgroupingSelected.parent != data.url) {
              $scope.subsubgroupingSelected = {}
            }
            $scope.sub_asignaciones.forEach(function(item){
              if(item.id == $scope.subsubgroupingSelected.id){
                $scope.subsubgroupingSelected = item
                $scope.changeSubsubagrupacion(item);
              }
            });
          });
        }
      }
    };

    $scope.changeSubsubagrupacion = function(data){
      $scope.subsubgroupingSelected = data;
    };
    $scope.changeAgrupacion2 = function(data){
      $scope.grouping_levelSelected = data
      $scope.subgroupingSelected = ''
      $scope.subsubgroupingSelected = ''
      $scope.sub_asignaciones = data.subgrupos;
      $scope.sub_subasignaciones = [];
      if($scope.info_sub.subgrouping_level){
        $scope.sub_asignaciones.forEach(function(item){
          if(item.id == $scope.info_sub.subgrouping_level.id){
            $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subgrouping_level.id)
            .then(function(response) {
              $scope.subgroupingSelected = response.data;
              $scope.changeSubagrupacion2(item);
            });
          }
        });
      }
    }

    $scope.changeSubagrupacion2 = function(data){
      if(data.subsubgrupos){
        $scope.sub_subasignaciones = data.subsubgrupos;
        if($scope.info_sub.subsubgrouping_level){
          $scope.sub_subasignaciones.forEach(function(item){
            if(item.id == $scope.info_sub.subsubgrouping_level.id){
              $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subsubgrouping_level.id)
              .then(function(response) {
                $scope.subsubgroupingSelected = response.data;
              });
            }
          });
        }
      }
    }
    $scope.changeEjecutivoCobranza = function(param){
      $scope.users.forEach(function(item){
        if(item.id == param){
          $scope.caratula.collection_executive = item;
          $localStorage.save_edition_flotilla['collection_executive'] = item;
        }
      });
    };
    $scope.changeBline = function(param){
      $scope.caratula.business_line = param;
      $localStorage.save_edition_flotilla['business_line'] = param;
    };
    // Save Edicition
    $scope.validityInsurance = function(){
      if(!$scope.aseguradoraSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.PROVIDERREQUIRED, "error");
        return;
      }
      if(!$scope.caratula.poliza_number){
        SweetAlert.swal("Error", MESSAGES.ERROR.POLICYNOREQUIRED, "error");
        return;
      }
      if(!$scope.caratula.identifier){
        SweetAlert.swal("Error", MESSAGES.ERROR.IDENTIFIERREQUIRED, "error");
        return;
      }
      if(!order.contratante.val){
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORCONTRACTOR, "error");
        return;
      }
      if(!$scope.caratula.address){
        SweetAlert.swal("Error", MESSAGES.ERROR.ADDRESS, "error");
        return;
      }
      if(!$scope.caratula.clave){
        SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
        return;
      }
      if(!$scope.ramoSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
        return;
      }
      if(!$scope.subramoSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
        return;
      }
      $scope.saveInsurance();
    };

    $scope.saveInsurance = function(){
      if ($scope.subsubgroupingSelected && $scope.subsubgroupingSelected.url) {
        $scope.gLevel = $scope.subsubgroupingSelected.url
      }else if($scope.subgroupingSelected && $scope.subgroupingSelected.url){
        $scope.gLevel = $scope.subgroupingSelected.url;
      }else if ($scope.grouping_levelSelected ) {
        $scope.gLevel = $scope.grouping_levelSelected.url;        
      }
      $scope.caratulaEdit = {};
      $scope.caratulaEdit.ref_policy = [];
      $scope.caratulaEdit.aseguradora = $scope.aseguradoraSelected.url;
      $scope.caratulaEdit.clave = $scope.claveSelected ? $scope.claveSelected.url : null;
      $scope.caratulaEdit.ramo = $scope.ramoSelected.url;
      $scope.caratulaEdit.subramo = $scope.subramoSelected.url;
      $scope.caratulaEdit.business_line = $scope.caratula.business_line ? $scope.caratula.business_line.id : 1;
      $scope.caratulaEdit.type_policy = $scope.caratula.type ? $scope.caratula.type.value : $scope.typeSelected.value;
      $scope.caratulaEdit.f_currency = $scope.caratula.f_currency;
      $scope.caratulaEdit.is_renewable = $scope.caratula.is_renewable ? $scope.caratula.is_renewable : null;
      $scope.caratulaEdit.responsable = $scope.caratula.responsable ? $scope.caratula.responsable.url : null;
      $scope.caratulaEdit.collection_executive = $scope.caratula.collection_executive ? $scope.caratula.collection_executive.url : null;
      $scope.caratulaEdit.address = $scope.addressSelected ? $scope.addressSelected.url : null;
      $scope.caratulaEdit.document_type = 11;
      $scope.caratulaEdit.status = $scope.caratula.status
      $scope.caratulaEdit.poliza_number = $scope.caratula.poliza_number
      $scope.caratulaEdit.identifier = $scope.caratula.identifier
      $scope.caratulaEdit.contractor = $scope.caratula.contractor ? $scope.caratula.contractor.url : null;
      $scope.caratulaEdit.start_of_validity = $scope.caratula.start_of_validity;
      $scope.caratulaEdit.end_of_validity = $scope.caratula.end_of_validity;
      $scope.caratulaEdit.celula = $scope.caratula.celula ? $scope.caratula.celula : ''
      $scope.caratulaEdit.groupinglevel = $scope.gLevel ? $scope.gLevel : null
      $scope.referenciadoresSelected = [];
      $scope.valorReferenciadores=[]
      $scope.referenciadorArray.forEach(function(item){
        if(item.referenciador !=''){
          var ref_to_send = {
            "referenciador": item.referenciador,
            "comision_vendedor": 100,
          }     
          var ref_to_send2 = {
            "referenciador": item.referenciador,
            "comision_vendedor": 100,
            "ref_name":item.ref_name
          }     
          if(item.comision_vendedor == ''){
            ref_to_send.comision_vendedor = 0;
          }else{
            ref_to_send.comision_vendedor = item.comision_vendedor ? parseFloat(item.comision_vendedor).toFixed(2) : 0;
          }
          $scope.referenciadoresSelected.push(ref_to_send);
          $scope.valorReferenciadores.push(ref_to_send2);
        }
      });

      // $scope.referenciadorArray.forEach(function(referenciador){
      //   var ref = {
      //       "referenciador": referenciador.referenciador,
      //       "comision_vendedor": referenciador.comision_vendedor ? referenciador.comision_vendedor : 100,
      //   }
      //   $scope.caratulaEdit.ref_policy.push(ref);
      // });
      $scope.contractorToSave = {};

      if($scope.caratula.contractor.email){
        $scope.contractorToSave.email = $scope.caratula.contractor.email;
      }else{
        $scope.contractorToSave.email = '';
      }
      if($scope.caratula.contractor.phone_number){
        $scope.contractorToSave.phone_number = $scope.caratula.contractor.phone_number
      }else{
        $scope.contractorToSave.phone_number = ''
      }
      $http.patch($scope.caratula.contractor.url,$scope.contractorToSave)
        .then(function(data) {
          if(data.status == 200 || data.status == 201){
          }
      });
      $scope.caratulaEdit.ref_policy = $scope.referenciadoresSelected;
      $http.patch($scope.caratula.url, $scope.caratulaEdit)
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          $localStorage.save_edition_flotilla={}
          $scope.dataCaratula = response.data;
          try{
            if($scope.dataCaratula.ref_policy.length == $scope.originalCaratula.ref_policy.length){
              for(var j=0; j<$scope.originalCaratula.ref_policy.length; j++){
                var refurl=$scope.originalCaratula.ref_policy[j].referenciador;
                var refurl2=$scope.referenciadoresSelected[j];
                if(refurl !=$scope.referenciadoresSelected[j].referenciador){
                  $http.get(refurl)
                  .then(function success (nameRef){
                    $scope.nombreReferenciador=nameRef.data;
                    $http.get(refurl2.referenciador)
                    .then(function success (nameRef2){
                      $scope.nombreReferenciador2=nameRef2.data;
                      var params = {
                        'model': 18,
                        'event': "PATCH",
                        'associated_id': $scope.dataCaratula.id,
                        'identifier': " cambio el referenciador "+$scope.nombreReferenciador.first_name+' '+$scope.nombreReferenciador.last_name+" por: "+$scope.nombreReferenciador2.first_name +' '+$scope.nombreReferenciador2.last_name+", al editar la carátula"
                      }
                      dataFactory.post('send-log/', params).then(function success(response) {
                      });
                    })
                    .catch(function(error){
                      console.log('Error - al obtener urlref - catch', error);
                    });
                  })
                  .catch(function(error){
                    console.log('Error - al obtener urlref - catch', error);
                  });
                }
              }  
            }          
          }catch(u){}
          $scope.showCar = true;
          $scope.showPol = false;
          SweetAlert.swal("¡Listo!", "Carátula guardada exitosamente.", "success");
          $state.go('flotillas.info', {polizaId: $scope.dataCaratula.id});
        }
      })
      .catch(function (e) {
        SweetAlert.swal("Error", response.data, "error");
        console.log('error - caratula - catch', e);
      });
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
    // Saveeeeeeeeeeee
    $scope.statusPolicy = function (parValue) {
      switch (parValue) {
        case 1:
          return 'En trámite';
          break;
        case 2:
          return 'OT Cancelada';
          break;
        case 4:
          return 'Precancelada';
          break;
        case 10:
          return 'Por iniciar';
          break;
        case 11:
          return 'Cancelada';
          break;
        case 12:
          return 'Renovada';
          break;
        case 13:
          return 'Vencida';
          break;
        case 14:
          return 'Vigente';
          break;
        case 15:
          return 'No renovada';
          break;
        case 16:
          return 'Siniestrada';
          break;
        default:
          return 'Pendiente';
      }
    };

    $scope.changeAddress = function(param){
      $scope.caratula.address = param;
    };

    $scope.getClaves = function(param){
      $scope.ramoSelected=null;
      $scope.subramoSelected=null;
      $scope.caratula.ramo=null;
      $scope.caratula.subramo=null;
      $scope.caratula.aseguradora = param;
      $scope.aseguradoraSelected = param;
      $http.get(url.IP + 'claves-by-provider/' + $scope.caratula.aseguradora.id)
      .then(function success (clavesResponse){
        $scope.claves = clavesResponse.data;
        if($scope.claves.length == 1){
          $scope.caratula.clave = $scope.claves[0];
          $scope.claveSelected = $scope.claves[0];
        }else{
          $scope.claves.forEach(function(item){
            if(item.id == $scope.caratula.clave.id){
              $scope.claveSelected = item;
            }
          });
        }
      })
      .catch(function(error){
        console.log('Error - claves-by-provider - catch', error);
      });

      $http.get(url.IP + 'ramos-by-provider/' + $scope.caratula.aseguradora.id)
      .then(function success(response){
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

    function convertDate(inputFormat) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    }

    $scope.changeRamo = function(param){
      if(param){
        $scope.caratula.ramo = param;
        $scope.ramoSelected = param;
        $scope.subramos = param.subramo_ramo;
        $localStorage.save_edition_flotilla['ramoSelected'] = param;

      }
    };

    $scope.changeSubramo = function(param){
      if(param){
        $scope.caratula.subramo = param;
        $scope.subramoSelected = param;
        $localStorage.save_edition_flotilla['subramo'] = param;
      }
    };

    $scope.changeClave = function(param){
      if(param){
        $scope.caratula.clave = param;
        $scope.claveSelected = param
        $localStorage.save_edition_flotilla['clave'] = param;
      }
    };

    $scope.changeType = function(param){
      $scope.caratula.type = param;
      $localStorage.save_edition_flotilla['type'] = param;
    };

    $scope.changeCurrency = function(param){
      $scope.caratula.f_currency = param;
      $localStorage.save_edition_flotilla['f_currency'] = param;
    };

    $scope.changeRenewal = function(param){
      $scope.caratula.is_renewable = param.value;
      $localStorage.save_edition_flotilla['is_renewable'] = param;
    };

    $scope.changeResponsable = function(param){
      $scope.users.forEach(function(item){
        item.first_name = item.first_name.toUpperCase();
        item.last_name = item.last_name.toUpperCase()
        item.name = item.first_name.toUpperCase() + ' ' + item.last_name.toUpperCase();
        if(item.id == param){
          $scope.caratula.responsable = item;
          $localStorage.save_edition_flotilla['responsable'] = param;
        }
      });
    };

    $scope.addReferenciador = function(){
      var addReferenciadores = {
        referenciador: '',
        comision_vendedor: ''
      };
      $scope.referenciadorArray.push(addReferenciadores);
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
    $scope.deleteReferenciador = function(index){
      $scope.referenciadorArray.splice(index, 1);
    };

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
   
    $scope.$watch("order.contratante.value",function(newValue, oldValue){
      if(order.contratante){
        if($scope.referenciadores){
          $scope.referenciadores.some(function(user){
            if(user.url == order.contratante.value.vendor){
              $scope.referenciadorArray[0] = {
                referenciador: user.id,
                comision_vendedor: ''
              }
            }
          });
        }
        if((order.contratante.value && order.contratante.value.address_natural) || (order.contratante.value && order.contratante.value.address_juridical)){
          if(order.contratante.value.address_natural){
            $scope.caratula.natural = order.contratante.value;
            $scope.caratula.juridical = null;
            $scope.addresses = order.contratante.value.address_natural;
          }else{
            $scope.caratula.natural = null;
            $scope.caratula.juridical = order.contratante.value;
            $scope.addresses = order.contratante.value.address_juridical;
          }
          if($scope.addresses.length == 1){
            $scope.addressSelected = $scope.addresses[0];
            $scope.caratula.address = $scope.addresses[0].url;
          }
        }
        if(order.contratante && order.contratante.value && order.contratante.value.address_contractor){
          $scope.caratula.contractor = order.contratante.value;
          $scope.addresses = order.contratante.value.address_contractor;
          
          if($scope.addresses.length == 1){
            $scope.addressSelected = $scope.addresses[0];
            $scope.caratula.address = $scope.addresses[0].url;
          }
        }
      }
    });

    $scope.changeAddress = function(param){
      $scope.caratula.address = param;
      $scope.addressSelected = param;
    };

    $scope.contratanteCreator = function(){
      $scope.create_natural = true;
      $scope.create_juridical = true;
      $rootScope.show_contractor = true;
      $localStorage.orderForm = JSON.stringify($scope.caratula);
    };
  }

})();