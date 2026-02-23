(function () {
  
    'use strict';

    var app = angular.module('inspinia');

    app.controller('TabsCtrl', ["$scope", "appStates", "$state", "$rootScope","$localStorage", function($scope, appStates, $state, $rootScope, $localStorage,toaster) {
        var initialize = function () {
          $localStorage['tab_index'] = $localStorage.tab_index ? $localStorage.tab_index  : 0;
          $scope.appStates = appStates.states;
          appStates.states.forEach( function (appstate, index) {
            if (appstate.active){
              $scope.active_tab = index;
            }
          });
        };
        initialize();

        $scope.active = function(route){
          return $state.is(route);
        };


        $scope.tabSelected = function (route, index_tracked) {     
          if ($localStorage.tab_index == index_tracked){             
            appStates.states.forEach(function(tab) {
              if ((tab.route =='colectividades.masivos' || tab.route.indexOf('carga.') != -1)) {
                tab.active = true
                $state.go(tab.route)
              }
            })
            // toaster("Información","No puede cambiar de pestaña si esta abierta alguna de carga masiva","info");
            // return;
            if ((route.indexOf('info') != -1) || (route.indexOf('editar') != -1) || (route.indexOf('edit') != -1)) { 
              if(appStates.states[index_tracked].id !=0){
                $state.go(route)
              }
            }
            return;
          }
          $localStorage.tab_index = index_tracked;
          appStates.states.forEach(function(tab) {
            if ((tab.route =='colectividades.masivos' || tab.route.indexOf('carga.') != -1)) {
              tab.active = true
              $state.go(tab.route)
              // toaster("Información","No puede cambiar de pestaña si esta abierta alguna de carga masiva","info");
              return;
            }else{
              tab.active = false;
            }
            console.log('--tab',tab)
            return tab
          });
          appStates.states[index_tracked].active = true;
          
          $localStorage.tab_states = appStates.states;
          if (appStates.states[index_tracked] && appStates.states[index_tracked].id){
            switch (route) {
              case 'inicio.inicio' : $state.go(route);
              break;
              case 'index.main' : $state.go(route);
              break;
              case 'contratantes.list' : $state.go(route);
              break;
              case 'contratantes.main' : $state.go(route);
              break;
              case 'contratantes.create' : $state.go(route);
              break;
              case 'contratantes.info' : 
                  $state.go(route, {
                    contratanteId:appStates.states[index_tracked].id,
                    type: appStates.states[index_tracked].type
                  });
                
              break;
              case 'contratantes.edit' : 
                  $state.go(route, {
                    contratanteId:appStates.states[index_tracked].id,
                    type: appStates.states[index_tracked].type
                  });
                
              break;


              case 'grupos.grupos' : $state.go(route);
              break;
              case 'grupos.info' :
                  $state.go(route, {
                    grupoId:appStates.states[index_tracked].id
                  });
                              
              break;
              case 'grupos.edit' : 
                  $state.go(route, {
                    grupoId:appStates.states[index_tracked].id
                  });
                
              break;
              

              case 'clasificacion.clasificacion' : $state.go(route);
              break;

              case 'celulacontractor.celulacontractor' : $state.go(route);
              break;

              case 'grupinglevel.grupinglevel' : $state.go(route);
              break;

              case 'polizas.table' : $state.go(route);
              break;
              case 'polizas.plantillas' : $state.go(route);
              break;
              case 'adjuntosinternos.list' : $state.go(route);
              break;
              case 'recordatorios.automaticos' : $state.go(route);
              break;
              case 'recordatorios.libres' : $state.go(route);
              break;
              case 'recordatorios.desde_registros' : $state.go(route);
              break;
              case 'polizas.create' : $state.go(route);
              break;
              case 'polizas.info' : 
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id
                  });
                              
              break;
              case 'polizas.editar' :
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'compartir.create' : $state.go(route, {
                shareId:appStates.states[index_tracked].id
              });
              break;

              case 'colectividades.main' : $state.go(route);
              break;
              case 'colectividades.table' : $state.go(route);
              break;
              case 'colectividades.info' : 
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'colectividades.edit' : 
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'colectividades.convertirPoliza' : 
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id, status:appStates.states[index_tracked].status
                  });
                              
              case 'recordatorios.automaticos_detalle' : $state.go(route, {
                id:appStates.states[index_tracked].id
              });
              break;
              case 'colectividades.renewal' : $state.go(route, {
                polizaId:appStates.states[index_tracked].id
              });
              break;
              case 'colectividades.masivos' : $state.go(route);
              break;

              case 'flotillas.flotillas' : $state.go(route);
              break;
              case 'flotillas.info' : 
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id
                  });
                              
              break;
              case 'flotillas.edit' : 
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id});
                  
              break;
              case 'flotillas.renewal' : 
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id});
                
              break;
              case 'flotillas.details' :  
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id});
                
              break;

              
              case 'fianzas.fianzas' : $state.go(route);
              break;   
              case 'fianzas.reclist' : $state.go(route);
              break;             
              case 'fianzas.reclinf' : $state.go(route, {
                claimId:appStates.states[index_tracked].id
              });
              break;
              case 'fianzas.colectividades' : $state.go(route);
              break;  
              case 'fianzas.edit' :                  
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id});
                
              break;
              case 'fianzas.renewal' :                  
                  $state.go(route, {
                  polizaId:appStates.states[index_tracked].id,
                  renovacion:appStates.states[index_tracked].renovacion});
                              
              break;
              case 'fianzas.reissue' :                 
                  $state.go(route, {
                  polizaId:appStates.states[index_tracked].id});
                  
              break;
              case 'fianzas.details' :
                  $state.go(route, {
                  polizaId:appStates.states[index_tracked].id});
                  
              break;
              case 'fianzas.reclamaciones' : $state.go(route);
              break; 
              case 'fianzas.list' : $state.go(route);
              break;   
              case 'fianzas.info' : 
                  $state.go(route, {
                  polizaId:appStates.states[index_tracked].id});
                  
              break;
              case 'fianzas.pprovlist' : $state.go(route);
              break;
              case 'fianzas.pprovnew' : $state.go(route);
              break;
              case 'fianzas.editar' : 
                  $state.go(route, {
                  polizaId:appStates.states[index_tracked].id});
                
              break; 
              case 'fianzas.renovar' : 
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id,
                    renovacion:appStates.states[index_tracked].renovacion
                  });
                              
              break; 
              case 'fianzas.reexpedir' : 
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id,
                    reexpedir:appStates.states[index_tracked].reexpedir,
                  });
                              
              break;               
              case 'reclamacion.edit' : 
                  $state.go(route, {
                    reclId:appStates.states[index_tracked].id,
                  });
                
              break; 
              case 'fianzas.pprovinfo' : 
                  $state.go(route, {
                    contratanteId:appStates.states[index_tracked].id,
                    type: appStates.states[index_tracked].type
                  });
                
              break; 
              case 'fianzas.pprovedit' : 
                  $state.go(route, {
                    contratanteId:appStates.states[index_tracked].id,
                    type: appStates.states[index_tracked].type
                  });
                
              break; 


              case 'endorsement.endorsement' : $state.go(route);
              break;
              case 'endorsement.lista' : $state.go(route);
              break;
              case 'endorsement.collectivity' : $state.go(route);
              break;
              case 'endorsement.info' : 
                  $state.go(route, {
                    endosoId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'endorsement.details' :
                  $state.go(route, {
                    endosoId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'endorsement.edit' : 
                  $state.go(route, {
                    endosoId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'endorsement.collective' : $state.go(route);
              break;
              case 'endorsement.update' : 
                  $state.go(route, {
                    endosoId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'endorsement.fianza' :                 
                  $state.go(route, {
                    fianzaId:appStates.states[index_tracked].id
                  });
                              
              break;

              
              case 'renovaciones.renovaciones' : $state.go(route);
              break;
              case 'renovaciones.polizas' :                              
                  $state.go(route, {
                    polizaId:appStates.states[index_tracked].id
                  });
                              
              break;


              case 'cobranzas.cobranzas' : $state.go(route);
              break;
              case 'cobranzas.recibospendientes' : $state.go(route);
              break;
              case 'cobranzas.folios' : $state.go(route);
              break;
              case 'cobranzas.bonos' : $state.go(route);
              break;
              case 'cobranzas.cobranzasmasivo' : $state.go(route);
              break;
              case 'cobranzas.repositorio' : $state.go(route);
              break;


              case 'aseguradoras.aseguradoras' : $state.go(route);
              break;
              case 'aseguradoras.edit' :
                  $state.go(route, {
                    aseguradoraId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'aseguradoras.info' :                 
                  $state.go(route, {
                    aseguradoraId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'aseguradoras.ramos' :                  
                  $state.go(route, {
                    aseguradoraId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'aseguradoras.subramos' :                                  
                  $state.go(route, {
                    aseguradoraId:appStates.states[index_tracked].id,
                    ramosId:appStates.states[index_tracked].ramosId,
                  });
                              
              break;


              case 'carga.contractor' : $state.go(route);
              break;
              case 'carga.poliza' : $state.go(route);
              break;
              case 'carga.norenovacion' : $state.go(route);
              break;
              case 'carga.pgrupo' : $state.go(route);
              break;
              case 'carga.certificado' : $state.go(route);
              break;
              case 'carga.flotilla' : $state.go(route);
              break;
              case 'carga.recibos' : $state.go(route);
              break;
              case 'carga.catalogo' : $state.go(route);
              break;
              case 'carga.cancelacion' : $state.go(route);
              break;
              case 'carga.infocontributoria' : $state.go(route);
              break;



              case 'paquetes.paquetes' : $state.go(route);
              break;
              case 'paquetes.edit' :                                                   
                  $state.go(route, {
                    paqueteId:appStates.states[index_tracked].id
                  });
                              
              break;


              case 'coberturas.coberturas' : $state.go(route);
              break;


              case 'cotizacion.cotizacion' : $state.go(route);
              break;


              case 'siniestros.lista' : $state.go(route);
              break;
              case 'siniestros.plantillas' : $state.go(route);
              break;
              case 'siniestros.accidentes' : $state.go(route);
              break;
              case 'siniestros.create_accidentes' : $state.go(route);
              break;
              case 'siniestros.damage' : $state.go(route);
              break;
              case 'siniestros.vida' : $state.go(route);
              break;
              case 'siniestros.create_vida' : $state.go(route);
              break;
              case 'siniestros.info' : 
                  $state.go(route, {
                    siniestroId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'siniestros.vida_info' : 
                  $state.go(route, {
                    siniestroId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'siniestros.edit' : 
                  $state.go(route, {
                    siniestroId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'siniestros.accidentesInfo' : 
                  $state.go(route, {
                    siniestroId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'siniestros.vida_info' : 
                  $state.go(route, {
                    siniestroId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'siniestros.autos' : $state.go(route);
              break;
              case 'siniestros.danios' : $state.go(route);
              break;
              case 'siniestros.create_autos' : $state.go(route);
              break;
              case 'siniestros.create_danios' : $state.go(route);
              break;
              case 'siniestros.auto_info' : 
                  $state.go(route, {
                    siniestroId:appStates.states[index_tracked].id
                  });
                
              break;
              case 'siniestros.danio_info' :
                  $state.go(route, {
                    siniestroId:appStates.states[index_tracked].id
                  });
                
              break;


              case 'comisiones.comisiones' : $state.go(route);
              break;
              case 'comisiones.consulta' : $state.go(route);
              break;
              case 'comisiones.conciliarid' : $state.go(route);
              break;


              case 'agentes.agentes' : $state.go(route);
              break;
              case 'agentes.administration' : $state.go(route);
              break;
              case 'agentes.receipts' : $state.go(route);
              break;
              case 'agentes.estadoscuenta' : $state.go(route);
              break;


              case 'reportes.auditoria' : $state.go(route);
              break;
              case 'reportes.cobranza' : $state.go(route);
              break;
              case 'reportes.cotizaciones' : $state.go(route);
              break;
              case 'reportes.renovaciones' : $state.go(route);
              break;
              case 'reportes.endosos' : $state.go(route);
              break;
              case 'reportes.polizas' : $state.go(route);
              break;
              case 'reportes.polizas_contributorias' : $state.go(route);
              break;
              case 'reportes.siniestros' : $state.go(route);
              break;
              case 'reportes.fianzas' : $state.go(route);
              break;
              case 'reportes.fianzas_ben' : $state.go(route);
              break;
              case 'reportes.log' : $state.go(route);
              break;
              case 'reportes.task' : $state.go(route);
              break;
              case 'reportes.certificates' : $state.go(route);
              break;
              case 'reportes.cumple' : $state.go(route);
              break;
              case 'reportes.cobranzafianzas' : $state.go(route);
              break;
              case 'reportes.edoclientes' : $state.go(route);
              break;
              case 'reportes.cobranza_liq' : $state.go(route);
              break;
              case 'reportes.cobranza_subsec' : $state.go(route);
              break;
              case 'reportes.cobranzapendiente' : $state.go(route);
              break;
              case 'reportes.renovacionespendientes' : $state.go(route);
              break;
              case 'reportes.otsendosos' : $state.go(route);
              break;
              case 'reportes.polizasTitularesConyuges' : $state.go(route);
              break;
              case 'reportes.conservacion' : $state.go(route);
              break;
              case 'reportes.ventacruzada' : $state.go(route);
              break;
              case 'reportes.adjuntos' : $state.go(route);
              break; 
              case 'reportes.asegurados' : $state.go(route);
              break;  


              case 'bibliotecas.list' : $state.go(route);
              break;
              case 'bibliotecas.bibliotecas' : $state.go(route);
              break;
              case 'bibliotecas.edit' : $state.go(route);
              break;
              case 'bibliotecas.layouts' : $state.go(route);
              break;
              case 'bibliotecas.editables' : $state.go(route);
              break;


              case 'campaign.list' : $state.go(route);
              break;
              case 'campaign.create' : $state.go(route);
              break;
              case 'campaign.edit' : 
                  $state.go(route, {
                    campaignId:appStates.states[index_tracked].id});
                
              break;


              case 'mensajeria.principal' : $state.go(route);
              break;


              case 'multicotizador.multicotizador' : $state.go(route);
              break;
              case 'multicotizador.emision' : $state.go(route);
              break;
              case 'multicotizador.administrador' : $state.go(route);
              break;


              case 'task.task' : $state.go(route);
              break;
              case 'task.admin' : $state.go(route);
              break;


              case 'kbi.principal' : $state.go(route);
              break;


              case 'config.configuracion_filtros' : $state.go(route);
              break;
              case 'config.lectura_documentos' : $state.go(route);
              break;
              case 'config.edit_lectura_documentos' : 
                  $state.go(route, {
                  id:appStates.states[index_tracked].id});
                
              break;


              case 'cedula.cedula' : $state.go(route);
              break;


              case 'emails.smtp' : $state.go(route);
              break;
              case 'emails.config' : $state.go(route);
              break;
              case 'emails.whatsapp' : $state.go(route);
              break;


              case 'agenda.agenda' : $state.go(route);
              break;


              case 'ibis.usuarios' : $state.go(route);
              break;
              case 'ibis.formatos' : $state.go(route);
              break;
              case 'ibis.directorio' : $state.go(route);
              break;
              case 'ibis.red' : $state.go(route);
              break;


              case 'sucursal.config' : $state.go(route);
              break;


              case 'help.manual' : $state.go(route);
              break;
              case 'help.policy' : $state.go(route);
              break;    


              case 'buscador.buscador' : $state.go(route, {
                cadena:appStates.states[index_tracked].id
              });
              break;
              case 'buscador.modal' : $state.go(route, {
                cadena:appStates.states[index_tracked].id
              });
              break;
              case 'medicoscelulas.configuracion' : $state.go(route);
              break;


              default:  $state.go('index.main');
              break;
          }
            
          } else {
            $state.go(route);
          }
        };

        $scope.deleteTab = function(index){
          if (appStates.states.length == 1) return;
          if (index || index == 0){
            appStates.states.splice(index,1);
            console.log('------x-x-x-----',index,appStates.states[appStates.states.length-1],appStates)
            $state.go(appStates.states[appStates.states.length-1].route);
          }
        }

        $scope.addTab = function () {
          appStates.states.push(
            { name: 'Dashboard', heading: 'Dashboard', route: 'index.main', active: true, isVisible: true, href: $state.href('index.main')}
            );
          };
    }]);
    

    app.directive('ngRightClick', function($parse) {
      return function(scope, element, attrs) {
          var fn = $parse(attrs.ngRightClick);
          element.bind('contextmenu', function(event) {
              scope.$apply(function() {
                  event.preventDefault();
                  fn(scope, {$event:event});
              });
          });
      };
  });


})()