(function () {

  'use-strict';

  var app = angular.module('inspinia');

  app.factory('mcFactory', ['$http', 'url', '$localStorage', function($http, url, $localStorage) {

    if($localStorage.loginInfo) {
      
      var user_info = JSON.parse($localStorage.loginInfo);

      return {
        urlname: user_info.org.urlname + 'mc'
      }
    }  else {
      return null;
    }



    // return {
    //   urlname: 'local',
    //   user: 'angy',
    //   password: '123'
    // };

     // return {
     //    'username': 'testing',
     //    'password': 'testing',
     //    'urlname': 'testing'
     //  };
    // return {
    //   urlname: 'grupoasapi',
    //   user: 'superuser_prevex',
    //   password: 'superuser_prevex'
    // }


  }]);

}());