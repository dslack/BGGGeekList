(function(){

var parse_string = "ddd, DD MMM YYYY HH:mm:ss +0000";

	angular.module('BGGGeekListApp', [])
	.directive('bggList', BGGListDirective)
	.controller("BGGListController", BGGListController)
	.directive('wikiConvert', BGGWikiConvertDirective)
	.filter('parseAndFormat', function(){
		return function(val){
			console.log(arguments);
		}
	});

function BGGListDirective(){
	var directive = {
		restrict:"A",
		templateUrl: "list.html",
		controller:BGGListController,
		controllerAs: "vm",
		bindToController:true
	};

	return directive;
}

function BGGListController($scope,$http, $timeout){

	var vm = this;

	var picker = null;
	var _cachedResults = null;
	$http({method:"GET", url:"./results.json"}).success( function(response){
		_cachedResults = response.items;
		vm.refreshed = response.refreshed;
		vm.results = _cachedResults;
	}).error(function(response){
		alert("Error loading results");
	});

	$timeout(function(){
		initDatePicker();
	}, 0);

	function initDatePicker(){
		picker = $('#datetimepicker1');
		picker.datetimepicker({
			useCurrent: false,
			format: "YYYY/MM/DD",
			allowInputToggle: true
		});
		picker.on('dp.change', function(dt){
			picker.data('DateTimePicker').hide();
			if (dt.date) {
				$scope.lastEdited =dt.date.format(picker.data('DateTimePicker').options().format);
			
			} else {
				$scope.lastEdited = "";
			}
			$scope.$apply()
		});
	}


	this.showDatePicker = function(){
		if (!picker) {
			initDatePicker();
		} else {
			picker.data('DateTimePicker').show();
		}
	}

	$scope.$watch("lastEdited", function(newVal, prevVal) {
		if (newVal !== prevVal) {
			filterOutResults("edited", newVal);
		}
	});

	$scope.$watch("gameName", function(newVal, prevVal){
		if (newVal !== prevVal) {

			//filter the results temporarily...
			filterOutResults("gameName", newVal);
		}
	})


	var filterTasks = {
		"edited": filterEdit,
		"gameName": filterName
	};

	function filterOutResults(type, val) {
		if (val === "") {
			vm.results = _cachedResults;
		} else {
			vm.results = filterTasks[type](_cachedResults, val);
		}
	}

	function filterEdit(res, date) {
		var dtCheck = moment(date);
		return _.filter(res, function(n){
			var itemDt = moment(n.$.postdate, parse_string);
			return (itemDt.isAfter(dtCheck) || itemDt.isSame(dtCheck, 'd'));
		});
	}

	function filterName(res, name){
		return _.filter(res, function(n){
			return n.$.objectname.toLowerCase().indexOf(name.toLowerCase()) !== -1;
		});	
	}
}

function BGGWikiConvertDirective(){
	var directive = {
		restrict: "E",
		scope: {
			text: "="
		},
		template: "<span ng-bind-html='vm.results'></span>",
		controller:BGGWikiConvertController,
		controllerAs:"vm",
		bindToController:true
	};

	return directive;
}

function BGGWikiConvertController($sce){
	this.results = $sce.trustAsHtml(BGGWiki.process(this.text));
}

})();