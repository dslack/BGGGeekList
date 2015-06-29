(function(){

var parse_string = "ddd, DD MMM YYYY HH:mm:ss +0000";
	var newLineRE = /<br>\s*?<br>/g;

	angular.module('BGGGeekListApp', ['rt.debounce'])
		.factory('BGGListService', BGGListService)
		.directive('bggList', BGGListDirective)
		.controller("BGGListController", BGGListController)
		.directive('wikiConvert', BGGWikiConvertDirective)
		.directive('publishers', BGGPublishers)
		.directive('designers', BGGDesigners)
		.directive('readMore', BGGReadMore)
		.directive('publisherNotes', BGGPublisherNotes)

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
					$http({method: "GET", url: "./results.json?"+new Date().getTime()}).success(function (response) {
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


function BGGListController($scope,BGGListService, debounce){

	var vm = this;
	this.release = null,
		this.gameName = null;

	BGGListService.list().then(function(results) {
		var geekList = results;
		vm.refreshed = geekList.refreshed;
		vm.results = geekList.items;
	});


	var gameNameDebounce = debounce(500, function(newVal){
		filterOutResults("gameName", newVal);
	});

	$scope.$watch("vm.released", function(newVal, prevVal) {
		if (newVal !== prevVal) {
			filterOutResults("released", newVal);
		}
	});

	$scope.$watch("vm.gameName", function(newVal, prevVal){
		if (newVal !== prevVal) {

			//filter the results temporarily...
			gameNameDebounce(newVal);

		}
	});


	var filterTasks = {
		"released": filterReleased,
		"gameName": filterName
	};

	function filterOutResults(type, val) {
		/*BGGListService.list().then(function(results){
			if (val === "" || !val) {
				//vm.results = results.items;
				showAll(results.items);
			} else {
				vm.results = filterTasks[type](results, val);
			}
		});*/
		if (val === "" || !val) {
			//vm.results = results.items;
			showAll(vm.results);
		} else {
			filterTasks[type](vm.results, val);
		}
	}

	function showAll(items) {
		_.each(items, function(n){
			n.hide = false;
		})
	}

	function filterReleased(res, val) {
		/*return _.filter(res.items, function(n){
			return n.released;
		});*/
		_.each(res, function(n){
			if (!n.released) {
				n.hide = true;
			}
		});

		return res;
	}

	function filterName(res, name){
		/*return _.filter(res.items, function(n){
			return n.objectname.toLowerCase().indexOf(name.toLowerCase()) !== -1;
		});*/
		_.each(res, function(n){
			n.hide = !(n.objectname.toLowerCase().indexOf(name.toLowerCase()) !== -1);
		})
	}
}

function BGGWikiConvertDirective(){
	var directive = {
		restrict: "E",
		scope: {
			text: "="
		},
		templateUrl: "wiki.html",
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
			game: "=",
			simpleView: "="
		},
		template:'<strong>Publishers:</strong> <ul ng-class="{\'list-inline\': vm.simpleView}" class="list-unstyled"><li ng-repeat="publisher in vm.publishers">{{::publisher}}</li></ul>',
		controller: function() {
			var vm = this;
			vm.publishers = vm.game.publishers;
			vm.publishersSimple = vm.game.publishers.join(", ");
		},
		controllerAs: "vm",
		bindToController: true
	};
	return directive;
}


	function BGGDesigners() {
		var directive = {
			restrict: 'A',
			scope: {
				game: "=",
				simpleView: "="
			},
			template: '<strong>Designers :</strong> <ul ng-class="{\'list-inline\': vm.simpleView}" class="list-unstyled"><li ng-repeat="designer in vm.designers">{{::designer}}</li></ul>',
			controller: function () {
				var vm = this;
				vm.designers = vm.game.designers;
				vm.designersSimple = vm.game.designers.join(", ");
			},
			controllerAs: "vm",
			bindToController: true
		};
		return directive;
	}

	function BGGPublisherNotes($sce){
		var directive = {
			restrict:'A',
			scope: {
				game: "="
			},
			template:'<strong>Publisher Notes :</strong> <span ng-bind-html="pubNotes"></span>',
			link: function(scope) {

				var vm = scope;
				var notes = vm.game.publisherNotes;
				notes = notes.replace(/^<br>/, "");
				notes = notes.replace(/<br>$/, "");
				notes = notes.replace(newLineRE, "<br>");

				//we want to strip out the post_fre div...
				var docFrag = document.createDocumentFragment();
				var div = document.createElement('div');
				div.innerHTML = '<div>'+notes+'</div>';
				docFrag.appendChild(div);

				var postFr = docFrag.querySelector('.post_fr');
				if (postFr) {
					postFr.parentNode.removeChild(postFr);
				}

				var tac = docFrag.querySelector('.tac');
				if (tac) {
					tac.parentNode.removeChild(tac);
				}

				vm.pubNotes = $sce.trustAsHtml(div.innerHTML);
			}
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