(function(){
  'use strict';

  angular.module('inspinia')
    .controller('InicioCtrl', InicioCtrl)

  InicioCtrl.$inject = ['$scope', '$localStorage', '$sessionStorage', '$state','dataFactory','$interval', '$timeout'];

  function InicioCtrl($scope, $localStorage, $sessionStorage, $state,dataFactory,$interval, $timeout){

    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);

    var usr = JSON.parse(decryptedUser);
    var token = JSON.parse(decryptedToken);

    $scope.infoUser = $sessionStorage.infoUser;

    var vm = this;
    var order = this;
    $('#carousel-example-generic').carousel({ interval: 3000 });
    order.accesos = $sessionStorage.permisos
    if (order.accesos) {
      order.accesos.forEach(function(perm){
        if(perm.model_name == 'Pólizas'){
          order.acceso_polizas = perm
          order.acceso_polizas.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar pólizas') {
              if (acc.checked == true) {
                order.acceso_adm_pol = true
              }else{
                order.acceso_adm_pol = false
              }
            }
            if (acc.permission_name == 'Ver pólizas') {
              if (acc.checked == true) {
                order.acceso_ver_pol = true
              }else{
                order.acceso_ver_pol = false
              }
            }            
            if (acc.permission_name == 'Comisión no obligatoria') {
              if (acc.checked == true) {
                order.acceso_cno_pol = true
              }else{
                order.acceso_cno_pol = false
              }
            }
          })
        }else if (perm.model_name == 'Formatos') {
          order.acceso_form = perm;
          order.acceso_form.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Formatos') {
              if (acc.checked == true) {
                order.acceso_form = true
              }else{
                order.acceso_form = false
              }
            }
          })
        }else if(perm.model_name == 'Ordenes de trabajo'){
          order.acceso_ot = perm
          order.acceso_ot.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar OTs') {
              if (acc.checked == true) {
                order.acceso_adm_ot = true
              }else{
                order.acceso_adm_ot = false
              }
            }else if (acc.permission_name == 'Ver OTs') {
              if (acc.checked == true) {
                order.acceso_ver_ot = true
              }else{
                order.acceso_ver_ot = false
              }
            }
          })
        }else if (perm.model_name == 'Contratantes y grupos') {
          order.acceso_contg = perm;
          order.acceso_contg.permissions.forEach(function(acc) {
            if (acc.permission_name == 'Administrar contratantes y grupos') {
              if (acc.checked == true) {
                order.acceso_adm_cont = true
              }else{
                order.acceso_adm_cont = false
              }
            }else if (acc.permission_name == 'Ver contratantes y grupos') {
              if (acc.checked == true) {
                order.acceso_ver_cont = true
              }else{
                order.acceso_ver_cont = false
              }
            }
          })
        }else if(perm.model_name == 'Comisiones'){
          order.coms = perm
          order.coms.permissions.forEach(function(acc){
            if (acc.permission_name == 'Comisiones') {
              if (acc.checked == true) {
                order.permiso_comisiones = true
              }else{
                order.permiso_comisiones = false
              }
            }
          })
        }else if(perm.model_name == 'Archivos'){
          order.acceso_files = perm
          order.acceso_files.permissions.forEach(function(acc){
            if (acc.permission_name == 'Administrar archivos sensibles') {
              if (acc.checked == true) {
                order.permiso_archivos = true
              }else{
                order.permiso_archivos = false
              }
            }
          })
        }else if(perm.model_name == 'Referenciadores'){
          order.acceso_refereciador = perm
          order.acceso_refereciador.permissions.forEach(function(acc){
            if (acc.permission_name == 'Referenciador no obligatorio') {
              if (acc.checked == true) {
                order.acc_referenciador_obligatorio = true
              }else{
                order.acc_referenciador_obligatorio = false
              }
            }
          })
        }
      })
    }
    $scope.carousel = [];
    vm.logo = $localStorage.mainLogo;

    var DEFAULT_CAROUSEL = [{
      'imagen': '../../assets/images/inicio/1-banner_ok.png'
    }];
    var CAROUSEL_ORG_RETRY_DELAY = 1500;
    var MAX_CAROUSEL_ORG_RETRY_ATTEMPTS = 5;
    var carouselOrgRetryTimer = null;
    var carouselOrgRetryAttempts = 0;

    getCarousel(3);

    $scope.$on('$destroy', function () {
      cancelCarouselOrgRetry();
    });

    function decodeEncryptedUserCandidate(blob) {
      if (!blob || !window.safeDecrypt) {
        return null;
      }
      return window.safeDecrypt('User', blob);
    }

    function normalizeOrgValue(value) {
      if (value === null || typeof value === 'undefined') {
        return '';
      }

      if (angular.isObject(value)) {
        if (value.urlname) {
          return normalizeOrgValue(value.urlname);
        }
        if (value.org && value.org.urlname) {
          return normalizeOrgValue(value.org.urlname);
        }
        if (value.orgName) {
          return normalizeOrgValue(value.orgName);
        }
        if (value.orgname) {
          return normalizeOrgValue(value.orgname);
        }
        if (value.org) {
          return normalizeOrgValue(value.org);
        }
        return '';
      }

      if (typeof value !== 'string') {
        try {
          value = value.toString();
        } catch (_) {
          return '';
        }
      }

      var trimmed = value.trim();
      if (!trimmed) {
        return '';
      }

      var lower = trimmed.toLowerCase();
      if (lower === 'undefined' || lower === 'null') {
        return '';
      }

      return trimmed;
    }

    function extractOrgFromCandidate(candidate) {
      if (!candidate) {
        return '';
      }

      if (angular.isString(candidate)) {
        try {
          candidate = JSON.parse(candidate);
        } catch (_) {
          return normalizeOrgValue(candidate);
        }
      }

      if (angular.isObject(candidate)) {
        var keys = ['urlname', 'org', 'orgName', 'orgname'];
        for (var idx = 0; idx < keys.length; idx++) {
          if (candidate[keys[idx]]) {
            return normalizeOrgValue(candidate[keys[idx]]);
          }
        }

        if (candidate.orgInfo && candidate.orgInfo.urlname) {
          return normalizeOrgValue(candidate.orgInfo.urlname);
        }
      }

      return '';
    }

    function readStoredOrgUrlname() {
      var candidates = [
        decodeEncryptedUserCandidate($sessionStorage.user),
        decodeEncryptedUserCandidate($localStorage.user),
        $sessionStorage.infoUser,
        $localStorage.infoUser
      ];

      for (var i = 0; i < candidates.length; i++) {
        var extracted = extractOrgFromCandidate(candidates[i]);
        if (extracted) {
          return extracted;
        }
      }

      return '';
    }

    function cancelCarouselOrgRetry() {
      if (carouselOrgRetryTimer) {
        $timeout.cancel(carouselOrgRetryTimer);
        carouselOrgRetryTimer = null;
      }
      carouselOrgRetryAttempts = 0;
    }

    function scheduleCarouselOrgRetry() {
      if (carouselOrgRetryTimer || carouselOrgRetryAttempts >= MAX_CAROUSEL_ORG_RETRY_ATTEMPTS) {
        return;
      }

      carouselOrgRetryTimer = $timeout(function () {
        carouselOrgRetryTimer = null;
        var orgCandidate = readStoredOrgUrlname();
        if (orgCandidate) {
          console.log('getCarousel inicio.controller.js: detected org "%s" after invalid response. Retrying load.', orgCandidate);
          getCarousel(3);
          return;
        }

        carouselOrgRetryAttempts += 1;
        scheduleCarouselOrgRetry();
      }, CAROUSEL_ORG_RETRY_DELAY);
    }

    function hasInvalidOrgParameter(error) {
      if (!error || error.status !== 403) {
        return false;
      }

      var config = error.config || {};
      var rawUrl = (config.url || '').toString();
      if (rawUrl.toLowerCase().indexOf('get-carousel-from-cas/') === -1) {
        return false;
      }

      var orgValue = '';
      if (config.params && typeof config.params.org !== 'undefined' && config.params.org !== null) {
        orgValue = config.params.org;
      } else {
        var match = rawUrl.match(/[?&]org=([^&#]*)/);
        orgValue = match && match[1] ? decodeURIComponent(match[1]) : '';
      }

      if (orgValue === null || typeof orgValue === 'undefined') {
        orgValue = '';
      }

      if (typeof orgValue !== 'string') {
        try {
          orgValue = orgValue.toString();
        } catch (_) {
          orgValue = '';
        }
      }

      var normalizedOrg = orgValue.trim().toLowerCase();
      return !normalizedOrg || normalizedOrg === 'undefined' || normalizedOrg === 'null';
    }

    function getCarousel(retryCount) {
      retryCount = angular.isNumber(retryCount) ? retryCount : 3;

      var orgForRequest = readStoredOrgUrlname();
      var requestParams = orgForRequest ? { org: orgForRequest } : undefined;

      dataFactory.get('get-carousel-from-cas/', requestParams)
        .then(function success(response) {
          cancelCarouselOrgRetry();
          var data = response.data && response.data.data;
          $scope.carousel = (data && data.length > 0) ? data : angular.copy(DEFAULT_CAROUSEL);
        })
        .catch(function (e) {
          if (hasInvalidOrgParameter(e)) {
            console.warn('Skipping carousel retry because the org parameter is missing or invalid.');
            console.log('getCarousel inicio.controller.js: fallback to default banner due to invalid org parameter.');
            $scope.carousel = angular.copy(DEFAULT_CAROUSEL);
            var storedOrgCandidate = readStoredOrgUrlname();
            if (storedOrgCandidate) {
              console.log('getCarousel inicio.controller.js: stored org "%s" found after fallback. Retrying immediately.', storedOrgCandidate);
              $timeout(function () {
                getCarousel(3);
              }, 500);
              return;
            }

            carouselOrgRetryAttempts = 0;
            scheduleCarouselOrgRetry();
            return;
          }

          if (retryCount > 0) {
            console.warn('getCarousel failed. Retrying in 1s... Attempts left:', retryCount);
            $timeout(function() {
              getCarousel(retryCount - 1);
            }, 1000);
          } else {
            console.error('Failed to fetch carousel after multiple attempts:', e);
            $scope.carousel = angular.copy(DEFAULT_CAROUSEL);
          }
        });
    }
    
    $scope.currentIndex = 0;

    // Siguiente slide
    $scope.nextSlide = function() {
      $scope.currentIndex = ($scope.currentIndex + 1) % $scope.carousel.length;
    };

    // Anterior slide
    $scope.prevSlide = function() {
      $scope.currentIndex = ($scope.currentIndex - 1 + $scope.carousel.length) % $scope.carousel.length;
    };

    // Ir a un slide específico
    $scope.goToSlide = function(index) {
      $scope.currentIndex = index;
    };

    // Reproducción automática (opcional)
    var interval = $interval(function() {
      $scope.nextSlide();
    }, 3000);

    // Limpieza al destruir
    $scope.$on('$destroy', function() {
      $interval.cancel(interval);
    });
    // modal crear OT
    $scope.otCreatorModalEvent =  function(param) {
      if(order.acceso_adm_ot || order.acceso_adm_pol) {
        if(param == 1) {
          $scope.open_in_same_tab_natural('Creación póliza', 'polizas.create', {}, 0);
          $state.go('polizas.create');
        } else if(param == 2) {
          $scope.open_in_same_tab_natural('Creación póliza', 'colectividades.main', {}, 0);
          $state.go('colectividades.main');
        }
      }
    }
      
  }

})();