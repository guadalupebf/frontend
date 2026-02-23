// (function() {
//     'use strict';
//     /* jshint devel: true */

//     angular.module('inspinia')
//         .controller('ReceiptsCtrl', ReceiptsCtrl);

//     ReceiptsCtrl.$inject = ['insuranceService', 'receiptService', 'statusReceipt', 'helpers', 'toaster', 'FileUploader', 'url',
//         '$stateParams', '$scope', '$localStorage', '$uibModal', '$timeout', '$q', '$sessionStorage','MESSAGES'];

//     function ReceiptsCtrl(insuranceService, receiptService, statusReceipt, helpers, toaster, FileUploader, url,
//         $stateParams, $scope, $localStorage, $uibModal, $timeout, $q, $sessionStorage, MESSAGES) {

//         var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
//         var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
//         var usr = JSON.parse(decryptedUser);
//         var token = JSON.parse(decryptedToken);

//         var vm = this;
//         vm.pageTitle = 'Pólizas';

//         // variables
//         vm.receipts = [];
//         vm.receipt = {};
//         vm.canEditReceipt = true;
//         vm.canEditReceiptStatus = true;
//         vm.statusReceipt = statusReceipt;

//         vm.receiptBackup = {};
//         vm.user = usr;

//         // functions
//         vm.editReceipt = editReceipt;
//         vm.changeReceiptStatus = changeReceiptStatus;
//         vm.editReceiptStatus = editReceiptStatus;
//         vm.uploadFiles = uploadFiles;

//         vm.cancelEditReceipt = cancelEditReceipt;
//         vm.applyEditReceipt = applyEditReceipt;

//         /** Uploader files */
//         $scope.userInfo = { id: 0 };
//         var uploader = $scope.uploader = new FileUploader({
//             headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
//         });

//         uploader.filters.push({
//             name: 'customFilter',
//             fn: function(item /*{File|FileLikeObject}*/ , options) { //jshint ignore:line
//                 return this.queue.length < 20;
//             }
//         });

//         // ALERTA SUCCES UPLOADFILES
//         uploader.onSuccessItem = function(fileItem, response, status, headers) {
//           toaster.success(MESSAGES.OK.UPLOADFILES);
//         };

//         // ALERTA ERROR UPLOADFILES
//         uploader.onErrorItem = function(fileItem, response, status, headers) {
//           toaster.error(MESSAGES.ERROR.ERRORONUPLOADFILES);
//         };

//         uploader.onAfterAddingFile = function(fileItem) {
//             fileItem.formData.push({
//                 arch: fileItem._file
//             })
//         }

//         uploader.onBeforeUploadItem = function(item) {
//             item.url = $scope.userInfo.url;
//             item.formData[0].nombre = item.file.name;
//             item.alias = '';
//             item.formData[0].owner = $scope.userInfo.id;
//         };

//         activate();

//         function activate() {
//             insuranceService.getInsuranceRead($stateParams)
//                 .then(function(data) {
//                   vm.poliza_number = data.poliza_number;
//                   vm.poliza_id = data.id;
//                     data.recibos_poliza.forEach(function(elem) {
//                         receiptService.getReceiptsByUriService(elem)
//                             .then(function(res) {
//                                 vm.receipts.push(res);
//                                 if (parseInt($stateParams.receiptId) === res.recibo_numero) {
//                                     vm.receipt = res;
//                                 }
//                             });
//                     });
//                 });
//             getFiles();
//         }



//         function getFiles() {
//             return receiptService.getFiles(receiptService.getReceiptID())
//                 .then(function(data) {
//                     vm.files = data;
//                     return vm.files;
//                 });
//         }

//         function changeReceiptStatus() {
//             // Refresh actual state
//             // TODO change only receipt
//             vm.receipt.status = vm.status.value;
//             if (!helpers.isTheReceiptCanceled(vm.receipt.status)) {

//             } else {
//                 receiptService.cancelReceiptsFrom(vm.receipt)
//                     .then(function(res) {
//                     });
//             }

//             // receiptService.updateReceiptService(vm.receipt)
//             //     .then(function(res){
//             //         if (res.status === 200){
//             //             toaster.success('Se ha guardado su cambio');
//             //         } else {
//             //             toaster.warning('Ha ocurrido un error');
//             //         }
//             //     });
//             vm.canEditReceiptStatus = true;
//         }

//         function editReceipt() {
//             vm.canEditReceipt = !vm.canEditReceipt;
//             vm.receiptBackup = angular.copy(vm.receipt);
//         }

//         function cancelEditReceipt() {
//             vm.canEditReceipt = !vm.canEditReceipt;
//             vm.receipt = vm.receiptBackup;
//         }

//         function applyEditReceipt() {
//             receiptService.patchReceipt(vm.receipt.url, vm.receipt)
//                 .then(function(res) {
//                     toaster.success('Recibo actualizado');
//                     vm.canEditReceipt = !vm.canEditReceipt;
//                 });
//         }

//         function editReceiptStatus(receipt) {
//             //vm.canEditReceiptStatus = !vm.canEditReceiptStatus;
//             var modalInstance = $uibModal.open({ //jshint ignore:line
//                 templateUrl: 'app/cobranzas/cobranzas.modal.html',
//                 controller: 'CobranzasModal',
//                 size: 'lg',
//                 ////windowClass: 'animated fadeIn',
//                 resolve: {
//                     receipt: function() {
//                         return angular.copy(receipt.id);
//                     },
//                     from: function(){
//                       return null;
//                     } ,bono: function(){
//                       return null;
//                     }
//                 }
//             });
//             modalInstance.result.then(function() {
//                 activate();
//             });
//         }

//         function uploadFiles() {

//             $scope.userInfo = {
//                 id: vm.receipt.id
//             };

//             $scope.userInfo.url = $scope.uploader.url = url.IP + 'recibos/' + vm.receipt.id + '/archivos/';
//             $q.when()
//                 .then(function() {
//                     var defer = $q.defer();
//                     defer.resolve($scope.uploader.uploadAll());
//                     return defer.promise;
//                 })
//                 .then(function() {
//                     toaster.success('Se han subido sus archivos correctamente');
//                     $timeout(function() {
//                         getFiles().then(function(res) {
//                             vm.files = res;
//                         });
//                     }, 100);
//                 });
//         }
//     }
// })();
