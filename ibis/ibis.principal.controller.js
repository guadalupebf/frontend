(function() {
    'use strict';

    angular.module('inspinia')
        .controller('IBISController', IBISController);

    IBISController.$inject = ['$scope','dataFactory', 'SweetAlert', '$sessionStorage', 'FileUploader', 'url', 'MESSAGES'];

    function IBISController($scope,dataFactory, SweetAlert, $sessionStorage, FileUploader, url, MESSAGES) {
        var vm = this;

        $scope.saveFlag = false;
        $scope.ibis = true;

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

        activate();

        function activate() {}

        $scope.selectExcelDirectorio = function (parData) {
          $scope.strcutureData = certStructure(parData);
          treeStructure(parData);
          $scope.id_tree = true;
          $scope.saveFlag = true;
        };

        function certStructure (parData) {
            $scope.dataToSave = []
            for(var key in parData) {
            	var data = parData[key];
            	if(data.length) {
              		data.forEach(function(item) {
              			if(item.NOMBRE){
	              			var obj = {
	              				nombre: item.NOMBRE,
	              				area: item.AREA,
	              				email: item.EMAIL,
	              				puesto: item.PUESTO,
	              				ramo: item.RAMO,
	              				sexo: item.SEXO,
	              				telefono: item.TELEFONO,
	              			}

	              			$scope.dataToSave.push(obj)
	              		}
              		})            
            	}
            }

            return $scope.dataToSave;
        };

        function treeStructure (parData) {

            var tree = [];

            for (var key in parData) {
            	var data = parData[key];
            	if (data.length) {
            		data.forEach(function(item) {
            			if(item.NOMBRE){
		                	var item_content = '<i class="fa fa-user"></i> ' + item.NOMBRE + ' - ' + item.TELEFONO + ' - ' + item.EMAIL + ' - ' + item.AREA +' - ' + item.PUESTO;

		              		var element = {
		                		text: item_content
		              		};

		              		tree.push(element);
		              	}
            		})
              	}

            $('#tree').treeview({data: tree});
          }
        }

        $scope.save = function(param) {
        	if(param == 1){
        		dataFactory.post('directorio/', $scope.strcutureData)
        		.then(function success(responseDirect) {
        			if(responseDirect.status == 200 || responseDirect.status == 201){
        				SweetAlert.swal("Exito", "Se han guardado los contactos", "success")
        			}
        		})
        	}
        }

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

        $scope.saveFiles = function() {
          uploadFiles();
        }

        function uploadFiles() {
          $scope.userInfo.url = $scope.uploader.url = url.IP + 'formatos/?org=' + usr.org;
          $scope.uploader.uploadAll();
        }

    }
})();