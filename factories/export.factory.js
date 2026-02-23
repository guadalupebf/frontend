(function () {

  'use-strict';

  var app = angular.module('inspinia');

  app.factory('exportFactory', ['$http','url','$q','$sessionStorage','SweetAlert', function($http, url, $q, $sessionStorage, SweetAlert) {

    var exportFactory = {};

    exportFactory.excel = function (parData, parName) {

      var wb = XLSX.utils.json_to_sheet(parData);

      var workbook = {
        "SheetNames": [
          "Plough &amp; Stars"
        ],
        "Sheets": {
          "Plough &amp; Stars": wb,
          "!ref": wb['!ref']
          }
      };

      var wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
      function s2ab(s) {

          var buf = new ArrayBuffer(s.length);
          var view = new Uint8Array(buf);

          for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
          return buf;
      }

      saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream"}), "Reporte_" + parName +'.xlsx');

      return 'ok';

    };

    function buildQueryParams(params) {
      params = params || {};
      return Object.keys(params).filter(function(key) {
        return params[key] !== undefined && params[key] !== null && params[key] !== '';
      }).map(function(key) {
        return key + '=' + encodeURIComponent(params[key]);
      }).join('&');
    }

    function decryptToken() {
      var tokenValue = '';
      try {
        var storedToken = $sessionStorage.token ? JSON.parse(sjcl.decrypt("Token", $sessionStorage.token)) : '';
        if (storedToken && typeof storedToken === 'object' && storedToken.token) {
          tokenValue = storedToken.token;
        } else if (storedToken) {
          tokenValue = storedToken;
        }
      } catch (e) {
        console.warn('exportFactory: no token available', e);
      }
      return tokenValue;
    }

    function defaultChannelMapper(responseData) {
      if (!responseData) {
        return '';
      }
      if (typeof responseData === 'string') {
        return responseData;
      }
      return responseData.channel || responseData.task || responseData.id || responseData.name || '';
    }

    function normalizeUrl(u) {
      return u || '';
    }


    function extractUrl(payload) {
      if (!payload) return '';

      // Si el socket ya manda el signed URL como string, úsalo tal cual
      if (typeof payload === 'string') {
        try {
          var parsed = JSON.parse(payload);
          return extractUrl(parsed);
        } catch (e) {
          return payload;
        }
      }

      // Si manda objeto, toma el campo que traiga la URL completa
      var full = payload.url || payload.download_url || payload.signed_url || payload.path || '';

      // Si por alguna razón el backend manda params separados, reconstrúyelos
      // (esto evita que se pierda el querystring)
      if (full && full.indexOf('?') === -1) {
        var qs = payload.query || payload.qs || '';
        if (!qs) {
          var parts = [];
          if (payload.AWSAccessKeyId) parts.push('AWSAccessKeyId=' + encodeURIComponent(payload.AWSAccessKeyId));
          if (payload.Signature)     parts.push('Signature=' + encodeURIComponent(payload.Signature));
          if (payload.Expires)       parts.push('Expires=' + encodeURIComponent(payload.Expires));
          if (parts.length) qs = parts.join('&');
        }
        if (qs) full = full + '?' + qs;
      }
      

      return full;
    }


    function triggerDownload(downloadUrl, payload, options) {
      if (!downloadUrl) {
        return $q.reject(new Error('No se proporcionó URL de descarga'));
      }
      return $q(function(resolve) {
        if (typeof options.onDownload === 'function') {
          options.onDownload(downloadUrl, payload);
          resolve(payload);
          return;
        }
         var bodyHtml =
            '<p>Tu bitacora está lista, haz clic en descargar</p>';

          SweetAlert.swal({
            title: 'Archivo listo',
            text: bodyHtml,     // <-- en v1 es "text"
            html: true,         // <-- habilita HTML en el texto
            type: 'success',
            showCancelButton: false,
            confirmButtonText: 'Descargar'
          }, function(isConfirm) {
            if (isConfirm) {
              window.open(downloadUrl, '_blank');
            }
            resolve(payload);
          });

          // Forzar HTML en el botón confirm (porque v1 lo escapa)
          setTimeout(function () {
            var btn = document.querySelector('.sweet-alert button.confirm');
            if (btn) {
              btn.innerHTML = '<i class="fa fa-download" aria-hidden="true" style="margin-right:8px;"></i> Descargar';
            }
          }, 0);

      })
      .then(function(result) {
        if (typeof options.onReady === 'function') {
          options.onReady(result);
        }
        return result;
      });
    }


    function defaultDownloadUrl(payload) {
      return extractUrl(payload);
    }

    function subscribeToChannel(channel, options) {
      var deferred = $q.defer();
      var socketUrl = options.socketUrl || url.REPORT_SERVICE_NODE_SOCKET;
      console.log('exportFactory subscribing to channel', channel, 'via', socketUrl);
      var socket = io.connect(socketUrl);

      var cleanup = function() {
        if (socket) {
          socket.disconnect();
          socket = null;
        }
      };

      socket.emit('subscribe', channel);

      socket.on(channel, function(payload) {
        var downloadUrl = (options.downloadUrlResolver || defaultDownloadUrl)(payload);
        if (!downloadUrl) {
          deferred.reject(new Error('No se recibió una URL de descarga'));
          cleanup();
          return;
        }
        triggerDownload(downloadUrl, payload, options)
        .then(function(result) {
          deferred.resolve(result);
        })
        .catch(function(err) {
          deferred.reject(err);
        })
        .finally(function() {
          cleanup();
        });
      });

      socket.on('error', function(err) {
        cleanup();
        deferred.reject(err);
      });

      return deferred.promise;
    }

    exportFactory.commentsExport = function (options) {
      options = options || {};
      var params = options.params || {};
      var query = buildQueryParams(params);
      if (!query) {
        return $q.reject(new Error('No se proporcionaron parámetros'));
      }

      var exportUrl = url.IP + 'comments-export/?' + query;
      var headers = {};
      var bearerToken = options.token || decryptToken();
      if (bearerToken) {
        headers.Authorization = 'Bearer ' + bearerToken;
      }

      return $http({
        method: 'GET',
        url: exportUrl,
        headers: headers
      }).then(function(response) {
        console.log("Es una prueba response",response)
        if (!response || response.status < 200 || response.status >= 300 || !response.data) {
          throw new Error('La descarga falló');
        }
        var payload = response.data;
        var directUrl = (options.directUrlResolver || defaultDownloadUrl)(payload);
        if (directUrl) {
          return triggerDownload(directUrl, payload, options);
        }
        var channel = (options.channelMapper || defaultChannelMapper)(payload);
        if (!channel) {
          throw new Error('No se pudo determinar el canal de exportación');
        }
        return subscribeToChannel(channel, options);
      });
    };
    

    return exportFactory;

  }]);

}());
