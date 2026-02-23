angular.module("config", [])
.constant("url", {
	"_commentIP":"http://localhost:8000/",
	//"IP":"https://api.miurabox.com/",
	//"IP_CAS":"https://cas.miurabox.com",
	"SOCKETNODE": "https://socketn.mbservicios.com",
	//"MC":"https://grupoasapi.multicotizador.com/"
	//"MC":"https://testapi.multicotizador.com/"
 	"IP":"http://localhost:8000/",
	"IP_CAS":"http://localhost:9000/",	
	"MC":"http://127.0.0.1:8001/",
	"REPORT_SERVICE_NODE_SOCKET" : "http://127.0.0.1:8080",
	"REPORT_SERVICE_NODE_SOCKET_ANCORA" : "http://127.0.0.1:8080",
	"SERVICE_PDF" : "https://pdf-api.miurabox.info/",
	"SUPERBUSCADOR":"http://127.0.0.1:7001/",
	"SUPERBUSCADOR_ANCORA":"http://127.0.0.1:7001/",
	"LECTORPDF":"http://127.0.0.1:5000/",
	// "LECTORPDF":"https://lector-pdf.mbxservicios.com/"
	// "REPORT_SERVICE_NODE_SOCKET" : "http://127.0.0.1:8080"
});
