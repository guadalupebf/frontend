var app = angular.module('inspinia')
.directive('commentsMc', ['$http', 'url', '$localStorage', function ($http, url, $localStorage) {

    return {
        restrict: 'EA',
        scope: {
          quote : '=',
          datasource: '=',
          config: '='
        },
        templateUrl: 'app/directivas/comments/comments-mc.template.html',
        link: function(scope, element, attrs) {

          var users_array = [];
          scope.urls_array = [];;

          scope.getPicture = function(parItem) {

            if($localStorage[parItem.user]) {
              parItem.image = $localStorage[parItem.user];

            } else {
              getUsers(parItem);
            }

          };

          function getUsers (param) {

            console.log('param', param);
            

            $http({
                method: 'GET',
                url: url.IP_CAS+'get-user-picture/'+param.user
              })
              .then(function (request) {
                if(request.status === 200) {
                  param.image = url.IP_CAS+request.data.url;
                  $localStorage[param.user] = url.IP_CAS+request.data.url;
                }
              })
              .catch(function(e) {
                console.log('e', e);
              });
          }

          scope.scrollDown = function () {
            var content_ = $('#binaclecontent')[0];
            $('#binaclecontent').scrollTop(content_.scrollHeight);
          };

          scope.saveComment = function () {

            var data = {
              // 'model': scope.typemodel,
              // 'id_model': scope.idmodel,
              'content' : scope.simple_comment,
              'parent'  : null,
              'quote'   : scope.quote.id,
              'isChild': false
            };

            $http.post(url.MC+'quote-comment/', data)
            .then(function(request) {

              if(request.status === 201) {
                scope.datasource.push(request.data);
                scope.simple_comment = '';
              }

            })
            .catch(function(e) {
              console.log('e', e);

            });

          };

          scope.saveChild = function (parChild, parItem) {

            var data = {
              quote    : scope.quote.id,
              content  : parChild.content,
              parent   : parItem.id,
              isChild : true
            };

            $http.post(url.MC+'quote-comment/', data)
            .then(function(request) {
              if(request.status === 201) {
                parItem.comment_child.push(request.data);
                parChild.content = '';
                parChild.response = false;
              }
            })
            .catch(function(e) {
              console.log('e', e);
            });

          };

          // Ver más
          scope.showMore = function() {

            $http.get(scope.config.next)
            .then(function (request) {
              if(request.status === 200) {
                scope.config.next = request.data.next;
                scope.config.count = request.data.count;
                scope.config.previous = request.data.previous;
                request.data.results.forEach(function(item) {
                  scope.datasource.unshift(item); 
                }); 
              }
            })
            .catch(function (e) {
              console.log('error', e);
            });

          };

        } // termina link
      } // termina return
    }]
);
