(function () {
  'use-strict';

  var app = angular.module('inspinia');

  app.factory('PersistenceFactory', ['$http', 'url','SweetAlert','$sessionStorage',
   function($http, url, SweetAlert,$sessionStorage) {

    var PersistenceFactory = {};
    var jsonform = "";
    var token, decryptedToken, json_basic, json_return, valido, validador, dato, v;
    var dt = [];

    var json_data = {};
    //var form = document.getElementsByTagName("form");
    var elementos ={};
      //Valores reutilizables
    var inputValue, selectValue, txtareaValue, checkboxValue, type, attr, valor;

    var url = "http://system-persistence.ixulabs.com/";

    dt.urlP = url +'saam/persistence/'
    dt.urlP2 = url +'saam/persistenceEdit/'
    dt.id_module = 0;
    dt.params = {
      "org": "",
      "module": "",
      "token": "",
      "user": "",
      "status":false,
      "data":""
    }

    PersistenceFactory.interval = '';
    PersistenceFactory.init_return = '';
    PersistenceFactory.json_return = '';
    PersistenceFactory.json_basic = '';
    PersistenceFactory.json_init = '';
    PersistenceFactory.intervalTime = 20000;
    PersistenceFactory.count = 0;
    //clearInterval(PersistenceFactory.interval);

    PersistenceFactory.alert = function(){

      SweetAlert.swal({
        title: "¿Está seguro?",
        text: "Cuenta con información en está sección. ¿Desea continuar?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",confirmButtonText: "Continuar",
        cancelButtonText: "Comenzar de nuevo",
        closeOnConfirm: false,
        closeOnCancel: false },
          function(isConfirm){
            if (isConfirm) {
              SweetAlert.swal("Cargando!", "Los datos se están cargando.", "success");
              PersistenceFactory.init_return = ({status:'data_view'});
            } else {
              SweetAlert.swal("Eliminada!", "Datos eliminados.", "error");
              PersistenceFactory.init_return = ({status:'data_delete'});
              PersistenceFactory.editado(PersistenceFactory.json_basic);
            }
      });
    }

    PersistenceFactory.inicial =  function (org, module, user, jsonform) {

      PersistenceFactory.json_init = jsonform;
      PersistenceFactory.json_basic = jsonform;
      PersistenceFactory.init_return = '';

      if(PersistenceFactory.interval != ""){
        clearInterval(PersistenceFactory.interval);
        PersistenceFactory.interval = '';
      }

      decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
      token = JSON.parse(decryptedToken);

      dt.params.org = org;
      dt.params.module = module;
      dt.params.user = user;
      dt.params.token = token;

      $http.get(dt.urlP, {
        params : dt.params,
      }).success(function (data, headers) {
        if (data) {          
          if(data.count==0){
              PersistenceFactory.guardado();
          }else{
            dt.id_module = data.results[0].id;
            PersistenceFactory.json_return = JSON.parse(data.results[0].data);

            if(PersistenceFactory.validar(undefined,PersistenceFactory.json_return) == true){
              PersistenceFactory.alert();
            }else{
              PersistenceFactory.init_return = ({status:'data_view_equal'});
            }
          }
        }

        }).error(function (err) {

          console.log('Error'+err)
      });

      PersistenceFactory.count++;

    }

    PersistenceFactory.guardado = function () {

      dt.params.data = JSON.stringify(PersistenceFactory.json_basic);

      $http.post(dt.urlP, dt.params).success(function (data, headers) {
          dt.id_module = data.id;
        }).success(function (data) {
          PersistenceFactory.json_return = JSON.parse(data.data);
          PersistenceFactory.init_return = ({status:'data_new'});
      }).error(function (err) {
          console.log('Error: '+err)
      });
    }

    PersistenceFactory.editado = function (jsondt) {

      validador = PersistenceFactory.validar(jsondt,PersistenceFactory.json_return);

      dt.params.data = JSON.stringify(jsondt);

      if(validador == false){
        dt.params.data = JSON.stringify(jsondt);

        $http.put(dt.urlP2+dt.id_module+'/', dt.params).success(function (data, headers) {
          }).success(function (data) {
            PersistenceFactory.json_return = JSON.parse(data.data);
        }).error(function (err) {
            console.log('Error: '+err)
        });
      }
    }

    PersistenceFactory.eliminar = function () {

      //validador = PersistenceFactory.validar(jsondt,PersistenceFactory.json_return);
       dt.params.data = JSON.stringify(PersistenceFactory.json_init);
       
       $http.put(dt.urlP2+dt.id_module+'/', dt.params).success(function (data, headers) {
          }).success(function (data) {
            PersistenceFactory.json_return = JSON.parse(data.data);
        }).error(function (err) {
            console.log('Error: '+err)
        });
    }

    PersistenceFactory.valid = function valid(obj){
        if(typeof(obj) == "undefined" || obj=='text' ){
          obj = "";
        }else{
          if(obj.id){
            obj = obj.id;
          }
        }

        return obj;
      }

    PersistenceFactory.validar = function(json_basic,json_return){
      //json_return = Object.values(json_return);
      valido = false;

      if(json_basic != undefined){
        json_return = Object.values(json_return);
        json_basic = Object.values(json_basic);
        if(json_basic.length == json_return.length){
          if(JSON.stringify(json_basic) == JSON.stringify(json_return)){
            valido = true;
          }
        }
      }else{
        
        angular.forEach(json_return, function(values, data) {
          if(data != 'cantidades' && data != 'bell' && data != "address.country" && data != "address.country_code"
          && data != "listaD.value" && data != "vm.form.fianzas_only" && data != "vm.juridicalForm.fianzas_only"
          && data != 'new_task.fecha' && data != 'end_type' && data != 'campaign.repeatEmail' && data != 'campaign.sendingDate'
          && data != 'show_tags' && data != 'null' && data != 'new_siniestro.fecha' && data != 'new_siniestro.fechaIngreso'
          && data != 'new_siniestro.fechaSiniestro' && data != 'vm.show_state_city'  && data != 'new_siniestro.numero_siniestro'
          && data != 'vm.siniester_type' && data != 'vm.siniester_pay_form' && data != 'vm.siniester_data.tipo_de_cambio'
          && data != 'vm.bono.cantidad' && data != 'vm.bono.end_validity' && data != 'vm.bono.start_validity'
          && data != 'vm.bono.tipo_de_cambio' && data != 'select_provider' && data != 'checkRegister' && data != 'endorsement_type_manual'){
          /*Validacion datos que se llenan por default -
          Cartas, Contratantes, Paquetes, Mensajeria, Siniestros (Vida, Accidente, Auto, Daños), Bonos



          && data != '' */
            if(values != "" && values != " " && values != "false" && values != "?"){

              if(typeof(values) == "object"){
               angular.forEach(values, function(val, dat) {
                if(val.valor != "" && val.valor != " "){
                  if(data == 'html' && elementos.html[0].valor){
                    if(elementos.html[0].valor != val.valor){
                      valido = true;
                    }
                  }else{
                    valido = true;
                  }
                  //valido = true;
                }
               });
              }else{
                valido = true;
              }
            }
          }
        });

      }

      return valido;
    }

    PersistenceFactory.find_index = function (obj, datos, tipo) {
      dato = '';

      angular.forEach(obj, function(values, data) {
        //dato = '';

        if (tipo == 'id' && values.id == datos){
          dato = data;
        }
        if(tipo == 'name' && values.name == datos){
          dato = data;
        }
        if(tipo == 'url' && values.url == datos){
          dato = data;
        }
        if(tipo == undefined && values.url == datos){
          dato = data;
        }
        /*
        if(tipo == undefined && values.url == datos){
          dato = data;
        }*/
      });
      return dato;
    }

    PersistenceFactory.get_dataForm = function (form, adiccional){

      var cnt = 0;
      var cant;

      elementos = {
        cantidades : {}
      };

      function forEach_value(array){

        angular.forEach(array, function(value) {

          type = value.getAttribute('type');
          attr = value.getAttribute('ng-model');
          valor = PersistenceFactory.valid(value.value);
          cant = angular.element('[ng-model="'+attr+'"]');

          if(attr != 'main.cadena' && type != 'file'){

            if(type == 'radio'){
              if(value.getAttribute('aria-checked') == "true"){
                this[attr]=valor;
              }
            }else if(attr == 'vm.selected_affect' || attr == 'quotationNew.ramo' || attr == 'quotationNew.subramo'){
            // Solo para Siniestro y Cotizacion  ya q lo guarda como objeto:00
              if(valor != ''){
                angular.forEach(cant[0], function(v,a) {
                  if(v.value == valor){
                    this[attr]=a;
                  }
                },elementos);
              }
            }else{
              this.cantidades[attr]=cant.length;
              //Valor cambia si es checkbox
              if(type == 'checkbox'){
                valor = value.getAttribute('aria-checked');
              }

              if(this.cantidades[attr]>1){

                if(this[attr] == undefined){
                  this[attr]=[{'valor':valor}];
                }else{
                  this[attr][this[attr].length]= {'valor':valor};
                }

              }else{
                this[attr]=valor;
              }
            }
          }
        },elementos);
      }
      //Tomar el autocompetar
      if(dt.params.module == 'Siniestro_Vida' || dt.params.module == 'Siniestro_Auto' || dt.params.module == 'Siniestro_Danio'){
        if( adiccional != '' && adiccional != undefined){
          elementos['vm.selected_affect.val']={'id':adiccional.value.id,'nombre':adiccional.val};
        }
      }
      /*
      if(dt.params.module == 'Siniestro_Danio'){
        if( adiccional1 != '' && adiccional1 != undefined){
          elementos['vm.selected_affect.val']={'id':adiccional1.id,'nombre':adiccional1.val};
        }
      }*/

      angular.forEach(form, function(value, key, name) {
        inputValue = value.getElementsByTagName("input");
        selectValue = value.getElementsByTagName("select");
        txtareaValue = value.getElementsByTagName("textarea");
        checkboxValue = value.getElementsByTagName("checkbox");

        forEach_value(inputValue);
        forEach_value(selectValue);
        forEach_value(txtareaValue);
        forEach_value(checkboxValue);
      });

        return elementos;

    }

    PersistenceFactory.set_inputs = function (json){
      console.log('set_inputs: ')
      angular.forEach(json, function(values, data) {

        if(data != 'bell' && data != 'letter.model' && data != 'cantidades' && data != 'null'
        && data !='vm.selected_affect' && data != 'endorsement_type_manual'){
          valor = angular.element('[ng-model="'+data+'"]');
          if(valor.length>0){
            type = valor[0].type;
          }else{
            type = 'Error de Type!!';
          }

          valor.val(type);
          if(type == 'radio'){
            valor = angular.element('[ng-model="'+data+'"]','[value="'+values+'"]');
            valor.prevObject[0].checked = true;
            valor.prevObject[0].setAttribute('aria-checked', 'true')

          }else if(data == 'html'){
            document.getElementById(valor[0].id).innerHTML = values[0].valor;
            document.getElementById(valor[1].id).innerHTML = values[0].valor;

            document.getElementById(valor[0].id).value = values[0].valor;
            document.getElementById(valor[1].id).value = values[0].valor;

          }else if(valor.length>1){
            angular.forEach(valor, function(vale, dat) {
              if(values[dat].valor != 'text' && values[dat].valor != 'textarea' && values[dat].valor != 'tel'){

                type = vale.getAttribute('type');

                if(type == 'checkbox'){
                  if(values[dat].valor == "true"){
                    valor[dat].checked = values[dat].valor;
                    valor[dat].setAttribute('aria-checked', values[dat].valor);
                  }
                  
                }else{
                  
                  if(values[dat] != undefined && values[dat].valor != ""){
                    vale.value = values[dat].valor;
                  }
                }
              }
              
            });
          }else{
            //type = values.getAttribute('type');
            if(type == 'checkbox'){
              if(values == "true"){
                valor[0].checked = values;
                valor[0].setAttribute('aria-checked', values);
              }
            }else{
              valor.val(values);
            }
          }
      }
      });
    }

    PersistenceFactory.val_botons = function(data){
        v = angular.element('[ng-disabled="'+data+'"]');
        v[0].disabled = false;
    }

    PersistenceFactory.changeInt = function(int){
        var a_int = int;
        a_int = parseInt(a_int.substr(7,a_int.length));
        return a_int;
       }

    return PersistenceFactory;

  }]);

}());

