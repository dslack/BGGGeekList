(function () {
    var newLineRE = /<br>\s*?<br>/g;

	var parse_string = "ddd, DD MMM YYYY HH:mm:ss +0000";
	var hyperlinksRE = /<a href="\/(.*?)">(.*?)<\/a>/g;
	var imageresizerRE = /(<img.*)(onload="ImageResizer.resize\(this\);")(.*>)/g;

    angular.module('BGGGeekListApp')
        .directive('publisherNotes', function ($sce) {
            return {
                restrict: 'A',
                scope: {
                    game: "="
                },
                template: '<strong>Publisher Notes :</strong> <span ng-bind-html="pubNotes"></span>',

                link: function (scope) {

                    var vm = scope;
                    var notes = vm.game.publisherNotes;
                    if (!notes) {
                        notes = "";
                    }
                    notes = notes.replace(/^<br>/, "");
                    notes = notes.replace(/<br>$/, "");
                    notes = notes.replace(newLineRE, "<br>");

                    notes = notes.replace(hyperlinksRE, '<a target="_blank" href="https://boardgamegeek.com/$1">$2</a>');

                    notes = notes.replace(imageresizerRE, '$1$3');

                    //we want to strip out the post_fre div...
                    var docFrag = document.createDocumentFragment();
                    var div = document.createElement('div');
                    div.innerHTML = '<div>' + notes + '</div>';
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
            }
        });
})();