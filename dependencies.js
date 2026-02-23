(function(){
    'use strict';

    // TODO remove
    angular.module('inspinia')
        .constant('moduleInjection', {
            angularDatepicker: [
                {
                    files: ['../bower_components/angular-datepicker/dist/angular-datepicker.css',
                            '../bower_components/angular-datepicker/dist/angular-datepicker.js']
                            // [{type: 'text/css', path: '../bower_components/angular-datepicker/dist/angular-datepicker.css'},
                            //         {type: 'application/javascript', path: '../bower_components/angular-datepicker/dist/angular-datepicker.js'}]
                }
            ],
            angularFileUpload: [
                {
                    files: ['../bower_components/angular-file-upload/dist/angular-file-upload.min.js']
                }
            ],
            angularLocale: [
                {
                  files: ['../bower_components/angular-i18n/angular-locale_es-mx.js']
                }
            ],
            jQuery: [
                {
                    // files: [{type: 'text/css', path: 'components/common/jquery.steps.css'}]
                    files: ['../bower_components/jquery/dist/jquery.js',
                            '../bower_components/angular-typeahead/dist/angular-typeahead.js']
                }
            ],
            moment: [
                {
                  files: ['../bower_components/moment/moment.js']
                }
            ],
            selectize: [
                {
                    files: ['../bower_components/selectize/dist/css/selectize.css',
                            '../bower_components/selectize/dist/js/selectize.js']
                            // [{type: 'text/css', path: '../bower_components/selectize/dist/css/selectize.css'},
                            //         {type: 'application/javascript', path: '../bower_components/selectize/dist/js/selectize.js'}]
                }
            ],
            toaster: [
                {
                    name: 'toaster',
                    files: ['../bower_components/AngularJS-Toaster/toaster.min.css',
                            '../bower_components/AngularJS-Toaster/toaster.min.js']
                }
            ],
            angulari18n: [
                {
                    name: 'angular-i18n',
                    files: ['../bower_components/angular-i18n/angular-locale_es-mx.js']
                }
            ],
            uiSelect: [
                {
                    files: ['../bower_components/ui-select/dist/select.js',
                            '../bower_components/ui-select/dist/select.css']
                }
            ],
            base64: [
              {
                files: ['../bower_components/angular-base64-upload/dist/angular-base64-upload.min.js']
              }
            ],
            pdfmake: [
                {
                    files: ['../bower_components/pdfmake/build/pdfmake.min.js',
                            '../bower_components/pdfmake/build/vfs_fonts.js']
                }
            ]
        });
})();
