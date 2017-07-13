(function () {
    angular.module('BGGGeekListApp')
        .component('designers', {
            bindings: {
                game: "<",
                simpleView: "<"
            },
            template: '<strong>Designers :</strong> <ul ng-class="{\'list-inline\': vm.simpleView}" class="list-unstyled"><li ng-repeat="designer in vm.designers">{{::designer}}</li></ul>',
            controller: function () {
                var $ctrl = this;
                $ctrl.$onInit = function () {
                    if (!$ctrl.game.designers) {
                        $ctrl.designers = [];
                        $ctrl.designersSimple = [];
                    } else {
                        $ctrl.designers = $ctrl.game.designers;
                        $ctrlvm.designersSimple = $ctrl.game.designers.join(", ");
                    }
                }
            }
        });
})();   