(function() {
    'use strict';

    angular.module('inspinia')
        .controller('PolizasPlantillasCtrl', PolizasPlantillasCtrl);

    PolizasPlantillasCtrl.$inject = ['$timeout','$scope', '$sce', 'dataFactory', '$http', 'providerService', 'SweetAlert', 'MESSAGES', 'url','$sessionStorage','$uibModal','textAngularManager','FileUploader','$rootScope'];

    function PolizasPlantillasCtrl($timeout,$scope, $sce, dataFactory, $http, providerService, SweetAlert, MESSAGES, url,$sessionStorage,$uibModal,textAngularManager,FileUploader,$rootScope) {
      var vm = this;
      $scope.showQuotation = false;
      $scope.showInfoQuotation = false;
      $scope.showEditInformation = false;
      $scope.plantilla = {};
      $scope.savingPlantilla = false;
      var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
      var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
      var usr = JSON.parse(decryptedUser);
      var token = JSON.parse(decryptedToken);
      $scope.configuracionGlobal={
        fecha_limite_email:false
      }
      $('.js-example-basic-multiple').select2();
      /* Información de usuario */
      $scope.infoUser = $sessionStorage.infoUser;

      $scope.allRamos = [];
      $scope.allRamos = [
        {
            'code': 1,
            'descr': 'Vida'
        },
        {
            'code': 2,
            'descr': 'Accidentes y Enfermedades'
        },
        {
            'code': 3,
            'descr': 'Daños'
        },
        {
            'code': 9,
            'descr': 'Daños/Automóviles'
        },
      ]
      $scope.createQuotation = function(){
        $scope.plantilla = {};
        $scope.showEditInformation = false;
        $scope.showQuotation = true;
        $scope.plantilla.subject_default=false;
      };
      $scope.subject_default=false;
      $scope.closeTemplate = function(){
        $scope.showQuotation = false;
        $scope.plantilla = {};
      };
      $scope.isReadOnly=true;
      activate();

      $scope.cambiarCampos= function(){
        $scope.configuracionGlobal  = {};
        dataFactory.get('orginfo/')
        .then(function success(response) {
            if(response.data.results.length){
              $scope.configuracionGlobal = response.data.results[0];
            }
        })
        $scope.configurar = !$scope.configurar;
      }
      $scope.cambiarDato = function(dato, valor){
        var data = {};
        data[dato.toString()] = valor;
        if($scope.configuracionGlobal){
          if($scope.configuracionGlobal.url){
            $http.patch($scope.configuracionGlobal.url, data)
            .then(function success(response) {
                if(response.status == 200){              
                  $scope.configuracionGlobal = response.data;
                  SweetAlert.swal("Actualizado", MESSAGES.OK.SAVEDCONFIG, "success");
                  return;
                }
                else if(response.status == 403) {
                  SweetAlert.swal("Error", response.data.detail, "error");
                }
                else {
                  SweetAlert.swal("Error", MESSAGES.ERROR.GRALERROR, "error");
                }
            })
          }else {
            dataFactory.post('orginfo/',data)
            .then(function success(response) {
                if(response.status == 201){
                  $scope.configuracionGlobal = response.data;
                  SweetAlert.swal("Guardado", MESSAGES.OK.SAVEDCONFIG, "success");
                  return;
                }
                else if(response.status == 403) {
                  SweetAlert.swal("Error", response.data.detail, "error");
                }
                else {
                  SweetAlert.swal("Error", MESSAGES.ERROR.GRALERROR, "error");
                }
            })
          } 
        }
      }
      function activate(){
        dataFactory.get('emailtemplate/',{'template_model':2})
        .then(function success(response) {
            vm.quotations = response.data.results;
            vm.config_pagination =response.data;
            $scope.show_pagination = true;
        })
        dataFactory.get('orginfo/')
        .then(function success(response) {
            if(response.data.results.length){
              $scope.configuracionGlobal = response.data.results[0];
            }
        })
      };

      $scope.selectProv = function(sel){
        $scope.ramos_code = [];
        $scope.plantilla.ramo_code.forEach(function(cl) {
          $scope.ramos_code.push(parseInt(cl.code))
        }) 
      };

      function isBlankText(html) {
        if (!html) {
          return true;
        }
        var stripped = html.replace(/<[^>]+>/g, '');
        stripped = stripped.replace(/&nbsp;/g, '');
        stripped = stripped.replace(/\s/g, '');
        return stripped.length === 0;
      }

      $scope.showInformation = function(item){
        if(item){
          $scope.showInfoQuotation = !$scope.showInfoQuotation;
          $scope.quotation = item;
        } else {
          $scope.showInfoQuotation = !$scope.showInfoQuotation;
        }
      };

      $scope.saveDelivery = function(form) {
        if ($scope.savingPlantilla) {
          return;
        }

        if (!form || !form.name || !form.ramo_code || !form.ramo_code.length || !form.text || !form.bottom_text || !$scope.ramos_code || !$scope.ramos_code.length || (!form.subject_default && !form.title)) {
          SweetAlert.swal("Error", "Completa todos los campos obligatorios antes de continuar.", "warning");
          return;
        }

        if (isBlankText(form.text) || isBlankText(form.bottom_text)) {
          SweetAlert.swal("Error", "El texto superior e inferior no pueden estar vacíos.", "warning");
          return;
        }

        form.template_model = 2;
        form.ramo_code = $scope.ramos_code;
        $scope.savingPlantilla = true;

        dataFactory.post('emailtemplate/', form)
        .then(function success(response) {
          SweetAlert.swal("¡Listo!", "Plantilla guardada correctamente.", "success");
          $scope.closeTemplate();
          activate();
        })
        .catch(function() {
          SweetAlert.swal("Error", MESSAGES.ERROR.GRALERROR, "error");
        })
        .finally(function() {
          $scope.savingPlantilla = false;
        });
      };
      $scope.cahngeFechaLimiteEmail= function(val) {
        if($scope.configuracionGlobal){
          if($scope.configuracionGlobal.url){
            $http.patch($scope.configuracionGlobal.url, {'fecha_limite_email':$scope.configuracionGlobal.fecha_limite_email})
            .then(function success(response) {
                if(response.status == 200){              
                  $scope.configuracionGlobal = response.data;
                  SweetAlert.swal("Actualizado", MESSAGES.OK.SAVEDCONFIG, "success");
                  return;
                }
                else if(response.status == 403) {
                  SweetAlert.swal("Error", response.data.detail, "error");
                }
                else {
                  SweetAlert.swal("Error", MESSAGES.ERROR.GRALERROR, "error");
                }
            })
          }  
          else {
            dataFactory.post('orginfo/', {'fecha_limite_email':$scope.configuracionGlobal.fecha_limite_email})
            .then(function success(response) {
                if(response.status == 201){
                  $scope.configuracionGlobal = response.data;
                  SweetAlert.swal("Guardado", MESSAGES.OK.SAVEDCONFIG, "success");
                  return;
                }
                else if(response.status == 403) {
                  SweetAlert.swal("Error", response.data.detail, "error");
                }
                else {
                  SweetAlert.swal("Error", MESSAGES.ERROR.GRALERROR, "error");
                }
            })
          } 
        }
      }
      $scope.updateDelivery = function(form) {
        if ($scope.savingPlantilla) {
          return;
        }

        if (!form || !form.name || !form.text || !form.bottom_text || (!form.ramo_code || !form.ramo_code.length) || !$scope.ramos_code || !$scope.ramos_code.length || (!form.subject_default && !form.title)) {
          SweetAlert.swal("Error", "Completa todos los campos obligatorios antes de actualizar.", "warning");
          return;
        }

        if (isBlankText(form.text) || isBlankText(form.bottom_text)) {
          SweetAlert.swal("Error", "El texto superior e inferior no pueden estar vacíos.", "warning");
          return;
        }

        $scope.savingPlantilla = true;

        var data = {
          name: form.name,
          title: form.title,
          text: form.text,
          bottom_text: form.bottom_text,
          subject_default: form.subject_default,
          ramo_code: $scope.ramos_code
        }
        $http.patch(form.url, data)
        .then(function success(response) {
          $scope.showEditInformation = false;
          SweetAlert.swal("¡Listo!", "Plantilla actualizada correctamente.", "success");
          $scope.closeTemplate();
          activate();
        })
        .catch(function() {
          SweetAlert.swal("Error", MESSAGES.ERROR.GRALERROR, "error");
        })
        .finally(function() {
          $scope.savingPlantilla = false;
        });
      };

      $scope.borrarPlantilla = function(item) {
        if (!item || !item.url) {
          return;
        }
        SweetAlert.swal({
          title: "¿Confirmas la eliminación?",
          text: "La plantilla se eliminará permanentemente.",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Sí, borrar",
          cancelButtonText: "Cancelar"
        }, function(isConfirm) {
          if (!isConfirm) {
            return;
          }
          $http.delete(item.url)
          .then(function success() {
            SweetAlert.swal("¡Listo!", "Plantilla eliminada correctamente.", "success");
            activate();
          })
          .catch(function() {
            SweetAlert.swal("Error", MESSAGES.ERROR.GRALERROR, "error");
          });
        });
      };

      $scope.editQuatation = function(form){
        $scope.ramos_code = [];
        $scope.plantilla.name = form.name;
        $scope.plantilla.title = form.title;
        $scope.plantilla.text = form.text;
        $scope.plantilla.bottom_text = form.bottom_text;
        $scope.plantilla.url = form.url;
        $scope.plantilla.ramo_code= [];
        $scope.plantilla.subject_default = form.subject_default;
        $scope.showQuotation = true;
        $scope.showEditInformation = true;
        if(form.ramo_code){
          var convertedCodes= form.ramo_code.map(function(code) {
            return parseInt(code); 
          });
          // $scope.plantilla.ramo_code = form.ramo_code;
          convertedCodes.forEach(function(cl) {
            $scope.ramos_code.push(parseInt(cl))
              $scope.allRamos.forEach(function(cd) {
                if(parseInt(cd.code) ==cl){
                  $scope.plantilla.ramo_code.push(cd)
                }
              });
          }) 
          $timeout(function() {
            $('#ramoSelect').select2();
          }, 0);
        }
      };
      $scope.$watch('plantilla.ramo_code', function(newValues, oldValues) {
        if (newValues !== oldValues) {
          $timeout(function() {
              $('#ramoSelect').trigger('change');
          }, 0);
        }
      });
      $scope.focusEditor = function() {
        $scope.editor_focus = true;
      };

      $scope.unfocusEditor = function() {
      };

      $scope.getFile = function() {
        var editor = textAngularManager.retrieveEditor('myEditorCreate').scope;
        editor.displayElements.text.trigger('focus');

        var modalInstance = $uibModal.open({
          template: '<label class="col-xs-12 btn btn-info">Agregar Imagen desde PC'+
                      '<input multiple nv-file-select="" type="file" name="xyz" uploader="uploader" accept=".jpg" class="display-none"/>'+
                    '</label>',
          // size: 'sm',
          controller: ModalInstanceFileCtrl,
          resolve: {
          from: function(){
              return null;
            }
          },
          backdrop: 'static', /* this prevent user interaction with the background */
          keyboard: false
        });

        modalInstance.result.then(function(imgUrl) {
            var imageLink;
            imageLink = $rootScope.image_url;
            var embed = '<img src="' + imageLink + ' ">';
            // return textAngular.$editor().wrapSelection('insertHTML', embed, true);

            var editor = textAngularManager.retrieveEditor('myEditorCreate');
            editor.scope.wrapSelection('insertHTML', embed, true);
        });
      };      
      function ModalInstanceFileCtrl($scope, $rootScope, $uibModalInstance) {
        $scope.userInfo = {
          id: 0
        };
        var uploader = $scope.uploader = new FileUploader({
          headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
          allowedFileType:["png","jpg","jpeg"]
        });

        $scope.userInfo.url = $scope.uploader.url = url.IP + 'plantillas-html/';
        $scope.uploader.autoUpload = true;
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          $rootScope.image_url = response.arch;
          if($uibModalInstance){
              $uibModalInstance.close();
          }
        };
        // ALERTA ERROR UPLOADFILES
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORONUPLOADFILES ,"error");
        };
        uploader.onAfterAddingFile = function(fileItem) {
          fileItem.formData.push({
              arch: fileItem._file
          });
        };
        uploader.onBeforeUploadItem = function(item) {
          item.url = $scope.userInfo.url;
          item.formData[0].nombre = item.file.name;
          item.alias = '';
          item.formData[0].owner = usr.org
        };
        $scope.validateFiles = function() {
          var input = document.getElementById('fileInput');
          var files = input.files;
          var totalSize = 0;
          var errorMessageElement = document.getElementById('error-message');
          for (var i = 0; i < files.length; i++) {
            totalSize += files[i].size;
          }
          var totalSizeMB = totalSize / (1024 * 1024);
          if (totalSizeMB > 25) {
              errorMessageElement.style.display = 'block';
              errorMessageElement.textContent = 'La suma de los archivos seleccionados excede los 25 MB. Por favor, selecciona menos archivos o archivos más pequeños.';
          } else {
              errorMessageElement.style.display = 'none'; // Hide error message if files are valid
          }
        };
        function uploadFiles() {
          $scope.userInfo.url = $scope.uploader.url = url.IP + 'plantillas-html/';
          $scope.files = [];

          $timeout(function() {
            $scope.uploader.uploadAll();
          }, 1000);
        };
      }
    }

  })();
