var _ = require('lodash');
var EditTools = require('./EditTools').EditTools;
var EditorClass = (( EDITOR_ENV.user )? require('./Editor_user').UserEditor : require('./Editor_admin').Editor );
var tools = require('./themeTools').tools;

// to trzeba stąd wynieśc do modułu editor
var scaleRightTop = require('./toolsManager/tools/scaleRightTop').scaleRightTop;
var scaleRightBottom = require('./toolsManager/tools/scaleRightBottom').scaleRightBottom;
var scaleLeftTop = require('./toolsManager/tools/scaleLeftTop').scaleLeftTop;
var scaleLeftBottom = require('./toolsManager/tools/scaleLeftBottom').scaleLeftBottom;
var rotateOutside = require('./toolsManager/tools/rotateOutside').rotateOutside;
var scaleRightMiddle = require('./toolsManager/tools/scaleRightMiddle').scaleRightMiddle;
var scaleLeftMiddle = require('./toolsManager/tools/scaleLeftMiddle').scaleLeftMiddle;
var scaleTopMiddle = require('./toolsManager/tools/scaleTopMiddle').scaleTopMiddle;
var scaleBottomMiddle = require('./toolsManager/tools/scaleBottomMiddle').scaleBottomMiddle;

var resizeRightTop = require('./toolsManager/tools/resizeRightTop').resizeRightTop;
var resizeRightBottom = require('./toolsManager/tools/resizeRightBottom').resizeRightBottom;
var resizeRight = require('./toolsManager/tools/resizeRight').resizeRight;
var resizeLeftTop = require('./toolsManager/tools/resizeLeftTop').resizeLeftTop;
var resizeLeftBottom = require('./toolsManager/tools/resizeLeftBottom').resizeLeftBottom;
var resizeBottomMiddle = require('./toolsManager/tools/resizeBottomMiddle').resizeBottomMiddle;
var resizeLeftMiddle = require('./toolsManager/tools/resizeLeftMiddle').resizeLeftMiddle;
var resizeTopMiddle = require('./toolsManager/tools/resizeTopMiddle').resizeTopMiddle;
import {reactInit} from './ReactSetup';
// aż dotąd --->
/*
if( EDITOR_ENV.user ){

    alert( 'Raczej działa' );

}else {

    alert('Nie działa');

}
*/

reactInit();
var config;

function getURLParameters(){

        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");

        for (var i=0;i<vars.length;i++) {

            var pair = vars[i].split("=");

            if (typeof query_string[pair[0]] === "undefined") {

                query_string[pair[0]] = decodeURIComponent(pair[1]);

            } else if (typeof query_string[pair[0]] === "string") {

                var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
                query_string[pair[0]] = arr;

            } else {

                query_string[pair[0]].push(decodeURIComponent(pair[1]));

            }
        }

        return query_string;

    };

var runEditor = function(){

	setUpEditor();
    createjs.DisplayObject.prototype.snapToPixel = true;
    createjs.DisplayObject.prototype.snapToPixelEnabled = true;
    function setUpEditor(){

        var Editor = new EditorClass();
        Editor.userType = userType;
        
            Editor.init( "testowy" );
            window.editor = Editor;
            var editTools = new EditTools('bitmap');
            editTools.addComponent( scaleRightTop );
            editTools.addComponent( scaleRightBottom );
            editTools.addComponent( scaleLeftTop );
            editTools.addComponent( scaleLeftBottom );
            editTools.addComponent( rotateOutside );
            editTools.addComponent( scaleRightMiddle );
            editTools.addComponent( scaleLeftMiddle );
            editTools.addComponent( scaleTopMiddle );
            editTools.addComponent( scaleBottomMiddle );


            Editor.toolsManager.addTool(editTools);


            var complexViewTools = new EditTools( 'complexView' );
            complexViewTools.addComponent( rotateOutside );

            Editor.toolsManager.addTool( complexViewTools );


            var editableAreaTools = new EditTools( 'editableArea' );
            editableAreaTools.addComponent( rotateOutside );

            Editor.toolsManager.addTool( editableAreaTools );


            var proposedPositionTools = new EditTools('proposedPosition');

            proposedPositionTools.addComponent( resizeRightTop );
            proposedPositionTools.addComponent( resizeRight );
            proposedPositionTools.addComponent( resizeRightBottom );
            proposedPositionTools.addComponent( resizeLeftTop );
            proposedPositionTools.addComponent( resizeLeftBottom );
            proposedPositionTools.addComponent( rotateOutside );
            proposedPositionTools.addComponent( resizeBottomMiddle );
            proposedPositionTools.addComponent( resizeLeftMiddle );
            proposedPositionTools.addComponent( resizeTopMiddle );

            Editor.toolsManager.addTool( proposedPositionTools );

            var textTools = new EditTools('text');

            textTools.addComponent( resizeRightTop );
            textTools.addComponent( resizeRight );
            textTools.addComponent( resizeRightBottom );
            textTools.addComponent( resizeLeftTop );
            textTools.addComponent( resizeLeftBottom );
            textTools.addComponent( rotateOutside );
            textTools.addComponent( resizeBottomMiddle );
            textTools.addComponent( resizeLeftMiddle );
            textTools.addComponent( resizeTopMiddle );
            //textTools.addComponent( objectRemover );
            //textTools.addComponent( moveDownTool );
            //textTools.addComponent( moveUpTool );

            Editor.toolsManager.addTool( textTools );


            var cropingTool = new EditTools('cropingBitmap');
            cropingTool.addComponent( scaleRightTop );
            cropingTool.addComponent( resizeRight );

            Editor.toolsManager.addTool( cropingTool );


            thumbGenerator = $("#thumbGenerator");
            document.getElementById('uploader').addEventListener('change', function(e) {
                    Editor.handleFileSelect(e, 1);}, false);

            thumbinator = new createjs.Stage("thumbGenerator");

                var windowWidth =  window.innerWidth;
                var windowHeight = parseInt(window.innerHeight) - 80;

                $("#testowy").attr('width', windowWidth);
                $("#testowy").attr('height', windowHeight);

                $( "#listaUL" ).sortable({
                    revert: true
                });
                $( "ul, li" ).disableSelection();

            window.requestAnimFrame = (function(){

                return  window.requestAnimationFrame       ||
                    window.webkitRequestAnimationFrame ||
                      window.mozRequestAnimationFrame    ||
                        function( callback ){
                        window.setTimeout(callback, 1000 / 60);
                };

            })();


            Editor.ticker.setFPS( 60 );


            document.addEventListener("editorLoaded", function(){

                Editor.ticker.addEventListener( 'tick', tick);

            });

            var ticksCounter = 0 ;

            function tick( event ){

                Editor.stage.moveObjects();
                Editor.getStage().update(event);

            };

            Editor.stage.decomposeMainLayer();
            Editor.updateLayers();

    }

};

window.onload = function(){

	runEditor();

};
