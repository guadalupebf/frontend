(function(){
  'use strict';

  angular.module('inspinia')
      .controller('PolizasInfoCtrl', PolizasInfoCtrl);

  PolizasInfoCtrl.$inject = ['$timeout', 'FileUploader', 'providerService', 'dataFactory', 'SweetAlert','$scope','$rootScope','MESSAGES','toaster','endorsementService','insuranceService',
                             'receiptService', '$stateParams', '$state', 'helpers','formService', '$http','url','$uibModal', 'datesFactory',
                             '$q','$localStorage', '$sessionStorage', 'statusReceiptsFactory', '$sce', 'formatValues', 'fileService','emailService', 'appStates', 'whatsappWebFlagService', 'exportFactory', 'CondicionesGeneralesService'];


  function PolizasInfoCtrl($timeout, FileUploader, providerService, dataFactory, SweetAlert, $scope , $rootScope, MESSAGES, toaster, endorsementService, insuranceService,
                          receiptService, $stateParams, $state, helpers, formService, $http, url, $uibModal, datesFactory,  $q,
                          $localStorage, $sessionStorage, statusReceiptsFactory,  $sce, formatValues, fileService, emailService, appStates, whatsappWebFlagService, exportFactory, CondicionesGeneralesService) {


    /* Información de usuario */
    var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
    $scope.orgName = usr.orgname;
    $scope.decrptedtoken = usr;

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

    // uploader.filters.push({
    //     name: 'customFilter',
    //     fn: function(item, options) {
    //         return this.queue.length < 2;
    //     }
    // });

    $scope.conductos = {
      1: 'No domiciliada',
      2: 'Agente',
      3: 'CAC',
      4: 'CAT/Domiciliado',
      5: 'Nómina',
      6: 'CUT',
    }

    var vm = this;

    vm.whatsappWebEnabled = whatsappWebFlagService.isEnabled();
    whatsappWebFlagService.subscribe(function(enabled) {
      $scope.$evalAsync(function() {
        vm.whatsappWebEnabled = enabled;
      });
    }, $scope);

    vm.pageTitle = 'Pólizas';
    vm.insurance = {};
    vm.receipts = [];
    vm.polizaId = $stateParams.polizaId;
    vm.endorsementReceipts=[];
    vm.receipts_manual = 0;
    vm.moveOTState = moveOTState;
    vm.show = {
      isPolicy: false
    }
    vm.showRecordatorios = showRecordatorios;
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
            }else if (acc.permission_name == 'Rehabilitar pólizas') {
              if (acc.checked == true) {
                vm.acceso_adm_rehabilitar = true
              }else{
                vm.acceso_adm_rehabilitar = false
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
            }else if (acc.permission_name == 'Tablero de OTs') {
              if (acc.checked == true) {
                vm.acceso_tab = true
              }else{
                vm.acceso_tab = false
              }
            }
          })
        }
        if (perm.model_name == 'Contratantes y grupos') {
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
        }
        if (perm.model_name == 'Siniestros') {
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
        }
        if (perm.model_name == 'Mensajeria') {
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
        }
        if (perm.model_name == 'Formatos') {
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
        }
        if (perm.model_name == 'Correos electronicos') {
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
        }
        if(perm.model_name == 'Cobranza'){
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
                vm.acceso_desp_cob = true;
              }else{
                vm.acceso_canc_pol = false;
                // vm.acceso_desp_cob = false
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
        }
        if(perm.model_name == 'Referenciadores'){
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
        if(perm.model_name == 'Comisiones'){
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
            // Administrar adjuntos //no agregar, no eliminar, no renombrar, no marcar sensible
            if (acc.permission_name == 'Administrar adjuntos') {
              if (acc.checked == true) {
                vm.permiso_administrar_adjuntos = true
                $scope.permiso_administrar_adjuntos = true
              }else{
                vm.permiso_administrar_adjuntos = false
                $scope.permiso_administrar_adjuntos = false
              }
            }
          })
        }
      })
    }
    vm.repeat = [];
    activate();
    // functions
    vm.goToEndoso = goToEndoso
    vm.showNotas = showNotas
    vm.returnToReceipts = returnToReceipts;
    vm.goToReceipt = goToReceipt;
    vm.deletePolicy = deletePolicy;
    vm.deleteFile = deleteFile;
    vm.cg = {
      catalog: [],
      selectedDocs: [],
      loading: false,
      saving: false
    };
    vm.loadGeneralConditions = loadGeneralConditions;
    vm.onGeneralConditionsChange = onGeneralConditionsChange;
    vm.removeGeneralCondition = removeGeneralCondition;
    vm.isGeneralConditionFile = isGeneralConditionFile;
    vm.assignPolicy = assignPolicy;
    vm.cancelPolicy = cancelPolicy;
    vm.reactivePolicy = reactivePolicy;
    vm.reActivatePolicy = reActivatePolicy;
    vm.showBinnacle = showBinnacle;
    vm.viewContractor = viewContractor;
    vm.showSinisters = showSinisters;
    vm.showEndorsements = showEndorsements;
    vm.showBinnacleReceipt = showBinnacleReceipt;
    vm.getPDF = getPDF;
    vm.viewCarta = viewCarta;
    vm.changeStatusModal = changeStatusModal;
    vm.openRenovateModal = openRenovateModal;
    vm.cancelRenovate = cancelRenovate;
    vm.checkStatusReceipts = checkStatusReceipts;
    vm.changeEndorsement = changeEndorsement;
    vm.user = usr;
    vm.files = [];
    vm.table ={};
    vm.tables ={};
    vm.tablec = {};
    vm.saveAsInsurance = saveAsInsurance;
    vm.returnToInfo = returnToInfo;
    vm.NotasModal = NotasModal;
    vm.getLog = getLog;
    vm.getLogReceipt = getLogReceipt;
    vm.showChange = showChange;
    vm.sendProvider = sendProvider;
    vm.deliveredReceipt = deliveredReceipt;
    vm.delivery = delivery;
    vm.sendEmail1 = sendEmail1;
    vm.showEmail = showEmail;
    vm.editRecibos = editRecibos;
    vm.createReceipts = createReceipts;
    vm.createNotes = createNotes;
    vm.createRecordatorio = createRecordatorio;

    vm.infoFlag = true;
    vm.sinistersFlag = false;
    vm.endoFlag = false;
    vm.notasFlag = false;
    $scope.form = {}
    $scope.form.emails_reminder = []
    $scope.changeDomiciliado = false;
    vm.recordatoriosFlag = false;
    vm.isCollapsed = false;

    // Function to toggle the collapse state
    vm.toggleCollapse = function() {
      vm.isCollapsed = !vm.isCollapsed;
    };
    $scope.ShowContextMenu = function(name, route){
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

      var params = { 'myInsurance': vm.insurance, 'contractor': $scope.contractorModal }
      if (route =='endorsement.endorsement') {
        $localStorage['save_filters_endoso_poliza'] = {}
        $localStorage['save_filters_endoso_poliza']['poliza'] = vm.insurance.poliza_number
        $localStorage['save_filters_endoso_poliza']['poliza_id'] = vm.insurance.id
        $localStorage['save_filters_endoso_poliza']['origin_endorsement'] = vm.insurance
      }
      $state.go($scope.route_for_new_tab, params);
    }

    $scope.goToEndorsement = function(name, route, endorsement){
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
      
      var params = { 'endosoId': endorsement.id }
      $state.go($scope.route_for_new_tab, params);
    }

    $scope.open_in_same_tab_sns = function(name, route, params, identifier){
      var params = { 'myInsurance': vm.insurance, 'contractor': $scope.contractorModal }
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

    $scope.createSiniestro = function(contractorModal){
      $localStorage['save_created_siniester_life'] = {}
      $scope.open_in_same_tab_sns('Crear siniestro','siniestros.create_vida', {myInsurance: vm.insurance, contractor: contractorModal}, vm.insurance);
    }
    $scope.createSiniestroDanios = function(contractorModal){
      $localStorage['save_created_siniester_danios'] = {}
      $scope.open_in_same_tab_sns('Crear siniestro Daños','siniestros.create_danios', {myInsurance: vm.insurance, contractor: contractorModal}, vm.insurance);
    }

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
            console.log(response);
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

    $scope.goToPolicy = function(policy){
      $state.go('colectividades.info', {polizaId: policy.id});
    };
    $scope.getAllCertificates = function(kl){
      $http({
      method: 'POST',
          url: url.IP + 'service_reporte_certificados_excel',
          headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
          responseType: "arraybuffer"
        }). then(function success(request) {
          if(request.status === 200) {
              var blob = new Blob([request.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
              saveAs(blob, 'Reporte_Certificados.xls');
          }

        })
        .catch(function (e) {
          console.log('e', e);
        });
    }
    $scope.changeSensible = function(sensible, index) {
        uploader.queue[index].formData[0].sensible = sensible;
    }

    $scope.saveFile = function(file) {
      var urls = file.url;
      if(urls == undefined){
        urls = url.IP+'polizas/'+file.owner+'/archivos/'+file.id
      }
      $http.patch(urls,{'nombre':file.nombre, 'sensible':file.sensible});
    }

    $scope.changeDomiciliadoValue = function() {
      $scope.change_domiciliado = true;
      if($scope.newDomiciliado == 'true' || $scope.newDomiciliado == true) {
        $scope.domiciliadoSave = true;
      } else {
        $scope.domiciliadoSave = false;
      }          
    };
    $scope.changedomiciliadoF = function (chng){
      if (chng) {
        SweetAlert.swal('Información','Todos los Recibo(s) se actualizarán','info');
      }
      $scope.changeDomiciliado = chng;
      $scope.newDomiciliado = $scope.isCat;
    }
    $scope.saveDomiciliado = function(dom){
      vm.insurance.recibos_poliza.forEach(function(it){
        $http.patch(it, { is_cat: dom })
        .then(function(recibo_cat) {
          $scope.isCat = dom;
          $scope.changeDomiciliado = false;            
          SweetAlert.swal('¡Hecho!','Recibo(s) actualizado(s)','success');
        });
      })
      $http.patch(url.IP + 'polizas/'+vm.insurance.id + '/' , {'domiciliada': dom});
      var paramsRec = {
        'model': 1,
        'event': "PATCH",
        'associated_id': vm.insurance.id,
        'identifier': " cambio el estatus de Cargo Atm. (Domiciliado: "+dom+") de los recibos desde la póliza."
      }
      dataFactory.post('send-log/', paramsRec).then(function success(response) {
      });      
    }

    function createNotes(insurance) {
      if (insurance) {
        SweetAlert.swal({
          title: "¡Aviso!",
          text: "Se creará una nueva nota de crédito. ¿Desea continuar?",
          type: "info",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Si",
          cancelButtonText: "No"
          },
          function(isConfirm) {
            if (isConfirm) {
              
              var modalInstance = $uibModal.open({
                templateUrl: 'app/polizas/add.receiptsModal.html',
                controller: AddReceiptModalCtrl,
                controllerAs: 'rec',
                size: 'lg',
                resolve: {
                  serie: function() {
                    return null;
                  },
                  poliza: function() {
                    return insurance;
                  },
                  contractor: function() {
                    return $scope.contratante;
                  },
                  tipo: function() {
                    return 3
                  }
                },
                backdrop: 'static', /* this prevent user interaction with the background */
                keyboard: false
              });
              


              modalInstance.closed.then(function(receipt) {
                activate();
              });
            

            }else{
              
            }
          });
      }else{
        SweetAlert.swal("Error", "No se puede agregar", "error");
        return;
      }
    }

    function createReceipts(insurance) {
      if (insurance) {
        SweetAlert.swal({
          title: "¡Aviso!",
          text: "Se creará un nuevo recibo. ¿Desea continuar?",
          type: "info",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Si",
          cancelButtonText: "No"
          },
          function(isConfirm) {
            if (isConfirm) {
              var serie = 0
              vm.policy_receipts_show.forEach(function(recibo){
                if (parseInt(recibo.recibo_numero) > serie){
                  serie = parseInt(recibo.recibo_numero);
                }
              })
              var modalInstance = $uibModal.open({
                templateUrl: 'app/polizas/add.receiptsModal.html',
                controller: AddReceiptModalCtrl,
                controllerAs: 'rec',
                size: 'lg',
                resolve: {
                  serie: function() {
                    return serie + 1;
                  },
                  poliza: function() {
                    return insurance;
                  },
                  contractor: function() {
                    return $scope.contratante;
                  },
                  tipo: function() {
                    return 1
                  }
                },
                backdrop: 'static', /* this prevent user interaction with the background */
                keyboard: false
              });
              


              modalInstance.closed.then(function(receipt) {
                activate();
              });
            

            }else{
              
            }
          });
      }else{
        SweetAlert.swal("Error", "No se puede agregar", "error");
        return;
      }
    }
    
    $scope.showReminder = function(recordatorio,index){
      $http.patch(recordatorio.url, {'seen':true}).then(function(){
        vm.recordatorios[index]['seen'] = true;
      });

      // var template_url = 'app/recordatorios/libres.modal.html';

      // var modalInstance = $uibModal.open({ //jshint ignore:line
      //     templateUrl: template_url,
      //     controller: ShowPolizaCtrl,
      //     size: 'lg',
      //     resolve: {
      //         recordatorio: function() {
      //             return recordatorio;
      //         }
      //     },
      //     backdrop: 'static', /* this prevent user interaction with the background */ 
      //     keyboard: false
      // });
    }
    function editRecibos(index,receiptId,receipt) {
      var texto = "Los cambios sólo se aplicarán en este recibo. ¿Deseas continuar?"
      if (vm.acceso_pl_cob == false && (receipt.status ==1)) {
        var texto = "Los cambios sólo se aplicarán en este recibo. \nEstas editando un recibo PAGADO, para posteriores casos te recomendamos revisar bien las primas antes del proceso de pago/liquidación, ya que este tipo de acciones no son recomendables.\n ¿Deseas continuar?"
      }else if (vm.acceso_pl_cob == false && (receipt.status ==5)){
        var texto = "Los cambios sólo se aplicarán en este recibo. \nEstas editando un recibo LIQUIDADO, para posteriores casos te recomendamos revisar bien las primas antes del proceso de pago/liquidación, ya que este tipo de acciones no son recomendables.\n ¿Deseas continuar?"
      }
      if ((receiptId) && receipt) {
        SweetAlert.swal({
          title: "¡Advertencia!",
          text: texto,
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Si",
          cancelButtonText: "No"
          },
          function(isConfirm) {
            if (isConfirm) {
              var modalInstance = $uibModal.open({
                templateUrl: 'app/polizas/edit.receiptsModal.html',
                controller: EditReceiptModalCtrl,
                controllerAs: 'rec',
                size: 'lg',
                resolve: {
                  recibo: function() {
                    return receipt;
                  }, index: function() {
                    return index;
                  }, poliza: function() {
                    return vm.insurance;
                  },receipts: function(){
                    return vm.policy_receipts_show;
                  },acceso_pl_cob: function(){
                    return vm.acceso_pl_cob;
                  },
                },
                backdrop: 'static', /* this prevent user interaction with the background */
                keyboard: false
              });
              modalInstance.closed.then(function(receipt) {
                activate();
              });
            }else{
              
            }
          });
      }else{
        SweetAlert.swal("Error", "No se puede editar", "error");
        return;
      }
    }

    function sendEmail1(email, model) {
      var lb = Ladda.create( document.querySelector( '.ladda-button' ) );
      lb.start();
      if (validateEmail(email) && model) {
        var data = {
          model: model,
          email: email,
          id: vm.insurance.id
        }
        dataFactory.post('send-email-renovacion/', data)
        .then(function success(response) {
          if (response.status == 200) {
            SweetAlert.swal("Enviado", "El recordatorio se ha enviado", "success");
            vm.form.emailMain = ''
            lb.stop();
          }else{
            SweetAlert.swal("Error", "Ha ocurrido un error", "error");
            vm.form.emailMain = ''
            lb.stop();
          }
        })
      }else{
        SweetAlert.swal("Error", MESSAGES.ERROR.INVALIDEMAIL, "error");
        lb.stop();
        return;
      }
    }
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    function showEmail(insurance,model) {
      if (insurance.contratante) {
        var data_alert = {
          title: "Correo",
          text: insurance.contratante.email,
          type: "info",
          confirmButtonText: "Enviar recordatorio",
          cancelButtonText: "Salir",
          showCancelButton: true,
          closeOnConfirm: false,
          showLoaderOnConfirm: true,
          showConfirmButton: true
        }
      }else{
        var data_alert_correo = {
          title: "Correo",
          text: "Escribe el correo para enviar el recordatorio:",
          type: "input",
          showCancelButton: true,
          closeOnConfirm: false,
          animation: "slide-from-top",
          inputPlaceholder: "email@mail.com"
        }
      }
      if (data_alert) {
        SweetAlert.swal(data_alert,
        function(isConfirm) {

          if(isConfirm) {
            $http.post(url.IP+'send-email-renovacion/', {'id':insurance.id,'model':model,'email':insurance.contratante.email})
            .then(
              function success(request) {
                if(request.status === 200 || request.status === 201) {
                  swal("Enviado","El recordatorio ha sido enviado", "success");
                } else {
                  swal("Error", "No se envió el recordatorio. Contacte a su administrador.", "error");
                }
              },
              function error(error) {
                console.log('error - email', error);
              }
            )
            .catch(function(e) {
              console.log('error - catch', e);
            });

          } else {
          }
        });
      }else if(data_alert_correo){
        SweetAlert.swal(data_alert_correo,
          function(inputValue){
          if (inputValue === false) return false;

          if (inputValue === "") {
            swal.showInputError("Ingresa un correo");
            return false
          }
            $http.post(url.IP+'send-email-renovacion/',{'id':insurance.id,'model':model,'email':inputValue})
            .then(
              function success(request) {
                if(request.status === 200 || request.status === 201) {
                  swal("Enviado","El recordatorio ha sido enviado", "success");
                } else {
                  swal("Error", "No se envió el recordatorio. Contacte a su administrador.", "error");
                }
              },
              function error(error) {
                console.log('error - email', error);
              }
            )
            .catch(function(e) {
              console.log('error - catch', e);
          });
        })
      }
    }
    // $scope.receiptAll = valueReceipt;
    $scope.showAddEmail = false;
    $scope.optionsSent = [
      {'value': 1, 'label': 'Sólo al contratante'},
      {'value': 2, 'label': 'Añadir correos'},
    ];

    $scope.showAddEmails = function(param){
      if(param.value == 1){
        $scope.showAddEmail = false;
      }
      else{
        $scope.showAddEmail = true;
      }
    }
    $scope.addEmailsConfirm = function(insurance,model){
      $scope.form ={};
      $rootScope.modalInstance_emails = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/polizas/add.emails.reminder_reminder.html',
        controller: 'PolizasInfoCtrl',
        size: 'lg',
        resolve: {
          insurance: function() {
            return insurance;
          },
          model: function() {
            return model;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });
      $rootScope.modalInstance_emails.result.then(function(insurance) {
      });
    }
    $scope.sendReminder = function(mails,model) {
      var arrayEmails = [];
      if (mails) {
        mails.forEach(function(it){
          arrayEmails.push(it.email)
        })
      }
      if($scope.contratante.email){
        arrayEmails.push($scope.contratante.email)
      }
      if(arrayEmails.length == 0){
        SweetAlert.swal("Error", "Agregue correos", "error");
        return;
      }else{
        if ($rootScope.modalInstance_emails) {
          $rootScope.modalInstance_emails.close('a');
        }

      }

      if (arrayEmails) {
        SweetAlert.swal("Error", "Agregue correos__", "error");
        var data_alert = {
          title: "Correo",
          // text: arrayEmails,
          text: (arrayEmails.join("\n")),
          type: "info",
          confirmButtonText: "Confirmar envio",
          cancelButtonText: "Salir",
          showCancelButton: true,
          closeOnConfirm: true,
          showLoaderOnConfirm: true,
          // showConfirmButton: $scope.add_emails
          showConfirmButton: true
        }
      }
      if (data_alert) {
        SweetAlert.swal(data_alert,
        function(isConfirm) {

          if(isConfirm) {

            $http.post(url.IP+'send-email-renovacion/', {'id':vm.insurance.id,'emails': arrayEmails, 'asunto': $scope.subjectEmail, 'mensaje': $scope.messageEmail, 'model': 10})
            .then(
              function success(request) {
                if(request.status === 200 || request.status === 201) {
                  swal("Enviado","El recordatorio ha sido enviado", "success");
                } else {
                  swal("Error", "No se envió el recordatorio. Contacte a su administrador.", "error");
                }
              },
              function error(error) {
                console.log('error - email', error);
              }
            )
            .catch(function(e) {
              console.log('error - catch', e);
            });

          } else {

          }
        });
      }

    };

    $scope.saveNewReceipts = function() {

      // comision
      var com_percent = parseFloat(vm.insurance.comision_percent);
      var com_import = parseFloat($scope.dataToSave.p_neta) * (com_percent / 100);

      // patch de los valores y post de los recibos
      var _poliza_ = {
        derecho: $scope.dataToSave.derecho,
        descuento: $scope.dataToSave.descuento,
        iva: $scope.dataToSave.iva,
        p_neta : $scope.dataToSave.p_neta,
        p_total : $scope.dataToSave.p_total,
        rpf: $scope.dataToSave.rpf,
        comision_percent : vm.insurance.comision_percent,
        comision: (com_import).toFixed(2)
      };

      var count = 0;

      for(var i in $scope.dataToSave.recibos_poliza) {

        var item = $scope.dataToSave.recibos_poliza[i];

        item.fecha_fin    = datesFactory.toDate(item.fecha_fin);
        item.endingDate   = datesFactory.toDate(item.endingDate);
        item.fecha_inicio = datesFactory.toDate(item.fecha_inicio);
        item.startDate    = datesFactory.toDate(item.startDate);
        item.vencimiento  = datesFactory.toDate(item.vencimiento);
        item.poliza       = vm.insurance.url;

        dataFactory
          .post('recibos/', item)
          .then(function(res) {

            count = count + 1;

            res.receipt_type = 1;
            vm.policy_receipts_show.push(res);
            vm.insurance.recibos_poliza.push(res.url);

            if(count = $scope.dataToSave.recibos_poliza.length +1) {
              $scope.calculate_receipts = false;

              $http
              .patch(vm.insurance.url, _poliza_)
              .then(function(res) {

                insuranceServices();

              });
              // volver a mostrar los recibos (agregar en el arreglo de recibos en información - policy_receipts_show -)
            }
          });

      }

    };
    $scope.deleteReceipts = function (receipt,index) {
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
            id_poliza: vm.insurance.id,
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
                'associated_id': vm.insurance.id,
                'identifier': " elimino un recibo ("+receipt.recibo_numero+") de la póliza"
              }
              dataFactory.post('send-log/', paramsDelRec).then(function success(response) {
              });
              if(recibo_delete.data.status == 0){
                vm.policy_receipts_show.splice(index, 1);
              }
              SweetAlert.swal('¡Hecho!','Recibo eliminado','success');
          });
        }
      });
    }

    // renovar recibos
    $scope.renewReceipts = function() {

      // sacar fecha de fin del ultimo recibo
      var length_receipts = vm.policy_receipts_show.length -1;
      var date_last_receipt = new Date(vm.policy_receipts_show[length_receipts].fecha_fin);
      var new_start_date = date_last_receipt.getDate() + '/' + (date_last_receipt.getMonth() + 1) +'/' + date_last_receipt.getFullYear();
      var new_end_date = date_last_receipt.getDate() + '/' + (date_last_receipt.getMonth() + 1) +'/' + (date_last_receipt.getFullYear() + 1);

      vm.insurance.startDate = new_start_date;
      vm.insurance.endingDate = new_end_date;
      vm.insurance.payment = {
        value: vm.insurance.forma_de_pago
      };

      $scope.dataToSave = {
        receipts: []
      };

      $scope.poliza_renew_rec = {
        primaNeta: null,
        descuento: null,
        rpf: null,
        subTotal: null,
        iva: null,
        primaTotal: null,
        configDerecho: false,
        configRPF: false,
        aplicarDescuento: false
      };


      SweetAlert.swal({
        title: 'Renovar recibos',
        text: "¿Está seguro de renovar los recibos?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Sí",
        cancelButtonText: "No",
        closeOnConfirm: true
      },
      function(isConfirm) {

        if (isConfirm) {
          $scope.calculate_receipts = true;
        }
      });

    };

    $scope.addEmails = function (type) {
      var mail = {
        email: ''
      };
      $scope.form.emails_reminder.push(mail);
    }

    $scope.deleteEmails = function (mail, type) {
      $scope.form.emails_reminder.splice(mail, 1);
    }
    $scope.cancel = function() {
      if ($rootScope.modalInstance_emails) {
        $rootScope.modalInstance_emails.close('a');
      }
    };

    $scope.forma_pago = function (parValue) {
      switch (parValue) {
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
          return 'No especificada';
      }
    }

    $scope.tipo_pago = function (parValue) {
      switch (parValue) {
        case 1:
          return 'Reembolso';
          break;
        case 2:
          return 'Programación';
          break;
        case 3:
          return 'Pago directo';
          break;
        case 4:
          return 'Aclaración';
          break;
        default:
          return 'No especificada';
      }
    }

    $scope.status = function (parValue) {
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
        case 0:
          return 'Eliminada/Desactivada';
          break;
        default:
          return 'Pendiente';
      }
    }

    $scope.concept = function(parConcept) {
        switch(parConcept){
          case 1: return 'CAMBIO DE FORMA DE PAGO';
            break;
          case 2: return 'CAMBIO DE SUMA ASEGURADA';
            break;
          case 3: return 'OTRO';
            break;
          case 4: return 'PRÓRROGA DE VIGENCIA';
            break;
          case 5: return 'AGREGAR COBERTURAS';
            break;
          case 6: return 'ALTA/BAJA DE DEPENDIENTES';
            break;
          case 8: return 'CAMBIO DATOS FISCALES';
            break;
          case 9: return 'ESPECIFICACIONES';
            break;
          case 11: return 'CAMBIO DE FORMA DE PAGO';
            break;
          case 12: return 'DISMINUCIÓN EN LA SUMA ASEGURADA';
            break;
          case 13: return 'CANCELACION DEFINITIVA A PETICION';
            break;
          case 14: return 'CAMBIO DE DEDUCIBLE Y/O COASEGURO';
            break;
          case 15: return 'BAJA DE ASEGURADO';
            break;
          case 16: return 'CANCELACIÓN DE PÓLIZA POR PETICIÓN';
            break;
          case 17: return 'CANCELACIÓN DE PÓLIZA POR FALTA DE PAGO';
            break;
          case 23: return 'ANTIGÜEDAD RECONOCIDA';
            break;
          default: return 'OTRO';
        }
      }

    $scope.policy_type = function(value) {
      switch (value) {
        case 1:
          return 'Automóvil';
          break;
        case 2:
          return 'Motocicleta';
          break;
        case 3:
          return 'Tracto';
          break;
        case 4:
          return 'Autobús';
          break;
        case 5:
          return 'Pick Up';
          break;
        case 6:
          return 'Camiones hasta 1.5 ton';
          break;
        case 7:
          return 'Chofer app';
          break;
        case 8:
          return 'Remolque';
          break;
        case 9:
          return 'Camiones + 1.5 ton';
          break;
        default:
          return 'No especificado';
      }
    }
    $scope.type_procedencia = function(value){
      switch (value) {
        case 1:
          return 'Residente';
          break;
        case 2:
          return 'Turista';
          break;
        case 3:
          return 'Legalizado';
          break;
        case 4:
          return 'Fronterizo';
          break;
        default:
          return 'No especificado';
      }
    }
    $scope.getCarga = function(value){
      switch (value) {
        case 1:
          return 'A';
          break;
        case 2:
          return 'B';
          break;
        case 3:
          return 'C';
          break;
        default:
          return 'No especificado';
      }
    }

    $scope.policy_type_fire = function(value) {
      switch (value) {
        case 1:
          return 'Familiar';
          break;
        case 2:
          return 'Casa Habitación';
          break;
        case 3:
          return 'Condominio';
          break;
        case 4:
          return 'Edificio';
          break;
        case 5:
          return 'Empresarial';
          break;
        case 6:
          return 'Múltiple Empresarial';
          break;
        case 7:
          return 'Específica';
          break;
        case 8:
          return 'Pronóstico';
          break;
        case 9:
          return 'Declaración';
          break;
        case 10:
          return 'Soló Incendio';
          break;
        case 11:
          return 'Animales';
          break;
        case 12:
          return 'Cultivo';
          break;
        case 13:
          return 'Crédito General';
          break;
        case 14:
          return 'Crédito a la Vivienda';
          break;
        case 15:
          return 'Documentos que sean objeto de oferta pública o de intermediación en mercados de valores';
          break;
        case 16:
          return 'Emisores de Valores';
          break;
        case 17:
          return 'Titulos de Crédito';
          break;
        case 18:
          return 'Administración';
          break;
        case 19:
          return 'Arquitectos';
          break;
        case 20:
          return 'Aviones';
          break;
        case 21:
          return 'Barcos';
          break;
        case 22:
          return 'Contratista';
          break;
        case 23:
          return 'Cime';
          break;
        case 24:
          return 'Cyber (Protección de datos)';
          break;
        case 25:
          return 'D&O (Consejeros y Funcionarios';
          break;
        case 26:
          return '&O Miscelaneos';
          break;
        case 27:
          return 'Empresarial';
          break;
        case 28:
          return 'Eventos';
          break;
        case 29:
          return 'Familiar/Condominal';
          break;
        case 30:
          return 'Hole in One';
          break;
        case 31:
          return 'Ingeniería';
          break;
        case 32:
          return 'Instituciones Financieras';
          break;
        case 33:
          return 'Lineas Financieras';
          break;
        case 34:
          return 'Médicos';
          break;
        case 35:
          return 'Otro';
          break;
        case 36:
          return 'Riesgos Catastróficos';
          break;
        case 37:
          return 'Calderas y Recipientes Sujetos a Presión';
          break;
        case 63:
          return 'Terrorismo y Sabotaje';
          break;
        case 38:
          return 'Dinero y Valores';
          break;
        case 39:
          return 'Eq. Contratistas y Maquinaria pesada';
          break;
        case 40:
          return 'Eq. Electrónico';
          break;
        case 41:
          return 'Montaje de Maquinaria';
          break;
        case 42:
          return 'Obra Civil en Contrucción';
          break;
        case 43:
          return 'Obra Civil Terminada';
          break;
        case 44:
          return 'Rotura de Cristales';
          break;
        case 45:
          return 'Rotura de Maquinaria';
          break;
        case 46:
          return 'Familiar';
          break;
        case 47:
          return 'Ahorro';
          break;
        case 48:
          return 'Vitalicia';
          break;
        case 49:
          return 'Temporal/Protección';
          break;
        case 52:
          return 'Helicóptero';
          break;
        case 51:
          return 'Embarcación de Placer';
          break;
        case 53:
          return 'CRIME/BBB';
          break;
        case 54:
          return 'D&O';
          break;
        case 55:
          return 'FIPI';
          break;
        case 56:
          return 'CYBER';
          break;
        case 57:
          return 'VCAPS';
          break;
        case 58:
          return 'RCP MÉDICA';
          break;
        case 59:
          return 'E&O MISCELANEO';
          break;
        case 60:
          return 'RIESGO POLITICO';
          break;
        case 61:
          return 'RC SERVIDORES PUBLICOS';
          break;
        case 62:
          return 'RCP';
          break;
          case 64:
            return 'Viajero';
            break;
        default:
          return '';
      }
    }

    $scope.policy_type_fire_ok = function(value) {
      switch (value) {
        case 1:
          return 'Familiar';
          break;
        case 2:
          return 'Casa Habitación';
          break;
        case 3:
          return 'Condominio';
          break;
        case 4:
          return 'Edificio';
          break;
        case 5:
          return 'Empresarial';
          break;
        case 6:
          return 'Múltiple Empresarial';
          break;
        case 7:
          return 'Específica';
          break;
        case 8:
          return 'Pronóstico';
          break;
        case 9:
          return 'Declaración';
          break;
        case 10:
          return 'Soló Incendio';
          break;
        case 11:
          return 'Animales';
          break;
        case 12:
          return 'Cultivo';
          break;
        case 13:
          return 'Crédito General';
          break;
        case 14:
          return 'Crédito a la Vivienda';
          break;
        case 15:
          return 'Documentos que sean objeto de oferta pública o de intermediación en mercados de valores';
          break;
        case 16:
          return 'Emisores de Valores';
          break;
        case 17:
          return 'Titulos de Crédito';
          break;
        case 18:
          return 'Administración';
          break;
        case 19:
          return 'Arquitectos';
          break;
        case 20:
          return 'Aviones';
          break;
        case 21:
          return 'Barcos';
          break;
        case 22:
          return 'Contratista';
          break;
        case 23:
          return 'Cime';
          break;
        case 24:
          return 'Cyber (Protección de datos)';
          break;
        case 25:
          return 'D&O (Consejeros y Funcionarios';
          break;
        case 26:
          return '&O Miscelaneos';
          break;
        case 27:
          return 'Empresarial';
          break;
        case 28:
          return 'Eventos';
          break;
        case 29:
          return 'Familiar/Condominal';
          break;
        case 30:
          return 'Hole in One';
          break;
        case 31:
          return 'Ingeniería';
          break;
        case 32:
          return 'Instituciones Financieras';
          break;
        case 33:
          return 'Lineas Financieras';
          break;
        case 34:
          return 'Médicos';
          break;
        case 35:
          return 'Otro';
          break;
        case 36:
          return 'Riesgos Catastróficos';
          break;
        case 37:
          return 'Calderas y Recipientes Sujetos a Presión';
          break;
        case 63:
          return 'Terrorismo y Sabotaje';
          break;
        case 38:
          return 'Dinero y Valores';
          break;
        case 39:
          return 'Eq. Contratistas y Maquinaria pesada';
          break;
        case 40:
          return 'Eq. Electrónico';
          break;
        case 41:
          return 'Montaje de Maquinaria';
          break;
        case 42:
          return 'Obra Civil en Contrucción';
          break;
        case 43:
          return 'Obra Civil Terminada';
          break;
        case 44:
          return 'Rotura de Cristales';
          break;
        case 45:
          return 'Rotura de Maquinaria';
          break;
        case 46:
          return 'Avión';
          break;
        case 47:
          return 'Avioneta';
          break;
        case 48:
          return 'Barco';
          break;
        case 49:
          return 'Buque';
          break;
        case 50:
          return 'Dron';
          break;
        case 52:
          return 'Helicóptero';
          break;
        case 51:
          return 'Embarcación de Placer';
          break;
        case 53:
          return 'CRIME/BBB';
          break;
        case 54:
          return 'D&O';
          break;
        case 55:
          return 'FIPI';
          break;
        case 56:
          return 'CYBER';
          break;
        case 57:
          return 'VCAPS';
          break;
        case 58:
          return 'RCP MÉDICA';
          break;
        case 59:
          return 'E&O MISCELANEO';
          break;
        case 60:
          return 'RIESGO POLITICO';
          break;
        case 61:
          return 'RC SERVIDORES PUBLICOS';
          break;
        case 62:
          return 'RCP';
          break;
        case 64:
          return 'Viajero';
          break;
        default:
          return '';
      }
    }

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

    function delivery(poliza) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/mensajeria/create.delivery.html',
        controller: 'DeliveryModalCtrl',
        size: 'lg',
        resolve: {
          insurance: function() {
            return poliza;
          }, contractor: function() {
            return $scope.contratante;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });
    }
    
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
        insuranceServices();
      }, function () {       
        insuranceServices();
        console.info('modal closed');
      });
    }
    $scope.statusReceipts = function (parStatus) {
      switch (parStatus) {
        case 1:
          return'Pagado';
          break;
        case 2:
          return 'Cancelado';
          break;
        case 3:
          return 'Prorrogado';
          break;
        case 4:
          return'Pendiente de pago';
          break;
        case 5:
          return'Liquidado';
          break;
        case 6:
          return'Conciliado';
          break;
        case 7:
          return'Cerrado';
          break;
        case 8:
          return'Precancelado';
          break;
        case 9:
          return'Pago Parcial';
          break;
        default:
          return 'Pendiente de pago';
      }
    };

    function checkStatusReceipts (parStatus) {
      $scope.statusReceipt = statusReceiptsFactory.receipts(parStatus.status);
      if($scope.poliza_multianual && $scope.statusReceipt == 'Pendiente de pago' && parStatus.prima_neta == 0){
        $scope.statusReceipt = 'Pendiente de actualizar'
      }
      return $scope.statusReceipt;
    };

    function deliveredReceipt(receipt) {
      SweetAlert.swal({
        title: 'Entregado',
        text: "Este recibo se marcara como entregado",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si",
        cancelButtonText: "No",
        closeOnConfirm: false
      },
      function(isConfirm) {
        if (isConfirm) {
          var params = {
            'model': 4,
            'event': "PATCH",
            'associated_id': receipt.id,
            'identifier': ' actualizo el recibo a Entregado',
          }
          dataFactory.post('send-log/', params).then(function success(response) {
           
          });
          $http({
            method: 'PATCH',
            url: receipt.url,
            data: {
              delivered: true
            }
          }).then(function success(response) {
            if(response.status == 200){
              SweetAlert.swal("¡Listo!", "", "success");

              $state.go('polizas.info', {polizaId: vm.insurance.id})
            }
          })
        }
      });
    }

    // ALERTA SUCCES UPLOADFILES
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
      $scope.okFile++;
      if($scope.okFile == $scope.countFile){
        // $timeout(function() {
          if($scope.param == 'poliza'){
            SweetAlert.swal(MESSAGES.OK.UPGRADEPOLICY, "", "success");
          }else if($scope.param == 'ot'){
            SweetAlert.swal("¡Listo!", MESSAGES.OK.UPGRADEOT, "success");
          }else{
            SweetAlert.swal('¡Listo!', 'Archivos cargados exitosamente.', 'success');
          }
          $state.go('polizas.info', { polizaId: vm.insurance.id });
        // }, 1000);
      }
    };

    // ALERTA ERROR UPLOADFILES
    uploader.onErrorItem = function(fileItem, response, status, headers) {
      if(response.status == 413){
        SweetAlert.swal("ERROR", MESSAGES.ERROR.FILETOOLARGE, "error");
        order.options.checkDate('initial');
      } else {
        SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
        order.options.checkDate('initial');
      }
    };

    uploader.onAfterAddingFile = function(fileItem) {
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
      fileItem.formData.push({
        arch: fileItem._file,
        nombre: fileItem.file.name,
      });

      if(fileItem){
        $scope.countFile++;
      }
      if ($scope.specialchar.length > 0) {
        $scope.uploader.queue.splice($scope.uploader.queue.indexOf(fileItem),1)
        SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales, renombre y, vuelva a cargarlo. '+$scope.specialchar,'error') 
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

    $scope.saveFiles = function(poliza) {      
      $scope.countFile = $scope.uploader.queue.length
      uploadFiles(poliza);
    }

    function uploadFiles(polizaId) {
      $scope.userInfo = {
        id: polizaId
      };
      $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
      $scope.uploader.uploadAll();      
      saveLogFile($scope.countFile,polizaId)
    }
    function saveLogFile(num,id_p){
      if (num >0) {
        var params = {
          'model': 1,
          'event': "PATCH",
          'associated_id': id_p,
          'identifier': " añadio "+num+" archivos a la póliza."
        }
        dataFactory.post('send-log/', params).then(function success(response) { });
      }
    }
    $scope.showInformationEndoso = function(endoso){
      if(endoso.policy_type == 1){
        $state.go('endosos.pendingData', {endorsementId: endoso.id, endorsementType: vm.checkEndorsementType(endoso), polizaId: endoso.policy.id});
      }
      else if(endoso.policy_type == 2){
        if(endoso.endorsement_type == "D"){
          if(endoso.policy.subramo == 1)
            var type = "life";
          else if(endoso.policy.subramo == 3)
            var type = "disease";
          else
            var type = "automobile"
        }
        $state.go('endosos.pendingDataMassive', {endorsementId: endoso.id, endorsementType: vm.checkEndorsementType(endoso) ? vm.checkEndorsementType(endoso) : type, polizaId: endoso.policy.id});
      }
    };

    $scope.infoSinister = function(name,sinister,insurance){
      $scope.name_for_new_tab = name;
      if(insurance.ramo == 'Accidentes y Enfermedades'){
        $scope.route_for_new_tab = 'siniestros.info';
        var route = 'siniestros.info';
      }else if (insurance.ramo == 'Daños' && (insurance.subramo =='Automóviles' || insurance.subramo.subramo_name == 'Automóviles')){
        $scope.route_for_new_tab = 'siniestros.auto_info';
        var route = 'siniestros.auto_info';
      }else if (insurance.ramo == 'Vida'){
        $scope.route_for_new_tab = 'siniestros.vida_info';
        var route = 'siniestros.vida_info';
      }else if (insurance.ramo == 'Daños' && (insurance.subramo !='Automóviles' || insurance.subramo.subramo_name != 'Automóviles')){
        $scope.route_for_new_tab = 'siniestros.danio_info';
        var route = 'siniestros.danio_info';
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
          href: $state.href($scope.route_for_new_tab),
        }
      }
      $localStorage.tab_states = appStates.states;

      if(insurance.ramo == 'Accidentes y Enfermedades'){
        $state.go('siniestros.info',{siniestroId: sinister.id})
      }else if (insurance.ramo == 'Daños' && (insurance.subramo =='Automóviles' || insurance.subramo.subramo_name == 'Automóviles')){
        $state.go('siniestros.auto_info',{siniestroId: sinister.id})
      }else if (insurance.ramo == 'Vida'){
        $state.go('siniestros.vida_info',{siniestroId: sinister.id})
      }else if (insurance.ramo == 'Daños' && (insurance.subramo !='Automóviles' || insurance.subramo.subramo_name != 'Automóviles')){
        $state.go('siniestros.danio_info',{siniestroId: sinister.id})
      }
    };

    $scope.goToSiniester = function(param, type,name, route){
      $localStorage['save_created_siniester_accident'] = {}
      if(type == 2){
        vm.insurance.relation = param.id;
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
      var params = { 'myInsurance': vm.insurance, 'contractor': "" }
      $state.go($scope.route_for_new_tab, params);
      //$state.go('siniestros.accidentes', {myInsurance: vm.insurance, contractor: ""})
    };

    $scope.goToPolicy = function(policy){
      $state.go('polizas.info', {polizaId: policy.id});
    }

    $scope.createSiniester = function(name, route){
      $localStorage['save_created_siniester_auto']  = {}
      $scope.open_in_same_tab_sns(name, route, {}, 0)
    };

    vm.checkEndorsementType = function checkType(obj) {
      if (obj.automobile)
        return 'automobile';
      else if (obj.life)
        return 'life';
      else if (obj.damage)
        return 'damage';
      else if (obj.disease) {
        return 'disease';
      }
    }

    function sendProvider(provider) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/aseguradoras/send.modal.html',
        controller: 'SendPDFModalCtrl',
        size: 'md',
        resolve: {
          provider: function() {
            return provider;
          },
          typeOT: function() {
            return 1;
          },
          from: function(){
            return null;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });
    }

    function viewContractor(name, route) {
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

      $stateParams.contractor = $scope.contratante
      if($scope.contratante.type_person == 'Física'){
        $state.go($scope.route_for_new_tab, {
            type: 'fisicas',
            contratanteId: vm.insurance.contractor,
            contractor:$scope.contratante
        });
      } else if($scope.contratante.type_person == 'Moral'){
        $state.go($scope.route_for_new_tab, {
            type: 'morales',
            contratanteId: vm.insurance.contractor,
            contractor:$scope.contratante
        });
      }
    }

    function getLog() {
      dataFactory.get('get-specific-log', {'model': 1, 'associated_id': vm.insurance.id})
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
    }
    function getLogReceipt(model,id) {
      dataFactory.get('get-specific-log', {'model': model, 'associated_id': id})
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
    }

    function showChange(endoso) {
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/cobranzas/infoChange.modal.html',
        controller: 'InfoChangeCtrl',
        size: 'lg',
        resolve: {
          endoso: function() {
            return endoso;
          }
        },
          backdrop: 'static', /* this prevent user interaction with the background */
          keyboard: false
      });
    }

    function NotasModal(receipt) {
      var insurance = receipt
      var modalInstance = $uibModal.open({
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

    function checkType(type) { //jshint ignore:line
      return (type === 'Fisica') ? 'fisicas' : 'morales';
    }

    function showSinisters(insurance) {
      vm.infoFlag = false;
      vm.sinistersFlag = true;

      $http({
        method: 'GET',
        url: url.IP + 'view-sinister',
        params: {
          policy: insurance.id
        }
      }).then(function success(response) {
        vm.sinisters = response.data.siniestros;
      })
    }

    function showNotas() {
      vm.infoFlag = false;
      vm.notasFlag = true;
    }
    function showRecordatorios() {
      vm.infoFlag = false;
      vm.recordatoriosFlag = true;
    }
    function showEndorsements(insurance) {
      vm.infoFlag = false;
      vm.endoFlag = true;

      $http({
        method: 'GET',
        url: url.IP + 'view-endosos',
        params: {
          policy: insurance.id
        }
      }).then(function success(response) {
        vm.endorsements = response.data.endosos;
      })
    }

    function returnToInfo(argument) {
      vm.infoFlag = true;
      vm.sinistersFlag = false;
      vm.endoFlag = false;
    }

    function openRenovateModal(name, route){
      $scope.errorpr=false
      if (vm.policy_history && $scope.existeNueva) {
        vm.policy_history.forEach(function (e){
          if(e.status==1){
            if (vm.insurance.renewed_status == 2 && $scope.existeNueva ==true) {
              SweetAlert.swal("Error", MESSAGES.ERROR.ERRORREPROCCESSRENPOLICY, "error");
              $scope.errorpr=true
              return
            }
          }
        })
      }
      if(((vm.insurance.renewed && $scope.errorpr) || vm.insurance.renewed_status == 2 && vm.policy_history.length > 0) && $scope.existeNueva){
        if(vm.insurance.renewed_status == 2 && vm.policy_history.length > 0 && $scope.existeNueva ==true){
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORREPROCCESSRENPOLICY, "error");
          return
        }else{
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRENEWPOLICY, "error");
        }
      }
      else{
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

        if ((vm.insurance.status == 'Cancelada' || vm.insurance.status == 'OT Cancelada' ) || (vm.insurance.status == 11 || vm.insurance.status == 2)) {
          SweetAlert.swal({
            title: "Póliza Cancelada",
            text: "¿Está seguro de renovar?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Continuar",
            cancelButtonText: "Cancelar",
            closeOnConfirm: true,
            closeOnCancel: true
          },
          function(isConfirm) {
            if (isConfirm) {
              var params = { polizaId: vm.insurance.id, myInsurance: vm.insurance };
              $rootScope.renewalDraftPolicy = angular.copy(vm.insurance) || null;
              $state.go('renovaciones.polizas', params);
            } else {
                // swal("Cancelado", MESSAGES.OK.CANCELCERT, "error");
                return;
            }
          });
        }else{
          var params = { polizaId: vm.insurance.id, myInsurance: vm.insurance };
          $rootScope.renewalDraftPolicy = angular.copy(vm.insurance) || null;
          $state.go('renovaciones.polizas', params);
        }

      }
    }

    function cancelRenovate(poliza) {
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
        $http.patch(poliza.url, data).then(function(ren) {
            var params = {
              'model': 1,
              'event': "PATCH",
              'associated_id': poliza.id,
              'identifier': " cambio el estatus a no renovada por el motivo "+ren.data.reason_ren+" de la póliza "+ ren.data.poliza_number+"."
            }
            dataFactory.post('send-log/', params).then(function success(response) {

            });
        });
        vm.insurance.status = 15;
        vm.insurance.reason_ren = inputValue;
        vm.insurance.renewed_status = 1;
        swal("Hecho", "La póliza se ha cerrado y no se vera más en el listado de renovaciones", "success");
      });
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

      vm.polizaId = param.id;
      vm.show_binnacle = true;
    };

    function exportPolicyComments() {
      if (!vm.polizaId || vm.commentsExportLoading) {
        return;
      }
      vm.commentsExportLoading = true;

      var resetLoading = function() {
        vm.commentsExportLoading = false;
      };

      var params = {
        model: 1,
        id_model: vm.polizaId
      };
      if (vm.org_name) {
        params.org = vm.org_name;
      }

      toaster.info('Generando...', 'El archivo se está generando, espera un momento.');

      
      exportFactory.commentsExport({
        params: params,
        downloadName: 'bitacora-poliza-' + vm.polizaId + '.xlsx',
        token: token
      })
      .then(function() {
        SweetAlert.swal({
          title: 'Listo',
          icon: 'success',
          text: 'La bitacora se descargo exitosamente',
          timer: 5000
        });
      })
      .catch(function(error) {
        console.error('Error exportando bitácora de póliza', error);
        SweetAlert.swal('Error', 'No se pudo exportar los comentarios de la póliza. Intenta nuevamente.', 'error');
      })
      .finally(function() {
        resetLoading();
      });
    }


    function getProviderIdFromInsurance() {
      if (!vm.insurance || !vm.insurance.aseguradora) return null;
      return vm.insurance.aseguradora.id || vm.insurance.aseguradora;
    }

    function getSubramoIdFromInsurance() {
      if (!vm.insurance || !vm.insurance.subramo) return null;
      if (angular.isObject(vm.insurance.subramo)) {
        return vm.insurance.subramo.id || null;
      }
      return vm.insurance.subramo_id || null;
    }

    function loadGeneralConditions() {
      var providerId = getProviderIdFromInsurance();
      var subramoId = getSubramoIdFromInsurance();

      if (!providerId || !subramoId) {
        vm.cg.catalog = [];
        vm.cg.selectedDocs = [];
        return;
      }

      vm.cg.loading = true;
      CondicionesGeneralesService.list({ aseguradora: providerId, subramo: subramoId })
        .then(function(res) {
          vm.cg.catalog = res.data.results || res.data || [];
          return CondicionesGeneralesService.getByPolicy(vm.insurance.id);
        })
        .then(function(res) {
          vm.cg.selectedDocs = res.data.results || res.data || [];
        })
        .catch(function() {
          vm.cg.catalog = [];
          vm.cg.selectedDocs = [];
        })
        .finally(function() {
          vm.cg.loading = false;
        });
    }

    function onGeneralConditionsChange() {
      if (!vm.insurance || !vm.insurance.id) return;
      vm.cg.saving = true;
      var ids = (vm.cg.selectedDocs || []).map(function(item) { return item.id; });
      CondicionesGeneralesService.saveSelectionForPolicy(vm.insurance.id, ids)
        .then(function() {
          return $http.get(url.IP + 'polizas/' + vm.insurance.id + '/archivos/');
        })
        .then(function(response) {
          vm.files = response.data.results || [];
          $scope.files = vm.files;
        })
        .finally(function() {
          vm.cg.saving = false;
        });
    }

    function removeGeneralCondition(doc) {
      if (!vm.insurance || !vm.insurance.id || !doc || !doc.id) return;
      vm.cg.selectedDocs = (vm.cg.selectedDocs || []).filter(function(item) { return item.id !== doc.id; });
      onGeneralConditionsChange();
    }

    function isGeneralConditionFile(file) {
      return !!(file && (file.condicion_general || file.is_condicion_general || file.origin === 'CG'));
    }

    function deleteFile(file,container) {
      if (isGeneralConditionFile(file)) {
        SweetAlert.swal("Acción no permitida", "Las Condiciones Generales sólo se administran desde el módulo centralizado.", "info");
        return;
      }
      SweetAlert.swal({
        title: '¿Está seguro?',
        text: "No será posible recuperar este archivo",
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
            id: file.id,
            id_poliza: vm.insurance.id,
            model: 6,
            type_person: 0,
          }
          dataFactory.post('send-email-admins-deletes/', data_email).then(function success(req) {
            
          });
          $http({
            method: 'GET',
            url: url.IP + 'delete-manual',
            params: {
              file_id: file.id
            }
          }).then(function success(response) {
            if(response.data.status == 204){
              SweetAlert.swal("¡Eliminado!", "El archivo fue eliminado.", "success");              
              var params = {
                'model': 1,
                'event': "PATCH",
                'associated_id':  vm.insurance.id,
                'identifier': " elimino 1 archivo de la póliza "+file.nombre
              }
              dataFactory.post('send-log/', params).then(function success(response) {});
              container.splice(container.indexOf(file), 1);
            }
          })
        }
      });
    }

    function showBinnacleReceipt(param) {
      $scope.receiptmodel = param.url;
      $http({
        method: 'GET',
        url: url.IP+'comments/',
        params: {
          'model': 4,
        'id_model': param.id
        }
      })
      .then(function(request) {
        vm.comments_data_receipt = [];
        vm.comments_data_receipt = request.data.results;
        vm.comments_config_receipt = {
          count: request.data.count,
          previous: request.data.previous,
          next: request.data.next
        }
      })
      .catch(function(e) {
        console.log('e', e);
      });

      vm.receipt_id = param.id;
      vm.show_binnacle_receipt = true;

    };

    vm.show_binnacle_receiptE = false;
    vm.showBinnacleReceiptE = showBinnacleReceiptE;
    function showBinnacleReceiptE(param) {
      $scope.receiptmodel = param.url;
      vm.comments_data_receipt = []
      $http({
        method: 'GET',
        url: url.IP+'comments/',
        params: {
          'model': 4,
        'id_model': param.id
        }
      })
      .then(function(request) {
        vm.comments_data_receipt = request.data.results;
        vm.comments_config_receipt = {
          count: request.data.count,
          previous: request.data.previous,
          next: request.data.next
        }
      })
      .catch(function(e) {
        console.log('e', e);
      });

      vm.receipt_id = param.id;
      vm.show_binnacle_receiptE = true;
    };
    vm.returnToReceiptsE = returnToReceiptsE
    function returnToReceiptsE() {
      vm.show_binnacle_receiptE = false;
    }

    $scope.formatCoverage = function (parValue) {
      // 1) Nulos / vacíos
      if (parValue === null || parValue === undefined) return "";
      var raw = ("" + parValue).trim();
      if (!raw) return "";

      // 2) Porcentajes: regresa tal cual
      if (raw.indexOf("%") !== -1) return raw;

      // 3) Intento de número: quitamos símbolos y separadores
      var cleaned = raw.replace(/\$/g, "").replace(/,/g, "").trim();
      var num = parseFloat(cleaned);

      // 4) No numérico → dejar "-" o el valor proporcionado (si es un literal útil)
      if (isNaN(num)) {
        // Si el valor original es un literal (AMPARADA, SIN LÍMITE, etc.), respétalo;
        // si no, devuelve "-"
        return raw || "-";
      }

      // 5) Numérico → formatea como moneda
      try {
        if (formatValues && typeof formatValues.currency === "function") {
          return formatValues.currency(num);
        }
      } catch (e) {
        // sigue con el fallback
      }
      // Fallback sin formatValues.currency
      return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

  
  

    //---guardar como poliza
    function saveAsInsurance(myInsurance) {
      var modalInstance = $uibModal.open({
          templateUrl: 'app/polizas/modals/otAsPolicyModal.html',
          controller: PolicyPendingModalCtrl,
          controllerAs: 'vmm',
          size: 'lg',
          resolve: {
              policyModal: function() {
                  return vm.insurance;
              }
          },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
      });
    // $state.go('polizas.editar', myInsurance);
    }

    //---guardar como poliza
    $scope.addPhoneWhatsapp = function(insurance, contra){
      insurance.contratante = contra;
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/cobranzas/add.phone.whatsappsms_reminderpay.html',
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
    $scope.addEmailsConfirmPolicy = function(insurance, contra){
      insurance.contratante = contra;
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

    function changeStatusModal(receipt, contra, insurance) {
      // if(vm.acceso_adm_pol){
        receipt.isDB = false;
        receipt.contratante = contra;
        var index = vm.receipts.indexOf(receipt);
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
        modalInstance.result.then(function(receipt) {
          activate();
        });
      // }
    }

    function activate() {
      $scope.moduleName = 'Célula';  
      $scope.campo_agrupacion = false;
      $scope.campo_celula = false;
      $scope.campo_lineanegocio = false;
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
      try{        
        $http.post(url.IP+ 'get-data-promotoria-initial/')
        .then(
          function success (response) {
            if(response.data.results.length >0){
              $scope.principal= response.data.original
              $scope.principal.contenedores= (response.data.original.data_details)
              $scope.principal.url= response.data.original.url
              $scope.principal.id= response.data.original.id 
            }
          },
          function error (e) {
            console.log('Error - promotorias--', e);
          }
        ).catch(function (error) {
          $scope.principal.contenedores=[]
          console.log('Error - promotablero - catch', error);
        });      
      }catch(e){}
      // bitacoras
      $http({
        method: 'GET',
        url: url.IP+'comments/',
        params: {
            'model': 1,
            'id_model': vm.polizaId
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

      $scope.view_siniestros = true;
      $scope.view_cartas = true;
      $scope.assign_policy = true;

      insuranceServices();

      $http({
        method: 'GET',
        url: url.IP + 'cartas-by-model',
        params: {
          model: 1
        }
      }).then(function success(response) {
        vm.cartas = response.data;
      })
    }
    $scope.saveBaja=false;
    $scope.changeBaja =function(url_c,valor,motivo_baja){
      $scope.saveBaja=true;
      if(url_c){
        $http.patch(url_c, {'baja':valor,'motivo_baja':motivo_baja}).then(function(response) {
          $scope.saveBaja=false;
          if(response.status == 200){
            toaster.success('Cambio exitoso', 'El cambio se ha aplicado con éxito');
          } else{
            $scope.saveBaja=false;
            toaster.warning('Ha ocurrido un problema', 'Intente nuevamente');
            vm.form.baja = !valor;
            vm.form.motivo_baja = '';
          }
        })
      }
    }
    // ------------tablero OT------
    function moveOTState(newcontainer,principal,seguimiento,tipo){
      SweetAlert.swal({
        title: "Mover Registro",
        text: "Se moverá "+ vm.insurance.internal_number+" de: "+vm.insurance.seguimiento+", al Contenedor: "+newcontainer.tablero,
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Continuar",
        cancelButtonText: "Cancelar"
      },
      function(isConfirm){
        if(isConfirm){
          if(principal.contenedores && principal.contenedores.length>0){
            principal.contenedores.forEach(function(r,i) {
              if(r.tablero == seguimiento){    
                r.polizas.splice(r.polizas.indexOf(vm.insurance.id), 1);
              }
              if(r.tablero == newcontainer.tablero){
                r.polizas.push(vm.insurance.id)
              }
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
            'polizas_ots' :principal.contenedores,
            'name':principal.name,
            'color':principal.color,
            'url': $scope.principal.url ? $scope.principal.url :''
          }
          if ($scope.principal.url && $scope.principal.url !='') {
            $http.patch($scope.principal.url,payload)
            .then(
              function success (response) {
                vm.insurance.seguimiento = newcontainer.tablero;
                activate();
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
    // tablero OT------------------
    function returnToReceipts() {
      vm.show_binnacle_receipt = false;
    }
    vm.table = {
      headers: [
        'Serie',
        'Prima neta',
        'Derecho',
        'RPF',
        'Iva',
        'Prima Total',
        'Estatus',
        'Acciones',
        'Vigencia',
        'Vencimiento'
      ]
    };
    vm.tables = {
      headers: [
        'Id',
        'Fecha de aplicación ',
        'Inicio de vigencia',
        'Fin de vigencia',
        'Tipo de endoso',
        'Aplicante'
      ]
    };
    vm.tablec = {
      headers:[
        'Cobertura',
        'Suma Asegurada',
        'Deducible',
        'Coaseguro'
      ]
    }

    $scope.getUsage = function(value){
      if(value == 1){
        return "PARTICULAR";
      }else if(value == 2){
        return "CARGA";
      }else if(value == 3){
        return "SERVICIO PÚBLICO";
      }
      else{
        return "CARGA";
      }
    };

    function insuranceServices(){
      var array=[];
      var array1=[];
      var output = insuranceService.getInsuranceRead($stateParams)
            .then(function(data){
              vm.insurance = data;
              /* Saving the last state visited in the local storage. */
              $localStorage['last_state_visited'] = {
                'id':vm.insurance.id,
                'route': 'polizas.info'
              };
              if (vm.insurance.life_policy.length > 0) {
                // if (vm.insurance.life_policy[0].personal) {
                //   if (vm.insurance.personal_life_policy.length > 0) {
                //     if ((vm.insurance.personal_life_policy.includes(vm.insurance.life_policy[0].personal.url)) && (vm.insurance.personal_life_policy.indexOf(vm.insurance.life_policy[0].personal.url))) {
                //     }else{
                //     }
                //   }
                // }
              }
              if(vm.insurance.ref_policy){
                vm.insurance.ref_policy.forEach(function(refs) {
                  $http.get(refs.referenciador).then(function success(response_ref_plicy) {
                    if(response_ref_plicy){
                      refs.data = response_ref_plicy.data
                    }
                  })
                });
              }
              if (parseInt(vm.insurance.business_line) == 1) {
                $scope.businessLine = 'Comercial'
              }
              if (parseInt(vm.insurance.business_line) == 2) {
                $scope.businessLine = 'Personal'
              }
              if (parseInt(vm.insurance.business_line) == 0) {
                $scope.businessLine = 'Otro'
              }

              if(vm.insurance.celula){
                $http.get(vm.insurance.celula)
                .then(function(response) {
                  $scope.celula = response.data.celula_name;
                });
              }
 
              // verificar si es o no multianual
              var d_start = new Date(vm.insurance.start_of_validity);
              var d_end   = new Date(vm.insurance.end_of_validity);

              var year_start = d_start.getFullYear();
              var year_end   = d_end.getFullYear();

              var vigencia_ = parseInt(year_end) - parseInt(year_start);

              if(vigencia_ > 1) {
                $scope.poliza_multianual = true;
              } else {
                $scope.poliza_multianual = false;
              }

              if(vm.insurance.automobiles_policy.length){
                vm.insurance.automobiles_policy[0].usage = parseInt(vm.insurance.automobiles_policy[0].usage);
              }
              $scope.existeNueva = false;
              $http({
                method: 'GET',
                url: url.IP + 'historic-policies/',
                params: {
                  actual_id: data.id
                }
              }).then(function success(response) {
                if(response.data.results.length){
                  vm.showHistoric = true;
                }
                vm.policy_history = [];
                response.data.results.forEach(function function_name(old) {
                  if(vm.insurance.id != old.base_policy.id){
                    vm.policy_history.push(old.base_policy);
                  } else if(old.new_policy) {
                    vm.policy_history.push(old.new_policy);
                    $scope.existeNueva = true;
                  }
                })
              })
              // --------------------
              $http({
                method: 'GET',
                url: url.IP + 'historic-policies/',
                params: {
                  actual_id: data.id
                }
              }).then(function success(response) {
                vm.policy_history_1 = [];
                response.data.results.forEach(function function_name(old) {
                  if(vm.insurance.id != old.base_policy.id){
                    vm.policy_history_1.push(old.base_policy);                    
                  }
                })
              })
      
              // -------------------------******

              if(vm.insurance.status < 10){
                var param = {
                  model: 6
                }
              } else {
                var param = {
                  model: 1
                }
              }
              $http({
                method: 'GET',
                url: url.IP + 'cartas-by-model',
                params: param
              }).then(function success(response) {
                vm.cartas = response.data;
              })

              $http({
                method: 'GET',
                url: url.IP + 'get-endosos-sinister',
                params: {
                  policy: data.id
                }
              }) .then(function success(response) {
                  vm.conteos = response.data;
              });
              // if (data.natural || data.juridical){
              if (data.contractor){
                $http({
                  method: 'GET',
                  url: url.IP + 'notas-by-contractor/',
                  params: {
                    // contractor: data.natural ? data.natural : data.juridical,
                    contractor: data.contractor,
                    type_contractor: data.natural ? 'natural' : 'juridical',
                    poliza_id: data.id

                  }
                }).then(function success(response) {
                  vm.notas = response.data;
                })

                // if(data.juridical)
                //   var url_aux = url.IP + 'morales-resume-medium/'+ data.juridical+'/';
                // else
                //   var url_aux = url.IP + 'fisicas-resume-medium/'+ data.natural+'/';
                  var url_aux = url.IP + 'contractors-resume-medium/'+ data.contractor+'/';
                  $http({
                    method: 'GET',
                    url: url_aux
                  }).then(
                    function success(response) {
                      $scope.contratante = response.data;
                      if($scope.contratante.phone_number) {
                        var phone_number = $scope.contratante.phone_number.replace( /^\D+/g, '').replace( "'}", '');
                        $scope.contratante.phone_number = phone_number;
                      } else {
                        $scope.no_phone = "Sin teléfono asignado";
                      }
                      if($scope.contratante.email){
                        $scope.email = response.data.email;
                      } else{
                        $scope.no_email = "Sin correo asignado";
                      }
                      // if(data.juridical)
                      //   $scope.addressContratante = response.data.address_juridical[0];
                      // else{
                      //   $scope.addressContratante = response.data.address_natural[0];
                      // }
                      $scope.addressContratante = response.data.address_contractor[0];

                      if($scope.contratante.cellule){
                        $scope.contratante.cellule = $scope.contratante.cellule.celula_name;
                      }
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

                    }, function error(response) {
                      console.log('error', response);
                  });
              }
                vm.observations = data.observations;



                vm.show.isPolicy = helpers.isPolicy(data);
                var wait = [];
                var dfd = $q.defer()
                data.recibos_poliza = data.receipts_poliza
                // data.recibos_poliza.forEach(function (recibo) {
                //   wait.push($http.get(recibo));
                // })



                vm.files = [];
                $http.get(url.IP + 'polizas/'+ vm.insurance.id +'/archivos/').then(function(response) {
                  if(response.status === 200) {
                    vm.files = response.data.results;
                    $scope.files = response.data.results;
                    $scope.show_files_policy = true;
                    loadGeneralConditions();
                  } else if(response.status === 403) {
                    $scope.show_files_policy = false;
                  }
                });

                // $q.all(wait).then(function(responses) {
                  var aux=[]
                  var recibos = [];
                  vm.receipts = [];

                  data.receipts_poliza.forEach(function(recibo) {
                    // if(recibo.data.isCopy == true){
                    if(recibo.isCopy == true){

                    }
                    else{
                      // var item = parseFloat(recibo.data.prima_total);
                      var item = parseFloat(recibo.prima_total);
                      recibos.push(item);
                      // aux.push(recibo.data);
                      aux.push(recibo);
                    }
                  });

                  recibos = data.receipts_poliza
                  $scope.recibos = recibos.sort();

                  $scope.prima_total = function() {
                    return data.p_total
                  }

                  $scope.prima_neta = function() {
                    // var p_neta_desc = data.p_neta - (data.p_neta * (data.descuento * 0.01));
                    // return p_neta_desc
                    return data.p_neta
                  }

                  $scope.derecho = function() {
                    return data.derecho
                  }

                  $scope.recargo = function() {
                    return data.rpf
                  }

                  $scope.iva = function() {
                    return data.iva
                  }
                  $scope.descuento = function() {
                    // var p_desc = parseFloat(data.p_neta * ((data.descuento * 0.01))).toFixed(2);
                    return data.descuento
                    // return p_desc;
                  }

                  function getSum(total, num) {
                      return total + num;
                  }

                  vm.receipts = aux;
                  vm.policy_receipts_show = [];
                  vm.endorsement_receipts_show = [];
                  vm.endosos_options = [];
                  vm.endorsement_receipts_show_bak = []
                  $scope.data_sums = {
                    p_neta : 0,
                    derecho : 0,
                    rpf : 0,
                    p_total : 0,
                    comision : 0,
                    iva : 0,
                  }
                  vm.receipts_manual = 0
                  vm.receipts.forEach(function(receipt) {
                    if (receipt.serie_manual){
                      vm.receipts_manual = vm.receipts_manual + 1;
                    }
                    $scope.isCat = false;
                    if(receipt.status == 0){
                      return;
                    }

                    if(receipt.receipt_type == 1){
                      $scope.view_sums = false;
                      $scope.isCat = receipt.is_cat;
                      var lengRec = vm.insurance.recibos_poliza.length;
                      var length = 0;
                      $scope.data_sums.p_neta = parseFloat(parseFloat($scope.data_sums.p_neta )+ parseFloat(receipt.prima_neta)).toFixed(2);
                      $scope.data_sums.derecho = parseFloat(parseFloat($scope.data_sums.derecho )+ parseFloat(receipt.derecho)).toFixed(2);
                      $scope.data_sums.rpf = parseFloat(parseFloat($scope.data_sums.rpf )+ parseFloat(receipt.rpf)).toFixed(2);
                      $scope.data_sums.p_total = parseFloat(parseFloat($scope.data_sums.p_total )+ parseFloat(receipt.prima_total)).toFixed(2);
                      if(receipt.status != 6){
                        $scope.data_sums.comision = parseFloat(parseFloat($scope.data_sums.comision )+ parseFloat(receipt.comision)).toFixed(2);
                      }else if (receipt.status == 6) {
                        $scope.data_sums.comision = parseFloat(parseFloat($scope.data_sums.comision )+ parseFloat(receipt.comision_conciliada)).toFixed(2);
                      }
                      $scope.data_sums.iva = parseFloat(parseFloat($scope.data_sums.iva )+ parseFloat(receipt.iva)).toFixed(2);
                      vm.policy_receipts_show.push(receipt);
                    }else{

                      function findCoincidences(argument) {
                        return argument === receipt.endo_aux;
                      }
                      if(!vm.endosos_options.find(findCoincidences)){
                        vm.endosos_options.push(receipt.endo_aux);
                      }

                      vm.endorsement_receipts_show.push(receipt);
                      vm.endorsement_receipts_show_bak.push(receipt);
                    }
                  });

                  if($scope.poliza_multianual){
                    $scope.polizasMultianuales();
                  }
              // });
            });
      return vm.insurance.folio
    }

    $scope.polizasMultianuales = function(){
      $scope.receipts_policy = [];
      vm.receipts.forEach(function(item){
        if(item.receipt_type == 1){
          $scope.receipts_policy.push(item);
        }
      });

      $scope.aniosPoliza = [];

      var date_initial = (convertDate(vm.insurance.start_of_validity)).split('/');
      var date_final = (convertDate(vm.insurance.end_of_validity)).split('/');
      var anio_initial = parseInt(date_initial[2]);
      var anio_final = parseInt(date_final[2]);
      var total_anios = anio_final - anio_initial;

      for(var i = 1; i <= total_anios; i ++){
        $scope.aniosPoliza.push(i);
      }

      $scope.anioPoliza = $scope.aniosPoliza[0];
      $scope.showReceiptsYear($scope.anioPoliza);
    };

    $scope.showReceiptsYear = function(value){
      var fechaPrincipal = convertDate(vm.insurance.start_of_validity);
      var arrayFecha = fechaPrincipal.split('/');
      var dia = parseFloat(arrayFecha[0]); 
      var mes = parseFloat(arrayFecha[1]); 
      var anioInicial = parseFloat(arrayFecha[2]) + (value - 1); 
      var anioFinal = parseFloat(arrayFecha[2]) + value; 
      var fechaInicial = mes + '/' + dia + '/' + anioInicial;
      var fechaTerminacion = mes + '/' + dia + '/' + anioFinal;
      if(vm.insurance.forma_de_pago !=5){
        vm.policy_receipts_show = [];
        $scope.receipts_policy.forEach(function(item, index){
          // if(item.fecha_inicio >= new Date(fechaInicial).toISOString() && item.fecha_inicio < new Date(fechaTerminacion).toISOString()){
          if(new Date(item.fecha_inicio) >= new Date(fechaInicial) && new Date(item.fecha_inicio) < new Date(fechaTerminacion)){
            vm.policy_receipts_show.push(item);
          }
        });
      }
    };

    $scope.changeFrecuencyMultianual = function(){
      if($scope.anioPoliza != 1){
        $scope.flag_pay = false;
        vm.policy_receipts_show.forEach(function(item){
          if(item.status != 4){
            $scope.flag_pay = true;
          }
        });

        if($scope.flag_pay){
          SweetAlert.swal("Error", "No se puede cambiar la frecuencia de este año porque existen recibos pagados.", "error");
          return;
        } else {
          var policy_receipts = $scope.json_poliza[$scope.anioPoliza - 2];

          var dates = {
            'inicio': convertDate(policy_receipts[0].fecha_inicio) + ' 00:00:00',
            'fin': convertDate(policy_receipts[policy_receipts.length - 1].fecha_fin) + ' 00:00:00',
            'id_poliza': vm.insurance.id
          };

          $http.post(url.IP+'get-anios-subsecuentes/', dates)
          .then(function(can_pay) {
            $scope.can_pay = can_pay.data.canpay;
            if($scope.can_pay){
              SweetAlert.swal({
                title: "¿Estás seguro?",
                text: "La frecuencia cambiará a partir de este año en adelante.",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si",
                cancelButtonText: "No"
                },
                function(isConfirm) {
                  if (isConfirm) {
                    var modalInstance = $uibModal.open({
                      templateUrl: 'app/polizas/recalculoModal.html',
                      controller: RecalcularModalCtrl,
                      controllerAs: 'order',
                      size: 'lg',
                      resolve: {
                        receipts: function() {
                          return vm.policy_receipts_show;
                        },
                        insurance: function() {
                          return vm.insurance;
                        }
                      },
                      backdrop: 'static', /* this prevent user interaction with the background */
                      keyboard: false
                    });
                    modalInstance.closed.then(function(receipt) {
                      activate();
                    });
                  }
                }
              );
            } else {
              SweetAlert.swal("Error", "No se puede cambiar la frecuencia de este año porque existen recibos anteriores pendientes.", "error");
              return;
            }
          });
        }
      }
    };

    function changeEndorsement(endorsement) {
      if(endorsement){
        vm.endorsement_receipts_show = []
        vm.endorsement_receipts_show_bak.forEach(function(child) {
          if(child.endo_aux == endorsement){
            vm.endorsement_receipts_show.push(child);
          }
        })
      } else {
        vm.endorsement_receipts_show = vm.endorsement_receipts_show_bak;
      }
    }

    function RecalcularModalCtrl($scope, $uibModalInstance, receipts, insurance) {
      var order = this;

      $scope.payments = [
        {'name': 'Mensual', 'value': '12'},
        {'name': 'Bimestral', 'value': '2'},
        {'name': 'Trimestral', 'value': '3'},
        {'name': 'Semestral', 'value': '6'},
        {'name': 'Anual', 'value': '1'},
      ];

      order.form = {
        'subramo': {'subramo_name': insurance.subramo},
        'startDate': convertDate(receipts[0].fecha_inicio),
        'endingDate': convertDate(insurance.end_of_validity)
      }

      var date1 = new Date(receipts[0].fecha_inicio);
      var date2 = new Date(insurance.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

      $scope.changePayment = function(pay){
        order.form.payment = pay.value;

      };

      $scope.saveNewReceipts = function(){

      };

      $scope.cancel = function(pay){
        $uibModalInstance.dismiss('cancel');
      };
    };

    function PolicyModalCtrl($scope, contractorModal, $uibModalInstance, urlInsurance, receipts) {

      $scope.buttonDisabled = true;
      $scope.addnotasToCancel = true;
      if(vm.insurance.poliza_number){
        $scope.optionsCancel = [
          {'value': 1, 'label': 'Cancelación Tipo D'},
          {'value': 2, 'label': 'Precancelación'},
          {'value': 3, 'label': 'Cancelación definitiva - A petición'},
          {'value': 4, 'label': 'Cancelación definitiva - Falta de pago'}
        ];
      }
      else if(vm.acceso_canc_pol){
        $scope.optionsCancel = [
          {'value': 1, 'label': 'Cancelación Tipo D'},
          {'value': 2, 'label': 'Precancelación'}
        ];
      } else {
        $scope.optionsCancel = [
          {'value': 2, 'label': 'Precancelación'}
        ];
      }
      $scope.optionCancel = $scope.optionsCancel[2];
      $scope.date_cancel = convertDate(new Date());
      vm.insurance.date_cancel = convertDate(new Date());
      $scope.checkCancelDate = function(dat){
        $scope.date_cancel = dat;
      }
      $scope.addnotasToCancelF  = function(addnotas){
        $scope.addnotasToCancel = addnotas;
      }
      $scope.cancelPolicy = function(option,reason,date, addnotas){
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        if(option.value == 1){
          var params = { 'myInsurance': vm.insurance, 'contractor': contractorModal }
          $scope.iracrearendoso('Endoso','endorsement.endorsement',params)
          // $state.go('endorsement.endorsement',params);
          $uibModalInstance.dismiss('cancel');
        } else if(option.value == 2){
          var user_cancel = vm.user.nameFull;
          vm.notas_cancel = [];
          $http.patch(urlInsurance, {status: 4,reason_cancel: reason})
          .then(function(data) {
            if(data.status === 200 || data.status === 201){
              vm.insurance.status = data.data.status;
              vm.insurance.reason_cancel = data.data.reason_cancel;
              $http.post(url.IP + 'cancel-policy-manual/', {'id': vm.insurance.id, 'user_cancel' : user_cancel})
              .then(function success(request){
                $uibModalInstance.dismiss('cancel');
                if(request.data.status =='sent'){
                  swal("¡Listo!", "Se ha enviado un correo al administrador", "success");
                  receipts.forEach(function(child) {
                    if(child.status == 4 && child.receipt_type !=3){
                      var params = {
                        'model': 4,
                        'event': "PATCH",
                        'associated_id': child.id,
                        'identifier': ' actualizo el recibo pendiente de pago a cerrado al cancelar la póliza: '+ vm.insurance.poliza_number,
                      }
                      dataFactory.post('send-log/', params).then(function success(response) {
                      });
                      $http.patch(child.url, {status: 8})
                        .then(function(data_receipt) {
                      });
                    }
                  })
                  var params = {
                    'model': 1,
                    'event': "POST",
                    'associated_id': vm.insurance.id,
                    'identifier': vm.insurance.poliza_number ? "precanceló la póliza." : "precanceló canceló la OT."
                  }
                  dataFactory.post('send-log/', params).then(function success(response) {
                  });
                  l.stop();
                  activate();
                }
                else{
                  swal("Error", "No se envió la póliza. Contacte a su administrador.", "error");
                  l.stop();
                }
              },function error(error){
                console.log('error - email', error);
              })
              .catch(function(e) {
                console.log('error - catch', e);
              });
            }
          });
        } else if (option.value == 3 || option.value == 4){
          if (date) {
            date = datesFactory.toDate(date);
          }else{
            date = new Date();
          }
          $http.patch(urlInsurance, {status: 11,reason_cancel: option.label +' // ' +reason, date_cancel: date, cancelnotas: $scope.addnotasToCancel })
          .then(function(data) {
            vm.insurance.status = data.data.status;
            receipts.forEach(function(child) {
              if(((child.status == 4 || child.status == 3) && child.receipt_type !=3) && addnotas ==false){
                var params = {
                  'model': 4,
                  'event': "PATCH",
                  'associated_id': child.id,
                  'identifier': ' cancelo recibo al cancelar la póliza: '+ vm.insurance.poliza_number,
                }
                dataFactory.post('send-log/', params).then(function success(response) {
                });
                $http.patch(child.url, {status: 2});
              }
              if(((child.status == 4 || child.status == 3)) && addnotas ==true){
                var params = {
                  'model': 4,
                  'event': "PATCH",
                  'associated_id': child.id,
                  'identifier': ' cancelo recibo al cancelar la póliza: '+ vm.insurance.poliza_number,
                }
                dataFactory.post('send-log/', params).then(function success(response) {
                });
                $http.patch(child.url, {status: 2});
              }
            })
            if (addnotas ==false) {
              var params = {
                'model': 1,
                'event': "POST",
                'associated_id': vm.insurance.id,
                'identifier': "canceló la póliza de forma definitiva."
              }              
            }else{
              var params = {
                'model': 1,
                'event': "POST",
                'associated_id': vm.insurance.id,
                'identifier': "canceló la póliza de forma definitiva y sus notas."
              }  
            }
            dataFactory.post('send-log/', params).then(function success(response) {

            });
            l.stop();
            activate();
            $uibModalInstance.dismiss('cancel');
            swal("Hecho", "Se ha cancelado definitivamente la póliza", "success");
          });
        }
      };
      $scope.iracrearendoso = function(name, route,params){
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

        var params = { 'myInsurance': vm.insurance, 'contractor': contractorModal }
        if (route =='endorsement.endorsement') {
          $localStorage['save_filters_endoso_poliza'] = {}
          $localStorage['save_filters_endoso_poliza']['poliza'] = vm.insurance.poliza_number
          $localStorage['save_filters_endoso_poliza']['poliza_id'] = vm.insurance.id
          $localStorage['save_filters_endoso_poliza']['origin_endorsement'] = vm.insurance
        }
        $state.go($scope.route_for_new_tab, params);
      }
      $scope.close = function(){
        $uibModalInstance.dismiss('cancel');
      };
    }

    function cancelPolicy(id){
      // dataFactory.get('has-cancel-policy-permission')
      // .then(function success(response) {
      //   if(true){
          if(vm.insurance.status == 4 || vm.insurance.status == 1 || vm.insurance.status == 2){
              SweetAlert.swal({
                title: "¿Está seguro?",
                text: vm.insurance.poliza_number ? "La póliza " + vm.insurance.poliza_number + " quedara cancelada" : "Se cancelará la OT",
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
                  if(vm.insurance.status == 4){
                    var data = {
                      status: 11
                    }
                  } else {
                    var data = {
                      status: 2
                    }
                  }
                  $http.patch(vm.insurance.url, data).then(function success(response) {
                    if(response.status == 200 && vm.insurance.status == 4){
                      vm.notas_cancel = [];
                      if (vm.notas) {
                        vm.notas.forEach(function notas(no) {
                          if (no.policy.id == vm.insurance.id) {
                            // if (no.status == 1) {
                            //   no.status = 4
                            //   vm.notas_cancel.push(no)
                            //   $http.patch(no.url, {status: 4}).then(function success(response) {
                            //     if(response.status == 200 || response.status == 201){
                            //       var params = {
                            //         'model': 4,
                            //         'event': "PATCH",
                            //         'associated_id': response.data.id,
                            //         'identifier': ' cambio estatus de nota a pendiente de pago al cancelar la póliza',
                            //       }
                            //       dataFactory.post('send-log/', params).then(function success(response) {
                            //       });
                            //     }
                            //   })
                            // }
                          }
                        })
                      }
                      vm.insurance.recibos_poliza.forEach(function(recibo) {
                        $http.get(recibo).then(function success(respponse) {
                          if(respponse.data.status != 1 && respponse.data.status != 5 && respponse.data.status != 6 && respponse.data.receipt_type != 3){
                            var params = {
                              'model': 4,
                              'event': "PATCH",
                              'associated_id': respponse.data.id,
                              'identifier': ' cambio estatus de recibo a cancelado al cancelar la póliza',
                            }
                            dataFactory.post('send-log/', params).then(function success(response) {
                            });
                            $http.patch(recibo, {status: 2});
                          }
                        })
                      })
                    }

                    var params = {
                      'model': 1,
                      'event': "POST",
                      'associated_id': vm.insurance.id,
                      'identifier': vm.insurance.poliza_number ? "canceló la póliza." : "canceló canceló la OT."
                    }
                    dataFactory.post('send-log/', params).then(function success(response) {

                    });

                    SweetAlert.swal("Hecho", MESSAGES.OK.POLICYCANCELED, "success");
                    vm.insurance.status = response.data.status;
                  })

                } else {
                  SweetAlert.swal("Cancelado", MESSAGES.OK.CANCELEDCANCEL, "error");
                }
              });
          } else {
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
                  return vm.insurance.url;
                },
                receipts: function() {
                  return vm.receipts;
                }
              },
              backdrop: 'static', /* this prevent user interaction with the background */
              keyboard: false
            });
            modalInstance.result.then(function(receipt) {
              $state.go('polizas.info', { polizaId: myInsurance.id });
            });
          }
      //     } else {
      //       SweetAlert.swal("Error", "No tienes permiso para realizar esta acción", "error");
      //     }
      // })
    }
    function reActivatePolicy(id, poliza_number){
      var modalInstance = $uibModal.open({
        templateUrl: 'app/polizas/polizas.rehabilitar.html',
        controller: ReActivatePolicyCtrl,
        controllerAs: 'vmm',
        size: 'md',
        resolve:{
          idInsurance: function() {
            return vm.insurance.id;
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
            'identifier': poliza_number ? "reactivo la póliza." : "reactivo la OT."
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

    function ReActivatePolicyCtrl($scope, $uibModalInstance, idInsurance) {

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

    function createRecordatorio(registroSelected, tipo) {
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
            return vm.insurance;
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

    function reactivePolicy(id){
      // dataFactory.get('has-cancel-policy-permission')
      // .then(function success(response) {
      //   if(true){
          if(vm.insurance.status == 4 || vm.insurance.status == 11){
              SweetAlert.swal({
                title: "¿Está seguro?",
                text: vm.insurance.poliza_number ? "La póliza " + vm.insurance.poliza_number + " quedará en Estatus Vigente" : "Se recativará la OT En Trámite",
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
                  if(vm.insurance.status == 4 || vm.insurance.status == 11){
                    var data = {
                      status: 14
                    }
                  } else {
                    var data = {
                      status: 1
                    }
                  }
                  $http.patch(vm.insurance.url, data).then(function success(response) {
                    if(response.status == 200 && (vm.insurance.status == 4 || vm.insurance.status == 11)){
                      console.log('---vm.insurance.recibos_poliza',vm.insurance.recibos_poliza,response)
                      vm.insurance.recibos_poliza.forEach(function(recibo) {
                        $http.get(recibo).then(function success(respponse) {
                          if(respponse.data.status == 8){
                            var params = {
                              'model': 4,
                              'event': "PATCH",
                              'associated_id': respponse.data.id,
                              'identifier': ' actualizo recibo de cerrado a pendiente de pago al reactivar la póliza: '+ vm.insurance.poliza_number,
                            }
                            dataFactory.post('send-log/', params).then(function success(response) {
                            });
                            $http.patch(recibo, {status: 4});
                          }
                          else if(respponse.data.status == 2){
                            var params = {
                              'model': 4,
                              'event': "PATCH",
                              'associated_id': respponse.data.id,
                              'identifier': ' actualizo recibo de cancelado a pendiente de pago al reactivar la póliza: '+ vm.insurance.poliza_number,
                            }
                            dataFactory.post('send-log/', params).then(function success(response) {
                            });
                            $http.patch(recibo, {status: 4});
                          }
                        })
                      })
                    }

                    var params = {
                      'model': 1,
                      'event': "POST",
                      'associated_id': vm.insurance.id,
                      'identifier': vm.insurance.poliza_number ? "reactivo la póliza." : "reactivo la OT."
                    }
                    dataFactory.post('send-log/', params).then(function success(response) {

                    });

                    SweetAlert.swal("Hecho", MESSAGES.OK.POLICYREACTIVED, "success");
                    vm.insurance.status = response.data.status;
                  })

                } else {
                  SweetAlert.swal("Reactivación", MESSAGES.OK.CANCELEDCANCEL, "error");
                }
              });
            } else {
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
                    return vm.insurance.url;
                  },
                  receipts: function() {
                    return vm.receipts;
                  }
                },
                backdrop: 'static', /* this prevent user interaction with the background */
                keyboard: false
              });
              modalInstance.result.then(function(receipt) {
                $state.go('polizas.info', { polizaId: myInsurance.id });
              });
            }
      //     } else {
      //       SweetAlert.swal("Error", "No tienes permiso para realizar esta acción", "error");
      //     }
      // })
    }

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
    function DeleteElementController($scope, $uibModalInstance, log,valores,item,tipo,poliza){
      $scope.aeliminar = log;
      $scope.lista = valores;
      $scope.tipo = tipo;
      $scope.itemDelete = item;
      // 1------subgrupo,2-categoria,c3--ertificado
      $scope.okay = function(x){
        var texto = ''
        var texto2=''
        var texto3=''
        if(item.document_type ==1){
          texto ='Subgrupo'
          texto2 = 'Se eliminará la Póliza, y todas sus dependencias, ¿Estás Seguro?'
          texto3 = 'Se ha eliminado la Póliza '+item.name +'('+item.id+') y sus relaciones '
        }
        SweetAlert.swal({
            title: 'Eliminar '+texto,
            text: texto2 +"\n",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si, estoy seguro.",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false
          },
          function(isConfirm){
            if(isConfirm){
              // if(param.categorias.length > 1){
                $http.delete(item.url)
                .then(function success(response){
                  if(response.status == 204){
                    var paramsLogP_ = {
                      'model': 18,
                      'event': "PATCH",
                      'associated_id': poliza.id,
                      'change': log,
                      'identifier': texto3,
                    }
                    dataFactory.post('send_log_specific/', paramsLogP_).then(function success(response){
                    });
                    var paramsLogP = {
                      'model': 1,
                      'event': "PATCH",
                      'associated_id': carpolizaatula.id,
                      'change': log,
                      'identifier': texto3,
                    }
                    dataFactory.post('send_log_specific/', paramsLogP).then(function success(response){
                      SweetAlert.swal("¡Listo!", texto3, "success");
                      $uibModalInstance.dismiss('cancel');
                    });
                  }
                })
                .catch(function(e){
                  console.log('e', e);
                });
              // }else{
              //   SweetAlert.swal("Error", "No se eliminó la categoría porque el subgrupo no puede quedarse sin categorías.", "error");
              // }
            }
          });
        // $uibModalInstance.dismiss('cancel');
      };
      $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
      };
    };
    function ModalInstanceCtrlCancelPolicy ($scope, $uibModalInstance) {
      if(vm.insurance.poliza_number > 0)
        $scope.is_policy = true;
      else
        $scope.is_policy = false;
      $scope.ok = function () {

        var d = new Date();
        var today =new Date( d.getFullYear(),d.getMonth(),d.getDate());
        // today.toLocaleFormat('%YY- %mm-%dd');

        for (var i = 0; i<vm.receipts.length;i++){

          if(vm.receipts[i].status != 1 ){
            var params = {
              'model': 4,
              'event': "PATCH",
              'associated_id': vm.receipts[i].id,
              'identifier': ' actualizo recibo a cancelado al cancelar la póliza',
            }
            dataFactory.post('send-log/', params).then(function success(response) {
            });
            $http.patch(vm.receipts[i].url,{status: 2});
          }
        }
        if (vm.insurance.status < 10){
          var params = {
              'model': 1,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': ' cancelo la OT',
            }
            dataFactory.post('send-log/', params).then(function success(response) {
            });
          $http.patch(vm.insurance.url,{status: 2})
        }
        else{
            var params = {
              'model': 1,
              'event': "PATCH",
              'associated_id': vm.insurance.id,
              'identifier': ' cancelo la póliza',
            }
            dataFactory.post('send-log/', params).then(function success(response) {
            });
          $http.patch(vm.insurance.url,{status: 11}).then(function success(dataupdatecancel) {
            if(vm.insurance.renewed_status ==2){
              $http.patch(vm.insurance.url,{renewed_status: 1})
            }
          });
        }


          setTimeout(function() { $state.go('polizas.table');}, 1000);
          $uibModalInstance.dismiss('cancel');
      };

      $scope.cancel = function () {
        if($uibModalInstance)
          $uibModalInstance.dismiss('cancel');
      };
    }
    

    $scope.renovarPolizaRehabilitate = function(idp,numerop){
      $scope.date1 = convertDate(datesFactory.toDate(convertDate(vm.insurance.end_of_validity)))
      if(process($scope.date1) < process(convertDate(new Date()))){
        $scope.status_nuevo = 13
      }else if(process($scope.date1) > process(convertDate(new Date()))){
        $scope.status_nuevo = 14
      }else{
        $scope.status_nuevo = 13
      }
      function process(date){
        var parts = date.split("/");
        var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
        return date.getTime();
      }
      SweetAlert.swal({
          title: "Actualización de Póliza para Renovación",
          text: "Los cambios se aplicarán en la Póliza "+ vm.insurance.poliza_number,
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
          $http.patch(vm.insurance.url,{'status': $scope.status_nuevo})
          .then(upgPolicyComplete)
          .catch(upgPolicyFailed);
          function upgPolicyComplete(response, status, headers, config) {
            if(response.status === 200 || response.status === 201){
              SweetAlert.swal("¡Listo!", MESSAGES.OK.UPGRADEPOLICY, "success");
              var params = {
                'model': 1,
                'event': "POST",
                'associated_id': vm.insurance.id,
                'identifier': "actualizo la póliza para ser renovada "
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
    function deletePolicy(id){
      $scope.text_patch_ant = ''
      $scope.status_ant = ''
      $scope.text_patch_ant = ''
      if (vm.insurance.status == 1 || vm.insurance.status == 2) {
        if (vm.policy_history_1.length > 0) {
          if (vm.policy_history_1[0].status != 12) {
            $scope.text_patch_ant = ' \nSe cambiará el estatus de la póliza: '+vm.policy_history_1[0].poliza_number+' asociada'
            $scope.status_ant = vm.policy_history_1[0].status
          }else{
            if(vm.policy_history_1[0].status == 12){
              $scope.text_patch_ant = ''
              $scope.status_ant = vm.policy_history_1[0].status
            }
            $scope.text_patch_ant = ''
            $scope.status_ant = vm.policy_history_1[0].status
          }
        }
      }
      if (vm.policy_history_1.length > 0) {
        $scope.date1 = convertDate(datesFactory.toDate(convertDate(vm.policy_history_1[0].end_of_validity)))
        if(process($scope.date1) < process(convertDate(new Date()))){
          $scope.status_ant = 13
        }else if(process($scope.date1) > process(convertDate(new Date()))){
          $scope.status_ant = 14
        }else{
          $scope.status_ant = vm.policy_history_1[0].status
        }
      }

      function process(date){
        var parts = date.split("/");
        var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
        return date.getTime();
      }
        
      $http({
        method: 'GET',
        url: url.IP + 'get-relations-by-id/',
        params: {
          'id': vm.insurance.id,
          'id_caratula': vm.insurance.id
        }
      })
      .then(function(response_relations){
        var foo = response_relations.data['categorias'].map(function(bar){
          return 'ID: '+bar[2]+',Nombre:'+bar[0]+'\n'
        })
        var crt = response_relations.data['certificados'].map(function(bar){
          return 'ID: '+bar[3]+',Certificado:'+bar[2]+',Categoría:'+bar[0]+'\n'
        })
        var arc = response_relations.data['archivos'].map(function(bar){
          return 'ID: '+bar[3]+',Nombre:'+bar[2]+',PólizaID:'+bar[0]+'\n'
        })
        var arcc = response_relations.data['archivosCertificados'].map(function(bar){
          return 'ID: '+bar[3]+',Nombre:'+bar[2]+',PólizaID:'+bar[0]+'\n'
        })
        var end = response_relations.data['endosos'].map(function(bar){
          return 'ID: '+bar[2]+',Número:'+bar[1]+',Interno:'+bar[0]+'\n'
        })
        var endc = response_relations.data['endososCertificados'].map(function(bar){
          return 'ID: '+bar[4]+',Número:'+bar[1]+',Interno:'+bar[0]+',PolizaN:'+bar[2]+',PolizaID:'+bar[3]+'\n'
        })
        var recs = response_relations.data['recibos'].map(function(bar){
          return 'ID: '+bar[3]+',Serie:'+bar[0]+',Tipo:'+bar[1]+'\n'
        })
        var sins = response_relations.data['siniestros'].map(function(bar_){
          return 'ID: '+bar_[4]+',Número:'+bar_[1]+',Interno:'+bar_[0]+',PolizaN:'+bar_[2]+',PolizaID:'+bar_[3]+'\n'
        })
        var sinsc = response_relations.data['siniestrosCertificados'].map(function(bar){
          return 'ID: '+bar[4]+',Número:'+bar[1]+',Interno:'+bar[0]+',PolizaN:'+bar[2]+',PolizaID:'+bar[3]+'\n'
        })
        $scope.textLog = $scope.textLog +'Archivos: '+ (response_relations.data['archivos'] ? arc : 'Sin archivos')+'\n'
        $scope.textLog = $scope.textLog +'Endosos: '+ (response_relations.data['endosos'] ? end : 'Sin endosos')+'\n'
        $scope.textLog = $scope.textLog +'Recibos: '+ (response_relations.data['recibos'] ? recs: 'Sin recibos')+'\n'
        $scope.textLog = $scope.textLog +'Siniestros: '+ (response_relations.data['siniestros'] ? sins: 'Sin siniestros')+'\n'
        
      })
      .catch(function(e){
        console.log('e', e);
      });
      SweetAlert.swal({
          title: "¿Está seguro?",
          text: "Los cambios no podrán revertirse."+ $scope.text_patch_ant,
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

          $http.patch(vm.insurance.url,{'status': 0})
          // $http.patch(vm.insurance.url)
              .then(deletePolicyComplete)
              .catch(deletePolicyFailed);
          function deletePolicyComplete(response, status, headers, config) {
            if(response.status === 200 || response.status === 201){
              var data_email = {
                id: vm.insurance.id,
                model: 2,
                type_person: 0,
              }
              dataFactory.post('send-email-admins-deletes/', data_email).then(function success(req) {
                  
              });
              if (vm.policy_history_1.length > 0) {
                $http.patch(vm.policy_history_1[0].url, { renewed_status: 0, status : $scope.status_ant})
                .then(function(xPolicy) {
                    var params = {
                      'model': 1,
                      'event': "PATCH",
                      'associated_id': vm.policy_history_1[0].id,
                      'identifier': "cambio el estatus de renovación de la póliza: "+vm.policy_history_1[0].poliza_number+" al eliminar la OT: "+ vm.insurance.internal_number
                    }
                    dataFactory.post('send-log/', params).then(function success(response) {    });

                });
              }
              SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETEPOLICY, "success");

              var params = {
                'model': 1,
                'event': "POST",
                'change':$scope.textLog,
                'associated_id': vm.insurance.id,
                'identifier': "elimino la póliza "+vm.insurance.poliza_number ? vm.insurance.poliza_number : vm.insurance.internal_number
              }
              // dataFactory.post('send-log/', params).then(function success(response) {    });

              dataFactory.post('send_log_specific/', params).then(function success(response) {    });

              vm.insurance.recibos_poliza.forEach(function(receipt) {
                if (receipt.id) {
                  var params = {
                    'model': 4,
                    'event': "PATCH",
                    'associated_id':receipt.id,
                    'identifier': ' actualizo recibo a desactivado por eliminación de póliza',
                  }
                  dataFactory.post('send-log/', params).then(function success(response) {
                    
                  });
                  console.log('receiptttttt',receipt)
                  if (receipt && typeof receipt.url === 'string') {
                    // Si el objeto ya trae .url como string, úsala directamente
                    $http.patch(receipt.url, { status: 0 });
                  } else if (typeof receipt === 'string') {
                    // Si a veces recibes directamente la URL como string
                    $http.patch(receipt, { status: 0 });
                  } else {
                    console.error('No se encontró una URL válida en receipt:', receipt);
                  }
                }
              })

              var name = 'Inicio';
              var route = 'inicio.inicio';
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
              $state.go($scope.route_for_new_tab);
            }
          }

          function deletePolicyFailed(response, status, headers, config) {
              return response;
          }
        } else {
          SweetAlert.swal("Cancelado", "La póliza no se ha eliminado", "error");
        }
      });
    }

    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function assignPolicy(id){
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
              permiso_administrar_adjuntos: function() {
                  return $scope.permiso_administrar_adjuntos;
              }
          },
          backdrop: 'static', /* this prevent user interaction with the background */
          keyboard: false
      });
    }


    function assignModalView($scope, $uibModalInstance, policy_id, url, contratante,permiso_administrar_adjuntos,dataFactory){
      $scope.email = contratante.email;
      $scope.soloEmail=true;
      $scope.permiso_administrar_adjuntos=permiso_administrar_adjuntos;
      $scope.tipopoliza='Póliza individual'
      $scope.emailscontractor=contratante.email_contractor
      $scope.contratanteInfo=contratante;
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
      $scope.maxShareMb = 25;
      dataFactory.get('emailtemplate-unpag/',{'template_model':2,'id_policy':policy_id})
      .then(function success(response) {
        $scope.plantillas = response.data;
      })
      $http.post(url.IP + 'get-assign/', {'poliza': policy_id}).then(function success (response) {
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
      $scope.parseMb = function(sizeStr) {
        if (!sizeStr) return 0;
        // Sacamos número y unidad
        var parts = sizeStr.match(/^([\d.]+)\s*(MB|KB)$/i);
        if (!parts) return 0;

        var value = parseFloat(parts[1]) || 0;
        var unit  = parts[2].toUpperCase();

        // Si es KB, lo convertimos a MB; si es MB, lo dejamos
        return unit === 'KB'
          ? value / 1024
          : value;
        // return parseFloat(sizeStr) || 0;
      };
      $http.get(url.IP+'share-policy-manual/'+ vm.insurance.id)
        .then(function(response) {
          if(response.status === 200){
            vmm.head = response.data.head;
            vmm.body = response.data.body;
            vmm.footer = response.data.footer;
          }
        }
        )
        .catch(function(e) {
          console.log('error - catch', e);
        });
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
      $scope.showEmailInInput = function(email){
        $scope.email_assign = email;
        // $scope.email_assign = contratante.email;
      };

      $scope.emails = [];

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

      $scope.sendEmail = function(receipt) {
        $scope.send= false;
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        var data_shared = {'id': vm.insurance.id, 'emails': $scope.emails, 'files':share_via_email, 'files_r':share_via_email_r,'subject':vmm.subjectEmail,'first_comment':vmm.first_comment, 'second_comment':vmm.second_comment, 'model': 1, 'custom_email':vmm.custom_email}
        $http.post(url.IP+'share-policy-manual/', data_shared)
        .then(
          function success(request) {
            if(request.status === 200 || request.status === 201) {
              SweetAlert.swal("¡Listo!", MESSAGES.OK.POLICYSEND, "success");
              $scope.send= true;
              var params = {
                'model': 1,
                'event': "POST",
                'associated_id': vm.insurance.id,
                'identifier': "compartió la póliza por email.",
                'save_logmail': 1
              }
              dataFactory.post('send-log/', params).then(function success(response) {

              });
              $uibModalInstance.dismiss('cancel');
            } else {
              $scope.send= true;
              l.stop();
              if (request.data && request.data.status) {
                SweetAlert.swal("ERROR", request.data.status, "error");
              } else if (request.data && request.data.response) {
                // SweetAlert.swal("ERROR", request.data.response, "error");
                SweetAlert.swal("Error", "No se envió el recordatorio. Contacte a su administrador.", "error");
              }else{
                SweetAlert.swal("ERROR", JSON.stringify(request.data), "error");
              }
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

      $scope.getTemplate = function(custom_email) {
        if (custom_email){
          $http.get(url.IP+'share-policy-manual/'+ vm.insurance.id)
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
      if (vm.permiso_administrar_adjuntos) {
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
            if (file.shared) {                
              $scope.fileshared=true
            }else{                
              $scope.fileshared=false        
            }
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
        if (email) {            
          if (validateEmail(email) == false ){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
            return;
          }
          var assign ={
            is_owner: vmm.is_owner,
            active:true,
            poliza:policy_id,
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
                  'associated_id': vm.insurance.id,
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
                  'associated_id': vm.insurance.id,
                  'identifier': "compartió la póliza por app."
                }
                dataFactory.post('send-log/', params).then(function success(response) {

                });
              }
            }
          })

          $uibModalInstance.dismiss('cancel');
        }else{
          if($scope.fileshared && $scope.fileshared==true){
            SweetAlert.swal("¡Listo!", MESSAGES.OK.FILESHARED, "success");
          }
          l.stop();
          $uibModalInstance.dismiss('cancel');
        }
      };

      $scope.cancel = function () {
      if($uibModalInstance)
          $uibModalInstance.dismiss('cancel');
      };
    }

    function goToReceipt(receipt,folio){
      if(folio){
        var vmmm=receipt;
        var modalInstance = $uibModal.open({ //jshint ignore:line
                templateUrl: 'app/polizas/polizas.receiptsModal.html',
                controller: receiptModalView,
                controllerAs: 'vmmm',
                ////windowClass: 'animated fadeIn',
                size: 'lg',
                // resolve:{'rn':receipt.recibo_numero,'recibo':receipt},
                resolve: {
                    receiptModal: function() {
                        return vmmm;
                    }
                },
              backdrop: 'static', /* this prevent user interaction with the background */
              keyboard: false
            });
        function receiptModalView($scope,$uibModalInstance,receiptModal){
          return vmmm;
        }
      }
      else{
         var vm = this;



      receiptService.setReceiptID(receipt.id);
        $state.go('polizas.recibos',
        { polizaId: vm.polizaId,
          receiptId: receipt.recibo_numero
        });
      }
    }

    function b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
      var byteArrays = [];

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);

          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }

          var byteArray = new Uint8Array(byteNumbers);

          byteArrays.push(byteArray);
      }

      var blob = new Blob(byteArrays, {type: contentType});
      return blob;
    }

    function getPDF(poliza) {
      var carga = Ladda.create( document.querySelector( '.ladda-button' ) );
      carga.start();
      $http({
        method: 'GET',
        url: url.IP + 'get-pdf-ot/',
        responseType: 'arraybuffer',
        params: {
          'id': poliza
        }
      }).then(function success(response) {

        if(response.status === 200 || response.status === 201){
          toaster.info("Se generó el PDF");
          $scope.pdf = response.data;


          var file = new Blob([response.data], {type: 'application/pdf'});
         
          var fileURL = URL.createObjectURL(file);
          $scope.content = $sce.trustAsResourceUrl(fileURL);
          window.open($scope.content);
          carga.stop();
          var params = {
            'model': 1,
            'event': "POST",
            'associated_id': poliza,
            'identifier': 'generó el PDF.'
          }
          dataFactory.post('send-log/', params).then(function success(response) {

          });
          // $http({
          //   method: 'GET',
          //   url: url.IP + 'get-pdf',
          //   params: {
          //     'pdf_name': $scope.pdf.pdf_name
          //   },
          //   responseType: 'arraybuffer'

          // }).then(function success(response) {

          //   })
        }
        else{
          toaster.warning("Ocurrió Un problema,Intenta nuevamente");
        }


      })
    }


    function viewCarta(poliza, carta) {
      $http({
        method: 'GET',
        url: url.IP + 'get-pdf-form/',
        params: {
          'id_poliza': poliza,
          'id_carta': carta.id
        }
      }).then(function success(response) {
        if(response.status === 200 || response.status === 201){
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
            'model': 1,
            'event': "POST",
            'associated_id': poliza,
            'identifier': 'generó la carta ' + carta.name + '.'
          }
          dataFactory.post('send-log/', params);
          toaster.info("Se generó el PDF");
          // $scope.pdf = response.data;
          // $http({
          //   method: 'GET',
          //   url: url.IP + 'get-pdf',
          //   params: {
          //     'pdf_name': $scope.pdf.pdf_name
          //   },
          //   responseType: 'arraybuffer'

          // }).then(function success(response) {

          //   })
        }
        else{
          toaster.warning("Ocurrió Un problema,Intenta nuevamente");
        }
      })
    }

    function goToEndoso(endoso){
       // var vm = this;

        $state.go('polizas.info',
        { polizaId: endoso.policy.id,
        });
    }


  }

  //------modal test
  function PolicyPendingModalCtrl($localStorage, $scope, toaster, MESSAGES, policyModal, $uibModalInstance, dataFactory, SweetAlert, $state, insuranceService, receiptService, url, $http, $rootScope,emailService,helpers) {
    var vmm = this;
    vmm.selectedType = '';
    vmm.save = save;
    vmm.status = [];
    vmm.prima_total = 0;
    vmm.iva = 16;
    vmm.sub_total = 0;
    vmm.folio = false;
    vmm.statusIva = true;
    var sumaEndosoRecibo = 0.0;
    vmm.form = {
        folio: '',
        canCreate:false
    };

    vmm.conductos = {
      'No domiciliada': 1,
      'Agente': 2,
      'CAC': 3,
      'CAT/Domiciliado': 4,
      'Nómina': 5,
      'CUT': 6,
    }

    
    vmm.insuranceServices = insuranceServices;
    // vmm.changeNoPoliza = changeNoPoliza;
    vmm.options = {
        save: save,
        cancel: cancel
    };
    vmm.policyInfo = policyModal;
    var myInsurance = vmm.policyInfo;
    var contratante =insuranceServices(url,$http,$rootScope,vmm.policyInfo,insuranceService,receiptService);
    var ramo = vmm.policyInfo.ramo;
    vmm.form.ramo={};
    vmm.form.clave = vmm.policyInfo.clave;
    vmm.form.business_line = vmm.policyInfo.business_line;

    if(ramo == "Daños"){
      vmm.form.ramo.ramo_code = 3;
      vmm.form.ramo.ramo_name = "Daños";
    }else if (ramo == "Accidentes y Enfermedades") {
      vmm.form.ramo.ramo_code = 2;
      vmm.form.ramo.ramo_name = "Accidentes y Enfermedades";
    }else{
      vmm.form.ramo.ramo_code = 1;
      vmm.form.ramo.ramo_name = "Vida";
    }
    var payment = vmm.policyInfo.forma_de_pago;
    vmm.form.payment = payment.toString();
    vmm.policyInfo.poliza = vmm.form.poliza;
    // $scope.historicPolicy = function (noPoliza){
    try{
      $http({
        method: 'GET',
        url: url.IP + 'historic-policies/',
        params: {
          actual_id: vmm.policyInfo.id
        }
      }).then(function success(response) {
        if(response.data.results.length){
          vmm.showHistoric = true;
        }
        vmm.policy_history = [];
        response.data.results.forEach(function function_name(old) {
          if(vmm.policyInfo.id != old.base_policy.id){
            vmm.policy_history.push(old.base_policy);
          } else if(old.new_policy) {
            vmm.policy_history.push(old.new_policy);
          }
        })
      })
    }catch(e){
      console.log('History policy (update)_',e)
    }

    vmm.defaults = {};
    $http.get(url.IP+'claves-by-provider/'+vmm.policyInfo.aseguradora.id)
      .then(function(clavesResponse){
        clavesResponse.data.forEach(function(clave) {
          clave.clave_comision.forEach(function(item) {
            item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
            if(vmm.form.subramo){
              if(item.subramo == vmm.form.subramo.subramo_name){
                vmm.form.comision_percent = parseFloat(item.comission);
                vmm.form.udi = parseFloat(item.udi);
              }
            }else{
              vmm.form.comision_percent = 0
              vmm.form.udi = 0
            }
          });
        });

        vmm.defaults.claves=clavesResponse.data;
        if(vmm.defaults.claves.length== 1){
            vmm.form.clave = vmm.defaults.claves[0];
        }

        $scope.comisiones_poliza = [];
        for(var i = 0; i < vmm.defaults.claves.length; i++){
          if(vmm.form.clave.name == vmm.defaults.claves[i].name){
            $scope.clave_poliza = vmm.defaults.claves[i];
          }
        }

        for(var i = 0; i < $scope.clave_poliza.clave_comision.length; i++){
          if(vmm.form.subramo.subramo_name == $scope.clave_poliza.clave_comision[i].subramo){
            $scope.comisiones_poliza.push($scope.clave_poliza.clave_comision[i]);
          }
        }

        vmm.form.comisiones = $scope.comisiones_poliza;
      });

    $scope.dataToSave = {};
    $scope.changeNoPoliza = function (noPoliza){
      if (vmm.policy_history.length) {
        var noP = "renovaciones_poliza";
      }else{
        var noP = noPoliza;
      }
      helpers.existPolicy(noP)
      .then(function(request) {
        if(request == true) {
          SweetAlert.swal("Error",MESSAGES.ERROR.POLICYEXIST, "error");
          vmm.form.poliza = ''
        }
      })
      .catch(function(err) {

      });
      // }
    }

    var startDate = convertDate(new Date(vmm.policyInfo.start_of_validity));
    var endingDate = convertDate(new Date(vmm.policyInfo.end_of_validity));
    $scope.dataToSave.start_of_validity = new Date(mesDiaAnio(startDate));
    $scope.dataToSave.end_of_validity = new Date(mesDiaAnio(endingDate));
    vmm.form.startDate = convertDate($scope.dataToSave.start_of_validity);
    vmm.form.endingDate = convertDate($scope.dataToSave.end_of_validity);

    var date1_ = new Date(vmm.policyInfo.start_of_validity);
    var date2_ = new Date(vmm.policyInfo.end_of_validity);

    var timeDiff_ = Math.abs(date2_.getTime() - date1_.getTime());
    vmm.form.policy_days_duration = Math.ceil(timeDiff_ / (1000 * 3600 * 24));

    vmm.form.subramo = {
      'subramo_name': vmm.policyInfo.subramo
    }
        // ---------
    function getFormData(form) {
      var insurance = vmm.poliza;
      vmm.insuranceObject = vmm.poliza;
      form.poliza_number = form.poliza_number == "" ? 0 : form.poliza_number;
      form.url = insurance.url;
      form.id = insurance.id;
      form.clave = insurance.clave;
      form.owner = insurance.owner;
      form.created_at = insurance.created_at;
      form.internal_number = insurance.internal_number;
      form.old_policies = [];
      form.observations = insurance.observations;
      form.receipts = [];
      form.old_receipts = [];
      form.coverages = insurance.coverageInPolicy_policy;
      form.paquete = insurance.paquete_info ? insurance.paquete_info : insurance.paquete;
      form.old_coverages = [];
      form.old_form = vmm.insuranceObject.accidents_policy.length > 0 ? vmm.insuranceObject.accidents_policy[0].url :
        vmm.insuranceObject.automobiles_policy.length > 0 ? vmm.insuranceObject.automobiles_policy[0].url :
          vmm.insuranceObject.damages_policy.length > 0 ? vmm.insuranceObject.damages_policy[0].url :
            vmm.insuranceObject.life_policy.length > 0 ? vmm.insuranceObject.life_policy[0].url : undefined

      return form;
    }
        // -----------
    function save() {
      if (!vmm.form.canCreate){
        SweetAlert.swal("Error", 'OPRIMA EL BOTON CALCULAR Y GENERAR RECIBOS', "error");
        return 
      }
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      vmm.recibos_data = angular.copy($scope.dataToSave.recibos_poliza);
      vmm.policyInfo.recibos_poliza = vmm.recibos_data;
      vmm.policyInfo.p_neta =  $scope.dataToSave.p_neta;
      vmm.policyInfo.descuento =  $scope.dataToSave.descuento;
      vmm.policyInfo.rpf =  $scope.dataToSave.rpf;
      vmm.policyInfo.derecho =  $scope.dataToSave.derecho;
      vmm.policyInfo.sub_total =  $scope.dataToSave.sub_total;
      vmm.policyInfo.iva =  $scope.dataToSave.iva;
      vmm.policyInfo.p_total = $scope.dataToSave.p_total;
      vmm.policyInfo.prima = $scope.dataToSave.poliza.primaNeta;
      vmm.policyInfo.poliza_number = vmm.form.poliza;
      vmm.policyInfo.folio = vmm.form.folio;
      vmm.policyInfo.comision = $scope.dataToSave.comision;
      vmm.policyInfo.comision_percent = $scope.dataToSave.comision_percent;
      vmm.policyInfo.comision_derecho_percent = parseFloat($scope.dataToSave.poliza.comision_derecho_percent).toFixed(2);
      vmm.policyInfo.comision_rpf_percent = parseFloat($scope.dataToSave.poliza.comision_rpf_percent).toFixed(2);
      vmm.policyInfo.recibos_poliza.forEach(function(recibo){
        recibo['conducto_de_pago'] = vmm.conductos[vmm.policyInfo.conducto_de_pago];
      });
      if($scope.dataToSave && $scope.dataToSave.prima_comision && parseFloat(vmm.policyInfo.comision_percent) !=parseFloat($scope.dataToSave.prima_comision)){
        vmm.policyInfo.comision_percent = $scope.dataToSave.prima_comision ? $scope.dataToSave.prima_comision : $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0;
      }

      var policy = angular.copy(vmm.policyInfo);
      vmm.poliza = vmm.policyInfo;

      //objeto form updated
      vmm.form.business_line = vmm.poliza.business_line;

      vmm.form.contratante = $rootScope.contratante;
      vmm.form.clave = vmm.poliza.clave;
      vmm.form.comision = vmm.poliza.comision;
      vmm.form.comision_percent = vmm.poliza.comision_percent;
      vmm.form.comision_derecho_percent = vmm.poliza.comision_derecho_percent;
      vmm.form.comision_rpf_percent = vmm.poliza.comision_rpf_percent;
      vmm.form.recibos_poliza =vmm.recibos_data;
      vmm.form.receipts =  vmm.poliza.recibos_poliza;
      // vmm.form.coverages = vmm.poliza.coverageInPolicy_policy;
      vmm.form.coverages =[]
      // if(vmm.form.coverages.length){
      //   vmm.form.paquete = vmm.poliza.coverageInPolicy_policy[0].package;
      //   vmm.form.paquete = {};
      //   vmm.form.paquete.url = vmm.poliza.coverageInPolicy_policy[0].package;
      // }else{
      // // vmm.form.paquete = vmm.poliza.coverageInPolicy_policy[0].package;
      // }
      vmm.form.id = vmm.poliza.id;

      var startDate = new Date( vmm.poliza.start_of_validity).setHours(12,0,0,0);
      var endingDate = new Date( vmm.poliza.end_of_validity).setHours(11,59,59,0);
      vmm.form.startDate = new Date(startDate);
      vmm.form.endingDate = new Date(endingDate);

      vmm.form.start_of_validity = vmm.poliza.start_of_validity;
      vmm.form.end_of_validity = vmm.poliza.end_of_validity;
      vmm.form.f_currency = vmm.poliza.f_currency;
      vmm.form.p_neta = vmm.poliza.p_neta;
      vmm.form.descuento = vmm.poliza.descuento;
      vmm.form.rpf = vmm.poliza.rpf;
      vmm.form.sub_total = vmm.poliza.sub_total;
      vmm.form.p_total = vmm.poliza.p_total;
      vmm.form.subramo = vmm.poliza.subramo;
      vmm.form.url = vmm.poliza.url;
      vmm.form.aseguradora = vmm.poliza.aseguradora;
      vmm.form.poliza_number = vmm.poliza.poliza_number;
      vmm.form.receipts = vmm.poliza.recibos_poliza;
      vmm.form.recibos_poliza = vmm.poliza.recibos_poliza;
      if(vmm.poliza.automobiles_policy){
        vmm.form.automobiles_policy = vmm.poliza.automobiles_policy;

      }else if(vmm.form.accidents_policy){
        vmm.form.accidents_policy = vmm.poliza.accidents_policy;
      }else if(vmm.poliza.damages_policy){
        vmm.form.damages_policy = vmm.poliza.damages_policy;
      }
      if(vmm.form.contratante.value) {
        vmm.form.contratante = vmm.form.contratante.value;
      }
      else if(vmm.form.contratante.id) {
      }
      // if(vmm.form.contratante.address_juridical){
      //   vmm.form.address = vmm.form.contratante.address_juridical;
      // }else{
      //   vmm.form.address = vmm.form.contratante.address_natural;
      // }
      if(vmm.form.contratante.address_contractor){
        vmm.form.address = vmm.form.contratante.address_contractor;
      }
      var observacion = vmm.form.observations;
      var form = vmm.form;
      var fromDate = vmm.form.startDate;
      var today = new Date(new Date().toISOString().split('T')[0]);

      // myInsurance.
      form = getFormData(form);

      form.observations=observacion;
      form.f_currency = vmm.f_currency;

      form.p_neta = (parseFloat(vmm.poliza.primaNeta ? vmm.poliza.primaNeta : vmm.poliza.p_neta)).toFixed(2);
      form.p_total = vmm.poliza.primaTotal ? vmm.poliza.primaTotal : vmm.poliza.p_total;
      form.derecho = vmm.poliza.derecho;
      form.rpf = vmm.poliza.rpf;
      form.iva = vmm.poliza.iva;
      form.descuento = vmm.poliza.descuento;
      form.sub_total = vmm.poliza.sub_total;
      form.receipts = vmm.poliza.recibos_poliza;
      form.clave = vmm.form.clave;

      form.collection_executive = vmm.poliza.collection_executive ? vmm.poliza.collection_executive.url : ''; 

      // if(vmm.form.ceder_comision){
      //   form.comision_percent = vmm.form.comision_percent;
      //   form.udi = vmm.polia.udi;
      //   if(vmm.form.comision_percent) {
      //     form.comision_percent = vmm.form.comision_percent;
      //   } else {
      //     form.comision_percent = vmm.form.clave.comission;
      //   }
      // }
      // else{
      //   if(vmm.form.comision_percent) {
      //     form.comision_percent = vmm.form.comision_percent;
      //   } else {
      //     form.comision_percent = vmm.form.clave.comission;
      //   }
      //   form.udi = (vmm.form.clave.udi);
      // }
      // if(vmm.form.comision_percent) {
      //   var percent_ = parseFloat(vmm.form.comision_percent) / 100;
      //   vmm.form.comision = (vmm.form.p_neta * percent_).toFixed(2);
      // } else {
      //   var percent_ = parseFloat(vmm.form.comision.comission) / 100;
      //   vmm.form.comission = (vmm.form.p_neta * percent_).toFixed(2);
      // }

      if(form.receipts) {
        form.receipts.forEach(function(item) {
          var init = new Date(mesDiaAnio(item.fecha_inicio)).setHours(12,0,0,0);
          var end = new Date(mesDiaAnio(item.fecha_fin)).setHours(11,59,59,0);
          // var vencimiento = new Date(mesDiaAnio(item.vencimiento)).setHours(11,59,59,0);

          // item.startDate = new Date(init);
          // item.endingDate = new Date(end);
          item.fecha_inicio = new Date(init);
          item.fecha_fin = new Date(end);
          // item.vencimiento = new Date(vencimiento);

          if(item.vencimiento) {
            var vencimiento = new Date(toDate(item.vencimiento)).setHours(11.59,59,0);
            item.vencimiento = new Date(vencimiento);
          }

        });
      }

      var delete_receipts = [];
      var patch_receipts  = [];
      var save_receipts   = [];

      form.receipts.forEach(function(item_new) {
        if(item_new.url) {
          patch_receipts.push(item_new);
        } else {
          save_receipts.push(item_new);
        }

      });

      var startDate =new Date()
      startDate = form.startDate.getTime();
      var auxDate = new Date(form.startDate.getTime() - 86400000);
      if(auxDate < new Date() && new Date() < form.endingDate) {
        form.status = 14
      } else if(auxDate > new Date()) {
        form.status = 10
      } else if(new Date() > form.endingDate){
        form.status = 13
      }
      var startDate = new Date(mesDiaAnio( vmm.form.start_of_validity)).setHours(12,0,0,0);
      var endingDate = new Date(mesDiaAnio (vmm.form.end_of_validity)).setHours(11,59,59,0);

      var container = [];

      form.receipts_changes = {
        delete_receipts : delete_receipts,
        patch_receipts  : patch_receipts,
        save_receipts   : save_receipts
      }

      // aqui --------------------
      form.state_circulation = policyModal.state_circulation ? policyModal.state_circulation: '';
      form.business_line =vmm.form.business_line ? vmm.form.business_line: 0;
      form.celula =policyModal.celula ? policyModal.celula: null;
      form.groupinglevel =policyModal.groupinglevel ? policyModal.groupinglevel: null;
      form.sucursal = vmm.poliza.sucursal ? vmm.poliza.sucursal.url : ''
      form.coverages = [] 
      insuranceService.updateFullInsurance(form)
        .then(function(updateResponse) {
          insuranceService.updateOldPolicy(updateResponse);
          // TODO borrar de container maybe?
          if ($uibModalInstance) {
            //Send Email
            // $http.get(vmm.form.contratante.url)
            //   .then(function(response) {
            //     if(response.data.email){
            //       if($localStorage.email_config){
            //         if($localStorage.email_config.registro_pol == true){
            //           var model = 2;
            //           emailService.sendEmailAtm(model,updateResponse.id)
            //         }else{ }
            //       }else{}
            //   }
            // });
            // Send Email
            if (vmm.policy_history) {
              vmm.policy_history.forEach(function(elem){
                if(elem.status == 13){
                  var data = {
                    status: 12,
                    renewed_status: 1
                  }
                } else{
                  var data = {
                    renewed_status: 1
                  }
                }
                /* Actualiza la póliza antigua */
                $http.patch(elem.url, data)
                .then(function(res_pacth_ren) {
                });
              })
            }

            var index = container.indexOf(myInsurance);
            container.splice(index, 1);
            myInsurance = updateResponse;
            toaster.success("Póliza actualizada");
            $uibModalInstance.close(20000);
            $state.go('polizas.info', { polizaId: myInsurance.id });
          } else {
            toaster.success("Póliza actualizada")
            $state.go('polizas.info', { polizaId: myInsurance.id });
          }

          SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWPOLICY, "success");

          var params = {
            'model': 1,
            'event': "POST",
            'associated_id': myInsurance.id,
            'identifier': "convirtió la OT en póliza."
          }
          dataFactory.post('send-log/', params).then(function success(response) {

          });

        });
            //fin form
    }

    function cancel() {
        $uibModalInstance.dismiss('cancel');
    }
  }

//---contractor
  function insuranceServices(url,$http,$rootScope,policy,insuranceService,receiptService,$scope){
    var vmm = this;

    var array=[];
    var array1=[];
    var id_p="";

    // if(policy.natural){
    //   id_p=policy.natural;
    // }
    // else{
    //   id_p= policy.juridical;
    // }
    id_p= policy.contractor;
    var output = insuranceService.getInsuranceRead(policy)
    .then(function(data){
     // alert(JSON.stringify(data
      var hoy = new Date();

      // if(data.juridical)
      //   var url_aux = url.IP + 'morales-resume-medium/'+ data.juridical+'/';
      // else
        // var url_aux = url.IP + 'fisicas-resume-medium/'+ data.natural+'/';
      var url_aux = url.IP + 'contractors-resume-medium/'+ data.contractor+'/';
      $http({
        method: 'GET',
        url: url_aux
      }).then(
      function success(response) {
        $rootScope.contratante = response.data;
        
        if($rootScope.contratante.phone_number) {
          $rootScope.phone_number = $rootScope.contratante.phone_number.replace( /^\D+/g, '').replace( "'}", '');
          $rootScope.contratante.phone_number = $rootScope.phone_number;
          $rootScope.email = $rootScope.contratante.email;

        }
        // if(data.juridical){
        //   $rootScope.addressContratante = response.data.address_juridical[0];
        // }
        // else{
        //   $rootScope.addressContratante = response.data.address_natural[0];
        // }
        $rootScope.addressContratante = response.data.address_contractor[0];


      }, function error(response) {
        console.log('error', response);
      });
    });
  }
  // Edición de recibos
  function EditReceiptModalCtrl(url,$http,$rootScope,recibo,index,$scope,$uibModalInstance, poliza, dataFactory, SweetAlert,receipts,datesFactory, acceso_pl_cob){
    var rec = this; 
    rec.poliza = poliza;
    rec.recibo = recibo;
    var fecha_inicio = recibo.fecha_inicio;
    var fecha_fin = recibo.fecha_fin;
    var fecha_venc = recibo.vencimiento;
    rec.recibo.fecha_inicio = recibo.fecha_inicio;
    rec.recibo.fecha_fin = recibo.fecha_fin;
    rec.recibo.prima_neta = recibo.prima_neta;
    rec.recibo.derecho = recibo.derecho;
    rec.recibo.iva = recibo.iva;
    rec.recibo.rpf = recibo.rpf;
    rec.recibo.init = datesFactory.convertDate(recibo.fecha_inicio);
    rec.recibo.fecha_inicio = datesFactory.convertDate(recibo.fecha_inicio);
    rec.recibo.end = datesFactory.convertDate(recibo.fecha_fin);
    rec.recibo.fecha_fin = datesFactory.convertDate(recibo.fecha_fin);
    rec.recibo.venc = datesFactory.convertDate(recibo.vencimiento);
    rec.recibo.vencimiento = datesFactory.convertDate(recibo.vencimiento);
    rec.recibo.subtotal__ = 0;

    $scope.validateDecimal = function(form,data){
      form = String(form).replace(/[A-Za-z]/g, '');
      form = String(form).replace(/,/g, '');
    };

    $scope.changePrimas = function(data){
      var subtotal_ = parseFloat(data.prima_neta) + parseFloat(data.rpf) + parseFloat(data.derecho);
      if (poliza.subramo =='Vida' || poliza.ramo =='Vida') {
        var iva_ = 0;
      }else{
        var iva_ = subtotal_ * 0.16;
      }
      var ivaQuantity = iva_.toFixed(2);
      var prima_total_ = parseFloat(subtotal_ + parseFloat(iva_));

      data.sub_total = (subtotal_).toFixed(2);
      data.prima_total = (prima_total_).toFixed(2);
      data.iva = ivaQuantity;
    };

    $scope.validateDates = function(date){
      rec.recibo.fecha_inicio = date;
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
      date3 = datesFactory.toDate((convertDate(poliza.end_of_validity)));
      dateDiff1 = moment(date1).diff(moment(date2), 'days');
      dateDiff2 = moment(date1).diff(moment(date3), 'days');

      // if(dateDiff1 < 0){
      //   SweetAlert.swal("Error", "La fecha de vencimiento no puede ser menor que la inicial", "error");
      //   return;
      // }
      //Validando a no mayor a 30 dias de fin de vigencia de poliza
      if(dateDiff2 > 30){
        SweetAlert.swal("Error", "La fecha de vencimiento no puede ser mayor a 30 días a la fecha de la vigencia de la poliza", "error");
        return;
      }
    }
    $scope.saveEdicionRecibo = function(data_receipt){
      if(rec.recibo.vencimiento == undefined){
        SweetAlert.swal("Error", "La fecha de vencimiento no puede estar vacia", "error");
        return;
      }
      //Validando no menor a fecha inicio
      date1 = datesFactory.toDate((rec.recibo.vencimiento));
      date2 = datesFactory.toDate((rec.recibo.fecha_inicio));
      date3 = datesFactory.toDate((convertDate(poliza.end_of_validity)));
      dateDiff1 = moment(date1).diff(moment(date2), 'days');
      dateDiff2 = moment(date1).diff(moment(date3), 'days');

      // if(dateDiff1 < 0){
      //   SweetAlert.swal("Error", "La fecha de vencimiento no puede ser menor que la inicial", "error");
      //   return;
      // }
      //Validando a no mayor a 30 dias de fin de vigencia de poliza
      if(dateDiff2 > 30){
        SweetAlert.swal("Error", "La fecha de vencimiento no puede ser mayor a 30 días a la fecha de la vigencia de la poliza", "error");
        return;
      }

      if(process(rec.recibo.fecha_inicio) < process(convertDate(poliza.start_of_validity))){
        SweetAlert.swal('Error', 'La fecha de inicio del recibo no puede ser menor a la fecha de inicio de la póliza.', 'error');
        return;
      }

      if(process(rec.recibo.fecha_fin) < process(rec.recibo.fecha_inicio)){
        SweetAlert.swal('Error', 'La fecha fin del recibo no puede ser menor a la de su inicio.', 'error');
        return;
      }

      function process(date){
        var parts = date.split("/");
        var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
        return date.getTime();
      }

      var data = {
        fecha_inicio : toDate(data_receipt.fecha_inicio),
        fecha_fin : toDate(data_receipt.fecha_fin),
        vencimiento : toDate(data_receipt.vencimiento),
        prima_neta : parseFloat(data_receipt.prima_neta).toFixed(2),
        derecho : parseFloat(data_receipt.derecho).toFixed(2),
        rpf : parseFloat(data_receipt.rpf).toFixed(2),
        iva : parseFloat(data_receipt.iva).toFixed(2),
        comision : parseFloat(data_receipt.comision).toFixed(2),
        sub_total : parseFloat(data_receipt.sub_total).toFixed(2),
        prima_total : parseFloat(data_receipt.prima_total).toFixed(2),
      }
      $http
      .patch(data_receipt.url, data)
      .then(function success(req) {
          SweetAlert.swal("Actualizado", "El recibo "+ data_receipt.recibo_numero+ " ha sido actualizado.", "success");
          $scope.cancel(true);
          $uibModalInstance.dismiss('cancel');

      },
        function error(error) {
          console.log(error);
        })
      .catch(function(e){
        console.log(e);
      });
      var texto_log = ''
      if (data_receipt.status ==1 && acceso_pl_cob ==false) {
        var texto_log = "EDICION DE RECIBO PAGADO \n"
      }
      if (data_receipt.status ==5 && acceso_pl_cob ==false) {
        var texto_log = "EDICION DE RECIBO LIQUIDADO \n"
      }
      var params = {
      'model': 4,
      'event': "PATCH",
      'associated_id': data_receipt.id,
      'identifier': "actualizó el recibo "+ data_receipt.recibo_numero + " de la póliza "+ poliza.poliza_number+' '+ texto_log
      }
      dataFactory.post('send-log/', params).then(function success(response) {
      });
      try{
        var params_ = {
        'model': 1,
        'event': "PATCH",
        'associated_id': poliza.id,
        'identifier': "actualizó el recibo "+ data_receipt.recibo_numero + " de la póliza "+ poliza.poliza_number+' '+texto_log
        }
        dataFactory.post('send-log/', params_).then(function success(response) {
        });
      }catch(e){}
    }
    $scope.cancel = function(v){
      if(!v){
        rec.recibo.fecha_inicio = fecha_inicio;
        rec.recibo.fecha_fin = fecha_fin;
        rec.recibo.vencimiento = fecha_venc;
      }
      $uibModalInstance.dismiss('cancel');
    }
    function convertDate(inputFormat,indicator) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      // var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      // return date;
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

    function toDate(dateStr) {
      var dateString = dateStr; // Oct 23
      var dateParts = dateString.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

      return dateObject;
    }

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
      $scope.checkTotalComision2($scope.comision_vendedor);
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
      $scope.comision_vendedor=0;
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
              dataFactory.post('send-log/', params).then(function success(response) {  
              });
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
  function AddReceiptModalCtrl(tipo, serie,contractor, url,$http,$rootScope,$scope,$uibModalInstance, poliza, dataFactory, SweetAlert,datesFactory,$localStorage,emailService){
    var rec = this;
    rec.tipo = tipo;
    rec.recibo_numero = serie;
    rec.fecha_inicio = convertDate(new Date());
    rec.fecha_fin = convertDate(new Date());
    rec.prima_neta = 0.0
    rec.rpf = 0.0
    rec.derecho = 0.0
    rec.sub_total = 0.0
    rec.iva = 0.0
    rec.comision = 0.0 
    rec.prima_total = 0.0
    rec.vencimiento = convertDate(new Date());
    $scope.contratante = contractor;
    $scope.change_date = function (date) {
      rec.fecha_fin = date;
      rec.vencimiento = date;
    }

    $scope.validateDecimal = function(form,data){
      form = String(form).replace(/[A-Za-z]/g, '');
      form = String(form).replace(/,/g, '');
    };

    $scope.changePrimas = function(data){
      var subtotal_ = parseFloat(data.prima_neta) + parseFloat(data.rpf) + parseFloat(data.derecho);
      var iva_ = subtotal_ * 0.16;
      var prima_total_ = parseFloat(subtotal_ + parseFloat(iva_));
      rec.iva =  iva_.toFixed(2);

      data.sub_total = (subtotal_).toFixed(2);
      data.prima_total = (prima_total_).toFixed(2);
      data.iva = iva_.toFixed(2);
    };

    $scope.validateDates = function(date){
      rec.fecha_inicio = date;
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
      date2 = datesFactory.toDate((rec.fecha_inicio));
      date3 = datesFactory.toDate((convertDate(poliza.end_of_validity)));
      dateDiff1 = moment(date1).diff(moment(date2), 'days');
      dateDiff2 = moment(date1).diff(moment(date3), 'days');

      // if(dateDiff1 < 0){
      //   SweetAlert.swal("Error", "La fecha de vencimiento no puede ser menor que la inicial", "error");
      //   return;
      // }
      //Validando a no mayor a 30 dias de fin de vigencia de poliza
      if(dateDiff2 > 30){
        SweetAlert.swal("Error", "La fecha de vencimiento no puede ser mayor a 30 días a la fecha de la vigencia de la poliza", "error");
        return;
      }
    }
    $scope.saveRecibo = function(data_receipt){
      //var date = rec.vencimiento;
      if(rec.vencimiento == undefined){
        SweetAlert.swal("Error", "La fecha de vencimiento no puede estar vacia", "error");
        return;
      }
      //Validando no menor a fecha inicio
      date1 = datesFactory.toDate((rec.vencimiento));
      date2 = datesFactory.toDate((rec.fecha_inicio));
      date3 = datesFactory.toDate((convertDate(poliza.end_of_validity)));
      dateDiff1 = moment(date1).diff(moment(date2), 'days');
      dateDiff2 = moment(date1).diff(moment(date3), 'days');

      if(data_receipt.tipo != 3){
        if (!data_receipt.serie_manual || data_receipt.serie_manual == ''){
          SweetAlert.swal("Error", "Debe ingresar un número de serie manual válido", "error");
          return;
        }
      }

      // if(dateDiff1 < 0){
      //   SweetAlert.swal("Error", "La fecha de vencimiento no puede ser menor que la inicial", "error");
      //   return;
      // }
      //Validando a no mayor a 30 dias de fin de vigencia de poliza
      if(dateDiff2 > 30){
        SweetAlert.swal("Error", "La fecha de vencimiento no puede ser mayor a 30 días a la fecha de la vigencia de la poliza", "error");
        return;
      }

      if(process(rec.fecha_inicio) < process(convertDate(poliza.start_of_validity))){
        SweetAlert.swal('Error', 'La fecha de inicio del recibo no puede ser menor a la fecha de inicio de la póliza.', 'error');
        return;
      }

      if(process(rec.fecha_fin) < process(rec.fecha_inicio)){
        SweetAlert.swal('Error', 'La fecha fin del recibo no puede ser menor a la de su inicio.', 'error');
        return;
      }

      function process(date){
        var parts = date.split("/");
        var date = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
        return date.getTime();
      }

      var folio = 'Sin folio';
      if(tipo == 3){
        folio = data_receipt.recibo_numero;
        var data = {
          fecha_inicio : toDate(data_receipt.fecha_inicio),
          fecha_fin : toDate(data_receipt.fecha_fin),
          vencimiento : toDate(data_receipt.vencimiento),
          prima_neta : parseFloat(data_receipt.prima_neta).toFixed(2) <0 ? parseFloat(data_receipt.prima_neta).toFixed(2)  : (parseFloat(data_receipt.prima_neta).toFixed(2))*-1,
          derecho : parseFloat(data_receipt.derecho).toFixed(2)<0 ? parseFloat(data_receipt.derecho).toFixed(2) : (parseFloat(data_receipt.derecho).toFixed(2))*-1,
          rpf : parseFloat(data_receipt.rpf).toFixed(2)<0 ? parseFloat(data_receipt.rpf).toFixed(2) : (parseFloat(data_receipt.rpf).toFixed(2))*-1,
          iva : parseFloat(data_receipt.iva).toFixed(2)<0 ? parseFloat(data_receipt.iva).toFixed(2) : (parseFloat(data_receipt.iva).toFixed(2))*-1,
          comision : parseFloat(data_receipt.comision).toFixed(2)<0 ? parseFloat(data_receipt.comision).toFixed(2) : (parseFloat(data_receipt.comision).toFixed(2))*-1,
          sub_total : parseFloat(data_receipt.sub_total).toFixed(2)<0 ? parseFloat(data_receipt.sub_total).toFixed(2) : (parseFloat(data_receipt.sub_total).toFixed(2))*-1,
          prima_total : parseFloat(data_receipt.prima_total).toFixed(2)<0 ? parseFloat(data_receipt.prima_total).toFixed(2) : (parseFloat(data_receipt.prima_total).toFixed(2))*-1,
          recibo_numero : data_receipt.recibo_numero ? data_receipt.recibo_numero : serie,
          serie_manual : data_receipt.serie_manual,
          poliza: poliza.url,
          status : 4,
          receipt_type:tipo,
          isCopy:false,
          isActive:true,
          folio: folio
        }
      }else{
        var data = {
          fecha_inicio : toDate(data_receipt.fecha_inicio),
          fecha_fin : toDate(data_receipt.fecha_fin),
          vencimiento : toDate(data_receipt.vencimiento),
          prima_neta : parseFloat(data_receipt.prima_neta).toFixed(2),
          derecho : parseFloat(data_receipt.derecho).toFixed(2),
          rpf : parseFloat(data_receipt.rpf).toFixed(2),
          iva : parseFloat(data_receipt.iva).toFixed(2),
          comision : parseFloat(data_receipt.comision).toFixed(2),
          sub_total : parseFloat(data_receipt.sub_total).toFixed(2),
          prima_total : parseFloat(data_receipt.prima_total).toFixed(2),
          recibo_numero : data_receipt.recibo_numero ? data_receipt.recibo_numero : serie,
          serie_manual : data_receipt.serie_manual,
          poliza: poliza.url,
          status : 4,
          receipt_type:tipo,
          isCopy:false,
          isActive:true,
          folio: folio
        }
      }
      $http
      .post(url.IP + 'recibos/', data)
      .then(function success(req) {
          SweetAlert.swal("Creado", "El recibo "+ data_receipt.recibo_numero+ " ha sido creado.", "success");
          var params = {
            'model': 4,
            'event': "POST",
            'associated_id': req['data'].id,
            'identifier': "creó el recibo "+ data_receipt.recibo_numero + " de la póliza "+ poliza.poliza_number
          }
          dataFactory.post('send-log/', params).then(function success(response) {
          });
          
          var params_ = {
            'model': 1,
            'event': "POST",
            'associated_id': req['data'].id,
            'identifier': "creó el recibo "+ data_receipt.recibo_numero + " de la póliza "+ poliza.poliza_number
          }
          
          dataFactory.post('send-log/', params_).then(function success(response) {
          });
          // if(req.data.receipt_type ==3){//crear nota
          //   if (contractor && contractor.email){
          //       //Send Email
          //       if($localStorage.email_config){
          //         if($localStorage.email_config.create_nota == true){
          //           $scope.idRecibo = req.data.id
          //           var model = 7;
          //           emailService.sendEmailAtm(model,$scope.idRecibo)
          //         }
          //       }
          //       //Send Email
          //   }
          // }
          $uibModalInstance.dismiss('cancel');

      },
        function error(error) {
          console.log(error);
        })
      .catch(function(e){
        console.log(e);
      });
    }
    $scope.cancel = function(v){
      $uibModalInstance.dismiss('cancel');
    }
    function convertDate(inputFormat,indicator) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      // var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      // return date;
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

    function toDate(dateStr) {
      var dateString = dateStr; // Oct 23
      var dateParts = dateString.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

      return dateObject;
    }

  }
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

  function mesDiaAnio (parDate) {
      var d = new Date(toDate(parDate));
      var date = (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
      return date;
  }

  //----------estatus test
})();