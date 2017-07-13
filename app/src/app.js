(function(){

	var currentYear = new Date().getFullYear()


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
			list: list
		};

		//load them immediately...
		return api;

		function list(){
			return $q(function(resolve, reject){
				if (_cachedResults) {
					resolve(_cachedResults);
				} else {
					$http({method: "GET", url: "./results.json?"+new Date().getTime()}).then(function (response) {
						_cachedResults = response.data;
						resolve(response.data);	
						//resolve(response);
					}).catch(reject);
				}
			});
		}
	}

})();