(function(){
    'use strict';
    /* jshint devel: true */
     
    angular.module('inspinia')
        .controller('PolizasCtrl', PolizasCtrl);
    
    PolizasCtrl.$inject = ['$localStorage','ContratanteService', 'providerService', 'packageService', 'insuranceService', 'coverageService', 'receiptService', '$uibModal',
                        '$filter','toaster', 'helpers', '$sessionStorage'];
    
    function PolizasCtrl($localStorage,ContratanteService, providerService, packageService, insuranceService, coverageService, receiptService, $uibModal, $filter, toaster,
                        helpers, $sessionStorage) {
    
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);
    
        var vm = this;
        vm.pageTitle = 'Pólizas';
        vm.saveInsurance = saveInsurance;
        vm.openModal = openModal;
    
        vm.insurances = [];
        vm.hideOT = hideOT;
        vm.saveOT = saveOT;
    
        vm.contratante = {};
        vm.contratantes = [];
        vm.ramos = [];
        vm.subramos = [];
        vm.providers = [];
        vm.packages = [];
        vm.receipts = [];
        vm.coverages = [];
        vm.user = usr;
        vm.endorsementReceipts = [];
    
        $scope.sex = [
          { name: 'MASCULINO', value: 'M' },
          { name: 'FEMENINO', value: 'F' }
        ];
    
        vm.show = {
          ot: true,
          receipt: false,
          generateReceipts: false,
          receiptsGenerated: false
        };
    
        vm.payments = [
          {name: 'Mensual', code: '1'},
          {name: 'Bimestral', code: '2'},
          {name: 'Trimestral', code: '3'},
          {name: 'Contado', code: '5'},
          {name: 'Semestral', code: '6'},
          {name: 'Anual', code: '12'},
        ];
    
        vm.form = {
          contratante: '',
          poliza: '',
          ramo: '',
          type: '',
          subramo: '',
          aseguradora: '',
          package: '',
          payment: '',
          startDate: new Date(),
          endingDate: new Date(new Date().setYear(new Date().getFullYear() + 1))
        };
    
        vm.changeProvider = changeProvider;
        vm.changeRamo = changeRamo;
        vm.changeSubramo = changeSubramo;
        vm.changePackage = changePackage;
        vm.deleteCoverage = deleteCoverage;
    
        activate();
    
        function activate(){
            getInsurances();
            ContratanteService.getContratantes()
                .then(function(data){
                    vm.contratantes = data;
                });
    
            providerService.getProviders()
                .then(function(data){
                    vm.providers = data;
                });
        }
    
        function changeProvider(obj){
            vm.ramos = obj.ramo_provider;
        }
    
        function changeRamo(obj){
            vm.subramos = obj.subramo_ramo;
        }
    
        function changeSubramo(obj){
            vm.packages = obj.package_subramo;
        }
    
        function changePackage(obj){
            vm.coverages = obj.coverage_package;
        }
    
        function deleteCoverage(obj, index){
            vm.coverages.splice(index, 1);
        }
    
        function getInsurances(){
            insuranceService.getandReadInsurances()
                .then(function(data){
                    vm.insurances = data;
                });
        }
    
        function hideOT(){
            vm.show.ot = false;
            var form = angular.copy(vm.form);
            form = {
                contratante: form.contratante,
                aseguradora: form.aseguradora.url,
                ramo: form.ramo.url,
                subramo: form.subramo.url,
                paquete: form.paquete.url,
                poliza_number: form.poliza,
                start_of_validity: form.startDate,
                end_of_validity: form.endingDate,
                forma_de_pago: form.payment || null,
                status: 1
            };
            if (form.contratante.indexOf('Fisica')){
                form.natural = form.contratante;
                form.juridical = null;
            } else {
                form.juridical = form.contratante;
                form.natural = null;
            }
    
            return insuranceService.createInsurance(form)
                .then(function(data){
                    getInsurances();
                    vm.myInsurance = data;
                    toaster.success('Se ha creado una orden de trabajo');
                    return data;
                })
                .then(function(data){
                    var coverages = [];
                    vm.coverages.forEach(function(elem){
                        var coverage = {
                            'policy': data.url,
                            'package': data.paquete,
                            'coverage_name': elem.coverage_name || '',
                            'prima': elem.primaInPolicy || ''
                        };
    
                        if (elem.sumInPolicy === undefined){
                            coverage.sum_insured = '';
                        } else {
                            coverage.sum_insured = elem.sumInPolicy.sum_insured;
                        }
    
                        if (elem.deductibleInPolicy === undefined){
                            coverage.deductible = '';
                        } else {
                            coverage.deductible = elem.deductibleInPolicy.deductible;
                        }
    
                        coverages.push(coverage);
                        coverageService.createCoberturaPoliza(coverage);
                    });
                });
        }
    
        // TODO update before save poliza
        function saveOT(){
            ////console.log('saving OT');
        }
    
        // Receipt modal
        // TODO dejar visualizado los recibos despues de calcular
        function openModal(){
            vm.show.receiptsGenerated = true;
            var modalInstance = $uibModal.open({ //jshint ignore:line
                templateUrl: 'app/polizas/recibos.modal.html',
                controller: ModalInstanceCtrl,
                size: 'lg',
                //windowClass: 'animated fadeIn'
            });
        }
    
        function ModalInstanceCtrl ($scope, $uibModalInstance, toaster) {
            var vmm = $scope;
    
            vmm.showReceipts = vm.show.receiptsGenerated;
            vmm.amountReceipts = 0;
            vmm.poliza = {
                primaNeta: 0.00,
                iva: 16,
                rpf: 0.0,
                derecho: 0,
                subTotal: 0,
                primaTotal: 0
            };
            vm.receipts = [];
            vmm.receipts = [];
    
            vmm.ok = function () {
                vm.show.receipt = true;
                if($uibModalInstance)
                $uibModalInstance.close();
            };
    
            vmm.calculate = function(){
                if(!vm.form.payment){
                    toaster.info(ERROR.CHOOSEGROUP);
                } else {
                    vmm.receipts = [];
                    vmm.showReceipts = true;
                    var initDate = $scope.form.startDate;
                    var endDate = $scope.form.endingDate;
                    var months = helpers.monthDiff(initDate,endDate);
                    var amountReceipts = vmm.amountReceipts = months / vm.form.payment;
                    //Calculate poliza results
                    vmm.poliza.subTotal = getSubtotal(vmm.poliza);
                    vmm.poliza.primaTotal = getTotal(vmm.poliza);
    
                    var arrayLen = vmm.getNumber(amountReceipts);
    
                    // Logic from vm
                    var obj = {
                        prima: vmm.poliza.primaNeta / amountReceipts,
                        rpf: vmm.poliza.rpf / amountReceipts,
                        derecho: vmm.poliza.derecho / amountReceipts,
                        iva: vmm.poliza.iva,
                        subTotal: vmm.poliza.subTotal / amountReceipts,
                        primaTotal: vmm.poliza.primaTotal / amountReceipts,
                    };
    
                    for (var i = 0; i < arrayLen.length; i++) {
                        // Check options
                        if (vmm.configDerecho){
                            if (i === 0) {obj.derecho = vmm.poliza.derecho;}
                            else {obj.derecho = 0;}
                        }
    
                        if (vmm.configRPF){
                            if (i === 0) {obj.rpf = vmm.poliza.rpf;}
                            else {obj.rpf = 0;}
                        }
    
                        endDate = new Date(moment(initDate).add(vm.form.payment, 'months').calendar());
    
                        var subTotal = obj.prima + obj.rpf + obj.derecho;
                        var receipt = {
                            'prima': parseFloat((obj.prima).toFixed(2)),
                            'rpf': parseFloat((obj.rpf).toFixed(2)),
                            'derecho': parseFloat((obj.derecho).toFixed(2)),
                            'iva': 16,
                            'subTotal':parseFloat((subTotal).toFixed(2)),
                            'total': parseFloat((subTotal * 1.16).toFixed(2)),
                            'startDate': initDate,
                            'endingDate':  endDate
                            // 'endingDate':  vm.form.endingDate
                        };
                        initDate = endDate;
                        vmm.receipts.push(angular.copy(receipt));
                        vm.receipts = vmm.receipts;
                    }
                }
    
            };
    
            vmm.cancel = function () {
              if($uibModalInstance)
                $uibModalInstance.dismiss('cancel');
            };
    
            vmm.getNumber = function(num){
                return new Array(num);
            };
    
            function getSubtotal(poliza){
                var sum = parseFloat(poliza.primaNeta) + parseFloat(poliza.rpf) + parseFloat(poliza.derecho);
                return Number((sum).toFixed(2));
            }
    
            function getTotal(poliza){
                return poliza.subTotal * 1.16;
            }
        }
    
        function saveInsurance() {
            vm.myInsurance.status = 1;
            vm.myInsurance.forma_de_pago = vm.form.payment;
            insuranceService.updateInsurance(vm.myInsurance)
                .then(function(data){
                    ////console.log('this saveInsurance');
                    toaster.success('Se ha creado una póliza');
                    getInsurances();
                    vm.receipts.forEach(function(elem, index){
                      ////console.log('my index', index);
                        var receipt = {
                          'poliza': vm.myInsurance.url,
                          'recibo_numero': index+1,
                          'prima_neta': elem.prima,
                          'rpf': elem.rpf,
                          'derecho': elem.derecho,
                          'iva': elem.iva,
                          'sub_total': elem.subTotal,
                          'prima_total': elem.total,
                          'status': 1,
                          'fecha_inicio': $filter('date')(elem.startDate, 'yyyy-MM-dd'),
                          'fecha_fin': $filter('date')(elem.endingDate$filter, 'yyyy-MM-dd'),
                          'receipt_type':elem.receipt_type,
                          'rp_owner_id':elem.rp_owner_id
                        };
                        receiptService.createReceiptService(receipt)
                            .then(function(data){
                                // //console.log('Recibos creados', data);
                            });
                    });
                });
        }
    }
    })();
    