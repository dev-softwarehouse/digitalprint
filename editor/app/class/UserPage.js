import {ProposedTemplate} from './ProposedTemplate';
import {ThemePage} from './ThemePage';
import {ProposedPosition2} from './ProposedPosition2';
import {Text2} from './Text2';
import {TextLine} from './TextLine';
import {TextLetter} from './TextLetter';
import {Bitmap} from './EditorBitmap';
import {safeImage} from "../utils";

	function UserPage( editor, userPage, viewParent ){

		this.editor = editor;
        this.viewParent = viewParent;
        this.init( userPage );
		this.editor.userProject.pushPage( userPage._id, this );

	};

	var p = UserPage.prototype;

	p.init = function( userPage ){

		this.themePageLoaded = false;
		this.width = userPage.vacancy ? userPage.width/2 : userPage.width;
		this.height = userPage.height;
		this.vacancy = userPage.vacancy;
		this.pageValue = userPage.pageValue;
		this.UsedImages = [];
		this.loadedImages = 0;
		this.UsedTexts = [];
		this.order = this.viewParent.order || 0;
		this.ProposedTemplate = ( userPage.ProposedTemplate ? new ProposedTemplate( this.editor, userPage.ProposedTemplate ) : null );

		var _this = this;
        var editor = this.editor;
		var scene = {};

        if( userPage.ProposedTemplate && userPage.ProposedTemplate.options ){

            this.templateOptions = userPage.ProposedTemplate.options;

        }else {

            this.templateOptions = {};

        }

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

        function createObject( obj, key ){

            var objectData = obj.object;
            var newObject = {};
            if( obj.objectType == 'bitmap' ){

                var img = safeImage()

                img.onload = function(){

                	newObject.ready = true;

                }
                img.src = EDITOR_ENV.staticUrl+objectData.ProjectImage.minUrl;


                newObject = new Bitmap( objectData.ProjectImage.name, img, true, true, {

                    dropShadow: objectData.dropShadow,
                    shadowBlur: objectData.shadowBlur,
                    shadowOffsetX : objectData.shadowOffsetX,
                    shadowOffsetY : objectData.shadowOffsetY,
                    shadowColor   : objectData.shadowColor,
                    borderColor   : objectData.borderColor,
                    effectName: objectData.effectName

                });

                newObject.editor = _this.editor
                newObject.uid = objectData.uid;
                newObject.dbID = objectData._id;
                newObject.ready = false;


                newObject.x = objectData.x;
                newObject.y = objectData.y;


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
                //newObject.display
                //Editor.stage.initObjectDefaultEvents( newEditorBitmap );
                newObject.prepareMagneticLines( _this.editor.getMagnetizeTolerance() );
                //_this.editor.stage.addObject( newObject );
                newObject.updateSimpleBorder();

                if( objectData.backgroundFrame ){

                    _this.editor.webSocketControllers.frameObject.get( objectData.backgroundFrameID, function( data ){

                        newObject.useBackgroundFrame = true;
                        newObject.setBackgroundFrame( data );

                    });

                }


            }else if( obj.objectType == 'proposedImage' ) {

                //console.log( objectData );
                //console.log('OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
                var newObject = new ProposedPosition2( _this.editor, "test", null, objectData.size.width, objectData.size.height );

                newObject.ready = false;
                newObject.order = objectData.order;
                newObject.dbID = newObject.dbId = objectData._id;
                _this.editor.registerObject(newObject,_this)
                // tutaj trzeba zobaczyc czy est slope

                newObject.setPosition( objectData.pos.x , objectData.pos.y );

                newObject.rotate( objectData.rotation );
                newObject.prepareMagneticLines( _this.editor.getMagnetizeTolerance());

                if( objectData.objectInside ){

                    newObject.loadImage( objectData.objectInside );

                }else {
                   
                    newObject.insideReady = true;

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
                    shadowColor   : objectData.shadowColor,
                    maskFilter : objectData.maskFilter,
                    effectName : objectData.effectName

                };

                if( objectData.maskFilter ){
                    newObject.maskReady = false;
                }else {
                    newObject.maskReady = true;
                }
                
                newObject.setSettings( settings );
                newObject.showDropingTools();
                //console.log('-------------------------------------------------------');
                //console.log( newObject );
                //console.log('sprawdzamy ustawienia tego obiektu podczas renderowania');

            } else if( obj.objectType == 'proposedText' ){

                var newObject = new Text2( "Text", objectData.size.width, objectData.size.height, true, true );//, generated.size.width, generated.size.height );

                newObject.editor = _this.editor;
                newObject.ready = true;
                newObject.init( true);

                _this.editor.stage.addObject( newObject );
                newObject.isProposedPosition = true;
                newObject.dbID = newObject.dbId = objectData._id;
                newObject.order = objectData.order;
                _this.editor.registerObject(newObject,_this)

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
                newObject._align = objectData._align;
                newObject.verticalAlign = objectData.verticalAlign;

                if( objectData.showBackground ){

                    newObject.displayBackground();
                    newObject.showBackground = objectData.showBackground;

                }else {

                    newObject.showBackground = objectData.showBackground;
                    newObject.hideBackground();

                }

                if( objectData.dropShadow ){

                    newObject.dropShadow();

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
                                _this.editor

                            );

                            _line.addCreatedLetter( _letter );

                        }

                    }

                }

                newObject.setCenterReg();

                newObject.setPosition( objectData.pos.x , objectData.pos.y );


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

            return newObject;

        }

		this.isReadyToRender();

	}

	p.loadedTheme = function(){

		this.themePageLoaded = true;
		this.isReadyToRender();

	}

	p.isReadyToRender = function(){

		if( (this.UsedImages.length == this.loadedImages) && ( this.themePageLoaded || this.ThemePage == null ) ){

			// tutaj powinien byc listener
			this.renderPagePreview();

		}

	}

	p.loadedImage = function(){

		this.loadedImages++;
		this.isReadyToRender();

	}

	p.renderPagePreview = function(){

		var canvas = document.createElement('canvas');
		canvas.setAttribute( 'width', this.width );
		canvas.setAttribute( 'height', this.height );

		var stage = new createjs.Stage( canvas );
		stage.scaleX = stage.scaleY = 1;

		var background = new createjs.Shape();
		background.graphics.beginFill("white");
		background.graphics.drawRect(0,0,this.width, this.height);

		stage.addChild( background );

		for( var i=0; i < this.scene.length; i++ ){

			stage.addChild( this.scene[i].object );

		}

		var _this = this;

		function tryRender(){

			var ready = 0;

			for( var i=0; i < _this.scene.length; i++ ){

                if( _this.scene[i].object.type == "ProposedPosition" ){

                    //alert( _this.scene[i].object.maskReady && _this.scene[i].object.insideReady );
                    if( _this.scene[i].object.maskReady && _this.scene[i].object.insideReady ){
                        ready++;
                    }

                } else {
                    if( _this.scene[i].object.ready ){
                        ready++;
                    }
                }
				

			}

			if( ready == _this.scene.length ){

				stage.update();

				var ratio = 90/_this.height;

				$('li.photoAlbumPageMulti[data-user-view-id="'+_this.viewParent._id+'"]').css( 'background-image', 'url('+stage.toDataURL()+')' );
				$('li.photoAlbumPageMulti[data-user-view-id="'+_this.viewParent._id+'"]').width( ratio * _this.width );

                setTimeout( () => {

                    if( _this.pageValue == 2 ){

                        canvas.setAttribute( 'width', _this.width*3/2 );
                        canvas.setAttribute( 'height', _this.height*3 );
    
                        stage.scaleX = stage.scaleY = 3;
                        stage.update();
    
                        _this.prev = [stage.toDataURL()];
    
                        stage.x -= _this.width*3/2;
                        stage.update();
    
                        _this.prev.push( stage.toDataURL() );
    
                    }else {
    
                        canvas.setAttribute( 'width', _this.width*3 );
                        canvas.setAttribute( 'height', _this.height*3 );
    
                        stage.scaleX = stage.scaleY = 3;
                        stage.update();
                        _this.prev = [stage.toDataURL()];
    
                    }
    
                    var childs =  $('#viewsListUser .viewsListContent .viewsListUser').children();
                    var width = 0;
                    for( var i=0; i < childs.length; i++){
    
                        width += $( childs[i] ).outerWidth() + 101;
    
                    }
                    
                    $('#viewsListUser .viewsListContent .viewsListUser').width( width );

                }, 1000 );

				

			}else {

				setTimeout(	tryRender, 1000 );

			}

		}

		tryRender();

	}

	export {UserPage};
