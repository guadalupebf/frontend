/* global angular */
(function() {
    'use strict';
    /* jshint devel: true */

    angular.module('inspinia')
        .controller('FianzasProgramaNewCtrl', FianzasProgramaNewCtrl);

    FianzasProgramaNewCtrl.$inject = ['appStates','datesFactory', 'dataFactory', 'SweetAlert','url', 'ContratanteService', 'groupService', 'contactService', 'generalService', 'FileUploader', 'toaster', 'helpers', 'globalVar',
                        'MESSAGES', '$uibModal','$filter', '$scope', '$rootScope', '$localStorage', '$timeout', '$q', '$state', '$sessionStorage', '$location','$http','$parse',
                        'exportFactory', 'PersistenceFactory'];

    function FianzasProgramaNewCtrl(appStates, datesFactory, dataFactory, SweetAlert,url, ContratanteService, groupService, contactService, generalService, FileUploader, toaster, helpers, globalVar, MESSAGES, $uibModal,
                        $filter, $scope, $rootScope, $localStorage, $timeout, $q, $state, $sessionStorage, $location,$http,$parse,
                        exportFactory, PersistenceFactory) {

        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);
        var orgParam = { params: { org: $localStorage.orgId } };
        // show / hide buttons
        $scope.fisicas = true;
        $scope.morales = false;
        $scope.flagPhone = false;
        $scope.responsables_natural = []
        $scope.responsables_juridical = []

        var vm = this;
        vm.org_name = usr.org;
        vm.Consultar = Consultar;
        vm.table ={};
        vm.changeTypePerson = changeTypePerson;
        vm.closeDropdown = closeDropdown;
        vm.order_asc = false;
        vm.listDocument = [
          {id: 1, name: 'Identificación Oficial',value : false, file: false,arch: {}},
          {id: 2, name: 'CURP',value : false, file: false,arch: {}},
          {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value : false, file: false,arch: {}},
          {id: 4, name: 'Comprobante de Domicilio',value : false, file: false,arch: {}},
          {id: 5, name: 'Formato de Identificación de Cliente Firmado',value : false, file: false,arch: {}},
          {id: 6, name: 'Poder',value : false, file: false,arch: {}},
        ];
        if (vm.org_name =='ancora') {
          vm.listDocument = [
            {id: 1, name: 'Identificación Oficial',value : false, file: false,arch: {}},
            {id: 2, name: 'CURP',value : false, file: false,arch: {}},
            {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value : false, file: false,arch: {}},
            {id: 4, name: 'Comprobante de Domicilio',value : false, file: false,arch: {}},
            {id: 5, name: 'Formato de Identificación de Cliente Firmado',value : false, file: false,arch: {}},
          ];
        }
        $scope.infoUser = $sessionStorage.infoUser;
        $scope.onlyFianzas = function(q){
          if (vm.form.only_sureties || vm.juridicalForm.only_sureties) {
            if (q==1) {            
              vm.listDocument.push(
                {id: 7, name: 'Carta nombramiento',value : false, file: false,arch: {}},
                {id: 8, name: 'Currículo',value : false, file: false,arch: {}},
                {id: 9, name: 'Contrato multiple de la afianzadora',value : false, file: false,arch: {}},
                {id: 10, name: 'Carta buro',value : false, file: false,arch: {}},
                {id: 11, name: 'Entrevista con la afianzadora',value : false, file: false,arch: {}},
                {id: 12, name: 'RFC',value : false, file: false,arch: {}},
                {id: 13, name: 'Recibos de nomina',value : false, file: false,arch: {}},
                {id: 14, name: 'Declaración anual completa con cadena de los últimos dos años inmediatos anteriores',value : false, file: false,arch: {}},
                {id: 15, name: 'Estados financieros anuales del año inmediato anterior',value : false, file: false,arch: {}},
                {id: 16, name: 'Estados financieros parciales, los mas recientes, con una antigüedad no mayor a 2 años',value : false, file: false,arch: {}},
                {id: 17, name: 'Alta ante hacienda o alta electrónica',value : false, file: false,arch: {}},
                {id: 18, name: 'Escritura de inmueble',value : false, file: false,arch: {}},
                {id: 19, name: 'Boleta predial o avaluó',value : false, file: false,arch: {}},
                {id: 20, name: 'Certificado de libertad de gravamen',value : false, file: false,arch: {}}
              );
            }else if(q==2){
              vm.listDocument.push(
                {id: 7, name: 'Currículo reciente',value : false, file: false,arch: {}},
                {id: 8, name: 'Contrato multiple de la afianzadora',value : false, file: false,arch: {}},
                {id: 9, name: 'Carta Buró',value : false, file: false,arch: {}},
                {id: 10, name: 'Cuestionario o entrevista',value : false, file: false,arch: {}},
                {id: 11, name: 'Aviso de privacidad de la afianzadora',value : false, file: false,arch: {}},
                {id: 12, name: 'Protocolizaciones',value : false, file: false,arch: {}},
                {id: 13, name: 'Alta de empresa ante hacienda',value : false, file: false,arch: {}},
                {id: 14, name: 'Cambio de domicilio ante hacienda',value : false, file: false,arch: {}},
                {id: 15, name: 'Copia del comprobante de inscripción para la e.firma (firma electrónica)',value : false, file: false,arch: {}},
                {id: 16, name: 'Declaración anual completa con cadena, de los últimos dos años',value : false, file: false,arch: {}},
                {id: 17, name: 'Estados financieros dictaminados cuadernillo completo, del año inmediato anterior',value : false, file: false,arch: {}},
                {id: 18, name: 'Estados financieros parciales los más recientes de este año con no mayor antigüedad de dos meses',value : false, file: false,arch: {}},
                {id: 19, name: 'Escritura de inmueble',value : false, file: false,arch: {}},
                {id: 20, name: 'Boleta predial o avaluó',value : false, file: false,arch: {}},
                {id: 21, name: 'Certificado de libertad de gravamen',value : false, file: false,arch: {}}
              );
            }
          }else{            
            if(q==1){
              vm.listDocument = [
                {id: 1, name: 'Identificación Oficial',value : false, file: false,arch: {}},
                {id: 2, name: 'CURP',value : false, file: false,arch: {}},
                {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value : false, file: false,arch: {}},
                {id: 4, name: 'Comprobante de Domicilio',value : false, file: false,arch: {}},
                {id: 5, name: 'Formato de Identificación de Cliente Firmado',value : false, file: false,arch: {}},
                {id: 6, name: 'Poder',value : false, file: false,arch: {}},
              ];
              if (vm.org_name =='ancora') {
                vm.listDocument = [
                  {id: 1, name: 'Identificación Oficial',value : false, file: false,arch: {}},
                  {id: 2, name: 'CURP',value : false, file: false,arch: {}},
                  {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value : false, file: false,arch: {}},
                  {id: 4, name: 'Comprobante de Domicilio',value : false, file: false,arch: {}},
                  {id: 5, name: 'Formato de Identificación de Cliente Firmado',value : false, file: false,arch: {}},
                ];
              }
            }else if(q==2){
              vm.listDocument = [
                {id: 1, name: 'Acta Constitutiva',value : false, file: false,arch: {}},
                {id: 2, name: 'RFC',value : false, file: false,arch: {}},
                {id: 3, name: 'Cédula de Identificación Fiscal',value : false, file: false,arch: {}},
                {id: 4, name: 'Comprobante de Domicilio Fiscal' ,value : false, file: false,arch: {}},
                {id: 5, name: 'Modificaciones al Acta Constitutiva',value : false, file: false,arch: {}},
                {id: 6, name: 'Poder', value : false, file: false,arch: {}},
              ];
            }
          }
        }
        $scope.changeSensible = function(sensible, index) {
            uploader.queue[index].formData[0].sensible = sensible;
        }

        $scope.saveFile = function(file) {
          $http.patch(file.url,{'nombre':file.nombre, 'sensible':file.sensible});
        }

        $scope.sucursal = function (sc) {
          
        }

        $scope.docs = {};
        $scope.type = function(r){
          if (r==1) {            
            vm.listDocument = [
              {id: 1, name: 'Identificación Oficial',value : false, file: false,arch: {}},
              {id: 2, name: 'CURP',value : false, file: false,arch: {}},
              {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value : false, file: false,arch: {}},
              {id: 4, name: 'Comprobante de Domicilio',value : false, file: false,arch: {}},
              {id: 5, name: 'Formato de Identificación de Cliente Firmado',value : false, file: false,arch: {}},
              {id: 6, name: 'Poder',value : false, file: false,arch: {}},
            ];
            if (vm.org_name =='ancora') {
              vm.listDocument = [
                {id: 1, name: 'Identificación Oficial',value : false, file: false,arch: {}},
                {id: 2, name: 'CURP',value : false, file: false,arch: {}},
                {id: 3, name: 'Comprobante de Inscripción de Firma Electrónica',value : false, file: false,arch: {}},
                {id: 4, name: 'Comprobante de Domicilio',value : false, file: false,arch: {}},
                {id: 5, name: 'Formato de Identificación de Cliente Firmado',value : false, file: false,arch: {}},
              ];
            }
            $scope.type_person_selected = r
          }else if (r==2) {
            vm.listDocument = [
              {id: 1, name: 'Acta Constitutiva',value : false, file: false,arch: {}},
              {id: 2, name: 'RFC',value : false, file: false,arch: {}},
              {id: 3, name: 'Cédula de Identificación Fiscal',value : false, file: false,arch: {}},
              {id: 4, name: 'Comprobante de Domicilio Fiscal' ,value : false, file: false,arch: {}},
              {id: 5, name: 'Modificaciones al Acta Constitutiva',value : false, file: false,arch: {}},
              {id: 6, name: 'Poder', value : false, file: false,arch: {}},
            ];
            $scope.type_person_selected = r
          }else{

          }
        }

        function closeDropdown(){
          $('.hasDropdown').removeClass('open');
        }

        vm.form = {
          contratante: '0',
          grupo: "",
          type_person: 0,
          rfc: '0',
          vendedor:'',
          only_sureties: true,
          has_programa_de_proveedores: true
        };

        $scope.contractorNew = [];

        $scope.userInfo = {
            type_person: '',
            id: 0
        };
        vm.user = usr;

      vm.table = {
        headers: [
          'Nombre',
          'Tipo',
          'Acciones'
        ]
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

      vm.address_type = [{
        name: "Dirección Personal",
        id: 0
      }, {
        name: "Dirección Fiscal",
        id: 1
      }, {
        name: "Dirección de cobro",
        id: 2
      }, {
        name: "Dirección de paquetería",
        id: 3
      }, {
        name: "Dirección de riesgo",
        id: 4
      }, {
        name: "CFDI",
        id: 5
      }]

      vm.clasifications = [
        // {name: 'Pequeño', value: 1},
        // {name: 'Regular', value: 2},
        // {name: 'Grande', value: 3},
        // {name: 'Jumbo', value: 4}
      ]
      vm.celulas = [];
      vm.agrupaciones = [];

      // $(window).load(function() {
      //     $('.js-example-basic-multiple').select2();
      // });
      angular.element(document).ready(function(){
        $('.js-example-basic-multiple').select2();
      });

      $scope.selectConditions = function(sel){
        vm.condition_selected = [];
        vm.id = sel[0]
        sel.forEach(function(r) {
          vm.condition_selected.push(parseInt(r));
        })
      };

      function changeTypePerson(obj){
        vm.form.type_person = obj;
      }

      function Consultar(order,parPage) {

        if(vm.order_asc){
          vm.order_asc = false;
        } else {
          vm.order_asc = true;
        }
        if(vm.show_binnacle == true){
          vm.show_binnacle = false;
        }
        vm.show_pagination = false;
        vm.show_pag_naturals = false;
        vm.show_pag_juridicals = false;
        $scope.results = true;
          if(vm.form.type_person){            
            var parUrl = url.IP + 'filtros-contractor/';
          } else {
            toaster.info('Debe seleccionar un tipo de contratante');
            return;
          }
          // New url fussion --
          // var parUrl = url.IP + 'filtros-contractor/';
          if(vm.form.group){
            if (vm.form.group.val) {
              var g = vm.form.group.value;
            }else{
              var g = 0
            }
            
          } else {
            var g = 0;
          }
          if(vm.form.contratante){
            var c = vm.form.contratante;
          } else {
            var c = 0;
          }
          if(vm.form.rfc){
            var f = vm.form.rfc;
          } else {
            var f = 0;
          }

          var params = {
              contratante: c ? c : 0,
              rfc: f ? f : 0,
              grupo: g ? g : 0,
              order: vm.order_asc ? vm.order_asc : 0,
              condicion: vm.condition_selected ? vm.condition_selected : 0,
              parPage : parPage ? parPage : 1,
              type_person: vm.form.type_person ? vm.form.type_person : 1,
          }
            $http({
                  method: 'POST',
                  url: parUrl,
                  data: params
              }). then(function success(response) {
                  if(response.status == 200 && response.data.results.length){
                    vm.persons.all = response.data.results;
                    // if(vm.form.type_person == 1){
                    //   vm.persons.naturals = response.data.results;
                    //   vm.persons.juridicals = [];
                    // }
                    // else if (vm.form.type_person == 2) {
                    //   vm.persons.juridicals = response.data.results;
                    //   vm.persons.naturals = [];
                    // }
                    // else {
                    //   vm.persons.all = response.data.results;
                    // }
                    $scope.order = vm.order_asc;
                    vm.persons_config = {
                        count: response.data.count,
                        next: response.data.next,
                        previous: response.data.previous
                      };
                    $scope.personn_config = {
                        count: response.data.count,
                        previous: parUrl,
                        next: parUrl
                      };
                    vm.show_pagination = true;
                    $scope.testPagination('vm.persons.naturals', 'personn_config');
                  } else{
                    toaster.warning("No se encontraron registros");
                    vm.persons.naturals = []
                  }
              })
      }


      vm.exportDataE = exportDataE;
      vm.hoy=new Date();

      function exportDataE(param){

        if(vm.form.type_person){            
          var parUrl = url.IP + 'service_reporte-contractor-excel';
        }else {
          toaster.info('Debe seleccionar un tipo de contratante');
          return;
        }
          var parUrl = url.IP + 'service_reporte-contractor-excel';
          if(vm.form.group){
            var g = vm.form.group.value;
          } else {
            var g = 0;
          }
          if(vm.form.contratante){
            var c = vm.form.contratante;
          } else {
            var c = 0;
          }
          if(vm.form.rfc){
            var f = vm.form.rfc;
          } else {
            var f = 0;
          }
          var params = {
              contratante: c,
              rfc: f,
              grupo: g,
              order: vm.order_asc,
              condicion: vm.condition_selected ? vm.condition_selected : 0,
              type_person:0,
          }
            $http({
                  method: 'POST',
                  url: parUrl,
                  data: params,
                  headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                  responseType: "arraybuffer"})
                .then(function(data, status, headers, config) {
                  var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                  saveAs(blob, 'Reporte_Contratantes.xls');

                })
              .catch(function (e) {
                console.log('e', e);
              });
              // }). then(function success(response) {
              //   if(response.status === 200) {
              //    exportFactory.excel(response.data, 'Contratantes');
              // }
              //  })

        }

        $scope.matchesGroup = function(parWord, parType) {
          $scope.groups_data = 0;
          if(parType) {
            var word_data = parWord.val;
            parWord = parWord.val;
          } else if(vm.form.group) {
            var word_data = vm.form.group.val;
          }

          if(word_data) {

            if(word_data.length >= 3) {
              $scope.show_group = 'grupos-match/';
              $http.post(url.IP + $scope.show_group,
              {
                'matchWord': parWord
              })
              .then(function(response) {
                if(response.status === 200 ) {
                  var source = [];
                  var groups = response.data;
                  groups.forEach(function(item) {
                    var obj = {
                      label: item.group_name,
                      value: item.id
                    };
                    source.push(obj);
                  });
                  $scope.groups_data = source;
                }
              });
            }
          }
        }

        $scope.selectRfc = function (rfc){
          vm.form.rfc = rfc.replace(/-/g,"");
        }
        vm.search = search;
        function search(cadena){
          vm.show_binnacle = false;
          vm.show_pagination = false;
          vm.show_pag_naturals = false;
          vm.show_pag_juridicals = false;

          if(cadena.length){
            $http({
                method: 'GET',
                url: url.IP + 'seeker-contractors/',
                params: {
                    cadena: cadena,
                    type_person: 1,
                }
            })
            .then(
                function success(request) {
                  if(request.status === 200) {
                    vm.persons.juridicals = [];
                    vm.persons.naturals = [];
                    vm.persons = [];
                    vm.persons.naturals = request.data.results;
                  }
                },
                function error(error) {

                }
            )
            .catch(function(e){
                console.log(e);
            });

            $http({
                method: 'GET',
                url: url.IP + 'seeker-juridicals/',
                params: {
                  cadena: cadena,
                  type_person: 2,
                }
            })
            .then(
                function success(request) {
                  vm.persons.naturals = [];
                  vm.persons.juridicals = [];
                  if(request.status === 200) {
                    vm.persons.naturals = [];
                    vm.persons.juridicals = [];
                    vm.persons = [];
                    vm.persons.juridicals = request.data.results;
                    vm.juridicals_config = {
                      count: request.data.count,
                      next: request.data.next,
                      previous: request.data.previous
                    };
                    vm.show_pag_juridicals = true;
                    vm.buttonsJuridicals = true;
                  }
                },
                function error(error) {

                }
            )
            .catch(function(e){
                console.log(e);
            });
          }else{
            vm.persons.juridicals = [];
            vm.persons.naturals = [];
          }
        }

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
          // if ($uibModalInstance) {
          //     $uibModalInstance.dismiss('cancel');
          // }
          $scope.okFile++;
          if($scope.okFile == $scope.countFile){
            SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWCONTRACTOR, "success");
            if (vm.acceso_ver_cont) {
              $state.go('fianzas.pprovnew', {
                type: $scope.contractorNew.type_person == 'Fisica' ? 'fisicas' : 'morales',
                contratanteId: $scope.contractorNew.id
              });
            }else{
              $state.go('fianzas.pprovlist')
            }
          }
        };

        // ALERTA ERROR UPLOADFILES
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          if(response.status == 413){
            SweetAlert.swal("ERROR", MESSAGES.ERROR.FILETOOLARGE, "error");
          } else {
            SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
          }
        };

        uploader.onAfterAddingFile = function(fileItem) {
          fileItem.formData.push({
              arch: fileItem._file,
              name: fileItem.file.name
          });
          if(fileItem){
            $scope.countFile++;
          }
        };

        uploader.onBeforeUploadItem = function(item) {
          if(item.file.sensible != undefined){
            item.formData[0].sensible = item.file.sensible;
          }
          item.url = $scope.userInfo.url;
          item.formData[0].name = item.file.name;
          item.alias = '';
          item.formData[0].owner = $scope.userInfo.id;
        };
        //archivos lista documentos
        $scope.addFileList = function(index,lista,file,xy){
          var extension = file[0].formData[0].name.split('.')[1];
          file[0].formData[0].name = vm.listDocument[index].name+'.'+extension
          vm.listDocument[index].arch = file[0]
          vm.listDocument[index].file = true
          $scope.uploaderDocument.queue = []
        }
        var uploaderDocument = $scope.uploaderDocument = new FileUploader({
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            },
        });

        // uploaderDocument.filters.push({
        //     name: 'customFilter',
        //     fn: function(item /*{File|FileLikeObject}*/ , options) { //jshint ignore:line
        //         return this.queue.length < 20;
        //     }
        // });

        // ALERTA SUCCES UPLOADFILES
        uploaderDocument.onSuccessItem = function(fileItem, response, status, headers) {
          // if ($uibModalInstance) {
          //     $uibModalInstance.dismiss('cancel');
          // }
          $scope.okFile++;
          if($scope.okFile == $scope.countFile){
            SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWCONTRACTOR, "success");
            if (vm.acceso_ver_cont) {
              $state.go('fianzas.pprovnew', {
                type: $scope.contractorNew.type_person == 'Fisica' ? 'fisicas' : 'morales',
                contratanteId: $scope.contractorNew.id
              });
            }else{
              $state.go('fianzas.pprovlist')
            }
          }
        };

        // ALERTA ERROR UPLOADFILES
        uploaderDocument.onErrorItem = function(fileItem, response, status, headers) {
          if(response.status == 413){
            SweetAlert.swal("ERROR", MESSAGES.ERROR.FILETOOLARGE, "error");
          } else {
            SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
          }
        };

        uploaderDocument.onAfterAddingFile = function(fileItem) {
          fileItem.formData.push({
              arch: fileItem._file,
              name: fileItem.file.name
          });
        };

        uploaderDocument.onBeforeUploadItem = function(item) {
          if(item.file.sensible != undefined){
            item.formData[0].sensible = item.file.sensible;
          }
          item.url = $scope.userInfo.url;
          item.formData[0].name = item.file.name;
          item.alias = '';
          item.formData[0].owner = $scope.userInfo.id;
        };
        //archivos lista docuemntos
        function uploadFilesList(typePerson, idPerson) {
          $scope.userInfo = {
              id: idPerson
          };
          // $scope.userInfo.url = url.IP + checkType(typePerson) + '/' + idPerson + '/archivos/';
          $scope.userInfo.url = url.IP + 'contractors' + '/' + idPerson + '/archivos/';

          $scope.files = [];

          $timeout(function() {
              $scope.uploaderDocument.uploadAll();
          }, 1000);
        }
        //archivos lista docuemntos
        function uploadFiles(typePerson, idPerson) {
          $scope.userInfo = {
              id: idPerson
          };
          // $scope.userInfo.url = url.IP + checkType(typePerson) + '/' + idPerson + '/archivos/';
          $scope.userInfo.url = url.IP + 'contractors' + '/' + idPerson + '/archivos/';

          $scope.files = [];

          $timeout(function() {
              $scope.uploader.uploadAll();
              $state.go('fianzas.pprovnew', {
                          type: $scope.contractorNew.type_person == 1 ? 'fisicas' : 'morales',
                          contratanteId: $scope.contractorNew.id
                        });
          }, 1000);
        }


        // Contractor
        vm.persons = [];
        vm.checkRFC = checkRFC;
        vm.cancel = cancel;
        vm.submitJuridical = submitJuridical;
        vm.submitFormJuridical1 = submitFormJuridical1;
        vm.checkType = checkType;
        vm.goToContractorView = goToContractorView;

        vm.control = {
          closeModal: function() {
            if ($uibModalInstance) {
              $uibModalInstance.dismiss('cancel');
            }
          }
        };

        function goToContractorView(person) {
          // if($scope.edit_natural || $scope.edit_juridical) {
            $state.go('contratantes.edit', {
              // develop
            // $state.go('contratantes.info', {
                type: checkType(person.type_person),
                contratanteId: person.id
            });
          // }
        }

        function cancel() {
          $state.go('fianzas.pprovlist');
        };

        // function goToContractorView(person) {
        //   $state.go('contratantes.edit', {
        //       type: checkType(person.type_person),
        //       contratanteId: person.id
        //   });
        // }

        // Groups
        vm.groups = [];
        vm.openModalGroup = openModalGroup;
        vm.openModalAsignacion = openModalAsignacion;
        vm.openModalClasification = openModalClasification;
        vm.openModalCelulaContractor = openModalCelulaContractor;

        // Contacts
        vm.addContact = addContact;
        vm.deleteContacts = deleteContacts;

        // Addresses, States and cities functions
        vm.addresses = {
            add: addAddress,
            selectedState: selectedState,
            delete: deleteAddress
        };

        vm.statesArray = [];

        // Disabled after save
        vm.disabledAfterSave = false;
        vm.showBinnacle = showBinnacle;
        vm.returnToContractors = returnToContractors;
        //-----------------------------------------------------------comments
        function showBinnacle(param) {

          vm.show_binnacle = true;
          vm.person_id = param.id;
          $http({
            method: 'GET',
            url: url.IP+'comments/',
            params: {
              'model': 2,
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
        };
        //-------------------------------------------------------------comments

        function addAddress(type) {
            // HACK remove before production
            var address = {
                raw: '',
                street_address: '',
                intersection: '',
                political: '',
                administrative_area_level_1: '',
                administrative_area_level_1_short: '',
                administrative_area_level_2: '',
                administrative_area_level_3: '',
                colloquial_area: '',
                sublocality: '',
                neighborhood: '',
                premise: '',
                subpremise: '',
                natural_feature: '',
                country: '',
                country_code: '',
                locality: '',
                postal_code: '',
                route: '',
                street_number: '',
                street_number_int: '',
                formatted: '',
                latitude: '',
                longitude: '',
                details: '',
                composed: ''
            };
            if (type === 1) {
                vm.form.userAddresses.push(address);
            } else {
                vm.juridicalForm.userAddresses.push(address);
            }
        }

        function deleteAddress(index, type) {
            if (type === 1) {
                vm.form.userAddresses.splice(index, 1);
            } else {
                vm.juridicalForm.userAddresses.splice(index, 1);
            }
        }

        function selectedState(selected, index, type) {
            if (type === 1) {
                vm.form.userAddresses[index].city = '';
                vm.form.userAddresses[index].citiesList = selected.cities;
            } else {
                vm.juridicalForm.userAddresses[index].city = '';
                vm.juridicalForm.userAddresses[index].citiesList = selected.cities;
            }
        }

        vm.form = {
            'birthday': null,
            'description': '',
            'first_name': '',
            'last_name': '',
            'rfc': '',
            'second_last_name': '',
            'sex': null,
            'emails': [{correo: '', email_type: ''}],
            'responsables': [{responsables: '', resp_type: ''}],
            'phones': [{phone: '', phone_type: ''}],
            'userAddresses': [{
                raw: '',
                street_address: '',
                intersection: '',
                political: '',
                administrative_area_level_1: '',
                administrative_area_level_1_short: '',
                administrative_area_level_2: '',
                administrative_area_level_3: '',
                colloquial_area: '',
                sublocality: '',
                neighborhood: '',
                premise: '',
                subpremise: '',
                natural_feature: '',
                country: '',
                country_code: '',
                locality: '',
                postal_code: '',
                route: '',
                street_number: '',
                street_number_int: '',
                formatted: '',
                latitude: '',
                longitude: '',
                details: '',
                composed: ''
            }],
            'contact_natural': [],
            'vendedor': ''
        };

        vm.juridicalForm = {
            'userAddresses': [{
                raw: '',
                street_address: '',
                intersection: '',
                political: '',
                administrative_area_level_1: '',
                administrative_area_level_1_short: '',
                administrative_area_level_2: '',
                administrative_area_level_3: '',
                colloquial_area: '',
                sublocality: '',
                neighborhood: '',
                premise: '',
                subpremise: '',
                natural_feature: '',
                country: '',
                country_code: '',
                locality: '',
                postal_code: '',
                route: '',
                street_number: '',
                street_number_int: '',
                formatted: '',
                latitude: '',
                longitude: '',
                details: '',
                composed: ''
            }],
            'date_of_establishment': null,
            'description': '',
            'j_name': '',
            'rfc': '',
            'contact_juridical': [],
            'emails': [{email: '', email_type: ''}],
            'responsables': [{responsable: '', resp_type: ''}],
            'phones': [{phone: '', phone_type: ''}],
            'vendedor': ''
        };

        activate();
        $('.js-example-basic-multiple').select2();
        vm.emptyOrNull = function(item) {
            return !(item === null || item.trim().length === 0);
        };

        vm.activate = activate;
        function activate() {
          $('.js-example-basic-multiple').select2();
          dataFactory.get('sucursales-to-show-unpag/')
          .then(function success(response) {
            $scope.sucursalList = response.data;
            if($localStorage['save_filters_new_program']){
              $scope.sucursalList.forEach(function(item){
                if(item.id == $localStorage['save_filters_new_program']['sucursal']){
                  vm.form.sucursal = item;
                }
                if(item.id == $localStorage['save_filters_new_program']['j_sucursal']){
                  vm.juridicalForm.sucursal = item;
                }
              });
            }
          })
          vm.responsables = []
          $http.get(url.IP + 'get-vendors').then(function success(request) {
            vm.vendors = request.data;
            vm.vendors.forEach(function(vendor) {
              vendor.name = vendor.first_name + ' ' + vendor.last_name;
            });
          });
          $scope.filesContractor = true;

            $q.when()
            .then(function() {
                var defer = $q.defer();
                defer.resolve(helpers.getStates());
                return defer.promise;
            })
            .then(function(data) {
                vm.statesArray = data.data;
                $scope.readPdf();
            });

            // groupService.getGroups()
            // .then(function(groups) {
            //     vm.groups = groups;
            // });

            $http.get(url.IP + 'gruposSubgrupos-resume/')
            .then(function(response) {
              vm.groups = response.data;
              if($localStorage['save_filters_new_program']){
                vm.groups.forEach(function(item){
                  if(item.id == $localStorage['save_filters_new_program']['grupo']){
                    vm.form.group = item;
                  }
                  if(item.id == $localStorage['save_filters_new_program']['j_group']){
                    vm.juridicalForm.group = item;
                  }
                });
              }
            });

            $http.get(url.IP + 'usuarios/')
            .then(function(user) {
              vm.responsables  = user.data.results;
            });

            $http.get(url.IP + 'groupingLevel-resume/')
            .then(function(response) {              
              vm.agrupaciones = response.data;
              if($localStorage['save_filters_new_program']){
                vm.agrupaciones.forEach(function(item){
                  if(item.id == $localStorage['save_filters_new_program']['grouping_level']){
                    vm.form.celula = item;
                  }
                  if(item.id == $localStorage['save_filters_new_program']['j_grouping_level']){
                    vm.juridicalForm.celula = item;
                  }
                });
              }
            });

            $http.get(url.IP + 'classification/')
            .then(function(response) {
              response.data.results.forEach(function(item){
                vm.clasifications.push(item);
              });
            });
            $http.post(url.IP + 'celula_contractor_info/')
            .then(function(response) {
              vm.celulas = response.data;
              if($localStorage['save_filters_new_program']){
                vm.celulas.forEach(function(item){
                  if(item.id == $localStorage['save_filters_new_program']['celula']){
                    vm.form.celula = item;
                  }
                  if(item.id == $localStorage['save_filters_new_program']['j_celula']){
                    vm.juridicalForm.celula = item;
                  }
                });
              }
            });
            dataFactory.get('usuarios/')
            .then(function(user) {
              $scope.usuarios_saam  = user.data.results;
            });

            vm.form.first_name = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['first_name'] : '';
            vm.form.last_name = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['last_name'] : '';
            vm.form.second_last_name = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['second_last_name'] : '';
            vm.form.rfc = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['rfc'] : '';
            vm.form.sex = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['sex'] : '';
            vm.form.birthday = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['birthday'] : '';
            vm.form.celula = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['celula'] : '';
            vm.form.sucursal = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['sucursal'] : '';
            vm.form.grouping_level = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['grouping_level'] : '';
            vm.form.type_person = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['type_person'] : 1;
            vm.juridicalForm.j_name = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['j_name'] : '';
            vm.juridicalForm.date_of_establishment = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['date_of_establishment'] : '';
            vm.juridicalForm.rfc = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['j_rfc'] : '';
            vm.juridicalForm.group = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['j_group'] : '';
            vm.juridicalForm.celula = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['j_celula'] : '';
            vm.juridicalForm.sucursal = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['j_sucursal'] : '';
            vm.juridicalForm.grouping_level = $localStorage['save_filters_new_program'] ? $localStorage['save_filters_new_program']['j_grouping_level'] : '';
        };

        if ('save_filters_new_program' in $localStorage){}
        else{
          $localStorage['save_filters_new_program'] = {};
        }

        $scope.saveLocalstorange = function(){
          $localStorage['save_filters_new_program']['first_name'] =  vm.form.first_name ? vm.form.first_name : '';
          $localStorage['save_filters_new_program']['last_name'] =  vm.form.last_name ? vm.form.last_name : '';
          $localStorage['save_filters_new_program']['second_last_name'] =  vm.form.second_last_name ? vm.form.second_last_name : '';
          $localStorage['save_filters_new_program']['grupo'] =  vm.form.group ? vm.form.group.id : '';
          $localStorage['save_filters_new_program']['birthday'] =  vm.form.birthday ? vm.form.birthday : '';
          $localStorage['save_filters_new_program']['sex'] =  vm.form.sex ? vm.form.sex : '';
          $localStorage['save_filters_new_program']['sucursal'] =  vm.form.sucursal ? vm.form.sucursal : '';
          $localStorage['save_filters_new_program']['celula'] =  vm.form.celula ? vm.form.celula : '';
          $localStorage['save_filters_new_program']['type_person'] =  vm.form.type_person ? vm.form.type_person : '';
          $localStorage['save_filters_new_program']['j_name'] =  vm.juridicalForm.j_name ? vm.juridicalForm.j_name : '';
          $localStorage['save_filters_new_program']['date_of_establishment'] =  vm.juridicalForm.date_of_establishment ? vm.juridicalForm.date_of_establishment : '';
          $localStorage['save_filters_new_program']['j_rfc'] =  vm.juridicalForm.rfc ? vm.juridicalForm.rfc : '';
          $localStorage['save_filters_new_program']['j_group'] =  vm.juridicalForm.group ? vm.juridicalForm.group.id : '';
          $localStorage['save_filters_new_program']['j_sucursal'] =  vm.juridicalForm.sucursal ? vm.juridicalForm.sucursal : '';
          $localStorage['save_filters_new_program']['j_celula'] =  vm.juridicalForm.celula ? vm.juridicalForm.celula : '';
          $localStorage['save_filters_new_program']['j_grouping_level'] =  vm.juridicalForm.grouping_level ? vm.juridicalForm.grouping_level : '';
        }


        $scope.readPdf = function(){
          $scope.contratante_tipo = true;
          if($location.path() == '/polizas/') {
            if($rootScope.readPDF.corporation.corporation_name == null){
              $scope.contratante_tipo = true;
              vm.form.first_name = $rootScope.readPDF.individual.first_name;
              vm.form.last_name = $rootScope.readPDF.individual.first_last_name;
              vm.form.second_last_name = $rootScope.readPDF.individual.second_last_name;
              vm.form.rfc = $rootScope.readPDF.individual.rfc;

              if($rootScope.readPDF.address.state){
                vm.statesArray.forEach(function(item){
                  if(sinDiacriticos($rootScope.readPDF.address.state.toLowerCase()) == sinDiacriticos(item.state.toLowerCase())){
                    vm.form.userAddresses[0].administrative_area_level_1 = item;
                    if($rootScope.readPDF.address.city){
                      for(var k = 0; k < item.cities.length; k ++){
                        if(sinDiacriticos($rootScope.readPDF.address.city.toLowerCase()) == sinDiacriticos(item.cities[k].city.toLowerCase())){
                          vm.form.userAddresses[0].administrative_area_level_2 = item.cities[k];
                        }
                      }
                    }
                  }
                });
              }

              vm.form.userAddresses[0].sublocality = $rootScope.readPDF.address.sublocality;
              vm.form.userAddresses[0].route = $rootScope.readPDF.address.street;
              vm.form.userAddresses[0].street_number = $rootScope.readPDF.address.street_number;
              vm.form.userAddresses[0].street_number_int = $rootScope.readPDF.address.street_number_int;
              vm.form.userAddresses[0].postal_code = $rootScope.readPDF.address.zip_code;

            }else{
              $scope.contratante_tipo = false;
              vm.juridicalForm.j_name = $rootScope.readPDF.corporation.corporation_name;
              vm.juridicalForm.rfc = $rootScope.readPDF.corporation.rfc;

              if($rootScope.readPDF.address.state){
                vm.statesArray.forEach(function(item){
                  if(sinDiacriticos($rootScope.readPDF.address.state.toLowerCase()) == sinDiacriticos(item.state.toLowerCase())){
                    vm.juridicalForm.userAddresses[0].administrative_area_level_1 = item;
                    if($rootScope.readPDF.address.city){
                      for(var k = 0; k < item.cities.length; k ++){
                        if(sinDiacriticos($rootScope.readPDF.address.city.toLowerCase()) == sinDiacriticos(item.cities[k].city.toLowerCase())){
                          vm.juridicalForm.userAddresses[0].administrative_area_level_2 = item.cities[k];
                        }
                      }
                    }
                  }
                });
              }
 
              vm.juridicalForm.userAddresses[0].sublocality = $rootScope.readPDF.address.sublocality;
              vm.juridicalForm.userAddresses[0].route = $rootScope.readPDF.address.street;
              vm.juridicalForm.userAddresses[0].street_number = $rootScope.readPDF.address.street_number;
              vm.juridicalForm.userAddresses[0].street_number_int = $rootScope.readPDF.address.street_number_int;
              vm.juridicalForm.userAddresses[0].postal_code = $rootScope.readPDF.address.zip_code;
            }
          }
        };

        function sinDiacriticos(texto) {
          return texto.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
        }

        vm.getAll = getAll;

        function getAll(param) {
          vm.show_pag_naturals = false;
          vm.show_pag_juridicals = false;

          if(param == 'naturals' || param == undefined) {
            if(param == undefined) {
              $scope.type_person = 'naturals';
            }
            var orgParam = { params: { org: $localStorage.orgId, type_person: 1 } };
            $http.get(url.IP + 'contractor-resume/', orgParam )
            .then(
                function success(request) {
                  if(request.status === 200) {

                    vm.persons.naturals = [];
                    vm.persons.juridicals = [];
                    vm.persons.naturals = request.data.results;
                    vm.naturals_config = {
                      count: request.data.count,
                      next: request.data.next,
                      previous: request.data.previous
                    };
                    vm.show_pag_naturals = true;
                  }
                },
                function error(error) {

                }
            )
            .catch(function(e){
                console.log(e);
            });
          } else if(param == 'juridicals') {           
            var orgParam = { params: { org: $localStorage.orgId, type_person: 2 } };
            // $http.get(url.IP + 'jrudicals-resume/', orgParam)
            $http.get(url.IP + 'contractor-resume/', orgParam)
            .then(
                function success(request) {
                  if(request.status === 200) {
                    vm.persons.juridicals = [];
                    vm.persons.naturals = [];
                    vm.persons.juridicals = request.data.results;
                    vm.juridicals_config = {
                      count: request.data.count,
                      next: request.data.next,
                      previous: request.data.previous
                    };
                    vm.show_pag_juridicals = true;
                  }
                },
                function error(error) {

                }
            )
            .catch(function(e){
                console.log(e);
            });
          }
        }


        //Función getContratantes
        vm.getContratantesEs = getContratantesEs;
        function getContratantesEs(param){
          vm.buttonsJuridicals = false;
          vm.buttonsNaturals = false;
          vm.show_binnacle = false;
          vm.show_pagination = false;
          vm.show_pag_naturals = false;
          vm.show_pag_juridicals = false;
            if(param == 1){
              // $http.get(url.IP + 'fisicas-resume/' )
              $http.get(url.IP + 'contractor-resume/' )
              .then(function(data) {
              //vm.results = data;
              vm.persons.juridicals = [];
              vm.persons.juridicals.length = 0;
              $scope.results = {
                  data: data.data.results,
                  config: {
                    count: data.data.count,
                    next: data.data.next,
                    previous: data.data.previous
                  }
                }
              vm.persons.naturals=$scope.results.data;
              $scope.testPagination('vm.persons.naturals', 'results.config');
              });
              //return vm.persons.naturals;
              $scope.show_pagination = true;
              vm.persons = [];
            }
            else if(param == 2){
              // $http.get(url.IP + 'morales-resume/' )
              $http.get(url.IP + 'contractor-resume/' )
              .then(function(data) {
              vm.persons.naturals = [];
              vm.persons.length = 0;
              $scope.results = {
                  data: data.data.results,
                  config: {
                    count: data.data.count,
                    next: data.data.next,
                    previous: data.data.previous
                  }
                }
              vm.persons.juridicals = $scope.results.data;
              $scope.testPagination('vm.persons.juridicals', 'results.config');
              });
              $scope.show_pagination = true;

              vm.persons = [];
            }
            if(vm.condicion == true){
              vm.persons.naturals = [];
              vm.persons.juridicals = [];
            }
        }
        //Fin getContratantes
          function returnToContractors(param) {
            if(param) {
              vm.show_binnacle= false;
            } else {
              vm.show_binnacle = false;
            }

          }


        function checkRFC() {
          $scope.obligados = [];
          if (vm.form.obligados) {
            vm.form.obligados.forEach(function(elem, index) {
              if (elem.val) {
                if (elem.value) {                
                  $scope.obligados.push(elem.value.url);
                }
              }
            });              
          }
          vm.form.bound_solidarity_many = $scope.obligados ? $scope.obligados : [];
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          if (vm.form.rfc == undefined)
            vm.form.rfc = '';
          if (vm.form.rfc)
            vm.form.rfc = vm.form.rfc.replace("-", "");
          $http.post(url.IP+'existrfc',{'rfc':vm.form.rfc,'selector':1}).success(function(response) {
            if (response.status == true){
              SweetAlert.swal({
                  title: '¡El RFC del contratante ya existe!',
                  text: "¿Deseas continuar?",
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Si",
                  cancelButtonText: "No",
                  closeOnConfirm: false
              }, function(isConfirm) {
                  if (isConfirm) {
                    $scope.arrayEmail = vm.form.emails;
                    vm.form.emails = [];
                    $scope.arrayPhone = vm.form.phones;
                    vm.form.phones = [];

                    for(var i = 0; i < $scope.arrayEmail.length; i++){
                      if($scope.arrayEmail[i].correo){
                        if($scope.arrayEmail[i].email_type == 0){
                          $scope.arrayEmail[i].email_type = 1;
                        }
                        vm.form.emails.push($scope.arrayEmail[i]);
                      }
                    }

                    for(var i = 0; i < $scope.arrayPhone.length; i++){
                      if($scope.arrayPhone[i].phone){
                        if($scope.arrayPhone[i].phone_type == 0){
                          $scope.arrayPhone[i].phone_type = 1;
                        }
                        vm.form.phones.push($scope.arrayPhone[i]);
                      }
                    }

                    l.stop();
                    submitFormNatural();
                    $scope.rfc_getDate(vm.form.rfc);
                  }
                  else{
                    l.stop();
                    return
                  }
              });
            }
            else{
              $scope.arrayEmail = vm.form.emails;
              vm.form.emails = [];
              $scope.arrayPhone = vm.form.phones;
              vm.form.phones = [];

              for(var i = 0; i < $scope.arrayEmail.length; i++){
                if($scope.arrayEmail[i].correo){
                  if($scope.arrayEmail[i].email_type == 0){
                    $scope.arrayEmail[i].email_type = 1;
                  }
                  vm.form.emails.push($scope.arrayEmail[i]);
                }
              }

              for(var i = 0; i < $scope.arrayPhone.length; i++){
                if($scope.arrayPhone[i].phone){
                  if($scope.arrayPhone[i].phone_type == 0){
                    $scope.arrayPhone[i].phone_type = 1;
                  }
                  vm.form.phones.push($scope.arrayPhone[i]);
                }
              }

              l.stop();
              submitFormNatural();
              $scope.rfc_getDate(vm.form.rfc,vm.form);
            }
          });
        }

        $scope.rfc_getDate = function (rfc) {

          if(vm.form.birthday) {
            return;
          }

          vm.rfc_fec = rfc.substr(4, 6);
          vm.rfc_anio = rfc.substr(4, 2);
          vm.rfc_month = rfc.substr(6, 2);
          vm.rfc_day = rfc.substr(8, 2);


          vm.fecha = vm.rfc_month + '/' + vm.rfc_day + '/' + vm.rfc_anio;
          vm.date = new Date(vm.fecha);

          vm.aniorfc= vm.date.getFullYear();
                   vm.hoyA=vm.hoy.getFullYear();
                    if(vm.aniorfc > vm.hoyA){
                        vm.resta=vm.aniorfc-100;
                        vm.rfc_anio = vm.resta;
                        vm.fecha= vm.rfc_month+'/'+vm.rfc_day+'/'+vm.rfc_anio;
                           if(form.birthday == ""){
                           vm.form.birthday = vm.fecha;
                            }else{
                                vm.form.birthday = vm.fecha;
                        }
                    }
          vm.aniorfc = vm.date.getFullYear();
          if(vm.form.birthday == null){
            var fecha_rfcn= $filter('date')(new Date(vm.date), 'dd/MM/yyyy');
            vm.form.birthday = fecha_rfcn;
          }else{
            vm.form.birthday = vm.form.birthday;
          }
        };

        function submitFormNatural(argument) {
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          if(vm.form.first_name == ""){
            l.stop();
            if(!vm.form.birthday){
              vm.form.birthday = "";
            }
            if(vm.form.emails.length == 0){
              vm.form.emails = [{correo: '', email_type: ''}];
            }
            if(vm.form.phones.length == 0){
              vm.form.phones = [{phone: '', phone_type: ''}];
            }
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMNAME, "error");
            return;
          }
          if(vm.form.last_name == ""){
            l.stop();
            if(!vm.form.birthday){
              vm.form.birthday = "";
            }
            if(vm.form.emails.length == 0){
              vm.form.emails = [{correo: '', email_type: ''}];
            }
            if(vm.form.phones.length == 0){
              vm.form.phones = [{phone: '', phone_type: ''}];
            }
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMLASTNAME, "error");
            return;
          }
          if(vm.form.birthday == ""){
            l.stop();
            if(vm.form.emails.length == 0){
              vm.form.emails = [{correo: '', email_type: ''}];
            }
            if(vm.form.phones.length == 0){
              vm.form.phones = [{phone: '', phone_type: ''}];
            }
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMBIRTHDAY, "error");
            return;
          }
          if(vm.form.rfc == ""){
            // l.stop();            
            if(!vm.form.birthday){
              vm.form.birthday = "";
            }
            if(vm.form.emails.length == 0){
              vm.form.emails = [{correo: '', email_type: ''}];
            }
            if(vm.form.phones.length == 0){
              vm.form.phones = [{phone: '', phone_type: ''}];
            } 
            if($location.path() == "/fianzas/"){
              
            }else{    
              l.stop();                       
              SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMRFC, "error");
              return;
            }
          }else{
            if(!vm.form.birthday){
              vm.form.birthday = "";
            }
            if(vm.form.emails.length == 0){
              vm.form.emails = [{correo: '', email_type: ''}];
            }
            if(vm.form.phones.length == 0){
              vm.form.phones = [{phone: '', phone_type: ''}];
            }
          }
          if(!vm.form.sex){
            l.stop();
            if(!vm.form.birthday){
              vm.form.birthday = "";
            }
            if(vm.form.emails.length == 0){
              vm.form.emails = [{correo: '', email_type: ''}];
            }
            if(vm.form.phones.length == 0){
              vm.form.phones = [{phone: '', phone_type: ''}];
            }
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMSEX, "error");
            return;
          }
          if(!vm.form.group){
            l.stop();
            if(!vm.form.birthday){
              vm.form.birthday = "";
            }
            if(vm.form.emails.length == 0){
              vm.form.emails = [{correo: '', email_type: ''}];
            }
            if(vm.form.phones.length == 0){
              vm.form.phones = [{phone: '', phone_type: ''}];
            }
            SweetAlert.swal("ERROR", MESSAGES.ERROR.SELGROUP, "error");
            return;
          }
          if(vm.form.emailMain){
            if(!validateEmail(vm.form.emailMain)){
              l.stop();
              if(vm.form.emails.length == 0){
                vm.form.emails = [{correo: '', email_type: ''}];
              }
              if(vm.form.phones.length == 0){
                vm.form.phones = [{phone: '', phone_type: ''}];
              }
              SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
              return;
            }
          }
          $scope.flagEmail = false;
          if(vm.form.emails.length > 0){
            for(var i = 0; i < vm.form.emails.length; i++){
              if (vm.form.emails[i].correo) {
                if(!validateEmail(vm.form.emails[i].correo)){
                  $scope.flagEmail = true;
                }
              }
            }
            if($scope.flagEmail == true){
              l.stop();
              $scope.flagEmail = false;
              SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
              return;
            }
          }

          if (!helpers.hasAtLeastOneAddress(vm.form.userAddresses)) {
            l.stop();
            toaster.warning(MESSAGES.ERROR.ADDATLEASTONEDIRECCTION);
          }
          else {
              var flag = false, outme = false;
              vm.form.contact_natural.forEach(function(contact) {

                if(contact.name == ""){
                  l.stop();
                  SweetAlert.swal("ERROR", MESSAGES.ERROR.SELADDRES, "error");
                  flag = true;
                  return;
                }
                else{
                  if(contact.email){
                    if (!validateEmail(contact.email)) {
                      l.stop();
                      SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAILCONTACT, "error");
                      flag = true;
                      return;
                    }
                  }
                  if (contact.phone_number) {
                    if(contact.phone_number.length < 9){
                      l.stop();
                      SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONECONTACT, "error");
                      return;
                    }
                  }
                }

              });

              if (flag) {
                  return;
              }

              var form = angular.copy(vm.form);
              var arr = [];
              var nums = [];

              vm.form.contact_natural.forEach(function(elem, index) {
                   arr.push(elem);
              });
              // form.birthday = $filter('date')(vm.form.birthday, 'yyyy-MM-dd');
              form.birth_date = $filter('date')(vm.form.birthday, 'yyyy-MM-dd');
              form.contact = arr;
              form.group = form.subsubgrupo ? form.subsubgrupo.url : form.subgroup ? form.subgroup.url : form.group ? form.group.url : '';
              // form.grouping_level = form.subsubasignaciones ? form.subsubasignaciones.url : form.subagrupaciones ? form.subagrupaciones.url : form.grouping_level ? form.grouping_level.url : '';
              form.groupinglevel = form.subsubasignaciones ? form.subsubasignaciones.url : form.subagrupaciones ? form.subagrupaciones.url : form.grouping_level ? form.grouping_level.url : null;
              // form.celula = vm.form.celula ? vm.form.celula : null;
              form.cellule = vm.form.celula ? vm.form.celula : null;
              form.userAddresses = [];
              vm.form.userAddresses.forEach(function(elem,$index) {
                $scope.elems = elem;
                if (elem.administrative_area_level_1 == null || !elem.administrative_area_level_1 || elem.administrative_area_level_1 === undefined || elem.administrative_area_level_1 == 'undefined' || elem.administrative_area_level_2 == null || !elem.administrative_area_level_2 || elem.administrative_area_level_2 === undefined || elem.administrative_area_level_2 == 'undefined') {
                  l.stop();
                  if(!vm.form.birthday){
                    vm.form.birthday = "";
                  }
                  if(vm.form.emails.length == 0){
                    vm.form.emails = [{correo: '', email_type: ''}];
                  }
                  if(vm.form.phones.length == 0){
                    vm.form.phones = [{phone: '', phone_type: ''}];
                  }
                  SweetAlert.swal("ERROR", MESSAGES.ERROR.ADDATLEASTONEDIRECCTION, "error");
                  outme = true;
                  return;
                }
                var auxElem = elem
                elem.administrative_area_level_1 = auxElem.administrative_area_level_1
                elem.administrative_area_level_2 = auxElem.administrative_area_level_2
                form.userAddresses.push(elem);
              });

              if (outme == true) {
                return;
              }

              form.email = form.emailMain ? form.emailMain : "";
              form.phone_number = form.phoneMain ? form.phoneMain : "";

              if(form.email == "" && vm.form.emails.length > 0){
                form.email = vm.form.emails[0].correo;
                vm.form.emails.splice(0, 1);
              }

              if(vm.form.phoneMain){
                if(vm.form.phoneMain.length < 9){
                  l.stop();
                  SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONE, "error");
                  return;
                }
              }

              // for(var i = 0; i < vm.form.phones.length; i++){
              //   if(vm.form.phones[i].phone.length < 9){
              //     $scope.flagPhone = true;
              //   }
              // }
              if(vm.form.phones.length > 0){
                for(var i = 0; i < vm.form.phones.length; i++){
                  if (vm.form.phones[i].phone) {
                    if(vm.form.phones[i].phone.length < 9){
                      $scope.flagPhone = true;
                    }
                  }
                }
                if($scope.flagPhone == true){
                  l.stop();
                  $scope.flagPhone = false;
                  SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONE, "error");
                  return;
                }
              }
              if(!$scope.flagPhone){
                if(form.phone_number == "" && vm.form.phones.length > 0){
                  form.phone_number = vm.form.phones[0].phone;
                  vm.form.phones.splice(0, 1);
                }
              }
              else{
                $scope.flagPhone = false;
                l.stop();
                SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONE, "error");
                return;
              }

              var since = toDate(vm.form.birthday).getTime();
              var until = toDate(convertDate(new Date())).getTime();
              var diff = until - since;
              var antiguedad = parseInt(diff/(1000*60*60*24))
              if(antiguedad <= 0){
                l.stop();
                SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATEBIRTHDATE, "error");
                return;
              }

              // var date = new Date(mesDiaAnio(form.birthday));
              var date = form.birthday;
              var newdate = date.split("/").reverse().join("-");
              form.birthday = newdate;
              form.vendor = vm.form.vendedor
              form.responsable = vm.form.responsable
              if(form.responsable){
                if(form.responsable.url){
                  form.responsable = form.responsable.url
                }else{
                  form.responsable = form.responsable
                }
              }
              if (vm.org_name =='ancora') {
                form.card_official_identification = vm.listDocument[0].value;
                form.CURP = vm.listDocument[1].value;
                form.voucher_efirm = vm.listDocument[2].value;
                form.voucher_of_address = vm.listDocument[3].value;
                form.signed_format_ic = vm.listDocument[4].value;
                if (vm.form.only_sureties) {
                  form.carta_nombramiento = vm.listDocument[5].value;
                  form.curriculo = vm.listDocument[6].value;
                  form.contrato_multiple_afianzadora = vm.listDocument[7].value;
                  form.carta_buro = vm.listDocument[8].value;
                  form.entrevista_afianzadora = vm.listDocument[9].value;
                  form.rfc_document = vm.listDocument[10].value;
                  form.recibos_nomina = vm.listDocument[11].value;
                  form.declaracion_anual = vm.listDocument[12].value;
                  form.estados_financieros_anuales = vm.listDocument[13].value;
                  form.estados_financieros_parciales = vm.listDocument[14].value;
                  form.alta_hacienda = vm.listDocument[15].value; 
                  form.escritura_inmueble = vm.listDocument[16].value; 
                  form.boleta_predial = vm.listDocument[17].value; 
                  form.certificado_gravamen = vm.listDocument[18].value; 
                }             
                //upload files repect documents
                vm.listDocument.forEach(function(ar) {  
                  if (ar.arch.formData) {
                    var extension = ar.arch.formData[0].arch.name.split('.')[1];
                    ar.arch.formData[0].name = ar.name+'.'+extension
                    ar.arch.file.name = ar.name+'.'+extension
                    $scope.uploaderDocument.queue.push(ar.arch)
                    $scope.uploaderDocument.onAfterAddingFile(ar.arch)
                  }
                })                
              }else{
                form.card_official_identification = vm.listDocument[0].value;
                form.CURP = vm.listDocument[1].value;
                form.voucher_efirm = vm.listDocument[2].value;
                form.voucher_of_address = vm.listDocument[3].value;
                form.signed_format_ic = vm.listDocument[4].value;
                form.fiscal_power = vm.listDocument[5].value;
                if (vm.form.only_sureties) {
                  form.carta_nombramiento = vm.listDocument[6].value;
                  form.curriculo = vm.listDocument[7].value;
                  form.contrato_multiple_afianzadora = vm.listDocument[8].value;
                  form.carta_buro = vm.listDocument[9].value;
                  form.entrevista_afianzadora = vm.listDocument[10].value;
                  form.rfc_document = vm.listDocument[11].value;
                  form.recibos_nomina = vm.listDocument[12].value;
                  form.declaracion_anual = vm.listDocument[13].value;
                  form.estados_financieros_anuales = vm.listDocument[14].value;
                  form.estados_financieros_parciales = vm.listDocument[15].value;
                  form.alta_hacienda = vm.listDocument[16].value; 
                  form.escritura_inmueble = vm.listDocument[17].value; 
                  form.boleta_predial = vm.listDocument[18].value; 
                  form.certificado_gravamen = vm.listDocument[19].value; 
                }             
                //upload files repect documents
                vm.listDocument.forEach(function(ar) {  
                  if (ar.arch.formData) {
                    var extension = ar.arch.formData[0].arch.name.split('.')[1];
                    ar.arch.formData[0].name = ar.name+'.'+extension
                    ar.arch.file.name = ar.name+'.'+extension
                    $scope.uploaderDocument.queue.push(ar.arch)
                    $scope.uploaderDocument.onAfterAddingFile(ar.arch)
                  }
                })  
              }
              //upload documents
              vm.form.birthday = $filter('date')(vm.form.birthday, 'yyyy-MM-dd');
              vm.form.birthday = $filter('date')(vm.form.birthday, 'yyyy-MM-dd');
              var date = form.birthday;
              var newdate = date.split("/").reverse().join("-");
              // form.birthday = newdate;
              // form.birth_date = datesFactory.toDate(datesFactory.convertDate(newdate));
              form.birth_date = datesFactory.toDate(vm.form.birthday)
              try{
                if (form.birth_date.length <= 8) {
                  l.stop();
                  SweetAlert.swal("Error",MESSAGES.ERROR.DATEBIRTHDAY, "error");
                  return;
                }

              }catch(e){
              }
              if (vm.form.sucursal) {
                form.sucursal = vm.form.sucursal
              }else{
                form.sucursal = ''
              }
              form.has_bound_solidarity = $scope.has_solidario ? true : false;
              vm.form.bound_solidarity_many = $scope.obligados ? $scope.obligados : [];

              form.only_sureties = true;
              form.has_programa_de_proveedores = true;
              ContratanteService.createContratante(form, 1)
                  .then(function(data) {
                    $scope.contractorNew = data;
                      if ($scope.uploaderDocument.queue.length !=0) {
                        uploadFilesList(data.type_person, data.id);
                      }
                      if (!data.id) {
                        if(data.email){
                          l.stop();
                          SweetAlert.swal("ERROR", MESSAGES.ERROR.ERROREMAILMAX, "error");
                        }
                        else{
                          l.stop();
                          SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORCREATECONTRACTOR ,"error");
                        }
                      } else {

                        var params = {
                          'model': 2,
                          'event': "POST",
                          'associated_id': data.id,
                          'identifier': "creó el contratante."
                        }
                        dataFactory.post('send-log/', params).then(function success(response) {
                          
                        });

                        PersistenceFactory.eliminar();
                        $scope.sendEmails(data.url, 1);
                        $scope.sendPhones(data.url, 1);
                        $scope.sendResponsables(data.url, 1);
                          // Async add contacts
                          form.contact.forEach(function(contact) {
                              // contact.natural = data.url;
                              contact.contractor = data.url;
                              contactService.createContact(contact);
                          });
                          // Async add addresses
                          $scope.acumulate = 0;
                          form.userAddresses.forEach(function(address) {
                              $scope.acumulate = $scope.acumulate + 1;
                              address.url = globalVar.address;
                              address.administrative_area_level_1=address.administrative_area_level_1.state
                              address.administrative_area_level_2 =address.administrative_area_level_2.city
                              // address.natural = data.url;
                              address.contractor = data.url;
                              address.tipo = address.tipo ? address.tipo.name : '';
                              generalService.postService(address).then(function(address) {
                                data['address_contractor'].push(address.data)  
                              })
                          });

                          if (flag) {
                              return;
                          }

                          vm.disabledAfterSave = true;
                          $scope.userInfo = {
                              id: data.id,
                              type_person: data.type_person
                          };

                          $("#newContractor").val(data.id);

                          // Upload files
                          // $scope.userInfo.url = $scope.uploader.url = url.IP + checkType($scope.userInfo.type_person) + '/' + $scope.userInfo.id + '/archivos/';
                          $scope.userInfo.url = $scope.uploader.url = url.IP + 'contractors' + '/' + $scope.userInfo.id + '/archivos/';
                          vm.persons.push(data);
                          $q.when()
                              .then(function() {
                                  var defer = $q.defer();
                                  // defer.resolve($scope.uploader.uploadAll());
                                  return defer.promise;
                              })
                              .then(function() {
                                  // $scope.uploader.uploadAll();
                              });
                          $timeout(function() {
                            if($scope.countFile > 0){
                              if ($scope.acumulate == form.userAddresses.length) {
                                uploadFiles(data.type_person, data.id);
                              }else{
                                uploadFiles(data.type_person, data.id);
                              }
                            }
                            else{
                              if(!$scope.array_files) {
                                SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWCONTRACTOR, "success");
                                if ($scope.acumulate == form.userAddresses.length) {
                                      if(vm.acceso_ver_cont){
                                        $state.go('fianzas.pprovnew', {
                                          type: $scope.contractorNew.type_person == 1 ? 'fisicas' : 'morales',
                                          contratanteId: $scope.contractorNew.id
                                        });
                                      }else{
                                        $state.go('index.main')
                                      }
                                    $rootScope.show_contractor = false;

                                }
                              }

                            }

                          }, 10);
                      }
                  });
          }
        }
        vm.emails = {
            add: addEmail,
            delete: deleteEmail
        };

        // vm.responsables = {
        //     add: addResponsable,
        //     delete: deleteResponsable
        // };
        function formatDate (input) {
          var datePart = input.match(/\d+/g),
          year = datePart[0].substring(2), // get only two digits
          month = datePart[1], day = datePart[2];

          return day+'/'+month+'/'+year;
        }
        var obligados1 = {
          obligado: vm.form.contratante,
        };
        vm.form.obligados = []
        vm.form.obligados.push(obligados1)
        vm.juridicalForm.obligados = []
        vm.juridicalForm.obligados.push(obligados1)

        $scope.addObligados = function(type) {
          if(type === 1){
            var addobligadoss = {
              obligado: obligados1,
            };
            vm.form.obligados.push(addobligadoss);
          }else{        
            var addobligadoss = {
              obligado: obligados1,
            };
            vm.juridicalForm.obligados.push(addobligadoss);
          }
        }
        $scope.deleteObligados= function(index, type) {
          if (type === 1) {
            vm.form.obligados.splice(index, 1);
          } else {
            vm.juridicalForm.obligados.splice(index, 1);
          }
        }
        $scope.sendResponsables = function(url, typePerson){
          if(typePerson == 1){
            for(var i=0; i<vm.form.responsables.length; i++){
              // vm.form.responsables[i].natural = url;
              vm.form.responsables[i].contractor = url;
            }
            vm.responsable = vm.form.responsables;
          }
          else{
            for(var i=0; i<vm.juridicalForm.responsables.length; i++){
              // vm.juridicalForm.responsables[i].juridical = url;
              vm.juridicalForm.responsables[i].contractor = url;
            }
            vm.responsable = vm.juridicalForm.responsables;
          }

          if(vm.responsable){
            dataFactory.post('responsables/', vm.responsable)
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

        $scope.addResponsable = function(type) {
          if(type === 1){
            var addresponsables = {
              responsables: vm.form.responsable,
              resp_type: 0
            };
            vm.form.responsables.push(addresponsables);
          }
          else{
            var addresponsables = {
              responsables: vm.juridicalForm.responsable ? vm.juridicalForm.responsable: null,
              resp_type: 0
            }
            vm.juridicalForm.responsables.push(addresponsables);
          }
        }
        $scope.deleteResponsable = function(index, type) {
          if (type === 1) {
                vm.form.responsables.splice(index, 1);
            } else {
                vm.juridicalForm.responsables.splice(index, 1);
            }
        }
        $scope.sendResponsables = function(url, typePerson){
          if(typePerson == 1){
            for(var i=0; i<vm.form.responsables.length; i++){
              // vm.form.responsables[i].natural = url;
              vm.form.responsables[i].contractor = url;
            }
            vm.responsable = vm.form.responsables;
          }
          else{
            for(var i=0; i<vm.juridicalForm.responsables.length; i++){
              // vm.juridicalForm.responsables[i].juridical = url;
              vm.juridicalForm.responsables[i].contractor = url;
            }
            vm.responsable = vm.juridicalForm.responsables;
          }

          if(vm.responsable){
            dataFactory.post('responsables/', vm.responsable)
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
        vm.accesos = $sessionStorage.permisos;
        if (vm.accesos) {
          vm.accesos.forEach(function(perm){
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
        function addEmail(type) {
          if(type === 1){
            var addEmails = {
              correo: vm.form.correo
            };
            vm.form.emails.push(addEmails);
          }
          else{
            var addEmails = {
              correo: vm.juridicalForm.correo
            }
            vm.juridicalForm.emails.push(addEmails);
          }
        }
        function deleteEmail(index, type) {
          if (type === 1) {
                vm.form.emails.splice(index, 1);
            } else {
                vm.juridicalForm.emails.splice(index, 1);
            }
        }
        $scope.sendEmails = function(url, typePerson){
          if(typePerson == 1){
            for(var i=0; i<vm.form.emails.length; i++){
              // vm.form.emails[i].natural = url;
              vm.form.emails[i].contractor = url;
            }
            vm.correo = vm.form.emails;
          }
          else{
            for(var i=0; i<vm.juridicalForm.emails.length; i++){
              // vm.juridicalForm.emails[i].juridical = url;
              vm.juridicalForm.emails[i].contractor = url;
            }
            vm.correo = vm.juridicalForm.emails;
          }

          if(vm.correo){
            dataFactory.post('emails/', vm.correo)
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

        vm.phones = {
            add: addPhone,
            delete: deletePhone
        };
        function addPhone(type) {
          if (type === 1) {
            var addPhones = {
              phone: vm.form.phone
            };
            vm.form.phones.push(addPhones);
          } else {
            var addPhones = {
              phone: vm.juridicalForm.phone
            };
            vm.juridicalForm.phones.push(addPhones);
          }
        }
        function deletePhone(index, type) {
          if (type === 1) {
                vm.form.phones.splice(index, 1);
            } else {
                vm.juridicalForm.phones.splice(index, 1);
            }
        }
        $scope.sendPhones = function(url, typePerson){
          if(typePerson == 1){
            for(var i=0; i<vm.form.phones.length; i++){
              // vm.form.phones[i].natural = url;
              vm.form.phones[i].contractor= url;
            }
            vm.telefono = vm.form.phones;
          }
          else{
            for(var i=0; i<vm.juridicalForm.phones.length; i++){
              // vm.juridicalForm.phones[i].juridical = url;
              vm.juridicalForm.phones[i].contractor = url;
            }
            vm.telefono = vm.juridicalForm.phones;
          }
          if(vm.telefono){
            dataFactory.post('phones/', vm.telefono)
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

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        function submitJuridical() {
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          $scope.obligados = [];
          if (vm.juridicalForm.obligados) {
            vm.juridicalForm.obligados.forEach(function(elem, index) {
              if (elem.val) {
                if (elem.value) {                
                  $scope.obligados.push(elem.value.url);
                }
              }
            });              
          }
          vm.juridicalForm.bound_solidarity_many = $scope.obligados ? $scope.obligados : [];
          if (vm.juridicalForm.rfc == undefined){
            vm.juridicalForm.rfc = '';
          }
          $http.post(url.IP+'existrfc',{'rfc':vm.juridicalForm.rfc,'selector':2}).success(function(response) {
             if (response.status == true){
              SweetAlert.swal({
                  title: '¡El RFC del contratante ya existe!',
                  text: "¿Deseas continuar?",
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Si",
                  cancelButtonText: "No",
                  closeOnConfirm: false
              }, function(isConfirm) {
                  if (isConfirm) {
                    l.stop();
                    submitFormJuridical();
                    $scope.rfc_getDateJ(vm.juridicalForm.rfc);
                  }
                  else{
                     l.stop();
                    return
                  }
              });
            }
            else{
              $scope.arrayEmail = vm.juridicalForm.emails;
              vm.juridicalForm.emails = [];
              $scope.arrayPhone = vm.juridicalForm.phones;
              vm.juridicalForm.phones = [];

              for(var i = 0; i < $scope.arrayEmail.length; i++){
                if($scope.arrayEmail[i].correo){
                  if($scope.arrayEmail[i].email_type == 0){
                    $scope.arrayEmail[i].email_type = 1;
                  }
                  vm.juridicalForm.emails.push($scope.arrayEmail[i]);
                }
              }

              for(var i = 0; i < $scope.arrayPhone.length; i++){
                if($scope.arrayPhone[i].phone){
                  if($scope.arrayPhone[i].phone_type == 0){
                    $scope.arrayPhone[i].phone_type = 1;
                  }
                  vm.juridicalForm.phones.push($scope.arrayPhone[i]);
                }
              }

              l.stop();
              submitFormJuridical()
              $scope.rfc_getDateJ(vm.juridicalForm.rfc, vm.juridicalForm);
            }
          });

        }
        Date.prototype.isValid = function () {
            // An invalid date object returns NaN for getTime() and NaN is the only
            // object not strictly equal to itself.
            return this.getTime() === this.getTime();
        }; 

        $scope.rfc_getDateJ= function (curp, form) {
          if(vm.juridicalForm.date_of_establishment) {
            return
          }
          var m = curp.match( /^\w{4}(\w{2})(\w{2})(\w{2})/ );
          //miFecha = new Date(año,mes,dia) 
          try{
            var anyo = parseInt(m[1],10)+1900;
            if( anyo < 1950 ) anyo += 100;
            var mes = parseInt(m[2], 10)-1;
            var dia = parseInt(m[3], 10);
            var date = new Date( anyo, mes, dia );
            if (date.isValid()){
              vm.juridicalForm.date_of_establishment = datesFactory.convertDate(date)
            }
          } catch(err){

          }

          // return (new Date( anyo, mes, dia ));
        }

        // $scope.rfc_getDateJ= function (rfc,form){
        //   if(vm.juridicalForm.date_of_establishment) {
        //     if ($scope.isValidDate(vm.juridicalForm.date_of_establishment)) {
        //       return;
        //     }else{
        //       vm.juridicalForm.date_of_establishment = null
        //       $scope.rfc_getDateJ(rfc,2)              
        //     }
        //   }
        //   vm.rfc_fec= rfc.substr(3, 6);
        //   vm.rfc_anio = rfc.substr(3, 2);
        //   vm.rfc_month = rfc.substr(5, 2);
        //   vm.rfc_day = rfc.substr(7, 2);
        //   vm.fecha= vm.rfc_month+'/'+vm.rfc_day+'/'+vm.rfc_anio;
        //   vm.date = new Date(vm.fecha);
        //   vm.aniorfc= vm.date.getFullYear();
        //   vm.hoyA=vm.hoy.getFullYear();
        //   if(vm.aniorfc > vm.hoyA){
        //     vm.resta=vm.aniorfc-100;
        //     vm.rfc_anio = vm.resta;
        //     vm.fecha= vm.rfc_month+'/'+vm.rfc_day+'/'+vm.rfc_anio;
        //     if(vm.form.date_of_establishment == ""){
        //       var fecha_rfcJ= $filter('date')(new Date(vm.fecha), 'dd/MM/yyyy');
        //       vm.juridicalForm.date_of_establishment = fecha_rfcJ;
        //     }else{
        //       vm.juridicalForm.date_of_establishment = form.date_of_establishment;
        //     }
        //   }
        //   if(vm.juridicalForm.date_of_establishment == null || $scope.isValidDate(vm.juridicalForm.date_of_establishment) == false){
        //     var fecha_rfc= $filter('date')(new Date(vm.date), 'dd/MM/yyyy');
        //     vm.juridicalForm.date_of_establishment = fecha_rfc;
        //   }else{           
        //     if ($scope.isValidDate(vm.juridicalForm.date_of_establishment)) {
        //       vm.juridicalForm.date_of_establishment = vm.juridicalForm.date_of_establishment;
        //     }else{
        //       var fecha_rfcJ= $filter('date')(new Date(vm.fecha), 'dd/MM/yyyy');
        //       vm.juridicalForm.date_of_establishment = fecha_rfcJ;
        //       // $scope.rfc_getDateJ(rfc,2)              
        //     }
        //   }
        // }


        $scope.isValidDate = function(d) {
          return d instanceof Date && !isNaN(d);
        }
        function submitFormJuridical() {
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          if(vm.juridicalForm.j_name == ""){
            l.stop();
            if(!vm.juridicalForm.date_of_establishment){
              vm.juridicalForm.date_of_establishment = "";
            }
            if(vm.juridicalForm.emails.length == 0){
              vm.juridicalForm.emails = [{correo: '', email_type: ''}];
            }
            if(vm.juridicalForm.phones.length == 0){
              vm.juridicalForm.phones = [{phone: '', phone_type: ''}];
            }
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMJNAME, "error");
            return;
          }
          if(vm.juridicalForm.date_of_establishment == ""){
            l.stop();
            if(vm.juridicalForm.emails.length == 0){
              vm.juridicalForm.emails = [{correo: '', email_type: ''}];
            }
            if(vm.juridicalForm.phones.length == 0){
              vm.juridicalForm.phones = [{phone: '', phone_type: ''}];
            }
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMESTABLISHMENT, "error");
            return;
          }
          if(vm.juridicalForm.rfc == ""){
            l.stop();
            if(!vm.juridicalForm.date_of_establishment){
              vm.juridicalForm.date_of_establishment = "";
            }
            if(vm.juridicalForm.emails.length == 0){
              vm.juridicalForm.emails = [{correo: '', email_type: ''}];
            }
            if(vm.juridicalForm.phones.length == 0){
              vm.juridicalForm.phones = [{phone: '', phone_type: ''}];
            }
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMRFC, "error");
            return;
          }
          if(!vm.juridicalForm.group){
            l.stop();
            if(!vm.juridicalForm.date_of_establishment){
              vm.juridicalForm.date_of_establishment = "";
            }
            if(vm.juridicalForm.emails.length == 0){
              vm.juridicalForm.emails = [{correo: '', email_type: ''}];
            }
            if(vm.juridicalForm.phones.length == 0){
              vm.juridicalForm.phones = [{phone: '', phone_type: ''}];
            }
            SweetAlert.swal("ERROR", MESSAGES.ERROR.SELGROUP, "error");
            return;
          }
          if(vm.juridicalForm.emailMain){
            if(!validateEmail(vm.juridicalForm.emailMain)){
              l.stop();
              if(vm.juridicalForm.emails.length == 0){
                vm.juridicalForm.emails = [{correo: '', email_type: ''}];
              }
              if(vm.juridicalForm.phones.length == 0){
                vm.juridicalForm.phones = [{phone: '', phone_type: ''}];
              }
              SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
              return;
            }
          }
          $scope.flagEmail = false;
          if(vm.juridicalForm.emails.length > 0){
            for(var i = 0; i < vm.juridicalForm.emails.length; i++){
              if(!validateEmail(vm.juridicalForm.emails[i].correo)){
                $scope.flagEmail = true;
              }
            }
            if($scope.flagEmail == true){
              l.stop();
              $scope.flagEmail = false;
              SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAIL, "error");
              return;
            }
          }

            if (!helpers.hasAtLeastOneAddress(vm.juridicalForm.userAddresses)) {
              l.stop();
              toaster.info(MESSAGES.ERROR.ADDATLEASTONEDIRECCTION);
            }
            else {
                var flag = false, outme = false;
                vm.juridicalForm.contact_juridical.forEach(function(contact) {

                  if(contact.name == ""){
                    l.stop();
                    SweetAlert.swal("ERROR", MESSAGES.ERROR.SELADDRES, "error");
                    flag = true;
                    return;
                  }
                  else{
                    if(contact.email){
                      if (!validateEmail(contact.email)) {
                        l.stop();
                        SweetAlert.swal("ERROR", MESSAGES.ERROR.INVALIDEMAILCONTACT, "error");
                        flag = true;
                        return;
                      }
                    }
                    if (contact.phone_number) {
                      if(contact.phone_number.length < 9){
                        l.stop();
                        SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONECONTACT, "error");
                        return;
                      }
                    }
                  }

                });

                var since = toDate(vm.juridicalForm.date_of_establishment).getTime();
                var until = toDate(convertDate(new Date())).getTime();
                var diff = until - since;
                var antiguedad = parseInt(diff/(1000*60*60*24))
                if(antiguedad <= 0){
                  l.stop();
                  SweetAlert.swal("Error", MESSAGES.ERROR.ERRORDATEFORMESTABLISHMENT, "error");
                  return;
                }

                if (flag) {
                    return;
                }

                var form = angular.copy(vm.juridicalForm);
                var juridicalForm = angular.copy(vm.juridicalForm);
                var arr = [];
                var nums = [];
                vm.juridicalForm.contact_juridical.forEach(function(elem, index) {
                     arr.push(elem);
                });

                form.constitutive_act = vm.listDocument[0].value;
                form.rfc_document = vm.listDocument[1].value;
                form.card_official_identification = vm.listDocument[2].value;
                form.voucher_of_address = vm.listDocument[3].value;
                form.modifications_constitutive_act = vm.listDocument[4].value;
                form.fiscal_power = vm.listDocument[5].value;
                if (vm.juridicalForm.only_sureties) {
                  form.curriculo = vm.listDocument[6].value;
                  form.contrato_multiple_afianzadora = vm.listDocument[7].value;
                  form.carta_buro = vm.listDocument[8].value;
                  form.entrevista_afianzadora = vm.listDocument[9].value;
                  form.aviso_privacidad = vm.listDocument[10].value;
                  form.protocolizaciones = vm.listDocument[11].value;
                  form.alta_hacienda = vm.listDocument[12].value;
                  form.cambio_domicilio_hacienda = vm.listDocument[13].value;
                  form.voucher_efirm = vm.listDocument[14].value;
                  form.declaracion_anual = vm.listDocument[15].value;
                  form.estados_financieros_anuales = vm.listDocument[16].value;
                  form.estados_financieros_parciales = vm.listDocument[17].value; 
                  form.escritura_inmueble = vm.listDocument[18].value; 
                  form.boleta_predial = vm.listDocument[19].value; 
                  form.certificado_gravamen = vm.listDocument[20].value; 
                }     
                //upload files repect documents
                vm.listDocument.forEach(function(ar) {  
                  if (ar.arch.formData) {
                    var extension = ar.arch.formData[0].arch.name.split('.')[1];
                    ar.arch.formData[0].name = ar.name+'.'+extension
                    ar.arch.file.name = ar.name+'.'+extension
                    $scope.uploaderDocument.queue.push(ar.arch)
                    $scope.uploaderDocument.onAfterAddingFile(ar.arch)
                  }
                })
                //upload documents
                form.date_of_establishment = $filter('date')(vm.juridicalForm.date_of_establishment, 'yyyy-MM-dd'); //jshint ignore:line
                form.contact = arr;
                form.group = form.group ? form.group.url : '';
                juridicalForm.userAddresses = [];
                form.userAddresses.forEach(function(elem) {
                  if (elem.administrative_area_level_1 == null || !elem.administrative_area_level_1 || elem.administrative_area_level_1 === undefined || elem.administrative_area_level_1 == 'undefined' || elem.administrative_area_level_2 == null || !elem.administrative_area_level_2 || elem.administrative_area_level_2 === undefined || elem.administrative_area_level_2 == 'undefined') {
                    l.stop();
                    if(!vm.juridicalForm.date_of_establishment){
                      vm.juridicalForm.date_of_establishment = "";
                    }
                    if(vm.juridicalForm.emails.length == 0){
                      vm.juridicalForm.emails = [{correo: '', email_type: ''}];
                    }
                    if(vm.juridicalForm.phones.length == 0){
                      vm.juridicalForm.phones = [{phone: '', phone_type: ''}];
                    }
                    SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAADDRESSREQUIRED, "error");
                    outme=true
                    return;
                  }
                  var auxElem = elem
                  elem.administrative_area_level_1 = auxElem.administrative_area_level_1
                  elem.administrative_area_level_2 = auxElem.administrative_area_level_2
                  juridicalForm.userAddresses.push(elem);

                });

                if (outme == true) {
                  return;
                }

                // if(form.group == '' || juridicalForm.group == ''){
                //   l.stop();
                //   SweetAlert.swal("ERROR",MESSAGES.ERROR.SELGROUP ,"error");
                //   flag = true;
                //   return;
                // }

                var date = form.date_of_establishment;
                var newdate = date.split("/").reverse().join("-");
                form.date_of_establishment = newdate;

                form.email = juridicalForm.emailMain ? juridicalForm.emailMain : "";
                form.phone_number = juridicalForm.phoneMain ? juridicalForm.phoneMain : "";
                form.vendor = vm.juridicalForm.vendedor
                form.responsable = vm.juridicalForm.responsable
                if(form.responsable){
                  if(form.responsable.url){
                    form.responsable = form.responsable.url
                  }else{
                    form.responsable = form.responsable
                  }
                }


                if(juridicalForm.email == "" && vm.juridicalForm.emails.length > 0){
                  juridicalForm.email = vm.juridicalForm.emails[0].correo;
                  vm.juridicalForm.emails.splice(0, 1);
                }

                if(vm.juridicalForm.phoneMain){
                  if(vm.juridicalForm.phoneMain.length < 9){
                    l.stop();
                    SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONE, "error");
                    return;
                  }
                }

                for(var i = 0; i < vm.juridicalForm.phones.length; i++){
                  if(vm.juridicalForm.phones[i].phone.length < 9){
                    $scope.flagPhone = true;
                  }
                }
                if(!$scope.flagPhone){
                  if(juridicalForm.phone_number == "" && vm.juridicalForm.phones.length > 0){
                    juridicalForm.phone_number = vm.juridicalForm.phones[0].phone;
                    vm.juridicalForm.phones.splice(0, 1);
                  }
                }
                else{
                  $scope.flagPhone = false;
                  l.stop();
                  SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORLENGTHPHONE, "error");
                  return;
                }
                try{
                  if (form.date_of_establishment.length <= 8) {
                    l.stop();
                    SweetAlert.swal("Error",MESSAGES.ERROR.DATEESTABLISHMENT, "error");
                  return;
                  }

                }catch(e){
                }
                if (vm.juridicalForm.sucursal) {
                  form.sucursal = vm.juridicalForm.sucursal
                }else{
                  form.sucursal = ''
                }
                // form.birth_date = datesFactory.toDate(form.date_of_establishment ? convertDate(new Date(form.date_of_establishment)) : convertDate(new Date(m.juridicalForm.date_of_establishment)));
                form.birth_date = datesFactory.toDate(vm.juridicalForm.date_of_establishment)
                form.type_person = 2
                form.group = vm.juridicalForm.subsubgrupo ? vm.juridicalForm.subsubgrupo.url : vm.juridicalForm.subgroup ? vm.juridicalForm.subgroup.url : vm.juridicalForm.group ? vm.juridicalForm.group.url : '';
                // form.grouping_level = form.subsubasignaciones ? form.subsubasignaciones.url : form.subagrupaciones ? form.subagrupaciones.url : form.grouping_level ? form.grouping_level.url : '';
                form.groupinglevel = form.subsubasignaciones ? form.subsubasignaciones.url : form.subagrupaciones ? form.subagrupaciones.url : form.grouping_level ? form.grouping_level.url : null;
                // form.celula = vm.juridicalForm.celula ? vm.juridicalForm.celula : null;
                form.cellule = vm.juridicalForm.celula ? vm.juridicalForm.celula : null;
                form.full_name = vm.juridicalForm.j_name;
                vm.form.bound_solidarity_many = $scope.obligados ? $scope.obligados : [];
                form.has_bound_solidarity = $scope.has_solidario ? true : false;

                form.only_sureties = true;
                form.has_programa_de_proveedores = true;
                ContratanteService.createContratante(form, 2)
                    .then(function(data) {
                      $scope.contractorNew = data;
                      if ($scope.uploaderDocument.queue.length !=0) {
                        uploadFilesList(data.type_person, data.id);
                      }
                      if(data.type_person == 'Moral')data['address_contractor'] = [];
                      else data['address_natural'] = [];

                        if (!data.id) {
                          if(data.email){
                            l.stop();
                            SweetAlert.swal("ERROR", MESSAGES.ERROR.ERROREMAILMAX, "error");
                          }
                          else{
                            l.stop();
                            SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORCREATECONTRACTOR ,"error");
                          }
                        } else {
                          $scope.sendEmails(data.url, 2);
                          $scope.sendPhones(data.url, 2);
                          $scope.sendResponsables(data.url, 2);
                            form.contact.forEach(function(contact) {
                              // contact.juridical = data.url;
                              contact.contractor = data.url;
                              contactService.createContact(contact);
                            });
                            // var address = {};
                            $scope.acumulate = 0;
                            juridicalForm.userAddresses.forEach(function(address) {
                                $scope.acumulate = $scope.acumulate + 1;
                                address.url = globalVar.address;
                                // address.juridical = data.url;
                                address.contractor = data.url;
                                address.administrative_area_level_1=address.administrative_area_level_1.state;
                                address.administrative_area_level_2 =address.administrative_area_level_2.city;
                                address.tipo = address.tipo ? address.tipo.name : '';
                                generalService.postService(address).then(function(address) {
                                  if(data.type_person == 'Moral'){
                                    data['address_contractor'].push(address.data);
                                  }
                                  else{
                                    data['address_contractor'].push(address.data);
                                  }
                                });

                            });
                            if (flag) {
                                return;
                            }
                            // toaster.success(MESSAGES.OK.NEWCONTRACTOR);

                            vm.disabledAfterSave = true;

                            $scope.userInfo = {
                                id: data.id,
                                type_person: data.type_person
                            };

                            $("#newContractor").val(data.id);

                            // Upload files
                            // $scope.userInfo.url = $scope.uploader.url = url.IP + checkType($scope.userInfo.type_person) + '/' + $scope.userInfo.id + '/archivos/';
                            $scope.userInfo.url = $scope.uploader.url = url.IP + 'contractors/' + $scope.userInfo.id + '/archivos/';
                            vm.persons.push(data);
                            $q.when()
                                .then(function() {
                                    var defer = $q.defer();
                                    defer.resolve($scope.uploader.uploadAll());
                                    return defer.promise;
                                })
                                .then(function() {
                                    $scope.uploader.uploadAll();
                                });

                            $timeout(function() {
                              if($scope.countFile > 0){
                                if ($scope.acumulate == vm.juridicalForm.userAddresses.length) {
                                  uploadFiles(data.type_person, data.id);
                                }else{
                                  uploadFiles(data.type_person, data.id);
                                }
                              }
                              else{
                                if(!$scope.array_files) {
                                  if (vm.acceso_ver_cont) {
                                    if ($scope.acumulate == vm.juridicalForm.userAddresses.length) {
                                      SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWCONTRACTOR, "success");
                                      $state.go('fianzas.pprovnew', {
                                        type: $scope.contractorNew.type_person == 1 ? 'fisicas' : 'morales',
                                        contratanteId: $scope.contractorNew.id
                                      });
                                      $rootScope.show_contractor = false;
                                    }
                                  }else{
                                    $state.go('index.main', params);
                                  }
                                }
                              }
                            }, 10);
                        }
                    });
            }
        }

        function submitFormJuridical1() {
          var form = {};
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          if(vm.juridicalForm.j_name == ""){
            l.stop();
            SweetAlert.swal("ERROR", MESSAGES.ERROR.DATAFORMJNAME, "error");
            return;
          }    
          form.type_person = 2;    
          form.full_name = vm.juridicalForm.j_name;    
          form.only_sureties = true;
          form.has_programa_de_proveedores = true;
          form.rfc = 'PPROVEEDORES'
          ContratanteService.createContratante(form, 2)
              .then(function(data) {
                l.stop();
                $scope.contractorNew.id = data.id;
                if($scope.countFile > 0){
                  uploadFiles(data.type_person, data.id);
                }
                var payload = {
                  type: data.type_person == 1 ? 'fisicas' : 'morales',
                  contratanteId: data.id
                }
                console.log(payload);
                // $scope.open_in_same_tab('Información Programa', 'fianzas.pprovnew',payload, payload['contratanteId'] , payload['type']);
                SweetAlert.swal("¡Listo!", MESSAGES.OK.NEWCONTRACTOR, "success");

                var name = 'Información Programa';
                var route = 'fianzas.pprovedit';

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
          
                $state.go($scope.route_for_new_tab, payload);
              });
        }
        function insert(form) {

        }

        function checkType(type) { //jshint ignore:line
            // return (type === 'Fisica') ? 'fisicas' : 'morales';
            return (type === 'Física') ? 'fisicas' : 'morales';
        }

        function addContact(type) {
            var contact = {
                name: '',
                phone_number: '',
                email: ''
            };
            if (type === 1) {
                vm.form.contact_natural.push(contact);
            } else {
                vm.juridicalForm.contact_juridical.push(contact);
            }
        }

        function deleteContacts(contact, type) {
            if (type === 1) {
                vm.form.contact_natural.splice(contact, 1);
            } else {
                vm.juridicalForm.contact_juridical.splice(contact, 1);
            }
        }

        $scope.open_in_same_tab = function(name, route, params, identifier, type){
          var existe = false;
          if (name && route){
            $scope.route_for_new_tab = route;
            $scope.name_for_new_tab = name;
            // appStates.states.forEach(function(state) {
            //   if (state.route == $scope.route_for_new_tab){
            //     existe = true;
            //   }
            // });
          }
    
          // if (!existe){
            var active_tab = appStates.states.findIndex(function(item){
              if (item.active){
                return true
              }
              return false;
            });
            if (type){
              appStates.states[active_tab] = { 
                id: identifier,
                name: $scope.name_for_new_tab, 
                heading: $scope.name_for_new_tab, 
                route: $scope.route_for_new_tab, 
                active: true, 
                isVisible: true, 
                href: $state.href($scope.route_for_new_tab),
                type : type
              }
            } else {
              appStates.states[active_tab] = {
                id: identifier,
                name: $scope.name_for_new_tab, 
                heading: $scope.name_for_new_tab, 
                route: $scope.route_for_new_tab, 
                active: true, 
                isVisible: true, 
                href: $state.href($scope.route_for_new_tab)
              }
            }
          // }
          $localStorage.tab_states = appStates.states;
          $localStorage.tab_index = $localStorage.tab_states.length -1;
    
          $state.go($scope.route_for_new_tab, params);
        }


        function openModalGroup(level, type, parent) {

            $("#modalContratate").parent().parent().parent().css("display", "none");
            $(".modal-backdrop").click(function() {
                $("#modalContratate").parent().parent().parent().css("display", "block");
            });
            var modalInstance = $uibModal.open({ //jshint ignore:line
                templateUrl: 'app/grupos/grupos.form.html',
                controller: ModalInstanceCtrl,
                resolve: {
                  padre: function() {
                    return parent;
                  },
                  parent: function() {
                    return vm;
                  },
                  type: function() {
                    return type;
                  },
                  level: function() {
                    return level;
                  },
                  group: function() {
                    return level == 2 ? vm.form.group : {};
                  }
                },
                backdrop: 'static', /* this prevent user interaction with the background */
                keyboard: false
                // windowClass: 'animated fadeIn'
            });
        }
        vm.subgroups = [];
        vm.sub_subgroups = [];

        function ModalInstanceCtrl($scope, $uibModalInstance, parent, level, group, type,padre) {
          $scope.level = level;
          $scope.groupForm = {};
          $scope.subgroupForm = {};
          $scope.subsubgroupForm = {};
          $scope.subgroups = [];
          $scope.sub_subgroups = [];

          $scope.addSubgroups = function () {
            var obj = {name: '', observations: '', sub_subgroup: []};
            $scope.subgroups.push(obj);
          };

          $scope.deleteSubgroup = function (index) {
            $scope.subgroups.splice(index, 1);
          };

          $scope.addSubsubgroups = function () {
            var obj = {name: '', observations: '', sub_subgroup: []};
            $scope.sub_subgroups.push(obj);
          };

          $scope.deleteSubsubgroup = function (index) {
            $scope.sub_subgroups.splice(index, 1);
          };

          $http.get(url.IP + 'usuarios/')
          .then(function(user) {
            $scope.users = user.data.results;

            $scope.show_pagination = true;
          });

          $scope.changeResponsable = function(data, type){
            // $scope.responsables_natural = [];
            // $scope.responsables_juridical = [];
            if(type == 1){
              $scope.responsables_natural.push(data);
            } else {
              $scope.responsables_juridical.push(data);
            }
          };

          $scope.ok = function() {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            if(!$scope.groupForm.responsable){
              l.stop();
              SweetAlert.swal("ERROR", "Selecciona un responsable.", "error");
              return;
            }

            var flag = false;
            var form = angular.copy($scope.groupForm);
            var name = form.group_name;
            var bd_group_name = [];
            groupService
            .getGroups()
            .then(function(res) {
              res.forEach(function(group, i) {
                  bd_group_name.push(String(group.group_name));
              });

              for (var i = 0; i < bd_group_name.length; i++) {
                if (name == bd_group_name[i]) {
                    flag = true;
                }
              }

              form.type_group = 1;

              if (flag == false) {
                return groupService.createGroup(form)
                    .then(function(data) {
                      if(data.status === 201) {
                        vm.groups.push(data.data);
                        $rootScope.changeGroup(data.data);
                        if(vm.form.email) {
                          vm.form.group = data.data;
                        } else if(vm.juridicalForm.email) {
                          vm.juridicalForm.group = data.data;
                        }

                        if ($uibModalInstance) {
                          $uibModalInstance.close();
                          $("#modalContratate").parent().parent().parent().css("display", "block");
                        }

                        if ($scope.subgroups.length > 0) {
                          $scope.subgroups.forEach(function(item){
                            var datas = {
                              group_name: item.group_name,
                              responsable: data.data.responsable,
                              parent: data.data.url,
                              type_group: 2
                            }

                            $http({
                              method: 'POST',
                              url: url.IP + 'grupos/',
                              data: datas
                            })
                            .then(function (request) {
                              if(request.status === 200 || request.status === 201) {
                                // vm.subgroups.push(request.data);
                                if (type === 1) {
                                  vm.form.group.subgrupos.push(request.data);
                                } else {
                                  vm.juridicalForm.group.subgrupos.push(request.data);
                                }
                              }
                            })
                            .catch(function (e) {
                              l.stop();
                              console.log('e', e);
                            });
                          });
                        }

                      } else if(data.status === 403) {
                        toaster.warning('Usted no tiene permisos para crear grupos');
                        // return;
                        l.stop();
                        $uibModalInstance.close();
                        $("#modalContratate").parent().parent().parent().css("display", "block");
                      }
                    }).catch(function() {
                      l.stop();
                      return;
                    });
              } else {
                l.stop();
                SweetAlert.swal("ERROR",MESSAGES.ERROR.THISNAMEALREADYEXIST ,"error");
                return;
              }
            });
          };

          $scope.oksub = function() {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            $scope.subgroupForm.responsable = group.responsable;
            $scope.subgroupForm.parent = padre.url;
            $scope.subgroupForm.type_group = 2;

            if(!$scope.subgroupForm.group_name){
              l.stop();
              SweetAlert.swal("Error", "Agrega un nombre de subgrupo.", "error");
              return;
            }

            $http({
              method: 'POST',
              url: url.IP + 'grupos/',
              data: $scope.subgroupForm
            })
            .then(function (request) {
              if(request.status === 200 || request.status === 201) {
                try{
                  vm.subgroups.push(request.data)
                }catch(e){
                  vm.subgroups = [];
                  vm.subgroups.push(request.data)
                }
  
                if ($scope.sub_subgroups.length > 0) {
                  vm.subgroups[vm.subgroups.length - 1].subsubgrupos = [];
                  $scope.sub_subgroups.forEach(function(item){
                    var datas = {
                      group_name: item.group_name,
                      responsable: group.responsable,
                      parent: request.data.url,
                      type_group: 3
                    }

                    $http({
                      method: 'POST',
                      url: url.IP + 'grupos/',
                      data: datas
                    })
                    .then(function (response) {
                      if(response.status === 200 || response.status === 201) {
                        vm.subgroups[vm.subgroups.length - 1].subsubgrupos.push(response.data);
                      }
                    })
                    .catch(function (e) {
                      l.stop();
                      console.log('e', e);
                    });
                  });
                }
                $scope.cancel();
              }
            })
            .catch(function (e) {
              l.stop();
              console.log('e', e);
            });
          };

          $scope.oksubsub = function() {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            $scope.subsubgroupForm.responsable = group.responsable;
            $scope.subsubgroupForm.parent = padre.url;
            $scope.subsubgroupForm.type_group = 3;

            if(!$scope.subsubgroupForm.group_name){
              l.stop();
              SweetAlert.swal("Error", "Agrega un nombre de subsubgrupo.", "error");
              return;
            }

            $http({
              method: 'POST',
              url: url.IP + 'grupos/',
              data: $scope.subsubgroupForm
            })
            .then(function (request_sub) {
              if(request_sub.status === 200 || request_sub.status === 201) {
                if(vm.sub_subgroups == undefined){
                  vm.sub_subgroups = [];
                }
                vm.sub_subgroups.push(request_sub.data);
                $scope.cancel();
              }
            })
            .catch(function (e) {
              l.stop();
              console.log('e', e);
            });
          };

          $scope.cancel = function() {
            if ($uibModalInstance) {
              $uibModalInstance.dismiss('cancel');
              $("#modalContratate").parent().parent().parent().css("display", "block");
            }
          };
        }

        function openModalAsignacion(level,parent) {
          var modalInstance = $uibModal.open({ //jshint ignore:line
            templateUrl: 'app/contratantes/contratantes.agrupacion.html',
            controller: ModalGroupCtrl,
            resolve: {
              padre: function() {
                return parent;
              },
              parent: function() {
                return vm;
              },
              level: function() {
                return level;
              },
              group: function() {
                return level == 2 ? vm.form.grouping_level : vm.form.subagrupaciones;
              }
            },
            backdrop: 'static', /* this prevent user interaction with the background */
            keyboard: false
            // windowClass: 'animated fadeIn'
          });
        }

        $scope.sub_asignaciones = [];
        $scope.sub_subasignaciones = [];

        function ModalGroupCtrl($scope, $uibModalInstance, parent, level, group,padre) {
          $scope.level = level;
          $scope.group_modal = group;
          $scope.grupo = {};
          // $scope.subasignaciones = [];
          $scope.subsubasignacion = [];

          $scope.addSubasignaciones = function () {
            var obj = {name: '', observations: '', sub_subgroup: []};
            vm.subasignaciones.push(obj);
          };

          $scope.deleteSubasignaciones = function (index) {
            vm.subasignaciones.splice(index, 1);
          };

          $scope.addSubsubasignaciones = function () {
            var obj = {name: '', observations: '', sub_subgroup: []};
            $scope.subsubasignacion.push(obj);
          };

          $scope.deleteSubsubasignaciones = function (index) {
            $scope.subsubasignacion.splice(index, 1);
          };

          $http.get(url.IP + 'usuarios/')
          .then(function(user) {
            $scope.users = user.data.results;

            $scope.show_pagination = true;
          });

 

          $scope.saveSub = function() {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            $scope.grupo.level_grouping = padre.level_grouping;
            $scope.grupo.parent = padre.url;
            $scope.grupo.type_grouping = 2;

            if(!$scope.grupo.description){
              l.stop();
              SweetAlert.swal("Error", "Agrega un nombre de subagrupación.", "error");
              return;
            }

            $http({
              method: 'POST',
              url: url.IP + 'groupinglevel/',
              data: $scope.grupo
            })
            .then(function (request_sub) {
              if(request_sub.status === 200 || request_sub.status === 201) {
                $rootScope.changeAgrupacion2(padre);
                $scope.sub_subasignaciones = padre.subsubgrupos;
                if($scope.subsubasignacion.length > 0){
                  $scope.subsubasignacion.forEach(function(item, index){
                    var datas = {
                      description: item.description,
                      responsable: $scope.grupo.responsable,
                      parent: request_sub.data.url,
                      type_grouping: 3,
                      level_grouping: group.level_grouping
                    }

                    $http({
                      method: 'POST',
                      url: url.IP + 'groupinglevel/',
                      data: datas
                    })
                    .then(function (response) {
                      if(response.status === 200 || response.status === 201) {
                        $rootScope.changeAgrupacion2(padre);
                        $scope.sub_subasignaciones.push(response.data)
                        $scope.agrupaciones.subgrupos.forEach(function(sub, index){
                          if(sub.id == request_sub.data.id){
                            vm.agrupaciones.subgrupos[index].subsubgrupos.push(response.data);                            
                          }
                        });
                      }
                    })
                    .catch(function (e) {
                      l.stop();
                      console.log('e', e);
                    });

                    if($scope.subsubasignacion.length == (index + 1)){
                      vm.agrupaciones.forEach(function(gpo){
                        if(gpo.description == vm.form.grouping_level.description){
                          vm.form.grouping_level = gpo;
                        }
                      });
                    }
                  });
                }
                try{
                  $scope.sub_asignaciones.push(request_sub.data);
                }catch(e){
                  $scope.sub_asignaciones = request_sub.data
                }
                $scope.cancel();
              }
            })
            .catch(function (e) {
              l.stop();
              console.log('e', e);
            });
          };

          $scope.saveSubsub = function() {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            $scope.grupo.level_grouping = padre.level_grouping;
            $scope.grupo.parent = padre.url;
            $scope.grupo.type_grouping = 3;

            if(!$scope.grupo.description){
              l.stop();
              SweetAlert.swal("Error", "Agrega un nombre de subsubagrupación.", "error");
              return;
            }

            $http({
              method: 'POST',
              url: url.IP + 'groupinglevel/',
              data: $scope.grupo
            })
            .then(function (request_sub) {
              if(request_sub.status === 200 || request_sub.status === 201) {
                // $scope.sub_subasignaciones.push(request_sub.data);   
                $scope.sub_subasignaciones = padre.subsubgrupos;
                try{
                  $scope.sub_subasignaciones.push(request_sub.data);
                }catch(e){
                  $scope.sub_subasignaciones = request_sub.data
                }                
                $rootScope.changeAgrupacion2(padre);
                $scope.cancel();
              }
            })
            .catch(function (e) {
              l.stop();
              console.log('e', e);
            });
          };

          $scope.cancel = function() {
            if ($uibModalInstance) {
              $uibModalInstance.dismiss('cancel');
            }
          };
        }

        function openModalClasification(level) {
          var modalInstance = $uibModal.open({ //jshint ignore:line
            templateUrl: 'app/contratantes/contratantes.clasificacion.html',
            controller: ModaClasificationCtrl,
            resolve: {
              parent: function() {
                return vm;
              }
            },
            backdrop: 'static', /* this prevent user interaction with the background */
            keyboard: false
            // windowClass: 'animated fadeIn'
          });
        }
        function openModalCelulaContractor(level) {
          var modalInstance = $uibModal.open({ //jshint ignore:line
            templateUrl: 'app/contratantes/contratantes.celulas.html',
            controller: ModalCelulasCtrl,
            resolve: {
              parent: function() {
                return vm;
              }
            },
            backdrop: 'static', /* this prevent user interaction with the background */
            keyboard: false
            // windowClass: 'animated fadeIn'
          });
        }
        $scope.sub_asignaciones = [];
        $scope.sub_subasignaciones = [];

        function ModaClasificationCtrl($scope, $uibModalInstance, parent) {
          $scope.classification = {};

          $scope.save = function() {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();
            $scope.classification.classification_name = $scope.classification.classification_name,
            $scope.classification.description = $scope.classification.description,

            $http({
              method: 'POST',
              url: url.IP + 'classification/',
              data: $scope.classification
            })
            .then(function (response) {
              if(response.status === 200 || response.status === 201) {
                l.stop();
                vm.clasifications.push(response.data);
                $scope.cancel();
              }
            })
            .catch(function (e) {
              l.stop();
              console.log('e', e);
            });
          };

          $scope.cancel = function() {
            if ($uibModalInstance) {
              $uibModalInstance.dismiss('cancel');
            }
          };
        }

        function ModalCelulasCtrl($scope, $uibModalInstance, parent) {
          $scope.celula = {};          
          dataFactory.get('usuarios/')
          .then(function(user) {
            $scope.usuarios_saam  = user.data.results;
          });
          $scope.save_celula = function() {
            var l = Ladda.create( document.querySelector( '.ladda-button' ) );
            l.start();

            $scope.celula.celula_name = $scope.celula.celula_name;
            $scope.celula.description = $scope.celula.description;
            $scope.celula.users_many = $scope.usuarios_selected ? $scope.usuarios_selected : [];
            $http({
              method: 'POST',
              url: url.IP + 'celula_contractor/',
              data: $scope.celula
            })
            .then(function (response) {
              if(response.status === 200 || response.status === 201) {
                vm.celulas.push(response.data);
                $scope.cancel_celula();
              }
            })
            .catch(function (e) {
              console.log('e', e);
            });
          };

          $scope.cancel_celula = function() {
            if ($uibModalInstance) {
              $uibModalInstance.dismiss('cancel');
            }
          };  

          $scope.selectUsuarios = function(sel){
            $scope.usuarios_selected = [];
            sel.forEach(function(u) {
              if (u.url) {
                $scope.usuarios_selected.push(u.url)
              }else{
                $scope.usuarios_selected.push(u)
              }
            })
          };
        }      
        // vm.changeGroup = changeGroup;
        $rootScope.changeGroup = function(data){
          if (data) {
            if (data.id) {
              dataFactory.post('subgrupos-match/', { parent: data.id })
              .then(function(subgrupos_) {
                vm.subgroups = subgrupos_.data;
              });        
            }else{
              if(data){
                if(data.subgrupos){
                  vm.subgroups = data.subgrupos;
                }else{
                  vm.subgroups = [];
                }
              }else{vm.subgroups = [];}        
            }
          }else{vm.subgroups = [];} 
          // vm.subgroups = data.subgrupos;
          vm.juridicalForm.group = data;
          vm.form.group = data;
          if (data.responsable){
            $http.get(data.responsable )
              .then(
                function success(request) {
                  if(request.status === 200) {
                    vm.form.responsable = request.data
                    vm.juridicalForm.responsable = request.data
                  }
                },
                function error(error) {

                }
              )
              .catch(function(e){
                  console.log(e);
              });
          }else{
            vm.form.responsable = ''
            vm.juridicalForm.responsable = ''
          }
        }

        $rootScope.changeSubGroup = function(data){
          // vm.sub_subgroups = data.subsubgrupos;
          // $rootScope.changeGroup(vm.juridicalForm.group ? vm.juridicalForm.group : vm.form.group)
          if(data){
            if(data.subsubgrupos){
              vm.sub_subgroups = data.subsubgrupos;
            }else{
              vm.sub_subgroups = [];
            }
          }else{vm.sub_subgroups = [];} 
        }

        $rootScope.changeAgrupacion2 = function(data){
          if (data) {
            if (data.id && data.type_grouping ==1) {
              dataFactory.post('subagrupaciones-match/', { parent: data.id })
              .then(function(subgrupos_) {
                $scope.sub_asignaciones = subgrupos_.data;
                // $scope.sub_subasignaciones = [];
              });        
            }else{
              if(data){
                if(data.subgrupos){
                  $scope.sub_asignaciones = data.subgrupos;
                }else if(data.subsubgrupos){
                  $scope.sub_subasignaciones = data.subsubgrupos;
                }
              }else{$scope.sub_asignaciones = [];}        
            }
          }else{$scope.sub_asignaciones = [];} 
          // $scope.sub_asignaciones = data.subgrupos;
        }

        $rootScope.changeSubagrupacion2 = function(data){
          // if(data.subsubgrupos){
          //   vm.sub_subasignaciones = data.subsubgrupos;
          // }
          if(data){
            if(data.subsubgrupos){
              $scope.sub_subasignaciones = data.subsubgrupos;
            }else{
              $scope.sub_subasignaciones = [];
            }
          }else{$scope.sub_subasignaciones = [];} 
        }

        $rootScope.changeVendedor = function(data){
          vm.juridicalForm.vendedor = data;
          vm.form.vendedor = data;
        }

        $scope.changeResponsable_single = function(data){
          vm.form.responsable = data;

        }
        $scope.exportData = function (type_person) {
          // var header = '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">';
          // var blob = new Blob([header + document.getElementById('exportable').innerHTML], {
          //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
          // });
          // saveAs(blob, "Reporte_" + aseguradoras + ".xls");
          // fisicas y morales


           var data = {cadena : $scope.param_cadena};
          if(type_person == 1) { // naturales
            $http.get(url.IP +'reporte-fisicas/')
            .then(function (request) {
              if(request.status === 200) {
                 exportFactory.excel(request.data, 'ContratantesFisicos');
              }
            })
            .catch(function (e) {
              console.log('e', e);
            });


          } else if(type_person == 2){
            $http.get(url.IP +'reporte-morales/')
            .then(function (request) {
              if(request.status === 200) {
                 exportFactory.excel(request.data, 'ContratantesMorales');
              }

            })
            .catch(function (e) {
              console.log('e', e);
            });
          }
          if(type_person == 3) { // naturales seeker
            $http({
              method: 'GET',
              url: url.IP +'reporte-seekerNaturals/',
              params: data
            })
            .then(function (request) {
              if(request.status === 200) {
                 exportFactory.excel(request.data, 'Contratantes_Naturales');
              }

            })
            .catch(function (e) {
              console.log('e', e);
            });


          }
          if(type_person == 4) { // juridicals seeker

            $http({
              method: 'GET',
              url: url.IP +'reporte-seekerJuridicals/',
              params: data
            })
            .then(function (request) {
              if(request.status === 200) {

                 exportFactory.excel(request.data, 'Contratantes_Morales');
              }

            })
            .catch(function (e) {
              console.log('e', e);
            });


          }

        };

        $scope.filterValue = function($event){
          if(isNaN(String.fromCharCode($event.charCode))){
            $event.preventDefault();
          }
        };

        $rootScope.show_contractor = true;
        $scope.returnToPolicy = function () {
          $rootScope.show_contractor = false;
        };

        // show / hide buttons personaFisica personaMoral
        $scope.showButtonFisica = function() {
            $scope.fisicas = true;
            $scope.morales = false;
            $("#saveButtonMoralModal").css("display", "none");
            $("#saveButtonFisicaModal").css("display", "block");
        }

        $scope.showButtonMoral = function() {
            $scope.fisicas = false;
            $scope.morales = true;
            $("#saveButtonFisicaModal").css("display", "none");
            $("#saveButtonMoralModal").css("display", "block");
        }

        $scope.cancelChanges = function () {
          $rootScope.show_contractor = false;
          // if($("#modalContratate")){
          //   if( $uibModalInstance.dismiss('cancel')){
          //     $timeout(function () {
          //       $("#createOTS").click();
          //         }, 1);
          //   }
          // }
      }

      $scope.selectDate = function (parDate) {
        
      }

      function toDate(dateStr) {

         var dateString = dateStr; // Oct 23
         var dateParts = dateString.split("/");
         var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

         return dateObject;

      }

     function convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');

        return date;
      }

      function mesDiaAnio (parDate) {

        var d = new Date(toDate(parDate));
        var date = (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
        return date;
      }

      // TEST pagination contrantes
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

        // $scope.selectPage = function (parPage) {
        //   vm.Consultar($scope.order, parPage);
        // };

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
          vm.Consultar($scope.order, parPage);
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


        function getContratantesPag(parUrl) {
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
      //Pagination----

      // configuración del datepicker
      $('.datepicker-me input').datepicker();

      $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
      $.fn.datepicker.defaults.startView = 0;
      $.fn.datepicker.defaults.autoclose = true;
      $.fn.datepicker.defaults.language = 'es';
      //-- Peticion de persistencia--//

      var json_data = {};
      var form = document.getElementsByTagName("form");
      var elementos ={};
      //Valores reutilizables
      var interval,interval1, dt, valor;
      var count = 0;

      function set_dataForm(json){
        PersistenceFactory.set_inputs(json);        
        if(json['vm.form.first_name']!= ""){
          vm.form.first_name = json['vm.form.first_name'];
        }
        if(json['vm.form.last_name']!= ""){
          vm.form.last_name = json['vm.form.last_name'];
        }
        if(json['vm.form.second_last_name']!= ""){
          vm.form.second_last_name = json['vm.form.second_last_name'];
        }
        if(json['vm.form.rfc']!= ""){
          vm.form.rfc = json['vm.form.rfc'];
        }
        if(json['vm.form.birthday']!= ""){
          vm.form.birthday = json['vm.form.birthday'];
        }
        if(json['vm.form.sex']!= ""){
          vm.form.sex = json['vm.form.sex'];
        }
        if(json['vm.form.emailMain'] != ''){
          vm.form.emailMain = json['vm.form.emailMain']
        }
        if(json['inputValue'][0] != ''){
          vm.form.phoneMain = json['inputValue'][0].valor
        }
        if(json['vm.form.group'] != ""){
          valor = PersistenceFactory.find_index(vm.groups, json['vm.form.group'][0].valor, 'url');
          vm.form.group = vm.groups[valor]
        }
        //vm.address_type
        if(json['address.tipo']){
          if(json['address.tipo'][0].valor != ''){
            valor = PersistenceFactory.find_index(vm.address_type, json['address.tipo'][0].valor, 'name');
            vm.form.userAddresses[0].tipo = vm.address_type[valor]
          }
          if(json['address.tipo'][1].valor != ''){
            valor = PersistenceFactory.find_index(vm.address_type, json['address.tipo'][1].valor, 'name');
            vm.juridicalForm.userAddresses[0].tipo = vm.address_type[valor]
          }
        }
        if(json['address.administrative_area_level_1']){

          if(json['address.administrative_area_level_1'][0].valor != ''){
            valor = PersistenceFactory.find_index(vm.statesArray, json['address.administrative_area_level_1'][0].valor, 'url');
            vm.form.userAddresses[0].administrative_area_level_1 = vm.statesArray[valor]

            if(json['address.administrative_area_level_2'][0].valor != ''){
              valor = PersistenceFactory.find_index(vm.form.userAddresses[0].administrative_area_level_1.cities, json['address.administrative_area_level_2'][0].valor, 'url');
              vm.form.userAddresses[0].administrative_area_level_2 = vm.form.userAddresses[0].administrative_area_level_1.cities[valor]
            }
          }
          //Falta segundo vm.juridicalForm
          if(json['address.administrative_area_level_1'][1].valor != ''){
            valor = PersistenceFactory.find_index(vm.statesArray, json['address.administrative_area_level_1'][1].valor, 'url');
            vm.juridicalForm.userAddresses[0].administrative_area_level_1 = vm.statesArray[valor]

            if(json['address.administrative_area_level_2'][1].valor != ''){
            console.log(vm.juridicalForm.userAddresses)
              valor = PersistenceFactory.find_index(vm.juridicalForm.userAddresses[0].administrative_area_level_1.cities, json['address.administrative_area_level_2'][1].valor, 'url');
              vm.juridicalForm.userAddresses[0].administrative_area_level_2 = vm.juridicalForm.userAddresses[0].administrative_area_level_1.cities[valor]
            }/**/
          }

        }

        if(json['address.route']){

          if(json['address.route'][0].valor != 'text'){
            vm.form.userAddresses[0].route = json['address.route'][0].valor
          }
          if(json['address.route'][1].valor != 'text'){
            vm.juridicalForm.userAddresses[0].route = json['address.route'][1].valor
          }

        }
        if(json['address.street_number']){

          if(json['address.street_number'][0].valor != 'text'){
            vm.form.userAddresses[0].street_number = json['address.street_number'][0].valor
          }
          if(json['address.street_number'][1].valor != 'text'){
            vm.juridicalForm.userAddresses[0].street_number = json['address.street_number'][1].valor
          }
        }
        if(json['address.street_number_int']){

          if(json['address.street_number_int'][0].valor != 'text'){
            vm.form.userAddresses[0].street_number_int = json['address.street_number_int'][0].valor
          }
          if(json['address.street_number_int'][1].valor != 'text'){
            vm.juridicalForm.userAddresses[0].street_number_int = json['address.street_number_int'][1].valor
          }

        }
        if(json['address.sublocality']){

          if(json['address.sublocality'][0].valor != 'text'){
            vm.form.userAddresses[0].sublocality = json['address.sublocality'][0].valor
          }
          if(json['address.sublocality'][1].valor != 'text'){
            vm.juridicalForm.userAddresses[0].sublocality = json['address.sublocality'][1].valor
          }

        }
        if(json['address.postal_code']){

          if(json['address.postal_code'][0].valor != 'text'){
            vm.form.userAddresses[0].postal_code = json['address.postal_code'][0].valor
          }
          if(json['address.postal_code'][1].valor != 'text'){
            vm.juridicalForm.userAddresses[0].postal_code = json['address.postal_code'][1].valor
          }

        }
        if(json['address.details']){

          if(json['address.details'][0].valor != 'text'){
            vm.form.userAddresses[0].details = json['address.details'][0].valor
          }
          if(json['address.details'][1].valor != 'text'){
            vm.juridicalForm.userAddresses[0].details = json['address.details'][1].valor
          }

        }
        if(json['vm.form.responsable'][0].valor!= ""){
          valor = PersistenceFactory.find_index(vm.statesArray, json['vm.form.responsable'][0].valor, 'url');
          vm.form.responsable = vm.responsables[valor];
        }
        if(json['vm.form.responsable'][1].valor!= ""){
          valor = PersistenceFactory.find_index(vm.statesArray, json['vm.form.responsable'][1].valor, 'url');
          vm.juridicalForm.responsable = vm.responsables[valor];
        }
        if(json['listaD.value']){
          
        }
        //Morales
        if(json['vm.juridicalForm.j_name'] != '' && json['vm.juridicalForm.j_name'] != 'text'){
          vm.juridicalForm.j_name = json['vm.juridicalForm.j_name']
        }
        if(json['vm.juridicalForm.date_of_establishment']!= "" && json['vm.juridicalForm.date_of_establishment']!= "text"){
          vm.juridicalForm.date_of_establishment = json['vm.juridicalForm.date_of_establishment'];
        }
        if(json['vm.juridicalForm.rfc']!= "" && json['vm.juridicalForm.date_of_establishment']!= "text"){
          vm.juridicalForm.rfc = json['vm.juridicalForm.rfc']
        }
        if(json['vm.juridicalForm.emailMain']!= "" && json['vm.juridicalForm.emailMain']!= "text" ){
          vm.juridicalForm.emailMain = json['vm.juridicalForm.emailMain']
        }
        if(json['vm.juridicalForm.description']!= "" && json['vm.juridicalForm.description']!= "text"){
          vm.juridicalForm.description = json['vm.juridicalForm.description']
        }
        if(json['inputValue'][4] != '' != "" && json['inputValue'][4]!= "text"){
          vm.juridicalForm.phoneMain = json['inputValue'][4].valor
        }

        valor = angular.element('[ng-model="inputValue"]');
        angular.forEach(valor,function(v,a){
            if(a == 3 || a == 7){
              v.value = '';
            }
        })
        valor = angular.element('[ng-model="item.correo"]');
        angular.forEach(valor,function(v,a){
          v.value = '';
        })
        valor = angular.element('[ng-model="listaD.value"]');
        angular.forEach(valor,function(v,a){
           valor[a].checked = false;
           valor[a].setAttribute('aria-checked', 'false');
        })
      }

      interval = setInterval(function(){
        if(form != undefined && PersistenceFactory.count == 0){//&& PersistenceFactory.count == 0
          PersistenceFactory.inicial(vm.user.org,'Contratantes',vm.user.nameFull,PersistenceFactory.get_dataForm(form));
        }
        if(PersistenceFactory.init_return != ''){
          clearInterval(interval);
          if(PersistenceFactory.init_return.status == 'data_view' ){
            set_dataForm(PersistenceFactory.json_return);
          }
          PersistenceFactory.interval = setInterval(function(){
            PersistenceFactory.editado(PersistenceFactory.get_dataForm(form));
          }, PersistenceFactory.intervalTime);/* /* */
        }
      }, 2000);
      //-- End Peticion de persistencia--//

      $scope.matchesContractors = function(parWord){
        if(parWord) {
          if(parWord.length >= 3) {
            $scope.show_contratante = 'contractors-match/';
            $http.post(url.IP + $scope.show_contratante, 
            {
              'matchWord': parWord,
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

      $scope.$watch("vm.contratante.value",function(newValue, oldValue){
        if(vm.contratante){
          if(vm.contratante.value.address_contractor){
            if(vm.contratante.value.address_contractor){
              $scope.bound_solidarity = vm.contratante.value.url;
              $scope.has_solidario = true;
            }
          }
        }
      });

    }
})();

function closeContr() {
    $("#closeModalContr").click();
    $("#createOTS").click();
}

function saveContrFisica() {
    $("#saveButtonFisica").click(); 
}

function saveContrMoral() {
    $("#saveButtonMoral").click();
}


// function showButtonFisica() {
//     // $scope.fisicas = true;
//     // $scope.morales = false;
//     $("#saveButtonMoralModal").css("display", "none");
//     $("#saveButtonFisicaModal").css("display", "block");
// }
//
// function showButtonMoral() {
//     // $scope.fisicas = false;
//     // $scope.morales = true;
//
//     $("#saveButtonFisicaModal").css("display", "none");
//     $("#saveButtonMoralModal").css("display", "block");
// }
