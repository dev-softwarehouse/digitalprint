import {ProposedPosition2} from './../class/ProposedPosition2';
import {Text2} from './../class/Text2';
import {TextLine} from './../class/TextLine';
import {safeImage} from "../utils";

    /**
	* Klasa będąca kontrolerem UserPageController. Wysyła i odbiera emity z websocket'a. <br>
    * Plik : websocketControlers/viewController.js
	*
	* @class UserPageController
	* @constructor
    * @param {Object} webSocket Websocket z otworzonym połączeniem
	*/
    function UserPageController( webSocket, userID, context ){

        this.webSocket = webSocket;
        this.userID = userID;
        this.editor = context;

    };

    var p = UserPageController.prototype;


    /**
	* Inicjalizuje podstawowe nasłuchiwacze
	*
	* @method init
	*/
    p.init = function(  ){

        var _this = this;

        this.webSocket.on('UserPage.addBitmap', function( data ){ _this.onAddBitmap( data ); });
        this.webSocket.on('UserPage.useTemplate', function( data ){ _this.onUseTemplate( data ); });
        this.webSocket.on('UserPage.swapTemplate', function( data ){ _this.onSwapTemplate( data ); });
        this.webSocket.on('UserPage.updateTemplatePhotos', function( data ){ _this.onUpdateTemplatePhotos( data ); });
        this.webSocket.on('UserPage.loadImage', function( data ){ _this.onLoadImage( data ); });
        this.webSocket.on('UserPage.oneMoreText', function( data ){ _this.onOneMoreText( data ); });
        this.webSocket.on('UserPage.setTextContent', function( data ){ _this.onSetTextContent( data );});
        this.webSocket.on('UserPage.removeProposedPosition', function( data ){ _this.onSetTextContent( data ); });
        this.webSocket.on('UserPage.changeImage', function( data ){ _this.onChangeImage( data ); });
        this.webSocket.on('UserPage.oneMoreImage', function( data ){ _this.onOneMoreImage( data ); });
        this.webSocket.on('UserPage.removeProposedText', function( data ){ _this.onRemoveProposedText( data ); });
        this.webSocket.on('UserPage.removeProposedImage', function( data ){ _this.onRemoveProposedImage( data ); });
        this.webSocket.on('UserPage.removeUsedImage', function( data ){ _this.onRemoveUsedImage( data ); });
        this.webSocket.on('UserPage.rotateUsedImage', function( data ){ _this.onRotateUsedImage(data );});
        this.webSocket.on('UserPage.setProposedTemplate', function( data ){ _this.onSetProposedTemplate( data );});
        this.webSocket.on('UserPage.addProposedImagePosition', function( data ){ _this.onAddProposedImagePosition(data)});
        this.webSocket.on('UserPage.addProposedText', function( data ){ _this.onAddProposedText( data );});
        this.webSocket.on('UserPage.addEmptyProposedPosition', function( data ){ _this.onAddEmptyProposedPosition(data);});
        this.webSocket.on('UserPage.removeUserText', function( data ){ _this.onRemoveUserText(data);});
        //onOneMoreImage

    };

    p.removeUserText = function( userPageID, proposedTextID ){

        var data = {

            userPageID : userPageID,
            proposedTextID : proposedTextID

        };

        this.webSocket.emit( 'UserPage.removeUserText', data );

    };

    p.onRemoveUserText = function( data ){
        var _this = this;
        var userPage = this.editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            this.editor.webSocketControllers.userView.get( this.editor.userProject.getCurrentView()._id, function( data ){

                _this.editor.userProject.initView( data );

                setTimeout( function(){

                    _this.editor.userProject.updateCurrentViewThumb();

                }, 500 );

            });

        }

    };

    p.onAddProposedText = function( data ){

        var objectData = data.text;

        var lineHeight = 20;

        //console.log( data );
        //console.log('Informacje o propsed text');

        var newObject = new Text2( "Text", objectData.size.width, objectData.size.height, true, true );//, generated.size.width, generated.size.height );
        newObject.editor = this.editor;


        this.editor.stage.addObject( newObject );
        newObject.isProposedPosition = true;
        newObject.dbID = newObject.dbId = objectData._id;
        newObject.order = objectData.order;
        newObject._currentFontFamily = objectData.fontFamily;
        newObject._currentFont = this.editor.fonts.selectFont( objectData.fontFamily,  newObject._currentFontType.regular,  newObject._currentFontType.italic );

        //console.log( this.editor.fonts.selectFont( objectData.fontFamily,  newObject._currentFontType.regular,  newObject._currentFontType.italic) );
        //console.log('CO TO MA BYC :)');
        if( objectData.content ){
            
            newObject.init( true );

        }else {

            newObject.init();

        }
        newObject.setBackgroundColor( objectData.backgroundColor );

        newObject.setBackgroundAlpha( objectData.backgroundOpacity );
        newObject.setVerticalPadding( objectData.verticalPadding );
        newObject.setHorizontalPadding( objectData.horizontalPadding );

        newObject.shadowBlur = objectData.shadowBlur;
        newObject.shadowOffsetY = objectData.shadowOffsetY;
        newObject.shadowOffsetX = objectData.shadowOffsetX;
        newObject.shadowColor = objectData.shadowColor;

        if( objectData.dropShadow ){

            newObject.dropShadow();

        }

        if( objectData.showBackground ){

            newObject.showBackground();
            newObject.showBackground = objectData.showBackground;

        }else {

            newObject.showBackground = objectData.showBackground;
            newObject.hideBackground();

        }

        //obj.setTrueHeight( usedTexts[currentText].trueHeight );
        //obj.setTrueWidth( usedTexts[currentText].trueWidth );

        if( objectData.content ){

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
                        objectData.content[line].letters[letter].editor

                    );

                    _line.addCreatedLetter( _letter );

                }

            }

        }else {

            //newObject.displayDefaultText();

        }

        newObject.setCenterReg();

        if( userType == 'user'){

            newObject.setPosition( objectData.pos.x - _this.slope, objectData.pos.y-_this.slope );

        }else if( userType == 'advancedUser'){

            newObject.setPosition( objectData.pos.x , objectData.pos.y );

        }

        newObject.rotate( objectData.rotation );
        //newObject.prepareMagneticLines( Editor.getMagnetizeTolerance());


        for( var line=0; line < newObject.lines.length; line++ ){

            newObject.lines[line].x = newObject.padding.left;
            newObject.lines[line].maxWidth = newObject.trueWidth - newObject.padding.left - newObject.padding.right;

        }

        newObject.updateText({

            lettersPositions : true,
            linesPosition : true,

        });

        var userPage = this.editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            userPage.userScene.addChild( newObject );

        }

        if( !objectData.content ){


            newObject.displayDefaultText();
            newObject.updateText({
                lettersPositions : true,
                linesPosition : true,
            });

        }

        //newObject.displayDefaultContent();

    };

    p.addProposedText = function( userPageID, width, height, x, y ){

        var data = {

            userPageID : userPageID,
            width: width,
            height: height,
            x: x,
            y: y

        };

        this.webSocket.emit('UserPage.addProposedText', data );

    };

    p.onAddProposedImagePosition = function( data ){

		var Editor = this.editor;
        var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            var objectData = data.proposedImage;

            var newObject = new ProposedPosition2( Editor, "test", null, objectData.size.width, objectData.size.height );

            Editor.stage.addObject( newObject );
            userPage.proposedImagePositions.push( newObject );
            newObject.order = objectData.order;
            newObject.dbID = newObject.dbId = objectData._id;
            // tutaj trzeba zobaczyc czy est slope

            if( userType == 'user'){
                newObject.setPosition( objectData.pos.x - userPage.slope, objectData.pos.y-userPage.slope );
            }else if( userType == 'advancedUser'){
                newObject.setPosition( objectData.pos.x , objectData.pos.y );
            }

            newObject.rotate( objectData.rotation );
            newObject.prepareMagneticLines( Editor.getMagnetizeTolerance());


            if( objectData.objectInside ){

                newObject.loadImage( objectData.objectInside );

            }

            var settings = {

                borderWidth : objectData.borderWidth,
                displaySimpleBorder : objectData.displaySimpleBorder,
                borderColor : objectData.borderColor,
                backgroundFrame: objectData.backgroundFrame,
                backgroundFrameID: objectData.backgroundFrameID,
                dropShadow : objectData.dropShadow,
                shadowBlur : objectData.shadowBlur,
                shadowOffsetX : objectData.shadowOffsetX,
                shadowOffsetY : objectData.shadowOffsetY,
                shadowColor   : objectData.shadowColor

            };

            newObject.setSettings( settings );

            userPage.userScene.addChild( newObject );

        }

    };

    p.onAddEmptyProposedPosition = function( data ){

        var Editor = this.editor;
        var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            var objectData = data.proposedImage;

            var newObject = new ProposedPosition2( this.editor, "test", null, objectData.size.width, objectData.size.height );

            Editor.stage.addObject( newObject );
            userPage.proposedImagePositions.push( newObject );
            newObject.order = objectData.order;
            newObject.dbID = newObject.dbId = objectData._id;
            // tutaj trzeba zobaczyc czy est slope

            if( userType == 'user'){
                newObject.setPosition( objectData.pos.x - userPage.slope, objectData.pos.y-userPage.slope );
            }else if( userType == 'advancedUser'){
                newObject.setPosition( objectData.pos.x , objectData.pos.y );
            }

            newObject.rotate( objectData.rotation );
            newObject.prepareMagneticLines( Editor.getMagnetizeTolerance());


            if( objectData.objectInside ){

                newObject.loadImage( objectData.objectInside );

            }

            var settings = {

                borderWidth : objectData.borderWidth,
                displaySimpleBorder : objectData.displaySimpleBorder,
                borderColor : objectData.borderColor,
                backgroundFrame: objectData.backgroundFrame,
                backgroundFrameID: objectData.backgroundFrameID,
                dropShadow : objectData.dropShadow,
                shadowBlur : objectData.shadowBlur,
                shadowOffsetX : objectData.shadowOffsetX,
                shadowOffsetY : objectData.shadowOffsetY,
                shadowColor   : objectData.shadowColor

            };

            newObject.setSettings( settings );

            userPage.userScene.addChild( newObject );
            newObject._updateShape();

            //console.log( newObject );
            //console.log('sprawdz co to tak naprawde jest');

        }

    };

    p.addEmptyProposedPosition = function( userPageID, proposedTemplateID, width, height, x, y ){

        var data = {

            userPageID: userPageID,
            proposedTemplateID: proposedTemplateID,
            width: width,
            height: height,
            x: x,
            y: y

        };

        this.webSocket.emit('UserPage.addEmptyProposedPosition', data );

    };

    p.addProposedImagePosition = function( userPageID, projectImageUID, posX, posY, width, height, bitmapData ){

        var data = {

            userPageID: userPageID,
            projectImageUID : projectImageUID,
            posX : posX,
            posY : posY,
            width: width,
            height:height,
            bitmapData: bitmapData,
			userProjectID : this.editor.userProject.getID()
        }

        this.webSocket.emit( 'UserPage.addProposedImagePosition', data );

    };

    p.setProposedImageAttributes = function( pageID, itemOrder, settings ){

        var data = {



        };

    };

    p.onSetTextContent = function( data ){


    };

    p.moveObjectUp = function( objectID, userPageID ){

        var data = {

            objectID : objectID,
            userPageID : userPageID

        };

        this.webSocket.emit( 'UserPage.moveObjectUp', data );

    };

    p.moveObjectDown = function( objectID, userPageID ){

        var data = {

            objectID : objectID,
            userPageID : userPageID

        };

        this.webSocket.emit( 'UserPage.moveObjectDown', data );

    };

    p.removeOneProposedImage = function( userPageID ){

        var data = {

            userPageID: userPageID

        };

        this.webSocket.emit('UserPage.removeOneProposedImage', data );

    };

    p.onRemoveProposedText = function( data ){

        var userPage = Editor.userProject.getUserPageByID( data.userPage._id );

        if( userPage ){

            var options = {

                canAddOneMoreText  : data.canAddOneMoreText,
                canAddOneMoreImage : data.canAddOneMoreImage,
                canRemoveOneImage  : data.canRemoveOneImage,
                canRemoveOneText  : data.canRemoveOneText,

            };

            userPage.loadTemplate( data.proposedTemplate, data.usedImages, data.usedTexts, options );

        }

    };

    p.removeProposedText = function( userPageID, proposedTextID ){

    	var data = {

    		userPageID ,
    		proposedTextID

    	};

    	this.webSocket.emit( 'UserPage.removeProposedText',data );

    };

    p.onRemoveProposedImage = function( data ){

        var userPage = this.editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            this.editor.webSocketControllers.userView.get( this.editor.userProject.getCurrentView()._id, function( data ){

                this.editor.userProject.initView( data );

                setTimeout( function(){

                    this.editor.userProject.updateCurrentViewThumb();

                }.bind( this ), 500 );

            }.bind( this ));

        }

    };

    p.removeProposedImage = function( userPageID, proposedPositionID ){

        var data = {

            userPageID : userPageID,
            proposedPositionID : proposedPositionID,
            projectID : this.editor.userProject.getID()

        };

        this.webSocket.emit( 'UserPage.removeProposedImage',data );

    };


    p.removeProposedPosition = function( userPageID, proposedPositionID ){

    	var data = {

    		userPageID : userPageID,
    		proposedPositionID : proposedPositionID

    	};

    	this.webSocket.emit( 'UserPage.removeProposedPosition', data );

    };

    //Editor.webSocketControllers.userPage.setTextContent( this.page.userPage._id ,this.order, this._id, this.getContent() );
    p.setTextContent = function( userPageID, proposedTextID, content ){

    	var data = {

    		userPageID 	   : userPageID,
    		proposedTextID : proposedTextID,
    		content        : content,

    	};

    	this.webSocket.emit( 'UserPage.setTextContent', data );

    };

    p.setProposedTemplate = function(  userPageID, proposedTemplateID ){

        var data = {

            userPageID : userPageID,
            proposedTemplateID : proposedTemplateID,
            projectID : this.editor.userProject.getID()

        };

        this.webSocket.emit( 'UserPage.setProposedTemplate', data );

    };

    p.onSetProposedTemplate = function( data ){

        var userPage = Editor.userProject.getUserPageByID( data._id );

        if( userPage ){

            userPage.loadTemplate( data.ProposedTemplate, data.UsedImages, data.UsedTexts );

        }

    }

    p.oneMoreText = function( userPageID, currentProposedTemplateID ){

        var data = {

            userPageID : userPageID,
            currentProposedTemplateID : currentProposedTemplateID

        };

        this.webSocket.emit( 'UserPage.oneMoreText', data );

    };

    p.oneMoreImage = function( userPageID, currentProposedTemplateID ){

        var data = {

            userPageID : userPageID,
            currentProposedTemplateID : currentProposedTemplateID

        };

        this.webSocket.emit( 'UserPage.oneMoreImage', data );

    };

    p.onOneMoreImage = function( data ){

        var userPage = Editor.userProject.getUserPageByID( data.userPage._id );

        if( userPage ){

            var options = {

                canAddOneMoreText  : data.canAddOneMoreText,
                canAddOneMoreImage : data.canAddOneMoreImage,
                canRemoveOneImage  : data.canRemoveOneImage,
                canRemoveOneText  : data.canRemoveOneText,

            };

            userPage.loadTemplate( data.proposedTemplate, data.usedImages, data.usedTexts, options );

            setTimeout( function(){
                Editor.userProject.updateCurrentViewThumb();
            }, 500 );

        }

    };

    p.onOneMoreText = function( data ){

        var userPage = Editor.userProject.getUserPageByID( data.userPage._id );

        if( userPage ){

            var options = {

                canAddOneMoreText  : data.canAddOneMoreText,
                canAddOneMoreImage : data.canAddOneMoreImage,
                canRemoveOneImage  : data.canRemoveOneImage,
                canRemoveOneText  : data.canRemoveOneText,

            };

            userPage.loadTemplate( data.proposedTemplate, data.usedImages, data.usedTexts, options );

            setTimeout( function(){
                Editor.userProject.updateCurrentViewThumb();
            }, 500 );

        }

    };

    p.onUpdateTemplatePhotos = function( data ){

    	var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            userPage.updateTemplate( data.usedImages );

        }

    }

    p.changeAllImagesSettings = function( userPageID, settings ){

        var data = {

            userPageID : userPageID,
            settings : settings

        };

        this.webSocket.emit( 'UserPage.changeAllImagesSettings', data );

    }

    p.onLoadImage = function( data ){

		var userPage = Editor.userProject.getUserPageByID( data.userPageID );

		if( userPage ){

            var pp = userPage.findProposedImage( data.proposedPosition );

            var projectImage = Editor.userProject.getProjectImage( data.image.ProjectImage.uid );

            data.image.ProjectImage = projectImage;

            pp.loadImage( data.image );

			userPage.userPage.UsedImages.push( data.image );

		}

        if( document.body.querySelector('.photosContainer') ){

            var pageElem = document.body.querySelector('.pageElemFromPopUp[data-id="'+ data.userPageID +'"]');
            var elem = pageElem.querySelector('.proposedElemPopUp[data-id="'+ data.proposedPosition +'"]');

            var imageElem = document.createElement('div');
            imageElem.className = 'imageElemFromPopUp';
            imageElem.setAttribute('proposed-id', data.proposedPosition );
            imageElem.setAttribute('image-id', data.image._id );
            var imageInside = safeImage();
            imageInside.src = Editor.userProject.getProjectImage( data.image.ProjectImage.uid ).thumbnail;
            imageElem.appendChild( imageInside );

            var remover = document.createElement('div');
            remover.className = 'imageRemover';

            remover.addEventListener( 'click', function( e ){

                e.stopPropagation();

                var pageID = e.target.parentNode.parentNode.getAttribute('data-id');
                var imageID = e.target.parentNode.getAttribute('image-id');

                Editor.webSocketControllers.userPage.removeUsedImage( pageID, imageID );

            });

            imageElem.appendChild( remover );

            elem.parentNode.replaceChild( imageElem, elem );

        }

    };

    p.loadImage = function( projectImageUID, proposedPositionID, userPageID, projectID ){

    	var data = {

    		projectImageUID : projectImageUID,
    		proposedPositionID : proposedPositionID,
    		userPageID : userPageID,
            projectID : projectID

    	};

    	this.webSocket.emit('UserPage.loadImage', data );

    };

    p.onChangeImage = function( data ){

        var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            var pp = userPage.findProposedImage( data.proposedPositionID );
            pp.loadImage( data.image );
            userPage.userPage.UsedImages.push( data.image );

        }

        if( document.body.querySelector('.photosContainer') ){

            var pageElem = document.body.querySelector('.pageElemFromPopUp[data-id="'+ data.userPageID +'"]');
            var elem = pageElem.querySelector('.imageElemFromPopUp[proposed-id="'+ data.proposedPositionID +'"]');

            var imageElem = document.createElement('div');
            imageElem.className = 'imageElemFromPopUp';
            imageElem.setAttribute('proposed-id', data.proposedPositionID );
            var imageInside = safeImage();
            imageInside.src = data.image.ProjectImage.thumbnail;
            imageElem.appendChild( imageInside );

            elem.parentNode.replaceChild( imageElem, elem );

        }

    };

    p.changeImage = function( projectImageUID, proposedPositionID, userPageID ){

        var data = {

            projectImageUID : projectImageUID,
            proposedPositionID : proposedPositionID,
            userPageID : userPageID,
            projectID : Editor.userProject.getID()

        };

        this.webSocket.emit( 'UserPage.changeImage', data );

    }

    p.replacePhotos = function( userPageID, editorObject1, editorObject2, proposedPosition ){

    	var data = {

    		userPageID : userPageID,
    		editorObject1 : editorObject1,
    		editorObject2 : editorObject2,
    		proposedPosition : proposedPosition

    	};


    	this.webSocket.emit('UserPage.replacePhotos', data );

    }

    p.swapPhoto = function( userPageID, order, newPhotoData ){

        var _this = this;

        var data = {

            userPageID : userPageID,
            order : order,
            newPhotoData : newPhotoData,
            projectID : this.editor.userProject.getID()

        };

        this.webSocket.emit( 'UserPage.swapPhoto', data );

    };


    p.addPhoto = function( userPageID, projectImageUID, callback ){

        var _this = this;

        var data = {

            userPageID     : userPageID,
            projectImageUID : projectImageUID,
            projectID      : this.editor.userProject.getID()

        };

        this.webSocket.on('UserPage.addPhoto', function( data ){

            callback( data );
            _this.webSocket.removeListener( 'UserPage.addPhoto' );

        });

        this.webSocket.emit( 'UserPage.addPhoto', data );

    };


    p.swapTemplate = function( userPageID, currentTemplate ){

        var data = {

            userPageID : userPageID,
            currentTemplate : currentTemplate

        };

        this.webSocket.emit( 'UserPage.swapTemplate', data );

    };

    p.onSwapTemplate = function( data, callback ){

        var Editor = this.editor;

        var userPage = Editor.userProject.getUserPageByID( data._id );

        if( userPage ){

            Editor.webSocketControllers.userView.get( Editor.userProject.getCurrentView()._id, function( data ){

                Editor.userProject.initView( data );

                setTimeout( function(){

                    Editor.userProject.updateCurrentViewThumb();

                }, 500 );

            });

        }

    };

    p.removeProposedImageAndPosition = function( userPageID, imageID ){

        var data = {

            userPageID : userPageID,
            imageID    : imageID,
            projectID  : this.editor.userProject.getID()

        };

        this.webSocket.emit( 'UserPage.removeProposedImageAndPosition', data );

    };

    p.removeUsedImage = function( userPageID, imageID ){

        var data = {

            userPageID : userPageID,
            imageID    : imageID,
            projectID  : this.editor.userProject.getID()

        };

        this.webSocket.emit( 'UserPage.removeUsedImage', data );

    };

    p.onRemoveUsedImage = function( data ){

        var userPage = this.editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            var position = userPage.findProposedImage( data.proposedImageID );

            position.removeObjectInside();

            var eve =  new createjs.Event('removed');

            position.dispatchEvent( eve );

        }

        // tutaj ma sie updtejtowac w  widoku klienta !
        if( document.body.querySelector('.photosContainer') ){

            var pageElem = document.body.querySelector('.pageElemFromPopUp[data-id="'+ data.userPageID +'"]');
            var imageElem = pageElem.querySelector('.imageElemFromPopUp[image-id="' + data.imageID + '"]');

            var proposedElem = document.createElement('div');
            proposedElem.className = 'proposedElemPopUp';
            proposedElem.setAttribute( 'data-id', data.proposedImageID );

            pageElem.replaceChild( proposedElem, imageElem );


        }

    };

    p.addBitmap = function( userID, userPageID, currentViewID, projectImage ){

        var data = {

            userID : userID,
            userPageID : userPageID,
            currentViewID : currentViewID,
            projectImage : projectImage

        };

        this.webSocket.emit( 'UserPage.addBitmap', data );

    };


    p.useThemePage = function( userPageID, themePageID, callback ){

        var _this = this;

        var data = {

            userPageID  : userPageID,
            themePageID : themePageID,

        };

        this.webSocket.on( 'UserPage.useThemePage', function( data ){

            callback( data );
            _this.webSocket.removeListener( 'UserPage.useThemePage' );

        });

        this.webSocket.emit( 'UserPage.useThemePage', data );

    };

    p.rotateUsedImage = function( userPageID, imageID, proposedPositionID ){

        var data = {

            userPageID : userPageID,
            imageID    : imageID,
            proposedPositionID : proposedPositionID

        };

        this.webSocket.emit( 'UserPage.rotateUsedImage', data );

    };

    p.onRotateUsedImage = function( data ){

        var userPage = Editor.userProject.getUserPageByID( data.userPageID );

        if( userPage ){

            var position = userPage.findProposedImage( data.proposedPositionID );
            position.objectInside.setScale( data.imageInfo.scaleX );
            position.objectInside.rotation = data.imageInfo.rotation;
            position.objectInside.x = data.imageInfo.x;
            position.objectInside.y = data.imageInfo.y;



            if( position.toolBox ){

                if( position.objectInside.rotation%180 != 90 ){

                    var minScale = position.width/position.objectInside.trueWidth;

                    if( position.height > position.objectInside.trueHeight*minScale ){

                        minScale = position.height/position.objectInside.trueHeight;

                    }

                }else {

                    var minScale = position.height/position.objectInside.trueWidth;

                    if( position.width > position.objectInside.trueHeight*minScale ){

                        minScale = position.width/position.objectInside.trueHeight;

                    }

                }

                $(".scroll-bar").slider("option", "min", minScale ); // left handle should be at the left end, but it doesn't move
                $(".scroll-bar").slider("value", $(".scroll-bar").slider("value"));

            }

            position.updateMask();

        }

    };

    p.useTemplate = function( userPageID, templateID ){

        var data = {

            userPageID : userPageID,
            templateID : templateID

        };

        this.webSocket.emit('UserPage.useTemplate', data );

    };

    p.onUseTemplate = function( data ){

        Editor.stage.getPages()[0].loadTemplate( data );

    };


    p.onAddBitmap = function( data ){

        // trzeba wczytac i jest ok :)

    };

    export {UserPageController};
