'use strict';

angular.module('inspinia')
    .controller('ContratantesPPEditCtrl', ContratantesPPEditCtrl);
ContratantesPPEditCtrl.$inject = ['datesFactory', 'dataFactory', '$parse','SweetAlert','$http', '$scope', '$stateParams', '$state', '$uibModal', '$localStorage', '$q', '$timeout',
    'ContratanteService', 'groupService', 'contactService', 'generalService', 'globalVar', '$rootScope', 
    'toaster', 'FileUploader', 'url', 'helpers', 'MESSAGES', 'fileService', '$sessionStorage', '$window','$filter','$sce'
];

function ContratantesPPEditCtrl(datesFactory, dataFactory, $parse, SweetAlert,$http, $scope, $stateParams, $state, $uibModal, $localStorage, $q, $timeout,
    ContratanteService, groupService, contactService, generalService, globalVar, $rootScope, 

    toaster, FileUploader, url, helpers, MESSAGES, fileService, $sessionStorage, $window,$filter, $sce) {

    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    var vm = this;
    vm.org_name = usr.org;
    vm.showInfo = true;
    // configuración del datepicker
    $('.datepicker-me input').datepicker();

    $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
    $.fn.datepicker.defaults.startView = 0;
    $.fn.datepicker.defaults.autoclose = true;
    $.fn.datepicker.defaults.language = 'es';

    vm.showComments = false;
    vm.showBackButton = true;

    vm.editForm = [];
    vm.celulas = [];
    vm.clasifications = [];
    vm.agrupaciones = [];

    vm.user = usr;
    vm.accesos = $sessionStorage.permisos;
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
            }
          })
        }else if(perm.model_name == 'Siniestros'){
          vm.acceso_sin = perm
          vm.acceso_sin.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar siniestros') {
              if (acc.checked == true) {
                vm.acceso_adm_sin = true
              }else{
                vm.acceso_adm_sin = false
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
        }else if(perm.model_name == 'Fianzas'){
          vm.acceso_fian = perm
          vm.acceso_fian.permissions.forEach(function(acc){
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
    /** Uploader files */
    vm.goToContractorEdit = goToContractorEdit;
    vm.uploadImages = uploadImages;
    vm.verCobranza = verCobranza;
    vm.verPolizas = verPolizas;
    vm.verSiniestros = verSiniestros;
    vm.getSinister = getSinister;
    vm.ramo_changed = ramo_changed;
    vm.ramos={};
    vm.ramos.ramo_selected=2;
    vm.deleteAddress = deleteAddress;
    vm.ramos.options=[
        {'id':2,'label':'Accidentes y Enfermedades'},
        {'id':3,'label':'Daños'},
        {'id':1,'label':'Vida'},
    ]

    vm.address_type = [{
        name: "Dirección Personal",
        id: 0
      }, {
        name: "Dirección Fiscal",
        id: 1
      }, {
        name: "Dirección de cobro",
        id: 2
      }, {
        name: "Dirección de paquetería",
        id: 3
      }, {
        name: "Dirección de riesgo",
        id: 4
      }, {
        name: "CFDI",
        id: 5
    }]

    vm.showPendientes = showPendientes;
    vm.showPagados = showPagados;
    vm.showLiquidados = showLiquidados;
    vm.showCancelados = showCancelados;
    vm.showNotas = showNotas;
    $scope.contractor = [];

    vm.cPendientes = true;
    vm.cPagados = false;
    vm.cLiquidados = false;
    vm.cCancelados = false;
    $scope.flagPhone = false;

    $scope.contractorEdit = [];
    vm.getPDFEdo = getPDFEdo;

    $scope.change_vip = function(url, vip) {
      $http.patch(url, {'vip':vip}).then(function(response) {
        if(response.status == 200){
          toaster.success('Cambio exitoso', 'El cambio se ha aplicado con éxito');
        } else{
          toaster.warning('Ha ocurrido un problema', 'Intente nuevamente');
          vm.form.vip = !vip;
        }
      })
    }

    function getPDFEdo(contr) {
      $http({
        method: 'GET',
        url: url.IP + 'get-pdf-edocuenta/',
        params: {
          'id': contr.id,
          'tipo':contr.type_person
        }
      }).then(function success(response) {
        if(response.status === 200 || response.status === 201){
          toaster.info("Se generó el PDF");
          $scope.pdf = response.data;

          var file = new Blob([response.data], {type: 'application/pdf'});
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(file);
          }
          else{
            var fileURL = URL.createObjectURL(file);
            $scope.content = $sce.trustAsResourceUrl(fileURL);
            window.open($scope.content);
          }
          var params = {
            // 'model': contr.type_person == "Fisica" ? 2 : 3,
            'model': contr.type_person == "Fisica" ? 26 : 26,
            'event': "POST",
            'associated_id': contr.id,
            'identifier': 'generó el PDF.'
          }
          dataFactory.post('send-log/', params).then(function success(response) {

          });
        }
        else{
          toaster.warning("Ocurrió Un problema, Intenta nuevamente");
        }


      })
    }
    $scope.changeSensible = function(sensible, index) {
        uploader.queue[index].formData[0].sensible = sensible;
    }

    $scope.saveFile = function(file) {
      $http.patch(file.url,{'nombre':file.nombre, 'sensible':file.sensible,'name':file.nombre,});
    }

    $scope.status = function(value) {
      switch (value) {
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
        default:
          return 'Pendiente';
      }
    }

    $scope.payment = function(value) {
      switch (value) {
        case 1:
          return 'Mensual';
          break;
        case 2:
          return 'Bimestral';
          break;
        case 3:
          return 'Trimestral';
          break;
        case 4:
          return 'Cuatrimestral';
          break;
        case 5:
          return 'Contado';
          break;
        case 6:
          return 'Semestral';
          break;
        case 12:
          return 'Anual';
          break;
        case 24:
          return 'Quincenal';
          break;
        default:
          return'No especificada';
      }
    }

    $scope.goToPolicyInfo = function(insurance) {
        if(insurance.document_type == 1){
            $state.go('polizas.info', {polizaId: insurance.id})
        } else if(insurance.document_type == 3){
            $state.go('colectividades.info', {polizaId: insurance.id})
        }
    }

    function showPendientes(){
        vm.cPendientes = true;
        vm.cPagados = false;
        vm.cLiquidados = false;
        vm.cCancelados = false;
    }

    function showPagados(){
        vm.cPendientes = false;
        vm.cPagados = true;
        vm.cLiquidados = false;
        vm.cCancelados = false;
    }

    function showLiquidados(){
        vm.cPendientes = false;
        vm.cPagados = false;
        vm.cLiquidados = true;
        vm.cCancelados = false;
    }

    function showCancelados(){
        vm.cPendientes = false;
        vm.cPagados = false;
        vm.cLiquidados = false;
        vm.cCancelados = true;
    }

    vm.showSinPendientes = showSinPendientes;
    vm.showSinTramites = showSinTramites;
    vm.showSinCancelados = showSinCancelados;
    vm.showSinRechazados = showSinRechazados;
    vm.showSinCompletados = showSinCompletados;
    vm.NotasModal = NotasModal;

    vm.sinPendientes = true;
    vm.sinTramites = false;
    vm.sinCancelados = false;
    vm.sinRechazados = false;
    vm.sinCompletados = false;

    function showSinPendientes(){
        vm.sinPendientes = true;
        vm.sinTramites = false;
        vm.sinCancelados = false;
        vm.sinRechazados = false;
        vm.sinCompletados = false;
    }

    function showSinTramites(){
        vm.sinPendientes = false;
        vm.sinTramites = true;
        vm.sinCancelados = false;
        vm.sinRechazados = false;
        vm.sinCompletados = false;
    }

    function showSinCancelados(){
        vm.sinPendientes = false;
        vm.sinTramites = false;
        vm.sinCancelados = true;
        vm.sinRechazados = false;
        vm.sinCompletados = false;
    }

    function showSinRechazados(){
        vm.sinPendientes = false;
        vm.sinTramites = false;
        vm.sinCancelados = false;
        vm.sinRechazados = true;
        vm.sinCompletados = false;
    }

    function showSinCompletados(){
        vm.sinPendientes = false;
        vm.sinTramites = false;
        vm.sinCancelados = false;
        vm.sinRechazados = true;
        vm.sinCompletados = false;
    }

    vm.table = {
      headers: [
        'Afectado',
        'Contratante',
        'Aseguradora',
        'Número de siniestro',
        'Padecimiento',
        'Reclamado',
        'Subramo',
        'Acciones',
        'Número de póliza',
        'Razón'
      ]
    };
    vm.verEndosos = verEndosos;
    $scope.deleteFile = deleteFile;
    $window.localStorage.editCont = false;

    /*Crear Poliza*/
    $scope.goToPolicy = function(data){
      var params = { 'myInsurance': data }
      $state.go('polizas.create', params);
    };

    $scope.goToSurety = function(data){
      var params = { 'myInsurance': data }
      $state.go('fianzas.fianzas', params);
    };

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

    $scope.filterValue = function($event){
      if(isNaN(String.fromCharCode($event.charCode))){
        $event.preventDefault();
      }
    };


    /* Cobranza */
    function verCobranza(param,status) {
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //     // var parUrl = url.IP + 'v2/contratantes/get-cobranza-natural/';
        //     var parUrl = url.IP + 'v2/contratantes/get-cobranza-contractor/';
        var parUrl = url.IP + 'get-cobranza-contractor/';
        vm.polizas = false;
        vm.cobranza = true;
        vm.siniestros = false;
        vm.showInfo = false;
        $http({
          method: 'GET',
          url: parUrl,
          params: {
                'status': status,
                'contratante': param.id
            }
        }).then(function success(response) {
            if(response.status === 200 && response.data.results.length) {
                $scope.results = response.data.results;

                  vm.receipts = [];
                  vm.receipt = {};
                  vm.receipts = response.data.results;
                  vm.receipt = {
                      count: response.data.count,
                      previous: response.data.previous,
                      next: response.data.next
                    };
                  vm.show_pag_policy = true;
                  testPagination('vm.receipts', 'vm.receipt');
          } else {
            toaster.warning("No se encontraron registro")
          }
        })
    }

    $rootScope.changeVendedor = function(data){
      if (vm.form){
        vm.form.vendor = data.url;  
      }
      else{
        vm.juridicalForm.vendor = data.url;
      }
      
    }

    /* Siniestros */
    function verSiniestros(param, status, ramo) {
      $http({
          method: 'GET',
          url: url.IP + 'siniestros-conteos-contractor/',
          params: {
                'contractor': param.id
            }
        }).then(function success(response) {
          vm.conteos = response.data;
        })

        
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //     // var parUrl = url.IP + 'v2/contratantes/get-siniestros-natural/';
        //     var parUrl = url.IP + 'v2/contratantes/get-siniestros-contractor/';
        var parUrl = url.IP + 'get-siniestros-contractor/';

        vm.polizas = false;
        vm.cobranza = false;
        vm.siniestros = true;
        vm.showInfo = false;
        
        $http({
          method: 'GET',
          url: parUrl,
          params: {
                'status': status,
                'contratante': param.id,
                'ramo_number': ramo
            }
        }).then(function success(request) {
            if(request.status === 200 && request.data.results.length) {
                vm.loading = false;
                vm.siniestros = [];
                vm.siniestros_config = {};
                vm.siniestros = request.data.results;
                vm.siniestros_config = {
                  count: request.data.count,
                  previous: request.data.previous,
                  next: request.data.next
                };
                vm.show_pag_policy = true;

                testPagination('vm.siniestros', 'vm.siniestros_config');
          } else {
            toaster.warning("No se encontraron registro")
          }
        })
    }
    vm.changePoliza = changePoliza;
    function changePoliza(par, asc) {
      switch(par) {
        case 1:
          vm.verPolizas($scope.contratante_selected, par, asc);
          vm.pol_number_asc = asc;
          vm.aseguradora_asc = 0;
          vm.subramo_asc = 0;
          vm.estatus_asc = 0;
          vm.vigencia_asc = 0;
          break;
        case 2:
          vm.verPolizas($scope.contratante_selected, par, asc);
          vm.pol_number_asc = 0;
          vm.aseguradora_asc = asc;
          vm.subramo_asc = 0;
          vm.estatus_asc = 0;
          vm.vigencia_asc = 0;
          break;
        case 3:
          vm.verPolizas($scope.contratante_selected, par, asc);
          vm.pol_number_asc = 0;
          vm.aseguradora_asc = 0;
          vm.subramo_asc = asc;
          vm.estatus_asc = 0;
          vm.vigencia_asc = 0;
          break;
        case 4:
          vm.verPolizas($scope.contratante_selected, par, asc);
          vm.pol_number_asc = 0;
          vm.aseguradora_asc = 0;
          vm.subramo_asc = 0;
          vm.estatus_asc = asc;
          vm.vigencia_asc = 0;
          break;
        case 5:
          vm.verPolizas($scope.contratante_selected, par, asc);
          vm.pol_number_asc = 0;
          vm.aseguradora_asc = 0;
          vm.subramo_asc = 0;
          vm.estatus_asc = 0;
          vm.vigencia_asc = asc;
          break;
      }
    }
    /* Polizas */
    function verPolizas(param,order,asc) {
      $scope.contratante_selected = param        
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //     // var parUrl = url.IP + 'v2/contratantes/get-polizas-natural/';
        //     var parUrl = url.IP + 'v2/contratantes/get-polizas-contractor/';
        var parUrl = url.IP + 'get-polizas-contractor/';
        vm.polizas = true;
        vm.cobranza = false;
        vm.siniestros = false;
        vm.showInfo = false;
        $http({
          method: 'GET',
          url: parUrl,
          params: {
                'contratante': param.id,
                'order': order,
                'asc': asc,
            }
        }).then(function success(request) {

                vm.search_results = [];
                vm.ot_results = [];

                if((request.status === 200 || request.status === 201) && request.data.results.length) {
                  vm.show_results = true;
                  vm.show_policy = false;
                  var data = request.data.results;
                  data.forEach(function(item) {
                    // if(item.status == 1 || item.status == 2) {
                    //   vm.ot_results.push(item);
                    // }
                    // else{
                    //   vm.search_results.push(item);
                    // }
                    vm.search_results.push(item);
                  });
                  vm.search_config = {
                    count: request.data.count,
                    previous: request.data.previous,
                    next: request.data.next
                  };
                  vm.show_pag_search = true;
                  testPagination('vm.search_results', 'vm.search_config');
                } else {
                  toaster.warning("No se encontraron registros");
                }
        })
    }
    /* Notas de credito */
    function NotasModal(receipt) {
      var insurance = receipt;
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/cobranzas/notaCredito.modal.html',
        controller: 'NotaCreditoCtrl',
        size: 'lg',
        resolve: {
          receipt: function() {
            return receipt;
          },
          insurance: function() {
            return insurance;
          },
          from: function(){
            return null;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */ 
        keyboard: false
      });
      modalInstance.result.then(function(receipt) {
        vm.receipts.splice(index, 1);
        activate();
      });
    }

    function ramo_changed() {
      if(vm.form){
        verSiniestros(vm.form,1, vm.ramos.ramo_selected);
      } else{
        verSiniestros(vm.juridicalForm, 1, vm.ramos.ramo_selected);
      }
    }

    function getSinister(ramo, status) {
      if(vm.form){
        verSiniestros(vm.form,status, ramo);
      } else{
        verSiniestros(vm.juridicalForm, status, ramo);
      }
    }

    /* Endosos */
    function verEndosos(param, status, ramo) {
      // body...
    }

    vm.activityLog = false;
    $scope.log_data = [];

    $scope.goToLog = function(){
      if(vm.form){
        $scope.log_data.id = vm.form.id;
        $scope.log_data.type_person = 26;
      }
      else{
        $scope.log_data.id = vm.juridicalForm.id;
        $scope.log_data.type_person = 26;
      }

      vm.showInfo = false;
      vm.activityLog = true;

      $http({
          method: 'GET',
          url: url.IP+'get-specific-log/',
          params: {
            'associated_id': $scope.log_data.id,
            'model': $scope.log_data.type_person
          }
        })
        .then(function(request) {
          $scope.log_info = request.data;
        })
        .catch(function(e) {
          console.log('e', e);
        });
    };

    function testPagination(parModel, parConfig) {
      var config_ = $parse(parConfig)($scope);
      if(config_) {
        var pages = Math.ceil(config_.count / 10);
      }
      $scope.totalPages = [];
      var count_items = 0;
      var count_pages = 0;

      var previous_array = [];
      var next_array = [];

      $scope.start = 0;
      $scope.end = 5;
      $scope.actual_page = 1;
      $scope.not_prev = true;

      for (var i = 0; i < pages; i++) {
        $scope.totalPages.push(i+1);
      }

      $scope.lastPage = function() {
        // TODO: ultimo bloque
        if($scope.totalPages.length > 5) {
          $scope.end = $scope.totalPages.length;
          $scope.start = ($scope.totalPages.length) -5;
          $scope.show_prev_block = true;
        }

        $scope.selectPage($scope.totalPages.length);

        $scope.actual_page = $scope.totalPages.length;

      }

      $scope.selectPage = function (parPage) {


        if(config_.next || config_.previous) {

          if(config_.next) {
            var next_ = config_.next;

            var otherParameters = config_.next.substring(config_.next.indexOf("&page=") + 6);

            if(next_.search('&status=') !== -1) {
              var status = next_.substring(next_.indexOf("&status=") + 1);
            } else {
              var status = '';
            }

            var url = config_.next.substring(0, config_.next.indexOf("&page=") + 6);
            url += parPage.toString();
            url += '&'+status

            if(config_.next.search('&') !== -1) {
              var params = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
              url += '&'+params;
            }

          } else {



            var prev_ = config_.previous;
            var otherParameters = prev_.substring(prev_.indexOf("&page=") + 6);
            if(prev_.search('&status=') !== -1) {
              var status = prev_.substring(prev_.indexOf("&status=") + 1);
            } else {
              var status = '';
            }

            if(prev_.search('&page=') !== -1) {
              var url = prev_.substring(0, prev_.indexOf("&page=") + 6);
              url += parPage.toString();
              url += '&'+status;



            } else {
              var url = config_.previous
            }
            if(config_.prev_.search('&') !== -1) {
              var params = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
            url += '&'+params;
            }
          }
        }

        // url += '&status=1'
        getCobranzaPag(url);
        $scope.actual_page = parPage;
        if($scope.actual_page > 1) {
          $scope.not_prev = false;
        }

        if($scope.actual_page == $scope.totalPages.length -1) {
          $scope.not_next = true;
        }

      };

      $scope.previousBlockPages = function(param) {
        if(param) {
          if($scope.start < $scope.actual_page) {
            $scope.start = $scope.start - 1 ;
            $scope.end = $scope.end - 1;
          }

        } else {
          $scope.start = $scope.start - 5 ;
          $scope.end = $scope.end - 5;

          if($scope.end < $scope.totalPages.length) {
              $scope.not_next = false;
          }
        }

        if($scope.end <= 5) {
          $scope.start = 0;
          $scope.end = 5;
          $scope.show_prev_block = false;
        }
      }

      $scope.nextBlockPages = function(param) {
        $scope.show_prev_block = true;

        if(param) {
          if($scope.end > $scope.actual_page) {
            $scope.start = $scope.start + 1 ;
            $scope.end = $scope.end + 1;
          }
        } else {
          if($scope.end < $scope.totalPages.length) {
            $scope.start = $scope.start + 5 ;
            $scope.end = $scope.end + 5;

            if($scope.end == $scope.totalPages.length) {
                $scope.not_next = true;
            }
          } else {
            $scope.not_next = true;
          }
        }

      }

      function getCobranzaPag(parUrl) {
        $http.get(parUrl)
        .then(
          function success(request) {
            var source = $parse(parModel);
            source.assign($scope, []);
            source.assign($scope, request.data.results);

            var data = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            }
          var config = $parse(parConfig);
            config.assign($scope, []);
            config.assign($scope, data);

          },
          function error(error) {
            console.log('error', error);
          }
        )
        .catch(function(e) {
          console.log('e', e);
        });
      };

    }

    function goToContractorEdit(person) {
          $state.go('fianzas.pprovedit', {
              type: checkType(person.type_person),
              contratanteId: person.id
          });
        }

    function showNotas() {
          vm.notasFlag = true;
        }

    function checkType(type) { //jshint ignore:line
        return (type === 1) ? 'fisicas' : 'morales';
    }

    function uploadImages() {
      // if ($stateParams.type === 'fisicas') {
      //     $scope.userInfo = {
      //         id: vm.form.id,
      //         type_person: 'contractors'
      //     };
      // } else {
      //     $scope.userInfo = {
      //         id: vm.juridicalForm.id,
      //         type_person: 'contractors'
      //     };
      // }
      $scope.userInfo = {
        id: vm.form ? vm.form.id : vm.juridicalForm.id,
        type_person: 'contractors'
      };
      // Upload files
      // $scope.userInfo.url = $scope.uploader.url = url.IP + helpers.checkType($scope.userInfo.type_person) + '/' + $scope.userInfo.id + '/archivos/';
      $scope.userInfo.url = $scope.uploader.url = url.IP + 'contractors/' + $scope.userInfo.id + '/archivos/';

      $scope.uploader.uploadAll();
      // toaster.success(MESSAGES.OK.UPLOADFILES);
    }

    var uploader = $scope.uploader = new FileUploader({

        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        },
    });

    // uploader.filters.push({
    //     name: 'customFilter',
    //     fn: function(item /*{File|FileLikeObject}*/ , options) {
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

    uploader.onAfterAddingFile = function(item) {
        //var fl = new FileUploader.FileItem();
        /*
        Object.defineProperty(item._file, 'name',{
            value : item.file.name,
            writable : true
        });

        var fileExtension = '.' + item.file.name.split('.').pop();

        item.file.name = Math.random().toString(36).substring(7) + new Date().getTime() + fileExtension;*/
        item.formData.push({
            arch: item._file,
            name: ''
                // owner: $scope.userInfo.id
        });
    };

    uploader.onBeforeUploadItem = function(item) {
        item.url = $scope.userInfo.url;
        item.formData[0].name = item.file.name;
        item.alias = '';
        item.formData[0].owner = $scope.userInfo.id;
    };

    vm.person = {};
    vm.cancel = cancel;
    vm.save = save;
    vm.save_moral = save_moral;

    // Modals
    vm.openModalDeleteContratantes = openModalDeleteContratantes;
    vm.deleteContractor = deleteContractor

    // Groups
    vm.groups = [];
    vm.openModalGroup = openModalGroup;
    vm.openModalClasification = openModalClasification;
    vm.openModalCelulaContractor = openModalCelulaContractor;
    vm.openModalAsignacion = openModalAsignacion;

    // Contacts
    vm.addContact = addContact;
    vm.deleteContacts = deleteContacts;

    // Addresses
    vm.addresses = {
        add: addAddress,
        selectedState: selectedState,
        delete: deleteAddress
    };

    function deleteFile(file) {
        var url = vm.form ? vm.form.url : vm.juridicalForm.url;
        fileService.deleteFile(file, vm.files);
    }

    function addAddress(type) {
        // HACK remove before production
        var address = {
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
            composed: ''
        };
        if (type === 1){
          vm.form.userAddresses.push(address);
        }else{
          vm.juridicalForm.userAddresses.push(address);
        }
    }

    function deleteContractor(id, selector) {
      swal({
        title: "¿Estás seguro?",
        text: "¿Desea eliminar el contratante?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, estoy seguro.",
        cancelButtonText: "Cancelar",
        closeOnConfirm: false,
        closeOnCancel: false
      },
      function(isConfirm) {
        if (isConfirm) {
          var data_email = {
            id: id,
            model: 3,
            type_person: selector,
          }
          $http.post(url.IP + 'delete-contractor/',{'id':id, 'selector': selector}).then(function(response) {
            if(response.data.status === 'error'){
              SweetAlert.swal("No se puede eliminar", MESSAGES.WARNING.WARNINGCONTRACTOR, "info");
              return
            }
            else{
              $http.patch($scope.contractor.url,{'is_active': false}).then(function(response) {
                if(response.status === 200 || response.status === 201){
                  var params = {
                    'model': $scope.contractor.type_person == 1 ? 26 : 26,
                    'event': "POST",
                    'associated_id': $scope.contractor.id,
                    'identifier': "elimino el contratante"
                  }
                  dataFactory.post('send-log/', params).then(function success(response) {
                    
                  });                  
                  dataFactory.post('send-email-admins-deletes/', data_email).then(function success(req) {

                  });
                  SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETECONTRATANTE, "success");
                  $state.go('fianzas.pprovlist');
                }
              });
            }
          });
        } else {
          SweetAlert.swal("Cancelado", MESSAGES.INFO.CANCELCONTRACTOR, "error");
        }
      });
    }

    function deleteAddress(index, type) {
      $localStorage.aindex = index;
      $localStorage.atype = type;
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/contratantes/contratantes.deleteAddress.html',
        controller: ModalInstanceCtrlDeleteAddress,        
        backdrop: 'static', /* this prevent user interaction with the background */ 
        keyboard: false
        //windowClass: 'animated fadeIn'
      });
    }

    vm.emails = {
      add: addEmail,
      delete: deleteEmail
    };

    vm.emailToSend = [];
    vm.toDeleteEmails = [];

    function addEmail(type) {
      if(type === 1){
        vm.form.correo = "";
        var addEmails = {
          correo: vm.form.correo,
          email_type: 0
        };
        vm.form.email_natural.push(addEmails);
      }
      else{
        vm.juridicalForm.correo = "";
        var addEmails = {
          correo: vm.juridicalForm.correo,
          email_type: 0
        };
        vm.juridicalForm.email_juridical.push(addEmails);
      }
    }
    function deleteEmail(index, type, item) {
      if (type === 1) {
        vm.form.email_natural.splice(index, 1);
        vm.toDeleteEmails.push(item)
      }
      else{
        vm.juridicalForm.email_juridical.splice(index, 1);
        vm.toDeleteEmails.push(item)
      }
    }
    $scope.sendEmails = function(id, typePerson){
      if(typePerson == 1){
        $scope.origin_email = angular.copy(vm.form.email_natural)
        if(vm.form.email_natural){
          for(var i=0; i<vm.form.email_natural.length; i++){
            if(!vm.form.email_natural[i].url){
              vm.correo = {
                correo: vm.form.email_natural[i].correo,
                juridical: null,
                // natural: vm.form.url,
                contractor: vm.form.url,
                email_type: vm.form.email_natural[i].email_type ? vm.form.email_natural[i].email_type : 1
              };
              vm.emailToSend.push(vm.correo);
            }
            else{
              $http.patch(vm.form.email_natural[i].url, vm.form.email_natural[i]).then(function success(request){
                
              }).catch(function(e){
                console.log(e);
              });
            }
          }
        }
      }
      else{
        if(vm.juridicalForm.email_juridical){
          for(var i=0; i<vm.juridicalForm.email_juridical.length; i++){
            if(!vm.juridicalForm.email_juridical[i].url){
              vm.correo = {
                correo: vm.juridicalForm.email_juridical[i].correo,
                // juridical: vm.juridicalForm.url,
                contractor: vm.juridicalForm.url,
                natural: null,
                email_type: vm.juridicalForm.email_juridical[i].email_type ? vm.juridicalForm.email_juridical[i].email_type : 1
              };
              vm.emailToSend.push(vm.correo);
            }
            else{
              $http.patch(vm.juridicalForm.email_juridical[i].url, vm.juridicalForm.email_juridical[i]).then(function success(request){
                
              }).catch(function(e){
                console.log(e);
              });
            }
          }
        }
        
      }

      vm.toDeleteEmails.forEach(function(del) {
        if(del.url){
          $http.delete(del.url);

          $scope.changes = [];
          
          var change_log = {
            name: 'Correos Electrónicos',
            origin: del.correo,
            change: ''
          }
          $scope.changes.push(change_log);

          var paramsRec = {
            'model': 26,
            'event': "PATCH",
            'associated_id': $scope.origin_contractor.id,
            'identifier': " actualizó el contratante.",
            'change': $scope.changes
          }
          
          if($scope.changes.length > 0){
            dataFactory.post('send_log_specific/', paramsRec).then(function success(response){

            });
          }
        }
      })

      $http.post(url.IP + 'emails/', vm.emailToSend)
      .then(
        function success(request){
          vm.form = {
            email :'',
            phone : ''
          };
          vm.form.email = request.data;
          $scope.changes = [];
          
          for(var i = 0; i < request.data.length; i++){
            var change_log = {
              name: 'Correos Electrónicos',
              origin: '',
              change: request.data[i].correo
            }
            $scope.changes.push(change_log);
            if((i+1) == request.data.length){
              var paramsRec = {
                'model': 26,
                'event': "PATCH",
                'associated_id': $scope.origin_contractor.id,
                'identifier': " actualizó el contratante.",
                'change': $scope.changes
              }

              if($scope.changes.length > 0){
                dataFactory.post('send_log_specific/', paramsRec).then(function success(response){

                });
              }
            }
          }

        },
        function error(error) {
          console.log(error);
        })
      .catch(function(e){
        console.log(e);
      });
    }

    $rootScope.changeGroup = function(data){
      if (data) {
        if (data.id) {
          dataFactory.post('subgrupos-match/', { parent: data.id })
          .then(function(subgrupos_) {
            vm.subgroups = subgrupos_.data;
          });        
        }else{
          if(data){
            if(data.subgrupos){
              vm.subgroups = data.subgrupos;
            }else{
              vm.subgroups = [];
            }
          }else{vm.subgroups = [];}        
        }
      }else{vm.subgroups = [];}  
    }

    $rootScope.changeSubGroup = function(data){
      // if (data) {
      //   if (data.id) {
      //     dataFactory.post('subsubgrupos-match/', { parent: data.id })
      //     .then(function(subgrupos_2) {
      //         $scope.sub_subgroups = subgrupos_2.data;
      //     });        
      //   }else{
          if(data){
            if(data.subsubgrupos){
              vm.sub_subgroups = data.subsubgrupos;
            }else{
              vm.sub_subgroups = [];
            }
          }else{vm.sub_subgroups = [];}        
      //   }
      // }else{$scope.sub_subgroups = [];}       
    }

    $rootScope.changeAgrupacion2 = function(data){
      // $scope.sub_asignaciones = data.subgrupos;
      if (data) {
        if (data.id) {
          dataFactory.post('subagrupaciones-match/', { parent: data.id })
          .then(function(subgrupos_) {
            $scope.sub_asignaciones = subgrupos_.data;
          }); 
          $scope.sub_subasignaciones = [];       
        }else{
          if(data){
            if(data.subgrupos){
              $scope.sub_asignaciones = data.subgrupos;
            }else{
              $scope.sub_asignaciones = [];
            }
          }else{$scope.sub_asignaciones = [];}        
        }
      }else{$scope.sub_asignaciones = [];} 
    }

    $rootScope.changeSubagrupacion2 = function(data){
      if(data){
        if(data.subsubgrupos){
          $scope.sub_subasignaciones = data.subsubgrupos;
        }else{
          if(data.subgrupos){
            $scope.sub_subasignaciones = data.subgrupos;
          }else{
            $scope.sub_subasignaciones = [];
          }
        }
      }else{
        $scope.sub_subasignaciones = [];
      } 
    }

    vm.phones = {
      add: addPhone,
      delete: deletePhone
    };

    vm.phoneToSend = [];
    vm.toDeletePhones = [];

    function addPhone(type) {
      if (type === 1) {
        var addPhones = {
          phone: vm.form.phone,
          phone_type: 0
        };
        vm.form.phone_natural.push(addPhones);
      } else {
        var addPhones = {
          phone: vm.juridicalForm.phone,
          phone_type: 0
        };
        vm.juridicalForm.phone_juridical.push(addPhones);
      }
    }
    function deletePhone(index, type, item) {
      if (type === 1) {
        vm.form.phone_natural.splice(index, 1);
        vm.toDeletePhones.push(item)
      } else {
        vm.juridicalForm.phone_juridical.splice(index, 1);
        vm.toDeletePhones.push(item)
      }
    }
    $scope.sendPhones = function(id, typePerson){
      if(typePerson == 1){
        if(vm.form.phone_natural){
          for(var i=0; i<vm.form.phone_natural.length; i++){
            if(!vm.form.phone_natural[i].url){
              vm.telefono = {
                phone: vm.form.phone_natural[i].phone,
                juridical: null,
                // natural: vm.form.url,
                contractor: vm.form.url,
                phone_type: vm.form.phone_natural[i].phone_type ? vm.form.phone_natural[i].phone_type : 1
              };
              vm.phoneToSend.push(vm.telefono);
            }
            else{
              $http.patch(vm.form.phone_natural[i].url, vm.form.phone_natural[i]).then(function success(request){
                
              }).catch(function(e){
                console.log(e);
              });
            }
          }
        }
      }
      else{
        if(vm.juridicalForm.phone_juridical){
          for(var i=0; i<vm.juridicalForm.phone_juridical.length; i++){
            if(!vm.juridicalForm.phone_juridical[i].url){
              vm.telefono = {
                phone: vm.juridicalForm.phone_juridical[i].phone,
                // juridical: vm.juridicalForm.url,
                contractor: vm.juridicalForm.url,
                natural: null,
                phone_type: vm.juridicalForm.phone_juridical[i].phone_type ? vm.juridicalForm.phone_juridical[i].phone_type : 1
              };
              vm.phoneToSend.push(vm.telefono);
            }
            else{
              $http.patch(vm.juridicalForm.phone_juridical[i].url, vm.juridicalForm.phone_juridical[i]).then(function success(request){
                
              }).catch(function(e){
                console.log(e);
              });
            }
          }
        }
      }

      vm.toDeletePhones.forEach(function(phone) {
        if(phone.url){
          $http.delete(phone.url);
        }
      })

      $http.post(url.IP + 'phones/', vm.phoneToSend)
      .then(
        function success(request){
          vm.form = {
            phone : request.data
          }
        },
        function error(error) {
          console.log(error);
        })
      .catch(function(e){
        console.log(e);
      });
    }

    vm.closeDropdown = closeDropdown;

    function closeDropdown(){
      $('.hasDropdown').removeClass('open');
    };

    function ModalInstanceCtrlDeleteAddress($scope, $uibModalInstance) {
        var index = $localStorage.aindex;
        var type = $localStorage.atype;
        $scope.ok = function() {
            if (!index && index != 0) {
                if (type === 1) {
                    vm.form.userAddresses.splice(index, 1);
                } else {
                    vm.juridicalForm.userAddresses.splice(index, 1);
                }

            } else {
                try {
                    if (type === 1) {
                        if(vm.form){
                          var obj = vm.form.userAddresses[index]
                          generalService.deleteService(obj);
                          vm.form.userAddresses.splice(index, 1)
                        } else {
                          generalService.deleteService(vm.juridicalForm.userAddresses[index]);
                          vm.juridicalForm.userAddresses.splice(index, 1);
                        }
                    } else {
                        generalService.deleteService(vm.juridicalForm.userAddresses[index]);
                        vm.juridicalForm.userAddresses.splice(index, 1);
                    }
                    toaster.success(MESSAGES.OK.DELETEADDRESS);
                    $uibModalInstance.dismiss('cancel');
                } catch (err) {
                    if (type === 1) {
                        if(vm.form){
                          vm.form.userAddresses.splice(index, 1);
                        } else {
                          vm.juridicalForm.userAddresses.splice(index, 1);
                        }
                    } else {
                        vm.juridicalForm.userAddresses.splice(index, 1);
                    }
                }
            }
            $uibModalInstance.dismiss('cancel');
        };

        $scope.cancel = function() {
            if ($uibModalInstance)
                $uibModalInstance.dismiss('cancel');
        };
    }

    var obligados1 = {
      obligado: {}
    };
    $scope.addObligados = function(type) {
      if(type === 1){
        var addobligadoss = {
          obligado: obligados1,
        };
        if(vm.form){
          vm.form.obligados.push(addobligadoss);
        }
      }else{        
        var addobligadoss = {
          obligado: obligados1,
        };
        if(vm.juridicalForm){
          vm.juridicalForm.obligados.push(addobligadoss);
        }
      }
    }
    $scope.deleteObligados= function(index, type) {
      if (type === 1) {
        vm.form.obligados.splice(index, 1);
      } else {
        vm.juridicalForm.obligados.splice(index, 1);
      }
    }
    $scope.addResponsable = function(type) {
      if(type === 1){
        var addresponsables = {
          responsables: vm.form.responsable,
          resp_type : 0
        };
        vm.form.resp_contractor.push(addresponsables);
      }
      else{
        var addresponsables = {
          responsables: vm.juridicalForm.responsable ? vm.juridicalForm.responsable: null,
          resp_type : 0
        }
        vm.juridicalForm.resp_contractor.push(addresponsables);
      }
    }

    $scope.deleteResponsable = function(index, type) {
      if (type === 1) {

          if (vm.form.resp_contractor[index].url){
            $http.delete(vm.form.resp_contractor[index].url);
          }
        
          vm.form.resp_contractor.splice(index, 1);
        } else {
          if (vm.juridicalForm.resp_contractor[index].url){
            $http.delete(vm.juridicalForm.resp_contractor[index].url);
          }
          vm.juridicalForm.resp_contractor.splice(index, 1);
        }
            
    }



    function selectedState(selected, index, type) {
        if (type === 1) {
            vm.form.userAddresses[index].city = '';
            vm.form.userAddresses[index].citiesList = selected.cities;
        } else {
            vm.juridicalForm.userAddresses[index].city = '';
            vm.juridicalForm.userAddresses[index].citiesList = selected.cities;
        }
    }    

    if ($stateParams.type === 'fisicas') vm.form = {};
    else vm.juridicalForm = {};

    vm.emptyOrNull = function(item) {
        return !(item === null || item.trim().length === 0);
    };
    vm.contratanteId = $stateParams.contratanteId;

    activate();
    $scope.sucursal = function (sc) {
              
    }
    function activate() {

      dataFactory.get('sucursales-to-show-unpag/')
        .then(function success(response) {
          $scope.sucursalList = response.data;
      })

      $http.get(url.IP + 'get-vendors').then(function success(request) {
        vm.vendors = request.data;
        vm.vendors.forEach(function(vendor) {
          vendor.name = vendor.first_name + ' ' + vendor.last_name;
        });
      });

      $http.get(url.IP + 'usuarios/')
      .then(function(user) {
        vm.responsables  = user.data.results;
      });
      
      $http({
        method: 'GET',
        url: url.IP+'comments/',
        params: {
            'model': 2,
            'id_model': vm.contratanteId
        }
      })
      .then(function(request) {
        vm.comments_data = request.data.results;
        vm.comments_config = {
            count: request.data.count,
            next: request.data.next,
            previous: request.data.previous
        };
      })
      .catch(function(e) {
          console.log('e', e);
      });

      $http.get(url.IP + 'classification/')
      .then(function(response) {
        vm.clasifications = response.data.results;
      });
      $http.post(url.IP + 'celula_contractor_info/')
      .then(function(response) {
        vm.celulas = response.data;
      });

      $http.get(url.IP + 'groupingLevel-resume/')
      .then(function(response) {
        vm.agrupaciones = response.data
      });


        $window.localStorage.editCont = true;
        groupService.getGroups()
        .then(function(groups) {
          vm.groups = groups;
        });

        $scope.view_siniestros = true

        ContratanteService.getContratanteFull($stateParams)
            .then(function(contractor) {
              $scope.origin_contractor = angular.copy(contractor);
              console.log("1683",contractor)    
              $scope.contractor = contractor;
              $stateParams.contractor = contractor; 
              var contractor = $scope.contractor;
              if (contractor.type_person == 2) {
                 $scope.infoMoral = contractor;
                  vm.listDocument = [
                    {id: 1, name: 'Acta Constitutiva',value : contractor.constitutive_act,file: false,arch: {}},
                    {id: 2, name: 'RFC',value : contractor.rfc_document,file: false,arch: {}},
                    {id: 3, name: 'Cédula de Identificación Fiscal',value: contractor.card_official_identification,file: false,arch: {}},
                    {id: 4, name: 'Comprobante de Domicilio Fiscal',value: contractor.voucher_of_address,file: false,arch: {}},
                    {id: 5, name: 'Modificaciones al Acta Constitutiva',value: contractor.modifications_constitutive_act,file: false,arch: {}},
                    {id: 6, name: 'Poder',value: contractor.fiscal_power,file: false,arch: {}},
                  ];
                  if (contractor.only_sureties) {                    
                    vm.listDocument.push(
                      {id: 7, name: 'Currículo reciente',value : contractor.curriculo, file: false,arch: {}},
                      {id: 8, name: 'Contrato multiple de la afianzadora',value : contractor.contrato_multiple_afianzadora, file: false,arch: {}},
                      {id: 9, name: 'Carta Buró',value : contractor.carta_buro, file: false,arch: {}},
                      {id: 10, name: 'Cuestionario o entrevista',value : contractor.entrevista_afianzadora, file: false,arch: {}},
                      {id: 11, name: 'Aviso de privacidad de la afianzadora',value : contractor.aviso_privacidad, file: false,arch: {}},
                      {id: 12, name: 'Protocolizaciones',value : contractor.protocolizaciones, file: false,arch: {}},
                      {id: 13, name: 'Alta de empresa ante hacienda',value : contractor.alta_hacienda, file: false,arch: {}},
                      {id: 14, name: 'Cambio de domicilio ante hacienda',value : contractor.cambio_domicilio_hacienda, file: false,arch: {}},
                      {id: 15, name: 'Copia del comprobante de inscripción para la e.firma (firma electrónica)',value : contractor.cambio_domicilio_hacienda, file: false,arch: {}},
                      {id: 16, name: 'Declaración anual completa con cadena, de los últimos dos años',value : contractor.declaracion_anual, file: false,arch: {}},
                      {id: 17, name: 'Estados financieros dictaminados cuadernillo completo, del año inmediato anterior',value : contractor.estados_financieros_anuales, file: false,arch: {}},
                      {id: 18, name: 'Estados financieros parciales los más recientes de este año con no mayor antigüedad de dos meses',value : contractor.estados_financieros_parciales, file: false,arch: {}},                
                      {id: 19, name: 'Escritura de inmueble',value : contractor.escritura_inmueble, file: false,arch: {}},
                      {id: 20, name: 'Boleta predial o avaluó',value : contractor.boleta_predial, file: false,arch: {}},
                      {id: 21, name: 'Certificado de libertad de gravamen',value : contractor.certificado_gravamen, file: false,arch: {}}
                    );
                  }
              }
              if (contractor.type_person == 1) {
                $scope.infoFisico = contractor;
                if (vm.org_name == 'ancora') {
                  vm.listDocument = [
                    {id: 1, name: 'Identificación Oficial',value : contractor.card_official_identification,file: false,arch: {}},
                    {id: 2, name: 'CURP',value : contractor.CURP,file: false,arch: {}},
                    {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value: contractor.voucher_efirm,file: false,arch: {}},
                    {id: 4, name: 'Comprobante de Domicilio',value: contractor.voucher_of_address,file: false,arch: {}},
                    {id: 5, name: 'Formato de Identificación de Cliente Firmado',value: contractor.signed_format_ic,file: false,arch: {}},
                  ];
                  if (contractor.only_sureties) {
                    vm.listDocument.push(
                      {id: 7, name: 'Carta nombramiento',value : contractor.carta_nombramiento, file: false,arch: {}},
                      {id: 8, name: 'Currículo',value : contractor.curriculo, file: false,arch: {}},
                      {id: 9, name: 'Contrato multiple de la afianzadora',value : contractor.contrato_multiple_afianzadora, file: false,arch: {}},
                      {id: 10, name: 'Carta buro',value : contractor.carta_buro, file: false,arch: {}},
                      {id: 11, name: 'Entrevista con la afianzadora',value:contractor.entrevista_afianzadora, file:false,arch: {}},
                      {id: 12, name: 'RFC',value : contractor.rfc_document, file: false,arch: {}},
                      {id: 13, name: 'Recibos de nomina',value : contractor.recibos_nomina, file: false,arch: {}},
                      {id: 14, name: 'Declaración anual completa con cadena de los últimos dos años inmediatos anteriores',value : contractor.declaracion_anual, file: false,arch: {}},
                      {id: 15, name: 'Estados financieros anuales del año inmediato anterior',value : contractor.estados_financieros_anuales, file: false,arch: {}},
                      {id: 16, name: 'Estados financieros parciales, los mas recientes, con una antigüedad no mayor a 2 años',value : contractor.estados_financieros_parciales, file: false,arch: {}},
                      {id: 17, name: 'Alta ante hacienda o alta electrónica',value : contractor.alta_hacienda, file: false,arch: {}},
                      {id: 18, name: 'Escritura de inmueble',value : contractor.escritura_inmueble, file: false,arch: {}},
                      {id: 19, name: 'Boleta predial o avaluó',value : contractor.boleta_predial, file: false,arch: {}},
                      {id: 20, name: 'Certificado de libertad de gravamen',value : contractor.certificado_gravamen, file: false,arch: {}}
                    );
                  }                  
                }else{                  
                  vm.listDocument = [
                    {id: 1, name: 'Identificación Oficial',value : contractor.card_official_identification,file: false,arch: {}},
                    {id: 2, name: 'CURP',value : contractor.CURP,file: false,arch: {}},
                    {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value: contractor.voucher_efirm,file: false,arch: {}},
                    {id: 4, name: 'Comprobante de Domicilio',value: contractor.voucher_of_address,file: false,arch: {}},
                    {id: 5, name: 'Formato de Identificación de Cliente Firmado',value: contractor.signed_format_ic,file: false,arch: {}},
                    {id: 6, name: 'Poder',value: contractor.fiscal_power,file: false,arch: {}},
                  ];
                  if (contractor.only_sureties) {
                    vm.listDocument.push(
                      {id: 7, name: 'Carta nombramiento',value : contractor.carta_nombramiento, file: false,arch: {}},
                      {id: 8, name: 'Currículo',value : contractor.curriculo, file: false,arch: {}},
                      {id: 9, name: 'Contrato multiple de la afianzadora',value : contractor.contrato_multiple_afianzadora, file: false,arch: {}},
                      {id: 10, name: 'Carta buro',value : contractor.carta_buro, file: false,arch: {}},
                      {id: 11, name: 'Entrevista con la afianzadora',value:contractor.entrevista_afianzadora, file:false,arch: {}},
                      {id: 12, name: 'RFC',value : contractor.rfc_document, file: false,arch: {}},
                      {id: 13, name: 'Recibos de nomina',value : contractor.recibos_nomina, file: false,arch: {}},
                      {id: 14, name: 'Declaración anual completa con cadena de los últimos dos años inmediatos anteriores',value : contractor.declaracion_anual, file: false,arch: {}},
                      {id: 15, name: 'Estados financieros anuales del año inmediato anterior',value : contractor.estados_financieros_anuales, file: false,arch: {}},
                      {id: 16, name: 'Estados financieros parciales, los mas recientes, con una antigüedad no mayor a 2 años',value : contractor.estados_financieros_parciales, file: false,arch: {}},
                      {id: 17, name: 'Alta ante hacienda o alta electrónica',value : contractor.alta_hacienda, file: false,arch: {}},
                      {id: 18, name: 'Escritura de inmueble',value : contractor.escritura_inmueble, file: false,arch: {}},
                      {id: 19, name: 'Boleta predial o avaluó',value : contractor.boleta_predial, file: false,arch: {}},
                      {id: 20, name: 'Certificado de libertad de gravamen',value : contractor.certificado_gravamen, file: false,arch: {}}
                    );
                  }   
                }
              }

              $http({
                method: 'GET',
                url: url.IP + 'notas-by-contractor/',
                params: {
                  contractor: contractor.id,
                  type_contractor: contractor.type_person === 1 ? 'natural' : 'juridical'
                }
              }).then(function success(response) {
                vm.notas = response.data;
              })
              if(contractor.bound_solidarity_many){
                if (contractor.bound_solidarity_many.length >0) {
                  $scope.solidarios = [];
                  contractor.bound_solidarity_many.forEach(function(cons){                  
                    $http.get(cons)
                    .then(function(request) {
                      $scope.solidarios.push(angular.copy(request.data))
                    });
                  });
                }
              }
              if(contractor.bound_solidarity){
                if(contractor.bound_solidarity){
                  $scope.url_solidario = contractor.bound_solidarity;
                }
                $http.get($scope.url_solidario)
                .then(function(request) {
                  $scope.solidario = angular.copy(request.data)

                  vm.contratante = {};
                  if(request.data.address_contractor){
                    vm.contratante.val = request.data.full_name;
                    vm.contratante.value = request.data;
                  }else{
                    vm.contratante.val = request.data.full_name;
                    vm.contratante.value = request.data;
                  }
                });
              }
              if(contractor.classification){
                $http.get(contractor.classification)
                .then(function(request) {
                  if (contractor.type_person === 1) {
                    vm.form.classification = request.data.url;
                    // $scope.infoFisico.classification = request.data;
                    $scope.infoFisicoc = request.data;
                  } else {
                    vm.juridicalForm.classification = request.data.url;
                    $scope.infoMoralc = request.data;
                    // vm.juridicalForm.clasification = request.data;
                    // vm.clasifications.forEach(function(item){
                    //   if(item.url == vm.juridicalForm.classification.url){
                    //   }
                    // });
                  }
                });
              }


              contractor.cellule = contractor.cellule
              if(contractor.cellule){
                $http.get(contractor.cellule)
                .then(function(request) {
                  if (contractor.type_person === 1) {
                    vm.form.celula = request.data.url;
                    $scope.infoFisicocel = request.data;
                  } else {
                    vm.juridicalForm.cellule = request.data;
                    vm.celulas.forEach(function(item){
                      if(item.url == vm.juridicalForm.cellule.url){
                        vm.juridicalForm.cellule = item.url;
                        $scope.infoMoralcel = request.data;
                      }
                    });
                  }
                });
              }
              contractor.groupinglevel = contractor.groupinglevel
              if(contractor.groupinglevel){
                $http.get(contractor.groupinglevel)
                .then(function(data) {
                  if(data.data.type_grouping == 3){
                    $http.get(data.data.parent)
                    .then(function(subgroup) {
                      if(subgroup.data.type_grouping == 2){
                        $http.get(subgroup.data.parent)
                        .then(function(group) {
                          var groupInfo = {
                              group_name: group.data.description,
                              subgroup_name: subgroup.data.description,
                              subsubgroup_name: data.data.description
                          };
                          if (contractor.type_person === 1) {
                              vm.form.grouping_level = groupInfo;
                          } else {
                              vm.juridicalForm.grouping_level = groupInfo;
                          }
                          $http.get(url.IP + 'groupingLevel-resume/')
                          .then(function(response) {
                            vm.agrupaciones = response.data
                            vm.agrupaciones.forEach(function(item){
                              if(item.url == group.data.url){
                                vm.editForm.grouping_level = item;
                                $rootScope.changeAgrupacion2(item);
                                item.subgrupos.forEach(function(sub){
                                  if(sub.url == subgroup.data.url){
                                    vm.editForm.subagrupaciones = sub;
                                    $rootScope.changeSubagrupacion2(sub);
                                    sub.subsubgrupos.forEach(function(subsub){
                                      if(subsub.url == data.data.url){
                                        vm.editForm.subsubasignaciones = subsub;
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          });                          
                        });
                      }
                    });
                  }else{
                    if(data.data.type_grouping == 2){
                        $http.get(data.data.parent)
                        .then(function(group) {
                          var groupInfo = {
                            group_name: group.data.description,
                            subgroup_name: data.data.description,
                          };
                          if (contractor.type_person === 1) {
                              vm.form.grouping_level = groupInfo;
                          } else {
                            vm.juridicalForm.grouping_level = groupInfo;
                          }
                          $http.get(url.IP + 'groupingLevel-resume/')
                          .then(function(response) {
                            vm.agrupaciones = response.data
                            vm.agrupaciones.forEach(function(item){
                              if(item.url == group.data.url){
                                vm.editForm.grouping_level = item;
                                $rootScope.changeAgrupacion2(item);
                                item.subgrupos.forEach(function(sub){
                                  if(sub.url == data.data.url){
                                    vm.editForm.subagrupaciones = sub;
                                    $rootScope.changeSubagrupacion2(sub);
                                  }
                                });
                              }
                            });
                          });
                        });
                      }else{
                        var groupInfo = {
                          group_name: data.data.description
                        };
                        if (contractor.type_person === 1) {
                            vm.form.grouping_level = groupInfo;
                        } else {
                            vm.juridicalForm.grouping_level = groupInfo;
                        }
                        $http.get(url.IP + 'groupingLevel-resume/')
                          .then(function(response) {
                            vm.agrupaciones = response.data
                          vm.agrupaciones.forEach(function(item){
                            if(item.url == data.data.url){
                              vm.editForm.grouping_level = item;
                              $rootScope.changeAgrupacion2(item);
                            }
                          });
                        });
                      }
                  }
                });
              }
              if (contractor.type_person === 1) {
                try{
                    // var date = contractor.birthday;
                    var date = contractor.birth_date;
                    var newdate = date.split("-").reverse().join("/");
                    contractor.birthday = newdate;
                }
                catch(e){}
                vm.form = contractor;
                vm.form.birthday = datesFactory.convertDate(contractor.birth_date)
                vm.form.contact_natural = contractor.contact_contractor;
                // if(vm.form.address_natural){
                //   if(vm.form.address_natural.length == 0){
                //     vm.form.address_natural = [{
                //       raw: '',
                //     }];
                //   }
                // }
                if(contractor.vendor){
                  vm.form.vendedor = contractor.vendor;
                }
                if(contractor.sucursal){
                  vm.form.sucursal = contractor.sucursal;
                }
                if(contractor.responsable){
                  if (contractor.responsable){
                    if (contractor.responsable.url){
                      $http.get(contractor.responsable.url )
                        .then(
                            function success(request) {
                              if(request.status === 200) {
                                vm.form.responsable = request.data
                              }
                            },
                            function error(error) {

                            }
                        )
                        .catch(function(e){
                            console.log(e);
                        });
                      }else{
                        $http.get(contractor.responsable )
                        .then(
                            function success(request) {
                              if(request.status === 200) {
                                vm.form.responsable = request.data
                              }
                            },
                            function error(error) {

                            }
                        )
                        .catch(function(e){
                            console.log(e);
                        });
                      }
                  }else{
                    $http.get(url.IP + 'usuarios/')
                    .then(function(user) {
                      vm.responsables  = user.data.results;
                    });
                  }
                }
                vm.form.contact_natural = contractor.contact_contractor;
                vm.form.email_natural = vm.form.email_contractor;
                vm.form.phone_natural = vm.form.phone_contractor;
                vm.form.address_natural = vm.form.address_contractor;
                if(!vm.form.email_natural.length){
                  // vm.form.email_natural.push({
                  //   email: "",
                  //   email_type: 0
                  // });
                }
                else{                    
                  vm.form.email_natural.forEach(function(data, index){
                    if(data.correo == vm.form.email){
                      vm.form.email_natural.splice(index, 1);
                    }
                  });
                  // if(vm.form.email_natural.length == 0){
                  //   vm.form.email_natural.push({
                  //     email: "",
                  //     email_type: 0
                  //   });
                  // }
                }
                if(!vm.form.phone_natural.length){
                  // vm.form.phone_natural.push({
                  //   phone: "",
                  //   phone_type: 0
                  // });
                }
                else{
                  vm.form.phone_natural.forEach(function(data, index){
                    if(data.phone == vm.form.phone_number){
                      vm.form.phone_natural.splice(index, 1);
                    }
                  });
                  // if(vm.form.phone_natural.length == 0){
                  //   vm.form.phone_natural.push({
                  //     phone: "",
                  //     phone_type: 0
                  //   });
                  // }
                }
                
                contractor.userAddresses = contractor.address_contractor;
                if(contractor.userAddresses.length == 0){
                  addAddress(1);
                }
                if(contractor.bound_solidarity_many){
                  if (contractor.bound_solidarity_many.length >0) {
                    vm.form.obligados =[];
                    contractor.bound_solidarity_many.forEach(function(cons){                  
                      $http.get(cons)
                      .then(function(request) {
                        var obligados1 = {
                          obligado: request.data
                        };
                        var obj1 = {
                          label: request.data.full_name,
                          value: request.data,
                          val: request.data.full_name
                        };             
                        vm.form.obligados.push(obj1)
                      });
                    });
                  }else{
                    vm.form.obligados = []
                    $scope.addObligados(1)
                  }
                }else{
                  vm.form.obligados = []
                  $scope.addObligados(1)
                }
              } else {
                vm.juridicalForm.contact_juridical = contractor.contact_contractor;
                vm.juridicalForm.email_juridical = contractor.email_contractor;
                vm.juridicalForm.phone_juridical = contractor.phone_contractor;
                vm.juridicalForm.address_juridical = contractor.address_contractor;
                vm.juridicalForm.j_name = contractor.full_name;
                try{
                    // var date = contractor.date_of_establishment;
                    var date = contractor.birth_date;
                    var newdate = date.split("-").reverse().join("/");
                    contractor.date_of_establishment = newdate;
                }
                catch(e){}
                vm.juridicalForm = contractor;
                vm.juridicalForm.j_name = contractor.full_name;
                vm.juridicalForm.contact_juridical = contractor.contact_contractor;
                vm.juridicalForm.email_juridical = contractor.email_contractor;
                vm.juridicalForm.phone_juridical = contractor.phone_contractor;
                vm.juridicalForm.address_juridical = contractor.address_contractor;
                vm.juridicalForm.date_of_establishment= datesFactory.convertDate(contractor.birth_date)
                if(vm.juridicalForm.address_juridical){
                  if(vm.juridicalForm.address_juridical.length == 0){
                    vm.juridicalForm.address_juridical = [{
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
                      composed: ''
                    }];
                  }
                }
                if(contractor.vendor){
                  vm.juridicalForm.vendedor = contractor.vendor;
                }
                if(contractor.sucursal){
                  vm.juridicalForm.sucursal = contractor.sucursal;
                }
                if(contractor.responsable){
                  // vm.juridicalForm.responsable = contractor.responsable
                  if (contractor.responsable){
                    if (contractor.responsable.url) {
                    $http.get(contractor.responsable.url )
                      .then(
                          function success(request) {
                            if(request.status === 200) {
                              vm.juridicalForm.responsable = request.data
                            }
                          },
                          function error(error) {

                          }
                      )
                      .catch(function(e){
                          console.log(e);
                      });
                    }else{
                      // vm.juridicalForm.responsable = contractor.responsable
                      $http.get(contractor.responsable )
                      .then(
                          function success(request) {
                            if(request.status === 200) {
                              vm.juridicalForm.responsable = request.data
                            }
                          },
                          function error(error) {

                          }
                      )
                      .catch(function(e){
                          console.log(e);
                      });
                    }
                  }else{
                    
                  }
                }else{
                  $http.get(url.IP + 'usuarios/')
                    .then(function(user) {
                      vm.responsables  = user.data.results;
                    });
                }
                if(!vm.juridicalForm.email_juridical.length){
                  // vm.juridicalForm.email_juridical.push({
                  //   email: "",
                  //   email_type: 0
                  // });
                }
                else{
                  vm.juridicalForm.email_juridical.forEach(function(data, index){
                    if(data.correo == vm.juridicalForm.email){
                      vm.juridicalForm.email_juridical.splice(index, 1);
                    }
                  });
                  // if(vm.juridicalForm.email_juridical.length == 0){
                  //   vm.juridicalForm.email_juridical.push({
                  //     email: "",
                  //     email_type: 0
                  //   });
                  // }
                }
                if(!vm.juridicalForm.phone_juridical.length){
                  // vm.juridicalForm.phone_contractor.push({
                  //   phone: "",
                  //   phone_type: 0
                  // });
                }
                else{
                  vm.juridicalForm.phone_juridical.forEach(function(data, index){
                    if(data.phone == vm.juridicalForm.phone_number){
                      vm.juridicalForm.phone_juridical.splice(index, 1);
                    }
                  });
                  // if(vm.juridicalForm.phone_contractor.length == 0){
                  //   vm.juridicalForm.phone_contractor.push({
                  //     phone: "",
                  //     phone_type: 0
                  //   });
                  // }
                }

                contractor.userAddresses = contractor.address_contractor;if(contractor.userAddresses.length == 0){
                  addAddress(2);
                }
                if (contractor.bound_solidarity_many.length >0) {
                  vm.juridicalForm.obligados =[];
                  contractor.bound_solidarity_many.forEach(function(cons){                  
                    $http.get(cons)
                    .then(function(request) {
                      var obligados1 = {
                        obligado: request.data
                      };
                      var obj1 = {
                        label: request.data.full_name,
                        value: request.data,
                        val: request.data.full_name
                      };             
                      vm.juridicalForm.obligados.push(obj1)
                    });
                  });
                }else{
                  vm.juridicalForm.obligados = []
                  $scope.addObligados(2)
                }
              }

              if(contractor.resp_contractor && contractor.resp_contractor.length == 0){
                if(contractor.type_person === 1){
                  var addresponsables = {
                    responsable: 0,
                    resp_type : 0
                  };
                  vm.form.resp_contractor = [addresponsables];
                }
                else{
                  var addresponsables = {
                    responsable: 0,
                    resp_type : 0
                  }
                  vm.juridicalForm.resp_contractor = [addresponsables];
                }
              }


              contractor.userAddresses.forEach(function(address){
        
                $http.get(url.IP + 'ok-to-delete/' + address.id + '/')
                .then(function success(response) {
                    if(response.data){
                        address.can_delete = true
                        
                    } else {
                        address.can_delete = false
                    
                    }
                })
                if(vm.statesArray){
                    vm.statesArray.some(function(state){
                        if (state.state == address.administrative_area_level_1){
                            address.administrative_area_level_1 = state;
                            state.cities.some(function(city){
                                if(city.city == address.administrative_area_level_2){
                                    address.administrative_area_level_2 = city;
                                }
                            });
                        }
                    });
                  }
              });          
              return contractor;
            })
            .then(function(contractor) {
                return groupService.getGroup(contractor)
                .then(function(data) {
                  vm.aux_contractor = contractor
                  if(data.type_group == 3){
                    $http.get(data.parent)
                    .then(function(subgroup) {
                      if(subgroup.data.type_group == 2){
                        $http.get(subgroup.data.parent)
                        .then(function(group) {
                          var groupInfo = {
                              url: data.url,
                              id: data.id,
                              group_name: group.data.group_name,
                              subgroup_name: subgroup.data.group_name,
                              subsubgroup_name: data.group_name
                          };
                          if (contractor.type_person === 1) {
                              vm.form.group = groupInfo;
                          } else {
                              vm.juridicalForm.group = groupInfo;
                          }

                          if(vm.groups.length > 0){
                            vm.groups.forEach(function(item){
                              if(item.url == group.data.url){
                                vm.editForm.group = item;
                                $rootScope.changeGroup(item);
                                item.subgrupos.forEach(function(sub){
                                  if(sub.url == subgroup.data.url){
                                    vm.editForm.subgroup = sub;
                                    $rootScope.changeSubGroup(sub);
                                    sub.subsubgrupos.forEach(function(subsub){
                                      if(subsub.url == data.url){
                                        vm.editForm.subsubgrupo = subsub;
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }else{
                            groupService.getGroups()
                            .then(function(groups) {
                              vm.groups = groups;
                              vm.groups.forEach(function(item){
                                if(item.url == group.data.url){
                                  vm.editForm.group = item;
                                  $rootScope.changeGroup(item);
                                  item.subgrupos.forEach(function(sub){
                                    if(sub.url == subgroup.data.url){
                                      vm.editForm.subgroup = sub;
                                      $rootScope.changeSubGroup(sub);
                                      sub.subsubgrupos.forEach(function(subsub){
                                        if(subsub.url == data.url){
                                          vm.editForm.subsubgrupo = subsub;
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            });
                          }
                        });
                      }
                    });
                  }else{
                    if(data.type_group == 2){
                        $http.get(data.parent)
                        .then(function(group) {
                          var groupInfo = {
                              url: data.url,
                              id: data.id,
                              group_name: group.data.group_name,
                              subgroup_name: data.group_name,
                          };
                          if (contractor.type_person === 1) {
                              vm.form.group = groupInfo;
                          } else {
                              vm.juridicalForm.group = groupInfo;
                          }
                          if(vm.groups.length > 0){
                            vm.groups.forEach(function(item){
                              if(item.url == group.data.url){
                                vm.editForm.group = item;
                                $rootScope.changeGroup(item);
                                item.subgrupos.forEach(function(sub){
                                  if(sub.url == data.url){
                                    vm.editForm.subgroup = sub;
                                  }
                                });
                              }
                            });
                          }else{
                            groupService.getGroups()
                            .then(function(groups) {
                              vm.groups = groups;
                              vm.groups.forEach(function(item){
                                if(item.url == group.data.url){
                                  vm.editForm.group = item;
                                  $rootScope.changeGroup(item);
                                  item.subgrupos.forEach(function(sub){
                                    if(sub.url == data.url){
                                      vm.editForm.subgroup = sub;
                                    }
                                  });
                                }
                              });
                            });
                          }
                        });
                      }else{
                        var groupInfo = {
                          url: data.url,
                          id: data.id,
                          group_name: data.group_name
                        };
                        if (contractor.type_person === 1) {
                            vm.form.group = groupInfo;
                        } else {
                            vm.juridicalForm.group = groupInfo;
                        }

                        if(vm.groups.length > 0){
                          vm.groups.forEach(function(item){
                            if(item.url == data.url){
                              vm.editForm.group = item;
                              $rootScope.changeGroup(item);
                            }
                          });
                        }else{
                          groupService.getGroups()
                          .then(function(groups) {
                            vm.groups = groups;
                            vm.groups.forEach(function(item){
                              if(item.url == data.url){
                                vm.editForm.group = item;
                                $rootScope.changeGroup(item);
                              }
                            });
                          });
                        }
                      }
                  }
                });
            });

        $q.when()
            .then(function() {
                var defer = $q.defer();
                defer.resolve(helpers.getStates());
                return defer.promise;
            })
            .then(function(data) {
                vm.statesArray = data.data;
                $timeout(function() {
                  var nums = [];
                  var typePerson;


                  $('.telefono').each(function(telefono) {
                      var actual = $(this);
                      nums.push(actual);
                  })
                  try{
                    if ($stateParams.type === 'fisicas' || $scope.contractor.type_person== 1) {
                      typePerson = vm.form.contact_contractor;
                    } else {
                        typePerson = vm.juridicalForm.contact_contractor;
                    }
                  }catch(e){console.log('eee--',e)}
                }, 1000);
            });        
        if(vm.form){
          if(!vm.form.userAddresses){
            vm.form.userAddresses = []
            addAddress(1) 
          }
        } else if(vm.juridicalForm){
          if(!vm.juridicalForm.userAddresses) {
            vm.juridicalForm.userAddresses = []
            addAddress(2)
          }
        }
      if(vm.permiso_archivos){
        getFiles();
      }
    }
    $scope.onlyFianzas = function(q){
      if ($scope.contractor.only_sureties) {
        if (q==1) {            
          vm.listDocument.push(
            {id: 7, name: 'Carta nombramiento',value : $scope.contractor.carta_nombramiento, file: false,arch: {}},
            {id: 8, name: 'Currículo',value : $scope.contractor.curriculo, file: false,arch: {}},
            {id: 9, name: 'Contrato multiple de la afianzadora',value : $scope.contractor.contrato_multiple_afianzadora, file: false,arch: {}},
            {id: 10, name: 'Carta buro',value : $scope.contractor.carta_buro, file: false,arch: {}},
            {id: 11, name: 'Entrevista con la afianzadora',value : $scope.contractor.entrevista_afianzadora, file: false,arch: {}},
            {id: 12, name: 'RFC',value : $scope.contractor.rfc_document, file: false,arch: {}},
            {id: 13, name: 'Recibos de nomina',value : $scope.contractor.recibos_nomina, file: false,arch: {}},
            {id: 14, name: 'Declaración anual completa con cadena de los últimos dos años inmediatos anteriores',value : $scope.contractor.declaracion_anual, file: false,arch: {}},
            {id: 15, name: 'Estados financieros anuales del año inmediato anterior',value : $scope.contractor.estados_financieros_anuales, file: false,arch: {}},
            {id: 16, name: 'Estados financieros parciales, los mas recientes, con una antigüedad no mayor a 2 años',value : $scope.contractor.estados_financieros_parciales, file: false,arch: {}},
            {id: 17, name: 'Alta ante hacienda o alta electrónica',value : $scope.contractor.alta_hacienda, file: false,arch: {}},            
            {id: 18, name: 'Escritura de inmueble',value : $scope.contractor.escritura_inmueble, file: false,arch: {}},
            {id: 19, name: 'Boleta predial o avaluó',value : $scope.contractor.boleta_predial, file: false,arch: {}},
            {id: 20, name: 'Certificado de libertad de gravamen',value : $scope.contractor.certificado_gravamen, file: false,arch: {}}
          );
        }else if(q==2){
          vm.listDocument.push(
            {id: 7, name: 'Currículo reciente',value : $scope.contractor.curriculo, file: false,arch: {}},
            {id: 8, name: 'Contrato multiple de la afianzadora',value : $scope.contractor.contrato_multiple_afianzadora, file: false,arch: {}},
            {id: 9, name: 'Carta Buró',value : $scope.contractor.carta_buro, file: false,arch: {}},
            {id: 10, name: 'Cuestionario o entrevista',value : $scope.contractor.entrevista_afianzadora, file: false,arch: {}},
            {id: 11, name: 'Aviso de privacidad de la afianzadora',value : $scope.contractor.aviso_privacidad, file: false,arch: {}},
            {id: 12, name: 'Protocolizaciones',value : $scope.contractor.protocolizaciones, file: false,arch: {}},
            {id: 13, name: 'Alta de empresa ante hacienda',value : $scope.contractor.alta_hacienda, file: false,arch: {}},
            {id: 14, name: 'Cambio de domicilio ante hacienda',value : $scope.contractor.cambio_domicilio_hacienda, file: false,arch: {}},
            {id: 15, name: 'Copia del comprobante de inscripción para la e.firma (firma electrónica)',value : $scope.contractor.cambio_domicilio_hacienda, file: false,arch: {}},
            {id: 16, name: 'Declaración anual completa con cadena, de los últimos dos años',value : $scope.contractor.declaracion_anual, file: false,arch: {}},
            {id: 17, name: 'Estados financieros dictaminados cuadernillo completo, del año inmediato anterior',value : $scope.contractor.estados_financieros_anuales, file: false,arch: {}},
            {id: 18, name: 'Estados financieros parciales los más recientes de este año con no mayor antigüedad de dos meses',value : $scope.contractor.estados_financieros_parciales, file: false,arch: {}},     
            {id: 19, name: 'Escritura de inmueble',value : $scope.contractor.escritura_inmueble, file: false,arch: {}},
            {id: 20, name: 'Boleta predial o avaluó',value : $scope.contractor.boleta_predial, file: false,arch: {}},
            {id: 21, name: 'Certificado de libertad de gravamen',value : $scope.contractor.certificado_gravamen, file: false,arch: {}}
          );
        }
      }else{            
        if(q==1){
          if (vm.org_name == 'ancora') {
            vm.listDocument = [
              {id: 1, name: 'Identificación Oficial',value : $scope.contractor.card_official_identification,file: false,arch: {}},
              {id: 2, name: 'CURP',value : $scope.contractor.CURP,file: false,arch: {}},
              {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value: $scope.contractor.voucher_efirm,file: false,arch: {}},
              {id: 4, name: 'Comprobante de Domicilio',value: $scope.contractor.voucher_of_address,file: false,arch: {}},
              {id: 5, name: 'Formato de Identificación de Cliente Firmado',value: $scope.contractor.signed_format_ic,file: false,arch: {}},
            ];
          }else{
            vm.listDocument = [
              {id: 1, name: 'Identificación Oficial',value : $scope.contractor.card_official_identification,file: false,arch: {}},
              {id: 2, name: 'CURP',value : $scope.contractor.CURP,file: false,arch: {}},
              {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value: $scope.contractor.voucher_efirm,file: false,arch: {}},
              {id: 4, name: 'Comprobante de Domicilio',value: $scope.contractor.voucher_of_address,file: false,arch: {}},
              {id: 5, name: 'Formato de Identificación de Cliente Firmado',value: $scope.contractor.signed_format_ic,file: false,arch: {}},
              {id: 6, name: 'Poder',value: $scope.contractor.fiscal_power,file: false,arch: {}},
            ];
          }
        }else if(q==2){
          vm.listDocument = [
            {id: 1, name: 'Acta Constitutiva',value : $scope.contractor.constitutive_act,file: false,arch: {}},
            {id: 2, name: 'RFC',value : $scope.contractor.rfc_document,file: false,arch: {}},
            {id: 3, name: 'Cédula de Identificación Fiscal',value: $scope.contractor.card_official_identification,file: false,arch: {}},
            {id: 4, name: 'Comprobante de Domicilio Fiscal',value: $scope.contractor.voucher_of_address,file: false,arch: {}},
            {id: 5, name: 'Modificaciones al Acta Constitutiva',value: $scope.contractor.modifications_constitutive_act,file: false,arch: {}},
            {id: 6, name: 'Poder',value: $scope.contractor.fiscal_power,file: false,arch: {}},
          ];
        }
      }
    }
    function getFiles() {
      $stateParams.type = 'contractors';
      $stateParams.type_person = $scope.contractor.type_person;
        return ContratanteService.getFiles($stateParams)
            .then(function(data) {
                if(data.detail) {
                    vm.show_files = false;
                } else {
                    vm.files = data;
                }
            });
    }
    //archivos lista documentos
    $scope.addFileList = function(index,lista,file,xy){
      var extension = file[0].formData[0].name.split('.')[1];
      file[0].formData[0].name = vm.listDocument[index].name+'.'+extension
      vm.listDocument[index].arch = file[0]
      vm.listDocument[index].file = true
      $scope.uploaderDocument.queue = []
    }
    var uploaderDocument = $scope.uploaderDocument = new FileUploader({
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        },
    });

    // uploaderDocument.filters.push({
    //     name: 'customFilter',
    //     fn: function(item /*{File|FileLikeObject}*/ , options) { //jshint ignore:line
    //         return this.queue.length < 20;
    //     }
    // });

    // ALERTA SUCCES UPLOADFILES
    uploaderDocument.onSuccessItem = function(fileItem, response, status, headers) {
      // if ($uibModalInstance) {
      //     $uibModalInstance.dismiss('cancel');
      // }
      $scope.okFile++;
      if($scope.okFile == $scope.countFile){
        $timeout(function() {
          SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWCONTRACTOR, "success");
          if($location.path() == '/contratantes/crear') {
            if (vm.acceso_ver_cont) {
              $state.go('fianzas.pprovinfo', {
                type: $scope.contractorNew.type_person == 'Fisica' ? 'fisicas' : 'morales',
                contratanteId: $scope.contractorNew.id
              });
            }else{
              $state.go('fianzas.pprovlist')
            }
          }
          else if($location.path() == '/colectividades/'){
            var params = { 'myInsurance': $scope.contractorNew }
            $state.go('colectividades.main', params);
          }
          else if($location.path() == '/fianzas/'){
            $rootScope.show_contractor = false;
            // var params = { 'myInsurance': $scope.contractorNew }
            // $state.go('fianzas.fianzas', params);
          }
          else {
            $rootScope.show_contractor = false;
            var params = { 'myInsurance': $scope.contractorNew }
            $state.go('fianzas.pprovlist');
          }
        }, 1000);
      }
    };

    // ALERTA ERROR UPLOADFILES
    uploaderDocument.onErrorItem = function(fileItem, response, status, headers) {
      if(response.status == 413){
        SweetAlert.swal("ERROR", MESSAGES.ERROR.FILETOOLARGE, "error");
      } else {
        SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
      }
    };

    uploaderDocument.onAfterAddingFile = function(fileItem) {
      fileItem.formData.push({
          arch: fileItem._file,
          name: fileItem.file.name
      });
    };

    uploaderDocument.onBeforeUploadItem = function(item) {
      if(item.file.sensible != undefined){
        item.formData[0].sensible = item.file.sensible;
      }
      item.url = $scope.userInfo.url;
      item.formData[0].name = item.file.name;
      item.alias = '';
      item.formData[0].owner = $scope.userInfo.id;
    };
    //archivos lista docuemntos
    function uploadFilesList(typePerson, idPerson) {
      $scope.userInfo = {
          id: idPerson
      };
      // $scope.userInfo.url = url.IP + checkType(typePerson) + '/' + idPerson + '/archivos/';
      $scope.userInfo.url = url.IP + 'contractors' + '/' + idPerson + '/archivos/';

      $scope.files = [];

      $timeout(function() {
          $scope.uploaderDocument.uploadAll();
      }, 1000);
    }
    // Add group popup
    function openModalGroup(level, type, parent) {
      // var modalInstance = $uibModal.open({ //jshint ignore:line
      //     templateUrl: 'app/grupos/grupos.form.html',
      //     controller: ModalGroupCtrl,
      //     //windowClass: 'animated fadeIn'
      // });
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/grupos/grupos.form.html',
        controller: ModalInstanceGroupCtrl,
        resolve: {
          padre: function() {
            return parent;
          },
          parent: function() {
            return vm;
          },
          level: function() {
            return level;
          },
          type: function() {
            return type;
          },
          group: function() {
            return type == 1 ? vm.form.group : vm.juridicalForm.group;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
        // windowClass: 'animated fadeIn'
      });
    }

    function ModalInstanceGroupCtrl($scope, $uibModalInstance, parent, level, group, type,padre) {
      $scope.level = level;
      $scope.groupForm = {};
      $scope.subgroupForm = {};
      $scope.subsubgroupForm = {};
      $scope.subgroups = [];
      $scope.sub_subgroups = [];

      $scope.addSubgroups = function () {
        var obj = {name: '', observations: '', sub_subgroup: []};
        $scope.subgroups.push(obj);
      };

      $scope.deleteSubgroup = function (index) {
        $scope.subgroups.splice(index, 1);
      };

      $scope.addSubsubgroups = function () {
        var obj = {name: '', observations: '', sub_subgroup: []};
        $scope.sub_subgroups.push(obj);
      };

      $scope.deleteSubsubgroup = function (index) {
        $scope.sub_subgroups.splice(index, 1);
      };

      $http.get(url.IP + 'usuarios/')
      .then(function(user) {
        $scope.users = user.data.results;

        $scope.show_pagination = true;
      });

      $scope.changeResponsable = function(data, type){
        $scope.responsables_natural = [];
        $scope.responsables_juridical = [];
        if(type == 1){
          $scope.responsables_natural.push(data);
        } else {
          $scope.responsables_juridical.push(data);
        }
      };

      $scope.ok = function() {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        var flag = false;
        var form = angular.copy($scope.groupForm);
        var name = form.group_name;
        var bd_group_name = [];
        groupService
        .getGroups()
        .then(function(res) {
          res.forEach(function(group, i) {
              bd_group_name.push(String(group.group_name));
          });

          for (var i = 0; i < bd_group_name.length; i++) {
            if (name == bd_group_name[i]) {
                flag = true;
            }
          }
          form.type_group = 1;

          if (flag == false) {
            return groupService.createGroup(form)
                .then(function(data) {
                  if(data.status === 201) {
                    vm.groups.push(data.data);
                    $rootScope.changeGroup(data.data);
                    if(vm.form) {
                      vm.form.group = data.data;
                    } else if(vm.juridicalForm) {
                      vm.juridicalForm.group = data.data;
                    }

                    if ($uibModalInstance) {
                      $uibModalInstance.close();
                      $("#modalContratate").parent().parent().parent().css("display", "block");
                    }

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
                            // vm.subgroups.push(request.data);
                            if (type === 1) {
                              vm.form.group.subgrupos.push(request.data);
                            } else {
                              vm.juridicalForm.group.subgrupos.push(request.data);
                            }
                          }
                        })
                        .catch(function (e) {
                          l.stop();
                          console.log('e', e);
                        });
                      });
                    }

                  } else if(data.status === 403) {
                    toaster.warning('Usted no tiene permisos para crear grupos');
                    // return;
                    $uibModalInstance.close();
                    $("#modalContratate").parent().parent().parent().css("display", "block");
                  }
                }).catch(function() {
                  l.stop();
                  return;
                });
          } else {
            SweetAlert.swal("ERROR",MESSAGES.ERROR.THISNAMEALREADYEXIST ,"error");
            return;
          }
        });
      };

      $scope.oksub = function() {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        $scope.subgroupForm.responsable = group.responsable;
        $scope.subgroupForm.parent = padre.url;
        $scope.subgroupForm.type_group = 2;

        if(!$scope.subgroupForm.group_name){
          l.stop();
          SweetAlert.swal("Error", "Agrega un nombre de subgrupo.", "error");
          return;
        }

        $http({
          method: 'POST',
          url: url.IP + 'grupos/',
          data: $scope.subgroupForm
        })
        .then(function (request) {
          if(request.status === 200 || request.status === 201) {
            try{
              vm.subgroups.push(request.data)
            }catch(e){
              vm.subgroups = [];
              vm.subgroups.push(request.data)           
            }
            if ($scope.sub_subgroups.length > 0) {
              vm.subgroups[vm.subgroups.length - 1].subsubgrupos = [];
              $scope.sub_subgroups.forEach(function(item){
                var datas = {
                  group_name: item.group_name,
                  responsable: padre.responsable,
                  parent: request.data.url,
                  type_group: 3
                }

                $http({
                  method: 'POST',
                  url: url.IP + 'grupos/',
                  data: datas
                })
                .then(function (response) {
                  if(response.status === 200 || response.status === 201) {
                    vm.subgroups[vm.subgroups.length - 1].subsubgrupos.push(response.data);
                  }
                })
                .catch(function (e) {
                  l.stop();
                  console.log('e', e);
                });
              });
            }
            $scope.cancel();
          }
        })
        .catch(function (e) {
          l.stop();
          console.log('e', e);
        });
      };

      $scope.oksubsub = function() {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        $scope.subsubgroupForm.responsable = group.responsable;
        $scope.subsubgroupForm.parent = padre.url;
        $scope.subsubgroupForm.type_group = 3;

        if(!$scope.subsubgroupForm.group_name){
          l.stop();
          SweetAlert.swal("Error", "Agrega un nombre de subsubgrupo.", "error");
          return;
        }

        $http({
          method: 'POST',
          url: url.IP + 'grupos/',
          data: $scope.subsubgroupForm
        })
        .then(function (request_sub) {
          if(request_sub.status === 200 || request_sub.status === 201) {
            if(vm.sub_subgroups == undefined){
              $scope.sub_subgroups = [];
            }
            // vm.sub_subgroups.push(request_sub.data);
            try{
              $scope.sub_subgroups.push(request_sub.data);
            }catch(e){
              $scope.sub_subgroups = [];
              $scope.sub_subgroups.push(request_sub.data);         
            }
            $scope.cancel();
          }
        })
        .catch(function (e) {
          l.stop();
          console.log('e', e);
        });
      };

      $scope.cancel = function() {
        if ($uibModalInstance) {
          $uibModalInstance.dismiss('cancel');
          $("#modalContratate").parent().parent().parent().css("display", "block");
        }
      };
    }

    function openModalClasification(level) {
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/contratantes/contratantes.clasificacion.html',
        controller: ModaClasificationCtrl,
        resolve: {
          parent: function() {
            return vm;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
        // windowClass: 'animated fadeIn'
      });
    }

    $scope.sub_asignaciones = [];
    $scope.sub_subasignaciones = [];

    function ModaClasificationCtrl($scope, $uibModalInstance, parent) {
      $scope.classification = {};

      $scope.save = function() {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();

        $scope.classification.classification_name = $scope.classification.classification_name
        $scope.classification.description = $scope.classification.description

        $http({
          method: 'POST',
          url: url.IP + 'classification/',
          data: $scope.classification
        })
        .then(function (response) {
          if(response.status === 200 || response.status === 201) {
            l.stop();
            vm.clasifications.push(response.data);
            $scope.cancel();
          }
        })
        .catch(function (e) {
          l.stop();
          console.log('e', e);
        });
      };

      $scope.cancel = function() {
        if ($uibModalInstance) {
          $uibModalInstance.dismiss('cancel');
        }
      };
    }

    $scope.matchesContractors = function(parWord){
      if(parWord) {
        if(parWord.length >= 3) {
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   $scope.show_contratante = 'v2/contratantes/contractors-match/';
          $scope.show_contratante = 'contractors-match/';
          $http.post(url.IP + $scope.show_contratante, 
          {
            'matchWord': parWord,
            'poliza': false
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
            $scope.bound_solidarity = vm.contratante.value.url;
            $scope.has_solidario = true;
          }
        }
      }
    });

    function openModalCelulaContractor(level) {
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/contratantes/contratantes.celulas.html',
        controller: ModalCelulasCtrl,
        resolve: {
          parent: function() {
            return vm;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
        // windowClass: 'animated fadeIn'
      });
    }
    function ModalCelulasCtrl($scope, $uibModalInstance, parent) {
      $scope.celula = {};
      dataFactory.get('usuarios/')
      .then(function(user) {
        $scope.usuarios_saam  = user.data.results;
      });
      $scope.selectUsuarios = function(sel){
        $scope.usuarios_selected = [];
        sel.forEach(function(u) {
          if (u.url) {
            $scope.usuarios_selected.push(u.url)
          }else{
            $scope.usuarios_selected.push(u)
          }
        })
      };
      $scope.save_celula = function() {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();

        $scope.celula.celula_name = $scope.celula.celula_name;
        $scope.celula.description = $scope.celula.description;
        $scope.celula.users_many = $scope.usuarios_selected ? $scope.usuarios_selected : [];

        $http({
          method: 'POST',
          url: url.IP + 'celula_contractor/',
          data: $scope.celula
        })
        .then(function (response) {
          if(response.status === 200 || response.status === 201) {
            vm.celulas.push(response.data);
            $scope.cancel_celula();
          }
        })
        .catch(function (e) {
          l.stop();
          console.log('e', e);
        });
      };

      $scope.cancel_celula = function() {
        if ($uibModalInstance) {
          $uibModalInstance.dismiss('cancel');
        }
      };
    }
    function openModalAsignacion(level,padre) {
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/contratantes/contratantes.agrupacion.html',
        controller: ModalAsignacionCtrl,
        resolve: {
          padre: function() {
            return padre;
          },
          parent: function() {
            return vm;
          },
          level: function() {
            return level;
          },
          group: function() {
            return level == 2 ? vm.editForm.grouping_level : vm.editForm.subagrupaciones;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
        // windowClass: 'animated fadeIn'
      });
    }

    $scope.sub_asignaciones = [];
    $scope.sub_subasignaciones = [];

    function ModalAsignacionCtrl($scope, $uibModalInstance, parent, level, group,padre) {
      $scope.level = level;
      $scope.group_modal = group;
      $scope.grupo = {};
      // $scope.subasignaciones = [];
      $scope.subsubasignacion = [];

      $scope.addSubasignaciones = function () {
        var obj = {name: '', observations: '', sub_subgroup: []};
        vm.subasignaciones.push(obj);
      };

      $scope.deleteSubasignaciones = function (index) {
        vm.subasignaciones.splice(index, 1);
      };

      $scope.addSubsubasignaciones = function () {
        var obj = {name: '', observations: '', sub_subgroup: []};
        $scope.subsubasignacion.push(obj);
      };

      $scope.deleteSubsubasignaciones = function (index) {
        vm.subsubasignaciones.splice(index, 1);
      };

      $http.get(url.IP + 'usuarios/')
      .then(function(user) {
        $scope.users = user.data.results;

        $scope.show_pagination = true;
      });

      $scope.changeResponsable = function(data, type){
        $scope.responsables_natural = [];
        $scope.responsables_juridical = [];
        if(type == 1){
          $scope.responsables_natural.push(data);
        } else {
          $scope.responsables_juridical.push(data);
        }
      };

      $scope.saveSub = function() {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        $scope.sub_asignaciones = [];
        $scope.grupo.level_grouping = padre.level_grouping;
        $scope.grupo.parent = padre.url;
        $scope.grupo.type_grouping = 2;
        if(!$scope.grupo.description){
          l.stop();
          SweetAlert.swal("Error", "Agrega un nombre de subagrupación.", "error");
          return;
        }

        $http({
          method: 'POST',
          url: url.IP + 'groupinglevel/',
          data: $scope.grupo
        })
        .then(function (request_sub) {
          if(request_sub.status === 200 || request_sub.status === 201) {
            $scope.sub_subasignaciones = [];
            $scope.sub_asignaciones = padre.subgrupos;
            $rootScope.changeAgrupacion2(padre);                       
            try{
              $scope.sub_asignaciones.push(request_sub.data);
            }catch(e){
              $scope.sub_asignaciones = request_sub.data
            }
            if($scope.subsubasignacion.length > 0){
              $scope.subsubasignacion.forEach(function(item, index){
                var datas = {
                  description: item.description,
                  responsable: $scope.grupo.responsable,
                  parent: request_sub.data.url,
                  type_grouping: 3
                }

                if(item.description){
                  $http({
                    method: 'POST',
                    url: url.IP + 'groupinglevel/',
                    data: datas
                  })
                  .then(function (response) {
                    if(response.status === 200 || response.status === 201) {
                      $scope.sub_subasignaciones = [];
                      $scope.sub_subasignaciones.push(response.data)
                      $rootScope.changeAgrupacion2(padre);
                      if($scope.subsubasignacion.length == (index + 1)){                      
                        vm.agrupaciones.forEach(function(gpo){
                          if(gpo.description == vm.editForm.grouping_level.subgroup_name){
                            vm.editForm.grouping_level = gpo;
                            // gpo.subgrupos.forEach(function(sub){
                            //   if(vm.editForm.grouping_level.url == sub.parent){
                            //     vm.editForm.subagrupaciones = sub;
                            //   }
                            // });
                          }
                        });
                      }
                    }
                  })
                  .catch(function (e) {
                    l.stop();
                    console.log('e', e);
                  });
                }

              });
            } 
            vm.editForm.subagrupaciones = request_sub.data;
            $scope.cancel();
          }
        })
        .catch(function (e) {
          l.stop();
          console.log('e', e);
        });
      };

      $scope.saveSubsub = function() {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        $scope.grupo.level_grouping = padre.level_grouping;
        $scope.grupo.parent = padre.url;
        $scope.grupo.type_grouping = 3;

        if(!$scope.grupo.description){
          l.stop();
          SweetAlert.swal("Error", "Agrega un nombre de subsubagrupación.", "error");
          return;
        }

        $http({
          method: 'POST',
          url: url.IP + 'groupinglevel/',
          data: $scope.grupo
        })
        .then(function (request_sub) {
          if(request_sub.status === 200 || request_sub.status === 201) {
            // $scope.sub_subasignaciones = padre.subgrupos;            
            // $scope.sub_subasignaciones.push(request_sub.data);
            // $rootScope.changeAgrupacion2(vm.editForm.grouping_level);
            // $scope.cancel();
            $scope.sub_subasignaciones = padre.subgrupos;
            try{
              $scope.sub_subasignaciones.push(request_sub.data);
            }catch(e){
              $scope.sub_subasignaciones = request_sub.data
            }             
            // $rootScope.changeAgrupacion2(padre);
            $rootScope.changeSubagrupacion2(padre)
            $scope.cancel();
          }
        })
        .catch(function (e) {
          l.stop();
          console.log('e', e);
        });
      };

      $scope.cancel = function() {
        if ($uibModalInstance) {
          $uibModalInstance.dismiss('cancel');
        }
      };
    }

    function ModalGroupCtrl($scope, $uibModalInstance) {
        $scope.ok = function() {
            var flag = false;
            var form = angular.copy($scope.groupForm);
            var name = form.group_name;
            var bd_group_name = [];
            $scope.changeResponsable = function(data){
              $scope.groupForm.responsable = data;
            }

            groupService.getGroups()
                .then(function(res) {
                    res.forEach(function(group, i) {
                        bd_group_name.push(String(group.group_name));
                    });


                    for (var i = 0; i < bd_group_name.length; i++) {
                        if (name == bd_group_name[i]) {
                            flag = true;
                        }
                    }
                    if (flag == false) {
                        return groupService.createGroup(form)
                            .then(function(data) {
                                vm.groups.push(data.data);
                                if ($uibModalInstance)
                                    $uibModalInstance.close();
                            }).catch(function() {

                                return;
                            });
                    } else {
                      SweetAlert.swal("ERROR", MESSAGES.ERROR.THISNAMEALREADYEXIST, "error");
                      return;
                    }
                });

        };

        $scope.cancel = function() {
            if ($uibModalInstance)
                $uibModalInstance.dismiss('cancel');
        };
    }

    // Delete contratantes popup
    function openModalDeleteContratantes() {
        var modalInstance = $uibModal.open({ //jshint ignore:line
            templateUrl: 'app/contratantes/contratantes.delete.html',
            controller: ModalInstanceCtrl,
            //windowClass: 'animated fadeIn'
        });
    }

    function ModalInstanceCtrl($scope, $uibModalInstance) {
        var data = returnType();
        $scope.ok = function() {
            return ContratanteService.deleteContratante(data)
                .then(function() {
                    if ($uibModalInstance)
                        $uibModalInstance.close();
                    $state.go('fianzas.pprovlist');
                });
        };

        $scope.cancel = function() {
            if ($uibModalInstance)
                $uibModalInstance.dismiss('cancel');
        };
    }

    function cancel() {
        $window.location.reload();
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    $scope.sendResponsables = function(url, typePerson){
          if(typePerson == 1){
            for(var i=0; i<vm.form.resp_contractor.length; i++){
              // vm.form.responsables[i].natural = url;
              vm.form.resp_contractor[i].contractor = url;
            }
            vm.responsable = vm.form.resp_contractor;
          }
          else{
            for(var i=0; i<vm.juridicalForm.resp_contractor.length; i++){
              // vm.juridicalForm.responsables[i].juridical = url;
              vm.juridicalForm.resp_contractor[i].contractor = url;
            }
            vm.responsable = vm.juridicalForm.resp_contractor;
          }

          vm.responsable.forEach(function(r){
            if (r.url){$http.patch(r.url, {'resp_type': r.resp_type, 'responsable': r.responsable});}
          });

          vm.responsable = vm.responsable.filter(function(r) {
            if (!r.url){
              return true;
            } else 
            return false;
          });




          if(vm.responsable){
            dataFactory.post('responsables/', vm.responsable)
            .then(
              function success(request){
              },
              function error(error) {
                console.log(error);
              })
            .catch(function(e){
              console.log(e);
            });
          }
        }

    function save() {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();

        if(vm.form){
          $scope.obligados = [];
          if (vm.form.obligados) {
            vm.form.obligados.forEach(function(elem, index) {
              if (elem.val) {
                if (elem.value) {                
                  $scope.obligados.push(elem.value.url);
                }
              }
            });              
          }
          vm.form.bound_solidarity_many = $scope.obligados ? $scope.obligados : [];
          if(vm.form.first_name == "" || vm.form.first_name == undefined){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMNAME, "error");
            return;
          }
          if(vm.form.last_name == "" || vm.form.last_name == undefined){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMLASTNAME, "error");
            return;
          }
          if(vm.form.birthday == "" || vm.form.birthday == undefined){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMBIRTHDAY, "error");
            return;
          }
          if(vm.form.rfc == "" || vm.form.rfc == undefined){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMRFC, "error");
            return;
          }
          if(vm.form.email){
            if(vm.form.email != "" || !vm.form.email || vm.form.email != null || !(vm.form.email == '')){
              if(!validateEmail(vm.form.email)){
                l.stop();
                SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
                return;
              }
            }
          }
          $scope.flagEmail = false;
          if(vm.form.email_natural.length > 0){
            for(var i = 0; i < vm.form.email_natural.length; i++){
              if(!validateEmail(vm.form.email_natural[i].correo)){
                $scope.flagEmail = true;
              }
            }
            if($scope.flagEmail == true){
              l.stop();
              $scope.flagEmail = false;
              SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
              return;
            }
          }
        }
        else{
          $scope.obligados = [];
          if (vm.juridicalForm.obligados) {
            vm.juridicalForm.obligados.forEach(function(elem, index) {
              if (elem.val) {
                if (elem.value) {                
                  $scope.obligados.push(elem.value.url);
                }
              }
            });              
          }
          if(vm.juridicalForm.j_name == "" || vm.juridicalForm.j_name == undefined){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMJNAME, "error");
            return;
          }
          if(vm.juridicalForm.date_of_establishment == "" || vm.juridicalForm.date_of_establishment == undefined){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMESTABLISHMENT, "error");
            return;
          }
          if(vm.juridicalForm.rfc == "" || vm.juridicalForm.rfc == undefined){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMRFC, "error");
            return;
          }
          if(vm.juridicalForm.email != ""){
            if(!validateEmail(vm.juridicalForm.email)){
              l.stop();
              SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
              return;
            }
          }
          $scope.flagEmail = false;
          if(vm.juridicalForm.email_juridical.length > 0){
            for(var i = 0; i < vm.juridicalForm.email_juridical.length; i++){
              if(!validateEmail(vm.juridicalForm.email_juridical[i].correo)){
                $scope.flagEmail = true;
              }
            }
            if($scope.flagEmail == true){
              l.stop();
              $scope.flagEmail = false;
              SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
              return;
            }
          }
        }

        var flag = false;
        var type = returnType();
        if (!type.group.url) {
            SweetAlert.swal("ERROR", MESSAGES.ERROR.SELGROUP, "error");
            flag = true;
            return;
        }

        var dataToSave = angular.copy(type)
        $scope.group_obj = type.group;
        dataToSave.group = type.group.url;

        if(dataToSave.birthday) {

            var date = dataToSave.birthday;
            var newdate = date.split("/").reverse().join("-");
            // dataToSave.birthday = newdate;
            dataToSave.birth_date = newdate;
            try{
              if (dataToSave.birthday.length <= 8) {
                l.stop();
                SweetAlert.swal("Error",MESSAGES.ERROR.DATEBIRTHDAY, "error");
                return;
              }

            }catch(e){
            }

        } else if(dataToSave.date_of_establishment) {

            if(isNaN(dataToSave.date_of_establishment)) {
                var date = dataToSave.date_of_establishment;
                var newdate = date.split("/").reverse().join("-");
                // dataToSave.date_of_establishment = newdate;
                dataToSave.birth_date = newdate;

            } else {

                vm.juridicalForm.group = $scope.group_obj;
                vm.juridicalForm.date_of_establishment = '';
                toaster.warning('Ingrese una fecha valida');
                return;

            }
            try{
              if (dataToSave.date_of_establishment.length <= 8) {
                l.stop();
                SweetAlert.swal("Error",MESSAGES.ERROR.DATEESTABLISHMENT, "error");
                return;
              }

            }catch(e){
            }

        } else {
            vm.form.group = $scope.group_obj;
            toaster.warning('Ingrese una fecha valida');
            return;
        }


        if(vm.form){
          dataToSave.email = vm.form.email ? vm.form.email : "";
          dataToSave.phone_number = vm.form.phone_number ? vm.form.phone_number : "";
          dataToSave.sucursal = vm.form.sucursal ? vm.form.sucursal.url : ''
          if(dataToSave.email == "" && vm.form.email_natural.length > 0){
            dataToSave.email = vm.form.email_natural[0].correo;
            vm.form.email_natural.splice(0, 1);
          }
          // Documents
          if (vm.org_name == 'ancora') {
            dataToSave.card_official_identification = vm.listDocument[0].value;
            dataToSave.CURP = vm.listDocument[1].value;
            dataToSave.voucher_efirm = vm.listDocument[2].value;
            dataToSave.voucher_of_address = vm.listDocument[3].value;
            dataToSave.signed_format_ic = vm.listDocument[4].value;
            if (vm.form.only_sureties) {
              dataToSave.carta_nombramiento = vm.listDocument[5].value;
              dataToSave.curriculo = vm.listDocument[6].value;
              dataToSave.contrato_multiple_afianzadora = vm.listDocument[7].value;
              dataToSave.carta_buro = vm.listDocument[8].value;
              dataToSave.entrevista_afianzadora = vm.listDocument[9].value;
              dataToSave.rfc_document = vm.listDocument[10].value;            
              dataToSave.recibos_nomina = vm.listDocument[11].value;
              dataToSave.declaracion_anual = vm.listDocument[11].value;
              dataToSave.estados_financieros_anuales = vm.listDocument[13].value;
              dataToSave.estados_financieros_parciales = vm.listDocument[14].value;
              dataToSave.alta_hacienda = vm.listDocument[15].value; 
              dataToSave.escritura_inmueble = vm.listDocument[16].value;
              dataToSave.boleta_predial = vm.listDocument[17].value;
              dataToSave.certificado_gravamen = vm.listDocument[18].value; 
            }            
          }else{
            dataToSave.card_official_identification = vm.listDocument[0].value;
            dataToSave.CURP = vm.listDocument[1].value;
            dataToSave.voucher_efirm = vm.listDocument[2].value;
            dataToSave.voucher_of_address = vm.listDocument[3].value;
            dataToSave.signed_format_ic = vm.listDocument[4].value;
            dataToSave.fiscal_power = vm.listDocument[5].value;
            if (vm.form.only_sureties) {
              dataToSave.carta_nombramiento = vm.listDocument[6].value;
              dataToSave.curriculo = vm.listDocument[7].value;
              dataToSave.contrato_multiple_afianzadora = vm.listDocument[8].value;
              dataToSave.carta_buro = vm.listDocument[9].value;
              dataToSave.entrevista_afianzadora = vm.listDocument[10].value;
              dataToSave.rfc_document = vm.listDocument[11].value;            
              dataToSave.recibos_nomina = vm.listDocument[12].value;
              dataToSave.declaracion_anual = vm.listDocument[13].value;
              dataToSave.estados_financieros_anuales = vm.listDocument[14].value;
              dataToSave.estados_financieros_parciales = vm.listDocument[15].value;
              dataToSave.alta_hacienda = vm.listDocument[16].value; 
              dataToSave.escritura_inmueble = vm.listDocument[17].value;
              dataToSave.boleta_predial = vm.listDocument[18].value;
              dataToSave.certificado_gravamen = vm.listDocument[19].value; 
            } 
          }
          //upload files repect documents
          vm.listDocument.forEach(function(ar) {  
            if (ar.arch.formData) {
              var extension = ar.arch.formData[0].arch.name.split('.')[1];
              ar.arch.formData[0].name = ar.name+'.'+extension
              ar.arch.file.name = ar.name+'.'+extension
              $scope.uploaderDocument.queue.push(ar.arch)
              $scope.uploaderDocument.onAfterAddingFile(ar.arch)
            }
          })
          for(var i = 0; i < vm.form.phone_natural.length; i++){
            if(vm.form.phone_natural[i].phone.length < 9){
              $scope.flagPhone = true;
            }
          }
          if(!$scope.flagPhone){
            if(dataToSave.phone_number == "" && vm.form.phone_natural.length > 0){
              dataToSave.phone_number = vm.form.phone_natural[0].phone;
              vm.form.phone_natural.splice(0, 1);
            }
          } else{
            $scope.flagPhone = false;
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONE, "error");
            return;
          } 

          try{
            dataToSave.vendor = vm.form.vendedor.url
          }
          catch(e){
            dataToSave.vendor = '';
          }
          try{
            dataToSave.sucursal = vm.form.sucursal.url
          }
          catch(e){
            dataToSave.sucursal = '';
          }

          try{
            dataToSave.responsable = vm.form.responsable.url
          }
          catch(e){
            dataToSave.responsable = '';
          }
        }

        if(vm.juridicalForm){
          dataToSave.email = vm.juridicalForm.email ? vm.juridicalForm.email : "";
          dataToSave.phone_number = vm.juridicalForm.phone_number ? vm.juridicalForm.phone_number : "";
          dataToSave.sucursal = vm.juridicalForm.sucursal ? vm.juridicalForm.sucursal.url : ''
          if(dataToSave.email == "" && vm.juridicalForm.email_juridical.length > 0){
            dataToSave.email = vm.juridicalForm.email_juridical[0].correo;
            vm.juridicalForm.email_juridical.splice(0, 1);
          }

          if(dataToSave.phone_number){
            if(dataToSave.phone_number.length < 9){
              l.stop();
              SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONE, "error");
              return;
            }
          }

          try{
            dataToSave.vendor = vm.juridicalForm.vendedor.url
          }
          catch(e){
            dataToSave.vendor = '';
          }

          try{
            dataToSave.sucursal = vm.juridicalForm.sucursal.url
          }
          catch(e){
            dataToSave.sucursal = '';
          }

          try{
            dataToSave.responsable = vm.juridicalForm.responsable.url
          }
          catch(e){
            dataToSave.responsable = '';
          }

          for(var i = 0; i < vm.juridicalForm.phone_juridical.length; i++){
            if(vm.juridicalForm.phone_juridical[i].phone.length < 9){
              $scope.flagPhone = true;
            }
          }
          if(!$scope.flagPhone){
            if(dataToSave.phone_number == "" && vm.juridicalForm.phone_juridical.length > 0){
              dataToSave.phone_number = vm.juridicalForm.phone_juridical[0].phone;
              vm.juridicalForm.phone_juridical.splice(0, 1);
            }
          }
          else{
            $scope.flagPhone = false;
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONE, "error");
            return;
          } 
          // Documents

          dataToSave.constitutive_act = vm.listDocument[0].value;
          dataToSave.rfc_document = vm.listDocument[1].value;
          dataToSave.card_official_identification = vm.listDocument[2].value;
          dataToSave.voucher_of_address = vm.listDocument[3].value;
          dataToSave.modifications_constitutive_act = vm.listDocument[4].value;
          dataToSave.fiscal_power = vm.listDocument[5].value;
          if (vm.juridicalForm.only_sureties) {
            dataToSave.curriculo = vm.listDocument[6].value;
            dataToSave.contrato_multiple_afianzadora = vm.listDocument[7].value;
            dataToSave.carta_buro = vm.listDocument[8].value;
            dataToSave.entrevista_afianzadora = vm.listDocument[9].value;
            dataToSave.aviso_privacidad = vm.listDocument[10].value;
            dataToSave.protocolizaciones = vm.listDocument[11].value;
            dataToSave.alta_hacienda = vm.listDocument[12].value;
            dataToSave.cambio_domicilio_hacienda = vm.listDocument[13].value;
            dataToSave.voucher_efirm = vm.listDocument[14].value;
            dataToSave.declaracion_anual = vm.listDocument[15].value;
            dataToSave.estados_financieros_anuales = vm.listDocument[16].value;
            dataToSave.estados_financieros_parciales = vm.listDocument[17].value;
            dataToSave.escritura_inmueble = vm.listDocument[18].value;
            dataToSave.boleta_predial = vm.listDocument[19].value;
            dataToSave.certificado_gravamen = vm.listDocument[20].value; 
          }             
          //upload files repect documents
          vm.listDocument.forEach(function(ar) {  
            if (ar.arch.formData) {
              var extension = ar.arch.formData[0].arch.name.split('.')[1];
              ar.arch.formData[0].name = ar.name+'.'+extension
              ar.arch.file.name = ar.name+'.'+extension
              $scope.uploaderDocument.queue.push(ar.arch)
              $scope.uploaderDocument.onAfterAddingFile(ar.arch)
            }
          })
          //upload documents
        }

        if(dataToSave.contact_natural){
          dataToSave.contact_natural.forEach(function(contact) {
            if(contact.name == ""){
              l.stop();
              SweetAlert.swal("Error", MESSAGES.ERROR.SELADDRES, "error");
              flag = true;
              return;
            }
            else{
              if(contact.email){
                if (!validateEmail(contact.email)) {
                  l.stop();
                  SweetAlert.swal("Error", MESSAGES.ERROR.INVALIDEMAILCONTACT, "error");
                  flag = true;
                  return;
                }
              }
              if (contact.phone_number) {
                if(contact.phone_number.length < 9){                  
                  l.stop();
                  flag = true;
                  SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONECONTACT, "error");
                  return;
                }
              }
            }
          });
        }
        else{
          dataToSave.contact_juridical.forEach(function(contact) {
            if(contact.name == ""){
              l.stop();
              SweetAlert.swal("Error", MESSAGES.ERROR.SELADDRES, "error");
              flag = true;
              return;
            }
            else{
              if(contact.email){
                if (!validateEmail(contact.email)) {
                  l.stop();
                  SweetAlert.swal("Error", MESSAGES.ERROR.INVALIDEMAILCONTACT, "error");
                  flag = true;
                  return;
                }
              }              
              if (contact.phone_number) {
                if(contact.phone_number.length < 9){
                  l.stop();
                  flag = true;
                  SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONECONTACT, "error");
                  return;
                }
              }
            }
          });
        }

        // dataToSave.group = vm.editForm.subsubgrupo ? vm.editForm.subsubgrupo.url : vm.editForm.subgroup ? vm.editForm.subgroup.url : vm.editForm.group ? vm.editForm.group.url : '';
        if (vm.editForm.group) {
          dataToSave.group = vm.editForm.group.url;
          if (vm.editForm.subgroup) {
            dataToSave.group = vm.editForm.subgroup.url;
            if (vm.editForm.subsubgrupo) {
              dataToSave.group = vm.editForm.subsubgrupo.url;
            }
          }
        }
        // dataToSave.grouping_level = vm.editForm.subsubasignaciones ? vm.editForm.subsubasignaciones.url : vm.editForm.subagrupaciones ? vm.editForm.subagrupaciones.url : vm.editForm.grouping_level ? vm.editForm.grouping_level.url : '';
        dataToSave.groupinglevel = vm.editForm.subsubasignaciones ? vm.editForm.subsubasignaciones.url : vm.editForm.subagrupaciones ? vm.editForm.subagrupaciones.url : vm.editForm.grouping_level ? vm.editForm.grouping_level.url : null;
        dataToSave.cellule = vm.juridicalForm ? vm.juridicalForm.celula : vm.form ? vm.form.celula : null

        if (flag) {
          return;
        }
        dataToSave.birth_date = datesFactory.toDate(vm.form ? vm.form.birthday : vm.juridicalForm.date_of_establishment);
        dataToSave.bound_solidarity_many = $scope.obligados ? $scope.obligados : [];
        dataToSave.has_bound_solidarity = $scope.has_solidario ? true : false;
        return ContratanteService.updateContratante(dataToSave)
            .then(function(data) {
              if(data.status === 200 || data.status === 201){

                
                // var params = {
                //   'model': 26,
                //   'event': "POST",
                //   'associated_id': data.data.id,
                //   'identifier': "actualizó el contratante."
                // }
                // dataFactory.post('send-log/', params).then(function success(response) {
                  
                // });
                console.log("3797",$scope.origin_contractor)
                console.log("3798",data.data)
                $scope.changes = [];
                if($scope.origin_contractor.first_name !== data.data.first_name){
                  var change_log = {
                    name: 'Nombre',
                    origin: $scope.origin_contractor.first_name,
                    change: data.data.first_name
                  }
                  $scope.changes.push(change_log);
                }
                if($scope.origin_contractor.last_name !== data.data.last_name){
                  var change_log = {
                    name: 'Apellido Paterno',
                    origin: $scope.origin_contractor.last_name,
                    change: data.data.last_name
                  }
                  $scope.changes.push(change_log);
                }
                if($scope.origin_contractor.j_name !== data.data.j_name){
                  var change_log = {
                    name: 'Nombre',
                    origin: $scope.origin_contractor.j_name,
                    change: data.data.j_name
                  }
                  $scope.changes.push(change_log);
                }
                if($scope.origin_contractor.birth_date !== data.data.birth_date){
                  var change_log = {
                    name: 'Fecha Cumpleaños',
                    origin: datesFactory.convertDate($scope.origin_contractor.birth_date),
                    change: datesFactory.convertDate(data.data.birth_date)
                  }
                  $scope.changes.push(change_log);
                }
                if($scope.origin_contractor.date_of_establishment !== data.data.date_of_establishment){
                  var change_log = {
                    name: 'Fecha Constitutiva',
                    origin: $scope.origin_contractor.date_of_establishment,
                    change: data.data.date_of_establishment
                  }
                  $scope.changes.push(change_log);
                }
                if($scope.origin_contractor.email !== data.data.email){
                  var change_log = {
                    name: 'Correo Electrónico',
                    origin: $scope.origin_contractor.email,
                    change: data.data.email
                  }
                  $scope.changes.push(change_log);
                }

                var paramsRec = {
                  'model': 26,
                  'event': "PATCH",
                  'associated_id': data.data.id,
                  'identifier': " actualizó la el contratante.",
                  'change': $scope.changes
                }

                dataFactory.post('send_log_specific/', paramsRec).then(function success(response){

                });

                if(data.data.email && !data.data.id){
                  l.stop();
                  SweetAlert.swal("ERROR", MESSAGES.ERROR.ERROREMAILMAX, "error");
                  return;
                }

                $scope.contractorEdit = data.data;

                if(data){
                  if(data.data.type_person == 1){
                    if ($scope.uploaderDocument.queue.length !=0) {
                      uploadFilesList(data.data.type_person, data.data.id);
                    }
                    $scope.sendEmails(data.data.id, 1);
                    $scope.sendPhones(data.data.id, 1);
                    $scope.sendResponsables(data.data.url, 1);
                  }
                  else if(data.data.type_person == 2){
                    if ($scope.uploaderDocument.queue.length !=0) {
                      uploadFilesList(data.data.type_person, data.data.id);
                    }
                    $scope.sendEmails(data.data.id, 2);
                    $scope.sendPhones(data.data.id, 2);
                    $scope.sendResponsables(data.data.url, 2);
                  }

                }
                  if (helpers.isResponseOk(data.status)) {
                      var contacts = ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person=== 1) ? type.contact_natural : type.contact_juridical;

                      contacts.forEach(function(elem) {
                          if ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person=== 1) {
                              // elem.natural = data.data.url;
                              elem.contractor = data.data.url;
                          } else {
                              // elem.juridical = data.data.url;
                              elem.contractor = data.data.url;
                          }

                          var nums = [];

                          $('.telefono').each(function(telefono) {
                              var actual = $(this);
                              nums.push(actual);
                          })
                          var typePerson;
                          if ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person === 1) {
                              typePerson = vm.form.contact_natural
                          } else {
                              typePerson = vm.juridicalForm.contact_juridical
                          }


                          if (!elem.url) {
                              contactService.createContact(elem);
                          } else {
                              contactService.updateContact(elem);
                          }

                          if(elem.email){
                            if (!validateEmail(elem.email)) {
                              toaster.warning("Favor de revisar el formato del correo de el contacto");
                              flag = true;
                            }
                            if(!elem.name){
                              toaster.warning("Favor de añadir nombre en el contacto");
                              flag = true;
                            }
                          }
                      });
                      var address = (type.address_natural) ? type.address_natural : type.address_juridical;
                      if (!helpers.hasAtLeastOneAddress(address)) {
                        l.stop();
                        SweetAlert.swal("ERROR", MESSAGES.ERROR.ADDATLEASTONEDIRECCTION, "error");
                        flag = true;
                        return;
                      }
                      address.forEach(function(elem) {
                          if (flag) {
                              return;
                          }

                          elem = {
                              raw: elem.raw,
                              street_address: elem.street_address,
                              intersection: elem.intersection,
                              political: elem.political,
                              administrative_area_level_1: elem.administrative_area_level_1.state,
                              administrative_area_level_1_short: elem.administrative_area_level_1_short,
                              administrative_area_level_2: elem.administrative_area_level_2.city,
                              administrative_area_level_3: elem.administrative_area_level_3,
                              colloquial_area: elem.colloquial_area,
                              sublocality: elem.sublocality,
                              neighborhood: elem.neighborhood,
                              premise: elem.premise,
                              subpremise: elem.subpremise,
                              natural_feature: elem.natural_feature,
                              country: elem.country,
                              country_code: elem.country_code,
                              locality: elem.locality,
                              postal_code: elem.postal_code,
                              route: elem.route,
                              street_number: elem.street_number,
                              street_number_int: elem.street_number_int,
                              formatted: elem.formatted,
                              latitude: elem.latitude,
                              longitude: elem.longitude,
                              details: elem.details,
                              composed: elem.composed,
                              address: elem.address,
                              url: globalVar.address,
                              tipo: elem.tipo ? elem.tipo.name : elem.tipo,
                              id: elem.id || null
                          };

                          if ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person === 1) {
                              // elem.natural = data.data.url;
                              elem.contractor = data.data.url;
                          } else {
                              // elem.juridical = data.data.url;
                              elem.contractor = data.data.url;
                          }
                          if (!elem.id) {
                              generalService.postService(elem).then(function(data) {
                                if (!helpers.isResponseOk(data.status)) {
                                  l.stop();
                                  SweetAlert.swal("ERROR", MESSAGES.ERROR.UPDATECONTRACTOR, "error");
                                  return;
                                }
                              });
                          } else {
                              generalService.updateAddressService(elem).then(function(data) {
                                if (!helpers.isResponseOk(data.status)) {
                                  l.stop();
                                  SweetAlert.swal("ERROR", MESSAGES.ERROR.UPDATECONTRACTOR, "error");
                                  return;
                                }
                              });
                          }
                      });

                      if (flag) {
                          return;
                      }
                      SweetAlert.swal("¡Listo!", MESSAGES.OK.UPDATECONTRACTOR, "success");
                      $timeout(function() {
                        $state.reload();
                        $state.go('fianzas.pprovinfo', {
                          type: $scope.contractorEdit.type_person == 1 ? 'fisicas' : 'morales',
                          contratanteId: $scope.contractorEdit.id
                        });
                      }, 1000);

                  } else {
                    l.stop();
                      SweetAlert.swal("ERROR", MESSAGES.ERROR.UPDATECONTRACTOR, "error");
                      return;
                      vm.form.group = $scope.group_obj;
                  }
              }

            });

    }
    function save_moral() {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        if(vm.juridicalForm.j_name == "" || vm.juridicalForm.j_name == undefined){
          l.stop();
          SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMJNAME, "error");
          return;
        }

        var flag = false;
        var dataToSave = vm.juridicalForm

        if(vm.juridicalForm){
          try{
            dataToSave.vendor = vm.juridicalForm.vendedor.url
          }
          catch(e){
            dataToSave.vendor = '';
          }

          try{
            dataToSave.sucursal = vm.juridicalForm.sucursal.url
          }
          catch(e){
            dataToSave.sucursal = '';
          }

          try{
            dataToSave.responsable = vm.juridicalForm.responsable.url
          }
          catch(e){
            dataToSave.responsable = '';
          }
        }

        // dataToSave.group = vm.editForm.subsubgrupo ? vm.editForm.subsubgrupo.url : vm.editForm.subgroup ? vm.editForm.subgroup.url : vm.editForm.group ? vm.editForm.group.url : '';
        if (vm.editForm.group) {
          dataToSave.group = vm.editForm.group.url;
          if (vm.editForm.subgroup) {
            dataToSave.group = vm.editForm.subgroup.url;
            if (vm.editForm.subsubgrupo) {
              dataToSave.group = vm.editForm.subsubgrupo.url;
            }
          }
        }
        dataToSave.full_name = vm.juridicalForm.j_name
        return ContratanteService.updateContratante(dataToSave)
            .then(function(data) {
              if(data.status === 200 || data.status === 201){
                $scope.changes = [];    

                $scope.contractorEdit = data.data;
                  if (helpers.isResponseOk(data.status)) {
                      SweetAlert.swal("¡Listo!", MESSAGES.OK.UPDATECONTRACTOR, "success");
                      $timeout(function() {
                        $state.reload();
                        $state.go('fianzas.pprovinfo', {
                          type: $scope.contractorEdit.type_person == 1 ? 'fisicas' : 'morales',
                          contratanteId: $scope.contractorEdit.id
                        });
                      }, 1000);

                  } else {
                    l.stop();
                      SweetAlert.swal("ERROR", MESSAGES.ERROR.UPDATECONTRACTOR, "error");
                      return;
                      vm.form.group = $scope.group_obj;
                  }
              }

            });

    }
    $scope.getLog = function(){
      dataFactory.get('get-specific-log', {'model': 26, 'associated_id': vm.form ? vm.form.id : vm.juridicalForm.id})
      .then(function success(response){
        var modalInstance = $uibModal.open({
          templateUrl: 'app/colectivos/log.modal.html',
          controller: 'LogCtrl',
          size: 'lg',
          resolve: {
            log: function() {
              return response.data;
            }
          },
          backdrop: 'static',
          keyboard: false
        });
        modalInstance.result.then(function(receipt){
          vm.receipts.splice(index, 1);
          activate();
        });
      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    vm.hoy=new Date();

    function returnType() {
        if ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person
                       === 1) {

            rfc_getDateEn(vm.form.rfc,vm.form);
                function rfc_getDateEn (rfc,form){
                   vm.rfc_fec= rfc.substr(4, 6);
                   vm.rfc_anio = rfc.substr(4, 2);
                   vm.rfc_month = rfc.substr(6, 2);
                   vm.rfc_day = rfc.substr(8, 2);
                   vm.fecha= vm.rfc_month+'/'+vm.rfc_day+'/'+vm.rfc_anio;
                   vm.date = new Date(vm.fecha);
                   vm.aniorfc= vm.date.getFullYear();
                   vm.hoyA=vm.hoy.getFullYear();
                    if(vm.aniorfc > vm.hoyA){
                        vm.resta=vm.aniorfc-100;
                        vm.rfc_anio = vm.resta;
                        vm.fecha= vm.rfc_month+'/'+vm.rfc_day+'/'+vm.rfc_anio;
                           if(form.birthday == ""){
                           vm.form.birthday = vm.fecha;
                            }else{
                                vm.form.birthday = form.birthday;
                        }
                    }
                    if(form.birthday == ""){
                        var fecha_rfcn= $filter('date')(new Date(vm.date), 'dd/MM/yyyy');
                        vm.form.birthday = fecha_rfcn;
                        }else{
                            vm.form.birthday = form.birthday;
                        }
                    }
                return vm.form;
        } else {
            rfc_getDateEj(vm.juridicalForm.rfc,vm.juridicalForm);
                function rfc_getDateEj (rfc,form){
                    vm.rfc_fec= rfc.substr(3, 6);
                    vm.rfc_anio = rfc.substr(3, 2);
                    vm.rfc_month = rfc.substr(5, 2);
                    vm.rfc_day = rfc.substr(7, 2);
                    vm.fecha= vm.rfc_month+'/'+vm.rfc_day+'/'+vm.rfc_anio;
                    vm.date = new Date(vm.fecha);
                    vm.aniorfc= vm.date.getFullYear();
                    vm.hoyA=vm.hoy.getFullYear();
                    if(vm.aniorfc > vm.hoyA){
                        vm.resta=vm.aniorfc-100;
                        vm.rfc_anio = vm.resta;
                        vm.fecha= vm.rfc_month+'/'+vm.rfc_day+'/'+vm.rfc_anio;
                           if(form.date_of_establishment == ""){
                            var fecha_rfcJ= $filter('date')(new Date(vm.fecha), 'dd/MM/yyyy');
                           vm.juridicalForm.date_of_establishment = fecha_rfcJ;
                            }else{
                                vm.juridicalForm.date_of_establishment = form.date_of_establishment;
                        }
                    }
                   if(form.date_of_establishment == ""){
                        var fecha_rfcJ= $filter('date')(new Date(vm.date), 'dd/MM/yyyy');
                        vm.juridicalForm.date_of_establishment = fecha_rfcJ;
                    }else{
                        vm.juridicalForm.date_of_establishment = form.date_of_establishment;
                    }
                }
            return vm.juridicalForm;
        }
    }

    function deleteContacts(index, type, contact) {
      $localStorage.indx = index;
      $localStorage.urll = contact.url;
      // var modalInstance = $uibModal.open({
      //   templateUrl: 'app/contratantes/contratantes.deleteContact.html',
      //   controller: ModalInstanceCtrlDeleteContact,
      // });
      SweetAlert.swal({
        title: "¿Estás seguro?",
        text: "Los cambios no podrán revertirse",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si",
        cancelButtonText: "No"
      },
      function(){
        var index = $localStorage.indx;
        var url = $localStorage.urll;
        if (url && index || url && !index) {
          try {
            return contactService.deleteContact(url)
              .then(function() {
                toaster.success(MESSAGES.OK.DELETECONTRACTOR);

                if ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person === 1) {
                  vm.form.contact_natural.splice(index, 1);
                } else {
                  vm.juridicalForm.contact_juridical.splice(index, 1);
                }
              });
          }
          catch (err) {
            throw (err);
          }
        } 
        else {
          if ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person=== 1) {
            vm.form.contact_natural.splice(index, 1);
          } else {
            vm.juridicalForm.contact_juridical.splice(index, 1);
          }
        }
      }); 
    }


    function ModalInstanceCtrlDeleteContact($scope, $uibModalInstance) {
        var index = $localStorage.indx;
        var url = $localStorage.urll;
        $scope.ok = function() {
            if (url && index || url && !index) {
                try {
                    return contactService.deleteContact(url)
                        .then(function() {
                            toaster.success(MESSAGES.OK.DELETECONTRACTOR);
                            $uibModalInstance.dismiss('cancel');
                            if ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person=== 1) {
                                vm.form.contact_natural.splice(index, 1);
                            } else {
                                vm.juridicalForm.contact_juridical.splice(index, 1);
                            }
                        });
                } catch (err) {
                    throw (err); // toaster.error('Agregue al menos un contacto' + err.message);
                }
                $uibModalInstance.dismiss('cancel');
            } else {
                if ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person=== 1) {
                    vm.form.contact_natural.splice(index, 1);
                } else {
                    vm.juridicalForm.contact_juridical.splice(index, 1);
                }
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
                email: ''
            } //jshint ignore:line
        if ($stateParams.type === 'fisicas' || $stateParams.contractor.type_person=== 1) {
            vm.form.contact_natural.push(contact);
        } else {
            vm.juridicalForm.contact_juridical.push(contact);
        }
    }
    $window.localStorage.editCont = false;

}
