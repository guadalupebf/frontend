/* global angular */
(function() {
  'use strict';

  angular.module('inspinia')
    .controller('FlotillasInfoCtrl', FlotillasInfoCtrl);
  FlotillasInfoCtrl.$inject = ['$uibModal', '$sessionStorage','$scope', '$state', '$stateParams', '$http', 'url', 'SweetAlert', 
                                'MESSAGES', 'FileUploader','$timeout', '$parse', 'dataFactory', '$rootScope', 'datesFactory', 'generalService',
                                '$sce', 'insuranceService', 'toaster', 'appStates', '$localStorage','helpers','ContratanteService'];

  function FlotillasInfoCtrl($uibModal, $sessionStorage, $scope, $state, $stateParams, $http, url, SweetAlert, MESSAGES, FileUploader, 
                              $timeout, $parse, dataFactory, $rootScope, datesFactory, generalService, $sce, insuranceService, toaster, 
                              appStates, $localStorage,helpers,ContratanteService){

    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);

    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);

    var order = this;
    $scope.caratula_renovada = ''
    $rootScope.show_contractor = false;
    $scope.showOt = true;
    $scope.show_caratula = true;
    $scope.show_certificado = false;
    $scope.isRenewal=false;
    $scope.show_renewal_certificate=false;
    $scope.okFile = 0;
    $scope.countFile = 0;
    $scope.incompleteOT = {
      complete: true,
      caratule: [],
      certificates: []
    };

    $scope.categorySelected = {
      id: null,
      is_category: 0,
      certificates: [],
      config: {}
    };
    order.isCollapsed = false;
    // Function to toggle the collapse state
    order.toggleCollapse = function() {
      order.isCollapsed = !order.isCollapsed;
    };

    $scope.get_conductos = function(param){
      param = parseInt(param);
      var conductos = {
        1 :'No domiciliada',
        2 :'Agente',
        3 :'CAC',
        4 :'CAT/Domiciliado',
        5 :'Nómina',
        6 :'CUT'
      }
      return conductos[param];
    }

    $scope.frequencies = [
      {'value':1, 'label':'Mensual'},
      {'value':2, 'label':'Bimestral'},
      {'value':3, 'label':'Trimestral'},
      {'value':6, 'label':'Semestral'},
      {'value':12, 'label':'Anual'},
      {'value':5, 'label':'Contado'},
      {'value':7, 'label':'Semanal'},
      {'value':14, 'label':'Catorcenal'},
      {'value':15, 'label':'Quincenal'},
    ];
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
    $scope.businessline = [
      {'id':1,'name':'Comercial'},
      {'id':2,'name':'Personal'},
      {'id':0,'name':'Otro'},
    ];
    $scope.types = [
      {'id':1,'name':'Automóvil'},
      {'id':2,'name':'Motocicleta'},
      {'id':3,'name':'Tracto'},
      {'id':4,'name':'Autobús'},
      {'id':5,'name':'Pick Up'},
      {'id':6,'name':'Camiones hasta 1.5 ton'},
      {'id':7,'name':'Chofer app'},
      {'id':8,'name':'Remolque'},
      {'id':9,'name':'Camiones + 1.5 ton'},
    ];
    $scope.usages = [
      {'value':1, 'label':'Particular'},
      {'value':2, 'label':'Carga Comercial'},
      {'value':3, 'label':'Servicio Público'}
    ];
    $scope.procedencias = [
      {'value':0, 'label':'Sin especificar'},
      {'value':1, 'label':'Residencia'},
      {'value':2, 'label':'Turista'},
      {'value':3, 'label':'Legalizado'},
      {'value':4, 'label':'Fronterizo'}
    ];
    $scope.conducto_de_pagos = [
      {'value':1,'label':'No domiciliada'},
      {'value':2,'label':'Agente'},
      {'value':3,'label':'CAC'},
      {'value':4,'label':'CAT/Domiciliado'},
      {'value':5,'label':'Nómina'},
      {'value':6,'label':'CUT'},
    ];

    $scope.excelJson = [];
    $scope.beneficiaries_life = [];
    $scope.beneficiaries_medical = [];
    $scope.optionsViews = [
      {'value':10, 'label':'10'},
      {'value':25, 'label':'25'},
      {'value':50, 'label':'50'}
    ];
    $scope.optionViews = $scope.optionsViews[0];
    $scope.valueInitial = 1;
    $scope.valueFinal = 10;
    $scope.excelJsonViews = [];
    $scope.showTableCertificates = false;
    $scope.loader = false;
    $scope.certifcados = [];

    $scope.directiveReceipts = {};
    $scope.dataToSave = {
      recalcular: true
    };

    $scope.recibosTodos = [];
    $scope.show_binnacle_receipt = false;

    $scope.contractorLayout = {};

    $scope.statesArray = [
      {id: 1, state: 'Aguascalientes'},
      {id: 2, state: 'Baja California'},
      {id: 3, state: 'Baja California Sur'},
      {id: 4, state: 'Campeche'},
      {id: 5, state: 'Chiapas'},
      {id: 6, state: 'Chihuahua'},
      {id: 7, state: 'Coahuila'},
      {id: 8, state: 'Colima'},
      {id: 9, state: 'Ciudad de México'},
      {id: 10, state: 'Durango'},
      {id: 11, state: 'Estado de México'},
      {id: 12, state: 'Guanajuato'},
      {id: 13, state: 'Guerrero'},
      {id: 14, state: 'Hidalgo'},
      {id: 15, state: 'Jalisco'},
      {id: 16, state: 'Michoacán'},
      {id: 17, state: 'Morelos'},
      {id: 18, state: 'Nayarit'},
      {id: 19, state: 'Nuevo León'},
      {id: 20, state: 'Oaxaca'},
      {id: 21, state: 'Puebla'},
      {id: 22, state: 'Querétaro'},
      {id: 23, state: 'Quintana Roo'},
      {id: 24, state: 'San Luis Potosí'},
      {id: 25, state: 'Sinaloa'},
      {id: 26, state: 'Sonora'},
      {id: 27, state: 'Tabasco'},
      {id: 28, state: 'Tamaulipas'},
      {id: 29, state: 'Tlaxcala'},
      {id: 30, state: 'Veracruz'},
      {id: 31, state: 'Yucatán'},
      {id: 32, state: 'Zacatecas'},
    ];

    order.save_info_tab = save_info_tab;
    $scope.accesos = $sessionStorage.permisos

    if($scope.accesos){
      $scope.accesos.forEach(function(perm){
        if(perm.model_name == 'Pólizas'){
          $scope.acceso_polizas = perm
          $scope.acceso_polizas.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar pólizas') {
              if (acc.checked == true) {
                $scope.acceso_adm_pol = true
              }else{
                $scope.acceso_adm_pol = false
              }
            }else if (acc.permission_name == 'Ver pólizas') {
              if (acc.checked == true) {
                $scope.acceso_ver_pol = true
              }else{
                $scope.acceso_ver_pol = false
              }
            }else if (acc.permission_name == 'Cancelar pólizas') {
              if (acc.checked == true) {
                $scope.acceso_canc_pol = true
              }else{
                $scope.acceso_canc_pol = false
              }
            }else if (acc.permission_name == 'Eliminar pólizas') {
              if (acc.checked == true) {
                $scope.acceso_elim_pol = true
              }else{
                $scope.acceso_elim_pol = false
              }
            }else if (acc.permission_name == 'Rehabilitar pólizas') {
              if (acc.checked == true) {
                $scope.acceso_adm_rehabilitar = true
              }else{
                $scope.acceso_adm_rehabilitar = false
              }
            }
          })
        }
        if(perm.model_name == 'Endosos'){
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
        }
        if (perm.model_name == 'Reportes') {
          $scope.acceso_reportes = perm;
          $scope.acceso_reportes.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Reporte fianzas') {
              if (acc.checked == true) {
                $scope.acceso_rep_fia = true
              }else{
                $scope.acceso_rep_fia = false
              }
            }else if (acc.permission_name == 'Reporte Siniestros') {
              if (acc.checked == true) {
                $scope.acceso_rep_sin = true
              }else{
                $scope.acceso_rep_sin = false
              }
            }else if (acc.permission_name == 'Reporte Endosos') {
              if (acc.checked == true) {
                $scope.acceso_rep_end = true
              }else{
                $scope.acceso_rep_end = false
              }
            }else if (acc.permission_name == 'Reporte pólizas') {
              if (acc.checked == true) {
                $scope.acceso_rep_pol = true
              }else{
                $scope.acceso_rep_pol = false
              }
            }else if (acc.permission_name == 'Reporte renovaciones') {
              if (acc.checked == true) {
                $scope.acceso_rep_ren = true
              }else{
                $scope.acceso_rep_ren = false
              }
            }else if (acc.permission_name == 'Reporte cobranza') {
              if (acc.checked == true) {
                $scope.acceso_rep_cob = true
              }else{
                $scope.acceso_rep_cob = false
              }
            }
          })
        }
        if(perm.model_name == 'Ordenes de trabajo'){
          $scope.acceso_ot = perm
          $scope.acceso_ot.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar OTs') {
              if (acc.checked == true) {
                $scope.acceso_adm_ot = true
              }else{
                $scope.acceso_adm_ot = false
              }
            }else if (acc.permission_name == 'Ver OTs') {
              if (acc.checked == true) {
                $scope.acceso_ver_ot = true
              }else{
                $scope.acceso_ver_ot = false
              }
            }else if (acc.permission_name == 'Cancelar pólizas') {
              if (acc.checked == true) {
                $scope.acceso_canc_ot = true
              }else{
                $scope.acceso_canc_ot = false
              }
            }else if (acc.permission_name == 'Eliminar pólizas') {
              if (acc.checked == true) {
                $scope.acceso_elim_ot = true
              }else{
                $scope.acceso_elim_ot = false
              }
            }
          })
        }
        if (perm.model_name == 'Contratantes y grupos') {
          $scope.acceso_contg = perm;
          $scope.acceso_contg.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Administrar contratantes y grupos') {
              if (acc.checked == true) {
                $scope.acceso_adm_cont = true
              }else{
                $scope.acceso_adm_cont = false
              }
            }else if (acc.permission_name == 'Ver contratantes y grupos') {
              if (acc.checked == true) {
                $scope.acceso_ver_cont = true
              }else{
                $scope.acceso_ver_cont = false
              }
            }
          })
        }
        if (perm.model_name == 'Siniestros') {
          $scope.acceso_sin = perm;
          $scope.acceso_sin.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Administrar siniestros') {
              if (acc.checked == true) {
                $scope.acceso_adm_sin = true
              }else{
                $scope.acceso_adm_sin = false
              }
            }
          })
        }
        if (perm.model_name == 'Mensajeria') {
          $scope.acceso_mns = perm;
          $scope.acceso_mns.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Mensajeria') {
              if (acc.checked == true) {
                $scope.acceso_mns = true
              }else{
                $scope.acceso_mns = false
              }
            }
          })
        }
        if (perm.model_name == 'Formatos') {
          $scope.acceso_form = perm;
          $scope.acceso_form.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Formatos') {
              if (acc.checked == true) {
                $scope.acceso_form = true
              }else{
                $scope.acceso_form = false
              }
            }
          })
        }
        if (perm.model_name == 'Correos electronicos') {
          $scope.acceso_correo = perm;
          $scope.acceso_correo.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Correos') {
              if (acc.checked == true) {
                $scope.acceso_cor = true
              }else{
                $scope.acceso_cor = false
              }
            }
          })
        }
        if(perm.model_name == 'Cobranza'){
          $scope.acceso_cob = perm
          $scope.acceso_cob.permissions.forEach(function(acc){
            if (acc.permission_name == 'Ver cobranza') {
              if (acc.checked == true) {
                $scope.acceso_ver_cob = true;
              }else{
                $scope.acceso_ver_cob = false
              }
            }
            if (acc.permission_name == 'Despagar recibos') {
              if (acc.checked == true) {
                $scope.acceso_desp_cob = true
              }else{
                $scope.acceso_desp_cob = false
              }
            }
            if (acc.permission_name == 'Pagar y prorrogar') {
              if (acc.checked == true) {
                $scope.acceso_pag_cob = true
              }else{
                $scope.acceso_pag_cob = false
              }
            }
            if (acc.permission_name == 'Desconciliación de recibos') {
              if (acc.checked == true) {
                $scope.acceso_desco_cob = true
              }else{
                $scope.acceso_desco_cob = false
              }
            }
            if (acc.permission_name == 'Conciliar recibos') {
              if (acc.checked == true) {
                $scope.acceso_conc_cob = true
              }else{
                $scope.acceso_conc_cob = false
              }
            }
            if (acc.permission_name == 'Liquidar recibos') {
              if (acc.checked == true) {
                $scope.acceso_liq_cob = true
              }else{
                $scope.acceso_liq_cob = false
              }
            }
            if (acc.permission_name == 'Eliminar recibos') {
              if (acc.checked == true) {
                $scope.acceso_elim_rec = true
              }else{
                $scope.acceso_elim_rec = false
              }
            }
            if (acc.permission_name == 'No permitir editar recibos Pagados/Liquidados') {
              if (acc.checked == true) {
                $scope.acceso_pl_cob = true //no se editan
              }else{
                $scope.acceso_pl_cob = false//se pueden editar pagados-liquidados
              }
            }
          })
        }
        if(perm.model_name == 'Referenciadores'){
          $scope.acceso_ref = perm
          $scope.acceso_ref.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar referenciadores') {
              if (acc.checked == true) {
                $scope.acceso_adm_ref = true
              }else{
                $scope.acceso_adm_ref = false
              }
            }else if (acc.permission_name == 'Pagar a referenciadores') {
              if (acc.checked == true) {
                $scope.acceso_pag_ref = true
              }else{
                $scope.acceso_pag_ref = false
              }
            }else if (acc.permission_name == 'Cambiar refrenciador en pólizas') {
              if (acc.checked == true) {
                $scope.acceso_chg_ref = true
              }else{
                $scope.acceso_chg_ref = false
              }
            }
            if (acc.permission_name == 'Ver referenciadores') {
              if (acc.checked == true) {
                $scope.acceso_ver_ref = true
              }else{
                $scope.acceso_ver_ref = false
              }
            }
          })
        }
        if(perm.model_name == 'Comisiones'){
          $scope.coms = perm
          $scope.coms.permissions.forEach(function(acc){
            if (acc.permission_name == 'Comisiones') {
              if (acc.checked == true) {
                $scope.permiso_comisiones = true
              }else{
                $scope.permiso_comisiones = false
              }
            }
          })
        }
        if(perm.model_name == 'Archivos'){
          $scope.acceso_files = perm
          $scope.acceso_files.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar archivos sensibles') {
              if (acc.checked == true) {
                $scope.permiso_archivos = true
              }else{
                $scope.permiso_archivos = false
              }
            }// Administrar adjuntos //no agregar, no eliminar, no renombrar, no marcar sensible
            if (acc.permission_name == 'Administrar adjuntos') {
              if (acc.checked == true) {
                $scope.permiso_administrar_adjuntos = true
              }else{
                $scope.permiso_administrar_adjuntos = false
              }
            }
          })
        }
      })
    }

    // Upload files
    $scope.userInfo = {
        id: 0
    };
    var uploader = $scope.uploader = new FileUploader({
        headers: {
            // 'Authorization': 'Token ' + token,
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        },
    });

    // uploader.filters.push({
    //     name: 'customFilter',
    //     fn: function(item /*{File|FileLikeObject}*/ , options) { //jshint ignore:line
    //         return this.queue.length < 20;
    //     }
    // });

    $scope.gotoEndoso = function(endoso){
      // ui-sref="endorsement.info({endosoId: endorsement.id})"
      $scope.open_in_same_tab_natural('Información endoso', 'endorsement.info', {endosoId: endoso.id}, 0);
      // console.log(endoso);
    }

    $scope.open_in_same_tab_natural = function(name, route, params, identifier){
      if (name && route){
        $scope.route_for_new_tab = route;
        $scope.name_for_new_tab = name;
      }

      var active_tab = appStates.states.findIndex(function(item){
        if (item.active){
          return true
        }
        return false;
      });
      appStates.states[active_tab] = {
        id: identifier,
        name: $scope.name_for_new_tab, 
        heading: $scope.name_for_new_tab, 
        route: $scope.route_for_new_tab, 
        active: true, 
        isVisible: true, 
        href: $state.href($scope.route_for_new_tab)
      }
      $localStorage.tab_states = appStates.states;
      $localStorage.tab_index = $localStorage.tab_states.length -1;
      $state.go($scope.route_for_new_tab, params);
    }
    $scope.createRecordatorio = function(registroSelected, tipo) {
      var insurance = registroSelected
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
            return $scope.caratula;
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
    $scope.noshowRecordatorios = function() {
      $scope.infoFlag = true;
      $scope.recordatoriosFlag = false;
      $scope.recordatoriosFlagC = false;
    }    
    $scope.showRecordatorios = function() {
      $scope.infoFlag = false;
      $scope.recordatoriosFlag = true;
    }   
    $scope.showRecordatoriosC = function() {
      $scope.infoFlag = false;
      $scope.recordatoriosFlagC = true;
    }
    $scope.statusPayment = function(value){
      switch(value){
        case 1:
          return 'Mensual';
          break;
        case 2:
          return 'Bimestral';
          break;
        case 3:
          return 'Trimestral';
          break;
        case 5:
          return 'Contado';
          break;
        case 6:
          return 'Semestral';
          break;
        case 7:
          return 'Semanal';
          break;
        case 12:
          return 'Anual';
          break;
        case 14:
          return 'Catorcenal';
          break;
        case 24:
          return 'Quincenal';
          break;
        default:
          return value;
      }
    };
    // ALERTA SUCCES UPLOADFILES
    uploader.onSuccessItem = function(fileItem, response, status, headers){
      $scope.okFile++;
      if($scope.okFile == $scope.countFile){
        SweetAlert.swal('¡Listo!', 'Archivos cargados exitosamente.', 'success');
        $http.get(url.IP + 'polizas/'+ $scope.certificate.id + '/archivos/')
        .then(function(response){
          $scope.certificate.files = [];
          $scope.certificate.files = response.data.results;
        })
        .catch(function(e){
          console.log('error', e);
        });
      }
    };

    // ALERTA ERROR UPLOADFILES
    uploader.onErrorItem = function(fileItem, response, status, headers){
      SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORONUPLOADFILES ,"error");
    };

    uploader.onAfterAddingFile = function(fileItem) {        
    // console.log('uploader',fileItem)
      fileItem.formData.push({
          arch: fileItem._file,
          nombre: fileItem.file.name
      });
      $scope.specialchar = []
      var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-="
      var specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

      var str = fileItem.file.name;   
      for(i = 0; i < specialChars.length;i++){ 
        if(str.indexOf(specialChars[i]) > -1){         
          if (specialChars[i] == " " || specialChars[i] == "_" || specialChars[i] == "~" || specialChars[i] == "%" || specialChars[i] == "=" || specialChars[i] == "-" || specialChars[i] == " " || specialChars[i] == "_" || specialChars[i] == "#" || specialChars[i] == "(" || specialChars[i] == ")" || specialChars[i] == ":" || specialChars[i] == '"') {
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
            str = str.split('+').join('');
            fileItem.file.name = fileItem.file.name.split('+').join('');
            str = str.split('$').join('');
            fileItem.file.name = fileItem.file.name.split('$').join('');
            str = str.split('#').join('');
            fileItem.file.name = fileItem.file.name.split('#').join('');
            str = str.split('$#').join('');
            fileItem.file.name = fileItem.file.name.split('$#').join('');
            str = str.split('~').join('');
            fileItem.file.name = fileItem.file.name.split('~').join('');
            str = str.split('%').join('');
            fileItem.file.name = fileItem.file.name.split('%').join('');
            str = str.split('=').join('');
            fileItem.file.name = fileItem.file.name.split('=').join('');
            str = str.split('_').join('');
            fileItem.file.name = fileItem.file.name.split('_').join('');
            str = str.split(" ").join("")
            fileItem.file.name = fileItem.file.name.split(' ').join('');
          }else{         
            $scope.specialchar.push(specialChars[i])  
          }
        } 
      }
      fileItem.file.name = fileItem.file.name.replace(/[&\/\\#^+()$~%'":*=_?<>{}!@]/g, '').replace(/ /g,'')
      fileItem.file.name = fileItem.file.name.trim()
      if ($scope.specialchar.length > 0) {
        $scope.uploader.queue.splice($scope.uploader.queue.indexOf(fileItem),1)
        SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales: '+$scope.specialchar,'error') 
      }
      if(fileItem){
        $scope.countFile++;
      }
      fileItem.removeAfterUpload = true;
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

      // $timeout(function() {
      $scope.uploader.uploadAll();
      saveLogFile($scope.countFile,polizaId)
      //   console.log('fdfsf', $scope.filesCover,$scope.files)
      // }, 1000);
    };
    function saveLogFile(num,id_p){
      if (num >0) {
        var params = {
          'model': 1,
          'event': "PATCH",
          'associated_id': id_p,
          'identifier': " añadio "+num+" archivos a la póliza."
        }
        dataFactory.post('send-log/', params).then(function success(response) {});
      }
    }
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
    $scope.changeSensible = function(sensible, index) {
      uploader.queue[index].formData[0].sensible = sensible;
    }
    $scope.saveFile = function(file){
      var urls = file.url;
      if(urls == undefined){
        urls = url.IP+'polizas/'+file.owner+'/archivos/'+file.id
      }
      $http.patch(urls,{'nombre':file.nombre, 'sensible':file.sensible});
    }
    $scope.saveFiles = function(param){
      $scope.countFile = $scope.uploader.queue.length
      uploadFiles(param.id);
    };
    $scope.deleteReceipts = function (receipt,index,poliz) {
      SweetAlert.swal({
        title: '¿Está seguro?',
        text: "No será posible recuperar este recibo: "+ receipt.recibo_numero,
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, estoy seguro.",
        cancelButtonText: "Cancelar",
        closeOnConfirm: false
      },
      function(isConfirm) {
        if (isConfirm) {
          var data_email = {
            id: receipt.id,
            id_poliza: poliz.id,
            model: 8,
            type_person: 0,
          }
          dataFactory.post('send-email-admins-deletes/', data_email).then(function success(req) {
              // console.log('.................:::::.....',req)
          });
          $http.patch(receipt.url, { status: 0 })
          .then(function(recibo_delete) {
              var paramsDelRec = {
                'model': 1,
                'event': "DELETE",
                'associated_id': poliz.id,
                'identifier': " elimino un recibo ("+receipt.recibo_numero+") de la póliza"
              }
              dataFactory.post('send-log/', paramsDelRec).then(function success(response) {
              });
              if(recibo_delete.data.status == 0){
                poliz.recibos_poliza.splice(index, 1);
              }
              SweetAlert.swal('¡Hecho!','Recibo eliminado','success');
          });
        }
      });
    }
    $scope.cancelRenovate = function(poliza) {
      $http({
        method: 'POST',
        url: url.IP + 'get-polizas-colectividad/',
        data: {
          caratula: $scope.dataCaratula.id,  
        }
      })
      .then(function(data) {
        $scope.allCertificates = [];
        $scope.allCertificates = data.data.data;
        swal({
          title: "No renovar la Colectividad completa",
          text: "Motivo de No Renovación de Carátula y sus Pólizas (Vencidas y Vigentes ("+$scope.allCertificates.length+")):",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
        }, function (inputValue) {
          if (inputValue === false) return false;
          if (inputValue === "") {
            swal.showInputError("Necesita especificar un motivo");
            return false
          }
          var data = {
            reason_ren: inputValue,
            status: 15
          }
          $http.patch(poliza.url, data).then(function(ren) {
            var params = {
              'model': 1,
              'event': "PATCH",
              'associated_id': poliza.id,
              'identifier': " cambio el estatus a No Renovada por el motivo "+ren.data.reason_ren+" de la póliza "+ ren.data.poliza_number+"."
            }
            dataFactory.post('send-log/', params).then(function success(response) {

            });
          });
          $scope.caratula.status = 15;
          $scope.caratula.reason_ren = inputValue;
          swal("Hecho", "La póliza se ha cerrado y no se vera más en el listado de renovaciones", "success");
        });
      }).catch(function(e){
        console.log('error', e);
      });
    }
    $scope.deleteFile = function(file, container,certificate){
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
              var params = {
                'model': 1,
                'event': "PATCH",
                'associated_id': certificate.id,
                'identifier': " elimino 1 archivo de la póliza "+file.nombre
              }
              dataFactory.post('send-log/', params).then(function success(response) {

              });
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

    activate();

    $scope.show_section = function(value){
      $scope.isRenewal=false;
      $scope.show_renewal_certificate=false;
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
          if ($localStorage.saved_flotilla_info && $localStorage.saved_flotilla_info['sucursalLay']){
            $scope.sucursalLay = $localStorage.saved_flotilla_info['sucursalLay'];
          }
          if ($localStorage.saved_flotilla_info && $localStorage.saved_flotilla_info['paqueteLay']){
            $scope.paqueteLay = $localStorage.saved_flotilla_info['paqueteLay'];
          }
          break;
        default:
          $scope.show_caratula = true;
          $scope.show_certificado = false;
      }
    };
    $scope.shareCertificatesAPPEmail = function(caratula) {
      SweetAlert.swal({
        title: '¿Está seguro?',
        text: "Se compartirán todas las Pólizas de Colectividad a la App",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, estoy seguro.",
        cancelButtonText: "Cancelar",
        closeOnConfirm: true
      },
      function(isConfirm) {
        if (isConfirm) {
          var data_email = {
            id_poliza: caratula,
            is_owner: false,
            active: true
          }
          dataFactory.post('shareToAppEmailPC/', data_email).then(function success(req) {
              if (req.status == 200 || req.status == 201){
                SweetAlert.swal("¡Listo!", "Se han Compartido a la APP-Email", "success")
              }else{
                SweetAlert.swal("Error", "Ha ocurrido un error al compartir Pólizas de Colectividad de la Carátula", "error")
              }
          });
        }
      });
    }
    $scope.shareCertificatesApp = function(caratula) {
      SweetAlert.swal({
        title: '¿Está seguro?',
        text: "Se compartirán todas las Pólizas de Colectividad a los correos asignados a un usuario de la App",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, estoy seguro.",
        cancelButtonText: "Cancelar",
        closeOnConfirm: true
      },
      function(isConfirm) {
        if (isConfirm) {
          var data_email = {
            id_poliza: caratula,
            is_owner: false,
            active: true
          }
          dataFactory.post('shareToAppPC/', data_email).then(function success(req) {
              if (req.status == 200 || req.status == 201){
                SweetAlert.swal("¡Listo!", "Se han Compartido a la APP", "success")
              }else{
                SweetAlert.swal("Error", "Ha ocurrido un error al compartir Pólizas de Colectividad de la Carátula", "error")
              }
          });
        }
      });
    }

    $scope.shareCertificatesEmail = function(caratula) {
      SweetAlert.swal({
        title: '¿Está seguro?',
        text: "Se compartirán todas las Pólizas de Colectividad al Correo Electrónico designado",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, estoy seguro.",
        cancelButtonText: "Cancelar",
        closeOnConfirm: true
      },
      function(isConfirm) {
        if (isConfirm) {
          var data_email = {
            id_poliza: caratula,
            is_owner: false,
            active: true
          }
          dataFactory.post('shareToEmailPC/', data_email).then(function success(req) {
              if (req.status == 200 || req.status == 201){
                SweetAlert.swal("¡Listo!", "Se han compartodo vía Email", "success")
              }else{
                SweetAlert.swal("Error", "Ha ocurrido un error al compartir Pólizas de Colectividad de la Carátula", "error")
              }
          });
        }
      });
    }

    $scope.getState = function(value){
      if(value == 1){
        return 'Aguascalientes';
      }else if(value == 2){
        return 'Baja California';
      }else if(value == 3){
        return 'Baja California Sur';
      }else if(value == 4){
        return 'Campeche';
      }else if(value == 5){
        return 'Chiapas';
      }else if(value == 6){
        return 'Chihuahua';
      }else if(value == 7){
        return 'Coahuila';
      }else if(value == 8){
        return 'Colima';
      }else if(value == 9){
        return 'Ciudad de México';
      }else if(value == 10){
        return 'Durango';
      }else if(value == 11){
        return 'Estado de México';
      }else if(value == 12){
        return 'Guanajuato';
      }else if(value == 13){
        return 'Guerrero';
      }else if(value == 14){
        return 'Hidalgo';
      }else if(value == 15){
        return 'Jalisco';
      }else if(value == 16){
        return 'Michoacán';
      }else if(value == 17){
        return 'Morelos';
      }else if(value == 18){
        return 'Nayarit';
      }else if(value == 19){
        return 'Nuevo León';
      }else if(value == 20){
        return 'Oaxaca';
      }else if(value == 21){
        return 'Puebla';
      }else if(value == 22){
        return 'Querétaro';
      }else if(value == 23){
        return 'Quintana Roo';
      }else if(value == 24){
        return 'San Luis Potosí';
      }else if(value == 25){
        return 'Sinaloa';
      }else if(value == 26){
        return 'Sonora';
      }else if(value == 27){
        return 'Tabasco';
      }else if(value == 28){
        return 'Tamaulipas';
      }else if(value == 29){
        return 'Tlaxcala';
      }else if(value == 30){
        return 'Veracruz';
      }else if(value == 31){
        return 'Yucatán';
      }else if(value == 32){
        return 'Zacatecas';
      }else{
        return '';
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
      // var url = $location.path();
      // if(url.indexOf("editar") > -1)
      // {
      //   $scope.directiveReceipts.is_edit = true;
      // } else {
      //   $scope.directiveReceipts.is_edit = false;
      // }
      if (!$localStorage.saved_flotilla_info){
        $localStorage.saved_flotilla_info = {};
      }
      $scope.directiveReceipts.canCreate= false;
      insuranceService.getInsuranceRead($stateParams)
      .then(function(response){
        $scope.caratula = response;
        $scope.dataCaratula=response;
        if($scope.caratula.ref_policy){
          $scope.caratula.ref_policy.forEach(function(refs) {
            $http.get(refs.referenciador).then(function success(response_ref_plicy) {
              if(response_ref_plicy){
                refs.data = response_ref_plicy.data
              }
            })
          });
        }
        $http.get(url.IP + 'usuarios/')
        .then(function(user){
          $scope.users = user.data.results;
          $scope.usersLay = user.data.results;
        });

        dataFactory.get('sucursales-to-show/')
        .then(function success(response){
          if(response.status === 200 || response.status === 201){
            $scope.sucursales = response.data.results;
            $scope.sucursalLay = response.data.results;
          }
        })
        .catch(function(e){
          console.log('error', e);
        });

        var url_aux = url.IP + 'contractors-resume-medium/' + $scope.caratula.contractor + '/';
          
        $http({method: 'GET', url: url_aux}) 
        .then(
        function success(response) {
          $scope.contratante = response.data;
          // if ($scope.caratula.natural) {
          //   $scope.contratante.direccion = $scope.caratula.address;
          // } else if ($scope.caratula.juridical) {
          //   $scope.contratante.direccion = $scope.caratula.address;
          // }            
          if($scope.contratante.grouping_level){
            $http.get(url.IP + 'groupinglevel/' + $scope.contratante.grouping_level)
            .then(function(response) {
              $scope.contratante.grouping_level = response.data.description;
            });
          }

          if($scope.contratante.subgrouping){
            $http.get(url.IP + 'groupinglevel/' + $scope.contratante.subgrouping)
            .then(function(response) {
              $scope.contratante.subgrouping = response.data.description;
            });
          }

          if($scope.contratante.subsubgrouping){
            $http.get(url.IP + 'groupinglevel/' + $scope.contratante.subsubgrouping)
            .then(function(response) {
              $scope.contratante.subsubgrouping = response.data.description;
            });
          }
          $scope.contratante.direccion = $scope.caratula.address;
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

        if($scope.caratula.celula){
          $http.get($scope.caratula.celula)
          .then(function(response) {
            $scope.celula = response.data.celula_name;
          });
        }

        $scope.getComments();
        $scope.allCertificates(1);
        $scope.showItemCertificate(1);

        $scope.existeNueva =false;
        $http({
          method: 'GET',
          url: url.IP + 'historic-policies/',
          params: {
            actual_id: $scope.caratula.id
          }
        })
        .then(function success(response) {
          $scope.policy_history = [];
          if(response.data.results.length){
            response.data.results.forEach(function function_name(old, index) {
              if($scope.caratula.id != old.base_policy.id){
                $scope.policy_history.push(old.base_policy);
                if(index == 0){
                  $scope.copy_policy_history = angular.copy(old.base_policy); 
                  $scope.caratula_renovada = $scope.copy_policy_history.id
                }
              }else if(old.new_policy){
                $scope.policy_history.push(old.new_policy);
                $scope.existeNueva =true;
              }
            });
          }
        })
        .catch(function (e) {
          console.log('error - caratula - catch', e);
        });
        // contratante*************
        var myInsuranceContractor = $stateParams.dataContractor;
        if(myInsuranceContractor && myInsuranceContractor.url){
          var contrac = {};
          $scope.createIndividualCertificate();
        }
        // !!********************************+!!
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
        activate();
      }, function () {
       console.info('modal closed');
     });
    }
    $scope.incompleteCollective = function(){
      $scope.incompleteOT = {
        complete: true,
        caratule: [],
        certificates: []
      };

      if(!$scope.caratula.poliza_number){
        var item = {
          text: 'Agregar No. de Póliza.'
        }
        $scope.incompleteOT.caratule.push(item);
        $scope.incompleteOT.complete = false;
      }

      if($scope.categorySelected.certificates.length == 0){
        var item = {
          text: 'Agregar Pólizas.'
        }
        $scope.incompleteOT.certificates.push(item);
        $scope.incompleteOT.complete = false;
      }
    };

    $scope.editCollective = function(param){
      $state.go('flotillas.edit', {polizaId: $scope.caratula.id});
    };
    $scope.renovarPolizaRehabilitate = function(polizareh){
      $scope.date1 = datesFactory.convertDate(datesFactory.toDate(datesFactory.convertDate(polizareh.end_of_validity)))
      if(process($scope.date1) < process(datesFactory.convertDate(new Date()))){
        $scope.status_nuevo = 13
      }else if(process($scope.date1) > process(datesFactory.convertDate(new Date()))){
        $scope.status_nuevo = 14
      }else{
        $scope.status_nuevo = polizareh.status
      }
      function process(date){
        var parts = date.split("/");
        var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
        return date.getTime();
      }
      SweetAlert.swal({
          title: "Actualización de Póliza Colectividad para Renovación",
          text: "Los cambios se aplicarán en la Póliza "+ polizareh.poliza_number,
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Confirmar",
          cancelButtonText: "Cancelar",
          closeOnConfirm: true,
          closeOnCancel: false
      },
      function(isConfirm){
        if (isConfirm) {
          $http.patch(polizareh.url,{'status': $scope.status_nuevo})
          .then(upgPolicyComplete)
          .catch(upgPolicyFailed);
          function upgPolicyComplete(response, status, headers, config) {
            if(response.status === 200 || response.status === 201){
              SweetAlert.swal("¡Listo!", MESSAGES.OK.UPGRADEPOLICY, "success");
              var params = {
                'model': 1,
                'event': "POST",
                'associated_id': polizareh.id,
                'identifier': "actualizo la Póliza Colectividad para ser renovada "
              }
              dataFactory.post('send-log/', params).then(function success(response) {    });
              setTimeout(function(){
                location.reload();
              }, 1500);
              }
          }
          function upgPolicyFailed(response, status, headers, config) {
              return response;
          }
        } else {
          SweetAlert.swal("Cancelado", "La póliza no se ha afectado", "error");
        }
      });
    }
    $scope.renovarPoliza = function(polizaren){
      if(!$scope.caratula.nueva){        
        SweetAlert.swal("Error", "La carátula debe estar Renovada con póliza Posterior Vigente", "error");
        return;
      }
      if($scope.caratula.status!=12){        
        SweetAlert.swal("Error", "La carátula debe estar Renovada con póliza posterior vigente", "error");
        return;
      }
      $scope.show_certificado=false;
      $scope.show_showReceiptCertificate=false;
      $scope.isEdit=false;
      $scope.isRenewal=true;
      $scope.show_renewal_certificate=true;
      $scope.polizaaRenovar=polizaren;
      var item=polizaren;
      $scope.directiveReceipts.is_edit = false;
      $scope.originCertificate = []
      $scope.newCertificate = item;
      $scope.newCertificate.poliza_number = '';
      $scope.dataToSave.recalcular = true;

      $scope.dataToSave.poliza = {
        primaNeta: 0,
        rpf: 0,
        derecho: 0,
        subTotal: 0,
        iva: 0,
        primaTotal: 0
        // primaNeta: parseFloat(item.p_neta),
        // rpf: parseFloat(item.rpf),
        // derecho: parseFloat(item.derecho),
        // subTotal: parseFloat(item.sub_total),
        // iva: parseFloat(item.iva),
        // primaTotal: parseFloat(item.p_total)
      };
      $scope.dataToSave.receipts = [];
      // item.recibos_poliza.forEach(function(receipt){
      //   if(receipt.receipt_type == 1){
      //     receipt.fecha_inicio = datesFactory.convertDate(receipt.fecha_inicio);
      //     receipt.fecha_fin = datesFactory.convertDate(receipt.fecha_fin);
      //     receipt.vencimiento = datesFactory.convertDate(receipt.vencimiento);
      //     if(receipt.status != 'Pendiente de pago'){
      //       $scope.dataToSave.recalcular = false;
      //     }
      //     $scope.dataToSave.receipts.push(receipt);
      //   }
      // });
      $http.post(url.IP + 'paquetes-data-by-subramo/',
      {'ramo': item.ramo.id, 'subramo': item.subramo.id, 'provider': item.aseguradora ? item.aseguradora.id : $scope.caratula.aseguradora.id})
      .then(function success(response){
        if(response.status === 200) {
          $scope.packages = [];
          if(response.data.length) {
            $scope.packages = response.data;
            $scope.packages.forEach(function(pack){
              if(pack.id == $scope.newCertificate.paquete.id){
                $scope.newCertificate.paquete = pack;
              }
            });
          }
        }
      })
      .catch(function (error) {
        console.log('error', e);
      });
      if($scope.newCertificate.start_of_validity.indexOf('-') != -1){
        $scope.newCertificate.start_of_validity = datesFactory.convertDate($scope.caratula.nueva.start_of_validity);
      }
      if($scope.newCertificate.end_of_validity.indexOf('-') != -1){
        $scope.newCertificate.end_of_validity = datesFactory.convertDate($scope.caratula.nueva.end_of_validity);
      }
      order.contratante = {};
      order.contratante.val = item.contractor.full_name;
      order.contratante.value = item.contractor;
      $scope.frequencies.forEach(function(item){
        if(item.value == $scope.newCertificate.forma_de_pago){
          $scope.newCertificate.forma_de_pago = item;
        }
      });
      $scope.renewals.forEach(function(item){
        if(item.value == $scope.newCertificate.is_renewable){
          $scope.newCertificate.is_renewable = item;
        }
      });
      $scope.businessline.forEach(function(item){
        if(item.id == $scope.newCertificate.business_line){
          $scope.newCertificate.business_line = item;
        }
      });
      if($scope.newCertificate.sucursal){
        $scope.sucursales.forEach(function(item){
          if(item.id == $scope.newCertificate.sucursal.id){
            $scope.newCertificate.sucursal = item;
          }
        });
      }
      if($scope.newCertificate.responsable){
        $scope.users.forEach(function(item){
          if(item.id == $scope.newCertificate.responsable.id){
            $scope.newCertificate.responsable = item;
          }
        });
      }
      if($scope.newCertificate.automobiles_policy.length){
        $scope.types.forEach(function(item){
          if(item.id == $scope.newCertificate.datos.policy_type){
            $scope.newCertificate.datos.policy_type = item;
          }
        });
        $scope.usages.forEach(function(item){
          if(item.value == $scope.newCertificate.datos.usage){
            $scope.newCertificate.datos.usage = item;
          }
        });
        $scope.procedencias.forEach(function(item){
          if(item.value == $scope.newCertificate.datos.procedencia){
            $scope.newCertificate.datos.procedencia = item;
          }
        });
      }
      if($scope.newCertificate.state_circulation){
        $scope.statesArray.forEach(function(item){
          if(item.id == parseInt($scope.newCertificate.state_circulation)){
            $scope.newCertificate.state_circulation = item;
          }
        });
      }
      $scope.directiveReceipts.payment = $scope.newCertificate.forma_de_pago;
      $scope.directiveReceipts.subramo = item.subramo;
      $scope.copy_inicio = angular.copy($scope.newCertificate.start_of_validity);
      $scope.copy_fin = angular.copy($scope.newCertificate.end_of_validity);
      $scope.checkDate($scope.copy_inicio);
      $scope.checkEndDate($scope.copy_fin);
    }
    $scope.reActivatePolicy = function(id, poliza_number){
      var modalInstance = $uibModal.open({
        templateUrl: 'app/polizas/polizas.rehabilitar.html',
        controller: ReActivatePolicyCtrl,
        controllerAs: 'vmm',
        size: 'md',
        resolve:{
          idInsurance: function() {
            return id;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });

      modalInstance.result.then(function(response) {
        $http.post(url.IP + 'rehabilitar-poliza/', response).then(function(response_rehabilitar){
          console.log('response_rehabilitar', response_rehabilitar);
          
          
          var params = {
            'model': 1,
            'event': "POST",
            'associated_id': id,
            'identifier': poliza_number ? "reactivó la póliza." : "reactivó la OT."
          }
          dataFactory.post('send-log/', params)
          toaster.success('Se rehabilitó la póliza correctamente');

          setTimeout(function(){
            location.reload();
          }, 1500);
          
        }, function(error){
          console.log('Error al rehabilitar ', error);
          toaster.error('ocurrión un error al rehabilitar la póliza');
        }).catch(function(error){
          console.log('Error al rehabilitar ', error);
          toaster.error('ocurrión un error al rehabilitar la póliza');
        });
      });

    }
    $scope.renovarConPolicy = function(id, poliza_number,completa){
      var modalInstance = $uibModal.open({
        templateUrl: 'app/flotillas/renovarcon.html',
        controller: RenovarconPolicyCtrl,
        controllerAs: 'vmm',
        size: 'lg',
        resolve:{
          idInsurance: function() {
            return id;
          },
          completa: function(){
            return completa;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });

      modalInstance.result.then(function(response) {
        /* Actualiza la póliza antigua */
        var data = {
          status: 12,
          renewed_status: 1
        }
        $http.patch(completa.url, data)
        .then(function(resp){
          console.log('result-renovacion patch--',resp)
          /* Relación con la póliza original */
          if(completa.poliza_number){
            var oldPolicy = {
              policy: completa.poliza_number,
              base_policy: completa.url,
              new_policy: response.idpoliza.url
            }
          }else{
            var oldPolicy = {
              base_policy: completa.url,
              new_policy: response.idpoliza.url
            }
          }
          $http.post(url.IP + 'v1/polizas/viejas/', oldPolicy)
          .then(function(res){
            console.log('---rsp historico--',res)
          })
          .catch(function(e){
            l.stop();
            console.log('error - flotilla ren poliza ind- catch', e);
          });

          var params = {
            'model': 1,
            'event': "POST",
            'associated_id': completa.id,
            'identifier': completa.poliza_number ? " renovó la póliza." : " renovo la OT."
          }
          dataFactory.post('send-log/', params).then(function success(response){

          });
          SweetAlert.swal('¡Listo!', 'Renovación creada exitosamente.', 'success');
        })
        .catch(function(e){
          l.stop();
          console.log('error - flotilla rencon- catch', e);
        });
        $state.reload()
      });

    }
    function RenovarconPolicyCtrl($scope, $uibModalInstance, idInsurance,completa) {
      $scope.polizaarenovar = completa
      $scope.buttonDisabled = true;
      $scope.mostrar_alerta = false;
      $scope.motivo_rehabilitacion = '';
      $scope.reActivatePolicy = function(polizaSelected){
        $uibModalInstance.close({'idpoliza': polizaSelected,'id':idInsurance});
      }

      $scope.findPolicy = function (parValue) {
        if (parValue) {
          if (parValue.val.length >= 3) {
            $scope.urlrc = 'get-policies-ind-flotillas/';
            dataFactory.post($scope.urlrc, {word: parValue.val})
            .then(function success (request) {
              var results = [];
              results = _.map(request.data, function(item) {              
                var label = item.poliza_number + ' - ' + datesFactory.convertDate(item.start_of_validity) + ' - ' + datesFactory.convertDate(item.end_of_validity);
                return {
                  label: label,
                  value: item.poliza_number,
                  id: item.id,
                  url:item.url
                }
              });
              $scope.autocompleteData = results;
            }, function error (error) {

            })
            .catch(function(e) {
              console.log('e', e);
            });
          }
        }
      };
      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      };
    }
    function ReActivatePolicyCtrl($scope, $uibModalInstance, idInsurance, dataFactory) {

      $scope.buttonDisabled = true;
      $scope.mostrar_alerta = false;
      $scope.motivo_rehabilitacion = '';
      $scope.reActivatePolicy = function(){
        $uibModalInstance.close({'motivo_rehabilitacion': $scope.motivo_rehabilitacion,'id':idInsurance});
      }
      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      };
    }

    $scope.gotoRenewal = function(param){
      $state.go('flotillas.renewal', {polizaId: $scope.caratula.id});
    };

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

    $scope.getComments = function(){
      $http({
        method: 'GET',
        url: url.IP + 'comments/',
        params: {
          'model': 1,
          'id_model': $scope.caratula.id
        }
      })
      .then(function(response){
        $scope.comments_data = response.data.results;
        $scope.comments_config = {
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous
        };
        $http({
          method: 'GET',
          url: url.IP + 'comments/',
          params: {
            'model': 28,
            'id_model': $scope.caratula.id
          }
        })
        .then(function(response){
          if(response.data.results){
            response.data.results.forEach(function(x){
              $scope.comments_data.push(x)
            })
          }
          $scope.comments_config = {
              count: response.data.count,
              next: response.data.next,
              previous: response.data.previous
          };
        })
        .catch(function(e){
          console.log('e', e);
        });
      })
      .catch(function(e){
        console.log('e', e);
      });
    };

    $scope.cancelPolicy = function(caratula){
      SweetAlert.swal({
        title: "Cancelar Colectividad",
        text: "Los cambios no podrán revertirse. ¿Está seguro?",
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
          var modalInstance = $uibModal.open({
            templateUrl: 'app/polizas/poliza.modal.html',
            controller: PolicyModalCtrl,
            controllerAs: 'vmm',
            size: 'md',
            resolve:{
              contractorModal: function(){
                return $scope.contratante;
              },
              urlInsurance: function() {
                return caratula.url;
              },
              receipts: function() {
                return [];
              },
              caratula: function() {
                return $scope.caratula;
              }
            },
            backdrop: 'static', /* this prevent user interaction with the background */
            keyboard: false
          });
          modalInstance.result.then(function(receipt) {
            $state.go('flotillas.info', { polizaId: myInsurance.id });
          });
          // $http.post(url.IP + 'cancel-caratula_polizas/', {'id': $scope.caratula.id,'document_type': 11})
          // .then(function(response){
          //   var params = {
          //     'model': 18,
          //     'event': "POST",
          //     'associated_id': $scope.caratula.id,
          //     'identifier': " canceló la colectividad."
          //   }

          //   dataFactory.post('send-log/', params).then(function success(response) {

          //   });

          //   activate();
          //   SweetAlert.swal("¡Listo!", "Carátula cancelada exitosamente.", "success");
          //   // $state.go('flotillas.info', {polizaId: $scope.caratula.id});
          // })
          // .catch(function(e){
          //   console.log('error', e);
          // });
         }else{
          SweetAlert.swal("Cancelado", "La colectividad no se ha cancelado", "error");
        }
      });
    };
    function PolicyModalCtrl($scope, contractorModal, $uibModalInstance, urlInsurance, receipts,caratula) {

      $scope.buttonDisabled = true;
      $scope.addnotasToCancel = true;
      $scope.addnotasToCancelF  = function(addnotas){
        $scope.addnotasToCancel = addnotas;
      }
      $scope.optionsCancel = [
        // {'value': 3, 'label': 'Cancelación definitiva'}
        {'value': 3, 'label': 'Cancelación definitiva - A petición'},
        {'value': 4, 'label': 'Cancelación definitiva - Falta de pago'}
      ];
      $scope.date_cancel = datesFactory.convertDate(new Date());
      $scope.checkCancelDate = function(dat){
        $scope.date_cancel = dat;
      }

      $scope.cancelPolicy = function(option,reason,date){
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        if (option.value == 3 || option.value == 4){
          if (date) {
            date = datesFactory.toDate(date);
          }else{
            date = new Date();
          }
          $http.patch(urlInsurance, {status: 11,reason_cancel: option.label +' // ' +reason, date_cancel: date, cancelnotas: $scope.addnotasToCancel})
          .then(function(data) {
            caratula.status = data.data.status; 
            $http.post(url.IP + 'cancel-caratula_polizas/', {'id': caratula.id,'document_type': caratula.document_type,'cancelnotas':$scope.addnotasToCancel})
            .then(function(response){
              if (caratula.document_type ==11) {
                var params = {
                  'model': 18,
                  'event': "POST",
                  'associated_id': caratula.id,
                  'identifier': " canceló la colectividad."
                }
              }else{
                var params = {
                  'model': 1,
                  'event': "POST",
                  'associated_id': caratula.id,
                  'identifier': " canceló la póliza individual."
                }
              }             

              dataFactory.post('send-log/', params).then(function success(response) {

              });

              activate();
              SweetAlert.swal("¡Listo!", "Carátula cancelada exitosamente.", "success");
            })
            .catch(function(e){
              console.log('error', e);
            });
            l.stop();
            activate();
            $uibModalInstance.dismiss('cancel');
            swal("Hecho", "Se ha cancelado definitivamente la Carátula", "success");
          });
        }
      };

      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      };
    }
    $scope.cancelPolicyC = function(polizac){
      SweetAlert.swal({
        title: "¿Está seguro?",
        text: "Los cambios no podrán revertirse",
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
          var modalInstance = $uibModal.open({
            templateUrl: 'app/polizas/poliza.modal.html',
            controller: PolicyModalCtrl,
            controllerAs: 'vmm',
            size: 'md',
            resolve:{
              contractorModal: function(){
                return $scope.contratante;
              },
              urlInsurance: function() {
                return polizac.url;
              },
              receipts: function() {
                return [];
              },
              caratula: function() {
                return polizac;
              }
            },
            backdrop: 'static', /* this prevent user interaction with the background */
            keyboard: false
          });
          modalInstance.result.then(function(receipt) {
            $state.go('flotillas.info', { polizaId: myInsurance.id });
          });
          // $http.post(url.IP + 'cancel-caratula_polizas/', {'id': polizac.id,'document_type': 12})
          // .then(function(response){

          //   var params = {
          //     'model': 1,
          //     'event': "POST",
          //     'associated_id': polizac.id,
          //     'identifier': " actualizó la póliza individual."
          //   }

          //   dataFactory.post('send-log/', params).then(function success(response) {

          //   });
              
          //   SweetAlert.swal("¡Listo!", "Póliza de carátula cancelada exitosamente.", "success");
          //   polizac.status = 11;
          // })
          // .catch(function(e){
          //   console.log('error', e);
          // });
         }else{
          SweetAlert.swal("Cancelado", "La Póliza de Carátula no se ha cancelado", "error");
        }
      });
    };

    $scope.cancelRenewal = function(poliza) {
      swal({
        title: "No renovar",
        text: "Motivo:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
      }, function (inputValue) {
        if (inputValue === false) return false;
        if (inputValue === "") {
          swal.showInputError("Necesita especificar un motivo");
          return false
        }
        var data = {
          reason_ren: inputValue,
          status: 15
        }
        $http.patch($scope.certificate.url, data).then(function(ren) {
            var params = {
              'model': 1,
              'event': "PATCH",
              'associated_id': $scope.certificate.id,
              'identifier': " cambio el estatus a no renovada por el motivo "+ren.data.reason_ren+" de la póliza "+ ren.data.poliza_number+"."
            }
            dataFactory.post('send-log/', params).then(function success(response) {

            });
        });
        $scope.certificate.status = 15;
        $scope.certificate.reason_ren = inputValue;
        activate()
        swal("Hecho", "La póliza se ha cerrado y no se vera más en el listado de renovaciones.", "success");
      });
    };

    $scope.assignPolicy = function(id, certificate){
      var modalInstance = $uibModal.open({
        templateUrl: 'app/polizas/polizas.assign.html',
        controller: assignModalView,
        controllerAs: 'vmm',
        size: 'lg',
        resolve: {
            policy_id: function() {
                return id;
            },
            contratante: function() {
                return $scope.contratante;
            }, 
            contractor:function(){
              return certificate.contractor;
            }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });

      function assignModalView($scope, $uibModalInstance, policy_id, url, contratante, contractor){
        $scope.email = contractor.email;
        $scope.soloEmail=true;
        $scope.tipopoliza='Póliza'
        var vmm = this;
        var share_via_email = [];
        var share_via_email_r = [];
        vmm.is_owner = false;
        vmm.email_assign_mail = "";
        vmm.custom_email = true;
        vmm.htmlVariable = "";
        vmm.first_comment = "";
        vmm.second_comment = "";
        vmm.correos=[]
        $scope.send = true;
        $http.post(url.IP + 'get-assign/', {'poliza': id}).then(function success (response) {
          $scope.people_assigned = response.data
          $scope.owner_exist = true;
          $scope.people_assigned.some(function(people){
            if(people.is_owner == true){
              $scope.owner_exist = false;
              return;
            }
          });
        }, function error (err) {

        }).catch(function(e) {

        });
        $scope.showEmailInInput = function(correo,index){
          $scope.email_assign = correo;
        };

        $scope.emails = [];

        dataFactory.get('emailtemplate-unpag/',{'template_model':2,'id_policy':policy_id})
        .then(function success(response) {
          $scope.plantillas = response.data;
        })
        $scope.emptySubject = function(v){
          if(vmm.subjectEmail =='' || vmm.subjectEmail==undefined){
            vmm.subjectEmail = vmm.subjectDefault;
          }
        }
        $scope.changePlantilla = function(item){
          if(item){
            vmm.subjectEmail = item.title;
            vmm.first_comment = item.text;
            if(vmm.first_comment.includes('\n')){
              vmm.first_comment = vmm.first_comment.replace('\n', '<br><br>')
            }
            vmm.second_comment = item.bottom_text;
            vmm.custom_email = true;
            $scope.getTemplate(true);
          }else{
            vmm.subjectEmail = "";
            vmm.first_comment = "";
            vmm.second_comment = "";
            vmm.custom_email = true;
            $scope.getTemplate(true);
          }
        };
        $scope.addEmail = function(email){
          if (validateEmail(email) == false ){
            SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
            return;
          }
          else{
            if ($scope.emails.indexOf(email)<0){
              $scope.emails.push(email);
            } else {
              SweetAlert.swal("ERROR", MESSAGES.ERROR.REPEATEMAIL, "error");
            } 
            vmm.email_assign_mail = "";
          }
        };
        $scope.remove_email = function(index){
          $scope.emails.splice(index,1);
        }



        if (contratante.full_name) {
          var name_contractor = contratante.full_name
          $http.post(url.IP + 'contractors-contact/',
          {
              'name': name_contractor
          }).then(function(response) {
              if(response.status === 200 ) {
                vmm.correos = response.data.contact
              }
          });
        }


        $scope.getTemplate = function(custom_email) {
          if (custom_email){
            $http.get(url.IP+'share-policy-manual/'+ policy_id)
            .then(function(response) {
              if(response.status === 200){
                vmm.head = response.data.head;
                vmm.body = response.data.body;
                vmm.footer = response.data.footer;
                vmm.subjectDefault = response.data.subject_default;
                if(vmm.subjectEmail =='' || vmm.subjectEmail==undefined){
                  vmm.subjectEmail = vmm.subjectDefault;
                }
              }
            }
            )
            .catch(function(e) {
              console.log('error - catch', e);
            });
          } else {
            vmm.htmlVariable = "";
            vmm.first_comment = "";
            vmm.second_comment = "";
          }
        };
        $scope.emptySubject = function(v){
          if(vmm.subjectEmail =='' || vmm.subjectEmail==undefined){
            vmm.subjectEmail = vmm.subjectDefault;
          }
        }
        $scope.sendEmail = function(receipt) {
          $scope.send= false;
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          var data_shared = {'id': policy_id, 'emails': $scope.emails, 'files':share_via_email, 'files_r':share_via_email_r,'first_comment':vmm.first_comment, 'second_comment':vmm.second_comment, 'model': 1, 'custom_email':vmm.custom_email}
          $http.post(url.IP+'share-policy-manual/', data_shared)
          .then(
            function success(request) {
              if(request.status === 200 || request.status === 201) {
                SweetAlert.swal("¡Listo!", MESSAGES.OK.POLICYSEND, "success");
                $scope.send= true;
                var params = {
                  'model': 1,
                  'event': "POST",
                  'associated_id': policy_id,
                  'identifier': "compartió la póliza por email.",
                  'save_logmail': 1
                }
                dataFactory.post('send-log/', params).then(function success(response) {

                });
                $uibModalInstance.dismiss('cancel');
              } else {
                $scope.send= true;
                l.stop();
                SweetAlert.swal("ERROR", request.data.status, "error");
              }
            },
            function error(error) {
              console.log('error - email', error);
            }
          )
          .catch(function(e) {
            console.log('error - catch', e);
          });
        };

        $scope.deleteEmail = function(email){
          $http({
            method: 'GET',
            url: url.IP + 'delete-assign/',
            params: {
                'id': email.id,
            }
          })
          .then(function(request) {
            $scope.people_assigned.splice($scope.people_assigned.indexOf(email), 1);
            assignModalView($scope,$uibModalInstance,vm.insurance.id,url);
          })
          .catch(function(e) {
            console.log('e', e);
          });
        };
        $scope.accesos = $sessionStorage.permisos
        if($scope.accesos){
          $scope.accesos.forEach(function(perm){
            if(perm.model_name == 'Archivos'){
              $scope.acceso_files = perm
              $scope.acceso_files.permissions.forEach(function(acc){
                if (acc.permission_name == 'Administrar archivos sensibles') {
                  if (acc.checked == true) {
                    $scope.permiso_archivos = true
                  }else{
                    $scope.permiso_archivos = false
                  }
                }
                if (acc.permission_name == 'Administrar adjuntos') {
                  if (acc.checked == true) {
                    $scope.permiso_administrar_adjuntos = true
                  }else{
                    $scope.permiso_administrar_adjuntos = false
                  }
                }
              })
            }
          })
        }
        if ($scope.permiso_administrar_adjuntos) {
          $http.get(url.IP + 'polizas/'+ policy_id +'/archivos/').then(function(response) {
            $scope.files = response.data.results
            $scope.files.forEach(function(file) {
              file['to_send'] = false;
              file['origin'] = 'P';
            });
            $http.post(url.IP + 'get-recibos-files/',{'poliza_id':policy_id}).then(function(response) {
              $scope.recibos_file = response.data;
              $scope.recibos_file.forEach(function(file_r) {
                file_r['origin'] = 'R';
                $scope.files.push(file_r);
              })
              $scope.files.forEach(function(file) {
                file['to_send'] = false;
              });
            });
          });
        }

        $scope.shareFileEmail = function(file) {
          if(file.to_send){
            file.to_send = false;
          }
          else{
            file.to_send = true;
          }
          share_via_email = [];
          share_via_email_r = [];
          $scope.files.forEach(function(filex) {
            if(filex.to_send && filex.origin=='P'){
              share_via_email.push(filex.id)
            }
            if(filex.to_send && filex.origin=='R'){
              share_via_email_r.push(filex.id)
            }
          });
        }

        $scope.shareFile = function(file) {
          $http.get(url.IP+'patch-policy-file/'+file.id)
            .then(function(response) {
              $scope.files.some(function(filex) {
                if(filex.id == response.data.id){
                  filex.shared = response.data.shared;
                }
              })
              $scope.files[file] = response.data;
              // $scope.shared = response.data.shared;
            })
        }


        $scope.assignPolicy = function (email) {
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          if (validateEmail(email) == false ){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
            return;
          }
          var assign ={
            is_owner: vmm.is_owner,
            active: true,
            poliza: policy_id,
            email: email
          }
          $http.post(url.IP+'assign-pendient/',assign).then(function(response) {
            if(response.status === 200 || response.status === 201){
              if (response.data.type == 1){
                l.stop();
                SweetAlert.swal("Advertencia", MESSAGES.INFO.POLICYASSIGNED, "warning");
                var params = {
                  'model': 1,
                  'event': "POST",
                  'associated_id': policy_id,
                  'identifier': "compartió la póliza por app."
                }
                dataFactory.post('send-log/', params).then(function success(response) {
                });
              }
              else{
                SweetAlert.swal("¡Listo!", MESSAGES.INFO.POLICYPENDIENT, "success");
                var params = {
                  'model': 1,
                  'event': "POST",
                  'associated_id': policy_id,
                  'identifier': "compartió la póliza por app."
                }
                dataFactory.post('send-log/', params).then(function success(response) {

                });
              }
            }
          })
          $uibModalInstance.dismiss('cancel');
        };

        function validateEmail(email) {
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(email);
        }

        $scope.cancel = function () {
        if($uibModalInstance)
            $uibModalInstance.dismiss('cancel');
        };
      }
    };

    $scope.deletePolicy = function(){
      SweetAlert.swal({
        title: "Eliminar Colectividad",
        text: "Los cambios no podrán revertirse, ¿Está seguro?",
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
          $http.post(url.IP + 'delete-colectivity/', {'id': $scope.caratula.id})
          .then(function(response){
            if($scope.copy_policy_history){
              if($scope.copy_policy_history.url){
                if(process(datesFactory.convertDate($scope.copy_policy_history.start_of_validity)) > process(datesFactory.convertDate(new Date()))){
                  var data = {
                    status: 10,
                    renewed_status: 0
                  }
                }else{
                  if(process(datesFactory.convertDate($scope.copy_policy_history.end_of_validity)) > process(datesFactory.convertDate(new Date()))){
                    var data = {
                      status: 14,
                      renewed_status: 0
                    }
                  }else{
                    var data = {
                      status: 13,
                      renewed_status: 0
                    }
                  }
                }
                function process(date){
                  var parts = date.split("/");
                  var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
                  return date.getTime();
                }
                $http.patch($scope.copy_policy_history.url, data)
                .then(function success(request){
                  if(request.status === 200){
                    var paramsRec = {
                      'model': 18,
                      'event': "PATCH",
                      'associated_id': $scope.copy_policy_history.id,
                      'identifier':" eliminó la renovación."
                    }
                    dataFactory.post('send-log/', paramsRec).then(function success(response){

                    });
                  }
                })
                .catch(function(e){
                  console.log('error', e);
                });
              }
            }
              
            SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETECOLLECTIVITY, "success");
            $state.go('polizas.table');
          })
          .catch(function(e){
            console.log('error', e);
          });
         }else{
          SweetAlert.swal("Cancelado", "La colectividad no se ha eliminado", "error");
        }
      });
    };

    $scope.goToPolicy = function(policy){
      if (policy.document_type ==11) {
        $state.go('flotillas.info', {polizaId: policy.id});
      }else if (policy.document_type ==12) {
        $state.go('flotillas.info', {polizaId: parseInt(policy.caratula)});
      }
    };

    $scope.getLog = function(){
      dataFactory.get('get-specific-log', {'model': 18, 'associated_id': $scope.caratula.id})
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
          vm.receipts.splice(index, 1);
          activate();
        });
      })
    };

    $scope.getLogCertificate = function(param){
      dataFactory.get('get-specific-log', {'model': 1, 'associated_id': param.id})
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
          vm.receipts.splice(index, 1);
          activate();
        });
      })
    };

    $scope.goToEndorsement = function(name, route,certificate){
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
      if (!$localStorage['save_filters_endoso_poliza']) {
        $localStorage['save_filters_endoso_poliza'] = {}
        $localStorage['save_filters_endoso_poliza']['poliza'] = certificate.poliza_number
        $localStorage['save_filters_endoso_poliza']['poliza_id'] = certificate.id        
      }else{        
        $localStorage['save_filters_endoso_poliza'] = {}
      }
      var params = {'myInsurance': $scope.certificate, 'contractor': $scope.contractorModal};
      $state.go($scope.route_for_new_tab, params)
    };

    $scope.showItemCertificate = function(value){
      switch(value){
        case 1:
          $scope.show_tableCertificate = true;
          $scope.show_infoCertificate = false;
          $scope.show_editCertificate = false;
          $scope.show_massCertificate = false;
          $scope.show_receiptCertificate = false;
          $scope.show_showReceiptCertificate = false;
          $scope.infoFlagCertificate = true;
          $scope.endorsementFlagCertificate = false;
          $scope.siniesterFlagCertificate = false;
          $scope.paqueteLay = undefined;
          $scope.sucursalLay = undefined;
          break;
        case 2:
          $scope.show_tableCertificate = false;
          $scope.show_infoCertificate = true;
          $scope.show_editCertificate = false;
          $scope.show_massCertificate = false;
          $scope.show_receiptCertificate = false;
          $scope.show_showReceiptCertificate = false;
          break;
        case 3:
          $scope.show_tableCertificate = false;
          $scope.show_infoCertificate = false;
          $scope.show_editCertificate = true;
          $scope.show_massCertificate = false;
          $scope.show_receiptCertificate = false;
          $scope.show_showReceiptCertificate = false;
          break;
        case 4:
          $scope.show_tableCertificate = false;
          $scope.show_infoCertificate = false;
          $scope.show_editCertificate = false;
          $scope.show_massCertificate = true;
          $scope.show_receiptCertificate = false;
          $scope.show_showReceiptCertificate = false;
          $http.get(url.IP + 'sucursales-to-show/')
          .then(function(reesp){
            $scope.sucursalesLay = reesp.data.results;
          });
          $scope.cancelCertificates();
          $scope.paqueteAll();
          break;
        case 5:
          $scope.show_tableCertificate = false;
          $scope.show_infoCertificate = false;
          $scope.show_editCertificate = false;
          $scope.show_massCertificate = false;
          $scope.show_receiptCertificate = true;
          $scope.show_showReceiptCertificate = false;

          $scope.calculateReceipts();
          break;
        case 6:
          $scope.show_tableCertificate = false;
          $scope.show_infoCertificate = false;
          $scope.show_editCertificate = false;
          $scope.show_massCertificate = false;
          $scope.show_receiptCertificate = false;
          $scope.show_showReceiptCertificate = true;

          $scope.showReceiptsCertificate();
          break;
        default:
          $scope.show_tableCertificate = true;
          $scope.show_infoCertificate = false;
          $scope.show_editCertificate = false;
          $scope.show_massCertificate = false;
      }
    }

    $scope.allCertificates = function(parPage){
      $scope.showItemCertificate(1);
      $scope.cadena = '';
      $scope.allExcel = true;
      $scope.categorySelected.id = $scope.caratula.id;
      $scope.categorySelected.is_category = 0;
      $scope.categorySelected.certificates = [];
      $http({
        method: 'POST',
        url: url.IP + 'get_caratula_polizas/',
        data: {
          caratula: $scope.caratula.id
        }
      })
      .then(function success(response){
        if(response.status == 200){
          $scope.dataCaratula = response.data.data.caratula;

          $http({
            method: 'GET',
            url: url.IP + 'certificados-caratula/',
            params: {
              caratula: $scope.dataCaratula.id,
              page: parPage ? parPage : 1
            }
          })
          .then(function(data) {
            $scope.categorySelected.certificates = data.data.results;
            $scope.categorySelected.config = {
              count: data.data.count,
              previous: data.data.previous,
              next: data.data.next
            };
            $scope.testPagination('categorySelected.certificates', 'categorySelected.config');
            if($scope.categorySelected.certificates.length > 0){
              $scope.getEndorsementSiniester();
            }
            $scope.categorySelected.certificates.forEach(function(item){
              if(item.life_policy.length){
                item.datos = angular.copy(item.life_policy[0]);
              }else if(item.accidents_policy.length){
                item.datos = angular.copy(item.accidents_policy[0]);
              }else if(item.automobiles_policy.length) {
                item.datos = angular.copy(item.automobiles_policy[0]);
              }else if(item.damages_policy.length) {
                item.datos = angular.copy(item.damages_policy[0]);
              }
            });
            $scope.incompleteCollective();
          })

        }else{
          SweetAlert.swal('Error', 'Ocurrió un error, por favor intenta de nuevo.', 'Error');
        }
      })
      .catch(function(e){
        console.log('error', e);
      });
    };
    $scope.cambiarReferenciador = function (data, poliza) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/polizas/referenciadores.modal.html',
        controller: ReferenciadorModalCtrl,
        controllerAs: 'vendedor',
        size: 'lg',
        resolve: {
          poliza: function() {
            return poliza;
          }, actual: function() {
            return data.data;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });
      modalInstance.result
      .then(function (response) {        
        activate();
      }, function () {       
        activate();
        console.info('modal closed');
      });
    }
    function ReferenciadorModalCtrl(poliza, actual,$http,$rootScope,$uibModalInstance, dataFactory, SweetAlert,datesFactory,$localStorage,$scope){
      var vmm = this;
      $scope.referenciador_a_cambiar = actual;
      $scope.poliza_especifica = poliza;
      $scope.comisionError2='';
      activate();
  
      function activate() {        
        // -------------------------Referenciadores
        dataFactory
        .get('get-vendors/')
        .then(function(user) {
          user.data.forEach(function(vn) {
            vn.first_name = vn.first_name.toUpperCase();
            vn.last_name = vn.last_name.toUpperCase();
            vn.name = vn.first_name + ' ' + vn.last_name;
          });
          $scope.referenciadores = user.data.filter(function(vn) {
            return vn.id !== actual.id;
          });
          $scope.ref_to_patch_policy=''
          $scope.ref_to_change_id=''
          poliza.ref_policy.filter(function(vn) {
            if(vn.referenciador == actual.url){
              $scope.ref_to_patch_policy =  vn.url;
              $scope.ref_to_change_id =  vn.id;
            }
          });
        });
  
      }
      $scope.validateComision = function() {
        // if ($scope.comision_vendedor > 100) {
        //   $scope.comision_vendedor = 100;
        // } else if ($scope.comision_vendedor < 0) {
        //   $scope.comision_vendedor = 0;
        // }
        $scope.checkTotalComision2($scope.comision_vendedor)
      };

      $scope.checkTotalComision2 = function(valor) {
        var totalComision = poliza.ref_policy.reduce(function(sum, item) {
            if (item.id !== $scope.ref_to_change_id) {
                return sum + (parseFloat(item.comision_vendedor) || 0); 
            }
            return sum;
        }, 0);
        totalComision += parseFloat(valor);
        if (totalComision > 100) {
            $scope.comisionError2 = "La suma de las comisiones no puede superar el 100%";
            $scope.comision_vendedor = 0;
        } else {
            $scope.comisionError2 = '';
        }
        
      };
      $scope.cambiar = function(refe,comision) {
        var ref = {}
        ref.referenciador = refe.url
        ref.comision_vendedor = comision ? comision : 0
        ref.policy = poliza.url   
        ref.anterior = $scope.ref_to_change_id;   
        ref.is_changed = false   
        if(ref.referenciador){
          dataFactory.post('referenciadores-policy/',ref)
          .then(
            function success(response_ref_created){
              $scope.ref_cambiado = response_ref_created.data;
              console.log('response to create new ref***',response_ref_created)
              // set flat to last refer
              $http.patch($scope.ref_to_patch_policy, {'is_changed':true})
              .then(function(response_patch_ref_last){
                var params = {
                  'model': 1,
                  'event': "POST",
                  'associated_id': poliza.id,
                  'identifier': "cambio el Referenciador: "+$scope.referenciador_a_cambiar.first_name +" "+$scope.referenciador_a_cambiar.last_name+" por "+$scope.ref_cambiado.ref_name
                }
                dataFactory.post('send-log/', params).then(function success(response) {    });
                setTimeout(function(){
                }, 1500);
                $uibModalInstance.dismiss('cancel');
              })
              .catch(function(e){
                console.log('error', e);
              });
            },
            function error(error) {
              console.log(error);
            })
          .catch(function(e){
            console.log(e);
          });
          
        }else{
          console.log('___Sin referenciador__')
        }
      }  
      $scope.cancel = function() {
        if($uibModalInstance){
            $uibModalInstance.dismiss('cancel');
        }
      }
    }
    $scope.search = function(param){
      if(param){
        $scope.cadena = param;
        $scope.allExcel = false;
        $http({
          method: 'GET',
          url: url.IP + 'search-polizascaratula/',
          params: {
            cadena: param,
            parent: $scope.categorySelected.id,  
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
            $scope.testPagination('categorySelected.certificates', 'categorySelected.config');
            if($scope.categorySelected.certificates.length > 0){
              $scope.getEndorsementSiniester();
            }
            $scope.categorySelected.certificates.forEach(function(item){
              if(item.life_policy.length){
                item.datos = angular.copy(item.life_policy[0]);
              }else if(item.accidents_policy.length){
                item.datos = angular.copy(item.accidents_policy[0]);
              }else if(item.automobiles_policy.length) {
                item.datos = angular.copy(item.automobiles_policy[0]);
              }else if(item.damages_policy.length) {
                item.datos = angular.copy(item.damages_policy[0]);
              }
            });
          }else{
            SweetAlert.swal('Error', 'Ocurrió un error, por favor intenta de nuevo.', 'Error');
          }
        })
        .catch(function(e){
          console.log('error', e);
        });
      }else{
        $scope.allCertificates(1);
      }
    };

    $scope.testPagination = function(parModel, parConfig){
      var config_ = $parse(parConfig)($scope);

      if(config_){
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

      for(var i = 0; i < pages; i++){
        $scope.totalPages.push(i+1);
      }

      $scope.selectPage = function(parPage){
        var url = '';
        if(config_.next || config_.previous){
          if(config_.next) {
            var otherParameters = config_.next.substring(config_.next.indexOf("&page=") + 6);

            url = config_.next.substring(0, config_.next.indexOf("&page=") + 6);
            url += parPage.toString();

            if(config_.next.search('&') !== -1) {
              var params = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
              url += '&'+params;
            }

          }else{
            url = '';
            var otherParameters = config_.previous.substring(config_.previous.indexOf("&page=") + 6);

            if(config_.previous.search('&page=') !== -1){
              url = config_.previous.substring(0, config_.previous.indexOf("&page=") + 6);
              url += parPage.toString();
            }else{
              url = config_.previous;
            }

            if(config_.previous.search('&') !== -1) {
              var params = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
              url += '&'+params;
            }
          }
        }

        getProviders(url);
        $scope.actual_page = parPage;
        if($scope.actual_page > 1) {
          $scope.not_prev = false;
        }

        if($scope.actual_page == $scope.totalPages.length -1) {
          $scope.not_next = true;
        }

        $scope.allCertificates(parPage);
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
      };

      $scope.nextBlockPages = function(param){
        $scope.show_prev_block = true;
        if(param) {
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
          }else{
            $scope.not_next = true;
          }
        }
      };

      $scope.lastPage = function() {
        if($scope.totalPages.length > 5) {
          $scope.end = $scope.totalPages.length;
          $scope.start = ($scope.totalPages.length) -5;
          $scope.show_prev_block = true;
        }
        $scope.selectPage($scope.totalPages.length);
      };

      function getProviders(parUrl){
        $http.get(parUrl)
        .then(function success(response){
          var source = $parse(parModel);
          source.assign($scope, []);
          source.assign($scope, response.data.results);

          var data = {
            count: response.data.count,
            previous: response.data.previous,
            next: response.data.next
          }

          if($scope.categorySelected.certificates.length){
            $scope.categorySelected.certificates.forEach(function(item, index){
              var pagesCertificates = {
                policy: item.id
              }
              dataFactory.get('get-endosos-sinister/', pagesCertificates).then(function success(response){
                item.endosos = response.data.endosos;
                item.siniestros = response.data.siniestros;
              });

              if(item.life_policy.length){
                item.datos = angular.copy(item.life_policy[0]);
              }else if(item.accidents_policy.length){
                item.datos = angular.copy(item.accidents_policy[0]);
              }else if(item.automobiles_policy.length) {
                item.datos = angular.copy(item.automobiles_policy[0]);
              }else if(item.damages_policy.length) {
                item.datos = angular.copy(item.damages_policy[0]);
              }

            });
          }

          var config = $parse(parConfig);
            config.assign($scope, []);
            config.assign($scope, data);
          },
        function error(error) {
          console.log('error', error);
        })
        .catch(function(e) {
          console.log('e', e);
        });
      };
    };

    $scope.getEndorsementSiniester = function(){
      $scope.categorySelected.certificates.forEach(function(item, index){
        $http({
          method: 'GET',
          url: url.IP + 'get-endosos-sinister/',
          params: {
            policy: item.id
          }
        })
        .then(function success(response){
          item.endosos = response.data.endosos;
          item.siniestros = response.data.siniestros;
        })
        .catch(function(e){
          console.log('error', e);
        });

        if(item.life_policy.length){
          item.datos = angular.copy(item.life_policy[0]);
        }else if(item.accidents_policy.length){
          item.datos = angular.copy(item.accidents_policy[0]);
        }else if(item.automobiles_policy.length) {
          item.datos = angular.copy(item.automobiles_policy[0]);
        }else if(item.damages_policy.length) {
          item.datos = angular.copy(item.damages_policy[0]);
        }
      });
    };

    $scope.downloadExcel = function(parCategory, active) {
      $scope.filtros={
        is_category: $scope.categorySelected ? $scope.categorySelected.is_category : 0,
        parent: parCategory ? parCategory.id : $scope.caratula.id,
        active: $scope.statusActive,
        cadena: $scope.cadena ? $scope.cadena : ''
      }
      $http({
        method: 'POST',
      url: url.IP +'service_reporte-caratulapolizas-excel',
        data: $scope.filtros,
        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
        responseType: "arraybuffer"})
      .then(function(data, status, headers, config) {
        if(data.status == 200){
          var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
          saveAs(blob, 'Reporte_Polizas_Individuales_Colectividad.xls');
        } else {
          SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
        }
      });
    };

    $scope.downloadExcelAll = function(caratula, active) {
      $scope.filtros={
        // parent: caratula.id,
        // active: 3        
        is_category: $scope.categorySelected ? $scope.categorySelected.is_category : 0,
        parent: $scope.categorySelected ? $scope.categorySelected.id : $scope.caratula.id,
        active: $scope.statusActive,
        cadena: $scope.cadena ? $scope.cadena : ''
      }
      $http({
        method: 'POST',
        url: url.IP +'service_reporte-caratulapolizas-excel',
        data: $scope.filtros,
        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
        responseType: "arraybuffer"})
      .then(function(data, status, headers, config) {
        if(data.status == 200){
          var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
          saveAs(blob, 'Reporte_PolizasCaratula.xls');
        } else {
          SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
        }
      });
    };

    $scope.selectCerficate = function(item){
      $scope.existeNuevaHijo = false;
      $scope.certificate = item;
      if($scope.certificate.business_line){
        if($scope.certificate.business_line.id){
          $scope.certificate.business_line = $scope.certificate.business_line.id;
        }
      }
      if($scope.certificate.forma_de_pago.value){
        $scope.certificate.forma_de_pago = $scope.certificate.forma_de_pago.value;
      }
      if($scope.certificate.is_renewable.value){
        $scope.certificate.is_renewable = $scope.certificate.is_renewable.value;
      }

      // if ($scope.caratula.natural) {
      //   $scope.type_url = 'fisicas-app/';
      //   $scope.id_contractror = $scope.caratula.natural;
      // } else {
      //   $scope.type_url = 'morales-app/';
      //   $scope.id_contractror = $scope.caratula.juridical;
      // }
      $scope.type_url = 'contractors-app/';
      // $scope.id_contractror = $scope.caratula.contractor;
      $scope.id_contractror = item.contractor ? item.contractor.id : $scope.caratula.contractor;
      dataFactory.get($scope.type_url + $scope.id_contractror)
      .then(function success(response) {
        $scope.certificate.contractor = response.data;
        $scope.certificate.contractor.address = $scope.certificate.contractor.address_contractor;
      })

      $http({
        method: 'GET',
        url: url.IP + 'historic-policies/',
        params: {
          actual_id: $scope.certificate.id
        }
      })
      .then(function success(response) {
        $scope.certificate_history = [];
        if(response.data.results.length){
          response.data.results.forEach(function function_name(old, index) {
            // if($scope.caratula.id != old.base_policy.id){
            if($scope.certificate.id != old.base_policy.id){
              $scope.certificate_history.push(old.base_policy);
              if(index == 0){
                $scope.copy_certificate_history = angular.copy(old.base_policy);   
              }
            }else if(old.new_policy){
              $scope.certificate_history.push(old.new_policy);
              $scope.existeNuevaHijo = true;
            }
          });
        }
      })
      .catch(function (e) {
        console.log('error - caratula - catch', e);
      });

      $http.get(url.IP + 'polizas/'+ item.id + '/archivos/')
      .then(function(response){
        item.files = response.data.results;
      })
      .catch(function(e){
        console.log('error', e);
      });

      if($scope.caratula.recibos_poliza){
        $scope.total_prima_certificate = 0;
        $scope.total_rpf_certificate = 0;
        $scope.total_derecho_certificate = 0;
        $scope.total_iva_certificate = 0;
        $scope.total_total_certificate = 0;
        $scope.total_comision_certificate = 0;
        item.recibos_poliza.forEach(function(receipt){
          if(receipt.receipt_type == 1){
            $scope.total_prima_certificate = parseFloat($scope.total_prima_certificate) + parseFloat(receipt.prima_neta);
            $scope.total_rpf_certificate = parseFloat($scope.total_rpf_certificate) + parseFloat(receipt.rpf);
            $scope.total_derecho_certificate = parseFloat($scope.total_derecho_certificate) + parseFloat(receipt.derecho);
            $scope.total_iva_certificate = parseFloat($scope.total_iva_certificate) + parseFloat(receipt.iva);
            $scope.total_total_certificate = parseFloat($scope.total_total_certificate) + parseFloat(receipt.prima_total);
            $scope.total_comision_certificate = parseFloat($scope.total_comision_certificate) + parseFloat(receipt.comision);
          }
        });
      }
      $scope.showItemCertificate(2);
    };

    $scope.changeStatusModal = function(receipt, contra, insurance) {
      receipt.isDB = false;
      receipt.contratante = contra;
      var index = insurance.recibos_poliza.indexOf(receipt);
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/cobranzas/cobranzas.modal.html',
        controller: 'CobranzasModal',
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
          },bono: function(){
            return null;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });
      modalInstance.result.then(function(recibo) {
        switch (recibo.status) {
          case 1:
            receipt.status = 'Pagado';
            break;
          case 2:
            receipt.status = 'Cancelado';
            break;
          case 3:
            receipt.status = 'Prorrogado';
            break;
          case 4:
            receipt.status = 'Pendiente de Pago';
            break;
          case 5:
            receipt.status = 'Liquidado';
            break;
          case 6:
            receipt.status = 'Conciliado';
            break;
          case 7:
            receipt.status = 'Cerrado';
            break;
          case 8:
            receipt.status = 'Precancelado';
            break;
          default:
            receipt.status = parValue.status;
        }
        // activate();
      });
    };

    $scope.deleteCertificate = function (item){
      SweetAlert.swal({
        title: 'Eliminar póliza',
        text: "Se eliminará la póliza y no se podrá recuperar después, ¿Estás Seguro?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "¡Si, Estoy Seguro!",
        closeOnConfirm: false
      },
      function(isConfirm){
        if(isConfirm){
          $http.delete(item.url)
          .then(function(response){
            if(response.status == 204){
              var params = {
                'model': 18,
                'event': "POST",
                'associated_id': $scope.caratula.id,
                'identifier': " eliminó la póliza individual " + item.poliza_number + "."
              }

              dataFactory.post('send-log/', params).then(function success(response) {

              });
              SweetAlert.swal("¡Listo!", "Póliza eliminada correctamente.", "success");
              activate();
            }
          });
          $scope.categorySelected.certificates.splice($scope.categorySelected.certificates.indexOf(item), 1);
        }
      });
    };

    $scope.editCerficate = function(item){
      $scope.directiveReceipts.is_edit = true;
      $scope.originCertificate = []
      $scope.isEdit = true;
      if($localStorage.save_edition_flotilla_poliza){
        if($localStorage.save_edition_flotilla_poliza['id'] == item.id){
          $scope.newCertificate = $localStorage.save_edition_flotilla_poliza
        }else{
          $scope.newCertificate = item;
        }
      }else{
        $scope.newCertificate = item;
      }
      $scope.dataToSave.recalcular = true;

      $scope.dataToSave.poliza = {
        primaNeta: parseFloat(item.p_neta),
        rpf: parseFloat(item.rpf),
        derecho: parseFloat(item.derecho),
        subTotal: parseFloat(item.sub_total),
        iva: parseFloat(item.iva),
        primaTotal: parseFloat(item.p_total)
      };
      $scope.dataToSave.receipts = [];
      item.recibos_poliza.forEach(function(receipt){
        if(receipt.receipt_type == 1){
          receipt.fecha_inicio = datesFactory.convertDate(receipt.fecha_inicio);
          receipt.fecha_fin = datesFactory.convertDate(receipt.fecha_fin);
          receipt.vencimiento = datesFactory.convertDate(receipt.vencimiento);
          if(receipt.status != 'Pendiente de pago'){
            $scope.dataToSave.recalcular = false;
          }
          $scope.dataToSave.receipts.push(receipt);
        }
      });
      $http.post(url.IP + 'paquetes-data-by-subramo/',
      {'ramo': item.ramo.id, 'subramo': item.subramo.id, 'provider': item.aseguradora ? item.aseguradora.id : $scope.caratula.aseguradora.id})
      .then(function success(response){
        if(response.status === 200) {
          $scope.packages = [];
          if(response.data.length) {
            $scope.packages = response.data;
            $scope.packages.forEach(function(pack){
              if(pack.id == $scope.newCertificate.paquete.id){
                $scope.newCertificate.paquete = pack;
              }
            });
          }
        }
      })
      .catch(function (error) {
        console.log('error', e);
      });
      if($scope.newCertificate.start_of_validity.indexOf('-') != -1){
        $scope.newCertificate.start_of_validity = datesFactory.convertDate($scope.newCertificate.start_of_validity);
      }
      if($scope.newCertificate.end_of_validity.indexOf('-') != -1){
        $scope.newCertificate.end_of_validity = datesFactory.convertDate($scope.newCertificate.end_of_validity);
      }
      order.contratante = {};
      // if(item.natural){
      //   order.contratante.val = item.natural.full_name;
      //   order.contratante.value = item.natural;
      // }else{
      //   order.contratante.val = item.juridical.j_name;
      //   order.contratante.value = item.juridical;
      // }
      order.contratante.val = item.contractor.full_name;
      order.contratante.value = item.contractor;
      $scope.frequencies.forEach(function(item){
        if(item.value == $scope.newCertificate.forma_de_pago){
          $scope.newCertificate.forma_de_pago = item;
        }
      });
      $scope.renewals.forEach(function(item){
        if(item.value == $scope.newCertificate.is_renewable){
          $scope.newCertificate.is_renewable = item;
        }
      });
      $scope.businessline.forEach(function(item){
        if(item.id == $scope.newCertificate.business_line){
          $scope.newCertificate.business_line = item;
        }
      });
      if($scope.newCertificate.sucursal){
        $scope.sucursales.forEach(function(item){
          if(item.id == $scope.newCertificate.sucursal.id){
            $scope.newCertificate.sucursal = item;
          }
        });
      }
      if($scope.newCertificate.responsable){
        $scope.users.forEach(function(item){
          if(item.id == $scope.newCertificate.responsable.id){
            $scope.newCertificate.responsable = item;
          }
        });
      }
      if($scope.newCertificate.automobiles_policy.length){
        $scope.types.forEach(function(item){
          if(item.id == $scope.newCertificate.datos.policy_type){
            $scope.newCertificate.datos.policy_type = item;
          }
        });
        $scope.usages.forEach(function(item){
          if(item.value == $scope.newCertificate.datos.usage){
            $scope.newCertificate.datos.usage = item;
          }
        });
        $scope.procedencias.forEach(function(item){
          if(item.value == $scope.newCertificate.datos.procedencia){
            $scope.newCertificate.datos.procedencia = item;
          }
        });
      }

      if($scope.newCertificate.state_circulation){
        $scope.statesArray.forEach(function(item){
          if(item.id == parseInt($scope.newCertificate.state_circulation)){
            $scope.newCertificate.state_circulation = item;
          }
        });
      }

      $scope.directiveReceipts.payment = $scope.newCertificate.forma_de_pago;
      $scope.directiveReceipts.subramo = item.subramo;
      $scope.copy_inicio = angular.copy($scope.newCertificate.start_of_validity);
      $scope.copy_fin = angular.copy($scope.newCertificate.end_of_validity);
      $scope.checkDate($scope.copy_inicio);
      $scope.checkEndDate($scope.copy_fin);
      $scope.showItemCertificate(3);
    };
    $scope.returnInfo = function(){
      $scope.newCertificate.contractor = order.contratante.value;
      $scope.show_section(2)
      $scope.showItemCertificate(1);
    }
    $scope.return = function(){
      // if(order.contratante.value.address_natural){
      //   $scope.newCertificate.natural = order.contratante.value;
      // }else{
      //   $scope.newCertificate.juridical = order.contratante.value;
      // }
      $scope.newCertificate.contractor = order.contratante.value;
      $scope.showItemCertificate(1);
    };

    $scope.checkDate = function(param){
      if (param) {
        if(param.length == 10){
          // var date_initial = (param).split('/');
          // var day = date_initial[0];
          // var month = date_initial[1];
          // var year = parseInt(date_initial[2]);

          // if(day.length == 1){
          //   day = '0' + day;
          // }
          // if(month.length == 1){
          //   month = '0' + month;
          // }

          // $scope.startDate = param;
          // $scope.endDate = datesFactory.convertDate(new Date(month + '/' + day + '/' + (year + 1)));
          // $scope.newCertificate.start_of_validity = new Date(month + '/' + day + '/' + year).toISOString();
          // $scope.newCertificate.end_of_validity = new Date(month + '/' + day + '/' + (year + 1)).toISOString();

          if(process(param) > process($scope.newCertificate.end_of_validity)){
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
          // var day = new Date().getDate();
          // var month = new Date().getMonth() + 1;
          // var year = new Date().getFullYear();


          // $scope.startDate = param;
          // $scope.endDate = datesFactory.convertDate(new Date(month + '/' + day + '/' + (year + 1)));

          // $scope.newCertificate.start_of_validity = new Date(month + '/' + day + '/' + year).toISOString();
          // $scope.newCertificate.end_of_validity = new Date(month + '/' + day + '/' + (year + 1)).toISOString();
        }
        $scope.directiveReceipts.startDate = $scope.newCertificate.start_of_validity;
        $scope.directiveReceipts.endingDate = $scope.newCertificate.end_of_validity;
        var date1 = new Date(datesFactory.toDate($scope.newCertificate.start_of_validity));
        var date2 = new Date(datesFactory.toDate($scope.newCertificate.end_of_validity));
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        $scope.directiveReceipts.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
        $scope.directiveReceipts.domiciliado = false;
      }
    };

    $scope.checkEndDate = function(param){
      if(param){
        if(param.length == 10){
          if(process(param) < process($scope.newCertificate.start_of_validity)){
            SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATERANGE, "error");
            return;
          }

          function process(date){
            var parts = date.split("/");
            var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
            return date.getTime();
          }

          $scope.directiveReceipts.endingDate = param;
          var date1 = new Date(datesFactory.toDate($scope.newCertificate.start_of_validity));
          var date2 = new Date(datesFactory.toDate($scope.newCertificate.end_of_validity));
          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          $scope.directiveReceipts.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
        }
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
        // if(order.contratante.value.address_natural || order.contratante.value.address_juridical){
        if(order.contratante.value.address_contractor){
          // if(order.contratante.value.address_natural){
          //   $scope.newCertificate.natural = order.contratante.value.url;
          //   $scope.newCertificate.juridical = null;
          //   $scope.addresses = order.contratante.value.address_natural;
          // }else{
          //   $scope.newCertificate.natural = null;
          //   $scope.newCertificate.juridical = order.contratante.value.url;
          //   $scope.addresses = order.contratante.value.address_juridical;
          // }
          // if($scope.addresses.length == 1){
          //   $scope.addressSelected = $scope.addresses[0];
          //   $scope.newCertificate.address = $scope.addresses[0].url;
          // }
          if(order.contratante.value.address_contractor){
            $scope.newCertificate.contractor = order.contratante.value.url;
            $scope.newCertificate.contractor_new = order.contratante.value.id;
            $scope.addresses = order.contratante.value.address_contractor;
          }
          if($scope.addresses.length == 1){
            $scope.addressSelected = $scope.addresses[0];
            $scope.newCertificate.address = $scope.addresses[0]
            $scope.newCertificate.address_new = $scope.addresses[0].id;
          }
          if(order.contratante && order.contratante.value && order.contratante.value.sucursal){
            dataFactory.get('sucursales-to-show-unpag/')
            .then(function success(response){
              if(response.status === 200 || response.status === 201){
                $scope.sucursales = response.data;
                if($scope.sucursales && order.contratante.value){
                  $scope.sucursales.forEach(function(item){
                    if(item.url == order.contratante.value.sucursal){
                      $scope.newCertificate.sucursal =item;
                    }
                  });
                }
              }
            })
            .catch(function(e){
              console.log('error', e);
            });
          }
        }
      }
    });

    $scope.changeAddress = function(param){
      // $scope.newCertificate.address = param;
      // console.log('url------',param,$scope.newCertificate.address)
    };

    $scope.changePackageLay = function(pkg){
      $localStorage.saved_flotilla_info['paqueteLay'] = pkg;
    }

    $scope.changeSucursalLay = function(sucursal){
      console.log(sucursal);
      $localStorage.saved_flotilla_info['sucursalLay'] = sucursal;
    }

    $scope.validateCertificate = function(){
      if (!$scope.directiveReceipts.canCreate){
        SweetAlert.swal("Error", 'OPRIMA EL BOTON CALCULAR Y GENERAR RECIBOS', "error");
        return 
      }
      if(!$scope.newCertificate.poliza_number){
        SweetAlert.swal('Error', MESSAGES.ERROR.POLICYNOREQUIRED, 'error');
        return;
      }
      if(!$scope.newCertificate.start_of_validity){
        SweetAlert.swal('Error', 'Agrega una fecha de vigencia inicio.', 'error');
        return;
      }
      // if(!$scope.newCertificate.end_of_validity){
      //   SweetAlert.swal('Error', 'Agrega una fecha de vigencia fin.', 'error');
      //   return;
      // }else{
      //   if(process($scope.newCertificate.start_of_validity) < process(datesFactory.convertDate($scope.caratula.start_of_validity)) || process($scope.newCertificate.end_of_validity) > process(datesFactory.convertDate($scope.caratula.end_of_validity))){
      //     SweetAlert.swal("Error", MESSAGES.WARNING.VALIDITYOUTRANGE, "error");
      //     return;
      //   }
      //   function process(date){
      //     var parts = date.split("/");
      //     var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
      //     return date.getTime();
      //   }
      // }
      if(!order.contratante.val){
        SweetAlert.swal('Error', MESSAGES.ERROR.ERRORCONTRACTOR, 'error');
        return;
      }
      if(!$scope.newCertificate.address){
        SweetAlert.swal('Error', MESSAGES.ERROR.ADDRESS, 'error');
        return;
      }
      if(!order.contratante.value.email){
        SweetAlert.swal('Error', MESSAGES.ERROR.ERRORWITHOUTEMAIL, 'error');
        return;
      }
      // if(!order.contratante.value.phone_number){
      //   SweetAlert.swal('Error', MESSAGES.ERROR.PHONE, 'error');
      //   return;
      // }
      if(!$scope.newCertificate.forma_de_pago){
        SweetAlert.swal('Error', MESSAGES.ERROR.ERRORPAYFORM, 'error');
        return;
      }
      if(!$scope.newCertificate.is_renewable){
        SweetAlert.swal('Error', 'Selecciona si es renovable', 'error');
        return;
      }
      if(!$scope.newCertificate.f_currency){
        SweetAlert.swal('Error', 'Selecciona una moneda.', 'error');
        return;
      }
      if(!$scope.newCertificate.paquete){
        SweetAlert.swal('Error', 'Selecciona un paquete.', 'error');
        return;
      }
      if(!$scope.newCertificate.datos.policy_type){
        SweetAlert.swal('Error', 'Agrega un tipo.', 'error');
        return;
      }
      if($scope.caratula.subramo == 'Automóviles'){
        if(!$scope.newCertificate.datos.brand){
          SweetAlert.swal('Error', 'Agrega una marca.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.model){
          SweetAlert.swal('Error', 'Agrega un modelo.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.year){
          SweetAlert.swal('Error', 'Agrega un año.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.version){
          SweetAlert.swal('Error', 'Agrega una versión.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.serial){
          SweetAlert.swal('Error', 'Agrega un número de serie.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.usage){
          SweetAlert.swal('Error', 'Agrega un uso.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.service){
          SweetAlert.swal('Error', 'Selecciona un servicio.', 'error');
          return;
        }
      }
      if(!$scope.isEdit){
        if(!$scope.dataToSave.recibos_poliza){
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRECEIPTS, "error");
          return;
        }
      }

      if(!$scope.isEdit){
        $scope.saveIndividualCertificate();
      }else{
        $scope.valueCertificate();
      }
    };
    // validatePolizaFlotilla
    $scope.validatePolizaFlotilla = function(){
      var l = Ladda.create( document.querySelector( '.ladda-button-ren' ) );
      l.start();
      if (!$scope.directiveReceipts.canCreate){
        l.stop();
        SweetAlert.swal("Error", 'OPRIMA EL BOTON CALCULAR Y GENERAR RECIBOS', "error");
        return 
      }
      if(!$scope.newCertificate.poliza_number){
        l.stop();
        SweetAlert.swal('Error', MESSAGES.ERROR.POLICYNOREQUIRED, 'error');
        return;
      }
      if(!$scope.newCertificate.start_of_validity){
        l.stop();
        SweetAlert.swal('Error', 'Agrega una fecha de vigencia inicio.', 'error');
        return;
      }
      if(!order.contratante.val){
        l.stop();
        SweetAlert.swal('Error', MESSAGES.ERROR.ERRORCONTRACTOR, 'error');
        return;
      }
      if(!$scope.newCertificate.address){
        l.stop();
        SweetAlert.swal('Error', MESSAGES.ERROR.ADDRESS, 'error');
        return;
      }
      if(!order.contratante.value.email){
        l.stop();
        SweetAlert.swal('Error', MESSAGES.ERROR.ERRORWITHOUTEMAIL, 'error');
        return;
      }
      if(!$scope.newCertificate.forma_de_pago){
        l.stop();
        SweetAlert.swal('Error', MESSAGES.ERROR.ERRORPAYFORM, 'error');
        return;
      }
      if(!$scope.newCertificate.is_renewable){
        l.stop();
        SweetAlert.swal('Error', 'Selecciona si es renovable', 'error');
        return;
      }
      if(!$scope.newCertificate.f_currency){
        l.stop();
        SweetAlert.swal('Error', 'Selecciona una moneda.', 'error');
        return;
      }
      if(!$scope.newCertificate.paquete){
        l.stop();
        SweetAlert.swal('Error', 'Selecciona un paquete.', 'error');
        return;
      }
      if(!$scope.newCertificate.datos.policy_type){
        l.stop();
        SweetAlert.swal('Error', 'Agrega un tipo.', 'error');
        return;
      }
      if($scope.caratula.subramo == 'Automóviles'){
        if(!$scope.newCertificate.datos.brand){
          l.stop();
          SweetAlert.swal('Error', 'Agrega una marca.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.model){
          l.stop();
          SweetAlert.swal('Error', 'Agrega un modelo.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.year){
          l.stop();
          SweetAlert.swal('Error', 'Agrega un año.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.version){
          l.stop();
          SweetAlert.swal('Error', 'Agrega una versión.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.serial){
          l.stop();
          SweetAlert.swal('Error', 'Agrega un número de serie.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.usage){
          l.stop();
          SweetAlert.swal('Error', 'Agrega un uso.', 'error');
          return;
        }
        if(!$scope.newCertificate.datos.service){
          l.stop();
          SweetAlert.swal('Error', 'Selecciona un servicio.', 'error');
          return;
        }
      }
      if($scope.isRenewal){
        if(!$scope.dataToSave.recibos_poliza){
          l.stop();
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRECEIPTS, "error");
          return;
        }
      }

      if($scope.isRenewal){
        $scope.savePolizaFlotillaRenovacion();
      }
    };
    $scope.savePolizaFlotillaRenovacion = function(){      
      var l = Ladda.create( document.querySelector( '.ladda-button-ren' ) );
      l.start();
      $scope.certifcados = [];
      if($scope.dataCaratula.subramo.subramo_code == 9){
        $scope.dataToSave.recibos_poliza.forEach(function(receipt){
          receipt.fecha_inicio = datesFactory.toDate(receipt.fecha_inicio);
          receipt.fecha_fin = datesFactory.toDate(receipt.fecha_fin);
          receipt.vencimiento = datesFactory.toDate(receipt.vencimiento);
        });

        $scope.newCertificate.datos.adjustment = $scope.newCertificate.datos.adjustment ? $scope.newCertificate.datos.adjustment : "";
        $scope.newCertificate.datos.beneficiary_address = $scope.newCertificate.datos.beneficiary_address ? $scope.newCertificate.datos.beneficiary_address : "";
        $scope.newCertificate.datos.beneficiary_rfc = $scope.newCertificate.datos.beneficiary_rfc ? $scope.newCertificate.datos.beneficiary_rfc : "";
        $scope.newCertificate.datos.brand = $scope.newCertificate.datos.brand ? $scope.newCertificate.datos.brand : "";
        $scope.newCertificate.datos.car_owner = $scope.newCertificate.datos.car_owner ? $scope.newCertificate.datos.car_owner : "";
        $scope.newCertificate.datos.charge_type = $scope.newCertificate.datos.charge_type ? $scope.newCertificate.datos.charge_type.value : 0;
        $scope.newCertificate.datos.color = $scope.newCertificate.datos.color ? $scope.newCertificate.datos.color : "";
        $scope.newCertificate.datos.driver = $scope.newCertificate.datos.driver ? $scope.newCertificate.datos.driver : "";
        $scope.newCertificate.datos.email = $scope.newCertificate.datos.email ? $scope.newCertificate.datos.email : "";
        $scope.newCertificate.datos.engine = $scope.newCertificate.datos.engine ? $scope.newCertificate.datos.engine : "";
        $scope.newCertificate.datos.license_plates = $scope.newCertificate.datos.license_plates ? $scope.newCertificate.datos.license_plates : "";
        $scope.newCertificate.datos.model = $scope.newCertificate.datos.model ? $scope.newCertificate.datos.model : "";
        $scope.newCertificate.datos.mont_adjustment = $scope.newCertificate.datos.mont_adjustment ? $scope.newCertificate.datos.mont_adjustment : 0;
        $scope.newCertificate.datos.mont_special_team = $scope.newCertificate.datos.mont_special_team ? $scope.newCertificate.datos.mont_special_team : 0;
        $scope.newCertificate.datos.no_employee = $scope.newCertificate.datos.no_employee ? $scope.newCertificate.datos.no_employee : 0;
        $scope.newCertificate.datos.policy_type = $scope.newCertificate.datos.policy_type ? $scope.newCertificate.datos.policy_type.id : 0;
        $scope.newCertificate.datos.preferential_benefiaciary = $scope.newCertificate.datos.preferential_benefiaciary ? $scope.newCertificate.datos.preferential_benefiaciary : 0;
        $scope.newCertificate.datos.procedencia = $scope.newCertificate.datos.procedencia ? $scope.newCertificate.datos.procedencia.value : 0;
        $scope.newCertificate.datos.serial = $scope.newCertificate.datos.serial ? $scope.newCertificate.datos.serial : "";
        $scope.newCertificate.datos.service = $scope.newCertificate.datos.service ? $scope.newCertificate.datos.service : "";
        $scope.newCertificate.datos.special_team = $scope.newCertificate.datos.special_team ? $scope.newCertificate.datos.special_team : "";
        $scope.newCertificate.datos.sum_insured = $scope.newCertificate.datos.sum_insured ? $scope.newCertificate.datos.sum_insured : "";
        $scope.newCertificate.datos.usage = $scope.newCertificate.datos.usage ? $scope.newCertificate.datos.usage.value : 0;
        $scope.newCertificate.datos.version = $scope.newCertificate.datos.version ? $scope.newCertificate.datos.version : "";
        $scope.newCertificate.datos.year = $scope.newCertificate.datos.year ? $scope.newCertificate.datos.year : 0;
        delete $scope.newCertificate.datos.policy;
        delete $scope.newCertificate.datos.id;
        delete $scope.newCertificate.datos.org_name;
        delete $scope.newCertificate.datos.url;

        var dataCar = [];
        if($scope.newCertificate.address_new){
          $scope.newCertificate.address_new = parseInt($scope.newCertificate.address_new)
        }
        if($scope.newCertificate.address){
          $scope.newCertificate.address_new=$scope.newCertificate.address.id
        }
        dataCar.push($scope.newCertificate.datos);
        
        var certificateData = {
          accidents_policy: [],
          address: parseInt($scope.newCertificate.address_new),
          aseguradora: $scope.caratula.nueva.aseguradora,
          automobiles_policy: dataCar,
          business_line: $scope.caratula.nueva.business_line,
          conducto_de_pago: $scope.newCertificate.conducto_de_pago,
          caratula: $scope.caratula.nueva.id,
          celula: $scope.caratula.nueva.celula,
          clave: $scope.caratula.nueva.clave,
          coverageInPolicy_policy: [],
          damages_policy: [],
          document_type: 12,
          end_of_validity: datesFactory.toDate($scope.newCertificate.end_of_validity),
          endorsement: false,
          collection_executive: $scope.caratula.nueva.collection_executive ? $scope.caratula.nueva.collection_executive.id : null,
          f_currency: parseInt($scope.newCertificate.f_currency),
          folio: $scope.newCertificate.folio ? $scope.newCertificate.folio : null,
          forma_de_pago: parseInt($scope.newCertificate.forma_de_pago.value),
          groupinglevel: null,
          identifier: $scope.newCertificate.datos.brand + '_' + $scope.newCertificate.datos.model + '_' + $scope.newCertificate.datos.year,
          internal_number: null,
          is_renewable: $scope.newCertificate.is_renewable.value,
          life_policy: [],
          // natural: parseInt($scope.naturalP),
          // juridical: parseInt($scope.juridicalP),
          contractor: parseInt($scope.newCertificate.contractor_new),
          old_policies: [],
          paquete: parseInt($scope.newCertificate.paquete.id),
          parent: $scope.caratula.nueva.url,
          // poliza: $scope.obj_poliza,
          poliza_number: $scope.newCertificate.poliza_number,
          ramo: $scope.caratula.nueva.ramo,
          recibos_poliza: $scope.dataToSave.recibos_poliza,
          responsable: $scope.caratula.nueva.responsable ? $scope.caratula.nueva.responsable : null,
          start_of_validity: datesFactory.toDate($scope.newCertificate.start_of_validity),
          state_circulation: $scope.newCertificate.state_circulation ? $scope.newCertificate.state_circulation.id : '',
          status: 14,
          sucursal: $scope.getSucursalId(),
          subramo: $scope.caratula.nueva.subramo,
          observations: $scope.newCertificate.observations ? $scope.newCertificate.observations : null,
          p_neta: $scope.dataToSave.p_neta ? $scope.dataToSave.p_neta : 0,
          descuento: $scope.dataToSave.descuento ? $scope.dataToSave.descuento : 0,
          rpf: $scope.dataToSave.rpf ? $scope.dataToSave.rpf : 0,
          derecho: $scope.dataToSave.derecho ? $scope.dataToSave.derecho : 0,
          iva: $scope.dataToSave.iva ? $scope.dataToSave.iva : 0,
          p_total: $scope.dataToSave.p_total ? $scope.dataToSave.p_total : 0,
          comision: $scope.dataToSave.comision ? $scope.dataToSave.comision : 0,
          comision_percent: $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0,
          comision_derecho_percent: $scope.dataToSave.poliza.comision_derecho_percent ? $scope.dataToSave.poliza.comision_derecho_percent : 0,
          comision_rpf_percent: $scope.dataToSave.poliza.comision_rpf_percent ? $scope.dataToSave.poliza.comision_rpf_percent : 0,
          sub_total: $scope.dataToSave.subTotal ? $scope.dataToSave.subTotal : 0
        };
        if ($scope.caratula_renovada) {
          certificateData.caratula_renovada = $scope.caratula_renovada
        }
        $scope.certifcados.push(certificateData);
      }

      $http({
        method: 'POST',
        url: url.IP + 'save_caratula_polizas/',
        data: $scope.certifcados
      })
      .then(function success(response){
        if(response.status === 201 || response.status === 200){
          $localStorage.save_edition_flotilla_poliza = {};
          $scope.infoNueva=response.data[0];
          $scope.certifcados=response.data;
          l.stop();
          $scope.newCertificate = {};
          SweetAlert.swal("¡Listo!", MESSAGES.OK.RENEWALPOLICY, 'success');
          var logManual = {
            'model': 18,
            'event': "POST",
            'associated_id': $scope.caratula.id,
            'identifier': " renovo la póliza: " + $scope.infoNueva.poliza_number + " de la colectividad de forma manual.",
          }
          dataFactory.post('send_log_specific/', logManual).then(function success(response){
          });
          var logManual = {
            'model': 1,
            'event': "POST",
            'associated_id': $scope.polizaaRenovar.id,
            'identifier': " renovo la póliza de flotilla: " + $scope.polizaaRenovar.poliza_number + " de la carátula: "+$scope.caratula.poliza_number+".",
          }
          dataFactory.post('send_log_specific/', logManual).then(function success(response){
          });
          /* Relación con la póliza original */
          if($scope.infoNueva.poliza_number){
            var oldPolicy = {
              policy: $scope.polizaaRenovar.poliza_number,
              base_policy: $scope.polizaaRenovar.url,
              new_policy: $scope.infoNueva.url
            }
          }else{
            var oldPolicy = {
              base_policy: $scope.polizaaRenovar.url,
              new_policy: $scope.infoNueva.url
            }
          }
          $http.post(url.IP + 'v1/polizas/viejas/', oldPolicy)
          .then(function(res){
          })
          .catch(function(e){
            l.stop();
            console.log('error - caratula - catch', e);
          });
          // póliza a renoavr cambiar a renovada
          $http.patch($scope.polizaaRenovar.url, {'status':12,'renewed_status':1})
          .then(function(responsepatcharen){
            $scope.show_renewal_certificate=false;
            $scope.isRenewal=false;
            $scope.show_certificado=true;
            $scope.show_caratula = false;
            $scope.show_certificado = true;
            l.stop();
            activate();
            $scope.showItemCertificate(4);
          })
          .catch(function(e){
            l.stop();
            console.log('error', e);
            SweetAlert.swal("ERROR", e.data.data ,"error");
          });
        }else{
          l.stop();
          SweetAlert.swal("ERROR", response.data.data ,"error");
          if($scope.newCertificate.datos.procedencia){
            $scope.usages.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.usage){
                $scope.newCertificate.datos.usage = item;
              }
            });
            $scope.typesCharges.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.charge_type){
                $scope.newCertificate.datos.charge_type = item;
              }
            });
            $scope.procedencias.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.procedencia){
                $scope.newCertificate.datos.procedencia = item;
              }
            });
          }
        }
      })
      .catch(function(e){
        console.log('error', e);
        l.stop();
        try{
          $scope.dataToSave.recibos_poliza=[];
          $scope.newCertificate.recibos_poliza=[];
          if($scope.newCertificate.datos.procedencia){
            $scope.usages.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.usage){
                $scope.newCertificate.datos.usage = item;
              }
            });
            $scope.typesCharges.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.charge_type){
                $scope.newCertificate.datos.charge_type = item;
              }
            });
            $scope.procedencias.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.procedencia){
                $scope.newCertificate.datos.procedencia = item;
              }
            });
          }
          SweetAlert.swal("Verifique la información", e.data.data ,"error");
          return
        }catch(i){}
      });
    };
    // uh---renovación fin
    $scope.getSucursalId = function() {
      if ($scope.newCertificate.sucursal) {
          return typeof $scope.newCertificate.sucursal === 'number'
              ? parseInt($scope.newCertificate.sucursal)
              : $scope.newCertificate.sucursal.id
                  ? parseInt($scope.newCertificate.sucursal.id)
                  : null;
      }
      return null;
    };
    $scope.saveIndividualCertificate = function(){
      $scope.certifcados = [];
      if($scope.dataCaratula.subramo.subramo_code == 9){
        $scope.dataToSave.recibos_poliza.forEach(function(receipt){
          receipt.fecha_inicio = datesFactory.toDate(receipt.fecha_inicio);
          receipt.fecha_fin = datesFactory.toDate(receipt.fecha_fin);
          receipt.vencimiento = datesFactory.toDate(receipt.vencimiento);
        });

        $scope.newCertificate.datos.adjustment = $scope.newCertificate.datos.adjustment ? $scope.newCertificate.datos.adjustment : "";
        $scope.newCertificate.datos.beneficiary_address = $scope.newCertificate.datos.beneficiary_address ? $scope.newCertificate.datos.beneficiary_address : "";
        $scope.newCertificate.datos.beneficiary_rfc = $scope.newCertificate.datos.beneficiary_rfc ? $scope.newCertificate.datos.beneficiary_rfc : "";
        $scope.newCertificate.datos.brand = $scope.newCertificate.datos.brand ? $scope.newCertificate.datos.brand : "";
        $scope.newCertificate.datos.car_owner = $scope.newCertificate.datos.car_owner ? $scope.newCertificate.datos.car_owner : "";
        $scope.newCertificate.datos.charge_type = $scope.newCertificate.datos.charge_type ? $scope.newCertificate.datos.charge_type.value : 0;
        $scope.newCertificate.datos.color = $scope.newCertificate.datos.color ? $scope.newCertificate.datos.color : "";
        $scope.newCertificate.datos.driver = $scope.newCertificate.datos.driver ? $scope.newCertificate.datos.driver : "";
        $scope.newCertificate.datos.email = $scope.newCertificate.datos.email ? $scope.newCertificate.datos.email : "";
        $scope.newCertificate.datos.engine = $scope.newCertificate.datos.engine ? $scope.newCertificate.datos.engine : "";
        $scope.newCertificate.datos.license_plates = $scope.newCertificate.datos.license_plates ? $scope.newCertificate.datos.license_plates : "";
        $scope.newCertificate.datos.model = $scope.newCertificate.datos.model ? $scope.newCertificate.datos.model : "";
        $scope.newCertificate.datos.mont_adjustment = $scope.newCertificate.datos.mont_adjustment ? $scope.newCertificate.datos.mont_adjustment : 0;
        $scope.newCertificate.datos.mont_special_team = $scope.newCertificate.datos.mont_special_team ? $scope.newCertificate.datos.mont_special_team : 0;
        $scope.newCertificate.datos.no_employee = $scope.newCertificate.datos.no_employee ? $scope.newCertificate.datos.no_employee : 0;
        $scope.newCertificate.datos.policy_type = $scope.newCertificate.datos.policy_type ? $scope.newCertificate.datos.policy_type.id : 0;
        $scope.newCertificate.datos.preferential_benefiaciary = $scope.newCertificate.datos.preferential_benefiaciary ? $scope.newCertificate.datos.preferential_benefiaciary : 0;
        $scope.newCertificate.datos.procedencia = $scope.newCertificate.datos.procedencia ? $scope.newCertificate.datos.procedencia.value : 0;
        $scope.newCertificate.datos.serial = $scope.newCertificate.datos.serial ? $scope.newCertificate.datos.serial : "";
        $scope.newCertificate.datos.service = $scope.newCertificate.datos.service ? $scope.newCertificate.datos.service : "";
        $scope.newCertificate.datos.special_team = $scope.newCertificate.datos.special_team ? $scope.newCertificate.datos.special_team : "";
        $scope.newCertificate.datos.sum_insured = $scope.newCertificate.datos.sum_insured ? $scope.newCertificate.datos.sum_insured : "";
        $scope.newCertificate.datos.usage = $scope.newCertificate.datos.usage ? $scope.newCertificate.datos.usage.value : 0;
        $scope.newCertificate.datos.version = $scope.newCertificate.datos.version ? $scope.newCertificate.datos.version : "";
        $scope.newCertificate.datos.year = $scope.newCertificate.datos.year ? $scope.newCertificate.datos.year : 0;

        var dataCar = [];
        if($scope.newCertificate.address_new){
          $scope.newCertificate.address_new = parseInt($scope.newCertificate.address_new)
        }
        if($scope.newCertificate.address){
          $scope.newCertificate.address_new=$scope.newCertificate.address.id
        }
        dataCar.push($scope.newCertificate.datos);
        var certificateData = {
          accidents_policy: [],
          address: parseInt($scope.newCertificate.address_new),
          aseguradora: $scope.dataCaratula.aseguradora.id,
          automobiles_policy: dataCar,
          business_line: $scope.caratula.business_line,
          conducto_de_pago: $scope.newCertificate.conducto_de_pago,
          from_pdf: $scope.newCertificate.from_pdf,
          caratula: $scope.dataCaratula.id,
          celula: $scope.dataCaratula.celula,
          clave: $scope.dataCaratula.clave.id,
          coverageInPolicy_policy: [],
          damages_policy: [],
          document_type: 12,
          end_of_validity: datesFactory.toDate($scope.newCertificate.end_of_validity),
          endorsement: false,
          collection_executive: $scope.caratula.collection_executive ? $scope.caratula.collection_executive.id : null,
          f_currency: parseInt($scope.newCertificate.f_currency),
          folio: $scope.newCertificate.folio ? $scope.newCertificate.folio : null,
          forma_de_pago: parseInt($scope.newCertificate.forma_de_pago.value),
          groupinglevel: null,
          identifier: $scope.newCertificate.datos.brand + '_' + $scope.newCertificate.datos.model + '_' + $scope.newCertificate.datos.year,
          internal_number: null,
          is_renewable: $scope.newCertificate.is_renewable.value,
          life_policy: [],
          // natural: parseInt($scope.naturalP),
          // juridical: parseInt($scope.juridicalP),
          contractor: parseInt($scope.newCertificate.contractor_new),
          old_policies: [],
          paquete: parseInt($scope.newCertificate.paquete.id),
          parent: $scope.dataCaratula.url,
          // poliza: $scope.obj_poliza,
          poliza_number: $scope.newCertificate.poliza_number,
          ramo: $scope.dataCaratula.ramo.id,
          recibos_poliza: $scope.dataToSave.recibos_poliza,
          responsable: $scope.caratula.responsable ? $scope.caratula.responsable.id : null,
          start_of_validity: datesFactory.toDate($scope.newCertificate.start_of_validity),
          state_circulation: $scope.newCertificate.state_circulation ? $scope.newCertificate.state_circulation.id : '',
          status: 14,
          sucursal: $scope.getSucursalId(),
          subramo: $scope.dataCaratula.subramo.id,
          observations: $scope.newCertificate.observations ? $scope.newCertificate.observations : null,
          p_neta: $scope.dataToSave.p_neta ? $scope.dataToSave.p_neta : 0,
          descuento: $scope.dataToSave.descuento ? $scope.dataToSave.descuento : 0,
          rpf: $scope.dataToSave.rpf ? $scope.dataToSave.rpf : 0,
          derecho: $scope.dataToSave.derecho ? $scope.dataToSave.derecho : 0,
          iva: $scope.dataToSave.iva ? $scope.dataToSave.iva : 0,
          p_total: $scope.dataToSave.p_total ? $scope.dataToSave.p_total : 0,
          comision: $scope.dataToSave.comision ? $scope.dataToSave.comision : 0,
          comision_percent: $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0,
          comision_derecho_percent: $scope.dataToSave.poliza.comision_derecho_percent ? $scope.dataToSave.poliza.comision_derecho_percent : 0,
          comision_rpf_percent: $scope.dataToSave.poliza.comision_rpf_percent ? $scope.dataToSave.poliza.comision_rpf_percent : 0,
          sub_total: $scope.dataToSave.subTotal ? $scope.dataToSave.subTotal : 0
        };
        if ($scope.caratula_renovada) {
          certificateData.caratula_renovada = $scope.caratula_renovada
        }
        $scope.certifcados.push(certificateData);
      }

      $http({
        method: 'POST',
        url: url.IP + 'save_caratula_polizas/',
        data: $scope.certifcados
      })
      .then(function success(response){
        if(response.status === 201 || response.status === 200){
          $localStorage.save_edition_flotilla_poliza = {};
          $scope.read_pdf_pf={};
          $stateParams['dataContractor']={};
          $localStorage['datos_pdf_flotilla']={};
          $scope.newCertificate = {};
          SweetAlert.swal("¡Listo!", MESSAGES.OK.CERTIFICATESDONE, 'success');

          // $http.patch(order.searchContratante.value.url,$scope.contractorToSave)
          // .then(function(data) {
          //   if(data.status == 200 || data.status == 201){
          //     // toaster.info('Contratante Actualizado')
          //   }
          // });
          var logManual = {
            'model': 18,
            'event': "POST",
            'associated_id': $scope.caratula.id,
            'identifier': " agregó " + $scope.certifcados.length + " Póliza(s) individual(es) a la colectividad de forma manual.",
          }
          dataFactory.post('send_log_specific/', logManual).then(function success(response){
          });
          if($localStorage.dataFile && $scope.read_pdf_pf){
            try{
              $localStorage.dataFile.append('owner', response.data[0].id)
              try{
                $http.patch(data.data.url,{'from_pdf':true});
              }catch(u){}
              var xhr_file = new XMLHttpRequest();
              // xhr_file.open("POST", url.SERVICE_PDF);
              xhr_file.open("POST", url.IP+'polizas/' +  response.data[0].id + '/archivos/?org='+$scope.orgName);
              xhr_file.timeout = 1200000;
              xhr_file.ontimeout = function (e) {
                console.log('error file',e)
              };
              xhr_file.setRequestHeader('Authorization', 'Bearer ' + token);
              xhr_file.send($localStorage.dataFile);
              xhr_file.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                  $scope.fileUP = JSON.parse(xhr_file.response);
                  $localStorage.dataFile={};
                  $localStorage.archivoBase64={};
                  $localStorage.serieDetectada='';
                  $scope.serieDetectada='';
                  $scope.serieAGuardar='';
                  $localStorage.save_edition_flotilla_poliza = {};
                  $scope.read_pdf_pf={};
                  $localStorage['datos_pdf_flotilla']={};
                }
              }
            }catch(efile){
              console.log('nose cargo el pdf leído',efile)
            }
          }
          activate();
          $scope.showItemCertificate(1);
        }else{
          SweetAlert.swal("ERROR", response.data.data ,"error");
          if($scope.newCertificate.datos.procedencia){
            $scope.usages.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.usage){
                $scope.newCertificate.datos.usage = item;
              }
            });
            $scope.typesCharges.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.charge_type){
                $scope.newCertificate.datos.charge_type = item;
              }
            });
            $scope.procedencias.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.procedencia){
                $scope.newCertificate.datos.procedencia = item;
              }
            });
          }
        }
      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    $scope.valueCertificate = function(){
      $scope.newCertificate.start_of_validity = datesFactory.toDate($scope.newCertificate.start_of_validity);
      $scope.newCertificate.end_of_validity = datesFactory.toDate($scope.newCertificate.end_of_validity);
      if($scope.newCertificate.automobiles_policy.length){
        $scope.newCertificate.automobiles_policy[0].driver = $scope.newCertificate.datos.driver;
        // $scope.newCertificate.automobiles_policy[0].email = $scope.newCertificate.datos.email;
        $scope.newCertificate.automobiles_policy[0].brand = $scope.newCertificate.datos.brand;
        $scope.newCertificate.automobiles_policy[0].model = $scope.newCertificate.datos.model;
        $scope.newCertificate.automobiles_policy[0].year = $scope.newCertificate.datos.year;
        $scope.newCertificate.automobiles_policy[0].version = $scope.newCertificate.datos.version;
        $scope.newCertificate.automobiles_policy[0].serial = $scope.newCertificate.datos.serial;
        $scope.newCertificate.automobiles_policy[0].engine = $scope.newCertificate.datos.engine;
        $scope.newCertificate.automobiles_policy[0].color = $scope.newCertificate.datos.color;
        $scope.newCertificate.automobiles_policy[0].license_plates = $scope.newCertificate.datos.license_plates;
        $scope.newCertificate.automobiles_policy[0].usage = $scope.newCertificate.datos.usage.value;
        $scope.newCertificate.automobiles_policy[0].service = $scope.newCertificate.datos.service;
        $scope.newCertificate.automobiles_policy[0].procedencia = $scope.newCertificate.datos.procedencia.value;
      }
      $scope.updateCertificate();
    };

    $scope.updateCertificate = function(){
      $scope.changes = [];
      var jsonUpdate = {
        poliza_number: $scope.newCertificate.poliza_number,
        folio: $scope.newCertificate.folio,
        start_of_validity: $scope.newCertificate.start_of_validity,
        end_of_validity: $scope.newCertificate.end_of_validity,
        status: $scope.newCertificate.status,
        // natural: $scope.newCertificate.natural,
        // juridical: $scope.newCertificate.juridical,
        contractor: $scope.newCertificate.contractor,
        address: $scope.newCertificate.address ? $scope.newCertificate.address.url : null,
        forma_de_pago: $scope.newCertificate.forma_de_pago.value,
        is_renewable: $scope.newCertificate.is_renewable.value,
        f_currency: $scope.newCertificate.f_currency,
        paquete: $scope.newCertificate.paquete.url,
        business_line: $scope.caratula.business_line ? $scope.caratula.business_line : null,
        conducto_de_pago: $scope.newCertificate.conducto_de_pago ? $scope.newCertificate.conducto_de_pago : null,
        sucursal: $scope.newCertificate.sucursal ? $scope.newCertificate.sucursal.url : null,
        responsable: $scope.caratula.responsable ? $scope.caratula.responsable.url : null,
        state_circulation: $scope.newCertificate.state_circulation ? $scope.newCertificate.state_circulation.id : '',
        collection_executive: $scope.caratula.collection_executive ? $scope.caratula.collection_executive.url : null,
        // policy_type: $scope.newCertificate.datos && $scope.newCertificate.datos.policy_type && $scope.newCertificate.datos.policy_type.id? $scope.newCertificate.datos.policy_type.id :$scope.newCertificate.policy_type,
        observations: $scope.newCertificate.observations,
        p_neta: $scope.dataToSave.p_neta ? $scope.dataToSave.p_neta : $scope.newCertificate.p_neta,
        rpf: $scope.dataToSave.rpf ? $scope.dataToSave.rpf : $scope.newCertificate.rpf,
        derecho: $scope.dataToSave.derecho ? $scope.dataToSave.derecho : $scope.newCertificate.derecho,
        iva: $scope.dataToSave.iva ? $scope.dataToSave.iva : $scope.newCertificate.iva,
        p_total: $scope.dataToSave.p_total ? $scope.dataToSave.p_total : $scope.newCertificate.p_total,
        comision: ($scope.dataToSave.comision || $scope.dataToSave.comision == 0) ? $scope.dataToSave.comision : $scope.newCertificate.comision,
        comision_percent : ($scope.dataToSave.comision_percent || $scope.dataToSave.comision_percent == 0) ? $scope.dataToSave.comision_percent : $scope.newCertificate.comision_percent,
        comision_derecho_percent : ($scope.dataToSave.poliza.comision_derecho_percent || $scope.dataToSave.poliza.comision_derecho_percent == 0) ? $scope.dataToSave.poliza.comision_derecho_percent : $scope.newCertificate.comision_derecho_percent,
        comision_rpf_percent : ($scope.dataToSave.poliza.comision_rpf_percent || $scope.dataToSave.poliza.comision_rpf_percent == 0) ? $scope.dataToSave.poliza.comision_rpf_percent : $scope.newCertificate.comision_rpf_percent
      }

      $http.patch($scope.newCertificate.url, jsonUpdate)
      .then(function success(request){
        if(request.status === 200){
          $localStorage.save_edition_flotilla_poliza = {}
          if($scope.newCertificate.automobiles_policy.length){
            var jsonAuto = {
              adjustment: $scope.newCertificate.datos.adjustment,
              beneficiary_address: $scope.newCertificate.datos.beneficiary_address,
              beneficiary_name: $scope.newCertificate.datos.beneficiary_name,
              beneficiary_rfc: $scope.newCertificate.datos.beneficiary_rfc,
              brand: $scope.newCertificate.datos.brand,
              car_owner: $scope.newCertificate.datos.car_owner,
              charge_type: $scope.newCertificate.datos.charge_type ? $scope.newCertificate.datos.charge_type.value : 0,
              color: $scope.newCertificate.datos.color,
              document_type: 1,
              driver: $scope.newCertificate.datos.driver,
              email: $scope.newCertificate.datos.email,
              engine: $scope.newCertificate.datos.engine,
              license_plates: $scope.newCertificate.datos.license_plates,
              model: $scope.newCertificate.datos.model,
              mont_adjustment: $scope.newCertificate.datos.mont_adjustment,
              mont_special_team: $scope.newCertificate.datos.mont_special_team,
              no_employee: $scope.newCertificate.datos.no_employee,
              personal: $scope.newCertificate.datos.personal,
              policy: $scope.newCertificate.url,
              policy_type: $scope.newCertificate.datos.policy_type.id,
              preferential_benefiaciary: $scope.newCertificate.datos.preferential_benefiaciary,
              procedencia: $scope.newCertificate.datos.procedencia.value,
              serial: $scope.newCertificate.datos.serial,
              service: $scope.newCertificate.datos.service,
              special_team: $scope.newCertificate.datos.special_team,
              // sub_branch: $scope.newCertificate.subramo.url,
              sum_insured: $scope.newCertificate.datos.sum_insured,
              usage: $scope.newCertificate.datos.usage.value,
              version: $scope.newCertificate.datos.version,
              year: $scope.newCertificate.datos.year

            }
            $http.patch($scope.newCertificate.automobiles_policy[0].url, jsonAuto)
            .then(function success(response){
              if(response.status == 200){
                // log automobiles
                SweetAlert.swal('¡Listo!', 'Póliza actualizada exitosamente.', 'success');
                // var paramsC = {
                //   'model': 18,
                //   'event': "POST",
                //   'associated_id': $scope.caratula.id,
                //   'identifier': " actualizó la póliza individual."
                // }

                // dataFactory.post('send-log/', paramsC).then(function success(response) {

                // });

                // var params = {
                //   'model': 1,
                //   'event': "POST",
                //   'associated_id': $scope.newCertificate.id,
                //   'identifier': " actualizó la póliza."
                // }
                // $localStorage.save_edition_flotilla_poliza = {}
                // dataFactory.post('send-log/', params).then(function success(response) {

                // });
              }
            })
            .catch(function(e){
              console.log('error', e);
            });
          }else{
            var jsonAuto = {
              adjustment: $scope.newCertificate.datos.adjustment,
              beneficiary_address: $scope.newCertificate.datos.beneficiary_address,
              beneficiary_name: $scope.newCertificate.datos.beneficiary_name,
              beneficiary_rfc: $scope.newCertificate.datos.beneficiary_rfc,
              brand: $scope.newCertificate.datos.brand,
              car_owner: $scope.newCertificate.datos.car_owner,
              charge_type: $scope.newCertificate.datos.charge_type ? $scope.newCertificate.datos.charge_type.value : 0,
              color: $scope.newCertificate.datos.color,
              document_type: 1,
              driver: $scope.newCertificate.datos.driver,
              email: $scope.newCertificate.datos.email,
              engine: $scope.newCertificate.datos.engine,
              license_plates: $scope.newCertificate.datos.license_plates,
              model: $scope.newCertificate.datos.model,
              mont_adjustment: $scope.newCertificate.datos.mont_adjustment,
              mont_special_team: $scope.newCertificate.datos.mont_special_team,
              no_employee: $scope.newCertificate.datos.no_employee,
              personal: $scope.newCertificate.datos.personal,
              policy: $scope.newCertificate.url,
              policy_type: $scope.newCertificate.datos.policy_type.id,
              preferential_benefiaciary: $scope.newCertificate.datos.preferential_benefiaciary,
              procedencia: $scope.newCertificate.datos.procedencia.value,
              serial: $scope.newCertificate.datos.serial,
              service: $scope.newCertificate.datos.service,
              special_team: $scope.newCertificate.datos.special_team,
              sub_branch: $scope.newCertificate.subramo.url,
              sum_insured: $scope.newCertificate.datos.sum_insured,
              usage: $scope.newCertificate.datos.usage.value,
              version: $scope.newCertificate.datos.version,
              year: $scope.newCertificate.datos.year

            }
            $http({
              method: 'POST',
              url: url.IP + 'v1/forms/automobile-damages/',
              data: jsonAuto
            })
            .then(function success (response) {
              $localStorage.save_edition_flotilla_poliza = {}
              SweetAlert.swal('¡Listo!', 'Póliza actualizada exitosamente.', 'success');
            })
            .catch(function (error) {
              console.log('Error - catch', error);
            });
          }

          if($scope.dataToSave.recibos_poliza){
            $scope.dataToSave.receipts.forEach(function(item, index){
              if(item.recibo_numero == $scope.dataToSave.recibos_poliza[index].recibo_numero){
                var object = {
                  prima_neta: $scope.dataToSave.recibos_poliza[index].prima_neta,
                  rpf: $scope.dataToSave.recibos_poliza[index].rpf,
                  derecho: $scope.dataToSave.recibos_poliza[index].derecho,
                  sub_total: $scope.dataToSave.recibos_poliza[index].sub_total,
                  iva: $scope.dataToSave.recibos_poliza[index].iva,
                  prima_total: $scope.dataToSave.recibos_poliza[index].prima_total,
                  comision: $scope.dataToSave.recibos_poliza[index].comision,
                  status: 4
                }
                try{
                  object.fecha_inicio = $scope.dataToSave.recibos_poliza[index].fecha_inicio ? datesFactory.toDate($scope.dataToSave.recibos_poliza[index].fecha_inicio): $scope.dataToSave.recibos_poliza[index].fecha_inicio
                  object.fecha_fin = $scope.dataToSave.recibos_poliza[index].fecha_fin ? datesFactory.toDate($scope.dataToSave.recibos_poliza[index].fecha_fin): $scope.dataToSave.recibos_poliza[index].fecha_fin
                  object.vencimiento = $scope.dataToSave.recibos_poliza[index].vencimiento ? datesFactory.toDate($scope.dataToSave.recibos_poliza[index].vencimiento): $scope.dataToSave.recibos_poliza[index].vencimiento
                  
                }catch(e){
                  console.log('--eroror fecha',e)
                }
                $http.patch(item.url, object).then(function(req){

                });
              }
              if($scope.dataToSave.receipts.length == (index + 1)){
                activate();
                $scope.dataToSave = {}
                $scope.selectCerficate($scope.newCertificate);
              }
            });
          }else{
            activate();
            $scope.selectCerficate($scope.newCertificate); 
          }
        }
      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    $scope.$watch("order.searchContratante.value",function(newValue, oldValue){
      if(order.searchContratante){
        if(order.searchContratante.value.address_contractor){
          $scope.contractorLayout.id = order.searchContratante.value.id;
          $scope.contractorLayout.name = order.searchContratante.val;
          $scope.contractorLayout.contractor = order.searchContratante.value;
          if(order.searchContratante.value.address_contractor || (order.searchContratante.value.type_person ==1 || order.searchContratante.value.type_person =='Física')){
            $scope.contractorLayout.type = 1;
            $scope.contractorLayout.address = order.searchContratante.value.address_contractor;
          }else{
            $scope.contractorLayout.type = 2;
            $scope.contractorLayout.address = order.searchContratante.value.address_contractor;
          }
        }
      }
    });

    $scope.paqueteAll = function(paq){
      $http.post(url.IP+ 'paquetes-data-by-subramo/',
        {'ramo': $scope.dataCaratula.ramo.id, 'subramo':$scope.dataCaratula.subramo.id,'provider':$scope.dataCaratula.aseguradora.id })
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
    $scope.createIndividualCertificate = function(){
      $rootScope.show_contractor = false;
      $scope.dataToSave = {
        recalcular: true
      };
      $scope.directiveReceipts.is_edit = false;
      $scope.isEdit = false;
      $scope.newCertificate = undefined;

      $http.post(url.IP + 'paquetes-data-by-subramo/',
      {'ramo': $scope.dataCaratula.ramo ? $scope.dataCaratula.ramo.id :$scope.dataCaratula.ramo, 'subramo': $scope.dataCaratula.subramo.id, 'provider': $scope.caratula.aseguradora.id ? $scope.caratula.aseguradora.id : $scope.caratula.aseguradora})
      .then(function success(response){
        if(response.status === 200) {
          $scope.packages = [];
          if(response.data.length) {
            $scope.packages = response.data;
          }
        }
      })
      .catch(function (error) {
        console.log('error', error);
      });
      $scope.newCertificate = {};
      $scope.newCertificate.certificate_number = '';
      $scope.newCertificate.contractor = '';
      order.contratante = {};
      $scope.newCertificate.rec_antiguedad = datesFactory.convertDate(new Date());
      $scope.newCertificate.start_of_validity = datesFactory.convertDate($scope.caratula.start_of_validity);
      $scope.newCertificate.end_of_validity = datesFactory.convertDate($scope.caratula.end_of_validity);
      var date1 = new Date($scope.newCertificate.start_of_validity);
      var date2 = new Date($scope.newCertificate.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      $scope.newCertificate.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      $scope.newCertificate.p_neta = '';
      $scope.newCertificate.rpf = '';
      $scope.newCertificate.derecho = '';
      $scope.newCertificate.iva = '';
      $scope.newCertificate.p_total = '';
      $scope.newCertificate.comision = '';

      if($scope.dataCaratula.subramo.subramo_code == 9){
        $scope.newCertificate.datos = {
          adjustment: '',
          beneficiary_address: '',
          beneficiary_rfc: '',
          brand: '',
          car_owner: '',
          charge_type:  $scope.types[0],
          color: '',
          driver: '',
          email: '',
          engine: '',
          license_plates: '',
          model: '',
          mont_adjustment: 0,
          mont_special_team: 0,
          no_employee: '',
          preferential_benefiaciary: '',
          procedencia:  $scope.procedencias[0],
          serial: '',
          service: '',
          special_team: '',
          sum_insured: 0,
          usage:  $scope.usages[0],
          version: '',
          year: '',
        }
      }
      if($scope.dataToSave.poliza){
        $scope.dataToSave.poliza.derecho = 0 
        $scope.dataToSave.poliza.iva = 0 
        $scope.dataToSave.poliza.primaNeta = 0 
        $scope.dataToSave.poliza.primaTotal = 0 
        $scope.dataToSave.poliza.receipts = [] 
        $scope.dataToSave.poliza.derecho = 0 
        $scope.dataToSave.poliza.rpf = 0 
        $scope.dataToSave.poliza.subTotal = 0 
      }
      $scope.dataToSave.receipts = [] 
      $scope.showItemCertificate(3);
      $scope.copy_inicio = angular.copy($scope.newCertificate.start_of_validity);
      $scope.copy_fin = angular.copy($scope.newCertificate.end_of_validity);
      $scope.checkDate($scope.copy_inicio);
      $scope.checkEndDate($scope.copy_fin);
      $scope.defaults = {};
      $scope.defaults.comisiones = [];
      $scope.directiveReceipts.subramo = $scope.dataCaratula.subramo;
      if($scope.dataCaratula){
        if($scope.dataCaratula.clave.clave_comision.length) {
          $scope.directiveReceipts.comisiones = $scope.defaults.comisiones;
          $scope.directiveReceipts.comisiones =$scope.dataCaratula.clave.clave_comision
          if($scope.defaults.comisiones.length == 1){
            $scope.directiveReceipts.comision = $scope.defaults.comisiones[0];
            $scope.selectComision($scope.directiveReceipts.comision);
          }
        } else {
        }
      }       
      $scope.dataToSave.poliza = {
        primaNeta: parseFloat($scope.newCertificate.p_neta ? $scope.newCertificate.p_neta : 0),
        rpf: parseFloat($scope.newCertificate.rpf ? $scope.newCertificate.rpf : 0),
        derecho: parseFloat($scope.newCertificate.derecho ? $scope.newCertificate.derecho : 0),
        subTotal: parseFloat($scope.newCertificate.sub_total ? $scope.newCertificate.sub_total : 0),
        iva: parseFloat($scope.newCertificate.iva  ? $scope.newCertificate.iva : 0),
        primaTotal: parseFloat($scope.newCertificate.p_total ? $scope.newCertificate.p_total : 0)
      };
      $scope.checkDate($scope.newCertificate.end_of_validity)
      // contratante*************
      var myInsuranceContractor = $stateParams.dataContractor;
      if(myInsuranceContractor && myInsuranceContractor.url){
        var contrac = {};
        contrac.contratanteId = myInsuranceContractor.id;
        if(myInsuranceContractor.type_person == 1){
          contrac.type = "fisicas";
        }
        if(myInsuranceContractor.type_person == 2){
          contrac.type = "morales";
        }
        $scope.showPol=true;
        $scope.showCar=true;
        ContratanteService.getContratanteFull(contrac)
        .then(function(contractor) {
          order.contratante = contractor;
          if(contractor.first_name){
            order.contratante.val = contractor.first_name + ' ' + contractor.last_name + ' ' + contractor.second_last_name;
          }
          if(contractor.full_name){
            order.contratante.val = contractor.full_name;
          }
          if(contractor.address_contractor){
            $scope.addresses = contractor.address_contractor;
          }
          $scope.newCertificate.address = $scope.addresses[0];
          order.contratante.value = contractor;
          $scope.info_sub = order.contratante.value;
          if($localStorage['datos_pdf_flotilla'] && $localStorage['datos_pdf_flotilla'].data){
            $http({
              method: 'POST',
              url: url.IP + 'get_caratula_polizas/',
              data: {
                caratula: $scope.caratula.id
              }
            })
            .then(function success(response){
              if(response.status == 200){
                $scope.dataCaratula = response.data.data.caratula;
                $http.post(url.IP + 'paquetes-data-by-subramo/',
                {'ramo': $scope.dataCaratula.ramo.id, 'subramo': $scope.dataCaratula.subramo.id, 'provider': $scope.dataCaratula.aseguradora ? $scope.dataCaratula.aseguradora.id : $scope.caratula.aseguradora.id})
                .then(function success(response){
                  if(response.status === 200) {
                    $scope.packages = [];
                    if(response.data.length) {
                      $scope.packages = response.data;
                      $scope.packages.forEach(function(pack){
                        if($scope.newCertificate && $scope.newCertificate.paquete && (pack.id == $scope.newCertificate.paquete.id)){
                          $scope.newCertificate.paquete = pack;
                        }
                      });
                    }
                  }
                })
                .catch(function (error) {
                  console.log('error paquetes', e);
                });
                $scope.cargarInfoPDF($localStorage['datos_pdf_flotilla']);  
              }
            })
            .catch(function(e){
              console.log('error', e);
            });         
          }    
          $scope.show_section(2)     
        });
      }
      // !!********************************+!!
    };
    function extractNum(s) {
      var m = (s || '').match(/\b(\d{2,3})\b/); // 60, 70, 80, 90, 100...
      return m ? m[1] : null;
    }
    function slug(s){
      return (s||'').toString()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'') // sin acentos
        .replace(/[^a-z0-9]+/g,'-')
        .replace(/^-+|-+$/g,'');
    }

    function norm(s) {
      if (!s) return "";
      return s
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
        .replace(/est(an|and)ar/g, 'estandar')            // normaliza variantes
        .replace(/[^a-z0-9 ]/g, ' ')                      // quita signos
        .replace(/\s+/g, ' ')                             // espacios únicos
        .trim();
    }
    function scorePackage(itemName, target) {
      var a = norm(itemName);
      var b = norm(target);
      if (!a || !b) return 0;

      var score = 0;
      if (a === b) score = 100;
      else if (a.startsWith(b) || b.startsWith(a)) score = 85;
      else if (a.includes(b) || b.includes(a)) score = 70;

      var na = extractNum(a), nb = extractNum(b);
      if (na && nb && na === nb) score += 15;
      if (a.includes('estandar') && b.includes('estandar')) score += 10;

      return score;
    }
    function pickBestPackageOriginal(packages, targetName) {
      if(targetName=='Responsabilidad Civil'){
        if(order && order.form && order.form.aseguradora && order.form.aseguradora.alias && (order.form.aseguradora.alias=='GNP' || order.form.aseguradora.alias=='GNP Seguros'))
        targetName='RC'
      }
      if (!Array.isArray(packages) || !packages.length) return { best: null, score: 0, index: -1 };

      var best = null;
      var bestScore = -1;
      var bestIdx = -1;

      for (var idx = 0; idx < packages.length; idx++) {
        var pkg  = packages[idx];
        var name = (pkg && pkg.package_name) ? pkg.package_name : '';
        var s    = scorePackage(name, targetName);

        function tieBreak() {
          var bestName = (best && best.package_name) ? best.package_name : '';
          var aNum = extractNum(norm(name));
          var bNum = extractNum(norm(bestName));
          var tNum = extractNum(norm(targetName));

          if (aNum && !bNum) return true;                         // prioriza quien tenga número
          if (aNum && bNum && tNum && aNum === tNum) return true; // número igual al target
          if ((name || '').length > (bestName || '').length) return true; // nombre más largo
          return false;
        }

        if (s > bestScore || (s === bestScore && tieBreak())) {
          best = pkg;
          bestScore = s;
          bestIdx = idx;
        }
      }
      return { best: best, score: bestScore, index: bestIdx };
    }
    $scope.asignarPaquete = function(){
      var res   = pickBestPackageOriginal($scope.packages, $scope.read_pdf_pf.data.cobertura);
      var best  = res ? res.best  : null;
      var score = res ? res.score : null;
      var cobertura=$scope.read_pdf_pf.data.cobertura;
      $scope.packages=$scope.packages;
      // ---------------
      var encontardo_paquete=false;
      if (best) {
        $scope.paqueteSelectedObject = best;
        encontardo_paquete=false;
        // console.log('✅ Mejor match:', best.package_name, 'score:', score);
      } else {
        $scope.paqueteSelectedObject=null;
        encontardo_paquete=true;
        console.warn('No hubo coincidencias');
      }
      if(!encontardo_paquete){
        $scope.paqueteSelected = true;
        $scope.newCertificate.paquete = $scope.paqueteSelectedObject;
        $scope.yaseestableciopaquete=true;
      }else{
        $scope.packages.forEach(function(item){
          var s = scorePackage(item.package_name, target);
          if (s > bestScore) { bestScore = s; best = item; }
          if((item.package_name).toLowerCase() && $scope.read_pdf_pf.data.cobertura.toLowerCase()){
            if (((item.package_name.toLowerCase() == $scope.read_pdf_pf.data.cobertura.toLowerCase())
              || ( item.package_name.toLowerCase().includes($scope.read_pdf_pf.data.cobertura.toLowerCase()))
              && !$scope.paqueteSelected) || best && $scope.yaseestableciopaquete==false){
              $scope.paqueteSelected = true;
              $scope.newCertificate.paquete = item;
              $scope.yaseestableciopaquete=true;
              $scope.newCertificate.paquete = item; 
            }
          }
        }) 
      }
    }
    $scope.cargarInfoPDF = function(datp){      
      $scope.read_pdf_pf=$localStorage['datos_pdf_flotilla'];
      if($scope.read_pdf_pf && $scope.read_pdf_pf.data){
        if ($scope.read_pdf_pf.data['Numero de poliza']){
          $scope.newCertificate.poliza_number=$scope.read_pdf_pf.data['Numero de poliza'];
        }
        if ($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']){
          if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='pesos'){
            $scope.newCertificate.f_currency=1;
          }
          if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='nacional'){
            $scope.newCertificate.f_currency=1;
          }
          if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='dolares'){
            $scope.newCertificate.f_currency=2;
          }
          if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='udi'){
            $scope.newCertificate.f_currency=3;
          }
          if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='euro'){
            $scope.newCertificate.f_currency=4;
          }
          if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='extranjera'){
            $scope.newCertificate.f_currency=2;
          }
        }
        if ($scope.read_pdf_pf.data['fecha_inicio']){
          $scope.newCertificate.start_of_validity=$scope.read_pdf_pf.data['fecha_inicio'];
        }
        if ($scope.read_pdf_pf.data['fecha_fin']){
          $scope.newCertificate.end_of_validity=$scope.read_pdf_pf.data['fecha_fin'];
        }
        // if ($scope.read_pdf_pf.data['Primas']['Forma_de_Pago']){
        //   $scope.newCertificate.forma_de_pago=$scope.read_pdf_pf.data['Primas']['Forma_de_Pago'];
        // }
        if ($scope.read_pdf_pf.data['Datos generales de la poliza']['Forma de pago']){
          $scope.newCertificate.forma_de_pago=$scope.read_pdf_pf.data['Datos generales de la poliza']['Forma de pago'];
        }
        if($scope.newCertificate.forma_de_pago){
          $scope.frequencies.forEach(function(item){
            if(item.value ==$scope.newCertificate.forma_de_pago){
              $scope.newCertificate.forma_de_pago = item;
              $scope.directiveReceipts.payment=$scope.newCertificate.forma_de_pago;
            }
          });
        }
        if ($scope.read_pdf_pf.data['Datos del vehiculo']){
          $scope.newCertificate.datos = {};
          $scope.newCertificate.datos = {
            adjustment: '',
            beneficiary_address: '',
            beneficiary_rfc: '',
            brand: '',
            car_owner: '',
            charge_type:  $scope.types[0],
            policy_type:  $scope.types[0],
            color: '',
            driver: '',
            email: '',
            engine: '',
            license_plates: '',
            model: '',
            mont_adjustment: 0,
            mont_special_team: 0,
            no_employee: '',
            preferential_benefiaciary: '',
            procedencia:  $scope.procedencias[0],
            serial: '',
            service: '',
            special_team: '',
            sum_insured: 0,
            usage:  $scope.usages[0],
            version: '',
            year: '',
          }
          $scope.newCertificate.datos.policy_type = $scope.types[0];
          $scope.newCertificate.is_renewable=$scope.renewals[0];
          $scope.newCertificate.datos.procedencia =$scope.procedencias[0]; 
          $scope.newCertificate.datos.serial=$scope.read_pdf_pf.data['Datos del vehiculo']['serie'];
          $scope.newCertificate.datos.service=$scope.read_pdf_pf.data['Datos del vehiculo']['service'];
          if(!$scope.newCertificate.datos.service){
            if($scope.read_pdf_pf.data['Datos del vehiculo']['tipo']){
              $scope.newCertificate.datos.service = $scope.read_pdf_pf.data['Datos del vehiculo']['tipo'];
            }
          }
          $scope.newCertificate.datos.engine=$scope.read_pdf_pf.data['Datos del vehiculo']['motor'];
          $scope.newCertificate.datos.year=parseInt($scope.read_pdf_pf.data['Datos del vehiculo']['anio']);
          $scope.newCertificate.datos.brand=$scope.read_pdf_pf.data['Datos del vehiculo']['marca'];
          $scope.newCertificate.datos.model=$scope.read_pdf_pf.data['Datos del vehiculo']['modelo'];
          $scope.newCertificate.datos.adjustment='';
          $scope.newCertificate.datos.license_plates=$scope.read_pdf_pf.data['Datos del vehiculo']['placas'];
          $scope.newCertificate.datos.usage=$scope.read_pdf_pf.data['Datos del vehiculo']['uso'];
          if($scope.newCertificate.datos.usage){                  
            $scope.usages.forEach(function(item){
              if(item.value == $scope.newCertificate.datos.usage){
                $scope.newCertificate.datos.usage = item;
              }
            });
          }
          $scope.newCertificate.datos.version=$scope.read_pdf_pf.data['Datos del vehiculo']['version'];
          if(!$scope.newCertificate.datos.version){
            if($scope.read_pdf_pf.data['Datos del vehiculo']['descripcion_vehiculo']){
              $scope.newCertificate.datos.version=$scope.read_pdf_pf.data['Datos del vehiculo']['descripcion_vehiculo'];
            }
          }
        }
        if($scope.read_pdf_pf.data['Primas']){
          $scope.directiveReceipts.from_pdf = true;
          if ($scope.read_pdf_pf.data['Primas']['Prima total']) {
            $scope.directiveReceipts.primaTotal = $scope.read_pdf_pf.data['Primas']['Prima total'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Prima total'])) : $scope.read_pdf_pf.data['Primas']['IMPORTE TOTAL'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['IMPORTE TOTAL'])) : 0;
            $scope.directiveReceipts.subTotal = $scope.read_pdf_pf.data['Primas']['Subtotal'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Subtotal'])) : 0;
            $scope.directiveReceipts.from_pdf = true;
            $localStorage['primas'] = $scope.directiveReceipts;
          }
        
          if ($scope.read_pdf_pf.data['Primas']['Prima neta']) {
            $scope.directiveReceipts.primaNeta = $scope.read_pdf_pf.data['Primas']['Prima neta'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Prima neta'])) : 0;
            $scope.directiveReceipts.from_pdf = true;
            $localStorage['primas'] = $scope.directiveReceipts;
          }

          if ($scope.read_pdf_pf.data['Primas']['Gastos de expedición']) {
            try{
              $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Gastos de expedición'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Gastos de expedición'])) : 0;
              $localStorage['primas'] = $scope.directiveReceipts;
            }catch(o){
              $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Gastos de expedici\u00f3n'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Gastos de expedici\u00f3n'])) : 0;
              $localStorage['primas'] = $scope.directiveReceipts;
            }
          }
          if ($scope.read_pdf_pf.data['Primas']['Gastos por Expedición.']) {
            try{
              $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Gastos por Expedición.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Gastos por Expedición.'])) : 0;
              $localStorage['primas'] = $scope.directiveReceipts;
            }catch(o){
              $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Gastos por Expedici\u00f3n.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Gastos por Expedici\u00f3n.'])) : 0;
              $localStorage['primas'] = $scope.directiveReceipts;
            }
          }
          console.log('ccccccccc',$scope.read_pdf_pf.data['Primas'])
          if ($scope.read_pdf_pf.data['Primas']['Financiamiento por pago fraccionado']) {
            console.log('ooooooooooo',$scope.read_pdf_pf.data['Primas'])
            $scope.directiveReceipts.rpf = $scope.read_pdf_pf.data['Primas']['Financiamiento por pago fraccionado'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Financiamiento por pago fraccionado'])) : 0;
            $localStorage['primas'] = $scope.directiveReceipts;
            console.log('xxxxxxxxxxxxxxxxx',$scope.read_pdf_pf.data['Primas'])
          }
          if ($scope.read_pdf_pf.data['Primas']['Derecho de Póliza']) {
            $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Derecho de Póliza'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Derecho de Póliza'])) : 0;
            $localStorage['primas'] = $scope.directiveReceipts;
          }                  
          if ($scope.read_pdf_pf.data['Primas']['Descuento']) {
            var valor = parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Descuento'])) || 0;
            // Si el valor es negativo → convertirlo a positivo multiplicando por -1
            if (valor < 0) {
                valor = valor * -1;
            }
            $scope.directiveReceipts.descuento = valor;
            $localStorage['primas'] = $scope.directiveReceipts;
          }
          if ($scope.read_pdf_pf.data['Primas']['IVA']) {
            $scope.directiveReceipts.iva = $scope.read_pdf_pf.data['Primas']['IVA'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['IVA'])) : 0;
            $localStorage['primas'] = $scope.directiveReceipts;
          }
          if ($scope.read_pdf_pf.data['Primas'] && $scope.read_pdf_pf.data['Primas']['I.V.A.']) {
            $scope.directiveReceipts.iva = $scope.read_pdf_pf.data['Primas']['I.V.A.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['I.V.A.'])) : 0;
            $localStorage['primas'] = $scope.directiveReceipts;
          }
        }
        $scope.newCertificate.conducto_de_pago=1;
        var asegurado = $scope.read_pdf_pf.data['Datos del asegurado'] || {};
        $scope.newCertificate.from_pdf=true;
        $scope.first_name = asegurado.propietario_contratante && asegurado.propietario_contratante.trim()
          ? asegurado.propietario_contratante
          : (asegurado.contratante_full_name || '');
        $scope.first_name= sinDiacriticos($scope.first_name)
        if($scope.read_pdf_pf.data['cobertura']){
          $scope.asignarPaquete();
        }
        $scope.newCertificate.from_pdf = true
        $rootScope.readPDF = {
          individual:$scope.read_pdf_pf.data['Datos del asegurado'],
          corporation: $scope.read_pdf_pf.data['Datos del asegurado'],
          address: $scope.read_pdf_pf.data['contratante_domicilio'],
          first_name: $scope.first_name,
          last_name: $scope.read_pdf_pf.data['contratante_primer_apellido'],
          second_last_name: $scope.read_pdf_pf.data['contratante_segundo_apellido'],
          type_person: $scope.read_pdf_pf.data['persona'],

        };
        // buscar o crear contratante
        // buscar o crear contratante fin
      }     
    }
    // crear por captura | lectura PDF
    $scope.loaderPdf = false;
    $scope.fileSelected_pf={};
    $scope.fileNameChanged = function (ele) {
      $scope.fileSelected_pf={};
      $scope.filePdf = ele.files[0];
      $scope.fileSelected_pf = ele.files[0]
    };
    $scope.showFile = function (argument) {
      var reader = new FileReader();
      reader.readAsDataURL(argument.files[0]);
      $scope.fileSelected_pf = argument.files[0]
      // $scope.uploader.queue = argument.files[0]
      var reader_pdf = new FileReader();
      reader_pdf.readAsDataURL($scope.fileSelected_pf);
      $scope.urlsfile = URL.createObjectURL(argument.files[0]);
      reader_pdf.onload = function () {
        $scope.pdffile = reader_pdf.result
        $scope.okxfile = new Blob([$scope.pdffile], {type: 'application/pdf'});
        var fileURL =$scope.urlsfile
        $scope.content = $sce.trustAsResourceUrl(fileURL);
        // window.open($scope.content);
      };
      reader_pdf.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
    function generarRequestId() {
      var bytes = new Uint8Array(16);
      window.crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      var hex = Array.prototype.map.call(bytes, function(b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
      return [
        hex.substr(0,8),
        hex.substr(8,4),
        hex.substr(12,4),
        hex.substr(16,4),
        hex.substr(20)
      ].join('-');
    }
    function formatearNumero_calculate (nStr, campo) {
      try{
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        
        var cadenas = x1.split(",");
        var cadena_sin_comas = "";
        for(i = 0; i < cadenas.length;i++){
          cadena_sin_comas = cadena_sin_comas+cadenas[i];
        }
        if (cadena_sin_comas != undefined && cadena_sin_comas != 'undefined' && cadena_sin_comas !='NaN' && cadena_sin_comas !=NaN) {          
          return cadena_sin_comas+x2;  
        }else{
          return nStr;
        }
      }catch(e){
        return 0
      }
    }
    function sinDiacriticos(texto) {
      return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
    }
    $scope.contratanteCreator = function(){
      $scope.create_natural = true;
      $scope.create_juridical = true;
      $rootScope.show_contractor = true;
      $localStorage.orderForm = JSON.stringify($scope.newCertificate);
    };
    // lectura por pdf
    $scope.capturarPoliza = function(){
      if(!$scope.filePdf){            
        SweetAlert.swal("Error", "Cargue un archivo pdf para capturar.", "error");
        return;
      }
      $scope.read_pdf_pf = {};
      order.form = {};
      $localStorage['datos_pdf_flotilla'] = {};
      $localStorage['primas'] = {};
      $localStorage['defaults'] = {};
      SweetAlert.swal({
      title: "🔎 Revisión de la información extraída",
      text:
        "<p style='margin:0 0 10px;'>Antes de guardar, verifique que los datos obtenidos del PDF sean <strong>correctos</strong> y estén <strong>completos</strong>.</p>" +
        "<p style='margin:0 0 6px 0;'><strong>Aspectos clave a validar:</strong></p>" +
        "<ul style='margin:0 0 0 18px; padding:0; line-height:1.5;'>"+
        "  <li><strong>Número de póliza</strong> y <strong>vigencia</strong></li>" +
        "  <li><strong>Serie</strong> (en caso de Automóviles) y <strong>Asegurados</strong></li>" +
        "  <li><strong>Coberturas</strong> y <strong>primas</strong></li>" +
        "  <li><strong>Datos del contratante</strong>: Nombre y RFC</li>" +
        "</ul>" +
        "<p style='margin:12px 0 0; font-size:12px; color:#5f6368;'>⚠️ En caso de detectar alguna discrepancia, informe a Soporte.</p>",
      type: "warning",
      html: true,
      showCancelButton: false,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Continuar",
      closeOnConfirm: true,
      closeOnCancel: true
      }, function(isConfirm){
        if (isConfirm) {
          console.log('continuar', isConfirm);
        }
      });

      $scope.countFile = 0
      $scope.loaderPdf = true;
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url.LECTORPDF+'upload-pdf');
      var auxRamo = $scope.ramoPdf && $scope.ramoPdf.ramo_id ? $scope.ramoPdf.ramo_id : 0;

      var data = new FormData();
      var dataFile = new FormData();
      dataFile.append("arch", $scope.filePdf);
      dataFile.append("nombre", $scope.fileSelected_pf.name);
      data.append("archivo", $scope.filePdf);
      // data.append("insurance", $scope.aseguradoraPdf);
      // 3) Añade tus parámetros adicionales
      data.append("nombre", $scope.fileSelected_pf.name);
      data.append("org", $scope.orgName);
      var requestId = generarRequestId();
      data.append("requestId",requestId)
      $localStorage.dataFile = dataFile;
      $scope.fileSelected_pf.formData=[]        
      xhr.timeout = 1200000;
      xhr.ontimeout = function (e) {
        console.log('error',e)
        $scope.loaderPdf = true;
        SweetAlert.swal("Error**", "A ocurrido un error al cargar el PDF, por favor intentalo de nuevo.", "error");
      };
      xhr.send(data);
      xhr.onreadystatechange = function() {          
        if (this.readyState == 4 && this.status == 200) {
          $scope.loaderPdf = false;
          $scope.read_pdf_pf = JSON.parse(xhr.response);
          if($scope.read_pdf_pf.status != '200_OK_ACCEPTED'){
            SweetAlert.swal("Error*", "A ocurrido un error al cargar el PDF, por favor intentalo de nuevo.", "error");
          }else{
            if ($scope.read_pdf_pf.request_id !== requestId) {
              console.log('No coincide*',$scope.read_pdf_pf.request_id,requestId)    
            } 
            $localStorage['datos_pdf_flotilla'] = $scope.read_pdf_pf;
            $scope.filePdf = {}
            if($scope.read_pdf_pf && $scope.read_pdf_pf.data){
              if ($scope.read_pdf_pf.data['Numero de poliza']){
                $scope.newCertificate.poliza_number=$scope.read_pdf_pf.data['Numero de poliza'];
              }
              if ($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']){
                if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='pesos'){
                  $scope.newCertificate.f_currency=1;
                }
                if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='nacional'){
                  $scope.newCertificate.f_currency=1;
                }
                if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='dolares'){
                  $scope.newCertificate.f_currency=2;
                }
                if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='udi'){
                  $scope.newCertificate.f_currency=3;
                }
                if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='euro'){
                  $scope.newCertificate.f_currency=4;
                }
                if(($scope.read_pdf_pf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='extranjera'){
                  $scope.newCertificate.f_currency=2;
                }
              }
              if ($scope.read_pdf_pf.data['fecha_inicio']){
                $scope.newCertificate.start_of_validity=$scope.read_pdf_pf.data['fecha_inicio'];
              }
              if ($scope.read_pdf_pf.data['fecha_fin']){
                $scope.newCertificate.end_of_validity=$scope.read_pdf_pf.data['fecha_fin'];
              }
              if ($scope.read_pdf_pf.data['Datos generales de la poliza']['Forma de pago']){
                $scope.newCertificate.forma_de_pago=$scope.read_pdf_pf.data['Datos generales de la poliza']['Forma de pago'];
              }
              if($scope.newCertificate.forma_de_pago){
                $scope.frequencies.forEach(function(item){
                  if(item.value ==$scope.newCertificate.forma_de_pago){
                    $scope.newCertificate.forma_de_pago = item;
                    $scope.directiveReceipts.payment=$scope.newCertificate.forma_de_pago;
                  }
                });
              }
              if ($scope.read_pdf_pf.data['Datos del vehiculo']){
                $scope.newCertificate.datos = {};
                $scope.newCertificate.datos = {
                  adjustment: '',
                  beneficiary_address: '',
                  beneficiary_rfc: '',
                  brand: '',
                  car_owner: '',
                  charge_type:  $scope.types[0],
                  policy_type:  $scope.types[0],
                  color: '',
                  driver: '',
                  email: '',
                  engine: '',
                  license_plates: '',
                  model: '',
                  mont_adjustment: 0,
                  mont_special_team: 0,
                  no_employee: '',
                  preferential_benefiaciary: '',
                  procedencia:  $scope.procedencias[0],
                  serial: '',
                  service: '',
                  special_team: '',
                  sum_insured: 0,
                  usage:  $scope.usages[0],
                  version: '',
                  year: '',
                }
                $scope.newCertificate.is_renewable=$scope.renewals[0];
                $scope.newCertificate.datos.policy_type = $scope.types[0];
                $scope.newCertificate.datos.procedencia =$scope.procedencias[0]; 
                $scope.newCertificate.datos.serial=$scope.read_pdf_pf.data['Datos del vehiculo']['serie'];
                $scope.newCertificate.datos.service=$scope.read_pdf_pf.data['Datos del vehiculo']['service'];
                if(!$scope.newCertificate.datos.service){
                  if($scope.read_pdf_pf.data['Datos del vehiculo']['tipo']){
                    $scope.newCertificate.datos.service = $scope.read_pdf_pf.data['Datos del vehiculo']['tipo'];
                  }
                }
                $scope.newCertificate.datos.engine=$scope.read_pdf_pf.data['Datos del vehiculo']['motor'];
                $scope.newCertificate.datos.year=parseInt($scope.read_pdf_pf.data['Datos del vehiculo']['anio']);
                $scope.newCertificate.datos.brand=$scope.read_pdf_pf.data['Datos del vehiculo']['marca'];
                $scope.newCertificate.datos.model=$scope.read_pdf_pf.data['Datos del vehiculo']['modelo'];
                $scope.newCertificate.datos.adjustment='';
                $scope.newCertificate.datos.license_plates=$scope.read_pdf_pf.data['Datos del vehiculo']['placas'];
                $scope.newCertificate.datos.usage=$scope.read_pdf_pf.data['Datos del vehiculo']['uso'];
                if($scope.newCertificate.datos.usage){                  
                  $scope.usages.forEach(function(item){
                    if(item.value == $scope.newCertificate.datos.usage){
                      $scope.newCertificate.datos.usage = item;
                    }
                  });
                }
                $scope.newCertificate.datos.version=$scope.read_pdf_pf.data['Datos del vehiculo']['version'];
                if(!$scope.newCertificate.datos.version){
                  if($scope.read_pdf_pf.data['Datos del vehiculo']['descripcion_vehiculo']){
                    $scope.newCertificate.datos.version=$scope.read_pdf_pf.data['Datos del vehiculo']['descripcion_vehiculo'];
                  }
                }
              }
              if($scope.read_pdf_pf.data['Primas']){
                $scope.directiveReceipts.from_pdf = true;
                if ($scope.read_pdf_pf.data['Primas']['Prima total']) {
                  $scope.directiveReceipts.primaTotal = $scope.read_pdf_pf.data['Primas']['Prima total'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Prima total'])) : $scope.read_pdf_pf.data['Primas']['IMPORTE TOTAL'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['IMPORTE TOTAL'])) : 0;
                  $scope.directiveReceipts.subTotal = $scope.read_pdf_pf.data['Primas']['Subtotal'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Subtotal'])) : 0;
                  $scope.directiveReceipts.from_pdf = true;
                  $localStorage['primas'] = $scope.directiveReceipts;
                }
              
                if ($scope.read_pdf_pf.data['Primas']['Prima neta']) {
                  $scope.directiveReceipts.primaNeta = $scope.read_pdf_pf.data['Primas']['Prima neta'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Prima neta'])) : 0;
                  $scope.directiveReceipts.from_pdf = true;
                  $localStorage['primas'] = $scope.directiveReceipts;
                }

                if ($scope.read_pdf_pf.data['Primas']['Gastos de expedición']) {
                  try{
                    $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Gastos de expedición'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Gastos de expedición'])) : 0;
                    $localStorage['primas'] = $scope.directiveReceipts;
                  }catch(o){
                    $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Gastos de expedici\u00f3n'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Gastos de expedici\u00f3n'])) : 0;
                    $localStorage['primas'] = $scope.directiveReceipts;
                  }
                }
                if ($scope.read_pdf_pf.data['Primas']['Gastos por Expedición.']) {
                  try{
                    $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Gastos por Expedición.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Gastos por Expedición.'])) : 0;
                    $localStorage['primas'] = $scope.directiveReceipts;
                  }catch(o){
                    $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Gastos por Expedici\u00f3n.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Gastos por Expedici\u00f3n.'])) : 0;
                    $localStorage['primas'] = $scope.directiveReceipts;
                  }
                }
                if ($scope.read_pdf_pf.data['Primas']['Financiamiento por pago fraccionado']) {
                  $scope.directiveReceipts.rpf = $scope.read_pdf_pf.data['Primas']['Financiamiento por pago fraccionado'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Financiamiento por pago fraccionado'])) : 0;
                  $localStorage['primas'] = $scope.directiveReceipts;
                }
                if ($scope.read_pdf_pf.data['Primas']['Derecho de Póliza']) {
                  $scope.directiveReceipts.derecho = $scope.read_pdf_pf.data['Primas']['Derecho de Póliza'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Derecho de Póliza'])) : 0;
                  $localStorage['primas'] = $scope.directiveReceipts;
                }                  
                if ($scope.read_pdf_pf.data['Primas']['Descuento']) {
                  var valor = parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['Descuento'])) || 0;
                  // Si el valor es negativo → convertirlo a positivo multiplicando por -1
                  if (valor < 0) {
                      valor = valor * -1;
                  }
                  $scope.directiveReceipts.descuento = valor;
                  $localStorage['primas'] = $scope.directiveReceipts;
                }
                if ($scope.read_pdf_pf.data['Primas']['IVA']) {
                  $scope.directiveReceipts.iva = $scope.read_pdf_pf.data['Primas']['IVA'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['IVA'])) : 0;
                  $localStorage['primas'] = $scope.directiveReceipts;
                }
                if ($scope.read_pdf_pf.data['Primas'] && $scope.read_pdf_pf.data['Primas']['I.V.A.']) {
                  $scope.directiveReceipts.iva = $scope.read_pdf_pf.data['Primas']['I.V.A.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_pf.data['Primas']['I.V.A.'])) : 0;
                  $localStorage['primas'] = $scope.directiveReceipts;
                }
              }
              var asegurado = $scope.read_pdf_pf.data['Datos del asegurado'] || {};
              $scope.first_name = asegurado.propietario_contratante && asegurado.propietario_contratante.trim()
                ? asegurado.propietario_contratante
                : (asegurado.contratante_full_name || '');
              $scope.first_name= sinDiacriticos($scope.first_name)
              $scope.newCertificate.conducto_de_pago=1;
              $scope.newCertificate.from_pdf = true;
              $rootScope.readPDF = {
                individual:$scope.read_pdf_pf.data['Datos del asegurado'],
                corporation: $scope.read_pdf_pf.data['Datos del asegurado'],
                address: $scope.read_pdf_pf.data['contratante_domicilio'],
                first_name: $scope.first_name,
                last_name: $scope.read_pdf_pf.data['contratante_primer_apellido'],
                second_last_name: $scope.read_pdf_pf.data['contratante_segundo_apellido'],
                type_person: $scope.read_pdf_pf.data['persona'],

              };
              // buscar o crear contratante
              $scope.read_pdf_pf_contractor = {};
              if(($scope.read_pdf_pf.data['persona']==2)){
                $scope.read_pdf_pf_contractor.type = false;
                $scope.read_pdf_pf_contractor.name =$scope.read_pdf_pf.data['contratante_full_name'];
              }else{
                $scope.read_pdf_pf_contractor.type = true;
                // $scope.read_pdf_pf_contractor.name = $scope.read_pdf_pf.data['Datos del asegurado']['propietario_contratante']                
                $scope.read_pdf_pf_contractor.name = $scope.read_pdf_pf.data['contratante_full_name']                
              }
              $scope.show_contratante = 'contractors-match/';
              $http.post(url.IP + $scope.show_contratante, 
                {
                  'matchWord': $scope.read_pdf_pf_contractor.name,
                  'poliza': true
                })
              .then(function(response){
                if(response.status === 200){
                  if(response.data != 404){
                    if(response.data.contractors.length){
                        if(response.data.contractors.length){                          
                          for(var i = 0; i < response.data.contractors.length; i++){
                            var reg = /\d{,}/g
                            var reg2 = /\d{.}/g
                            var nombre_pdf = ($scope.read_pdf_pf_contractor.name.replace(reg, "")).toLowerCase();
                            var nombre_pdf = (nombre_pdf.replace(reg2, "")).toLowerCase();
                            var nombre_api = (response.data.contractors[i].full_name.replace(reg, "")).toLowerCase();
                            var nombre_api = (nombre_pdf.replace(reg2, "")).toLowerCase();
                            if((((nombre_pdf).replace(',','')).replace('.','')).toLowerCase() == (((nombre_api).replace(',','')).replace('.','')).toLowerCase()){
                              order.contratante.val = response.data.contractors[i].full_name;
                              order.contratante.value = response.data.contractors[i];
                              order.contratante.phone = response.data.contractors[i].phone;
                              order.contratante.email = response.data.contractors[i].email;
                            }
                            if((i + 1) == response.data.contractors.length){
                              if(!order.contratante.value){
                                $scope.objetoPoliza = $scope.newCertificate;
                                $scope.contratanteCreator();
                              }
                            }
                          }
                        }else{
                          $scope.objetoPoliza = $scope.newCertificate;
                          $scope.contratanteCreator();
                        }
                      // }
                    }else{
                      $scope.objetoPoliza = $scope.newCertificate;
                      $scope.contratanteCreator();
                    }
                  }else{
                    $scope.objetoPoliza = $scope.newCertificate;
                    $scope.contratanteCreator();
                  }
                }else{
                  $scope.objetoPoliza = $scope.newCertificate;
                  $scope.contratanteCreator();
                }
              });
              // buscar o crear contratante fin
              if($scope.read_pdf_pf.data['cobertura']){
                $scope.asignarPaquete();
              }

            }            
          }
        }else{
          // 1) Obtener cuerpo
          var body = (xhr && (xhr.responseText || xhr.response)) || null;
          // 2) Parseo seguro
          var obj = null;
          if (body && typeof body === 'string') {
            try { obj = JSON.parse(body); } catch (e) { obj = null; }
          } else if (body && typeof body === 'object') {
            obj = body;
          }

          // 3) Mensaje
          var fallback = "Ha ocurrido un error al cargar el PDF; por favor inténtalo de nuevo.";
          var msg = (obj && (obj.data && obj.data.error)) || (obj && obj.error) || '';
          var reqId = obj && (obj.request_id || obj.requestId);
          // 4) Pintar (forzar digest si estás fuera de Angular)
          if(msg){
            $scope.$applyAsync(function () {
              $scope.loaderPdf = false;
              SweetAlert.swal({
                title: "Info",
                text: reqId ? (msg) : msg,
                type: "info",
                confirmButtonText: "Entendido"
              });
            });
          }
        }
      };
      xhr.onerror = function() {
        console.error("❌ Error de red / servidor");
        $scope.loaderPdf = false;
        SweetAlert.swal("Info", "Ha ocurrido un error al cargar el PDF; por favor inténtalo de nuevo o, contacte con soporte (servidor).", "info");
      };
    };
    
    // captura por PDF lectura Autos
    $scope.checkNumSerie = function () {
      if($scope.newCertificate.datos.serial){
        helpers.existSerial($scope.newCertificate.datos.serial)
        .then(function(request) {
          if(request.exist == true) {
            SweetAlert.swal("Información","La SERIE del AUTO ya existe en otra póliza vigente: "+request.poliza, "info")
            // newCertificate.datos.serial = '';
          }
        })
        .catch(function(err) {

        });
      }
    };
    function save_info_tab (){
      $localStorage.save_edition_flotilla_poliza = angular.copy($scope.newCertificate);
      $localStorage.save_edition_flotilla_poliza['contrator'] = order.contratante
    }

    $scope.changePayment = function(param){
      $scope.directiveReceipts.payment = $scope.newCertificate.forma_de_pago.value;
      $scope.directiveReceipts.subramo = $scope.dataCaratula.subramo;
      $scope.directiveReceipts.comisiones = $scope.dataCaratula.clave ? $scope.dataCaratula.clave.clave_comision : [];
      $localStorage.save_edition_flotilla_poliza['forma_de_pago'] = $scope.newCertificate.forma_de_pago
    };
    $scope.selectComision = function (param) {
      $scope.newCertificate.comision_percent = param.comission;
      $scope.newCertificate.udi = param.udi;
      $scope.newCertificate.comision_percent = param.comission;
      $scope.newCertificate.udi = param.udi;
    };
    $scope.validateExcel = function(param){
      $scope.excelJson = [];
      var flagCertificate = false;
      if(param.FLOTILLA){
        if($scope.caratula.subramo == 'Automóviles'){
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
            }else{
              if(isNaN(item.AÑO)){
                SweetAlert.swal('Error', 'Formato inválido de la linea ' + (parseInt(item.__rowNum__) + 1) +' de la columna AÑO, corrige el error y vuelve a subir el excel.', 'error');
                flagCertificate = true;
              }
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
    };

    $scope.changeViews = function(){
      $scope.excelJsonViews = [];
      // $scope.excelJson.forEach(function(item, index){
      //   if((index + 1) >= $scope.valueInitial && index < $scope.valueFinal){
      //     $scope.excelJsonViews.push(item);
      //   }
      // });
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
    function get_claves() {
      var date = new Date($scope.newCertificate.startDate);
      if(isNaN(date)) {
        var date = new Date(mesDiaAnio($scope.newCertificate.startDate));
      }         
      $http.get(url.IP+'claves-by-provider/'+$scope.caratula.aseguradora.id)
        .then(
          function success(clavesResponse) {
              
            clavesResponse.data.forEach(function(clave) {
              clave.clave_comision.forEach(function(item) {
                item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
              });
            });

            order.defaults.claves=clavesResponse.data;
            if(order.defaults.claves.length== 1) {
                try{
                  order.form.comision_percent = (order.form.clave.comission);
                  order.form.udi = (order.form.clave.udi);
                }
                catch(e){}
            }
        },
        function error (e) {
           console.log('Error - claves-by-provider', e);
        })
        .catch(function (error) {
          console.log('Error - claves-by-provider - catch', error);
        });
    }
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
                beneficiary_name:  item.BENEFICIARIO_PREFERENTE ? item.BENEFICIARIO_PREFERENTE : null,
                preferential_benefiaciary: item.BENEFICIARIO_PREFERENTE ? item.BENEFICIARIO_PREFERENTE : null,
                beneficiary_rfc: item.BENEFICIARIO_RFC ? item.BENEFICIARIO_RFC : null,
                beneficiary_address: item.BENEFICIARIO_DIRECCION ? item.BENEFICIARIO_DIRECCION : null,
              }
            ];
            $scope.allReceipts.forEach(function(receipt, index){
              if(receipt.prima_neta && receipt.rpf && receipt.derecho){
                if(receipt.poliza == item.NO_POLIZA){
                  receipt['conducto_de_pago'] = parseInt(item.CONDUCTO_DE_PAGO) ? item.CONDUCTO_DE_PAGO : 1;
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
            $scope.contractorP = item.CONTRATANTE
            var certificateData = {
              accidents_policy: [],
              address: parseInt(item.DIRECCION),
              aseguradora: $scope.dataCaratula.aseguradora.id,
              automobiles_policy: dataCar,
              business_line: $scope.dataCaratula.business_line,
              caratula: $scope.dataCaratula.id,
              celula: $scope.caratula.celula_id,
              clave: $scope.dataCaratula.clave.id,
              coverageInPolicy_policy: [],
              damages_policy: [],
              document_type: 12,
              end_of_validity: datesFactory.toDate(item.VIGENCIA_FIN),
              endorsement: false,
              collection_executive: $scope.dataCaratula.collection_executive ? $scope.dataCaratula.collection_executive.id : null,
              f_currency: parseInt(item.MONEDA),
              folio: item.FOLIO ? item.FOLIO : '',
              forma_de_pago: parseInt(item.FRECUENCIA_PAGO),
              groupinglevel: $scope.caratula.subsubgrouping_level ? $scope.caratula.subsubgrouping_level.id : $scope.caratula.subgrouping_level ? $scope.caratula.subgrouping_level.id : $scope.caratula.grouping_level ? $scope.caratula.grouping_level.id : null,
              identifier: item.MARCA + '_' + item.MODELO + '_' + item.AÑO,
              internal_number: null,
              is_renewable: item.RENOVABLE ? item.RENOVABLE : null,
              // juridical: parseInt($scope.juridicalP),
              life_policy: [],
              // natural: parseInt($scope.naturalP),
              contractor: parseInt($scope.contractorP),
              old_policies: [],
              paquete: parseInt(item.PAQUETE),
              parent: $scope.dataCaratula.url,
              // poliza: $scope.obj_poliza,
              poliza_number: item.NO_POLIZA,
              ramo: $scope.dataCaratula.ramo.id,
              recibos_poliza: $scope.recibosIndividuales,
              responsable: $scope.dataCaratula.collection_executive ? $scope.dataCaratula.collection_executive.id : null,
              state_circulation: item.ESTADO_CIRCULACION ? parseInt(item.ESTADO_CIRCULACION) : '',
              start_of_validity: datesFactory.toDate(item.VIGENCIA_INICIO),
              status: 14,
              sucursal: item.SUCURSAL ? parseInt(item.SUCURSAL) : null,
              subramo: $scope.dataCaratula.subramo.id,
              observations: item.OBSERVACIONES ? item.OBSERVACIONES : null,
              p_neta: item.PRIMA_NETA ? item.PRIMA_NETA : 0,
              descuento: item.DESCUENTO ? item.DESCUENTO : 0,
              rpf: item.RPF ? item.RPF : 0,
              derecho: item.DERECHO ? item.DERECHO : 0,
              sub_total: $scope.obj_poliza.subTotal ? parseFloat($scope.obj_poliza.subTotal).toFixed(2) : 0,
              iva: item.IVA ? item.IVA : 0,
              p_total: item.PRIMA_TOTAL ? item.PRIMA_TOTAL : 0,
              comision: item.COMISION ? item.COMISION : 0,
              comision_percent: item.PORCENTAJE_COMISION ? item.PORCENTAJE_COMISION : 0,
              conducto_de_pago : parseInt(item.CONDUCTO_DE_PAGO) ? item.CONDUCTO_DE_PAGO : 1
            };
            if ($scope.policy_history.length > 0) {
              if ($scope.caratula_renovada) {
                certificateData.caratula_renovada = $scope.caratula_renovada
              }
            }else{
              console.log('--no es renovación--',$scope.policy_history)
            }
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
          $localStorage.saved_flotilla_info = {};
          var params = {
            'model': 18,
            'event': "POST",
            'associated_id': $scope.caratula.id,
            'identifier': " agregó pólizas individuales."
          }

          dataFactory.post('send-log/', params).then(function success(responselog) {

          });
          SweetAlert.swal("¡Listo!", "Pólizas individuales creadas exitosamente.", 'success');
          activate();
          $scope.showItemCertificate(1);
        }else{
          $scope.loader = false;
          SweetAlert.swal("ERROR", "Ócurrio un error al cargar las pólizas.\n"+response.data.data,"error");
          $scope.cancelCertificates();
        }
      })
      .catch(function (e) {
        l.stop();
        console.log('error - caratula - catch', e);
      });
    };

    $scope.addEmailsConfirmPolicy = function(insurance, param){
      insurance.contratante = param;
      insurance.poliza = $scope.caratula;
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
        activate();
      });
    };

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

    $scope.showEndorsementsCertificate = function(item){
      $scope.infoFlagCertificate = false;
      $scope.endorsementFlagCertificate = true;
      $scope.siniesterFlagCertificate = false;

      $http({
        method: 'GET',
        url: url.IP + 'view-endosos',
        params: {
          policy: item.id
        }
      })
      .then(function success(response){
        $scope.endorsementsCertificate = response.data.endosos;
      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    $scope.showSinistersCertificate = function(item){
      $scope.infoFlagCertificate = false;
      $scope.endorsementFlagCertificate = false;
      $scope.siniesterFlagCertificate = true;

      $http({
        method: 'GET',
        url: url.IP + 'view-sinister',
        params: {
          policy: item.id
        }
      })
      .then(function success(response){
        $scope.sinistersCertificate = response.data.siniestros;
      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    $scope.infoSinister = function(sinister){
      if($scope.caratula.ramo.ramo_name == 'Accidentes y Enfermedades'){
        $scope.open_in_same_tab_natural('Información siniestro', 'siniestros.info', {siniestroId: sinister.id}, 0);
        // $state.go('siniestros.info',{siniestroId: sinister.id});
      }else if (($scope.caratula.ramo.ramo_name == 'Daños' && $scope.caratula.subramo.subramo_name == 'Automóviles') || ($scope.caratula.ramo == 'Daños' && $scope.caratula.subramo == 'Automóviles')){
        $scope.open_in_same_tab_natural('Información siniestro', 'siniestros.auto_info', {siniestroId: sinister.id}, 0);
        // $state.go('siniestros.auto_info',{siniestroId: sinister.id});
      }else if ($scope.caratula.ramo.ramo_name == 'Vida'){
        $scope.open_in_same_tab_natural('Información siniestro', 'siniestros.vida_info', {siniestroId: sinister.id}, 0);
        // $state.go('siniestros.vida_info',{siniestroId: sinister.id})
      }else if ($scope.caratula.ramo.ramo_name == 'Daños' && $scope.caratula.subramo.subramo_name != 'Automóviles'){
        $scope.open_in_same_tab_natural('Información siniestro', 'siniestros.danio_info', {siniestroId: sinister.id}, 0);
        // $state.go('siniestros.danio_info',{siniestroId: sinister.id})
      }
    };

    $scope.editReceipt = function(receipt, index,certif){
      var texto = "No se validarán las primas y ni las fechas al editar este recibo. ¿Deseas continuar?"
      if ($scope.acceso_pl_cob == false && (receipt.status ==1 || receipt.status == 'Pagado')) {
        var texto = "No se validarán las primas y ni las fechas al editar este recibo. \nEstas editando un recibo PAGADO, para posteriores casos te recomendamos revisar bien las primas antes del proceso de pago/liquidación, ya que este tipo de acciones no son recomendables.\n ¿Deseas continuar?"
      }else if ($scope.acceso_pl_cob == false && (receipt.status ==5 || receipt.status == 'Liquidado')){
        var texto = "No se validarán las primas y ni las fechas al editar este recibo. \nEstas editando un recibo LIQUIDADO, para posteriores casos te recomendamos revisar bien las primas antes del proceso de pago/liquidación, ya que este tipo de acciones no son recomendables.\n ¿Deseas continuar?"
      }
      if((receipt.status == 4 || receipt.status == 'Pendiente de pago') || ($scope.acceso_pl_cob == false && ((receipt.status ==1 || receipt.status == 'Pagado') || (receipt.status ==5 || receipt.status == 'Liquidado')))){
        SweetAlert.swal({
          title: "Advertencia",
          text: texto,
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
            var modalInstance = $uibModal.open({
              templateUrl: 'app/colectivos/receipt.html',
              controller: EditReceiptCtrl,
              controllerAs: 'rec',
              size: 'lg',
              resolve: {
                recibo: function(){
                  return receipt;
                },
                index: function(){
                  return index;
                },
                poliza: function(){
                  return certif;
                },
                caratula: function(){
                  return $scope.caratula;
                },
                acceso_pl_cob: function(){
                  return $scope.acceso_pl_cob;
                },

              },
              backdrop: 'static',
              keyboard: false
            });
            modalInstance.closed.then(function(receipt){
              activate();
            });
          }else{
            SweetAlert.swal("Cancelado", "El recibo no ha sido actualizado.", "error");
          }
        });
      }
      else{
        SweetAlert.swal("Advertencia", "El recibo no se puede editar porque no esta pendiente de pago.", "warning");
      }
    };

    function EditReceiptCtrl(url, $http, $rootScope, recibo, index, poliza, caratula, $scope, $uibModalInstance, acceso_pl_cob){
      var rec = this;
      rec.recibo = recibo;
      var fecha_inicio = recibo.fecha_inicio;
      var fecha_fin = recibo.fecha_fin;
      var fecha_venc = recibo.vencimiento;

      rec.recibo.fecha_inicio = convertDate(recibo.fecha_inicio);
      rec.recibo.fecha_fin = convertDate(recibo.fecha_fin);
      rec.recibo.vencimiento = convertDate(recibo.vencimiento);

      function convertDate(inputFormat, indicator){
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
      };

      function toDate(dateStr) {
        if(dateStr){
          var dateString = dateStr;
          var dateParts = dateString.split("/");
          var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
          return dateObject;
        }
      };
      var date1, date2, date3, dateDiff1, dateDiff2;
      $scope.validateDates_venc = function(date){
        //Validando vacio
        if(date == undefined){
          SweetAlert.swal("Error", "La fecha de vencimiento no puede estar vacia", "error");
          return;
        }
        //Validando no menor a fecha inicio
        date1 = datesFactory.toDate((date));
        date2 = datesFactory.toDate((rec.recibo.fecha_inicio));
        date3 = datesFactory.toDate((convertDate(poliza ? poliza.end_of_validity : caratula.end_of_validity)));
        dateDiff1 = moment(date1).diff(moment(date2), 'days');
        dateDiff2 = moment(date1).diff(moment(date3), 'days');

        // if(dateDiff1 < 0){
        //   rec.recibo.vencimiento = convertDate(fecha_venc);   
        //   SweetAlert.swal("Error", "La fecha de vencimiento no puede ser menor que la inicial", "error");
        //   return;
        // }
        //Validando a no mayor a 30 dias de fin de vigencia de Póliza de Grupo
        if(dateDiff2 > 30){
          rec.recibo.vencimiento = convertDate(fecha_venc); 
          SweetAlert.swal("Error", "La fecha de vencimiento no puede ser mayor a 30 días a la fecha de la vigencia de la Póliza de Grupo", "error");
          return;
        }
      }
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
        var texto_log = ''
        if ((receipt.status ==1 || receipt.status == 'Pagado') && acceso_pl_cob ==false) {
          var texto_log = " EDICION DE RECIBO PAGADO"
        }
        if ((receipt.status ==5 || receipt.status == 'Liquidado') && acceso_pl_cob ==false) {
          var texto_log = " EDICION DE RECIBO LIQUIDADO"
        }
        if(process(receipt.fecha_fin) < process(receipt.fecha_inicio)){
          SweetAlert.swal('Error', 'La fecha fin del recibo no puede ser menor a la de su inicio.', 'error');
          return;
        }

        function process(date){
          var parts = date.split("/");
          var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
          return date.getTime();
        }
        if(rec.recibo.vencimiento == undefined){
          SweetAlert.swal("Error", "La fecha de vencimiento no puede estar vacia", "error");
          return;
        }
        //Validando no menor a fecha inicio
        date1 = datesFactory.toDate((rec.recibo.vencimiento));
        date2 = datesFactory.toDate((rec.recibo.fecha_inicio));
        date3 = datesFactory.toDate((convertDate(poliza ? poliza.end_of_validity : caratula.end_of_validity)));
        dateDiff1 = moment(date1).diff(moment(date2), 'days');
        dateDiff2 = moment(date1).diff(moment(date3), 'days');

        // if(dateDiff1 < 0){
        //   SweetAlert.swal("Error", "La fecha de vencimiento no puede ser menor que la inicial", "error");
        //   return;
        // }
        //Validando a no mayor a 30 dias de fin de vigencia de poliza
        if(dateDiff2 > 30){
          SweetAlert.swal("Error", "La fecha de vencimiento no puede ser mayor a 30 días a la fecha de la vigencia de la Póliza", "error");
          return;
        }

        if(process(rec.recibo.fecha_inicio) < process(convertDate(caratula.start_of_validity))){
          SweetAlert.swal('Error', 'La fecha de inicio del recibo no puede ser menor a la fecha de inicio de la póliza.', 'error');
          return;
        }

        if(process(rec.recibo.fecha_fin) < process(rec.recibo.fecha_inicio)){
          SweetAlert.swal('Error', 'La fecha fin del recibo no puede ser menor a la de su inicio.', 'error');
          return;
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

        $http.patch(receipt.url, obj).then(function(response){
          var params = {
            'model': 18,
            'event': "PATCH",
            'associated_id': caratula.id,
            'identifier': "actualizó el recibo " + receipt.recibo_numero + texto_log+"."
          }
          dataFactory.post('send-log/', params).then(function success(response){

          });
          var params = {
            'model': 4,
            'event': "POST",
            'associated_id': receipt.id,
            'identifier': 'actualizó el recibo '+texto_log
          }
          dataFactory.post('send-log/', params).then(function success(response){

          });
          SweetAlert.swal("¡Listo!", "El recibo ha sido actualizado.", "success");
          $scope.cancel(true);
        });
      }

      $scope.cancel = function(v) {
        if(!v){
          rec.recibo.fecha_inicio = fecha_inicio;
          rec.recibo.fecha_fin = fecha_fin;
          rec.recibo.vencimiento = fecha_venc;
        }
        $uibModalInstance.dismiss('cancel');
      };
    };

  }

})();