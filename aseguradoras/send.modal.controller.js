(function() {
    'use strict';

    angular.module('inspinia')
        .controller('SendPDFModalCtrl', SendPDFModalCtrl);

    SendPDFModalCtrl.$inject = ['$uibModalInstance', 'providerService', 'provider', '$scope', 'dataFactory', 'SweetAlert', 'MESSAGES', 'typeOT','$sessionStorage', 'FileUploader','$http','url'];

    function SendPDFModalCtrl($uibModalInstance, providerService, provider, $scope, dataFactory, SweetAlert, MESSAGES, typeOT,$sessionStorage, FileUploader,$http,url) {
        $scope.vm = this;
        $scope.cc = false;
        $scope.vm.email = [];
        $scope.typeOT = typeOT;
        $scope.plantillas = [];
        activate();

        var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
        var decryptedToken = sjcl.decrypt("Token", $sessionStorage.token);
        var usr = JSON.parse(decryptedUser);
        var token = JSON.parse(decryptedToken);
        $scope.vm.subjectEmail = '';
        $scope.vm.messageEmail = '';
        function activate() {
            if(provider.policy){
                var provider_id = provider.policy.aseguradora.id;
                $scope.provider_id = provider.policy.aseguradora.id;
                $scope.idPoliza = provider.policy.id
                $scope.policyId = provider.policy.id;
            } else if(provider.aseguradora){
                var provider_id = provider.aseguradora.id;
                $scope.provider_id = provider.aseguradora.id;
                $scope.idPoliza = provider.id
                $scope.policyId = provider.aseguradora ? provider.aseguradora.id : 0;
            }
        	providerService.getEmailContacts(provider_id)
        	.then(function success(response) {
        		$scope.vm.contacts = response.data.results;
        	})
          loadEndosoTemplates();
        
        }

        $scope.flagMethod = function() {
            if($scope.cc){
                $scope.cc = false;
            } else {
                $scope.cc = true;
            }
        }
        
        $scope.custom_email = "";
        $scope.sendEmail = function(parEmail,files, first_comment, second_comment) {
            if ($scope.vm.subjectEmail && ($scope.vm.messageEmail || $scope.vm.first_comment)) {
                $scope.sendEmail_OK(parEmail,files, first_comment, second_comment)
            }else{
                SweetAlert.swal("Error", "Asegurese de agregar el Asunto y Mensaje", "error");    
            }
        }
        $scope.sendEmail_OK = function(parEmail,files, first_comment, second_comment) {
            if(typeOT == 1){
                var parUrl = 'get-pdf-ot/';
                var data = {'id': provider.id}
                // return
                dataFactory.post('send-to-provider/', {'pdf': 'ot', 'id': data.id, 'email': parEmail.email ? [parEmail.email] : [parEmail],'files': share_via_email,'asunto': $scope.vm.subjectEmail, 'mensaje': $scope.vm.messageEmail,'custom_email':$scope.custom_email, 'first_comment':$scope.vm.first_comment,'second_comment':$scope.vm.second_comment})
                .then(function success(resend) {
                    if(resend.status == 200){
                        SweetAlert.swal("¡Listo!", MESSAGES.OK.SENDPROVIDER, "success");
                        $scope.cancel();
                    } else {
                        SweetAlert.swal("Error", "No se ha podido enviar a la compañia", "error");
                    }
                })
            } else if(typeOT == 2){
                var parUrl = 'get-pdf-endosos-new/';
                if (provider.policy){
                    var data = {'poliza': provider.policy.id, 'endoso': provider.id, 'pdf': 'ot', 'id': provider.policy.id, 'email': parEmail.email ? [parEmail.email] : [parEmail],'files': share_via_email,'asunto': $scope.vm.subjectEmail, 'mensaje': $scope.vm.messageEmail,'custom_email':$scope.custom_email, 'first_comment':$scope.vm.first_comment,'second_comment':$scope.vm.second_comment}
                }
                if (provider.fianza){
                    var data = {'poliza': provider.fianza.id, 'endoso': provider.id, 'pdf': 'ot', 'id': provider.fianza.id, 'email': parEmail.email ? [parEmail.email] : [parEmail],'files': share_via_email,'asunto': $scope.vm.subjectEmail, 'mensaje': $scope.vm.messageEmail,'custom_email':$scope.custom_email, 'first_comment':$scope.vm.first_comment,'second_comment':$scope.vm.second_comment}
                }

                dataFactory.post('send-to-provider/', data)
                .then(function success(resend) {
                    if(resend.status == 200){
                        SweetAlert.swal("¡Listo!", MESSAGES.OK.SENDPROVIDER, "success");
                        $scope.cancel();
                    } else {
                        SweetAlert.swal("Error", "No se ha podido enviar a la compañia", "error");
                    }
                })
            }
        }
        $scope.adjFilesOK = function(val){
          $scope.adjFiles = val;
          if (typeOT ==1) {            
              $http.get(url.IP + 'polizas/'+ $scope.idPoliza+'/archivos/').then(function(response) {
                if(response.status === 200) {
                  $scope.vm.files = response.data.results;
                  $scope.files = response.data.results;
                  $scope.files.forEach(function(file) {
                    file['to_send'] = false;
                  })
                  $scope.show_files_policy = true;
                }
              });
          }
          if (typeOT ==2) { 
            $scope.idPoliza =provider.id
              $http.get(url.IP + 'endosos/'+ $scope.idPoliza+'/archivos/').then(function(response) {
                if(response.status === 200) {
                  $scope.vm.files = response.data.results;
                  $scope.files = response.data.results;
                  $scope.files.forEach(function(file) {
                    file['to_send'] = false;
                  })
                  $scope.show_files_policy = true;
                }
              });
          }
        }
        // ---------------

        var share_via_email = [];
        function loadEndosoTemplates() {
          dataFactory.get('emailtemplate/',{'template_model':6})
          .then(function success(response) {
            $scope.plantillas = response ? response.data.results : [];
          })
          .catch(function(err){
            console.log('error loading templates', err);
          });
        }
        $scope.changePlantilla = function(item){
          if(!item){
            return;
          }
          $scope.vm.subjectEmail = item.title || $scope.vm.subjectEmail;
          $scope.vm.first_comment = item.text || '';
          if($scope.vm.first_comment && $scope.vm.first_comment.includes('\n')){
            $scope.vm.first_comment = $scope.vm.first_comment.replace(/\n/g, '<br><br>');
          }
          $scope.vm.second_comment = item.bottom_text || '';
          $scope.custom_email = true;
        };
        $scope.getTemplate = function(custom_email) {
          if(!custom_email){
            $scope.vm.first_comment = '';
            $scope.vm.second_comment = '';
          }
        };
        function validateEmail(email) {
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(email);
        }

         /** Uploader files **/
        $scope.userInfo = {
          id: 0
        };
        $scope.countFile = 0;
        $scope.okFile = 0;

        var uploader = $scope.uploader = new FileUploader({
          headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
        });

        // uploader.filters.push({
        //     name: 'customFilter',
        //     fn: function(item, options) {
        //         return this.queue.length < 20;
        //     }
        // });
        // ALERTA ERROR UPLOADFILES
        uploader.onErrorItem = function(fileItem, response, status, headers) {
          SweetAlert.swal("ERROR", MESSAGES.ERROR.ERRORONUPLOADFILES, "error");
        };

        uploader.onAfterAddingFile = function(fileItem) {
          fileItem.formData.push({
              arch: fileItem._file
          });

          if(fileItem){
            $scope.countFile++;
          }
        };

        uploader.onBeforeUploadItem = function(item) {
          if(item.file.sensible != undefined){
            item.formData[0].sensible = item.file.sensible;
          }
          item.url = $scope.userInfo.url;
          item.formData[0].nombre = item.file.name;
          item.alias = '';
          item.formData[0].owner = $scope.userInfo.id;
        };
        $scope.vm.uploadFiles = uploadFiles;
        function uploadFiles(polizaId) {
          var l = Ladda.create( document.querySelector( '.ladda-button' ) );
          l.start();
          $scope.userInfo = {
            id: polizaId
          };
          $scope.uploadOk = false;
          var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-=" 
          $scope.uploader.queue.forEach(function(ch,index) {
            var str = ch.file.name; 
            var regex = /[^\w\s]/gi;        
            for(i = 0; i < specialChars.length;i++){ 
              if(str.indexOf(specialChars[i]) > -1){
                $scope.uploadOk = true;
                SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales, renombre y, vuelva a cargarlo. '+specialChars[i],'error') 
                $scope.uploader.queue.splice($scope.uploader.queue.indexOf(ch),1)
                return
              } else{
                 $scope.uploadOk = true;            
              }
            }
          })
          if ($scope.uploadOk) {   
            if (typeOT ==1) {
                $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + $scope.idPoliza + '/archivos/';
            }
            if(typeOT ==2){
                $scope.userInfo.url = $scope.uploader.url = url.IP + 'endosos/' + $scope.idPoliza + '/archivos/';                
            }
            $scope.files = [];
          }

          $timeout(function() {
            $scope.uploader.uploadAll();
          },1000);
        };
        $scope.noFiles = false;
        $scope.saveFiles = function(id) {
          $scope.id_recibo = $scope.idPoliza;
          $scope.userInfo.id = $scope.idPoliza;
          $scope.uploadOk = false;
          var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,/~`-=" 
          $scope.uploader.queue.forEach(function(ch,index) {
            var str = ch.file.name; 
            var regex = /[^\w\s]/gi;        
            for(i = 0; i < specialChars.length;i++){ 
              if(str.indexOf(specialChars[i]) > -1){ 
                $scope.uploadOk = true;
                SweetAlert.swal('Error','El nombre de archivo: '+str+', contiene carácteres especiales, renombre y, vuelva a cargarlo. '+specialChars[i],'error') 
                $scope.uploader.queue.splice($scope.uploader.queue.indexOf(ch),1)
                return
              } else{
                 $scope.uploadOk = true;            
              }
            }
          })
          if ($scope.uploadOk) {                 
            if (typeOT ==1) {
                $scope.userInfo.url = $scope.uploader.url = url.IP + 'polizas/' + $scope.idPoliza + '/archivos/';
            }
            if(typeOT ==2){
                $scope.userInfo.url = $scope.uploader.url = url.IP + 'endosos/' + $scope.idPoliza + '/archivos/';                
            }
            $scope.uploader.uploadAll();
          }
          if (typeOT ==1) {
            $http.get(url.IP + 'polizas/'+ $scope.idPoliza +'/archivos/').then(function(response) {
                if(response.status === 200) {
                  $scope.vm.files = response.data.results;
                  $scope.files = response.data.results;
                  $scope.files.forEach(function(file) {
                    file['to_send'] = false;
                  })
                  $scope.noFiles = true;
                }
            });
          }
          if (typeOT ==2) {
            $http.get(url.IP + 'endosos/'+ $scope.idPoliza +'/archivos/').then(function(response) {
                if(response.status === 200) {
                  $scope.vm.files = response.data.results;
                  $scope.files = response.data.results;
                  $scope.files.forEach(function(file) {
                    file['to_send'] = false;
                  })
                  $scope.noFiles = true;
                }
            });
          }
          
        };
        $scope.shareFileEmail = function(file) {
          if(file.to_send){
            file.to_send = false;
          }
          else{
            file.to_send = true;
          }
          share_via_email = [];
          $scope.files.forEach(function(filex) {
            if(filex.to_send){
              share_via_email.push(filex.id)
            }
          });

        }
        // ***********************+
        $scope.cancel = function() {
            if($uibModalInstance){
                $uibModalInstance.dismiss('cancel');
            }
        }

    }
})();
