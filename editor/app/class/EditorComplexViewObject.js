
this.Editor = this.Editor || {};

(function(){

	/**
	* Klasa reprezentująca obiekt widoku.
	*
	* @class EditorComplexViewObject
	* @constructor
	*/
	function EditorComplexViewObject( initEvents, viewID, settings ){

        settings = {

            width : 0,
            height: 0,

        };

        // inicjalizacja konstruktorów
        Editor.Object.call( this, initEvents, settings );     
        this.trueWidth  = this.width  = 0;
        this.trueHeight = this.height = 0;
        this.regX = this.regY = 0;
        this.toolsType = 'complexView';

        this.loadView( viewID );

	};


	var p = EditorComplexViewObject.prototype = $.extend( true, {}, Editor.Object.prototype );


	p.constructor = EditorComplexViewObject;


    p.updateTransformInDB = function(){

        // narazie nie bedzie to dzialalo
        //Editor.webSocketControllers.editorBitmap.setTransform( this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.dbID );

    };


    p.loadView = function( viewID ){

        var _this = this;

        Editor.webSocketControllers.view.get( viewID, {}, function( view ){

            //console.log( view );

            var objectsToAdd = [];

            for( var i=0; i < view.EditorBitmaps.length; i++ ){

                if( view.EditorBitmaps[i].ProjectImage ){
                    var data = view.EditorBitmaps[i];
                    
                    var newEditorBitmap = new Editor.Bitmap( 
                        
                        data.ProjectImage.name, 
                        data.ProjectImage.minUrl, 
                        true, 
                        true,
                        {
                            width    : data.ProjectImage.width,
                            height   : data.ProjectImage.height,
                            scaleX   : data.scaleX,
                            scaleY   : data.scaleY,
                            rotation : data.rotation                
                        }

                    );

                    newEditorBitmap.uid = data.uid;
                    newEditorBitmap.dbID = data._id;
                    newEditorBitmap.x = data.x;
                    newEditorBitmap.y = data.y;
                    newEditorBitmap.dbID = data._id;
                    
                    newEditorBitmap.regX = data.ProjectImage.width/2;
                    newEditorBitmap.regY = data.ProjectImage.height/2;
                    newEditorBitmap.order = data.order;
                    
                    newEditorBitmap.initEvents();
                    //initObjectDefaultEvents( newEditorBitmap );
                    
                    var hit = new createjs.Shape();
                    hit.graphics.beginFill("#000").drawRect(0, 0, data.ProjectImage.width, data.ProjectImage.height );
                    newEditorBitmap.hitArea = hit;


                    newEditorBitmap.trueHeight = data.ProjectImage.trueHeight;
                    newEditorBitmap.trueWidth = data.ProjectImage.trueWidth;
                    //newEditorBitmap.setCenterReg();

                    objectsToAdd.push( newEditorBitmap );

                    var projectImage = Editor.adminProject.getProjectImage(data.ProjectImage.uid);
                    //Editor.stage.addObject( newEditorBitmap );
                    //Editor.adminProject.format.view.addEditorBitmap( newEditorBitmap, 0 );
                    //newEditorBitmap.prepareMagneticLines( Editor.getMagnetizeTolerance() );
                    
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

            //console.log('posortowane obiekty');
            //console.log( objectsToAdd );
            //console.log('=-=-=-=-=-=-=-=-=-=-=');

            for( var i=0; i < objectsToAdd.length; i++ ){

                _this.addChild( objectsToAdd[i] );
                //objectsToAdd[i].prepareMagneticLines( Editor.getMagnetizeTolerance() );

            };


            //console.log( _this.getTransformedBounds() );

            var bounds = _this.getTransformedBounds();

            _this.width = this.trueWidth = bounds.width;
            _this.height = this.trueHeight = bounds.height;

            _this.regX = _this.width/2;
            _this.regY = _this.height/2;


            for( var i=0; i < objectsToAdd.length; i++ ){

               objectsToAdd[i].x += Math.abs( bounds.x );// - Math.abs( _this.width/2 );
               objectsToAdd[i].y += Math.abs( bounds.y );// - Math.abs( _this.height/2 );

            };

            pages = [];
            
            for( var i=0; i<view.Pages.length; i++ ){

                var objectInfo = view.Pages[i];
                //console.log( view.Pages[i] );

                var object = new Editor.EditableArea( objectInfo.name, objectInfo.width, objectInfo.height, objectInfo._id, objectInfo.slope, objectInfo.vacancy, objectInfo.spread );

                object.updateWithContentFromDB( objectInfo );
                object.dbID = objectInfo._id;
                object.init();
                object.rotate( view.Pages[i].rotation || 0 );
                object.setPosition( object.x + Math.abs( bounds.x ), object.y + Math.abs( bounds.y ));
            

                _this.addChild( object );
                
            }


        });

    };


	Editor.EditorComplexViewObject = EditorComplexViewObject;


    
})();