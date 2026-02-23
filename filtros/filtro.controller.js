(function() {
  'use strict';

  angular.module('inspinia').controller('filterController', filterController);

  filterController.$inject = ['$scope', '$http', 'url', 'SweetAlert', 'dataFactory'];

  function filterController($scope, $http, url, SweetAlert, dataFactory) {
    var vm = this;

    vm.form = {
    	name: ''
    }
    $scope.group = {
    	name: ''
    }
    $scope.showGroupUser = false;
   	$scope.showListGroupUser = false;
   	$scope.addUsersToGroup = false;
    $scope.editGroupUser = false;
   	$scope.delUsersToGroup = false;

    $scope.showChangeNameGroup = false;
   	// ---select
   	angular.element(document).ready(function(){
	    $('.js-example-basic-multiple').select2();
	  });

    listGroups();

    $scope.createGroupUser = function(val){
    	$scope.showGroupUser = val;
    	$scope.showListGroupUser = false;
      $scope.addUsersToGroup = false;
    	$scope.editGroupUser = false;
    	$scope.delUsersToGroup = false;
    };

    $scope.asignUsers = function(val){
    	$scope.showGroupUser = false;
      $scope.showListGroupUser = false;
      $scope.addUsersToGroup = val;
      $scope.editGroupUser = false;
      $scope.delUsersToGroup = false;
    	$http.get(url.IP + 'usuarios/')
      .then(function(data){
        vm.users = data.data.results;
      });
    };

    $scope.editGroupUsers = function(val){
    	$scope.showGroupUser = false;
      $scope.showListGroupUser = false;
      $scope.addUsersToGroup = false;
      $scope.editGroupUser = val;
      $scope.delUsersToGroup = false;

      $scope.showChangeNameGroup = false;
    };

    $scope.eliminarGroupUsers = function(val){
    	$scope.showGroupUser = false;
  		$scope.showListGroupUser = false;
  		$scope.addUsersToGroup = false;
  		$scope.editGroupUser = false;
  		$scope.delUsersToGroup = val;
    	$http.get(url.IP + 'usuarios/')
        .then(function(data){
          vm.users = data.data.results;
        });
        $http({
        method: 'GET',
        url: url.IP + 'get-group-user',
	    }).success(function(response) {
	        $scope.groupsUsersList = response.results;
	    }); 
    };
    // Save group usuers
    $scope.saveGroupUser = function(form){
    	$scope.params = {
	      name: form.name
	    }
  		$http({
  			method: 'POST',
  			url: url.IP + 'djangogroups/',
  			data: $scope.params
  		}).success(function(response) {
  			vm.form.name = '';
  			$scope.groupsUsers = response;
      	$scope.showGroupUser = false;
        $scope.showListGroupUser = true;
      	SweetAlert.swal("¡Listo!", "El grupo ha sido creado correctamente.", "success");
        listGroups();
  		}); 
    };

    function listGroups(){
    	$http({
        method: 'GET',
        url: url.IP + 'get-group-user',
	    }).success(function(response) {	    	
			// $scope.showListGroupUser = false;
    		$scope.showGroupUser = false;
	      $scope.groupsUsersList = response.results;
	    }); 
    };

    $scope.getUsers = function(gu){
    	if (gu) {
    		if (gu.name) {
    			if (gu.name.id) {
    				$http({
						method: 'GET',
						url: url.IP + 'get-djangousersgroups/',
						params: {group: gu.name.id}
					}).success(function(response) {
						$scope.groupsList = response;
					});
    			}
    		}
    	} 	
    };

    $scope.selectUser = function(sel){
	    vm.usuarios_selected = [];
	    sel.forEach(function(u) {
	      vm.usuarios_selected.push(u.id)
	    })
	  };

  	$scope.saveUserinGroup = function (val, num){
  		vm.usuarios_selected.forEach(function(item) {
  			$scope.params = {
		      	group: val.name.id,
		      	user: item,
		      	action: num
		    }
  			$http({
  				method: 'POST',
  				url: url.IP + 'djangousersgroups/',
  				data: $scope.params
  			}).success(function(response) {
  				vm.form.name = '';
  				$scope.groupsUsers = response
  				$scope.showListGroupUser = true;
  	    		$scope.showGroupUser = false;
          		$scope.group.name = '';
  			});
  			// GET
  			$http({
  				method: 'GET',
  				url: url.IP + 'get-djangousersgroups/',
  				params: $scope.params
  			}).success(function(response) {
  				vm.form.name = '';
  				$scope.groupsUsers = response
  				$scope.showListGroupUser = true;
  	    		$scope.showGroupUser = false;
  			});
  		});
  	};

  	$scope.delUserGroup = function (val, us,num){
  		$scope.params = {
	        group: val.id,
	        user: us.id,
	        action: num
      	}
  		$http({
  			method: 'POST',
  			url: url.IP + 'djangousersgroups/',
  			data: $scope.params
  		}).success(function(response1) {
  			$scope.groupsUsers = response1
  		});
  		// GET
  		$http({
  			method: 'GET',
  			url: url.IP + 'get-djangousersgroups/',
  			params: $scope.params
  		}).success(function(response) {
  			vm.form.name = '';
  			$scope.groupsUsers = response
  		});
  	};

  	$scope.seeGroup = function(grp, num, idx){
  		$http({
  			method: 'GET',
  			url: url.IP + 'get-djangousersgroups/',
  			params: {group: grp.id, action: num}
  		}).success(function(response) {
  			$scope.groupsList = response;
  			$scope.showGroups = true;
  			if (num == 1) {
  				$scope.showDelUser = false;
  			}else{
  				$scope.showDelUser = true;
  			}
  		});
  	};

  	$scope.hideGroup = function(){
  		$scope.groupsList = [];
  		$scope.showGroups = false;
  		$scope.showDelUser = true;
  	};

	  $scope.findGroup = function (parValue) {
      if(parValue) {
        if(parValue.val.length >= 3) {
          if ($scope.selectUser == 'usuario') {
            dataFactory.get('filter-users/', {word: parValue.val})
            .then(
              function success(request) {
                var results = [];
                results = _.map(request.data.results, function(item) {
                  return {
                    label: item.first_name + ' '+ item.last_name,
                    value: item.first_name + ' '+ item.last_name,
                    id: item.id, 
                    url: item.url
                  }
                });
                $scope.autocompleteData = results;
              }, 
              function error (error) {
              }
            )
            .catch(function(e) {
              console.log('e', e);
            });
          } else{
            $scope.aurtocompleteData = []
            dataFactory.get('filter-djangogroups/', {word: parValue.val})
            .then(
              function success(request) {
                var results = [];
                results = _.map(request.data.results, function(item) {
                  return {
                    label: item.name,
                    value: item.name,
                    id: item.id, 
                    url: item.url
                  }
                });
                $scope.autocompleteData = results;
              }, 
              function error (error) {
              }
            )
            .catch(function(e) {
              console.log('e', e);
            });
          }
        }
      }
    };

    $scope.groupSelect = function(item){
      $scope.showChangeNameGroup = true;
      $scope.groupName = item;
    };

    $scope.saveEditGroupName = function (name) {
      $scope.params = {
	      name: name.name
	    }
		  $http.patch(url.IP + 'djangogroups/' + name.id + '/', $scope.params)
        .then(function success(response) {
    		SweetAlert.swal("¡Listo!", "El grupo ha sido actualizado correctamente.", "success");
    		// $scope.editGroupUser = false;
        $scope.group.name = '';
    		$scope.groupName = [];
        listGroups();
		  });
    };

    $scope.hideEdit = function(){
      $scope.showChangeNameGroup = false;
    };

    $scope.delGroupAll = function (val){
    	SweetAlert.swal({
        title: 'Eliminar el Grupo: ' + val.name.name,
        text: "Se eliminará definitivamente el Grupo.",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si",
        cancelButtonText: "No",
        closeOnConfirm: true
      },
      function(isConfirm) {
        if (isConfirm) {
    			$scope.delUsersToGroup = false;
            $scope.params = {
  		      group: val.name.id,
  		      user: 0,
  		      action: 3//Eliminar grupo
  		    }
    			$http({
    				method: 'POST',
    				url: url.IP + 'djangousersgroups/',
    				data: $scope.params
    			}).success(function(response2) {
    				$scope.groupsUsers = response2;
            SweetAlert.swal("¡Listo!", "El grupo ha sido eliminado correctamente.", "success");
            $scope.group.name = '';
            listGroups();
    			});
    			// GET
    			$http({
    				method: 'GET',
    				url: url.IP + 'get-djangousersgroups/',
    			}).success(function(response) {
    				vm.form.name = '';
    				$scope.groupsUsers = response;
    			});            
        }
      });
	  };

  }
})();
