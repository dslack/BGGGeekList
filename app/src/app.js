(function(){

	angular.module('BGGGeekListApp', ['rt.debounce'])
		.run(function($rootScope){
			$rootScope.config = CONFIG;
		})
		.factory('BGGListService', BGGListService);

	function BGGListService($q, $http){
		var _cachedResults = null,
			_cachedGames = null,
			_cachedGamesMap = null;

		var api = {
			list: list,
			publishers: publishers
		};

		//load them immediately...
		return api;

		function list(){
			if (_cachedResults) {
				return $q.resolve(_cachedResults);
			}
			return $http({method: "GET", url: "./results.json?"+new Date().getTime()}).then(function (response) {
				_cachedResults = response.data;
				return response.data;		
			});
		}

		function publishers () {
			var publishers = _cachedResults.items.map(function(x){
				return x.publishers;
			});
			publishers = [].concat.apply([], publishers);
			publishers = publishers.reduce(function(a,b){
				if (a.indexOf(b) < 0) a.push(b);
				return a
			}, []);
			publishers.sort();
			return $q.resolve(publishers);
		}
	}

})();