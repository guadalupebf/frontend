(function () {

  'use-strict';

  var app = angular.module('inspinia');
  // --------------------------------------------------
  app.factory('NotificationService', ['$http', 'url','$rootScope', '$timeout','dataFactory','$sessionStorage',function($http, url,$rootScope, $timeout,dataFactory,$sessionStorage) {
    var service = {};
    service.getNotifications = function() {
      if ($sessionStorage.token !== undefined) {
        return dataFactory.get('notifications-test')
          .then(function success(response) {
              $timeout(function() {
                $rootScope.notificationscount = response.data.count;
                $rootScope.$evalAsync(function() {
                    $rootScope.notificationscount = response.data.count;
                });
            });
        });
      }
    };
    return service;
  }]);
}());