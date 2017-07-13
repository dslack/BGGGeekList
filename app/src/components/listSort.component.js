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

        $ctrl.sortByAlpha = function(){
            $ctrl.list.sort(function(a,b){
                return a.objectname.localeCompare(b.objectname);
            })
        }

        $ctrl.sortByAdded = function(){
            $ctrl.list.sort(function(a,b){
                return b.postdate.localeCompare(a.postdate);
            })
        }
    }
})();