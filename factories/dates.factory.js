(function () {

  'use-strict';

  var app = angular.module('inspinia');

  app.factory('datesFactory', [function() {

    var dates = {};

    dates.mesDiaAnio = function (parDate) {

        var d = new Date(dates.toDate (parDate));
        var date = (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
        return date;

    };

    dates.toDate = function (dateStr) {

      var dateString = dateStr; // Oct 23
      var dateParts = dateString.split("/");
      var dateObject = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]); // month is 0-based

      return dateObject;

    }
    dates.convertDate = function(inputFormat) {
      // console.log('fecha original',inputFormat)
      // function pad(s) { return (s < 10) ? '0' + s : s; }
      // var d_uno = new Date(inputFormat);
      // var fecha = new Date(inputFormat);
      // if (fecha.getUTCHours() <=11){
      //   fecha.setHours(fecha.getHours()+12);
      // }else{
      //   fecha.setHours(fecha.getHours()+5);        
      // }
      // var d = fecha
      // // var d = new Date(inputFormat).toISOString()//prueba
      // // console.log('-fecha 2',d,new Date(d.toLocaleString()))
      // var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      // return date;
      function pad(s) { return (s < 10) ? '0' + s : s; }
      var d = new Date(inputFormat);
      var date = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
      return date;
    }
    

    dates.getAge = function (dateString) {

        var today = new Date();
        var birthDate = new Date(dates.toDate (dateString));
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) 
        {
            age--;
        }
        
        return age;
    }

    return dates;

  }]);

}());