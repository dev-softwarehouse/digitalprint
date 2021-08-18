var EditorLayer = require('./class/EditorLayer').EditorLayer;
var mouseDown = [ 0, 0, 0 ];
var Stage = require('./stage').Stage;
var Bitmap = require('./class/EditorBitmap').Bitmap;
if( EDITOR_ENV.user  ){

    var EditableArea = require('./class/editablePlane_user').EditableArea;

}else {

    var EditableArea = require('./class/editablePlane_admin').EditableArea;

}
/*
var firstAAA = true;

var _stage = Editor.getStage();
var editor = Editor;
var tools = Editor.tools;
var updateTools = false;
var pages = [];
var editGroups = [];
var mainLayer;
var layers = {};
var attributesLayers = {};
var layersOrder = []; // kolejnosc rysowania warstw
var dragOverObjects = [];
var overObjects = [];
var width = 5000;
var height = 5000;

var netHelper = null;
var rulersLayer = null;
var rulerTopLayer = null;
var rulerRightLayer = null;
var scaleDigits = null;
var toolsLayer = null;
var IRulersLayer = null;
var objectToMove = null;

var settings = {
	netHelperDistance : 50,
	netResolution : 5000
};

var cursorsObjects = {};

var objectsDB = {};
var objects = {};
var photos = {}; // zdjecia oczekujace na dodanie do sceny
var editableAreas = {};
var selectedObjects = [];

var width, height;
var startWidth, startHeight;

var rulerContainer = new createjs.Container();
var rulerXbg = new createjs.Shape();
var rulerYbg = new createjs.Shape();
var rulerCorner = new createjs.Shape();
var mouseCursorX = new createjs.Shape();
var mouseCursorY = new createjs.Shape();

mouseCursorX.graphics.f("red").mt(0,0).lt(6,6).lt(12,0).ef();
mouseCursorX.regX = 6;

mouseCursorY.graphics.f("red").mt(0,0).lt(6,6).lt(0,12).ef();
mouseCursorY.regY = 6;

var rulerX = new createjs.Container();
var rulerY = new createjs.Container();

rulerContainer.addChild( rulerXbg, rulerYbg, rulerX, rulerY, rulerCorner, mouseCursorX, mouseCursorY);

var layer = new createjs.Container();
layer.x = layer.y = 0;

var mouseOffset = false;
var sceneContainer = new createjs.Container();
var mask = new createjs.Shape();





/**
* Inicjalizacja sceny, dodawane sa tu eventy do elementu canvas
*
* @method initScene
* @param {Object} themePage
*/

var p = Stage.prototype;

p.initScene = function ( stage, w, h ){

    this.stage = stage;
	var mainLayer = new EditorLayer('mainLayer');
    var netHelper = new EditorLayer('netHelper');
    var IRulersLayer = new EditorLayer('rulers');

	this.MAIN_LAYER = mainLayer.id;
	$("span.list").attr('data-id', MAIN_LAYER);

    this.editor.stage.setNetHelper( netHelper );
	this.editor.stage.setMainLayer( mainLayer );
    this.editor.stage.setIRulersLayer( IRulersLayer );
    // Trzeba zrobiÄ if w zaleĹźnoĹci od trybu edytora

    this.editor.DigitMaker.init();


    this.editor.stage.initRulers();
    this.editor.stage.setToolsLayer( new EditorLayer('tools') );
    this.editor.stage.getToolsLayer().addChild( test );
    this.editor.stage.initNetHelper();

    this.editor.getStage().addEventListener('stagemousemove', function( e ){

        var pos = this.editor.stage.getMousePosition( e.stageX, e.stageY );
        this.editor.webSocketControllers.emitMousePosition( pos[0], pos[1] );

    }.bind( this ));

	this.editor.getCanvas().on('mouseup', function( e ){
		this.mouseDown = false;
	}.bind( this ));

	this.editor.getCanvas().on('mousedown', function( e ){

		this.moveVector = { x : e.clientX, y : e.clientY };
		this.mouseDown = true;
		this.mouseButton = e.button;

	}.bind( this ));

    this.editor.getStage().addEventListener('dragstop', function( e ){

        var projectImage = this.editor.adminProject.getProjectImage( e.bitmapObject.getAttribute('data-uid') );

       	var _stage = this.editor.getStage();
		var _stagePos = this.editor.stage.getMousePosition( _stage.mouseX, _stage.mouseY );

        var mousePos = { x : _stagePos[0], y : _stagePos[1] };

        var viewID = this.editor.adminProject.format.view.getId();
        var projectImageUID =  e.bitmapObject.getAttribute('data-uid');
        var pos = { x: mousePos.x, y: mousePos.y };
        var order = 0;
        var width = projectImage.width;
        var height = projectImage.height;

        var editorBitmapSettings = {

        	projectImageUID  : projectImageUID,
        	rotation         : 0,
            scaleX           : 1,
            scaleY           : 1,
            order            : this.editor.adminProject.format.view.getLayer().children.length

    	};

        this.editor.webSocketControllers.editorBitmap.add(
        	projectImageUID,
        	viewID,
        	pos.x,
        	pos.y,
        	width,
        	height,
        	this.editor.adminProject.format.view.getLayer().children.length,
        	'View',
        	this.editor.adminProject.format.view.getId()
        );

    }.bind( this ));


	this.editor.getCanvas().on('mousemove', function(e){

        //Editor.webSocketControllers.emitMousePosition(zz);

		e = e || window.event;
		var button;

		if( this.mouseDown && this.mouseButton == 1 ){

   			var mainLayerSize = this.editor.stage.getMainLayer().getTransformedBounds();
            //console.log( mainLayerSize );
            var area = this.editor.stage.getVisibleAreaSize();

			var vector = {};
			vector.x =  this.moveVector.x - e.clientX;
			vector.y =  this.moveVector.y - e.clientY;
			this.moveVector.x = e.clientX;
			this.moveVector.y = e.clientY;
			this.editor.getStage().x -= vector.x;
			this.editor.getStage().y -= vector.y;

			if( userType == 'user' ){

                if( area.width-200 > mainLayerSize.width ){

                    this.editor.stage.centerCameraX();

                }
                if( area.height-100 > mainLayerSize.height ){

                    this.editor.stage.centerCameraY();

                }

			}

			var evt = new Event('stageMove');

			//$(".tools-box").trigger( evt );
            this.editor.stage.updateRulers();

			var stageObjects = this.editor.stage.getObjects();


			for( var key in stageObjects ){

				stageObjects[ key ].dispatchEvent("stageMove");

			}

		}

	}.bind( this ));

	this.editor.getStage().addEventListener('drop', function( e ){

		e.stopPropagation();
		var obj = [];
		this.editor.getStage()._getObjectsUnderPoint( e.clientX, e.clientY-50, obj );

		if( obj.length > 0 )
			obj[0].dispatchEvent(e);

        var pages = this.editor.stage.getPages();

        for( var i=0; i<pages.length; i++){

            pages[i].removeHitArea();

        }

	}.bind( this ));


    this.editor.getStage().addEventListener('addedPage', function( e ){

        this.editor.stage.addObject( e.pageObject );
        //Editor.adminProject.view.layer.addChild( e.pageObject );

    }.bind( this ));


    this.editor.getStage().addEventListener('addedObject', function(e){

        var object = createObject( e.objectInfo );

        this.editor.stage.addObject( object );
        this.editor.adminProject.view.layer.addChild( object );
        this.editor.templateAdministaration.updateAttributesContent();

    }.bind( this ));


    this.editor.getStage().addEventListener('addedNotUploadedImage', function(e){

        var object = e.objectInfo;

        this.editor.stage.addObject( object );
        this.editor.adminProject.view.layer.addChild( object );
        this.eEditor.templateAdministaration.updateAttributesContent();

    }.bind( this ));

    this.editor.getStage().addEventListener('imageUploaded', function(e){

         //alert('rozgĹaszam ze jest ok');

    }.bind( this ));


    this.editor.getStage().addEventListener('removedObject', function(e){

        //alert("Scena mĂłwi : 'usuwam obiekt o id : " + e.objectId + "'");

        var objectToRemove = getObjectByDbId( e.objectId );

        objectToRemove.parent.removeChild( objectToRemove );

        this.editor.adminProject.view._removeObject( e.objectId );
        this.editor.templateAdministaration.updateAttributesContent();

    }.bind( this ));


	this.editor.getStage().addEventListener('dragover', function( e ){

		overObjects = [];

        for( var i=0; i < pages.length; i++ ){

           pages[i].initHitArea();

        }

		this.editor.getStage()._getObjectsUnderPoint( e.clientX, e.clientY-50, overObjects );


		var obj = overObjects.slice(0);

		for( var i=0; i<overObjects.length; i++ ){

			if( dragOverObjects.indexOf(obj[i]) == -1 ){

				overObjects[i].dispatchEvent('dragover');

			}

		}

		for( var i=0; i < dragOverObjects.length; i++ ){

			if( obj.indexOf(dragOverObjects[i]) == -1 )
			{

				dragOverObjects[i].dispatchEvent('dragleave');

			}

		}

		dragOverObjects = overObjects.slice(0);



	}.bind( this ));



};

export { Stage };
