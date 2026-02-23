(function(){
  'use strict';
  /* jshint devel: true */
  var app = angular.module('inspinia');
  
  app.controller('PolizasTableCtrl', PolizasTableCtrl);
  
  PolizasTableCtrl.$inject = ['dataFactory','$localStorage', 'appStates','$state', 'SweetAlert', '$sessionStorage','url', '$scope','$http', 'ContratanteService', 'providerService', 'packageService', 'insuranceService', 'toaster', '$parse','exportFactory'];
  
  function PolizasTableCtrl(dataFactory,$localStorage, appStates, $state, SweetAlert, $sessionStorage,url, $scope, $http, ContratanteService, providerService, packageService, insuranceService, toaster, $parse, exportFactory) {
  
      var vm = this;
      var filterState = {};
      $scope.infoUser = $sessionStorage.infoUser;
      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var usr = JSON.parse(decryptedUser);
      $scope.orgName = usr.orgname;
  
      vm.pageTitle = 'Pólizas';
      var conditions = [];
      $scope.options = [{'val': 1, 'name':'Número de póliza'},
                        {'val': 2, 'name':'Contratante'},
                        {'val': 3, 'name':'Aseguradora'},
                        {'val': 4, 'name':'Paquete'},
                        {'val': 5, 'name':'Ramo'},
                        {'val': 6, 'name':'Subramo'},
                        /*{'val': 7, 'name':'Rango de fechas (Creación)'},
                        {'val': 8, 'name':'Rango de fechas (Vigencia)'}*/]
      $scope.bLine=0
      vm.changeProvider = changeProvider;
      vm.changeRamo = changeRamo;
      vm.changeSubRamo = changeSubRamo;
      vm.changeStatus = changeStatus;
      vm.changePayment = changePayment;
      vm.changeBLine = changeBLine;
      vm.changeUntil = changeUntil;
      vm.matchesContractors = matchesContractors;
      vm.matchesGroup = matchesGroup;
      vm.matchesGroupinglevel = matchesGroupinglevel;
      vm.matchesClassification = matchesClassification;
      vm.matchesSubGroup = matchesSubGroup;
      vm.changeOrder = changeOrder;
      vm.changeOrderOT = changeOrderOT;
      vm.goToInfo = goToInfo;
      vm.addFilter = addFilter;
      vm.changeSubgroup = changeSubgroup;
      vm.changeSubsubgroup = changeSubsubgroup;
      vm.canConsultar = canConsultar;
  
      vm.changeSubgrouping = changeSubgrouping;
      vm.changeSubsubgrouping = changeSubsubgrouping;
  
      vm.pVigentes = true;
      vm.pCanceladas = false;
      vm.pCerradas = false;
      vm.pVencidas = false;
      vm.pActivas = false;
      vm.oPendientes = true;
      vm.oCanceladas = false;
      vm.order_type_asc = 0;
      vm.order_poliza_asc = 0;
      vm.order_contractor_asc = 1;
      vm.order_provider_asc = 0;
      vm.order_subramo_asc = 0;
      vm.order_pay_asc = 0;
      vm.order_status_asc = 0;
      vm.order_vigencia_asc = 0;
      vm.order_anti_asc = 0;
  
      vm.order_ot_asc = 0;
      vm.order_conot_asc = 1;
      vm.order_aseg_asc = 0;
      vm.order_package_asc = 0;
      vm.order_subot_asc = 0;
      vm.order_payot_asc = 0;
      vm.order_statot_asc = 0;
      vm.order_valot_asc = 0;
      vm.subgroup = 0;    
      vm.subsubgroup = 0;
      $scope.subsubgroups = [];
      $scope.subgroups = [];
      vm.groupinglevel = 0;    
      vm.subgroupinglevel = 0;
      $scope.groupinglevel = [];
      $scope.subgroupinglevel = [];
      vm.subsubgroupinglevel = 0;
      $scope.subsubgroupinglevel = [];
  
      $scope.ShowContextMenu = function(name, document_type, insurance){
        $scope.name_for_new_tab = name;
        var route = 'polizas.info';
        if(document_type == 1){
          route = 'polizas.info';
        } else if(document_type == 3){
          route = 'colectividades.info';
        }else if (document_type == 11) {
          route = 'flotillas.info';
        }else if (document_type == 12) {
          route = 'flotillas.info';
        }
        $scope.route_for_new_tab = route;
        $scope.id_for_new_tab = insurance.id;
  
        if(document_type == 12){
          $scope.id_for_new_tab = insurance.caratula;
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
  
        // function goToInfo(insurance) {
        //   if(insurance.document_type == 1){
        //     $state.go('polizas.info', {polizaId: insurance.id})
        //   } else if(insurance.document_type == 3){
        //     $state.go('colectividades.info', {polizaId: insurance.id})
        //   }else if (insurance.document_type == 11) {
        //     $state.go('flotillas.info',{polizaId: insurance.id})
        //   }else if (insurance.document_type == 12) {
        //     $state.go('flotillas.info',{polizaId: insurance.caratula})
        //   }
        // }
        
        // $state.go($scope.route_for_new_tab, {polizaId: $scope.id_for_new_tab});
      }
  
      $scope.subgrouping = [];
      $scope.subsubgrouping = [];
      vm.only_caratula_poliza = 0;
      vm.acceso_ver_pol = vm.acceso_ver_pol || undefined;
      vm.acceso_ver_ot = vm.acceso_ver_ot || undefined;
      $scope.infoUser = $sessionStorage.infoUser;
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
          }
          if(perm.model_name == 'Ordenes de trabajo'){
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
          }
          if(perm.model_name == 'Archivos'){
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
          if(perm.model_name == 'Referenciadores'){
            vm.coms = perm
            vm.coms.permissions.forEach(function(acc){
              if (acc.permission_name == 'Ver referenciadores') {
                if (acc.checked == true) {
                  vm.permiso_ver_referenciador = true
                }else{
                  vm.permiso_ver_referenciador = false
                }
              }
            })
          }
        })
      }
  
      function canConsultar() {
        return true;
      }
      // $(window).load(function() {
      //   $('.js-example-basic-multiple').select2();
      // });
      angular.element(document).ready(function(){
        $('.js-example-basic-multiple').select2();
      });
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
            return 'Vencida'
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
          case 7:
            return 'Semanal';
            break;
          case 14:
            return 'Catorcenal';
            break;
          default:
            return'No especificada';
        }
      }
  
      function changeOrder(par, asc) {
        switch(par) {
          case 1:
            search(par, asc);
            vm.order_type_asc = asc;
            vm.order_poliza_asc = 0;
            vm.order_contractor_asc = 0;
            vm.order_provider_asc = 0;
            vm.order_subramo_asc = 0;
            vm.order_pay_asc = 0;
            vm.order_status_asc = 0;
            vm.order_vigencia_asc = 0;
            break;
          case 2:
            search(par, asc);
            vm.order_poliza_asc = asc;
            vm.order_type_asc = 0;
            vm.order_contractor_asc = 0;
            vm.order_provider_asc = 0;
            vm.order_subramo_asc = 0;
            vm.order_pay_asc = 0;
            vm.order_status_asc = 0;
            vm.order_vigencia_asc = 0;
            break;
          case 3:
            search(par, asc);
            vm.order_contractor_asc = asc;
            vm.order_type_asc = 0;
            vm.order_poliza_asc = 0;
            vm.order_provider_asc = 0;
            vm.order_subramo_asc = 0;
            vm.order_pay_asc = 0;
            vm.order_status_asc = 0;
            vm.order_vigencia_asc = 0;
            break;
          case 4:
            search(par, asc);
            vm.order_provider_asc = asc;
            vm.order_type_asc = 0;
            vm.order_poliza_asc = 0;
            vm.order_contractor_asc = 0;
            vm.order_subramo_asc = 0;
            vm.order_pay_asc = 0;
            vm.order_status_asc = 0;
            vm.order_vigencia_asc = 0;
            vm.order_anti_asc = 0;
            break;
          case 5:
            search(par, asc);
            vm.order_subramo_asc = asc;
            vm.order_type_asc = 0;
            vm.order_poliza_asc = 0;
            vm.order_contractor_asc = 0;
            vm.order_provider_asc = 0;
            vm.order_pay_asc = 0;
            vm.order_status_asc = 0;
            vm.order_vigencia_asc = 0;
            break;
          case 6:
            search(par, asc);
            vm.order_pay_asc = asc;
            vm.order_type_asc = 0;
            vm.order_poliza_asc = 0;
            vm.order_contractor_asc = 0;
            vm.order_provider_asc = 0;
            vm.order_subramo_asc = 0;
            vm.order_status_asc = 0;
            vm.order_vigencia_asc = 0;
            break;
          case 7:
            search(par, asc);
            vm.order_status_asc = asc;
            vm.order_type_asc = 0;
            vm.order_poliza_asc = 0;
            vm.order_contractor_asc = 0;
            vm.order_provider_asc = 0;
            vm.order_subramo_asc = 0;
            vm.order_pay_asc = 0;
            vm.order_vigencia_asc = 0;
            break;
          case 8:
            search(par, asc);
            vm.order_vigencia_asc = asc;
            vm.order_type_asc = 0;
            vm.order_poliza_asc = 0;
            vm.order_contractor_asc = 0;
            vm.order_provider_asc = 0;
            vm.order_subramo_asc = 0;
            vm.order_pay_asc = 0;
            vm.order_status_asc = 0;
            break;
        }
      }
  
      function changeOrderOT(par, asc) {
        switch(par) {
          case 1:
            searchOT(par, asc);
            vm.order_ot_asc = asc;
            vm.order_conot_asc = 0;
            vm.order_aseg_asc = 0;
            vm.order_package_asc = 0;
            vm.order_subot_asc = 0;
            vm.order_payot_asc = 0;
            vm.order_statot_asc = 0;
            vm.order_valot_asc = 0;
            break;
          case 2:
            searchOT(par, asc);
            vm.order_conot_asc = asc;
            vm.order_ot_asc = 0;
            vm.order_aseg_asc = 0;
            vm.order_package_asc = 0;
            vm.order_subot_asc = 0;
            vm.order_payot_asc = 0;
            vm.order_statot_asc = 0;
            vm.order_valot_asc = 0;
            break;
          case 3:
            searchOT(par, asc);
            vm.order_aseg_asc = asc;
            vm.order_conot_asc = 0;
            vm.order_ot_asc = 0;
            vm.order_package_asc = 0;
            vm.order_subot_asc = 0;
            vm.order_payot_asc = 0;
            vm.order_statot_asc = 0;
            vm.order_valot_asc = 0;
            break;
          case 4:
            searchOT(par, asc);
            vm.order_package_asc = asc;
            vm.order_ot_asc = 0;
            vm.order_conot_asc = 0;
            vm.order_aseg_asc = 0;
            vm.order_subot_asc = 0;
            vm.order_payot_asc = 0;
            vm.order_statot_asc = 0;
            vm.order_valot_asc = 0;
            break;
          case 5:
            searchOT(par, asc);
            vm.order_subot_asc = asc;
            vm.order_ot_asc = 0;
            vm.order_conot_asc = 0;
            vm.order_aseg_asc = 0;
            vm.order_package_asc = 0;
            vm.order_payot_asc = 0;
            vm.order_statot_asc = 0;
            vm.order_valot_asc = 0;
            break;
          case 6:
            searchOT(par, asc);
            vm.order_payot_asc = asc;
            vm.order_ot_asc = 0;
            vm.order_conot_asc = 0;
            vm.order_aseg_asc = 0;
            vm.order_package_asc = 0;
            vm.order_subot_asc = 0;
            vm.order_statot_asc = 0;
            vm.order_valot_asc = 0;
            break;
          case 7:
            searchOT(par, asc);
            vm.order_statot_asc = asc;
            vm.order_ot_asc = 0;
            vm.order_conot_asc = 0;
            vm.order_aseg_asc = 0;
            vm.order_package_asc = 0;
            vm.order_subot_asc = 0;
            vm.order_payot_asc = 0;
            vm.order_valot_asc = 0;
            break;
          case 8:
            searchOT(par, asc);
            vm.order_valot_asc = asc;
            vm.order_ot_asc = 0;
            vm.order_conot_asc = 0;
            vm.order_aseg_asc = 0;
            vm.order_package_asc = 0;
            vm.order_subot_asc = 0;
            vm.order_payot_asc = 0;
            vm.order_statot_asc = 0;
            break;
        }
      }
  
      function addFilter(param) {
        if(param == 1){
          $scope.fechasFilter = true;
          vm.form.dates = 1;
        } else {
          $scope.fechasFilter = false;
          vm.form.dates = 2;
        }
      }
      function changeSubgroup(subg){
        if (subg) {
          vm.form.subgroup = subg;
          vm.subgroup = subg;
          $scope.subsubgroups = subg.subsubgrupos ? subg.subsubgrupos : []
        }else{
          vm.form.subgroup = 0;
          $scope.subsubgroups = []
        }
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
  
  
      
      $scope.valueRadio = function(val) {
          if(val == "true") {
            vm.form.inicio_fin = true;
          } else {
            vm.form.inicio_fin = false;
          }
      };
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
      
      vm.form = {
        provider: 0,
        ramo: 0,
        subramo: 0,
        since: convertDate(new Date()),
        until: convertDate(new Date()),
        payment:  0,
        status:  0,
        contratante: { val: '', value: 0 },
        group: { val: '', value: 0 },
        num_poliza: "",
        inicio_fin:  true,
        dates: 2,
        subgroup: { val: '', value: 0 },
        subsubgroup: { val: '', value: 0 },
        groupinglevel:  { val: '', value: 0 },
        subgrouping: { val: '', value: 0 },
        classification: { val: '', value: 0 },
        subsubgrouping: { val: '', value: 0 },
        businessLine:  0,
        celula:  0,
        only_caratula: 0,
        providers: [],
        ramos:  [],
        subramos:[],
      };
  
      vm.word = '';
      $scope.pageSelected = 0;
      
      // $scope.selectProv(vm.form.providers);
      // $scope.selectRamos(vm.form.providers);
      // $scope.selectSubramos(vm.form.providers);
      $scope.incio_fin = vm.form.inicio_fin;
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
            id: 7,
            name: 'Semanal'
          }, {
            id: 12,
            name: 'Anual'
          }, {
            id: 14,
            name: 'Catorcenal'
          }];
      if($scope.orgName =='ancora'){
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
          name: 'Vencida - En Proceso de Renovación'
        }, {
          id: 14,
          name: 'Vigente'
        }, {
          id: 15,
          name: 'No renovada'
        }];
      }else{
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
      }
  
  //---------------------------------------------------------------------------------------------------
      getProviders();
      getRamos();
      getSubramos();
      getCelulasContractor();
      vm.activate = activate;
      vm.showBinnacle = showBinnacle;
      vm.returnToReceipts = returnToReceipts;
      vm.saveLocalstorage = saveLocalstorage;
      function currentOrder() {
        return typeof filterState.order !== 'undefined' ? filterState.order : 1;
      }
  
      function currentAsc() {
        return typeof filterState.asc !== 'undefined' ? filterState.asc : 1;
      }
  
      function persistFilterState(overrides) {
        filterState = angular.extend({}, filterState, overrides || {});
        filterState.form = angular.copy(vm.form);
        filterState.word = angular.copy(vm.word);
        filterState.incio_fin = $scope.incio_fin;
        filterState.bLine = $scope.bLine;
      }
      activate()
      function activate() {
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
        getSubramos();
        getProviders();
        getGroupingLevel();
        getCelulasContractor();
        $scope.busqueda = true;
        $scope.from_activate = true;
        vm.show_results = false;
        vm.buttonReport = false;
        // checar si se llaman solo estos o para todas las categorias
        // $scope.getPolicies(1);
        // $scope.getPolicies(6);
        // getInsurancesAndOT();
  
      }
      function saveLocalstorage() {
        persistFilterState();
      }
      function getGroupingLevel(){
        $http.get(url.IP+'groupinglevel/').then(function(groupinglevel) {
          $scope.groupinglevel = groupinglevel.data.results;
        })
      }
      function getCelulasContractor(){
        $http.post(url.IP+'celula_contractor_info/').then(function(celulas) {
          $scope.celulas = celulas.data;
        })
      } 
      $scope.selectRamos = function(sel){
        vm.ramos_selected = [];
        vm.ramos_selected = [];
        vm.subramos_toselected = [];
        vm.id = sel[0].ramo_code;
        sel.forEach(function(r) {
            vm.ramos_selected.push(parseInt(r));
          })
          if (sel.length == 1) {
            if (vm.id) {
              $http.get(url.IP + 'subramos-by-ramo_code/'+ vm.id)
                .then(function(data){
                    vm.subramos_toselected = data.data;
              });
            }
          }
          if(sel.length == 0){
              vm.subramos_toselected = []
              vm.subramos_selected = [];
              getSubramos();
          }
      };
  
      $scope.selectSubramos = function(sel){
        console.log(sel);
  
          vm.subramos_selected = [];
          sel.forEach(function(sr) {
            if (sr.subramo_code)
              var code = sr.subramo_code;
            else
              var code = sr.id;
            vm.subramos_selected.push(code);
          })
      };
      $scope.selectProv = function(sel){
          vm.providers_selected = [];
          sel.forEach(function(cl) {
            vm.providers_selected.push(cl.id)
          })
      };
      function getRamos(){
        vm.ramos_toselected = [
          {
           ramo_code: 1,
           ramo_name: 'Vida'
         },{
           ramo_code: 2,
           ramo_name: 'Accidentes y Enfermedades'
         },{
           ramo_code: 3,
           ramo_name: 'Daños'
         }
       ];
      }
  
      function getSubramos(){
          vm.subramos_toselected = []
          vm.subramos_selected = []
          vm.subramos_toselected = [
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
              subramo_code: 30,
              subramo_name: 'Funerarios'
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
            },
            {
              subramo_code:31,
              subramo_name: 'Líneas Financieras'
            }
          ];
      }
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
                      if(item.juridical) {
                        var label = item.poliza_number+ ' - '+item.juridical.j_name + ' - '+ ' - '+convertDate(vm.policy.start_of_validity)+' - ' +convertDate(vm.policy.end_of_validity);
                      }else if(item.natural) {
                        var label = item.poliza_number+ ' - '+item.natural.full_name + ' - '+convertDate(vm.policy.start_of_validity)+' - ' +convertDate(vm.policy.end_of_validity);
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
        persistFilterState();
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
      function changeUntil() {
        var since = toDate(vm.form.since).getTime();
        var until = toDate(vm.form.until).getTime();
        var diff = until - since;
        var antiguedad = parseInt(diff/(1000*60*60*24))
        if(antiguedad < 0){
          SweetAlert.swal("Error", "La fecha final no puede ser menor que la inicial", "error")
          var newdate = convertDate(new Date());
          vm.form.until = newdate;
        }
      }
  
      function toDate(dateStr) {
        var dateString = dateStr; // Oct 23
        var dateParts = dateString.split("/");
        var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based
  
        return dateObject;
  
      }
  
      function returnToReceipts(param) {
        if(param) {
          vm.show_binnacle_ot = false;
        } else {
          vm.show_binnacle = false;
        }
  
      }
  
      function showBinnacle(param) {
        $http({
          method: 'GET',
          url: url.IP+'comments/',
          params: {
            'model': 1,
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
  
        if(param.status == 1) {
          vm.show_binnacle_ot = true;
          vm.policy_id_ot = param.id
        } else {
          vm.show_binnacle = true;
          vm.policy_id = param.id;
        }
      };
      vm.show_pag_search_ot = false;
      vm.search = search;
      vm.searchOT = searchOT;
  
      function search(order, asc,parPage) {
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
        if(vm.form.subsubgrouping){
          if(vm.form.subsubgrouping.id){
            var gl2 = vm.form.subsubgrouping.id;
          } else {
            var gl2 = 0;
          }
        } else {
          var gl2 = 0;
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
  
        vm.search_config = [];
        vm.search_results = [];
        $scope.order = order;
        $scope.asc = asc;
        vm.buttonReport = true;
        $scope.busqueda = true;
        $scope.from_activate = false;
        var ramos_to_search = [];
        var subramos_to_search = [];
        vm.form.ramos.forEach(function(ramo){
          ramos_to_search.push(ramo['ramo_code']);
        });
        vm.form.subramos.forEach(function(subramo){
          subramos_to_search.push(subramo['subramo_code']);
        });
  
        var params = {};
        params = {
          provider: vm.form.provider.id ? vm.form.provider.id : vm.form.provider ,
          ramo: vm.form.ramo.id ? vm.form.ramo.id : vm.form.ramo,
          subramo: vm.form.subramo.id ? vm.form.subramo.id : vm.form.subramo,
          since: vm.form.since ? vm.form.since : vm.form.si,
          until: vm.form.until ? vm.form.until : vm.form.un,
          payment: vm.form.payment.id ? vm.form.payment.id : vm.form.payment,
          businessLine: $scope.bLine ? $scope.bLine.id : 0,
          status: vm.form.status.id ? vm.form.status.id : vm.form.status,
          contratante: vm.form.contratante.value ? vm.form.contratante.value : 0,
          classification: vm.form.classification.value ? vm.form.classification.value : vm.form.classification,
          grupo: vm.form.group && vm.form.group.value ? vm.form.group.value : 0,
          subgrupo: g1 ? g1 : 0,
          subsubgrupo: g2 ? g2 : 0,
          groupinglevel: gl ? gl : 0,
          subgrupinglevel: gl1 ? gl1 : 0,
          subsubgrupinglevel: gl2 ? gl2 : 0, 
          type_contractor : vm.form.contratante.type ? vm.form.contratante.type : 0,
          poliza: vm.form.num_poliza ? vm.form.num_poliza : 0,
          // internal: vm.form.internal_number ? vm.form.internal_number : 0,
          inicio_fin: vm.form.inicio_fin,
          order: order,
          asc: asc,
          page: parPage ? parPage : 1,
          dates: vm.form.dates,
          ramos: ramos_to_search,
          subramos: subramos_to_search, 
          providers: vm.providers_selected ? vm.providers_selected : 0,
          celula: cel ? cel : 0, 
          only_caratula: vm.only_caratula_poliza ? vm.only_caratula_poliza : 0,
        }
        persistFilterState({
          page: parPage ? parPage : 1,
          order: order,
          asc: asc
        });
  
        params.since = params.since+ " " + "00:00:00";
        params.until = params.until+ " " + "23:59:59";
        if(vm.form.contratante.val == "" || vm.form.contratante.val == null || vm.form.contratante == undefined){
          params.contratante = 0;
        }
        if(vm.form.classification.val == "" || vm.form.classification.val == null || vm.form.classification == undefined){
          params.classification = 0;
        }
        // if(vm.form.group.val == "" || vm.form.group.val == null || vm.form.group == undefined){
        //   params.grupo = 0;
        // }
        // if(vm.form.classification.val == "" || vm.form.classification.val == null || vm.form.classification == undefined){
        //   params.classification = 0;
        // }
        // if($scope.subgroups.length == 0 || vm.form.subgroup.val == "" || vm.form.subgroup.val == null || vm.form.subgroup == undefined){
        //   params.subgrupo = 0;
        // }
        // if($scope.subsubgroups.length == 0 || vm.form.subsubgroup.val == "" || vm.form.subsubgroup.val == null || vm.form.subsubgroup == undefined){
        //   params.subsubgrupo = 0;
        // }
        if(vm.form.classification.val == "" || vm.form.classification.val == null || vm.form.classification == undefined){
          params.classification = 0;
        }
        $scope.filtros = params;
        var url_fpu = 'filtros-polizas/';
        if (vm.acceso_ver_pol) {
          $http({
              method: 'POST',
              url: url.IP + url_fpu,
              data: $scope.filtros
          })
          .then(
              function success(request) {
                if((request.status === 200 || request.status === 201) && request.data.results.length) {
                  vm.show_results = true;
                  vm.show_policy = false;
                  var data = request.data.results;
                  data.forEach(function(value){
                    if (value.old_policies) {
                      value.old_policies.forEach(function(old){
                        if (old) {
                          if (value.id == old.base_policy.id) {
                            if (value.renewed) {
                              value.historic =' Renovada';
                            }else{
                              value.historic = ' por renovar'
                            }
                          }else if (value.id == old.new_policy.id) {
                            value.historic ='de Renovación';
                          }else{
                            value.historic = ' nueva'
                          }
                        }else{
                          value.historic = ' nueva'
                        }
  
                      })
                      if (value.historic) {
                      }else{
                        value.historic = ' nueva'
                      }
                    }
                    // $http({
                    //   method: 'GET',
                    //   url: url.IP + 'historic-policies/',
                    //   params: {
                    //     actual_id: value.id
                    //   }
                    // }).then(function success(response) {
                    //   if(response.data.results.length){
                    //     response.data.results.forEach(function function_name(old) {
                    //       if(old.base_policy){
                    //         if(value.id == old.new_policy.id){
                    //           if (old.new_policy) {
                    //             value.historic ='de Renovación';
                    //           }
                    //         } else {
                    //             value.historic = ' nueva'
                    //         }
                    //       }else{
                    //         value = ''
                    //       }
                    //     })
                    //   }else{
                    //     value.historic = ' nueva'
                    //   }
                    // })
                  })
                  data.forEach(function(item) {
                    if(item.status == 1 || item.status == 2) {
                      vm.search_results = 0;
                      vm.show_pag_search =  false;
                    }
                    else{
  
                      vm.search_results.push(item);
                      $scope.search_results = {
                        count: request.data.count,
                        previous: url.IP +url_fpu,
                        next: url.IP +url_fpu
                      };
                      // testPagination('vm.search_results', 'search_results');
                      $scope.obtenerPaginacion(request.data, parPage ? parPage : 1);
                      vm.show_pag_search = true;
                    }
                  });
                } else {
                  toaster.warning("No se encontraron registros");
                }
              },
              function error(error) {
  
              }
          )
          .catch(function(e){
              console.log(e);
          });
        }
      }
  
      function searchOT(par, asc, parPage) {
        if(vm.acceso_ver_ot){
          $scope.filtros.order = par;
          $scope.filtros.asc = asc;
          $scope.filtros.page = parPage ? parPage : 1;
          $scope.order = par;
          $scope.asc = asc;
          persistFilterState({
            page: parPage ? parPage : 1,
            order: par,
            asc: asc
          });
          // **************Filtros OTS
          vm.ot_results = [];
          if(vm.search_results == 0){
            vm.show_pag_search =  false;
          }
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   var url_fpu = 'v2/polizas/filtros-polizas-ot/';
          var url_fpu = 'filtros-polizas-ot/';
          $http({
              // method: 'GET',
              // url: url.IP + url_fpu,
              // params: $scope.filtros
              method: 'POST',
              url: url.IP + url_fpu,
              data: $scope.filtros
          })
          .then(
              function success(request) {
                vm.ot_config = {};
                vm.ot_results = [];
  
                if((request.status === 200 || request.status === 201) ) {
                  vm.show_results = true;
                  vm.show_policy = false;
                  // vm.show_pag_search_ot = false;
                  var data = request.data.results;
                  vm.ot_results = request.data.results;
                  vm.ot_results.forEach (function (value){
                    if (value.old_policies) {
                        value.old_policies.forEach(function(old){
                          if (old) {
                            if (value.id == old.base_policy.id) {
                              if (value.renewed) {
                                value.historic =' Renovada';
                              }else{
                                value.historic = ' por renovar'
                              }
                            }else if (value.id == old.new_policy.id) {
                              value.historic ='de Renovación';
                            }else{
                              value.historic = ' nueva'
                            }
                          }else{
                            value.historic = ' nueva'
                          }
  
                        })
                        if (value.historic) {
                        }else{
                          value.historic = ' nueva'
                        }
                      }
                  })
                  // vm.ot_config = {
                  //   count: request.data.count,
                  //   previous: request.data.previous,
                  //   next: request.data.next
                  // };
                  vm.ot_results = request.data.results;
                  $scope.ot_results = {
                    count: request.data.count,
                    previous: url.IP +url_fpu,
                    next: url.IP +url_fpu
                  };
                  // testPaginationSearch('ot_results', 'ot_results');
                  $scope.obtenerPaginacionOT(request.data, parPage ? parPage : 1);
                  vm.show_pag_search_ot = true;
                  // testPaginationSearch('vm.ot_results', 'vm.ot_config');
                } else {
                  toaster.warning("No se encontraron registros");
                }
              },
              function error(error) {
  
              }
          )
          .catch(function(e){
              console.log(e);
          });
        }
      }
      // nueva paginación inicial
      $scope.obtenerPaginacion = function(pagesdata, pagina){
        $scope.paginacion = {
          count: pagesdata['count'],
          previous: pagesdata['previous'],
          next: pagesdata['next'],
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
        var order = currentOrder();
        var asc = currentAsc();
        persistFilterState({ page: pagina, order: order, asc: asc });
        vm.search(order, asc, pagina);
      }
  
      $scope.anteriorPagina = function(){
        if($scope.paginacion['paginaActual'] > 1){
          var order = currentOrder();
          var asc = currentAsc();
          var pagina = $scope.paginacion['paginaActual'] - 1;
          persistFilterState({ page: pagina, order: order, asc: asc });
          vm.search(order, asc, pagina);
        }
      }
  
      $scope.siguientePagina = function(){
        var numeroPaginas = Math.ceil($scope.paginacion['count'] / 10);
        if(numeroPaginas > $scope.paginacion['paginaActual']){
          var order = currentOrder();
          var asc = currentAsc();
          var pagina = $scope.paginacion['paginaActual'] + 1;
          persistFilterState({ page: pagina, order: order, asc: asc });
          vm.search(order, asc, pagina);
        }
      }
      $scope.obtenerPaginacionOT = function(pagesdata, pagina){
        $scope.paginacionOT = {
          count: pagesdata['count'],
          previous: pagesdata['previous'],
          next: pagesdata['next'],
          totalPaginas: [],
          paginaInicio: 0,
          paginaActual: pagina,
          paginaFin: 0
        }
        var numeroPaginas = Math.ceil($scope.paginacionOT['count'] / 10);
        var i = 0;      
        i = pagina - 5;
        if(i <= 0){
          i = 0;
        }
    
        for(i; i < numeroPaginas; i++){
          if($scope.paginacionOT['totalPaginas'].length <= 5){
            $scope.paginacionOT['totalPaginas'].push(i + 1);
          }
        }
        if($scope.paginacionOT['totalPaginas'].length > 5){
          $scope.paginacionOT['paginaInicio'] = $scope.paginacionOT['totalPaginas'] - 5;
        }else{
          $scope.paginacionOT['paginaInicio'] = 1;
        }
        if($scope.paginacionOT['totalPaginas'].length > 5){
          $scope.paginacionOT['paginaFin'] = 5;
        }else{
          $scope.paginacionOT['paginaFin'] = $scope.paginacionOT['totalPaginas'].length;
        }
      }
    
      $scope.selecionPaginaOT = function (pagina){
        var order = currentOrder();
        var asc = currentAsc();
        persistFilterState({ page: pagina, order: order, asc: asc });
        vm.searchOT(order, asc, pagina);
      }
  
      $scope.anteriorPaginaOT = function(){
        if($scope.paginacionOT['paginaActual'] > 1){
          var order = currentOrder();
          var asc = currentAsc();
          var pagina = $scope.paginacionOT['paginaActual'] - 1;
          persistFilterState({ page: pagina, order: order, asc: asc });
          vm.searchOT(order, asc, pagina);
        }
      }
  
      $scope.siguientePaginaOT = function(){
        var numeroPaginas = Math.ceil($scope.paginacionOT['count'] / 10);
        if(numeroPaginas > $scope.paginacionOT['paginaActual']){
          var order = currentOrder();
          var asc = currentAsc();
          var pagina = $scope.paginacionOT['paginaActual'] + 1;
          persistFilterState({ page: pagina, order: order, asc: asc });
          vm.searchOT(order, asc, pagina);
        }
      }
      $scope.exportData = function (aseguradoras) {
        if(aseguradoras == 'Polizas') {
          var header = '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
          var blob = new Blob([header + document.getElementById('policy_exportable').innerHTML], {
              type: "data:application/vnd.ms-excel;charset=UTF-8"
          });
        }
          else {
            var header = '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
            var blob = new Blob([header + document.getElementById('exportable').innerHTML], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
          });
          }
          saveAs(blob, "Reporte_" + aseguradoras + ".xls");
      };
  
      $scope.exportDataFilter = function (param){
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        var data = $scope.filtros;
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //     // var url_rep = 'v2/generics/reporte-policy/';
        //     // var url_rep_ot = 'v2/generics/reporte-policy-ot/';
        //     var url_rep = 'service_reporte-v2-poliza-excel';
        //     var url_rep_ot = 'service_reporte-v2-poliza-excel_ot';
        var url_rep = 'service_reporte-poliza-excel';
        var url_rep_ot = 'service_reporte-poliza-excel_ot';
        if (param == 1) {
              // $http({
                // method: 'GET',
                // url: url.IP +'reporte-policy/',
                // params: $scope.filtros
              //   method: 'POST',
              //   url: url.IP + 'reporte-policy/',
              //   data: $scope.filtros
              // })
              // .then(function (request) {
              //   if(request.status === 200) {
              //       exportFactory.excel(request.data, 'Pólizas');
              //   }
  
              // })
              // .catch(function (e) {
              //   console.log('e', e);
              // });
            $http({
              method: 'POST',
                      url: url.IP + url_rep, //'reporte-policy/',
                      data: $scope.filtros,
                      headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                      responseType: "arraybuffer"
                  }). then(function success(request) {
                        if(request.status === 200) {
                            var blob = new Blob([request.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                            saveAs(blob, 'Reporte_Polizas_Módulo.xls');
                        }
                        l.stop();
                      })
                      .catch(function (e) {
                        l.stop();
                        console.log('e', e);
                      });
            }
          if (param == 2) {
            // $http({
            //       method: 'POST',
            //       url: url.IP + 'reporte-policy-ot/',
            //       data: $scope.filtros
            //       })
            //       .then(function (request) {
            //         if(request.status === 200) {
            //           exportFactory.excel(request.data, 'Pólizas_OT');
            //         }
  
            //       })
            //       .catch(function (e) {
            //         console.log('e', e);
            //       });
            $http({
              method: 'POST',
                url: url.IP + url_rep_ot,//'reporte-policy-ot/'
                data: $scope.filtros,
                headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                responseType: "arraybuffer"
            }). then(function success(request) {
                  if(request.status === 200) {
                      var blob = new Blob([request.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                      saveAs(blob, 'Reporte_PolizasOT_Módulo.xls');
                  }
                  l.stop();
                })
                .catch(function (e) {
                  l.stop();
                  console.log('e', e);
                });
            }
  
      }
      //----------------------------------------------------------------------------------------------
  
      function getInsurancesAndOT(){
          vm.search_results=[];
          vm.vm.show_results = false;
          vm.ot = [];
          vm.policy = [];
          insuranceService.getPolicies()
            .then(function(policies){
                vm.ot = policies.ots;
                var url = null;
                var data = [];
                vm.policy = policies.policies;
  
              });
  
      }
  
      vm.show_policies = false;
      $scope.getPolicies = function (param) {
  
        vm.search_results=[];
        $scope.busqueda = true;
        vm.show_results = false;
        vm.show_policies = true;
        vm.show_policy = true;
        $http({
          method: 'GET',
          url: url.IP+'polizas-custom/',
          params: {
            status: param
          }
        })
        .then(
          function success(request) {
            if(param < 6) {
  
              vm.policy = [];
              vm.policy_config = {};
              request.data.results.forEach(function(item) {
                vm.policy.push(item);
              });
              vm.policy_config = {
                count: request.data.count,
                previous: request.data.previous,
                next: request.data.next
              };
              vm.show_pag_policy = true;
  
              $scope.testPaginationPolicy('vm.policy', 'vm.policy_config');
  
            } else {
              vm.ot = [];
              request.data.results.forEach(function(item) {
                vm.ot.push(item);
              });
              vm.ot_config = {
                count: request.data.count,
                previous: request.data.previous,
                next: request.data.next
              };
              vm.show_pag_ot = true;
                $scope.testPaginationOT('vm.ot', 'vm.ot_config');
            }
  
          },
          function error(error) {
            console.log('error', error);
          }
        )
        .catch(function(e) {
          console.log('e', e);
        });
      };
  
      $scope.testPaginationOT = function(parModel, parConfig) {
        var config_ = $parse(parConfig)($scope);
        if(config_) {
          var pages = Math.ceil(config_.count / 10);
        }
  
        $scope.totalPages_ot = [];
        var count_items = 0;
        var count_pages = 0;
  
        var previous_array = [];
        var next_array = [];
  
        $scope.start = 0;
        $scope.end = 5;
        $scope.actual_page_ot = 1;
        $scope.not_prev = true;
  
        for (var i = 0; i < pages; i++) {
          $scope.totalPages_ot.push(i+1);
        }
  
  
        $scope.lastPageOT = function() {
          // TODO: ultimo bloque
          if($scope.totalPages_ot.length > 5) {
            $scope.end = $scope.totalPages_ot.length;
            $scope.start = ($scope.totalPages_ot.length) -5;
            $scope.show_prev_block = true;
          }
  
          $scope.selectPage($scope.totalPages_ot.length);
  
          $scope.actual_page_ot = $scope.totalPages_ot.length;
  
        }
  
        $scope.selectPageOT = function (parPage) {
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
          getData(url);
          $scope.actual_page = parPage;
          if($scope.actual_page > 1) {
            $scope.not_prev = false;
          }
  
          if($scope.actual_page == $scope.totalPages.length -1) {
            $scope.not_next = true;
          }
  
        };
        $scope.previousBlockPagesOT = function(param) {
          if(param) {
            if($scope.start < $scope.actual_page_ot) {
              $scope.start = $scope.start - 1 ;
              $scope.end = $scope.end - 1;
            }
  
          } else {
            $scope.start = $scope.start - 5 ;
            $scope.end = $scope.end - 5;
  
            if($scope.end < $scope.totalPages_ot.length) {
                $scope.not_next = false;
            }
          }
  
          if($scope.end <= 5) {
            $scope.start = 0;
            $scope.end = 5;
            $scope.show_prev_block = false;
          }
        }
  
        $scope.nextBlockPagesOT = function(param) {
  
          $scope.show_prev_block_ot = true;
  
          if(param) {
            if($scope.end > $scope.actual_page_ot) {
              $scope.start = $scope.start + 1 ;
              $scope.end = $scope.end + 1;
            }
          } else {
            if($scope.end < $scope.totalPages_ot.length) {
              $scope.start = $scope.start + 5 ;
              $scope.end = $scope.end + 5;
  
              if($scope.end == $scope.totalPages_ot.length) {
                  $scope.not_next = true;
              }
            } else {
              $scope.not_next = true;
            }
          }
  
        }
  
  
        function getData(parUrl) {
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
  
      $scope.testPaginationPolicy = function(parModel, parConfig) {
  
        var config_ = $parse(parConfig)($scope);
        if(config_) {
          var pages = Math.ceil(config_.count / 10);
        }
  
        $scope.totalPages_policy = [];
        var count_items = 0;
        var count_pages = 0;
  
        var previous_array = [];
        var next_array = [];
  
        $scope.start = 0;
        $scope.end = 5;
        $scope.actual_page = 1;
        $scope.not_prev = true;
  
        for (var i = 0; i < pages; i++) {
          $scope.totalPages_policy.push(i+1);
        }
  
        $scope.lastPagePolicy = function() {
          // TODO: ultimo bloque
          if($scope.totalPages_policy.length > 5) {
            $scope.end = $scope.totalPages_policy.length;
            $scope.start = ($scope.totalPages_policy.length) -5;
            $scope.show_prev_block = true;
          }
  
          $scope.selectPage($scope.totalPages_policy.length);
  
          $scope.actual_page = $scope.totalPages_policy.length;
  
        }
  
        $scope.selectPagePolicy = function (parPage) {
  
          if(config_.next || config_.previous) {
  
            if(config_.next) {
              var next_ = config_.next;
  
              if(next_.search('&status=') !== -1) {
                var status = next_.substring(next_.indexOf("&status=") + 1);
              } else {
                var status = '';
              }
  
              var url = config_.next.substring(0, config_.next.indexOf("&page=") + 6);
              url += parPage.toString();
              url += '&'+status
  
            } else {
              var prev_ = config_.previous;
              if(config_.previous.search('&status=') !== -1) {
                var status = config_.previous.substring(config_.previous.indexOf("&status=") + 1);
              } else {
                var status = '';
              }
  
              if(config_.previous.search('&page=') !== -1) {
                var url = config_.previous.substring(0, config_.previous.indexOf("&page=") + 6);
                url += parPage.toString();
                url += '&'+status;
  
              } else {
                var url = config_.previous
              }
            }
          }
  
          // url += '&status=1'
          getData(url);
          $scope.actual_page = parPage;
          if($scope.actual_page > 1) {
            $scope.not_prev = false;
          }
  
          if($scope.actual_page == $scope.totalPages_policy.length -1) {
            $scope.not_next = true;
          }
  
        };
  
  
        $scope.previousBlockPagesPolicy = function(param) {
          if(param) {
            if($scope.start < $scope.actual_page) {
              $scope.start = $scope.start - 1 ;
              $scope.end = $scope.end - 1;
            }
  
          } else {
            $scope.start = $scope.start - 5 ;
            $scope.end = $scope.end - 5;
  
            if($scope.end < $scope.totalPages_policy.length) {
                $scope.not_next = false;
            }
          }
  
          if($scope.end <= 5) {
            $scope.start = 0;
            $scope.end = 5;
            $scope.show_prev_block = false;
          }
        }
  
        $scope.nextBlockPagesPolicy = function(param) {
  
          $scope.show_prev_block = true;
  
          if(param) {
            if($scope.end > $scope.actual_page) {
              $scope.start = $scope.start + 1 ;
              $scope.end = $scope.end + 1;
            }
          } else {
            if($scope.end < $scope.totalPages_policy.length) {
              $scope.start = $scope.start + 5 ;
              $scope.end = $scope.end + 5;
  
              if($scope.end == $scope.totalPages_policy.length) {
                  $scope.not_next = true;
              }
            } else {
              $scope.not_next = true;
            }
          }
  
        }
  
  
        function getData(parUrl) {
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
  
          vm.search($scope.order, $scope.asc, parPage);
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
      // -----------------PAGINACIÓN
      // -----------PAGINACIÓN
      function testPaginationSearch(parModel, parConfig) {
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
        // $scope.actual_page = 1;
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
          // $scope.actual_page = $scope.totalPages.length;
          // $scope.page = $scope.totalPages.length;
        }
  
        $scope.selectPage = function (parPage) {
          $scope.actual_page = parPage;
  
          vm.searchOT($scope.order, $scope.asc, parPage);
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
      }
      // -----------------PAGINACIÓN
  
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
  
      // Groupinhdssa
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
      // --classification
  
      function matchesGroup(parWord, parType) {
          $scope.subgroups = [];
            $scope.subsubgroups = [];
            $scope.groups_data = 0;
            if(parType) {
              var word_data = parWord.val;
              parWord = parWord.val;
            } else if(vm.form.group.val) {
              var word_data = vm.form.group.val;
            }
            if(word_data) {
                if(word_data.length >= 3) {
                  // if($scope.infoUser.staff && !$scope.infoUser.superuser){
                  //     $scope.show_group = 'v2/contratantes/grupos-match/';
                  $scope.show_group = 'grupos-match/';
                    $http.post(url.IP + $scope.show_group,
                    {
                        'matchWord': parWord
                    }).then(function(response) {
                        if(response.status === 200 ) {
                            var source = [];
                            var groups = response.data;
                            groups.forEach(function(item) {
                              $scope.subgroups = item.subgrupos;
                      $scope.subsubgroups = [];
                                $scope.subgroups.forEach(function(itm) {
                                  $scope.subsubgroups = itm.subsubgrupos
                                });
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
      
      function matchesSubGroup(parWord, parType) {
          $scope.subgroups_data = 0;
          if(parType) {
            var word_data = parWord.val;
            parWord = parWord.val;
          } else if(vm.form.subgroup.val) {
            var word_data = vm.form.subgroup.val;
          }
          if(word_data) {
              if(word_data.length >= 2) {
                  $scope.show_subgroup = 'subgrupos-match/';
                  $http.post(url.IP + $scope.show_subgroup,
                  {
                      'matchWord': parWord,
                      'parent': vm.form.group.value
                  }).then(function(response) {
                      if(response.status === 200 ) {
                          var source = [];
                          var subgroups = response.data;
                          subgroups.forEach(function(item) {
                              var obj = {
                                 label: item.group_name,
                                 value: item.id
                              };
                              source.push(obj);
                          });
                          $scope.subgroups_data = source;
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
                  'matchWord': parWord
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
                          value: item.id
                        };
                      } else {
                       var obj = {
                          label: item.first_name+' '+ item.last_name+' '+ item.second_last_name,
                          value: item.id
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
      };
  
  
      function changeProvider(obj) {
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
      function changeBLine(obj){
        console.log(obj);
        $scope.bLine = obj
        if(obj){
          vm.form.businesLine = obj;
        } else {
          vm.form.businesLine = 0;
        }
      }
      function changePayment(obj){
        if(obj){
          vm.form.payment = obj;
        } else {
          vm.form.payment = 0;
        }
      }
  
      function convertDate(inputFormat) {
        function pad(s) {        return (s < 10) ? '0' + s : s;
        }
        var d = new Date(inputFormat);
        var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
        return date;
      }
  
      $('.datepicker-me input').datepicker();
      $('.js-example-basic-multiple').select2();
  
      $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
      $.fn.datepicker.defaults.startView = 0;
      $.fn.datepicker.defaults.autoclose = true;
      $.fn.datepicker.defaults.language = 'es';
    }
  })();