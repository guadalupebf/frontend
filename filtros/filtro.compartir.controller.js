(function() {
  'use strict';

  angular.module('inspinia').controller('filterSharedController', filterSharedController);

  filterSharedController.$inject = ['$scope', '$http', 'url', 'dataFactory', 'providerService', 'SweetAlert', 
  '$sessionStorage', '$state'];

  function filterSharedController($scope, $http, url, dataFactory, providerService, SweetAlert, $sessionStorage, 
    $state) {

    var vm = this;

    $scope.selectUser = 'usuario';
    $scope.userSelected = [];
    $scope.groupSelected = [];
    $scope.showTable = false;
    $scope.shareds = [{
      aseguradora: '',
      contratante_fisico: '',
      contratante_moral: '',
      grupo_de_contratantes: '',
      fianza: '',
      poliza: ''
    }];
    var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
    var usr = JSON.parse(decryptedUser);
    $scope.url_go = ''
    activate();
    function activate (){
      providerService.getReadListProviders()
      .then(function(provider) {
        $scope.providers = provider;
        $scope.url_go = $scope.providers[0].org
      });
    }
    
    $scope.findUser = function (parValue) {
      $scope.autocompleteData = [];
      if(parValue) {
        if(parValue.val.length >= 3) {
          if ($scope.selectUser == 'usuario') {
            dataFactory.get('filter-users/', {word: parValue.val})
            .then(
              function success(request) {
                var results = [];
                results = _.map(request.data.results, function(item) {
                  return {
                    label: item.first_name + ' '+ item.last_name,
                    value: item.first_name + ' '+ item.last_name,
                    id: item.id, 
                    url: item.url
                  }
                });
                $scope.autocompleteData = results;
              }, 
              function error (error) {
              }
            )
            .catch(function(e) {
              console.log('e', e);
            });
          } else{
            $scope.aurtocompleteData = []
            dataFactory.get('filter-djangogroups/', {word: parValue.val})
            .then(
              function success(request) {
                var results = [];
                results = _.map(request.data.results, function(item) {
                  return {
                    label: item.name,
                    value: item.name,
                    id: item.id, 
                    url: item.url
                  }
                });
                $scope.autocompleteData = results;
              }, 
              function error (error) {
              }
            )
            .catch(function(e) {
              console.log('e', e);
            });
          }
        }
      }
    };

    $scope.userSelect = function (val) {
      if(val.value){
        $scope.showTable = true;
        if ($scope.selectUser == 'usuario') {
          $scope.userSelected = ''
          $scope.groupSelected = ''
          if (val) {
            $http.get(val.url)
            .then(function(response) {
              if(response.status === 200) {
                $scope.userSelected = response.data;
                $scope.groupSelected = [];
              }
            });        
          }
        }else{
          $scope.groupSelected = val;
          $scope.userSelected = [];
          $scope.seeGroup(val.id, 1);
        }
        $scope.shareds = [];
        $scope.shareds = [{
          aseguradora: '',
          contratante_fisico: '',
          contratante_moral: '',
          grupo_de_contratantes: '',
          fianza: '',
          poliza: ''
        }];
      }
    };
    $scope.seeGroup = function(grp, num){
      $http({
        method: 'GET',
        url: url.IP + 'get-djangousersgroups/',
        params: {group: grp, action: num}
      }).success(function(response) {
        $scope.groupsList = response;
      });
    };

    $scope.matchesContractors = function(parWord) {
      $scope.contractors_data = [];
      if(parWord) {
        if(parWord.val.length >= 3) {
          $http.post(url.IP + 'contractors-match/', 
            {
              'matchWord': parWord.val,
              'poliza': true
            })
          .then(function(response) {
            if(response.status === 200 && (response.data.juridicals || response.data.naturals)) {
              var source = [];
              var juridicals = response.data.juridicals;
              var naturals = response.data.naturals;
              if(juridicals.length) {
                juridicals.forEach(function(item) {
                  var obj = {
                    label: item.j_name,
                    value: item
                  };
                  source.push(obj);
                });
              } else if(naturals.length) {
                naturals.forEach(function(item) {
                  if(item.full_name) {
                    var obj = {
                      label: item.full_name,
                      value: item
                    };
                  } else {
                   var obj = {
                      label: item.first_name+' '+ item.last_name+' '+ item.second_last_name,
                      value: item
                    }; 
                  }
                source.push(obj);
                });
              }
              $scope.contractors_data = source;
            }
          });
        }
      } else {
        $scope.contractors_data = [];
      }
    };

    $scope.matchesGroup = function(parWord) {
      $scope.groups_data = [];
      if(parWord) {
        if(parWord.val.length >= 3) {
          $http.post(url.IP + 'grupos-match/', 
            {
              'matchWord': parWord.val
            })
          .then(function(response) {
            if(response.status === 200) {
              var source = [];
              var groups = response.data;
              groups.forEach(function(item) {
                var obj = {
                  label: item.group_name,
                  value: item
                };
                source.push(obj);
              });
              $scope.groups_data = source;
            }
          });
        }
      }
    };

    $scope.matchesFianzas = function(parWord) {
      $scope.fianza_data = [];
      if(parWord) {
        if(parWord.val.length >= 3) {
          $http({
            method: 'GET',
            url: url.IP + 'seeker-fianzas/', 
            params: {
              cadena: parWord.val
            }
          }).then(function success(request) {
            var source = [];
            var fianzas = request.data.results;
            fianzas.forEach(function(item) {
              var obj = {
                label: item.fianza_number != null ? item.fianza_number : item.internal_number,
                value: item
              };
              source.push(obj);
            });
            $scope.fianza_data = source;
          });
        }
      }
    };

    $scope.matchesPolicies = function(parWord) {
      $scope.policies_data = [];
      if(parWord) {
        if(parWord.val.length >= 3) {
          $http({
            method: 'GET',
            url: url.IP + 'seeker-policies/', 
            params: {
              cadena: parWord.val
            }
          }).then(function success(request) {
            var source = [];
            var policies = request.data.results;
            policies.forEach(function(item) {
              var obj = {
                label: item.poliza_number,
                value: item
              };
              source.push(obj);
            });
            $scope.policies_data = source;
          });
        }
      }
    };

    $scope.addShared = function(){
      $scope.obj = {
        aseguradora: '',
        contratante_fisico: '',
        contratante_moral: '',
        grupo_de_contratantes: '',
        fianza: '',
        poliza: ''
      };
      $scope.shareds.push($scope.obj);
    };

    $scope.deleteShared = function(idx){
      $scope.shareds.splice(idx, 1);
    };

    $scope.saveShared = function(){
      $scope.shareds.forEach(function(item){
        $scope.params = {
          'aseguradora': item.aseguradora ? item.aseguradora.url : '',
          'contratante_fisico': item.contratante ? item.contratante.val ? item.contratante.value.type_person == 'Fisica' ? item.contratante.value.url : '' : '' : '',
          'contratante_moral': item.contratante ? item.contratante.val ? item.contratante.value.type_person == 'Moral' ? item.contratante.value.url : '' : '' : '',
          'fianza': item.fianza ? item.fianza.val ? item.fianza.value.url : '' : '',
          'grupo': $scope.selectUser == 'grupo' ? $scope.valueUser.url : '',
          'grupo_de_contratantes': item.grupo ? item.grupo.val ? item.grupo.value.url : '' : '',
          'poliza': item.poliza ? item.poliza.val ? item.poliza.value.url : '' : '',
          'usuario': $scope.selectUser == 'usuario' ? $scope.userSelected.url : '',
          'org': $scope.url_go,
        }
        $http.post(url.IP + 'shared/', $scope.params)
        .then(function(response) {

        });
      });
      SweetAlert.swal("¡Listos!", "La asignación se ha realizado con éxito.", "success");
      $state.go('filtro.lista');
    };
            
  }
})();
