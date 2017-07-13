(function () {
	angular.module('BGGGeekListApp')
		.component("bggList", {
			templateUrl: "list.html",
			controller: BGGListController
		})

	function BGGListController($scope, BGGListService, debounce) {
		var $ctrl = this;
		
		$ctrl.sortBy = "added";
		this.release = null,
			this.showReleasedThisYear = null,
			this.gameName = null;

		$ctrl.$onInit = function () {
			BGGListService.list().then(function (results) {
				var geekList = results;
				$ctrl.refreshed = geekList.refreshed;
				$ctrl.results = geekList.items;
			});
		}


		var gameNameDebounce = debounce(500, function (newVal) {
			filterOutResults("gameName", newVal);
		});

		$scope.$watch("$ctrl.released", function (newVal, prevVal) {
			if (newVal !== prevVal) {
				filterOutResults("released", newVal);
			}
		});

		$scope.$watch("$ctrl.showReleasedThisYear", function (newVal, prevVal) {
			if (newVal !== prevVal) {
				filterOutResults("yearPublished", (newVal) ? currentYear : "");
			}
		});

		$scope.$watch("$ctrl.gameName", function (newVal, prevVal) {
			if (newVal !== prevVal) {

				//filter the results temporarily...
				gameNameDebounce(newVal);

			}
		});


		var filterTasks = {
			"released": filterReleased,
			"gameName": filterName,
			"yearPublished": filterYearPublished
		};

		function filterOutResults(type, val) {
			/*BGGListService.list().then(function(results){
				if (val === "" || !val) {
					//$ctrl.results = results.items;
					showAll(results.items);
				} else {
					$ctrl.results = filterTasks[type](results, val);
				}
			});*/
			if (val === "" || !val) {
				//$ctrl.results = results.items;
				showAll($ctrl.results);
			} else {
				filterTasks[type]($ctrl.results, val);
			}
		}

		function showAll(items) {
			_.each(items, function (n) {
				n.hide = false;
			})
		}

		function filterReleased(res, val) {
			/*return _.filter(res.items, function(n){
				return n.released;
			});*/
			_.each(res, function (n) {
				if (!n.released) {
					n.hide = true;
				}
			});

			return res;
		}

		function filterName(res, name) {
			/*return _.filter(res.items, function(n){
				return n.objectname.toLowerCase().indexOf(name.toLowerCase()) !== -1;
			});*/
			_.each(res, function (n) {
				n.hide = !(n.objectname.toLowerCase().indexOf(name.toLowerCase()) !== -1);
			})
		}

		function filterYearPublished(res, year) {

			_.each(res, function (n) {
				n.hide = (n.yearPublished != year);
			})
		}
	}
})();