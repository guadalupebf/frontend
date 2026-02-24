(function(){
  'use strict'

  angular.module('inspinia')
      .controller('RenovacionesModalCtrl', RenovacionesModalCtrl);

  RenovacionesModalCtrl.$inject = ['$location','packageService','datesFactory','models','ContratanteService','$q','$http','tiposBeneficiarios', 'sex', 'FileUploader','formService','$timeout',
                                'url', '$localStorage', '$scope', '$filter', 'groupService', 'providerService', 'insuranceService', 'receiptService', 'generalService',
                                'toaster', 'formaPago', 'helpers', 'MESSAGES', 'fileService','SweetAlert', '$sessionStorage', '$state', '$stateParams', 'formatValues',
                                'coverageService', 'dataFactory','$rootScope', 'emailService','$uibModal','appStates','$sce','CondicionesGeneralesService'];

  function RenovacionesModalCtrl($location,packageService,datesFactory, models, ContratanteService,$q,$http,tiposBeneficiarios, sex, FileUploader, formService,$timeout, url, $localStorage,
                            $scope, $filter, groupService, providerService, insuranceService, receiptService, generalService, toaster, formaPago, helpers, MESSAGES,
                            fileService,SweetAlert, $sessionStorage, $state, $stateParams, formatValues, coverageService, dataFactory,$rootScope, emailService, $uibModal,appStates,$sce,CondicionesGeneralesService) {

    function getRenewalDraft() {
      return angular.copy($rootScope.renewalDraftPolicy) || null;
    }

    var order = this;

    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var decryptedToken = sjcl.decrypt('Token', $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    $scope.orgName = usr.orgname;
    order.f_currency = {};
    order.f_currency.f_currency_selected = 1;
    order.f_currency.options = [
        {'value':1,'label':'PESOS'},
        {'value':2,'label':'DOLARES'},
        {'value':3,'label':'UDI'},
    ];

    order.conducto_de_pago={};
    order.conducto_de_pago.options = [
        {'value':1,'label':'No domiciliada'},
        {'value':2,'label':'Agente'},
        {'value':3,'label':'CAC'},
        {'value':4,'label':'CAT/Domiciliado'},
        {'value':5,'label':'Nómina'},
        {'value':6,'label':'CUT'},
    ]
    
    $scope.disabled_ot = false
    order.renewal = {};
    // https://miurabox.atlassian.net/browse/DES-875
    $scope.es_renovacion=true;//era false
    // https://miurabox.atlassian.net/browse/DES-875
    $scope.esEdicion=false;
    order.renewal.is_renewable = 1;
    order.renewal.options = [
        {'value':1,'label':'Renovable'},
        {'value':2,'label':'No Renovable'},
    ];
    order.businessline = [
        {'id':1,'name':'Comercial'},
        {'id':2,'name':'Personal'},
        {'id':0,'name':'Otro'},
    ];
    order.types = [
        {'id':1,'name':'Automóvil'},
        {'id':2,'name':'Motocicleta'},
        {'id':3,'name':'Tracto'},
        {'id':4,'name':'Autobús'},
        {'id':5,'name':'Pick Up'},
        {'id':6,'name':'Camiones hasta 1.5 ton'},
        {'id':7,'name':'Chofer app'},
        {'id':8,'name':'Remolque'},
        {'id':9,'name':'Camiones + 1.5 ton'},
    ]

    order.types_gm = [
      {'id':46,'name':'Familiar'}
    ];
    order.types_ap = [
      {'id':64,'name':'Viajero'},
      {'id':46,'name':'Familiar'}
    ];

    order.types_life = [
      {'id':47,'name':'Ahorro'},
      {'id':48,'name':'Vitalicia'},
      {'id':49,'name':'Temporal/Protección'},
    ];

    order.types_incendio = [
      {'id':1,'name':'Familiar'},
      {'id':2,'name':'Casa Habitación'},
      {'id':3,'name':'Condominio'},
      {'id':4,'name':'Edificio'},
      {'id':5,'name':'Empresarial'},
      {'id':6,'name':'Múltiple Empresarial'},
      {'id':10,'name':'Sólo Incendio'},
    ];

    order.types_myt = [
      {'id':46,'name':'Avión'},
      {'id':47,'name':'Avioneta'},
      {'id':48,'name':'Barco'},
      {'id':49,'name':'Buque'},
      {'id':9,'name':'Declaración'},
      {'id':50,'name':'Dron'},
      {'id':51,'name':'Embarcación de Placer'},
      {'id':7,'name':'Específica'},
      {'id':52,'name':'Helicóptero'},
      {'id':35,'name':'Otro'},
      {'id':8,'name':'Pronóstico'}
    ];

    order.types_ayc = [
      {'id':11,'name':'Animales'},
      {'id':12,'name':'Cultivo'},
    ];
    order.types_credito = [
      {'id':13,'name':'Crédito general'},
    ];
    order.types_vivienda = [
      {'id':14,'name':'Crédito a la Vivienda'},
    ];
    order.types_garantia = [
      {'id':15,'name':'Documentos que sean objeto de oferta pública o de intermediación en mercados de valores'},
      {'id':16,'name':'Emisores de Valores'},
      {'id':17,'name':'Títulos de Crédito'},
    ];
    order.types_rc = [
      {'id':18,'name':'Administración'},
      {'id':19,'name':'Arquitectos'},
      {'id':20,'name':'Aviones'},
      {'id':21,'name':'Barcos'},
      {'id':22,'name':'Contratista'},
      {'id':23,'name':'Crime'},
      {'id':24,'name':'Cyber (Protección de datos)'},
      {'id':25,'name':'D&O (Consejeros y Funcionarios)'},
      {'id':26,'name':'E&O Miscelaneos'},
      {'id':27,'name':'Empresarial'},
      {'id':28,'name':'Eventos'},
      {'id':29,'name':'Familiar/Condominal'},
      {'id':30,'name':'Hole in One'},
      {'id':31,'name':'Ingeniería'},
      {'id':32,'name':'Instituciones Financieras'},
      {'id':33,'name':'Lineas Financieras'},
      {'id':34,'name':'Médicos'},
      {'id':35,'name':'Otro'},
    ];
    order.types_tyorc = [
      {'id':36,'name':'Riesgos Catastróficos'},
    ];
    order.types_diversos = [
      {'id':37,'name':'Calderas y Recipientes Sujetos a Presión'},
      {'id':38,'name':'Dinero y Valores'},
      {'id':39,'name':'Eq. Contratistas y Maquinaria pesada'},
      {'id':40,'name':'Eq. Electrónico'},
      {'id':41,'name':'Montaje de Maquinaria'},
      {'id':42,'name':'Obra Civil en Contrucción'},
      {'id':43,'name':'Obra Civil Terminada'},
      {'id':44,'name':'Rotura de Cristales'},
      {'id':45,'name':'Rotura de Maquinaria'},
      {'id':35,'name':'Otro'},
      {'id':63,'name':'Terrorismo y Sabotaje'},
    ];
    order.types_lf = [
      {'id':53,'name':'CRIME/BBB'},
      {'id':54,'name':'D&O'},
      {'id':55,'name':'FIPI'},
      {'id':56,'name':'CYBER'},
      {'id':57,'name':'VCAPS'},
      {'id':58,'name':'RCP MÉDICA'},
      {'id':59,'name':'E&O MISCELANEO'},
      {'id':60,'name':'RIESGO POLITICO'},
      {'id':61,'name':'RC SERVIDORES PUBLICOS'},
      {'id':62,'name':'RCP'}
    ];
    order.procedencia = [
        {'id':1,'name':'Residente'},
        {'id':2,'name':'Turista'},
        {'id':3,'name':'Legalizado'},
        {'id':4,'name':'Fronterizo'},
    ]
    order.charge_type = [
        {'id':1,'name':'A'},
        {'id':2,'name':'B'},
        {'id':3,'name':'C'},
    ]

    $scope.sex = [
      { name: 'MASCULINO', value: 'M' },
      { name: 'FEMENINO', value: 'F' }
    ];

    $scope.usages = [
      {'id':1,'name':'PARTICULAR'},
      {'id':2,'name':'CARGA'},
      {'id':3,'name':'SERVICIO PÚBLICO'},
    ]

    $scope.is_edition = false;
    $scope.nenewal = true;
    $scope.newCoverPack = false;
    $scope.ceder_comision = false;

    $scope.celulas = [];
    $scope.agrupaciones = [];
    $scope.sub_asignaciones = [];
    $scope.sub_subasignaciones = [];

    $scope.infoUser = $sessionStorage.infoUser;

    var stuffLoaded = 0;
    var thingsToLoad = 0;
    $scope.reload = false;
    $scope.dateOut  = false;
    $scope.referenciadores = []
    $scope.lecturaPDF= function(){
      $scope.es_renovacion=true;
    }
    $scope.addReferenciador = function(type) {
      var addReferenciadores = {
        referenciador: $scope.referenciador
      };
      $scope.referenciadores.push(addReferenciadores);
    }
    $scope.changeReferenciador = function(ref) {
      if (ref) {
        if (ref.data) {
          if (ref.data.url != ref.referenciador) {
            $http.get(ref.referenciador).then(function success(c) {
              var subBranchsComisions = c.data.user_info.info_vendedor[0].vendedor_subramos
              subBranchsComisions.forEach(function(sr) {
                if (((sr.subramo == order.form.subramo.subramo_code) && (sr.provider == order.form.aseguradora.id)) || ((sr.subramo == 0) && (sr.provider == 0))) {
                  ref.comision_vendedor = sr.comision; 
                }else{
                  ref.comision_vendedor = 0
                }
                })
            })
          }
          if (ref.data.url == ref.referenciador) {
            $http.get(ref.referenciador).then(function success(c) {
              var subBranchsComisions = c.data.user_info.info_vendedor[0].vendedor_subramos
              subBranchsComisions.forEach(function(sr) {
                if (((sr.subramo == order.form.subramo.subramo_code) && (sr.provider == order.form.aseguradora.id)) || ((sr.subramo == 0) && (sr.provider == 0))) {
                  ref.comision_vendedor = sr.comision; 
                }else{
                  ref.comision_vendedor = ref.data.comision_policy
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
    $scope.changeComRef = function(com){
      if (com.comision_vendedor > 100) {
        com.comision_vendedor = 0;
      } else if (com.comision_vendedor < 0) {
        com.comision_vendedor = 0;
      }
      $scope.checkTotalComision(com);
    }
    $scope.checkTotalComision = function(item) {
      var totalComision = $scope.referenciadores.reduce(function(sum, item) {
        return sum + (parseFloat(item.comision_vendedor) || 0); // Convert to number, default to 0 if undefined
      }, 0);
      if (totalComision > 100) {
        $scope.comisionError = "La suma de las comisiones no puede superar el 100%";
        item.comision_vendedor = 0
      } else {
        $scope.comisionError = null; // No error if total is within limit
      }
    };
    $scope.deleteReferenciador = function(index, ref) {
      SweetAlert.swal({
      title: "¿Estás seguro?",
      text: "Los cambios no podrán revertirse",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
      },
      function(isConfirm){
        if (isConfirm) {
          if (index && ref.url) {
            // if(ref.url){
            //   $http.delete(ref.url);
            // }
            $scope.referenciadores.splice(index, 1);
          }else{
            // if(ref.url){
            //   $http.delete(ref.url);
            // }
            $scope.referenciadores.splice(index, 1);
          }
        }
      });       
    }

    $scope.checkDateValues = function (values) {
      var date1 = datesFactory.toDate((order.form.startDate));
      var date2 = datesFactory.toDate((values));
      $scope.dateOut  = false;
      if (date1 > date2) {
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATERANGE, "error")
        $scope.dateOut  = true;
        return;
      }else{
        $scope.dateOut  = false;
      }
    };
    
    var storedPolicy = $stateParams.myInsurance;
    if (!storedPolicy || storedPolicy === 'some default') {
      storedPolicy = getRenewalDraft();
    }
    $scope.poliza_data = storedPolicy || {};

    if ($scope.poliza_data && $scope.poliza_data.id) {
      $http({
        method: 'GET',
        url: url.IP + 'historic-policies/',
        params: {
          actual_id: $scope.poliza_data.id
        }
      }).then(function success(response) {
      if(response.data.results.length){
        vm.showHistoric = true;
      }
      vm.policy_history = [];
      vm.policy_history.renovada = [];
      response.data.results.forEach(function function_name(old) {
        if($scope.poliza_data.id != old.base_policy.id){
          vm.policy_history.push(old.base_policy);
        } else if(old.new_policy){
          vm.policy_history.push(old.new_policy);
        }
        if($scope.poliza_data.id == old.base_policy.id){
          vm.policy_history.renovada.push(old.base_policy);
        } 
      })
      vm.policy_history.forEach(function(old) {
        if(old.status == 1){
          SweetAlert.swal("Información","La póliza ya tiene una OT de renovación", "info");
          if ($scope.poliza_data.document_type == 1) {
            //$state.go('polizas.info', {polizaId: $scope.poliza_data.id})      
            gopolicieinfo($scope.idPolicy,$scope.poliza_data);
          }else if ($scope.poliza_data.document_type == 3) {
            $state.go('colectividades.info', {polizaId: $scope.poliza_data.id})
          }
        }
      });
      vm.policy_history.renovada.forEach(function(renovada) {
        if(renovada.status == 12){
          SweetAlert.swal("Información","La póliza ya ha sido renovada", "info");
          if ($scope.poliza_data.document_type == 1) {
            //$state.go('polizas.info', {polizaId: $scope.poliza_data.id})         
            gopolicieinfo($scope.idPolicy,$scope.poliza_data);
          }else if ($scope.poliza_data.document_type == 3) {
            $state.go('colectividades.info', {polizaId: $scope.poliza_data.id})
          }
        }
      });
      })
    }
    // -------------
    $scope.show_receipts = true;
    var myInsurance = null;
    // $scope.poliza_data = null;
    order.insuranceObject = {};
    order.user = usr;
    order.show = {
        ot: false,
        receipt: false,
        generateReceipts: false,
        receiptsGenerated: false,
        firstTab: true,
        showForms: false,
        showCoverages: false,
        isPolicy: false,
    };

    var vm = $scope.vm = {
      files : []
    }

    order.disabled = {
      startDate : false,
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

    order.form = {
        canCreate: false,
        contratante: {},
        poliza: '',
        internal_number: '',
        folio: '',
        ramo: '',
        type: '',
        subramo: '',
        aseguradora: '',
        paquete: '',
        ceder_comision: false,
        payment: '',
        startDate: new Date(),
        endingDate: new Date().setYear(new Date().getFullYear() + 1),
        vendor : '',
        domiciliado: false, 
        business_line : 0
    };

    order.subforms = {
      auto: {},
      life: {
        beneficiariesList: [],
        aseguradosList: []
      },
      disease: {
        relationshipList: []
      },
      damage: {
        coinsurance: '',
        insured_item: '',
        item_address: '',
        item_details: ''
      }
    };

    var renovationDraft = {};

    function resetRenovationDraft(){
      renovationDraft = {};
    }

    function hasRenovationDraft(){
      return renovationDraft && Object.keys(renovationDraft).length > 0;
    }

    function ensureRenovationDraft(){
      if(!hasRenovationDraft()){
        renovationDraft = angular.copy(order.form) || {};
      }
      return renovationDraft;
    }

    order.defaults = {
      sex: angular.copy(sex),
      years: [],
      policyUrl: {},
      contractors: [],
      providers: [],
      ramos: [],
      subramos: [],
      packages: [],
      coverages: [],
      formInfo: {},
      coverageInPackage: {},
      payform: angular.copy(formaPago),
      getContractorsByGroup: function() {
      }
    };

    order.autocomplete = autocomplete;
    order.ceder_comision = ceder_comision; 
    order.getInternalNumber = getInternalNumber;
    // Crear paquetes
    $scope.createPackRen = true;
    $scope.changeComision = function(event, backspace) {

      var len_value = String(order.form.give_comision).length;
      var value = parseFloat(order.form.give_comision); 
      
      if(value > 100) {
        order.form.give_comision = 100;
      }
    };

    $scope.matchesContractors = function(parWord) {
      $scope.contractors_data = 0;
      var word_data = order.form.contratante.val;
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
          .then(function(response){
            if(response.status === 200 ) {

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
    }

    function getmatches(word) {
      $http.post(url.IP+ 'cars-match/', {'matchWord':word})
      .then(function(response){
        var source=[];
        response.data.forEach(function(cars){
          var obj = {
            label: cars.car_search ,
            value: cars
          }
          source.push(obj)
        });
        $scope.autocompleteCarsData = source;
      });
    }

    function autocomplete(param){
      try{
        if(param.val.length >1 ){
          getmatches(param.val);
        }
      }
      catch(e){}
    };

    /* Watchs */
    $scope.$watch('order.subforms.auto.selectedCar.val', function(newValue, oldValue) {
      try{
        order.subforms.auto.brand = order.subforms.auto.selectedCar.val.value.car_brand;
        order.subforms.auto.model = order.subforms.auto.selectedCar.val.value.car_model;
        order.subforms.auto.version = order.subforms.auto.selectedCar.val.value.short_description.replace(order.subforms.auto.selectedCar.val.value.car_model,'');
      }
      catch(e){}
    });

    $scope.$watch('order.form.subramo', function(newValue, oldValue) {
      if(order.form.subramo){
        get_claves();

        try{
          if(parseFloat(order.form.comision_percent) != parseFloat(order.form.clave.comission) || parseFloat(order.form.udi) != parseFloat(order.form.clave.udi) ){
            order.form.ceder_comision = true;
            ceder_comision(false);
          }
        }
        catch(e){
          if((order.form.comision_percent) != (order.form.clave.comission) || (order.form.udi) != (order.form.clave.udi) ){
            order.form.ceder_comision = true;
            ceder_comision(false);
          }
        }
      }
    });

    $scope.$watch('order.form.contratante.value', function(newValue, oldValue) {
      if(order.form.contratante.value) {
        if (order.form.contratante.value && order.form.contratante.value.address_contractor) {
          order.defaults.address = order.form.contratante.value.address_contractor
        }
        if (order.form.contratante.value && order.form.contratante.value.value && order.form.contratante.value.value.address_contractor) {
          order.defaults.address = order.form.contratante.value.value.address_contractor
        }
        if (order.form.contratante.value.phone_number){
          order.form.contratante.phone_number = order.form.contratante.value.phone_number
        }

        try{
          if(order.defaults.address.length == 1){
            order.form.address = order.defaults.address[0];
          }
        }

        catch (err) {

        }

        if (order.form.contratante.value.email){
          order.form.contratante.email = order.form.contratante.value.email
        }
      }
    });

    $scope.$watch('order.defaults.coverages',function(newValue, oldValue){
      newValue.forEach(function(coverage){
        coverage.deductible_coverage_parsed = [];
        coverage.sums_coverage_parsed = [];
        coverage.policy = order.insuranceObject.id;
        if (coverage.deductible_coverage) {
          coverage.deductible_coverage.forEach(function(deductible){
              var obj = {
                  label: deductible.deductible,
                  value: deductible.deductible
              }
              coverage.deductible_coverage_parsed.push(obj);
          });          
        }
        if (coverage.sums_coverage) {
          coverage.sums_coverage.forEach(function(suma){
            var obj = {
                label: suma.sum_insured,
                value: suma.sum_insured
            }
            coverage.sums_coverage_parsed.push(obj);
          });          
        }
      });
    });

    $scope.percentageRange = function(input, index){
      if(input < 0){
        order.defaults.coverages[index].coinsuranceInPolicy.value = 0;
      };
      if(input > 100){
        order.defaults.coverages[index].coinsuranceInPolicy.value = 100;
      };
    }

    /* Funciones */
    order.options = {
      checkDate: function(param) {
        if(param) {
          if (order.form.startDate =='Invalid Date') {
            if(myInsurance){
              order.form.startDate = myInsurance.start_of_validity
            }else{
              order.form.startDate = convertDate(new Date())              
            }
          }
          var date = new Date(order.form.startDate);
          var curr_date = date.getDate();
          var curr_month = date.getMonth() + 1; //Months are zero based
          var curr_year = date.getFullYear();
          var d = curr_year + "-" + curr_month + "-" + curr_date;
          var init_format = curr_month + "/" + curr_date + "/"+ curr_year;
      
          date = new Date(init_format);
          if (d != 'Invalid Date' && d !='NaN-NaN-NaN') {
            providerService.getProviderByKey(d)
            .then(function success(data) {
                order.defaults.providers = data.data;
              },
              function error(err) {
                console.log('error', err);
              });            
          }

          order.form.endingDate = new Date(date.setYear(date.getFullYear() + 1));
          if(order.form.aseguradora){
            get_claves();
          }
       
          order.form.startDate = new Date(init_format);
          order.form.endingDate = convertDate(order.form.endingDate);
          order.form.start_of_validity = new Date(init_format);
          order.form.end_of_validity = new Date(mesDiaAnio(order.form.endingDate));
          order.form.startDate = convertDate(order.form.startDate);
        } else {
          if(order.form.startDate.length == 10) {
            var x = mesDiaAnio(order.form.startDate);
            var date = new Date(x);

            var curr_date = date.getDate();
            var curr_month = date.getMonth() + 1; //Months are zero based
            var curr_year = date.getFullYear();
            var d = curr_year + "-" + curr_month + "-" + curr_date;
            providerService.getProviderByKey(d)
              .then(
                function success(data) {
                  order.defaults.providers = data.data;
                },
                function error(err) {
                  console.log('error', err);
                }
            )
            .catch(function(e) {
              console.log('e', e);
            });

            order.form.endingDate = new Date(date.setYear(date.getFullYear() + 1));
            if(order.form.aseguradora){
              get_claves();
            }

            order.form.startDate = new Date(x);
            order.form.endingDate = convertDate(order.form.endingDate);
            order.form.start_of_validity = new Date(x);
            order.form.end_of_validity = new Date(mesDiaAnio(order.form.endingDate));

            order.form.startDate = convertDate(order.form.startDate);
          }
        } 

        if (order.form.startDate == 'Invalid Date' || order.form.startDate =='NaN-NaN-NaN' || order.form.startDate =='NaN/NaN/NaN') {
          if(myInsurance && order.form.start_of_validity){
            order.form.startDate =convertDate(order.form.start_of_validity)
          }else{
            order.form.startDate = convertDate(new Date())              
          }        }else{
          
        }
        if (order.form.endingDate == 'Invalid Date' || order.form.endingDate =='NaN-NaN-NaN' || order.form.endingDate == 'NaN/NaN/NaN') {
          if(myInsurance && order.form.end_of_validity){
            order.form.endingDate =convertDate(order.form.end_of_validity)
          }else{
            order.form.endingDate = convertDate(new Date())              
          }
        }else{
          
        }
        $scope.calcularDias();
      },
      showPoliceCreator: function() {
        if (order.defaults.showReceipts === false) {
          return true;
        }
        return false;
      },
      hideTabs: function(param) {
        order.show.firstTab = param ? true : false;
        var total=0.0;
        var subtotal=0.0;
        order.receipts.forEach(function(elem){
          primaNeta+=parseFloat(elem.prima);
          derecho+=parseFloat(elem.derecho);
          rpf+=parseFloat(elem.rpf);
          total+=parseFloat(elem.total);
          subtotal+=parseFloat(elem.subTotal);
        });
        order.poliza.primaNeta=primaNeta;
        order.poliza.derecho=derecho.toFixed(3);
        order.poliza.rpf=rpf.toFixed(3);
        order.poliza.primaTotal=total;
        order.poliza.subTotal=subtotal;
      },
      changeProvider: function(obj) {
        order.form.aseguradora = obj;        
        if (obj) {
          get_claves();
          var wait =[]
          wait.push($http.get(url.IP+'ramos-by-provider/'+order.form.aseguradora.id));
          $q.all(wait).then(function(response) {
            order.defaults.ramos = response[0].data;
            if($scope.ramo_code){
              order.defaults.ramos.forEach(function(item) {
                if(item.ramo_code == $scope.ramo_code){
                  order.form.ramo = item
                  item.subramo_ramo.forEach(function(subr) {
                    if($scope.subramo_code){
                      if(subr.subramo_code == $scope.subramo_code){
                        order.defaults.subramos  = item.subramo_ramo
                        order.form.subramo = subr;    
                        order.defaults.formInfo = {
                          code: order.form.subramo.subramo_code,
                          name: order.form.subramo.subramo_name
                        };   
                        order.show.showForms = true;
                        $http.post(url.IP+'paquetes-data-by-subramo/',{
                          'ramo':order.form.ramo.id,
                          'subramo': order.form.subramo.id,
                          'provider':  order.form.aseguradora.id
                        }).then(function(paquetes) {
                          order.defaults.packages = paquetes.data;
                        });               
                        
                      }                      
                    }
                  });
                }
              });
            }
          });
        } else {
          order.defaults.ramos = [];          
        }
        order.options.changeRamo(undefined);
      },
      changeClave: function(parClave) {
        order.defaults.comisiones = [];
        console.log('order.defaults.111',parClave)
        order.form.clave = parClave;
        get_claves();
      },
      changeRamo: function(obj) {
        order.form.ramo = obj;
        if(obj){
            order.defaults.subramos = obj.subramo_ramo;
        }else{
            order.form.ramo = "";
            order.defaults.subramos = [];

        }
        order.options.changeSubramo(undefined);
      },
      changeSubramo: function(obj) {
          order.form.subramo = obj;
          if (obj) {
            if(order && order.form && order.form.ramo && order.form.ramo.ramo_code && order.form.ramo.ramo_code==2){
              order.subforms.disease.policy_type=46
            }
            order.defaults.forms = obj.forms_subramo;
            order.defaults.waitElement=[];
            order.defaults.waitElement.push(
            $http.post(url.IP+'paquetes-data-by-subramo/',{
              'ramo':order.form.ramo.id,
              'subramo': obj.id,
              'provider':  order.form.aseguradora.id
            }).then(function(paquetes) {
              order.defaults.packages = paquetes.data;
            }))
            order.show.showForms = true;
            order.defaults.formInfo = {
              code: obj.subramo_code,
              name: obj.subramo_name
            };
          } else {
            order.defaults.forms = undefined;
            order.defaults.packages = [];
            order.show.showForms = false;
            order.defaults.formInfo = {
              code: undefined,
              name: undefined
            };
          }
          order.options.changePackage(undefined);
      },
      changePackage: function(obj) {
        order.form.paquete = obj;
        $scope.newCoverPack = true;
        if (obj) {
          order.defaults.coverages = [];
          order.defaults.coverageList = [];

          obj.coverage_package.forEach(function(element, index) {
            if (element.default) {
              order.defaults.coverages.push(angular.copy(element));
            } else {
            }
          order.defaults.coverageList.push(angular.copy(element));
          });
          order.show.showCoverages = true;
        } else {
          order.defaults.coverages = [];
          order.show.showCoverages = false;
        }
      },
      isReceiptAvailable: function(payment) {
        order.form.payment = payment;
        order.receipts = [];
        if (payment && order.form.poliza) {
            toaster.success('Ya puede generar sus recibos');
        }
      },
      deleteCoverage: function(obj, index) {
        if(usr.permiso.eliminar){
          order.defaults.coverages.splice(index, 1);
          var cl =order.defaults.coverageList;
          var flag =false;

          for(var i = 0 ;i<cl.length;i++){
            if(cl[i].id === obj.id){
              flag = true;
            }
          }
          if(!flag){
            order.defaults.coverageList.push(obj);
          }
        }
        else{
          SweetAlert.swal("Oops...", "No tienes permiso para eliminar registros", "error");
        }
      },
      addCoverage: function(obj) {
        var dfd= $q.defer();
        var delCoverage = order.defaults.coverages.length > 0 ? false : true;
        var wait = []
        wait.push($http.get(obj.url))
        $q.all(wait).then(function(coverage) {

          coverage.forEach(function(cvg) {
            dfd.resolve(cvg)
            var cvgCopy =cvg.data;

            if(cvgCopy.id == obj.id) {
              if(!cvgCopy.coinsuranceInPolicy && obj.coinsuranceInPolicy) {

                var coaseguro_ = obj.coinsuranceInPolicy;
                
                if(coaseguro_.search('{') >= 0) {
                  var json = JSON.stringify(eval("(" + coaseguro_ + ")"));
                  var test = JSON.parse(json);

                  cvgCopy.coinsuranceInPolicy =  {
                    value : test.value
                  };

                  obj.coinsuranceInPolicy =  {
                    value : test.value
                  };

                } else {
                  obj.coinsuranceInPolicy = {
                    value: parseInt(coaseguro_)
                  };

                  obj.coinsuranceInPolicy =  {
                    value : parseInt(coaseguro_)
                  };
                }           

              } else if(cvgCopy.coinsuranceInPolicy && obj.coinsuranceInPolicy) {

              }

              // ---------
              if(!cvgCopy.topeCoinsuranceInPolicy && obj.topeCoinsuranceInPolicy) {

                var topecoaseguro_ = obj.topeCoinsuranceInPolicy;
                
                if(topecoaseguro_.search('{') >= 0) {
                  var json = JSON.stringify(eval("(" + topecoaseguro_ + ")"));
                  var test = JSON.parse(json);

                  cvgCopy.topeCoinsuranceInPolicy =  {
                    value : test.value
                  };

                  obj.topeCoinsuranceInPolicy =  {
                    value : test.value
                  };

                } else {
                  obj.topeCoinsuranceInPolicy = {
                    value: topecoaseguro_
                  };

                  obj.topeCoinsuranceInPolicy =  {
                    value : topecoaseguro_
                  };
                }               

              } else if(cvgCopy.topeCoinsuranceInPolicy && obj.topeCoinsuranceInPolicy) {

              }
            }

            for (var i = order.defaults.coverages.length - 1; i >= 0; i--) {
              if (order.defaults.coverages[i].coverage_name === obj.coverage_name) {
                order.defaults.coverageList.forEach(function(coverage) {
                  if (coverage.coverage_name == obj.coverage_name){
                    order.defaults.coverageList.splice(order.defaults.coverageList.indexOf(coverage), 1);
                  }
                })
                delCoverage = false;
                break;
              } else {
                delCoverage = true;
              }
            };
            if (delCoverage) {
              order.defaults.coverages.push(obj);
              order.defaults.coverageList.forEach(function(coverage) {
                if (coverage.coverage_name == obj.coverage_name){
                  order.defaults.coverageList.splice(order.defaults.coverageList.indexOf(coverage), 1);
                }
              })

              cvgCopy.deductible_coverage_parsed = [];
              cvgCopy.sums_coverage_parsed = [];

              try{
                cvgCopy.deductible_coverage.forEach(function(deductible) {
                  var obj = {
                    label: deductible.deductible,
                    value: deductible.deductible
                  }
                  cvgCopy.deductible_coverage_parsed.push(obj);
                });

                cvgCopy.sums_coverage.forEach(function(suma) {
                  var obj = {
                    label: suma.sum_insured,
                    value: suma.sum_insured
                  }
                  cvgCopy.sums_coverage_parsed.push(obj);
                });
              }
              catch(e){}
            };

            order.defaults.coverageInPackage = "";
            return dfd.promise;

          })

        });
      },
      life: {
        beneficiary: {
          add: function(beneficiary) {
            // var beneficiary = {
            //   person: 1
            // };
            if (beneficiary) {
              order.subforms.life.beneficiariesList.push(beneficiary);
            }else{
               order.subforms.life.beneficiariesList.push(models.beneficiary());
            }
          },
          // add: function() {
            // var beneficiary = angular.copy(order.subforms.life.beneficiaries);
            // if (helpers.beneficiariesPercentageGreaterThanZero(order.subforms.life.beneficiariesList)) {
            //     SweetAlert.swal("Error", MESSAGES.ERROR.GREATERTHAN100, "error")
            //     // toaster.info('No puede tener un porcentaje mayor a 100%.');
            //     return
            // } else {
            //     order.subforms.life.beneficiariesList.push(models.beneficiary());
            // }
          // },
          destroy: function(index) {
              order.subforms.life.beneficiariesList.splice(index, 1);
          }
        },
        asegurados: {
          add: function(asegs) {
            if (asegs) {
              order.subforms.life.aseguradosList.push(asegs);
            }else{
              order.subforms.life.aseguradosList.push(models.asegurados());
            }
          },
          destroy: function(index) {
              order.subforms.life.aseguradosList.splice(index, 1);
          }
        }
      },
      disease: {
        relationships: {
          add: function(relacion) {
              if (relacion) {
                  order.options.disease.relationships.selectType(relacion.relationship,null);
                  order.subforms.disease.relationshipList.push(relacion);
              }else{
                var relacion = {
                    first_name: "",
                    last_name: "",
                    second_last_name: "",
                    birthdate: null,
                    antiguedad: null,
                    sex: null,
                    relationship: null,
                    accident: null
                };
                order.subforms.disease.relationshipList.push(relacion);
              }
          },
          destroy: function(index, rel) {
              order.subforms.disease.relationshipList.splice(index, 1);
          },
          selectType: function(newValue, old){
            var oldValue = old != "" ? JSON.parse(old) : null;
            var newIndex = -1;

            order.options.disease.types.some(function(valueData,index){
                if(valueData.relationship == newValue.relationship){
                    newIndex = index;
                    return true;
                }
            });
            var oldIndex = -1;


            if(newValue.relationship == 1 || newValue.relationship == 2) {// titular y conyugue
              order.options.disease.types[newIndex].disabled = true
            }

            if(oldValue){

              order.options.disease.types.some(function(val,index){
                if(val.relationship == oldValue.relationship){
                  oldIndex = index;
                  return true;
                }
              });

              if(oldValue.relationship == 1 || oldValue.relationship == 2) {// titular y conyugue
                order.options.disease.types[oldIndex].disabled = false
              }
            }
          }
        },
        /* 1-Titular, 2-Conyuge, 3-Hijo */
        types: angular.copy(tiposBeneficiarios)
      }
    };

    /* Vendedores */
    $scope.changeVendedor = function(vendedor) {  
      $scope.users.some(function(user) {
        if (vendedor.id == user.id){
          var vendedor_info = user.user_info.info_vendedor[0]
          if (vendedor_info.vendedor_subramos.length == 0){

            SweetAlert.swal('Error','El vendedor no tiene comisión en el subramo actual','error');
            order.form.vendor = $scope.original_vendor;
            return
          }

          var flag = false;              
          var vendedor_flag = false;
          
          vendedor_info.vendedor_subramos.some(function(subramo, sub_index) {   
            if((subramo.provider == order.form.aseguradora.id && subramo.ramo == order.form.ramo.id && subramo.subramo == order.form.subramo.id) ||
              (subramo.provider == order.form.aseguradora.id && subramo.ramo == order.form.ramo.id && subramo.subramo == 0) ||
               (subramo.provider == order.form.aseguradora.id && subramo.ramo == 0 && subramo.subramo == 0) ||
              (subramo.provider == 0 && subramo.ramo == 0 && subramo.subramo == 0) ||
              (subramo.provider == 0 && (subramo.ramo*-1) == order.form.ramo.ramo_code && (subramo.subramo*-1) == order.form.subramo.subramo_code)
              ){
              
              vendedor_flag = true;
            } 

            if(vendedor_info.vendedor_subramos.length == (sub_index + 1)) {
              if(!vendedor_flag) {
                SweetAlert.swal('Error','El vendedor no tiene comisión en el subramo actual','error');
                order.form.vendor = $scope.original_vendor;
                return;
              }
            }

          });

        }
      });
    }
    // Nuevo paquete
    $scope.addNewPackage = function () {
      $scope.show_new_pack = true;
      $scope.create_pack = true;
      $scope.show_new_sub = false;
    };
    $scope.savePackage = function (parObj) {

      parObj.provider = order.form.aseguradora.url;
      parObj.ramo = order.form.ramo.url;
      parObj.subramo = order.form.subramo.url;
      parObj.type_package = 1; // paquete normal
      parObj.coverage_package = [];


      packageService.createPackage(parObj)
      .then(
        function success (request) {
          if(request.id) {
            order.defaults.packages.push(request);
            $scope.create_pack = false;
            $scope.add_coverages = true;
            $scope.package_created = request;
          }
        },
        function error (error) {
          console.log('error - createPackage', error);
        })
      .catch(function(e) {
        console.log('error -createPackage- catch',e);
      });
      
    };
    $scope.coverages = []
    $scope.saveCoverage = function (parName, sum_insured, deductible) {
      var obj = {
        coverage_name: parName,
        // priority: priority ? priority : 0,
        provider: order.form.aseguradora.url,
        package: $scope.package_created.url,
        deductible: [],
        sums_coverage: []
      };
      coverageService.createCoverage(obj)
      .then(
        function success (request) { 
          $http({
              method: 'POST',
              url: url.IP + 'sumas-aseguradas/',
              data: {
                  'coverage_sum': request.url,
                  'sum_insured': sum_insured,
                  'default': true
              }
              });
            $http({
              method: 'POST',
              url: url.IP + 'deducibles/',
              data: {
                  'coverage_deductible': request.url,
                  'deductible': deductible,
                  'default': true
              }
              });

          if(request.id) {
            $scope.coverages.push(request);
            $scope.coverageName = '';
            parName = '';

            order.defaults.packages.forEach(function (item) {

              if(item.id == $scope.package_created.id) {
                if(item.coverage_package) {
                  item.coverage_package.push(request);
                } else {
                  item.coverage_package = [];
                  item.coverage_package.push(request);
                }
              }
            });
          }
        },
        function error (error) {
          console.log('error - createCoverage', error);
        }
      )
      .catch(function(e) {
        console.log('error - createCoverage - catch', e);
      });

    };

    $scope.finishCoverages = function () {
      $scope.create_pack = false;
      $scope.add_coverages = false;
      $scope.show_new_pack = false;
      $scope.coverages = [];
      // order.options.changePackage($scope.package_created);
      // order.options.changeSubramo.changeSubramo();
    };
    // Fin nuevo paquete
    /* Fechas para la nueva póliza */

    order.form.startDate = new Date($stateParams.myInsurance.end_of_validity);
    order.form.startDate = new Date(order.form.startDate.getTime() + ( order.form.startDate.getTimezoneOffset() * 60000 ));

    var actualYear = new Date().getFullYear();
    var oldYear = actualYear - 80;
    for (var i = actualYear + 1; i >= oldYear; i--) {
        order.defaults.years.push(i);
    }

    function validate2() {      
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      // l.start();
      var flag = true;
      if(order.receipts.length == 0){
          flag = false;
          l.stop();
          toaster.warning(MESSAGES.ERROR.RECEIPTSREQUIRED);
      }
      if(order.form.poliza == '' || order.form.poliza == null){
          flag = false;
          l.stop();
          toaster.warning(MESSAGES.ERROR.POLICYNOREQUIRED);
      }
      return flag;
    }

    function checkPromise(obj) {
      return obj;
    }

    function get_claves() {
      
      $http.get(url.IP+'claves-by-provider/'+order.form.aseguradora.id)
      .then(function(clavesResponse){
        clavesResponse.data.forEach(function(clave) {
          clave.clave_comision.forEach(function(item) {
            item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
            if(order.form.subramo){
              if(item.subramo == order.form.subramo.subramo_name){
                order.form.comision_percent = parseFloat(item.comission);
                order.form.udi = parseFloat(item.udi);
              }
            }else{
              order.form.comision_percent = 0
              order.form.udi = 0
            }
          });
        });

        order.defaults.claves=clavesResponse.data;
        if(order.defaults.claves.length== 1){
            order.form.clave = order.defaults.claves[0];
        }

        $scope.comisiones_poliza = [];
        for(var i = 0; i < order.defaults.claves.length; i++){
          if(order.form.clave.name == order.defaults.claves[i].name){
            $scope.clave_poliza = order.defaults.claves[i];
          }
        }
        for(var i = 0; i < $scope.clave_poliza.clave_comision.length; i++){
          try{
            if(order.form && order.form.subramo && order.form.subramo.subramo_name && (order.form.subramo.subramo_name).toLowerCase() == $scope.clave_poliza.clave_comision[i].subramo.toLowerCase() ){
              $scope.comisiones_poliza.push($scope.clave_poliza.clave_comision[i]);
            }
          }catch(e){console.log('oooooo',e)}
        }
        if($scope.comisiones_poliza && $scope.comisiones_poliza.length !=0){
          order.form.comisiones = $scope.comisiones_poliza;
        }else{
          order.form.comisiones = $scope.clave_poliza.clave_comision;
        }

      });
    }

    function blankName(name) {
      if (name === undefined || name === "" || name === null) {
        return ''
      } else {
        return name;
      }
    }

    $scope.checkValue = function(argument) {
      if(argument){
        if(parseFloat(argument) < 0) {
          order.form.comision_percent = 0;
        } else if (parseFloat(argument) > 100){
          order.form.comision_percent = 100;
        } else {
          order.form.comision_percent = parseFloat(order.form.comision_percent.toFixed(2));  
        }
      }
    };

    $scope.checkDecimal = function(argument) {
      if(argument){
        if(parseFloat(argument) < 0) {
          order.form.udi = 0;
        } else if (parseFloat(argument) > 100){
          order.form.udi = 100;
        } else {
          order.form.udi = parseFloat(order.form.udi.toFixed(2));  
        }
      }
    };

    $scope.changeAgrupacion = function(data){
      $scope.sub_asignaciones = data.subgrupos;
      $scope.sub_subasignaciones = [];
      if($scope.info_sub.subgrouping_level){
        $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subgrouping_level.id)
        .then(function(response) {
          order.form.subgrouping = response.data;
          $scope.sub_asignaciones.forEach(function(item){
            if(item.id == order.form.subgrouping.id){
              $scope.changeSubagrupacion(item);
            }
          });
        });
      }
    }

    $scope.changeSubagrupacion = function(data){
      if(data.subsubgrupos){
        $scope.sub_subasignaciones = data.subsubgrupos;
        if($scope.info_sub.subsubgrouping_level){
          $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subsubgrouping_level.id)
          .then(function(response) {
            order.form.subsubgrouping = response.data;
          });
        }
      }
    }

    //------------------------------
    $scope.newCoverages = function () {
      $scope.addNewCoverages = true;
      
    };
    $scope.finishNewCoverages = function () {
      $scope.addNewCoverages = false;

    };
    $scope.saveNewCoverage = function (parName, priority, parPackage) {        
      $scope.ded = false;
      $scope.sum = false;
      if(parPackage) {
        var paqueteData = parPackage;
      } else {
        var paqueteData = $scope.packageCreated;
      }
      if(!parName || parName==undefined){
        SweetAlert.swal('Campo requerido','Debe agregar un Nombre de Cobertura','error')
        return;
      }
      var obj = {
        coverage_name: parName,
        priority: priority ? priority : 0,
        provider: order.form.aseguradora.url,
        package: order.form.paquete.url,
        deductible: [],
        sums_coverage: [],
        coinsurance_coverage: [],
        topecoinsurance_coverage: [],
      };
      $scope.coverages = [];
      coverageService.createCoverage(obj)
      .then(
        function success (request) {
          $scope.coverages.push(request);            
          order.defaults.coverages.push(request)
          $scope.coverageName = null;

          order.defaults.packages.forEach(function (item) {
            if(item.id == order.form.paquete.id) {
              if(item.coverage_package) {
                item.coverage_package.push(request);
              } else {
                item.coverage_package = [];
                item.coverage_package.push(request);
              }
            }
          });
        },
        function error (error) {
          console.log('error - createCoverage', error);
        }
      )
      .catch(function(e) {
        console.log('error - createCoverage - catch', e);
      });
    };
      // ----------------
    function getInternalNumber() {
      $http({
        method: 'POST',
        url: url.IP + 'internal-number/'
      })
      .then( 
          function success(request) {
              if((request.status === 200) || (request.status === 201)){
                  $scope.internal_number ='OT000' + request.data.id;  
              }
          }, 
          function error(error) {

          }
      )
      .catch(function(e){
          console.log(e);
      });
    }
    function isString(x) {
      return Object.prototype.toString.call(x) === "[object String]"
    }
    // https://miurabox.atlassian.net/browse/DES-875
    function getNumericIdFromValue(value) {
      if (angular.isNumber(value)) {
        return value;
      }
      if (angular.isString(value)) {
        var cleanValue = value.replace(/\/$/, '');
        var parts = cleanValue.split('/');
        var parsedId = parseInt(parts[parts.length - 1], 10);
        return isNaN(parsedId) ? null : parsedId;
      }
      if (value && angular.isNumber(value.id)) {
        return value.id;
      }
      return null;
    }
    // inicializa
    order.cgrenovacion = order.cgrenovacion || {
      mode: 'AUTO',          // AUTO | SELECT | NONE
      catalog: [],
      selectedDocs: []
    };

    function getProviderId() {
      return order.form.aseguradora && (order.form.aseguradora.id || order.form.aseguradora);
    }
    function getSubramoId() {
      return order.form.subramo && (order.form.subramo.id || order.form.subramo);
    }

    // cada vez que cambie aseguradora/subramo, recarga catálogo y limpia selección
    $scope.$watchGroup([
      function(){ return getProviderId(); },
      function(){ return getSubramoId(); }
      ], function(newVals, oldVals){

      var providerId = newVals[0];
      var subramoId  = newVals[1];

      if(!providerId || !subramoId) {
        order.cgrenovacion.catalog = [];
        // opcional: NO borres selectedDocs, solo si quieres:
        order.cgrenovacion.selectedDocs = [];
        return;
      }

      order.cgrenovacion.loading = true;

      // 1) catálogo
      CondicionesGeneralesService.list({ aseguradora: providerId, subramo: subramoId })
        .then(function(res){
          order.cgrenovacion.selectedDocs = [];
          order.cgrenovacion.catalog = res.data.results || res.data || [];
          // 2) seleccionados existentes de la póliza (si hay póliza guardada)
          var policyId = order.form.id || order.policy_id;
          if(!policyId) return [];

          return CondicionesGeneralesService.getByPolicy(policyId, { org: org });
        })
        .then(function(res){
          if(!res || !res.data) return;
          var rows = res.data.results || res.data || [];
          // tu API devuelve {condicion_detalle: {...}}
          var selected = rows
            .map(function(r){ return r.condicion_detalle; })
            .filter(function(x){ return x && x.id; });
          // importante: asigna objetos (para que ui-select pinte nombre/tipo)
          order.cgrenovacion.selectedDocs = selected;
        })
        .finally(function(){
          order.cgrenovacion.loading = false;
        });

    });

    // --- En tu función de guardar póliza ---
    // arma qué vas a asignar
    function buildGeneralConditionsAssignment() {
      var providerId = getProviderId();
      var subramoId = getSubramoId();

      if (!providerId || !subramoId) return null;

      if (order.cgrenovacion.mode === 'NONE') {
        return { enabled: false };
      }

      if (order.cgrenovacion.mode === 'AUTO') {
        // asignar todas por aseguradora/subramo
        return {
          enabled: true,
          mode: 'AUTO',
          aseguradora: providerId,
          subramo: subramoId
        };
      }

      // SELECT
      var ids = (order.cgrenovacion.selectedDocs || []).map(function(d){ return d.id; }).filter(Boolean);
      return {
        enabled: true,
        mode: 'SELECT',
        aseguradora: providerId,
        subramo: subramoId,
        document_ids: ids
      };
    }
    function assignGeneralConditionsToPolicy(policyData) {
      if (!policyData || !policyData.id) return $q.when();
      // provider / aseguradora
      var providerId =
        getNumericIdFromValue(policyData.aseguradora) ||
        (order.form.aseguradora ? getNumericIdFromValue(order.form.aseguradora.id || order.form.aseguradora) : null);

      // subramo
      var subramoId =
        getNumericIdFromValue(policyData.subramo) ||
        (order.form.subramo ? getNumericIdFromValue(order.form.subramo.id || order.form.subramo) : null);

      if (!providerId || !subramoId) return $q.when();
      var mode = (order.cgrenovacion && order.cgrenovacion.mode) ? order.cgrenovacion.mode : 'AUTO';
      console.log('auto**********',mode)
      if (mode === 'NONE') return $q.when();

      var payload = {
        policy_id: policyData.id,
        aseguradora: providerId,
        subramo: subramoId,
        replace: true
      };
      console.log('auto**********',mode,payload)

      // Si el usuario eligió cuáles
      if (mode === 'SELECT') {
        var ids = (order.cgrenovacion.selectedDocs || []).map(function(d){ return d && d.id; }).filter(Boolean);
        payload.document_ids = ids;
      }
      console.log('auto**********',mode,payload)
      var endpoint = 'asignar-condiciones-generales-poliza/';
      return dataFactory.post(endpoint, payload)
        .catch(function(error) {
          console.log('No se pudieron asignar condiciones generales', error);
          // no rompas el guardado de póliza por esto
          return $q.when();
        });
    }
    // https://miurabox.atlassian.net/browse/DES-875
    $scope.yaTermino=false;
    order.save = {
      /* Guardar como OT */
      saveChangesInOt: function() {
        var l_ot = Ladda.create( document.querySelector( '.ladda-buttonOT' ) );
        l_ot.start();
        if(order.acceso_obl_ref){
          $scope.referenciadores_copy =  $scope.referenciadores.filter(function(item){
            return item && item.referenciador && isString(item.referenciador);
          })
          if(order.acceso_obl_ref){
            if(($scope.referenciadores && $scope.referenciadores.length ==0) || ($scope.referenciadores_copy && $scope.referenciadores_copy.length ==0)){
              SweetAlert.swal("Error", "Seleccione al menos un referenciador.", "error");
              l_ot.stop();
              return              
            }
          }
        }
        if(!order.form.ramo){
          if(!order.form.ramo.url){
            l_ot.stop();
            SweetAlert.swal("Oops...",MESSAGES.ERROR.RAMOREQUIRED, "error");
            return;
          }
        }
        $scope.referenciadores_copy =  $scope.referenciadores.filter(function(item){
          return item && item.referenciador && isString(item.referenciador);
        })
        if(order.acceso_cno_pol ==false){
          if(($scope.referenciadores && $scope.referenciadores.length ==0) || ($scope.referenciadores_copy && $scope.referenciadores_copy.length ==0)){
            SweetAlert.swal("Error", "Seleccione al menos un referenciador.", "error");
            l_ot.stop();
            return              
          }
        }
        if(!order.form.subramo){
          if(!order.form.subramo.url){
            l_ot.stop();
            SweetAlert.swal("Oops...", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
            return;
          }
        }
        if (order.form.ramo) {
          if(order.form.ramo.ramo_code == 1){
            if(order.form.subramo.subramo_code != 30){
              if(!order.subforms.life.aseguradosList[0].policy_type){
                l_ot.stop();
                SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                return;
              }
            }
          }
          if(order.form.ramo.ramo_code == 2){
            if(!order.subforms.disease.policy_type){
              l_ot.stop();
              SweetAlert.swal("Error", "Selecciona un tipo.", "error");
              return;
            }
          }
          if(order.form.ramo.ramo_code == 3){
            if(order.form.subramo.subramo_code == 9){
              if(!order.subforms.auto.policy_type){
                l_ot.stop();
                SweetAlert.swal("Error", MESSAGES.ERROR.ERRORTYPEAUTO, "error");
                return;
              }
            }else{
              if(!order.subforms.damage.damage_type){
                l_ot.stop();
                SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                return;
              }
            }
          }
        }
        if(!order.form.clave){
          if(!order.form.clave.url){
            l_ot.stop();
            SweetAlert.swal("Oops...",MESSAGES.ERROR.CLAVE, "error");
            return;
          }
        }
        if(!order.form.contratante){
          if(!order.form.contratante.url){
            l_ot.stop();
            SweetAlert.swal("Oops...", MESSAGES.ERROR.CONTRACTORERROR, "error");
            return;
          }
        }
        if(!order.form.address){
          if(!order.form.address.url){
            l_ot.stop();
            SweetAlert.swal("Oops...",MESSAGES.ERROR.ADDRESS, "error");
            return;
          }
        }
        if(!order.form.aseguradora){
          if(!order.form.aseguradora.url){
            l_ot.stop();
            SweetAlert.swal("Oops...", MESSAGES.ERROR.PROVIDERREQUIRED, "error");
            return;
          }
        }
        if(!canBeOT()){return;} /* Validación contratante */
          var url_mine;
          var form = angular.copy(order.form);
          var obsevaciones = order.form.observations;
          if ($scope.dateOut == true) {
            l_ot.stop();
            SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATERANGE, "error");
            return;
          }
          for(var i = 0; i < order.subforms.life.aseguradosList.length; i++){
            if(order.subforms.life.aseguradosList[i].birthdate == '' || !order.subforms.life.aseguradosList[i].birthdate){
              SweetAlert.swal("Error","Agrega la fecha de nacimiento del asegurado  #" + (i+1), "error");
              return;
            }

          }
          if (order.receipts.length > 0) {
            SweetAlert.swal({
              title: 'Renovar como OT',
              text: "Guardar como OT no guardará recibos, ¿Desea continuar?",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Sí",
              cancelButtonText: "No",
              closeOnConfirm: true
            },
            function(isConfirm) {
              if (isConfirm) {
                order.receipts  = [];
                form = getFormData(form);
                form.business_line = order.form.business_line ? order.form.business_line : 0;
                form.celula = order.form.celula ? order.form.celula.url : '';
                form.observations =obsevaciones;
                form.status = 1;
                form.address = order.form.address.url;
                form.clave = order.form.clave.url;
                form.folio = order.form.folio;
                form.poliza = order.form.poliza;

                form.p_neta = 0;
                form.rpf = 0;
                form.derecho = 0;
                form.p_total = 0;
                form.iva = 0;
                if(order.form.responsable){
                  form.responsable = order.form.responsable ? order.form.responsable.url : '';
                }
                if(order.form.collection_executive){
                  form.collection_executive = order.form.collection_executive ? order.form.collection_executive.url : '';
                }

                if(order.form.sucursal){
                  form.sucursal = order.form.sucursal ? order.form.sucursal.url : '';
                }

                if(order.form.ceder_comision){
                  form.udi = order.form.udi;
                  if(order.form.comision_percent) {
                    form.comision_percent = order.form.comision_percent;
                  } else {
                    form.comision_percent = order.form.clave.comission;
                  }
                } else {
                  if(order.form.comision_percent) {
                    form.comision_percent = order.form.comision_percent;
                  } else {
                    form.comision_percent = order.form.clave.comission;
                  }
                  form.udi = (order.form.clave.udi);
                }

                if(order.form.comision_percent) {
                  var percent_ = parseFloat(order.form.comision_percent) / 100;
                  order.form.comision = (order.form.p_neta * percent_).toFixed(2);
                } else {
                  var percent_ = parseFloat(order.form.comision.comission) / 100;
                  order.form.comission = (order.form.p_neta * percent_).toFixed(2);
                  order.form.comision = (order.form.p_neta * percent_).toFixed(2);
                }

                $q.all([
                  helpers.existPolicyNumber('renovaciones_modulo').then(checkPromise),
                ]).then(function(val) {

                if (val[0] === true) {  
                  SweetAlert.swal('Error','Esta número de póliza ya existe.','error')
                } else {
                  // Dates original
                  // if(order.form.start_of_validity) {
           
                  //   var startDate = new Date( order.form.start_of_validity).setHours(12,0,0,0);
                  //   var endingDate = new Date( order.form.end_of_validity).setHours(11,59,59,0);
                  //   order.form.startDate = new Date(startDate);
                  //   order.form.endingDate = new Date(endingDate);

                  // } else {
                  //   var startDate = new Date(mesDiaAnio(order.form.startDate)).setHours(12,0,0,0);
                  //   var endingDate = new Date(mesDiaAnio(order.form.endingDate)).setHours(11,59,59,0);
                  //   order.form.startDate = new Date(startDate);
                  //   order.form.endingDate = new Date(endingDate);
                  // }
                  // Dates original
                  if (order.form.start_of_validity) {
                    var startDate = new Date( order.form.start_of_validity).setHours(12,0,0,0);
                    var endingDate = new Date( order.form.end_of_validity).setHours(11,59,59,0);
                    order.form.startDate_ = new Date(startDate);
                    order.form.endingDate_ = new Date(endingDate);

                  } else {
                    var startDate = new Date(mesDiaAnio(order.form.startDate)).setHours(12,0,0,0);
                    var endingDate = new Date(mesDiaAnio(order.form.endingDate)).setHours(11,59,59,0);
                    order.form.startDate_ = new Date(startDate);
                    order.form.endingDate_ = new Date(endingDate);
                  }
                  if (order.form.startDate) {
                    order.form.startDate_ = datesFactory.toDate(order.form.startDate);
                    order.form.endingDate_ = datesFactory.toDate(order.form.endingDate);
                  }
                  form.startDate = order.form.startDate_;
                  form.endingDate = order.form.endingDate_;
                  form.start_of_validity = form.startDate;
                  form.end_of_validity = form.endingDate;
                  // Dates ok  
                  form.contractor = order.form.contratante.value.url;
                  form.internal_number = $scope.internal_number
                  form.comision = form.comision.comission;
                  form.vendor = "";
                  form.state_circulation = order.form.state_circulation ? order.form.state_circulation.state : ''
                  form.conducto_de_pago = order.conducto_de_pago.conducto_de_pago_selected;
                  // console.log('conducto_de_pago --reno..',form,order.form,order.conducto_de_pago)
                  insuranceService.createInsurance(form).then(function(res) {

                    var params = {
                      'model': 1,
                      'event': "POST",
                      'associated_id': myInsurance.id,
                      'identifier': "generó la OT para renovación."
                    }
                    dataFactory.post('send-log/', params).then(function success(response) {
                      
                    });

                    var params2 = {
                      'model': 1,
                      'event': "POST",
                      'associated_id': res.id,
                      'identifier': "creo la OT a partir de la Póliza: "+myInsurance.poliza_number
                    }
                    dataFactory.post('send-log/', params2).then(function success(response) {
                      
                    });
                    /*Actualización de Contratante*/
                    $scope.contractorToSave = {};

                    if(order.form.contratante.email){
                      $scope.contractorToSave.email = order.form.contratante.email;
                    }else{
                      $scope.contractorToSave.email = '';
                    }
                    if(order.form.contratante.phone_number){
                      $scope.contractorToSave.phone_number = order.form.contratante.phone_number
                    }else{
                      $scope.contractorToSave.phone_number = ''
                    }
                    $http.patch(order.form.contratante.value.url,$scope.contractorToSave)
                      .then(function(data) {
                        if(data.status == 200 || data.status == 201){
                          toaster.info('Contratante Actualizado')
                        }
                    });
                    // if (res.contractor){
                    //   $http.get(res.contractor)
                    //     .then(function(response) {
                    //       if(response.data.email){
                    //           //Send Email
                    //           if($localStorage.email_config){
                    //             if($localStorage.email_config.renovacion == true){
                    //               var model = 9;
                    //               emailService.sendEmailAtm(model,myInsurance.id)                                
                    //            }
                    //          }else{}
                    //         //Send Email
                    //       }
                    //   });
                    // }
                    // //Send Email

                    /* Actualiza la póliza antigua */
                    // Modifica *********+++
                    var data = {
                      renewed_status: 2
                    }
                    $http.patch($scope.poliza_data.url, data).then(function success(response) {
                    });

                    /* Relación la póliza original*/
                    var oldPolicy = {
                      policy: myInsurance.poliza_number,
                      base_policy: myInsurance.url,
                      new_policy: res.url
                    }

                    insuranceService.createOldPolicy(oldPolicy)
                    .then(function(responseOldPolicy){
                    });
                    // varios referenciadores
                    for(var i=0; i<$scope.referenciadores.length; i++){
                      $scope.referenciadores[i].policy = res.url;
                      $scope.ref_policy = $scope.referenciadores[i];             
                        if($scope.ref_policy){
                        if ($scope.referenciadores[i].referenciador) {
                          var ref = {}
                          ref.referenciador = $scope.referenciadores[i].referenciador
                          ref.comision_vendedor = $scope.referenciadores[i].comision_vendedor ? $scope.referenciadores[i].comision_vendedor : 0
                          ref.policy = res.url
                          dataFactory.post('referenciadores-policy/',ref)
                          .then(
                            function success(request){
                            },
                            function error(error) {
                              console.log(error);
                            })
                          .catch(function(e){
                            console.log(e);
                          });
                        }
                      
                      // if ($scope.referenciadores[i].url) {
                      //   $http.patch($scope.referenciadores[i].url, $scope.referenciadores[i]).then(
                      //     function success(request){
                      //     },
                      //     function error(error) {
                      //       console.log(error);
                      //     })
                      //   .catch(function(e){
                      //     console.log(e);
                      //   });
                      }
                      // }else{
                      //   $scope.ref_policy = $scope.referenciadores[i];             
                      //   if($scope.ref_policy){
                      //     if ($scope.referenciadores[i].referenciador) {
                      //       var ref = {}
                      //       ref.referenciador = $scope.referenciadores[i].referenciador
                      //       ref.comision_vendedor = $scope.referenciadores[i].comision_vendedor ? $scope.referenciadores[i].comision_vendedor : 0
                      //       ref.policy = res.url
                      //       dataFactory.post('referenciadores-policy/',ref)
                      //       .then(
                      //         function success(request){
                      //           console.log('reque ref',request,ref)
                      //         },
                      //         function error(error) {
                      //           console.log(error);
                      //         })
                      //       .catch(function(e){
                      //         console.log(e);
                      //       });
                      //     }
                      //   }
                      // }
                    }              
                    // varios referenciadores
                    /* Sube archivos */
                    uploadFiles(res.id);
                            
                    order.defaults.policyUrl = res.url;
                    url_mine = res.url;

                    SweetAlert.swal("Hecho", MESSAGES.OK.NEWOT, "success");
                                
                    /* Formulario por ramo */
                    var code = order.defaults.formInfo.code;
                    if (code === 9) {
                        var auto = angular.copy(order.subforms.auto);
                        auto.sub_branch = res.subramo;
                        auto.policy = res.url;
                        auto.org = res.org;
                        
                        var submitObject = {
                            code : code,
                            insurance: res,
                            form: auto,
                            policy: order.insuranceObject.id
                        }
              
                        formService.createForm(submitObject)
                            .then(function(resAuto){
                     
                            });
                    } else if (code === 1 || code === 30) {
                        // Personal information
                        var life = order.subforms.life;
                        var beneficiaries = order.subforms.life.beneficiariesList;

                        // var personal = {
                        //     first_name: life.first_name ? life.first_name : '',
                        //     last_name: life.last_name ? life.last_name : '',
                        //     second_last_name: life.second_last_name ? life.second_last_name : '',
                        //     birthdate: life.birthdate,
                        //     sex: life.sex ? life.sex : ''
                        // };
                        var personal = order.subforms.life.aseguradosList;

                        var submitObject = {
                            code: code,
                            personal: personal,
                            personal_life_policy:order.subforms.life.aseguradosList,
                            relationships: beneficiaries,
                            insurance: res,
                            smoker: order.insuranceObject.smoker ? order.insuranceObject.smoker : false
                        }
                        if (submitObject.smoker == 'True') {
                          submitObject.smoker = true
                        }
                        else if (submitObject.smoker == 'False') {
                          submitObject.smoker = false
                        }
                        formService.createForm(submitObject)
                            .then(function(response){
             
                            });
                    } else if (code === 2 || code === 3 || code === 4) {
                        var disease = order.subforms.disease;
                        var relationships = order.subforms.disease.relationshipList;

                        var type = helpers.diseaseType(order.defaults.formInfo.code);                        
                        var pt = (order && order.subforms && order.subforms.disease && order.subforms.disease.policy_type && order.subforms.disease.policy_type.id) 
                          ? order.subforms.disease.policy_type.id 
                          : (order && order.subforms && order.subforms.disease && order.subforms.disease.policy_type) 
                          ? order.subforms.disease.policy_type :46;
                        var personal = {
                            first_name: disease.first_name ? disease.first_name : '',
                            last_name: disease.last_name ? disease.last_name : '',
                            second_last_name: disease.second_last_name ? disease.second_last_name : '',
                            birthdate: disease.birthdate,
                            antiguedad: disease.antiguedad ?  disease.antiguedad : null,
                            sex: disease.sex ? disease.sex : '',
                            policy_type: pt  ?pt : disease.policy_type ?disease.policy_type :46
                        };
                        // var personal = order.subforms.life.aseguradosList;

                        var submitObject = {
                            code : code,
                            personal: personal,
                            relationships: relationships,
                            coinsurance: disease.coinsurance,
                            insurance: res,
                            policy: order.insuranceObject.id
                        }

                        formService.createForm(submitObject)
                            .then(function(response){
                
                            });
                    } else if (code === 5 || code === 6 || code === 7 || code === 8 || code === 10 || code === 11 || code === 12 || code === 13 || code === 14 | code === 31) {
                        var damage = order.subforms.damage;
                        var type = helpers.damageType(parseInt(code));

                        damage.sub_branch = res.subramo;
                        damage.damage_type = order.subforms.damage.damage_type;
                        damage.policy = res.url;

                        var submitObject = {
                          insurance: res,
                          code: code,
                          form: damage,
                          policy: order.insuranceObject.id
                        }



                        formService.createForm(submitObject)
                            .then(function(res){

                            });
                    }

                    /* Coberturas */
                    if (order.defaults.coverages.length > 0) {
                        helpers.createCoverages(order.defaults.coverages, res);
                    }
                    // $state.go('renovaciones.renovaciones');
                    gopolicieinfo(res.id,$scope.poliza_data);
                  });
                  }
                });
                return
              }else{
                $scope.disabled_ot = true
                SweetAlert.swal("Error",MESSAGES.ERROR.POLICYNOREQUIRED, "error")
                $scope.validatePolicy('poliza', 1);
                return
              }
            });
          }
          else{
            form = getFormData(form);
            form.business_line = order.form.business_line ? order.form.business_line : 0;
            form.celula = order.form.celula ? order.form.celula.url : '';
            form.observations =obsevaciones;
            form.status = 1;
            form.address = order.form.address.url;
            form.clave = order.form.clave.url;

            form.folio = order.form.folio;
            form.poliza = order.form.poliza;

            form.p_neta = 0;
            form.rpf =0;
            form.derecho = 0;
            form.p_total =0;
            form.iva = 0;
            if(order.form.responsable){
              form.responsable = order.form.responsable ? order.form.responsable.url : '';
            }
            if(order.form.collection_executive){
              form.collection_executive = order.form.collection_executive ? order.form.collection_executive.url : '';
            }

            if(order.form.sucursal){
              form.sucursal = order.form.sucursal ? order.form.sucursal.url : '';
            }

            if(order.form.ceder_comision){
              form.udi = order.form.udi;
              if(order.form.comision_percent) {
                form.comision_percent = order.form.comision_percent;
              } else {
                form.comision_percent = order.form.clave.comission;
              }
            } else {
              if(order.form.comision_percent) {
                form.comision_percent = order.form.comision_percent;
              } else {
                form.comision_percent = order.form.clave.comission;
              }
              form.udi = (order.form.clave.udi);
            }

            if(order.form.comision_percent) {
              var percent_ = parseFloat(order.form.comision_percent) / 100;
              order.form.comision = (order.form.p_neta * percent_).toFixed(2);
            } else {
              var percent_ = parseFloat(order.form.comision.comission) / 100;
              order.form.comission = (order.form.p_neta * percent_).toFixed(2);
            }

            $q.all([
              helpers.existPolicyNumber('renovaciones_modulo').then(checkPromise),
            ]).then(function(val) {

            if (val[0] === true) {
              SweetAlert.swal('Error','Esta número de póliza ya existe.','error')
            } else {
              if(order.form.start_of_validity) {
       
                var startDate = new Date( order.form.start_of_validity).setHours(12,0,0,0);
                var endingDate = new Date( order.form.end_of_validity).setHours(11,59,59,0);
                order.form.startDate_ = new Date(startDate);
                order.form.endingDate_ = new Date(endingDate);

              } else {
                var startDate = new Date(mesDiaAnio(order.form.startDate)).setHours(12,0,0,0);
                var endingDate = new Date(mesDiaAnio(order.form.endingDate)).setHours(11,59,59,0);
                order.form.startDate_ = new Date(startDate);
                order.form.endingDate_ = new Date(endingDate);
              }
              if (order.form.startDate) {
                order.form.startDate_ = datesFactory.toDate(order.form.startDate);
                order.form.endingDate_ = datesFactory.toDate(order.form.endingDate);
              }
              form.startDate = order.form.startDate_;
              form.endingDate = order.form.endingDate_;
              form.start_of_validity = form.startDate;
              form.end_of_validity = form.endingDate;      
              form.contractor = order.form.contratante.value.url;
              if (order.form) {
                              
              }
              form.internal_number = $scope.internal_number
              form.comision = form.comision.comission;
              form.vendor = "";
              if (!form.comision) {
                form.comision = 0
              }
              if (form.state_circulation) {
                if (form.state_circulation.state) {
                  form.state_circulation = form.state_circulation.state;
                }
              }
              form.groupinglevel = order.form.subsubgrouping ? order.form.subsubgrouping.url : order.form.subgrouping ? order.form.subgrouping.url :order.form.grouping_level ? order.form.grouping_level.url : null;

              if (form.grouping_level) {}
              form.conducto_de_pago = order.conducto_de_pago.conducto_de_pago_selected;
              // console.log('conducto_de_pago --reno..',form,order.form,order.conducto_de_pago)
              insuranceService.createInsurance(form).then(function(res) {
                if (res.estatus != 400 || res.estatus == 200) {
                  resetRenovationDraft();
                  $scope.poliza_data = myInsurance;
                  var params = {
                    'model': 1,
                    'event': "POST",
                    'associated_id': myInsurance.id,
                    'identifier': "generó la OT para renovación."
                  }
                  dataFactory.post('send-log/', params).then(function success(response) {
                    
                  });

                  var params2 = {
                    'model': 1,
                    'event': "POST",
                    'associated_id': res.id,
                    'identifier': "creo la OT a partir de la Póliza: "+myInsurance.poliza_number
                  }
                  dataFactory.post('send-log/', params2).then(function success(response) {
                    
                  });
                  /*Actualización de Contratante*/
                  $scope.contractorToSave = {};

                  if(order.form.contratante.email){
                    $scope.contractorToSave.email = order.form.contratante.email;
                  }else{
                    $scope.contractorToSave.email = '';
                  }
                  if(order.form.contratante.phone_number){
                    $scope.contractorToSave.phone_number = order.form.contratante.phone_number
                  }else{
                    $scope.contractorToSave.phone_number = ''
                  }
                  if(order && order.form && order.form.contratante && order.form.contratante.value && order.form.contratante.value.url){
                    $http.patch(order.form.contratante.value.url,$scope.contractorToSave)
                      .then(function(data) {
                        if(data.status == 200 || data.status == 201){
                          toaster.info('Contratante Actualizado')
                        }
                    });
                  }
                  // if(res.contractor){
                  //   $http.get(res.contractor)
                  //     .then(function(response) {
                  //       if(response.data.email){
                  //           //Send Email
                  //           if($localStorage.email_config){
                  //             if($localStorage.email_config.renovacion == true){
                  //               var model = 9;
                  //               emailService.sendEmailAtm(model,myInsurance.id)                                 
                  //            }
                  //          }else{}
                  //         //Send Email
                  //       }
                  //   });
                  // }
                  // //Send Email

                  /* Actualiza la póliza antigua */
                  // Modifica *************
                  var data = {
                    renewed_status: 2
                  }
                  $http.patch($scope.poliza_data.url, data).then(function success(response) {
                  });

                  /* Relación la póliza original*/
                  var oldPolicy = {
                    policy: myInsurance.poliza_number,
                    base_policy: myInsurance.url,
                    new_policy: res.url
                  }

                  insuranceService.createOldPolicy(oldPolicy)
                  .then(function(responseOldPolicy){
                  });
                  // varios referenciadores
                  for(var i=0; i<$scope.referenciadores.length; i++){
                    if ($scope.referenciadores && $scope.referenciadores[i] && $scope.referenciadores[i].policy) {
                      $scope.referenciadores[i].policy = res.url;
                      if ($scope.referenciadores[i].referenciador) {
                        var ref = {}
                        ref.referenciador = $scope.referenciadores[i].referenciador
                        ref.comision_vendedor = $scope.referenciadores[i].comision_vendedor ? $scope.referenciadores[i].comision_vendedor : 0
                        ref.policy = res.url
                        dataFactory.post('referenciadores-policy/',ref)
                        .then(
                          function success(request){
                          },
                          function error(error) {
                            console.log(error);
                          })
                        .catch(function(e){
                          console.log(e);
                        });
                      }
                    }
                    // if ($scope.referenciadores[i].url) {
                    //   $http.patch($scope.referenciadores[i].url, $scope.referenciadores[i]).then(
                    //     function success(request){
                    //     },
                    //     function error(error) {
                    //       console.log(error);
                    //     })
                    //   .catch(function(e){
                    //     console.log(e);
                    //   });
                    // }else{
                    //   $scope.ref_policy = $scope.referenciadores[i];             
                    //   if($scope.ref_policy){
                    //     if ($scope.referenciadores[i].referenciador) {
                    //       var ref = {}
                    //       ref.referenciador = $scope.referenciadores[i].referenciador
                    //       ref.comision_vendedor = $scope.referenciadores[i].comision_vendedor ? $scope.referenciadores[i].comision_vendedor : 0
                    //       ref.policy = res.url
                    //       dataFactory.post('referenciadores-policy/',ref)
                    //       .then(
                    //         function success(request){
                    //         },
                    //         function error(error) {
                    //           console.log(error);
                    //         })
                    //       .catch(function(e){
                    //         console.log(e);
                    //       });
                    //     }
                    //   }
                    // }
                  }              
                  // varios referenciadores
                  /* Sube archivos */
                  uploadFiles(res.id);
                          
                  order.defaults.policyUrl = res.url;
                  url_mine = res.url;

                  SweetAlert.swal("Hecho", MESSAGES.OK.NEWOT, "success");
                  var irInfo=false;        
                  /* Formulario por ramo */
                  var code = order.defaults.formInfo.code;
                  if (code === 9) {
                      var auto = angular.copy(order.subforms.auto);
                      auto.sub_branch = res.subramo;
                      auto.policy = res.url;
                      auto.org = res.org;
                      
                      var submitObject = {
                          code : code,
                          insurance: res,
                          form: auto,
                          policy: order.insuranceObject.id
                      }
            
                      formService.createForm(submitObject)
                          .then(function(resAuto){                                      
                            gopolicieinfo(res.id,$scope.poliza_data);
                          });
                  } else if (code === 1 || code === 30) {
                      // Personal information
                      var life = order.subforms.life;
                      var beneficiaries = order.subforms.life.beneficiariesList;

                      // var personal = {
                      //     first_name: life.first_name ? life.first_name : '',
                      //     last_name: life.last_name ? life.last_name : '',
                      //     second_last_name: life.second_last_name ? life.second_last_name : '',
                      //     birthdate: life.birthdate,
                      //     sex: life.sex ? life.sex : ''
                      // };
                      var personal = order.subforms.life.aseguradosList;

                      var submitObject = {
                          code: code,
                          personal: personal,
                          personal_life_policy:order.subforms.life.aseguradosList,
                          relationships: beneficiaries,
                          insurance: res,
                          smoker: order.insuranceObject.smoker ? order.insuranceObject.smoker : false
                      }
                      if (submitObject.smoker == 'True') {
                        submitObject.smoker = true
                      }
                      else if (submitObject.smoker == 'False') {
                        submitObject.smoker = false
                      }
                      formService.createForm(submitObject)
                          .then(function(response){                                      
                            gopolicieinfo(res.id,$scope.poliza_data);
                          });
                  } else if (code === 2 || code === 3 || code === 4) {
                      var disease = order.subforms.disease;
                      var relationships = order.subforms.disease.relationshipList;

                      var pt = (order && order.subforms && order.subforms.disease && order.subforms.disease.policy_type && order.subforms.disease.policy_type.id) 
                              ? order.subforms.disease.policy_type.id 
                              : (order && order.subforms && order.subforms.disease && order.subforms.disease.policy_type) 
                              ? order.subforms.disease.policy_type :46;
                      var type = helpers.diseaseType(order.defaults.formInfo.code);
                      var personal = {
                          first_name: disease.first_name ? disease.first_name : '',
                          last_name: disease.last_name ? disease.last_name : '',
                          second_last_name: disease.second_last_name ? disease.second_last_name : '',
                          birthdate: disease.birthdate,
                          sex: disease.sex ? disease.sex : '',
                          policy_type: pt  ?pt : disease.policy_type ?disease.policy_type :46
                      };
                      // var personal = order.subforms.life.aseguradosList;

                      var submitObject = {
                          code : code,
                          personal: personal,
                          relationships: relationships,
                          coinsurance: disease.coinsurance,
                          insurance: res,
                          policy: order.insuranceObject.id
                      }
                      formService.createForm(submitObject)
                          .then(function(response){                                
                            gopolicieinfo(res.id,$scope.poliza_data);
                          });
                  } else if (code === 5 || code === 6 || code === 7 || code === 8 || code === 10 || code === 11 || code === 12 || code === 13 || code === 14 || code === 31) {
                      var damage = order.subforms.damage;
                      var type = helpers.damageType(parseInt(code));

                      damage.sub_branch = res.subramo;
                      damage.damage_type = order.subforms.damage.damage_type;
                      damage.policy = res.url;

                      var submitObject = {
                        insurance: res,
                        code: code,
                        form: damage,
                        policy: order.insuranceObject.id
                      }



                      formService.createForm(submitObject)
                          .then(function(res1){                                      
                            gopolicieinfo(res.id,$scope.poliza_data);
                          });
                  }

                  /* Coberturas */
                  if (order.defaults.coverages.length > 0) {
                      helpers.createCoverages(order.defaults.coverages, res);
                  }

                  // $state.go('renovaciones.renovaciones');         
                  // gopolicieinfo(res.id,$scope.poliza_data);
                }else{
                  SweetAlert.swal("Error", MESSAGES.ERROR.ERRORCREATEPOLICY, "error");
                }
              });
              // setTimeout(function() {
              //   order.receipts.forEach(function(receipt,index){
              //     var saveReceiptRequest = {
              //       poliza:url_mine,
              //       recibo_numero: index + 1,
              //       prima_neta: receipt.prima,
              //       rpf: receipt.rpf,
              //       derecho: receipt.derecho,
              //       iva: receipt.iva,
              //       sub_total: receipt.subTotal,
              //       prima_total: receipt.total,
              //       status: 4,
              //       isActive: false,
              //       isCopy:receipt.isCopy,
              //       startDate: toDate(receipt.startDate),
              //       endingDate: toDate(receipt.endingDate),
              //       fecha_inicio: toDate(receipt.startDate),
              //       fecha_fin: toDate(receipt.endingDate),
              //       vencimiento: toDate(receipt.vencimiento),
              //       description: "",
              //       receipt_type:1,
              //       is_cat : receipt.is_cat
              //     };

              //     receiptService.createReceiptService(saveReceiptRequest);
              //   });
              // }, 1000); 
              }
            });
          }
      },
      saveInsurance: function() { /* Guardar como poliza */
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        $scope.dataToSave = angular.copy(order.form);
        if($scope.dataToSave.startDate) {   
          var startDate = new Date( $scope.dataToSave.start_of_validity).setHours(12,0,0,0);
          var endingDate = new Date( $scope.dataToSave.end_of_validity).setHours(11,59,59,0);
          $scope.dataToSave.startDate = new Date(startDate);
          $scope.dataToSave.endingDate = new Date(endingDate);

        } else {
          var startDate = new Date(mesDiaAnio($scope.dataToSave.startDate)).setHours(12,0,0,0);
          var endingDate = new Date(mesDiaAnio($scope.dataToSave.endingDate)).setHours(11,59,59,0);
          $scope.dataToSave.startDate = new Date(startDate);
          $scope.dataToSave.endingDate = new Date(endingDate);
        }
        if (order.form.startDate) {
          $scope.dataToSave.start_of_validity = datesFactory.toDate(order.form.startDate);
          $scope.dataToSave.end_of_validity = datesFactory.toDate(order.form.endingDate);
        }

        $scope.dataToSave.give_comision = order.form.give_comision;

        if(!canBePoliza()){return;} /* Validaciones */
        if (!validate2()) {return;} /* Validación de recibos y no. póliza */

        $q.all([
          helpers.existPolicy('renovaciones_modulo').then(checkPromise),
        ])
        .then(function(val) {

          if (val[0] === true) {
            l.stop();
            SweetAlert.swal('Error','Esta número de póliza ya existe.','error');
          } else {

            if($scope.dataToSave.start_of_validity) {
     
              var startDate = new Date( $scope.dataToSave.start_of_validity).setHours(12,0,0,0);
              var endingDate = new Date( $scope.dataToSave.end_of_validity).setHours(11,59,59,0);
              $scope.dataToSave.startDate = new Date(startDate);
              $scope.dataToSave.endingDate = new Date(endingDate);

            } else {
              var startDate = new Date(mesDiaAnio($scope.dataToSave.startDate)).setHours(12,0,0,0);
              var endingDate = new Date(mesDiaAnio($scope.dataToSave.endingDate)).setHours(11,59,59,0);
              $scope.dataToSave.startDate = new Date(startDate);
              $scope.dataToSave.endingDate = new Date(endingDate);
            }

            $scope.dataToSave.contratante = $scope.dataToSave.contratante.value;

            $scope.dataToSave.vendor = '';
            try{
              $scope.dataToSave.vendor = order.form.vendor.url;
            }
            catch(e){}
            
            var form = angular.copy($scope.dataToSave);
            var fromDate = $scope.dataToSave.startDate;
            var today = new Date(new Date().toISOString().split('T')[0]);
            var obsevaciones = $scope.dataToSave.observations;
            form = getFormData(form, $scope.dataToSave.vendor);
            form.observations = obsevaciones;
            form.f_currency = order.f_currency.f_currency_selected;
            form.conducto_de_pago = order.conducto_de_pago.conducto_de_pago_selected;
            form.is_renewable = order.renewal.is_renewable;
            
            var auxDate = new Date($scope.dataToSave.startDate.getTime() - 86400000);
            form.status = auxDate > new Date() ? 10 : 14;
            
            form.address = $scope.dataToSave.address.url;
            form.clave = $scope.dataToSave.clave.url;

            form.p_neta = order.poliza.primaNeta;
            form.p_total = order.poliza.primaTotal;
            form.derecho = order.poliza.derecho;
            form.rpf = order.poliza.rpf;
            form.iva = order.poliza.iva;
            form.descuento = order.poliza.descuento;

            if(order.receipts.length) {
              if($scope.change_domiciliado) {
                if(order.form.domiciliado) {
                  var domiciliado = true;
                } else {
                  var domiciliado = false;
                }
              }

              order.receipts.forEach(function(item) {
                item.is_cat = domiciliado;
                var init = new Date(mesDiaAnio(item.fecha_inicio)).setHours(12,0,0,0);
                var end = new Date(mesDiaAnio(item.fecha_fin)).setHours(11,59,59,0);

                // item.endingDate = new Date(end);
                item.fecha_fin = new Date(end);
                // item.startDate = new Date(init);
                item.fecha_inicio = new Date(init);

                if(item.vencimiento) {
                  var vencimiento = new Date(toDate(item.vencimiento)).setHours(11.59,59,0);
                  item.vencimiento = new Date(vencimiento);
                }
                item.comision = item.comision ? parseFloat(item.comision).toFixed(2) : 0

              });
            }
            var url_order = angular.copy(order.defaults);

            if($scope.dataToSave.ceder_comision) {
              form.udi = $scope.dataToSave.udi;
              if($scope.dataToSave.comision_percent) {
                form.comision_percent = $scope.dataToSave.comision_percent;
              } else {
                form.comision_percent = $scope.dataToSave.clave.comission;
              }
            } else {
              if($scope.dataToSave.comision_percent) {
                form.comision_percent = $scope.dataToSave.comision_percent;
              } else {
                form.comision_percent = $scope.dataToSave.clave.comission;
              }
              form.udi = ($scope.dataToSave.clave.udi);
            }

            if($scope.dataToSave.udi) {
              form.udi = $scope.dataToSave.udi;
              form.comision = parseFloat(form.p_neta) * parseInt($scope.dataToSave.comision_percent);
            } else {

              if($scope.dataToSave.comision) {
                form.udi = $scope.dataToSave.comision.udi;
                var percent_ = parseInt($scope.dataToSave.comision.comission) / 100;
                form.comission = form.p_neta * percent_;
                form.comision = parseFloat(form.p_neta) * percent_;
              } else {
                form.udi = 0;
                var percent_ = parseInt($scope.dataToSave.comision.comission) / 100;
                form.comision = form.p_neta * percent_;
                form.comission = parseFloat(form.p_neta) * percent_;
              }
            }

            if($scope.dataToSave.comision_percent) {
              var percent_ = parseFloat($scope.dataToSave.comision_percent) / 100;
              form.comision = (parseFloat(form.p_neta) * percent_).toFixed(2);
            } else {
              var percent_ = parseFloat($scope.dataToSave.comision.comission) / 100;
              form.comission = (parseFloat(form.p_neta) * percent_).toFixed(2);
              form.comision = (parseFloat(form.p_neta) * percent_).toFixed(2);
            }

            form.comision = order.comision;
            form.comision_percent = order.comision_percent;

            form.internal_number = $scope.internal_number; 
            if(order.form.responsable){
              form.responsable = order.form.responsable ? order.form.responsable.url : '';
            }
            if(order.form.collection_executive){
              form.collection_executive = order.form.collection_executive ? order.form.collection_executive.url : '';
            }
            if(order.form.sucursal){
              form.sucursal = order.form.sucursal ? order.form.sucursal.url : '';
            }
            if (!form.comision) {
              form.comision = 0
            }else{
              form.comision = parseFloat(form.comision).toFixed(2)
            }
            if (isNaN(form.comision)) {
              form.comision = 0
            }
            form.recibos_poliza = order.receipts;
            form.recibos_poliza.forEach(function (recibo, index){
              form.recibos_poliza[index]['conducto_de_pago'] = form.conducto_de_pago;
            })
            form.state_circulation = order.form.state_circulation ? order.form.state_circulation.state : '';
            form.business_line = order.form.business_line ? order.form.business_line : 0;
            form.celula = order.form.celula ? order.form.celula.url : '';
            form.groupinglevel = order.form.subsubgrouping ? order.form.subsubgrouping.url : order.form.subgrouping ? order.form.subgrouping.url : order.form.grouping_level ? order.form.grouping_level.url : '';
            /* Creación de la póliza */
            // console.log('conducto_de_pago --reno..',form,order.form,order.conducto_de_pago)
            insuranceService.createInsuranceReno(form).then(function(res) {
              $scope.yaTermino=false;
              $scope.idPolicy = res.id;
              assignGeneralConditionsToPolicy(res);
              resetRenovationDraft();
              $scope.poliza_data = myInsurance;
              var data = {
                renewed_status: 1,
                status: 12,
              }
              try{
                var serial =order && order.subforms && order.subforms.auto && order.subforms.auto.serial ? normalizeVIN(order.subforms.auto.serial): null;
                var st = order._vinWarningState || {};
                var finalHasInvalid = !!(serial && hasInvalidVinLetters(serial));

                // Aquí va tu llamada real al backend para guardar la póliza:
                order._saving = true;    
                var shouldLog =
                  hasInvalidVinLetters(serial) &&
                  st.warned === true &&
                  st.userAcknowledged === true &&
                  st.warnedVinValue === serial; // opcional pero recomendado
                if(serial || shouldLog){
                  var serial = normalizeVIN(order.subforms.auto.serial);
                  var st = order._vinWarningState || {};
                  if (hasInvalidVinLetters(serial) && st.userAcknowledged && st.warnedVinValue === serial) {
                    // aquí haces tu log                 
                    var logInvalidSerial = {
                      'model': 1,
                      'event': "POST",
                      'associated_id': $scope.idPolicy,
                      'identifier': 'creó la póliza con una serie inválida. La serie contiene los caracteres ‘I’, ‘O’ u ‘Q’, los cuales no son válidos.('+serial+')',
                    }
                    dataFactory.post('send-log/', logInvalidSerial).then(function success(response_x) {
                      console.log('-------ren-VIN_INVALID_OIQ_SAVED-----',response_x)
                    });
                  }
                }
              }catch(u){}
              if(res.id){
                var params = {
                  'model': 1,
                  'event': "POST",
                  'associated_id': res.id,
                  'identifier': "creó la renovación a partir de la póliza " + myInsurance.poliza_number + "."
                }
                dataFactory.post('send-log/', params).then(function success(response) {
                  
                });

                var params = {
                  'model': 1,
                  'event': "POST",
                  'associated_id': myInsurance.id,
                  'identifier': "renovó la póliza a " + res.poliza_number + "."
                }
                dataFactory.post('send-log/', params).then(function success(response) {
                  
                });
                if (order.delete_receitps) {
                  if (order.delete_receitps.length > 0) {
                    var params_del_rec = {
                      'model': 1,
                      'event': "DELETE",
                      'associated_id': res.id,
                      'identifier': 'elimino recibos al crear la póliza (vigencia menor de un año)',
                    }
                    dataFactory.post('send-log/', params_del_rec).then(function success(response_x) {
                    });
                  }
                }
                /* Actualiza la póliza antigua */
                var urlCh = myInsurance.url;
                console.log('urlCh********+',urlCh, $scope.poliza_data.url,myInsurance.url)
                if (urlCh){
                  $http.patch(urlCh, data);

                }

                /* Relación con la póliza original */
                var oldPolicy = {
                  policy: myInsurance.poliza_number,
                  base_policy: myInsurance.url,
                  new_policy: res.url
                }

                insuranceService.createOldPolicy(oldPolicy)
                  .then(function(responseOldPolicy){
                });
              }
              /*Actualización de Contratante*/
              $scope.contractorToSave = {};

              if(order.form.contratante.email){
                $scope.contractorToSave.email = order.form.contratante.email;
              }else{
                $scope.contractorToSave.email = '';
              }
              if(order.form.contratante.phone_number){
                $scope.contractorToSave.phone_number = order.form.contratante.phone_number
              }else{
                $scope.contractorToSave.phone_number = ''
              }
              $http.patch(order.form.contratante.value.url,$scope.contractorToSave)
                .then(function(data) {
                  if(data.status == 200 || data.status == 201){
                    toaster.info('Contratante Actualizado')
                  }
              });
              // varios referenciadores
              console.log("Referenciadores:", $scope.referenciadores);

              for (var i = 0; i < $scope.referenciadores.length; i++) {
                if (!$scope.referenciadores[i]) {
                    continue;
                }            
                $scope.referenciadores[i].policy = res.url;
                $scope.ref_policy = $scope.referenciadores[i];
                if ($scope.ref_policy) {
                    if ($scope.referenciadores[i].referenciador) {
                        var ref = {};
                        ref.referenciador = $scope.referenciadores[i].referenciador;
                        ref.comision_vendedor = $scope.referenciadores[i].comision_vendedor || 0;
                        ref.policy = res.url;
            
                        dataFactory.post('referenciadores-policy/', ref)
                        .then(
                            function success(request) {
                                // Handle success
                            },
                            function error(error) {
                                console.log(error);
                            }
                        )
                        .catch(function (e) {
                            console.log(e);
                        });
                    }
                }
              }
                        
              // varios referenciadores

              if($localStorage.dataFileR && $scope.read_pdf_ren){
                try{
                  $localStorage.dataFileR.append('owner',$scope.idPolicy)
                  try{
                    $http.patch(data.data.url,{'from_pdf':true});
                  }catch(u){}
                  var xhr_file = new XMLHttpRequest();
                  // xhr_file.open("POST", url.SERVICE_PDF);
                  xhr_file.open("POST", url.IP+'polizas/' + $scope.idPolicy + '/archivos/?org='+$scope.orgName);
                  xhr_file.timeout = 1200000;
                  xhr_file.ontimeout = function (e) {
                    console.log('error file',e)
                  };
                  xhr_file.setRequestHeader('Authorization', 'Bearer ' + token);
                  xhr_file.send($localStorage.dataFileR);
                  xhr_file.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                      $scope.fileUP = JSON.parse(xhr_file.response);
                      $localStorage.dataFileR={};
                    }
                  }
                }catch(efile){
                  console.log('nose cargo el pdf leído',efile)
                }
              }
              /* Sube archivos */
              uploadFiles(res.id);
              order.defaults.policyUrl = res.url;
              url_order.policyUrl = {'url': res.url};
              toaster.success(MESSAGES.OK.RENEWALPOLICY);
              var code = order.defaults.formInfo.code;
              /* Formularios por ramo */

              if (code === 9) {
                  var auto = angular.copy(order.subforms.auto);
                  if(auto.policy_type && auto.policy_type.id){
                    auto.policy_type=auto.policy_type.id;
                  }
                  if(auto.procedencia && auto.procedencia.id){
                    auto.procedencia=auto.procedencia.id;
                  }
                  auto.sub_branch = res.subramo;
                  auto.policy = res.url;
                  auto.org = res.org;
                
                  var submitObject = {
                      code : code,
                      insurance: res,
                      form: auto,
                      policy: order.insuranceObject.id
                  }
  
                  formService.createForm(submitObject)
                      .then(function(resAuto){
                        $scope.yaTermino=true;
                        gopolicieinfo($scope.idPolicy,res);
                      });
              } else if (code === 1 || code === 30) {
                  // Personal information
                  var life = order.subforms.life;
                  var beneficiaries = order.subforms.life.beneficiariesList;
                  var personal = order.subforms.life.aseguradosList;
                  var asegurados_1 = [];                
                  
                  var submitObject = {
                      code: code,
                      relationships: beneficiaries,
                      insurance: res,
                      smoker: order.subforms.life.smoker,
                      policy: order.insuranceObject.id,
                      policy_type: life.policy_type
                  }
                  personal.forEach(function(prs,index) {
                    if (i == 0) {
                      var personal_1= {
                        first_name: prs.first_name ? prs.first_name : "",
                        last_name: prs.last_name ? prs.last_name : "",
                        second_last_name: prs.second_last_name ? prs.second_last_name : "",
                        birthdate: prs.birthdate ? ((prs.birthdate)) : new Date(),
                        antiguedad: prs.antiguedad ? ((prs.antiguedad)) : new Date(),
                        sex : prs.sex ? prs.sex : "",
                        full_name: prs.first_name + ' ' + prs.last_name + ' ' + prs.second_last_name
                      };
                      var personal_a = {
                          first_name: personal_1[0].first_name ? personal_1[0].first_name : '',
                          last_name: personal_1[0].last_name ? personal_1[0].last_name : '',
                          second_last_name: personal_1[0].second_last_name ? personal_1[0].second_last_name : '',
                          birthdate: personal_1[0].birthdate,
                          antiguedad: personal_1[0].antiguedad ? personal_1[0].antiguedad : null,
                          sex: personal_1[0].sex ? personal_1[0].sex : ''
                      };
                      submitObject.personal = personal_a;
                    }else{
                      asegurados_1.push(prs)
                    }

                  })
                  submitObject.personal_life_policy = asegurados_1;
                  formService.createForm(submitObject)
                      .then(function(response){
                        $scope.yaTermino=true;
                        gopolicieinfo($scope.idPolicy,res);
                      });
              } else if (code === 2 || code === 3 || code === 4) {
                  var disease = order.subforms.disease;
                  var relationships = order.subforms.disease.relationshipList;

                  var type = helpers.diseaseType(order.defaults.formInfo.code);
                  var personal = {
                      first_name: disease.first_name ? disease.first_name : '',
                      last_name: disease.last_name ? disease.last_name : '',
                      second_last_name: disease.second_last_name ? disease.second_last_name : '',
                      birthdate: disease.birthdate,
                      antiguedad: disease.antiguedad ? disease.antiguedad : null,
                      sex: disease.sex ? disease.sex : '',
                      policy_type: disease.policy_type,
                  };

                  var submitObject = {
                      code : code,
                      personal: personal,
                      relationships: relationships,
                      coinsurance: disease.coinsurance,
                      insurance: res,
                      policy: order.insuranceObject.id
                  }

                  formService.createForm(submitObject)
                      .then(function(response){
                        $scope.yaTermino=true;
                        gopolicieinfo($scope.idPolicy,res);
                      });
              } else if (code === 5 || code === 6 || code === 7 || code === 8 || code === 10 || code === 11 || code === 12 || code === 13 || code === 14 || code === 31) {
                  var damage = order.subforms.damage;
                  var type = helpers.damageType(parseInt(code));

                  damage.sub_branch = res.subramo;
                  damage.damage_type = order.subforms.damage.damage_type;
                  damage.policy = res.url;

                  var submitObject = {
                      insurance: res,
                      code: code,
                      form: damage,
                      policy: order.insuranceObject.id
                  }
                  formService.createForm(submitObject)
                      .then(function(res){
                        $scope.yaTermino=true;
                        gopolicieinfo($scope.idPolicy,res);
                      });
              }

              /* Guarda coberturas */
              $scope.totalcoberturas = order.defaults.coverages.length;
              $scope.totalcreadas = 0;
              if (order.defaults.coverages.length > 0) {
                for(var i=0; i<order.defaults.coverages.length; i++){
                  $scope.totalcreadas =$scope.totalcreadas+1;
                  if (order.defaults.coverages[i] && order.defaults.coverages[i].sumInPolicy) {
                    order.defaults.coverages[i].sum_insured = order.defaults.coverages[i].sumInPolicy && order.defaults.coverages[i].sumInPolicy.value ? order.defaults.coverages[i].sumInPolicy.value : 0;
                    order.defaults.coverages[i].deductible = order.defaults.coverages[i].deductibleInPolicy ? order.defaults.coverages[i].deductibleInPolicy.value : 0;
                  }
                }
                helpers.createCoverages(order.defaults.coverages, res);
              }
              l.stop();
              // if($scope.yaTermino){
              SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWPOLICY, "success")
              // if($scope.totalcreadas == $scope.totalcoberturas){
              //   gopolicieinfo($scope.idPolicy,res);
              // }
              // gopolicieinfo($scope.idPolicy,res);
              // }
              
            });


            // setTimeout(function() {

            //   order.receipts.forEach(function(receipt,index){
                
            //     var initDate = new Date(receipt.startDate);
            //     var endDate = new Date(receipt.endingDate);
            //     var vencimiento = new Date(receipt.vencimiento);

            //     var saveReceiptRequest = {
            //       poliza: url_order.policyUrl.url ,
            //       recibo_numero: index + 1,
            //       prima_neta: receipt.prima ? receipt.prima : receipt.prima_neta,
            //       rpf: receipt.rpf,
            //       derecho: receipt.derecho,
            //       iva: receipt.iva,
            //       sub_total: receipt.subTotal ? receipt.subTotal : receipt.sub_total,
            //       prima_total: receipt.total ? receipt.total : receipt.prima_total,
            //       status: 4,
            //       startDate: new Date(initDate),
            //       endingDate: new Date(endDate),
            //       fecha_inicio: new Date(initDate),
            //       fecha_fin: new Date(endDate),
            //       vencimiento: new Date(vencimiento),
            //       description: "",
            //       receipt_type:1,
            //       comision: (parseFloat(receipt.comision)).toFixed(2),
            //       is_cat : receipt.is_cat  
            //     };

            //     receiptService.createReceiptService(saveReceiptRequest)
            //     .then(function(response){
            //     });

            // });
            // }, 1000);
          }

        }); 
      },
      cloneInsurance: function() { // guardar como no renovación   
        $scope.dataToSave = angular.copy(order.form)
        if ($scope.dataToSave.celula && $scope.dataToSave.celula.url) {
          $scope.dataToSave.celula = $scope.dataToSave.celula.url
        }
        if ($scope.dataToSave.conducto_de_pago && $scope.dataToSave.conducto_de_pago.conducto_de_pago_selected) {
          $scope.dataToSave.conducto_de_pago = $scope.dataToSave.conducto_de_pago.conducto_de_pago_selected
        }
        if($scope.dataToSave.start_of_validity) {   
          var startDate = new Date( $scope.dataToSave.start_of_validity).setHours(12,0,0,0);
          var endingDate = new Date( $scope.dataToSave.end_of_validity).setHours(11,59,59,0);
          $scope.dataToSave.startDate = new Date(startDate);
          $scope.dataToSave.endingDate = new Date(endingDate);

        } else {
          var startDate = new Date(mesDiaAnio($scope.dataToSave.startDate)).setHours(12,0,0,0);
          var endingDate = new Date(mesDiaAnio($scope.dataToSave.endingDate)).setHours(11,59,59,0);
          $scope.dataToSave.startDate = new Date(startDate);
          $scope.dataToSave.endingDate = new Date(endingDate);
        }

        if(!canBePoliza()){return;} /*Validación de contratante */
        if (!validate2()) {return;} /*Validación de recibos y no. póliza */

        $q.all([
          helpers.existPolicy('renovaciones_modulo').then(checkPromise),
        ])
        .then(function(val) {

          if (val[0] === true) {
            l.stop();
            SweetAlert.swal('Error','Esta número de póliza ya existe.','error');
          } else {

            if($scope.dataToSave.start_of_validity) {
      
              var startDate = new Date( $scope.dataToSave.start_of_validity).setHours(12,0,0,0);
              var endingDate = new Date( $scope.dataToSave.end_of_validity).setHours(11,59,59,0);
              $scope.dataToSave.startDate = new Date(startDate);
              $scope.dataToSave.endingDate = new Date(endingDate);

            } else {
              var startDate = new Date(mesDiaAnio($scope.dataToSave.startDate)).setHours(12,0,0,0);
              var endingDate = new Date(mesDiaAnio($scope.dataToSave.endingDate)).setHours(11,59,59,0);
              $scope.dataToSave.startDate = new Date(startDate);
              $scope.dataToSave.endingDate = new Date(endingDate);
            }

            $scope.dataToSave.contratante = $scope.dataToSave.contratante.value;

            var form = angular.copy($scope.dataToSave);
            var fromDate = $scope.dataToSave.startDate;
            var today = new Date(new Date().toISOString().split('T')[0]);
            var obsevaciones = $scope.dataToSave.observations;
            form = getFormData(form);
            form.observations =obsevaciones;
            
            var auxDate = new Date($scope.dataToSave.startDate.getTime() - 86400000);
            form.status = auxDate > new Date() ? 10 : 14;
            
            form.address = $scope.dataToSave.address.url;
            form.clave = $scope.dataToSave.clave.url;
            form.f_currency =order.f_currency;
            form.conducto_de_pago =order.conducto_de_pago;

            form.p_neta = order.poliza.primaNeta;
            form.p_total = order.poliza.primaTotal;
            form.derecho = order.poliza.derecho;
            form.rpf = order.poliza.rpf;
            form.iva = order.poliza.iva;

            if(order.receipts.length) {
              order.receipts.forEach(function(item) {
                var init = new Date(mesDiaAnio(item.fecha_inicio)).setHours(12,0,0,0);
                var end = new Date(mesDiaAnio(item.fecha_fin)).setHours(11,59,59,0);

                item.startDate = new Date(init);
                item.endingDate = new Date(end);
                if(item.vencimiento) {
                  var vencimiento = new Date(toDate(item.vencimiento)).setHours(11.59,59,0);
                  item.vencimiento = new Date(vencimiento);
                }
                item.comision = item.comision ? parseFloat(item.comision).toFixed(2) : 0
              });
            }


            var url = angular.copy(order.defaults);

            if($scope.dataToSave.ceder_comision) {
              form.udi = $scope.dataToSave.udi;
              if($scope.dataToSave.comision_percent) {
                form.comision_percent = $scope.dataToSave.comision_percent;
              } else {
                form.comision_percent = $scope.dataToSave.clave.comission;
              }
            } else {
              if($scope.dataToSave.comision_percent) {
                form.comision_percent = $scope.dataToSave.comision_percent;
              } else {
                form.comision_percent = $scope.dataToSave.clave.comission;
              }
              form.udi = ($scope.dataToSave.clave.udi);
            }

            if($scope.dataToSave.udi) {
              form.udi = $scope.dataToSave.udi;
              form.comision = form.p_neta * parseInt($scope.dataToSave.comision_percent);
            } else {

              if($scope.dataToSave.comision) {
                form.udi = $scope.dataToSave.comision.udi;
                var percent_ = parseInt($scope.dataToSave.comision.comission) / 100;
                form.comision = form.p_neta * percent_;
                form.comission = form.p_neta * percent_;
              } else {
                form.udi = 0;
                var percent_ = parseInt($scope.dataToSave.comision.comission) / 100;
                form.comision = form.p_neta * percent_;
                form.comission = form.p_neta * percent_;
              }
            }

            if($scope.dataToSave.comision_percent) {
              var percent_ = parseFloat($scope.dataToSave.comision_percent) / 100;
              form.comision = (parseFloat(form.p_neta) * percent_).toFixed(2);
            } else {
              var percent_ = parseFloat($scope.dataToSave.comision.comission) / 100;
              form.comision = (parseFloat(form.p_neta) * percent_).toFixed(2);
              form.comission = (parseFloat(form.p_neta) * percent_).toFixed(2);
            }


            form.internal_number = $scope.internal_number   
            if(order.form.responsable){
              form.responsable = order.form.responsable ? order.form.responsable.url : '';
            } 
            if(order.form.collection_executive){
              form.collection_executive = order.form.collection_executive ? order.form.collection_executive.url : '';
            } 
            if(order.form.sucursal){
              form.sucursal = order.form.sucursal ? order.form.sucursal.url: '';
            }          
            if (!form.comision) {
              form.comision = 0
            }
            form.business_line = order.form.business_line ? order.form.business_line : 0;
            /* Creación de la póliza */

            if (form.celula && form.celula.url) {
              form.celula = form.celula.url
            }
            if (form.conducto_de_pago && form.conducto_de_pago.conducto_de_pago_selected) {
              form.conducto_de_pago = form.conducto_de_pago.conducto_de_pago_selected
            }
            if (form.grouping_level && form.grouping_level.grouping_level_selected) {
              form.grouping_level = form.grouping_level.grouping_level_selected
            }
            if(isNaN(form.comision)){
              form.comision = 0
              if ($scope.dataToSave.comision) {
                form.comision = $scope.dataToSave.comision ? $scope.dataToSave.comision : 0
              }
            }
            form.recibos_poliza =[]

            order.receipts.forEach(function(receipt,index){
                var initDate = new Date(receipt.startDate);
                var endDate = new Date(receipt.endingDate);
                var vencimiento = new Date(receipt.vencimiento);
                var saveReceiptRequest = {
                  // poliza: url.policyUrl.url ,
                  recibo_numero: index + 1,
                  prima_neta: receipt.prima ? receipt.prima : receipt.prima_neta,
                  rpf: receipt.rpf,
                  derecho: receipt.derecho,
                  iva: receipt.iva,
                  sub_total: receipt.subTotal ? receipt.subTotal : receipt.sub_total,
                  prima_total: receipt.total ? receipt.total : receipt.prima_total,
                  status: 4,
                  startDate: new Date(initDate),
                  endingDate: new Date(endDate),
                  fecha_inicio: new Date(initDate),
                  fecha_fin: new Date(endDate),
                  vencimiento: new Date(vencimiento),
                  description: "",
                  receipt_type:1,
                  comision: receipt.comision ? (parseFloat(receipt.comision)).toFixed(2) : 0,
                  is_cat : receipt.is_cat
                };
                form.recibos_poliza.push(saveReceiptRequest)
            });
            form.document_type=1
            insuranceService.createInsuranceNoRenovacion(form).then(function(res) {
              
              if(myInsurance.status == 13){
                var data = {
                  status: 12
                }
                /* Actualiza la póliza antigua */
                $http.patch(myInsurance.url, data);
              } 
              /*Actualización de Contratante*/
              $scope.contractorToSave = {};

              if(order.form.contratante.email){
                $scope.contractorToSave.email = order.form.contratante.email;
              }else{
                $scope.contractorToSave.email = '';
              }
              if(order.form.contratante.phone_number){
                $scope.contractorToSave.phone_number = order.form.contratante.phone_number
              }else{
                $scope.contractorToSave.phone_number = ''
              }
              $http.patch(order.form.contratante.value.url,$scope.contractorToSave)
                .then(function(data) {
                  if(data.status == 200 || data.status == 201){
                    toaster.info('Contratante Actualizado')
                  }
              });
              /* Relación con la póliza original */
              var oldPolicy = {
                policy: myInsurance.poliza_number,
                base_policy: myInsurance.url,
                new_policy: res.url
              }
              assignGeneralConditionsToPolicy(res);

              insuranceService.createOldPolicy(oldPolicy)
              .then(function(responseOldPolicy){
              });
              // varios referenciadores
              for (var i = 0; i < $scope.referenciadores.length; i++) {
                if (!$scope.referenciadores[i]) {
                    continue;
                }            
                // Existing logic
                $scope.referenciadores[i].policy = res.url;
                $scope.ref_policy = $scope.referenciadores[i];            
                if ($scope.ref_policy && $scope.referenciadores[i].referenciador) {
                    var ref = {
                        referenciador: $scope.referenciadores[i].referenciador,
                        comision_vendedor: $scope.referenciadores[i].comision_vendedor || 0,
                        policy: res.url
                    };            
                    dataFactory.post('referenciadores-policy/', ref)
                    .then(
                        function success(request) {
                            console.log("Success:", request);
                        },
                        function error(error) {
                            console.error("Error in post:", error);
                        }
                    )
                    .catch(function (e) {
                        console.error("Catch error:", e);
                    });
                }
              }            
              // varios referenciadores
              /* Sube archivos */
              uploadFiles(res.id);

              order.defaults.policyUrl = res.url;
              url.policyUrl = {'url': res.url};

              toaster.success(MESSAGES.OK.RENEWALPOLICY);
              var code = order.defaults.formInfo.code;

              /* Formularios por ramo */
              if (code === 9) {
                  var auto = angular.copy(order.subforms.auto);
                  auto.sub_branch = res.subramo;
                  auto.policy = res.url;
                  auto.org = res.org;
                 
                  var submitObject = {
                      code : code,
                      insurance: res,
                      form: auto,
                      policy: order.insuranceObject.id
                  }
      
                  formService.createForm(submitObject)
                      .then(function(resAuto){

                      });
              } else if (code === 1 || code === 30) {
                  // Personal information
                  var life = order.subforms.life;
                  var personal = order.subforms.life.aseguradosList;
                  var beneficiaries = order.subforms.life.beneficiariesList;
                  var asegurados_1 = [];                
                  
                  var submitObject = {
                      code: code,
                      relationships: beneficiaries,
                      insurance: res,
                      smoker: order.subforms.life.smoker,
                      policy: order.insuranceObject.id,
                      policy_type: life.policy_type
                  }
                  var personal_a = {}
                  personal.forEach(function(prs,index) {
                    if (index == 0) {
                      var personal_1= {
                        first_name: prs.first_name ? prs.first_name : "",
                        last_name: prs.last_name ? prs.last_name : "",
                        second_last_name: prs.second_last_name ? prs.second_last_name : "",
                        birthdate: prs.birthdate ? ((prs.birthdate)) : new Date(),
                        antiguedad: prs.antiguedad ? ((prs.antiguedad)) : new Date(),
                        sex : prs.sex ? prs.sex : "",
                        full_name: prs.first_name + ' ' + prs.last_name + ' ' + prs.second_last_name,
                        smoker:prs.smoker ? prs.smoker : 'False' 
                      };
                      var personal_a = {
                          first_name: personal_1.first_name ? personal_1.first_name : '',
                          last_name: personal_1.last_name ? personal_1.last_name : '',
                          second_last_name: personal_1.second_last_name ? personal_1.second_last_name : '',
                          birthdate: personal_1.birthdate,
                          antiguedad: personal_1.antiguedad ? personal_1.antiguedad : null,
                          sex: personal_1.sex ? personal_1.sex : '',
                          smoker:personal_1.smoker ? personal_1.smoker : 'False' 
                      };
                      submitObject.personal = personal_a;
                      if (personal_1.smoker == true) {
                        personal_1.smoker = 'True'
                      }else if (personal_1.smoker == false) {
                        personal_1.smoker = 'False'
                      }                                                           
                     
                      if (personal_a.smoker == true) {
                        personal_a.smoker = 'True'
                      }else if (personal_a.smoker == false) {
                        personal_a.smoker = 'False'
                      }
                      submitObject.personal = personal_a;
                    }else{
                       if (prs.smoker == true) {
                        prs.smoker = 'True'
                      }else if (prs.smoker == false) {
                        prs.smoker = 'False'
                      }
                      asegurados_1.push(prs)
                    }

                  })
                  submitObject.personal_life_policy = asegurados_1;
                  // submitObject.personal = personal_a;
                  formService.createForm(submitObject)
                      .then(function(response){

                      });
                          // var beneficiaries = order.subforms.life.beneficiariesList;
                          // var asegurados_life = order.subforms.life.aseguradosList;

                          // var personal = {
                          //     first_name: life.first_name ? life.first_name : '',
                          //     last_name: life.last_name ? life.last_name : '',
                          //     second_last_name: life.second_last_name ? life.second_last_name : '',
                          //     birthdate: life.birthdate,
                          //     sex: life.sex ? life.sex : ''
                          // };

                          // var submitObject = {
                          //     code: code,
                          //     personal: personal,
                          //     relationships: beneficiaries,
                          //     insurance: res,
                          //     smoker: order.subforms.life.smoker,
                          //     policy: order.insuranceObject.id
                          // }

                          // formService.createForm(submitObject)
                          //     .then(function(response){

                          //     });
              } else if (code === 2 || code === 3 || code === 4) {
                  var disease = order.subforms.disease;
                  var relationships = order.subforms.disease.relationshipList;

                  var type = helpers.diseaseType(order.defaults.formInfo.code);

                  var personal = {
                      first_name: disease.first_name ? disease.first_name : '',
                      last_name: disease.last_name ? disease.last_name : '',
                      second_last_name: disease.second_last_name ? disease.second_last_name : '',
                      birthdate: disease.birthdate,
                      antiguedad: disease.antiguedad ? disease.antiguedad : null,
                      sex: disease.sex ? disease.sex : '',
                      policy_type: disease.policy_type
                  };

                  var submitObject = {
                      code : code,
                      personal: personal,
                      relationships: relationships,
                      coinsurance: disease.coinsurance,
                      insurance: res,
                      policy: order.insuranceObject.id
                  }

                  formService.createForm(submitObject)
                      .then(function(response){
                      });
              } else if (code === 5 || code === 6 || code === 7 || code === 8 || code === 10 || code === 11 || code === 12 || code === 13 || code === 14 || code === 31) {
                  var damage = order.subforms.damage;
                  var type = helpers.damageType(parseInt(code));

                  damage.sub_branch = res.subramo;
                  damage.damage_type = order.subforms.damage.damage_type;
                  damage.policy = res.url;

                  var submitObject = {
                      insurance: res,
                      code: code,
                      form: damage,
                      policy: order.insuranceObject.id
                  }



                  formService.createForm(submitObject)
                      .then(function(resDamage){

                      });
              }

              /* Guarda coberturas */
              if (order.defaults.coverages.length > 0) {
                for(var i=0; i<order.defaults.coverages.length; i++){
                  order.defaults.coverages[i].sum_insured = order.defaults.coverages[i].sumInPolicy.value;
                  order.defaults.coverages[i].deductible = order.defaults.coverages[i].deductibleInPolicy.value;
                  order.defaults.coverages[i].coinsurance = order.defaults.coverages[i].coinsuranceInPolicy.value ? order.defaults.coverages[i].coinsuranceInPolicy.value : 0;
                  order.defaults.coverages[i].topecoinsurance = order.defaults.coverages[i].topeCoinsuranceInPolicy.value ? order.defaults.coverages[i].topeCoinsuranceInPolicy.value : 0;
                }
                helpers.createCoverages(order.defaults.coverages, res);
              }

              SweetAlert.swal("Hecho", MESSAGES.OK.NEWPOLICY, "success");
              //$state.go('polizas.info', {polizaId: res.id})              
              gopolicieinfo(res.id,$scope.poliza_data);
            });


            // setTimeout(function() {

            //   order.receipts.forEach(function(receipt,index){

            //     var initDate = new Date(receipt.startDate);
            //     var endDate = new Date(receipt.endingDate);
            //     var vencimiento = new Date(receipt.vencimiento);

            //     var saveReceiptRequest = {
            //       poliza: url.policyUrl.url ,
            //       recibo_numero: index + 1,
            //       prima_neta: receipt.prima ? receipt.prima : receipt.prima_neta,
            //       rpf: receipt.rpf,
            //       derecho: receipt.derecho,
            //       iva: receipt.iva,
            //       sub_total: receipt.subTotal ? receipt.subTotal : receipt.sub_total,
            //       prima_total: receipt.total ? receipt.total : receipt.prima_total,
            //       status: 4,
            //       startDate: new Date(initDate),
            //       endingDate: new Date(endDate),
            //       fecha_inicio: new Date(initDate),
            //       fecha_fin: new Date(endDate),
            //       vencimiento: new Date(vencimiento),
            //       description: "",
            //       receipt_type:1,
            //       comision: receipt.comision ? (parseFloat(receipt.comision)).toFixed(2) : 0,
            //       is_cat : receipt.is_cat
            //     };

            //     receiptService.createReceiptService(saveReceiptRequest)
            //     .then(function(response){
            //     });

            // });
            // }, 1000);
          }

        }); 
      },
      cancel: function(){
        $state.go('renovaciones.renovaciones');
      }
    };
    function gopolicieinfo (polizaid,data_){
      var name = 'Información Póliza';
      var route = 'polizas.info';
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
      if (polizaid) {
        var params = { 'polizaId': polizaid, 'url': polizaid,'fromRenewal': true }
        $state.go($scope.route_for_new_tab, params);        
      }else{
        if(data_ && data_.id){
          
          var params = { 'polizaId': data_.id, 'url': data_.id ,'fromRenewal': true }
          $state.go($scope.route_for_new_tab, params);                   
        }else{
          $state.go('polizas.table');
        }
      }
    }
    function normalizeVIN(vin) {
      return (vin || "").toString().trim().toUpperCase();
    }
    function hasInvalidVinLetters(vin) {
      return /[OIQ]/.test(normalizeVIN(vin));
    }
    order._vinWarningState = order._vinWarningState || {
      warned: false,           // ya se mostró alerta alguna vez
      warnedVinValue: null,    // con qué VIN se alertó
      userAcknowledged: false  // presionó OK
    };
    function showVinInvalidCharsAlert(vin, cb) {
      SweetAlert.swal({
        title: "Alerta",
        text:
          "<div style='text-align:left; line-height:1.5; font-size:14px;'>" +
            "<p style='margin:0 0 10px;'>" +
              "Por regla internacional, no existen números de serie vehicular (VIN) que contengan las letras <b>O</b>, <b>I</b> o <b>Q</b>." +
            "</p>" +
            "<p style='margin:0;'><b>Favor de revisar la serie capturada.</b></p>" +
          "</div>",
        type: "warning",
        html: true,
        showCancelButton: false,
        confirmButtonText: "OK",
        confirmButtonColor: "#2563eb",
        closeOnConfirm: true
      }, function () {
        if (typeof cb === "function") cb();
      });
    }
    $scope.validatePolicy = function(param, value){
      if (param == 'poliza' && !order.form.canCreate){
        SweetAlert.swal("Error", 'OPRIMA EL BOTON CALCULAR Y GENERAR RECIBOS', "error");
        return 
      }

      if(!order.receipts.length){
        order.receipts = order.recibos_poliza;
      }

      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      if(order.acceso_obl_ref){
        $scope.referenciadores_copy =  $scope.referenciadores.filter(function(item){
          return item && item.referenciador && isString(item.referenciador);
        })
        if(order.acceso_obl_ref){
          if(($scope.referenciadores && $scope.referenciadores.length ==0) || ($scope.referenciadores_copy && $scope.referenciadores_copy.length ==0)){
            SweetAlert.swal("Error", "Seleccione al menos un referenciador.", "error");
            l.stop();
            return              
          }
        }
      }
      
      var date1 = datesFactory.toDate((order.form.startDate));
      var date2 = datesFactory.toDate((order.form.endingDate));

      var since = toDate(order.form.startDate).getTime();
      var until = toDate(order.form.endingDate).getTime();

      $scope.arrayCoverage = order.defaults.coverages;
      $scope.count_coverage = 0;

      var flag_save_dependent = false;
      var flag_save_asegurado = false;

      if(param == 'poliza'){
        if(!order.form.poliza){
          l.stop();
          SweetAlert.swal("Error", MESSAGES.ERROR.POLICYNOREQUIRED, "error");
          return;
        }
      }
      if(!order.form.contratante.val){
        l.stop();
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORCONTRACTOR, "error");
        return;
      }
      if(!order.form.address){
        l.stop();
        SweetAlert.swal("Error", MESSAGES.ERROR.ADDRESS, "error");
        return;
      }
      if(!order.form.contratante.email && !order.form.contratante.phone_number){
        l.stop();
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORWITHOUTEMAIL, "error");
        return;
      }
      if(order.form.contratante.email){
        if(!validateEmail(order.form.contratante.email)){
          l.stop();
          SweetAlert.swal("Error", MESSAGES.ERROR.ERROREMAIL, "error");
          return;
        }

        function validateEmail(email) {
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(email);
        }
      }
      if(date1 > date2) {
        l.stop()
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATERANGE, "error");
        return;
      }
      if(!order.form.aseguradora){
        l.stop();
        SweetAlert.swal("Error", MESSAGES.ERROR.PROVIDERREQUIRED, "error");
        return;
      }
      if(!order.form.clave){
        l.stop();
        SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
        return;
      }
      if(!order.form.ramo){
        l.stop();
        SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
        return;
      }
      if(!order.form.subramo){
        l.stop();
        SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
        return;
      }
      if(order.form.ramo.ramo_code == 1){
        if(order.form.subramo.subramo_code != 30){
          if (order.subforms && order.subforms.life && Array.isArray(order.subforms.life.aseguradosList) && order.subforms.life.aseguradosList.length > 0 && 
            order.subforms.life.aseguradosList[0] && !order.subforms.life.aseguradosList[0].policy_type) {
            l.stop();
            SweetAlert.swal("Error", "Selecciona un tipo.", "error");
            return;
          }else{
            if(order.subforms && order.subforms.life && Array.isArray(order.subforms.life.aseguradosList) && order.subforms.life.aseguradosList.length > 0 && 
            order.subforms.life.aseguradosList[0] &&  order.subforms.life.aseguradosList[0].policy_type){
              console.log('continuar')
            }else if(order.subforms && order.subforms.life && Array.isArray(order.subforms.life.aseguradosList) && order.subforms.life.aseguradosList.length > 0 && 
            order.subforms.life.aseguradosList[0] && order.subforms.life.aseguradosList.length==0){
              l.stop();
              SweetAlert.swal("Error", "Revise el tipo, (agregue Asegurados)", "error");
              return;
            }
          }
        }
      }
      if(order.form.ramo.ramo_code == 2){
        if(!order.subforms.disease.policy_type){
          l.stop();
          SweetAlert.swal("Error", "Selecciona un tipo.", "error");
          return;
        }
      }
      if(order.form.ramo.ramo_code == 3){
        if(order.form.subramo.subramo_code == 9){
          if (order.subforms && order.subforms.auto && order.subforms.auto.serial) {
            // Normaliza siempre para comparar bien
            var serial = normalizeVIN(order.subforms.auto.serial);
            order._vinWarningState = order._vinWarningState || {
              warned: false,
              warnedVinValue: null,
              userAcknowledged: false
            };
            if (serial && hasInvalidVinLetters(serial)) {
              var st = order._vinWarningState;
              // Importante: comparar normalizado
              var alreadyWarnedThisValue =
                st.warned === true &&
                st.warnedVinValue === serial &&
                st.userAcknowledged === true;
              if (!alreadyWarnedThisValue) {
                st.warned = true;
                st.warnedVinValue = serial;
                st.userAcknowledged = false;
                // 🔴 si ya arrancaste loader/enproceso antes, deténlo aquí mismo
                // (porque vas a "volver" y no seguir)
                $scope.enproceso = false;
                if (l) l.stop();
                showVinInvalidCharsAlert(serial, function () {
                  // El usuario dio OK: solo marcamos que ya vio la alerta
                  st.userAcknowledged = true;
                  // ✅ NO continuar con el proceso
                  // Regresar/permitir corrección:
                  $scope.enproceso = false;
                  // si usas Ladda, deténlo aquí
                  l.stop();
                  // Si quieres llevar el foco al input de serie:
                  setTimeout(function () {
                    var el = document.querySelector("#vinInput, input[name='serial'], input[ng-model='order.subforms.auto.serial']");
                    if (el) el.focus();
                  }, 50);

                  // Si necesitas digest por estar en setTimeout:
                  if (!$scope.$$phase) $scope.$applyAsync();
                });
                return; // 🚫 cortas el flujo: NO guarda
              }
            }
          }
          if(!order.subforms.auto.policy_type){
            l.stop();
            $scope.enproceso = false;
            SweetAlert.swal("Error", MESSAGES.ERROR.ERRORTYPEAUTO, "error");
            return;
          }
        }else{
          if(!order.subforms.damage.damage_type){
            l.stop();
            $scope.enproceso = false;
            SweetAlert.swal("Error", "Selecciona un tipo.", "error");
            return;
          }
        }
      }
      // if(!order.form.comision){
      //   l.stop();
      //   SweetAlert.swal("Error", MESSAGES.ERROR.COMISSION, "error");
      //   return;
      // }
      if(!order.form.payment){
        l.stop();
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORPAYFORM, "error");
        return;
      }
      if(param == 'poliza'){
        if(!order.form.paquete){
          l.stop();
          SweetAlert.swal("Error", "Elige un paquete", "error");
          return;
        }
        if(order.form.subramo.subramo_code == 1){
          if(order.subforms.life.aseguradosList){
            order.subforms.life.aseguradosList.forEach(function(asegs, index){
              var idx = index + 1
              if (asegs) {
                  if(!asegs.first_name){
                    l.stop();
                    flag_save_asegurado = true;
                    SweetAlert.swal("Error","Agrega el nombre del asegurado  #" + idx, "error");
                    return;
                  }
                  if(!asegs.last_name){
                    l.stop();
                    flag_save_asegurado = true;
                    SweetAlert.swal("Error","Agrega el apellido paterno del asegurado  #" + idx, "error");
                    return
                  }
                  if(!asegs.birthdate){
                    l.stop();
                    flag_save_asegurado = true;
                    SweetAlert.swal("Error","Agrega la fecha de nacimiento del asegurado  #" + idx, "error");
                    return
                  }
                  if(!asegs.sex){
                    l.stop();
                    flag_save_asegurado = true;
                    SweetAlert.swal("Error","Agrega el sexo del asegurado  #" + idx, "error");
                    return
                  }
                }
            });
          }
          if (order.subforms.life.aseguradosList.length == 0) {
            l.stop();
            flag_save_asegurado = true;
            SweetAlert.swal("Error","Agrega al menos 1 asegurado", "error");
            return
          }

          // if(!order.subforms.life.first_name){
          //   l.stop();
          //   SweetAlert.swal("Error", "Agregue el nombre del asegurado", "error");
          //   return;
          // }
          // if(!order.subforms.life.last_name){
          //   l.stop();
          //   SweetAlert.swal("Error", "Agregue el apellido paterno del asegurado", "error");
          //   return;
          // }
          // if(!order.subforms.life.birthdate){
          //   l.stop();
          //   SweetAlert.swal("Error", "Agregue la fecha de nacimiento del asegurado", "error");
          //   return;
          // }
          // if(!order.subforms.life.sex){
          //   l.stop();
          //   SweetAlert.swal("Error", "Elige el sexo del asegurado", "error");
          //   return;
          // }
          // if(!order.subforms.life.smoker){
          //   l.stop();
          //   SweetAlert.swal("Error", "Responde si fuma o no el asegurado", "error");
          //   return;
          // }
          if(order.subforms.life.beneficiariesList){
            order.subforms.life.beneficiariesList.forEach(function(beneficiary, index){
              var idx = index + 1
              if(beneficiary.person == 1){
                if(!beneficiary.first_name){
                  l.stop();
                  flag_save_dependent = true;
                  SweetAlert.swal("Error","Agrega el nombre del beneficiario  #" + idx, "error");
                  return;
                }
                if(!beneficiary.last_name){
                  l.stop();
                  flag_save_dependent = true;
                  SweetAlert.swal("Error","Agrega el apellido paterno del beneficiario  #" + idx, "error");
                  return
                }
                if(!beneficiary.birthdate){
                  l.stop();
                  flag_save_dependent = true;
                  SweetAlert.swal("Error","Agrega la fecha de nacimiento del beneficiario  #" + idx, "error");
                  return
                }
                if(!beneficiary.sex){
                  l.stop();
                  flag_save_dependent = true;
                  SweetAlert.swal("Error","Agrega el sexo del beneficiario  #" + idx, "error");
                  return
                }
                if(!beneficiary.percentage){
                  l.stop();
                  flag_save_dependent = true;
                  SweetAlert.swal("Error","Agrega el porcentaje del beneficiario  #" + idx, "error");
                  return
                }
              }else if (beneficiary.person == 2) {
                if (!beneficiary.j_name) {
                  l.stop();
                  flag_save_dependent = true;
                  SweetAlert.swal("Error","Agrega la razón social del beneficiario  #" + idx, "error")
                  return;
                }
                if (!beneficiary.rfc) {
                  l.stop();
                  flag_save_dependent = true;
                  SweetAlert.swal("Error","Agrega el RFC del beneficiario  #" + idx, "error")
                  return;
                }
              }
            });
          }
        }
        if(order.form.subramo.subramo_code == 3){
          if(!order.subforms.disease.first_name){
            l.stop();
            SweetAlert.swal("Error", "Agregue el nombre del titular", "error");
            return;
          }
          if(!order.subforms.disease.last_name){
            l.stop();
            SweetAlert.swal("Error", "Agregue el apellido paterno del titular", "error");
            return;
          }
          if(!order.subforms.disease.birthdate){
            l.stop();
            SweetAlert.swal("Error", "Agregue la fecha de nacimiento del titular", "error");
            return;
          }
          if(!order.subforms.disease.sex){
            l.stop();
            SweetAlert.swal("Error", "Elige el sexo del titular", "error");
            return;
          }
          if(order.subforms.disease.relationshipList){
            order.subforms.disease.relationshipList.forEach(function(dependent, index){
              var idx = index + 1
              if(!dependent.first_name){
                l.stop();
                flag_save_dependent = true;
                SweetAlert.swal("Error","Agrega el nombre del dependiente  #" + idx, "error");
                return;
              }
              if(!dependent.last_name){
                l.stop();
                flag_save_dependent = true;
                SweetAlert.swal("Error","Agrega el apellido paterno del dependiente  #" + idx, "error");
                return
              }
              if(!dependent.relationship){
                l.stop();
                flag_save_dependent = true;
                SweetAlert.swal("Error","Elige el parentesco del dependiente  #" + idx, "error");
                return
              }
              if(!dependent.birthdate){
                l.stop();
                flag_save_dependent = true;
                SweetAlert.swal("Error","Agrega la fecha de nacimiento del dependiente  #" + idx, "error");
                return
              }
              if(!dependent.sex){
                l.stop();
                flag_save_dependent = true;
                SweetAlert.swal("Error","Agrega el sexo del dependiente  #" + idx, "error");
                return
              }
            });
          }
        }
        if(order.form.subramo.subramo_code == 7){
          if(!order.subforms.damage.insured_item){
            l.stop();
            SweetAlert.swal("Error", "Agrega el bien asegurado", "error");
            return;
          }
        }
        if(order.form.subramo.subramo_code == 9){
          if(!order.subforms.auto.brand){
            l.stop();
            SweetAlert.swal("Error", "Agrega la marca del automóvil", "error");
            return;
          }
          if(!order.subforms.auto.model){
            l.stop();
            SweetAlert.swal("Error", "Agrega el modelo del automóvil", "error");
            return;
          }
          if(!order.subforms.auto.year){
            l.stop();
            SweetAlert.swal("Error", "Elige el año del automóvil", "error");
            return;
          }
          if(!order.subforms.auto.version){
            l.stop();
            SweetAlert.swal("Error", "Agrega la versión del automóvil", "error");
            return;
          }
          if(!order.subforms.auto.serial){
            l.stop();
            SweetAlert.swal("Error", "Agrega la serie del automóvil", "error");
            return;
          }
          if(!order.subforms.auto.usage){
            l.stop();
            SweetAlert.swal("Error", "Elige el uso del automóvil", "error");
            return;
          }
          if(!order.subforms.auto.service){
            l.stop();
            SweetAlert.swal("Error", "Agrega el servicio del automóvil", "error");
            return;
          }
        }
        if($scope.arrayCoverage){
          for(var i = 0; i < $scope.arrayCoverage.length; i++){
            if($scope.arrayCoverage[i].deductibleInPolicy || $scope.arrayCoverage[i].sumInPolicy){
              $scope.count_coverage++;
            }
            // if(i+1 == $scope.arrayCoverage.length){
            //   if($scope.count_coverage == 0){
            //     l.stop();
            //     SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGESREQUIRED, "error");
            //     return;
            //   }
            // }
          };
        }
        if($scope.arrayCoverage && $scope.arrayCoverage.length == 0){
          l.stop();
          SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGESREQUIRED, "error");
          return;
        }
        if(order.receipts.length == 0){
          l.stop();
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRECEIPTS, "error");
          return;
        }
        else{
          var flag_save = false;
          order.receipts.forEach(function(receipt){
            if(!receipt.fecha_inicio || !receipt.fecha_fin){
              l.stop();
              flag_save = true;
              SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSDATES, "error");
              return;
            }
          });
          if (flag_save == true){
            l.stop();
            return;
          }
          var sinceReceipt = toDate(order.receipts[0].fecha_inicio).getTime();
          var untilReceipt = toDate(order.receipts[order.receipts.length - 1].fecha_fin).getTime();
        }
        if(since != sinceReceipt){
          l.stop();
          SweetAlert.swal("ERROR", MESSAGES.ERROR.DATESOUT, "error");
          return;
        }
        if(until != untilReceipt){
          l.stop();
          SweetAlert.swal("ERROR", MESSAGES.ERROR.DATESOUT, "error");
          return;
        }
        else{
          if(flag_save_dependent == false && flag_save_asegurado == false){
            if($scope.arrayCoverage.length == $scope.count_coverage){
              l.stop();
              if(value == 1){
                order.save.saveInsurance();
              }
              else if(value == 2){
                order.save.cloneInsurance();
              }
            }
            else{
              SweetAlert.swal({
                title: 'Coberturas sin datos',
                text: "Las coberturas sin suma asegurda y sin deducible no se guardarán, ¿Estás seguro de continuar?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si",
                cancelButtonText: "No",
                closeOnConfirm: false
              },
              function(isConfirm) {
                if (isConfirm) {
                  swal.close();
                  l.stop();
                  if(value == 1){
                    order.save.saveInsurance();
                  }
                  else if(value == 2){
                    order.save.cloneInsurance();
                  }
                }
                else{
                  l.stop();
                }
              });
            }
          }    
        }
      }
    };

    $scope.changeDomiciliado = function() {
      if(order.form.domiciliado){
        $scope.change_domiciliado = true;
      } else {
        $scope.change_domiciliado = false;
      }
    };

    $scope.changeIva = function (parValue) {

      if(!parValue) {
        swal("La póliza se creará sin IVA.")
      }
    }

    order.receiptOptions = {
    };

    order.receipts = [];
    order.defaults.showReceipts = true;
    order.amountReceipts = 0;
    order.poliza = {
      'primaNeta': 0,
      'descuento': null,
      'rpf': null,
      'derecho': 0,
      'subTotal': 0,
      'iva': null,
      'primaTotal': 0,
      'payment': $stateParams.myInsurance.forma_de_pago
    };
    order.recalcular = true;
    if(!myInsurance){
        insuranceService.getInsuranceRead($stateParams)
          .then(function(response){
            myInsurance = response;
            activate(); 
            getInternalNumber();      
            order.show.isPolicy = helpers.isPolicy(myInsurance);
          });
    }else{
        activate()                 
        getInternalNumber();
        order.show.isPolicy = helpers.isPolicy(myInsurance);
    }

    function ceder_comision(flag) {
      if(order.form.ceder_comision == true){
        if (flag == true){
          SweetAlert.swal({
                title: 'Ceder comisión',
                text: "¿Estas seguro de que deseas ceder la comisión?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si, estoy seguro.",
                cancelButtonText: "Cancelar",
                closeOnConfirm: true
            }, function(isConfirm) {
                if (isConfirm) {
                    $scope.ceder_comision = order.form.ceder_comision;                   
                }
                else{
                  order.form.ceder_comision = false;
                }
            });
        }
        else{
          $scope.ceder_comision = order.form.ceder_comision;
        }
      }
      else{
        $scope.ceder_comision = order.form.ceder_comision;
      }
    }
    // ---------------change comision
    // change comision --------------

    $scope.checkEndDate = function(){
      $scope.calcularDias();
    };

    $scope.calcularDias = function(){
      var date_initial = (order.form.startDate).split('/');
      var diaI = parseInt(date_initial[0]);
      var mesI = parseInt(date_initial[1]);
      var anioI = parseInt(date_initial[2]);
      var date_final = (order.form.endingDate).split('/');
      var diaF = parseInt(date_final[0]);
      var mesF = parseInt(date_final[1]);
      var anioF = parseInt(date_final[2]);

      var date1 = new Date(mesI + '/' + diaI + '/' + anioI);
      var date2 = new Date(mesF + '/' + diaF + '/' + anioF);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (isNaN(order.form.policy_days_duration)) {
        order.form.policy_days_duration = 365
      }
    };

    function convertDate(inputFormat) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    }
    
    // $scope.save_info_tab = function(){
    //   var draft = ensureRenovationDraft();
    //   console.log('fraaaaaaa',draft)
    //   if (!order.form.payment) {
    //     order.form.payment = {};
    //     order.form.payment.value = order.form.payment && order.form.payment.value ? order.form.payment : myInsurance.forma_de_pago  ? myInsurance.forma_de_pago : 1;
    //   }
    //   draft['id'] = $scope.polizaId;
    //   draft['identifier'] = order.form.identifier;
    //   draft['business_line'] = order.form.business_line;
    //   if(order.form.celula){
    //     draft['celula'] = order.form.celula.url;
    //   }
    //   draft['f_currency'] = order.f_currency.f_currency_selected;
    //   draft['folio'] = order.form.folio;
    //   draft['poliza'] = order.form.poliza;
    //   draft['conducto_de_pago'] = order.conducto_de_pago.conducto_de_pago_selected;
    //   draft['sucursal'] = order.form.sucursal;
    //   draft['payment'] = order.form.payment && order.form.payment.value ? order.form.payment.value : myInsurance.forma_de_pago  ? myInsurance.forma_de_pago : 1;
    //   draft['folio'] = order.form.folio;
    //   draft['poliza'] = order.form.poliza;
    //   draft['paquete'] = order.form.paquete;
    //   draft['is_renewable'] = order.renewal.is_renewable;
    //   draft['responsable'] = order.form.responsable;
    //   draft['collection_executive'] = order.form.collection_executive;
    //   draft['automobiles_policy'] = order.subforms.auto;
    //   if(order.subforms.damage){
    //     draft['damages_policy'] = [];
    //     var obj = order.subforms.damage;
    //     draft['damages_policy'].push(obj)
    //   }else{
    //     draft['damages_policy'] = [];
    //   }
    //   draft['accidents_policy'] = myInsurance.accidents_policy;
    //   if(draft['accidents_policy'].length){
    //     draft['accidents_policy'][0]['personal']['second_last_name'] = order.subforms.disease.second_last_name
    //   }
    //   draft['life_policy'] = angular.copy(myInsurance.life_policy);
    //   if(draft['life_policy'].length){
    //     draft['life_policy'][0]['personal'] = order.subforms.life;
    //     draft['life_policy'][0]['beneficiaries_life'] = order.subforms.life.beneficiariesList;
    //   }
    //   draft['personal_life_policy'] = angular.copy(myInsurance.personal_life_policy);
    //   if(draft['personal_life_policy'].length){
    //     for(var i = 0; i < draft['personal_life_policy'].length; i++){
    //       draft['personal_life_policy'][i]['first_name'] = order.subforms.life.aseguradosList[i].first_name;
    //       draft['personal_life_policy'][i]['last_name'] = order.subforms.life.aseguradosList[i].last_name;
    //       draft['personal_life_policy'][i]['second_last_name'] = order.subforms.life.aseguradosList[i].second_last_name;
    //       draft['personal_life_policy'][i]['sex'] = order.subforms.life.aseguradosList[i].sex;
    //       draft['personal_life_policy'][i]['smoker'] = order.subforms.life.aseguradosList[i].smoker;
    //     }
    //   }
    //   draft['coverageInPolicy_policy'] = order.defaults.coverages;
    // }

    $scope.changeBusinessLine = function(){
      // $scope.save_info_tab();
    }
    $scope.changeCelula = function(){
      // $scope.save_info_tab();
    }
    $scope.changeCurrency = function(){
      // $scope.save_info_tab();
    }
    $scope.changeConducto = function(){
      // $scope.save_info_tab();
    }
    $scope.sucursal = function(){
      // $scope.save_info_tab();
    }
    $scope.changeFrequency = function(){
      // $scope.save_info_tab();
    }
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
      order.loading = true;
      $scope.accesos = $sessionStorage.permisos;
      if ($scope.accesos) {
        $scope.accesos.forEach(function(perm){
          if(perm.model_name == 'Pólizas'){
            order.acceso_polizas = perm
            order.acceso_polizas.permissions.forEach(function(acc){
              if (acc.permission_name == 'Administrar pólizas') {
                if (acc.checked == true) {
                  order.acceso_adm_pol = true
                }else{
                  order.acceso_adm_pol = false
                }
              }
              if (acc.permission_name == 'Ver pólizas') {
                if (acc.checked == true) {
                  order.acceso_ver_pol = true
                }else{
                  order.acceso_ver_pol = false
                }
              }
              if (acc.permission_name == 'Cancelar pólizas') {
                if (acc.checked == true) {
                  order.acceso_canc_pol = true
                }else{
                  order.acceso_canc_pol = false
                }
              }
              if (acc.permission_name == 'Eliminar pólizas') {
                if (acc.checked == true) {
                  order.acceso_elim_pol = true
                }else{
                  order.acceso_elim_pol = false
                }
              }
              if (acc.permission_name == 'Comisión no obligatoria') {
                if (acc.checked == true) {
                  order.acceso_cno_pol = true
                }else{
                  order.acceso_cno_pol = false
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
              }else if (acc.permission_name == 'Cancelar OTs') {
                if (acc.checked == true) {
                  order.acceso_canc_ot = true
                }else{
                  order.acceso_canc_ot = false
                }
              }else if (acc.permission_name == 'Eliminar OTs') {
                if (acc.checked == true) {
                  order.acceso_elim_ot = true
                }else{
                  order.acceso_elim_ot = false
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
          if (perm.model_name == 'Siniestros') {
            order.acceso_sin = perm;
            order.acceso_sin.permissions.forEach(function(acc) {
              if (acc.permission_name == 'Administrar siniestros') {
                if (acc.checked == true) {
                  order.acceso_adm_sin = true
                }else{
                  order.acceso_adm_sin = false
                }
              }
            })
          }
          if (perm.model_name == 'Mensajeria') {
            order.acceso_mns = perm;
            order.acceso_mns.permissions.forEach(function(acc) {
              if (acc.permission_name == 'Mensajeria') {
                if (acc.checked == true) {
                  order.acceso_mns = true
                }else{
                  order.acceso_mns = false
                }
              }
            })
          }
          if (perm.model_name == 'Formatos') {
            order.acceso_form = perm;
            order.acceso_form.permissions.forEach(function(acc) {
              if (acc.permission_name == 'Formatos') {
                if (acc.checked == true) {
                  order.acceso_form = true
                }else{
                  order.acceso_form = false
                }
              }
            })
          }
          if (perm.model_name == 'Correos electronicos') {
            order.acceso_correo = perm;
            order.acceso_correo.permissions.forEach(function(acc) {
              if (acc.permission_name == 'Correos') {
                if (acc.checked == true) {
                  order.acceso_cor = true
                }else{
                  order.acceso_cor = false
                }
              }
            })
          }
          if(perm.model_name == 'Cobranza'){
            order.acceso_cob = perm
            order.acceso_cob.permissions.forEach(function(acc){              
              if (acc.permission_name == 'Ver cobranza') {
                if (acc.checked == true) {
                  order.acceso_ver_cob = true
                }else{
                  order.acceso_ver_cob = false
                }
              }else if (acc.permission_name == 'Despagar recibos') {
                if (acc.checked == true) {
                  order.acceso_desp_cob = true
                }else{
                  order.acceso_desp_cob = false
                }
              }else if (acc.permission_name == 'Pagar y prorrogar') {
                if (acc.checked == true) {
                  order.acceso_pag_cob = true
                }else{
                  order.acceso_pag_cob = false
                }
              }else if (acc.permission_name == 'Desconciliación de recibos') {
                if (acc.checked == true) {
                  order.acceso_desco_cob = true
                }else{
                  order.acceso_desco_cob = false
                }
              }else if (acc.permission_name == 'Conciliar recibos') {
                if (acc.checked == true) {
                  order.acceso_conc_cob = true
                }else{
                  order.acceso_conc_cob = false
                }
              }else if (acc.permission_name == 'Liquidar recibos') {
                if (acc.checked == true) {
                  order.acceso_liq_cob = true
                }else{
                  order.acceso_liq_cob = false
                }
              }
            })
          }
          if(perm.model_name == 'Referenciadores'){
            order.acceso_ref = perm
            order.acceso_ref.permissions.forEach(function(acc){
              if (acc.permission_name == 'Administrar referenciadores') {
                if (acc.checked == true) {
                  order.acceso_adm_ref = true
                }else{
                  order.acceso_adm_ref = false
                }
              }else if (acc.permission_name == 'Pagar a referenciadores') {
                if (acc.checked == true) {
                  order.acceso_pag_ref = true
                }else{
                  order.acceso_pag_ref = false
                }
              }else if (acc.permission_name == 'Cambiar refrenciador en pólizas') {
                if (acc.checked == true) {
                  order.acceso_chg_ref = true
                }else{
                  order.acceso_chg_ref = false
                }
              }else if (acc.permission_name == 'Referenciador no obligatorio') {
                if (acc.checked == true) {
                  order.acceso_obl_ref = false
                }else{
                  order.acceso_obl_ref = true
                }
              }else if (acc.permission_name == 'Ver referenciadores') {
                if (acc.checked == true) {
                  order.acceso_ver_ref = true
                }else{
                  order.acceso_ver_ref = false
                }
              }
            })
          }
          if(perm.model_name == 'Comisiones'){
            order.acceso_dash = perm
            order.acceso_dash.permissions.forEach(function(acc){
              if (acc.permission_name == 'Comisiones') {
                if (acc.checked == true) {
                  order.permiso_comisiones = true
                }else{
                  order.permiso_comisiones = false
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
              }// Administrar adjuntos //no agregar, no eliminar, no renombrar, no marcar sensible
              if (acc.permission_name == 'Administrar adjuntos') {
                if (acc.checked == true) {
                  order.permiso_administrar_adjuntos = true
                }else{
                  order.permiso_administrar_adjuntos = false
                }
              }
            })
          }
        })  
      } 
      $q.when()
      .then(function() {
        var defer = $q.defer();
        defer.resolve(helpers.getStates());
        return defer.promise;
      })
      .then(function(data) {
        $scope.statesArray = data.data;
      });     

      order.defaults.getContractorsByGroup();

      loadingThing("provider");
      var date = new Date();
      var curr_date = date.getDate();
      var curr_month = date.getMonth() + 1; //Months are zero based
      var curr_year = date.getFullYear();
      var d = curr_year + "-" + curr_month + "-" + curr_date;
      providerService.getProviderByKey(d)
      .then(function(data) {
              aThingIsDone("provider");
              loadingThing("insurance");
              order.form.startDate = (myInsurance.start_of_validity) ? convertDate(myInsurance.start_of_validity) : convertDate(new Date())
              order.defaults.providers = data.data;
              insuranceService.getInsuranceData(myInsurance)
                  .then(function(insuranceData){
                      $scope.polizaId = angular.copy(insuranceData.id);
                      $scope.saveInsuranceData = angular.copy(insuranceData);
                      $scope.serialBase = null;
                      if ($scope.saveInsuranceData && $scope.saveInsuranceData.automobiles_policy && $scope.saveInsuranceData.automobiles_policy[0]) {
                        $scope.serialBase = $scope.saveInsuranceData.automobiles_policy[0].serial || null;
                      }
                      if(hasRenovationDraft() && renovationDraft && renovationDraft.aseguradora && renovationDraft.aseguradora.id){
                        if(insuranceData.id == renovationDraft.id){
                          insuranceData = $scope.saveInsuranceData ? $scope.saveInsuranceData : renovationDraft;
                          order.form.poliza = '';
                          order.form.folio = renovationDraft.folio;
                          $http.get(url.IP+'claves-by-provider/'+renovationDraft.aseguradora.id)
                          .then(function(clavesResponse){
                            clavesResponse.data.forEach(function(clave) {
                              clave.clave_comision.forEach(function(item) {
                                item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
                                if(order.form.subramo){
                                  if(item.subramo == order.form.subramo.subramo_name){
                                    order.form.comision_percent = parseFloat(item.comission);
                                    order.form.udi = parseFloat(item.udi);
                                  }
                                }else{
                                  order.form.comision_percent = 0
                                  order.form.udi = 0
                                }
                              });
                            });

                            order.defaults.claves=clavesResponse.data;
                            if(order.defaults.claves.length== 1){
                                order.form.clave = order.defaults.claves[0];
                            }

                            $scope.comisiones_poliza = [];
                            for(var i = 0; i < order.defaults.claves.length; i++){
                              if(order.form.clave.name == order.defaults.claves[i].name){
                                $scope.clave_poliza = order.defaults.claves[i];
                              }
                            }
                            order.form.comisiones = $scope.comisiones_poliza;
                          });
                          insuranceData.automobiles_policy = renovationDraft.automobiles_policy;
                          order.subforms.auto = renovationDraft.automobiles_policy;
                          insuranceData.damages_policy = renovationDraft.damages_policy;

                          if (insuranceData.damages_policy) {
                            if (insuranceData.subramo.subramo_code == 6) {
                              order.types_myt.forEach(function(item){
                                if (item.name == insuranceData.damages_policy[0].damage_type) {
                                  order.subforms.damage.damage_type = item                                  
                                }
                              })
                            }
                          }
                          insuranceData.accidents_policy = renovationDraft.accidents_policy;
                          insuranceData.life_policy = renovationDraft.life_policy;
                          if(insuranceData.life_policy){
                            if(insuranceData.life_policy.length){
                              insuranceData.life_policy[0].beneficiaries_life.forEach(function(item){
                                try{
                                  item.birthdate = datesFactory.toDate(item.birthdate)
                                }catch(e){
                                }
                                try{
                                  item.antiguedad = datesFactory.toDate(item.antiguedad)
                                }catch(e){
                                }
                              })
                            }
                            insuranceData.personal_life_policy = angular.copy(renovationDraft.personal_life_policy);

                          }
                        }
                      }

                      $scope.ramo_code = insuranceData.ramo.ramo_code;
                      $scope.subramo_code = insuranceData.subramo.subramo_code;
                      order.f_currency.f_currency_selected = insuranceData.f_currency;
                      order.conducto_de_pago.conducto_de_pago_selected = insuranceData.conducto_de_pago ? insuranceData.conducto_de_pago : myInsurance.conducto_de_pago ? myInsurance.conducto_de_pago : 1;

                      insuranceService.getVendors()
                      .then(function success(data) {
                        data.data.forEach(function(u){              
                          u.first_name = u.first_name.toUpperCase();
                          u.last_name = u.last_name.toUpperCase()
                          u.name = u.first_name.toUpperCase() + ' ' + u.last_name.toUpperCase();
                        })
                        order.vendors = data.data;
                        $scope.referenciador = data.data;
                        order.vendors.forEach(function(vendor) {
                          vendor.name = vendor.first_name + ' ' + vendor.last_name;
                        });
                        $scope.referenciador.forEach(function(vendor) {
                          vendor.name = vendor.first_name + ' ' + vendor.last_name;
                        });
                      },
                      function error(error) {
                        toaster.ERROR('No pudieron ser cargados eferenciadores')
                      })
                      $http.get(url.IP + 'usuarios/')
                        .then(function(user) {   
                          user.data.results.forEach(function(u){              
                            u.first_name = u.first_name.toUpperCase();
                            u.last_name = u.last_name.toUpperCase()
                            u.name = u.first_name.toUpperCase() + ' ' + u.last_name.toUpperCase();
                          })
                          $scope.users = user.data.results;
                          order.responsables  = user.data.results; 
                          order.ejecutivos  = user.data.results; 
                          order.responsables.forEach(function(responsable) {
                            responsable.name = responsable.first_name + ' ' + responsable.last_name;
                          });
                          order.ejecutivos.forEach(function(collection_executive) {
                            collection_executive.name = collection_executive.first_name + ' ' + collection_executive.last_name;
                          });
                      });
                      order.form.identifier = insuranceData.identifier;
                      if($scope.orgName =='gpi'){
                        order.form.identifier = 'GENERAL';
                      }
                      order.form.f_currency = insuranceData.f_currency;
                      order.form.conducto_de_pago = insuranceData.conducto_de_pago;
                      $scope.change_domiciliado = insuranceData.domiciliada;
                      order.form.domiciliado = insuranceData.domiciliada;
                      order.form.startDate = insuranceData.start_of_validity

                      order.form.aseguradora = insuranceData.aseguradora;
                      if (order.form.aseguradora){
                        order.options.changeProvider(order.form.aseguradora)
                      }

                      // var initDate = new Date(insuranceData.start_of_validity);
                      // var endDate = new Date(insuranceData.end_of_validity);
                      var initDate = new Date(insuranceData.end_of_validity);
                      var endDate = initDate;
                      var date1_ = new Date(insuranceData.start_of_validity);
                      var date2_ = new Date(insuranceData.end_of_validity);

                      var timeDiff_ = Math.abs(date2_.getTime() - date1_.getTime());
                      // order.form.policy_days_duration = Math.ceil(timeDiff_ / (1000 * 3600 * 24)); 
                      /* Comment two next lines for fix one day extra in init date*/
                      order.form.address=insuranceData.address;
                      order.form.clave=insuranceData.clave;
                      order.form.business_line = insuranceData.business_line;
                      order.form.internal_number = insuranceData.internal_number;
                      order.form.observations= insuranceData.observations;
                      order.form.hospital_level= insuranceData.hospital_level ? insuranceData.hospital_level : '';
                      order.form.tabulator= insuranceData.tabulator ? insuranceData.tabulator : '';
                      order.form.poliza = '';
                      order.form.folio=insuranceData.folio ? insuranceData.folio : '';
                      if (insuranceData.damages_policy) {
                        if (insuranceData.subramo.subramo_code == 6) {
                          order.types_myt.forEach(function(item){
                            if (item.name == insuranceData.damages_policy[0].damage_type) {
                              order.subforms.damage.damage_type = item.id                                  
                            }
                          })
                        }
                      }
                      if (!order.form.payment) {
                        order.form.payment = {};
                        order.form.payment.value = order.form.payment && order.form.payment.value ? order.form.payment : myInsurance.forma_de_pago  ? myInsurance.forma_de_pago : 1;
                      }
                      insuranceContractor = insuranceData.contractor ? insuranceData.contractor : insuranceData.contratante ? insuranceData.contratante : undefined
                      if(insuranceData.celula){
                        $http.get(insuranceData.celula)
                        .then(function(response) {
                          order.form.celula = response.data;
                        });
                      }

                      if(insuranceData.grouping_level){
                        $http.get(url.IP + 'groupinglevel/' + insuranceData.grouping_level.id)
                        .then(function(response) {
                          order.form.grouping_level = response.data;
                          $scope.info_sub = insuranceData;
                          $scope.changeAgrupacion(order.form.grouping_level);
                        });
                      }
                      if (insuranceData.coverageInPolicy_policy) {
                        order.defaults.coverages = insuranceData.coverageInPolicy_policy;
                      }
                      try{
                        insuranceData.vendor.name = insuranceData.vendor.first_name + ' ' + insuranceData.vendor.last_name; 
                        order.form.vendor = insuranceData.vendor;
                        $scope.original_vendor = insuranceData.vendor;
                      }
                      catch(e){
                      }
                      try{
                        insuranceData.responsable.name = insuranceData.responsable.first_name + ' ' + insuranceData.responsable.last_name; 
                        order.form.responsable = insuranceData.responsable;
                        $scope.original_responsable = insuranceData.responsable;
                      }catch(e){

                      }
                      try{
                        insuranceData.collection_executive.name = insuranceData.collection_executive.first_name + ' ' + insuranceData.collection_executive.last_name; 
                        order.form.collection_executive = insuranceData.collection_executive;
                        $scope.original_collection_executive = insuranceData.collection_executive;
                      }catch(e){

                      }
                      try{
                        if (insuranceData.sucursal) {
                          insuranceData.sucursal.sucursal_name = insuranceData.sucursal.sucursal_name + ' - ' + insuranceData.sucursal.details; 
                          $scope.order.form.sucursal = insuranceData.sucursal;
                          $scope.original_sucursal = insuranceData.sucursal;
                        }
                      }
                      catch(e){
                        console.log(e)
                      }
                      if (!insuranceData.ref_policy) {
                        insuranceData.ref_policy = [];
                        insuranceData.ref_policy = insuranceData.ref_policy && insuranceData.ref_policy ? insuranceData.ref_policy : myInsurance.ref_policy  ? myInsurance.ref_policy : [];
                      }
                      if (insuranceData.ref_policy) {
                        try{
                            if (insuranceData.ref_policy) {
                              insuranceData.ref_policy.forEach(function(refs) {
                                $http.get(refs.referenciador).then(function success(response_ref_plicy) {
                                  if(response_ref_plicy){
                                    refs.data = response_ref_plicy.data
                                    refs.referenciador = response_ref_plicy.data.url
                                    refs.data.comision_policy = refs.comision_vendedor
                                    refs.selectedRef = true
                                    $scope.referenciadores.push(refs)
                                  }
                                })
                              });
                            }
                          else if (insuranceData.vendor) {
                            $scope.referenciadores = []
                            $http.get(insuranceData.vendor.url).then(function success(response_ref_plicy_vendor) {
                              var s_r = response_ref_plicy_vendor.data.user_info.info_vendedor[0].vendedor_subramos
                              s_r.forEach(function(sr) {
                                if ((sr.subramo == insuranceData.subramo.subramo_code) && (sr.provider == insuranceData.aseguradora.id)) {
                                  if(response_ref_plicy_vendor){
                                    response_ref_plicy_vendor.data = response_ref_plicy_vendor.data
                                    response_ref_plicy_vendor.referenciador = response_ref_plicy_vendor.data.url
                                    response_ref_plicy_vendor.vendor = response_ref_plicy_vendor.data.url
                                    response_ref_plicy_vendor.comision_vendedor = sr.comision
                                    response_ref_plicy_vendor.data.comision_policy = response_ref_plicy_vendor.comision_vendedor
                                    response_ref_plicy_vendor.selectedRef = true
                                    $scope.referenciadores.push(response_ref_plicy_vendor)
                                  }
                                }
                                else{
                                  // $scope.referenciadores.push($scope.referenciador)
                                }
                              })
                            })
                          }else{
                            $scope.referenciadores.push($scope.referenciador)
                          }
                        }catch(e){
                          $scope.referenciadores.push($scope.referenciador)
                        }
                      }else{
                        $scope.referenciadores.push($scope.referenciador)                        
                      }
                      if($scope.referenciadores.length ==0){
                        $scope.referenciadores.push($scope.referenciador)
                      }
  
                      // var init_date = new Date(initDate.setYear(initDate.getFullYear() + 1));
                      var init_date = new Date(initDate);
                      var end_date = new Date(endDate.setYear(endDate.getFullYear() + 1));
                      order.form.startDate = convertDate(init_date);
                      order.form.endingDate = convertDate(end_date);
                      order.form.comision = insuranceData.comision;
                      order.form.comision_percent = parseFloat(insuranceData.comision_percent);
                      order.form.udi = parseFloat(insuranceData.udi);
                      var insuranceContractor = insuranceData.contractor ? insuranceData.contractor : insuranceData.contratante ? insuranceData.contratante : undefined;
                      $scope.checkEndDate()
                      if(insuranceContractor){
                        // if(order.form.contratante.value){
                          order.form.contratante.value = insuranceContractor;
                        // }else{
                        //   order.form.contratante = {value: insuranceContractor};
                        // }

                        order.form.contratante.email = order.form.contratante.value.email;
                        order.form.contratante.phone_number = order.form.contratante.value.phone_number;
                        order.defaults.address = insuranceContractor && insuranceContractor.value && insuranceContractor.value.address_contractor;
                        if(order.form.contratante.value.full_name) {
                          order.form.contratante.val = order.form.contratante.value.full_name;
                        } else {
                          order.form.contratante.val = insuranceContractor.val;
                        }

                        if(order.form.contratante.length){
                          order.defaults.contractors.some(function(agent) {
                              if(agent.url == insuranceContractor.url){
                                  order.form.contratante.value = agent;
                              }
                          });
                        }
                      }
                      if(insuranceData.state_circulation){
                        if ($scope.statesArray) {
                          $scope.statesArray.forEach(function(item){
                            if(item.state == insuranceData.state_circulation){
                              order.form.state_circulation = item;
                            }
                          });                          
                        }
                      }
                      if(insuranceData.aseguradora){
                        order.form.aseguradora = insuranceData.aseguradora;
                        if(order.form.aseguradora.length) {
                          order.defaults.providers.some(function(provider) {
                              if(provider.id == insuranceData.aseguradora.id){
                                  order.form.aseguradora = provider;
                                  return true;
                              }
                          });
                        }
                      }

                      if (insuranceData.ramo) {
                        var wait =[]
                  
                        wait.push($http.get(url.IP+'ramos-by-provider/'+order.form.aseguradora.id));
                        $q.all(wait).then(function(response) {
            
                            order.defaults.ramos = response[0].data;
                       
                            order.defaults.ramos.some(function(ramo) {
                              if (ramo.id == insuranceData.ramo.id) {
                                order.form.ramo = ramo;
                                order.options.changeRamo(ramo);
                                // subramo and fill combos
                                order.defaults.subramos = ramo.subramo_ramo;

                                if (insuranceData.subramo) {
                                  order.defaults.subramos.some(function(subramo) {
                                    if (subramo.id == insuranceData.subramo.id) {
                                      order.form.subramo = subramo;
                                      order.options.changeSubramo(subramo);

                                  var code = order.defaults.formInfo.code;
                
                                  if (code === 9) { // auto
                                    if (insuranceData.automobiles_policy.length > 0) {
                                      var subformInfo = insuranceData.automobiles_policy[0];
                                      order.subforms.auto = {
                                        brand: subformInfo.brand,
                                        service: subformInfo.service,
                                        color: subformInfo.color,
                                        created_at: subformInfo.created_at,
                                        document_type: subformInfo.document_type,
                                        engine: subformInfo.engine,
                                        id: subformInfo.id,
                                        license_plates: subformInfo.license_plates,
                                        model: subformInfo.model,
                                        policy: subformInfo.policy,
                                        serial: subformInfo.serial,
                                        sub_branch: subformInfo.sub_branch,
                                        updated_at: subformInfo.updated_at,
                                        url: subformInfo.url,
                                        usage: subformInfo.usage,
                                        version: subformInfo.version,
                                        year: parseInt(subformInfo.year),
                                        driver: subformInfo.driver,
                                        adjustment : subformInfo.adjustment,
                                        mont_adjustment : subformInfo.mont_adjustment,
                                        special_team : subformInfo.special_team,
                                        mont_special_team : subformInfo.mont_special_team,
                                        beneficiary_name : subformInfo.beneficiary_name,
                                        beneficiary_address : subformInfo.beneficiary_address,
                                        beneficiary_rfc : subformInfo.beneficiary_rfc,
                                        policy_type : subformInfo.policy_type,
                                        procedencia : subformInfo.procedencia,
                                        charge_type : subformInfo.charge_type,

                                      }
                                      $scope.usages.forEach(function(item){
                                        if(item.id == subformInfo.usage){
                                          order.subforms.auto.usage = item.id;
                                        }
                                      });
                                    }
                                  } else if (code === 1 || code == 30) {// vida
                                    if (insuranceData.life_policy.length > 0) {
                                      var subformInfo = insuranceData.life_policy[0];

                                      loadingThing("personal");
                                      // formService.getPersonalInfoByUri(subformInfo.personal.url)
                                      //   .then(function(personalResponse) {
                                          var personal = insuranceData.personal_life_policy;
                                          if(!personal.length){
                                            personal = insuranceData.life_policy[0].personal;
                                          }
                                          order.subforms.life.smoker = subformInfo.smoker == undefined ? '' : subformInfo.smoker ? 'True' : 'False';
                                          // order.subforms.life.beneficiariesList = [];
                                          if(insuranceData.personal_life_policy.length){
                                            insuranceData.personal_life_policy.forEach(function(pers) {
                                              var asegs = {
                                                birthdate: convertDate(pers.birthdate),
                                                antiguedad: pers.antiguedad ? convertDate(pers.antiguedad) : null,
                                                first_name: pers.first_name,
                                                last_name: pers.last_name,
                                                second_last_name: pers.second_last_name,
                                                url : pers.url,
                                                sex: pers.sex,   
                                                smoker:pers.smoker ? pers.smoker :'False',                                     
                                                policy_type: pers.policy_type   
                                              }
                                              console.log('ooiiooo',pers)
                                              if (asegs.smoker == true) {
                                                asegs.smoker = 'True'
                                              }else if (asegs.smoker == false) {
                                                asegs.smoker = 'False'
                                              }
                                              order.options.life.asegurados.add(asegs);
                                            });
                                          }else{
                                            try{
                                              var personal_antig = personal;
                                                var prs_life = {
                                                  birthdate: convertDate(personal_antig.birthdate),
                                                  antiguedad: personal_antig.antiguedad ? convertDate(personal_antig.antiguedad) : null,
                                                  first_name: personal_antig.first_name,
                                                  last_name: personal_antig.last_name,
                                                  second_last_name: personal_antig.second_last_name,
                                                  url : personal_antig.url,
                                                  sex: personal_antig.sex,                                          
                                                  smoker: personal_antig.smoker ? personal_antig.smoker : 'False',
                                                  policy_type: pers.policy_type                                         
                                                }
                                                if (prs_life.smoker == true) {
                                                  prs_life.smoker = 'True'
                                                }else if (prs_life.smoker == false) {
                                                  prs_life.smoker = 'False'
                                                }
                                                order.options.life.asegurados.add(prs_life);
                                                order.subforms.life.smoker = subformInfo.smoker == undefined ? '' : subformInfo.smoker ? 'True' : 'False';
                                            }
                                            catch(e){}
                                          }
                                          // order.subforms.life.first_name = subformInfo.personal.first_name;
                                          // order.subforms.life.last_name = subformInfo.personal.last_name;
                                          // order.subforms.life.second_last_name = subformInfo.personal.second_last_name;
                                          // order.subforms.life.birthdate = datesFactory.convertDate(subformInfo.personal.birthdate)
                                          // order.subforms.life.sex = subformInfo.personal.sex;
                                          if(personal && personal.policy_type){
                                            var personal_antig_ = personal;
                                            var prs_life_ = {
                                              birthdate: convertDate(personal_antig_.birthdate),
                                              antiguedad: personal_antig_.antiguedad ? convertDate(personal_antig_.antiguedad) : null,
                                              first_name: personal_antig_.first_name,
                                              last_name: personal_antig_.last_name,
                                              second_last_name: personal_antig_.second_last_name,
                                              url : personal_antig_.url,
                                              sex: personal_antig_.sex,                                          
                                              smoker: personal_antig_.smoker ? personal_antig_.smoker : 'False',
                                              policy_type: personal_antig_.policy_type                                         
                                            }
                                            if (prs_life_.smoker == true) {
                                              prs_life_.smoker = 'True'
                                            }else if (prs_life_.smoker == false) {
                                              prs_life_.smoker = 'False'
                                            }
                                            order.subforms.life.aseguradosList.push(prs_life_);
                                          }
                                          order.subforms.life.smoker = subformInfo.smoker == undefined ? '' : subformInfo.smoker ? 'True' : 'False';
                                         
                                          subformInfo.beneficiaries_life.forEach(function(beneficiary) {
                                            var ben = {
                                              birthdate: datesFactory.convertDate(beneficiary.birthdate),
                                              antiguedad: beneficiary.antiguedad ? datesFactory.convertDate(beneficiary.antiguedad) : null,
                                              first_name: beneficiary.first_name,
                                              last_name: beneficiary.last_name,
                                              second_last_name: beneficiary.second_last_name,
                                              percentage: beneficiary.percentage,
                                              person: beneficiary.first_name ? 1: 2,
                                              sex: beneficiary.sex,
                                              j_name: beneficiary.j_name,
                                              rfc: beneficiary.rfc,
                                              optional_relationship: beneficiary.optional_relationship
                                            }

                                            order.options.life.beneficiary.add(ben);
                                          });
                                   
                                          aThingIsDone("personal");
                                        // });
                                    }
                                  } else if (code === 2 || code === 3 || code === 4) {
                                    if (insuranceData.accidents_policy.length > 0) {
                                      var subformInfo = insuranceData.accidents_policy[0];
                                      loadingThing("personal");
                                      formService.getPersonalInfoByUri(subformInfo.personal.url)
                                        .then(function(personalResponse) {

                                          subformInfo.personal = personalResponse.data;
                                          order.subforms.disease.sex = subformInfo.personal.sex;
                                          order.subforms.disease.coinsurance = subformInfo.coinsurance;
                                          order.subforms.disease.id = subformInfo.id;
                                          order.subforms.disease.url = subformInfo.url;
                                          order.subforms.disease.sub_branch = subformInfo.sub_branch;
                                          order.subforms.disease.policy = subformInfo.policy;
                                          order.subforms.disease.relationshipList = [];
                                          order.subforms.disease.first_name = subformInfo.personal.first_name;
                                          order.subforms.disease.personal_url = subformInfo.personal.url;
                                          order.subforms.disease.last_name = subformInfo.personal.last_name;
                                          order.subforms.disease.second_last_name = subformInfo.personal.second_last_name;
                                          order.subforms.disease.birthdate = datesFactory.convertDate(subformInfo.personal.birthdate);
                                          order.subforms.disease.antiguedad = subformInfo.personal.antiguedad ? datesFactory.convertDate(subformInfo.personal.antiguedad) : null;
                                          order.subforms.disease.policy_type = subformInfo.personal.policy_type ? subformInfo.personal.policy_type :46;
                                          subformInfo.relationship_accident.forEach(function(relationship) {
                       
                                            var rel = {
                                              birthdate: datesFactory.convertDate(relationship.birthdate),
                                              antiguedad: relationship.antiguedad ? datesFactory.convertDate(relationship.antiguedad) : null,
                                              first_name: relationship.first_name,
                                              last_name: relationship.last_name,
                                              second_last_name: relationship.second_last_name,
                                              url : relationship.url,
                                              sex: null,
                                              relationship: relationship.relationship,
                                            }

                                            order.defaults.sex.some(function(sex) {
                                              if (sex.value == relationship.sex) {
                                                rel.sex = sex;
                                                return true;
                                              }
                                            });

                                            order.options.disease.types.some(function(type) {
                                              if (type.relationship == relationship.relationship) {
                                                rel.relationship = type;
                                                return true;
                                              }
                                            });

                                            order.options.disease.relationships.add(rel);
                                          });

                                          aThingIsDone("personal");
                                        });
                                    }
                                  } else if (code === 5 || code === 6 || code === 7 || code === 8 || code === 10 || code === 11 || code === 12 || code === 13 || code === 14 || code === 31) { // daño general
                                    if (insuranceData.damages_policy.length > 0) {
                                      var subformInfo = insuranceData.damages_policy[0];
                                      order.subforms.damage.coinsurance = subformInfo.coinsurance;
                                      order.subforms.damage.created_at = subformInfo.created_at;
                                      order.subforms.damage.damage_type = subformInfo.damage_type;
                                      order.subforms.damage.insured_item = subformInfo.insured_item;
                                      order.subforms.damage.item_address = subformInfo.item_address;
                                      order.subforms.damage.item_details = subformInfo.item_details;
                                      order.subforms.damage.policy = subformInfo.policy;
                                      order.subforms.damage.sub_branch = subformInfo.sub_branch;
                                      order.subforms.damage.updated_at = subformInfo.updated_at;
                                      order.subforms.damage.url = subformInfo.url;
                                      if (insuranceData.damages_policy) {
                                        if (insuranceData.subramo.subramo_code == 6) {
                                          order.types_myt.forEach(function(item){
                                            if (item.name == insuranceData.damages_policy[0].damage_type) {
                                              order.subforms.damage.damage_type = item.id                                  
                                            }
                                          })
                                        }
                                      }
                                    }
                                  } else {
                                  }

                                  $q.all(order.defaults.waitElement).then(function(packages) {
                                    order.defaults.coverages = [];
                                    if (insuranceData.paquete) {

                                      order.form.paquete = insuranceData.paquete;
                                      if(insuranceData.paquete.coverage_package.length) {
                                        var pack = insuranceData.paquete;
                                        pack.coverage_package.forEach(function(element, index) {
                                        });
                                      }

                                      if(order.defaults.packages.length) {

                                        order.defaults.packages.some(function(pkg) {
                                          if (pkg.id == insuranceData.paquete.id) {
                                            order.form.paquete = pkg;
                                            order.options.changePackage(pkg);
                                            order.defaults.coverages = [];
                                            if (myInsurance.coverageInPolicy_policy.length > 0) {
                                              myInsurance.coverageInPolicy_policy.forEach(function(coverageInPolicy) {
                                                //https://miurabox.atlassian.net/browse/DES-428cambio lectura PDF
                                                var coverageInPackage = coverageInPolicy;//cambio lectura PDF
                                                // pkg.coverage_package.some(function(coverageInPackage) {
                                                  // if (coverageInPolicy.coverage_name.toLowerCase() == coverageInPackage.coverage_name.toLowerCase()) {
                                                    var flag = 0;
                                                    coverageInPackage.sumInPolicy = {
                                                        label: coverageInPolicy.sum_insured,
                                                        value: coverageInPolicy.sum_insured
                                                      }

                                                    coverageInPackage.deductibleInPolicy = {
                                                     label: coverageInPolicy.deductible,
                                                     value: coverageInPolicy.deductible
                                                    }
                                                    coverageInPackage.primaInPolicy = coverageInPolicy.prima;
                                                    coverageInPackage.coinsuranceInPolicy = coverageInPolicy.coinsurance;
                                                    coverageInPackage.topeCoinsuranceInPolicy = coverageInPolicy.topecoinsurance;

                                                    order.options.addCoverage(coverageInPackage);
                                                    return true;
                                                  // }
                                                // });
                                                //https://miurabox.atlassian.net/browse/DES-428cambio lectura PDF
                                              });
                                            } 
                                            pkg.coverage_package.forEach(function(element, index) {
                                                
                                            });
                                }
                              });
                            }
                          }
                          else {
                            if (myInsurance.coverageInPolicy_policy.length > 0) {
                              order.defaults.coverageList = [];
                              myInsurance.coverageInPolicy_policy.forEach(function(coverageInPolicy) {
                                    order.options.addCoverage(coverageInPolicy);
                                  });
                            }
                          }
                        });
                      if (insuranceData.forma_de_pago) {
                        order.defaults.payform.some(function(pf) {

                          if (pf.value == insuranceData.forma_de_pago.value) {
                            order.options.isReceiptAvailable(pf, true);
                            return true;
                          }
                        });
                      }
                      // --------------------------d
                      order.defaults.comisiones = []
                      if(order.form.clave){
                        order.form.ceder_comision = false;
                        if(order.form.clave.clave_comision.length) {
                          order.form.clave.clave_comision.forEach(function(item) {
                            if(order.form.subramo.subramo_name == item.subramo) {
                              order.defaults.comisiones.push(item);
                              order.form.comisiones = order.defaults.comisiones;
                            }
                          });

                          if(order.defaults.comisiones){
                            // if(!order.defaults.comisiones.length) {  
                            //    SweetAlert.swal({
                            //       title: 'Error',
                            //       text: "Debe tener al menos una comisión capturada para la clave seleccionada",
                            //       type: "error",
                            //       showCancelButton: false,
                            //       confirmButtonColor: "#DD6B55",
                            //       confirmButtonText: "Aceptar",
                            //       closeOnConfirm: true
                            //   }, function(isConfirm) {
                            //       if (isConfirm) {
                            //         // $state.go('polizas.table');
                            //       }
                            //   });
                            // }
                          }

                          if(order.defaults.comisiones.length == 1){
                            order.form.comision = order.defaults.comisiones[0].comission;
                            $scope.selectComision(order.form.comision);
                          }
                        }
                      }
                      // -d-------------------------------

                      insuranceData.recibos_poliza =[]
              
                      if(insuranceData.files){
                        vm.files = insuranceData.files.results;
                      }
                      order.insuranceObject = insuranceData;
                      aThingIsDone("insurance");

                      return true;
                      }
                    });
                  }
                  return true;
                }
              });
          });
        }
      });
      });

      dataFactory.post('celula_contractor_info/')
        .then(function(response) {
          $scope.celulas = response.data
      });

      dataFactory.get('groupingLevel-resume/')
      .then(function(response) {
        $scope.agrupaciones = response.data;
      });

      dataFactory.get('sucursales-to-show-unpag/')
      .then(function success(response) {
        $scope.sucursalList = response.data;
      })
    }

    $scope.selectComision = function (param) {
      order.form.comision_percent = parseFloat(param.comission);
      order.form.udi = parseFloat(param.udi);
      order.form.comision_percent = parseFloat(param.comission);
      order.form.udi = parseFloat(param.udi);
      // order.form.comision = parseFloat(param.comission);
    };
    $scope.show_button_save_sum = false;
    $scope.show_button_save_ded = false;
    $scope.normalizeVINTest = function(v) {
      return (v || '').toString().trim().toUpperCase();
    };

    $scope.sameVIN = function(a, b) {
      return $scope.normalizeVINTest(a) && ($scope.normalizeVINTest(a) === $scope.normalizeVINTest(b));
    };

    $scope.hasInvalidVinLettersX = function(vin) {
      return /[OIQ]/i.test($scope.normalizeVIN(vin));
    };

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

    function getFormData(form, vendor) {
      form.poliza_number = form.poliza ? form.poliza : '';  
      form.contractor = form.contratante.url;
      form.internal_number = $scope.internal_number

      form.folio = form.folio ? form.folio: null;
      form.aseguradora = form.aseguradora ? form.aseguradora.url : null;
      form.ramo = form.ramo ? form.ramo.url : null;
      form.subramo = form.subramo ? form.subramo.url : null;
      form.paquete = form.paquete ? form.paquete.url : null;
      form.observations = "";
      form.forma_de_pago = form.payment ? form.payment.value : null;
      form.old_policies = [];
      form.recibos_poliza = [];
      form.vendor = vendor;

      return form;
    }

    /* Uploader files */
    $scope.userInfo = {
        id: 0
    };
    var uploader =  $scope.uploader = new FileUploader({
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        },
    });

    // uploader.filters.push({
    //   name: 'customFilter',
    //   fn: function(item /*{File|FileLikeObject}*/ , options) { //jshint ignore:line
    //     return this.queue.length < 20;
    //   }
    // });

    // ALERTA SUCCES UPLOADFILES
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
      toaster.success(MESSAGES.OK.UPLOADFILES);
    };

    // ALERTA ERROR UPLOADFILES
    uploader.onErrorItem = function(fileItem, response, status, headers) {
      SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
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
    };
    uploader.onBeforeUploadItem = function(item) {
      item.url = $scope.userInfo.url;
      item.formData[0].nombre = item.file.name;
      item.alias = '';
      item.formData[0].owner = $scope.userInfo.id;
    };

    $scope.deleteFile = deleteFile;
    function deleteFile(file){
      fileService.deleteFile(url.IP + "polizas/" + myInsurance.id + "/",file,vm.files, usr.role);
    }

    function uploadFiles(polizaId){
        $scope.userInfo = {
            id: polizaId
        };
        $scope.userInfo.url =  $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
        $scope.uploader.uploadAll();
        resetRenovationDraft();
    }

    /* Funciones de fechas */
    function toDate(dateStr) {
      var dateString = dateStr;
      var dateParts = dateString.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

      return dateObject;
    }

    function mesDiaAnio (parDate) {
      var d = new Date(toDate(parDate));
      var date = (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
      return date;
    }

    /** Loading things **/
    function aThingIsDone(what){
        stuffLoaded++;
        if(stuffLoaded >= thingsToLoad){
            order.loading = false;
        }
    }

    function loadingThing (what) {
        thingsToLoad++;
        order.loading = true;
    }

    function canBeOT(){
        if(order.form.contratante){
            return true;
        }
        SweetAlert.swal("Necesita seleccionar un contratante");
        return false;
    }

    function canBePoliza(){
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        var flag = true;
        var code = parseInt(order.defaults.formInfo.code);

        if(!canBeOT()){
            flag = false;
        }
        if(order.receipts.length == 0){
            l.stop();
            flag = false;
            SweetAlert.swal("ERROR", MESSAGES.ERROR.RECEIPTSREQUIRED, "error");
        }

        if(!code){
            flag = false;
            l.stop();
            SweetAlert.swal("Forma incompleta");

        } else if(code == 1 || code === 30){//life
       
        }else if(code == 2 || code == 3 || code == 4){//disease
      
            var subform = order.subforms.disease;
            if(subform.first_name == '' || subform.last_name == '' ||  subform.sex == ''
                 || !subform.first_name  || !subform.last_name    || !subform.sex ){
                flag = false;
                SweetAlert.swal("Datos de formulario requerido");
                l.stop();
            }

        }else if(code == 5 || code == 6 || code == 7 || code == 8 || code == 10 || code == 11 || code == 12 || code == 13 || code == 14){
       
            var damage = order.subforms.damage;
            if(damage.insured_item == '' 
               || !damage.insured_item ){
                flag = false;
                l.stop();
                SweetAlert.swal("Datos de formulario son requeridos, bien asegurado");
            }
        }else if(code == 9){// auto

        }

        if(order.defaults.coverages.length == 0){
            flag = false;
            SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGESREQUIRED, "error");
            l.stop();
        }


        return flag;
    }
    // Calculadora de comisoones
    $scope.calculateComision = function(ref,index){
      $rootScope.comVendedor = true;
      $scope.orderInfo = order;
      $localStorage.orderForm = JSON.stringify(order.form);

      var modalInstance = $uibModal.open({ 
        templateUrl: 'app/ordenes/calculateComision.modal.html',
        controller: OrderComisionCtrl,
        controllerAs: 'vmm',
          size: 'lg',
          resolve: {
            referenciador: function() {
              return ref;
            },
            index: function(){
              return index;
            },
            form: function(){
              return order.form;
            },
            from: function(){
              return null;
            },
            primaTotal: function(){
              return order.poliza.primaTotal;
            }
          },
        backdrop: 'static', /* this prevent user interaction with the background */ 
        keyboard: false
      });
      modalInstance.result.then(function(receipt) {
      });
    }
    // Calcular comisión ppor referenciador
    function OrderComisionCtrl($scope, from , $sessionStorage,$uibModalInstance, referenciador,index,form, $http, MESSAGES, toaster,primaTotal) {
      var vmm = this;
      /* Información de usuario */
      var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
      var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
      var usr = JSON.parse(decryptedUser);
      var token = JSON.parse(decryptedToken);
      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var usr = JSON.parse(decryptedUser);
      $rootScope.valueMonto = primaTotal;
      $rootScope.valueComInicial = 0;
      $rootScope.valueComision = 0;
      if (referenciador) {
        $http.get(referenciador.referenciador)
          .then(function(data){
              if (data.status == 200 || data.status == 201) {
                if (data.data) {
                  $rootScope.name = data.data.first_name + ' '+data.data.last_name
                  if (data.data.user_info) {
                    if (data.data.user_info.info_vendedor[0]) {
                      $rootScope.valueGo = data.data.user_info.info_vendedor[0].gastos_operacion
                    }
                  }
                }
              }
        });            
      }
      // Change monto --> calc comision
      $scope.changeMonto = function (go,monto,com,comI) {
        if (isNaN(monto)) {
          var toNumber = $scope.formatearNumero(monto)
          if (isNaN(toNumber) ){
            $rootScope.valueMonto = "";
            SweetAlert.swal("Error", MESSAGES.ERROR.ERRORFORMATNUMBER, "error")
          }
        }
      };
      $scope.comCalculatePeso = function (monto,comision) {
        if ((isNaN(monto) || (isNaN(comision))) || (parseFloat(comision) > parseFloat(monto))) {
          if (parseFloat(comision) > parseFloat(monto)) {
            SweetAlert.swal("Error", "Cantidad capturada en comisión no puede ser mayor a la prima total", "error")
            $rootScope.valueComision = 0
          }else{
            SweetAlert.swal("Error", MESSAGES.ERROR.ERRORFORMATNUMBER, "error")
          }
        }else{
            $rootScope.valueComision = parseFloat(((parseFloat(comision) * 100)) / parseFloat(monto)).toFixed(2)
        }

      };
      $scope.validComision = function (comI) {
        if (isNaN(comI)) {
          $rootScope.valueComInicial = 0
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORFORMATNUMBER, "error")
        }

      };
      $scope.cTotal = function (monto,com,comVendedor) {
        referenciador.comision_vendedor = comVendedor
        if ($uibModalInstance) {
          $uibModalInstance.dismiss('cancel');
        }
      };

      $scope.cancelCalculate = function() {
        if ($uibModalInstance) {
          $uibModalInstance.dismiss('cancel');
        }
      };
      $scope.formatearNumero = function(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }

        return x1 + x2;
      }
    }
    // renovacion por PDF
    $scope.fileNameChanged = function (ele) {
      $scope.filePdf = ele.files[0];
      $scope.fileSelectedR = ele.files[0]
    };
    $scope.showFile = function (argument) {
      var reader = new FileReader();
      reader.readAsDataURL(argument.files[0]);
      $scope.fileSelectedR = argument.files[0]
      var reader_pdf = new FileReader();
      reader_pdf.readAsDataURL($scope.fileSelectedR);
      $scope.urlsfile = URL.createObjectURL(argument.files[0]);
      reader_pdf.onload = function () {
        $scope.pdffile = reader_pdf.result
        $scope.okxfile = new Blob([$scope.pdffile], {type: 'application/pdf'});
        var fileURL =$scope.urlsfile
        $scope.content = $sce.trustAsResourceUrl(fileURL);
      };
      reader_pdf.onerror = function (error) {
        console.log('Error: ', error);
      };
    }
    // captura de la poliza PDF

    function sinDiacriticos(texto) {
      return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
    }
    $scope.checkNumSerie = function () {
      if(order.subforms.auto.serial){
        helpers.existSerialRenovacion(order.subforms.auto.serial,$scope.saveInsuranceData.id)
        .then(function(request) {
          if(request.exist == true) {
            SweetAlert.swal("Información","La SERIE del AUTO ya existe en otra póliza vigente: "+request.poliza, "info")
            // order.subforms.auto.serial = '';
          }
        })
        .catch(function(err) {

        });
      }
    };
    
    function formatToMMDDYYYY(isoDateString) {
      if (!isoDateString) return "";
      var date = new Date(isoDateString);
      var month = (date.getMonth() + 1).toString().padStart(2, "0");
      var day = date.getDate().toString().padStart(2, "0");
      var year = date.getFullYear();
      return month + "/" + day + "/" + year;

    }
    function llenarInfoGm(aseguradora,clave) {
      order.show.ot = false;
      // ensureRenovationDraft()['activeJustified'] = 1;
      $scope.activeJustified=1;
      order.show.ot = false;
      var date = new Date(order.form.startDate);
      if(isNaN(date)) {
        var date = new Date(mesDiaAnio(order.form.startDate));
      }
      if($scope.read_pdf_ren.data['asegurados']){
        llenarAsegurados($scope.read_pdf_ren.data['asegurados'])
      }
      $scope.paqueteOriginal=$scope.read_pdf_ren.data.cobertura;
      $http.get(url.IP+'claves-by-provider/'+order.form.aseguradora.id)
        .then(
          function success(clavesResponse) {                  
            clavesResponse.data.forEach(function(clave) {
              clave.clave_comision.forEach(function(item) {
                item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
              });
            });
            order.defaults.claves=clavesResponse.data;
            if(order.defaults.claves.length== 1) {
                order.form.clave = order.defaults.claves[0];
                $scope.dataToSave.clave = order.form.clave.id;
                try{
                  order.form.comision_percent = (order.form.clave.comission);
                  order.form.udi = (order.form.clave.udi);
                }
                catch(e){}
            }
            if(clave){
              order.defaults.claves.forEach(function(item){                
                if (item.clave.toString().replace(/\s/g, '') === clave.toString().replace(/\s/g, '')) {
                  order.form.clave = item;
                }
              });
            }
            $http.get(url.IP + 'ramos-by-provider/' + aseguradora.id)
            .then(function(ramo){                    
                order.defaults.ramos = ramo.data;
                order.defaults.ramos.forEach(function(ramo) {

                    if(ramo.ramo_code == 2) {

                      order.form.ramo = ramo;
                      // $scope.save_info_tab()
                      order.defaults.subramos = ramo.subramo_ramo;                          
                      order.defaults.subramos.forEach(function(sub) {
                          if(sub.subramo_code == 3) {
                            order.form.subramo = sub;
                            // $scope.verComisiones();
                            order.show.showForms = true;
                            order.defaults.formInfo = {
                              code: order.form.subramo.subramo_code,
                              name: order.form.subramo.subramo_name
                            };
                            order.show.showForms = true;
                            order.defaults.formInfo = {
                              code: order.form.subramo.subramo_code,
                              name: order.form.subramo.subramo_name
                            };
                            
                            order.defaults.comisiones = [];

                            if(order.form.clave){
                              if(order.form.clave.clave_comision.length) {
                                order.form.clave.clave_comision.forEach(function(item) {
                                  if(order.form.subramo.subramo_name == item.subramo) {
                                    order.defaults.comisiones.push(item);
                                  }
                                });

                                order.form.comisiones = order.defaults.comisiones;
                                if(order.defaults.comisiones.length == 1){
                                  order.form.comision = order.defaults.comisiones[0];
                                  $scope.selectComision(order.form.comision);
                                }
                              }
                            }

                            $http.post(url.IP+ 'paquetes-data-by-subramo/',
                              {'ramo': order.form.ramo.id, 'subramo':order.form.subramo.id,'provider':order.form.aseguradora.id })
                            .then(
                              function success (response) {
                                order.defaults.packages = [];
                                order.defaults.coverages=[];
                                $scope.paqueteSelected = false;
                                $scope.coberturasPackagePdf = []
                                // $scope.read_pdf_ren.data.cobertura='PREMIER 200'
                                if(response.data.length) {
                                  order.defaults.packages = response.data;
                                  $scope.read_pdf_ren.data.cobertura = $scope.read_pdf_ren.data.cobertura.split(" ");
                                  $scope.read_pdf_ren.data.cobertura = $scope.read_pdf_ren.data.cobertura[0];
                                  if($scope.read_pdf_ren.data.cobertura=='' || $scope.read_pdf_ren.data.cobertura==undefined){
                                    $scope.read_pdf_ren.data.cobertura='PREMIER 200'
                                  }

                                  order.defaults.packages.forEach(function(item){
                                    // console.log(" comparando ",item.package_name,"con",$scope.read_pdf_ren.data.cobertura)
                                    if((item.package_name).toLowerCase() && $scope.read_pdf_ren.data.cobertura.toLowerCase()){
                                      if ((item.package_name.toLowerCase() == $scope.read_pdf_ren.data.cobertura.toLowerCase())
                                        || ( item.package_name.toLowerCase().includes($scope.read_pdf_ren.data.cobertura.toLowerCase()))
                                        && !$scope.paqueteSelected){
                                        $scope.paqueteSelected = true;
                                        order.form.paquete = item;
                                        $scope.dataToSave.paquete = order.form.paquete.id;
                                        for (i in $scope.read_pdf_ren.data['Primas y coberturas']) {

                                            if ($scope.read_pdf_ren.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                              if($scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                                $scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible']='0'
                                              }
                                              if($scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                                $scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                              }
                                              var it ={}
                                              it['coverage_name'] = i
                                              it['url'] = i
                                              it['package'] = item.id
                                              it['deductibleInPolicy']={'value':$scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible']}
                                              it['deductible_coverage']=[{'deductible':0}]
                                              it['deductible_coverage'][0]['deductible'] =$scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible']
                                              it['sumInPolicy']={'value':$scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada']}
                                              it['sums_coverage']=[{'sum_insured':0}]
                                              it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada']
                                              if($scope.read_pdf_ren.data['Primas y coberturas'][i]['Coaseguro']){
                                                it['coinsuranceInPolicy']={'value':$scope.read_pdf_ren.data['Primas y coberturas'][i]['Coaseguro']}
                                              }
                                              $scope.coberturasPackagePdf.push(it)
                                              order.defaults.coverages=$scope.coberturasPackagePdf
                                              $localStorage['defaults'] = order.defaults
                                              order.form.paquete = item; 
                                          }
                                        }
                                        order.coverageInPolicy_policy = order.defaults.coverages;
                                        order.form.paquete = item; 
                                        $scope.dataToSave.paquete = order.form.paquete.id;
                                        // $scope.save_info_tab()
                                      }
                                    }
                                  })
                                
                                  $scope.changeSubramo()
                                  if (hasRenovationDraft() && renovationDraft.paquete) {
                                    order.form.paquete = renovationDraft.paquete;
                                  }
                                }
                
                              },
                              function error (e) {
                                console.log('Error - paquetes-data-by-subramo', e);
                                order.defaults.packages = [];
                              }
                            ).catch(function (error) {
                              console.log('Error - paquetes-data-by-subramo - catch', error);
                              order.defaults.packages = [];
                            });
                          
                          }
                      });
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
    }
    function llenarAsegurados(lista){
      console.log('ssssssssss',order.subforms,$scope.contratante)
      if ($scope.contratante && $scope.contratante.sex) {
        order.subforms.disease.sex = $scope.contratante.sex;
      } else {
        console.warn("No se encontró contratante o no tiene sexo definido");
      }
      order.subforms.disease.relationshipList = [];
      order.subforms.disease.first_name = $scope.contratante.first_name;
      order.subforms.disease.last_name = $scope.contratante.last_name;
      order.subforms.disease.second_last_name = $scope.contratante.second_last_name;
      order.subforms.disease.birthdate = formatToMMDDYYYY($scope.contratante.birth_date);
      if($scope.read_pdf_ren && $scope.read_pdf_ren.data && $scope.read_pdf_ren.data.esTitular){
        order.subforms.disease.first_name = lista[0].first_name;
        order.subforms.disease.last_name = lista[0].last_name;
        order.subforms.disease.second_last_name = lista[0].second_last_name;
        if(lista[0].sex){
          order.subforms.disease.sex = lista[0].sex;
        }
      }else{
        Object.keys(lista).map(function(key) {
          var rel = {
            antiguedad: lista[key].fecha ? lista[key].fecha : datesFactory.convertDate(new Date()),
            birthdate: null,
            first_name: lista[key].first_name,
            last_name: lista[key].last_name,
            second_last_name: lista[key].second_last_name,
            sex: null,
            relationship:{"option":"OTRO","relationship":4,"disabled":false}
          }
          if(lista[key].sex){
            rel.sex = lista[key].sex.toUpperCase() === 'M' 
            ? {"value": "M", "label": "MASCULINO"}
            : lista[key].sex.toUpperCase() === 'F' 
                ? {"value": "F", "label": "FEMENINO"}
                : null;
          }     
          order.subforms.disease.relationshipList.push(rel);
        }); 
      }   
    }
    function get_claves_pdf(aseguradora,clave) {            
      if(!clave || clave==undefined){
        try{
          clave = $scope.read_pdf.data['Datos generales de la poliza']['Clave_interna_del_agente']
        }catch(u){}
      } 
      order.show.ot = false;
      // ensureRenovationDraft()['activeJustified'] = 1;
      var date = new Date(order.form.startDate);
      if(isNaN(date)) {
        var date = new Date(mesDiaAnio(order.form.startDate));
      }
      if($scope.ramoPdf == "gastosmedicos"){
        llenarInfoGm(aseguradora,clave)
        return
      }
      $http.get(url.IP+'claves-by-provider/'+order.form.aseguradora.id)
        .then(
        function success(clavesResponse) {                  
          clavesResponse.data.forEach(function(clave) {
            clave.clave_comision.forEach(function(item) {
              item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];
            });
          });
          order.defaults.claves=clavesResponse.data;
          if(order.defaults.claves.length== 1) {
              order.form.clave = order.defaults.claves[0];
              $scope.dataToSave.clave = order.form.clave.id;
              try{
                order.form.comision_percent = (order.form.clave.comission);
                order.form.udi = (order.form.clave.udi);
              }
              catch(e){}
          }
          if(clave){
            order.defaults.claves.forEach(function(item) {
              if (item.clave.toString().replace(/\s/g, '') === clave.toString().replace(/\s/g, '')) {
                  order.form.clave = item;
              }
            });            
          }
          $http.get(url.IP + 'ramos-by-provider/' + aseguradora.id)
          .then(function(ramo){                    
              order.defaults.ramos = ramo.data;
              order.defaults.ramos.forEach(function(ramo) {

                  if(ramo.ramo_code == 3) {
                    order.form.ramo = ramo;
                    // $scope.save_info_tab()
                    order.defaults.subramos = ramo.subramo_ramo;                          
                    order.defaults.subramos.forEach(function(sub) {
                        if(sub.subramo_code == 9) {
                          order.form.subramo = sub;
                          // $scope.verComisiones();
                          order.show.showForms = true;
                          order.defaults.formInfo = {
                            code: order.form.subramo.subramo_code,
                            name: order.form.subramo.subramo_name
                          };
                          order.show.showForms = true;
                          order.defaults.formInfo = {
                            code: order.form.subramo.subramo_code,
                            name: order.form.subramo.subramo_name
                          };
                          
                          order.defaults.comisiones = [];

                          if(order.form.clave){
                            if(order.form.clave.clave_comision.length) {
                              order.form.clave.clave_comision.forEach(function(item) {
                                if(order.form.subramo.subramo_name == item.subramo) {
                                  order.defaults.comisiones.push(item);
                                }
                              });

                              order.form.comisiones = order.defaults.comisiones;
                              if(order.defaults.comisiones.length == 1){
                                order.form.comision = order.defaults.comisiones[0];
                                $scope.selectComision(order.form.comision);
                              }
                            }
                          }

                          $http.post(url.IP+ 'paquetes-data-by-subramo/',
                            {'ramo': order.form.ramo.id, 'subramo':order.form.subramo.id,'provider':order.form.aseguradora.id })
                          .then(
                            function success (response) {
                              order.defaults.packages = [];
                              order.defaults.coverages=[];
                              $scope.paqueteSelected = false;
                              $scope.coberturasPackagePdf = []

                              if(response.data.length) {
                                order.defaults.packages = response.data;
                                if($scope.read_pdf_ren.data.cobertura=='' || $scope.read_pdf_ren.data.cobertura==undefined){
                                  $scope.read_pdf_ren.data.cobertura='AMPLIA'
                                }

                                order.defaults.packages.forEach(function(item){
                                  if((item.package_name).toLowerCase() && $scope.read_pdf_ren.data.cobertura.toLowerCase()){
                                    if (item.package_name.toLowerCase() == $scope.read_pdf_ren.data.cobertura.toLowerCase() && !$scope.paqueteSelected){
                                      $scope.paqueteSelected = true;
                                      order.form.paquete = item;
                                      $scope.dataToSave.paquete = order.form.paquete.id;
                                      for (i in $scope.read_pdf_ren.data['Primas y coberturas']) {

                                          if ($scope.read_pdf_ren.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                            if($scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                              $scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible']='0'
                                            }
                                            if($scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                              $scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                            }
                                            var it ={}
                                            it['coverage_name'] = i
                                            it['url'] = i
                                            it['package'] = item.id
                                            it['deductibleInPolicy']={'value':$scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible']}
                                            it['deductible_coverage']=[{'deductible':0}]
                                            it['deductible_coverage'][0]['deductible'] =$scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible']
                                            it['sumInPolicy']={'value':$scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada']}
                                            it['sums_coverage']=[{'sum_insured':0}]
                                            it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada']
                                            if($scope.read_pdf_ren.data['Primas y coberturas'][i]['Coaseguro']){
                                              it['coinsuranceInPolicy']={'value':$scope.read_pdf_ren.data['Primas y coberturas'][i]['Coaseguro']}
                                            }
                                            $scope.coberturasPackagePdf.push(it)
                                            order.defaults.coverages=$scope.coberturasPackagePdf
                                            $localStorage['defaults'] = order.defaults
                                            order.form.paquete = item; 
                                          
                                        }
                                      }
                                      order.coverageInPolicy_policy = order.defaults.coverages;
                                      order.form.paquete = item; 
                                      $scope.dataToSave.paquete = order.form.paquete.id;
                                      // $scope.save_info_tab()
                                    }
                                  }
                                })
                                $scope.changeSubramo()
                                if (hasRenovationDraft() && renovationDraft.paquete) {
                                  order.form.paquete = renovationDraft.paquete;
                                }
                              }
              
                            },
                            function error (e) {
                              console.log('Error - paquetes-data-by-subramo', e);
                              order.defaults.packages = [];
                            }
                          ).catch(function (error) {
                            console.log('Error - paquetes-data-by-subramo - catch', error);
                            order.defaults.packages = [];
                          });
                        
                        }
                    });
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
    $scope.capturarPoliza = function(){
      $scope.dataToSave={}
      if(!$scope.filePdf){            
        SweetAlert.swal("Error", "Cargue un archivo pdf para capturar.", "error");
        return;
      }
      resetRenovationDraft();
      // order.form = {};
      $localStorage['datos_pdf_renovacion'] = {};
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
      // xhr.open("POST", url.SERVICE_PDF);
      xhr.open("POST", url.LECTORPDF+'upload-pdf');

      var auxRamo = $scope.ramoPdf && $scope.ramoPdf.ramo_id ? $scope.ramoPdf.ramo_id : 0;

      var data = new FormData();
      var dataFile = new FormData();
      dataFile.append("arch", $scope.filePdf);
      dataFile.append("nombre", $scope.fileSelectedR.name);
      data.append("archivo", $scope.filePdf);
      // 3) Añade tus parámetros adicionales
      data.append("nombre", $scope.fileSelectedR.name);
      data.append("org", $scope.orgName);
      var requestId = generarRequestId();
      data.append("requestId",requestId)
      $localStorage.dataFileR = dataFile;
      $scope.fileSelectedR.formData=[]         
      try{
        enviarPDFSerieXHR($scope.fileSelectedR, $scope.orgName, Date.now().toString(),
          function(resp) {
            $scope.$apply(function() {
              var raw = resp.data.image_b64; // ajusta a tu ruta real (a veces es resp.data.data.image_b64)
              var src = raw.startsWith('data:')
                ? raw
                : ('data:image/png;base64,' + raw);

              // 1) lo que pintas
              $scope.imgSerieSrcR = $sce.trustAsResourceUrl(src);

              // 2) lo que guardas (string)
              $localStorage.imgSerieSrcR = src;
            });
          },
          function(err) {
            console.error(err);
          }
        );
      } catch(u){
        console.log('uu erorr image',u)
      }    
      try{
        enviarPDFPrimasXHR($scope.fileSelectedR, $scope.orgName, Date.now().toString(),
          function(resp) {
            $scope.$apply(function() {
              var imagenok='';
              var raw = resp.data.sections; // ajusta a tu ruta real (a veces es resp.data.data.image_b64)
              if(raw && raw[0] && raw[0].image_b64){
                imagenok=raw[0].image_b64;
              }else{
                if(raw && raw[1] && raw[1].image_b64){
                  imagenok=raw[1].image_b64;
                }
              }
              if(imagenok){
                var src = imagenok.startsWith('data:')
                  ? imagenok
                  : ('data:image/png;base64,' + imagenok);
                // 1) lo que pintas
                $scope.imgPrimasSrcR = $sce.trustAsResourceUrl(src);
                // 2) lo que guardas (string)
                $localStorage.imgPrimasSrcR = src;
              }
            });
          },
          function(err) {
            console.error(err);
          }
        );
      } catch(u){
        console.log('uu erorr image',u)
      }       
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
          $scope.read_pdf_ren = JSON.parse(xhr.response);
          if($scope.read_pdf_ren.status != '200_OK_ACCEPTED'){
            SweetAlert.swal("Error*", "A ocurrido un error al cargar el PDF, por favor intentalo de nuevo.", "error");
          }else{
            if ($scope.read_pdf_ren.request_id !== requestId) {
                console.log('No coincide***',$scope.read_pdf.request_id,requestId)    
            } else {
              console.log('Resultado ok***:', $scope.read_pdf_ren.data);
            }
            $localStorage['datos_pdf_renovacion'] = $scope.read_pdf_ren;
            $scope.filePdf = {}
            $scope.activeJustified=1;
            order.show.ot = false;
            if ($scope.read_pdf_ren.data['Numero de poliza']){
              order.form.poliza = $scope.read_pdf_ren.data['Numero de poliza'];
            }
            // if($scope.read_pdf_ren.data['Datos generales de la poliza'] && $scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] &&  $scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] =='NACIONAL'){
            //   $scope.order.f_currency.f_currency_selected = 1;
            // }else if($scope.read_pdf_ren.data['Datos generales de la poliza'] && $scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] && !$scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] =='EXTRANJERA'){
            //   $scope.order.f_currency.f_currency_selected = 2;
            // }            
            if($scope.read_pdf_ren.data['Datos generales de la poliza'] && $scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] &&  $scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] =='NACIONAL'){
              $scope.order.f_currency.f_currency_selected = 1;
              order.f_currency.f_currency_selected = 1;
            }
            if($scope.read_pdf_ren.data['Datos generales de la poliza'] && $scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] &&  ($scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] =='Dolares' || ($scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='dolares')){
              $scope.order.f_currency.f_currency_selected = 2;
              order.f_currency.f_currency_selected = 2;
            }
            if($scope.read_pdf_ren.data['Datos generales de la poliza'] && $scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] && !$scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] =='EXTRANJERA'){
              order.f_currency.f_currency_selected = 2;
              $scope.order.f_currency.f_currency_selected = 2;
            }                         
            if($scope.read_pdf_ren.data['Datos generales de la poliza'] && $scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] && ($scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda'] =='udi' || ($scope.read_pdf_ren.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='udis')){
              $scope.order.f_currency.f_currency_selected = 3;
              order.f_currency.f_currency_selected = 3;
            }
            order.conducto_de_pago.conducto_de_pago_selected =1;  
            $scope.pintarCoberturas=true;

            order.form.payment={}
            order.form.from_pdf=true;
            order.form.payment.value = $scope.read_pdf_ren.data['Datos generales de la poliza']['Forma de pago'];

            if (order && order.form && order.form.payment) {
              var p = Number(order.form.payment.value); // por si viene "15" string

              if ([15, 7, 14].indexOf(p) !== -1) {
                order.form.payment.value = 12; // ✅ reset a anual

                SweetAlert.swal(
                  "Advertencia",
                  "La forma de pago detectada (" + p + ") no aplica en este formato. Se ajustó a ANUAL (12). Verifica tu archivo o selecciona la forma de pago correcta.",
                  "warning"
                );
              }
            }
            $scope.paqueteOriginal=$scope.read_pdf_ren.data.cobertura;
            if ($scope.read_pdf_ren.data['Datos del vehiculo']){

              order.subforms.auto.brand = $scope.read_pdf_ren.data['Datos del vehiculo']['marca'];
              order.subforms.auto.model = $scope.read_pdf_ren.data['Datos del vehiculo']['modelo'];
              order.subforms.auto.year = $scope.read_pdf_ren.data['Datos del vehiculo']['anio'];
              order.subforms.auto.engine = $scope.read_pdf_ren.data['Datos del vehiculo']['motor'];
              order.subforms.auto.serial = $scope.read_pdf_ren.data['Datos del vehiculo']['serie'];
              if(order.subforms.auto.serial){
                $scope.checkNumSerie();
              }
              // order.subforms.auto.license_plates = $scope.read_pdf_ren.data['Datos del vehiculo']['clave_vehicular'];
              order.subforms.auto.license_plates = $scope.read_pdf_ren.data['Datos del vehiculo']['placas'];
              var datosVehiculo = $scope.read_pdf_ren.data['Datos del vehiculo'];

              order.subforms.auto.version = datosVehiculo.version 
                  ? datosVehiculo.version 
                  : (datosVehiculo.descripcion_vehiculo 
                      ? datosVehiculo.descripcion_vehiculo 
                      : datosVehiculo.clave_vehicular);
              // order.subforms.auto.version = $scope.read_pdf_ren.data['Datos del vehiculo']['descripcion_vehiculo'] ? $scope.read_pdf_ren.data['Datos del vehiculo']['descripcion_vehiculo'] : $scope.read_pdf_ren.data['Datos del vehiculo']['clave_vehicular'];
              order.subforms.auto.color = $scope.read_pdf_ren.data['Datos del vehiculo']['color'];
              order.subforms.auto.service = $scope.read_pdf_ren.data['Datos del vehiculo']['servicio'];
              if(order && order.subforms && order.subforms.auto && order.subforms.auto.service =='' || order.subforms.auto.service ==undefined || order.subforms.auto.service ==null){
                if($scope.read_pdf_ren && $scope.read_pdf_ren.data && $scope.read_pdf_ren.data['Datos del vehiculo']['uso']){
                  if(parseInt($scope.read_pdf_ren.data['Datos del vehiculo']['uso']) == 1){
                    order.subforms.auto.service= "PARTICULAR";
                  }else if(parseInt($scope.read_pdf_ren.data['Datos del vehiculo']['uso']) == 2){
                    order.subforms.auto.service= "CARGA";
                    if ($scope.read_pdf_ren.data && 
                      $scope.read_pdf_ren.data['Datos del vehiculo'] && 
                      $scope.read_pdf_ren.data['Datos del vehiculo']['tipo de carga']) {                        
                        if($scope.read_pdf_ren.data['Datos del vehiculo']['tipo de carga']=='A'){
                          order.subforms.auto.charge_type = 1;
                        }else if($scope.read_pdf_ren.data['Datos del vehiculo']['tipo de carga']=='B'){
                          order.subforms.auto.charge_type = 2;                    
                        }else if($scope.read_pdf_ren.data['Datos del vehiculo']['tipo de carga']=='C'){
                          order.subforms.auto.charge_type = 3;                    
                        }else{
                          order.subforms.auto.charge_type = 1;
                        }
                    }
                  }else if(parseInt($scope.read_pdf_ren.data['Datos del vehiculo']['uso']) == 3){
                    order.subforms.auto.service= "SERVICIO PÚBLICO";
                  }
                  else{
                    order.subforms.auto.service= "PARTICULAR";
                  }
                }
              }
              order.form.identifier = order.subforms.auto.brand +' '+ order.subforms.auto.model;
              if($scope.orgName =='gpi'){
                order.form.identifier = 'GENERAL';
              }
              // if(order.form.identifier !=order.subforms.auto.version){
              //   order.form.identifier = order.form.identifier+' '+order.subforms.auto.version
              // }
              try {
                order.subforms.auto.usage = parseInt($scope.read_pdf_ren.data['Datos del vehiculo']['uso']);
              } catch(err){}
              }
              try {
                if ($scope.read_pdf_ren.data && 
                  $scope.read_pdf_ren.data['Datos del vehiculo'] && 
                  $scope.read_pdf_ren.data['Datos del vehiculo']['tipo de carga'] &&
                  $scope.read_pdf_ren.data['Datos del vehiculo']['uso']) {
                  if(parseInt($scope.read_pdf_ren.data['Datos del vehiculo']['uso']) == 2){
                    if($scope.read_pdf_ren.data['Datos del vehiculo']['tipo de carga']=='A'){
                      order.subforms.auto.charge_type = 1;
                    }else if($scope.read_pdf_ren.data['Datos del vehiculo']['tipo de carga']=='B'){
                      order.subforms.auto.charge_type = 2;                    
                    }else if($scope.read_pdf_ren.data['Datos del vehiculo']['tipo de carga']=='C'){
                      order.subforms.auto.charge_type = 3;                    
                    }else{
                      order.subforms.auto.charge_type = 1;
                    }
                  }
                }
              } catch(err){}
              
              //  movi este corchete aqui para que pueda leer gastos medicos sin datos del vehiculo
              $scope.contratante = {}
              if($scope.read_pdf_ren.data['ramo']){
                $scope.ramoPdf = $scope.read_pdf_ren.data['ramo'];
              }else{
                $scope.ramoPdf = ''
                $scope.contratante = {}
              }
            
              var aseguradora_a_capturar = sinDiacriticos($scope.read_pdf_ren.data['aseguradora'].toLowerCase())
                  order.defaults.providers.some(function(x){

                    if(aseguradora_a_capturar =='chubb'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='CHUBB' || sinDiacriticos(x.alias).toLowerCase() == 'Aba' || sinDiacriticos(x.alias).toLowerCase() =='ABA') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        if(!cl || cl==undefined){
                          try{
                            cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave_interna_del_agente']
                          }catch(u){}
                        }
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='qualitas'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='Quálitas' || sinDiacriticos(x.alias).toLowerCase() =='Qualitas' || sinDiacriticos(x.alias).toLowerCase() == 'QUALITAS' || sinDiacriticos(x.alias).toLowerCase() =='QUÁLITAS') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }

                    if(aseguradora_a_capturar =='gnp'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='gnp' || sinDiacriticos(x.alias).toLowerCase() =='gnp seguros' || sinDiacriticos(x.alias).toLowerCase() == 'grupo nacional provincial' || sinDiacriticos(x.alias).toLowerCase() =='grupo nacional provincial ') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='axa'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='axa' || sinDiacriticos(x.alias).toLowerCase() =='axa seguros') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='hdi'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='hdi' || sinDiacriticos(x.alias).toLowerCase() =='HDI') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='primero seguros'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='Primero Seguros' || sinDiacriticos(x.alias).toLowerCase() =='Pimero seguros') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='ana'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='ana' || sinDiacriticos(x.alias).toLowerCase() =='ana seguros') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }            

                    if(aseguradora_a_capturar =='momento'){

                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='momento' ) {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='afirme'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros afirme' ) {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='zurich'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='zurich seguros' ) {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']
                        if(!cl || cl==undefined){
                          try{
                            cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave_interna_del_agente']
                          }catch(u){}
                        }
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='mapfre'){
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='mapfre' ) {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='seguros monterrey' || aseguradora_a_capturar=='seguros monterrey new york life'){
                      aseguradora_a_capturar='seguros monterrey new york life';
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros monterrey new york life' ) {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='seguros bx+' || aseguradora_a_capturar=='bx+'){
                      aseguradora_a_capturar='bx+';
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros ve por mas' || sinDiacriticos(x.alias).toLowerCase() =='bx+' || sinDiacriticos(x.alias).toLowerCase() =='seguros bx+' || sinDiacriticos(x.alias).toLowerCase() =='grupo financiero ve por mas') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='Metlife' || aseguradora_a_capturar=='metlife'){
                      aseguradora_a_capturar='Metlife';
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='met life' || sinDiacriticos(x.alias).toLowerCase() =='metlife') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    if(aseguradora_a_capturar =='PlanSeguro' || aseguradora_a_capturar=='planseguro'){
                      aseguradora_a_capturar='Plan Seguro';
                      if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='plan seguros' || sinDiacriticos(x.alias).toLowerCase() =='plan de seguro cía de seguros') {
                        order.form.aseguradora = x;
                        var cl = $scope.read_pdf_ren.data['Datos generales de la poliza']['Clave interna del agente']
                        get_claves_pdf(x,cl)
                        return true;
                      }
                    }
                    return false;
                  });    
              
              order.subforms.auto.policy_type = 1;
              order.subforms.auto.procedencia = 1
              if(aseguradora_a_capturar =='hdi' && $scope.read_pdf_ren.data['Datos del vehiculo']['tipo'] == "Pick Up"){
                  order.subforms.auto.policy_type = 5;

              }
              // $scope.save_info_tab();
          
                order.form.from_pdf = true;
                // if(($scope.read_pdf_ren.data['Datos del asegurado']['propietario_contratante'].indexOf("S.A. DE") > -1)){
                //   $scope.read_pdf_ren_contractor.type = false;
                //   $scope.read_pdf_ren_contractor.name =$scope.read_pdf_ren.data['Datos del asegurado']['propietario_contratante'];
                // }else{
                //   $scope.read_pdf_ren_contractor.type = true;
                //   $scope.read_pdf_ren_contractor.name = $scope.read_pdf_ren.data['Datos del asegurado']['propietario_contratante']
                  
                // }
                if ($scope.read_pdf_ren.data['Primas'] && $scope.read_pdf_ren.data['Primas']['Prima total']) {
                  $scope.order.form.primaTotal = $scope.read_pdf_ren.data['Primas']['Prima total'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['Prima total'])) : $scope.read_pdf_ren.data['Primas']['IMPORTE TOTAL'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['IMPORTE TOTAL'])) : 0;
                  $scope.order.form.subTotal = $scope.read_pdf_ren.data['Primas']['Subtotal'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['Subtotal'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }
              
                if ($scope.read_pdf_ren.data['Primas'] && $scope.read_pdf_ren.data['Primas']['Prima neta']) {
                  $scope.order.form.primaNeta = $scope.read_pdf_ren.data['Primas']['Prima neta'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['Prima neta'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }

                if ($scope.read_pdf_ren.data['Primas'] && $scope.read_pdf_ren.data['Primas']['Gastos de expedición']) {
                  try{
                    $scope.order.form.derecho = $scope.read_pdf_ren.data['Primas']['Gastos de expedición'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['Gastos de expedición'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }catch(o){
                    $scope.order.form.derecho = $scope.read_pdf_ren.data['Primas']['Gastos de expedici\u00f3n'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['Gastos de expedici\u00f3n'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }
                }
                if ($scope.read_pdf_ren.data['Primas'] && $scope.read_pdf_ren.data['Primas']['Gastos por Expedición.']) {
                  try{
                    $scope.order.form.derecho = $scope.read_pdf_ren.data['Primas']['Gastos por Expedición.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['Gastos por Expedición.'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }catch(o){
                    $scope.order.form.derecho = $scope.read_pdf_ren.data['Primas']['Gastos por Expedici\u00f3n.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['Gastos por Expedici\u00f3n.'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }
                }
                if ($scope.read_pdf_ren.data['Primas'] && $scope.read_pdf_ren.data['Primas']['Financiamiento por pago fraccionado']) {
                  $scope.order.form.rpf = $scope.read_pdf_ren.data['Primas']['Financiamiento por pago fraccionado'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['Financiamiento por pago fraccionado'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }
                if ($scope.read_pdf_ren.data['Primas'] && $scope.read_pdf_ren.data['Primas']['Derecho de Póliza']) {
                  $scope.order.form.derecho = $scope.read_pdf_ren.data['Primas']['Derecho de Póliza'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['Derecho de Póliza'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }
                if ($scope.read_pdf_ren.data['Primas'] && $scope.read_pdf_ren.data['Primas']['IVA']) {
                  $scope.order.form.iva = $scope.read_pdf_ren.data['Primas']['IVA'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['IVA'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }
                if ($scope.read_pdf_ren.data['Primas'] && $scope.read_pdf_ren.data['Primas']['I.V.A.']) {
                  $scope.order.form.iva = $scope.read_pdf_ren.data['Primas']['I.V.A.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf_ren.data['Primas']['I.V.A.'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }
            order.form.startDate =  $scope.read_pdf_ren.data['fecha_inicio']
            order.form.endingDate =  $scope.read_pdf_ren.data['fecha_fin']
            order.form.endDate =  $scope.read_pdf_ren.data['fecha_fin']
            order.form.start_of_validity= new Date($scope.read_pdf_ren.data['fecha_inicio'])
            order.form.end_of_validity = new Date($scope.read_pdf_ren.data['fecha_fin'])

            $scope.dataToSave.start_of_validity = (mesDiaAnio(order.form.startDate));
            $scope.dataToSave.end_of_validity = mesDiaAnio(order.form.endingDate);
            var date1 = new Date($scope.dataToSave.start_of_validity);
            var date2 = new Date($scope.dataToSave.end_of_validity);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            order.form.from_pdf = true
            $rootScope.readPDF = {
              individual:$scope.read_pdf_ren.data['Datos del asegurado'],
              corporation: $scope.read_pdf_ren.data['Datos del asegurado'],
              address: $scope.read_pdf_ren.data['contratante_domicilio'],
              first_name: $scope.read_pdf_ren.data['contratante_full_name'],
              last_name: $scope.read_pdf_ren.data['contratante_primer_apellido'],
              second_last_name: $scope.read_pdf_ren.data['contratante_segundo_apellido'],
              type_person: $scope.read_pdf_ren.data['persona'],

            };
            // $scope.save_info_tab();
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
                title: "Error",
                text: reqId ? (msg) : msg,
                type: "error",
                confirmButtonText: "Entendido"
              });
            });
          }
        }
      };
    };
    $scope.hasInvalidVinLettersTest = function (vin) {
      if (!vin) return false;
      return /[OIQ]/i.test(vin);
    };

    function enviarPDFPrimasXHR(file, org, requestId, onOk, onErr) {
      var fd = new FormData();
      fd.append('archivo', file);
      if (org) fd.append('org', org);
      if (requestId) fd.append('requestId', requestId);

      var xhr = new XMLHttpRequest();
      xhr.open("POST", url.LECTORPDF + "imagen-primas-pdf", true);

      xhr.onload = function() {
        try {
          var resp = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) onOk(resp);
          else onErr(resp);
        } catch (e) {
          onErr({ error: "Respuesta inválida", raw: xhr.responseText });
        }
      };

      xhr.onerror = function() {
        onErr({ error: "Error de red" });
      };

      xhr.send(fd);
    }
    function enviarPDFSerieXHR(file, org, requestId, onOk, onErr) {
      var fd = new FormData();
      fd.append('archivo', file);
      if (org) fd.append('org', org);
      if (requestId) fd.append('requestId', requestId);

      var xhr = new XMLHttpRequest();
      xhr.open("POST", url.LECTORPDF + "imagen-serie-pdf", true);

      xhr.onload = function() {
        try {
          var resp = JSON.parse(xhr.responseText || "{}");
          if (xhr.status >= 200 && xhr.status < 300) onOk(resp);
          else onErr(resp);
        } catch (e) {
          onErr({ error: "Respuesta inválida", raw: xhr.responseText });
        }
      };

      xhr.onerror = function() {
        onErr({ error: "Error de red" });
      };

      xhr.send(fd);
    }
    $scope.changePackage = function(param) {
      if(order.form.identifier) {
        order.form.identifier=order.form.identifier
      }else if(param) {
        order.form.identifier = param.package_name;
      }else{
        order.form.identifier=order.form.identifier
      }
      if($scope.orgName =='gpi'){
        order.form.identifier = 'GENERAL';
      }
      order.defaults.coverages = []
      if(param) {
        order.form.paquete = param;
      }
      if(order.form.paquete) {
        $scope.newCoverPack = true;
        $scope.dataToSave.paquete = order.form.paquete.id;
        order.defaults.coverages = [];
        order.defaults.coverageList = [];
        order.form.paquete.coverage_package.forEach(function(element, index) {
            if (element.default) {
                order.defaults.coverages.push(angular.copy(element));
            } else {
                order.defaults.coverageList.push(angular.copy(element));
            }
        });
        order.coverageInPolicy_policy = order.defaults.coverages;
        order.show.showCoverages = true;


        if($scope.read_pdf_ren && $scope.readPDF){     
          $scope.paqueteSelected = false;
          $scope.coberturasPackagePdf = []
          if($scope.read_pdf_ren.data.cobertura=='' || $scope.read_pdf_ren.data.cobertura==undefined){
            $scope.read_pdf_ren.data.cobertura='AMPLIA'
          }     
          if($scope.read_pdf_ren.data['Primas y coberturas']){
              $scope.paqueteSelected = true;
              $scope.dataToSave.paquete = order.form.paquete.id;
              for (i in $scope.read_pdf_ren.data['Primas y coberturas']) {

                  if ($scope.read_pdf_ren.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                    if($scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                      $scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible']='0'
                    }
                    if($scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                      $scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada']='0'
                    }
                    var it ={}
                    it['coverage_name'] = i
                    it['url'] = i
                    it['package'] = order.form.paquete.id
                    it['deductibleInPolicy']={'value':$scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible']}
                    it['deductible_coverage']=[{'deductible':0}]
                    it['deductible_coverage'][0]['deductible'] =$scope.read_pdf_ren.data['Primas y coberturas'][i]['Deducible']
                    it['sumInPolicy']={'value':$scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada']}
                    it['sums_coverage']=[{'sum_insured':0}]
                    it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf_ren.data['Primas y coberturas'][i]['Suma asegurada']
                    if($scope.read_pdf_ren.data['Primas y coberturas'][i]['Coaseguro']){
                      it['coinsuranceInPolicy']={'value':$scope.read_pdf_ren.data['Primas y coberturas'][i]['Coaseguro']}
                    }
                    $scope.coberturasPackagePdf.push(it)
                    order.defaults.coverages=$scope.coberturasPackagePdf
                    $localStorage['defaults'] = order.defaults
                    order.form.paquete = order.form.paquete; 

                }
              }
              order.coverageInPolicy_policy = order.defaults.coverages;
            }
        }
      }
    };
    function similarity(a, b) {
      var aWords = a.toLowerCase().split(' ');
      var bWords = b.toLowerCase().split(' ');
      var score = 0;    
      angular.forEach(aWords, function(word) {
        if (bWords.indexOf(word) !== -1) {
            score++;
        }
      });    
      return score;
    }
    $scope.getMostSimilarPackage = function(target, packages) {
      var bestMatch = null;
      var highestScore = 0;  
      if($scope.paqueteOriginal && packages){
        angular.forEach(packages, function(pkg) {
          var score = similarity($scope.paqueteOriginal, pkg.package_name);
          if (score > highestScore) {
            highestScore = score;
            bestMatch = pkg;
            return bestMatch;
          }
        }); 
      } 
      return bestMatch;
    };
    $scope.changeSubramo = function() {    
      if(order.form.subramo){
        $scope.dataToSave.subramo = order.form.subramo.id;
        order.defaults.forms = order.form.subramo.forms_subramo;
        if (order.form.subramo.subramo_code ==1) {
          if(order.types_life.length ==1){
            order.subforms.life.policy_type = order.types_life[0]
          }
        }else if (order.form.subramo.subramo_code == 2 || order.form.subramo.subramo_code == 3 || order.form.subramo.subramo_code == 4) {
          if(order.types_gm.length ==1){
            if(order.subforms && order.subforms.disease){
              order.subforms.disease.policy_type = order.types_gm[0]
            }else{
              order.subforms = {
                auto: {
                  selectedCar: {}
                }, //template.formulario.automoviles
                life: {
                    beneficiariesList: [{person: 1}],
                    aseguradosList: []
                }, //template.formulario.vida
                disease: {
                    relationshipList: []
                }, //template.formulario.accidentes
                damage: {
                    coinsurance: '',
                    insured_item: '',
                    item_address: '',
                    item_details: ''
                } //template.formulario.danios
              };
              order.subforms.disease.policy_type = order.types_gm[0]
            }
          }
        }else if (order.form.subramo.subramo_code == 7) {
          if(order.types_incendio.length ==1){
            order.subforms.damage.policy_type = order.types_incendio[0]
          }
        }else if (order.form.subramo.subramo_code == 6) {
          if(order.types_myt.length ==1){
            order.subforms.damage.policy_type = order.types_myt[0]
          }
        }else if(order.form.subramo.subramo_code==8){
          if(order.types_ayc.length==1){
            order.subforms.damage.policy_type=order.types_ayc[0]
          }
        }else if(order.form.subramo.subramo_code===1){
          if(order.types_credito.length==1){
            order.subforms.damage.policy_type=order.types_credito[0]
          }
        }else if (order.form.subramo.subramo_code == 10) {
          if(order.types_credito.length ==1){
            order.subforms.damage.policy_type = order.types_credito[0]
          }
        }else if(order.form.subramo.subramo_code==11){
          if(order.types_vivienda.length==1){
            order.subforms.damage.policy_type=order.types_vivienda[0]
          }
        }else if(order.form.subramo.subramo_code==13){
          if(order.types_diversos.length==1){
            order.subforms.damage.policy_type=order.types_diversos[0]
          }
        }else if(order.form.subramo.subramo_code==12){
          if(order.types_garantia.length==1){
            order.subforms.damage.policy_type=order.types_garantia[0]
          }
        }else if(order.form.subramo.subramo_code==5){
          if(order.types_rc.length==1){
            order.subforms.damage.policy_type=order.types_rc[0]
          }
        }else if(order.form.subramo.subramo_code==14){
          if(order.types_tyorc.length==1){
            order.subforms.damage.policy_type=order.types_tyorc[0]
          }
        }else if(order.form.subramo.subramo_code==31){
          if(order.types_lf.length==1){
            order.subforms.damage.policy_type=order.types_lf[0]
          }
        }else if(order.form.subramo.subramo_code==9){
          if(order.types.length==1){
            order.subforms.auto.policy_type=order.types[0]
          }
        }
        get_claves();
      }
      if (hasRenovationDraft() && renovationDraft.paquete) {
        renovationDraft.paquete = null;
      }
      try {
        $http.post(url.IP+ 'paquetes-data-by-subramo/',
          {'ramo': order.form.ramo.id, 'subramo':order.form.subramo.id,'provider':order.form.aseguradora.id })
        .then(
          function success (response) {
            order.defaults.packages = [];
            if(response.data.length) {
              order.defaults.packages = response.data;
              if (order.defaults.packages && order.defaults.packages.length > 0) {  
                // Usage example
                if(order.form.paquete || ($scope.read_pdf_ren && $scope.read_pdf_ren.data && $scope.read_pdf_ren.data.cobertura)){
                  var result = $scope.getMostSimilarPackage($scope.read_pdf_ren.data.cobertura.toLowerCase(), order.defaults.packages);
                  if(result){
                    order.form.paquete=result;
                  }
                  if (!order.form.paquete || Object.keys(order.form.paquete).length === 0) {
                    order.form.paquete = order.defaults.packages[0];
                  }
                  $scope.changePackage(order.form.paquete)
                }
              }
              if (hasRenovationDraft() && renovationDraft.paquete) {
                order.form.paquete = renovationDraft.paquete;
              }
            }

          },
          function error (e) {
            console.log('Error - paquetes-data-by-subramo', e);
            order.defaults.packages = [];
          }
        ).catch(function (error) {
          console.log('Error - paquetes-data-by-subramo - catch', error);
          order.defaults.packages = [];
        });
      

      // Asigna la forma
        order.show.showForms = true;
        order.defaults.formInfo = {
          code: order.form.subramo.subramo_code,
          name: order.form.subramo.subramo_name
        };
        
        order.defaults.comisiones = [];

        if(order.form.clave){
          if(order.form.clave.clave_comision.length) {
            order.form.clave.clave_comision.forEach(function(item) {
              if(order.form.subramo.subramo_name == item.subramo) {
                order.defaults.comisiones.push(item);
              }
            });

            order.form.comisiones = order.defaults.comisiones;
            if(order.defaults.comisiones.length == 1){
              order.form.comision = order.defaults.comisiones[0];
              $scope.selectComision(order.form.comision);
            }
          } 
        }
        if (order.form.subramo.subramo_name == 'Vida' || order.form.subramo.subramo_name == 'Funerarios') {
          order.options.life.asegurados.add();

          if(order.form.subramo.subramo_name == 'Funerarios'){
            order.subforms.life.beneficiariesList.splice(0, 1);
          }
        }
      } catch (err){}
    };
    // captura de la poliza final renovacion por PDF
    // renovación por PDF final
    /* Configuración del datepicker */
    $('.datepicker-me input').datepicker();

    $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
    $.fn.datepicker.defaults.startView = 0;
    $.fn.datepicker.defaults.autoclose = true;
    $.fn.datepicker.defaults.language = 'es';
  }
})();