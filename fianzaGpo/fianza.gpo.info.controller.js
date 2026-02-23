(function() {
  'use strict';

  angular.module('inspinia')
      .controller('FianzasInfoColectividadesCtrl', FianzasInfoColectividadesCtrl);

  FianzasInfoColectividadesCtrl.$inject = ['$sessionStorage', '$scope', 'FileUploader', '$stateParams', '$http', 'url', 'datesFactory',
                                       '$state', 'SweetAlert', 'MESSAGES', 'dataFactory', '$uibModal', '$timeout','$parse','$rootScope',
                                       'appStates', '$localStorage'];

  function FianzasInfoColectividadesCtrl($sessionStorage, $scope, FileUploader, $stateParams, $http, url, datesFactory, $state, 
                                     SweetAlert, MESSAGES, dataFactory, $uibModal, $timeout, $parse, $rootScope, appStates, $localStorage) {

    /* Información de usuario */
    var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
   
    var vm = this;

    $scope.surety = {};
    $scope.show_surety = true;
    $scope.show_categorie = false;
    $scope.show_certificate = false;

    $scope.certificate_table = true;
    $scope.certificate_info = false;
    $scope.certificate_edit = false;
    $scope.certificate_mass = false;

    $scope.show_notes = false;
    $scope.show_endorsement = false;

    $scope.categorySelected = {
      id: null,
      value: 0,
      category: 0,
      search: '',
      is_category: 0,
      certificates: [],
      config: {}
    };

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
    vm.createRecordatorio = createRecordatorio;
    vm.showRecordatorios = showRecordatorios;

    vm.isCollapsed = false;

    // Function to toggle the collapse state
    vm.toggleCollapse = function() {
      vm.isCollapsed = !vm.isCollapsed;
    };
    vm.accesos = $sessionStorage.permisos;
    if(vm.accesos){
      vm.accesos.forEach(function(perm){
        if(perm.model_name == 'Fianzas'){

          vm.acceso_fianzas = perm
          vm.acceso_fianzas.permissions.forEach(function(acc){
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
            }else if (acc.permission_name == 'Cancelar fianzas') {
              if (acc.checked == true) {
                vm.acceso_canc_fia = true
              }else{
                vm.acceso_canc_fia = false
              }
            }else if (acc.permission_name == 'Eliminar fianzas') {
              if (acc.checked == true) {
                vm.acceso_elim_fia = true
              }else{
                vm.acceso_elim_fia = false
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
        }else if(perm.model_name == 'Cobranza'){
          vm.acceso_cobranza = perm
          vm.acceso_cobranza.permissions.forEach(function(acc){
            if (acc.permission_name == 'Eliminar recibos') {
              if (acc.checked == true) {
                vm.permiso_delete_cobranza = true
              }else{
                vm.permiso_delete_cobranza = false
              }
            }
            if (acc.permission_name == 'No permitir editar recibos Pagados/Liquidados') {
              if (acc.checked == true) {
                vm.acceso_pl_cob = true //no se editan
              }else{
                vm.acceso_pl_cob = false//se pueden editar pagados-liquidados
              }
            }
          })
        }else if (perm.model_name == 'Correos electronicos') {
          vm.acceso_correo = perm;
          vm.acceso_correo.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Correos') {
              if (acc.checked == true) {
                vm.permiso_correo = true
              }else{
                vm.permiso_correo = false
              }
            }
          })
        }
      })
    }

    activate();
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

    $scope.changeFechaEmisionF = function(){
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       delete item['poliza_many'];
      });
      var data_alert = {
        title: 'Fecha Emisión factura',
        text:'Escribe el formato de fecha como DD/MM/AAAA.',
        type: "input",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true
      }
      SweetAlert.swal(data_alert, function (inputValue) {

        if(inputValue) {
          $http.patch($scope.surety.url, {beneficiaries_poliza_many: $scope.benmany,status: $scope.surety.status,date_emision_factura: datesFactory.toDate(inputValue),fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
          .then(function(response){       
            SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
            activate();
          });
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " actualizó la fecha emisión de factura."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      });
    };
    $scope.changeFolioF = function(){      
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      var data_alert = {
        title: 'Folio factura',
        text:'Escribe el folio de la factura.',
        type: "input",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true
      }
      SweetAlert.swal(data_alert, function (inputValue) {

        if(inputValue) {
          $http.patch($scope.surety.url, {beneficiaries_poliza_many: $scope.benmany,status: $scope.surety.status,folio_factura: inputValue,fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
          .then(function(response){       
            SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
            activate();
          });
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " actualizó el folio de la factura."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      });
    };

    $scope.changeMaquila = function(){
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      var data_alert = {
        title: 'Maquila',
        text:'Escribe el monto de la Maquila',
        type: "input",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true
      }
      SweetAlert.swal(data_alert, function (inputValue) {

        if(inputValue) {
          $http.patch($scope.surety.url, {beneficiaries_poliza_many:$scope.benmany,status: $scope.surety.status,maquila: parseFloat(inputValue).toFixed(2),fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
          .then(function(response){       
            SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
            activate();
          });
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " actualizó el monto de la maquila."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      });
    };
    $scope.changeTipoC = function(){
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      var data_alert = {
        title: 'Tipo de Cambio(captura)',
        text:'Escribe el monto de la Tipo de Cambio(captura)',
        type: "input",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true
      }
      SweetAlert.swal(data_alert, function (inputValue) {

        if(inputValue) {
          $http.patch($scope.surety.url, {beneficiaries_poliza_many:$scope.benmany,status: $scope.surety.status,exchange_rate: parseFloat(inputValue).toFixed(2),fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
          .then(function(response){       
            SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
            activate();
          });
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " actualizó el monto de la Tipo de Cambio(captura)."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      });
    };
    $scope.openMonth = false;
    $scope.changeMesF = function(){
      $scope.openMonth = true;
    };
    $scope.changeMesF1= function(mes){     
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      $scope.openMonth = false;
      $http.patch($scope.surety.url, {beneficiaries_poliza_many: $scope.benmany,status: $scope.surety.status,month_factura: mes,fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
      .then(function(response){       
        SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
        activate();
      });
      var paramsRec = {
        'model': 18,
        'event': "PATCH",
        'associated_id': $scope.surety.id,
        'identifier': " actualizó el mes emisión de la factura."
      }
      dataFactory.post('send-log/', paramsRec).then(function success(response){

      });
    }

    if ('endorsement_surety' in $localStorage){}
    else{
      $localStorage['endorsement_surety'] = {};
    }

    $scope.goEndorsement = function(name, route, endorsement){
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

      $localStorage.endorsement_surety.id = endorsement;
      var params = { 'endosoId': endorsement.id }
      $state.go($scope.route_for_new_tab, params);
    }

    $scope.show_section = function(value){
      switch(value){
        case 1:
          $scope.show_surety = true;
          $scope.show_categorie = false;
          $scope.show_certificate = false;
          break;
        case 2:
          $scope.show_surety = false;
          $scope.show_categorie = true;
          $scope.show_certificate = false;
          break;
        case 3:
          $scope.show_surety = false;
          $scope.show_categorie = false;
          $scope.show_certificate = true;
          break;
        default:
          $scope.show_surety = true;
          $scope.show_categorie = false;
          $scope.show_certificate = false;
      }
    };  
    $scope.years=[]
    var actualYear = new Date().getFullYear();
    var oldYear = actualYear - 80;
    for (var i = actualYear + 10; i >= oldYear; i--) {
      $scope.years.push(i);
    }      

    $scope.changeFechaComision = function(){
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      var data_alert = {
        title: 'Fecha de Pago de Comisión',
        text:'Escribe el formato de fecha como DD/MM/AAAA.',
        type: "input",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true
      }
      SweetAlert.swal(data_alert, function (inputValue) {

        if(inputValue) {
          $http.patch($scope.surety.url, {beneficiaries_poliza_many: $scope.benmany,status: $scope.surety.status,fecha_pago_comision: datesFactory.toDate(inputValue),fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
          .then(function(response){       
            SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
            activate();
          });
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " actualizó la fecha de pago de comisión."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      });
    };
    $scope.changeFechaMaquila = function(){
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      var data_alert = {
        title: 'Fecha Maquila',
        text:'Escribe el formato de fecha como DD/MM/AAAA.',
        type: "input",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true
      }
      SweetAlert.swal(data_alert, function (inputValue) {

        if(inputValue) {
          $http.patch($scope.surety.url, {beneficiaries_poliza_many: $scope.benmany,status: $scope.surety.status,date_maquila: datesFactory.toDate(inputValue),fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
          .then(function(response){       
            SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
            activate();
          });
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " actualizó la fecha maquila de fianza."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      });
    };
    $scope.changeBono = function(){
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      var data_alert = {
        title: 'Bono Afianzadora',
        text:'Escribe el monto del Bono',
        type: "input",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true
      }
      SweetAlert.swal(data_alert, function (inputValue) {

        if(inputValue) {
          $http.patch($scope.surety.url, {beneficiaries_poliza_many: $scope.benmany,status: $scope.surety.status,bono_variable: parseFloat(inputValue).toFixed(2),fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
          .then(function(response){       
            SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
            activate();
          });
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " actualizó bono de fianza."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      });
    };
    $scope.changeFechaBono = function(){
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      var data_alert = {
        title: 'Fecha de Bono',
        text:'Escribe en formato de fecha como DD/MM/AAAA.',
        type: "input",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true
      }
      SweetAlert.swal(data_alert, function (inputValue) {

        if(inputValue) {
          $http.patch($scope.surety.url, {beneficiaries_poliza_many: $scope.benmany,status: $scope.surety.status,date_bono: datesFactory.toDate(inputValue),fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
          .then(function(response){       
            SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
            activate();
          });
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " actualizó la fecha de bono de fianza."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      });
    };
    $scope.openYear = false;
    $scope.changYearF = function(){
      $scope.openYear = true;
    };
    $scope.changeFechaBono = function(){
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      var data_alert = {
        title: 'Fecha de Bono',
        text:'Escribe el formato de fecha como DD/MM/AAAA.',
        type: "input",
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true
      }
      SweetAlert.swal(data_alert, function (inputValue) {

        if(inputValue) {
          $http.patch($scope.surety.url, {beneficiaries_poliza_many: $scope.benmany,status: $scope.surety.status,date_bono: datesFactory.toDate(inputValue),fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
          .then(function(response){       
            SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
            activate();
          });
          var paramsRec = {
            'model': 13,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " actualizó la fecha de bono de fianza."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
        }
      });
    };
    $scope.changeYearF1= function(year){
      $scope.benmany = $scope.surety.beneficiaries_poliza_many;
      $scope.benmany.forEach(function(item) {
       try{delete item['poliza_many'];}catch(e){}
      });
      $scope.openYear = false;
      $http.patch($scope.surety.url, {beneficiaries_poliza_many: $scope.benmany,status: $scope.surety.status, year_factura: year,fecha_cancelacion: $scope.surety.fecha_cancelacion,monto_cancelacion: $scope.surety.monto_cancelacion})
      .then(function(response){       
        SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
        activate();
      });
      var paramsRec = {
        'model': 18,
        'event': "PATCH",
        'associated_id': $scope.surety.id,
        'identifier': " actualizó el año emisión de la factura."
      }
      dataFactory.post('send-log/', paramsRec).then(function success(response){

      });
    }
    function activate(){
      $http.post(url.IP + 'information_collectivesurety/', {caratula: $stateParams.polizaId})
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          $scope.surety = response.data.data.collectivitySurety;
          $scope.calculatePrimas($scope.surety.recibos_poliza);
          $scope.showFiles($scope.surety);
          $scope.getComments();
          $scope.categories = response.data.data.childs;
          $scope.categories.forEach(function(item){
            $scope.showFiles(item);
          });
          $scope.getAllCertificate();

          if($scope.surety.programa_de_proveedores_contractor){
            if($scope.surety.programa_de_proveedores_contractor){
              $scope.url_programa = $scope.surety.programa_de_proveedores_contractor;
            }
            $http.get($scope.url_programa)
            .then(function(request) {
              $scope.programa = angular.copy(request.data)
            });
          }

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
                $scope.policy_history.push(old.base_policy);
              } else if(old.new_policy){
                $scope.policy_history.push(old.new_policy);
              }
            })
          })
          .catch(function (e) {
            console.log('error - caratula - catch', e);
          });

          $scope.endorsements = [];
          $scope.receipts_endorsement = [];
          $scope.notes = [];

          $http({
            method: 'GET',
            url: url.IP + 'view-endosos',
            params: {
              policy: $scope.surety.id
            }
          })
          .then(function success(response) {
            $scope.endorsements = response.data.endosos;
            $scope.endorsements.forEach(function(endoso){
              if(endoso.endorsement_receipt[0]){
                $scope.receipts_endorsement.push(endoso.endorsement_receipt[0]);
                if(endoso.endorsement_receipt[0].receipt_type == 3){
                  $scope.notes.push(endoso.endorsement_receipt[0]);
                }
              }
            });
          })
          .catch(function(e){
            console.log('error', e);
          });
        }
      })
      .catch(function (e) {
        console.log('error - caratula - catch', e);
      });
    };

    $scope.openModal = function(task) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/tasks/task.modal.html',
        controller: 'TareasModalCtrl',
        size: 'lg',
        resolve: {
        task: function() {
          return task;
        },
        data: function() {
          return null;
        },
        associated: function() {
          return null;
        },
        receipt: function() {
          return null;
        },
        route: function() {
          return null;
        },
        modelo: function() {
          return null;
        }
      }
     });
     modalInstance.result
      .then(function (response) {
        activate()
      }, function () {
       console.info('modal closed');
     });
    }
    $scope.status = function(parValue){
      switch(parValue){
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
        case 14:
          return 'Vigente';
          break;
        case 17:
          return 'Anulada';
          break;
        case 24:
          return 'Preanulada';
          break;
        case 0:
          return 'Eliminada';
          break;
        default:
          return 'Vigente';
      }
    };
    $scope.monthEmision = function(mf){
      switch(mf){
        case 0: 
          return '';
          break;
        case 1: 
          return 'Enero';
          break;
        case 2: 
          return 'Febrero';
          break;
        case 3: 
          return 'Marzo';
          break;
        case 4: 
          return 'Abril';
          break;
        case 5: 
          return 'Mayo';
          break;
        case 6: 
          return 'Junio';
          break;
        case 7: 
          return 'Julio';
          break;
        case 8: 
          return 'Agosto';
          break;
        case 9: 
          return 'Septiembre';
          break;
        case 10: 
          return 'Octubre';
          break;
        case 11: 
          return 'Noviembre';
          break;
        case 12: 
          return 'Diciembre';
          break;
        default: 
          return '';
      }
    };

    $scope.concept = function(parConcept){
      switch(parConcept){
        case 34: 
          return 'CAMBIOS EN EL BENEFICIARIO';
          break;
        case 53: 
          return 'DETALLE DE GARANTÍA';
          break;
        case 54: 
          return 'PRORROGA DE VIGENCIA';
          break;
        case 55: 
          return 'ANUENCIA';
          break;
        case 24: 
          return 'ALTA DE CERTIFICADOS';
          break;
        case 25: 
          return 'BAJA DE CERTIFICADOS';
          break;
        case 56: 
          return 'CORRECCIÓN DE CERTIFICADOS';
          break;
        case 4: 
          return 'OTRO';
          break;
        default: 
          return 'OTRO';
      }
    };

    $scope.changedomiciliado = function(){
      SweetAlert.swal({
        title: '¿Domiciliar fianza?',
        text: "Este cambio se aplicará a todos los recibos, ¿desea domiciliar?",
        type: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, domiciliar",
        cancelButtonText: "No, no domiciliar",
        closeOnConfirm: false
      },
      function(isConfirm){
        if(isConfirm){
          $scope.surety.recibos_poliza.forEach(function(receipt){
            $http.patch(receipt.url, { is_cat: true })
            .then(function(response){       
              SweetAlert.swal('¡Hecho!', 'Recibo(s) actualizado(s)', 'success');
              activate();
            });
          })
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.suretyA.id,
            'identifier': " cambio el estatus del cargo Automático(Domiciliado) a SI de los recibos."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }else{
          $scope.surety.recibos_poliza.forEach(function(receipt){
            $http.patch(receipt.url, { is_cat: false })
            .then(function(response){          
              SweetAlert.swal('¡Hecho!', 'Recibo(s) actualizado(s)', 'success');
              activate();
            });
          })
          var paramsRec = {
            'model': 18,
            'event': "PATCH",
            'associated_id': $scope.surety.id,
            'identifier': " cambio el estatus del cargo Automático(Domiciliado) a NO de los recibos."
          }
          dataFactory.post('send-log/', paramsRec).then(function success(response){

          });
        }
      });
    };
    function createRecordatorio(registroSelected, tipo) {
      var insurance = registroSelected
      console.log('dddddd',registroSelected)
      var modalInstance = $uibModal.open({
        templateUrl: 'app/recordatorios/desde-registro/desderegistro.modal.html',
        controller: 'RecordatorioRegistroCtrl',
        size: 'lg',
        resolve: {
          poliza: function() {
            return registroSelected;
          },
          tipoRegistro: function() {
            return tipo;
          },
          from: function(){
            return null;
          },
          parent: function(){
            return $scope.surety;
          }
        },
      backdrop: 'static', /* this prevent user interaction with the background */
      keyboard: false
      });
    }   
    $scope.goToRecordatorio = function (rec) {
      if (rec.recordatorio) {
        $scope.name_for_new_tab = 'Recordatorio desde registro';
        $scope.route_for_new_tab = 'recordatorios.desde_registro_show';
        var params = {id: rec.recordatorio.id}
      }
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
          href: $state.href($scope.route_for_new_tab,params),
        }
      }
      $localStorage.tab_states = appStates.states;
      $state.go($scope.route_for_new_tab, params); 
    }     
    function showRecordatorios() {
      vm.recordatoriosFlag = true;
    }
    $scope.getLog = function(){
      dataFactory.get('get-specific-log', {'model': 13, 'associated_id': $scope.surety.id})
      .then(function success(response){
        var modalInstance = $uibModal.open({
          templateUrl: 'app/cobranzas/log.modal.html',
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

    // $scope.cancelFianza = function(){
    //   SweetAlert.swal({
    //     title: "Cancelar",
    //     text: "Se cancelará la fianza colectiva, ¿Está seguro?",
    //     type: "warning",
    //     showCancelButton: true,
    //     confirmButtonColor: "#DD6B55",
    //     confirmButtonText: "¡Si!",
    //     cancelButtonText: "No",
    //     closeOnConfirm: true,
    //     closeOnCancel: false
    //   },
    //   function(isConfirm){
    //     if (isConfirm) {
    //       $scope.beneficiaries = [];
    //       $scope.surety.beneficiaries_poliza_many.forEach(function(item, index){
    //         var beneficiary = {
    //           type_person: item.type_person,
    //           first_name: item.first_name,
    //           last_name: item.last_name,
    //           second_last_name: item.second_last_name,
    //           j_name: item.j_name,
    //           full_name: '',
    //           rfc: item.rfc,
    //           email: item.email,
    //           phone_number: item.phone_number,
    //           id: item.id,
    //           url: item.url
    //         }
    //         $scope.beneficiaries.push(beneficiary);

    //         if((index + 1) == $scope.surety.beneficiaries_poliza_many.length){
    //           var data = {
    //             'status': 11,
    //             'beneficiaries_poliza_many': $scope.beneficiaries
    //           }
    //           $http.patch($scope.surety.url, data)
    //           .then(function(response){
    //             if(response.status == 200 || response.status == 201){
    //               var paramsE = {
    //                 'model': 13,
    //                 'event': "PATCH",
    //                 'associated_id': $scope.surety.id,
    //                 'identifier': " canceló la fianza colectiva."
    //               }
    //               dataFactory.post('send-log', paramsE);
    //               activate();
    //             }
    //           })
    //           .catch(function(e){
    //             console.log('e', e);
    //           });
    //         }
    //       });
    //     }
    //   });
    // };

    $scope.cancelFianza = function(suret){
      $rootScope.suretyInfo = suret;
      var modalInstance = $uibModal.open({
        templateUrl: 'app/fianzas/cancel.fianzas.html',
        controller: FianzaCancelModalCtrl,
        controllerAs: 'vmm',
        size: 'md',
        resolve: {
          suretyInfo: function(){
            return suret;
          },
          endosos: function () {
            return $scope.endorsements;
          }
        },
        backdrop: 'static',
        keyboard: false
      });
    }

    function FianzaCancelModalCtrl(url, $http, $rootScope, suretyInfo, $scope, $uibModalInstance, datesFactory,endosos){
      var vmm = this;
      vmm.surety = {
        fecha_cancelacion: datesFactory.convertDate(new Date()),
        monto_cancelacion: 0,
        status: 11
      }

      $scope.cancelSurety = function(){
        $scope.beneficiaries = [];
          suretyInfo.beneficiaries_poliza_many.forEach(function(item, index){
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
              url: item.url
            }
            $scope.beneficiaries.push(beneficiary);

            if((index + 1) == suretyInfo.beneficiaries_poliza_many.length){
              var data = {
                'fecha_cancelacion': datesFactory.toDate(vmm.surety.fecha_cancelacion),
                'monto_cancelacion': vmm.surety.monto_cancelacion,
                'status': 11,
                'beneficiaries_poliza_many': $scope.beneficiaries
              }
              $http.patch(suretyInfo.url, data)
              .then(function(response){
                if(response.status == 200 || response.status == 201){
                  if(endosos){
                    endosos.forEach(function(end) {
                      if(end.status ==2){
                        $http.patch(end.url,{status:4})
                        .then(function(dataend) {
                          console.log('patch endo reg to cancel',dataend)
                        })
                      }
                    })
                  }
                  var paramsE = {
                    'model': 13,
                    'event': "PATCH",
                    'associated_id': suretyInfo.id,
                    'identifier': " canceló la fianza colectiva."
                  }
                  dataFactory.post('send-log', paramsE);
                  activate();
                  $uibModalInstance.dismiss('cancel');
                  swal("¡Listo!", "Se ha cancelado definitivamente la Fianza", "success");
                }
              })
              .catch(function(e){
                console.log('e', e);
              });
            }
          });
      }


      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      };
    }

    $scope.deleteFianza = function(){
      SweetAlert.swal({
        title: "Eliminar Fianza",
        text: "Se eliminarán también el recibo, los cambios no podrán revertirse. ¿Está seguro?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si",
        cancelButtonText: "No",
        closeOnConfirm: true,
        closeOnCancel: false
      },
      function(isConfirm){
        if(isConfirm){
          var data = {
            'status': 0,
            'beneficiaries_poliza_many': $scope.surety.beneficiaries_poliza_many ? $scope.surety.beneficiaries_poliza_many : $scope.surety.beneficiaries_poliza
          }
          $http.patch($scope.surety.url, data)
          .then(function(response){
            if(response.status == 200){
              SweetAlert.swal("¡Listo!", "La fianza fue eliminada exitosamente.", "success");
              $state.go('fianzas.list');
            }
          })
          .catch(function(e){
            console.log('error', e);
          });
        }else{
          SweetAlert.swal("Cancelado", "La fianza no se ha eliminado.", "error");
        }
      });
    };

    $scope.showNotes = function(value){
      $scope.show_notes = value;
    };

    $scope.showEndorsement = function(value){
      $scope.show_endorsement = value;
    };

    $scope.statusReceipt = function(parValue){
      switch(parValue){
        case 1:
          return 'Pagado';
          break;
        case 2:
          return 'Cancelado';
          break;
        case 3:
          return 'Prorrogado';
          break;
        case 4:
          return 'Pendiente de Pago';
          break;
        case 5:
          return 'Liquidado';
          break;
        case 6:
          return 'Conciliado';
          break;
        case 7:
          return 'Cerrado';
          break;
        case 8:
          return 'Precancelado';
          break;
        case 9:
          return 'Pago Parcial';
          break;
        case 10:
          return 'Anulado';
          break;
        case 11:
          return 'Preanulado';
          break;
        default:
          return parValue;
      }
    };

    $scope.changeFechaCancelacion = function(){
        var data_alert = {
          title: 'Monto de cancelación',
          text:'Escribe el formato de fecha como DD/MM/AAAA.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
        SweetAlert.swal(data_alert, function (inputValue) {

          if(inputValue) {
            $http.patch($scope.surety.url, {monto_cancelacion: $scope.surety.monto_cancelacion, fecha_cancelacion: datesFactory.toDate(inputValue), status: 11})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': $scope.surety.id,
              'identifier': " actualizó la fecha de cancelación."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };

      $scope.changeMontoCancelacion = function(){
        var data_alert = {
          title: 'Monto de cancelación',
          text:'Este cambio se aplicará en la fianza.',
          type: "input",
          confirmButtonText: "Guardar",
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }

        SweetAlert.swal(data_alert, function (inputValue) {
          if(inputValue) {
            $http.patch($scope.surety.url, {monto_cancelacion: parseFloat(inputValue).toFixed(2), fecha_cancelacion: $scope.surety.fecha_cancelacion, status: 11})
            .then(function(response){       
              SweetAlert.swal('¡Listo!', 'Fianza actualizada exitosamente.', 'success');
              activate();
            });
            var paramsRec = {
              'model': 13,
              'event': "PATCH",
              'associated_id': $scope.surety.id,
              'identifier': " actualizó el monto de cancelación."
            }
            dataFactory.post('send-log/', paramsRec).then(function success(response){

            });
          }else{
            SweetAlert.swal('Cancelado', 'Se ha cancelado la acción.', 'info');
          }
        });
      };

    $scope.calculatePrimas = function(receipts){
      $scope.total_prima = 0;
      $scope.total_rpf = 0;
      $scope.total_derecho = 0;
      $scope.total_iva = 0;
      $scope.total_total = 0;
      $scope.total_comision = 0;
      for (var i = 0; i < receipts.length; i++){
        if(receipts[i].receipt_type == 1){
          $scope.total_prima = parseFloat($scope.total_prima) + parseFloat(receipts[i].prima_neta);
          $scope.total_rpf = parseFloat($scope.total_rpf) + parseFloat(receipts[i].rpf);
          $scope.total_derecho = parseFloat($scope.total_derecho) + parseFloat(receipts[i].derecho);
          $scope.total_iva = parseFloat($scope.total_iva) + parseFloat(receipts[i].iva);
          $scope.total_total = parseFloat($scope.total_total) + parseFloat(receipts[i].prima_total);
          $scope.total_comision = parseFloat($scope.total_comision) + parseFloat(receipts[i].comision);
        }
      }
    };

    $scope.deliveredReceipt = function(receipt){
      SweetAlert.swal({
        title: 'Entregado',
        text: "Este recibo se marcara como entregado, ¿Estás seguro?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si",
        cancelButtonText: "No",
        closeOnConfirm: false
      },
      function(isConfirm){
        if(isConfirm){
          $http({
            method: 'PATCH',
            url: receipt.url,
            data: {
              delivered: true
            }
          }).then(function success(response){
            if(response.status == 200){
              var params = {
                'model': 4,
                'event': "PATCH",
                'associated_id': receipt.id,
                'identifier': ' actualizó el recibo a Entregado.'
              }
              dataFactory.post('send-log/', params).then(function success(response){
                
              });
              SweetAlert.swal("¡Listo!", "Recibo actualizado exitosamente.", "success");
              activate();
            }
          })
        }
      });
    };

    $scope.addEmailsConfirmPolicy = function(insurance, natural, juridical,contractor){
      // if(natural){
      //   insurance.contratante = natural;
      // }else if(juridical){
      //   insurance.contratante = juridical;
      // }
      insurance.contratante = contractor;
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/cobranzas/add.emails.reminder_pay.html',
        controller: 'CobranzasCtrl',
        controllerAs: 'vm',
        size: 'lg',
        resolve: {
          insurance: function() {
            return insurance;
          },
          valueReceipt: function() {
            return insurance;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });
      modalInstance.result.then(function(receipt) {

      });
    };

    $scope.changeStatusModal = function(receipt, fianza){
      receipt.poliza = fianza.fianza_number;
      fianza.poliza = fianza.fianza_number
      // if(fianza.natural){
      //   receipt.contratante = fianza.natural;
      // }else if (fianza.juridical){
      //   receipt.contratante = fianza.juridical;
      // }
      receipt.contratante = fianza.contractor;
      var index = $scope.surety.recibos_poliza.indexOf(receipt);
      var modalInstance = $uibModal.open({ 
        templateUrl: 'app/cobranzas/cobranzas.modal.html',
        controller: 'CobranzasModal',
        size: 'lg',
        resolve: {
          receipt: function(){
            return receipt;
          },
            insurance: function(){
              return fianza;
            },
          from: function(){
            return null;
          },bono: function(){
            return null;
          }
        },
          backdrop: 'static',
          keyboard: false
      });
      modalInstance.result.then(function(receipt){
        activate();
      });
    };

    $scope.editReceipt = function(receipt, index){
      var texto = "Esta es una alternativa de emergencia, No se validarán las primas y ni las fechas al editar este recibo. ¿Deseas continuar?"
      if (vm.acceso_pl_cob == false && (receipt.status ==1 || receipt.status == 'Pagado')) {
        var texto = "Esta es una alternativa de emergencia, No se validarán las primas y ni las fechas al editar este recibo.  \nEstas editando un recibo PAGADO, para posteriores casos te recomendamos revisar bien las primas antes del proceso de pago/liquidación, ya que este tipo de acciones no son recomendables.\n ¿Deseas continuar?"
      }else if (vm.acceso_pl_cob == false && (receipt.status ==5 || receipt.status == 'Liquidado')){
        var texto = "Esta es una alternativa de emergencia, No se validarán las primas y ni las fechas al editar este recibo.  \nEstas editando un recibo LIQUIDADO, para posteriores casos te recomendamos revisar bien las primas antes del proceso de pago/liquidación, ya que este tipo de acciones no son recomendables.\n ¿Deseas continuar?"
      }
      if((receipt.status == 4 || receipt.status == 'Pendiente de pago') || (vm.acceso_pl_cob == false && ((receipt.status ==5 || receipt.status == 'Liquidado') || (receipt.status ==1 || receipt.status == 'Pagado')))){
        SweetAlert.swal({
          title: "Advertencia",
          text: texto,
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Si, estoy seguro.",
          cancelButtonText: "Cancelar",
          closeOnConfirm: true,
          closeOnCancel: false
        },
        function(isConfirm){
          if(isConfirm){
            var modalInstance = $uibModal.open({
              templateUrl: 'app/fianzas/receipt-modal.html',
              controller: EditReceiptModalCtrl,
              controllerAs: 'rec',
              size: 'lg',
              resolve: {
                recibo: function(){
                  return receipt;
                },
                index: function(){
                  return index;
                },
                endoso: function(){
                  return $scope.surety;
                },
                acceso_pl_cob: function(){
                  return vm.acceso_pl_cob;
                }
              },
              backdrop: 'static',
              keyboard: false
            });
          }else{
            SweetAlert.swal("Cancelado", "El recibo no ha sido actualizado.", "error");
          }
        });
      }
      else{
        SweetAlert.swal("Advertencia", "El recibo no se puede editar porque no está pendiente de pago.", "warning");
      }
    };

    function EditReceiptModalCtrl(url,$http,$rootScope,recibo,index,endoso,$scope,$uibModalInstance,acceso_pl_cob){
      var rec = this;
      rec.recibo = recibo;
      if(recibo.fecha_inicio.indexOf('-') != -1){
        rec.recibo.fecha_inicio = convertDate(recibo.fecha_inicio);
      }
      if(recibo.fecha_fin.indexOf('-') != -1){
        rec.recibo.fecha_fin = convertDate(recibo.fecha_fin);
      }
      if(recibo.vencimiento.indexOf('-') != -1){
        rec.recibo.vencimiento = convertDate(recibo.vencimiento);
      }

      function convertDate(inputFormat, indicator) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        if(indicator){
          var date = [pad(d.getDate()+1), pad(d.getMonth()+1), d.getFullYear()].join('/');
        } else {
          var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
        }

        return date;
      };

      function toDate(dateStr) {
        if(dateStr){
          var dateString = dateStr;
          var dateParts = dateString.split("/");
          var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
          return dateObject;
        }
      };

      $scope.validateDecimal = function(form){
        form = String(form).replace(/[A-Za-z]/g, '');
        form = String(form).replace(/,/g, '');
        return form;
      };

      $scope.changePrimas = function(data){
        rec.recibo.sub_total = (parseFloat(data.prima_neta) + parseFloat(data.rpf) + parseFloat(data.derecho)).toFixed(2);
        rec.recibo.prima_total = (parseFloat(rec.recibo.sub_total) + parseFloat(data.iva)).toFixed(2);
      };

      $scope.saveReceipt = function(receipt){
        if(process(rec.recibo.fecha_inicio) < process(convertDate(endoso.start_of_validity))){
          SweetAlert.swal('Error', 'La fecha de inicio del recibo no puede ser menor a la fecha de inicio de la póliza.', 'error');
          return;
        }

        function process(date){
          var parts = date.split("/");
          var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
          return date.getTime();
        }

        var obj = {
          fecha_inicio: new Date(toDate(receipt.fecha_inicio)),
          fecha_fin: new Date(toDate(receipt.fecha_fin)),
          prima_neta: receipt.prima_neta,
          rpf: receipt.rpf,
          derecho: receipt.derecho,
          iva: receipt.iva,
          prima_total: receipt.prima_total,
          comision: receipt.comision,
          vencimiento: new Date(toDate(receipt.vencimiento)),
          delivered: receipt.delivered
        }

        $http.patch(receipt.url, obj)
        .then(function(response){
          if(response.status == 200){
            var data_primas = {
              p_neta: receipt.prima_neta,
              rpf: receipt.rpf,
              derecho: receipt.derecho,
              sub_total: receipt.sub_total,
              iva: receipt.iva,
              p_total: receipt.prima_total,
              comision: receipt.comision,
              comision_percent: 0
            }
            data_primas.comision_percent = ((parseFloat(receipt.comision) * 100) / parseFloat(data_primas.p_neta)).toFixed(2);
            $http.patch(endoso.url, data_primas)
            .then(function(response){
              
            })
            .catch(function(e){
              console.log('error', e);
            });
            var texto_log = ''
            if ((receipt.status ==1 || receipt.status == 'Pagado') && acceso_pl_cob ==false) {
              var texto_log = " EDICION DE RECIBO PAGADO"
            }
            if ((receipt.status ==5 || receipt.status == 'Liquidado') && acceso_pl_cob ==false) {
              var texto_log = " EDICION DE RECIBO LIQUIDADO"
            }
            var params = {
              'model': 13,
              'event': "PATCH",
              'associated_id': endoso.id,
              'identifier': "actualizó el recibo " + receipt.recibo_numero + texto_log+"."
            }
            dataFactory.post('send-log/', params).then(function success(response){

            });
            var params = {
              'model': 4,
              'event': "POST",
              'associated_id': receipt.id,
              'identifier': 'actualizó el recibo, '+ texto_log+'.'
            }
            dataFactory.post('send-log/', params).then(function success(response){

            });
            SweetAlert.swal("Listo", "El recibo ha sido actualizado", "success");
            $scope.cancel();
          }
        })
        .catch(function(e){
          console.log('error', e);
        });
      }
      $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      };
    };

    $scope.anularFianza = function(suret){
      $rootScope.suretyInfo = suret;
      var modalInstance = $uibModal.open({
        templateUrl: 'app/fianzaGpo/annulment.ChangeModal.html',
        controller: FianzaAnnulmentModalCtrl,
        controllerAs: 'ann',
        size: 'lg',
        resolve: {
          suretyInfo: function(){
            return suret;
          },
        },
        backdrop: 'static',
        keyboard: false
      });
    };

    function FianzaAnnulmentModalCtrl(url,$http,$rootScope,suretyInfo,$scope,$uibModalInstance){
      var ann = this;
      ann.suretyInfo = suretyInfo;
      ann.suretyInfo.startValidity = convertDate(suretyInfo.start_of_validity);
      ann.suretyInfo.endValidity = convertDate(suretyInfo.end_of_validity);
      ann.suretyInfo.polizaNumber = (suretyInfo.poliza_number);

      function convertDate(inputFormat, indicator) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        if(indicator){
          var date = [pad(d.getDate()+1), pad(d.getMonth()+1), d.getFullYear()].join('/');
        } else {
          var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
        }
        return date;
      };

      function toDate(dateStr) {
        if(dateStr){
          var dateString = dateStr;
          var dateParts = dateString.split("/");
          var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
          return dateObject;
        }
      };

      if (ann.suretyInfo.status == 14) {        
        ann.conceptAnn = [
          {'value':1,'label':'PreAnulada'},
          {'value':2,'label':'Por error de captura'},
          {'value':3,'label':'Por reexpedición'},
          {'value':4,'label':'Por falta de pago'},
          {'value':5,'label':'Otro (sólo anular)'}
        ];
      }else{        
        ann.conceptAnn= [
          {'value':2,'label':'Por error de captura'},
          {'value':3,'label':'Por Reexpedición'},
          {'value':4,'label':'Por falta de Pago'},
          {'value':5,'label':'Otro (Sólo anular)'}
        ];
      }
      // ((1, 'Preanulada'),(2, 'Por error de captura'),(3, 'Por reexpedición'),(4, 'Por falta de pago'), (5, 'Otro(Anulación)'), (0, 'No aplica'))
      ann.conceptAnnulment = ann.conceptAnn[0].value;

      $scope.conceptAnnSelection = function(val){
        
      };

      $scope.savesuretyAnnulment = function(suretyA){
        if(!ann.suretyInfo.reason_cancel){
          SweetAlert.swal('Error', 'Agrega la razón de anulación.', 'error');
          return;
        }

        if (ann.conceptAnnulment == 1) {
          var obj = {
            reason_rehabilitate: null,
            reason_cancel: ann.suretyInfo.reason_cancel,
            concept_annulment: ann.conceptAnnulment,
            status : 24//PreAnulada
          }

          $scope.annulmentSurety(obj);
        }else{
          var obj = {
            reason_rehabilitate: null,
            reason_cancel: ann.suretyInfo.reason_cancel,
            concept_annulment: ann.conceptAnnulment,
            status : 17//Anulada
          }

          if(ann.suretyInfo.recibos_poliza.length > 0){
            if(ann.suretyInfo.recibos_poliza[0].status != 4 || ann.suretyInfo.recibos_poliza[0].status != 11){
              SweetAlert.swal({
                title: 'Anular Fianza Colectiva',
                text: "Existen recibos que no están como pendientes de pago, ¿Estás seguro de continuar?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si",
                cancelButtonText: "No",
                closeOnConfirm: false
              },
              function(isConfirm){
                if(isConfirm){
                  if(ann.conceptAnnulment == 2 || ann.conceptAnnulment == 3){
                    $rootScope.reason_cancel = ann.suretyInfo.reason_cancel;
                    $rootScope.concept_annulment = ann.conceptAnnulment;
                    $scope.cancel();
                    swal.close();
                    $state.go('fianzas.reissue', {polizaId: suretyA.id});
                  }else{
                    $scope.annulmentSurety(obj);
                  }
                }else{
                  $scope.cancel();
                }
              });
            }else{
              if(ann.conceptAnnulment == 2 || ann.conceptAnnulment == 3){
                $rootScope.reason_cancel = ann.suretyInfo.reason_cancel;
              $rootScope.concept_annulment = ann.conceptAnnulment;
                $scope.cancel();
                swal.close();
                $state.go('fianzas.reissue', {polizaId: suretyA.id});
              }else{
                $scope.annulmentSurety(obj);
              }
            }
          }else{
            if(ann.conceptAnnulment == 2 || ann.conceptAnnulment == 3){
              $rootScope.reason_cancel = ann.suretyInfo.reason_cancel;
              $rootScope.concept_annulment = ann.conceptAnnulment;
              $scope.cancel();
              swal.close();
              $state.go('fianzas.reissue', {polizaId: suretyA.id});
            }else{
              $scope.annulmentSurety(obj);
            }
          }
        }
      };

      $scope.annulmentSurety = function(object){
        $http.patch(ann.suretyInfo.url, object)
        .then(function(response){
          if(response.status == 200){
            
            // Log fianza
            var params = {
              'model': 13,
              'event': "PATCH",
              'associated_id': ann.suretyInfo.id,
              'identifier': response.data.status == 24 ? 'actualizó la fianza colectiva por preanulacion' : 'actualizó la fianza colectiva por anulación.'
            }
            dataFactory.post('send-log/', params).then(function success(response){
            });

            SweetAlert.swal("¡Listo!", "La fianza colectiva ha sido actualizada exitosamente.", "success");
            activate();
            $scope.cancel();
          }//response patch
        })
        .catch(function(e){
          console.log('error', e);
        });
      };

      $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      };
    };

    $scope.rehabilitarFianza = function(surety){
      var modalInstance = $uibModal.open({
        templateUrl: 'app/fianzaGpo/rehabilitate.modal.html',
        controller: FianzaRehabilitateModalCtrl,
        controllerAs: 'ann',
        size: 'md',
        resolve: {
          suretyInfo: function(){
            return surety;
          },
        },
        backdrop: 'static',
        keyboard: false
      });
    };

    function FianzaRehabilitateModalCtrl(url, $http,suretyInfo, $scope, $uibModalInstance, dataFactory){
      var ann = this;

      ann.suretyInfo = suretyInfo;

      $scope.saveSuretyRehabilitate = function(){
        if(!ann.suretyInfo.reason_rehabilitate){
          SweetAlert.swal('Error', 'Agrega el motivo de la rehabilitación.', 'error');
          return;
        }

        if(ann.suretyInfo.status == 24 || ann.suretyInfo.status == 17){
          if(ann.suretyInfo.concept_annulment == 2 || ann.suretyInfo.concept_annulment == 3){
            SweetAlert.swal('Error', 'No se puede rehabilitar la fianza. Solo los conceptos forma de pago y otro.', 'error');
            return;
          }
        }

        var obj = {
          reason_cancel: null,
          concept_annulment: null ,
          reason_rehabilitate: ann.suretyInfo.reason_rehabilitate,
          status : 14,//Vigente
          beneficiaries_poliza_many: ann.suretyInfo.beneficiaries_poliza_many
        }

        $http.patch(ann.suretyInfo.url, obj)
        .then(function(response){
          if(response.status == 200){
            var params = {
              'model': 13,
              'event': "PATCH",
              'associated_id': ann.suretyInfo.id,
              'identifier': ' rehabilitó la fianza colectiva.'
            }
            dataFactory.post('send-log/', params).then(function success(response){

            });
            SweetAlert.swal("¡Listo!", "La fianza colectiva ha sido actualizada exitosamente.", "success");
            activate();
            $scope.cancel();
          }
        })
        .catch(function(e){
          console.log('error', e);
        });
      };

      $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
      };
    }

    $scope.goToPolicy = function(policy){
      $state.go('fianzas.details', {polizaId: policy.id});
    };

    $scope.showFiles = function(item){
      $http.get(url.IP + 'polizas/'+ item.id + '/archivos/')
      .then(function(response){
        item.files = response.data.results;
      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    // Upload files
    $scope.userInfo = {
      id: 0
    };
    $scope.countFile = 0;
    $scope.okFile = 0;

    var uploader = $scope.uploader = new FileUploader({
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });

    // uploader.filters.push({
    //   name: 'customFilter',
    //   fn: function(item, options){
    //     return this.queue.length < 20;
    //   }
    // });

    // ALERTA SUCCES UPLOADFILES
    uploader.onSuccessItem = function(fileItem, response, status, headers){
      $scope.okFile++;
      if($scope.okFile == $scope.uploader.queue.length){
        SweetAlert.swal('¡Listo!', 'Archivos cargados exitosamente.', 'success');
        activate();
      }
    };

    // ALERTA ERROR UPLOADFILES
    uploader.onErrorItem = function(fileItem, response, status, headers){
      SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORONUPLOADFILES ,"error");
    };

    uploader.onAfterAddingFile = function(fileItem) {
      fileItem.formData.push({
        arch: fileItem._file,
        nombre: fileItem.file.name
      });
      $scope.specialchar = []
      var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-=" 
      var str = fileItem.file.name;    
      for(i = 0; i < specialChars.length;i++){ 
        if(str.indexOf(specialChars[i]) > -1){         
          if (specialChars[i] == "-" || specialChars[i] == " " || specialChars[i] == "_" || specialChars[i] == "#" || specialChars[i] == "(" || specialChars[i] == ")" || specialChars[i] == ":" || specialChars[i] == '"') {
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
          }else{            
            $scope.specialchar.push(specialChars[i])  
          }
        } 
      }
      if ($scope.specialchar.length > 0) {
        $scope.uploader.queue.splice($scope.uploader.queue.indexOf(fileItem),1)
        SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales: '+$scope.specialchar,'error') 
      }
      fileItem.removeAfterUpload = true;

      if(fileItem){
        $scope.countFile++;
      }
    };

    uploader.onBeforeUploadItem = function(item) {
      if(item.file.sensible != undefined){
        item.formData[0].sensible = item.file.sensible;
      }

      item.url = $scope.userInfo.url;
      item.formData[0].nombre = item.file.name;
      item.alias = '';
      item.formData[0].owner = $scope.userInfo.id;
    };

    function uploadFiles(polizaId) {
      $scope.userInfo = {
        id: polizaId
      };
      $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';

      $scope.files = [];

      $timeout(function() {
        $scope.uploader.uploadAll();
      }, 1000);
    };

    $scope.showFiles = function(item){
      $http.get(url.IP + 'polizas/'+ item.id + '/archivos/')
      .then(function(response){
        item.files = response.data.results;
        if(item.showFile){
          item.showFile = false;
        }else{
          item.showFile = true;
        }
      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    $scope.saveFiles = function(param){
      uploadFiles(param.id);
    };

    $scope.deleteFile = function(file, container){
      SweetAlert.swal({
        title: 'Eliminar Archivo',
        text: "No será posible recuperar este archivo, ¿Estás seguro?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si",
        cancelButtonText: "No",
        closeOnConfirm: false
      },
      function(isConfirm){
        if(isConfirm){
          $http({
            method: 'GET',
            url: url.IP + 'delete-manual',
            params: {
              file_id: file.id
            }
          })
          .then(function success(response){
            if(response.data.status == 204){
              SweetAlert.swal("¡Listo!", "El archivo fue eliminado exitosamente.", "success");
              container.splice(container.indexOf(file), 1);
            }
          })
          .catch(function(e){
            console.log('error', e);
          });
        }
      });
    };

    $scope.renameFile = function (file, vmFiles){
      var patch = {
        nombre: file.nombre,
        sensible : file.sensible
      }
      $http.patch(file.url, patch)
      .then(function(response){
        if(response.status == 403){
          $http.get(file.url)
          .then(function(response){
            file.nombre = response.data
          })
          .catch(function(e){
            console.log('error', e);
          });
        }
      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    $scope.getComments = function(){
      $http({
        method: 'GET',
        url: url.IP + 'comments/',
        params: {
          'model': 13,
          'id_model': $scope.surety.id
        }
      })
      .then(function(response){
        $scope.comments_data = response.data.results;
        $scope.comments_config = {
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous
        };
      })
      .catch(function(e){
        console.log('e', e);
      });
    };

    $scope.show_binnacle_receipt = false;

    $scope.returnToReceipts = function () {
      $scope.show_binnacle_receipt = false;
    };

    $scope.showBinnacleReceipt = function(receipt){
      $scope.show_binnacle_receipt = true;
      $scope.receipt_id = receipt.id;
      $scope.comments_data_receipt = [];
      $scope.receiptmodel = receipt.url;
      $http({
        method: 'GET',
        url: url.IP+'comments/',
        params: {
          'model': 4,
          'id_model': receipt.id
        }
      })
      .then(function(request) {
        $scope.comments_data_receipt = request.data.results;
        $scope.comments_config_receipt = {
          count: request.data.count,
          previous: request.data.previous,
          next: request.data.next
        }
      })
      .catch(function(e) {
        console.log('e', e);
      });
    };

    $scope.deleteCategorie = function(item){
      SweetAlert.swal({
        title: 'Eliminar Subgrupo',
        text: "Se eliminará la categoría y todos sus certificados, ¿Estás Seguro?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, estoy seguro.",
        cancelButtonText: "Cancelar",
        closeOnConfirm: false
      },
      function(isConfirm){
        if(isConfirm){
          if($scope.categories.length > 1){
            $http.delete(item.url)
            .then(function success(response){
              if(response.status == 204){
                $scope.categories.splice(item, 1);
                SweetAlert.swal("¡Listo!", "Se ha eliminado la categoría, con todas sus certificados.", "success");
              }
            })
            .catch(function(e){
              console.log('e', e);
            });
          }else{
            SweetAlert.swal("Error", "No se eliminó la categoría porque la carátula no puede quedarse sin categorías.", "error");
          }
        }
      });
    };

    $scope.showSectionCertificate = function(value){
      switch(value){
        case 1:
          $scope.certificate_table = true;
          $scope.certificate_info = false;
          $scope.certificate_edit = false;
          $scope.certificate_mass = false;
          break;
        case 2:
          $scope.certificate_table = false;
          $scope.certificate_info = true;
          $scope.certificate_edit = false;
          $scope.certificate_mass = false;
          break;
        case 3:
          $scope.certificate_table = false;
          $scope.certificate_info = false;
          $scope.certificate_edit = true;
          $scope.certificate_mass = false;
          break;
        case 4:
          $scope.certificate_table = false;
          $scope.certificate_info = false;
          $scope.certificate_edit = false;
          $scope.certificate_mass = true;
          break;
        default:
          $scope.certificate_table = true;
          $scope.certificate_info = false;
          $scope.certificate_edit = false;
          $scope.certificate_mass = false;
      }
    };

    $scope.getAllCertificate =function(){
      $scope.status_cert = 0;
      $scope.categorySelected.id = $scope.surety.id;
      $scope.categorySelected.value = 0;
      $scope.categorySelected.category = 0;
      $scope.categorySelected.is_category = 0;
      $scope.categorySelected.certificates = [];
      $scope.showSectionCertificate(1);
      var data = {
        caratula: $scope.surety.id,
        status: 0,
        parent: 0,
        page: 1
      }
      $http.post(url.IP + 'information_certCollSurety/', data)
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          $scope.categorySelected.certificates = response.data.results;
          $scope.categorySelected.is_category = 0;
          $scope.categorySelected.config = {
            count: response.data.count,
            previous: response.data.previous,
            next: response.data.next
          };
          testPagination('categorySelected.certificates', 'categorySelected.config');
        }
      })
      .catch(function(e){
        l.stop();
        console.log('error - caratula - catch', e);
      });
    };

    $scope.getCertificate =function(param, value){
      $scope.categorySelected.id = param.id;
      $scope.categorySelected.value = value;
      $scope.categorySelected.category = param.id;
      $scope.categorySelected.is_category = 1;
      $scope.categorySelected.certificates = [];
      $scope.status_cert = value;
      $scope.show_section(3);
      $scope.showSectionCertificate(1);
      var data = {
        caratula: $scope.surety.id,
        status: value,
        parent: param.id
      }
      $http.post(url.IP + 'information_certCollSurety/', data)
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          $scope.categorySelected.certificates = response.data.results;
          $scope.categorySelected.config = {
            count: response.data.count,
            previous: response.data.previous,
            next: response.data.next
          };
          testPagination('categorySelected.certificates', 'categorySelected.config');
        }
      })
      .catch(function(e){
        console.log('error - caratula - catch', e);
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
      }

      $scope.selectPage = function (parPage) {
        $scope.actual_page = parPage;

        var data = {
          caratula: $scope.surety.id,
          status: $scope.categorySelected.value,
          parent: $scope.categorySelected.is_category,
          page: parPage
        }

        $http.post(url.IP + 'information_certCollSurety/', data)
        .then(function(response){
          if(response.status == 200 || response.status == 201){
            $scope.categorySelected.certificates = response.data.results;
          }
        })
        .catch(function(e){
          console.log('error - caratula - catch', e);
        });
      };

      $scope.previousBlockPages = function(param){
        if(param){
          if($scope.start < $scope.actual_page){
            $scope.start = $scope.start - 1 ;
            $scope.end = $scope.end - 1;
          }
        }else{
          $scope.start = $scope.start - 5 ;
          $scope.end = $scope.end - 5;

          if($scope.end < $scope.totalPages.length){
            $scope.not_next = false;
          }
        }

        if($scope.end <= 5){
          $scope.start = 0;
          $scope.end = 5;
          $scope.show_prev_block = false;
        }
      }

      $scope.nextBlockPages = function(param){
        $scope.show_prev_block = true;

        if(param){
          if($scope.end > $scope.actual_page){
            $scope.start = $scope.start + 1 ;
            $scope.end = $scope.end + 1;
          }
        }else{
          if($scope.end < $scope.totalPages.length){
            $scope.start = $scope.start + 5 ;
            $scope.end = $scope.end + 5;

            if($scope.end == $scope.totalPages.length){
              $scope.not_next = true;
            }
          } else {
            $scope.not_next = true;
          }
        }
      }
    };

    $scope.search = function(param){
      $scope.categorySelected.search = param;
      if(param){
        $http({
          method: 'GET',
          url: url.IP + 'search_certs_collectivfianza/',
          params: {
            cadena: $scope.categorySelected.search,
            org: usr.org,
            parent: $scope.categorySelected.id ? $scope.categorySelected.id : $scope.surety.id,
            is_category: $scope.categorySelected.is_category ? $scope.categorySelected.is_category  : 0, 
            status: $scope.status_cert ? $scope.status_cert : 0
          }
        })
        .then(function success(response){
          if(response.status == 200){
            $scope.categorySelected.certificates = response.data.results;
            $scope.categorySelected.config = {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            };
            testPagination('categorySelected.certificates', 'categorySelected.config');
          }else{
            SweetAlert.swal('Error', 'Ocurrió un error, por favor intenta de nuevo.', 'Error');
          }
        })
        .catch(function(e){
          console.log('error', e);
        });
      }else{
        var data = {
          caratula: $scope.surety.id,
          status: $scope.categorySelected.value,
          parent: $scope.categorySelected.is_category,
          page: 1
        }

        $http.post(url.IP + 'information_certCollSurety/', data)
        .then(function(response){
          if(response.status == 200 || response.status == 201){
            $scope.categorySelected.certificates = response.data.results;
            $scope.categorySelected.config = {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            };
            testPagination('categorySelected.certificates', 'categorySelected.config');
          }else{
            SweetAlert.swal('Error', 'Ocurrió un error, por favor intenta de nuevo.', 'Error');
          }
        })
      }
    };

    $scope.selectCerficate = function(item){
      $scope.showSectionCertificate(2);
      $scope.certificate = item;

      $http.get(url.IP + 'polizas/'+ item.id + '/archivos/')
      .then(function(response){
        item.files = response.data.results;
      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    $scope.editCerficate = function(item){console.log('ite,---',item)
      $scope.pkActual = item.id;
      $scope.parentCertificate = item.parent.id;
      $scope.newCertificate = {};
      $scope.newBeneficiary = {};
      $scope.newContract = {};
      $scope.newCertificate.url = item.url;
      $scope.newCertificate.certificate_number = item.certificate_number;
      $scope.newBeneficiary.url = item.beneficiaries_poliza[0].url;
      $scope.newBeneficiary.email = item.beneficiaries_poliza[0].email;
      $scope.newBeneficiary.first_name = item.beneficiaries_poliza[0].first_name;
      $scope.newBeneficiary.last_name = item.beneficiaries_poliza[0].last_name;
      $scope.newBeneficiary.second_last_name = item.beneficiaries_poliza[0].second_last_name;
      $scope.newBeneficiary.rfc = item.beneficiaries_poliza[0].rfc;
      $scope.newBeneficiary.workstation = item.beneficiaries_poliza[0].workstation;
      $scope.newContract.url = item.contract_poliza.url;
      $scope.newContract.activity = item.contract_poliza.activity;
      $scope.newContract.amount = item.contract_poliza.amount;
      $scope.showSectionCertificate(3);
    };

    $scope.updateCertificate = function(){
      var item = {
        pkActual: $scope.pkActual,
        certificate: $scope.newCertificate.certificate_number,
        caratula: $scope.surety.id,
        parent: $scope.parentCertificate
      }
      dataFactory.post('fianzacollectiveValidateCertificate/',item)
      .then(function success(req) {
        $scope.existeCertificate = false;
        if (req.data.exist) {
          $scope.existeCertificate = req.data.exist;
          SweetAlert.swal("¡Información!", "El Número de Certificado ya existe.", "error");
          return;
        }else{
          $scope.existeCertificate = false;
          $http.patch($scope.newCertificate.url, $scope.newCertificate)
          .then(function(response){
            if(response.status == 200 || response.status == 201){
              $http.patch($scope.newBeneficiary.url, $scope.newBeneficiary)
              .then(function(response){
                if(response.status == 200 || response.status == 201){
                  $http.patch($scope.newContract.url, $scope.newContract)
                  .then(function(response){
                    if(response.status == 200 || response.status == 201){
                      SweetAlert.swal("¡Listo!", "El certificado se actualizó exitosamente.", "success");
                      activate();
                    }else{
                      SweetAlert.swal("Error", "Ócurrio un error.", "error");
                    }
                  })
                  .catch(function(e){
                    console.log('error', e);
                  });
                }else{
                  SweetAlert.swal("Error", "Ócurrio un error.", "error");
                }
              })
              .catch(function(e){
                console.log('error', e);
              });
            }else{
              SweetAlert.swal("Error", "Ócurrio un error.", "error");
            }
          })
          .catch(function(e){
            console.log('error', e);
          });
        }
      })
      .catch(function(e){
        console.log('error', e);
      });
    }

    $scope.deleteCertificate = function(item){
      SweetAlert.swal({
        title: 'Eliminar Certificado',
        text: "Se eliminará el Certificado y no se podrá recuperar después, ¿Estás Seguro?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, estoy seguro.",
        cancelButtonText: "Cancelar",
        closeOnConfirm: false
      },
      function(isConfirm){
        if(isConfirm){
          $http.delete(item.url)
          .then(function(response){
            if(response.status == 204){
              SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETECERT, "success");
              activate();
            }
          });
          $scope.categorySelected.certificates.splice($scope.categorySelected.certificates.indexOf(item), 1);
        }else{
          swal("Cancelado", MESSAGES.OK.CANCELCERT, "error");
          return;
        }
      });
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
            certificate_number: item.CERTIFICADO,
            email: item.CORREO ? item.CORREO : null,
            first_name: item.NOMBRE,
            last_name: item.APELLIDO_PATERNO,
            second_last_name: item.APELLIDO_MATERNO,
            rfc: item.RFC ? item.RFC : null,
            workstation: item.PUESTO ? item.PUESTO : null
          }
          var certificateData = {
            caratula: $scope.surety.id,
            certificate_number: item.CERTIFICADO,
            parent: item.CATEGORIA,
            poliza_number: $scope.surety.poliza_number + ' - INC. ' + item.CERTIFICADO,
            start_of_validity: $scope.surety.start_of_validity,
            end_of_validity: $scope.surety.end_of_validity,
            status: $scope.surety.status,
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
          SweetAlert.swal("Listo!", MESSAGES.OK.CERTIFICATESDONE, 'success');
          $scope.cancelCertificates();
          activate();
          $scope.showSectionCertificate(1);
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

    $scope.downloadExcel = function(){
      $http({
          method: 'POST',
          url: url.IP + 'service_reporte-certificatesFianza-excel',
          data: {
            cadena: $scope.categorySelected.search,
            org: usr.org,
            parent: $scope.categorySelected.id ? $scope.categorySelected.id : $scope.surety.id,
            is_category: $scope.categorySelected.is_category ? $scope.categorySelected.is_category  : 0, 
            status: $scope.status_cert ? $scope.status_cert : 0
          },
          headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
          responseType: "arraybuffer"
        })
        .then(function success(response){
          if(response.status === 200) {
              var blob = new Blob([response.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
              saveAs(blob, 'Reporte_CertificadosFianza.xls');
          }

        })
        .catch(function (e) {
          console.log('e', e);
        });
    }

    $scope.saveAsSurety = function(){
      var modalInstance = $uibModal.open({
        templateUrl: 'app/fianzas/otAsFianzaModal.html',
        controller: FianzaPendingModalCtrl,
        controllerAs: 'vmm',
        size: 'lg',
        resolve: {
          policyModal: function() {
            return $scope.surety;
          }
        },
        backdrop: 'static',
        keyboard: false
      });
      modalInstance.result.then(function(receipt) {
        activate();
      });
    }

    function FianzaPendingModalCtrl(datesFactory, $localStorage, $scope, toaster, MESSAGES, policyModal, $uibModalInstance, dataFactory, SweetAlert, $state, insuranceService, receiptService, url, $http, $rootScope,emailService,helpers) {
      var vmm = this;

      vmm.form = {
        folio: '',
        comisiones: []
      };

      vmm.options = {
          save: save,
          cancel: cancel
      };
      vmm.policyInfo = policyModal;

      $scope.years=[]
      var actualYear = new Date().getFullYear();
      var oldYear = actualYear - 80;
      for (var i = actualYear + 10; i >= oldYear; i--) {
        $scope.years.push(i);
      }

      vmm.form.month={};
      vmm.form.month.month_selected = 1;
      vmm.form.month.options = [
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

      $scope.checkFechaFactura = function (date) {
        var date_initial = (date).split('/');
        var day = date_initial[0];
        var month = date_initial[1];
        var year = parseInt(date_initial[2]);
        vmm.form.month.month_selected = parseInt(month)
        vmm.form.year_factura = year
      };
      $scope.changeNoPoliza = function () {
        if(vmm.form.fianza){
          helpers.existPolicyNumber(vmm.form.fianza)
          .then(function(request) {
            if(request == true) {
              SweetAlert.swal("Error", "El número de fianza ya existe.", "error");
              vmm.form.fianza = '';
            }
          })
          .catch(function(err) {

          });
        }
      };
      
      $http.get(url.IP+'claves-by-provider/' + vmm.policyInfo.aseguradora.id)
      .then(
        function success(clavesResponse) {
          clavesResponse.data.forEach(function(clave) {
            clave.clave_comision.forEach(function(item) {
              item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
              if(vmm.policyInfo.subramo == item.subramo) {
                vmm.form.comisiones.push(item);
              }
            });
          });
        },
        function error (e) {
          console.log('Error - claves-by-provider', e);
        })
      .catch(function (error) {
          console.log('Error - claves-by-provider - catch', error);
      });

      vmm.form.startDate = convertDate(vmm.policyInfo.start_of_validity);
      vmm.form.endingDate = convertDate(vmm.policyInfo.end_of_validity);
      vmm.form.document_type = vmm.policyInfo.document_type;
      vmm.form.subramo = vmm.policyInfo.subramo;
      vmm.form.policy_days_duration = 365;
      vmm.policyInfo.beneficiaries_poliza_many.forEach(function(item) {
       delete item['poliza_many'];
      });
      function save(){
        $scope.dataFianza = {
          'folio': vmm.form.folio,
          'poliza_number': vmm.form.fianza,
          'emision_date': vmm.form.emision_date ? datesFactory.toDate(vmm.form.emision_date) : null,
          'status': 14,
          'p_neta': vmm.policyInfo.poliza.primaNeta,
          'rpf': vmm.policyInfo.poliza.rpf,
          'derecho': vmm.policyInfo.poliza.derecho,
          'iva': vmm.policyInfo.poliza.iva,
          'p_total': vmm.policyInfo.poliza.primaTotal,
          'comision': vmm.policyInfo.comision,
          'comision_percent': vmm.policyInfo.comision_percent,
          'fecha_cancelacion':vmm.policyInfo.fecha_cancelacion,
          'monto_cancelacion':vmm.policyInfo.monto_cancelacion,
          'beneficiaries_poliza_many': vmm.policyInfo.beneficiaries_poliza_many ? vmm.policyInfo.beneficiaries_poliza_many : vmm.policyInfo.beneficiaries_poliza,
          "date_emision_factura": vmm.form.date_emision_factura ? datesFactory.toDate(vmm.form.date_emision_factura ): null,
          "date_maquila": vmm.form.date_maquila ? datesFactory.toDate(vmm.form.date_maquila ): null,
          "year_factura": vmm.form.year_factura ? vmm.form.year_factura: 0,
          "month_factura": vmm.form.month ? vmm.form.month.month_selected : 0,
          "folio_factura": vmm.form.folio_factura ? vmm.form.folio_factura : '',
          "maquila": vmm.form.maquila ? parseFloat(vmm.form.maquila).toFixed(2) : 0,
          "exchange_rate": vmm.form.exchange_rate ? parseFloat(vmm.form.exchange_rate).toFixed(2) : 0,
        }
        $http.patch(vmm.policyInfo.url, $scope.dataFianza)
        .then(function(response) {
          if(response.status == 200){

            vmm.policyInfo.recibos_poliza.forEach(function(item) {
              item.fecha_inicio = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].startDate));
              item.fecha_fin = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].endingDate));
              item.vencimiento = new Date(datesFactory.toDate(vmm.policyInfo.recibos_poliza[0].vencimiento));

              item.poliza = response.data.url;

              dataFactory.post('recibos/', item)
              .then(function success(req) {

              }, function error(error) {
                console.log(error);
              });
            });

            $state.go('fianzas.details', { polizaId: response.data.id });
            activate();
            vmm.options.cancel();
            SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWFIANZAOK, "success");
              
            var params = {
              'model': 13,
              'event': "POST",
              'associated_id': response.data.id,
              'identifier': "convirtió la PT en fianza."
            }
            dataFactory.post('send-log/', params).then(function success(response) {

            });
          }
        })
      }

      function cancel() {
        $uibModalInstance.dismiss('cancel');
      }

      function convertDate(inputFormat,indicator) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        var date = inputFormat;
        if(inputFormat.length != 10){
          function pad(s) { return (s < 10) ? '0' + s : s; }
            var d = new Date(inputFormat);
            if(indicator){
              date = [pad(d.getDate()+1), pad(d.getMonth()+1), d.getFullYear()].join('/');
            } else {
              date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
            }
        }
        return date;
      }
    }


  }
})();