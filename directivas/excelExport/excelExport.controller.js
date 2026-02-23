angular.module('inspinia')
.directive('excelExport', [function () {


  return {
    restrict: 'A',
    scope: {
    	filename: "@",
        data: "=exportData"
    },
    replace: true,
    template: '<button class="btn btn-primary btn-ef btn-ef-3 btn-ef-3c mb-10" ng-click="download()">Export to Excel <i class="fa fa-download"></i></button>',
    link: function (scope, element) {
    	
    	// scope.download = function() {

            // console.log('XLSX', XLSX);

            // var data = scope.data;

            var wb = XLSX.utils.json_to_sheet(scope.data);

            var workbook = {
              "SheetNames": [
                "Plough &amp; Stars"
              ],
              "Sheets": {
                "Plough &amp; Stars": wb,
                "!ref": wb['!ref']
                }
            };

            var wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
            function s2ab(s) {
                console.log('s', s.length);
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);

                for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                    console.log('buf', buf);
                return buf;
            }

            saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream"}), "Reporte_" + scope.filename +'.xlsx');

    	// };
    
    }
  };
    
}]);



