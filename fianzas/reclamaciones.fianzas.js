(function() {
    'use strict';

    angular.module('inspinia')
        .controller('FianzasReclamacionesListCtrl', FianzasReclamacionesListCtrl);

    FianzasReclamacionesListCtrl.$inject = ['SweetAlert', 'toaster','$sessionStorage', '$scope', 'FileUploader', 'dataFactory', '$http', 'url', 
                                            '$parse', 'datesFactory', '$localStorage', 'appStates', '$state'];

    function FianzasReclamacionesListCtrl(SweetAlert, toaster, $sessionStorage, $scope, FileUploader, dataFactory, $http, url, $parse, datesFactory,
                                          $localStorage, appStates, $state) {
        var vm = this;

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

        $scope.cur_date = new Date();
        $scope.init_date = datesFactory.convertDate(new Date());
        $scope.end_date = datesFactory.convertDate(new Date());
        vm.email = '';

        $scope.countFile = 0;
        $scope.okFile = 0;
        vm.accesos = $sessionStorage.permisos
        if (vm.accesos) {
          vm.accesos.forEach(function(perm){
            if(perm.model_name == 'Fianzas'){
              vm.acceso_fianzas = perm
              vm.acceso_fianzas.permissions.forEach(function(acc){
                if (acc.permission_name == 'Administrar fianzas') {
                  if (acc.checked == true) {
                    vm.acceso_adm_fia = true
                  }else{
                    vm.acceso_adm_fia = false
                  }
                }else if (acc.permission_name == 'Ver fianzas') {
                  if (acc.checked == true) {
                    vm.acceso_ver_fia = true
                  }else{
                    vm.acceso_ver_fia = false
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

        vm.show_binnacle_claim = false;
        vm.showBinnacle = showBinnacle;
        vm.returnToFianzaR = returnToFianzaR;

        $scope.statuses = [
          {id: 0, name: 'Todos'},
          {id: 1, name: 'Presentación'},
          {id: 2, name: 'Integración'},
          {id: 3, name: 'Reclamo Formal'},
          {id: 4, name: 'Respuesta afianzadora'},
          {id: 5, name: 'Respuesta cliente'},
          {id: 6, name: 'Reconsideración'},
          {id: 7, name: 'Rechazada'},
          {id: 8, name: 'Pagada'},
          {id: 9, name: 'Desistimiento'},
          {id: 10, name: 'Recuperación'},
          {id: 11, name: 'Cerrada'}
        ];

        activate();

        $scope.consultar = function() {
          activate();
        }

        function activate() {
          // dataFactory.get('claims-list')
          $http({
            method: 'GET',
            url: url.IP+'claims-list/',
            params: {
              'status': 0,
              'init_date': datesFactory.toDate($scope.init_date),
              'end_date': datesFactory.toDate($scope.end_date),
            }
          })
          .then(function success(response) {
            $scope.claims = response.data.results;
            
            $scope.search_results = {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            };
            $scope.testPagination('$scope.claims', 'search_results');
            vm.show_pag_search = true;
          })

          if($localStorage.saved_filters_reclamaciones){
            if($localStorage.saved_filters_reclamaciones['id']){
              $scope.statuses.forEach(function(item){
                if(item.id == $localStorage.saved_filters_reclamaciones['id']){
                  $scope.searchStatus = item;
                }
              });
              $scope.init_date = $localStorage.saved_filters_reclamaciones && $localStorage.saved_filters_reclamaciones['init_date'] ? $localStorage.saved_filters_reclamaciones['init_date'] : datesFactory.convertDate(new Date());
              $scope.end_date = $localStorage.saved_filters_reclamaciones && $localStorage.saved_filters_reclamaciones['end_date'] ? $localStorage.saved_filters_reclamaciones['end_date'] : datesFactory.convertDate(new Date());
            }
          }
        }

        $scope.selectSurety = function(item){
          $state.go('fianzas.reclinf', {claimId: item.id});
        };

        $scope.ShowContextMenu = function(name, id){
          $scope.name_for_new_tab = name;
          $scope.id_for_new_tab = id;
          $scope.route_for_new_tab = 'fianzas.reclinf';
        }

        $scope.open_new_tab = function(){
          var existe = false;
          appStates.states.forEach(function(state) {
            if (state.route == $scope.route_for_new_tab && state.id == $scope.id_for_new_tab){
              existe = true;
            }
          });
          if(appStates.states.length > 3){
            SweetAlert.swal("Error", "No se pueden abrir más pestañas.", "error");
          }else{
            if (!existe){
              appStates.states.push(
              { 
                id: $scope.id_for_new_tab, 
                name: $scope.name_for_new_tab, 
                heading: $scope.name_for_new_tab, 
                route: $scope.route_for_new_tab, 
                active: true, 
                isVisible: true, 
                href: $state.href($scope.route_for_new_tab, {claimId: $scope.id_for_new_tab })
              }
              );
              $localStorage.tab_states = appStates.states;
              $localStorage.tab_index = $localStorage.tab_states.length -1;
            }
          }
        }
        

        $scope.change_init_date = function(param){
          $scope.init_date = param;
        }
        
        $scope.change_end_date = function(param){ 
          $scope.end_date = param;

        }
        

        $scope.getStatus = function(param){
          $http({
            method: 'GET',
            url: url.IP+'claims-list/',
            params: {
              'status': param ? param.id : 0,
              'init_date': datesFactory.toDate($scope.init_date),
              'end_date': datesFactory.toDate($scope.end_date),
            }
          })
          .then(function success(response) {
            if (response.data.count == 0){
              toaster.warning("No se encontraron registros");
            }
            $scope.claims = response.data.results;

            
            $scope.search_results = {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            };
            $scope.testPagination('$scope.claims', 'search_results');
            vm.show_pag_search = true;
          })

          $localStorage.saved_filters_reclamaciones = angular.copy(param);
          $localStorage.saved_filters_reclamaciones['status'] = $scope.searchStatus;
          $localStorage.saved_filters_reclamaciones['init_date'] = $scope.init_date;
          $localStorage.saved_filters_reclamaciones['end_date'] = $scope.end_date;
        }

        $scope.makeReport = function(param){
          $http({
            method: 'GET',
            url: url.IP+'claims-list-report/',
            params: {
              'status': param ? param.id : 0,
              'init_date': datesFactory.toDate($scope.init_date),
              'end_date': datesFactory.toDate($scope.end_date),
              'email': vm.email && vm.email.length > 0  ? vm.email : 0
            }
          })
          .then(function success(response) {
            
            if (response.status == 200){
              // Conexión a socket.io
              var socket = io.connect(url.REPORT_SERVICE_NODE_SOCKET);
              // var socket = io.connect("http://127.0.0.1:8080");
              socket.emit('subscribe', response.data);
              // Aquí espera el mensaje que reciba de socketIO cuando el reporte esté listo
              socket.on(response.data, function(url){
                // vm.main.notifications['count']  +=1;
                var notificacion = {
                  'title': 'El reporte solicitado ha sido generado', 
                  'description': url, 
                  'model': 26,
                  'id_reference':0
                }
                dataFactory.post('notificaciones/', notificacion)
                .then(function success(response) {                
                  SweetAlert.swal({
                    title: 'El reporte está listo para descargar',
                    icon: 'success',
                    text: 'Encuentra la liga de descarga en la sección de notificaciones',
                    timer: 5000
                  });
                  socket.disconnect();
                }).catch(function(err) {
                  socket.disconnect();
                })
            });
              toaster.info('Generando...', 'El archivo se está generando, en unos momentos podrá descargarlo, puedes seguir navegando, solo no recargues la página');
            } else {
              toaster.error('Aviso', 'Ha ocurrido un error, intente nuevamente');
            }
          }).catch(function(error) {
            toaster.error('Aviso', 'Ha ocurrido un error, intente nuevamente');
          })
        }

        

        function showBinnacle(param) {
          $http({
            method: 'GET',
            url: url.IP+'comments/',
            params: {
              'model': 21,
            'id_model': param.id
            }
          })
          .then(function(request) {
     
            vm.comments_data_claim = request.data.results;
            vm.comments_config_claim = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            }
          })
          .catch(function(e) {
            console.log('e', e);
          });
          vm.reclamacion_id = param.id;
          vm.show_binnacle_claim = true;

        };
        function returnToFianzaR (){
          vm.show_binnacle_claim = false;
        }
        $scope.status = function(parStatus) {
          switch(parStatus){
            case 1:
              return 'Presentación'
              break;
            case 2:
              return 'En integración'
              break;
            case 3:
              return 'Reclamo Formal'
              break;
            case 4:
              return 'Respuesta afianzadora'
              break;
            case 5:
              return 'Respuesta cliente'
              break;
            case 6:
              return 'Reconsideración'
              break;
            case 7:
              return 'Rechazada'
              break;
            case 8:
              return 'Pagada'
              break;
            case 9:
              return 'Desistimiento'
              break;
            case 10:
              return 'Pendiente'
              break;
            case 11:
              return 'Cerrada'
              break;
          }
        }

        $scope.type = function(parType) {
          switch(parType){
            case 1:
              return 'Aviso Previo'
              break;
            case 2:
              return 'Reclamo Formal'
              break;
            case 3:
              return 'Reconsideración'
              break;
            default:
              return 'Sin tipo'
          }
        }

        /* Alerta success uploadfiles */
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          $scope.okFile++;
          if($scope.okFile == $scope.uploader.queue.length){
            if($scope.checkRegister){
              $scope.registerEndorsement(vm.newEndorsement)
            } else {
              SweetAlert.swal("Hecho", "Se ha creado la reclamación", "success")
            }
          }
        };

        /* Alerta error uploadfiles */
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
          l.stop();
        };

        uploader.onAfterAddingFile = function(fileItem) {
          fileItem.formData.push({
              arch: fileItem._file,
              nombre: fileItem.file.name
          });
          $scope.specialchar = []
          var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-=" 
          var str = fileItem.file.name;    
          for(i = 0; i < specialChars.length;i++){ 
            if(str.indexOf(specialChars[i]) > -1){         
              if (specialChars[i] == "-" || specialChars[i] == " " || specialChars[i] == "_" || specialChars[i] == "#" || specialChars[i] == "(" || specialChars[i] == ")" || specialChars[i] == ":" || specialChars[i] == '"') {
                str=str.replace(/-/g,"");
                fileItem.file.name = fileItem.file.name.replace(/-/g,"");
                str=str.replace(/ /g,"");
                fileItem.file.name = fileItem.file.name.replace(/ /g,"");
                str=str.replace(/_/g,"");
                fileItem.file.name = fileItem.file.name.replace(/_/g,"");
                str=str.replace(/#/g,"");
                fileItem.file.name = fileItem.file.name.replace(/#/g,"");
                str = str.split(')').join('');
                fileItem.file.name = fileItem.file.name.split(')').join('');
                str = str.split('(').join('');
                fileItem.file.name = fileItem.file.name.split('(').join('');
                str = str.split(':').join('');
                fileItem.file.name = fileItem.file.name.split(':').join('');
                str = str.split('"').join('');
                fileItem.file.name = fileItem.file.name.split('"').join('');
              }else{            
                $scope.specialchar.push(specialChars[i])  
              }
            } 
          }
          if ($scope.specialchar.length > 0) {
            $scope.uploader.queue.splice($scope.uploader.queue.indexOf(fileItem),1)
            SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales: '+$scope.specialchar,'error') 
          }
          if(fileItem){
            $scope.countFile++;
          }
        };

        uploader.onBeforeUploadItem = function(item) {
          item.url = $scope.userInfo.url;
          item.formData[0].nombre = item.file.name;
          item.alias = '';
          item.formData[0].owner = $scope.userInfo.id;
        };

        function uploadFiles(endorsementId) {
          $scope.userInfo = {
            id: endorsementId
          };
          $scope.userInfo.url = $scope.uploader.url = url.IP + 'endosos/' + endorsementId + '/archivos/';

          $scope.files = [];

          $timeout(function() {
            $scope.uploader.uploadAll();
          }, 1000);
        }

        $scope.testPagination = function(parModel, parConfig){
          var config_ = $parse(parConfig)($scope);

          if(config_){
            var pages = Math.ceil(config_.count / 10);
          }

          $scope.totalPages = [];
          var count_items = 0;
          var count_pages = 0;

          var previous_array = [];
          var next_array = [];

          $scope.start = 0;
          $scope.end = 5;
          $scope.actual_page = 1;
          $scope.not_prev = true;

          for(var i = 0; i < pages; i++){
            $scope.totalPages.push(i+1);
          }

          $scope.selectPage = function(parPage){
            var url = '';
            if(config_.next || config_.previous){
              if(config_.next) {
                var otherParameters = config_.next.substring(config_.next.indexOf("&page=") + 6);

                url = config_.next.substring(0, config_.next.indexOf("&page=") + 6);
                url += parPage.toString();

                if(config_.next.search('&') !== -1) {
                  var params = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
                  url += '&'+params;
                }

              }else{
                url = '';
                var otherParameters = config_.previous.substring(config_.previous.indexOf("&page=") + 6);

                if(config_.previous.search('&page=') !== -1){
                  url = config_.previous.substring(0, config_.previous.indexOf("&page=") + 6);
                  url += parPage.toString();
                }else{
                  url = config_.previous;
                }

                if(config_.previous.search('&') !== -1) {
                  var params = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
                  url += '&'+params;
                }
              }
            }

            getProviders(url);
            $scope.actual_page = parPage;
            if($scope.actual_page > 1) {
              $scope.not_prev = false;
            }

            if($scope.actual_page == $scope.totalPages.length -1) {
              $scope.not_next = true;
            }
          };

          $scope.previousBlockPages = function(param){
            if(param){
              if($scope.start < $scope.actual_page){
                $scope.start = $scope.start - 1 ;
                $scope.end = $scope.end - 1;
              }
            }else{
              $scope.start = $scope.start - 5 ;
              $scope.end = $scope.end - 5;

              if($scope.end < $scope.totalPages.length){
                 $scope.not_next = false;
              }
            }

            if($scope.end <= 5){
              $scope.start = 0;
              $scope.end = 5;
              $scope.show_prev_block = false;
            }
          };

          $scope.nextBlockPages = function(param){
            $scope.show_prev_block = true;
            if(param) {
              if($scope.end > $scope.actual_page){
                $scope.start = $scope.start + 1 ;
                $scope.end = $scope.end + 1;
              }
            }else{
              if($scope.end < $scope.totalPages.length){
                $scope.start = $scope.start + 5 ;
                $scope.end = $scope.end + 5;

                if($scope.end == $scope.totalPages.length){
                  $scope.not_next = true;
                }
              }else{
                $scope.not_next = true;
              }
            }
          };

          $scope.lastPage = function() {
            if($scope.totalPages.length > 5) {
              $scope.end = $scope.totalPages.length;
              $scope.start = ($scope.totalPages.length) -5;
              $scope.show_prev_block = true;
            }
            $scope.selectPage($scope.totalPages.length);
          };

          function getProviders(parUrl){
            $http.get(parUrl)
            .then(function success(response){
              var source = $parse(parModel);
              source.assign($scope, []);
              source.assign($scope, response.data.results);

              var data = {
                count: response.data.count,
                previous: response.data.previous,
                next: response.data.next
              }

              $scope.claims = response.data.results;

              var config = $parse(parConfig);
                config.assign($scope, []);
                config.assign($scope, data);
              },
            function error(error) {
              console.log('error', error);
            })
            .catch(function(e) {
              console.log('e', e);
            });
          };
        };

    }
})();
