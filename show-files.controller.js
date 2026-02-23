(function(){
  angular.module('inspinia')
    .controller('showFilesCtrl',showFilesCtrl);

  showFilesCtrl.$inject = ['$http', '$localStorage','$scope', 'fileService', '$sessionStorage','SweetAlert','toaster'];

  function showFilesCtrl($http, $localStorage,$scope, fileService, $sessionStorage, SweetAlert, toaster){

    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);

    var vmFiles = this;

    vmFiles.rename = rename;
    vmFiles.user = usr;
    vmFiles.deleteFile = deleteFile;

    activate()

    function activate(){
    }

    $scope.deleteRfile = function(file,container){
        // console.log(file);
      fileService.deleteReceiptfile(file.url,file,container);
    }

    function deleteFile(file, container) {
        console.log('file', file)
        console.log('container', container)
        SweetAlert.swal({
            title: '¿Está seguro?',
            text: "No será posible recuperarrr este archivo",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si, estoy seguro.",
            cancelButtonText: "Cancelar",
            closeOnConfirm: false
        }, function(isConfirm) {
            if (isConfirm) {
                // deleteIT(url, file.id)
                $http.delete(file.url+'%')
                    .then(function(response) {
                        container.splice(container.indexOf(file), 1);
                        SweetAlert.swal("¡Eliminado!", "El archivo fue eliminado.", "success");
                    });
            }
        });

    }

    function rename(file,vmFiles){
    console.log(file);
      fileService.renameFile(file)
        .then(function(response){
            if(response.status == 403){
              $http.get(file.url).then(function(response) {
                console.log(response);
                  file.nombre = response.data
              })
            }
        });
    }
  }
})();
