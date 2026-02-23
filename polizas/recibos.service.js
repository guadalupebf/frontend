(function(){
  'use strict';

  angular
      .module('inspinia')
      .factory('receiptService', receiptService);

  receiptService.$inject = ['dataFactory', 'url', 'statusReceipt', '$http', '$q', 'fileService', '$localStorage', '$sessionStorage'];
  function receiptService(dataFactory, url, statusReceipt, $http, $q, fileService, $localStorage, $sessionStorage) {
    // var dfd = $q.defer();
      /* Información de usuario */
      var infoUser = $localStorage.infoUser;

      var service = {
          createReceiptService: createReceiptService,
          getNextReceipts: getNextReceipts,
          getReceiptsService: getReceiptsService,
          getReceiptService: getReceiptService,
          getReceiptsReadService: getReceiptsReadService,
          getReceiptsReadChildrensService: getReceiptsReadChildrensService,
          getReceiptInfo: getReceiptInfo,
          getReceiptsInfoService: getReceiptsInfoService,
          getReceiptsByUriService: getReceiptsByUriService,
          updateReceiptService: updateReceiptService,
          updateReceiptServiceL: updateReceiptServiceL,
          getPolicyReceipts: getPolicyReceipts,
          deleteReceipt: deleteReceipt,
          deleteReceipts: deleteReceipts,
          cancelReceiptsFrom: cancelReceiptsFrom,
          getValidReceipts: getValidReceipts,
          getFiles: getFiles,
          setReceiptID: setReceiptID,
          getReceiptID: getReceiptID,
          patchReceipt: patchReceipt,
          getDashReceipts : getDashReceipts,
          getChildrenReceipts:getChildrenReceipts,
          getCountReceipts: getCountReceipts
      };

      
      return service;

      ////////////

      var receiptID = 0;

      function setReceiptID(id){
        receiptID = id;
      }

      function getReceiptID(){
        return receiptID;
      }

      function createReceiptService(data){
        var dfd = $q.defer();
        // //console.log(data);
          ////console.log('createReceiptService', data);
          return $http.post(url.IP + 'recibos/', data)
              .then(createReceiptServiceComplete)
              .catch(createReceiptServiceFailed);

              function createReceiptServiceComplete(response){
                  dfd.resolve(response.data);
                  return dfd.promise;
              }

              function createReceiptServiceFailed(error){
                  dfd.reject(error);
                  return dfd.promise;
              }
      }

      function getPolicyReceipts(polizaUrl){
        return $http.get(polizaUrl)
          .then(done)
          .catch(fail);

          function done(result){

            return result;
          }

          function fail(error){
            ////console.log("getPolicyReceipts Error", error);
            return error;
          }
      }

      // Receipt always had poliza (obj.poliza)
      function getNextReceipts(receipt){
          return $http.get(receipt.poliza.url)
              .then(getNextReceiptsComplete)
              .catch(getNextReceiptsFailed);

          function getNextReceiptsComplete(res){
              var deferred = $q.defer();
              var receipts = [];
              angular.forEach(res.data.recibos_poliza, function(res){
                  receipts.push($http.get(res));
                  // deferred.resolve(res);
                  // receipts.push(deferred.promise);
              });
              ////console.log('receipt', receipt);

              var receiptsToCancel = [];
              $q.all(receipts)
                  .then(function(results){
                      angular.forEach(results, function(res){
                          ////console.log('results', res);
                          if (receipt.recibo_numero <= res.data.recibo_numero) {
                              receiptsToCancel.push(res.data);
                              ////console.log('add');
                          }
                      });
                      deferred.resolve(receiptsToCancel);
                  });
              return deferred.promise;
              //
              // var nextReceipts = getAllReceiptsFromCollection(res.data.recibos_poliza);
              // nextReceipts.then(function(data){
              //   ////console.log('promise', data);
              // });
              // ////console.log('nextReceipts', nextReceipts);
              // return nextReceipts;
          }

          function getNextReceiptsFailed(error){
              return error;
          }
      }



      function getDashReceipts(order,asc){
        var dfd = $q.defer();
        infoUser = $localStorage.infoUser;
        // if(infoUser.staff && !infoUser.superuser){
        //   var chart_receipt = 'v2/recibos/graficas-recibos/';
        var chart_receipt = 'graficas-recibos/';
        var params = {
          order: order,
          asc: asc,
          tipo: 'total'
        }
        return $http({
                    method: 'GET',
                    url: url.IP + chart_receipt,
                    params: params
                })
                .then(getReceiptsServiceComplete)
                .catch(getReceiptsServiceFailed);

        function getReceiptsServiceComplete(response) {
          console.log('iiiiiiiiiii',response)
          var results = {
            data: response.data.results,
            config: {
              count: response.data.count,
              next: response.data.next,
              previous: response.data.previous
            }
          };
            // console.log(results)

          dfd.resolve(results);
          return dfd.promise;
          // dfd.resolve(response.data.results);
          //   return dfd.promise;
        }

        function getReceiptsServiceFailed(error) {
            ////console.log('getReceiptsServiceFailed', error);
        }
      }

      function getChildrenReceipts(receipt_id){
        var dfd = $q.defer();
        return $http.get(url.IP + 'get-receipt-children/'+ receipt_id)
                .then(getReceiptsServiceComplete)
                .catch(getReceiptsServiceFailed);

        function getReceiptsServiceComplete(response) {
          dfd.resolve(response.data);
            return dfd.promise;
        }

        function getReceiptsServiceFailed(error) {
            ////console.log('getReceiptsServiceFailed', error);
        }
      }


      function getCountReceipts(){
        var dfd = $q.defer();
        return $http.get(url.IP + 'count-receipts/')
                .then(getReceiptsServiceComplete)
                .catch(getReceiptsServiceFailed);

        function getReceiptsServiceComplete(response) {
          dfd.resolve(response.data.results);
            return dfd.promise;
        }

        function getReceiptsServiceFailed(error) {
            ////console.log('getReceiptsServiceFailed', error);
        }
      }

      function getValidReceipts(){
        var dfd = $q.defer();
        return $http.get(url.IP + 'v1/receipts/')
                .then(getReceiptsServiceComplete)
                .catch(getReceiptsServiceFailed);
                
        function getReceiptsServiceComplete(response) {
          //dfd.resolve(response.data.results);
            //return dfd.promise;
            var results = {
                  data: response.data,
                  config: {
                    count: response.data.count,
                    next: response.data.next,
                    previous: response.data.previous
                  }
                };

                return results;
            //------------------------------------------------------------------------------------------ 1
        //console.log('response', response);
        if (response.data) {


          response.data.results.forEach(function(item) {
            //console.log('status', item.status);
          });

          return response.data.results;
        }
        return getReceiptsServiceFailed(response);
      }
        

        function getReceiptsServiceFailed(error) {
            console.log('getReceiptsServiceFailed', error);
        }
      }

      function getReceiptsService() {
        // var dfd1 = $q.defer();
        var dfd = $q.defer();
          return $http.get(url.IP + 'recibos/')
              .then(getReceiptsServiceComplete)
              .catch(getReceiptsServiceFailed);

          function getReceiptsServiceComplete(response) {
              // //console.log('__________',response);
              dfd.resolve(response.data.results);
              return dfd.promise;
          }

          function getReceiptsServiceFailed(error) {
            dfd.reject(error);
            return dfd.promise;
              ////console.log('getReceiptsServiceFailed', error);
          }
      }

      function getReceiptsReadService() {
        var dfd = $q.defer();
          return $http.get(url.IP + 'leer-recibos/')
              .then(getReceiptsServiceComplete)
              .catch(getReceiptsServiceFailed);

          function getReceiptsServiceComplete(response) {
              dfd.resolve(response.data.results);
              return dfd.promise;
          }

          function getReceiptsServiceFailed(error) {
              ////console.log('getReceiptsServiceFailed', error);
          }
      }

      function getReceiptsReadChildrensService() {
        var dfd = $q.defer();
          return $http.get(url.IP + 'recibo/info/')
              .then(getReceiptsReadChildrensServiceComplete)
              .catch(getReceiptsReadChildrensServiceFailed);

          function getReceiptsReadChildrensServiceComplete(response) {
              dfd.resolve(response.data.results)
              return dfd.promise;
          }

          function getReceiptsReadChildrensServiceFailed(error) {
              ////console.log('getReceiptsReadChildrensServiceFailed', error);
          }
      }

      function getReceiptInfo(receipt){
        var id = receipt.id ? receipt.id : receipt;

        return $http.get(url.IP + 'recibo/info/' + id + "/")
              .then(getReceiptsInfoServiceComplete)
              .catch(getReceiptsInfoServiceFailed);

          function getReceiptsInfoServiceComplete(response) {
              // dfd.resolve(response);
              return response ;
          }

          function getReceiptsInfoServiceFailed(error) {
              ////console.log('getReceiptsInfoServiceFailed', error);
          }
      }

      function getReceiptsInfoService() {
        var dfd = $q.defer();
          return $http.get(url.IP + 'recibo/info/')
              .then(getReceiptsInfoServiceComplete)
              .catch(getReceiptsInfoServiceFailed);

          function getReceiptsInfoServiceComplete(response) {
            dfd.resolve(response.data.results);
              return dfd.promise;
          }

          function getReceiptsInfoServiceFailed(error) {
              ////console.log('getReceiptsInfoServiceFailed', error);
          }
      }

      function getReceiptService(data){
          if(!isNaN(Number(data.polizaId))) {
              data.recibosId = url.IP + 'recibos/' + data.recibosId + '/';
          } else {
              data.recibosId = data.recibosId;
          }
          return $http.get(data.recibosId)
              .then(getReceiptServiceComplete)
              .catch(getReceiptServiceFailed);

          function getReceiptServiceComplete(response) {
              return response.data;
          }

          function getReceiptServiceFailed(error) {
              ////console.log('Error getReceiptServiceFailed:', error);
          }
      }

      function getReceiptsByUriService(data){
        // var dfd = $q.defer();
          return $http.get(data)
              .then(getReceiptsByUriServiceComplete)
              .catch(getReceiptsByUriServiceFailed);

          function getReceiptsByUriServiceComplete(res){
            // //console.log('res',res);
              return res.data;
          }

          function getReceiptsByUriServiceFailed(error){
              return error;
          }
      }

      function updateReceiptService(editedObj){
        if(editedObj.poliza){
          delete editedObj['poliza']
        }

        if(editedObj.status == 4){
          editedObj.pay_doc = ""
          editedObj.pay_form = 1
          editedObj.pay_date = new Date()
        }
          return $http.patch(editedObj.url , editedObj)
              .then(updateReceiptServiceComplete)
              .catch(updateReceiptServiceFailed);

          function updateReceiptServiceComplete(response){
              return response;
          }

          function updateReceiptServiceFailed(error){
              ////console.log('Error updateReceiptServiceFailed:', error);
              return error;
          }
      }

      function updateReceiptServiceL(editedObj){
        if(editedObj.poliza){
          delete editedObj['poliza']
        }

        if(editedObj.status == 4){
          editedObj.pay_doc = null
          editedObj.pay_form = null
          editedObj.pay_date = null
          editedObj.curr_rate = null
          editedObj.bank = null
          editedObj.liquidacion_date = null
          editedObj.liquidacion_doc = null
          editedObj.liquidacion_form = null
          editedObj.liquidacion_curr_rate = null
          editedObj.liquidacion_bank = null
          editedObj.liquidacion_folio = null
          editedObj.folio_pago = null
          editedObj.status = 4
        }
        if (editedObj.status == 1) {
          editedObj.user_pay = editedObj.user_pay ? editedObj.user_pay : null
          editedObj.folio_pago = editedObj.folio_pago ? editedObj.folio_pago : null
        }else{
          console.log('--quitado3963--',editedObj)
          // editedObj.user_pay = null          
        }
          return $http.patch(editedObj.url , editedObj)
              .then(updateReceiptServiceComplete)
              .catch(updateReceiptServiceFailed);

          function updateReceiptServiceComplete(response){
              return response;
          }

          function updateReceiptServiceFailed(error){
              ////console.log('Error updateReceiptServiceFailed:', error);
              return error;
          }
      }

      function deleteReceipts(receipts){
        var dfd = $q.defer()
        var res = [];
        ////console.log("delete",receipts);
        receipts.forEach(function(receipt){
          deleteReceipt(receipt)
            .then(function(response){

              res.push(response.data);
              if(res.length == receipts.length){
                dfd.resolve(res);
              }
            });
        });

        return dfd.promise;
      }

      function deleteReceipt(receiptObj){
        return $http.delete(receiptObj.url)
          .then(function(response){
            return response;
          }).catch(function(error){
            ////console.log("error");
            return error;
          })
      }

      function cancelReceiptsFrom(receipt,id_poliza){
        if (receipt.policy) {
          if (receipt.policy.url) {
            receipt.policy = receipt.policy.url
          }
        } else{
          receipt.policy = receipt.policy
        }
        
        if(receipt.receipt_type != 1 || !receipt.policy){
          var params = {
            'model': 4,
            'event': "PATCH",
            'associated_id': receipt.id,
            'identifier': ' actualizo el recibo a cancelado. '
          }
          dataFactory.post('send-log/', params).then(function success(response) {
            console.log('-------3 cancelado-----',response)
            return response;
          });
          $http.patch(receipt.url, {status: 2, description: receipt.description ? receipt.description : 'Cancelado en ' + new Date().toUTCString().split('T')[0]})

        } else {
          // $http.get(receipt.policy)
          $http.get(url.IP+'polizas/'+id_poliza)
          .then(function(insuranceResponse){
            var waitForData = [];

            var insurance = insuranceResponse.data;
            insurance.recibos_poliza.forEach(function(recibo_en_poliza){
              $http.get(recibo_en_poliza).then(function success(response) {
                var recibo_en_poliza_info = response.data;
                if((recibo_en_poliza_info.status != 1 && recibo_en_poliza_info.status != 5 && recibo_en_poliza_info.status != 6) && recibo_en_poliza_info.receipt_type !=3){
                  $http.patch(recibo_en_poliza_info.url, {status: 2, description: receipt.description ? receipt.description : 'Cancelado en ' + new Date().toUTCString().split('T')[0]})
                }

                var params = {
                  'model': 4,
                  'event': "PATCH",
                  'associated_id': recibo_en_poliza_info.id,
                  'identifier': "canceló el recibo."
                }
                dataFactory.post('send-log/', params).then(function success(response) {
                  
                });
              })
            });
            $http.patch(insurance.url,{status: 11}).then(function success(argument) {
              if(argument.status == 200 || argument.status == 201){
                if (insurance.document_type == 1 || insurance.document_type == 'Póliza') {
                  var params = {
                    'model': 1,
                    'event': "PATCH",
                    'associated_id': insurance.id,
                    'identifier': "canceló la póliza mediante cancelación de recibo."
                  }
                }else if (insurance.document_type == 3 || insurance.document_type == 'Carátula') {
                  var params = {
                    'model': 18,
                    'event': "PATCH",
                    'associated_id': insurance.id,
                    'identifier': "canceló la colectividad mediante cancelación de recibo."
                  }
                }else if (insurance.document_type == 7 || insurance.document_type == 'Fianza') {
                  var params = {
                    'model': 13,
                    'event': "PATCH",
                    'associated_id': insurance.id,
                    'identifier': "canceló la fianza mediante cancelación de recibo."
                  }
                }else {
                  var params = {
                    'model': 1,
                    'event': "PATCH",
                    'associated_id': insurance.id,
                    'identifier': "canceló la poliza mediante cancelación de recibo."
                  }
                }
                dataFactory.post('send-log/', params).then(function success(response) {
                  
                });
              }
            });
          })  
              
        }


      }

      function cancelReceiptsFrom_DEPRECATED(receipt){
        var dfd = $.Deferred();
        var canceledReceipts = [];
        var toCancel = 0;
        var canceled = 0;
        var fromDate = new Date(receipt.fecha_inicio)
        fromDate = new Date( fromDate.getTime() + ( fromDate.getTimezoneOffset() * 60000 ) );

        // Cancelando poliza



        canceling();
        updateReceiptService(receipt)
          .then(function(canceledRecepit){
            canceledReceipts.push(canceledRecepit.data);
            if(receipt.poliza){
              canceling();
              $http.get(receipt.poliza)
                .then(function(insurance){
                  insurance.data.recibos_poliza.forEach(function(recibo_en_poliza){
                    canceling();
                    getReceiptsByUriService(recibo_en_poliza)
                      .then(function (recibo) {
                        var dateInit = moment(recibo.fecha_inicio,"YYYY-MM-DD").toDate();
                        if(fromDate < dateInit){
                          recibo.status = receipt.status;
                          canceling();
                          updateReceiptService(recibo)
                            .then(function(canceledRecepit){
                              canceledReceipts.push(canceledRecepit.data);
                              isDone();
                            });
                        }
                        isDone();
                      });
                  });
                  isDone();
                });
            }
            isDone();
          });

        function canceling(){
          toCancel++;
        }

        function isDone(){
          canceled++
          if(canceled >= toCancel){
            dfd.resolve(canceledReceipts);
          }
        }

        return dfd.promise();
      }


      function getFiles(data) {
        return fileService.getFiles(url.IP + 'recibos/' + data + '/archivos/');
      }

      function patchReceipt(url, obj) {
        return $http.patch(url , obj)
      }

  }

})();
