(function(){
  'use strict';
  /* jshint devel: true */

  angular.module('inspinia')
      .controller('AseguradorasSubramoCtrl', AseguradorasSubramoCtrl);

  AseguradorasSubramoCtrl.$inject = ['$state', '$stateParams','$uibModal', 'providerService', 'ramoService', 'contactService', 'toaster'];

  function AseguradorasSubramoCtrl($state, $stateParams, $uibModal, providerService, ramoService, contactService, toaster) {
      var vm = this;
      // vm.openModal = openModal;
      vm.cancel = cancel;
      vm.submit = submit;
      // vm.provider = {};
      vm.ramo = {};
      vm.subramos = [];
      vm.form = {
        subramo_name: 'Subramo 1',
        subramo_code: '123'
      };
      //
      // // //Contacts
      // // vm.deleteContacts = deleteContacts;
      // // vm.addContact = addContact;
      //
      activate();

      function activate(){

          ramoService.getRamo($stateParams)
              .then(function(ramo){
                  vm.ramo = ramo;
                  vm.subramos = ramo.subramo_ramo;
              });
      }
      //
      // function openModal(){
      //     var modalInstance = $uibModal.open({ //jshint ignore:line
      //         templateUrl: 'templates/delete.html',
      //         controller: ModalInstanceCtrl,
      //         //windowClass: 'animated fadeIn'
      //     });
      // }
      //
      // function ModalInstanceCtrl ($scope, $uibModalInstance) {
      //     $scope.name = 'proveedor';
      //     $scope.ok = function () {
      //         return providerService.deleteProvider($stateParams.aseguradoraId)
      //             .then(function(){
      //                 $uibModalInstance.close();
      //                 $state.go('aseguradoras.aseguradoras');
      //             });
      //     };
      //
      //     $scope.cancel = function () {
      //         $uibModalInstance.dismiss('cancel');
      //     };
      // }
      //
      function submit() {
          var form = angular.copy(vm.form);
          form.ramo = vm.ramo.url;

          // form.provider = vm.provider.url;
          return ramoService.createSubramo(form)
              .then(function(data){
                  toaster.success('Se ha agregado un nuevo ramo');
                  vm.subramos.push(data);
              });
      }

      function cancel(){
          vm.form = {
            subramo_name: '',
            subramo_code: ''
          };
      }
      //
      // // Contacts
      // function deleteContacts(url, index){
      //     return contactService.deleteContact(url)
      //         .then(function(){
      //             vm.form.contact_provider.splice(index, 1); //jshint ignore:line
      //             toaster.error('Se ha borrado un contacto');
      //         });
      // }
      //
      //
      // function addContact(){
      //     var contact = {name: 'demo', phone_number: '811', email: 'fer@gmail.com'} //jshint ignore:line
      //     vm.form.contact_provider.push(contact); //jshint ignore:line
      // }

  }
})();
