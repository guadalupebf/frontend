(function(){
  'use strict';

  angular
      .module('inspinia')
      .factory('packageService', packageService);

  packageService.$inject = ['url', '$http', '$sessionStorage'];

  function packageService(url, $http, $sessionStorage) {

      /* Información de usuario */
      var infoUser = $sessionStorage.infoUser;

      var service = {
          createPackage: createPackage,
          paquetesConfig: paquetesConfig, 
          getPackages: getPackages,
          getInfoPackages: getInfoPackages,
          getPackage: getPackage,
          updatePackages: updatePackages,
          deletePackage: deletePackage,
          getPackageByUri:getPackageByUri,
          getPackageById:getPackageById,
          getOnlyPackageById:getOnlyPackageById,
          verifyPackage:verifyPackage
      };

      return service;

      ////////////

      function paquetesConfig(data) {
        return $http.post(url.IP + 'coberturas-configuraciones/', data)
              .then(createPackageComplete)
              .catch(createPackageFailed);

              function createPackageComplete(response){
                  return response.data;
              }

              function createPackageFailed(error){
                  ////console.log('createPackageFailed',  error);
              }
      }

      function verifyPackage(data) {
        return $http.post(url.IP + 'verify-package', data)
            .then(createPackageComplete)
            .catch(createPackageFailed);

            function createPackageComplete(response){
                return response.data;
            }

            function createPackageFailed(error){
                ////console.log('createPackageFailed',  error);
            }
      }

      function createPackage(data) {
          return $http.post(url.IP + 'paquetes/', data)
              .then(createPackageComplete)
              .catch(createPackageFailed);

              function createPackageComplete(response){
                  return response.data;
              }

              function createPackageFailed(error){
                  ////console.log('createPackageFailed',  error);
              }
      }

      function getPackages() {
          return $http.get(url.IP + 'package-custom/')
              .then(getPackagesComplete)
              .catch(getPackagesFailed);

          function getPackagesComplete(response) {
              ////console.log('getPackages' , response.data.results);
              return response.data.results;
          }

          function getPackagesFailed(error) {
              ////console.log('My error' + error);
          }
      }

      function getInfoPackages() {
          infoUser = $sessionStorage.infoUser;
          // if(infoUser.staff && !infoUser.superuser){
          //   var filter_pack = 'v2/paquetes/paquetes-information/';
          var filter_pack = 'v1/paquetes/information/';
          return $http.get(url.IP + filter_pack)
              .then(getInfoPackagesComplete)
              .catch(getInfoPackagesFailed);

          function getInfoPackagesComplete(response) {
              //return response.data.results;
              var results = {
                  data: response.data,
                  config: {
                    count: response.data.count,
                    next: response.data.next,
                    previous: response.data.previous
                  }
                };
                //console.log('Results packages',results.data)
                return results;
          }

          function getInfoPackagesFailed(error) {
              return error;
          }
      }

      function getPackage(data) {
        if(data.paqueteId){
          data.paqueteId = url.IP + 'paquetes-resume/' + data.paqueteId + '/';
        }else{
          data.paqueteId = data.paquete;
        }
          ////console.log('data.paqueteId', data.paqueteId);
          return $http.get(data.paqueteId)
              .then(getPackageComplete)
              .catch(getPackageFailed);

          function getPackageComplete(response) {
              return response.data;
          }

          function getPackageFailed(error) {
              ////console.log('Error getPackageFailed:', error);
          }
      }

      function getPackageByUri(uri){
        return $http.get(uri)
          .then(getPackageComplete)
          .catch(getPackageFailed);

        function getPackageComplete(response) {
            return response;
        }

        function getPackageFailed(error) {
            ////console.log('Error getPackageFailed:', error);
        }
      }

      
      function getOnlyPackageById(id){
        return $http.get(url.IP+'paquete-single-by-id/'+id)
          .then(getPackageComplete)
          .catch(getPackageFailed);

        function getPackageComplete(response) {
            return response;
        }

        function getPackageFailed(error) {
            ////console.log('Error getPackageFailed:', error);
        }
      }

      function getPackageById(id){
        return $http.get(url.IP+'paquete-by-id/'+id)
          .then(getPackageComplete)
          .catch(getPackageFailed);

        function getPackageComplete(response) {
            return response;
        }

        function getPackageFailed(error) {
            ////console.log('Error getPackageFailed:', error);
        }
      }

      function updatePackages(oldPackage, newPackage){
        
      }

      function deletePackage(obj){
          ////console.log('obj', obj);
          return $http.delete(obj.url)
              .then(deletePackagesComplete)
              .catch(deletePackagesFailed);

          function deletePackagesComplete(response, status, headers, config) { //jshint ignore:line
              return response;
          }

          function deletePackagesFailed(response, status, headers, config) { //jshint ignore:line
              ////console.log('Error deletePackagesFailed:', response);
              return status;
          }
      }
  }

})();
