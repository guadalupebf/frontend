var app = angular.module('inspinia')
  .filter('slice', function() {
    return function(arr, start, end) {
      if(arr) {
        return arr.slice(start, end);
      }
    };
  })
  .directive('pagination', ['$http', '$parse','$localStorage', function ($http, $parse, $localStorage) {

      return {
          // restrict: 'EA',
          scope: {
            model : '=',
            params: '=',
            config : '=',
            id: '@'
          },
          templateUrl: 'app/directivas/pagination/pagination.html',
          link: function(scope, rootScope, attrs) {

            if(scope.config) {
              var pages = 1;
              pages = Math.ceil(scope.config.count / 10);
            } 

            scope.totalPages = [];
            var count_items = 0;
            var count_pages = 0;

            var previous_array = [];
            var next_array = [];

            scope.start = 0;
            scope.end = 5;
            scope.actual_page = 1;
            scope.actual_page = (scope.config && scope.config.current_page) ? parseInt(scope.config.current_page, 10) : 1;
            scope.not_prev = true;
            for (var i = 0; i < pages; i++) {
              scope.totalPages.push(i+1);
            }
            scope.$watch('config.page', function (newVal, oldVal) {
              if (!newVal) return;

              var page = parseInt(newVal, 10) || 1;

              // Si solo quieres marcar la página visualmente:
              // scope.actual_page = page;

              // Si además quieres que se haga el request de esa página,
              // llama a la propia lógica de la directiva:
              if (page !== scope.actual_page) {
                scope.selectPage(page);
              }
            });
            scope.previousPage = function () {
              if(scope.actual_page > 1) {
                scope.not_prev = false;

                if(scope.actual_page == scope.start) {

                  scope.start = scope.start - 4;
                  scope.end = scope.end - 4;

                  scope.not_prev = false;
                  scope.not_next = false;
                }

                scope.actual_page = scope.actual_page -1;

                getProviders(scope.config.previous);
                scope.previousBlockPages(1);
              }
            };

            scope.nextPage = function() {
              if(scope.actual_page > 1) {
                scope.not_prev = false;
              }

              if(scope.actual_page == scope.totalPages.length -1) {
                scope.not_next = true;
              }

              if(scope.actual_page < scope.totalPages.length) {
                if(scope.actual_page == scope.end) {
                  scope.start = scope.start + 4;
                  scope.end = scope.end + 5;
                  if(scope.end == scope.totalPages.length) {
                    scope.not_next = true;
                  }
                }
                scope.actual_page =  scope.actual_page + 1;
                getProviders(scope.config.next);
                scope.nextBlockPages(2);
              } else if(scope.actual_page == scope.totalPages.length) {
                scope.not_next = true;
              }

            };

            scope.selectPage = function (parPage) {
              var config_ = '';
              config_ = angular.copy(scope.config);

              var url = '';
              if(scope.config.next || scope.config.previous) {
                if(scope.config.next) {

                  var otherParameters = config_.next.substring(config_.next.indexOf("&page=") + 6);

                  // var test = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
                  // console.log('test', test);

                  url = config_.next.substring(0, config_.next.indexOf("&page=") + 6);
                  url += parPage.toString();

                  if(config_.next.search('&') !== -1) {
                    var params = otherParameters.substring(2, otherParameters.indexOf('&')+500);
                    
                    url += '&'+params;
                  }

                  // if(config_.next.search('&tipo=') !== -1) {
                  //   var tipo = scope.config.next.substring(0, scope.config.next.indexOf("&tipo=") + 6);
                  //   url += '&'+tipo.toString();
                  // }

                } else {

                  url = '';

                  // var otherParameters = config_.previous.substring(config_.previous.indexOf("&page=") + 6);

                  // if(config_.previous.search('&page=') !== -1) {
                  //   url = config_.previous.substring(0, config_.previous.indexOf("&page=") + 6);
                  //   url += parPage.toString();
                  // } else { 
                  //   url = config_.previous
                  // }

                  // if(config_.previous.search('&') !== -1) {
                  //   var params = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
                  // console.log('----------', params);
                  // url += '&'+params;
                  // }

                  if(config_.previous.indexOf("&page=") > -1) {

                    var otherParameters = config_.previous.substring(config_.previous.indexOf("&page=") + 6);

                    // var test = otherParameters.substring(2, otherParameters.indexOf('&')+1000);
                    // console.log('test', test);

                    url = config_.previous.substring(0, config_.previous.indexOf("&page=") + 6);
                    url += parPage.toString();

                    if(config_.previous.search('&') !== -1) {
                      var params = otherParameters.substring(2, otherParameters.indexOf('&')+500);
                      
                      url += '&'+params;
                    }
                  
                  } else {
                    url = config_.previous + '&page='+String(parPage);
                  }

                 

                            // if(config_.previous.search('&tipo=') !== -1) {
                            //   var tipo = scope.config.previous.substring(0, scope.config.next.indexOf("&tipo=") + 6);
                            //   url += '&'+tipo.toString();
                            // }else {
                            //   url = scope.config.previous
                            // }
                }
              }

              // url += '&status=1'

              getProviders(url);
              scope.actual_page = parPage;
              if(scope.actual_page > 1) {
                scope.not_prev = false;
              }
              if(scope.actual_page == scope.totalPages.length -1) {
                scope.not_next = true;
              }

            };

            scope.lastPage = function() {
              // TODO: ultimo bloque
              if(scope.totalPages.length > 5) {
                scope.end = scope.totalPages.length;
                scope.start = (scope.totalPages.length) -5;
              }
              scope.selectPage(scope.totalPages.length);

              scope.actual_page = scope.totalPages.length;

            }
            
            // console.log('id', scope.id);
            scope.previousBlockPages = function(param) {
              if(param) {
                if(scope.start < scope.actual_page) {
                  scope.start = scope.start - 1 ;
                  scope.end = scope.end - 1;
                }

              } else {
                scope.start = scope.start - 5 ;
                scope.end = scope.end - 5;

                if(scope.end < scope.totalPages.length) {
                    scope.not_next = false;
                }
              }

              if(scope.end <= 5) {
                scope.start = 0;
                scope.end = 5;
                scope.show_prev_block = false;
              }
            }

            scope.nextBlockPages = function(param) {

              scope.show_prev_block = true;

              if(param) {
                if(scope.end > scope.actual_page) {
                  scope.start = scope.start + 1 ;
                  scope.end = scope.end + 1;
                }
              } else {
                if(scope.end < scope.totalPages.length) {
                  scope.start = scope.start + 5 ;
                  scope.end = scope.end + 5;

                  if(scope.end == scope.totalPages.length) {
                      scope.not_next = true;
                  }
                } else {
                  scope.not_next = true;
                }
              }

            }


            function getProviders(parUrl) {
              $http.get(parUrl)
              .then(
                function success(request) {
                  if(request.data) {

                    // console.log('... params ....', scope.params);

                    // console.log('request - pagination', request,parUrl);
                    if (parUrl && parUrl.indexOf('/graficas-recibos') !== -1) {
                      var queryString = parUrl.split('?')[1] || '';
                      var params = {};
                      queryString.split('&').forEach(function (pair) {
                        if (!pair) return;
                        var parts = pair.split('=');
                        var key = decodeURIComponent(parts[0]);
                        var value = decodeURIComponent(parts[1] || '');
                        params[key] = value;
                      });
                      var page = params.page || '1';
                      $localStorage.graficas_recibos_page = page;
                      $localStorage.graficas_recibos_url = parUrl;
                    }
                    scope.model = [];
                    // scope.model = request.data.results;
                    // console.log('model', scope.model);

                    if(scope.params) {
                    scope.model = [];

                      scope.params.forEach(function(item)  {
                        // console.log('item', item);
                        request.data.results.forEach(function(rec, rec_index) {
                          if(item.id == rec.id) {
                            request.data.results.splice(rec_index, 1);
                          } 
                        });
                      });
                    } 
                    scope.model = request.data.results;

                    var parsed = $parse(attrs.model);
                    parsed.assign(scope, []);
                    parsed.assign(scope, request.data.results);
                    // console.log('ssssssss',scope.$parent[attrs.model]);
                    if(scope.$parent[attrs.model]) {
                      scope.$parent[attrs.model] = request.data.results;
                    }
                    // console.log('scope', scope);

                    scope.config = {
                      count: request.data.count,
                      previous: request.data.previous,
                      next: request.data.next
                    }
                  }
                },
                function error(error) {
                  console.log('error', error);
                }
              )
              .catch(function(e) {
                console.log('e', e);
              });
            };
          }
        }
      }]
  );
