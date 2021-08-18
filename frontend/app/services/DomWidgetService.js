angular.module('digitalprint.services')
    .factory( 'DomWidgetService', function ( ) {

        function pinElementWhenScroll(mainSelector, positionSelector, widthSelector) {

            var wrap = document.querySelector(mainSelector);
            var configWrap = document.querySelector(widthSelector);
            var wrapWidth = configWrap.clientWidth;
            var panelHeading = document.querySelector(positionSelector);

            var position = getPosition(panelHeading);

            $(window).on("scroll", function(e) {

                if (this.scrollY > position.y) {
                    addClass(wrap, "fix-panel");
                    wrap.style.width = wrapWidth + 'px';
                } else {
                    removeClass(wrap, "fix-panel");
                    wrap.style.width = 'auto';
                }

            });

            $(window).on('resize', function () {
                wrapWidth = configWrap.clientWidth;
                if (this.scrollY > position.y) {
                    wrap.style.width = wrapWidth + 'px';
                }
            });
        }

        function getPosition(element) {
            var xPosition = 0;
            var yPosition = 0;

            while(element) {
                xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
                element = element.offsetParent;
            }

            return { x: xPosition, y: yPosition };
        }

        function hasClass(element, existClass) {
            return !!element.className.match(new RegExp('(\\s|^)'+existClass+'(\\s|$)'));
        }

        function addClass(element, newClass) {
            if (!hasClass(element, newClass)) element.className += " " + newClass;
        }

        function removeClass(element,existClass) {
            if (hasClass(element, existClass)) {
                var reg = new RegExp('(\\s|^)' + existClass + '(\\s|$)');
                element.className=element.className.replace(reg,' ');
            }
        }

        return {
            pinElementWhenScroll: pinElementWhenScroll
        }

    });
