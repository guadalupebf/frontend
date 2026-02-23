(function(){
  'use strict';
  /* jshint devel: true */

  angular.module('inspinia')
      .controller('PaquetesEditCtrl', PaquetesEditCtrl);

  PaquetesEditCtrl.$inject = ['$state','$http','$localStorage','$stateParams', '$uibModal', 'packageService', 
                              'coverageService', 'providerService', 'toaster', 'SweetAlert', '$sessionStorage'];

  function PaquetesEditCtrl($state, $http, $localStorage, $stateParams, $uibModal, packageService, coverageService, 
                            providerService, toaster, SweetAlert, $sessionStorage) {

    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);

      var vm = this;

      vm.pageTitle = 'Paquetes';
      vm.package = null;                        // Paquete
      //vm.coberages = [];                      // Lista de coberturas
      vm.provider = {};
      vm.user = usr;

      // Variables de control
      // HACK ejemplo
      vm.form = {
        coverage_name : '',
        priority : null,
        suma_name : null,
        deducible_name : null,
        coverage_sums : [],
        coverage_deductibles : []
      }

      // Funciones
      vm.addSum = addSum;
      vm.removeSum = removeSum;
      vm.addDeductible = addDeductible;
      vm.removeDeductible = removeDeductible;
      vm.submit = submit;
      vm.savePack = savePack;

      //Funciones submit
      //vm.submit = submit;
      //vm.submitSum = submitSum;
      //vm.submitDeductible = submitDeductible;
      //vm.reloadCoverages = reloadCoverages;

      //Modal
      //vm.createCoverageModal = createCoverageModal;
      vm.editCoverageModal = editCoverageModal;


      activate();

      /*
      // Agrega una cobertura
      function submit() {
          vm.form = {
              coverage_name: vm.form.coverage_name,  //jshint ignore:line
              provider: vm.provider.url,
              package: vm.package.url,
              prima: ''
          };
          var form = angular.copy(vm.form);
          return coverageService.createCoverage(form)
              .then(function(){
                  toaster.success('Se ha agregado correctamente una nueva cobertura');
                  vm.package.coverage_package.push(form);
                  vm.form = {}; // limpia la forma
              });
      }

      // Agrega una suma asegurada
      // TODO add sum insured in dropdown
      function submitSum(){
          vm.form2 = {
              sum_insured: vm.form2.sum_insured,
              coverage_sum: vm.form2.coverage_sum.url
          };
          var form2 = angular.copy(vm.form2);
          return coverageService.createSumInsured(form2)
              .then(function(data){
                  toaster.success('Se ha agregado correctamente una nueva suma asegurada');
                  // vm.package.coverage_package.push(form);
                  vm.form2 = {};
              });
      }


      // Agrega el costo de deducible
      function submitDeductible(){
          vm.form3 = {
              deductible: vm.form3.deductible,
              coverage_deductible: vm.form3.coverage_deductible.url
          };
          var form3 = angular.copy(vm.form3);

          return coverageService.createDeducible(form3)
              .then(function(data){
                  toaster.success('Se ha agregado correctamente un nuevo deducible');
                  // vm.package.coverage_package.push(form);
                  vm.form3 = {};
                  //vm.reloadCoverages();
              });
      }*/

      function resetForm(){
        vm.form.coverage_name = '',
        vm.form.priority = 0,
        vm.form.suma_name = 0,
        vm.form.deducible_name = 0,
        vm.form.coverage_sums = [],
        vm.form.coverage_deductibles = []
      }

      function savePack(pack){
        $http.patch(pack.url, {package_name: pack.package_name}).then(function(data) {
          if(data.status == 200){
            SweetAlert.swal("¡Listo!", "El paquete ha sido actualizado", "success");
            $state.go('paquetes.paquetes');
          }
        });
      }

      function activate() {

        resetForm();
        return packageService.getPackage($stateParams)
            .then(function(data) {
                vm.package = data;
                //vm.package.coverage_package = data.coverage_package;
                return data;
            })
            // .then(function(data){
            //     providerService.getProvider(data)
            //       .then(function(data){
            //           vm.provider = data;
            //       });
            // });
      }
/*
      function createCoverageModal(){
        var modalInstance = $uibModal.open({ //jshint ignore:line
          templateUrl: 'app/modals/modal.coverage.create.html',
          controller: addCoverageCtrl,
          ////windowClass: 'animated fadeIn',
          size: 'lg'
        });
      }
*/

      function editCoverageModal(coverageToEdit){
        var modalInstance = $uibModal.open({
          templateUrl: 'app/modals/modal.coverage.create.html',
          controller: editCoverageCtrl,
          ////windowClass: 'animated fadeIn',
          size: 'lg',
          resolve: {
            coverage : function(){
              return coverageToEdit;
            }
          },
          backdrop: 'static', /* this prevent user interaction with the background */ 
          keyboard: false
        });
      }

      function submit(){
        var returning = false;
        if(vm.form.coverage_name == ""){
          SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORNAMECOVERAGE, "error");
          returning = true;
        }
        // if(vm.form.coverage_sums.length < 1){
        //   toaster.error('Es necesario agregar sumas aseguradas')
        //   returning = true;
        // }
        // if(vm.form.coverage_deductibles.length < 1){
        //   toaster.error('Es necesario agregar deducibles')
        //   returning = true;
        // }

        if(returning){
          return;
        }

        var submitForm = {
          coverage_name:        vm.form.coverage_name,  //jshint ignore:line
          priority:             vm.form.priority ? vm.form.priority : 0,
          provider:             vm.provider.url,
          package:              vm.package.url,
          prima:                '',
          sums_coverage:        vm.form.coverage_sums,
          deductible_coverage:  vm.form.coverage_deductibles
        }
        // Damos de alta la cobertura
        coverageService.createCoverageComplete(submitForm)
          .then(function(coverage){
              toaster.success('Se ha agregado correctamente una nueva cobertura');
              //return data;
              resetForm();
              vm.package.coverage_package.push(coverage);// Agregando la cobertura a la vista 'en vivo'
          });/*.then(function(coverage){
            // TODO tambien puede ser llamado con un updateCoverage (servicio no hecho)
            // Le agregamos todas las sumas aseguradas que se pidieron
            vm.form.coverage_sums.forEach(function(sum){
              var sumObj = {
                sum_insured : sum.sum_insured,
                coverage_sum: coverage.url
              };
              coverageService.createSumInsured(sumObj)
                .then(function(data){
                  coverage.sums_coverage.push(data);
                });
            });
            vm.form.coverage_deductibles.forEach(function(ded){
              var deductibleObj = {
                deductible : ded.deductible,
                coverage_deductible : coverage.url
              };
              coverageService.createDeducible(deductibleObj)
              .then(function(data){
                coverage.deductible_coverage.push(data);
              });
            });
            return coverage;
          }).then(function(coverage){
            vm.package.coverage_package.push(coverage);// Agregando la cobertura a la vista 'en vivo'
          });*/
      }

      function addSum(sumNum){
        // if(isNaN(sumNum) || sumNum < 1){
        //   toaster.error('Favor de ingresar un numero valido');
        //   return;
        // }
        var newSum = {
          coverage_sum: '',
          id: -1,
          sum_insured: sumNum,
          default: false,
          url: ''
        };

        vm.form.coverage_sums.push(newSum);
        vm.form.suma_name = '';
      }

      function removeSum(index){
        if(index > -1){
          vm.form.coverage_sums.splice(index,1);
        }
      }

      function addDeductible(deductibleNum){
        // if(isNaN(deductibleNum) || deductibleNum < 1){
        //   toaster.error('Favor de ingresar un numero valido');
        //   return;
        // }
        var newDed = {
          coverage_deductible: '',
          deductible: deductibleNum,
          default: false,
          id: -1,
          url: ''
        };

        vm.form.coverage_deductibles.push(newDed);
        vm.form.deducible_name = '';
      }

      function removeDeductible(index){
        if(index > -1){
          vm.form.coverage_deductibles.splice(index,1);
        }
      }
/*
      function addCoverageCtrl($uibModalInstance,$scope,$stateParams,providerService,packageService,coverageService,toaster){
        $scope.title = 'Agregar cobertura - Paquete:' + vm.package.package_name;
        $scope.provider = {};
        $scope.package = null;

        // HACK ejemplo
        $scope.form = {
          coverage_name : 'Ejemplo',
          suma_name : 10000,
          deducible_name : 10,
          coverage_sums : [],
          coverage_deductibles : []
        }

        // Funciones
        $scope.addSum = addSum;
        $scope.removeSum = removeSum;
        $scope.addDeductible = addDeductible;
        $scope.removeDeductible = removeDeductible;
        $scope.cancel = cancel;
        $scope.submit = submit;

        activateCtrl()

        function activateCtrl(){
          $scope.package = vm.package;
          $scope.provider = vm.provider;
        }

        function submit(){
          var returning = false;
          if($scope.form.coverage_name == ""){
            toaster.error('Es necesario asignar un nombre a la cobertura')
            returning = true;
          }
          if($scope.form.coverage_sums.length < 1){
            toaster.error('Es necesario agregar sumas aseguradas')
            returning = true;
          }
          if($scope.form.coverage_deductibles.length < 1){
            toaster.error('Es necesario agregar deducibles')
            returning = true;
          }

          if(returning){
            return;
          }

          var coverage = null;
          var submitForm = {
            coverage_name: $scope.form.coverage_name,  //jshint ignore:line
            provider: $scope.provider.url,
            package: $scope.package.url,
            prima: ''
          }
          // Damos de alta la cobertura
          coverageService.createCoverage(submitForm)
            .then(function(data){
                toaster.success('Se ha agregado correctamente una nueva cobertura');
                coverage = data;
            }).then(function(){
              // TODO tambien puede ser llamado con un updateCoverage (servicio no hecho)
              // Le agregamos todas las sumas aseguradas que se pidieron
              $scope.form.coverage_sums.forEach(function(sum){
                var sumObj = {
                  sum_insured : sum.sum_insured,
                  coverage_sum: coverage.url
                };
                coverageService.createSumInsured(sumObj)
                  .then(function(data){
                  });
              });
              $scope.form.coverage_deductibles.forEach(function(ded){
                var deductibleObj = {
                  deductible : ded.deductible,
                  coverage_deductible : coverage.url
                };
                coverageService.createDeducible(deductibleObj)
                .then(function(data){
                });
              });
            }).then(function(){
              var coverageObj = {
                paqueteId : coverage.id
              };
              coverageService.getCoverage(coverageObj)
                .then(function(data){
                  vm.package.coverage_package.push(data);// Agregando la cobertura a la vista 'en vivo'
                })
            }).then(function(){
              $uibModalInstance.dismiss('success');
            });
        }

        function cancel(){
          $uibModalInstance.dismiss('cancel');
        }

        function addSum(sumNum){
          if(isNaN(sumNum) || sumNum < 1){
            toaster.error('Favor de ingresar un numero valido');
            return;
          }
          var newSum = {
            coverage_sum: '',
            id: -1,
            sum_insured: sumNum,
            url: ''
          };

          $scope.form.coverage_sums.push(newSum);
          $scope.form.suma_name = '';
        }

        function removeSum(index){
          if(index > -1){
            $scope.form.coverage_sums.splice(index,1);
          }
        }

        function addDeductible(deductibleNum){
          if(isNaN(deductibleNum) || deductibleNum < 1){
            toaster.error('Favor de ingresar un numero valido');
            return;
          }
          var newDed = {
            coverage_deductible: '',
            deductible: deductibleNum,
            id: -1,
            url: ''
          };

          $scope.form.coverage_deductibles.push(newDed);
          $scope.form.deducible_name = '';
        }

        function removeDeductible(index){
          if(index > -1){
            $scope.form.coverage_deductibles.splice(index,1);
          }
        }
      }*/

      function editCoverageCtrl($http,url,$uibModalInstance,$scope,$stateParams,providerService,packageService,coverageService,toaster,coverage, formatValues){
        $scope.title = 'Editar cobertura - Paquete: ' + vm.package.package_name;
        $scope.coverage = angular.copy(coverage);
        $scope.provider = {};
        $scope.package = null;

        //HACK ejemplos default en suma_name y deducible_name
        $scope.form = {
          coverage_name : '',
          priority : '',
          suma_name : '',
          deducible_name : '',
          coverage_sums : [],
          coverage_deductibles : []
        }

        $scope.edit = {
          coverage_sums_add : [],
          coverage_deductibles_add : [],
          coverage_sums_delete : [],
          coverage_deductibles_delete : [],
          coverage_name:'',
          priority:'',
          url: ''
        }

        $scope.formatValues_ = function(param) {
          var model = formatValues.currency(param);  
          return model;
        };

        // Funciones
        $scope.addSum = addSum;
        $scope.removeSum = removeSum;
        $scope.addDeductible = addDeductible;
        $scope.removeDeductible = removeDeductible;
        $scope.cancel = cancel;
        $scope.submit = submit;
        $scope.deleteIt = deleteIt;

        activateCtrl()

        function activateCtrl(){
          $http.get(url.IP+ 'coberturas/'+$scope.coverage.id+'/').then(function(coverage) {
            coverage = coverage.data;
            $scope.provider = vm.provider;
            $scope.form.coverage_name = coverage.coverage_name;
            $scope.form.coverage_name = coverage.coverage_name;
            $scope.form.priority = coverage.priority
            $scope.form.coverage_deductibles = coverage.deductible_coverage;
            $scope.form.url = coverage.url;
            $scope.edit.url = coverage.url;
            $scope.form.user=$localStorage.user;
          })

        }

        function deleteIt(){
          if(confirm("¿Estas seguro de querer eliminar esta cobertura?")){
            var submitForm = {
                deductible_coverage:  $scope.form.coverage_deductibles,
                sums_coverage:        $scope.form.coverage_sums,
                url:                  $scope.form.url
            }
            // TODO El API debe poder borrar la cobertura
            coverageService.deleteCoverageComplete(submitForm)
              .then(function(response){
                var indexParent = vm.package.coverage_package.indexOf(coverage);
                vm.package.coverage_package.splice(indexParent,1);
                $uibModalInstance.dismiss("delete");
              });
          }
        }

        function submit() {

          var indexParent = vm.package.coverage_package.indexOf(coverage);
          $scope.coverage.sums_coverage= $scope.form.coverage_sums;
          $scope.coverage.deductible_coverage = $scope.form.coverage_deductibles;
          coverage = $scope.coverage;
          $scope.edit.coverage_name = $scope.form.coverage_name;
          $scope.edit.priority = $scope.form.priority;

          coverageService.updateCoverageComplete($scope.edit)
            .then(function(response){
              if (response.data.coverage_name = $scope.form.coverage_name) {
                $scope.form.coverage_name = response.data.coverage_name;
                $scope.form.priority = response.data.priority;                
              }
              vm.package.coverage_package.forEach(function(cov) {
                if (response.data.url == cov.url) {
                  cov = response.data    
                }
              });
              
            });
            // $http.patch($scope.form.url, $scope.form);

            $scope.form.coverage_deductibles.forEach(function(item) {
              if(item.url) {
                $http.patch(item.url, item);
              }
            });

            $scope.form.coverage_sums.forEach(function(item) {
              if(item.url) {
                $http.patch(item.url, item);
              }
            });

          //coverageService.updateCoverage()
          $scope.coverage.coverage_name = $scope.edit.coverage_name;
          vm.package.coverage_package[indexParent] = $scope.coverage;
          //TODO llamar servicio de update
          toaster.success('Cobertura actualizada');
          $uibModalInstance.dismiss('ok');
          // $state.go('paquetes.paquetes');
          
        }

        function cancel(){
          $uibModalInstance.dismiss('cancel');
        }


        $scope.default_sum = function (param) {

          $scope.form.coverage_sums.forEach(function(item) {
            if(item.id) {
              if(item.id !== param.id) {
                item.default = false;
              }
            } else {
              // TODO: esperar a ver que show 
            }
          });

        }

        $scope.default_deductible = function (param) {

          $scope.form.coverage_deductibles.forEach(function(item) {
            if(item.id) {
              if(item.id !== param.id) {
                item.default = false;
              }
            } else {
              // TODO: esperar a ver que show 
            }
          });

        }

        var addedSum = false;
        function addSum(sumNum){
          $scope.form.coverage_sums.forEach(function (elem) {
            if ($scope.form.suma_name == elem.sum_insured) {
              toaster.warning('Suma existente', 'La suma elegida ya está agregada.');
              addedSum = true;
            }
          });
          if(!addedSum) {
            sumNum = String(sumNum)
            if(sumNum.indexOf('$') != -1){
              if(sumNum.indexOf(',') != -1){
                var sunChar = sumNum.replace('$', '').replace(',', '');
              } else{
                var sunChar = sumNum.replace('$', '');
              }
            } else if(sumNum.indexOf(',') != -1){
              var sunChar = sumNum.replace(',', '');
            } else {
              var sunChar = sumNum;
            }

            var newSum = {
              coverage_sum: '',
              id: -1,
              sum_insured: sunChar,
              url: ''
            };

            $scope.form.coverage_sums.push(newSum);
            $scope.edit.coverage_sums_add.push(newSum);
            $scope.form.suma_name = '';
          }
          addedSum = false;
        }

        function removeSum(index){
          if(index > -1){
            var value = $scope.form.coverage_sums[index];
            if($scope.form.coverage_sums[index].id != -1){
              $scope.edit.coverage_sums_delete.push(value);
              // $http.delete(value.url);
            }else{
              var relIndex = $scope.edit.coverage_sums_add.indexOf(value);
              $scope.edit.coverage_sums_add.splice(relIndex,1);
            }
            $scope.form.coverage_sums.splice(index,1);
          }
        }

        var addedDed = false;
        function addDeductible(deductibleNum){
          $scope.form.coverage_deductibles.forEach(function (elem) {
            if ($scope.form.deducible_name == elem.deductible) {
              toaster.warning('Deducible existente', 'El deducible elegido ya está agregado.');
              addedDed = true;
            }
          });
          if (!addedDed) {
            // if(isNaN(deductibleNum) || deductibleNum < 1){
            //   toaster.error('Favor de ingresar un número válido');
            //   return;
            // }
            deductibleNum = String(deductibleNum)
            if(deductibleNum.indexOf('$') != -1){
              if(deductibleNum.indexOf(',') != -1){
                var dedChar = deductibleNum.replace('$', '').replace(',', '');
              } else{
                var dedChar = deductibleNum.replace('$', '');
              }
            } else if(deductibleNum.indexOf(',') != -1){
              var dedChar = deductibleNum.replace(',', '');
            } else {
              var dedChar = deductibleNum;
            }

            var newDed = {
              coverage_deductible: '',
              deductible: dedChar,
              id: -1,
              url: ''
            };

            $scope.form.coverage_deductibles.push(newDed);
            $scope.edit.coverage_deductibles_add.push(newDed);
            $scope.form.deducible_name = '';
          }
          addedDed = false;
        }

        function removeDeductible(index){
          if(index > -1){
            var value = $scope.form.coverage_deductibles[index];
            if($scope.form.coverage_deductibles[index].id != -1){
              // $http.delete(value.url);
              $scope.edit.coverage_deductibles_delete.push(value);
            }else{
              var relIndex = $scope.edit.coverage_deductibles_add.indexOf(value);
              $scope.edit.coverage_deductibles_add.splice(relIndex,1);
            }
            $scope.form.coverage_deductibles.splice(index,1);
          }
        }
      }
  }
})();
