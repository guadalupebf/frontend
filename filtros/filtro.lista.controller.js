(function() {
  'use strict';

  angular.module('inspinia').controller('filterListController', filterListController);

  filterListController.$inject = ['$scope', '$http', 'url', 'SweetAlert'];

  function filterListController($scope, $http, url, SweetAlert) {
    var vm = this;

    $scope.showButtonDeleteUser = false;
    $scope.showButtonDeleteShare = false;

	  activate();
	
    function activate(){
      $scope.showGroupUser = false;
      $scope.params = {
        user: 0,
        group: 0
      };
      $http({
        method: 'GET',
        url: url.IP + 'get-shared-by-group-user',
        params: $scope.params
      }).success(function(response) {
        $scope.users = response.info.usuarios;
        $scope.groups = response.info.grupos;
      }); 
    };

    $scope.getInfoUser = function(item, idx){
      $scope.user_index = idx;
      $scope.params = {
        user: item.usuario,
        group: 0
      }
      $http({
        method: 'GET',
        url: url.IP + 'get-shared-by-group-user',
        params: $scope.params
      }).success(function(response) {
        $scope.asignaciones = response;
      }); 
    };

    $scope.getInfoGroup = function(item, idx){
      $scope.hideDeleteUser();
      $scope.group_index = idx;
      $http({
        method: 'GET',
        url: url.IP + 'get-djangousersgroups/',
        params: {group: item.grupo, action: 1}
      }).success(function(response) {
        $scope.groupsList = response;
      });
      $scope.params = {
        user: 0,
        group: item.grupo
      }
      $http({
        method: 'GET',
        url: url.IP + 'get-shared-by-group-user',
        params: $scope.params
      }).success(function(response) {
        $scope.asignacionesGroup = response;
      }); 
    };

    $scope.showDeleteUser = function(){
      $scope.showButtonDeleteUser = true;
    };

    $scope.hideDeleteUser = function(){
      $scope.showButtonDeleteUser = false;
    };

    $scope.deleteUser = function(val, us){
      swal({
        title: "¿Estás seguro?",
        text: "¿Desea eliminar el usuario de este grupo?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si",
        cancelButtonText: "Cancelar",
        closeOnConfirm: false,
        closeOnCancel: false
      },
      function(isConfirm){
        if(isConfirm){
          $scope.delUserGroup(val, us);
        }else{
          SweetAlert.swal("¡Bien!", "Usuario no se ha eliminado.", "info");
        }
      });
    };

    $scope.delUserGroup = function (val, us){
      $scope.params = {
        group: val.grupo,
        user: us.id,
        action: 2
      }
      $http({
        method: 'POST',
        url: url.IP + 'djangousersgroups/',
        data: $scope.params
      }).success(function(response1) {
        SweetAlert.swal("¡Listo!", "Usuario eliminado correctamente.", "success");
      });
      $http({
        method: 'GET',
        url: url.IP + 'get-djangousersgroups/',
        params: $scope.params
      }).success(function(response) {
        $scope.groupsList = response;
      });
    };

    $scope.showDeleteShare = function(){
      $scope.showButtonDeleteShare = true;
    };
    $scope.showDeleteShareUser = function(){
      $scope.showButtonDeleteShareUser = true;
    };

    $scope.hideDeleteShare = function(){
      $scope.showButtonDeleteShare = false;
    };
    $scope.hideDeleteShareUser = function(){
      $scope.showButtonDeleteShareUser = false;
    };

    $scope.deleteShare = function(val, us,cat){
      swal({
        title: "¿Estás seguro?",
        text: "¿Desea eliminar esta asignación?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si",
        cancelButtonText: "Cancelar",
        closeOnConfirm: false,
        closeOnCancel: false
      },
      function(isConfirm){
        if(isConfirm){
          $scope.delShare(val, us,cat);
        }else{
          SweetAlert.swal("¡Bien!", "La asignación no se ha eliminado.", "info");
        }
      });
    };

    $scope.delShare = function (val, asi, cat){
      switch(cat){
        case 1:
          $scope.params = {
            group: val.grupo ? val.grupo : 0,
            user: val.usuario ? val.usuario : 0,
            aseguradora: asi.aseguradora 
          }
          break;
        case 2:
          $scope.params = {
            group: val.grupo ? val.grupo : 0,
            user: val.usuario ? val.usuario : 0,
            contratante_fisico: asi.contratante_fisico 
          }
          break;
        case 3:
          $scope.params = {
            group: val.grupo ? val.grupo : 0,
            user: val.usuario ? val.usuario : 0,
            contratante_moral: asi.contratante_moral 
          }
          break;
        case 4:
          $scope.params = {
            group: val.grupo ? val.grupo : 0,
            user: val.usuario ? val.usuario : 0,
            fianza: asi.fianza 
          }
          break;
        case 5:
          $scope.params = {
            group: val.grupo ? val.grupo : 0,
            user: val.usuario ? val.usuario : 0,
            grupo_de_contratantes: asi.grupo_de_contratantes 
          }
          break;
        case 6:
          $scope.params = {
            group: val.grupo ? val.grupo : 0,
            user: val.usuario ? val.usuario : 0,
            poliza: asi.poliza 
          }
          break;
        default:
          break;
      }
      $http({
        method: 'POST',
        url: url.IP + 'del-shared-user-group/',
        data: $scope.params
      }).success(function(response1) {
        SweetAlert.swal("¡Listo!", "Usuario eliminado correctamente.", "success");
      });      
    };
            
  }
})();