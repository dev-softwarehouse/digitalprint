var EditorLayer = require('./class/EditorLayer').EditorLayer;
var mouseDown = [ 0, 0, 0 ];
var Stage = require('./stage').Stage;
var Bitmap = require('./class/EditorBitmap').Bitmap;

if( EDITOR_ENV.user  ){

    var EditableArea = require('./class/editablePlane_user').EditableArea;
    var Cover = require('./class/CoverObject.js').default;

}else {

    var EditableArea = require('./class/editablePlane_admin').EditableArea;

}

// tutaj trzeba zaimportować scenę do której będizmy się odnościć :), będzie to decorator tej klasy

        /**
    * Inicjalizacja sceny, dodawane sa tu eventy do elementu canvas
    *
    * @method initScene
    * @param {Object} themePage
    */


    Stage.prototype.initScene = function ( stage, w, h ){

        this.stage = stage;

        var mainLayer = new EditorLayer('mainLayer');
        var netHelper = new EditorLayer('netHelper');
        var IRulersLayer = new EditorLayer('rulers');

        this.MAIN_LAYER = mainLayer.id;
        $("span.list").attr('data-id', this.MAIN_LAYER);

        this.setNetHelper( netHelper );
        this.setMainLayer( mainLayer );
        this.setIRulersLayer( IRulersLayer );

        this.editor.DigitMaker.init();


        this.initRulers();
        this.setToolsLayer( new EditorLayer('tools') );

        this.getToolsLayer().addChild( test );

        this.stage.addEventListener('stagemousemove', function( e ){

            var pos = this.getMousePosition( e.stageX, e.stageY );
            this.editor.webSocketControllers.emitMousePosition( pos[0], pos[1] );

        }.bind( this ));

        this.editor.getCanvas().on('mouseup', function( e ){

            mouseDown = false;

        }.bind( this ));

        this.editor.getCanvas().on('mousedown', function( e ){

            this.moveVector = { x : e.clientX, y : e.clientY };
            this.mouseDown = true;
            this.mouseButton = e.button;

            var obj = [];
            this.editor.getStage()._getObjectsUnderPoint( e.clientX, e.clientY-50, obj );


        }.bind( this ));

        this.stage.addEventListener('dragstop', function( e ){

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

        }.bind( this ) );

        this.stage.addEventListener('drop', function( e ){

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


        this.stage.addEventListener('addedPage', function( e ){

            this.editor.stage.addObject( e.pageObject );
            //Editor.adminProject.view.layer.addChild( e.pageObject );

        }.bind( this ));


        this.stage.addEventListener('addedObject', function(e){

            var object = createObject( e.objectInfo );

            this.editor.stage.addObject( object );
            this.editor.adminProject.view.layer.addChild( object );
            this.editor.templateAdministration.updateAttributesContent();

        }.bind( this ) );


        this.stage.addEventListener('addedNotUploadedImage', function(e){

            var object = e.objectInfo;

            this.editor.stage.addObject( object );
            Editor.adminProject.view.layer.addChild( object );
            Editor.templateAdministration.updateAttributesContent();

        }.bind( this ) );

        this.stage.addEventListener('imageUploaded', function(e){


        });


        this.stage.addEventListener('removedObject', function(e){


            var objectToRemove = getObjectByDbId( e.objectId );

            objectToRemove.parent.removeChild( objectToRemove );

            Editor.adminProject.view._removeObject( e.objectId );
            Editor.templateAdministration.updateAttributesContent();

        });



        this.stage.addEventListener('dragover', function( e ){

            var overObjects = [];

            var pages = this.getPages();

            for( var i=0; i < pages.length; i++ ){

               pages[i].initHitArea();

            }

            this.editor.getStage()._getObjectsUnderPoint( e.clientX, e.clientY-50, overObjects );


            var obj = overObjects.slice(0);

            for( var i=0; i<overObjects.length; i++ ){

                if( this.dragOverObjects.indexOf(obj[i]) == -1 ){

                    overObjects[i].dispatchEvent('dragover');

                }

            }

            for( var i=0; i < this.dragOverObjects.length; i++ ){

                if( obj.indexOf(this.dragOverObjects[i]) == -1 )
                {

                    this.dragOverObjects[i].dispatchEvent('dragleave');

                }

            }

            this.dragOverObjects = overObjects.slice(0);

        }.bind( this ) );



    };

    Stage.prototype.centerCameraXuser = function (){

        var stageScale = this.editor.stage.getStage().scaleX;
        var canvasWidth = this.editor.getCanvas().width();
        var bounds = this.editor.stage.getMainLayer().getTransformedBounds();
        this.editor.stage.getStage().x = ( canvasWidth/2 - (bounds.x+(bounds.width/2))*stageScale ) + 160 + (  parseInt($("#toolsBox").css('left'))/2 );
        var centerAnyObjectEvent = new createjs.Event( "stageScroll" );
        this.dispatchEventForAllObject( centerAnyObjectEvent );

    };


    Stage.prototype.centerCameraYuser = function (){

        var stageScale = this.editor.getStage().scaleX;
        var canvasHeight = this.editor.getCanvas().height();
        var bounds = this.editor.stage.getMainLayer().getTransformedBounds();
        var open = false;

        if( document.getElementById('viewsListUser').getAttribute('isopen') == 'true' || document.getElementById('pagesListUser').getAttribute('isopen') == 'true' ){

            open = true;

        }

        var canvasHeightDiff = canvasHeight - ( (bounds.height) * this.editor.getStage().scaleX);

        this.editor.getStage().y = (canvasHeight/2 - (bounds.y+(bounds.height/2))*stageScale ) - ( ( !open )? $('.currentPagesSwitcher').height()/2 : ($('#pagesListUser').height()/2 )+ $('.currentPagesSwitcher').height()/2) ; // = ( canvasHeightDiff )- ( ( stageScale > 1 ) ? (parseInt($('#pagesListUser').height())/stageScale) : ( parseInt($('#pagesListUser').height())*stageScale )) + - ( ( stageScale > 1 ) ? (parseInt($('#pagesListUser').css('bottom'))/stageScale) : ( parseInt($('#pagesListUser').css('bottom'))*stageScale ));
        var centerAnyObjectEvent = new createjs.Event( "stageScroll" );
        this.editor.stage.dispatchEventForAllObject( centerAnyObjectEvent );

    };

	Stage.prototype.updateEditingTools = function( obj ){

    	//var editingObject = Editor.stage.getObjectById( editing_id );

    };

    Stage.prototype.updateView = function( view, userPages ){

        // trzeba zrobić usuwanie z wszystkich mniejsc referenicj
        var pages = this.editor.stage.getPages();

        var mainLayer = this.editor.stage.getLayer( this.MAIN_LAYER );
        mainLayer.removeAllChildren();



        this.getIRulersLayer().removeAllChildren();

        // jeĹźeli nie ma zainicjowanego widoku
        if( !view ) {

            this.editor.template.warningView('Brak widoków do załadowania, musisz utworzyć przynajmniej jeden, aby projekt być widoczny dla użytkownika!');
            return false;

        }

        var test = new EditorLayer( 'widok' );
        test.editor = this.editor;
        var pageLayer = new EditorLayer( 'page' );
        pageLayer.editor = this.editor;

        this.editor.adminProject.format.view.setLayer( test );

        // to trzeba przeniesc do inita view
        var viewLayer = this.editor.adminProject.format.view.getLayer();
        this.editor.adminProject.format.view.page.setPageLayer( pageLayer );

        this.mainLayer.addChild( viewLayer );
        this.mainLayer.addChild( pageLayer );

        var objectsToAdd = [];

        for( var i=0; i < view.EditorTexts.length; i++ ){

        	var text = view.EditorTexts[i];

			var object = new Text2( text.name, text.width, text.height, false, false );
            object.editor = this.editor;
	        //object.order =
	        object.init( true );
	        object.generateCursorMap();
		 	object.dbID = text._id;

		 	if( text.content ){
				for( var line=0; line < text.content.length; line++ ){

	                var _line = new TextLine( 0, 0, text.content[line].lineHeight );
	                object.addLine( _line );
	                _line.initHitArea();
	                _line.uncache();

	                for( var letter=0; letter < text.content[line].letters.length; letter++ ){

	                    var _letter = new TextLetter(

	                        text.content[line].letters[letter].text,
	                        text.content[line].letters[letter].fontFamily,
	                        text.content[line].letters[letter].size,
	                        text.content[line].letters[letter].color,
	                        text.content[line].letters[letter].lineHeight,
	                        text.content[line].letters[letter].fontType.regular,
	                        text.content[line].letters[letter].fontType.italic,
                            this.editor

	                    );

	                    _line.addCreatedLetter( _letter );
	                }
	            }
	        }

	        // niewiem dlaczego nie działa
            //object.generateCursorMap();

	        object.setTrueHeight( text.height );
	        object.setTrueWidth( text.width );
	        object._updateShape();
        	object.setPosition_leftCorner( text.x, text.y );

	        objectsToAdd.push( object );


    	}

        //sprawdzić czy są instancją, a potem czy  obj.imageShape.visible = false;

        for( var i=0; i < view.EditorBitmaps.length; i++ ){
            if( view.EditorBitmaps[i].ProjectImage ){

                var data = view.EditorBitmaps[i];

                if( !data.ProjectImage.minUrl ){

                    var projectImage = Editor.userProject.getProjectImage( data.ProjectImage.uid );
                    data.ProjectImage = projectImage;

                }

                var newEditorBitmap = new Bitmap(

            		data.ProjectImage.name,
            		data.ProjectImage.minUrl,
            		false,
            		true,
            		data

                );
                newEditorBitmap.editor = this.editor;
                newEditorBitmap.uid = data.uid;
                newEditorBitmap.dbID = data._id;
                newEditorBitmap.x = data.x;
                newEditorBitmap.y = data.y;
                newEditorBitmap.dbID = data._id;

                newEditorBitmap.regX = data.ProjectImage.width/2;
                newEditorBitmap.regY = data.ProjectImage.height/2;
                newEditorBitmap.order = data.order;

                //newEditorBitmap.initEvents();
                //initObjectDefaultEvents( newEditorBitmap );

                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").drawRect(0, 0, data.ProjectImage.width, data.ProjectImage.height );
                newEditorBitmap.hitArea = hit;


                newEditorBitmap.trueHeight = data.ProjectImage.trueHeight;
                newEditorBitmap.trueWidth = data.ProjectImage.trueWidth;
                //newEditorBitmap.setCenterReg();

                objectsToAdd.push( newEditorBitmap );

                var projectImage = this.editor.adminProject.getProjectImage(data.ProjectImage.uid);


            }

        }


        var needSort = 1;

        do {

            var smaller = false;

            for( var i=0; i< objectsToAdd.length-1; i++ ){

                if( objectsToAdd[i].order > objectsToAdd[i+1].order ){

                    smaller = true;
                    var tmp = objectsToAdd[i+1];
                    objectsToAdd[i+1] = objectsToAdd[i];
                    objectsToAdd[i] = tmp;

                }

            }

            if( smaller )
                needSort = 1;
            else
                needSort = 0;

        }
        while( needSort );

        for( var i=0; i < objectsToAdd.length; i++ ){

            this.editor.stage.addObject( objectsToAdd[i] );
            this.editor.adminProject.format.view.addEditorObject( objectsToAdd[i] );
            objectsToAdd[i].prepareMagneticLines( this.editor.getMagnetizeTolerance() );

        };

        var pages = [];

        for( var i=0; i<view.Pages.length; i++ ){

            var objectInfo = view.Pages[i];

            if( objectInfo.type == 2 ){

                //alert('slope');
                var object = new Cover( this.editor, objectInfo.name, objectInfo.width, objectInfo.height, objectInfo._id, objectInfo.slope, objectInfo.vacancy, objectInfo.spread, this.editor.userProject.getCoverHeight() );
                object.editor = this.editor;
                object.userPage = userPages[i];
                object.updateWithContentFromDB( objectInfo );
                object.dbID = objectInfo._id;

                object.init();
                object.rotate( view.Pages[i].rotation || 0 );
                object.initUserToolBar();
                object.initUserBottomToolbar();
                pages.push( object );
                this.editor.stage.addObject( object );
                pageLayer.addChild( object );

                // ladowanie obiektów
                object.prepareScene( userPages[i] );
                object.updateScene();

            }else {

                //alert('slope');
                var object = new EditableArea( this.editor, objectInfo.name, objectInfo.width, objectInfo.height, objectInfo._id, objectInfo.slope, objectInfo.vacancy, objectInfo.spread );
                object.editor = this.editor;
                object.userPage = userPages[i];
                object.updateWithContentFromDB( objectInfo );
                object.dbID = objectInfo._id;

                object.init();
                object.rotate( view.Pages[i].rotation || 0 );
                object.initUserToolBar();
                object.initUserBottomToolbar();
                pages.push( object );
                this.editor.stage.addObject( object );
                pageLayer.addChild( object );

                // ladowanie obiektów
                object.prepareScene( userPages[i] );
                object.updateScene();

            }
            

        }

        this.editor.stage.setPages( pages );

        window.testPages = pages;

        var editing_id = this.editor.tools.getEditObject();
        var editingObject = this.editor.stage.getObjectById( editing_id );
        var centerZoomAtStageEvent = new createjs.Event( "stageScroll" );
        var currentViewPages = this.editor.stage.getPages();
        var currentEditableArea = currentViewPages[0];
        //var obj = Editor.stage.getObjectById( this.getAttribute('data-local-id') );

        var centerAnyObject = function ( obj ){

            var centerAnyObjectEvent = new createjs.Event( "stageScroll" );

            this.editor.template.resizeToUserObject( obj );
            this.editor.stage.dispatchEventForAllObject( centerAnyObjectEvent );

        }.bind( this )

        centerAnyObject( currentEditableArea );

        var centerToPointEvent = new createjs.Event( "stageScroll" );

        this.editor.stage.dispatchEventForAllObject( centerToPointEvent );

        this.editor.stage.redrawRulers();
        this.editor.stage.updateNetHelper();

        this.editor.templateAdministration.updateLayers( this.editor.adminProject.format.view.getLayer().children );

    };

    export { Stage };
