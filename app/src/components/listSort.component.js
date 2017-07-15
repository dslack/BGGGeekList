(function(){
    angular.module('BGGGeekListApp')
    .component('sortList', {
        bindings: {
            list: '='
        },
        templateUrl: 'sort.html',
        controller: SortListCtrl
    })

    function SortListCtrl() {
        var $ctrl = this;
        $ctrl.sortBy = 'added';
        $ctrl.sortByAlpha = function(ascending){
            $ctrl.list.sort(function(a,b){
                var o1 = (ascending) ? a : b;
                var o2 = (ascending) ? b : a;
                return o1.objectname.localeCompare(o2.objectname);
            })
        }

        $ctrl.sortByAdded = function(){
            $ctrl.list.sort(function(a,b){
                return b.postdate.localeCompare(a.postdate);
            })
        }
    }
})();