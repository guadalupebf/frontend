'use strict';

//Directive used to set metisMenu and minimalize button
    var app = angular.module('inspinia');

    app.directive('uploadTemplate', function () {
        return {
            restrict: 'EA',
            templateUrl: 'templates/upload.html',
            controller: function ($scope, $element) {}
        };
    });

    app.directive('naturalContractors', function () {
        return {
            restrict: 'EA',
            templateUrl: 'app/contratantes/contratantes.natural.html',
            controller: function ($scope, $element) {}
        };
    });

    app.directive('juridicalContractors', function () {
        return {
            restrict: 'EA',
            templateUrl: 'app/contratantes/contratantes.juridical.html',
            controller: function ($scope, $element) {}
        };
    });
    app.directive('sideNavigation', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                // Call metsi to build when user signup
                scope.$watch('authentication.user', function() {
                    $timeout(function() {
                        element.metisMenu();
                    });
                });

            }
        };
    });

    app.directive('intTelNumber', function() {
       return {
       // Restrict it to being an attribute
       restrict: 'A',
       // responsible for registering DOM listeners as well as updating the DOM
       link: function (scope, element, attrs) {
      scope.$watch('loaded', function () {
       if (scope.loaded == true) {

       // apply plugin
       element.intlTelInput(scope.options);
       //validate loaded number
       var countryCode = element[0].nextSibling.children[0].children[0].className.split(" ")[1];
       scope.validateTelephoneNumber(element[0].value, countryCode);

       }});
      }
       }
      });

    app.directive('autoInput', function($timeout) {
        return function(scope, iElement, iAttrs) {
                iElement.autocomplete({
                    source: scope[iAttrs.uiItems],
                    select: function() {
                        $timeout(function() {
                          iElement.trigger('input');
                        }, 0);
                    }
                });
        };
    });

    app.directive('minimalizaSidebar', function ($timeout) {
        return {
            restrict: 'A',
            template: '<a class="btn btn-outline btn-menu btn-default" href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
            controller: function ($scope, $element) {
                $scope.minimalize = function () {
                    angular.element('body').toggleClass('mini-navbar');
                    if (!angular.element('body').hasClass('mini-navbar') || angular.element('body').hasClass('body-small')) {
                        // Hide menu in order to smoothly turn on when maximize menu
                        angular.element('#side-menu').hide();
                        // For smoothly turn on menu
                        $timeout(function () {
                            angular.element('#side-menu').fadeIn(500);
                        }, 100);
                    } else {
                        // Remove all inline style from jquery fadeIn function to reset menu state
                        angular.element('#side-menu').removeAttr('style');
                    }
                };
            }
        };
    });
    app.directive('iboxTools', function($timeout) {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: 'app/components/common/ibox_tools.html',
            controller: function($scope, $element) {
                // Function for collapse ibox
                $scope.showhide = function() {
                    var ibox = $element.closest('div.ibox');
                    var icon = $element.find('i:first');
                    var content = ibox.find('div.ibox-content');
                    content.slideToggle(200);
                    // Toggle icon from up to down
                    icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                    ibox.toggleClass('').toggleClass('border-bottom');
                    $timeout(function() {
                        ibox.resize();
                        ibox.find('[id^=map-]').resize();
                    }, 50);
                };
                // Function for close ibox
                $scope.closebox = function() {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                };
                $scope.click = function () {
                }
            }
        };
    });
    // STATUS = { (1,'En trámite.'), (2, 'OT Cancelada.'), (4, 'Precancelada'), (10,'Por iniciar'), (11, 'Cancelada'), (12,'Cerrada'), (13, 'Vencida'), (14,'Vigente') }
    app.directive('status', function(){
        var linkFunction = function(scope, element, attributes) {
        	// console.log(Number(attributes['status']));
          switch (Number(attributes['status'])) {
            case 1:
              scope.text = 'En trámite';
              break;
            case 2:
              scope.text = 'OT Cancelada';
              break;
            case 4:
              scope.text = 'Precancelada';
              break;
            case 10:
              scope.text = 'Por iniciar';
              break;
            case 11:
              scope.text = 'Cancelada';
              break;
            case 12:
              scope.text = 'Renovada';
              break;
            case 13:
              scope.text = 'Vencida';
              break;
            case 14:
              scope.text = 'Vigente';
              break;
            case 15:
              scope.text = 'No renovada';
              break;
            default:
              scope.text = 'Pendiente';
          }
          // scope.text = attributes["status"];
        };

        return {
          restrict: 'A',
          template: '<p>{{text}}</p>',
          link: linkFunction
        };
    });

    app.directive('siniestroStatus', function(){
        var linkFunction = function(scope, element, attributes) {
          switch (Number(attributes['siniestroStatus'])) {
            case 1:
                return 'Pendiente';
            case 2:
                return 'En Trámite';
            case 3:
                return 'Procedente';
            case 4:
                return 'Cancelada';
            case 5:
                return 'Rechazada';
            default:
                return 'Sin estatus';
          }
          // scope.text = attributes["status"];
        };

        return {
          restrict: 'A',
          template: '<p>{{text}}</p>',
          link: linkFunction
        };
    });

    app.directive('statusInput', function(){
        return {
            restrict: 'AE',
            scope: {
                value: '=ngModel'
            },
            template: '<input class="form-control" value="{{value}}" type="text" disabled="disabled">',
            link: function(scope, elem, attr){
                switch (scope.value) {
                  case 1:
                    scope.value = 'En trámite';
                    break;
                  case 2:
                    scope.value = 'OT Cancelada';
                    break;
                  case 4:
                    scope.value = 'Precancelada';
                    break;
                  case 10:
                    scope.value = 'Por iniciar';
                    break;
                  case 11:
                    scope.value = 'Cancelada';
                    break;
                  case 12:
                    scope.value = 'Renovada';
                    break;
                  case 13:
                    scope.value = 'Vencida';
                    break;
                  case 14:
                    scope.value = 'Vigente';
                    break;
                  case 15:
                    scope.value = 'No renovada';
                    break;
                  default:
                    scope.value = 'Pendiente';
                }
            }
        };
    });
    // STATUS = { (1,'Pagado'), (2, 'Cancelado'), (3,'Prorrogado'), (4,'Pendiente de pago') }

    app.directive('statusReceipt', function(){
        var linkFunction = function(scope, element, attributes) {
          switch (Number(attributes['statusReceipt'])) {
            case 1:
              scope.text = 'Pagado';
              break;
            case 2:
              scope.text = 'Cancelado';
              break;
            case 3:
              scope.text = 'Prorrogado';
              break;
            case 4:
              scope.text = 'Pendiente de pago';
              break;
            case 9:
              scope.text = 'Pago Parcial';
              break;
            case 5:
              scope.text = 'Liquidado';
              break;
            case 6:
              scope.text = 'Conciliado';
              break;
            case 8:
              scope.text = 'Precancelado';
              break;
            default:
              scope.text = 'Pendiente de pago';
          }
          // scope.text = attributes["status"];
        };

        return {
          restrict: 'A',
          template: '<p>{{text}}</p>',
          link: linkFunction
        };
    });

    app.directive('statusPayform', function(){
      var linkFunction = function(scope, element, attributes) {
        switch (Number(attributes['statusPayform'])) {
          case 1:
            scope.text = 'Cheque';
            break;
          case 2:
            scope.text = 'Efectivo';
            break;
          case 3:
            scope.text = 'Transferencia';
            break;
          case 4:
            scope.text = 'Depósito bancario';
            break;
          case 5:
            scope.text = 'Tarjeta de crédito';
            break;
          default:
            scope.text = 'Sin forma de pago';
        }
        // scope.text = attributes["status"];
      };

      return {
        restrict: 'A',
        template: '<p>{{text}}</p>',
        link: linkFunction
      };
    });

    // app.directive('statusReceiptClean', function(){
    //     var linkFunction = function(scope, element, attributes) {
    //       switch (Number(attributes['statusReceiptClean'])) {
    //         case 1:
    //           scope.text = 'Pagado';
    //           break;
    //         case 2:
    //           scope.text = 'Cancelado';
    //           break;
    //         case 3:
    //           scope.text = 'Prorrogado';
    //           break;
    //         case 4:
    //           scope.text = 'Pendiente de pago';
    //           break;
    //         case 9:
    //           scope.text = 'Pago Parcial';
    //           break;
    //         case 5:
    //           scope.text = 'Liquidado';
    //           break;
    //         case 8:
    //           scope.text = 'Precancelado';
    //           break;
    //         default:
    //           scope.text = 'Pendiente de pago';
    //       }
    //       // scope.text = attributes["status"];
    //     };

    //     return {
    //       restrict: 'A',
    //       template: '{{text}}',
    //       link: linkFunction
    //     };
    // });
    app.directive('statusReceiptClean', function () {
      return {
        restrict: 'A',
        scope: {
          statusReceiptClean: '='
        },
        template: '{{ text }}',
        link: function (scope) {

          function updateText(status) {
            switch (Number(status)) {
              case 1:
                scope.text = 'Pagado';
                break;
              case 2:
                scope.text = 'Cancelado';
                break;
              case 3:
                scope.text = 'Prorrogado';
                break;
              case 4:
                scope.text = 'Pendiente de pago';
                break;
              case 5:
                scope.text = 'Liquidado';
                break;
              case 8:
                scope.text = 'Precancelado';
                break;
              case 9:
                scope.text = 'Pago Parcial';
                break;
              default:
                scope.text = 'Pendiente de pago';
            }
          }

          // 🔥 escucha cambios reales
          scope.$watch('statusReceiptClean', function (newVal) {
            updateText(newVal);
          });

        }
      };
    });


    app.directive('endorsementStatus', function(endorsement){
        var linkFunction = function(scope, element, attributes) {
          switch (Number(attributes['endorsementStatus'])) {
            case 1:
              scope.text = endorsement[0].label;
              break;
            case 2:
              scope.text = endorsement[1].label;
              break;
            case 3:
              scope.text = endorsement[2].label;
              break;
            case 4:
              scope.text = endorsement[3].label;
              break;
            case 5:
              scope.text = endorsement[4].label;
          }
        };

        return {
          restrict: 'A',
          template: '{{text}}',
          link: linkFunction
        };
    });

    // FORMA_DE_PAGO = {(1, 'Mensual'), (2, 'Bimestral'), (3, 'Trimestral'),
    //                 (6, 'Semestral'), (12, 'Anual'), (24, 'Quincenal')}
    app.directive('payment', function(){
        var linkFunction = function(scope, element, attributes) {
        	//alert(Number(attributes['payment']));
          switch (Number(attributes['payment'])) {
            case 1:
              scope.payment = 'Mensual';
              break;
            case 2:
              scope.payment = 'Bimestral';
              break;
            case 3:
              scope.payment = 'Trimestral';
              break;
            case 4:
              scope.payment = 'Cuatrimestral';
              break;
            case 5:
              scope.payment = 'Contado';
              break;
            case 6:
              scope.payment = 'Semestral';
              break;
            case 12:
              scope.payment = 'Anual';
              break;
            case 24:
              scope.payment = 'Quincenal';
              break;

            default:
              scope.payment = 'No especificada';
          }
        };

        return {
          restrict: 'A',
          template: '<p>{{payment}}</p>',
          link: linkFunction
        };
    });
    app.directive('paymentInput', function(){
        return {
            restrict: 'AE',
            scope: {
                value: '=ngModel'
            },
            template: '<input class="form-control" value="{{value}}" type="text" disabled="disabled">',
            link: function(scope, elem, attr){
                switch (scope.value) {
                  case 1:
                    scope.value = 'Mensual';
                    break;
                  case 2:
                    scope.value = 'Bimestral';
                    break;
                  case 3:
                    scope.value = 'Trimestral';
                    break;
                  case 5:
                    scope.value = 'Contado';
                    break;
                  case 6:
                    scope.value = 'Semestral';
                    break;
                  case 12:
                    scope.value = 'Anual';
                    break;
                  case 24:
                    scope.value = 'Quincenal';
                    break;
                  default:
                    scope.value = 'No especificada';
                }
            }
        };
    });

    // states -> constant
    // app.directive('statesList', stateList);
    // function stateList(){
    //     var directive = {
    //         restrict: 'EA',
    //         template: '<select class="form-control m-b" ng-model="state" ng-options="s.state for s in vm.statesArr track by s.id" required></select>',
    //         scope: {
    //           state: '=',
    //         },
    //         controller: StatesCtrl,
    //         controllerAs: 'vm',
    //         bindToController: true,
    //         link: link
    //     };
    //
    //     return directive;
    //
    //     function link(scope, iElement, iAttrs, ctrl){}
    // }
    //
    // StatesCtrl.$inject = ['states', '$timeout'];
    // function StatesCtrl(states, $timeout){
    //     var vm = this;
    //
    //     vm.statesArr = states;
    //     // $timeout(function() {
    //     //     vm.statesArr.forEach(function(elem, index){
    //     //         if (elem.state === vm.ngModel){
    //     //             vm.ngModel = vm.statesArr[index].state;
    //     //         }
    //     //     });
    //     // }, 1000);
    // }
    //
    // // HACK remove use of watch
    // app.directive('citiesList', citiesList);
    // function citiesList(){
    //     var directive = {
    //         resctrict: 'EA',
    //         required: 'state',
    //         scope: {
    //             // states: '=',
    //             ngModel: '='
    //         },
    //         controller: CitiesCtrl,
    //         controllerAs: 'vm',
    //         bindToController: true,
    //         template: '<select class="form-control m-b" ng-model="ngModel" ng-options="c.name for c in vm.cities track by c.id"></select>',
    //         // template: '<select class="form-control m-b" ng-model="ngModel" ng-options="c.name for c in vm.cities track by c.id" required></select>',
    //         link: link
    //     };
    //
    //     return directive;
    //
    //     function link(scope, element, attrs) {
    //       // scope.$watch('states', function(newVal, oldVal){
    //       //     scope.citiesArr = cities[newVal.id - 1].city;
    //       //     scope.citiesArr.forEach(function(elem, index){
    //       //         if (elem.name === scope.ngModel){
    //       //             scope.ngModel = scope.citiesArr[index];
    //       //         }
    //       //     });
    //       // });
    //     }
    // }
    //
    // CitiesCtrl.$inject = ['$scope', 'cities'];
    // function CitiesCtrl($scope, cities){
    //     var vm = this;
    //     ////console.log(vm);
    //     // var vm = this;
    //     // vm.cities = cities;
    //     ////console.log(vm);
    //     // $scope.$watch(angular.bind(this, function(){
    //     //   return this.states;
    //     // }), function(newVal, oldVal){
    //     //    ////console.log('new', newVal, 'old', oldVal);
    //     // var vm = this;
    //     // vm.cities = cities;
    //     // $scope.$watch(angular.bind(this, function(){
    //     //   return this.states;
    //     // }), function(newVal, oldVal){
    //     // });
    // }

    app.directive('addressPanel', addressPanel);
    function addressPanel(){
        var directive = {
            restrict: 'EA',
            templateUrl: 'app/components/common/address-panel.html',
            scope: {
              addresses: '=ngModel'
            },
            link: link,
            controller: AddressCtrl,
            controllerAs: 'vm',
            bindToController: true
        };

        return directive;

        function link(scope, element, attrs, ctrl){}
    }

    AddressCtrl.$inject = [];
    function AddressCtrl(){
        var vm = this;

        vm.addAddress = addAddress;
        vm.deleteAddress = deleteAddress;
        function addAddress(){
            var address = {address: 'New address'};
            vm.addresses.push(address);
        }

        function deleteAddress(index){
            vm.addresses.splice(index, 1);
        }
    }

    app.directive('optionsDisabled', function($parse) {
        var disableOptions = function(scope, attr, element, data,
                                      fnDisableIfTrue) {
            // refresh the disabled options in the select element.
            var options = element.find("option");
            for(var pos= 0,index=0;pos<options.length;pos++){
                var elem = angular.element(options[pos]);
                if(elem.val()!=""){
                    var locals = {};
                    locals[attr] = data[index];
                    elem.attr("disabled", fnDisableIfTrue(scope, locals));
                    index++;
                }
            }
        };
        return {
            priority: 0,
            require: 'ngModel',
            link: function(scope, iElement, iAttrs, ctrl) {
                // parse expression and build array of disabled options
                var expElements = iAttrs.optionsDisabled.match(
                    /^\s*(.+)\s+for\s+(.+)\s+in\s+(.+)?\s*/);
                var attrToWatch = expElements[3];
                var fnDisableIfTrue = $parse(expElements[1]);
                scope.$watch(attrToWatch, function(newValue, oldValue) {
                    if(newValue)
                        disableOptions(scope, expElements[2], iElement,
                            newValue, fnDisableIfTrue);
                }, true);
                // handle model updates properly
                scope.$watch(iAttrs.ngModel, function(newValue, oldValue) {
                    var disOptions = $parse(attrToWatch)(scope);
                    if(newValue)
                        disableOptions(scope, expElements[2], iElement,
                            disOptions, fnDisableIfTrue);
                });
            }
        };
    })
    app.directive('dateValidator', function() {
      return {
          restrict: 'A',  // Used as an attribute
          require: 'ngModel',  // Works with ng-model
          link: function(scope, element, attrs, ngModel) {
              // Initialize Bootstrap Datepicker
              element.datepicker({
                  autoclose: true,
                  format: 'dd/mm/yyyy'
              }).on('changeDate', function(e) {
                  scope.$apply(function() {
                      var formattedDate = validateAndFixDate(e.format());  // Validate & Fix
                      ngModel.$setViewValue(formattedDate);
                      ngModel.$render();
                  });
              });
  
              // Validate on Blur (when user finishes typing)
              element.on('blur', function() {
                  scope.$apply(function() {
                      var formattedDate = validateAndFixDate(element.val());  // Validate & Fix
                      ngModel.$setViewValue(formattedDate);
                      ngModel.$render();
                  });
              });
  
              // Function to validate and fix the date format
              function validateAndFixDate(date) {
                  if (!date) return "";
  
                  // Match DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY formats
                  var datePattern = /^(0[1-9]|[12][0-9]|3[01])[/.-](0[1-9]|1[0-2])[/.-](\d{4,5})$/;
                  var match = date.match(datePattern);
  
                  if (!match) return ""; // Invalid format → Reset field
  
                  var day = match[1];
                  var month = match[2];
                  var year = match[3];
  
                  // **Fix: If the year has 5 digits, trim it**
                  if (year.length === 5) {
                      year = year.substring(0, 4);
                  }
  
                  year = parseInt(year, 10);
                  var currentYear = new Date().getFullYear();
  
                  // Ensure year is between 1900 and current year
                  if (year < 1900 || year > currentYear) return "";
  
                  return day + "/" + month + "/" + year;  // Return valid, fixed format
              }
          }
      };
    });
  
  
    app.directive('autoComplete', ['$q', '$http', '$sce', '$timeout',
        function($q, $http, $sce, $timeout) {
            // standard keys code
            var KEY_DW = 40;
            var KEY_UP = 38;
            var KEY_ES = 27;
            var KEY_EN = 13;
            var KEY_TAB = 9;

            return {
                restrict: 'EA',
                require: '^?form',
                scope: {
                    selectedResult: '=',
                    initialValue: '=',
                    resultsFormatter: '=',
                    source: '=',
                    placeholder: '@',
                    minlength: '@',
                    selectHandler: '=',
                    overrideSearch: '=',
                    optLblNoResults: '@'
                },
                template: '<div class="autocomplete-content">' + '  <input ng-model="inputString" type="text" placeholder="{{placeholder}}" ng-change="inputChangeHandler($event)" class="autocomplete-text toolbarProp" ng-blur="hideResults($event)" autocapitalize="off" autocorrect="off" autocomplete="off" />' + '  <div class="autocomplete-dropdown" ng-show="showDropdown">' + '    <div class="autocomplete-search-text" ng-show="searching" ng-bind="labelSearching"></div>' + '    <div class="autocomplete-search-text" ng-show="noResults"  ng-bind="labelNoResults"></div>' + '    <ul class="autocomplete-list"><li class="autocomplete-row" ng-repeat="result in results" ng-click="selectResult(result, $event)" ng-mouseenter="hoverRow($index)" ng-mouseleave="hoverOut($index)" ng-class="{\'autocomplete-highlight-row\': $index == currentIndex}">' + '      <span class="autocomplete-title" ng-bind-html="result.label"></span>' + '    </li></ul>' + '</div>' + '</div>',
                link: function(scope, elem, attrs, ctrl) {
                    var inputField = elem.find('input');
                    var httpCancel = null;
                    var suggestionsList = elem[0].querySelector('.autocomplete-dropdown');
                    scope.currentIndex = -1;
                    scope.searching = false;
                    scope.noResults = false;
                    scope.resultSelect = false;
                    scope.labelSearching = 'Searching...';
                    if (scope.optLblNoResults === undefined)
                        scope.labelNoResults = 'No results found';
                    else
                        scope.labelNoResults = scope.optLblNoResults;
                    scope.searchInput = "";
                    if (scope.minlength && scope.minlength !== '') {
                        scope.minlength = parseInt(scope.minlength, 10);
                    } else {
                        scope.minlength = 1;
                    }
                    if (scope.initialValue) {
                        scope.inputString = scope.initialValue;
                        scope.searchInput = scope.inputString;
                        scope.$watch('initialValue', function(newval,
                            oldval) {
                            if (newval && newval.length > 0) {
                                scope.inputString = scope.initialValue;
                            }
                        });
                    }

                    //scroll to the top of list when end of list is reached
                    function scrollToTop() {
                        if (isScrollNeeded()) {
                            var row = elem[0].querySelectorAll('.autocomplete-row')[0];
                            suggestionsList.scrollTop = -1 * row.offsetHeight;
                        }
                    }

                    function scrollToBottom() {
                        if (isScrollNeeded()) {
                            var row = elem[0]
                                .querySelectorAll('.autocomplete-row')[scope.results.length - 1];
                            suggestionsList.scrollTop = row.getBoundingClientRect().top;
                        }
                    }

                    function isScrollNeeded() {
                        var ddCSS = getComputedStyle(suggestionsList);
                        return (suggestionsList.scrollHeight > suggestionsList.clientHeight) && (ddCSS.overflowY === 'auto' || ddCSS.overflowY === 'visible' || ddCSS.overflowY === 'scroll');
                    }

                    function adjustddHeight() {
                        if (isScrollNeeded()) {
                            var ddCSS = getComputedStyle(suggestionsList);
                            var borderTop, paddingTop, offset, scroll, ddHeight, rowHeight;
                            var row = elem[0]
                                .querySelectorAll('.autocomplete-row')[scope.currentIndex];
                            borderTop = parseInt(ddCSS.borderTopWidth, 10) || 0;
                            paddingTop = parseInt(ddCSS.paddingTop, 10) || 0;
                            offset = row.getBoundingClientRect().top - suggestionsList.getBoundingClientRect().top - borderTop - paddingTop;
                            scroll = suggestionsList.scrollTop;
                            ddHeight = suggestionsList.offsetHeight;
                            rowHeight = row.offsetHeight;
                            if (offset < 0) {
                                suggestionsList.scrollTop = (scroll + offset);
                            } else if (offset + rowHeight > ddHeight) {
                                suggestionsList.scrollTop = (scroll + offset - ddHeight + rowHeight);
                            }
                        }
                    }

                    function keydownHandler(event) {
                        var keyCode = event.which ? event.which : event.keyCode;
                        scope.inputString = inputField.val();
                        if (keyCode === KEY_EN && scope.results) {
                            if (scope.currentIndex >= 0 && scope.currentIndex < scope.results.length) {
                                event.preventDefault();
                                scope.selectResult(scope.results[scope.currentIndex]);
                            } else {
                                clearResults();
                            }
                            scope.$apply();
                        } else if (keyCode === KEY_DW && scope.results) {
                            event.preventDefault();
                            if ((scope.currentIndex + 1) < scope.results.length && scope.showDropdown) {
                                scope.currentIndex++;
                                scope.inputString = scope.results[scope.currentIndex].title;
                                adjustddHeight();
                            } else if (scope.currentIndex + 1 === scope.results.length) {
                                scope.currentIndex = -1;
                                scope.inputString = scope.searchInput;
                                scrollToTop();
                            }
                            scope.$apply();
                        } else if (keyCode === KEY_UP && scope.results) {
                            event.preventDefault();
                            if (scope.currentIndex >= 1) {
                                scope.currentIndex--;
                                scope.inputString = scope.results[scope.currentIndex].title;
                                adjustddHeight();
                            } else if (scope.currentIndex === 0) {
                                scope.currentIndex = -1;
                                scope.inputString = scope.searchInput;
                            } else if (scope.currentIndex === -1) {
                                scope.currentIndex = scope.results.length - 1;
                                scope.inputString = scope.results[scope.currentIndex].title;
                                scrollToBottom();
                            }
                            scope.$apply();
                        } else if (keyCode === KEY_TAB) {
                            if (scope.results && scope.results.length > 0 && scope.showDropdown) {
                                if (scope.currentIndex > -1 && scope.currentIndex < scope.results.length) {
                                    scope.selectResult(scope.results[scope.currentIndex]);
                                } else {
                                    clearResults();
                                }
                            }
                            //call digest to move focus to the next focusable element(default TAB behaviour)
                            scope.$digest();
                        } else if (keyCode === KEY_ES) {
                            event.preventDefault();
                            clearResults();
                            scope.inputString = scope.searchInput;
                            scope.$apply();
                        }
                    }

                    function clearResults() {
                        scope.showDropdown = false;
                        scope.results = [];
                        if (suggestionsList) {
                            suggestionsList.scrollTop = 0;
                        }
                    }

                    function initResults() {
                        scope.showDropdown = true;
                        scope.currentIndex = -1;
                        scope.results = [];
                    }

                    function getLocalResults(str) {
                        var i;
                        var matches = [];

                        for (i = 0; i < scope.source.length; i++) {
                            var match = false;
                            if (scope.overrideSearch && typeof scope.overrideSearch == 'function') {
                                match = scope.overrideSearch(str, scope.source[i]);
                            } else {
                                var matcher = new RegExp(str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), "i");
                                match = matcher.test(scope.source[i].label || scope.source[i]);
                            }

                            if (match) {
                                matches[matches.length] = scope.source[i];
                            }
                        }
                        scope.searching = false;
                        processResults(matches, str);
                    }

                    function getSearchResults(str) {
                        scope.resultSelect = false;
                        // Begin the search
                        if (!str || str.length < scope.minlength) {
                            return; }
                        if (scope.source) {
                            scope.searching = true;
                            scope.noResults = false;
                            if (typeof scope.source == 'function') {
                                var config = scope.source(str);
                                if (httpCancel) {
                                    httpCancel.resolve();
                                }
                                httpCancel = $q.defer();
                                config.timeout = httpCancel.promise;
                                $http(config).
                                then(function(response) {
                                        var results = [];
                                        if (scope.resultsFormatter && typeof scope.resultsFormatter == 'function') {
                                            results = scope
                                                .resultsFormatter(
                                                    str,
                                                    response);
                                        } else {
                                            results = response.data;
                                        }
                                        scope.searching = false;
                                        processResults(results, str);
                                    },
                                    function(response) {
                                        if (console && console.error) {
                                            console.error('call to get remote data failed with error' + response.status);
                                        }
                                    });
                            } else {
                                getLocalResults(str);
                            }
                        }
                    }

                    function processResults(responseData, str) {
                        var i, text, highlightText, value;

                        if (responseData && responseData.length > 0) {
                            scope.results = [];

                            for (i = 0; i < responseData.length; i++) {
                                text = highlightText = responseData[i].label || responseData[i];
                                //highlight the text that match the input text
                                highlightText = highlightMatches(text, str);
                                if (responseData[i].value != null) {
                                    value = responseData[i].value;
                                } else {
                                    value = text;
                                }
                                scope.results[scope.results.length] = {
                                    title: text,
                                    label: highlightText,
                                    value: value
                                };
                            }

                        } else {
                            scope.noResults = true;
                            scope.results = [];
                        }
                    }

                    function highlightMatches(dataStr, str) {
                        var result;
                        var matcher = new RegExp(str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"), "i");
                        var match = dataStr.match(matcher);
                        if (match) {
                            result = dataStr.replace(matcher,
                                '<span class="matched-text">' + match[0] + '</span>');
                        } else {
                            result = dataStr;
                        }
                        return $sce.trustAsHtml(result);
                    }

                    //call search if input is changed
                    scope.inputChangeHandler = function() {
                        scope.searchInput = scope.inputString;
                        if (!scope.inputString || scope.inputString === '') {
                            scope.showDropdown = false;
                        } else if (scope.inputString.length >= scope.minlength) {
                            initResults();
                            getSearchResults(scope.inputString);
                        }
                    };

                    //event handler for blur, will set scope.selectedResult with the value of input field, if not
                    //selected from suggestions
                    scope.hideResults = function(event) {
                        event.preventDefault();
                        if (httpCancel) {
                            httpCancel.resolve();
                        }
                        $timeout(function() {
                            //scope.resultSelect will be false if nothing is selected from autocomplete list
                            if (scope.resultSelect === false) {
                                scope.inputString = scope.searchInput;
                                clearResults();
                                scope.$apply(function() {
                                    if (scope.inputString && scope.inputString.length > 0) {
                                        inputField.val(scope.inputString);
                                    }
                                });
                                var result = {
                                    label: scope.inputString,
                                    value: null,
                                    isSelectedFromMenu: false
                                };
                                scope.selectedResult = result;
                                if (scope.selectHandler && typeof scope.selectHandler === 'function') {
                                    scope.selectHandler(false);
                                }
                            }
                        }, 200);
                    };

                    scope.hoverRow = function(index) {
                        scope.currentIndex = index;
                        if (scope.results) {
                            scope.currentResult = scope.results[scope.currentIndex];
                        }
                    };
                    scope.hoverOut = function(index) {
                            scope.currentResult = null;
                            scope.currentIndex = -1;
                        }
                        //on click handler on each <li> item of autocomplete list
                    scope.selectResult = function(result, event) {
                        scope.inputString = result.title;
                        scope.searchInput = scope.inputString;
                        scope.resultSelect = true;
                        var resultSelected = {
                            label: result.title,
                            value: result.value,
                            isSelectedFromMenu: true
                        };
                        scope.selectedResult = resultSelected;
                        $timeout(function() {
                            if (scope.selectHandler && typeof scope.selectHandler === 'function') {
                                scope.selectHandler(true);
                            }
                        }, 200);
                        clearResults();
                    };
                    inputField.on('keydown', keydownHandler);
                    //Setting width of the suggestions list same as input field
                    var inputElem = elem[0].querySelector('input.autocomplete-text');
                    elem[0].querySelector('.autocomplete-dropdown').style.width = getComputedStyle(inputElem).width;
                }
            };
        }
    ]);

    ;
