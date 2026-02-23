(function(){
  angular.module('inspinia')
    .factory('fileService',fileService);

  fileService.$inject = ['$http', 'SweetAlert','$localStorage', '$sessionStorage', 'url'];

  function fileService($http, SweetAlert, $localStorage, $sessionStorage, url){

    var service = {
      deleteFile: deleteFile,
      getFiles: getFiles,
      renameFile: renameFile,
      deleteReceiptfile:deleteReceiptfile,
      getPermission:getPermission
    }
    return service;

    function getPermission(){

      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var usr = JSON.parse(decryptedUser);
      var user = usr.permiso;
      return user;
    }

    function deleteFile(file, container) {
      SweetAlert.swal({
        title: '¿Está seguro?',
        text: "No será posible recuperar este archivo",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Si, estoy seguro.",
        cancelButtonText: "Cancelar",
        closeOnConfirm: false
      },
      function(isConfirm) {
        if (isConfirm) {
          var data_email = {
            id: file.id,
            id_poliza: file.owner.id,
            model: 6,
            type_person: 0,
          }
          dataFactory.post('send-email-admins-deletes/', data_email).then(function success(req) {
              console.log('.................:::::.....',req)
          });
          // deleteIT(url, file.id)
          $http.delete(file.url)
            .then(
              function success (response) {
                SweetAlert.swal("¡Eliminado!", "El archivo fue eliminado.", "success");
                container.splice(container.indexOf(file), 1);
              },
              function error (err) {
                console.log('err', err);
              });
        }
      });

    }

    function deleteIT(url, id){
      var req = url + 'archivos/:id/'.replace(':id', id)
      return $http.delete(req)
        .then(deleteFileCompleted)
        .catch(deleteFileFailed);

      function deleteFileCompleted(response){
        return response;
      }
      function deleteFileFailed(error){

        return error;
      }
    }


     function deleteReceiptfile(url, file,container) {
            SweetAlert.swal({
                title: '¿Está seguro?',
                text: "No será posible recuperar este archivo",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Si, estoy seguro.",
                cancelButtonText: "Cancelar",
                closeOnConfirm: false
            }, function(isConfirm) {
                if (isConfirm) {
                    sendDelete(url, file.id)
                        .then(function(response) {
                             container.files.splice(container.files.indexOf(file), 1);
                            // container.splice(container.indexOf(file), 1);
                            SweetAlert.swal("¡Eliminado!", "El archivo fue eliminado.", "success");
                        });
                }
            });
    }

    function sendDelete(url, id){
      // var req = url + 'archivos/:id/'.replace(':id', id)
      return $http.delete(url)
        .then(deleteFileCompleted)
        .catch(deleteFileFailed);

      function deleteFileCompleted(response){
        return response;
      }

      function deleteFileFailed(error){
        return error;
      }
    }

    function getFiles(url){
      return $http.get(url)
              .then(getFilesComplete)
              .catch(getFilesFailed);

      function getFilesComplete(response) {
        var result = response.data.results;


        if(response.status === 200) {

          var result = response.data.results;
          result.forEach(function(file){
            file.url = url + file.id + '/'
          });

          return result;

        } else if(response.status === 403) {
          return response.data;
        }
      }

      function getFilesFailed(error) {
          return error;
      }
    }

    function renameFile(file){
      var patch = {
        nombre: file.nombre,
        sensible : file.sensible
      }
      return $http.patch(file.url, patch);
    }
  }
})();
