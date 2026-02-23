(function(){
  'use strict';

  angular.module('inspinia')
    .controller('CondicionesGeneralesModalCtrl', CondicionesGeneralesModalCtrl)

  CondicionesGeneralesModalCtrl.$inject = ['$uibModalInstance','providerService','$uibModal','$scope', 'FileUploader', '$timeout', 'toaster', 'MESSAGES', '$sessionStorage', '$http', 'url', '$state', 'SweetAlert', '$stateParams','dataFactory'];

  function CondicionesGeneralesModalCtrl($uibModalInstance, toastr, CondicionesGeneralesService, item, aseguradoras, subramos){
    var md = this;

    md.item = item;
    md.aseguradoras = aseguradoras || [];
    md.subramos = subramos || [];
    md.saving = false;

    md.form = item ? {
      id: item.id,
      nombre: item.nombre,
      tipo: item.tipo || 'CONDICIONES',
      aseguradora: item.aseguradora,
      subramo: item.subramo
    } : {
      nombre: '',
      tipo: 'CONDICIONES',
      aseguradora: '',
      subramo: ''
    };

    md.file = null;

    md.save = function(){
      if(!md.form.nombre || !md.form.aseguradora || !md.form.subramo){
        toastr.warning('Completa nombre, aseguradora y subramo');
        return;
      }

      md.saving = true;

      // Crear (multipart con PDF)
      if(!md.item){
        if(!md.file){
          toastr.warning('Selecciona el PDF');
          md.saving = false;
          return;
        }

        var fd = new FormData();
        fd.append('nombre', md.form.nombre);
        fd.append('tipo', md.form.tipo);
        fd.append('aseguradora', md.form.aseguradora);
        fd.append('subramo', md.form.subramo);
        fd.append('arch', md.file);

        CondicionesGeneralesService.create(fd)
          .then(function(){
            toastr.success('Condición creada');
            $uibModalInstance.close(true);
          })
          .catch(function(){
            toastr.error('No se pudo crear');
          })
          .finally(function(){
            md.saving = false;
          });

      } else {
        // Editar metadata (sin cambiar PDF)
        CondicionesGeneralesService.update(md.form.id, {
          nombre: md.form.nombre,
          tipo: md.form.tipo,
          aseguradora: md.form.aseguradora,
          subramo: md.form.subramo
        }).then(function(){
          toastr.success('Actualizado');
          $uibModalInstance.close(true);
        }).catch(function(){
          toastr.error('No se pudo actualizar');
        }).finally(function(){
          md.saving = false;
        });
      }
    };

    md.cancel = function(){ $uibModalInstance.dismiss(); };
};  
})();