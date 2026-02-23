(function(){
    'use strict';

    var app = angular.module('inspinia');
    app.constant('MESSAGES', {
      OK: {
          SAVECONCEPTOSGRALES: 'Se ha guardado la Configuración de Conceptos Generales',
          SAVETICKET: 'Se ha guardado la tarea',
          CERTIFICATESDONE: 'Se han cargado los certificados',
          UPDATEENDORSEMENT: 'Se ha actualizado el endoso',
          EMAILSENDED: 'Se ha enviado el email correspondiente',
          SAVEDEMAIL: 'Se ha guardado el email',
          SAVEDCONFIG: 'Se ha guardado la configuración',
          UPLOADFILES: 'Archivos cargados',
          UPLOADFILEONE: 'Archivo cargado',
          NEWCOMPANY: 'Nueva aseguradora guardada',
          NEWFASTENER: 'Nueva afianzadora guardada',
          NEWFIANZAOK: 'Nueva Fianza guardada',
          NEWCONTRACTOR: 'Nuevo contratante guardado',
          NEWGROUP: 'Nuevo grupo guardado',
          NEWOT: 'Nueva orden de trabajo guardada',
          UPGRADEOT: 'Orden de trabajo actualizada',
          NEWPOLICY: 'La póliza y los recibos han sido creados',
          UPGRADEPOLICY: 'Póliza actualizada',
          NEWPACKAGE: 'Paquete guardado',
          NEWBRANCH: 'Ramo creado',
          NEWSUBBRANCH: 'Subramo creado',
          NEWENDORSEMENT: 'Endoso creado',
          RENEWALPOLICY: 'Póliza renovada',
          RENEWALFIANZA: 'Fianza renovada',
          NEWRAMO: 'Nuevo ramo guardado',
          NEWSUBRAMO: 'Nuevo subramo guardado',
          APPLIEDENDORSEMENT: 'Endoso aplicado',
          UPDATEDSTATUS: 'Estatus actualizado',
          PAIDRECEIPT: 'Recibo pagado',
          EDITREGISTRY: 'Registro modificado',
          CANCELENDORSEMENT: 'Endoso cancelado',
          CANCELPOLICY: 'Póliza y recibos cancelados',
          CANCELRECEIPTS: 'Recibo y subsecuentes cancelados',
          DELETEENDORSEMENT: 'Endoso eliminado',
          DELETEGROUP: 'Grupo eliminado',
          DELETEPACKAGE: 'Paquete eliminado',
          DELETEPOLICY: 'Póliza eliminada',
          DELETEFILE: 'Archivos eliminados',
          DELETECONTRACTOR: 'Contacto eliminado',
          DELETEADDRESS: 'Dirección eliminada',
          CORRECTCHANGE: 'Se ha guardado correctamente el cambio',
          DELETERAMO: 'Se ha eliminado el ramo',
          DELETESUBRAMO: 'Se ha eliminado el subramo',
          DELETEOT: 'OT eliminada',
          UPDATECONTRACTOR: 'Contratante editado correctamente.',
          UPDATERECEIPT: 'Se han aplicado los cambios a tu recibo',
          SINIESTERUPDATED: 'Siniestro actualizado',
          DELETECERT: 'El certificado ha sido eliminado satisfactoriamente.',
          DELETECONTRATANTE: 'El contratante ha sido eliminado.',
          RECEIPTCONCILIAR: 'El recibo se ha conciliado, folio de conciliación: ',
          POLICYCANCELED: 'La póliza ha sido cancelada',
          POLICYREACTIVED: 'La póliza ha sido Reactivada',
          CANCELEDCANCEL: 'El estatus de la póliza es precancelado',
          CREATESELLER: 'El vendedor se creó correctamente',
          UPDATESELLER: 'El vendedor se actualizó correctamente',
          OKPRINTRECEIPT: 'Estado de cuenta creado correctamente',
          POLICYSEND: 'La póliza ha sido enviada',
          ENDOSOSEND: 'El endoso ha sido compartido',
          FILESHARED: 'Se compartieron archivos',
          FILENOSHARED: 'Se dejaron de compartir archivos',
          POLICYSHARED: 'La póliza ha sido compartida',
          DELETECOLLECTIVITY: 'La colectividad se ha eliminado',
          SENDPROVIDER: 'El email ha sido enviado a la compañia',
          SENDEMAIL: 'El correo electrónico ha sido enviado',
          DELETEENDOSO: 'El endoso ha sido eliminado',
          DELETEEVENT: 'El evento ha sido eliminado correctamente',
          UPDATEEVENT: 'El evento ha sido actualizado correctamente',
          REGISTERENDOSO: 'El endoso ha sido registrado',
          BONODELETED: 'El bono ha sido eliminado',
          QUOTATIONCREATE: 'La cotización ha sido creada.',
          SUCURSALCREATE : 'La sucursal ha sido creada.',
          QUOTATIONCHANGE: 'Se han guardado los cambios.',
          OKNORENOVATION: 'La colectividad se ha cerrado y no se vera más en el listado de renovaciones.',
          CONFIGSAVED: 'Se ha guardado su configuración, por favor refrescar el navegador para ver aplicados los cambios en la gráfica',
          HISTSENDEMAIL:'El histórico ha sido enviado.'
      },
      ERROR: {
          ERRORREPORTGRAL: 'Ha ocurrido un error al generar el reporte',
          DATESOUT: 'La vigencia de los recibos no corresponde con la vigencia de la póliza, favor de generar recibos nuevamente',
          DATESOUT_FY: 'La vigencia de los recibos no corresponde con la vigencia del primer año la póliza, favor de generar recibos nuevamente',
          INVALIDEMAIL: 'Ingrese un e-mail válido',
          INVALIDEMAILCONTACT: 'Ingrese un e-mail válido del contacto',
          CONTRACTORERROR: 'Debes seleccionar un contratante válido',
          MINIMUMPHONELENGTH: 'El telefono no debe ser mayor a 15 caracteres',
          THISNAMEALREADYEXIST: 'Este nombre de grupo ya existe en esta organización',
          APPNOTACTIVE: 'Su cuenta fue desactivada por falta de pago \n comuníquese a finanzas@miurabox.com con copia a soporte@miurabox.com',
          PRIMESDOESNTMATCH: 'La suma de las primas netas de los recibos no coinciden con la prima total de la póliza',
          RPFDOESNTMATCH: 'El rpf total de los recibos no coinciden con el rpf total de la póliza',
          DERECHODOESNTMATCH: 'La suma de los derecho de los recibos no coinciden con el derecho total de la póliza',
          SUBTOTALDOESNTMATCH: 'La suma del subtotal de los recibos no coincide con el subtotal de la póliza',
          TOTALDOESNTMATCH: 'La suma de la prima total de los recibos no coincide con el total de la póliza',
          SELLOCATION:'Falta estado, ciudad, dirección o código postal',
          SELADDRES:'Favor de escribir el nombre del contacto',
          SELGROUP: 'Escoja al menos un grupo',
          SELPAY: 'Seleccione una frecuencia de pago',
          ERRORCREATECONTRACTOR: 'Error al guardar contrantante, favor de revisar la información',
          ERRORCREATECOMPANY: 'Error al crear aseguradora, favor de revisar la información',
          ERRORCREATEGROUP: 'Error al crear el grupo, favor de revisar la información',
          ERRORCREATEOT: 'Error al crear la orden de trabajo, favor de revisar la información',
          ERRORCREATEPOLICY: 'Error al crear la póliza, favor de revisar la información',
          ERRORCREATERECIEPTS: 'Error al crear los recibos, favor de revisar la información',
          ERRORCREATEPACKAGE: 'Error al crear el paquete, favor de revisar la información',
          ERRORCREATEBRANCH: 'Error al crear el ramo, favor de revisar la información',
          ERRORCREATESUBBRANCH: 'Error al crear el subramo, favor de revisar la información',
          ERRORCREATEENDORSEMENT: 'Error al crear el endoso, favor de revisar la información',
          ERRORRECEIPTSENDORSEMENT: 'Seleccione un número de recibos',
          ERRORFOLIOENDORSEMENTREG: 'Debe ingresar un folio para el endoso',
          ERRORNUMBERENDORSEMENT: 'Debe ingresar un número para el endoso',
          ERRORTYPEENDORSEMENT: 'Debe seleccionar un tipo de endoso',
          ERRORFOLIOENDORSEMENT: 'Ya existe ese número de folio',
          ERRORONUPDATEADDRESS: 'Error al guardar su dirección, favor de revisar la información',
          ERRORRENEWALPOLICY: 'Error al renovar la póliza, favor de revisar la información',
          ERRORRENEWPOLICY: 'Esta póliza ya tiene una renovación',
          ERRORREPROCCESSRENPOLICY: 'Esta póliza esta ya en proceso de renovación',
          ERRORSTATUSUPDATE: 'Error al actualizar el estatus, favor de revisar la información',
          ERRORONUPLOADFILES: 'Error al cargar archivos, favor de revisar la información',
          FILETOOLARGE: 'El archivo es demasiado grande. Maximo 30 MB',
          ADDATLEASTONECONTACT: 'Favor de agregar al menos un contacto',
          ADDATLEASTONEDIRECCTION: 'Favor de agregar al menos una dirección',
          LOGIN: 'Contraseña o correo inválida',
          PRODUCTACCESS: 'No tienes acceso a este producto',
          ERRORAPI: 'Error al iniciar sesion en el API',
          ERRORCREATERAMO: 'Error al crear el ramo, favor de revisar la información',
          ERRORCREATESUBRAMO: 'Error al crear el subramo, favor de revisar la información',
          ERRORWRONGRAMOCODE: 'El código de ramo debe ser de 1 a 3 dígitos, favor de revisar la información',
          ERRORWRONGSUBRAMOCODE: 'El código de subramo debe ser de 1 a 3 dígitos, favor de revisar la información',
          ERRORWRONGRAMONAME: 'El nombre del ramo debe ser ingresado, favor de revisar la información',
          ERRORWRONGSUBRAMONAME: 'El nombre del subramo debe ser ingresado, favor de revisar la información',
          UPDATECONTRACTOR: 'Error al actualizar su contratante.',
          FOLIOREQUIRED: 'Folio requerido',
          POLICYNOREQUIRED: 'Agrega un número de póliza',
          RECEIPTSREQUIRED: 'Generar recibos es requerido',
          NOTESREQUIRED: 'Generar la nota de crédito es requerido',
          DATAFORMREQUIRED: 'Datos de formulario requeridos',
          DATAFORMNAME: 'Nombre(s) es requerido',
          DATAFORMJNAME: 'Nombre de la Empresa es requerido',
          DATAFORMLASTNAME: 'Apellido Paterno es requerido',
          DATAFORMBIRTHDAY: 'Fecha de Nacimiento es requerido',
          DATAFORMESTABLISHMENT: 'Fecha de Constitución es requerido',
          DATAFORMRFC: 'RFC es requerido',
          DATAFORMSEX: 'Género es requerido',
          DATAADDRESSREQUIRED: 'Datos de dirección requeridos',
          ADMINISTRATIONREQUIRED: 'Seleccione un tipo de administración',
          OBSERVATIONREQUIRED: 'Debe agregar observaciones',
          ERRORINTERNETCONNECTION: 'No hay conexión a internet',
          COMISSION: 'Debe seleccionar una comisión',
          POLICYEXIST: 'El número de póliza ya existe',
          FIANZAEXIST: 'El número de fianza ya existe',
          ADDRESS: 'Debe seleccionar una dirección del contratante',
          PHONE: 'Debe ingresar un teléfono',
          CLAVE: 'Debe seleccionar una clave de agente',
          PACKAGE: 'Debe seleccionar un paquete',
          DATES: 'Debe seleccionar las fechas',
          AUTOFORM: 'Datos del automóvil (marca, modelo, año, serie) requeridos',
          AUTOUSAGE: 'Seleccione un uso al automóvil',
          AUTOSERVICE: 'Seleccione un servicio al automóvil',
          COVERAGESREQUIRED: 'Al menos una cobertura es requerida',
          DEDUCTIBLEREQUIRED: 'Las sumas aseguradas y los deducibles de las coberturas no pueden ir vacíos',
          COVERAGEALREADYEXIST: 'Ya existe ésta cobertura',
          GREATERTHAN100: 'No puede tener un porcentaje mayor a 100%',
          GREATERTHANDEC100: 'No puede tener un porcentaje mayor a 100% y sin punto decimal',
          ONEBENEFICIARY: 'Debe agregar al menos un beneficiario',
          ONEASEGURADOLIFE: 'Debe agregar al menos un ASEGURADO',
          RAMOREQUIRED: 'Debe seleccionar un ramo',
          SUBRAMOREQUIRED: 'Debe seleccionar un subramo',
          PROVIDERREQUIRED: 'Debe seleccionar una aseguradora',
          PRIMATOTAL: 'No se calculó la prima total',
          POLIZAMAXLENGTH: 'Asegúrese que el número de póliza no tenga más de 30 caracteres',
          FOLIOMAXLENGTH: 'Asegúrese que el folio no tenga más de 30 caracteres',
          RECEIPTSDATES: 'Revisa que los recibos tengan fecha de inicio y fecha de fin',
          RECEIPTSERROR: 'Ha ocurrido un error al guardar los recibos.',
          CANCELCERT: 'El certificado no fue eliminado.',
          GRALERROR: 'Ha ocurrido un error',
          CANCELACCOUNT: 'El recibo no se ha conciliado',
          SELECTACCOUNT: 'Seleccione una cuenta',
          DELETECONTACT: 'Se ha borrado un contacto',
          ERRORNAMEPHONEEMAIL: 'Favor de añadir nombre o teléfono y verificar que se use el formato correcto para los correos de los contactos',
          ERRORNUMBER: 'Favor de ingresar un número válido',
          ERRORNAMECOVERAGE: 'Es necesario asignar un nombre a la cobertura',
          ERROR: 'Ha ocurrido un error',
          ERRORSEARCHPOLICY: 'Póliza no encontrada',
          ERRORPRIMA: 'La prima total de los recibos no coincide con la prima total del endoso',
          ERRORRECEIPTS: 'Debe generar los recibos',
          ERRORCERTIFICATES: 'Ha ocurrido un error al guardar los certificados, por favor revise la información',
          ERRORNUMCERTIFICATES: 'Solo es posible cargar un máximo de 800 registros por archivo',
          ERRORSUBGROUP: 'Debe ingresar el nombre del subgrupo',
          ERRORUPDATERECEIPTS: 'Ah ocurrido un error al actualizar el recibo, intente nuevamente',
          ERRORPERMISSIONAPP: 'El usuario no tiene permiso para acceder',
          ERRORPRINTRECEIPT: 'Solo puedes imprimir recibos conciliados',
          ERROREMAILMAX: 'Asegúrese de que ningún correo electrónico tenga más de 70 caracteres',
          ERRORGROUPMAX: 'Asegúrese de que el grupo no tenga más de 100 caracteres',
          ERRORCONCEPT: 'Debes seleccionar un concepto',
          ERRORDATERANGE: 'La fecha final no puede ser menor que la inicial',
          ERRORDATEBIRTHDATE: 'La fecha de nacimiento no puede ser mayor al día de hoy',
          ERRORDATEFORMESTABLISHMENT: 'La fecha de constitución no puede ser mayor al día de hoy',
          ERRORTYPEAUTO: 'Debes seleccionar un tipo de automóvil',
          ERRORLENGTHPHONE: 'El número teléfono debe de ser de 10 dígitos',
          ERRORLENGTHPHONECONTACT: 'Revise números de teléfono en contactos; deben ser mayores a 9 dígitos',
          ERRORSERVER: 'Ha ocurrido un problema al guardar la póliza',
          OPTIONNOTVALID: 'No es una eleccion valida',
          ERRORWITHOUTEMAIL: 'Agrega un correo electrónico o un teléfono',
          ENDOSOBS:'Agregue descripción del endoso',
          ASEGURADOREQUIRED: 'Complete los datos del Asegurado',
          IDENTIFIERREQUIRED: 'Debe ingresar identificador',
          ERRORCONTRACTOR: 'Agrega un contratante',
          ERROREMAIL: 'Agrega un correo electrónico valido',
          ERRORPAYFORM: 'Debe seleccionar una forma de pago',
          ERRORDOWNLOADREP: 'Ha ocurrido un error al descargar el reporte',
          ERRORSENDEMAIL: 'No se encontraron resultados  con esos filtros.',
          ERRORFOUNDRECEIPTS: 'No se encontraron recibos.',
          FIANZANOREQUIRED: 'Agrega un número de fianza.',
          EMISIONREQUIRED: 'Agrega una fecha de emisión.',
          AFIANZADORAREQUIRED: 'Debes seleccionar una afianzadora.',
          TYPEFIANZAREQUIRED: 'Debes seleccionar un tipo de fianza.',
          RODEAFIANZADOREQUIRED: 'Agrega un monto afianzado.',
          VENDORREQUIRED: 'Debes seleccionar un referenciador.',
          ERROREXECUTIONRANGE: 'La fecha final del plazo de ejecución no puede ser menor que la inicial',
          NOCONTRACTREQUIRED: 'Agrega un número de contrato.',
          OBJECTREQUIRED: 'Agrega un objeto de contrato.',
          TOTALAMOUNTREQUIRED: 'Agrega un monto total.',
          GUARANTEEPERCENTAGEREQUIRED: 'Agrega un porcentaje de garantía.',
          BENEFICIARYREQUIRED: 'Agrega al menos un beneficiario.',
          BENEFICIARYNAMEREQUIRED: 'Agrega el nombre del beneficiario  #',
          BENEFICIARYLASTNAMEREQUIRED: 'Agrega el apellido paterno del beneficiario  #',
          BENEFICIARYJNAMEREQUIRED: 'Agrega la razón social del beneficiario  #',
          SINIESTERERROR : 'Ha ocurrido un error al actualizar (falta de información al crearlo)',
          DATEESTABLISHMENT : 'Seleccione la Fecha de Constitución del Calendario ó complete con formato DD/MM/AAAA',
          DATEBIRTHDAY: 'Seleccione la Fecha de Nacimiento del Calendario ó complete con formato DD/MM/AAAA',
          HISTERRORSENDEMAIL: 'No ha sido posible enviar el histórico, intente nuevamente.',
          ERRORENDORSEMENTCONCEPT: 'Debes seleccionar un concepto.',
          ERRORFORMATNUMBER: 'Error de formato, agregue sólo números.', 
          ERRORFORMATPERCENT: 'Error de formato, ingrese un porcentaje válido.', 
          SELECTCERTTOEND: 'Click en Buscar, elija un certificado (click en Elegir).', 
          REVIEWEMAIL: 'Revise el correo electrónico ',
          REPEATEMAIL: 'El correo electrónico ya ha sido agregado con anterioridad'        },
      INFO:{
        MANUALLYDATES: 'Agregar manualmente las fechas',
        CONTRACTORTYPEPERSON: 'Para usar este boton debe seleccionar un contratante fisico',
        POLICYPENDIENT: 'La póliza ha sido asignada al e-mail',
        POLICYASSIGNED: 'El e-mail ingresado pertenece a un usuario registrado, póliza asignada ',
        SUCCESSINTERNETCONNECTION: 'Se ha recuperado la conexión a internet',
        INFOBANNER: 'La imagen debe tener una resolución de 1000 x 120px',
        CANCELCONTRACTOR: 'No se ha aplicado ningún cambio.',
        VIGENCYNOTECREDITWRITE:'Agregue las fechas de vigencia manual, dentro de las fechas del endoso'
      },
      WARNING: {
          VALIDITYENDORSEMENT: 'Vigencia de endoso fuera de rango de vigencia de póliza',
          VALIDITYOUTRANGE: 'Fecha de vigencia fuera del rango',
          UPLOADINGFILES: 'Se estan subiendo los archivos. Por favor espera',
          EMPTYEMAIL:'La lista de correos está vacía',
          EMPTYBANK:'Seleccione un banco válido',
          CHANGEPAYFORM: 'Si se cambia la forma de pago, tiene generar sus recibos nuevamente, ¿esta de acuerdo?',
          WARNINGCONTRACTOR: 'El contratante tiene pólizas asignadas',
          WARNINGRECEIPTS: 'La vigencia de cada recibo fue actualizada. Debe revisar la vigencia de los recibos antes de guardar',
          WARNINGSINIESTER: 'Por favor, agrega los procedentes de cada factura',
          CHOOSECONCEPT: 'Por favor, elija un concepto de cancelación',
          DELETENDO: '¿Está seguro que desea eliminar este endoso? Se eliminarán todos los recibos y/o certificados.',
          SELECTCONSULT: 'Seleccione una opción de Consulta Por',
          CONCPAGEDISPON:'La conciliación se hará sobre los recibos en la página disponible',
          NOSAVEDEMAIL:'Debes guardar el correo antes de enviarlo.',
          FIANSACOMISION:'La fianza se creara sin comisión.',
          WITHOUTCERTS:'No existen certificados en la carátula, el endoso se aplicará a la Carátula.',
          DATEFILTERREMOVED: 'El tiempo de carga de los resultados puede afectarse considerablemente si se selecciona esta opción.'

      }
    });
    app.constant('globalValues', {
        enfermedades: 'padecimientos/',
        states: 'v1/configurations/states/',
        cities: 'v1/configurations/cities/',
        address: 'v1/address/',
        // Forms
        automobileForm: 'v1/forms/automobile-damages/',
        damageForm: 'v1/forms/damages/',
        diseaseForm: 'v1/forms/disease/',
        lifeForm: 'v1/forms/lifes/',
        // Form info
        automobileInfoForm: 'v1/forms/automobile/informations/:id/',
        damageInfoForm: 'v1/forms/damages/informations/:id/',
        diseaseInfoForm: 'v1/forms/disease/informations/:id/',
        lifeInfoForm: 'v1/forms/lifes/informations/:id/',
        //Generics
        personal: 'v1/personal-informations/',
        beneficiaries: 'v1/beneficiaries/',
        relationships: 'v1/relationships/',
        // Endorsements
        automobileEndorsement: 'v1/endorsements/automobiles/',
        damageEndorsement: 'v1/endorsements/damages/',
        diseaseEndorsement: 'v1/endorsements/disease/',
        lifeEndorsement: 'v1/endorsements/lifes/',
        existEndorsement: 'v1/policies/endorsements/:id/',
        // Endorsements min info
        automobileMinEndorsement: 'v1/endorsements/info-automobiles/',
        damageMinEndorsement: 'v1/endorsements/info-damages/',
        diseaseMinEndorsement: 'v1/endorsements/info-disease/',
        lifeMinEndorsement: 'v1/endorsements/info-lifes/',
        // Endorsements info
        automobileInfoEndorsement: 'v1/endorsements/automobiles/1/informations/',
        damageInfoEndorsement: 'v1/endorsements/damages/1/informations/',
        diseaseInfoEndorsement: 'v1/endorsements/disease/1/informations/',
        lifeInfoEndorsement: 'v1/endorsements/lifes/1/informations/',

        automobileMoreInfoEndorsement: 'v1/endorsements/automobiles/1/editInfo/',
        damageMoreInfoEndorsement: 'v1/endorsements/damages/1/editInfo/',
        diseaseMoreInfoEndorsement: 'v1/endorsements/disease/1/editInfo/',
        lifeMoreInfoEndorsement: 'v1/endorsements/lifes/1/editInfo/',
        //Policies and receipts
        policyByNumber: 'v1/policies/',
        policyByNumberURL: 'v1/policies/urls/',
        existPolicy: 'v1/policies/:id/exist/',
        existPolicyNumber: 'v1/policies/exist_number/',
        existSerial: 'serial/:id/exist/',
        existSerialRenovacion:'serial/:id/exist-renovacion/:idpoliza/',
        existPolicyFolio: 'v1/policies/folio/:pk/exist/',

        folio: 'v1/folios/:folio/',
        policiesWithoutReceipts: 'v1/policies/clean/',
        receiptsWithPolicy: 'v1/receipts/',
        existOT: 'v1/ot/:id/exist/',
        // Coverages
        coveragesByPackage: 'v1/packages/:package/coverages/'
    });
    app.factory('globalVar', function(url, globalValues){
        var service = {
            diseases: url.IP + globalValues.enfermedades,
            states: url.IP + globalValues.states,
            cities: url.IP + globalValues.cities,
            address: url.IP + globalValues.address,
            // Forms
            automobileForm: url.IP + globalValues.automobileForm,
            lifeForm: url.IP + globalValues.lifeForm,
            diseaseForm: url.IP + globalValues.diseaseForm,
            damageForm: url.IP + globalValues.damageForm,
            // Form info
            automobileInfoForm: url.IP + globalValues.automobileInfoForm,
            damageInfoForm: url.IP + globalValues.damageInfoForm,
            diseaseInfoForm: url.IP + globalValues.diseaseInfoForm,
            lifeInfoForm: url.IP + globalValues.lifeInfoForm,
            // Generics
            personal: url.IP + globalValues.personal,
            beneficiaries: url.IP + globalValues.beneficiaries,
            relationships: url.IP + globalValues.relationships,
            // Endorsements
            automobileEndorsement: url.IP + globalValues.automobileEndorsement,
            damageEndorsement: url.IP + globalValues.damageEndorsement,
            diseaseEndorsement: url.IP + globalValues.diseaseEndorsement,
            lifeEndorsement: url.IP + globalValues.lifeEndorsement,
            existEndorsement: url.IP + globalValues.existEndorsement,
            // Endorsements min info
            automobileMinEndorsement: url.IP + globalValues.automobileMinEndorsement,
            damageMinEndorsement: url.IP + globalValues.damageMinEndorsement,
            diseaseMinEndorsement: url.IP + globalValues.diseaseMinEndorsement,
            lifeMinEndorsement: url.IP + globalValues.lifeMinEndorsement,
            // Endorsements info
            automobileInfoEndorsement: url.IP + globalValues.automobileInfoEndorsement,
            damageInfoEndorsement: url.IP + globalValues.damageInfoEndorsement,
            diseaseInfoEndorsement: url.IP + globalValues.diseaseInfoEndorsement,
            lifeInfoEndorsement: url.IP + globalValues.lifeInfoEndorsement,
            // Endorsements more info
            automobileMoreInfoEndorsement: url.IP + globalValues.automobileMoreInfoEndorsement,
            damageMoreInfoEndorsement: url.IP + globalValues.damageMoreInfoEndorsement,
            diseaseMoreInfoEndorsement: url.IP + globalValues.diseaseMoreInfoEndorsement,
            lifeMoreInfoEndorsement: url.IP + globalValues.lifeMoreInfoEndorsement,
            // Policies and receipts
            policyByNumber: url.IP + globalValues.policyByNumber,
            policyByNumberURL: url.IP + globalValues.policyByNumberURL,
            existPolicy: url.IP + globalValues.existPolicy,
            existPolicyNumber: url.IP + globalValues.existPolicyNumber,
            existSerial: url.IP + globalValues.existSerial,
            existSerialRenovacion: url.IP + globalValues.existSerialRenovacion,
            existPolicyFolio: url.IP + globalValues.existPolicyFolio,

            folio: url.IP + globalValues.folio,
            policiesWithoutReceipts: url.IP + globalValues.policiesWithoutReceipts,
            receiptsWithPolicy: url.IP + globalValues.receiptsWithPolicy,
            existOT: url.IP + globalValues.existOT,
            // Coverages
            coveragesByPackage: url.IP + globalValues.coveragesByPackage
        };
        return service;
    });

    app.constant('forms', {
      auto: {subranch_name: 'Automóviles', subbranch_code: 9}
    });

    app.constant('facturas_conceptos', [
      { name: 'Medicamentos', value:'Medicamentos' },
      { name: 'Honorarios Médicos', value: 'Honorarios Médicos'},
      { name: 'Hospitalización', value: 'Hospitalización'},
      { name: 'Estudios', value: 'Estudios'},
      { name: 'Prótesis', value: 'Prótesis'},
      { name: 'Ambulancia', value: 'Ambulancia'},
      { name: 'Otros', value: 'Otros'},
    ]);

    app.constant('sex',[
      {value: 'M', label: 'MASCULINO'},
      {value: 'F', label: 'FEMENINO'}
    ]);

    app.constant('tiposBeneficiarios',[{
        option: 'TITULAR',
        relationship: 1,
        disabled: false
    }, {
        option: 'CONYUGE',
        relationship: 2,
        disabled: false
    }, {
        option: 'HIJO',
        relationship: 3,
        disabled: false
    }, {
        option: 'OTRO',
        relationship: 4,
        disabled: false
    }]);

    app.constant('status', [
        {value: 1, label: 'EN TRÁMITE'},
        {value: 2, label: 'OT CANCELADA'},
        {value: 10, label: 'POR INICIAR'},
        {value: 11, label: 'CANCELADA'},
        {value: 12, label: 'RENOVADA'},
        {value: 13, label: 'VENCIDA'},
        {value: 14, label: 'VIGENTE'},
        {value: 15, label: 'NO RENOVADA'},
        {value: 16, label: 'SINIESTRADA'},
    ]);

    app.constant('statusSiniestro', [
        {value: 1, label: 'PENDIENTE'},
        {value: 2, label: 'EN TRAMITE'},
        {value: 3, label: 'PROCEDENTE'},
        {value: 4, label: 'CANCELADA'},
        {value: 5, label: 'RECHAZADA'}
    ]);

    app.constant('payform', [
        {value: 1, label: 'MENSUAL'},
        {value: 2, label: 'BIMESTRAL'},
        {value: 3, label: 'TRIMESTRAL'},
        // {value: 4, label: 'CUATRIMESTRAL'},
        {value: 5, label: 'CONTADO'},
        {value: 6, label: 'SEMESTRAL'},
        {value: 12, label: 'ANUAL'}
        // {value: 24, label: 'Quincenal'},
    ]);

    app.constant('formaPago', [
        {value: 1, label: 'MENSUAL'},
        {value: 2, label: 'BIMESTRAL'},
        {value: 3, label: 'TRIMESTRAL'},
        {value: 5, label: 'CONTADO'},
        {value: 6, label: 'SEMESTRAL'},
        {value: 4, label: 'CUATRIMESTRAL'},
        {value: 12, label: 'ANUAL'}
        // {value: 24, label: 'Quincenal'},
    ]);

    app.constant('statusReceipt', [
        {value: 1, label: 'PAGADO'},
        {value: 2, label: 'CANCELADO'},
        {value: 3, label: 'PRORROGADO'},
        {value: 4, label: 'PENDIENTE DE PAGO'},
        {value: 5, label: 'LIQUIDADO'},
        {value: 6, label: 'CONCILIADO'},
        {value: 7, label: 'CERRADO'},
        {value: 8, label: 'PRECANCELADO'},
        {value: 10, label: 'ANULADO'},
        {value: 11, label: 'PREANULADO'}
    ]);

    app.constant('statusPayform', [
        {value: 1, label: 'CHEQUE'},
        {value: 2, label: 'EFECTIVO'},
        {value: 3, label: 'TRANSFERENCIA'},
        {value: 4, label: 'DEPOSITO BANCARIO'},
        {value: 5, label: 'TARJETA DE CREDITO'},
        {value: 6, label: 'TARJETA DE DEBITO'},
        {value: 7, label: 'ESTADO DE CUENTA'},
        {value: 8, label: 'COMPAÑIA'},
        {value: 9, label: 'CAT/DOMICILIADO'}
    ]);


    app.constant('curr_rate_options', [
        {value: 1, label: 'PESO'},
        {value: 2, label: 'DOLAR'},
        {value: 3, label: 'UDI'},
        {value: 4, label: 'EURO'},
        {value: 5, label: 'DOLAR CANADIENSE'},
        {value: 6, label: 'LIBRA ESTERLINA'},
        {value: 7, label: 'YEN'}

    ]);


    app.constant('endorsement', [
      {value: 1, label: 'PENDIENTE'}, //Cuando se crea el endoso. Este es el estatus por default.
      {value: 2, label: 'REGISTRADO'}, //Cuando se acepta y aplica el endoso. De aquí ya no se puede cambiar a ningún otro estatus, ya que es el paso final.
      {value: 3, label: 'RECHAZADO'}, //Cuando la compañía rechaza el endoso.
      {value: 4, label: 'CANCELADO'}, //Cuando el usuario cancela el endoso.
      {value: 5, label: 'EN TRÁMITE'} //Posterior a pendiente
    ]);

    app.constant('conceptA', [
      {value: 1, label: 'CAMBIO DE FORMA DE PAGO'},
      // {value: 2, label: 'CAMBIO DE SUMA ASEGURADA'}, 
      // {value: 3, label: 'CAMBIO DE DEDUCIBLE Y/O COASEGURO'}, 
      // {value: 4, label: 'AGREGAR ASEGURADO'}, 
      // {value: 5, label: 'AGREGAR COBERTURAS'},
      // {value: 6, label: 'DECLARACIÓN MENSUAL'},
      // {value: 19, label: 'OTRO (COBERTURAS)'},
      // {value: 20, label: 'OTRO (ASEGURADO)'},
      {value: 7, label: 'OTRO'},
    ]);

    app.constant('conceptFianza', [
      // {value: 1, label: 'AUMENTO MONTO AFIANZADO'},
      // {value: 2, label: 'DECREMENTO MONTO AFIANZADO'}, 
      // {value: 3, label: 'CAMBIO DE PORCENTAJE DE GARANTÍA'}, 
      // {value: 5, label: 'CAMBIO DE DATOS'}, 
      {value: 4, label: 'OTRO'}
    ]);

    app.constant('conceptB', [
      // {value: 8, label: 'CAMBIO DATOS FISCALES'},
      // {value: 33, label: 'CORRECCION DE DATOS'},
      // {value: 34, label: 'CORRECCION DE DATOS BENEFICIARIO'},
      // {value: 9, label: 'ESPECIFICACIONES'},
      // {value: 23, label: 'ANTIGÜEDAD RECONOCIDA'},
      {value: 10, label: 'OTRO'}
    ]);

    app.constant('conceptD', [
      // {value: 12, label: 'DISMINUCIÓN EN LA SUMA ASEGURADA'}, 
      // {value: 13, label: 'BAJA DE COBERTURA'}, 
      // {value: 14, label: 'CAMBIO DE DEDUCIBLE Y/O COASEGURO'}, 
      // {value: 15, label: 'BAJA DE ASEGURADO'},
      // {value: 16, label: 'CANCELACIÓN DE PÓLIZA POR PETICIÓN'},
      // {value: 17, label: 'CANCELACIÓN DE PÓLIZA POR FALTA DE PAGO'},
      // {value: 21, label: 'OTRO (COBERTURAS)'},
      // {value: 22, label: 'OTRO (ASEGURADO)'},
      {value: 18, label: 'OTRO'}
    ]);

    app.constant('collectivityConceptA', [
      // // {id: 24, name: 'ALTA DE CERTIFICADOS'},
      // {id: 26, name: 'AJUSTE ANUAL A'},
      // {id: 30, name: 'DECLARACIÓN'},
      // // {id: 31, name: 'AGREGAR DEPENDIENTE/BENEFICIARIO'},
      // {id: 41, name: 'ALTA DE UNIDAD'},
      // {id: 42, name: 'AGREGAR COBERTURA'}, 
      {id: 43, name: 'CAMBIO DE FORMA DE PAGO'}, 
      // {id: 44, name: 'AGREGAR CARGA'}, 
      // {id: 45, name: 'AGREGAR ADAPTACIONES Y CONVERSIONES'},
      {id: 29, name: 'OTRO'}
    ]);

    app.constant('collectivityConceptB', [
      // // {id: 24, name: 'ALTA DE CERTIFICADOS'},
      // // {id: 25, name: 'BAJA DE CERTIFICADOS'},
      // {id: 27, name: 'RECONOCIMIENTO DE ANTIGÜEDAD'},
      // {id: 46, name: 'INCLUIR BP'},
      // {id: 47, name: 'CORREGIR DESCRIPCIÓN'}, 
      // {id: 48, name: 'AGREGAR TEXTOS ACLARATORIOS'}, 
      // {id: 49, name: 'ADAPTACIONES SOLO PARA EFECTOS DE RC'}, 
      // {id: 50, name: 'AGREGAR PLACAS, MOTOR O CORREGIR SERIE'},
      {id: 29, name: 'OTRO'} 
    ]);

    app.constant('collectivityConceptD', [     
      // {id: 25, name: 'BAJA DE CERTIFICADOS'},
      // {id: 26, name: 'AJUSTE ANUAL D'},
      // {id: 30, name: 'DECLARACIÓN'},
      // {id: 32, name: 'CANCELACIÓN'},
      // {id: 51, name: 'CANCELACIONES'},
      // {id: 52, name: 'ELIMINACIÓN DE COBERTURAS'},
      {id: 29, name: 'OTRO'} 
    ]);
})();
