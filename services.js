(function() {
    'use strict';

    angular
        .module('inspinia')
        .factory('generalService', generalService)
        .factory('SweetAlert', SweetAlert);

    generalService.$inject = ['$http', 'globalVar', 'groupService','url'];

    function generalService($http, globalVar, groupService,url) {
        var service = {
            deleteService: deleteService,
            getFiles: getFiles,
            postService: postService,
            updateService: updateService,
            updateAddressService: updateAddressService,
            createPersonalInformation: createPersonalInformation,
            createBeneficiaries: createBeneficiaries,
            createRelationship: createRelationship,
            manyServices: manyServices,
            getPersonalInformation: getPersonalInformation,
            // Forms
            lifeForm: lifeForm,
            diseaseForm: diseaseForm,
            damageForm: damageForm,
            automobileForm: automobileForm,
            deleteFile: deleteFile,
            getByUrl: getByUrl,
            updateByUrl: updateByUrl
        };

        return service;

        ////////////

        function lifeForm(obj) {
            return $http.post(globalVar.lifeForm, obj);
        }

        function diseaseForm(obj) {
            return $http.post(globalVar.diseaseForm, obj);
        }

        function damageForm(obj) {
            return $http.post(globalVar.damageForm, obj);
        }

        function automobileForm(obj) {
            return $http.post(globalVar.automobileForm, obj);
        }

        function createPersonalInformation(req) {
            return $http.post(globalVar.personal, req)
                .then(function(res) {
                    return res;
                });
        }

        function getPersonalInformation(req) {
            return $http.get(req)
                .then(function (res) {
                    return res;
                });
        }

        function createBeneficiaries(req) {
            return $http.post(globalVar.beneficiaries, req)
                .then(function(res) {
                    return res;
                });
        }

        function createRelationship(req) {
            return $http.post(globalVar.relationships, req)
                .then(function(res) {
                    return res;
                });
        }

        function deleteService(obj) {
            //var ok_to_delete = true;
            $http.get(url.IP + 'ok-to-delete/' + obj.id + '/')
            .then(function success(response) {
                var ok_to_delete = false;
            
                if(response.data == false){

                    ok_to_delete = true;
                    
                } else {
                    ok_to_delete = false;
                }

                
                if(ok_to_delete == true){
                    return $http.delete(obj.url)
                    .then(deleteServiceComplete);
                }
            })
            

            function deleteServiceComplete(response) {
                console.log(response)
                return response;
            }
    



        }


        /*function deleteService(obj) {
            $http.get(url.IP + 'ok-to-delete/' + obj.id+ '/')
            .then(function success(response) {
                if(response.data){
                    var ok_to_delete = false
                } else {
                    var ok_to_delete = true
                }
            })
            if(ok_to_delete){
                console.log("dentro del if")
                return $http.delete(obj.url)
                    .then(deleteServiceComplete);
            }

            function deleteServiceComplete(response) {
                return response;
            }
    



        }*/

        
        /*function deleteService(obj) {
            var ok = false;
            
            $http.get(url.IP + 'ok-to-delete/' + obj.id + '/')
            .then(function success(response) {
                console.log(response.data)
                
                if(response.data == false){
                    console.log("se deberia de eliminar");
                    var ok_to_delete = true;
                } 
                else {
                    console.log("no se deberia de eliminar");
                    var ok_to_delete = false;
                }
                ok = ok_to_delete;
                console.log("ok",ok);

                if(ok == true)
                {
                console.log("se va a eliminar");
                return $http.delete(obj.url)
                    .then(deleteServiceComplete);
                }
            })

            function deleteServiceComplete(response) {
                return response;
            }
        }
    */

        function deleteFile(url, id){
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

        function getFiles(data) {
          // console.log(data);
          var url = data + 'archivos/';

          return $http.get(url)
                  .then(getFilesComplete)
                  .catch(getFilesFailed);

          function getFilesComplete(response) {
            var result = response.data.results;
            result.forEach(function(file){
              file.url = url + file.id
            });

            return result;
          }

          function getFilesFailed(error) {
              return error;
          }
        }

        function postService(data) {
            return $http.post(data.url, data)
                .then(postServiceComplete)
                .catch(postServiceFailed);

            function postServiceComplete(response, status, headers, config) { //jshint ignore:line
                return response;
            }

            function postServiceFailed(response, status, headers, config) { //jshint ignore:line
                return status;
            }
        }

        function updateService(obj) {
            return $http.put(obj.url, obj)
                .then(updateServiceComplete)
                .catch(updateServiceFailed);

            function updateServiceComplete(response) {
                return response;
            }

            function updateServiceFailed(error) {
                return error;
            }
        }

        function updateAddressService(obj) {
            return $http.put(obj.url + obj.id + '/', obj)
                .then(updateAddressServiceComplete)
                .catch(updateAddressServiceFailed);

            function updateAddressServiceComplete(response) {
                return response;
            }

            function updateAddressServiceFailed(error) {
                return error;
            }
        }

        function manyServices() {
            return {
                groupService: groupService
            }
        }

        function getByUrl(req){
            return $http.get(req);
        }

        function updateByUrl(req){
            return $http.put(req.url, req);
        }

    }

    SweetAlert.$inject = ['$rootScope'];

    function SweetAlert($rootScope){

        var swal = window.swal;

        //public methods
        var self = {

            swal: function ( arg1, arg2, arg3 ) {
                $rootScope.$evalAsync(function(){
                    if( typeof(arg2) === 'function' ) {
                        swal( arg1, function(isConfirm){
                            $rootScope.$evalAsync( function(){
                                arg2(isConfirm);
                            });
                        }, arg3 );
                    } else {
                        swal( arg1, arg2, arg3 );
                    }
                });
            },
            success: function(title, message) {
                $rootScope.$evalAsync(function(){
                    swal( title, message, 'success' );
                });
            },
            error: function(title, message) {
                $rootScope.$evalAsync(function(){
                    swal( title, message, 'error' );
                });
            },
            warning: function(title, message) {
                $rootScope.$evalAsync(function(){
                    swal( title, message, 'warning' );
                });
            },
            info: function(title, message) {
                $rootScope.$evalAsync(function(){
                    swal( title, message, 'info' );
                });
            },
            showInputError: function(message) {
                $rootScope.$evalAsync(function(){
                    swal.showInputError( message );
                });
            },
            close: function() {
                $rootScope.$evalAsync(function(){
                    swal.close();
                });
            }
        };

        return self;
    }
})();
