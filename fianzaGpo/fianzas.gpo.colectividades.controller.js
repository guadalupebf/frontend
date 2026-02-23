(function() {
  'use strict';

  angular.module('inspinia')
      .controller('FianzasColectividadesCtrl', FianzasColectividadesCtrl);

  FianzasColectividadesCtrl.$inject = ['$sessionStorage', '$scope', 'FileUploader', 'providerService', '$http', 'url', 
                                       '$state', 'SweetAlert', 'MESSAGES', '$uibModalInstance', '$timeout', '$rootScope',
                                       '$localStorage', '$stateParams', 'helpers', 'datesFactory'];

  function FianzasColectividadesCtrl($sessionStorage, $scope, FileUploader, providerService, $http, url, $state, 
                                     SweetAlert, MESSAGES, $uibModalInstance, $timeout, $rootScope, $localStorage,
                                     $stateParams, helpers, datesFactory) {

    /* Información de usuario */
    var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
      
    var order = this;
    var vm = this;
    order.org_name = usr.org;
    order.renewal = {};
    order.renewal.is_renewable = 2;
    order.renewal.options = [
        {'value':1,'label':'Renovable'},
        {'value':2,'label':'No Renovable'},
    ]
    $scope.surety = {};
    $scope.showPF = true;
    $scope.providers = [];
    $scope.claves = [];
    $scope.ramos = [];
    $scope.subramos = [];
    $scope.currencys = [
      {'value':1, 'label':'Pesos'},
      {'value':2, 'label':'Dólares'}
    ];
    $scope.month={};
    $scope.month.month_selected = 0;
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
    $scope.years=[]
    var actualYear = new Date().getFullYear();
    var oldYear = actualYear - 80;
    for (var i = actualYear + 10; i >= oldYear; i--) {
      $scope.years.push(i);
    }
    $scope.currencySelected = $scope.currencys[0].value;
    $rootScope.show_contractor = false;
    $scope.create_natural = true;
    $scope.create_juridical = true;
    $scope.referenciadores = [];
    $scope.referenciadorArray = [];
    $scope.referenciadoresSelected = [];
    $scope.categories = [
      {
        name: '',
        deductible: '',
        observations: '',
        document_type: 5
      }
    ];
    $scope.beneficiaries = [
      {
        type_person: 1,
        first_name: '',
        last_name: '',
        second_last_name: '',
        j_name: '',
        full_name: '',
        rfc: '',
        email: '',
        phone_number: '',
        poliza: null,
        usuario: null
      }
    ];
    $scope.directiveReceipts = [];
    $scope.dataToSave = [];

    $scope.dataSurety = [];
    $scope.dataCategories = [];

    $scope.show_certificates = false;
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

    order.accesos = $sessionStorage.permisos;
    if(order.accesos){
      order.accesos.forEach(function(perm){
        if(perm.model_name == 'Fianzas'){
          order.acceso_fianzas = perm
          order.acceso_fianzas.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar fianzas') {
              if (acc.checked == true) {
                order.acceso_adm_fia = true
              }else{
                order.acceso_adm_fia = false
              }
            }else if (acc.permission_name == 'Ver fianzas') {
              if (acc.checked == true) {
                order.acceso_ver_fia = true
              }else{
                order.acceso_ver_fia = false
              }
            }else if (acc.permission_name == 'Proyecto de fianza') {
              if (acc.checked == true) {
                order.acceso_proy_fia = true
              }else{
                order.acceso_proy_fia = false
                $scope.showPF = false;
              }
            }
          })
        }
        if (perm.model_name == 'Reportes') {
          order.acceso_reportes = perm;
          order.acceso_reportes.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Reporte fianzas') {
              if (acc.checked == true) {
                order.acceso_rep_fia = true
              }else{
                order.acceso_rep_fia = false
              }
            }else if (acc.permission_name == 'Reporte Siniestros') {
              if (acc.checked == true) {
                order.acceso_rep_sin = true
              }else{
                order.acceso_rep_sin = false
              }
            }else if (acc.permission_name == 'Reporte Endosos') {
              if (acc.checked == true) {
                order.acceso_rep_end = true
              }else{
                order.acceso_rep_end = false
              }
            }else if (acc.permission_name == 'Reporte pólizas') {
              if (acc.checked == true) {
                order.acceso_rep_pol = true
              }else{
                order.acceso_rep_pol = false
              }
            }else if (acc.permission_name == 'Reporte renovaciones') {
              if (acc.checked == true) {
                order.acceso_rep_ren = true
              }else{
                order.acceso_rep_ren = false
              }
            }else if (acc.permission_name == 'Reporte cobranza') {
              if (acc.checked == true) {
                order.acceso_rep_cob = true
              }else{
                order.acceso_rep_cob = false
              }
            }
          })
        }
        if(perm.model_name == 'Ordenes de trabajo'){
          order.acceso_ot = perm
          order.acceso_ot.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar OTs') {
              if (acc.checked == true) {
                order.acceso_adm_ot = true
              }else{
                order.acceso_adm_ot = false
              }
            }else if (acc.permission_name == 'Ver OTs') {
              if (acc.checked == true) {
                order.acceso_ver_ot = true
              }else{
                order.acceso_ver_ot = false
              }
            }
          })
        }
        if (perm.model_name == 'Contratantes y grupos') {
          order.acceso_contg = perm;
          order.acceso_contg.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Administrar contratantes y grupos') {
              if (acc.checked == true) {
                order.acceso_adm_cont = true
              }else{
                order.acceso_adm_cont = false
              }
            }else if (acc.permission_name == 'Ver contratantes y grupos') {
              if (acc.checked == true) {
                order.acceso_ver_cont = true
              }else{
                order.acceso_ver_cont = false
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
            }
          })
        }
        if(perm.model_name == 'Referenciadores'){
          order.acceso_refereciador = perm
          order.acceso_refereciador.permissions.forEach(function(acc){
            if (acc.permission_name == 'Cambiar refrenciador en pólizas') {
              if (acc.checked == true) {
                order.acceso_chng_ref = true
              }else{
                order.acceso_chng_ref = false
              }
            }
            if (acc.permission_name == 'Referenciador no obligatorio') {
              if (acc.checked == true) {
                order.acceso_obligatorio_ref = false
              }else{
                order.acceso_obligatorio_ref = true
              }
            }
          })
        }
      })
    }

    activate();

    $scope.hideButtonOT = function(){
      $scope.showPF = true;
    };

    $scope.hideButtonSurety = function(){
      $scope.showPF = false;
    };

    $scope.returnToPolicy = function () {
      $rootScope.show_contractor = false;
    };
    $scope.checkFechaBono = function (date) {
      $scope.date_bono = date;
    };
    $scope.checkFechaFactura = function (date) {
      var date_initial = (date).split('/');
      var day = date_initial[0];
      var month = date_initial[1];
      var year = parseInt(date_initial[2]);
      $scope.month.month_selected = parseInt(month);
      $scope.year_factura = parseInt(year);
      $scope.date_emision_factura = date;
      $scope.month.options.forEach(function(item){
        if (item.value ==$scope.month.month_selected) {
          item.month_selected = item.value
          $scope.month.month_selected = item.month_selected
        }
      })
    };
    $scope.checkFechaMaquila = function (date) {
      $scope.date_maquila = date;
    };
    $scope.changeFolio = function (param) {
      $scope.folio_factura = param;
    };
    $scope.changeMaquila = function (param) {
      $scope.maquila = param;
    };
    order.changemonth = changemonth;
    function changemonth (param) {      
      $scope.month.month_selected = param.month_selected;
    };
    $scope.changeyaer = function (param) {
      $scope.year_factura = param;
    };
    $scope.changeExchange = function (param) {
      $scope.exchange_rate = param;
    };
    $scope.checkDate = function(param){
      if(param.length == 10){
        var date_initial = (param).split('/');
        var day = date_initial[0];
        var month = date_initial[1];
        var year = parseInt(date_initial[2]);
        
        day = day - 1;
        if(day < 1){
          month = month - 1;
          if(month < 1){
            month = 12;
            year = year - 1;
          }
          if(month == 4 || month == 6 || month == 9 || month == 11){
            day = 30;
          }else if(month == 2){
            day = 28;
          }else{
            day = 31;
          }
        }
        if(day.length == 1){
          day = '0' + day;
        }
        if(month.length == 1){
          month = '0' + month;
        }

        $scope.startDate = param;
        $scope.endDate = convertDate(new Date(month + '/' + day + '/' + (year + 1)));
        $scope.surety.start_of_validity = toDate(param);
        $scope.surety.end_of_validity = toDate($scope.endDate);
      }
      else{
        var day = new Date().getDate();
        var month = new Date().getMonth() + 1;
        var year = new Date().getFullYear();

        day = day - 1;
        if(day < 1){
          month = month - 1;
          if(month < 1){
            month = 12;
            year = year - 1;
          }
          if(month == 4 || month == 6 || month == 9 || month == 11){
            day = 30;
          }else if(month == 2){
            day = 28;
          }else{
            day = 31;
          }
        }
        if(day.length == 1){
          day = '0' + day;
        }
        if(month.length == 1){
          month = '0' + month;
        }

        $scope.endDate = convertDate(new Date(month + '/' + day + '/' + (year + 1)));
        $scope.surety.start_of_validity = toDate(param);
        $scope.surety.end_of_validity = toDate($scope.endDate);
      }
      $scope.directiveReceipts.startDate = param;
      var date1 = new Date($scope.surety.start_of_validity);
      var date2 = new Date($scope.surety.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      $scope.directiveReceipts.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if($scope.directiveReceipts.policy_days_duration > 365){
        $scope.directiveReceipts.endingDate = $scope.endDate;
      }else{
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

        $scope.directiveReceipts.endingDate = convertDate(new Date(month + '/' + day + '/' + (year + 1)));
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
        $scope.surety.end_of_validity = toDate(param);
      }
      var date1 = new Date($scope.surety.start_of_validity);
      var date2 = new Date($scope.surety.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      $scope.directiveReceipts.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if($scope.directiveReceipts.policy_days_duration > 365){
        $scope.directiveReceipts.endingDate = param;
      }else{
        var date_initial = ($scope.startDate).split('/');
        var day = date_initial[0];
        var month = date_initial[1];
        var year = parseInt(date_initial[2]);
        
        if(day.length == 1){
          day = '0' + day;
        }
        if(month.length == 1){
          month = '0' + month;
        }

        $scope.directiveReceipts.endingDate = convertDate(new Date(month + '/' + day + '/' + (year + 1)));
        $scope.directiveReceipts.startDate = convertDate($scope.startDate);
      }
    };

    function activate(){
      $scope.dataToSave.is_renewable = 2
      getInternalNumber();
      $scope.startDate = convertDate(new Date());
      $scope.surety.emision_date = convertDate(new Date());
      // $scope.checkDate($scope.startDate);
      
      fillProvider();

      $http.get(url.IP + 'get-vendors/')
      .then(function(user){
        user.data.forEach(function(u){              
          u.first_name = u.first_name.toUpperCase();
          u.last_name = u.last_name.toUpperCase()
          u.name = u.first_name.toUpperCase() + ' ' + u.last_name.toUpperCase();
        })
        $scope.referenciadores = user.data;
        var vendedor = {
          referenciador: '',
          comision_vendedor: ''
        };
        $scope.referenciadorArray.push(vendedor);
        $scope.checkDate($scope.startDate);
      })
      .catch(function(e){
        console.log('error', e);
      });
       $scope.dataToSave.startDate = $scope.startDate;
       $scope.dataToSave.endingDate = $scope.endDate;
       $scope.directiveReceipts.endingDate = $scope.endDate;
       $scope.directiveReceipts.startDate = $scope.startDate;
       if($scope.aseguradoraSelected){
        $http.get(url.IP + 'claves-by-provider/' + $scope.aseguradoraSelected.id)
        .then(function success (clavesResponse){
          $scope.claves = clavesResponse.data;
          if($scope.claves.length == 1){
            $scope.surety.clave = $scope.claves[0].url;
            $scope.claveSelected = $scope.claves[0];
          }
        })
        .catch(function(error) {
          console.log('Error - claves-by-provider - catch', error);
        });

        $http.get(url.IP + 'ramos-by-provider/' + $scope.aseguradoraSelected.id)
        .then(function success(response){
          $scope.ramos = response.data;
          $scope.ramos.forEach(function(item){
            if(item.ramo_name == 'Fidelidad'){
              $scope.ramoSelected = item;
              $scope.surety.ramo = item.url;
              $scope.subramos = item.subramo_ramo;
              $scope.subramos.forEach(function(subramo){
                if(subramo.subramo_name == 'Colectivas'){
                  $scope.subramoSelected = subramo;
                  $scope.surety.subramo = subramo.url;
                  $scope.subramosTypes = subramo.type_subramo;
                  $scope.directiveReceipts.subramo = subramo;

                  var comisiones = [];
                  if($scope.claveSelected.clave_comision.length){
                    $scope.claveSelected.clave_comision.forEach(function(item){
                      if($scope.subramoSelected.subramo_name == item.subramo) {
                        comisiones.push(item);
                      }
                    });
                  }

                  $scope.directiveReceipts.comisiones = comisiones;
                  $scope.directiveReceipts.domiciliado = false;
                  $scope.directiveReceipts.payment = 5;
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
       }
       $scope.referenciadorArray =$scope.referenciadorArray;
        $scope.categories = [
          {
            name: '',
            deductible: '',
            observations: '',
            document_type: 5
          }
        ];
        $scope.beneficiaries = [
          {
            type_person: 1,
            first_name: '',
            last_name: '',
            second_last_name: '',
            j_name: '',
            full_name: '',
            rfc: '',
            email: '',
            phone_number: '',
            poliza: null,
            usuario: null
          }
        ];

    };

    $scope.saveLocalstorange = function(){
      // $localStorage['save_created_fianza_coletiva']['internal_number'] =  $scope.surety.internal_number;
      // $localStorage['save_created_fianza_coletiva']['poliza_number'] =  $scope.surety.poliza_number;
      // $localStorage['save_created_fianza_coletiva']['emision_date'] =  $scope.surety.emision_date;
      // $localStorage['save_created_fianza_coletiva']['startDate'] =  $scope.startDate;
      // $localStorage['save_created_fianza_coletiva']['endDate'] =  $scope.endDate;
      // $localStorage['save_created_fianza_coletiva']['contacto'] =  order.contacto;
      // $localStorage['save_created_fianza_coletiva']['addressSelected'] =  $scope.addressSelected;
      // $localStorage['save_created_fianza_coletiva']['bono_variable'] =  $scope.surety.bono_variable;
      // $localStorage['save_created_fianza_coletiva']['date_bono'] =  $scope.date_bono;
      // $localStorage['save_created_fianza_coletiva']['referenciadores'] =  $scope.referenciadorArray;
      // $localStorage['save_created_fianza_coletiva']['contract_poliza'] =  $scope.surety.contract_poliza;
      // $localStorage['save_created_fianza_coletiva']['categories'] =  $scope.categories;
      // $localStorage['save_created_fianza_coletiva']['beneficiaries'] =  $scope.beneficiaries;
      // $localStorage['save_created_fianza_coletiva']['date_emision_factura'] =  $scope.date_emision_factura;
      // $localStorage['save_created_fianza_coletiva']['month'] =  $scope.month.month_selected;
      // $localStorage['save_created_fianza_coletiva']['year_factura'] =  $scope.year_factura;
      // $localStorage['save_created_fianza_coletiva']['folio_factura'] =  $scope.folio_factura;
      // $localStorage['save_created_fianza_coletiva']['maquila'] =  $scope.maquila;
      // $localStorage['save_created_fianza_coletiva']['date_maquila'] =  $scope.date_maquila;
      // $localStorage['save_created_fianza_coletiva']['exchange_rate'] =  $scope.exchange_rate;

    }

    function getInternalNumber(){
      $http({
        method: 'POST',
        url: url.IP + 'internal-number/'
      })
      .then(function success(response){
        if((response.status === 200) || (response.status === 201)){            
          $scope.surety.internal_number = 'OT000' + response.data.id;
        }
      }, 
      function error(error){

      })
      .catch(function(e){
        console.log('error', e);
      });
    };

    function fillProvider() {
      var d = $scope.startDate;
      try{
        var day = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();
      }catch(error){
        var from = d.split("/")
        var f = new Date(from[2], from[1] - 1, from[0])
        var day = f.getDate();
        var month = f.getMonth() + 1;
        var year = f.getFullYear();
      }

      var date = year + "-" + month + "-" + day;
      providerService.getProviderFiByKey(date)
      .then(function success(data) {
        $scope.providers = data.data;
      },
      function error(err) {
        console.log('error', err);
      });
    };

    function convertDate(inputFormat) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    };

    function toDate(dateStr) {
      if(dateStr){
        var dateString = dateStr; // Oct 23
        var dateParts = dateString.split("/");
        var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).toISOString(); // month is 0-based
        return dateObject;
      }
    };

    $scope.checkNumPolicy = function () {
      if($scope.surety.poliza_number){
        helpers.existPolicyNumber($scope.surety.poliza_number)
        .then(function(request) {
          if(request == true) {
            SweetAlert.swal("Error", "El número de fianza ya existe.", "error");
            $scope.surety.poliza_number = '';
          }
        })
        .catch(function(err) {

        });
      }
    };

    $scope.getClaves = function(param){
      $scope.surety.aseguradora = param;
      $http.get(url.IP + 'claves-by-provider/' + $scope.surety.aseguradora.id)
      .then(function success (clavesResponse){
        $scope.claves = clavesResponse.data;
        if($scope.claves.length == 1){
          $scope.surety.clave = $scope.claves[0].url;
          $scope.claveSelected = $scope.claves[0];
        }
      })
      .catch(function(error) {
        console.log('Error - claves-by-provider - catch', error);
      });

      $http.get(url.IP + 'ramos-by-provider/' + $scope.surety.aseguradora.id)
      .then(function success(response){
        $scope.ramos = response.data;
        $scope.ramos.forEach(function(item){
          if(item.ramo_name == 'Fidelidad'){
            $scope.ramoSelected = item;
            $scope.surety.ramo = item.url;
            $scope.subramos = item.subramo_ramo;
            $scope.subramos.forEach(function(subramo){
              if(subramo.subramo_name == 'Colectivas'){
                $scope.subramoSelected = subramo;
                $scope.surety.subramo = subramo.url;
                $scope.subramosTypes = subramo.type_subramo;

                $scope.directiveReceipts.subramo = subramo;

                var comisiones = [];
                if($scope.claveSelected.clave_comision.length){
                  $scope.claveSelected.clave_comision.forEach(function(item){
                    if(param.subramo_name == item.subramo) {
                      comisiones.push(item);
                    }
                  });
                }

                $scope.directiveReceipts.comisiones = comisiones;
                $scope.directiveReceipts.domiciliado = false;
                $scope.directiveReceipts.payment = 5;
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

    $scope.refreshProvider = function(){
      fillProvider();
    };

    var myInsurance = $stateParams.myInsurance;
    if(myInsurance.url){
      if(!order.contacto){
        order.contacto = {}
      }
      order.contacto.value = $stateParams.myInsurance;
    }

    $scope.changeClave = function(param){
      if(param){
        $scope.surety.clave = param.url;
        $scope.claveSelected = param;
      }
    };

    $scope.changeSubramoType = function(param){
      $scope.fianza_type = param;
      console.log('param',param)
      $scope.surety.fianza_type = param.url;
    };

    $scope.changeCurrency = function(param){
      $scope.currencySelected = param
      $scope.surety.f_currency = param;
    };

    $scope.contratanteCreatorModalEvent = function(){
      $rootScope.show_contractor = true;
      $scope.orderInfo = vm;
      $localStorage.orderForm = JSON.stringify($scope.surety);
    };

    $scope.matchesContractors = function(parWord){
      if(parWord) {
        if(parWord.val.length >= 3) {
          if(order.org_name =='ancora'){
            $scope.show_contratante = 'contractors-match-fianzas/';
          }else{
            $scope.show_contratante = 'contractors-match/';
          }
          $http.post(url.IP + $scope.show_contratante, 
          {
            'matchWord': parWord.val,
            'poliza': false
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

    $scope.$watch("order.contacto.value", function(newValue, oldValue){
      if(order.contacto){
        if($scope.referenciadores){
          $scope.referenciadores.some(function(user){
            if (user.url == order.contacto.value.vendor){
              if(true){
                $scope.referenciadorArray[0] = {
                  referenciador: user.url 
                }
              }
            }
          });
        }
        // if(order.contacto.value.address_natural || order.contacto.value.address_juridical){
        if(order.contacto.value.address_contractor){
          // if(order.contacto.value.address_natural){
          //   $scope.surety.natural = order.contacto.value.url;
          //   $scope.surety.juridical = null;
          //   $scope.addresses = order.contacto.value.address_natural;
          // }else{
          //   $scope.surety.natural = null;
          //   $scope.surety.juridical = order.contacto.value.url;
          //   $scope.addresses = order.contacto.value.address_juridical;
          // }
          $scope.surety.contractor = order.contacto.value.url;
          $scope.addresses = order.contacto.value.address_contractor;
          if($scope.addresses.length == 1){
            $scope.addressSelected = $scope.addresses[0];
            $scope.surety.address = $scope.addresses[0].url;
          }
        }
      }
    });

    $scope.changeAddress = function(param){
      $scope.surety.address = param.url;
    };

    $scope.addReferenciador = function(){
      var addReferenciadores = {
        referenciador: '',
        comision_vendedor: ''
      };
      $scope.referenciadorArray.push(addReferenciadores);
    };

    $scope.deleteReferenciador = function(index){
      $scope.referenciadorArray.splice(index, 1);
    };

    $scope.changeComRef = function(param, index){
      $scope.referenciadorArray[index].comision_vendedor = param;
    };

    $scope.valueGuarante = function(item){
      if (item) {
        item = item.replace(/[^0-9.]/g, '');
        $scope.surety.contract_poliza.guarantee_amount = item;
      }
    };
    $scope.valuePercentageRate = function(item){
      if (item) {
        item = item.replace(/[^0-9.]/g, '');
        $scope.surety.contract_poliza.rate = item;
      }
      if(item < 0){
        $scope.surety.contract_poliza.rate = 0;
      }else if(item > 100){
        $scope.surety.contract_poliza.rate = 100;
      }
    };

    $scope.addCategorie = function(){
      var category = {
        name: '',
        deductible: '',
        observations: '',
        document_type: 9
      }
      $scope.categories.push(category);
    };

    $scope.deleteCategorie = function(index){
      $scope.categories.splice(index, 1);
    };

    $scope.valuePercentage = function(item, index){
      if(item < 0){
        $scope.categories[index].deductible = 0;
      }else if(item > 100){
        $scope.categories[index].deductible = 100;
      }
    };
    
    $scope.createIdentifier = function(){
      $scope.surety.identifier = '';
      $scope.surety.identifier = $scope.subramoSelected.subramo_name + '_' + $scope.categories[0].name;
    };

    $scope.matchesBeneficiary = function(parWord) {
      $scope.beneficiaries_data = [];
      var word_data = parWord;
      if(word_data) {
        if(word_data.length >= 3) {
            // if($scope.infoUser.staff && !$scope.infoUser.superuser){
            //   $scope.show_contratante = 'v2/BeneficiariesExistentes/';
          $scope.show_contratante = 'BeneficiariesExistentes/';
          // $http.post(url.IP + $scope.show_contratante,
          //   {
          //     'matchWord': parWord
          //   })
          $http({
              method: 'GET',
              url: url.IP+$scope.show_contratante,
              params: {
                'matchWord': parWord,
              }
            })
          .then(function(response) {
            if(response.status === 200) {
              response.data.results.forEach(function(item) {
                $scope.beneficiaries_data.push({
                  label: item.type_person == 1 ? item.full_name:item.j_name,
                  value: item
                });
              });
            }
          });
        }
      }
    };

    $scope.addBeneficiaries = function(item){
      if(item){
        if($scope.beneficiaries.length == 1){
          if($scope.beneficiaries[0].first_name == "" && $scope.beneficiaries[0].last_name == "" && $scope.beneficiaries[0].j_name == "" && $scope.beneficiaries[0].rfc == ""){
            $scope.beneficiaries[0] = item;
          }
          else{
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
              url: item.url,
              poliza: null,
              usuario: null
            }
            $scope.beneficiaries.push(beneficiary);
          }
        }else{
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
            url: item.url,
            poliza: null,
            usuario: null
          }
          $scope.beneficiaries.push(beneficiary);
        }
      }
    };

    $scope.addBeneficiary = function(){
      var beneficiary = {
        type_person: 1,
        first_name: '',
        last_name: '',
        second_last_name: '',
        j_name: '',
        full_name: '',
        rfc: '',
        email: '',
        phone_number: '',
        poliza: null,
        usuario: null
      }
      $scope.beneficiaries.push(beneficiary);
    };

    $scope.deleteBeneficiary = function(index){
      $scope.beneficiaries.splice(index, 1);
    };

    $scope.typePerson = function(param, index){
      $scope.beneficiaries[index].type_person = param;
    };

    $scope.matchesShows = function(parWord,pp){
      if(parWord) {
        if(parWord.length >= 3) {
          if(order.org_name =='ancora'){
            $scope.show_contratante = 'contractors-match-fianzas/';
          }else{
            $scope.show_contratante = 'contractors-match/';
          }
          $http.post(url.IP + $scope.show_contratante, 
          {
            'matchWord': parWord,
            'poliza': false,            
            'pp':true
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
        if(order.contratante.value.address_contractor){
          if(order.contratante.value.address_contractor){
            $scope.programa_contractor = order.contratante.value.url;
            $scope.has_programa_de_proveedores = true;
          }
        }
      }
    });

    /** Uploader files */
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
    //   name: 'customFilter',
    //   fn: function(item, options){
    //     return this.queue.length < 20;
    //   }
    // });

    // ALERTA SUCCES UPLOADFILES
    uploader.onSuccessItem = function(fileItem, response, status, headers){
      if($uibModalInstance){
        $uibModalInstance.dismiss('cancel');
      }
      $scope.okFile++;
      if($scope.okFile == $scope.uploader.queue.length){
        $timeout(function(){
          if($scope.dataSurety.poliza_number){
            SweetAlert.swal('¡Listo!', 'Fianza colectiva creada exitosamente.', 'success');
            $scope.show_certificates = true;
          }
          if(!$scope.dataSurety.poliza_number){
            SweetAlert.swal('¡Listo!', 'Proyecto de fianza colectiva creado exitosamente.', 'success');
            $scope.show_certificates = true;
          }

          if($uibModalInstance){
            $uibModalInstance.close(200);
          }
        }, 1000);
      }
    };

    // ALERTA ERROR UPLOADFILES
    uploader.onErrorItem = function(fileItem, response, status, headers){
      
    };

    uploader.onAfterAddingFile = function(fileItem){
      fileItem.formData.push({
        arch: fileItem._file,
        nombre: fileItem.file.name
      });
      $scope.specialchar = []
      var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-=" 
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
    };

    uploader.onBeforeUploadItem = function(item){
      if(item.file.sensible != undefined){
        item.formData[0].sensible = item.file.sensible;
      }
      item.url = $scope.userInfo.url;
      item.formData[0].nombre = item.file.name;
      item.alias = '';
      item.formData[0].owner = $scope.userInfo.id;
    };

    function uploadFiles(polizaId){
      $scope.userInfo = {
        id: polizaId
      };
      $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
      $scope.files = [];
      $scope.files_ = [];

      $timeout(function(){
        $scope.uploader.uploadAll();    
      }, 1000);  
    }

    $scope.validityInsurance = function(){
      console.log('sureeeeeee',$scope.surety)
      if(!$scope.showPF){
        if(!$scope.surety.poliza_number){
          SweetAlert.swal("Error", MESSAGES.ERROR.FIANZANOREQUIRED, "error");
          return;
        }
        if(!$scope.dataToSave.recibos_poliza){
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRECEIPTS, "error");
          return;
        }
      }
      if(!$scope.surety.aseguradora){
        SweetAlert.swal("Error", MESSAGES.ERROR.PROVIDERREQUIRED, "error");
        return;
      }
      if(!$scope.surety.clave){
        SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
        return;
      }
      if(!$scope.surety.ramo){
        SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
        return;
      }
      if(!$scope.surety.subramo){
        SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
        return;
      }
      if(!$scope.surety.fianza_type){
        SweetAlert.swal("Error", "Agrega un tipo de subramo de fidelidad colectiva.", "error");
        return;
      }
      if(!order.contacto.val){
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORCONTRACTOR, "error");
        return;
      }
      if(!$scope.surety.address){
        SweetAlert.swal("Error", MESSAGES.ERROR.ADDRESS, "error");
        return;
      }
      if(!$scope.surety.contract_poliza.guarantee_amount){
        SweetAlert.swal("Error", "Agrega el monto a garantizar.", "error");
        return;
      }
      if(!$scope.surety.contract_poliza.rate){
        SweetAlert.swal("Error", "Agrega el monto a garantizar.", "error");
        return;
      }
      if(!$scope.surety.contract_poliza.activity){
        SweetAlert.swal("Error", "Agrega el giro de la empresa.", "error");
        return;
      }
      if(!$scope.surety.contract_poliza.no_employees){
        SweetAlert.swal("Error", "Agrega el número de empleados.", "error");
        return;
      }
      if(!$scope.surety.contract_poliza.description){
        SweetAlert.swal("Error", "Agrega el detalle adicional de garantía.", "error");
        return;
      }
      var categoryFlag = false;
      $scope.categories.forEach(function(item, index){
        if(item.name == ''){
          SweetAlert.swal('Error', 'Agrega un nombre a la carátula ' + (index + 1) + '.', 'error');
          categoryFlag = true;
        }
        if(item.deductible == ''){
          SweetAlert.swal('Error', 'Agrega un porcentaje del deducible a la carátula ' + (index + 1) + '.', 'error');
          categoryFlag = true;
        }
      });
      var beneficiaryFlag = false;
      $scope.beneficiaries.forEach(function(item, index){
        if(item.type_person == 1){
          if(item.name == ''){
            SweetAlert.swal('Error', 'Agrega un nombre al beneficiario ' + (index + 1) + '.', 'error');
            beneficiaryFlag = true;
          }
          if(item.last_name == ''){
            SweetAlert.swal('Error', 'Agrega un apellido paterno al beneficiario ' + (index + 1) + '.', 'error');
            beneficiaryFlag = true;
          }
          // if(item.second_last_name == ''){
          //   SweetAlert.swal('Error', 'Agrega un apellio materno al beneficiario ' + (index + 1) + '.', 'error');
          //   beneficiaryFlag = true;
          // }
        }else{
          if(item.j_name == ''){
            SweetAlert.swal('Error', 'Agrega una razón social al beneficiario ' + (index + 1) + '.', 'error');
            beneficiaryFlag = true;
          }
        }
        // if(item.rfc == ''){
        //     SweetAlert.swal('Error', 'Agrega un rfc al beneficiario ' + (index + 1) + '.', 'error');
        //     beneficiaryFlag = true;
        //   }
      });
      if(!$scope.surety.identifier){
        SweetAlert.swal("Error", MESSAGES.ERROR.IDENTIFIERREQUIRED, "error");
        return;
      }
      $scope.referenciadoresSelected = [];
      $scope.referenciadorArray.forEach(function(item){
        if(item.referenciador != ''){
          if(item.comision_vendedor == ''){
            item.comision_vendedor = 0;
          }
          $scope.referenciadoresSelected.push(item);
        }
      });
      if(beneficiaryFlag || categoryFlag){
        return;
      }else{
        $scope.saveSurety();
      }
    };
    $scope.renewalSelection = function() {
      $scope.dataToSave.is_renewable = order.renewal.selected;
    }

    $scope.saveSurety = function(){
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      if($scope.referenciadoresSelected.length == 0 && order.acceso_obligatorio_ref){
        l.stop();
        SweetAlert.swal("Error", "Agrega al menos un referenciador para la fidelidad colectiva.", "error");
        return;
      }

      if($scope.dataToSave.recibos_poliza){
        $scope.dataToSave.recibos_poliza.forEach(function(item){
          item.fecha_inicio = toDate(item.startDate);
          item.fecha_fin = toDate(item.endingDate);
          item.vencimiento = toDate(item.vencimiento);
        });
      }
      $scope.surety.poliza_number = $scope.surety.poliza_number ? $scope.surety.poliza_number : null;
      $scope.surety.document_type = 8;
      $scope.surety.forma_de_pago = 5;
      if ($scope.aseguradoraSelected && $scope.aseguradoraSelected.url) {
        $scope.surety.aseguradora = $scope.aseguradoraSelected.url;
      } else if ($scope.surety.aseguradora && $scope.surety.aseguradora.url) {
        $scope.surety.aseguradora = $scope.surety.aseguradora.url;
      }
      $scope.surety.folio = '';
      $scope.surety.emision_date = $scope.surety.emision_date ? toDate($scope.surety.emision_date) : null;
      $scope.surety.fecha_anuencia = null;
      $scope.surety.is_renewable = 1;
      $scope.surety.status = $scope.showPF ? 1 : 14;
      $scope.surety.status_emision = 1;
      $scope.surety.monto_afianzado = null;
      $scope.surety.tarifa_afianzada = null;
      $scope.surety.p_neta = $scope.dataToSave.p_neta ? $scope.dataToSave.p_neta : 0;
      $scope.surety.descuento = $scope.dataToSave.descuento ? $scope.dataToSave.descuento : 0;
      $scope.surety.rpf = $scope.dataToSave.rpf ? $scope.dataToSave.rpf : 0;
      $scope.surety.derecho = $scope.dataToSave.derecho ? $scope.dataToSave.derecho : 0;
      $scope.surety.sub_total = $scope.dataToSave.sub_total ? $scope.dataToSave.sub_total : 0;
      $scope.surety.iva = $scope.dataToSave.iva ? $scope.dataToSave.iva : 0;
      $scope.surety.p_total = $scope.dataToSave.p_total ? $scope.dataToSave.p_total : 0;
      $scope.surety.comision = $scope.dataToSave.comision ? $scope.dataToSave.comision : 0;
      $scope.surety.comision_percent = $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0;
      $scope.surety.recibos_poliza = $scope.dataToSave.recibos_poliza ? $scope.dataToSave.recibos_poliza : [];
      $scope.surety.total_receipts = $scope.dataToSave.recibos_poliza ? $scope.dataToSave.recibos_poliza.length : 0;
      $scope.surety.is_renewable = $scope.dataToSave.is_renewable ? $scope.dataToSave.is_renewable : 2;
      $scope.surety.ref_policy = $scope.referenciadoresSelected;
      $scope.surety.beneficiaries_poliza = $scope.beneficiaries;
      $scope.surety.bono_variable = $scope.surety.bono_variable ? $scope.surety.bono_variable : 0,
      // $scope.surety.beneficiaries_poliza_many = $scope.beneficiaries_old;
      $scope.surety.f_currency = $scope.currencySelected ? $scope.currencySelected : 1;
      $scope.surety.date_emision_factura = $scope.date_emision_factura ? toDate($scope.date_emision_factura) : null,
      $scope.surety.date_bono = $scope.date_bono ? toDate($scope.date_bono) : null,
      $scope.surety.date_maquila = $scope.date_maquila ? toDate($scope.date_maquila) : null,
      $scope.surety.month_factura = $scope.month ? $scope.month.month_selected : 0,
      $scope.surety.year_factura = $scope.year_factura ? $scope.year_factura : 0,
      $scope.surety.maquila = $scope.maquila ? $scope.maquila : 0,
      $scope.surety.folio_factura = $scope.folio_factura ? $scope.folio_factura : '',
      $scope.surety.exchange_rate = $scope.exchange_rate ? parseFloat($scope.exchange_rate).toFixed(2) : 0,

      $scope.surety.programa_de_proveedores_contractor = $scope.programa_contractor ? $scope.programa_contractor : null;
      $scope.surety.has_programa_de_proveedores = $scope.has_programa_de_proveedores ? true : false;
      if($scope.surety && $scope.surety.contract_poliza && $scope.surety.contract_poliza.guarantee_amount){
        $scope.surety.contract_poliza.guarantee_amount =  $scope.surety.contract_poliza.guarantee_amount ? parseFloat($scope.surety.contract_poliza.guarantee_amount).toFixed(2): 0
      }
      if($rootScope.from_task && $rootScope.task_associated && $rootScope.task_associated.url){
        $scope.surety.from_task=$rootScope.from_task
        $scope.surety.task_associated=$rootScope.task_associated.id
      }
      $http.post(url.IP + 'fianzas_collective/', $scope.surety)
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          $scope.dataSurety = response.data;
          if($rootScope.from_task && $rootScope.task_associated && $rootScope.task_associated.url){
            $http.patch($rootScope.task_associated.url,{'ot_model':1, 'ot_id_reference':$scope.dataSurety.id});
          }
          $scope.categories.forEach(function(item, index){
            item.parent = response.data.id;
            item.caratula = response.data.id;     
          });
          $localStorage.save_created_fianza_coletiva = {};
          $http.post(url.IP + 'categories_collectivesurety/', $scope.categories)
          .then(function(request){
            if(request.status == 200 || request.status == 201){
              $scope.dataCategories = request.data.data;
              if($scope.countFile > 0){
                l.stop();
                uploadFiles($scope.dataSurety.id);
              }else{
                if($scope.dataSurety.poliza_number){
                  l.stop();
                  SweetAlert.swal('¡Listo!', 'Fianza colectiva creada exitosamente.', 'success');
                  $scope.goToInformation();
                  // $scope.show_certificates = true;
                }
                if(!$scope.dataSurety.poliza_number){
                  l.stop();
                  SweetAlert.swal('¡Listo!', 'Proyecto de fianza colectiva creado exitosamente.', 'success');
                  $scope.goToInformation();
                  // $scope.show_certificates = true;
                }
   
              }
            }else{
              l.stop();
            }
          })
          .catch(function (e) {
            l.stop();
            console.log('error - caratula - catch', e);
          });
        }
      })
      .catch(function (e) {
        l.stop();
        console.log('error - caratula - catch', e);
      });
    };

    $scope.cancel = function(){
      $state.go('fianzas.list');
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
            certificate_number: parseInt(item.CERTIFICADO),
            email: item.CORREO ? item.CORREO : null,
            first_name: item.NOMBRE,
            last_name: item.APELLIDO_PATERNO,
            second_last_name: item.APELLIDO_MATERNO,
            rfc: item.RFC ? item.RFC : null,
            workstation: item.PUESTO ? item.PUESTO : null
          }
          var certificateData = {
            caratula: $scope.dataSurety.id,
            certificate_number: parseInt(item.CERTIFICADO),
            parent: item.CATEGORIA,
            poliza_number: $scope.dataSurety.poliza_number + ' - INC. ' + item.CERTIFICADO,
            start_of_validity: $scope.dataSurety.start_of_validity,
            end_of_validity: $scope.dataSurety.end_of_validity,
            status: $scope.dataSurety.status,
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
          SweetAlert.swal("¡Listo!", MESSAGES.OK.CERTIFICATESDONE, 'success');
          $state.go('fianzas.details', {polizaId: $scope.dataSurety.id});
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

    $scope.goToInformation = function(){
      $state.go('fianzas.details', {polizaId: $scope.dataSurety.id});
    };

  }

})();
