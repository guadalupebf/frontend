(function () {
  'use strict'

  angular.module('inspinia')
    .factory('formService', formService);

  formService.$inject = ['$http','generalService', 'helpers','datesFactory'];

  function formService($http, generalService, helpers,datesFactory){
    var service = {
      createForm: createForm,
      getPersonalInfoByUri: getPersonalInfoByUri,
      deleteFormByUri: deleteFormByUri,
      createAccidentsDisease: createAccidentsDisease,
    }

    return service;

    function createForm(object){ // code required, insurance required
      var dfd = $.Deferred();
      var code = parseInt(object.code);
      var insurance = object.insurance;

      var responseFromThis = {};
      var done = 0;
      var toBeDone = 0;

      if( code == 1 || code == 30){ // personal: Object, relationships: [], smoker: boolean requied
        var personal = object.personal;
        var beneficiaries = object.relationships;
        var smoker = object.smoker;
        var asegs = object.personal_life_policy;
        responseFromThis = {
          personalInfo: null,
          lifeForm : null,
          beneficiaries: [],
          personal_life_policy : []
        }
        // console.log('---------',personal,beneficiaries,smoker,asegs,object)
        if (asegs) {
          asegs.forEach(function(element, index) {
              element.policy = insurance.url;
              if(element.birthdate && element.birthdate.length ==10){
                element.birthdate = element.birthdate ? datesFactory.toDate(element.birthdate) : null;           
              }
              if(element.antiguedad && element.antiguedad.length ==10){
                element.antiguedad = element.antiguedad ? datesFactory.toDate(element.antiguedad) : null;           
              }
              element.full_name = element.first_name + ' ' + element.last_name + ' ' + element.second_last_name;
              element.smoker = element.smoker ? element.smoker : false;              
              if (index == 0) {
                if (personal) {
                  if(personal.birthdate && personal.birthdate.length ==10){
                    personal.birthdate = personal.birthdate ? datesFactory.toDate(personal.birthdate) : null;
                  }                      
                  if(personal.antiguedad && personal.antiguedad.length ==10){
                    personal.antiguedad = personal.antiguedad ? datesFactory.toDate(personal.antiguedad) : null;
                  }
                }
                toBeDone = 2 + beneficiaries.length;
                generalService.createPersonalInformation(element)
                  .then(function (personalInfo) {
                    if(checkRes(personalInfo)){
                      return;
                    }

                    responseFromThis.personalInfo = personalInfo.data;

                    var model = {
                      sub_branch: insurance.subramo.url ? insurance.subramo.url : insurance.subramo,
                      policy: insurance.url,
                      personal: personalInfo.data.url,
                      smoker: smoker ? smoker : false
                    }
                    generalService.lifeForm(model)
                      .then(function(lifeFormData){
                        if(checkRes(lifeFormData)){
                          return;
                        }
                        responseFromThis.lifeForm = lifeFormData.data;
                        aThingIsDone();
                        beneficiaries.forEach(function(elementb, index) {
                          elementb.life = lifeFormData.data.url;                              
                          if(elementb.birthdate.length ==10){
                            elementb.birthdate = elementb.birthdate ? datesFactory.toDate(elementb.birthdate) : null;           
                          }                            
                          if(elementb.antiguedad.length ==10){
                            elementb.antiguedad = elementb.antiguedad ? datesFactory.toDate(elementb.antiguedad) : null;           
                          }
                          elementb.full_name = elementb.first_name + ' ' + elementb.last_name + ' ' + elementb.second_last_name;
                          generalService.createBeneficiaries(elementb)
                            .then(function(beneficiarie) {
                              responseFromThis.beneficiaries.push(beneficiarie);
                              aThingIsDone();
                            });
                        });
                        aThingIsDone();
                      });

                    aThingIsDone();
                  }).catch(function(error){
                    dfd.reject(error);
                  });
              }else{
                generalService.createPersonalInformation(element)
                  .then(function(as) {
                    responseFromThis.personal_life_policy.push(as);
                    // console.log('mas de uno personal-',element,as,responseFromThis)
                })
              }
              aThingIsDone();
          });
        }
        toBeDone = 2 + beneficiaries.length;
      }else if( code === 2 || code === 3 || code === 4){ // personal: obj relationships: [] , coinsurance: string required
        //personal: Object
        //  first_name:       string
        //  last_name:        string
        //  second_last_name: string
        //  birthdate:        Date
        //  sex:              string F M

        //relationship: Object
        //  birthdate:        Date
        //  first_name:       string
        //  last_name:        string
        //  relationships:    Object
        //    option:           string
        //    relationship:     string
        //  second_last_name: string
        //  sex:              string
        var type = helpers.diseaseType(code);

        var personal = object.personal;
        var coinsurance = object.coinsurance;
        var relationships = object.relationships
        personal.birthdate = personal.birthdate ? datesFactory.toDate(personal.birthdate) : null;
        personal.antiguedad = personal.antiguedad ? datesFactory.toDate(personal.antiguedad) : null;

        responseFromThis = {
          personalInfo: null,
          diseaseForm : null,
          relationships: []
        }

        toBeDone = 2 + relationships.length;


        generalService.createPersonalInformation(personal)
          .then(function (personalInfo) {
            if(checkRes(personalInfo)){
              return;
            }

            responseFromThis.personalInfo = personalInfo.data;

            var model = {
              sub_branch: insurance.subramo.url ? insurance.subramo.url : insurance.subramo,
              policy:     insurance.url,
              personal:   personalInfo.data.url,
              disease_type: type,
              coinsurance: coinsurance ? coinsurance : ''
            }
            generalService.diseaseForm(model)
              .then(function(diseaseData){
                if(checkRes(diseaseData)){
                  return;
                }
                responseFromThis.diseaseForm = diseaseData.data;

                var ulr = diseaseData.data.url;

                relationships.forEach(function(relationship){ // delete .toISOString().split("T")[0]
                  relationship.birthdate = relationship.birthdate ? datesFactory.toDate(relationship.birthdate) : null;
                  relationship.antiguedad = relationship.antiguedad ? datesFactory.toDate(relationship.antiguedad) : null;
                  relationship.accident = diseaseData.data.url;
                  relationship.relationship = relationship.relationship.relationship;
                  relationship.sex = relationship.sex.value;

                  generalService.createRelationship(relationship)
                    .then(function(relationshipData){
                      responseFromThis.relationships.push(relationship);
                      aThingIsDone();
                    });
                });
                aThingIsDone();
              });
            aThingIsDone();
          }).catch(function(error){
            dfd.reject(error);
          });
      }else if( code === 5 || code === 6 || code === 7 || code === 8 || code === 10 || code === 11 || code === 12 || code === 13 || code === 14 || code === 31) {
        toBeDone++;
        generalService.damageForm(object.form)
          .then(function(dam) {
              aThingIsDone();
          });
      }else if( code === 9){
        toBeDone++;
        generalService.automobileForm(object.form)
          .then(function(aut){
            aThingIsDone();
          });
      }
      function convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
        return date;
      }
      function checkRes(result){
        if(result.status < 200 || result.status >= 300){
          dfd.reject(result);
          return true;
        }
        return false;
      }

      function aThingIsDone(){
        done++;
        if(done >= toBeDone){
          dfd.resolve(responseFromThis);
        }
      }

      return dfd.promise();
    }

    function getPersonalInfoByUri(uri){
      return $http.get(uri);
    }

    function deleteFormByUri(uri){
      return $http.delete(uri);
    }
    // Accident Disease
    function createAccidentsDisease(object){ // code required, insurance required
      var dfd = $.Deferred();
      var code = parseInt(object.code);
      var insurance = object.insurance;

      var responseFromThis = {};
      var done = 0;
      var toBeDone = 0;

      if( code === 2 || code === 3 || code === 4){ // personal: obj relationships: [] , coinsurance: string required
        var type = helpers.diseaseType(code);

        var personal = object.personal;
        var coinsurance = object.coinsurance;
        var relationships = object.relationships
        // personal.birthdate = personal.birthdate ? datesFactory.toDate(personal.birthdate) : null;
        // personal.antiguedad = personal.antiguedad ? datesFactory.toDate(personal.antiguedad) : null;

        responseFromThis = {
          personalInfo: null,
          diseaseForm : null,
          relationships: []
        }

        toBeDone = 2 + relationships.length;


        generalService.createPersonalInformation(personal)
          .then(function (personalInfo) {
            if(checkRes(personalInfo)){
              return;
            }

            responseFromThis.personalInfo = personalInfo.data;

            var model = {
              sub_branch: insurance.subramo.url ? insurance.subramo.url : insurance.subramo,
              policy:     insurance.url,
              personal:   personalInfo.data.url,
              disease_type: type,
              coinsurance: coinsurance ? coinsurance : ''
            }
            generalService.diseaseForm(model)
              .then(function(diseaseData){
                if(checkRes(diseaseData)){
                  return;
                }
                responseFromThis.diseaseForm = diseaseData.data;

                var ulr = diseaseData.data.url;

                relationships.forEach(function(relationship){ // delete .toISOString().split("T")[0]
                  relationship.accident = diseaseData.data.url;

                  generalService.createRelationship(relationship)
                    .then(function(relationshipData){
                      responseFromThis.relationships.push(relationship);
                      aThingIsDone();
                    });
                });
                aThingIsDone();
              });
            aThingIsDone();
          }).catch(function(error){
            dfd.reject(error);
          });
      }
      function convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
        return date;
      }
      function checkRes(result){
        if(result.status < 200 || result.status >= 300){
          dfd.reject(result);
          return true;
        }
        return false;
      }

      function aThingIsDone(){
        done++;
        if(done >= toBeDone){
          dfd.resolve(responseFromThis);
        }
      }

      return dfd.promise();
    }
  }
})();
