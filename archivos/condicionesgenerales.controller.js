(function(){
  'use strict';

  angular.module('inspinia')
    .controller('CondicionesGralesCtrl', CondicionesGralesCtrl);

  CondicionesGralesCtrl.$inject = ['providerService', '$uibModal', '$timeout', 'toaster', '$http', 'url', 'CondicionesGeneralesService','SweetAlert'];

  function CondicionesGralesCtrl(providerService, $uibModal, $timeout, toaster, $http, url, CondicionesGeneralesService,SweetAlert){
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
        if(list[i].id === id) return list[i].alias;
      }
      return '';
    }

    var t = null;
    function debouncedLoad(){
      if(t) $timeout.cancel(t);
      t = $timeout(vm.load, 300);
    }

    function load(getSubramos){
      vm.loading = true;
      if(getSubramos && vm.filters.aseguradora){
        vm.subramos=[];
        $http.post(url.IP + 'subramos-todos-or-provider/',{'provider':vm.filters.aseguradora}).then(function(subramo){
          vm.subramos = subramo.data || [];
        });
      }
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

    // function remove(item){
    //   if(!confirm('¿Eliminar esta condición general?')) return;
    //   CondicionesGeneralesService.remove(item.id)
    //     .then(function(){
    //       toaster.success('Condición general eliminada');
    //       vm.load();
    //     })
    //     .catch(function(){
    //       toaster.error('No se pudo eliminar la condición general');
    //     });
    // }
    function remove(item){

      CondicionesGeneralesService.usage(item.id)
        .then(function(res){
          var count = (res.data && res.data.policies_count) ? res.data.policies_count : 0;

          if(count > 0){
            SweetAlert.swal(
              'No se puede eliminar',
              'Esta condición está asociada a ' + count + ' póliza(s).',
              'warning'
            );
            return;
          }

          // SweetAlert v1 usa callback, NO .then()
          SweetAlert.swal({
            title: 'Eliminar condición general',
            text: '¿Seguro que deseas eliminar "' + (item.nombre || '') + '"?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            closeOnConfirm: true
          }, function(isConfirm){
            if(!isConfirm) return;

            CondicionesGeneralesService.remove(item.id)
              .then(function(){
                toaster.success('Condición general eliminada');
                vm.load();
              })
              .catch(function(){
                toaster.error('No se pudo eliminar la condición general');
              });
          });
        })
        .catch(function(){
          toaster.error('No se pudo validar si está asociada a pólizas');
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
