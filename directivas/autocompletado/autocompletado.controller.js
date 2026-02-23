var app = angular.module('inspinia')
.directive('autocomplete', [function () {
    return {
        restrict: 'EA',
        scope: {
          model : '=',
          datasource: '=',
          url: '@',
          typeaheadOnSelect: '=',
          change: '&',
          id : '@',
          required: '='
        },
        // template: '<div class="autocomplete-container" focusout="hideMenu()">' +
        //             '<input id="id"  class="form-control col-sm-12" ng-change="onChange()" ng-model="model.val" type="text" ng-required="required">' +
        //             '<ul ng-if="showData" ng-hide="!datasource.length" class="ul-content">' +
        //               '<li ng-repeat="item in datasource" class="item-list" ng-mousedown="select_item(item)" >' +
        //                 '<a class="list-item-text"> {{ item.label }} </a>' +
        //               '</li>' +
        //           '  </ul>' +
        //           '</div>',
        // template: '<div class="autocomplete-container" focusout="hideMenu()">' +
        //             '<input id="id"  class="form-control col-sm-12" ng-change="onChange()" ng-model="model.val" type="text" ng-required="required">' +
        //             '<ul ng-if="showData" ng-hide="!datasource.length" class="ul-content">' +
        //               '<li ng-repeat="item in datasource" class="item-list" ng-mousedown="select_item(item)" >' +
        //                 '<a class="list-item-text" style="background:{{}}"> {{ item.label }} </a>' +
        //               '</li>' +
        //           '  </ul>' +
        //           '</div>',
        template:
          '<div class="autocomplete-container" ng-focusout="hideMenu()">' +
              '<input id="{{uniqueId}}" class="form-control col-sm-12" ' +
                    'ng-change="onChange()" ' +
                    'ng-model="model.val" ' +
                    'type="text" ' +
                    'ng-required="required">' +
              '<ul ng-if="showData" ng-hide="!datasource.length" class="ul-content">' +
                  '<li ng-repeat="item in datasource" class="item-list" ng-mousedown="select_item(item)">' +
                      '<a class="list-item-text">{{ item.label }}</a>' +
                  '</li>' +
              '</ul>' +
          '</div>',
        link: function(scope, element, $watch) {

          var count = 0;
          scope.uniqueId = 'autocomplete-' + Math.random().toString(36).substr(2, 9);

          $('#id').keydown(function() {
            if(scope.datasource){
              if(event.keyCode == 40){ //abajo
                if(count < scope.datasource.length){
                  console.log(scope.datasource[count]);
                  var bgc = {"background": "#1b84c7"};
                  count += 1;
                }
              }
              else if(event.keyCode == 38){ //arriba
                if(count > 1){
                  count -= 1;
                  console.log(scope.datasource[count - 1]);
                }
              }
              else if(event.keyCode == 9){
                scope.model.id = scope.datasource[count - 1].id;
                scope.model.val = scope.datasource[count - 1].label;
                scope.model.value = scope.datasource[count - 1].value;
                scope.showData = false;
              }
            }
          });

          scope.onChange = function () {
            scope.change();
            scope.showData = true;
          };

          scope.hideMenu = function() {
            scope.showData = false;
          }

          scope.select_item = function(parItem) {
            if(parItem) {
              scope.showData = false;
              scope.model.val = parItem.label;
              scope.model.value = parItem.value;
              if(parItem.id){
                scope.model.id = parItem.id;
              }
              if(parItem.document_type){
                scope.model.document_type = parItem.document_type;
              }
              if(parItem.type){
                scope.model.type = parItem.type;
              }
              if(parItem.url){
                scope.model.url = parItem.url;
              }
              if(parItem.subgrupos){
                scope.model.subgrupos = parItem.subgrupos;
              }
              scope.datasource.length = 0;
            } else {
              scope.showData = false;
            }
          };

        }
      }
    }]
)
.directive('focusout', ['$parse', function($parse) {
      return {
        compile: function($element, attr) {
          var fn = $parse(attr.focusout);
          return function handler(scope, element) {
            element.on('focusout', function(event) {
              scope.$apply(function() {
                 fn(scope, {$event:event});
              });
            });
          };
        }
      };
}]);
