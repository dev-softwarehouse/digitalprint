/**
 * Created by Rafał on 03-03-2017.
 */
angular.module('digitalprint.services')
    .factory( 'TextWidgetService', function ($q) {

        function TextWidgetService( json ) {
            angular.extend( this, json );
        }

        function findWord(html, lines) {

            var plainText = (new DOMParser).parseFromString(html, "text/html") .
                documentElement . textContent;
            var splitText = plainText.split(' ');

            var chars = 0;
            for(var i=0;i<splitText.length;i++) {
                chars += splitText[i].length;
                if( chars >= lines ) {
                    return splitText[i];
                }
            }
            return false;
        }

        function findParagraph(html, word) {
            var paragraphs = (new DOMParser).parseFromString(html, "text/html") . querySelectorAll('p');

            if( paragraphs.length === 1 ) {
                return false;
            }

            var text = '';
            for(var i=0;i<paragraphs.length;i++) {
                if( paragraphs[i].nextElementSibling ) {
                    text = paragraphs[i].nextElementSibling.innerHTML.replace(/<[^>]*>/g, "");
                    if( text.indexOf(word) !== -1 ) {
                        return i;
                    }
                }
            }

            if( typeof word === 'string' && word.length > 0 ) {
                return 0;
            }
            return false;
        }

        function getLess(html, paragraph) {
            var paragraphs = (new DOMParser).parseFromString(html, "text/html") . querySelectorAll('p');

            var template = '';

            for(var i=0;i<paragraphs.length;i++) {

                template += paragraphs[i].innerHTML;

                if( paragraph === i ) {
                    return template;
                }
            }

            return false;
        }

        return {
            findWord: findWord,
            findParagraph: findParagraph,
            getLess: getLess
        };
    });
