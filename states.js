(function () {
  
    'use strict';

    var app = angular.module('inspinia');

    app.factory('appStates', ['$state', '$localStorage', function($state, $localStorage) {
        var states = [
            // { name: 'Polizas', heading: "Polizas", route: "polizas.table", event: null, isVisible: true, href: $state.href("polizas.table") },
            { 
                id: 0, 
                name: 'Dashboard', 
                heading: "Dashboard", 
                route: "index.main", 
                event: null, 
                isVisible: true, 
                href: $state.href("index.main")
            },
            // { name: 'Crear contratante', heading: "Crear contratante", route: "contratantes.create", event: null, isVisible: true, href: $state.href("contratantes.create") },
        ];
        try {
            if ($localStorage.tab_states && $localStorage.tab_states.length > 0){
                var states = $localStorage.tab_states;
            }
        } catch (err) {
            console.error('error states',err);
            $localStorage.tab_states = states;
        };

        var getActiveTab = function(){
            var index = states.findIndex(function(state){return state.active === true})
            return index;
        }

        var getActualTab = function(){
            var index = $localStorage.tab_index;
            return $localStorage.tab_states[index];
        }

        var estados = function(current_state, url, stateParams){
            // console.log(current_state);
            // console.log('regex ', url.match(/contratantes\/fisicas\/(.*)$/)[1].replace('/',''));
            var abstract_estados = {
                'inicio.inicio': {
                    id: 0, 
                    name: 'Inicio', 
                    heading: "Inicio", 
                    route: "inicio.inicio", 
                    event: null, 
                    active: true, 
                    isVisible: true, 
                    href: $state.href("inicio.inicio")
                },
                'index.main': {
                    id: 0, 
                    name: 'Dashboard', 
                    heading: "Dashboard", 
                    route: "index.main", 
                    event: null, 
                    active: true, 
                    isVisible: true, 
                    href: $state.href("index.main")
                },
                'contratantes.create': {
                    id: 0, 
                    name: 'Nuevo contratante',
                    heading: "Nuevo contratante",
                    route: "contratantes.create", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("contratantes.create")
                },
                'contratantes.list': {
                    id: 0, 
                    name: 'Lista contratantes',
                    heading: "Lista contratantes",
                    route: "contratantes.list", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("contratantes.list")
                },
                'recordatorios.automaticos': {
                    id: 0, 
                    name: 'Recordatorios automáticos',
                    heading: "Recordatorios automáticos",
                    route: "recordatorios.automaticos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("recordatorios.automaticos")
                },
                'recordatorios.libres': {
                    id: 0, 
                    name: 'Recordatorios libres',
                    heading: "Recordatorios libres",
                    route: "recordatorios.libres", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("recordatorios.libres")
                },
                'recordatorios.desde_registros': {
                    id: 0, 
                    name: 'Recordatorios de registros',
                    heading: "Recordatorios de registros",
                    route: "recordatorios.desde_registros", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("recordatorios.desde_registros")
                },
                'contratantes.main': {
                    id: 0, 
                    name: 'Lista contratantes',
                    heading: "Lista contratantes",
                    route: "contratantes.list", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("contratantes.list")
                },
                'contratantes.info': {
                    active: true,
                    heading: "Información contratante",
                    name: "Información contratante",
                    href: $state.href("contratantes.info", {
                        contratanteId : url.match(/contratantes\/fisicas\/(.*)$/) ? url.match(/contratantes\/fisicas\/(.*)$/)[1].replace('/','') : //nested ternary operator
                        url.match(/contratantes\/morales\/(.*)$/) ? url.match(/contratantes\/morales\/(.*)$/)[1].replace('/','') : 0, 
                        type: url.match(/contratantes\/(.*)$/) ? url.match(/contratantes\/(.*)$/)[1].split('/')[0] : 0
                    }) ,
                    id: url.match(/contratantes\/fisicas\/(.*)$/) ? url.match(/contratantes\/fisicas\/(.*)$/)[1].replace('/','') : 
                    url.match(/contratantes\/morales\/(.*)$/) ? url.match(/contratantes\/morales\/(.*)$/)[1].replace('/','') : 0,
                    type: url.match(/contratantes\/(.*)$/) ? url.match(/contratantes\/(.*)$/)[1].split('/')[0] : 0,
                    isVisible: true,
                    route: "contratantes.info",
                },
                'recordatorios.automaticos_detalle': {
                    active: true,
                    heading: "Información recordatorio",
                    name: "Información recordatorio",
                    href: $state.href("recordatorios.automaticos_detalle", {
                        id : url.match(/recordatorios\/automaticos-detalle\/(.*)$/) ? url.match(/recordatorios\/automaticos-detalle\/(.*)$/)[1].replace('/','') : 0, 
                    }) ,
                    id: url.match(/recordatorios\/automaticos-detalle\/(.*)$/) ? url.match(/recordatorios\/automaticos-detalle\/(.*)$/)[1].replace('/','') : 0,
                    isVisible: true,
                    route: "recordatorios.automaticos_detalle",
                },
                'contratantes.edit': {
                    active: true,
                    heading: "Editar contratante",
                    name: "Editar contratante",
                    href: $state.href("contratantes.edit", {
                        contratanteId : url.match(/contratantes\/fisicas\/editar\/(.*)$/) ? url.match(/contratantes\/fisicas\/editar\/(.*)$/)[1].replace('/','') : //nested ternary operator
                        url.match(/contratantes\/morales\/editar\/(.*)$/)  ? url.match(/contratantes\/morales\/editar\/(.*)$/)[1].replace('/','') : 0, 
                        type: url.match(/contratantes\/(.*)$/) ? url.match(/contratantes\/(.*)$/)[1].split('/')[0] : 0
                    }) ,
                    id: url.match(/contratantes\/fisicas\/editar\/(.*)$/) ? url.match(/contratantes\/fisicas\/editar\/(.*)$/)[1].replace('/','') : 
                    url.match(/contratantes\/morales\/editar\/(.*)$/) ? url.match(/contratantes\/morales\/editar\/(.*)$/)[1].replace('/','') : 0,
                    type: url.match(/contratantes\/(.*)$/) ? url.match(/contratantes\/(.*)$/)[1].split('/')[0] : 0,
                    isVisible: true,
                    route: "contratantes.edit",
                },
                'grupos.grupos': {
                    id: 0, 
                    name: 'Grupos',
                    heading: "Grupos",
                    route: "grupos.grupos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("grupos.grupos")
                },
                'grupos.info': {
                    active: true,
                    heading: "Información grupo",
                    name: "Información grupo",
                    href: $state.href("grupos.info", {
                        grupoId : url.match(/grupos\/informacion\/(.*)$/) ? url.match(/grupos\/informacion\/(.*)$/)[1].replace('/','') : 0, 
                    }) ,
                    id: url.match(/grupos\/informacion\/(.*)$/) ? url.match(/grupos\/informacion\/(.*)$/)[1].replace('/','') : 0,
                    isVisible: true,
                    route: "grupos.info",
                },
                'grupos.edit': {
                    active: true,
                    heading: "Edición grupo",
                    name: "Edición grupo",
                    href: $state.href("grupos.edit", {
                        grupoId : url.match(/grupos\/editar\/(.*)$/) ? url.match(/grupos\/editar\/(.*)$/)[1].replace('/','') : 0, 
                    }) ,
                    id: url.match(/grupos\/editar\/(.*)$/) ? url.match(/grupos\/editar\/(.*)$/)[1].replace('/','') : 0,
                    isVisible: true,
                    route: "grupos.edit",
                },
                'clasificacion.clasificacion': {
                    id: 0, 
                    name: 'Clasificación',
                    heading: "Clasificación",
                    route: "clasificacion.clasificacion", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("clasificacion.clasificacion")
                },
                'celulacontractor.celulacontractor': {
                    id: 0, 
                    name: 'Célula',
                    heading: "Célula",
                    route: "celulacontractor.celulacontractor", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("celulacontractor.celulacontractor")
                },
                'groupinglevel.groupinglevel': {
                    id: 0, 
                    name: 'Niveles de Agrupación',
                    heading: "Niveles de Agrupación",
                    route: "groupinglevel.groupinglevel", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("groupinglevel.groupinglevel")
                },
                'polizas.table': {
                    id: 0, 
                    name: 'Listado pólizas', 
                    heading: "Listado pólizas", 
                    route: "polizas.table", 
                    event: null, 
                    active: true, 
                    isVisible: true, 
                    href: $state.href("polizas.table")
                },
                'polizas.info': {
                    id: url.match(/polizas\/(.*)$/) ? url.match(/polizas\/(.*)$/)[1] : 0 , 
                    name: 'Información pólizas',
                    heading: "Información pólizas",
                    route: "polizas.info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("polizas.info", {
                        polizaId:url.match(/polizas\/(.*)$/) ? url.match(/polizas\/(.*)$/)[1] : 0
                    })
                },
                'polizas.create': {
                    id: 0, 
                    name: 'Crear póliza',
                    heading: "Crear póliza",
                    route: "polizas.create", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("polizas.create")
                },
                'polizas.editar': {
                    id: url.match(/polizas\/(.*)$/) ? url.match(/polizas\/(.*)$/)[1].replace('/editar',''): 0, 
                    name: 'Editar póliza',
                    heading: "Editar póliza",
                    route: "polizas.editar", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("polizas.editar",{
                        polizaId:url.match(/polizas\/(.*)$/) ? url.match(/polizas\/(.*)$/)[1].replace('/editar','') : 0
                    })
                },
                'compartir.create': {
                    id: url.match(/compartir\/(.*)$/) ? url.match(/compartir\/(.*)$/)[1] : 0 , 
                    name: 'Compartir a la App',
                    heading: "Compartir a la App",
                    route: "compartir.create", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("compartir.create", {
                        polizaId:url.match(/compartir\/(.*)$/) ? url.match(/compartir\/(.*)$/)[1] : 0
                    })
                },
                'conexion.agentes': {
                    id: url.match(/conexion\/(.*)$/) ? url.match(/conexion\/(.*)$/)[1] : 0 , 
                    name: 'Conexión Agentes',
                    heading: "Conexión Agentes",
                    route: "conexion.agentes", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("conexion.agentes", {
                        polizaId:url.match(/conexion\/(.*)$/) ? url.match(/conexion\/(.*)$/)[1] : 0
                    })
                },
                'colectividades.main': {
                    id: 0, 
                    name: 'Póliza Grupo',
                    heading: "Póliza Grupo",
                    route: "colectividades.main", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("colectividades.main")
                },
                'colectividades.table': {
                    id: 0, 
                    name: 'Listado PGrupo', 
                    heading: "Listado PGrupo", 
                    route: "colectividades.table", 
                    event: null, 
                    active: true, 
                    isVisible: true, 
                    href: $state.href("colectividades.table")
                },
                'colectividades.info': {
                    id: url.match(/colectividades\/(.*)$/) ? url.match(/colectividades\/(.*)$/)[1] : 0 , 
                    name: 'Información Póliza Grupo',
                    heading: "Información Póliza Grupo",
                    route: "colectividades.info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("colectividades.info", {
                        polizaId:url.match(/colectividades\/(.*)$/) ? url.match(/colectividades\/(.*)$/)[1] : 0
                    })
                },
                'colectividades.edit': {
                    id: url.match(/colectividades\/editar\/(.*)$/) ? url.match(/colectividades\/editar\/(.*)$/)[1].replace('/editar',''): 0, 
                    name: 'Editar póliza',
                    heading: "Editar póliza",
                    route: "colectividades.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("colectividades.edit",{
                        polizaId:url.match(/colectividades\/editar\/(.*)$/) ? url.match(/colectividades\/editar\/(.*)$/)[1].replace('/editar','') : 0
                    })
                },
                'colectividades.renewal': {
                    id: url.match(/colectividades\/renovaciones\/(.*)$/) ? url.match(/colectividades\/renovaciones\/(.*)$/)[1].replace('/',''): 0, 
                    name: 'Renovar póliza',
                    heading: "Renovar póliza",
                    route: "colectividades.renewal", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("colectividades.renewal",{
                        polizaId:url.match(/colectividades\/renovaciones\/(.*)$/) ? url.match(/colectividades\/renovaciones\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'colectividades.convertirPoliza': {
                    id: 0, 
                    name: 'Convertir a póliza',
                    heading: "Convertir a póliza",
                    route: "colectividades.convertirPoliza", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("colectividades.convertirPoliza")
                },
                'colectividades.masivos': {
                    id: 0, 
                    name: 'Archivos a Certificados',
                    heading: "Archivos a Certificados",
                    route: "colectividades.masivos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("colectividades.masivos")
                },
                'colectivos.plantillas': {
                    id: 0, 
                    name: 'Certificados Plantillas',
                    heading: "Certificados Plantillas",
                    route: "colectivos.plantillas", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("colectivos.plantillas")
                },
                'flotillas.flotillas': {
                    id: 0, 
                    name: 'Flotillas',
                    heading: "Flotillas",
                    route: "flotillas.flotillas", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("flotillas.flotillas")
                },
                'flotillas.info': {
                    id: url.match(/flotillas\/(.*)$/) ? url.match(/flotillas\/(.*)$/)[1] : 0 , 
                    name: 'Información flotillas',
                    heading: "Información flotillas",
                    route: "flotillas.info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("flotillas.info", {
                        polizaId:url.match(/flotillas\/(.*)$/) ? url.match(/flotillas\/(.*)$/)[1] : 0
                    })
                },
                'flotillas.details': {
                    id: url.match(/flotillas\/(.*)$/) ? url.match(/flotillas\/(.*)$/)[1] : 0 , 
                    name: 'Información flotillas',
                    heading: "Información flotillas",
                    route: "flotillas.details", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("flotillas.details", {
                        polizaId:url.match(/flotillas\/(.*)$/) ? url.match(/flotillas\/(.*)$/)[1] : 0
                    })
                },
                'flotillas.edit': {
                    id: url.match(/flotillas\/editar\/(.*)$/) ? url.match(/flotillas\/editar\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Editar Colectividad',
                    heading: "Editar Colectividad",
                    route: "flotillas.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("flotillas.edit", {
                        polizaId: url.match(/flotillas\/editar\/(.*)$/) ? url.match(/flotillas\/editar\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'flotillas.renewal': {
                    id: url.match(/flotillas\/renewal\/(.*)$/) ? url.match(/flotillas\/renewal\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Renovar Colectividad',
                    heading: "Renovar Colectividad",
                    route: "flotillas.renewal", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("flotillas.renewal", {
                        polizaId: url.match(/flotillas\/renewal\/(.*)$/) ? url.match(/flotillas\/renewal\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'fianzas.fianzas': {
                    id: 0, 
                    name: 'Fianzas',
                    heading: "Fianzas",
                    route: "fianzas.fianzas", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.fianzas")
                },
                'fianzas.reclist': {
                    id: 0, 
                    name: 'Lista reclamaciones',
                    heading: "Lista reclamaciones",
                    route: "fianzas.reclist", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.reclist")
                },
                'fianzas.reclinf': {
                    id: url.match(/reclamaciones\/info\/(.*)$/) ? url.match(/reclamaciones\/info\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información Reclamación',
                    heading: "Información Reclamación",
                    route: "fianzas.reclinf", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.reclinf", {
                        claimId: url.match(/reclamaciones\/info\/(.*)$/) ? url.match(/reclamaciones\/info\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'fianzas.colectividades': {
                    id: 0, 
                    name: 'Fianzas Colectivas',
                    heading: "Fianzas Colectivas",
                    route: "fianzas.colectividades", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.colectividades")
                },
                'fianzas.edit': {
                    id: url.match(/fianzas\/colectividades\/editar\/(.*)$/) ? url.match(/fianzas\/colectividades\/editar\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Editar fianzas',
                    heading: "Editar fianzas",
                    route: "fianzas.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.edit", {
                        polizaId: url.match(/fianzas\/colectividades\/editar\/(.*)$/) ? url.match(/fianzas\/colectividades\/editar\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'fianzas.renewal': {
                    id: url.match(/fianzas\/colectividades\/(.*)$/) ? url.match(/fianzas\/colectividades\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Renovar fianzas',
                    heading: "Renovar fianzas",
                    route: "fianzas.renewal", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.renewal", {
                        polizaId: url.match(/fianzas\/colectividades\/(.*)/) ? url.match(/fianzas\/colectividades\/(.*)/)[1].replace('/','') : 0,
                    })
                },
                'fianzas.reissue': {
                    id: url.match(/colectividades\/(.*)$/) ? url.match(/colectividades\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Reexpedir fianzas',
                    heading: "Reexpedir fianzas",
                    route: "fianzas.reissue", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.reissue", {
                        polizaId: url.match(/colectividades\/(.*)$/) ? url.match(/colectividades\/(.*)$/)[1].replace('/','') : 0,
                    })
                },
                'fianzas.details': {
                    id: url.match(/fianzas\/colectividades\/(.*)$/) ? url.match(/fianzas\/colectividades\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información fianzas Colectivas',
                    heading: "Información fianzas Colectivas",
                    route: "fianzas.details", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.details", {
                        polizaId: url.match(/fianzas\/colectividades\/(.*)$/) ? url.match(/fianzas\/colectividades\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'fianzas.reclamaciones': {
                    id: 0, 
                    name: 'Reclamaciones de Fianza',
                    heading: "Reclamaciones de Fianza",
                    route: "fianzas.reclamaciones", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.reclamaciones")
                },
                'fianzas.list': {
                    id: 0, 
                    name: 'Lista fianzas',
                    heading: "Lista fianzas",
                    route: "fianzas.list", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.list")
                },
                'fianzas.info': {
                    id: url.match(/fianzas\/informacion\/(.*)$/) ? url.match(/fianzas\/informacion\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información fianzas',
                    heading: "Información fianzas",
                    route: "fianzas.info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.info", {
                        polizaId: url.match(/fianzas\/informacion\/(.*)$/) ? url.match(/fianzas\/informacion\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'fianzas.pprovlist': {
                    id: 0, 
                    name: 'Lista proveedores',
                    heading: "Lista proveedores",
                    route: "fianzas.pprovlist", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.pprovlist")
                },
                'fianzas.pprovnew': {
                    id: 0, 
                    name: 'Nuevo proveedores',
                    heading: "Nuevo proveedores",
                    route: "fianzas.pprovnew", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.pprovnew")
                },
                'fianzas.editar': {
                    id: url.match(/fianzas\/editar\/(.*)$/) ? url.match(/fianzas\/editar\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Edición fianzas',
                    heading: "Edición fianzas",
                    route: "fianzas.editar", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.editar", {
                        polizaId: url.match(/fianzas\/editar\/(.*)$/) ? url.match(/fianzas\/editar\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'fianzas.renovar': {
                    id: url.match(/fianzas\/(.*)$\/(.*)$/) ? url.match(/fianzas\/(.*)$\/(.*)$/)[1].replace('/','') : 0, 
                    renovacion: url.match(/fianzas\/(.*)$\/(.*)$/) ? url.match(/fianzas\/(.*)$\/(.*)$/)[2].replace('/','') : 0, 
                    name: 'Renovar fianzas',
                    heading: "Renovar fianzas",
                    route: "fianzas.renovar", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.renovar", {
                        polizaId: url.match(/fianzas\/(.*)$\/(.*)$/) ? url.match(/fianzas\/(.*)$\/(.*)$/)[1].replace('/','') : 0, 
                        renovacion: url.match(/fianzas\/(.*)$\/(.*)$/) ? url.match(/fianzas\/(.*)$\/(.*)$/)[2].replace('/','') : 0
                    })
                },
                'fianzas.reexpedir': {
                    id: url.match(/fianzas\/(.*)$\/(.*)$/) ? url.match(/fianzas\/(.*)$\/(.*)$/)[1].replace('/','') : 0, 
                    reexpedir: url.match(/fianzas\/(.*)$\/(.*)$/) ? url.match(/fianzas\/(.*)$\/(.*)$/)[2].replace('/','') : 0,
                    name: 'Reexpedir fianzas',
                    heading: "Reexpedir fianzas",
                    route: "fianzas.reexpedir", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("fianzas.reexpedir", {
                        polizaId: url.match(/fianzas\/(.*)$\/(.*)$/) ? url.match(/fianzas\/(.*)$\/(.*)$/)[1].replace('/','') : 0,
                        reexpedir: url.match(/fianzas\/(.*)$\/(.*)$/) ? url.match(/fianzas\/(.*)$\/(.*)$/)[2].replace('/','') : 0
                    })
                },
                'reclamacion.edit': {
                    id: url.match(/fianzas\/reclamaciones\/(.*)$/) ? url.match(/fianzas\/reclamaciones\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Reclamaciones fianzas',
                    heading: "Reclamaciones fianzas",
                    route: "reclamacion.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reclamacion.edit", {
                        reclId: url.match(/fianzas\/reclamaciones\/(.*)$/) ? url.match(/fianzas\/reclamaciones\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'fianzas.pprovinfo': {
                    active: true,
                    heading: "Información Programa Proveedores",
                    name: "Información Programa Proveedores",
                    href: $state.href("fianzas.pprovinfo", {
                        contratanteId : url.match(/programa\/fisicas\/(.*)$/) ? url.match(/programa\/fisicas\/(.*)$/)[1].replace('/','') :
                        url.match(/programa\/morales\/(.*)$/) ? url.match(/programa\/morales\/(.*)$/)[1].replace('/','') : 0, 
                        type: url.match(/programa\/(.*)$/) ? url.match(/programa\/(.*)$/)[1].split('/')[0] : 0
                    }) ,
                    id: url.match(/programa\/fisicas\/(.*)$/) ? url.match(/programa\/fisicas\/(.*)$/)[1].replace('/','') : 
                    url.match(/programa\/morales\/(.*)$/) ? url.match(/programa\/morales\/(.*)$/)[1].replace('/','') : 0,
                    type: url.match(/programa\/(.*)$/) ? url.match(/programa\/(.*)$/)[1].split('/')[0] : 0,
                    isVisible: true,
                    route: "fianzas.pprovinfo",
                },
                'fianzas.pprovedit': {
                    active: true,
                    heading: "Edición Programa Proveedores",
                    name: "Edición Programa Proveedores",
                    href: $state.href("fianzas.pprovedit", {
                        contratanteId : url.match(/programa\/fisicas\/(.*)$/) ? url.match(/programa\/fisicas\/(.*)$/)[1].replace('/','') : //nested ternary operator
                        url.match(/programa\/morales\/(.*)$/) ? url.match(/programa\/morales\/(.*)$/)[1].replace('/','') : 0, 
                        type: url.match(/programa\/(.*)$/) ? url.match(/programa\/(.*)$/)[1].split('/')[0] : 0
                    }) ,
                    id: url.match(/programa\/fisicas\/(.*)$/) ? url.match(/programa\/fisicas\/(.*)$/)[1].replace('/','') : 
                    url.match(/programa\/morales\/(.*)$/) ? url.match(/programa\/morales\/(.*)$/)[1].replace('/','') : 0,
                    type: url.match(/programa\/(.*)$/) ? url.match(/programa\/(.*)$/)[1].split('/')[0] : 0,
                    isVisible: true,
                    route: "fianzas.pprovedit",
                },
                'endorsement.endorsement': {
                    id: 0, 
                    name: 'Endosos',
                    heading: "Endosos",
                    route: "endorsement.endorsement", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("endorsement.endorsement")
                },
                'endorsement.lista': {
                    id: 0, 
                    name: 'Lista endosos',
                    heading: "Lista endosos",
                    route: "endorsement.lista", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("endorsement.lista")
                },
                'endorsement.collectivity': {
                    id: 0, 
                    name: 'Endosos Póliza Grupo',
                    heading: "Endosos Póliza Grupo",
                    route: "endorsement.collectivity", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("endorsement.collectivity")
                },
                'endorsement.info': {
                    id: url.match(/endosos\/informacion\/(.*)$/) ? url.match(/endosos\/informacion\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información endosos',
                    heading: "Información endosos",
                    route: "endorsement.info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("endorsement.info", {
                        endosoId: url.match(/endosos\/informacion\/(.*)$/) ? url.match(/endosos\/informacion\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'endorsement.details': {
                    id: url.match(/endosos\/info\/(.*)$/) ? url.match(/endosos\/info\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información endosos',
                    heading: "Información endosos",
                    route: "endorsement.details", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("endorsement.details", {
                        endosoId: url.match(/endosos\/info\/(.*)$/) ? url.match(/endosos\/info\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'endorsement.edit': {
                    id: url.match(/endosos\/edit\/(.*)$/) ? url.match(/endosos\/edit\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Editar endosos',
                    heading: "Editar endosos",
                    route: "endorsement.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("endorsement.edit", {
                        endosoId: url.match(/endosos\/edit\/(.*)$/) ? url.match(/endosos\/edit\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'endorsement.collective': {
                    id: 0, 
                    name: 'Endosos Grupo',
                    heading: "Endosos Grupo",
                    route: "endorsement.collective", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("endorsement.collective")
                },
                'endorsement.update': {
                    id: url.match(/endosos\/editar\/(.*)$/) ? url.match(/endosos\/editar\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Editar endosos',
                    heading: "Editar endosos",
                    route: "endorsement.update", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("endorsement.update", {
                        endosoId: url.match(/endosos\/editar\/(.*)$/) ? url.match(/endosos\/editar\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'endorsement.fianza': {
                    id: url.match(/endoso\/fianza\/(.*)$/) ? url.match(/endoso\/fianza\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Crear endoso Fianza',
                    heading: "Crear endoso Fianza",
                    route: "endorsement.fianza", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("endorsement.fianza", {
                        fianzaId: url.match(/endoso\/fianza\/(.*)$/) ? url.match(/endoso\/fianza\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'renovaciones.renovaciones': {
                    id: 0, 
                    name: 'Renovaciones',
                    heading: "Renovaciones",
                    route: "renovaciones.renovaciones", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("renovaciones.renovaciones")
                },
                'renovaciones.polizas': {
                    id: url.match(/renovaciones\/renovacion-poliza\/(.*)$/) ? url.match(/renovaciones\/renovacion-poliza\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Renovación pólizas',
                    heading: "Renovación pólizas",
                    route: "renovaciones.polizas", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("renovaciones.polizas", {
                        polizaId: url.match(/renovaciones\/renovacion-poliza\/(.*)$/) ? url.match(/renovaciones\/renovacion-poliza\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'cobranzas.cobranzas': {
                    id: 0, 
                    name: 'Lista cobranza',
                    heading: "Lista cobranza",
                    route: "cobranzas.cobranzas",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("cobranzas.cobranzas")
                },
                'cobranzas.recibospendientes': {
                    id: 0, 
                    name: 'Lista Recibos Pendientes',
                    heading: "Lista Recibos Pendientes",
                    route: "cobranzas.recibospendientes",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("cobranzas.recibospendientes")
                },
                'cobranzas.folios': {
                    id: 0, 
                    name: 'Folios',
                    heading: "Folios",
                    route: "cobranzas.folios",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("cobranzas.folios")
                },
                'cobranzas.bonos': {
                    id: 0, 
                    name: 'Bonos',
                    heading: "Bonos",
                    route: "cobranzas.bonos",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("cobranzas.bonos")
                },
                'cobranzas.cobranzamasivo': {
                    id: 0, 
                    name: 'Pago y Liquidación masivo',
                    heading: "Pago y Liquidación masivo",
                    route: "cobranzas.cobranzamasivo",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("cobranzas.cobranzamasivo")
                },
                'cobranzas.repositorio': {
                    id: 0, 
                    name: 'Repositorio Pago',
                    heading: "Repositorio Pago",
                    route: "cobranzas.repositorio",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("cobranzas.repositorio")
                },
                'aseguradoras.aseguradoras': {
                    id: 0, 
                    name: 'Aseguradoras',
                    heading: "Aseguradoras",
                    route: "aseguradoras.aseguradoras",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("aseguradoras.aseguradoras")
                },
                'aseguradoras.edit': {
                    id: url.match(/aseguradoras\/(.*)$/) ? url.match(/aseguradoras\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Edición Aseguradoras',
                    heading: "Edición Aseguradoras",
                    route: "aseguradoras.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("aseguradoras.edit", {
                        aseguradoraId: url.match(/aseguradoras\/(.*)$/) ? url.match(/aseguradoras\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'aseguradoras.info': {
                    id: url.match(/aseguradoras\/info\/(.*)$/) ? url.match(/aseguradoras\/info\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información Aseguradoras',
                    heading: "Información Aseguradoras",
                    route: "aseguradoras.info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("aseguradoras.info", {
                        aseguradoraId: url.match(/aseguradoras\/info\/(.*)$/) ? url.match(/aseguradoras\/info\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'aseguradoras.ramos': {
                    id: url.match(/aseguradoras\/(.*)$/) ? url.match(/aseguradoras\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información Aseguradoras Ramos',
                    heading: "Información Aseguradoras Ramos",
                    route: "aseguradoras.ramos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("aseguradoras.ramos", {
                        aseguradoraId: url.match(/aseguradoras\/(.*)$/) ? url.match(/aseguradoras\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'aseguradoras.subramos': {
                    id: url.match(/aseguradoras\/(.*)$\/ramos\/(.*)$/) ? url.match(/aseguradoras\/(.*)$\/ramos\/(.*)$/)[1].replace('/','') : 0, 
                    ramosId: url.match(/aseguradoras\/(.*)$\/ramos\/(.*)$/) ? url.match(/aseguradoras\/(.*)$\/ramos\/(.*)$/)[2].replace('/','') : 0,
                    name: 'Información Aseguradoras Ramos',
                    heading: "Información Aseguradoras Ramos",
                    route: "aseguradoras.subramos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("aseguradoras.subramos", {
                        aseguradoraId: url.match(/aseguradoras\/(.*)$\/ramos\/(.*)$/) ? url.match(/aseguradoras\/(.*)$\/ramos\/(.*)$/)[1].replace('/','') : 0,
                        ramosId: url.match(/aseguradoras\/(.*)$\/ramos\/(.*)$/) ? url.match(/aseguradoras\/(.*)$\/ramos\/(.*)$/)[2].replace('/','') : 0,
                    })
                },
                'carga.contractor': {
                    id: 0, 
                    name: 'Carga masiva Contratantes',
                    heading: "Carga masiva Contratantes",
                    route: "carga.contractor",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.contractor")
                },
                'carga.poliza': {
                    id: 0, 
                    name: 'Carga masiva Pólizas Individual',
                    heading: "Carga masiva Pólizas Individual",
                    route: "carga.poliza",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.poliza")
                },
                'carga.norenovacion': {
                    id: 0, 
                    name: 'Carga masiva Pólizas a No Renovar ID',
                    heading: "Carga masiva Pólizas a No Renovar ID",
                    route: "carga.norenovacion",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.norenovacion")
                },
                'carga.pgrupo': {
                    id: 0, 
                    name: 'Carga masiva Pólizas Grupo',
                    heading: "Carga masiva Pólizas Grupo",
                    route: "carga.pgrupo",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.pgrupo")
                },
                'carga.certificado': {
                    id: 0, 
                    name: 'Carga masiva Certificados',
                    heading: "Carga masiva Certificados",
                    route: "carga.certificado",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.certificado")
                },
                'carga.flotilla': {
                    id: 0, 
                    name: 'Carga masiva Flotillas',
                    heading: "Carga masiva Flotillas",
                    route: "carga.flotilla",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.flotilla")
                },
                'carga.recibos': {
                    id: 0, 
                    name: 'Carga masiva Recibos',
                    heading: "Carga masiva Recibos",
                    route: "carga.recibos",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.recibos")
                },
                'carga.catalogo': {
                    id: 0, 
                    name: 'Catálogos',
                    heading: "Catálogos",
                    route: "carga.catalogo",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.catalogo")
                },
                'carga.cancelacion': {
                    id: 0, 
                    name: 'Carga cancelación',
                    heading: "Carga cancelación",
                    route: "carga.cancelacion",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.cancelacion")
                },
                'carga.infocontributoria': {
                    id: 0, 
                    name: 'Carga Información Contributoria Pólizas Grupo',
                    heading: "Carga Información Contributoria Pólizas Grupo",
                    route: "carga.infocontributoria",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("carga.infocontributoria")
                },
                'paquetes.paquetes': {
                    id: 0, 
                    name: 'Paquetes',
                    heading: "Paquetes",
                    route: "paquetes.paquetes",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("paquetes.paquetes")
                },
                'paquetes.edit': {
                    id: url.match(/paquetes\/(.*)$/) ? url.match(/paquetes\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información paquetes coberturas',
                    heading: "Información paquetes coberturas",
                    route: "paquetes.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("paquetes.edit", {
                        paqueteId: url.match(/paquetes\/(.*)$/) ? url.match(/paquetes\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'coberturas.coberturas': {
                    id: 0, 
                    name: 'Coberturas',
                    heading: "Coberturas",
                    route: "coberturas.coberturas",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("coberturas.coberturas")
                },
                'cotizacion.cotizacion': {
                    id: 0, 
                    name: 'Cotización',
                    heading: "Cotización",
                    route: "cotizacion.cotizacion",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("cotizacion.cotizacion")
                },
                'cotizacion.info': {
                    id: url.match(/cotizacion\/(.*)$/) ? url.match(/cotizacion\/(.*)$/)[1] : 0,
                    name: 'Cotización',
                    heading: "Cotización",
                    route: "cotizacion.cotizacion",
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    params : stateParams,
                    href: $state.href("cotizacion.info", {
                        polizaId:url.match(/cotizacion\/(.*)$/) ? url.match(/cotizacion\/(.*)$/)[1] : 0
                    }) 
                },
                'siniestros.plantillas': {
                    id: 0, 
                    name: 'Siniestros Plantillas',
                    heading: "Siniestros Plantillas",
                    route: "siniestros.plantillas", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.plantillas")
                },
                'siniestros.lista': {
                    id: 0, 
                    name: 'Listado siniestros',
                    heading: "Listado siniestros",
                    route: "siniestros.lista", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.lista")
                },
                'siniestros.accidentes': {
                    id: 0, 
                    name: 'Creación Siniestros',
                    heading: "Creación Siniestros",
                    route: "siniestros.accidentes", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.accidentes")
                },
                'siniestros.create_accidentes': {
                    id: 0, 
                    name: 'Creación siniestros Accidentes',
                    heading: "Creación siniestros Accidentes",
                    route: "siniestros.create_accidentes", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.create_accidentes", stateParams)
                },
                'siniestros.damages': {
                    id: 0, 
                    name: 'Creación siniestros Daños',
                    heading: "Creación siniestros Daños",
                    route: "siniestros.damages", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.damages", stateParams)
                },
                'siniestros.vida': {
                    id: 0, 
                    name: 'Siniestros Vida',
                    heading: "Siniestros Vida",
                    route: "siniestros.vida", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.vida", stateParams)
                },
                'siniestros.create_vida': {
                    id: 0, 
                    name: 'Creación siniestros Vida',
                    heading: "Creación siniestros Vida",
                    route: "siniestros.create_vida", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.create_vida", stateParams)
                },
                'siniestros.info': {
                    id: url.match(/siniestros\/gmm\/info\/(.*)$/) ? url.match(/siniestros\/gmm\/info\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información siniestros',
                    heading: "Información siniestros",
                    route: "siniestros.info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.info", {
                        siniestroId: url.match(/siniestros\/gmm\/info\/(.*)$/) ? url.match(/siniestros\/gmm\/info\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'siniestros.edit': {
                    id: url.match(/siniestros\/gmm\/edit\/(.*)$/) ? url.match(/siniestros\/gmm\/edit\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Edición siniestros',
                    heading: "Edición siniestros",
                    route: "siniestros.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.edit", {
                        siniestroId: url.match(/siniestros\/gmm\/edit\/(.*)$/) ? url.match(/siniestros\/gmm\/edit\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'siniestros.accidentesInfo': {
                    id: url.match(/siniestros\/accidentes\/info\/(.*)$/) ? url.match(/siniestros\/accidentes\/info\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información siniestros',
                    heading: "Información siniestros",
                    route: "siniestros.accidentesInfo", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.accidentesInfo", {
                        siniestroId: url.match(/siniestros\/accidentes\/info\/(.*)$/) ? url.match(/siniestros\/accidentes\/info\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'siniestros.vida_info': {
                    id: url.match(/siniestros\/vida\/(.*)$/) ? url.match(/siniestros\/vida\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información siniestros',
                    heading: "Información siniestros",
                    route: "siniestros.vida_info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.vida_info", {
                        siniestroId: url.match(/siniestros\/vida\/(.*)$/) ? url.match(/siniestros\/vida\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'siniestros.autos': {
                    id: 0, 
                    name: 'Creación siniestros Autos',
                    heading: "Creación siniestros Autos",
                    route: "siniestros.autos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.autos", stateParams)
                },
                'siniestros.create_autos': {
                    id: 0, 
                    name: 'Creación siniestros Autos',
                    heading: "Creación siniestros Autos",
                    route: "siniestros.create_autos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.create_autos", stateParams)
                },
                'siniestros.danios': {
                    id: 0, 
                    name: 'Creación siniestros Daños',
                    heading: "Creación siniestros Daños",
                    route: "siniestros.danios", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.danios", stateParams)
                },
                'siniestros.create_danios': {
                    id: 0, 
                    name: 'Creación siniestros Daños',
                    heading: "Creación siniestros Daños",
                    route: "siniestros.create_danios", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.create_danios", stateParams)
                },
                'siniestros.auto_info': {
                    id: url.match(/siniestros\/autos\/(.*)$/) ? url.match(/siniestros\/autos\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información siniestros',
                    heading: "Información siniestros",
                    route: "siniestros.auto_info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.auto_info", {
                        siniestroId: url.match(/siniestros\/autos\/(.*)$/) ? url.match(/siniestros\/autos\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'siniestros.danio_info': {
                    id: url.match(/siniestros\/danios\/(.*)$/) ? url.match(/siniestros\/danios\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Información siniestros',
                    heading: "Información siniestros",
                    route: "siniestros.danio_info", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("siniestros.danio_info", {
                        siniestroId: url.match(/siniestros\/danios\/(.*)$/) ? url.match(/siniestros\/danios\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'comisiones.comisiones': {
                    id: 0, 
                    name: 'Comisiones Conciliar',
                    heading: "Comisiones Conciliar",
                    route: "comisiones.comisiones", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("comisiones.comisiones", stateParams)
                },
                'comisiones.consulta': {
                    id: 0, 
                    name: 'Info Comisiones',
                    heading: "Info Comisiones",
                    route: "comisiones.consulta", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("comisiones.consulta", stateParams)
                },
                'comisiones.conciliarid': {
                    id: 0, 
                    name: 'Conciliar Masivo ID',
                    heading: "Conciliar Masivo ID",
                    route: "comisiones.conciliarid", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("comisiones.conciliarid", stateParams)
                },
                'agentes.agentes': {
                    id: 0, 
                    name: 'Referenciadores',
                    heading: "Referenciadores",
                    route: "agentes.agentes", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("agentes.agentes", stateParams)
                },
                'agentes.receipts': {
                    id: 0, 
                    name: 'Referenciadores Recibos',
                    heading: "Referenciadores Recibos",
                    route: "agentes.receipts", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("agentes.receipts", stateParams)
                },
                'reportes.cobranza': {
                    id: 0, 
                    name: 'Reporte Cobranza',
                    heading: "Reporte Cobranza",
                    route: "reportes.cobranza", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.cobranza")
                },
                'reportes.auditoria': {
                    id: 0, 
                    name: 'Reporte Auditoria',
                    heading: "Reporte Auditoria",
                    route: "reportes.auditoria", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.auditoria")
                },
                'reportes.cotizaciones': {
                    id: 0, 
                    name: 'Reporte Cotizaciones',
                    heading: "Reporte Cotizaciones",
                    route: "reportes.cotizaciones", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.cotizaciones")
                },
                'reportes.renovaciones': {
                    id: 0, 
                    name: 'Reporte Renovaciones',
                    heading: "Reporte Renovaciones",
                    route: "reportes.renovaciones", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.renovaciones")
                },
                'reportes.endosos': {
                    id: 0, 
                    name: 'Reporte Endosos',
                    heading: "Reporte Endosos",
                    route: "reportes.endosos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.endosos")
                },
                'reportes.polizas': {
                    id: 0, 
                    name: 'Reporte Pólizas',
                    heading: "Reporte Pólizas",
                    route: "reportes.polizas", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.polizas")
                },
                'reportes.polizas_contributorias': {
                    id: 0, 
                    name: 'Reporte Pólizas Contributorias',
                    heading: "Reporte Pólizas Contributorias",
                    route: "reportes.polizas_contributorias", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.polizas_contributorias")
                },
                'reportes.siniestros': {
                    id: 0, 
                    name: 'Reporte Siniestros',
                    heading: "Reporte Siniestros",
                    route: "reportes.siniestros", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.siniestros")
                },
                'reportes.fianzas': {
                    id: 0, 
                    name: 'Reporte Fianzas',
                    heading: "Reporte Fianzas",
                    route: "reportes.fianzas", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.fianzas")
                },
                'reportes.fianzas_ben': {
                    id: 0, 
                    name: 'Beneficiarios',
                    heading: "Beneficiarios",
                    route: "reportes.fianzas_ben", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.fianzas_ben")
                },
                'reportes.log': {
                    id: 0, 
                    name: 'Reporte Log',
                    heading: "Reporte Log",
                    route: "reportes.log", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.log")
                },
                'reportes.task': {
                    id: 0, 
                    name: 'Reporte Tareas',
                    heading: "Reporte Tareas",
                    route: "reportes.task", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.task")
                },
                'reportes.certificates': {
                    id: 0, 
                    name: 'Reporte certificados',
                    heading: "Reporte certificados",
                    route: "reportes.certificates", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.certificates")
                },
                'reportes.cumple': {
                    id: 0, 
                    name: 'Reporte cumpleaños',
                    heading: "Reporte cumpleaños",
                    route: "reportes.cumple", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.cumple")
                },
                'reportes.cobranzafianzas': {
                    id: 0, 
                    name: 'Reporte fianzas',
                    heading: "Reporte fianzas",
                    route: "reportes.cobranzafianzas", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.cobranzafianzas")
                },
                'reportes.edoclientes': {
                    id: 0, 
                    name: 'Reporte edo. clientes',
                    heading: "Reporte edo. clientes",
                    route: "reportes.edoclientes", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.edoclientes")
                },
                'reportes.cobranza_liq': {
                    id: 0, 
                    name: 'Reporte liquidaciones',
                    heading: "Reporte liquidaciones",
                    route: "reportes.cobranza_liq", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.cobranza_liq")
                },
                'reportes.cobranza_subsec': {
                    id: 0, 
                    name: 'Reporte recibos subsecuentes',
                    heading: "Reporte recibos subsecuentes",
                    route: "reportes.cobranza_subsec", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.cobranza_subsec")
                },
                'reportes.cobranzapendiente': {
                    id: 0, 
                    name: 'Reporte recibos pendientes',
                    heading: "Reporte recibos pendientes",
                    route: "reportes.cobranzapendiente", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.cobranzapendiente")
                },
                'reportes.renovacionespendientes': {
                    id: 0, 
                    name: 'Reporte renovaciones pendientes',
                    heading: "Reporte renovaciones pendientes",
                    route: "reportes.renovacionespendientes", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.renovacionespendientes")
                },
                'reportes.adjuntos': {
                    id: 0, 
                    name: 'Reporte Adjuntos',
                    heading: "Reporte Adjuntos",
                    route: "reportes.adjuntos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.adjuntos")
                },
                'reportes.otsendosos': {
                    id: 0, 
                    name: 'Reporte OT endosos',
                    heading: "Reporte OT endosos",
                    route: "reportes.otsendosos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.otsendosos")
                },
                'reportes.polizasTitularesConyuges': {
                    id: 0, 
                    name: 'Reporte Titulares',
                    heading: "Reporte Titulares",
                    route: "reportes.polizasTitularesConyuges", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.polizasTitularesConyuges")
                },
                'reportes.conservacion': {
                    id: 0, 
                    name: 'Reporte Estadístico',
                    heading: "Reporte Estadístico",
                    route: "reportes.conservacion", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.conservacion")
                },
                'reportes.ventacruzada': {
                    id: 0, 
                    name: 'Reporte Venta Cruzada',
                    heading: "Reporte Venta Cruzada",
                    route: "reportes.ventacruzada", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.ventacruzada")
                },
                'reportes.asegurados': {
                    id: 0, 
                    name: 'Reporte Asegurados',
                    heading: "Reporte Asegurados",
                    route: "reportes.asegurados", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("reportes.asegurados")
                },
                'bibliotecas.list': {
                    id: 0, 
                    name: 'Bibliotecas',
                    heading: "Bibliotecas",
                    route: "bibliotecas.list", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("bibliotecas.list")
                },
                'bibliotecas.bibliotecas': {
                    id: 0, 
                    name: 'Bibliotecas',
                    heading: "Bibliotecas",
                    route: "bibliotecas.bibliotecas", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("bibliotecas.bibliotecas")
                },
                'bibliotecas.edit': {
                    id: 0, 
                    name: 'Edición Bibliotecas',
                    heading: "Edición Bibliotecas",
                    route: "bibliotecas.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("bibliotecas.edit")
                },
                'bibliotecas.layouts': {
                    id: 0, 
                    name: 'Layouts Bibliotecas',
                    heading: "Layouts Bibliotecas",
                    route: "bibliotecas.layouts", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("bibliotecas.layouts")
                },
                'bibliotecas.editables': {
                    id: 0, 
                    name: 'Editables Bibliotecas',
                    heading: "Editables Bibliotecas",
                    route: "bibliotecas.editables", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("bibliotecas.editables")
                },
                'campaign.list': {
                    id: 0, 
                    name: 'Campañas',
                    heading: "Campañas",
                    route: "campaign.list", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("campaign.list")
                },
                'campaign.create': {
                    id: 0, 
                    name: 'Creación Campañas',
                    heading: "Creación Campañas",
                    route: "campaign.create", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("campaign.create")
                },
                'campaign.edit': {
                    id: url.match(/campaigns\/(.*)$/) ? url.match(/campaigns\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Editar Campaña',
                    heading: "Editar Campaña",
                    route: "campaign.edit", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("campaign.edit", {
                        campaignId: url.match(/campaigns\/(.*)$/) ? url.match(/campaigns\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'mensajeria.principal': {
                    id: 0, 
                    name: 'Mensajería',
                    heading: "Mensajería",
                    route: "mensajeria.principal", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("mensajeria.principal")
                },
                'multicotizador.multicotizador': {
                    id: 0, 
                    name: 'Multicotizador Autos',
                    heading: "Multicotizador Autos",
                    route: "multicotizador.multicotizador", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("multicotizador.multicotizador")
                },
                'multicotizador.emision': {
                    id: 0, 
                    name: 'Multicotizador Emisión Autos',
                    heading: "Multicotizador Emisión Autos",
                    route: "multicotizador.emision", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("multicotizador.emision")
                },
                'multicotizador.administrador': {
                    id: 0, 
                    name: 'Multicotizador Administrador Autos',
                    heading: "Multicotizador Administrador Autos",
                    route: "multicotizador.administrador", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("multicotizador.administrador")
                },
                'multicotizador.configurador': {
                    id: 0, 
                    name: 'Multicotizador configurador ',
                    heading: "Multicotizador configurador ",
                    route: "multicotizador.configurador", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("multicotizador.configurador")
                },
                'task.task': {
                    id: 0, 
                    name: 'Tareas',
                    heading: "Tareas",
                    route: "task.task", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("task.task")
                },
                'task.admin': {
                    id: 0, 
                    name: 'Tareas Administrador',
                    heading: "Tareas Administrador",
                    route: "task.admin", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("task.admin")
                },
                'kbi.principal': {
                    id: 0, 
                    name: 'KBI',
                    heading: "KBI",
                    route: "kbi.principal", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("kbi.principal")
                },
                'config.lectura_documentos': {
                    id: 0, 
                    name: 'Documentos',
                    heading: "Documentos",
                    route: "config.lectura_documentos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("config.lectura_documentos")
                },
                'config.configuracion_filtros': {
                    id: 0, 
                    name: 'Filtros',
                    heading: "Filtros",
                    route: "config.configuracion_filtros", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("config.configuracion_filtros")
                },
                'config.edit_lectura_documentos': {
                    id: url.match(/config\/lectura-documentos\/(.*)$/) ? url.match(/config\/lectura-documentos\/(.*)$/)[1].replace('/','') : 0, 
                    name: 'Editar Documentos',
                    heading: "Editar Documentos",
                    route: "config.edit_lectura_documentos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("config.edit_lectura_documentos", {
                        configId: url.match(/config\/lectura-documentos\/(.*)$/) ? url.match(/config\/lectura-documentos\/(.*)$/)[1].replace('/','') : 0
                    })
                },
                'cedula.cedula': {
                    id: 0, 
                    name: 'Cédula',
                    heading: "Cédula",
                    route: "cedula.cedula", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("cedula.cedula")
                },
                'emails.smtp': {
                    id: 0, 
                    name: 'SMTP',
                    heading: "SMTP",
                    route: "emails.smtp", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("emails.smtp")
                },
                'emails.config': {
                    id: 0, 
                    name: 'Configuración Email',
                    heading: "Configuración Email",
                    route: "emails.config", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("emails.config")
                },
                'agenda.agenda': {
                    id: 0, 
                    name: 'Agenda',
                    heading: "Agenda",
                    route: "agenda.agenda", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("agenda.agenda")
                },
                'ibis.usuarios': {
                    id: 0, 
                    name: 'Ibis usuarios',
                    heading: "Ibis usuarios",
                    route: "ibis.usuarios", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("ibis.usuarios")
                },
                'ibis.formatos': {
                    id: 0, 
                    name: 'Formatos',
                    heading: "Formatos",
                    route: "ibis.formatos", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("ibis.formatos")
                },
                'ibis.formatosPlantillasWhatsappSiniestros': {
                    id: 0,
                    name: 'Plantillas WhatsApp Web Siniestros',
                    heading: "Plantillas WhatsApp Web (Siniestros)",
                    route: "ibis.formatosPlantillasWhatsappSiniestros",
                    event: null,
                    isVisible: true,
                    active: true,
                    href: $state.href("ibis.formatosPlantillasWhatsappSiniestros")
                },
                'ibis.directorio': {
                    id: 0, 
                    name: 'Directorio',
                    heading: "Directorio",
                    route: "ibis.directorio", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("ibis.directorio")
                },
                'ibis.red': {
                    id: 0, 
                    name: 'Red Ibis',
                    heading: "Red Ibis",
                    route: "ibis.red", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("ibis.red")
                },
                'sucursal.config': {
                    id: 0, 
                    name: 'Sucursales',
                    heading: "Sucursales",
                    route: "sucursal.config", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("sucursal.config", stateParams)
                },
                'help.manual': {
                    id: 0, 
                    name: 'Ayuda',
                    heading: "Ayuda",
                    route: "help.manual", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("help.manual", stateParams)
                },
                'help.policy': {
                    id: 0, 
                    name: 'Ayuda',
                    heading: "Ayuda",
                    route: "help.policy", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("help.policy", stateParams)
                },
                'buscador.buscador': {
                    id:  url.match(/buscador\/(.*)$/) ? url.match(/buscador\/(.*)$/)[1] : 0, 
                    name: 'Superbuscador', 
                    heading: "Superbuscador", 
                    route: "buscador.buscador", 
                    event: null, 
                    active: true, 
                    isVisible: true, 
                    href: $state.href("buscador.buscador")
                },
                'buscador.modal': {
                    id:  url.match(/buscador\/modal\/(.*)$/) ? url.match(/buscador\/modal\/(.*)$/)[1] : 0, 
                    name: 'Superbuscador Modal', 
                    heading: "Superbuscador Modal", 
                    route: "buscador.modal", 
                    event: null, 
                    active: true, 
                    isVisible: true, 
                    href: $state.href("buscador.modal")
                },
                'tablero.init': {
                    id: url.match(/tablero\/(.*)$/) ? url.match(/tablero\/(.*)$/)[1] : 0 , 
                    name: 'Tablero OTs',
                    heading: "Tablero OTs",
                    route: "tablero.init", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("tablero.init", {
                        polizaId:url.match(/tablero\/(.*)$/) ? url.match(/tablero\/(.*)$/)[1] : 0
                    })
                },
                'medicoscelulas.configuracion': {
                    id: 0, 
                    name: 'Médicos',
                    heading: "Médicos",
                    route: "medicoscelulas.configuracion", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("medicoscelulas.configuracion", {})
                },
                'agentes.estadoscuenta': {
                    id: 0, 
                    name: 'Estados de Cuenta',
                    heading: "Estados de Cuenta",
                    route: "agentes.estadoscuenta", 
                    event: null, 
                    isVisible: true, 
                    active: true, 
                    href: $state.href("agentes.estadoscuenta", {})
                },
                
                
                
            }
            var selected_state = abstract_estados[current_state]
            return selected_state
        }
        // states.findIndex(function(state){
        //     if (state.active) {
        //         console.log('-index states--',state,states)
        //         $state.go(state.route)
        //     }
        // })
        // if (appstate[]) {}
        return {
            states: states,
            getActiveTab: getActiveTab,
            estados : estados,
            getActualTab : getActualTab
        };
    }]);
})()
