(function () {
  angular.module('inspinia')
    .factory('pdfService', pdfService);

  pdfService.$inject = ['$q','$http','url', 'toaster', 'insuranceService', '$localStorage', '$sessionStorage' ]

  function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    if(dd < 10) {
      dd='0'+dd
    }
    if(mm < 10) {
      mm='0'+mm
    }
    today = dd+'/'+mm+'/'+yyyy;
    return today;
  }

  function formatDate(cadena){
    var year = cadena.getFullYear();
    var month = cadena.getMonth();
    var day = cadena.getDay();
    if(day < 10) {
      day='0'+day
    }
    if(month < 10) {
      month='0'+month
    }
    return day+"/"+month+"/"+year;
  }

  function formatDate2(cadena){
    var datePart = cadena.split("-");
    var year = datePart[0];
    var month = datePart[1];
    var day = datePart[2];

    return day+"/"+month+"/"+year;
  }

  function asMoney(n, currency) {
    return currency + " " + n.toFixed(2).replace(/./g, function(c, i, a) {
        return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    });
  }

  function getSizeImage(url) {
    var w; var h;
    var img=new Image();
    img.src=url;
    img.onload=function(){w=this.width; h=this.height;};
    return {w:w,h:h}
  }

  function loadImage(imgSrc, callback){
    var image = new Image();
    image.src = imgSrc;
    if (image.complete) {
      callback(image);
      image.onload=function(){};
    } else {
      image.onload = function() {
        callback(image);
        // clear onLoad, IE behaves erratically with animated gifs otherwise
        image.onload=function(){};
      }
      image.onerror = function() {
          alert("Could not load image.");
      }
    }
  }

  function getHeight(length, ratio) {
    var height = ((length)/(Math.sqrt((Math.pow(ratio, 2)+1))));
    return Math.round(height);
  }

  function getWidth(length, ratio) {
    var width = ((length)/(Math.sqrt((1)/(Math.pow(ratio, 2)+1))));
    return Math.round(width);
  }

  function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.send();
  }

  function pdfService($q, $http, url, toaster, insuranceService, $localStorage, $sessionStorage) {


    var service = {
      getPdf: getPdf,
      pageSize: 'LETTER',
      getPdfContent: getPdfContent,
      makePdf: makePdf
    }
    return service

    function getPdf(input){
      getOt(input)
        .catch(function(error){toaster.error(error);})
        .then(function(insuranceData){
          var wait = $q.defer();


          var defaultText = "______________________________________";
          var contratanteData = insuranceData.natural ? {
            nombre : insuranceData.natural.first_name + ' ' + insuranceData.natural.last_name,
            grupo : insuranceData.natural.group.group_name,
            type: 1,
            estado : defaultText,
            ciudad : insuranceData.ciudad,
            domicilio : defaultText,
            codigo_postal : defaultText,
            //contacto :  insuranceData.juridical.group.juridical_group.contact_juridical,
            forma_pago : defaultText,
            correo: defaultText,
            rfc: insuranceData.natural.rfc,
            telefono: defaultText,
            direcciones: insuranceData.natural.address_natural
          } : insuranceData.juridical ? {
            nombre : insuranceData.juridical.j_name,
            grupo : insuranceData.juridical.group.group_name,
            type: 2,
            estado : defaultText,
            ciudad : insuranceData.ciudad,
            domicilio : defaultText,
            codigo_postal : defaultText,
            correo: defaultText,
            rfc: insuranceData.juridical.rfc,
            telefono: defaultText,
            direcciones: insuranceData.juridical.address_juridical
          } : {
            nombre: '',
            grupo : '',
            type: 0,
            estado : defaultText,
            ciudad : defaultText,
            domicilio : defaultText,
            correo: defaultText,
            telefono: defaultText
          };

          var requests = [];
          //return;
          // EN ORDEN!!
          if(contratanteData.type === 1){// NATURAL
            if(insuranceData.natural.contact_natural){
              var contact = insuranceData.natural.contact_natural[0]; // PRIMER CONTACTO
              contratanteData.contacto = contact.name;
              contratanteData.correo = contact.email;
              contratanteData.telefono = contact.phone_number;
            }
          }else if(contratanteData.type === 2){ // JURIDICAL


            if(insuranceData.juridical.contact_juridical.length > 0){
              var contact = insuranceData.juridical.contact_juridical[0]; // PRIMER CONTACTO
              contratanteData.contacto = contact.name;
              contratanteData.correo = contact.email;
              contratanteData.telefono = contact.phone_number;
            }
          }
          address = insuranceData.address;
          contratanteData.ciudad = address.administrative_area_level_2;
          contratanteData.estado =  address.administrative_area_level_1;
          var existsIntNum =  address.street_number_int ? ' Int. '+ address.street_number_int : '';
          contratanteData.domicilio = address.route +' #'+ address.street_number + existsIntNum;
          contratanteData.codigo_postal = address.postal_code;

          var subformData =
            insuranceData.damages_policy.length > 0 ?     { code : 1, campos : insuranceData.damages_policy[insuranceData.damages_policy.length - 1] } :
            insuranceData.accidents_policy.length > 0 ?   { code : 2, campos : insuranceData.accidents_policy[insuranceData.accidents_policy.length - 1] }:
            insuranceData.life_policy.length > 0 ?        { code : 3, campos : insuranceData.life_policy[insuranceData.life_policy.length - 1]  }:
            insuranceData.automobiles_policy.length > 0 ? { code : 4, campos : insuranceData.automobiles_policy[insuranceData.automobiles_policy.length - 1] }:
            {code : 0, campos : []}

          // wait.promise.then(function(){
            var logo;

            var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
            var usr = JSON.parse(decryptedUser);

             $http({
                method: 'POST',
                url: 'https://test_cas.miurabox.info/us-login',
                // url: 'http://localhost:9000/us-login',
                // url: 'https://testcas.miurabox.com/us-login',
                headers: {
                  "Access-Control-Allow-Origin":"*",
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/x-www-form-urlencoded'
                },
                data: 'username=' + encodeURIComponent('') + '&password=' + encodeURIComponent('') + '&org=' + usr.org
              }).then(function (data) {
                 if(data.status==200){
                    if(data.data.orgname.length==0){

                      var url_aux= '../../assets/images/logos/saam_small.png';
                    }
                    else{
                      var url_aux= 'https://test_cas.miurabox.com/media/'+data.data.orgname;
                      // var url_aux= 'http://127.0.0.1:9000/media/'+data.data.orgname;
                      // var url_aux= 'https://testcas.miurabox.com/media/'+data.data.orgname;

                    }
                 }
                 else{
                  var url_aux= '../../assets/images/logos/saam_small.png';

                 }
                var rawrContent = {
                logo1: url_aux,
                //logo2: '../assets/logos/zyGpSw0lKOV1SoPe.png',
                logoMiura: '../../assets/images/logos/miurafaviconblack.png',
                contratante: contratanteData.nombre,
                domicilio: contratanteData.domicilio,
                codigo_postal: contratanteData.codigo_postal,
                estado: contratanteData.estado,
                ciudad: contratanteData.ciudad,
                contacto: contratanteData.contacto,
                correo: contratanteData.correo,
                telefono: contratanteData.telefono,
                rfc: contratanteData.rfc,
                grupo: contratanteData.grupo,
                //Movimiento
                vigenciaDe: new Date(insuranceData.start_of_validity),
                vigenciaA: new Date(insuranceData.end_of_validity),
                ramo: insuranceData.ramo.ramo_name,
                subramo: insuranceData.subramo.subramo_name,
                aseguradora: insuranceData.aseguradora.compania,
                folio_interno: insuranceData.internal_number,
                forma: subformData,
                forma_pago: insuranceData.forma_de_pago,
                plan_paquete: insuranceData.paquete,
                creadaEl: insuranceData.created_at,
                contactoAseg: insuranceData.aseguradora.contact_provider[0] ? insuranceData.aseguradora.contact_provider[0] : '',
                clave: insuranceData.clave,
                coberturas: insuranceData.coverageInPolicy_policy,
                asegurado: '--Aqui el nombre del asegurado--',
                observaciones: insuranceData.observations
              };

              makePdf(rawrContent,{insuranceData: insuranceData, open : input.open});
              });




          // });
        });
    } //content

    function getOt(object){
      var dfd = $q.defer();

      if(!isNaN(object)) {
        $http.get(url.IP + 'leer-polizas/' + object + '/')
          .catch(function(error){dfd.reject(error);})
          .then(function(responseData){
            insuranceService.getInsuranceData(responseData.data)
              .catch(function(error){dfd.reject(error);})
              .then(function(insuranceData){
                dfd.resolve(insuranceData);
              });
          });
      }else{

        if(object.insuranceData){
          dfd.resolve(object.insuranceData);
        }else{
          insuranceService.getInsuranceData(object)
            .catch(function(error){dfd.reject(error);})
            .then(function(insuranceData){
              dfd.resolve(insuranceData);
            });
        }
      }
      return dfd.promise;
    }

    function makePdf(raw, input) {
      getPdfContent(raw)
        .then(function (content) {
          if(input.open){
            try{
              pdfMake.createPdf(content).open();
            }catch(e){
              pdfMake.createPdf(content).download(input.insuranceData.internal_number + '.pdf');
            }
          }else{
            pdfMake.createPdf(content).download(input.insuranceData.internal_number + '.pdf');
          }
        }).catch(function (error) {
        });
    }

    function getPdfContent(raw) {
      var dfd = $q.defer(); // promesa
      var imgsPromises = []; // lista de promesas de imagenes a cargar
      var labelwidth = 140;
      var styles = {
        info: {
          fontSize: 10
        },
        header: {
          fontSize: 16.5,
          bold: true,
          alignment: 'center'
        },
        subheader: {
          fontSize: 11.5,
          bold: true,
          alignment: 'center'
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black'
        },
        quote: {
          italics: true
        },
        small: {
          fontSize: 8
        },
        footer: {
          italics: true,
          fontSize: 8,
          color: 'gray'
        },
        address: {
          fontSize: 6
        },
        summaryStyle: {
          fontSize: 10,
          alignment: 'justify',
          margin: [10, 10, 0, 10],
        },
        label: {
          fontSize: 10,
          bold: true,
          width: 100
        },
        th: {
          bold: true,
          fontSize: 10,
          color: 'black',
          //width: "*"
        },
        td: {
          fontSize: 10
        },
      }

      function showPhoneNumber(recibe) {
        var afterPlus = recibe.substr(1, 1);
        var dial, phone, ext, quit;
        if (afterPlus == 1) {
          dial = recibe.substr(0, 2);
          phone = recibe.substr(2, 10);
          quit = recibe.length - 12;
          ext = recibe.substr(-quit);
        } else {
          dial = recibe.substr(0, 3);
          phone = recibe.substr(3, 10);
          quit = recibe.length - 13;
          ext = recibe.substr(-quit);
        }
        return dial + " " + phone + " ext. " + ext;
      }

      var finalWidth, finalHeight;
      function alertImageSize(image) {
        if(image.width > image.height) {
          var maxWidth = 100, maxHeight = 39;
          if (image.width > maxWidth) {
                //ratio = maxWidth / image.width;
                ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
                finalWidth = image.width * ratio;
                //finalHeight =  image.height * ratio / 2 - 10;
                finalHeight =  finalHeight * ratio;
          }
        }
        if (image.width < image.height) {
          var maxWidth = 100, maxHeight = 39;
          if (image.height > maxHeight) {
              ratio = maxHeight / image.height;
              finalHeight = maxHeight;
              finalWidth = image.width * ratio;
          }
        }
        if (image.width == image.height) {
          finalHeight = 39;
          finalWidth = 39;
        }
      }
      loadImage(raw.logo1, alertImageSize);

      var imgObj, imgLogo, aux, upColumns;
      if (raw.logo1) {
          imgsPromises.push(getBase64FromImageUrl(raw.logo1, 'logo1'));
      }
      if (raw.logo2) {
          imgsPromises.push(getBase64FromImageUrl(raw.logo2, 'logo2'));
      }
      if (raw.logoMiura) {
          imgsPromises.push(getBase64FromImageUrl(raw.logoMiura, 'logoMiura'));
      }
      if (imgsPromises.length > 0) {
        $q.all(imgsPromises).then(function (data) {
          data.forEach(function (response) {
            if (response.id == 'logoMiura') {
              aux = response.data;
            }
            if (response.id == 'logo1') {
                imgObj = {
                  image: response.data,
                  height: finalHeight, width: finalWidth, //maxHeight: 60, maxWidth: 80,
                  alignment: 'center'
                };
                upColumns = {
                    columnGap: 15,
                    columns: [
                      imgObj,
                      {
                            text: [
                              { text: usr.orgname, style: 'header' },
                              { text: '\nSolicitud de Póliza - ' + raw.subramo + '\n', fontSize: 14.5, alignment: 'center' }
                            ]
                      }
                    ]
                };
                content.splice(0, 0, upColumns);
            }
          });
        });
      }

      var content = [
        {
            text: [
              { text: '\nCOMPAÑÍA', style: 'subheader' }
            ]
        },
        {
            text: [
              { text: raw.aseguradora, alignment: 'center' }
            ]
        },
        {
              table: {
                widths: ['7.5%', '46%', '5%', '41.5%'],
                body: [
                  [{ text: ' ', fontSize:6 },{ text: ' ', fontSize:6 },{ text: ' ', fontSize:6 },{ text: ' ', fontSize:6 }],
                  //[{ text: '' },{ text: '' },{ text: '' },{ text: '' }],
                  [{ text: 'Ejecutivo:', style: 'tableHeader' }, { text: raw.contactoAseg.name ? raw.contactoAseg.name : 'Aún no se ha asignado', style: 'info' }, { text: 'Clave:', style: 'tableHeader' }, { text: raw.clave ? raw.clave.clave : '', style: 'info' }],
                  [{ text: 'Teléfono:', style: 'tableHeader' }, { text: raw.contactoAseg.phone_number ? showPhoneNumber(raw.contactoAseg.phone_number) : 'Aún no se ha asignado', style: 'info' }, { text: 'Correo:', style: 'tableHeader' }, { text: raw.contactoAseg.email ? raw.contactoAseg.email : 'Aún no se ha asignado', style: 'info' }],
                ]
              },
              layout: 'lightHorizontalLines'
        },
        {
            text: [
                  { text: '\nDATOS DEL CONTRATANTE\n', style: 'subheader' }
            ]
        },
        {
              table: {
                widths: ['10.5%', '51%', '8.5%', '30%'],
                body: [
                  [{ text: ' ', fontSize:1.5 },{ text: ' ', fontSize:1.5 },{ text: ' ', fontSize:1.5 },{ text: ' ', fontSize:1.5 }],
                  [{ text: 'Contratante:', style: 'tableHeader' }, { text: [raw.contratante ? raw.contratante : ''], style: 'info' }, { text: 'RFC:', style: 'tableHeader', alignment: 'right' }, { text: raw.rfc, style: 'info' }],
                  [{ text: 'Domicilio:', style: 'tableHeader' }, { text: [raw.domicilio ? raw.domicilio : ''], style: 'info' }, { text: 'C.P.:', style: 'tableHeader', alignment: 'right' }, { text: [raw.codigo_postal ? raw.codigo_postal : ''], style: 'info' }],
                  [{ text: 'Estado:', style: 'tableHeader' }, { text: [raw.estado ? raw.estado : ''], style: 'info' }, { text: 'Municipio:', style: 'tableHeader', alignment: 'right' }, { text: [raw.ciudad ? raw.ciudad : ''], style: 'info' } ]
                ]
              },
              layout: 'lightHorizontalLines'
        },
        {
            text: '\nDATOS DE LA PÓLIZA\n',
            style: 'subheader'
        },
        {
              table: {
                widths: ['15.2%', '43%', '11.5%', '30.3%'],
                body: [
                  [{ text: ' ', fontSize:1.5 },{ text: ' ', fontSize:1.5 },{ text: ' ', fontSize:1.5 },{ text: ' ', fontSize:1.5 }],
                  [{ text: 'Plan/Paquete:', style: 'tableHeader' }, { text: [raw.plan_paquete.package_name], style: 'info' }, { text: 'F. Creación:', style: 'tableHeader' }, { text: formatDate2(raw.creadaEl.split('T')[0]), style: 'info' }],
                  [{ text: 'Forma de Pago:', style: 'tableHeader' }, { text: raw.forma_pago.value == 1 ? 'Mensual'   :
                                                                            raw.forma_pago.value == 2 ? 'Bimestral' :
                                                                            raw.forma_pago.value == 3 ? 'Trimestral':
                                                                            raw.forma_pago.value == 6 ? 'Semestral' :
                                                                            raw.forma_pago.value == 12 ? 'Anual'    : 'No pago', style: 'info' }, { text: 'Vigencia:', style: 'tableHeader' }, { text: formatDate(raw.vigenciaDe) + ' - ' + formatDate(raw.vigenciaA), style: 'info' }],
                ]
              },
              layout: 'lightHorizontalLines'
        }
      ];

      // coberturas
      var coveragesTable
      if (raw.forma.code == 1 ) {
        coveragesTable = {
            table: {
              widths: ['51%', '17%', '16%', '16%'],
              headerRows: 1,
              body: [      // TODO agregar coaseguro dependiendo del codigo
                  [
                    [{ text : 'Cobertura'         , style: 'th'}],
                    [{ text : 'Suma Asegurada'    , style: 'th'}],
                    [{ text : 'Deducible'         , style: 'th'}],
                    [{ text : 'Coaseguro'         , style: 'th'}],
                    // [{ text : 'Prima'             , style: 'th'}],
                  ]
              ]
            },
            layout: {
                      hLineWidth: function(i, node) {
                          return (i === 0 || i === node.table.body.length) ? 0.5 : 0.5;
                      },
                      vLineWidth: function(i, node) {
                          return (i === 0 || i === node.table.widths.length) ? 0.5 : 0.5;
                      },
                      hLineColor: function(i, node) {
                          return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
                      },
                      vLineColor: function(i, node) {
                          return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
                      },
                }
        }
      } else if(raw.forma.code == 2) {
        coveragesTable = {
            table: {
                widths: ['40%', '20%', '20%','20%'],
                headerRows: 1,
                body: [
                 [
                   [{ text : 'Cobertura'         , style: 'th'}],
                   [{ text : 'Suma Asegurada'    , style: 'th'}],
                   [{ text : 'Deducible'         , style: 'th'}],
                   [{ text : 'Coaseguro'         , style: 'th'}],
                  //  [{ text : 'Prima'             , style: 'th'}],
                 ]
              ]
            },
            layout: {
                      hLineWidth: function(i, node) {
                          return (i === 0 || i === node.table.body.length) ? 0.5 : 0.5;
                      },
                      vLineWidth: function(i, node) {
                          return (i === 0 || i === node.table.widths.length) ? 0.5 : 0.5;
                      },
                      hLineColor: function(i, node) {
                          return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
                      },
                      vLineColor: function(i, node) {
                          return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
                      },
                }
         }
      }
      else {
        coveragesTable = {
            table: {
                widths: ['60%', '20%', '20%'],
                headerRows: 1,
                body: [
                 [
                   [{ text : 'Cobertura'         , style: 'th'}],
                   [{ text : 'Suma Asegurada'    , style: 'th'}],
                   [{ text : 'Deducible'         , style: 'th'}],
                   // [{ text : 'Coaseguro'         , style: 'th'}],
                  //  [{ text : 'Prima'             , style: 'th'}],
                 ]
              ]
            },
            layout: {
                      hLineWidth: function(i, node) {
                          return (i === 0 || i === node.table.body.length) ? 0.5 : 0.5;
                      },
                      vLineWidth: function(i, node) {
                          return (i === 0 || i === node.table.widths.length) ? 0.5 : 0.5;
                      },
                      hLineColor: function(i, node) {
                          return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
                      },
                      vLineColor: function(i, node) {
                          return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
                      },
                }
         }
      }

      raw.coberturas.forEach(function(cobertura){// coaseguro
        if(raw.forma.code == 1) {
          coveragesTable.table.body.push(
            [
              { text : cobertura.coverage_name        , style: 'td' },
              { text : cobertura.sum_insured.length!=0 ? !isNaN(cobertura.sum_insured) ? asMoney(parseFloat(cobertura.sum_insured), "$") : cobertura.sum_insureda : '', style: 'td', alignment: 'right'},
              { text : cobertura.deductible.length!=0 ? !isNaN(cobertura.deductible) ? asMoney(parseFloat(cobertura.deductible), "$") : cobertura.deductible : '', style: 'td', alignment: 'right'},
              // { text : cobertura.coinsurance.length!=0 ? !isNaN(cobertura.coinsurance) ? asMoney(parseFloat(cobertura.coinsurance), "$") : cobertura.coinsurance : '', style: 'td', alignment: 'right'},
              // { text : cobertura.prima.length!=0 ? !isNaN(cobertura.prima) ? asMoney(parseFloat(cobertura.prima), "$") : cobertura.prima : '', style: 'td', alignment: 'right'},
            ]
          );
        }else if(raw.forma.code == 2) {
          coveragesTable.table.body.push(
            [
              { text : cobertura.coverage_name        , style: 'td' },
              { text : cobertura.sum_insured.length!=0 ? !isNaN(cobertura.sum_insured) ? asMoney(parseFloat(cobertura.sum_insured), "$") : cobertura.sum_insureda : '', style: 'td', alignment: 'right'},
              { text : cobertura.deductible.length!=0 ? !isNaN(cobertura.deductible) ? asMoney(parseFloat(cobertura.deductible), "$") : cobertura.deductible : '', style: 'td', alignment: 'right'},
              { text : cobertura.coinsurance.length!=0 ? !isNaN(cobertura.coinsurance) ? asMoney(parseFloat(cobertura.coinsurance), "$") : cobertura.coinsurance : '', style: 'td', alignment: 'right'},
              // { text : cobertura.prima.length!=0 ? !isNaN(cobertura.prima) ? asMoney(parseFloat(cobertura.prima), "$") : cobertura.prima : '', style: 'td', alignment: 'right'},
            ]
          );
        }
        else {
          coveragesTable.table.body.push(
            [
              { text : cobertura.coverage_name        , style: 'td' },
              { text : cobertura.sum_insured.length!=0 ? !isNaN(cobertura.sum_insured) ? asMoney(parseFloat(cobertura.sum_insured), "$") : cobertura.sum_insured : '', style: 'td', alignment: 'right' },
              { text : cobertura.deductible.length!=0 ? !isNaN(cobertura.deductible) ? asMoney(parseFloat(cobertura.deductible), "$") : cobertura.deductible : '', style: 'td', alignment: 'right'},
              // { text : cobertura.coinsurance.length!=0 ? !isNaN(cobertura.coinsurance) ? asMoney(parseFloat(cobertura.coinsurance), "$") : cobertura.coinsurance : '', style: 'td', alignment: 'right'},
              // { text : cobertura.prima.length!=0 ? !isNaN(cobertura.prima) ? asMoney(parseFloat(cobertura.prima), "$") : cobertura.prima : '', style: 'td', alignment: 'right'},
            ]
          );
        }
      });

      //TODO parseo de formas
      // 1 danios, 2 accidentes, 3 vida, 4 automoviles. 5 salud
      var forma = [{text: 'No existe una forma valida'}];
      if(raw.forma.code == 1){ // damages
        forma = [
          {
              table: {
                widths: ['15.7%', '84.3%', '0%', '0%' ],
                headerRows: 1,
                body: [
                  //[{ text: ' ' },{ text: ' ' },{ text: ' ' },{ text: ' ' }],
                  [{ text: '' },{ text: '' },{ text: '' },{ text: '' }],
                  [{ text: 'Bien asegurado:', style: 'tableHeader' }, { text: [raw.forma.campos.insured_item], style: 'info', colSpan:3 }, {}, {}],
                  [{ text: 'Detalles:', style: 'tableHeader' }, { text: [raw.forma.campos.item_details], style: 'info' ,colSpan:3 }, {}, {}],
                  [{ text: 'Dirección:', style: 'tableHeader' }, { text: [raw.forma.campos.item_address], style: 'info' ,colSpan:3 }, {}, {}]
                ]
              },
              layout: 'lightHorizontalLines'
          }
        ];
      }else if(raw.forma.code == 2){ // accidents and health
        var tablaBeneficiarios = {
          table: {
            widths: ['25%', '21%', '20.5%', '11.5%', '12%', '10%'],
            body: [
              [
                [{ text : 'Nombre'             , style: 'th'}],
                [{ text : 'Ap. Paterno'          , style: 'th'}],
                [{ text : 'Ap. Materno'          , style: 'th'}],
                [{ text : 'F. de Nac.'         , style: 'th'}],
                [{ text : 'Relación'           , style: 'th'}],
                [{ text : 'Sexo'               , style: 'th'}],
              ]
            ]
          },
          layout: {
                    hLineWidth: function(i, node) {
                        return (i === 0 || i === node.table.body.length) ? 0.5 : 0.5;
                    },
                    vLineWidth: function(i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 0.5 : 0.5;
                    },
                    hLineColor: function(i, node) {
                        return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
                    },
                    vLineColor: function(i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
                    },
              }
        }

        tablaBeneficiarios.table.body.push([
          [{ text : raw.forma.campos.personal.first_name                                            , style: 'td'}],
          [{ text : raw.forma.campos.personal.last_name                                             , style: 'td'}],
          [{ text : raw.forma.campos.personal.second_last_name                                      , style: 'td'}],
          [{ text : raw.forma.campos.personal.birthdate ? formatDate2(raw.forma.campos.personal.birthdate.split('T')[0]) : 'Ivalid date'                                        , style: 'td'}],
          [{ text : 'Titular'                                                                       , style: 'td'}],
          [{ text : raw.forma.campos.personal.sex == 'M' ? 'Masculino' : raw.forma.campos.personal.sex == 'F' ? 'Femenino' : 'No proporcionado' , style: 'td'}],
        ])

        raw.forma.campos.relationship_accident.forEach(function(ben){
          tablaBeneficiarios.table.body.push([
            [{ text : ben.first_name                                                                  , style: 'td'}],
            [{ text : ben.last_name                                                                   , style: 'td'}],
            [{ text : ben.second_last_name                                                            , style: 'td'}],
            [{ text : formatDate2(ben.birthdate.split('T')[0])                                        , style: 'td'}],
            [{ text : ben.relationship == 1 ? 'Titular'  :
                     ben.relationship == 2 ? 'Cónyuge' :
                     ben.relationship == 3 ? 'Hijo'     : ''                                          , style: 'td'}],
            [{ text : ben.sex == 'M' ? 'Masculino' : ben.sex == 'F' ? 'Femenino' : 'No proporcionado' , style: 'td'}],
          ])
        });

        forma = [];

        //if(raw.forma.campos.relationship_accident.length > 0){
          forma.push('\n');
          forma.push( { text: 'Asegurados', bold: true, fontSize: 11 });
          forma.push(tablaBeneficiarios);
        //}

      }else if(raw.forma.code == 3){// life
        var tablaBeneficiarios = {
          table: {
            widths: ['20%', '20%', '20%', '14%', '11%', '10%', '5%'],
            body: [
              [
                [{ text : 'Nombre'             , style: 'th'}],
                [{ text : 'Ap. Paterno'          , style: 'th'}],
                [{ text : 'Ap. Materno'          , style: 'th'}],
                [{ text : 'F. de Nac.'         , style: 'th'}],
                [{ text : 'Relación'           , style: 'th'}],
                [{ text : 'Sexo'               , style: 'th'}],
                [{ text : '%'                  , style: 'th'}],
              ]
            ]
          },
          layout: {
                    hLineWidth: function(i, node) {
                        return (i === 0 || i === node.table.body.length) ? 0.5 : 0.5;
                    },
                    vLineWidth: function(i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 0.5 : 0.5;
                    },
                    hLineColor: function(i, node) {
                        return (i === 0 || i === node.table.body.length) ? 'black' : 'black';
                    },
                    vLineColor: function(i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 'black' : 'black';
                    },
              }
        }

        raw.forma.campos.beneficiaries_life.forEach(function(ben) {
          tablaBeneficiarios.table.body.push([
            [{ text : ben.first_name                                                                  , style: 'td'}],
            [{ text : ben.last_name                                                                   , style: 'td'}],
            [{ text : ben.second_last_name                                                            , style: 'td'}],
            [{ text : formatDate2(ben.birthdate.split('T')[0])                                        , style: 'td'}],
            [{ text : ben.optional_relationship                                                       , style: 'td'}],
            [{ text : ben.sex == 'M' ? 'Masculino' : ben.sex == 'F' ? 'Femenino' : 'No proporcionado' , style: 'td'}],
            [{ text : ben.percentage + ''                                                             , style: 'td'}]
          ])
        });

        forma = [
          {
              table: {
                //widths: ['50%', '50%'],
                widths: ['13%', '34%', '13%', '20%', '13%', '7%' ],
                body: [
                  [{ text: '' },{ text: '' },{ text: '' },{ text: '' },{ text: '' },{ text: '' }],
                  [{ text: 'Asegurado:', style: 'tableHeader' }, { text: [raw.forma.campos.personal.first_name, ' ', raw.forma.campos.personal.last_name, ' ', raw.forma.campos.personal.second_last_name], style: 'info', colSpan: 5 }, {},{},{},{}],
                  [{ text: 'Sexo:', style: 'tableHeader' }, { text: [raw.forma.campos.personal.sex == 'M' ? 'Masculino' : 'Femenino'], style: 'info' },
                   { text: 'F. de Nac.:', style: 'tableHeader' }, { text: formatDate2(raw.forma.campos.personal.birthdate.split('T')[0]), style: 'info' },
                   { text: 'Fumador:', style: 'tableHeader' }, { text: [raw.forma.campos.smoker ? 'Si' : 'No'], style: 'info'} ]
                ]
              },
              layout: 'lightHorizontalLines'
          }
        ];

        if(raw.forma.campos.beneficiaries_life.length > 0){
          forma.push( '\n');
          forma.push( { text: 'Asegurados ' , bold: true, fontSize: 11 });
          forma.push(tablaBeneficiarios);
        }

      } else if(raw.forma.code == 4) { // autos
        forma = [
          {
            table: {
              headerRows: 1,
              widths: ['10%', '24%', '10%', '23%', '10%', '23%'],
              body: [
                [{ text: '' },{ text: '' },{ text: '' },{ text: '' },{ text: '' },{ text: '' }],
                [{ text: 'Marca:', style: 'tableHeader' }, { text: [raw.forma.campos.brand ? raw.forma.campos.brand :  ''], style:  'info'},
                 { text: 'Modelo:', style: 'tableHeader' }, { text: [raw.forma.campos.model ? raw.forma.campos.model : ''], style:  'info'},
                 { text: 'Año:', style: 'tableHeader' } , { text: [raw.forma.campos.year ? raw.forma.campos.year.toString() : ''], style:  'info'}],

                [{ text: 'Version:', style: 'tableHeader' }, { text: [raw.forma.campos.version ? raw.forma.campos.version : ''], style:  'info'},
                 { text: 'Serie:', style: 'tableHeader' }, { text: [raw.forma.campos.serial ? raw.forma.campos.serial : ''], style:  'info'},
                 { text: 'Motor:', style: 'tableHeader' }, { text: [raw.forma.campos.engine ? raw.forma.campos.engine : ''], style:  'info'}],

                [{ text: 'Color:', style: 'tableHeader' } , { text: [raw.forma.campos.color ? raw.forma.campos.color : ''], style:  'info'},
                 { text: 'Placas:', style: 'tableHeader' } , { text: [raw.forma.campos.license_plates ? raw.forma.campos.license_plates : ''], style: 'info', colSpan:3 }, {}, {} ],
              ]
            },
            layout: 'lightHorizontalLines'
          }
        ];
        // forma = [
        //   { text: 'Marca: ' },
        // ];
      } else if (raw.forma.code == 5) {  //salud
        var tablaBeneficiarios = {
          style: 'table',
          table: {
            body: [
              [
                { text : 'Nombre'             , style: 'th'},
                { text : 'Apellidos'          , style: 'th'},
                { text : 'F. de Nac.'         , style: 'th'},
                { text : 'Relación'           , style: 'th'},
                { text : 'Sexo'               , style: 'th'},
                { text : '%'                  , style: 'th'},
              ]
            ]
          }
        }

        raw.forma.campos.beneficiaries_life.forEach(function(ben){
          tablaBeneficiarios.table.body.push([
            { text : ben.first_name                                                                  , style: 'td'},
            { text : ben.last_name + ' ' + ben.second_last_name                                      , style: 'td'},
            { text : formatDate2(ben.birthdate.split('T')[0])                                        , style: 'td'},
            { text : ben.optional_relationship                                                       , style: 'td'},
            { text : ben.sex == 'M' ? 'Masculino' : ben.sex == 'F' ? 'Femenino' : 'No proporcionado' , style: 'td'},
            { text : ben.percentage + ''                                                             , style: 'td'}
          ])
        });

        forma = [
          {
            columns: [
              { width: '*', text: '' },
              {
                  width: 'auto',
                  table: {
                    body: [
                      //[{ text: ' ' },{ text: ' ' },{ text: ' ' },{ text: ' ' }],
                      [{ text: '' },{ text: '' },{ text: '' },{ text: '' }],
                      [{ text: 'Titular:', style: 'tableHeader' }, { text: [raw.forma.campos.personal.first_name, ' ', raw.forma.campos.personal.last_name, ' ', raw.forma.campos.personal.second_last_name], style: 'info' ,colSpan:3 }, {}, {}],
                      [{ text: 'F. de Nac.:', style: 'tableHeader' }, { text: formatDate2(raw.forma.campos.personal.birthdate.split('T')[0]), style: 'info', colSpan:3 }, {}, {}]
                      [{ text: 'Sexo:', style: 'tableHeader' }, { text: [raw.forma.campos.personal.sex == 'M' ? 'Masculino' : 'Femenino'], style: 'info', colSpan:3 }, {}, {}]
                    ]
                  },
                  layout: 'lightHorizontalLines'
              },
              { width: '*', text: '' },
            ]
          }
        ];
        if(raw.forma.campos.beneficiaries_life.length > 0) {
          forma.push( '\n');
          forma.push( { text: 'Asegurados ' , bold: true, fontSize: 11 });
          forma.push(tablaBeneficiarios);
        }
      } // <- end formas

      var columns = {
        columns : [forma,coveragesTable],
        width: "auto"
      };

      var obs = {
          text: [
                { text: '\nNotas u Observaciones', italics: 'true', style: 'info' }
          ]
      };

      var obsRect = {
        headerRows: 1,
        widths: [80, 120, 120, 25, 25, 35, 40],
        table: {
          widths: ['100%'],
          headerRows: 1,
          body: [
            [
              { text: [raw.observaciones ? raw.observaciones : 'Sin observaciones'], style: 'info' }
            ]
          ]
        },
        layout: {
                  hLineWidth: function(i, node) {
                      return (i === 0 || i === node.table.body.length) ? 0.5 : 0.5;
                  },
                  vLineWidth: function(i, node) {
                      return (i === 0 || i === node.table.widths.length) ? 0.5 : 0.5;
                  },
                  hLineColor: function(i, node) {
                      return (i === 0 || i === node.table.body.length) ? 'gray' : 'gray';
                  },
                  vLineColor: function(i, node) {
                      return (i === 0 || i === node.table.widths.length) ? 'gray' : 'gray';
                  },
            }
      };

      var jumpPage = {
        text: '', pageBreak: 'before'
      };
      var decryptedUser = sjcl.decrypt("User", $sessionStorage.user);
      var usr = JSON.parse(decryptedUser);
      var atteTable = {
        columns: [
          { width: '*', text: '' },
          {
              width: 'auto',
              table: {
                headerRows: 1,
                body: [
                  [{ text: '' }],
                  [{ text: '\n\nAtentamente,', style: 'th', alignment: 'center' }],
                  [{ text: '' }],[{ text: '' }],
                  [{ text: usr.nameFull + '\nEJECUTIVO', style: 'info', alignment: 'center' }],
                  // [{ text: 'EJECUTIVO', style: 'th', alignment: 'center'}]
                ]
              },
              layout: 'noBorders'
          },
          { width: '*', text: '' },
        ]
      };

      var pageBreakBefore = function(currentNode, followingNodesOnPage, nodesOnNextPage, previousNodesOnPage) {
        return currentNode.id === 'mediaRow' && currentNode.pageNumbers.length > 1;
      };

      var atte = {
        text: [
          { text: '\n\n\nAtentamente,\n', style: 'th', alignment: 'center' },
          { text: '\n' + usr.nameFull, style: 'info', alignment: 'center' },
          { text: '\nEJECUTIVO', style: 'th', alignment: 'center' }
        ]
      };

      content.push(forma);
      forma.push( { text: '\nCoberturas', bold: true, fontSize: 11 });
      content.push(coveragesTable);
      content.push(obs);
      content.push(obsRect);
      // content.push(jumpPage);
      content.push(atteTable);


      var footer = function(page, pages) {
          var today = new Date();
          return {
            columns: [
              {
                text: [
                    { text: getDate(), style: 'footer', alignment: 'left' },
                    //{ text: '\nCLEMENCIA BORJA TABOADA 528 LOCAL 20, COL. PROVINCIA JURIQUILLA, QUERETARO, QRO.', style: 'address' }
                ],
              },
              {
                text: [
                    { text: 'Página: ', style: 'footer'},
                    { text: page.toString(), style: 'footer' },
                    { text: ' de ', style: 'footer'},
                    { text: pages.toString(), style: 'footer' },
                    { text: '\n' + usr.orgLocation, style: 'address', alignment: 'center' }
                ],
                alignment: 'center'
              },
              {
                columns: [
                  {
                    text: [
                        { text: 'Creado por Miurabox', style: 'footer', alignment: 'right' }
                    ]
                  },
                  {
                    image: aux,
                    width: 12, height: 12,
                    margin: [3, 0]
                  }
                ]
              }
            ],
            margin: [15, 0],
          };
      };

      content.push();

      // detectamos el logo 1
      if (raw.logo1) {
        imgsPromises.push(getBase64FromImageUrl(raw.logo1, 'logo1'));
      }

      // detectamos el logo 2
      if (raw.logo2) {
        imgsPromises.push(getBase64FromImageUrl(raw.logo2, 'logo2'));
      }

      // esperamos a que todas las promesas se resuelvan
      if (imgsPromises.length > 0) {
        $q.all(imgsPromises).then(function (data) {// on SUCCESS all
          data.forEach(function (response) {
            var imgObj = null;
            if (response.id == 'logo1') {
                imgObj = {
                  image: response.data
                  //height: 60,
                  //width: 80,
                  //alignment: 'left'
                };
                //content.splice(0, 0, imgObj);
            }
          });

          var obj = {
            styles: styles,
            content: content,
            footer: footer
          }

          dfd.resolve(obj);
        }, function (error) { // on error
          dfd.reject(error);
        });
      } else {
        var obj = {
          styles: styles,
          content: content,
          footer: footer
        }

        dfd.resolve(obj);
      }

      return dfd.promise;
    }

    function getBase64FromImageUrl(url, id) {
      var dfd = $q.defer()
      var img = new Image();

      img.setAttribute('crossOrigin', 'anonymous');

      img.onerror = function () {
        dfd.reject('Error loading image from url: ' + url);
      }

      img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);

        var response = {
          id: id,
          data: canvas.toDataURL("image/png")
        }

        dfd.resolve(response)
      };

      img.src = url;

      return dfd.promise;
    }
  }
})();
