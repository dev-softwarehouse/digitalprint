/**
 * Created by Rafał on 27-05-2017.
 */
angular.module('dpClient.helpers')
.directive('angularCanvas', function( CanvasService ) {

    function rotate(  ) {

    }

    function link(scope, element, attrs) {

        var ticker = createjs.Ticker.addEventListener("tick", handleTick);

        var photo = scope.photo;

        var canvas = element[0];

        console.log('photo', photo);

        canvas.width = photo.width;
        canvas.height = photo.height;

        var context = canvas.getContext('2d');

        var stage = new createjs.Stage("photoCanvas");

        var container = new createjs.Container();

        var image = new Image();
        image.crossOrigin = "Anonymous";
        image.src = photo.minUrl;

        image.onload = function() {
            var bitmap = new createjs.Bitmap(image);

            var scale = canvas.width/photo.width;

            bitmap.scaleX = bitmap.scaleY = scale;

            stage.addChild(container);
            container.addChild(bitmap);

            CanvasService.setCanvas(canvas);
            CanvasService.setContext(context);
            CanvasService.setStage(stage);
            CanvasService.setBitmap(bitmap);
            CanvasService.setContainer(container);
        };

        function handleTick(event) {
            stage.update();
        }
    }

    return {
        restrict: 'E',
        replace: true,
        scope: true,
        link: link,
        template: '<canvas id="photoCanvas" class="center-block"></canvas>',
        controller: ['$scope', '$element', '$attrs',
            function ($scope, $element, $attrs) {




            }
        ]
    };
});