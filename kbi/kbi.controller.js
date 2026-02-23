(function() {
    'use strict';
    /* jshint devel: true */

    angular.module('inspinia') 
        .controller('kbicontrolCtrl', kbicontrolCtrl);

    kbicontrolCtrl.$inject =['$firebaseObject','$sce', 'curr_rate_options', '$scope', 'statusPayform', '$state', '$uibModal', '$filter', '$localStorage', '$timeout', '$location', 'Idle',
        'receiptService', 'insuranceService', 'ContratanteService', 'providerService', 'ramoService', 'packageService', 'MESSAGES', '$sessionStorage',
        'status', 'payform', 'url', 'moduleInjection', 'modalService', 'helpers', 'toaster', 'endorsementService', '$q', '$http', 'endorsement', '$rootScope', '$window', 'SweetAlert',
        'exportFactory', 'dataFactory', 'FileUploader'];

    function kbicontrolCtrl($firebaseObject, $sce, curr_rate_options, $scope, statusPayform, $state, $uibModal, $filter, $localStorage, $timeout, $location, Idle,
        receiptService, insuranceService, ContratanteService, providerService, ramoService, packageService, MESSAGES, $sessionStorage,
        status, payform, url, moduleInjection, modalService, helpers, toaster, endorsementService, $q, $http, endorsement, $rootScope, $window, SweetAlert,
        exportFactory, dataFactory, FileUploader)  {   

        var vm = this;
        var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);
        vm.orgName=usr.org
        vm.accesos = $sessionStorage.permisos

        if (vm.accesos) {
            vm.accesos.forEach(function(perm){
            if(perm.model_name == 'Dashboard'){
              vm.acceso_dash = perm
              vm.acceso_dash.permissions.forEach(function(acc){
                if (acc.permission_name == 'Gráfica OTs') {
                  if (acc.checked == true) {
                    vm.permiso_g_ot = true
                  }else{
                    vm.permiso_g_ot = false
                  }
                }else if (acc.permission_name == 'Gráfica cobranza') {
                  if (acc.checked == true) {
                    vm.permiso_g_cob = true
                  }else{
                    vm.permiso_g_cob = false
                  }
                }else if (acc.permission_name == 'Gráfica renovaciones') {
                  if (acc.checked == true) {
                    vm.permiso_g_ren = true
                  }else{
                    vm.permiso_g_ren = false
                  }
                }else if (acc.permission_name == 'Gráfica siniestros') {
                  if (acc.checked == true) {
                    vm.permiso_g_sin = true
                  }else{
                    vm.permiso_g_sin = false
                  }
                }else if (acc.permission_name == "KBI's") {
                  if (acc.checked == true) {
                    vm.permiso_kbi = true
                  }else{
                    vm.permiso_kbi = false
                  }
                }else if (acc.permission_name == "Filtrado gráfica cobranza") {
                  if (acc.checked == true) {
                    vm.permiso_f_cob = true
                  }else{
                    vm.permiso_f_cob = false
                  }
                }
              })
            }else if(perm.model_name == 'Pólizas'){
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
                }else if (acc.permission_name == 'Eliminar pólizas') {
                  if (acc.checked == true) {
                    vm.acceso_del_pol = true
                  }else{
                    vm.acceso_del_pol = false
                  }
                }
              })
            }else if(perm.model_name == 'Endosos'){
              vm.acceso_endosos = perm
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
            }else if(perm.model_name == 'Paquetes'){
              vm.acceso_pack = perm
              vm.acceso_pack.permissions.forEach(function(acc){
                if (acc.permission_name == 'Crear paquete') {
                  if (acc.checked == true) {
                    vm.acceso_adm_pack = true
                  }else{
                    vm.acceso_adm_pack = false
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
            }else if (perm.model_name == 'Agenda') {
              vm.acceso_age = perm;
              vm.acceso_age.permissions.forEach(function(acc) {
                if (acc.permission_name == 'Agenda') {
                  if (acc.checked == true) {
                    vm.acceso_age = true
                  }else{
                    vm.acceso_age = false
                  }
                }
              })
            }else if (perm.model_name == 'Notificaciones') {
              vm.acceso_mns = perm;
              vm.acceso_mns.permissions.forEach(function(acc) {
                if (acc.permission_name == 'Administrar notificaciones') {
                  if (acc.checked == true) {
                    vm.acceso_not = true
                  }else{
                    vm.acceso_not = false
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
            }else if (perm.model_name == 'Campañas') {
              vm.acceso_camp = perm;
              vm.acceso_camp.permissions.forEach(function(acc) {
                if (acc.permission_name == 'Campañas') {
                  if (acc.checked == true) {
                    vm.acceso_camp = true
                  }else{
                    vm.acceso_camp = false
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

        $scope.uploader = new FileUploader();

        if($sessionStorage.infoUser){
            vm.acceso_adm_tas = $sessionStorage.infoUser.another_tasks
        }else{
            vm.acceso_adm_tas = false;
        }
        if($sessionStorage.user) {
            var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
            var usr = JSON.parse(decryptedUser);
            if($sessionStorage.token) {
                var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
                var token = JSON.parse(decryptedToken);
            }
        }
        /* -------- Inicia KBI -------- */

        $scope.show_financiero = true;
        $scope.show_produccion = false;
        $scope.show_cotizacion = false;
        $scope.show_gastos = false;
        $scope.showLoaderKbi = false;

        $scope.charts_kbi = {}
        $scope.newGoal = {
          value: null,
          model: null,
          options: [
            {id: '1', name: 'MXN'},
            {id: '2', name: 'USD'}
          ]
        };
        $scope.currencies = [
          {id: '1', name: 'MXN'},
          {id: '2', name: 'USD'}
        ];
        $scope.options = [
          {id: '1', name: 'Año'},
          {id: '2', name: 'Ramo'},
          {id: '3', name: 'Subramo'}
        ];
        $scope.newGoal.model = $scope.newGoal.options[0].id;
        $scope.year_kbi = (new Date()).getFullYear();
        $scope.currency_kbi = "1";
        $scope.show_for = "1";

        $scope.show_currency_mxn = true;
        $scope.show_currency_usd = false;
        $scope.show_currency_eur = false;
        $scope.show_currency_udi = false;

        var currentYear = new Date().getFullYear();
        var firstDay = new Date(currentYear, 0, 1);
        var lastDay = new Date(currentYear, 11, 31);
        $scope.startDate_production = $scope.convertDateMain(firstDay);
        $scope.endDate_production = $scope.convertDateMain(lastDay);
        $scope.data_filter = {
          since_year: (new Date()).getFullYear() - 1,
          until_year: (new Date()).getFullYear(),
          since_day: $scope.startDate_production,
          until_day: $scope.endDate_production
        }

        $scope.concepts = [
          {concept: 'Renta / Alquiler', cantidad: '', value: 1},
          {concept: 'Nómina', cantidad: '', value: 2},
          {concept: 'Servicios Públicos', cantidad: '', value: 3},
          {concept: 'Publicidad', cantidad: '', value: 4},
          {concept: 'Impuestos', cantidad: '', value: 5},
          {concept: 'Materiales de oficina', cantidad: '', value: 6},
          {concept: 'Tributos', cantidad: '', value: 7},
          {concept: 'Préstamos o hipotecas', cantidad: '', value: 8},
          {concept: 'Servicios de empresas externas', cantidad: '', value: 9}
        ];

        $scope.month_old = 0;
        $scope.year_old = 0;
        $scope.month_new = 0;
        $scope.year_new = 0;

        $scope.year_old = $scope.data_filter.until_year;
        $scope.year_new = $scope.data_filter.since_year;
        if ($sessionStorage.infoUser) {
          $scope.url_kbi = 'kbi/'
          // }else{
          //   $scope.url_kbi = 'v2/core/kbi/'
          // }
        }else{
          $scope.url_kbi = 'kbi/'
        }
        
        vm.activateKBI = activateKBI;
        vm.getInfoKBI = getInfoKBI;
        vm.getFilter = getFilter;

        function getFilter(value, param, startDate, endDate){
          $scope.showLoaderKbi = true;
          $scope.year_kbi = param;
          var anio = parseInt(param)
          $scope.year_kbi_preview = anio - 1;
          if(value == 0){
            $scope.year_kbi = (new Date()).getFullYear();
            $scope.data_filter = {
              since_year: (new Date()).getFullYear() - 1,
              until_year: (new Date()).getFullYear(),
              since_day: $scope.startDate_production,
              until_day: $scope.endDate_production
            }
          }else{
            $scope.data_filter = {
              since_year: $scope.year_kbi - 1,
              until_year: $scope.year_kbi,
              since_day: startDate ? startDate : $scope.startDate_production,
              until_day: endDate ? endDate : $scope.endDate_production,
            }
          }

          if (!$scope.data_filter.since_day || !$scope.data_filter.until_day) {
            SweetAlert.swal(
              "Faltan fechas",
              "No se pudieron calcular las fechas desde/hasta para el filtro. Intenta cambiar el año o recargar la pantalla.",
              "warning"
            );
            $scope.showLoaderKbi = false;
            console.warn('KBI request blocked: missing since_day or until_day', $scope.data_filter);
            return;
          }

          getInfoKBI();
        };

        activateKBI();

        function activateKBI() {
          dataFactory.get('configkbi/').then(function success(response) {
            if(response.data.results.length >0){
              $scope.tipo_cambio = response.data.results[0].tipocambio
            }else{
              $scope.tipo_cambio = $scope.tipo_cambio ? $scope.tipo_cambio :20
            }
          })
          if(vm.orgName!='gpi'){
            vm.getFilter(0, new Date().getFullYear());
          }

          // vm.getFilter(0, new Date().getFullYear());
        }

        $scope.dataMonth = function(month_old, year_old, month_new, year_new){
          $scope.month_old = month_old;
          $scope.year_old = year_old;
          $scope.month_new = month_new;
          $scope.year_new = year_new;
        }

        $scope.monthComparative = function() {
          var data = {
            'month': $scope.month_old,
            'year': $scope.year_old,
            'month_c': $scope.month_new,
            'year_c': $scope.year_new
          }
          dataFactory.post('kbi-subramos/', data).then(function success(response) {
            $scope.charts_kbi.polarDataFinancial.data = response.data.polarDataFinancial.data;
            $scope.charts_kbi.polarDataFinancialDolar.data = response.data.polarDataFinancialDolar.data;
          })
          // vm.getFilter(0, new Date().getFullYear());
        }

        $scope.changeCurrencyKbi = function(value){
          if(value == "1"){
            $scope.show_currency_mxn = true;
            $scope.show_currency_usd = false;
            $scope.show_currency_eur = false;
            $scope.show_currency_udi = false;
            $scope.currency_kbi = "1";
          }else if(value == "2"){
            $scope.show_currency_mxn = false;
            $scope.show_currency_usd = true;
            $scope.show_currency_eur = false;
            $scope.show_currency_udi = false;
            $scope.currency_kbi = "2";
          }else if(value == "3"){
            $scope.show_currency_mxn = false;
            $scope.show_currency_usd = false;
            $scope.show_currency_eur = true;
            $scope.show_currency_udi = false;
          }else if(value == "4"){
            $scope.show_currency_mxn = false;
            $scope.show_currency_usd = false;
            $scope.show_currency_eur = false;
            $scope.show_currency_udi = true;
          }
        };

        function getInfoKBI(tipocambio) {
          $scope.showLoaderKbi = true;
          if ($scope.charts_kbi) {
            $scope.charts_kbi.aseguradoras = {};
            $scope.charts_kbi.aseguradorasDolar = {};
            $scope.charts_kbi.subramos = {};
            $scope.charts_kbi.subramosDolar = {};
          }
          $scope.data_filter.tipocambio = $scope.tipo_cambio ? $scope.tipo_cambio :20
          // dataFactory.post('kbi/')
          dataFactory.post($scope.url_kbi, $scope.data_filter)
          .then(function success(response) {
            $scope.charts_kbi = response.data;
            $scope.now = $scope.convertDateMain(new Date());
            $scope.charts_kbi.ejecutivos = JSON.parse(response.data.ejecutivos);
            $scope.charts_kbi.ejecutivosDolar = JSON.parse(response.data.ejecutivosDolar);
            $scope.charts_kbi.aseguradoras = JSON.parse(response.data.aseguradoras);
            $scope.charts_kbi.aseguradorasDolar = JSON.parse(response.data.aseguradorasDolar);
            $scope.charts_kbi.subramos = JSON.parse(response.data.subramos);
            $scope.charts_kbi.subramosDolar = JSON.parse(response.data.subramosDolar);
         
            $scope.charts_kbi.anterior_ejecutivos = JSON.parse(response.data.anterior_ejecutivos);
            $scope.charts_kbi.anterior_ejecutivosDolar = JSON.parse(response.data.anterior_ejecutivosDolar);
            $scope.charts_kbi.anterior_aseguradoras = JSON.parse(response.data.anterior_aseguradoras);
            $scope.charts_kbi.anterior_aseguradorasDolar = JSON.parse(response.data.anterior_aseguradorasDolar);
            $scope.charts_kbi.anterior_subramos = JSON.parse(response.data.anterior_subramos);
            $scope.charts_kbi.anterior_subramosDolar = JSON.parse(response.data.anterior_subramosDolar);
            $scope.charts_kbi.goal.percentajeGoal = parseFloat($scope.charts_kbi.goal.percentajeGoal).toFixed(2);
            $scope.progressGoal = {
              'width': $scope.charts_kbi.goal.percentajeGoal + '%'
            };

            if($scope.charts_kbi.goal.value > 0){
              $scope.showBtnKbi = true;
              var fin = new Date();
              var f = fin.getFullYear()-1;
              $scope.fin =fin.getFullYear();
              $scope.range_pc = 'De: '+$scope.now +' al '+'31/12/'+$scope.fin; 
              $scope.range_cp = 'De: '+'01/01/'+$scope.fin +' al '+$scope.now; 
              $scope.range_date = 'De: '+'01/01/'+$scope.fin +' al '+'31/12/'+$scope.fin ; 
              $scope.range_bar = 'Años: '+f +' y '+fin.getFullYear() ; 
            } else {
              $scope.showBtnKbi = false;
            }

            $scope.newGoal.value = parseFloat($scope.charts_kbi.goal.value);
            $scope.newGoal.model = $scope.charts_kbi.goal.currency;
            if($scope.charts_kbi.monthsUtilidad){
              $scope.total_utilidad = 0;
              $scope.charts_kbi.monthsUtilidad.forEach(function(item){
                if(item.value){
                  $scope.total_utilidad = parseFloat(($scope.total_utilidad + parseFloat(item.value)).toFixed(2));
                }
              });
            }if($scope.charts_kbi.monthsUtilidad_anterior){
              $scope.total_utilidad_ant = 0;
              $scope.charts_kbi.monthsUtilidad_anterior.forEach(function(item){
                if(item.value){
                  $scope.total_utilidad_ant = parseFloat(($scope.total_utilidad_ant + parseFloat(item.value)).toFixed(2));
                }
              });
            }
            $scope.showLoaderKbi = false;
          })
        }

        $scope.selectMonth = function(mes) {
          $scope.month_selected = mes.id;
        }

        $scope.show_tab_kbi = function(value){
          if(value == 1){
            $scope.show_financiero = true;
            $scope.show_produccion = false;
            $scope.show_cotizacion = false;
            $scope.show_gastos = false;
          }
          else if(value == 2){
            $scope.show_financiero = false;
            $scope.show_produccion = true;
            $scope.show_cotizacion = false;
            $scope.show_gastos = false;
          }
          else if(value == 3){
            $scope.show_financiero = false;
            $scope.show_produccion = false;
            $scope.show_cotizacion = true;
            $scope.show_gastos = false;
          }
          else if(value == 4){
            $scope.show_financiero = false;
            $scope.show_produccion = false;
            $scope.show_cotizacion = false;
            $scope.show_gastos = true;
          }
          // if($scope.show_currency_mxn){
          //   $scope.changeCurrencyKbi("1");
          // }else if($scope.show_currency_usd){
          //   $scope.changeCurrencyKbi("2");
          // }
        }

        $scope.show_ejectivo = true;
        $scope.show_aseguradora = false;
        $scope.show_subramo = false;

        $scope.show_tab_production = function(value){
          if(value == 1){
            $scope.show_ejectivo = true;
            $scope.show_aseguradora = false;
            $scope.show_subramo = false;
          }
          else if(value == 2){
            $scope.show_ejectivo = false;
            $scope.show_aseguradora = true;
            $scope.show_subramo = false;
          }
          else if(value == 3){
            $scope.show_ejectivo = false;
            $scope.show_aseguradora = false;
            $scope.show_subramo = true;
          }
        };

        $scope.saveGoal = function(){
          dataFactory.post('goal/', {'goal': $scope.newGoal.value});
          $scope.showBtnKbi = true;
        };

        $scope.editGoal = function(){
          dataFactory.post('goal/', {'goal': $scope.newGoal.value});
          $scope.showBtnKbi = false;
        };

        $scope.saveGastos = function(){
          var obj = [];
          $scope.concepts.forEach(function(child, index) {
            if(child.concept && child.cantidad){
              child.month = $scope.month_selected;
              obj.push(child);
            }
            if($scope.concepts.length == (index + 1)){
              dataFactory.post('expenses/', obj)
              .then(function success(response) {
                if(response.status == 201){
                  $scope.concepts = [
                    {concept: 'Renta / Alquiler', cantidad: '', value: 1},
                    {concept: 'Nómina', cantidad: '', value: 2},
                    {concept: 'Servicios Públicos', cantidad: '', value: 3},
                    {concept: 'Publicidad', cantidad: '', value: 4},
                    {concept: 'Impuestos', cantidad: '', value: 5},
                    {concept: 'Materiales de oficina', cantidad: '', value: 6},
                    {concept: 'Tributos', cantidad: '', value: 7},
                    {concept: 'Préstamos o hipotecas', cantidad: '', value: 8},
                    {concept: 'Servicios de empresas externas', cantidad: '', value: 9}
                  ];
                  getInfoKBI();
                }
              })
            }
          })
        };

        $scope.months_kbi = [
          {'id': 1, 'month': 'Enero'},
          {'id': 2, 'month': 'Febrero'},
          {'id': 3, 'month': 'Marzo'},
          {'id': 4, 'month': 'Abril'},
          {'id': 5, 'month': 'Mayo'},
          {'id': 6, 'month': 'Junio'},
          {'id': 7, 'month': 'Julio'},
          {'id': 8, 'month': 'Agosto'},
          {'id': 9, 'month': 'Septiembre'},
          {'id': 10, 'month': 'Octubre'},
          {'id': 11, 'month': 'Noviembre'},
          {'id': 12, 'month': 'Diciembre'}
        ];

        $scope.anios_kbi = [
          {'id': 2026, 'year': '2026'},
          {'id': 2025, 'year': '2025'},
          {'id': 2024, 'year': '2024'},
          {'id': 2023, 'year': '2023'},
          {'id': 2022, 'year': '2022'},
          {'id': 2021, 'year': '2021'},
          {'id': 2020, 'year': '2020'},
        ];

        $scope.monthName = function (month){
          switch(month) {
            case 1:
              return 'Enero'
              break;
            case 2:
              return 'Febrero'
              break;
            case 3:
              return 'Marzo'
              break;
            case 4:
              return 'Abril'
              break;
            case 5:
              return 'Mayo'
              break;
            case 6:
              return 'Junio'
              break;
            case 7:
              return 'Julio'
              break;
            case 8:
              return 'Agosto'
              break;
            case 9:
              return 'Septiembre'
              break;
            case 10:
              return 'Octubre'
              break;
            case 11:
              return 'Noviembre'
              break;
            case 12:
              return 'Diciembre'
              break;
          }
        }

        $scope.addConcept = function(){
          var concept = {
            concept: '',
            cantidad: '',
            value: 10
          };
          $scope.concepts.push(concept);
        };

        $scope.removeConcept = function(item){
          $scope.concepts.splice(item, 1);
        };

        $scope.validateDecimal = function(input){
          if(input){
            if(parseFloat(input) < 0){
              $scope.$filternewGoal.value = 0;
            }
            else{
              $scope.newGoal.value = parseFloat(input.toFixed(2));  
            }
          } 
        };
        $scope.saveTipoCambio = function(val){
          if(val){
            console.log('tipo cambio',val)
            $scope.changeTypeCurrency(val)
            dataFactory.post('configkbi/', {'tipocambio': parseFloat(val).toFixed(2)});
          } 
        };
        $scope.validateGasto = function(input){
          if(input){
            for(var i = 0; i < $scope.concepts.length; i++){
              if($scope.concepts[i].cantidad != ""){
                if(parseFloat($scope.concepts[i].cantidad) < 0){
                  $scope.concepts[i].cantidad = 0;
                }
                else{
                  $scope.concepts[i].cantidad = parseFloat($scope.concepts[i].cantidad.toFixed(2));  
                }
              }
            } 
          }
        };

        $scope.convertDateMain = function(inputFormat) {
          function pad(s) { return (s < 10) ? '0' + s : s; }
          var d = new Date(inputFormat);
          var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');                
          return date;
        }
        $scope.deleteConcept = function(item, index){
          SweetAlert.swal({
              title: "¿Está seguro?",
              text: "Eliminar " + item.concept + ". Los cambios no podrán revertirse",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Si",
              cancelButtonText: "No",
              closeOnConfirm: true,
              closeOnCancel: false
            },
            function(isConfirm){
              if (isConfirm) {
                $http.delete(item.url)
                .then(function(request){
                      SweetAlert.swal("Listo", "El concepto ha sido eliminado", "success");
                      getInfoKBI();
                    } 
                )
                .catch(function(e) {
                  console.log('error - catch', e);
                });
              } else {
                SweetAlert.swal("Cancelado", "El concepto no se ha eliminado.", "info");
              }
            });
        };

        $scope.changeTypeCurrency = function(valur){
          $scope.tipo_cambio = valur;
          getInfoKBI()

        }
        $scope.verpor = function(valur){
          $scope.show_for = valur;
        }
        /* --------- Termina KBI ---------- */

        $scope.exportDataExcel = function (){          
          $scope.datafil = {
            show_currency_usd: $scope.show_currency_usd ? $scope.show_currency_usd : false,
            show_currency_mxn: $scope.show_currency_mxn ?  $scope.show_currency_mxn : false,
            show_for: $scope.show_for,
            tipo_cambio: $scope.tipo_cambio
          }
          var modalInstance = $uibModal.open({
            templateUrl: 'app/kbi/kbi.modal.html',
            controller: KbiModalCtrl,
            controllerAs: 'vmm',
            size: 'sm',
            resolve: {
              filters: function() {
                return $scope.data_filter;

              },
              datafil: function() {
                return $scope.datafil;
              },
              configSubramos: function(){
                $scope.configSubr = {
                  month_old: $scope.month_old,
                  year_old: $scope.year_old,
                  month_new : $scope.month_new,
                  year_new : $scope.year_new
                }
                return $scope.configSubr;
              },
            },
            backdrop: 'static', /* this prevent user interaction with the background */ 
            keyboard: false
          });
          modalInstance.result.then(function(receipt) {
          });
        }

        function KbiModalCtrl($scope, dataFactory, $uibModalInstance, filters, datafil,configSubramos) {
          var vmm = this;

          $scope.financiero = true;
          $scope.produccion = true;
          $scope.cotizaciones = true;
          $scope.gastos = true;



          $scope.downloadReport = function(){
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            var obj = {
              financiero: $scope.financiero,
              produccion: $scope.produccion,
              cotizaciones: $scope.cotizaciones,
              gastos: $scope.gastos,              
              since_year: filters.since_year,
              until_year: filters.until_year,
              since_day: filters.since_day,
              until_day: filters.until_day,
              currency: datafil.show_currency_usd ? 'Dolar' : 'Peso',
              month_old: $scope.month_old ? $scope.month_old : $scope.month_old,
              year_old: $scope.year_old ? $scope.year_old : $scope.year_old,
              year_new: $scope.month_new ? $scope.month_new : $scope.month_new,
              show_for: datafil.show_for ? datafil.show_for : 1,
              month: configSubramos.month_old,
              year: configSubramos.year_old,
              month_c: configSubramos.month_new,
              year_c: configSubramos.year_new,
              tipocambio:filters.tipocambio

            }
            dataFactory.post('service-kbi-excel', obj)
            .then(function success(response) {
              if (response.status == 200){
                var socket = io.connect(url.REPORT_SERVICE_NODE_SOCKET);
                //var socket = io.connect("http://127.0.0.1:8080");
                socket.emit('subscribe', response.data);
                socket.on(response.data, function(url){
                  l.stop();
                  var notificacion = {
                    'title': 'El reporte solicitado ha sido generado', 
                    'description': url, 
                    'model': 26,
                    'id_reference':0
                  }
                  dataFactory.post('notificaciones/', notificacion)
                  .then(function success(response) {                
                    SweetAlert.swal({
                      title: 'El reporte está listo para descargar',
                      icon: 'success',
                      text: 'Encuentra la liga de descarga en la sección de notificaciones',
                      timer: 20000
                    });
                    socket.disconnect();
                    $uibModalInstance.dismiss('cancel');
                  }).catch(function(err) {
                    socket.disconnect();
                  })
                });
                toaster.info('Generando...', 'El archivo se está generando, en unos momentos podrá descargarlo, puedes seguir navegando, solo no recargues la página');
              } else {
                l.stop();
                toaster.error('Aviso', 'Ha ocurrido un error, intente nuevamente');
              }
            }).catch(function(error) {
              l.stop();
              toaster.error('Aviso', 'Ha ocurrido un error, intente nuevamente');
            })
          }

          $scope.cancel = function() {
            if ($uibModalInstance) {
              $uibModalInstance.dismiss('cancel');
            }
          };
        }
    }
})();
