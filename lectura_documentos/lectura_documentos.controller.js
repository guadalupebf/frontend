(function() {
    'use strict';

    angular.module('inspinia')
        .controller('LecturaDocumentosController', LecturaDocumentosController);

    LecturaDocumentosController.$inject = ['$state','$scope', 'dataFactory', 'datesFactory', '$http', 'providerService', 'SweetAlert', 'MESSAGES','url','exportFactory'];

    function LecturaDocumentosController($state, $scope, dataFactory, datesFactory, $http, providerService, SweetAlert, MESSAGES,url, exportFactory) {
      
      var vm = this;
      $scope.showQuotation = false;
      $scope.showInfoQuotation = false;
      vm.lecturas = [];

      activate();

      function activate(){
        $http.get(url.IP + 'lectura-archivos/').then(function(response){
          vm.lecturas = response.data;
          vm.lecturas = vm.lecturas.map(function(item){
            item['selected'] = false;
            return item;
          })
        })
      }

      $scope.eliminar = function(){
        SweetAlert.swal({
          title: '¿Está seguro?',
          text: "No será posible recuperar este registro",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Si, estoy seguro.",
          cancelButtonText: "Cancelar",
          closeOnConfirm: true
        },
        function(isConfirm) {
          if (isConfirm) {
            var l = Ladda.create( document.querySelector( '.ladda-button2' ) );     
            l.start(); 
            vm.lecturas.forEach(function(lectura, index){
              if(lectura.selected){
                $http.delete(lectura.url).then(function(){
                  vm.lecturas.splice(index,1);
                  // SweetAlert.swal("¡Eliminado!", "El registro fue eliminado.", "success");
                  l.stop();
                });
              }
            });
          }
        });
      }

      $scope.quotationNew = [{
        'contratante': {}
      }];

      $scope.createQuotation = function(){
        $scope.showQuotation = true;
      };

      $scope.closeQuotation = function(){
        $scope.showQuotation = false;
        vm.form = [{
        }];
      };

      $scope.edit = function(){
        var l = Ladda.create( document.querySelector( '.ladda-button2' ) );     
        l.start(); 
        $state.go('config.edit_lectura_documentos',{'id':0});
        l.stop();
      }

      $scope.open = function(lectura){
        $state.go('config.edit_lectura_documentos',{'id':lectura.id});
      }

     
     
    }
})();