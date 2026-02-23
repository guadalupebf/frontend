var app = angular.module('inspinia')
.directive('comments', ['$uibModal','calendarConfig','$location','$http', 'url', '$localStorage', 'toaster', 'dataFactory', 'SweetAlert','$rootScope','$timeout','NotificationService','exportFactory','$sessionStorage',
  function ($uibModal, calendarConfig,$location, $http, url, $localStorage, toaster, dataFactory, SweetAlert,$rootScope, $timeout, NotificationService, exportFactory, $sessionStorage) {
    $('.datepicker-me input').datepicker();
    $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
    $.fn.datepicker.defaults.startView = 0;
    $.fn.datepicker.defaults.autoclose = true;
    $.fn.datepicker.defaults.language = 'es';
    return {
        restrict: 'EA',
        scope: {
          model : '=',
          datasource: '=',
          typemodel: '=',
          idmodel: '=',
          receiptmodel: '=',
          config: '='
        },
        templateUrl: 'app/directivas/comments/comments.template.html',
        link: function(scope, element, attrs) {

          scope.converter_task = false;
          scope.child_converter_task = false;
          scope.user_assigned = 0;
          scope.users = [];
          scope.mentionatedChild=[]
          scope.mentionated=[]
          scope.show_main = true;
          scope.show = false;
          scope.show_task = false;
          scope.yaguardado=false;
          scope.index=0;
          scope.index2=0;

          var orgFromSession = '';
          var authToken = '';
          try {
            var user = $sessionStorage.user ? JSON.parse(sjcl.decrypt("User", $sessionStorage.user)) : null;
            var token = $sessionStorage.token ? JSON.parse(sjcl.decrypt("Token", $sessionStorage.token)) : '';
            if (user) {
              orgFromSession = user.org && user.org.urlname ? user.org.urlname : (user.urlname || user.orgname || '');
            }
            authToken = token && token.token ? token.token : token;
          } catch (e) {
            console.warn('No se pudo descifrar user/token', e);
          }

          scope.commentsExportLoading = false;
          var currentPath = $location.path();
          scope.showExportButton = currentPath === '/tareas/' || currentPath.indexOf('/index/main') === 0 || !!scope.$eval(attrs.exportable);
          scope.exportComments = function() {
            if (!scope.typemodel || !scope.idmodel || scope.commentsExportLoading) {
              return;
            }
            scope.commentsExportLoading = true;

            var resetLoading = function() {
              scope.commentsExportLoading = false;
              scope.$evalAsync(function() {});
            };

            var paramsObj = {
              model: scope.typemodel || scope.model,
              id_model: scope.idmodel
            };
            if (orgFromSession) {
              paramsObj.org = orgFromSession;
            }
            toaster.info('Generando...', 'El archivo se está generando, espera un momento.');

            exportFactory.commentsExport({
              params: paramsObj,
              downloadName: 'bitacora_tarea.xlsx'
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
          };

          if ($location.path() == '/tareas/'){
            scope.show_main = false;
          }

          scope.saveReminder = function(item, index) {
            $http.post(url.IP+'save-reminder', {'mid':item.id,'reminder_date': new Date(item.event.startsAt.getTime() - item.event.startsAt.getTimezoneOffset() * 60000 ), 'has_reminder':true}).then(function(response) {
              scope.datasource[index] = response.data;
    
            })
            item.isReminder = false;            
          }

          scope.closeReminder = function(item) {
            item.isReminder = false;
          }
          //------------------------------------------prueba
          $http.get(url.IP + 'usuarios/')
          .then(function(user) {
            user.data.results.forEach(function(vn) {
              vn.first_name = vn.first_name.toUpperCase()
              vn.last_name = vn.last_name.toUpperCase()
              vn.name = vn.first_name.toUpperCase() + ' ' + vn.last_name.toUpperCase();
            });
            scope.users  = user.data.results;
            scope.usersChild  = user.data.results;
          });
          scope.checkForMention = function(event) {
            scope.showUserList = false;
            var input = event.target.value;
            var cursorPos = event.target.selectionStart;
            var textUpToCursor = input.slice(0, cursorPos);
          
            var mentionIndex = textUpToCursor.lastIndexOf('@');
            if (mentionIndex !== -1) {
              var query = textUpToCursor.slice(mentionIndex + 1);
              scope.filteredUsers = scope.users.filter(function(user) {
                return user.name.toLowerCase().includes(query.toLowerCase());
              });
              scope.showUserList = scope.filteredUsers.length > 0;
            } else {
              scope.showUserList = false;
            }
          };
          scope.mentionated=[];
          scope.addMention = function(user) {
            var input = scope.simple_comment;
            var cursorPos = document.getElementById('commentInput').selectionStart;
            var textUpToCursor = input.slice(0, cursorPos);
            var mentionIndex = textUpToCursor.lastIndexOf('@');
            scope.mentionated.push(user.url);
            scope.simple_comment = input.slice(0, mentionIndex + 1) + user.name + ' ' + input.slice(cursorPos);
            scope.showUserList = false;
          };

          scope.submitComment = function() {
            scope.comments.push(scope.simple_comment);
            scope.simple_comment = '';
          };
          // ----CHild
          scope.checkForMentionChild = function(event, child) {
            scope.showUserList = false;
            scope.showUserListChild = false;
            var input = event.target.value;
            var cursorPos = event.target.selectionStart;
            var textUpToCursor_c = input.slice(0, cursorPos);
          
            var mentionIndex_c = textUpToCursor_c.lastIndexOf('@');
            if (mentionIndex_c !== -1) {
              var query = textUpToCursor_c.slice(mentionIndex_c + 1);
              child.filteredUsersC = scope.usersChild.filter(function(user) {
                return user.name.toLowerCase().includes(query.toLowerCase());
              });
              scope.showUserListChild = child.filteredUsersC.length > 0;
            } else {
              scope.showUserListChild = false;
            }
          };

          scope.addMentionChild = function(user, child) {
            scope.child= child
            var input = child.content;
            var cursorPos = document.getElementById('commentInputChild').selectionStart;
            var textUpToCursor = input.slice(0, cursorPos);
            var mentionIndex = textUpToCursor.lastIndexOf('@');
            scope.mentionated.push(user.url);
            scope.child.content =  input.slice(0, mentionIndex + 1) + user.name + ' '
            scope.showUserListChild = false;
          };

          scope.submitCommentChild = function() {
            scope.comments.push(scope.child.content);
            scope.child.content = '';
          };
          // ****************************************************** 
          scope.toggle = function($event, field, event) {
            $event.preventDefault();
            $event.stopPropagation();
            event[field] = !event[field];
          };

          scope.makeReminder = function(item){
            if(!item.has_reminder){
              item.event = {
                title: '',
                startsAt: new Date(),
                color: calendarConfig.colorTypes.warning,
                draggable: true,
                resizable: true
              }
            }
            else{
              item.event = {
                title: '',
                startsAt: new Date(item.reminder_date),
                color: calendarConfig.colorTypes.warning,
                draggable: true,
                resizable: true
              }
            }
              
            if (item.isReminder){
              scope.isReminder = false;
            }
            else{
              item.isReminder = true;
            }
          }


          var users_array = [];
          scope.urls_array = [];

          scope.editTask = function(item, index){
            console.log(item.comment_tasks[0]);
            var modalInstance = $uibModal.open({
              templateUrl: 'app/tasks/task.modal.html',
              controller: 'TareasModalCtrl',
              backdrop : false,
              size: 'lg',
              resolve: {
                task: function() {
                  return item.comment_tasks[0];
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
              console.log('modal closed', response);
              if (response){
                scope.datasource[index].comment_tasks[0] = response.data;
              }
             }, function () {
              //close callback
              console.info('modal closed');
            });
          }


          scope.getPicture = function(parItem) {
            if(parItem.image) {
              parItem.image = parItem.image;

            } else {
              getUsers(parItem);
            }

          };

          scope.changeSelect = function(argument) {
            scope.user_assigned = argument
          }

          function getUsers (param) {
            $http({
              method: 'GET',
              url: url.IP_CAS+'get-user-picture/'+param.user
            }). then(function success(request) {
              if(request.status === 200) {
                param.image = request.data.url;
                $localStorage.avatar = request.data.url;
              }
            })
            .catch(function (e) {
              console.info('e', e);
            });
          }

          scope.scrollDown = function () {
            var content_ = $('#binaclecontent')[0];
            $('#binaclecontent').scrollTop(content_.scrollHeight);
          };

          //console.log(scope.receiptmodel);
          //console.log('---------------------');

          scope.change_converter = function(flag){
            if (flag){
              // $http.get(url.IP + 'usuarios').then(function(data) {
              //   scope.users = data.data.results;
              // })
              dataFactory.get('usuarios/').then(function(data){
                scope.users = data.data.results;
              });
            }
              scope.converter_task = flag;
            // }
            // else{
            //   scope.converter_task = true;
            // }
          }


          function assignModel(param) {
            switch(param){
              case 1:
                return 1;
                break;
              case 10:
                return 2;
                break;
              case 10:
                return 2;
                break;
              case 4:
                return 3;
                break;
              case 6:
                return 5;
                break;
              case 5:
                return 6;
                break;
              case 2:
                return 7;
                break;
              case 13:
                return 8;
                break;
              case 18:
                return 18;
                break;
              case 28:
                return 28;
                break;
              case 30:
                return 30;
                break;
              default:
                return 1;
                break;
            }
          }

          // scope.saveComment = function () {
          //   scope.yaguardado=true;
          //   var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          //   l.start();
          //   if(!scope.simple_comment || scope.simple_comment == ''){
          //     l.stop();
          //     scope.yaguardado=false;
          //     SweetAlert.swal("¡Error!", "Agrega un comentario.", "error");
          //     return;
          //   }
          //   if(scope.converter_task
          //     ){
          //     if(scope.user_assigned == 0){
          //       l.stop();
          //       scope.yaguardado=false;
          //       return;
          //     }
          //   }
            
          //   var data = {
          //     'model': scope.typemodel,
          //     'id_model': scope.idmodel,
          //     'content': scope.simple_comment,
          //     'parent': null,
          //     'create_task': scope.converter_task,
          //     'user_assigned': scope.user_assigned,
          //     'modelo_tareas': assignModel(scope.typemodel)
          //   };

          //   $http.post(url.IP+'comments/', data)
          //   .then(function(request) {
          //     l.stop();
          //     scope.yaguardado=false;
          //     scope.datasource.push(request.data);
          //     scope.simple_comment = '';
          //     scope.getNotifications();
          //     if(scope.typemodel == 4){
          //       var obj = {
          //         'track_bitacora': true
          //       }
          //       // cambiar url.IP por url del recibo
          //       $http.patch(scope.receiptmodel, obj);
          //     }

          //   })
          //   .catch(function(e) {
          //     console.log('e', e);
          //     l.stop();
          //     scope.yaguardado=false;
          //   });

          //   if(scope.typemodel == 22){
          //     var data = {
          //       id: scope.idmodel
          //     }
          //     $http.post(url.IP + 'complete-task/', data).then(function(response){
          //       console.log("216",response);
          //       var params = {
          //         'model': 22,
          //         'event': "POST",
          //         'associated_id': scope.idmodel,
          //         'identifier': "cerró la tarea."
          //       }
          //       l.stop();
          //       scope.yaguardado=false;
          //       dataFactory.post('send-log/', params).then(function success(response) {
          //         console.log("225", response);
          //       });
          //     });
          //     scope.yaguardado=false;
          //   }
          //   l.stop();
          // };
          scope.saveComment = function ($event) {
            // ✅ 1) si ya está guardando, no hagas nada
            if (scope.yaguardado) return;

            // ✅ 2) valida antes de prender "guardado"
            var comment = (scope.simple_comment || '').trim();
            if (!comment) {
              SweetAlert.swal("¡Error!", "Agrega un comentario.", "error");
              return;
            }

            if (scope.converter_task) {
              if (scope.user_assigned == 0) return;
            }

            // ✅ 3) prende lock y limpia input de inmediato (evita dobles + UX)
            scope.yaguardado = true;
            scope.simple_comment = '';

            // ✅ 4) Ladda sobre ESTE botón (no querySelector global)
            var btn = $event && $event.currentTarget ? $event.currentTarget : null;
            var l = btn ? Ladda.create(btn) : null;
            if (l) l.start();

            var data = {
              model: scope.typemodel,
              id_model: scope.idmodel,
              content: comment, // usamos el comentario guardado localmente
              parent: null,
              create_task: scope.converter_task,
              user_assigned: scope.user_assigned,
              modelo_tareas: assignModel(scope.typemodel)
            };

            $http.post(url.IP + 'comments/', data)
              .then(function (resp) {
                scope.datasource.push(resp.data);
                scope.getNotifications();

                if (scope.typemodel == 4) {
                  $http.patch(scope.receiptmodel, { track_bitacora: true });
                }

                // si typemodel 22, corre el flujo extra, pero sin duplicar saves
                if (scope.typemodel == 22) {
                  return $http.post(url.IP + 'complete-task/', { id: scope.idmodel })
                    .then(function () {
                      var params = {
                        model: 22,
                        event: "POST",
                        associated_id: scope.idmodel,
                        identifier: "cerró la tarea."
                      };
                      return dataFactory.post('send-log/', params);
                    });
                }
              })
              .catch(function (e) {
                console.log('e', e);
                // ✅ si falla, regresa el texto al input para que no lo pierda
                scope.simple_comment = comment;
                SweetAlert.swal("¡Error!", "No se pudo enviar el comentario. Intenta de nuevo.", "error");
              })
              .finally(function () {
                if (l) l.stop();
                scope.yaguardado = false;
              });
          };

          scope.getNotifications = function() {            
            NotificationService.getNotifications().then(function() {
              $rootScope.$broadcast('MainCtrl:getNotifications');
            });
            // ------socket
            // $http({
            //   method: 'POST', 
            //   url: url.IP +'notifications-test-task/',
            //   })
            // .then(function success(response) {            
            //   if (response.status == 200){
            //     var socket = io.connect(url.REPORT_SERVICE_NODE_SOCKET);
            //     socket.emit('subscribe', response.data);
            //     // Aquí espera el mensaje que reciba de socketIO cuando el reporte esté listo
            //     // socket.on('result', function(url){
            //     socket.onmessage = function(e) {
            //         const data = JSON.parse(e.data);
            //         if (data.type === 'notification') {
            //             const notification = data.data;
            //             console.log('Received notification:', notification.message);
            //             // Update your notification count or list here
            //         }
            //     };
            //     // socket.on(response.data, function(url){
            //     //   var notificacion = {
            //     //     'title': 'Enviando notificación...', 
            //     //     'description': url, 
            //     //     'model': 26,
            //     //     'id_reference':0
            //     //   }
            //     //   socket.disconnect();
            //     // });
            //     console.log('Generando...', 'Bitácora');
            //     // socket.disconnect();
               
            //   } else {
            //     console.log('Aviso', 'Ha ocurrido un error, intente nuevamente');
            //   }
            // }).catch(function(error) {
            //   console.log('Aviso', 'Ha ocurrido un error, intente nuevamente');
            // })
            // -----------------
          };
          scope.saveChild = function (parChild, parItem) {
            // if(scope.child_converter_task){
            //   if(!scope.user_child_assigned){
            //     return;
            //   }
            // }

            var data = {
              model: scope.typemodel,
              id_model: scope.idmodel,
              content: parChild.content,
              parent: parItem.id,
              is_child : true,
              'create_task': scope.child_converter_task,
              'user_assigned': scope.user_child_assigned
            };

            $http.post(url.IP+'comments/', data)
            .then(function(request) {
              if(request.status === 201) {
                parItem.comment_child.push(request.data);
                parChild.content = '';
                parChild.response = false;
                scope.getNotifications();
              }
            })
            .catch(function(e) {
              console.log('e', e);
            });

          };
          scope.show_mail = function(id){
              //scope.show = true;
              $http.get(url.IP+'log-email/'+id+'/'+1)
              .then(function(response) {
                  if(response.status==200){
                    var modalInstance = $uibModal.open({ //jshint ignore:line
                      templateUrl: 'app/cobranzas/log.detail.email.html',
                      controller: 'EmailDetailCtrl',
                      size: 'lg',
                      windowClass : 'modal-s',

                      resolve: {
                        mail: function() {
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
                  }
                })
          }


          // Ver más
          scope.showMore = function() {

            $http.get(scope.config.next)
            .then(function (request) {
              if(request.status === 200) {
                scope.config.next = request.data.next;
                scope.config.count = request.data.count;
                scope.config.previous = request.data.previous;
                request.data.results.forEach(function(item) {
                  scope.datasource.unshift(item); 
                }); 
              }
            })
            .catch(function (e) {
              console.log('error', e);
            });

          };

        } // termina link
      } // termina return
    }]
);
