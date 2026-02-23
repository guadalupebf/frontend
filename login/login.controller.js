(function () {
  'use strict';

  angular.module('inspinia')
    .controller('LoginCtrl', LoginCtrl);

  LoginCtrl.$inject = ['$document','$scope', 'loginService','VersionService', 'toaster', 'MESSAGES', '$http', '$localStorage', '$state', '$location', '$sessionStorage', 'Idle', 'URLS_CONFIG', 'url', 'mcFactory', '$rootScope', 'SweetAlert', 'dataFactory','appStates'];
    function get_org(host){
      host = String(host);
      var len= host.length;
      var aux=''
      for(var i = 0; i<len;i++){
        if(host[i] === '.'){
          return aux;
        }
        aux+=host[i];
      }
      // Solo resetea si NO existe sesión previa
      if (!$sessionStorage.token && !$localStorage.token) {
        $localStorage.$reset();
        $sessionStorage.$reset();
      }

      appStates = []
      return 'no_org';

    }
  function LoginCtrl($document,$scope, loginService,VersionService, toaster, MESSAGES, $http, $localStorage, $state, $location, $sessionStorage, Idle, URLS_CONFIG, url, mcFactory, $rootScope, SweetAlert, dataFactory,appStates) {


    // Solo resetea si NO existe sesión previa
    if (!$sessionStorage.token && !$localStorage.token) {
      $localStorage.$reset();
      $sessionStorage.$reset();
    }

    appStates = []
    var host = $location.host();
    $localStorage.permissions;

    var vm = this;     
    console.log('berddddddddddd',$localStorage)
    VersionService.start(60000); // cada 1 minuto SOLO en login
    $scope.$on('$destroy', function() {
      VersionService.stop(); // al salir de login, se apaga
    });
    function requestNotificationsPermissions() {
      if (firebase.messaging.isSupported()) {
        firebase.messaging().requestPermission().then(function() {
          getFirebaseToken()
          // Notification permission granted.
          // Volver a obtener el token y guardarlo
        }).catch(function(error) {
          firebase.messaging().requestPermission().then(function() {
          // Notification permission granted.
        })
        });
      }
      
    }

    function getFirebaseToken(){
      if (firebase.messaging.isSupported()) {
        firebase.messaging().getToken().then(function(currentToken) {
          if (currentToken) {
            // Saving the Device Token to the datastore.
            $http.post(url.IP + 'guardar-firebase-token/',{'token':currentToken, 'action':'save'}).then(function(response) {

            }).catch(function(error) {
              console.log('error firebase get token', error)
            });
            
          } else {
            // Need to request permissions to show notifications.
            requestNotificationsPermissions();
          }
        })
        .catch(function(error){
          console.error('Unable to get messaging token.', error);
        });
      }
    }
    
      

    vm.be_logo=true;

    var org_name = get_org(host);

    var dato = {org:org_name}
    vm.pageTitle = '';
    vm.login = login;
    vm.user = {
      username: '',
      password: '',
      org: host.split('.')[0]
    };

    var hostUrl = URLS_CONFIG.cas;
    if($document.context.title == 'Your session has expired.'){
      $document.context.title = 'Miurabox'
    }

  if($location.path() == '/login/auth'){

      $http({
        method: 'GET',
        url: hostUrl + 'get-image-or/'+ org_name,
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(function (data) {
         // Solo resetea si NO existe sesión previa
if (!$sessionStorage.token && !$localStorage.token) {
  $localStorage.$reset();
  $sessionStorage.$reset();
}

         if(data.status==200){
          if(data.data.logo.length==0){
            vm.be_logo=false;
            var url_aux= '';
          }
          else{
            vm.be_logo=true;
            // var url_aux= 'https://miurabox.s3.amazonaws.com/cas/'+data.data.logo;
            var url_aux= data.data.logo;
          }
         }
         else{

          vm.be_logo=false;
          var url_aux= '';

        // Solo resetea si NO existe sesión previa
if (!$sessionStorage.token && !$localStorage.token) {
  $localStorage.$reset();
  $sessionStorage.$reset();
}


         }
         $localStorage.mainLogo=url_aux;
         vm.logo=url_aux;
          try{
            if ($location.$$search) {
              var parameter = $location.$$search;
              if (parameter.indicators) {
                if (parameter.indicators == 1) {
                  $localStorage.url_operation = '/operacion.semanal'  
                }
              }
            }
          }catch(error) {
            console.log('_Login normal_',error)
          }
      });
    }

    setTimeout(function() {
      if(!vm.logo){
        $http({
          method: 'GET',
          url: hostUrl + 'get-image-or/'+ org_name,
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(function (data) {

          // Solo resetea si NO existe sesión previa
if (!$sessionStorage.token && !$localStorage.token) {
  $localStorage.$reset();
  $sessionStorage.$reset();
}

           if(data.status==200){
            if(data.data.logo.length==0){
              vm.be_logo=false;
              var url_aux= '';
            }
            else{
              vm.be_logo=true;
              // var url_aux= 'https://miurabox-public.s3.amazonaws.com/cas/'+data.data.logo;
              var url_aux= data.data.logo;
            }
           }
           else{

            vm.be_logo=false;
            var url_aux= '';
// Solo resetea si NO existe sesión previa
if (!$sessionStorage.token && !$localStorage.token) {
  $localStorage.$reset();
  $sessionStorage.$reset();
}


           }
           $localStorage.mainLogo=url_aux;
           vm.logo=url_aux;
            try{
              if ($location.$$search) {
                var parameter = $location.$$search;
                if (parameter.indicators) {
                  if (parameter.indicators == 1) {
                    $localStorage.url_operation = '/operacion.semanal'  
                  }
                }
              }
            }catch(error) {
              console.log('_Login normal_',error)
            }
        });
      }
    }, 500);

    vm.isDisabled = function () {
      return vm.user.username == '' || vm.user.password == '' || !vm.user.username || !vm.user.password;
    }

    function login() {
      var data_user = {'username':vm.user.username,  'password' : vm.user.password, 'org' :vm.user.org}; 
      $http({
        method: 'POST',
        //url: hostUrl+'us-login',
        url: hostUrl+'api-token-auth-saam/',
        headers: {
          //'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Type': 'application/json',
          //'Accept': 'application/x-www-form-urlencoded'
        },
        //data: 'username=' + encodeURIComponent(vm.user.username) + '&password=' + encodeURIComponent(vm.user.password) + '&org=' + encodeURIComponent(vm.user.org)
        data: data_user
      }).then(function success (data) {

        if (data.status === 200) {
          appStates.states = []
          // Iniciar firebase FCM
          // End Firebase FCM
          dataFactory.get('schedule/');
          
          // TODO: guardar en sessionStorage el permiso para mc
          $rootScope.mc_permission = data.data.org.active_multicotizador;
          $sessionStorage.mc_permission = data.data.org.active_multicotizador;
          $localStorage.mc_permission_user = data.data.org.active_multicotizador;
          Idle.watch();
           var avatar = data.data.avatar;
          $localStorage.loginInfo = JSON.stringify(data.data);
          if(avatar) {
            $localStorage.avatar = avatar;
          }

          var avatar = data.data.avatar;
          $localStorage.loginInfo = JSON.stringify(data.data);

          if(avatar) {
            $localStorage.avatar = avatar;
          }

          if(data.data.org.active_saam){
             if(data.data.permissions.SAAM){
                var rol=[];
                if(data.data.role == 1){
                   rol[0]= 1;
                   rol[1]= 'Sub administrador';
                }
                else if(data.data.role == 2){
                   rol[0]= 2;
                   rol[1]= 'Agente';
                 }
                else if(data.data.role == 3){
                   rol[0]= 3;
                   rol[1]= 'Vendedor';
                }
                else if(data.data.role == 4){
                   rol[0]= 4;
                   rol[1]= 'Usuario';
                }
                else{
                   rol[0]= 0;
                   rol[1]= 'Administrador';
                }
                var user = {
                  name: vm.user.username,
                  email: data.data.email,
                  avatar: data.data.avatar,
                  role:rol,
                  org: vm.user.org,
                  orgname:data.data.org.name,
                  orgInfo: data.data.org.name,
                  orgId: data.data.org.id,
                  urlname:data.data.org.urlname,
                  permiso:data.data.crud_permissions,
                  nameFull: data.data.first_name + ' ' + data.data.last_name,
                  orgLocation: data.data.orgAddress,
                  cobranza_pendiente: data.data.cobranza_pendiente
                };

                $localStorage.permissions = user.permiso;

                vm.user.first_name = data.data.fname;
                vm.user.last_name = data.data.lname;
                $scope.main.orgName = user.org;
                $scope.main.userLogin = user;

                return loginService.login(vm.user)
                  .then(function success (data2) {
                    // Se encriptan valores de token y user
                   // Se encriptan valores de token y user
                var valueToken = JSON.stringify(data.data.token_jwt),
                valueUser = JSON.stringify(user);
                var encryptedToken = sjcl.encrypt("Token", valueToken),
                encryptedUser = sjcl.encrypt('User', valueUser);

                // Se guardan en sessionStorage
                $sessionStorage.token = encryptedToken;
                $sessionStorage.permisos = data.data.permissions.SAAM;
                $sessionStorage.infoUser = data.data;
                $sessionStorage.user = encryptedUser;

                // *** NUEVO: también guarda en localStorage para compartir sesión entre pestañas
                $localStorage.token = encryptedToken;
                $localStorage.user = encryptedUser;
                $localStorage.permisos = data.data.permissions.SAAM;
                $localStorage.infoUser = data.data;

                if (window.saamSessionControl && typeof window.saamSessionControl.markLoginRestored === 'function') {
                  try {
                    window.saamSessionControl.markLoginRestored();
                  } catch (error) {
                    console.warn('No se pudo actualizar el estado de redirección al iniciar sesión', error);
                  }
                }

                // *** NUEVO: notifica a otras pestañas que hubo login
                var saamAuthEvent = {
                  type: 'login',
                  token: encryptedToken,
                  user: encryptedUser,
                  permisos: data.data.permissions.SAAM,
                  infoUser: data.data,
                  timestamp: Date.now()
                };
                try {
                  window.localStorage.setItem('saam_auth_event', JSON.stringify(saamAuthEvent));
                } catch (error) {
                  console.warn('No se pudo notificar el inicio de sesión a otras pestañas', error);
                }

                var token_firebase = getFirebaseToken();
                $scope.$parent.main.initUser();
                $state.go('inicio.inicio');


                    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
                    var usr = JSON.parse(decryptedUser);
                    $rootScope.usr = usr;

                    $scope.main.activate();

                  },
                  function (e) {
                    // SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORAPI ,"error");
                  }).catch(function (error) {
                    // SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORAPI ,"error");
                  });

             }
             else{
              SweetAlert.swal("ERROR",MESSAGES.ERROR.ERRORPERMISSIONAPP ,"error");
             }
          }
          else{
            SweetAlert.swal("ERROR",MESSAGES.ERROR.APPNOTACTIVE ,"error");
            return;

          }

        } else {
        // Solo resetea si NO existe sesión previa
if (!$sessionStorage.token && !$localStorage.token) {
  $localStorage.$reset();
  $sessionStorage.$reset();
}

          SweetAlert.swal("ERROR",MESSAGES.ERROR.LOGIN ,"error");
        }
      },
      function error() {
          SweetAlert.swal("ERROR",MESSAGES.ERROR.LOGIN ,"error");
      })
      .catch(function(e) {
          SweetAlert.swal("ERROR",MESSAGES.ERROR.LOGIN ,"error");
      });




    }

  }
})();