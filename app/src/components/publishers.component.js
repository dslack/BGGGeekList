(function () {
    angular.module('BGGGeekListApp')
        .component('publishers', {
            bindings: {
                game: "<",
                simpleView: "<"
            },
            template: '<strong>Publishers:</strong> <ul ng-class="{\'list-inline\': vm.simpleView}" class="list-unstyled"><li ng-repeat="publisher in vm.publishers">{{::publisher}}</li></ul>',
            controller: function () {
                var $ctrl = this;
                $ctrl.$onInit = function () {
                    if (!$ctrl.game.publishers) {
                        $ctrl.publishers = [];
                        $ctrl.publishersSimple = [];
                    } else {
                        $ctrl.publishers = $ctrl.game.publishers;
                        $ctrl.publishersSimple = $ctrl.game.publishers.join(", ");
                    }
                }
            }
        })
})();