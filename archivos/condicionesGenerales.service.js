(function(){
  'use strict';

  angular.module('inspinia')
    .service('CondicionesGeneralesService', CondicionesGeneralesService);

  CondicionesGeneralesService.$inject = ['$http', 'url'];

  function CondicionesGeneralesService($http, url) {
    var baseUrl = url.IP + 'condiciones-generales/';

    this.list = function(filters) {
      var params = angular.copy(filters || {});
      if (params.provider && !params.aseguradora) {
        params.aseguradora = params.provider;
      }
      return $http.get(baseUrl, { params: params });
    };

    this.create = function(formData) {
      return $http.post(baseUrl, formData, {
        transformRequest: angular.identity,
        headers: { 'Content-Type': undefined }
      });
    };

    this.update = function(id, payload) {
      return $http.patch(baseUrl + id + '/', payload);
    };

    this.remove = function(id) {
      return $http.delete(baseUrl + id + '/');
    };

    this.getByPolicy = function(policyId) {
      return $http.get(url.IP + 'polizas/' + policyId + '/condiciones-generales/');
    };

    this.patchShared = function(policyId, relId, shared){
      return $http.patch(
        url.IP + 'polizas/' + policyId + '/condiciones-generales/' + relId + '/',
        { shared: shared }
      );
    };
    this.saveSelectionForPolicy = function(policyId, selectedIds) {
      return $http.post(url.IP + 'polizas/' + policyId + '/condiciones-generales/set/', {
        document_ids: selectedIds
      });
    };
    this.usage = function(id){
      return $http.get(url.IP + 'condiciones-generales/' + id + '/usage/', {        
      });
    }

    this.removeFromPolicy = function(policyId, conditionId) {
      return $http.delete(url.IP + 'polizas/' + policyId + '/condiciones-generales/' + conditionId + '/');
    };
  }
})();
