(function () {

  'use-strict';

  var app = angular.module('inspinia');
  
  app.factory('VersionService', function($http, $interval, $window,$localStorage) {
    var currentVersion = null;
    var timer = null;

    function checkVersion() {
      return $http.get('/version.json', {
        cache: false,
        params: { t: Date.now() } // cache-buster
      }).then(function(res) {
        var newVersion = res.data && res.data.version;
        $localStorage.versionNueva=newVersion;
        $localStorage.versionAnterior=currentVersion;
        console.log('cureentVersion:',currentVersion, 'newVersion:',newVersion)
        if (!currentVersion) {
          currentVersion = newVersion;
          return;
        }

        if (newVersion && currentVersion !== newVersion) {
          // Mejor que reload(true): forzar nueva carga con query
          $window.location.href = $window.location.pathname + '?_v=' + encodeURIComponent(newVersion);
        }
      }).catch(function(){});
    }

    function start(intervalMs) {
      if (timer) return; // ya está corriendo
      checkVersion();
      timer = $interval(checkVersion, intervalMs || 60000);
    }

    function stop() {
      if (timer) {
        $interval.cancel(timer);
        timer = null;
      }
    }

    return {
      start: start,
      stop: stop,
      checkVersion: checkVersion
    };
  });

}());
