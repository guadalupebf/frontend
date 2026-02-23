'use strict';

angular.module('inspinia')
    .controller('RenewalPolicyModalCtrl', RenewalPolicyModalCtrl);

RenewalPolicyModalCtrl.$inject = ['$scope', '$uibModalInstance', '$filter',
                                  'providerService',
                                  'toaster', 'newOT', 'payform'];

function RenewalPolicyModalCtrl($scope, $uibModalInstance, $filter,
    providerService,
    toaster, newOT, payform) {
    var vm = $scope;

    // Variables
    vm.showOne = true;
    vm.combos = {
        providers: [],
        payform: payform,
        ramos: [],
        subramos: [],
        packages: []
    };

    // Functions
    vm.cancel = cancel;
    vm.renewal = newOT;

    // changeListener
    vm.changeProvider = changeProvider;
    vm.changeRamo = changeRamo;
    vm.changeSubramo = changeSubramo;
    vm.changePackage = changePackage;
    // TODO la fecha de vigencia se corre un año

    activate();
    //
    function activate(){
    //     var data = {};
    //     data.polizaId = main.insurance.id;
    //     insuranceService.getInsuranceRead(data)
    //         .then(function(data){
    //             $scope.form = data;
    //         });
    //
        providerService.getProviders()
          .then(function(data){
              vm.combos.providers = data;
              vm.combos.providers.forEach(function(elem, index){
                  if(elem.compania === vm.renewal.aseguradora){
                      vm.renewal.aseguradora = vm.combos.providers[index];
                      vm.combos.ramos = vm.renewal.aseguradora.ramo_provider;
                      vm.combos.ramos.forEach(function(elem, index){
                          if (elem.ramo_name === vm.renewal.ramo) {
                              vm.renewal.ramo = vm.combos.ramos[index];
                              vm.combos.subramos = vm.renewal.ramo.subramo_ramo;
                              vm.combos.subramos.forEach(function(elem, index){
                                  if (elem.subramo_name === vm.renewal.subramo) {
                                      vm.renewal.subramo = vm.combos.subramos[index];
                                      vm.combos.packages = vm.renewal.subramo.package_subramo;
                                      vm.combos.packages.forEach(function(elem, index){
                                          if (elem.package_name === vm.renewal.paquete) {
                                              vm.renewal.paquete = vm.combos.packages[index];
                                              // TODO traer coberturas
                                          }
                                      });
                                  }
                              });
                          }
                      });
                  }
              });
              return data;
          });

        vm.combos.payform.forEach(function(elem, index){
            if (elem.label === vm.renewal.forma_de_pago){
                vm.renewal.payment = payform[index];
            }
        });

        vm.renewal.start_of_validity = moment(vm.renewal.start_of_validity).add(1, 'years').format();
        vm.renewal.end_of_validity = moment(vm.renewal.end_of_validity).add(1, 'years').format();
    //
    //     var otherData = {};
    //     otherData.polizaId = data.polizaId.replace('leer-', '');
    //
    //     insuranceService.getInsurance(otherData)
    //         .then(function(insuranceData){
    //             var prov = {};
    //             prov.provider = insuranceData.aseguradora;
    //             providerService.getProvider(prov)
    //                 .then(function(data){
    //                     $scope.ramos = data.ramo_provider;
    //                     return insuranceData;
    //                 }).then(function(insurance){
    //                     ramoService.getRamo(insurance)
    //                         .then(function(ramoData){
    //                               $scope.subramos = ramoData.subramo_ramo;
    //                               ramoService.getSubramo(insurance)
    //                                   .then(function(subramoData){
    //                                       $scope.paquetes = subramoData.package_subramo;
    //                                   });
    //                         });
    //                 });
    //         });
    }

    function cancel(){
      if($uibModalInstance)
        $uibModalInstance.dismiss('cancel');
    }

    // changeListener
    function changeProvider(provider){
        vm.combos.ramos = provider.ramo_provider;
        vm.combos.subramos = [];
        vm.combos.packages = [];
    }

    function changeRamo(ramo){
        vm.combos.subramos = ramo.subramo_ramo;
        vm.combos.packages = [];
    }

    function changeSubramo(subramo){
        vm.combos.paquetes = subramo.package_subramo;
    }

    function changePackage(pack){
    }
}



// RenewalPolicyModal
// function PolicyModal($scope, $uibModalInstance, toaster, $filter) {
//     $scope.datas = 10;
//     $scope.form = {};
//
//     $scope.providers = [];
//     $scope.ramos = [];
//     $scope.subramos = [];
//     $scope.paquetes = [];
//
//     $scope.saveOT = saveOT;
//
//     $scope.status = status;
//     $scope.payform = payform;
//
//     $scope.show = {
//         receipt: false
//         // ot: false
//     };
//
//     $scope.changeProvider = changeProvider;
//     $scope.changeRamos = changeRamos;
//     $scope.changeSubramos = changeSubramos;
//
//     $scope.openModal = openReceiptModal;
//     $scope.saveInsurance = saveInsurance;
//
//
//     function changeProvider(changeProv){
//         $scope.ramos = changeProv.ramo_provider;
//     }
//
//     function changeRamos(changeRamo){
//         $scope.subramos = changeRamo.subramo_ramo;
//     }
//
//     function changeSubramos(changeSubramo){
//         $scope.paquetes = changeSubramo.package_subramo;
//     }
//
//     var myForm = {};
//     var parentScope = $scope;
//
//     function openReceiptModal(){
//         myForm = $scope.form;
//         var modalInstance = $uibModal.open({ //jshint ignore:line
//             templateUrl: 'app/polizas/recibos.modal.html',
//             controller: ReceiptModalCtrl,
//             size: 'lg',
//             ////windowClass: 'animated fadeIn',
//             resolve: {
//                 form: function(){
//                   return $scope.form;
//                 }
//             }
//         });
//     }
//
//     function getInsurances(){
//         insuranceService.getandReadInsurances()
//             .then(function(data){
//                 main.insurances = data;
//             });
//     }
//
//     function saveInsurance() {
//         $scope.form.status = 4;
//
//         insuranceService.updateInsurance($scope.form)
//             .then(function(){
//                 getInsurances();
//                 $scope.receipts.forEach(function(elem, index){
//                         var receipt = {
//                             'poliza': $scope.form.url,
//                             'recibo_numero': index+1,
//                             'prima_neta': elem.prima.toString(),
//                             'rpf': elem.rpf.toString(),
//                             'derecho': elem.derecho.toString(),
//                             'iva': elem.iva,
//                             'sub_total': elem.subTotal.toString(),
//                             'prima_total': elem.total.toString(),
//                             'status': 4,
//                             'fecha_inicio': $filter('date')(elem.startDate, 'yyyy-MM-dd'),
//                             'fecha_fin':  $filter('date')(elem.endingDate, 'yyyy-MM-dd'),
//                             'description': null
//                         };
//                     receiptService.createReceiptService(receipt);
//                 });
//                 toaster.success('Se ha creado una poliza');
//             });
//     }
//
//     function saveOT(){
//         var save = $scope.form;
//         save.aseguradora = $scope.form.aseguradora.url;
//         save.ramo = $scope.form.ramo.url;
//         save.subramo = $scope.form.subramo.url;
//         save.paquete = $scope.form.paquete.url;
//         if ($scope.form.forma_de_pago.value){
//           save.forma_de_pago = $scope.form.forma_de_pago.value;
//         }
//         save.status = 1;
//         insuranceService.updateInsurance(save)
//             .then(function(){
//                 toaster.success('Su Ot ha sido guardada');
//                 getInsurances();
//                 $uibModalInstance.dismiss('cancel');
//             });
//     }
//
//     function activate(){
//         var data = {};
//         data.polizaId = main.insurance.id;
//         insuranceService.getInsuranceRead(data)
//             .then(function(data){
//                 $scope.form = data;
//             });
//
//         providerService.getProviders()
//           .then(function(data){
//               $scope.providers = data;
//               return data;
//           });
//
//         var otherData = {};
//         otherData.polizaId = data.polizaId.replace('leer-', '');
//
//         insuranceService.getInsurance(otherData)
//             .then(function(insuranceData){
//                 var prov = {};
//                 prov.provider = insuranceData.aseguradora;
//                 providerService.getProvider(prov)
//                     .then(function(data){
//                         $scope.ramos = data.ramo_provider;
//                         return insuranceData;
//                     }).then(function(insurance){
//                         ramoService.getRamo(insurance)
//                             .then(function(ramoData){
//                                   $scope.subramos = ramoData.subramo_ramo;
//                                   ramoService.getSubramo(insurance)
//                                       .then(function(subramoData){
//                                           $scope.paquetes = subramoData.package_subramo;
//                                       });
//                             });
//                     });
//             });
//     }
//
//     activate();
//
//     $scope.ok = function () {
//     };
//
//     $scope.close = function () {
//         $uibModalInstance.dismiss('cancel');
//     };
//
//     ///////////////// Create receipt modal
//     function ReceiptModalCtrl($scope, $uibModalInstance){
//         $scope.amountReceipts = 0;
//         $scope.poliza = {
//             primaNeta: 538.10,
//             iva: 16,
//             rpf: 45.20,
//             derecho: 300,
//             subTotal: 0,
//             primaTotal: 0
//         };
//
//         $scope.calculate = function(){
//             if(!parentScope.form.forma_de_pago){
//                 toaster.info(MESSAGES.ERROR.SELPAY);
//             } else {
//                 $scope.receipts = [];
//                 $scope.showReceipts = true;
//                 var amountReceipts = $scope.amountReceipts = 12 / parentScope.form.forma_de_pago.value;
//                 //Calculate poliza results
//                 $scope.poliza.subTotal = getSubtotal($scope.poliza);
//                 $scope.poliza.primaTotal = getTotal($scope.poliza);
//                 var arrayLen = $scope.getNumber(amountReceipts);
//
//                 var obj = {
//                     prima: $scope.poliza.primaNeta / amountReceipts,
//                     rpf: $scope.poliza.rpf / amountReceipts,
//                     derecho: $scope.poliza.derecho / amountReceipts,
//                     iva: $scope.poliza.iva,
//                     subTotal: $scope.poliza.subTotal / amountReceipts,
//                     primaTotal: $scope.poliza.primaTotal / amountReceipts,
//                 };
//
//                 var initDate = parentScope.form.start_of_validity;
//                 var endDate = parentScope.form.end_of_validity;
//                 for (var i = 0; i < arrayLen.length; i++) {
//                     // Check options
//                     if ($scope.configDerecho){
//                         if (i === 0) {obj.derecho = $scope.poliza.derecho;}
//                         else {obj.derecho = 0;}
//                     }
//
//                     if ($scope.configRPF){
//                         if (i === 0) {obj.rpf = $scope.poliza.rpf;}
//                         else {obj.rpf = 0;}
//                     }
//                     endDate = moment(new Date(moment(initDate).add(parentScope.form.forma_de_pago.value, 'months').calendar())).format();
//
//                     var subTotal = obj.prima + obj.rpf + obj.derecho;
//                     var receipt = {
//                         'prima': parseFloat((obj.prima).toFixed(2)),
//                         'rpf': parseFloat((obj.rpf).toFixed(2)),
//                         'derecho': parseFloat((obj.derecho).toFixed(2)),
//                         'iva': 16,
//                         'subTotal':parseFloat((subTotal).toFixed(2)),
//                         'total': parseFloat((subTotal * 1.16).toFixed(2)),
//                         'startDate': initDate,
//                         'endingDate':  endDate
//                     };
//
//                     initDate = endDate;
//
//                     $scope.receipts.push(angular.copy(receipt));
//                     parentScope.receipts = $scope.receipts;
//                 }
//             }
//
//         };
//
//         $scope.ok = function () {
//             parentScope.show = {
//                 receipt: true,
//                 // ot: true
//             };
//             $uibModalInstance.dismiss('cancel');
//
//         };
//
//         $scope.cancel = function () {
//             $uibModalInstance.dismiss('cancel');
//         };
//
//         $scope.getNumber = function(num){
//             return new Array(num);
//         };
//
//         function getSubtotal(poliza){
//             var sum = poliza.primaNeta + poliza.rpf + poliza.derecho;
//             return Number((sum).toFixed(2));
//         }
//
//         function getTotal(poliza){
//             return poliza.subTotal * 1.16;
//         }
//     }
//     ///////////////// Create receipt modal
//
//
//   /////// PolicyModal
//   }
