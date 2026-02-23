(function() {
    'use strict';

    angular
        .module('inspinia')
        .factory('groupService', groupService);

    groupService.$inject = ['url', '$http', 'fileService', '$localStorage'];

    function groupService(url, $http, fileService, $localStorage) {

        var infoUser = $localStorage.infoUser;

        var service = {
            createGroup: createGroup,
            getGroups: getGroups,
            getFullGroups: getFullGroups,
            getGroup: getGroup,
            getFiles: getFiles,
            updateGroup: updateGroup,
            deleteGroup: deleteGroup,
            getTableGroups: getTableGroups,
        };

        return service;

        ////////////

        // CREATE
        function createGroup(data) {
            return $http.post(url.IP + 'grupos/', data)
                .then(createGroupComplete)
                .catch(createGroupFailed);

            function createGroupComplete(response) {
                return response;
            }

            function createGroupFailed(error) {
                return error;
            }
        }

        //   READ
        function getFullGroups() {
            return $http.get(url.IP + 'grupos-full/')
                .then(getGroupsComplete)
                .catch(getGroupsFailed);

            function getGroupsComplete(response) {
                return response.data.results;
            }

            function getGroupsFailed(error) {
                return error;
            }
        }
        
        function getTableGroups() {
            infoUser = $localStorage.infoUser;
            var search_group = 'grupos-table-resume';
            return $http.get(url.IP + search_group)
                .then(getTableGroupsComplete)
                .catch(getTableGroupsFailed);

            function getTableGroupsComplete(response) {
                //return response.data.results;
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

            function getTableGroupsFailed(error) {
                return error;
            }
        }


        function getGroups() {
            infoUser = $localStorage.infoUser;
            var show_group = 'grupos-resume';
            return $http.get(url.IP + show_group)
                .then(getGroupsComplete)
                .catch(getGroupsFailed);

            function getGroupsComplete(response) {
                return response.data;
            }

            function getGroupsFailed(error) {
                return error;
            }
        }

        function getGroup(data) {
            if (!isNaN(Number(data.grupoId))) {
                data.grupoId = url.IP + 'grupos/' + data.grupoId + '/';
            } else {
                data.grupoId = data.group;
            }
            return $http.get(data.grupoId)
                .then(getGroupComplete)
                .catch(getGroupFailed);

            function getGroupComplete(response) {
                return response.data;
            }

            function getGroupFailed(error) {
                return error;
            }
        }

        function getFiles(data) {
          return fileService.getFiles(data.grupoId + 'archivos/');
            /*return $http.get(data.grupoId + 'archivos/')
                .then(getFilesComplete)
                .catch(getFilesFailed);

            function getFilesComplete(response) {
                return response.data.results;
            }

            function getFilesFailed(error) {
                ////console.log('getFilesFailed', error);
                return error;
            }*/
        }

        //UPDATE
        function updateGroup(data) {
            return $http.put(url.IP + 'grupos/' + data.id + '/', data)
                .then(updateGroupComplete)
                .catch(updateGroupFailed);

            function updateGroupComplete(response) {
                return response;
            }

            function updateGroupFailed(error) {
                return error;
            }
        }


        //DELETE
        function deleteGroup(obj) {
            return $http.delete(obj.url)
                .then(deleteGroupComplete)
                .catch(deleteGroupFailed);

            function deleteGroupComplete(response, status, headers, config) { //jshint ignore:line
                return response;
            }

            function deleteGroupFailed(response, status, headers, config) { //jshint ignore:line
            }
        }

    }

})();
