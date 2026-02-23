(function() {
  'use strict';

  angular
    .module('inspinia')
    .factory('insuranceService', insuranceService);

  insuranceService.$inject = ['SweetAlert','datesFactory', 'dataFactory', 'formService','coverageService','fileService','ContratanteService','packageService','ramoService','providerService','payform','receiptService','url', '$q', '$http', 'globalVar', 'helpers',  '$localStorage','generalService','$sessionStorage'];

  function insuranceService(SweetAlert,datesFactory, dataFactory, formService,coverageService,fileService,ContratanteService,packageService,ramoService,providerService,payform,receiptService,url, $q, $http, globalVar, helpers, $localStorage,generalService,$sessionStorage) {
    /* Informaci�n de usuario */
    var infoUser = $localStorage.infoUser;

    var files=[];
    var service = {
      applyEndorsement: applyEndorsement,
      getInsurances_by_ramo:getInsurances_by_ramo,
      getInsurances_siniester:getInsurances_siniester,
      createInsurance: createInsurance,
      createInsuranceReno: createInsuranceReno,
      createInsuranceNoRenovacion:createInsuranceNoRenovacion,
      createForms: createForms,
      createOldPolicy: createOldPolicy,
      getInsurances: getInsurances,
      getInsurance: getInsurance,
      getInsuranceRead: getInsuranceRead,
      getInsuranceByNumber: getInsuranceByNumber,
      getInsuranceByNumberURL: getInsuranceByNumberURL,
      getInsuranceData: getInsuranceData,
      getPolicies: getPolicies,
      deleteOT: deleteOT,
      getOTsResume: getOTsResume,
      getVendors : getVendors,
      // getOts: getOts,
      getFiles: getFiles,
      getandReadInsurances: getandReadInsurances,
      getPolicyAndEndorsement: getPolicyAndEndorsement,
      updateInsurance: updateInsurance,
      updateStatus: updateStatus,
      updateFullInsurance: updateFullInsurance,
      updateFullOT : updateFullOT,
      deleteInsurance: deleteInsurance,
      applyBackupEndorsement:applyBackupEndorsement,
      // updateFullBackupInsurance:updateFullBackupInsurance,
      getRequestBackupData:getRequestBackupData,
      getInsuranceDataBackup:getInsuranceDataBackup,
      getInsurancesForEndorsements:getInsurancesForEndorsements,
      getPDFInsurance:getPDFInsurance,
      getInsurancesForDash : getInsurancesForDash,
      getInsuranceResumeWithCoverages : getInsuranceResumeWithCoverages,
      getContractorPersonalInfo:getContractorPersonalInfo,
      getPoliciesForRenovation:getPoliciesForRenovation,
      copyInsuranceData: copyInsuranceData,
      updateOldPolicy: updateOldPolicy
    };


    return service;

    ////////////
    function getVendors() {
      return $http.get(url.IP + 'get-vendors')
    }


    function createOldPolicy(data) {
      return $http.post(url.IP + 'v1/polizas/viejas/', data);
    }

    function updateStatus(data,status) {
      return $http.patch(data.url, { status: status });
    }

    function createInsurance(data) {
      delete data.contratante;
      if(data.vendor){
        if(data.vendor.url){
          data.vendor = data.vendor.url;
        }
      }
      if(data.poliza_number == "0"){
        delete data.poliza_number;
      }
      if(data.f_currency){
        if(data.f_currency.f_currency_selected){
          data.f_currency = data.f_currency.f_currency_selected;
        }
      }
      return $http.post(url.IP + 'polizas/', data)
        .then(createInsuranceComplete)
        .catch(createInsuranceFailed);

      function createInsuranceComplete(response) {
        if (response.status === 400) {
          return createInsuranceFailed(response);
        }
        response.data.estatus = 200
        return response.data;
      }

      function createInsuranceFailed(error) {
        error.estatus = error.status
        return error;
      }
    }
    function createInsuranceNoRenovacion(data) {
      delete data.contratante;
      if(data.vendor){
        if(data.vendor.url){
          data.vendor = data.vendor.url;
        }
      }
      if(data.poliza_number == "0"){
        delete data.poliza_number;
      }
      if(data.f_currency){
        if(data.f_currency.f_currency_selected){
          data.f_currency = data.f_currency.f_currency_selected;
        }
      }
      return $http.post(url.IP + 'renovation/', data)
        .then(createInsuranceCompleteNr)
        .catch(createInsuranceFailedNr);

      function createInsuranceCompleteNr(response) {
        if (response.status === 400) {
          return createInsuranceFailedNr(response);
        }
        response.data.estatus = 200
        return response.data;
      }

      function createInsuranceFailedNr(error) {
        error.estatus = error.status
        return error;
      }
    }
    function createInsuranceReno(data) {
      delete data.contratante;
      if(data.vendor){
        if(data.vendor.url){
          data.vendor = data.vendor.url;
        }
      }
      if(data.poliza_number == "0"){
        delete data.poliza_number;
      }
      if(data.f_currency){
        if(data.f_currency.f_currency_selected){
          data.f_currency = data.f_currency.f_currency_selected;
        }
      }
      data['domiciliada'] = data.domiciliado
      return $http.post(url.IP + 'renovation/', data)
        .then(createInsuranceComplete)
        .catch(createInsuranceFailed);

      function createInsuranceComplete(response) {
        if (response.status === 400) {
          return createInsuranceFailed(response);
        }
        return response.data;
      }

      function createInsuranceFailed(error) {
        return error;
      }
    }

    function copyInsuranceData(newp, oldp, desc) {
      if(desc == 'CAMBIO DE FORMA DE PAGO'){
        var data = {
          'newp': newp,
          'oldp': oldp,
          'cambio': 2
        }
      } else {
        var data = {
          'newp': newp,
          'oldp': oldp,
          'cambio': 1
        }
      }

      dataFactory.post('copy-data/', data)
      .then(function success(response) {
        var params = {
          'model': 1,
          'event': "POST",
          'associated_id': newp,
          'identifier': "registro el endoso con concepto " + desc
        }
        dataFactory.post('send-log/', params).then(function success(response) {

        });
        return response.data;
      })

    }

    function createForms(data) {
      return $http.post(url.IP + 'respuesta-formulario/', data)
        .then(createFormsComplete)
        .catch(createFormsFailed);

      function createFormsComplete(response) {
        return response.data;
      }

      function createFormsFailed(error) {
      }
    }


    function getInsurances_by_ramo(ramo_id, word) {
      var params = {
        pk: ramo_id,
        word: word
      }
      infoUser = $localStorage.infoUser;
      // if(infoUser.staff && !infoUser.superuser){
      //   var filter_person = 'v2/siniestros/policies-by-ramo/';
      var filter_person = 'policies-by-ramo/';
      return $http({
        method: 'GET',
        url: url.IP + filter_person,
        params: params
      })
      .then(getInsurancesComplete)
      .catch(getInsurancesFailed);
      // .get(url.IP + 'policies-by-ramo/' + ramo_id + '/' + word)

      function getInsurancesComplete(response) {
        return response.data;

      }

      function getInsurancesFailed(error) {
        console.log('My error' + error);
      }
    }

    function getInsurances_siniester(ramo_id, word) {
      var params = {
        pk: ramo_id,
        word: word
      }
      infoUser = $localStorage.infoUser;
      // if(infoUser.staff && !infoUser.superuser){
      //   var filter_person = 'v2/siniestros/policies-siniester/';
      var filter_person = 'policies-siniester/';
      return $http({
        method: 'GET',
        url: url.IP + filter_person,
        params: params
      })
      .then(getInsurancesComplete)
      .catch(getInsurancesFailed);
      // .get(url.IP + 'policies-by-ramo/' + ramo_id + '/' + word)

      function getInsurancesComplete(response) {
        return response.data;

      }

      function getInsurancesFailed(error) {
        console.log('My error' + error);
      }
    }

    function getInsurances() {
      return $http.get(url.IP + 'polizas/')
        .then(getInsurancesComplete)
        .catch(getInsurancesFailed);

      function getInsurancesComplete(response) {
        return response.data.results;

      }

      function getInsurancesFailed(error) {
        
      }
    }

    function deleteOT(ot) {
      var uri = url.IP + 'polizas/' + ot.id + '/';
      var data_email = {
        id: ot.id,
        model: 2,
        type_person: 0,
      }
      dataFactory.post('send-email-admins-deletes/', data_email).then(function success(req) {
          return $http.delete(uri);
      });
      // return $http.delete(uri);
    }



    function getPoliciesForRenovation(status,order,asc) {
      var dfd = $.Deferred();
      var policies = [];
      var ots = [];

      getandReadInsurancesforRenovation(status,order,asc)
        .then(function(insurances) {
          //------------------------------------------------------------------------------------------ 2
          var policies = insurances
          // policies.forEach(function(elem) {
          //    if (elem.juridical) {
          //         $http.get(url.IP + 'morales-resume-name/'+ elem.juridical+'/').then(function(response) {
          //         // $http.get(elem.juridical).then(function(response) {
          //             elem.juridical = response.data;
          //         })
          //     }
          //     else{
          //         $http.get(url.IP + 'fisicas-resume-name/'+ elem.natural+'/').then(function(response) {
          //         // $http.get(elem.natural).then(function(response) {
          //             elem.natural = response.data;
          //         })
          //     }
          // })
          var total ={'policies':policies}
          dfd.resolve(total);
        });

      return dfd;
    }


    function getPolicies() {
      var dfd = $.Deferred();
      var policies = [];
      var ots = [];

      getandReadInsurances()
        .then(function(insurances) {
          insurances.forEach(function(insurance) {
            // if (insurance.juridical) {
            //     $http.get(url.IP + 'morales-resume-name/'+ insurance.juridical+'/').then(function(response) {
            //         insurance.juridical = response.data;
            //     })
            // }
            // else{
            //     $http.get(url.IP + 'fisicas-resume-name/'+ insurance.natural+'/').then(function(response) {
            //         insurance.natural = response.data;
            //     })
            // }

            if (helpers.isPolicy(insurance) && insurance.document_type === 1) {
              policies.push(insurance);
            }
            else if (helpers.isOT(insurance)) {
              ots.push(insurance);
            }
          });
          var total ={'policies':policies,'ots':ots}
          dfd.resolve(total);
        });

      return dfd;
    }

    // function getOts() {
    //   var dfd = $.Deferred();
    //   var ots = [];

    //   getandReadInsurances()
    //     .then(function(insurances) {
    //       insurances.forEach(function(insurance) {
    //         if (helpers.isOT(insurance)) {
    //           ots.push(insurance);
    //         }
    //       });
    //       dfd.resolve(ots);
    //     });

    //   return dfd;
    // }


    function getandReadInsurancesforRenovation(status,order,asc) {
      // return $http.get(url.IP + 'leer-polizas/')
      // return $http.get(url.IP + 'leer-rpolizas-resume/')
      return $http({
                    method: 'GET',
                    url: url.IP + 'leer-rpolizas-resume/',
                    params: {
                      status : status,
                        order: order,
                        asc: asc
                    }
                })
        .then(getandReadInsurancesComplete)
        .catch(getandReadInsurancesFailed);

      function getandReadInsurancesComplete(response) {
        if (response.data) {

          response.data.results.forEach(function(item) {
          });

          return response.data.results;
        }
        return getandReadInsurancesFailed(response);
      }

      function getandReadInsurancesFailed(error) {
        return error;
      }
    }



    function getOTsResume(order,asc) {
      // // return $http.get(url.IP + 'leer-polizas/')
      // return $http.get(url.IP + 'leer-ots-resume/',
      //     params:{
      //                     tipo: parType
      //                   }
      //   )
      // $http({
      //                     method: 'GET',
      //                     url: url.IP +'leer-ots-resume/',
      //                     params:{
      //                       order: order,
      //                       asc: asc
      //                     }
      //                   })
      infoUser = $localStorage.infoUser;
      // if(infoUser.staff && !infoUser.superuser){
      //   var leer_ots = 'v2/polizas/leer-ots-resume-dash/';
      var leer_ots = 'leer-ots-resume-dash/';

      return $http({
                        method: 'POST',
                        url: url.IP + leer_ots,
                        data:{
                          order: order,
                          asc: asc
                        }
                      })
      .then(getandReadInsurancesComplete)
      .catch(getandReadInsurancesFailed);

      function getandReadInsurancesComplete(response) {
        if (response.data) {

          var results = {
            data: response.data.results,
            config: {
              count: response.data.count,
              next: response.data.next,
              previous: response.data.previous
            }
          };

          return results;

          // return response.data.results;
        }
        return getandReadInsurancesFailed(response);
      }

      function getandReadInsurancesFailed(error) {
        return error;
      }
    }


    function getandReadInsurances() {
      // return $http.get(url.IP + 'leer-polizas/')
      return $http.get(url.IP + 'leer-polizas-resume/')
        .then(getandReadInsurancesComplete)
        .catch(getandReadInsurancesFailed);

      function getandReadInsurancesComplete(response) {
        if (response.data) {
          return response.data.results;
        }
        return getandReadInsurancesFailed(response);
      }

      function getandReadInsurancesFailed(error) {
        return error;
      }
    }

    function getInsurancesForDash(order,asc) {
      // //return $http.get(url.IP + 'leer-polizas/')
      // return $http.get(url.IP + 'polizas-dash/')
      infoUser = $localStorage.infoUser;
      // if(infoUser.staff && !infoUser.superuser){
      //   var chart_renovation = 'v2/polizas/graficas-renovaciones/';
      var chart_renovation = 'graficas-renovaciones/';
      return $http({
                    method: 'GET',
                    url: url.IP + chart_renovation,
                    params: {
                        order: order,
                        asc: asc,
                        tipo: 'total'
                    }
                })
        .then(getandReadInsurancesComplete)
        .catch(getandReadInsurancesFailed);

      function getandReadInsurancesComplete(response) {
        if (response.data) {
          // return response.data.results;

          var results = {
            data: response.data.results,
            config: {
              count: response.data.count,
              previous: response.data.previous,
              next: response.data.next
            }
          };

          return results;

        }
        return getandReadInsurancesFailed(response);
      }

      function getandReadInsurancesFailed(error) {
        return error;
      }
    }


    function getContractorPersonalInfo(id) {
      return $http.get(url.IP+ 'get-contractor-personal-info/'+id+'/')
        .then(getComplete)
        .catch(getFailed);

      function getComplete(response) {
        if (response) {
          return response.data;
        }
        return getFailed(response);
      }

      function getFailed(error) {
        return error;
      }
    }


    function getInsuranceResumeWithCoverages(id) {
      // return $http.get(url.IP + 'leer-polizas/')
      return $http.get(url.IP + 'polizas/'+id+'/')
        .then(getandReadInsurancesComplete)
        .catch(getandReadInsurancesFailed);

      function getandReadInsurancesComplete(response) {
        if (response.data) {
          return response.data.coverageInPolicy_policy;
        }
        return getandReadInsurancesFailed(response);
      }

      function getandReadInsurancesFailed(error) {
        return error;
      }
    }


    function getInsurancesForEndorsements(parWord) {
      // return $http.get(url.IP + 'leer-polizas/')
      var data = {
        word: parWord
      }
      return $http.post(url.IP + 'leer-polizas-endorsements/', data)
        .then(getandReadInsurancesComplete)
        .catch(getandReadInsurancesFailed);

      function getandReadInsurancesComplete(response) {
        if (response.data) {
          return response.data;
        }
        return getandReadInsurancesFailed(response);
      }

      function getandReadInsurancesFailed(error) {
        return error;
      }
    }

    function getInsuranceRead(data, type) {
      console.log('oo',data)
      if(type == 2){
        data.polizaId = url.IP + 'leer-fianzas-info/' + data.id + '/';
      } else {
        if (angular.isObject(data)) {
          if (data.id) {
            data.polizaId = url.IP + 'leer-polizas-info/' + data.id + '/';
          } else if (!isNaN(Number(data.polizaId))) {
            data.polizaId = url.IP + 'leer-polizas-info/' + data.polizaId + '/';
          } else {
            data.polizaId = data.polizaId ? data.polizaId : '';
          }
        }else{
          if(angular.isObject(data)){
            data.polizaId=data
          }
        }
      }

      return $http.get(angular.isObject(data) ? data.polizaId : data)
        .then(getInsuranceReadComplete)
        .catch(getInsuranceReadFailed);

      function getInsuranceReadComplete(response) {
        if(response.data.coverageInPolicy_policy){
          var delete_cov = [];
          response.data.coverageInPolicy_policy.forEach(function(cov) {
            if(( cov.coinsurance == null || cov.coinsurance == "") &&
              ( cov.sum_insured == null || cov.sum_insured == "") &&
              ( cov.deductible == null || cov.deductible == "")){
              delete_cov.push(coverageService.deleteCoverageByUri(cov.url));
            }
          });
        }
        return response.data;
      }

      function getInsuranceReadFailed(error) {
      }
    }

    function getPDFInsurance(insurance_id) {
      return $http.get(url.IP+ 'policy-for-pdf/'+insurance_id+'/')
      .then(getandPdfInsurancesComplete)
      .catch(getandReadInsurancesFailed);

            function getandPdfInsurancesComplete(response) {
              if (response.data) {
                return response.data.results;
              }
              return getandReadInsurancesFailed(response);
            }

            function getandReadInsurancesFailed(error) {
              return error;
            }
    }




    function getInsuranceData(insurance) {
      var dfd = $q.defer();
      var uri = url.IP + 'leer-polizas-edit/' + insurance.id + '/';
      var insuranceComplete = {};
      var things = 0;
      var thingsToLoad = 1; // the insurance

      if (insurance.coverageInPolicy_policy) {
      // }
      //   else{
          getInsuranceResumeWithCoverages(insurance.id).then(function(coverages) {
          insurance.coverageInPolicy_policy = coverages;
        })
        }
      $http.get(uri)
        .then(function(insuranceResponse) {
          if (checkResponse(insuranceResponse)) {
            return;
          }

          var insuranceEmpty = insuranceResponse.data
          insuranceEmpty.coverageInPolicy_policy = insurance.coverageInPolicy_policy;
          insuranceEmpty.read = insurance;

          insuranceComplete = angular.copy(insuranceEmpty);

          //recibos
          thingsToLoad += insuranceComplete.recibos_poliza.length;
          insuranceComplete.recibos_poliza = []
          insuranceEmpty.recibos_poliza.forEach(function(receiptUri) {
            receiptService.getReceiptsByUriService(receiptUri)
              .then(function(receiptObj) {
                insuranceComplete.recibos_poliza.push(receiptObj);
                thingLoaded("recibo");  // Receipt loaded
              });
          });

          //payform
          thingsToLoad++;
          payform.some(function(form) {
            if (form.value = insuranceEmpty.forma_de_pago) {
              insuranceComplete.forma_de_pago = form;
              insurance.forma_de_pago = form.value
              return true;
            }
          })
          thingLoaded("payform");  // payform loaded
          //address

          try{
            thingsToLoad++;
            $http.get(insuranceResponse.data.address)
            .then(function(address) {
              insuranceComplete.address = address.data;
              thingLoaded("address"); // provider loaded
            });
          }
          catch(e){
            console.log('address error',e)
          }

           //clave
          thingsToLoad++;
          if(insuranceResponse.data.clave && insuranceResponse.data.clave.url){
            $http.get(insuranceResponse.data.clave.url)
              .then(function(clave) {
                insuranceComplete.clave = clave.data;
                thingLoaded("clave"); // provider loaded
              });            
          }else{
            console.log('sin clave')
            SweetAlert.swal("Información","La póliza no tiene clave, deberá seleccionar una para guardar", "info");
            thingLoaded("clave"); // provider loaded
          }
          //provider
          thingsToLoad++;
          providerService.getProviderById(insuranceEmpty.aseguradora)
            .then(function(providerResponse) {
              if (checkResponse(providerResponse)) {
                return;
              }
              insuranceComplete.aseguradora = providerResponse.data;
              thingLoaded("provider"); // provider loaded
            });

          // //ramo
          thingsToLoad++;
          ramoService.getRamoById(insuranceEmpty.ramo.id)
            .then(function(ramoResponse) {

              if (checkResponse(ramoResponse)) {
                return;
              }
              insuranceComplete.ramo = ramoResponse.data;
              thingLoaded("ramo");
            });

          //subramo
          thingsToLoad++;
          ramoService.getSubramoById(insuranceEmpty.subramo.id)
          // ramoService.getSubramoByUri(insuranceEmpty.subramo)
            .then(function(subramoResponse) {
              if (checkResponse(subramoResponse)) {
                return;
              }
              insuranceComplete.subramo = subramoResponse.data;
              thingLoaded("subramo");
            });

          // package
          if (insuranceEmpty.paquete) {
            thingsToLoad++;
              packageService.getPackageById(insuranceEmpty.paquete.id)
            // packageService.getPackageByUri(insuranceEmpty.paquete)
              .then(function(packageResponse) {
                if (checkResponse(packageResponse)) {
                  return;
                }
                insuranceComplete.paquete = packageResponse.data;
                thingLoaded("Paquete");
              });
          }

          //

          if (insuranceEmpty.life_policy.length > 0) {
            thingLoaded('personal');
            insuranceEmpty.life_policy.forEach(function(prs, prsPos) {

            });
            // thingsToLoad += insuranceEmpty.life_policy.length; // cargaremos cada life_policy
            insuranceEmpty.life_policy.forEach(function(elem, index) {
              thingsToLoad += elem.beneficiaries_life.length;
              elem.beneficiaries_life.forEach(function(ben, benPos) {
                $http.get(ben.life)
                  .then(function(response) {
                    insuranceComplete.life_policy[index].beneficiaries_life[benPos].life = response.data;
                    thingLoaded('beneficiary');
                  });
              });
            });
          } else if (insuranceEmpty.accidents_policy.length > 0) {
            thingsToLoad += insuranceEmpty.accidents_policy.length; // cargaremos cada life_policy
            insuranceEmpty.accidents_policy.forEach(function(elem, index) {
              thingsToLoad += elem.relationship_accident.length;
              // $http.get(elem.personal.url)
              $http.get(elem.personal)
                .then(function(response) {
                  insuranceComplete.accidents_policy[index].personal = response.data;
                  thingLoaded('accidents_policy');
                });
              elem.relationship_accident.forEach(function(ben, benPos) {
                $http.get(ben.accident)
                  .then(function(response) {
                    insuranceComplete.accidents_policy[index].relationship_accident[benPos].accident = response.data;
                    thingLoaded('relationship_accident');
                  });
              });
            });
          }

          // contractor
          thingsToLoad++;
          // if (insuranceEmpty.juridical) {
          //   ContratanteService.getContratanteByUri(insuranceEmpty.juridical)
          //     .then(function(contractorResponse) {
          //       if (checkResponse(contractorResponse)) {
          //         return;
          //       }
          //       insuranceComplete.juridical = contractorResponse.data;
          //       $http.get(insuranceComplete.juridical.group)
          //         .then(function(response) {
          //           insuranceComplete.juridical.group = response.data;
          //           thingLoaded("juridical");
          //         });
          //     });
          // }

          // if (insuranceEmpty.natural) {
          //   ContratanteService.getContratanteByUri(insuranceEmpty.natural)
          //     .then(function(contractorResponse) {
          //       if (checkResponse(contractorResponse)) {
          //         return;
          //       }
          //       insuranceComplete.natural = contractorResponse.data;
          //       // console.log('insurance', insuranceComplete.natural);
          //       $http.get(insuranceComplete.natural.group)
          //         .then(function(response) {
          //           insuranceComplete.natural.group = response.data;
          //           thingLoaded("natural");
          //         });
          //     });
          // }
          if (insuranceEmpty.contractor) {
            ContratanteService.getContratanteByUri(insuranceEmpty.contractor)
              .then(function(contractorResponse) {
                if (checkResponse(contractorResponse)) {
                  return;
                }
                insuranceComplete.contractor = contractorResponse.data;
                $http.get(insuranceComplete.contractor.group)
                  .then(function(response) {
                    insuranceComplete.contractor.group = response.data;
                    thingLoaded("contractor");
                  });
              });
          }
          // files
          thingsToLoad++;
          var accesos = $sessionStorage.permisos
          if (accesos) {
            accesos.forEach(function(perm){
              if(perm.model_name == 'Archivos'){
                var acceso_files = perm
                acceso_files.permissions.forEach(function(acc){
                  if (acc.permission_name == 'Administrar archivos sensibles') {
                    if (acc.checked == true) {
                      var permiso_archivos = true
                      getFiles(insurance)
                      .then(function(filesData) {
                        insuranceComplete.files = { results: filesData };
                        thingLoaded("files");
                      });
                    }else{
                      var permiso_archivos = true
                      getFiles(insurance)
                      .then(function(filesData) {
                        insuranceComplete.files = { results: filesData };
                        thingLoaded("files");
                      });
                    }
                  }
                })
              }
            })
          }


          thingLoaded("insurance"); // Policy loaded

        }).catch(function(error) {
          dfd.reject(error);
        });


      function thingLoaded(what) {
        things++;
        if (things >= thingsToLoad) {
          var initDate = new Date(insuranceComplete.start_of_validity);
          var endingDate = new Date(insuranceComplete.end_of_validity);

          initDate = new Date(initDate.getTime() + (initDate.getTimezoneOffset() * 60000));
          endingDate = new Date(endingDate.getTime() + (endingDate.getTimezoneOffset() * 60000));

          insuranceComplete.start_of_validity = initDate;
          insuranceComplete.end_of_validity = endingDate;

          dfd.resolve(insuranceComplete);
        }
      }

      function checkResponse(response) {
        if (response.status < 200 || response.status >= 300) {
          dfd.reject(response);
          return true;
        }
        return false;
      }
      return dfd.promise;
    }

    function getInsurance(data) {
      if (!isNaN(Number(data.polizaId))) {
        data.polizaId = url.IP + 'polizas/' + data.polizaId + '/';
      } else {
        if(data && data.polizaId){
          data.polizaId = data.polizaId;
        }
      }
      return $http.get(data.polizaId)
        .then(getInsuranceComplete)
        .catch(getInsuranceFailed);

      function getInsuranceComplete(response) {
        return response.data;
      }

      function getInsuranceFailed(error) {
      }
    }

    function getInsuranceByNumber(data) {
      var url= globalVar.policyByNumber + data + '';
      return $http.get(url)
        .then(getInsuranceByNumberComplete)
        .catch(getInsuranceByNumberFailed);

      function getInsuranceByNumberComplete(response) {
        return response;
      }

      function getInsuranceByNumberFailed(error) {
        return error;
      }
    }

    function getInsuranceByNumberURL(data) {
      return $http.get(globalVar.policyByNumberURL + data)
        .then(getInsuranceByNumberURLComplete)
        .catch(getInsuranceByNumberURLFailed);

      function getInsuranceByNumberURLComplete(response) {
        return response;
      }

      function getInsuranceByNumberURLFailed(error) {
        return error;
      }
    }

    function updateOldPolicy(insurance) {
      dataFactory.get('get-renovation', {actual_id: insurance.id})
      .then(function success(response) {
        if(response.data.results.length){
          var data = {
            status: 12,
            renewed_status: 1
          }
          $http.patch(response.data.results[0].base_policy.url, data);
        }
      })
    }
    function formatNumber(val) {
      var number = Number(val.replace(/[^0-9.-]+/g,""))
      return number
    }

    function updateFullInsurance(insurance) {
      // return;
      var dfd = $q.defer();

      var saveObjRequest = { // Objeto para actualizar
        aseguradora: insurance.aseguradora ? insurance.aseguradora.url : '',
        end_of_validity: insurance.endingDate,
        folio: insurance.folio,
        forma_de_pago: insurance.payment ? insurance.payment.value : null,
        sucursal: insurance.sucursal ? insurance.sucursal : '',
        // juridical: insurance.contratante.type_person == 'Moral' ? insurance.contratante.url : null,
        // natural: insurance.contratante.type_person == 'Fisica' ? insurance.contratante.url : null,
        contractor: insurance.contratante.url,
        observations: insurance.observations,
        old_policies: insurance.old_policies,
        paquete: insurance.paquete ? insurance.paquete.url : null,
        poliza_number: insurance.poliza ? insurance.poliza : "",
        ramo: insurance.ramo ? insurance.ramo.url : null,
        // recibos_poliza: [],
        start_of_validity: insurance.startDate,
        status: insurance.status,
        subramo: insurance.subramo ? insurance.subramo.url : null,
        address:insurance.address.url,
        clave: insurance.clave.url,
        f_currency: insurance.f_currency,
        conducto_de_pago: insurance.conducto_de_pago,
        identifier: insurance.identifier,
        name: insurance.name,
        administration_type: insurance.administration_type,
        p_total : insurance.p_total,
        sub_total : insurance.sub_total,
        descuento : insurance.descuento ? insurance.descuento : 0,
        derecho : insurance.derecho ? insurance.derecho : 0,
        rpf : insurance.rpf ? insurance.rpf : 0,
        p_neta : insurance.p_neta,
        iva : insurance.iva,
        comision: insurance.comision,
        comision_percent: insurance.comision_percent,
        comision_rpf_percent: insurance.comision_rpf_percent,
        comision_derecho_percent: insurance.comision_derecho_percent,
        give_comision: insurance.give_comision,
        responsable: insurance.responsable,
        collection_executive: insurance.collection_executive ? insurance.collection_executive : '',
        is_renewable: insurance.is_renewable,
        hospital_level: insurance.hospital_level ? insurance.hospital_level : '',
        tabulator: insurance.tabulator ? insurance.tabulator : '',
        business_line: insurance.business_line ? insurance.business_line : 0,
        celula: insurance.celula ? insurance.celula : '',
        groupinglevel: insurance.groupinglevel ? insurance.groupinglevel : '',
        state_circulation: insurance.state_circulation ? insurance.state_circulation : ''
      }
      // return;
      if(insurance && !insurance.url && insurance.id){
        insurance.url=url.IP + 'polizas/' + insurance.id + '/';
        console.log('sin url***',insurance.url,url)
      }
      $http.patch(insurance.url, saveObjRequest)
        .catch(catchIt)
        .then(function(updateResponse) {
          var waitForDelete = [];
          insurance.old_coverages.forEach(function(old_coverage) {
            waitForDelete.push(coverageService.deleteCoverageByUri(old_coverage.url));
          });

          var old_form_data = {};

          try{
            waitForDelete.push($http.get(insurance.old_form).then(function(old_form) {
              old_form_data=old_form.data;

            }));
          }
          catch (err){

          }
          $q.all(waitForDelete).then(function(responses) {
            var waitForNewData = [];
            var nuevosBen = []

             if (insurance.form_object) {
                old_form_data.policy = insurance.url;
                old_form_data.sub_branch = insurance.subramo.url;

                var code = insurance.form_code;
                var personalInfo = {}
                if (code === 1 || code == 30) {
                  // Inicio personal_life nuevo
                  if (insurance.form_object.personal) {
                    insurance.form_object.personal.forEach(function(item){

                      if(item.url){
                        var personal_obj = {
                          first_name: item.first_name ? item.first_name : "",
                          last_name: item.last_name ? item.last_name : "",
                          second_last_name: item.second_last_name ? item.second_last_name : "",
                          birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                          antiguedad: item.antiguedad ? new Date(datesFactory.toDate(item.antiguedad)) : new Date(),
                          sex : item.sex ? item.sex : "",
                          smoker : item.smoker ? item.smoker : false,
                          policy_type: item.policy_type
                        }
                        if (personal_obj.smoker == 'True') {
                          personal_obj.smoker = true
                        }
                        else if (personal_obj.smoker == 'False') {
                          personal_obj.smoker = false
                        }
                        waitForNewData.push($http.patch(item.url, personal_obj).then(function(personalInfo){
                              if((personalInfo)){
                                var personalInfo = personalInfo
                                if (insurance.old_form == undefined || !insurance.old_form ) {
                                  var model = {
                                    sub_branch: insurance.subramo.url ? insurance.subramo.url : insurance.subramo,
                                    policy: insurance.url,
                                    personal: personalInfo.data.url,
                                    smoker: personalInfo.data.smoker
                                  }
                                  generalService.lifeForm(model)
                                    .then(function(lifeFormData){
                                      if((lifeFormData)){
                                        insurance.old_form = lifeFormData.data.url
                                        if(nuevosBen){
                                          nuevosBen.forEach(function(r){
                                            if (insurance.old_form && r.data) {
                                              $http.patch(r.data.url,{'life': insurance.old_form}).then(function(pxxl){
                                              })
                                            }
                                          })
                                        }
                                        return;
                                      }
                                  })
                                }

                              }
                          }))
                      }

                      else{

                         var personal_obj = {
                          first_name: item.first_name ? item.first_name : "",
                          last_name: item.last_name ? item.last_name : "",
                          second_last_name: item.second_last_name ? item.second_last_name : "",
                          birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                          antiguedad: item.antiguedad ? new Date(datesFactory.toDate(item.antiguedad)) : new Date(),
                          policy: insurance.url,
                          policy_type: item.policy_type,
                          smoker : insurance.smoker ? insurance.smoker : false
                        }
                        Object.keys(personal_obj).forEach(function (k) {
                          if (personal_obj[k] === '' || (typeof personal_obj[k] === 'string' && personal_obj[k].trim() === '')) {
                            delete personal_obj[k];
                          }
                        });
                        if (personal_obj.smoker == 'True') {
                          personal_obj.smoker = true
                        }
                        else if (personal_obj.smoker == 'False') {
                          personal_obj.smoker = false
                        }
                        waitForNewData.push($http.post(globalVar.personal, personal_obj).then(function(personalInfo){
                              if((personalInfo)){
                                var personalInfo = personalInfo
                                if (insurance.old_form == undefined || !insurance.old_form ) {
                                  var model = {
                                    sub_branch: insurance.subramo.url ? insurance.subramo.url : insurance.subramo,
                                    policy: insurance.url,
                                    personal: personalInfo.data.url,
                                    smoker: personalInfo.data.smoker
                                  }
                                  generalService.lifeForm(model)
                                    .then(function(lifeFormData){
                                      if((lifeFormData)){
                                        insurance.old_form = lifeFormData.data.url
                                        if(nuevosBen){
                                          nuevosBen.forEach(function(r){
                                            if (insurance.old_form && r.data) {
                                              $http.patch(r.data.url,{'life': insurance.old_form}).then(function(pxxl){
                                              })
                                            }
                                          })
                                        }
                                        return;
                                      }
                                  })
                                }

                              }
                          }));
                      }


                    });
                  }
                  // fin personal nuevo
                  // var personal_obj={
                  //   first_name: insurance.form_object.personal.first_name,
                  //   last_name: insurance.form_object.personal.last_name,
                  //   second_last_name: insurance.form_object.personal.second_last_name,
                  //   sex: insurance.form_object.personal.sex,
                  //   birthdate: new Date(datesFactory.toDate(insurance.form_object.personal.birthdate)),
                  //   full_name: insurance.form_object.personal.first_name + ' ' + insurance.form_object.personal.last_name + ' ' + insurance.form_object.personal.second_last_name

                  // }

                  // waitForNewData.push($http.patch(insurance.form_object.personal.url,personal_obj));
                  insurance.form_object.relationships.forEach(function(item){
                    if(item.url){

                      var relationship_obj = {
                        first_name: item.first_name ? item.first_name : "",
                        last_name: item.last_name ? item.last_name : "",
                        second_last_name: item.second_last_name ? item.second_last_name : "",
                        optional_relationship: item.optional_relationship ? item.optional_relationship : "",
                        birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                        antiguedad: item.antiguedad ? new Date(datesFactory.toDate(item.antiguedad)) : new Date(),
                        sex : item.sex ? item.sex : "",
                        percentage: item.percentage ? item.percentage : 100,
                        person: item.person,
                        rfc: item.rfc ? item.rfc : "",
                        j_name: item.j_name ? item.j_name : "",
                        life: insurance.old_form
                      }

                      waitForNewData.push($http.patch(item.url, relationship_obj).then(function(pl){
                                    if (insurance.old_form && insurance.old_form.bene && insurance.old_form.bene == null) {
                                      $http.patch(insurance.old_form,{'beneficiaries_life': pl}).then(function(pxxl){
                                      })
                                    }
                                  }));
                    }

                    else{

                       var relationship_obj = {
                        first_name: item.first_name ? item.first_name : "",
                        last_name: item.last_name ? item.last_name : "",
                        second_last_name: item.second_last_name ? item.second_last_name : "",
                        optional_relationship: item.optional_relationship ? item.optional_relationship : "",
                        birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                        antiguedad: item.antiguedad ? new Date(datesFactory.toDate(item.antiguedad)) : new Date(),
                        sex : item.sex ? item.sex : "",
                        percentage: item.percentage ? item.percentage : 100,
                        person: item.person,
                        rfc: item.rfc ? item.rfc : "",
                        j_name: item.j_name ? item.j_name : "",
                        life: insurance.old_form
                      }
                      waitForNewData.push($http.post(globalVar.beneficiaries, relationship_obj).then(function(pl){
                        nuevosBen.push(pl)
                        if (insurance.old_form && insurance.old_form.bene == null) {
                          $http.patch(insurance.old_form,{'beneficiaries_life': pl}).then(function(pxxl){
                          })
                        }
                      }));
                    }

                  });

                } else if (code === 2 || code === 3 || code === 4) {
                  var noAccidentsDisease = false;
                  var disease = 1;
                  var relationships = 1;
                  var personal_obj = {
                    first_name: insurance.form_object.personal.first_name,
                    last_name: insurance.form_object.personal.last_name,
                    second_last_name:insurance.form_object.personal.second_last_name,
                    sex:insurance.form_object.personal.sex,
                    birthdate: insurance.form_object.personal.birthdate,
                    antiguedad: insurance.form_object.personal.antiguedad,
                    policy_type: insurance.form_object.personal.policy_type,
                    full_name: insurance.form_object.personal.first_name + ' ' + insurance.form_object.personal.last_name + ' ' + insurance.form_object.personal.second_last_name
                  }
                  Object.keys(personal_obj).forEach(function (k) {
                    if (personal_obj[k] === '' || (typeof personal_obj[k] === 'string' && personal_obj[k].trim() === '')) {
                      delete personal_obj[k];
                    }
                  });
                  var submitObject = {
                                    code: code,
                                    personal: personal_obj,
                                    relationships: insurance.form_object.relationships,
                                    coinsurance: disease.coinsurance,
                                    insurance: updateResponse.data
                                }
                  if (insurance.form_object.personal.url){
                    waitForNewData.push($http.patch(insurance.form_object.personal.url,personal_obj));
                  }
                  else{
                    // Crear form de Acicdentes gM si p�liza no tiene (es migrada)
                    noAccidentsDisease = true
                    var dataToSave = {
                                    code: code,
                                    insurance: insurance,
                                    accidents_policy: [],
                                    personal: {},
                                    relationships: [],
                                }
                    dataToSave.insurance = insurance
                    insurance.form_object.relationships.forEach(function(relationship){
                          relationship.first_name = relationship.first_name,
                          relationship.last_name = relationship.last_name,
                          relationship.second_last_name =relationship.second_last_name,
                          relationship.sex =relationship.sex.value,
                          relationship.birthdate = relationship.birthdate ? new Date(datesFactory.toDate(relationship.birthdate)) : null,
                          relationship.antiguedad = relationship.antiguedad ? new Date(datesFactory.toDate(relationship.antiguedad)) : null,
                          relationship.relationship = relationship.relationship.relationship,
                          // accident: insurance.old_form,
                          relationship.full_name = relationship.first_name + ' ' + relationship.last_name + ' ' + relationship.second_last_name
                      });
                    var personal_x =  {
                      first_name: insurance.form_object.personal.first_name,
                      last_name: insurance.form_object.personal.last_name,
                      second_last_name:insurance.form_object.personal.second_last_name,
                      sex:insurance.form_object.personal.sex,
                      birthdate: insurance.form_object.personal.birthdate,
                      antiguedad: insurance.form_object.personal.antiguedad,
                      full_name: insurance.form_object.personal.first_name + ' ' + insurance.form_object.personal.last_name + ' ' + insurance.form_object.personal.second_last_name

                    }
                    dataToSave.personal = personal_x
                    dataToSave.relationships = insurance.form_object.relationships
                    formService.createAccidentsDisease(dataToSave);
                  }
                  if (!noAccidentsDisease) {
                    insurance.form_object.relationships.forEach(function(relationship){
                      if(relationship.url){
                        var relationship_obj={
                          first_name: relationship.first_name,
                          last_name: relationship.last_name,
                          second_last_name:relationship.second_last_name,
                          sex:relationship.sex.value,
                          birthdate: relationship.birthdate ? new Date(datesFactory.toDate(relationship.birthdate)) : null,
                          antiguedad: relationship.antiguedad ? new Date(datesFactory.toDate(relationship.antiguedad)) : null,
                          relationship: relationship.relationship.relationship,
                          full_name: relationship.first_name + ' ' + relationship.last_name + ' ' + relationship.second_last_name

                        }
                        if (!relationship.url == null || !relationship.url == ''){
                          waitForNewData.push($http.patch(relationship.url,relationship_obj));
                        }
                      }
                      else{
                         var relationship_obj={
                            first_name: relationship.first_name,
                            last_name: relationship.last_name,
                            second_last_name:relationship.second_last_name,
                            sex:relationship.sex.value,
                            birthdate: relationship.birthdate ? new Date(datesFactory.toDate(relationship.birthdate)) : null,
                            antiguedad: relationship.antiguedad ? new Date(datesFactory.toDate(relationship.antiguedad)) : null,
                            relationship: relationship.relationship.relationship,
                            accident: insurance.old_form,
                            full_name: relationship.first_name + ' ' + relationship.last_name + ' ' + relationship.second_last_name

                          }
                          waitForNewData.push($http.post(globalVar.relationships,relationship_obj));
                      }
                    });
                  }
                } else if (code === 9){
                  var montAdjustement = 0
                  var montEquipment = 0
                  
                  if(insurance.form_object.form.mont_special_team){
                    montEquipment = parseFloat(formatNumber(insurance.form_object.form.mont_special_team)).toFixed(2)
                  }
                  
                  if(insurance.form_object.form.mont_adjustment){
                    montAdjustement = parseFloat(formatNumber(insurance.form_object.form.mont_adjustment)).toFixed(2)
                  }
                  var automobile = {
                    brand: insurance.form_object.form.brand,
                    model: insurance.form_object.form.model,
                    year: insurance.form_object.form.year,
                    version: insurance.form_object.form.version,
                    serial: insurance.form_object.form.serial,
                    engine: insurance.form_object.form.engine,
                    color: insurance.form_object.form.color,
                    usage: insurance.form_object.form.usage,
                    service: insurance.form_object.form.service,
                    policy_type: insurance.form_object.form.policy_type,
                    procedencia: insurance.form_object.form.procedencia ? insurance.form_object.form.procedencia : 0,
                    charge_type: insurance.form_object.form.charge_type ?  insurance.form_object.form.charge_type : 0,
                    license_plates: insurance.form_object.form.license_plates,
                    beneficiary_name : insurance.form_object.form.beneficiary_name,
                    beneficiary_address : insurance.form_object.form.beneficiary_address,
                    beneficiary_rfc : insurance.form_object.form.beneficiary_rfc,
                    driver: insurance.form_object.form.driver,
                    adjustment : insurance.form_object.form.adjustment,
                    mont_adjustment : montAdjustement,
                    special_team : insurance.form_object.form.special_team,
                    mont_special_team : montEquipment
                  }
                  if( insurance.form_object.form.state_circulation){
                    if(insurance.form_object.form.state_circulation.state){
                      $http.patch(insurance.url, {'state_circulation':insurance.form_object.form.state_circulation.state}).then(function(responSt){
                        console.log('enviado estado',responSt)
                      });
                    }
                  }
                  if (old_form_data.url) {
                    waitForNewData.push($http.patch(old_form_data.url,automobile));
                  }
                } else {
                  var data = {
                    insured_item: insurance.form_object.form.insured_item,
                    item_address: insurance.form_object.form.item_address,
                    item_details: insurance.form_object.form.item_details,
                    damage_type: insurance.form_object.form.damage_type
                  }

                  $http.patch(insurance.form_object.form.url, data);
                }

            } else if (insurance.update_form) {
              $http.patch(insurance.update_form.url,insurance.update_form);
            }

            // inserting new coverages
            insurance.coverages.forEach(function(niu) {
              var newCvg = {
                policy: insurance.endorsementedUrl ? insurance.endorsementedUrl : insurance.url,
                package: insurance.paquete.url,
                coverage_name: niu.coverage_name ? niu.coverage_name : '',
                priority: niu.priority ? niu.priority : 0,
                deductible: niu.deductibleInPolicy ? niu.deductibleInPolicy.label : 0,
                sum_insured: niu.sumInPolicy ? niu.sumInPolicy.label : 0,
                prima: niu.primaInPolicy ? niu.primaInPolicy : 0,
                coinsurance: niu.coinsuranceInPolicy ? niu.coinsuranceInPolicy.value : 0,
                topecoinsurance: niu.topeCoinsuranceInPolicy ? niu.topeCoinsuranceInPolicy.value : 0,
              }
              // console.log('cobertura-----',newCvg)
              waitForNewData.push(coverageService.createCoberturaPoliza(newCvg));
            });

            // inserting new recepits
            var receipt_array = [];

            var nr;
            var id_receipt;
            var recibo_tipo;
            var owner_id;
            var saveReceiptUrlRequest;

            // test
            if(!insurance.edited_pay_frequency){
              // C�digo agregado el d�a 05/02/2019
              if(insurance.receipts_changes) {
                if(insurance.receipts_changes.delete_receipts.length) {

                  insurance.receipts_changes.delete_receipts.forEach(function(item) {

                    if(item.receipt_type == 1) {
                      if (item.url) {
                        $http.delete(item.url)
                        .then(function(req) {
                          var params = {
                              'model': 1,
                              'event': "DELETE",
                              'associated_id': insurance.id,
                              'identifier': "elimino un recibo"
                             }
                             dataFactory.post('send-log/', params).then(function success(response) {});
                          

                        });
                      }else{
                        var params_ = {
                          'model': 1,
                          'event': "DELETE",
                          'associated_id': insurance.id,
                          'identifier': "elimino recibos al crear la p�liza (vigencia menor de un a�o) "+item.recibo_numero
                         }
                         dataFactory.post('send-log/', params_).then(function success(response) {});
                        
                      }
                    }

                  });

                }
              }
              if(insurance.receipts_changes) {
                if(insurance.receipts_changes.patch_receipts.length) {

                  insurance.receipts_changes.patch_receipts.forEach(function(item) {
                     $http.patch(item.url, item)
                      .then(function(req) {

                      });
                  });
                }
              }
              if (insurance.receipts_changes) {
                if(insurance.receipts_changes.save_receipts.length) {

                  insurance.receipts_changes.save_receipts.forEach(function(item) {

                    if(isNaN(item.comision)) {
                      item.comision = 0;
                    }

                    item.poliza = insurance.url;

                    dataFactory.post('recibos/', item)
                    .then(function success(req) {

                      insurance.old_receipts.push(req.data);

                    }, function error(error) {
                      console.log('___________-', error);
                    });
                  });
                }
              }



              // ************************  ORIGINAL  *****************************
              // insurance.receipts.forEach(function(receipt, index) {

              //  if(receipt.receipt_type != 2){

              //     if(receipt.recibo_numero) {
              //       nr = receipt.recibo_numero;
              //       id_receipt = receipt.id;
              //       recibo_tipo = receipt.receipt_type;
              //       owner_id = receipt.rp_owner_id;

              //     } else {

              //       nr = index + 1;
              //       recibo_tipo = 1;
              //       owner_id = null;

              //     }

              //     receipt.comision = receipt.comision ? parseFloat(receipt.comision) : 0;
              //     var saveReceiptRequest = {
              //       poliza: insurance.url,
              //       recibo_numero: nr,
              //       prima_neta: receipt.prima,
              //       delivered: receipt.delivered,
              //       rpf: receipt.rpf,
              //       derecho: receipt.derecho,
              //       iva: receipt.iva,
              //       comision: receipt.comision ? (receipt.comision).toFixed(2) : 0 ,
              //       sub_total: receipt.subTotal,
              //       prima_total: receipt.total,
              //       status: receipt.status,
              //       fecha_inicio: receipt.startDate,
              //       fecha_fin: receipt.endingDate,
              //       description: "",
              //       receipt_type:recibo_tipo,
              //       rp_owner_id:owner_id,
              //       pay_form:receipt.pay_form,
              //       pay_doc:receipt.pay_doc,
              //       curr_rate:receipt.curr_rate,
              //       bank:receipt.bank,
              //       vencimiento: receipt.vencimiento,
              //       isActive: true,

              //     };
              //     saveReceiptUrlRequest= {
              //       poliza:insurance.url
              //     }

              //   // informaci�n de los recibos, url, etc, etc.
              //   if(insurance.old_receipts.length) {
              //     if(!insurance.edited_pay_frequency){

              //       insurance.old_receipts.forEach(function(item, index) {
              //         if(item.receipt_type == 1) {
              //           if(nr == item.recibo_numero){
              //             $http.patch(item.url,saveReceiptRequest);
              //           } else {
              //             // ESTA LINEA ES LA QUE PROVOCABA UN BUEN DE LLAMADAS
              //             // $http.patch(item.url,saveReceiptRequest);
              //           }
              //         }
              //       });
              //     } else {
              //       insurance.old_receipts = [];
              //     }


              //   } else {
              //     receiptService.createReceiptService(saveReceiptRequest);
              //   }
              //  }
              //  else{
              //  }

              // });
            }


            $q.all(waitForNewData).then(function(responses) {
             getInsuranceRead(insurance)
                .then(function(response) {
                  dfd.resolve(response);
                });
            }, catchIt);


            //END CREATE NEW DATA
          }, catchIt);

        });


      function catchIt(error) {
        dfd.reject(error);
      }

      return dfd.promise;
    }
    function checkRes(result){
      if(result.status < 200 || result.status >= 300){
        dfd.reject(result);
        return true;
      }
      return false;
    }
    function updateFullOT(insurance) {

      var dfd = $q.defer();
      var saveObjRequest = { // Objeto para actualizar
        aseguradora: insurance.aseguradora ? insurance.aseguradora.url : '',
        end_of_validity: insurance.endingDate,
        folio: insurance.folio,
        forma_de_pago: insurance.payment ? insurance.payment.value : null,
        // juridical: insurance.contratante.type_person == 'Moral' ? insurance.contratante.url : null,
        // natural: insurance.contratante.type_person == 'Fisica' ? insurance.contratante.url : null,
        contractor: insurance.contratante.url,
        observations: insurance.observations,
        old_policies: insurance.old_policies,
        paquete: insurance.paquete ? insurance.paquete.url : null,
        poliza_number: insurance.poliza ? insurance.poliza : " ",
        ramo: insurance.ramo ? insurance.ramo.url : null,
        // recibos_poliza: [],
        start_of_validity: insurance.startDate,
        status: insurance.status,
        subramo: insurance.subramo ? insurance.subramo.url : null,
        address:insurance.address.url,
        clave: insurance.clave.url,
        derecho: insurance.derecho ? insurance.derecho : 0,
        iva: insurance.iva ? insurance.iva : 0,
        p_neta: insurance.p_neta ? insurance.p_neta : 0,
        p_total: insurance.p_total ? insurance.p_total : 0,
        rpf: insurance.rpf ? insurance.rpf : 0,
        f_currency: insurance.f_currency ? insurance.f_currency : 1,
        conducto_de_pago: insurance.conducto_de_pago ? insurance.conducto_de_pago : 1,
        sucursal: insurance.sucursal ? insurance.sucursal : '',
        responsable: insurance.responsable,
        identifier: insurance.identifier,
        collection_executive: insurance.collection_executive ? insurance.collection_executive : '',
        hospital_level: insurance.hospital_level ? insurance.hospital_level: '',
        tabulator: insurance.tabulator ? insurance.tabulator: '',
        business_line: insurance.business_line ? insurance.business_line : 0,
        state_circulation: insurance.state_circulation ? insurance.state_circulation : '',
        celula: insurance.celula ? insurance.celula : '',
        groupinglevel: insurance.groupinglevel ? insurance.groupinglevel : '',
      }

      $http.patch(insurance.url, saveObjRequest)
        .catch(catchIt)
        .then(function(updateResponse) {
          var waitForDelete = [];
          //DELETE OLD DATA original
          insurance.old_coverages.forEach(function(old_coverage) {
            waitForDelete.push(coverageService.deleteCoverageByUri(old_coverage.url));
          });

          var old_form_data;

          try{
            waitForDelete.push($http.get(insurance.old_form).then(function(old_form) {
              old_form_data=old_form.data;

            }));
          }
          catch (err){

          }
          //END DELETE
          $q.all(waitForDelete).then(function(responses) {
            var waitForNewData = [];

            // START CREATE NEW DATA
             if (insurance.form_object) {
              if (!old_form_data) {
                var old_form_data = {}
              }
                old_form_data.policy = insurance.url;
                if (insurance.form_object.form){
                  old_form_data.url = insurance.form_object.form.url
                }
                old_form_data.sub_branch = insurance.subramo.url;
              // waitForNewData.push(formService);

                var code = insurance.form_code;
                if (code === 2 || code === 3 || code === 4){
                  var personal_obj={
                  first_name: insurance.form_object.personal.first_name,
                  last_name: insurance.form_object.personal.last_name,
                  second_last_name:insurance.form_object.personal.second_last_name,
                  sex:insurance.form_object.personal.sex,
                  birthdate: insurance.form_object.personal.birthdate,
                  antiguedad: insurance.form_object.personal.antiguedad,
                  policy_type: insurance.form_object.personal.policy_type
                }
                  waitForNewData.push($http.patch(insurance.form_object.personal.url,personal_obj));

                  insurance.form_object.relationships.forEach(function(relationship){
                    if(relationship.url){
                      var relationship_obj={
                        first_name: relationship.first_name,
                        last_name: relationship.last_name,
                        second_last_name:relationship.second_last_name,
                        sex:relationship.sex.value,
                        // birthdate: relationship.birthdate,
                        birthdate: relationship.birthdate ? new Date(datesFactory.toDate(relationship.birthdate)) : new Date(),
                        antiguedad: relationship.antiguedad ? new Date(datesFactory.toDate(relationship.antiguedad)) : new Date(),
                        relationship: relationship.relationship.relationship
                      }
                      waitForNewData.push($http.patch(relationship.url,relationship_obj));
                    }
                    else{
                       var relationship_obj={
                          first_name: relationship.first_name,
                          last_name: relationship.last_name,
                          second_last_name:relationship.second_last_name,
                          sex:relationship.sex.value,
                          // birthdate: relationship.birthdate,
                          birthdate: relationship.birthdate ? new Date(datesFactory.toDate(relationship.birthdate)) : new Date(),
                          antiguedad: relationship.antiguedad ? new Date(datesFactory.toDate(relationship.antiguedad)) : new Date(),
                          relationship: relationship.relationship.relationship,
                          accident: insurance.old_form
                        }
                        waitForNewData.push($http.post(globalVar.relationships,relationship_obj));
                    }

                  });
                }

                else if(code == 1){
                  // var personal_obj={
                  //   first_name: insurance.form_object.personal.first_name,
                  //   last_name: insurance.form_object.personal.last_name,
                  //   second_last_name: insurance.form_object.personal.second_last_name,
                  //   sex: insurance.form_object.personal.sex,
                  //   birthdate: new Date(datesFactory.toDate(insurance.form_object.personal.birthdate)),
                  // }

                  // waitForNewData.push($http.patch(insurance.form_object.personal.url,personal_obj));
                  // Inicio personal_life nuevo
                              // insurance.form_object.personal.forEach(function(item){

                              //   if(item.url){

                              //     var personal_obj = {
                              //       first_name: item.first_name ? item.first_name : "",
                              //       last_name: item.last_name ? item.last_name : "",
                              //       second_last_name: item.second_last_name ? item.second_last_name : "",
                              //       birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                              //       sex : item.sex ? item.sex : "",
                              //       smoker : item.smoker ? item.smoker : false,
                              //     }
                              //     if (personal_obj.smoker == 'True') {
                              //       personal_obj.smoker = true
                              //     }
                              //     else if (personal_obj.smoker == 'False') {
                              //       personal_obj.smoker = false
                              //     }

                              //     waitForNewData.push($http.patch(item.url, personal_obj));
                              //   }

                              //   else{

                              //      var personal_obj = {
                              //       first_name: item.first_name ? item.first_name : "",
                              //       last_name: item.last_name ? item.last_name : "",
                              //       second_last_name: item.second_last_name ? item.second_last_name : "",
                              //       birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                              //       policy: insurance.url,
                              //       smoker : item.smoker ? item.smoker : false,
                              //     }
                              //     if (personal_obj.smoker == 'True') {
                              //       personal_obj.smoker = true
                              //     }
                              //     else if (personal_obj.smoker == 'False') {
                              //       personal_obj.smoker = false
                              //     }
                              //     waitForNewData.push($http.post(globalVar.personal, personal_obj));
                              //   }

                              // });
                  if (insurance.form_object.personal) {
                    insurance.form_object.personal.forEach(function(item){
                      if(item.url){

                        var personal_obj = {
                          first_name: item.first_name ? item.first_name : "",
                          last_name: item.last_name ? item.last_name : "",
                          second_last_name: item.second_last_name ? item.second_last_name : "",
                          birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                          antiguedad: item.antiguedad ? new Date(datesFactory.toDate(item.antiguedad)) : new Date(),
                          sex : item.sex ? item.sex : "",
                          smoker : item.smoker ? item.smoker : false,
                          policy_type: item.policy_type
                        }
                        if (personal_obj.smoker == 'True') {
                          personal_obj.smoker = true
                        }
                        else if (personal_obj.smoker == 'False') {
                          personal_obj.smoker = false
                        }

                        waitForNewData.push($http.patch(item.url, personal_obj).then(function(personalInfo){
                              if((personalInfo)){
                                var personalInfo = personalInfo
                                if (insurance.old_form == undefined || !insurance.old_form ) {
                                  var model = {
                                    sub_branch: insurance.subramo.url ? insurance.subramo.url : insurance.subramo,
                                    policy: insurance.url,
                                    personal: personalInfo.data.url,
                                    smoker: personalInfo.data.smoker
                                  }
                                  generalService.lifeForm(model)
                                    .then(function(lifeFormData){
                                      if((lifeFormData)){
                                        insurance.old_form = lifeFormData.data.url
                                        return;
                                      }
                                  })
                                }

                              }
                          }))
                      }

                      else{

                         var personal_obj = {
                          first_name: item.first_name ? item.first_name : "",
                          last_name: item.last_name ? item.last_name : "",
                          second_last_name: item.second_last_name ? item.second_last_name : "",
                          birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                          antiguedad: item.antiguedad ? new Date(datesFactory.toDate(item.antiguedad)) : new Date(),
                          policy: insurance.url,
                          smoker : insurance.smoker ? insurance.smoker : false,
                          policy_type: item.policy_type
                        }
                        if (personal_obj.smoker == 'True') {
                          personal_obj.smoker = true
                        }
                        else if (personal_obj.smoker == 'False') {
                          personal_obj.smoker = false
                        }
                        waitForNewData.push($http.post(globalVar.personal, personal_obj).then(function(personalInfo){
                              if((personalInfo)){
                                var personalInfo = personalInfo
                                if (insurance.old_form == undefined || !insurance.old_form ) {
                                  var model = {
                                    sub_branch: insurance.subramo.url ? insurance.subramo.url : insurance.subramo,
                                    policy: insurance.url,
                                    personal: personalInfo.data.url,
                                    smoker: personalInfo.data.smoker
                                  }
                                  generalService.lifeForm(model)
                                    .then(function(lifeFormData){
                                      if((lifeFormData)){
                                        insurance.old_form = lifeFormData.data.url
                                        return;
                                      }
                                  })
                                }

                              }
                          }));
                      }


                    });
                  }
                  // fin personal nuevo

                  insurance.form_object.relationships.forEach(function(item){

                    if(item.url){

                      var relationship_obj = {
                        first_name: item.first_name ? item.first_name : "",
                        last_name: item.last_name ? item.last_name : "",
                        second_last_name: item.second_last_name ? item.second_last_name : "",
                        optional_relationship: item.optional_relationship ? item.optional_relationship : "",
                        birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                        antiguedad: item.antiguedad ? new Date(datesFactory.toDate(item.antiguedad)) : new Date(),
                        sex : item.sex ? item.sex : "",
                        percentage: item.percentage ? item.percentage : 100,
                        person: item.person,
                        rfc: item.rfc ? item.rfc : "",
                        j_name: item.j_name ? item.j_name : ""
                      }

                      waitForNewData.push($http.patch(item.url, relationship_obj));
                    }

                    else{

                       var relationship_obj = {
                        first_name: item.first_name ? item.first_name : "",
                        last_name: item.last_name ? item.last_name : "",
                        second_last_name: item.second_last_name ? item.second_last_name : "",
                        optional_relationship: item.optional_relationship ? item.optional_relationship : "",
                        birthdate: item.birthdate ? new Date(datesFactory.toDate(item.birthdate)) : new Date(),
                        antiguedad: item.antiguedad ? new Date(datesFactory.toDate(item.antiguedad)) : new Date(),
                        sex : item.sex ? item.sex : "",
                        percentage: item.percentage ? item.percentage : 100,
                        person: item.person,
                        rfc: item.rfc ? item.rfc : "",
                        j_name: item.j_name ? item.j_name : "",
                        life: insurance.old_form
                      }

                      waitForNewData.push($http.post(globalVar.beneficiaries, relationship_obj));
                    }

                  });

                }

                if (code === 9){
                  var automobile = {
                    brand: insurance.form_object.form.brand,
                    model: insurance.form_object.form.model,
                    year: insurance.form_object.form.year,
                    version: insurance.form_object.form.version,
                    serial: insurance.form_object.form.serial,
                    engine: insurance.form_object.form.engine,
                    color: insurance.form_object.form.color,
                    license_plates: insurance.form_object.form.license_plates,
                    mont_adjustment: insurance.form_object.form.mont_adjustment,
                    adjustment: insurance.form_object.form.adjustment,
                    mont_special_team: insurance.form_object.form.mont_special_team,
                    special_team: insurance.form_object.form.special_team,
                    beneficiary_name: insurance.form_object.form.beneficiary_name,
                    beneficiary_address: insurance.form_object.form.beneficiary_address,
                    beneficiary_rfc: insurance.form_object.form.beneficiary_rfc,
                    policy_type: insurance.form_object.form.policy_type,
                  }
                  if (insurance.form_object.form.url) {
                    waitForNewData.push($http.patch(insurance.form_object.form.url,automobile));
                  }
                }else {
                  if (insurance.form_object.form) {
                    var data = {
                      insured_item: insurance.form_object.form.insured_item,
                      item_address: insurance.form_object.form.item_address,
                      item_details: insurance.form_object.form.item_details,
                      damage_type: insurance.form_object.form.damage_type
                    }

                    $http.patch(insurance.form_object.form.url, data);
                  }else{}
                }

            } else if (insurance.update_form) {
              $http.patch(insurance.update_form.url,insurance.update_form);
            }
            // PRUEBAAAA
            // insurance.old_coverages.forEach(function(old_coverage) {
            //   
            //   insurance.coverages.forEach(function(nv) {
            //     
            //     if ((old_coverage.coverage_name == nv.coverage_name) && (nv.policy == insurance.url)) {
            //       
            //     }
            //   })
            //   // waitForDelete.push(coverageService.deleteCoverageByUri(old_coverage.url));
            // });
            // ORIGINAL
            insurance.coverages.forEach(function(niu) {
              if(niu.sumInPolicy) {
                if(niu.sumInPolicy.label) {
                  var sum_in_policy = niu.sumInPolicy.label;
                } else if(niu.sumInPolicy.value) {
                  var sum_in_policy = niu.sumInPolicy.value;
                } else {
                  var sum_in_policy = 0;
                }
              }

              if(niu.deductibleInPolicy) {
                if(niu.deductibleInPolicy.label) {
                  var ded_in_policy = niu.deductibleInPolicy.label;
                } else if(niu.sumInPolicy.value) {
                  var ded_in_policy = niu.deductibleInPolicy.value;
                } else {
                  var ded_in_policy = 0;
                }
              }

              if(niu.coinsuranceInPolicy) {
                if(niu.coinsuranceInPolicy.value) {
                  var coi_in_policy = niu.coinsuranceInPolicy.value
                }
              }

              if(niu.topeCoinsuranceInPolicy) {
                if(niu.topeCoinsuranceInPolicy.value) {
                  var topecoi_in_policy = niu.topeCoinsuranceInPolicy.value
                }
              }
              var newCvg = {
                policy: insurance.url,
                package: insurance.paquete.url,
                coverage_name: niu.coverage_name ? niu.coverage_name : '',
                priority: niu.priority ? niu.priority : 0,
                deductible: ded_in_policy ? ded_in_policy : 0,
                sum_insured: sum_in_policy ? sum_in_policy :0 ,
                prima: niu.primaInPolicy ? niu.primaInPolicy : 0,
                // coinsurance: niu.coinsuranceInPolicy ? niu.coinsuranceInPolicy : ''
                coinsurance: niu.coinsuranceInPolicy ? coi_in_policy : 0,
                topecoinsurance: niu.topeCoinsuranceInPolicy ? topecoi_in_policy : 0,
              }
              waitForNewData.push(coverageService.createCoberturaPoliza(newCvg));
            });

            var receipt_array=[];
            var nr;
            var recibo_tipo;
            var owner_id;
            var saveReceiptUrlRequest;
            insurance.receipts.forEach(function(receipt, index) {
             if(receipt.receipt_type != 2){

               if(receipt.recibo_numero){
                nr=receipt.recibo_numero;
                recibo_tipo = receipt.receipt_type
                owner_id = receipt.rp_owner_id
              }
              else{
                nr=index+1;
                recibo_tipo=1;
                owner_id = null;
              }
              var saveReceiptRequest = {
                poliza: insurance.url,
                recibo_numero: nr,
                prima_neta: receipt.prima,
                rpf: receipt.rpf,
                derecho: receipt.derecho,
                iva: receipt.iva,
                sub_total: receipt.subTotal,
                prima_total: receipt.total,
                status: receipt.status,
                fecha_inicio: receipt.startDate,
                fecha_fin: receipt.endingDate,
                description: "",
                receipt_type:recibo_tipo,
                rp_owner_id:owner_id,
                pay_form:receipt.pay_form,
                pay_doc:receipt.pay_doc,
                curr_rate:receipt.curr_rate,
                bank:receipt.bank,
                delivered:receipt.delivered ? receipt.delivered : false,
                isActive: false

              }
              saveReceiptUrlRequest= {
                    poliza:insurance.url
                  }

              // receipt_array.push(saveReceiptRequest);
              if(insurance.old_receipts.length >0){
                for(var i=0;i<insurance.old_receipts.length;i++){
                  if(nr == insurance.old_receipts[i].recibo_numero && insurance.old_receipts[i].receipt_type == 1){
                    $http.patch(insurance.old_receipts[i].url,saveReceiptRequest);
                  }
                  else {
                     $http.patch(insurance.old_receipts[i].url,saveReceiptUrlRequest);
                  }
                }


              }
              else{
                receiptService.createReceiptService(saveReceiptRequest);
              }
             }
             else{
             }

            });
            $q.all(waitForNewData).then(function(responses) {
             getInsuranceRead(insurance)
                .then(function(response) {
                  // setTimeout(function() {
                  //   if (insurance.old_receipts.length > 0) {
                  //     waitForDelete.push(receiptService.deleteReceipts(insurance.old_receipts));
                  //   }
                  // }, 1000);
                  dfd.resolve(response);
                });
            }, catchIt);


            //END CREATE NEW DATA
          }, catchIt);

        });


      function catchIt(error) {
        dfd.reject(error);
      }

      return dfd.promise;
    }

    function updateInsurance(data) {
      if (!data.id) {
        return $http.put(data.url, data)
          .then(updateInsuranceComplete)
          .catch(updateInsuranceFailed);
      }

      return $http.put(url.IP + 'polizas/' + data.id + '/', data)
        .then(updateInsuranceComplete)
        .catch(updateInsuranceFailed);

      function updateInsuranceComplete(response) {
        return response;
      }

      function updateInsuranceFailed(error) {
        return error;
      }
    }

    function deleteInsurance() { }

    function getFiles(insurance) {

      return fileService.getFiles(url.IP + 'polizas/' + insurance.id + '/archivos/');
      /*
      return $http.get(url.IP + 'polizas/' + insurance.id + '/archivos/')
          .then(getFilesComplete)
          .catch(getFilesFailed);

      function getFilesComplete(response) {
          return response;
      }

      function getFilesFailed(error) {
          return error;
      }*/
    }

    function getPolicyAndEndorsement(parData) {
      return $http.get(parData.req)
        .then(function(insuranceRes) {
          return getInsuranceData(insuranceRes.data)
            .then(function(res) {
              return $http.get(parData.endo)
                .then(function(folioRes) {
                  return { endorsement: res, original: folioRes.data };
                });
            });
        });


    }

    function getRequestData(insurance, endorsement) {
      var dfd = $q.defer();
      getInsuranceData(insurance)
        .then(function(insuranceData) {

          var requestData = {
            address:endorsement.address,
            clave:endorsement.clave,
            payment: { value: endorsement.forma_de_pago.value },
            //Data to stay the same
            id: insurance.id,
            internal_number: insurance.internal_number,
            url: insurance.url,
            type: "",
            status: insurance.status,
            ramo: endorsement.ramo,
            subramo: endorsement.subramo,
            paquete: endorsement.paquete,
            poliza: insurance.poliza_number,
            polizaId: url.IP + 'leer-polizas/' + insurance.id + '/',
            observations: insurance.observations,
            folio: insurance.folio,
            endingDate: new Date(insurance.end_of_validity),
            startDate: new Date(insurance.start_of_validity),
            aseguradora: endorsement.aseguradora, // object
            contratante: endorsement.juridical ?
              endorsement.juridical : endorsement.natural,// object
            form_code: insurance.subramo,
            //DATA TO ADD
            receipts: [],// endorsement.recibos_poliza,
            coverages: endorsement.coverageInPolicy_policy, // array
            //Data to delete
            old_receipts: insuranceData.recibos_poliza,
            old_coverages: insurance.coverageInPolicy_policy,
            old_policies: insurance.old_policies,
            update_form: endorsement.accidents_policy.length > 0 ? endorsement.accidents_policy[0]:
              endorsement.automobiles_policy.length > 0 ? endorsement.automobiles_policy[0]:
                endorsement.damages_policy.length > 0 ? endorsement.damages_policy[0]:
                  endorsement.life_policy.length > 0 ? endorsement.life_policy[0] :
                    undefined,
            old_form: insurance.accidents_policy.length > 0 ? insurance.accidents_policy[0].url :
              insurance.automobiles_policy.length > 0 ? insurance.automobiles_policy[0].url :
                insurance.damages_policy.length > 0 ? insurance.damages_policy[0].url :
                  insurance.life_policy.length > 0 ? insurance.life_policy[0].url :
                    undefined,
          }

          requestData.coverages.forEach(function(coverage) {
            coverage.deductibleInPolicy = {label: coverage.deductible};
            coverage.sumInPolicy = { label: coverage.sum_insured};
            coverage.primaInPolicy = coverage.prima;
            coverage.coinsuranceInPolicy = coverage.coinsurance;
            coverage.topeCoinsuranceInPolicy = coverage.topecoinsurance;

          });

          endorsement.recibos_poliza.forEach(function(recibo,index){
            var reciboNuevo = {

              startDate: new Date(recibo.fecha_inicio),
              endingDate: new Date(recibo.fecha_fin),
              total: recibo.prima_total,
              subTotal: recibo.sub_total,
              iva: recibo.iva,
              derecho: recibo.derecho,
              rpf: recibo.rpf,
              prima: recibo.prima_neta,
              recibo_numero:recibo.recibo_numero,
              status: recibo.status,
              receipt_type: recibo.receipt_type,
              rp_owner_id: recibo.rp_owner_id,
              pay_form:recibo.pay_form,
              pay_doc:recibo.pay_doc,
              curr_rate:recibo.curr_rate,
              bank:recibo.bank
            };
            requestData.receipts.push(reciboNuevo);
          });

          requestData.update_form.id = undefined;
          requestData.update_form.damage_type = undefined;

          requestData.update_form.policy = undefined;
          requestData.update_form.url = angular.copy(requestData.old_form);
          if(requestData.update_form.personal){
            requestData.update_form.personal = requestData.update_form.personal.url;
          }

          requestData.old_form = undefined;
          dfd.resolve(requestData);
        });



      return dfd.promise;
    }

    function applyEndorsement(req) {
      var dfd = $q.defer();

      var original = req.original;
      var endorsement = req.endorsement;
      getRequestData(original, endorsement)
        .then(function(requestData) {
          requestData.endorsementedUrl = endorsement.url;
          updateFullInsurance(requestData)
            .then(function(response) {
              dfd.resolve(response);
            });
        });
      return dfd.promise;
    }


    function applyBackupEndorsement(req) {
      var dfd = $q.defer();
      var original = req.endorsement;
      var endorsement = req.original;
      getRequestData(original, endorsement)
        .then(function(requestData) {
          updateFullInsurance(requestData)
            .then(function(response) {
              dfd.resolve(response);
            });
        });
      return dfd.promise;
    }


    function getRequestBackupData(insurance,endorsement) {
      var dfd = $q.defer();
      ContratanteService.getContratantes().then(function(contratantes){

        getInsuranceDataBackup(insurance)
        .then(function(insuranceData) {
          var contratanteName;
          var typePerson;
          if(endorsement.juridical){
            contratanteName=endorsement.juridical;
            typePerson='juridical';
          }
          else{
            contratanteName=endorsement.natural;
            typePerson='natural';
          }
          var contratant;

          for(var i=0;i<contratantes.length;i++){

            if(typePerson=='juridical'){
              if(contratantes[i].j_name==contratanteName){
                contratant=contratantes[i];
              }
            }
            else{
              var name_natural=contratantes[i].first_name+' '+contratantes[i].last_name;
              if(name_natural==contratanteName){
                contratant=contratantes[i];
              }
            }
          }

          var wait =[];
          var address;
          var clave;
          wait.push($http.get(endorsement.address))
          wait.push($http.get(endorsement.clave))
          $q.all(wait).then(function(data) {
            data.forEach(function(addressData) {
              if(addressData.data.route){
                address = addressData.data
              }
              else if(addressData.data.clave){
                clave = addressData.data
              }
            });
              // address=addressData.data
              var requestData = {
                address:address,
                clave:clave,
                payment: { value: endorsement.forma_de_pago.value },
                //Data to stay the same
                id: insurance.id,
                internal_number: insurance.internal_number,
                url: insurance.url,
                type: "",
                status: insurance.status,
                ramo: endorsement.ramo,
                subramo: endorsement.subramo,
                paquete: endorsement.paquete,
                poliza: insurance.poliza_number,
                polizaId: url.IP + 'leer-polizas/' + insurance.id + '/',
                observations: endorsement.observations,
                folio: insurance.folio,
                endingDate: new Date(insurance.end_of_validity),
                startDate: new Date(insurance.start_of_validity),
                aseguradora: endorsement.aseguradora, // object

                contratante: contratant,// object
                form_code: insurance.subramo,
                //DATA TO ADD
                receipts: [],// endorsement.recibos_poliza,
                coverages: endorsement.coverageInPolicy_policy, // array
                //Data to delete
                old_receipts: insuranceData.recibos_poliza,
                old_coverages: insurance.coverageInPolicy_policy,
                old_policies: insurance.old_policies,
                update_form: endorsement.accidents_policy.length > 0 ? endorsement.accidents_policy[0]:
                  endorsement.automobiles_policy.length > 0 ? endorsement.automobiles_policy[0]:
                    endorsement.damages_policy.length > 0 ? endorsement.damages_policy[0]:
                      endorsement.life_policy.length > 0 ? endorsement.life_policy[0] :
                        undefined,
                old_form: insurance.accidents_policy.length > 0 ? insurance.accidents_policy[0].url :
                  insurance.automobiles_policy.length > 0 ? insurance.automobiles_policy[0].url :
                    insurance.damages_policy.length > 0 ? insurance.damages_policy[0].url :
                      insurance.life_policy.length > 0 ? insurance.life_policy[0].url :
                        undefined,
              }
              requestData.coverages.forEach(function(coverage) {
                coverage.deductibleInPolicy = {label: coverage.deductible};
                coverage.sumInPolicy = { label: coverage.sum_insured};
                coverage.primaInPolicy = coverage.prima;
                coverage.coinsuranceInPolicy = coverage.coinsurance;
                coverage.topeCoinsuranceInPolicy = coverage.topecoinsurance;
              });

              endorsement.recibos_poliza.forEach(function(receipt,index){
                receiptService.getReceiptsByUriService(receipt).then(function(recibo) {
                  var reciboNuevo = {
                    startDate: new Date(recibo.fecha_inicio),
                    endingDate: new Date(recibo.fecha_fin),
                    total: recibo.prima_total,
                    subTotal: recibo.sub_total,
                    iva: recibo.iva,
                    derecho: recibo.derecho,
                    rpf: recibo.rpf,
                    prima: recibo.prima_neta,
                    recibo_numero:recibo.recibo_numero,
                    status: recibo.status,
                    receipt_type: recibo.receipt_type,
                    rp_owner_id: recibo.rp_owner_id,
                    pay_form:recibo.pay_form,
                    pay_doc:recibo.pay_doc,
                    curr_rate:recibo.curr_rate,
                    bank:recibo.bank
                  };
                  requestData.receipts.push(reciboNuevo);
                });
              });

              requestData.update_form.id = undefined;
              requestData.update_form.damage_type = undefined;

              requestData.update_form.policy = undefined;
              requestData.update_form.url = angular.copy(requestData.old_form);
              if(requestData.update_form.personal){
                requestData.update_form.personal = requestData.update_form.personal.url;
              }

              requestData.old_form = undefined;
              //parsing subform
              dfd.resolve(requestData);

        //termina
          });



        });
      });



      return dfd.promise;
    }

    function getInsuranceDataBackup(insurance) {
        var recibos=[];
        files=[];

        var dfd = $q.defer();
        var uri = url.IP + 'polizas/' + insurance.id + '/';
        var insuranceComplete = {};
        var things = 0;
        var thingsToLoad = 1; // the insurance

        $http.get(uri)
          .then(function(insuranceResponse) {

            if (checkResponse(insuranceResponse)) {
              return;
            }

            var insuranceEmpty = insuranceResponse.data
            insuranceEmpty.coverageInPolicy_policy = insurance.coverageInPolicy_policy;
            insuranceEmpty.read = insurance;

            insuranceComplete = angular.copy(insuranceEmpty);

            // polizas viejas
            thingsToLoad += insurance.old_policies.length;
            insuranceComplete.old_policies = [];
            insurance.old_policies.forEach(function(old_policy) {
              $http.get(old_policy.url)
                .then(function(obj) {
                  $http.get(obj.data.base_policy)
                    .then(function(baseResponse) {
                      var data = baseResponse.data;
                      data.url_old_policy = data.url;
                      data.url = old_policy.url;

                      insuranceComplete.old_policies.push(baseResponse.data);
                      thingLoaded("p?iza vieja");
                    });
                });
            });

            //recibos
            thingsToLoad += insuranceComplete.recibos_poliza.length;
            insuranceComplete.recibos_poliza = []
            insuranceEmpty.recibos_poliza.forEach(function(receiptUri) {
              receiptService.getReceiptsByUriService(receiptUri)
                .then(function(receiptObj) {
                  insuranceComplete.recibos_poliza.push(receiptObj);
                  thingLoaded("recibo");  // Receipt loaded
                });
            });

            //payform
            thingsToLoad++;
            payform.some(function(form) {
              if (form.value = insuranceEmpty.forma_de_pago) {
                insuranceComplete.forma_de_pago = form;
                return true;
              }
            })
            thingLoaded("payform");  // payform loaded

            //provider
            thingsToLoad++;
            providerService.getProviderByUri(insuranceEmpty.aseguradora)
              .then(function(providerResponse) {
                if (checkResponse(providerResponse)) {
                  return;
                }
                insuranceComplete.aseguradora = providerResponse.data;
                thingLoaded("provider"); // provider loaded
              });

            //ramo
            thingsToLoad++;
            ramoService.getRamoByUri(insuranceEmpty.ramo)
              .then(function(ramoResponse) {
                if (checkResponse(ramoResponse)) {
                  return;
                }
                insuranceComplete.ramo = ramoResponse.data;
                thingLoaded("ramo");
              });

            //subramo
            thingsToLoad++;
            ramoService.getSubramoByUri(insuranceEmpty.subramo)
              .then(function(subramoResponse) {
                if (checkResponse(subramoResponse)) {
                  return;
                }
                insuranceComplete.subramo = subramoResponse.data;
                thingLoaded("subramo");
              });

            // package
            if (insuranceEmpty.paquete) {
              thingsToLoad++;
              packageService.getPackageByUri(insuranceEmpty.paquete)
                .then(function(packageResponse) {
                  if (checkResponse(packageResponse)) {
                    return;
                  }
                  insuranceComplete.paquete = packageResponse.data;
                  thingLoaded("Paquete");
                });
            }

            //

            if (insuranceEmpty.life_policy.length > 0) {
              thingsToLoad += insuranceEmpty.life_policy.length; // cargaremos cada life_policy
              insuranceEmpty.life_policy.forEach(function(elem, index) {
                thingsToLoad += elem.beneficiaries_life.length;
                $http.get(elem.personal)
                  .then(function(response) {
                    insuranceComplete.life_policy[index].personal = response.data;
                    thingLoaded('life_policy');
                  });
                elem.beneficiaries_life.forEach(function(ben, benPos) {
                  $http.get(ben.life)
                    .then(function(response) {
                      insuranceComplete.life_policy[index].beneficiaries_life[benPos].life = response.data;
                      thingLoaded('beneficiary');
                    });
                });
              });
            } else if (insuranceEmpty.accidents_policy.length > 0) {
              thingsToLoad += insuranceEmpty.accidents_policy.length; // cargaremos cada life_policy
              insuranceEmpty.accidents_policy.forEach(function(elem, index) {
                thingsToLoad += elem.relationship_accident.length;
                $http.get(elem.personal)
                  .then(function(response) {
                    insuranceComplete.accidents_policy[index].personal = response.data;
                    thingLoaded('accidents_policy');
                  });
                elem.relationship_accident.forEach(function(ben, benPos) {
                  $http.get(ben.accident)
                    .then(function(response) {
                      insuranceComplete.accidents_policy[index].relationship_accident[benPos].accident = response.data;
                      thingLoaded('relationship_accident');
                    });
                });
              });
            }

            // contractor
            thingsToLoad++;
            if (insuranceEmpty.juridical) {
              ContratanteService.getContratanteByUri(insuranceEmpty.juridical)
                .then(function(contractorResponse) {
                  if (checkResponse(contractorResponse)) {
                    return;
                  }
                  insuranceComplete.juridical = contractorResponse.data;
                  $http.get(insuranceComplete.juridical.group)
                    .then(function(response) {
                      insuranceComplete.juridical.group = response.data;
                      thingLoaded("juridical");
                    });
                });
            }

            if (insuranceEmpty.natural) {
              ContratanteService.getContratanteByUri(insuranceEmpty.natural)
                .then(function(contractorResponse) {
                  if (checkResponse(contractorResponse)) {
                    return;
                  }
                  insuranceComplete.natural = contractorResponse.data;
                  $http.get(insuranceComplete.natural.group)
                    .then(function(response) {
                      insuranceComplete.natural.group = response.data;
                      thingLoaded("natural");
                    });
                });
            }

            // files
            thingsToLoad++;
            getFiles(insurance)
              .then(function(filesData) {
                insuranceComplete.files = { results: filesData };
                thingLoaded("files");
              });

            thingLoaded("insurance"); // Policy loaded
          }).catch(function(error) {
            dfd.reject(error);
          });


        function thingLoaded(what) {
              things++;
              if (things >= thingsToLoad) {
                var initDate = new Date(insuranceComplete.start_of_validity);
                var endingDate = new Date(insuranceComplete.end_of_validity);

                initDate = new Date(initDate.getTime() + (initDate.getTimezoneOffset() * 60000));
                endingDate = new Date(endingDate.getTime() + (endingDate.getTimezoneOffset() * 60000));

                insuranceComplete.start_of_validity = initDate;
                insuranceComplete.end_of_validity = endingDate;

                dfd.resolve(insuranceComplete);
              }
            }

            function checkResponse(response) {
              if (response.status < 200 || response.status >= 300) {
                dfd.reject(response);
                return true;
              }
              return false;
            }

            return dfd.promise;
          }
    }

})();
