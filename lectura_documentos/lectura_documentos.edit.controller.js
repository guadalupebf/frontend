(function() {
    'use strict';

    angular.module('inspinia')
        .controller('LecturaDocumentosEditController', LecturaDocumentosEditController);

    LecturaDocumentosEditController.$inject = ['$rootScope', '$stateParams','$sessionStorage','FileUploader','$state','$scope', 'dataFactory', 'datesFactory', '$http', 'providerService', 'SweetAlert', 'MESSAGES','url','exportFactory'];

    function LecturaDocumentosEditController($rootScope, $stateParams, $sessionStorage,FileUploader, $state, $scope, dataFactory, datesFactory, $http, providerService, SweetAlert, MESSAGES,url, exportFactory) {
      
      var vm = this;
      var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
      var token = JSON.parse(decryptedToken);

      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var usr = JSON.parse(decryptedUser);

      $scope.lectura_id = $stateParams.id;
      
      $scope.archivos = [];
      $scope.archivos_cargados = false;
      $scope.lectura_object;
      $scope.log900 = [];
      vm.reset = reset;
      
      $scope.showQuotation = false;
      $scope.showInfoQuotation = false;
      $scope.aseguradoras = [];
      $scope.ramos = [];
      $scope.quotationNew = [{
        'contratante': {}
      }];

      var uploader = $scope.uploader = new FileUploader({
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        }
      });


      $scope.form = {}

      $scope.tipo_poliza = [{
        'id': 1,
        'name': 'Individual'
      },{
        'id': 12,
        'name': 'Colectiva'
      },{
        'id': 3,
        'name': 'Grupo'
      }]
      
      $scope.tipo_nombre = [{
        'id': 1,
        'name': 'Folio'
      },{
        'id': 2,
        'name': 'Póliza'
      }]


      $scope.items_generales = [
        {
          "name":"Selecciona una opción" , 
          "id": 0,
          "active": true
        },{
          "name":"Número de póliza" , 
          "id": "policy_number",
          "active": true
        },{
          "name":"Aseguradora" , 
          "id": "insurance",
          "active": true
        },{
          "name":"Ramo del seguro" , 
          "id": "insurance_branch",
          "active": true
        },{
          "name":"Tipo de moneda" , 
          "id": "currency",
          "active": true
        },{
          "name":"Forma de pago" , 
          "id": "payment_method",
          "active": true
        },{
          "name":"Paquete del contrato" , 
          "id": "policy_package",
          "active": true
        },{
          "name":"Nombre" , 
          "id": "name",
          "active": true
        },{
          "name":"Fecha de nacimiento" , 
          "id": "dob",
          "active": true
        },{
          "name":"Sexo" , 
          "id": "sex",
          "active": true
        },{
          "name":"RFC" , 
          "id": "rfc",
          "active": true
        },{
          "name":"Número de teléfono" , 
          "id": "phone",
          "active": true
        },{
          "name":"Correo electrónico" , 
          "id": "email",
          "active": true
        },{
          "name":"Dirección" , 
          "id": "address",
          "active": true
        },{
          "name":"Dirección complementaria" , 
          "id": "address_2",
          "active": true
        },{
          "name":"Código postal" , 
          "id": "zip_code",
          "active": true
        },{
          "name":"Conducto de pago" , 
          "id": "payment_conduit",
          "active": true
        },{
          "name":"Prima Neta" , 
          "id": "p_neta",
          "active": true
        },{
          "name":"Monto de Derecho" , 
          "id": "derecho",
          "active": true
        },{
          "name":"Monto de RPF" , 
          "id": "rpf",
          "active": true
        }
      ]

      $scope.items_autos = [
        {
          "name":"Marca del vehículo" , 
          "id": "brand",
          "active": true
        },{
          "name":"Descripción del vehículo" , 
          "id": "vehicle",
          "active": true
        },{
          "name":"Versión del vehículo" , 
          "id": "version",
          "active": true
        },{
          "name":"Año del vehículo" , 
          "id": "year_model",
          "active": true
        },{
          "name":"Número de serie" , 
          "id": "serial",
          "active": true
        },{
          "name":"Código del motor" , 
          "id": "motor",
          "active": true
        },{
          "name":"Código de placas" , 
          "id": "plates",
          "active": true
        },{
          "name":"Tipo de carga" , 
          "id": "charge_type",
          "active": true
        },{
          "name":"Estado de circulación" , 
          "id": "circulation_state",
          "active": true
        },{
          "name":"Color del vehículo" , 
          "id": "vehicle_color",
          "active": true
        },{
          "name":"Uso del vehículo" , 
          "id": "vehicle_use",
          "active": true
        },{
          "name":"Servicio del vehículo" , 
          "id": "vehicle_service",
          "active": true
        }];

      $scope.items_vida = [{
          "name":"Fumador" , 
          "id": "smoker_condition",
          "active": true
        },{
          "name":"Tipo de suma asegurada" , 
          "id": "type_sa",
          "active": true
        },{
          "name":"Tipo de póliza" , 
          "id": "policy_type",
          "active": true
        },{
          "name":"Beneficiario" , 
          "id": "beneficiarie_name",
          "active": true
        },{
          "name":"Fecha nacimiento beneficiario",
          "id": "beneficiarie_birthdate",
          "active": true
        },{
          "name":"Tipo régimen",
          "id": "j_name",
          "active": true
        },{
          "name":"Tipo de relación",
          "id": "relationship",
          "active": true
        },{
          "name":"Porcentaje designado",
          "id": "designation_percentage",
          "active": true
        },{
          "name":"RFC beneficiario",
          "id": "beneficiarie_rfc",
          "active": true
        },{
          "name":"Antigüedad",
          "id": "antiquity",
          "active": true
        },{
          "name":"Sexo beneficiario" , 
          "id": "beneficiarie_sex",
          "active": true
        },{
          "name":"Antigüedad(Beneficiario)" , 
          "id": "beneficiarie_antiquity",
          "active": true
        }];
      
        $scope.items_gmm = [{
          "name":"Nivel hospitalario" , 
          "id": "hospital_level",
          "active": true
        },{
          "name":"Nombre Dependiente" , 
          "id": "relationship_name",
          "active": true
        },{
          "name":"Fecha de nacimiento Dependiente" , 
          "id": "relationship_birthdate",
          "active": true
        },{
          "name":"Sexo Dependiente" , 
          "id": "relationship_sex",
          "active": true
        },{
          "name":"Antigüedad Dependiente" , 
          "id": "relationship_antiquity",
          "active": true
        },{
          "name":"Tipo de póliza" , 
          "id": "policy_type",
          "active": true
        },{
          "name":"Antigüedad",
          "id": "antiquity",
          "active": true
        },{
          "name":"Tipo de relación",
          "id": "relationship",
          "active": true
        }];

        $scope.items_danios = [{
          "name":"Tipo de daño" , 
          "id": "damage_type",
          "active": true
        },{
          "name":"Dirección de la pertenencia" , 
          "id": "item_address",
          "active": true
        },{
          "name":"Pertenencia asegurada" , 
          "id": "insured_item",
          "active": true
        },{
          "name":"Detalles de la pertenencia" , 
          "id": "item_details",
          "active": true
        },];

        


      activate();

      function reset(){
        // var filename = 'noombre_del_archivo'
        // $http.get(url.IP + 'presigned-url?filename='+filename+'&').then(function(response){
        //   console.log(response);
        // })
      }
      
      function activate(){
        $scope.items = $scope.items_generales;
        $scope.item_active = $scope.items[0];
        $scope.fields900 = [];
        var date = new Date();
        var curr_date = date.getDate();
        var curr_month = date.getMonth() + 1; //Months are zero based
        var curr_year = date.getFullYear();
        var d = curr_year + "-" + curr_month + "-" + curr_date;
        providerService.getProviderByKey(d)
        .then(function(data){
            $scope.aseguradoras = data.data;
        });
        if ($scope.lectura_id && $scope.lectura_id != 0){
          
          $http.get(url.IP + 'lectura-archivos-edit/' + $scope.lectura_id).then(function(response){
            $scope.lectura_object = response.data;

            $scope.lectura_object.tags_existentes_general.forEach(function(etiqueta){
              $scope.items.map(function(tag){
                if(etiqueta == tag.name){
                  tag['active'] = false;
                }
                return tag
              })
            })

            $scope.tipo_poliza.forEach(function(tp){
              if (tp['id'] == parseInt($scope.lectura_object['tipo_poliza'])){
                $scope.form['tipo_poliza'] = tp;
              }
            })

            providerService.getProviderByKey(d)
            .then(function(data){
                $scope.aseguradoras = data.data;
                $scope.aseguradoras.forEach(function(tp){
                  if (tp['id'] == parseInt($scope.lectura_object['aseguradora'])){
                    $scope.form['aseguradora'] = tp;
                    $scope.changeAseguradora();
                  }
                })
            });
            
            $scope.form['nombre'] = $scope.lectura_object['nombre'];
            $scope.archivos_cargados = true;
            $scope.archivos = $scope.lectura_object.archivos_lectura;
            if($scope.lectura_object.tags_lectura_archivos.length > 0){
              $scope.items.forEach(function(item){
                if (item.name == $scope.lectura_object.tags_lectura_archivos[0].name){
                  $scope.item_active = item;
                }
              });
              $scope.name_for_new_tag = $scope.lectura_object.tags_lectura_archivos[0].name;
            }  
            $scope.fields900 = [];
            $scope.fields900 = $scope.lectura_object.tags_lectura_archivos;
          })
        }
      }

      $scope.changeRamo = function(){
        // $scope.form.subramo = undefined;
        

        if ($scope.form.ramo.ramo_code == 1){
          $scope.items = $scope.items.concat($scope.items_vida)
        }
        if (parseInt($scope.form.ramo.ramo_code) == 3){
          $scope.items = $scope.items.concat($scope.items_autos)
        }
        if (parseInt($scope.form.ramo.ramo_code) == 2){
          $scope.items = $scope.items.concat($scope.items_gmm)
        }
        // $scope.form.ramo.subramo_ramo.map(function(item){
        //   if ($scope.form.ramo.ramo_code == 3 && item.subramo_code != 9){
        //     item['disabled'] = true;
        //   } else {
        //     item['disabled'] = false;
        //   }
        //   return item;
        // })
        $scope.form.ramo.subramo_ramo.forEach(function(tp){
          if (tp['id'] == parseInt($scope.lectura_object['subramo'])){
            $scope.form['subramo'] = tp;
            if (tp['subramo_code'] != 9){
              $scope.items = $scope.items_generales;
              $scope.items = $scope.items.concat($scope.items_danios);
            }
          }
        })

        
      }

      $scope.changeAseguradora = function(){
        $scope.form.ramo = undefined;
        $http.get(url.IP + 'ramos-by-provider/' + $scope.form['aseguradora'].id)
        .then(function(ramos){
          $scope.ramos = ramos.data;
          // $scope.ramos = $scope.ramos.map(function(ramo){
          //   if (ramo.ramo_code != 3){
          //     ramo['disabled'] = true;
          //   } else {
          //     ramo['disabled'] = false;
          //   }

          //   return ramo;
          // })
          $scope.ramos.forEach(function(tp){
            if (tp['id'] == parseInt($scope.lectura_object['ramo'])){
              $scope.form['ramo'] = tp;
              $scope.changeRamo();
            }
          })
        })
      }
      

      $scope.createQuotation = function(){
        $scope.showQuotation = true;
      };

      $scope.closeQuotation = function(){
        $scope.showQuotation = false;
        vm.form = [{
        }];
      };

      uploader.onSuccessItem = function(fileItem, response, status, headers) {
        //toaster.success(MESSAGES.OK.UPLOADFILES);
        if (status == 200){
          $scope.archivos_cargados = true;
          $scope.archivos = response['archivos_lectura'];
          $scope.lectura_object = response;
          setTimeout(function(){
            $state.go('config.edit_lectura_documentos',{'id':response.id});
          },1500)
        }
      };

      uploader.onErrorItem = function(fileItem, response, status, headers) {
      };

      $scope.atras = function(){
        $scope.$broadcast("ngAreas:reset", {})
        $state.go('config.lectura_documentos');
      }

      $scope.guardar = function(){
        $scope.log900 =  $scope.log900.map(function(item){
          if(item && item['url']){
           return item 
          } else {
            item['owner'] = $scope.lectura_object['url'];
            item['org_name'] = usr.urlname;
          }
          return item;
        });

        var payload = {
          nombre: $scope.form.nombre,
          tipo_poliza: $scope.form.tipo_poliza ? $scope.form.tipo_poliza.id : 0,
          aseguradora: $scope.form.aseguradora ? $scope.form.aseguradora.id: 0,
          ramo: $scope.form.ramo ? $scope.form.ramo.id : $scope.form.ramo,
          subramo: $scope.form.subramo ? $scope.form.subramo.id : $scope.form.subramo
        }
        $http.patch($scope.lectura_object.url, payload).then(function(){
          toastr.success('Datos actualizados');
        });


        var to_update = $scope.log900.filter(function(item){
          if(!item.url){
            return false;
          } else {
            return true
          }
        })

        $scope.log900 = $scope.log900.filter(function(item){
          if(!item.url){
            return true;
          } else {
            return false;
          }
        })


        if($scope.log900 && $scope.log900.length > 0){
            $http.post(url.IP + 'tag-lectura-archivos/', $scope.log900).then(function(response){
            $scope.log900 = response.data;
            toastr.success('Tags creados');
            $scope.$broadcast("ngAreas:reset", {})
            // location.reload();
          });
        }
        
        if(to_update && to_update.length > 0){
          to_update.forEach(function(item){
            $http.patch(item.url, item);
          });
          $scope.$broadcast("ngAreas:reset", {})
          toastr.success('Tags actulizados');
          $state.go('config.lectura_documentos')
        }

      }

      uploader.onAfterAddingFile = function(fileItem) {
        var pageNumber = prompt("Ingrese el numero de hoja que desea agregar (en caso de que el PDF tenga más de una hoja)", "1");
        if (pageNumber != null) {
          fileItem.formData = [];
          fileItem.formData.push({
              arch: fileItem._file,
              nombre: fileItem.file.name,
              nombre_entrenamiento: $scope.form.nombre,
              tipo_poliza: $scope.form.tipo_poliza ? $scope.form.tipo_poliza.id : 0,
              aseguradora: $scope.form.aseguradora ? $scope.form.aseguradora.id: 0,
              ramo: $scope.form.ramo ? $scope.form.ramo.id : $scope.form.ramo,
              subramo: $scope.form.subramo ? $scope.form.subramo.id : $scope.form.subramo,
              pageNumber: pageNumber
          });
          $scope.specialchar = []
          var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-=" 
          var str = fileItem.file.name;    
      
          if ($scope.specialchar.length > 0) {
            $scope.uploader.queue.splice($scope.uploader.queue.indexOf(fileItem),1)
            SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales: '+$scope.specialchar,'error') 
          }
          if(fileItem){
            $scope.countFile++;
          }
        }


      };

      $scope.cargarNuevaPoliza = function(){
        $scope.url_lectura = url.IP + 'lectura-documentos/?org='+ usr.urlname;
        // console.log('queue', $scope.uploader.uploadAll());
        uploader.uploadAll(); 
      }

      uploader.onBeforeUploadItem = function(item) {
        item.url = $scope.url_lectura;
        // item.formData[0].name = item.file.name;
      };

      $scope.reset = function(){

      }

      $scope.itemChanged = function(name){
        if (name == 'Selecciona una opción'){
          SweetAlert.swal("¡Error!", "Selecciona un nombre de etiqueta válido", "error");
          $scope.items.forEach(function(item){
            if (item.name == $scope.name_for_new_tag){
              $scope.item_active = item
            }
          })
          return
        }
        
        $scope.name_for_new_tag = name;
      }

      $scope.onAddArea = function(ev, boxId, areas, area) {
        $scope.log900= areas;
        console.log('areas', areas);
        $scope.$apply();
      }
      $scope.onRemoveArea = function(ev, boxId, areas, area) {
        if (boxId && boxId.url){
          $http.delete(boxId.url);
        }
        $scope.log900= areas;
        console.log('areas',areas);
        $scope.$apply();
      }
      
      $scope.onChangeAreas900 = function(ev, boxId, areas, area) {
        $scope.log900 = areas;
        $scope.$apply();
      }
    }
})();