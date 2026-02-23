(function() {
  'use strict';

  angular.module('inspinia')
      .controller('FianzasCtrl', FianzasCtrl);

  FianzasCtrl.$inject = ['$parse', 'insuranceService','toaster', 'MESSAGES', '$stateParams', 'ContratanteService', 'dataFactory', 'SweetAlert', 'providerService', 'datesFactory', '$scope', '$sessionStorage', 'FileUploader', '$state', '$http', 'url', '$localStorage', '$rootScope','emailService', 'helpers','$timeout'];

  function FianzasCtrl($parse, insuranceService, toaster, MESSAGES, $stateParams, ContratanteService, dataFactory, SweetAlert, providerService, datesFactory, $scope, $sessionStorage, FileUploader, $state, $http, url, $localStorage, $rootScope,emailService, helpers, $timeout) {
      var vm = this;

      /* Información de usuario */
      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
      var usr = JSON.parse(decryptedUser);
      var token = JSON.parse(decryptedToken);
      $scope.infoUser = $sessionStorage.infoUser;


      // varibles
      vm.show = {
          firstTab: true,
          ot: true
      };
      $scope.activeJustified = 0
      vm.org_name = usr.org;
      $scope.create_natural = true;
      $scope.create_juridical = true;
      $scope.showPrograma = false;
      $rootScope.show_contractor = false;
      var dateOffset = (24*60*60*1000) * 1; //1 days
      var now = new Date()
      var endDate = now.setFullYear(now.getFullYear() + 1)
      endDate = new Date(endDate).setTime(new Date(endDate).getTime() - dateOffset );
      vm.defaults = {};
      vm.form = {
          contratante: {},
          folio: '',
          afianzadora: '',
          emision_date : datesFactory.convertDate(new Date()),
          start_of_validity: datesFactory.convertDate(new Date()),
          end_of_validity: datesFactory.convertDate(endDate),
          emision: datesFactory.convertDate(new Date()),
          date_emision_factura: '',
          date_maquila: '',
          year_factura: '',
          date_bono: '',
          mes_emision: '',
          folio_captura: '',
          ceder_comision: false,
          comision_percent: 0.0,
          udi: 0.0,
          vendor : '',
          benefiaciario_seleccionado : '',
          status: 1,
          identifier : '',
          is_fianza : true

      };
      $scope.years=[]
      var actualYear = new Date().getFullYear();
      var oldYear = actualYear - 80;
      for (var i = actualYear + 10; i >= oldYear; i--) {
        $scope.years.push(i);
      }
      vm.form.renewal = {};
      vm.form.renewal.is_renewable = 2;
      vm.form.renewal.options = [
          {'value':1,'label':'Renovable'},
          {'value':2,'label':'No Renovable'},
      ]
      $scope.dataToSave = {};
      vm.form.referenciadores = [{referenciador:''}];


      if($stateParams.myInsurance && $stateParams.myInsurance != ''){
        vm.form.contratante['value'] = $stateParams.myInsurance;
        console.log('vmform',vm.form.contratante,$scope.vendors)
        if($scope.vendors){
          $scope.vendors.some(function(user) {
            if (user.url == vm.form.contratante.value.vendor){
              if(true){
                vm.form.vendor = user.id;
                user.name = user.first_name + ' '+user.last_name;
                vm.form.vendor = user;
              }
            }
          })
        }

        if(vm.form.contratante.value.j_name) {
          vm.form.contratante.val = vm.form.contratante.value.j_name
        }

        if(vm.form.contratante.value.full_name) {
          vm.form.contratante.val = vm.form.contratante.value.full_name
        }

        // if (vm.form.contratante.value.address_natural){
        //     vm.defaults.address = vm.form.contratante.value.address_natural
        // } else{
        //     vm.defaults.address = vm.form.contratante.value.address_juridical
        // }
         vm.defaults.address = vm.form.contratante.value.address_contractor
        if (vm.form.contratante.value.phone_number){
          vm.form.contratante.phone_number = vm.form.contratante.value.phone_number
        }

        if (vm.form.contratante.value.email){
          vm.form.contratante.email = vm.form.contratante.value.email
        }
        try{
          vm.form.address = vm.defaults.address[0];
        }
        catch (err){}
        try{vm.form.referenciadores = [{referenciador:vm.form.contratante['value'].vendor}];}catch(err){};


      }

      // funciones
      vm.contratanteCreatorModalEvent = contratanteCreatorModalEvent;
      vm.aseguradoraSelection = aseguradoraSelection;
      vm.changeRamo = changeRamo;
      vm.changeSubramo = changeSubramo;
      vm.changeTipo = changeTipo;
      vm.addBene = addBene;
      vm.deleteBene = deleteBene;
      vm.checkDate = checkDate;
      vm.checkEndDate = checkEndDate;
      vm.cancel = cancel;

      // diccionarios // 
      vm.accesos = $sessionStorage.permisos
      if (vm.accesos) {
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
              }else if (acc.permission_name == 'Proyecto de fianza') {
                if (acc.checked == true) {
                  vm.acceso_proy_fia = true
                }else{
                  vm.acceso_proy_fia = false
                  vm.form.status = 10
                }
              }
            })
          }
          if(perm.model_name == 'Referenciadores'){
            vm.acceso_refereciador = perm
            vm.acceso_refereciador.permissions.forEach(function(acc){
              if (acc.permission_name == 'Cambiar refrenciador en pólizas') {
                if (acc.checked == true) {
                  vm.acceso_chng_ref = true
                }else{
                  vm.acceso_chng_ref = false
                }
              }
              if (acc.permission_name == 'Referenciador no obligatorio') {
                if (acc.checked == true) {
                  vm.acceso_obligatorio_ref = false
                }else{
                  vm.acceso_obligatorio_ref = true
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
        })
      }

      vm.form.subforms = {
          contract: {
              start: vm.form.start_of_validity,
              end: vm.form.end_of_validity,
              sign_date: datesFactory.convertDate(new Date()),
              number: '',
              value: '',
              contract_object: '',
              guarantee_percentage: 0,
          },
          beneficiaries_fianza: [{
              first_name: '',
              last_name: '',
              second_last_name: '',
              full_name: '',
              j_name: '',
              rfc: '',
              email: '',
              phone_number: '',
          type_person: 1,
          }]
      }


      vm.form.currency={};
      vm.form.currency.currency_selected = 1;
      vm.form.currency.options = [
          {'value':1,'label':'PESOS'},
          {'value':2,'label':'DOLARES'},
      ]
      vm.form.month={};
      // vm.form.month_selected = 1;
      vm.form.month.options = [
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
        vm.form.month_selected = parseInt(month)
        vm.form.year_factura = year;
      };
      $scope.convertDate = function(inputFormat) {
        function inputDate(days) { return (days < 10) ? '0' + days : days; }
        var dateFormat = new Date(inputFormat);
        var date = [inputDate(dateFormat.getDate()), inputDate(dateFormat.getMonth()+1), dateFormat.getFullYear()].join('/');
        return date;
      };
      
      $scope.fechas_upd = function(date,val,event){
        // 3-11-2022
        var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
        var pastedText = clipboardData.getData('text');
        var date_initial = (pastedText).split('-');
        var day = date_initial[0];
        var month = date_initial[1];
        var year = parseInt(date_initial[2]);
        if (parseInt(month) >12) {
          var day2 =month
          var month2 = day
          day = day2
          month = month2
        }
        if (day.length ==1) {
          day = '0'+day.toString()
        }
        if (month.length ==1) {
          month = '0'+month.toString()
        }
        var fecha_to_date = day+'/'+month+'/'+year
        if(fecha_to_date){
          var date2 = fecha_to_date
        }else{
          var date2 =datesFactory.convertDate(fecha_to_date)        
        }
        console.log('.....',fecha_to_date,date2)
        if (val ==1) {
          if (vm.form.subforms) {
            if (vm.form.subforms.contract) {
              vm.form.subforms.contract.start = date2 ? date2 : datesFactory.convertDate(new Date())
            }else{
              vm.form.subforms.contract ={}
              vm.form.subforms.contract.start = date2 ? date2 : datesFactory.convertDate(new Date())
            }
          }
        }
        if (val ==2) {
          if (vm.form.subforms) {
            if (vm.form.subforms.contract) {
              vm.form.subforms.contract.end = date2 ? date2 : datesFactory.convertDate(new Date())
            }else{
              vm.form.subforms.contract ={}
              vm.form.subforms.contract.end = date2 ? date2 : datesFactory.convertDate(new Date())
            }
          }
        }
        if (val ==3) {
          if (vm.form.subforms) {
            if (vm.form.subforms.contract) {
              vm.form.subforms.contract.sign_date = date2 ? date2 : datesFactory.convertDate(new Date())
            }else{
              vm.form.subforms.contract ={}
              vm.form.subforms.contract.sign_date = date2 ? date2 : datesFactory.convertDate(new Date())
            }
          }
        }
        console.log('-date---------',vm.form.subforms.contract.start)
        $scope.saveLocalstorange()
      }
      $http.get(url.IP + 'userslist_admin/')
      .then(function(users) {
          $scope.vendors = users.data;
          console.log('iiiiiiii',$scope.vendors)
      });
      activate();

      function activate(){
        if ($localStorage['save_created_fianza'] && $localStorage['save_created_fianza']['type_fianza'] && $localStorage['save_created_fianza']['type_fianza'] == 0){
          $scope.activeJustified = 0;
          vm.form.status = 1;
          var tab = 'ot'
        } else if ($localStorage['save_created_fianza'] && $localStorage['save_created_fianza']['type_fianza'] && $localStorage['save_created_fianza']['type_fianza'] == 1) {
          $scope.activeJustified = 1;
          vm.form.status = 10;
          var tab = 'fianza'
        }
        $scope.active = {}; //reset
        $scope.active[tab] = true;

        vm.form.emision_date = datesFactory.convertDate(new Date());
        vm.form.start_of_validity =datesFactory.convertDate(new Date());
        vm.form.end_of_validity =datesFactory.convertDate(new Date());
        if(vm.form.afianzadora){
          get_claves();
          $http.get(url.IP + 'ramos-by-provider/'+vm.form.afianzadora.id)
          .then(
          function success (response) {
           vm.defaults.ramos = response.data;
          },
          function error (e) {
           console.log('Error - ramos-by-provider', e);
          })
          .catch(function (error) {
          console.log('Error - ramos-by-provider - catch', error);
          });
        }
        if(vm.form.ramo){
          vm.changeRamo();
        }
        
        vm.form.renewal.selected = 2;
        vm.form.referenciadores = [{referenciador:''}];
        vm.form.subforms = {};
        vm.form.subforms.beneficiaries_fianza = [{
          first_name: '',
          last_name: '',
          second_last_name: '',
          full_name: '',
          j_name: '',
          rfc: '',
          email: '',
          phone_number: '',
          type_person: 1,
        }]

        // vm.show = {
        //   firstTab: true,
        //   ot: true
        // };
      }

      if ('save_created_fianza' in $localStorage){}
      else{
        $localStorage['save_created_fianza'] = {};
      }

      $scope.testCheck = function(showPrograma){
      }
      $scope.saveLocalstorange = function(){
      }
      $scope.activateTab = function(tab) {
        $scope.active = {}; //reset
        $scope.active[tab] = true;
        $localStorage['save_created_fianza']['active'] = $scope.active;
        if(tab == 'ot'){
          $localStorage['save_created_fianza']['type_fianza'] = 0;
        } else {
          $localStorage['save_created_fianza']['type_fianza'] = 1;
        }
      }
      /* Watchs */
      $scope.$watch('vm.form.contratante.value', function(newValue, oldValue) {        
        $rootScope.show_contractor = false;
        if(vm.form.contratante) {
          if($scope.vendors){
            $scope.vendors.some(function(user) {
              if (user.url == vm.form.contratante.value.vendor){
                vm.form.vendor = user.id;
                user.name = user.first_name + ' '+user.last_name;
                vm.form.vendor = user;
                vm.form.referenciadores.push({ referenciador: user.url }); 
              }
            })
          }

          if(vm.form.contratante && vm.form.contratante.value && vm.form.contratante.value.j_name) {
            vm.form.contratante.val = vm.form.contratante.value.j_name;
          }

          if(vm.form.contratante && vm.form.contratante.value && vm.form.contratante.value.first_name) {
            vm.form.contratante.val = vm.form.contratante.value.first_name + ' ' + vm.form.contratante.value.last_name + ' ' + vm.form.contratante.value.second_last_name;
          }

          // if (vm.form.contratante.value.address_natural){
          //     vm.defaults.address = vm.form.contratante.value.address_natural;
          // } else{
          //     vm.defaults.address = vm.form.contratante.value.address_juridical;
          // }
          vm.defaults.address = vm.form.contratante && vm.form.contratante.value && vm.form.contratante.value.address_contractor;

          if (vm.form.contratante.value.phone_number){
            vm.form.contratante.phone_number = vm.form.contratante.value.phone_number;
          }

          if (vm.form.contratante.value.email){
            vm.form.contratante.email = vm.form.contratante.value.email;
          }

          try{
            if(vm.defaults.address.length == 1){
              vm.form.address = vm.defaults.address[0];
              if (vm.form.address.administrative_area_level_1.state) {
                vm.form.address.administrative_area_level_1 = vm.form.address.administrative_area_level_1.state;
              }
              if (vm.form.address.administrative_area_level_2.city) {
                vm.form.address.administrative_area_level_2 = vm.form.address.administrative_area_level_2.city;                
              }
            } else if(vm.defaults.address.length > 1) {
              vm.form.address = vm.defaults.address[0];
              if (vm.form.address.administrative_area_level_1.state) {
                vm.form.address.administrative_area_level_1 = vm.form.address.administrative_area_level_1.state;
              }
              if (vm.form.address.administrative_area_level_2.city) {
                vm.form.address.administrative_area_level_2 = vm.form.address.administrative_area_level_2.city;                
              }
            }
          }
          catch (err){

          }
        }
      });

      $scope.checkNumFianza = function () {
        if(vm.form.poliza_number){
          helpers.existPolicyNumber(vm.form.poliza_number)
          .then(function(request) {
            if(request == true) {
              SweetAlert.swal("Error", "El número de fianza ya existe.", "error");
              vm.form.poliza_number = '';
            }
          })
          .catch(function(err) {

          });
        }
      };

      // funciones iniciales
      var curr_date = now.getDate();
      var curr_month = now.getMonth() + 1;
      var curr_year = now.getFullYear();
      providerService.getProviderFiByKey(curr_year + "-" + curr_month + "-" + curr_date)
      .then(
      function success(data) {
        vm.defaults.providers = data.data;
      },
      function error(err) {
        console.log('error', err);
      });


      function checkDate(param){
        if (!param) {
          return
        }
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

          $scope.endDate = datesFactory.convertDate(new Date(month + '/' + day + '/' + (year + 1)));
          vm.form.start_of_validity = param;
          vm.form.end_of_validity = $scope.endDate;
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

          $scope.endDate = datesFactory.convertDate(new Date(month + '/' + day + '/' + (year + 1)));
          vm.form.start_of_validity = param;
          vm.form.end_of_validity = $scope.endDate;
        }
        vm.form.startDate = param;
        var date1 = datesFactory.toDate(vm.form.start_of_validity);
        var date2 = datesFactory.toDate(vm.form.end_of_validity);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        vm.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if(vm.form.policy_days_duration > 365){
          vm.form.endingDate = $scope.endDate;
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

          vm.form.endingDate = datesFactory.convertDate(new Date(month + '/' + day + '/' + (year + 1)));
        }
      };

      function checkEndDate(param){
        if (!param) {
          return
        }
        if(param.length == 10){
          if(process(param) < process(vm.form.start_of_validity)){
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
          vm.form.end_of_validity = param;
        }
        var date1 = datesFactory.toDate(vm.form.start_of_validity);
        var date2 = datesFactory.toDate(vm.form.end_of_validity);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        vm.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if(vm.form.policy_days_duration > 365){
          vm.form.endingDate = param;
        }else{
          var date_initial = (vm.form.start_of_validity).split('/');
          var day = date_initial[0];
          var month = date_initial[1];
          var year = parseInt(date_initial[2]);
          
          if(day.length == 1){
            day = '0' + day;
          }
          if(month.length == 1){
            month = '0' + month;
          }

          vm.form.endingDate = datesFactory.convertDate(new Date(month + '/' + day + '/' + (year + 1)));
        }
      };

      $scope.$watch($stateParams, function(newValue, oldValue) {
        if (newValue===oldValue) {
          return;
        }
      })

      function contratanteCreatorModalEvent() {
        console.log(vm.form)
        $rootScope.show_contractor = true;
        $scope.orderInfo = vm;
        $localStorage.orderForm = JSON.stringify(vm.form);
        $localStorage.save_created_fianza.show_contractor = true;
      }
      var myInsurance = $stateParams.myInsurance;
      if(myInsurance.url){
        var contrac = {};
        contrac.contratanteId = myInsurance.id;
        if(myInsurance.type_person == "Fisica"){
          contrac.type = "fisicas";
        }
        if(myInsurance.type_person == "Moral"){
          contrac.type = "morales";
        }
        ContratanteService.getContratanteFull(contrac)
        .then(function(contractor) {
          vm.form.contratante = {};
          $scope.vm.form.contratante = {}
          if(contractor.cellule){
            // $http.get(contractor.cellule)
            $http.get(contractor.cellule.url ? contractor.cellule.url : contractor.cellule)              
            .then(function success(respo) {
              $scope.celulaSelected = respo.data;
            });
          }
          if(contractor){
            if($scope.referenciadores){
              $scope.referenciadores.some(function(user){
                if(user.url == contractor.vendor){
                  $scope.referenciadorArray[0] = {
                    referenciador: user.id,
                    comision_vendedor: ''
                  }
                }
              });
            }
            if(contractor.address_contractor){
              if(contractor.address_contractor){
                // $scope.caratula.contractor = contractor.id;
                $scope.addresses = contractor.address_contractor;
                $scope.vm.form.address = $scope.addresses
                vm.form.address = $scope.addresses
              }
              if($scope.addresses.length == 1){
                vm.form.address = $scope.addresses
                $scope.vm.form.address = $scope.addresses
                $scope.addressSelected = $scope.addresses[0];
                // $scope.caratula.address = $scope.addresses[0].id;
              }
            }
          }

          if(contractor.first_name){
            vm.form.contratante.val = contractor.first_name + ' ' + contractor.last_name + ' ' + contractor.second_last_name;
            vm.form.contratante.label = contractor.first_name + ' ' + contractor.last_name + ' ' + contractor.second_last_name;
          }
          if(contractor.full_name){
            vm.form.contratante.val = contractor.full_name;
            vm.form.contratante.label = contractor.full_name;
          }
          if(contractor.address_contractor){
            vm.form.address = contractor.address_contractor
            $scope.addresses = contractor.address_contractor;
          }
          $scope.addressSelected = $scope.addresses[0];
          vm.form.contratante.value = contractor;
          vm.form.contratante.value.email = contractor.email
          $scope.vm.form.contratante = vm.form.contratante;
        });
      }
      $scope.matchesContractors = function(parWord) {
        $scope.contractors_data = 0;
        var word_data = vm.form.contratante.val;
        if(word_data) {
          if(word_data.length >= 3) {
            if(vm.org_name =='ancora'){
              $scope.show_contratante = 'contractors-match-fianzas/';
            }else{
              $scope.show_contratante = 'contractors-match/';
            }
            $http.post(url.IP + $scope.show_contratante,
              {
                'matchWord': parWord
              })
            .then(function(response) {

              // if(response.status === 200 && (response.data.juridicals || response.data.naturals)) {
              if(response.status === 200 && (response.data.contractors)) {

                var source = [];
                // var juridicals = response.data.juridicals;
                // var naturals = response.data.naturals;

                // if(juridicals.length) {
                //   juridicals.forEach(function(item) {
                //     var obj = {
                //       label: item.j_name,
                //       value: item
                //     };
                //     source.push(obj)
                //   });
                // } else if(naturals.length) {
                //   naturals.forEach(function(item) {
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

                //   source.push(obj)
                // });
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
        } else {
          $scope.contractors_data = [];
        }
      };

      $scope.agregarBeneficiario = function(parWord) {
        var beneficiario = parWord.value;
        if(parWord.value){
          if(vm.form.subforms.beneficiaries_fianza.length == 1){
            
            if(vm.form.subforms.beneficiaries_fianza[0].first_name == "" && vm.form.subforms.beneficiaries_fianza[0].j_name == "" && vm.form.subforms.beneficiaries_fianza[0].rfc == "" && vm.form.subforms.beneficiaries_fianza[0].email == ""){
              vm.form.subforms.beneficiaries_fianza[0] = beneficiario;
            }
            else{
              vm.form.subforms.beneficiaries_fianza.push({
                first_name: beneficiario.first_name,
                last_name: beneficiario.last_name ,
                second_last_name: beneficiario.second_last_name ,
                j_name: beneficiario.j_name ,
                rfc: beneficiario.rfc ,
                email: beneficiario.email ,
                phone_number: beneficiario.phone_number ,
                type_person:beneficiario.type_person ,
                url : beneficiario.url,
                id: beneficiario.id
              });
            }

            // vm.form.subforms.beneficiaries_fianza[0] = beneficiario;
          }
          else{
            vm.form.subforms.beneficiaries_fianza.push({
              first_name: beneficiario.first_name,
              last_name: beneficiario.last_name ,
              second_last_name: beneficiario.second_last_name ,
              j_name: beneficiario.j_name ,
              rfc: beneficiario.rfc ,
              email: beneficiario.email ,
              phone_number: beneficiario.phone_number ,
              type_person:beneficiario.type_person ,
              url : beneficiario.url,
              id: beneficiario.id
            });
          }
        }

      }


      $scope.matchesBeneficiary = function(parWord) {
        $scope.beneficiaries_data = [];
        var word_data = parWord;
        if(word_data) {
          if(word_data.length >= 3) {
            $scope.show_contratante = 'BeneficiariesExistentes/';
            // $http.get(url.IP + $scope.show_contratante+'&'+'matchWord='+parWord)
            $http({
              method: 'GET',
              url: url.IP+$scope.show_contratante,
              params: {
                'matchWord': parWord,
              }
            })
            .then(function(response) {
              if(response.status === 200) {
                $timeout(function() {    
                  $scope.beneficiaries_data = [];        
                  response.data.results.forEach(function(item) {
                    $scope.beneficiaries_data.push({
                      label: item.type_person == 1 ? item.full_name:item.j_name,
                      value: item
                    });
                  });
                }, 1000)
              }else{
                $scope.beneficiaries_data = [];
              }
            });
          }
        }
      };


      function aseguradoraSelection() {
          if(vm.form.afianzadora){
            get_claves();
          }

       $http.get(url.IP + 'ramos-by-provider/'+vm.form.afianzadora.id)
       .then(
         function success (response) {
           vm.defaults.ramos = response.data;
         },
         function error (e) {
           console.log('Error - ramos-by-provider', e);
         })
        .catch(function (error) {
          console.log('Error - ramos-by-provider - catch', error);
        });
      };


      function get_claves() {

          var date = new Date(vm.form.start_of_validity);
          if(isNaN(date)) {
              var date = new Date(datesFactory.mesDiaAnio(vm.form.start_of_validity));
          }

          $http.get(url.IP+'claves-by-provider/'+vm.form.afianzadora.id)
          .then(
              function success(clavesResponse) {
              clavesResponse.data.forEach(function(clave) {
                  clave.clave_comision.forEach(function(item) {
                      item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
                  });
              });

              vm.defaults.claves=clavesResponse.data;
              if(vm.defaults.claves.length== 1) {
                  vm.form.clave = vm.defaults.claves[0];
                  try{
                      vm.form.comision_percent = (vm.form.clave.comission);
                      vm.form.udi = (vm.form.clave.udi);
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

      function changeRamo() {
          vm.defaults.subramos = vm.form.ramo.subramo_ramo;
          vm.defaults.subramos.forEach(function (subramo,index) {
            if (subramo.subramo_name == 'Colectivas'){
              vm.defaults.subramos.splice(index, 1);
            }
            if(vm.form.ramo.subramo_ramo.length == (index+1)){
              if($localStorage['save_created_fianza']['subramo']){
                vm.form.subramo = $localStorage['save_created_fianza']['subramo'];
              }
            }
          })
      };


      function changeSubramo(s) {
        if(vm.form.subramo){
          vm.defaults.types = vm.form.subramo.type_subramo;
          get_claves();
        }

        vm.defaults.formInfo = {
          code: vm.form.subramo.subramo_code,
          name: vm.form.subramo.subramo_name
        };
        vm.defaults.comisiones = [];

        if(vm.form.clave){
          if(vm.form.clave.clave_comision.length) {
            vm.form.clave.clave_comision.forEach(function(item) {
              if(vm.form.subramo.subramo_name == item.subramo) {
                vm.defaults.comisiones.push(item);
              }
            });

            if(vm.defaults.comisiones){
              if(!vm.defaults.comisiones.length) {
                 SweetAlert.swal({
                    title: 'Error',
                    text: "Debe tener al menos una comisión capturada para la clave seleccionada",
                    type: "error",
                    showCancelButton: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Aceptar",
                    cancelButtonText: "Cancelar",
                    closeOnConfirm: true
                }, function(isConfirm) {
                    if (isConfirm) {
                    }
                });
              }
            }

            if(vm.defaults.comisiones.length == 1){
              vm.form.comision = vm.defaults.comisiones[0];
            }
          }
        }
      };

      function changeTipo(tipo) {
      }


      $scope.addReferenciador = function(type) {
        var addReferenciadores = {
          referenciador: ''
        };
        vm.form.referenciadores.push(addReferenciadores);
      }

      $scope.deleteReferenciador = function(index, type) {
        vm.form.referenciadores.splice(index, 1);
          
      }

      function addBene(){
          var beneficiario = {
              first_name: '',
              last_name: '',
              second_last_name: '',
          j_name: '',
              rfc: '',
              email: '',
              phone_number: '',
          type_person: 1,
          };
          vm.form.subforms.beneficiaries_fianza.push(beneficiario);
      }

      function deleteBene(index){
          if(vm.form.subforms.beneficiaries_fianza.length > 1){
              vm.form.subforms.beneficiaries_fianza.splice(index, 1);
          }
      }

      $scope.validateDecimalMontoTotal = function(input){
        if((parseFloat(input) <= 0) || input == ''){
          vm.form.subforms.contract.value = 0;
          vm.form.subforms.contract.amount_iva = 0;   
        }
        else{
          vm.form.subforms.contract.value = parseFloat(input).toFixed(2);
          var valor_am = parseFloat($scope.formatearNumero_calculate(vm.form.subforms.contract.amount)).toFixed(2);
          if (vm.form.subforms.contract.amount) {
            if (valor_am == 'NaN') { 
              toaster.error('Revise el formato del Monto del Contrato.');
              vm.form.subforms.contract.amount_iva = parseFloat(0).toFixed(2);  
              return;
            }else if (valor_am) {
              vm.form.subforms.contract.amount_iva = parseFloat(parseFloat(parseFloat(valor_am) * .16) + parseFloat(valor_am)).toFixed(2);          
            }
          }
        }  
      };

      $scope.formatNumber =function (valor) {
        var nums = new Array();
        var simb = ",";

        if(!valor) {
          return;
        }

        if(typeof(valor) == 'number') {
          return valor;
        } else {
          
          valor = valor.toString();
          nums = valor.split("");
          var long = nums.length - 1;
          var patron = 3;
          var prox = 2;
          var res = "";

          while (long > prox) {
          if (prox == 2) {

          } else {
          nums.splice((long - prox), 0, simb);
          }
          prox += patron;

          }
          nums.splice(0, 0);


          for (var i = 0; i <= nums.length - 1; i++) {

          res += nums[i];
          }

          return valor;
        }
      }
      $scope.formatearNumero_calculate = function(nStr, campo) {
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
      }
      $scope.formatearNumero = function(nStr, campo) {
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
          var value = cadena_sin_comas+x2.replace(/,/g, '');
          value = parseFloat(value).toLocaleString('en-US', {
            style: 'decimal',
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          });
          if (value =='NaN') {
            value = 0
          }
          if (campo ==1) {
            vm.form.subforms.contract.amount = value
          }
          if (campo ==2) {
            vm.form.subforms.contract.guarantee_amount = value
          }
          return value;  
        }else{
          var value = nStr.replace(/,/g, '');
          value = parseFloat(value).toLocaleString('en-US', {
            style: 'decimal',
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          });
          if (value =='NaN') {
            value = 0
          }
          if (campo ==1) {
            vm.form.subforms.contract.amount = value
          }
          if (campo ==2) {
            vm.form.subforms.contract.guarantee_amount = value
          }
          return value;
        }
      }

      var uploader = $scope.uploader = new FileUploader({
          headers: {
              'Authorization': 'Bearer ' + token,
              'Accept': 'application/json'
          },
      });

      // uploader.filters.push({
      //     name: 'customFilter',
      //     fn: function(item, options) {
      //         return this.queue.length < 20;
      //     }
      // });

      $scope.renewalSelection = function(ren) {
        vm.form.renewal.is_renewable = ren;
      }

      $scope.save = function(param){         
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          if (vm.form.subforms.contract){
            if (vm.form.subforms.contract.description) {
              if (vm.form.subforms.contract.description.length >= 500) {
                l.stop();
                toaster.error('La descripción del detalle de garantía no puede ser mayor o igual de 500 caracteres');
                return;              
              }
            }
          }
          if(vm.form.status != 1){
            if(!vm.form.poliza_number || vm.form.poliza_number == undefined || vm.form.poliza_number == ''){
              l.stop();
              SweetAlert.swal("Error", MESSAGES.ERROR.FIANZANOREQUIRED, "error");
              return
            }
          }            
          if(vm.form.subforms.contract.rate && parseInt(vm.form.subforms.contract.rate) > 100 ){
            l.stop();
            toaster.error('El valor de la tarifa aplicable no puede ser mayor de 100');
            return;
          }

          if(vm.form.subforms.contract.guarantee_percentage && parseInt(vm.form.subforms.contract.guarantee_percentage) > 100 ){
            l.stop(); 
            toaster.error('El valor del Porcentaje a garantizar no puede ser mayor de 100');
            return;
          }


          
          if (vm.form.subforms.contract){
            if (vm.form.subforms.contract.description) {
              if (vm.form.subforms.contract.description.length >= 500) {
                l.stop();
                toaster.error('La descripción del detalle de garantía no puede ser mayor o igual de 500 caracteres');
                return;              
              }
            }
          }

          if (!vm.form.afianzadora && !vm.form.afianzadora.url){
            l.stop(); 
            toaster.error('Seleccione una afianzadora');
            return;
          }
          if (!vm.form.ramo){
            l.stop(); 
            toaster.error('Seleccione un ramo');
            return;
          }
          if (!vm.form.subramo){
            l.stop(); 
            toaster.error('Seleccione un subramo');
            return;
          }
          if (!vm.form.clave){
            l.stop(); 
            toaster.error('Seleccione una clave');
            return;
          }
          if (!vm.form.tipo && (vm.defaults && vm.defaults.types ? vm.defaults.types.length > 0 : false)){
            l.stop(); 
            toaster.error('Seleccione un tipo');
            return;
          }
          if (!vm.form.contratante.value){
            l.stop(); 
            toaster.error('Seleccione un contratante');
            return;
          }
          if (!vm.form.address){
            l.stop(); 
            toaster.error('Seleccione una direccion');
            return;
          }

          // var flag = false;
          // if (vm.form.referenciadores.length > 0){
          //   vm.form.referenciadores.forEach(function(ref){
          //     if(!ref.referenciador){
          //       toaster.error('Seleccione un referenciador');
          //       flag  = true;
          //     }


          //     if(!ref.comision_vendedor && vm.form.referenciadores.length != 1){
          //       toaster.error('Todos los referenciadores deben tener porcentaje de comisión');
          //       flag  = true;
          //     }
          //   });
          // }

          // if (flag){
          //   return;
          // }

          if (!vm.form.subforms.contract.description){
            l.stop(); 
            toaster.error('Agrega la descripción en el Detalle de Garantía');
            return;
          }
          if (vm.form.subforms.contract.guarantee_amount != '0'){
            if (!vm.form.subforms.contract.guarantee_amount){
              l.stop(); 
              toaster.error('Agrega el monto a garantizar en el Detalle de Garantía, número');
              return;
            }
          }
          if (vm.form.subforms.contract.rate != 0){
            if (!vm.form.subforms.contract.rate){
              l.stop(); 
              toaster.error('Agrega la tarifa en el Detalle de Garantía');
              return;
            }
          }

           if(vm.form.subramo.subramo_code == 20 || vm.form.subramo.subramo_code == 21){
            if (!vm.form.subforms.contract.number || !vm.form.subforms.contract.start || !vm.form.subforms.contract.end || !vm.form.subforms.contract.sign_date){
              l.stop(); 
              toaster.error('Llene todos los campos del detalle de garantía para subramo obra o proveeduria');
            return;
            } 
   
            if (vm.form.subforms.contract.amount != '0'){
              if (!vm.form.subforms.contract.amount){                
                l.stop(); 
                toaster.error('Agrega el monto de contrato, número');
                return;
              }
            }
            if (vm.form.subforms.contract.amount_iva != 0){
              if (!vm.form.subforms.contract.amount_iva){
                l.stop();
                toaster.error('Agrega el monto de contrato con iva');
                return;
              }
            }
            // if (vm.form.subforms.contract.guarantee_percentage != 0){
            //   if (!vm.form.subforms.contract.guarantee_percentage){
            //     l.stop();
            //     toaster.error('Agrega el porcentaje a garantizar');
            //     return;
            //   }  
            // }
          }

          if(vm.form.ramo.ramo_code == 4 && vm.form.subramo.subramo_code == 15){
              if ( !vm.form.subforms.contract.business_activity){
                l.stop();
                toaster.error('Agrega el giro de la empresa');
                return;
              }
              if(!vm.form.subforms.contract.employee_name){
                l.stop();
                toaster.error('Agrega el nombre del empleado');
                return;
              }
              if(!vm.form.subforms.contract.activity){
                l.stop();
                toaster.error('Agrega la actividad');
                return;
              }
              if(vm.form.subforms.contract.deductible_percentage != 0){
                if(!vm.form.subforms.contract.deductible_percentage){
                  l.stop();
                  toaster.error('Agrega el deducible');
                  return;
                }
              }
          }

          var ben_flag = false;
          vm.form.subforms.beneficiaries_fianza.forEach(function(beneficiario){
            if(beneficiario.type_person == 1){
              if (beneficiario.first_name  == '' ){
                l.stop();
                toaster.error('Ingrese campo de nombre')
                ben_flag = true;                  
              }
              
              // if (beneficiario.rfc  == '' ){
              //   toaster.error('Ingrese campo de RFC')
              //   ben_flag = true;
              // }
              
              beneficiario.last_name
              beneficiario.email
              beneficiario.phone_number  == ''
              beneficiario.j_name = '';

            } 
            else{
              if (beneficiario.j_name  == '' ){
                l.stop();
                toaster.error('Ingrese campo de razon social')
                ben_flag = true;                  
              }
              // if (beneficiario.rfc  == '' ){
              //   toaster.error('Ingrese campo de RFC')
              //   ben_flag = true;
              // }
              beneficiario.first_name = '';
              beneficiario.last_name = '';
              beneficiario.email  == '';
              beneficiario.phone_number  == '' ;
            }
          });

          if(ben_flag)return;
          
          try{
            if (vm.form.subforms.contract.amount){
              var val = parseFloat($scope.formatearNumero_calculate(vm.form.subforms.contract.amount)).toFixed(2);

              if (val == 'NaN') {              
                l.stop();
                toaster.error('Revise el formato del Monto del Contrato.');
                return; 
              }
            }
          }
          catch(err){
            console.log('idddddddd',err)
          }
          try{
            var val = parseFloat($scope.formatearNumero_calculate(vm.form.subforms.contract.guarantee_amount)).toFixed(2);
            if (val == 'NaN') {              
              l.stop();
              toaster.error('Revise el formato del Monto a Garantizar.');
              return; 
            }
          }
          catch(err){
            console.log('idddddddd',err)
          }
          var payload = {
              "address": vm.form.address.url,
              "aseguradora": vm.form.afianzadora.url,
              "clave": vm.form.clave.url,
              "comision": 0,
              "comision_percent": 0,
              "contract_poliza": 
              {
                "start": vm.form.subforms.contract.start != '' ? vm.form.subforms.contract.start : null,
                "end": vm.form.subforms.contract.end != '' ? vm.form.subforms.contract.end : null,
                "number": vm.form.subforms.contract.number != '' ? vm.form.subforms.contract.number : 0,
                "contract_object": vm.form.subforms.contract.contract_object != '' ? vm.form.subforms.contract.contract_object : 0,
                "amount": vm.form.subforms.contract.amount ? parseFloat($scope.formatearNumero_calculate(vm.form.subforms.contract.amount)).toFixed(2) : 0,
                "amount_iva": vm.form.subforms.contract.amount_iva != '' ? vm.form.subforms.contract.amount_iva : null,
                "guarantee_percentage": vm.form.subforms.contract.guarantee_percentage ? vm.form.subforms.contract.guarantee_percentage : 0,
                "guarantee_amount": vm.form.subforms.contract.guarantee_amount ? parseFloat($scope.formatearNumero_calculate(vm.form.subforms.contract.guarantee_amount)).toFixed(2) : 0,
                "rate": vm.form.subforms.contract.rate ? vm.form.subforms.contract.rate : 0,
                "sign_date": vm.form.subforms.contract.sign_date != '' ? vm.form.subforms.contract.sign_date : null,
                "activity": vm.form.subforms.contract.activity != '' ? vm.form.subforms.contract.activity : null,
                "business_activity": vm.form.subforms.contract.business_activity != '' ? vm.form.subforms.contract.business_activity : null,
                "employee_name": vm.form.subforms.contract.employee_name != '' ? vm.form.subforms.contract.employee_name : null,
                "no_employees": vm.form.subforms.contract.no_employees != '' ? vm.form.subforms.contract.no_employees : null,
                "description": vm.form.subforms.contract.description != '' ? vm.form.subforms.contract.description : null,
                "deductible_percentage": vm.form.subforms.contract.deductible_percentage ? vm.form.subforms.contract.deductible_percentage : 0,
              },
              "emision_status": 1,
              "end_of_validity": vm.form.end_of_validity,
              "fianza_type": vm.form.tipo ? vm.form.tipo.url : null,
              "folio": vm.form.folio,
              // "natural":( vm.form.contratante && vm.form.contratante.value.type_person && vm.form.contratante.value.type_person == 'Fisica' ) ? vm.form.contratante.value.url : null ,
              // "juridical":( vm.form.contratante && vm.form.contratante.value.type_person && vm.form.contratante.value.type_person == 'Moral' ) ? vm.form.contratante.value.url : null ,
              "contractor": vm.form.contratante.value.url,
              "ramo": vm.form.ramo.url,
              "recibos_poliza": [],
              "start_of_validity": vm.form.start_of_validity,
              "status": vm.form.status,
              "subramo": vm.form.subramo.url,
              "beneficiaries_poliza" : [],
              "beneficiaries_poliza_many" : [],
              "ref_policy" : [],
              "observations" :vm.form.observations,
              "is_renewable": vm.form.renewal ? vm.form.renewal.selected : 2,
              "f_currency": vm.form.currency ? vm.form.currency.currency_selected : 1,
              'bono_variable': vm.form.bono_variable ? vm.form.bono_variable : 0,
              "date_emision_factura": vm.form.date_emision_factura ? datesFactory.toDate(vm.form.date_emision_factura ): null,
              "date_maquila": vm.form.date_maquila ? datesFactory.toDate(vm.form.date_maquila ): null,
              "date_bono": vm.form.date_bono ? datesFactory.toDate(vm.form.date_bono ): null,
              "year_factura": vm.form.year_factura ? vm.form.year_factura: 0,
              "month_factura": vm.form.month_selected ? vm.form.month_selected : 0,
              "folio_factura": vm.form.folio_factura ? vm.form.folio_factura : '',
              "maquila": vm.form.maquila ? parseFloat(vm.form.maquila).toFixed(2) : 0,
              "exchange_rate": vm.form.exchange_rate ? parseFloat(vm.form.exchange_rate).toFixed(2) : 0,
              "fecha_entrega": vm.form.fecha_entrega ? datesFactory.toDate(vm.form.fecha_entrega ): null,
          }
          try{
            payload.start_of_validity = datesFactory.toDate(vm.form.start_of_validity);
          }
          catch(err){
            l.stop();
            toaster.error('Revise la fecha de inicio');
            return; 
          }
          try{
            payload.end_of_validity = datesFactory.toDate(vm.form.end_of_validity);
          }
          catch(err){
            l.stop();
            toaster.error('Revise la fecha de inicio');
            return; 
          }

          if (vm.form.subramo.subramo_code == 20 || vm.form.subramo.subramo_code == 21){
            try{
              payload.contract_poliza['end'] = datesFactory.toDate(vm.form.subforms.contract['end']);
              payload.contract_poliza['start'] = datesFactory.toDate(vm.form.subforms.contract['start']);
              payload.contract_poliza['sign_date'] = datesFactory.toDate(vm.form.subforms.contract['sign_date']);
            }
            catch(err){
              l.stop();
              toaster.error('Revise las fechas del contrato');
              return; 
            }
          } 
          else{ 
              payload.contract_poliza['end'] = new Date();
              payload.contract_poliza['start'] = new Date();
              payload.contract_poliza['sign_date'] = new Date();
          }


          var nombres = [];
          vm.form.subforms.beneficiaries_fianza.forEach(function(beneficiario){
            var ref = {
                    "email": beneficiario.email,
                    "first_name": beneficiario.first_name,
                    "full_name": beneficiario.first_name + ' ' + beneficiario.last_name + ' ' + beneficiario.second_last_name,
                    "j_name": beneficiario.j_name,
                    "last_name": beneficiario.last_name,
                    "type_person": beneficiario.type_person,
                    "phone_number": beneficiario.phone_number,
                    "rfc": beneficiario.rfc,
                    "second_last_name": beneficiario.second_last_name,
                    "id": beneficiario.id ? beneficiario.id:null,
                    "url": beneficiario.url ? beneficiario.url:null,
                }
            payload["beneficiaries_poliza_many"].push(ref);
            if(beneficiario.type_person == 1){
              nombres.push(beneficiario.first_name + '_' + beneficiario.last_name + '_' + beneficiario.second_last_name);
            }
            else{
              nombres.push(beneficiario.j_name);
            }
          });

          var bname = vm.form.ramo.ramo_name;
          if (nombres.length > 0)bname = nombres[0];           
          payload['identifier'] = vm.form.subramo.subramo_name + '_' + bname + '_' + payload['contract_poliza']['description']
          if (payload['identifier'].length >= 500){
            payload['identifier'] = payload['identifier'].substring(0,500);
          }

          if(vm.form.referenciadores){
            vm.form.referenciadores.forEach(function(referenciador){
              if(referenciador.referenciador){
                var ref = {
                    "referenciador": referenciador.referenciador,
                    "comision_vendedor": referenciador.comision_vendedor ? referenciador.comision_vendedor : 0,
                }
                payload["ref_policy"].push(ref);
              }
            });
          }
          if(payload['ref_policy'].length==0 && vm.acceso_obligatorio_ref){
            l.stop();
            SweetAlert.swal("Error", "Seleccione al menos un referenciador", "error");
            return   ;
          }


          var recibo = {};
          if (vm.form.status != 1){
            try{
              recibo = angular.copy($scope.dataToSave.recibos_poliza[0]);
            }
            catch(err){
              console.log(err);
              l.stop();
              SweetAlert.swal('Error', 'Genere el recibo de la fianza', 'error');
              return;
            }
            payload['poliza_number'] = vm.form.poliza_number;
            payload['folio'] = vm.form.folio;
            payload['emision_date']   = datesFactory.toDate(vm.form.emision_date);
            
            try {
              recibo['vencimiento'] = datesFactory.toDate(recibo['vencimiento']);
              recibo['fecha_inicio'] = datesFactory.toDate(recibo['startDate']);
              recibo['fecha_fin'] = datesFactory.toDate(recibo['endingDate']);
            }
            catch(err){}

            payload['recibos_poliza'] = [recibo];


            payload['comision'] = recibo.comision;
            payload['derecho'] = recibo.derecho;
            payload['iva'] = recibo.iva;
            payload['p_neta'] = recibo.prima_neta;
            payload['p_total'] = recibo.prima_total;
            payload['rpf'] = recibo.rpf;
            payload['sub_total'] = recibo.sub_total;
            payload['comision_percent'] = $scope.dataToSave.comision_percent;
            
          }

          // if(recibo.fecha_inicio < payload.start_of_validity || recibo.fecha_inicio > payload.end_of_validity){
          //   toaster.error('La fecha de inicio del recibo está fuera de la vigencia de la fianza');
          //   return;
          // }

          // if(recibo.fecha_fin < payload.start_of_validity || recibo.fecha_fin > payload.end_of_validity){
          //   toaster.error('La fecha de fin del recibo está fuera de la vigencia de la fianza');
          //   return;
          // }

          
          if (vm.form.status != 1 && payload['recibos_poliza'] && payload['recibos_poliza'].length <= 0){
            l.stop();
            SweetAlert.swal('Error', 'Debe generar primer recibo', 'error');
            return;
          }

          if (vm.form.status != 1 && new Date() >= payload['start_of_validity'] && new Date() < payload['end_of_validity']){
            payload['status'] = 14;
          }

          if (new Date() > payload['end_of_validity']){
            payload['status'] = 13;
          }

          payload.programa_de_proveedores_contractor = $scope.programa_contractor ? $scope.programa_contractor : null;
          payload.has_programa_de_proveedores = $scope.has_programa_de_proveedores ? true : false;
  
          if($rootScope.from_task && $rootScope.task_associated && $rootScope.task_associated.url){
            payload.from_task=$rootScope.from_task
            payload.task_associated=$rootScope.task_associated.id
          }
          $http.post(url.IP + 'fianzas/', payload).then(function(response){
            if (response.status == 201){
              if($rootScope.from_task && $rootScope.task_associated && $rootScope.task_associated.url){
                $http.patch($rootScope.task_associated.url,{'ot_model':1, 'ot_id_reference':response.data.id});
              }
              if($scope.countFile > 0){
                $scope.param = response.data;
                uploadFiles(response.data['id']);
              }else{
                if(response.data.poliza_number){
                  l.stop();
                  SweetAlert.swal('¡Listo!', 'Fianza creada exitosamente.', 'success');
                  $localStorage['save_created_fianza'] = {};
                  $state.go('fianzas.info', {polizaId: response.data['id']});
                }
                if(!response.data.poliza_number){
                  l.stop();
                  SweetAlert.swal('¡Listo!', 'Proyecto de fianza creado exitosamente.', 'success');
                  $localStorage['save_created_fianza'] = {};
                  $state.go('fianzas.info', {polizaId: response.data['id']});
                }
              }
            }
            else{
              l.stop();
              SweetAlert.swal('Error', 'Ocurrio un problema', 'error');
              return;
            }
          });
          // $http.patch(vm.form.contratante.value.url, {'email':vm.form.contratante.email, 'phone_number': vm.form.contratante.phone_number});



      }


      function cancel() {
          $localStorage['save_created_fianza'] = {};
          $state.go('fianzas.list');
      }

      var uploader = $scope.uploader = new FileUploader({
          headers: {
              'Authorization': 'Bearer ' + token,
              'Accept': 'application/json'
          },
      });

      // uploader.filters.push({
      //     name: 'customFilter',
      //     fn: function(item, options) {
      //         return this.queue.length < 20;
      //     }
      // });
      $scope.countFile = 0;
      $scope.okFile = 0;
      // ALERTA SUCCES UPLOADFILES
      uploader.onSuccessItem = function(fileItem, response, status, headers) {
        $scope.okFile++;
        if($scope.okFile == $scope.uploader.queue.length){
          $timeout(function() {
            if($scope.param.poliza_number){
              SweetAlert.swal('¡Listo!', 'Fianza creada exitosamente.', 'success');
            }
            if(!$scope.param.poliza_number){
              SweetAlert.swal('¡Listo!', 'Proyecto de Fianza creado exitosamente.', 'success');
            }
            $state.go('fianzas.info', {polizaId: $scope.param.id})
          }, 1000);
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
        // fileItem.file.name = fileItem.file.name.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '')
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
        if ($scope.uploader.queue.length == 0) {
          $state.go('fianzas.info', {polizaId: poliza});
        }else{
          uploadFiles(poliza);
        }
      }

      function uploadFiles(polizaId) {
        $scope.polizaId = polizaId;
        $scope.userInfo = {
          id: polizaId
        };
        $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
        $timeout(function(){
          $scope.uploader.uploadAll();    
          $localStorage['save_created_fianza'] = {};
        }, 1000); 
      }

      $scope.matchesShows = function(parWord){
        if(parWord) {
          if(parWord.length >= 3) {
            if(vm.org_name =='ancora'){
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

      $scope.$watch("vm.contratante.value",function(newValue, oldValue){
        if(vm.contratante){
          if(vm.contratante.value.address_contractor){
            if(vm.contratante.value.address_contractor){
              $scope.programa_contractor = vm.contratante.value.url;
              $scope.has_programa_de_proveedores = true;
            }
          }
        }
      });
      
  }
})();