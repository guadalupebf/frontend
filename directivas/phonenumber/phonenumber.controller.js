
var phonenumberModule = angular.module('inspinia')

	phonenumberModule.directive('phonenumberDirective', ['$filter', '$window', function($filter, $window) {
		/*
		Use:
			<phonenumber-directive placeholder='prompt' model='someModel.phonenumber'></phonenumber-directive>
		Where:
			someModel.phonenumber: {String} value which to bind only the numeric characters [0-9] entered
				ie, if user enters 617-2223333, value of 6172223333 will be bound to model
			prompt: {String} text to keep in placeholder when no numeric input entered
		*/

		function link(scope, element, attributes) {

			// scope.inputValue is the value of input element used in template
			scope.inputValue = scope.phonenumberModel;

				scope.$watch('phonenumberModel', function(value, oldValue) {

					value = String(value);
					var number = value.replace(/[^0-9]+/g, '');
					scope.phonenumberModel = number;
					scope.inputValue = $filter('phonenumber')(number);

				});

				scope.$watch('inputValue', function(value, oldValue) {

					value = String(value);
					var number = value.replace(/[^0-9]+/g, '');
					scope.phonenumberModel = number;
					scope.inputValue = $filter('phonenumber')(number);

				});
			// }

		}

		return {
			link: link,
			restrict: 'E',
			scope: {
				phonenumberPlaceholder: '=placeholder',
				phonenumberModel: '=model',
				disabledfield: '=',
				change : '&'
			},
			//templateUrl: '/static/phonenumberModule/template.html',
			template: '<input ng-model="inputValue" ng-change="change()" ng-disabled="disabledfield" type="tel" class="phonenumber form-control" maxlength="25" placeholder="{{phonenumberPlaceholder}}" title="Phonenumber (Format: (999) 9999-9999)">',
		};
	}])

	.filter('phonenumber', function() {

	    return function (number) {

	        if (!number) { return ''; }

	        number = String(number);

	        // Will return formattedNumber.
	        // If phonenumber isn't longer than an area code, just show number
	        var formattedNumber = number;

			// if the first character is '1', strip it out and add it back
			if(number[0] == '1'){
				var c = (number[0] == '1') ? '1 ' : '';
				number = number[0] == '1' ? number.slice(1) : number;
			} else if(number[0] == '0' && number[1] == '1'){
				var c = (number[0] == '0' && number[1] == '1') ? '01 ' : '';
				number = (number[0] == '0' && number[1] == '1') ? number.slice(2) : number;
			} else 
			var c = '';

			var area;
			var front;
			if(number.substring(0,2) == 55 || number.substring(0,2) == 33 || number.substring(0,2) == 81){
				area = number.substring(0,2);
				front = number.substring(2, 6);
			}
			else{
				area = number.substring(0,3);
				front = number.substring(3, 6);
			}

			var end = number.substring(6, 10);
      		var ext = number.substring(10, 15);

			// # (###) ###-#### as c (area) front-end
			//var area = number.substring(0,3);
			//var front = number.substring(3, 6);
			//var end = number.substring(6, 10);
      //var ext = number.substring(10, 15);

			if (front) {
				formattedNumber = (c + "(" + area + ") " + front);
			}
			if (end) {
				formattedNumber += ("-" + end);
			}
      if(ext) {
        formattedNumber += (" ext. " + ext);
      }
			return formattedNumber;
	    };
	});
