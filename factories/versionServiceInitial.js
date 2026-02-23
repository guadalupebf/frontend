(function () {
  'use strict';

  var app = angular.module('inspinia');

  app.factory('VersionService_', function($http, $interval, $window, $localStorage) {
    var currentVersion = null;
    var timer = null;

    function hardReload(newVersion) {
      var loc = $window.location;

      var base = loc.origin + loc.pathname;
      var hash = loc.hash || '';

      var search = loc.search || '';
      search = search.replace(/([?&])_v=[^&]*/g, '').replace(/[?&]$/, '');

      var sep = search ? '&' : '?';
      $window.location.href = base + search + sep + '_v=' + encodeURIComponent(newVersion) + hash;
    }

    function checkVersion() {
      return $http.get('/version.json', {
        cache: false,
        params: { t: Date.now() }
      }).then(function(res) {
        var newVersion = res.data && res.data.version;

        $localStorage.versionNueva = newVersion;
        $localStorage.versionAnterior = currentVersion;
        console.log('iiiiiiii',currentVersion,newVersion)
        if (!newVersion) return;

        if (!currentVersion) {
          currentVersion = newVersion;
          return;
        }

        if (currentVersion !== newVersion) {
          hardReload(newVersion);
        }
      }).catch(function(){});
    }

    function start(intervalMs) {
      if (timer) return;
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

  // app.run(function(VersionService_) {
  //   VersionService_.start(60000);
  // });

}());
