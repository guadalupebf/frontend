// DEVELOP

/* global angular */
(function() {
  'use strict';
  /* jshint devel: true */

  angular.module('inspinia') 
      .controller('OrderCtrl', OrderCtrl);

  OrderCtrl.$inject = ['$parse','datesFactory', 'SweetAlert','ContratanteService','$http','$state', 'models', 'tiposBeneficiarios', 'sex', 'formService', '$timeout', '$q', 'url', '$uibModalInstance',
                    '$localStorage', 'FileUploader', '$scope', '$rootScope','$filter', 'groupService', 'providerService', 'insuranceService', 'receiptService', 'generalService',
                    'toaster', 'payform', 'helpers', 'MESSAGES', '$uibModal', '$sessionStorage', '$location', '$stateParams', 'packageService', 'coverageService', 'formatValues','dataFactory',
                    'emailService','$sce','PaquetesMatcher'];

  function OrderCtrl($parse,datesFactory, SweetAlert, ContratanteService,$http, $state, models, tiposBeneficiarios, sex, formService, $timeout, $q, url, $uibModalInstance, $localStorage, FileUploader,
                    $scope, $rootScope, $filter, groupService, providerService, insuranceService, receiptService, generalService, toaster, payform, helpers, MESSAGES, $uibModal,
                    $sessionStorage, $location, $stateParams, packageService, coverageService, formatValues,dataFactory, emailService, $sce,PaquetesMatcher) {


      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var __url = angular.copy(url);
      var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
      var usr = JSON.parse(decryptedUser);
      var token = JSON.parse(decryptedToken);
      $scope.orgName = usr.orgname;
      $scope.identificador = false;
      $scope.dateOut = false;
      $scope.referenciadores = []
      $scope.org_name = usr.urlname;
      $scope.cotizador = localStorage.getItem('pdf_generado') === '1';
      $scope.contratante = [];
      $scope.enproceso=false;
      $scope.yaseestableciopaquete=false;
      $scope.coberturasPackagePdf=[];
      var order = this;
      $scope.eliminadoManualCobertura=false;
      var saveCreatedPoliza = {};
      var lastActiveTab = null;
      var LAST_ACTIVE_TAB_KEY = 'orderLastActiveTab';
      var TAB_INDEX_OT = 0;
      var TAB_INDEX_POLICY = 1;

      if (angular.isNumber($localStorage[LAST_ACTIVE_TAB_KEY])) {
        lastActiveTab = $localStorage[LAST_ACTIVE_TAB_KEY];
      }

      function hasSavedPolizaData() {
        return saveCreatedPoliza && Object.keys(saveCreatedPoliza).length > 0;
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
      
      var startDate;
      var endingDate;
      $scope.create_natural = true;
      $scope.create_juridical = true;
      order.f_currency={};
      order.f_currency.f_currency_selected = 1;
      order.f_currency.options = [
          {'value':1,'label':'PESOS'},
          {'value':2,'label':'DOLARES'},
          {'value':3,'label':'UDI'},
          {'value':4,'label':'EURO'},
          {'value':5,'label':'DOLAR CANADIENSE'},
          {'value':6,'label':'LIBRA ESTERLINA'},
          {'value':7,'label':'YEN'},
      ]

      $scope.ramos = [{
          'ramo_name': 'Vida',
          'ramo_id': 1
        },{
          'ramo_name': 'Gastos Médicos',
          'ramo_id':  2
        },{
          'ramo_name': 'Daños',
          'ramo_id': 3
        },{
          'ramo_name': 'Automóviles',
          'ramo_id': 9
        }]

      order.conducto_de_pago={};
      order.conducto_de_pago.conducto_de_pago_selected = 1;
      order.conducto_de_pago.options = [
          {'value':1,'label':'No domiciliada'},
          {'value':2,'label':'Agente'},
          {'value':3,'label':'CAC'},
          {'value':4,'label':'CAT/Domiciliado'},
          {'value':5,'label':'Nómina'},
          {'value':6,'label':'CUT'},
      ]


      order.renewal = {};
      order.renewal.is_renewable = 1;
      order.renewal.selected = 1
      order.renewal.options = [
          {'value':1,'label':'Renovable'},
          {'value':2,'label':'No Renovable'},
      ]
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
      order.types_ap = [
          {'id':64,'name':'Viajero'},
          {'id':46,'name':'Familiar'}
      ]
      order.types_gm = [
          {'id':46,'name':'Familiar'}
      ]
      order.businessline = [
          {'id':1,'name':'Comercial'},
          {'id':2,'name':'Personal'},
          {'id':0,'name':'Otro'},
      ]
      order.types_life = [
          {'id':47,'name':'Ahorro'},
          {'id':48,'name':'Vitalicia'},
          {'id':49,'name':'Temporal/Protección'},
      ]
      order.procedimiento = [
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
      
      $scope.usages = [
          {'id':1,'name':'PARTICULAR'},
          {'id':2,'name':'CARGA'},
          {'id':3,'name':'SERVICIO PÚBLICO'},
      ]
      order.types_incendio = [
          {'id':1,'name':'Familiar'},
          {'id':2,'name':'Casa Habitación'},
          {'id':3,'name':'Condominio'},
          {'id':4,'name':'Edificio'},
          {'id':5,'name':'Empresarial'},
          {'id':6,'name':'Múltiple Empresarial'},
          {'id':10,'name':'Sólo Incendio'},
      ]
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
      ]
      order.types_ayc = [
          {'id':11,'name':'Animales'},
          {'id':12,'name':'Cultivo'},
      ]
      order.types_credito = [
          {'id':13,'name':'Crédito General'},
      ]
      order.types_vivienda = [
          {'id':14,'name':'Crédito a la Vivienda'},
      ]
      order.types_garantia = [
          {'id':15,'name':'Documentos que sean objeto de oferta pública o de intermediación en mercados de valores'},
          {'id':16,'name':'Emisores de Valores'},
          {'id':17,'name':'Títulos de Crédito'},
      ]
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
      ]
      order.types_tyorc = [
          {'id':36,'name':'Riesgos Catastróficos'},
      ]
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
      ]
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
      ]
      $scope.paqueteGuardado=false;
      $scope.dataToSave = {};
      $scope.coverages = [];
      $scope.addCoverages = false;
      $scope.newCoverPack = false;

      $scope.celulas = [];
      $scope.agrupaciones = [];
      $scope.sub_asignaciones = [];
      $scope.sub_subasignaciones = [];

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
      order.ceder_porcentaje = ceder_porcentaje;
      order.accesos = $sessionStorage.permisos
      if (order.accesos) {
        order.accesos.forEach(function(perm){
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
                  order.acc_referenciador_obligatorio = true
                }else{
                  order.acc_referenciador_obligatorio = false
                }
              }
              if (acc.permission_name == 'Ver referenciadores') {
                if (acc.checked == true) {
                  order.acceso_ver_ref = true
                }else{
                  order.acceso_ver_ref = false
                }
              }
            })
          } else if(perm.model_name == 'Pólizas'){
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
              if (acc.permission_name == 'Comisión no obligatoria') {
                if (acc.checked == true) {
                  order.permiso_comision_no_obligatoria = true
                }else{
                  order.permiso_comision_no_obligatoria = false
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
          }else if(perm.model_name == 'Comisiones'){
            order.coms = perm
            order.coms.permissions.forEach(function(acc){
              if (acc.permission_name == 'Comisiones') {
                if (acc.checked == true) {
                  order.permiso_comisiones = true
                }else{
                  order.permiso_comisiones = false
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
      
      $scope.changeSensible = function(sensible, index) {
          uploader.queue[index].formData[0].sensible = sensible;
      }
      $scope.calculateComision = function(item, index) {
        console.log('hyyyyyyyyyyyyy',item,index)
      }

      $scope.checkDate= function(param) {
        if(param.length == 10) {
          var x = mesDiaAnio(param);
          param = convertDate(x);
        } 
      }

      if($localStorage.orderFormCotizacion) {
        try{
          var dataOrderForm = JSON.parse($localStorage.orderFormCotizacion);
          startDate = convertDate(new Date(mesDiaAnio(dataOrderForm.startDate)));
          endingDate = convertDate(new Date(mesDiaAnio(dataOrderForm.endingDate)));
          $scope.dataToSave.start_of_validity = new Date(mesDiaAnio(startDate));
          $scope.dataToSave.end_of_validity = new Date(mesDiaAnio(endingDate));
        }catch(e){
          startDate = convertDate(new Date());
          var endingDate =  convertDate(new Date().setYear(new Date().getFullYear() + 1));

          $scope.dataToSave.start_of_validity = new Date(mesDiaAnio(startDate));
          $scope.dataToSave.end_of_validity = new Date(mesDiaAnio(endingDate));
        }
      } else {

        startDate = convertDate(new Date());
        // console.log('startDate', startDate);
        var endingDate =  convertDate(new Date().setYear(new Date().getFullYear() + 1));

        $scope.dataToSave.start_of_validity = new Date(mesDiaAnio(startDate));
        $scope.dataToSave.end_of_validity = new Date(mesDiaAnio(endingDate));
      }
      order.showButtonPoliza = showButtonPoliza;
      order.hideButtonOT = hideButtonOT;
      order.setContractor = setContractor;
      order.getInternalNumber = getInternalNumber;
      order.refreshProvider = fillProvider;

     // order.
      order.hidden = true;

      $scope.sex = [
        { name: 'MASCULINO', value: 'M' },
        { name: 'FEMENINO', value: 'F' }
      ];

      $scope.seller = [];
      $scope.isSeller = [];
      
      $scope.pay_ways = [
          { key: 1, val :'Clave'}, 
          { key: 2, val :'Número de cuenta'},
          { key: 3, val :'Número de tarjeta'}, 
          { key: 4, val :'Efectivo'}
      ];
      
      $scope.fcs = [
          { key: 1, val :'Semanal'}, 
          { key: 2, val :'Quincenal'},
          { key: 3, val :'Mensual'}
      ];
      
      $scope.delete_subramos = [];
      $scope.delete_phones = [];
      
      order.subramo = {
          'ramos' : '',
          'sub_ramos' : '',
          'provider':'',
          'ramo':'',
          'subramo':'',
          'comision_percentage':''
      };


      order.ceder_comision = ceder_comision; 
      $scope.ceder_comision = false // para mostrar los valores de las claves
      
      order.form = {
          canCreate: false,
          contratante: '',
          poliza: '',
          folio: '',
          tel: '',
          correo: '',
          ramo: '',
          type: '',
          subramo: '',
          aseguradora: '',
          paquete: '',
          payment: '',
          internal_number: '',
          startDate: startDate,
          endingDate: endingDate,
          start_of_validity: new Date(mesDiaAnio(startDate)),
          end_of_validity: new Date(mesDiaAnio(endingDate)),
          ceder_comision: false,
          comision_percent: 0.0,
          renewal: 1,
          hospital_level:'',
          tabulator:'',
          business_line : 0,
          is_edit : false,
          from_pdf:false
      };
      $scope.order = order;
      $scope.fake_ramos = [{
          'id':-1,
          'ramo_code': -1,
          'ramo_name':'Vida',
          'subramo_ramo': [{
              'id': -1,
              'subramo_code': -1,
              'subramo_name': 'Vida'
              }]
          },{
          'id':-2,
          'ramo_code': -2,
          'ramo_name':'Accidentes y Enfermedades',
          'subramo_ramo': [{
              'id': -2,
              'subramo_code': -2,
              'subramo_name': 'Accidentes Personales'
              },{
              'id': -3,
              'subramo_code': -3,
              'subramo_name': 'Gastos Médicos'
              },{
              'id': -4,
              'subramo_code': -4,
              'subramo_name': 'Salud'
              }]
          },{
          'id':-3,
          'ramo_code': -3,
          'ramo_name':'Daños',
          'subramo_ramo': [{
              'id': -5,
              'subramo_code': -5,
              'subramo_name': 'Responsabilidad Civil y Riesgos Profesionales'
              },{
              'id': -6,
              'subramo_code': -6,
              'subramo_name': 'Marítimo y Transportes'
              },{
              'id': -7,
              'subramo_code': -7,
              'subramo_name': 'Incendio'
              },{
              'id': -8,
              'subramo_code': -8,
              'subramo_name': 'Agrícola y de Animales'
              },{
              'id': -9,
              'subramo_code': -9,
              'subramo_name': 'Automóviles'
              },{
              'id': -10,
              'subramo_code': -10,
              'subramo_name': 'Crédito'
              },{
              'id': -11,
              'subramo_code': -11,
              'subramo_name': 'Crédito a la Vivienda'
              },{
              'id': -12,
              'subramo_code': -12,
              'subramo_name': 'Garantía Financiera'
              },{
              'id': -13,
              'subramo_code': -13,
              'subramo_name': 'Diversos'
              },{
              'id': -14,
              'subramo_code': -14,
              'subramo_name': 'Terremoto y Otros Riesgos Catastróficos'
              }]
      }]
      // var vm = this;
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
      order.user = usr;
      $http.get(url.IP + 'get-vendors/')
      .then(function(user) {
        $scope.referenciador = user.data;
        $scope.referenciador.forEach(function(user) {
          user.first_name = user.first_name.toUpperCase()
          user.last_name = user.last_name.toUpperCase()
          user['phones'] = [];
          user['subramos'] = [];
        });
      });
      // $(w).load(function() {
      //   $('.js-example-basic-multiple').select2();
      // });
      angular.element(document).ready(function(){
        $('.js-example-basic-multiple').select2();
      });
      $http.get(url.IP + 'usuarios/')
      .then(function(user) {    
        // $scope.users = user.data.results;
        // console.log('users', $scope.users);
        $scope.users = [];
        $scope.ejecutivo_cobranza = [];
        user.data.results.forEach(function(usr) {
          usr.first_name = usr.first_name.toUpperCase()
          usr.last_name = usr.last_name.toUpperCase()            
          if(usr.user_info.is_active) {
            $scope.users.push(usr);
            $scope.ejecutivo_cobranza.push(usr);
          }
        });          


        $scope.show_pagination = true;
        $scope.config_pagination =  {
          count: user.data.count,
          next: user.data.next,
          previous: user.data.previous
        };
      
        $scope.testPagination('users', 'config_pagination');
      
        $scope.users.forEach(function(user) {
          user['phones'] = [];
          user['subramos'] = [];
        });

      });

      // $scope.aseguradorasPdfs = [
      //   {'alias': 'ABA'},
      //   {'alias': 'AIG'},
      //   {'alias': 'ATLAS'},
      //   {'alias': 'GNP'},
      //   {'alias': 'HDI'},
      //   {'alias': 'MAPFRE'},
      //   {'alias': 'PS'},
      //   {'alias': 'QUALITAS'},
      //   {'alias': 'SURA'},
      //   {'alias': 'ZURICH'}
      // ];

      $http.get(url.IP + 'aseguradoras-lectura-documentos')
      .then(function(data) {
        $scope.aseguradorasPdfs = data.data;
      });

      $scope.loaderPdf = false;
      $scope.read_pdf_contractor = {};
      
      providerService.getReadListProviders()
      .then(function(provider) {
        $scope.aseguradoras = provider;
      });

      var NO_COVERAGES_VALUES = 'noCoveragesValues';

      $scope.fileNameChanged = function (ele) {
        $scope.filePdf = ele.files[0];
        $scope.fileSelected = ele.files[0]
      };
      $scope.showFile = function (argument) {
        var reader = new FileReader();
        reader.readAsDataURL(argument.files[0]);
        $scope.fileSelected = argument.files[0]
        // $scope.uploader.queue = argument.files[0]
        var reader_pdf = new FileReader();
        reader_pdf.readAsDataURL($scope.fileSelected);
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
      $scope.verpdf = function (ele) {
        // console.log('-eleeee',ele,$scope.filePdf)
      };
      $scope.changePdf = function (item) {
        $scope.aseguradoraPdf = item;
        order.defaults.providers.forEach(function(pv){
          if (pv.alias == item) {
            order.form.aseguradora = pv
          }
        })

      }
      $scope.changeBusinessLine = function(val){
        // console.log('...businesline---',val)
      }

      $scope.changeRamoPdf = function(ramo){
        $scope.ramoPdf = ramo;
        if (order.defaults.ramos) {
          if (order.defaults.ramos.length >0) {
            order.defaults.ramos.forEach(function(rm){
              if (rm.ramo_code == ramo.ramo_id) {
                order.form.ramo = rm
              }
              if (ramo.ramo_id == 9 && rm.ramo_code ==3) {
                order.form.ramo = rm
              }
            })
          }
        }
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
      $scope.mostrarAdvertenciaSerie = true; // flag inicial
      $scope.omitirAdvertencia = function() {
        $scope.mostrarAdvertenciaSerie = false;
        $scope.saveLogOmitedFlagSerie=true;
      };
      $scope.capturarPoliza = function(){
        if(!$scope.filePdf){            
          SweetAlert.swal("Error", "Cargue un archivo pdf para capturar.", "error");
          return;
        }
        $scope.read_pdf = {};
        order.form = {};
        $localStorage['datos_pdf'] = {};
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
        // xhr.open("POST", 'https://lector-pdf.mbxservicios.com/upload-pdf');
        try{
          obtenerSerieImagen($scope.filePdf)
        }catch(e){
          console.log('eror al extraer imagen',e)
        }
        var auxRamo = $scope.ramoPdf && $scope.ramoPdf.ramo_id ? $scope.ramoPdf.ramo_id : 0;

        var data = new FormData();
        var dataFile = new FormData();
        dataFile.append("arch", $scope.filePdf);
        dataFile.append("nombre", $scope.fileSelected.name);
        data.append("archivo", $scope.filePdf);
        // data.append("insurance", $scope.aseguradoraPdf);
        // 3) Añade tus parámetros adicionales
        data.append("nombre", $scope.fileSelected.name);
        data.append("org", $scope.orgName);
        var requestId = generarRequestId();
        data.append("requestId",requestId)
        $localStorage.dataFile = dataFile;
        $scope.fileSelected.formData=[]   

        try{
          enviarPDFSerieXHR($scope.fileSelected, $scope.orgName, Date.now().toString(),
            function(resp) {
              $scope.$apply(function() {
                var raw = resp.data.image_b64; // ajusta a tu ruta real (a veces es resp.data.data.image_b64)
                var src = raw.startsWith('data:')
                  ? raw
                  : ('data:image/png;base64,' + raw);

                // 1) lo que pintas
                $scope.imgSerieSrc = $sce.trustAsResourceUrl(src);

                // 2) lo que guardas (string)
                $localStorage.imgSerieSrc = src;
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
          enviarPDFPrimasXHR($scope.fileSelected, $scope.orgName, Date.now().toString(),
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
                  $scope.imgPrimasSrc = $sce.trustAsResourceUrl(src);
                  // 2) lo que guardas (string)
                  $localStorage.imgPrimasSrc = src;
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
            $scope.read_pdf = JSON.parse(xhr.response);
            if($scope.read_pdf.status != '200_OK_ACCEPTED'){
              SweetAlert.swal("Error*", "A ocurrido un error al cargar el PDF, por favor intentalo de nuevo.", "error");
            }else{
              if ($scope.read_pdf.request_id !== requestId) {
                console.log('No coincide*',$scope.read_pdf.request_id,requestId)                        
                // SweetAlert.swal("Error", "Cargue un archivo pdf para capturar.", "error");
                // return;
              } 
              // else {
              //   console.log('Resultado ok *:', $scope.read_pdf.data);
              // }
              $localStorage['datos_pdf'] = $scope.read_pdf;
              $scope.filePdf = {}
              $scope.referenciadores = [$scope.referenciador];
              // $scope.referenciadores = []
              // $http.get(url.IP + 'get-vendors/')
              // .then(function(user) {
              //   $scope.referenciador = user.data;
              //   $scope.referenciador.forEach(function(user) {
              //     user.first_name = user.first_name.toUpperCase()
              //     user.last_name = user.last_name.toUpperCase()
              //     user['phones'] = [];
              //     user['subramos'] = [];
              //   });
              // });
              $scope.activeJustified=1;
              order.show.ot = false;
              if ($scope.read_pdf.data['Numero de poliza']){
                order.form.poliza = $scope.read_pdf.data['Numero de poliza'];
              }
              if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] &&  $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='NACIONAL'){
                $scope.order.f_currency.f_currency_selected = 1;
                order.f_currency.f_currency_selected = 1;
              }
              if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] &&  ($scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='Dolares' || ($scope.read_pdf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='dolares')){
                $scope.order.f_currency.f_currency_selected = 2;
                order.f_currency.f_currency_selected = 2;
              }
              if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] && !$scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='EXTRANJERA'){
                order.f_currency.f_currency_selected = 2;
                $scope.order.f_currency.f_currency_selected = 2;
              }                         
              if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] && ($scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='udi' || ($scope.read_pdf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='udis')){
                $scope.order.f_currency.f_currency_selected = 3;
                order.f_currency.f_currency_selected = 3;
              }
              order.conducto_de_pago.conducto_de_pago_selected =1;  
              $scope.pintarCoberturas=true;

              order.form.payment = $scope.read_pdf.data['Datos generales de la poliza']['Forma de pago'];
              if(!order.form.payment){
                try{
                  order.form.payment = $scope.read_pdf.data['Primas']['Forma_de_Pago'];          
                }catch(idx){}
              }
              if (order && order.form) {
                var p = Number(order.form.payment); // por si viene "15" string

                if ([15, 7, 14].indexOf(p) !== -1) {
                  order.form.payment = 12; // ✅ reset a anual

                  SweetAlert.swal(
                    "Advertencia",
                    "La forma de pago detectada (" + p + ") no aplica en este formato. Se ajustó a ANUAL (12). Verifica tu archivo o selecciona la forma de pago correcta.",
                    "warning"
                  );
                }
              }
              $scope.paqueteOriginal=$scope.read_pdf.data.cobertura;
              if ($scope.read_pdf.data['Datos del vehiculo']){

                order.subforms.auto.brand = $scope.read_pdf.data['Datos del vehiculo']['marca'];
                order.subforms.auto.model = $scope.read_pdf.data['Datos del vehiculo']['modelo'];
                order.subforms.auto.year = $scope.read_pdf.data['Datos del vehiculo']['anio'];
                order.subforms.auto.engine = $scope.read_pdf.data['Datos del vehiculo']['motor'];
                order.subforms.auto.serial = $scope.read_pdf.data['Datos del vehiculo']['serie'];
                $scope.serieAGuardar=order.subforms.auto.serial;
                if(order.subforms.auto.serial){
                  $scope.checkNumSerie();
                }
                // order.subforms.auto.license_plates = $scope.read_pdf.data['Datos del vehiculo']['clave_vehicular'];
                order.subforms.auto.license_plates = $scope.read_pdf.data['Datos del vehiculo']['placas'];
                var datosVehiculo = $scope.read_pdf.data['Datos del vehiculo'];

                order.subforms.auto.version = datosVehiculo.version 
                    ? datosVehiculo.version 
                    : (datosVehiculo.descripcion_vehiculo 
                        ? datosVehiculo.descripcion_vehiculo 
                        : datosVehiculo.clave_vehicular);
                order.subforms.auto.color = $scope.read_pdf.data['Datos del vehiculo']['color'];
                order.subforms.auto.service = $scope.read_pdf.data['Datos del vehiculo']['servicio'];
                if(order && order.subforms && order.subforms.auto && order.subforms.auto.service =='' || order.subforms.auto.service ==undefined || order.subforms.auto.service ==null){
                  if($scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data['Datos del vehiculo']['uso']){
                    if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 1){
                      order.subforms.auto.service= "PARTICULAR";
                    }else if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 2){
                      order.subforms.auto.service= "CARGA";
                      if ($scope.read_pdf.data && 
                        $scope.read_pdf.data['Datos del vehiculo'] && 
                        $scope.read_pdf.data['Datos del vehiculo']['tipo de carga']) {                        
                          if($scope.read_pdf.data['Datos del vehiculo']['tipo de carga']=='A'){
                            order.subforms.auto.charge_type = 1;
                          }else if($scope.read_pdf.data['Datos del vehiculo']['tipo de carga']=='B'){
                            order.subforms.auto.charge_type = 2;                    
                          }else if($scope.read_pdf.data['Datos del vehiculo']['tipo de carga']=='C'){
                            order.subforms.auto.charge_type = 3;                    
                          }else{
                            order.subforms.auto.charge_type = 1;
                          }
                      }
                    }else if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 3){
                      order.subforms.auto.service= "SERVICIO PÚBLICO";
                    }
                    else{
                      order.subforms.auto.service= "PARTICULAR";
                    }
                  }
                }
                order.form.identifier = order.subforms.auto.brand +' '+ order.subforms.auto.model
                // if(order.form.identifier !=order.subforms.auto.version){
                //   order.form.identifier = order.form.identifier+' '+order.subforms.auto.version
                // }
                try {
                  order.subforms.auto.usage = parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']);
                } catch(err){}
                }
                try {
                  if ($scope.read_pdf.data && 
                    $scope.read_pdf.data['Datos del vehiculo'] && 
                    $scope.read_pdf.data['Datos del vehiculo']['tipo de carga'] &&
                    $scope.read_pdf.data['Datos del vehiculo']['uso']) {
                    if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 2){
                      if($scope.read_pdf.data['Datos del vehiculo']['tipo de carga']=='A'){
                        order.subforms.auto.charge_type = 1;
                      }else if($scope.read_pdf.data['Datos del vehiculo']['tipo de carga']=='B'){
                        order.subforms.auto.charge_type = 2;                    
                      }else if($scope.read_pdf.data['Datos del vehiculo']['tipo de carga']=='C'){
                        order.subforms.auto.charge_type = 3;                    
                      }else{
                        order.subforms.auto.charge_type = 1;
                      }
                    }
                  }
                } catch(err){}
                
                //  movi este corchete aqui para que pueda leer gastos medicos sin datos del vehiculo
                if($scope.read_pdf.data['ramo']){
                  $scope.ramoPdf = $scope.read_pdf.data['ramo'];
                }else{
                  $scope.ramoPdf = ''
                  $scope.contratante = {}
                }
              
                var aseguradora_a_capturar = sinDiacriticos($scope.read_pdf.data['aseguradora'].toLowerCase())
                order.defaults.providers.some(function(x){
                  if(aseguradora_a_capturar =='chubb'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='CHUBB' || sinDiacriticos(x.alias).toLowerCase() == 'Aba' || sinDiacriticos(x.alias).toLowerCase() =='ABA' || sinDiacriticos(x.alias).toLowerCase() =='chubb seguros mexico') {
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
                  if(aseguradora_a_capturar =='qualitas'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='Quálitas' || sinDiacriticos(x.alias).toLowerCase() =='Qualitas' || sinDiacriticos(x.alias).toLowerCase() == 'QUALITAS' || sinDiacriticos(x.alias).toLowerCase() =='QUÁLITAS') {
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

                  if(aseguradora_a_capturar =='gnp'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='gnp' || sinDiacriticos(x.alias).toLowerCase() =='gnp seguros' || sinDiacriticos(x.alias).toLowerCase() == 'grupo nacional provincial' || sinDiacriticos(x.alias).toLowerCase() =='grupo nacional provincial ') {
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
                  if(aseguradora_a_capturar =='axa'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='axa' || sinDiacriticos(x.alias).toLowerCase() =='axa seguros') {
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
                  if(aseguradora_a_capturar =='hdi'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='hdi' || sinDiacriticos(x.alias).toLowerCase() =='HDI') {
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
                  if(aseguradora_a_capturar =='primero seguros'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='Primero Seguros' || sinDiacriticos(x.alias).toLowerCase() =='Pimero seguros') {
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
                  if(aseguradora_a_capturar =='ana'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='ana' || sinDiacriticos(x.alias).toLowerCase() =='ana seguros' || sinDiacriticos(x.alias).toLowerCase() =='ana compania de seguros ') {
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

                  if((aseguradora_a_capturar).toLowerCase() =='momento'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='momento' ) {
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
                  if(aseguradora_a_capturar =='afirme'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros afirme' ) {
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
                  if(aseguradora_a_capturar =='seguros monterrey' || aseguradora_a_capturar=='seguros monterrey new york life'){
                    aseguradora_a_capturar='seguros monterrey new york life';
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros monterrey new york life' ) {
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
                  if(aseguradora_a_capturar =='seguros bx+' || aseguradora_a_capturar=='bx+'  || aseguradora_a_capturar=='Seguros Bx+'){
                    aseguradora_a_capturar='bx+';
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros ve por mas' || sinDiacriticos(x.alias).toLowerCase() =='bx+' || sinDiacriticos(x.alias).toLowerCase() =='seguros bx+' || sinDiacriticos(x.alias).toLowerCase() =='grupo financiero ve por mas' || sinDiacriticos(x.alias).toLowerCase() =='grupo financiero ve por mas ') {
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
                  if(aseguradora_a_capturar =='Metlife' || aseguradora_a_capturar=='metlife'){
                    aseguradora_a_capturar='metlife';
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='met life' || sinDiacriticos(x.alias).toLowerCase() =='metlife') {
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
                  if(aseguradora_a_capturar =='PlanSeguro' || aseguradora_a_capturar=='planseguro' || aseguradora_a_capturar=='plan seguro'){
                    aseguradora_a_capturar='plan seguro';
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='plan seguros' || sinDiacriticos(x.alias).toLowerCase() =='plan seguro ' || sinDiacriticos(x.alias).toLowerCase() =='plan de seguro cía de seguros') {
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
                  if(aseguradora_a_capturar =='Bupa' || aseguradora_a_capturar=='bupa'){
                    aseguradora_a_capturar='bupa';
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase()=='bupa' || sinDiacriticos(x.alias).toLowerCase() =='bupa seguros' || sinDiacriticos(x.alias).toLowerCase() =='seguros bupa' || sinDiacriticos(x.alias).toLowerCase() =='bupa mexico') {
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
                  if(aseguradora_a_capturar =='zurich'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='zurich ' || sinDiacriticos(x.alias).toLowerCase() =='zurich seguros') {
                      order.form.aseguradora = x;
                      var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']
                      if(!cl || cl==undefined){
                        try{
                          cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave_interna_del_agente']
                        }catch(u){}
                      }
                      get_claves_pdf(x,cl)
                    }
                  }
                  // vida
                  if(aseguradora_a_capturar =='atlas'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros atlas' ) {
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
                  return false;
                });    
               
                order.subforms.auto.policy_type = {'id':1,'name':'Automóvil'};
                order.subforms.auto.procedencia = {'id':1,'name':'Residente'}
                if(aseguradora_a_capturar =='hdi' && $scope.read_pdf.data['Datos del vehiculo']['tipo'] == "Pick Up"){
                   order.subforms.auto.policy_type = {'id':5,'name':'Pick Up'};

                }
                // $scope.saveLocalstorange();
              
              // if ($scope.read_pdf.data.data.life_policy){
              //   order.subforms.life.aseguradosList = [$scope.read_pdf.data.data.life_policy.personal];
              //   order.subforms.life.beneficiariesList = [$scope.read_pdf.data.data.life_policy.beneficiaries_life]
              //   order.subforms.life.beneficiariesList = order.subforms.life.beneficiariesList.map(function(item){
              //     item = item[0];
              //     item['person'] = 1;
              //     item['percentage'] = item['percentage'] ? parseFloat(item['percentage']) : 0;
              //     return item
              //   })
              // }

              // if ($scope.read_pdf.data.data.accidents_policy){
              //   order.subforms.disease.first_name = [$scope.read_pdf.data.data.accidents_policy.disease_type.first_name];
              //   order.subforms.disease.last_name = [$scope.read_pdf.data.data.accidents_policy.disease_type.last_name];
              //   order.subforms.disease.second_last_name = [$scope.read_pdf.data.data.accidents_policy.disease_type.second_last_name];
              //   order.subforms.disease.birthdate = [$scope.read_pdf.data.data.accidents_policy.disease_type.birthdate];
              //   $scope.sex.forEach(function(item){
              //     if(item.value == $scope.read_pdf.data.data.accidents_policy.disease_type.sex){
              //       order.subforms.disease.sex = item.value;
              //     }
              //   })
              //   order.subforms.disease.antiguedad = [$scope.read_pdf.data.data.accidents_policy.disease_type.antiguedad];
              //   order.subforms.disease.relationship_accident = [$scope.read_pdf.data.data.life_policy.relationship_accident]
              //   order.subforms.disease.relationship_accident = order.subforms.disease.relationship_accident.map(function(item){
              //     item = item[0];
              //     item['person'] = 1;
              //     item['percentage'] = item['percentage'] ? parseFloat(item['percentage']) : 0;
              //     return item
              //   })
              
              // }
           
                  order.form.from_pdf = true;
                  if(($scope.read_pdf.data['contratante_full_name'].indexOf("S.A. DE") > -1)){
                    $scope.read_pdf_contractor.type = false;
                    $scope.read_pdf_contractor.name =$scope.read_pdf.data['contratante_full_name'];
                  }else{
                    $scope.read_pdf_contractor.type = true;
                    // $scope.read_pdf_contractor.name = $scope.read_pdf.data['Datos del asegurado']['propietario_contratante']
                    $scope.read_pdf_contractor.name = $scope.read_pdf.data['contratante_full_name']
                    
                  }
                  if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Prima total']) {
                    $scope.order.form.primaTotal = $scope.read_pdf.data['Primas']['Prima total'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Prima total'])) : $scope.read_pdf.data['Primas']['IMPORTE TOTAL'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['IMPORTE TOTAL'])) : 0;
                    $scope.order.form.subTotal = $scope.read_pdf.data['Primas']['Subtotal'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Subtotal'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }
               
                  if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Prima neta']) {
                    $scope.order.form.primaNeta = $scope.read_pdf.data['Primas']['Prima neta'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Prima neta'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }

                  if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Gastos de expedición']) {
                    try{
                      $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos de expedición'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos de expedición'])) : 0;
                      $localStorage['primas'] = $scope.order.form;
                    }catch(o){
                      $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos de expedici\u00f3n'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos de expedici\u00f3n'])) : 0;
                      $localStorage['primas'] = $scope.order.form;
                    }
                  }
                  if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Gastos por Expedición.']) {
                    try{
                      $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos por Expedición.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos por Expedición.'])) : 0;
                      $localStorage['primas'] = $scope.order.form;
                    }catch(o){
                      $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos por Expedici\u00f3n.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos por Expedici\u00f3n.'])) : 0;
                      $localStorage['primas'] = $scope.order.form;
                    }
                  }
                  if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Financiamiento por pago fraccionado']) {
                    $scope.order.form.rpf = $scope.read_pdf.data['Primas']['Financiamiento por pago fraccionado'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Financiamiento por pago fraccionado'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }
                  if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Derecho de Póliza']) {
                    $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Derecho de Póliza'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Derecho de Póliza'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }                  
                  if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Descuento']) {
                    var valor = parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Descuento'])) || 0;
                    // Si el valor es negativo → convertirlo a positivo multiplicando por -1
                    if (valor < 0) {
                        valor = valor * -1;
                    }
                    $scope.order.form.descuento = valor;
                    $localStorage['primas'] = $scope.order.form;
                  }else{
                    $scope.order.form.descuento = 0;
                  }
                  if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['I.V.A.']) {
                    $scope.order.form.iva = $scope.read_pdf.data['Primas']['I.V.A.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['I.V.A.'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }
                  if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['IVA']) {
                    $scope.order.form.iva = $scope.read_pdf.data['Primas']['IVA'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['IVA'])) : 0;
                    $localStorage['primas'] = $scope.order.form;
                  }
               
                
             

              // $scope.verComisiones();
              order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
              order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
              try{
                $scope.order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
                $scope.order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
                order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
                order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
              }catch(f){

              }
              order.form.endDate =  $scope.read_pdf.data['fecha_fin']
              order.form.start_of_validity= new Date($scope.read_pdf.data['fecha_inicio'])
              order.form.end_of_validity = new Date($scope.read_pdf.data['fecha_fin'])

              $scope.dataToSave.start_of_validity = (mesDiaAnio((order.form.startDate)));
              $scope.dataToSave.end_of_validity = mesDiaAnio((order.form.endingDate));
       
              var date1 = new Date($scope.dataToSave.start_of_validity);
              var date2 = new Date($scope.dataToSave.end_of_validity);
              var timeDiff = Math.abs(date2.getTime() - date1.getTime());
              order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
              // $scope.checkEndDate()
              order.form.from_pdf = true
              // $rootScope.readPDF = {
              //   individual:$scope.read_pdf.data['Datos del asegurado'],
              //   corporation: $scope.read_pdf.data['Datos del asegurado'],
              //   address: $scope.read_pdf.data['contratante_domicilio'],
              //   first_name: $scope.read_pdf.data['contratante_full_name'],
              //   last_name: $scope.read_pdf.data['contratante_primer_apellido'],
              //   second_last_name: $scope.read_pdf.data['contratante_segundo_apellido'],
              //   type_person: $scope.read_pdf.data['persona'],

              // };
              var asegurado = $scope.read_pdf.data['Datos del asegurado'] || {};
              $scope.first_name = asegurado.propietario_contratante && asegurado.propietario_contratante.trim()
                ? asegurado.propietario_contratante
                : (asegurado.contratante_full_name || '');
              $scope.first_name= sinDiacriticos($scope.first_name)

              order.form.from_pdf = true
              $rootScope.readPDF = {
                individual:$scope.read_pdf.data['Datos del asegurado'],
                corporation: $scope.read_pdf.data['Datos del asegurado'],
                address: $scope.read_pdf.data['contratante_domicilio'],
                first_name: $scope.first_name,
                last_name: $scope.read_pdf.data['contratante_primer_apellido'],
                second_last_name: $scope.read_pdf.data['contratante_segundo_apellido'],
                type_person: $scope.read_pdf.data['persona'],

              };
              $scope.saveLocalstorange();
              // if($scope.infoUser.staff && !$scope.infoUser.superuser){
              //   $scope.show_contratante = 'v2/contratantes/contractors-match/';
              $scope.show_contratante = 'contractors-match/';
              $http.post(url.IP + $scope.show_contratante, 
                {
                  'matchWord': $scope.read_pdf_contractor.name,
                  'poliza': true
                })
              .then(function(response){

                if(response.status === 200){
                  if(response.data != 404){
                    if(response.data.contractors.length){

                      //contractor selection
                        if(response.data.contractors.length){                          
                          for(var i = 0; i < response.data.contractors.length; i++){
                            var reg = /\d{,}/g
                            var reg2 = /\d{.}/g
                            var nombre_pdf = ($scope.read_pdf_contractor.name.replace(reg, "")).toLowerCase();
                            var nombre_pdf = (nombre_pdf.replace(reg2, "")).toLowerCase();
                            var nombre_api = (response.data.contractors[i].full_name.replace(reg, "")).toLowerCase();
                            var nombre_api = (nombre_pdf.replace(reg2, "")).toLowerCase();
                            if((((nombre_pdf).replace(',','')).replace('.','')).toLowerCase() == (((nombre_api).replace(',','')).replace('.','')).toLowerCase()){
                              order.form.contratante.val = response.data.contractors[i].full_name;
                              order.form.contratante.value = response.data.contractors[i];
                              order.form.contratante.phone = response.data.contractors[i].phone;
                              order.form.contratante.email = response.data.contractors[i].email;
                            }
                            $scope.contratante = response.data.contractors[i]
                            if($scope.read_pdf.data['asegurados']){
                              llenarAsegurados($scope.read_pdf.data['asegurados'])
                            }
                            if((i + 1) == response.data.contractors.length){
                              if(!order.form.contratante.value){
                                $scope.objetoPoliza = order.form;
                                $scope.saveLocalstorange()
                                order.contratanteCreatorModalEvent();
                              }
                            }
                          }
                        }else{
                          $scope.objetoPoliza = order.form;
                          $scope.saveLocalstorange();
                          order.contratanteCreatorModalEvent();
                        }
                      // }
                    }else{
                      $scope.objetoPoliza = order.form;
                      $scope.saveLocalstorange();
                      order.contratanteCreatorModalEvent();
                    }
                  }else{
                    $scope.objetoPoliza = order.form;
                    order.contratanteCreatorModalEvent();
                  }
                }else{
                  $scope.objetoPoliza = order.form;
                  $scope.saveLocalstorange();
                  order.contratanteCreatorModalEvent();
                }
              });
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
      $scope.hasInvalidVinLettersTest = function (vin) {
        if (!vin) return false;
        return /[OIQ]/i.test(vin);
      };
      $scope.addReferenciador = function(type) {
        var addReferenciadores = {
          referenciador: $scope.referenciador
        };
        if ($scope.referenciadores) {
          $scope.referenciadores = $scope.referenciadores
        }else{
          $scope.referenciadores = []
        }
        $scope.referenciadores.push(addReferenciadores);
      }
      $scope.changeReferenciador = function(ref,index) {
        $scope.saveLocalstorange();
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
      $scope.deleteReferenciador = function(index, type) {
        $scope.referenciadores.splice(index, 1);
          
      }
      $scope.referenciador_policy = []
      $scope.changeResponsable = function(data, type){
        $scope.referenciador_policy.push(data);
        $scope.saveLocalstorange();
      }
      $scope.addPhone =function(index) {   
          if($scope.users[index].phones) {
              $scope.users[index].phones.push('');
          } else {
              $scope.users[index].phones = [''];
          }         
      };
      
      $scope.deletePhone = function(index,index2) {
          $scope.delete_phones.push($scope.users[index].phones.index2);
          $scope.users[index].phones.splice(index2, 1);
      };
      $scope.domiciliado = false;
      $scope.changeDomiciliado = function() {
        $scope.change_domiciliado = true;
        if(order.form.domiciliado == 'true' || order.form.domiciliado == true) {
          $scope.domiciliado = true;
        } else {
          $scope.domiciliado = false;
        }          
      };

      $scope.changeRamoVendedor = function(sub_ramo) {
          if (!sub_ramo.ramo){
              $scope.subramos = []
              sub_ramo.sub_ramos = []
              return
          }

          sub_ramo.sub_ramos = sub_ramo.ramo.subramo_ramo;
      };
      
      $scope.addSubramo = function(index) {
          if($scope.users[index].subramos) {

              $scope.users[index].subramos.push({'ramos':$scope.fake_ramos});
          } else {
              $scope.users[index].subramos = [{}];
          }
      };
      $scope.changeProc = function(index) {
      };

      $scope.changeComision = function(event, com) {
        var len_value = String($scope.dataToSave.give_comision).length;
        var value = parseFloat($scope.dataToSave.give_comision); 
        var comd = parseFloat($scope.dataToSave.give_comision); 
    
        // console.log('value', value);
        if(value > 100) {
          $scope.dataToSave.give_comision = '';
          $scope.dataToSave.give_comision = 100;
        }else if (isNaN(value)) {
          $scope.dataToSave.give_comision = '';
          // SweetAlert.swal("Error","Comisión Inválida, se guardará en 0", "error")
          // $scope.dataToSave.give_comision = 0;
        }else if (value < 0) {
          $scope.dataToSave.give_comision = '';
          $scope.dataToSave.give_comision = 0;
        }

        if (isNaN(comd)) {
          // console.log('1111111', comd);
          $scope.dataToSave.give_comision = '';
          // SweetAlert.swal("Error","Comisión Inválida, se guardará en 0", "error")
          // $scope.dataToSave.give_comision = 0;
        }

        if ($scope.letras_com(com) == 1) {
          // console.log('2222222');
          $scope.dataToSave.give_comision = '';
          SweetAlert.swal("Error","Comisión Inválida, se guardará en 0", "error")
          $scope.dataToSave.give_comision = 0;
        }
      };
      var letras="abcdefghyjklmnñopqrstuvwxyz";
      var l = "ABCDEFGHYJKLMNÑOPQRSTUVWXYZ"

      $scope.letras_com = function(comision) {
         for(i=0; i<comision.length; i++){
            if ((letras.indexOf(comision.charAt(i),0)!=-1) || (l.indexOf(comision.charAt(i),0)!=-1)){
               return 1;
            }
         }
         return 0;
      }


      $scope.checkImporte = function(param) {

        if(parseFloat(param) < 0) {

          $scope.dataToSave.comision_currency = 0;
          SweetAlert.swal('Error','La comisión no puede ser menor a 0.','error');
          return;
        } else {
          $scope.dataToSave.comision_currency = parseFloat($scope.dataToSave.comision_currency.toFixed(2));
        }

        var prima_neta = parseFloat(order.poliza.primaNeta);
        var comision = parseFloat(order.form.comision_percent);

        comision = comision / 100;

        var x = prima_neta / 100;
        var currency = parseFloat(param);
 
        order.form.comision_percent =parseFloat((parseFloat(currency / x)).toFixed(2));

      };

      $scope.checkValue = function(argument) {

        var floatValue = parseFloat(argument);

        if(floatValue < 0) {

          order.form.comision_percent = 0;

          SweetAlert.swal('Error','La comisión no puede ser menor a 0.','error');
          return;
        } else if (floatValue > 100){
          order.form.comision_percent = 100;
        } else {

          if(!order.poliza.primaNeta) {
            order.poliza.primaNeta = 0;
          }

          order.form.comision_percent = parseFloat(order.form.comision_percent.toFixed(2));

          var prima_neta = parseFloat(order.poliza.primaNeta);
          var comision = parseFloat(order.form.comision_percent);

          comision = comision / 100;

          $scope.dataToSave.comision_currency = (prima_neta * comision).toFixed(2);    
        }
      }

      function fillProvider() {
        var d = order.form.startDate;
        try{
          var curr_date = d.getDate();
          var curr_month = d.getMonth() + 1; //Months are zero based
          var curr_year = d.getFullYear();
        }

        catch(error){
          var from = d.split("/")
          var f = new Date(from[2], from[1] - 1, from[0])
          var curr_date = f.getDate();
          var curr_month = f.getMonth() + 1; //Months are zero based
          var curr_year = f.getFullYear();
        }

        var date = curr_year + "-" + curr_month + "-" + curr_date;
        providerService.getProviderByKey(date)
        .then(function success(data) {
            order.defaults.providers = data.data;
          },
          function error(err) {
            console.log('error', err);
          });

      }
      
      $scope.testPagination = function(parModel, parConfig) {
      
          var config_ = $parse(parConfig)($scope);
      
          if(config_) {
            var pages = Math.ceil(config_.count / 10);
          }
      
          // console.log('pages', pages);
          
          $scope.totalPages = [];
          var count_items = 0;
          var count_pages = 0;
      
          var previous_array = [];
          var next_array = [];
      
          $scope.start = 0;
          $scope.end = 5;
          $scope.actual_page = 1;
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

            $scope.actual_page = $scope.totalPages.length;

          }

          $scope.selectPage = function (parPage) {
      
            if(config_.next || config_.previous) {
      
              if(config_.next) {
                var url = config_.next.substring(0, config_.next.indexOf("&page=") + 6);
                url += parPage.toString();
              } else {
                if(config_.previous.search('&page=') !== -1) {
                  var url = config_.previous.substring(0, config_.previous.indexOf("&page=") + 6);
                  url += parPage.toString();
      
                } else {
                  var url = config_.previous
                }
              }
            }
      
            // url += '&status=1'
            getProviders(url);
            $scope.actual_page = parPage;
            if($scope.actual_page > 1) {
              $scope.not_prev = false;
            }
      
            if($scope.actual_page == $scope.totalPages.length -1) {
              $scope.not_next = true;
            }
      
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
      
      
          function getProviders(parUrl) {
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
      
      
      $scope.deleteSubramo = function(index_main, index_sub, data){
          $scope.delete_subramos.push(data.subramos[index_sub]);
          data.subramos.splice(index_sub, 1);
      };
      
      $scope.changeVendedor_policy = function(vendedor) {
        $scope.users.some(function(user) {
          if (vendedor == user.id){
            // console.log(user)
            var vendedor_info = user.user_info.info_vendedor[0]
            if (vendedor_info.vendedor_subramos.length == 0){
              SweetAlert.swal('error','El vendedor no tiene comisión en el subramo actual');
              order.form.vendor = null;
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

      $scope.changePerson = function(type, raw) {
        raw.person = type;
      }

      function setContractor() {
        order.subforms.auto.driver = order.form.contratante.val;
      }

      function getInternalNumber() {
        $http({
          method: 'POST',
          url: url.IP + 'internal-number/'
        })
        .then( 
            function success(request) {
                if((request.status === 200) || (request.status === 201)){
                    $scope.internal_number ='OT000' + request.data.id;               
                    order.form.internal_number = 'OT000' + request.data.id;  
                    $scope.dataToSave.internal_number= $scope.internal_number
                }
            }, 
            function error(error) {

            }
        )
        .catch(function(e){
            console.log(e);
        });
      }

      function ceder_comision() {

        // console.log(order.form);

        if(order.form.ceder_comision == true) {
          SweetAlert.swal({
                title: '¿Está seguro?',
                text: "¿Estas seguro de que deseas modificar la comisión?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si, estoy seguro.",
                cancelButtonText: "Cancelar",
                closeOnConfirm: true
            }, function(isConfirm) {
                if (isConfirm) {
                  if(order.form.comision){
                    $scope.ceder_comision = order.form.ceder_comision;
                    order.form.comision_percent = order.form.comision.comission;
                    order.form.comision_percent = parseFloat(order.form.comision_percent);

                    if(!$scope.dataToSave.comision) {
                      $scope.dataToSave.comision_currency = 0;
                    }

                    if(!order.poliza.primaNeta) {
                      order.poliza.primaNeta = 0;
                    }

                    var prima_neta = parseFloat(order.poliza.primaNeta);
                    var comision = parseFloat(order.form.comision_percent);

                    comision = comision / 100;

                    $scope.dataToSave.comision_currency = parseFloat(prima_neta * comision).toFixed(2); 
                    $scope.dataToSave.comision_currency = parseFloat($scope.dataToSave.comision_currency);                   

                  }else {
                    SweetAlert.swal("Error", MESSAGES.ERROR.COMISSION, "error")
                    // toaster.warning("");
                  }
                }
                else{
                  order.form.ceder_comision = false;
                }
            });
        }
        else{
          $scope.ceder_comision = order.form.ceder_comision;
          order.form.comision_percent = parseFloat(order.form.comision.comission);
        }
      }

      function ceder_porcentaje() {
        if(order.form.ceder_porcentaje == true) {
          SweetAlert.swal({
                title: '¿Está seguro?',
                text: "Cederá un porcentaje de la comisión",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si, estoy seguro.",
                cancelButtonText: "Cancelar",
                closeOnConfirm: true
            }, function(isConfirm) {
                if (isConfirm) {
                  if(order.form.comision){
                    order.form.ceder_porcentaje = true;
                  }else {
                    SweetAlert.swal("Error", MESSAGES.ERROR.COMISSION, "error")
                  }
                }
                else{
                  order.form.ceder_porcentaje = false;
                }
            });
        }
        else{
          $scope.ceder_porcentaje = order.form.ceder_porcentaje;
          $scope.dataToSave.give_comision = 0;
        }
      }

      function getmatches(word) {
        if(word.length >= 3){
          $http.post(url.IP+ 'cars-match/', {'matchWord':word}).then(function(response){
            var source=[];
            if(response.data.length) {
              response.data.forEach(function(cars){
                var obj = {
                  label: cars.car_search ,
                  value: cars
                }
                source.push(obj)
              });
            } else {
              source.length = 0;
            }
            $scope.autocompleteCarsData = source;
          });
        }
      }
      function persistActiveTab(tabIndex) {
        lastActiveTab = tabIndex;
        $localStorage[LAST_ACTIVE_TAB_KEY] = tabIndex;
      }

      function applyActiveTab(tabIndex) {
        if ($scope.activeJustified !== tabIndex) {
          $scope.activeJustified = tabIndex;
        }
        var shouldShowOt = tabIndex === TAB_INDEX_OT;
        if (order.show.ot !== shouldShowOt) {
          order.show.ot = shouldShowOt;
        }
      }

      function showButtonPoliza() {
        persistActiveTab(TAB_INDEX_POLICY);
        applyActiveTab(TAB_INDEX_POLICY);
      }

      function hideButtonOT() {
        persistActiveTab(TAB_INDEX_OT);
        applyActiveTab(TAB_INDEX_OT);
      }

      function restoreActiveTab() {
        var storedTab = $localStorage[LAST_ACTIVE_TAB_KEY];
        if (storedTab === TAB_INDEX_OT || storedTab === TAB_INDEX_POLICY) {
          applyActiveTab(storedTab);
          lastActiveTab = storedTab;
        } else if (lastActiveTab === TAB_INDEX_OT) {
          applyActiveTab(TAB_INDEX_OT);
        } else if (lastActiveTab === TAB_INDEX_POLICY) {
          applyActiveTab(TAB_INDEX_POLICY);
        }
      }

      // ------- Guardar sumas aseguradas y deducibles
      $scope.demo = function(param) {
        // console.log('demo');
        var model = formatValues.currency(param);  
        // console.log('modle', model);
        return model;

      };

      $scope.renewalSelection = function() {
        $scope.dataToSave.is_renewable = order.renewal.selected;
      }

      $scope.show_button_save_sum = false;
      $scope.show_button_save_ded = false;

      $scope.saveSum = function (parValue, parCoverage) {
        $scope.n_exis=0;
          parCoverage.sums_coverage.forEach(function(item) {
          $scope.exist_flag = false;
          if(item){
            if(item.sum_insured == parValue){
              $scope.exist_flag = true;  
              $scope.n_exis = $scope.n_exis + 1;
              if($scope.exist_flag == true){
                $scope.exist_flag = true;
                $scope.n_exis = $scope.n_exis + 1;
              }
            }
            else if($scope.n_exis == 0 || $scope.n_exis == undefined){
              $scope.exist_flag = false;
            }
            if($scope.n_exis >0){
              $scope.exist_flag = true;
            }
          }
        })
        if( !$scope.exist_flag || ($scope.n_exis == 0 || $scope.n_exis == undefined)){
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
        }
      };

      $scope.saveDed = function (parValue, parCoverage) {
        $scope.n_exis=0 ;
        parCoverage.deductible_coverage.forEach(function(item) {
          $scope.exist_flag = false;
          if(item){
            if(item.deductible == parValue){
              $scope.exist_flag = true;  
              $scope.n_exis = $scope.n_exis + 1;
              if($scope.exist_flag == true){
                $scope.exist_flag = true;
                $scope.n_exis = $scope.n_exis + 1;
              }
            }
            else if($scope.n_exis == 0 || $scope.n_exis == undefined){
              $scope.exist_flag = false;
            }
          if($scope.n_exis >0){
            $scope.exist_flag = true;
          }
         }
        })
        if( !$scope.exist_flag || ($scope.n_exis == 0 || $scope.n_exis == undefined)){
          var obj = {
            deductible : parValue,
            default : false,
            coverage_deductible: parCoverage.url
          };
          coverageService.createDeducible(obj)
          .then(function(req) {
            if(req.id) {
              $scope.result_ = false;
              parCoverage.deductible_coverage.push(req);
            }
          });
        }
      };
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

  $scope.checkNumPolicy = function () {
    if(order.form.poliza){
      // helpers.existPolicy(order.form.poliza)
      helpers.existPolicyNumber(order.form.poliza)
      .then(function(request) {
        if(request == true) {
          SweetAlert.swal("Error",MESSAGES.ERROR.POLICYEXIST, "error")
          // toaster.warning('El número de póliza ya existe.');

          order.form.poliza = '';
        }
      })
      .catch(function(err) {

      });
    }
  };

  $scope.checkNumSerie = function () {
    if(order.subforms.auto.serial){
      $scope.serieAGuardar=order.subforms.auto.serial;
      helpers.existSerial(order.subforms.auto.serial)
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

  function validate() {
    var flag = true;
    var code = parseInt(order.defaults.formInfo.code);
    if(order.form.contratante == '' || order.form.contratante == null) {
        flag = false;
        SweetAlert.swal("Error", MESSAGES.ERROR.CONTRACTORERROR, "error");
    }else if(order.form.address == null) {
        flag = false;
        SweetAlert.swal("Error", MESSAGES.ERROR.ADDRESS, "error");
    }else if(order.form.contratante.phone_number == null) {
        flag = false;
        SweetAlert.swal("Error", MESSAGES.ERROR.PHONE, "error");
    }
    else if(order.form.clave == null) {
        flag = false;
        SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
    }
    else if(order.form.paquete == null || order.form.paquete == '') {
        flag = false;
        SweetAlert.swal("Error", MESSAGES.ERROR.PACKAGE, "error")
    } else if(!code) {
        flag = false;
        SweetAlert.swal("Error", MESSAGES.ERROR.DATAFORMREQUIRED, "error")
    } else if(code == 1){ //life

    } else if(code == 2 || code == 3 || code == 4){ //disease
        var subform = order.subforms.disease;
        if(subform.first_name == '' || subform.last_name == '' || subform.second_last_name == '' || subform.sex == ''
             || !subform.first_name  || !subform.last_name  || !subform.second_last_name  || !subform.sex ) {
            flag = false;
            SweetAlert.swal("Error", MESSAGES.ERROR.DATAFORMREQUIRED, "error")
        }
        if(!(subform.birthdate instanceof Date)){
            flag = false;
            SweetAlert.swal("Error", MESSAGES.ERROR.DATES, "error")
        }

    } else if(code == 5 || code == 6 || code == 7 || code == 8 || code == 10 || code == 11 || code == 12 || code == 13 || code == 14) { //damage
        var damage = order.subforms.damage;
        if(damage.insured_item == '' || damage.item_address == '' || damage.item_details == ''
           || !damage.insured_item || !damage.item_address || !damage.item_details) {
            flag = false;
            SweetAlert.swal("Error", MESSAGES.ERROR.DATAFORMREQUIRED, "error")
        }
    } else if(code == 9) {// auto

        var auto = order.subforms.auto;
        // if (auto != null) {
        //   if(!auto.brand || auto.color == '' || auto.engine == ''
        //      || auto.license_plates == '' || auto.model == '' || auto.serial == '' || !auto.year) {
        //       flag = false;
        //       toaster.warning("Datos de formulario requeridos");
        //   }
        // }
        if (auto != null) {
          if(!auto.brand || auto.model == '' || !auto.year) {
              flag = false;
              SweetAlert.swal("Error", MESSAGES.ERROR.AUTOFORM, "error")
              l.stop();
              return;
          }
        }
        else {
          flag = false;
          SweetAlert.swal("Error", MESSAGES.ERROR.AUTOFORM, "error")
          return
          // toaster.warning("Datos del auto (marca, modelo y año) requeridos");
        }
    }
    return flag;
  }

  function validate2() {
    var flag = true;
    if(order.defaults.coverages.length == 0) {
        flag = false;
        SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGESREQUIRED, "error")
        return
        // toaster.warning("Al menos una cobertura es requerida");
    }
    if(order.receipts.length == 0){
        flag = false;
        SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSREQUIRED, "error")
        return
        // toaster.warning("Generar recibos es requerido");
    }
    if(order.form.poliza == '' || order.form.poliza == null){
        flag = false;
        SweetAlert.swal("Error", MESSAGES.ERROR.POLIZANOREQUIRED, "error")
        // toaster.warning("Número de póliza requerido");
    }
    return flag;
  }
      
  order.show = {
      ot: true,
      receipt: false,
      generateReceipts: false,
      receiptsGenerated: false,
      firstTab: true,
      showForms: false,
      showCoverages: false
  };
  if (!order.acceso_adm_ot && order.acceso_adm_pol) {
    order.show = {
      ot: false,
      receipt: true,
      generateReceipts: true,
      receiptsGenerated: true,
      firstTab: true,
      showForms: true,
      showCoverages: true
    }          
  }
  order.contratanteCreatorModalEvent = contratanteCreatorModalEvent;
  order.getmatches = getmatches;

  order.loading = true;


  order.form = models.orderForm();

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

    $scope.checkDateValues = function (values) {
      var date1 = datesFactory.toDate((order.form.startDate));
      var date2 = datesFactory.toDate((values));
      $scope.dateOut  = false;
      if (date1 > date2) {
        SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATERANGE, "error")
        // $scope.dateEnd(date1);
        $scope.dateOut  = true;
        return;
      }else{
        $scope.dateOut  = false;
      }
    };
    $scope.dateEnd = function(dateI){
      order.form.endingDate = ''
      var f = new Date()
      var f = new Date(dateI.setFullYear(dateI.getFullYear()+1))
      // order.form.endingDate = convertDate(f);
      var date = (new Date());
      // order.form.endingDate = new Date(date.setYear(date.getFullYear() + 1));
      var x = mesDiaAnio(order.form.startDate);
      // console.log('ok', x);

      var date = (new Date(x));
      // order.form.endingDate = x;
      order.form.endingDate = new Date(date.setYear(date.getFullYear() + 1));
      order.form.endingDate =convertDate(order.form.endingDate);
    }
    $scope.checkEndDate = function (event) {
      if(order.form.startDate.length == 10) {
        order.form.endingDate = convertDate(mesDiaAnio(order.form.endingDate));
        $scope.dataToSave.end_of_validity = formatDateToISO(order.form.endingDate,2);
      } 
      
      if(order.form.startDate) {

        if(order.form.endingDate.length == 10) {

          if(isNaN(order.form.endingDate)) {
            // order.form.endingDate = '';
          }
        } else if(order.form.endingDate.length < 10){
          // console.log('endingDate', order.form.endingDate);
          order.form.endingDate = '';

          // console.log('param', param);

          // if((order.form.endingDate).search('NaN') > -1) {
          //   var check_date = (order.form.endingDate).toString();
          //   if(check_date.length == 10) {
          //     order.form.endingDate = '';
          //   } else if(check_date == 'NaN/NaN/NaN') {
          //     order.form.endingDate = '';
          //   }
          // }
        }
      }
      if(event){
        var pastedText=''
        if(event){
          var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
          pastedText = clipboardData.getData('text');
          order.form.endingDate = pastedText;
          order.form.endDate = pastedText;
          $scope.dataToSave.end_of_validity = formatDateToISO(order.form.endingDate);
        }
      }
      // VALIDACIÓN DE POLIZAS MENORES A UN AÑO
      var date1 = new Date($scope.dataToSave.start_of_validity);
      var date2 = new Date($scope.dataToSave.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      if(!$scope.read_pdf){
        if(order.form.policy_days_duration < 365) {
          order.form.payment = 5;
        }
      }
      // console.log(diffDays);
      $scope.calcularDias();

    };
    $scope.checkDateValues = function (values,event) {
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
      if(event){
        var pastedText=''
        if(event){
          var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
          pastedText = clipboardData.getData('text');
          order.form.endingDate = pastedText;
          order.form.endDate = pastedText;
        }
      }
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
    order.options = {
        checkDate: function(param,event) {
          var pastedText=''
          if(event){
            var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
            pastedText = clipboardData.getData('text');
          }
          if(param){
            var date = (new Date());
            order.form.endingDate = new Date(date.setYear(date.getFullYear() + 1));
            
            if(order.form.aseguradora){
              get_claves();
            }
            order.form.startDate = new Date();
            order.form.endingDate = convertDate(order.form.endingDate);

            try{
              $scope.order.form.startDate =  ($scope.read_pdf.data['fecha_inicio'])
              $scope.order.form.endingDate =  ($scope.read_pdf.data['fecha_fin'])
              order.form.startDate =  ($scope.read_pdf.data['fecha_inicio'])
              order.form.endingDate =  ($scope.read_pdf.data['fecha_fin'])
            }catch(f){
              console.log('xxxxxxxxxxxxx',f)
              $http.get(url.IP + 'get-vendors/')
              .then(function(user) {
                $scope.referenciadores = user.data;
                $scope.referenciadores.forEach(function(user) {
                  user.first_name = user.first_name.toUpperCase()
                  user.last_name = user.last_name.toUpperCase()
                  user['phones'] = [];
                  user['subramos'] = [];
                });
                $scope.referenciadores = [$scope.referenciador];
              });
            }
            $scope.dataToSave.start_of_validity = new Date();
            $scope.dataToSave.end_of_validity = formatDateToISO(order.form.endingDate);
            
            order.form.startDate = convertDate(order.form.startDate);
            if(isNaN(order.form.startDate) && $scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data.fecha_inicio){
              order.form.startDate =  ($scope.read_pdf.data['fecha_inicio'])
            }
            if($scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data.fecha_inicio){
              $scope.dataToSave.start_of_validity = new Date($scope.read_pdf.data['fecha_inicio']);
              $scope.dataToSave.end_of_validity = formatDateToISO($scope.read_pdf.data['fecha_fin']);
            }
          }
          if(pastedText){
            order.form.startDate = pastedText
          }
          // else{
          //   SweetAlert.swal("ERROR", MESSAGES.ERROR.RECEIPTSREQUIRED, "error");
          // }
          if(order.form.startDate.length == 10) {
            var x = mesDiaAnio(order.form.startDate);
            // console.log('ok', x);

            var date = (new Date(x));
            // order.form.endingDate = x;
            order.form.endingDate = new Date(date.setYear(date.getFullYear() + 1));
            
            if(order.form.aseguradora){
              get_claves();
            }
            //--------------------------- ok
            order.form.startDate = new Date(x);
            order.form.endingDate = convertDate(order.form.endingDate);
            $scope.dataToSave.start_of_validity = new Date(x);
            $scope.dataToSave.end_of_validity = formatDateToISO(order.form.endingDate);

            order.form.startDate = convertDate(order.form.startDate);
            // console.log('AQUI', order.form.startDate, $scope.dataToSave.end_of_validity, $scope.dataToSave.start_of_validity);

            //order.receipts = [];
            //order.recibos_poliza = [];

            // order.form.startDate = convertDate(order.form.startDate);
            // order.form.endingDate = convertDate(order.form.endingDate); 
          }
          

          var date1 = new Date($scope.dataToSave.start_of_validity);
          var date2 = new Date($scope.dataToSave.end_of_validity);

          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
          if(order.form.policy_days_duration < 365) {
            order.form.payment = 5;
          } else {
            // order.form.payment = '';
          }     
        },
        showPoliceCreator: function() {
            // if (order.defaults.showReceipts === false) {
            //     return true;
            // }
            // return false;

            if(order.receipts.length) {
              return true;
            } else {
              return false;
            }

        },
        hideTabs: function(param) {

            order.show.firstTab = param ? true : false;
        },
        changeAddress: function(address){
          order.form.address = address;
        },
        // CHANGE OPTIONS END

        deleteCoverage: function(obj, index) {
          $scope.eliminadoManualCobertura=true;
          order.defaults.coverages.splice(index, 1);
          if($scope.read_pdf && $scope.read_pdf.data){
            console.log('fue por lectura se pierde si la borra')
          }else{
            order.defaults.coverageInPackage = "";
            order.defaults.coverageList.push(obj);
          }
        },
        addCoverage: function(obj,index) {
            var delCoverage = false;
            if (order.defaults.coverages.length == 0) {
                delCoverage = true;
            }
            if($scope.read_pdf && $scope.read_pdf.data){
              console.log('fue por lectura se pierde si la borra')
            }else{
              for (var i = order.defaults.coverages.length - 1; i >= 0; i--) {
                  if (order && order.defaults && order.defaults.coverages && order.defaults.coverages[i] && obj && obj.coverage_name && (order.defaults.coverages[i].coverage_name === obj.coverage_name)) {
                      SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGEALREADYEXIST, "error")
                      // toaster.info('Ya existe esta cobertura.');
                      order.defaults.coverageList.forEach(function(coverage) {
                        if (coverage.coverage_name == obj.coverage_name){
                          order.defaults.coverageList.splice(order.defaults.coverageList.indexOf(coverage), 1);
                        }
                      })
                      return;
                  } else {
                      delCoverage = true;
                  }
              };
            }

            if (delCoverage) {
                order.defaults.coverages.push(obj);
                order.defaults.coverageList.forEach(function(coverage) {
                  if (coverage.coverage_name == obj.coverage_name){
                    order.defaults.coverageList.splice(order.defaults.coverageList.indexOf(coverage), 1);
                  }
                })
                // order.defaults.coverageList.splice(order.defaults.coverageList.indexOf(obj), 1);
                // order.defaults.coverageList.splice(obj., 1);
            };
            order.defaults.coverageInPackage = "";
            // order.defaults.coverageList.splice(index, 1);
        },
        changeClave: function(parClave) {
          // if($scope.readPDF && $scope.read_pdf && parClave){
          //   $scope.readPDF = {}
          //   $scope.read_pdf={}
          // }
          order.defaults.comisiones = [];
          $scope.dataToSave.clave = parClave.id;
          order.form.clave = parClave
          if(order.form.subramo){
            $scope.changeSubramo();
          }
        },
        life: {
            beneficiary: {
                add: function() {
                    // var beneficiary = angular.copy(order.subforms.life.beneficiaries);
                    // if (helpers.beneficiariesPercentageGreaterThanZero(order.subforms.life.beneficiariesList)) {
                        // SweetAlert.swal("Error", MESSAGES.ERROR.GREATERTHAN100, "error")
                        // toaster.info('No puede tener un porcentaje mayor a 100%.');
                        // return
                    // } else {
                        order.subforms.life.beneficiariesList.push(models.beneficiary());
                    // }
                },
                destroy: function(index) {
                    order.subforms.life.beneficiariesList.splice(index, 1);
                }
            },
            asegurados: {
                add: function() {
                  order.subforms.life.aseguradosList.push(models.asegurados());

                  var lista2=order.subforms.life.aseguradosList || [];
                  // if($scope.read_pdf && $scope.read_pdf.data && order.subforms.life.aseguradosList && order.subforms.life.aseguradosList.length !=1){
                  //   order.subforms.life.aseguradosList = lista2.filter(function (item) {
                  //     return !isEmptyAsegurado(item);
                  //   });
                  // }
                },
                destroy: function(index) {
                  order.subforms.life.aseguradosList.splice(index, 1);
                },
                fillContractorData: function() {
                  if(!order.form.contratante.value){
                    SweetAlert.swal("Error", MESSAGES.ERROR.CONTRACTORERROR, "error")
                    return;
                  }
                  else{
                    var contractor_ = order.form.contratante.value;
                    if(order.form.contratante.value.type_person != 'Física' && order.form.contratante.value.type_person != 1){
                      SweetAlert.swal("Error", MESSAGES.INFO.CONTRACTORTYPEPERSON, "error")
                      return;
                    }
                    else{
                      order.subforms.life.aseguradosList[0].first_name = contractor_.first_name;
                      order.subforms.life.aseguradosList[0].last_name=contractor_.last_name;
                      order.subforms.life.aseguradosList[0].second_last_name = contractor_.second_last_name;
                      order.subforms.life.aseguradosList[0].birthdate = convertDate(contractor_.birth_date);    
                      order.subforms.life.aseguradosList[0].antiguedad = null;    
                      order.subforms.life.aseguradosList[0].sex = contractor_.sex;
                      order.subforms.life.aseguradosList[0].smoker = false;
                    }
                  }
                },
            },
        },
        disease: {
          fillContractorData: function() {
            if(!order.form.contratante.value){
              SweetAlert.swal("Error", MESSAGES.ERROR.CONTRACTORERROR, "error")
              return;
            }
            else{
              var contractor_ = order.form.contratante.value;
              if(order.form.contratante.value.type_person != 'Física' && order.form.contratante.value.type_person != 1){
                SweetAlert.swal("Error", MESSAGES.INFO.CONTRACTORTYPEPERSON, "error")
                return;
              }
              else{
                order.subforms.disease.first_name = contractor_.first_name;
                order.subforms.disease.last_name=contractor_.last_name;
                order.subforms.disease.second_last_name = contractor_.second_last_name;
                order.subforms.disease.birthdate = convertDate(contractor_.birth_date);    
                order.subforms.disease.antiguedad = null;    
                order.subforms.disease.sex = contractor_.sex;
              }
            }
          },
          checkDate: function(val, param,t,event,ind) {
            var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
            var pastedText = clipboardData.getData('text');
            if (t==1) {
              order.subforms.disease.birthdate=datesFactory.convertDate(datesFactory.toDate(pastedText))
            }else if(t==2){
              order.subforms.disease.antiguedad=datesFactory.convertDate(datesFactory.toDate(pastedText))
            }
          },
          relationships: {
                add: function(rel) {
                    var relacion = angular.copy(models.relationships());
                    order.hidden = false;
                    order.subforms.disease.relationshipList.push(relacion);
                },
                destroy: function(index, rel) {
                    order.subforms.disease.relationshipList.splice(index, 1);

                },
                checkDate: function(val, param,t,event,ind) {
                  var clipboardData = event.originalEvent.clipboardData || window.clipboardData;
                  var pastedText = clipboardData.getData('text');
                  if (t==1) {
                    order.subforms.disease.birthdate=datesFactory.convertDate(datesFactory.toDate(pastedText))
                  }else if(t==2){
                    order.subforms.disease.antiguedad=datesFactory.convertDate(datesFactory.toDate(pastedText))
                  }else if(t==3){
                    order.subforms.disease.relationshipList[ind].birthdate=datesFactory.convertDate(datesFactory.toDate(pastedText))
                  }else if(t==4){
                    order.subforms.disease.relationshipList[ind].antiguedad=datesFactory.convertDate(datesFactory.toDate(pastedText))
                  }
                },
                selectType: function(newValue, old) {
                    var oldValue = old != "" ? JSON.parse(old) : null;
                    var newIndex = -1;
                    order.options.disease.types.some(function(valueData, index) {
                        if (valueData.relationship == newValue.relationship) {
                            newIndex = index;
                            return true;
                        }
                    });
                    var oldIndex = -1;


                    if (newValue.relationship == 1 || newValue.relationship == 2) { // titular y conyugue
                        order.options.disease.types[newIndex].disabled = true
                    }

                    if (oldValue) {

                        order.options.disease.types.some(function(val, index) {
                            if (val.relationship == oldValue.relationship) {
                                oldIndex = index;
                                return true;
                            }
                        });

                        if (oldValue.relationship == 1 || oldValue.relationship == 2) { // titular y conyugue
                            order.options.disease.types[oldIndex].disabled = false
                        }
                    }
                }
          },
            // 1-Titular, 2-Conyuge, 3-Hijo
            types: angular.copy(tiposBeneficiarios)
        }

    };
    // --------------lectura pdf--------------***********
    function addYearsSafeLocal(d, years) {
      var copy = new Date(d.getTime());
      copy.setFullYear(copy.getFullYear() + years);
      return copy;
    }

    function buildLocalDateFromDMY(dateStr, hourLocal) {
      var parts = String(dateStr).split('/');
      var day = parseInt(parts[0], 10);
      var month = parseInt(parts[1], 10);
      var year = parseInt(parts[2], 10);

      if (!day || !month || !year) return null;

      // ✅ Fecha en horario LOCAL (México si el navegador está en México)
      return new Date(year, month - 1, day, hourLocal, 0, 0, 0);
    }

    function formatDateToISO(dateStr, tipo) {
      // horas locales por tipo (igual que tu intención)
      var hourLocal = (tipo == 1) ? 8 : (tipo == 2) ? 17 : 7;

      var date;

      // ✅ Fallback si no viene dateStr
      if (!dateStr) {
        var base = new Date(); // hoy local
        var base2 = (tipo == 2) ? addYearsSafeLocal(base, 1) : base;

        date = new Date(
          base2.getFullYear(),
          base2.getMonth(),
          base2.getDate(),
          hourLocal, 0, 0, 0
        );

        return date.toISOString();
      }

      // ✅ Parse normal DD/MM/YYYY
      date = buildLocalDateFromDMY(dateStr, hourLocal);

      // Si no parsea, cae al fallback
      if (!date || isNaN(date.getTime())) {
        return formatDateToISO(null, tipo);
      }

      return date.toISOString();
    }

    // function formatDateToISO(dateStr, tipo) {
    //   if(dateStr){
    //     var parts = dateStr.split('/');
    //     var day = parts[0];
    //     var month = parts[1];
    //     var year = parts[2];
    //     var date;
    //     // ⏰ Medianoche por defecto
    //     date = new Date(year + '-' + month + '-' + day + 'T07:00:00Z');
    //     if (tipo == 1) {
    //       // 🕗 8:00 AM UTC
    //       date = new Date(year + '-' + month + '-' + day + 'T08:00:00Z');
    //     }
    //     if (tipo == 2) {
    //       // 🕙 10:00 PM UTC
    //       date = new Date(year + '-' + month + '-' + day + 'T17:00:00Z');
    //     } 
    //     return date.toISOString();
    //   }
    // }
    $scope.showImgPrimas=false;
    $scope.cargarInformacion=function(data){
      try{
        if ($localStorage.imgSerieSrc) {
          $scope.imgSerieSrc = $sce.trustAsResourceUrl($localStorage.imgSerieSrc);
        }
        if ($localStorage.imgPrimasSrc) {
          $scope.imgPrimasSrc = $sce.trustAsResourceUrl($localStorage.imgPrimasSrc);
        }
      } catch(u){
        console.log('uu erorr image',u)
      }  
      $scope.read_pdf = data;
      $scope.serieDetectada = $scope.serieDetectada ? $scope.serieDetectada :$localStorage.serieDetectada ? $localStorage.serieDetectada : '';
      order.form.identifier=' '
      if ($scope.read_pdf && $scope.read_pdf.data && 'Numero de poliza' in $scope.read_pdf.data && $scope.read_pdf.data['Numero de poliza']){
        if ($scope.read_pdf && $scope.read_pdf.data && 'Numero de poliza' in $scope.read_pdf.data && $scope.read_pdf.data['Numero de poliza']){
          order.form.poliza = $scope.read_pdf.data['Numero de poliza'];
        }
        if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] &&  $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='NACIONAL'){
          $scope.order.f_currency.f_currency_selected = 1;
          order.f_currency.f_currency_selected = 1;
        }
        if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] &&  ($scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='Dolares' || ($scope.read_pdf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='dolares')){
          $scope.order.f_currency.f_currency_selected = 2;
          order.f_currency.f_currency_selected = 2;
        }
        if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] && !$scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='EXTRANJERA'){
          order.f_currency.f_currency_selected = 2;
          $scope.order.f_currency.f_currency_selected = 2;
        }                
        if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] && ($scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='udi' || ($scope.read_pdf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='udis')){
          $scope.order.f_currency.f_currency_selected = 3;
          order.f_currency.f_currency_selected = 3;
        }
        order.conducto_de_pago.conducto_de_pago_selected =1;  
        $scope.pintarCoberturas=true;

        order.form.payment = $scope.read_pdf.data['Datos generales de la poliza']['Forma de pago'];
        if(!order.form.payment){
          try{
            order.form.payment = $scope.read_pdf.data['Primas']['Forma_de_Pago'];          
          }catch(idx){}
        }
        if (order && order.form) {
          var p = Number(order.form.payment); // por si viene "15" string

          if ([15, 7, 14].indexOf(p) !== -1) {
            order.form.payment = 12; // ✅ reset a anual

            SweetAlert.swal(
              "Advertencia",
              "La forma de pago detectada (" + p + ") no aplica en este formato. Se ajustó a ANUAL (12). Verifica tu archivo o selecciona la forma de pago correcta.",
              "warning"
            );
          }
        }
        $scope.activeJustified=1;
        order.show.ot = false;
        order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
        order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
        try{
          $scope.order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
          $scope.order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
          order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
          order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
        }catch(f){

        }
        order.form.endDate =  $scope.read_pdf.data['fecha_fin']
        order.form.start_of_validity= new Date($scope.read_pdf.data['fecha_inicio'])
        order.form.end_of_validity = new Date($scope.read_pdf.data['fecha_fin'])

        $scope.dataToSave.start_of_validity = (mesDiaAnio(datesFactory.convertDate(order.form.startDate)));
        $scope.dataToSave.end_of_validity = mesDiaAnio(datesFactory.convertDate(order.form.endingDate));
        if(isNaN($scope.dataToSave.start_of_validity) || !$scope.dataToSave.start_of_validity) {
          $scope.dataToSave.start_of_validity = formatDateToISO(order.form.startDate,1);
          $scope.dataToSave.end_of_validity = formatDateToISO(order.form.endingDate,2);
        }
        var date1 = new Date($scope.dataToSave.start_of_validity);
        var date2 = new Date($scope.dataToSave.end_of_validity);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        if ($scope.read_pdf.data['Datos del vehiculo']){
          order.subforms.auto.brand = $scope.read_pdf.data['Datos del vehiculo']['marca'];
          order.subforms.auto.model = $scope.read_pdf.data['Datos del vehiculo']['modelo'];
          if ('anio' in $scope.read_pdf.data['Datos del vehiculo']){
            order.subforms.auto.year = $scope.read_pdf.data['Datos del vehiculo']['anio'];
          }else if('modelo' in $scope.read_pdf.data['Datos del vehiculo']){
            order.subforms.auto.year = $scope.read_pdf.data['Datos del vehiculo']['modelo'];
          }
          order.subforms.auto.engine = $scope.read_pdf.data['Datos del vehiculo']['motor'];
          order.subforms.auto.serial = $scope.read_pdf.data['Datos del vehiculo']['serie'];
          $scope.serieAGuardar=order.subforms.auto.serial;
          if(order.subforms.auto.serial){
            $scope.checkNumSerie();
          }
          $scope.paqueteOriginal = $scope.read_pdf.data.cobertura;
          order.subforms.auto.driver = $scope.read_pdf.data['Datos del vehiculo']['driver'];
          // order.subforms.auto.license_plates = $scope.read_pdf.data['Datos del vehiculo']['clave_vehicular'];
          order.subforms.auto.license_plates = $scope.read_pdf.data['Datos del vehiculo']['placas'];
          var datosVehiculo = $scope.read_pdf.data['Datos del vehiculo'];

          order.subforms.auto.version = datosVehiculo.version 
              ? datosVehiculo.version 
              : (datosVehiculo.descripcion_vehiculo 
                  ? datosVehiculo.descripcion_vehiculo 
                  : datosVehiculo.clave_vehicular);
          order.subforms.auto.color = $scope.read_pdf.data['Datos del vehiculo']['color'];
          order.subforms.auto.service = $scope.read_pdf.data['Datos del vehiculo']['servicio'];
          if(order && order.subforms && order.subforms.auto && order.subforms.auto.service =='' || order.subforms.auto.service ==undefined || order.subforms.auto.service ==null){
            if($scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data['Datos del vehiculo']['uso']){
              if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 1){
                order.subforms.auto.service= "PARTICULAR";
              }else if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 2){
                order.subforms.auto.service= "CARGA";
              }else if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 3){
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
            order.subforms.auto.usage = parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']);
          } catch(err){}
          
          order.subforms.auto.state_circulation = ''
          // $scope.statesArray.forEach(function(item){
          //   if ($scope.read_pdf.data['contratante_domicilio']['Estado']) {
          //     if(sinDiacriticos($scope.read_pdf.data['contratante_domicilio']['Estado'].toLowerCase()) == sinDiacriticos(item.state.toLowerCase())){
          //       order.subforms.auto.state_circulation = item;
          //     }                      
          //   }else{
          //     $scope.read_pdf.data['contratante_domicilio']['Estado'] = ''
          //   }
          // });
          // $scope.saveLocalstorange();               
          order.subforms.auto.policy_type = {'id':1,'name':'Automóvil'};
          order.subforms.auto.procedencia = {'id':1,'name':'Residente'}
          order.form.from_pdf = true;
          // $scope.saveLocalstorange();
        }
        // if ($scope.read_pdf.data.data.life_policy){
        //   order.subforms.life.aseguradosList = [$scope.read_pdf.data.data.life_policy.personal];
        //   order.subforms.life.beneficiariesList = [$scope.read_pdf.data.data.life_policy.beneficiaries_life]
        //   order.subforms.life.beneficiariesList = order.subforms.life.beneficiariesList.map(function(item){
        //     item = item[0];
        //     item['person'] = 1;
        //     item['percentage'] = item['percentage'] ? parseFloat(item['percentage']) : 0;
        //     return item
        //   })
        // }

        // if ($scope.read_pdf.data.data.accidents_policy){
        //   order.subforms.disease.first_name = [$scope.read_pdf.data.data.accidents_policy.disease_type.first_name];
        //   order.subforms.disease.last_name = [$scope.read_pdf.data.data.accidents_policy.disease_type.last_name];
        //   order.subforms.disease.second_last_name = [$scope.read_pdf.data.data.accidents_policy.disease_type.second_last_name];
        //   order.subforms.disease.birthdate = [$scope.read_pdf.data.data.accidents_policy.disease_type.birthdate];
        //   $scope.sex.forEach(function(item){
        //     if(item.value == $scope.read_pdf.data.data.accidents_policy.disease_type.sex){
        //       order.subforms.disease.sex = item.value;
        //     }
        //   })
        //   order.subforms.disease.antiguedad = [$scope.read_pdf.data.data.accidents_policy.disease_type.antiguedad];
        //   order.subforms.disease.relationship_accident = [$scope.read_pdf.data.data.life_policy.relationship_accident]
        //   order.subforms.disease.relationship_accident = order.subforms.disease.relationship_accident.map(function(item){
        //     item = item[0];
        //     item['person'] = 1;
        //     item['percentage'] = item['percentage'] ? parseFloat(item['percentage']) : 0;
        //     return item
        //   })
        
        // }
        $rootScope.order = order;
        // if(($scope.read_pdf.data['Datos del asegurado']['propietario_contratante'].indexOf("S.A. DE") > -1)){
        //   $scope.read_pdf_contractor.type = false;
        //   $scope.read_pdf_contractor.name =$scope.read_pdf.data['Datos del asegurado']['propietario_contratante'];
        // }else{
        //   $scope.read_pdf_contractor.type = true;
        //   $scope.read_pdf_contractor.name = $scope.read_pdf.data['Datos del asegurado']['propietario_contratante']
          
        // }
        if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Prima neta']) {
          $rootScope.order.form.primaNeta = $scope.read_pdf.data['Primas']['Prima neta'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Prima neta'])) : 0;
          order.form = $rootScope.order.form;
          $rootScope.order = order;
        }
        if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Prima total']) {
          $rootScope.order.form.primaTotal = $scope.read_pdf.data['Primas']['Prima total'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Prima total'])): $scope.read_pdf.data['Primas']['IMPORTE TOTAL'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['IMPORTE TOTAL']))  : 0;
          $rootScope.order.form.subTotal = $scope.read_pdf.data['Primas']['Subtotal'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Subtotal'])): 0;
          order.form = $rootScope.order.form;
          $rootScope.order = order;
        }
        if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Gastos de expedición']) {
          try{
            $rootScope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos de expedición'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos de expedición'])) : 0;
            order.form = $rootScope.order.form;
            $rootScope.order = order;
          }catch(o){
            $rootScope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos de expedici\u00f3n'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos de expedici\u00f3n'])) : 0;
            order.form = $rootScope.order.form;
            $rootScope.order = order;
          }
        }
        if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Gastos por Expedición.']) {
          try{
            $rootScope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos por Expedición.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos por Expedición.'])) : 0;
            order.form = $rootScope.order.form;
            $rootScope.order = order;
          }catch(o){
            $rootScope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos por Expedici\u00f3n'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos por Expedici\u00f3n'])) : 0;
            order.form = $rootScope.order.form;
            $rootScope.order = order;
          }
        }
        if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Derecho de Póliza']) {
          $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Derecho de Póliza'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Derecho de Póliza'])) : 0;
          $localStorage['primas'] = $scope.order.form;
        } 
        if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Financiamiento por pago fraccionado']) {
          $rootScope.order.form.rpf = $scope.read_pdf.data['Primas']['Financiamiento por pago fraccionado'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Financiamiento por pago fraccionado'])) : 0;
          order.form = $rootScope.order.form;
          $rootScope.order = order;
        }       
        if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['IVA']) {
          $scope.order.form.iva = $scope.read_pdf.data['Primas']['IVA'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['IVA'])) : 0;
          order.form.iva = $scope.read_pdf.data['Primas']['IVA'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['IVA'])) : 0;
          $localStorage['primas'] = $scope.order.form;
        }
        if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['I.V.A.']) {
          $scope.order.form.iva = $scope.read_pdf.data['Primas']['I.V.A.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['I.V.A.'])) : 0;
          order.form.iva = $scope.read_pdf.data['Primas']['I.V.A.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['I.V.A.'])) : 0;
          $localStorage['primas'] = $scope.order.form;
        }
        if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Descuento']) {
          var valor = parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Descuento'])) || 0;
          // Si el valor es negativo → convertirlo a positivo multiplicando por -1
          if (valor < 0) {
              valor = valor * -1;
          }
          $scope.order.form.descuento = valor;
          $localStorage['primas'] = $scope.order.form;
        }else{
          $scope.order.form.descuento = 0;
        }
        if('primas' in $localStorage && $localStorage['primas']){
          order.form.primaNeta =  parseFloat($localStorage['primas']['primaNeta'] ? $localStorage['primas']['primaNeta'] : 0)
          order.form.derecho =  parseFloat($localStorage['primas']['derecho'] ? $localStorage['primas']['derecho'] : 0)
          order.form.rpf =  parseFloat($localStorage['primas']['rpf'] ? $localStorage['primas']['rpf'] : 0)
          order.form.descuento =  parseFloat($localStorage['primas']['descuento'] ? $localStorage['primas']['descuento'] : 0)
          order.form.primaTotal =  parseFloat($localStorage['primas']['prima_total'] ? $localStorage['primas']['primaTotal'] : parseFloat($localStorage['primas']['IMPORTE TOTAL'] ? $localStorage['primas']['IMPORTE TOTAL'] : 0))
          order.form.subTotal =  parseFloat($localStorage['primas']['Subtotal'] ? $localStorage['primas']['Subtotal'] : 0)
        } 
        // $scope.checkEndDate()
        if($scope.read_pdf.data['ramo']){
          $scope.ramoPdf = $scope.read_pdf.data['ramo'];
        }else{
          $scope.ramoPdf = ''
          $scope.contratante = {}
        }
        order.form.from_pdf = true  
        $rootScope.order=order;  
        var aseguradora_a_capturar = sinDiacriticos($scope.read_pdf.data['aseguradora'].toLowerCase())
        order.defaults.providers.some(function(x) {
          if(aseguradora_a_capturar =='chubb'){
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='CHUBB' || sinDiacriticos(x.alias).toLowerCase() == 'Aba' || sinDiacriticos(x.alias).toLowerCase() =='ABA' || sinDiacriticos(x.alias).toLowerCase() =='chubb seguros mexico') {
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
          if(aseguradora_a_capturar =='qualitas'){
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='Quálitas' || sinDiacriticos(x.alias).toLowerCase() =='Qualitas' || sinDiacriticos(x.alias).toLowerCase() == 'QUALITAS' || sinDiacriticos(x.alias).toLowerCase() =='QUÁLITAS') {
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
          if(aseguradora_a_capturar =='gnp'){
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='gnp' || sinDiacriticos(x.alias).toLowerCase() =='gnp seguros' || sinDiacriticos(x.alias).toLowerCase() == 'grupo nacional provincial' || sinDiacriticos(x.alias).toLowerCase() =='grupo nacional provincial ') {
              order.form.aseguradora = x;
              var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']
              get_claves_pdf(x,cl)
              return true;
            }
          }
          if(aseguradora_a_capturar =='axa'){
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='axa' || sinDiacriticos(x.alias).toLowerCase() =='axa seguros') {
              order.form.aseguradora = x;
              var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']
              get_claves_pdf(x,cl)
              return true;
            }
          }
          if(aseguradora_a_capturar =='hdi'){
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='axa' || sinDiacriticos(x.alias).toLowerCase() =='HDI') {
              order.form.aseguradora = x;
              var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']
              get_claves_pdf(x,cl)
              return true;
            }
          }
          if(aseguradora_a_capturar =='primero seguros'){
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='Primero Seguros' || sinDiacriticos(x.alias).toLowerCase() =='Pimero seguros') {
              order.form.aseguradora = x;
              var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']
              get_claves_pdf(x,cl)
              return true;
            }
          }
          if(aseguradora_a_capturar =='ana'){
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='ana' || sinDiacriticos(x.alias).toLowerCase() =='ana seguros' || sinDiacriticos(x.alias).toLowerCase() =='ana compania de seguros ') {
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
          if((aseguradora_a_capturar).toLowerCase() =='momento'){
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='momento' ) {
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
          if(aseguradora_a_capturar =='afirme'){
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros afirme' ) {
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
          if(aseguradora_a_capturar =='seguros monterrey' || aseguradora_a_capturar=='seguros monterrey new york life'){
            aseguradora_a_capturar='seguros monterrey new york life';
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros monterrey new york life' ) {
              order.form.aseguradora = x;
              var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']
              
              get_claves_pdf(x,cl)
              return true;
            }
          }
          if(aseguradora_a_capturar =='seguros bx+' || aseguradora_a_capturar=='bx+'  || aseguradora_a_capturar=='Seguros Bx+'){
            aseguradora_a_capturar='bx+';
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='seguros ve por mas' || sinDiacriticos(x.alias).toLowerCase() =='bx+' || sinDiacriticos(x.alias).toLowerCase() =='seguros bx+' || sinDiacriticos(x.alias).toLowerCase() =='grupo financiero ve por mas' || sinDiacriticos(x.alias).toLowerCase() =='grupo financiero ve por mas ') {
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
          if(aseguradora_a_capturar =='Metlife' || aseguradora_a_capturar=='metlife'){
            aseguradora_a_capturar='metlife';
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='met life' || sinDiacriticos(x.alias).toLowerCase() =='metlife') {
              order.form.aseguradora = x;
              var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']
              
              get_claves_pdf(x,cl)
              return true;
            }
          }
          if(aseguradora_a_capturar =='PlanSeguro' || aseguradora_a_capturar=='planseguro' || aseguradora_a_capturar=='plan seguro'){
            aseguradora_a_capturar='plan seguro';
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='plan seguros' || sinDiacriticos(x.alias).toLowerCase() =='plan de seguro cía de seguros' || sinDiacriticos(x.alias).toLowerCase() =='plan seguro' || sinDiacriticos(x.alias).toLowerCase() =='plan seguro ') {
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
          if(aseguradora_a_capturar =='Bupa' || aseguradora_a_capturar=='bupa'){
            aseguradora_a_capturar='bupa';
            if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase()=='bupa' || sinDiacriticos(x.alias).toLowerCase() =='bupa seguros' || sinDiacriticos(x.alias).toLowerCase() =='seguros bupa' || sinDiacriticos(x.alias).toLowerCase() =='bupa mexico' || sinDiacriticos(x.alias).toLowerCase() =='bupa ') {
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
          return false;
        });      
      }else{
        order.form.from_pdf = false;
        order.form.identifier=''
      }
    }
    $scope.$watch('order.form.startDate', function(newValue, oldValue) {
      try{
        if($scope.read_pdf && $scope.read_pdf.startDate ==order.form.startDate){
          order.form.from_pdf = true;
          order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
          order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
          try{
            $scope.order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
            $scope.order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
            order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
            order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
          }catch(f){

          }
          order.form.endDate =  $scope.read_pdf.data['fecha_fin']
          order.form.start_of_validity= new Date($scope.read_pdf.data['fecha_inicio'])
          order.form.end_of_validity = new Date($scope.read_pdf.data['fecha_fin'])

          $scope.dataToSave.start_of_validity = (mesDiaAnio(datesFactory.convertDate(order.form.startDate)));
          $scope.dataToSave.end_of_validity = mesDiaAnio(datesFactory.convertDate(order.form.endingDate));
          if(isNaN($scope.dataToSave.start_of_validity) || !$scope.dataToSave.start_of_validity) {
            $scope.dataToSave.start_of_validity = formatDateToISO(order.form.startDate,1);
            $scope.dataToSave.end_of_validity = formatDateToISO(order.form.endingDate,2);
          }
          var date1 = new Date($scope.dataToSave.start_of_validity);
          var date2 = new Date($scope.dataToSave.end_of_validity);
          var timeDiff = Math.abs(date2.getTime() - date1.getTime());
          order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
          if('primas' in $localStorage && $localStorage['primas']){
            order.form.primaNeta =  $localStorage['primas']['primaNeta']
            order.form.derecho =  $localStorage['primas']['derecho']
            order.form.rpf =  $localStorage['primas']['rpf']
            order.form.primaTotal =  $localStorage['primas']['primaTotal']
            order.form.subTotal =  $localStorage['primas']['subTotal']
            $rootScope.order.form =order.form;
          } 
        }
      }
      catch(e){
        order.form.from_pdf = false;
        order.form.identifier=''
      }
    });
    // $scope.$watch('order.form', function(newValue, oldValue) {
    //   try{
    //     if($scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data['cobertura'] && (!order.form.paquete || order.form.paquete==null || order.form.paquete==undefined) && order.form.aseguradora && order.form.clave==undefined){
    //       order.show.ot = false;
    //       try{
    //         get_claves_pdf(order.form.aseguradora,order.form.clave)
    //       }
    //       catch(e){
    //         console.log('errrrr x',e,order.form)
    //       }
    //     }
    //   }
    //   catch(e){
    //     console.log('errrrr paquete',e,order.form)
    //   }
    // });
    $scope.$watch('order.form', function(newValue, oldValue) {
      try {
        if ($scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data.cobertura &&
          (!order.form.paquete || order.form.paquete === null || order.form.paquete === undefined) &&
          order.form.aseguradora && order.form.clave === undefined) {
    
          order.show.ot = false;
    
          // Similarity function
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
    
          // Find best matching paquete
          var cobertura = $scope.read_pdf.data.cobertura;
          var highestScore = -1;
          var bestMatch = null;
    
          angular.forEach(order.defaults.packages, function(pkg) {
            var currentScore = similarity(cobertura, pkg.package_name);
            if (currentScore > highestScore) {
              highestScore = currentScore;
              bestMatch = pkg;
            }
          });
    
          // Set paquete if best match is found
          if (bestMatch) {
            order.form.paquete = bestMatch;
          }
    
          // Call your function after setting paquete
          try {
            get_claves_pdf(order.form.aseguradora, order.form.clave);
          } catch (e) {
            console.log('Error al obtener claves PDF:', e, order.form);
          }
        }
      } catch (e) {
        console.log('Error general paquete:', e, order.form);
      }
    });
    function llenarInfoGm(aseguradora,clave) {
      order.show.ot = false;
      $scope.activeJustified=1;
      order.show.ot = false;
      order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
      order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
      try{
        $scope.order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
        $scope.order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
        order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
        order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
      }catch(f){

      }
      order.form.endDate =  $scope.read_pdf.data['fecha_fin']
      order.form.start_of_validity= new Date($scope.read_pdf.data['fecha_inicio'])
      order.form.end_of_validity = new Date($scope.read_pdf.data['fecha_fin'])

      $scope.dataToSave.start_of_validity = (mesDiaAnio(order.form.startDate));
      $scope.dataToSave.end_of_validity = (mesDiaAnio(order.form.endingDate));
      var date1 = new Date($scope.dataToSave.start_of_validity);
      var date2 = new Date($scope.dataToSave.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      var date = new Date(order.form.startDate);
      if(isNaN(date)) {
        var date = new Date(mesDiaAnio(order.form.startDate));
      }
      if($scope.read_pdf.data['asegurados']){
        llenarAsegurados($scope.read_pdf.data['asegurados'])
      }
      $scope.paqueteOriginal=$scope.read_pdf.data.cobertura;
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
                      $scope.saveLocalstorange()
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
                            
                            $scope.cargandoPaquetes=true;
                            $http.post(url.IP+ 'paquetes-data-by-subramo/',
                              {'ramo': order.form.ramo.id, 'subramo':order.form.subramo.id,'provider':order.form.aseguradora.id })
                            .then(
                              function success (response) {
                                $scope.cargandoPaquetes=false;
                                order.defaults.packages = [];
                                $scope.paqueteSelected = false;
                                $scope.coberturasPackagePdf = []
                                // $scope.read_pdf.data.cobertura='PREMIER 200'
                                if(response.data.length) {
                                  order.defaults.packages = response.data;
                                  if($scope.read_pdf.data.cobertura=='' || $scope.read_pdf.data.cobertura==undefined){
                                    $scope.read_pdf.data.cobertura='PREMIER 200'
                                  }
                                  var best = null;
                                  var bestScore = -1;
                                  var target=$scope.read_pdf.data.cobertura;
                                  var encontardo_paquete=true;
                                  $scope.coberturasPackagePdf=[]
                                  var res   = pickBestPackageOriginal(order.defaults.packages, $scope.read_pdf.data.cobertura);
                                  var best  = res ? res.best  : null;
                                  var score = res ? res.score : null;
                                  var cobertura=$scope.read_pdf.data.cobertura
                                  console.log(res.best ,res.best.package_name);
                                  $scope.packages=order.defaults.packages;
                                  // ---------------
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
                                    order.form.paquete = $scope.paqueteSelectedObject;
                                    $scope.yaseestableciopaquete=true;
                                    $scope.dataToSave.paquete = order.form.paquete.id;   
                                    for (i in $scope.read_pdf.data['Primas y coberturas']) {
                                      if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                          $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                        }
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                          $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                        }
                                        var it ={}
                                        it['coverage_name'] = i
                                        it['url'] = slug(i) + '-' + (order.form.paquete .id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                        it['package'] = order.form.paquete .id
                                        it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                        it['deductible_coverage']=[{'deductible':0}]
                                        it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                        it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                        it['sums_coverage']=[{'sum_insured':0}]
                                        it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                          it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                        }
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                          it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
                                        }
                                        $scope.coberturasPackagePdf.push(it)
                                        order.defaults.coverages=$scope.coberturasPackagePdf
                                        $localStorage['defaults'] = order.defaults
                                        order.form.paquete = order.form.paquete ; 
                                      }
                                    }
                                    order.coverageInPolicy_policy = order.defaults.coverages;
                                    order.form.paquete = order.form.paquete ; 
                                    $scope.dataToSave.paquete = order.form.paquete.id;
                                    $scope.saveLocalstorange()
                                  }else{
                                    console.log('buscar',encontardo_paquete,best)
                                    order.defaults.packages.forEach(function(item){
                                      var s = scorePackage(item.package_name, target);
                                      if (s > bestScore) { bestScore = s; best = item; }
                                      if((item.package_name).toLowerCase() && $scope.read_pdf.data.cobertura.toLowerCase()){
                                        if (((item.package_name.toLowerCase() == $scope.read_pdf.data.cobertura.toLowerCase())
                                          || ( item.package_name.toLowerCase().includes($scope.read_pdf.data.cobertura.toLowerCase()))
                                          && !$scope.paqueteSelected) || best && $scope.yaseestableciopaquete==false){
                                          $scope.paqueteSelected = true;
                                          order.form.paquete = item;
                                          $scope.yaseestableciopaquete=true;
                                          $scope.dataToSave.paquete = order.form.paquete.id;                                        
                                          for (i in $scope.read_pdf.data['Primas y coberturas']) {

                                              if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                                  $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                                }
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                                  $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                                }
                                                var it ={}
                                                it['coverage_name'] = i
                                                it['url'] = slug(i) + '-' + (item.id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                                it['package'] = item.id
                                                it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                                it['deductible_coverage']=[{'deductible':0}]
                                                it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                                it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                                it['sums_coverage']=[{'sum_insured':0}]
                                                it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                                  it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                                }
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                                  it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
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
                                          $scope.saveLocalstorange()
                                        }
                                      }
                                    }) 
                                  }
                                  // var best = null;
                                  // var bestScore = -1;
                                  // var target=$scope.read_pdf.data.cobertura
                                  // $scope.coberturasPackagePdf=[]
                                  // order.defaults.packages.forEach(function(item){
                                  //   var s = scorePackage(item.package_name, target);
                                  //   if (s > bestScore) { bestScore = s; best = item; }
                                  //   if((item.package_name).toLowerCase() && $scope.read_pdf.data.cobertura.toLowerCase()){
                                  //     if (((item.package_name.toLowerCase() == $scope.read_pdf.data.cobertura.toLowerCase())
                                  //       || ( item.package_name.toLowerCase().includes($scope.read_pdf.data.cobertura.toLowerCase()))
                                  //       && !$scope.paqueteSelected) || best && $scope.yaseestableciopaquete==false){
                                  //       $scope.paqueteSelected = true;
                                  //       order.form.paquete = item;
                                  //       console.log('ddddddddddddd',best)
                                  //       $scope.yaseestableciopaquete=true;
                                  //       $scope.dataToSave.paquete = order.form.paquete.id;                                        
                                  //       for (i in $scope.read_pdf.data['Primas y coberturas']) {

                                  //           if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                  //               $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                  //             }
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                  //               $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                  //             }
                                  //             var it ={}
                                  //             it['coverage_name'] = i
                                  //             it['url'] = slug(i) + '-' + (item.id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                  //             it['package'] = item.id
                                  //             it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                  //             it['deductible_coverage']=[{'deductible':0}]
                                  //             it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                  //             it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                  //             it['sums_coverage']=[{'sum_insured':0}]
                                  //             it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                  //               it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                  //             }
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                  //               it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
                                  //             }
                                  //             $scope.coberturasPackagePdf.push(it)
                                  //             order.defaults.coverages=$scope.coberturasPackagePdf
                                  //             $localStorage['defaults'] = order.defaults
                                  //             order.form.paquete = item; 
                                  //         }
                                  //       }
                                  //       order.coverageInPolicy_policy = order.defaults.coverages;
                                  //       order.form.paquete = item; 
                                  //       $scope.dataToSave.paquete = order.form.paquete.id;
                                  //       // $scope.saveLocalstorange()
                                  //     }
                                  //   }
                                  // })
                                  $scope.changeSubramo()
                                  if ($localStorage) {
                                  }
                                }
                
                              },
                              function error (e) {
                                $scope.cargandoPaquetes=false;
                                console.log('Error - paquetes-data-by-subramo', e);
                                order.defaults.packages = [];
                              }
                            ).catch(function (error) {
                              $scope.cargandoPaquetes=false;
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
    function llenarInfoVida(aseguradora,clave) {
      order.show.ot = false;
      $scope.activeJustified=1;
      order.show.ot = false;
      order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
      order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
      try{
        $scope.order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
        $scope.order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
        order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
        order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
      }catch(f){

      }
      order.form.endDate =  $scope.read_pdf.data['fecha_fin']
      order.form.start_of_validity= new Date($scope.read_pdf.data['fecha_inicio'])
      order.form.end_of_validity = new Date($scope.read_pdf.data['fecha_fin'])

      $scope.dataToSave.start_of_validity = (mesDiaAnio(datesFactory.convertDate(order.form.startDate)));
      $scope.dataToSave.end_of_validity = mesDiaAnio(datesFactory.convertDate(order.form.endingDate));
      if(isNaN($scope.dataToSave.start_of_validity) || !$scope.dataToSave.start_of_validity) {
        $scope.dataToSave.start_of_validity = formatDateToISO(order.form.startDate,1);
        $scope.dataToSave.end_of_validity = formatDateToISO(order.form.endingDate,2);
      }
      var date1 = new Date($scope.dataToSave.start_of_validity);
      var date2 = new Date($scope.dataToSave.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
      var date = new Date(order.form.startDate);
      if(isNaN(date)) {
        var date = new Date(mesDiaAnio(order.form.startDate));
      }
      if($scope.read_pdf.data['asegurados'] || $scope.read_pdf.data['beneficiarios']){
        llenarAseguradosVida($scope.read_pdf.data['asegurados'],$scope.read_pdf.data['beneficiarios'])
      }
      $scope.paqueteOriginal=$scope.read_pdf.data.cobertura;
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

                    if(ramo.ramo_code == 1) {
                      order.form.ramo = ramo;
                      $scope.saveLocalstorange()
                      order.defaults.subramos = ramo.subramo_ramo;                          
                      order.defaults.subramos.forEach(function(sub) {
                          if(sub.subramo_code == 1 && $scope.ramoPdf=="vida") {
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
                            
                            $scope.cargandoPaquetes=true;
                            $http.post(url.IP+ 'paquetes-data-by-subramo/',
                              {'ramo': order.form.ramo.id, 'subramo':order.form.subramo.id,'provider':order.form.aseguradora.id })
                            .then(
                              function success (response) {
                                $scope.cargandoPaquetes=false;
                                order.defaults.packages = [];
                                $scope.paqueteSelected = false;
                                $scope.coberturasPackagePdf = []
                                // $scope.read_pdf.data.cobertura='PREMIER 200'
                                if(response.data.length) {
                                  order.defaults.packages = response.data;
                                  // $scope.read_pdf.data.cobertura = $scope.read_pdf.data.cobertura.split(" ");
                                  // $scope.read_pdf.data.cobertura = $scope.read_pdf.data.cobertura[0];
                                  if($scope.read_pdf.data.cobertura=='' || $scope.read_pdf.data.cobertura==undefined){
                                    $scope.read_pdf.data.cobertura='PREMIER 200'
                                  }
                                  var best = null;
                                  var bestScore = -1;
                                  var target=$scope.read_pdf.data.cobertura;
                                  var encontardo_paquete=true;
                                  $scope.coberturasPackagePdf=[]
                                  var res   = pickBestPackageOriginal(order.defaults.packages, $scope.read_pdf.data.cobertura);
                                  var best  = res ? res.best  : null;
                                  var score = res ? res.score : null;
                                  var cobertura=$scope.read_pdf.data.cobertura
                                  console.log(res.best ,res.best.package_name);
                                  $scope.packages=order.defaults.packages;
                                  // ---------------
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
                                    order.form.paquete = $scope.paqueteSelectedObject;
                                    $scope.yaseestableciopaquete=true;
                                    $scope.dataToSave.paquete = order.form.paquete.id;   
                                    for (i in $scope.read_pdf.data['Primas y coberturas']) {
                                      if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                          $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                        }
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                          $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                        }
                                        var it ={}
                                        it['coverage_name'] = i
                                        it['url'] = slug(i) + '-' + (order.form.paquete .id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                        it['package'] = order.form.paquete .id
                                        it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                        it['deductible_coverage']=[{'deductible':0}]
                                        it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                        it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                        it['sums_coverage']=[{'sum_insured':0}]
                                        it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                          it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                        }
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                          it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
                                        }
                                        $scope.coberturasPackagePdf.push(it)
                                        order.defaults.coverages=$scope.coberturasPackagePdf
                                        $localStorage['defaults'] = order.defaults
                                        order.form.paquete = order.form.paquete ; 
                                      }
                                    }
                                    order.coverageInPolicy_policy = order.defaults.coverages;
                                    order.form.paquete = order.form.paquete ; 
                                    $scope.dataToSave.paquete = order.form.paquete.id;
                                    $scope.saveLocalstorange()
                                  }else{
                                    order.defaults.packages.forEach(function(item){
                                      var s = scorePackage(item.package_name, target);
                                      if (s > bestScore) { bestScore = s; best = item; }
                                      if((item.package_name).toLowerCase() && $scope.read_pdf.data.cobertura.toLowerCase()){
                                        if (((item.package_name.toLowerCase() == $scope.read_pdf.data.cobertura.toLowerCase())
                                          || ( item.package_name.toLowerCase().includes($scope.read_pdf.data.cobertura.toLowerCase()))
                                          && !$scope.paqueteSelected) || best && $scope.yaseestableciopaquete==false){
                                          $scope.paqueteSelected = true;
                                          order.form.paquete = item;
                                          $scope.yaseestableciopaquete=true;
                                          $scope.dataToSave.paquete = order.form.paquete.id;                                        
                                          for (i in $scope.read_pdf.data['Primas y coberturas']) {

                                              if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                                  $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                                }
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                                  $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                                }
                                                var it ={}
                                                it['coverage_name'] = i
                                                it['url'] = slug(i) + '-' + (item.id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                                it['package'] = item.id
                                                it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                                it['deductible_coverage']=[{'deductible':0}]
                                                it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                                it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                                it['sums_coverage']=[{'sum_insured':0}]
                                                it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                                  it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                                }
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                                  it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
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
                                          $scope.saveLocalstorange()
                                        }
                                      }
                                    }) 
                                  }
                                  // var best = null;
                                  // var bestScore = -1;
                                  // var target=$scope.read_pdf.data.cobertura
                                  // $scope.coberturasPackagePdf=[]
                                  // order.defaults.packages.forEach(function(item){
                                  //   var s = scorePackage(item.package_name, target);
                                  //   if (s > bestScore) { bestScore = s; best = item; }
                                  //   if((item.package_name).toLowerCase() && $scope.read_pdf.data.cobertura.toLowerCase()){
                                  //     if (((item.package_name.toLowerCase() == $scope.read_pdf.data.cobertura.toLowerCase())
                                  //       || ( item.package_name.toLowerCase().includes($scope.read_pdf.data.cobertura.toLowerCase()))
                                  //       && !$scope.paqueteSelected) || best && $scope.yaseestableciopaquete==false){
                                  //       $scope.paqueteSelected = true;
                                  //       order.form.paquete = item;
                                  //       console.log('ddddddddddddd',best)
                                  //       $scope.yaseestableciopaquete=true;
                                  //       $scope.dataToSave.paquete = order.form.paquete.id;                                        
                                  //       for (i in $scope.read_pdf.data['Primas y coberturas']) {

                                  //           if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                  //               $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                  //             }
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                  //               $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                  //             }
                                  //             var it ={}
                                  //             it['coverage_name'] = i
                                  //             it['url'] = slug(i) + '-' + (item.id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                  //             it['package'] = item.id
                                  //             it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                  //             it['deductible_coverage']=[{'deductible':0}]
                                  //             it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                  //             it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                  //             it['sums_coverage']=[{'sum_insured':0}]
                                  //             it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                  //               it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                  //             }
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                  //               it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
                                  //             }
                                  //             $scope.coberturasPackagePdf.push(it)
                                  //             order.defaults.coverages=$scope.coberturasPackagePdf
                                  //             $localStorage['defaults'] = order.defaults
                                  //             order.form.paquete = item; 
                                  //         }
                                  //       }
                                  //       order.coverageInPolicy_policy = order.defaults.coverages;
                                  //       order.form.paquete = item; 
                                  //       $scope.dataToSave.paquete = order.form.paquete.id;
                                  //       // $scope.saveLocalstorange()
                                  //     }
                                  //   }
                                  // })
                                  $scope.changeSubramo()
                                  if ($localStorage) {
                                  }
                                }
                
                              },
                              function error (e) {
                                $scope.cargandoPaquetes=false;
                                console.log('Error - paquetes-data-by-subramo', e);
                                order.defaults.packages = [];
                              }
                            ).catch(function (error) {
                              $scope.cargandoPaquetes=false;
                              console.log('Error - paquetes-data-by-subramo - catch', error);
                              order.defaults.packages = [];
                            });
                          
                          }
                          if(sub.subramo_code == 30 && $scope.ramoPdf=="funerarios") {
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
                            
                            $scope.cargandoPaquetes=true;
                            $http.post(url.IP+ 'paquetes-data-by-subramo/',
                              {'ramo': order.form.ramo.id, 'subramo':order.form.subramo.id,'provider':order.form.aseguradora.id })
                            .then(
                              function success (response) {
                                $scope.cargandoPaquetes=false;
                                order.defaults.packages = [];
                                $scope.paqueteSelected = false;
                                $scope.coberturasPackagePdf = []
                                // $scope.read_pdf.data.cobertura='PREMIER 200'
                                if(response.data.length) {
                                  order.defaults.packages = response.data;
                                  // $scope.read_pdf.data.cobertura = $scope.read_pdf.data.cobertura.split(" ");
                                  // $scope.read_pdf.data.cobertura = $scope.read_pdf.data.cobertura[0];
                                  if($scope.read_pdf.data.cobertura=='' || $scope.read_pdf.data.cobertura==undefined){
                                    $scope.read_pdf.data.cobertura='PREMIER 200'
                                  }
                                  var best = null;
                                  var bestScore = -1;
                                  var target=$scope.read_pdf.data.cobertura;
                                  var encontardo_paquete=true;
                                  $scope.coberturasPackagePdf=[]
                                  var res   = pickBestPackageOriginal(order.defaults.packages, $scope.read_pdf.data.cobertura);
                                  var best  = res ? res.best  : null;
                                  var score = res ? res.score : null;
                                  var cobertura=$scope.read_pdf.data.cobertura
                                  console.log(res.best ,res.best.package_name);
                                  $scope.packages=order.defaults.packages;
                                  // ---------------
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
                                    order.form.paquete = $scope.paqueteSelectedObject;
                                    $scope.yaseestableciopaquete=true;
                                    $scope.dataToSave.paquete = order.form.paquete.id;   
                                    for (i in $scope.read_pdf.data['Primas y coberturas']) {
                                      if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                          $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                        }
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                          $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                        }
                                        var it ={}
                                        it['coverage_name'] = i
                                        it['url'] = slug(i) + '-' + (order.form.paquete .id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                        it['package'] = order.form.paquete .id
                                        it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                        it['deductible_coverage']=[{'deductible':0}]
                                        it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                        it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                        it['sums_coverage']=[{'sum_insured':0}]
                                        it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                          it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                        }
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                          it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
                                        }
                                        $scope.coberturasPackagePdf.push(it)
                                        order.defaults.coverages=$scope.coberturasPackagePdf
                                        $localStorage['defaults'] = order.defaults
                                        order.form.paquete = order.form.paquete ; 
                                      }
                                    }
                                    order.coverageInPolicy_policy = order.defaults.coverages;
                                    order.form.paquete = order.form.paquete ; 
                                    $scope.dataToSave.paquete = order.form.paquete.id;
                                    $scope.saveLocalstorange()
                                  }else{
                                    order.defaults.packages.forEach(function(item){
                                      var s = scorePackage(item.package_name, target);
                                      if (s > bestScore) { bestScore = s; best = item; }
                                      if((item.package_name).toLowerCase() && $scope.read_pdf.data.cobertura.toLowerCase()){
                                        if (((item.package_name.toLowerCase() == $scope.read_pdf.data.cobertura.toLowerCase())
                                          || ( item.package_name.toLowerCase().includes($scope.read_pdf.data.cobertura.toLowerCase()))
                                          && !$scope.paqueteSelected) || best && $scope.yaseestableciopaquete==false){
                                          $scope.paqueteSelected = true;
                                          order.form.paquete = item;
                                          $scope.yaseestableciopaquete=true;
                                          $scope.dataToSave.paquete = order.form.paquete.id;                                        
                                          for (i in $scope.read_pdf.data['Primas y coberturas']) {

                                              if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                                  $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                                }
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                                  $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                                }
                                                var it ={}
                                                it['coverage_name'] = i
                                                it['url'] = slug(i) + '-' + (item.id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                                it['package'] = item.id
                                                it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                                it['deductible_coverage']=[{'deductible':0}]
                                                it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                                it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                                it['sums_coverage']=[{'sum_insured':0}]
                                                it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                                  it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                                }
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                                  it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
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
                                          $scope.saveLocalstorange()
                                        }
                                      }
                                    }) 
                                  }
                                  $scope.changeSubramo()
                                  if ($localStorage) {
                                  }
                                }
                
                              },
                              function error (e) {
                                $scope.cargandoPaquetes=false;
                                console.log('Error - paquetes-data-by-subramo', e);
                                order.defaults.packages = [];
                              }
                            ).catch(function (error) {
                              $scope.cargandoPaquetes=false;
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

    function extractNum(s) {
      var m = (s || '').match(/\b(\d{2,3})\b/); // 60, 70, 80, 90, 100...
      return m ? m[1] : null;
    }

    /**
     * Devuelve un puntaje de similitud entre itemName y target.
     * Reglas:
     *  - Igual exacto: 100
     *  - Empieza con: 85
     *  - Incluye: 70
     *  - Coincidencia de número (60/80/90/100): +15
     *  - Coincidencia de token "estandar": +10
     */
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
    // Asumo que ya tienes norm() y extractNum() y scorePackage(itemName, targetName)

    // Devuelve el mejor paquete y su puntaje
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

    function llenarAseguradosVida(lista,beneficiarios) {
      // Determinar si hay titular en lista
      if(lista){
        order.subforms.life.beneficiariesList = [];
        order.subforms.life.aseguradosList = [];
        var titular = lista.find(function (a) {
          return (a.tipo).toUpperCase() == 'TITULAR';
        });
        // Si es persona moral, usar también asegurado como titular
        var esPersonaMoral = $scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data.persona == 2;

        order.subforms.life.aseguradosList.push(models.asegurados());
        if (titular || esPersonaMoral) {
          var aseguradoPrincipal = titular || lista[0]; // Usa titular o el primero si es persona moral

          order.subforms.life.aseguradosList[0].first_name = aseguradoPrincipal.first_name;
          order.subforms.life.aseguradosList[0].smoker = 'False';
          order.subforms.life.aseguradosList[0].last_name = aseguradoPrincipal.last_name;
          order.subforms.life.aseguradosList[0].second_last_name = aseguradoPrincipal.second_last_name;
          order.subforms.life.aseguradosList[0].birthdate = (aseguradoPrincipal.fecha || datesFactory.convertDate(new Date()));
          order.subforms.life.aseguradosList[0].antiguedad = aseguradoPrincipal.antiguedad ? aseguradoPrincipal.antiguedad : null;
          order.subforms.life.aseguradosList[0].sex = 'M';

          if (aseguradoPrincipal.sex) {
            order.subforms.life.aseguradosList[0].sex = aseguradoPrincipal.sex
          }
        } else {
          // Si no hay titular y no es moral, usa contratante
          order.subforms.life.aseguradosList[0].smoker = 'False';
          order.subforms.life.aseguradosList[0].first_name = $scope.contratante.first_name;
          order.subforms.life.aseguradosList[0].last_name = $scope.contratante.last_name;
          order.subforms.life.aseguradosList[0].second_last_name = $scope.contratante.second_last_name;
          order.subforms.life.aseguradosList[0].birthdate = formatToMMDDYYYY($scope.contratante.birth_date);
          order.subforms.life.aseguradosList[0].sex = $scope.contratante.sex ? $scope.contratante.sex : 'M';
        }
      }
      if(beneficiarios){
        // Agregar los demás asegurados como dependientes (relaciones)
        beneficiarios.forEach(function (item) {
          if (!item || !item.tipo || (item.tipo).toLowerCase() == 'TITULAR') return; // 
          // if (!item || (item.full_name).toLowerCase()  == aseguradoPrincipal.full_name.toLowerCase()) return; // 
          var ben = {
            birthdate: item.fecha ? item.fecha : null,
            first_name: item.persona==1 || item.persona=='1' ? item.first_name : '',
            last_name: item.persona==1 || item.persona=='1' ? item.last_name : '',
            second_last_name: item.persona==1 || item.persona=='1' ? item.second_last_name : '',
            sex: item.sex ? item.sex : '',
            optional_relationship: item.tipo ? item.tipo : 'Otro',
            percentage: item.percentage ? item.percentage : 0,
            person: item.persona==1 || item.persona=='1' ? 1 : 2,
            antiguedad:'',
            j_name:item.persona==1 || item.persona=='1' ? item.first_name : ''
          };

          // Asignar sexo si viene
          // if (item.sex && (item.persona==1 || item.persona=='1')) {
          //   ben.sex = item.sex.toUpperCase() === 'M'
          //     ? { value: 'M', label: 'MASCULINO' }
          //     : item.sex.toUpperCase() === 'F'
          //       ? 'M'
          //       : null;
          // }
          order.subforms.life.beneficiariesList.push(ben);
        });
      }
      var lista2=order.subforms.life.aseguradosList || [];
      order.subforms.life.aseguradosList = lista2.filter(function (item) {
        return !isEmptyAsegurado(item);
      });
    }
    function isEmptyAsegurado(x) {
      if (!x || typeof x !== 'object') return true;
      var campos = ['first_name','last_name','second_last_name','sex','smoker','antiguedad','birthdate'];
      for (var i = 0; i < campos.length; i++) {
        var v = x[campos[i]];
        if (v !== null && v !== undefined && String(v).trim() !== '') return false; // tiene algo
      }
      return true; // todos vacíos
    }
    function llenarAsegurados(lista) {
      order.subforms.disease.relationshipList = [];

      // Determinar si hay titular en lista
      var titular = lista.find(function (a) {
        return a.tipo == 1 || (a.tipo).toLowerCase()=='titular';
      });

      // Si es persona moral, usar también asegurado como titular
      var esPersonaMoral = $scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data.persona == 2;

      if (titular || esPersonaMoral) {
        var aseguradoPrincipal = titular || lista[0]; // Usa titular o el primero si es persona moral

        order.subforms.disease.first_name = aseguradoPrincipal ? aseguradoPrincipal.first_name : '';
        order.subforms.disease.last_name = aseguradoPrincipal ? aseguradoPrincipal.last_name : '';
        order.subforms.disease.second_last_name = aseguradoPrincipal ? aseguradoPrincipal.second_last_name : '';
        order.subforms.disease.birthdate = (aseguradoPrincipal ? aseguradoPrincipal.fecha  : '' ||aseguradoPrincipal ? aseguradoPrincipal.birthdate : '');
        order.subforms.disease.antiguedad = aseguradoPrincipal ? aseguradoPrincipal.antiguedad : null;

        if (aseguradoPrincipal ? aseguradoPrincipal.sex : '') {
          order.subforms.disease.sex = aseguradoPrincipal.sex
        }
      } else {
        // Si no hay titular y no es moral, usa contratante
        order.subforms.disease.first_name = $scope.contratante.first_name;
        order.subforms.disease.last_name = $scope.contratante.last_name;
        order.subforms.disease.second_last_name = $scope.contratante.second_last_name;
        order.subforms.disease.birthdate = formatToMMDDYYYY($scope.contratante.birth_date);
        order.subforms.disease.sex = $scope.contratante.sex;
      }

      // Agregar los demás asegurados como dependientes (relaciones)
      lista.forEach(function (item) {
        if (!item || !item.tipo || item.tipo == 1 || item.tipo.toLowerCase() == 'titular') return; // omitir titular
        var rel = {
          antiguedad: item.antiguedad ? item.antiguedad : null,
          birthdate: item.fecha ? item.fecha : null,
          first_name: item.first_name,
          last_name: item.last_name,
          second_last_name: item.second_last_name,
          sex: null,
          relationship: { option: "OTRO", relationship: 4, disabled: false }
        };

        // Asignar relación si coincide con catálogo
        tiposBeneficiarios.forEach(function (tb) {
          if (tb.relationship == item.tipo) {
            rel.relationship = tb;
          }
        });

        // Asignar sexo si viene
        if (item.sex) {
          rel.sex = item.sex.toUpperCase() === 'M'
            ? { value: 'M', label: 'MASCULINO' }
            : item.sex.toUpperCase() === 'F'
              ? { value: 'F', label: 'FEMENINO' }
              : null;
        }

        order.subforms.disease.relationshipList.push(rel);
      });
    }

    function formatToMMDDYYYY(isoDateString) {
      if (!isoDateString) return "";
      var date = new Date(isoDateString);
      var month = (date.getMonth() + 1).toString().padStart(2, "0");
      var day = date.getDate().toString().padStart(2, "0");
      var year = date.getFullYear();
      return month + "/" + day + "/" + year;

    }
    function get_claves_pdf(aseguradora,clave) {      
      if(!clave || clave==undefined){
        try{
          clave = $scope.read_pdf.data['Datos generales de la poliza']['Clave_interna_del_agente']
        }catch(u){}
      } 
      order.show.ot = false;
      if ($localStorage) {
      }      
      var date = new Date(order.form.startDate);
      if(isNaN(date)) {
        var date = new Date(mesDiaAnio(order.form.startDate));
      }
      if($scope.ramoPdf == "gastosmedicos"){
        llenarInfoGm(aseguradora,clave)
        return
      }
      if($scope.ramoPdf == "vida" || $scope.ramoPdf == "funerarios"){
        llenarInfoVida(aseguradora,clave)
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
                      $scope.saveLocalstorange()
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
                            $scope.cargandoPaquetes=true;
                            $http.post(url.IP+ 'paquetes-data-by-subramo/',
                              {'ramo': order.form.ramo.id, 'subramo':order.form.subramo.id,'provider':order.form.aseguradora.id })
                            .then(
                              function success (response) {
                                $scope.cargandoPaquetes=false;
                                order.defaults.packages = [];
                                order.defaults.coverages=[];
                                $scope.paqueteSelected = false;
                                $scope.coberturasPackagePdf = []

                                if(response.data.length) {
                                  order.defaults.packages = response.data;
                                  if($scope.read_pdf.data.cobertura=='' || $scope.read_pdf.data.cobertura==undefined){
                                    $scope.read_pdf.data.cobertura='AMPLIA'
                                  }
                                  var best = null;
                                  var bestScore = -1;
                                  var target=$scope.read_pdf.data.cobertura;
                                  var encontardo_paquete=true;
                                  $scope.coberturasPackagePdf=[]

                                  var res   = pickBestPackageOriginal(order.defaults.packages, $scope.read_pdf.data.cobertura);
                                  var best  = res ? res.best  : null;
                                  var score = res ? res.score : null;

                                  var cobertura=$scope.read_pdf.data.cobertura
                                  $scope.packages=order.defaults.packages;
                                  // Debería elegir: "ESMERALDA" (id 88256) por tier + similitud
                                  // ----------
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
                                    order.form.paquete = $scope.paqueteSelectedObject;
                                    $scope.yaseestableciopaquete=true;
                                    $scope.dataToSave.paquete = order.form.paquete.id;  
                                    for (i in $scope.read_pdf.data['Primas y coberturas']) {
                                      if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                          $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                        }
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                          $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                        }
                                        var it ={}
                                        it['coverage_name'] = i
                                        it['url'] = slug(i) + '-' + (order.form.paquete .id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                        it['package'] = order.form.paquete .id
                                        it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                        it['deductible_coverage']=[{'deductible':0}]
                                        it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                        it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                        it['sums_coverage']=[{'sum_insured':0}]
                                        it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                          it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                        }
                                        if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                          it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
                                        }
                                        $scope.coberturasPackagePdf.push(it)
                                        order.defaults.coverages=$scope.coberturasPackagePdf
                                        $localStorage['defaults'] = order.defaults
                                        order.form.paquete = order.form.paquete ; 
                                      }
                                    }
                                    order.coverageInPolicy_policy = order.defaults.coverages;
                                    order.form.paquete = order.form.paquete ; 
                                    $scope.dataToSave.paquete = order.form.paquete.id;
                                  }else{
                                    order.defaults.packages.forEach(function(item){
                                      var s = scorePackage(item.package_name, target);
                                      if (s > bestScore) { bestScore = s; best = item; }
                                      if((item.package_name).toLowerCase() && $scope.read_pdf.data.cobertura.toLowerCase()){
                                        if (((item.package_name.toLowerCase() == $scope.read_pdf.data.cobertura.toLowerCase())
                                          || ( item.package_name.toLowerCase().includes($scope.read_pdf.data.cobertura.toLowerCase()))
                                          && !$scope.paqueteSelected) || best && $scope.yaseestableciopaquete==false){
                                          $scope.paqueteSelected = true;
                                          order.form.paquete = item;
                                          $scope.yaseestableciopaquete=true;
                                          $scope.dataToSave.paquete = order.form.paquete.id;    
                                          for (i in $scope.read_pdf.data['Primas y coberturas']) {

                                              if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                                  $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                                }
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                                  $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                                }
                                                var it ={}
                                                it['coverage_name'] = i
                                                it['url'] = slug(i) + '-' + (item.id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                                it['package'] = item.id
                                                it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                                it['deductible_coverage']=[{'deductible':0}]
                                                it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                                it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                                it['sums_coverage']=[{'sum_insured':0}]
                                                it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                                  it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                                }
                                                if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                                  it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
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
                                          $scope.saveLocalstorange()
                                        }
                                      }
                                    }) 
                                  }
                                  // var best = null;
                                  // var bestScore = -1;
                                  // var target=$scope.read_pdf.data.cobertura ? $scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data.cobertura :order.defaults.packages[0].package_name
                                  // $scope.coberturasPackagePdf=[]
                                  // order.defaults.packages.forEach(function(item){
                                  //   var s = scorePackage(item.package_name, target);
                                  //   if (s > bestScore) { bestScore = s; best = item; }
                                  //   if((item.package_name).toLowerCase() && $scope.read_pdf.data.cobertura.toLowerCase()){
                                  //     if (((item.package_name.toLowerCase() == $scope.read_pdf.data.cobertura.toLowerCase())
                                  //       || ( item.package_name.toLowerCase().includes($scope.read_pdf.data.cobertura.toLowerCase()))
                                  //       && !$scope.paqueteSelected) || best  && $scope.yaseestableciopaquete==false){
                                  //       console.log('zzzzzzzz',best)
                                  //       $scope.paqueteSelected = true;
                                  //       order.form.paquete = item;
                                  //       $scope.yaseestableciopaquete=true;
                                  //       $scope.dataToSave.paquete = order.form.paquete.id;                                        
                                  //       for (i in $scope.read_pdf.data['Primas y coberturas']) {

                                  //           if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                                  //               $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                                  //             }
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                                  //               $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                                  //             }
                                  //             var it ={}
                                  //             it['coverage_name'] = i
                                  //             it['url'] = slug(i) + '-' + (item.id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                                  //             it['package'] = item.id
                                  //             it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                                  //             it['deductible_coverage']=[{'deductible':0}]
                                  //             it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                                  //             it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                                  //             it['sums_coverage']=[{'sum_insured':0}]
                                  //             it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                                  //               it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                                  //             }
                                  //             if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                                  //               it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
                                  //             }
                                  //             $scope.coberturasPackagePdf.push(it)
                                  //             order.defaults.coverages=$scope.coberturasPackagePdf
                                  //             $localStorage['defaults'] = order.defaults
                                  //             order.form.paquete = item; 
                                  //         }
                                  //       }
                                  //       order.coverageInPolicy_policy = order.defaults.coverages;
                                  //       order.form.paquete = item; 
                                  //       $scope.dataToSave.paquete = order.form.paquete.id;
                                  //       $scope.saveLocalstorange()
                                  //     }
                                  //   }
                                  // })
                                  $scope.changeSubramo()
                                  if ($localStorage) {
                                  }
                                }
                
                              },
                              function error (e) {
                                $scope.cargandoPaquetes=false;
                                console.log('Error - paquetes-data-by-subramo', e);
                                order.defaults.packages = [];
                              }
                            ).catch(function (error) {
                              $scope.cargandoPaquetes=false;
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
    // ++++++++++++++++++++++++++++**************
    function get_claves() {
      var date = new Date(order.form.startDate);
      if(isNaN(date)) {
        var date = new Date(mesDiaAnio(order.form.startDate));
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
            if(order.form.clave==undefined || !order.form.clave){
              if(order.defaults.claves && order.defaults.claves.length!=0) {
                order.form.clave = order.defaults.claves[0];
                $scope.dataToSave.clave = order.form.clave.id;
                try{
                  order.form.comision_percent = (order.form.clave.comission);
                  order.form.udi = (order.form.clave.udi);
                }
                catch(e){}
              }
            }
        },
        function error (e) {
            console.log('Error - claves-by-provider', e);
        })
        .catch(function (error) {
          console.log('Error - claves-by-provider - catch', error);
        });
    }
    order.autocomplete = autocomplete;
    function autocomplete(param){
      try{
        if(param.val.length >1 ){
          getmatches(param.val);
        }
      }
      catch(e){}
    };

    $scope.addNewPackage = function () {
      $scope.show_new_pack = true;
      $scope.create_pack = true;
      $scope.show_new_sub = false;

      $scope.newPackageCoverage = {
        package_name: '',
        description: '',
        coverage_package: [
          {
            coverage_name: '',
            deductible: '',
            sums_coverage: [],
            coinsurance_coverage: []
          }
        ]
      };
    };

    $scope.addNewPackageCoverage = function(){
      var coverage = {
        coverage_name: '',
        sums_coverage: [],
        deductible: [],
        coinsurance_coverage: [],
        topecoinsurance_coverage: []
      }
      $scope.newPackageCoverage.coverage_package.push(coverage);
    };

    $scope.deleteNewPackageCoverage = function(index){
      $scope.newPackageCoverage.coverage_package.splice(index, 1);
    };
    $scope.cancelNewPackage =function(){
      $scope.newPackageCoverage=[]
      $scope.show_new_pack = false;
      $scope.create_pack = false;
    }
    $scope.saveNewPackage = function (){
      $scope.paqueteGuardado=true;
      var parObj = {
        package_name: $scope.newPackageCoverage ? $scope.newPackageCoverage.package_name : '',
        description: $scope.newPackageCoverage.description,
        provider: order.form.aseguradora.url,
        ramo: order.form.ramo.url,
        subramo: order.form.subramo.url,
        type_package: 1, // paquete normal
        coverage_package: []
      }
      packageService.createPackage(parObj)
      .then(
        function success (request) {
          if(request.id) {
            $scope.show_new_pack = false;
            $scope.paqueteGuardado=false;
            order.defaults.packages.push(request);
            // $scope.create_pack = false;
            // $scope.add_coverages = true;
            $scope.package_created = request;
            $scope.newPackageCoverage.coverage_package.forEach(function(item, index){
              var obj = {
                coverage_name: item.coverage_name,
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
                        'sum_insured': item.sums_coverage,
                        'default': true
                    }
                  }).then(function success(sum){
                    $http({
                      method: 'POST',
                      url: url.IP + 'deducibles/',
                      data: {
                          'coverage_deductible': request.url,
                          'deductible': item.deductible,
                          'default': true
                      }
                    }).then(function success(ded){
                      if(request.id) {
                        $scope.coverages.push(request);
                        // $scope.coverageName = '';
                        // parName = '';
                        request.sums_coverage = sum;
                        request.deductible_coverage = ded;

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
                    });
                  });


                },
                function error (error) {
                  console.log('error - createCoverage', error);
                }
              )
              .catch(function(e) {
                console.log('error - createCoverage - catch', e);
              });

              if((index + 1) == $scope.newPackageCoverage.coverage_package.length){
                $scope.show_new_pack = false;
                $scope.newPackageCoverage = {
                  package_name: '',
                  description: '',
                  coverage_package: [
                    {
                      coverage_name: '',
                      deductible: '',
                      sums_coverage: [],
                      coinsurance_coverage: []
                    }
                  ]
                };
                
              }
            });
          }
        },
        function error (error) {
          console.log('error - createPackage', error);
        })
      .catch(function(e) {
        console.log('error -createPackage- catch',e);
      });
    };

    $scope.selectComision = function (param) {
      order.form.comision_percent = param.comission;
      order.form.udi = param.udi;
      $scope.dataToSave.comision_percent = param.comission;
      $scope.dataToSave.udi = param.udi;
    };

    $scope.addNewSubramo = function () {
      $scope.show_new_sub = true;
      $scope.create_sub = true;
      $scope.show_new_pack = false;
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

      $scope.saveCoverage = function (parName, sum_insured, deductible) {

      // var paqueteData = $scope.package_created;

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
          // console.log('request', request);
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
      $scope.changePackage($scope.package_created);
      $scope.changeSubramo();
    };

    $scope.cancelNewPackage = function () {
      $scope.show_new_pack = false;
      $scope.package = {};
    };

    $scope.cancelNewSubramo = function () {
      $scope.show_new_sub = false;
    };
    
    $scope.checkSelected = function(value, parUser) {
    
        if(value) {
    
            $http.get(url.IP+'bancos/').then(function(bank){
                $scope.banks = bank.data;
    
                if(parUser.user_info) {
                    if(parUser.user_info.is_vendedor) {
        
                        var seller_data = parUser.user_info.info_vendedor[0];
                        $scope.original_data = vendedorStructure(parUser, seller_data);
          
                    }
                } else {
                    parUser.hired_date = datesFactory.convertDate(new Date());
                }
            });
        } else {
    
            $scope.users.forEach(function(user) {
                
                if(parUser.id == user.id) {
                    user['phones'] = [];
                    user['subramos'] = [];
                }
            }); 
        }
    };
    
    function vendedorStructure (parUser, parData) {
    
        var date = new Date(parData.hired_date);
        parUser.hired_date = datesFactory.convertDate(date);
        parUser.reference_number = parData.reference_number;
        parUser.gastos_operacion = parData.gastos_operacion;
        parUser.address = parData.address;
        parUser.email = parData.email;
        parUser.url = parData.url;
    
        $scope.banks.forEach(function(bank) {
            if(bank.id == parData.bank) {
                parUser.bank = bank;
            }
        });
    
        $scope.fcs.forEach(function(frec) {
            if(frec.key == parData.frequencia_de_cobro) {
                parUser.frequencia_de_cobro = frec;
            }
        });
    
        $scope.pay_ways.forEach(function(pay) {
            if(pay.key == parData.tipo_pago
              ) {
                parUser.pay_way = pay;
            }
        });
    
        if(parData.vendedor_phone.length) {
            if(parData.vendedor_phone.length == 1) {
                parUser.phone = parData.vendedor_phone[0].phone;
    
            } else if(parData.vendedor_phone.length > 1) {
                
                parData.vendedor_phone.forEach(function(phone, index) {
                    if(index == 0) {
                        parUser.phone = parData.vendedor_phone[0].phone;
                    } else {
                        parUser.phones.push(phone.phone);
                    }
                });
    
            } 
        }
    
        parData.vendedor_subramos.forEach(function(sub_ramo) {
    
            var data = {
                provider: sub_ramo.provider,
                ramo: sub_ramo.ramo,
                subramo: sub_ramo.subramo,
                comision_percentage: sub_ramo.comision,
                comision: sub_ramo.comision,
                id: sub_ramo.id,
                url: sub_ramo.url,
                ramos:$scope.fake_ramos
            };
    
            $scope.aseguradoras.forEach(function(provider) {
                if (sub_ramo.provider == 0 && sub_ramo.ramo != 0) {
                    data.ramos = $scope.fake_ramos;
    
                        data.ramos.forEach(function(ramo) {
                            if(ramo.id == sub_ramo.ramo) {
                                data.ramo = ramo;
                                data.sub_ramos = ramo.subramo_ramo;
                              
                                ramo.subramo_ramo.forEach(function(sub) {
                                    if(sub.id == sub_ramo.subramo) {
                                        data.subramo = sub;
                                    }
                                });
                            }
                        });
                }
                else if(provider.id == sub_ramo.provider) {
                  data.ramos = $scope.fake_ramos;
    
                    data.provider = provider;
            
                    $http.get(url.IP + 'ramos-by-provider/' + provider.id)
                    .then(function(ramo){
                        
                        data.ramos = ramo.data;
    
                        data.ramos.forEach(function(ramo) {
                            if(ramo.id == sub_ramo.ramo) {
                                data.ramo = ramo;
                                data.sub_ramos = ramo.subramo_ramo;
                              
                                ramo.subramo_ramo.forEach(function(sub) {
                                    if(sub.id == sub_ramo.subramo) {
                                        data.subramo = sub;
                                    }
                                });
                            }
                        });
    
                    });
    
                }
            });
    
            parUser.subramos.push(data);
    
        });
    
        return angular.copy(parUser);
    }
    
    $scope.saveSeller = function(main_index) {            
        var user = angular.copy($scope.referenciador[main_index]);        
        if(user.user_info) {
            if(user.user_info.is_vendedor) {
                var vendedor_ = user.user_info.info_vendedor[0].id;
            }
        }
        else {
            var vendedor_ = user.id;
        }
    
        if(user.subramos.length) {
    
            var subramos_ = user.subramos.map(function(item) {
    
                var subramo_post = {
                    provider: item.provider ? item.provider.id : 0,
                    ramo: item.ramo ? item.ramo.id  : 0,
                    subramo: item.subramo ? item.subramo.id : 0,
                    comision: item.comision_percentage ? parseFloat(item.comision_percentage) : 0,
                    vendedor: vendedor_,
                }
    
                if(item.id) {
                    subramo_post.id = item.id;
                }
    
                if(item.url) {
                    subramo_post.url = item.url;
                }
    
                return subramo_post;
            });
            
        }
        else {
            var subramos_ = [];
        }
    
        if(user.phones.length) {
            var phones_ = user.phones.map(function(phn) {
                var phones_return = {
                    phone: phn,
                    vendedor: vendedor_
                };
    
                if(phn.id) {
                    phones_return.id = phn.id;
                }
    
                  if(phn.url) {
                    phones_return.url = phn.url;
                }
    
                return phones_return;
            });
    
            if(user.phone) {
                phones_.push({phone: user.phone, vendedor: vendedor_ });
            }
    
        }
        else {
            if(user.phone) {
                var phones_ = [{ phone: user.phone, vendedor: vendedor_ }];
            }
        }
    
        var hired_date_ = datesFactory.toDate(user.hired_date);
    
        user.vendedor_subramos = subramos_;
        user.hired_date = hired_date_;
        user.vendedor_phone = phones_;
        user.gastos_operacion = user.gastos_operacion ? parseInt(user.gastos_operacion) : 0;
        user.user = user.id; 
        user.vendedor = vendedor_;
        user.is_vendedor = true;
    
        if(user.user_info.info_vendedor.length > 0) {
    
            if(user.user_info.is_vendedor) {
    
                var data_source = {};
    
                var hired_date_original = datesFactory.toDate($scope.original_data.hired_date);
    
                if(hired_date_original !== hired_date_) {
                    data_source.hired_date = user.hired_date;
                }
    
                if($scope.original_data.bank.id !== user.bank.id) {
                    data_source.bank = user.bank.id
                }
    
                if($scope.original_data.reference_number !== user.reference_number) {
                    data_source.reference_number = user.reference_number;
                }
    
                if($scope.original_data.pay_way.key !== user.pay_way.key) {
                    data_source.tipo_pago = user.pay_way.key;
                }
    
                if(parseFloat($scope.original_data.gastos_operacion) !== parseFloat(user.gastos_operacion)) {
                    data_source.gastos_operacion = user.gastos_operacion;
                }
    
                // if($scope.original_data.frequencia_de_cobro.key !== user.frequencia_de_cobro.key) {
                //     data_source.frequencia_de_cobro = user.frequencia_de_cobro.key
                // }
    
                if($scope.original_data.email !== user.email) {
                    data_source.email = user.email;
                }
    
                if($scope.original_data.phone !== user.phone) {
                    var source_phone = {};
                    var source_url = user.user_info.info_vendedor[0].vendedor_phone[0];
                    source_phone.phone = user.phone;
                    $http.patch(source_url.url, source_phone)
                    .then(function(req) {
                        if(req.status == 200) {
    
                        }
                    });
                }
    
                for( var i = 0; i < $scope.original_data.phones.length; i++) {
                    if($scope.original_data.phones[i] !== user.phones[i]) {
                        var source_phone = {};
                        var source_url = user.user_info.info_vendedor[0].vendedor_phone[i + 1];
                        source_phone.phone = user.phones[i];
                        $http.patch(source_url.url, source_phone)
                        .then(function(req) {
                            if(req.status == 200) {
    
                            }
                        });
                    }
                }
    
                if($scope.original_data.address !== user.address) {
                    data_source.address = user.address;
                }
    
                $http.patch(user.url, data_source)
                .then(function(req) {
                    // console.log('req', req);
                    if(req.status == 200) {
                        $http.get(url.IP + 'get-vendors/')
                        .then(function(user) {
    
                            $scope.referenciador = user.data;
                            SweetAlert.swal("¡Listo!", MESSAGES.OK.UPDATESELLER, "success");
    
                            $scope.show_pagination = true;
                            $scope.config_pagination_referenciador =  {
                                count: user.data.count,
                                next: user.data.next,
                                previous: user.data.previous
                            };
    
                            $scope.testPagination('referenciador', 'config_pagination_referenciador');
    
                            $scope.referenciador.forEach(function(user) {
                                user['phones'] = [];
                                user['subramos'] = [];
                            });
    
                            providerService
                            .getReadListProviders()
                            .then(function(provider) {
                                $scope.aseguradoras = provider;
                            });
    
                        });
                    }
                });
    
                if($scope.original_data.subramos.length !== subramos_.length) {
    
                    // DELETE $scope.delete_subramos
                    if($scope.delete_subramos.length) {
          
                        $scope.delete_subramos.forEach(function(item_d) {
                
                            $http.delete(item_d.url)
                            .then(function(delete_item) {
                                // console.log('delete_item', delete_item);
                            });
                        });
                    }
    
                    subramos_.forEach(function(item) {
                        if(item.id) {
                            
                            $scope.original_data.subramos.forEach(function(o_item) {
                                if(o_item.id == item.id) {
                                
                                    if(parseFloat(o_item.comision) !== parseFloat(item.comision)) {
                                        $http.patch(item.url, { comision: item.comision })
                                        .then(function(comision) {
                                            // console.log('comision_percentage - patch', comision);
                                        });
                                    }
                                }
                            });
                        } else {
    
                            dataFactory.post('subramos-vendedor/', item)
                            .then(function(subramo_) {
                                // console.log('subramo_', subramo_);
                            });
                        }
                    });
                }
                else{
                    subramos_.forEach(function(item) {
                        if(item.id) {    
    
                            $scope.original_data.subramos.forEach(function(o_item) {
                                if(o_item.id == item.id) {
    
                                    var sub_ramo_data = {};
    
                                    if(parseFloat(o_item.comision) !== parseFloat(item.comision)) {
                                        sub_ramo_data.comision = item.comision;
                                    }
    
                                    if(o_item.provider !== item.provider) {
                                        sub_ramo_data.provider = item.provider;
                                    }
    
                                    if(o_item.ramo !== item.ramo) {
                                        sub_ramo_data.ramo = item.ramo;
                                    }
    
                                    if(o_item.subramo !== item.subramo) {
                                        sub_ramo_data.subramo = item.subramo;
                                    }
    
                                    $http.patch(item.url, sub_ramo_data)
                                    .then(function(request) {
                                        // console.log(request);
                                    });
                                }
                            });
                        }
                    });
                }
    
                $scope.original_data.phones.push($scope.original_data.phone);
    
                if($scope.original_data.phones.length !== phones_.length) {
    
                    // DELETE $scope.delete_subramos
                    if($scope.delete_phones.length) {
                        $scope.delete_phones.forEach(function(item) {
                            $http.delete(item.url)
                            .then(function(delete_item) {
                                // console.log('delete_item', delete_item);
                            });
                        });
                    }
    
                    phones_.forEach(function(item) {
                        if(item.id) {
    
                            $scope.original_data.phones.forEach(function(o_item) {
                                if(o_item.id == item.id) {
    
                                    if(parseFloat(o_item.phone) !== parseFloat(item.$scope.delete_phones)) {
                                        $http.patch(item.url, { phone: item.$scope.delete_phones })
                                        .then(function(phine) {
                                            console.log('phone - patch', phine);
                                        });
                                    }
                                }
                            });
    
                        } else {
                            // post
                            dataFactory.post('phone-vendedor/', item)
                            .then(function(phne_) {
                                // console.log('phne', phne_);
                            });
                        }
                    });
                }
            }
            else{
    
                dataFactory.post('vendedores/', user)
                .then(function(data) {
                    if(data.status == 201) {
    
                        $scope.isSeller[main_index] = false;
    
                        $scope.users.forEach(function(user, index) {
    
                            if(user.id == data.data.user) {
    
                                dataFactory
                                .get('get-vendors/'+ data.data.user)
                                .then(function(req) {
    
                                    req.data['phones'] = [];
                                    req.data['subramos'] = [];
                                    $scope.users[index] = req.data;
    
                                });
                            }
                        });
                    }
                });  
            }
    
        } else {
    
            user.bank = user.bank.id;
            user.tipo_pago = user.pay_way.key;
            user.frequencia_de_cobro = user.frequencia_de_cobro.key
    
            dataFactory.post('vendedores/', user)
            .then(function(data) {
        
                if(data.status == 201) {
    
                    $scope.isSeller[main_index] = false;
    
                    $scope.users.forEach(function(user, index) {
    
                        if(user.id == data.data.user) {
    
                            dataFactory
                            .get('get-vendors/'+ data.data.user)
                            .then(function(req) {
    
                                req.data['phones'] = [];
                                req.data['subramos'] = [];
                                $scope.users[index] = req.data;
    
                            });
                        }
                    });
    
                    $http.get(url.IP + 'get-vendors/')
                        .then(function(user) {
    
                            $scope.referenciador = user.data;
                            SweetAlert.swal("¡Listo!", MESSAGES.OK.CREATESELLER, "success");
    
                            $scope.show_pagination = true;
                            $scope.config_pagination_referenciador =  {
                                count: user.data.count,
                                next: user.data.next,
                                previous: user.data.previous
                            };
    
                            $scope.testPagination('referenciador', 'config_pagination_referenciador');
    
                            $scope.users.forEach(function(user) {
                                user['phones'] = [];
                                user['subramos'] = [];
                            });
    
                            providerService
                            .getReadListProviders()
                            .then(function(provider) {
                                $scope.aseguradoras = provider;
                            });
    
                        });
                }
            }); 
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
          .then(function(response) {
          
            if(response.status === 200 && (response.data.contractors)) {

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
      } else {
        $scope.contractors_data = [];
      }
    };
    $scope.$watch('order.subforms.auto.selectedCar.value', function(newValue, oldValue) {
      try{
        order.subforms.auto.brand = order.subforms.auto.selectedCar.value.car_brand;
        order.subforms.auto.model = order.subforms.auto.selectedCar.value.car_model;
        order.subforms.auto.version = order.subforms.auto.selectedCar.value.short_description.replace(order.subforms.auto.selectedCar.value.car_model,'');
      }
      catch(e){}

    });
    $scope.initAddressSelection = function() {
      if (order.defaults.address.length === 1) {
          order.form.address = order.defaults.address[0];
      }
    };
    $scope.$watch('order.form.contratante.value', function(newValue, oldValue) {    
    
      if($rootScope && $rootScope.myInsurance &&  $rootScope.myInsurance.myInsurance && $rootScope.myInsurance.myInsurance.id && order.form && order.form.contratante){  
        order.form.contratante.value = $rootScope.myInsurance.myInsurance;
        $rootScope.myInsurance = {};
      }
      if(order.form && order.form.contratante && order.form.contratante.value){
        $http.get(url.IP + 'get-vendors/')
        .then(function(user) {
          $scope.referenciador = user.data;
          $scope.referenciador.forEach(function(user) {
            user.first_name = user.first_name.toUpperCase()
            user.last_name = user.last_name.toUpperCase()
            user['phones'] = [];
            user['subramos'] = [];
          });
          if(user.data){
            if (order.form && order.form.contratante && order.form.contratante.value && order.form.contratante.value.vendor) {
              $scope.referenciador.forEach(function(user) {
                if (user.url === order.form.contratante.value.vendor && !$scope.referenciadores.some(function(ref) { return ref.referenciador === user.url })) {
                    order.form.vendor = user.id;
                    $scope.referenciadores.push({ referenciador: user.url }); 
                }
              });
            }            
            if ($localStorage.orderFormCotizacion && $localStorage.orderFormCotizacion.referenciador) {
              $scope.referenciador.forEach(function(user) {
                  if (user.url === $localStorage.orderFormCotizacion.referenciador && !$scope.referenciadores.some(function(ref) { return ref.referenciador === user.url })) {
                      $scope.referenciadores.push({ referenciador: user.url });
                  }
              });
            }
          
          }
          if($scope.sucursalList && order.form.contratante && order.form.contratante.value && order.form.contratante.value.sucursal &&  order.form.contratante.sucursal &&  order.form.contratante.sucursal.id){
            $scope.sucursalList.forEach(function(item){
              if(item.id == order.form.contratante.sucursal.id){
                order.form.sucursal = order.form.contratante.sucursal.id;
              }
            });
          }
        });
      

        if(order.form.contratante.value && order.form.contratante.value.full_name) {
          order.form.contratante.val = order.form.contratante.value.full_name
        }
        if (order.form.contratante.value && order.form.contratante.value.address_contractor){
          order.defaults.address = order.form.contratante.value.address_contractor;
          $scope.initAddressSelection();
          for (var i = 0; i < order.defaults.address.length.length; i++) {
            if(order.defaults.address[i].tipo == null){
              order.defaults.address[i].tipo == '';
            }
          }
          order.form.address = order.defaults.address[0];
        } 

        if (order.form.contratante.value.phone_number){
          order.form.contratante.phone_number = order.form.contratante.value.phone_number
        }

        if (order.form.contratante.value.email){
          order.form.contratante.email = order.form.contratante.value.email
        }

        try{
          if(order.defaults.address.length == 1){
            order.form.address = order.defaults.address[0];
          }
        }
        catch (err){
        }


        // if(order.form.contratante.value.celula){
        //   $scope.celulas.forEach(function(item){
        //     if(item.celula_name == order.form.contratante.value.celula){
        //       order.form.celula = item;
        //     }
        //   });
        if(order.form.contratante.value.cellule){
          $http.get(order.form.contratante.value.cellule.url ? order.form.contratante.value.cellule.url : order.form.contratante.value.cellule)
          .then(function(request) {
            if($scope.celulas){
              $scope.celulas.forEach(function(item){
                if(String(item.url) ==String(request.data.url)){
                  order.form.celula = item;
                }
              });  
            }                
          })
        }

        if($scope.sucursalList && order.form.contratante && order.form.contratante.value && order.form.contratante.value.sucursal){
          $scope.sucursalList.forEach(function(item){
            if(item.url == order.form.contratante.value.sucursal){
              order.form.sucursal = item.id;
            }
          });
        }
        $scope.info_sub = order.form.contratante.value;
        // if(order.form.contratante.value.grouping_level){
        if(order.form.contratante.value.groupinglevel){
          // $http.get(order.form.contratante.value.groupinglevel)
          $http.get(order.form.contratante.value.groupinglevel.url ? order.form.contratante.value.groupinglevel.url : order.form.contratante.value.groupinglevel)
          .then(function(request) {
            // $scope.agrupaciones.forEach(function(item){
            //   console.log('-00--order.form.contratante.value.grouping_level',order.form.contratante.value.groupinglevel)
            //   if(String(item.url) == String(request.data.url)){
            //     console.log('---order.form.contratante.value.grouping_level',order.form.contratante.value.groupinglevel)
            //     order.form.grouping_level = item;
            //     $scope.changeAgrupacion(item);
            //   }
            // });
            if(order.form.contratante.value.groupinglevel){
              // $http.get(order.form.contratante.value.groupinglevel)
              $http.get(order.form.contratante.value.groupinglevel.url ? order.form.contratante.value.groupinglevel.url : order.form.contratante.value.groupinglevel)              
              .then(function success(respons) {
                if(respons.data.type_grouping == 3){
                  $scope.info_sub.subsubgrouping = respons.data.description;
                  $http.get(respons.data.parent)
                  .then(function success(respon) {
                    $scope.info_sub.subgrouping = respon.data.description;
                    $http.get(respon.data.parent)
                    .then(function success(respo) {
                      order.form.grouping_level = respo.data;
                      $scope.changeAgrupacion(respo.data);
                    });
                    order.form.subgrouping == respon.data;
                  });
                  order.form.subsubgrouping == respons.data;
                }else if(respons.data.type_grouping == 2){
                  $scope.info_sub.subgrouping = respons.data.description;
                  $http.get(respons.data.parent)
                  .then(function success(respon) {
                    order.form.grouping_level = respon.data;
                    $scope.changeAgrupacion(respon.data);
                  });
                  order.form.subgrouping == respons.data;
                }else if(respons.data.type_grouping == 1){
                  order.form.grouping_level = respons.data;
                  $scope.changeAgrupacion(respons.data);
                }
              });
            }
          });
        }
      }
    });

    $scope.$watch('order.defaults.coverages', function(newValue, oldValue) {
      if (newValue) {
        newValue.forEach(function(coverage) {
          // console.log('coverage', coverage);
          coverage.deductible_coverage_parsed = [];
          coverage.sums_coverage_parsed = [];
          coverage.deductible_coverage.forEach(function(deductible) {
              var obj = {
                  label: deductible.deductible,
                  value: deductible.deductible
              }
              coverage.deductible_coverage_parsed.push(obj);
          });

          coverage.sums_coverage.forEach(function(suma) {
              var obj = {
                  label: suma.sum_insured,
                  value: suma.sum_insured
              }
              coverage.sums_coverage_parsed.push(obj);
          });
        });
      }
    });
    $scope.aseguradoraSelection = function () {
      // Nueva estructura
      if (order.form.aseguradora) {
      $scope.dataToSave.aseguradora = order.form.aseguradora.id;
      }

      if(order.form.aseguradora){
        get_claves();
      }
      if (order.form.aseguradora) {
        $http.get(url.IP + 'ramos-by-provider/'+order.form.aseguradora.id)
        .then(
          function success (response) {
          order.defaults.ramos = response.data;
          if($localStorage.orderFormCotizacion){
            order.defaults.ramos.forEach(function(ram){
              if (ram.ramo_name == $localStorage.orderFormCotizacion.ramo){
                order.form.ramo = ram;
                $scope.changeRamo();
                if (order.form.ramo.ramo_code == 2 && order.subforms.disease){
                  order.subforms.disease.first_name = JSON.parse($localStorage.orderFormCotizacion.accidents.replaceAll('\'','"'))['first_name'];
                  order.subforms.disease.last_name = JSON.parse($localStorage.orderFormCotizacion.accidents.replaceAll('\'','"'))['last_name'];
                  order.subforms.disease.second_last_name = JSON.parse($localStorage.orderFormCotizacion.accidents.replaceAll('\'','"'))['second_last_name'];
                  order.subforms.disease.birthdate = JSON.parse($localStorage.orderFormCotizacion.accidents.replaceAll('\'','"'))['birthdate'];
                  order.subforms.disease.antiguedad = JSON.parse($localStorage.orderFormCotizacion.accidents.replaceAll('\'','"'))['antiguedad'];
                  order.subforms.disease.sex = JSON.parse($localStorage.orderFormCotizacion.accidents.replaceAll('\'','"'))['sex'];
                  order.subforms.disease.relationshipList = JSON.parse($localStorage.orderFormCotizacion.accidents.replaceAll('\'','"'))['relationshipList'];
                  order.subforms.disease.relationshipList.map(function(rel){
                    rel['sex'] = rel['value'] == 'M' ?  $scope.sex[0]: $scope.sex[1];
                    tiposBeneficiarios.forEach(function(tb){
                      if (tb.relationship == rel['relationship']['relationship']){
                        rel['relationship'] = tb;
                      }
                    })
                    return rel;
                  })
                }
                if (order.form.ramo.ramo_code == 1 && order.subforms.life){
                  order.subforms.life.aseguradosList = [];
                  order.subforms.life.beneficiariesList = [];
                  // "{'beneficiariesList': [{'person': 1, 'first_name': 'HIJO', 'last_name': 'DE JOAQUIN', 'second_last_name': 'DASD', 'optional_relationship': 'HJO', 'birthdate': '26/04/2022', 'sex': 'M', 'antiguedad': '27/04/2022', 'percentage': 100, 'j_name': '', 'rfc': ''}], 'aseguradosList': [{'first_name': 'JOAUIN', 'last_name': 'SADSA', 'second_last_name': 'ASDSAD', 'birthdate': '02/05/2022', 'sex': 'M', 'antiguedad': '25/04/2022', 'smoker': 'True'}]}"
                  var aseguradosList = JSON.parse($localStorage.orderFormCotizacion.life.replaceAll('\'','"'))
                  aseguradosList['aseguradosList'].forEach(function(al){
                    var asegurado = {
                      "first_name": al.first_name,
                      "last_name": al.last_name,
                      "second_last_name": al.second_last_name,
                      "birthdate": al.birthdate,
                      "sex": al.sex,
                      "antiguedad": al.antiguedad,
                      "smoker": al.smoker ,
                    }
                    
                    order.subforms.life.aseguradosList.push(asegurado);
                  })
                  aseguradosList['beneficiariesList'].forEach(function(bl){
                    var beneficiario = {
                      "person": bl.person,
                      "first_name": bl.first_name,
                      "optional_relationship": bl.optional_relationship,
                      "last_name": bl.last_name,
                      "second_last_name": bl.second_last_name,
                      "birthdate": bl.birthdate,
                      "sex": bl.sex,
                      "antiguedad": bl.antiguedad,
                      "percentage": bl.percentage ? parseFloat(bl.percentage).toFixed(2) : 0,
                      "j_name": bl.j_name,
                      "rfc": bl.rfc,
                    }
                    order.subforms.life.beneficiariesList.push(beneficiario);
                  })                  
                }
              }
            })
          }
          if($scope.aseguradoraPdf){
            for(var i=0; i < order.defaults.ramos.length; i++){
              if(order.defaults.ramos[i].ramo_code == 3){
                order.form.ramo = order.defaults.ramos[i];
                order.defaults.subramos = order.defaults.ramos[i].subramo_ramo;
                if(order.defaults.subramos){
                  for(var j=0; j < order.defaults.subramos.length; j++){
                    if(order.defaults.subramos[j].subramo_code == 9){
                      order.form.subramo = order.defaults.subramos[j];
                      $scope.changeSubramo();
                    }
                  }
                }
              }
            }
            if(!order.form.ramo || order.form.ramo == '' || order.form.ramo == undefined){
              SweetAlert.swal("Advertencia", "La aseguradora no tiene ramo de daños.", "warning");
            }
            if(!order.form.subramo || order.form.subramo == '' || order.form.subramo == undefined){
              SweetAlert.swal("Advertencia", "La aseguradora no tiene subramo de automoviles.", "warning");
            }
          }
          },
          function error (e) {
            console.log('Error - ramos-by-provider', e);
          })
        .catch(function (error) {
          console.log('Error - ramos-by-provider - catch', error);
        });          
      }

    };

    $scope.changeRamo = function() {
      $scope.dataToSave.ramo = order.form.ramo.id;
      order.defaults.subramos = order.form.ramo.subramo_ramo;
      if($localStorage.orderFormCotizacion){
        order.defaults.subramos.forEach(function(subram){
          if (subram.subramo_name == $localStorage.orderFormCotizacion.subramo){
            order.form.subramo = subram;
            // console.log();
          }
        })
        order.defaults.formInfo = {
          code: order.form.subramo.subramo_code,
          name: order.form.subramo.subramo_name
        };
        if ($localStorage.orderFormCotizacion && $localStorage.orderFormCotizacion.auto) {
          try{
            var auto = JSON.parse($localStorage.orderFormCotizacion.auto.replaceAll('\'','"'));
            if(auto && auto.usage){
              auto.usage = parseInt(auto.usage)
            }
            order.subforms.auto = auto;
            order.form.state_circulation = auto.state_circulation;
          } catch(err){console.log('errrrrrrrr',err)}
        }
        // if (order.form.ramo.ramo_code == 3 && order.form.subramo.subramo_code == 9){
        //   if ($localStorage.orderFormCotizacion && $localStorage.orderFormCotizacion.auto) {
        //     var auto = JSON.parse($localStorage.orderFormCotizacion.auto.replaceAll('\'','"'))
        //     order.subforms.auto = auto;
        //     order.form.state_circulation = auto.state_circulation;                
        //   }
        // }

        if (order.form.ramo.ramo_code == 3 && order.form.subramo.subramo_code != 9){
          if ($localStorage.orderFormCotizacion && $localStorage.orderFormCotizacion.danios) {
            var danios = JSON.parse($localStorage.orderFormCotizacion.danios.replaceAll('\'','"'))
            order.subforms.damage = danios;
          }
        }

        if (order.form.subramo.subramo_code == 9){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.auto.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
            if (order.subforms.auto.policy_type['name'] == 'Auto'){
              order.types.forEach(function(tipo){
                if (tipo.id == order.subforms.auto.policy_type['id']){
                  order.subforms.auto.policy_type = tipo;
                }
              })
            }
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 1){
          // console.log('dfffffff',order.subforms)
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.life.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 7){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 6){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 8){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 10){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 11){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 13){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 12){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 5){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 14){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.form.subramo.subramo_code == 31){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.damage.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        if (order.defaults.formInfo.code == 2 || order.defaults.formInfo.code == 3 || order.defaults.formInfo.code == 4){
          try{
            var tipo = JSON.parse($localStorage.orderFormCotizacion.tipo.replaceAll('\'','"'));
            order.subforms.disease.policy_type = {'name': tipo['descr'], 'id': tipo['value']};
          } catch(err){}
        }
        
        $scope.changeSubramo();
      }
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

      // order.form.paquete = '';
      // $scope.dataToSave.paquete = null;
      if ($localStorage) {
      }
      try {
        $scope.cargandoPaquetes=true;
        $http.post(url.IP+ 'paquetes-data-by-subramo/',
          {'ramo': order.form.ramo.id, 'subramo':order.form.subramo.id,'provider':order.form.aseguradora.id })
        .then(
          function success (response) {
            $scope.cargandoPaquetes=false;
            order.defaults.packages = [];
            if(response.data.length) {
              order.defaults.packages = response.data;
              if (order.defaults.packages && order.defaults.packages.length > 0) {  
                // Usage example
                if(order.form.paquete || ($scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data.cobertura)){
                  var result = $scope.getMostSimilarPackage($scope.read_pdf.data.cobertura.toLowerCase(), order.defaults.packages);
                  if(result){
                    order.form.paquete=result;
                  }
                  if (!order.form.paquete || Object.keys(order.form.paquete).length === 0) {
                    order.form.paquete = order.defaults.packages[0];
                  }
                  $scope.changePackage(order.form.paquete)
                }
              }
              if ($localStorage) {
              }
            }

          },
          function error (e) {
            $scope.cargandoPaquetes=false;
            console.log('Error - paquetes-data-by-subramo', e);
            order.defaults.packages = [];
          }
        ).catch(function (error) {
          $scope.cargandoPaquetes=false;
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

            // if(order.defaults.comisiones){
            //   if(!order.defaults.comisiones.length) {  
            //      SweetAlert.swal({
            //         title: 'Error',
            //         text: "Debe tener al menos una comisión capturada para la clave seleccionada",
            //         type: "error",
            //         showCancelButton: false,
            //         confirmButtonColor: "#DD6B55",
            //         confirmButtonText: "Aceptar",
            //         closeOnConfirm: true
            //     }, function(isConfirm) {
            //         if (isConfirm) {
                      
            //         }
            //     });
            //   }
            // }

            if(order.defaults.comisiones.length == 1){
              order.form.comision = order.defaults.comisiones[0];
              $scope.selectComision(order.form.comision);
            }
          } else {
            // SweetAlert.swal({
            //         title: 'Error',
            //         text: "Debe tener al menos una comisión capturada para la clave seleccionada",
            //         type: "error",
            //         showCancelButton: false,
            //         confirmButtonColor: "#DD6B55",
            //         confirmButtonText: "Aceptar",
            //         closeOnConfirm: true
            //     }, function(isConfirm) {
            //         if (isConfirm) {
                      
            //         }
            //     });
          }
        }
        if (order.form.subramo.subramo_name == 'Vida' || order.form.subramo.subramo_name == 'Funerarios') {
          if(order && order.subforms && order.subforms.life && order.subforms.life.aseguradosList  && order.subforms.life.aseguradosList.length ==0){
            order.options.life.asegurados.add();
          }

          if(order.form.subramo.subramo_name == 'Funerarios'){
            order.subforms.life.beneficiariesList.splice(0, 1);
          }
        }
      } catch (err){}
    };

    // get Package more similar
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
    // Find best matching package name
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
    $scope.changeProvider = function(sub_ramo, provider) {
      if(!provider){
          $scope.subramos = []
          $scope.ramos = []
          sub_ramo.ramos = $scope.fake_ramos;
          return
      }
    }
    
    $scope.changeRamoV = function(sub_ramo) {
      if (!sub_ramo.ramo){
          $scope.subramos = []
          sub_ramo.sub_ramos = []
          return
      }
    }

    $scope.changePackage = function(param) { 
      $scope.yaseestableciopaquete=false;
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

        if($scope.read_pdf){     
          $scope.paqueteSelected = false;
          $scope.coberturasPackagePdf = []
          // if($scope.read_pdf.data.cobertura=='' || $scope.read_pdf.data.cobertura==undefined){
          //   $scope.read_pdf.data.cobertura='AMPLIA'
          // }   
          
          if($scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data['Primas y coberturas']){ 
            for (i in $scope.read_pdf.data['Primas y coberturas']) {
              if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
                if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
                  $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
                }
                if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
                  $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
                }
                var it ={}
                it['coverage_name'] = i
                it['url'] = slug(i) + '-' + (order.form.paquete .id || 'pkg') + '-' + ($scope.coberturasPackagePdf.length + 1);
                it['package'] = order.form.paquete .id
                it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
                it['deductible_coverage']=[{'deductible':0}]
                it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
                it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
                it['sums_coverage']=[{'sum_insured':0}]
                it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
                if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
                  it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
                }
                if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
                  it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
                }
                $scope.coberturasPackagePdf.push(it)
                order.defaults.coverages=$scope.coberturasPackagePdf
                $localStorage['defaults'] = order.defaults
                order.form.paquete = order.form.paquete ; 
              }
            }
            order.coverageInPolicy_policy = order.defaults.coverages;
          }
          // if($scope.read_pdf.data['Primas y coberturas']){
          //     $scope.paqueteSelected = true;
          //     $scope.dataToSave.paquete = order.form.paquete.id;
          //     for (i in $scope.read_pdf.data['Primas y coberturas']) {

          //         if ($scope.read_pdf.data['Primas y coberturas'][i].hasOwnProperty('Deducible')) {
          //           if($scope.read_pdf.data['Primas y coberturas'][i]['Deducible'] =='nan'){
          //             $scope.read_pdf.data['Primas y coberturas'][i]['Deducible']='0'
          //           }
          //           if($scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada'] =='nan'){
          //             $scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']='0'
          //           }
          //           var it ={}
          //           it['coverage_name'] = i
          //           it['url'] = i
          //           it['package'] = order.form.paquete.id
          //           it['deductibleInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']}
          //           it['deductible_coverage']=[{'deductible':0}]
          //           it['deductible_coverage'][0]['deductible'] =$scope.read_pdf.data['Primas y coberturas'][i]['Deducible']
          //           it['sumInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']}
          //           it['sums_coverage']=[{'sum_insured':0}]
          //           it['sums_coverage'][0]['sum_insured'] =$scope.read_pdf.data['Primas y coberturas'][i]['Suma asegurada']
          //           if($scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']){
          //             it['coinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Coaseguro']}
          //           }
          //           if($scope.read_pdf.data['Primas y coberturas'][i]['Tope']){
          //             it['topeCoinsuranceInPolicy']={'value':$scope.read_pdf.data['Primas y coberturas'][i]['Tope']}
          //           }
          //           $scope.coberturasPackagePdf.push(it)
          //           order.defaults.coverages=$scope.coberturasPackagePdf
          //           $localStorage['defaults'] = order.defaults
          //           order.form.paquete = order.form.paquete; 

          //       }
          //     }
          //     order.coverageInPolicy_policy = order.defaults.coverages;
          //     $scope.saveLocalstorange()
          //   }
        }
      }
      $scope.saveLocalstorange();
    };

    $scope.contractorSelection = function (parValue) {
      if (order.form.contratante.address_contractor) {
        order.defaults.address = order.form.contratante.address_contractor;
        $scope.dataToSave.contractor = order.form.contratante.id;
        $scope.dataToSave.address = order.form.contratante.address_contractor[0].id;
      }
      if(order.form.contratante.id) {
        $scope.phoneStatus = true;
        $scope.emailStatus = true;
        $('.phonenumber').prop('disabled', true);
      } else {
        $('.phonenumber').removeAttr('disabled');
        $scope.phoneStatus = false;
        $scope.emailStatus = false;
      }

      try {
        if(order.defaults.address.length== 1){
            order.form.address = order.defaults.address[0];
        }
      } catch(exception){}
    };

    $scope.isReceiptAvailable = function(payment) {
      order.receipts = [];
      $scope.dataToSave.forma_de_pago = payment.value;

    };

    $scope.changeCurrency = function (){    
        // $scope.dataToSave.f_currency ? order.f_currency.f_currency_selected : 1;
      $scope.dataToSave.f_currency = order.f_currency.f_currency_selected;
      $scope.saveLocalstorange();
    };

    $scope.changeConducto = function (){    
        // $scope.dataToSave.f_currency ? order.f_currency.f_currency_selected : 1;
      $scope.dataToSave.conducto_de_pago = order.conducto_de_pago.conducto_de_pago_selected;
      $scope.saveLocalstorange();
    };

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
        payform: angular.copy(payform)
    };

    // console.log('ordenes.controller');
    var actualYear = new Date().getFullYear();
    var oldYear = actualYear - 80;
    for (var i = actualYear + 1; i >= oldYear; i--) {
        order.defaults.years.push(i);
    }

    $scope.percentageRange = function(input, index){
      if(input < 0){
        order.defaults.coverages[index].coinsuranceInPolicy.value = 0;
      };
      if(input > 100){
        order.defaults.coverages[index].coinsuranceInPolicy.value = 100;
      };
    }
     function normalizeDate(date) {
      var d = new Date(date);
      d.setHours(0, 0, 0, 0);  // Elimina hora, minutos, segundos, ms
      return d;
    }
    $scope.percentageRange1 = function(input, index){
      if(input < 0){
        order.defaults.coverages[index].topeCoinsuranceInPolicy.value = 0;
      };
      if(input > 100){
        order.defaults.coverages[index].topeCoinsuranceInPolicy.value = 100;
      };
    }

      order.save = {
          createOTAndPreparePolicy: function() {
              if(!validate()){return;}
              if (order.subforms.life.aseguradosList.length == 0 && order.defaults.formInfo.code == 1) {
                l.stop();
                SweetAlert.swal("Error", MESSAGES.ERROR.ONEASEGURADOLIFE, "error")
                return;
              }
              // if (order.subforms.life.beneficiariesList.length === 0 && order.defaults.formInfo.code === 1) {
              //   $scope.enproceso=false;
              //   l.stop();
              //   SweetAlert.swal("Error", MESSAGES.ERROR.ONEBENEFICIARY, "error")
              //   return;
              // } 
              if (!order.form.payment || order.form.payment == '') {
                  SweetAlert.swal("Error", MESSAGES.ERROR.SELPAY, "error")
                  // toaster.warning('Debe seleccionar forma de pago.')
              } else {
                  if (helpers.beneficiariesPercentageGreaterThanZero(order.subforms.life.beneficiariesList)) {
                      SweetAlert.swal("Error", MESSAGES.ERROR.GREATERTHAN100, "info")
                      // toaster.warning('No puede tener un porcentaje mayor a 100%.');
                      // return
                  } else {
                      var form = angular.copy(order.form);
                      form = getFormData(form);
                      form.forma_de_pago = form.forma_de_pago.value;
                      if (order.form.contratante.address_contractor) {
                        order.defaults.address = order.form.contratante.address_contractor;
                        form.contractor = order.form.contratante.id;
                        form.address = order.form.contratante.address_contractor[0].id;
                      }
                      insuranceService.createInsurance(form)
                          .then(function(res) {
                              uploadFiles(res.id);
                              order.defaults.policyUrl = res.url;

                              order.show.ot = false;
                              SweetAlert.swal("Error", MESSAGES.OK.NEWOT, "error")
                              // toaster.success(MESSAGES.OK.NEWOT);
                              setTimeout(function() {
                                  $state.go('polizas.info', {polizaId: res.id});
                              }, 1000);
                              var code = order.defaults.formInfo.code;
                              if (code === 9) {

                                  if (!order.subforms.auto)
                                      order.subforms.auto = {
                                          brand: ''
                                      };
                                  var auto = angular.copy(order.subforms.auto);
                                  auto.sub_branch = res.subramo ? res.subramo : null;
                                  auto.policy = res.url;

                                  var submitObject = {
                                      code: code,
                                      insurance: res,
                                      form: auto
                                  }
                                  formService.createForm(submitObject);
                              } else if (code === 1 || code == 30) {
                                  // Personal information
                                  // var life = order.subforms.life;
                                  var beneficiaries = order.subforms.life.beneficiariesList;
                                  var asegurados_life = order.subforms.life.aseguradosList;
                                  // var personal = {
                                  //     first_name: life.first_name ? life.first_name : '',
                                  //     last_name: life.last_name ? life.last_name : '',
                                  //     second_last_name: life.second_last_name ? life.second_last_name : '',
                                  //     birthdate: life.birthdate,
                                  //     sex: life.sex ? life.sex : '',
                                  //     full_name: life.first_name + ' ' + life.last_name + ' ' + life.second_last_name
                                  // };
                                  var personal = {
                                      first_name: asegurados_life[0].first_name ? asegurados_life[0].first_name : '',
                                      last_name: asegurados_life[0].last_name ? asegurados_life[0].last_name : '',
                                      second_last_name: asegurados_life[0].second_last_name ? asegurados_life[0].second_last_name : '',
                                      birthdate: asegurados_life[0].birthdate,
                                      antiguedad: asegurados_life[0].antiguedad ? asegurados_life[0].antiguedad : null,
                                      sex: asegurados_life[0].sex ? asegurados_life[0].sex : '',
                                      full_name: asegurados_life[0].first_name + ' ' + asegurados_life[0].last_name + ' ' + asegurados_life[0].second_last_name
                                  };

                                  var submitObject = {
                                      code: code,
                                      personal: personal,
                                      relationships: beneficiaries,
                                      insurance: res,
                                      smoker: order.subforms.asegurados_life[0].smoker,
                                      asegurados_life: asegurados_life                          
                                      // smoker: order.subforms.life.smoker
                                  }

                                  formService.createForm(submitObject).then(function(creat) {
                                        $scope.personal_1 = creat.data                                          
                                      });
                                  asegurados_life.forEach(function(element, index) {
                                    var fn = elemet.first_name + ' ' + elemet.last_name + ' ' + elemet.second_last_name
                                    if ((personal.first_name != element.first_name) && (personal.last_name != element.last_name) && (personal.full_name != fn)) {
                                      element.first_name = elemet.first_name ? elemet.first_name : '',
                                      element.last_name = elemet.last_name ? elemet.last_name : '',
                                      element.second_last_name = elemet.second_last_name ? elemet.second_last_name : '',
                                      element.birthdate = element.birthdate ? new Date(element.birthdate) : null;
                                      element.antiguedad = element.antiguedad ? new Date(element.antiguedad) : null;
                                      element.sex = elemet.sex ? elemet.sex : '',
                                      element.full_name = elemet.first_name + ' ' + elemet.last_name + ' ' + elemet.second_last_name                                    
                                      element.smoker = element.smoker ? true : false;
                                      element.full_name = element.first_name + ' ' + element.last_name + ' ' + element.second_last_name;
                                      generalService.createPersonalInformation(element)
                                      .then(function(response) {
                                          var lifeModel = {
                                              sub_branch: res.subramo,
                                              policy: res.url,
                                              personal: response.data.url,
                                              smoker: element.smoker ? element.smoker : false
                                          };
                                      });
                                    }
                                      
                                  });
                                  // generalService.createPersonalInformation(personal)
                                  //     .then(function(response) {
                                  //       console.log('fffffff',response)
                                  //         var lifeModel = {
                                  //             sub_branch: res.subramo,
                                  //             policy: res.url,
                                  //             personal: response.data.url,
                                  //             smoker: order.subforms.life.smoker ? order.subforms.life.smoker : false
                                  //         };
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
                                      antiguedad: disease.antiguedad ? disease.antiguedad :null,
                                      sex: disease.sex ? disease.sex : '',
                                      full_name: disease.first_name + ' ' + disease.last_name + ' ' + disease.second_last_name
                                  };
                                  var submitObject = {
                                      code: code,
                                      personal: personal,
                                      relationships: relationships,
                                      coinsurance: disease.coinsurance,
                                      insurance: res
                                  }

                                  formService.createForm(submitObject);
                              } else if (code === 5 || code === 6 || code === 7 || code === 8 || code === 10 || code === 11 || code === 12 || code === 13 || code === 14) {
                                  var damage = order.subforms.damage;
                                  var type = helpers.damageType(parseInt(code));

                                  damage.sub_branch = res.subramo;
                                  damage.damage_type = type;
                                  damage.policy = res.url;

                                  var submitObject = {
                                      insurance: res,
                                      code: code,
                                      form: damage
                                  }

                                  formService.createForm(submitObject);
                              }

                              if (order.defaults.coverages.length > 0) {
                                  helpers.createCoverages(order.defaults.coverages, res);
                              }
                              if ($uibModalInstance) {
                                $uibModalInstance.close(200);
                              }
                              setTimeout(function() {
                                  SweetAlert.swal("Error", MESSAGES.OK.NEWOT, "error")
                                  // toaster.success(MESSAGES.OK.NEWOT);
                                  $state.go('polizas.info', {polizaId: res.id});
                              }, 1000);
                          });

                  }
              }
          },
          closeModal: function() {
            $localStorage['datos_pdf'] = {}
            // $localStorage.removeItem('datos_pdf');
            $localStorage.dataFile={};
            if ($uibModalInstance) {
              $uibModalInstance.dismiss('cancel');
            } else {
              $state.go('polizas.table')
            }
          },
          closeAndReturn: function() {
            setTimeout(function() {
              SweetAlert.swal("Error", MESSAGES.OK.NEWOT, "error")
              // toaster.success(MESSAGES.OK.NEWOT);
              // $state.go('polizas.table');
            }, 1000);
          },
          saveInsurance: function(param,folio) { 
            $scope.enproceso=true;
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            $scope.receitps_backup = angular.copy($scope.dataToSave.recibos_poliza);
            $scope.return = false;
            $scope.param = param;
            $scope.contractorToSave = {};
            $scope.dataToSave.vendor = order.form.vendor;
            var promises_array = [];
            $scope.dataToSave.parent = null;
            $scope.arrayCoverage = order.coverageInPolicy_policy;
            order.coverageInPolicy_policy = [];
            if(order.form.from_pdf){
              $scope.dataToSave.from_pdf = order.form.from_pdf
            }else{
              $scope.dataToSave.from_pdf = false
            }

            if(order.form.hospital_level){
              $scope.dataToSave.hospital_level = order.form.hospital_level;
            }
            if(order.form.tabulator){
              $scope.dataToSave.tabulator = order.form.tabulator;
            }
            if(order.form.aseguradora){
              $scope.dataToSave.aseguradora = order.form.aseguradora.id ? order.form.aseguradora.id : order.form.aseguradora ? order.form.aseguradora : order.form.aseguradora;
            }
            if (!(order.form && order.form.ramo)) {
              $scope.enproceso=false;
              l.stop();
              SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
              return;
            }
            if (!(order.form && order.form.subramo)) {
              $scope.enproceso=false;
              l.stop();
              SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
              return;
            }
            if(!order.form.ramo){
              $scope.enproceso=false;
              l.stop();
              SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
              return;
            }
            if(!order.form.subramo){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
              return;
            }
            if(!order.form.subramo){
              if(!order.form.subramo.url){
                l.stop();
                $scope.enproceso=false;
                SweetAlert.swal("Oops...", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
                return;
              }
            }
            if(!order.form.clave){
              SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
              return;
            }else{
              $scope.clavenoexistente = false;
              if (order.defaults.claves) {
                order.defaults.claves.forEach(function(item) {
                  if (order.form.clave.id == item.id) {
                    $scope.clavenoexistente = true;
                    $scope.dataToSave.clave = order.form.clave.id ? order.form.clave.id : order.form.clave ? order.form.clave : order.form.clave;
                  }
                });
              }else{
                console.log('---sin claves--*')
                $scope.return = true;
              }
              if (!$scope.clavenoexistente) {
                $scope.return = true;
                SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
                return;
              }                
            }
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            order.form.internal_number = $scope.internal_number
            l.start();
            $scope.enproceso=true;
            
            if (param == 'poliza'){
              if ($scope.dataToSave) {
                $scope.dataToSave.descuento = parseFloat($scope.dataToSave.poliza.descuento).toFixed(2);
                $scope.dataToSave.comision_derecho_percent = parseFloat($scope.dataToSave.poliza.comision_derecho_percent).toFixed(2);
                $scope.dataToSave.comision_rpf_percent = parseFloat($scope.dataToSave.poliza.comision_rpf_percent).toFixed(2);
                
              }
              $scope.dataToSave.recibos_poliza.forEach(function(item) {
                item.conducto_de_pago = $scope.dataToSave.conducto_de_pago;
                item.iva= item.iva ? parseFloat(item.iva).toFixed(2) :0;
                item.prima_neta= item.prima_neta ? parseFloat(item.prima_neta).toFixed(2) :0;
                item.prima_total= item.prima_total ? parseFloat(item.prima_total).toFixed(2) :0;
                item.derecho= item.derecho ? parseFloat(item.derecho).toFixed(2) :0;
                item.rpf= item.rpf ? parseFloat(item.rpf).toFixed(2) :0;
                item.comision= item.comision ? parseFloat(item.comision).toFixed(2) :0;
                item.descuento= item.descuento ? parseFloat(item.descuento).toFixed(2) :0;   
              });
            }
            if (folio) {
              $scope.num_folio = folio;
              $scope.dataToSave.folio = folio
            }else{                
            }           

            if(order.form.contratante.email || order.form.contratante.phone_number){
              if(order.form.contratante.phone_number){
                $scope.contractorToSave.phone_number = order.form.contratante.phone_number;
              } 
              if(order.form.contratante.email){
                $scope.contractorToSave.email = order.form.contratante.email
              }
            }

            if($scope.contractorToSave.email || $scope.contractorToSave.phone_number){
              $http.patch(order.form.contratante.value.url, $scope.contractorToSave).then(function(data){

              });
            }
            order.form.comision_percent = $scope.dataToSave.comision_percent;
            if(order.form.ceder_comision){
              $scope.dataToSave.comision_percent = order.form.comision_percent;
              $scope.dataToSave.udi = String(parseFloat(order.form.comision_percent));

              if(!$scope.dataToSave.comision_currency) {
                var comision_ = parseFloat(angular.copy(order.form.comision_percent)) / 100;
                if ($scope.dataToSave.p_neta) {
                  $scope.dataToSave.comision = parseFloat($scope.dataToSave.comision).toFixed(2);
                }else{
                  $scope.dataToSave.comision = 0.00;                  
                }
              } else {
                // $scope.dataToSave.comision = $scope.dataToSave.comision_currency;
              }
              $scope.dataToSave.comision = parseFloat($scope.dataToSave.comision).toFixed(2);

              // calculando de nuevo la comision

            } else {
              if((order.form.comision_percent && $scope.dataToSave.p_neta) || ($scope.dataToSave.comision_percent && $scope.dataToSave.p_neta)) {
                if(!$scope.dataToSave.comision_percent){
                  $scope.dataToSave.comision_percent = order.form.comision_percent;
                  $scope.dataToSave.udi = order.form.comision_percent;
                  if(order.poliza) {
                    $scope.dataToSave.ud
                  }
                }
                var percent_ = parseFloat($scope.dataToSave.comision_percent) / 100;
                $scope.dataToSave.comision = parseFloat($scope.dataToSave.comision);
                $scope.dataToSave.comision = $scope.dataToSave.comision.toFixed(2)

              } else {
                $scope.dataToSave.ceder_comision = 0;
                $scope.dataToSave.comision = 0;
                $scope.dataToSave.udi = 0;
                $scope.dataToSave.comision_percent = $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0;
              }
            }

            if(order.form.udi) {
              if(order.form.ceder_comision) {
                $scope.dataToSave.udi = String(parseFloat(order.form.comision_percent));
              } else {
                $scope.dataToSave.udi = order.form.udi;
              }
            } 

            if(order.form.comision_percent) {
              $scope.dataToSave.comision_percent = order.form.comision_percent;
            } else {
              if(order.form.comision) {
                $scope.dataToSave.comision_percent = order.form.comision.comission;
              } else {
                $scope.dataToSave.comision_percent = $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0;
              }
            }
            if($scope.dataToSave && $scope.dataToSave.prima_comision && parseFloat($scope.dataToSave.comision_percent) !=parseFloat($scope.dataToSave.prima_comision)){
              $scope.dataToSave.comision_percent = $scope.dataToSave.prima_comision ? $scope.dataToSave.prima_comision : $scope.dataToSave.comision_percent ? $scope.dataToSave.comision_percent : 0;
            }
            if(order.form.contratante.value){
              if(order.form.contratante.value.address_contractor) {
                $scope.dataToSave.contractor = order.form.contratante.value.id; 
                if(!order.form.address){
                  $scope.dataToSave.address = order.form.contratante.value.address_contractor[0].id;
                }else{
                  $scope.dataToSave.address = order.form.address.id;
                }
              }
            }

            if($scope.arrayCoverage){
              if($scope.arrayCoverage.length > 0){
                for(var i=0; i<$scope.arrayCoverage.length; i++){
                  if($scope.arrayCoverage[i].deductibleInPolicy || $scope.arrayCoverage[i].sumInPolicy){
                    try{
                      $scope.arrayCoverage[i]['package'] = order.form.paquete.id
                    }catch(e){
                      $scope.arrayCoverage[i]['package'] = order.form.paquete.id
                    }
                    order.coverageInPolicy_policy.push($scope.arrayCoverage[i]);
                  }
                  // else{
                  //   $scope.flagCoverage = true;
                  // }
                }
              }
            }
            // TEL / EMAIL - CONTRATANTE
            if(order.form.contratante) {
              var data =  {};

              if(order.form.contratante.email && !order.form.contratante.value.email) {
                data.email = order.form.contratante.email;
              } 
              if(order.form.contratante.phone_number && !order.form.contratante.value.phone_number) {
                data.phone_number = order.form.contratante.phone_number;
              }
            }

            $scope.dataToSave.business_line = order.form.business_line ? order.form.business_line.id : 0;

            $scope.dataToSave.celula = order.form.celula ? order.form.celula.id : null;
            $scope.dataToSave.groupinglevel = order.form.subsubgrouping ? order.form.subsubgrouping.id : order.form.subgrouping ? order.form.subgrouping.id :order.form.grouping_level ? order.form.grouping_level.id : null;

            var start_of_validity = new Date($scope.dataToSave.start_of_validity).setHours(12,0,0,0);
            var end_of_validity = new Date($scope.dataToSave.end_of_validity).setHours(11,59,59,0);
            try{
              if(($scope.dataToSave.end_of_validity).toString().length <= 10){
                $scope.dataToSave.end_of_validity = formatDateToISO(order.form.endingDate,2);
              }
              if(($scope.dataToSave.start_of_validity).toString().length <= 10){
                $scope.dataToSave.start_of_validity = formatDateToISO(order.form.startDate,1);
              }   
            }catch(use_error){
              console.log('eroror de fechas vigencia',use_error)
            }    
            $scope.dataToSave.internal_number = $scope.internal_number;
            $scope.enproceso=true;
            if(param == 'poliza') {              
              var l = Ladda.create( document.querySelector( '.ladda-button' ) );
              l.start();
              $scope.enproceso=true;
              var today = normalizeDate(new Date());
              var start = normalizeDate($scope.dataToSave.start_of_validity);
              var end = normalizeDate($scope.dataToSave.end_of_validity);
              if (today < start) {
                var status = 10;
              } else if (today > end) {
                var status = 13;

                if (
                  $scope.orgName === 'ancora' &&
                  ($scope.dataToSave.is_renewable == 1 || order.renewal.is_renewable == 1)
                ) {
                  $scope.dataToSave.renewed_status = 2;
                }

              } else {
                var status = 14;
              }
            } else if (param == 'ot') {                
              var status = 1;
              if ($scope.dataToSave.folio) {
                promises_array.push(
                  helpers.existOT($scope.dataToSave.folio)
                    .then(checkPromise)
                    .catch(function(error) {
                      // --- Manejo de errores sin romper el flujo ---
                      if (error && error.status === 404) {
                        console.warn('Folio no encontrado (404):', $scope.dataToSave.folio);
                        // Devolvemos algo válido para continuar
                        return { exists: false, folio: $scope.dataToSave.folio };
                      } else {
                        console.error('Error en existOT:', error);
                        // Devuelve algo neutro para que Promise.all no se rompa
                        return { error: true, message: 'Error validando folio', detail: error };
                      }
                    })
                );
              }
            }
            if(param == 'ot') {
              $scope.dataToSave.recibos_poliza = [];
              $scope.dataToSave.p_total = 0;
            }

            structure(status);

            $scope.dataToSave.identifier = order.form.identifier ? order.form.identifier : ''
            if(!$scope.dataToSave.identifier) {
              if (order.form.identifier.length == 0 || !order.form.identifier){
                $scope.identifier();  
              }
              $scope.dataToSave.identifier = order.form.identifier;
              $scope.dataToSave.internal_number = $scope.internal_number
            }
            function checkPromise(obj) {
              return obj;
            }
            $q.all(promises_array)
            .then(function(val) {
              if($scope.dataToSave.forma_de_pago){
                $scope.dataToSave.p_total = (parseFloat($scope.dataToSave.p_total)).toFixed(2);
                if($scope.dataToSave.recibos_poliza){
                  var primas_suma = 0.0;

                  $scope.dataToSave.recibos_poliza.forEach(function(receipt) {
                    receipt.iva= receipt.iva ? parseFloat(receipt.iva).toFixed(2) :0;
                    receipt.prima_neta= receipt.prima_neta ? parseFloat(receipt.prima_neta).toFixed(2) :0;
                    receipt.prima_total= receipt.prima_total ? parseFloat(receipt.prima_total).toFixed(2) :0;
                    receipt.derecho= receipt.derecho ? parseFloat(receipt.derecho).toFixed(2) :0;
                    receipt.rpf= receipt.rpf ? parseFloat(receipt.rpf).toFixed(2) :0;
                    receipt.comision= receipt.comision ? parseFloat(receipt.comision).toFixed(2) :0;
                    receipt.descuento= receipt.descuento ? parseFloat(receipt.descuento).toFixed(2) :0;
                    primas_suma = primas_suma + receipt.prima_total;
                    var start_date = new Date(toDate(receipt.fecha_inicio)).setHours(12,0,0,0);
                    var end_date = new Date(toDate(receipt.fecha_fin)).setHours(11,59,59,0)

                    // receipt.endingDate = new Date(end_date);
                    receipt.fecha_fin = new Date(end_date);
                    // receipt.startDate = new Date(start_date);
                    receipt.fecha_inicio = new Date(start_date);

                    if(receipt.vencimiento) {
                      var vencimiento = new Date(toDate(receipt.vencimiento)).setHours(11.59,59,0);
                      receipt.vencimiento = new Date(vencimiento);
                    } else {
                      receipt.vencimiento = null;
                    }
                  });
                }

                if(order.coverageInPolicy_policy.length == 0){
                  $scope.dataToSave.coverageInPolicy_policy = [{
                    coverage_name: "",
                    priority: 0,
                    deductible: "",
                    package: order.form.paquete.id,
                    prima: "",
                    sum_insured: ""
                  }];
                }

                if(!$scope.dataToSave.vendor){
                  $scope.dataToSave.vendor = "";
                }

                if(order.form.responsable){
                  $scope.dataToSave.responsable = order.form.responsable;
                }
                if(order.form.ejecutivo_cobranza){
                  $scope.dataToSave.collection_executive = order.form.ejecutivo_cobranza;
                }
                if(order.form.sucursal){
                  $scope.dataToSave.sucursal = order.form.sucursal;
                }else{
                  $scope.dataToSave.sucursal = '';
                }
                if ($scope.referenciadores.length > 0) {
                  if ($scope.referenciadores[0].referenciador) {
                    $scope.dataToSave.vendor = "";
                    if ($scope.referenciadores.length == 1) {
                      if ($scope.referenciadores[0].referenciador) {
                        $scope.referenciador.forEach(function(i){
                          if (i.url == $scope.referenciadores[0].referenciador) {
                            i.user_info.info_vendedor.forEach(function(o){
                              o.vendedor_subramos.forEach(function(u){
                                if (u.subramo == $scope.dataToSave.subramo) {
                                  $scope.referenciadores[0].comision_vendedor = parseFloat(u.comision).toFixed(2)
                                }
                              })
                            })
                          }
                        })
                      }
                    }
                  }
                }
                $scope.dataToSave.ramo = order.form.ramo.id;
                // $scope.dataToSave.state_circulation = order.form.state_circulation ? order.form.state_circulation.state : '';
                $scope.dataToSave.state_circulation = order.form.state_circulation ? order.form.state_circulation.state : '';
                if (order.subforms) {
                  if (order.subforms.auto) {
                    if (order.subforms.auto.state_circulation) {
                      $scope.dataToSave.state_circulation = order.subforms.auto.state_circulation ? order.subforms.auto.state_circulation.state : ''
                    }
                  }
                }
                if($rootScope.from_task && $rootScope.task_associated && $rootScope.task_associated.url){
                  $scope.dataToSave.from_task=$rootScope.from_task
                  $scope.dataToSave.task_associated=$rootScope.task_associated.id
                }
                try{
                  if($localStorage && $localStorage.orderFormCotizacion){
                    var cotizacion = $localStorage.orderFormCotizacion;
                    $scope.dataToSave.cotizacion_asociada=cotizacion.id;
                  }
                }catch(y){}
                // polizas/evaluar-vigencia-json/
                $http.post(url.IP +'validaciones/evaluar-vigencia-json/', angular.copy($scope.dataToSave))
                .then(function(resp){
                  if (resp.data && resp.data.warning) {
                    try{
                      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                      l.start();
                      l.stop();
                    }catch(u){}
                    $scope.enproceso=false;
                    swal({
                      title: "⚠️ Inconsistencia en fechas de vigencia",
                      text:
                        "Atención\n\n" +
                        "El inicio de vigencia de la póliza no coincide con el inicio de vigencia del recibo 1.\n\n" +
                        "Favor de revisar y corregir las fechas antes de continuar.",
                      icon: "warning",
                      button: "Entendido"
                    });
                    return;
                  }
                  // guardar normal...
                  try{
                    var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                    l.start();
                  }catch(u){}
                  $http.post(url.IP +'certificados/', angular.copy($scope.dataToSave))
                  .then(function success (data){
                    $scope.idPolicy = data.data.id;
                    $scope.poliza_creada = data.data;
                    $localStorage.orderFormCotizacion={};
                    if($rootScope.from_task && $rootScope.task_associated && $rootScope.task_associated.url){
                      $http.patch($rootScope.task_associated.url,{'ot_model':1, 'ot_id_reference':$scope.idPolicy});
                    }
                    if (window.Pace) {
                      Pace.stop();
                      Pace.bar.finish();
                    }
                    try{
                      var serial = order && order.subforms && order.subforms.auto && order.subforms.auto.serial ? normalizeVIN(order.subforms.auto.serial): null;
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
                            console.log('-------2-VIN_INVALID_OIQ_SAVED-----',response_x)
                          });
                        }
                      }
                    }catch(u){}
                    $localStorage['datos_pdf'] = {};
                    // $localStorage.removeItem('datos_pdf');
                    $localStorage['primas'] = {};
                    $localStorage['defaults'] = {};
                    if ($scope.dataToSave.delete_receitps) {
                      if ($scope.dataToSave.delete_receitps.length > 0) {
                        var params_del_rec = {
                          'model': 1,
                          'event': "DELETE",
                          'associated_id': data.data.id,
                          'identifier': 'elimino recibos al crear la póliza (vigencia menor de un año)',
                        }
                        dataFactory.post('send-log/', params_del_rec).then(function success(response_x) {
                          console.log('-------2-recs_del-----',response_x)
                        });
                      }
                    }
                    // varios referenciadores
                    for(var i=0; i<$scope.referenciadores.length; i++){
                      
                      $scope.referenciadores[i].policy = data.data.url;
                    }
                    $scope.ref_policy = $scope.referenciadores;   
                    $scope.ref_policy.forEach(function(rfpol){  
                      if(rfpol.referenciador){
                        var ref2 = {}
                        ref2.referenciador = rfpol.referenciador
                        ref2.comision_vendedor = rfpol.comision_vendedor ? parseFloat(rfpol.comision_vendedor ).toFixed(2): 0
                        ref2.policy = data.data.url
                        dataFactory.post('referenciadores-policy/',ref2)
                        .then(
                          function success(request){
                          },
                          function error(error) {
                            l.stop()
                            return
                            console.log(error);
                          })
                        .catch(function(e){
                          console.log(e);
                        });
                      }
                    })     
                    
                    // varios referenciadores
                    if(data.status == 201) {
                      $scope.flagCoverage = false
                      order.form.from_pdf=false;
                      if($localStorage.dataFile && $scope.read_pdf){
                        try{
                          $localStorage.dataFile.append('owner',data.data.id)
                          try{
                            $http.patch(data.data.url,{'from_pdf':true});
                          }catch(u){}
                          var xhr_file = new XMLHttpRequest();
                          // xhr_file.open("POST", url.SERVICE_PDF);
                          xhr_file.open("POST", url.IP+'polizas/' + data.data.id + '/archivos/?org='+$scope.orgName);
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
                            }
                          }
                        }catch(efile){
                          console.log('nose cargo el pdf leído',efile)
                        }
                      }
                      if($scope.countFile > 0){
                        uploadFiles(data.data.id);
                      } else{
                        if(!$scope.flagCoverage){
                          if(param == 'poliza'){
                            $localStorage.dataFile={};
                            //Send Email
                            var contrac = {}
                            if(data.data.contractor){
                              var contrac = {}
                              if (order.form.contratante.type_person ==1){
                                contrac.type = 'fisicas'
                              }else if (order.form.contratante.type_person ==2){
                                contrac.type = 'morales'
                              }
                              contrac.contratanteId = data.data.contractor
                              // contrac.url = data.data.url
                            }                         
                            SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWPOLICY, "success");
                            try{l.stop();}catch(i){}
                            $scope.enproceso=false;
                          }
                          if(param == 'ot'){
                            //Send Email
                            var contrac = {}
                            if(data.data.contractor){
                              var contrac = {}
                              if (order.form.contratante.type_person ==1){
                                contrac.type = 'fisicas'
                              }else if (order.form.contratante.type_person ==2){
                                contrac.type = 'morales'
                              }
                              contrac.contratanteId = data.data.contractor
                              // contrac.url = data.data.url
                            }
                            try{l.stop();}catch(i){}
                            $scope.enproceso=false;
                            SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWOT, "success");
                          }
                          // $scope.sendEmail_Emision();
                          $state.go('polizas.info', {polizaId: $scope.idPolicy});
                        }
                        else{
                          try{l.stop();}catch(i){}
                          $scope.enproceso=false;
                          if(param == 'poliza'){
                            // $scope.sendEmail_Emision();
                            SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWPOLICY, "success");
                          }
                          if(param == 'ot'){
                            SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWOT, "success");
                          }
                            // $scope.sendEmail_Emision();
                          $state.go('polizas.info', {polizaId: $scope.idPolicy});
                        }
                      }
                    }
                    else{
                      // AQUI VAN LOS ERRORES DEL BACK
                      if(data.data.ramo){
                        try{l.stop();}catch(i){}
                        $scope.enproceso=false;
                        SweetAlert.swal("Error", "Vuelva a seleccionar el Ramo y, válide la información.", "error");
                        // $scope.formatReceiptsAtError();
                      }
                      if(data.data.subramo){
                        try{l.stop();}catch(i){}
                        $scope.enproceso=false;
                        SweetAlert.swal("Error", "Vuelva a seleccionar el Subramo y, válide la información.", "error");
                        // $scope.formatReceiptsAtError();
                      }
                      if(data.data.p_total){
                        try{l.stop();}catch(i){}
                        $scope.enproceso=false;
                        SweetAlert.swal("Error", MESSAGES.ERROR.PRIMATOTAL, "error");
                        // $scope.formatReceiptsAtError();
                      }
                      if(data.data.recibos_poliza && param != 'ot'){
                        try{l.stop();}catch(i){}
                        $scope.enproceso=false;
                        SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSREQUIRED, "error");
                        return
                        // $scope.formatReceiptsAtError();
                      }
                      if(data.data.forma_de_pago){
                        try{l.stop();}catch(i){}
                        $scope.enproceso=false;
                        SweetAlert.swal("Error", MESSAGES.ERROR.SELPAY, "error");
                        return
                        // $scope.formatReceiptsAtError();
                      }
                      if(data.data.poliza_number){
                        try{l.stop();}catch(i){}
                        $scope.enproceso=false;
                        SweetAlert.swal("Error", MESSAGES.ERROR.POLIZAMAXLENGTH, "error");
                        // $scope.formatReceiptsAtError();
                      }
                      if(data.data.folio){
                        try{l.stop();}catch(i){}
                        $scope.enproceso=false;
                        SweetAlert.swal("Error", MESSAGES.ERROR.FOLIOMAXLENGTH, "error");
                        $scope.formatReceiptsAtError();
                      }
                      if(data.data.automobiles_policy){
                        if(data.data.automobiles_policy.policy_type){
                          try{l.stop();}catch(i){}
                          $scope.enproceso=false;
                          SweetAlert.swal("Error", MESSAGES.ERROR.OPTIONNOTVALID, "error");
                          return
                        }
                      }
                      if(data.data.life_policy){
                        if(data.data.life_policy){
                          if (order.subforms.life.aseguradosList.length === 0 && order.defaults.formInfo.code === 1) {
                            $scope.enproceso=false;
                            try{l.stop();}catch(i){}
                            SweetAlert.swal("Error", MESSAGES.ERROR.ONEASEGURADOLIFE, "error")
                            return;
                          }
                        }
                      }

                      $scope.formatReceiptsAtError();
                    }

                    },
                    function error(err) {
                      $scope.enproceso = false;
                      console.log('ERROR ', err);
                      var e = err && err.data ? err.data : {};
                      if (e.ramo) {
                        try{l.stop();}catch(i){}
                        $scope.enproceso = false;
                        // marca el campo como tocado para mostrar estilos de error
                        // if (order.form && order.form.ramo) order.form.ramo.$setTouched();
                        SweetAlert.swal("Error", e.ramo[0] || "El ramo es obligatorio.", "error");
                        return;
                      }
                      if (e.subramo) {
                        try{l.stop();}catch(i){}
                        $scope.enproceso = false;
                        // if (order.form && order.form.subramo) order.form.subramo.$setTouched();
                        SweetAlert.swal("Error", e.subramo[0] || "El subramo es obligatorio.", "error");
                        return;
                      }
                      // genérico
                      // SweetAlert.swal("Error", "Revisa los datos enviados.", "error");
                    })
                  .catch(function(err) {
                    console.log('ooooooooo function catch',err)
                    $scope.enproceso=false;
                    try{
                      try{l.stop();}catch(i){}
                    }catch(u){}
                    console.log('ERROR - CATCH', err);
                  });
                });
              }
            }, function error(err) {
              console.log('ooooooooo function error',err)
              $scope.enproceso=false;
              try{
                try{l.stop();}catch(i){}
              }catch(u){}
              console.log('err', err);
            }).catch(function(e) {
                console.log('ooooooooo function catch *',e)
                try{l.stop();}catch(i){}
                $scope.enproceso=false;
            });
          }
      };

      function isString(x) {
        return Object.prototype.toString.call(x) === "[object String]"
      }

      $scope.flag_ot = false;
      function fixDate(date) {
        if (typeof date === 'string' && date.indexOf('T') !== -1) {
            var dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
                var day = ('0' + dateObj.getUTCDate()).slice(-2);
                var month = ('0' + (dateObj.getUTCMonth() + 1)).slice(-2);
                var year = dateObj.getUTCFullYear();
                return day + '/' + month + '/' + year;
            }
        } else if (date instanceof Date && !isNaN(date.getTime())) {
            var day = ('0' + date.getDate()).slice(-2);
            var month = ('0' + (date.getMonth() + 1)).slice(-2);
            var year = date.getFullYear();
            return day + '/' + month + '/' + year;
        }
        return date;
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

      $scope.validatePolicy = function(param){
        SweetAlert.swal({
          title: "Advertencia",
          text: "Se esta validando la información capturada, espere unos segundos.",
          type: "warning",
          showCancelButton: false,
          confirmButtonColor: "#23c1f1ff",
          confirmButtonText: "Ok",
          closeOnConfirm: true,
          closeOnCancel: true
        },
        function(isConfirm){
          if (isConfirm) {
            console.log('continuar',isConfirm)
          }
        }); 
        $scope.enproceso=true;
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();
        if (param != 'ot' && !order.form.canCreate){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", 'OPRIMA EL BOTÓN CALCULAR Y GENERAR RECIBOS', "error");
          return 
        }
        
        var date1 = datesFactory.toDate((order.form.startDate));
        var date2 = datesFactory.toDate((order.form.endingDate));

        var since = toDate(order.form.startDate).getTime();
        var until = toDate(order.form.endingDate).getTime();

        $scope.arrayCoverage = order.coverageInPolicy_policy;
        $scope.count_coverage = 0;
        if(param == 'poliza'){
          if(!order.form.poliza){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Error", MESSAGES.ERROR.POLICYNOREQUIRED, "error");
            return;
          }
        }
        if(!order.form.contratante.val){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORCONTRACTOR, "error");
          return;
        }
        if(!order.form.address){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.ADDRESS, "error");
          return;
        }
        if(!order.form.contratante.email && !order.form.contratante.phone_number){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORWITHOUTEMAIL, "error");
          return;
        }
        if(order.form.contratante.email){
          if(!validateEmail(order.form.contratante.email)){
            l.stop();
            $scope.enproceso=false;
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
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATERANGE, "error");
          return;
        }
        if(!order.form.aseguradora){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.PROVIDERREQUIRED, "error");
          return;
        }
        $scope.referenciadores_copy =  $scope.referenciadores.filter(function(item){
          return item && item.referenciador && isString(item.referenciador);
        })
        if(order.permiso_comision_no_obligatoria ==false){
          if(($scope.referenciadores && $scope.referenciadores.length ==0) || ($scope.referenciadores_copy && $scope.referenciadores_copy.length ==0)){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Error", "Seleccione al menos un referenciador", "error");
            return              
          }else{
            console.log('continuar',$scope.referenciadores,order.permiso_comision_no_obligatoria,$scope.referenciadores_copy)
          }
        }

        // else{
        //   console.log('------permiso no obliga-----',$scope.referenciadores,order.permiso_comision_no_obligatoria,$scope.referenciadores_copy)
        // }
        if(!order.form.ramo){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
          return;
        }
        if(!order.form.subramo){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
          return;
        }
        if(!order.form.clave){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
          return;
        }else{
          $scope.clavenoexistente = false;
          if (order.defaults.claves) {
            order.defaults.claves.forEach(function(item) {
              if (order.form.clave.id == item.id) {
                $scope.clavenoexistente = true;
              }
            });
          }else{
            console.log('---sin claves--*')
            l.stop();
            $scope.enproceso=false;
          }
          if (!$scope.clavenoexistente) {
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
            return;
          } 
        }
        if(!order.form.ramo){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
          return;
        }
        if(!order.form.subramo){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
          return;
        }
        if(order.form.ramo.ramo_code == 1){
          if(order.form.subramo.subramo_code != 30){
            if(order.subforms.life.policy_type){
              if (order.subforms.life.policy_type.id) {
                console.log('si',order.subforms.life.policy_type)
              }else{
                if(!order.subforms.life.policy_type || order.subforms.life.policy_type.id){
                  var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                  l.start();
                  l.stop();
                  $scope.enproceso=false;
                  SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                  return;                  
                }
              }
            }else{
              var l = Ladda.create( document.querySelector( '.ladda-button' ) );
              l.start();
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Selecciona un tipo.", "error");
              return; 
            }
          }
        }
        if(order.form.ramo.ramo_code == 2){
          if(order.subforms.disease.policy_type){
            if (order.subforms.disease.policy_type.id) {
              console.log('si',order.subforms.disease.policy_type)
            }else{
              if(!order.subforms.disease.policy_type || order.subforms.disease.policy_type.id){                
                var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                l.start();
                l.stop();
                $scope.enproceso=false;
                SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                return;                  
              }
            }
          }else{            
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Error", "Selecciona un tipo.", "error");
            return; 
          }
        }
        if(order.form.ramo.ramo_code == 3){
          if(order.form.subramo.subramo_code == 9){
            if(order.subforms.auto.policy_type){
              if (order.subforms.auto.policy_type.id) {
                console.log('si',order.subforms.auto.policy_type)
              }else{
                if(!order.subforms.auto.policy_type || order.subforms.auto.policy_type.id){
                  var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                  l.start();
                  l.stop();
                  $scope.enproceso=false;
                  SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                  return;                  
                }
              }
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
                    var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                    l.start();
                    l.stop();
                    $scope.enproceso=false;
                    showVinInvalidCharsAlert(serial, function () {
                      // El usuario dio OK: solo marcamos que ya vio la alerta
                      st.userAcknowledged = true;
                      // ✅ NO continuar con el proceso
                      // Regresar/permitir corrección:
                      $scope.enproceso = false;
                      // si usas Ladda, deténlo aquí
                      // l.stop();
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

            }else{              
              var l = Ladda.create( document.querySelector( '.ladda-button' ) );
              l.start();
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Selecciona un tipo.", "error");
              return; 
            }
          }else{
            if(order.subforms.damage.policy_type){
              if (order.subforms.damage.policy_type.id) {
                console.log('si',order.subforms.damage.policy_type)
              }else{
                if(!order.subforms.damage.policy_type || order.subforms.damage.policy_type.id){
                  l.stop();
                  $scope.enproceso=false;
                  SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                  return;                  
                }
              }
            }else{
              
              var l = Ladda.create( document.querySelector( '.ladda-button' ) );
              l.start();
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Selecciona un tipo.", "error");
              return; 
            }
            if(!order.subforms.damage.insured_item || order.subforms.damage.insured_item == undefined || order.subforms.damage.insured_item == "" || order.subforms.damage.insured_item == ''){
              
              var l = Ladda.create( document.querySelector( '.ladda-button' ) );
              l.start();
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Agregue un Bien asegurado.", "error");
              return;                  
            }
          }
        }
        if(!order.form.payment){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORPAYFORM, "error");
          return;
        }
        
        $scope.referenciadores_copy =  $scope.referenciadores.filter(function(item){
          return item && item.referenciador && isString(item.referenciador);
        })
        
        if(!order.acc_referenciador_obligatorio && $scope.referenciadores_copy.length <= 0){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", "Seleccione al menos un referenciador", "error");
          return;
        }
        
        // l.stop();
        // SweetAlert.swal("Succes", "Si pasa", "success");
        // return;

        if(!order.form.ramo){
          if(!order.form.ramo.url){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Oops...",MESSAGES.ERROR.RAMOREQUIRED, "error");
            return;
          }
        }
        if(!order.form.subramo){
          if(!order.form.subramo.url){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Oops...", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
            return;
          }
        }
        if (order.form.ramo) {
          if(!order.form.subramo){
            if(!order.form.subramo.url){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Oops...", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
              return;
            }
          }
          if(order.form.ramo.ramo_code == 1){
            if(order.form.subramo.subramo_code != 30){
              if(order.subforms.life.policy_type){
                if (order.subforms.life.policy_type.id) {
                }else{
                  if(!order.subforms.life.policy_type || order.subforms.life.policy_type.id){
                    
                    var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                    l.start();
                    l.stop();
                    $scope.enproceso=false;
                    SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                    return;                  
                  }
                }
              }else{
                l.stop();
                $scope.enproceso=false;
                SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                return; 
              }
            }
          }
          if(order.form.ramo.ramo_code == 2){
            if(order.subforms.disease.policy_type){
              if (order.subforms.disease.policy_type.id) {
              }else{
                if(!order.subforms.disease.policy_type || order.subforms.disease.policy_type.id){                  
                  var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                  l.start();
                  l.stop();
                  $scope.enproceso=false;
                  SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                  return;                  
                }
              }
            }else{
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Selecciona un tipo.", "error");
              return; 
            }
          }
          if(order.form.ramo.ramo_code == 3){
            if(order.form.subramo.subramo_code == 9){
              if(order.subforms.auto.policy_type){
                if (order.subforms.auto.policy_type.id) {
                }else{
                  if(!order.subforms.auto.policy_type || order.subforms.auto.policy_type.id){
                    l.stop();
                    $scope.enproceso=false;
                    SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                    return;                  
                  }
                }
              }else{                
                var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                l.start();
                l.stop();
                $scope.enproceso=false;
                SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                return; 
              }
            }else{
              if(order.subforms.damage.policy_type){
                if (order.subforms.damage.policy_type.id) {
                }else{
                  if(!order.subforms.damage.policy_type || order.subforms.damage.policy_type.id){                           
                    var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                    l.start();
                    l.stop();
                    $scope.enproceso=false;
                    SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                    return;                  
                  }
                }
              }else{                           
                var l = Ladda.create( document.querySelector( '.ladda-button' ) );
                l.start();
                l.stop();
                $scope.enproceso=false;
                SweetAlert.swal("Error", "Selecciona un tipo.", "error");
                return; 
              }
            }              
          }
        }
        if(!order.form.clave){
          if(!order.form.clave.url){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Oops...",MESSAGES.ERROR.CLAVE, "error");
            return;
          }
        }

        if(!order.form.ramo){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
          return;
        }
        if(!order.form.subramo){
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
          return;
        }
        if(!order.form.contratante){
          if(!order.form.contratante.url){
            l.stop();
            SweetAlert.swal("Oops...", MESSAGES.ERROR.CONTRACTORERROR, "error");
            return;
          }
        }
        if(!order.form.address){
          if(!order.form.address.url){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Oops...",MESSAGES.ERROR.ADDRESS, "error");
            return;
          }
        }
        if(!order.form.aseguradora){
          if(!order.form.aseguradora.url){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Oops...", MESSAGES.ERROR.PROVIDERREQUIRED, "error");
            return;
          }
        }
        if(param == 'poliza'){
          if(!order.form.paquete){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Error", "Elige un paquete", "error");
            return;
          }
          if(order.form.subramo.subramo_code == 1){
            $scope.flag_try = false;
            if(order.subforms.life.beneficiariesList){
              try {
                order.subforms.life.beneficiariesList.forEach(function(beneficiary, index){
                  var idx = index + 1
                  if(beneficiary.person == 1){
                    if(!beneficiary.first_name){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega el nombre del beneficiario  #" + idx, "error");
                      throw new Error();
                    }
                    if(!beneficiary.last_name){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega el apellido paterno del beneficiario  #" + idx, "error");
                      throw new Error();
                    }
                    if(!beneficiary.birthdate){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega la fecha de nacimiento del beneficiario  #" + idx, "error");
                      throw new Error();
                    }
                    if(!beneficiary.sex){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega el sexo del beneficiario  #" + idx, "error");
                      throw new Error();
                    }
                    if(!beneficiary.percentage){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega el porcentaje del beneficiario  #" + idx, "error");
                      throw new Error();
                    }
                  }else if (beneficiary.person == 2) {
                    if (!beneficiary.j_name) {
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega la razón social del beneficiario  #" + idx, "error")
                      throw new Error();
                    }
                    if (!beneficiary.rfc) {
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega el RFC del beneficiario  #" + idx, "error")
                      throw new Error();
                    }
                  }
                });
              } catch(e){ console.log('dddddddddddddddddd',e)}

            }
            if(order.subforms.life.aseguradosList.length == 0){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error","Agrega un asegurado", "error")
              return;
            }
            if(order.subforms.life.aseguradosList){
              try {
                order.subforms.life.aseguradosList.forEach(function(aseg, index){
                  var idx = index + 1
                    if(!aseg.first_name){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega el nombre del asegurado  #" + idx, "error");
                      throw new Error();
                    }
                    if(!aseg.last_name){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega el apellido paterno del asegurado  #" + idx, "error");
                      throw new Error();
                    }
                    if(!aseg.birthdate){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega la fecha de nacimiento del asegurado  #" + idx, "error");
                      throw new Error();
                    }
                    if(!aseg.sex){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega el sexo del asegurado  #" + idx, "error");
                      throw new Error();
                    }
                    if(!aseg.smoker){
                      l.stop();
                      $scope.enproceso=false;
                      $scope.flag_try = true;
                      SweetAlert.swal("Error","Agrega si es fumador o no el asegurado  #" + idx, "error");
                      throw new Error();
                    }
                });
              } catch(e){}
            }
            if ($scope.flag_try == true){
              l.stop();
              $scope.enproceso=false;
              return;
            }
          }
          if(order.form.subramo.subramo_code == 3){
            if(!order.subforms.disease.first_name){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Agregue el nombre del titular", "error");
              return;
            }
            if(!order.subforms.disease.last_name){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Agregue el apellido paterno del titular", "error");
              return;
            }
            if(!order.subforms.disease.birthdate){
              console.log('-order',order.subforms.disease)
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Agregue la fecha de nacimiento del titular", "error");
              return;
            }
            if(!order.subforms.disease.sex){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Elige el sexo del titular", "error");
              return;
            }
            if(order.subforms.disease.relationshipList){
              try {
                order.subforms.disease.relationshipList.forEach(function(dependent, index){
                  var idx = index + 1
                  if(!dependent.first_name){
                    l.stop();
                    $scope.enproceso=false;
                    SweetAlert.swal("Error","Agrega el nombre del dependiente  #" + idx, "error");
                    throw new Error();
                  }
                  if(!dependent.last_name){
                    l.stop();
                    $scope.enproceso=false;
                    SweetAlert.swal("Error","Agrega el apellido paterno del dependiente  #" + idx, "error");
                    throw new Error();
                  }
                  if(!dependent.relationship){
                    l.stop();
                    $scope.enproceso=false;
                    SweetAlert.swal("Error","Elige el parentesco del dependiente  #" + idx, "error");
                    throw new Error();
                  }
                  if(!dependent.birthdate){
                    l.stop();
                    $scope.enproceso=false;
                    SweetAlert.swal("Error","Agrega la fecha de nacimiento del dependiente  #" + idx, "error");
                    throw new Error();
                  }
                  if(!dependent.sex){
                    l.stop();
                    $scope.enproceso=false;
                    SweetAlert.swal("Error","Agrega el sexo del dependiente  #" + idx, "error");
                    throw new Error();
                  }
                });
              } catch(e){
                $scope.enproceso=false;
              }
            }
          }
          if(order.form.subramo.subramo_code == 7){
            if(!order.subforms.damage.insured_item || order.subforms.damage.insured_item == undefined || order.subforms.damage.insured_item == "" || order.subforms.damage.insured_item == ''){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Agrega el bien asegurado", "error");
              return;
            }
          }
          if(order.form.subramo.subramo_code == 9){
            if(!order.subforms.auto.brand){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Agrega la marca del automóvil", "error");
              return;
            }
            if(!order.subforms.auto.year){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Elige el año del automóvil", "error");
              return;
            }
            if(!order.subforms.auto.version){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Agrega la versión del automóvil", "error");
              return;
            }
            if(!order.subforms.auto.serial){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Agrega la serie del automóvil", "error");
              return;
            }
            if(!order.subforms.auto.usage){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Elige el uso del automóvil", "error");
              return;
            }
            if(!order.subforms.auto.service){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", "Agrega el servicio del automóvil", "error");
              return;

            }
          }
          if($scope.arrayCoverage){
            for(var i = 0; i < $scope.arrayCoverage.length; i++){
              if($scope.arrayCoverage[i].deductibleInPolicy || $scope.arrayCoverage[i].sumInPolicy){
                try{
                  $scope.arrayCoverage[i]['package'] = order.form.paquete.id
                }catch(e){
                  $scope.arrayCoverage[i]['package'] = order.form.paquete.id
                }
                $scope.count_coverage++;
              }
              if(i+1 == $scope.arrayCoverage.length){
                // if($scope.count_coverage == 0){
                //   l.stop();
                //   SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGESREQUIRED, "error");
                //   return;
                // }
              }
            };
          }
          // if($scope.arrayCoverage.length == 0){
          //   l.stop();
          //   SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGESREQUIRED, "error");
          //   return;
          // }

          if(!$scope.dataToSave.recibos_poliza){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRECEIPTS, "error");
            return;
          }
          else{
            var flag_save = false;
            $scope.dataToSave.recibos_poliza.forEach(function(receipt){                  
              receipt.iva= receipt.iva ? parseFloat(receipt.iva).toFixed(2) :0;
              receipt.prima_neta= receipt.prima_neta ? parseFloat(receipt.prima_neta).toFixed(2) :0;
              receipt.prima_total= receipt.prima_total ? parseFloat(receipt.prima_total).toFixed(2) :0;
              receipt.derecho= receipt.derecho ? parseFloat(receipt.derecho).toFixed(2) :0;
              receipt.rpf= receipt.rpf ? parseFloat(receipt.rpf).toFixed(2) :0;
              receipt.comision= receipt.comision ? parseFloat(receipt.comision).toFixed(2) :0;
              receipt.descuento= receipt.descuento ? parseFloat(receipt.descuento).toFixed(2) :0;         
              receipt.fecha_inicio = fixDate(receipt.fecha_inicio);
              receipt.fecha_fin = fixDate(receipt.fecha_fin);
              if(receipt.fecha_inicio && typeof receipt.fecha_inicio === 'string' && receipt.fecha_inicio.indexOf('T') !== -1) {
                  var dateObjInicio = new Date(receipt.fecha_inicio);
          
                  if(!isNaN(dateObjInicio.getTime())) {
                      var day = ('0' + dateObjInicio.getDate()).slice(-2);
                      var month = ('0' + (dateObjInicio.getMonth() + 1)).slice(-2);
                      var year = dateObjInicio.getFullYear();
                      receipt.fecha_inicio = day + '/' + month + '/' + year;
                  }
              }
          
              if(receipt.fecha_fin && typeof receipt.fecha_fin === 'string' && receipt.fecha_fin.indexOf('T') !== -1) {
                  var dateObjFin = new Date(receipt.fecha_fin);
          
                  if(!isNaN(dateObjFin.getTime())) {
                      var day = ('0' + dateObjFin.getDate()).slice(-2);
                      var month = ('0' + (dateObjFin.getMonth() + 1)).slice(-2);
                      var year = dateObjFin.getFullYear();
                      receipt.fecha_fin = day + '/' + month + '/' + year;
                  }
              }
          
              if(!receipt.fecha_inicio || !receipt.fecha_fin){
                  l.stop();
                  $scope.enproceso=false;
                  flag_save = true;
                  SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSDATES, "error");
                  return;
              }
            });
            if (flag_save == true){
              l.stop();
              $scope.enproceso=false;
              return;
            }
            // var sinceReceipt = toDate($scope.dataToSave.recibos_poliza[0].fecha_inicio).getTime();
            // var untilReceipt = toDate($scope.dataToSave.recibos_poliza[$scope.dataToSave.recibos_poliza.length - 1].fecha_fin).getTime();
            var primerFecha = $scope.dataToSave.recibos_poliza[0].fecha_inicio;
            var ultimaFecha = $scope.dataToSave.recibos_poliza[$scope.dataToSave.recibos_poliza.length - 1].fecha_fin;

            // validar claramente luego de arreglarlas
            if (!primerFecha || !ultimaFecha || 
                typeof primerFecha !== 'string' || primerFecha.indexOf('/') === -1 ||
                typeof ultimaFecha !== 'string' || ultimaFecha.indexOf('/') === -1) {
                l.stop();
                $scope.enproceso=false;
                SweetAlert.swal("Error", "Formato de fechas inválido\n Genere recibos de nuevo.", "error");
                return;
            }

            var sinceReceipt = toDate(primerFecha).getTime();
            var untilReceipt = toDate(ultimaFecha).getTime();
          }
          if(since != sinceReceipt){
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATESOUT, "error");
            return;
          }
          var date_since = new Date(since);
          var date_until = new Date(until);
          var validity = parseInt(date_until.getFullYear()) - parseInt(date_since.getFullYear());
          if(until != untilReceipt){              
            if(validity == 1) {
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("ERROR", MESSAGES.ERROR.DATESOUT, "error");
              return;
            } else if(validity > 1) {
              if($scope.arrayCoverage.length == $scope.count_coverage){
                if (!order.form.folio) { 
                  if (order.form.contratante.value.type_person == 'Moral') {
                    var data = {
                      id_contractor: order.form.contratante.value.id,
                      type_person: 2,
                    }
                    $scope.type_person_selected = 2;
                  }else{
                    var data = {
                      id_contractor: order.form.contratante.value.id,
                      type_person: 1,
                    }
                    $scope.type_person_selected = 1;
                  }                             
                  
                  dataFactory.post('count-policy-by-contractor/', data)
                  .then(function success(response) {
                    if (response.status == 200) {
                      var num = parseInt(response.data.total_policies) + 1
                      if($scope.type_person_selected == 1){
                        var num_folio = order.form.contratante.value.last_name.charAt(0)+'_'+order.form.contratante.value.first_name.charAt(0)+'_'+ num;                    
                        order.save.saveInsurance(param,num_folio); 
                      }else{
                        var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+ num;                    
                        order.save.saveInsurance(param,num_folio); 
                      }  
                    }
                  })  
                }else{
                  order.save.saveInsurance(param);  
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
                    $scope.enproceso=false;
                    if (!order.form.folio) { 
                      if (order.form.contratante.value.type_person == 'Moral') {
                        var data = {
                          id_contractor: order.form.contratante.value.id,
                          type_person: 2,
                        }
                        $scope.type_person_selected = 2;
                      }else{
                        var data = {
                          id_contractor: order.form.contratante.value.id,
                          type_person: 1,
                        }
                        $scope.type_person_selected = 1;
                      }                             
                      
                      dataFactory.post('count-policy-by-contractor/', data)
                      .then(function success(response) {
                        if (response.status == 200) {
                          var num = parseInt(response.data.total_policies) + 1
                          if($scope.type_person_selected == 1){
                            var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+ num;                    
                            order.save.saveInsurance(param,num_folio); 
                          }else{
                            var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+ num;                    
                            order.save.saveInsurance(param,num_folio); 
                          }  
                        }
                      }) 
                    }else{
                      order.save.saveInsurance(param);  
                    }
                  }
                  else{
                    l.stop();
                    $scope.enproceso=false;
                  }
                });
              }
            }
          }
          else {   
            if($scope.arrayCoverage.length == $scope.count_coverage){
              l.stop();
              $scope.enproceso=false;
              if (!order.form.folio) { 
                if (order.form.contratante.value.type_person == 'Moral' || order.form.contratante.value.type_person == 2) {
                  var data = {
                    id_contractor: order.form.contratante.value.id,
                    type_person: 2,
                  }
                  $scope.type_person_selected = 2;
                }else{
                  var data = {
                    id_contractor: order.form.contratante.value.id,
                    type_person: 1,
                  }
                  $scope.type_person_selected = 1;
                }                             
                
                dataFactory.post('count-policy-by-contractor/', data)
                .then(function success(response) {
                  if (response.status == 200) {
                    var num = parseInt(response.data.total_policies) + 1
                    if($scope.type_person_selected == 1){
                      var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+order.form.contratante.value.full_name.charAt(2)+'_'+ num;                    
                      order.save.saveInsurance(param,num_folio); 
                    }else{
                      var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+ num;                    
                      order.save.saveInsurance(param,num_folio); 
                    }  
                  }
                })  
              }else{
                order.save.saveInsurance(param);  
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
                  $scope.enproceso=false;
                  if (!order.form.folio) { 
                    if (order.form.contratante.value.type_person == 'Moral' || order.form.contratante.value.type_person == 2) {
                      var data = {
                        id_contractor: order.form.contratante.value.id,
                        type_person: 2,
                      }
                      $scope.type_person_selected = 2;
                    }else{
                      var data = {
                        id_contractor: order.form.contratante.value.id,
                        type_person: 1,
                      }
                      $scope.type_person_selected = 1;
                    }                             
                    
                    dataFactory.post('count-policy-by-contractor/', data)
                    .then(function success(response) {
                      if (response.status == 200) {
                        var num = parseInt(response.data.total_policies) + 1
                        if($scope.type_person_selected == 1){
                          var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+ num;                    
                          order.save.saveInsurance(param,num_folio); 
                        }else{
                          var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+ num;                    
                          order.save.saveInsurance(param,num_folio); 
                        }  
                      }
                    }) 
                  }else{
                    order.save.saveInsurance(param);  
                  }
                }
                else{
                  $scope.enproceso=false;
                  l.stop();
                }
              });
            }
          }
        }
        else{
          $scope.enproceso=false;
          l.stop();
          if(!order.form.paquete){
            $scope.enproceso=false;
            l.stop();
            SweetAlert.swal("Error", "Elige un paquete", "error");
            return;
          }
          if(order.defaults.coverages.length == 0) {
            try{
              flag_save = false;
            }catch(e){
              var flag_save = false;
            }
            l.stop();
            $scope.enproceso=false;
            SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGESREQUIRED, "error");
            return;
          }
          if (!order.form.folio) { 
            if (order.form.contratante.value.type_person == 'Moral' || order.form.contratante.value.type_person == 2) {
              var data = {
                id_contractor: order.form.contratante.value.id,
                type_person: 2,
              }
              $scope.type_person_selected = 2;
            }else{
              var data = {
                id_contractor: order.form.contratante.value.id,
                type_person: 1,
              }
              $scope.type_person_selected = 1;
            }                             
            
            dataFactory.post('count-policy-by-contractor/', data)
            .then(function success(response) {
              if (response.status == 200) {
                try{
                  var fullName = order.form.contratante.value.full_name || "";
                  var cleanName = fullName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                  var num = parseInt(response.data.total_policies) + 1;

                  var num_folio = ($scope.type_person_selected == 1)
                    ? cleanName.charAt(0) + '_' + cleanName.charAt(2) + '_' + num
                    : cleanName.charAt(0) + '_' + num;

                  num_folio = encodeURIComponent(num_folio); // ← asegura que no rompa la URL

                  order.save.saveInsurance(param, num_folio);  
                }catch(e){console.log('error to generate folio',e)}
              }
            })  
          }else{
            if(!$scope.flag_ot){
              $scope.flag_ot = true;
            }else{
              return;
            }
            order.save.saveInsurance(param);  
          }
        }
      };

      $scope.changeAgrupacion = function(data){
        $scope.sub_asignaciones = data.subgrupos;
        $scope.sub_subasignaciones = [];
        if($scope.info_sub){
          if($scope.info_sub.subgrouping){
            $scope.sub_asignaciones.forEach(function(item){
              if(item.description == $scope.info_sub.subgrouping){
                order.form.subgrouping = item;
                $scope.changeSubagrupacion(item);
              }
            });
          }
        }else{
          $scope.sub_asignaciones = data.subgrupos;
        }
        $scope.saveLocalstorange();
      };

      $scope.changeSubagrupacion = function(data){
        if(data){
          if(data.subsubgrupos){
            $scope.sub_subasignaciones = data.subsubgrupos;
            if($scope.info_sub){ 
              if($scope.info_sub.subsubgrouping){
                $scope.sub_subasignaciones.forEach(function(item){
                  if(item.description == $scope.info_sub.subsubgrouping){
                    order.form.subsubgrouping = item;
                  }
                });
              }
            }else{
              $scope.sub_subasignaciones = data.subsubgrupos;
            }
          }else{
            $scope.sub_subasignaciones = data.subsubgrupos;
          }
        }else{
          $scope.sub_subasignaciones = [];
        }
      };

      $scope.flagCoverage = false;

      $scope.formatReceipts = function() {

        $scope.dataToSave.recibos_poliza =  $scope.receitps_backup;
 
        // console.log('formatReceipts');

        // $scope.dataToSave.recibos_poliza.forEach(function(rec) {

        //   var start = datesFactory.toDate(rec.startDate);
        //   var end = datesFactory.toDate(rec.endingDate);

        //   console.log('start', start);
        //   console.log('end', end);
        //   // console.log('end', end);
        //   // console.log('---------------------');

        //   rec.endingDate = end;
        //   // rec.fecha_fin = end;
        //   rec.startDate = start;
        //   // rec.fecha_inicio = start;

        //   console.log('startDate', rec.startDate);

        //   console.log(rec);

        // });

        // order.receipts = $scope.dataToSave.recibos_poliza;

      };

      $scope.formatReceiptsAtError = function() {
        var primas_suma = 0.0;

        if($scope.dataToSave.receipts) {

          $scope.dataToSave.recibos_poliza.forEach(function(receipt) {
            receipt.iva= receipt.iva ? parseFloat(receipt.iva).toFixed(2) :0;
            receipt.prima_neta= receipt.prima_neta ? parseFloat(receipt.prima_neta).toFixed(2) :0;
            receipt.prima_total= receipt.prima_total ? parseFloat(receipt.prima_total).toFixed(2) :0;
            receipt.derecho= receipt.derecho ? parseFloat(receipt.derecho).toFixed(2) :0;
            receipt.rpf= receipt.rpf ? parseFloat(receipt.rpf).toFixed(2) :0;
            receipt.comision= receipt.comision ? parseFloat(receipt.comision).toFixed(2) :0;
            receipt.descuento= receipt.descuento ? parseFloat(receipt.descuento).toFixed(2) :0;   
            primas_suma = primas_suma + receipt.prima_total;
            var start_date = convertDate(receipt.startDate);
            var end_date = convertDate(receipt.endingDate);

            receipt.endingDate = end_date;
            receipt.fecha_fin = end_date;
            receipt.startDate = start_date;
            receipt.fecha_inicio = start_date;

            if(receipt.vencimiento) {
              var vencimiento = convertDate(receipt.vencimiento);
              receipt.vencimiento = vencimiento;
            } else {
              receipt.vencimiento = null;
            }

          });

          // order.receipts = $scope.dataToSave.recibos_poliza;
        } 
      };

       // Estructura
       $rootScope.numberPolicy = true;
       $scope.changeNoPoliza = function (noPoliza){
        $rootScope.poliza_n = noPoliza;
            if($rootScope.poliza_n == undefined){
              $rootScope.numberPolicy = true;
            }else{
              $rootScope.numberPolicy = false;
            }
       }
       $rootScope.folioPolicy = true;
       $scope.changeFolio = function (folio){
        $rootScope.poliza_f = folio;
            if($rootScope.poliza_f == undefined){
              $rootScope.folioPolicy = true;
            }else{
              $rootScope.folioPolicy = false;
            }
       }

       $scope.changeAdaptacion = function(param) {
         var param = param.replace(/,/g,"");
         var n = $scope.changeAdaptacion_(param);
         order.subforms.auto.mont_adjustment = n;
    //       return model;
        }
      $scope.changeMonto = function(param) {
           var param = param.replace(/,/g,"");
           var n = $scope.changeAdaptacion_(param);
           order.subforms.auto.mont_special_team = n;
      //       return model;
        }
    
      $scope.changeAdaptacion_= function(num)
      {
          num = num.toString().replace(/\$|\,/g,'');
          if(isNaN(num)) {
              num = "0";
          }
          var sign = (num == (num = Math.abs(num)));
          num = Math.floor(num*100+0.50000000001);
          var cents = num % 100;
          num = Math.floor(num/100).toString();
          if(cents < 10) {
              cents = "0" + cents;
          }
          for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++) {
              num = num.substring(0,num.length-(4*i+3))+','+num.substring(num.length-(4*i+3));
          }
          return (((sign)?'':'-') + '$' + num + '.' + cents);
      }
 
      function structure (parStatus) {
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start()
        $scope.enproceso=true;
        if (!order.form.payment || order.form.payment == '') {
          l.stop();
          $scope.enproceso=false;
          SweetAlert.swal("Error", MESSAGES.ERROR.SELPAY, "error")
          return
          // toaster.warning('Debe seleccionar forma de pago.')
        }
        $scope.dataToSave.forma_de_pago = order.form.payment;
        $scope.dataToSave.folio = order.form.folio ? order.form.folio : $scope.num_folio;
        if(order.show.ot == true){
          $scope.dataToSave.poliza_number = '';
        }else{
          $scope.dataToSave.poliza_number = order.form.poliza;            
        }
        $scope.dataToSave.endorsement = false;
        $scope.dataToSave.folio_endorsement = null;
        $scope.dataToSave.document_type = 1;
        $scope.dataToSave.old_policies = [];
        $scope.dataToSave.status = parStatus; // 14 para crear pliza // 1 para crear OT          
        $scope.dataToSave.internal_number =$scope.internal_number;
        // Defaults
        $scope.Validation = function (){
            // console.log('poliza_number',$rootScope.poliza_n);
            // console.log('folio_number',$rootScope.folio_n);
            if($rootScope.poliza_f == undefined){
              $rootScope.folioPolicy = true;
            }else{
              $rootScope.folioPolicy = false;
            }
            if($rootScope.poliza_n == undefined){
              $rootScope.numberPolicy = true;
            }else{
              $rootScope.numberPolicy = false;
            }
        }
        switch (order.form.subramo.subramo_code ) {
          case 1:
            // if (order.subforms.life.beneficiariesList.length === 0 && order.defaults.formInfo.code === 1) {
            //   l.stop();
            //   $scope.enproceso=false;
            //   SweetAlert.swal("Error", MESSAGES.ERROR.ONEBENEFICIARY, "error");
            //   // $scope.formatReceiptsAtError();
            //   $scope.formatReceipts();
            //   return;
            // }
            if (helpers.beneficiariesPercentageGreaterThanZero(order.subforms.life.beneficiariesList)) {
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", MESSAGES.ERROR.GREATERTHAN100, "error");
              // return;
            }

            if(order.form.subramo.subramo_code == 1) {
              var beneficiariesList = _.map(order.subforms.life.beneficiariesList, function (item, i) {
                return {
                  first_name: item.first_name ? item.first_name : "",
                  last_name: item.last_name ? item.last_name : "",
                  second_last_name: item.second_last_name ? item.second_last_name : "",
                  optional_relationship: item.optional_relationship ? item.optional_relationship : "",
                  birthdate: item.birthdate ? new Date(toDate(item.birthdate)) : new Date(),
                  antiguedad: item.antiguedad ? new Date(toDate(item.antiguedad)) : null,
                  sex : item.sex ? item.sex : "",
                  percentage: item.percentage ? parseFloat(item.percentage).toFixed(2) : 100,
                  person: item.person,
                  rfc: item.rfc ? item.rfc : "",
                  j_name: item.j_name ? item.j_name : ""
                };
              });
              var asegurados_1 = []
              var aseguradosList = _.map(order.subforms.life.aseguradosList, function (item, i) {
                if (i == 0) {
                  return {
                    first_name: item.first_name ? item.first_name : "",
                    last_name: item.last_name ? item.last_name : "",
                    second_last_name: item.second_last_name ? item.second_last_name : "",
                    birthdate: item.birthdate ? new Date(toDate(item.birthdate)) : new Date(),
                    antiguedad: item.antiguedad ? new Date(toDate(item.antiguedad)) : null,
                    sex : item.sex ? item.sex : "",
                    full_name: item.first_name + ' ' + item.last_name + ' ' + item.second_last_name,
                    smoker: item.smoker ? item.smoker : false,
                    policy_type: order.subforms.life.policy_type.id,
                  };
                }else{
                  asegurados_1.push(item)
                }
              });
              var asegurados_life = _.map(asegurados_1, function (plife, i) {
                  return {
                    first_name: plife.first_name ? plife.first_name : "",
                    last_name: plife.last_name ? plife.last_name : "",
                    second_last_name: plife.second_last_name ? plife.second_last_name : "",
                    birthdate: plife.birthdate ? new Date(toDate(plife.birthdate)) : new Date(),
                    antiguedad: plife.antiguedad ? new Date(toDate(plife.antiguedad)) : null,
                    sex : plife.sex ? plife.sex : "",
                    full_name: plife.first_name + ' ' + plife.last_name + ' ' + plife.second_last_name,
                    smoker: plife.smoker ? plife.smoker : false,
                    policy_type: order.subforms.life.policy_type.id,
                  };
                
              });
              $scope.dataToSave.life_policy =  [{
                personal: {
                  first_name: aseguradosList[0].first_name,
                  last_name: aseguradosList[0].last_name,
                  second_last_name: aseguradosList[0].second_last_name,
                  birthdate : (aseguradosList[0].birthdate),
                  antiguedad : (aseguradosList[0].antiguedad) ? (aseguradosList[0].antiguedad) : null,
                  sex: aseguradosList[0].sex,
                  full_name: aseguradosList[0].first_name + ' ' +aseguradosList[0].last_name + ' ' + aseguradosList[0].second_last_name,
                  smoker: aseguradosList[0].smoker ? aseguradosList[0].smoker : false,
                  policy_type: order.subforms.life.policy_type.id,
                },
                personal_life: asegurados_life,
                smoker: order.subforms.life.smoker,
                beneficiaries_life : beneficiariesList
              }];
            } else {
              var aseguradosList = _.map(order.subforms.life.aseguradosList, function (item, i) {
                
                return {
                  first_name: item.first_name ? item.first_name : "",
                  last_name: item.last_name ? item.last_name : "",
                  second_last_name: item.second_last_name ? item.second_last_name : "",
                  birthdate: item.birthdate ? new Date(toDate(item.birthdate)) : new Date(),
                  antiguedad: item.antiguedad ? new Date(toDate(item.antiguedad)) : null,
                  sex : item.sex ? item.sex : "",
                  full_name: item.first_name + ' ' + item.last_name + ' ' + item.second_last_name,
                  smoker: aseguradosList[0].smoker ? aseguradosList[0].smoker : false,
                  policy_type: order.subforms.life.policy_type.id,
                };
              });
              $scope.dataToSave.life_policy =  {
                // personal: {
                //   first_name: order.subforms.life.first_name,
                //   last_name: order.subforms.life.last_name,
                //   second_last_name : order.subforms.life.second_last_name,
                //   birthdate : new Date(toDate(order.subforms.life.birthdate)),
                //   sex: order.subforms.life.sex,
                //   full_name: order.subforms.life.first_name + ' ' + order.subforms.life.last_name + ' ' + order.subforms.life.second_last_name
                // },
                personal: aseguradosList,
                smoker:aseguradosList[0].smoker,
                beneficiaries_life : order.subforms.life.beneficiariesList
              };
            }

            $scope.dataToSave.automobiles_policy = new Array();
            $scope.dataToSave.damages_policy = new Array();
            $scope.dataToSave.accidents_policy = new Array();
            break;
          case 30:
            // if (order.subforms.life.beneficiariesList.length === 0 && order.defaults.formInfo.code === 30) {
            //   l.stop();
            //   SweetAlert.swal("Error", MESSAGES.ERROR.ONEBENEFICIARY, "error");
            //   // $scope.formatReceiptsAtError();
            //   $scope.formatReceipts();
            //   return;
            // }

            // if (helpers.beneficiariesPercentageGreaterThanZero(order.subforms.life.beneficiariesList)) {
            //   l.stop();
            //   SweetAlert.swal("Error", MESSAGES.ERROR.GREATERTHAN100, "error");
            //   return;
            // }

            if(order.form.subramo.subramo_code == 30) {
              var beneficiariesList = _.map(order.subforms.life.beneficiariesList, function (item, i) {
                return {
                  first_name: item.first_name ? item.first_name : "",
                  last_name: item.last_name ? item.last_name : "",
                  second_last_name: item.second_last_name ? item.second_last_name : "",
                  optional_relationship: item.optional_relationship ? item.optional_relationship : "",
                  birthdate: item.birthdate ? new Date(toDate(item.birthdate)) : new Date(),
                  antiguedad: item.antiguedad ? new Date(toDate(item.antiguedad)) : null,
                  sex : item.sex ? item.sex : "",
                  percentage: item.percentage ? parseFloat(item.percentage).toFixed(2) : 100,
                  person: item.person,
                  rfc: item.rfc ? item.rfc : "",
                  j_name: item.j_name ? item.j_name : ""
                };
              });
              var asegurados_1 = []
              var aseguradosList = _.map(order.subforms.life.aseguradosList, function (item, i) {
                if (i == 0) {
                  return {
                    first_name: item.first_name ? item.first_name : "",
                    last_name: item.last_name ? item.last_name : "",
                    second_last_name: item.second_last_name ? item.second_last_name : "",
                    birthdate: item.birthdate ? new Date(toDate(item.birthdate)) : new Date(),
                    antiguedad: item.antiguedad ? new Date(toDate(item.antiguedad)) : null,
                    sex : item.sex ? item.sex : "",
                    full_name: item.first_name + ' ' + item.last_name + ' ' + item.second_last_name,
                    smoker: item.smoker ? item.smoker : false,
                    policy_type: order.subforms.life.policy_type ? order.subforms.life.policy_type.id : null,
                  };
                }else{
                  asegurados_1.push(item)
                }
              });
              var asegurados_life = _.map(asegurados_1, function (plife, i) {
                  return {
                    first_name: plife.first_name ? plife.first_name : "",
                    last_name: plife.last_name ? plife.last_name : "",
                    second_last_name: plife.second_last_name ? plife.second_last_name : "",
                    birthdate: plife.birthdate ? new Date(toDate(plife.birthdate)) : new Date(),
                    antiguedad: plife.antiguedad ? new Date(toDate(plife.antiguedad)) : null,
                    sex : plife.sex ? plife.sex : "",
                    full_name: plife.first_name + ' ' + plife.last_name + ' ' + plife.second_last_name,
                    smoker: plife.smoker ? plife.smoker : false,
                    policy_type: order.subforms.life.policy_type ? order.subforms.life.policy_type.id : null,
                  };
                
              });
              $scope.dataToSave.life_policy =  [{
                personal: {
                  first_name: aseguradosList[0].first_name,
                  last_name: aseguradosList[0].last_name,
                  second_last_name: aseguradosList[0].second_last_name,
                  birthdate : (aseguradosList[0].birthdate),
                  antiguedad : (aseguradosList[0].antiguedad) ? (aseguradosList[0].antiguedad) : null,
                  sex: aseguradosList[0].sex,
                  full_name: aseguradosList[0].first_name + ' ' +aseguradosList[0].last_name + ' ' + aseguradosList[0].second_last_name,
                  smoker: aseguradosList[0].smoker ? aseguradosList[0].smoker : false,
                  policy_type: order.subforms.life.policy_type ? order.subforms.life.policy_type.id : null,
                },
                personal_life: asegurados_life,
                smoker: order.subforms.life.smoker,
                beneficiaries_life : beneficiariesList.length ? beneficiariesList : []
              }];
            } else {
              var aseguradosList = _.map(order.subforms.life.aseguradosList, function (item, i) {
                
                return {
                  first_name: item.first_name ? item.first_name : "",
                  last_name: item.last_name ? item.last_name : "",
                  second_last_name: item.second_last_name ? item.second_last_name : "",
                  birthdate: item.birthdate ? new Date(toDate(item.birthdate)) : new Date(),
                  antiguedad: item.antiguedad ? new Date(toDate(item.antiguedad)) : new Date(),
                  sex : item.sex ? item.sex : "",
                  full_name: item.first_name + ' ' + item.last_name + ' ' + item.second_last_name,
                  smoker: aseguradosList[0].smoker ? aseguradosList[0].smoker : false,
                  policy_type: order.subforms.life.policy_type.id,
                };
              });
              $scope.dataToSave.life_policy =  {
                // personal: {
                //   first_name: order.subforms.life.first_name,
                //   last_name: order.subforms.life.last_name,
                //   second_last_name : order.subforms.life.second_last_name,
                //   birthdate : new Date(toDate(order.subforms.life.birthdate)),
                //   sex: order.subforms.life.sex,
                //   full_name: order.subforms.life.first_name + ' ' + order.subforms.life.last_name + ' ' + order.subforms.life.second_last_name
                // },
                personal: aseguradosList,
                smoker:aseguradosList[0].smoker,
                beneficiaries_life : order.subforms.life.beneficiariesList.length ? order.subforms.life.beneficiariesList : []
              };
              try{
                if ($scope.dataToSave && $scope.dataToSave.life_policy && $scope.dataToSave.life_policy.beneficiaries_life) {
                  $scope.dataToSave.life_policy.beneficiaries_life.forEach(function (item, index) {
                    var sx = item.sex;
                    if (angular.isObject(sx)) {
                      sx = sx.value || sx.val || sx.code || sx.sex || '';
                    }
                    if (angular.isString(sx)) {
                      var u = sx.toUpperCase().trim();
                      if (u.indexOf('FEM') === 0) sx = 'F';
                      else if (u.indexOf('MAS') === 0) sx = 'M';
                    }
                    item.sex = sx || '';
                  });
              }
              }catch(u){}
            }

            $scope.dataToSave.automobiles_policy = new Array();
            $scope.dataToSave.damages_policy = new Array();
            $scope.dataToSave.accidents_policy = new Array();
            break;

          case 9:
            if(!order.subforms.auto.year){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", MESSAGES.ERROR.AUTOFORM, "error");
              return;
            }
            if(!order.subforms.auto.version){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", MESSAGES.ERROR.AUTOFORM, "error");
              return;
            }
            if(!order.subforms.auto.usage){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", MESSAGES.ERROR.AUTOUSAGE, "error");
              return;
            }
            if(!order.subforms.auto.policy_type){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", MESSAGES.ERROR.ERRORTYPEAUTO, "error");
              return;
            }
            if(!order.subforms.auto.service){
              l.stop();
              $scope.enproceso=false;
              SweetAlert.swal("Error", MESSAGES.ERROR.AUTOSERVICE, "error");
              return;
            }
            if(order.subforms.auto.serial){
              $scope.dataToSave.automobiles_policy = [{
                driver: order.subforms.auto.driver,
                brand: order.subforms.auto.brand,
                model: order.subforms.auto.model,
                year: parseInt(order.subforms.auto.year),
                version: order.subforms.auto.version,
                serial: order.subforms.auto.serial,
                engine: order.subforms.auto.engine,
                procedencia: order.subforms.auto.procedencia ? order.subforms.auto.procedencia.id : 0,
                charge_type: order.subforms.auto.charge_type ? order.subforms.auto.charge_type : 0,
                color: order.subforms.auto.color,
                license_plates: order.subforms.auto.license_plates,
                usage: order.subforms.auto.usage,
                service: order.subforms.auto.service,
                policy_type: order.subforms.auto.policy_type.id,
                beneficiary_name: order.subforms.auto.beneficiary_name,
                beneficiary_address: order.subforms.auto.beneficiary_address,
                beneficiary_rfc: order.subforms.auto.beneficiary_rfc,
                email: "",
                document_type: 1,
                adjustment: order.subforms.auto.adjustment,
                mont_adjustment: order.subforms.auto.mont_adjustment,
                special_team: order.subforms.auto.special_team,
                mont_special_team: order.subforms.auto.mont_special_team
              }];

              $scope.dataToSave.life_policy = new Array();
              $scope.dataToSave.damages_policy = new Array();
              $scope.dataToSave.accidents_policy = new Array();
            } else {
              l.stop()
              $scope.enproceso=false;
              SweetAlert.swal("Error", MESSAGES.ERROR.AUTOFORM, "error");
              return
              $scope.error_format_receipts = true;
              return;
            }

            break;

          default:

            if(order.form.ramo.ramo_code == 2) { // Accidentes y enfermedades.
              var type = helpers.diseaseType(order.defaults.formInfo.code);
              if (order.subforms.disease.relationshipList) {
                var relationsList = [];

                for (var i = 0; i < order.subforms.disease.relationshipList.length; i++) {
                  var item = order.subforms.disease.relationshipList[i];

                  if (!item.first_name || !item.last_name || !item.birthdate || !item.relationship || !item.sex) {
                    $scope.return = true;
                    l.stop();
                    $scope.enproceso = false;
                    SweetAlert.swal("Error", "Ingrese datos de Dependientes", "error");
                    return;  // 🔴 Esto detiene TODO
                  }

                  relationsList.push({
                    first_name: item.first_name,
                    last_name: item.last_name,
                    second_last_name: item.second_last_name,
                    relationship: item.relationship.relationship,
                    birthdate: new Date(toDate(item.birthdate)),
                    antiguedad: item.antiguedad ? new Date(toDate(item.antiguedad)) : null,
                    sex: item.sex.value
                  });
                }

                // Continúas usando relationsList si todo fue válido
              }

              // if (order.subforms.disease.relationshipList) {

              //   var relationsList = _.map(order.subforms.disease.relationshipList, function (item, i) {
              //     if (!item.first_name || !item.last_name || !item.birthdate || !item.relationship || !item.sex) {
              //       $scope.return = true
              //       l.stop();
              //       $scope.enproceso=false;
              //       SweetAlert.swal("Error","Ingrese datos de Dependientes", "error")
              //       return;
              //     }else{
              //       return {
              //         first_name: item.first_name,
              //         last_name: item.last_name,
              //         second_last_name: item.second_last_name,
              //         relationship: item.relationship.relationship,
              //         birthdate: new Date(toDate(item.birthdate)),
              //         antiguedad: item.antiguedad ? new Date(toDate(item.antiguedad)) : null, 
              //         sex : item.sex.value
              //       };
              //     }
              //   });
              // }

              $scope.dataToSave.accidents_policy = [{
                personal: {
                  first_name: order.subforms.disease.first_name ? order.subforms.disease.first_name : "",
                  last_name: order.subforms.disease.last_name ? order.subforms.disease.last_name : "",
                  second_last_name: order.subforms.disease.second_last_name ? order.subforms.disease.second_last_name : "",
                  birthdate: order.subforms.disease.birthdate ? new Date(toDate(order.subforms.disease.birthdate)) : new Date(),
                  antiguedad: order.subforms.disease.antiguedad ? new Date(toDate(order.subforms.disease.antiguedad)) : new Date(),
                  sex: order.subforms.disease.sex ? order.subforms.disease.sex : 'M',
                  full_name: order.subforms.disease.first_name ? order.subforms.disease.first_name + ' ' + order.subforms.disease.last_name + ' ' + order.subforms.disease.second_last_name : "",
                  policy_type: order.subforms.disease.policy_type.id
                },
                disease_type: type,
                relationship_accident: relationsList
              }];
              $scope.dataToSave.life_policy = new Array();
              $scope.dataToSave.damages_policy = new Array();
              $scope.dataToSave.automobiles_policy = new Array();

            } else if(order.form.ramo.ramo_code == 3) { // Danios
              var type = helpers.damageType(parseInt(order.form.subramo.subramo_code));
              $scope.dataToSave.damages_policy = [{
                damage_type: order.subforms.damage.policy_type ? order.subforms.damage.policy_type.id : 0,
                insured_item: order.subforms.damage.insured_item,
                item_address: order.subforms.damage.item_address,
                item_details: order.subforms.damage.item_details
              }];

              $scope.dataToSave.life_policy = new Array();
              $scope.dataToSave.accidents_policy = new Array();
              $scope.dataToSave.automobiles_policy = new Array();                    

            }

            break;
        };

        // COBERTURAS
        var coverages  =[];
        order.coverageInPolicy_policy.forEach(function(item, index, array) {

          var prima = '';
          var coinsurance = '';
          var deductible = '';
          var sumInPolicy = '';
          var topecoinsurance = '';

          if(item.primaInPolicy) {
            prima = item_address.primaInPolicy.value ? item_address.primaInPolicy.value : '';
          }

          if (item.coinsuranceInPolicy) {
            coinsurance = item.coinsuranceInPolicy.value ? item.coinsuranceInPolicy.value : '';
          }

          if (item.topeCoinsuranceInPolicy) {
            topecoinsurance = item.topeCoinsuranceInPolicy.value ? item.topeCoinsuranceInPolicy.value : '';
          }

          if(item.deductibleInPolicy) {
            deductible = item.deductibleInPolicy.value;
          }
          if(item.sumInPolicy) {
            sumInPolicy = item.sumInPolicy.value;
          }

          var obj = {
            package : $scope.dataToSave.paquete,
            coverage_name: item.coverage_name,
            priority: item.priority ? item.priority : 0,
            sum_insured: sumInPolicy,
            deductible: deductible,
            prima: prima,
            coinsurance: coinsurance,
            topecoinsurance: topecoinsurance,
          };
          coverages.push(obj);
          if(index === array.length -1) {
            $scope.dataToSave.coverageInPolicy_policy = coverages;
          }

        });

       }

      $scope.changeIva = function (parValue) {
        if(!parValue) {
          swal("La póliza se creará sin IVA.")
          //order.poliza.iva = 0;
        }

      }

      $scope.identifier = function (parValue) {
        if(order.form.identifier && order.form.identifier!='' && order.form.identifier!=undefined) {
          return;
        }

        if(order.form.paquete) {
          order.form.identifier = order.form.paquete.package_name;
        }
        if(order.subforms && order.subforms.life && order.subforms.life.second_last_name) { // vida
          if(order.form.paquete.package_name) {
            order.form.identifier = order.subforms.life.first_name+'_'+order.subforms.life.last_name+'_'+order.subforms.life.second_last_name+'-'+order.form.paquete.package_name;
          }
        } else if(order.subforms && order.subforms.damage && order.subforms.damage.insured_item) { 
          if(order.form.paquete.package_name) {
            order.form.identifier =  order.subforms.damage.insured_item +'-'+order.form.paquete.package_name;
          }
        } else if (order.subforms){
          if((order.subforms && order.subforms.disease && order.subforms.disease.first_name) || (order.subforms.disease && order.subforms.disease.last_name) || (order.subforms.disease && order.subforms.disease.second_last_name)) { // gastos medicos
            if(!order.subforms.disease && !order.subforms.disease.first_name) {
              order.subforms.disease.first_name = '';
            }
            if(!order.subforms.disease && !order.subforms.disease.last_name) {
              order.subforms.disease.last_name = '';
            }

            if(!order.subforms.disease && !order.subforms.disease.second_last_name) {
              order.subforms.disease.second_last_name = '';
            }

            if(order.form.paquete && order.form.paquete.package_name) {
              order.form.identifier = order.subforms.disease.first_name+'_'+order.subforms.disease.last_name+'_'+order.subforms.disease.second_last_name+'-'+order.form.paquete.package_name;
            }
          } 
        }
        else if (order.subforms) {
          if(order.subforms.auto && order.subforms.auto.year) { // autos
            if (order.subforms.auto.model != undefined) {
              order.form.identifier = order.subforms.auto.model +'_' +order.subforms.auto.year;
              if (order.subforms.auto.brand != undefined) {
                order.form.identifier =  order.subforms.auto.model +'_'+order.subforms.auto.brand + '_' +order.subforms.auto.year;
              }
            }else if(order.subforms.auto.brand != undefined){
              order.form.identifier =order.subforms.auto.brand + '_' +order.subforms.auto.year;
              if (order.subforms.auto.model != undefined) {
                order.form.identifier =  order.subforms.auto.model +'_'+order.subforms.auto.brand + '_' +order.subforms.auto.year;
              }
            }else if (order.subforms.auto.model != undefined && order.subforms.auto.brand != undefined) {
              order.form.identifier = order.subforms.auto.model +'_'+order.subforms.auto.brand + '_' +order.subforms.auto.year;
            }else{
              order.form.identifier = order.subforms.auto.year
            }
          } 
        } else {
          order.form.identifier = '';
        }
        if($scope.orgName =='gpi'){
          order.form.identifier = 'GENERAL';
        }
        $scope.saveLocalstorange();
      };

      $scope.year_auto = function (parValue) {
        if(order.form.identifier || order.form.identifier.length > 0) {
          return;
        }
        if(order.subforms.auto && order.subforms.auto.year) { // autos
          if (order.subforms.auto.model != undefined) {
            order.form.identifier = order.subforms.auto.model +'_' +order.subforms.auto.year;
            if (order.subforms.auto.brand != undefined) {
              order.form.identifier =  order.subforms.auto.model +'_'+order.subforms.auto.brand + '_' +order.subforms.auto.year;
            }
          }else if(order.subforms.auto.brand != undefined){
            order.form.identifier = order.subforms.auto.brand + '_' +order.subforms.auto.year;
            if (order.subforms.auto.model != undefined) {
              order.form.identifier =  order.subforms.auto.model +'_'+order.subforms.auto.brand + '_' +order.subforms.auto.year;
            }
          }else if (order.subforms.auto.model != undefined && order.subforms.auto.brand != undefined) {
            order.form.identifier = order.subforms.auto.model +'_'+order.subforms.auto.brand + '_' +order.subforms.auto.year;
          }else{
            order.form.identifier = order.subforms.auto.year
          }
        } else {
          order.form.identifier = '';
          if(order.form.paquete) {
            order.form.identifier = order.form.paquete.package_name;
          }
        }
        if($scope.orgName =='gpi'){
          order.form.identifier = 'GENERAL';
        }
      }

      $scope.changeIdentifier = function(parValue) {
        order.form.identifier = parValue;
      }
      $scope.percentage_life = function(input, index,ben){
        try{
          input = parseFloat(input).toFixed(2)
        }catch(e){
          input = 0
        }
        if(input < 0){
          order.subforms.life.beneficiariesList[index].percentage = 0;
        };
        if(input > 100){
          order.subforms.life.beneficiariesList[index].percentage = 100;
        };
        if (order.subforms.life.beneficiariesList[index].percentage == undefined) {
          order.subforms.life.beneficiariesList[index].percentage = 0
        }
        ben.percentage = parseFloat(input).toFixed(2)
        order.subforms.life.beneficiariesList[index].percentage = ben.percentage
        if (ben.percentage =='NaN') {              
          ben.percentage = parseFloat(0).toFixed(2)
          order.subforms.life.beneficiariesList[index].percentage = ben.percentage
        }
        if (parseFloat(order.subforms.life.beneficiariesList[index].percentage).toFixed(2) > 100.00) {     
          ben.percentage = 0.00
          order.subforms.life.beneficiariesList[index].percentage = 0.00       
          SweetAlert.swal('Error','El porcentaje del beneficiario'+ index+', no puede ser mayor a 100.00.','info');
          // return
        }
        if (helpers.beneficiariesPercentageGreaterThanZero(order.subforms.life.beneficiariesList)) {
          $scope.enproceso=false;
          SweetAlert.swal("Error", "Revise los porcentajes de los beneficiarios (la suma no debe pasar de 100)", "info")
          return
        }
      }
      
      $scope.calculate = function (poliza) {

        if(!poliza.derecho) {
          poliza.derecho = 0;
        }

        if(!poliza.rpf) {
          poliza.rpf = 0;
        }

        var prima_neta = parseFloat(poliza.primaNeta);
        var derecho = parseFloat(poliza.derecho);
        var rpf = parseFloat(poliza.rpf);
        var descuento = parseFloat(poliza.descuento);

        $scope.dataToSave.p_neta = prima_neta;
        $scope.dataToSave.derecho = derecho;
        $scope.dataToSave.rpf = rpf;
        $scope.dataToSave.descuento = descuento;

        var IVA = 0;
        var TOTAL_IVA = 1;

        if(order.poliza.ivaStatus) {
          IVA = 16;
          order.poliza.iva = 16;
          TOTAL_IVA = 1.16;
          var pointIva  = 0.16;
        } else {
          IVA = 0;
          order.poliza.iva = 0;
          var pointIva = 0;
        }

        //$scope.dataToSave.iva = IVA;
        var poliza_iva = (prima_neta + derecho + rpf) * 0.16;
        $scope.dataToSave.iva = (poliza_iva).toFixed(2);
        if(order.poliza.ivaStatus){
          order.poliza.iva = $scope.dataToSave.iva;
        }else{
          order.poliza.iva = 0;
        }

        if(!order.form.payment) {
          SweetAlert.swal("Error", "El número de póliza ya existe", "error")
          toaster.info(MESSAGES.ERROR.SELPAY);
        } else {
          // TODO: checar esta funciÃƒÂ³n
          function getNumber (num) {
            var num2 = Math.ceil(num);
            return new Array(num2)
          };

          function getSubtotal(poliza) {
            var sum = prima_neta + rpf + derecho;
            return Number((sum).toFixed(2));
          };

          function getTotal (poliza) {
            $scope.dataToSave.p_total = parseFloat(poliza.subTotal * TOTAL_IVA).toFixed(2);
            var p_total = (poliza.subTotal * TOTAL_IVA).toFixed(2);
            p_total = p_total.toFixed(2);
            return parseFloat(p_total);
          };

          function getIva (parValue) {
            var iva = parValue * pointIva;
            return parseFloat(iva).toFixed(2);
          }

          function comissionCalc(parPneta) {
            // var p_neta_ = parseFloat(parPneta);
            var p_neta_ = parPneta;

            if(order.form.comision) {

              var comision_ = parseFloat(order.form.comision.comission) / 100;
              comision_ = comision_.toFixed(2)
            } else {
              var comision_ = 0;
            }

            var result = parseFloat(p_neta_ * comision_).toFixed(2);
            return result;
          }

          order.receipts = [];
          order.defaults.showReceipts = true;

          // var initDate = toDate(order.form.startDate);
          // var endDate = toDate(order.form.endingDate);
         var initDate = new Date($scope.dataToSave.start_of_validity);
         var endDate = new Date($scope.dataToSave.end_of_validity);

          var months = helpers.monthDiff(initDate, endDate);
          // Calculate diff between dates
          var dateDiff = moment(endDate).diff(moment(initDate), 'days');
          var amountReceipts = order.amountReceipts = months / order.form.payment.value;
          //Calculate poliza results
          order.poliza.subTotal = getSubtotal(order.poliza);
          order.poliza.primaTotal = getTotal(order.poliza);
          order.poliza.iva = getIva(order.poliza.subTotal);
          amountReceipts = Math.ceil(amountReceipts);

          var prima_neta_total = 0;

          var arrayLen = getNumber(amountReceipts);
          // Logic from vm
          var obj = {
            prima: order.poliza.primaNeta / amountReceipts,
            rpf: order.poliza.rpf / amountReceipts,
            derecho: order.poliza.derecho / amountReceipts,
            iva: order.poliza.iva,
            subTotal: order.poliza.subTotal / amountReceipts,
            primaTotal: order.poliza.primaTotal / amountReceipts,
          };

          for (var i = 0; i < arrayLen.length; i++) {
            // Check options
            if (order.configDerecho) {
              if (i === 0) {
                if(order.poliza.derecho) {
                  obj.derecho = parseFloat(order.poliza.derecho);
                } else {
                  obj.derecho = 0;
                }
              } else {
                obj.derecho = 0;
              }
            }

            if (order.configRPF) {
              if (i === 0) {
                if(obj.rpf) {
                  obj.rpf = parseFloat(order.poliza.rpf);
                } else {
                  obj.rpf = 0;
                }
              } else {
                obj.rpf = 0;
              }
            }

            endDate = new Date(new Date(moment(initDate).add(order.form.payment.value, 'months')).setHours(11,59,59));
            var subTotal = obj.prima + obj.rpf + obj.derecho;

            prima_neta_total + parseFloat((obj.prima).toFixed(2));

            var receipt = {
              'recibo_numero': i+1,
              'prima_neta': parseFloat((obj.prima).toFixed(2)),
              'prima': parseFloat((obj.prima).toFixed(2)),
              'rpf': parseFloat((obj.rpf).toFixed(2)),
              'derecho': parseFloat((obj.derecho).toFixed(2)),
              'iva': getIva(subTotal),
              'subTotal': parseFloat((subTotal).toFixed(2)),
              'prima_total': parseFloat((subTotal * 1.16).toFixed(2)),
              'total': parseFloat((subTotal * TOTAL_IVA).toFixed(2)),
              'receipt_type': 1,
              'comision': comissionCalc(parseFloat((obj.prima).toFixed(2)))
            };

            $scope.iva_currency = receipt.subTotal * 0.16;

            if (dateDiff === 364 || dateDiff === 365 || dateDiff === 366) {
              receipt.fecha_inicio = convertDate(initDate);
              receipt.startDate = convertDate(initDate);
              receipt.endingDate = convertDate(endDate);
              receipt.fecha_fin = convertDate(endDate);
            } else {
              receipt.startDate = '';
              receipt.endingDate = '';
              receipt.fecha_inicio = '';
              receipt.fecha_fin = '';
            }
            initDate = endDate;

            order.receipts.push(angular.copy(receipt));
            $scope.dataToSave.recibos_poliza = order.receipts;

          }

          if (!order.receipts[0].startDate) {
            SweetAlert.swal("Error", MESSAGES.INFO.MANUALLYDATES, "warning")
            // toaster.warning("Agregar manualmente las fechas.");
          }

        }

      }

      order.receipts = [];
      order.defaults.showReceipts = false;
      // order.default.showReceipts = order.show.generateReceipts;
      order.amountReceipts = 0;
      order.poliza = {
          iva: 16,
          subTotal: "",
          primaTotal: ""
      };


      function convertDate(inputFormat, indicator) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        if(indicator){
          var date = [pad(d.getDate()+1), pad(d.getMonth()+1), d.getFullYear()].join('/');
        } else {
          var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
        }

        return date;
      }
      $scope.sucursal = function (sc) {
        console.log('sucrsals', sc);      
      }
      activate();
      getInternalNumber();

      $scope.statesArray = [];

      function removeCircularReferences(obj) {
        var seen = new WeakSet();
        return JSON.parse(JSON.stringify(obj, function(key, value) {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return;  // Skip circular reference
                }
                seen.add(value);
            }
            return value;
        }));
      }
      function recuperarArchivo() {
        if (!$localStorage.archivoBase64) return null;
        var binary = atob($localStorage.archivoBase64);
        var len = binary.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new File([bytes], $localStorage.archivoNombre, { type: $localStorage.archivoTipo });
      }
      function activate() {
        $scope.yaseestableciopaquete=false;
        restoreActiveTab();
        if($localStorage.orderFormCotizacion){
          var cotizacion = $localStorage.orderFormCotizacion;
          $scope.cotizacion_formulario =$localStorage.orderFormCotizacion;
          if(cotizacion.prospecto == 2){
            var cotizacion_contratante = cotizacion.contractor;

            $scope.show_contratante = 'contractors-match/';
            $http.post(__url.IP + $scope.show_contratante, 
              {
                'matchWord': cotizacion_contratante,
                'poliza': true
              })
            .then(function(response) {
            
              if(response.status === 200 && (response.data.contractors)) {
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
                  if(obj.label == cotizacion_contratante){
                    order.form.contratante = obj;
                  }
                  source.push(obj)
                });
                }

                $scope.contractors_data = source;
                
              }
            });
          }
          // order.form.aseguradora
          order.defaults.providers.forEach(function(aseg){
            if (aseg.alias == cotizacion.aseguradora_seleccionada){
              order.form.aseguradora = aseg;
            }
          })

        }
        dataFactory.get('sucursales-to-show-unpag/')
        .then(function success(response) {
          $scope.sucursalList = response.data;
        })
        var url_ = $location.path();
        if(url_.indexOf("editar") > -1)
        {
          $scope.frec_disabled = true;
          order.form.is_edit = true;
        } else {
          $scope.frec_disabled = false;
          order.form.is_edit = false;
        }

        var params = {
          start_date: order.form.startDate
        };

        var d = order.form.startDate;
        var curr_date = d.getDate();
        var curr_month = d.getMonth() + 1; //Months are zero based
        var curr_year = d.getFullYear();
        var date = curr_year + "-" + curr_month + "-" + curr_date;
        providerService.getProviderByKey(date)
          .then(
            function success(data) {
              order.defaults.providers = data.data;
              if ($scope.cotizador){
                $scope.cargarPolizaMulticotizador();
                }
              if($localStorage.orderFormCotizacion){
                order.defaults.providers.forEach(function(aseg){
                  if (aseg.alias == $localStorage.orderFormCotizacion.aseguradora_seleccionada){
                    order.form.aseguradora = aseg;
                    $scope.aseguradoraSelection();
                  }
                })

              }

              restorePdfDataFromStorage();
            },
            function error(err) {
              console.log('error', err);
            });

        // dataFactory.get('celula_contractor/')
        dataFactory.post('celula_contractor_info/')
        .then(function(response) {
          $scope.celulas = response.data
        });

        dataFactory.get('groupingLevel-resume/')
        .then(function(response) {
          $scope.agrupaciones = response.data;
        });
        $q.when()
        .then(function() {
            var defer = $q.defer();
            defer.resolve(helpers.getStates());
            return defer.promise;
        })
        .then(function(data) {
            $scope.statesArray = data.data;
        });
      }

      function parseStoredPdf(rawPdf) {
        if (!rawPdf) {
          return null;
        }
        if (typeof rawPdf === 'string') {
          try {
            rawPdf = JSON.parse(rawPdf);
          } catch (error) {
            return null;
          }
        }
        if (rawPdf && rawPdf.data) {
          return rawPdf;
        }
        return null;
      }

      function restorePdfDataFromStorage() {
        if ($scope.read_pdf && $scope.read_pdf.data) {
          return;
        }
        var storedPdf = parseStoredPdf($localStorage['datos_pdf']);
        if (!storedPdf) {
          storedPdf = parseStoredPdf(localStorage.getItem('datos_pdf'));
        }
        if (storedPdf) {
          $scope.cargarInformacion(storedPdf);
        }
      }

      $scope.saveLocalstorange = function(){
      }

      // $scope.addReferenciador();
      if ($scope.referenciadores){
      }
      else {
        $scope.referenciadores = [$scope.referenciador];
      }
      var myInsurance = $stateParams.myInsurance;
      if(myInsurance.url){

        var contrac = {};
        contrac.contratanteId = myInsurance.id;
        if(myInsurance.type_person == 1){
          contrac.type = "fisicas";
        }
        if(myInsurance.type_person == 2){
          contrac.type = "morales";
        }
        ContratanteService.getContratanteFull(contrac)
          .then(function(contractor) {
            order.form.contratante = contractor;
            if(contractor.first_name){
              order.form.contratante.val = contractor.first_name + ' ' + contractor.last_name + ' ' + contractor.second_last_name;
            }
            if(contractor.full_name){
              order.form.contratante.val = contractor.full_name;
            }
            // if(contractor.address_natural){
            if(contractor.address_contractor){
              order.defaults.address = contractor.address_contractor;
            }
            // if(contractor.address_juridical){
            //   order.defaults.address = contractor.address_juridical;
            // }
            order.form.address = order.defaults.address[0];
            order.form.contratante.value = contractor;
            if(order.form.contratante.value.celula){
              $http.get(order.form.contratante.value.celula)
              .then(function success(respo) {
                order.form.celula = respo.data;
              });
            }
            $scope.info_sub = order.form.contratante.value;
            if(order.form.contratante.value.groupinglevel){
              $http.get(order.form.contratante.value.groupinglevel)
              .then(function success(respons) {
                if(respons.data.type_grouping == 3){
                  $scope.info_sub.subsubgrouping = respons.data.description;
                  $http.get(respons.data.parent)
                  .then(function success(respon) {
                    $scope.info_sub.subgrouping = respon.data.description;
                    $http.get(respon.data.parent)
                    .then(function success(respo) {
                      order.form.grouping_level = respo.data;
                      $scope.changeAgrupacion(respo.data);
                    });
                    order.form.subgrouping == respon.data;
                  });
                  order.form.subsubgrouping == respons.data;
                }else if(respons.data.type_grouping == 2){
                  $scope.info_sub.subgrouping = respons.data.description;
                  $http.get(respons.data.parent)
                  .then(function success(respon) {
                    order.form.grouping_level = respon.data;
                    $scope.changeAgrupacion(respon.data);
                  });
                  order.form.subgrouping == respons.data;
                }else if(respons.data.type_grouping == 1){
                  order.form.grouping_level = respons.data;
                  $scope.changeAgrupacion(respons.data);
                }
              });
            }
            if(!$scope.read_pdf || $scope.read_pdf==undefined || Object.keys($scope.read_pdf).length === 0){
              order.form.startDate = convertDate(new Date());
              order.options.checkDate()            
            }
            // setTimeout(function() {                
              $http.get(url.IP + 'get-vendors/')
              .then(function(user) {
                if(order && order.form && order.form.contratante && order.form.contratante.value && order.form.contratante.value.vendor && order.form.contratante.value.vendor.url){
                  user.data.forEach(function(user) {
                    if (user.url == order.form.contratante.value.vendor.url){
                      order.form.vendor = user.id;
                      $scope.referenciadores[0] = {
                        referenciador: user.url 
                      }
                    }
                  })
                }
              });
            // }, 2000);            
          });
      }

      $rootScope.show_contractor = false;
      $scope.$watch(function () {
        return $rootScope.show_contractor;
      }, function (newValue, oldValue) {
        if (oldValue && !newValue) {
          restoreActiveTab();
        }
      });
      $scope.returnToPolicy = function () {
        $rootScope.show_contractor = false;
        restoreActiveTab();
      };

      $scope.validarEmail = function(item){
        if(!validateEmail(item)){
          SweetAlert.swal("Error", "El formato del correo es invalido", "warning");
        }

        function validateEmail(email) {
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(email);
        }
      }

      // modal para crear el nuevo contratante
      function contratanteCreatorModalEvent() {
        // if (angular.isNumber($scope.activeJustified)) {
        //   persistActiveTab($scope.activeJustified);
        // }
        $localStorage.serieDetectada = $scope.serieDetectada;
        $rootScope.show_contractor = true;
        $scope.orderInfo = order;
        $localStorage.orderForm = JSON.stringify(order.form);
        // var modalInstance = $uibModal.open({
        //     templateUrl: 'app/modals/modal.contratante.create.html',
        //     controller: 'ContratantesCtrl',
        //     controllerAs: 'vm',
        //     size: 'lg'
        // });
      }

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
      //     name: 'customFilter',
      //     fn: function(item /*{File|FileLikeObject}*/ , options) { //jshint ignore:line
      //         return this.queue.length < 20;
      //     }
      // });

      // ALERTA SUCCES UPLOADFILES
      uploader.onSuccessItem = function(fileItem, response, status, headers) {
        //toaster.success(MESSAGES.OK.UPLOADFILES);
        if ($uibModalInstance) {
            $uibModalInstance.dismiss('cancel');
        }
        $scope.okFile++;
        if($scope.okFile == $scope.uploader.queue.length){
          $timeout(function() {
              // $state.go('polizas.table');
            if(!$scope.flagCoverage){
              if($scope.param == 'poliza'){
                // $scope.sendEmail_Emision();
                SweetAlert.swal(MESSAGES.OK.NEWPOLICY, "", "success");
              }
              if($scope.param == 'ot'){
                SweetAlert.swal(MESSAGES.OK.NEWOT, "", "success");
              }
              $state.go('polizas.info', {polizaId: $scope.idPolicy});
            }
            else{
              SweetAlert.swal({
                title: "Advertencia",
                text: "Las coberturas sin sumas aseguradas ni deducibles, no se guardarán",
                type: "warning",
                showCancelButton: false,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Ok",
                cancelButtonText: "No",
                closeOnConfirm: false,
                closeOnCancel: true
              },
              function(isConfirm){
                if (isConfirm) {
                  if($scope.param == 'poliza'){
                    SweetAlert.swal(MESSAGES.OK.NEWPOLICY, "", "success");
                  }
                  if($scope.param == 'ot'){
                    SweetAlert.swal(MESSAGES.OK.NEWOT, "", "success");
                  }
                  $state.go('polizas.info', {polizaId: $scope.idPolicy});
                }
              });
            }

            if($uibModalInstance) {
              $uibModalInstance.close(200);
            }
          }, 1000);
        }
      };

      // ALERTA ERROR UPLOADFILES
      uploader.onErrorItem = function(fileItem, response, status, headers) {
        if(response.status == 413){
          // toaster.error(MESSAGES.ERROR.FILETOOLARGE);
          order.options.checkDate('initial');
          $state.go('polizas.editar', { polizaId: $scope.idPolicy, message: 2 });
        } else {
          // toaster.error(MESSAGES.ERROR.ERRORONUPLOADFILES);
          order.options.checkDate('initial');
          $state.go('polizas.editar', { polizaId: $scope.idPolicy, message: 1 });
        }
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

      function uploadFilesPDF(polizaId) {
        $scope.userInfo = {
          id: polizaId
        };
        $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
        $scope.files = [];
        $scope.files_ = [];          
        console.log('subir solo pdf',$scope.uploader)
        $timeout(function() {
            $scope.uploader.uploadAll();   
            $scope.enproceso=false;  
            $state.go('polizas.info', {polizaId: $scope.idPolicy});
        }, 1000);         
      }
      function uploadFiles(polizaId) {       
        try{
          var lm = Ladda.create( document.querySelector( '.ladda-button' ) );
          lm.start();
        }catch(d){

        }
        $scope.enproceso=true;  
        $scope.userInfo = {
            id: polizaId
        };
        $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
        $scope.files = [];
        $scope.files_ = [];          
        $timeout(function() {
            $scope.uploader.uploadAll();  
            $scope.enproceso=false;   
            $state.go('polizas.info', {polizaId: $scope.idPolicy});
        }, 1000);
          
      }
      $scope.sendEmail_Emision = function(x) {
        
        if($scope.poliza_creada.status != 1 || $scope.poliza_creada.status != 2){
          //Send Email
          var contrac = {}
          if($scope.poliza_creada.contractor){
            if (order.form.contratante.type_person ==1){
              contrac.type = 'fisicas'
            }else if (order.form.contratante.type_person ==2){
              contrac.type = 'morales'
            }
            contrac.contratanteId = $scope.poliza_creada.contractor
            contrac.url = $scope.poliza_creada.url
          }
          ContratanteService.getContratanteFull(contrac)
            .then(function(contractor) {
              $scope.contratante = contractor;
              if($scope.contratante.email){
                if($localStorage.email_config){
                  if($localStorage.email_config.registro_pol == true){
                    var model = 2;
                    emailService.sendEmailAtm(model,$scope.idPolicy)                                
                   }else{}
                 }
              }
            })                              
          //Send Email                              
          SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWPOLICY, "success");
        }
        if($scope.poliza_creada.status == 1 || $scope.poliza_creada.status == 2){
          //Send Email
          
          var contrac = {}
          if($scope.poliza_creada.contractor){
            if (order.form.contratante.type_person ==1){
              contrac.type = 'fisicas'
            }else if (order.form.contratante.type_person ==2){
              contrac.type = 'morales'
            }
            contrac.contratanteId = $scope.poliza_creada.contractor
            contrac.url = $scope.poliza_creada.url
          }
          ContratanteService.getContratanteFull(contrac)
            .then(function(contractor) {
              $scope.contratante = contractor;
              if($scope.contratante.email){
                if($localStorage.email_config){
                  if($localStorage.email_config.solicitud_pol == true){
                    var model = 1;
                    emailService.sendEmailAtm(model,$scope.idPolicy)                                 
                   }else{}
                 }
              }
            })                              
          //Send Email
          SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWOT, "success");
        }
      }


    //  function toDate(dateStr) {
    //     if (dateStr) {
    //       var dateString = dateStr; // Oct 23
    //       var dateParts = dateString.split("/");
    //       var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

    //       return dateObject;
    //     }
    //   }
      function toDate(dateStr) {
        if (typeof dateStr === 'string') {
            if (dateStr.indexOf('T') !== -1) { // formato ISO
                return new Date(dateStr);
            }
            var dateParts = dateStr.split("/");
            if (dateParts.length === 3) {
                var day = parseInt(dateParts[0], 10);
                var month = parseInt(dateParts[1], 10) - 1; // meses comienzan en 0
                var year = parseInt(dateParts[2], 10);
                return new Date(year, month, day);
            }
        } else if (dateStr instanceof Date) {
            return dateStr; // ya es un objeto Date
        }
        return null;
      }

      function mesDiaAnio (parDate) {
        // console.log('parDate', parDate);
        var d = new Date(toDate(parDate));
        // console.log('d', d);
        var date = (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
        // console.log('date', date);
        return date;
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
      function formattonumber(nStr, campo) {
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
          return value;
        }
      }

      $scope.cargarPolizaMulticotizador = function(){
        console.log("cargarPolizaMulticotizador",$scope.cotizador)
        localStorage.setItem('pdf_generado', '');
        // order.form = {};
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
        order.subforms.auto = order.subforms.auto || {};
        $scope.acceso_adm_ot = false;

        // var cotizador = localStorage.getItem('pdf_generado');
        //
          $scope.read_pdf = localStorage.getItem('datos_pdf');
       if( $scope.read_pdf){
           console.log("$scope.read_pdf",$scope.read_pdf)

          $scope.read_pdf = JSON.parse($scope.read_pdf)
          showButtonPoliza();
          $timeout(restoreActiveTab);
          $scope.filePdf = {}
          if ($scope.read_pdf.data['Numero de poliza']){
            // console.log("ingreso Numero")
            order.form.poliza = $scope.read_pdf.data['Numero de poliza'];
          }
          if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] &&  $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='NACIONAL'){
            $scope.order.f_currency.f_currency_selected = 1;
            order.f_currency.f_currency_selected = 1;
          }
          if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] &&  ($scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='Dolares' || ($scope.read_pdf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='dolares')){
            $scope.order.f_currency.f_currency_selected = 2;
            order.f_currency.f_currency_selected = 2;
          }
          if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] && !$scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='EXTRANJERA'){
            order.f_currency.f_currency_selected = 2;
            $scope.order.f_currency.f_currency_selected = 2;
          }                     
          if($scope.read_pdf.data['Datos generales de la poliza'] && $scope.read_pdf.data['Datos generales de la poliza']['Moneda'] && ($scope.read_pdf.data['Datos generales de la poliza']['Moneda'] =='udi' || ($scope.read_pdf.data['Datos generales de la poliza']['Moneda']).toLowerCase() =='udis')){
            $scope.order.f_currency.f_currency_selected = 3;
            order.f_currency.f_currency_selected = 3;
          }
          order.conducto_de_pago.conducto_de_pago_selected =1;  
          $scope.pintarCoberturas=true;

          order.form.payment = $scope.read_pdf.data['Datos generales de la poliza']['Forma de pago'];
          if(!order.form.payment){
            if('Forma_de_Pago' in $scope.read_pdf.data['Datos generales de la poliza']){
              order.form.payment = $scope.read_pdf.data['Datos generales de la poliza']['Forma_de_Pago']
            }
          }
          
          if(!order.form.payment){
            try{
              order.form.payment = $scope.read_pdf.data['Primas']['Forma_de_Pago'];          
            }catch(idx){}
          }

          if ($scope.read_pdf.data['Datos del vehiculo']){
             console.log("$scope.vehiculo")

            order.subforms.auto.brand = $scope.read_pdf.data['Datos del vehiculo']['marca'];
            order.subforms.auto.model = $scope.read_pdf.data['Datos del vehiculo']['modelo'];
            order.subforms.auto.year = $scope.read_pdf.data['Datos del vehiculo']['anio'];
            order.subforms.auto.engine = $scope.read_pdf.data['Datos del vehiculo']['motor'];
            order.subforms.auto.serial = $scope.read_pdf.data['Datos del vehiculo']['serie'];
            $scope.serieAGuardar=order.subforms.auto.serial;
            if(order.subforms.auto.serial){
              $scope.checkNumSerie();
            }
            // order.subforms.auto.license_plates = $scope.read_pdf.data['Datos del vehiculo']['clave_vehicular'];
            order.subforms.auto.license_plates = $scope.read_pdf.data['Datos del vehiculo']['placas'];
            var datosVehiculo = $scope.read_pdf.data['Datos del vehiculo'];

            order.subforms.auto.version = datosVehiculo.version 
                ? datosVehiculo.version 
                : (datosVehiculo.descripcion_vehiculo 
                    ? datosVehiculo.descripcion_vehiculo 
                    : datosVehiculo.clave_vehicular);
            // order.subforms.auto.version = $scope.read_pdf.data['Datos del vehiculo']['descripcion_vehiculo'] ? $scope.read_pdf.data['Datos del vehiculo']['descripcion_vehiculo'] : $scope.read_pdf.data['Datos del vehiculo']['clave_vehicular'];
            order.subforms.auto.color = $scope.read_pdf.data['Datos del vehiculo']['color'];
            order.subforms.auto.service = $scope.read_pdf.data['Datos del vehiculo']['servicio'];
            if(order && order.subforms && order.subforms.auto && order.subforms.auto.service =='' || order.subforms.auto.service ==undefined || order.subforms.auto.service ==null){
              if($scope.read_pdf && $scope.read_pdf.data && $scope.read_pdf.data['Datos del vehiculo']['uso']){
                if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 1){
                  order.subforms.auto.service= "PARTICULAR";
                }else if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 2){
                  order.subforms.auto.service= "CARGA";
                }else if(parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']) == 3){
                  order.subforms.auto.service= "SERVICIO PÚBLICO";
                }
                else{
                  order.subforms.auto.service= "PARTICULAR";
                }
              }
            }
            order.form.identifier = order.subforms.auto.brand +' '+ order.subforms.auto.model+' '+order.subforms.auto.version;
            if($scope.orgName =='gpi'){
              order.form.identifier = 'GENERAL';
            }
            try {
              order.subforms.auto.usage = parseInt($scope.read_pdf.data['Datos del vehiculo']['uso']);
            } catch(err){}
            var aseguradora_a_capturar = sinDiacriticos($scope.read_pdf.data['aseguradora'].toLowerCase())
            if(order.defaults && order.defaults.providers){
            //  console.log("$scope.defaults",aseguradora_a_capturar)
            //  console.log("$scope.providers",order.defaults.providers)

                order.defaults.providers.forEach(function(x){
                  if(aseguradora_a_capturar =='chubb'){

                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='CHUBB' || sinDiacriticos(x.alias).toLowerCase() == 'Aba' || sinDiacriticos(x.alias).toLowerCase() =='ABA' || sinDiacriticos(x.alias).toLowerCase() =='chubb seguros mexico') {
                      order.form.aseguradora = x;
                      var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']                                  
                      if(!cl || cl==undefined){
                        try{
                          cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave_interna_del_agente']
                        }catch(u){}
                      } 
                      get_claves_pdf(x,cl)
                    }
                  }
                  if(aseguradora_a_capturar =='qualitas'){
                    console.log("INGRESO")
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='Quálitas' || sinDiacriticos(x.alias).toLowerCase() =='Qualitas' || sinDiacriticos(x.alias).toLowerCase() == 'QUALITAS' || sinDiacriticos(x.alias).toLowerCase() =='QUÁLITAS') {
                      order.form.aseguradora = x;
                      var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']            
                      if(!cl || cl==undefined){
                        try{
                          cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave_interna_del_agente']
                        }catch(u){}
                      } 
                      get_claves_pdf(x,cl)
                    }
                  }
                  if(aseguradora_a_capturar =='gnp'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='gnp' || sinDiacriticos(x.alias).toLowerCase() =='gnp seguros' || sinDiacriticos(x.alias).toLowerCase() == 'grupo nacional provincial' || sinDiacriticos(x.alias).toLowerCase() =='grupo nacional provincial ') {
                      order.form.aseguradora = x;
                      var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']            
                      if(!cl || cl==undefined){
                        try{
                          cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave_interna_del_agente']
                        }catch(u){}
                      } 
                      get_claves_pdf(x,cl)
                    }
                  }
                  if(aseguradora_a_capturar =='axa'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='axa' || sinDiacriticos(x.alias).toLowerCase() =='axa seguros') {
                      order.form.aseguradora = x;
                      var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']            
                      if(!cl || cl==undefined){
                        try{
                          cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave_interna_del_agente']
                        }catch(u){}
                      } 
                      get_claves_pdf(x,cl)
                    }
                  }
                  if(aseguradora_a_capturar =='zurich'){
                    if (sinDiacriticos(x.alias).toLowerCase() == aseguradora_a_capturar || sinDiacriticos(x.alias).toLowerCase() ==aseguradora_a_capturar.toUpperCase() || sinDiacriticos(x.alias).toLowerCase() =='zurich ' || sinDiacriticos(x.alias).toLowerCase() =='zurich seguros') {
                      order.form.aseguradora = x;
                      var cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave interna del agente']            
                      if(!cl || cl==undefined){
                        try{
                          cl = $scope.read_pdf.data['Datos generales de la poliza']['Clave_interna_del_agente']
                        }catch(u){}
                      } 
                      get_claves_pdf(x,cl)
                    }
                  }
                });       
              }           
            order.subforms.auto.policy_type = {'id':1,'name':'Automóvil'};
            order.subforms.auto.procedencia = {'id':1,'name':'Residente'}
          }

              //     order.form.from_pdf = true;
              if(($scope.read_pdf.data['contratante_full_name'].indexOf("S.A. DE") > -1)){
                $scope.read_pdf_contractor.type = false;
                $scope.read_pdf_contractor.name =$scope.read_pdf.data['contratante_full_name'];
              }else{
                $scope.read_pdf_contractor.type = true;
                $scope.read_pdf_contractor.name = $scope.read_pdf.data['contratante_full_name']
                
              }
   
              if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Prima total']) {
                $scope.order.form.primaTotal = $scope.read_pdf.data['Primas']['Prima total'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Prima total'])) : $scope.read_pdf.data['Primas']['IMPORTE TOTAL'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['IMPORTE TOTAL'])) : 0;
                $scope.order.form.subTotal = $scope.read_pdf.data['Primas']['Subtotal'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Subtotal'])) : 0;
                $localStorage['primas'] = $scope.order.form;
              }
              if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Prima neta']) {
                $scope.order.form.primaNeta = $scope.read_pdf.data['Primas']['Prima neta'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Prima neta'])) : 0;
                $localStorage['primas'] = $scope.order.form;
              }

              if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Gastos de expedición']) {
              
                try{
                  $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos de expedición'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos de expedición'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }catch(o){
                  $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos de expedici\u00f3n'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos de expedici\u00f3n'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }
              }
              if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Gastos por Expedición.']) {
                try{
                  $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos por Expedición.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos por Expedición.'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }catch(o){
                  $scope.order.form.derecho = $scope.read_pdf.data['Primas']['Gastos por Expedici\u00f3n.'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Gastos por Expedici\u00f3n.'])) : 0;
                  $localStorage['primas'] = $scope.order.form;
                }
              }
              if ($scope.read_pdf.data['Primas'] && $scope.read_pdf.data['Primas']['Financiamiento por pago fraccionado']) {
                $scope.order.form.rpf = $scope.read_pdf.data['Primas']['Financiamiento por pago fraccionado'] ? parseFloat(formatearNumero_calculate($scope.read_pdf.data['Primas']['Financiamiento por pago fraccionado'])) : 0;
                $localStorage['primas'] = $scope.order.form;
              }
              // $scope.verComisiones();
              order.form.startDate =  $scope.read_pdf.data['fecha_inicio']
              order.form.endingDate =  $scope.read_pdf.data['fecha_fin']
              order.form.endDate =  $scope.read_pdf.data['fecha_fin']
              order.form.start_of_validity= new Date($scope.read_pdf.data['fecha_inicio'])
              order.form.end_of_validity = new Date($scope.read_pdf.data['fecha_fin'])

              $scope.dataToSave.start_of_validity = (mesDiaAnio(order.form.startDate));
              $scope.dataToSave.end_of_validity = mesDiaAnio(order.form.endingDate);
              var date1 = new Date($scope.dataToSave.start_of_validity);
              var date2 = new Date($scope.dataToSave.end_of_validity);
              var timeDiff = Math.abs(date2.getTime() - date1.getTime());
              order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
              // $scope.checkEndDate()
              var asegurado = $scope.read_pdf.data['Datos del asegurado'] || {};
              var cobertura_paquete = $scope.read_pdf.data['cobertura'] || '';

              // Asignamos first_name dependiendo de si existe propietario_contratante
              $scope.first_name = asegurado.propietario_contratante && asegurado.propietario_contratante.trim()
                ? asegurado.propietario_contratante
                : (asegurado.contratante_full_name || '');
              $scope.first_name= sinDiacriticos($scope.first_name)

              order.form.from_pdf = true
              $rootScope.readPDF = {
                individual:$scope.read_pdf.data['Datos del asegurado'],
                corporation: $scope.read_pdf.data['Datos del asegurado'],
                address: $scope.read_pdf.data['contratante_domicilio'],
                first_name: $scope.first_name,
                last_name: $scope.read_pdf.data['contratante_primer_apellido'],
                second_last_name: $scope.read_pdf.data['contratante_segundo_apellido'],
                type_person: $scope.read_pdf.data['persona'],

              };
              // si hay datos de quote rellenar
            
              $scope.show_contratante = 'contractors-match/';
              $http.post(url.IP + $scope.show_contratante, 
                {
                  'matchWord': $scope.read_pdf_contractor.name,
                  'poliza': true
                })
              .then(function(response){
                if(response.status === 200){
                  if(response.data != 404){
                    if(response.data.contractors.length){
                      // if(!$scope.read_pdf_contractor.type){
                        if(response.data.contractors.length){
                          for(var i = 0; i < response.data.contractors.length; i++){
                            var reg = /\d{,}/g
                            var reg2 = /\d{.}/g
                            var nombre_pdf = ($scope.read_pdf_contractor.name.replace(reg, "")).toLowerCase();
                            var nombre_pdf = (nombre_pdf.replace(reg2, "")).toLowerCase();
                            var nombre_api = (response.data.contractors[i].full_name.replace(reg, "")).toLowerCase();
                            var nombre_api = (nombre_pdf.replace(reg2, "")).toLowerCase();
                            if((((nombre_pdf).replace(',','')).replace('.','')).toLowerCase() == (((nombre_api).replace(',','')).replace('.','')).toLowerCase()){
                              order.form.contratante.val = response.data.contractors[i].full_name;
                              order.form.contratante.value = response.data.contractors[i];
                              order.form.contratante.phone = response.data.contractors[i].phone;
                              order.form.contratante.email = response.data.contractors[i].email;
                            }
                           
                            if((i + 1) == response.data.contractors.length){
                              if(!order.form.contratante.value){
                                $scope.objetoPoliza = order.form;
                                $scope.saveLocalstorange()
                                order.contratanteCreatorModalEvent();
                              }
                            }
                          }
                        }else{
                          $scope.objetoPoliza = order.form;
                          $scope.saveLocalstorange();
                          order.contratanteCreatorModalEvent();
                        }
                      // }
                    }else{
                      $scope.objetoPoliza = order.form;
                      $scope.saveLocalstorange();
                      order.contratanteCreatorModalEvent();
                    }
                  }else{
                    $scope.objetoPoliza = order.form;
                    order.contratanteCreatorModalEvent();
                  }
                }else{
                  $scope.objetoPoliza = order.form;
                  $scope.saveLocalstorange();
                  order.contratanteCreatorModalEvent();
                }
              });                 
        };
              
      }
      $scope.filePdfTemp = null;

      function guardarArchivo(file) {
        // Límite máximo en bytes (ej. 4 MB = 4 * 1024 * 1024)
        var MAX_SIZE = 4 * 1024 * 1024;

        // Limpiar valores anteriores
        delete $localStorage.archivoBase64;
        delete $localStorage.archivoNombre;
        delete $localStorage.archivoTipo;

        // Validar tamaño del archivo antes de leer
        if (file.size > MAX_SIZE) {
          console.log("⚠️ El archivo es demasiado grande para guardarlo en memoria local (máx 4 MB).");
          return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
          var base64 = e.target.result.split(',')[1]; // quitar prefijo data:
          try {
            $localStorage.archivoBase64 = base64;
            $localStorage.archivoNombre = file.name;
            $localStorage.archivoTipo = file.type;
          } catch (err) {
          }
        };
        reader.readAsDataURL(file);
      }


      // ------------------------------imagen serie
      function obtenerSerieImagen(filePDF) {       
        $scope.serieDetectada = ''; 
        var file = filePDF;
        // Si no viene filePDF, intentar recuperarlo del localStorage
        if (!filePDF) {
            filePDF = recuperarArchivo();
            file=filePDF;
            if (!filePDF) {
                console.log("No se encontró archivo para procesar.");
                return;
            }
        } else {
            // Si vino del input, guardarlo para persistencia
            guardarArchivo(filePDF);
        }
        if (!file) return;
        if (typeof pdfjsLib === "undefined") {
          console.log("PDF.js no está cargado. Verifica la inclusión de la librería.");
          return;
        }
        // Configuración worker para evitar warnings
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

        var vinRegex = /\b[A-HJ-NPR-Z0-9]{17}\b/; // VIN exacto
        var reader = new FileReader();

        reader.onload = function(e) {
            var typedarray = new Uint8Array(e.target.result);

            pdfjsLib.getDocument({
                data: typedarray,
                useWorkerFetch: false,
                standardFontDataUrl:
                    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/standard_fonts/'
            }).promise.then(function(pdf) {
                var paginaActual = 1;
                function buscarEnPagina() {
                    if (paginaActual > pdf.numPages) {
                        console.log("No se encontró la serie en el PDF.");
                        return;
                    }

                    pdf.getPage(paginaActual).then(function(page) {
                        page.getTextContent().then(function(textContent) {
                            var vinCoords = null;
                            var detectedVIN = null;

                            textContent.items.forEach(function(item) {
                                if (vinRegex.test(item.str) || item.str.toLowerCase().includes("serie")) {
                                    detectedVIN = item.str.match(vinRegex)
                                        ? item.str.match(vinRegex)[0]
                                        : null;
                                    vinCoords = item.transform;
                                }
                            });

                            if (vinCoords) {
                                $scope.serieDetectada = detectedVIN || "";
                                $localStorage.serieDetectada=$scope.serieDetectada;
                                // Renderizar la página en un canvas
                                var viewport = page.getViewport({ scale: 2.0 });
                                var canvas = document.createElement('canvas');
                                var context = canvas.getContext('2d');
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;

                                // page.render({ canvasContext: context, viewport: viewport }).promise.then(function() {
                                //     // Calcular recorte
                                //     var x = vinCoords[4];
                                //     var y = viewport.height - vinCoords[5];
                                //     var width = 600;
                                //     var height = 400;

                                //     var cropCanvas = document.createElement('canvas');
                                //     cropCanvas.width = width;
                                //     cropCanvas.height = height;
                                //     var cropCtx = cropCanvas.getContext('2d');
                                //     cropCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);

                                //     $scope.serieImagenBase64 = cropCanvas.toDataURL();
                                //     var base64String = cropCanvas.toDataURL();
                                //     $scope.serieImagenBase64 = $sce.trustAsResourceUrl(base64String);
                                //     $scope.$apply();
                                // });
                            } else {
                                paginaActual++;
                                buscarEnPagina(); // Siguiente página
                            }
                        });
                    });
                }

                buscarEnPagina(); // Empieza en página 1
            });
        };

        reader.readAsArrayBuffer(file);
      };
      // configuraciÃƒÂ³n del datepicker
      $('.datepicker-me input').datepicker();
      
      $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
      $.fn.datepicker.defaults.startView = 0;
      $.fn.datepicker.defaults.autoclose = true;
      $.fn.datepicker.defaults.language = 'es';

  }
})();

function agregarOnChange(elem) {
  $(elem).find('#nvo').parent().parent().append("<button onClick=\"closeOT()\" class=\"btn btn-block btn-outline btn-success\">Crear Contratante</button>");
  $(elem).find('#nvo').parent().remove();
}

function closeOT() {
  $("#closeOT").click();
  $("#createCont").click();
}