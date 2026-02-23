(function() {
    'use strict';

    angular.module('inspinia')
        .controller('IbisFormatosPlantillasSiniestrosCtrl', IbisFormatosPlantillasSiniestrosCtrl);

    IbisFormatosPlantillasSiniestrosCtrl.$inject = ['$scope', '$parse', '$sce', 'dataFactory', '$http', 'providerService', 'SweetAlert', 'MESSAGES', 'url', 'PersistenceFactory', '$sessionStorage'];

    function IbisFormatosPlantillasSiniestrosCtrl($scope, $parse, $sce, dataFactory, $http, providerService, SweetAlert, MESSAGES, url, PersistenceFactory, $sessionStorage) {

      $scope.showPlantilla = false;
      $scope.showInfoPlantilla = false;
      $scope.showEditInformation = false;
      $scope.plantilla = {};
      $scope.savingPlantilla = false;

      /* Información de usuario */
      $scope.infoUser = $sessionStorage.infoUser;

      $scope.createQuotation = function(){
        $scope.showPlantilla = true;
        $scope.showEditInformation = false;
        $scope.plantilla = {};
      };

      $scope.closeQuotation = function(){
        $scope.showEditInformation = false;
        $scope.showPlantilla = false;
        $scope.plantilla = {};
      };
      var vm = this;

      function isBlankText(value) {
        if (!value) {
          return true;
        }
        var cleaned = value.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '').replace(/\s/g, '');
        return cleaned.length === 0;
      }

      activate();
      $scope.page = 1;
      function activate(page){
        $scope.page = page ? page : 1;
        $scope.actual_page = $scope.page;

        $scope.filtros = { page: $scope.page, type_message: 3 };

        $http({
          method: 'GET',
          url: url.IP + 'whatsappwebtemplate/',
          params: $scope.filtros   // ✅ aquí va en GET
        })
          .then(function success(response) {
           var payload = response.data || [];
           if (payload && payload.results && Array.isArray(payload.results)) {
             vm.templatesList = payload.results;
           } else if (Array.isArray(payload)) {
             vm.templatesList = payload;
           } else {
             vm.templatesList = [];
           }

          vm.templates = {
            count: response.data.count,
            previous: response.data.previous,
            next: response.data.next
          };

          $scope.showTemplates = !!vm.templatesList && vm.templatesList.length > 0;

          testPagination('vm.templates', 'vm.templates');
        });
      }

      $scope.selectProv = function(sel){
        $scope.aseguradoras = sel;
      };

      $scope.showInformation = function(item){
        if(item){
          $scope.showInfoPlantilla = !$scope.showInfoPlantilla;
          $scope.plantilla = item;
        } else {
          $scope.showInfoPlantilla = !$scope.showInfoPlantilla;
        }
      };

      $scope.saveDelivery = function(form) {
        if ($scope.savingPlantilla) {
          return;
        }

        if (!form || !form.title || !form.text) {
          SweetAlert.swal('Error', 'Completa todos los campos obligatorios antes de continuar.', 'warning');
          return;
        }

        if (isBlankText(form.title) || isBlankText(form.text)) {
          SweetAlert.swal('Error', 'El identificador y el mensaje no pueden estar vacíos.', 'warning');
          return;
        }

        form.type_message = 3;
        $scope.savingPlantilla = true;

        dataFactory.post('whatsappwebtemplate/', form)
        .then(function success(response) {
          SweetAlert.swal('¡Listo!', 'Plantilla guardada correctamente.', 'success');
          $scope.closeQuotation();
          activate(1);
        })
        .catch(function() {
          SweetAlert.swal('Error', MESSAGES.ERROR.GRALERROR, 'error');
        })
        .finally(function() {
          $scope.savingPlantilla = false;
        });
      };

      $scope.updateDelivery = function(form) {
        if ($scope.savingPlantilla) {
          return;
        }

        if (!form || !form.title || !form.text) {
          SweetAlert.swal('Error', 'Completa todos los campos obligatorios antes de actualizar.', 'warning');
          return;
        }

        if (isBlankText(form.title) || isBlankText(form.text)) {
          SweetAlert.swal('Error', 'El identificador y el mensaje no pueden estar vacíos.', 'warning');
          return;
        }

        $scope.savingPlantilla = true;

        var data = {
          title: form.title,
          text: form.text
        };
        $http.patch(form.url, data)
        .then(function success(response) {
          $scope.showEditInformation = false;

          SweetAlert.swal('¡Listo!', 'Plantilla actualizada correctamente.', 'success');
          $scope.closeQuotation();
          activate(1);
        })
        .catch(function() {
          SweetAlert.swal('Error', MESSAGES.ERROR.GRALERROR, 'error');
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
          title: '¿Confirmas la eliminación?',
          text: 'La plantilla se eliminará permanentemente.',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#DD6B55',
          confirmButtonText: 'Sí, borrar',
          cancelButtonText: 'Cancelar'
        }, function(isConfirm) {
          if (!isConfirm) {
            return;
          }
          $http.delete(item.url)
          .then(function success() {
            SweetAlert.swal('¡Listo!', 'Plantilla eliminada correctamente.', 'success');
            activate(1);
          })
          .catch(function() {
            SweetAlert.swal('Error', MESSAGES.ERROR.GRALERROR, 'error');
          });
        });
      };

      $scope.editQuatation = function(form){
        $scope.plantilla.title = form.title;
        $scope.plantilla.text = form.text;
        $scope.plantilla.url = form.url;
        $scope.showPlantilla = true;
        $scope.showEditInformation = true;
      };

    // -----------PAGINACIÓN
    function testPagination(parModel, parConfig) {
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
      // $scope.actual_page = 1;
      $scope.not_prev = true;

      for (var i = 0; i < pages; i++) {
        $scope.totalPages.push(i+1);
      }

      $scope.lastPageP = function() {
        // TODO: ultimo bloque
        if($scope.totalPages.length > 5) {
          $scope.end = $scope.totalPages.length;
          $scope.start = ($scope.totalPages.length) -5;
          $scope.show_prev_block = true;
        }
        $scope.selectPage($scope.totalPages.length);
      };

      $scope.selectPage = function (parPage) {
        $scope.actual_page = parPage;
        activate(parPage);
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
      };

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

        };
      }

    }

})();
