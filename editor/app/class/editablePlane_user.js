    import {Bitmap} from './EditorBitmap';
    import {ProposedPosition2} from './ProposedPosition2';
    import {Text2} from './Text2';
    import {TextLetter} from './TextLetter';
    import {TextLine} from './TextLine';
    import {EditableArea} from './editablePlane';
    import {safeImage} from "../utils";

    var p = EditableArea.prototype;

    p.loadUserPage = function( userPage ){

        if( userPage.ThemePage )
            this.loadThemePage( userPage.ThemePage );

        if( userPage.ProposedTemplate ){

            this.loadTemplate( userPage.ProposedTemplate, userPage.UsedImages, userPage.UsedTexts, userPage.ProposedTemplate.options );

        }

    };

    p.updateScene = function(){

        for( var i=0; i < this.scene.length; i++ ){

            this.userScene.addChild( this.scene[i].object );

            if( this.scene[i].object instanceof Text2 ){

                if( this.scene[i].object.getAllLettersCount()  == 0 ){

                    this.scene[i].object.displayDefaultText();

                }

            }

        }

        var options = this.templateOptions;

        if( options && this.editor.userType == 'user' ){

            if( options.canSwapTemplate > 1 ){

                this.makePosibleToSwapTemplate();

            }else {

                this.resetPosibleToSwapTemplate();

            }

            if( options.canAddOneMoreText ){

                this.makePosibleToAddText();

            }else {

                this.resetPosibleToAddText();

            }

            if( options.canRemoveOneText ){

                this.makePosibleToRemoveText();

            }else {

                this.resetPosibleToRemoveText();

            }

            if( options.canAddOneMoreImage ){

                this.makePosibleToAddImage();

            }else {

                this.resetPosibleToAddImage();

            }

            if( options.canRemoveOneImage ){

                this.makePosibleToRemoveImage();

            }else {

                this.resetPosibleToRemoveImage();

            }

        }else if( options && this.editor.userType == 'advancedUser'){

            this.makePosibleToAddImage();
            this.makePosibleToAddText();

            if( options.canSwapTemplate > 1 ){

                this.makePosibleToSwapTemplate();

            }else {

                this.resetPosibleToSwapTemplate();

            }

        }

        this.editor.tools.setEditingObject( null );

    };

    p.prepareScene = function( userPage ){


        var _this = this;

        var scene = {};

        if( userPage.ProposedTemplate && userPage.ProposedTemplate.options ){

            this.templateOptions = userPage.ProposedTemplate.options;

        }else {

            this.templateOptions = {};

        }


        this.userPage = userPage;

        for( var key in userPage.scene ){

            var obj = createObject( userPage.scene[key], key );

            scene[key] = {};
            scene[key].order = userPage.scene[key].order;
            scene[key].object = obj;
            scene[key].objectType = userPage.scene[key].objectType;

        }


        var _scene = [];

        for( var key in scene ){

            _scene.push( scene[key] );

        }

        this.scene = _scene;
        this.scene = _.sortBy( this.scene, 'order' );

        var editor = this.editor;

        function createObject( obj, key ){

            var objectData = obj.object;

            if( obj.objectType == 'bitmap' ){

                var img = safeImage();
                img.src = EDITOR_ENV.staticUrl+objectData.ProjectImage.minUrl;

                var newObject = new Bitmap( objectData.ProjectImage.name, img, true, true, {

                    dropShadow: objectData.dropShadow,
                    shadowBlur: objectData.shadowBlur,
                    shadowOffsetX: objectData.shadowOffsetX,
                    shadowOffsetY: objectData.shadowOffsetY,
                    shadowColor  : objectData.shadowColor,
                    borderColor  : objectData.borderColor,

                });

                newObject.editor = _this.editor
                newObject.uid = objectData.uid;
                newObject.dbID = objectData._id;

                if( userType == 'user' ){

                    newObject.x = objectData.x - _this.slope;
                    newObject.y = objectData.y - _this.slope;

                }else if( userType == 'advancedUser'){

                    newObject.x = objectData.x;
                    newObject.y = objectData.y;

                }

                //TODO: tutaj jest maly balagan...

                newObject.borderWidth = objectData.borderWidth;
                newObject.displaySimpleBorder = objectData.displaySimpleBorder;
                newObject.simpleBorder.visible = objectData.displaySimpleBorder;

                newObject.dbID = objectData._id;
                newObject.setBounds( 0, 0, objectData.ProjectImage.width, objectData.ProjectImage.height  );
                newObject.width = objectData.ProjectImage.width;
                var hit = new createjs.Shape();
                hit.graphics.beginFill("#000").drawRect(0, 0, objectData.ProjectImage.width, objectData.ProjectImage.height );
                newObject.hitArea = hit;
                newObject.height = objectData.ProjectImage.height;
                newObject.regX = objectData.ProjectImage.width/2;
                newObject.regY = objectData.ProjectImage.height/2;
                newObject.trueHeight = objectData.ProjectImage.trueHeight;
                newObject.trueWidth = objectData.ProjectImage.trueWidth;
                newObject.scaleX = objectData.scaleX;
                newObject.rotation = objectData.rotation;
                newObject.scaleY = objectData.scaleY;
                newObject.collectionReference = objectData.ProjectImage;
                newObject.collectionReference.dbID = objectData.ProjectImage._id;
                newObject.display
                //Editor.stage.initObjectDefaultEvents( newEditorBitmap );
                newObject.prepareMagneticLines( _this.editor.getMagnetizeTolerance() );
                _this.editor.stage.addObject( newObject );
                newObject.updateSimpleBorder();

                if( objectData.backgroundFrame ){

                    _this.editor.webSocketControllers.frameObject.get( objectData.backgroundFrameID, function( data ){

                        newObject.useBackgroundFrame = true;
                        newObject.setBackgroundFrame( data );

                    });

                }

            }else if( obj.objectType == 'proposedImage' ) {


                var newObject = new ProposedPosition2( _this.editor, "test", null, objectData.size.width, objectData.size.height );
                _this.editor.stage.addObject( newObject );
                _this.proposedImagePositions.push( newObject );
                newObject.order = objectData.order;
                newObject.dbID = newObject.dbId = objectData._id;
                // tutaj trzeba zobaczyc czy est slope

                if( _this.editor.userType == 'user'){
                    newObject.setPosition( objectData.pos.x - _this.slope, objectData.pos.y-_this.slope );
                }else if( _this.editor.userType == 'advancedUser'){
                    newObject.setPosition( objectData.pos.x , objectData.pos.y );
                }

                newObject.rotate( objectData.rotation );
                newObject.prepareMagneticLines( _this.editor.getMagnetizeTolerance());

                if( objectData.objectInside ){

                    newObject.loadImage( objectData.objectInside );

                }

                var settings = {

                    borderWidth : objectData.borderWidth,
                    displaySimpleBorder : objectData.displaySimpleBorder,
                    borderColor : objectData.borderColor,
                    backgroundFrame: objectData.backgroundFrame,
                    backgroundFrameID: objectData.backgroundFrameID,
                    maskFilter: objectData.maskFilter,
                    dropShadow : objectData.dropShadow,
                    shadowBlur : objectData.shadowBlur,
                    shadowOffsetX : objectData.shadowOffsetX,
                    shadowOffsetY : objectData.shadowOffsetY,
                    shadowColor   : objectData.shadowColor

                };

                newObject.setSettings( settings );

            } else if( obj.objectType == 'proposedText' ){

                var lineHeight = 40;

                var newObject = new Text2( "Text", objectData.size.width, objectData.size.height, true, true );//, generated.size.width, generated.size.height );
                newObject.editor = _this.editor;

                if( objectData.content ){

                    newObject.init( false );

                }else {

                    newObject.init( false );

                }

                _this.editor.stage.addObject( newObject );
                newObject.isProposedPosition = true;
                newObject.dbID = newObject.dbId = objectData._id;
                newObject.order = objectData.order;

                newObject.setBackgroundColor( objectData.backgroundColor );

                newObject.setBackgroundAlpha( objectData.backgroundOpacity );
                newObject.setVerticalPadding( objectData.verticalPadding );
                newObject.setHorizontalPadding( objectData.horizontalPadding );

                newObject.shadowBlur = objectData.shadowBlur;
                newObject.shadowOffsetY = objectData.shadowOffsetY;
                newObject.shadowOffsetX = objectData.shadowOffsetX;
                newObject.shadowColor = objectData.shadowColor;
                newObject._currentFontFamily = objectData.fontFamily;
                newObject._currentFont = _this.editor.fonts.selectFont( objectData.fontFamily,  newObject._currentFontType.regular,  newObject._currentFontType.italic );
                newObject.showBackground = objectData.showBackground;
                if( objectData.showBackground ){
                    newObject.displayBackground();
                }else {
                    newObject.hideBackground();
                }
                newObject._align=objectData._align;
                newObject.verticalAlign=objectData.verticalAlign;

                //obj.setTrueHeight( usedTexts[currentText].trueHeight );
                //obj.setTrueWidth( usedTexts[currentText].trueWidth );

                if( objectData.content ){

                    newObject.loadContent( objectData.content );
                    
                    for( var line=0; line < objectData.content.length; line++ ){
                        
                        var _line = new TextLine( 0, 0, objectData.content[line].lineHeight );
                        _line.align = objectData._align;
                        newObject.addLine( _line );
                        _line.initHitArea();
                        _line.uncache();

                        for( var letter=0; letter < objectData.content[line].letters.length; letter++ ){

                            var _letter = new TextLetter(

                                objectData.content[line].letters[letter].text,
                                objectData.content[line].letters[letter].fontFamily,
                                objectData.content[line].letters[letter].size,
                                objectData.content[line].letters[letter].color,
                                objectData.content[line].letters[letter].lineHeight,
                                objectData.content[line].letters[letter].fontType.regular,
                                objectData.content[line].letters[letter].fontType.italic,
                                _this.editor

                            );

                            _line.addCreatedLetter( _letter );

                        }

                    }

                    

                }

                newObject.setCenterReg();

                if( _this.editor.userType == 'user'){

                    newObject.setPosition( objectData.pos.x - _this.slope, objectData.pos.y-_this.slope );

                }else if( _this.editor.userType == 'advancedUser'){

                    newObject.setPosition( objectData.pos.x , objectData.pos.y );

                }

                newObject.rotate( objectData.rotation );
                newObject.prepareMagneticLines( _this.editor.getMagnetizeTolerance());


                for( var line=0; line < newObject.lines.length; line++ ){

                    newObject.lines[line].x = newObject.padding.left;
                    newObject.lines[line].maxWidth = newObject.trueWidth - newObject.padding.left - newObject.padding.right;

                }

                newObject.updateText({

                    lettersPositions : true,
                    linesPosition : true,

                });

            }
            if( objectData.dropShadow ){

                newObject.dropShadow();

            }
            return newObject;

        }

    };

    p.prepareImagesToSwap = function( initedPosition ){

		var _this = this;
        var Editor = this.editor;
        if( Editor.userType == 'advancedUser' )
            return;


        function prepareShape( position ){

            var container = new createjs.Container();

            var image = new Image();

            position.hideDropingToolsToSwap();

            if( position == initedPosition ){

                var iconWidth = 40;
                var iconHeight = 40;

                var changeIcon = new createjs.Bitmap( image );
                image.src = 'app/images/przesuniecie.svg';

                changeIcon.x = position.width/2;
                changeIcon.y = position.height/2;

                changeIcon.regX = iconWidth/2;
                changeIcon.regY = iconHeight/2;

                changeIcon.shadow = new createjs.Shadow( "#565656", 0, 0, 10/Editor.getStage().scaleX );

            }else {

                var iconWidth = 39;
                var iconHeight = 32;

                var changeIcon = new createjs.Bitmap( image );
                image.src = 'app/images/zamiana.svg';
                changeIcon.shadow = new createjs.Shadow("#565656", 0, 0, 10/Editor.getStage().scaleX);

                changeIcon.x = position.width/2;
                changeIcon.y = position.height/2;

                changeIcon.regX = iconWidth/2;
                changeIcon.regY = iconHeight/2;

            }

            changeIcon.scaleX = changeIcon.scaleY = 0;

            var shape = new createjs.Shape();
            shape.graphics.f( 'rgba(138,138,138,0)' ).r( 0, 0, position.width , position.height );
            container.setBounds( 0, 0, 200, 200 );

            container.regX = position.regX;
            container.regY = position.regY;

            container.x = position.x;
            container.y = position.y;

            container.addChild( shape, changeIcon );

            container.rotation = _this.proposedImagePositions[i].rotation;

            _this.dropLayer.addChild( container );

            var width = _this.proposedImagePositions[i].width;
            var height = _this.proposedImagePositions[i].height;

            var defaultScale = 70/40/Editor.getStage().scaleX;
            var targetScale = 90/40/Editor.getStage().scaleX;

            createjs.Tween.removeTweens( changeIcon );
            createjs.Tween.get( changeIcon ).to({scaleX: defaultScale, scaleY: defaultScale}, 300, createjs.Ease.quadInOut );

            shape.alphaValue = 0;

            function redraw(){

                shape.graphics.c().f( 'rgba(214,214,214,'+ shape.alphaValue +')' ).r( 0, 0, shape.target.width , shape.target.height );

            }

            createjs.Tween.removeTweens( shape );
            createjs.Tween.get( shape, { onChange : redraw } ).to({ alphaValue : 0.4 }, 300, createjs.Ease.quadInOut );

            shape.target = _this.proposedImagePositions[i];
            shape.addEventListener('mouseover', function( e ){

                e.stopPropagation();


                if( shape.target == initedPosition ){

                }else {

                    var eve = new createjs.Event('mousedown');
                    e.target.dispatchEvent( eve );
                    e.target.graphics.c().f( 'rgba(214,214,214,'+ e.target.alphaValue +')' ).r( 0, 0, e.target.target.width , e.target.target.height );

                    createjs.Tween.removeTweens(changeIcon);
                    createjs.Tween.get(changeIcon).to({rotation:360, scaleX: targetScale, scaleY: targetScale}, 500, createjs.Ease.quadInOut );

                }

            });

            shape.addEventListener('mouseout', function( e ){

                e.stopPropagation();
                e.target.graphics.c().f('rgba(138,138,138,0.4)').r( 0, 0, e.target.target.width , e.target.target.height );

                if( shape.target == initedPosition ){

                }else {

                    createjs.Tween.removeTweens(changeIcon);
                    createjs.Tween.get(changeIcon).to({rotation:0, scaleX: defaultScale, scaleY: defaultScale}, 250, createjs.Ease.quadInOut );

                }


            });

            shape.addEventListener('pressup', function( e ){

                e.stopPropagation();
                e.target.graphics.c().f('rgba(12,93,89,0.5)').r( 0, 0, e.target.target.width , e.target.target.height );

            });

            shape.addEventListener('swapPhoto', function( e ){

                e.stopImmediatePropagation();
                e.stopPropagation();

                var newBitmap = e.from.objectInside;
                var oldBitmap = ( e.target.target.objectInside )? e.target.target.objectInside.dbID : null ;
                var proposedPosition = e.target.target.dbID;

                Editor.webSocketControllers.proposedImage.replacePhoto(

                    e.from.dbID,
                    proposedPosition,
                    e.from.getFirstImportantParent().userPage._id

                );

                /*
                Editor.webSocketControllers.userPage.replacePhotos(

                    e.from.getFirstImportantParent().userPage._id,
                    newBitmap.dbID,
                    oldBitmap,
                    proposedPosition

                );
                */

            });

        };

        for( var i =0; i < this.proposedImagePositions.length; i++ ){

            //if( initedPosition != this.proposedImagePositions[i] )
                prepareShape( this.proposedImagePositions[i] );

        }



    };

    p.updateTemplate = function( usedImages ){

		function findImageByOrder( order ){

            for( var i=0; i < usedImages.length; i++ ){

                if( usedImages[i].order == order )
                    return usedImages[i];

            }

            return null;

        }

    	var images = _.sortBy( usedImages, 'order');

        for( var i=0; i < this.proposedImagePositions.length; i++ ){

        	var currentPosition = this.proposedImagePositions[i];

            var image = findImageByOrder( currentPosition.order );

            if( image ){

                if( currentPosition.objectInside ){

                    if( currentPosition.objectInside.dbID != image._id )
                        currentPosition.loadImage( image );

                }else {

                    currentPosition.loadImage( image );

                }

            }else {

                if( currentPosition.objectInside ){

                    currentPosition.resetSettings();
                    currentPosition.removeObjectInside();
                }

            }

    	}

    };

    /**
    * Wczytuje szablon pozycji proponowanych do obiektu
    *
    * @method loadTemplate
    * @param template referencja do obiektu reprezentującego szablon pozycji proponowanych
    */
    p.loadTemplate = function( template, usedImages, usedTexts, options ){

        this.templateOptions = options;

        //console.log( template );
        //console.log( options );
        //console.log('*********************');

        if( options ){

            if( options.canAddOneMoreText ){

                this.makePosibleToAddText();

            }else {

                this.resetPosibleToAddText();

            }

            if( options.canRemoveOneText ){

                this.makePosibleToRemoveText();

            }else {

                this.resetPosibleToRemoveText();

            }

            if( options.canAddOneMoreImage ){

                this.makePosibleToAddImage();

            }else {

                this.resetPosibleToAddImage();

            }

            if( options.canRemoveOneImage ){

                this.makePosibleToRemoveImage();

            }else {

                this.resetPosibleToRemoveImage();

            }

        }

    	Editor.tools.setEditingObject( null );

        function findImageByOrder( order ){

            for( var i=0; i < usedImages.length; i++ ){

                if( usedImages[i].order == order )
                    return usedImages[i];

            }

            return null;

        }

        this.userPage.ProposedTemplate = template;
        this.userPage.UsedImages = usedImages || [];

        if( template == null ){

            for( var uo = 0; uo < this.userLayer.children.length; uo++ ){

                this.userLayer.children[uo].removeMagneticLines();

            }

            this.userLayer.removeAllChildren();
            return true;

        }
        /*
        for( var i=0; i< this.proposedImagePositions.length; i++ ){

            this.proposedImagePositions[i].removeCollectionReference();

        }
        */

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

            this.userLayer.children[uo].removeMagneticLines();

        }

        this.proposedImagePositions = [];
        currentImagePosition = 0;

        if( this.userLayer.children.length > 0 ){

            createjs.Tween.get( this.userLayer ).to({ alpha : 0 }, 200, createjs.Ease.quadInOut ).call(

                function(){

                    this.userLayer.removeAllChildren();

                    var currentText = 0;

                    for( var i=0; i < objects.length; i++ ){

                        var proposed = objects[i];

                        if( proposed.type == 'Image' ){

                            var proposedPosition = new ProposedPosition2( this.editor, "test", null, proposed.size.width, proposed.size.height );

                            Editor.stage.addObject( proposedPosition );
                            this.userLayer.addObject( proposedPosition );
                            this.proposedImagePositions.push( proposedPosition );
                            proposedPosition.order = proposed.order;
                            proposedPosition.dbID = proposedPosition.dbId = proposed._id;
                            proposedPosition.setPosition( proposed.pos.x - this.slope, proposed.pos.y-this.slope );
                            proposedPosition.rotate( proposed.rotation );
                            proposedPosition.prepareMagneticLines( Editor.getMagnetizeTolerance());

                            if( usedImages && usedImages.length > 0 ){

                                var image = findImageByOrder( proposedPosition.order );

                                if( image ){

                                    proposedPosition.loadImage( image );

                                }

                            }

                            var settings = {};

                            if( this.userPage.ThemePage.defaultSettings ){

                                for( key in this.userPage.ThemePage.defaultSettings ){

                                    settings[key] = this.userPage.ThemePage.defaultSettings[key];

                                }

                                if( this.userPage.ThemePage.defaultSettings.proposedImagesOpt && this.userPage.ThemePage.defaultSettings.proposedImagesOpt[currentImagePosition] ){

                                    for( key in this.userPage.ThemePage.defaultSettings.proposedImagesOpt[currentImagePosition] ){

                                        settings[key] = this.userPage.ThemePage.defaultSettings.proposedImagesOpt[currentImagePosition][key];

                                    }

                                }


                            }

                            proposedPosition.setSettings( settings );
                            currentImagePosition++;

                        }
                        else if( proposed.type == 'Text' ){

                            var lineHeight = 40;

                            var obj = new Text2( "Text", proposed.size.width, proposed.size.height, true, true );//, generated.size.width, generated.size.height );
                            //console.log('TUTAJ JEST I WCHODZI :)');
                            if( usedTexts && usedTexts[currentText].content ){

                                obj.init(lineHeight, true);

                            }else {

                                obj.init(lineHeight);

                            }

                            Editor.stage.addObject( obj );
                            this.userLayer.addObject( obj );
                            obj.isProposedPosition = true;
                            obj.dbID = obj.dbId = proposed._id;
                            obj.order = proposed.order;


                            var currentTextObject = usedTexts[currentText].content || null;

                            obj.setBackgroundColor( usedTexts[currentText].backgroundColor );

                            obj.setBackgroundAlpha( usedTexts[currentText].backgroundOpacity );
                            obj.setVerticalPadding( usedTexts[currentText].verticalPadding );
                            obj.setHorizontalPadding( usedTexts[currentText].horizontalPadding );
                            obj.usedTextID = usedTexts[currentText]._id;

                            //obj.setTrueHeight( usedTexts[currentText].trueHeight );
                            //obj.setTrueWidth( usedTexts[currentText].trueWidth );

                            if( currentTextObject ){

                                for( var line=0; line < currentTextObject.length; line++ ){

                                    var _line = new TextLine( 0, 0, currentTextObject[line].lineHeight );
                                    _line.align = currentTextObject[line].align;
                                    obj.addLine( _line );
                                    _line.initHitArea();
                                    _line.uncache();

                                    for( var letter=0; letter < currentTextObject[line].letters.length; letter++ ){

                                        var _letter = new TextLetter(

                                            currentTextObject[line].letters[letter].text,
                                            currentTextObject[line].letters[letter].fontFamily,
                                            currentTextObject[line].letters[letter].size,
                                            currentTextObject[line].letters[letter].color,
                                            currentTextObject[line].letters[letter].lineHeight,
                                            currentTextObject[line].letters[letter].fontType.regular,
                                            currentTextObject[line].letters[letter].fontType.italic,
                                            this.editor

                                        );

                                        _line.addCreatedLetter( _letter );

                                    }

                                }

                            }

                            obj.setCenterReg();
                            obj.setPosition( proposed.pos.x-this.slope, proposed.pos.y-this.slope );
                            obj.rotate( proposed.rotation );
                            obj.prepareMagneticLines( Editor.getMagnetizeTolerance());


                            for( var line=0; line < obj.lines.length; line++ ){

                                obj.lines[line].x = obj.padding.left;
                                obj.lines[line].maxWidth = obj.trueWidth - obj.padding.left - obj.padding.right;

                            }

                            obj.updateText({

                                lettersPositions : true,
                                linesPosition : true,

                            });


                            currentText++;

                        }

                    }

                    createjs.Tween.get( this.userLayer ).to({ alpha : 1 }, 200, createjs.Ease.quadInOut );

                    var centerToPointEvent = new createjs.Event( "stageScroll" );

                    Editor.stage.dispatchEventForAllObject( centerToPointEvent );

                }.bind( this )

            );

        }
        else {

            this.userLayer.removeAllChildren();

            var currentText = 0;

            for( var i=0; i < objects.length; i++ ){

                var proposed = objects[i];

                if( proposed.type == 'Image' ){

                    var proposedPosition = new ProposedPosition2( this.editor, "test", null, proposed.size.width, proposed.size.height );

                    Editor.stage.addObject( proposedPosition );
                    this.userLayer.addObject( proposedPosition );
                    this.proposedImagePositions.push( proposedPosition );
                    proposedPosition.order = proposed.order;
                    proposedPosition.dbID = proposedPosition.dbId = proposed._id;
                    proposedPosition.setPosition( proposed.pos.x - this.slope, proposed.pos.y-this.slope );
                    proposedPosition.rotate( proposed.rotation );
                    proposedPosition.prepareMagneticLines( Editor.getMagnetizeTolerance());

                    if( usedImages && usedImages.length > 0 ){

                        var image = findImageByOrder( proposedPosition.order );

                        if( image ){

                            proposedPosition.loadImage( image );

                        }

                    }

                    var settings = {};

                    if( this.userPage.ThemePage.defaultSettings ){

                        for( key in this.userPage.ThemePage.defaultSettings ){

                            settings[key] = this.userPage.ThemePage.defaultSettings[key];

                        }

                        if( this.userPage.ThemePage.defaultSettings.proposedImagesOpt && this.userPage.ThemePage.defaultSettings.proposedImagesOpt[currentImagePosition] ){

                            for( key in this.userPage.ThemePage.defaultSettings.proposedImagesOpt[currentImagePosition] ){

                                settings[key] = this.userPage.ThemePage.defaultSettings.proposedImagesOpt[currentImagePosition][key];

                            }


                        }

                    }

                    proposedPosition.setSettings( settings );
                    currentImagePosition++;

                }
                else if( proposed.type == 'Text' ){

                    var lineHeight = 40;

                    var obj = new Text2( "Text", proposed.size.width, proposed.size.height, true, true );//, generated.size.width, generated.size.height );

                    if( usedTexts && usedTexts[currentText].content ){

                        obj.init(lineHeight, true);

                    }else {

                        obj.init(lineHeight);

                    }


                    Editor.stage.addObject( obj );
                    this.userLayer.addObject( obj );
                    obj.isProposedPosition = true;
                    obj.dbID = obj.dbId = proposed._id;
                    obj.order = proposed.order;

                    var currentTextObject = usedTexts[currentText].content || null;

                    obj.setBackgroundColor( usedTexts[currentText].backgroundColor );
                    obj.setBackgroundAlpha( usedTexts[currentText].backgroundOpacity );
                    obj.setVerticalPadding( usedTexts[currentText].verticalPadding );
                    obj.setHorizontalPadding( usedTexts[currentText].horizontalPadding );
                    obj.usedTextID = usedTexts[currentText]._id;

                    //obj.setTrueHeight( usedTexts[currentText].trueHeight );
                    //obj.setTrueWidth( usedTexts[currentText].trueWidth );

                    if( currentTextObject ){

                        for( var line=0; line < currentTextObject.length; line++ ){

                            var _line = new TextLine( 0, 0, currentTextObject[line].lineHeight );
                            _line.align = currentTextObject[line].align;
                            obj.addLine( _line );
                            _line.initHitArea();
                            _line.uncache();

                            for( var letter=0; letter < currentTextObject[line].letters.length; letter++ ){

                                var _letter = new TextLetter(

                                    currentTextObject[line].letters[letter].text,
                                    currentTextObject[line].letters[letter].fontFamily,
                                    currentTextObject[line].letters[letter].size,
                                    currentTextObject[line].letters[letter].color,
                                    currentTextObject[line].letters[letter].lineHeight,
                                    currentTextObject[line].letters[letter].fontType.regular,
                                    currentTextObject[line].letters[letter].fontType.italic,
                                    this.editor

                                );

                                _line.addCreatedLetter( _letter );

                            }

                        }

                    }

                    obj.setCenterReg();
                    obj.setPosition( proposed.pos.x-this.slope, proposed.pos.y-this.slope );
                    obj.rotate( proposed.rotation );
                    obj.prepareMagneticLines( Editor.getMagnetizeTolerance());

                    for( var line=0; line < obj.lines.length; line++ ){

                        obj.lines[line].x = obj.padding.left;
                        obj.lines[line].maxWidth = obj.trueWidth - obj.padding.left - obj.padding.right;

                    }

                    obj.updateText({

                        lettersPositions : true,
                        linesPosition : true,

                    });


                    currentText++;

                }

            }

        }


    };


    p.getUserTexts = function(){

        var texts = [];

        for( var i=0; i < this.backgroundLayer.children.length; i++  ){

            if( this.backgroundLayer.children[i] instanceof Editor.Text2 )
                texts.push( this.backgroundLayer.children[i] );

        }

        for( var i=0; i < this.foregroundLayer.children.length; i++  ){

            if( this.foregroundLayer.children[i] instanceof Editor.Text2 )
                texts.push( this.foregroundLayer.children[i] );

        }

        for( var i=0; i < this.userLayer.children.length; i++  ){

            if( this.userLayer.children[i] instanceof Editor.Text2 )
                texts.push( this.userLayer.children[i] );

        }

        return texts;

    };


    p.updateUserTexts = function(){

        var texts = this.getUserTexts();

        for( var i=0; i < texts.length; i++ ){

            texts[i].update();

        }

    };


    /**
    * Wczytuje stronę motywu
    *
    * @method loadThemePage
    * @param {Object} themePage
    */
    p.loadThemePage = function( themePage ){

        this.cleanTheme();
        
        this.userPage.ThemePage = themePage;

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

                var newEditorBitmap = new Editor.Bitmap( data.ProjectImage.name, img, false );
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

                //Editor.stage.initObjectDefaultEvents( newEditorBitmap );

                newEditorBitmap.prepareMagneticLines( Editor.getMagnetizeTolerance() );

                Editor.stage.addObject( newEditorBitmap );

            }
            else if( data.type == 'EditorText' ){

                var text = data;

                var object = new Text2( text.name, text.width, text.height, false, true );
                //object.order =
                object.initForUserTheme( object._currentFontSize, true );
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
                object.prepareMagneticLines( Editor.getMagnetizeTolerance() );
                this.backgroundLayer.addObject( object );

            }

        }


        for( var i=0; i < foregroundObjects.length; i++ ){

            var data = foregroundObjects[i];

            if( data.type == 'EditorBitmap' ){

                var img = safeImage();
                img.src = data.ProjectImage.minUrl;

                var newEditorBitmap = new Bitmap( data.ProjectImage.name, img, false );
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
                // /Editor.stage.initObjectDefaultEvents( newEditorBitmap );

                newEditorBitmap.prepareMagneticLines( Editor.getMagnetizeTolerance() );
                Editor.stage.addObject( newEditorBitmap );

            }
            else if( data.type == 'EditorText' ){

                var text = data;

                var object = new Text2( text.name, text.width, text.height, false, true );
                //object.order =
                object.initForUserTheme( object._currentFontSize, true );
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
                object.prepareMagneticLines( Editor.getMagnetizeTolerance() );
                this.foregroundLayer.addObject( object );

            }

        }

    };




    p.initUserBottomToolbar = function(){

        return;

		var _this = this;
        var numberOfViews = [];
        numberOfViews = Editor.userProject.getViewsNumber();

        var elem = document.createElement('div');
        elem.className = 'editablePlane-changePage displayController';

        var prevPage = document.createElement('div');
        prevPage.className = 'prevPage';

        var nextPage = document.createElement('div');
        nextPage.className = 'nextPage';

        elem.appendChild( prevPage );
        elem.appendChild( nextPage );

        if ( Editor.userProject.getCurrentView().order == 0  ){
            $(prevPage).addClass("pageButtonUnactive");
        }


        if ( Editor.userProject.getCurrentView().order ==  (numberOfViews.length - 1) ){

            $(nextPage).addClass("pageButtonUnactive");

        }

        document.body.appendChild( elem );

        prevPage.addEventListener('click', function( e ){

            e.stopPropagation();
            Editor.userProject.turnToPreviousView().then( function(){

                var pagesListUser = document.getElementById('pagesListUser');

                if( pagesListUser ){

                    if( Editor.userProject.getCurrentView().Pages[0].vacancy ){

                        pagesListUser.removeClass( 'noVacancy' );
                        pagesListUser.addClass( 'vacancy' );

                    }else {

                        pagesListUser.removeClass( 'vacancy' );
                        pagesListUser.addClass( 'noVacancy' );

                    }

                }

            });
           // Editor.template.viewSnapShot();

        });

		nextPage.addEventListener('click', function( e ){

            e.stopPropagation();
            Editor.userProject.turnToNextView().then( function(  ){

                var pagesListUser = document.getElementById('pagesListUser');

                if( pagesListUser ){

                    if( Editor.userProject.getCurrentView().Pages[0].vacancy ){

                        pagesListUser.removeClass( 'noVacancy' );
                        pagesListUser.addClass( 'vacancy' );

                    }else {

                        pagesListUser.removeClass( 'vacancy' );
                        pagesListUser.addClass( 'noVacancy' );

                    }

                }

            });

        });

        this.userBottomToolBar = elem;

    };


    p.resetPosibleToAddText = function(){

        var elem = this.userToolBar.querySelector('.one-more-text');

        if( !$(elem).hasClass( 'notable' ) ){

            $(elem).addClass('notable');

        }

    };


    p.makePosibleToAddText = function(){

        $(this.userToolBar.querySelector('.one-more-text')).removeClass( 'notable' );

    };

    p.resetPosibleToAddImage = function(){

        var elem = this.userToolBar.querySelector('.one-more-image');

        if( !$(elem).hasClass( 'notable' ) ){

            $(elem).addClass('notable');

        }

    };

   p.makePosibleToRemoveText = function(){

        var elem = this.userToolBar.querySelector('.one-less-text');

        if( elem ){

            $(elem).removeClass( 'notable' );

        }

    };

    p.makePosibleToSwapTemplate = function(){

        var elem = this.userToolBar.querySelector('.swap-template');

        if( elem ){

            $(elem).removeClass('notable');

        }

    };


    p.resetPosibleToSwapTemplate = function(){

        var elem = this.userToolBar.querySelector('.swap-template');

        if( elem && !$(elem).hasClass('notable') ){

            $(elem).addClass('notable');

        }

    };


    p.resetPosibleToRemoveText = function(){

        var elem = this.userToolBar.querySelector('.one-less-text');

        if( elem && !$(elem).hasClass( 'notable' ) ){

            $(elem).addClass('notable');

        }

    };

    p.makePosibleToRemoveImage = function(){

        var elem = this.userToolBar.querySelector('.one-less-image');

        if( elem ){
            $(elem).removeClass( 'notable' );
        }

    };

    p.resetPosibleToRemoveImage = function(){

        var elem = this.userToolBar.querySelector('.one-less-image');

        if( elem && !$(elem).hasClass( 'notable' ) ){

            $(elem).addClass('notable');

        }

    };

    p.makePosibleToAddImage = function(){

        $(this.userToolBar.querySelector('.one-more-image')).removeClass( 'notable' );

    };

    p.initUserToolBar = function(  ){

        var _this = this;

        var elem = document.createElement('div');
        elem.className = 'edtablePlane-changeLayout displayController';

        var elemImage = document.createElement('div');
        elemImage.className = 'editableAreaLeftTool swap-template';

        elemImage.appendChild( this.editor.template.createToolhelper ("Zmień szablon pozycji proponowanych") );

        elem.appendChild( elemImage );
        document.body.appendChild( elem );
        this.userToolBar = elem;


        // dodanie tekstu
        var addText = document.createElement('div');
        addText.className = 'editableAreaLeftTool one-more-text notable';
        addText.addEventListener('click', function( e ){

            e.stopPropagation();

            if( _this.editor.userType == 'user'){

                this.editor.webSocketControllers.userPage.oneMoreText(

                    _this.userPage._id,
                    _this.userPage.ProposedTemplate._id

                );

            }else if( _this.editor.userType == 'advancedUser' ){

                var textSize = {

                    height: 23

                };

                if( _this.trueWidth < 200 ){

                    textSize.width = _this.trueWidth/2;

                }else {

                    textSize.width = 200;

                }

                this.editor.webSocketControllers.userPage.addProposedText(

                    _this.userPage._id,
                    textSize.width,
                    textSize.height,
                    _this.trueWidth/2,
                    _this.trueHeight/2

                );

            }


        }.bind( this ));


        // usuniecie tekstu
        var removeText = document.createElement('div');
        removeText.className = 'editableAreaLeftTool one-less-text notable';
        removeText.addEventListener('click', function( e ){

            e.stopPropagation();

            this.editor.webSocketControllers.userPage.removeProposedText(

                _this.userPage._id

            );

        }.bind( this ));


        //dodanie obrazka
        var addImage = document.createElement('div');
        addImage.className = 'editableAreaLeftTool one-more-image notable';
        addImage.addEventListener('click', function( e ){

            e.stopPropagation();

            if( userType == 'user' ){

                this.editor.webSocketControllers.userPage.oneMoreImage(

                    _this.userPage._id,
                    _this.userPage.ProposedTemplate._id

                );

            }else if( userType == 'advancedUser' ) {

                var width = ( _this.trueWidth < 200 )? ( _this.trueWidth-20): 200;
                var height = ( _this.trueHeight < 200 )? ( _this.trueHeight-20): 200;
                var x = _this.trueWidth/2;
                var y = _this.trueHeight/2;

                this.editor.webSocketControllers.userPage.addEmptyProposedPosition( _this.userPage._id, _this.userPage.ProposedTemplate._id, width, height, x, y );

            }

        }.bind( this ));


        // usuniecie obrazka
        var removeImage = document.createElement('div');
        removeImage.className = 'editableAreaLeftTool one-less-image notable';
        removeImage.addEventListener('click', function( e ){

            e.stopPropagation();

            //console.log( this );
            //console.log('Usunięcie pozycji proponowanej');

            this.editor.webSocketControllers.userPage.removeOneProposedImage(

                _this.userPage._id

            );

        }.bind( this ));


        elemImage.addEventListener('click', function( e ){

            e.stopPropagation();

            this.editor.webSocketControllers.userPage.swapTemplate( _this.userPage._id, _this.userPage.ProposedTemplate._id );

        }.bind( this ));


        this.userToolBar.appendChild( addText );

        if( userType == 'user' ){

            this.userToolBar.appendChild( removeText );

        }

        this.userToolBar.appendChild( addImage );

        if( userType =='user'){

            this.userToolBar.appendChild( removeImage );

        }

    };


    p.init = function(){

        var _this = this;

        //this.initEvents();
        this.prepareMagneticLines( this.editor.getMagnetizeTolerance() );


        /*
        this.addEventListener( 'pressup', function( e ){

            e.stopPropagation();

            _this.updatePositionInDB();

        });

        */

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

            while( parent ){

                scaleX *= parent.scaleX;
                scaleY *= parent.scaleY;
                parent = parent.parent;

            }

            _this.borderShape.graphics.c().ss(1/scaleX).s("#00d1cd").mt(0,0).lt( _this.width, 0).lt( _this.width, _this.height ).lt(0, _this.height).cp();

            var tools = _this.userToolBar;

            var toolSize = {

                width  : $(tools).innerWidth(),
                height : $(tools).innerHeight()

            };

            var pos = _this.getGlobalPosition();
            var stage = this.editor.getStage();
            var bounds = _this.getTransformedBounds();

            $(tools).css({ top: pos[1] + (bounds.height/2)*stage.scaleY - toolSize.height, left: pos[0] - toolSize.width - (bounds.width/2*stage.scaleX) });

            var bottomTools = _this.userBottomToolBar;
            var bToolSize = {

                width  : $(bottomTools).outerWidth(),
                height : $(bottomTools).innerHeight()

            };

            $(bottomTools).css({ top: pos[1] + (bounds.height/2)*stage.scaleY +80, left: pos[0] - bToolSize.width/2 });

        }.bind( this ));


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

            if( _this.settings.slope && _this.slopeShape ) {

                //this.slopeShape = new createjs.Graphics();
                // trzeba tutaj przenieść ramkę
                _this.slopeShape.graphics.c().ss(1/scaleX).s("#fff").mt(1,1).lt(_this.width-1, 1).lt(_this.width-1, _this.height-1 ).lt(1, _this.height-1).cp();
                _this.slopeShape.graphics.ss(1/scaleX).s("#F00").mt( _this.settings.slope, _this.settings.slope).lt(_this.width-(_this.settings.slope), _this.settings.slope).lt( _this.width-( _this.settings.slope ), _this.height-( _this.settings.slope ) ).lt( _this.settings.slope, _this.height - (_this.settings.slope)).cp().es();
                _this.slopeShape.graphics.f("rgba(0, 0, 0, 0.34)").r(0,0, _this.width, _this.settings.slope).r(_this.width -_this.settings.slope, _this.settings.slope, _this.settings.slope, _this.height - _this.settings.slope).r( 0, _this.height - _this.settings.slope, _this.width -_this.settings.slope, _this.settings.slope).r(0, _this.settings.slope, _this.settings.slope, _this.height-(_this.settings.slope*2));
                //this.slopeShape = new createjs.Shape( this.slopeShape );
                _this.borderShape.graphics.c().ss(1/scaleX).s("#00d1cd").mt(0,0).lt( _this.width, 0).lt( _this.width, _this.height ).lt(0, _this.height).cp();
            }
            else if( _this.slopeShape ) {

                //this.slopeShape = new createjs.Graphics();
                _this.slopeShape.graphics.c();//.ss(1/scaleX).s("#00d1cd").mt(1,1).lt(_this.width-1, 1).lt(_this.width-1, _this.height-1 ).lt(1, _this.height-1).cp();
                _this.borderShape.graphics.c().ss(1/scaleX).s("#00d1cd").mt(0,0).lt( _this.width, 0).lt( _this.width, _this.height ).lt(0, _this.height).cp();
                //this.slopeShape = new createjs.Shape( this.slopeShape );

            }
            //_this.slopeShape.graphics.c().ss(1/scaleX).s("#00d1cd").mt(0,0).lt(_this.width, 0).lt(_this.width, _this.height ).lt(0, _this.height).cp();


        });

        this.addEventListener('stageMove', function( e ){

            e.stopPropagation();

            var tools = _this.userToolBar;

            var toolSize = {

                width  : $(tools).innerWidth(),
                height : $(tools).innerHeight()

            };

            var pos = _this.getGlobalPosition();
            var stage = _this.editor.getStage();
            var bounds = _this.getTransformedBounds();

            $(tools).css({ top: pos[1] + (bounds.height/2)*stage.scaleY - toolSize.height, left: pos[0] - toolSize.width - (bounds.width/2*stage.scaleX) });

            var bottomTools = _this.userBottomToolBar;
            var bToolSize = {

                width  : $(bottomTools).innerWidth(),
                height : $(bottomTools).innerHeight()

            };

            $(bottomTools).css({ top: pos[1] + (bounds.height/2)*stage.scaleY, left: pos[0] - bToolSize.width/2 });

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


    };


    p.findProposedImage = function( proposedPositionID ){

    	var proposedPosition = null;

    	for( var i=0; i < this.proposedImagePositions.length; i++ ){

    		if( this.proposedImagePositions[i].dbID == proposedPositionID ){

    			proposedPosition = this.proposedImagePositions[i];
    			break;

    		}

    	}

    	return proposedPosition;

    }

    p.prepareToDrop = function(){

        var _this = this;
        var Editor = _this.editor;


        function preparePosition( position, color ){

                position.hideDropingToolsToSwap();

                if( position.objectInside ){

                    var iconWidth = 39;
                    var iconHeight = 32;

                    var image = new Image();

                    var photoicon = new createjs.Bitmap( image );
                    image.src = 'app/images/zamiana.svg';

                    image.onload = function(){

                        photoicon.scaleY = photoicon.scaleX = 70/this.width/Editor.getStage().scaleX;

                    }

                    photoicon.x = position.width/2;
                    photoicon.y = position.height/2;

                    photoicon.regX = iconWidth/2;
                    photoicon.regY = iconHeight/2;
                    photoicon.shadow = new createjs.Shadow( "#565656", 0, 0, 10/ Editor.getStage().scaleX );

                }else {

                    var photoicon = new createjs.Bitmap( 'app/images/zdjecie-1.svg' );

                    photoicon.x = position.width/2;
                    photoicon.y = position.height/2;
                    photoicon.regX = 44/2;
                    photoicon.regY = 43/2;
                    photoicon.shadow = new createjs.Shadow("#565656", 0, 0, 10/ Editor.getStage().scaleX);

                }

                photoicon.scaleX = photoicon.scaleY = 0;
                photoicon.mouseEnabled = false;

                var container = new createjs.Container();

                var shape = new createjs.Shape();
                shape.graphics.f('rgba(12,93,89,0.5)' ).r( 0, 0, _this.proposedImagePositions[i].width , _this.proposedImagePositions[i].height );
                shape.setBounds( 0, 0, 200, 200 );

                container.regX = position.regX;
                container.regY = position.regY;

                container.x = position.x;
                container.y = position.y;
                //container.scaleX = (100/44)/ _this.editor.getStage().scaleX;

                container.rotation = _this.proposedImagePositions[i].rotation;

                container.addChild( shape, photoicon );

                _this.dropLayer.addChild( container );

                var width = _this.proposedImagePositions[i].width;
                var height = _this.proposedImagePositions[i].height;

                createjs.Tween.removeTweens( photoicon );

                var defaultScale = 70/38/Editor.getStage().scaleX;
                var targetScale = 90/38/Editor.getStage().scaleX;
                photoicon.scaleX = photoicon.scaleY = defaultScale;

                createjs.Tween.get( photoicon ).to({scaleX: defaultScale, scaleY: defaultScale}, 300, createjs.Ease.quadInOut );

                shape.target = _this.proposedImagePositions[i];

                shape.addEventListener('mouseover', function( e ){
                    //console.log('jest');
                    e.stopPropagation();
                    var eve = new createjs.Event('mousedown');
                    e.target.dispatchEvent( eve );
                    e.target.graphics.c().f( 'rgba(12,93,89,0.8)' ).r( 0, 0, e.target.target.width , e.target.target.height );

                    if( !e.target.target.objectInside ){

                        createjs.Tween.removeTweens( photoicon );
                        createjs.Tween.get( photoicon ).to({scaleX: targetScale, scaleY: targetScale}, 300, createjs.Ease.quadInOut );

                    }else {

                        createjs.Tween.removeTweens( photoicon );
                        createjs.Tween.get( photoicon ).to({rotation:360, scaleX: targetScale, scaleY: targetScale}, 500, createjs.Ease.quadInOut );

                    }

                });

                shape.addEventListener('mouseout', function( e ){

                    e.stopPropagation();
                    e.target.graphics.c().f('rgba(12,93,89,0.5)').r( 0, 0, e.target.target.width , e.target.target.height );

                    if( !e.target.target.objectInside ){

                        createjs.Tween.removeTweens( photoicon );
                        createjs.Tween.get( photoicon ).to({scaleX: defaultScale, scaleY: defaultScale}, 300, createjs.Ease.quadInOut );

                    }else {

                        createjs.Tween.removeTweens( photoicon );
                        createjs.Tween.get( photoicon ).to({rotation:0, scaleX: defaultScale, scaleY: defaultScale}, 300, createjs.Ease.quadInOut );

                    }

                });

                shape.addEventListener('pressup', function( e ){

                    e.stopPropagation();
                    e.target.graphics.c().f('rgba(12,93,89,0.5)').r( 0, 0, e.target.target.width , e.target.target.height );

                });

                shape.addEventListener('dragstop', function( e ){
                    //console.log('JEST :)');
                    // jezeli juz cos tam jest nalezy zrobic swapphoto i usunac tamta instancje!
                    e.stopImmediatePropagation();
                    e.stopPropagation();

                    if( e.currentTarget.target.objectInside ){

                        Editor.webSocketControllers.proposedImage.changeImage( e.currentTarget.target.dbID, e.bitmapObject.uid, _this.userPage._id, Editor.userProject.getID() );

                    }else {

                        Editor.webSocketControllers.proposedImage.loadImage( e.currentTarget.target.dbID, e.bitmapObject.uid, _this.userPage._id );

                    }

                });

        }


        if( userType == 'advancedUser'){

            var container = new createjs.Container();

            var dropElem = new createjs.Shape();
            dropElem.graphics.f('rgba(255,255,255,0.7)').r(0,0,this.trueWidth, this.trueHeight);
            dropElem.setBounds( 0, 0, this.trueWidth, this.trueHeight );

            var photoicon = new createjs.Bitmap( 'app/images/zdjecie-1.svg' );

            photoicon.x = this.trueWidth/2;
            photoicon.y = this.trueHeight/2;
            photoicon.regX = 44/2;
            photoicon.regY = 43/2;
            photoicon.shadow = new createjs.Shadow("#565656", 0, 0, 10/Editor.getStage().scaleX);

            container.addChild( dropElem );
            container.addChild( photoicon );
            //container.hitArea = dropElem;

            dropElem.addEventListener('mouseover', function( e ){

                e.stopPropagation();

            });


            dropElem.addEventListener('dragstop', function( e ){

                // jezeli juz cos tam jest nalezy zrobic swapphoto i usunac tamta instancje!
                e.stopImmediatePropagation();
                e.stopPropagation();

                if( _this.trueWidth > _this.trueHeight ){

                    var maxSize = _this.trueHeight/3;

                }else {

                    var maxSize = _this.trueWidth/3;

                }


                if( e.bitmapObject.trueHeight > e.bitmapObject.trueWidth ){

                    var scale = maxSize/e.bitmapObject.trueHeight;

                    var posWidth =  e.bitmapObject.trueWidth*scale;
                    var posHeight =  e.bitmapObject.trueHeight*scale;

                }else {

                    var scale = maxSize/e.bitmapObject.trueWidth;

                    var posWidth =  e.bitmapObject.trueWidth*scale;
                    var posHeight =  e.bitmapObject.trueHeight*scale;

                }

                /*
                var newObject = new Editor.ProposedPosition2( "test", null, 100, 100 );

                Editor.stage.addObject( newObject );
                _this.proposedImagePositions.push( newObject );

                // tutaj trzeba zobaczyc czy est slope
                var position = _this.globalToLocal( Editor.getStage().mouseX, Editor.getStage().mouseY );

                newObject.setPosition( position.x, position.y );

                newObject.prepareMagneticLines( Editor.getMagnetizeTolerance());

                _this.userScene.addChild( newObject );

                console.log( e );
                var test = Editor.getStage().mouseX;
                console.log( test );
                console.log( _this.globalToLocal( Editor.getStage().mouseX, Editor.getStage().mouseY ) );
                */


                var bitmapData = {

                    x   : posWidth/2,
                    y   : posHeight/2,
                    scaleX : posWidth/e.bitmapObject.width,
                    scaleY : posHeight/e.bitmapObject.height

                };

                var position = _this.globalToLocal( Editor.getStage().mouseX, Editor.getStage().mouseY );
                Editor.webSocketControllers.userPage.addProposedImagePosition( _this.userPage._id, e.bitmapObject.uid, position.x, position.y, posWidth, posHeight, bitmapData );

            });


            this.dropLayer.addChild( container );


            for( var i =0; i < this.proposedImagePositions.length; i++ ){

                var position = this.proposedImagePositions[i];

                if( !position.objectInside ){

                    preparePosition( position );

                }

            }

            return;

        }



        for( var i =0; i < this.proposedImagePositions.length; i++ ){

            var position = this.proposedImagePositions[i];

            preparePosition( position );

        }

        var allPositionIsFilled = true;

        for( var pos=0; pos < this.proposedImagePositions.length; pos++){

            if( !this.proposedImagePositions[pos].objectInside ){

                allPositionIsFilled = false;

            }

        }

        if( this.templateOptions.canAddOneMoreImage && allPositionIsFilled ){

            var addPhotoDorpContainer = new createjs.Container();

            var addPhotoDorp = new createjs.Shape();
            addPhotoDorp.graphics.f( 'rgba(115, 115, 115, 0.8)' ).r( 0, 0, 50, this.height );
            addPhotoDorp.setBounds( 0, 0, 50, this.height );
            addPhotoDorp.width = 50;
            addPhotoDorp.height = this.height;
            addPhotoDorp.cursor = 'copy';

            var photoicon = new createjs.Bitmap( 'app/images/zdjecie-1.svg' );

            photoicon.x = 50/2;
            photoicon.y = this.height/2;
            photoicon.regX = 44/2;
            photoicon.regY = 43/2;
            photoicon.scaleX = 30/43;
            photoicon.scaleY = 30/43;
            photoicon.shadow = new createjs.Shadow("#565656", 0, 0, 10/Editor.getStage().scaleX);

            var photoIconOrigScale = photoicon.scaleX;

            addPhotoDorpContainer.addChild( addPhotoDorp, photoicon );

            this.dropLayer.addChild( addPhotoDorpContainer );

            addPhotoDorp.addEventListener('mouseover', function( e ){

                e.stopPropagation();
                var eve = new createjs.Event('mousedown');
                e.target.dispatchEvent( eve );

                createjs.Tween.removeTweens( photoicon );
                createjs.Tween.get( photoicon ).to({scaleX: photoIconOrigScale+0.1, scaleY: photoIconOrigScale+0.1, x: 40 }, 300, createjs.Ease.quadInOut );

                //createjs.Tween.removeTweens( addPhotoDorp.graphics._instructions[2].params );
                //createjs.Tween.get( addPhotoDorp.graphics._instructions[2].params ).to( { 2: 80 }, 300, createjs.Ease.quadInOut );

            });

            addPhotoDorp.addEventListener('mouseout', function( e ){

                e.stopPropagation();

                createjs.Tween.removeTweens( photoicon );
                createjs.Tween.get( photoicon ).to({scaleX: photoIconOrigScale, scaleY: photoIconOrigScale, x: 25 }, 300, createjs.Ease.quadInOut );

                //createjs.Tween.removeTweens( addPhotoDorp.graphics._instructions[2].params );
                //createjs.Tween.get( addPhotoDorp.graphics._instructions[2].params ).to( { 2: 50 }, 300, createjs.Ease.quadInOut );

            });

            addPhotoDorp.addEventListener('pressup', function( e ){
                e.stopPropagation();
                e.target.graphics.c().f('rgba(12,93,89,0.5)').r( 0, 0, e.target.width , e.target.height );

            });

            addPhotoDorp.addEventListener('dragstop', function( e ){

                e.stopImmediatePropagation();
                e.stopPropagation();

                this.editor.webSocketControllers.userPage.addPhoto( _this.userPage._id, e.bitmapObject.uid, function( data ){

                    var options = {

                        canAddOneMoreText  : data.canAddOneMoreText,
                        canAddOneMoreImage : data.canAddOneMoreImage,
                        canRemoveOneImage  : data.canRemoveOneImage,
                        canRemoveOneText  : data.canRemoveOneText,

                    };

                    this.editor.stage.getPages()[0].loadThemePage( data.themePage );
                    this.editor.stage.getPages()[0].loadTemplate( data.proposedTemplate, data.usedImages, data.usedTexts, options );

                }.bind( this ));
                //e.currentTarget.target.loadImage(  e.bitmapObject );

            }.bind( this ));

        }

    };

export {EditableArea};
