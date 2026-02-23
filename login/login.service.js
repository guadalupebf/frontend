(function () {
  'use strict';
  // NOTE http://jasonwatmore.com/post/2015/03/10/AngularJS-User-Registration-and-Login-Example.aspx#userservice
  // NOTE http://jasonwatmore.com/post/2014/05/26/AngularJS-Basic-HTTP-Authentication-Example.aspx
  angular
    .module('inspinia')
    .factory('loginService', loginService);

  loginService.$inject = ['url', '$http', '$q','$sessionStorage','$localStorage','$rootScope'];

  function loginService(url, $http, $q, $sessionStorage,$localStorage,$rootScope) {
    var service = {
      login: login
    };

    return service;

    ////////////

    function login(user) {
      var dfd = $q.defer();
      dfd.resolve('');
      //$http.post(url.IP + 'token-auth/', user)
      //  .then(loginComplete)
      //  .catch(loginFailed);

      function loginComplete(response) {
        if(response.status >= 200 && response.status < 300){
          dfd.resolve(response.data.token);
          $sessionStorage.permisos = response.data.permisos;
          $sessionStorage.infoUser = response.data;
          $rootScope.permisos = response.data.permisos;
          $localStorage.permisos = response.data.permisos;
          $localStorage.infoUser = response.data;
        }else{
          dfd.reject("Status: " + response.status);
        }
      }

      function loginFailed(error) {
        dfd.reject(error);
      }
      
      return dfd.promise;
    }
  }

})();
