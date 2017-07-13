(function () {
    angular.module('BGGGeekListApp')
        .component('wikiConvert', {
            templateUrl: 'wiki.html',
            controller: BGGWikiConvertController,
            bindings: {
                text: '<'
            }
        });

    function BGGWikiConvertController($sce) {
        var $ctrl = this;
        $ctrl.$onInit = function () {
            $ctrl.results = $sce.trustAsHtml(BGGWiki.process($ctrl.text));
        }
    }
})();