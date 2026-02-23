(function(){
  'use strict';

  angular.module('inspinia')
      .controller('TableroOtsCtrl', TableroOtsCtrl);

  TableroOtsCtrl.$inject = ['$timeout', 'FileUploader', 'providerService', 'dataFactory', 'SweetAlert','$scope','$rootScope','MESSAGES','toaster','endorsementService','insuranceService',
                             'receiptService', '$stateParams', '$state', 'helpers','formService', '$http','url','$uibModal', 'datesFactory',
                             '$q','$localStorage', '$sessionStorage', 'statusReceiptsFactory', '$sce', 'formatValues', 'fileService','emailService', 'appStates'];


  function TableroOtsCtrl($timeout, FileUploader, providerService, dataFactory, SweetAlert, $scope , $rootScope, MESSAGES, toaster, endorsementService, insuranceService,
                          receiptService, $stateParams, $state, helpers, formService, $http, url, $uibModal, datesFactory,  $q,
                          $localStorage, $sessionStorage, statusReceiptsFactory,  $sce, formatValues, fileService, emailService, appStates) {

    /* Información de usuario */
    var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
    /* Uploader files */
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

    uploader.filters.push({
        name: 'customFilter',
        fn: function(item, options) {
            return this.queue.length < 20;
        }
    });

    var uploader = $scope.uploader = new FileUploader({
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        },
    });

    uploader.filters.push({
        name: 'customFilter',
        fn: function(item, options) {
            return this.queue.length < 20;
        }
    });


    var vm = this;
    $scope.fechasFilter = false;
    vm.pageTitle = 'Pólizas';
    vm.insurance = {};
    vm.receipts = [];
    vm.goToInfo = goToInfo;
    vm.polizaId = $stateParams.polizaId;
    vm.addToData = addToData;
    vm.editContainer = editContainer;
    vm.form = {
      since:convertDate(new Date(new Date().setMonth(new Date().getMonth() - 1))),
      until: convertDate(new Date()),
      password: '',
      usuario:'',
      aseguradora:'',
      startDate: convertDate(new Date())
    };
    vm.defaults = {}
    $scope.loader =false;
    $scope.editcontainer_b = false
    vm.accesos = $sessionStorage.permisos
    vm.deleteFromData = deleteFromData;
    vm.deleteFromDataSave = deleteFromDataSave;
    vm.deleteContainer = deleteContainer;
    vm.moveOTState = moveOTState;
    vm.moveOTStateFilter = moveOTStateFilter;
    vm.getLog = getLog;
    vm.getPDF = getPDF;
    vm.saveColor = saveColor;
    vm.getDataPromotoria = getDataPromotoria;
    if (vm.accesos) {
      vm.accesos.forEach(function(perm){
        if(perm.model_name == 'Pólizas'){
          vm.acceso_polizas = perm
          vm.acceso_polizas.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar pólizas') {
              if (acc.checked == true) {
                vm.acceso_adm_pol = true
              }else{
                vm.acceso_adm_pol = false
              }
            }else if (acc.permission_name == 'Ver pólizas') {
              if (acc.checked == true) {
                vm.acceso_ver_pol = true
              }else{
                vm.acceso_ver_pol = false
              }
            }else if (acc.permission_name == 'Cancelar pólizas') {
              if (acc.checked == true) {
                vm.acceso_canc_pol = true
              }else{
                vm.acceso_canc_pol = false
              }
            }else if (acc.permission_name == 'Eliminar pólizas') {
              if (acc.checked == true) {
                vm.acceso_elim_pol = true
              }else{
                vm.acceso_elim_pol = false
              }
            }else if (acc.permission_name == 'Rehabilitar pólizas') {
              if (acc.checked == true) {
                vm.acceso_adm_rehabilitar = true
              }else{
                vm.acceso_adm_rehabilitar = false
              }
            }
          })
        }if(perm.model_name == 'Endosos'){
          $scope.acceso_endosos = perm
          $scope.acceso_endosos.permissions.forEach(function(acc){
            if (acc.permission_name ==  'Registrar endosos') {
              if (acc.checked == true) {
                $scope.acceso_adm_end = true
              }else{
                $scope.acceso_adm_end = false
              }
            }
          })
        }else if (perm.model_name == 'Reportes') {
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
            }else if (acc.permission_name == 'Cancelar OTs') {
              if (acc.checked == true) {
                vm.acceso_canc_ot = true
              }else{
                vm.acceso_canc_ot = false
              }
            }else if (acc.permission_name == 'Eliminar OTs') {
              if (acc.checked == true) {
                vm.acceso_elim_ot = true
              }else{
                vm.acceso_elim_ot = false
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
        }else if (perm.model_name == 'Siniestros') {
          vm.acceso_sin = perm;
          vm.acceso_sin.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Administrar siniestros') {
              if (acc.checked == true) {
                vm.acceso_adm_sin = true
              }else{
                vm.acceso_adm_sin = false
              }
            }
          })
        }else if (perm.model_name == 'Mensajeria') {
          vm.acceso_mns = perm;
          vm.acceso_mns.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Mensajeria') {
              if (acc.checked == true) {
                vm.acceso_mns = true
              }else{
                vm.acceso_mns = false
              }
            }
          })
        }else if (perm.model_name == 'Formatos') {
          vm.acceso_form = perm;
          vm.acceso_form.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Formatos') {
              if (acc.checked == true) {
                vm.acceso_form = true
              }else{
                vm.acceso_form = false
              }
            }
          })
        }else if (perm.model_name == 'Correos electronicos') {
          vm.acceso_correo = perm;
          vm.acceso_correo.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Correos') {
              if (acc.checked == true) {
                vm.acceso_cor = true
              }else{
                vm.acceso_cor = false
              }
            }
          })
        }else if(perm.model_name == 'Cobranza'){
          vm.acceso_cob = perm
          vm.acceso_cob.permissions.forEach(function(acc){
            if (acc.permission_name == 'Ver cobranza') {
              if (acc.checked == true) {
                vm.acceso_ver_cob = true
              }else{
                vm.acceso_ver_cob = false
              }
            }else if (acc.permission_name == 'Despagar recibos') {
              if (acc.checked == true) {
                vm.acceso_desp_cob = true
              }else{
                vm.acceso_desp_cob = false
              }
            }else if (acc.permission_name == 'Pagar y prorrogar') {
              if (acc.checked == true) {
                vm.acceso_pag_cob = true
              }else{
                vm.acceso_pag_cob = false
              }
            }else if (acc.permission_name == 'Desconciliación de recibos') {
              if (acc.checked == true) {
                vm.acceso_desco_cob = true
              }else{
                vm.acceso_desco_cob = false
              }
            }else if (acc.permission_name == 'Conciliar recibos') {
              if (acc.checked == true) {
                vm.acceso_conc_cob = true
              }else{
                vm.acceso_conc_cob = false
              }
            }else if (acc.permission_name == 'Liquidar recibos') {
              if (acc.checked == true) {
                vm.acceso_liq_cob = true
              }else{
                vm.acceso_liq_cob = false
              }
            }else if (acc.permission_name == 'Eliminar recibos') {
              if (acc.checked == true) {
                vm.acceso_del_cob = true
              }else{
                vm.acceso_del_cob = false
              }
            }else if (acc.permission_name == 'No permitir editar recibos Pagados/Liquidados') {
              if (acc.checked == true) {
                vm.acceso_pl_cob = true //no se editan
              }else{
                vm.acceso_pl_cob = false//se pueden editar pagados-liquidados
              }
            }
          })
        }else if(perm.model_name == 'Referenciadores'){
          vm.acceso_ref = perm
          vm.acceso_ref.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar referenciadores') {
              if (acc.checked == true) {
                vm.acceso_adm_ref = true
              }else{
                vm.acceso_adm_ref = false
              }
            }else if (acc.permission_name == 'Pagar a referenciadores') {
              if (acc.checked == true) {
                vm.acceso_pag_ref = true
              }else{
                vm.acceso_pag_ref = false
              }
            }else if (acc.permission_name == 'Cambiar refrenciador en pólizas') {
              if (acc.checked == true) {
                vm.acceso_chg_ref = true
              }else{
                vm.acceso_chg_ref = false
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
    vm.repeat = [];
    activate();
    // functions
    $scope.cargando = true;
    vm.infoFlag = true;
    $scope.mensajeTablero=''
    function activate() {
      $scope.mensajeTablero=''
      $('.js-example-basic-multiple').select2();
      $scope.principal = {
        'name': 'Contenedor Principal',
        'color':'#E8B2E9 ',
        'contenedores': [
            {                          
            },            
          ]
      }
      $http.get(url.IP + 'fsubramos-tablero/').then(function(response){
        $scope.has_sr_conf =  response && response.data && response.data.data && response.data.data.length > 0 ? true:false;
      })
      // $http.get(url.IP+ 'promotoria-tablero/')
      $http.post(url.IP+ 'get-data-promotoria-initial/')
      .then(
        function success (response) {
          if(response.data.results.length >0){
            if(response.data.perfilRestringido){
              $scope.filtrado = true
              $scope.principal= response.data.original
              $scope.principal.contenedores= (response.data.original.data_details)
              $scope.resultsFilter= (response.data.results)   
              $scope.cargando = false;
            }else{
              $scope.principal= response.data.original
              $scope.principal.contenedores= (response.data.original.data_details)
              $scope.principal.url= response.data.original.url
              $scope.principal.id= response.data.original.id 
              $scope.filtrado =response.data.config
              $scope.resultsFilter= (response.data.results)    
              $scope.cargando = false;
            }    
          }else{
            $scope.cargando = false;
            vm.infoFlag = false;
            $scope.mensajeTablero='Sin configuración'
            $scope.principal = {
              'name': 'Contenedor Principal',
              'color':'#E8B2E9 ',
              'contenedores': []
            }
          }
        },
        function error (e) {
          console.log('Error - promotorias--', e);
        }
      ).catch(function (error) {
        $scope.principal.contenedores=[]
        console.log('Error - promotablero - catch', error);
      });
      // $http.post(url.IP+ 'get-data-promotoria-initial/')
      // .then(
      //   function success (response) {
      //     if(response.data.results.length >0){
      //       if(response.data.perfilRestringido){
      //         $scope.filtrado = true
      //         $scope.principal= response.data.original
      //         $scope.principal.contenedores= (response.data.original.data_details)
      //         $scope.resultsFilter= (response.data.results)   
      //         $scope.cargando = false;
      //       }else{
      //         $scope.principal= response.data.original
      //         $scope.principal.contenedores= (response.data.original.data_details)
      //         $scope.principal.url= response.data.original.url
      //         $scope.principal.id= response.data.original.id 
      //         $scope.filtrado =response.data.config
      //         $scope.resultsFilter= (response.data.results)    
      //         $scope.cargando = false;
      //       }    
      //     }else{
      //       $scope.principal = {
      //         'name': 'Contenedor Principal',
      //         'color':'#E8B2E9 ',
      //         'contenedores': []
      //       }
      //     }
      //   },
      //   function error (e) {
      //     console.log('Error - promotorias--', e);
      //   }
      // ).catch(function (error) {
      //   $scope.principal.contenedores=[]
      //   console.log('Error - promotablero - catch', error);
      // });
    }
    function getLog() {
      dataFactory.get('get-specific-log', {'model': 36, 'associated_id': $scope.principal.id})
      .then(function success(response) {
        var modalInstance = $uibModal.open({ //jshint ignore:line
          templateUrl: 'app/cobranzas/log.modal.html',
          controller: 'LogCtrl',
          size: 'lg',
          resolve: {
            log: function() {
              return response.data;
            }
          },
          backdrop: 'static', /* this prevent user interaction with the background */
          keyboard: false
        });
        modalInstance.result.then(function(receipt) {
        });
      })
    }
    $scope.filtrosSubramos = function(){
      getProviders();
      var modalInstance = $uibModal.open({
        templateUrl: 'app/modals/filtros_subramos_tablero.html',
        controller: FiltrosSubramosTableroModalCtrl,
        size: 'md',
        resolve: {
        },
      backdrop: 'static', /* this prevent user interaction with the background */ 
      keyboard: false
      });

      modalInstance.result.then(function(result) {
        var payload = result['ramos'].map(function(item){
          return item.subramo_code
        })
        if(result && result['aseguradoras']){
          var asegs = result['aseguradoras'].map(function(item){
            return item.id
          })
        }else{
          var asegs = []
        }
        if(result && result['type_ots']){
          var type_ots = result['type_ots']
        }else{
          var type_ots =0
        }
        $http.post(url.IP + 'fsubramos-tablero/', {'subramos':payload,'aseguradoras':asegs,'type_ots':type_ots}).then(function(response){
          $scope.cargando=true;
          $http.post(url.IP+ 'get-data-promotoria-initial/')
          .then(
            function success (response) {
              if(response.data.results.length >0){
                if(response.data.perfilRestringido){
                  $scope.filtrado = true
                  $scope.principal= response.data.original
                  $scope.principal.contenedores= (response.data.original.data_details)
                  $scope.resultsFilter= (response.data.results)   
                  $scope.cargando = false;
                }else{
                  $scope.principal= response.data.original
                  $scope.principal.contenedores= (response.data.original.data_details)
                  $scope.principal.url= response.data.original.url
                  $scope.principal.id= response.data.original.id 
                  $scope.filtrado =response.data.config
                  $scope.resultsFilter= (response.data.results)    
                  $scope.cargando = false;
                }  
                
                var params = {
                  'model':36,
                  'event': "POST",
                  'associated_id': $scope.principal.id,
                  'identifier': ' cambio la configuración de filtro por subramos en el tablero.'
                }
                dataFactory.post('send-log/', params).then(function success(response) {
                });  
              }else{
                // SweetAlert.swal(
                //     'Error',
                //     'Ha ocurrido un error, intente de nuevo. Si la situación persiste, consulte a soporte@miurabox.com',
                //     'error'
                //   );
                  activate();   
                // $scope.principal = {
                //   'name': 'Contenedor Principal',
                //   'color':'#E8B2E9 ',
                //   'contenedores': []
                // }
              }
            },
            function error (e) {
              SweetAlert.swal(
                'Error',
                'Ha ocurrido un error, intente de nuevo. Si la situación persiste, consulte a soporte@miurabox.com',
                'error'
              );
              activate();   
              console.log('Error - promotorias--', e);
            }
          ).catch(function (error) {
            // $scope.principal.contenedores=[];
            SweetAlert.swal(
                'Error',
                'Ha ocurrido un error, intente de nuevo. Si la situación persiste, consulte a soporte@miurabox.com',
                'error'
              );
              activate();            
              console.log('Error - promotablero - catch', error);
          });
          // $http({
          //   method: 'POST',
          //   url: url.IP + 'get-data-promotoria/',
          //   data: {
          //     ramos: payload,
          //     aseguradoras: asegs,
          //     type_ots:type_ots,
          //     principal: $scope.principal.id,
          //   }
          // }) 
          // .then(
          //   function success (response) {
          //     $scope.filtrado =true
          //     $scope.principal= (response.data.original)
          //     $scope.principal.contenedores= (response.data.original.data_details)
          //     $scope.resultsFilter= (response.data.results)
          //   },
          //   function error (e) {
          //     console.log('Error - get/promotorias--', e);
          //   }
          // ).catch(function (error) {
          //   console.log('Error - get/promotablero - catch', error);
          // });
          toaster.success('Información actualizada');
        })
      });
    }

    function FiltrosSubramosTableroModalCtrl($scope, $uibModalInstance){
      $scope.type_ots=0;
      $scope.subramos_toselected = [
        {
          subramo_code: 9,
          subramo_name: 'Automóviles'
        },{
          subramo_code: 3,
          subramo_name: 'Gastos Médicos'
        },{
          subramo_code: 2,
          subramo_name: 'Accidentes Personales'
        }, {
          subramo_code: 1,
          subramo_name: 'Vida'
        }, {
          subramo_code: 7,
          subramo_name: 'Incendio'
        }, {
          subramo_code: 4,
          subramo_name: 'Salud'
        }, {
          subramo_code: 10,
          subramo_name: 'Crédito'
        }, {
          subramo_code: 11,
          subramo_name: 'Crédito a la Vivienda'
        },
        {
          subramo_code: 13,
          subramo_name: 'Diversos'
        },
        {
          subramo_code:12,
          subramo_name: 'Garantía Financiera'
        },
        {
          subramo_code:8,
          subramo_name: 'Agrícola y de Animales'
        },
        {
          subramo_code:6,
          subramo_name: 'Marítimo y Transportes'
        },
        {
          subramo_code:5,
          subramo_name: 'Responsabilidad Civil y Riesgos Profesionales'
        },
        {
          subramo_code:14,
          subramo_name: 'Terremoto y Otros Riesgos Catastróficos'
        }
      ];
      // $scope.selectProv = function(sel){
      //   $scope.providers_selected = [];
      //   sel.forEach(function(cl) {
      //     $scope.providers_selected.push(cl)
      //   })        
      // };
      getProvidersModal();
      $scope.cancel = cancel;
      $scope.saveConfig = saveConfig;
      $scope.ramos = [];
      $scope.aseguradoras = [];
      $http.get(url.IP + 'fsubramos-tablero/').then(function(response){
        if(response.data && response.data.data){
          $scope.type_ots=response.data.type_ots;
          response.data.data.forEach(function(item){
            $scope.subramos_toselected.forEach(function(sr){
              if (sr['subramo_code'] == item ){
                $scope.ramos.push(sr);
              }
            })
          })          
        }if(response.data && response.data.aseguradoras){
          var date = new Date();
          var curr_date = date.getDate();
          var curr_month = date.getMonth() + 1; //Months are zero based
          var curr_year = date.getFullYear();
          var d = curr_year + "-" + curr_month + "-" + curr_date;
          providerService.getProviderByKey(d)
          .then(function(data){
            $scope.providers_toselected = data.data;
            response.data.aseguradoras.forEach(function(item){
              $scope.providers_toselected.forEach(function(sr){
                if (sr['id'] == item){
                  $scope.aseguradoras.push(sr);
                }
              })
            })  
          });        
        }
      })
      $('.js-example-basic-multiple').select2();      
      angular.element(document).ready(function(){
        $('.js-example-basic-multiple').select2();
      });

      function cancel() {
        $uibModalInstance.dismiss('cancel');
      }

      function saveConfig(sa) {
        var data = {'ramos':$scope.ramos,'aseguradoras':$scope.aseguradoras ? $scope.aseguradoras : $scope.providers_selected,'type_ots':$scope.type_ots}
        $uibModalInstance.close(data);
      }
      
      function getProvidersModal(){
        var date = new Date();
        var curr_date = date.getDate();
        var curr_month = date.getMonth() + 1; //Months are zero based
        var curr_year = date.getFullYear();
        var d = curr_year + "-" + curr_month + "-" + curr_date;
        providerService.getProviderByKey(d)
        .then(function(data){
          $scope.providers_toselected = data.data;
        });
      }
    }
    function getProviders(){
      var date = new Date();
      var curr_date = date.getDate();
      var curr_month = date.getMonth() + 1; //Months are zero based
      var curr_year = date.getFullYear();
      var d = curr_year + "-" + curr_month + "-" + curr_date;
      providerService.getProviderByKey(d)
      .then(function(data){
        $scope.providers_toselected = data.data;
      });
    }
    $scope.colorArray1=[
      {'name':'Rojo','value':'#F44336'},
      {'name':'Azul Claro','value':'#B6E3E9'},
      {'name':'Rosa Claro','value':'#FDAFAB'},
      {'name':'Amarillo Claro','value':'#FFF59D'},
      {'name':'Morado','value':'#B7A9E0'},
      {'name':'Gris','value':'#DFE5E5'},
      {'name':'Crema','value':'#F1E9DC'},
      {'name':'Amarillo','value':'#F8C45F'},
      {'name':'Café','value':'#E3B895'},
      {'name':'Rosa','value':'#FF319D'},
      {'name':'Naranja','value':'#F47231'},
      {'name':'Azul','value':'#5ECEF5'},
      {'name':'Verde','value':'#00CD7A'},
      {'name':'Verde limón','value':'#BEE920'},
      {'name':'Verde Claro','value':'#BEE9CB'},
    ]
    $scope.colorArray = ['#B6E3E9','#FDAFAB','#FFF59D','#B7A9E0','#DFE5E5','#F1E9DC','#F8C45F','#E3B895','#FF319D','#F47231',
      '#5ECEF5','#00CD7A','#BEE920','#BEE9CB','#F44336']
    function saveColor (argument) {
      $scope.colorSelected = argument
      $scope.container.color = argument
    }
    $scope.gotToInfo = function(info,cnt,ind,tipo){
      if(tipo ==1){
        dataFactory.get('leer-polizas-info/'+info.id)
        .then(function success(response){
          if(response.data){
            var policy =response.data
            if(policy.document_type ==1){
              $state.go('polizas.info', {polizaId: info.id})
            }else if(policy.document_type ==3){
              $state.go('colectividades.info', {polizaId: info.id})
            }else if(policy.document_type == 6){
              $state.go('colectividades.info', {polizaId: info.id})
            }else if (policy.document_type == 7) {
              $state.go('fianzas.info', {polizaId: info.id})
            }else if (policy.document_type == 8) {
              $state.go('fianzas.details',{polizaId: info.id})
            }else if (policy.document_type == 12) {
              // $state.go('flotillas.info',{polizaId: info.id})
            }
          }
        })
        .catch(function (error) {
          console.log('Error - getot - catch', error);
        });
      }
      if(tipo ==2){
        $state.go('endorsement.info',{endosoId: info.id})
      }
    }
    $scope.cancelNewEdit = function(){
      $scope.container = {}
      $scope.newcontainer=false;
      $scope.editcontainer_b=false;
    }
    function moveOTState(cn_data, cn, newcontainer, principal, tipo) {
      if (!cn_data || !cn || !newcontainer || !principal) {
        console.error("Invalid parameters passed to moveOTState");
        return;
      }

      // Remove the ID from any existing container before adding it to the new one
      angular.forEach(principal.contenedores, function (container) {
          if (tipo === 1) {
              var index = container.polizas.indexOf(cn_data.id);
              if (index !== -1) {
                  container.polizas.splice(index, 1);
              }
          } else if (tipo === 2) {
              var index = container.endoso.indexOf(cn_data.id);
              if (index !== -1) {
                  container.endoso.splice(index, 1);
              }
          }
      });

      // Add the ID to the new container
      if (tipo === 1 && newcontainer.polizas.indexOf(cn_data.id) === -1) {
          newcontainer.polizas.push(cn_data.id);
      } else if (tipo === 2 && newcontainer.endoso.indexOf(cn_data.id) === -1) {
          newcontainer.endoso.push(cn_data.id);
      }

      // Prepare the payload ensuring unique IDs
      var payload = {
          polizas_ots: principal.contenedores.map(function (container) {
              return {
                tablero: container.tablero,
                color: container.color,
                polizas: Array.from(new Set(container.polizas)), // Ensuring unique IDs
                endoso: Array.from(new Set(container.endoso))   // Ensuring unique IDs
              };
          }),
          name: principal.name,
          color: principal.color,
          url: $scope.principal.url || ""
      };  
      // Uncomment the following block to make the HTTP request once needed
      // /*
      if ($scope.principal.url && $scope.principal.url !== '') {
          $http.patch($scope.principal.url, payload)
          .then(
              function success(response) {
                 var params = {
                  'model': 36,
                  'event': "PATCH",
                  'associated_id': $scope.principal.id,
                  'identifier': " cambio la OT "+ (tipo==1 ? 'Póliza': 'Endoso')+" de columna: "+cn.tablero+"  a: "+newcontainer.tablero+" ("+cn_data.internal_number+"):"+cn_data.id
                }
                dataFactory.post('send-log/', params).then(function success(response) {              
                });
                // activate();
                $state.reload()
              },
              function error(e) {
                console.error("Error updating data:", e);
              }
          ).catch(function (error) {
            console.error("Error in moveOTState - catch:", error);
          });
      }
      // */
    }
  
    // function moveOTState(cn_data,cn,newcontainer,principal,tipo){
    //   // $scope.cargando = true;
    //   // cn.data.splice(cn_data,1)   
    //   if(tipo ==1){
    //     cn.polizas.splice(cn.polizas.indexOf(cn_data.id), 1);
    //     newcontainer.polizas.push(cn_data.id)
    //   }  
    //   if(tipo ==2){
    //     cn.endoso.splice(cn.endoso.indexOf(cn_data.id), 1);
    //     newcontainer.endoso.push(cn_data.id)
    //   }   
    //   console.log('tablero**********',newcontainer,principal.contenedores,cn_data.id,tipo,cn)
    //   if(principal.contenedores && principal.contenedores.length>0){
    //     principal.contenedores.forEach(function(r,i) {
    //       if(r){
    //         if (r["details_endoso"]){
    //           r["details_endoso"] = []
    //         }
    //         if(r["details_polizas"]){
    //           r["details_polizas"] = []
    //         }
    //       }
    //     })    
    //   }
    //   var payload = {
    //     'polizas_ots' :(principal.contenedores),
    //     'name':principal.name,
    //     'color':principal.color,
    //     'url': $scope.principal.url ? $scope.principal.url :''
    //   }
    //   console.log('payload',payload,cn,newcontainer)
    //   // if ($scope.principal.url && $scope.principal.url !='') {
    //   //   $http.patch($scope.principal.url,payload)
    //   //   .then(
    //   //     function success (response) {
    //   //       console.log('repsonseEEEEEEEE',response,payload)
    //   //       activate();
    //   //     },
    //   //     function error (e) {
    //   //       console.log('Error - promotorias--', e);
    //   //     }
    //   //   ).catch(function (error) {
    //   //     console.log('Error - promotablero - catch', error);
    //   //   }); 
    //   // }
    // }    
    function getPDF(id_ot){
      $http({
        method: 'GET',
        url: url.IP + 'get-pdf-ot/',
        responseType: 'arraybuffer',
        params: {
          'id': id_ot
        }
      }).then(function success(response) {
        if(response.status === 200 || response.status === 201){
          toaster.info("Se generó el PDF");
          $scope.pdf = response.data;
          var file = new Blob([response.data], {type: 'application/pdf'});         
          var fileURL = URL.createObjectURL(file);
          $scope.content = $sce.trustAsResourceUrl(fileURL);
          window.open($scope.content);
          var params = {
            'model': 1,
            'event': "POST",
            'associated_id': id_ot,
            'identifier': 'generó el PDF.'
          }
          dataFactory.post('send-log/', params).then(function success(response) {
          });
        }
        else{
          toaster.warning("Ocurrió Un problema,Intenta nuevamente");
        }


      })
    }
    $scope.getPDFE = function(endoso) {
      var params = {
        'poliza': endoso.policy ? endoso.policy.id : 0,
        'fianza': 0,
        'endoso': endoso.id
      }
      $http({
        method: 'GET',
        url: url.IP + 'get-pdf-endorsement-new/',
        responseType: 'arraybuffer',
        params: params
      })
      .then(function success(response) {
        var file = new Blob([response.data], {type: 'application/pdf'});
       
        var fileURL = URL.createObjectURL(file);
        $scope.content = $sce.trustAsResourceUrl(fileURL);
        window.open($scope.content);
      })
    };
    function moveOTStateFilter(filter_cn_data,filter_cn,newcontainer,principal,tipo){
      var contenedoredit={}
      if(tipo ==1){
        filter_cn.polizas.splice(filter_cn.polizas.indexOf(filter_cn_data.id), 1);
        newcontainer.polizas.push(filter_cn_data.id)
      }  
      if(tipo ==2){
        filter_cn.endoso.splice(filter_cn.endoso.indexOf(filter_cn_data.id), 1);
        newcontainer.endoso.push(filter_cn_data.id)
      }   
      principal.contenedores.forEach(function(r) {
        if(r){
          if (r["details_endoso"]){
            r["details_endoso"] = []
          }
          if(r["details_polizas"]){
            r["details_polizas"] = []
          }
        }
        if (r.tablero ==filter_cn.tablero) {
          if(tipo ==1){
            r.polizas.forEach(function(d) {
              if(d ==filter_cn_data.id){
                r.polizas.splice(r.polizas.indexOf(d), 1);
              }
            })            
          }
          if(tipo ==2){
            r.endoso.forEach(function(d) {
              if(d ==filter_cn_data.id){
                r.endoso.splice(r.endoso.indexOf(d), 1);
              }
            })            
          }
        }
      })
      var payload = {
        'polizas_ots' :(principal.contenedores),
        'tablero':principal.tablero,
        'color':principal.color,
        'url': $scope.principal.url ? $scope.principal.url :''
      }
      if ($scope.principal.url && $scope.principal.url !='') {   
        $http.patch($scope.principal.url,payload)
        .then(
          function success (response) {
            activate()
          },
          function error (e) {
            console.log('Error - promotorias--', e);
          }
        ).catch(function (error) {
          console.log('Error - promotablero - catch', error);
        }); 
      }else{
        console.log('-no princi',$scope.principal,principal.contenedores)    
      }
    }
    function deleteContainer(container, principal,ind){
      SweetAlert.swal({
        title: "Eliminar Contenedor",
        text: "Se eliminará definitivamente del Tablero\n"+container.tablero+"\n¿Desea continuar?\n" ,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar"
      },
      function(isConfirm){
        if(isConfirm){
          principal.contenedores.splice(principal.contenedores.indexOf(container), 1);
          principal.contenedores.forEach(function(r) {
            if(r){
              if (r["details_endoso"]){
                r["details_endoso"] = []
              }
              if(r["details_polizas"]){
                r["details_polizas"] = []
              }
            }
          })
          var payload = {
            'polizas_ots' :(principal.contenedores),
            'name':principal.name,
            'color':principal.color,
            'url': $scope.principal.url ? $scope.principal.url :''
          }
          $http.patch($scope.principal.url,payload)
          .then(
            function success (response) {
              var params = {
                'model': 36,
                'event': "DELETE",
                'associated_id': $scope.principal.id,
                'identifier': " borro la columna del tablero: "+container.tablero+"."
              }
              dataFactory.post('send-log/', params).then(function success(response) {                
              });
              activate();
            },
            function error (e) {
              console.log('Error - promotorias--', e);
            }
          ).catch(function (error) {
            console.log('Error - promotablero - catch', error);
          });  
        }
      });            
    }
    function editContainer(container,inde){
      $scope.container = container
      $scope.newcontainer = false
      $scope.editcontainer_b = true
      $scope.index = inde;
    }
    $scope.newcontainer = false
    $scope.addContainer = function (argument) {
      $scope.newcontainer = true   
      $scope.editcontainer_b = false
      $scope.container = {
        "tipo":1,
        "tablero": '',
        "color":'',
        "polizas":[],
        "endoso":[]
      }   
    }
    function deleteFromData(p,container){
      // container.data.splice(p,1)      
      container.data.splice(container.data.indexOf(p), 1);
    }
    function deleteFromDataSave(cn_data,cn,principal,index){
      SweetAlert.swal({
        title: "Eliminar Registro",
        text: "Se eliminará definitivamente del Contenedor, ¿Desea continuar? \n"+ cn_data.val,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar"
      },
      function(isConfirm){
        if(isConfirm){
          cn.data.splice(cn.data.indexOf(cn_data), 1);
          var payload = {
            'polizas_ots' :(principal.contenedores),
            'tablero':principal.tablero,
            'color':principal.color,
            'url': $scope.principal.url ? $scope.principal.url :''
          }
          if ($scope.principal.url && $scope.principal.url !='') {
            $http.patch($scope.principal.url,payload)
            .then(
              function success (response) {
                $scope.principal  = (response.data)
                $scope.principal.contenedores  = (response.data.config)
                $scope.principal.url= response.data.url
                $scope.principal.id= response.data.id
              },
              function error (e) {
                console.log('Error - promotorias--', e);
              }
            ).catch(function (error) {
              console.log('Error - promotablero - catch', error);
            }); 
          }
        }
      });       
    }
    $scope.saveContainer = function(principal,arg){
      $scope.mensajeTablero=''
      $scope.newcontainer = false   
      if (arg.tablero =='EN TRÁMITE' || arg.tablero=='Pendiente' || arg.tablero=='PENDIENTE') {
        arg["tipo"] = 0
      }
      arg["polizas"]= [];
      arg["endoso"]= [];
      principal.contenedores = principal.contenedores ? principal.contenedores : []
      if(principal.contenedores && principal.contenedores.length>0){
        principal.contenedores.forEach(function(r,i) {
          if(r){
            if (r["details_endoso"]){
              r["details_endoso"] = []
            }
            if(r["details_polizas"]){
              r["details_polizas"] = []
            }
          }
        })    
      }
      principal.contenedores.push(arg)
      var payload = {
        'polizas_ots' :principal.contenedores ? principal.contenedores : [],
        'url': $scope.principal.url ? $scope.principal.url :''
      }
      if ($scope.principal.url && $scope.principal.url !='') {
        $http.patch($scope.principal.url,payload)
        .then(
          function success (response) {
            var params = {
              'model': 36,
              'event': "POST",
              'associated_id': $scope.principal.id,
              'identifier': " agrego una columna al tablero: "+arg.tablero+" ."
            }
            dataFactory.post('send-log/', params).then(function success(response) {              
            });
            activate()
          },
          function error (e) {
            console.log('Error - promotorias--', e);
          }
        ).catch(function (error) {
          console.log('Error - promotablero - catch', error);
        }); 
      }else{
        $http.post(url.IP+ 'promotoria-tablero/',payload)
        .then(
          function success (response) {
            activate()
          },
          function error (e) {
            console.log('Error - promotorias--', e);
          }
        ).catch(function (error) {
          console.log('Error - promotablero - catch', error);
        });        
      }
    }
    $scope.saveContainerFilter = function(principal,arg){
      $scope.newcontainer = false   
      if (arg.name =='EN TRÁMITE' || arg.name=='Pendiente') {
        arg.tipo = 0
      }
      principal.contenedores = principal.contenedores ? principal.contenedores : []
      if(principal.contenedores && principal.contenedores.length>0){
        principal.contenedores.forEach(function(r,i) {
          if(r){
            if (r["details_endoso"]){
              r["details_endoso"] = []
            }
            if(r["details_polizas"]){
              r["details_polizas"] = []
            }
          }
        })    
      }
      principal.contenedores.push(arg)
      var payload = {
        // 'polizas_ots': []
        'polizas_ots' :principal.contenedores ? principal.contenedores : [],
        'name':principal.name,
        'color':principal.color,
        'url': $scope.principal.url ? $scope.principal.url :''
      }
      if ($scope.principal.url && $scope.principal.url !='') {
        $http.patch($scope.principal.url,payload)
        .then(
          function success (response) {
            var params = {
              'model': 36,
              'event': "POST",
              'associated_id': $scope.principal.id,
              'identifier': " agrego columna al tablero: "+arg.tablero+"."
            }
            dataFactory.post('send-log/', params).then(function success(response) {                
            });
            $state.reload()
          },
          function error (e) {
            console.log('Error - promotorias--', e);
          }
        ).catch(function (error) {
          console.log('Error - promotablero - catch', error);
        }); 
      }
    }
    $scope.saveEditContainerFilter = function(principal,con){
      $scope.editcontainer_b = false
      $scope.newcontainer = false  
      principal.contenedores[$scope.index].tablero =con.tablero
      principal.contenedores[$scope.index].color =con.color
      if(principal.contenedores && principal.contenedores.length>0){
        principal.contenedores.forEach(function(r,i) {
          if(r){
            if (r["details_endoso"]){
              r["details_endoso"] = []
            }
            if(r["details_polizas"]){
              r["details_polizas"] = []
            }
          }
        })    
      }
      var payload = {
        'polizas_ots' :(principal.contenedores),
        'name':principal.name,
        'color':principal.color,
        'url': $scope.principal.url ? $scope.principal.url :''
      }
      $http.patch($scope.principal.url,payload)
      .then(
        function success (response) {
          var params = {
              'model': 36,
              'event': "PATCH",
              'associated_id': $scope.principal.id,
              'identifier': " edito la columna del tablero: "+principal.contenedores[$scope.index].tablero +"por "+con.tablero+"."
            }
            dataFactory.post('send-log/', params).then(function success(response) {                
            });
          activate()
        },
        function error (e) {
          console.log('Error - promotorias--', e);
        }
      ).catch(function (error) {
        console.log('Error - promotablero - catch', error);
      }); 
    }
    $scope.saveEditContainer = function(principal,con){
      $scope.editcontainer_b = false
      $scope.newcontainer = false  
      principal.contenedores[$scope.index].tablero =con.tablero
      principal.contenedores[$scope.index].color =con.color
      if(principal.contenedores && principal.contenedores.length>0){
        principal.contenedores.forEach(function(r,i) {
          if(r){
            if (r["details_endoso"]){
              r["details_endoso"] = []
            }
            if(r["details_polizas"]){
              r["details_polizas"] = []
            }
          }
        })    
      }
      var payload = {
        'polizas_ots' :(principal.contenedores),
        'name':principal.name,
        'color':principal.color,
        'url': $scope.principal.url ? $scope.principal.url :''
      }
      $http.patch($scope.principal.url,payload)
      .then(
        function success (response) {
           var params = {
              'model': 36,
              'event': "PATCH",
              'associated_id': $scope.principal.id,
              'identifier': " edito el tablero: "+principal.contenedores[$scope.index].tablero+"  a: "+con.tablero+" ."
            }
            dataFactory.post('send-log/', params).then(function success(response) {              
            });
          activate()
        },
        function error (e) {
          console.log('Error - promotorias--', e);
        }
      ).catch(function (error) {
        console.log('Error - promotablero - catch', error);
      }); 
    }
    // $scope.saveEditContainer = function(principal,con){
    //   $scope.editcontainer_b = false
    //   $scope.newcontainer = false  
    //   var payload = {
    //     'config' :JSON.stringify(principal.contenedores),
    //     'name':principal.name,
    //     'color':principal.color,
    //     'url': $scope.principal.url ? $scope.principal.url :''
    //   }
    //   $http.patch($scope.principal.url,payload)
    //   .then(
    //     function success (response) {
    //       $scope.principal = (response.data)
    //       $scope.principal.contenedores  = (response.data.data_details)
    //       $scope.principal.url= response.data.url
    //       $scope.principal.id= response.data.id
    //     },
    //     function error (e) {
    //       console.log('Error - promotorias--', e);
    //     }
    //   ).catch(function (error) {
    //     console.log('Error - promotablero - catch', error);
    //   }); 
    // }
    // ---------------    
    $scope.selectRamos = function(sel){
      vm.ramos_selected = [];
      vm.id = sel[0]
      sel.forEach(function(r) {
        vm.ramos_selected.push(parseInt(r)); 
      })
    };    
    $scope.selectAseguradoras = function(sel){
      vm.aseguradoras_selected = [];
      vm.ida = sel[0]
      sel.forEach(function(r) {
        vm.aseguradoras_selected.push(parseInt(r)); 
      })
    };
    $scope.filtrado =false
    function getDataPromotoria(data,pr,v){
      if (v==1) {
        $state.reload()
      }else if(vm.ramos_selected && vm.ramos_selected.length!=0){
        $http({
          method: 'POST',
          url: url.IP + 'get-data-promotoria/',
          data: {
            ramos: vm.ramos_selected,
            principal: $scope.principal.id,
          }
        }) 
        .then(
          function success (response) {
            $scope.filtrado =true
            $scope.principal= (response.data.original)
            $scope.principal.contenedores= (response.data.original.data_details)
            $scope.resultsFilter= (response.data.results)
          },
          function error (e) {
            console.log('Error - get/promotorias--', e);
          }
        ).catch(function (error) {
          console.log('Error - get/promotablero - catch', error);
        });
      }else{
        $state.reload();
      }
    }
    // ---------------

    function fillProvider() {
      var d = vm.form.startDate;
      try{
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1; //Months are zero based
        var curr_year = d.getFullYear();
      }

      catch(error){
        var from = d.split("/")
        var f = new Date(from[2], from[1] - 1, from[0])
        var curr_date = f.getDate();
        var curr_month = f.getMonth() + 1; //Months are zero based
        var curr_year = f.getFullYear();
      }

      var date = curr_year + "-" + curr_month + "-" + curr_date;
      providerService.getProviderByKey(date)
      .then(function success(data) {
          vm.defaults.providers = data.data;
          vm.defaults.providers.forEach(function(x) {
            if (x.alias == 'Chubb' || x.alias =='chubb' || x.alias == 'Aba' || x.alias =='ABA') {
              vm.form.aseguradora = x
            }
          })
        },
        function error(err) {
          console.log('error', err);
        });
    }
    $scope.dataShare=[];
    function goToInfo(insurance) {
      if(insurance.document_type == 1){
        $scope.route_for_new_tab = 'polizas.info';
        var name = 'Información Póliza'
        var route = 'polizas.info';
      } else if(insurance.document_type == 3){
        $scope.route_for_new_tab = 'colectividades.info';
        var name = 'Información Colectividad'
        var route = 'colectividades.info';
      }else if (insurance.document_type == 11) {
        $scope.route_for_new_tab = 'flotillas.info';
        var name = 'Información Flotilla'
        var route = 'flotillas.info';
      }else if (insurance.document_type == 12) {
        $scope.route_for_new_tab = 'flotillas.info';
        var name = 'Información Flotilla'
        var route = 'flotillas.info';
      }
      $scope.name_for_new_tab = name;
      $scope.route_for_new_tab = route;

      var existe = false;
      if (name && route){
        $scope.route_for_new_tab = route;
        $scope.name_for_new_tab = name;
        appStates.states.forEach(function(state) {
          if (state.route == $scope.route_for_new_tab){
            existe = true;
          }
        });
      }

      if (!existe){
        var active_tab = appStates.states.findIndex(function(item){
          if (item.active){
            return true
          }
          return false;
        });
        
        appStates.states[active_tab] = { 
          name: $scope.name_for_new_tab, 
          heading: $scope.name_for_new_tab, 
          route: $scope.route_for_new_tab, 
          active: true, 
          isVisible: true, 
          href: $state.href($scope.route_for_new_tab),
        }
      }
      $localStorage.tab_states = appStates.states;
    // var index_tab = appStates.states.findIndex(function(state){return state.active === true});
      if(insurance.document_type == 1){
        // appStates.states[index_tab] = { 
        //   id: insurance.id, 
        //   name: 'Info póliza '+ insurance.poliza_number, 
        //   heading: 'Info póliza '+ insurance.poliza_number, 
        //   route: 'polizas.info', 
        //   active: appStates.states[index_tab].active, 
        //   isVisible: appStates.states[index_tab].isVisible, 
        //   href: $state.href('polizas.info', {polizaId: insurance.id})
        // }
        // $localStorage.tab_states = appStates.states;
        $state.go('polizas.info', {polizaId: insurance.id})
      } else if(insurance.document_type == 3){
        $state.go('colectividades.info', {polizaId: insurance.id})
      }else if (insurance.document_type == 11) {
        $state.go('flotillas.info',{polizaId: insurance.id})
      }else if (insurance.document_type == 12) {
        $state.go('flotillas.info',{polizaId: insurance.caratula})
      }
    }
    function addToData(p,container){
      container.data.push(vm.policy_number)
      vm.policy_number = {}
    }
    $scope.findPolicy = function (parValue,container) {
      if (parValue) {
        if (parValue.val.length >= 3) {
          // if ($scope.infoUser.staff && !$scope.infoUser.superuser) {
          //   $scope.show_contractor = 'v2/polizas/get-endorsements-policies/';
          $scope.show_contractor = 'get-ots/';
          dataFactory.post($scope.show_contractor, {word: parValue.val})
          .then(function success (request) {
            var results = [];
            var results2 = [];
            results = _.map(request.data.ots, function(item) {            
              var label = 'OT: '+item.internal_number + ' - ' + item.contractor.full_name + ' - ' + datesFactory.convertDate(item.start_of_validity) + ' - ' + datesFactory.convertDate(item.end_of_validity)+'-'+item.ramo;
              return {
                label: label,
                value: item.internal_number,
                id: item.id,
                tipo_registro: 0
              }
            });
            results2 = _.map(request.data.endosos, function(item_end) {     
              if (item_end.policy.document_type==1) {
                var ti = 'Póliza'
              }else if (item_end.policy.document_type==3) {
                var ti = 'Póliza Grupo'
              }  else if (item_end.policy.document_type==12) {
                var ti = 'Póliza Colectividad'
              } else{
                var ti=item_end.policy.document_type
              }      
              var label = 'Endoso: '+item_end.internal_number + ' - ' + item_end.policy.contractor.full_name + ' - ' + datesFactory.convertDate(item_end.init_date) + ' - ' + datesFactory.convertDate(item_end.end_date)+'-'+item_end.policy.ramo.ramo_name;
              return {
                label: label,
                value: item_end.internal_number,
                id: item_end.id,
                tipo_registro: 1
              }
            });
            results2.forEach(function(x) {
              results.push(x)
            })
            $scope.autocompleteData = results;
            $scope.autocompleteDataEndoso = results2;
          }, function error (error) {

          })
          .catch(function(e) {
            console.log('e', e);
          });
        }
      }
    };
    $scope.list1 = {title: 'AngularJS - Drag Me'};
    $scope.list2 = {};
    function convertDate(inputFormat) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    }
    function toDate(dateStr) {
      var dateString = dateStr; // Oct 23
      var dateParts = dateString.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

      return dateObject;
    }
    $scope.lista=[{'id':1,'name':'una'},{'id':2,'name':'dos'}]
    $scope.$broadcast("ngDraggable:inputEvent", {})
    // #--------------
    $scope.onDragComplete=function(data,evt){
       console.log("drag success, data:", data);
    }
    $scope.onDropComplete=function(data,evt){
        console.log("drop success, data:", data);
    }
    // *********************
    function mesDiaAnio (parDate) {
      var d = new Date(toDate(parDate));
      var date = (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
      return date;
    }
  }
})();
