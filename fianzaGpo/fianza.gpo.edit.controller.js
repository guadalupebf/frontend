(function() {
  'use strict';

  angular.module('inspinia')
      .controller('FianzasColectividadesEditCtrl', FianzasColectividadesEditCtrl);

  FianzasColectividadesEditCtrl.$inject = ['$localStorage','$sessionStorage', '$scope', 'FileUploader', 'providerService', '$http', 'url', 
                                           '$state', 'dataFactory', 'SweetAlert', 'MESSAGES', '$stateParams', 'helpers','datesFactory'];

  function FianzasColectividadesEditCtrl($localStorage, $sessionStorage, $scope, FileUploader, providerService, $http, url, $state, dataFactory,
                                         SweetAlert, MESSAGES, $stateParams, helpers,datesFactory) {

    /* Información de usuario */
    var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
    
    var order = this;
    $scope.dataToSave = {
      recalcular: true
    }
    order.org_name = usr.org;
    order.renewal = {};
    order.renewal.options = [
        {'value':1,'label':'Renovable'},
        {'value':2,'label':'No Renovable'},
    ];
    $scope.currencys= [
        {'value':1,'label':'Pesos'},
        {'value':2,'label':'Dólares'},
    ];
    $scope.month={};
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

    $scope.surety = {};
    $scope.showPF = true;
    $scope.claveSelected = {};
    $scope.addresses = [];
    $scope.categories_delete = [];
    $scope.create_natural = true;
    $scope.create_juridical = true;

    $scope.years=[]
    var actualYear = new Date().getFullYear();
    var oldYear = actualYear - 80;
    for (var i = actualYear + 10; i >= oldYear; i--) {
      $scope.years.push(i);
    }
    order.accesos = $sessionStorage.permisos
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
            }
          })
        }else if (perm.model_name == 'Reportes') {
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
        }else if(perm.model_name == 'Ordenes de trabajo'){
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
        }else if (perm.model_name == 'Contratantes y grupos') {
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
        }else if(perm.model_name == 'Archivos'){
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
      })
    }
    $scope.options = {}
    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1; //Months are zero based
    var curr_year = d.getFullYear();
    var date = curr_year + "-" + curr_month + "-" + curr_date;
    providerService.getProviderFiByKey(date)
      .then(function(data) {
        $scope.providers = data.data;
    });

    $scope.referenciadorArray = [];
    $scope.directiveReceipts = [];
    $scope.beneficiaries = [];
    
    activate();

    $scope.checkFechaFactura = function (date) {
      var date_initial = (date).split('/');
      var day = date_initial[0];
      var month = date_initial[1];
      var year = parseInt(date_initial[2]);
      $scope.month.month_selected = parseInt(month)
      $scope.surety.year_factura = year
    };
    function activate(){
      dataFactory.post('information_collectivesurety/', {caratula: $stateParams.polizaId})
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          if($localStorage.save_edition_fianza_coletiva){
            if($localStorage.save_edition_fianza_coletiva['id'] == response.data.data.collectivitySurety.id){
              $scope.surety = $localStorage.save_edition_fianza_coletiva;
            }else{
              $scope.surety = response.data.data.collectivitySurety;
            }
          }else{
            $scope.surety = response.data.data.collectivitySurety;
          }
          $scope.copy_surety = angular.copy($scope.surety);
          if($scope.copy_surety.poliza_number){
            $scope.showPF = false;
          }

          $scope.receipts_surety = [];
          $scope.copy_surety.recibos_poliza.forEach(function(receipt){
            if(receipt.receipt_type == 1){
              $scope.receipts_surety.push(receipt);
            }
          });

          $scope.surety.contract_poliza.guarantee_amount = parseFloat($scope.surety.contract_poliza.guarantee_amount);
          $scope.surety.contract_poliza.rate = parseFloat($scope.surety.contract_poliza.rate);
          $scope.surety.contract_poliza.poliza = $scope.surety.id;

          if($localStorage.save_edition_fianza_coletiva && $localStorage.save_edition_fianza_coletiva['categories']){
            if($localStorage.save_edition_fianza_coletiva['id'] == response.data.data.collectivitySurety.id){
              $scope.categories = $localStorage.save_edition_fianza_coletiva['categories'];
            }else{
              $scope.categories = response.data.data.childs;
            }
          }else{
            $scope.categories = response.data.data.childs;
          }
          $scope.categories.forEach(function(f){
            f.deductible = parseInt(f.deductible);
          });


          order.renewal.is_renewable = $scope.surety.is_renewable;
          $scope.dataToSave.is_renewable =  $scope.surety.is_renewable;
          $scope.startDate = convertDate($scope.surety.start_of_validity);
          $scope.endDate = convertDate($scope.surety.end_of_validity);
          if($scope.surety.emision_date == null || $scope.surety.emision_date == 'NaN/NaN/NaN'){
            $scope.surety.emision_date = convertDate(new Date());
          }else{
            $scope.surety.emision_date = convertDate($scope.surety.emision_date);
          }
          fillProvider();

          $scope.aseguradoraSelected = $scope.surety.aseguradora;
          $scope.getClaves($scope.aseguradoraSelected, 1);
          $scope.currencySelected = $scope.surety.f_currency;
          $scope.month.month_selected =$scope.surety.month_factura;
          $scope.year_factura =$scope.surety.year_factura;
          $scope.surety.date_emision_factura =$scope.surety.date_emision_factura ? convertDate($scope.surety.date_emision_factura): '';
          $scope.surety.date_bono =$scope.surety.date_bono ? convertDate($scope.surety.date_bono): '';
          $scope.surety.date_maquila =$scope.surety.date_maquila ? convertDate($scope.surety.date_maquila): '';
          // Contacto
          var json_address = [];
          order.contacto.value = $scope.surety.contractor;
          order.contacto.val = $scope.surety.contractor.full_name;
          $scope.addressSelected = $scope.surety.address;
          // contacto end

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
          })
          .catch(function(e){
            console.log('error', e);
          });
          // Referenciadores
          if($scope.surety.ref_policy){
            if($scope.surety.ref_policy.length > 0){
              $scope.surety.ref_policy.forEach(function(refs){
                $http.get(refs.referenciador.url).then(function success(response_ref_plicy){
                  if(response_ref_plicy){
                    refs.data = response_ref_plicy.data;
                    refs.referenciador = response_ref_plicy.data.url;
                    refs.selectedRef = true;
                    $scope.referenciadorArray.push(refs);
                  }
                })
            });
            }
          }
          else{
            $scope.referenciadorArray.push($scope.referenciador)
          }
          // Referenciadores---

          // Recibos
          $scope.directiveReceipts.domiciliado = false;
          $scope.directiveReceipts.payment = 5;
          $scope.directiveReceipts.startDate = $scope.startDate;
          $scope.directiveReceipts.endingDate = $scope.endDate;
          $scope.dataToSave.receipts = $scope.receipts_surety;
          $scope.dataToSave.receipts.forEach(function(receipt){
            receipt.startDate = convertDate(receipt.fecha_inicio);
            receipt.endingDate = convertDate(receipt.fecha_fin);
            receipt.vencimiento = convertDate(receipt.vencimiento);
            if(receipt.status != 4){
              $scope.dataToSave.recalcular = false;
            }else{}
          });
          $scope.dataToSave.numeroRecibos = $scope.dataToSave.receipts.length;
          $scope.dataToSave.subramo = $scope.surety.subramo;
          $scope.dataToSave.poliza = {
            primaNeta: parseFloat($scope.surety.p_neta),
            rpf: parseFloat($scope.surety.rpf),
            derecho: parseFloat($scope.surety.derecho),
            iva: parseFloat($scope.surety.iva),
            subTotal: $scope.surety.sub_total,
            primaTotal: $scope.surety.p_total,
          }
          var date1 = new Date($scope.surety.start_of_validity);
          var date2 = new Date($scope.surety.end_of_validity);
          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          $scope.directiveReceipts.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // $scope.beneficiaries = $scope.surety.beneficiaries_poliza_many;
          $scope.surety.beneficiaries_poliza_many.forEach(function(item){
            var data = {
              email: item.email,
              first_name: item.first_name,
              full_name: item.full_name,
              id: item.id,
              j_name: item.j_name,
              last_name: item.last_name,
              owner: item.owner,
              phone_number: item.phone_number,
              // poliza: item.poliza,
              rfc: item.rfc,
              second_last_name: item.second_last_name,
              type_person: item.type_person,
              url: item.url,
              workstation: item.workstation
            }
            $scope.beneficiaries.push(data)
          });

          $scope.showPrograma = $scope.surety.has_programa_de_proveedores;
          if($scope.surety.programa_de_proveedores_contractor){
            if($scope.surety.programa_de_proveedores_contractor){
              $scope.url_solidario = $scope.surety.programa_de_proveedores_contractor;
            }
            $http.get($scope.url_solidario)
            .then(function(request) {

              order.contratante = {};
              if(request.data.address_contractor){
                order.contratante.val = request.data.full_name;
                order.contratante.value = request.data;
              }
            });
          }
        }
      })
      .catch(function (e) {
        console.log('error - colectivo fianza - catch', e);
      });
    };

    $scope.save_info_tab = function(){
      $localStorage.save_edition_fianza_coletiva = angular.copy($scope.surety);
    }

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

    $scope.checkNumPolicy = function () {
      if($scope.surety.poliza_number){
        if($scope.copy_surety.poliza_number != $scope.surety.poliza_number){
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
      }
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
      }
    };

    function convertDate(inputFormat){
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    };

    function toDate(dateStr){
      if(dateStr){
        var dateString = dateStr; // Oct 23
        var dateParts = dateString.split("/");
        var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).toISOString(); // month is 0-based
        return dateObject;
      }
    };

    $scope.getClaves = function(param, value){
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

                if(value == 1){
                  $scope.subramosTypes.forEach(function(item){
                    if(item.url == $scope.surety.fianza_type.url){
                      $scope.subramoTypeSelected = item;
                    }
                  });
                }

                $scope.directiveReceipts.subramo = subramo;
                $scope.dataToSave.subramo = subramo;

                var comisiones = [];
                if($scope.claveSelected.clave_comision){
                  if($scope.claveSelected.clave_comision.length){
                    $scope.claveSelected.clave_comision.forEach(function(item){
                      if(param.subramo_name == item.subramo) {
                        comisiones.push(item);
                      }
                    });
                  }
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

    $scope.changeClave = function(param){
      if(param){
        $scope.surety.clave = param.url;
        $scope.claveSelected = param;
      }
    };

    $scope.changeSubramoType = function(param){
      if(param){
        $scope.surety.fianza_type = param.url;
        if(!$localStorage.save_edition_fianza_coletiva){
          $localStorage.save_edition_fianza_coletiva = angular.copy($scope.surety);
        }
        $localStorage.save_edition_fianza_coletiva['fianza_type'] = param;
      }
    };

    $scope.changeCurrency = function(param){
      $scope.surety.f_currency = param;
      if(!$localStorage.save_edition_fianza_coletiva){
        $localStorage.save_edition_fianza_coletiva = angular.copy($scope.surety);
      }
      $localStorage.save_edition_fianza_coletiva['f_currency'] = param;
    };

    // Contacto contratante
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
        // if(order.contacto.value.address_natural || order.contacto.value.address_juridical){
        if(order.contacto.value.address_contractor){
          $scope.surety.contractor = order.contacto.value.url;
          if(order.contacto.value.address_contractor[0].id){
            $scope.addresses = order.contacto.value.address_contractor;
          }else{
            order.contacto.value.address_contractor.forEach(function(address){
              $http.get(address).then(function(addressResponse){
                $scope.addresses.push(addressResponse.data);
              });
            });
          }
          if($scope.addresses.length == 1){
            $scope.addressSelected = $scope.addresses[0];
            $scope.surety.address = $scope.addresses[0];
          }
        }
      }
    });

    $scope.changeAddress = function(param){
      $scope.surety.address = param;
    };

    $scope.valuePercentageRate = function(item){
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

    $scope.deleteCategorie = function(index,item){
      if (item.id){
        SweetAlert.swal({
          title: 'Información',
          text: "La Categoría y sus Certificados se eliminarán por completo",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Aceptar",
          cancelButtonText: "Cancelar",
          closeOnConfirm: true
        }, function(isConfirm) {
            if (isConfirm) {                    
              $scope.categories.splice($scope.categories.indexOf(item),1);
              $scope.categories_delete.push(item)
            }
        });
      }
      else{
        $scope.categories.splice($scope.categories.indexOf(item),1);
      }      
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
      if(!$localStorage.save_edition_fianza_coletiva){
        $localStorage.save_edition_fianza_coletiva = angular.copy($scope.surety);
      }
      $localStorage.save_edition_fianza_coletiva['categories'] = $scope.categories;
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
          $scope.benecifiarieSelected = {};
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
        $scope.benecifiarieSelected = {};
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
        // poliza: null,
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

    $scope.matchesShows = function(parWord){
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
            'poliza': true,
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

    $scope.changeProgram = function(param){
      $scope.showPrograma = param;
    };

    $scope.validityInsurance = function(){
      if(!$scope.showPF){
        if(!$scope.surety.poliza_number){
          SweetAlert.swal("Error", MESSAGES.ERROR.POLICYNOREQUIRED, "error");
          return;
        }
        if(!$scope.dataToSave.receipts){
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRECEIPTS, "error");
          return;
        }
      }
      if(!$scope.aseguradoraSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.PROVIDERREQUIRED, "error");
        return;
      }
      if(!$scope.claveSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
        return;
      }
      if(!$scope.ramoSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
        return;
      }
      if(!$scope.subramoSelected){
        SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
        return;
      }
      if(!$scope.subramoTypeSelected){
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
        SweetAlert.swal("Error", "Agrega la tarifa.", "error");
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
      $scope.surety.beneficiaries_poliza_many.forEach(function(item, index){
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
      $scope.referenciadorArray.forEach(function(item){
        $scope.referenciadoresSelected = [];
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
        $scope.saveEditionSurety();
      }
    };

    $scope.renewalSelection = function(ren) {
      $scope.dataToSave.is_renewable = order.renewal.is_renewable;
      if(!$localStorage.save_edition_fianza_coletiva){
        $localStorage.save_edition_fianza_coletiva = angular.copy($scope.surety);
      }
      $localStorage.save_edition_fianza_coletiva['is_renewable'] = ren;
    };

    $scope.saveEditionSurety = function(){
      $scope.suretyEdition = {}
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();

      $scope.referenciadorArrayNew = [];
      $scope.referenciadorArray.forEach(function(item, index){
        if(item.referenciador != ""){
          $scope.referenciadorArrayNew.push(item);
        }
      });

      $scope.suretyEdition.poliza_number = $scope.surety.poliza_number ? $scope.surety.poliza_number : null;
      $scope.suretyEdition.start_of_validity = $scope.startDate ? toDate($scope.startDate) : null;
      $scope.suretyEdition.end_of_validity = $scope.endDate ? toDate($scope.endDate) : null;
      $scope.suretyEdition.emision_date = $scope.surety.emision_date ? toDate($scope.surety.emision_date) : null;
      $scope.suretyEdition.aseguradora = $scope.aseguradoraSelected.url;
      $scope.suretyEdition.clave = $scope.claveSelected.url;
      $scope.suretyEdition.fianza_type = $scope.subramoTypeSelected.url;
      $scope.suretyEdition.fecha_cancelacion = $scope.surety.fecha_cancelacion ? $scope.surety.fecha_cancelacion : null;
      $scope.suretyEdition.monto_cancelacion = $scope.surety.monto_cancelacion ? $scope.surety.monto_cancelacion : 0;
      $scope.suretyEdition.f_currency = $scope.surety.f_currency;
      $scope.suretyEdition.contractor = order.contacto.value.full_name ? order.contacto.value.url : null;
      $scope.suretyEdition.address = $scope.surety.address.url;
      $scope.suretyEdition.document_type = 8;
      $scope.suretyEdition.forma_de_pago = 5;
      $scope.suretyEdition.identifier = $scope.surety.identifier;
      $scope.suretyEdition.status = $scope.surety.status;
      $scope.suretyEdition.bono_variable = $scope.surety.bono_variable ? parseFloat($scope.surety.bono_variable).toFixed(2) : 0;
      if($scope.dataToSave.recibos_poliza){
        $scope.suretyEdition.p_neta = $scope.dataToSave.p_neta ? $scope.dataToSave.p_neta : 0;
        $scope.suretyEdition.rpf = $scope.dataToSave.rpf ? $scope.dataToSave.rpf : 0;
        $scope.suretyEdition.derecho = $scope.dataToSave.derecho ? $scope.dataToSave.derecho : 0;
        $scope.suretyEdition.sub_total = $scope.dataToSave.sub_total ? $scope.dataToSave.sub_total : 0;
        $scope.suretyEdition.iva = $scope.dataToSave.iva ? $scope.dataToSave.iva : 0;
        $scope.suretyEdition.p_total = $scope.dataToSave.p_total ? $scope.dataToSave.p_total : 0;
        $scope.suretyEdition.comision = $scope.dataToSave.comision ? $scope.dataToSave.comision : 0;
        $scope.suretyEdition.comision_percent = $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0;
      }else if($scope.dataToSave.poliza.num_receipts){
        $scope.suretyEdition.p_neta = $scope.dataToSave.poliza.primaNeta ? $scope.dataToSave.poliza.primaNeta : 0;
        $scope.suretyEdition.rpf = $scope.dataToSave.poliza.rpf ? $scope.dataToSave.poliza.rpf : 0;
        $scope.suretyEdition.derecho = $scope.dataToSave.poliza.derecho ? $scope.dataToSave.poliza.derecho : 0;
        $scope.suretyEdition.sub_total = $scope.dataToSave.poliza.subTotal ? $scope.dataToSave.poliza.subTotal : 0;
        $scope.suretyEdition.iva = $scope.dataToSave.poliza.iva ? $scope.dataToSave.poliza.iva : 0;
        $scope.suretyEdition.p_total = $scope.dataToSave.poliza.primaTotal ? $scope.dataToSave.poliza.primaTotal : 0;
        $scope.suretyEdition.comision = $scope.dataToSave.comision ? $scope.dataToSave.comision : 0;
        $scope.suretyEdition.comision_percent = $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0;
      }
      $scope.suretyEdition.total_receipts = $scope.dataToSave.recibos_poliza ? $scope.dataToSave.recibos_poliza.length : 0;
      $scope.suretyEdition.beneficiaries_poliza = $scope.beneficiaries;
      $scope.suretyEdition.beneficiaries_poliza_many = $scope.beneficiaries;
      $scope.suretyEdition.contract_poliza = $scope.surety.contract_poliza;
      $scope.suretyEdition.ref_policy = $scope.referenciadorArrayNew;
      $scope.suretyEdition.is_renewable = order.renewal ? $scope.dataToSave.is_renewable : order.renewal.selected;

      // $scope.suretyEdition.programa_de_proveedores_contractor = $scope.programa_contractor ? $scope.programa_contractor : null;
      // $scope.suretyEdition.has_programa_de_proveedores = $scope.has_programa_de_proveedores ? true : false;

      if($scope.showPrograma){
        $scope.suretyEdition.has_programa_de_proveedores = true;
        $scope.suretyEdition.programa_de_proveedores_contractor = $scope.programa_contractor ? $scope.programa_contractor : null;
      }else{
        $scope.suretyEdition.has_programa_de_proveedores = false;
        $scope.suretyEdition.programa_de_proveedores_contractor = null;
      }

      $scope.suretyEdition.date_emision_factura = $scope.surety.date_emision_factura ? datesFactory.toDate($scope.surety.date_emision_factura ): null,
      $scope.suretyEdition.date_bono = $scope.surety.date_bono ? datesFactory.toDate($scope.surety.date_bono ): null,
      $scope.suretyEdition.date_maquila = $scope.surety.date_maquila ? datesFactory.toDate($scope.surety.date_maquila ): null,
      $scope.suretyEdition.year_factura = $scope.surety.year_factura ? $scope.surety.year_factura : 0,
      $scope.suretyEdition.month_factura =  $scope.month ? $scope.month.month_selected : 0,
      $scope.suretyEdition.folio_factura = $scope.surety.folio_factura ? $scope.surety.folio_factura : '',      
      $scope.suretyEdition.maquila = $scope.surety.maquila ? parseFloat($scope.surety.maquila).toFixed(2) : 0,
      $scope.suretyEdition.exchange_rate =  $scope.surety.exchange_rate ? parseFloat($scope.surety.exchange_rate).toFixed(2) : 0,
      $http.patch($scope.surety.url, $scope.suretyEdition)
      .then(function(response){
        if(response.status == 200 || response.status == 201){
          $scope.dataSurety = response.data;
          //recibos
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
                  status: 4,
                  fecha_inicio: toDate($scope.dataToSave.recibos_poliza[index].startDate),
                  fecha_fin: toDate($scope.dataToSave.recibos_poliza[index].endingDate),
                  vencimiento: toDate($scope.dataToSave.recibos_poliza[index].vencimiento),
                }

                $http.patch(item.url, object).then(function(req){

                });
              }
            });
          };
          //contrato
          if($scope.surety.contract_poliza){
            var contract = {
              guarantee_amount: $scope.surety.contract_poliza.guarantee_amount,
              rate: $scope.surety.contract_poliza.rate,
              activity: $scope.surety.contract_poliza.activity,
              no_employees: $scope.surety.contract_poliza.no_employees,
              description: $scope.surety.contract_poliza.description
            }
            $http.patch($scope.surety.contract_poliza.url, contract).then(function(req){

            });
          }
          // Referenciadores
          for(var i=0; i<$scope.referenciadorArray.length; i++){
            var dataRef = {
              referenciador: $scope.referenciadorArray[i].url,
              policy: $scope.dataSurety.url, 
              comision_vendedor: $scope.referenciadorArray[i].comision_vendedor ? $scope.referenciadorArray[i].comision_vendedor : 0
            }
            if($scope.referenciadorArray[i].url){
              $scope.referenciador_a_cambiar = $scope.referenciadorArray[i].data;
              var dataRef11 = {
                comision_vendedor: $scope.referenciadorArray[i].comision_vendedor ? parseFloat($scope.referenciadorArray[i].comision_vendedor).toFixed(2) : 0,
                referenciador: $scope.referenciadorArray[i].referenciador
              }
              $http.patch($scope.referenciadorArray[i].url, dataRef11).then(
                function success(request){
                },
                function error(error) {
                  if(dataRef11.referenciador){
                    var ref =dataRef11
                    ref.policy = $scope.dataSurety.url
                    dataFactory.post('referenciadores-involved/',ref)
                    .then(
                      function success(request){
                        $scope.ref_cambiado = request.data;
                        var params = {
                          'model': 13,
                          'event': "POST",
                          'associated_id': $scope.dataSurety.id,
                          'identifier': "cambio el Referenciador: "+$scope.referenciador_a_cambiar.first_name +" "+$scope.referenciador_a_cambiar.last_name+" por "+$scope.ref_cambiado.ref_name
                        }
                        dataFactory.post('send-log/', params).then(function success(response) {  
                        });
                      },
                      function error(error) {
                        console.log('6*',error);
                      })
                    .catch(function(e){
                      console.log('7*',e);
                    });
                  }
                })
              .catch(function(e){
                console.log('2',e);
              });
            }else{
              if($scope.referenciadorArray[i].referenciador){
                var ref = {}
                ref.referenciador = $scope.referenciadorArray[i].referenciador
                ref.comision_vendedor = $scope.referenciadorArray[i].comision_vendedor ? parseFloat($scope.referenciadorArray[i].comision_vendedor).toFixed(2) : 0
                ref.policy = $scope.dataSurety.url
                dataFactory.post('referenciadores-involved/',ref)
                .then(
                  function success(request){
                  },
                  function error(error) {
                    console.log('3',error);
                  })
                .catch(function(e){
                  console.log('4',e);
                });
              }
            }
          }
          //categorias
          $scope.categories.forEach(function(item, index){
            if(item.url){
              var category = {
                name: item.name,
                deductible: item.deductible,
                observations: item.observations
              }
              $http.patch(item.url, category)
              .then(function(request){
                if(request.status == 200 || request.status == 201){
                  
                }
              })
              .catch(function(e){
                l.stop();
                console.log('error - caratula -cats catch', e);
              });
            }else{
              var json_category = [];
              var category = {
                caratula: $scope.surety.id,
                name: $scope.categories[index].name,
                deductible: $scope.categories[index].deductible,
                observations: $scope.categories[index].observations,
                document_type: 9,
                parent: $scope.surety.id
              }
              json_category.push(category);
              $http.post(url.IP + 'categories_collectivesurety/', json_category)
              .then(function(request){
                if(request.status == 200 || request.status == 201){

                }
              })
              .catch(function(e){
                l.stop();
                console.log('error - caratula -cats post catch', e);
              });                
            }
            if ($scope.categories_delete.length >0) {
              $scope.categories_delete.forEach(function(it){
                var cat1 = {
                  status: 0
                }
                $http.patch(it.url, cat1)
                .then(function(responseC){
                  if(responseC.status == 200 || responseC.status == 201){
                    it.certificados.forEach(function(cc){
                      var cat1 = {
                        status: 0,
                        certificado_inciso_activo: false
                      }
                      $http.patch(cc.url, cat1)
                      .then(function(resp){
                        if(resp.status == 200 || resp.status == 201){
                        }
                      })
                      .catch(function(e){
                        l.stop();
                        console.log('error - caratula -cats catch', e);
                      });

                    });
                  }
                })
                .catch(function(e){
                  l.stop();
                  console.log('error - caratula -cats catch', e);
                });

              })
            }
          });
          // Beneficiarios
          if ($scope.surety.beneficiaries_poliza_many) {
             $scope.beneficiaries.forEach(function(item, index){              
              if (item.url){
                item.poliza = $scope.dataSurety.url;
                $http.patch(item.url, item)
                .then(function(request){
                  if(request.status == 200 || request.status == 201){

                  }
                })
                .catch(function (e) {
                  l.stop();
                  console.log('error - caratula ben- catch', e);
                });
              }
              // else{
              //   item.poliza = $scope.dataSurety.url;
              //   item.poliza_many = $scope.dataSurety.id;
              //   $http.post(url.IP + 'beneficiaries_contract_policy/', item)
              //   .then(function(beneficiariess){
              //     if(beneficiariess.status == 200 || beneficiariess.status == 201){

              //     }
              //   })
              //   .catch(function (e) {
              //     l.stop();
              //     console.log('error - caratula - ben postcatch', e);
              //   });                
              // }
            });
          }
          var params = {
            'model': 13,
            'event': "POST",
            'associated_id': $scope.dataSurety.id,
            'identifier': $scope.dataSurety.poliza_number ? " actualizó la fianza colectiva." : " actualizó el proyecto de fianza."
          }
          dataFactory.post('send-log/', params).then(function success(response){

          });
          SweetAlert.swal("¡Listo!", "La fianza se actualizó correctamente.", "success");
          $state.go('fianzas.details', {polizaId: $scope.dataSurety.id});
        }else{
          l.stop()
        }
      })
      .catch(function (e) {
        l.stop();
        console.log('error - caratula -gral catch', e);
      });
    };

    // Referenciadores
    $scope.addReferenciador = function(type) {
      var addReferenciadores = {
        referenciador: $scope.referenciador ? $scope.referenciador : ""
      };
      $scope.referenciadores.push(addReferenciadores);
    }

    $scope.changeReferenciador = function(ref){
      if(ref){
        if(ref.data){
          if (ref.data.url != ref.referenciador){
            $http.get(ref.referenciador).then(function success(c){
              var subBranchsComisions = c.data.user_info.info_vendedor[0].vendedor_subramos;
              subBranchsComisions.forEach(function(sr){
                if(((sr.subramo == order.form.subramo.subramo_code) && (sr.provider == order.form.aseguradora.id)) || ((sr.subramo == 0) && (sr.provider == 0))) {
                  ref.comision_vendedor = sr.comision;
                }else{
                  ref.comision_vendedor = 0;
                }
              })
            })
          }
          if (ref.data.url == ref.referenciador) {
            $http.get(ref.referenciador).then(function success(c){
              var subBranchsComisions = c.data.user_info.info_vendedor[0].vendedor_subramos;
              subBranchsComisions.forEach(function(sr){
                if(((sr.subramo == order.form.subramo.subramo_code) && (sr.provider == order.form.aseguradora.id)) || ((sr.subramo == 0) && (sr.provider == 0))) {
                  ref.comision_vendedor = sr.comision;
                }else{
                  ref.comision_vendedor = ref.data.comision_policy;
                }
                })
            })
          }
        }
      }
      if (ref.referenciador){
        ref.selectedRef = true
      }else{
        ref.selectedRef = false
      }
    }

    $scope.deleteReferenciador = function(param, index) {
      if(param.url){
        SweetAlert.swal({
        title: "Eliminar Referenciador",
        text: "Los cambios no podrán revertirse, ¿Estás seguro?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si",
        cancelButtonText: "No"
        },
        function(isConfirm){
          if(isConfirm){
            $scope.referenciadorArray.forEach(function(item){
              if(item.url){
                if(param.url == item.url){
                  $http.delete(param.url);
                  $scope.referenciadorArray.splice(index, 1);
                  $scope.referenciadoresSelected.splice(index, 1);
                }
              }
            });
          }
        });
      }else{
        $scope.referenciadorArray.splice(index, 1);
      }
    }

    $scope.cancel = function(){
      $state.go('fianzas.details', {polizaId: $scope.surety.id});
    }

  }
})();