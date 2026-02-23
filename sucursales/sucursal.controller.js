(function() {
    'use strict';

    angular.module('inspinia')
        .controller('ScrslController', ScrslController);

    ScrslController.$inject = ['$scope', 'dataFactory', '$http', 'providerService', 'SweetAlert', 'MESSAGES','$q','helpers','globalVar',
                               'generalService', '$state', '$localStorage'];

    function ScrslController($scope, dataFactory, $http, providerService, SweetAlert, MESSAGES,$q,helpers,globalVar,generalService, 
                             $state, $localStorage) {
      

      $scope.vm = this;     
      $scope.showSucursal = false;  
      $scope.edit = false;    
      $scope.sucursal = {};
      $scope.address = {};

      $scope.createSucursal= function(){
        $scope.showSucursal = true;
        $scope.sucursal.sucursal_name = '';
        $scope.address.route = '';
        $scope.address.street_number = '';
        $scope.address.street_number_int = '';
        $scope.address.sublocality = '';
        $scope.address.administrative_area_level_1 = '';
        $scope.address.postal_code = '';
        $scope.address.details = '';
        $scope.sucursal.details = '';
        if($localStorage['save_create_sucursal']){
          $scope.sucursal.sucursal_name = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['sucursal_name'] : '';
          $scope.address.route = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['route'] : '';
          $scope.address.street_number = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['street_number'] : '';
          $scope.address.street_number_int = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['street_number_int'] : '';
          $scope.address.sublocality = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['sublocality'] : '';
          $scope.address.administrative_area_level_1 = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['administrative_area_level_1'] : '';
          $scope.address.administrative_area_level_2 = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['administrative_area_level_2'] : '';
          $scope.address.postal_code = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['postal_code'] : '';
          $scope.address.details = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['details'] : '';
          $scope.sucursal.details = $localStorage['save_create_sucursal'] ? $localStorage['save_create_sucursal']['observations'] : '';
        }
        if ($scope.addresses.length ==0) {          
          $scope.addresses.add(1);
        }
      };

      $scope.addresses = {
          add: addAddress,
          selectedState: selectedState,
          delete: deleteAddress
      };

      activate();
      function activate(){
        dataFactory.get('sucursales-to-show-unpag/')
        .then(function success(response) {
          $scope.sucursalList = response.data;
        })
        // Direcciones
        $q.when()
          .then(function() {
              var defer = $q.defer();
              defer.resolve(helpers.getStates());
              return defer.promise;
          })
          .then(function(data) {
              $scope.statesArray = data.data;
          });
      };

      if ('save_create_sucursal' in $localStorage){}
      else{
        $localStorage['save_create_sucursal'] = {};
      }

      $scope.saveLocalstorange = function(){
        $localStorage['save_create_sucursal']['sucursal_name'] =  $scope.sucursal.sucursal_name ? $scope.sucursal.sucursal_name : '';
        $localStorage['save_create_sucursal']['route'] =  $scope.address.route ? $scope.address.route : '';
        $localStorage['save_create_sucursal']['street_number'] =  $scope.address.street_number ? $scope.address.street_number : '';
        $localStorage['save_create_sucursal']['street_number_int'] =  $scope.address.street_number_int ? $scope.address.street_number_int : '';
        $localStorage['save_create_sucursal']['sublocality'] =  $scope.address.sublocality ? $scope.address.sublocality : '';
        $localStorage['save_create_sucursal']['administrative_area_level_1'] =  $scope.address.administrative_area_level_1 ? $scope.address.administrative_area_level_1 : '';
        $localStorage['save_create_sucursal']['administrative_area_level_2'] =  $scope.address.administrative_area_level_2 ? $scope.address.administrative_area_level_2 : '';
        $localStorage['save_create_sucursal']['postal_code'] =  $scope.address.postal_code ? $scope.address.postal_code : '';
        $localStorage['save_create_sucursal']['details'] =  $scope.address.details ? $scope.address.details : '';
        $localStorage['save_create_sucursal']['observations'] =  $scope.sucursal.details ? $scope.sucursal.details : '';
      }

      function addAddress(type) {

        $scope.sucursal.address = []
        // HACK remove before production
        var address = {
            raw: '',
            street_address: '',
            intersection: '',
            political: '',
            administrative_area_level_1: '',
            administrative_area_level_1_short: '',
            administrative_area_level_2: '',
            administrative_area_level_3: '',
            colloquial_area: '',
            sublocality: '',
            neighborhood: '',
            premise: '',
            subpremise: '',
            natural_feature: '',
            country: '',
            country_code: '',
            locality: '',
            postal_code: '',
            route: '',
            street_number: '',
            street_number_int: '',
            formatted: '',
            latitude: '',
            longitude: '',
            details: '',
            composed: ''
        };
        $scope.sucursal.address.push(address);       
      }
      function deleteAddress(index, type) {
        $scope.sucursal.address.splice(index, 1);
      }

      function selectedState(selected, index, type) {
        $scope.sucursal.address[index].city = '';
        $scope.sucursal.address[index].citiesList = selected.cities;
          
      }

      $scope.saveSucursal = function(form) {   
        $scope.dataToSave = {}
        $scope.dataToSave.sucursal_name = form.sucursal_name;
        $scope.dataToSave.details = form.details;
        $scope.sucursal.address = []
        $scope.sucursal.address.push($scope.address);

        dataFactory.post('sucursal/', $scope.dataToSave)
        .then(function success(response) {
          if (response.status == 200 || response.status == 201) {
            $scope.sucursal.address.forEach(function(address) {
              $scope.acumulate = $scope.acumulate + 1;
              address.url = globalVar.address;
              address.administrative_area_level_1=address.administrative_area_level_1.state
              address.administrative_area_level_2 =address.administrative_area_level_2.city
              address.sucursal = response.data.url;
              address.tipo = address.tipo ? address.tipo.name : '';
              // generalService.postService(address);

              $http.post(address.url, address)
              .then(function(resp){
                if(resp){ 
                  $localStorage['save_create_sucursal'] = {}
                  $state.reload();
                  SweetAlert.swal("¡Listo!", MESSAGES.OK.SUCURSALCREATE, "success");
                  $scope.closeSucursal();
                }
              })
              .catch(function(err) {
                console.log('Error', err)
              });
            });
            $localStorage['save_create_sucursal'] = {};
          }else{
            activate();
            $scope.closeSucursal();
            $localStorage['save_create_sucursal'] = {};
          }
        })
      };

      $scope.closeSucursal = function(){
        $scope.showSucursal = false;
        if($scope.edit){
          $scope.sucursalList[$scope.idx].address_sucursal[0].administrative_area_level_1 = $scope.copy_state;
          $scope.sucursalList[$scope.idx].address_sucursal[0].administrative_area_level_2 = $scope.copy_city;
        }
      };

      $scope.editSucursal = function(item, index){
        $scope.edit = true;
        $scope.sucursal = item;
        $scope.address = item.address_sucursal[0];
        $scope.idx = index;
        $scope.copy_state = item.address_sucursal[0].administrative_area_level_1;
        $scope.copy_city = item.address_sucursal[0].administrative_area_level_2;
        $scope.statesArray.forEach(function(state){
          if(state.state == item.address_sucursal[0].administrative_area_level_1){
            $scope.address.administrative_area_level_1 = state;
            state.cities.forEach(function(city){
              if(city.city == item.address_sucursal[0].administrative_area_level_2){
                $scope.address.administrative_area_level_2 = city;
              }
            });
          }
        });
        console.log('--suvirsal-',item)
        $scope.showSucursal = true;
      }

      $scope.updateSucursal = function(item){
        item.address_sucursal[0].administrative_area_level_1 = item.address_sucursal[0].administrative_area_level_1.state;
        item.address_sucursal[0].administrative_area_level_2 = item.address_sucursal[0].administrative_area_level_2.city;
        $http.patch(item.url, item)
        .then(function(response){
          if(response){
            $http.patch(item.address_sucursal[0].url, item.address_sucursal[0])
            .then(function(respo){
              if(respo){
                $localStorage['save_create_sucursal'] = {}
                $state.reload();
                SweetAlert.swal("¡Listo!", "Sucursal actualizada correctamente.", "success");
                $scope.closeSucursal();
              }
            })
            .catch(function(err) {
              console.log('Error', err)
            });
          }
        })
        .catch(function(err) {
          console.log('Error', err)
        });
      }

    }
})();