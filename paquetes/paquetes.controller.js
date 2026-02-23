(function(){
  'use strict';
  /* jshint devel: true */

  angular.module('inspinia')
      .controller('PaquetesCtrl', PaquetesCtrl);

  PaquetesCtrl.$inject = ['url','$http','$q','$localStorage','packageService', 'ramoService', 'providerService', 'groupService','coverageService' ,
                          'toaster',
                          '$state', '$sessionStorage', '$scope', 'SweetAlert','$uibModal', 'exportFactory', 'PersistenceFactory',];

  function PaquetesCtrl(url,$http,$q,$localStorage,packageService, ramoService, providerService, groupService, coverageService,
      toaster,
      $state, $sessionStorage,$scope,SweetAlert, $uibModal, exportFactory, PersistenceFactory) {

      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var usr = JSON.parse(decryptedUser);

      var vm = this;
      vm.pageTitle = 'Paquetes';
      vm.submit = submit;
      vm.pack = [];
      vm.passProvider = passProvider;
      vm.user = usr;

      // vm.providers = [];
      vm.ramos = [];
      vm.subramos = [];
      vm.coverage_ramos = [];
      vm.coverage_subramos = [];
      vm.coverage_paquetes = [];


      //  personalizar paquetes
      vm.package_ramos = [];
      vm.package_subramos = [];
      vm.package_paquetes = [];
      vm.package_covs=[];
      vm.activate = activate;
      vm.search = search;
      vm.table = {};

      vm.goToPackageEditor = goToPackageEditor;

      // Changes
      vm.changeProvider = changeProvider;
      vm.changeRamo = changeRamo;
      // vm.changeSubramo = changeSubramo

      vm.changeCoverageProvider = changeCoverageProvider;
      vm.changeCoverageRamo = changeCoverageRamo;
      vm.changeCoverageSubramo = changeCoverageSubramo

      vm.changePackageProvider = changePackageProvider;
      vm.changePackageRamo = changePackageRamo;
      vm.changePackageSubramo = changePackageSubramo;
      vm.changePackagePackage = changePackagePackage;
      vm.makeDefaultCoverage = makeDefaultCoverage;
      vm.ordenarCoberturas = ordenarCoberturas;
      vm.saveCovOrden = saveCovOrden;

      vm.packageArray = [];

      // Delete
      vm.deletePackage = deletePackage;
      vm.createCoverage = createCoverage ;

      vm.form = {
          provider: '',
          coverage_name: '',
          package_name: '',  //jshint ignore:line
          description: ' ',
          ramo: '',
          subramo: '',
          coverage_ramo: '',
          coverage_subramo: '',
          coverage_paquete:'',
          coverage_package: [],
          package_ramo: '',
          package_subramo: '',
          package_paquete:'',
      };

      vm.table = {
        headers: [
          'Paquetes',
          'Aseguradora ',
          'Ramos',
          'Subramos',
          'Opciones',
          'Acciones'
        ]
      };


      initial();

      vm.showForm=false;
      vm.showForm1=false;
      vm.showTable=false;
      vm.showForm2=false;
      vm.showPackageForm=false;
      vm.toggleForm = toggleForm;
      vm.toggleForm1 = toggleForm1;
      vm.toggleForm2 = toggleForm2;
      vm.toggleTable = toggleTable;
      vm.hideForm = hideForm;
      vm.hideForm1 = hideForm1;
      vm.hideForm2 = hideForm2;
      vm.showPackage = showPackage;
      vm.hideFormPackage = hideFormPackage;
      vm.deletePackagesw = deletePackagesw;
      vm.editCoverage = editCoverage;
      vm.toggle = toggle;
      vm.ordenar = false;
      vm.cobDe = false;
      // --orden coverages
      $scope.columnArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
      $scope.columnArrayNew = [];
      $scope.currentPosition = null;

      /* Información de usuario */
      $scope.infoUser = $sessionStorage.infoUser;

      $scope.finalColumn = function(column, evet) {
        $scope.columnArrayNew = angular.copy($scope.columnArray);
        $scope.column = column;
        $scope.position = event.path[0].cellIndex;
        $scope.columnArray[$scope.position] = $scope.column;

        if($scope.currentPosition > $scope.position){
          for(var i=$scope.position; i<$scope.currentPosition; i++){
            $scope.columnArray[i+1] = $scope.columnArrayNew[i];
          }
        }
        else if($scope.currentPosition < $scope.position){
          for(var i=$scope.position; i>$scope.currentPosition; i--){
            $scope.columnArray[i-1] = $scope.columnArrayNew[i];
          }
        }
      };
      $scope.currentColumn = function(column, event){
        $scope.currentPosition = event.originalEvent.path[0].cellIndex;
      };
      function ordenarCoberturas(obj){
        vm.test = true ;
        vm.ordenar = true ;
        vm.cobDe = true;
        if(vm.test == false){
          vm.test=true;
        }else{
          vm.test = true;
          vm.ordenar = true;
          vm.cobDe = false;
        }
      }
      // ------orden coverages

      function toggle(value){
        vm.showForm = value;
        vm.showForm1 = true;
      }

      function toggleForm() {
        if(vm.showForm==false){
        vm.showForm=true;
      }else{
        vm.showForm=false;
      }
      }

      function hideForm(){
        if(vm.showForm==true){
          vm.showForm=false;
        }else{
          vm.showForm=true;
        }
      }

      function toggleForm1(){
        if(vm.showForm1==false){
        vm.showForm1=true;
      }else{
        vm.showForm1=false;
      }
      }

      function hideForm1(){
        $scope.inputCoverage = false;
        if(vm.showForm1==true){
          vm.showForm1=false;
        }else{
          vm.showForm1=true;
        }
      }

      function toggleForm2(){
        if(vm.showForm2==false){
        vm.showForm2=true;
      }else{
        vm.showForm2=false;
      }
      }

      function hideForm2(p){
        if (p){
          if(p==2){
            vm.test = true;
            vm.ordenar = false;
            vm.cobDe = true;
          }
        }else if(vm.showForm2==true){
          vm.showForm2=false;
        }else{
          vm.showForm2=true;
        }
      }

      function toggleTable(){
        if(vm.showTable==false){
        vm.showTable=true;
      }else{
        vm.showTable=false;
      }
      }

      function showPackage(){
        if(vm.showPackageForm==false){
        vm.showPackageForm=true;
      }else{
        vm.showPackageForm=false;
      }
      }
      function hideFormPackage(){
        if(vm.showPackageForm==true){
          vm.showPackageForm=false;
        }else{
          vm.showPackageForm=true;
        }
      }

    function deletePackagesw(pack,index){
            sweetAlert({
                 title: "¿Está seguro?",
                 text: "¡El paquete eliminará por completo!",
                 type: "warning",
                 showCancelButton: true,
                 confirmButtonColor: "#DD6B55",
                 confirmButtonText: "Si, eliminar.",
                 cancelButtonText: "No, cancelar.",
                 closeOnConfirm: false,
                 closeOnCancel: false },
                  function(isConfirm){
                     if (isConfirm) {
                      $http.post(url.IP+'delete-package/',{'paquete':pack.id})
                        .then(
                          function success(request) {

                            if(request.status === 200){
                              if(request.data.detail) {
                                vm.totalPackages.splice(index, 1);
                                sweetAlert("¡Eliminado!", request.data.detail, "success");

                              } else if(request.data.error) {
                                sweetAlert("Error", request.data.error);
                              }

                            } else {
                              //error
                              sweetAlert("El paquete no se pudo eliminar", "error");
                            }
                          },
                          function error(error){
                            sweetAlert("error", error);

                          }
                        )
                        .catch(function(e){
                            sweetAlert("Error", e);
                        });
                     } else {
                        sweetAlert("Cancelado", "El paquete no se removio ", "error");
                     }
                });

    }

    function search(cadena) {

      $scope.param_cadena = cadena;
      vm.show_binnacle = false;
      vm.totalPackages =[];
      vm.show_pagination_pack = false;
      if(cadena.length){
        var filter_pack = 'search-packages/';
        $http({
            method: 'GET',
            url: url.IP + filter_pack,
            params: {
                cadena: cadena
            }
        })
        .then(
            function success(request) {
                if(request.status === 200 && request.data.results.length){
                  vm.totalPackages = request.data.results;
                  vm.config_pagination = request.data;
                  vm.show_pagination_pack = true;
                } else {
                  toaster.warning("No se encontraron registros");
                }
            },
            function error(error) {

            }
        )
        .catch(function(e){
            console.log(e);
        });
      }else{
        vm.totalPackages =[];
      }

      vm.buttonReport = true;
    }

    $scope.exportData = function() {
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      var excel_pack = 'service_reporte-paquetes-excel';
      $http({
        method: 'GET',
        url: url.IP + excel_pack,
        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
        responseType: "arraybuffer"})
        .then(
            function success(data) {
             if(data.status == 200){
                var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                saveAs(blob, 'Reporte_Paquetes.xls');
              } else {
                SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
              }
              l.stop();
            },
            function error(error) {
              l.stop();
                console.log('error', error);
            }
        )
        .catch(function(e) {
            l.stop();
            console.log(e);
        })
    };
    $scope.exportDataSeeker = function (param){
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
            var data = {cadena : $scope.param_cadena};
            var excel_pack_seeker = 'service_reporte-paquetes-excel';
            $http({
              method: 'GET',
              url: url.IP + excel_pack_seeker,
              params: data,
              headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
              responseType: "arraybuffer"})
              .then(
                  function success(data) {
                   if(data.status == 200){
                      var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                      saveAs(blob, 'Reporte_Paquetes.xls');
                    } else {
                      SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
                    }
                    l.stop();
                  },
                  function error(error) {
                    l.stop();
                      console.log('error', error);
                  }
              )
              .catch(function(e) {
                l.stop();
                  console.log(e);
              })
        }


    vm.test = true;
    function editCoverage(coverage,$index){
        vm.package = [];
        vm.package = coverage;
        //vm.package =
        vm.coverage = coverage;
        $scope.coverage_name = 'Editar cobertura:  ' + vm.coverage.coverage_name
        $scope.coverage = angular.copy(coverage);
        $scope.provider = {};
        $scope.package = null;


        $scope.form = {
          coverage_name : '',
          suma_name : 10000,
          deducible_name : 10,
          coverage_sums : [],
          coverage_deductibles : []
        }

        $scope.edit = {
          coverage_sums_add : [],
          coverage_deductibles_add : [],
          coverage_sums_delete : [],
          coverage_deductibles_delete : [],
          coverage_name:'',
          url: ''
        }

        // Funciones
        $scope.addSum = addSum;
        $scope.removeSum = removeSum;
        $scope.addDeductible = addDeductible;
        $scope.removeDeductible = removeDeductible;
        $scope.cancel = cancel;
        $scope.submit = submit;
        $scope.deleteIt = deleteIt;

        activateCtrl();

        function activateCtrl(){
          $http.get(url.IP+ 'coberturas/'+$scope.coverage.id+'/').then(function(coverage) {
            coverage = coverage.data;
            vm.package = coverage;
            $scope.provider = vm.provider;
            $scope.form.coverage_name = coverage.coverage_name;
            $scope.form.coverage_sums = coverage.sums_coverage
            $scope.form.coverage_deductibles = coverage.deductible_coverage;
            $scope.form.url = coverage.url;
            $scope.edit.url = coverage.url;
            $scope.form.user=$localStorage.user;
          })
        }

        function submit(){
          //var indexParent = vm.package.coverage_package.indexOf(coverage);
          $scope.coverage.sums_coverage= $scope.form.coverage_sums;
          $scope.coverage.deductible_coverage = $scope.form.coverage_deductibles;
          coverage = $scope.coverage;
          $scope.edit.coverage_name = $scope.form.coverage_name;
          $scope.edit.coverage_sums_add = $scope.form.coverage_sums;
          $scope.edit.coverage_deductibles_add= $scope.form.coverage_deductibles;
          $scope.edit.coverage_sums_delete = $scope.form.coverage_sums;
          $scope.edit.coverage_deductibles_delete= $scope.form.coverage_deductibles;
          coverageService.updateCoverageComplete($scope.edit)
            .then(function(response){
              vm.package_covs.forEach(function(cov){
                if (response.data.url == cov.url){
                  cov.coverage_name = response.data.coverage_name
                }
              });
            });

          //coverageService.updateCoverage()
          //vm.package.coverage_package[$index] = $scope.coverage;
          //TODO llamar servicio de update
          toaster.success('Cobertura actualizada');
          // activate();
           //window.location.reload();
          vm.test = true;
          // if(vm.showForm2 == true){
          //   vm.showForm2 = false;
          // }
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

        var addedSum = false;
        function addSum(sumNum){
          $scope.form.coverage_sums.forEach(function (elem) {
            if ($scope.form.suma_name == elem.sum_insured) {
              toaster.warning('Suma existente', 'La suma elegida ya está agregada.');
              addedSum = true;
            }
          });
          if(!addedSum) {
            if(isNaN(sumNum) || sumNum < 1){
              SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORNUMBER, "error");
              return;
            }
            var newSum = {
              coverage_sum: '',
              id: -1,
              sum_insured: sumNum,
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
            if(isNaN(deductibleNum) || deductibleNum < 1){
              SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORNUMBER, "error");
              return;
            }
            var newDed = {
              coverage_deductible: '',
              deductible: deductibleNum,
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


        function cancel(){
          // $uibModalInstance.dismiss('cancel');
          vm.test = true;
        }

      vm.test = false;

    }

    vm.coberturaTest = coberturaTest;
    function coberturaTest(){
      vm.test = true;
    }
    function initial(){
      providerService.getReadListProviders()
              .then(function(data){
                  vm.providers = data;
              });
    }

      function activate() {
        vm.buttonReport = false;
        getProviders();
      }

      function getProviders(){
          vm.show_binnacle = false;
          vm.totalPackages = [];
          packageService.getInfoPackages()
              .then(function(data){
                  vm.totalPackages = data.data.results;
                  vm.config_pagination = data.config;
                  vm.show_pagination_pack = true;
              });
      }
      $scope.returnToPackage= function() {
            vm.show_binnacle= false;
      }

      function goToPackageEditor(pack){
          $state.go('paquetes.edit', {paqueteId: pack.id});
      }
      vm.showBinnacle = showBinnacle;
        //-----------------------------------------------------------comments
        function showBinnacle(param) {
          vm.show_binnacle = true;
          vm.package_id = param.id;
          $http({
            method: 'GET',
            url: url.IP+'comments/',
            params: {
              'model': 9,
            'id_model': param.id
            }
          })
          .then(function(request) {
            vm.comments_data = request.data.results;
            vm.comments_config = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            }
          })
          .catch(function(e) {
            console.log('e', e);
          });
        };
        //-------------------------------------------------------------comments

        function exportPackageComments() {
          if (!vm.package_id || vm.commentsExportLoading) {
            return;
          }
          vm.commentsExportLoading = true;

          var resetLoading = function() {
            vm.commentsExportLoading = false;
          };

          var params = {
            model: 9,
            id_model: vm.package_id
          };
          if (vm.org_name) {
            params.org = vm.org_name;
          }

          toaster.info('Generando...', 'El archivo se está generando, espera un momento.');

          exportFactory.commentsExport({
            params: params,
            downloadName: 'bitacora-paquetes.xlsx',
            token: token
          })
          .then(function() {
              SweetAlert.swal({
                title: 'Listo',
                icon: 'success',
                text: 'La bitacora se descargo exitosamente',
                timer: 5000
              });
          })
          .catch(function(error) {
            console.error('Error exportando comentarios', error);
            SweetAlert.swal('Error', 'No se pudo exportar los comentarios. Intenta nuevamente.', 'error');
          })
          .finally(function() {
            resetLoading();
          });
        }

      function submit() {
          var form = angular.copy(vm.form);
          form.provider = form.provider.url;
          form.ramo = form.ramo.url;
          form.subramo = form.subramo.url;
          form.type_package = 1;

          var verify = {
            provider : vm.form.provider.id,
            ramo : vm.form.ramo.id,
            subramo : vm.form.subramo.id,
            package_name : vm.form.package_name,
          }
         packageService.verifyPackage(verify).then(function(response) {
           if(response){
            SweetAlert.swal("Error", "El paquete ya existe", "error");
           } else {
            return packageService.createPackage(form)
                .then(function(data){  //jshint ignore:line
                    toaster.success('Se ha agregado correctamente un nuevo paquete');
                    vm.pack = [];
                    getProviders();
                    vm.form = {};
                });
           }
         })
      }

      function changeProvider(obj){
          $http.get(url.IP+'ramos-by-provider/'+obj.id).then(function(ramos) {
            vm.ramos = ramos.data;
            })
          // vm.ramos = ;
      }

      function changeCoverageProvider(obj){
          $http.get(url.IP+'ramos-by-provider/'+obj.id).then(function(ramos) {
            vm.coverage_ramos = ramos.data;
            });
          // vm.ramos = ;
      }

      function changePackageProvider(obj){
          $http.get(url.IP+'ramos-by-provider/'+obj.id).then(function(ramos) {
            vm.package_ramos = ramos.data;
            });
          // vm.ramos = ;
          if(vm.test == false){
            vm.test=true;
          }
      }

      function changeRamo(obj){
          try{
            vm.subramos = obj.subramo_ramo;
          }
          catch(e){}

      }

      function changeCoverageRamo(obj){
          try{
            vm.coverage_subramos = obj.subramo_ramo;
          }
          catch(e){}
      }

      function changePackageRamo(obj){
          try{
            vm.package_subramos = obj.subramo_ramo;
          }
          catch(e){}
          if(vm.test == false){
            vm.test=true;
          }
      }

      $scope.inputCoverage = false;
      function changeCoverageSubramo(obj){
          if(obj.subramo_code == 3){
            $scope.inputCoverage = true;
          }
          try{
            $http.post(url.IP+'paquetes-by-subramo/',{
              'ramo':vm.form.coverage_ramo.id,
              'subramo':vm.form.coverage_subramo.id,
              'provider':vm.form.coverage_provider.id
            }).then(function(paquetes) {
              vm.coverage_paquetes = paquetes.data;
            });
          }
          catch(e){}

      }


      function makeDefaultCoverage(coverage){
        vm.package_covs.some(function(cov) {
          if (cov.id == coverage.id){
            if(cov.default == true){
              cov.default = false;
              // peticion desactivar default de covertura
              $http.patch(cov.url,cov).then(function(data) {
                toaster.success('cobertura desactivada')
              })

            }
            else{
              // peticion activar default de covertura
              cov.default = true;
              $http.patch(cov.url,cov).then(function(data) {
                toaster.success('cobertura activada')
              })

            }
          }
        });
      }
      function saveCovOrden(coverage){
        $scope.orden_covs = []
        vm.package_covs.forEach(function(covp) {
          coverage.forEach(function(covx) {
            if (covp.id == covx.id){
              $scope.orden_covs.push(covx.priority)
              $http.patch(covx.url,covx).then(function(data) {
              vm.test = true;
              vm.ordenar = false;
              vm.cobDe = true;
              })
            }
          });
        });
      }
      vm.deleteCoverage = deleteCoverage;
      function deleteCoverage(obj, index){
        SweetAlert.swal({
                 title: "¿Está seguro?",
                 text: "¡La cobertura se eliminará !",
                 type: "warning",
                 showCancelButton: true,
                 confirmButtonColor: "#DD6B55",
                 confirmButtonText: "Si, eliminar.",
                 cancelButtonText: "No, cancelar.",
                 closeOnConfirm: false,
                 closeOnCancel: false },
                     function(isConfirm){
                       if (isConfirm) {
                          vm.package_covs.splice(index, 1);
                              $http({
                                method: 'DELETE',
                                url: obj.url
                              })
                          SweetAlert.swal("¡Eliminada!", "Cobertura eliminada.", "success");
                       } else {
                          SweetAlert.swal("Cancelada", "Cobertura no removida", "error");
                       }
                    });

    }


      function changePackageSubramo(obj){
          try{
            $http.post(url.IP+'paquetes-by-subramo/',{
              'ramo':vm.form.package_ramo.id,
              'subramo':vm.form.package_subramo.id,
              'provider':vm.form.package_provider.id
            }).then(function(paquetes) {
              vm.package_paquetes = paquetes.data;
            });
          }
          catch(e){}
          if(vm.test == false){
            vm.test=true;
          }
      }

      function changePackagePackage(obj){
        $scope.columnArray =[]
          try{
            $http.post(url.IP+'covs-by-package/',{
              'provider':vm.form.package_provider.id,
              'package': vm.form.package_paquete.id
            }).then(function(coberturas) {
              for (var i = 0; i < coberturas.data.length; i++) {
                $scope.columnArray.push(i)
                coberturas.data[i].priority = i+1
              }
              vm.package_covs = coberturas.data;
            });
          }
          catch(e){}
          if(vm.test == false){
            vm.test=true;
            vm.cobDe = true;
            vm.ordenar = false
          }else{
            vm.cobDe = true
            vm.ordenar = false
          }
      }


      function createCoverage() {
        var deducibles = [];
        var sumas = [];
        var coinsurances = [];
        var topecoinsurances = [];
        sumas = vm.form.sum_insured
        deducibles = vm.form.deducible
        coinsurances = vm.form.coinsurance ? vm.form.coinsurance : []
        topecoinsurances = vm.form.topeCoinsurance ? vm.form.topeCoinsurance : []
         var coverage = {
            coverage_name:  vm.form.coverage_name,
            priority:  vm.form.priority ? vm.form.priority : 0,
            provider:       vm.form.coverage_provider.url,
            package:        vm.form.coverage_paquete.url,
            deductible_coverage: deducibles,
            sums_coverage: sumas,
            coinsurance_coverage: coinsurances,
            topecoinsurance_coverage: topecoinsurances,
          };
        coverageService.createCoverage(coverage).then(function(response){
          $http({
              method: 'POST',
              url: url.IP + 'sumas-aseguradas/',
              data: {
                  'coverage_sum': response.url,
                  'sum_insured': vm.form.sum_insured ? vm.form.sum_insured : ""
              }
              });
            $http({
              method: 'POST',
              url: url.IP + 'deducibles/',
              data: {
                  'coverage_deductible': response.url,
                  'deductible': vm.form.deductible ? vm.form.deductible : ""
              }
              });
            $http({
              method: 'POST',
              url: url.IP + 'coinsurance/',
              data: {
                  'coverage_coinsurance': response.url,
                  'coinsurance': vm.form.coinsurance ? vm.form.coinsurance : ""
              }
              });
            $http({
              method: 'POST',
              url: url.IP + 'topecoinsurance/',
              data: {
                  'coverage_topecoinsurance': response.url,
                  'topecoinsurance': vm.form.topeCoinsurance ? vm.form.topeCoinsurance : ""
              }
              });
          toaster.success('Se ha agregado correctamente una nueva cobertura');
          reset_coverage();
        });

      }
      function reset_coverage(argument) {
        vm.form.coverage_name = '';
        vm.form.coverage_provider = '';
        vm.form.coverage_paquete = '';
        vm.form.coverage_ramo = '';
        vm.form.coverage_subramo = '';

      }

      function deletePackage(paquetes, index){
          packageService.deletePackage(paquetes)
              .then(function(data){
                  vm.pack.splice(index, 1); //jshint ignore:line
              });
      }

      function passProvider(data){
          var arr = [];
          data.ramo_provider.forEach(function(elem){
              elem.subramo_ramo.forEach(function(elem2){
                  elem2.package_subramo.forEach(function(elem3){
                      var pack = {
                          ramo: elem.ramo_name,
                          subramo: elem2.subramo_name,
                          package: elem3.package_name,
                          packageId: elem3.id,
                          url: elem3.url
                      };
                      arr.push(pack);
                  });
              });
          });
          vm.pack = arr;
      }

  //-- Peticion de persistencia--//
      var json_data = {};
      var form = document.getElementsByTagName("form");
      var elementos ={};
      //Valores reutilizables
      var interval,interval1, dt, valor;

      function set_dataForm(json){
        PersistenceFactory.set_inputs(json);

        // Validar Botones
        if(json['vm.form.package_name'] != ""){
          PersistenceFactory.val_botons('!vm.form.package_name')
        }

        // Validar Select´s
        if(json['vm.form.provider']!=""){
          valor = PersistenceFactory.find_index(vm.providers, json['vm.form.provider']);
          changeProvider(vm.providers[valor]);
        }

        if(json['vm.form.ramo']!=""){
          interval1 = setInterval(function(){
            if(vm.ramos.length > 0){
              clearInterval(interval1);

              valor = PersistenceFactory.find_index(vm.ramos, json['vm.form.ramo']);
              changeRamo(vm.ramos[valor]);
              vm.form.ramo = vm.ramos[valor];

              if(vm.subramos.length > 0 && json['vm.form.subramo']!=""){
                valor = PersistenceFactory.find_index(vm.subramos, json['vm.form.subramo']);
                vm.form.subramo = vm.subramos[valor];
              }

            }
          }, 1000);
        }

        if(json['vm.form.package_provider']!="" && json['vm.form.package_provider'] != undefined){
          valor = PersistenceFactory.find_index(vm.providers, json['vm.form.provider']);
          changePackageProvider(vm.providers[valor]);
        }
      }

      //PersistenceFactory.inicial(vm.user.org,vm.pageTitle,vm.user.nameFull,PersistenceFactory.get_dataForm(form));

      // interval = setInterval(function(){
      //   if(form != undefined && PersistenceFactory.count == 0){
      //       PersistenceFactory.inicial(vm.user.org,vm.pageTitle,vm.user.nameFull,PersistenceFactory.get_dataForm(form));
      //     }
      //   if(PersistenceFactory.init_return != '' && PersistenceFactory.init_return != undefined){
      //   //if(PersistenceFactory.init_return != ''){
      //     clearInterval(interval);
      //     if(PersistenceFactory.init_return.status == 'data_view' ){
      //       set_dataForm(PersistenceFactory.json_return);
      //     }
      //     PersistenceFactory.interval = setInterval(function(){
      //       PersistenceFactory.editado(PersistenceFactory.get_dataForm(form));
      //     }, PersistenceFactory.intervalTime); /* */
      //   }
      // }, 2000);
      //-- End Peticion de persistencia--//
  }
})();
