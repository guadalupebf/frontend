var app = angular.module('inspinia')
.directive('tasks', ['$uibModal', 
  function ($uibModal) {
    return {
        restrict: 'EA',
        scope: {
          url: '@',
          typeaheadOnSelect: '=',
          click: '&',
          id : '@',
          required: '=',
          type: '=',
          associated: '=',
          receipt: '=',
          model : '='
        },
        template: '<a class="btn btn-white btn-sm" title="Agregar tarea sobre este trámite" ng-click="$event.stopPropagation(); onClick()">' +
                    '<img src="assets/images/icons/addtask.png" width="15px">' +
                  '</a>',
        link: function(scope, element, $watch) {

          scope.data = assignTitle();
          scope.route = assignRoute();
          scope.modelo = assignModel();
          scope.id = scope.associated;

          function assignTitle() {
            switch(scope.type){
              case 1:
                return "OT de póliza no. " + scope.model;
                break;
              case 2:
                return "OT de endoso no. " + scope.model;
                break;
              case 3:
                return "recibo no. " + scope.model;
                break;
              case 4:
                return "póliza no. " + scope.model;
                break;
              case 5:
                return "renovación de la póliza " + scope.model;
                break;
              case 6:
                return "siniestro no. " + scope.model;
                break;
              case 7:
                return "cliente " + scope.model;
                break;
              case 8:
                return "fianza no. " + scope.model;
                break;
              case 9:
                return "endoso no. " + scope.model;
                break;
            }
          }

          function assignRoute() {
            switch(scope.type){
              case 1:
                return "OT | Póliza | " + scope.model + ' | ';
                break;
              case 2:
                return "OT | Endoso | " + scope.model + ' | ';
                break;
              case 3:
                return "Recibo | " + scope.model.split(" ")[0] + ' | Póliza | ' + scope.model.split(" ")[4];
                break;
              case 4:
                return "Póliza | " + scope.model + ' | ';
                break;
              case 5:
                return "Renovación | Póliza | " + scope.model + ' | ';
                break;
              case 6:
                return "Siniestro | " + scope.model.split(" ")[0] + ' | Póliza | ' + scope.model.split(" ")[4];
                break;
              case 7:
                return "Cliente | " + scope.model;
                break;
              case 8:
                return "Fianza | " + scope.model + ' | ';
                break;
              case 9:
                return "Endoso | " + scope.model + ' | ';
                break;
            }
          }

          function assignModel() {
            switch(scope.type){
              case 1:
                return 1;
                break;
              case 2:
                return 2;
                break;
              case 3:
                return 4;
                break;
              case 4:
                return 4;
                break;
              case 5:
                return 5;
                break;
              case 6:
                return 6;
                break;
              case 7:
                return 7;
                break;
              case 8:
                return 8;
                break;
              case 9:
                return 9;
                break;
            }
          }

          scope.onClick = function () {
              var modalInstance = $uibModal.open({
              templateUrl: 'app/tasks/task.modal.html',
              controller: 'TareasModalCtrl',
              size: 'lg',
              resolve: {
                task: function() {
                  return null;
                },
                data: function() {
                  return scope.data;
                },
                associated: function() {
                  return scope.id;
                },
                receipt: function() {
                  return scope.receipt;
                },
                route: function() {
                  return scope.route;
                },
                modelo: function() {
                  return scope.modelo;
                }
              }
            });
          };

        }
      }
    }]
);