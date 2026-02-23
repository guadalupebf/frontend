(function(){
  'use strict';

  angular.module('inspinia')
    .controller('CondicionesGeneralesModalCtrl', CondicionesGeneralesModalCtrl);

  CondicionesGeneralesModalCtrl.$inject = ['$uibModalInstance', 'toaster', 'CondicionesGeneralesService', 'item', 'aseguradoras', 'subramos'];

  function CondicionesGeneralesModalCtrl($uibModalInstance, toaster, CondicionesGeneralesService, item, aseguradoras, subramos){
    var md = this;

    md.item = item;
    md.aseguradoras = aseguradoras || [];
    md.subramos = subramos || [];
    md.saving = false;

    md.form = item ? {
      id: item.id,
      nombre: item.nombre,
      tipo: item.tipo || 'CONDICIONES',
      aseguradora: item.aseguradora || item.provider,
      subramo: item.subramo
    } : {
      nombre: '',
      tipo: 'CONDICIONES',
      aseguradora: '',
      subramo: ''
    };

    md.file = null;

    md.setFile = function(files) {
      md.file = files && files.length ? files[0] : null;
    };

    md.save = function(){
      if(!md.form.nombre || !md.form.aseguradora || !md.form.subramo){
        toaster.warning('Completa nombre, aseguradora y subramo');
        return;
      }

      md.saving = true;

      if(!md.item){
        if(!md.file){
          toaster.warning('Selecciona el PDF');
          md.saving = false;
          return;
        }

        var fd = new FormData();
        fd.append('nombre', md.form.nombre);
        fd.append('tipo', md.form.tipo);
        fd.append('aseguradora', md.form.aseguradora);
        fd.append('provider', md.form.aseguradora);
        fd.append('subramo', md.form.subramo);
        fd.append('arch', md.file);

        CondicionesGeneralesService.create(fd)
          .then(function(){
            toaster.success('Condición general creada');
            $uibModalInstance.close(true);
          })
          .catch(function(err){
            var msg = (err && err.data && (err.data.detail || err.data.message)) ? (err.data.detail || err.data.message) : 'No se pudo crear la condición general';
            toaster.error(msg);
          })
          .finally(function(){
            md.saving = false;
          });

      } else {
        CondicionesGeneralesService.update(md.form.id, {
          nombre: md.form.nombre,
          tipo: md.form.tipo,
          aseguradora: md.form.aseguradora,
          provider: md.form.aseguradora,
          subramo: md.form.subramo
        }).then(function(){
          toaster.success('Condición general actualizada');
          $uibModalInstance.close(true);
        }).catch(function(err){
          var msg = (err && err.data && (err.data.detail || err.data.message)) ? (err.data.detail || err.data.message) : 'No se pudo actualizar la condición general';
          toaster.error(msg);
        }).finally(function(){
          md.saving = false;
        });
      }
    };

    md.cancel = function(){
      $uibModalInstance.dismiss();
    };
  }
})();
