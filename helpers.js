(function() {
    'use strict';

    angular
        .module('inspinia')
        .factory('helpers', helpers);

    helpers.$inject = ['coverageService', 'statusReceipt', 'url', 'globalVar', '$http', '$q', '$log', '$filter', '$localStorage', 'SweetAlert', 'generalService', '$sessionStorage'];

    function helpers(coverageService, statusReceipt, url, globalVar, $http, $q, $log, $filter, $localStorage, SweetAlert, generalService, $sessionStorage) {

        var service = {
            checkType: checkType,
            getStates: getStates,
            getDiseases: getDiseases,
            hasAtLeastOneAddress: hasAtLeastOneAddress,
            hasAtLeastOneContact: hasAtLeastOneContact,
            hasAValidPolicyNumber: hasAValidPolicyNumber,
            isTheReceiptCanceled: isTheReceiptCanceled,
            isResponseOk: isResponseOk,
            isResponseAnError: isResponseAnError,
            subformChecker: subformChecker,
            diseaseType: diseaseType,
            damageType: damageType,
            createCoverages: createCoverages,
            formBySubBranch: formBySubBranch,
            isPolicy: isPolicy,
            isOT: isOT,
            getFormByPolicy: getFormByPolicy,
            getContractorsByGroup: getContractorsByGroup,
            copyExisting: copyExisting,
            calculateReceiptsValue: calculateReceiptsValue,
            getAutoYears: getAutoYears,
            policyModel: policyModel,
            beneficiariesPercentageGreaterThanZero: beneficiariesPercentageGreaterThanZero,
            existPolicy: existPolicy,
            existPolicyNumber: existPolicyNumber,
            existSerial: existSerial,
            existSerialRenovacion:existSerialRenovacion,
            existOT: existOT,
            monthDiff: monthDiff,
            existPolicyFolio:existPolicyFolio
        };


        return service;


        function renameFile(file){
          var patch = {
            nombre: file.nombre
          }
          //$http.patch(file.arch)
        }

        ////////////
        /** Get an array and verify is has at least one element */
        function hasAtLeastOneContact(arr) {
            return (arr.length) ? true : false;
        }

        /** Check type of contractor */
        function checkType(type) {
            return (type === 1) ? 'fisicas' : 'morales';
        }

        function getStates() {
          var dfd = $q.defer();
          if(!$localStorage.states){
            $http.get(globalVar.states)
              .then(function(responseStates){
                if(responseStates.status == 200){
                  $localStorage.states = responseStates;
                  dfd.resolve($localStorage.states);
                }else{
                  dfd.reject();
                }
              });
          }else{
            dfd.resolve($localStorage.states);
          }

          return dfd.promise;
            return $http.get(globalVar.states);
        }

        function getDiseases() {
          var dfd = $q.defer();

          if(!$localStorage.diseases){
            $http.get(globalVar.diseases)
              .then(function(responseDiseases){
                if(responseDiseases.status == 200){
                  $localStorage.diseases = responseDiseases;
                  dfd.resolve($localStorage.diseases);
                }else{
                  dfd.reject();
                }
              });
          }else{
            dfd.resolve($localStorage.diseases);
          }

          return dfd.promise;
            return $http.get(globalVar.diseases);
        }

        function hasAValidPolicyNumber(num) {
            return num !== 0 ? true : false;
        }

        function hasAtLeastOneAddress(arr) {
            return arr.length ? true : false;
        }

        function isTheReceiptCanceled(status) {
            return (status === statusReceipt[1].value) ? true : false;
        }

        function isResponseOk(req) {
            return (req === 200 || req === 201) ? true : false;
        }

        function isResponseAnError(req) {
            return (req === 400) ? true : false;
        }

        function diseaseType(req) {
            if (req === "2") {
                // Accidentes personales
                return 1;
            } else if (req === "3") {
                // Gastos medicos
                return 2;
            } else if (req === "4") {
                // Salud
                return 3;
            } else {
                return 0;
            }

        }

        function damageType(req) {
            if (req === 5) {
                // Responsabilidad Civil y Riesgos Profesionales
                return 1;
            } else if (req === 6) {
                // Marítimo y transportes
                return 2;
            } else if (req === 7) {
                // Incendio
                return 3;
            } else if (req === 8) {
                // Agrícola y de Animales
                return 4;
            } else if (req === 10) {
                // Crédito
                return 5;
            } else if (req === 11) {
                // Crédito a la vivienda
                return 6;
            } else if (req === 12) {
                // Garantía financiera
                return 7;
            } else if (req === 13) {
                // Diversos
                return 8;
            } else if (req === 14) {
                // Terremoto y otros riesgos catastróficos
                return 9;
            } else {
                return 0;
            }

        }

        function isPolicy(insurance) {
            var status = insurance.status;
            return (status === 4 || status === 10 || status == 11 || status == 12 || status == 13 || status == 14 || status == 15);
        }

        function isOT(insurance) {
            var status = insurance.status;
            return (status === 1 || status == 2);
        }

        function subformChecker(subform) {
            if (subform.auto) {
                subform.auto.urlForm = globalVar.automobileForm;
                return subform.auto;
            } else if (subform.life) {
                subform.life.urlForm = globalVar.lifeForm;
                return subform.life;
            } else if (subform.disease) {
                subform.disease.urlForm = globalVar.diseaseForm;
                return subform.disease;
            } else if (subform.damage) {
                subform.damage.urlForm = globalVar.damageForm;
                return subform.damage;
            } else {
                return null;
            }
        }

        function createCoverages(coverages, policy) {
            var coverage = {};
            coverages.forEach(function(elem) {
                coverage = {
                    'policy': policy.url,
                    'package': policy.paquete,
                    'coverage_name': elem.coverage_name ? elem.coverage_name : '',
                    'deductible': elem.deductible ? elem.deductible : '',
                    'sum_insured': elem.sum_insured ? elem.sum_insured : '',
                    'prima': elem.prima ? elem.prima : '',
                    'coinsurance': elem.coinsuranceInPolicy ? elem.coinsuranceInPolicy.value : 0,
                    'topecoinsurance': elem.topeCoinsuranceInPolicy ? elem.topeCoinsuranceInPolicy.value : 0,
                };

                if(elem.coinsurance){
                    coverage = {
                        'policy': policy.url,
                        'package': policy.paquete,
                        'coverage_name': elem.coverage_name ? elem.coverage_name : '',
                        'deductible': elem.deductible ? elem.deductible : '',
                        'sum_insured': elem.sum_insured ? elem.sum_insured : '',
                        'prima': elem.prima ? elem.prima : '',
                        'coinsurance': elem.coinsurance ? elem.coinsurance : 0,
                        'topecoinsurance': elem.topecoinsurance ? elem.topecoinsurance : 0,
                    };
                }
                if(elem.sumInPolicy || elem.deductibleInPolicy){
                    coverage = {
                    'policy': policy.url,
                    'package': policy.paquete,
                    'coverage_name': elem.coverage_name ? elem.coverage_name : '',
                    'deductible': elem.deductibleInPolicy ? elem.deductibleInPolicy.value : '',
                    'sum_insured': elem.sumInPolicy ? elem.sumInPolicy.value : '',
                    'prima': elem.prima ? elem.prima : '',
                    'coinsurance': elem.coinsuranceInPolicy ? elem.coinsuranceInPolicy.value : 0,
                    'topecoinsurance': elem.topeCoinsuranceInPolicy ? elem.topeCoinsuranceInPolicy.value : 0,
                    };

                }
                /*coverage = {
                    'policy': policy.url,
                    'package': policy.paquete,
                    'coverage_name': elem.coverage_name ? elem.coverage_name : '',
                    'deductible': elem.deductibleInPolicy ? elem.deductibleInPolicy.label : '',
                    'sum_insured': elem.sumInPolicy ? elem.sumInPolicy.label : '',
                    'prima': elem.primaInPolicy ? elem.primaInPolicy : '',
                    'coinsurance': elem.coinsuranceInPolicy ? elem.coinsuranceInPolicy : ''
                };*/
                coverageService.createCoberturaPoliza(coverage);
            });
        }

        function formBySubBranch(param) {
            return $http.get(param.subramo)
                .then(function(res) {
                    var data = {};
                    if (res.data.subramo_code === "9") {
                        // Auto
                        data = (param.automobiles_policy);
                    } else if (res.data.subramo_code === "1") {
                        // Life
                        data = (param.life_policy);
                    } else if (res.data.subramo_code === "2" || res.subramo_code === "3" || res.subramo_code === "4") {
                        // disease
                        data = (param.accidents_policy);
                    } else if (res.data.subramo_code === "5" || res.subramo_code === "6" || res.subramo_code === "7" || res.subramo_code === "8" || res.subramo_code === "10" || res.subramo_code === "11" || res.subramo_code === "12" || res.subramo_code === "13" || res.subramo_code === "14") {
                        // damage
                        data = (param.damages_policy);
                    }
                    return data;
                });
        }

        function getFormByPolicy(res) {
            // Select form
            if (res.accidents_policy.length >= 1) {
                return [res.accidents_policy, 0];
            } else if (res.automobiles_policy.length >= 1) {
                return [res.automobiles_policy, 1];
            } else if (res.damages_policy.length >= 1) {
                return [res.damages_policy, 2];
            } else if (res.life_policy.length >= 1) {
                return [res.life_policy, 3];
            }
        }

        function monthDiff(d1, d2) {
            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }

        function getContractorsByGroup() {
            var defered = $q.defer();
            var promise = defered.promise;

            $http.get(url.IP + 'grupos/')
                .then(function(res) {
                    var contractors = [];
                    res.data.results.forEach(function(group, index) {
                        group.natural_group.forEach(function(natural, index) {
                            natural.groupName = group.group_name;
                            natural.name = natural.first_name + ' ' + natural.last_name;
                            contractors.push(natural);
                        });
                        group.juridical_group.forEach(function(juridical, index) {
                            juridical.groupName = group.group_name;
                            juridical.name = juridical.j_name;
                            contractors.push(juridical);
                        });
                    });
                    defered.resolve(contractors);
                });
            return promise;
        }

        function copyExisting(theTarget, theSource) {
            var result = {};

            for (var key in theTarget) {
                if (theSource[key]) {
                    result[key] = theSource[key];
                } else {
                    result[key] = theTarget[key];
                }
            }

            return result;
        }

        function calculateReceiptsValue(defaults, payform, policy) {
            // var defered = $q.defer();
            // var promise = defered.promise;

            var receipt = angular.copy(defaults.receipt);
            var config = angular.copy(defaults.config);
            var receipts = [];
            var receiptAmount = 12 / payform;
            var arrayLen = new Array(receiptAmount);
            var initDate = angular.copy(policy.start_of_validity);
            var endDate = angular.copy(policy.end_of_validity);

            var obj = {
                prima: receipt.primaNeta / receiptAmount,
                rpf: receipt.rpf / receiptAmount,
                derecho: receipt.derecho / receiptAmount,
                iva: receipt.iva,
                subTotal: 0,
                total: 0
                // subTotal: receipt.subTotal / receiptAmount,
                // total: receipt.primaTotal / receiptAmount
            };

            for (var i = 0; i < arrayLen.length; i++) {
                // Check options
                if (config.derecho) {
                    if (i === 0) {
                        obj.derecho = parseFloat(receipt.derecho);
                    } else {
                        obj.derecho = 0;
                    }
                }

                if (config.rpf) {
                    if (i === 0) {
                        obj.rpf = parseFloat(receipt.rpf);
                    } else {
                        obj.rpf = 0;
                    }
                }

                endDate = new Date(moment(initDate).add(payform, 'months').calendar());

                obj.subTotal = (obj.prima + obj.rpf + obj.derecho);
                obj.total = obj.subTotal * 1.16;

                var receipt = {
                    'prima': parseFloat((obj.prima).toFixed(2)),
                    'rpf': parseFloat((obj.rpf).toFixed(2)),
                    'derecho': parseFloat((obj.derecho).toFixed(2)),
                    'iva': 16,
                    'subTotal': parseFloat((obj.subTotal).toFixed(2)),
                    'total': parseFloat((obj.total).toFixed(2)),
                    'startDate': $filter('date')(initDate, 'yyyy-MM-dd'),
                    'endingDate': $filter('date')(endDate, 'yyyy-MM-dd')
                };
                initDate = endDate;
                receipts.push(angular.copy(receipt));
            }
            return receipts;
        }

        function getAutoYears() {
            var actualYear = new Date().getFullYear();
            var oldYear = actualYear - 50;
            var years = [];

            for (var i = oldYear; i <= actualYear + 100; i++) {
                years.push(i)
            };

            return years;
        }

        function policyModel(form, docType) {
            return {
                "internal_number": form.internal_number ? form.internal_number : "",
                "folio": form.folio ? form.folio : "",
                "poliza_number": form.poliza_number ? form.poliza_number : "",
                "natural": form.natural ? form.natural : null,
                "juridical": form.juridical ? form.juridical : null,
                "aseguradora": form.aseguradora ? form.aseguradora : null,
                "ramo": form.ramo ? form.ramo : null,
                "subramo": form.subramo ? form.subramo : null,
                "paquete": form.paquete ? form.paquete : null,
                "observations": form.observations ? form.observations : "",
                "old_policies": [],
                "start_of_validity": form.start_of_validity ? form.start_of_validity : "",
                "end_of_validity": form.end_of_validity ? form.end_of_validity : "",
                "forma_de_pago": null,
                "status": form.status ? form.status : null,
                "recibos_poliza": [],
                "document_type": docType
            };
        }

        function beneficiariesPercentageGreaterThanZero(beneficiariesList) {
            if (beneficiariesList.length === 0) {
                return false;
            } else if (beneficiariesList.length === 1) {
                if (beneficiariesList[0].percentage > 100) {
                    return true;
                }
                return false;
            } else {
                var percentage = beneficiariesList.reduce(function(a, b) {
                    return {
                        percentage: parseFloat(a.percentage) + parseFloat(b.percentage)
                    };
                })
                if (percentage.percentage > 100) {
                    return true;
                }
                return false;
            }
        }

        function existPolicy(policy) {
            return $http.get(globalVar.existPolicy.replace(':id', policy))
                .then(function(res) {
                    return res.data;
                });
        }
        function existPolicyNumber(policy) {
            var d = {
                id: policy
            }
            return $http({
                  method: 'POST',
                  url: globalVar.existPolicyNumber,
                  data: d
            }).then(function(res) {
                    return res.data;
                });
        }

        function existSerial(policy) {
            return $http.get(globalVar.existSerial.replace(':id', policy))
                .then(function(res) {
                    return res.data;
                });
        }
        function existSerialRenovacion(policy, idpoliza) {
            var url = globalVar.existSerialRenovacion
                .replace(':id', policy)
                .replace(':idpoliza', idpoliza);

            return $http.get(url).then(function(res) {
                return res.data;
            });
        }

        function existPolicyFolio(folio) {
            return $http.get(globalVar.existPolicyFolio.replace(':pk', folio))
                .then(function(res) {
                    return res.data;
                });
        }

        function existOT(ot) {
            return $http.get(globalVar.existOT.replace(':id', ot))
                .then(function(res) {
                    return res.data;
                });
        }

    }
})();
