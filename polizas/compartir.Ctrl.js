(function(){
  'use strict';

  angular.module('inspinia')
      .controller('CompartirAppCtrl', CompartirAppCtrl);

  CompartirAppCtrl.$inject = ['$timeout', 'FileUploader', 'providerService', 'dataFactory', 'SweetAlert','$scope','$rootScope','MESSAGES','toaster','endorsementService','insuranceService',
                             'receiptService', '$stateParams', '$state', 'helpers','formService', '$http','url','$uibModal', 'datesFactory',
                             '$q','$localStorage', '$sessionStorage', 'statusReceiptsFactory', '$sce', 'formatValues', 'fileService','emailService', 'appStates'];


  function CompartirAppCtrl($timeout, FileUploader, providerService, dataFactory, SweetAlert, $scope , $rootScope, MESSAGES, toaster, endorsementService, insuranceService,
                          receiptService, $stateParams, $state, helpers, formService, $http, url, $uibModal, datesFactory,  $q,
                          $localStorage, $sessionStorage, statusReceiptsFactory,  $sce, formatValues, fileService, emailService, appStates) {

    /* Información de usuario */
    var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
    /* Uploader files */
    $scope.userInfo = {
        id: 0
    };
    $scope.countFile = 0;
    $scope.okFile = 0;

    var uploader = $scope.uploader = new FileUploader({
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        },
    });

    // uploader.filters.push({
    //     name: 'customFilter',
    //     fn: function(item, options) {
    //         return this.queue.length < 20;
    //     }
    // });


    var vm = this;
    $scope.fechasFilter = false;
    vm.pageTitle = 'Pólizas';
    vm.insurance = {};
    vm.receipts = [];
    vm.search = search;
    vm.polizasContractor = polizasContractor;
    vm.polizaId = $stateParams.polizaId;
    vm.form = {
      since:convertDate(new Date(new Date().setMonth(new Date().getMonth() - 1))),
      until: convertDate(new Date()),
    };
    vm.show = {
      isPolicy: false
    }
    $scope.loader =false;
    vm.addFilter = addFilter;
    vm.accesos = $sessionStorage.permisos
    if (vm.accesos) {
      vm.accesos.forEach(function(perm){
        if(perm.model_name == 'Pólizas'){
          vm.acceso_polizas = perm
          vm.acceso_polizas.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar pólizas') {
              if (acc.checked == true) {
                vm.acceso_adm_pol = true
              }else{
                vm.acceso_adm_pol = false
              }
            }else if (acc.permission_name == 'Ver pólizas') {
              if (acc.checked == true) {
                vm.acceso_ver_pol = true
              }else{
                vm.acceso_ver_pol = false
              }
            }else if (acc.permission_name == 'Cancelar pólizas') {
              if (acc.checked == true) {
                vm.acceso_canc_pol = true
              }else{
                vm.acceso_canc_pol = false
              }
            }else if (acc.permission_name == 'Eliminar pólizas') {
              if (acc.checked == true) {
                vm.acceso_elim_pol = true
              }else{
                vm.acceso_elim_pol = false
              }
            }else if (acc.permission_name == 'Rehabilitar pólizas') {
              if (acc.checked == true) {
                vm.acceso_adm_rehabilitar = true
              }else{
                vm.acceso_adm_rehabilitar = false
              }
            }
          })
        }if(perm.model_name == 'Endosos'){
          $scope.acceso_endosos = perm
          $scope.acceso_endosos.permissions.forEach(function(acc){
            if (acc.permission_name ==  'Registrar endosos') {
              if (acc.checked == true) {
                $scope.acceso_adm_end = true
              }else{
                $scope.acceso_adm_end = false
              }
            }
          })
        }else if (perm.model_name == 'Reportes') {
          vm.acceso_reportes = perm;
          vm.acceso_reportes.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Reporte fianzas') {
              if (acc.checked == true) {
                vm.acceso_rep_fia = true
              }else{
                vm.acceso_rep_fia = false
              }
            }else if (acc.permission_name == 'Reporte Siniestros') {
              if (acc.checked == true) {
                vm.acceso_rep_sin = true
              }else{
                vm.acceso_rep_sin = false
              }
            }else if (acc.permission_name == 'Reporte Endosos') {
              if (acc.checked == true) {
                vm.acceso_rep_end = true
              }else{
                vm.acceso_rep_end = false
              }
            }else if (acc.permission_name == 'Reporte pólizas') {
              if (acc.checked == true) {
                vm.acceso_rep_pol = true
              }else{
                vm.acceso_rep_pol = false
              }
            }else if (acc.permission_name == 'Reporte renovaciones') {
              if (acc.checked == true) {
                vm.acceso_rep_ren = true
              }else{
                vm.acceso_rep_ren = false
              }
            }else if (acc.permission_name == 'Reporte cobranza') {
              if (acc.checked == true) {
                vm.acceso_rep_cob = true
              }else{
                vm.acceso_rep_cob = false
              }
            }
          })
        }else if(perm.model_name == 'Ordenes de trabajo'){
          vm.acceso_ot = perm
          vm.acceso_ot.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar OTs') {
              if (acc.checked == true) {
                vm.acceso_adm_ot = true
              }else{
                vm.acceso_adm_ot = false
              }
            }else if (acc.permission_name == 'Ver OTs') {
              if (acc.checked == true) {
                vm.acceso_ver_ot = true
              }else{
                vm.acceso_ver_ot = false
              }
            }else if (acc.permission_name == 'Cancelar OTs') {
              if (acc.checked == true) {
                vm.acceso_canc_ot = true
              }else{
                vm.acceso_canc_ot = false
              }
            }else if (acc.permission_name == 'Eliminar OTs') {
              if (acc.checked == true) {
                vm.acceso_elim_ot = true
              }else{
                vm.acceso_elim_ot = false
              }
            }
          })
        }else if (perm.model_name == 'Contratantes y grupos') {
          vm.acceso_contg = perm;
          vm.acceso_contg.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Administrar contratantes y grupos') {
              if (acc.checked == true) {
                vm.acceso_adm_cont = true
              }else{
                vm.acceso_adm_cont = false
              }
            }else if (acc.permission_name == 'Ver contratantes y grupos') {
              if (acc.checked == true) {
                vm.acceso_ver_cont = true
              }else{
                vm.acceso_ver_cont = false
              }
            }
          })
        }else if (perm.model_name == 'Siniestros') {
          vm.acceso_sin = perm;
          vm.acceso_sin.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Administrar siniestros') {
              if (acc.checked == true) {
                vm.acceso_adm_sin = true
              }else{
                vm.acceso_adm_sin = false
              }
            }
          })
        }else if (perm.model_name == 'Mensajeria') {
          vm.acceso_mns = perm;
          vm.acceso_mns.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Mensajeria') {
              if (acc.checked == true) {
                vm.acceso_mns = true
              }else{
                vm.acceso_mns = false
              }
            }
          })
        }else if (perm.model_name == 'Formatos') {
          vm.acceso_form = perm;
          vm.acceso_form.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Formatos') {
              if (acc.checked == true) {
                vm.acceso_form = true
              }else{
                vm.acceso_form = false
              }
            }
          })
        }else if (perm.model_name == 'Correos electronicos') {
          vm.acceso_correo = perm;
          vm.acceso_correo.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Correos') {
              if (acc.checked == true) {
                vm.acceso_cor = true
              }else{
                vm.acceso_cor = false
              }
            }
          })
        }else if(perm.model_name == 'Cobranza'){
          vm.acceso_cob = perm
          vm.acceso_cob.permissions.forEach(function(acc){
            if (acc.permission_name == 'Ver cobranza') {
              if (acc.checked == true) {
                vm.acceso_ver_cob = true
              }else{
                vm.acceso_ver_cob = false
              }
            }else if (acc.permission_name == 'Despagar recibos') {
              if (acc.checked == true) {
                vm.acceso_desp_cob = true
              }else{
                vm.acceso_desp_cob = false
              }
            }else if (acc.permission_name == 'Pagar y prorrogar') {
              if (acc.checked == true) {
                vm.acceso_pag_cob = true
              }else{
                vm.acceso_pag_cob = false
              }
            }else if (acc.permission_name == 'Desconciliación de recibos') {
              if (acc.checked == true) {
                vm.acceso_desco_cob = true
              }else{
                vm.acceso_desco_cob = false
              }
            }else if (acc.permission_name == 'Conciliar recibos') {
              if (acc.checked == true) {
                vm.acceso_conc_cob = true
              }else{
                vm.acceso_conc_cob = false
              }
            }else if (acc.permission_name == 'Liquidar recibos') {
              if (acc.checked == true) {
                vm.acceso_liq_cob = true
              }else{
                vm.acceso_liq_cob = false
              }
            }else if (acc.permission_name == 'Eliminar recibos') {
              if (acc.checked == true) {
                vm.acceso_del_cob = true
              }else{
                vm.acceso_del_cob = false
              }
            }else if (acc.permission_name == 'No permitir editar recibos Pagados/Liquidados') {
              if (acc.checked == true) {
                vm.acceso_pl_cob = true //no se editan
              }else{
                vm.acceso_pl_cob = false//se pueden editar pagados-liquidados
              }
            }
          })
        }else if(perm.model_name == 'Referenciadores'){
          vm.acceso_ref = perm
          vm.acceso_ref.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar referenciadores') {
              if (acc.checked == true) {
                vm.acceso_adm_ref = true
              }else{
                vm.acceso_adm_ref = false
              }
            }else if (acc.permission_name == 'Pagar a referenciadores') {
              if (acc.checked == true) {
                vm.acceso_pag_ref = true
              }else{
                vm.acceso_pag_ref = false
              }
            }else if (acc.permission_name == 'Cambiar refrenciador en pólizas') {
              if (acc.checked == true) {
                vm.acceso_chg_ref = true
              }else{
                vm.acceso_chg_ref = false
              }
            }
          })
        }else if(perm.model_name == 'Comisiones'){
          vm.acceso_dash = perm
          vm.acceso_dash.permissions.forEach(function(acc){
            if (acc.permission_name == 'Comisiones') {
              if (acc.checked == true) {
                vm.permiso_comisiones = true
              }else{
                vm.permiso_comisiones = false
              }
            }
          })
        }else if(perm.model_name == 'Archivos'){
          vm.acceso_files = perm
          vm.acceso_files.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar archivos sensibles') {
              if (acc.checked == true) {
                vm.permiso_archivos = true
              }else{
                vm.permiso_archivos = false
              }
            }
          })
        }
      })
    }
    vm.repeat = [];
    $scope.compartidas= false;
    activate();
    // functions
    function addFilter(param) {
      if(param == 1){
        $scope.fechasFilter = true;
        vm.form.dates = 1;
      } else {
        $scope.fechasFilter = false;
        vm.form.dates = 2;
      }
    }
    vm.infoFlag = true;
    function activate() {
      var params = {};
      $scope.addEmail = false
      $scope.addEmail1 = false
      $scope.addEmail2 = false
      $scope.addFiles = false
      params = {
        since: vm.form.since ? vm.form.since : vm.form.si,
        until: vm.form.until ? vm.form.until : vm.form.un,
        inicio_fin: vm.form.inicio_fin,
        dates: vm.form.dates,
        compartidas: $scope.compartidas ? $scope.compartidas : false
      }
      params.since = params.since+ " " + "00:00:00";
      params.until = params.until+ " " + "23:59:59";
      $scope.filtros = params;
      $http({
        method: 'POST',
        url: url.IP + 'get-contractorsList',
        data: $scope.filtros
      })
      .then(
        function success(request) {
          console.log('request',request)
          if((request.status === 200 || request.status === 201)) {
            var data = request.data.data;
            $scope.polizasshare =data;
            console.log('===>>',data)
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
    }
    function search(pkc) {
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      $scope.params = {
        since: vm.form.since ? vm.form.since : vm.form.si,
        until: vm.form.until ? vm.form.until : vm.form.un,
        inicio_fin: vm.form.inicio_fin,
        dates: vm.form.dates,
        pkcontractor: pkc ? pkc.id : 0,
        compartidas: $scope.compartidas ? $scope.compartidas : false
      }
      $scope.params.since = $scope.params.since+ " " + "00:00:00";
      $scope.params.until = $scope.params.until+ " " + "23:59:59";
      $scope.filtros = $scope.params;
      $http({
        method: 'POST',
        url: url.IP + 'get-contractorsList',
        data: $scope.filtros
      })
      .then(
        function success(request) {
          if((request.status === 200 || request.status === 201)) {
            var data = request.data;
            $scope.contractors =data.contratantes;
            console.log('===>>',data)
            l.stop();
          } else {
            toaster.warning("No se encontraron registros");
            l.stop();
          }
        },
        function error(error) {
          l.stop();
        }
      )
      .catch(function(e){
          console.log(e);
          l.stop();
      });
    }
    function polizasContractor(pkc, selector,correo1,correo2,addFiles) {
      $scope.loader = true;
      var l = Ladda.create( document.querySelector( '.ladda-button' ) );
      l.start();
      $scope.params = {
        since: vm.form.since ? vm.form.since : vm.form.si,
        until: vm.form.until ? vm.form.until : vm.form.un,
        inicio_fin: vm.form.inicio_fin,
        dates: vm.form.dates,
        pkcontractor: pkc ? pkc.id : 0,
        compartidas: $scope.compartidas ? $scope.compartidas : false
      }
      $scope.params.since = $scope.params.since+ " " + "00:00:00";
      $scope.params.until = $scope.params.until+ " " + "23:59:59";
      $scope.filtros = $scope.params;
      if (pkc.polizasshare) {
        if ((selector == true || selector ==false) || (correo1 == true || correo1 ==false) || (correo2 == true || correo2 ==false) || (addFiles == true || addFiles ==false)) {
          pkc.polizasshare.forEach(function(con) {
            con[con.id]={principal:selector,correo1:correo1,correo2:correo2,files:addFiles}
          })                
        }
      }
      l.stop();
      $scope.loader = false;
      return pkc;
      // $http({
      //   method: 'POST',
      //   url: url.IP + 'listaPolizasShare',
      //   data: $scope.filtros
      // })
      // .then(
      //   function success(request) {
      //     if((request.status === 200 || request.status === 201) && request.data.data.length) {
      //       var data = request.data.data;
      //       $scope.polizasshare =data;
      //       pkc.polizasshare =data;
      //       if (pkc.polizasshare) {
      //         if ((selector == true || selector ==false) || (correo1 == true || correo1 ==false) || (correo2 == true || correo2 ==false) || (addFiles == true || addFiles ==false)) {
      //           pkc.polizasshare.forEach(function(con) {
      //             con[con.id]={principal:selector,correo1:correo1,correo2:correo2,files:addFiles}
      //           })                
      //         }
      //         // if (correo1 == true || correo1 ==false) {
      //         //   pkc.polizasshare.forEach(function(con) {
      //         //     con[con.id]={correo1:correo1}
      //         //   })                
      //         // }
      //         // if (correo2 == true || correo2 ==false) {
      //         //   pkc.polizasshare.forEach(function(con) {
      //         //     con[con.id]={correo2:correo2}
      //         //   })                
      //         // }
      //         // if (addFiles == true || addFiles ==false) {
      //         //   pkc.polizasshare.forEach(function(con) {
      //         //     con[con.id]={files:addFiles}
      //         //   })                
      //         // }
      //       }
      //       l.stop();
      //       return pkc;
      //     } else {
      //       toaster.warning("No se encontraron registros");
      //       l.stop();
      //     }
      //   },
      //   function error(error) {
      //     l.stop();
      //   }
      // )
      // .catch(function(e){
      //     console.log(e);
      //     l.stop();
      // });
    }

    $scope.dataShare=[];
    $scope.sharetoemail = function(poliza, sh, nu){      
      if (poliza) {
        $scope.contractors.forEach(function(contrac,index) {  
          if (contrac.id == poliza.contractor.id) { 
            sh.id = poliza.id 
            $scope.dataShare.push(sh)    
          }  
        })
      }else{
      }
    }
    $scope.shareToPrincipal = function(poliza, addEmail,addEmail1,addEmail2,addFiles){  
      $scope.addEmail = addEmail
      $scope.addEmail1 = addEmail1
      $scope.addEmail2 = addEmail2
      $scope.addFiles = addFiles
      $scope.loader = true;
      if (poliza) {
        poliza.forEach(function(contrac,index) {    
          if (contrac.polizasshare) {
            if ((addEmail == true || addEmail ==false) || (addEmail1 == true || addEmail1 ==false) || (addEmail2 == true || addEmail2 ==false) || (addFiles == true || addFiles ==false)) {
              contrac.polizasshare.forEach(function(con) {
                con[con.id]={principal:addEmail,correo1:addEmail1,correo2:addEmail2,files:addFiles}
              })                
            }
          }
        })
        $scope.loader = false; 
      }else{
        $scope.loader = false; 
      }
    }
    function convertDate(inputFormat) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    }
    $scope.dataShare = []
    $scope.compartir_app = function(polizas){
      var l = Ladda.create( document.querySelector( '.ladda-button2' ) );
      l.start()
      try{
        polizas.forEach(function(index,contrac) {
          if (index.polizasshare) {
            index.polizasshare.forEach(function(x,pl) {
              x[x.id].id = x.id
              if($scope.dataShare){
                $scope.dataShare.push(x[x.id])
              }
            });
          }
        });  
      }catch(e){
        console.log('-eeeroror--',e)
        l.stop();
      }
      console.log('s.sssssss',$scope.dataShare)
      if ($scope.dataShare) {
        $scope.filtros.polizas= $scope.dataShare;
        $http({
          method: 'POST',
          url: url.IP + 'compartir-a-app/',
          data: $scope.filtros
        })
        .then(
          function success(request) {
            if((request.status === 200 || request.status === 201)) {
              var data = request.data.data;
              $scope.contractors = [];
              SweetAlert.swal("¡Listo!","Las pólizas han sido compartidas", "success");
              l.stop();
            } else {
              toaster.warning("No se encontraron registros");
              l.stop();
            }
          },
          function error(error) {
            l.stop();
          }
        )
        .catch(function(e){
            console.log(e);
            l.stop();
        });
      }
    }
    function toDate(dateStr) {
      var dateString = dateStr; // Oct 23
      var dateParts = dateString.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

      return dateObject;
    }

    function mesDiaAnio (parDate) {
      var d = new Date(toDate(parDate));
      var date = (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
      return date;
    }
  }
})();
