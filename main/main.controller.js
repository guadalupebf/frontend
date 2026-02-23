(function() {
  'use strict';

  var app = angular.module('inspinia');
  app.controller('MainCtrl', MainCtrl);
  app.config(['ChartJsProvider',
      function(ChartJsProvider) {
          // Configure all charts
          ChartJsProvider.setOptions({
              colours: ['#23A91C', '#F1E223', '#DF7401', '#CF2226'],
              responsive: true,
              segmentShowStroke: false,
              animationEasing: 'easeInOutQuart'
          });
          // Configure all line charts
          ChartJsProvider.setOptions('Line', {
              datasetFill: false
          });
      }
  ]);
  app.filter('propsFilter', propsFilter);

  function propsFilter() {
      return function(items, props) {
          var out = [];

          //if (angular.isArrayF(items)) {
          if (angular.isArray(items)) {
              items.forEach(function(item) {
                  var itemMatches = false;
                  var keys = Object.keys(props);
                  for (var i = 0; i < keys.length; i++) {
                      var prop = keys[i];
                      var text = props[prop].toLowerCase();
                      if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                          itemMatches = true;
                          break;
                      }
                  }
                  if (itemMatches) {
                      out.push(item);
                  }
              });
          } else {
              // Let the output be the input untouched
              out = items;
          }
          return out;
      };
  }

  $(document).ready(function(){
    if (firebase.messaging.isSupported()) {
      var messaging = firebase.messaging();
      messaging.onTokenRefresh(function() {
        messaging.getToken().then(function(refreshedToken) {
          $http.post(url.IP + 'guardar-firebase-token/',{'token':refreshedToken, 'action':'save'}).then(function(response) {
            console.log('firebase get token success');
          }).catch(function(error) {
            console.log('error firebase get token', error)
          });
          // Indicate that the new Instance ID token has not yet been sent to the
          // app server.
          // Send Instance ID token to app server.
          // sendTokenToServer(refreshedToken);
          // ...
        }).catch(function(err) {
          console.log('Unable to retrieve refreshed token ', err);
          showToken('Unable to retrieve refreshed token ', err);
        });
      });
    }
  });

  app.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
      var fn = $parse(attrs.ngRightClick);
      element.bind('contextmenu', function(event) {
        scope.$apply(function() {
          event.preventDefault();
          fn(scope, {$event:event});
        });
      });
    };
  });

  MainCtrl.$inject = ['$firebaseObject','$sce', 'curr_rate_options', '$scope', 'statusPayform', '$state', '$uibModal', '$filter', '$localStorage', '$timeout', '$location', 'Idle',
      'receiptService', 'insuranceService', 'ContratanteService', 'providerService', 'ramoService', 'packageService', 'MESSAGES', '$sessionStorage',
      'status', 'payform', 'url', 'moduleInjection', 'modalService', 'helpers', 'toaster', 'endorsementService', '$q', '$http', 'endorsement', '$rootScope', '$window', 'SweetAlert',
      'exportFactory', 'dataFactory', 'appStates','$interval','NotificationService', 'whatsappWebFlagService', 'siniestroWhatsappService'];

  function MainCtrl($firebaseObject, $sce, curr_rate_options, $scope, statusPayform, $state, $uibModal, $filter, $localStorage, $timeout, $location, Idle,
      receiptService, insuranceService, ContratanteService, providerService, ramoService, packageService, MESSAGES, $sessionStorage,
      status, payform, url, moduleInjection, modalService, helpers, toaster, endorsementService, $q, $http, endorsement, $rootScope, $window, SweetAlert,
      exportFactory, dataFactory, appStates, $interval,NotificationService, whatsappWebFlagService, siniestroWhatsappService) {
      
      // $(window).load(function() {
      //     $('.js-example-basic-multiple').select2();
      // });
      angular.element(document).ready(function(){
        $('.js-example-basic-multiple').select2();
      });
      var main = this;
      main.whatsappWebEnabled = whatsappWebFlagService.isEnabled();
      whatsappWebFlagService.subscribe(function(enabled) {
        $scope.$evalAsync(function() {
          main.whatsappWebEnabled = enabled; // ✅ CORRECTO
        });
      }, $scope);
      main.sendWhatsAppWeb = openWhatsapp;
      
      var usr = {};
      var authCache = {
        tokenBlob: null,
        tokenValue: null,
        userBlob: null,
        userValue: null
      };

      function debugLog(context, payload) {
        // try {
        //   console.log('[SAAM][MainCtrl] ' + context, payload || {});
        // } catch (logError) {
        //   // Evitamos que un problema de consola rompa el flujo.
        // }
      }

      function extractTokenString(candidate) {
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

      function describeTokenCandidate(candidate) {
        var tokenString = extractTokenString(candidate);

        if (!tokenString) {
          return {
            hasToken: false,
            tokenLength: 0,
            tokenSuffix: null
          };
        }

        var suffixLength = tokenString.length > 8 ? 8 : tokenString.length;
        return {
          hasToken: true,
          tokenLength: tokenString.length,
          tokenSuffix: tokenString.slice(tokenString.length - suffixLength)
        };
      }

      function logAuthSnapshot(context, extra) {
        var tokenInfo = describeTokenCandidate(authCache.tokenValue);
        var userInfo = authCache.userValue || {};
        var orgInfo = null;

        if (userInfo && userInfo.org) {
          orgInfo = userInfo.org.urlname || userInfo.org.name || userInfo.org.id || null;
        }

        var payload = {
          tokenPresent: tokenInfo.hasToken,
          tokenLength: tokenInfo.tokenLength,
          tokenSuffix: tokenInfo.tokenSuffix,
          hasUser: !!authCache.userValue,
          userOrg: orgInfo
        };

        if (extra && typeof extra === 'object') {
          Object.keys(extra).forEach(function(key) {
            try {
              payload[key] = extra[key];
            } catch (_) {
              // Ignoramos errores al copiar propiedades de depuración.
            }
          });
        }

        debugLog(context, payload);
      }

      main.emailsReminderAdd = emailsReminderAdd;
      main.notifications = {};
      $rootScope.notificationscount =0;
      main.chat=[];
      main.chat_receive=[];
      main.user_admin = 'user'
      main.user_is_staff = false;
      $scope.usr_name = '';

      refreshUserFromStorage(true);

      $scope.$watch(function() {
        return $sessionStorage.user;
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          debugLog('watch:$sessionStorage.user', {
            hasValue: !!newValue
          });
          refreshUserFromStorage(true);
        }
      });

      $scope.$watch(function() {
        return $localStorage.user;
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          debugLog('watch:$localStorage.user', {
            hasValue: !!newValue
          });
          refreshUserFromStorage(true);
        }
      });

      $scope.$watch(function() {
        return $sessionStorage.token;
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          var length = 0;
          if (newValue && typeof newValue === 'string') {
            length = newValue.length;
          }
          debugLog('watch:$sessionStorage.token', {
            hasValue: !!newValue,
            length: length
          });
          getCurrentToken(true);
        }
      });

      $scope.$watch(function() {
        return $localStorage.token;
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          var length = 0;
          if (newValue && typeof newValue === 'string') {
            length = newValue.length;
          }
          debugLog('watch:$localStorage.token', {
            hasValue: !!newValue,
            length: length
          });
          getCurrentToken(true);
        }
      });

      $scope.moduleName='Célula';

      function getStoredAuthBlob(key) {
        if ($sessionStorage && $sessionStorage[key]) {
          return $sessionStorage[key];
        }

        if ($localStorage && $localStorage[key]) {
          return $localStorage[key];
        }

        return null;
      }

      function safeDecryptValue(label, encryptedValue) {
        if (!encryptedValue) {
          return null;
        }

        try {
          return sjcl.decrypt(label, encryptedValue);
        } catch (error) {
          console.warn('[SAAM] No se pudo descifrar el valor de', label, error);
          return null;
        }
      }

      function safeJsonParse(rawValue) {
        if (rawValue === null || typeof rawValue === 'undefined') {
          return null;
        }

        try {
          return JSON.parse(rawValue);
        } catch (error) {
          console.warn('[SAAM] No se pudo interpretar el contenido descifrado', error);
          return null;
        }
      }

      function decodeUserBlob(blob) {
        var decrypted = safeDecryptValue('User', blob);
        return safeJsonParse(decrypted);
      }

      function decodeTokenBlob(blob) {
        var decrypted = safeDecryptValue('Token', blob);
        return safeJsonParse(decrypted);
      }

      function getCurrentUser(forceRefresh) {
        var blob = getStoredAuthBlob('user');

        if (!blob) {
          authCache.userBlob = null;
          authCache.userValue = null;
          if (forceRefresh) {
            logAuthSnapshot('getCurrentUser -> sin información de usuario', {
              forceRefresh: !!forceRefresh
            });
          }
          return null;
        }

        if (forceRefresh || blob !== authCache.userBlob) {
          authCache.userBlob = blob;
          authCache.userValue = decodeUserBlob(blob);
          logAuthSnapshot('getCurrentUser -> actualizado', {
            forceRefresh: !!forceRefresh
          });
        }

        return authCache.userValue;
      }

      function getCurrentToken(forceRefresh) {
        var blob = getStoredAuthBlob('token');

        if (!blob) {
          authCache.tokenBlob = null;
          authCache.tokenValue = null;
          if (forceRefresh) {
            logAuthSnapshot('getCurrentToken -> sin token', {
              forceRefresh: !!forceRefresh
            });
          }
          return null;
        }

        if (forceRefresh || blob !== authCache.tokenBlob) {
          authCache.tokenBlob = blob;
          authCache.tokenValue = decodeTokenBlob(blob);
          logAuthSnapshot('getCurrentToken -> actualizado', {
            forceRefresh: !!forceRefresh
          });
        }

        return authCache.tokenValue;
      }

      function refreshUserFromStorage(forceRefresh) {
        var latest = getCurrentUser(forceRefresh);

        if (!latest) {
          usr = {};
          main.userLogin = null;
          main.orgName = null;
          $rootScope.usr = null;
          logAuthSnapshot('refreshUserFromStorage -> sin usuario', {
            forceRefresh: !!forceRefresh
          });
          return;
        }

        usr = latest;
        main.userLogin = latest;
        main.orgName = latest.org;
        $rootScope.usr = latest;
        logAuthSnapshot('refreshUserFromStorage -> usuario cargado', {
          forceRefresh: !!forceRefresh,
          userName: latest.username || latest.email || latest.name || null
        });
      }
      dataFactory.get('orginfo/')
      .then(function success(response) {
          if(response && response.data && response.data.results && response.data.results.length){
            $scope.configuracionGlobal = response.data.results[0]
            if($scope.configuracionGlobal.moduleName){
              $scope.moduleName=$scope.configuracionGlobal.moduleName;
            }
          }
      })

      // Pace.ignore(function() {
      // main.socket = io.connect(url.REPORT_SERVICE_NODE_SOCKET);
      // })
      //initUser();
      if (firebase.messaging.isSupported()) {
        firebase.messaging().onMessage(function(payload){
          main.notifications['count']  +=1;
          $rootScope.notificationscount +=1;
          SweetAlert.swal({
            title:payload.notification.title,
            icon: 'success',
            text: payload.notification.body,
            timer: 7000
          });
          // setTimeout(function() {
            // SweetAlert.swal({
            //   title: payload.notification.title,
            //   text: payload.notification.body,
            //   type: "success"
            // });
            toaster.success(payload.notification.title)
          // }, 1000);
        });
      }

      main.chat_text='';
      main.user_search_text='';
      main.active_chat = {};

      //Function
      $scope.has_sr_conf = false;
      main.logout = logout;
      main.block = block;
      main.initUser = initUser;
      // Show tables
      main.policyTable = false;
      main.endorsementTable = false;
      main.coverageTable = false;
      main.renewalTable = false;
      main.sinisterTable = false;
      main.search = false;
      main.titleID = null;
      main.title = '';
      main.pago_recibo_actual;
      main.totalReceipts = [];
      main.loaded = false;
      main.changeStatusModal = changeStatusModal;
      main.showBinnacle = showBinnacle;
      main.returnToReceipts = returnToReceipts;
      main.showBinnacle_endoso = showBinnacle_endoso;
      main.returnToEndoso = returnToEndoso;
      main.show_binnacle = false;
      // main.massiveReceipts = massiveReceipts;
      main.pagarRecibos = pagarRecibos;
      main.adminReminder = adminReminder;
      main.viewCarta = viewCarta;
      main.goToEndorsement = goToEndorsement;

      main.name = null;
      main.heading = null;
      main.route = null;

      $scope.list = {};
      $scope.ShowContextMenu = function(name, route){
        $scope.name_for_new_tab = name;
        $scope.route_for_new_tab = route;
      }

      $scope.open_in_same_tab = function(name, route){
        var existe = false;
        if (name && route){
          $scope.route_for_new_tab = route;
          $scope.name_for_new_tab = name;
          appStates.states.forEach(function(state) {
            if (state.route == $scope.route_for_new_tab){
              existe = true;
            }
          });
        }

        if (!existe){
          var active_tab = appStates.states.findIndex(function(item){
            if (item.active){
              return true
            }
            return false;
          });
          
          appStates.states[active_tab] = { 
            name: $scope.name_for_new_tab, 
            heading: $scope.name_for_new_tab, 
            route: $scope.route_for_new_tab, 
            active: true, 
            isVisible: true, 
            href: $state.href($scope.route_for_new_tab),
          }
        }
        $localStorage.tab_states = appStates.states;
        $state.go($scope.route_for_new_tab);
      }
      
      $scope.open_new_tab = function(){
        var existe = false;
        appStates.states.forEach(function(state) {
          if (state.route == $scope.route_for_new_tab && state.id == $scope.id_for_new_tab){
            existe = true;
          }
        });
        if(appStates.states.length > 3){
          SweetAlert.swal("Error", "No se pueden abrir más pestañas.", "error");
        }else{
          if (!existe){
            appStates.states.push(
              { 
                id: $scope.id_for_new_tab, 
                name: $scope.name_for_new_tab, 
                heading: $scope.name_for_new_tab, 
                route: $scope.route_for_new_tab, 
                active: true, 
                isVisible: true, 
                href: $state.href($scope.route_for_new_tab, {polizaId: $scope.id_for_new_tab})
              }
            );
            $localStorage.tab_states = appStates.states;
          }
        }
      }

      $scope.show_financiero = true;
      $scope.show_produccion = false;
      $scope.show_cotizacion = false;
      $scope.show_gastos = false;
      $scope.show_task = false;

      if ($sessionStorage.token !== undefined) {
        $http.get(url.IP + 'filtros-subramos-dash/').then(function(response){
          $scope.has_sr_conf =  response && response.data && response.data.data && response.data.data.length > 0 ? true:false;
        })
      }

      // $scope.goToEndorsement = function(name, route, endorsement){
      //   $scope.name_for_new_tab = name;
      //   $scope.route_for_new_tab = route;

      //   var existe = false;
      //   if (name && route){
      //     $scope.route_for_new_tab = route;
      //     $scope.name_for_new_tab = name;
      //     appStates.states.forEach(function(state) {
      //       if (state.route == $scope.route_for_new_tab){
      //         existe = true;
      //       }
      //     });
      //   }

      //   if (!existe){
      //     var active_tab = appStates.states.findIndex(function(item){
      //       if (item.active){
      //         return true
      //       }
      //       return false;
      //     });
          
      //     appStates.states[active_tab] = { 
      //       name: $scope.name_for_new_tab, 
      //       heading: $scope.name_for_new_tab, 
      //       route: $scope.route_for_new_tab, 
      //       active: true, 
      //       isVisible: true, 
      //       href: $state.href($scope.route_for_new_tab),
      //     }
      //   }
      //   $localStorage.tab_states = appStates.states;
        
      //   var params = { 'endosoId': endorsement.id }
      //   $state.go($scope.route_for_new_tab, params);
      // }

      $scope.goToEndorsement = function(name, route, endorsement){
        console.log(endorsement)
        var name = 'Información endosos'
        var route = 'endorsement.info';

        $scope.name_for_new_tab = name;
        $scope.route_for_new_tab = route;

        var existe = false;
        if (name && route){
          $scope.route_for_new_tab = route;
          $scope.name_for_new_tab = name;
          appStates.states.forEach(function(state) {
            if (state.route == $scope.route_for_new_tab){
              existe = true;
            }
          });
        }

        if (!existe){
          var active_tab = appStates.states.findIndex(function(item){
            if (item.active){
              return true
            }
            return false;
          });
          
          appStates.states[active_tab] = { 
            name: $scope.name_for_new_tab, 
            heading: $scope.name_for_new_tab, 
            route: $scope.route_for_new_tab, 
            active: true, 
            isVisible: true, 
            href: $state.href($scope.route_for_new_tab),
          }
        }else{
          var active_tab = appStates.states.findIndex(function(item){
              if (item.route == route) {
                item.id = endorsement.id
              }
          });
        }
        $localStorage.tab_states = appStates.states;
        $state.go('endorsement.info',{endosoId: endorsement.id})
      }

      $scope.goToSiniester = function(name, route){
        $scope.name_for_new_tab = name;
        $scope.route_for_new_tab = route;

        var existe = false;
        if (name && route){
          $scope.route_for_new_tab = route;
          $scope.name_for_new_tab = name;
          appStates.states.forEach(function(state) {
            if (state.route == $scope.route_for_new_tab){
              existe = true;
            }
          });
        }

        if (!existe){
          var active_tab = appStates.states.findIndex(function(item){
            if (item.active){
              return true
            }
            return false;
          });
          
          appStates.states[active_tab] = { 
            name: $scope.name_for_new_tab, 
            heading: $scope.name_for_new_tab, 
            route: $scope.route_for_new_tab, 
            active: true, 
            isVisible: true, 
            href: $state.href($scope.route_for_new_tab),
          }
        }
        $localStorage.tab_states = appStates.states;
        
        $state.go($scope.route_for_new_tab);
      }

      $scope.goToTask = function(item) {
        if (item.model == 26){
          return;
        }

        if(item.involucrado_por_area == true){
          return;
        }
        if (item.model == 22){
          // $state.go('task.task', {id_task: item.id_reference, main_comming: true} )     
          $scope.name_for_new_tab = 'Tareas';
          $scope.route_for_new_tab = 'task.task';
          var params = {id_task: item.id_reference, main_comming: true}
          var existe = false;
          if (name && route){
            $scope.route_for_new_tab = route;
            $scope.name_for_new_tab = name;
            appStates.states.forEach(function(state) {
              if (state.route == $scope.route_for_new_tab){
                existe = true;
              }
            });
          }

          if (!existe){
            var active_tab = appStates.states.findIndex(function(item){
              if (item.active){
                return true
              }
              return false;
            });
            
            appStates.states[active_tab] = { 
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab,params),
            }
          }
          $localStorage.tab_states = appStates.states;
          $state.go($scope.route_for_new_tab, params);       
        }else if (item.model == 31){  
          if (item.recordatorio) {
            if (item.recordatorio) {
              if (item.recordatorio.tipo == 1) {//atm
                $http.patch(item.url,{'seen':true});
                main.notifications['count'] =  main.notifications['count'] -1
                $rootScope.notificationscount =  $rootScope.notificationscount -1
                $scope.name_for_new_tab = 'Recordatorio Automático';
                // $scope.route_for_new_tab = 'recordatorios.table';
                $scope.route_for_new_tab = 'recordatorios.automaticos_show';                  
                var params = {id: item.id_reference}
              }else if (item.recordatorio.tipo == 2) {//atm
                $http.patch(item.url,{'seen':true});
                 main.notifications['count'] =  main.notifications['count'] -1
                 $rootScope.notificationscount =  $rootScope.notificationscount -1
                $scope.name_for_new_tab = 'Recordatorio Libre';
                // $scope.route_for_new_tab = 'recordatorios.table';
                $scope.route_for_new_tab = 'recordatorios.libres_show';
                var params = {id: item.recordatorio.id}
              }else if (item.recordatorio.tipo == 3) {//atm
                $http.patch(item.url,{'seen':true});
                main.notifications['count'] =  main.notifications['count'] -1
                $rootScope.notificationscount =  $rootScope.notificationscount -1
                $scope.name_for_new_tab = 'Recordatorio desde registro';
                // $scope.route_for_new_tab = 'recordatorios.table';
                $scope.route_for_new_tab = 'recordatorios.desde_registro_show';
                var params = {id: item.recordatorio.id}
              }
            }
          }
          var existe = false;
          var route = $scope.route_for_new_tab
          var name = $scope.name_for_new_tab
          if (name && route){
            $scope.route_for_new_tab = route;
            $scope.name_for_new_tab = name;
            appStates.states.forEach(function(state) {
              if (state.route == $scope.route_for_new_tab){
                existe = true;
              }
            });
          }

          if (!existe){
            var active_tab = appStates.states.findIndex(function(item){
              if (item.active){
                return true
              }
              return false;
            });
            
            appStates.states[active_tab] = { 
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab,params),
            }
          }
          $localStorage.tab_states = appStates.states;
          $state.go($scope.route_for_new_tab, params);       
        }else if (item.model == 15){  //bitácora de algún registro
          if (item.id_reference) {//id del comentario / bitácora
            $scope.listo=false;
            $http({
              method: 'GET',
              url: url.IP+'commentsById/'+item.id_reference,
            })
            .then(function(request) {
              if(request && request.data){              
                var bitacora = request.data;
                var model = bitacora.model
                var idreference = bitacora.id_model
                var params = {}
                if (model ==1 || model==6){
                  $http.patch(item.url,{'seen':true});
                  main.notifications['count'] =  main.notifications['count'] -1
                  $rootScope.notificationscount =  $rootScope.notificationscount -1
                  $scope.name_for_new_tab = 'Información pólizas';
                  $scope.route_for_new_tab = 'polizas.info';                  
                  params = {polizaId: idreference}
                  $scope.listo=true;
                  $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                }
                if (model ==2){
                  $http.get(url.IP + 'contractor/'+idreference+'/').then(function(response){
                    $scope.contratante_ok =  response.data;
                    $http.patch(item.url,{'seen':true});
                    main.notifications['count'] =  main.notifications['count'] -1
                    $rootScope.notificationscount =  $rootScope.notificationscount -1
                    $scope.name_for_new_tab = 'Información contratante';
                    $scope.route_for_new_tab = 'contratantes.info';                
                    params = {contratanteId: idreference,type:$scope.contratante_ok.type_person==1 ? 'fisicas' : 'morales'}
                    $scope.listo=true;
                    $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                  })
                }
                if (model ==4){
                  // ('Información póliza','flotillas.info',  {polizaId: insurance.id}, insurance.id);
                  $http.get(url.IP + 'recibos/'+idreference+'/').then(function(response){
                    var recibo =  response.data;
                    $http.patch(item.url,{'seen':true});
                    main.notifications['count'] =  main.notifications['count'] -1
                    $rootScope.notificationscount =  $rootScope.notificationscount -1
                    if(response.data.receipt_type==1 && recibo.poliza_document_type==1){
                      $scope.name_for_new_tab = 'Información póliza';
                      $scope.route_for_new_tab = 'polizas.info';  
                      params = {polizaId: recibo.poliza_id}
                    }else if(response.data.receipt_type==1 && recibo.poliza_document_type==3){
                      $scope.name_for_new_tab = 'Información Póliza Grupo';
                      $scope.route_for_new_tab = 'polizas.info';  
                      params = {polizaId: recibo.poliza_id}
                    }else if(response.data.receipt_type==1 && recibo.poliza_document_type==12){
                      $scope.name_for_new_tab = 'Información Póliza Flotilla';
                      $scope.route_for_new_tab = 'flotillas.info';  
                      params = {polizaId: recibo.poliza_parent_id}
                    }else if(response.data.receipt_type==1 && (recibo.poliza_document_type==7 || recibo.poliza_document_type==8)){
                      if(insurance.document_type == 8){
                        var name = 'Información fianza';
                        var route = 'fianzas.details';
                      }else{
                        var name = 'Información fianza';
                        var route = 'fianzas.info';
                      }
                      $scope.name_for_new_tab = name;
                      $scope.route_for_new_tab = route;  
                      params = {polizaId: recibo.poliza_id}
                    }else if(response.data.receipt_type == 2 || response.data.receipt_type == 3){
                      if(document_type == 7 || document_type == 8){
                        $scope.name_for_new_tab = 'Información endoso';
                        $scope.route_for_new_tab = 'endorsement.details';  
                        params = {endosoId: recibo.endo_id}
                      }else{
                        $scope.name_for_new_tab = 'Información endoso';
                        $scope.route_for_new_tab = 'endorsement.info';  
                        params = {endosoId: recibo.endo_id}
                      }
                    }else{
                      $scope.name_for_new_tab = 'Información póliza';
                      $scope.route_for_new_tab = 'polizas.info';  
                    }          
                    $scope.listo=true;
                    $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                  })
                }
                if (model ==8){
                  $http.patch(item.url,{'seen':true});
                  main.notifications['count'] =  main.notifications['count'] -1
                  $rootScope.notificationscount =  $rootScope.notificationscount -1
                  $scope.route_for_new_tab = 'grupos.info'
                  params ={grupoId: idreference}            
                  $scope.listo=true;
                  $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                }
                if (model ==10){
                  $http.get(url.IP + 'endorsement/'+idreference+'/').then(function(response){
                    var endoso =  response.data;
                    $http.patch(item.url,{'seen':true});
                    main.notifications['count'] =  main.notifications['count'] -1
                    $rootScope.notificationscount =  $rootScope.notificationscount -1
                    if(endoso.poliza_document_type == 7 || endoso.poliza_document_type == 8){
                      $scope.name_for_new_tab = 'Información endoso';
                      $scope.route_for_new_tab = 'endorsement.details';  
                      params = {endosoId: endoso.id}
                    }else{
                      $scope.name_for_new_tab = 'Información endoso';
                      $scope.route_for_new_tab = 'endorsement.info';  
                      params = {endosoId: endoso.id}
                    }                            
                    $scope.listo=true;
                    $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                  })
                }
                if( model ==12){
                  $scope.name_for_new_tab = 'Información Estado de Cuenta';
                  $scope.route_for_new_tab = 'agentes.receipts';  
                  $http.patch(item.url,{'seen':true});
                  main.notifications['count'] =  main.notifications['count'] -1
                  $rootScope.notificationscount =  $rootScope.notificationscount -1
                  params = {folioId: idreference}
                  $scope.listo=true;
                  $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                }
                if(model ==13){
                  $http.get(url.IP + 'polizas/'+idreference+'/').then(function(response){
                    $http.patch(item.url,{'seen':true});
                    main.notifications['count'] =  main.notifications['count'] -1
                    $rootScope.notificationscount =  $rootScope.notificationscount -1
                    if(response.data.document_type == 8){
                      var name = 'Información fianza';
                      var route = 'fianzas.details';
                    }else{
                      var name = 'Información fianza';
                      var route = 'fianzas.info';
                    }
                    $scope.name_for_new_tab = name;
                    $scope.route_for_new_tab = route;  
                    params = {polizaId: idreference}
                    $scope.listo=true;
                    $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                  })
                }
                if(model ==18){
                  var name = 'Información Póliza Grupo';
                  var route = 'colectividades.info';
                  $http.patch(item.url,{'seen':true});
                  main.notifications['count'] =  main.notifications['count'] -1
                  $rootScope.notificationscount =  $rootScope.notificationscount -1
                  $scope.name_for_new_tab = name;
                  $scope.route_for_new_tab = route;  
                  params = {polizaId: idreference}
                  $scope.listo=true;
                  $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                }
                if(model ==22){
                  var name = 'Información Tareas';
                  var route = 'task.task';
                  $http.patch(item.url,{'seen':true});
                  main.notifications['count'] =  main.notifications['count'] -1
                  $rootScope.notificationscount =  $rootScope.notificationscount -1
                  $scope.name_for_new_tab = name;
                  $scope.route_for_new_tab = route;  
                  params = {id_task: idreference,main_comming:true}
                  $scope.listo=true;
                  $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                }
                if(model ==28){
                  // 'Flotillas', 'flotillas.info', {polizaId: parseInt(polizaObj.caratula)}, polizaObj.caratula);
                  $http.get(url.IP + 'polizas/'+idreference+'/').then(function(response){
                    var name = 'Información Flotilla';
                    var route = 'flotillas.info';
                    var polizaObj=response.data
                    $http.patch(item.url,{'seen':true});
                    main.notifications['count'] =  main.notifications['count'] -1
                    $rootScope.notificationscount =  $rootScope.notificationscount -1
                    $scope.name_for_new_tab = name;
                    $scope.route_for_new_tab = route;  
                    params = {polizaId: polizaObj.caratula}
                    $scope.listo=true;
                    $scope.redireccionar($scope.route_for_new_tab,$scope.name_for_new_tab,params)
                  })
                }
                  
              }
            })
            .catch(function(e) {
              console.log('e', e);
            });
            // MODEL_CHOICES = ((1, u'Pólizas'), 
            // (2, u'Contratantes'), 
            // (4, u'Recibos'), 
            // (5, u'Siniestros'), 
            // (6, u'Renovaciones'),    
            // (7, u'Recibos-Comisiones'), 
            // (8, u'Grupos'), 
            // (9, u'Paquetes'), 
            // (10, u'Endosos'), 
            // (11, u'Aseguradoras'), 
            // (12, u'Estados de Cuenta'), 
            // (13, u'Fianzas'), 
            // (14, u'Afianzadoras'), 
            // (15, u'Comentarios'), 
            // (16, u'Logs') , 
            // (17, u'Cartas'), 
            // (18, u'Colectividades'), 
            // (19, u'Graphs'),
            // (20, u'Notes'),
            // (21, u'Fianzas Reclamaciones'), 
            // (22, u'Tareas'),
            // (23, u'Tareas Completados'),
            // (24, u'Events'),
            // (25, u'Certificado'),
            // (26, u'Reportes'),
            // (27, u'NotificaciónApp'),
            // (28, u'Flotillas'),
            // (29, u'Plantilla Correo'), 
            // (30, u'Cotizacion'), 
            // (31, u'Recordatorios'), 
            // (32, u'LogSystem'), 
            // (33, u'Plantilla SMS'), 
            // (34, u'Conceptos Generales Referenciador'), 
            // )
          }    
        }else{
          SweetAlert.swal({
            title: "¡Aviso!",
            text: item.description,
            type: "info"
          });
        }
      }
      $scope.redireccionar= function (route_for_new_tab,name_for_new_tab,params){
        var existe = false;
        var route = route_for_new_tab
        var name = name_for_new_tab
        if (name && route ){
          $scope.route_for_new_tab = route;
          $scope.name_for_new_tab = name;
          appStates.states.forEach(function(state) {
            if (state.route == $scope.route_for_new_tab){
              existe = true;
            }
          });
        }

        if (!existe){
          var active_tab = appStates.states.findIndex(function(item){
            if (item.active){
              return true
            }
            return false;
          });
          
          appStates.states[active_tab] = { 
            name: $scope.name_for_new_tab, 
            heading: $scope.name_for_new_tab, 
            route: $scope.route_for_new_tab, 
            active: true, 
            isVisible: true, 
            href: $state.href($scope.route_for_new_tab,params),
          }
        }
        $localStorage.tab_states = appStates.states;
        $state.go($scope.route_for_new_tab, params); 
      }
      $scope.showReminder = function(recordatorio,index){
        
      }
      $scope.updateChat= function() {
        if($scope.chat_user_active ==true){
          $scope.chat_user_active =false;
        }
        else{
          $scope.chat_user_active =true;
        }
        main.chat=[];
        main.chat_receive=[];
        
        $http.get(url.IP + 'usuarios').then(function(data_usuarios) {
          main.users = data_usuarios.data.results;
        })
        // var ref_admin = firebase.database().ref().child('Chats').orderByChild('org').equalTo(usr.org);
        // main.chat_receive =$firebaseObject(ref_admin);


        // if (usr.name =='user'){
        //   main.user_is_staff = true
        // }


        // if(main.user_is_staff == false){
        //   var ref = firebase.database().ref().child('Chats').orderByChild('from').equalTo(usr.name);
        //   var ref_admin = firebase.database().ref().child('Chats').orderByChild('from').equalTo(main.user_admin);
        //   main.chat =$firebaseObject(ref);
        //   main.chat_receive =$firebaseObject(ref_admin);
        // }
        // else{
        //   var ref_admin = firebase.database().ref().child('Chats').orderByChild('to').equalTo(main.user_admin);
        //   main.chat_receive =$firebaseObject(ref_admin);
        // }
      }
      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var usr_log = JSON.parse(decryptedUser);
      $scope.user_pay = {}
      if($location.path() !== '/login/auth') {
          $http({
            method: 'GET',
            url: url.IP+'get_user_by_username/',
            params: {
              'username': usr_log.name,
            }
        })
        .then(function(request) {
          $scope.user_pay = request.data
        })
        .catch(function(e) {
          console.log('e', e);
        });
      }
      $scope.ver_select_pay = false;
      // dataFactory.get('has-add-emails-permission')
      // .then(function(req) {
      //   if(true) {
      //     $scope.add_emails = req.data;
      //   }
      // });

      function sort(a, b){
         var nameA=a.toLowerCase(), nameB=b.toLowerCase();
         if (nameA > nameB){
          return 1;
         }
         else{
          return 0;
         }
      };

      $scope.openChat = function(user) {
        
        main.active_chat['user'] = user;
        if (!main.active_chat.user.id){
          return
        }
        if($scope.chat_active ==true){
          $scope.chat_active =false;
        }
        else{
          $scope.chat_active =true;
        }

        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);
        $scope.usr_name = usr.name
        $scope.usr_org = usr.org
        var rootRef = firebase.database().ref()
        var to_usr_name = user.username

        if (sort($scope.usr_name, to_usr_name) != 1){
          var id = $scope.usr_name +'_'+ to_usr_name;
        }
        else{
          var id = to_usr_name.toLowerCase() + '_' + $scope.usr_name.toLowerCase();
        }

        var ref_admin = rootRef.child('Chats/'+$scope.usr_org).orderByChild('id').equalTo(id);
        main.chat_receive =$firebaseObject(ref_admin);
      }

      $scope.closeChat = function() {
        $scope.chat_active =false;
      }

      $scope.closeUsersChat = function() {
        $scope.chat_user_active =false;
      }


      $scope.showInformationQ = function(item) {        
        // $state.go('task.task', {id_task: item.id_reference, main_comming: true} )     
        $scope.name_for_new_tab = 'Cotización';
        $scope.route_for_new_tab = 'cotizacion.info';
        var params = {id_cotizacion: item.id, main_comming: true,polizaId:item.id}
        var existe = false;
        if ($scope.name && $scope.route){
          $scope.route_for_new_tab = route;
          $scope.name_for_new_tab = name;
          appStates.states.forEach(function(state) {
            if (state.route == $scope.route_for_new_tab){
              existe = true;
            }
          });
        }

        if (!existe){
          var active_tab = appStates.states.findIndex(function(item){
            if (item.active){
              return true
            }
            return false;
          });
          
          appStates.states[active_tab] = { 
            name: $scope.name_for_new_tab, 
            heading: $scope.name_for_new_tab, 
            route: $scope.route_for_new_tab, 
            active: true, 
            isVisible: true, 
            href: $state.href($scope.route_for_new_tab,params),
          }
        }
        $localStorage.tab_states = appStates.states;
        $state.go($scope.route_for_new_tab, params);    
      }

      $scope.searchChatUser = function(string) {
        if (string == ''){
          return
        }
      }


      $scope.sendChatMessage = function(text){
        if (text == ''){
          return
        }
        $http.post(url.IP + 'send-push-message',{'content':text, 'to':main.active_chat.user.id}).then(function(response){
          main.chat_text = '';
        });
      }

      /* -------- Inicia asistente -------- */
      $scope.assistantStart = false;
      $scope.num_message = 0;

      $scope.openAssistant= function() {
        $scope.assistantStart = true;
        main.chat_assistant = [];
        $scope.sendAssistantMessage(2,'hola')
      };

      $scope.minimizerAssistant = function(clic){
        if(clic==1){
          angular.element(document.getElementById('box-assistant')).scope().getInfo();
          document.getElementById("box-assistant").style.height = "400px";
          document.getElementsByClassName("header-assistant")[0].style.borderBottomLeftRadius = "0px"; 
          document.getElementsByClassName("header-assistant")[0].style.borderBottomRightRadius = "0px";
          document.getElementsByClassName("content-assistant")[0].style.display = "block";
          document.getElementsByClassName("footer-assistant")[0].style.display = "block";
          $scope.minimizer = false;
          $scope.num_noti = 0;
          clic = clic + 1;
        } else{
          document.getElementById("box-assistant").style.height = "44px"; 
          document.getElementsByClassName("header-assistant")[0].style.borderBottomLeftRadius = "20px"; 
          document.getElementsByClassName("header-assistant")[0].style.borderBottomRightRadius = "20px";
          document.getElementsByClassName("content-assistant")[0].style.display = "none";
          document.getElementsByClassName("footer-assistant")[0].style.display = "none";
          $scope.minimizer = true;
          clic = 1;
        }
      }

      $scope.closeAssistant= function() {
        $scope.assistantStart = false;
        main.chat_assistant = [];
        main.message_assistant = "";
        $scope.sendAssistantMessage(0, '/restart');
      };

      var altura = 293;

      $scope.sendAssistantMessage = function(value, text){
        if (text == ''){
          return
        }else{
          if(isNaN(text)){
            if(main.chat_assistant.length){
              for(var j = 1; j <= $scope.num_message; j++){
                main.chat_assistant[main.chat_assistant.length - j].actual = false;
              }
            }
            if(value == 2){
              var msj = {
                'owner': 'user',
                'message': text,
                'date': new Date(),
                'actual': false
              }
              main.chat_assistant.push(msj);
            }
            main.message_assistant = "";
            msj = {
              'owner': 'ia',
              'message': {'text': 'Escribiendo...'},
              'date': new Date(),
              'actual': true
            }
            main.chat_assistant.push(msj);
            altura = altura + 800;
            $(".content-assistant").animate({scrollTop: altura + "px"});
          }else{
            $scope.minimizerAssistant(1);
            $state.go('polizas.info', {polizaId: text});
          }
        }
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr_log1 = JSON.parse(decryptedUser);

        var urlBot = 'https://ed14-2806-268-481-77b-242d-6183-f81c-33d1.ngrok.io/webhooks/rest/webhook'
        var urlBot = 'https://saam-test.ixuah.com/webhooks/rest/webhook'
        // var urlBot ='https://8437-2806-268-481-77b-acf5-f482-ec11-cd4b.ngrok.io/webhooks/rest/webhook'
        
        var data_ = JSON.stringify({"sender":$scope.infoUser.token_jwt + '-org-' + usr_log1.org, "message":text});          
        
        $http({
          method: 'POST',
          url: urlBot,
          data: data_,
          headers: {'Access-Control-Allow-Origin:': "*",
                     'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
                     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                     'Content-Type': 'multipart/form-data'
                   }, 
        })
        .then(function success(request){
            if(request.status === 200){
              $scope.num_message = request.data.length;
              $scope.num_noti = request.data.length;
              main.chat_assistant.splice(main.chat_assistant.length - 1, 1);
              for(var i = 0; i < request.data.length; i++){
                var msj = {
                  'owner': 'ia',
                  'message': request.data[i],
                  'date': new Date(),
                  'actual': true
                }
                msj['message'].text = msj['message'].text.replace(/\n/g,"<br>");
                //msj['message'].text =$sce.trustAsHtml(msj['message'].text)
                main.chat_assistant.push(msj);
                altura = altura + 800;
                $(".content-assistant").animate({scrollTop: altura + "px"});
              }
            }
            else{
              $scope.num_message = 1;
              main.chat_assistant.splice(main.chat_assistant.length - 1, 1);
              var msj = {
                'owner': 'ia',
                'message': {'text': 'Lo lamento, no encontré resultados, ¿tienes otra pregunta?'},
                'date': new Date(),
                'actual': true
              }
              main.chat_assistant.push(msj);
            }
        },function error(error){
          console.log('error - bot', error);
        })
        .catch(function(e) {
          console.log('error - BOT - catch', e);
        });
      }
      /* -------- Termina asistente ------- */

      /* -------- Inicia KBI -------- */

      $scope.show_financiero = true;
      $scope.show_produccion = false;
      $scope.show_cotizacion = false;
      $scope.show_gastos = false;
      $scope.showLoaderKbi = false;
      main.exportDataReceiptsAll = exportDataReceiptsAll;

      function exportDataReceiptsAll(param){
        var lrc = Ladda.create( document.querySelector( '.ladda-button3' ) );
        lrc.start();
        main.show_cobranza = false
        if (main.cadena) {
          var params = {
                tipo: parType,
                order: order,
                asc: asc, 
                cadena: main.cadena,
                serie : main.serie ? main.serie : null, 
              }
        }else{
          var params = {
                tipo: parType,
                order: order,
                asc: asc,
                serie : main.serie ? main.serie : null, 
                cadena: main.cadena ? main.cadena : null
              }
        }
        if (param == 2){
           $http({
              method: 'GET',
              url: url.IP +'excel-graficas-recibos/',
              // url: url.IP +'v2/recibos/excel-graficas-recibos/',
              params: params,
              headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
              responseType: "arraybuffer"
            })
            .then(
              function success(response) {
                if(response.status === 200 || response.status === 201) {
                  lrc.stop();
                  console.log('iiaaaaai',$localStorage['graficas_recibos_url'],url.IP +'excel-graficas-recibos/')
                  var blob = new Blob([response.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                  saveAs(blob, 'Reporte_Cobranza.xls');                     
                }else{
                  lrc.stop();
                }
          });
        }
      }

      $scope.convertDateMain = function(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');                
        return date;
      }

      $scope.charts_kbi = {}
      $scope.newGoal = {
        value: null,
        model: null,
        options: [
          {id: '1', name: 'MXN'},
          {id: '2', name: 'USD'}
        ]
      };
      $scope.currencies = [
        {id: '1', name: 'MXN'},
        {id: '2', name: 'USD'}
      ];
      $scope.options = [
        {id: '1', name: 'Año'},
        {id: '2', name: 'Ramo'},
        {id: '3', name: 'Subramo'}
      ];
      $scope.newGoal.model = $scope.newGoal.options[0].id;
      $scope.year_kbi = (new Date()).getFullYear();
      $scope.currency_kbi = "1";
      $scope.show_for = "1";

      $scope.show_currency_mxn = true;
      $scope.show_currency_usd = false;
      $scope.show_currency_eur = false;
      $scope.show_currency_udi = false;

      $scope.startDate_production = $scope.convertDateMain(new Date('01-01-' + (new Date()).getFullYear()));
      $scope.endDate_production = $scope.convertDateMain(new Date());

      $scope.data_filter = {
        since_year: (new Date()).getFullYear() - 1,
        until_year: (new Date()).getFullYear(),
        since_day: $scope.startDate_production,
        until_day: $scope.endDate_production
      }

      $scope.concepts = [
        {concept: 'Renta / Alquiler', cantidad: '', value: 1},
        {concept: 'Nómina', cantidad: '', value: 2},
        {concept: 'Servicios Públicos', cantidad: '', value: 3},
        {concept: 'Publicidad', cantidad: '', value: 4},
        {concept: 'Impuestos', cantidad: '', value: 5},
        {concept: 'Materiales de oficina', cantidad: '', value: 6},
        {concept: 'Tributos', cantidad: '', value: 7},
        {concept: 'Préstamos o hipotecas', cantidad: '', value: 8},
        {concept: 'Servicios de empresas externas', cantidad: '', value: 9}
      ];

      if ($sessionStorage.infoUser) {
        $scope.url_kbi = 'kbi/'
        // }else{
        //   $scope.url_kbi = 'v2/core/kbi/'
        // }
      }else{
        $scope.url_kbi = 'kbi/'
      }

      $scope.getFilter = function(value, param, startDate, endDate){
        $scope.year_kbi = param;
        if(value == 0){
          $scope.year_kbi = (new Date()).getFullYear();
          $scope.data_filter = {
            since_year: (new Date()).getFullYear() - 1,
            until_year: (new Date()).getFullYear(),
            since_day: $scope.startDate_production,
            until_day: $scope.endDate_production
          }
        }else{
          $scope.data_filter = {
            since_year: $scope.year_kbi - 1,
            until_year: $scope.year_kbi,
            since_day: startDate,
            until_day: endDate
          }
        }
        $scope.getInfo();
      };

      $scope.changeCurrencyKbi = function(value){
        if(value == "1"){
          $scope.show_currency_mxn = true;
          $scope.show_currency_usd = false;
          $scope.show_currency_eur = false;
          $scope.show_currency_udi = false;
          $scope.currency_kbi = "1";
        }else if(value == "2"){
          $scope.show_currency_mxn = false;
          $scope.show_currency_usd = true;
          $scope.show_currency_eur = false;
          $scope.show_currency_udi = false;
          $scope.currency_kbi = "2";
        }else if(value == "3"){
          $scope.show_currency_mxn = false;
          $scope.show_currency_usd = false;
          $scope.show_currency_eur = true;
          $scope.show_currency_udi = false;
        }else if(value == "4"){
          $scope.show_currency_mxn = false;
          $scope.show_currency_usd = false;
          $scope.show_currency_eur = false;
          $scope.show_currency_udi = true;
        }
      };

      $scope.getInfo = function() {
        $scope.showLoaderKbi = true;
        if ($scope.charts_kbi) {
          $scope.charts_kbi.aseguradoras = {};
          $scope.charts_kbi.aseguradorasDolar = {};
          $scope.charts_kbi.subramos = {};
          $scope.charts_kbi.subramosDolar = {};
        }
        // dataFactory.post('kbi/')
        dataFactory.post($scope.url_kbi, $scope.data_filter)
        .then(function success(response) {
          $scope.charts_kbi = response.data;
          $scope.now = $scope.convertDateMain(new Date());
          $scope.charts_kbi.ejecutivos = JSON.parse(response.data.ejecutivos);
          $scope.charts_kbi.ejecutivosDolar = JSON.parse(response.data.ejecutivosDolar);
          $scope.charts_kbi.aseguradoras = JSON.parse(response.data.aseguradoras);
          $scope.charts_kbi.aseguradorasDolar = JSON.parse(response.data.aseguradorasDolar);
          $scope.charts_kbi.subramos = JSON.parse(response.data.subramos);
          $scope.charts_kbi.subramosDolar = JSON.parse(response.data.subramosDolar);
          $scope.charts_kbi.goal.percentajeGoal = parseFloat($scope.charts_kbi.goal.percentajeGoal).toFixed(2);
          $scope.progressGoal = {
            'width': $scope.charts_kbi.goal.percentajeGoal + '%'
          };

          if($scope.charts_kbi.goal.value > 0){
            $scope.showBtnKbi = true;
            var fin = new Date();
            var f = fin.getFullYear()-1;
            $scope.fin =fin.getFullYear();
            $scope.range_pc = 'De: '+$scope.now +' al '+'31/12/'+$scope.fin; 
            $scope.range_cp = 'De: '+'01/01/'+$scope.fin +' al '+$scope.now; 
            $scope.range_date = 'De: '+'01/01/'+$scope.fin +' al '+'31/12/'+$scope.fin ; 
            $scope.range_bar = 'Años: '+f +' y '+fin.getFullYear() ; 
          } else {
            $scope.showBtnKbi = false;
          }

          $scope.newGoal.value = parseFloat($scope.charts_kbi.goal.value);
          $scope.newGoal.model = $scope.charts_kbi.goal.currency;

          if($scope.charts_kbi.monthsUtilidad){
            $scope.total_utilidad = 0;
            $scope.charts_kbi.monthsUtilidad.forEach(function(item){
              if(item.value){
                $scope.total_utilidad = parseFloat(($scope.total_utilidad + parseFloat(item.value)).toFixed(2));
              }
            });
          }
          $scope.showLoaderKbi = false;
        })
      }

      $scope.selectMonth = function(mes) {
        $scope.month_selected = mes.id;
      }

      $scope.show_tab_kbi = function(value){
        if(value == 1){
          $scope.show_financiero = true;
          $scope.show_produccion = false;
          $scope.show_cotizacion = false;
          $scope.show_gastos = false;
        }
        else if(value == 2){
          $scope.show_financiero = false;
          $scope.show_produccion = true;
          $scope.show_cotizacion = false;
          $scope.show_gastos = false;
        }
        else if(value == 3){
          $scope.show_financiero = false;
          $scope.show_produccion = false;
          $scope.show_cotizacion = true;
          $scope.show_gastos = false;
        }
        else if(value == 4){
          $scope.show_financiero = false;
          $scope.show_produccion = false;
          $scope.show_cotizacion = false;
          $scope.show_gastos = true;
        }
        // if($scope.show_currency_mxn){
        //   $scope.changeCurrencyKbi("1");
        // }else if($scope.show_currency_usd){
        //   $scope.changeCurrencyKbi("2");
        // }
      }

      $scope.show_ejectivo = true;
      $scope.show_aseguradora = false;
      $scope.show_subramo = false;

      $scope.show_tab_production = function(value){
        if(value == 1){
          $scope.show_ejectivo = true;
          $scope.show_aseguradora = false;
          $scope.show_subramo = false;
        }
        else if(value == 2){
          $scope.show_ejectivo = false;
          $scope.show_aseguradora = true;
          $scope.show_subramo = false;
        }
        else if(value == 3){
          $scope.show_ejectivo = false;
          $scope.show_aseguradora = false;
          $scope.show_subramo = true;
        }
      };

      $scope.saveGoal = function(){
        dataFactory.post('goal/', {'goal': $scope.newGoal.value});
        $scope.showBtnKbi = true;
      };

      $scope.editGoal = function(){
        dataFactory.post('goal/', {'goal': $scope.newGoal.value});
        $scope.showBtnKbi = false;
      };

      $scope.saveGastos = function(){
        var obj = [];
        $scope.concepts.forEach(function(child, index) {
          if(child.concept && child.cantidad){
            child.month = $scope.month_selected;
            obj.push(child);
          }
          if($scope.concepts.length == (index + 1)){
            dataFactory.post('expenses/', obj)
            .then(function success(response) {
              if(response.status == 201){
                $scope.concepts = [
                  {concept: 'Renta / Alquiler', cantidad: '', value: 1},
                  {concept: 'Nómina', cantidad: '', value: 2},
                  {concept: 'Servicios Públicos', cantidad: '', value: 3},
                  {concept: 'Publicidad', cantidad: '', value: 4},
                  {concept: 'Impuestos', cantidad: '', value: 5},
                  {concept: 'Materiales de oficina', cantidad: '', value: 6},
                  {concept: 'Tributos', cantidad: '', value: 7},
                  {concept: 'Préstamos o hipotecas', cantidad: '', value: 8},
                  {concept: 'Servicios de empresas externas', cantidad: '', value: 9}
                ];
                $scope.getInfo();
              }
            })
          }
        })
      };

      $scope.months_kbi = [
        {'id': 1, 'month': 'Enero'},
        {'id': 2, 'month': 'Febrero'},
        {'id': 3, 'month': 'Marzo'},
        {'id': 4, 'month': 'Abril'},
        {'id': 5, 'month': 'Mayo'},
        {'id': 6, 'month': 'Junio'},
        {'id': 7, 'month': 'Julio'},
        {'id': 8, 'month': 'Agosto'},
        {'id': 9, 'month': 'Septiembre'},
        {'id': 10, 'month': 'Octubre'},
        {'id': 11, 'month': 'Noviembre'},
        {'id': 12, 'month': 'Diciembre'}
      ];

      $scope.monthName = function (month){
        switch(month) {
          case 1:
            return 'Enero'
            break;
          case 2:
            return 'Febrero'
            break;
          case 3:
            return 'Marzo'
            break;
          case 4:
            return 'Abril'
            break;
          case 5:
            return 'Mayo'
            break;
          case 6:
            return 'Junio'
            break;
          case 7:
            return 'Julio'
            break;
          case 8:
            return 'Agosto'
            break;
          case 9:
            return 'Septiembre'
            break;
          case 10:
            return 'Octubre'
            break;
          case 11:
            return 'Noviembre'
            break;
          case 12:
            return 'Diciembre'
            break;
        }
      }

      $scope.addConcept = function(){
        var concept = {
          concept: '',
          cantidad: '',
          value: 10
        };
        $scope.concepts.push(concept);
      };

      $scope.removeConcept = function(item){
        $scope.concepts.splice(item, 1);
      };

      $scope.validateDecimal = function(input){
        if(input){
          if(parseFloat(input) < 0){
            $scope.$filternewGoal.value = 0;
          }
          else{
            $scope.newGoal.value = parseFloat(input.toFixed(2));  
          }
        } 
      };

      $scope.validateGasto = function(input){
        if(input){
          for(var i = 0; i < $scope.concepts.length; i++){
            if($scope.concepts[i].cantidad != ""){
              if(parseFloat($scope.concepts[i].cantidad) < 0){
                $scope.concepts[i].cantidad = 0;
              }
              else{
                $scope.concepts[i].cantidad = parseFloat($scope.concepts[i].cantidad.toFixed(2));  
              }
            }
          } 
        }
      };

      $scope.deleteConcept = function(item, index){
        SweetAlert.swal({
            title: "¿Está seguro?",
            text: "Eliminar " + item.concept + ". Los cambios no podrán revertirse",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: false
          },
          function(isConfirm){
            if (isConfirm) {
              $http.delete(item.url)
              .then(function(request){
                    SweetAlert.swal("Listo", "El concepto ha sido eliminado", "success");
                    $scope.getInfo();
                  } 
              )
              .catch(function(e) {
                console.log('error - catch', e);
              });
            } else {
              SweetAlert.swal("Cancelado", "El concepto no se ha eliminado.", "info");
            }
          });
      };

      /* --------- Termina KBI ---------- */

      if ($localStorage.url_operation == '/operacion.semanal') {
        $state.go('operacion.semanal');
      }
      main.submit = function(name, route, param){
        // param = main.cadena;
        if(param){
          $scope.name_for_new_tab = name;
          $scope.route_for_new_tab = route;

          var existe = false;
          if (name && route){
            $scope.route_for_new_tab = route;
            $scope.name_for_new_tab = name;
            appStates.states.forEach(function(state) {
              if (state.route == $scope.route_for_new_tab){
                existe = true;
              }
            });
          }

          if (!existe){
            var active_tab = appStates.states.findIndex(function(item){
              if (item.active){
                return true
              }
              return false;
            });
            
            appStates.states[active_tab] = { 
              name: $scope.name_for_new_tab, 
              heading: $scope.name_for_new_tab, 
              route: $scope.route_for_new_tab, 
              active: true, 
              isVisible: true, 
              href: $state.href($scope.route_for_new_tab),
            }
          }
          $localStorage.tab_states = appStates.states;

          $state.go($scope.route_for_new_tab, {cadena: param});
        } else {
          SweetAlert.swal({
            title: "¡Error!",
            text: "Por favor introduzca una busqueda válida",
            type: "error"
          });
        }          
      }
      main.clearInput = function(param){
        if(param){
          param = ''
          main.cadena = ''
          $state.go('buscador.buscador', {cadena: param});
        } else {
          SweetAlert.swal({
            title: "¡Error!",
            text: "Por favor introduzca una busqueda válida",
            type: "error"
          });
        }          
      }


      main.status = [{
          label: 'Pagado',
          value: 1
      }, {
          label: 'Cancelado',
          value: 2
      }, {
          label: 'Prorrogado',
          value: 3
      }, {
          label: 'Pendiente de Pago',
          value: 4
      }, {
        label: 'Pago parcial',
        value: 9
    }, ];

      if(!$rootScope.mc_permission) {
        $rootScope.mc_permission = $sessionStorage.mc_permission;
      }

      main.saveStatus = saveStatus;
      main.ChangeStatus = ChangeStatus;
      main.totalPendingOts = {};
      main.totalEndorsement = {};
      main.recibos_pagados;
      main.endorsements = [];
      main.insurances = [];
      main.endo_vida = [];
      main.endo_gm = [];
      main.endo_danos = [];
      main.endo_autos = [];
      main.receipts = [];
      main.policies = [];
      main.notascredito = []

      main.otColors = [{
          'fillColor': 'rgba(224, 108, 112, 1)',
          'strokeColor': 'rgba(207,100,103,1)',
          'pointColor': 'rgba(220,220,220,1)',
          'pointStrokeColor': '#fff',
          'pointHighlightFill': '#fff',
          'pointHighlightStroke': 'rgba(151,187,205,0.8)',
      }];

      main.editInsurance = editInsurance;
      main.editInsuranceModal = editInsuranceModal;
      main.renewPolicy = renewPolicy;
      main.editRecibo = editRecibo;
      main.showPhone = showPhone;
      main.showEmail = showEmail;
      main.NotasModal = NotasModal;
      main.getBirthdays = getBirthdays;
      main.goToPolicy = goToPolicy;
      main.changeViewed = changeViewed;
      main.getNotifications = getNotifications;

      main.endosos_data = [
        {value: 1, name: 'Automóviles'},
        {value: 2, name: 'Daños'},
        {value: 3, name: 'Gastos Medicos'},
        {value: 4, name: 'Vida'}
      ];

      /* Mejora = 1, Error = 2 */
      main.changes = [
        //Notificaciones
         // {id: 1, desc: "Correcciones menores en vista de información de contratantes", type: 2},
         // {id: 1, desc: "Se agrega visualización de recibos de fianzas en listado de cobranza", type: 1},
         // {id: 1, desc: "Se agrega visualización de recibos de fianzas en superbuscador", type: 1},
         // {id: 1, desc: "Modulo de tareas, se resaltan aquellas tareas que tengan actualizaciones en los ultimos 3 dias", type: 1},

         //{id: 1, desc: "Mejoras en validacion de decimales en siniestros de accidentes y enfermedades", type: 1},
         //{id: 1, desc: "Mejoras en validacion de decimales en siniestros de autos", type: 1},
         //{id: 1, desc: "Validacion de numeros decimales en modulo de comisiones", type: 1},
      ];

      main.type_endoso = 1;
      main.recibos_a_pagar = [];

      /* Funciones buscador */
      main.searchOTs = searchOTs;
      main.searchNotas = searchNotas;
      main.searchReceipts = searchReceipts;
      main.searchRenewals = searchRenewals;
      main.searchSinisters = searchSinisters;
      main.excel_search = excel_search;
      main.loadMoreNotifications = loadMoreNotifications;

      function goToEndorsement(insurance) {
        if(insurance.policy.document_type == 1 || insurance.policy.document_type == 2){
          $state.go('endosos.pendingData', {endorsementId: insurance.id, endorsementType: main.checkEndorsementType(insurance)});
        } else {
          $state.go('endosos.pendingDataMassive', {endorsementId: insurance.id, endorsementType: main.checkEndorsementType(insurance), polizaId: insurance.policy.id});
        }
      }
      main.seeNotification = false;

    $scope.intervalFunction = function(){
      $timeout(function() {
        loadMoreNotifications();
        // $scope.intervalFunction();
      }, 1000)
    };
    // $scope.intervalFunction();
    // ---------------
    $scope.$on('MainCtrl:getNotifications', function(event, args) {
      NotificationService.getNotifications();
    });

    // Fetch notifications on controller load to initialize the count
    NotificationService.getNotifications();
    // --------------------
    // $scope.$on('MainCtrl:getNotifications', function(event, args) {
    //   getNotifications();
    // });
    function getNotifications() {
      if ($sessionStorage.token !== undefined) {
        dataFactory.get('notifications-test')
        .then(function success(response) {
          $timeout(function() {
            $scope.main.notifications = response.data;
            $rootScope.notificationscount = $scope.main.notifications.count; 
            $rootScope.$evalAsync( function(){
              $rootScope.notificationscount = $scope.main.notifications.count;
              console.log('RootScope notifications count re-updated:', $rootScope.notificationscount);
            });
            $timeout(function() {
              $rootScope.recordatorioscount = $scope.main.notifications['recordatorios'];
              $scope.main.notifications.results.forEach(function(notify) {
                if (notify.seen === false && notify.model !== 31) {
                  $scope.main.notifications['count'] -= 1;
                  $rootScope.notificationscount -= 1
                  $http.patch(notify.url, { 'seen': true });
                }
              });
            }, 1000);
          });
        });
      }
    }
     $(document).click(function (e) {
       var config2 = $("#config2");
       if (!$('#configDropdown').is(e.target) && !config2.is(e.target) && config2.has(e.target).length == 0) {
          if (main.seeNotification) {
            main.seeNotification = false
          }
       }
     });
      $scope.seeNot = function(parS) {
        if (!parS) {
          main.seeNotification = true;
        }else{
          main.seeNotification = false;            
        }
      }
      function loadMoreNotifications() {
        try{
          $http.get(main.notifications.next)
          .then(function success(response) {
            response.data.results.forEach(function(notify){
              if(!notify.seen){
                $http.patch(notify.url,{'seen':true})
              }
            });
            main.notifications.results =  main.notifications.results.concat(response.data.results) ;
            main.notifications.next = response.data.next;
            
          })
        }catch(r){}
      }

      function searchOTs(cadena, gtype) {
        main.ot_pagination = [];
        if (gtype == "" || gtype == null){         
          gtype = 0;
        }
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //   $scope.search_ot = 'v2/generics/search-ot-dash';
        $scope.search_ot = 'search-ot-dash';
        dataFactory.get($scope.search_ot, {cadena: cadena, tipo: gtype})
        .then(function success(response) {
          main.insurances = response.data.insurances
          main.endo = response.data.endo
        })
      }

      function searchNotas(cadena) {
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //   $scope.search_note = 'v2/generics/search-notas-dash';
        $scope.search_note = 'search-notas-dash';
        dataFactory.get($scope.search_note, {cadena: cadena})
        .then(function success(response) {
          main.notascredito = response.data.results;
        })
      }

      function searchReceipts(serie,cadena, gtype) {
        main.receipts = [];
        main.config_receipts = [];
        main.show_paginationReceipts = false;
        if (gtype == "" || gtype == null){         
          gtype = 0;
        }
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //   $scope.search_receipt = 'v2/generics/search-receipt-dash';
        $scope.search_receipt = 'search-receipt-dash';
        if (cadena) {
          dataFactory.get($scope.search_receipt, {cadena: cadena, tipo: gtype, serie: serie ? serie : 0})
          .then(function success(response) {
            main.receipts = response.data.results;
            main.config_receipts =  {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            }
            response.data.results.forEach(function(rec) {                 
              main.recibos_a_pagar.forEach(function(rec_w) {                  
                if(rec.id == rec_w.id){
                  if (rec) {
                    rec.toPay =true;
                  }else{                 
                    
                  }
                }
              })
            })
            main.show_paginationReceipts = true;
          })
        }else{
          if (parseInt(gtype) == 1){
            gtype = 'green';
          }
          else if (parseInt(gtype) == 2){
            gtype= 'yellow'
          }else if (parseInt(gtype) == 3){
            gtype = 'orange'
          }else if (parseInt(gtype) == 4) {
            gtype = 'red'
          }
          else{
            gtype = 'all'
          }
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   var return_chart_s = 'v2/recibos/graficas-recibos/';
          var return_chart_s = 'graficas-recibos/';
          $http({
            method: 'GET',
            url: url.IP + return_chart_s,
            params:{
              tipo: gtype,
              order: 1,
              asc: 1,
              serie: serie ? serie : 0
            }
          })
          .then(
            function success(response) {
              main.receipts = response.data.results;
            main.config_receipts =  {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            }
            response.data.results.forEach(function(rec) {                 
              main.recibos_a_pagar.forEach(function(rec_w) {                  
                if(rec.id == rec_w.id){
                  if (rec) {
                    rec.toPay =true;
                  }else{                 
                    
                  }
                }
              })
            })
            main.show_paginationReceipts = true;
          })
        }
      }

      function searchRenewals(cadena, gtype) {
        // main.titleID = gtype       
        main.policies = [];
        main.config_renovaciones = [];
        main.show_paginationRenewals = false;
        main.show_renovaciones_pagination = false;
        if (parseInt(gtype) == 1){
          gtype = 'green';
        }
        else if (parseInt(gtype) == 2){
          gtype= 'yellow'
        }else if (parseInt(gtype) == 3){
          gtype = 'orange'
        }else if (parseInt(gtype) == 4) {
          gtype = 'red'
        }
        else{
          gtype = 'all'
        }
        if (gtype == "" || gtype == null){         
          gtype = 'all';
        }
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //   $scope.search_renew = 'v2/generics/search-renew-dash';
        $scope.search_renew = 'search-renew-dash';
        if (cadena) {
          dataFactory.get($scope.search_renew, {cadena: cadena, tipo: gtype})
          .then(function success(response) {
            main.policies = response.data.results;
            main.config_renovaciones = {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            }
            main.show_paginationRenewals = true;
            main.show_renovaciones_pagination = true;
            
          })
        }else{
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   var x_renewal = 'v2/polizas/graficas-renovaciones/';
          var x_renewal = 'graficas-renovaciones/';
          main.policies  = []
          main.config_renovaciones  = []
          dataFactory.get(x_renewal, {cadena: cadena, tipo: gtype, order : 1,
              asc : 1})
          .then(function success(response) {
            main.policies = response.data.results;
            main.config_renovaciones = {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            }
            main.show_paginationRenewals = true;
            main.show_renovaciones_pagination = true;
            
          })
        }
      }

      function searchSinisters(cadena, gtype) {
        main.sinisters = []
        main.search = true;
        main.show_sinisters_pagination = false;
        main.config_sinisters = []
        if (gtype == "" || gtype == null){         
          gtype = 0;
        }

        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //   $scope.search_sinister = 'v2/generics/search-sinister-dash';
        $scope.search_sinister = 'search-sinister-dash';
        if (cadena) {
          dataFactory.get($scope.search_sinister, {cadena: cadena, tipo: gtype})
          .then(function success(response) {
            main.sinisters = response.data.results;
            if(main.show_sinisters_pagination == false){
              main.config_sinisters = {
                            count: response.data.count,
                            next: response.data.next,
                            previous: response.data.previous
                          };
              main.show_sinisters_pagination = true;
            }
          })
        }else{
          if (parseInt(gtype) == 1){
            gtype = 'green';
          }
          else if (parseInt(gtype) == 2){
            gtype= 'yellow'
          }else if (parseInt(gtype) == 3){
            gtype = 'orange'
          }else if (parseInt(gtype) == 4) {
            gtype = 'red'
          }
          else{
            gtype = 'all'
          }
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   $scope.chart_siniester = 'v2/siniestros/graficas-siniestros/';
          $scope.chart_siniester = 'graficas-siniestros/';
          $http({
            method: 'GET',
            url: url.IP + $scope.chart_siniester,
            params: {tipo: gtype, order:1, asc: 1}
          })
          .then(
            function success (response) {
              main.sinisters = response.data.results;
            if(main.show_sinisters_pagination == false){
              main.config_sinisters = {
                            count: response.data.count,
                            next: response.data.next,
                            previous: response.data.previous
                          };
              main.show_sinisters_pagination = true;
            }
          })
        }
      }
      function excel_search(cadena,gtype){          
          if (gtype == "" || gtype == null){         
            gtype = 0;
          }
          if (main.cadena) {
            var params = {
                  order : 1,
                  asc : 1,
                  tipo : gtype,
                  cadena: main.cadena,
                }
          }else{
            var params = {
                  order : 1,
                  asc : 1,
                  tipo : gtype,
                }
          }
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   // var excel_sinister = 'v2/siniestros/excel-graficas-sinister/';
          //   var excel_sinister = 'service_reporte-v2-siniestrosDash-excel';
          var excel_sinister = 'service_reporte-siniestrosDash-excel';
          $http({
              method: 'GET',
              url: url.IP + excel_sinister,
              params: params,
              headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
              responseType: "arraybuffer"
            })
            .then(
              function success(data) {
                if(data.status == 200){
                  var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                  saveAs(blob, 'Reporte_Siniestros_Dash.xls');
                } else {
                  SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
                }
          });
          // dataFactory.get('excel-graficas-sinister-search', {cadena: cadena, tipo: gtype})
          // .then(function success(response) {
          //   main.sinisters = response.data.results;
          //   if(response.status === 200 || response.status === 201) {
          //         exportFactory.excel(response.data, 'Siniestros');
                                          
          //     }
          // })
        // }
      }

      $scope.checkStatusNotes = function(parStatusNote) {
        switch(parStatusNote) {
          case 1:
            return 'Pendiente'
            break;
          case 2:
            return 'Aplicada'
            break;
          case 2:
            return 'Liquidada'
            break;
        }
      }

      $scope.configGraph = function(typeGraph) {
        var modalInstance = $uibModal.open({
          templateUrl: 'app/charts/config.chart.html',
          controller: 'ConfigChartModalCtrl',
          size: 'md',
          resolve: {
            typeGraphic: function() {
              return typeGraph;
            }
          },
        backdrop: 'static', /* this prevent user interaction with the background */ 
        keyboard: false
        });
      }


    $scope.status = function (parValue) {
       if (typeof parValue === 'string') {
        return parValue;
      }
      switch (parValue) {
        case 1:
          return 'En trámite';
          break;
        case 2:
          return 'OT Cancelada';
          break;
        case 4:
          return 'Precancelada';
          break;
        case 10:
          return 'Por iniciar';
          break;
        case 11:
          return 'Cancelada';
          break;
        case 12:
          return 'Renovada';
          break;
        case 13:
          return 'Vencida';
          break;
        case 14:
          return 'Vigente';
          break;
        case 15:
          return 'No renovada';
          break;
        case 15:
          return 'No renovada';
          break;
        case 17:
          return 'Anulada';
          break;
        case 24:
          return 'Pre-Anulada';
          break;
        default:
          return 'Pendiente *';
      }
    }

    $scope.statusRecibo = function (parValue) {
      switch (parValue) {
        case 1:
          return 'Pagado';
          break;
        case 2:
          return 'Cancelado';
          break;
          case 3:
            return 'Prorrogado';
            break;
        case 4:
          return 'Pendiente de Pago';
          break;
          case 9:
            return 'Pago Parcial';
            break;
        default:
          return parValue;
      }
    }
    $scope.rectype = function (parValue) {
      if (parValue.receipt_type) {
        if (parValue.fianza) {
          return 'Fianza'
        }else{
          switch (parValue.receipt_type) {
            case 1:
              if (parValue.poliza) {
                if (parValue.poliza.document_type == 3) {
                  return 'Póliza de Grupo';
                }else if (parValue.poliza.document_type == 1){
                  return 'Póliza'
                }else if (parValue.poliza.document_type == 4){
                  return 'Subgrupo'
                }else if (parValue.poliza.document_type == 7){
                  return 'Fianza'
                }else if (parValue.poliza.document_type == 8){
                  return 'Fianza Colectiva'
                }else if (parValue.poliza.document_type == 11){
                  return 'Colectividad'
                }else if (parValue.poliza.document_type == 12){
                  return 'Póliza de Colectividad'
                }
              }else if (parValue.fianza) {
                return 'Fianza'
              }
              break;
            case 2:
              return 'Endoso';
              break;
            case 3:
              return 'Nota de Crédito/Endoso';
              break;

            default:
              return 'Póliza';
          }
        }
      }
        if(parValue.poliza){
            switch (parValue.poliza.document_type) {
            case 1:
              if(parValue.receipt_type == 1){
                return 'Póliza';
              }
              else{
                return 'Endoso';
              }
              break;
            case 2:
              return 'Endoso';
              break;
            case 3:
              return 'Póliza de Grupo';
              break;
            case 4:
              return 'Subgrupo';
              break;
            case 7:
              return 'Colectividad';
              break;
            case 11:
              return 'Colectividad';
              break;
            case 12:
              return 'Póliza de Colectividad';
              break;
            default:
              return 'Póliza';
          }
        }
        else if (parValue.fianza){
          return 'Fianza'
        }

    }


    $scope.statusSinister = function (parValue) {
      switch (parValue) {
        case 1:
          return 'Pendiente';
          break;
        case 2:
          return 'En trámite';
          break;
        case 3:
          return 'Completado';
          break;
        case 4:
          return 'Cancelado';
          break;
        case 5:
          return 'Rechazado';
          break;
        case 6:
          return 'En Espera';
          break;
      }
    }
    $scope.tipoPagoSinister = function (parValue) {
      switch (parValue) {
        case 1:
          return 'Reembolso';
          break;
        case 2:
          return 'Programación';
          break;
        case 3:
          return 'Pago directo';
          break;
        case 4:
          return 'Aclaración';
          break;
        default:
          return 'No aplica';
          break;
      }
    }

    var DEFAULT_CAROUSEL = [{
      'imagen': '../../assets/images/inicio/1-banner_ok.png'
    }];
    var CAROUSEL_ORG_RETRY_DELAY = 1500;
    var MAX_CAROUSEL_ORG_RETRY_ATTEMPTS = 5;
    var carouselOrgRetryTimer = null;
    var carouselOrgRetryAttempts = 0;

    if ($sessionStorage.token !== undefined) {
      getCarousel();
    }
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
        main.userLogin,
        $scope.infoUser,
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
          console.log('getCarousel main.controller.js: detected org "%s" after invalid response. Retrying load.', orgCandidate);
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
            console.log('getCarousel main.controller.js: fallback to default banner due to invalid org parameter.');
            $scope.carousel = angular.copy(DEFAULT_CAROUSEL);
            var storedOrgCandidate = readStoredOrgUrlname();
            if (storedOrgCandidate) {
              console.log('getCarousel main.controller.js: stored org "%s" found after fallback. Retrying immediately.', storedOrgCandidate);
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
    // function getCarousel() {
    //   dataFactory.get('get-carousel-from-cas/').then(function success(response) {              
    //     $scope.carousel = response.data.data;
    //     if($scope.carousel && $scope.carousel.length ==0){
    //       $scope.carousel=[{
    //         'imagen':'../../assets/images/inicio/1-banner_ok.png'
    //       }];
    //     }
    //     })
    //   .catch(function (e) {
    //     $scope.carousel=[{
    //       'imagen':'../../assets/images/inicio/1-banner_ok.png'
    //     }];
    //   });       
    // }
    function getBirthdays() {
      if(!$localStorage.persons){
        if ($scope.infoUser) {
          if(!$scope.infoUser.staff){
            dataFactory.get('get-birthdays/').then(function success(response) {
              main.contractors = response.data.contractors;
              main.titulares = response.data.titulares;
              main.beneficiaries = response.data.beneficiaries;
              main.relationship = response.data.relationship;
              
              $localStorage.persons = response.data;
              main.persons_length = 
              (main.contractors && main.contractors.length ? main.contractors.length : 0) +
              (main.titulares && main.titulares.length ? main.titulares.length : 0) +
              (main.beneficiaries && main.beneficiaries.length ? main.beneficiaries.length : 0) +
              (main.relationship && main.relationship.length ? main.relationship.length : 0);

              $localStorage.viewed = false;
            })
          }
          else{
            main.persons = [];
            main.contractors = [];
            main.titulares = [];
            main.beneficiaries = [];
            main.relationship = [];
          }
        }else{
          main.persons = [];
          main.contractors = [];
          main.titulares = [];
          main.beneficiaries = [];
          main.relationship = [];
        }
      } else {
        if(!$scope.infoUser.staff){
          dataFactory.get('get-birthdays/').then(function success(response) {
            main.contractors = response.data.contractors;
            main.titulares = response.data.titulares;
            main.beneficiaries = response.data.beneficiaries;
            main.relationship = response.data.relationship;
            
            $localStorage.persons = response.data;
            main.persons_length = 
            (main.contractors && main.contractors.length ? main.contractors.length : 0) +
            (main.titulares && main.titulares.length ? main.titulares.length : 0) +
            (main.beneficiaries && main.beneficiaries.length ? main.beneficiaries.length : 0) +
            (main.relationship && main.relationship.length ? main.relationship.length : 0);

            main.viewed = $localStorage.viewed;
          })
        }
        else{
          main.persons = [];
          main.contractors = [];
          main.titulares = [];
          main.beneficiaries = [];
          main.relationship = [];
        }
      }


      $scope.personas = [];
      if(main.persons) {
        $scope.persona = main.persons[0];
        for(var i = 0; i < main.persons.length; i++){
          if($scope.check(main.persons[i].person, $scope.personas)){
          }
          else{
            $scope.personas.push(main.persons[i]);
          }
        }
        main.persons = $scope.personas;
      } else {
        main.persons = []; 
      }
    }

    $scope.check = function(persona, array){
      for(var l = 0; l < array.length; l++){
        if(array[l].person == persona){
          return true;
        }
      }
      return false;
    };

    $scope.open_in_same_tab_natural = function(name, route, params, identifier){
      if (name && route){
        $scope.route_for_new_tab = route;
        $scope.name_for_new_tab = name;
      }

      var active_tab = appStates.states.findIndex(function(item){
        if (item.active){
          return true
        }
        return false;
      });
      appStates.states[active_tab] = {
        id: identifier,
        name: $scope.name_for_new_tab, 
        heading: $scope.name_for_new_tab, 
        route: $scope.route_for_new_tab, 
        active: true, 
        isVisible: true, 
        href: $state.href($scope.route_for_new_tab)
      }
      $localStorage.tab_states = appStates.states;
      $localStorage.tab_index = $localStorage.tab_states.length -1;
      $state.go($scope.route_for_new_tab, params);
    }

    function goToPolicy(polizaObj) { 
      if(polizaObj.id){
        var poliza = polizaObj.id; 
      } else {
        var poliza = polizaObj;
      }
      if(polizaObj.document_type == 3){
        $scope.open_in_same_tab_natural('Colectividades', 'colectividades.info', {polizaId: poliza}, poliza);
        // $state.go('colectividades.info', {polizaId: poliza});
      } else if(polizaObj.document_type == 1){
        $scope.open_in_same_tab_natural('Pólizas', 'polizas.info', {polizaId: poliza}, poliza);
        // $state.go('polizas.info', {polizaId: poliza});
      }else if(polizaObj.document_type == 6){
        $scope.open_in_same_tab_natural('Colectividades', 'colectividades.info', {polizaId: polizaObj.caratula}, polizaObj.caratula);
        // $state.go('colectividades.info', {polizaId: polizaObj.caratula})
      }else if (polizaObj.document_type == 7) {
        $scope.open_in_same_tab_natural('Fianzas', 'fianzas.info', {polizaId: polizaObj.id}, polizaObj.id);
        // $state.go('fianzas.info', {polizaId: polizaObj.id})
      }else if (polizaObj.document_type == 8) {
        $scope.open_in_same_tab_natural('Fianzas', 'fianzas.details', {polizaId: polizaObj.id}, polizaObj.id);
        // $state.go('fianzas.details',{polizaId: polizaObj.id})
      }else if (polizaObj.document_type == 11) {
        $scope.open_in_same_tab_natural('Flotillas', 'flotillas.info', {polizaId: parseInt(polizaObj.id)}, polizaObj.id);
        // $state.go('flotillas.info',{polizaId: parseInt(polizaObj.id)})
      }else if (polizaObj.document_type == 12) {
        $scope.open_in_same_tab_natural('Flotillas', 'flotillas.info', {polizaId: parseInt(polizaObj.caratula)}, polizaObj.caratula);
        // $state.go('flotillas.info',{polizaId: parseInt(polizaObj.caratula)})
      }
    }

    function changeViewed(param) {
      if(param == 1){
        if(!$localStorage.viewed){
          main.viewed = true;
          $localStorage.viewed = true;
        }
      } else {
        if(!$localStorage.viewed_changes){
          main.viewed_changes = true;
          $localStorage.viewed_changes = true;
        }
      }
    }

    $scope.checkPerson = function(type) {
      switch(type){
        case 1:
          return "Contratante"
          break;
        case 2:
          return "Beneficiario"
          break;
        case 3:
          return "Dependiente"
          break;
        case 4:
          return "Titular Asegurado"
          break;
      }
    }


    function NotasModal(receipt) {
      main.insurance_ = receipt;
        var modalInstance = $uibModal.open({ //jshint ignore:line
          templateUrl: 'app/cobranzas/notaCredito.modal.html',
          controller: 'NotaCreditoCtrl',
          size: 'lg',
          resolve: {
            receipt: function() {
              return receipt;
            },
            insurance: function() {
              return main.insurance_;
            },
            from: function(){
              return null;
            }
          },
        backdrop: 'static', /* this prevent user interaction with the background */ 
        keyboard: false
        });
        modalInstance.result.then(function(receipt) {
          vm.receipts.splice(index, 1);
          activate();
        });
  }

  function saveFCMToken(token){
  
  }

  // function massiveReceipts(receipt) {
  //   main.recibos_a_pagar.push(receipt);
  // }
  $scope.massiveReceipts = function(receipt,v){

    if (v) {
      receipt.toPay = v;
       main.recibos_a_pagar.push(receipt);
    }else{
      main.recibos_a_pagar.forEach(function(d){
      if (!v) {
        if (d.id == receipt.id) {
          receipt.toPay = v;
           main.recibos_a_pagar.splice(receipt,1);
        }
      }
     })
    }
  }
  $scope.toDateMain = function (dateStr) {
    var dateString = dateStr; // Oct 23
    var dateParts = dateString.split("/");
    var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based
    return dateObject;
  }
  
  function pagarRecibos(container,option) {
    var data = {
      status: 1,
      user_pay: $scope.user_pay ? $scope.user_pay.url : null,
      pay_date: new Date(),
    }
    if (option == 1) {
      $scope.folio_pago = main.recibos_a_pagar[0].id;
      // SweetAlert.swal({
      //   title: "Pagar recibo(s)",
      //   text: '¿Está seguro de pagar los recibo(s) seleccionado(s)?',
      //   type: "warning",
      //   confirmButtonText: "Si",
      //   cancelButtonText: "No",
      //   showCancelButton: true,
      //   closeOnConfirm: false,
      //   showLoaderOnConfirm: true,
      //   allowOutsideClick: true
      // },
      // function(isConfirm) {
      //   if(isConfirm) {
      //     main.recibos_a_pagar.forEach(function(receipt) {
      //       container.splice(container.indexOf(receipt), 1);
      //       $http.patch(receipt.url, data);
      //     })

      //    swal("Pagados", "Se han pagado " + main.recibos_a_pagar.length +" recibos satisfactoriamente", "success");
      //    main.recibos_a_pagar = [];
      //    if ($location.$$path == "/index/main") {
      //       $http({
      //         method: 'GET',
      //         url: url.IP + 'chart-recibos/'}).then(function(recibos) {
      //           $localStorage.receipt_count = recibos.data
      //           $state.go('index.main')
      //           $state.reload();
      //       });
      //     }
      //    var elements = document.getElementsByTagName("input");
      //    for (var i = 0;  i< elements.length; i++) {
      //        if (elements[i].type === "checkbox")
      //            elements[i].checked = false;
      //    }

      //   } else {
      //   }
      // }); 
      var data_alert = {
        title: "Pagar recibos seleccionados: "+ main.recibos_a_pagar.length,
        text: "Escriba la fecha de Pago: *(DD/MM/AAAA)",
        type: "input",
        confirmButtonText: "Pagar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true,
        inputPlaceholder: "DD/MM/AAAA"
      }

    SweetAlert.swal(data_alert,            
      function (inputValue) {
        // console.log('inputValue',inputValue,inputValue ? inputValue.length : 0)
        if (inputValue === false) return false;
        if(inputValue && (inputValue.length <10 || inputValue.length >10)){
          toaster.error("Fecha de Pago incorrecta,escriba la Fecha de Pago en formato correcto (DD/MM/AAAA)");
          return false            
        }
        if (inputValue === "") {
          swal("Escriba la Fecha de Pago en formato correcto (DD/MM/AAAA)");
          return false
        }else{
          $scope.pay_date = $scope.toDateMain(inputValue);
          $scope.pay_date_view = $scope.convertDateMain($scope.pay_date);
          if ($scope.pay_date != 'Invalid Date' && $scope.pay_date != null && $scope.pay_date != 'NaN/NaN/NaN') {
            main.recibos_a_pagar.forEach(function(receipt,index){
            $http({
              // method: 'GET',
              // url: url.IP + 'get-cobranza/',
              // params: $scope.filtros
              method: 'PATCH',
              url: receipt.url,
              data: {
                folio_pago: $scope.folio_pago,
                pay_date: $scope.pay_date ? $scope.pay_date : new Date(),
                status: 1,
                user_pay: $scope.user_pay ? $scope.user_pay.url : null
              }
            }).then(function(response) {
                container.splice(container.indexOf(receipt), 1);
                swal("Pagado, folio: "+response.data.folio_pago,"La selección ha sido pagada, fecha de pago: "+$scope.pay_date_view , "success"); 
              })
              main.recibos_a_pagar = [];
              if ($location.$$path == "/index/main") {
                $http({
                  method: 'GET',
                  url: url.IP + 'chart-recibos/'}).then(function(recibos) {
                    $localStorage.receipt_count = recibos.data
                    $state.go('index.main')
                    $state.reload();
                });
              }
              var elements = document.getElementsByTagName("input");
              for (var i = 0;  i< elements.length; i++) {
                   if (elements[i].type === "checkbox")
                       elements[i].checked = false;
              }
            }) 
          }else{
            main.recibos_a_pagar = [];
            toaster.error("Fecha de Pago incorrecta,escriba la Fecha de Pago en formato correcto (DD/MM/AAAA)");                                
          }
        }   
      })       
    }else if (option == 2) {
    $scope.folio_pago = container[0].id;
      var data_alert = {
        title: "Pagar recibos de la página actual, total recibos a pagar: " + container.length,
        text: "Escriba la fecha de Pago: *(DD/MM/AAAA)",
        type: "input",
        confirmButtonText: "Pagar",
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        showConfirmButton: true,
        inputPlaceholder: "DD/MM/AAAA"
      }

      SweetAlert.swal(data_alert,            
        function (inputValue) {
          if(inputValue && (inputValue.length <10 || inputValue.length >10)){
            toaster.error("Fecha de Pago incorrecta,escriba la Fecha de Pago en formato correcto (DD/MM/AAAA)");  
            return false            
          }
          if (inputValue === false) return false;
          if (inputValue === "") {
            swal("Escriba la Fecha de Pago en formato correcto (DD/MM/AAAA)");
            return false
          }else{
            $scope.pay_date = $scope.toDateMain(inputValue);
            $scope.pay_date_view = $scope.convertDateMain($scope.pay_date);
            if ($scope.pay_date != 'Invalid Date' && $scope.pay_date != null && $scope.pay_date != 'NaN/NaN/NaN') {
              container.forEach(function(receipt,index){
              $http({
                // method: 'GET',
                // url: url.IP + 'get-cobranza/',
                // params: $scope.filtros
                method: 'PATCH',
                url: receipt.url,
                data: {
                  folio_pago: $scope.folio_pago,
                  pay_date: $scope.pay_date ? $scope.pay_date : new Date(),
                  status: 1,
                  user_pay: $scope.user_pay ? $scope.user_pay.url : null
                }
              }).then(function(response) {
                  swal("Pagado, folio: "+response.data.folio_pago,"La selección ha sido pagada, fecha de pago: "+$scope.pay_date_view , "success"); 
                })
                if ($location.$$path == "/index/main") {
                  $http({
                    method: 'GET',
                    url: url.IP + 'chart-recibos/'}).then(function(recibos) {
                      $localStorage.receipt_count = recibos.data
                      $state.go('index.main')
                      $state.reload();
                  });
                }
                var elements = document.getElementsByTagName("input");
                for (var i = 0;  i< elements.length; i++) {
                     if (elements[i].type === "checkbox")
                         elements[i].checked = false;
                }
              }) 
            }else{
              toaster.error("Fecha de Pago incorrecta,escriba la Fecha de Pago en formato correcto (DD/MM/AAAA)");                                
            }
          }   
      }) 
      // SweetAlert.swal({
      //   title: "Pagar recibo(s)",
      //   text: '¿Está seguro de pagar los recibo(s) seleccionado(s)?',
      //   type: "warning",
      //   confirmButtonText: "Si",
      //   cancelButtonText: "No",
      //   showCancelButton: true,
      //   closeOnConfirm: false,
      //   showLoaderOnConfirm: true,
      //   allowOutsideClick: true
      // },
      // function(isConfirm) {
      //   if(isConfirm) {                
      //     toaster.warning("El pago se hará sobre los recibos en la página disponible");
      //     container.forEach(function(receipt) {
      //       // container.splice(container.indexOf(receipt), 1);
      //       $http.patch(receipt.url, data);
      //     })

      //     swal("Pagados", "Se han pagado " +container.length +" recibos satisfactoriamente", "success");
      //     if ($location.$$path == "/index/main") {
      //       $http({
      //         method: 'GET',
      //         url: url.IP + 'chart-recibos/'}).then(function(recibos) {
      //           $localStorage.receipt_count = recibos.data
      //           $state.go('index.main')
      //           $state.reload();
      //       });
      //     }
      //   } else {
      //   }
      // });  
    }
  }


  function adminReminder(container) {
    $http.post(url.IP+'admin-email-reminder/')
      .then(
        function success(request) {
          if(request.status === 200 || request.status === 201) {
            swal("Enviado","El recordatorio ha sido enviado", "success");
          } else {
            swal("Error", "No se envió el recordatorio. Contacte a su administrador.", "error");
          }
        },
        function error(error) {
          console.log('error - email', error);
        }
      )
      .catch(function(e) {
        console.log('error - catch', e);
      });
      }

      // bitacotra endoso


      function showBinnacle_endoso(param) {
      $http({
        method: 'GET',
        url: url.IP+'comments/',
        params: {
          'model': 10,
        'id_model': param.id
        }
      })
      .then(function(request) {
 
        main.comments_data_endoso = request.data.results;
        main.comments_config_receipt = {
          count: request.data.count,
          previous: request.data.previous,
          next: request.data.next
        }
      })
      .catch(function(e) {
        console.log('e', e);
      });

      main.endosoId = param.id;
      main.show_binnacle_endoso = true;

    };
    function returnToEndoso() {
      main.show_binnacle_endoso = false;
    }
      // bitacora endoso***

      
      function viewCarta(poliza, carta, recibo) {
        $http({
          method: 'GET',
          url: url.IP + 'get-pdf-form/',
          params: {
            'id_poliza': poliza,
            'id_carta': carta,
            'id_recibo': recibo
          }
        }).then(function success(response) {
          var file = new Blob([response.data], {type: 'application/pdf'});
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(file);
          }
          else{               
            var fileURL = URL.createObjectURL(file);
            $scope.content = $sce.trustAsResourceUrl(fileURL);
            window.open($scope.content);
          }
          // $scope.pdf = response.data;
          // $http({
          //   method: 'GET',
          //   url: url.IP + 'get-pdf',
          //   params: {
          //     'pdf_name': $scope.pdf.pdf_name
          //   },
          //   responseType: 'arraybuffer'

          // }).then(function success(response) {
              
          //   })
        })
      }

      function returnToReceipts(param,m,t,tId) {
        if(param == 2) {
          main.show_binnacle_receipt = false;
          if(tId == 1){
            var parType = 'green'
          }else if(tId == 2){
            var parType = 'yellow';
          }else if(tId == 3){
            var parType = 'orange';
          }else if(tId == 4){
            var parType = 'red';
          }
          main.receipts =[];
          // if($scope.infoUser.staff && !$scope.infoUser.superuser){
          //   var return_chart = 'v2/recibos/graficas-recibos/';
          var return_chart = 'graficas-recibos/';
          $http({
            method: 'GET',
            url: url.IP + return_chart,
            params:{
              tipo: parType,
              order: 1,
              asc: 1
            }
          })
          .then(
            function success(data) {
              if(data.status == 200){
                main.receipts = data.data.results;
                if (data) {
                  if (data.data) {
                    if (data.data.results) {
                      data.data.results.forEach(function(rec) {                 
                        main.recibos_a_pagar.forEach(function(rec_w) {     
                          if(rec.id == rec_w.id){
                            if (rec) {
                              rec.toPay =true;
                            }else{                 
                              
                            }
                          }
                        })
                      })
                    }
                  }
                }
                for (var i = 0; i < main.receipts.length; i++) {
                  // main.receipts[i].receipt_type = main.receipts[i].receipt_type == 1 ? "Póliza" : "Endoso";
                  if (main.receipts[i].poliza){
                    main.receipts[i].poliza.status = main.receipts[i].poliza.status == 1 ? "En trámite" : 
                    main.receipts[i].poliza.status == 2 ? "OT Cancelada" : main.receipts[i].poliza.status == 10 ? "Por Iniciar" : 
                    main.receipts[i].poliza.status == 11 ? "Cancelada" : main.receipts[i].poliza.status == 12 ? "Renovada" : 
                    main.receipts[i].poliza.status == 13 ? "Vencida" : main.receipts[i].poliza.status == 14 ? "Vigente" : "Vigente";
                  }else if (main.receipts[i].fianza) {
                    main.receipts[i].fianza.status = main.receipts[i].fianza.status == 1 ? "En trámite" : 
                    main.receipts[i].fianza.status == 2 ? "OT Cancelada" : main.receipts[i].fianza.status == 10 ? "Por Iniciar" : 
                    main.receipts[i].fianza.status == 11 ? "Cancelada" : main.receipts[i].fianza.status == 12 ? "Anulada" : 
                    main.receipts[i].fianza.status == 13 ? "Rechazada" : main.receipts[i].fianza.status == 15 ? "Renovada" : "Vigente";
                  }

                  if(main.receipts[i].status == 1){
                    main.receipts[i].status = "Pagado"
                  }else if (main.receipts[i].status == 2){
                    main.receipts[i].status = "Cancelado"
                  } else if (main.receipts[i].status == 3 ){
                    main.receipts[i].status = "Prorrogado"
                  }else if (main.receipts[i].status == 4){
                    main.receipts[i].status = "Pendiente de pago"
                  } else if (main.receipts[i].status == 5) {
                    main.receipts[i].status = "Liquidado"
                  }else if (main.receipts[i].status == 6){
                    main.receipts[i].status = "Conciliado"
                  }else if (main.receipts[i].status == 7){
                    main.receipts[i].status = "Cerrado"
                  } else if (main.receipts[i].status == 0 ){
                    main.receipts[i].status = "Desactivado"
                  } else if (main.receipts[i].status == 9) {
                    main.receipts[i].status = "Pago Parcial"
                  }else{
                    main.receipts[i].status = "Sin estatus"
                  } 

                  if (main.receipts[i].poliza) {
                    if(main.receipts[i].poliza.forma_de_pago == 1){
                      main.receipts[i].poliza.forma_de_pago = "Mensual"
                    }else if (main.receipts[i].poliza.forma_de_pago == 2){
                      main.receipts[i].poliza.forma_de_pago = "Bimestral"
                    } else if (main.receipts[i].poliza.forma_de_pago == 3 ){
                      main.receipts[i].poliza.forma_de_pago = "Trimestral"
                    }else if (main.receipts[i].poliza.forma_de_pago == 5){
                      main.receipts[i].poliza.forma_de_pago = "Contado"
                    } else if (main.receipts[i].poliza.forma_de_pago == 6) {
                      main.receipts[i].poliza.forma_de_pago = "Semestral"
                    }else if (main.receipts[i].poliza.forma_de_pago == 12){
                      main.receipts[i].poliza.forma_de_pago = "Anual"
                    }else{
                      main.receipts[i].poliza.forma_de_pago = "Sin estatus"
                    }
                  }
                }
                main.config_receipts = {
                  count: data.data.count,
                  next: data.data.next,
                  previous: data.data.previous
                };
              }
          });

        } else  if(param == 3) {
          main.show_binnacle_renewal = false;
        } else {
          main.show_binnacle = false;
        }
        // if ($location.$$path == "/index/main") {
        //     $http({
        //       method: 'GET',
        //       url: url.IP + 'chart-recibos/'}).then(function(ren) {
        //         // $state.go('index.main')
        //         $state.reload();
        //     });
        // }
      }


      function showBinnacle(param, parType) {
        $scope.receiptmodel = param.url;
        main.receiptmodel = param.url;
        main.receipt = param;

        if(parType == 'recibo' || parType == 'recibo_modal') {
          var id_model = 4;
        } else if(parType == 'renovacion') {
          var id_model = 6;
        } else {
          var id_model = 1;
        }

        $http({
          method: 'GET',
          url: url.IP+'comments/',
          params: {
            'model': id_model,
            'id_model': param.id
          }
        })
        .then(function(request) {
          if(id_model == 1) {
            main.comments_data = request.data.results;
            main.comments_config = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            }
          } else if (id_model == 4) {
            main.comments_data_receipt = request.data.results;
            main.comments_config_receipt = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            }
          } else if(id_model == 6) {
            main.comments_data_renewal = request.data.results;
            main.comments_config_renewal = {
              count: request.data.count,
              previous: request.data.previous,
              next: request.data.next
            }
          }

        })
        .catch(function(e) {
          console.log('e', e);
        });

        if(id_model == 1) {
          main.policy_id = param.id;
          main.show_binnacle = true;
        } else if (id_model == 4) {

          main.receipt_id   = param.id;
          main.receipt_url  = param.url;

          if(parType !== 'recibo_modal') {
            main.show_binnacle_receipt = true;
          }

        } else  if(id_model == 6) {
          main.renewal_id = param.id;
          main.show_binnacle_renewal = true;
        }


      };

      function showPhone(receipt) {
        var phones_string = '';
        var phones = [{'desc':'Principal', 'value':receipt.contratante.phone}];
        if (receipt.contratante.a_phones) {
          receipt.contratante.a_phones.forEach(function(a_phone){
            if (a_phone.phone_type == 1) {
              $scope.phone_type = 'Casa'
            }else if (a_phone.phone_type == 2) {
              $scope.phone_type = 'Oficina'
            }else if (a_phone.phone_type == 3) {
              $scope.phone_type = 'Móvil'
            }else{
              $scope.phone_type = 'Otro'
            }
            phones.push({'desc':$scope.phone_type, 'value':a_phone.phone})
            // phones_array.push('\n')
          });
        }
        phones.forEach(function(ph){
          if(!phones_string){
            phones_string = format_phone(ph.desc, ph.value);
          }else{
            phones_string += ('\n'+format_phone(ph.desc, ph.value));
          }
        });

        SweetAlert.swal({
          title: "Teléfono",
          text: phones_string,
          type: "info",
          showCancelButton: true,
          confirmButtonColor: "##87CEFA",
          confirmButtonText: "Se hizo llamada",
          cancelButtonText: "Cancelar",
          closeOnConfirm: false
        },
        function(isConfirm){
          if(isConfirm){
            var obj = {
              'track_phone': true
            }
            $http.patch(receipt.url, obj);
            swal.close();
          }
        });
      }

      function format_phone(desc, ph){
        var number = String(ph);
        var formattedNumber = number;
        if(number[0] == '1'){
          var c = (number[0] == '1') ? '1 ' : '';
          number = number[0] == '1' ? number.slice(1) : number;
        } else if(number[0] == '0' && number[1] == '1'){
          var c = (number[0] == '0' && number[1] == '1') ? '01 ' : '';
          number = (number[0] == '0' && number[1] == '1') ? number.slice(2) : number;
        } else
        var c = '';
        var area;
        var front;
        if(number.substring(0,2) == 55 || number.substring(0,2) == 33 || number.substring(0,2) == 81){
          area = number.substring(0,2);
          front = number.substring(2, 6);
        }
        else{
          area = number.substring(0,3);
          front = number.substring(3, 6);
        }
        var end = number.substring(6, 10);
        var ext = number.substring(10, 15);
        if (front) {
          formattedNumber = (c + "(" + area + ") " + front);
        }
        if (end) {
          formattedNumber += ("-" + end);
        }
        if(ext) {
          formattedNumber += (" ext. " + ext);
        }
        return (desc+": "+formattedNumber);

      }

  $scope.addEmailsConfirm = function(valueReceipt,par, rec){
    var id_poliza = rec.poliza ? rec.poliza.id : 0;
    var id_fianza = rec.fianza ? rec.fianza.id : 0;
    if (rec ){
      dataFactory.get('v1/notasCredito-info', {'status': 4, 'id_poliza': id_poliza,'id_fianza': id_fianza})
      . then(function success(nota) {
        if(nota.status === 200 || nota.status === 201) {
          $scope.notasCredito = nota.data;
          $scope.notasCredito.forEach(function(it){
            it.sendNote = false;
          })
        }
      })
      .catch(function (e) {
        console.log('e', e);
      });      
    }

    var modalInstance = $uibModal.open({ //jshint ignore:line
      templateUrl: 'app/cobranzas/add.emails.reminder_pay.html',
      controller: 'CobranzasCtrl',
      size: 'lg',
      controllerAs: 'vm',
      resolve: {
        valueReceipt: function() {
          return valueReceipt;
        },
        notasPolicy: function() {
          return $scope.notasCredito;
        },
      },
      backdrop: 'static', /* this prevent user interaction with the background */ 
      keyboard: false 
    });
    modalInstance.result.then(function(receipt) {
      $state.go('index.main'); 
    });
  }
  $scope.addPhoneWhatsapp = function(valueReceipt,par, rec){
    // insurance.contratante = contra;
    var modalInstance = $uibModal.open({ //jshint ignore:line
      templateUrl: 'app/cobranzas/add.phone.whatsappsms_reminderpay.html',
      controller: 'CobranzasCtrl',
      controllerAs: 'vm',
      size: 'lg',
      resolve: {
        insurance: function() {
          return par;
        },
        valueReceipt: function() {
          return valueReceipt;
        }
      },
        backdrop: 'static', /* this prevent user interaction with the background */
        keyboard: false
    });
    modalInstance.result.then(function(receipt) {
      $state.go('index.main'); 
    });
  };
  
  function emailsReminderAdd(receipt) {
    $scope.form ={};
    $scope.form.emails_reminder = [];
     var mail = {
      email: ''
    };
    if (receipt.contratante) {
      var cmail = {
        email: receipt.contratante.email
      };
    }
    if (receipt.contratante){
      $scope.form.emails_reminder.push(cmail);  
    }else{
      $scope.form.emails_reminder.push(mail);  
    }
    $scope.receipt_pay = receipt;
    $uibModal.receipt = receipt;
      var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/cobranzas/add.emails.reminder_pay.html',
        controller: 'CobranzasCtrl',
        size: 'lg',
        resolve: {
          receipt: function() {
            return receipt;
          },
          from: function(){
            return null;
          }
        },
      backdrop: 'static', /* this prevent user interaction with the background */ 
      keyboard: false
      });
      modalInstance.result.then(function(receipt) {
      });
  }
  $scope.addEmails = function (type) {
    var mail = {
      email: ''
    };
    $scope.form.emails_reminder.push(mail);     
  }

  $scope.deleteEmails = function (mail, type) {
    $scope.form.emails_reminder.splice(mail, 1);
  }

  $scope.cancel = function() {
    try{
      if ($uibModalInstance) {
        $uibModalInstance.dismiss('cancel');
      }
    }catch(e){
      activate();
      console.log('e',e)

    }
  };
  $scope.sendReminder = function(mails) {
    var arrayEmails = [];
    $scope.receipt_pay = $uibModal.receipt;
    if (mails) {
      mails.forEach(function(it){
        arrayEmails.push(it.email)
      })
    }
    if($scope.receipt_pay.contratante){
      arrayEmails.push($scope.receipt_pay.contratante.email)
    }
    if(arrayEmails.length == 0){
      SweetAlert.swal("Error", "Agregue correos", "error");
      return;
    }else{
      if ($uibModalInstance) {
        $uibModalInstance.dismiss('cancel');
      }

    }
    
    if (arrayEmails) {
      SweetAlert.swal("Error", "Agregue correos__", "error");
      var data_alert = {
        title: "Correo",
        // text: arrayEmails,
        text: (arrayEmails.join("\n")),
        type: "info",
        confirmButtonText: "Confirmar envio",
        cancelButtonText: "Salir",
        showCancelButton: true,
        closeOnConfirm: true,
        showLoaderOnConfirm: true,
        // showConfirmButton: $scope.add_emails
        showConfirmButton: true
      }
    }
    if (data_alert) {
      SweetAlert.swal(data_alert, 
      function(isConfirm) {
        if(isConfirm) {
          $http.post(url.IP+'payment-reminder-manual/', {'r_id':$scope.receipt_pay.id,'emails': arrayEmails})

          .then(
            function success(request) {
              if(request.status === 200 || request.status === 201) {
                swal("Enviado","El recordatorio ha sido enviado", "success");
              } else {
                swal("Error", "No se envió el recordatorio. Contacte a su administrador.", "error");
              }
            },
            function error(error) {
              console.log('error - email', error);
            }
          )
          .catch(function(e) {
            console.log('error - catch', e);
          });

        } else {

        }
      });
    }

  };
  function showEmail(receipt) {
    SweetAlert.swal({
      title: 'Correo',
      text: receipt.contratante.email,
      type: "info",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Enviar Recordatorio",
      closeOnConfirm: false
    },
    function(isConfirm) {

      if(isConfirm) {
        $http.post(url.IP+'payment-reminder-manual/', {'r_id':receipt.id})
        .then(
          function success(request) {
            if(request.status === 200 || request.status === 201) {
              swal("Enviado","El recordatorio ha sido enviado", "success");
            } else {
              swal("Error", "No se envió el recordatorio. Contacte a su administrador.", "error");
            }
          },
          function error(error) {
            console.log('error - email', error);
          }
        )
        .catch(function(e) {
          console.log('error - catch', e);
        });

      } else {
      }
    });
  }
  $scope.sendMailContractor = function(receipt){
    
    if (receipt.contratante) {
      if (receipt.contratante.email && !receipt.contratante.email == '') {
        var arrayEmails = [];
        arrayEmails = [receipt.contratante.email]
        $http.post(url.IP+'payment-reminder-manual/', {'r_id':receipt.id,'emails': arrayEmails})
          .then(
            function success(request) {
              if(request.status === 200 || request.status === 201) {
                SweetAlert.swal("Enviado","El recordatorio ha sido enviado", "success");
              } else {
                SweetAlert.swal("Error", "No se envió el recordatorio. Contacte a su administrador.", "error");
              }
            },
            function error(error) {
              console.log('error - email', error);
            }
          )
          .catch(function(e) {
            console.log('error - catch', e);
          });
      }else{
        toaster.error("El contratante no tiene correo, agregue correos", "error");
      }
    }
  }
  // OT Chart
  main.labels = ['En tiempo', 'Fuera de tiempo', 'Con atraso importante', 'Atención urgente'];
  main.data = [0, 0, 0, 0];
  main.showTotalOt = showTotalOt;

  // Events
  main.onOtEvent = onOtEvent;
  main.onContractorEvent = onContractorEvent;

  // Modals
  main.otCreatorModalEvent = otCreatorModalEvent;
  main.modifyRecordsModalEvent = modifyRecordsModalEvent;
  main.ModalCreateEndorsement = ModalCreateEndorsement;
  main.payReceiptsModalEvent = payReceiptsModalEvent;
  main.crearEndoso = crearEndoso;
  main.goToCotization = goToCotization;
  main.showAndHidePanels = showAndHidePanels;
  main.updatReceiptsCount = updatReceiptsCount;
  main.siniestersMoldalReport = siniestersMoldalReport;
  main.count_recibos;
  main.count_recibos_wopay;
  main.checkEndorsementType=checkEndorsementType;
  main.activateAux = activateAux;
  main.closeMenu = closeMenu;
  $localStorage.receiptUpdated = {};
  main.idFReceiptFound;
  $localStorage.receiptModified = false;
  $localStorage.internal_number = $scope.internal_number;

  function closeMenu(){
      if ($(window).width() <= 768) {
          $('.skin-1.bg-1').removeClass('mini-navbar');
      }
  }

  refreshUserFromStorage(false);

  if (usr && Object.keys(usr).length && $location.path() !== '/login/auth') {
      if(usr.urlname == "ts"){
        main.org_pruebas = true;
      } else {
        main.org_pruebas = false;
      }
      main.permisos = usr.permiso
      main.accesos = $rootScope.permisos
      updatReceiptsCount();
      activate();
      helpers.getStates();
  }

  function checkEndorsementType(obj) {
    if (obj.automobile)
      return 'automobile';
    else if (obj.life)
      return 'life';
    else if (obj.damage)
      return 'damage';
    else if (obj.disease) {
      return 'disease';
    }
  }

  function activateAux() {
    activate();
  }

  $scope.soloInfo=true;
  function changeStatusModal(receipt,insurance) {
    $scope.soloInfo=false;
    if(!insurance){
      insurance=receipt.poliza;
    }
    var modalInstance = $uibModal.open({ //jshint ignore:line
        templateUrl: 'app/cobranzas/cobranzas.modal.html',
        controller: 'CobranzasModal',
        size: 'lg',
        resolve: {
            receipt: function() {
                return angular.copy(receipt);
            },
            insurance: function() {
                return insurance;
            },
            from: function() {
                return null;
            },bono: function(){
              return null;
            }
        },
        backdrop: 'static', /* this prevent user interaction with the background */ 
        keyboard: false
    });
    modalInstance.result.then(function(receipt) {
      // if($localStorage.graficas_recibos_page && $localStorage.graficas_recibos_url){
        main.reloadReceiptsGraphic();
        var currentPage = parseInt($localStorage.graficas_recibos_page || '1', 10);
        main.show_paginationReceipts = true;
        // $http({
        //   method: 'GET',
        //   url: url.IP + 'chart-recibos/'}).then(function(ren) {
        //     main.receipts = ren.data;
        //     $localStorage.receipt_count = ren.data
        //     $http.get($localStorage.graficas_recibos_url)
        //     .then(
        //       function success(response) {
        //         main.receipts = response.data.results;
        //         main.config_receipts =  {
        //           count: response.data.count,
        //           previous: response.data.previous,
        //           next: response.data.next,
        //           current_page: currentPage,    // 👈 NUEVO
        //           page: currentPage    // 👈 NUEVO
        //         }
        //         console.log('iiiiiiiiii',response,$localStorage)
        //         if(response && response.data && response.data.results && main && main.recibos_a_pagar){
        //           response.data.results.forEach(function(rec) {                 
        //             main.recibos_a_pagar.forEach(function(rec_w) {                  
        //               if(rec.id == rec_w.id){
        //                 if (rec) {
        //                   rec.toPay =true;
        //                 }else{                 
                          
        //                 }
        //               }
        //             })
        //           })
        //         }
        //         main.show_paginationReceipts = true;
        //     },        
        //     function error(xcxxx) {
        //       // si error, volver a intentar SIN el parámetro page
        //       var badUrl = $localStorage.graficas_recibos_url || '';
        //       var fixedUrl = badUrl;
        //       if (badUrl.indexOf('?') !== -1) {
        //         var parts = badUrl.split('?');
        //         var base = parts[0];
        //         var query = parts[1] || '';
        //         var filtered = [];
        //         query.split('&').forEach(function (pair) {
        //           if (!pair) return;
        //           // excluir page=
        //           if (pair.indexOf('page=') === 0) return;
        //           filtered.push(pair);
        //         });

        //         if (filtered.length > 0) {
        //           fixedUrl = base + '?' + filtered.join('&');
        //         } else {
        //           fixedUrl = base; // sin query
        //         }
        //       }
        //       // console.log('Reintentando sin page:', fixedUrl);
        //       // actualizar en localStorage para futuros usos
        //       $localStorage.graficas_recibos_url = fixedUrl;
        //       if(fixedUrl){
        //         main.reloadReceiptsGraphic();
        //         var currentPage = parseInt($localStorage.graficas_recibos_page || '1', 10);
        //         $http.get($localStorage.graficas_recibos_url)
        //         .then(
        //           function success(response) {
        //             main.receipts = response.data.results;
        //             main.config_receipts =  {
        //               count: response.data.count,
        //               previous: response.data.previous,
        //               next: response.data.next,
        //               current_page: currentPage,    // 👈 NUEVO
        //               page: currentPage    // 👈 NUEVO
        //             }                    
        //             console.log('xii',response)
        //             if(response && response.data && response.data.results && main && main.recibos_a_pagar){
        //               response.data.results.forEach(function(rec) {                 
        //                 main.recibos_a_pagar.forEach(function(rec_w) {                  
        //                   if(rec.id == rec_w.id){
        //                     if (rec) {
        //                       rec.toPay =true;
        //                     }else{                 
                              
        //                     }
        //                   }
        //                 })
        //               })
        //             }
        //             main.show_paginationReceipts = true;
        //         })
        //       }
        //     })
        // });              
      // }
      updatReceiptsCount();
      // var modalInstance = $uibModal.open({ //jshint ignore:line
      //     templateUrl: 'app/main/editReceiptsPago.html',
      //     controller: EditPagosCtrl,
      //     size: 'lg',
      //     resolve: {
      //         main: function () {
      //           return main; // 👈 MISMA referencia
      //         },
      //         user: function(){
      //           return usr;
      //         },
      //         recibo: function() {
      //           return receipt;
      //         },
      //         pagosModal: function() {
      //             return main.pago_recibo_actual

      //         },
      //         from: function(){
      //           return null;
      //         },
      //         poliza: function() {
      //           if (receipt.poliza)
      //           return receipt.poliza;
      //           else{
      //             return receipt.fianza
      //           }
      //         },
      //         soloInfo: function(){
      //           return false;
      //         },
      //       },
      //         backdrop: 'static', /* this prevent user interaction with the background */ 
      //         keyboard: false  
      // });

    }, function() {
        // var modalInstance = $uibModal.open({ //jshint ignore:line
        //     templateUrl: 'app/main/editReceiptsPago.html',
        //     controller: EditPagosCtrl,
        //     size: 'lg',
        //     resolve: {
        //       main: function () {
        //         return main; // 👈 MISMA referencia
        //       },
        //         // pagosModal: function() {
        //         //     return main.pago_recibo_actual

        //         // } 

        //       user: function(){
        //         return usr;
        //       },
        //       recibo: function() {
        //         return receipt;
        //       },
        //       pagosModal: function() {
        //           return main.pago_recibo_actual

        //       },
        //       from: function(){
        //         return null;
        //       },
        //       poliza: function() {
        //         if (receipt.poliza)
        //         return receipt.poliza;
        //         else{
        //           return receipt.fianza
        //         }
        //       },
        //       soloInfo: function(){
        //         return false;
        //       },
        //     },
        //       backdrop: 'static', /* this prevent user interaction with the background */ 
        //       keyboard: false
        // });
    });
  }

  // function updateReceiptStatus() {
  //   console.log('oooooooooooooooo', main.pago_recibo_actual[0])
  //   if(main && main.pago_recibo_actual && main.pago_recibo_actual[0] && main.pago_recibo_actual[0].url){
  //     try{
  //       $http.get(main.pago_recibo_actual[0].url)
  //           .then(
  //             function success(response) {
  //               main.pago_recibo_actual[0] = response.data;
  //               $scope.recibo = main.pago_recibo_actual[0];
  //               angular.copy(response.data, $scope.recibo);
  //               console.log('jjjjjjjj',main.pago_recibo_actual[0],response,$scope.recibo)
  //           },        
  //           function error(xcxxx) {
  //           })
  //     }catch(enr){
  //       console.log('er al extraer info recibo',enr)
  //     }
  //   }
  //   receiptService.getCountReceipts().then(function(recibos) {
  //     var c = 0;
  //     var id_receipt_c = main.pago_recibo_actual[0].id;
  //     recibos.forEach(function(receipt) {
  //       c+=1;
  //       if (receipt.id == id_receipt_c) {
  //         main.idFReceiptFound = receipt.id
  //       }
  //     });
  //   });
  // }

  function updateReceiptStatus() {
    if (
      main &&
      main.pago_recibo_actual &&
      main.pago_recibo_actual[0] &&
      main.pago_recibo_actual[0].url
    ) {

      $http.get(main.pago_recibo_actual[0].url).then(function (response) {
        // actualiza el array principal
        $scope.$applyAsync(function () {          
          main.pago_recibo_actual[0] = response.data;
          $scope.recibo = response.data
          // 🔥 ACTUALIZA EL MODAL SIN ROMPER REFERENCIA
          if($scope.recibo.status !=response.data.status){
            angular.copy(response.data, $scope.recibo);
          }
        });
        // ahora sí, usa el ID actualizado
        receiptService.getCountReceipts().then(function (recibos) {
          var id_receipt_c = response.data.id;
          recibos.forEach(function (receipt) {
            if (receipt.id === id_receipt_c) {
              main.idFReceiptFound = receipt.id;
            }
          });
        });

      }, function (error) {
        console.error('Error actualizando recibo', error);
      });

    }
  }

  function updatReceiptsCount() {
      var aux = {};
      var aux_wopay = {};
      var count = 0;
      var wopay = 0;
      //var c1=0,c2=0;
      receiptService.getCountReceipts().then(function(recibos) {
          if (!angular.isArray(recibos)) {
            debugLog('updatReceiptsCount -> respuesta inválida', { recibos: recibos });
            return;
          }

          recibos.forEach(function(receipt) {
              count = 0;
              wopay = 0;
              if (receipt.status == 1){
                  wopay = wopay + 1;
              }
              recibos.forEach(function(recibo) {
                  if (receipt.id == recibo.rp_owner_id && recibo.isActive == true) {
                      count = count + 1;
                      if (recibo.status == 1){

                          wopay = wopay + 1;
                      }
                  }

              });
              aux[receipt.id] = count;
              aux_wopay[receipt.id] = wopay;
          });
      });
      main.count_recibos = aux;
      main.count_recibos_wopay = aux_wopay;

  }

  function editRecibo(receipt) {
      main.loaded = false;
      var recibos = [];
      var recibos_hijo = [];
      var endorsements = [];
      recibos_hijo.push(receipt)
      receiptService.getChildrenReceipts(receipt.id).then(function(recibos) {
        $http({
          method: 'GET',
          url: url.IP + 'cartas-by-model',
          params: {
            model: 4
          }
        }).then(function success(response) {
          main.cartas = response.data;
        })
          try {
              recibos.forEach(function(recibo) {
                  // if (receipt.id == recibo.rp_owner_id) {
                      recibos_hijo.push(recibo);
                  // }
              });
          }
          catch (err){              
          }
      });

      main.pago_recibo_actual = recibos_hijo;
      main.loaded = true;
      var modalInstance = $uibModal.open({ //jshint ignore:line
          templateUrl: 'app/main/editReceiptsPago.html',
          controller: EditPagosCtrl,
          size: 'lg',
          resolve: {
              main: function () {
                return main; // 👈 MISMA referencia
              },
              user: function(){
                return usr;
              },
              pagosModal: function() {
                return main.pago_recibo_actual;
              },
              poliza: function() {
                if (receipt.poliza)
                return receipt.poliza;
                else{
                  return receipt.fianza
                }
              },
              recibo: function() {
                return receipt;
              },
              from: function(){
                return null;
              }  ,
              soloInfo: function(){
                return true;
              },                
          },
              backdrop: 'static', /* this prevent user interaction with the background */ 
              keyboard: false
      });

      modalInstance.result
      .then(function() {
          // activate();
          // console.log('oooooooooo',main.receipts)
      })
      .catch(function() {
          // activate();
          // console.log('oooooooooo',main.receipts)
      });
  }

  function EditPagosCtrl(datesFactory,$scope, $uibModalInstance, pagosModal, poliza, recibo, $sessionStorage, $sce,soloInfo) {    
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
    $scope.user = usr;
    $scope.receiptmodel = recibo.url;
    $scope.main = main;

    // Menú rapido
    main.deletePolicy = deletePolicy;
    main.cancelPolicy = cancelPolicy;
    main.getPDF = getPDF;
    main.openRenovateModal = openRenovateModal;
    main.createRecordatorio = createRecordatorio;
    main.goToEdit = goToEdit;
    main.goToPolicy = goToPolicy;
    main.update_promesa_pago =  update_promesa_pago;
    main.edith_promesa_pago = false;
    $scope.recibo = recibo;
    $scope.soloInfo=soloInfo;
    function createRecordatorio(registroSelected, tipo) {
      if($uibModalInstance){
        $uibModalInstance.dismiss('cancel');
      };
      var insurance = registroSelected
      var modalInstance = $uibModal.open({
        templateUrl: 'app/recordatorios/desde-registro/desderegistro.modal.html',
        controller: 'RecordatorioRegistroCtrl',
        size: 'lg',
        resolve: {
          poliza: function() {
            return registroSelected;
          },
          tipoRegistro: function() {
            return tipo;
          },
          from: function(){
            return null;
          },
          parent: function(){
            return poliza;
          }
        },
      backdrop: 'static', /* this prevent user interaction with the background */
      keyboard: false
      });
    }
    function getContractorId(contractor) {
      if (!contractor) return null;
      // Si viene como objeto { id: 9929, ... }
      if (angular.isObject(contractor) && contractor.id) {
        return contractor.id;
      }
      // Si viene como string
      if (angular.isString(contractor)) {
        if (contractor.indexOf('http') === 0) {
          var parts = contractor.split('/').filter(Boolean); // quita vacíos por //
          return parts[parts.length - 1]; // último segmento -> "9929"
        }
        // Si ya es un id en string, lo regresamos tal cual
        return contractor;
      }
      return contractor;
    }
    $scope.recordatoriosFlag = false;
    $scope.showRecordatorios = function () {
      $scope.recordatoriosFlag = !$scope.recordatoriosFlag;
    }
    $scope.goToRecordatorio = function (rec) {
      if (rec.recordatorio) {
        $scope.name_for_new_tab = 'Recordatorio desde registro';
        $scope.route_for_new_tab = 'recordatorios.desde_registro_show';
        var params = {id: rec.recordatorio.id}
      }
      var existe = false;
      if (name && route){
        $scope.route_for_new_tab = route;
        $scope.name_for_new_tab = name;
        appStates.states.forEach(function(state) {
          if (state.route == $scope.route_for_new_tab){
            existe = true;
          }
        });
      }

      if (!existe){
        var active_tab = appStates.states.findIndex(function(item){
          if (item.active){
            return true
          }
          return false;
        });
        
        appStates.states[active_tab] = { 
          name: $scope.name_for_new_tab, 
          heading: $scope.name_for_new_tab, 
          route: $scope.route_for_new_tab, 
          active: true, 
          isVisible: true, 
          href: $state.href($scope.route_for_new_tab,params),
        }
      }
      $localStorage.tab_states = appStates.states;
      $state.go($scope.route_for_new_tab, params); 
    }
    $scope.createRecordatorio = function (registroSelected, tipo) {
      var insurance = registroSelected
      var modalInstance = $uibModal.open({
        templateUrl: 'app/recordatorios/desde-registro/desderegistro.modal.html',
        controller: 'RecordatorioRegistroCtrl',
        size: 'lg',
        resolve: {
          poliza: function() {
            return registroSelected;
          },
          tipoRegistro: function() {
            return tipo;
          },
          from: function(){
            return null;
          },
          parent: function(){
            return $scope.endorsement;
          }
        },
      backdrop: 'static', /* this prevent user interaction with the background */
      keyboard: false
      });
      if($uibModalInstance){
        $uibModalInstance.dismiss('cancel');
      };
    }      
    function deletePolicy(policy){
      // dataFactory.get('has-del-policy-permission')
      // .then(function success(response) {
      //  if(response.data){
        SweetAlert.swal({
            title: "¿Está seguro?",
            text: "Los cambios no podrán revertirse",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Si",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: false
          },
          function(isConfirm){
            if (isConfirm) {
              if(policy.document_type == 1){
                return $http.post(url.IP + 'delete-policy', {'id':policy.id})
                  .then(deletePolicyComplete)
                  .catch(deletePolicyFailed);

                function deletePolicyComplete(response, status, headers, config) { //jshint ignore:line
                  SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETEPOLICY, "success");
                  setTimeout(function() {
                    $state.go('polizas.table');
                  }, 1000);
                }

                function deletePolicyFailed(response, status, headers, config) { //jshint ignore:line
                  return response;
                }
              }
              else if(policy.document_type == 3){
                return $http.post(url.IP + 'delete-colectivity/', {'id': policy.id})
                  .then(deletePolicyComplete)
                  .catch(deletePolicyFailed);

                function deletePolicyComplete(response, status, headers, config) { //jshint ignore:line
                  SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETECOLLECTIVITY, "success");
                  setTimeout(function() {
                    $state.go('polizas.table');
                  }, 1000);
                }

                function deletePolicyFailed(response, status, headers, config) { //jshint ignore:line
                  return response;
                }
              }
              else if(policy.document_type == 4){
                return $http.post(url.IP + 'delete-colectivity/', {'id': policy.caratula})
                  .then(deletePolicyComplete)
                  .catch(deletePolicyFailed);

                function deletePolicyComplete(response, status, headers, config) { //jshint ignore:line
                  SweetAlert.swal("¡Listo!", MESSAGES.OK.DELETECOLLECTIVITY, "success");
                  setTimeout(function() {
                    $state.go('polizas.table');
                  }, 1000);
                }

                function deletePolicyFailed(response, status, headers, config) { //jshint ignore:line
                  return response;
                }
              }
            } else {
              SweetAlert.swal("Cancelado", "La póliza no se ha eliminado", "error");
            }
          });
      // } else {
      //   SweetAlert.swal('Error', 'No tienes permiso para realizar esta acción', "error")
      //  }
      // })
    }
    function cancelPolicy(id){
      dataFactory.get()
      .then(function success(response) {
        if(response.data){
          SweetAlert.swal({
            title: "Cancelar póliza",
            text: "Elija una opción",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#581845  ",
            confirmButtonText: "Por endoso tipo D",
            cancelButtonText: "Precancelación",
            closeOnConfirm: true,
            closeOnCancel: false
          },
          function(isConfirm){
            if (isConfirm) {
              var params = { 'myInsurance': vm.insurance, 'contractor': $scope.contratante }
              $state.go('endosos.endosos',params);
            } else {
              var data = {
                status: 4
              }
              // SweetAlert.swal("Se ha enviando un correo al administrador", "info");
              // $http.patch(url.IP + 'polizas/'+ id + '/', data).then(function success(response) {
              // }) Manda correo
              $scope.emails = [];
              // $scope.emails.push("example@miurabox.com");
              $http.post(url.IP + 'cancel-policy-manual/', {'id': id, 'emails': $scope.emails})
              .then(
                function success(request) {
                  if(request.status === 200) {
                    swal("¡Listo!", "Se ha enviado un correo al administrador", "success");
                  } else {
                    toaster.warning("No se envió la póliza. Contacte a su administrador.");
                  }
                },
                function error(error) {
                  console.log('error - email', error);
                }
              )
              .catch(function(e) {
                console.log('error - catch', e);
              });
            }
          });
        } else {
          SweetAlert-swal("Error", "No tienes permiso para realizar esta acción", "error");
        }
      })
    }
    // Edit Contractor
    $scope.chngDesc = false;
    $scope.changeDescriptionC = function(val){
      $scope.chngDesc = val
    };
    $scope.saveDescript = function(cntr){
      $http.patch(cntr.url,{'description':cntr.description})
      .then(
        function success(request) {
          if(request.status === 200 || request.status === 201) {
            swal("Hecho","Las observaciones se han guardado", "success");
            $scope.chngDesc = false;              
            $scope.contratante.description = cntr.description;              
          } else {
            swal("Error", "No se guardo la información.", "error");
          }
          var paramsCont = {
            'model':  cntr.type_person == "Fisica" ? 2 : 3,
            'event': "PATCH",
            'associated_id': cntr.id,
            'identifier': " actualizo las observaciones del contratante (Observaciones: "+cntr.description+"."
          }
          dataFactory.post('send-log/', paramsCont).then(function success(response) {
          });
        },
        function error(error) {
          console.log('error - email', error);
        }
      )
      .catch(function(e) {
        console.log('error - catch', e);
      });
    }

    function update_promesa_pago (receipt){
      if(!main.new_promesa_pago){
        toaster.error('Ingresa  promesa de pago');
        return;
      }
      $http.post(url.IP+ 'promesa-pago/',{
        'recibo_id':receipt.id,
        'promesa_pago': datesFactory.toDate(main.new_promesa_pago)
      }).then(function success(response) {
        if(response.status == 500){
          try{
            toaster.error(response.data['detail']);
          }
          catch(err){
            console.log(err, response.data)
          }
        } else if (response.status == 200){
          receipt.promesa_pago = main.new_promesa_pago;
        }
        main.edith_promesa_pago = false;
        return;
      });
    }

    function getPDF(poliza) {
      $http({
        method: 'GET',
        url: url.IP + 'get-pdf-ot/',
        params: {
          'id': poliza
        }
      }).then(function success(response) {
        // $scope.pdf = response.data;
        var file = new Blob([response.data], {type: 'application/pdf'});
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(file);
        }
        else{
          var fileURL = URL.createObjectURL(file);
          $scope.content = $sce.trustAsResourceUrl(fileURL);
          window.open($scope.content);
        }
        // $http({
        //   method: 'GET',
        //   url: url.IP + 'get-pdf',
        //   params: {
        //     'pdf_name': $scope.pdf.pdf_name
        //   }
        // }).then(function success(response) {
            
        //   })
      })
    }

    function openRenovateModal(myInsurance, type){
      if(myInsurance.document_type == 1){
        if(myInsurance.renewed){
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRENEWPOLICY, "error");
        }
        else{
          var params = { 'polizaId': myInsurance.id }
          $scope.open_in_same_tab_natural('Renovación póliza', 'renovaciones.polizas',params, myInsurance.id);
          // $state.go('renovaciones.polizas', params);
        }
      }
      else if(myInsurance.document_type == 3){
        if(myInsurance.renewed){
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRENEWPOLICY, "error");
        }
        else{
          if(type == 1){
            var params = { polizaId: myInsurance.id, tipo: 1 }
            $scope.open_in_same_tab_natural('Renovación colectivos', 'colectividades.renewal',params,  myInsurance.id );
            // $state.go('colectividades.renewal', params);
          }
          else if(type == ''){
            var params = { polizaId: myInsurance.id, tipo: '' }
            $scope.open_in_same_tab_natural('Renovación colectivos', 'colectividades.renewal',params, myInsurance.id);
            // $state.go('colectividades.renewal', params);
          }
        }
      }
      else if(myInsurance.document_type == 4){
        if(myInsurance.renewed){
          SweetAlert.swal("Error", MESSAGES.ERROR.ERRORRENEWPOLICY, "error");
        }
        else{
          if(type == 1){
            var params = { polizaId: myInsurance.caratula, tipo: 1 }
            $scope.open_in_same_tab_natural('Renovación colectivos', 'colectividades.renewal',params,myInsurance.caratula );
            $state.go('colectividades.renewal', params);
          }
          else if(type == ''){
            var params = { polizaId: myInsurance.caratula, tipo: '' }
            $scope.open_in_same_tab_natural('Renovación colectivos', 'colectividades.renewal',params, myInsurance.caratula);
            $state.go('colectividades.renewal', params);
          }
        }
      }
      if($uibModalInstance){
        $uibModalInstance.dismiss('cancel');
      };
    }

    function goToEdit(poliza) {
      if(poliza.document_type == 7){
        $scope.open_in_same_tab_natural('Edición fianza', 'fianzas.editar', {polizaId: poliza.id}, poliza.id);
        // $state.go('fianzas.editar', {polizaId: poliza.id});
      }
      if(poliza.document_type == 1){
        $scope.open_in_same_tab_natural('Edición póliza', 'polizas.editar', {polizaId: poliza.id}, poliza.id);
        // $state.go('polizas.editar', {polizaId: poliza.id});
      }
      else if(poliza.document_type == 3){
        $scope.open_in_same_tab_natural('Edición colectividades', 'colectividades.edit', {polizaId: poliza.id}, poliza.id);
        // $state.go('colectividades.edit', {polizaId: poliza.id});
      }
      else if(poliza.document_type == 11){
        $scope.open_in_same_tab_natural('Edición colectividades', 'flotillas.edit', {polizaId: poliza.id}, poliza.id);
        // $state.go('flotillas.edit', {polizaId: poliza.id});
      }
      else if(poliza.document_type == 4){
        $scope.open_in_same_tab_natural('Edición colectividades', 'colectividades.edit', {polizaId: poliza.caratula}, poliza.caratula);
        // $state.go('colectividades.edit', {polizaId: poliza.caratula});
      }
      if($uibModalInstance){
        $uibModalInstance.dismiss('cancel');
      };
    }


    $scope.open_in_same_tab_natural = function(name, route, params, identifier){
      if (name && route){
        $scope.route_for_new_tab = route;
        $scope.name_for_new_tab = name;
      }

      var active_tab = appStates.states.findIndex(function(item){
        if (item.active){
          return true
        }
        return false;
      });
      appStates.states[active_tab] = {
        id: identifier,
        name: $scope.name_for_new_tab, 
        heading: $scope.name_for_new_tab, 
        route: $scope.route_for_new_tab, 
        active: true, 
        isVisible: true, 
        href: $state.href($scope.route_for_new_tab)
      }
      $localStorage.tab_states = appStates.states;
      $localStorage.tab_index = $localStorage.tab_states.length -1;
      $state.go($scope.route_for_new_tab, params);
    }

    function goToPolicy(poliza) {
      if(poliza.document_type == 1){
        $scope.open_in_same_tab_natural('Pólizas', 'polizas.info', {polizaId: poliza.id}, poliza.id);
        // $state.go('polizas.info', {polizaId: poliza.id});            
      } else if(poliza.document_type == 3){
        $scope.open_in_same_tab_natural('Colectividades', 'colectividades.info', {polizaId: poliza.id}, poliza.id);
        // $state.go('colectividades.info', {polizaId: poliza.id});
      }
      else if(poliza.document_type == 4){
        $scope.open_in_same_tab_natural('Colectividades', 'colectividades.info', {polizaId: poliza.caratula}, poliza.caratula);
        // $state.go('colectividades.info', {polizaId: poliza.caratula});
      }else if(poliza.document_type == 6){
          $scope.open_in_same_tab_natural('Colectividades', 'colectividades.info', {polizaId: poliza.caratula}, poliza.caratula);
          // $state.go('colectividades.info', {polizaId: poliza.caratula})
      }else if (poliza.document_type == 7) {
        $scope.open_in_same_tab_natural('Fianzas', 'fianzas.info',  {polizaId: poliza.id}, poliza.id);
        // $state.go('fianzas.info', {polizaId: poliza.id})
      }else if (poliza.document_type == 8) {
        $scope.open_in_same_tab_natural('Fianzas', 'fianzas.details',  {polizaId: poliza.id}, poliza.id);
        // $state.go('fianzas.details',{polizaId: poliza.id})
      }else if (poliza.document_type == 12) {
        $scope.open_in_same_tab_natural('Flotillas', 'flotillas.info',  {polizaId: parseInt(poliza.caratula)}, poliza.id);
        // $state.go('flotillas.info',{polizaId: parseInt(poliza.caratula)})
      }else if (poliza.document_type == 11) {
        $scope.open_in_same_tab_natural('Flotillas', 'flotillas.info',  {polizaId: parseInt(poliza.caratula)}, poliza.id);
        // $state.go('flotillas.info',{polizaId: parseInt(poliza.id)})
      }
      if($uibModalInstance){
        $uibModalInstance.dismiss('cancel');
      };
    }
    // BITACORA
    main.showBinnacle($scope.recibo, 'recibo_modal');

    if(poliza.document_type == 7){
      dataFactory.get('leer-fianzas-info/' + poliza.id)
      .then(function success (data) {
        $scope.myPolicy = data.data;

        // TRAE INFORMACIÓN DEL CONTRATANTE
        var idContratante = null;
        var dat = {};
        if($scope.myPolicy.contractor) {
          idContratante = $scope.myPolicy.contractor.id ? $scope.myPolicy.contractor.id : $scope.myPolicy.contractor;
          dat.type = 'morales';
          dat.contratanteId = idContratante;
        }
        if(dat.contratanteId){
          var id_c = getContractorId($scope.myPolicy.contractor);
          dat.contratanteId = id_c;
        }
        ContratanteService.getContratante(dat)
        .then(
          function success (request) {
            $scope.contratante = request;
            $scope.addressContratante = request.address_contractor[0];
          },
          function error(err) {
            console.log('err - contratante');
          }
        );
      },
      function error (error) {
        console.log('Error - poliza', error);
      });
    }
    else{
      insuranceService.getInsuranceRead(poliza)
      .then(function success (data) {
        $scope.myPolicy = data;

        // TRAE INFORMACIÓN DEL CONTRATANTE
        var idContratante = null;
        var dat = {};
        if($scope.myPolicy.contractor) {
          idContratante = $scope.myPolicy.contractor.id ? $scope.myPolicy.contractor.id : $scope.myPolicy.contractor;
          dat.type = 'morales';
          dat.contratanteId = idContratante;
        }
        if(dat.contratanteId){
          var id_c = getContractorId($scope.myPolicy.contractor);
          dat.contratanteId = id_c;
        }
        ContratanteService.getContratante(dat)
        .then(
          function success (request) {
            $scope.contratante = request;
            if(request && request.address_contractor){
              $scope.addressContratante = request.address_contractor[0];
            }
            // main.reloadReceiptsGraphic();
          },
          function error(err) {
            console.log('err - contratante');
          }
        );

      },
      function error (error) {
        console.log('Error - poliza', error);
      });
    }
    updateReceiptStatus();
    try {
      if (($localStorage.receiptUpdated.id == main.idFReceiptFound) && $localStorage.receiptModified == true) {
        main.pago_recibo_actual[0].status = $localStorage.receiptUpdated.status;
      }

    }
    catch (err){
      
    }
    $scope.forma_pago = function (parValue) {
      switch (parValue) {
        case 1:
          return 'Mensual';
          break;
        case 2:
          return 'Bimestral';
          break;
        case 3:
          return 'Trimestral';
          break;
        case 5:
          return 'Contado';
          break;
        case 6:
          return 'Semestral';
          break;
        case 12:
          return 'Anual';
          break;
        case 24:
          return 'Quincenal';
          break;
        default:
          return 'No especificada';
      }
    }
    $scope.status = function (parValue) {
      switch (parValue) {
        case 1:
          return 'En trámite';
          break;
        case 2:
          return 'OT Cancelada';
          break;
        case 4:
          return 'Precancelada';
          break;
        case 10:
          return 'Por iniciar';
          break;
        case 11:
          return 'Cancelada';
          break;
        case 12:
          return 'Renovada';
          break;
        case 13:
          return 'Vencida';
          break;
        case 14:
          return 'Vigente';
          break;
        case 15:
          return 'No renovada';
          break;
        default:
          return 'Pendiente';
      }
    }
    $scope.dismis = function(receipt,v) {
      $scope.soloInfo=false;
      $uibModalInstance.dismiss('cancel');
      changeStatusModal(receipt,$scope.myPolicy);
    };
    $scope.reloadReceipts = function(){
      if($localStorage.graficas_recibos_page && $localStorage.graficas_recibos_url){
        main.reloadReceiptsGraphic();
        var currentPage = parseInt($localStorage.graficas_recibos_page || '1', 10);
        $http({
          method: 'GET',
          url: url.IP + 'chart-recibos/'}).then(function(ren) {
            main.receipts = ren.data;
            $localStorage.receipt_count = ren.data
            $http.get($localStorage.graficas_recibos_url)
            .then(
              function success(response) {
                main.receipts = response.data.results;
                main.config_receipts =  {
                  count: response.data.count,
                  previous: response.data.previous,
                  next: response.data.next,
                  current_page: currentPage,    // 👈 NUEVO
                  page: currentPage    // 👈 NUEVO
                }
                console.log('cccccccc',response)
                if(response && response.data && response.data.results && main && main.recibos_a_pagar){
                  response.data.results.forEach(function(rec) {                 
                    main.recibos_a_pagar.forEach(function(rec_w) {                  
                      if(rec.id == rec_w.id){
                        if (rec) {
                          rec.toPay =true;
                        }else{                 
                          
                        }
                      }
                    })
                  })
                }
                main.show_paginationReceipts = true;
            },        
            function error(xcxxx) {
              // si error, volver a intentar SIN el parámetro page
              var badUrl = $localStorage.graficas_recibos_url || '';
              var fixedUrl = badUrl;
              if (badUrl.indexOf('?') !== -1) {
                var parts = badUrl.split('?');
                var base = parts[0];
                var query = parts[1] || '';
                var filtered = [];
                query.split('&').forEach(function (pair) {
                  if (!pair) return;
                  // excluir page=
                  if (pair.indexOf('page=') === 0) return;
                  filtered.push(pair);
                });

                if (filtered.length > 0) {
                  fixedUrl = base + '?' + filtered.join('&');
                } else {
                  fixedUrl = base; // sin query
                }
              }
              // console.log('Reintentando sin page:', fixedUrl);
              // actualizar en localStorage para futuros usos
              $localStorage.graficas_recibos_url = fixedUrl;
              if(fixedUrl){
                main.reloadReceiptsGraphic();
                var currentPage = parseInt($localStorage.graficas_recibos_page || '1', 10);
                $http.get($localStorage.graficas_recibos_url)
                .then(
                  function success(response) {
                    main.receipts = response.data.results;
                    main.config_receipts =  {
                      count: response.data.count,
                      previous: response.data.previous,
                      next: response.data.next,
                      current_page: currentPage,    // 👈 NUEVO
                      page: currentPage    // 👈 NUEVO
                    }
                    console.log('iiiiixxxxxxxiiiii',response)
                    if(response && response.data && response.data.results && main && main.recibos_a_pagar){
                      response.data.results.forEach(function(rec) {                 
                        main.recibos_a_pagar.forEach(function(rec_w) {                  
                          if(rec.id == rec_w.id){
                            if (rec) {
                              rec.toPay =true;
                            }else{                 
                              
                            }
                          }
                        })
                      })
                    }
                    main.show_paginationReceipts = true;
                })
              }
            })
        });
      }
    }
    $scope.cancel = function(valor) {
      console.log('solo vio',valor,$scope.soloInfo,$localStorage['graficas_recibos_url'])
        if ($uibModalInstance){
          if($localStorage['graficas_recibos_url'] && !$scope.soloInfo){
            $scope.reloadReceipts();
          }
          $uibModalInstance.dismiss('cancel');
          main.coverageModal = true;
        }
    };
    $localStorage.receiptModified=false;
  };

  if($localStorage.loginInfo){
    initUser();
  }
  // $(function(){ $('#jcrop_target').Jcrop(); });
  function initUser() {
    var x = JSON.parse($localStorage.loginInfo);
    // if($window.localStorage.loginInfo)
    //   var x = JSON.parse($window.localStorage.loginInfo);
    // else
    //   var x = usr

    main.accesos = $sessionStorage.permisos
    $rootScope.permisos_new = $rootScope.permisos


    if($sessionStorage.infoUser){
      main.acceso_adm_tas = $sessionStorage.infoUser.another_tasks
    }else{
      main.acceso_adm_tas = false;
    }

    if (main.accesos) {
      main.accesos.forEach(function(perm){
      if(perm.model_name == 'Dashboard'){
        main.acceso_dash = perm
        main.acceso_dash.permissions.forEach(function(acc){
          if (acc.permission_name == 'Gráfica OTs') {
            if (acc.checked == true) {
              main.permiso_g_ot = true
            }else{
              main.permiso_g_ot = false
            }
          }else if (acc.permission_name == 'Gráfica cobranza') {
            if (acc.checked == true) {
              main.permiso_g_cob = true
            }else{
              main.permiso_g_cob = false
            }
          }else if (acc.permission_name == 'Gráfica renovaciones') {
            if (acc.checked == true) {
              main.permiso_g_ren = true
            }else{
              main.permiso_g_ren = false
            }
          }else if (acc.permission_name == 'Gráfica siniestros') {
            if (acc.checked == true) {
              main.permiso_g_sin = true
            }else{
              main.permiso_g_sin = false
            }
          }else if (acc.permission_name == "KBI's") {
            if (acc.checked == true) {
              main.permiso_kbi = true
            }else{
              main.permiso_kbi = false
            }
          }else if (acc.permission_name == "Filtrado gráfica cobranza") {
            if (acc.checked == true) {
              main.permiso_f_cob = true
            }else{
              main.permiso_f_cob = false
            }
          }
        })
      }
      if(perm.model_name == 'Pólizas'){
        main.acceso_polizas = perm
        main.acceso_polizas.permissions.forEach(function(acc){
          if (acc.permission_name == 'Administrar pólizas') {
            if (acc.checked == true) {
              main.acceso_adm_pol = true
            }else{
              main.acceso_adm_pol = false
            }
          }else if (acc.permission_name == 'Ver pólizas') {
            if (acc.checked == true) {
              main.acceso_ver_pol = true
            }else{
              main.acceso_ver_pol = false
            }
          }else if (acc.permission_name == 'Eliminar pólizas') {
            if (acc.checked == true) {
              main.acceso_del_pol = true
            }else{
              main.acceso_del_pol = false
            }
          }
        })
      }
      if(perm.model_name == 'Endosos'){
        $scope.acceso_endosos = perm
        $scope.acceso_endosos.permissions.forEach(function(acc){
          if (acc.permission_name ==  'Registrar endosos') {
            if (acc.checked == true) {
              $scope.acceso_adm_end = true
            }else{
              $scope.acceso_adm_end = false
            }
          }
        })
      }
      if(perm.model_name == 'Ordenes de trabajo'){
        main.acceso_ot = perm
        main.acceso_ot.permissions.forEach(function(acc){
          if (acc.permission_name == 'Administrar OTs') {
            if (acc.checked == true) {
              main.acceso_adm_ot = true
            }else{
              main.acceso_adm_ot = false
            }
          }else if (acc.permission_name == 'Ver OTs') {
            if (acc.checked == true) {
              main.acceso_ver_ot = true
            }else{
              main.acceso_ver_ot = false
            }
          }else if (acc.permission_name == 'Tablero de OTs') {
            if (acc.checked == true) {
              main.acceso_tab_ots = true
            }else{
              main.acceso_tab_ots = false
            }
          }
        })
      }
      if(perm.model_name == 'Siniestros'){
        main.acceso_sin = perm
        main.acceso_sin.permissions.forEach(function(acc){
          if (acc.permission_name == 'Administrar siniestros') {
            if (acc.checked == true) {
              main.acceso_adm_sin = true
            }else{
              main.acceso_adm_sin = false
            }
          }
        })
      }
      if(perm.model_name == 'Paquetes'){
        main.acceso_pack = perm
        main.acceso_pack.permissions.forEach(function(acc){
          if (acc.permission_name == 'Crear paquete') {
            if (acc.checked == true) {
              main.acceso_adm_pack = true
            }else{
              main.acceso_adm_pack = false
            }
          }
        })
      }
      if(perm.model_name == 'Configuración'){
        main.acceso_cob = perm
        main.acceso_cob.permissions.forEach(function(acc){              
          if (acc.permission_name == 'Configuración') {
            if (acc.checked == true) {
              main.acceso_configuracion = true
            }else{
              main.acceso_configuracion = false
            }
          }else if (acc.permission_name == 'Clasificación, Células y Agrupaciones') {
            if (acc.checked == true) {
              main.acceso_clasificacion = true
            }else{
              main.acceso_clasificacion = false
            }
          }
        })
      }
      if(perm.model_name == 'Cobranza'){
        main.acceso_cob = perm
        main.acceso_cob.permissions.forEach(function(acc){              
          if (acc.permission_name == 'Ver cobranza') {
            if (acc.checked == true) {
              main.acceso_ver_cob = true
            }else{
              main.acceso_ver_cob = false
            }
          }else if (acc.permission_name == 'Despagar recibos') {
            if (acc.checked == true) {
              main.acceso_desp_cob = true
            }else{
              main.acceso_desp_cob = false
            }
          }else if (acc.permission_name == 'Pagar y prorrogar') {
            if (acc.checked == true) {
              main.acceso_pag_cob = true
            }else{
              main.acceso_pag_cob = false
            }
          }else if (acc.permission_name == 'Desconciliación de recibos') {
            if (acc.checked == true) {
              main.acceso_desco_cob = true
            }else{
              main.acceso_desco_cob = false
            }
          }else if (acc.permission_name == 'Conciliar recibos') {
            if (acc.checked == true) {
              main.acceso_conc_cob = true
            }else{
              main.acceso_conc_cob = false
            }
          }else if (acc.permission_name == 'Liquidar recibos') {
            if (acc.checked == true) {
              main.acceso_liq_cob = true
            }else{
              main.acceso_liq_cob = false
            }
          }
        })
      }
      if (perm.model_name == 'Correos electronicos') {
        main.acceso_correo = perm;
        main.acceso_correo.permissions.forEach(function(acc) {
          if (acc.permission_name == 'Correos') {
            if (acc.checked == true) {
              main.acceso_cor = true
            }else{
              main.acceso_cor = false
            }
          }
        })
      }
      if (perm.model_name == 'Reportes') {
        main.acceso_reportes = perm;
        main.acceso_reportes.permissions.forEach(function(acc) {
          if (acc.permission_name == 'Reporte fianzas') {
            if (acc.checked == true) {
              main.acceso_rep_fia = true
            }else{
              main.acceso_rep_fia = false
            }
          }else if (acc.permission_name == 'Reporte Siniestros') {
            if (acc.checked == true) {
              main.acceso_rep_sin = true
            }else{
              main.acceso_rep_sin = false
            }
          }else if (acc.permission_name == 'Reporte Endosos') {
            if (acc.checked == true) {
              main.acceso_rep_end = true
            }else{
              main.acceso_rep_end = false
            }
          }else if (acc.permission_name == 'Reporte pólizas') {
            if (acc.checked == true) {
              main.acceso_rep_pol = true
            }else{
              main.acceso_rep_pol = false
            }
          }else if (acc.permission_name == 'Reporte renovaciones') {
            if (acc.checked == true) {
              main.acceso_rep_ren = true
            }else{
              main.acceso_rep_ren = false
            }
          }else if (acc.permission_name == 'Reporte cobranza') {
            if (acc.checked == true) {
              main.acceso_rep_cob = true
            }else{
              main.acceso_rep_cob = false
            }
          }else if (acc.permission_name == 'Reporte de Log') {
            if (acc.checked == true) {
              main.acceso_rep_log = true
            }else{
              main.acceso_rep_log = false
            }
          }else if (acc.permission_name == 'Reportes Especiales') {
            if (acc.checked == true) {
              main.acceso_rep_esp = true
            }else{
              main.acceso_rep_esp = false
            }
          }else if (acc.permission_name == 'Reportes Estadísticos') {
            if (acc.checked == true) {
              main.acceso_rep_est = true
            }else{
              main.acceso_rep_est = false
            }
          }
        })
      }
      if (perm.model_name == 'Formatos') {
        main.acceso_form = perm;
        main.acceso_form.permissions.forEach(function(acc) {
          if (acc.permission_name == 'Formatos') {
            if (acc.checked == true) {
              main.acceso_form = true
            }else{
              main.acceso_form = false
            }
          }
        })
      }
      if (perm.model_name == 'Agenda') {
        main.acceso_age = perm;
        main.acceso_age.permissions.forEach(function(acc) {
          if (acc.permission_name == 'Agenda') {
            if (acc.checked == true) {
              main.acceso_age = true
            }else{
              main.acceso_age = false
            }
          }
        })
      }
      if (perm.model_name == 'Notificaciones') {
        main.acceso_mns = perm;
        main.acceso_mns.permissions.forEach(function(acc) {
          if (acc.permission_name == 'Administrar notificaciones') {
            if (acc.checked == true) {
              main.acceso_not = true
            }else{
              main.acceso_not = false
            }
          }
        })
      }
      if (perm.model_name == 'Mensajeria') {
        main.acceso_mns = perm;
        main.acceso_mns.permissions.forEach(function(acc) {
          if (acc.permission_name == 'Mensajeria') {
            if (acc.checked == true) {
              main.acceso_mns = true
            }else{
              main.acceso_mns = false
            }
          }
        })
      }
      if (perm.model_name == 'Campañas') {
        main.acceso_camp = perm;
        main.acceso_camp.permissions.forEach(function(acc) {
          if (acc.permission_name == 'Campañas') {
            if (acc.checked == true) {
              main.acceso_camp = true
            }else{
              main.acceso_camp = false
            }
          }
        })
      }
      if (perm.model_name == 'Contratantes y grupos') {
        main.acceso_contg = perm;
        main.acceso_contg.permissions.forEach(function(acc) {
          if (acc.permission_name == 'Administrar contratantes y grupos') {
            if (acc.checked == true) {
              main.acceso_adm_cont = true
            }else{
              main.acceso_adm_cont = false
            }
          }else if (acc.permission_name == 'Ver contratantes y grupos') {
            if (acc.checked == true) {
              main.acceso_ver_cont = true
            }else{
              main.acceso_ver_cont = false
            }
          }
        })
      }
      if(perm.model_name == 'Referenciadores'){
        main.acceso_ref = perm
        main.acceso_ref.permissions.forEach(function(acc){
          if (acc.permission_name == 'Administrar referenciadores') {
            if (acc.checked == true) {
              main.acceso_adm_ref = true
            }else{
              main.acceso_adm_ref = false
            }
          }else if (acc.permission_name == 'Pagar a referenciadores') {
            if (acc.checked == true) {
              main.acceso_pag_ref = true
            }else{
              main.acceso_pag_ref = false
            }
          }else if (acc.permission_name == 'Ver referenciadores') {
            if (acc.checked == true) {
              main.ver_referenciador = true
            }else{
              main.ver_referenciador = false
            }
          }else if (acc.permission_name == 'Estados de Cuenta') {
            if (acc.checked == true) {
              main.acceso_edo_cuenta = true
            }else{
              main.acceso_edo_cuenta = false
            }
          }
        })
      }
      if(perm.model_name == 'Fianzas'){
        main.acceso_fian = perm
        main.acceso_fian.permissions.forEach(function(acc){
          if (acc.permission_name == 'Administrar fianzas') {
            if (acc.checked == true) {
              main.acceso_adm_fia = true
            }else{
              main.acceso_adm_fia = false
            }
          }else if (acc.permission_name == 'Ver fianzas') {
            if (acc.checked == true) {
              main.acceso_ver_fia = true
            }else{
              main.acceso_ver_fia = false
            }
          }
        })
      }
      if(perm.model_name == 'Comisiones'){
        main.acceso_dash = perm
        main.acceso_dash.permissions.forEach(function(acc){
          if (acc.permission_name == 'Comisiones') {
            if (acc.checked == true) {
              main.permiso_comisiones = true
            }else{
              main.permiso_comisiones = false
            }
          }
        })
      }
      if(perm.model_name == 'Archivos'){
        main.acceso_files = perm
        main.acceso_files.permissions.forEach(function(acc){
          if (acc.permission_name == 'Administrar archivos sensibles') {
            if (acc.checked == true) {
              main.permiso_archivos = true
            }else{
              main.permiso_archivos = false
            }
          }// Administrar adjuntos //no agregar, no eliminar, no renombrar, no marcar sensible
          if (acc.permission_name == 'Administrar adjuntos') {
              if (acc.checked == true) {
                  main.permiso_administrar_adjuntos = true
              }else{
                  main.permiso_administrar_adjuntos = false
              }
          }
        })
      }
      if(perm.model_name == 'Cotizaciones'){
        main.acceso_cotizaciones = perm
        main.acceso_cotizaciones.permissions.forEach(function(acc){
          if (acc.permission_name == 'Ver cotizaciones') {
            if (acc.checked == true) {
              main.acceso_ver_cotizaciones = true
            }else{
              main.acceso_ver_cotizaciones = false
            }
          }
        })
      }
      })
    }
    refreshUserFromStorage(false);
    $scope.decrptedtoken = usr;

    if (usr && usr.org) {
        main.userName = usr.name;
        main.user = usr.name;
        main.full_name = x.first_name + ' ' + x.last_name;
        // main.avatar = usr.avatar;
        // main.logo_mini = 'https://miurabox-public.s3.amazonaws.com/cas/'+ x.org.logo_mini;
        main.logo_mini = x.org.logo_mini;
        if(main.logo_mini == 'https://miurabox-public.s3.amazonaws.com/cas/' || main.logo_mini == 'https://miurabox.s3.amazonaws.com/cas/undefined'){
          main.logo_mini = '';
        }
        main.role = usr.role[1];
        main.org = usr.org;
        main.orgname = x.org.name.toUpperCase();
        main.permisos = $localStorage.permissions;
    } else {
        main.userName = 'Adrian';
        main.user = 'GPI';
        main.avatar = '';
        main.logo_mini = '';
        main.role = '';
        main.org = 'Test';
        main.orgname = 'Test';
    }

    if($localStorage.avatar) {
      main.avatar = $localStorage.avatar;
    }
  }

  function ChangeStatus(obj, index) {
      swal({
              title: "¿Está seguro?",
              text: "¡El cambio aplicado es irreversible!",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "¡Si, aplicar!",
              cancelButtonText: "¡No, cancelar!",
              closeOnConfirm: false,
              closeOnCancel: false
          },
          function(isConfirm) {
              if (isConfirm) {
                  var modalInstance = $uibModal.open({ //jshint ignore:line
                      templateUrl: 'app/main/receipt_type_Pago.html',
                      controller: EditPagosCtrl,
                      size: 'lg',
                      resolve: {
                          pagosModal: function() {
                              return main.pago_recibo_actual

                          }
                      },
                      backdrop: 'static', /* this prevent user interaction with the background */ 
                      keyboard: false
                  });

                  var recibo = {
                      'status': obj.status.value
                  }
                  $http.patch(obj.url, recibo).then(function(response) {
                      main.receipts[index] = response.data;
                      updatReceiptsCount();
                  });

                  swal("¡Hecho!", "El cambio se ha aplicado.", "success");
              } else {
                  $http.get(obj.url).then(function(response) {
                      main.pago_recibo_actual[index].status = response.data.status;
                  });
                  swal("Cancelado", "El cambio no se ha aplicado", "error");
                  updatReceiptsCount();
                  // window.location.reload();
              }
          });
  }

  function saveStatus(obj, index) {
      obj.status = obj.status.value;
      obj.poliza = obj.poliza.url;
      receiptService.updateReceiptService(obj)
          .then(function(data) {
              //activate();
              //toaster.success(MESSAGES.OK.CORRECTCHANGE);
              toaster.success(MESSAGES.OK.CORRECTCHANGE);
              main.receipts[index] = data.data;

          });
  }

  $scope.main.active = 0;

  $scope.showTap = function(){
    if(main.insurances.length == 0){
      $scope.main.active = 1;
      if(main.endo_vida.length == 0){
        $scope.main.active = 2;
        if(main.endo_gm.length == 0){
          $scope.main.active = 3;
          if(main.endo_danos.length == 0){
            $scope.main.active = 4;
            if(main.endo_autos.length == 0){
              $scope.main.active = 0;
            }
            else{
              $scope.main.active = 4;
            }
          }
          else{
            $scope.main.active = 3;
          }
        }
        else{
          $scope.main.active = 2;
        }
      }
      else{
        $scope.main.active = 1;
      }
    }
    else{
      $scope.main.active = 0;
    }
  if (($scope.main.vida == true)) {
      $scope.main.vida = true;
      $scope.main.active = 1
      $scope.main.gastos = false;
      $scope.main.d = false;
      $scope.main.ots = false;
    }
    if (($scope.main.gastos == true)) {
      $scope.main.gastos = true;
      $scope.main.active = 2
      $scope.main.d = false;
      $scope.main.vida = false;
      $scope.main.ots = false;
    }
    if (($scope.main.d == true)) {
      $scope.main.d = true;
      $scope.main.active = 3
      $scope.main.gastos = false;
      $scope.main.vida = false;
      $scope.main.ots = false;
    }
    if (($scope.main.autos == true)) {
      $scope.main.autos = true;
      $scope.main.active = 4
      $scope.main.gastos = false;
      $scope.main.vida = false;
      $scope.main.ots = false;
      $scope.main.d = false
    }
    if($scope.main.ots == true){
      $scope.main.ots = true;
      $scope.main.autos = false;
      $scope.main.active = 0
      $scope.main.gastos = false;
      $scope.main.vida = false;
      $scope.main.d = false
    }
  };

  /** OT Chart Controller */
  // ------------------------------------
  main.btn_all = false;
  main.oknotification = false
  main.changePolicyDashAll = changePolicyDashAll;
    function changePolicyDashAll(par,asc){
      main.vida = false
      main.gastos = false            
      main.d = false
      main.autos = false
      main.ots = true
      switch(par) {
          case 1:                  
            showTotalOt(par, asc);
            main.policy_type_asc = asc;
            main.policy_folio_asc = 0;
            main.policy_fint_asc = 0;
            main.policy_cont_asc = 0;
            main.policy_subr_asc = 0;
            main.policy_aseg_asc = 0;
            main.policy_fcre_asc = 0;
            break;
          case 2:                  
            showTotalOt(par, asc);
            main.policy_folio_asc = asc;
            main.policy_type_asc = 0;
            main.policy_fint_asc = 0;
            main.policy_cont_asc = 0;
            main.policy_subr_asc = 0;
            main.policy_aseg_asc = 0;
            main.policy_fcre_asc = 0;
            break;
          case 3:
            
            showTotalOt(par, asc);
            main.policy_fint_asc = asc;
            main.policy_type_asc = 0;
            main.policy_folio_asc = 0;
            main.policy_cont_asc = 0;
            main.policy_subr_asc = 0;
            main.policy_aseg_asc = 0;
            main.policy_fcre_asc = 0;
            break;
          case 4:                  
            showTotalOt(par, asc);
            main.policy_cont_asc = asc;
            main.policy_folio_asc = 0;
            main.policy_type_asc = 0;
            main.policy_fint_asc = 0;
            main.policy_subr_asc = 0;
            main.policy_aseg_asc = 0;
            main.policy_fcre_asc = 0;
            break;
          case 5:                  
            showTotalOt(par, asc);
            main.policy_subr_asc = asc;
            main.policy_type_asc = 0;
            main.policy_folio_asc = 0;
            main.policy_fint_asc = 0;
            main.policy_cont_asc = 0;
            main.policy_aseg_asc = 0;
            main.policy_fcre_asc = 0;
         case 6:                  
            showTotalOt(par, asc);
            main.policy_aseg_asc = asc;
            main.policy_type_asc = 0;
            main.policy_folio_asc = 0;
            main.policy_fint_asc = 0;
            main.policy_cont_asc = 0;
            main.policy_subr_asc = 0;
            main.policy_fcre_asc = 0;
            break;
         case 7:                  
            showTotalOt(par, asc);
            main.policy_type_asc = 0;
            main.policy_folio_asc = 0;
            main.policy_fint_asc = 0;
            main.policy_cont_asc = 0;
            main.policy_subr_asc = 0;
            main.policy_aseg_asc = 0;
            main.policy_fcre_asc = asc;
            break;
        }
      }
  // ----------------------------------ENDOSOS
  main.showEndV = false;
  main.changeEndDashVida = changeEndDashVida;
    function changeEndDashVida(par,asc){
      main.vida = true
      main.gastos = false            
      main.d = false
      switch(par) {
          case 1:
            showTotalOt(par, asc);
            main.vida_type_asc = asc;
            main.vida_cont_asc = 0;
            main.vida_nump_asc = 0;
            main.vida_aseg_asc = 0;
            main.vida_creac_asc = 0;
            break;
          case 2:
            showTotalOt(par, asc);
            main.vida_cont_asc = asc;
            main.vida_type_asc = 0;
            main.vida_nump_asc = 0;
            main.vida_aseg_asc = 0;
            main.vida_creac_asc = 0;
            break;
          case 3:
            showTotalOt(par, asc);
            main.vida_nump_asc = asc;
            main.vida_type_asc = 0;
            main.vida_cont_asc = 0;
            main.vida_aseg_asc = 0;
            main.vida_creac_asc = 0;
            break;
          case 4:
            showTotalOt(par, asc);
            main.vida_aseg_asc = asc;
            main.vida_cont_asc = 0;
            main.vida_type_asc = 0;
            main.vida_nump_asc = 0;
            main.vida_creac_asc = 0;
            break;
          case 5:
            showTotalOt(par, asc);
            main.vida_creac_asc = asc;
            main.vida_type_asc = 0;
            main.vida_cont_asc = 0;
            main.vida_nump_asc = 0;
            main.vida_aseg_asc = 0;
            break;
        }
      }
    main.showEndG = false;
    main.changeEndDashGastos = changeEndDashGastos;
    function changeEndDashGastos(par,asc){
      main.gastos = true
      main.vida = false
      main.d = false
      switch(par) {
          case 1:                
            showTotalOt(par, asc);
            main.gastos_type_asc = asc;
            main.gastos_cont_asc = 0;
            main.gastos_nump_asc = 0;
            main.gastos_aseg_asc = 0;
            main.gastos_creac_asc = 0;
            break;
          case 2:
            showTotalOt(par, asc);
            main.gastos_cont_asc = asc;
            main.gastos_type_asc = 0;
            main.gastos_nump_asc = 0;
            main.gastos_aseg_asc = 0;
            main.gastos_creac_asc = 0;
            break;
          case 3:
            showTotalOt(par, asc);
            main.gastos_nump_asc = asc;
            main.gastos_type_asc = 0;
            main.gastos_cont_asc = 0;
            main.gastos_aseg_asc = 0;
            main.gastos_creac_asc = 0;
            break;
          case 4:
            showTotalOt(par, asc);
            main.gastos_aseg_asc = asc;
            main.gastos_cont_asc = 0;
            main.gastos_type_asc = 0;
            main.gastos_nump_asc = 0;
            main.gastos_creac_asc = 0;
            break;
          case 5:
            showTotalOt(par, asc);
            main.gastos_creac_asc = asc;
            main.gastos_type_asc = 0;
            main.gastos_cont_asc = 0;
            main.gastos_nump_asc = 0;
            main.gastos_aseg_asc = 0;
            break;
        }
      }
    main.showEndD = false;
    main.changeEndDashDanos = changeEndDashDanos;
    function changeEndDashDanos(par,asc){
      main.d = true
      main.gastos = false
      main.vida = false
      switch(par) {
          case 1:                
            showTotalOt(par, asc);
            main.d_type_asc = asc;
            main.d_cont_asc = 0;
            main.d_nump_asc = 0;
            main.d_aseg_asc = 0;
            main.d_creac_asc = 0;
            break;
          case 2:
            showTotalOt(par, asc);
            main.d_cont_asc = asc;
            main.d_type_asc = 0;
            main.d_nump_asc = 0;
            main.d_aseg_asc = 0;
            main.d_creac_asc = 0;
            break;
          case 3:
            showTotalOt(par, asc);
            main.d_nump_asc = asc;
            main.d_type_asc = 0;
            main.d_cont_asc = 0;
            main.d_aseg_asc = 0;
            main.d_creac_asc = 0;
            break;
          case 4:
            showTotalOt(par, asc);
            main.d_aseg_asc = asc;
            main.d_cont_asc = 0;
            main.d_type_asc = 0;
            main.d_nump_asc = 0;
            main.d_creac_asc = 0;
            break;
          case 5:
            showTotalOt(par, asc);
            main.d_creac_asc = asc;
            main.d_type_asc = 0;
            main.d_cont_asc = 0;
            main.d_nump_asc = 0;
            main.d_aseg_asc = 0;
            break;
        }
      }
    main.showEndA = false;
    main.changeEndDashAutos= changeEndDashAutos;
    function changeEndDashAutos(par,asc){
      main.autos = true
      main.gastos = false
      main.vida = false
      main.d = false
      switch(par) {
          case 1:    
            showTotalOt(par, asc);
            main.a_type_asc = asc;
            main.a_cont_asc = 0;
            main.a_nump_asc = 0;
            main.a_aseg_asc = 0;
            main.a_creac_asc = 0;
            break;
          case 2:
            showTotalOt(par, asc);
            main.a_cont_asc = asc;
            main.a_type_asc = 0;
            main.a_nump_asc = 0;
            main.a_aseg_asc = 0;
            main.a_creac_asc = 0;
            break;
          case 3:
            showTotalOt(par, asc);
            main.a_nump_asc = asc;
            main.a_type_asc = 0;
            main.a_cont_asc = 0;
            main.a_aseg_asc = 0;
            main.a_creac_asc = 0;
            break;
          case 4:
            showTotalOt(par, asc);
            main.a_aseg_asc = asc;
            main.a_cont_asc = 0;
            main.a_type_asc = 0;
            main.a_nump_asc = 0;
            main.a_creac_asc = 0;
            break;
          case 5:
           showTotalOt(par, asc);
            main.a_creac_asc = asc;
            main.a_type_asc = 0;
            main.a_cont_asc = 0;
            main.a_nump_asc = 0;
            main.a_aseg_asc = 0;
            break;
        }
      }
    // ----------------------------------ENDOSOS
    function showTotalOt(order,asc) {
      main.cadena = ''
      main.last_color = 'all'
      main.orden = order;
      main.ascendente = asc;
      main.showTable = false;

      var params = {order : order, asc: asc,tipo:null};
      // $http({
      //     method: 'GET',
      //     url: url.IP + 'graficas-endosos/',
      //     params: params
      // })
      // if($scope.infoUser.staff && !$scope.infoUser.superuser){
      //   $scope.chart_endorsement = 'v2/polizas/graficas-endosos/';
      $scope.chart_endorsement = 'graficas-endosos/';
      $http({
          method: 'POST',
          url: url.IP + $scope.chart_endorsement,
          data: params
      })
      .then(
          function success(request) {
            main.endo = request.data.results;
            if(main.endo){
              // main.show_paginationEndo = true;  
              main.endo_pagination = {
                  count: request.data.count,
                  previous: request.data.previous,
                  next: request.data.next
              };                
            } else{
              // main.show_paginationEndo = false;
            }
          },
          function error(error) {

          }
      )
      .catch(function(e){
          console.log(e);
      });

      insuranceService.getOTsResume(order,asc)
          .then(function(req) {
            main.insurances.length = [];

            var data = req.data;
            // $scope.show_ots_pagination = true;
            main.otPending = data;

            var today = new Date();
            today = today.getTime();
            data.forEach(function(item) {
              var fechaInicio = new Date(item.created_at).getTime();
              var diff = today - fechaInicio;
              item.antiguedad = parseInt(diff/(1000*60*60*24));
              main.insurances.push(item);
              if(main.insurances.length == req.data.length){
                $scope.showTap();
              }
            });
            main.insurances.forEach(function(value){
              if (value.old_policies) {
                value.old_policies.forEach(function(old){
                  if (old) {
                    if (value.id == old.base_policy.id) {
                      if (value.renewed) {
                        value.historic =' Renovada';
                      }else{
                        value.historic = ' por renovar'
                      }
                    }else if (value.id == old.new_policy.id) {
                      value.historic ='de Renovación';
                    }else{
                      value.historic = ' nueva'
                    }
                  }else{
                    value.historic = ' nueva'
                  }

                })
                if (value.historic) {
                }else{
                  value.historic = ' nueva'
                }
              }
              // $http({
              //   method: 'GET',
              //   url: url.IP + 'historic-policies/',
              //   params: {
              //     actual_id: value.id
              //   }
              // }).then(function success(response) {
              //   if(response.data.results.length){
              //     response.data.results.forEach(function function_name(old) {         
              //       if(old.base_policy){
              //         if(value.id == old.new_policy.id){
              //           if (old.new_policy) {
              //             value.historic ='de Renovación';
              //           }
              //         } else {
              //             value.historic = ' nueva'
              //         }
              //       }else{
              //         value = ''
              //       }
              //     })
              //   }else{
              //     value.historic = ' nueva'
              //   }
              // })
            })
            main.ot_pagination = req.config;
            // main.show_paginationOt = true;
            // main.show_ots_pagination = true;
            main.totalPendingOts = {
                size: 0,
                collection: [],
                red: [],
                orange: [],
                yellow: [],
                green: [],
            };
            main.totalEndorsement = {
                size: 0,
                collection: [],
                red: [],
                orange: [],
                yellow: [],
                green: []
            };
            if (data) {
                data.forEach(function(elem) {
                  if (elem.status === 1) {
                    elem.colorDate = '1';
                    main.totalPendingOts.collection.push(elem);
                    var diff = moment().diff(moment(elem.created_at), 'days');
                    if (diff <= 6) {
                        main.totalPendingOts.green.push(elem);
                        main.data[0] += 1;
                        main.totalPendingOts.size += 1;
                    } else if (diff >= 7 && diff <= 13) {
                        main.totalPendingOts.yellow.push(elem);
                        main.data[1] += 1;
                        main.totalPendingOts.size += 1;
                    } else if (diff >= 14 && diff <= 20) {
                        main.totalPendingOts.orange.push(elem);
                        main.data[2] += 1;
                        main.totalPendingOts.size += 1;
                    } else if (diff >= 21) {
                        main.totalPendingOts.red.push(elem);
                        main.data[3] += 1;
                        main.totalPendingOts.size += 1;
                    }
                  }
                });
            }
            if(main.endorsements) {
              main.endorsements.forEach(function (elem) {
                if (elem.status == 1) {
                  main.totalEndorsement.collection.push(elem);
                  main.totalEndorsement.size += 1;

                  var diff = moment().diff(moment(elem.created_at), 'days'); //jshint ignore:line
                  if (diff <= 6) {
                      main.totalEndorsement.green.push(elem);
                      main.data[0] += 1;
                  } else if (diff >= 7 && diff <= 13) {
                      main.totalEndorsement.yellow.push(elem);
                      main.data[1] += 1;
                  } else if (diff >= 14 && diff <= 20) {
                      main.totalEndorsement.orange.push(elem);
                      main.data[2] += 1;
                  } else if (diff >= 21) {
                      main.totalEndorsement.red.push(elem);
                      main.data[3] += 1;

                  }
                }
              });
            }
          });

      var validPolicyNumber = [];
      main.titleID = null;
      main.title = '';
      $('html, body').animate({
          scrollTop: $('#polizas').offset().top
      }, 'slow');
      showAndHidePanels(true, false, false);
    }
    main.exportDataAll = exportDataAll;
    function exportDataAll(param){
      if(main.last_color){
        var tiipo = main.last_color;
      }
      else{
        var tiipo = 'all';
      }
      main.btn_all = true
      if (main.cadena) {
        var params = {
              order: main.orden ? main.orden : 1,
              asc: main.ascendente ? main.ascendente : 1,
              tipo: tiipo,
              cadena: main.cadena
            }
      }else{
        var params = {
              order: main.orden ? main.orden : 1,
              asc: main.ascendente ? main.ascendente : 1,
              tipo: tiipo
            }
      }
      if (param == 1){
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //   $scope.excel_policy = 'v2/polizas/excel-graficas-polizas/';
        $scope.excel_policy = 'excel-graficas-polizas/';
        $http({
            method: 'GET',
            url: url.IP + $scope.excel_policy,
            params: params,
            headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
            responseType: "arraybuffer"
          })
          .then(
            function success(data) {
              if(data.status == 200){
                var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                saveAs(blob, 'Reporte_Dash_OTs.xls');
              } else {
                SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
              }
        });
      }
      else if (param == 2){
        if (main.cadena) {
          var params = {
                order: main.orden ? main.orden : 1,
                asc: main.ascendente ? main.ascendente : 1,
                tipo: tiipo,
                cadena: main.cadena
              }
        }else{
          var params = {
                order: main.orden ? main.orden : 1,
                asc: main.ascendente ? main.ascendente : 1,
                tipo: tiipo
              }
        }
        // if($scope.infoUser.staff && !$scope.infoUser.superuser){
        //   $scope.excel_endorsement = 'v2/polizas/excel-graficas-endosos/';
        $scope.excel_endorsement = 'excel-graficas-endosos/';
        $http({
              method: 'GET',
              url: url.IP + $scope.excel_endorsement,
              params: params,
              headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
              responseType: "arraybuffer"
            })
            .then(
              function success(data) {
                if(data.status == 200){
                  var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                  saveAs(blob, 'Reporte_Dash_OTsEndosos.xls');
                } else {
                  SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
                }
          });
      }
    }
    main.exportDataGral = exportDataGral;
    function exportDataGral(param){
      var lots = Ladda.create( document.querySelector( '.ladda-button4' ) );
      lots.start();
      if(main.last_color){
        var tiipo = main.last_color;
      }
      else{
        var tiipo = 'all';
      }
      main.btn_all = true
      if (main.cadena) {
        var params = {
              order: main.orden ? main.orden : 1,
              asc: main.ascendente ? main.ascendente : 1,
              tipo: tiipo,
              cadena: main.cadena
            }
      }else{
        var params = {
              order: main.orden ? main.orden : 1,
              asc: main.ascendente ? main.ascendente : 1,
              tipo: tiipo
            }
      }
      // if (param == 1){
      // if($scope.infoUser.staff && !$scope.infoUser.superuser){
      //   // $scope.excel_policy_ = 'v2/polizas/excel-graficas-otsendosos/';
      //   $scope.excel_policy_ = 'service_reporte-v2-otsEndososDash-excel'
      $scope.excel_policy_ = 'service_reporte-otsEndososDash-excel';
      $http({
          method: 'GET',
          url: url.IP + $scope.excel_policy_,
          params: params,
          headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
          responseType: "arraybuffer"
        })
        .then(
          function success(data) {
            if(data.status == 200){
              lots.stop();
              var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
              saveAs(blob, 'Reporte_Dash_OTs_Endosos.xls');
            } else {
              lots.stop()
              SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
            }
        });
      // }
    }

    $scope.exportDataGralTask = function(param){
      if(main.last_color){
        var tiipo = main.last_color;
      }
      else{
        var tiipo = 'all';
      }
      var data = {
        order: main.orden ? main.orden : 1,
        asc: main.ascendente ? main.ascendente : 1,
        tipo: tiipo
      }

      // if($scope.infoUser.staff && !$scope.infoUser.superuser){
      //   $scope.excel_endorsement = 'v2/polizas/service_reporte-taskdashReport-excel';
      $scope.excel_endorsement = 'service_reporte-taskdashReport-excel';
      $http({
        method: 'POST',
        url: url.IP + $scope.excel_endorsement,
        data: data,
        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
        responseType: "arraybuffer"
      })
      .then(
        function success(data) {
          if(data.status == 200){
            var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
            saveAs(blob, 'Reporte_Dash_Tareas.xls');
          } else {
            SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
          }
        });
    }

    function editInsurance(insurance) {
        main.insurance = insurance;
        editPolicyModal();
    }

    function showAndHidePanels(first, second, third) {
        main.policyTable = first;
        main.endorsementTable =first;
        main.coverageTable = second;
        main.renewalTable = third;
    }

    main.$onDestroy = function() {
      main.socket.disconnect();
    };



    function renewPolicy(policy) {
      var modalInstance = $uibModal.open({ 
        templateUrl: 'app/renovaciones/renovaciones.modal.html',
        controller: 'RenewalModalCtrl',
        size: 'lg',
        resolve: {
          user: function(){
            return usr;
          },
          myPolicy: function() {
            return policy;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */ 
        keyboard: false
      }).result.then(function(argument) {
      }, function(argument) {
        if(argument != 'backdrop click' && argument != 'cancel'){
          main.policies.splice(main.policies.indexOf(policy), 1);
        }
      })
    }

    $scope.createTask = function(){
      $scope.open_in_same_tab_natural('Crear tarea', 'task.task', {}, 0);
      $state.go('task.task', {id_task: -1, main_comming: false} ) 
    }
    
    $scope.showTask = function(){
      main.policyTable = false;
      main.coverageTable = false;
      main.coverageModal = false;
      main.notas = false;
      main.renewalTable = false;
      main.sinisterTable = false;

      $http({
        method: 'GET',
        url: url.IP + 'chart-tasks/'}).then(function(response) {
          $scope.chartsTasks = response.data;
      });
    };

    $scope.hide_task = false;
    $scope.hideTask = function(param){
      $scope.hide_task = param;
    };

    $scope.showTableTasks = function(type){
      $scope.typeGraphyc = ''
      main.showTable = true;
      main.policyTable = false;
      main.coverageTable = false;
      main.coverageModal = false;
      main.notas = false;
      main.renewalTable = false;
      main.sinisterTable = false;
      main.showTableQ=false;
      main.titleID=type;
      if(type == 1){
        var parType = 'green'
        $scope.typeGraphyc = 'En tiempo'
      }else if(type == 2){
        var parType = 'yellow';
        $scope.typeGraphyc = 'Atención'
      }else if(type == 3){
        var parType = 'orange';
        $scope.typeGraphyc = 'Atención urgente'
      }else if(type == 4){
        var parType = 'red';
        $scope.typeGraphyc = 'Urgente'
      }else{
        var parType = 'total'
        $scope.typeGraphyc = 'General'
      }
      main.last_color = parType;

      $scope.params = {
        asc: 1,
        order: 1,
        tipo: parType
      }

      dataFactory.post('graficas-tasks/', $scope.params)
      .then(function success(response) {
        if (response.data) {
          $scope.tickets = response.data.results;
          $scope.tickets.forEach(function(item){
            item.model = 22;
            item.id_reference = item.id;
          });
        }
      });
    };

    main.color =0
    $scope.getLog = function(quotation) {
      dataFactory.get('get-specific-log', {'model': 30, 'associated_id': quotation.id})
      .then(function success(response) {
        var modalInstance = $uibModal.open({ //jshint ignore:line
          templateUrl: 'app/cobranzas/log.modal.html',
          controller: 'LogCtrl',
          size: 'lg',
          resolve: {
            log: function() {
              return response.data;
            }
          },
          backdrop: 'static', /* this prevent user interaction with the background */
          keyboard: false
        });
        modalInstance.result.then(function(receipt) {
          vm.receipts.splice(index, 1);
          activate();
        });
      })
    };
    /** Quotations Graphyc */
    $scope.showQuotations = function(){
      main.policyTable = false;
      main.coverageTable = false;
      main.coverageModal = false;
      main.notas = false;
      main.renewalTable = false;
      main.sinisterTable = false;
      main.taskTable = false;
      main.showTable=false;

      $http({
        method: 'GET',
        url: url.IP + 'chart-quotations/'}).then(function(response) {
          $scope.chartsQuotations = response.data;
      });
    };
    $scope.showpag=false;

    function unicodeToChar(text) {
      return text.replace(/\\u[\dA-F]{4}/gi, 
        function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
    }
    $scope.showTableQuotations = function(type,page){
      $scope.typeGraphyc = ''
      main.showTable=false;
      main.showTableQ = true;
      main.policyTable = false;
      main.coverageTable = false;
      main.coverageModal = false;
      main.notas = false;
      main.renewalTable = false;
      main.sinisterTable = false;
      main.taskTable = false;
      main.titleID=type;
      if(type == 1){
        var parType = 'green'
        $scope.typeGraphyc = 'En tiempo'
      }else if(type == 2){
        var parType = 'yellow';
        $scope.typeGraphyc = 'Atención'
      }else if(type == 3){
        var parType = 'orange';
        $scope.typeGraphyc = 'Atención urgente'
      }else if(type == 4){
        var parType = 'red';
        $scope.typeGraphyc = 'Urgente'
      }else{
        var parType = 'total'
        $scope.typeGraphyc = 'General'
      }
      main.last_color = parType;

      $scope.params = {
        asc: 1,
        order: 1,
        tipo: parType,
        page:page ? page:1
      }

      dataFactory.post('graficas-quotations/', $scope.params)
      .then(function success(response) {
        if (response.data) {
          $scope.obtenerPaginacion(response.data, page ? page : 1);
          $scope.showpag=true;
          $scope.quotations = response.data.results;
          $scope.quotations = $scope.quotations.map(function(item){
              item.ramo = item.ramo ? JSON.parse(unicodeToChar(item.ramo.replaceAll('\'','"')))['name'] : ''; 
              item.subramo = item.subramo ? JSON.parse(unicodeToChar(item.subramo.replaceAll('\'','"')))['name'] : ''; 
              if (item.aseguradora){  
                item.aseguradora = item.aseguradora.map(function(itemAseg){
                    itemAseg = itemAseg.replaceAll('"\\','').replaceAll('\\"','').replaceAll('\\\\','')
                    if (itemAseg){
                        itemAseg = unicodeToChar(itemAseg.replaceAll('\'','"'));
                        try{
                            itemAseg = JSON.parse(itemAseg.substring(1).slice(0, -1))['alias'];
                        } catch(err){
                            itemAseg = JSON.parse(itemAseg)['alias'];
                        }
                    }
                    return itemAseg;
                })                
                }
              return item
          });
        }
      });
    };
    $scope.exportDataGralQuotations = function(param){      
      var data = {
        tipo: main.titleID ? main.titleID : 'todos'
      }
      $http({
        method: 'POST',
        url: url.IP + 'service-reporte-quotationsDashReport-excel',
        data: data,
        headers: {'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}, 
        responseType: "arraybuffer"
      })
      .then(
        function success(data) {
          if(data.status == 200){
            var blob = new Blob([data.data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
            saveAs(blob, 'Reporte_Dash_Cotizaciones.xls');
          } else {
            SweetAlert.swal("Error", "Ha ocurrido un error al descargar el reporte", "error")
          }
        });
    }
    $scope.obtenerPaginacion = function(pagesdata, pagina){
      $scope.paginacion = {
        count: pagesdata['count'],
        previous: pagesdata['previous'],
        next: pagesdata['next'],
        totalPaginas: [],
        paginaInicio: 0,
        paginaActual: pagina,
        paginaFin: 0
      }
      var numeroPaginas = Math.ceil($scope.paginacion['count'] / 10);
      var i = 0;      
      i = pagina - 5;
      if(i <= 0){
        i = 0;
      }
  
      for(i; i < numeroPaginas; i++){
        if($scope.paginacion['totalPaginas'].length <= 5){
          $scope.paginacion['totalPaginas'].push(i + 1);
        }
      }
      if($scope.paginacion['totalPaginas'].length > 5){
        $scope.paginacion['paginaInicio'] = $scope.paginacion['totalPaginas'] - 5;
      }else{
        $scope.paginacion['paginaInicio'] = 1;
      }
      if($scope.paginacion['totalPaginas'].length > 5){
        $scope.paginacion['paginaFin'] = 5;
      }else{
        $scope.paginacion['paginaFin'] = $scope.paginacion['totalPaginas'].length;
      }
    }

    $scope.selecionPagina = function (pagina){
      $scope.showTableQuotations(main.titleID,pagina);
    }

    $scope.anteriorPagina = function(){
      if($scope.paginacion['paginaActual'] > 1){
          $scope.showTableQuotations(main.titleID,$scope.paginacion['paginaActual'] - 1)
      }
    }

    $scope.siguientePagina = function(){
      var numeroPaginas = Math.ceil($scope.paginacion['count'] / 10);
      if(numeroPaginas > $scope.paginacion['paginaActual']){
          $scope.showTableQuotations(main.titleID,$scope.paginacion['paginaActual'] + 1)
      }
    }
    $scope.updatePrimaAseguradora = function(quotation){
      $http.patch(quotation.url, quotation)
      .then(function success(response) {
          console.log(response);
        
      });
    }
    /** End Graphyc */
    main.activate = activate;
    main.coverageModal = false;
    /** Fill Color charts with data */
    function activate() {
      $scope.soloInfo=true;
      /* Información de usuario */
      $scope.infoUser = $localStorage.infoUser;
      if ($localStorage.url_operation == '/operacion.semanal') {
        $state.go('operacion.semanal');
      }
      main.mc_permission_user = $localStorage.mc_permission_user;
      if (main.renewalTable) {
        main.renewalTable = false;
      }
      if (main.sinisterTable) {
        main.sinisterTable = false;
      }
      if (main.policyTable) {
        main.policyTable = false;
      }
      if (main.coverageTable) {
        main.coverageTable = false;
      }
      if (main.notas) {
        main.notas = false;
      }
      main.endorsements = [];
      main.otPending = [];
      main.totalPendingOts = [];
      // TODO:  PERMISOS DE CARTAS
      // dataFactory.get('has-view-cartas-permission')
      // .then(function(req) {
      //   if(req.status == 200) {
      //     main.view_cartas = req.data;
      //   }
      // });


      // dataFactory.get('has-add-cartas-permission')
      // .then(function(req) {
      //   if(req.status == 200) {
      //     main.add_cartas = req.data;
      //   }
      // });

      // PERMISOS SINIESTROS
      // dataFactory.get('has-view-siniestros-permission')
      // .then(function(req) {
      //   if(req.status == 200) {
      //     main.view_siniestros = req.data;
      //   }
      // });

      // dataFactory.get('has-add-siniestros-permission')
      // .then(function(req) {
      //   if(req.status == 200) {
      //     main.add_siniestros = req.data;
      //   }
      // });

      // dataFactory.get('has-add-emails-permission')
      // .then(function(req) {
      //   if(req.status == 200) {
      //     main.add_emails = req.data;
      //   }
      // });


      // Conexión a socket.io
      if ($rootScope.usr) {
        if (main.socket) {   
            main.socket.emit('subscribe', $rootScope.usr['name']);      
            main.socket.on($rootScope.usr['name'], function(response) {
                try {
                    response = JSON.parse(response.replace(/'/g, '"'));
                    SweetAlert.swal({
                        title: 'RECORDATORIO PROGRAMADO - ' + response.title,
                        icon: 'success',
                        text: 'Revise en la sección de notificaciones en la barra superior a la derecha',
                        timer: 7000
                    });
                    $scope.loadingValidate = false;
                    $scope.validado = true;
                } catch (e) {
                  console.error('Error processing WebSocket response:', e);
                }
            });
        }
      }
      if ($rootScope.usr){
        if (main.socket) {      
          function setupWebSocket() {       
              main.socket.emit('subscribe', 'notificaciones_' + $rootScope.usr['name']);              
              main.socket.on('notificaciones_' + $rootScope.usr['name'], function(response) {                
                  try {
                      response = JSON.parse(response.replace(/'/g, '"'));
                      main.notifications['count'] = response.count;
                      $rootScope.notificationscount = main.notifications['count'];
                      toaster.success('Nueva notificación');         
                  } catch (e) {
                      console.error('Error parsing response:', e);
                  }          
                  $scope.loadingValidate = false;
                  $scope.validado = true;
              });
          }          
          // Call the setup function
          setupWebSocket();
        }       
      }
        
        
      main.getBirthdays()
      if ($location.path() == '/login/auth') {
        appStates.states = []
      }
      dataFactory.get('notifications-count').then(function(response){
        main.notifications['count'] = response.data.data;
        $rootScope.notificationscount = response.data.data;
        if (main.notifications['count'] == 0 && response.data.count31 > 0) {
          main.notifications['count'] = response.data.count31
          $rootScope.notificationscount = response.data.count31;
          main.color =1
        }
        // $rootScope.recordatorioscount = response.data.recordatorios//notificaciones
        //recordatrios no vistos
        $http.get(url.IP + 'recordatorios/mis-registros-automaticos',{
          params : {'param':'hoy','novistos':true,'page':  1}
        })
        .then(function(response) {
          $rootScope.recordatorioscount = response.data.conteonovistoshoy
        }, function(error){
        }).catch(function(error){
        });
        main.dataNotificatiosn = response.data.datos;
        if (main.dataNotificatiosn) {
          if (main.dataNotificatiosn.length >0 && main.oknotification ==false) {
            main.oknotification = true
            SweetAlert.swal({
              title: 'Su usuario tiene notificaciones de Recordatorios pendientes',
              icon: 'success',
              text: 'Revise en la sección de notificaciones en la barra superior a la derecha',
              timer: 7000
            });
          }
        }

        getCarousel();
        // Hacer el endpoint para las notificacones del usuario no leidas y poner la cuenta en el notifications.count
      })
      
      if(!$localStorage.viewed_changes){
        $localStorage.viewed_changes = false;
        main.viewed_changes = false;
      } else {
        $localStorage.viewed_changes = true;
        main.viewed_changes = true;
      }

      /* Obtiene rol del usuario para validaciones*/
      try{
        main.loginInfo = JSON.parse($localStorage.loginInfo)
      }
      catch(err){}

      if($sessionStorage.user) {
        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var usr = JSON.parse(decryptedUser);
        $rootScope.usr = usr;

        if ($rootScope.usr.cobranza_pendiente) {
          $scope.licencia = $rootScope.usr.cobranza_pendiente;
        }else{
          $scope.licencia = false;
        }
      }
    }

    /**
     * Click on a section of the graph
     * @param  points
     */
    function onOtEvent(points) {
      // $scope.onOtEvent = function(points) {
      if(points.length > 0) {
          if (points[0].label === main.labels[0]) {
              main.insurances = main.totalPendingOts.green;
              // main.endorsements = main.totalEndorsement.green;
          } else if (points[0].label === main.labels[1]) {
              main.insurances = main.totalPendingOts.yellow;
          } else if (points[0].label === main.labels[2]) {
              main.insurances = main.totalPendingOts.orange;
          } else if (points[0].label === main.labels[3]) {
              main.insurances = main.totalPendingOts.red;
          }

          $('html, body').animate({
              scrollTop: $('#cobranza').offset().top
          }, 'slow'); //jshint ignore:line
          showAndHidePanels(true, false, false);
      }
    }

    // points, evt
    function onContractorEvent() {
        openOtModal();
    }

    function logout() {

      $http.post(url.IP + 'guardar-firebase-token/',{'token':'', 'action':'delete'}).then(function(response) {

        }).catch(function(error) {
          console.log('error firebase delete token', error)
        });
        setTimeout(function() {
          reset();
        }, 100);
        
    }

    function reset(){
      try {
        $window.localStorage.setItem('saam_auth_event', JSON.stringify({ type: 'logout', timestamp: Date.now() }));
      } catch (error) {
        console.warn('No se pudo notificar el cierre de sesión a otras pestañas', error);
      }
      $localStorage.$reset();
        // if($localStorage.car_info) {
        //   $window.localStorage.removeItem('car_info');
        // } 

        // if($localStorage.client) {
        //    $localStorage.removeItem('client');
          
        // }
        // // $localStorage.removeItem('show_quote_selected');
        // // $localStorage.removeItem('emision_result');
        // // $localStorage.removeItem('insurance_selected');
        // $localStorage.removeItem('postData');
        // $localStorage.removeItem('services');
        // $localStorage.removeItem('servicesData');
        $window.localStorage.clear();
        // $localStorage.clear();

        $sessionStorage.$reset();
        $state.go('login.login');
        Idle.unwatch();
    }

    function block() {
       $state.go('block');
    }

    /******************************************************
     * Modals                                             *
     * openOtModal - Controller ModalOtInfoCtrl           *
     * ModalOtInfoCtrl - Controller PolicyModal           *
     * otCreatorModalEvent - Controller ButtonsCtrl       *
     * modifyRecordsModalEvent - Controller modifyOTCtrl  *
     * payReceiptsModalEvent - Controller PayReceiptsCtrl *
     ******************************************************/

    function openOtModal(point) {
        main.otModalPoint = point;
        var modalInstance = $uibModal.open({ //jshint ignore:line
            templateUrl: 'templates/otInfo.html',
            controller: ModalOtInfoCtrl,
            ////windowClass: 'animated fadeIn',
            size: 'lg',
            resolve: {
            from: function(){
                return null;
              }
            },
            backdrop: 'static', /* this prevent user interaction with the background */ 
            keyboard: false
        });
    }

    function editPolicyModal() {
        var modalInstance = $uibModal.open({ //jshint ignore:line
            templateUrl: 'templates/editPolicy.html',
            controller: PolicyModal,
            ////windowClass: 'animated fadeIn',
            size: 'lg',
            resolve: {
            from: function(){
                return null;
              }
            },
            backdrop: 'static', /* this prevent user interaction with the background */ 
            keyboard: false
        });
    }
    //toaster.success("test");

    // Editando Orden de Trabajo ______________________
    function editInsuranceModal(insurance) {
        var data = {
            myInsurance: insurance,
            container: main.insurances,
        };


        // modalService.defaultPath(data)
        //     .then(function(msg) {
        //          activate();
        //     })
        //     .catch(function(msg) {
        //       activate();
        //     });
      var modalInstance = $uibModal.open({
        templateUrl: 'app/modals/modal.overview.html',
        controller: 'modalOverview',
        controllerAs: 'vm',
        ////windowClass: 'animated fadeIn',
        size: 'lg',
        resolve: {
          user: function(){
            return usr;
          },
          myInsurance: function() {
            return insurance;
          },
          container: function() {
            return main.insurances;
          },
          insuranceData: function() {
            // return data.myInsurance;
            return data;
          }
        },
        backdrop: 'static', /* this prevent user interaction with the background */ 
        keyboard: false
      });
    }

    // ir a colectividades
    function goToColectivities () {

    }


    // modal crear OT
    function otCreatorModalEvent(param) {
      if(main.acceso_adm_ot | main.acceso_adm_pol) {
        if(param == 1) {
          $scope.open_in_same_tab_natural('Creación póliza', 'polizas.create', {}, 0);
          $state.go('polizas.create');
        } else if(param == 2) {
          $scope.open_in_same_tab_natural('Creación póliza', 'colectividades.main', {}, 0);
          $state.go('colectividades.main');
        }
        $localStorage.tab_states = appStates.states;
        
        var params = { 'endosoId': endorsement.id }
        $state.go($scope.route_for_new_tab, params);


        // if(param == 1) {
        //   $state.go('polizas.create');
        // } else if(param == 2) {
        //   $state.go('colectividades.main');
        // }
      }
    }

    function siniestersMoldalReport () {      
      $state.go('siniestros.accidentes');
    }

    function ModalCreateEndorsement() {       
      $state.go('endosos.endosos');
    }

    function modifyRecordsModalEvent() {
        var modalInstance = $uibModal.open({ //jshint ignore:line
            templateUrl: 'app/modals/modal.modify-policy.html',
            controller: modifyOTCtrl,
            ////windowClass: 'animated fadeIn',
            size: 'lg',
            resolve: {
            from: function(){
                return null;
              }
            },
            backdrop: 'static', /* this prevent user interaction with the background */ 
            keyboard: false
        });
    }

    function openWhatsapp(siniestro) {
      if (!main.whatsappWebEnabled || !siniestro) {
        return;
      }
      var phone = siniestro.contratante_phone_number ||
        (siniestro.poliza && (siniestro.poliza.contractor_phone_number || siniestro.poliza.contractor_phone));
      var info = {
        contratante: siniestro.contratante || (siniestro.poliza && siniestro.poliza.contractor),
        contratante_phone_number: phone
      };
      siniestroWhatsappService.open({
        siniestro: siniestro,
        poliza: siniestro.poliza,
        info: info
      });
    }

    main.siniesterInfo = function (parItem) {
      if(main.acceso_adm_sin){
        if(parItem.ramo == 'Daños (Autos)') {
          $scope.open_in_same_tab_natural('Información siniestros', 'siniestros.auto_info', {siniestroId: parItem.id}, parItem.id);
          // $state.go('siniestros.auto_info', {siniestroId: parItem.id});
        } else if(parItem.ramo == 'Vida') {
          $scope.open_in_same_tab_natural('Información siniestros', 'siniestros.vida_info', {siniestroId: parItem.id}, parItem.id);
          // $state.go('siniestros.vida_info', {siniestroId: parItem.id});
        } else if(parItem.ramo == 'Accidentes y Enfermedades') {
          $scope.open_in_same_tab_natural('Información siniestros', 'siniestros.info', {siniestroId: parItem.id}, parItem.id);
          $state.go('siniestros.info', {siniestroId: parItem.id});
        }else if(parItem.ramo == 'Daños (no auto)') {
          $scope.open_in_same_tab_natural('Información siniestros', 'siniestros.danio_info', {siniestroId: parItem.id}, parItem.id);
          $state.go('siniestros.danio_info', {siniestroId: parItem.id});
        }
      }
    }

    function payReceiptsModalEvent() {
      $scope.open_in_same_tab_natural('Pagar recibos', 'cobranzas.recibospendientes', {}, 0);
      // $state.go('cobranzas.recibospendientes');

      // var modalInstance = $uibModal.open({ //jshint ignore:line
      //     templateUrl: 'app/modals/modal.receipts.html',
      //     controller: 'CobranzasCtrl',
      //     controllerAs: 'vm',
      //     ////windowClass: 'animated fadeIn',
      //     size: 'lg'
      // });

    }

    $scope.getSelectedCodes = function (tipopolizas) {
      if(tipopolizas){
        return tipopolizas
          .filter(function (t) {
            return t.selected;
          })
          .map(function (t) {
            return t.code;
          });
      }else{
        return [0]
      }
    };
    $scope.filtrosSubramos = function(){
      var modalInstance = $uibModal.open({
        templateUrl: 'app/modals/filtros_subramos_dash.html',
        controller: FiltrosSubramosModalCtrl,
        size: 'md',
        resolve: {
        },
      backdrop: 'static', /* this prevent user interaction with the background */ 
      keyboard: false
      });

      modalInstance.result.then(function(result) {
        var payload = result['ramos'].map(function(item){
          return item.subramo_code
        })
        var seleccionados = $scope.getSelectedCodes(result['tipopoliza']);
        if ($sessionStorage.token !== undefined) {
          $scope.datatosend={
            'subramos':payload
          }
          if(seleccionados){
            $scope.datatosend['tipopoliza_dashboard']=seleccionados;
          }
          $http.post(url.IP + 'filtros-subramos-dash/', $scope.datatosend).then(function(response){
            toaster.success('Información actualizada');
            // $scope.has_sr_conf = result && result.length > 0 ? true: false;
            // location.reload();
          })
        }
      });
    }

    function FiltrosSubramosModalCtrl($scope, $uibModalInstance){
      $scope.tipopoliza_toselect = [
        {
          code: 0,
          name: 'Todos'
        },{
          code: 1,
          name: 'Individual'
        },{
          code: 3,
          name: 'Grupo'
        },{
          code: 11,
          name: 'Colectiva'
        },{
          code: 7,
          name: 'Fianzas'
        }
      ];
      $scope.subramos_toselected = [
        {
          subramo_code: 9,
          subramo_name: 'Automóviles'
        },{
          subramo_code: 3,
          subramo_name: 'Gastos Médicos'
        },{
          subramo_code: 2,
          subramo_name: 'Accidentes Personales'
        }, {
          subramo_code: 1,
          subramo_name: 'Vida'
        }, {
          subramo_code: 7,
          subramo_name: 'Incendio'
        }, {
          subramo_code: 4,
          subramo_name: 'Salud'
        }, {
          subramo_code: 10,
          subramo_name: 'Crédito'
        }, {
          subramo_code: 11,
          subramo_name: 'Crédito a la Vivienda'
        },
        {
          subramo_code: 13,
          subramo_name: 'Diversos'
        },
        {
          subramo_code:12,
          subramo_name: 'Garantía Financiera'
        },
        {
          subramo_code:8,
          subramo_name: 'Agrícola y de Animales'
        },
        {
          subramo_code:6,
          subramo_name: 'Marítimo y Transportes'
        },
        {
          subramo_code:5,
          subramo_name: 'Responsabilidad Civil y Riesgos Profesionales'
        },
        {
          subramo_code:14,
          subramo_name: 'Terremoto y Otros Riesgos Catastróficos'
        }
      ];
      $scope.cancel = cancel;
      $scope.saveConfig = saveConfig;
      $scope.ramos = [];
      if ($sessionStorage.token !== undefined) {
        $http.get(url.IP + 'filtros-subramos-dash/').then(function(response){
          if(response && response.data && response.data.data){
            response.data.data.forEach(function(item){
              $scope.subramos_toselected.forEach(function(sr){
                if (sr['subramo_code'] == item ){
                  $scope.ramos.push(sr);
                }
              })
            })
          }
          if(response && response.data && response.data.tipopoliza){
            $scope.setTiposGuardados(response.data.tipopoliza);
          }
        })
      }
      $('.js-example-basic-multiple').select2();
      
      angular.element(document).ready(function(){
        $('.js-example-basic-multiple').select2();
      });
      // asiganr los seleccionados guardados
      $scope.setTiposGuardados = function (tiposGuardados) {
        // angular.forEach($scope.tipopoliza_toselect, function (tipo) {
        //   tipo.selected = tiposGuardados.includes(tipo.code);
        // });
        // Reinicia todo
        angular.forEach($scope.tipopoliza_toselect, function (tipo) {
          tipo.selected = false;
        });

        // Marca los guardados (si existen)
        if (tiposGuardados && tiposGuardados.length) {
          angular.forEach($scope.tipopoliza_toselect, function (tipo) {
            if (tiposGuardados.includes(tipo.code)) {
              tipo.selected = true;
            }
          });
        }

        // Si no hay ninguno seleccionado, marca la opción "Todos"
        var algunaSeleccionada = $scope.tipopoliza_toselect.some(function (t) {
          return t.selected;
        });
        if (!algunaSeleccionada) {
          var todos = $scope.tipopoliza_toselect.find(function (t) {
            return t.code === 0;
          });
          if (todos) todos.selected = true;
        }

      };
      // Función que maneja el click de cada checkbox
      $scope.toggleTipo = function (item) {
        if (item.code === 0) {
          // Si selecciona "Todos", deselecciona los demás
          if (item.selected) {
            angular.forEach($scope.tipopoliza_toselect, function (t) {
              if (t.code !== 0) t.selected = false;
            });
          }
        } else {
          // Si selecciona cualquier otro, deselecciona "Todos"
          var todos = null;
          for (var i = 0; i < $scope.tipopoliza_toselect.length; i++) {
            if ($scope.tipopoliza_toselect[i].code === 0) {
              todos = $scope.tipopoliza_toselect[i];
              break;
            }
          }

          if (todos && todos.selected) {
            todos.selected = false;
          }
        }
      };
      function cancel() {
        $uibModalInstance.dismiss('cancel');
      }

      function saveConfig() {
        $scope.data_ = {
          ramos: $scope.ramos,
          tipopoliza: $scope.tipopoliza_toselect
        };
        $uibModalInstance.close($scope.data_);
      }
    }

    $scope.gotoCapturarSiniestro = function(param){
      $scope.open_in_same_tab_natural('Crear siniestro', param, {}, 0);
    }
    
    function crearEndoso() {
      $scope.open_in_same_tab_natural('Crear endoso', 'endorsement.endorsement', {}, 0);
    }
    function goToCotization() {
      $scope.open_in_same_tab_natural('Cotizaciones', 'cotizacion.cotizacion', {}, 0);
    }
    
    function renewalModal(policy) {
   
        var modalInstance = $uibModal.open({ //jshint ignore:line
            templateUrl: 'app/renovaciones/renovaciones.modal.html',
            controller: 'RenewalModalCtrl',
            ////windowClass: 'animated fadeIn',
            size: 'lg',
            resolve: {
                myPolicy: function() {
                    return policy;
                }
            },
            backdrop: 'static', /* this prevent user interaction with the background */ 
            keyboard: false
        });
    }

    // PayReceiptsCtrl
    ///////////////////////////////////////////////
    ////////////////////////////////////////////////

    /**
     * Show insurances table and edit OT, and make a policy.
     */
    function modifyOTCtrl($scope, $filter, $uibModalInstance, insuranceService, DTOptionsBuilder, DTColumnDefBuilder, modalService) {
        var vmTable = this;
        $scope.insurances = [];
        $scope.insuranceTable = {};
        $scope.editPolicy = editPolicy;
        $scope.cancel = cancel;

        function editPolicy(insurance) {
            var data = {
                myInsurance: insurance,
                container: $scope.insurances
            };

            modalService.editModal(data);
            $uibModalInstance.close(200);
        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function activate() {
            return insuranceService.getandReadInsurances()
                .then(function(data) {
                    $scope.insurances = data;
                });
        }

        activate();


        $scope.dtOptionsInsurance = DTOptionsBuilder.newOptions()
            .withDOM('pitrfl')
            .withPaginationType('simple_numbers')
            .withDisplayLength(10)
            .withOption('responsive', true)
            .withLanguage({
                'sSearch': 'Buscador:',
            })
        //.withScroller()
        .withOption('deferRender', true)
        // .withOption('scrollY', 200)
        ;
        $scope.dtColumnDefsInsurance = [
            DTColumnDefBuilder.newColumnDef(0),
            DTColumnDefBuilder.newColumnDef(1),
            DTColumnDefBuilder.newColumnDef(2),
            DTColumnDefBuilder.newColumnDef(3),
            DTColumnDefBuilder.newColumnDef(4)
        ];
    }
    /**
     * Create OT modal controller - ButtonsCtrl
     */
    function ButtonsCtrl($scope, $filter, $uibModalInstance, toaster, FileUploader, payform, DTOptionsBuilder, DTColumnDefBuilder, MESSAGES, helpers, ContratanteService, providerService, insuranceService, coverageService, generalService, groupService) {

        /** Uploader files */
        $scope.userInfo = {
            id: 0
        };
        var uploader = $scope.uploader = new FileUploader({
            headers: {
                'Accept': 'application/json'
            },
        });

        function applyUploaderAuthHeader(target) {
            if (!target) {
                return;
            }

            if (!target.headers) {
                target.headers = {};
            }

            target.headers.Accept = 'application/json';

            var activeToken = getCurrentToken();
            var tokenDetails = describeTokenCandidate(activeToken);
            debugLog('applyUploaderAuthHeader', {
                tokenPresent: tokenDetails.hasToken,
                tokenSuffix: tokenDetails.tokenSuffix
            });

            if (activeToken) {
                target.headers.Authorization = 'Bearer ' + activeToken;
            } else if (target.headers.Authorization) {
                delete target.headers.Authorization;
            }
        }

        applyUploaderAuthHeader(uploader);

        // uploader.filters.push({
        //     name: 'customFilter',
        //     fn: function(item /*{File|FileLikeObject}*/ , options) { //jshint ignore:line
        //         return this.queue.length < 20;
        //     }
        // });

        // ALERTA SUCCES UPLOADFILES
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          toaster.success(MESSAGES.OK.UPLOADFILES);
        };

        // ALERTA ERROR UPLOADFILES
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORONUPLOADFILES ,"error");
        };

        uploader.onAfterAddingFile = function(fileItem) {
            fileItem.formData.push({
                arch: fileItem._file
            });
        };

        uploader.onBeforeUploadItem = function(item) {
            applyUploaderAuthHeader(uploader);
            applyUploaderAuthHeader(item);
            item.url = $scope.userInfo.url;
            item.formData[0].nombre = item.file.name;
            item.alias = '';
            item.formData[0].owner = $scope.userInfo.id;
        };
        /** /Uploader files */

        // Life form funcions
        $scope.options = {
            life: {
                beneficiary: {
                    add: function() {
                        var beneficiary = angular.copy($scope.subforms.life.beneficiaries);
                        $scope.subforms.life.beneficiariesList.push(beneficiary);
                    },
                    destroy: function(index) {
                        $scope.subforms.life.beneficiariesList.splice(index, 1);
                    }
                }
            },
            disease: {
                relationships: {
                    add: function() {
                        var relationship = angular.copy($scope.subforms.disease.relationships);
                        if (relationship.relationships.relationship === 1) {
                            var index = _.findIndex($scope.options.disease.types, {
                                option: 'Titular',
                                relationship: 1
                            });
                            $scope.options.disease.types.splice(index, 1);
                        } else if (relationship.relationships.relationship === 2) {
                            var index = _.findIndex($scope.options.disease.types, {
                                option: 'Conyuge',
                                relationship: 2
                            });
                            $scope.options.disease.types.splice(index, 1);
                        }
                        $scope.subforms.disease.relationshipList.push(relationship);

                    },
                    destroy: function(index, rel) {
                        $scope.subforms.disease.relationshipList.splice(index, 1);
                        if ($scope.subforms.disease.relationshipList.length === 0) {
                            $scope.options.disease.types = [{
                                option: 'Titular',
                                relationship: 1
                            }, {
                                option: 'Conyuge',
                                relationship: 2
                            }, {
                                option: 'Hijo',
                                relationship: 3
                            }]
                            toaster.info('Es obligatorio tener un titular.');
                        } else if (rel.relationships.relationship === 1) {
                            $scope.options.disease.types.push({
                                option: 'Titular',
                                relationship: 1
                            });
                            toaster.info('Es obligatorio tener un titular.');
                        } else if (rel.relationships.relationship === 2) {
                            $scope.options.disease.types.push({
                                option: 'Conyuge',
                                relationship: 2
                            });
                        }
                    }
                },
                // 1-Titular, 2-Conyuge, 3-Hijo
                types: [{
                    option: 'Titular',
                    relationship: 1
                }, {
                    option: 'Conyuge',
                    relationship: 2
                }, {
                    option: 'Hijo',
                    relationship: 3
                }]
            }
        };

        $scope.showOne = true;
        $scope.hide = hide;

        // Default values
        $scope.coverages = [];
        $scope.forms = [];
        $scope.savedOt = {};

        $scope.show = {
            ot: true,
            receipt: false,
            generateReceipts: false,
            receiptsGenerated: false
        };

        $scope.changeProvider = changeProvider;
        $scope.changeRamo = changeRamo;
        $scope.changeSubramo = changeSubramo;
        $scope.changePackage = changePackage;
        $scope.isReceiptAvailable = isReceiptAvailable;
        $scope.deleteCoverage = deleteCoverage;

        $scope.createOTAndPreparePolicy = createOTAndPreparePolicy;
        $scope.saveOT = saveOT;
        $scope.saveChangesInOt = saveChangesInOt;
        $scope.saveInsurance = saveInsurance;

        $scope.payments = payform;

        function getContractorsByGroup() {
            groupService.getGroups()
                .then(function(res) {
                    var contractors = [];
                    res.forEach(function(element, index) {
                        element.natural_group.forEach(function(element1, index) {
                            element1.groupName = element.group_name;
                            element1.name = element1.first_name + ' ' + element1.last_name;
                            contractors.push(element1);
                        });
                        element.juridical_group.forEach(function(element2, index) {
                            element2.groupName = element.group_name;
                            element2.name = element1.j_name;
                            contractors.push(element2);
                        });
                    });
                    $scope.contractorsByGroup = contractors;
                });
        }

        $scope.form = {
            contratante: '',
            poliza: '',
            ramo: '',
            type: '',
            subramo: '',
            aseguradora: '',
            paquete: '',
            payment: '',
            startDate: new Date(),
            endingDate: new Date(new Date().setYear(new Date().getFullYear() + 1))
        };


        $scope.$watch('form.startDate', function(newValue, oldValue) {
            var val = angular.copy(newValue);
            $scope.form.endingDate = (new Date(val.setYear(val.getFullYear() + 1)));
        });

        // Subforms
        $scope.subforms = {
            auto: null, //template.formulario.automoviles
            life: {
                beneficiariesList: []
            }, //template.formulario.vida
            disease: {
                relationshipList: []
            }, //template.formulario.accidentes
            damage: null //template.formulario.danios
        };

        function activate() {
            getContractorsByGroup();
            getInsurances();
            ContratanteService.getContratantes()
                .then(function(data) {
                    $scope.contratantes = data;
                });

            providerService.getProviders()
                .then(function(data) {
                    $scope.providers = data;
                });
        }

        function changeProvider(obj) {
            $scope.ramos = obj.ramo_provider;
        }

        function changeRamo(obj) {
            $scope.subramos = obj.subramo_ramo;
        }

        function changeSubramo(obj) {
            $scope.forms = obj.forms_subramo;
            $scope.packages = obj.package_subramo;
            $scope.showForms = true;
            $scope.formInfo = {
                code: obj.subramo_code,
                name: obj.subramo_name
            };
        }

        function changePackage(obj) {
            if (obj != undefined) {
                $scope.coverages = obj.coverage_package;
                $scope.showCoverages = true;
            } else {
                $scope.showCoverages = false;
            }
        }

        function deleteCoverage(obj, index) {
            $scope.coverages.splice(index, 1);
        }

        function saveOT() {

        }

        function getInsurances() {
            insuranceService.getandReadInsurances()
                .then(function(data) {
                    $scope.insurances = data;
                });
        }

        activate();

        function hide(param) {
            if (param === 1) {
                $scope.showOne = true;
            } else {
                $scope.showOne = false;
            }
            return $scope.showOne;
        }

        /**
         * Keep OT and their coverages - ButtonsCtrl
         */
        function createOTAndPreparePolicy() {
            var form = getFormData($scope.form);
            form.contractor = '';
            form.aseguradora = $scope.form.aseguradora.url;
            form.old_policies = [];
            form.recibos_poliza = [];

            if (form.contratante) {
                form.contractor = form.contratante;
            }

            var subformType = helpers.subformChecker($scope.subforms);
            if (subformType) {
                subformType.urlSubramo = form.subramo;
            }

            return insuranceService.createInsurance(form)
                .then(function(data) {
                    if (helpers.isResponseAnError(data.status)) {
                        SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORCREATEOT ,"error");
                    } else {
                        // Reload insurances
                        $scope.show.ot = false;
                        getInsurances();
                        $scope.myInsurance = data;
                        toaster.success(MESSAGES.OK.NEWOT);
                        // Keep coverages
                        if ($scope.coverages.length !== 0) {
                            createCoverages($scope.coverages, data);
                        }
                        // Keep forms, past form
                        // if ($scope.forms.length !== 0){createForms($scope.forms, data);}
                        if (subformType) {
                            ////console.log(subformType);
                            subformType.policy = data.url;
                            ramoService.createForm(subformType)
                                .then(function(res) {

                                });
                        }

                        var formInfo = $scope.formInfo;

                        $scope.userInfo = {
                            id: data.id
                        };

                        $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + data.id + '/archivos/';
                        $scope.uploader.uploadAll();
                    }
                });
        }

        function saveChangesInOt() {
            var form = getFormData($scope.form);
            form.url = $scope.myInsurance.url;
            form.contractor = '';

            if (form.contratante) {
                form.contractor = form.contratante;
            }
            $scope.show.ot = false;

            return insuranceService.updateInsurance(form)
                .then(function(data) {
                    getInsurances();
                    $scope.myInsurance = data.data;
                    toaster.success('Se ha modificado su orden de trabajo');

                    $scope.uploader.uploadAll();

                    $uibModalInstance.dismiss('cancel');
                });
        }

        /**
         * Get form data and return an obj
         * @param  {obj} form data and return
         * @return {obj} object
         */
        function getFormData(form) {
            return {
                contratante: form.contratante,
                ramo: form.ramo.url || null,
                subramo: form.subramo.url || null,
                paquete: form.paquete ? form.paquete.url : null,
                poliza_number: form.poliza || '0',
                start_of_validity: form.startDate || '',
                end_of_validity: form.endingDate || '',
                forma_de_pago: form.payment || null,
                status: 1
            };
        }

        /**
         * Create coverages in policy
         * @param  {array} coverages
         * @param  {obj} policy
         * @return nothing
         */
        function createCoverages(coverages, policy) {
            var coverage = {};
            // TODO check deductible, sum, and prima
            //
            coverages.forEach(function(elem) {
                coverage = {
                    'policy': policy.url,
                    'package': policy.paquete,
                    'coverage_name': elem.coverage_name || '',
                    'deductible': elem.deductibleInPolicy ? elem.deductibleInPolicy.deductible : '',
                    'sum_insured': elem.sumInPolicy ? elem.sumInPolicy.sum_insured : '',
                    'prima': elem.primaInPolicy || ''
                };
                coverageService.createCoberturaPoliza(coverage);
            });
        }

        /**
         * Create forms in policy
         * @param  {array} forms
         * @param  {obj} policy
         * @return nothing
         */
        function createForms(forms, policy) {
            var myForm = {};
            if (forms.length > 0) {
                forms.forEach(function(elem) {
                    myForm = {
                        polizas: policy.url,
                        form: elem.url,
                        value: elem.answer || 'Sin respuesta'
                    };
                    insuranceService.createForms(myForm);
                });
            }
        }

        function isReceiptAvailable() {
            if ($scope.form.payment && $scope.form.poliza) {
                toaster.success('Ya puede generar sus recibos');
            } else if ($scope.form.payment) {
                toaster.info('Favor de ingresar el número de poliza');
            }
        }

        /**
         * Keep insurance like a policy, and keep their receipts
         * TODO check if exists changes in OT and update
         */
        function saveInsurance() {
            $scope.myInsurance.status = 1;
            $scope.myInsurance.forma_de_pago = $scope.form.payment;
            $scope.myInsurance.poliza_number = $scope.form.poliza; //jshint ignore:line
            insuranceService.updateInsurance($scope.myInsurance)
                .then(function() {
                    getInsurances();
                    $scope.receipts.forEach(function(elem, index) {
                        var receipt = {
                            'poliza': $scope.myInsurance.url,
                            'recibo_numero': index + 1,
                            'prima_neta': elem.prima,
                            'rpf': elem.rpf,
                            'derecho': elem.derecho,
                            'iva': elem.iva,
                            'sub_total': elem.subTotal,
                            'prima_total': elem.total,
                            'status': 4,
                            'fecha_inicio': $filter('date')(elem.startDate, 'yyyy-MM-dd'),
                            'fecha_fin': $filter('date')(elem.endingDate, 'yyyy-MM-dd')
                        };
                        receiptService.createReceiptService(receipt);
                    });
                    toaster.success('Se ha creado una póliza');
                    $scope.uploader.uploadAll();
                    $uibModalInstance.dismiss('cancel');
                });
        }

        // Receipts
        ///////////////////////////////////////////
        $scope.showReceipts = $scope.show.receiptsGenerated;
        $scope.amountReceipts = 0;
        $scope.poliza = {
            primaNeta: 0,
            iva: 16,
            rpf: 0,
            derecho: 0,
            subTotal: 0,
            primaTotal: 0
        };
        // vm.receipts = [];
        $scope.receipts = [];

        // Receipt modal
        $scope.ok = ok;
        $scope.cancel = cancel;
        $scope.getNumber = getNumber;
        $scope.calculate = calculate;
        $scope.showPoliceCreator = showPoliceCreator;

        function showPoliceCreator() {
            if ($scope.showReceipts === false) {
                // && $scope.form.ramo === null && $scope.form.subramo === null && $scope.form.paquete === null
                return true;
            }
            return false;
        }

        function ok() {
            $scope.show.receipt = true;
            // $uibModalInstance.close();
        }

        function calculate() {
            if (!$scope.form.payment) {
                toaster.info(MESSAGES.ERROR.SELPAY);
            } else {
                $scope.receipts = [];
                $scope.showReceipts = true;
                var initDate = $scope.form.startDate;
                var endDate = $scope.form.endingDate;
                var months = helpers.monthDiff(initDate, endDate);
                var amountReceipts = $scope.amountReceipts = months / $scope.form.payment;
                //Calculate poliza results
                $scope.poliza.subTotal = getSubtotal($scope.poliza);
                $scope.poliza.primaTotal = getTotal($scope.poliza);
                amountReceipts = Math.ceil(amountReceipts);
                var arrayLen = $scope.getNumber(amountReceipts);

                // Logic from vm
                var obj = {
                    prima: $scope.poliza.primaNeta / amountReceipts,
                    rpf: $scope.poliza.rpf / amountReceipts,
                    derecho: $scope.poliza.derecho / amountReceipts,
                    iva: $scope.poliza.iva,
                    subTotal: $scope.poliza.subTotal / amountReceipts,
                    primaTotal: $scope.poliza.primaTotal / amountReceipts,
                };


                for (var i = 0; i < arrayLen.length; i++) {
                    // Check options
                    if ($scope.configDerecho) {
                        if (i === 0) {
                            obj.derecho = parseFloat($scope.poliza.derecho);
                        } else {
                            obj.derecho = 0;
                        }
                    }

                    if ($scope.configRPF) {
                        if (i === 0) {
                            obj.rpf = parseFloat($scope.poliza.rpf);
                        } else {
                            obj.rpf = 0;
                        }
                    }

                    endDate = new Date(moment(initDate).add($scope.form.payment, 'months').calendar());

                    var subTotal = obj.prima + obj.rpf + obj.derecho;
                    var receipt = {
                        'prima': parseFloat((obj.prima).toFixed(2)),
                        'rpf': parseFloat((obj.rpf).toFixed(2)),
                        'derecho': parseFloat((obj.derecho).toFixed(2)),
                        'iva': 16,
                        'subTotal': parseFloat((subTotal).toFixed(2)),
                        'total': parseFloat((subTotal * 1.16).toFixed(2)),
                        'startDate': initDate,
                        'endingDate': endDate
                    };
                    initDate = endDate;
                    $scope.receipts.push(angular.copy(receipt));
                }
            }

        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }

        function getNumber(num) {
            var num2 = Math.ceil(num);
            return new Array(num2);
        }

        function getSubtotal(poliza) {
            var sum = parseFloat(poliza.primaNeta) + parseFloat(poliza.rpf) + parseFloat(poliza.derecho);
            return Number((sum).toFixed(2));
        }

        function getTotal(poliza) {
            return poliza.subTotal * 1.16;
        }


    }
    ////////////////////////////////////////////////
    /////// ModalOtInfoCtrl
    function ModalOtInfoCtrl($scope, $uibModalInstance) {
        var vmm = $scope;
        vmm.polizas = [];
        insuranceService.getandReadInsurances();
        ContratanteService.getContratantes()
            .then(function(data) {
                data.forEach(function(elem) {
                  vmm.contratantes.contractor.push(elem);
                });
            });

        vmm.ok = function() {
          
        };

        vmm.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
    }
    /////// ModalOtInfoCtrl
    function createInsuranceModalCtrl($scope, $uibModalInstance, toaster, $filter) {
    }
    /////// editInsuranceModalCtrl
    /**
     * Edits an OT -> make policy generate receips
     */
    // Moved to polizas/polizas.modal.editCtrl.js
    /////// End editInsuranceModalCtrl
    /////// PolicyModal
    function PolicyModal($scope, $uibModalInstance, toaster, $filter) {
        $scope.datas = 10;
        $scope.form = {};

        $scope.providers = [];
        $scope.ramos = [];
        $scope.subramos = [];
        $scope.paquetes = [];

        $scope.saveOT = saveOT;

        $scope.status = status;
        $scope.payform = payform;

        $scope.show = {
            receipt: false
            // ot: false
        };

        $scope.changeProvider = changeProvider;
        $scope.changeRamos = changeRamos;
        $scope.changeSubramos = changeSubramos;

        $scope.openModal = openReceiptModal;
        $scope.saveInsurance = saveInsurance;


        function changeProvider(changeProv) {
            $scope.ramos = changeProv.ramo_provider;
        }

        function changeRamos(changeRamo) {
            $scope.subramos = changeRamo.subramo_ramo;
        }

        function changeSubramos(changeSubramo) {
            $scope.paquetes = changeSubramo.package_subramo;
        }

        var myForm = {};
        var parentScope = $scope;

        function openReceiptModal() {
            myForm = $scope.form;
            var modalInstance = $uibModal.open({ //jshint ignore:line
                templateUrl: 'app/polizas/recibos.modal.html',
                controller: ReceiptModalCtrl,
                size: 'lg',
                resolve: {
                  from: function(){
                      return null;
                    }
                  },
                backdrop: 'static', /* this prevent user interaction with the background */ 
                keyboard: false
                //windowClass: 'animated fadeIn'
                // HACK remove if this doesnt works
                // resolve: {
                //     form: function(){
                //       return $scope.form;
                //     }
                // }
            });
        }

        function getInsurances() {
            insuranceService.getandReadInsurances()
                .then(function(data) {
                    main.insurances = data;
                });
        }

        function saveInsurance() {
            $scope.form.status = 4;

            insuranceService.updateInsurance($scope.form)
                .then(function() {
                    getInsurances();
                    $scope.receipts.forEach(function(elem, index) {
                        var receipt = {
                            'poliza': $scope.form.url,
                            'recibo_numero': index + 1,
                            'prima_neta': elem.prima.toString(),
                            'rpf': elem.rpf.toString(),
                            'derecho': elem.derecho.toString(),
                            'iva': elem.iva,
                            'sub_total': elem.subTotal.toString(),
                            'prima_total': elem.total.toString(),
                            'status': 4,
                            'fecha_inicio': $filter('date')(elem.startDate, 'yyyy-MM-dd'),
                            'fecha_fin': $filter('date')(elem.endingDate, 'yyyy-MM-dd'),
                            'description': null
                        };
                        receiptService.createReceiptService(receipt);
                    });
                    toaster.success('Se ha creado una poliza');
                });
        }

        function saveOT() {
            var save = $scope.form;
            save.aseguradora = $scope.form.aseguradora.url;
            save.ramo = $scope.form.ramo.url;
            save.subramo = $scope.form.subramo.url;
            save.paquete = $scope.form.paquete.url;
            if ($scope.form.forma_de_pago.value) {
                save.forma_de_pago = $scope.form.forma_de_pago.value;
            }
            save.status = 1;
            insuranceService.updateInsurance(save)
                .then(function(d) {
                    toaster.success('Su Ot ha sido guardada');
                    getInsurances();
                    $uibModalInstance.dismiss('cancel');
                });
        }

        function activate() {
            var data = {};
            main.lc=''
            data.polizaId = main.insurance.id;
            insuranceService.getInsuranceRead(data)
                .then(function(data) {
                    $scope.form = data;
                });

            providerService.getProviders()
                .then(function(data) {
                    $scope.providers = data;
                    return data;
                });

            var otherData = {};
            otherData.polizaId = data.polizaId.replace('leer-', '');

            insuranceService.getInsurance(otherData)
            .then(function(insuranceData) {
                var prov = {};
                prov.provider = insuranceData.aseguradora;
                providerService.getProvider(prov)
                    .then(function(data) {
                        $scope.ramos = data.ramo_provider;
                        return insuranceData;
                    }).then(function(insurance) {
                        ramoService.getRamo(insurance)
                            .then(function(ramoData) {
                                $scope.subramos = ramoData.subramo_ramo;
                                ramoService.getSubramo(insurance)
                                    .then(function(subramoData) {
                                        $scope.paquetes = subramoData.package_subramo;
                                    });
                            });
                    });
            });
        }

        activate();

        $scope.ok = function() {
           
        };

        $scope.close = function() {
            $uibModalInstance.dismiss('cancel');
        };

        ///////////////// Create receipt modal
        function ReceiptModalCtrl($scope, $uibModalInstance) {
            $scope.amountReceipts = 0;
            $scope.poliza = {
                primaNeta: "",
                iva: 16,
                rpf: "",
                derecho: "",
                subTotal: "",
                primaTotal: ""
            };

            $scope.calculate = function() {
                if (!parentScope.form.forma_de_pago) {
                    toaster.info(MESSAGES.ERROR.SELPAY);
                } else {
                    $scope.receipts = [];
                    $scope.showReceipts = true;
                    var initDate = parentScope.form.start_of_validity;
                    var endDate = parentScope.form.end_of_validity;
                    var months = helpers.monthDiff(initDate, endDate);
                    var amountReceipts = $scope.amountReceipts = months / parentScope.form.forma_de_pago.value;
                    //Calculate poliza results
                    $scope.poliza.subTotal = getSubtotal($scope.poliza);
                    $scope.poliza.primaTotal = getTotal($scope.poliza);
                    var arrayLen = $scope.getNumber(amountReceipts);

                    var obj = {
                        prima: $scope.poliza.primaNeta / amountReceipts,
                        rpf: $scope.poliza.rpf / amountReceipts,
                        derecho: $scope.poliza.derecho / amountReceipts,
                        iva: $scope.poliza.iva,
                        subTotal: $scope.poliza.subTotal / amountReceipts,
                        primaTotal: $scope.poliza.primaTotal / amountReceipts,
                    };


                    for (var i = 0; i < arrayLen.length; i++) {
                        // Check options
                        if ($scope.configDerecho) {
                            if (i === 0) {
                                obj.derecho = $scope.poliza.derecho;
                            } else {
                                obj.derecho = 0;
                            }
                        }

                        if ($scope.configRPF) {
                            if (i === 0) {
                                obj.rpf = $scope.poliza.rpf;
                            } else {
                                obj.rpf = 0;
                            }
                        }
                        endDate = moment(new Date(moment(initDate).add(parentScope.form.forma_de_pago.value, 'months').calendar())).format();

                        var subTotal = obj.prima + obj.rpf + obj.derecho;
                        var receipt = {
                            'prima': parseFloat((obj.prima).toFixed(2)),
                            'rpf': parseFloat((obj.rpf).toFixed(2)),
                            'derecho': parseFloat((obj.derecho).toFixed(2)),
                            'iva': 16,
                            'subTotal': parseFloat((subTotal).toFixed(2)),
                            'total': parseFloat((subTotal * 1.16).toFixed(2)),
                            'startDate': initDate,
                            'endingDate': endDate
                        };

                        initDate = endDate;

                        $scope.receipts.push(angular.copy(receipt));
                        parentScope.receipts = $scope.receipts;
                    }
                }

            };
            $scope.ok = function() {
                parentScope.show = {
                    receipt: true,
                    // ot: true
                };
                $uibModalInstance.dismiss('cancel');

            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $scope.getNumber = function(num) {
                return new Array(num);
            };

            function getSubtotal(poliza) {
                var sum = parseFloat(poliza.primaNeta) + parseFloat(poliza.rpf) + parseFloat(poliza.derecho);
                return Number((sum).toFixed(2));
            }

            function getTotal(poliza) {
                return poliza.subTotal * 1.16;
            }
        }
        ///////////////// Create receipt modal


        /////// PolicyModal
    }
  }

})();
