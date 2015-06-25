(function(){

var parse_string = "ddd, DD MMM YYYY HH:mm:ss +0000";

	angular.module('BGGGeekListApp', [])
		.factory('BGGListService', BGGListService)
		.directive('bggList', BGGListDirective)
		.controller("BGGListController", BGGListController)
		.directive('wikiConvert', BGGWikiConvertDirective)
		.directive('publishers', BGGPublishers)
		.directive('designers', BGGDesigners)
		.directive('readMore', BGGReadMore)
		.filter('parseAndFormat', function(){
			return function(val){
				console.log(arguments);
			}
		});

	function BGGListService($q, $http){
		var _cachedResults = null,
			_cachedGames = null,
			_cachedGamesMap = null;

		var api = {
			list: list
		};

		//load them immediately...
		return api;

		function list(){
			return $q(function(resolve, reject){
				if (_cachedResults) {
					resolve(_cachedResults);
				} else {
					$http({method: "GET", url: "./results.json"}).success(function (response) {
						_cachedResults = response;
						resolve(response);	
						//resolve(response);
					}).error(function (err) {
						reject(err);
					});
				}
			});
		}
	}

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


function BGGListController($scope,BGGListService, $q, $timeout){

	var vm = this;

	var picker = null;

	BGGListService.list().then(function(results) {
		var geekList = results;

		vm.refreshed = geekList.refreshed;
		vm.results = geekList.items;
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
	});


	var filterTasks = {
		"edited": filterEdit,
		"gameName": filterName
	};

	function filterOutResults(type, val) {
		BGGListService.list().then(function(results){
			if (val === "") {
				vm.results = results.items;
			} else {
				vm.results = filterTasks[type](results, val);
			}
		});	
	}

	function filterEdit(res, date) {
		var dtCheck = moment(date);
		return _.filter(res.items, function(n){
			var itemDt = moment(n.postdate);
			return (itemDt.isAfter(dtCheck) || itemDt.isSame(dtCheck, 'd'));
		});
	}

	function filterName(res, name){
		return _.filter(res.items, function(n){
			return n.objectname.toLowerCase().indexOf(name.toLowerCase()) !== -1;
		});	
	}
}

function BGGWikiConvertDirective(){
	var directive = {
		restrict: "E",
		scope: {
			text: "="
		},
		template: "<div ng-bind-html='vm.results' class='clearfix'></div>",
		controller:BGGWikiConvertController,
		controllerAs:"vm",
		bindToController:true
	};

	return directive;
}

function BGGWikiConvertController($sce){
	this.results = $sce.trustAsHtml(BGGWiki.process(this.text));
}

function BGGPublishers(){
	var directive = {
		restrict:'A',
		scope: {
			game: "="
		},
		template:'<strong>Publishers:</strong> <ul class="list-unstyled"><li ng-repeat="publisher in vm.publishers">{{publisher}}</li></ul>',
		controller: function() {
			var vm = this;
			vm.publishers = vm.game.publishers;
		},
		controllerAs: "vm",
		bindToController: true
	};
	return directive;
}


	function BGGDesigners(){
		var directive = {
			restrict:'A',
			scope: {
				game: "="
			},
			template:'<strong>Designers :</strong> <ul class="list-unstyled"><li ng-repeat="designer in vm.designers">{{designer}}</li></ul>',
			controller: function() {
				var vm = this;
				vm.designers = vm.game.designers;
			},
			controllerAs: "vm",
			bindToController: true
		};
		return directive;
	}

	function BGGReadMore($timeout){
		var directive = {
			restrict:"A",
			scope: {
				game: "="
			},
			templateUrl: 'readmore.html',
			controller: function($sce) {
				var vm = this;
				vm.showMore = false;
				vm.description =  $sce.trustAsHtml( (vm.game) ? vm.game.description : "" );
				vm.descriptionShort = $sce.trustAsHtml( shorten(vm.game.description));

				vm.shortened = (vm.game.description.length >= 200);

				vm.readMore = function(){
					vm.showMore = true;
				};

				vm.readLess = function(){
					vm.showMore = false;
				}


				function shorten(txt) {
					return (txt.length < 200) ? txt : txt.slice(0,200)+"...";
				}
			},
			controllerAs: "vm",
			bindToController: true
		};

		return directive;

	}

})();