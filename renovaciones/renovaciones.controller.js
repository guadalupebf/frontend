(function(){
  'use strict';
  /* jshint devel: true */

  angular.module('inspinia')
      .controller('RenovacionesCtrl', RenovacionesCtrl);
  RenovacionesCtrl.$inject = ['SweetAlert', 'providerService','insuranceService','$uibModal', 'modalService', 
  'MESSAGES', 'helpers','$http','url','$parse', '$scope','$state', '$sessionStorage', 'toaster',
  'formatValues', 'coverageService','exportFactory','datesFactory', 'appStates','$localStorage', '$rootScope'];

  function RenovacionesCtrl(SweetAlert, providerService, insuranceService, $uibModal, modalService,
    MESSAGES, helpers,$http,url,$parse, $scope, $state,   $sessionStorage, toaster,
    formatValues, coverageService,exportFactory,datesFactory, appStates, $localStorage, $rootScope) {

    function setRenewalDraft(policy) {
      $rootScope.renewalDraftPolicy = angular.copy(policy) || null;
    }

    function clearRenewalDraft() {
      $rootScope.renewalDraftPolicy = null;
    }


    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
    $scope.orgName = usr.orgname
    var vm = this;
    vm.pageTitle = 'Grupos';
    vm.submit = submit;
    vm.insurances = [];
    vm.table = {};
    vm.tableRes = {};
    vm.openRenovateModal = openRenovateModal;
    vm.responsiv=responsiv;
    vm.getRenovaciones = getRenovaciones;
    vm.testPagination = testPagination;
    vm.changeProvider = changeProvider;
    vm.changeRamo = changeRamo;
    vm.changeSubRamo = changeSubRamo;
    vm.changeStatus = changeStatus;
    vm.changePayment = changePayment;
    vm.changeUntil = changeUntil;
    vm.Generar = Generar;
    vm.matchesContractors = matchesContractors;
    vm.matchesGroup = matchesGroup;
    vm.showBinnacle = showBinnacle;
    vm.returnToReceipts = returnToReceipts;
    vm.matchesGroupinglevel = matchesGroupinglevel;
    vm.matchesClassification = matchesClassification;
    vm.changeBLine = changeBLine;
    vm.changeSubgroup = changeSubgroup;
    vm.changeSubsubgroup = changeSubsubgroup;
    vm.only_caratula_poliza = 0
    vm.changeSubgrouping = changeSubgrouping;
    vm.changeSubsubgrouping = changeSubsubgrouping;
    $scope.subgroups = [];
    $scope.subsubgroups = [];
    $scope.subgrouping = [];
    $scope.subsubgrouping = [];
    vm.show_binnacle = false;
    vm.word = '';
    vm.form = getDefaultFilters();

    vm.table = {
      headers: [
        'Número de póliza',
        'Contratante',
        'Tipo',
        'Aseguradora',
        'Paquete',
        'Subramo',
        'Fecha de Inicio',
        'Fecha de Fin',
        'Forma de pago',
        'Estatus',
        'Antigüedad',
        'Acciones',
      ]
    };
    vm.tableRes = {
      headers: [
        'Número de póliza',
        'Contratante',
        'Tipo',
        'Aseguradora',
        'Paquete',
        'Subramo',
        'Fecha de Inicio',
        'Fecha de Fin',
        'Forma de pago',
        'Estatus',
        'Antigüedad',
        'Acciones',
      ]
    };
    vm.option = [{
      id: 1,
      name: 'Renovadas'
    }, {
      id: 2,
      name: 'Por renovar'
    }]
    vm.option_tp = [{
      id: 1,
      name: 'Individual'
    }, {
      id: 3,
      name: 'Póliza de Grupo'
    }, {
      id: 11,
      name: 'Colectividad'
    }, {
      id: 12,
      name: 'Póliza de Colectividad'
    }]
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

    vm.payment = [{
      id: 1,
      name: 'Mensual'
    }, {
      id: 2,
      name: 'Bimestral'
    }, {
      id: 3,
      name: 'Trimestral'
    }, {
      id: 4,
      name: 'Cuatrimestral'
    }, {
      id: 5,
      name: 'Contado'
    }, {
      id: 6,
      name: 'Semestral'
    }, {
      id: 12,
      name: 'Anual'
    }];

    vm.status = [{
      id: 1,
      name: 'En trámite'
    }, {
      id: 2,
      name: 'OT Cancelada'
    }, {
      id: 4,
      name: 'Precancelada'
    }, {
      id: 10,
      name: 'Por iniciar'
    }, {
      id: 11,
      name: 'Cancelada'
    }, {
      id: 12,
      name: 'Renovada'
    }, {
      id: 13,
      name: 'Vencida'
    }, {
      id: 14,
      name: 'Vigente'
    }, {
      id: 15,
      name: 'No renovada'
    }];

    function getDefaultFilters() {
      return {
        provider: 0,
        ramo: 0,
        subramo: 0,
        since: datesFactory.convertDate(new Date()),
        until: datesFactory.convertDate(new Date()),
        payment: 0,
        status: 0,
        contratante: 0,
        grupo: '',
        renovadas: 1,
        businesLine: 0,
        subgroup: 0,
        subsubgroup: 0,
        groupinglevel: 0,
        subgrouping: 0,
        classification: 0,
        subsubgrouping: 0,
        business_line: 0,
        celula: 0,
        only_caratula: 0
      };
    }
    vm.businesLine = [{
      id: 1,
      name: 'Comercial'
    }, {
      id: 2,
      name: 'Personal'
    }, {
      id: 3,
      name: 'Otro'
    }];
    /* Información de usuario */
    $scope.infoUser = $sessionStorage.infoUser;

    activate(1,1,1);
    getCelulasContractor();
    vm.getCaratulas = getCaratulas;
    function getCaratulas(parId){
      var results = [];
      var mapeo_caratulas = [];
      if(parId) {
        if(parId.val.length >= 3) {
          $scope.show_cds = 'get-all-caratulas/';
          $http({
            method: 'POST',
            url: url.IP + $scope.show_cds,
            data: {
              word: parId.val,
            }
          }) 
          .then(
            function success(request){
              var results = [];
              var mapeo_caratulas = [];
              if(request.status == 200){
                if(request.data.length == 0){
                  vm.only_caratula_poliza = 0;           
                  $scope.autocompleteData = []; 
                  vm.word.id = 0
                  toaster.warning("Carátula no encontrada");
                }else{
                  request.data.forEach(function(poliza) {
                    vm.policy = poliza        
                    if(poliza.document_type == 11){
                      mapeo_caratulas.push(poliza);
                    }
                  });
                  results = _.map(mapeo_caratulas, function(item){
                    if(item.contractor) {
                      var label = item.poliza_number+ ' - '+item.contractor.full_name + ' - '+convertDate(vm.policy.start_of_validity)+' - ' +convertDate(vm.policy.end_of_validity);
                    }else{
                      var label = item.poliza_number
                    }
                    return{
                      label: label,
                      value: item.poliza_number,
                      id: item.id,
                      document_type: item.document_type
                    }
                  });
                  $scope.autocompleteData = results;
                }
              }
            }, 
            function error (error) {
            }
          )
          .catch(function(e) {
            console.log('e', e);
          });
        }else{
          vm.only_caratula_poliza = 0;           
          $scope.autocompleteData = []; 
          vm.word.id = 0
        }
      }
    }
    vm.getCarSelected = getCarSelected;
    function getCarSelected(caratula){
      vm.only_caratula_poliza = caratula.id
    }

    $scope.ShowContextMenu = function(myInsurance){
      var params = {};
      $scope.id_for_new_tab = myInsurance.id;
      if (myInsurance.document_type == 1) {
        // $scope.id_for_new_tab = 0;
        // params = { 'myInsurance': myInsurance, 'container': vm.insurances };
        params = { polizaId: myInsurance.id }
        $scope.name_for_new_tab = 'Renovación pólizas';
        $scope.route_for_new_tab = 'renovaciones.polizas';
        $scope.params_for_new_tab = params;
        // $state.go('renovaciones.polizas', params);
      }else if (myInsurance.document_type == 3) {
        $scope.name_for_new_tab = 'Renovación colectividades';
        params = {polizaId: myInsurance.id}
        $scope.route_for_new_tab = 'colectividades.renewal';
        $scope.params_for_new_tab = params;
        // $state.go('colectividades.renewal', {polizaId: myInsurance.id});
      }else if (myInsurance.document_type == 7) {
        $scope.name_for_new_tab = 'Renovación fianzas';
        params = {polizaId: myInsurance.id, renovacion : 2};
        $scope.route_for_new_tab = 'fianzas.renovar';
        $scope.params_for_new_tab = params;
        // $state.go('fianzas.renovar',{polizaId: myInsurance.id, renovacion : 2});
      }else if (myInsurance.document_type == 8) {
        $scope.name_for_new_tab = 'Renovación fianzas';
        params = {polizaId: myInsurance.id};
        $scope.route_for_new_tab = 'fianzas.reissue';
        $scope.params_for_new_tab = params;
        // $state.go('fianzas.reissue', {polizaId: myInsurance.id});
      }else if (myInsurance.document_type == 11) {
        $scope.name_for_new_tab = 'Renovación flotillas';
        params = {polizaId: myInsurance.id};
        $scope.route_for_new_tab = 'flotillas.renewal';
        $scope.params_for_new_tab = params;
        // $state.go('flotillas.renewal', {polizaId: myInsurance.id});
      }
    }
  
    $scope.open_new_tab = function(){
      var existe = false;
      appStates.states.forEach(function(state) {
        if (state.route == $scope.route_for_new_tab && state.id == $scope.id_for_new_tab){
          existe = true;
        }
      });
      if(appStates.states.length > 3){
        SweetAlert.swal("Error", "No se pueden abrir más pestañas.", "error");
      }else{
        if (!existe){
          appStates.states.push(
            { 
              id: $scope.id_for_new_tab, 
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab, {polizaId: $scope.id_for_new_tab})
            }
          );
          $localStorage.tab_states = appStates.states;
        }
      }
    }

    $scope.$watch('vm.word', function(newValue, oldValue) {
      if(vm.word) {      
        if(vm.word.id) {
          vm.only_caratula_poliza = parseInt(vm.word.id)
        }else{
          vm.only_caratula_poliza = 0
        }
      }
    });
    function getCelulasContractor(){
      $http.post(url.IP+'celula_contractor_info/').then(function(celulas) {
        $scope.celulas = celulas.data;
      })
    } 
    function changeBLine(obj){
      $scope.bLine = obj
      if(obj){
        vm.form.businesLine = obj;
      } else {
        vm.form.businesLine = 0;
      }
    }

    function changeSubgroup(subg){
      vm.form.subgroup = subg;
      vm.subgroup = subg;
      $scope.subsubgroups = subg.subsubgrupos ? subg.subsubgrupos : []
    }
    function changeSubsubgroup(subg){
      vm.form.subsubgroup = subg;
      vm.subsubgroup = subg;
    }
    // Nivel de agrupación
    function changeSubgrouping(subgl){
      if (subgl){
        vm.form.subgrouping = subgl;
        vm.subgrouping = subgl;
        $scope.subsubgrouping = subgl.subsubgrupos ? subgl.subsubgrupos : []
      }else{
        vm.form.subgrouping = 0
        $scope.subsubgrouping = []
      }
    }
    function changeSubsubgrouping(subgl){
      vm.form.subsubgrouping = subgl;
      vm.subsubgrouping = subgl;
    }

    $scope.selectProv = function(sel){
        vm.form.provider = [];
        sel.forEach(function(cl) {
          vm.form.provider.push(cl.id)
        })
    };

    $scope.selectRamos = function(sel){
        vm.subramos_toselected = [];
        vm.form.ramo = [];
        vm.id = sel[0]
        sel.forEach(function(r) {
          vm.form.ramo.push(parseInt(r));
            $http.get(url.IP + 'subramos-by-ramo_code/'+ r)
            .then(function(data){
              data.data.forEach(function(sr){
                vm.subramos_toselected.push(sr);
              })
                
          });
        })
        // if (sel.length == 1) {
        // if (vm.id) {
        
        // }
        // }
        if(sel.length == 0){
            vm.subramos_toselected = []
            vm.subramos_selected = [];
            // getSubramos();
        }
    };

    $scope.selectSubramos = function(sel){
        vm.form.subramo = [];
        sel.forEach(function(sr) {
          if (sr.subramo_code)
            var code = sr.subramo_code;
          else
            var code = sr.id;
          vm.form.subramo.push(code);
        })
    };

    // getRenovaciones (1,1,1)
    vm.form.since = datesFactory.convertDate(new Date());
    // var endingDate =  convertDate(new Date().setYear(new Date().getFullYear() + 1));
    vm.form.until = datesFactory.convertDate(new Date());
    vm.changeRenewal = changeRenewal;
    function changeRenewal(par,asc){
      switch(par) {
        case 1:
          Generar(par, asc);
          vm.ren_nump_asc = asc;
          vm.ren_cont_asc = 0;
          vm.ren_type_asc = 0;
          vm.ren_aseg_asc = 0;
          vm.ren_pack_asc = 0;
          vm.ren_subr_asc = 0;
          vm.ren_fini_asc = 0;
          vm.ren_ffin_asc = 0;
          vm.ren_pago_asc = 0;
          vm.ren_est_asc = 0;
          break;
        case 2:
          Generar(par, asc);
          vm.ren_cont_asc = asc;
          vm.ren_nump_asc = 0;
          vm.ren_type_asc = 0;
          vm.ren_aseg_asc = 0;
          vm.ren_pack_asc = 0;
          vm.ren_subr_asc = 0;
          vm.ren_fini_asc = 0;
          vm.ren_ffin_asc = 0;
          vm.ren_pago_asc = 0;
          vm.ren_est_asc = 0;
          break;
        case 3:
          Generar(par, asc);
          vm.ren_type_asc = asc;
          vm.ren_nump_asc = 0;
          vm.ren_cont_asc = 0;
          vm.ren_aseg_asc = 0;
          vm.ren_pack_asc = 0;
          vm.ren_subr_asc = 0;
          vm.ren_fini_asc = 0;
          vm.ren_ffin_asc = 0;
          vm.ren_pago_asc = 0;
          vm.ren_est_asc = 0;
          break;
        case 4:
          Generar(par, asc);
          vm.ren_aseg_asc = asc;
          vm.ren_cont_asc = 0;
          vm.ren_nump_asc = 0;
          vm.ren_type_asc = 0;
          vm.ren_pack_asc = 0;
          vm.ren_subr_asc = 0;
          vm.ren_fini_asc = 0;
          vm.ren_ffin_asc = 0;
          vm.ren_pago_asc = 0;
          vm.ren_est_asc = 0;
          break;
        case 5:
          Generar(par, asc);
          vm.ren_pack_asc = asc;
          vm.ren_nump_asc = 0;
          vm.ren_cont_asc = 0;
          vm.ren_type_asc = 0;
          vm.ren_aseg_asc = 0;
          vm.ren_subr_asc = 0;
          vm.ren_fini_asc = 0;
          vm.ren_ffin_asc = 0;
          vm.receipts_ffin_asc = 0;
          vm.ren_pago_asc = 0;
          vm.ren_est_asc = 0;
          break;
        case 6:
          Generar(par, asc);
          vm.ren_subr_asc = asc;
          vm.ren_nump_asc = 0;
          vm.ren_cont_asc = 0;
          vm.ren_type_asc = 0;
          vm.ren_aseg_asc = 0;
          vm.ren_pack_asc = 0;
          vm.ren_fini_asc = 0;
          vm.ren_ffin_asc = 0;
          vm.ren_pago_asc = 0;
          vm.ren_est_asc = 0;
          break;
        case 7:
          Generar(par, asc);
          vm.ren_fini_asc = asc;
          vm.ren_nump_asc = 0;
          vm.ren_cont_asc = 0;
          vm.ren_type_asc = 0;
          vm.ren_aseg_asc = 0;
          vm.ren_pack_asc = 0;
          vm.ren_subr_asc = 0;
          vm.ren_ffin_asc = 0;
          vm.ren_pago_asc = 0;
          vm.ren_est_asc = 0;
          break;
        case 8:
          Generar(par, asc);
          vm.ren_ffin_asc = asc;
          vm.ren_nump_asc = 0;
          vm.ren_cont_asc = 0;
          vm.ren_type_asc = 0;
          vm.ren_aseg_asc = 0;
          vm.ren_pack_asc = 0;
          vm.ren_subr_asc = 0;
          vm.ren_fini_asc = 0;
          vm.receipts_ffin_asc = 0;
          vm.ren_pago_asc = 0;
          vm.ren_est_asc = 0;
          break;
        case 9:
          Generar(par, asc);
          vm.ren_fini_asc = 0;
          vm.ren_nump_asc = 0;
          vm.ren_cont_asc = 0;
          vm.ren_type_asc = 0;
          vm.ren_aseg_asc = 0;
          vm.ren_pack_asc = 0;
          vm.ren_subr_asc = 0;
          vm.ren_ffin_asc = 0;
          vm.ren_pago_asc = asc;
          vm.ren_est_asc = 0;
          break;
        case 10:
          Generar(par, asc);
          vm.ren_ffin_asc = 0;
          vm.ren_fini_asc = 0;
          vm.ren_nump_asc = 0;
          vm.ren_cont_asc = 0;
          vm.ren_type_asc = 0;
          vm.ren_aseg_asc = 0;
          vm.ren_pack_asc = 0;
          vm.ren_subr_asc = 0;
          vm.ren_pago_asc = 0;
          vm.ren_est_asc = asc;
          break;
      }
    }
    vm.changeRenewalT = changeRenewalT;
    function changeRenewalT(par,asc){
      var param = $scope.status
      switch(par) {
      case 1:
        getRenovaciones(param,par,asc);
        vm.ren_nump_asc = asc;
        vm.ren_cont_asc = 0;
        vm.ren_type_asc = 0;
        vm.ren_aseg_asc = 0;
        vm.ren_pack_asc = 0;
        vm.ren_subr_asc = 0;
        vm.ren_fini_asc = 0;
        vm.ren_ffin_asc = 0;
        vm.ren_pago_asc = 0;
        vm.ren_est_asc = 0;
        break;
      case 2:
        getRenovaciones(param,par, asc);
        vm.ren_cont_asc = asc;
        vm.ren_nump_asc = 0;
        vm.ren_type_asc = 0;
        vm.ren_aseg_asc = 0;
        vm.ren_pack_asc = 0;
        vm.ren_subr_asc = 0;
        vm.ren_fini_asc = 0;
        vm.ren_ffin_asc = 0;
        vm.ren_pago_asc = 0;
        vm.ren_est_asc = 0;
        break;
      case 3:
        getRenovaciones(param,par, asc);
        vm.ren_type_asc = asc;
        vm.ren_nump_asc = 0;
        vm.ren_cont_asc = 0;
        vm.ren_aseg_asc = 0;
        vm.ren_pack_asc = 0;
        vm.ren_subr_asc = 0;
        vm.ren_fini_asc = 0;
        vm.ren_ffin_asc = 0;
        vm.ren_pago_asc = 0;
        vm.ren_est_asc = 0;
        break;
      case 4:
        getRenovaciones(param,par, asc);
        vm.ren_aseg_asc = asc;
        vm.ren_cont_asc = 0;
        vm.ren_nump_asc = 0;
        vm.ren_type_asc = 0;
        vm.ren_pack_asc = 0;
        vm.ren_subr_asc = 0;
        vm.ren_fini_asc = 0;
        vm.ren_ffin_asc = 0;
        vm.ren_pago_asc = 0;
        vm.ren_est_asc = 0;
        break;
      case 5:
        getRenovaciones(param,par, asc);
        vm.ren_pack_asc = asc;
        vm.ren_nump_asc = 0;
        vm.ren_cont_asc = 0;
        vm.ren_type_asc = 0;
        vm.ren_aseg_asc = 0;
        vm.ren_subr_asc = 0;
        vm.ren_fini_asc = 0;
        vm.ren_ffin_asc = 0;
        vm.receipts_ffin_asc = 0;
        vm.ren_pago_asc = 0;
        vm.ren_est_asc = 0;
        break;
      case 6:
        getRenovaciones(param,par, asc);
        vm.ren_subr_asc = asc;
        vm.ren_nump_asc = 0;
        vm.ren_cont_asc = 0;
        vm.ren_type_asc = 0;
        vm.ren_aseg_asc = 0;
        vm.ren_pack_asc = 0;
        vm.ren_fini_asc = 0;
        vm.ren_ffin_asc = 0;
        vm.ren_pago_asc = 0;
        vm.ren_est_asc = 0;
        break;
      case 7:
        getRenovaciones(param,par, asc);
        vm.ren_fini_asc = asc;
        vm.ren_nump_asc = 0;
        vm.ren_cont_asc = 0;
        vm.ren_type_asc = 0;
        vm.ren_aseg_asc = 0;
        vm.ren_pack_asc = 0;
        vm.ren_subr_asc = 0;
        vm.ren_ffin_asc = 0;
        vm.ren_pago_asc = 0;
        vm.ren_est_asc = 0;
        break;
      case 8:
        getRenovaciones(param,par, asc);
        vm.ren_ffin_asc = asc;
        vm.ren_nump_asc = 0;
        vm.ren_cont_asc = 0;
        vm.ren_type_asc = 0;
        vm.ren_aseg_asc = 0;
        vm.ren_pack_asc = 0;
        vm.ren_subr_asc = 0;
        vm.ren_fini_asc = 0;
        vm.receipts_ffin_asc = 0;
        vm.ren_pago_asc = 0;
        vm.ren_est_asc = 0;
        break;
      case 9:
        getRenovaciones(param,par, asc);
        vm.ren_fini_asc = 0;
        vm.ren_nump_asc = 0;
        vm.ren_cont_asc = 0;
        vm.ren_type_asc = 0;
        vm.ren_aseg_asc = 0;
        vm.ren_pack_asc = 0;
        vm.ren_subr_asc = 0;
        vm.ren_ffin_asc = 0;
        vm.ren_pago_asc = asc;
        vm.ren_est_asc = 0;
        break;
      case 10:
        getRenovaciones(param,par, asc);
        vm.ren_ffin_asc = 0;
        vm.ren_fini_asc = 0;
        vm.ren_nump_asc = 0;
        vm.ren_cont_asc = 0;
        vm.ren_type_asc = 0;
        vm.ren_aseg_asc = 0;
        vm.ren_pack_asc = 0;
        vm.ren_subr_asc = 0;
        vm.ren_pago_asc = 0;
        vm.ren_est_asc = asc;
        break;
      }
    }

    function Generar(order,asc,parPage) {
      $scope.order = order ? order : 1;
      $scope.asc = asc ? asc : 1;
      $scope.actual_page = parPage ? parPage : 1;
      vm.insurances = [];
      $scope.results = true;
      if(vm.form.provider){
        var p = vm.form.provider;
      } else {
        var p = 0;
      }
      if(vm.form.ramo){
        var r = vm.form.ramo;
      } else {
        var r = 0;
      }
      if(vm.form.subramo){
        var s = vm.form.subramo;
      } else {
        var s = 0;
      }
      if(vm.form.status){
        var e = vm.form.status.id;
      } else {
        var e = 0;
      }
      if(vm.form.tipo_poliza){
        var tp = vm.form.tipo_poliza.id;
      } else {
        var tp = 0;
      }
      if(vm.form.payment){
        var f = vm.form.payment.id;
      } else {
        var f = 0;
      }
      if(vm.form.contratante.val){
        var c = vm.form.contratante.value;
      } else {
        var c = 0;
      }
      if(vm.form.group){
        if(vm.form.group.val){
          var g = vm.form.group.value;
        } else {
          var g = 0;
        }
      }        
      if(vm.form.subgroup){
        if(vm.form.subgroup.id){
          var g1 = vm.form.subgroup.id;
        } else {
          var g1 = 0;
        }
      }       
      if(vm.form.subsubgroup){
        if(vm.form.subsubgroup.id){
          var g2 = vm.form.subsubgroup.id;
        } else {
          var g2 = 0;
        }
      } else {
        var g2 = 0;
      }
      if(vm.form.groupinglevel){
        if(vm.form.groupinglevel.val){
          var gl = vm.form.groupinglevel.value;
        } else {
          var gl = 0;
        }
      }else {
        var gl = 0;
      }        
      if(vm.form.subgrouping){
        if(vm.form.subgrouping.id){
          var gl1 = vm.form.subgrouping.id;
        } else {
          var gl1 = 0;
        }
      } else {
        var gl1 = 0;
      }        
      if(vm.form.celula){
        if(vm.form.celula.id){
          var cel = vm.form.celula.id;
        } else {
          var cel = 0;
        }
      } else {
        var cel = 0;
      }
      if(vm.form.subsubgrouping){
        if(vm.form.subsubgrouping.id){
          var gl2 = vm.form.subsubgrouping.id;
        } else {
          var gl2 = 0;
        }
      } else {
        var gl2 = 0;
      }
      var params = {
          provider: p,
          ramo: r,
          subramo: s,
          since: vm.form.since ? vm.form.since : 0,
          until: vm.form.until ? vm.form.until : 0,
          payment: f,
          status: e,
          tipo_poliza: tp,
          contratante: c,
          grupo: g,
          order: order ? order : 1,
          asc: asc ? asc : 1,
          renovadas: vm.form.renovadas.id ? vm.form.renovadas.id : 1,
          classification: vm.form.classification.value ? vm.form.classification.value : vm.form.classification,
          subgrupo: g1 ? g1 : 0,
          subsubgrupo: g2 ? g2 : 0,
          groupinglevel: gl ? gl : 0,
          subgrupinglevel: gl1 ? gl1 : 0,
          subsubgrupinglevel: gl2 ? gl2 : 0, 
          businessLine: $scope.bLine ? $scope.bLine.id : 0,   
          celula: cel ? cel : 0, 
          page: parPage ? parPage : 1,
          only_caratula: vm.only_caratula_poliza ? vm.only_caratula_poliza : 0
      }
      vm.insurances = [];
      if(vm.form.classification.val == "" || vm.form.classification.val == null || vm.form.classification == undefined){
        params.classification = 0;
      }
      if (vm.form.contratante.type == "natural"){
        vm.form.contratante.type = 1;
      }
      if(vm.form.contratante.type == "juridical"){
        vm.form.contratante.type = 2;
      }
      else{
        vm.form.contratante.type == 0;
      }
      params.grupo = vm.form.group ? g : 0;
      params.type_contractor = vm.form.contratante.type ? vm.form.contratante.type : 0;
      params.since = params.since+ " " + "00:00:00";
      params.until = params.until+ " " + "23:59:59";

      // if($scope.infoUser.staff && !$scope.infoUser.superuser){
      //   var filter_renovation = 'v2/polizas/filtros-renovaciones/';
      var filter_renovation = 'filtros-renovaciones/';
      $scope.params = params;
      $http({
              method: 'GET',
              url: url.IP + filter_renovation,
          params: params
      }). then(function success(response) {
          if(response.status === 200 && response.data.results.length){
            vm.insurances = response.data.results;
            if(vm.insurances && vm.insurances.length>0){
              vm.insurances.forEach(function(item){
                $http({
                  method: 'GET',
                  url: url.IP + 'historic-policies/',
                  params: {
                    actual_id: item.id
                  }
                }).then(function success(response) {
                  if(response.data.results.length){              
                  item.policy_history = [];
                  item.policy_history.renovada = [];
                  response.data.results.forEach(function function_name(old) {
                    if(item.id != old.base_policy.id){
                      item.policy_history.push(old.base_policy);
                    } else if(old.new_policy) {
                      item.policy_history.push(old.new_policy);
                    }
                    if(item.id == old.base_policy.id){
                      item.policy_history.renovada.push(old.base_policy);
                    }
                  })
                  }
                })
              })
            }
            // vm.insurances = response.data.results; se repite no se si se deba borrar
            vm.insurances_config = {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            };

            vm.show_pag_renew = true;
            $scope.obtenerPaginacion(response.data, parPage ? parPage : 1);
            // testPagination('vm.insurances', 'vm.insurances_config');
          } else {
            vm.show_pag_renew = false;
            toaster.warning("No se encontraron registros");
          }
      });
    }

    $scope.exportData = function (param) {
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      var filtros = $scope.params;
      // if($scope.infoUser.staff && !$scope.infoUser.superuser){
      //   // var url_rep = 'v2/polizas/reporte-policy-renewal';
      //   var url_rep = 'service_reporte-v2-renovaciones-excel';   
      var url_rep = 'service_reporte-renovaciones-excel';
      if (param == 1) {

            $http({
                  method: 'GET',
                  url: url.IP + url_rep,//'reporte-policy-renewal',
                  params: filtros,
                  headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                  responseType: "arraybuffer"
                })
                .then(function (data) {
                  if(data.status == 200){
                    // l.stop();
                    var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                    saveAs(blob, 'Reporte_Renovaciones.xls');
                  } else {
                    SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
                    // l.stop()
                  }
                  l.stop();
                })
                .catch(function (e) {
                  l.stop();
                  console.log('e', e);
                });
              //     params: filtros
              // }). then(function success(request) {
              //       if(request.status === 200) {
              //           exportFactory.excel(request.data, ' renovaciones');
              //       }

              //     })
              //     .catch(function (e) {
              //       console.log('e', e);
              //     });
      }
    }


  // nueva paginación inicial resultados
  $scope.obtenerPaginacion = function(clasificacion, pagina){
    $scope.paginacion = {
      count: clasificacion['count'],
      previous: clasificacion['previous'],
      next: clasificacion['next'],
      totalPaginas: [],
      paginaInicio: 0,
      paginaActual: pagina,
      paginaFin: 0
    }
    var numeroPaginas = Math.ceil($scope.paginacion['count'] / 10);
    var i = 0;      
    i = pagina - 5;
    if(i <= 0){
      i = 0;
    }

    for(i; i < numeroPaginas; i++){
      if($scope.paginacion['totalPaginas'].length <= 5){
        $scope.paginacion['totalPaginas'].push(i + 1);
      }
    }
    if($scope.paginacion['totalPaginas'].length > 5){
      $scope.paginacion['paginaInicio'] = $scope.paginacion['totalPaginas'] - 5;
    }else{
      $scope.paginacion['paginaInicio'] = 1;
    }
    if($scope.paginacion['totalPaginas'].length > 5){
      $scope.paginacion['paginaFin'] = 5;
    }else{
      $scope.paginacion['paginaFin'] = $scope.paginacion['totalPaginas'].length;
    }
  }

  $scope.selecionPagina = function (pagina){
    Generar($scope.order || 1, $scope.asc || 1, pagina);
  }

  $scope.anteriorPagina = function(){
    if($scope.paginacion['paginaActual'] > 1){
      Generar($scope.order || 1, $scope.asc || 1, $scope.paginacion['paginaActual'] - 1);
    }
  }

  $scope.siguientePagina = function(){
    var numeroPaginas = Math.ceil($scope.paginacion['count'] / 10);
    if(numeroPaginas > $scope.paginacion['paginaActual']){
      Generar($scope.order || 1, $scope.asc || 1, $scope.paginacion['paginaActual'] + 1);
    }
  }
  // vigentes tabs
  $scope.obtenerPaginacionVig = function(clasificacion, pagina){
    $scope.paginacionVig = {
      count: clasificacion['count'],
      previous: clasificacion['previous'],
      next: clasificacion['next'],
      totalPaginas: [],
      paginaInicio: 0,
      paginaActual: pagina,
      paginaFin: 0
    }
  }
  $scope.anteriorPaginaVig = function(){
    getResultadosByPage(vm.insurances_config.previous,2)      
  }

  $scope.siguientePaginaVig = function(){ 
    getResultadosByPage(vm.insurances_config.next,2)
  }
  // vencidas 1
  function getResultadosByPage (page,param){  
    $http({
      method: 'GET',
      url: page,
    })
    .then(
      function success(request) {
        if(param < 3) {
          vm.loading = false;
          vm.insurances = [];
          vm.receipt = {};
          vm.insurances = request.data.results;
          vm.insurances_config = {
            count: request.data.count,
            previous: request.data.previous,
            next: request.data.next
          };
          if(param ==1){
            $scope.obtenerPaginacionVenc(request.data, 1);
          }
          if(param ==2){
            $scope.obtenerPaginacionVig(request.data, 1);
          }

          // testPagination('vm.insurances', 'vm.insurances_config');
        } else {
          console.log('Error')
        }
      function error(error) {
        console.log('error', error);
      }
    }
    )
    .catch(function(e) {
      console.log('e', e);
    });
  }
  $scope.obtenerPaginacionVenc = function(clasificacion, pagina){
    $scope.paginacionVenc = {
      count: clasificacion['count'],
      previous: clasificacion['previous'],
      next: clasificacion['next'],
      totalPaginas: [],
      paginaInicio: 0,
      paginaActual: pagina,
      paginaFin: 0
    }
  }  
  $scope.anteriorPaginaVenc = function(){
    getResultadosByPage(vm.insurances_config.previous,1)      
  }

  $scope.siguientePaginaVenc = function(){ 
    getResultadosByPage(vm.insurances_config.next,1)
  }

  function changeUntil() {
      var since = toDate(vm.form.since).getTime();
      var until = toDate(vm.form.until).getTime();
      var diff = until - since;
      var antiguedad = parseInt(diff/(1000*60*60*24));
      if(antiguedad < 0){
        SweetAlert.swal("Error", "La fecha final no puede ser menor que la inicial", "error");
        var newdate = convertDate(new Date());
        vm.form.until = newdate;
      };
  };

    function toDate(dateStr) {
      var dateString = dateStr; // Oct 23
      var dateParts = dateString.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

      return dateObject;

    }

    function returnToReceipts() {
      vm.show_binnacle = false;
    }

    function showBinnacle(param) {
      $http({
        method: 'GET',
        url: url.IP+'comments/',
        params: {
          'model': 6,
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


      vm.show_binnacle = true;
      vm.renewal_id = param.id;
    };

    function convertDate(inputFormat) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    }

    angular.element(document).ready(function(){
      $('.js-example-basic-multiple').select2();
    });
    function activate(status,order,asc) {
      $('.js-example-basic-multiple').select2();
      vm.accesos = $sessionStorage.permisos
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
              }else if (acc.permission_name == 'Ver referenciadores') {
                if (acc.checked == true) {
                  vm.acceso_ver_ref = true
                }else{
                  vm.acceso_ver_ref = false
                }
              }
            })
          }
        })
      }
      getProviders();
      // getSubramos();
      $scope.total = 0;
      vm.form = getDefaultFilters();
      vm.word = '';
      $scope.actual_page = 1;
      getInsurances(status,order,asc);
    }

    function getProviders(){
      var date = new Date();
      var curr_date = date.getDate();
      var curr_month = date.getMonth() + 1; //Months are zero based
      var curr_year = date.getFullYear();
      var d = curr_year + "-" + curr_month + "-" + curr_date;
      providerService.getProviderByKey(d)
          .then(function(data){
              vm.providers = data.data;
          });
    }

    function changeProvider(obj){
      if(!obj){
        vm.subramos = []
        vm.ramos = []
        vm.form.provider = 0;
        return
      }
      $http.get(url.IP+'ramos-by-provider/'+obj.id).then(function(ramos) {
        vm.ramos = ramos.data;
      })
    }

    function changeRamo(obj){
      if (!obj){
        vm.subramos = []
        vm.form.ramo = 0;
        return
      }
      try{
        vm.subramos = obj.subramo_ramo;
      }
      catch(e){}
    }

    function changeSubRamo(obj){
      if(obj){
        vm.form.subramo = obj;
      }else{
        vm.form.subramo = 0;
      }
    }

    function changeStatus(obj){
      if(obj){
        vm.form.status = obj;
      } else {
        vm.form.status = 0;
      }
    }

    function changePayment(obj){
      if(obj){
        vm.form.payment = obj;
      } else {
        vm.form.payment = 0;
      }
    }

    function matchesGroup(parWord, parType) {
      $scope.groups_data = 0;
      $scope.subgroups = [];
      $scope.subsubgroups = [];
      if(parType) {
        var word_data = parWord.val;
        parWord = parWord.val;
      } else if(vm.form.group){
          if(vm.form.group.val) {
            var word_data = vm.form.group.val;
          }
      }

      if(word_data) {

        if(word_data.length >= 3) {
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   $scope.show_group = 'v2/contratantes/grupos-match/';
          $scope.show_group = 'grupos-match/';
          $http.post(url.IP + $scope.show_group,
          {
            'matchWord': parWord
          })
          .then(function(response) {
            if(response.status === 200 ) {
              var source = [];
              var groups = response.data;
              groups.forEach(function(item) {
                var obj = {
                  label: item.group_name,
                  value: item.id
                };
                $scope.subgroups = item.subgrupos;
                // $scope.subsubgroups = [];
                // $scope.subgroups.forEach(function(itm) {
                //   $scope.subsubgroups = itm.subsubgrupos
                // });
                var obj = {
                   label: item.group_name,
                   value: item.id
                };
                source.push(obj);
              });
              $scope.groups_data = source;
            }
          });
        }
      }
    }

    $scope.$watch("vm.form.group.value",function(newValue, oldValue){
      if(vm.form.group){
        if(vm.form.group.value){
          $http.get(url.IP+'grupos/'+vm.form.group.value).then(function(item) {
            vm.form.group.data = item.data;

            $scope.subgroups = item.data.subgrupos;
            $scope.subgroups.forEach(function(itm) {
              $scope.subsubgroups = itm.subsubgrupos
            });
          })
        }
      }
    });
    
    function matchesGroupinglevel(parWord, parType) {
      $scope.subgrouping = [];
      $scope.subsubgrouping = [];
      $scope.groupunglevels_data = 0;
      vm.form.subgrouping = 0
      vm.form.subsubgrouping = 0
      if(parType) {
        var word_data = parWord.val;
        parWord = parWord.val;
      } else if(vm.form.groupinglevel.val) {
        var word_data = vm.form.groupinglevel.val;
      }
      if(word_data) {
          if(word_data.length >= 2) {
            $scope.show_grouping = 'groupinglevel-match/';
            
              $http.post(url.IP + $scope.show_grouping,
              {
                  'matchWord': parWord
              }).then(function(response) {
                  if(response.status === 200 ) {
                      var source = [];
                      var groupinglevels = response.data ? response.data : [];
                      groupinglevels.forEach(function(item) {
                          $scope.subsubgrouping = []
                          $scope.subgrouping.forEach(function(itm) {
                            $scope.subsubgrouping = itm.subsubgrupos
                          });
                          var obj = {
                             label: item.description,
                             value: item.id,
                             url:item.url,
                             subgrupos:item.subgrupos
                          };
                          source.push(obj);
                      });
                      
                      $scope.groupinglevels_data = source;
                  }
              });
          }
      }
    }
    // --GroupingLevel
    // classification
    function matchesClassification(parWord, parType) {
        $scope.classification_data = 0;
        if(parType) {
          var word_data = parWord.val;
          parWord = parWord.val;
        } else if(vm.form.classification.val) {
          var word_data = vm.form.classification.val;
        }
        if(word_data) {
            if(word_data.length >= 2) {
              $scope.show_claass = 'classification-match/';
              
                $http.post(url.IP + $scope.show_claass,
                {
                    'matchWord': parWord
                }).then(function(response) {
                    if(response.status === 200 ) {
                        var source = [];
                        var classifica = response.data;
                        classifica.forEach(function(item) {
                            var obj = {
                               label: item.classification_name,
                               value: item.id,
                            };
                            source.push(obj);
                        });
                        $scope.classification_data = source;
                    }
                });
            }
        }
    }      

    function matchesContractors(parWord, parType) {

        $scope.contractors_data = 0;

        if(parType) {
          var word_data = parWord.val;
          parWord = parWord.val;
        } else {
          var word_data = vm.form.contratante.val;
        }

        if(word_data) {
          if(word_data.length >= 3) {
            // if($scope.infoUser.staff && !$scope.infoUser.superuser){
            //   $scope.show_contratante = 'v2/contratantes/contractors-match/';
            $scope.show_contratante = 'contractors-match/';
            $http.post(url.IP + $scope.show_contratante,
              {
                'matchWord': parWord,
                'poliza': true
              })
            .then(function(response) {

              if(response.status === 200 ) {

                var source = [];
                var contratactorsFound = response.data.contractors;
                if(contratactorsFound.length) {
                  contratactorsFound.forEach(function(item) {
                    if(item.full_name) {
                      var obj = {
                        label: item.full_name,
                        value: item.id,
                        type: item.type_person == 'Física' ? 'natural' : 'juridical'
                      };
                    } else {
                     var obj = {
                        label: item.first_name+' '+ item.last_name+' '+ item.second_last_name,
                        value: item.id,
                        type: item.type_person == 'Física' ? 'natural' : 'juridical'
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
        }
    }

    function getRenovaciones(param,order,asc,page){
      $scope.status = param
      $http({
        method: 'GET',
        url: url.IP+'leer-rpolizas-resume/',
        params: {
          status: param,
          order: order,
          asc: asc,
          page:page ? page :1
        }
      })
      .then(
        function success(request) {
          if(param < 3) {
            vm.loading = false;
            vm.insurances = [];
            vm.receipt = {};
            vm.insurances = request.data.results;
            vm.insurances_config = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            };
            if(param ==1){
              $scope.obtenerPaginacionVenc(request.data, 1);
            }
            if(param ==2){
              $scope.obtenerPaginacionVig(request.data, 1);
            }

            // testPagination('vm.insurances', 'vm.insurances_config');
          } else {
            console.log('Error')
          }
        function error(error) {
          console.log('error', error);
        }
      }
      )
      .catch(function(e) {
        console.log('e', e);
      });
    }

    function getInsurances(status,order,asc,page){
        insuranceService.getPoliciesForRenovation(status,order,asc,page)
          .then(function(policies){
            vm.insurances = policies.policies;
            vm.insurances_config = {
              count: policies.policies.count,
              previous: policies.policies.previous,
              next: policies.policies.next
            };
            if(status ==1){
              $scope.obtenerPaginacionVenc(policies.policies, 1);
            }
            if(status ==2){
              $scope.obtenerPaginacionVig(policies.policies, 1);
            }
          });
    }

    function responsiv() {
      $('#vencidas').trigger('resize');
       $('#vigentes').trigger('resize');
    }

    function openRenovateModal(myInsurance){
      if (vm.form.renovadas && vm.form.renovadas.id ==1) {
        return
      }
      clearRenewalDraft();
      // return
      // evaluate
      $scope.existeRenovacion = false;
      $scope.conteo=0
      $scope.totalp=myInsurance.policy_history ? myInsurance.policy_history.length : 0
      if(myInsurance.policy_history){
        myInsurance.policy_history.forEach(function(old) {
          $scope.conteo=$scope.conteo+1
          if(old.status == 1){
            $scope.existeRenovacion = true
            SweetAlert.swal("Información","La póliza ya tiene una OT de renovación", "info");
            $state.go('renovaciones.renovaciones');
            clearRenewalDraft();
            return
          }
        });
      }    
      if(myInsurance.renewed){
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRENEWPOLICY, "error");
      }        
      else if($scope.conteo == $scope.totalp && $scope.existeRenovacion==false){
        if(myInsurance.document_type == 1){
          $scope.route_for_new_tab = 'renovaciones.polizas';
          var name = 'Renovación Póliza'
          var route = 'renovaciones.polizas';
        } else if(myInsurance.document_type == 3){
          $scope.route_for_new_tab = 'colectividades.renewal';
          var name = 'Renovación Colectividad'
          var route = 'colectividades.renewal';} 
        else if(myInsurance.document_type == 7){
          $scope.route_for_new_tab = 'fianzas.renovar';
          var name = 'Renovación Colectividad'
          var route = 'fianzas.renovar';
        } else if(myInsurance.document_type == 8){
          $scope.route_for_new_tab = 'fianzas.reissue';
          var name = 'Renovación Colectividad'
          var route = 'fianzas.reissue';
        }else if (myInsurance.document_type == 11) {
          $scope.route_for_new_tab = 'flotillas.renewal';
          var name = 'Renovación Flotilla'
          var route = 'flotillas.renewal';
        }else if (myInsurance.document_type == 12) {
          $scope.route_for_new_tab = 'flotillas.renewal';
          var name = 'Renovación Flotilla'
          var route = 'flotillas.renewal';
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

        var params = { 'polizaId': myInsurance.id, myInsurance: myInsurance }
        if (myInsurance.document_type == 1) {
          setRenewalDraft(myInsurance);
          $state.go('renovaciones.polizas', params);
        }else if (myInsurance.document_type == 3) {
          $state.go('colectividades.renewal', {polizaId: myInsurance.id});
        }else if (myInsurance.document_type == 7) {
          $state.go('fianzas.renovar',{polizaId: myInsurance.id, renovacion : 2});
        }else if (myInsurance.document_type == 8) {
          $state.go('fianzas.reissue', {polizaId: myInsurance.id});
        }else if (myInsurance.document_type == 11) {
          $state.go('flotillas.renewal', {polizaId: myInsurance.id});
        }else if (myInsurance.document_type == 12) {
          SweetAlert.swal('Advertencia', 'Las pólizas de colectividad solo se pueden renovar mediante layout.', 'warning');
          // $state.go('flotillas.renewal', {polizaId: myInsurance.caratula});
        }

      }else{
        return
      }
    }

    function submit(isValid) {
        if (isValid) {
            alert('awesonme');
        }
    }

    // function testPagination(parModel, parConfig) {

    //   var config_ = $parse(parConfig)($scope)
    //   if(config_) {
    //     var pages = Math.ceil(config_.count / 10);
    //   }
    //   $scope.totalPages = [];
    //   var count_items = 0;
    //   var count_pages = 0;

    //   var previous_array = [];
    //   var next_array = [];

    //   $scope.start = 0;
    //   $scope.end = 5;
    //   $scope.actual_page = 1;
    //   $scope.not_prev = true;

    //   for (var i = 0; i < pages; i++) {
    //     $scope.totalPages.push(i+1);
    //   }

    //   $scope.lastPage = function() {
    //     // TODO: ultimo bloque
    //     if($scope.totalPages.length > 5) {
    //       $scope.end = $scope.totalPages.length;
    //       $scope.start = ($scope.totalPages.length) -5;
    //       $scope.show_prev_block = true;
    //     }

    //     $scope.selectPage($scope.totalPages.length);

    //     $scope.actual_page = $scope.totalPages.length;

    //   }

    //   $scope.selectPage = function (parPage) {
    //     if(config_.next || config_.previous) {
    //       if(config_.next) {
    //         var next_ = config_.next;

    //         var otherParameters = config_.next.substring(config_.next.indexOf("&page=") + 6);

    //         if(next_.search('&status=') !== -1) {
    //           var status = next_.substring(next_.indexOf("&status=") + 1);
    //         } else {
    //           var status = '';
    //         }

    //         var url = config_.next.substring(0, config_.next.indexOf("&page=") + 6);
    //         url += parPage.toString();
    //         url += '&'+status

    //          if(config_.next.search('&') !== -1) {
    //            var params = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
    //             // url += '&'+params;
    //             }

    //       } else {



    //         var prev_ = config_.previous;
    //         var otherParameters = prev_.substring(prev_.indexOf("&page=") + 6);
    //         if(prev_.search('&status=') !== -1) {
    //           var status = prev_.substring(prev_.indexOf("&status=") + 1);
    //         } else {
    //           var status = '';
    //         }

    //         if(prev_.search('&page=') !== -1) {
    //           var url = prev_.substring(0, prev_.indexOf("&page=") + 6);
    //           url += parPage.toString();
    //           url += '&'+status;



    //         } else {
    //           var url = config_.previous
    //         }
    //         if(config_.prev_.search('&') !== -1) {
    //           var params = otherParameters.substring(2, otherParameters.indexOf('&')+1000);

    //         url += '&'+params;
    //         }
    //       }
    //     }

    //     // url += '&status=1'
    //     getRenovacionesPag(url);
    //     $scope.actual_page = parPage;
    //     if($scope.actual_page > 1) {
    //       $scope.not_prev = false;
    //     }

    //     if($scope.actual_page == $scope.totalPages.length -1) {
    //       $scope.not_next = true;
    //     }

    //   }

    //   $scope.previousBlockPages = function(param) {
    //     if(param) {
    //       if($scope.start < $scope.actual_page) {
    //         $scope.start = $scope.start - 1 ;
    //         $scope.end = $scope.end - 1;
    //       }

    //     } else {
    //       $scope.start = $scope.start - 5 ;
    //       $scope.end = $scope.end - 5;

    //       if($scope.end < $scope.totalPages.length) {
    //           $scope.not_next = false;
    //       }
    //     }

    //     if($scope.end <= 5) {
    //       $scope.start = 0;
    //       $scope.end = 5;
    //       $scope.show_prev_block = false;
    //     }
    //   }

    //   $scope.nextBlockPages = function(param) {

    //     $scope.show_prev_block = true;

    //     if(param) {
    //       if($scope.end > $scope.actual_page) {
    //         $scope.start = $scope.start + 1 ;
    //         $scope.end = $scope.end + 1;
    //       }
    //     } else {
    //       if($scope.end < $scope.totalPages.length) {
    //         $scope.start = $scope.start + 5 ;
    //         $scope.end = $scope.end + 5;

    //         if($scope.end == $scope.totalPages.length) {
    //             $scope.not_next = true;
    //         }
    //       } else {
    //         $scope.not_next = true;
    //       }
    //     }

    //   }


    //   function getRenovacionesPag(parUrl) {
    //     $http.get(parUrl)
    //     .then(
    //       function success(request) {
    //         var source = $parse(parModel);
    //         source.assign($scope, []);
    //         source.assign($scope, request.data.results);

    //         var data = {
    //           count: request.data.count,
    //           previous: request.data.previous,
    //           next: request.data.next
    //         }

    //       var config = $parse(parConfig);
    //         config.assign($scope, []);
    //         config.assign($scope, data);

    //       },
    //       function error(error) {
    //         console.log('error', error);
    //       }
    //     )
    //     .catch(function(e) {
    //       console.log('e', e);
    //     });
    //   };
    // }
        // -----------PAGINACIÓN
  function testPagination(parModel, parConfig) {
    var config_ = $parse(parConfig)($scope);
    if(config_) {
      var pages = Math.ceil(config_.count / 10);
    }
    $scope.totalPagesP = [];
    var count_items = 0;
    var count_pages = 0;

    var previous_array = [];
    var next_array = [];

    $scope.start = 0;
    $scope.end = 5;
    // $scope.actual_page = 1;
    $scope.not_prev = true;

    for (var i = 0; i < pages; i++) {
      $scope.totalPagesP.push(i+1);
    }

    $scope.lastPageP = function() {
      // TODO: ultimo bloque
      if($scope.totalPagesP.length > 5) {
        $scope.end = $scope.totalPagesP.length;
        $scope.start = ($scope.totalPagesP.length) -5;
        $scope.show_prev_block = true;
      }
      $scope.selectPageP($scope.totalPagesP.length);
      // $scope.actual_page = $scope.totalPagesP.length;
      // $scope.page = $scope.totalPagesP.length;
    }

    $scope.selectPageP = function (parPage) {
      $scope.actual_page = parPage;

      Generar($scope.order, $scope.asc, parPage);
    };

    $scope.previousBlockPagesP = function(param) {
      if(param) {
        if($scope.start < $scope.actual_page) {
          $scope.start = $scope.start - 1 ;
          $scope.end = $scope.end - 1;
        }

      } else {
        $scope.start = $scope.start - 5 ;
        $scope.end = $scope.end - 5;

        if($scope.end < $scope.totalPagesP.length) {
            $scope.not_next = false;
        }
      }

      if($scope.end <= 5) {
        $scope.start = 0;
        $scope.end = 5;
        $scope.show_prev_block = false;
      }
    }

    $scope.nextBlockPagesP = function(param) {
      $scope.show_prev_block = true;

      if(param) {
        if($scope.end > $scope.actual_page) {
          $scope.start = $scope.start + 1 ;
          $scope.end = $scope.end + 1;
        }
      } else {
        if($scope.end < $scope.totalPagesP.length) {
          $scope.start = $scope.start + 5 ;
          $scope.end = $scope.end + 5;

          if($scope.end == $scope.totalPagesP.length) {
              $scope.not_next = true;
          }
        } else {
          $scope.not_next = true;
        }
      }

    }
  }
    // ------- Guardar sumas aseguradas y deducibl
    $scope.show_button_save_sum = false;
    $scope.show_button_save_ded = false;
    $scope.demo = function(param) {
      var model = formatValues.currency(param);
      return model;
    };
    $scope.saveSum = function (parValue, parCoverage) {
      var obj = {
        sum_insured : parValue,
        default : false,
        coverage_sum: parCoverage.url
      };
      coverageService.createSumInsured(obj)
      .then(function(req) {
        if(req.id) {
          $scope.result_ = false;
          parCoverage.sums_coverage.push(req);
        }
      });
    };
    $scope.saveDed = function (parValue, parCoverage) {
      var obj = {
        deductible : parValue,
        default : false,
        coverage_deductible: parCoverage.url
      };
      coverageService.createDeducible(obj)
      .then(function(req) {
        if(req.id) {
          $scope.result_ded = false;
          parCoverage.deductible_coverage.push(req);
        }
      });
    };    
  };
})();