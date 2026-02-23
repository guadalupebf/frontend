(function(){
  'use strict';

  angular.module('inspinia')
    .controller('HelpCtrl', HelpCtrl)

  HelpCtrl.$inject = ['$scope', '$sce'];

  function HelpCtrl($scope, $sce){
    
    $scope.manuals = [
        {
            "title": "Configuración inicial",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Acceso al CAS",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Acceso+al+CAS.pdf")
                },
                {
                    "subtitle": "Crear Perfiles",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Crear+perfiles.pdf")
                },
                {
                    "subtitle": "Crear Usuarios",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Crear+usuarios.pdf")
                },
                {
                    "subtitle": "Crear Clave",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Crear+claves.pdf")
                }
            ]
        },
        {
            "title": "Navegación",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Indicadores de operación en tiempo real",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Indicadores+de+operaci%C3%B3n+en+tiempo+real.pdf")
                },
                {
                    "subtitle": "Usar el Superbuscador",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Super+Buscador.pdf")
                },
                {
                    "subtitle": "Usar filtros y listados",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Filtros+y+listados.pdf")
                },
                {
                    "subtitle": "Usar el menú rápido de opciones",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Men%C3%BA+rapido+de+opciones.pdf")
                }
            ]
        },
        {
            "title": "Contratantes",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear y editar",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Crear+y+editar+contratante.pdf")
                }
            ]
        },
        {
            "title": "Grupos",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear y editar grupo",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Crear+y+editar+grupos.pdf")
                }
            ]
        },
        {
            "title": "Pólizas",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear y editar OT/Póliza",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/P%C3%B3lizas.pdf")
                }
            ]
        },
        {
            "title": "Pólizas de Grupo",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear OT/Póliza de Grupo",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Manual+de+Colectividades+SAAM+Miurabox.pdf")
                }
            ]
        },
        {
            "title": "Colectividades",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear OT/Colectividad/Flotilla",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Manual+Flotillas+SAAM+Miurabox.pdf")
                }
            ]
        },
        {
            "title": "Fianzas",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear y editar fianza",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Manual+Fianzas+SAAM+Miurabox.pdf")
                }
            ]
        },
        {
            "title": "Renovaciones",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Renovar pólizas individuales"
                },
                {
                    "subtitle": "Renovar pólizas colectivas"
                }
            ]
        },
        {
            "title": "Cobranza",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Cambiar de estatus un recibo",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Estatus+Recibos.pdf")
                }
            ]
        },
        {
            "title": "Aseguradoras",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear y editar aseguradora",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Crear+y+editar+aseguradoras.pdf")
                }
            ]
        },
        {
            "title": "Paquetes",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear paquete",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Crear+paquetes.pdf")
                },
                {
                    "subtitle": "Asignar coberturas",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Crear+coberturas.pdf")
                },
                {
                    "subtitle": "Personalizar paquetes"
                }
            ]
        },
        {
            "title": "Endosos",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear y registrar endoso",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Endosos.pdf")
                },
                {
                    "subtitle": "Crear endoso de alta",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Fianzas+c.pdf")
                },
                {
                    "subtitle": "Crear endoso de baja",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Fianzas+c.pdf")
                },
                {
                    "subtitle": "Crear endoso manual para colectividades"
                }
            ]
        },
        {
            "title": "Siniestros",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear siniestro"
                },
                {
                    "subtitle": "Completar siniestro",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Completar+siniestros.pdf")
                }
            ]
        },
        {
            "title": "Comisiones",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Liquidar y conciliar recibos"
                }
            ]
        },
        {
            "title": "Referenciadores",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Configurar usuarios referenciadores",
                    // "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Administrar+Referenciadores.pdf")
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Administrar+Referenciadores.pdf")
                    
                },
                {
                    "subtitle": "Pagar a referenciadores",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Pago+referenciadores.pdf")
                }
            ]
        },
        {
            "title": "Reportes",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Generar reporte"
                }
            ]
        },
        {
            "title": "Cartas",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear y generar carta",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Cartas.pdf")
                }
            ]
        },
        {
            "title": "Campañas",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Crear campaña"
                }
            ]
        },
        {
            "title": "Correos automáticos",
            "id": 0,
            "sections": [
                {
                    "subtitle": "Configurar correos automáticos",
                    "url": $sce.trustAsResourceUrl("https://miurabox-public.s3.us-east-1.amazonaws.com/manuales/Correo+autom%C3%A1ticos.pdf")
                }
            ]
        }
    ];

    $scope.showAnswerNegative = false;
    $scope.showAnswerAfirmative = false;

    $scope.showResult = function(value){
        if(value){
            $scope.showAnswerNegative = false;
            $scope.showAnswerAfirmative = true;
        }
        else{
            $scope.showAnswerNegative = true;
            $scope.showAnswerAfirmative = false;
        }
    };

  }

})();