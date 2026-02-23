(function () {

  'use-strict';

  var app = angular.module('inspinia');

  app.factory('notesFactory', ['$http','datesFactory','helpers','SweetAlert', 'MESSAGES',function($http,datesFactory,helpers,SweetAlert, MESSAGES) {

    var notesFactory = {};

    notesFactory.updateFieldD = function (policy, infoNotes, actual_receipt) {
      var credit_notes = []
      var initDate = new Date(policy.init_date);
      var endDate = new Date(policy.end_date);
      var prima_neta = parseFloat(infoNotes.p_neta);
      var prima_total = parseFloat(infoNotes.p_total);
      var rpf = parseFloat(infoNotes.rpf);
      var gastos_expedicion = parseFloat(infoNotes.gastos_expedicion);
      var sub_total_ = (parseFloat(prima_neta) + parseFloat(rpf) + parseFloat(gastos_expedicion)).toFixed(2)
      if (policy.subramo.subramo_name == 'Vida') {
        var iva = 0
      }else{
        if (infoNotes.iva) {
          var iva = parseFloat(infoNotes.iva).toFixed(2)
        }else{
          // var iva = parseFloat((parseFloat(infoNotes.p_neta) * 0.16)).toFixed(2)  
          var iva = parseFloat(subtotal_) * 0.16;
        }      
      }

      if (policy.comision_percent) {
        var comision = parseFloat((parseFloat(infoNotes.p_neta) * (parseFloat(policy.comision_percent) /100))).toFixed(2) 
        if ((isNaN(comision)) || comision == undefined || comision == '' || comision == ""){
          var comision = 0
        } 
      }else{
        var comision = 0
      }
      if (comision == "") {
        comision = 0
      }
      // var iva = parseFloat(infoNotes.iva);
      // ------------------------------    
      var init_poliza = new Date(policy.start_of_validity);
      var end_poliza = new Date(policy.end_of_validity);

      var init_endoso = new Date(policy.init_date);
      var end_endoso = new Date(policy.end_date);

      if(!actual_receipt){
        for(var i = 0; i < infoNotes.num_notas; i++){
          var obj = {
            folio: (i + 1).toString(),
            prima_neta: -((prima_neta / infoNotes.num_notas).toFixed(2)),
            gastos_expedicion: -((gastos_expedicion / infoNotes.num_notas).toFixed(2)),
            rpf: -((rpf / infoNotes.num_notas).toFixed(2)),
            iva: -((iva / infoNotes.num_notas).toFixed(2)),
            comision: -((comision / infoNotes.num_notas).toFixed(2)),
            sub_total: -(((prima_neta + rpf  + gastos_expedicion) / infoNotes.num_notas).toFixed(2)),
            prima_total: -((prima_total / infoNotes.num_notas).toFixed(2)),
            fecha_inicio: new Date(infoNotes.fecha_inicio),
            fecha_fin: new Date(infoNotes.endDate),
            initDate: new Date(infoNotes.fecha_inicio),
            endDate : new Date(infoNotes.endDate)
          }

          credit_notes.push(obj)
        }
        var init_poliza = convertDate(policy.start_of_validity)
        if(infoNotes.num_notas != 0){
          if (policy.aseguradora) {
            if (datesFactory.toDate(((policy.init_date))) < datesFactory.toDate(convertDate(policy.start_of_validity))) {
              SweetAlert.swal("Vigencia de Endoso","Fechas de endoso no están en el rango de vigencia de la póliza", "info");
              return;
            }else if (datesFactory.toDate((policy.init_date)) < datesFactory.toDate(init_poliza)) {
               SweetAlert.swal("Fechas de vigencia de Endoso","Fechas de endoso no están en el rango de vigencia de la póliza", "info");
              return; 
            }
          }
        }

        var m=0;
        var c = 0;
        if (policy.recibos_poliza) {
          
          for (var i = 0; i < policy.recibos_poliza.length; i++) {
            
            if (policy.recibos_poliza[i].receipt_type ==1) {
              
              if(datesFactory.toDate(policy.init_date )>= datesFactory.toDate(convertDate(policy.recibos_poliza[i].fecha_inicio) )&& (datesFactory.toDate(policy.init_date )< datesFactory.toDate(convertDate(policy.recibos_poliza[i].fecha_fin)))){
                
                if (m == 0) {
                  credit_notes[m].fecha_inicio = datesFactory.toDate(policy.init_date);
                  credit_notes[m].fecha_fin = policy.recibos_poliza[i].fecha_fin;
                  credit_notes[m].initDate = datesFactory.toDate(policy.init_date);
                  credit_notes[m].endDate = policy.recibos_poliza[i].fecha_fin;
                  credit_notes[m].vencimiento = policy.recibos_poliza[i].vencimiento;
                  credit_notes[m].recibo_numero = m + 1;
                  m = m +1;                
                  c = i + 1;
                }

              }else if(m > 0 && credit_notes[m]){
                credit_notes[m].fecha_inicio = policy.recibos_poliza[i].fecha_inicio;
                credit_notes[m].fecha_fin = policy.recibos_poliza[i].fecha_fin;
                credit_notes[m].initDate = policy.recibos_poliza[i].fecha_inicio;
                credit_notes[m].endDate = policy.recibos_poliza[i].fecha_fin;
                credit_notes[m].vencimiento = policy.recibos_poliza[i].vencimiento;
                credit_notes[m].recibo_numero = m + 1;
                m=m+1;
                c=i+1;
              }
            }
          } 
        }  
        if((credit_notes)){
          
          credit_notes.forEach(function(cred, cred_index) {
            
            if (cred.fecha_inicio == 'Invalid Date') {
              cred.fecha_inicio = '';
              cred.fecha_fin = '';
              cred.initDate = '';
              cred.endDate = '';
              SweetAlert.swal("Fechas de vigencia: Notas de Crédito",MESSAGES.INFO.VIGENCYNOTECREDITWRITE, "info");
            } else{
              cred.fecha_inicio = cred.fecha_inicio;
              cred.fecha_fin = cred.fecha_fin;
              cred.initDate = convertDate(cred.fecha_inicio);
              cred.endDate = convertDate(cred.fecha_fin);
            }
          });          
        }

        return credit_notes;

      } else {
        credit_notes.push(actual_receipt);
        var endDate = datesFactory.toDate(policy.end_date)
        var initDate = datesFactory.toDate(policy.init_date)
        var prima_neta = parseFloat(infoNotes.p_neta - (-actual_receipt.prima_neta));
        var rpf = parseFloat(infoNotes.rpf - (-actual_receipt.rpf));
        var gastos_expedicion = parseFloat(infoNotes.gastos_expedicion - (-actual_receipt.gastos_expedicion));
        var iva = parseFloat(infoNotes.iva - (-actual_receipt.iva));

        var num_notas = infoNotes.num_notas - 1;
        for(var i = 0; i < num_notas; i++){
          var obj = {
            folio: (i + 1).toString(),
            prima_neta: -(prima_neta / num_notas),
            gastos_expedicion: -(gastos_expedicion / num_notas),
            rpf: -(rpf / num_notas).toFixed(2),
            iva: -(iva / num_notas).toFixed(2),
            sub_total: -((prima_neta + rpf  + gastos_expedicion) / num_notas).toFixed(2),
            prima_total: -((prima_neta + rpf + iva + gastos_expedicion) / num_notas).toFixed(2)
          }
          obj.fecha_inicio = datesFactory.convertDate(initDate);
          obj.vencimiento = datesFactory.convertDate(initDate) ? datesFactory.convertDate(initDate) : null;
          // obj.vencimiento = datesFactory.convertDate(vencimiento_date) ? datesFactory.convertDate(vencimiento_date) : null;

          obj.startDate = datesFactory.convertDate(initDate);
          obj.endingDate = datesFactory.convertDate(endDate);
          obj.fecha_fin = datesFactory.convertDate(endDate);

          initDate = new Date(endDate);

          credit_notes.push(obj)
        }
        var m=0;
        var c = 0;
        if (policy.recibos_poliza) {
          for (var i = 0; i < policy.recibos_poliza.length; i++) {
            if (policy.recibos_poliza[i].receipt_type ==1) {
              if(datesFactory.toDate(policy.init_date )>= datesFactory.toDate(convertDate(policy.recibos_poliza[i].fecha_inicio) )&& (datesFactory.toDate(policy.init_date )< datesFactory.toDate(convertDate(policy.recibos_poliza[i].fecha_fin)))){
              // if((policy.init_date )>= (convertDate(policy.recibos_poliza[i].fecha_inicio) )&& ((policy.init_date )< (convertDate(policy.recibos_poliza[i].fecha_fin)))){
                if (m == 0) {
                  credit_notes[m].fecha_inicio = datesFactory.toDate(policy.init_date);
                  credit_notes[m].fecha_fin = policy.recibos_poliza[i].fecha_fin;
                  credit_notes[m].initDate = datesFactory.toDate(policy.init_date);
                  credit_notes[m].endDate = policy.recibos_poliza[i].fecha_fin;
                  credit_notes[m].vencimiento = policy.recibos_poliza[i].vencimiento;
                  credit_notes[m].recibo_numero = m + 1;
                  m = m +1;                
                  c = i + 1;
                }else{

                }

              }else if(m > 0 && credit_notes[m]){
                credit_notes[m].fecha_inicio = policy.recibos_poliza[i].fecha_inicio;
                credit_notes[m].fecha_fin = policy.recibos_poliza[i].fecha_fin;
                credit_notes[m].initDate = policy.recibos_poliza[i].fecha_inicio;
                credit_notes[m].endDate = policy.recibos_poliza[i].fecha_fin;
                credit_notes[m].vencimiento = policy.recibos_poliza[i].vencimiento;
                credit_notes[m].recibo_numero = m + 1;
                m=m+1;
                c=i+1;
              }
            }
          }
        }   
        if((credit_notes)){
          credit_notes.forEach(function(cred, cred_index) {
            if ((cred.fecha_inicio == 'Invalid Date') || (!cred.initDate)) {
              cred.fecha_inicio = '';
              cred.fecha_fin = '';
              cred.initDate = '';
              cred.endDate = '';
              SweetAlert.swal("Fechas de vigencia: Notas de Crédito","Agregue manualmente", "info");
            }else{
              cred.fecha_inicio = cred.fecha_inicio;
              cred.fecha_fin = cred.fecha_fin;
              cred.initDate = convertDate(cred.fecha_inicio);
              cred.endDate = convertDate(cred.fecha_fin);
            }
          });          
        }
        
    	  return credit_notes;
      }
        

    };
    function convertDate(inputFormat, indicator) {
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      if(indicator){
        var date = [pad(d.getDate()+1), pad(d.getMonth()+1), d.getFullYear()].join('/');
      } else {
        var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      }

      return date;
    }
    function toDate(dateStr) {
      var dateString = dateStr; // Oct 23
      var dateParts = dateString.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

      return dateObject;

    }

    return notesFactory;

  }]);

}());