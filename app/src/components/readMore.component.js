(function () {
    angular.module('BGGGeekListApp')
        .component('readMore', {
            bindings: {
                game: "<"
            },
            templateUrl: 'readmore.html',
            controller: function ($sce) {
                var $ctrl = this;
                var desc = "";
                $ctrl.showMore = false;
                $ctrl.$onInit = init; 
                
                function init() {
                    if ($ctrl.game.description) {
                        desc = $ctrl.game.description;
                    }
                    $ctrl.description = $sce.trustAsHtml(($ctrl.game) ? desc : "");
                    $ctrl.descriptionShort = $sce.trustAsHtml(shorten(desc));

                    $ctrl.shortened = (desc.length >= 200);
                }
                $ctrl.readMore = function () {
                    $ctrl.showMore = true;
                };

                $ctrl.readLess = function () {
                    $ctrl.showMore = false;
                }


                function shorten(txt) {
                    return (!txt || txt.length < 200) ? txt : txt.slice(0, 200) + "...";
                }
            }
        })
})();