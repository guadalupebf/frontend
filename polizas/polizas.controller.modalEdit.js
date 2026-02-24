var order2 = null;
(function() {
  'use strict';
  /* jshint devel: true */

  angular.module('inspinia')
    .controller('OrderEditCtrl', OrderEditCtrl);

  OrderEditCtrl.$inject = ['$parse','datesFactory', 'ContratanteService','$http','$q','pdfService', 'tiposBeneficiarios', 'sex', 'formService', '$uibModalInstance', '$timeout', 'url',
                '$localStorage', 'FileUploader', '$scope', '$filter', 'groupService', 'providerService', 'insuranceService', 'receiptService', 'generalService',
                'toaster', 'formaPago', 'helpers', 'MESSAGES', 'myInsurance', 'container', '$stateParams', '$state', 'fileService','SweetAlert', '$sessionStorage', 'formatValues',
                'coverageService', 'dataFactory','$rootScope','$uibModal','$location','CondicionesGeneralesService'];


  function OrderEditCtrl($parse, datesFactory, ContratanteService, $http, $q ,pdfService, tiposBeneficiarios, sex, formService, $uibModalInstance, $timeout, url, $localStorage,
                FileUploader, $scope, $filter, groupService, providerService, insuranceService, receiptService, generalService, toaster, formaPago, helpers,
                MESSAGES, myInsurance, container, $stateParams, $state, fileService,SweetAlert, $sessionStorage, formatValues,
                coverageService, dataFactory,$rootScope, $uibModal, $location,CondicionesGeneralesService) {


    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var decryptedToken = sjcl.decrypt('Token', $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    $scope.identificador = true;
    $scope.newCoverPack = false;
    $scope.addNewCoverages = false;
    $scope.edited_pay_frequency = false;
    $scope.es_renovacion=false;
    $scope.esEdicion=true;
    var order = order2 = this;
    var firstTime=true;
    if (($location.path().indexOf('editar') != -1)) {
      $scope.validaPermisoEliminar = true;
    }else{
      $scope.validaPermisoEliminar = false;
    }
    // order.deleteFile=deleteFile;
    order.f_currency={};
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

    order.renewal = {};
    order.renewal.options = [
        {'value':1,'label':'Renovable'},
        {'value':2,'label':'No Renovable'},
    ];
    order.businessline = [
        {'id':1,'name':'Comercial'},
        {'id':2,'name':'Personal'},
        {'id':0,'name':'Otro'},
    ];
    $scope.seller = [];
    $scope.isSeller = [];

    $scope.pay_ways = [
        { key: 1, val :'Clabe'},
        { key: 2, val :'Número de cuenta'},
        { key: 3, val :'Número de tarjeta'},
        { key: 4, val :'Efectivo'}
    ];

    $scope.fcs = [
        { key: 1, val :'Semanal'},
        { key: 2, val :'Quincenal'},
        { key: 3, val :'Mensual'}
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
    ];
    order.types_gm = [
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
      {'id':13,'name':'Crédito General'},
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

    $scope.usages = [
      {'id':1,'name':'PARTICULAR'},
      {'id':2,'name':'CARGA'},
      {'id':3,'name':'SERVICIO PÚBLICO'},
    ]

    $scope.celulas = [];
    $scope.agrupaciones = [];
    $scope.sub_asignaciones = [];
    $scope.sub_subasignaciones = [];

    order.recalcular = true;

    $scope.is_edition = true;

    $scope.infoUser = $sessionStorage.infoUser;

    usr.permiso.editar = true;
    $scope.show_receipts = true;
    order.accesos = $sessionStorage.permisos
    if (order.accesos) {
      order.accesos.forEach(function(perm){
        if(perm.model_name == 'Pólizas'){
          order.acceso_polizas = perm
          order.acceso_polizas.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar pólizas') {
              if (acc.checked == true) {
                order.acceso_adm_pol = true
              }else{
                order.acceso_adm_pol = false
              }
            }else if (acc.permission_name == 'Ver pólizas') {
              if (acc.checked == true) {
                order.acceso_ver_pol = true
              }else{
                order.acceso_ver_pol = false
              }
            }else if (acc.permission_name == 'Cancelar pólizas') {
              if (acc.checked == true) {
                order.acceso_canc_pol = true
              }else{
                order.acceso_canc_pol = false
              }
            }else if (acc.permission_name == 'Eliminar pólizas') {
              if (acc.checked == true) {
                order.acceso_elim_pol = true
              }else{
                order.acceso_elim_pol = false
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
            }else if (acc.permission_name == 'Cancelar pólizas') {
              if (acc.checked == true) {
                order.acceso_canc_ot = true
              }else{
                order.acceso_canc_ot = false
              }
            }else if (acc.permission_name == 'Eliminar pólizas') {
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
            }else if (acc.permission_name == 'Eliminar recibos') {
              if (acc.checked == true) {
                order.acceso_del_cob = true
              }else{
                order.acceso_del_cob = false
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
    $scope.deleteFile = function(file,container,poliza) {
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
            id_poliza: $scope.myInsurance.id,
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
              var params = {
                'model': 1,
                'event': "PATCH",
                'associated_id':  $scope.myInsurance.id,
                'identifier': " elimino 1 archivo de la póliza "+file.nombre
              }
              dataFactory.post('send-log/', params).then(function success(response) {

              });
              SweetAlert.swal("¡Eliminado!", "El archivo fue eliminado.", "success");
              container.splice(container.indexOf(file), 1);
            }
          })
        }
      });
    }
    $scope.renameFile = function (file,vmFiles){
          var patch = {
            nombre: file.nombre
          }
          $http.patch(file.url, patch).then(function(response){
            if(response.status == 403){
              $http.get(file.url).then(function(response) {
                  file.nombre = response.data
              })
            }
        });
    }

    // -------------------------Referenciadores
    $http
    .get(url.IP + 'get-vendors/')
    .then(function(user) {
        user.data.forEach(function(vn) {
          vn.first_name = vn.first_name.toUpperCase()
          vn.last_name = vn.last_name.toUpperCase()
          vn.name = vn.first_name.toUpperCase() + ' ' + vn.last_name.toUpperCase();
        });
        $scope.users = user.data;        
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
    //------------------------------
    $scope.newCoverages = function () {
      $scope.addNewCoverages = true;

    };
    $scope.finishNewCoverages = function () {
      $scope.addNewCoverages = false;

    };

    $scope.saveNewCoverage = function (parName, priority, parPackage) {
      $scope.coverages = [];
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
          $scope.priority = null;

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
    $scope.deleteSubramo = function(index_main, index_sub, data){
            $scope.delete_subramos.push(data.subramos[index_sub]);
            data.subramos.splice(index_sub, 1);
    };

    $scope.changeDomiciliado = function() {
      $scope.change_domiciliado = true;
      if(order.form.domiciliado == 'true' || order.form.domiciliado == true) {
        var domiciliado = true;
      } else {
        var domiciliado = false;
      }

      if (order.receipts.length) {
        order.receipts.forEach(function(item) {
          if(domiciliado) {
            item.is_cat = true;
          } else {
            item.is_cat = false;
          }
        });
      }
    };

    $scope.changeVendedor = function(vendedor) {
      $scope.users.some(function(user) {
        if (vendedor.id == user.id){
          var vendedor_info = user.user_info.info_vendedor[0]
          if (vendedor_info.vendedor_subramos.length == 0){
            SweetAlert.swal('error','El vendedor no tiene comisión en el subramo actual');
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

    $scope.addNewSubramo = function () {
      $scope.show_new_sub = true;
      $scope.create_sub = true;
    };


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


    $scope.addSubramo = function(index) {
        if($scope.users[index].subramos) {

            $scope.users[index].subramos.push({});
        } else {
            $scope.users[index].subramos = [{}];
        }
    };


    $scope.testPagination = function(parModel, parConfig) {

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
            if(pay.key == parData.tipo_pago) {
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
              if(sub_ramo.provider == order.form.aseguradora.id || sub_ramo.provider == 0 ){

                var data = {
                    comision_percentage: sub_ramo.comision,
                    comision: sub_ramo.comision,
                    id: sub_ramo.id,
                    url: sub_ramo.url
                };

                order.defaults.providers.forEach(function(provider) {

                  if(sub_ramo.provider !== 0) {

                    data.provider = provider;
                  } else {
                    data.provider = "";
                  }

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

                });

                parUser.subramos.push(data);
              }



        });

        return angular.copy(parUser);
    }


    $scope.saveSeller = function(main_index) {

        var user = angular.copy($scope.users[main_index]);

         if(user.user_info) {
            if(user.user_info.is_vendedor) {
                var vendedor_ = user.user_info.info_vendedor[0].id;
            }
        } else {
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
        } else {
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

        } else {
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

        if(user.user_info) {
            if(user.user_info.is_vendedor) {

                var data_source = {};

                if(typeof(user.bank) !== 'object') {
                    data_source.bank = user.bank
                }

                if(typeof(user.frequencia_de_cobro) !== 'object') {
                    data_source.frequencia_de_cobro = user.frequencia_de_cobro
                }

                if($scope.original_data.address !== user.address) {
                    data_source.address = user.address;
                }

                if(parseFloat($scope.original_data.gastos_operacion) !== parseFloat(user.gastos_operacion)) {
                    data_source.gastos_operacion = user.gastos_operacion;
                }

                var hired_date_original = datesFactory.toDate($scope.original_data.hired_date);
                if(hired_date_original !== hired_date_) {
                    data_source.hired_date = user.hired_date;
                }

                if($scope.original_data.reference_number !== user.reference_number) {
                    data_source.reference_number = user.reference_number;
                }

                if($scope.original_data.pay_way.id !== user.pay_way.id) {
                    data_source.pay_way = user.pay_way;
                }

                $http
                .patch(user.url, data_source)
                .then(function(req) {
                    if(req.status !== 200) {
                        // error
                    }
                });
                if($scope.original_data.subramos.length !== subramos_.length) {


                    // DELETE $scope.delete_subramos
                    if($scope.delete_subramos.length) {

                        $scope.delete_subramos.forEach(function(item_d) {

                            $http.delete(item_d.url)
                            .then(function(delete_item) {
                                
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
                                            toaster.success('Subramo editado correctamente');
                                        });
                                    }
                                }
                            });
                        } else {
                            // post
                            dataFactory.post('subramos-vendedor/', item)
                            .then(function(subramo_) {
                              $http
                              .get(url.IP + 'get-vendors/')
                              .then(function(user) {

                                  $scope.users = user.data;

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
                              //
  
                                toaster.success('Subramo agregado correctamente');
                            });
                        }
                    });
                }
                else{
                    subramos_.forEach(function(item) {
                        if(item.id) {


                            $scope.original_data.subramos.forEach(function(o_item) {
                                if(o_item.id == item.id) {

                                    if(parseFloat(o_item.comision) !== parseFloat(item.comision)) {
                                        $http.patch(item.url, { comision: item.comision })
                                        .then(function(comision) {
                                            toaster.success('Subramo editado correctamente');
                                        });
                                    }
                                }
                            });

                        }
                    });
                }


                $scope.original_data.phones.push($scope.original_data.phone);
                 if($scope.original_data.phones.length !== phones_.length) {

                    // DELETE $scope.delete_subramos
                    if($scope.delete_phones.length) {
                        $scope.$scope.delete_phones.forEach(function(item_d) {
                            $http.delete(item_d.url)
                            .then(function(delete_item) {
                                
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
                                            
                                        });
                                    }
                                }
                            });

                        } else {
                            // post
                            dataFactory.post('phone-vendedor/', item)
                            .then(function(phne_) {
                                
                            });
                        }
                    });
                }
            }
            else{
               dataFactory
                .post('vendedores/', user)
                .then(function(data) {
                    if(data.status == 201) {
                        $scope.isSeller[main_index] = false;
                        $scope.users.forEach(function(user, index) {
                            if(user.id == data.data.user) {
                                dataFactory.get('usuarios/'+ data.data.user)
                                .then(function(req) {
                                    req.data.first_name = req.data.first_name.toUpperCase()
                                    req.data.last_name = req.data.last_name.toUpperCase()
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

            dataFactory
            .post('vendedores/', user)
            .then(function(data) {
                if(data.status == 201) {
                    $scope.isSeller[main_index] = false;
                    $scope.users.forEach(function(user, index) {
                        if(user.id == data.data.user) {
                            dataFactory
                            .get('usuarios/'+ data.data.user)
                            .then(function(req) {
                                req.data.first_name = req.data.first_name.toUpperCase()
                                req.data.last_name = req.data.last_name.toUpperCase()
                                req.data['phones'] = [];
                                req.data['subramos'] = [];
                                $scope.users[index] = req.data;

                            });
                        }
                    });
                }
            });

        }

    };

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
      } else {
        $scope.contractors_data.length = 0;
      }
    }

    var stuffLoaded = 0;
    var thingsToLoad = 0;

    $scope.sex = [
      { name: 'MASCULINO', value: 'M' },
      { name: 'FEMENINO', value: 'F' }
    ];

    order.insuranceObject = {};
    order.user = usr;
    order.hasReceipts = false;
    // Defaults
    order.show = {
      ot: false,
      receipt: false,
      generateReceipts: false,
      receiptsGenerated: false,
      firstTab: true,
      showForms: false,
      showCoverages: false,
      isPolicy: false
    };

    // var vm =
    $scope.vm = {
      files: []
    }

    order.form = {
      contratante: '',
      poliza: '',
      folio: '',
      ramo: '',
      type: '',
      subramo: '',
      aseguradora: '',
      paquete: '',
      payment: '',
      startDate: new Date(),
      endingDate: new Date().setYear(new Date().getFullYear() + 1),
      ceder_comision: false,
      comision_percent: 0.0,
      udi: 0.0,
      business_line : 0
    }

    order.ceder_comision = ceder_comision;
    $scope.ceder_comision = false // para mostrar los valores de las claves

    order.subforms = {
      auto: {
        selectedCar: {}
      }, //template.formulario.automoviles
      life: {
        beneficiariesList: [],
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

    order.autocomplete = autocomplete;
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
        SweetAlert.swal('Error','El porcentaje del beneficiario'+ index+', no puede ser mayor a 100.00.','error');
        return
      }
      if (helpers.beneficiariesPercentageGreaterThanZero(order.subforms.life.beneficiariesList)) {
        SweetAlert.swal("Error", "Revise los porcentajes de los beneficiarios (la suma no debe pasar de 100)", "error")
        return
      }
    }
    function ceder_comision(flag) {

      if(order.form.ceder_comision == true){
        if (flag == true){
          SweetAlert.swal({
                title: '¿Está seguro?',
                text: "Estas seguro de que deseas ceder la comisión?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si, estoy seguro.",
                cancelButtonText: "Cancelar",
                closeOnConfirm: true
            }, function(isConfirm) {
                if (isConfirm) {
                    $scope.ceder_comision = order.form.ceder_comision;
                    // SweetAlert.swal("¡Eliminado!", "El archivo fue eliminado.", "success");
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

    function getmatches(word) {
      $http.post(url.IP+ 'cars-match/', {'matchWord':word})
      .then(function(response){
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


      })
      .catch(function(e) {

      });
    }

      // $scope.selectedCar = order.subforms.selectedCar;
    function autocomplete(param){
      try{
        if(param.val.length >1 ){
          getmatches(param.val);
        }
      }
      catch(e){}
    };

    $scope.changeIva = function (parValue) {
      if(!parValue) {
        swal("La póliza se creará sin IVA.")
      }
    }

    $scope.$watch('order.subforms.auto.selectedCar.val', function(newValue, oldValue) {
      try{
          order.subforms.auto.brand = order.subforms.auto.selectedCar.val.value.car_brand;
          order.subforms.auto.model = order.subforms.auto.selectedCar.val.value.car_model;
          order.subforms.auto.version = order.subforms.auto.selectedCar.val.value.short_description.replace(order.subforms.auto.selectedCar.val.value.car_model,'');
      }
      catch(e){}

    });

    $scope.checkEndDate = function () {

      if(order.form.startDate.length == 10) {
        order.form.endingDate = convertDate(mesDiaAnio(order.form.endingDate));
        order.form.end_of_validity = mesDiaAnio(order.form.endingDate);
        // $scope.dataToSave.end_of_validity = mesDiaAnio(order.form.endingDate);
      }

    };
    $scope.dateOut  = false;
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
      var date1 = new Date(order.form.start_of_validity);
      var date2 = new Date(order.form.end_of_validity);
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if(order.form.policy_days_duration > 366){
        order.poliza.numeroRecibos = 12 / order.poliza.payment;
      }
    };

    $scope.changeFrequency = function() {
      SweetAlert.swal({
        title: '¿Está seguro?',
        text: "Si cambias la forma de pago los recibos actuales serán eliminados y deberás recalcular.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, estoy seguro.",
        cancelButtonText: "Cancelar",
        closeOnConfirm: true
      },
      function(isConfirm) {
          if (isConfirm) {
            $scope.frec_disabled = false;
            order.receipts = [];
            order.form.receipts = [];
            $scope.edited_pay_frequency = true;
            // SweetAlert.swal("¡Ok!", "", "success");
            // $http.delete(beneficiary.url)
            // .then(function(response) {
            //   order.subforms.life.beneficiariesList.splice(index, 1);
            //   SweetAlert.swal("¡Eliminado!", "El archivo fue eliminado.", "success");
            // });
          }
      });
    };

    // life
    $scope.beneficiary = true;
    $scope.asegurado = true;
    $scope.addBeneficiary = function() {
        $scope.beneficiary = true;
    };


    $scope.delBeneficiary = function() {
      if (order.subforms.life.beneficiariesList.length == 0){
        $scope.beneficiary = false;
      }
    };


    $scope.addAsegurado = function() {
            $scope.asegurado = true;
        };
    $scope.delAsegurado= function() {
      if (order.subforms.life.aseguradosList.length == 0){
        $scope.asegurado = false;
      }
    };
    // -life

    function cCurrency (num){
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

    $scope.generarRecibos = function(){
      var form_ = order.form.payment.value;
      if(form_ == 5){
        form_ = 12;
      }

      var initDate = new Date(order.form.start_of_validity);
      var endDate = new Date(order.form.end_of_validity);
      var months = helpers.monthDiff(initDate, endDate);

      var dateDiff = moment(endDate).diff(moment(initDate), 'days');

      for(var i = 0; i < order2.receipts.length; i++){
        if(i == 0){
          var dayStartDate = new Date(toDate(order.form.startDate)).getDate();
          var monthStartDate = new Date(toDate(order.form.startDate)).getMonth();
          var yearStartDate = new Date(toDate(order.form.startDate)).getFullYear();
          monthStartDate = monthStartDate + form_;
          if(monthStartDate > 11){
            monthStartDate = (monthStartDate % 12) + 1;
            yearStartDate++;
          }
          else{
            monthStartDate++;
          }
          if(dayStartDate < 10){
            dayStartDate = "0" + dayStartDate;
          }
          if(monthStartDate < 10){
            monthStartDate = "0" + monthStartDate;
          }
          var date = dayStartDate + "/" + monthStartDate + "/" + yearStartDate;
          order2.receipts[i].startDate = order.form.startDate;
          order2.receipts[i].endingDate = date;
        }
        if(i > 0){
          var dateNew = new Date(toDate(order2.receipts[i - 1].endingDate));
          var dayStartDate = dateNew.getDate();
          var monthStartDate = dateNew.getMonth();
          var yearStartDate = dateNew.getFullYear();
          monthStartDate = monthStartDate + form_;
          if(monthStartDate > 11){
            monthStartDate = (monthStartDate % 12) + 1;
            yearStartDate++;
          }else{
            monthStartDate++;
          }
          if(dayStartDate < 10){
            dayStartDate = "0" + dayStartDate;
          }
          if(monthStartDate < 10){
            monthStartDate = "0" + monthStartDate;
          }
          var date = dayStartDate + "/" + monthStartDate + "/" + yearStartDate;
          order2.receipts[i].startDate = order2.receipts[i - 1].endingDate;
          order2.receipts[i].endingDate = date;
        }

        if(order2.receipts[i].recibo_numero == 1) {
          order2.receipts[i].vencimiento = sumarDias(angular.copy(toDate(order2.receipts[i].startDate)), 30);
          order2.receipts[i].vencimiento = convertDate(order2.receipts[i].vencimiento);
        }
        else {
          order2.receipts[i].vencimiento = order2.receipts[i].startDate;
        }
      }
    };

    function sumarDias(fecha, dias){
      fecha.setDate(fecha.getDate() + dias);
      return fecha;
    }

    $scope.changeComision = function(event, backspace) {

      var len_value = String(order.form.give_comision).length;
      var value = parseFloat(order.form.give_comision);

      if(value > 100) {
        order.form.give_comision = 100;
      }
    };
    $scope.changeNoPoliza = function (noPoliza){
      if ($localStorage.poliza_number != noPoliza) {
        helpers.existPolicyNumber(noPoliza)
        .then(function(request) {
          if(request == true) {
            SweetAlert.swal("Error",MESSAGES.ERROR.POLICYEXIST, "error");
            order.form.poliza = '';
          }
        })
        .catch(function(err) {

        });
      }
    }

    $scope.changeAgrupacion = function(data){
      $scope.sub_asignaciones = data.subgrupos;
      $scope.sub_subasignaciones = [];
      if($scope.info_sub.subgrouping_level){
        $scope.sub_asignaciones.forEach(function(item){
          if(item.id == $scope.info_sub.subgrouping_level.id){
            $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subgrouping_level.id)
            .then(function(response) {
              order.form.subgrouping = response.data;
              $scope.changeSubagrupacion(item);
            });
          }
        });
        // $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subgrouping_level.id)
        // .then(function(response) {
        //   order.form.subgrouping = response.data;
        //   $scope.sub_asignaciones.forEach(function(item){
        //     if(item.id == order.form.subgrouping.id){
        //       $scope.changeSubagrupacion(item);
        //     }
        //   });
        // });
      }
    }

    $scope.changeSubagrupacion = function(data){
      if(data.subsubgrupos){
        $scope.sub_subasignaciones = data.subsubgrupos;
        if($scope.info_sub.subsubgrouping_level){
          $scope.sub_subasignaciones.forEach(function(item){
            if(item.id == $scope.info_sub.subsubgrouping_level.id){
              $http.get(url.IP + 'groupinglevel/' + $scope.info_sub.subsubgrouping_level.id)
              .then(function(response) {
                order.form.subsubgrouping = response.data;
              });
            }
          });
        }
      }
    }

    order.options = {
      checkDate: function(param) {


        if(param && param != 0) {
          var date = (new Date(order.form.startDate));
          order.form.endingDate = new Date(date.setYear(date.getFullYear() + 1));
          order.form.endingDate = convertDate(order.form.endingDate);

          if(order.form.aseguradora){
            get_claves();
          }

          order.form.start_of_validity = order.form.startDate;
          order.form.end_of_validity = toDate(order.form.endingDate);

          order.form.startDate = convertDate(order.form.startDate);

          if(order.form.contratante.id) {
            order.form.contratante.value = order.form.contratante;
            if(order.form.contratante.full_name) {
              order.form.contratante.val = order.form.contratante.full_name;
            } else if(order.form.contratante.name) {
              order.form.contratante.val = order.form.contratante.name;
            } else if(order.form.contratante.first_name) {
              order.form.contratante.val = order.form.contratante.first_name+' '+insuranceContractor.last_name+' '+insuranceContractor.second_last_name;
            } else if(order.form.contratante.j_name) {
              order.form.contratante.val = order.form.contratante.j_name;
            }
          }
        } else if(param == 0) {
          if(order.form.contratante.id) {
            order.form.contratante.value = order.form.contratante;
            if(order.form.contratante.full_name) {
              order.form.contratante.val = order.form.contratante.full_name;
            } else if(order.form.contratante.name) {
              order.form.contratante.val = order.form.contratante.name;
            } else if(order.form.contratante.first_name) {
              order.form.contratante.val = order.form.contratante.first_name+' '+insuranceContractor.last_name+' '+insuranceContractor.second_last_name;
            } else if(order.form.contratante.j_name) {
              order.form.contratante.val = order.form.contratante.j_name;
            }
          }
        }else{
          $scope.generarRecibos();
          SweetAlert.swal("Advertencia", MESSAGES.WARNING.WARNINGRECEIPTS, "warning");
        }

        // fecha de fin de vigencia
        if(order.form.startDate.length == 10) {
          var x = mesDiaAnio(order.form.startDate);
          var date = (new Date(x));
          order.form.endingDate = new Date(date.setYear(date.getFullYear() + 1));
          if(order.form.subramo){
            get_claves();
          }
          order.form.startDate = new Date(x);
          order.form.endingDate = convertDate(order.form.endingDate);
          order.form.start_of_validity = new Date(x);
          order.form.end_of_validity = new Date(mesDiaAnio(order.form.endingDate));

          order.form.startDate = convertDate(order.form.startDate);
        }
      },
      showPoliceCreator: function() {
        if (order.defaults.showReceipts === false) {
          return true;
        }
        return false;
      },
      hideTabs: function(param) {
        if(param==false){
          firstTime=false;
        }
        order.show.firstTab = param ? true : false;

        var primaNeta;
        var rpf;
        var derecho;
        var total=0.0;
        var subtotal=0.0;

        order2.receipts.forEach(function(elem){
          primaNeta+=parseFloat(elem.prima);
          derecho+=parseFloat(elem.derecho);
          rpf+=parseFloat(elem.rpf);
          total+=parseFloat(elem.total);
          subtotal+=parseFloat(elem.subTotal);
          // recibo_numero=elem.recibo_numero;
        });

        order.poliza.primaNeta=primaNeta;
        order.poliza.derecho=derecho.toFixed(2);
        order.poliza.rpf=rpf.toFixed(2);
        order.poliza.primaTotal=total;
        order.poliza.subTotal=subtotal;

      },
      changeProvider: function(obj) {
        order.form.aseguradora = obj;
        if (obj) {
          var wait =[]
          get_claves()
          wait.push($http.get(url.IP+'ramos-by-provider/'+order.form.aseguradora.id));
          $q.all(wait).then(function(response) {
            order.defaults.ramos = response[0].data;
          });
          // order.defaults.ramos = obj.ramo_provider;
        } else {

          order.defaults.ramos = [];
        }
        order.options.changeRamo(undefined);
      },
      changeClave: function(parClave) {
        order.defaults.comisiones = [];
        order.formService.clave = parClave.id;
      },
      changeRamo: function(obj) {
        order.form.ramo = obj;
        if (obj) {
          order.defaults.subramos = obj.subramo_ramo;
        } else {
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
        if (obj) {
          $scope.newCoverPack = true;
          order.defaults.coverages = [];
          order.defaults.coverageList = [];

          $scope.coverages_data = angular.copy(obj.coverage_package);
          obj.coverage_package.forEach(function(element, index) {
            if (element.default) {
              order.defaults.coverages.push(angular.copy(element));
            } else {
              order.defaults.coverageList.push(angular.copy(element));
            }
          });
          order.show.showCoverages = true;
        } else {
          order.defaults.coverages = [];
          order.show.showCoverages = false;
        }
      },
      isReceiptAvailable: function(payment, inhibit) {
        order.form.payment = payment;
        // order.receipts = [];
        //order.form.payment = angular.copy(payment);
        if (payment && order.form.poliza && !inhibit) {
          toaster.success('Ya puede generar sus recibos');
        } else if (payment && !inhibit) {
          toaster.info('Favor de ingresar el número de poliza');
        }
      },
      deleteCoverage: function(obj, index) {
        // if(usr.permiso.eliminar){
        obj.toDelete = true
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


        // }
        // else{
        //   SweetAlert.swal("Oops...", "No tienes permiso para eliminar registros", "error");
        // }
      },
      addCoverage: function(obj) {

        var dfd= $q.defer();
        var delCoverage = order.defaults.coverages.length > 0 ? false : true;
        var cvgCopy = angular.copy(obj);
        var wait = []
        wait.push($http.get(obj.url))
        $q.all(wait).then(function(coverage) {

          coverage.forEach(function(cvg) {
            dfd.resolve(cvg)

            var cvgCopy =cvg.data;

            order.defaults.coverages.forEach(function(item) {
              if(item.id == cvgCopy.id) {
                cvgCopy.sums_coverage = item.sums_coverage;
                cvgCopy.deductible_coverage = item.deductible_coverage;
              }
            });

            if(cvgCopy.id == obj.id) {
              obj.sums_coverage = cvgCopy.sums_coverage;
              obj.deductible_coverage = cvgCopy.deductible_coverage;

              if(!cvgCopy.coinsuranceInPolicy && obj.coinsuranceInPolicy) {

                var coaseguro_ = obj.coinsuranceInPolicy;
                if (coaseguro_){
                  obj.coinsuranceInPolicy =  {
                    value : coaseguro_ ? coaseguro_ : 0
                  };
                }
                else {
                  obj.coinsuranceInPolicy = {
                    value: coaseguro_ ? coaseguro_ : 0
                  };

                  obj.coinsuranceInPolicy =  {
                    value : coaseguro_ ? coaseguro_ : 0
                  };
                }

              } else if(cvgCopy.coinsuranceInPolicy && obj.coinsuranceInPolicy) {

              }
              if(!cvgCopy.topeCoinsuranceInPolicy && obj.topeCoinsuranceInPolicy) {

                var topecoaseguro_ = obj.topeCoinsuranceInPolicy;
                if (topecoaseguro_){
                  obj.topeCoinsuranceInPolicy =  {
                    value : topecoaseguro_ ? topecoaseguro_ : 0
                  };
                }
                else {
                  obj.topeCoinsuranceInPolicy = {
                    value: topecoaseguro_ ? topecoaseguro_ : 0
                  };

                  obj.topeCoinsuranceInPolicy =  {
                    value : topecoaseguro_ ? topecoaseguro_ : 0
                  };
                }

              } else if(cvgCopy.topeCoinsuranceInPolicy && obj.topeCoinsuranceInPolicy) {

              }
            }

            for (var i = order.defaults.coverages.length - 1; i >= 0; i--) {

              if (order.defaults.coverages[i].coverage_name === obj.coverage_name) {
               // toaster.info('Ya existe la cobertura: ' + obj.coverage_name);
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
              $scope.coverages_data.forEach(function(item) {
                if(item.coverage_name == obj.coverage_name) {
                  obj.sums_coverage = item.sums_coverage;
                  obj.deductible_coverage = item.deductible_coverage;
                }
              });

              order.defaults.coverages.push(obj);

              order.defaults.coverageList.forEach(function(coverage) {
                // coverage.sumInPolicy.value = cCurrency(coverage.sumInPolicy.value);
                // coverage.deductibleInPolicy.value = cCurrency(coverage.deductibleInPolicy.value)
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
          add: function(parBeneficiary) {
            var beneficiary = {
              person: 1
            };
            if(parBeneficiary) {
              beneficiary = parBeneficiary;
            }
            order.subforms.life.beneficiariesList.push(beneficiary);
          },
          destroy: function(index,beneficiary) {
            if(beneficiary.url){
              SweetAlert.swal({
                  title: '¿Está seguro?',
                  text: "El beneficiario se eliminará definitivamente aunque no guarde los cambios",
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Si, estoy seguro.",
                  cancelButtonText: "Cancelar",
                  closeOnConfirm: false
              }, function(isConfirm) {
                  if (isConfirm) {
                    // deleteIT(url, file.id)
                    $http.delete(beneficiary.url)
                    .then(function(response) {
                      order.subforms.life.beneficiariesList.splice(index, 1);
                      SweetAlert.swal("¡Eliminado!", "El dependiente fue eliminado definitivamente.", "success");
                    });
                  }
              });
            }
            else{
              order.subforms.life.beneficiariesList.splice(index, 1);
            }
          }
        },
        asegurados: {
          add: function(parAsegurados) {
            console.log("2173",parAsegurados)
            var asegurados = {
              
            };
            if(parAsegurados) {
              asegurados = parAsegurados;
            }
            order.subforms.life.aseguradosList.push(asegurados);
          },
          destroy: function(index,asegurados) {
            if(asegurados.url){
              SweetAlert.swal({
                  title: '¿Está seguro?',
                  text: "El asegurado se eliminará definitivamente aunque no guarde los cambios",
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Si, estoy seguro.",
                  cancelButtonText: "Cancelar",
                  closeOnConfirm: false
              }, function(isConfirm) {
                  if (isConfirm) {
                    // deleteIT(url, file.id)
                    $http.delete(asegurados.url)
                    .then(function(response) {
                      order.subforms.life.aseguradosList.splice(index, 1);
                      SweetAlert.swal("¡Eliminado!", "El asegurado fue eliminado definitivamente.", "success");
                    });
                  }
              });
            }
            else{
              order.subforms.life.aseguradosList.splice(index, 1);
            }
          }
        }
      },
      disease: {
        fillContractorData: function() {
          /*if (!order.form.contratante) {
            SweetAlert.swal("ERROR", MESSAGES.ERROR.CONTRACTORERROR, "error");
            order.options.checkDate('initial');
            return;
          }
          if (order.form.contratante.type_person != 'Fisica') {
            SweetAlert.swal("ERROR", MESSAGES.ERROR.CONTRACTORTYPEPERSON, "error");
            order.options.checkDate('initial');
            return;
          }

          insuranceService.getContractorPersonalInfo(order.form.contratante.id).then(function(response){
            var data = response.data;
            order.subforms.disease.first_name = data.first_name;
            order.subforms.disease.last_name=data.last_name;
            order.subforms.disease.second_last_name = data.second_last_name;
            order.subforms.disease.birthdate = new Date(data.birthday);
            order.subforms.disease.sex = data.sex;
          });*/

          if(!order.form.contratante.value){
            SweetAlert.swal("Error", MESSAGES.ERROR.CONTRACTORERROR, "error")
            return;
          }
          else{
            var contractor_ = order.form.contratante.value;
            if(order.form.contratante.value.type_person != 'Fisica' && order.form.contratante.value.type_person != 1){
              SweetAlert.swal("Error", MESSAGES.INFO.CONTRACTORTYPEPERSON, "error")
              return;
            }
            else{
              order.subforms.disease.first_name = contractor_.first_name;
              order.subforms.disease.last_name=contractor_.last_name;
              order.subforms.disease.second_last_name = contractor_.second_last_name;
              order.subforms.disease.birthdate = convertDate(contractor_.birth_date);
              order.subforms.disease.sex = contractor_.sex;
            }
          }
        },
        relationships: {
          add: function(relacion) {
            if (relacion) {
              order.options.disease.relationships.selectType(relacion.relationship, null);
              order.subforms.disease.relationshipList.push(relacion);
            } else {
              var rel = {
                first_name: "",
                last_name: "",
                second_last_name: "",
                birthdate: null,
                sex: null,
                relationship: null,
                accident: null
              };
              order.subforms.disease.relationshipList.push(rel);
            }
          },
          destroy: function(index, rel) {
            if(rel.url){
              SweetAlert.swal({
                  title: '¿Está seguro?',
                  text: "El dependiente se eliminará definitivamente aunque no guarde los cambios",
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Si, estoy seguro.",
                  cancelButtonText: "Cancelar",
                  closeOnConfirm: false
              }, function(isConfirm) {
                  if (isConfirm) {
                      // deleteIT(url, file.id)
                      $http.delete(rel.url)
                          .then(function(response) {
                              order.subforms.disease.relationshipList.splice(index, 1);
                              SweetAlert.swal("¡Eliminado!", "El dependiente fue eliminado definitivamente.", "success");
                          });
                  }
              });
            }
            else{
              order.subforms.disease.relationshipList.splice(index, 1);
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


            if (newValue.relationship == 1 || newValue.relationship == 2) {// titular y conyugue
              order.options.disease.types[newIndex].disabled = true
            }

            if (oldValue) {

              order.options.disease.types.some(function(val, index) {
                if (val.relationship == oldValue.relationship) {
                  oldIndex = index;
                  return true;
                }
              });

              if (oldValue.relationship == 1 || oldValue.relationship == 2) {// titular y conyugue
                order.options.disease.types[oldIndex].disabled = false
              }
            }
          }
        },
        // 1-Titular, 2-Conyuge, 3-Hijo
        types: angular.copy(tiposBeneficiarios)
      }

    };

    $scope.percentageRange = function(input, index){
      if(input < 0){
        order.defaults.coverages[index].coinsuranceInPolicy.value = 0;
      };
      if(input > 100){
        order.defaults.coverages[index].coinsuranceInPolicy.value = 100;
      };
    };

    $scope.percentageRange1 = function(input, index){
      if(input < 0){
        order.defaults.coverages[index].topeCoinsuranceInPolicy.value = 0;
      };
      if(input > 100){
        order.defaults.coverages[index].topeCoinsuranceInPolicy.value = 100;
      };
    };

    function get_claves() {
      // $http.post(url.IP+'claves-by-provider/'+order.form.aseguradora.id+ '/' + order.form.ramo.id + '/' + order.form.subramo.id,
        // {'initialDate': new Date(mesDiaAnio(order.form.startDate))})
      $http.get(url.IP+'claves-by-provider/'+order.form.aseguradora.id)
        .then(function(clavesResponse){
          if(clavesResponse.status == 200) {

            // if(clavesResponse.length == 0){
            // }
            // clavesResponse.data.forEach(function(clave) {
            //   clave.efective_date = new Date(clave.efective_date).toISOString().split("T")[0];
            // });

            clavesResponse.data.forEach(function(clave) {

              clave.clave_comision.forEach(function(item) {

                // clave.efective_date = new Date(clave.efective_date).toISOString().split("T")[0];
                item.efective_date = new Date(item.efective_date).toISOString().split('T')[0];

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
                if(order.form.subramo.subramo_name == $scope.clave_poliza.clave_comision[i].subramo){
                  $scope.comisiones_poliza.push($scope.clave_poliza.clave_comision[i]);
                }
              }catch(e){}
            }
 
            order.form.comisiones = $scope.comisiones_poliza;
          }
        });
    }


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

    $scope.$watch('order.defaults.coverages', function(newValue, oldValue) {

      newValue.forEach(function(coverage) {
        coverage.deductible_coverage_parsed = [];
        coverage.sums_coverage_parsed = [];

        try {
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
        } catch(e){

      }
      });
    });

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
        // loadingThing("contractors");
        // ContratanteService.getMediumLevelContratantes()
        //   .then(function(res) {
        //     var contractors = [];
        //     res.forEach(function(contratante, index) {
        //       if(!contratante.j_name){
        //             contratante.id = blankName(contratante.id);
        //             contratante.groupName = contratante.group;
        //             contratante.name = blankName(contratante.first_name) + ' ' + blankName(contratante.last_name) + ' ' + blankName(contratante.second_last_name);


        //             contractors.push(contratante);

        //       }
        //       else{
        //             contratante.id = blankName(contratante.id);
        //             contratante.groupName = contratante.group;
        //             contratante.name = contratante.j_name;
        //             contractors.push(contratante);
        //       }
        //     });
        //     order.defaults.contractors = contractors;
        //     aThingIsDone("contractors");
        //   });
      }
    };

    var actualYear = new Date().getFullYear();
    var oldYear = actualYear - 80;
    for (var i = actualYear + 1; i >= oldYear; i--) {
      order.defaults.years.push(i)
    }

    function blankName(name) {
        if (name === undefined || name === "" || name === null) {
            return ''

        } else {
            return name;
        }
    }

    function getFormData(form) {

      order.defaults.coverages.forEach(function(item) {
        // suma asegurada
        if(item.sumInPolicy == undefined || item.sumInPolicy == null || item.sumInPolicy == ''){
          item.sumInPolicy = {
            label: 0,
            value: 0
          }
        }
        if(!item.sumInPolicy.label && item.sumInPolicy.value) {
          item.sumInPolicy.label = item.sumInPolicy.value;
        } else if(item.sumInPolicy.label && item.sumInPolicy.value) {
          if(item.sumInPolicy.label !== item.sumInPolicy.value) {
            item.sumInPolicy.label = item.sumInPolicy.value;
          }
        }

        // deducible
        if(item.deductibleInPolicy) {

          if(!item.deductibleInPolicy.label && item.deductibleInPolicy.value) {
            item.deductibleInPolicy.label = item.deductibleInPolicy.value;
          } else if(item.deductibleInPolicy.label && item.deductibleInPolicy.value) {
            if(item.deductibleInPolicy.label !== item.deductibleInPolicy.value) {
              item.deductibleInPolicy.label = item.deductibleInPolicy.value;
            }
          }
        }

        // coinsurance
        // if(item.coinsuranceInPolicy) {

        //   if(!item.coinsuranceInPolicy.label && item.coinsuranceInPolicy.value) {
        //     item.coinsuranceInPolicy.label = item.coinsuranceInPolicy.value;
        //   } else if(item.coinsuranceInPolicy.label && item.coinsuranceInPolicy.value) {
        //     if(item.coinsuranceInPolicy.label !== item.coinsuranceInPolicy.value) {
        //       item.coinsuranceInPolicy.label = item.coinsuranceInPolicy.value;
        //     }
        //   }
        // }

      });

      var insurance = order.insuranceObject;
      form.poliza_number = form.poliza_number == "" ? 0 : form.poliza_number;
      form.url = insurance.url;
      form.id = insurance.id;
      form.owner = insurance.owner;
      form.created_at = insurance.created_at;
      form.internal_number = insurance.internal_number;
      form.old_policies = [];
      form.observations = insurance.observations;
      form.receipts = order.receipts;
      form.old_receipts = insurance.recibos_poliza;
      form.coverages = order.defaults.coverages;
      form.old_coverages = myInsurance.coverageInPolicy_policy;
      
      try{
        form.old_form = order.insuranceObject.accidents_policy.length > 0 ? order.insuranceObject.accidents_policy[0].url :
          order.insuranceObject.automobiles_policy.length > 0 ? order.insuranceObject.automobiles_policy[0].url :
            order.insuranceObject.damages_policy.length > 0 ? order.insuranceObject.damages_policy[0].url :
              order.insuranceObject.life_policy.length > 0 ? order.insuranceObject.life_policy[0].url :
                undefined;
      }
      catch(e){
        form.old_form = undefined
      }
      form.form_code = order.defaults.formInfo.code;

      try{
          insurance.old_policies.forEach(function(old) {
          form.old_policies.push(old.url);
        });
      }catch(e){
        form.old_policies = []
      }

      var code = order.defaults.formInfo.code;

      if (code === 9) {
        var auto = angular.copy(order.subforms.auto);
        form.form_object = {
          code: code,
          //insurance: res,
          form: auto
        }

      } else if (code === 1 || code == 30) {
        // Personal information

        $scope.dataIncompleteBenef_f = false;
        $scope.dataIncompleteBenef_j = false;
        var life = order.subforms.life;
        var beneficiaries = order.subforms.life.beneficiariesList;
        var personal_life = order.subforms.life.aseguradosList;
         if (order.subforms.life.beneficiariesList.length >= 0 && order.defaults.formInfo.code === 1 && $scope.beneficiary == true) {
          var count_j = 0;
          var count_f = 0;
          var beneficiariesList = _.map(order.subforms.life.beneficiariesList, function (item, i) {
            if (item.person == 1){
              if ((item.first_name == null || item.first_name == "" || item.first_name == undefined)) {
                $scope.dataIncompleteBenef_f = true;
                count_f = count_f +1;
              }
            }
            else if(item.person == 2){
              if ((item.j_name == null || item.j_name == "" || item.j_name == undefined)){
                $scope.dataIncompleteBenef_j = true;
                count_j =count_j + 1;
              }
            }

            if (item.person == 1){
              if ((item.first_name != null || item.first_name != "" || item.first_name != undefined)) {
                // $scope.dataIncompleteBenef_f = false
                $scope.d_f = false
              }
            }
            else if(item.person == 2){
              if ((item.j_name != null || item.j_name != "" || item.j_name != undefined)){
                // $scope.dataIncompleteBenef_j = false
                $scope.d_j = false
              }
            }
            });
            if(count_f > 0 && ($scope.dataIncompleteBenef_f == true) ||(count_j > 0 && $scope.dataIncompleteBenef_j == true)){
              var l = Ladda.create( document.querySelector( '.ladda-button' ) );
              l.start();
              SweetAlert.swal("Error", "Complete datos de beneficiario(s) nombre (si es Físico) o razón social (si es Moral)", "error")
              l.stop()
              return;
              }
            }

        // var personal = {
        //   first_name: life.first_name ? life.first_name : '',
        //   last_name: life.last_name ? life.last_name : '',
        //   second_last_name: life.second_last_name ? life.second_last_name : '',
        //   birthdate: life.birthdate,
        //   sex: life.sex ? life.sex : '',
        //   url: life.url ? life.url : '',
        //   full_name: life.first_name + ' ' + life.last_name + ' ' + life.second_last_name
        // };

        form.form_object = {
          code: code,
          personal: personal_life,
          relationships: beneficiaries,
          //insurance: res,
          smoker: order.subforms.life.smoker
        }

      } else if (code === 2 || code === 3 || code === 4) {
        var disease = order.subforms.disease;
        var relationships = order.subforms.disease.relationshipList;
        var type = helpers.diseaseType(order.defaults.formInfo.code);

        var personal = {
          first_name: disease.first_name ? disease.first_name : '',
          last_name: disease.last_name ? disease.last_name : '',
          second_last_name: disease.second_last_name ? disease.second_last_name : '',
          birthdate: new Date(datesFactory.toDate(disease.birthdate)),
          antiguedad: disease.antiguedad ? new Date(datesFactory.toDate(disease.antiguedad)) : null,
          sex: disease.sex ? disease.sex : '',
          url: disease.personal_url ? disease.personal_url : '',
          full_name: disease.first_name + ' ' + disease.last_name + ' ' + disease.second_last_name,
          policy_type: disease.policy_type && disease.policy_type.id ? disease.policy_type.id :disease.policy_type ? disease.policy_type : '',
        };
        form.form_object = {
          code: code,
          personal: personal,
          relationships: relationships,
          coinsurance: disease.coinsurance,
          //insurance: res
        }

      } else if (code === 5 || code === 6 || code === 7 || code === 8 || code === 10 || code === 11 || code === 12 || code === 13 || code === 14 || code === 14 || code === 31) {
        var damage = order.subforms.damage;
        var type = helpers.damageType(parseInt(code));
        //damage.sub_branch = res.subramo;
        damage.damage_type = order.subforms.damage.damage_type;
        //damage.policy = res.url;

        form.form_object = {
          //insurance: res,
          code: code,
          form: damage
        }

      } else {
        form.form_object = undefined;
      }

      return form;
    }

    $scope.changePerson = function(type, raw) {
        raw.person = type;
      }


    $scope.changeBusinessLine = function(val) {}

    $scope.changeCelula = function(val) {}

    $scope.changeSucursal = function(val) {}

    $scope.changeCurrency = function(val) {}

    $scope.changeConducto = function(val) {}

    order.save = {

      openPdf: function() {
        var wait =[]
        wait.push(insuranceService.getInsuranceData(myInsurance));
        $q.all(wait).then(function(response){
          pdfService.getPdf({ insuranceData : response[0] , open : true});

        });
      },

      downloadPdf: function() {
        var wait =[]
        wait.push(insuranceService.getInsuranceData(myInsurance));
        $q.all(wait).then(function(response){
          pdfService.getPdf({ insuranceData : response[0] , open : false});

        });
      },

      saveChangesInOt: function() { // guardar como OT
        if ($scope.dateOut == true) {
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATERANGE, "error");
          return;
        }
        var l_ot = Ladda.create( document.querySelector( '.ladda-button-ot' ) );
        l_ot.start();

        if(order.form.start_of_validity) {

          var startDate = new Date( order.form.start_of_validity).setHours(12,0,0,0);
          var endingDate = new Date( order.form.end_of_validity).setHours(11,59,59,0);
          order.form.startDate = new Date(startDate);
          order.form.endingDate = new Date(endingDate);

        } else {
          var startDate = new Date(mesDiaAnio(order.form.startDate)).setHours(12,0,0,0);
          var endingDate = new Date(mesDiaAnio(order.form.endingDate)).setHours(11,59,59,0);
          order.form.startDate = new Date(startDate);
          order.form.endingDate = new Date(endingDate);
        }

        if(order.form.contratante.value) {
          order.form.contratante = order.form.contratante.value;
        } else if(order.form.contratante.id) {

        }

        if(!usr.permiso.editar){
          l_ot.stop();
          SweetAlert.swal("Oops...", "No tienes permiso para editar registros", "error");
          return;
        }
        if(!order.form.ramo){
          if(!order.form.ramo.url){
            l_ot.stop();
            SweetAlert.swal("Oops...",MESSAGES.ERROR.RAMOREQUIRED, "error");
            return;
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


        if (!canBeOT()) {
          return;
        }

        if(!firstTime){
          var primaNeta;
          var derecho;
          var rpf;
          var total=0.0;
          var subtotal=0.0;
          order2.receipts.forEach(function(elem){
            primaNeta+=parseFloat(elem.prima);
            derecho+=parseFloat(elem.derecho);
            rpf+=parseFloat(elem.rpf);
            total+=parseFloat(elem.total);
            subtotal+=parseFloat(elem.subTotal);
          });

          var pneta=parseFloat(order.poliza.primaNeta);
          var vrpf=parseFloat(order.poliza.rpf);
          var vderecho=parseFloat(order.poliza.derecho);
          var vsubtotal=parseFloat(order.poliza.subTotal);
          var vtotal=parseFloat(order.poliza.primaTotal);
          if (vtotal.toFixed(2) != total.toFixed(2)) {
            l_ot.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.TOTALDOESNTMATCH, "error");
            order.options.checkDate('initial');
            return;
          }
        }

        // else{}
        var observacion =order.form.observations ? order.form.observations : '';
        var form = order.form;

        form = getFormData(form);

        form.observations=observacion;
        form.f_currency = order.f_currency;
        form.conducto_de_pago = order.conducto_de_pago;
        // form.sucursal = order.form.sucursal ? order.form.sucursal : '';

        // form status = new Date()> form.endingDate ? 13 : 14;
        form.status = 1;
        if(form.status != 1){
          if(form.receipts.length) {
            form.receipts.forEach(function(item) {
              var init = new Date(mesDiaAnio(item.startDate)).setHours(12,0,0,0);
              var end = new Date(mesDiaAnio(item.endingDate)).setHours(11,59,59,0);
              // var vencimiento = new Date(mesDiaAnio(item.vencimiento)).setHours(11,59,59,0);

              item.startDate = new Date(init);
              item.endingDate = new Date(end);
              // item.vencimiento = new Date(vencimiento);
              if(receipt){
                if(receipt.vencimiento) {
                  var vencimiento = new Date(toDate(receipt.vencimiento)).setHours(11.59,59,0);
                  receipt.vencimiento = new Date(vencimiento);
                }
              }

            });
          }
        }

        form.p_neta = order.poliza.primaNeta;
        form.descuento = order.poliza.descuento;
        form.p_total = order.poliza.primaTotal;
        form.derecho = order.poliza.derecho;
        form.rpf = order.poliza.rpf;
        form.iva = order.poliza.iva;

        if(order.form.ceder_comision){
          // form.comision_percent = order.form.comision_percent;
          form.udi = order.form.udi;
          if(order.form.comision_percent) {
            form.comision_percent = order.form.comision_percent;
          } else {
            form.comision_percent = order.form.clave.comission;
          }
        }
        else{
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
          var percent_ = parseFloat(order.form.comision) / 100;
          order.form.comission = (order.form.p_neta * percent_).toFixed(2);
        }

        if(order.f_currency){
          form.f_currency = order.f_currency.f_currency_selected;
        }

        if(order.conducto_de_pago){
          form.conducto_de_pago = order.conducto_de_pago.conducto_de_pago_selected;
        }
        try{
          form.vendor = order.form.vendor.url;
        }
        catch(e){
          form.vendor = '';
        }

        try{
          form.responsable = order.form.responsable.url;
        }
        catch(e){
          form.responsable = '';
        }
        try{
          form.collection_executive = order.form.collection_executive.url;
        }
        catch(e){
          form.collection_executive = '';
        }

       try{
          form.hospital_level = order.form.hospital_level;
        }
        catch(e){
          form.hospital_level = '';
        }
       try{
          form.tabulator = order.form.tabulator;
        }
        catch(e){
          form.tabulator = '';
        }
        try{
          form.sucursal = order.form.sucursal.url;
        }
        catch(e){
          form.sucursal = '';
        }

        form.state_circulation = order.form.state_circulation ? order.form.state_circulation.state : '';
        form.business_line = order.form.business_line ? order.form.business_line : 0;
        form.identifier = order.form.identifier;
        form.celula = order.form.celula ? order.form.celula.url : '';
        form.groupinglevel = order.form.subsubgrouping ? order.form.subsubgrouping.url : order.form.subgrouping ? order.form.subgrouping.url : order.form.grouping_level ? order.form.grouping_level.url : '';
        
        insuranceService.updateFullOT(form)
          .then(function(updateResult) {
            var params = {
              'model': 1,
              'event': "POST",
              'associated_id': updateResult.id,
              'identifier': "actualizó la OT"
            }
            dataFactory.post('send-log/', params).then(function success(response) {
            l_ot.stop();
            });
            //varios referenciadores
            // for(var i=0; i<$scope.referenciadores.length; i++){
            //   $scope.referenciadores[i].policy = updateResult.url;
            //   $scope.referenciadores[i].comision_vendedor = $scope.referenciadores[i].comission_vendedor ? parseFloat($scope.referenciadores[i].comission_vendedor).toFixed(2) : 0
            //   if ($scope.referenciadores[i].url) {
            //     var ref_to_change=$scope.referenciadores[i];
            //     $http.patch($scope.referenciadores[i].url, $scope.referenciadores[i]).then(
            //       function success(request){
            //         console.log('zzzzzzzz',ref_to_change,request.data)
            //         try{
            //           console.log('ooooxxooo',ref_to_change,request.data)
            //           if((ref_to_change.ref_name).toLowerCase() != (request.data.ref_name).toLowerCase()){
            //             var params = {
            //               'model': 1,
            //               'event': "PATCH",
            //               'associated_id': updateResult.id,
            //               'identifier': " cambio el referenciador "+ref_to_change.ref_name +' por: '+request.data.ref_name+" a la póliza."
            //             }
            //             dataFactory.post('send-log/', params).then(function success(response) {
            //             });
            //           }
            //         }catch(iyu){console.log('iiiiiiiiii',iyu)}
            //       },
            //       function error(error) {
            //         console.log(error);
            //       })
            //     .catch(function(e){
            //       console.log(e);
            //     });
            //   }else{
            //     $scope.ref_policy = $scope.referenciadores[i];
            //     if($scope.ref_policy){
            //       if ($scope.referenciadores[i].referenciador) {
            //         var ref = {}
            //         ref.referenciador = $scope.referenciadores[i].referenciador
            //         ref.comision_vendedor = $scope.referenciadores[i].comission_vendedor ? parseFloat($scope.referenciadores[i].comission_vendedor).toFixed(2) : 0
            //         ref.policy = updateResult.url
            //         dataFactory.post('referenciadores-policy/',ref)
            //         .then(
            //           function success(request){
            //             $http.get(ref.referenciador).then(function success(response_ref_plicy) {
            //               if(response_ref_plicy){
            //                 $scope.inforef = response_ref_plicy.data
            //                 var params = {
            //                   'model': 1,
            //                   'event': "PATCH",
            //                   'associated_id': updateResult.id,
            //                   'identifier': " añadio el referenciador "+$scope.inforef.first_name+' '+$scope.inforef.last_name+" a la póliza."
            //                 }
            //                 dataFactory.post('send-log/', params).then(function success(response) {
            //                   console.log('respon***',response)
            //                  });
            //               }
            //             })
            //           },
            //           function error(error) {
            //             console.log(error);
            //           })
            //         .catch(function(e){
            //           console.log(e);
            //         });
            //       }
            //     }
            //   }
            // }
            // 8888888888888
            for (var i = 0; i < $scope.referenciadores.length; i++) {
                // Captura el índice en una IIFE para que no cambie en el callback
                (function (idx) {
                  var ref_to_change = $scope.referenciadores[idx];              // mismo índice
                  var originalName  = (ref_to_change.ref_name || '').toLowerCase(); // snapshot del nombre original
                  var url           = ref_to_change.url;
                  // Actualiza el campo policy que se va a enviar
                  $scope.referenciadores[idx].policy = updateResult.url;
                  $scope.referenciadores[idx].comision_vendedor = $scope.referenciadores[idx].comision_vendedor ? parseFloat($scope.referenciadores[idx].comision_vendedor ).toFixed(2): 0
                  if (url) {
                    $http.patch(url, $scope.referenciadores[idx]).then(
                      function success(requestP) {
                        try {
                          // Compara únicamente para el MISMO índice (el que capturamos)
                          var newName = (requestP.data && requestP.data.ref_name ? requestP.data.ref_name : '').toLowerCase();
                          if (originalName !== newName) {
                            var params = {
                              model: 1,
                              event: "PATCH",
                              associated_id: updateResult.id,
                              identifier: "cambió el referenciador " + (ref_to_change.ref_name || '') +
                                          " por: " + (requestP.data.ref_name || '') + " a la póliza."
                            };
                            dataFactory.post('send-log/', params).then(function () { /* opcional: manejo éxito */ });
                          }
                        } catch (e) {
                          console.log('Error en comparación/log:', e);
                        }
                      },
                      function error(err) {
                        console.log(err);
                      }
                    ).catch(function (e) {
                      console.log(e);
                    });
                  }else{
                    $scope.ref_policy = $scope.referenciadores[i];
                    if($scope.ref_policy){
                      if ($scope.referenciadores[i].referenciador) {
                        var ref = {}
                        ref.referenciador = $scope.referenciadores[i].referenciador
                        ref.comision_vendedor = $scope.referenciadores[i].comision_vendedor ? parseFloat($scope.referenciadores[i].comision_vendedor ).toFixed(2): 0
                        ref.policy = updateResult.url
                        dataFactory.post('referenciadores-policy/',ref)
                        .then(
                          function success(request){
                            $http.get(ref.referenciador).then(function success(response_ref_plicy) {
                              if(response_ref_plicy){
                                $scope.inforef = response_ref_plicy.data
                                var params = {
                                  'model': 1,
                                  'event': "PATCH",
                                  'associated_id': updateResult.id,
                                  'identifier': " añadio el referenciador "+$scope.inforef.first_name+' '+$scope.inforef.last_name+" a la póliza."
                                }
                                dataFactory.post('send-log/', params).then(function success(response) { 
                                  console.log('?response*',response)
                                });
                              }
                            })
                          },
                          function error(error) {
                            console.log(error);
                          })
                        .catch(function(e){
                          console.log(e);
                        });
                      }
                    }
                  }
                })(i); // <- fijamos el índice
              }
            // 99999999999999
            // varios referenciadores
            if ($uibModalInstance) {
              //if(updateResult.status >= 200 && updateResult < 300){
              var index = container.indexOf(myInsurance);
              //container[index] = updateResult;

              container[index] = helpers.copyExisting(container[index], updateResult);
              toaster.success("OT Actualizada exitosamente");
              //}else{
              //    toaster.error("Error al actualizar OT");
              //}
              $uibModalInstance.close(200);
            }
            else{
              if($scope.countFile > 0){
                // uploadFiles(data.data.id);
                $scope.param = "ot";
                uploadFiles(myInsurance.id);
              }
              else {
                // toaster.success("OT actualizada");
                SweetAlert.swal("¡Listo!", MESSAGES.OK.UPGRADEOT, "success");
                $state.go('polizas.info', { polizaId: myInsurance.id });
              }
            }
          });

      },
      saveInsurance: function(folio) { // guardar como poliza
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
        l.start();

        var since = toDate(order.form.startDate).getTime();
        var until = toDate(order.form.endingDate).getTime();

        var sinceReceipt = toDate(order2.receipts[0].fecha_inicio).getTime();
        var untilReceipt = toDate(order2.receipts[order2.receipts.length - 1].fecha_fin).getTime();

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

        // if($scope.contractorToSave.email || $scope.contractorToSave.phonenumber){
          // $http.patch(order.form.contratante.value.url, $scope.contractorToSave);

        $http.patch(order.form.contratante.value.url,$scope.contractorToSave)
          .then(function(data) {
            if(data.status == 200 || data.status == 201){
              // toaster.info('Contratante Actualizado')
            }
          });
        // }

        order.form.is_renewable = order.renewal.is_renewable;

        // order.form.contratante = order.form.contratante.value;
         if(order.form.contratante.value) {
          order.form.contratante = order.form.contratante.value;
        } else if(order.form.contratante.id) {

        }

        if(!usr.permiso.editar){
          l.stop();
          SweetAlert.swal("Oops...", "No tienes permiso para editar registros", "error");
          return;
        }

        if(!order.form.subramo){
          if(!order.form.subramo.url){
            l.stop();
            SweetAlert.swal("Oops...", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
            return;
          }
        }
        if (!(order.form && order.form.ramo)) {
          $scope.enproceso=false;
          l.stop();
          SweetAlert.swal("Error", MESSAGES.ERROR.RAMOREQUIRED, "error");
          order.form.ramo.$setTouched();
          return;
        }
        if (!(order.form && order.form.subramo)) {
          $scope.enproceso=false;
          l.stop();
          SweetAlert.swal("Error", MESSAGES.ERROR.SUBRAMOREQUIRED, "error");
          order.form.subramo.$setTouched();
          return;
        }
        // se comento al crear recibos en 0 entra a return y no guarda 08/09/2025
        // if (!canBePoliza()) {
        //   console.log('ccccccccccccccccccccccccccccccccccccccccc')
        //   return;
        // }
        if(!firstTime){
          var primaNeta;
          var rpf;
          var derecho;
          var total=0.0;
          var subtotal=0.0;

          order2.receipts.forEach(function(elem){
            primaNeta+=parseFloat(elem.prima);
            derecho+=parseFloat(elem.derecho);
            rpf+=parseFloat(elem.rpf);
            total+=parseFloat(elem.total);
            subtotal+=parseFloat(elem.subTotal);
            elem.startDate = toDate(elem.startDate);
            elem.endingDate = toDate(elem.endingDate);

          });

          var pneta=parseFloat(order.poliza.primaNeta);
          var vrpf=parseFloat(order.poliza.rpf);
          var vderecho=parseFloat(order.poliza.derecho);
          var vsubtotal=parseFloat(order.poliza.subTotal);
          var vtotal=parseFloat(order.poliza.primaTotal);

          // validación para la prima total
          // if (vtotal.toFixed(2) != total.toFixed(2)) {
          //   l.stop();
          //   SweetAlert.swal("ERROR", MESSAGES.ERROR.TOTALDOESNTMATCH, "error");
          //   order.options.checkDate('initial');
          //   return;
          // }
        }

        var observacion = order.form.observations;
        var form = order.form;
        var fromDate = order.form.startDate
        var today = new Date(new Date().toISOString().split('T')[0]);
        form = getFormData(form);

        // return;

        form.observations= observacion ? observacion : '';
        form.f_currency = order.f_currency.f_currency_selected;
        form.conducto_de_pago = order.conducto_de_pago.conducto_de_pago_selected;

        form.p_neta = (parseFloat(order.poliza.primaNeta)).toFixed(2);
        form.p_total = order.poliza.primaTotal;
        form.derecho = (parseFloat(order.poliza.derecho)).toFixed(2);
        form.rpf = (parseFloat(order.poliza.rpf)).toFixed(2);
        form.iva = order.poliza.iva;
        form.descuento = order.form.descuento;
        form.comision = order.comision;
        form.comision_percent = order.comision_percent;

        order.form.comision_percent = form.comision_percent;
        if(order.form.ceder_comision){
          form.comision_percent = order.form.comision_percent;
          form.udi = order.form.udi;
          if(order.form.comision_percent) {
            form.comision_percent = order.form.comision_percent;
          } else {
            form.comision_percent = order.form.clave.comission;
          }
        }
        else{
          if(order.form.comision_percent) {
            form.comision_percent = order.form.comision_percent;
          } else {
            form.comision_percent = order.form.clave.comission;
          }
          form.udi = (order.form.clave.udi);
        }
        if(order.form.comision_percent) {
          // var percent_ = parseFloat(order.form.comision_percent) / 100;
          // order.form.comision = (order.form.p_neta * percent_).toFixed(2);
          // order.form.comision = (order.form.p_neta * percent_).toFixed(2);
        } else {
          if (order.form.comision) {
            var percent_ = parseFloat(order.form.comision.comission) / 100;
            order.form.comission = (order.form.p_neta * percent_).toFixed(2);
            order.form.comision = 0;
          }else{
            var percent_ = 0;
            order.form.comission = 0;
            order.form.comision = 0;
            if (myInsurance.comision) {
              order.form.comision = myInsurance.comision ? parseFloat(myInsurance.comision).toFixed(2) : 0;
            }
          }          
        }

        if(form.receipts.length) {

          if(order.form.domiciliado == 'true' || order.form.domiciliado == true) {
            var domiciliado = true;
          } else {
            var domiciliado = false;
          }

          form.receipts.forEach(function(item) {
            item.is_cat = domiciliado;
            var init = new Date(mesDiaAnio(item.fecha_inicio)).setHours(12,0,0,0);
            var end = new Date(mesDiaAnio(item.fecha_fin)).setHours(11,59,59,0);

            // item.startDate = new Date(init);
            // item.endingDate = new Date(end);
            item.fecha_inicio = new Date(init);
            item.fecha_fin = new Date(end);

            if(item.vencimiento) {
              var vencimiento = new Date(toDate(item.vencimiento)).setHours(11.59,59,0);
              item.vencimiento = new Date(vencimiento);
            }

            if($scope.edited_pay_frequency) {
              item.poliza = order.insuranceObject.url;
            }

          });
        }

        uploadFiles(myInsurance.id);
        if($scope.change_domiciliado) {

          form.receipts.forEach(function(item) {
            if(item.url){
              $http.patch(item.url, { 'is_cat': item.is_cat})
              .then(function(res_rec) {
              });
            }
          });

        }
        if(order.recibos_poliza && $scope.edited_pay_frequency ==false){
          $scope.recibos_todos.forEach(function(item, index){
            if (item) {
              if (item.recibo_numero) {
                try{
                  if(order.recibos_poliza[index].recibo_numero != undefined){
                    if(item.recibo_numero == order.recibos_poliza[index].recibo_numero){
                      var object = {
                        prima_neta: order.recibos_poliza[index].prima_neta,
                        rpf: order.recibos_poliza[index].rpf,
                        derecho: order.recibos_poliza[index].derecho,
                        sub_total: order.recibos_poliza[index].sub_total,
                        iva: order.recibos_poliza[index].iva,
                        prima_total: order.recibos_poliza[index].prima_total,
                        comision: order.recibos_poliza[index].comision,
                        fecha_inicio: toDate(order.recibos_poliza[index].fecha_inicio),
                        fecha_fin: toDate(order.recibos_poliza[index].fecha_fin),
                        vencimiento: toDate(order.recibos_poliza[index].vencimiento),
                        conducto_de_pago : order.conducto_de_pago.conducto_de_pago_selected,
                        status: 4
                      }

                      $http.patch(item.url, object).then(function(req){

                      });
                    }
                  }
                }catch(errc){console.log('0d',errc)}
              }
            }
          });
        }

        // al cambiar la FREC o no 14/06/2019
        if($scope.edited_pay_frequency ) {

          form.edited_pay_frequency = true;
          var success_receipts = 0;
          var error_receipts = 0;
          var all_receipts = 0;
          $scope.conteoEliminados = 0
          order.insuranceObject.recibos_poliza.forEach(function(item) {
            if(item.receipt_type == 1) {
              $http.delete(item.url)
              .then(function(req) {
                $scope.conteoEliminados = $scope.conteoEliminados+1
              });
            }
          });
          form.receipts.forEach(function(new_receipt, receipt_index) {
            if(!new_receipt.url) {}

            dataFactory.post('recibos/', new_receipt)
            .then(function(req) {
              order.insuranceObject.recibos_poliza.push(req.data);
              if(req.status == 200 || req.status == 201) {
                success_receipts += 1;
              } else {
                error_receipts += 1;
              }
              all_receipts = success_receipts + error_receipts;
              if(all_receipts == form.receipts+1) {
                  if(success_receipts == form.receipts.length) {
                  } else {
                    SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSERROR, "error")
                  }
              }

            });

          });
        }
        // } else {

        //   /** SI NO SE CAMBIA LA FORMA DE PAGO **/

        //   var old_receipts = order.form.old_receipts;

        //   var delete_receipts = old_receipts;
        //   var patch_receipts  = [];
        //   var save_receipts   = [];


        //   /* SE HACE UN RECORRIDO DE LOS RECIBOS QUE SE MUESTRAN AL CLEINTE
        //     - Se separan cuales se actuailzan y cuales se guardan
        //   */
        //   order.receipts.forEach(function(item_new) {
        //     if(item_new.url) {
        //       patch_receipts.push(item_new);
        //     } else {
        //       save_receipts.push(item_new);
        //     }

        //   });

        //    SIS SE TIENEN RECIBOS POR ACUALIZAR

        //   if(patch_receipts.length) {

        //     patch_receipts.forEach(function(item){
        //       delete_receipts.forEach(function(item_o, index_o) {
        //         if(item.url == item_o.url) {
        //            delete_receipts.splice(index_o, 1);
        //         }
        //       });
        //     });

        //   }

        //   // delete_receipts.forEach(function(item) {

        //   //   if(item.receipt_type == 1) {
        //   //     $http.delete(item.url)
        //   //     .then(function(req) {
        //   //     });
        //   //   }

        //   // });

        //   // patch_receipts.forEach(function(item) {
        //   //    $http.patch(item.url)
        //   //     .then(function(req) {
        //   //     });
        //   // });

        //   // save_receipts.forEach(function(item) {

        //   //   dataFactory.post('recibos/', item)
        //   //   .then(function success(req) {

        //   //     order.insuranceObject.recibos_poliza.push(req.data);
        //   //     all_receipts = success_receipts + error_receipts;

        //   //     if(all_receipts == form.receipts+1) {

        //   //         if(success_receipts == form.receipts.length) {

        //   //         } else {
        //   //           SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSERROR, "error")
        //   //         }
        //   //     }

        //   //   }, function error(error) {
        //   //   });
        //   // });

        //   form.receipts_changes = {
        //     delete_receipts : delete_receipts,
        //     patch_receipts  : patch_receipts,
        //     save_receipts   : save_receipts
        //   }

        // }
        // al cambiar la FREC o no 14/06/2019
        // else { // código agregado el viernes 25 enero 2019

        //   var original_rec = order.insuranceObject.recibos_poliza;
        //   var new_array = [];

        //   if(form.receipts.length) {
        //    form.receipts.forEach(function(new_receipt, receipt_index) {


        //     if(!new_receipt.url) {
        //       new_array.push(new_receipt);
        //     }

        //   });

        //   }

        //   if(original_rec.length == new_array.length) {
        //     // eliminar recibos y agregar los nuevos
        //     original_rec.forEach(function(item_) {

        //       if(item_.receipt_type == 1) {
        //         $http.delete(item_.url)
        //         .then(function(req) {
        //         });
        //       }

        //     });

        //     new_array.forEach(function(item) {

        //        dataFactory.post('recibos/', item)
        //       .then(function success(req) {
        //         order.insuranceObject.recibos_poliza.push(req.data);
        //         if(req.status == 200 || req.status == 201) {
        //           success_receipts += 1;
        //         } else {
        //           error_receipts += 1;
        //         }

        //         all_receipts = success_receipts + error_receipts;

        //         if(all_receipts == form.receipts+1) {

        //             if(success_receipts == form.receipts.length) {

        //             } else {
        //               SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSERROR, "error")
        //             }
        //         }

        //       }, function error(error) {
        //         console.log('___________-', error);
        //       });
        //     });


        //   } else {
        //     // agregar todos los recibos de new_array

        //     new_array.forEach(function(item) {

        //        dataFactory.post('recibos/', item)
        //       .then(function success(req) {
        //         order.insuranceObject.recibos_poliza.push(req.data);
        //         if(req.status == 200 || req.status == 201) {
        //           success_receipts += 1;
        //         } else {
        //           error_receipts += 1;
        //         }

        //         all_receipts = success_receipts + error_receipts;

        //         if(all_receipts == form.receipts+1) {

        //             if(success_receipts == form.receipts.length) {

        //             } else {
        //               SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSERROR, "error")
        //             }
        //         }

        //       }, function error(error) {
        //         console.log('___________-', error);
        //       });

        //     });

        //   }

        // }

        // ---------------------------  Código agregado jueves 31 enero 2019  ---------------------------

        // var old_receipts = order.insuranceObject.recibos_poliza;

        // var delete_receipts = old_receipts;
        // var patch_receipts  = [];
        // var save_receipts   = [];

        // order.receipts.forEach(function(item_new) {
        //   if(item_new.url) {

        //     patch_receipts.push(item_new);

        //   } else {
        //     save_receipts.push(item_new);
        //   }

        // });

        // if(patch_receipts.length) {

        //   patch_receipts.forEach(function(item){
        //     delete_receipts.forEach(function(item_o, index_o) {
        //       if(item.url == item_o.url) {
        //          delete_receipts.splice(index_o, 1);
        //       }
        //     });
        //   });

        // }

        // delete_receipts.forEach(function(item) {

        //   if(item.receipt_type == 1) {
        //     $http.delete(item.url)
        //     .then(function(req) {
        //     });
        //   }

        // });

        // patch_receipts.forEach(function(item) {
        //    $http.patch(item.url)
        //     .then(function(req) {
        //     });
        // });

        // save_receipts.forEach(function(item) {

        //   dataFactory.post('recibos/', item)
        //   .then(function success(req) {

        //     order.insuranceObject.recibos_poliza.push(req.data);
        //     all_receipts = success_receipts + error_receipts;

        //     if(all_receipts == form.receipts+1) {

        //         if(success_receipts == form.receipts.length) {

        //         } else {
        //           SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSERROR, "error")
        //         }
        //     }

        //   }, function error(error) {
        //     console.log('___________-', error);
        //   });
        // });
        // return;

        if(order.subforms.auto.policy_type){
          form.policy_type = order.subforms.auto.policy_type;
          form.procedencia = order.subforms.auto.procedencia;
          form.charge_type = order.subforms.auto.charge_type;
        }

        if(order.f_currency){
          form.f_currency = order.f_currency.f_currency_selected;
        }

        if(order.conducto_de_pago){
          form.conducto_de_pago = order.conducto_de_pago.conducto_de_pago_selected;
        }

        if(order.form.start_of_validity) {

          var startDate = new Date( order.form.start_of_validity).setHours(12,0,0,0);
          var endingDate = new Date( order.form.end_of_validity).setHours(11,59,59,0);
          order.form.startDate = new Date(startDate);
          order.form.endingDate = new Date(endingDate);

        } else {
          var startDate = new Date(mesDiaAnio(order.form.startDate)).setHours(12,0,0,0);
          var endingDate = new Date(mesDiaAnio(order.form.endingDate)).setHours(11,59,59,0);
          order.form.startDate = new Date(startDate);
          order.form.endingDate = new Date(endingDate);
        }

        if(myInsurance.status != 15 && myInsurance.status != 11 && myInsurance.status != 12){
          var auxDate = new Date(order.form.startDate.getTime() - 86400000);
          if(auxDate < new Date() && new Date() < form.endingDate) {
            form.status = 14
          } else if(auxDate > new Date()) {
            form.status = 10
          } else if(new Date() > form.endingDate){
            form.status = 13
          }
        }

        try{
          form.vendor = order.form.vendor.url;
        }
        catch(e){
          form.vendor = '';
        }

        try{
          form.responsable = order.form.responsable.url;
        }
        catch(e){
          form.responsable = '';
        }
        try{
          form.sucursal = order.form.sucursal.url;
        }
        catch(e){
          form.sucursal = '';
        }
        try{
          form.collection_executive = order.form.collection_executive.url;
        }
        catch(e){
          form.collection_executive = '';
        }
        try{
          form.hospital_level = order.form.hospital_level;
        }
        catch(e){
          form.hospital_level = '';
        }
        try{
          form.tabulator = order.form.tabulator;
        }
        catch(e){
          form.tabulator = '';
        }

        // return;
        if (!order.form.folio) {
          form.folio =folio
        }

        // form.sucursal = order.form.sucursal ? order.form.sucursal : '';
        form.comision_derecho_percent = order.poliza.comision_derecho_percent ? order.poliza.comision_derecho_percent :$scope.insuranceOK.comision_derecho_percent; 
        form.comision_rpf_percent = order.poliza.comision_rpf_percent ? order.poliza.comision_rpf_percent :$scope.insuranceOK.comision_rpf_percent; 

        form.state_circulation = order.form.state_circulation ? order.form.state_circulation.state : '';
        form.identifier = order.form.identifier
        form.business_line = order.form.business_line ? order.form.business_line : 0;
        form.celula = order.form.celula ? order.form.celula.url : '';
        form.groupinglevel = order.form.subsubgrouping ? order.form.subsubgrouping.url : order.form.subgrouping ? order.form.subgrouping.url : order.form.grouping_level ? order.form.grouping_level.url : '';
        if(order && order.prima_comision && parseFloat(form.comision_percent) !=parseFloat(order.prima_comision)){
          form.comision_percent = order.prima_comision ? order.prima_comision : order.comision_percent ? order.comision_percent : 0;
        }
        insuranceService.updateFullInsurance(form)
          .then(function(updateResponse) {
            updateResponse.recibos_poliza.forEach(function (recibo){
              $http.patch(recibo,{'conducto_de_pago': form.conducto_de_pago});
            });
            applyGeneralConditionsAfterSave(updateResponse);
            if ($uibModalInstance) {
              var index = container.indexOf(myInsurance);
              container.splice(index, 1);
              toaster.success("Póliza actualizada");
              $uibModalInstance.close(20000);
            }
            else {
              if($scope.countFile > 0){
                $scope.param = "poliza";
                uploadFiles(myInsurance.id);

                var params = {
                  'model': 1,
                  'event': "POST",
                  'associated_id': updateResponse.id,
                  'identifier': "actualizó la póliza y adjuntó archivos."
                }
                dataFactory.post('send-log/', params).then(function success(response) {

                });
              }
              else {
                $http.get(order.form.contratante.url)
                  .then(function(response) {
                    if(response.data.email){
                    }
                });

                SweetAlert.swal("¡Listo!", MESSAGES.OK.UPGRADEPOLICY, "success");
                $state.go('polizas.info', { polizaId: updateResponse.id });
              }
              // varios referenciadores
              for (var i = 0; i < $scope.referenciadores.length; i++) {
                // Captura el índice en una IIFE para que no cambie en el callback
                (function (idx) {
                  var ref_to_change = $scope.referenciadores[idx];              // mismo índice
                  var originalName  = (ref_to_change.ref_name || '').toLowerCase(); // snapshot del nombre original
                  var url           = ref_to_change.url;

                  // Actualiza el campo policy que se va a enviar
                  $scope.referenciadores[idx].policy = updateResponse.url;
                  $scope.referenciadores[idx].comision_vendedor = $scope.referenciadores[idx].comision_vendedor ? parseFloat($scope.referenciadores[idx].comision_vendedor ).toFixed(2): 0

                  if (url) {
                    $http.patch(url, $scope.referenciadores[idx]).then(
                      function success(requestP) {
                        try {
                          // Compara únicamente para el MISMO índice (el que capturamos)
                          var newName = (requestP.data && requestP.data.ref_name ? requestP.data.ref_name : '').toLowerCase();
                          if (originalName !== newName) {
                            var params = {
                              model: 1,
                              event: "PATCH",
                              associated_id: updateResponse.id,
                              identifier: "cambió el referenciador " + (ref_to_change.ref_name || '') +
                                          " por: " + (requestP.data.ref_name || '') + " a la póliza."
                            };
                            dataFactory.post('send-log/', params).then(function () { /* opcional: manejo éxito */ });
                          }
                        } catch (e) {
                          console.log('Error en comparación/log:', e);
                        }
                      },
                      function error(err) {
                        console.log(err);
                      }
                    ).catch(function (e) {
                      console.log(e);
                    });
                  }else{
                    $scope.ref_policy = $scope.referenciadores[i];
                    if($scope.ref_policy){
                      if ($scope.referenciadores[i].referenciador) {
                        var ref = {}
                        ref.referenciador = $scope.referenciadores[i].referenciador
                        ref.comision_vendedor = $scope.referenciadores[i].comision_vendedor ? parseFloat($scope.referenciadores[i].comision_vendedor ).toFixed(2): 0
                        ref.policy = updateResponse.url
                        dataFactory.post('referenciadores-policy/',ref)
                        .then(
                          function success(request){
                            $http.get(ref.referenciador).then(function success(response_ref_plicy) {
                              if(response_ref_plicy){
                                $scope.inforef = response_ref_plicy.data
                                var params = {
                                  'model': 1,
                                  'event': "PATCH",
                                  'associated_id': updateResponse.id,
                                  'identifier': " añadio el referenciador "+$scope.inforef.first_name+' '+$scope.inforef.last_name+" a la póliza."
                                }
                                dataFactory.post('send-log/', params).then(function success(response) { 
                                  console.log('?response*',response)
                                });
                              }
                            })
                          },
                          function error(error) {
                            console.log(error);
                          })
                        .catch(function(e){
                          console.log(e);
                        });
                      }
                    }
                  }
                // varios referenciadores
                insuranceService.updateOldPolicy(updateResponse);
                })(i); // <- fijamos el índice
              }

              // for(var i=0; i<$scope.referenciadores.length; i++){
              //   $scope.referenciadores[i].policy = updateResponse.url;
              //   $scope.referenciadores[i].comision_vendedor = $scope.referenciadores[i].comission_vendedor ? parseFloat($scope.referenciadores[i].comission_vendedor).toFixed(2) : 0
              //   if ($scope.referenciadores[i].url) {
              //     var ref_to_change=$scope.referenciadores[i];
              //     $http.patch($scope.referenciadores[i].url, $scope.referenciadores[i]).then(
              //       function success(requestP){                      
              //       try{
              //         console.log('a cambiar*',ref_to_change.ref_name)
              //         console.log('nuevo*',requestP.data.ref_name)
              //         if((ref_to_change.ref_name).toLowerCase() != (requestP.data.ref_name).toLowerCase()){
              //           var params = {
              //             'model': 1,
              //             'event': "PATCH",
              //             'associated_id': updateResponse.id,
              //             'identifier': " cambio el referenciador "+ref_to_change.ref_name +' por: '+requestP.data.ref_name+" a la póliza."
              //           }
              //           dataFactory.post('send-log/', params).then(function success(response) {
              //           });
              //         }
              //       }catch(iyu){console.log('euuuuuuuuuu',iyu)}
              //       },
              //       function error(error) {
              //         console.log(error);
              //       })
              //     .catch(function(e){
              //       console.log(e);
              //     });
              //   }else{
              //     $scope.ref_policy = $scope.referenciadores[i];
              //     if($scope.ref_policy){
              //       if ($scope.referenciadores[i].referenciador) {
              //         var ref = {}
              //         ref.referenciador = $scope.referenciadores[i].referenciador
              //         ref.comision_vendedor = $scope.referenciadores[i].comision_vendedor ? parseFloat($scope.referenciadores[i].comision_vendedor ).toFixed(2): 0
              //         ref.policy = updateResponse.url
              //         dataFactory.post('referenciadores-policy/',ref)
              //         .then(
              //           function success(request){
              //             $http.get(ref.referenciador).then(function success(response_ref_plicy) {
              //               if(response_ref_plicy){
              //                 $scope.inforef = response_ref_plicy.data
              //                 var params = {
              //                   'model': 1,
              //                   'event': "PATCH",
              //                   'associated_id': updateResponse.id,
              //                   'identifier': " añadio el referenciador "+$scope.inforef.first_name+' '+$scope.inforef.last_name+" a la póliza."
              //                 }
              //                 dataFactory.post('send-log/', params).then(function success(response) { 
              //                   console.log('?response*',response)
              //                 });
              //               }
              //             })
              //           },
              //           function error(error) {
              //             console.log(error);
              //           })
              //         .catch(function(e){
              //           console.log(e);
              //         });
              //       }
              //     }
              //   }
              // }
              // varios referenciadores
              insuranceService.updateOldPolicy(updateResponse);
            }

          });
      },
      cancel: function() {
        if ($uibModalInstance) {
          $uibModalInstance.dismiss("Cancelado");
        } else {
          $state.go('polizas.info', { polizaId: myInsurance.id });
        }
      }
    };
    function isString(x) {
      return Object.prototype.toString.call(x) === "[object String]"
    }
    $scope.validatePolicy = function(param){
      if(param == 'poliza'){
        var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      }else{
        var l = Ladda.create( document.querySelector( '.ladda-button-ot' ) );
      }
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
          }else{
            console.log('continuar',$scope.referenciadores,order.acceso_cno_pol,$scope.referenciadores_copy)
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
        }
        if (!$scope.clavenoexistente) {
          l.stop();
          SweetAlert.swal("Error", MESSAGES.ERROR.CLAVE, "error");
          return;
        }  
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
          if(!order.subforms.life.aseguradosList[0].policy_type){
            l.stop();
            SweetAlert.swal("Error", "Selecciona un tipo.", "error");
            return;
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
          if(!order.subforms.auto.policy_type){
            l.stop();
            SweetAlert.swal("Error", MESSAGES.ERROR.ERRORTYPEAUTO, "error");
            return;
          }
        }else{
          if(!order.subforms.damage.damage_type){
            l.stop();
            SweetAlert.swal("Error", "Selecciona un tipo.", "error");
            return;
          }
          if(!order.subforms.damage.insured_item || order.subforms.damage.insured_item == undefined || order.subforms.damage.insured_item == "" || order.subforms.damage.insured_item == ''){
            l.stop();
            SweetAlert.swal("Error", "Agregue un Bien asegurado.", "error");
            return;                  
          }
        }
      }
      // if(!order.form.comision){
      //   l.stop();
      //   SweetAlert.swal("Error", MESSAGES.ERROR.COMISSION, "error");
      //   return;
      // }
      if(!order.form.paquete){
        l.stop();
        SweetAlert.swal("Error", "Elige un paquete", "error");
        return;
      }
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
          // personal_life
          if(order.subforms.life.aseguradosList){
            order.subforms.life.aseguradosList.forEach(function(asegs, index){
              var idx = index + 1
              // if(asegs.person == 1){
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
              // }
            });
          }
          // personal_life val
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
          // if(!order.subforms.auto.model){
          //   l.stop();
          //   SweetAlert.swal("Error", "Agrega el modelo del automóvil", "error");
          //   return;
          // }
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
        if($scope.edited_pay_frequency){
          if(!order.recibos_poliza || order.recibos_poliza.length == 0){
            l.stop();
            SweetAlert.swal("Error", MESSAGES.ERROR.RECEIPTSREQUIRED, "error")
            return
          }
        }
        // if($scope.arrayCoverage){
        //   for(var i = 0; i < $scope.arrayCoverage.length; i++){
        //     if($scope.arrayCoverage[i].deductibleInPolicy || $scope.arrayCoverage[i].sumInPolicy){
        //       $scope.count_coverage++;
        //     }
        //     if(i+1 == $scope.arrayCoverage.length){
        //       if($scope.count_coverage == 0){
        //         l.stop();
        //         SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGESREQUIRED, "error");
        //         return;
        //       }
        //     }
        //   };
        // }
        // if($scope.arrayCoverage.length == 0){
        //   l.stop();
        //   SweetAlert.swal("Error", MESSAGES.ERROR.COVERAGESREQUIRED, "error");
        //   return;
       
        if((order.receipts && order.receipts.length == 0) && (order.recibos_poliza && order.recibos_poliza.length == 0)){
          l.stop();
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRECEIPTS, "error");
          return;
        }
        else{
          var flag_save = false;
          if (order.receipts.length == 0) {
            if (order.recibos_poliza.length>0) {
              order.receipts = order.recibos_poliza
            }
          }
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
          if (order.form) {
            if (order.poliza.aplicarDescuento){
              order.form.descuento = parseFloat(order.poliza.descuento).toFixed(2);
            }else{
              order.form.descuento = 0;
            }
          }
        }
        // if(since != sinceReceipt){
        //   l.stop();
        //   SweetAlert.swal("ERROR", MESSAGES.ERROR.DATESOUT, "error");
        //   return;
        // }
        if(order.poliza.fy) {

          l.stop();

          var date_since = new Date(since);
          var fy_year = date_since.getFullYear() + 1;
          var fy_month = date_since.getMonth();
          var fy_day = date_since.getDate();

          var date_one_year = new Date(fy_year, fy_month, fy_day);
          var date_one_year_time = date_one_year.getTime();

          if(untilReceipt != date_one_year_time) {
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATESOUT_FY, "error");
            return;
          } else {
            if(flag_save_dependent == false){
              if($scope.arrayCoverage.length == $scope.count_coverage){
                l.stop();
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
                        order.save.saveInsurance(num_folio);
                      }else{
                        var num_folio = order.form.contratante.value.j_name.charAt(0)+'_'+ num;
                        order.save.saveInsurance(num_folio);
                      }

                    }
                  })
                }else{
                  order.save.saveInsurance();
                }
              }
              else{
                SweetAlert.swal({
                  title: 'Coberturas sin datos',
                  text: "Las coberturas sin suma asegurada y sin deducible no se guardarán, ¿Estás seguro de continuar?",
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
                          var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+ num;
                          order.save.saveInsurance(num_folio);
                          // if($scope.type_person_selected == 1){
                          //   var num_folio = order.form.contratante.value.last_name.charAt(0)+'_'+order.form.contratante.value.first_name.charAt(0)+'_'+ num;
                          //   order.save.saveInsurance(num_folio);
                          // }else{
                          //   var num_folio = order.form.contratante.value.j_name.charAt(0)+'_'+ num;
                          //   order.save.saveInsurance(num_folio);
                          // }

                        }
                      })
                    }else{
                      order.save.saveInsurance();
                    }

                  }
                  else{
                    l.stop();
                  }
                });
              }
            }
          }

        } else {
          // if(until != untilReceipt){
          //   l.stop();

          //   SweetAlert.swal("ERROR", MESSAGES.ERROR.DATESOUT, "error");
          //   return;

          // }
          // else{
            if(flag_save_dependent == false){
              if($scope.arrayCoverage.length == $scope.count_coverage){
                l.stop();
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
                      var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+ num;
                      order.save.saveInsurance(num_folio);
                      // if($scope.type_person_selected == 1){
                      //   var num_folio = order.form.contratante.value.last_name.charAt(0)+'_'+order.form.contratante.value.first_name.charAt(0)+'_'+ num;
                      //   order.save.saveInsurance(num_folio);
                      // }else{
                      //   var num_folio = order.form.contratante.value.j_name.charAt(0)+'_'+ num;
                      //   order.save.saveInsurance(num_folio);
                      // }

                    }
                  })
                }else{
                  order.save.saveInsurance();
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
                          var num_folio = order.form.contratante.value.full_name.charAt(0)+'_'+ num;
                          order.save.saveInsurance(num_folio);
                          // if($scope.type_person_selected == 1){
                          //   var num_folio = order.form.contratante.value.last_name.charAt(0)+'_'+order.form.contratante.value.first_name.charAt(0)+'_'+ num;
                          //   order.save.saveInsurance(num_folio);
                          // }else{
                          //   var num_folio = order.form.contratante.value.j_name.charAt(0)+'_'+ num;
                          //   order.save.saveInsurance(num_folio);
                          // }

                        }
                      })
                    }else{
                      order.save.saveInsurance();
                    }

                  }
                  else{
                    l.stop();
                  }
                });
              }
            }
          // }
        }
      }
      else{
        l.stop();
        order.save.saveChangesInOt();
      }
    };

    $scope.checkEmail = function(email){
      if(!validateEmail(email)){
        SweetAlert.swal("Error", "El formato del correo es invalido", "warning");
        return;
      }
    }
    
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
    // ========= INIT =========
order.cg = order.cg || {};
order.cg.editAction  = order.cg.editAction  || 'KEEP';   // KEEP | REPLACE | ADD
    order.cg.replaceMode = order.cg.replaceMode || 'AUTO';   // AUTO | NONE | SELECT
    order.cg.catalog = [];
    order.cg.currentDocs = [];   // docs ya asociadas (objetos condicion_detalle)
    order.cg.selectedDocs = [];  // para REPLACE SELECT
    order.cg.addDocs = [];       // para ADD
    order.cg.loading = false;
    order.cg.saving = false;

    function getProviderId() {
      return order.form.aseguradora && (order.form.aseguradora.id || order.form.aseguradora);
    }
    function getSubramoId() {
      return order.form.subramo && (order.form.subramo.id || order.form.subramo);
    }
    function uniq(arr){
      var map = {}, out = [];
      (arr || []).forEach(function(x){
        if(!x) return;
        if(!map[x]) { map[x] = true; out.push(x); }
      });
      return out;
    }

    // ========= CARGA CATALOGO + SELECCION EXISTENTE =========
    order.cg.loadCatalogAndCurrent = function() {
      var providerId = getProviderId();
      var subramoId  = getSubramoId();
      if(!providerId){
        providerId=$scope.insuranceOK.aseguradora && ($scope.insuranceOK.aseguradora.id || $scope.insuranceOK.aseguradora)
      }
      if(!subramoId){
        subramoId=$scope.insuranceOK.subramo && ($scope.insuranceOK.subramo.id || $scope.insuranceOK.subramo)
      }
      var policyId   = order.form.id; // en edición debe existir
      if(!policyId){
        policyId=$scope.insuranceOK && ($scope.insuranceOK.id || $scope.insuranceOK)
      }
      console.log('cccccccccccccccccc',subramoId,policyId,providerId)
      if(!providerId || !subramoId){
        order.cg.catalog = [];
        // no borres currentDocs si no quieres; yo lo dejo:
        order.cg.currentDocs = [];
        console.log('ossssssssss',order.cg)
        return $q.when();
      }

      order.cg.loading = true;

      return CondicionesGeneralesService.list({aseguradora: providerId, subramo: subramoId })
        .then(function(res){
          order.cg.catalog = res.data.results || res.data || [];
          if(!policyId) return [];
          // trae relaciones con condicion_detalle
          return dataFactory.get('polizas/' + policyId + '/condiciones-generales/');
        })
        .then(function(res){
          if(!res || !res.data) return;

          var rows = res.data.results || res.data || [];
          order.cg.currentDocs = rows
            .map(function(r){ return r.condicion_detalle; })
            .filter(function(x){ return x && x.id; });

          // si está en REPLACE SELECT, precarga selección con lo actual
          if(order.cg.editAction === 'REPLACE' && order.cg.replaceMode === 'SELECT'){
            order.cg.selectedDocs = angular.copy(order.cg.currentDocs);
          }
        })
        .finally(function(){
          order.cg.loading = false;
        });
    };

    // ========= ACCION CHANGE =========
    order.cg.onActionChange = function(){
      // cuando cambia el modo, prepara data sin borrar lo actual
      if(order.cg.editAction === 'REPLACE'){
        // si entra a SELECT, precarga con lo actual
        if(order.cg.replaceMode === 'SELECT'){
          order.cg.selectedDocs = angular.copy(order.cg.currentDocs || []);
        }
        order.cg.addDocs = [];
      }

      if(order.cg.editAction === 'ADD'){
        order.cg.addDocs = [];
        // no toques selectedDocs
      }

      if(order.cg.editAction === 'KEEP'){
        // no cambies nada
        order.cg.addDocs = [];
      }
    };

    // ========= APLICAR DESPUES DE GUARDAR =========
    // Llamar esta función después de guardar la póliza (POST/PUT) con el policyData retornado.
    function applyGeneralConditionsAfterSave(policyData){
      if(!policyData || !policyData.id) return $q.when();

      var policyId  = policyData.id;
      var providerId = getProviderId();
      var subramoId  = getSubramoId();

      if(!providerId || !subramoId) return $q.when();

      // KEEP: no hacemos nada
      if(order.cg.editAction === 'KEEP'){
        return $q.when();
      }

      order.cg.saving = true;

      // helpers de endpoint
      function setSelection(ids){
        return dataFactory.post(
          'polizas/' + policyId + '/condiciones-generales/set/',
          { document_ids: ids || [] }
        );
      }

      function autoAssignAll(){
        // usa tu endpoint AUTO
        return dataFactory.post(
          'asignar-condiciones-generales-poliza/',
          {
            policy_id: policyId,
            aseguradora: providerId,
            subramo: subramoId,
            replace: true
          }
        );
      }

      var promise;

      if(order.cg.editAction === 'REPLACE'){
        if(order.cg.replaceMode === 'AUTO'){
          promise = autoAssignAll();
        } else if(order.cg.replaceMode === 'NONE'){
          promise = setSelection([]);
        } else {
          // SELECT
          var ids = (order.cg.selectedDocs || []).map(function(d){ return d && d.id; }).filter(Boolean);
          promise = setSelection(ids);
        }
      }

      if(order.cg.editAction === 'ADD'){
        var addIds = (order.cg.addDocs || []).map(function(d){ return d && d.id; }).filter(Boolean);
        var currentIds = (order.cg.currentDocs || []).map(function(d){ return d && d.id; }).filter(Boolean);
        var finalIds = uniq(currentIds.concat(addIds));
        promise = setSelection(finalIds);
      }

      return (promise || $q.when())
        .then(function(){
          // refresca currentDocs para que UI se actualice
          return order.cg.loadCatalogAndCurrent();
        })
        .finally(function(){
          order.cg.saving = false;
        });
    }

    // ========= WATCH aseguradora/subramo =========
    // en edición: si cambian, recarga catálogo y current
    $scope.$watchGroup([getProviderId, getSubramoId], function(newVals, oldVals){
      // evita dispararse al inicio si aún no existe póliza
      if(!order.form || !order.form.id) return;
      // si cambió realmente
      if(oldVals && (newVals[0] !== oldVals[0] || newVals[1] !== oldVals[1])){
        // si el usuario cambia ramo/subramo/aseguradora, lo más seguro es forzar REPLACE SELECT vacío
        order.cg.editAction = 'REPLACE';
        order.cg.replaceMode = 'SELECT';
        order.cg.selectedDocs = [];
        order.cg.addDocs = [];
      }
      order.cg.loadCatalogAndCurrent();
    });

    // ========= EJEMPLO: INTEGRAR EN TU GUARDADO =========
    // donde guardas la póliza:
    // savePolicy().then(function(res){
    //   var policyData = res.data || res;
    //   return applyGeneralConditionsAfterSave(policyData).then(function(){ return policyData; });
    // });
    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    order.receipts = [];
    order.defaults.showReceipts = false;
    $scope.referenciadores = [{
      referenciador: $scope.referenciador
    }]
    // order.default.showReceipts = order.show.generateReceipts;
    order.amountReceipts = 0;
    order.poliza = {};

    if($stateParams.message == 1){
      SweetAlert.swal("Error", "Asegúrese de que el nombre del archivo no tenga más de 350 caracteres", "error");
    }
    else if($stateParams.message == 2){
      SweetAlert.swal("Error", MESSAGES.ERROR.FILETOOLARGE, "error");
    }

    if (!myInsurance) {
      insuranceService.getInsuranceRead($stateParams)
        .then(function(response) {
          myInsurance = response;
          $scope.myInsurance = myInsurance;
          $scope.poliza_id = angular.copy(response.id);
          order.form.give_comision = parseFloat(myInsurance.give_comision);
          order.poliza.url_policy=$scope.myInsurance.url;
          order.form.url_policy=$scope.myInsurance.url;
          activate();
          order.show.isPolicy = helpers.isPolicy(myInsurance);
        });
    } else {
      activate()
      order.show.isPolicy = helpers.isPolicy(myInsurance);
    }

    $scope.campo_agrupacion = false;
    $scope.campo_celula = false;
    $scope.campo_lineanegocio = false;
    $scope.moduleName='Célula';
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
    function activate() {
      $scope.createPackRen = false;
      var storedStateCirculation = order.subforms && order.subforms.auto && order.subforms.auto.state_circulation ? order.subforms.auto.state_circulation : '';
      if(!storedStateCirculation && myInsurance && myInsurance.state_circulation){
        storedStateCirculation = myInsurance.state_circulation;
      }
      order.form.state_circulation = storedStateCirculation;
      
      if ($location.path().indexOf('editar')) {
        $scope.noRecalculateReceipts = true;
        $scope.createPackRen = false;
      }else{
        $scope.noRecalculateReceipts = false;
      }
      
      dataFactory.get('sucursales-to-show-unpag/')
        .then(function success(response) {
          $scope.sucursalList = response.data;
      })

      dataFactory.post('celula_contractor_info/')
      .then(function(response) {
        $scope.celulas = response.data
      });

      dataFactory.get('groupingLevel-resume/')
      .then(function(response) {
        $scope.agrupaciones = response.data;
      });

      insuranceService.getVendors()
        .then(function success(data) {
          order.vendors = data.data;
          $scope.referenciador = data.data;
          $scope.referenciador.forEach(function(vendor1) {
            vendor1.first_name = vendor1.first_name.toUpperCase();
            vendor1.last_name = vendor1.last_name.toUpperCase()
            vendor1.name = vendor1.first_name.toUpperCase() + ' ' + vendor1.last_name.toUpperCase();
          });
          order.vendors.forEach(function(vendor) {
            vendor.name = vendor.first_name.toUpperCase() + ' ' + vendor.last_name.toUpperCase();
          });
          $scope.referenciador .forEach(function(vendor) {
            vendor.name = vendor.first_name.toUpperCase() + ' ' + vendor.last_name.toUpperCase();
          });
        },
        function error(error) {
          toaster.ERROR('No pudieron ser cargados los referenciadores')
        })

      $http.get(url.IP + 'usuarios/')
        .then(function(user) {
          user.data.results.forEach(function(vn) {
            vn.first_name = vn.first_name.toUpperCase()
            vn.last_name = vn.last_name.toUpperCase()
            vn.name = vn.first_name.toUpperCase() + ' ' + vn.last_name.toUpperCase();
          });
          order.responsables  = user.data.results;
          order.ejecutivos  = user.data.results;
        });

      $http.get(url.IP + 'polizas/' + myInsurance.id +'/archivos/')
      .then(function(response) {
        $scope.files = response.data.results;
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

      $scope.save_info_tab = function() {}

      $scope.identifier = function() {}

      $scope.changeType = function() {}

      $scope.frec_disabled = true;
      // if(!usr.permiso.editar){
      //   SweetAlert.swal("Oops...", "Los cambios que se hagan no surtirán efecto pues el usuario no tiene permiso para editar registros", "warning");
      // }

      order.loading = true;
      order.defaults.getContractorsByGroup();
      order.poliza.derecho = parseFloat(order.poliza.derecho)
      order.form.identifier = myInsurance.identifier;
      $scope.addReferenciador = function(type) {
        var addReferenciadores = {
          referenciador: $scope.referenciador ? $scope.referenciador : ""
        };
        $scope.referenciadores.push(addReferenciadores);
      }

      loadingThing("provider");
      var d = new Date();
      var curr_date = d.getDate();
      var curr_month = d.getMonth() + 1; //Months are zero based
      var curr_year = d.getFullYear();
      var date = curr_year + "-" + curr_month + "-" + curr_date;
      providerService.getProviderByKey(date)
        .then(function(data) {
          order.defaults.providers = data.data;
          aThingIsDone("provider");

          insuranceService.getInsuranceData(myInsurance)
            .then(function(insuranceData) {
              $scope.insuranceOK=insuranceData;
              order.form.status = insuranceData.status
              order.insurnaceData = insuranceData.status
              if (insuranceData.status == 1 || insuranceData.status == 2) {
                order.show.ot = true
              }else{
                order.show.ot = false
              }
              $scope.numRecs = 0
              $scope.totalRecs = 0
              // $scope.totalRecs = insuranceData.recibos_poliza.length
              insuranceData.recibos_poliza.forEach(function(i){
                if(i.receipt_type == 1 && i.status!=0){
                  $scope.totalRecs += 1
                }
                if(i.status == 4 && i.receipt_type == 1 && i.status!=0){
                  $scope.numRecs += 1
                }else if(i.status !=4){

                }
                order.form.domiciliado = insuranceData.domiciliada;
              })
              order.cg.currentDocs = order.cg.currentDocs || [];
              if(insuranceData){
                if (!insuranceData || !insuranceData.id) {
                  order.cg.currentDocs = [];
                  return $q.when();
                }
                dataFactory
                .get('polizas/' + insuranceData.id + '/condiciones-generales/')
                .then(function(res) {
                  var rows = res.data.results || res.data || [];
                  order.cg.currentDocs = rows
                    .map(function(r){ return r.condicion_detalle; })
                    .filter(function(d){ return d && d.id; });
                  return order.cg.currentDocs;
                })
                .catch(function() {
                  order.cg.currentDocs = [];
                });
                order.cg.loadCatalogAndCurrent();
              };
              if(insuranceData.automobiles_policy.length){
                order.form.policy_type = insuranceData.automobiles_policy[0].policy_type;
                order.form.procedencia = insuranceData.automobiles_policy[0].procedencia;
                order.form.charge_type = insuranceData.automobiles_policy[0].charge_type;
              }

              if(insuranceData.damages_policy.length){
                order.form.policy_type = insuranceData.damages_policy[0].damage_type;
              }

              if(insuranceData.recibos_poliza.length>0){
                order.hasReceipts=true;
              }
              else{
                order.hasReceipts=false;
              }

              if(insuranceData.hospital_level){
                order.form.hospital_level = insuranceData.hospital_level;
              }
              if(insuranceData.tabulator){
                order.form.tabulator = insuranceData.tabulator;
              }
              $localStorage.poliza_number = insuranceData.poliza_number;
              var initDate = new Date(new Date(insuranceData.start_of_validity).setHours(12,0,0,0));
              var endDate = new Date(new Date(insuranceData.end_of_validity).setHours(11,59,59,0));
              try{
                insuranceData.vendor.name = insuranceData.vendor.first_name + ' ' + insuranceData.vendor.last_name;
                order.form.vendor = insuranceData.vendor;
                $scope.original_vendor = insuranceData.vendor;
              }
              catch(e){
              }

              try{
                if(insuranceData.responsable){
                  insuranceData.responsable.name = insuranceData.responsable.first_name + ' ' + insuranceData.responsable.last_name;
                  order.form.responsable = insuranceData.responsable;
                  $scope.original_responsable = insuranceData.responsable;
                }
              }
              catch(e){
                console.log('Error responsable',e)
              }

              try{
                if(insuranceData.collection_executive){
                  insuranceData.collection_executive.name = insuranceData.collection_executive.first_name + ' ' + insuranceData.collection_executive.last_name;
                  order.form.collection_executive = insuranceData.collection_executive;
                  $scope.original_collection_executive = insuranceData.collection_executive;
                }
              }
              catch(e){
                console.log('Error ejecutivo de cobranza',e)
              }
              try{
                if(insuranceData.ref_policy){
                  if (insuranceData.ref_policy.length > 0) {
                    insuranceData.ref_policy.forEach(function(refs) {
                      $http.get(refs.referenciador).then(function success(response_ref_plicy) {
                        // if(response_ref_plicy){
                        //   var s_r = response_ref_plicy.data.user_info.info_vendedor[0].vendedor_subramos
                        //   s_r.forEach(function(sr) {
                        //     if ((sr.subramo == insuranceData.subramo.subramo_code) && (sr.provider == insuranceData.aseguradora.id)) {
                        //       if(response_ref_plicy){
                        //         // response_ref_plicy_vendor.comision_vendedor = sr.comision
                        //       }
                        //     }
                        //     // else if ((sr.subramo == 0) && (sr.provider == 0) && (sr.ramo == 0)) {
                        //     //   if(response_ref_plicy){
                        //     //     refs.comision_vendedor = sr.comision
                        //     //   }
                        //     // }
                        //   })
                        //   refs.data = response_ref_plicy.data
                        //   refs.referenciador = response_ref_plicy.data.url
                        //   refs.selectedRef = true
                        //   $scope.referenciadores.push(refs)
                        //   $scope.referenciadores.forEach(function(io){
                        //     if (io.referenciador == undefined) {
                        //       $scope.referenciadores.splice($scope.referenciadores.indexOf(io),1)
                        //     }
                        //   })
                        // }
                        if (response_ref_plicy &&
                          response_ref_plicy.data &&
                          response_ref_plicy.data.user_info &&
                          response_ref_plicy.data.user_info.info_vendedor &&
                          response_ref_plicy.data.user_info.info_vendedor.length > 0) {
                      
                          var s_r = response_ref_plicy.data.user_info.info_vendedor[0].vendedor_subramos;
                          
                          s_r.forEach(function(sr) {
                            if ((sr.subramo == insuranceData.subramo.subramo_code) && 
                                (sr.provider == insuranceData.aseguradora.id)) {
                              // Uncomment and assign commission if needed
                              // response_ref_plicy_vendor.comision_vendedor = sr.comision;
                            }
                          });
                          
                          refs.data = response_ref_plicy.data;
                          refs.referenciador = response_ref_plicy.data.url;
                          refs.selectedRef = true;
                          $scope.referenciadores.push(refs);
                          
                          // Clean up undefined referenciador entries
                          $scope.referenciadores = $scope.referenciadores.filter(function(io) {
                            return io.referenciador !== undefined;
                          });
                        }
                      
                      })
                  });
                  }
                }
                else if (insuranceData.vendor) {
                  $http.get(insuranceData.vendor.url).then(function success(response_ref_plicy_vendor) {
                    // if(response_ref_plicy_vendor){
                    //   response_ref_plicy_vendor.data = response_ref_plicy_vendor.data
                    //   response_ref_plicy_vendor.referenciador = response_ref_plicy_vendor.data.url
                    //   response_ref_plicy_vendor.vendor = response_ref_plicy_vendor.data.url
                    //   response_ref_plicy_vendor.comision_vendedor = response_ref_plicy_vendor.data.user_info.info_vendedor[0].gastos_operacion
                    //   $scope.referenciadores.push(response_ref_plicy_vendor)
                    // }
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
                      })
                    });
                  }else{
                    $scope.referenciadores.push($scope.referenciador)
                  }

              } catch(e){
                console.log('Error en referenciador',e)
              }
              try{
                if(insuranceData.sucursal){
                  insuranceData.sucursal.sucursal_name = insuranceData.sucursal.sucursal_name + ' - ' + insuranceData.sucursal.details;
                  order.form.sucursal = insuranceData.sucursal;
                  $scope.original_sucursal = insuranceData.sucursal;
                }
              }
              catch(e){
                console.log('Error sucursal',e)
              }

              order.form.is_renewable = insuranceData.is_renewable;
              order.form.business_line = insuranceData.business_line;
              order.form.sucursal = insuranceData.sucursal ? insuranceData.sucursal : '';
              order.form.address=insuranceData.address;
              order.form.clave= insuranceData.clave;
              order.form.observations= insuranceData.observations;
              order.form.poliza = insuranceData.poliza_number == '0' ? "" : insuranceData.poliza_number;

              if(insuranceData.state_circulation){
                $scope.statesArray.forEach(function(item){
                  if(item.state == insuranceData.state_circulation){
                    order.form.state_circulation = item;
                    $scope.order.subforms.auto.state_circulation = item;
                  }
                });
              }

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

              // order.f_currency = insuranceData.f_currency;
              order.poliza.primaTotal = (parseFloat(insuranceData.p_total)).toFixed(2);
              order.poliza.rpf = parseFloat(insuranceData.rpf);
              order.poliza.derecho = (parseFloat(insuranceData.derecho)).toFixed(2);
              order.poliza.descuento = parseFloat(insuranceData.descuento);
              order.poliza.iva = parseFloat(insuranceData.iva);
              order.poliza.primaNeta = parseFloat(insuranceData.p_neta);
              order.poliza.subTotal = parseFloat(insuranceData.sub_total).toFixed(2);

              var desc = parseFloat(order.poliza.descuento) / 100;
              // order.poliza.subTotal = (insuranceData.p_neta - desc) + insuranceData.rpf + insuranceData.derecho;
              var cantidad_desc = parseFloat(order.poliza.primaNeta) * desc;
              var p_neta_desc  = parseFloat(order.poliza.primaNeta) - parseFloat(cantidad_desc);
              // order.poliza.subTotal = p_neta_desc + parseFloat(insuranceData.rpf) + parseFloat(insuranceData.derecho);

              order.form.startDate = datesFactory.convertDate(initDate);
              order.form.endingDate = datesFactory.convertDate(endDate);

              order.form.start_of_validity = initDate;
              order.form.end_of_validity = endDate;

              order.form.udi = parseFloat(insuranceData.udi);
              order.form.comision_percent = parseFloat(insuranceData.comision_percent);

              // var insuranceContractor = insuranceData.natural ? insuranceData.natural : insuranceData.juridical ? insuranceData.juridical : undefined;
              var insuranceContractor = insuranceData.contractor;

              var date1 = new Date(order.form.start_of_validity);
              var date2 = new Date(order.form.end_of_validity);
              var timeDiff = Math.abs(date2.getTime() - date1.getTime());
              order.form.policy_days_duration = Math.ceil(timeDiff / (1000 * 3600 * 24));
              order.poliza.payment = (insuranceData.forma_de_pago.value).toString();
              order.poliza.numeroRecibos = insuranceData.recibos_poliza.length;

              if(order.form.policy_days_duration > 366){
                order.poliza.numeroRecibos = 12 / order.poliza.payment;
              }
              order.poliza.derecho = parseFloat(order.poliza.derecho)
              // folio
              if (insuranceData.folio) {
                order.form.folio = insuranceData.folio;
              }

              // folio interno
              if (insuranceData.internal_number) {
                order.form.internal_number = insuranceData.internal_number;
              }

              // agent
              if (insuranceContractor) {

                if(order.defaults.contractors.length > 0) {

                  order.defaults.contractors.some(function(agent) {
                    if (agent.url == insuranceContractor.url) {
                      order.form.contratante = {
                        value: undefined,
                        val: ''
                      };

                      order.form.contratante.value = agent;
                      if(agent.full_name) {
                        order.form.contratante.val = agent.full_name;
                      } else if(agent.name) {
                        order.form.contratante.val = agent.name;
                      } else if(agent.first_name) {
                        order.form.contratante.val = agent.first_name+' '+agent.last_name+' '+agent.second_last_name;
                      } else if(agent.j_name) {
                        order.form.contratante.val = agent.j_name;
                      }

                    }
                  });
                } else {
                    order.form.contratante = {}
                    if(order.form.contratante){
                      order.form.contratante.value = insuranceContractor;
                      if(insuranceContractor.full_name) {
                        order.form.contratante.val = insuranceContractor.full_name;
                      } else if(insuranceContractor.name) {
                        order.form.contratante.val = insuranceContractor.name;
                      } else if(insuranceContractor.first_name) {
                        order.form.contratante.val = insuranceContractor.first_name+' '+insuranceContractor.last_name+' '+insuranceContractor.second_last_name;
                      } else if(insuranceContractor.j_name) {
                        order.form.contratante.val = insuranceContractor.j_name;
                      }
                    } 
                }

              }

              $scope.$watch('order.form.contratante.value', function(newValue, oldValue) {

                if(order.form.contratante.value) {
                  // $scope.users.some(function(user) {
                  // if (user.url == order.form.contratante.value.vendor){
                  //     // order.form.vendor = user;
                  //   }
                  // })

                  // if (order.form.contratante.value.address_natural) {
                  //     order.defaults.address = order.form.contratante.value.address_natural
                  // } else{
                  //     order.defaults.address = order.form.contratante.value.address_juridical
                  // }
                  order.defaults.address = order.form.contratante.value.address_contractor
                  

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

              // provider and fill compo
              if (insuranceData.aseguradora) {
                order.defaults.providers.some(function(provider) {
                  if (provider.id == insuranceData.aseguradora.id) {
                    order.form.aseguradora = provider;
                    order.options.changeProvider(provider);
                    return true;
                  }
                });
              }
              // ramo and fill combos
              if (insuranceData.ramo) {
                var wait =[]
                // wait.push($http.get(order.form.aseguradora.url));
                wait.push($http.get(url.IP+'ramos-by-provider/'+order.form.aseguradora.id));
                $q.all(wait).then(function(response) {
                    order.defaults.ramos = response[0].data;
                    order.defaults.ramos.some(function(ramo) {
                      if (ramo.id == insuranceData.ramo.id) {
                        order.form.ramo = ramo;
                        order.options.changeRamo(ramo);
                        // order.poliza.rpf = insuranceData.rpf;
                        // order.poliza.derecho = insuranceData.derecho;
                        // order.poliza.descuento = insuranceData.descuento;
                        // order.poliza.primaNeta = insuranceData.p_neta;
                        // order.poliza.primaTotal = insuranceData.p_total;

                        // subramo and fill combos

                        order.defaults.subramos = ramo.subramo_ramo;

                        if (insuranceData.subramo) {
                          order.defaults.subramos.some(function(subramo) {
                            if (subramo.id == insuranceData.subramo.id) {
                              order.form.subramo = subramo;
                              order.options.changeSubramo(subramo);

                              // subforms
                              //form
                              var code = order.defaults.formInfo.code;
                              if (code === 9) { // auto
                                if (insuranceData.automobiles_policy.length > 0) {
                                  var subformInfo = insuranceData.automobiles_policy[0];
                                  order.subforms.auto = {
                                    brand: subformInfo.brand,
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
                                    policy_type: subformInfo.policy_type,
                                    procedencia: subformInfo.procedencia,
                                    charge_type: subformInfo.charge_type,
                                    service: subformInfo.service,
                                    version: subformInfo.version,
                                    beneficiary_name : subformInfo.beneficiary_name,
                                    beneficiary_address : subformInfo.beneficiary_address,
                                    beneficiary_rfc : subformInfo.beneficiary_rfc,
                                    driver: subformInfo.driver,
                                    adjustment : subformInfo.adjustment,
                                    mont_adjustment : subformInfo.mont_adjustment,
                                    special_team : subformInfo.special_team,
                                    mont_special_team : subformInfo.mont_special_team,
                                    year: parseInt(subformInfo.year)
                                  }
                                  $scope.usages.forEach(function(item){
                                    if(item.id == subformInfo.usage){
                                      order.subforms.auto.usage = item.id;
                                    }
                                  });
                                  if(insuranceData.state_circulation){
                                    $scope.statesArray.forEach(function(item){
                                      if(item.state == insuranceData.state_circulation){
                                        order.form.state_circulation = item;
                                        order.subforms.auto.state_circulation = item;
                                        $scope.order.subforms.auto.state_circulation = item;
                                      }
                                    });
                                  }
                                }
                              } else if (code === 1 || code == 30) {// vida

                                if (insuranceData.personal_life_policy && insuranceData.life_policy.length == 0) {
                                  insuranceData.personal_life_policy.forEach(function(pers) {
                                    var ben = {
                                      birthdate: datesFactory.convertDate(pers.birthdate),
                                      antiguedad: pers.antiguedad ? datesFactory.convertDate(pers.antiguedad) : null,
                                      first_name: pers.first_name,
                                      last_name: pers.last_name,
                                      second_last_name: pers.second_last_name,
                                      url : pers.url,
                                      sex: pers.sex,
                                      smoker: pers.smoker ? pers.smoker : 'False',
                                      policy_type: pers.policy_type ? pers.policy_type : 49,
                                    }

                                    order.options.life.asegurados.add(ben);
                                  });
                                }
                                if (insuranceData.life_policy.length > 0) {
                                  var subformInfo = insuranceData.life_policy[0];
                                  loadingThing("personal");
                                  // formService.getPersonalInfoByUri(subformInfo.personal.url)
                                  //   .then(function(personalResponse) {
                                      // var personal = subformInfo.personal = personalResponse.data;
                                      var personal = insuranceData.personal_life_policy;
                                      if(!personal.length){
                                        personal = insuranceData.life_policy[0].personal;
                                      }
                                      // order.subforms.life.first_name = subformInfo.personal.first_name;
                                      // order.subforms.life.url = subformInfo.personal.url;
                                      // order.subforms.life.last_name = subformInfo.personal.last_name;
                                      // order.subforms.life.second_last_name = subformInfo.personal.second_last_name;
                                      // order.subforms.life.birthdate = convertDate(subformInfo.personal.birthdate);
                                      // order.subforms.life.sex = subformInfo.personal.sex;
                                      order.subforms.life.smoker = subformInfo.smoker == undefined ? '' : subformInfo.smoker ? 'True' : 'False';
                                      order.subforms.life.beneficiariesList = [];
                                      if (insuranceData.personal_life_policy.length) {
                                        insuranceData.personal_life_policy.forEach(function(pers) {
                                          var ben = {
                                            birthdate: datesFactory.convertDate(pers.birthdate),
                                            antiguedad: pers.antiguedad ? datesFactory.convertDate(pers.antiguedad) : null,
                                            first_name: pers.first_name,
                                            last_name: pers.last_name,
                                            second_last_name: pers.second_last_name,
                                            url : pers.url,
                                            sex: pers.sex,
                                            smoker:pers.smoker ? pers.smoker : 'False',
                                            policy_type: pers.policy_type
                                          }
                                          if (ben.smoker == true) {
                                            ben.smoker = 'True'
                                          }else if(ben.smoker == false){
                                            ben.smoker = 'False'
                                          }
                                          order.options.life.asegurados.add(ben);
                                        });
                                      }else{
                                        try{
                                          var personal_antig = personal;
                                            var prs_life = {
                                              birthdate: datesFactory.convertDate(personal_antig.birthdate),
                                              antiguedad: personal_antig.antiguedad ? datesFactory.convertDate(personal_antig.antiguedad) : null,
                                              first_name: personal_antig.first_name,
                                              last_name: personal_antig.last_name,
                                              second_last_name: personal_antig.second_last_name,
                                              url : personal_antig.url,
                                              sex: personal_antig.sex,
                                              smoker:personal_antig.smoker ? personal_antig.smoker : 'False',
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

                                      subformInfo.beneficiaries_life.forEach(function(beneficiary) {
                                        var ben = {
                                          birthdate: datesFactory.convertDate(beneficiary.birthdate),
                                          antiguedad: beneficiary.antiguedad ? datesFactory.convertDate(beneficiary.antiguedad) : null,
                                          first_name: beneficiary.first_name,
                                          last_name: beneficiary.last_name,
                                          second_last_name: beneficiary.second_last_name,
                                          j_name: beneficiary.j_name,
                                          rfc: beneficiary.rfc,
                                          percentage: beneficiary.percentage,
                                          url : beneficiary.url,
                                          sex: beneficiary.sex,
                                          optional_relationship: beneficiary.optional_relationship,
                                          full_name: beneficiary.first_name + ' ' + beneficiary.last_name + ' ' + beneficiary.second_last_name,
                                          person: beneficiary.first_name ? 1 : 2
                                        }

                                        order.options.life.beneficiary.add(ben);
                                      });
                                      //order.subforms
                                      aThingIsDone("personal");
                                    // });
                                }
                              } else if (code === 2 || code === 3 || code === 4) {// otro tipo de info
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
                                      order.subforms.disease.policy_type = subformInfo.personal.policy_type;

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
                                }
                              } else {
                              }

                              $q.all(order.defaults.waitElement).then(function(packages) {
                                // package and fill combos
                                order.defaults.coverages = [];
                                if (insuranceData.paquete) {

                                  order.form.paquete = insuranceData.paquete;
                                  if(insuranceData.paquete.coverage_package.length) {
                                    var pack = insuranceData.paquete;
                                    pack.coverage_package.forEach(function(element, index) {
                                      // if (element.default) {
                                        // order.defaults.coverageList.push(angular.copy(element));
                                      // }
                                    });
                                  }

                                  if(order.defaults.packages.length) {
                                    // order.defaults.coverageInPackage = [];
                                    order.defaults.packages.some(function(pkg) {
                                      if (pkg.id == insuranceData.paquete.id) {
                                        order.form.paquete = pkg;
                                        order.options.changePackage(pkg);
                                        order.defaults.coverages = [];

                                        order.defaults.coverageList = [];
                                        var cob_demo = angular.copy(pkg.coverage_package);
                                        pkg.coverage_package.forEach(function(element, index) {
                                          if(myInsurance.coverageInPolicy_policy.length) {

                                            myInsurance.coverageInPolicy_policy.forEach(function(item) {
                                              if(element.coverage_name == item.coverage_name) {
                                                // eliminar cobertura del paquete
                                                cob_demo.splice(index, 1);

                                              }
                                            });
                                          }
                                        });

                                        order.defaults.coverageList = pkg.coverage_package;

                                        if (myInsurance.coverageInPolicy_policy.length > 0) {
                                          myInsurance.coverageInPolicy_policy.forEach(function(coverageInPolicy) {

                                            coverageInPolicy.sumInPolicy = {
                                              label: coverageInPolicy.sum_insured,
                                              value: coverageInPolicy.sum_insured
                                            }

                                            coverageInPolicy.deductibleInPolicy = {
                                              label: coverageInPolicy.deductible,
                                              value: coverageInPolicy.deductible
                                            }
                                            coverageInPolicy.primaInPolicy = coverageInPolicy.prima;

                                            if(isNaN(coverageInPolicy.coinsurance)){
                                              if(coverageInPolicy.coinsurance.indexOf("%") != -1){
                                                coverageInPolicy.coinsurance = coverageInPolicy.coinsurance.replace("%", "");
                                                coverageInPolicy.coinsuranceInPolicy = parseInt(coverageInPolicy.coinsurance);
                                              }
                                              else{
                                                coverageInPolicy.coinsuranceInPolicy = 1;
                                              }
                                            }
                                            else{
                                              coverageInPolicy.coinsuranceInPolicy = parseInt(coverageInPolicy.coinsurance);
                                            }

                                            if(coverageInPolicy.coinsuranceInPolicy < 0){
                                              coverageInPolicy.coinsuranceInPolicy = 1;
                                            };

                                            if(coverageInPolicy.coinsuranceInPolicy > 100){
                                              coverageInPolicy.coinsuranceInPolicy = 100;
                                            };
                                            //tope coaseguro
                                            if(isNaN(coverageInPolicy.topecoinsurance)){
                                              if(coverageInPolicy.topecoinsurance.indexOf("%") != -1){
                                                coverageInPolicy.topecoinsurance = coverageInPolicy.topecoinsurance.replace("%", "");
                                                coverageInPolicy.topeCoinsuranceInPolicy = parseInt(coverageInPolicy.topecoinsurance);
                                              }
                                              else{
                                                coverageInPolicy.topecoinsuranceInPolicy = 1;
                                              }
                                            }
                                            else{
                                              coverageInPolicy.topeCoinsuranceInPolicy = parseInt(coverageInPolicy.topecoinsurance);
                                            }

                                            if(coverageInPolicy.topeCoinsuranceInPolicy < 0){
                                              coverageInPolicy.topeCoinsuranceInPolicy = 1;
                                            };

                                            if(coverageInPolicy.topeCoinsuranceInPolicy > 100){
                                              coverageInPolicy.topeCoinsuranceInPolicy = 100;
                                            };

                                            order.options.addCoverage(coverageInPolicy);

                                            if(pkg.coverage_package.length) {

                                              pkg.coverage_package.some(function(coverageInPackage) {
                                                // 3 cosas a comparar (nombre, suma en opciones y deducible en opciones)

                                                if (coverageInPolicy.coverage_name == coverageInPackage.coverage_name) {
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
                                                  return true; // Si todo fue encontrado, termina el for, si no sigue busacndo

                                                } else {
                                                  var flag = 0;
                                                  var coverageInPackage = {
                                                    coverage_name: coverageInPolicy.coverage_name,
                                                    sumInPolicy: {
                                                      label: coverageInPolicy.sum_insured,
                                                      value: coverageInPolicy.sum_insured
                                                    },
                                                    deductibleInPolicy: {
                                                      label: coverageInPolicy.deductible,
                                                      value: coverageInPolicy.deductible
                                                    },
                                                    primaInPolicy: coverageInPolicy.prima,
                                                    coinsuranceInPolicy: coverageInPolicy.coinsurance,
                                                    topeCoinsuranceInPolicy: coverageInPolicy.topecoinsurance,
                                                    created_at: coverageInPolicy.created_at,
                                                    id: coverageInPolicy.id,
                                                    org: coverageInPolicy.org,
                                                    owner: coverageInPolicy.owner,
                                                    package: coverageInPolicy.package,
                                                    policy: coverageInPolicy.policy,
                                                    updated_at: coverageInPolicy.updated_at,
                                                    url: coverageInPolicy.url
                                                  };


                                                  // order.options.addCoverage(coverageInPackage);
                                                  // order.defaults.coverageInPackage.push(coverageInPackage);
                                                }

                                              });

                                            } else {

                                              var flag = 0;
                                              var coverageInPackage = {
                                                coverage_name: coverageInPolicy.coverage_name,
                                                sumInPolicy: {
                                                  label: coverageInPolicy.sum_insured,
                                                  value: coverageInPolicy.sum_insured
                                                },
                                                deductibleInPolicy: {
                                                  label: coverageInPolicy.deductible,
                                                  value: coverageInPolicy.deductible
                                                },
                                                primaInPolicy: coverageInPolicy.prima,
                                                coinsuranceInPolicy: coverageInPolicy.coinsurance,
                                                topeCoinsuranceInPolicy: coverageInPolicy.topecoinsurance,
                                                created_at: coverageInPolicy.created_at,
                                                id: coverageInPolicy.id,
                                                org: coverageInPolicy.org,
                                                owner: coverageInPolicy.owner,
                                                package: coverageInPolicy.package,
                                                policy: coverageInPolicy.policy,
                                                updated_at: coverageInPolicy.updated_at,
                                                url: coverageInPolicy.url
                                              };


                                              order.options.addCoverage(coverageInPackage);
                                              // return true;
                                            }

                                          });
                                        } else {

                                        }



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

                              order.renewal.is_renewable = insuranceData.is_renewable;
                              order.f_currency.f_currency_selected = insuranceData.f_currency;
                              order.conducto_de_pago.conducto_de_pago_selected = insuranceData.conducto_de_pago;
                              // recibos
                              if (insuranceData.recibos_poliza.length > 0) {
                                order.defaults.showReceipts = true;
                              }
                              if (insuranceData.recibos_poliza.length > 0) {
                                var aux=angular.copy(insuranceData.recibos_poliza);
                                var tmp=[];
                                     for(var i=0 ; i<aux.length;i++){
                                        for(var j=0 ; j<aux.length;j++){

                                          if(i+1 == aux[j].recibo_numero){
                                            tmp.push(aux[j]);

                                          }
                                        }
                                     }

                                     // return;
                                var prima_neta=0.0;
                                var rpf;
                                var derecho;
                                var subTotal=0.0;
                                var prima_total =0.0;

                                $scope.recibos_todos = [];

                                tmp.forEach(function(recibo, index) {
                                  if(recibo.receipt_type == 1) {

                                    var receipt = {
                                      'prima_neta': parseFloat(recibo.prima_neta),
                                      'recibo_numero':recibo.recibo_numero,
                                      'rpf': parseFloat(recibo.rpf),
                                      'derecho': parseFloat(recibo.derecho),
                                      'iva': parseFloat(recibo.iva),
                                      'subTotal': parseFloat(recibo.sub_total),
                                      'prima_total': parseFloat(recibo.prima_total),
                                      'fecha_inicio': datesFactory.convertDate(recibo.fecha_inicio),
                                      'fecha_fin': datesFactory.convertDate(recibo.fecha_fin),
                                      'vencimiento': datesFactory.convertDate(recibo.vencimiento),
                                      'comision': parseFloat(recibo.comision),
                                      'delivered': recibo.delivered,
                                      'url': recibo.url,
                                      'status': recibo.status,
                                      'id': recibo.id
                                    };

                                    if(recibo.status > 4) {
                                      $scope.liquidated_receipts = true;
                                    }

                                    if(recibo.isCopy == false){
                                      $scope.recibos_todos.push(receipt)
                                      if(recibo.status != 0){
                                        order.receipts.push(receipt);
                                        if(recibo.status != 4){
                                          order.recalcular = false;
                                        }
                                      }
                                    }
                                  }
                                });

                                var last_receipt = tmp[tmp.length -1];
                                var date_last_rec = new Date(tmp[tmp.length -1].fecha_fin);
                                var policy_init = order.form.start_of_validity;
                                var policy_end = order.form.end_of_validity;

                                var anios_vigencia = parseInt(policy_end.getFullYear()) - parseInt(policy_init.getFullYear());

                                // VALIDA SI LA PÓLIZA ES MULTIANUAL O NO
                                if(anios_vigencia > 1) {
                                  // DE SER MULTIANUAL, VERIFICA SI FUE CALCULADA POR EL PRIMER AÑO DE VIGENCIA O POR TODOS
                                  if(date_last_rec.getDate() == policy_init.getDate() &&
                                    date_last_rec.getMonth() == policy_init.getMonth() &&
                                    parseInt(date_last_rec.getFullYear()) == parseInt(policy_init.getFullYear()) +1) {

                                    order.poliza.fy = true;
                                  }

                                }
                              }

                              


                              $scope.originals_receipts = order.receipts;

                              // Loaded files
                              if(insuranceData && insuranceData.files && insuranceData.files.results){
                                order.files = insuranceData.files.results;
                              }else{
                                order.files = [];
                              }
                              order.insuranceObject = insuranceData;
                              aThingIsDone("insurance");

                              $scope.show_receipts = true;
                              return true;
                            }
                          });
                        }
                        return true;
                      }
                    });
                });


              }
            },
            function error(err) {
              console.log('error', err);
            });
      });
      if (order.form) {
        if (order.form.status == 1 || order.form.status == 2) {
          order.show.ot = true
        }else{
          order.show.ot = false
        }
      }
    }//******************************************************************** */
    
    $scope.changeReferenciador = function(ref) {
      if (ref) {
        if (ref.data) {
          if (ref.data.url != ref.referenciador) {
            $http.get(ref.referenciador).then(function success(c) {
              if (c &&
                c.data &&
                c.data.user_info &&
                c.data.user_info.info_vendedor &&
                c.data.user_info.info_vendedor.length > 0) {
                var subBranchsComisions = c.data.user_info.info_vendedor[0].vendedor_subramos
                subBranchsComisions.forEach(function(sr) {
                  if (((sr.subramo == order.form.subramo.subramo_code) && (sr.provider == order.form.aseguradora.id)) || ((sr.subramo == 0) && (sr.provider == 0))) {
                    ref.comision_vendedor = 0;
                    // ref.comision_vendedor = sr.comision;
                  }else{
                    ref.comision_vendedor = 0
                  }
                  })
              }
            })
          }
          if (ref.data.url == ref.referenciador) {
            $http.get(ref.referenciador).then(function success(c) {
              if (c &&
                c.data &&
                c.data.user_info &&
                c.data.user_info.info_vendedor &&
                c.data.user_info.info_vendedor.length > 0) {
                var subBranchsComisions = c.data.user_info.info_vendedor[0].vendedor_subramos
                subBranchsComisions.forEach(function(sr) {
                  if (((sr.subramo == order.form.subramo.subramo_code) && (sr.provider == order.form.aseguradora.id)) || ((sr.subramo == 0) && (sr.provider == 0))) {
                    ref.comision_vendedor = 0;
                    // ref.comision_vendedor = sr.comision;
                  }else if ((sr.subramo == 0) && (sr.provider == 0) && (sr.ramo == 0)) {
                    // refs.comision_vendedor = sr.comision
                    refs.comision_vendedor = 0
                  }else{
                    ref.comision_vendedor = ref.data.comision_policy
                  }
                  })
              }
            })
          }
        }
      }
      if (ref.referenciador) {
        $http.get(ref.referenciador).then(function success(c) {
          if (c &&
            c.data &&
            c.data.user_info &&
            c.data.user_info.info_vendedor &&
            c.data.user_info.info_vendedor.length > 0) {
            var subBranchsComisions = c.data.user_info.info_vendedor[0].vendedor_subramos
            subBranchsComisions.forEach(function(sr) {
              if (((sr.subramo == order.form.subramo.subramo_code) && (sr.provider == order.form.aseguradora.id)) || ((sr.subramo == 0) && (sr.provider == 0))) {
                // ref.comision_vendedor = sr.comision;
                ref.comision_vendedor = 0;
              }else{
                ref.comision_vendedor = 0
              }
              })
          }
        })
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
      text: "Los cambios no podrán revertirse, se eliminará de la póliza",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
      },
      function(isConfirm){
        if (isConfirm) {
          if (index && ref.url) {
            if(ref.url){
              var params = {
                'model': 1,
                'event': "POST",
                'associated_id': $scope.myInsurance.id,
                'identifier': "elimino un referenciador: "+ref.ref_name
              }
              dataFactory.post('send-log/', params).then(function success(response) {
              });
              $http.delete(ref.url);
            }
            $scope.referenciadores.splice(index, 1);
          }else{
            if(ref.url){
              var params = {
                'model': 1,
                'event': "POST",
                'associated_id': $scope.myInsurance.id,
                'identifier': "elimino un referenciador: "+ref.ref_name
              }
              dataFactory.post('send-log/', params).then(function success(response) {
              });
              $http.delete(ref.url);
            }
            $scope.referenciadores.splice(index, 1);
          }
        }
      });
    }
    // ------- Guardar sumas aseguradas y deducibles

    $scope.show_button_save_sum = false;
    $scope.show_button_save_ded = false;

    $scope.demo = function(param) {
      var model = formatValues.currency(param);
      return model;

    };
    $scope.sucursal = function (sc) {

    }
    $scope.saveSum = function (parValue, parCoverage) {

      order.form.paquete.coverage_package.forEach(function(item) {
        if(item.coverage_name == parCoverage.coverage_name) {

          var url_item = item.url;
          var obj = {
            sum_insured : parValue,
            default : false,
            coverage_sum: url_item
          };

          coverageService.createSumInsured(obj)
          .then(function(req) {
            if(req.id) {
              $scope.result_ = false;
              parCoverage.sums_coverage.push(req);
            }
          });
        }
      });


    };

    $scope.saveDed = function (parValue, parCoverage) {

      order.form.paquete.coverage_package.forEach(function(item) {
        if(item.coverage_name == parCoverage.coverage_name) {
          var url_item = item.url;
          var obj = {
            deductible : parValue,
            default : false,
            coverage_deductible: url_item
          };

          coverageService.createDeducible(obj)
          .then(function(req) {
            if(req.id) {
              $scope.result_ded = false;
              parCoverage.deductible_coverage.push(req);
            }
          });
        }
      });


    };

    //------------------------------

    $scope.countFile = 0;
    $scope.okFile = 0;

    /** Uploader files */
    $scope.userInfo = {
      id: 0
    };
    var uploader = $scope.uploader = new FileUploader({
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      },
    });

    // uploader.filters.push({
    //   name: 'customFilter',
    //   fn: function(item /*{File|FileLikeObject}*/, options) { //jshint ignore:line
    //     return this.queue.length < 20;
    //   }
    // });

    // ALERTA SUCCES UPLOADFILES
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
      // toaster.success(MESSAGES.OK.UPLOADFILES);
      if ($uibModalInstance) {
        $uibModalInstance.dismiss('cancel');
      }
      $scope.okFile++;
      if($scope.okFile == $scope.countFile){
        $timeout(function() {
          if($scope.param == 'poliza'){
            SweetAlert.swal(MESSAGES.OK.UPGRADEPOLICY, "", "success");
          }
          if($scope.param == 'ot'){
            SweetAlert.swal("¡Listo!", MESSAGES.OK.UPGRADEOT, "success");
          }
          $state.go('polizas.info', { polizaId: myInsurance.id });

          if($uibModalInstance) {
            $uibModalInstance.close(200);
          }
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
      item.url = $scope.userInfo.url;
      item.formData[0].nombre = item.file.name;
      item.alias = '';
      item.formData[0].owner = $scope.userInfo.id;
    };

    // $scope.deleteFile = deleteFile;

    // function deleteFile(file,container) {
    //   fileService.deleteFile(file,container);
    // }

    function uploadFiles(polizaId) {
        $scope.userInfo = {
          id: polizaId
        };
        $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + polizaId + '/archivos/';
        $timeout(function() {
            $scope.uploader.uploadAll();
            saveLogFile($scope.countFile,polizaId)
        }, 1000);
    }
    /** /Uploader files */
    function saveLogFile(num,id_p){
      if (num >0) {
        var params = {
          'model': 1,
          'event': "PATCH",
          'associated_id': id_p,
          'identifier': " añadio "+num+" archivos a la póliza."
        }
        dataFactory.post('send-log/', params).then(function success(response) {

        });        
      }
    }    
    /** Loading things **/

    function aThingIsDone(what) {
      stuffLoaded++;
      if (stuffLoaded >= thingsToLoad) {
        order.loading = false;
      }
    }

    function loadingThing(what) {
      thingsToLoad++;
      order.loading = true;
    }


    function canBeOT() {
      if (order.form.contratante) {
        return true;
      }
      SweetAlert.swal("Error","Necesita seleccionar un contratante" ,"error");
      return;
       order.options.checkDate('initial');
      return false;
    }

    function canBePoliza() {
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      var flag = true;
      var code = parseInt(order.defaults.formInfo.code);
      if (!canBeOT()) {
        flag = false;
      }
      if (order.receipts.length == 0) {
        flag = false;
        SweetAlert.swal("Recibos","Debe gener recibos" ,"error");
        l.stop();
        order.options.checkDate('initial');
      }

      if (!code) {
        flag = false;
        toaster.warning("Forma incompleta");
        order.options.checkDate('initial');
      } else if (code == 1 || code == 30) {//life
      } else if (code == 2 || code == 3 || code == 4) {//disease
        var subform = order.subforms.disease;
        if (subform.first_name == '' || subform.last_name == ''  || subform.sex == ''
          || !subform.first_name || !subform.last_name  || !subform.sex) {
          flag = false;
          // toaster.warning("Datos de formulario requerido");
          SweetAlert.swal("Error","Datos del formulario requeridos" ,"error");
          l.stop()
          order.options.checkDate('initial');
        }

      } else if (code == 5 || code == 6 || code == 7 || code == 8 || code == 10 || code == 11 || code == 12 || code == 13 || code == 14 || code ===31) {
        var damage = order.subforms.damage;
        if (damage.insured_item == '' || !damage.insured_item ) {
          flag = false;
          SweetAlert.swal("Error","Datos del formulario requeridos" ,"error");
          l.stop()
          order.options.checkDate('initial');
        }
      } else if (code == 9) {// auto
      }

      // if (order.defaults.coverages.length == 0) {
      //   flag = false;
      //   SweetAlert.swal("Coberturas","Al menos una cobertura es requerida" ,"warning");
      //   l.stop()
      //   order.options.checkDate(0);
      // }
      // else {
      //   order.defaults.coverages.some(function(item) {
      //     if (item.sumInPolicy == '' || !item.sumInPolicy ) {

      //       flag = false;
      //       SweetAlert.swal("Datos coberturas","Datos de coberturas requeridos" ,"warning");
      //       l.stop()
      //       order.options.checkDate('initial');
      //     }
      //     if (code == 2 || code == 3 || code == 4 || code == 5 || code == 6 || code == 7 || code == 8 || code == 10 || code == 11 || code == 12 || code == 13 || code == 14) {
      //       if (!item.coinsuranceInPolicy || item.coinsuranceInPolicy == '') {
      //       }
      //     }
      //   });
      // }

      return flag;
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

    function convertDate(inputFormat) {
      // console.log('fecha original',inputFormat)
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d_uno = new Date(inputFormat);
      var fecha = new Date(inputFormat);
      if (fecha.getUTCHours() <=11){
        fecha.setHours(fecha.getHours()+12);
      }else{
        fecha.setHours(fecha.getHours()+5);        
      }
      var d = fecha
      // var d = new Date(inputFormat).toISOString()//prueba
      // console.log('-fecha 2',d,new Date(d.toLocaleString()))
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
      // function pad(s) { return (s < 10) ? '0' + s : s; }
      // var d = new Date(inputFormat);
      // var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      // return date;
    }
    // Calculadora comision referenciador
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


    $('.datepicker-me input').datepicker();
    $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
    $.fn.datepicker.defaults.startView = 0;
    $.fn.datepicker.defaults.autoclose = true;
    $.fn.datepicker.defaults.language = 'es';
  }
})();