(function(){
  'use strict';

  angular.module('inspinia')
    .controller('CondicionesGralesCtrl', CondicionesGralesCtrl)

  CondicionesGralesCtrl.$inject = ['providerService','$uibModal','$scope', 'FileUploader', '$timeout', 'toaster', 'MESSAGES', '$sessionStorage', '$http', 'url', '$state', 'SweetAlert', '$stateParams','dataFactory'];

  function CondicionesGralesCtrl(providerService,$uibModal, $scope, FileUploader, $timeout, toaster, MESSAGES, $sessionStorage, $http, url, $state, SweetAlert, $stateParams,dataFactory){
    var vm = this;

    var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    $scope.orgName = usr.org;

    vm.init = init;
    vm.load = load;
    vm.debouncedLoad = debouncedLoad;
    vm.nameById = nameById;
    vm.openCreate = openCreate;
    vm.openEdit = openEdit;
    vm.remove = remove;
    init();

    vm.filters = { aseguradora: '', subramo: '', q: '' };
    vm.items = [];
    vm.loading = false;

    vm.aseguradoras = [];
    vm.subramos = [];

    function nameById(list, id){
      if(!id) return '';
      for(var i=0; i<list.length; i++){
        if(list[i].id === id) return list[i].nombre;
      }
      return id; // fallback
    };

    var t = null;
    function debouncedLoad(){
      if(t) $timeout.cancel(t);
      t = $timeout(vm.load, 300);
    };

    function load(){
      vm.loading = true;
      // return CondicionesGeneralesService.list(vm.filters)
      //   .then(function(res){
      //     vm.items = res.data.results || res.data;
      //   })
      //   .catch(function(){
      //     toastr.error('No se pudo cargar el listado');
      //   })
      //   .finally(function(){
      //     vm.loading = false;
      //   });
    };

    function openCreate(){
      $uibModal.open({
        templateUrl: 'app/archivos/modal.form.html',
        controller: 'CondicionesGeneralesModalCtrl as md',
        resolve: {
          item: function(){ return null; },
          aseguradoras: function(){ return vm.aseguradoras; },
          subramos: function(){ return vm.subramos; }
        }
      }).result.then(vm.load);
    };

    function openEdit(item){
      $uibModal.open({
        templateUrl: 'app/archivos/modal.form.html',
        controller: 'CondicionesGeneralesModalCtrl as md',
        resolve: {
          item: function(){ return angular.copy(item); },
          aseguradoras: function(){ return vm.aseguradoras; },
          subramos: function(){ return vm.subramos; }
        }
      }).result.then(vm.load);
    };

    function remove(item){
      if(!confirm('¿Eliminar esta condición general?\n\nEsto la desactiva/baja del catálogo.')) return;

      // return CondicionesGeneralesService.remove(item.id)
      //   .then(function(){
      //     toastr.success('Eliminada');
      //     vm.load();
      //   })
      //   .catch(function(){
      //     toastr.error('No se pudo eliminar');
      //   });
    };

    // Cargar catálogos (ajusta a tus endpoints reales)
    function init(){
      var d = new Date();
      var curr_date = d.getDate();
      var curr_month = d.getMonth() + 1; //Months are zero based
      var curr_year = d.getFullYear();
      var date = curr_year + "-" + curr_month + "-" + curr_date;
      providerService.getProviderByKey(date)
      .then(
        function success(data) {
          vm.aseguradoras = data.data;
        },
        function error(err) {
          console.log('error', err);
      });
      
      $http.get(url.IP + 'subramos-todos-or-provider/')
      .then(function(subramo){                    
        vm.subramos = subramo.data;

      });
      load();
    };
  
  };  
})();
