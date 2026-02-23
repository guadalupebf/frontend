var app = angular.module('inspinia')
.directive("fileread", [function () {
    return {
        require: 'ngModel',
        scope: {
            fileread: "=",
            ngModel: "="
        },
        link: function (scope, element, attributes, ngModel) {

            $(element).on('change', function(changeEvent) {

                var files = changeEvent.target.files;
                
                if (files.length) {
                  var r = new FileReader();
                  r.onload = function(e) {

                    var data = e.target.result;
                    var cfb = XLS.CFB.read(data, {type: 'binary'});
                    var wb = XLS.parse_xlscfb(cfb);
                    // Loop Over Each Sheet
                    var data = {};
                    wb.SheetNames.forEach(function(sheetName) {
                        // Obtain The Current Row As CSV
                        // console.log('hoja', sheetName);
                        var sCSV = XLS.utils.make_csv(wb.Sheets[sheetName]);   
                        var oJS = XLS.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);   
                        // console.log(oJS);
                        data[sheetName] = oJS;
                        // console.log(scope.model);
                        
                    });
                    //TODO: retornar data
                    // console.log('data', data);
                    ngModel.$setViewValue(data);
                    ngModel.$render();

                  };
                  r.readAsBinaryString(files[0]);
                }
            });
        }
    }
}]);