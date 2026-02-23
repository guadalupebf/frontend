(function() {
    'use strict';

    angular.module('inspinia')
        .controller('TareasAdminCtrl', TareasAdminCtrl);

    TareasAdminCtrl.$inject = ['$stateParams', 'SweetAlert', 'MESSAGES', '$scope', '$uibModal', 'dataFactory', '$http', 'url',
    '$localStorage', 'toaster', '$parse', 'datesFactory', '$sessionStorage', 'FileUploader', 'PersistenceFactory'];

    function TareasAdminCtrl($stateParams, SweetAlert, MESSAGES, $scope, $uibModal, dataFactory, $http, url, $localStorage, toaster,
      $parse, datesFactory, $sessionStorage, FileUploader, PersistenceFactory) {

        

    	var vm = this;

    	/* Información de usuario */
        var decryptedUser = sjcl.decrypt('User', $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);

        vm.users = [];
        vm.users_selected = [];
        $scope.select_created_by = [];


    	activate();
        // Start functionality
        function activate() {
            $('.js-example-basic-multiple').select2();   	
            $http.get(url.IP + 'group-manager/')
            .then(function(response) {
                $http.get(url.IP + 'usuarios/')
                .then(function(user) {
                    user.data.results.forEach(function(usr) {	
                        response['data'].forEach(function(item){
                            if(item.user == usr.id){
                                vm.users_selected.push(usr);
                                $scope.select_created_by.push(usr);
                            }
                        });            
                        if(usr.user_info.is_active) {
                            vm.users.push(usr);
                        }
                    });   
                });
            });


		}

        $scope.save = function(){
            console.log($scope.select_created_by);
            var toSave = $scope.select_created_by.map(function(item){
                return item.id;
            });
            $http.post(url.IP + 'group-manager/', toSave)
	        .then(function() {
                vm.users_selected = $scope.select_created_by;
		    });
        }




	}
})();