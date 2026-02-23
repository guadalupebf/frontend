(function() {
	'use strict';
	var app = angular.module('inspinia');
	app.constant('URLS_CONFIG', {
		//cas: 'https://cas.miurabox.com/',
		cas: 'http://localhost:9000/',
		//api: 'https://api.miurabox.com/',
	  	api: 'http://localhost:8000/',  // Referencia
	  	//mc: 'https://grupoasapi.multicotizador.com/'
	  	mc: 'http://127.0.0.1:8001/',
		// REPORT_SERVICE_NODE_SOCKET : "https://socketn-info.mbxservicios.com",
		"REPORT_SERVICE_NODE_SOCKET" : "http://127.0.0.1:8080",
		"REPORT_SERVICE_NODE_SOCKET_ANCORA" : "http://127.0.0.1:8080",
		"SERVICE_PDF" : "https://pdf-api.miurabox.info/",
		"LECTORPDF":"http://127.0.0.1:5000/",
		// "LECTORPDF":"https://lector-pdf.mbxservicios.com/"
		// REPORT_SERVICE_NODE_SOCKET : "http://127.0.0.1:8080"
	});
})();
