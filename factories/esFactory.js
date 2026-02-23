(function () {

    'use-strict';
  
    var app = angular.module('inspinia');
  
    app.factory('esFactory', ['$http', 'url',function($http, url) {
  
        var esFactory = {}; 
        esFactory.get = function (parUrl, parData) {

            return $http({
                method: 'GET',
                url: parUrl,
                headers:  {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                data: parData
            });
    
        };
      return esFactory;
    // app.service('es', function (esFactory) {
    //     return esFactory({
    //         host: url.SUPERBUSCADOR_ANCORA,
    //         // ...
    //     });
    // });
  
    }]);
  
  }());