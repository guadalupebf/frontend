(function() {
    'use strict';

    angular
        .module('inspinia')
        .factory('providerService', providerService);

    providerService.$inject = ['url', '$http', '$localStorage'];


    function providerService(url, $http, $localStorage) {
        var infoUser = $localStorage.infoUser;
        var service = {
            createProvider: createProvider,
            getProviders: getProviders,
            getProvidersFi: getProvidersFi,
            getProvider: getProvider,
            getProviderByUri: getProviderByUri,
            updateProvider: updateProvider,
            deleteProvider: deleteProvider,
            getReadProviders:getReadProviders,
            getReadListProviders:getReadListProviders,
            getReadListTableProviders: getReadListTableProviders,
            getProviderById:getProviderById,
            getProviderFull:getProviderFull,
            getProviderByKey: getProviderByKey,
            getAfianzadoraPoviderByKey: getAfianzadoraPoviderByKey,
            getProviderFiByKey: getProviderFiByKey,
            getEmailContacts: getEmailContacts,
            getClaves : getClaves
        };

        return service;

        ////////////

        // CREATE
        function createProvider(data) {
            return $http.post(url.IP + 'proveedores/', data)
                .then(createProviderComplete)
                .catch(createProviderFailed);

            function createProviderComplete(response) {
                return response.data;
            }

            function createProviderFailed(error) {
                return error;
            }
        }


        function getProviderByKey (data) {
          var test = {start_date: data};
            infoUser = $localStorage.infoUser;
            // if(infoUser.staff && !infoUser.superuser){
            //     var show_group = 'v2/aseguradoras/get-aseguradoras-clave/';
            var show_group = 'get-aseguradoras-clave/';
            return $http.get(url.IP + show_group + '?date='+data+'&');
        }

        function getAfianzadoraPoviderByKey (data, type) {
            var test = {start_date: data};
            type = type ? type : 0
            infoUser = $localStorage.infoUser;
            // if(infoUser.staff && !infoUser.superuser){
            //     var show_group = 'v2/aseguradoras/get-aseguradoras-clave/';
            var show_group = 'get-provider-clave/';
            return $http.get(url.IP + show_group + '?date='+data+'&'+ 'type='+ type + '&');
        }

          
        function getProviderFiByKey (data) {
          var test = {start_date: data};
          infoUser = $localStorage.infoUser;
          // if(infoUser.staff && !infoUser.superuser){
          //   var show_provider = 'v2/fianzas/get-afianzadoras-clave';
          var show_provider = 'get-afianzadoras-clave';
          
          return $http.get(url.IP + show_provider + '?date='+data+'&');
        }

        //   READ
        function getProviders() {
            return $http.get(url.IP + 'proveedores/')
                .then(getProvidersComplete)
                .catch(getProvidersFailed);

            function getProvidersComplete(response) {
                return response.data.results;
            }

            function getProvidersFailed(error) {
                return error;
            }
        }

        function getProvidersFi() {
            infoUser = $localStorage.infoUser;
            // if(infoUser.staff && !infoUser.superuser){
            //     var show_provider_list = 'v2/fianzas/afianzadoras';
            var show_provider_list = 'afianzadoras';          
            return $http.get(url.IP + show_provider_list)
                .then(getProvidersComplete)
                .catch(getProvidersFailed);

            function getProvidersComplete(response) {
                return response.data.results;
            }

            function getProvidersFailed(error) {
                return error;
            }
        }

        function getReadProviders() {

            return $http.get(url.IP + 'proveedores-resume/')
                .then(getProvidersComplete)
                .catch(getProvidersFailed);

            function getProvidersComplete(response) {
                return response.data.results;
            }

            function getProvidersFailed(error) {
                return error;
            }
        }

        // Alimenta el dropdown
        function getReadListProviders() {
            infoUser = $localStorage.infoUser;
            // if(infoUser.staff && !infoUser.superuser){
            //     var show_provider = 'v2/aseguradoras/proveedores-resume-list/';
            var show_provider = 'proveedores-resume-list/';
            
            return $http.get(url.IP + show_provider)
                .then(getProvidersComplete)
                .catch(getProvidersFailed);

            function getProvidersComplete(response) {

                return response.data;
                // return response.data.results;
                // var results = {
                //   data: response.data,
                //   config: {
                //     count: response.data.count,
                //     next: response.data.next,
                //     previous: response.data.previous
                //   }
                // };

                // return results;

            }

            function getProvidersFailed(error) {
                return error;
            }
        }


        // alimentar la tabla con este endpoint
        function getReadListTableProviders() {
            infoUser = $localStorage.infoUser;
            // if(infoUser.staff && !infoUser.superuser){
            //     var show_provider_all = 'v2/aseguradoras/proveedores-table-resume/';
            var show_provider_all = 'proveedores-table-resume/';            
            return $http.get(url.IP + show_provider_all)
                .then(getProvidersComplete)
                .catch(getProvidersFailed);

            function getProvidersComplete(response) {
                
                // return response.data;
                // return response.data.results;
                var results = {
                  data: response.data,
                  config: {
                    count: response.data.count,
                    next: response.data.next,
                    previous: response.data.previous
                  }
                };

                return results;

            }

            function getProvidersFailed(error) {
                return error;
            }
        }


        function getProviderByUri(uri) {
            return $http.get(uri)
                .then(getProviderComplete)
                .catch(getProviderFailed);

            function getProviderComplete(response) {
                return response;
            }

            function getProviderFailed(error) {
                return error;
            }
        }

        function getProviderById(id) {
            return $http.get(url.IP + 'proveedores-info/' +id)
                .then(getProviderComplete)
                .catch(getProviderFailed);

            function getProviderComplete(response) {
                return response;
            }

            function getProviderFailed(error) {
                return error;
            }
        }

        function getClaves(data) {
            
            return $http.get(url.IP + 'claves-resume/')
                .then(getClavesComplete)
                .catch(getClavesFailed);

            function getClavesComplete(response) {
                return response.data;
            }

            function getClavesFailed(error) {
                return error;
            }
        }

        function getProviderFull(data) {
            if (!isNaN(Number(data.aseguradoraId))) {
                data.aseguradoraId = url.IP + 'proveedores/' + data.aseguradoraId + '/';
            } else if (data.provider) {
                data.aseguradoraId = data.provider;
            } else if (data.aseguradora) {
                data.aseguradoraId = data.aseguradora;
            }
            else {
                data.aseguradoraId = data.aseguradoraId;
            }
            return $http.get(data.aseguradoraId)
                .then(getProviderComplete)
                .catch(getProviderFailed);

            function getProviderComplete(response) {
                return response.data;
            }

            function getProviderFailed(error) {
                return error;
            }
        }


        function getProvider(data) {
            if (!isNaN(Number(data.aseguradoraId))) {
                data.aseguradoraId = url.IP + 'proveedores-resume/' + data.aseguradoraId + '/';
            } else if (data.provider) {
                data.aseguradoraId = data.provider;
            } else if (data.aseguradora) {
                data.aseguradoraId = data.aseguradora;
            }
            else {
                data.aseguradoraId = data.aseguradoraId;
            }
            return $http.get(data.aseguradoraId)
                .then(getProviderComplete)
                .catch(getProviderFailed);

            function getProviderComplete(response) {
                return response.data;
            }

            function getProviderFailed(error) {
                return error;
            }
        }

        //UPDATE
        function updateProvider(data) {
            return $http.put(url.IP + 'proveedores/' + data.id + '/', data)
                .then(updateProviderComplete)
                .catch(updateProviderFailed);

            function updateProviderComplete(response) {
                return response;
            }

            function updateProviderFailed(error) {
                return error;
            }
        }

        //DELETE
        function deleteProvider(data) {
            if (!isNaN(Number(data.aseguradoraId))) {
                data.aseguradoraId = url.IP + 'proveedores/' + data.aseguradoraId + '/';
            }
            return $http.delete(data.aseguradoraId)
                .then(deleteProviderComplete)
                .catch(deleteProviderFailed);

            function deleteProviderComplete(response, status, headers, config) { //jshint ignore:line
                return response;
            }

            function deleteProviderFailed(error) { //jshint ignore:line
                return error;
            }
        }

        function getEmailContacts(provider) {
            return $http({
                method: 'GET',
                url: url.IP + 'provider-contact-email',
                params: {
                    provider_policy: provider
                }
            })
        }

    }

})();
