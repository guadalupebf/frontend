(function() {
    'use strict';

    angular.module('inspinia')
        .controller('TareasCtrl', TareasCtrl);

    TareasCtrl.$inject = ['$stateParams', 'SweetAlert', 'MESSAGES', '$scope', '$uibModal', 'dataFactory', '$http', 'url',
    '$localStorage', 'toaster', '$parse', 'datesFactory', '$sessionStorage', 'FileUploader', 'appStates','$state'];

    function TareasCtrl($stateParams, SweetAlert, MESSAGES, $scope, $uibModal, dataFactory, $http, url, $localStorage, toaster,
      $parse, datesFactory, $sessionStorage, FileUploader, appStates,$state) {

        /* Información de usuario */
        var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);

        /* Información de usuario */
        $scope.infoUser = $sessionStorage.infoUser;

        $('.js-example-basic-multiple').select2();
        $('.datepicker-me input').datepicker();

        $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
        $.fn.datepicker.defaults.startView = 0;
        $.fn.datepicker.defaults.autoclose = true;
        $.fn.datepicker.defaults.language = 'es';
        $scope.historic_email = false;

        var vm = this;

        $scope.show = []
        vm.comments_data = []
        vm.createTask = createTask;
        vm.main_comming = $stateParams.main_comming;
        $scope.disabledButton = false;
        $scope.show_pag_task = false;
        vm.createRecordatorio = createRecordatorio;
        $scope.items = [];
        vm.showRecordatorios = showRecordatorios;
        $scope.fechahoy=false
        $scope.concepts = [
          {
            id: 1,
            name: 'Cotización'
          }, {
            id: 2,
            name: 'Emisión'
          }, {
            id: 4,
            name: 'Corrección'
          }, {
            id: 5,
            name: 'Cancelación'
          }, {
            id: 6,
            name: 'Renovación'
          }, {
            id: 7,
            name: 'Otro'
          }, {
            id: 8,
            name: 'Reembolso'
          }, {
            id: 9,
            name: 'Programación de cirugía'
          }, {
            id: 3,
            name: 'Endoso A'
          }, {
            id: 10,
            name: 'Endoso B'
          }, {
            id: 11,
            name: 'Endoso D'
          }, {
            id: 12,
            name: 'Reconocimiento de antigüedad'
          },{
            id:13,
            name:'Carta de antigüedad'
          }
        ];

        $scope.priorities = [
          {
            id: 1,
            name: 'Alta'
          }, {
            id: 2,
            name: 'Media'
          }, {
            id: 3,
            name: 'Baja'
          }
        ];

        $scope.statusTask = [
          {
            id: 4,
            name: 'Completado/Cerrada'
          }, {
            id: 8,
            name: 'Archivado'
          },{
            id: 11,
            name: 'Abiertas'
          }
        ];

        $scope.seeTask = [
          {
            id: 0,
            name: 'Todas'
          }, {
            id: 5,
            name: 'Mis tareas'
          }, {
            id: 6,
            name: 'Creadas'
          }
          // , {
          //   id: 10,
          //   name: 'Abiertas'
          // }
        ];
        vm.form = {
          priority: 0,
          closed: 0,
          created: 0,
          assigned: '',
          chain: 0,
          archived: 0,
          order : 3,
          asc: 0,
          status: 0,
          ver: 0,
          assigned_url:null,
          priority_int:null
        }

        $scope.involved = [];
        $scope.conceptTicket = function (obj) {
          switch (obj) {
            case 1:
              return 'Cotización';
            case 2:
              return 'Emisión';
            case 4:
              return 'Corrección';
            case 5:
              return 'Cancelación';
            case 6:
              return 'Renovación';
            case 7:
              return 'Otro';
            case 8:
              return 'Reembolso';
            case 9:
              return 'Programación de cirugía';
            case 3:
              return 'Endoso A';
            case 10:
              return 'Endoso B';
            case 11:
              return 'Endoso D';
            case 12:
              return 'Reconocimiento de antigüedad';
            case 13:
              return 'Carta de antigüedad';
            default:
              return 'Otro';
          }
        };

        $scope.selectUser = function (obj){
            $scope.involved = [];
            obj.forEach(function(child) {
                child.person = child.url;
            })
            $scope.involved = obj;
        }
        $scope.addTaskOK = function (obj){
          $scope.select_user = [];
          // $scope.$evalAsync(function () {
          //   $('#select_user').val(null).trigger('change');
          // });
          $scope.involvedUser = [];
          $scope.select_user=[];
          $scope.involved = [];
          $scope.uploader.queue = [];
          vm.form={            
            priority: 0,
            closed: 0,
            created: 0,
            assigned: '',
            chain: 0,
            archived: 0,
            order : 3,
            asc: 0,
            status: 0,
            ver: 0,
            assigned_url:null,
            priority_int:null
          }
          $('.js-example-basic-multiple2').select2();
          $scope.show_task = true; 
        }
        $scope.saveTask = function (){
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          var data_to_send = vm.form; 
          data_to_send.involved_task = $scope.involved
          data_to_send.assigned = vm.form.assigned_url;
          data_to_send.priority = vm.form.priority_int ? vm.form.priority_int : 1;
          data_to_send.concept = vm.form.concept ? vm.form.concept : 7;
          data_to_send.date = new Date(datesFactory.toDate(vm.form.compromiso));
          data_to_send.associated = null;
          data_to_send.route = null;
          data_to_send.model = null;
          dataFactory.post('save-ticket/', data_to_send).
          then(function success(response) {
            if(response.status === 200 || response.status === 201){
              $scope.involved=[];
              var params = {
                'model': 22,
                'event': "POST",
                'associated_id': response.data.id,
                'identifier': "creó la tarea."
              }
              $localStorage.saved_created_tareas = {}
              dataFactory.post('send-log/', params).then(function success(response) {
                l.stop()
              });
              $('.js-example-basic-multiple2').select2();
              uploadFiles(response.data);
              SweetAlert.swal("¡Hecho!", MESSAGES.OK.SAVETICKET, "success");
              $scope.show_task = false;
            }
          })
          .catch(function(e) {
            l.stop()
            console.log('e', e);
          }); 
        };
        function showRecordatorios() {
          vm.infoFlag = false;
          vm.recordatoriosFlag = true;
        }
        function createRecordatorio(registroSelected, tipo) {
          var insurance = registroSelected
          var modalInstance = $uibModal.open({
            templateUrl: 'app/recordatorios/desde-registro/desderegistro.modal.html',
            controller: 'RecordatorioRegistroCtrl',
            size: 'lg',
            resolve: {
              poliza: function() {
                return registroSelected;
              },
              tipoRegistro: function() {
                return tipo;
              },
              from: function(){
                return null;
              },
              parent: function(){
                return vm.insurance;
              }
            },
          backdrop: 'static', /* this prevent user interaction with the background */
          keyboard: false
          });
          modalInstance.result.then(function(receipt) {
            activate()
          });
        }
        $scope.goToRecordatorio = function (rec) {
          if (rec.recordatorio) {
            $scope.name_for_new_tab = 'Recordatorio desde registro';
            $scope.route_for_new_tab = 'recordatorios.desde_registro_show';
            var params = {id: rec.recordatorio.id}
          }
          var existe = false;
          if (name && route){
            $scope.route_for_new_tab = route;
            $scope.name_for_new_tab = name;
            appStates.states.forEach(function(state) {
              if (state.route == $scope.route_for_new_tab){
                existe = true;
              }
            });
          }

          if (!existe){
            var active_tab = appStates.states.findIndex(function(item){
              if (item.active){
                return true
              }
              return false;
            });
            
            appStates.states[active_tab] = { 
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab,params),
            }
          }
          $localStorage.tab_states = appStates.states;
          $state.go($scope.route_for_new_tab, params); 
        }
        /* Uploader files */

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
        // ALERTA SUCCES UPLOADFILES
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          $scope.okFile++;
          if($scope.okFile == $scope.countFile){
          }
        };

        // ALERTA ERROR UPLOADFILES
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          if(response.status == 413){
            SweetAlert.swal("ERROR", MESSAGES.ERROR.FILETOOLARGE, "error");
          } else {
            SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
          }
        };

        uploader.onAfterAddingFile = function(fileItem) {
          fileItem.formData.push({
            arch: fileItem._file,
            nombre: fileItem.file.name
          });

          if(fileItem){
            $scope.countFile++;
          }
        };

        uploader.onBeforeUploadItem = function(item) {
            if (item.ramo == undefined){
                item.ramo = 2;
            }
            item.url = $scope.userInfo.url;
            item.formData[0].nombre = item.file.name;
            item.alias = '';
            item.formData[0].owner = $scope.userInfo.id;
            item.formData[0].ramo = item.ramo;
        };

        function uploadFiles(ticketId) {
          console.log(ticketId);
          $scope.userInfo = {
            id: ticketId.id
          };
          $scope.userInfo.url = url.IP + 'ticket/' + ticketId.id+ '/archivos/';
          $scope.uploader.uploadAll();
          $('.js-example-basic-multiple2').select2();
          activate();
        }

        $scope.changeSensible = function(sensible, index) {
            uploader.queue[index].formData[0].sensible = sensible;
            console.log(uploader.queue);
        }

        $scope.saveFile = function(file) {
          $http.patch(file.url,{'nombre':file.nombre, 'sensible':file.sensible});
        }
        $('.js-example-basic-multiple2').select2();
        activate();
        function activate() {          
          $('.js-example-basic-multiple2').select2();
            vm.id_task = $stateParams.id_task;
            $scope.params = {
                priority: 0,
                closed: 0,
                created: 0,
                assigned: 0,
                chain: 0,
                archived: 0,
                order : 3,
                asc: 0,
                status: 0,
                ver: 0,
            }
            if($scope.params.status ==0){            
              $scope.params.status =11
            }
            if(vm.main_comming){
              dataFactory.get('ticket/'+vm.id_task)
              .then(function success(response) {
                  $scope.ticket = response.data;
                  $scope.tickets = [$scope.ticket];
                  $scope.openModal($scope.ticket)
                  $scope.show_pag_task = false;
                  $scope.ticket.involved_task.forEach(function(item){
                    $http.get(item.person)
                    .then(function success(respo) {
                        item.person = respo.data;
                        item.person_info = respo.data;
                    });
                  });
              });
            }
            else{
              dataFactory.get('get-ticket/', $scope.params)
              .then(function success(response) {
                if (response.data) {
                  $scope.tickets = response.data.results;

                  $scope.tareas_config = {
                    count: response.data.count,
                    previous: url.IP + 'get-ticket/',
                    next: url.IP + 'get-ticket/'
                  };

                  $scope.tickets.forEach(function(child) {
                    if(!$localStorage[child.owner.username]){
                    $http({
                          method: 'GET',
                          url: url.IP_CAS+'get-user-picture/' + child.owner.username
                        })
                        .then(function (request) {
                          if(request.status === 200) {
                            child.image = request.data.url;
                            $localStorage[child.owner.username] = request.data.url;
                          }
                        })
                        .catch(function(e) {
                          console.log('e', e);
                        });
                    } else {
                        child.image = $localStorage[child.owner.username];
                    }
                  });
                  $scope.show_pag_task = true;
                  testPagination('tickets', 'tareas_config');
                }
              });
              if(vm.id_task == -1){
                $scope.show_task = true;
              }
            }

          $scope.users = [];
          $scope.involvedUser = [];

          dataFactory.get('usuarios/').then(function(data){
            data.data.results.forEach(function(usr) {
              if(usr.user_info.is_active) {
                $scope.users.push(usr);
                $scope.involvedUser.push(usr);
              }
            }); 
          });

          vm.form.priority = $localStorage.saved_filters_tareas && $localStorage.saved_filters_tareas['priority'] ? $localStorage.saved_filters_tareas['priority'] : 0;
          vm.form.status = $localStorage.saved_filters_tareas && $localStorage.saved_filters_tareas['status'] ? $localStorage.saved_filters_tareas['status'] : 0;
          vm.form.ver = $localStorage.saved_filters_tareas && $localStorage.saved_filters_tareas['ver'] ? $localStorage.saved_filters_tareas['ver'] : 0;
          if(vm.form.status ==0){            
            vm.form.status = {"id": 11,"name": "Abiertas"}
          }
        }

        $scope.exportToExcel = function(task,fechahoy) {
            if (task.length > 0) {
              $scope.params.status = vm.form.status ? vm.form.status.id : 0;
              $scope.params.priority = vm.form.priority ? vm.form.priority.id : 0;
              $scope.params.ver = vm.form.ver ? vm.form.ver.id : 0;
              $scope.params.fechahoy = $scope.fechahoy ? $scope.fechahoy: false;
                $http({
                  method: 'POST',
                  // url: url.IP +'reporte-task' ,
                  url: url.IP + 'service_reporte-taskReport-excel',
                  data: $scope.params,
                  headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"},
                  responseType: "arraybuffer"})
                .then(function(data, status, headers, config) {
                  if(data.status == 200){
                    var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                    saveAs(blob, 'Tasks.xls');
                  } else {
                    toaster.error("Error", "Ha ocurrido un error al descargar el reporte", "error")
                  }
                });
            }
        }
        $scope.createOT = function(ticket){
          // definir tipo de ot
          var modalInstance = $uibModal.open({
        	  templateUrl: 'app/tasks/task.createot.modal.html',
        	  controller: 'TareasCrearOTModalController',
        	  size: 'lg',
        	  resolve: {
        	    task: function() {
        	      return ticket;
        	    },
                data: function() {
                  return null;
                },
                associated: function() {
                  return null;
                },
                receipt: function() {
                  return null;
                },
                route: function() {
                  return null;
                },
                modelo: function() {
                  return null;
                }
        	  }
        	});
          modalInstance.result
           .then(function (response) {
            // $scope.tickets.some(function(tiket,index) {
            //   if (tiket.id == response.response.data.id){
            //     $scope.tickets[index].archived = response.response.data.archived;
            //     $scope.tickets[index].up_date = 0;
            //     return
            //   }
            // })
           }, function () {
            console.info('modal closed');
          });
        }
        $scope.irOT= function(tarea){
          var params={}
          if(tarea.ot_model==1){
            // póliza emisión
            dataFactory.get('polizas/' + tarea.ot_id_reference ).then(function success(response) {
              var registro = response.data
              if(registro.document_type==1){
                var name = 'Información póliza';
                var route = 'polizas.info';
                params = {
                  polizaId: tarea.ot_id_reference
                }
                $scope.redirigir(name,route,params)
              }
              if(registro.document_type==3){
                var name = 'Información colectividad'
                var route = 'colectividades.info';
                params = {
                  polizaId: tarea.ot_id_reference
                }
                $scope.redirigir(name,route,params)
              } 
              if(registro.document_type==11){
                var name = 'Información flotilla';
                var route = 'flotillas.info';
                params = {
                  polizaId: tarea.ot_id_reference
                }
                $scope.redirigir(name,route,params)
              }
            })
            .catch(function(e) {
                console.log('e', e);
            });   
          }
          if(tarea.ot_model==2){
            // endoso obteer y sacar doc
            dataFactory.get('endorsement-info/' + tarea.ot_id_reference ).then(function success(response) {
              var registro = response.data
              if(registro.document_type == 7 || registro.document_type == 8){
                var name = 'Informacion Endoso';
                var route = 'endorsement.details';
              }
              else{
                var name = 'Informacion Endoso';
                var route = 'endorsement.info';
              }
              params = { 'endosoId': tarea.ot_id_reference }
              $scope.redirigir(name,route,params)
            })
            .catch(function(e) {
                console.log('e', e);
            }); 
          }
          if(tarea.ot_model==3){
            // cotizacion
            var name = 'Información Cotización';
            var route = 'cotizacion.info';
            var params = {id: tarea.ot_id_reference}
            $scope.redirigir(name,route,params)
          }
        }
        $scope.redirigir= function(name,route,params){
          $scope.name_for_new_tab = name;
          $scope.route_for_new_tab = route;
          var existe = false;
          if (name && route){
            $scope.route_for_new_tab = route;
            $scope.name_for_new_tab = name;
            appStates.states.forEach(function(state) {
              if (state.route == $scope.route_for_new_tab){
                existe = true;
              }
            });
          }

          if (!existe){
            var active_tab = appStates.states.findIndex(function(item){
              if (item.active){
                return true
              }
              return false;
            });
            
            appStates.states[active_tab] = { 
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab,params),
            }
          }
          $localStorage.tab_states = appStates.states;
          $localStorage.tab_index = $localStorage.tab_states.length -1;
          $state.go(route, params)
        }
        $scope.openModal = function(task) {
        	 var modalInstance = $uibModal.open({
        	  templateUrl: 'app/tasks/task.modal.html',
        	  controller: 'TareasModalCtrl',
        	  size: 'lg',
        	  resolve: {
        	    task: function() {
        	      return task;
        	    },
                data: function() {
                  return null;
                },
                associated: function() {
                  return null;
                },
                receipt: function() {
                  return null;
                },
                route: function() {
                  return null;
                },
                modelo: function() {
                  return null;
                }
        	  }
        	});
          modalInstance.result
           .then(function (response) {
            $scope.tickets.some(function(tiket,index) {
              try{
                if (response && tiket.id == response.response.data.id){
                  $scope.tickets[index].archived = response.response.data.archived;
                  $scope.tickets[index].up_date = 0;
                  return
                }
              }catch(r){
                console.log('r',r)
              }
            })
            // $scope.tickets[$scope.tickets.indexOf(task)].archived = response.response.archived
            // console.log($scope.tickets[$scope.tickets.indexOf(task)].archived)
           }, function () {
            //close callback
            console.info('modal closed');
          });
        }
        // orden de columnastask_titulo
        vm.changeColumns = changeColumns;
        function changeColumns(par, asc) {
          switch(par) {
            case 1:
              $scope.getTickets($scope.param_ticket,$scope.chain_ticket,par,asc,$scope.fechahoy);
              vm.task_folio = asc;
              vm.task_titulo = 0;
              vm.task_fecha = 0;
              vm.task_prioridad = 0;
              vm.task_usuario = 0;
              vm.task_owner = 0;
              break;
            case 2:
              $scope.getTickets($scope.param_ticket,$scope.chain_ticket,par,asc,$scope.fechahoy);
              vm.task_folio = 0;
              vm.task_titulo = asc;
              vm.task_fecha = 0;
              vm.task_prioridad = 0;
              vm.task_usuario = 0;
              vm.task_owner = 0;
              break;
            case 3:
              $scope.getTickets($scope.param_ticket,$scope.chain_ticket, par,asc,$scope.fechahoy);
              vm.task_folio = 0;
              vm.task_titulo = 0;
              vm.task_fecha = asc;
              vm.task_prioridad = 0;
              vm.task_usuario = 0;
              vm.task_owner = 0;
              break;
            case 4:
              $scope.getTickets($scope.param_ticket,$scope.chain_ticket, par,asc,$scope.fechahoy);
              vm.task_folio = 0;
              vm.task_titulo = 0;
              vm.task_fecha = 0;
              vm.task_prioridad = asc;
              vm.task_usuario = 0;
              vm.task_owner = 0;
              break;
            case 5:
              $scope.getTickets($scope.param_ticket,$scope.chain_ticket, par,asc,$scope.fechahoy);
              vm.task_folio = 0;
              vm.task_titulo = 0;
              vm.task_fecha = 0;
              vm.task_prioridad = 0;
              vm.task_usuario = asc;
              vm.task_owner = 0;
              break;
            case 6:
              $scope.getTickets($scope.param_ticket,$scope.chain_ticket, par,asc,$scope.fechahoy);
              vm.task_folio = 0;
              vm.task_titulo = 0;
              vm.task_fecha = 0;
              vm.task_prioridad = 0;
              vm.task_usuario = 0;
              vm.task_owner = asc;
              break;
            }
        }
        function createTask(argument) {
            vm.main_comming = false;
            $scope.openModal();
        }

        $scope.getAllTickets = function(argument) {
            vm.main_comming = false;
            $scope.items = [];
            activate();
        }

        $scope.archiveTask = function(task) {
            swal({
              title: "¿Estás seguro?",
              text: "¿Desea archivar la tarea?",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Si",
              cancelButtonText: "Cancelar",
              closeOnConfirm: false,
              closeOnCancel: false
            },
            function(isConfirm) {
              if (isConfirm) {
                vm.main_comming = false;
                $http.patch(task.url, {archived: true}).then(function(response){
                  if(response.status === 200 || response.status === 201){
                    $scope.tickets.splice($scope.tickets.indexOf(task), 1);
                    var params = {
                      'model': 22,
                      'event': "POST",
                      'associated_id': task.id,
                      'identifier': "archivó la tarea."
                    }

                    dataFactory.post('send-log/', params).then(function success(response) {

                    });

                    SweetAlert.swal("¡Listo!", MESSAGES.INFO.QUOTATIONCHANGE, "success");
                    // swal.close();
                  }
                });
              } else {
                SweetAlert.swal("Cancelado", MESSAGES.INFO.CANCELCONTRACTOR, "error");
              }
            });
        };

        $scope.openTask = function(task) {
          $scope.tickets = [];
          $scope.show_pag_task = false;
          swal({
            title: "¿Estás seguro?",
            text: "¿Desea abrir la tarea?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si",
            cancelButtonText: "Cancelar",
            closeOnConfirm: true,
            closeOnCancel: false
          },
          function(isConfirm) {
            if (isConfirm) {
              vm.main_comming = false;
              $http.patch(task.url, {closed: false}).then(function(response){
                if(response.status === 200 || response.status === 201){
                  // $scope.tickets.splice($scope.tickets.indexOf(task), 1);
                  var params = {
                    'model': 22,
                    'event': "POST",
                    'associated_id': task.id,
                    'identifier': "abrió la tarea."
                  }
                  dataFactory.post('send-log/', params).then(function success(response) {
                  });
                  SweetAlert.swal("¡Listo!", MESSAGES.INFO.QUOTATIONCHANGE, "success");
                  activate();
                  // swal.close();
                  $scope.closeComment();
                }
              });
            } else {
              SweetAlert.swal("Cancelado", MESSAGES.INFO.CANCELCONTRACTOR, "error");
            }
          });
        };

        $scope.show_comment = false;
        $scope.Complete = function(radio, index) {
          $scope.tickets = [];
          $scope.show_pag_task = false;
          if($scope.infoUser.username != radio.owner.username){
            if($scope.infoUser.username != radio.assigned.username){
              SweetAlert.swal("Error", "No puedes realizar esta acción, no tienes vínculos con la tarea.", "error");
              return;
            } else{
              $scope.show_comment = true;
              $scope.radio = radio;
              vm.main_comming = false;
              if(!radio.closed){
                vm.comments_data = []
                if($scope.show[index]){
                    $scope.show[index] = false
                } else {
                    $scope.show = []
                    $scope.show[index] = true;
                }
                vm.polizaId = radio.id;
              } else {
                toaster.info("Esta tarea ya ha sido completada")
              }
            }
          } else{
            $scope.show_comment = true;
            $scope.radio = radio;
            vm.main_comming = false;
            if(!radio.closed){
              vm.comments_data = []
              if($scope.show[index]){
                  $scope.show[index] = false
              } else {
                  $scope.show = []
                  $scope.show[index] = true;
              }
              vm.polizaId = radio.id;
            } else {
              toaster.info("Esta tarea ya ha sido completada")
            }
            // activate();
          }
        };

        $scope.closeComment = function(){
          $scope.tickets = [];
          $scope.show_pag_task = false;
          $scope.show_comment = false;
          activate();
        };

        $scope.getTickets = function(param, chain, order, asc,fechahoy) {
          $scope.fechahoy=fechahoy
          var aux_users = [];
          if ($scope.selected_user && $scope.selected_user.length > 0){
            aux_users = $scope.selected_user.map(function(user) {
              user = user.id;
              return user
            })
          } else {
            aux_users = 0
          }
          

          $scope.items = [];
            vm.main_comming = false;
            $scope.disabledButton = false;
            $scope.params = {
                priority: 0,
                closed: 0,
                created: 0,
                assigned: 0,
                chain: 0,
                archived: 0,
                fechahoy:fechahoy
            }

            if(param == 0){
              $scope.getAllTickets();
              return;
            }
             else if(param == 1){
                $scope.params.priority = 1;
            } else if(param == 2){
                $scope.params.priority = 2;
            } else if(param == 3){
                $scope.params.priority = 3;
            } else if(param == 4){
                $scope.params.closed = 1;
                $scope.disabledButton = true;
            } else if(param == 5){
                $scope.params.assigned = 1;
            } else if(param == 6){
                $scope.params.created = 1;
            } else if(param == 8){
                $scope.params.archived = 1;
            }

            if(param == 7){
                $scope.params.chain = chain;
                $scope.params.priority = 0
            }
            $scope.param_ticket = param;
            $scope.chain_ticket = $scope.params.chain;
            $scope.order = order;
            $scope.asc = asc;
            $scope.params.order = order ? order : 3;
            $scope.params.asc = asc ? asc : 0;
            $scope.params.status = vm.form.status ? vm.form.status.id : 0;
            $scope.params.priority = vm.form.priority ? vm.form.priority.id : 0;
            $scope.params.ver = vm.form.ver ? vm.form.ver.id : 0;
            $scope.params.users = aux_users;
            $scope.params.fechahoy = fechahoy;

            dataFactory.get('get-ticket/', $scope.params)
            .then(function success(response) {
                $scope.tickets = response.data.results;
                $scope.ticketsResult = response.data;

                $scope.tareas_config = {
                  count: response.data.count,
                  previous: url.IP + 'get-ticket/',
                  next: url.IP + 'get-ticket/'
                };
                $scope.show_pag_task = true;
                testPagination('insurances', 'tareas_config');

                $scope.tickets.forEach(function(child) {
                    if(!$localStorage[child.owner.username]){
                        $http({
                             method: 'GET',
                             url: url.IP_CAS+'get-user-picture/' + child.owner.username
                           })
                           .then(function (request) {
                             if(request.status === 200) {
                               child.image = request.data.url;
                               $localStorage[child.owner.username] = request.data.url;
                             }
                           })
                           .catch(function(e) {
                             console.log('e', e);
                           });
                    } else {
                        child.image = $localStorage[child.owner.username];
                    }
                 })
            })

            $localStorage.saved_filters_tareas = angular.copy($scope.params);
            $localStorage.saved_filters_tareas['priority'] = vm.form.priority;
            $localStorage.saved_filters_tareas['status'] = vm.form.status;
            $localStorage.saved_filters_tareas['ver'] = vm.form.ver;

        }

        $scope.getLog = function(ticket) {
          dataFactory.get('get-specific-log', {'model': 22, 'associated_id': ticket.id})
          .then(function success(response) {
            var modalInstance = $uibModal.open({ //jshint ignore:line
              templateUrl: 'app/cobranzas/log.modal.html',
              controller: 'LogCtrl',
              size: 'lg',
              resolve: {
                log: function() {
                  return response.data;
                }
              },
              backdrop: 'static', /* this prevent user interaction with the background */
              keyboard: false
            });
            modalInstance.result.then(function(receipt) {
              vm.receipts.splice(index, 1);
              activate();
            });
          })
        };


        // If asigned --> involved
        // vm.changeAssigned = changeAssigned;
        // function changeAssigned(assigned) {
        //   angular.element(document).ready(function(){
        //     $('.js-example-basic-multiple').select2({select_user: []});
        //   });
        //   $scope.involvedUserFin = [];
        //   $scope.invLook = false;
        //   if (assigned) {
        //     $scope.users.forEach(function(child, index){
        //       if (child.id != assigned.id) {               
        //         $scope.involvedUserFin.push(child)
        //         $scope.invLook = true;
        //       }
        //     })
        //   }else{
        //     $scope.involvedUserFin = [];    
        //   }
        //   $scope.select_user = [];
        // }
        // 
        vm.saveLocalstorange = saveLocalstorange;
        function saveLocalstorange(assigned) {
          $localStorage.saved_created_tareas = {}
        };

        // -----------PAGINACIÓN
        function testPagination(parModel, parConfig) {
          var config_ = $parse(parConfig)($scope);
          if(config_) {
            var pages = Math.ceil(config_.count / 10);
          }
          $scope.totalPages = [];
          var count_items = 0;
          var count_pages = 0;

          var previous_array = [];
          var next_array = [];

          $scope.start = 0;
          $scope.end = 5;
          // $scope.actual_page = 1;
          $scope.not_prev = true;

          for (var i = 0; i < pages; i++) {
            $scope.totalPages.push(i+1);
          }

          $scope.lastPage = function() {
            if($scope.totalPages.length > 5) {
              $scope.end = $scope.totalPages.length;
              $scope.start = ($scope.totalPages.length) -5;
              $scope.show_prev_block = true;
            }
            $scope.selectPage($scope.totalPages.length);
          }

          $scope.selectPage = function (parPage) {
            $scope.actual_page = parPage;

            $scope.params.page = parPage

            dataFactory.get('get-ticket/', $scope.params)
            .then(function success(response) {
                $scope.tickets = response.data.results;

                $scope.tareas_config = {
                  count: response.data.count,
                  previous: url.IP + 'get-ticket/',
                  next: url.IP + 'get-ticket/'
                };
                $scope.show_pag_task = true;
                testPagination('tickets', 'tareas_config');

                $scope.tickets.forEach(function(child) {
                   if(!$localStorage[child.owner.username]){
                    $http({
                         method: 'GET',
                         url: url.IP_CAS+'get-user-picture/' + child.owner.username
                       })
                       .then(function (request) {
                         if(request.status === 200) {
                           child.image = request.data.url;
                           $localStorage[child.owner.username] = request.data.url;
                         }
                       })
                       .catch(function(e) {
                         console.log('e', e);
                       });
                   } else {
                       child.image = $localStorage[child.owner.username];
                   }
                 });
            });
          };

          $scope.previousBlockPages = function(param) {
            if(param) {
              if($scope.start < $scope.actual_page) {
                $scope.start = $scope.start - 1 ;
                $scope.end = $scope.end - 1;
              }

            } else {
              $scope.start = $scope.start - 5 ;
              $scope.end = $scope.end - 5;

              if($scope.end < $scope.totalPages.length) {
                  $scope.not_next = false;
              }
            }

            if($scope.end <= 5) {
              $scope.start = 0;
              $scope.end = 5;
              $scope.show_prev_block = false;
            }
          }

          $scope.nextBlockPages = function(param) {
            $scope.show_prev_block = true;

            if(param) {
              if($scope.end > $scope.actual_page) {
                $scope.start = $scope.start + 1 ;
                $scope.end = $scope.end + 1;
              }
            } else {
              if($scope.end < $scope.totalPages.length) {
                $scope.start = $scope.start + 5 ;
                $scope.end = $scope.end + 5;

                if($scope.end == $scope.totalPages.length) {
                    $scope.not_next = true;
                }
              } else {
                $scope.not_next = true;
              }
            }

          }
        }
        // -----------------PAGINACIÓN
        //-- Peticion de persistencia--//
        // console.log('Persistence Tareas');
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);
        var json_data = {};
        //var form = document.getElementsByClassName("ng-scope");
        var form = document.getElementsByTagName("form");
        var elementos ={};
        //Valores reutilizables
        var interval,interval1,valor;
        var getCollet_go = false;
        var count = 0;

    }
})();
