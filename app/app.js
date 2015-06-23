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
			list: list,
			games: games,
			gamesAsMap: gamesAsMap
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
						gamesAsMap().then(function(){
							resolve(response);
						}, reject);
						//resolve(response);
					}).error(function (err) {
						reject(err);
					});
				}
			});
		}


		function games(){
			return $q(function(resolve, reject){
				if (_cachedGames) {
					resolve(_cachedGames);
				} else {
					$http({method: "GET", url: "./games.json"}).success(function (response) {
						_cachedGames = response;
						resolve(response);

					}).error(function (err) {
						reject(err);
					})
				}
			})
		}

		function gamesAsMap(){
			return $q(function(resolve, reject){
				if (_cachedGamesMap) {
					resolve(_cachedGamesMap);
				} else {
					games().then(function(games){
						resolve(_.chain(games.boardgames)
							.indexBy('objectid')
							.transform(function(result, value, key) {
								result[key] = value;
							})
							.value());
					}, reject)
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

function BGGPublishers(){
	var directive = {
		restrict:'A',
		scope: {
			gameid: "="
		},
		template:'<strong>Publishers:</strong> <ul class="list-unstyled"><li ng-repeat="publisher in vm.publishers">{{publisher._}}</li></ul>',
		controller: function(BGGListService) {
			var vm = this;
			BGGListService.gamesAsMap().then(function(map){
				var game = map[vm.gameid];
				vm.publishers = (game) ? game.publishers : [];
			})
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
				gameid: "="
			},
			template:'<strong>Designers :</strong> <ul class="list-unstyled"><li ng-repeat="designer in vm.designers">{{designer._}}</li></ul>',
			controller: function(BGGListService) {
				var vm = this;
				BGGListService.gamesAsMap().then(function(map){
					var game = map[vm.gameid];
					vm.designers = (game) ? game.designers : [];
				})
			},
			controllerAs: "vm",
			bindToController: true
		};
		return directive;
	}

	function BGGReadMore(){
		var directive = {
			restrict:"A",
			scope: {
				gameid: "="
			},
			template: '<div ng-if="!vm.showMore" class="show-more">' +
				'<div class="faded-block" ng-bind-html="vm.description"></div>' +
				'<div class="text-center read-more-button read-more-less-button"><button class="text-center btn btn-info" ng-click="vm.readMore()">Read More</button></div>' +
			'</div>' +
			'<div ng-if="vm.showMore">' +
				'<div ng-bind-html="vm.description"></div>' +
				'<div class="text-center read-more-less-button"><button class="text-center btn btn-info" ng-click="vm.readLess()">Read Less</button></div>' +
			'</div>',
			controller: function($sce, BGGListService) {
				var vm = this;
				vm.showMore = false;
				BGGListService.gamesAsMap().then(function(map){
					var game = map[vm.gameid];
					vm.description =  $sce.trustAsHtml( (game) ? game.description[0] : "" );
				});

				vm.readMore = function(){
					vm.showMore = true;
				};

				vm.readLess = function(){
					vm.showMore = false;
				}
			},
			controllerAs: "vm",
			bindToController: true
		};

		return directive;
	}

})();