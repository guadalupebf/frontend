(function () {

  'use-strict';

  var app = angular.module('inspinia');

  app.factory('dataFactory', ['$http', 'url',function($http, url) {

    var dataFactory = {};

    dataFactory.get = function (parUrl, parData) {

      if(parUrl == 'get-pdf'){
        
        return $http({
          method: 'GET',
          url: url.IP + parUrl,
          params: parData,
          headers:  {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/x-www-form-urlencoded'
          },
          data: parData,
          responseType: 'arraybuffer'
        });
      } else {

        return $http({
          method: 'GET',
          url: url.IP + parUrl,
          params: parData,
          headers:  {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/x-www-form-urlencoded'
          },
          data: parData
        });
      }

    };

    dataFactory.post = function (parUrl, parData) {

      return $http({
        method: 'POST',
        url: url.IP + parUrl,
        headers:  {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/x-www-form-urlencoded'
        },
        data: parData
      });

    };

    dataFactory.update = function(parUrl, parData) {

      return $http({
        method: 'PATCH',
        url: url.IP + parUrl,
        headers:  {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/x-www-form-urlencoded'
        },
        data: parData
      });

    };

    dataFactory.patch = function(parUrl, parData) {

      return $http({
        method: 'PATCH',
        url: parUrl,
        headers:  {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/x-www-form-urlencoded'
        },
        data: parData
      });

    };
    dataFactory.postCas = function (parUrl, parData) {

      return $http({
        method: 'POST',
        url: url.casIp + parUrl,
        headers:  {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/x-www-form-urlencoded'
        },
        data: parData
      });

    };

    return dataFactory;

  }]);

}());