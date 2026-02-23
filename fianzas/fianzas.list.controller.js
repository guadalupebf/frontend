(function() {
    'use strict';

    angular.module('inspinia')
        .controller('FianzasListCtrl', FianzasListCtrl);

    FianzasListCtrl.$inject = ['$rootScope','toaster', 'dataFactory', 'datesFactory', 'providerService', '$scope','$http','url','$parse',
                                                    '$sessionStorage','$state', 'appStates','$localStorage'];
    function FianzasListCtrl($rootScope,toaster, dataFactory, datesFactory, providerService, $scope,$http,url,$parse,$sessionStorage,
                                                  $state, appStates,$localStorage) {
      var vm = this;
      /* Variables */
      vm.form = {
        provider: 0,
        ramo: 0,
        subramo: 0,
        since: datesFactory.convertDate(new Date()),
        until: datesFactory.convertDate(new Date()),
        status: 0,
        contratante: 0,
        group: 0,
        num_poliza: "",
        inicio_fin: true,
	      classification: 0,
	      subgroup: 0,
	      subsubgroup: 0,
	      groupinglevel: 0,
	      subgrouping: 0,
	      subsubgrouping: 0,
	      celula: 0,
      };
      vm.subgroup = 0;    
    	vm.subsubgroup = 0;
	    $scope.subsubgroups = [];
	    $scope.subgroups = [];
	    vm.groupinglevel = 0;    
	    vm.subgroupinglevel = 0;
	    $scope.groupinglevel = [];
	    $scope.subgroupinglevel = [];
	    vm.subsubgroupinglevel = 0;
	    $scope.subsubgroupinglevels = [];
	    $scope.subgrouping = []
	    $scope.subsubgrouping = []
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
        }, 
        {
          id: 11,
          name: 'Cancelada'
        },
         {
          id: 12,
          name: 'Renovada'
        }, {
          id: 13,
          name: 'Vencida'
        }, {
          id: 14,
          name: 'Vigente'
      	}, {
          id: 17,
          name: 'Anulada'
      }];
      /* Funciones */
      vm.changeOrder = changeOrder;
      vm.changeOrderOT = changeOrderOT;
    	vm.matchesContractors = matchesContractors;
    	vm.matchesGroup = matchesGroup;
	    vm.matchesGroupinglevel = matchesGroupinglevel;
	    vm.matchesClassification = matchesClassification;
      vm.search = search;
      vm.searchOT = searchOT;
      vm.testPagination = testPagination;
	    vm.show_pag_search =  false;
	    vm.show_binnacle_fianza = false;
      vm.show_binnacle_fianza_ot = false;
      vm.showBinnacle = showBinnacle;
      vm.showBinnacle_ot = showBinnacle_ot;
      vm.returnToFianza = returnToFianza;
      vm.changeProvider = changeProvider;
	    vm.changeSubgroup = changeSubgroup;
	    vm.changeSubsubgroup = changeSubsubgroup;
	    vm.changeSubgrouping = changeSubgrouping;
	    vm.changeSubsubgrouping = changeSubsubgrouping;
      $scope.infoUser = $sessionStorage.infoUser;  
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
      vm.accesos = $sessionStorage.permisos
	    if (vm.accesos) {
	      vm.accesos.forEach(function(perm){
	        if(perm.model_name == 'Fianzas'){
	          vm.acceso_fianza = perm
	          vm.acceso_fianza.permissions.forEach(function(acc){
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
	            }
	          })
	        }
	      })
	    }
            $scope.pageSelected  = 0;
    	$scope.infoUser = $sessionStorage.infoUser;

	function showBinnacle(param) {
        $http({
          method: 'GET',
          url: url.IP+'comments/',
          params: {
            'model': 13,
          'id_model': param.id
          }
        })
        .then(function(request) {   
          vm.comments_data_fianza = request.data.results;
          vm.comments_config_fianza = {
            count: request.data.count,
            previous: request.data.previous,
            next: request.data.next
          }
        })
        .catch(function(e) {
          console.log('e', e);
        });
        vm.fianza_id = param.id;
        vm.show_binnacle_fianza = true;
	};
	function changeSubgroup(subg){
	      vm.form.subgroup = subg;
	      vm.subgroup = subg;
	      $scope.subsubgroups = subg.subsubgrupos ? subg.subsubgrupos : []
	}
	function changeSubsubgroup(subg){
	      vm.form.subsubgroup = subg;
	      vm.subsubgroup = subg;
	}
	function changeSubgrouping(subgl){
	      vm.form.subgrouping = subgl;
	      vm.subgrouping = subgl;
	      $scope.subsubgrouping = subgl.subsubgrupos ? subgl.subsubgrupos : []
	}
	function changeSubsubgrouping(subgl){
	      vm.form.subsubgrouping = subgl;
	      vm.subsubgrouping = subgl;
	}
	function showBinnacle_ot(param) {
        $http({
          method: 'GET',
          url: url.IP+'comments/',
          params: {
            'model': 13,
          'id_model': param.id
          }
        })
        .then(function(request) {   
          vm.comments_data_fianza_ot = request.data.results;
          vm.comments_config_fianza_ot = {
            count: request.data.count,
            previous: request.data.previous,
            next: request.data.next
          }
        })
        .catch(function(e) {
          console.log('e', e);
        });
        vm.fianza_id = param.id;
        vm.show_binnacle_fianza_ot = true;
	};
	function returnToFianza() {
        vm.show_binnacle_fianza = false;
        vm.show_binnacle_fianza_ot = false;
	}	 
	activate();
	function activate() {
    		getCelulasContractor();
      	var now = new Date()
      	var curr_date = now.getDate();
		    var curr_month = now.getMonth() + 1;
		    var curr_year = now.getFullYear();
		    providerService.getProviderFiByKey(curr_year + "-" + curr_month + "-" + curr_date)
        	.then(function success(data) {
          	vm.providers = data.data;
        },
        function error(err) {
          console.log('error', err);
        });
        $scope.pageSelected  = 0;
    }
	function getCelulasContractor(){
      	$http.post(url.IP+'celula_contractor_info/').then(function(celulas) {
	        $scope.celulas = celulas.data;
	      })
	} 
    function changeOrder(par, asc) {
	    switch(par) {
	        case 1:
	          search(par, asc, 1);
	          vm.order_type_asc = 0;
	          vm.order_poliza_asc = asc;
	          vm.order_contractor_asc = 0;
	          vm.order_provider_asc = 0;
	          vm.order_subramo_asc = 0;
	          vm.order_pay_asc = 0;
	          vm.order_status_asc = 0;
	          vm.order_vigencia_asc = 0;
	          vm.order_ramo_asc = 0;
	          break;
	        case 2:
	          search(par, asc, 1);
	          vm.order_poliza_asc = 0;
	          vm.order_type_asc = 0;
	          vm.order_contractor_asc = asc;
	          vm.order_provider_asc = 0;
	          vm.order_subramo_asc = 0;
	          vm.order_pay_asc = 0;
	          vm.order_status_asc = 0;
	          vm.order_vigencia_asc = 0;
	          vm.order_ramo_asc = 0;
	          break;
	        case 3:
	          search(par, asc, 1);
	          vm.order_contractor_asc = 0;
	          vm.order_type_asc = 0;
	          vm.order_poliza_asc = 0;
	          vm.order_provider_asc = asc;
	          vm.order_subramo_asc = 0;
	          vm.order_pay_asc = 0;
	          vm.order_status_asc = 0;
	          vm.order_vigencia_asc = 0;
	          vm.order_ramo_asc = 0;
	          break;
	        case 4:
	          search(par, asc, 1);
	          vm.order_provider_asc = 0;
	          vm.order_type_asc = 0;
	          vm.order_poliza_asc = 0;
	          vm.order_contractor_asc = 0;
	          vm.order_subramo_asc = 0;
	          vm.order_pay_asc = 0;
	          vm.order_status_asc = 0;
	          vm.order_vigencia_asc = 0;
	          vm.order_ramo_asc = asc;
	          break;
	        case 5:
	          search(par, asc, 1);
	          vm.order_subramo_asc = asc;
	          vm.order_type_asc = 0;
	          vm.order_poliza_asc = 0;
	          vm.order_contractor_asc = 0;
	          vm.order_provider_asc = 0;
	          vm.order_pay_asc = 0;
	          vm.order_status_asc = 0;
	          vm.order_vigencia_asc = 0;
	          vm.order_ramo_asc = 0;
	          break;
	        case 6:
	          search(par, asc, 1);
	          vm.order_pay_asc = 0;
	          vm.order_type_asc = asc;
	          vm.order_poliza_asc = 0;
	          vm.order_contractor_asc = 0;
	          vm.order_provider_asc = 0;
	          vm.order_subramo_asc = 0;
	          vm.order_status_asc = 0;
	          vm.order_vigencia_asc = 0;
	          vm.order_ramo_asc = 0;
	          break;
	        case 7:
	          search(par, asc, 1);
	          vm.order_status_asc = asc;
	          vm.order_type_asc = 0;
	          vm.order_poliza_asc = 0;
	          vm.order_contractor_asc = 0;
	          vm.order_provider_asc = 0;
	          vm.order_subramo_asc = 0;
	          vm.order_pay_asc = 0;
	          vm.order_vigencia_asc = 0;
	          vm.order_ramo_asc = 0;
	          break;
	        case 8:
	          search(par, asc, 1);
	          vm.order_vigencia_asc = asc;
	          vm.order_type_asc = 0;
	          vm.order_poliza_asc = 0;
	          vm.order_contractor_asc = 0;
	          vm.order_provider_asc = 0;
	          vm.order_subramo_asc = 0;
	          vm.order_pay_asc = 0;
	          vm.order_status_asc = 0;
	          vm.order_ramo_asc = 0;
	          break;
		}
	}

	function changeOrderOT(par, asc) {
		switch(par) {
		case 1:
			searchOT(par, asc);
			vm.order_otype_asc = 0;
			vm.order_opoliza_asc = asc;
			vm.order_ocontractor_asc = 0;
			vm.order_oprovider_asc = 0;
			vm.order_osubramo_asc = 0;
			vm.order_opay_asc = 0;
			vm.order_ostatus_asc = 0;
			vm.order_ovigencia_asc = 0;
			vm.order_oramo_asc = 0;
			break;
		case 2:
			searchOT(par, asc);
			vm.order_opoliza_asc = 0;
			vm.order_otype_asc = 0;
			vm.order_ocontractor_asc = asc;
			vm.order_oprovider_asc = 0;
			vm.order_osubramo_asc = 0;
			vm.order_opay_asc = 0;
			vm.order_ostatus_asc = 0;
			vm.order_ovigencia_asc = 0;
			vm.order_oramo_asc = 0;
			break;
		case 3:
			searchOT(par, asc);
			vm.order_ocontractor_asc = 0;
			vm.order_otype_asc = 0;
			vm.order_opoliza_asc = 0;
			vm.order_oprovider_asc = asc;
			vm.order_osubramo_asc = 0;
			vm.order_opay_asc = 0;
			vm.order_ostatus_asc = 0;
			vm.order_ovigencia_asc = 0;
			vm.order_oramo_asc = 0;
			break;
		case 4:
			searchOT(par, asc);
			vm.order_oprovider_asc = 0;
			vm.order_otype_asc = 0;
			vm.order_opoliza_asc = 0;
			vm.order_ocontractor_asc = 0;
			vm.order_osubramo_asc = 0;
			vm.order_opay_asc = 0;
			vm.order_ostatus_asc = 0;
			vm.order_ovigencia_asc = 0;
			vm.order_oramo_asc = asc;
			break;
		case 5:
			searchOT(par, asc);
			vm.order_osubramo_asc = asc;
			vm.order_otype_asc = 0;
			vm.order_opoliza_asc = 0;
			vm.order_ocontractor_asc = 0;
			vm.order_oprovider_asc = 0;
			vm.order_opay_asc = 0;
			vm.order_ostatus_asc = 0;
			vm.order_ovigencia_asc = 0;
			vm.order_oramo_asc = 0;
			break;
		case 6:
			searchOT(par, asc);
			vm.order_opay_asc = 0;
			vm.order_otype_asc = asc;
			vm.order_opoliza_asc = 0;
			vm.order_ocontractor_asc = 0;
			vm.order_oprovider_asc = 0;
			vm.order_osubramo_asc = 0;
			vm.order_ostatus_asc = 0;
			vm.order_ovigencia_asc = 0;
			vm.order_oramo_asc = 0;
			break;
		case 7:
			searchOT(par, asc);
			vm.order_ostatus_asc = asc;
			vm.order_otype_asc = 0;
			vm.order_opoliza_asc = 0;
			vm.order_ocontractor_asc = 0;
			vm.order_oprovider_asc = 0;
			vm.order_osubramo_asc = 0;
			vm.order_opay_asc = 0;
			vm.order_ovigencia_asc = 0;
			vm.order_oramo_asc = 0;
			break;
		case 8:
			searchOT(par, asc);
			vm.order_ovigencia_asc = asc;
			vm.order_otype_asc = 0;
			vm.order_opoliza_asc = 0;
			vm.order_ocontractor_asc = 0;
			vm.order_oprovider_asc = 0;
			vm.order_osubramo_asc = 0;
			vm.order_opay_asc = 0;
			vm.order_ostatus_asc = 0;
			vm.order_oramo_asc = 0;
			break;
		}
	}
	$scope.status = function(value) {
		switch (value) {
		case 1:
			return 'En trámite';
			break;
		case 2:
			return 'OT Cancelada';
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
		case 17:
			return 'Anulada';
			break;
		default:
			return 'Pendiente';
		}
	}
	    function search(order, asc,page) {
				vm.show_pag_search =  false;	      
				vm.search_config = [];
				vm.search_results = [];
				vm.buttonReport = true;
				$scope.busqueda = true;
				var params = {}; 
		    if(vm.form.celula){
		    	if(vm.form.celula.id){
	          var cel = vm.form.celula.id;
	        } else {
	          var cel = 0;
	        }
	    	} else {
	      	var cel = 0;
		    }

				params = {
	        provider: vm.form.provider.id ? vm.form.provider.id : vm.form.provider ,
	        ramo: vm.form.ramo.id ? vm.form.ramo.id : vm.form.ramo,
	        subramo: vm.form.subramo.id ? vm.form.subramo.id : vm.form.subramo,
	        since: vm.form.since ? vm.form.since : vm.form.si,
	        until: vm.form.until ? vm.form.until : vm.form.un,
	        status: vm.form.status.id ? vm.form.status.id : vm.form.status,
	        contratante: vm.form.contratante.value ? vm.form.contratante.value : 0,
	        classification: vm.form.classification.value ? vm.form.classification.value : vm.form.classification,
	        grupo: vm.form.group.value ? vm.form.group.value : vm.form.group,
	        subgrupo: vm.form.subgroup.id ? vm.form.subgroup.id : 0,
	        subsubgrupo: vm.form.subsubgroup ? vm.form.subsubgroup.id : 0,
	        groupinglevel: vm.form.groupinglevel.value ? vm.form.groupinglevel.value : vm.form.groupinglevel,
	        subgrupinglevel: vm.form.subgrouping ? vm.form.subgrouping.id : 0,
	        subsubgrupinglevel: vm.form.subsubgrouping ? vm.form.subsubgrouping.id : 0,
	        type_contractor : vm.form.contratante.type ? vm.form.contratante.type : 0,
	        fianza: vm.form.num_poliza ? vm.form.num_poliza : 0,
	        celula: cel ? cel : 0,
	        inicio_fin: vm.form.inicio_fin,
	        order: order,
	        asc: asc,
	        page: page ? page : 1
		    }
	      $scope.actual_page =page ?page :  1;
		    if(vm.form.group.val == "" ){
          params.grupo = 0;
          vm.form.group.value = "";
          vm.form.group.type = ""
        }
        if(vm.form.classification.val == "" || vm.form.classification.val == null || vm.form.classification == undefined){
          params.classification = 0;
        }
				if($scope.subgroups.length == 0 || vm.form.subgroup.id == "" || vm.form.subgroup.id == null || vm.form.subgroup == undefined){
          params.subgrupo = 0;
        }
				if($scope.subsubgroups.length == 0 || vm.form.subsubgroup.id == "" || vm.form.subsubgroup.id == null || vm.form.subsubgroup == undefined){
          params.subsubgrupo = 0;
        }
        if(vm.form.groupinglevel.val == "" || vm.form.groupinglevel.val == null || vm.form.groupinglevel == undefined){
          params.groupinglevel = 0;
        }
        if($scope.subgrouping.length == 0 || vm.form.subgrouping.id == "" || vm.form.subgrouping.id == null || vm.form.subgrouping == undefined){
          params.subgrupinglevel = 0;
        }
        if($scope.subsubgrouping.length == 0 || vm.form.subsubgrouping.id == "" || vm.form.subsubgrouping.id == null || vm.form.subsubgrouping == undefined){
          params.subsubgrupinglevel = 0;
        }
        if(vm.form.contratante.val == "" ){
          params.contratante = 0;
          vm.form.contratante.value = "";
          vm.form.contratante.type = ""
        }

        params.since = params.since+ " " + "00:00:00";
        params.until = params.until+ " " + "23:59:59";
        $scope.filtros = params;
        $scope.filtros.page = page ? page : 1
        $scope.filtros.order = order ? order : 1
        $scope.filtros.asc = asc ? asc : 1
                        var filter_fianza = 'filtros-fianza/';
        $http({
            method: 'GET',
            url: url.IP + filter_fianza,
            params: $scope.filtros
        })
        .then(function success(request) {
          if((request.status === 200 || request.status === 201) && request.data.results.length) {
            vm.fianzas = request.data.results;
            vm.search_results = [];
            vm.search_results_ot = [];
            vm.show_results = true;
            vm.show_policy = false;
            var data = request.data.results;
            data.forEach(function(item) {
              if(item.status == 1 || item.status == 2) {
                vm.search_results_ot.push(item);
                vm.show_pag_search =  false;
              } else{
                vm.search_results.push(item);		                      	
              } 
            });
            vm.search_config = {
            	count: request.data.count,
              previous: url.IP +filter_fianza,
              next: url.IP +filter_fianza
          	};
          	vm.show_pag_search = true;
			$scope.obtenerPaginacion(request.data, page ? page : 1);
    		// testPagination('vm.fianzas', 'vm.search_config');
          } else {
          	vm.search_results = []
          	vm.fianzas = []
            toaster.warning("No se encontraron registros de Fianza");
          }
        },
        function error(error) {})
        .catch(function(e){
          console.log(e);
        });	        
	}
	function searchOT(order,asc,page){
	    $scope.actual_pageOT =page ?page :  1;
	    $scope.filtrosOT = $scope.filtros;
	    $scope.filtrosOT.order = order;
     	$scope.filtrosOT.asc = asc;
     	$scope.filtrosOT.page = page ? page : 1;
		var filter_fianza_ot = 'filtros-fianza-ot/';     
        $http({
            method: 'GET',
            url: url.IP + filter_fianza_ot,
						params: $scope.filtrosOT
        })
          .then(function success(request) {
            if((request.status === 200 || request.status === 201) && request.data.results.length) {
              vm.fianzas_ot = request.data.results;
              vm.search_results = [];
              vm.search_results_ot = [];
              vm.show_results = true;
              vm.show_policy = false;
              var data = request.data.results;
              data.forEach(function(item) {
                if(item.status == 1 || item.status == 2) {
                  vm.search_results_ot.push(item);
                } else{
                  vm.search_results.push(item);		                      	
                } 
              });
              vm.search_config_ot = {
	            	count: request.data.count,
	              previous: url.IP +filter_fianza_ot,
	              next: url.IP +filter_fianza_ot
            	};
            	vm.show_pag_search_ot = true;
                $scope.obtenerPaginacionOT(request.data, page ? page : 1);
        		//   testPaginationOT('vm.fianzas_ot', 'vm.search_config_ot');
            } else {
            	vm.search_results_ot = []
            	vm.fianzas_ot = []
              toaster.warning("No se encontraron registros de OTs");
            }
          },
          function error(error) {
          })
        .catch(function(e){
            console.log(e);
        });
	}
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
            $scope.show_group = 'grupos-match/';
            $http.post(url.IP + $scope.show_group,{'matchWord': parWord})
            .then(function(response) {
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
            $http.post(url.IP + $scope.show_claass,{'matchWord': parWord})
            .then(function(response) {
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
	$scope.ShowContextMenu = function(name, insurence){
	      $scope.name_for_new_tab = name;
	      var route = 'fianzas.info';
	      if(insurence.document_type == 8){
	        route = 'fianzas.details';
	      } else {
	        route = 'fianzas.info';
	      }
	      $scope.route_for_new_tab = route;
	      $scope.id_for_new_tab = insurence.id;
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
						  href: $state.href($scope.route_for_new_tab, {polizaId: $scope.id_for_new_tab })
						}
					  );
					  $localStorage.tab_states = appStates.states;
					  // $localStorage.tab_index = $localStorage.tab_states.length -1;
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
	        $scope.show_contratante = 'contractors-match/';
            $http.post(url.IP + $scope.show_contratante,{'matchWord': parWord})
            .then(function(response) {
              if(response.status === 200 && (response.data.contractors)) {
                var source = [];
                var contratactorsFound = response.data.contractors;
                if(contratactorsFound.length) {
                  contratactorsFound.forEach(function(item) {
                    if(item.full_name) {
                      var obj = {
                        label: item.full_name,
                        value: item.id,
                        type: item.type_person == 'Física' ? 1 : 2
                      };
                    } else {
                     var obj = {
                        label: item.first_name+' '+ item.last_name+' '+ item.second_last_name,
                        value: item.id,
                        type: item.type_person == 'Física' ? 1 : 2
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
	// nueva paginación inicial
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
                vm.search(1,1,pagina);
        }
	
        $scope.anteriorPagina = function(){
                if($scope.paginacion['paginaActual'] > 1){
                        vm.search(1,1,$scope.paginacion['paginaActual'] - 1)
                }
        }
	
        $scope.siguientePagina = function(){
                var numeroPaginas = Math.ceil($scope.paginacion['count'] / 10);
                if(numeroPaginas > $scope.paginacion['paginaActual']){
                        vm.search(1,1,$scope.paginacion['paginaActual'] + 1)
                }
        }
	// OTs
	$scope.obtenerPaginacionOT = function(clasificacionOT, pagina){
		$scope.paginacionOT = {
		  count: clasificacionOT['count'],
		  previous: clasificacionOT['previous'],
		  next: clasificacionOT['next'],
		  totalPaginas: [],
		  paginaInicio: 0,
		  paginaActual: pagina,
		  paginaFin: 0
		}
		var numeroPaginasOT = Math.ceil($scope.paginacionOT['count'] / 10);
		var i = 0;      
		i = pagina - 5;
		if(i <= 0){
		  i = 0;
		}
	
		for(i; i < numeroPaginasOT; i++){
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
		vm.searchOT(1,1,pagina);
	}
	
	$scope.anteriorPaginaOT = function(){
		if($scope.paginacionOT['paginaActual'] > 1){
		  vm.searchOT(1,1,$scope.paginacionOT['paginaActual'] - 1)
		}
	}
	
	$scope.siguientePaginaOT = function(){
		var numeroPaginasOT = Math.ceil($scope.paginacionOT['count'] / 10);
		if(numeroPaginasOT > $scope.paginacionOT['paginaActual']){
		  vm.searchOT(1,1,$scope.paginacionOT['paginaActual'] + 1)
		}
	}
	// fin nueva paginación
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
	      	console.log('para',param)
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
			function testPaginationOT(parModel, parConfig) {
	      var config_ = $parse(parConfig)($scope);
	      if(config_) {
	        var pages = Math.ceil(config_.count / 10);
	      }
	      $scope.totalPagesPOT = [];
	      var count_items = 0;
	      var count_pages = 0;

	      var previous_array = [];
	      var next_array = [];

	      $scope.start = 0;
	      $scope.end = 5;
	      // $scope.actual_page = 1;
	      $scope.not_prev = true;

	      for (var i = 0; i < pages; i++) {
	        $scope.totalPagesPOT.push(i+1);
	      }
	      $scope.lastPagePOT = function() {
	        // TODO: ultimo bloque
	        if($scope.totalPagesPOT.length > 5) {
	          $scope.end = $scope.totalPagesPOT.length;
	          $scope.start = ($scope.totalPagesPOT.length) -5;
	          $scope.show_prev_block = true;
	        }
	        $scope.selectPagePOT($scope.totalPagesPOT.length);
	        // $scope.actual_page = $scope.totalPagesPOT.length;
	        // $scope.page = $scope.totalPagesPOT.length;
	      }

	      $scope.selectPagePOT = function (parPage) {
	        $scope.actual_pageOT = parPage;
	        vm.searchOT($scope.order, $scope.asc, parPage);
	      };

	      $scope.previousBlockPagesPOT = function(param) {
	        if(param) {
	          if($scope.start < $scope.actual_pageOT) {
	            $scope.start = $scope.start - 1 ;
	            $scope.end = $scope.end - 1;
	          }

	        } else {
	          $scope.start = $scope.start - 5 ;
	          $scope.end = $scope.end - 5;

	          if($scope.end < $scope.totalPagesPOT.length) {
	              $scope.not_next = false;
	          }
	        }

	        if($scope.end <= 5) {
	          $scope.start = 0;
	          $scope.end = 5;
	          $scope.show_prev_block = false;
	        }
	      }

	      $scope.nextBlockPagesPOT = function(param) {
	        $scope.show_prev_block = true;
	        if(param) {
	          if($scope.end > $scope.actual_pageOT) {
	            $scope.start = $scope.start + 1 ;
	            $scope.end = $scope.end + 1;
	          }
	        } else {
	          if($scope.end < $scope.totalPagesPOT.length) {
	            $scope.start = $scope.start + 5 ;
	            $scope.end = $scope.end + 5;

	            if($scope.end == $scope.totalPagesPOT.length) {
	                $scope.not_next = true;
	            }
	          } else {
	            $scope.not_next = true;
	          }
	        }

	      }
	    }

			$scope.selectSurety = function(item){
				if(item.document_type == 8){
					var name = 'Información fianza'
					var route = 'fianzas.details';
				}else{
					var name = 'Información fianza'
					var route = 'fianzas.info';
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
	      $localStorage.tab_index = $localStorage.tab_states.length -1;
				if(item.document_type == 8){
					$state.go('fianzas.details', {polizaId: item.id});
				}else{
					$state.go('fianzas.info', {polizaId: item.id});
				}
			};
		  $('.datepicker-me input').datepicker();
	    $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
	    $.fn.datepicker.defaults.startView = 0;
	    $.fn.datepicker.defaults.autoclose = true;
	    $.fn.datepicker.defaults.language = 'es';
  }
})();