(function(){
	angular
		.module('jkuri.timepicker', [])
		.directive('ngTimepicker', ['$document', function($document) {
			var setScopeValues = function (scope, attrs) {
				scope.initTime = attrs.initTime || '11:00';
				scope.step = attrs.step || '15';
				scope.showMeridian = attrs.showMeridian || false;
				scope.meridian = attrs.meridian || 'AM';
				scope.theme = attrs.theme || '';
				scope.editable = attrs.editable || true;
			};

			var getPosition = function(element){
				var input_box = element.firstChild;
				
				var top = input_box.offsetTop + input_box.offsetHeight;
				var left = input_box.offsetLeft;

				return { top: top - 1, left: left };
			};

			return {
				restrict: 'EA',
				scope: true,
				require: '?ngModel',
				link: function (scope, element, attrs, ngModel) {
					setScopeValues(scope, attrs);
					scope.opened = false;
					var position = getPosition(element[0]);
					scope.left = position.left+'px';
					scope.top = position.top+'px';

					var initTime = function () {
						var time = scope.initTime.split(':');

						if (scope.showMeridian){
							if (time[0] === 0){
								scope.hour = 12;
								scope.meridian = 'AM';
							} else if (time[0] === 12){
								scope.hour = 12;
								scope.meridian = 'PM';
							} else if (time[0] > 12 && time[0] < 22){
								scope.hour = '0' + (time[0] - 12);
								scope.meridian = 'PM';
							} else if (time[0] >= 22) {
								scope.hour = time[0] - 12;
								scope.meridian = 'PM';
							} else {
								scope.hour = time[0];
								scope.meridian = 'AM';
							}
						} else {
							scope.hour = time[0];
						}

						scope.minutes = time[1];
					};

					var isValid = function(){
						if (isNaN(scope.hour) || isNaN(scope.minutes)){
							return false;
						}

						return true;
					};

					var setTime = function () {
						var time;
						if (!scope.showMeridian) {
							time = scope.hour + ':' + scope.minutes;
							scope.viewValue = time;
							ngModel.$setViewValue(time);
						} else {
							time = scope.hour + ':' + scope.minutes;
							scope.viewValue = time + ' ' + scope.meridian;
							time = convertFromMeridianHour() + ':' + scope.minutes;
							ngModel.$setViewValue(time);
						}
					};

					var convertFromMeridianHour = function () {
						var hour = parseInt(scope.hour, 10);
						
						// if it's 12AM or 12PM -> convert to 12 or 00
						if (hour === 12 && scope.meridian === 'PM') return 12;
						if (hour === 12 && scope.meridian === 'AM') return '00';

						if (scope.meridian === 'PM') {
							return hour + 12;
						} else if (hour === 0){
							return 12;
						} else if (hour < 10) {
							return '0' + hour;
						} else {
							return hour;
						}
					};

					var reinitTime = function () {
						var time = scope.initTime.split(':');
						scope.hour = time[0];
						scope.minutes = time[1];

						time = scope.hour + ':' + scope.minutes;
						scope.viewValue = time;
						ngModel.$setViewValue(time);
					};

					scope.showTimepicker = function () {
						scope.opened = true;
					};

					scope.incrementHour = function () {
						if (!scope.showMeridian) {
							if (parseInt(scope.hour, 10) < 23) {
								scope.hour = parseInt(scope.hour, 10) + 1;
							} else {
								scope.hour = 0;
							}
						} else {
							if (parseInt(scope.hour, 10) === 12 ){
								scope.hour = 1;
							} else if (parseInt(scope.hour, 10) === 11) {
								scope.hour = 12;
								scope.toggleMeridian();
							} else {
								scope.hour = parseInt(scope.hour, 10) + 1;
							}
						}

						if (parseInt(scope.hour, 10) < 10) {
							scope.hour = '0' + scope.hour;
						}

						setTime();
					};

					scope.decreaseHour = function () {
						if (!scope.showMeridian) {
							if (parseInt(scope.hour, 10) === 0) {
								scope.hour = 23;
							} else {
								scope.hour = parseInt(scope.hour, 10) - 1;
							}
						} else {
							if (parseInt(scope.hour, 10) === 1) {
								scope.hour = 12;
							} else if (parseInt(scope.hour, 10) === 12) {
								scope.hour = 11;
								scope.toggleMeridian();
							} else {
								scope.hour = parseInt(scope.hour, 10) - 1;
							}
						}

						if (parseInt(scope.hour, 10) < 10) {
							scope.hour = '0' + scope.hour;
						}

						setTime();
					};

					scope.incrementMinutes = function () {
						scope.minutes = parseInt(scope.minutes, 10) + parseInt(scope.step, 10);
						if (scope.minutes > 59) {
							scope.minutes = '00';
							scope.incrementHour();
						}
						setTime();
					};

					scope.decreaseMinutes = function () {
						scope.minutes = parseInt(scope.minutes, 10) - parseInt(scope.step, 10);
						if (parseInt(scope.minutes, 10) < 0) {
							scope.minutes = 60 - parseInt(scope.step, 10);
							scope.decreaseHour();
						}
						if (parseInt(scope.minutes, 10) === 0) {
							scope.minutes = '00';
						}
						setTime();
					};

					scope.keyDown = function (evt, which) {
						if(evt.keyCode === 40) { // decrement
							if (which == 'minutes'){
								scope.decreaseMinutes();
							} else {
								scope.decreaseHour();
							}
						} else if (evt.keyCode === 38) { // increment
							if (which == 'minutes'){
								scope.incrementMinutes();
							} else {
								scope.incrementHour();
							}
						}
					};

					scope.toggleMeridian = function () {
						scope.meridian = (scope.meridian === 'AM') ? 'PM' : 'AM';
						setTime();
					};

					scope.edit = function () {
						if (scope.editable && isValid()){
							setTime();
						}
					};

					$document.on('click', function (e) {
						if (element !== e.target && !element[0].contains(e.target)) {
							scope.$apply(function () {
								scope.opened = false;
							});
						}
					});

					initTime();
					setTime();

				},
				template:
					'<input type="text" ng-focus="showTimepicker()" ng-value="viewValue" class="ng-timepicker-input" ng-readonly="true">' +
					'<div class="ng-timepicker" ng-show="opened" ng-style="{\'left\': left, \'top\': top}">' +
					'  <table>' +
					'    <tbody>' +
					'    <tr>' +
					'        <td class="act noselect" ng-click="incrementHour()"><i class="fa fa-angle-up"></i></td>' +
					'        <td></td>' +
					'        <td class="act noselect" ng-click="incrementMinutes()"><i class="fa fa-angle-up"></i></td>' +
					'        <td class="act noselect" ng-click="toggleMeridian()" ng-show="showMeridian"><i class="fa fa-angle-up"></i></td>' +
					'      </tr>' +
					'      <tr>' +
					'        <td><input type="text" ng-model="hour" ng-readonly="!editable" ng-keydown="keyDown($event, \'hours\');" ng-change="edit()"></td>' +
					'        <td>:</td>' +
					'        <td><input type="text" ng-model="minutes" ng-readonly="!editable" ng-keydown="keyDown($event, \'minutes\');" ng-change="edit()"></td>' +
					'        <td ng-show="showMeridian"><input type="text" ng-model="meridian" ng-readonly="true"></td>' +
					'      </tr>' +
					'      <tr>' +
					'        <td class="act noselect" ng-click="decreaseHour()"><i class="fa fa-angle-down"></i></td>' +
					'        <td></td>' +
					'        <td class="act noselect" ng-click="decreaseMinutes()"><i class="fa fa-angle-down"></i></td>' +
					'        <td class="act noselect" ng-click="toggleMeridian()" ng-show="showMeridian"><i class="fa fa-angle-down"></i></td>' +
					'      </tr>' +
					'  </table>' +
					'</div>'
			};

		}]);
}());