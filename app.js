$.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
  options.async = true;
});
(function () {
'use strict';

  function purgeInvalidNgStorageEntries(storage, label) {
    if (!storage || typeof storage.length !== 'number') {
      return;
    }

    var keys = [];
    for (var idx = 0; idx < storage.length; idx++) {
      try {
        var key = storage.key(idx);
        if (key && key.indexOf('ngStorage-') === 0) {
          keys.push(key);
        }
      } catch (error) {
        console.warn('[ngStorage][scan] No se pudo leer la llave en', label, error);
      }
    }

    keys.forEach(function (key) {
      try {
        var rawValue = storage.getItem(key);
        if (rawValue === null || rawValue === undefined || rawValue === '') {
          storage.removeItem(key);
          return;
        }

        // ngStorage guarda JSON.stringify(valor). Si la cadena no es JSON válido,
        // JSON.parse lanzará excepción y eliminamos la entrada dañada.
        JSON.parse(rawValue);
      } catch (error) {
        console.warn('[ngStorage] Eliminando entrada corrupta', key, 'desde', label, error);
        try {
          storage.removeItem(key);
        } catch (removeError) {
          console.warn('[ngStorage] No se pudo eliminar la entrada corrupta', key, removeError);
        }
      }
    });
  }

  var hasWindowObject = typeof window !== 'undefined';
  if (hasWindowObject) {
    try {
      purgeInvalidNgStorageEntries(window.localStorage, 'localStorage');
    } catch (error) {
      console.warn('[ngStorage] No se pudo depurar localStorage', error);
    }

    try {
      purgeInvalidNgStorageEntries(window.sessionStorage, 'sessionStorage');
    } catch (error) {
      console.warn('[ngStorage] No se pudo depurar sessionStorage', error);
    }
  }

angular.module('naif.base64', [])
  .directive('baseSixtyFourInput', ['$window', '$q', function ($window, $q) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        var isMultiple = attrs.hasOwnProperty('multiple');

        if (!$window.FileReader) {
          ngModel.$setValidity('base64', false);
          return;
        }

        ngModel.$render = function () {
          if (!ngModel.$viewValue) {
            element.val(null);
          }
        };

        element.on('change', function (event) {
          var files = (event.target && event.target.files) ? event.target.files : null;

          if (!files || !files.length) {
            scope.$applyAsync(function () {
              var emptyValue = isMultiple ? [] : null;
              ngModel.$setViewValue(emptyValue);
              if (attrs.required) {
                ngModel.$setValidity('required', false);
              }
            });
            element.val(null);
            return;
          }

          var readPromises = [];

          angular.forEach(files, function (file) {
            readPromises.push(readFile(file));
          });

          $q.all(readPromises).then(function (results) {
            scope.$applyAsync(function () {
              ngModel.$setValidity('base64', true);
              var viewValue = isMultiple ? results : results[0];
              ngModel.$setViewValue(viewValue);

              if (attrs.required) {
                var hasValue = isMultiple ? !!(viewValue && viewValue.length) : !!viewValue;
                ngModel.$setValidity('required', hasValue);
              }

              if (attrs.onChange) {
                scope.$eval(attrs.onChange, { $files: results, $event: event });
              }
            });
          }, function () {
            scope.$applyAsync(function () {
              ngModel.$setValidity('base64', false);
              var emptyValue = isMultiple ? [] : null;
              ngModel.$setViewValue(emptyValue);
              if (attrs.required) {
                ngModel.$setValidity('required', false);
              }
            });
          }).finally(function () {
            element.val(null);
          });
        });

        scope.$on('$destroy', function () {
          element.off('change');
        });

        function readFile(file) {
          var deferred = $q.defer();

          try {
            var reader = new $window.FileReader();

            reader.onload = function (loadEvent) {
              var result = loadEvent.target.result || '';
              var commaIndex = result.indexOf(',');

              if (commaIndex >= 0) {
                result = result.substring(commaIndex + 1);
              }

              deferred.resolve({
                filename: file.name,
                filetype: file.type,
                filesize: file.size,
                base64: result,
                file: file
              });
            };

            reader.onerror = function (error) {
              deferred.reject(error);
            };

            reader.readAsDataURL(file);
          } catch (error) {
            deferred.reject(error);
          }

          return deferred.promise;
        }
      }
    };
  }]);

var app = angular.module('inspinia', [
  'ngAnimate',
  'ngCookies',
  'ngTouch',
  'ngSanitize',
  'ngResource',
  'ngMessages',
  'ngAria',
  'ui.router',
  'ui.bootstrap',
  'oc.lazyLoad',
  'datatables',
  'ngStorage',
  'config',
  'chart.js',
  'ui.select',
  'bcherny/formatAsCurrency',
  'naif.base64',
  'datePicker',
  'toaster',
  'angularFileUpload',
  'ui.footable',
  'ngIdle',
  'Dragtable',
  'textAngular',
  'ngTagsInput',
  'mwl.calendar',
  'firebase',
  // 'ngRaven',
]).directive('onFinishRender', function ($timeout) {
  return {
    restrict: 'A',
    transclude: false,
    link: function (scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function () {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  };
});

app.constant('project', {
  NAME: 'Beneficios',
  VERSION: 'v0.5.0'
});

app.run(function (DTDefaultOptions) {
  DTDefaultOptions.setLanguageSource('https://cdn.datatables.net/plug-ins/1.10.10/i18n/Spanish.json');
});

// --- PATCH: helper de desencriptado seguro (evita reventar en blanco)
window.safeDecrypt = function(label, blob) {
  try {
    if (typeof blob !== 'string' || blob.length < 10 || blob[0] !== '{') return null;
    var txt = sjcl.decrypt(label, blob);
    // puede ser JSON o string; tratamos de parsear
    try { return JSON.parse(txt); } catch(_) { return txt; }
  } catch (e) { return null; }
};

app.run( function ($localStorage, $location, $sessionStorage, $rootScope, toaster, MESSAGES, $window,
    Idle, $state, $uibModal, $compile, dataFactory, PersistenceFactory, navigationService) {

  function normalizeTokenCandidate(candidate) {
    if (!candidate) {
      return null;
    }
    if (angular.isObject(candidate)) {
      try {
        candidate = JSON.stringify(candidate);
      } catch (_) {
        candidate = null;
      }
    }
    if (typeof candidate !== 'string') {
      return null;
    }
    var trimmed = candidate.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
      return null;
    }
    return trimmed;
  }

  function isEncryptedToken(token) {
    return angular.isString(token) && token.charAt(0) === '{';
  }

  function tokenLooksUsable(token) {
    var normalized = normalizeTokenCandidate(token);
    if (!normalized) {
      return false;
    }
    if (isEncryptedToken(normalized)) {
      try {
        return !!sjcl.decrypt('Token', normalized);
      } catch (error) {
        return false;
      }
    }
    return true;
  }

  function readStoredTokenCandidate() {
    return normalizeTokenCandidate($sessionStorage.token) ||
      normalizeTokenCandidate($localStorage.token) ||
      normalizeTokenCandidate($localStorage.authToken);
  }

  function hasUsableSession() {
    return tokenLooksUsable(readStoredTokenCandidate());
  }


  function resetStoredSession() {
    delete $sessionStorage.token;
    delete $sessionStorage.user;
    delete $sessionStorage.permisos;
    delete $sessionStorage.infoUser;
    delete $sessionStorage.actualPage;
    delete $localStorage.token;
    delete $localStorage.user;
    delete $localStorage.permisos;
    delete $localStorage.infoUser;
    delete $localStorage.authToken;
    if (!$localStorage.token) {
      delete $localStorage.actualPage;
    }
  }

  function stubAnonymousUser() {
    try {
      $sessionStorage.user = sjcl.encrypt('User', '{}');
    } catch (error) {
      $sessionStorage.user = '{}';
    }
  }

  var forcingLoginRedirect = false;

  function forceLoginRedirect(options) {
    options = options || {};
    var loginPath = '/login/auth';

    if (forcingLoginRedirect && options.force !== true) {
      if ($location.path() !== loginPath) {
        $location.path(loginPath).replace();
      }
      if ($window.location.hash !== '#' + loginPath) {
        $window.location.hash = '#' + loginPath;
      }
      return;
    }


    function navigateToLogin() {
      if ($location.path() !== loginPath) {
        $location.path(loginPath).replace();
      }
      if (!$state.current || $state.current.name !== 'login.login') {
        try {
          $state.go('login.login', {}, { reload: true, inherit: false, notify: true });

        } catch (error) {
          console.warn('No fue posible redirigir mediante $state, usando hash directo', error);
        }
      }
      if ($window.location.hash !== '#'+loginPath) {
        $window.location.hash = '#' + loginPath;
      }
    }

    forcingLoginRedirect = true;


    if (options.clear !== false) {
      resetStoredSession();
    }

    if (options.stubUser !== false) {
      stubAnonymousUser();
    }

    if ($rootScope.$$phase) {
      navigateToLogin();
    } else {
      $rootScope.$evalAsync(navigateToLogin);
    }

    Idle.unwatch();
  }

  var sessionBridge = $window.saamSessionControl || {};
  sessionBridge.resetStoredSession = resetStoredSession;
  sessionBridge.forceLoginRedirect = forceLoginRedirect;
  sessionBridge.stubAnonymousUser = stubAnonymousUser;
  sessionBridge.markLoginRestored = function () {
    forcingLoginRedirect = false;
  };
  sessionBridge.hasUsableSession = hasUsableSession;

  $window.saamSessionControl = sessionBridge;

  /* === PATCH: seed & migrate token entre pestañas === */
  if (!$localStorage.token && $localStorage.authToken) {
    try { $localStorage.token = sjcl.encrypt("Token", JSON.stringify($localStorage.authToken)); }
    catch (e) { $localStorage.token = $localStorage.authToken; } // fallback plano
  }
  var storedTokenCandidate = readStoredTokenCandidate();

  var hasSession = tokenLooksUsable(storedTokenCandidate);

  if (hasSession && storedTokenCandidate) {
    if (!$sessionStorage.token) {
      $sessionStorage.token = storedTokenCandidate;
    }
    if (!$localStorage.token) {
      $localStorage.token = storedTokenCandidate;
    }
  } else if (!hasSession) {
    resetStoredSession();
  }

  if (hasSession) {
    if (!$sessionStorage.user && $localStorage.user) {
      $sessionStorage.user = $localStorage.user;
    }
    if (!$sessionStorage.permisos && $localStorage.permisos) {
      $sessionStorage.permisos = $localStorage.permisos;
    }
    if (!$sessionStorage.infoUser && $localStorage.infoUser) {
      $sessionStorage.infoUser = $localStorage.infoUser;
    }

  }


  // 3) (opcional) LOGS de verificación
  console.log('> seed session.token?', !!$sessionStorage.token,
              'local.token?', !!$localStorage.token,
              'legacy authToken?', !!$localStorage.authToken,
              'session válido?', hasSession);

    try{
      $('.datepicker-me input').datepicker();
      $.fn.datepicker.defaults.format = 'dd/mm/yyyy';
      $.fn.datepicker.defaults.startView = 0;
      $.fn.datepicker.defaults.autoclose = true;
      $.fn.datepicker.defaults.language = 'es';
    }catch(e){}

  try{
    if ($location.$$search) {
      var parameter = $location.$$search;
      if (parameter.tipo) {
        if (parameter.tipo == 1) {
          $localStorage.url_operation = '/operacion.semanal'
        }
      }
    }
  }catch(error) {
    console.log('Login normal',error)
  }
   $rootScope.$watch(function () {
        return location.hash
    }, function (value) {
        function __tokenFromStorage__(){
          var enc = readStoredTokenCandidate();

          if (!enc) { return null; }
          if (isEncryptedToken(enc)) {
            try { return JSON.parse(sjcl.decrypt("Token", enc)); }
            catch(_){ return null; }
          }
          return enc;
        }

        var hasLiveToken = !!__tokenFromStorage__();

        if (hasLiveToken && $location.path() !== '/block-page' && $location.path() !== '/login/auth') {
          $sessionStorage.actualPage = $location.path();
          $localStorage.actualPage = $sessionStorage.actualPage;   // <-- NUEVO (compartido entre pestañas)
        }


        if (value !== '#/login/auth' && value !== '' && hasLiveToken) {
          dataFactory.get('schedule/');
        }
        
        if(value !== '/login/auth') {
          $(document).ready(function(){
            $(document).on('focus', ':input', function() {
              $(this).attr('autocomplete', 'off');
            });
            $('.js-example-basic-multiple').select2();
            $(window).scrollTop(0);
            if((!$localStorage.email_config) && (value !== '#/login/auth') && ((value.length > 0) || (value !== ""))){
              dataFactory.get('orginfo/')
              .then(function success(response) {
                if(response.data){
                  if(response.data.results){
                    if(response.data.results.length){
                      $localStorage.email_config = response.data.results[0];
                    }
                  }
                }
              })
            }
            if($sessionStorage && $sessionStorage.user){
              var usr = window.safeDecrypt("User", $sessionStorage.user);
              // if(usr.urlname == "ts"){
              //   main.org_pruebas = true;
              // } else {
              //   main.org_pruebas = false;
              // }
            }
          });

          // ACTUAL -------------------------------------------------------------
          $(document).on('keyup', "input[type=text]", function (e) {
            // console.log('input text ---',$('input[type=text]'));
            $('input[type=text]').attr('style', 'text-transform: uppercase');
            var exp = /\d\s\W/ ;
            if ($(this).val != exp && e.keyCode != 37 && e.keyCode != 38 && e.keyCode != 39 && e.keyCode != 40){
              $(this).val(function (_, val) {
                // console.log('val', val);
                return val.toUpperCase();
              });
            }
          });
        }
        //-- Stop PersistenceFactory in the change--//
        // if(PersistenceFactory.interval != ""){
        //   console.log('Apps - PersistenceFactory.interval: '+PersistenceFactory.interval)
        //   // clearInterval(PersistenceFactory.interval);
        //   PersistenceFactory.interval = '';
        //   PersistenceFactory.count = 0;
        // }
    });
   // ----validación correo

   // ----validación correo
    //Modificado new tab buscador
    // [SYNC] Acepta token de session o de localStorage
    console.log("sesion",$sessionStorage)
    console.log("localStorage",$localStorage)
    var rawHash = $window.location.hash || '';
    var hasExplicitRoute = rawHash.length > 1 && rawHash !== '#/' && rawHash !== '#';
    var potentialToken = readStoredTokenCandidate();
    var hasLiveToken = tokenLooksUsable(potentialToken);
    // Sembrar última ruta desde localStorage si la pestaña no la tiene y no se solicitó una ruta específica
    if (hasLiveToken && !hasExplicitRoute && !$sessionStorage.actualPage && $localStorage.actualPage &&

      $localStorage.actualPage !== '/block-page' && $localStorage.actualPage !== '/login/auth') {
      $sessionStorage.actualPage = $localStorage.actualPage;
    }

    if (hasSession) {
      // calcula último destino válido
      var last = $sessionStorage.actualPage;
      var isValidLast = last && last !== '/block-page' && last !== '/login/auth';
      var target = isValidLast ? last : '/index/main';
      // console.log('[redirect]', { last: $sessionStorage.actualPage, target, current: $location.path() });

      if (!hasExplicitRoute) {
        // evita redirecciones dobles
        if ($location.path() !== target) {
          $location.path(target);
        }
      }
    
      // (opcional) tu uppercase
      jQuery('input').off('keyup.saamUpper').on('keyup.saamUpper', function() {
        $(this).val($(this).val().toUpperCase());
      });
    } else {
      console.log("Sin sesión activa, redirigiendo a login");
      forceLoginRedirect();

    }



  // Detecta si hay o no internet
  $rootScope.online = navigator.onLine;
  $window.addEventListener("offline", function() {
    toaster.pop({
                    type: 'error',
                    title: MESSAGES.ERROR.ERRORINTERNETCONNECTION,
                    timeout: 0
                });
    //toaster.error(MESSAGES.ERROR.ERRORINTERNETCONNECTION)
    $rootScope.$apply(function() {
      $rootScope.online = false;
    });
  }, false);
  
  function ejecutar(){
    alert('-e-ee',$location)
    $location.replace() ;
    alert('-e-ee',$location)
  }

  $window.addEventListener("online", function() {
    toaster.clear();
    toaster.success(MESSAGES.INFO.SUCCESSINTERNETCONNECTION);
    $rootScope.$apply(function() {
      $rootScope.online = true;
    });
  }, false);

  // Idle timer
  // console.log('test', $location.path());
  if(!hasSession || $location.path() == '/login/auth') {
    Idle.unwatch();
  } else {
    Idle.watch();
  }

 function closeModals() {
    if ($rootScope.warning) {
      $rootScope.warning.close();
      $rootScope.warning = null;
    }
  }

  $rootScope.$on('IdleStart', function() {
    closeModals();

    $rootScope.warning = $uibModal.open({ //jshint ignore:line
      templateUrl: 'templates/modal-warning-lock.html',
      windowClass: 'modal-danger'
    });


    //toaster.warning('Tu sesión expirará en 5 segundos.');

  });
  // [SYNC] Escucha inicios/cierres de sesión desde otras pestañas

  $window.addEventListener('storage', function(e) {
    if (e.key !== 'saam_auth_event') return;

    if (!e.newValue) {
      return;
    }

    var payload;
    try {
      payload = JSON.parse(e.newValue);
    } catch (_) {
      payload = null;
    }

    if (payload && payload.type === 'logout') {
      resetStoredSession();
      $rootScope.$applyAsync(function(){ forceLoginRedirect({ clear: false }); });

      return;
    }

    if (payload && payload.type === 'login') {
      var incomingToken = normalizeTokenCandidate(payload.token);
      if (tokenLooksUsable(incomingToken)) {
        if (incomingToken) {
          $localStorage.token = incomingToken;
          $sessionStorage.token = incomingToken;
        }
        if (payload.user) {
          $localStorage.user = payload.user;
          $sessionStorage.user = payload.user;
        }
        if (payload.permisos) {
          $localStorage.permisos = payload.permisos;
          $sessionStorage.permisos = payload.permisos;
        }
        if (payload.infoUser) {
          $localStorage.infoUser = payload.infoUser;
          $sessionStorage.infoUser = payload.infoUser;
        }
        forcingLoginRedirect = false;

        $rootScope.$applyAsync();
      } else {
        resetStoredSession();
        $rootScope.$applyAsync(function(){ forceLoginRedirect({ clear: false }); });
      }

      return;
    }

    if (e.newValue === 'logout') {
      resetStoredSession();
      $rootScope.$applyAsync(function(){ forceLoginRedirect({ clear: false }); });

      return;
    }

    if (e.newValue.indexOf('login:') === 0) {
      var enc = normalizeTokenCandidate(e.newValue.slice('login:'.length));
      if (tokenLooksUsable(enc)) {

        $localStorage.token = enc;
        $sessionStorage.token = enc;
        $rootScope.$applyAsync();
      }
    }
  });

  $rootScope.$on('IdleEnd', function() {
    closeModals();
    //console.log('end');
  });

  $rootScope.$on('IdleTimeout', function() {
    closeModals();
    $state.go('block');
  });

  // ---- Idle timer end

});

// app.run(function(VersionService){})
// ❌ NO hagas esto si solo quieres en login
// app.run(function(VersionService){ VersionService.start(60000); });


app.factory('httpRequestInterceptor', function ($localStorage, $location, $q, $sessionStorage, url, SweetAlert, URLS_CONFIG, $window) {
  function tokenFromStorage() {
    var enc = $sessionStorage.token || $localStorage.token || $localStorage.authToken;
    if (!enc) return null;
    try {                      // token cifrado con SJCL
      var decrypted = sjcl.decrypt("Token", enc);
      return JSON.parse(decrypted);      // devuelve el JWT (string)
    } catch (e) {
      return enc;              // token plano (legacy)
    }
  }

  function normalizeTokenValue(candidate) {
    if (!candidate) {
      return null;
    }

    if (typeof candidate === 'string') {
      return candidate;
    }

    if (angular.isObject(candidate)) {
      if (candidate.token) {
        return candidate.token;
      }

      if (candidate.access || candidate.access_token) {
        return candidate.access || candidate.access_token;
      }
    }

    try {
      return candidate.toString();
    } catch (_) {
      return null;
    }
  }

  function describeTokenForLog(candidate) {
    var normalized = normalizeTokenValue(candidate);

    if (!normalized) {
      return {
        tokenPresent: false,
        tokenLength: 0,
        tokenSuffix: null
      };
    }

    var suffixLength = normalized.length > 8 ? 8 : normalized.length;

    return {
      tokenPresent: true,
      tokenLength: normalized.length,
      tokenSuffix: normalized.slice(normalized.length - suffixLength)
    };
  }

  function logRequestDecision(context, details) {
    // try {
    //   console.log('[SAAM][httpRequestInterceptor] ' + context, details || {});
    // } catch (_) {
    //   // Evitamos romper el flujo si el log falla.
    // }
  }
  
  return {
    request: request,
    responseError: responseError
  };

  function request(config) {
    if (!config.url) {
      config.url = "#";
    }

    var config_url = config.url;
    var normalizedConfigUrl = '';
    try {
      normalizedConfigUrl = config_url.toString().toLowerCase();
    } catch (_) {
      normalizedConfigUrl = '';
    }

    var bootstrapAuthFragments = [
      '/api-token-auth-saam/',
      '/api-token-refresh-saam/',
      '/api-token-verify-saam/',
      '/api-token-auth/'
    ];

    var isBootstrapAuthRequest = bootstrapAuthFragments.some(function (fragment) {
      return normalizedConfigUrl.indexOf(fragment) !== -1;
    });

    if (isBootstrapAuthRequest) {
      logRequestDecision('bootstrap auth request', {
        url: config.url
      });
      config.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      if (config.headers.Authorization) {
        delete config.headers.Authorization;
      }
      if (config.headers.authorization) {
        delete config.headers.authorization;
      }
      return config;
    }

    var skipAuthFragments = [
      '/get-image-or/'
    ];

    var shouldSkipAuth = skipAuthFragments.some(function (fragment) {
      return normalizedConfigUrl.indexOf(fragment) !== -1;
    });
    if (shouldSkipAuth) {
      logRequestDecision('skip auth for endpoint', {
        url: config.url
      });
      config.headers = config.headers || {};
      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json';

      if (config.headers.Authorization) {
        delete config.headers.Authorization;
      }
      if (config.headers.authorization) {
        delete config.headers.authorization;
      }

      return config;
    }

    if (config.url.endsWith('us-login')) {

      config.headers = {
        'Content-Type': 'application/json',
        //'Accept': 'application/x-www-form-urlencoded'
      };
      var jwt = tokenFromStorage();
      var normalizedJwt = normalizeTokenValue(jwt);
      if (normalizedJwt && !config.url.includes('get-user-picture')) {
        config.headers.Authorization = 'Bearer ' + normalizedJwt;
        var tokenLog = describeTokenForLog(normalizedJwt);
        tokenLog.url = config.url;
        logRequestDecision('attached Authorization (us-login)', tokenLog);
      } else {
        logRequestDecision('Authorization omitido (us-login)', {
          url: config.url,
          reason: normalizedJwt ? 'endpoint excluido' : 'sin token'
        });
      }


      return config;

    } else {
        if(config_url.indexOf("org") == -1) {
          if (!config.url.endsWith('html')) {
            if(config.url.endsWith('&')){
              if ($sessionStorage && $sessionStorage.user) {
                var usr = window.safeDecrypt("User", $sessionStorage.user);
                if (usr && usr.urlname) {
                  config.url = config.url + (config.url.indexOf('?') > -1 ? '&' : '?') + 'org=' + usr.urlname;
                }
              }
              
            }
            else if(config.url.endsWith('%')){
              config.url = config.url.replace('%','') ;
            }

            else if(!config.url.endsWith('token-auth/')){
              try{
                if($sessionStorage && $sessionStorage.user){
                  var usr = window.safeDecrypt("User", $sessionStorage.user);
                  config.url = config.url + '?org=' + usr.urlname;
                }
              }catch(error){
                console.log('-error-token-auth/-',error)
              }
            }

          } else {
            config.headers = {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            };
          }

          config.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };

          var jwt = tokenFromStorage();
          var normalizedJwt = normalizeTokenValue(jwt);
          if (normalizedJwt && !config.url.includes('get-user-picture')) {
            config.headers.Authorization = 'Bearer ' + normalizedJwt;
            var tokenLog = describeTokenForLog(normalizedJwt);
            tokenLog.url = config.url;
            logRequestDecision('attached Authorization (sin org)', tokenLog);
          } else {
            logRequestDecision('Authorization omitido (sin org)', {
              url: config.url,
              reason: normalizedJwt ? 'endpoint excluido' : 'sin token'
            });
          }
          // https://miurabox.atlassian.net/browse/DES-859
          if (config.data && Object.prototype.toString.call(config.data) === '[object FormData]') {
            delete config.headers['Content-Type'];
            config.transformRequest = angular.identity;
          }
          // https://miurabox.atlassian.net/browse/DES-859
          return config;
        } else {
          config.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          if($sessionStorage && $sessionStorage.user){
            var usr = window.safeDecrypt("User", $sessionStorage.user);
          }
          // ----------
          // if ($sessionStorage.user){
          //   var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
          //   var usr = JSON.parse(decryptedUser);
          // }
          // --------
          // ------ADD--- Excepción si existe org= no add config.url = config.url + '?org=' + usr.urlname; ----------
          var no_org = true;
          var exist_org_url = config_url.indexOf("org=") > -1;
          var exist_info = config_url.indexOf("orginfo") > -1;
          var exist_p = config_url.indexOf("?") > -1;
          if (exist_org_url == true ) {
            config.url = config_url;
            no_org = false;
            var jwt = tokenFromStorage();
            var normalizedJwt = normalizeTokenValue(jwt);
            if (normalizedJwt && !config.url.includes('get-user-picture')) {
              config.headers.Authorization = 'Bearer ' + normalizedJwt;
              var tokenLog = describeTokenForLog(normalizedJwt);
              tokenLog.url = config.url;
              logRequestDecision('attached Authorization (org en url)', tokenLog);
            } else {
              logRequestDecision('Authorization omitido (org en url)', {
                url: config.url,
                reason: normalizedJwt ? 'endpoint excluido' : 'sin token'
              });
            }



          }else
          if (no_org == false || exist_info == true){
            if( exist_p == true){
              config.url = config.url + '&org=' + usr.urlname;
            }else{
              config.url = config.url + '?org=' + usr.urlname;
            }
            var jwt = tokenFromStorage();
            var normalizedJwt = normalizeTokenValue(jwt);
            if (normalizedJwt && !config.url.includes('get-user-picture')) {
              config.headers.Authorization = 'Bearer ' + normalizedJwt;
              var tokenLog = describeTokenForLog(normalizedJwt);
              tokenLog.url = config.url;
              logRequestDecision('attached Authorization (org agregado)', tokenLog);
            } else {
              logRequestDecision('Authorization omitido (org agregado)', {
                url: config.url,
                reason: normalizedJwt ? 'endpoint excluido' : 'sin token'
              });
            }


          }
          // ----------- Excepción si existe org= no add config.url = config.url + '?org=' + usr.urlname; x------------
          // ----------------Original----------------------
            // config.url = config.url + '?org=' + usr.urlname;
            // if ($sessionStorage.token !== undefined) {
            //   var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
            //   var token = JSON.parse(decryptedToken);
            //   config.headers.Authorization = 'Token ' + token;
            // }
          // ----------------Original x----------------------      
          return config;
        }

      
    }
  }

  function responseError(response) {
    if (response.status === 403) {
      //SweetAlert.swal("El usuario no tiene permiso para realizar esta acción", "", "error");
    }
    if (shouldForceLogout(response)) {
      try {
        $window.localStorage.setItem('saam_auth_event', JSON.stringify({ type: 'logout', timestamp: Date.now() }));
      } catch (error) {
        console.warn('No se pudo notificar el cierre de sesión forzado', error);
      }
      delete $localStorage.authToken;

      if ($window.saamSessionControl && angular.isFunction($window.saamSessionControl.forceLoginRedirect)) {
        $window.saamSessionControl.forceLoginRedirect();
      } else {
        delete $sessionStorage.token;
        delete $sessionStorage.user;
        delete $sessionStorage.permisos;
        delete $sessionStorage.infoUser;
        delete $sessionStorage.actualPage;
        delete $localStorage.token;
        delete $localStorage.user;
        delete $localStorage.permisos;
        delete $localStorage.infoUser;
        delete $localStorage.authToken;
        delete $localStorage.actualPage;
        $location.path('/login/auth');
      }
      return $q.reject(response);
    }
    if (response.status === 401 && $window.saamSessionControl &&
      angular.isFunction($window.saamSessionControl.hasUsableSession) &&
      !$window.saamSessionControl.hasUsableSession()) {
      try {
        console.log('[SAAM] responseError -> 401 fallback sin sesión usable', {
          status: response.status,
          url: response.config && response.config.url ? response.config.url : null
        });
      } catch (_) {
        // ignoramos errores de logging
      }
      if ($window.saamSessionControl && angular.isFunction($window.saamSessionControl.forceLoginRedirect)) {
        $window.saamSessionControl.forceLoginRedirect();
      } else {
        delete $sessionStorage.token;
        delete $sessionStorage.user;
        delete $sessionStorage.permisos;
        delete $sessionStorage.infoUser;
        delete $sessionStorage.actualPage;
        delete $localStorage.token;
        delete $localStorage.user;
        delete $localStorage.permisos;
        delete $localStorage.infoUser;
        delete $localStorage.authToken;
        delete $localStorage.actualPage;
        $location.path('/login/auth');
      }
      return $q.reject(response);
    }
    return $q.reject(response);

  }

  function shouldForceLogout(response) {
    if (!response || (response.status !== 401 && response.status !== 403)) {
      return false;
    }

    var requestUrl = '';
    if (response.config && response.config.url) {
      try {
        requestUrl = response.config.url.toString();
      } catch (_) {
        requestUrl = '';
      }
    }

    var normalizedRequestUrl = '';
    var hadAuthHeader = false;
    var requestBearerToken = null;
    var storedTokenValue = null;

    function normalizeTokenString(candidate) {
      if (!candidate) {
        return '';
      }

      if (angular.isObject(candidate)) {
        if (candidate.token) {
          try {
            return candidate.token.toString();
          } catch (_) {
            return '';
          }
        }

        try {
          return JSON.stringify(candidate);
        } catch (_) {
          return '';
        }
      }

      try {
        return candidate.toString();
      } catch (_) {
        return '';
      }
    }

    try {
      var storedTokenCandidate = tokenFromStorage();
      var normalizedStoredToken = normalizeTokenString(storedTokenCandidate);

      if (normalizedStoredToken && typeof normalizedStoredToken === 'string') {
        normalizedStoredToken = normalizedStoredToken.trim();

        if (normalizedStoredToken.charAt(0) === '"' &&
            normalizedStoredToken.charAt(normalizedStoredToken.length - 1) === '"') {
          normalizedStoredToken = normalizedStoredToken.slice(1, -1);
        }

        var lowerStored = normalizedStoredToken.toLowerCase();
        if (lowerStored.indexOf('bearer ') === 0) {
          normalizedStoredToken = normalizedStoredToken.slice('bearer '.length).trim();
        } else if (lowerStored.indexOf('token ') === 0) {
          normalizedStoredToken = normalizedStoredToken.slice('token '.length).trim();
        }

        if (normalizedStoredToken) {
          storedTokenValue = normalizedStoredToken;
        }
      }
    } catch (_) {
      storedTokenValue = null;
    }

    try {
      var headerSource = response.config && response.config.headers;

      if (angular.isFunction(headerSource)) {
        try {
          headerSource = headerSource(response.config);
        } catch (_) {
          headerSource = headerSource();
        }
      }

      if (headerSource && typeof headerSource === 'object') {
        Object.keys(headerSource).some(function (headerKey) {
          if (!headerKey) {
            return false;
          }

          var normalizedKey;

          try {
            normalizedKey = headerKey.toString().toLowerCase();
          } catch (_) {
            normalizedKey = headerKey;
          }

          if (normalizedKey === 'authorization' && headerSource[headerKey]) {
            hadAuthHeader = true;

            try {
              var rawHeader = headerSource[headerKey].toString().trim();
              var lowerHeader = rawHeader.toLowerCase();

              if (lowerHeader.indexOf('bearer ') === 0) {
                requestBearerToken = rawHeader.slice('bearer '.length).trim();
              } else if (lowerHeader.indexOf('token ') === 0) {
                requestBearerToken = rawHeader.slice('token '.length).trim();
              }
            } catch (_) {
              requestBearerToken = null;
            }

            return true;
          }

          return false;
        });
      }
    } catch (_) {
      hadAuthHeader = false;
      requestBearerToken = null;
    }

    if (requestBearerToken && storedTokenValue && requestBearerToken !== storedTokenValue) {
      try {
        console.log('[SAAM] shouldForceLogout -> skipped (auth header desincronizado)', {
          status: response.status,
          url: requestUrl || null,
          headerTokenLength: requestBearerToken ? requestBearerToken.length : 0,
          storedTokenLength: storedTokenValue ? storedTokenValue.length : 0,
          headerTokenSuffix: requestBearerToken ? requestBearerToken.slice(-6) : null,
          storedTokenSuffix: storedTokenValue ? storedTokenValue.slice(-6) : null
        });
      } catch (_) {
        // ignoramos errores de logging para no afectar el flujo principal
      }

      return false;
    }

    if (requestUrl) {
      try {
        normalizedRequestUrl = requestUrl.toLowerCase();
      } catch (_) {
        normalizedRequestUrl = '';
      }

      if (normalizedRequestUrl) {
        var alwaysIgnoreFragments = [
          '/get-image-or/'
        ];

        var matchesAlwaysIgnored = alwaysIgnoreFragments.some(function (fragment) {
          return normalizedRequestUrl.indexOf(fragment) !== -1;
        });

        if (matchesAlwaysIgnored) {
          try {
            console.log('[SAAM] shouldForceLogout -> skipped (get-image-or endpoint)', {
              status: response.status,
              url: requestUrl || null
            });
          } catch (_) {
            // Evitamos romper el flujo si el log falla.
          }
          return false;
        }

        var ignoreFragmentsAnyStatus = [
          '/notifications-count',
          '/notifications-test',
          '/mis-registros-automaticos',
          '/get-carousel-from-cas/',
          '/get-birthdays/',
          '/schedule',
          '/filtros-subramos-dash/',
          '/get_user_by_username/',
          '/count-receipts',
          '/v1/configurations/states/'
        ];

        var matchesAnyStatusIgnored = ignoreFragmentsAnyStatus.some(function (fragment) {
          return normalizedRequestUrl.indexOf(fragment) !== -1;
        });

        if (matchesAnyStatusIgnored) {
          var hasStoredToken = !!(
            ($sessionStorage && $sessionStorage.token) ||
            ($localStorage && ($localStorage.token || $localStorage.authToken))
          );
          var isCarouselEndpoint = normalizedRequestUrl.indexOf('/get-carousel-from-cas/') !== -1;

          if (response.status === 403 && !isCarouselEndpoint) {
            try {
              console.log('[SAAM] shouldForceLogout -> skipped (known endpoint 403)', {
                status: response.status,
                url: requestUrl || null,
                hadAuthHeader: hadAuthHeader,
                hasStoredToken: hasStoredToken
              });
            } catch (_) {
              // Ignoramos fallos de logging para no romper el flujo.
            }
            return false;
          }

          if (response.status === 403 && isCarouselEndpoint) {
            try {
              console.log('[SAAM] shouldForceLogout -> skipped (carousel endpoint 403)', {
                status: response.status,
                url: requestUrl || null,
                hadAuthHeader: hadAuthHeader,
                hasStoredToken: hasStoredToken
              });
            } catch (_) {
              // Ignoramos fallos de logging para no romper el flujo.
            }
            return false;
          }

          if (response.status === 401 && (hadAuthHeader || hasStoredToken)) {
            // Se intentó autenticar la petición; continuar evaluando el cierre de sesión forzado.
          } else {
            try {
              console.log('[SAAM] shouldForceLogout -> skipped (known endpoint sin credenciales activas)', {
                status: response.status,
                url: requestUrl || null,
                hadAuthHeader: hadAuthHeader,
                hasStoredToken: hasStoredToken
              });
            } catch (_) {
              // Evitamos romper el flujo si el log falla.
            }
            return false;
          }
        }

        if (response.status === 403) {
          var ignoreFragmentsWithOrgValidation = [
            '/orginfo/',
            '/get-carousel-from-cas/'
          ];

          var matchesConditionalIgnored = ignoreFragmentsWithOrgValidation.some(function (fragment) {
            return normalizedRequestUrl.indexOf(fragment) !== -1;
          });

          if (matchesConditionalIgnored) {
            var orgParamMatch = normalizedRequestUrl.match(/[?&]org=([^&#]*)/);
            var orgParamValue = orgParamMatch && orgParamMatch[1] ? decodeURIComponent(orgParamMatch[1]) : '';

            if (!orgParamValue || orgParamValue === 'undefined' || orgParamValue === 'null') {
              try {
                console.log('[SAAM] shouldForceLogout -> skipped (invalid org parameter)', {
                  status: response.status,
                  url: requestUrl || null,
                  org: orgParamValue || null
                });
              } catch (_) {
                // Evitamos romper el flujo si el log falla.
              }
              return false;
            }
          }
        }
      }
    }

    var data = response.data || {};
    var detailMessage = '';
    var errorCode = '';

    if (angular.isObject(data) && data.detail) {
      detailMessage = data.detail;
    } else if (angular.isString(data)) {
      detailMessage = data;
    }

    if (angular.isObject(data) && data.code) {
      errorCode = data.code;
    }

    var normalizedMessage = '';
    if (detailMessage) {
      try {
        normalizedMessage = detailMessage.toString().toLowerCase();
      } catch (_) {
        normalizedMessage = '';
      }
    }

    var normalizedCode = '';
    if (errorCode) {
      try {
        normalizedCode = errorCode.toString().toLowerCase();
      } catch (_) {
        normalizedCode = '';
      }
    }

    var logoutReason = '';
    var tokenErrorCodes = ['token_not_valid', 'token_invalid', 'token_expired'];
    if (normalizedCode && tokenErrorCodes.indexOf(normalizedCode) !== -1) {
      logoutReason = 'response.code indica token inválido o expirado (' + normalizedCode + ')';
    }

    if (!logoutReason && normalizedMessage) {
      var missingCredentialsFragments = [
        'credenciales de autenticaci',
        'authentication credentials were not provided'
      ];

      var mentionsMissingCredentials = missingCredentialsFragments.some(function (fragment) {
        return normalizedMessage.indexOf(fragment) !== -1;
      });

      if (mentionsMissingCredentials) {
        logoutReason = 'El detalle indica que faltan credenciales de autenticación';
      }
    }

    if (!logoutReason && normalizedMessage) {
      var mentionsToken = normalizedMessage.indexOf('token') !== -1;

      if (mentionsToken) {
        var tokenInvalidFragments = ['expir', 'inval', 'invál', 'vencid'];
        var matchesInvalid = tokenInvalidFragments.some(function (fragment) {
          return normalizedMessage.indexOf(fragment) !== -1;
        });

        if (matchesInvalid) {
          logoutReason = 'El detalle menciona que el token está expirado o es inválido';
        }
      }
    }

    if (!logoutReason && response.status === 401) {
      if ($window.saamSessionControl && angular.isFunction($window.saamSessionControl.hasUsableSession)) {
        if (!$window.saamSessionControl.hasUsableSession()) {
          logoutReason = 'saamSessionControl.hasUsableSession() devolvió false tras un 401';
        }
      } else {
        var storedCandidate = $sessionStorage.token || $localStorage.token || $localStorage.authToken;
        if (!storedCandidate) {
          logoutReason = 'No existe token almacenado tras recibir un 401';
        } else {
          if (angular.isObject(storedCandidate)) {
            try {
              storedCandidate = JSON.stringify(storedCandidate);
            } catch (_) {
              storedCandidate = '';
            }
          }

          if (typeof storedCandidate !== 'string') {
            storedCandidate = '';
          }

          var trimmedCandidate = storedCandidate.trim();
          if (!trimmedCandidate || trimmedCandidate === 'null' || trimmedCandidate === 'undefined') {
            logoutReason = 'El token almacenado está vacío o es inválido tras un 401';
          }
        }
      }
    }

    if (!logoutReason && response.status === 401) {
      logoutReason = 'Se recibió un 401 sin más contexto';
    }

    if (logoutReason) {
      try {
        console.log('[SAAM] shouldForceLogout -> true', {
          status: response.status,
          url: requestUrl || null,
          reason: logoutReason,
          code: errorCode || null,
          detail: detailMessage || null
        });
      } catch (logError) {
        // Evitamos romper el flujo si el log falla.
      }
      return true;
    }

    return false;

  }
});
// Configuración de Idle
// $(window).load(function() {
    // $('.js-example-basic-multiple').select2();
// });
// angular.element(document).ready(function(){
//   $('.js-example-basic-multiple').select2();
// });
app.config(function(IdleProvider, KeepaliveProvider) {
  IdleProvider.idle(1800);// tiempo para que se valide la notificación warning
  IdleProvider.timeout(60); // despues de notificación, tiempo para reactivar la sesión (segundos)
  KeepaliveProvider.interval(10);
});
app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('httpRequestInterceptor');
  $httpProvider.defaults.headers.patch = {'Content-Type': 'application/json'};
  // $httpProvider.defaults.headers.post = {};

});
app.config(function (uiSelectConfig) {
  uiSelectConfig.theme = 'bootstrap';
  uiSelectConfig.resetSearchInput = true;
  uiSelectConfig.appendToBody = true;
});

// app.run(function($rootScope, $localStorage, $state, $stateParams, appStates,$location, url) {
//     $rootScope.$on("$locationChangeSuccess", function(event, next, current) {
//       if($location.$$path == '/login/auth'){
//         $location.$$path = url.IP + appStates.states[appStates.states.length-1].route;
//       }
//       setTimeout( function () {
//         var paramApp = appStates.states[$localStorage.tab_index] ? appStates.states[$localStorage.tab_index].params : '';
//         var state = appStates.estados($state.current.name, $location.$$absUrl, paramApp);
//         if (state){
//           appStates.states[$localStorage.tab_index] = state;
//           $localStorage.tab_states = appStates.states;
//         }else{
//           $localStorage.tab_states = [];
//         }
//       }, 500);
//     });
// });

app.run(function($rootScope, $localStorage, $state, $stateParams, appStates,$location, url) {
    $rootScope.$on("$locationChangeSuccess", function(event, next, current) {
      if($localStorage.infoUser && $location.$$path == '/login/auth'){
        $location.$$path = url.IP + appStates.states[appStates.states.length-1].route;
      }
      setTimeout( function () {
        var paramApp = appStates.states[$localStorage.tab_index] ? appStates.states[$localStorage.tab_index].params : '';
        var state = appStates.estados($state.current.name, $location.$$absUrl, paramApp);
        if (state){
          appStates.states[$localStorage.tab_index] = state;
          $localStorage.tab_states = appStates.states;
          
          /* Saving the last state visited in the local storage. */
          // $localStorage['last_state_visited'] = appStates.getActualTab();
        }
      }, 500);
    });
});
app.run(function($rootScope, NotificationService) {
  NotificationService.getNotifications();
});
app.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('testing', {
      abstract: true,
      url: '/testing',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('testing.testing', {
      url: '/',
      templateUrl: 'app/testing/testing.html',
      controller: 'TestingCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Testing' }
    })
    .state('login', {
      abstract: true,
      url: '/login',
      templateUrl: 'app/login/login.html'
    })
    .state('login.login', {
      url: '/auth',
      templateUrl: 'app/login/login.auth.html',
      controller: 'LoginCtrl',
      controllerAs: 'vm'
    })
    .state('inicio', {
      abstract: true,
      url: '/inicio',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('inicio.inicio', {
      url: '/',
      templateUrl: 'app/inicio/inicio.html',
      controller: 'InicioCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Inicio' }
    })
    .state('index', {
      abstract: true,
      url: '/index',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('index.main', {
      url: '/main',
      views: {
        '': {
          templateUrl: 'app/main/main.html'
        },
        'cobranza@index.main': {
          templateUrl: 'app/charts/cobranzas.chart.html',
          controller: 'CobranzaChartCtrl'
        },
        'renovaciones@index.main': {
          templateUrl: 'app/charts/renovaciones.chart.html',
          controller: 'RenovacionChartCtrl'
        },
        'endosos@index.main': {
          templateUrl: 'app/charts/endosos.chart.html',
          controller: 'EndosoChartCtrl'
        },
        'buttons@index.main': {
          templateUrl: 'app/modals/modal.ot-creator.html',
          controller: 'ButtonsCtrl'
        }
      }
    })
    .state('index.minor', {
      url: '/minor',
      templateUrl: 'app/minor/minor.html',
      data: { pageTitle: 'Example view' }
    })
    .state('block', {
      url: '/block-page',
      templateUrl: 'app/block-page/block-page.html',
      controller: 'BlockCtrl',
      data: { pageTitle: 'BlockPage' }
    })
    .state('contratantes', {
      abstract: true,
      url: '/contratantes',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('contratantes.main', {
      url: '/list',
      templateUrl: 'app/contratantes/contratantes.list.html',
      data: { pageTitle: 'Contratantes' },
      controller: 'ContratantesCtrl',
      controllerAs: 'vm',
      resolve: {
    $uibModalInstance  : function(){
      return null;
    }
      }
    })
    .state('contratantes.create', {
      url: '/crear',
      templateUrl: 'app/contratantes/contratantes.html',
      data: { pageTitle: 'Contratantes' },
      controller: 'ContratantesCtrl',
      controllerAs: 'vm',
    
    })
    .state('contratantes.list', {
      url: '/lista',
      templateUrl: 'app/contratantes/contratantes.list.html',
      data: { pageTitle: 'ContratantesList' },
      controller: 'ContratantesCtrl',
      controllerAs: 'vm',
      resolve: {
    $uibModalInstance  : function(){
      return null;
    }
      }
    })
    .state('contratantes.info', {
      url: '/:type/:contratanteId/',
      templateUrl: 'app/contratantes/contratantes.info.html',
      data: { pageTitle: 'Contratantes' },
      controller: 'ContratantesEditCtrl',
      controllerAs: 'vm'
    })
    .state('contratantes.edit', {
      url: '/:type/editar/:contratanteId/',
      templateUrl: 'app/contratantes/contratantes.edit.html',
      data: { pageTitle: 'Contratantes' },
      controller: 'ContratantesEditCtrl',
      controllerAs: 'vm'
    })
    .state('ibis', {
      abstract: true,
      url: '/ibis',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('sucursal', {
      abstract: true,
      url: '/Sucursales',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('ibis.usuarios', {
      url: '/usuarios',
      templateUrl: 'app/ibis/ibis.principal.html',
      data: { pageTitle: 'IBIS' },
      controller: 'IBISController',
      controllerAs: 'vm'
    })
    .state('ibis.formatos', {
      url: '/formatos',
      templateUrl: 'app/ibis/ibis.formatos.html',
      data: { pageTitle: 'IBIS' },
      controller: 'IBISController',
      controllerAs: 'vm'
    })
    .state('ibis.formatosPlantillasWhatsappSiniestros', {
      url: '/formatos/plantillas-siniestros-whatsapp',
      templateUrl: 'app/ibis/ibis.formatos.whatsapp-siniestros.html',
      controller: 'IbisFormatosPlantillasSiniestrosCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Plantillas para Compartir Siniestros por WhatsApp Web' }
    })
    .state('ibis.directorio', {
      url: '/directorio',
      templateUrl: 'app/ibis/ibis.directorio.html',
      data: { pageTitle: 'IBIS' },
      controller: 'IBISController',
      controllerAs: 'vm'
    })
    .state('ibis.red', {
      url: '/red',
      templateUrl: 'app/ibis/ibis.red.html',
      data: { pageTitle: 'IBIS' },
      controller: 'IBISController',
      controllerAs: 'vm'
    })
    .state('filtro', {
      abstract: true,
      url: '/filtros',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('filtro.filtro', {
      url: '/asignar',
      templateUrl: 'app/filtros/filtro.html',
      controller: 'filterController',
      controllerAs: 'vm'
    })
    .state('filtro.shared', {
      url: '/ccompartir',
      templateUrl: 'app/filtros/filtro.compartir.html',
      controller: 'filterSharedController',
      controllerAs: 'vm'
    })
    .state('filtro.lista', {
      url: '/lista',
      templateUrl: 'app/filtros/filtro.lista.html',
      controller: 'filterListController',
      controllerAs: 'vm'
    })
    .state('reportes', {
      abstract: true,
      url: '/reportes',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('reportes.cobranza', {
      url: '/cobranza',
      templateUrl: 'app/reportes/reporte.cobranza.html',
      data: { pageTitle: 'Reporte Cobranza' },
      controller: 'ReporteCobrazaController',
      controllerAs: 'vm'
    })
    .state('reportes.cobranzafianzas', {
      url: '/cobranzafianzas',
      templateUrl: 'app/reportes/reporte.cobranzafianzas.html',
      data: { pageTitle: 'Reporte Cobranza Fianzas' },
      controller: 'ReporteCobrazaFianzasController',
      controllerAs: 'vm'
    })
    .state('reportes.auditoria', {
      url: '/auditoria',
      templateUrl: 'app/reportes/reporte.auditoria.html',
      data: { pageTitle: 'Reporte Auditoria' },
      controller: 'ReporteAuditoriaController',
      controllerAs: 'vm'
    })
    .state('task', {
      abstract: true,
      url: '/tareas',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('task.task', {
      url: '/',
      templateUrl: 'app/tasks/task.html',
      data: { pageTitle: 'Tareas' },
      controller: 'TareasCtrl',
      params: { id_task: 0, main_comming : false},
      controllerAs: 'vm'
    })
    .state('task.admin', {
      url: '/administrador',
      templateUrl: 'app/tasks/task.admin.html',
      data: { pageTitle: 'Tareas' },
      controller: 'TareasAdminCtrl',
      controllerAs: 'vm'
    })
    .state('reportes.renovaciones', {
      url: '/renovaciones',
      templateUrl: 'app/reportes/reporte.renovaciones.html',
      data: { pageTitle: 'Reporte Renovaciones' },
      controller: 'ReporteRenovacionesController',
      controllerAs: 'vm'
    })
    .state('reportes.endosos', {
      url: '/endosos',
      templateUrl: 'app/reportes/reporte.endosos.html',
      data: { pageTitle: 'Reporte Endosos' },
      controller: 'ReporteEndososController',
      controllerAs: 'vm'
    })
    .state('reportes.polizas', {
      url: '/polizas',
      templateUrl: 'app/reportes/reporte.polizas.html',
      data: { pageTitle: 'Reporte Pólizas' },
      controller: 'ReportePolizasController',
      controllerAs: 'vm'
    })
    .state('reportes.polizas_contributorias', {
      url: '/polizascontributorias',
      templateUrl: 'app/reportes/reporte.polizascontributorias.html',
      data: { pageTitle: 'Reporte Pólizas Contributorias' },
      controller: 'ReportePolizasContributoriasController',
      controllerAs: 'vm'
    })
    .state('reportes.siniestros', {
      url: '/siniestros',
      templateUrl: 'app/reportes/reporte.siniestros.html',
      data: { pageTitle: 'Reporte Siniestros' },
      controller: 'ReporteSiniestrosController',
      controllerAs: 'vm'
    })
    .state('reportes.fianzas', {
      url: '/fianzas',
      templateUrl: 'app/reportes/reporte.fianzas.html',
      data: { pageTitle: 'Reporte Fianzas' },
      controller: 'ReporteFianzasController',
      controllerAs: 'vm'
    })
    .state('reportes.fianzas_ben', {
      url: '/fianzas/beneficiarios',
      templateUrl: 'app/reportes/reporte.fianzasben.html',
      data: { pageTitle: 'Reporte Fianzas Beneficiarios' },
      controller: 'ReporteFianzasBenController',
      controllerAs: 'vm'
    })
    .state('reportes.log', {
      url: '/log',
      templateUrl: 'app/reportes/reporte.log.html',
      data: { pageTitle: 'Reporte Log' },
      controller: 'ReporteLogController',
      controllerAs: 'vm'
    })
    .state('reportes.cumple', {
      url: '/cumple',
      templateUrl: 'app/reportes/reporte.cumple.html',
      data: { pageTitle: 'Reporte Cumpleaños de la Semana' },
      controller: 'ReporteCumpleaniosController',
      controllerAs: 'vm'
    })
    .state('reportes.task', {
      url: '/tareas',
      templateUrl: 'app/reportes/reporte.task.html',
      data: { pageTitle: 'Reporte Tareas' },
      controller: 'ReporteTaskController',
      controllerAs: 'vm'
    }).state('reportes.certificates', {
      url: '/certificados',
      templateUrl: 'app/reportes/reporte.certificados.html',
      data: { pageTitle: 'Reporte Certificados' },
      controller: 'ReporteCertificadosController',
      controllerAs: 'vm'
    })
    .state('reportes.edoclientes', {
      url: '/edoclientes',
      templateUrl: 'app/reportes/reporte.edoclientes.html',
      data: { pageTitle: 'Reporte Edo. de Clientes' },
      controller: 'ReporteEdoClientesController',
      controllerAs: 'vm'
    })
    .state('reportes.ventacruzada', {
      url: '/venta-cruzada',
      templateUrl: 'app/reportes/reporte.ventacruzada.html',
      data: { pageTitle: 'Reporte Venta Cruzada' },
      controller: 'VentaCruzadaController',
      controllerAs: 'vm'
    })
    .state('reportes.cobranza_liq', {
      url: '/cobranzaLiquidaciones',
      templateUrl: 'app/reportes/reporte.cobranza_liq.html',
      data: { pageTitle: 'Reporte Cobranza Liquidaciones' },
      controller: 'ReporteCobrazaLiqController',
      controllerAs: 'vm'
    })
    .state('reportes.cobranza_subsec', {
      url: '/cobranzaSubsecuentes',
      templateUrl: 'app/reportes/reporte.cobranzas_subsec.html',
      data: { pageTitle: 'Reporte recibos subsecuentes' },
      controller: 'ReporteCobranzaSubsecController',
      controllerAs: 'vm',
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        valueReceipt: function() {
          return {};
        }
      }
    })
    .state('reportes.cobranzapendiente', {
      url: '/cobranzapendiente',
      templateUrl: 'app/reportes/reporte.cobranzapendiente.html',
      data: { pageTitle: 'Reporte Cobranza Pendiente' },
      controller: 'ReporteCobranzaPendienteController',
      controllerAs: 'vm'
    })
    .state('reportes.cotizaciones', {
      url: '/cotizaciones',
      templateUrl: 'app/reportes/reporte.cotizaciones.html',
      data: { pageTitle: 'Reporte Cotizaciones' },
      controller: 'ReporteCotizacionesController',
      controllerAs: 'vm'
    })
    .state('reportes.renovacionespendientes', {
      url: '/renovacionesPendientes',
      templateUrl: 'app/reportes/reporte.renovacionespendientes.html',
      data: { pageTitle: 'Reporte Renovaciones Pendientes' },
      controller: 'ReporteRenovacionesPendientesController',
      controllerAs: 'vm'
    })

    .state('reportes.polizasTitularesConyuges', {
      url: '/polizasTitularesConyuges',
      templateUrl: 'app/reportes/reporte.polizasGastosMedicos.html',
      data: { pageTitle: 'Reporte Titulares y Cónyuges' },
      controller: 'ReportePolizasGastosMedicosController',
      controllerAs: 'vm'
    })

    .state('reportes.otsendosos', {
      url: '/OtsEndosos',
      templateUrl: 'app/reportes/reporte.otsendosos.html',
      data: { pageTitle: 'Reporte OTs/Endosos' },
      controller: 'ReporteOTEndosoController',
      controllerAs: 'vm'
    })
    .state('agenda', {
      abstract: true,
      url: '/agenda',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('agenda.agenda', {
      url: '/',
      templateUrl: 'app/agenda/agenda.html',
      data: { pageTitle: 'Agenda' },
      controller: 'AgendaCtrl',
      controllerAs: 'vm'
    })
    .state('cotizacion', {
      abstract: true,
      url: '/cotizacion',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('cotizacion.cotizacion', {
      url: '/',
      templateUrl: 'app/cotizacion/cotizacion.html',
      params: {
        myContractor: 'some default'
      },
      data: { pageTitle: 'Cotizacion' },
      controller: 'cotizacionController',
      controllerAs: 'vm'
    })
    .state('cotizacion.info', {
      url: '/:polizaId',
      templateUrl: 'app/cotizacion/cotizacion.html',
      data: { pageTitle: 'Cotizacion Información' },
      controller: 'cotizacionController',
      controllerAs: 'vm'
    })
    .state('operacion', {
      abstract: true,
      url: '/operacion',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('operacion.semanal', {
      url: '/',
      templateUrl: 'app/operacion/reporte.operacion.html',
      data: { pageTitle: 'Repporte Operación' },
      controller: 'ReporteOperacionController',
      controllerAs: 'vm'
    })
    .state('reportes.conservacion', {
      url: '/conservacion',
      templateUrl: 'app/reportes/estadistica/reporte.conservacion.html',
      data: { pageTitle: 'Reporte conservación' },
      controller: 'ReporteEstConservacionController',
      controllerAs: 'vm'
    })
    .state('notificaciones', {
      abstract: true,
      url: '/notificaciones',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('notificaciones.main', {
      url: '/',
      templateUrl: 'app/notificaciones/notificaciones.html',
      data: { pageTitle: 'Notificaciones' },
      controller: 'notificacionesCtrl',
      controllerAs: 'vm'
    })
    .state('notificaciones.listado', {
      url: '/listado',
      templateUrl: 'app/notificaciones/notificaciones.listado.html',
      data: { pageTitle: 'Notificaciones' },
      controller: 'notificacionListadoCtrl',
      controllerAs: 'vm'
    })
    .state('mensajeria', {
      abstract: true,
      url: '/mensajeria',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('mensajeria.principal', {
      url: '/',
      templateUrl: 'app/mensajeria/mensajeria.html',
      data: { pageTitle: 'Mensajeria' },
      controller: 'MensajeriaCtrl',
      controllerAs: 'vm'
    })
    .state('kbi', {
      abstract: true,
      url: '/kbi',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('kbi.principal', {
      url: '/',
      templateUrl: 'app/kbi/kbi.html',
      controller: 'kbicontrolCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'KBI' }
    })
    .state('sucursal.config', {
      url: '/sucursales',
      templateUrl: 'app/sucursales/sucursal.html',
      data: { pageTitle: 'Sucursales' },
      controller: 'ScrslController',
      controllerAs: 'vm'
    })
    .state('colectividades', {
      abstract: true,
      url: '/colectividades',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('colectividades.plantillas', {
      url: 'plantillas-certificados',
      templateUrl: 'app/colectivos/certificados.plantillas.html',
      controller: 'CertificadosPlantillasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'colectivosPlantillas' }
    })
    .state('colectividades.main', {
      url: '/',
      templateUrl: 'app/colectivos/colectivos.html',
      data: { pageTitle: 'Colectividades' },
      controller: 'ColectivosCtrl',
      controllerAs: 'order',
      params: {
        myInsurance: 'some default'
      },
      resolve: {
          $uibModalInstance  : function(){
            return null;
          }
      }
    })
    .state('colectividades.table', {
      url: '/colectividades-tabla',
      templateUrl: 'app/colectividades/colectividades.table.html',
      data: { pageTitle: 'ListColectividades' },
      controller: 'ColectividadesTableCtrl',
      // controllerAs: 'order',
      resolve: {
          $uibModalInstance  : function(){
            return null;
          }
      }
    })
    .state('colectividades.info', {
      url: '/:polizaId',
      templateUrl: 'app/colectivos/colectivos.info.html',
      controller: 'ColectivosInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Colectividades' }
    })
    .state('colectividades.masivos', {
      url: '/subir-archivos/masivos',
      templateUrl: 'app/colectividades/colectividades.subir-masivos.html',
      data: { pageTitle: 'SubirMasivos' },
      controller: 'SubirMasivosCtrl',
      controllerAs: 'foo'
    })
    .state('colectividades.edit', {
      url: '/editar/:polizaId',
      templateUrl: 'app/colectivos/colectivos.edit.html',
      controller: 'ColectivosEditCtrl',
      controllerAs: 'order',
      data: { pageTitle: 'EditColectividades' }
    })
    .state('colectividades.convertirPoliza', {
      url: '/:polizaId/:status/convertir',
      templateUrl: 'app/colectividades/colectividades.edit.html',
      controller: 'ColectividadesEditCtrl',
      data: { pageTitle: 'ColectividadesToPoliza' }
    })
    .state('colectividades.renewal', {
      url: '/renovaciones/:polizaId/',
      templateUrl: 'app/colectivos/colectivos.renewal.html',
      controller: 'ColectivosRenewalCtrl',
      controllerAs: 'order',
      data: { pageTitle: 'RenewalColectividades' }
    })
    .state('flotillas', {
      abstract: true,
      url: '/flotillas',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('flotillas.flotillas', {
      url: '/',
      templateUrl: 'app/flotillas/flotillas.html',
      controller: 'FlotillasCtrl',
      controllerAs: 'order',
      params: {
        dataContractor: 'some default',
        message: 'some default'
      },
      data: { pageTitle: 'Flotillas' }
    })
    .state('flotillas.info', {
      url: '/:polizaId',
      templateUrl: 'app/flotillas/flotillas.info.html',
      controller: 'FlotillasInfoCtrl',
      controllerAs: 'order',
      params: {
        dataContractor: 'some default',
        message: 'some default'
      },
      data: { pageTitle: 'FlotillasInfo' }
    })
    .state('flotillas.edit', {
      url: '/editar/:polizaId',
      templateUrl: 'app/flotillas/flotillas.edit.html',
      controller: 'FlotillasEditCtrl',
      controllerAs: 'order',
      data: { pageTitle: 'FlotillasEdit' }
    })
    .state('flotillas.renewal', {
      url: '/renewal/:polizaId',
      templateUrl: 'app/flotillas/flotillas.renewal.html',
      controller: 'FlotillasRenewalCtrl',
      controllerAs: 'order',
      data: { pageTitle: 'FlotillasRenewal' }
    })
    .state('archivos', {
      abstract: true,
      url: '/archivos',
      templateUrl: 'app/components/common/content.html',
      controller: "CondicionesGralesCtrl"
    })
    .state('archivos.generales', {
      url: '/',
      templateUrl: 'app/archivos/archivoscg.html',
      controller: 'CondicionesGralesCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Adjuntos Condiciones Generales' }
    })
    .state('grupos', {
      abstract: true,
      url: '/grupos',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('grupos.grupos', {
      url: '/',
      templateUrl: 'app/grupos/grupos.html',
      controller: 'GrupoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Grupos' }
    })
    .state('grupos.edit', {
      url: '/editar/:grupoId',
      templateUrl: 'app/grupos/grupos.edit.html',
      controller: 'GrupoEditCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Grupos' }
    })
    .state('grupos.info', {
      url: '/informacion/:grupoId',
      templateUrl: 'app/grupos/grupos.info.html',
      controller: 'GrupoInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Grupos' }
    })
    .state('clasificacion', {
      abstract: true,
      url: '/clasificacion',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('clasificacion.clasificacion', {
      url: '/',
      templateUrl: 'app/clasificacion/clasificacion.html',
      controller: 'clasificacionController',
      controllerAs: 'vm',
      data: { pageTitle: 'Clasificacion' }
    })
    .state('celulacontractor', {
      abstract: true,
      url: '/celulacontractor',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('celulacontractor.celulacontractor', {
      url: '/',
      templateUrl: 'app/contratantes/celulacontractor.html',
      controller: 'celulacontractorController',
      controllerAs: 'vm',
      data: { pageTitle: 'Célula de Contratante' }
    })
    .state('aseguradoras', {
      abstract: true,
      url: '/aseguradoras',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('aseguradoras.aseguradoras', {
      url: '/',
      templateUrl: 'app/aseguradoras/aseguradoras.html',
      controller: 'AseguradorasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Aseguradoras' }
    })
    .state('aseguradoras.edit', {
      url: '/:aseguradoraId',
      templateUrl: 'app/aseguradoras/aseguradoras.edit.html',
      controller: 'AseguradorasEditCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Aseguradoras' }
    })
    .state('aseguradoras.info', {
      url: '/info/:aseguradoraId',
      templateUrl: 'app/aseguradoras/aseguradoras.info.html',
      controller: 'AseguradorasInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Aseguradoras' }
    })
    .state('aseguradoras.ramos', {
      url: '/:aseguradoraId/ramos',
      templateUrl: 'app/aseguradoras/aseguradoras.config.html',
      controller: 'AseguradorasConfigCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Aseguradoras' }
    })
    .state('aseguradoras.subramos', {
      url: '/:aseguradoraId/ramos/:ramosId/subramos',
      templateUrl: 'app/aseguradoras/aseguradoras.subramos.html',
      controller: 'AseguradorasSubramoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Aseguradoras' }
    })
    .state('fianzas', {
      abstract: true,
      url: '/fianzas',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('reclamacion', {
      abstract: true,
      url: '/fianzas/reclamaciones',
      templateUrl: 'app/components/common/content.html'
    })
    .state('fianzas.fianzas', {
      url: '/',
      templateUrl: 'app/fianzas/fianzas.html',
      controller: 'FianzasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'fianzas' },
      // params: {
      //   myInsurance: 'some default'
      // }
      params: {
        myInsurance: 'some default'
      },
      //data: { pageTitle: 'Fianzas' },
      resolve: {
        $uibModalInstance  : function(){
          return null;
        }
      }
    })
    .state('fianzas.reclist', {
      url: '/reclamaciones/list',
      templateUrl: 'app/fianzas/reclamaciones.list.html',
      controller: 'FianzasReclamacionesListCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Fianzas' }
    })
    .state('fianzas.reclinf', {
      url: '/reclamaciones/info/:claimId',
      templateUrl: 'app/fianzas/reclamaciones.info.html',
      controller: 'FianzasReclamacionesInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Fianzas' }
    })
    .state('fianzas.colectividades', {
      url: '/colectividades',
      templateUrl: 'app/fianzaGpo/fianza.gpo.ordenes.html',
      controller: 'FianzasColectividadesCtrl',
      controllerAs: 'order',
      data: { pageTitle: 'Fianzas' },
      params: {
        myInsurance: 'some default'
      },
      resolve: {
        $uibModalInstance  : function(){
          return null;
        }
      }
    })
    .state('fianzas.edit', {
      url: '/colectividades/editar/:polizaId',
      templateUrl: 'app/fianzaGpo/fianza.gpo.edit.html',
      controller: 'FianzasColectividadesEditCtrl',
      controllerAs: 'order',
      params: {
          myInsurance: 'some default',
          message: 'some default'
        },
      data: { pageTitle: 'Fianzas' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        myInsurance: function () {
          return null;
        },
        container: function () {
          return [];
        }
      }
    })
    .state('reclamacion.edit', {
      url: '/:reclId/editar',
      templateUrl: 'app/fianzas/fianzas.reclamaciones.html',
      controller: 'ReclamacionEditCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Edición de Reclamación' }
    })
    .state('fianzas.renewal', {
      url: '/colectividades/:polizaId/renovar',
      templateUrl: 'app/fianzaGpo/fianza.gpo.renewal.html',
      controller: 'FianzasColectividadesRenewalCtrl',
      controllerAs: 'order',
      params: {
          myInsurance: 'some default',
          message: 'some default'
        },
      data: { pageTitle: 'Fianzas' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        myInsurance: function () {
          return null;
        },
        container: function () {
          return [];
        }
      }
    })
    .state('fianzas.reissue', {
      url: '/colectividades/:polizaId/reexpedir',
      templateUrl: 'app/fianzaGpo/fianza.gpo.renewal.html',
      controller: 'FianzasColectividadesRenewalCtrl',
      controllerAs: 'order',
      params: {
          myInsurance: 'some default',
          message: 'some default'
        },
      data: { pageTitle: 'Fianzas' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        myInsurance: function () {
          return null;
        },
        container: function () {
          return [];
        }
      }
    })
    .state('fianzas.details', {
      url: '/colectividades/:polizaId',
      templateUrl: 'app/fianzaGpo/fianza.gpo.info.html',
      controller: 'FianzasInfoColectividadesCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Fianzas' }
    })
    .state('fianzas.reclamaciones', {
      url: '/reclamaciones',
      templateUrl: 'app/fianzas/fianzas.reclamaciones.html',
      controller: 'FianzasReclamacionesCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Fianzas' }
    })
    .state('fianzas.list', {
      url: '/list',
      templateUrl: 'app/fianzas/fianzas.list.html',
      controller: 'FianzasListCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Fianzas' }
    })
    .state('fianzas.info', {
      url: '/informacion/:polizaId',
      templateUrl: 'app/fianzas/fianzas.info.html',
      controller: 'FianzasInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Fianzas' }
    }) 
    .state('fianzas.pprovlist', {
      url: '/programa/list',
      templateUrl: 'app/fianzas/programa.list.html',
      controller: 'FianzasProgramaListCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Programa de Proveedores' }
    })   
    .state('fianzas.pprovnew', {
      url: '/programa/new',
      templateUrl: 'app/fianzas/programa.new.html',
      controller: 'FianzasProgramaNewCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Programa de Proveedores - Nuevo' }
    })

    .state('fianzas.pprovinfo', {
      url: '/programa/:type/:contratanteId',
      templateUrl: 'app/fianzas/pproveedor.info.html',
      data: { pageTitle: 'Programa de Proveedores' },
      controller: 'ContratantesPPEditCtrl',
      controllerAs: 'vm'
    })
    .state('fianzas.pprovedit', {
      url: '/programa/:type/:contratanteId',
      templateUrl: 'app/fianzas/pproveedor.edit.html',
      data: { pageTitle: 'Contratantes Programa de Proveedores' },
      controller: 'ContratantesPPEditCtrl',
      controllerAs: 'vm'
    })
    
    
    .state('fianzas.editar', {
      url: '/editar/:polizaId',
      templateUrl: 'app/fianzas/fianzas.edit.html',
      controller: 'FianzasEditCtrl',
      controllerAs: 'vm',
      params: {
          myInsurance: 'some default',
          message: 'some default'
        },
      data: { pageTitle: 'Polizas' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        myInsurance: function () {
          return null;
        },
        container: function () {
          return [];
        }
      }
    })
    .state('fianzas.renovar', {
      url: '/:polizaId/:renovacion/renovacion',
      templateUrl: 'app/fianzas/fianzas.edit.html',
      controller: 'FianzasEditCtrl',
      controllerAs: 'vm',
      params: {
          myInsurance: 'some default',
          renovacion:'',
          message: 'some default'
        },
      data: { pageTitle: 'Fianzas' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        myInsurance: function () {
          return null;
        },
        container: function () {
          return [];
        }
      }
    })
    .state('fianzas.reexpedir', {
      url: '/:polizaId/:reexpedir/reexpedicion',
      templateUrl: 'app/fianzas/fianzas.edit.html',
      controller: 'FianzasEditCtrl',
      controllerAs: 'vm',
      params: {
          myInsurance: 'some default',
          message: 'some default'
        },
      data: { pageTitle: 'Fianzas' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        myInsurance: function () {
          return null;
        },
        container: function () {
          return [];
        }
      }
    })
    .state('grupinglevel', {
      abstract: true,
      url: '/agrupacion',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('grupinglevel.grupinglevel', {
      url: '/',
      templateUrl: 'app/agrupaciones/agrupacion.html',
      controller: 'groupingLevelCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Agrupaciones' },
      params: {
        myInsurance: 'some default'
      }
    })
    .state('adjuntosinternos', {
      abstract: true,
      url: '/carpetas',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('adjuntosinternos.list', {
      url: '/content',
      templateUrl: 'app/carpetas/carpetas.html',
      controller: 'CarpetasAdjuntosCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Carpetas' }
    })
    .state('bibliotecas', {
      abstract: true,
      url: '/bibliotecas',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('bibliotecas.bibliotecas', {
      url: '/',
      templateUrl: 'app/bibliotecas/bibliotecas.html',
      controller: 'BibliotecasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Bibliotecas' },
      params: {
        myInsurance: 'some default'
      }
    })
    .state('bibliotecas.edit', {
      url: '/edit',
      templateUrl: 'app/bibliotecas/bibliotecas.edit.html',
      controller: 'BibliotecasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Bibliotecas' },
      params: {
        myInsurance: 'some default'
      }
    })
    .state('bibliotecas.list', {
      url: '/list',
      templateUrl: 'app/bibliotecas/cartas.list.html',
      controller: 'CartasListCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Cartas' }
    })
    .state('bibliotecas.layouts', {
      url: '/layouts',
      templateUrl: 'app/bibliotecas/layouts.html',
      controller: 'CartasListCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Layouts' }
    })
    .state('bibliotecas.editables', {
      url: '/editables',
      templateUrl: 'app/bibliotecas/editables.html',
      controller: 'EditablesCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Layouts' }
    })
    .state('buscador', {
      abstract: true,
      url: '/buscador',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('buscador.buscador', {
      url: '/:cadena',
      templateUrl: 'app/buscador/buscador.template.html',
      controller: 'BuscadorCtrl',
      data: { pageTitle: 'Buscador' },
    })
    .state('buscador.modal', {
      url: '/modal/:cadena',
      templateUrl: 'app/buscador/buscador.modal.html',
      controller: 'BuscadorCtrl',
      data: { pageTitle: 'Buscador' },
    })
    .state('comisiones', {
      abstract: true,
      url: '/comisiones',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('comisiones.comisiones', {
      url: '/',
      templateUrl: 'app/comisiones/comisiones.html',
      controller: 'ComisionesCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Comisiones' }
    })
    .state('comisiones.conciliarid', {
      url: '/conciliarid',
      templateUrl: 'app/comisiones/conciliarid.html',
      controller: 'ConciliarMasivoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Conciliar Masivo ID' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        valueReceipt: function() {
          return {};
        }
      }
    })
    .state('agentes', {
      abstract: true,
      url: '/agentes',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('agentes.administration', {
      url: '/administracion',
      templateUrl: 'app/agentes/pago.administrador.html',
      controller: 'PagoAgentesAdminController',
      controllerAs: 'vm',
      data: { pageTitle: 'Pago a Agentes' }
    })
    .state('agentes.estadoscuenta', {
      url: '/estadoscuenta',
      templateUrl: 'app/agentes/pago.estadoscuenta.html',
      controller: 'PagoAgentesEstadosCuentaController',
      controllerAs: 'vm',
      data: { pageTitle: 'Estados Cuenta' }
    })
    .state('agentes.agentes', {
      url: '/',
      templateUrl: 'app/agentes/pago.agentes.html',
      controller: 'PagoAgentesController',
      controllerAs: 'vm',
      data: { pageTitle: 'Pago a Agentes' }
    })
    .state('agentes.receipts', {
      url: '/:folioId',
      templateUrl: 'app/agentes/pago.recibos.html',
      controller: 'PagoAgentesDetalleController',
      controllerAs: 'vm',
      data: { pageTitle: 'Pago a Agentes' }
    })
    .state('comisiones.consulta', {
      url: '/consulta',
      templateUrl: 'app/comisiones/comisiones.consulta.html',
      controller: 'ComisionesConsultaCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Comisiones' }
    })
    .state('multicotizador', {
      abstract: true,
      url: '/multicotizador',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('multicotizador.multicotizador', {
      url: '/',
      templateUrl: 'app/multicotizador/multicotizador.html',
      controller: 'MulticotizadorCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'some default'
      },
      data: { pageTitle: 'Multicotizador' }
    })
    .state('multicotizador.emision', {
      url: '/emision',
      templateUrl: 'app/multicotizador/multicotizador.emision.html',
      controller: 'MulticotizadorEmisionCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'some default',
        contractor: 'some default',
        quoteInfo: 'some default'
      },
      data: { pageTitle: 'Multicotizador' }
    })
    .state('multicotizador.administrador', {
      url: '/administrador',
      templateUrl: 'app/multicotizador/admin/admin.html',
      controller: 'MulticotizadorAdminCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Administrador de cotizaciones' }
    })
    .state('multicotizador.configurador', {
      url: '/configurador',
      templateUrl: 'app/multicotizador/configurador/configurador.html',
      controller: 'ConfiguradorCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'some default'
      },
      data: { pageTitle: 'Configurador' }
    })
    .state('config', {
      abstract: true,
      url: '/config',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('config.lectura_documentos', {
      url: '/lectura-documentos',
      templateUrl: 'app/lectura_documentos/lectura_documentos.html',
      data: { pageTitle: 'Lectura de documentos' },
      controller: 'LecturaDocumentosController',
      controllerAs: 'vm'
    })
    .state('config.edit_lectura_documentos', {
      url: '/lectura-documentos/:id',
      templateUrl: 'app/lectura_documentos/lectura_documentos.edit.html',
      data: { pageTitle: 'Lectura de documentos' },
      controller: 'LecturaDocumentosEditController',
      controllerAs: 'vm'
    })
    .state('config.configCampos', {
      url: '/configuracionfiltros',
      templateUrl: 'app/configuracion/configuracion.html',
      data: { pageTitle: 'Configuracion Filtros' },
      controller: 'ConfiguracionFiltrosController',
      controllerAs: 'vm'
    })
    .state('cedula', {
      abstract: true,
      url: '/cedula',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('cedula.cedula', {
      url: '/',
      templateUrl: 'app/cedula/cedula.html',
      data: { pageTitle: 'Cédula' },
      controller: 'CedulaController',
      controllerAs: 'vm'
    })
    .state('help', {
      abstract: true,
      url: '/help',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('help.manual', {
      url: '/',
      templateUrl: 'app/help/help.html',
      controller: 'HelpCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Ayuda' }
    })
    .state('help.policy', {
      url: '/',
      templateUrl: 'app/help/help.policy.html',
      controller: 'HelpCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Ayuda' }
    })
    .state('paquetes', {
      abstract: true,
      url: '/paquetes',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('campaign', {
      abstract: true,
      url: '/campaigns',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('campaign.list', {
      url: '/list',
      templateUrl: 'app/campaigns/campaigns.list.html',
      controller: 'CampaignListCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'campaigns' }
    })
    .state('campaign.create', {
      url: '/create',
      templateUrl: 'app/campaigns/campaigns.html',
      controller: 'CampaignCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'campaigns' }
    })
    .state('campaign.edit', {
      url: '/:campaignId/edit',
      templateUrl: 'app/campaigns/campaigns.edit.html',
      controller: 'CampaignEditCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Campañas' }
    })
    .state('paquetes.paquetes', {
      url: '/',
      templateUrl: 'app/paquetes/paquetes.html',
      controller: 'PaquetesCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'paquetes' }
    })
    .state('paquetes.edit', {
      url: '/:paqueteId/coberturas',
      templateUrl: 'app/paquetes/paquetes.edit.html',
      controller: 'PaquetesEditCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'paquetes' }
    })
    .state('polizas', {
      abstract: true,
      url: '/polizas',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('polizas.table', {
      url: '/datos',
      templateUrl: 'app/polizas/polizas.table.html',
      controller: 'PolizasTableCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Tabla de Polizas' }
    })
    .state('polizas.create', {
      url: '/crear',
      templateUrl: 'app/ordenes/ordenes.html',
      // templateUrl: 'app/modals/modal.ot-creator.html',
      controller: 'OrderCtrl',
      controllerAs: 'order',
      params: {
        myInsurance: 'some default'
      },
      data: { pageTitle: 'Polizas' },
      resolve: {
        $uibModalInstance  : function(){
          return null;
        }
      }
    })
    .state('polizas.info', {
      url: '/:polizaId',
      templateUrl: 'app/polizas/polizas.info.html',
      controller: 'PolizasInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Polizas' }
    })
    .state('polizas.editar', {
      url: '/:polizaId/editar',
      templateUrl: 'app/polizas/polizas.edit.html',
      controller: 'OrderEditCtrl',
      controllerAs: 'order',
      params: {
          myInsurance: 'some default',
          message: 'some default'
        },
      data: { pageTitle: 'Polizas' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        myInsurance: function () {
          return null;
        },
        container: function () {
          return [];
        }
      }
    })
    .state('polizas.plantillas', {
      url: 'plantillas',
      templateUrl: 'app/polizas/polizas.plantillas.html',
      controller: 'PolizasPlantillasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'polizasPlantillas' }
    })
    //.state('polizas.recibos', {
      //url: '/:polizaId/recibos/:receiptId',
      //templateUrl: 'app/polizas/receipts/receipts.html',
      //controller: 'ReceiptsCtrl',
      //controllerAs: 'vm',
      //data: { pageTitle: 'Recibos' }
    //})
    .state('cobranzas', {
      abstract: true,
      url: '/cobranzas',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"

    })
    // .state('cobranzas.recibospendientes', {
    //   url: '/',
    //   templateUrl: 'app/modals/modal.receipts.html',
    //   controller: 'CobranzasModal',
    //   controllerAs: 'vm',
    //   data: { pageTitle: 'Pagar recibos' },
    //   resolve: {
    //     $uibModalInstance: function () {
    //       return null;
    //     }
    //   }
    // })
    .state('cobranzas.recibospendientes', {
      url: '/recibosPendientes',
      templateUrl: 'app/modals/modal.receipts.html',
      controller: 'CobranzasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'RecibosPendientes' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        valueReceipt: function() {
          return {};
        }
      }
    })
    .state('cobranzas.cobranzas', {
      url: '/',
      templateUrl: 'app/cobranzas/cobranzas.html',
      controller: 'CobranzasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Cobranzas' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        valueReceipt: function() {
          return {};
        }
      }
    })
    .state('cobranzas.plantillas', {
      url: '/plantillas',
      templateUrl: 'app/cobranzas/cobranzas.plantillas.html',
      controller: 'CobranzasPlantillasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'CobranzasPlantillas' }
    })
    .state('cobranzas.plantillassms', {
      url: '/plantillasms',
      templateUrl: 'app/cobranzas/cobranzas.plantillassms.html',
      controller: 'CobranzasPlantillasSmsCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'CobranzasPlantillasSms' }
    })
    .state('cobranzas.plantillaswhatsapp', {
      url: '/plantillaswhatsappweb',
      templateUrl: 'app/cobranzas/cobranzas.plantillaswhatsapp.html',
      controller: 'CobranzasPlantillasWhatsappCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'CobranzasPlantillasWhatsapp' }
    })
    .state('cobranzas.folios', {
      url: '/folios',
      templateUrl: 'app/cobranzas/cobranzas.folios.html',
      controller: 'CobranzasFoliosCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Folios Pago/Liquidación' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        valueReceipt: function() {
          return {};
        }
      }
    })
    .state('cobranzas.bonos', {
      url: '/bonos',
      templateUrl: 'app/cobranzas/cobranzas.bonos.html',
      controller: 'CobranzasBonosCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Bonos' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        valueReceipt: function() {
          return {};
        }
      }
    })
    .state('cobranzas.cobranzasmasivo', {
      url: '/masivo/',
      templateUrl: 'app/cobranzas/cobranzasmasivo.html',
      controller: 'CobranzasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'CobranzasMasivo' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        valueReceipt: function() {
          return {};
        }
      }
    })
    .state('cobranzas.repositorio', {
      url: '/repositorio/',
      templateUrl: 'app/repositorio/repositorio.html',
      controller: 'RepositorioCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Repositorio' },
      resolve: {
        $uibModalInstance: function () {
          return null;
        },
        valueReceipt: function() {
          return {};
        }
      }
    })
    .state('coberturas', {
      abstract: true,
      url: '/coberturas',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('coberturas.coberturas', {
      url: '/',
      templateUrl: 'app/coberturas/coberturas.html',
      controller: 'CoberturasCtrl',
      controllerAs: 'vm'
    })
    .state('renovaciones', {
      abstract: true,
      url: '/renovaciones',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('renovaciones.renovaciones', {
      url: '/',
      templateUrl: 'app/renovaciones/renovaciones.html',
      controller: 'RenovacionesCtrl',
      controllerAs: 'vm',
      // params: ['myInsurance','container'],
      data: { pageTitle: 'Renovaciones' }
    })
    .state('renovaciones.polizas', {
      url: '/renovacion-poliza/:polizaId',
      templateUrl: 'app/renovaciones/renovaciones.modalNew.html',
      controller: 'RenovacionesModalCtrl',
      controllerAs: 'order',
      params: {
          myInsurance: 'some default',
          container: 'some default'
        },
      data: { pageTitle: 'Renovaciones' }
    })
    .state('siniestros', {
      abstract: true,
      url: '/siniestros',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('siniestros.plantillas', {
      url: 'plantillas',
      templateUrl: 'app/siniestros/siniestros.plantillas.html',
      controller: 'SiniestrosPlantillasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros Plantillas' }
    })
    .state('siniestros.lista', {
      url: '/lista',
      templateUrl: 'app/siniestros/new_siniestros.table.html',
      controller: 'NewSiniestrosTableCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.accidentes', {
      url: '/accidentes',
      templateUrl: 'app/siniestros/new_siniestros_accidentes.html',
      controller: 'SiniestrosAccidentesCreateCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'myInsurance',
      },
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.create_accidentes', {
      url: '/accidentes-enfermedades/',
      templateUrl: 'app/siniestros/siniestros.accidentes.html',
      // templateUrl: 'app/modals/modal.ot-creator.html',
      controller: 'SiniestrosCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'myInsurance',
      },
      data: { pageTitle: 'Siniestros - Accidentes' },
      resolve: {
        $uibModalInstance  : function(){
          return null;
        }
      }
    })
    .state('siniestros.damage', {
      url: '/damages',
      templateUrl: 'app/siniestros/siniestros.damage.html',
      controller: 'SiniestrosCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.vida', {
      url: '/vida',
      templateUrl: 'app/siniestros/siniestros.vida.html',
      controller: 'SiniestrosVidaCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.create_vida', {
      url: '/vida/',
      templateUrl: 'app/siniestros/siniestros.vida.html',
      // templateUrl: 'app/modals/modal.ot-creator.html',
      controller: 'SiniestrosVidaCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'myInsurance',
      },
      data: { pageTitle: 'Siniestros - Vida' },
      resolve: {
        $uibModalInstance  : function(){
          return null;
        }
      }
    })
    .state('siniestros.info', {
      url: '/gmm/info/:siniestroId',
      templateUrl: 'app/siniestros/new_siniestros_accidentes.info.html',
      controller: 'SiniestrosAccidentesInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.edit', {
      url: '/gmm/edit/:siniestroId',
      templateUrl: 'app/siniestros/new_siniestros_accidentes.edit.html',
      controller: 'SiniestrosAccidentesEditCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.accidentesInfo', {
      url: '/accidentes/info/:siniestroId',
      templateUrl: 'app/siniestros/siniestros.accidentes.html',
      controller: 'SiniestrosCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.vida_info', {
      url: '/vida/:siniestroId',
      templateUrl: 'app/siniestros/siniestro.vida.info.html',
      controller: 'siniestrosVidaInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.autos', {
      url: '/autos',
      templateUrl: 'app/siniestros/siniestros.autos.html',
      controller: 'SiniestrosAutosCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.danios', {
      url: '/danios',
      templateUrl: 'app/siniestros/siniestros.danios.html',
      controller: 'SiniestrosDaniosCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.create_autos', {
      url: '/autos/',
      templateUrl: 'app/siniestros/siniestros.autos.html',
      // templateUrl: 'app/modals/modal.ot-creator.html',
      controller: 'SiniestrosAutosCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'myInsurance',
      },
      data: { pageTitle: 'Siniestros - Autos' },
      resolve: {
        $uibModalInstance  : function(){
          return null;
        }
      }
    })
    .state('siniestros.create_danios', {
      url: '/danios/',
      templateUrl: 'app/siniestros/siniestros.danios.html',
      // templateUrl: 'app/modals/modal.ot-creator.html',
      controller: 'SiniestrosDaniosCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'myInsurance',
      },
      data: { pageTitle: 'Siniestros - Daños' },
      resolve: {
        $uibModalInstance  : function(){
          return null;
        }
      }
    })
    .state('siniestros.auto_info', {
      url: '/autos/:siniestroId',
      templateUrl: 'app/siniestros/siniestro.auto.info.html',
      controller: 'siniestrosAutosInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    .state('siniestros.danio_info', {
      url: '/danios/:siniestroId',
      templateUrl: 'app/siniestros/siniestro.danio.info.html',
      controller: 'siniestrosDanioInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Siniestros' }
    })
    /*Inicia nuevo endosos*/
    .state('endorsement', {
      abstract: true,
      url: '/endosos',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('endorsement.endorsement', {
      url: '/',
      templateUrl: 'app/endosoFull/endoso.full.html',
      controller: 'EndosoFullController',
      controllerAs: 'order',
      params: {
        myInsurance: 'some default',
        contractor: 'some default'
      },
      data: { pageTitle: 'Endosos' }
    })
    .state('endorsement.lista', {
      url: '/listado',
      templateUrl: 'app/endoso/endosos.table.html',
      controller: 'EndososTableCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Endosos' }
    })
    .state('endorsement.collectivity', {
      url: '/grupo',
      templateUrl: 'app/endosoFull/endoso.gpo.html',
      controller: 'EndosoGpoController',
      controllerAs: 'order',
      data: { pageTitle: 'Endosos' },
      params: {
        myInsurance: 'some default',
        contractor: 'some default'
      }
    })
    .state('endorsement.info', {
      url: '/informacion/:endosoId',
      templateUrl: 'app/endosoFull/endoso.full.information.html',
      controller: 'EndosoFullInfoController',
      controllerAs: 'order',
      data: { pageTitle: 'Endosos' }
    })
    .state('endorsement.details', {
      url: '/info/:endosoId',
      templateUrl: 'app/endoso/endosos.fianza.info.html',
      controller: 'EndososFianzaInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Endosos' }
    })
    .state('endorsement.edit', {
      url: '/edit/:endosoId',
      templateUrl: 'app/endosoFull/endoso.full.edit.html',
      controller: 'EndosoFullEditCtrl',
      controllerAs: 'order',
      data: { pageTitle: 'Endosos' }
    })
    .state('endorsement.collective', {
      url: '/fianzacolectiva',
      templateUrl: 'app/endoso/endosos.fianzaGpo.html',
      controller: 'EndososSuretyCollectiveCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'some default',
        contractor: 'some default'
      },
      data: { pageTitle: 'Endosos' }
    })
    .state('endorsement.update', {
      url: '/editar/:endosoId',
      templateUrl: 'app/endoso/endosos.fianzaGpo.edit.html',
      controller: 'EndososSuretyEditCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Endosos' }
    })
    .state('endorsement.fianza', {
      url: '/fianza/:fianzaId',
      templateUrl: 'app/endoso/endosos.fianza.html',
      controller: 'EndososSuretyCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'some default',
        contractor: 'some default'
      },
      data: { pageTitle: 'Endosos' }
    })
    /*Termina nuevo endosos*/
    .state('endosos', {
      abstract: true,
      url: '/endosos',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('endosos.endosos', {
      url: '/',
      templateUrl: 'app/endosos/endosos.html',
      controller: 'EndososCtrl',
      controllerAs: 'vm',
      params: {
        myInsurance: 'some default',
        contractor: 'some default'
      },
      data: { pageTitle: 'Endosos' }
    })
    .state('endosos.available', {
      url: '/datos',
      templateUrl: 'app/endosos/endosos.table.html',
      controller: 'EndososTableCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Endosos' }
    })
    .state('endosos.pendingDataMassive', {
      url: '/pendientes/masivos/:polizaId/:endorsementType/:endorsementId/',
      templateUrl: 'app/endosos/endosos.pendingInfoMassive.html',
      controller: 'EndososPendingMassiveCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Endosos' }
    })
    .state('endosos.pending', {
      url: '/pendientes',
      templateUrl: 'app/endosos/endosos.pending.html',
      controller: 'EndososPendingCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Endosos' }
    })
    .state('endosos.pendingData', {
      url: '/pendientes/:endorsementId/:endorsementType',
      templateUrl: 'app/endosos/endosos.pendingInformation.html',
      controller: 'EndososPendingInfoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Endosos' }
    })
    .state('endosos.information', {
      url: '/informaciones/:endorsementId',
      templateUrl: 'app/endosos/endosos.information.html',
      controller: 'EndososInformationCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Endosos' }
    })
    .state('endosos.plantillas', {
      url: '/plantillas',
      templateUrl: 'app/endosos/endosos.plantillas.html',
      controller: 'EndososPlantillasCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'EndososPlantillas' }
    })
    .state('emails', {
      abstract: true,
      url: '/emails',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('emails.smtp', {
      url: '/smtp',
      templateUrl: 'app/emails/smtp.config.html',
      data: { pageTitle: 'SMTP' },
      controller: 'SmtpConfigController',
      controllerAs: 'vm'
    })
    .state('emails.whatsapp', {
      url: '/Whatsapp',
      templateUrl: 'app/emails/whatsapp.config.html',
      data: { pageTitle: 'Whatsapp' },
      controller: 'WhatsappConfigController',
      controllerAs: 'vm'
    })
    .state('emails.config', {
      url: '/config',
      templateUrl: 'app/emails/emails.config.html',
      controller: 'EmailConfigController',
      controllerAs: 'vm',
      data: { pageTitle: 'Correos' }
    })
    .state('carga', {
      abstract: true,
      url: '/carga',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('carga.contractor', {
      url: '/contratantes',
      templateUrl: 'app/carga/carga.contratante.html',
      controller: 'cargaContractorCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Cargas' }
    })
    .state('carga.poliza', {
      url: '/poliza',
      templateUrl: 'app/carga/carga.poliza.html',
      controller: 'cargaPolizaCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Cargas' }
    })
    .state('carga.norenovacion', {
      url: '/norenovacion',
      templateUrl: 'app/carga/carga.norenovacion.html',
      controller: 'cargaNoRenovacionCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Cargas' }
    })
    .state('carga.pgrupo', {
      url: '/polizagrupo',
      templateUrl: 'app/carga/carga.polizaGpo.html',
      controller: 'cargaPolizaGrupoCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Cargas' }
    })
    .state('carga.certificado', {
      url: '/certificados',
      templateUrl: 'app/carga/carga.certificados.html',
      controller: 'cargaCertificadosCtrl',
      controllerAs: 'order',
      data: { pageTitle: 'Cargas' }
    })
    .state('carga.flotilla', {
      url: '/flotilla',
      templateUrl: 'app/carga/carga.flotilla.html',
      controller: 'cargaFlotillaCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Cargas' }
    })
    .state('carga.recibos', {
      url: '/recibos',
      templateUrl: 'app/carga/carga.recibos.html',
      controller: 'cargaRecibosCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Cargas' }
    })
    .state('carga.catalogo', {
      url: '/catalogo',
      templateUrl: 'app/carga/carga.catalogo.html',
      controller: 'cargaCatalogoCtrl',
      controllerAs: 'order',
      data: { pageTitle: 'Cargas' }
    })
    .state('carga.cancelacion', {
      url: '/cancelacion',
      templateUrl: 'app/carga/carga.cancelacion.html',
      controller: 'cargaCancelacionPolizaCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Cargas' }
    })
    .state('carga.infocontributoria', {
      url: '/informacioncontributoria',
      templateUrl: 'app/carga/carga.info_contributoria.html',
      controller: 'cargaPGInfoContributoriaCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Carga Informacion Contributoria' }
    })
    .state('recordatorios', {
      abstract: true,
      url: '/recordatorios',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    }).state('recordatorios.table', {
      url: '/',
      templateUrl: 'app/recordatorios/table/recordatorios.table.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosTableCtrl',
      controllerAs: 'vm'
    }).state('recordatorios.automaticos', {
      url: '/automaticos',
      templateUrl: 'app/recordatorios/automaticos/automaticos.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosAutomaticosCtrl',
      controllerAs: 'vm'
    }).state('recordatorios.automaticos_detalle', {
      url: '/automaticos-detalle/:id',
      templateUrl: 'app/recordatorios/automaticos/automaticos.detail.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosAutomaticosDetalleCtrl',
      controllerAs: 'vm'
    }).state('recordatorios.libres_detalle', {
      url: '/libres-detalle/:id',
      templateUrl: 'app/recordatorios/libres/libres.detail.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosLibresDetalleCtrl',
      controllerAs: 'vm'
    }).state('recordatorios.desde_registros_detalle', {
      url: '/desde-registros-detalle/:id',
      templateUrl: 'app/recordatorios/desde-registro/desde_registro.detail.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosDesdeRegistroDetalleCtrl',
      controllerAs: 'vm'
    }).state('recordatorios.automaticos_show', {
      url: '/automaticos-show/:id',
      templateUrl: 'app/recordatorios/automaticos/automaticos.show.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosAutomaticosShowCtrl',
      controllerAs: 'vm'
    }).state('recordatorios.libres_show', {
      url: '/libres-show/:id',
      templateUrl: 'app/recordatorios/libres/libres.show.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosLibresShowCtrl',
      controllerAs: 'vm'
    }).state('recordatorios.desde_registro_show', {
      url: '/desde-registros-show/:id',
      templateUrl: 'app/recordatorios/desde-registro/desde_registro.show.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosDesdeRegistroShowCtrl',
      controllerAs: 'vm'
    }).state('recordatorios.libres', {
      url: '/libres',
      templateUrl: 'app/recordatorios/libres/libres.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosLibresCtrl',
      controllerAs: 'vm'
    }).state('recordatorios.desde_registros', {
      url: '/desde-registros',
      templateUrl: 'app/recordatorios/desde-registro/desde_registro.component.html',
      data: { pageTitle: 'Recordatorios' },
      controller: 'RecordatoriosDesdeRegistrosCtrl',
      controllerAs: 'vm'
    })
    .state('reportes.adjuntos', {
      url: '/reporteadjuntos',
      templateUrl: 'app/reportes/reporte.adjuntos.html',
      data: { pageTitle: 'Reporte Adjuntos' },
      controller: 'ReporteAdjuntosController',
      controllerAs: 'vm'
    })
    .state('reportes.asegurados', {
      url: '/asegurados',
      templateUrl: 'app/reportes/reporte.asegurados.html',
      data: { pageTitle: 'Reporte Asegurados' },
      controller: 'ReporteAseguradosController',
      controllerAs: 'vm'
    })
    .state('compartir', {
      abstract: true,
      url: '/compartir',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"

    })
    .state('compartir.create', {
      url: '/:shareId',
      templateUrl: 'app/compartirapp/compartir.html',
      controller: 'CompartirAppCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Compartir a la App' }
    })
    .state('conexion', {
      abstract: true,
      url: '/conexionagentes',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"

    })
    .state('conexion.agentes', {
      url: '/:shareId',
      templateUrl: 'app/conexion_agentes/conexion_agentes.html',
      controller: 'ConexionAgentesCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Conexión Agentes' }
    })
    .state('tablero', {
      abstract: true,
      url: '/TableroOTs',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"

    })
    .state('tablero.init', {
      url: '/:tabOts',
      templateUrl: 'app/tablero/tablero.config.html',
      controller: 'TableroOtsCtrl',
      controllerAs: 'vm',
      data: { pageTitle: 'Tablero OTs' }
    })
    .state('medicoscelulas', {
      abstract: true,
      url: '/medicoscelulas',
      templateUrl: 'app/components/common/content.html',
      controller: "TabsCtrl"
    })
    .state('medicoscelulas.configuracion', {
      url: '/medicos',
      templateUrl: 'app/medicoscelulas/configuracion.html',
      data: { pageTitle: 'Médicos' },
      controller: 'MedicosCelulasConfiguracionCtrl',
      controllerAs: 'vm'
    })
  $urlRouterProvider.otherwise('/login/auth');
});


})();
