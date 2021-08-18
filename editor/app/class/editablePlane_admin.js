    import {Bitmap} from './EditorBitmap';
    import {ProposedPosition2} from './ProposedPosition2';
    import {Text2} from './Text2_admin';
    import {TextLetter} from './TextLetter';
    import {TextLine} from './TextLine';
    import {EditableAreaTool} from './tools/editableAreaTools_admin';
    import {EditableArea} from './editablePlane';
    import {safeImage} from "../utils";

    var p = EditableArea.prototype;

    p.setPosition = function( x, y ){

		this.x = x;
		this.y = y;

		if( this.mask ){

			this.mask.x = x;
			this.mask.y = y;

		}

        if( this.contextMenu ){

            this.contextMenu._updateToolsBoxPosition();

        }

        this.editor.template.getReactEditorSettings().setEditableArea( this.editor.adminProject.format.view.page.get().pageObject );

    };

    p.updateScene = function(){

        //console.log( this );
        //console.log('((((((((((((()))))))))))))');

    }

    p.initProposedTemplateTool = function( parentProposedTemplate ){



    };

    p.init = function(){



        var _this = this;
        var Editor = this.editor;
        //this.initHitArea();

        this.initEvents();
        this.prepareMagneticLines( Editor.getMagnetizeTolerance() );
        this.addEventListener('mouseover', function( e ){

        });


        this.addEventListener( 'pressup', function( e ){

            e.stopPropagation();

            _this.updatePositionInDB();

        });


        this.addEventListener('destroyBitmap', function( e ){

            for( var key in _this.getUsedPhotos() ){


                if( _this.usedPhotos[ key ].uid == e.uid ){

                    delete _this.usedPhotos[ key ];

                }

            }


        });


        this.addEventListener('stageScroll', function(e){

            var scaleX = 1;
            var scaleY = 1;
            var parent = _this.parent;

           // this.hitArea = new createjs.Shape();
            //this.hitArea.graphics.f('red').r( 0,0,width,height);

            while( parent ){

                scaleX *= parent.scaleX;
                scaleY *= parent.scaleY;
                parent = parent.parent;

            }

            if( _this.settings.slope ) {

                //this.slopeShape = new createjs.Graphics();
                // trzeba tutaj przenieść ramkę
                _this.slopeShape.graphics.c().ss(1/scaleX).s("#fff").mt(1,1).lt(_this.width-1, 1).lt(_this.width-1, _this.height-1 ).lt(1, _this.height-1).cp();
                _this.slopeShape.graphics.ss(1/scaleX).s("#F00").mt( _this.settings.slope, _this.settings.slope).lt(_this.width-(_this.settings.slope), _this.settings.slope).lt( _this.width-( _this.settings.slope ), _this.height-( _this.settings.slope ) ).lt( _this.settings.slope, _this.height - (_this.settings.slope)).cp().es();
                _this.slopeShape.graphics.f("rgba(0, 0, 0, 0.34)").r(0,0, _this.width, _this.settings.slope).r(_this.width -_this.settings.slope, _this.settings.slope, _this.settings.slope, _this.height - _this.settings.slope).r( 0, _this.height - _this.settings.slope, _this.width -_this.settings.slope, _this.settings.slope).r(0, _this.settings.slope, _this.settings.slope, _this.height-(_this.settings.slope*2));
                //this.slopeShape = new createjs.Shape( this.slopeShape );
                _this.borderShape.graphics.c().ss(1/scaleX).s("#00d1cd").mt(0,0).lt( _this.width, 0).lt( _this.width, _this.height ).lt(0, _this.height).cp();
            }
            else {

                //this.slopeShape = new createjs.Graphics();
                _this.slopeShape.graphics.c();//.ss(1/scaleX).s("#00d1cd").mt(1,1).lt(_this.width-1, 1).lt(_this.width-1, _this.height-1 ).lt(1, _this.height-1).cp();
                _this.borderShape.graphics.c().ss(1/scaleX).s("#00d1cd").mt(0,0).lt( _this.width, 0).lt( _this.width, _this.height ).lt(0, _this.height).cp();
                //this.slopeShape = new createjs.Shape( this.slopeShape );

            }
            //_this.slopeShape.graphics.c().ss(1/scaleX).s("#00d1cd").mt(0,0).lt(_this.width, 0).lt(_this.width, _this.height ).lt(0, _this.height).cp();


        });


        this.addEventListener("drop", function(e){

            e.stopPropagation();

            _this.dragOverflowBackground.visible = false;
            _this.removeHitArea();

            _this.hitArea = null;


            var fileReader = new FileReader();

            fileReader.readAsDataURL( e.dataTransfer.files[0] );

            fileReader.onload = function( freader ){

                var loadedImage = new createjs.Bitmap( freader.target.result );

                loadedImage.image.onload = function(){

                    var smallBitmap = Thumbinator.generateThumb( loadedImage );

                    var newBitmap = new Editor.Bitmap("new", smallBitmap );

                    newBitmap.tmp_image = e.dataTransfer.files[0];

                    newBitmap.image.onload = function(){

                        newBitmap.width = newBitmap.trueWidth = newBitmap.image.width;
                        newBitmap.height = newBitmap.trueHeight = newBitmap.image.height;
                        newBitmap.initEvents();

                        if( _this.foregroundLayer.visible ){

                            _this.foregroundLayer.addChild( newBitmap );
                            Editor.stage.addObject( newBitmap );

                        }
                        else if( _this.backgroundLayer.visible ){

                            _this.backgroundLayer.addChild( newBitmap );
                            Editor.stage.addObject( newBitmap );

                        }

                    };

                }

            };



        });


        this.addEventListener("dragover", function(e){

            _this.dragOverflowBackground.visible = true;

        });

        this.addEventListener("dragleave", function(e){

            _this.dragOverflowBackground.visible = false;

        });

        this.addEventListener('mousedown', function( e ){

            //console.log( this );
            //console.log('JEST I DZIAŁA');

            if( e.nativeEvent.button == 0 ){
                if( !_this.toolBox ){

                    var toolboxInstance = new EditableAreaTool( _this );
                    _this.toolBox = toolboxInstance;
                    _this.toolBox._updateToolsBoxPosition();

                }

                e.stopPropagation();

                var currentPage = Editor.adminProject.format.view.page.get();



                    Editor.adminProject.format.view.page.changePage( _this.dbID );


            }

        });

        this.addEventListener('unclick', function( e ){

            e.stopPropagation();

            //console.log('UNKLICK ->>>>>>>>>>>>>>>>>>>>>>> !!!!!');

            if( _this.toolBox )
                _this.toolBox.removeTools();

            _this.toolBox = null;

        });

        this.addEventListener('stageScroll', function( e ){

            e.stopPropagation();

            if( _this.toolBox )
                _this.toolBox._updateToolsBoxPosition();

        });

        this.addEventListener('stageMove', function( e ){

            e.stopPropagation();

            if( _this.toolBox )
                _this.toolBox._updateToolsBoxPosition();

        });

    };

    /**
    * Ustala nową pozycję obiektu
    *
    * @method setPosition
    * @param {Int} x Pozycja x
    * @param {Int} y Pozycja y
    */
    p.setPosition = function( x, y ){

    		this.x = x;
    		this.y = y;

    		if( this.mask ){

    			this.mask.x = x;
    			this.mask.y = y;

    		}

            if( this.contextMenu ){

                this.contextMenu._updateToolsBoxPosition();

            }

            this.editor.template.getReactEditorSettings().setEditableArea( this.editor.adminProject.format.view.page.get().pageObject );

    };


    /**
    * Wykonuje rotacje na oobiekcie
    *
    * @method rotate
    * @param {Int} rotation
    */
    p.rotate = function( rotation ){

        rotation = parseFloat( rotation );

    	var editing_id = this.editor.tools.getEditObject();
        var editingObject = this.editor.stage.getObjectById( editing_id );

        var rot = parseFloat( this.rotation ) + rotation|| 0;

    	this.rotation = rot ;

    	if( this.mask ){

    		this.mask.rotation = rot;

    	}

        this.editor.template.getReactEditorSettings().setEditableArea( this.editor.adminProject.format.view.page.get().pageObject );

    };

    p.setRotation = function( rotation ){

    	this.rotation = rotation;

    	if( this.mask ){
    		this.mask.rotation = parseInt(rotation);
    	}

        this.editor.template.getReactEditorSettings().setEditableArea( this.editor.adminProject.format.view.page.get().pageObject );

    };

    /**
    * Wczytuje stronę motywu
    *
    * @method loadThemePage
    * @param {Object} themePage
    */
    p.loadThemePage = function( themePage ){

        this.cleanTheme();

        //console.log( themePage );
        //console.log('888888888888888888888888888888');

        var objectsInOrder = [];

        var backgroundObjects = [];

        for( var i=0; i < themePage.backgroundObjects.EditorBitmaps.length; i++ ){

            themePage.backgroundObjects.EditorBitmaps[i].type = 'EditorBitmap';
            backgroundObjects.push( themePage.backgroundObjects.EditorBitmaps[i] );

        }

        for( var i=0; i < themePage.backgroundObjects.EditorTexts.length; i++ ){

            themePage.backgroundObjects.EditorTexts[i].type = 'EditorText';
            backgroundObjects.push( themePage.backgroundObjects.EditorTexts[i] );

        }


        var foregroundObjects = [];

        for( var i=0; i < themePage.foregroundObjects.EditorBitmaps.length; i++ ){

            themePage.foregroundObjects.EditorBitmaps[i].type = 'EditorBitmap';
            foregroundObjects.push( themePage.foregroundObjects.EditorBitmaps[i] );

        }

        for( var i=0; i < themePage.foregroundObjects.EditorTexts.length; i++ ){

            themePage.foregroundObjects.EditorTexts[i].type = 'EditorText';
            foregroundObjects.push( themePage.foregroundObjects.EditorTexts[i] );

        }


        // teraz następuje sortowanie:::
        var needSort = 1;

        do {

            var smaller = false;

            for( var i=0; i< backgroundObjects.length-1; i++ ){

                if( backgroundObjects[i].order > backgroundObjects[i+1].order ){

                    smaller = true;
                    var tmp = backgroundObjects[i+1];
                    backgroundObjects[i+1] = backgroundObjects[i];
                    backgroundObjects[i] = tmp;

                }
            }

            if( smaller )
                needSort = 1;
            else
                needSort = 0;

        }
        while( needSort );


        // teraz następuje sortowanie:::
        var needSort = 1;

        do {

            var smaller = false;

            for( var i=0; i< foregroundObjects.length-1; i++ ){

                if( foregroundObjects[i].order > foregroundObjects[i+1].order ){

                    smaller = true;
                    var tmp = foregroundObjects[i+1];
                    foregroundObjects[i+1] = foregroundObjects[i];
                    foregroundObjects[i] = tmp;

                }
            }

            if( smaller )
                needSort = 1;
            else
                needSort = 0;

        }
        while( needSort );

        for( var i=0; i < backgroundObjects.length; i++ ){

            var data = backgroundObjects[i];

            if( data.type == 'EditorBitmap' ){

                var img = safeImage();
                img.src = data.ProjectImage.minUrl;

                var newEditorBitmap = new Bitmap( data.ProjectImage.name, img, true );
                newEditorBitmap.uid = data.uid;
                newEditorBitmap.dbID = data._id;
                newEditorBitmap.x = data.x;
                newEditorBitmap.y = data.y;
                newEditorBitmap.dbID = data._id;
                newEditorBitmap.setBounds( 0, 0, data.ProjectImage.width, data.ProjectImage.height  );
                newEditorBitmap.width = data.ProjectImage.width;
                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").drawRect(0, 0, data.ProjectImage.width, data.ProjectImage.height );
                newEditorBitmap.hitArea = hit;
                newEditorBitmap.height = data.ProjectImage.height;
                newEditorBitmap.regX = data.ProjectImage.width/2;
                newEditorBitmap.regY = data.ProjectImage.height/2;
                newEditorBitmap.trueHeight = data.ProjectImage.trueHeight;
                newEditorBitmap.trueWidth = data.ProjectImage.trueWidth;
                newEditorBitmap.scaleX = data.scaleX;
                newEditorBitmap.rotation = data.rotation;
                newEditorBitmap.scaleY = data.scaleY;
                newEditorBitmap.collectionReference = data.ProjectImage;
                newEditorBitmap.collectionReference.dbID = data.ProjectImage._id;
                this.backgroundLayer.addChild( newEditorBitmap );

                this.editor.stage.initObjectDefaultEvents( newEditorBitmap );

                //newEditorBitmap.prepareMagneticLines( this.editor.getMagnetizeTolerance() );

                this.editor.stage.addObject( newEditorBitmap );

            }
            else if( data.type == 'EditorText' ){

                var text = data;

                var object = new Text2( text.name, text.width, text.height, false, true );
                //object.order =
                object.init( true );
                object.generateCursorMap();
                object.dbID = text._id;
                object.shadowBlur = text.shadowBlur;
                object.shadowColor = text.shadowColor;
                object.shadowOffsetY = text.shadowOffsetY;
                object.shadowOffsetX = text.shadowOffsetX;
                object._dropShadow = text.dropShadow;
                object.setRotation( text.rotation );

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

                object.setTrueHeight( text.height );
                object.setTrueWidth( text.width );
                object._updateShape();
                object.setPosition( text.x, text.y );
                object.prepareMagneticLines( this.editor.getMagnetizeTolerance() );
                this.backgroundLayer.addObject( object );

            }

        }

        for( var i=0; i < foregroundObjects.length; i++ ){

            var data = foregroundObjects[i];

            if( data.type == 'EditorBitmap' ){

                var img = safeImage();
                img.src = data.ProjectImage.minUrl;

                var newEditorBitmap = new Bitmap( data.ProjectImage.name, img, true );
                newEditorBitmap.uid = data.uid;
                newEditorBitmap.dbID = data._id;
                newEditorBitmap.x = data.x;
                newEditorBitmap.y = data.y;
                newEditorBitmap.dbID = data._id;
                newEditorBitmap.setBounds( 0, 0, data.ProjectImage.width, data.ProjectImage.height  );
                newEditorBitmap.width = data.ProjectImage.width;
                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").drawRect(0, 0, data.ProjectImage.width, data.ProjectImage.height );
                newEditorBitmap.hitArea = hit;
                newEditorBitmap.height = data.ProjectImage.height;
                newEditorBitmap.regX = data.ProjectImage.width/2;
                newEditorBitmap.regY = data.ProjectImage.height/2;
                newEditorBitmap.trueHeight = data.ProjectImage.trueHeight;
                newEditorBitmap.trueWidth = data.ProjectImage.trueWidth;
                newEditorBitmap.scaleX = data.scaleX;
                newEditorBitmap.scaleY = data.scaleY;
                newEditorBitmap.rotation = data.rotation;
                newEditorBitmap.collectionReference = data.ProjectImage;
                newEditorBitmap.collectionReference.dbID = data.ProjectImage._id;

                this.foregroundLayer.addChild( newEditorBitmap );
                Editor.stage.initObjectDefaultEvents( newEditorBitmap );

                newEditorBitmap.prepareMagneticLines( this.editor.getMagnetizeTolerance() );
                Editor.stage.addObject( newEditorBitmap );

            }
            else if( data.type == 'EditorText' ){

                var text = data;

                var object = new Text2( text.name, 20, text.width, text.height, false, true );
                //object.order =
                object.init( true );
                object.generateCursorMap();
                object.dbID = text._id;
                object.shadowBlur = text.shadowBlur;
                object.shadowColor = text.shadowColor;
                object.shadowOffsetY = text.shadowOffsetY;
                object.shadowOffsetX = text.shadowOffsetX;
                object._dropShadow = text.dropShadow;
                object.setRotation( text.rotation );

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

                object.setTrueHeight( text.height );
                object.setTrueWidth( text.width );
                object._updateShape();
                object.setPosition( text.x, text.y );
                object.prepareMagneticLines( this.editor.getMagnetizeTolerance() );
                this.foregroundLayer.addObject( object );

            }

        }

    };


 /**
    * Wczytuje szablon pozycji proponowanych do obiektu
    *
    * @method loadTemplate
    * @param template referencja do obiektu reprezentującego szablon pozycji proponowanych
    */
    p.loadTemplate = function( template ){

        //this.adminProposedTemplate =

        if( template == null ){

            for( var uo = 0; uo < this.userLayer.children.length; uo++ ){

                this.userLayer.children[uo].removeMagneticLines();

            }

            this.userLayer.removeAllChildren();
            return true;

        }

        for( var i=0; i< this.proposedImagePositions.length; i++ ){

            this.proposedImagePositions[i].removeCollectionReference();

        }

        var objects = [];

        // zbieranie obiktów do jendej tablicy, a następnie posortowane jej
        for( var i=0; i < template.ProposedImages.length; i++ ){

            template.ProposedImages[i].type = 'Image';
            objects.push( template.ProposedImages[i] );

        }

        for( var i=0; i < template.ProposedTexts.length; i++ ){

            template.ProposedTexts[i].type = 'Text';
            objects.push( template.ProposedTexts[i] );

        }

        // teraz następuje sortowanie:::
        var needSort = 1;

        do {

            var smaller = false;

            for( var i=0; i< objects.length-1; i++ ){

                if( objects[i].order > objects[i+1].order ){

                    smaller = true;
                    var tmp = objects[i+1];
                    objects[i+1] = objects[i];
                    objects[i] = tmp;

                }
            }

            if( smaller )
                needSort = 1;
            else
                needSort = 0;

        }
        while( needSort );

        for( var uo = 0; uo < this.userLayer.children.length; uo++ ){

            //console.log( this.userLayer.children[uo]);
            this.userLayer.children[uo].removeMagneticLines();

        }

        this.userLayer.removeAllChildren();

        for( var i=0; i < objects.length; i++ ){

            var proposed = objects[i];

            if( proposed.type == 'Image' ){

                var proposedPosition = new ProposedPosition2( this.editor, "test", null, proposed.size.width, proposed.size.height );
                this.editor.stage.addObject( proposedPosition );
                this.userLayer.addObject( proposedPosition );
                this.proposedImagePositions.push( proposedPosition );
                proposedPosition.dbID = proposedPosition.dbId = proposed._id;
                proposedPosition.setPosition( proposed.pos.x, proposed.pos.y );
                proposedPosition.rotate( proposed.rotation );
                proposedPosition.prepareMagneticLines( this.editor.getMagnetizeTolerance());
                proposedPosition._updateShape();

            }
            else if( proposed.type == 'Text' ){

                var lineHeight = 40;

                var obj = new Editor.Text2( "Text", lineHeight, proposed.size.width, proposed.size.height, true, true );//, generated.size.width, generated.size.height );
                obj.init();
                this.editor.stage.addObject( obj );
                this.userLayer.addObject( obj );
                obj.dbID = obj.dbId = proposedPosition._id;
                obj.setCenterReg();
                obj.setPosition( proposed.pos.x, proposed.pos.y );
                obj.rotate( proposed.rotation );
                obj.prepareMagneticLines( this.editor.getMagnetizeTolerance());

            }

        }
    };


    p.prepareToDrop = function(){

        var _this = this;

        var areaDropBackground = new createjs.Shape();
        areaDropBackground.graphics.f(createjs.Graphics.getRGB(34, 179, 36, 0.5)).r( 0, 0, this.width/2, this.height );
        areaDropBackground.setBounds(0, 0, this.width/2, this.height );
        areaDropBackground.target = _this;

        areaDropBackground.addEventListener('dragstop', function( e ){

            e.stopPropagation();

            //console.log( e );
            //console.log( 'background' );

            e.currentTarget.target.loadImage( e.bitmapObject, 'background' );

        });

        areaDropBackground.addEventListener('mouseover', function( e ){

            e.stopPropagation();
            areaDropBackground.graphics.c().f(createjs.Graphics.getRGB(102, 255, 0, 0.5 )).r( 0, 0, _this.width/2 , _this.height );

        });

        areaDropBackground.addEventListener('mouseout', function( e ){

            e.stopPropagation();
            areaDropBackground.graphics.c().f(createjs.Graphics.getRGB(34, 179, 36, 0.5) ).r( 0, 0, _this.width/2 , _this.height );


        });


        var areaDropForeground = new createjs.Shape();
        //areaDropForeground.graphics.f(createjs.Graphics.getRGB(230, 142, 0, 0.5)).r( this.width/2, 0, this.width/2, this.height );
        areaDropForeground.graphics.f(createjs.Graphics.getRGB(15, 89, 30, 0.5)).r( this.width/2, 0, this.width/2, this.height );

        areaDropForeground.setBounds(0, 0, this.width/2, this.height );
        areaDropForeground.target = _this;

        areaDropForeground.addEventListener('dragstop', function( e ){

            e.stopPropagation();
            e.currentTarget.target.loadImage(  e.bitmapObject, 'foreground' );

        });

        areaDropForeground.addEventListener('mouseover', function( e ){

           e.stopPropagation();
           areaDropForeground.graphics.c().f(createjs.Graphics.getRGB(0, 222, 45, 0.5) ).r( _this.width/2, 0, _this.width/2 , _this.height );

        });

        areaDropForeground.addEventListener('mouseout', function( e ){

           e.stopPropagation();
           areaDropForeground.graphics.c().f(createjs.Graphics.getRGB(15, 89, 30, 0.5) ).r( _this.width/2, 0, _this.width/2 , _this.height );

        });

        this.dropLayer.addChild( areaDropBackground );
        this.dropLayer.addChild( areaDropForeground );

        for( var i =0; i < this.proposedImagePositions.length; i++ ){

            var position = this.proposedImagePositions[i];

            var shape = new createjs.Shape();
            shape.graphics.f(createjs.Graphics.getRGB(12, 93, 89, 0.5)).r( 0, 0, _this.proposedImagePositions[i].width , _this.proposedImagePositions[i].height );
            shape.setBounds( 0, 0, 200, 200 );

            shape.regX = position.regX;
            shape.regY = position.regY;

            shape.x = position.x;
            shape.y = position.y;
            shape.rotation = position.rotation;

            this.dropLayer.addChild( shape );

            var width = _this.proposedImagePositions[i].width;
            var height = _this.proposedImagePositions[i].height;

            var dropFrameDisplay = document.createElement('div');
            dropFrameDisplay.id = 'dropFrameDisplay';
            dropFrameDisplay.className = 'dropFrameDisplayClass';

            shape.target = _this.proposedImagePositions[i];
            shape.addEventListener('mouseover', function( e ){

                e.stopPropagation();
                var eve = new createjs.Event('mousedown');
                e.target.dispatchEvent( eve );
                e.target.graphics.c().f( createjs.Graphics.getRGB(79, 215, 201, 0.5) ).r( 0, 0, e.target.target.width , e.target.target.height );

            });

            shape.addEventListener('mouseout', function( e ){
                e.stopPropagation();
                e.target.graphics.c().f(createjs.Graphics.getRGB(12, 93, 89, 0.5)).r( 0, 0, e.target.target.width , e.target.target.height );

            });

            shape.addEventListener('pressup', function( e ){
                e.stopPropagation();
                e.target.graphics.c().f(createjs.Graphics.getRGB(12, 93, 89, 0.5)).r( 0, 0, e.target.target.width , e.target.target.height );

            });

            shape.addEventListener('dragstop', function( e ){

                e.stopImmediatePropagation();
                e.stopPropagation();
                e.currentTarget.target.loadImage(  e.bitmapObject );

            });

        }

    };

export {EditableArea};
