import {Bitmap} from './EditorBitmap';
import {Text2} from './Text2';

    function ThemePage( themePage, parentPage ){

        this.parentPage = parentPage;

        if( themePage ){

        	this.init( themePage );

        }else {

            this.parentPage.loadedTheme();

        }
        
	};
   
	var p = ThemePage.prototype;

	p.init = function( themePage ){

		var _this = this; 

        this.proposedTemplates = themePage.proposedTemplates;

		this.backgroundObjects = [];
		this.foregroundObjects = [];
		this.imagesCount = themePage.backgroundObjects.EditorBitmaps.length + themePage.foregroundObjects.EditorBitmaps.length;
		this.loadedImages = 0;

		for( var i=0; i < themePage.backgroundObjects.EditorBitmaps.length; i++ ){

			var bitmap = new Bitmap( 
				
				themePage.backgroundObjects.EditorBitmaps[i].ProjectImage.name, 
        		themePage.backgroundObjects.EditorBitmaps[i].ProjectImage.minUrl, 
        		false, 
        		true,
        		themePage.backgroundObjects.EditorBitmaps[i],
        		_this

			);

            bitmap.uid = themePage.backgroundObjects.EditorBitmaps[i].uid;
            bitmap.dbID = themePage.backgroundObjects.EditorBitmaps[i]._id;
            bitmap.x = themePage.backgroundObjects.EditorBitmaps[i].x;
            bitmap.y = themePage.backgroundObjects.EditorBitmaps[i].y;
            bitmap.dbID = themePage.backgroundObjects.EditorBitmaps[i]._id;
            
            bitmap.regX = themePage.backgroundObjects.EditorBitmaps[i].ProjectImage.width/2;
            bitmap.regY = themePage.backgroundObjects.EditorBitmaps[i].ProjectImage.height/2;
            bitmap.order = themePage.backgroundObjects.EditorBitmaps[i].order;
            
            //newEditorBitmap.initEvents();
            //initObjectDefaultEvents( newEditorBitmap );
            
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").drawRect(0, 0, themePage.backgroundObjects.EditorBitmaps[i].ProjectImage.width, themePage.backgroundObjects.EditorBitmaps[i].ProjectImage.height );
            bitmap.hitArea = hit;

            bitmap.trueHeight = themePage.backgroundObjects.EditorBitmaps[i].ProjectImage.trueHeight;
            bitmap.trueWidth = themePage.backgroundObjects.EditorBitmaps[i].ProjectImage.trueWidth;

			this.backgroundObjects.push( bitmap );

		}

		for( var i=0; i < themePage.foregroundObjects.EditorBitmaps.length; i++ ){

			var bitmap = new Bitmap( 
				
				themePage.foregroundObjects.EditorBitmaps[i].ProjectImage.name, 
        		themePage.foregroundObjects.EditorBitmaps[i].ProjectImage.minUrl, 
        		false, 
        		true,
        		themePage.foregroundObjects.EditorBitmaps[i],
        		_this

			);

            bitmap.uid = themePage.foregroundObjects.EditorBitmaps[i].uid;
            bitmap.dbID = themePage.foregroundObjects.EditorBitmaps[i]._id;
            bitmap.x = themePage.foregroundObjects.EditorBitmaps[i].x;
            bitmap.y = themePage.foregroundObjects.EditorBitmaps[i].y;
            bitmap.dbID = themePage.foregroundObjects.EditorBitmaps[i]._id;
            
            bitmap.regX = themePage.foregroundObjects.EditorBitmaps[i].ProjectImage.width/2;
            bitmap.regY = themePage.foregroundObjects.EditorBitmaps[i].ProjectImage.height/2;
            bitmap.order = themePage.foregroundObjects.EditorBitmaps[i].order;
            
            //newEditorBitmap.initEvents();
            //initObjectDefaultEvents( newEditorBitmap );
            
            var hit = new createjs.Shape();
            hit.graphics.beginFill("#000").drawRect(0, 0, themePage.foregroundObjects.EditorBitmaps[i].ProjectImage.width, themePage.foregroundObjects.EditorBitmaps[i].ProjectImage.height );
            bitmap.hitArea = hit;

            bitmap.trueHeight = themePage.foregroundObjects.EditorBitmaps[i].ProjectImage.trueHeight;
            bitmap.trueWidth = themePage.foregroundObjects.EditorBitmaps[i].ProjectImage.trueWidth;

			this.foregroundObjects.push( bitmap );

		}

        for( var i=0; i < themePage.foregroundObjects.EditorTexts.length; i++ ){

            var text = themePage.foregroundObjects.EditorTexts[i];

            var object = new Text2( text.name, 20, text.width, text.height, false, true );
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
                            text.content[line].letters[letter].editor
                        );

                        _line.addCreatedLetter( _letter );

                    }

                }

            }

            object.setTrueHeight( text.height );
            object.setTrueWidth( text.width );
            object._updateShape();
            object.setPosition( text.x, text.y );

            this.foregroundObjects.push( object );

            var fonts = object.collectFontsFamily();

        }

		this.backgroundObjects = _.sortBy( this.backgroundObjects , 'order' );
		this.foregroundObjects = _.sortBy( this.foregroundObjects , 'order' );

	}

	p.loadedImage = function(){

		this.loadedImages++;

		if( this.imagesCount == this.loadedImages ){

			this.parentPage.loadedTheme();

		}

	}

export { ThemePage };