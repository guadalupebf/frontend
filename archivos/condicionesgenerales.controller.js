(function(){
  'use strict';

  angular.module('inspinia')
    .controller('CondicionesGralesCtrl', CondicionesGralesCtrl);

  CondicionesGralesCtrl.$inject = ['providerService', '$uibModal', '$timeout', 'toaster', '$http', 'url', 'CondicionesGeneralesService'];

  function CondicionesGralesCtrl(providerService, $uibModal, $timeout, toaster, $http, url, CondicionesGeneralesService){
    var vm = this;

    vm.pageTitle = 'Condiciones Generales';
    vm.init = init;
    vm.load = load;
    vm.debouncedLoad = debouncedLoad;
    vm.nameById = nameById;
    vm.openCreate = openCreate;
    vm.openEdit = openEdit;
    vm.remove = remove;

    vm.filters = { aseguradora: '', subramo: '', q: '' };
    vm.items = [];
    vm.loading = false;
    vm.aseguradoras = [];
    vm.subramos = [];

    init();

    function nameById(list, id){
      if(!id) return '';
      for(var i=0; i<list.length; i++){
        if(list[i].id === id) return list[i].nombre;
      }
      return '';
    }

    var t = null;
    function debouncedLoad(){
      if(t) $timeout.cancel(t);
      t = $timeout(vm.load, 300);
    }

    function load(){
      vm.loading = true;
      return CondicionesGeneralesService.list(vm.filters)
        .then(function(res){
          vm.items = res.data.results || res.data || [];
        })
        .catch(function(){
          toaster.error('No se pudo cargar el listado de condiciones generales');
        })
        .finally(function(){
          vm.loading = false;
        });
    }

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
    }

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
    }

    function remove(item){
      if(!confirm('¿Eliminar esta condición general?')) return;
      CondicionesGeneralesService.remove(item.id)
        .then(function(){
          toaster.success('Condición general eliminada');
          vm.load();
        })
        .catch(function(){
          toaster.error('No se pudo eliminar la condición general');
        });
    }

    function init(){
      var d = new Date();
      var date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();

      providerService.getProviderByKey(date).then(function success(data) {
        vm.aseguradoras = data.data || [];
      });

      $http.get(url.IP + 'subramos-todos-or-provider/').then(function(subramo){
        vm.subramos = subramo.data || [];
      });

      load();
    }
  }
})();
