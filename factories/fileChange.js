app.directive('fileChange', function () {
  return {
    restrict: 'A',
    scope: { fileChange: '&' },
    link: function (scope, element) {
      element.bind('change', function (event) {
        var files = event.target.files;
        scope.$apply(function () {
          scope.fileChange({ files: files });
        });
      });
    }
  };
});
