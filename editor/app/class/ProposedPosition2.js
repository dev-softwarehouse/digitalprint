import {EditorObject} from './EditorObject';
import {BackgroundFrame} from './BackgroundFrame';
import {effectName, effects} from "./tools/proposedPostionTools/EffectsTool";
import EditorShadow2 from "./EditorShadow2";
import {safeImage} from "../utils";

	if( EDITOR_ENV.user ){
		var ProposedPosition2Extend = require('./ProposedPosition2_user').ProposedPosition2;
	}else{
		var ProposedPosition2Extend = require('./ProposedPosition2_admin').ProposedPosition2;
	}

	/**
	* Klasa pozycji proponowanych
	*
	* @class ProposedPosition
	* @constructor
	*/
	function ProposedPosition2( context, name, dbId, width, height, settings ){

		var _this = this;

		settings = settings || {};
		this.editor = context;

		createjs.Container.call(this);

		if( userType == 'admin' || userType == 'advancedUser' )
			EditorObject.call( this, true, settings );
		else
			EditorObject.call( this, false, settings );

		this.filterStack = [];

		this._objectRemover = null;
		this._mask = new createjs.Shape();
		this._mask.graphics.c().f("rgba(255,255,255, 0.1)").r( 0,0, width, height );
		this.mainLayer.mask = this._mask;
		this.bottomCompoundObject = new createjs.Container();
		this.mainObject = new createjs.Container();
		if( userType == 'admin')
			this.mainObject.mouseEnabled = true;
		else
			this.mainObject.mouseEnabled = false;


		this.topCompoundObject = new createjs.Container();

		this.object = new createjs.Container();
		this.object.addChild( this.bottomCompoundObject, this.mainObject, this.simpleBorder, this.topCompoundObject );
		this.object.width = this.object.trueWidth = width;
		this.object.height = this.object.trueHeight = height;
		
		this.setTrueWidth( width );
		this.setTrueHeight( height );

		this.backgroundHit = new createjs.Shape();
		this.backgroundHit.graphics.f('rgba(0,0,0,0)').r(0,0, this.trueWidth, this.trueHeight );
		this.backgroundHit.hitArea = new createjs.Shape();
		this.backgroundHit.hitArea.graphics.f('rgba(0,0,0,1)').r(0,0, this.trueWidth, this.trueHeight );
		this.compoundBorderColor = '#83e7dc';
		
		this.addChildAt( this.backgroundHit, 0 );
		this.mainLayer.addChild( this.object );

		this.borderLayer.mouseEnabled = false;

		this.init( width, height, 'admin' );

		this.objectInside = null;

		this.type = "ProposedPosition";
        this.toolsType = 'proposedPosition';

        this.snapToPixel = true;

		this.addEventListener('stageScroll', function( e ){

			if( _this.toolbox )
				_this.toolbox._updateToolsBoxPosition();

			_this.recalculateAlphaMask();

		});

		this.addEventListener('stageMove', function( e ){

			if( _this.toolbox )
				_this.toolbox._updateToolsBoxPosition();

		});

		this.addEventListener('tick', ( e ) => {
			
			if( this.needRedraw ){

				this.redraw();
			}
	
		});

		this.addEventListener('resizeCorner', ( e ) => {

			this.recalculateAlphaMask();
			this.redraw()

		})

		this.cursor = 'move'
	};


	var p = ProposedPosition2.prototype = $.extend( true, new createjs.Container() , Object.create(EditorObject.prototype), ProposedPosition2Extend.prototype );

	p.constructor = ProposedPosition2;

	p.setBackgroundFrame = function( frameObj ){

		if( !this.backgroundFrame ){

			this.backgroundFrame = new BackgroundFrame( frameObj );
			this.backgroundFrame.setParentElement( this );
			this.backgroundFrameLayer.addChildAt( this.backgroundFrame, 0 );

		}else {

			this.backgroundFrame.configurate( frameObj );
			this.backgroundFrame.updateSize();

		}

		this.updateShadow();

	};

	p.redraw = function(){

		this.mainObject.uncache();
		var currentScale = this.mainObject.scaleX;
		this.mainObject.scaleX =this.mainObject.scaleY = 4;
		this.mainObject.cache( 0, 0, this.width, this.height, 4);
		this.mainObject.scaleX =this.mainObject.scaleY = currentScale;

	}

	p.removeBackgroundFrame = function(){

		if( this.backgroundFrame ){

			this.backgroundFrame.parent.removeChild( this.backgroundFrame );
			this.backgroundFrame = null;
			this.backgroundFrameID = null;
			this.updateShadow();

		}

	};

	p.assignFilters = function(){

		const allFilters = [];
		switch(this.effectName){
			case effectName.BW:
                allFilters.push(effects.BW());
				break
			case effectName.SEPIA:
                allFilters.push(effects.SEPIA());
				break
			case effectName.NEGATIVE:
                allFilters.push(effects.NEGATIVE());
				break
		}
        if( this.alphaMaskFilter ){
            allFilters.push( this.alphaMaskFilter );
		}
        this.mainObject.filters = allFilters;
	}

	p.recalculateAlphaMask = function(){

		this.assignFilters();

	}

	p.addImageAlphaFilter = function( projectImage ){

		this.maskFilter=projectImage._id
		var image = safeImage()
		var bitmapAlpha = new createjs.Bitmap( image );

		var container = new createjs.Container();
		container.addChild( bitmapAlpha );
		this.ready = false;
		image.onload = function(){

			bitmapAlpha.scaleX = (this.trueWidth/projectImage.trueWidth);
			bitmapAlpha.scaleY = (this.trueHeight/projectImage.trueHeight);
			
			container.cache( 0,0, projectImage.trueWidth, projectImage.trueHeight, 4 );

			var filter = new createjs.AlphaMaskFilter( container.cacheCanvas );

			this.alphaMaskObject = projectImage;
			this.alphaMaskFilter = filter;

			this.updateFilters();

			this.maskReady = true;

			this.needRedraw = true;

		}.bind( this );

		image.src = EDITOR_ENV.staticUrl+projectImage.imageUrl;

	};

	p.removeAlphaMask = function(){

		this.maskReady = true;
		this.alphaMaskObject = null;
		this.alphaMaskFilter = null;
		this.maskFilter=null
		this.updateFilters();		

	}


	p.updateFilters = function(){

		this.mainObject.uncache();
		this.assignFilters();
		this.redraw();

	};

	p.setEffect = function( effectName ){

		this.effectName= effectName;
		this.updateFilters();

	};

	p.calculateObjectInsideQuality = function( targetDPI ){

		if( this.objectInside ){

			if( this.objectInside.originWidth && this.objectInside.originHeight ){

				var inchSquare = ( this.width * this.height ) * 0.000155;

				// rozmiar w milimetrach obrazu który bedzie rysowany
				var sizeInProject = { width: this.objectInside.width, height: this.objectInside.height };

				var pixelsPerMilimetr = this.objectInside.originWidth/sizeInProject.width;
				var pixelsPerCentimeter = pixelsPerMilimetr * 10;
				var pixelsPerInch = pixelsPerCentimeter * 2.54;

				if( pixelsPerInch < targetDPI ){

					if( this.DPIHelper ){

						this.DPIHelper.getChildAt(1).visible = true;
						this.DPIHelper.getChildAt(0).text = parseInt(pixelsPerInch) + " dpi";

					}else {

						this.createDPIHelper();
						this.DPIHelper.getChildAt(1).visible = true;
						this.DPIHelper.getChildAt(0).text = parseInt(pixelsPerInch) + " dpi";

					}

				}else {

					if( this.DPIHelper ){

						this.DPIHelper.getChildAt(1).visible = false;
						this.DPIHelper.getChildAt(0).text = parseInt(pixelsPerInch) + " dpi";

						if( !this.focused ){

							this.destroyDPIHelper();

						}

					}

				}

			}else {

				console.log('nie moge obliczyc DPI');

			}
		}

		return ( pixelsPerInch > targetDPI );

	};

	p.resetSettings = function(){

		this.setBorderWidth(0);
		this.updateSimpleBorder();
		this.setShadowBlur(0);
		this.shadowOffsetY = this.shadowOffsetX = 0;
		this.unDropShadow();
		this.destroyDPIHelper();

	};

	p.createDPIHelper = function(){

		var Editor = this.editor;
		var DPIContainer = new createjs.Container();

		var text = new createjs.Text( "aaa", (14/Editor.getStage().scaleX) + 'px Arial', '#fff' );
 		text.textBaseline = "alphabetic";
 		text.x = 25/Editor.getStage().scaleX;
 		text.y = 6/Editor.getStage().scaleX;
 		text.shadow = new createjs.Shadow("#000000", 0, 0, 4/Editor.getStage().scaleX);

		var image = new Image();
		var dpiSmile = new createjs.Bitmap( image );
		dpiSmile.visible = false;
		dpiSmile.y = 0;
		dpiSmile.shadow = new createjs.Shadow("#000000", 0, 0, 3/Editor.getStage().scaleX);

		image.onload = function(){

			dpiSmile.scaleX = dpiSmile.scaleY = 30/this.width/Editor.getStage().scaleX;//
			dpiSmile.regX = this.width/2;
			dpiSmile.regY = this.height/2;

		}

		DPIContainer.addChild( text, dpiSmile );

		this.DPIHelper = DPIContainer;
		this.topCompoundObject.addChild( this.DPIHelper );

		DPIContainer.x = DPIContainer.parent.width/2 - 45/Editor.getStage().scaleX;
		DPIContainer.y = DPIContainer.parent.height - 20/Editor.getStage().scaleX;

		image.src = 'app/images/badDPI2.svg';

	};

	p.updateDPIHelper = function(){

		var Editor = this.editor;
		if( this.DPIHelper ){

			this.DPIHelper.x = this.DPIHelper.parent.width/2 - 45/Editor.getStage().scaleX;
			this.DPIHelper.y = this.DPIHelper.parent.height - 20/Editor.getStage().scaleX;

		}

	};

	p.destroyDPIHelper = function(){


		this.topCompoundObject.removeChild( this.DPIHelper );
		this.DPIHelper = false;

	};

	p.displayActiveBorderColor = function(){

		var Editor = this.editor;
		this.compoundBorderColor = '#0a5d59';
		this.border.visible = true;
		this.border.graphics.c().ss(4/Editor.getStage().scaleX).s(this.compoundBorderColor).mt(0,0).lt(this.width,0).lt(this.width, this.height).lt(0, this.height).cp();

	};

	p.updateActiveBorder = function(){

		var Editor = this.editor;
		this.compoundBorderColor = '#0a5d59';
		this.border.graphics.c().ss(4/Editor.getStage().scaleX).s(this.compoundBorderColor).mt(0,0).lt(this.width,0).lt(this.width, this.height).lt(0, this.height).cp();

	};

	p.displayCropingBorderColor = function(){

		var Editor = this.editor;
		this.compoundBorderColor = '#0a5d59';
		this.border.visible = true;
		this.border.graphics.c().ss(2/Editor.getStage().scaleX).s(this.compoundBorderColor).mt(0,0).lt(this.width,0).lt(this.width, this.height).lt(0, this.height).cp();

	};

	p.displayUnactiveBorderColor = function(){

		var Editor = this.editor;

		if( this.objectInside ){

			this.border.visible = false;
			this.background.visible= false;

		}else {

			this.background.visible= true;
			this.border.visible = true;
			this.border.graphics.c().ss(2/Editor.getStage().scaleX).s("#83e7dc").mt(0,0).lt(this.width,0).lt(this.width, this.height).lt(0, this.height).cp();

		}

	};

	p.updateMask = function(){

		var alphaColor = "rgba(0,0,0,0.7)";
		var shape = this.maskShape;

		if( !shape )
			return;

		if( this.objectInside.rotation%180 != 90 ){

			shape.graphics.c().f( alphaColor ).r(

				this.objectInside.x - this.objectInside.width/2,
				this.objectInside.y - this.objectInside.height/2,
				this.objectInside.width/2 - this.objectInside.x,
				this.objectInside.height

			).r(

				this.trueWidth - this.objectInside.x + this.objectInside.x,
				this.objectInside.y - this.objectInside.height/2,
				this.objectInside.x +this.objectInside.width/2 - this.trueWidth,
				this.objectInside.height

			).r(

		      0,
		      this.objectInside.y - this.objectInside.height/2,
		      this.trueWidth,
		      this.objectInside.height/2 - this.objectInside.y

		    ).r(

		       0,
		       this.trueHeight,
		       this.trueWidth,
		       this.objectInside.height/2 - ( this.trueHeight - this.objectInside.y)

		    );

		}else {

			shape.graphics.c().f( alphaColor ).r(

	      		this.objectInside.x - this.objectInside.height/2,
				this.objectInside.y - this.objectInside.width/2,
				this.objectInside.height/2 - this.objectInside.x,
				this.objectInside.width

			).r(

				this.width,
				this.objectInside.y - this.objectInside.width/2,
				this.objectInside.height/2 + this.objectInside.x - this.width,
				this.objectInside.width
				// this.objectInside.width

			).r(

		      0,
		      this.objectInside.y - this.objectInside.width/2,
		      this.width,
		      this.objectInside.width/2 - this.objectInside.y

		    ).r(

		       0,
		       this.height,
		       this.width,
		       this.objectInside.width/2 + this.objectInside.y - this.height

		    );

		}



	};


    p.removeCollectionReference = function(){

        if( this.objectInside )
            delete this.objectInside.collectionReference.imageReferencesInScene[ this.objectInside.uid ];

    };


    p.removeBitmap = function( bitmap ){

        this.removeChild( bitmap );
        this.objectInside = null;

        if( this.toolbox ){

            $(".proposed-tools").remove();
            this.initedCroping = false;
            this.toolbox = false;

        }

    };




	p.positionObjectInside = function(){

		var inPosX = this.objectInside.x;
		var insideWidth = this.objectInside.width;
		var width = this.width;

		var inPosY = this.objectInside.y;
		var insideHeight = this.objectInside.height;
		var height = this.height;

		if( this.objectInside.rotation%180 == 0 ){

			if( insideWidth > width ){

				if( this.objectInside.x > insideWidth/2 )
					this.objectInside.x = insideWidth/2;
				else if( this.objectInside.x + insideWidth/2 < width )
					this.objectInside.x = width - insideWidth/2;

			}
			else {

				this.objectInside.centerX();

			}

			if( insideHeight/2 + this.objectInside.y < this.height ){

				if( this.objectInside.y > insideHeight/2 )
					this.objectInside.y = insideHeight/2;
				else if( this.objectInside.y + insideHeight/2 < height )
					this.objectInside.y = height - insideHeight/2;

			}
			else {

				this.objectInside.centerY();

			}
		}else {

			if( insideHeight > width ){

				if( this.objectInside.x > insideHeight/2 )
					this.objectInside.x = insideHeight/2;
				else if( this.objectInside.x + insideHeight/2 < width )
					this.objectInside.x = width - insideHeight/2;

			}
			else {
				this.objectInside.centerX();

			}

			if( insideWidth/2 + this.objectInside.y >= this.height ){

				if( this.objectInside.y > insideWidth/2 )
					this.objectInside.y = insideWidth/2;
				else if( this.objectInside.y + insideWidth/2 < height )
					this.objectInside.y = height - insideWidth/2;

			}
			else {

				this.objectInside.centerY();

			}

		}

	};


	p.initMask = function(){

		if( this.maskShape ){
			this.maskShape.visible = true;
			return;
		}

		var shape = new createjs.Shape();

		var alphaColor = "rgba(0,0,0,0.7)";

		this.maskShape = shape;
		this.maskShape.mouseEnabled = false;

		shape.graphics.c().f( alphaColor ).r(

			this.objectInside.x - this.objectInside.width/2,
			this.objectInside.y - this.objectInside.height/2,
			this.objectInside.width/2 - this.objectInside.x,
			this.objectInside.height

		).r(

			this.trueWidth - this.objectInside.x + this.objectInside.x,
			this.objectInside.y - this.objectInside.height/2,
			this.objectInside.x +this.objectInside.width/2 - this.trueWidth,
			this.objectInside.height

		).r(

	      0,
	      this.objectInside.y - this.objectInside.height/2,
	      this.trueWidth,
	      this.objectInside.height/2 - this.objectInside.y

	    ).r(

	       0,
	       this.trueHeight,
	       this.trueWidth,
	       this.objectInside.height/2 - ( this.trueHeight - this.objectInside.y)

	    );
		this.mainObject.parent.addChild( shape );


		this.uncache();

	};

	p.removePositionRemover = function(){

		if( this._objectRemover ){

			this._objectRemover.parent.removeChild( this._objectRemover );

			this._objectRemover = null;

		}

	};

	p.displayPositionRemover = function(){

		var Editor = this.editor;
		var _this = this;

		if( !this._objectRemover ){

			var visibleCorner = this.visibleCorner();

			var object = new createjs.Container();

			var image = new Image();

			var bitmap = new createjs.Bitmap( image );

			bitmap.scaleX = bitmap.scaleY = (30/72)/Editor.getStage().scaleX;

			bitmap.regX = 32;
			bitmap.regY = 33;

			bitmap.x = 15/Editor.getStage().scaleX;
			bitmap.y = 15/Editor.getStage().scaleX;

			image.src = 'app/images/kosz-01.svg';

			var shape = new createjs.Shape();

			shape.graphics.f('rgba(0, 0, 0, 0.5)').rr( 0, 0, 30/Editor.getStage().scaleX, 30/Editor.getStage().scaleX, 4/Editor.getStage().scaleX, 4/Editor.getStage().scaleX, 4/Editor.getStage().scaleX, 4/Editor.getStage().scaleX );

			if( visibleCorner == 1 ){

				object.x = this.trueWidth - 35/Editor.getStage().scaleX;
				object.y = 5/Editor.getStage().scaleX;

			}else if( visibleCorner == 2 ){

				object.x = this.trueWidth - 35/Editor.getStage().scaleX;
				object.y = this.trueHeight - 35/Editor.getStage().scaleX;

			}else if( visibleCorner == 3 ){

				object.x = 5/Editor.getStage().scaleX;
				object.y = this.trueHeight - 35/Editor.getStage().scaleX;

			}else {

				object.x = 5/Editor.getStage().scaleX;
				object.y = 5/Editor.getStage().scaleX;

			}

			object.setBounds( 0, 0, 30/Editor.getStage().scaleX, 30/Editor.getStage().scaleX );

			object.addEventListener('mouseover', function( e ){

				shape.graphics.c().f('rgba(255, 0, 0, 0.5)').rr( 0, 0, 30/Editor.getStage().scaleX, 30/Editor.getStage().scaleX, 4/Editor.getStage().scaleX, 4/Editor.getStage().scaleX, 4/Editor.getStage().scaleX, 4/Editor.getStage().scaleX );

			});

			object.addEventListener('mouseout', function( e ){

				e.stopPropagation();
				shape.graphics.c().f('rgba(0, 0, 0, 0.5)').rr( 0, 0, 30/Editor.getStage().scaleX, 30/Editor.getStage().scaleX, 4/Editor.getStage().scaleX, 4/Editor.getStage().scaleX, 4/Editor.getStage().scaleX, 4/Editor.getStage().scaleX );

			});

			object.addEventListener('click', function( e ){

				e.stopPropagation();

				var editableArea = _this.getFirstImportantParent();

	            Editor.webSocketControllers.userPage.removeProposedImage(

	                editableArea.userPage._id,
	                _this.dbID

	            );

			});

			object.addEventListener('pressmove', function( e ){

				e.stopPropagation();

			});

			object.addChild( shape, bitmap );

			this._objectRemover = object;

			this.topCompoundObject.addChild( object );

		}

	};


	p.visibleCorner = function(){

		var parent = this.getFirstImportantParent();

		var pos  = this.localToLocal( this.width -25, 5, this.getFirstImportantParent() );
		var pos2 = this.localToLocal( this.width -25, this.height -25, this.getFirstImportantParent() );
		var pos3 = this.localToLocal( 5, this.height -25, this.getFirstImportantParent() );

		if( pos.x < parent.width-25 && pos.y > 0 ){

			return 1;

		}else if( pos2.x < parent.width-25 && pos2.y > 0 && pos2.y < parent.height-25 ){

			return 2;

		}else if( pos3.x > 0 && pos3.x < parent.width-25 && pos3.y > 0 && pos3.y < parent.height-25){

			return 3;

		}else {

			return 4;

		}

	};


	/**
	* Metoda inicjująca obiekt proponowany, dodaje niezbędne obiekty, oraz przypisuje do nich eventy
	*
	* @method initialize
	*
	*/
	p.init = function( width, height ){

		var _this = this;
		var Editor = this.editor;

		this.history_tmp = null;
		this.type = 'bitmap';
		this.width = this.trueWidth = width;
		this.height = this.trueHeight = height;
        this.regX = width/2;
        this.regY = height/2;

		this.background = new createjs.Shape();
		this.background.setBounds( 0, 0, width, height);

		this.border = new createjs.Shape();
		this.border.graphics.ss(1/ this.editor.getStage().scaleX).s("rgb(0,255,0)").mt(1,1).lt(width-1,1).lt(width-1, height-1).lt(1, height-1).cp();


		this.background = new createjs.Shape();
		this.background.graphics.f("rgba(255,255,255, 0.4)").r(0,0, width, height);


		this.bottomCompoundObject.addChild( this.background );

		this.setBounds( 0, 0, width, height);

		var imageinfoContainer = new createjs.Container();

		var photoicon = new createjs.Bitmap( 'app/images/zdjecie-1.svg' );
		photoicon.rotation = -this.rotation;
		photoicon.x = this.width/2;
		photoicon.y = this.height/2;
		photoicon.regX = 44/2;
		photoicon.regY = 43/2;

		photoicon.scaleX = (100/44)/ this.editor.getStage().scaleX;
		photoicon.scaleY = (100/44)/Editor.getStage().scaleX;
		photoicon.shadow = new createjs.Shadow("#565656", 0, 0, 10/Editor.getStage().scaleX);

		this._photoIcon = photoicon;

		imageinfoContainer.addChild(  photoicon );

		this.addPhotoIcon = imageinfoContainer;

		this.topCompoundObject.addChild( this.border, imageinfoContainer );

		this.initDragAndDrop();

        this.initEvents();
		this.initCurrentEvents();

	};


	p.rotate = function( rotation ){

		var Editor = this.editor;

		var editing_id = Editor.tools.getEditObject();
        var editingObject = Editor.stage.getObjectById( editing_id );


		this.rotation += rotation || 0;

		/*
		if( this.photoicon )
			this.photoicon.rotation = -this.rotation;
		*/

		try{
			document.getElementById('setRotationInput').value = parseInt((editingObject.rotation % 360)).toFixed(0);
		}catch(e){}

		if( this.mask ){

			this.mask.rotation += rotation;

		}

	};

	p.updateCropingTool = function(){

		this.cropingTool.graphics.c().f("rgba(255,0,0, 0.1)").ss(1/this.editor.getStage().scaleX).s("#666").dc( this.width/2, this.height/2, 30/this.editor.getStage().scaleX);

	};

	p.deleteCropingTool = function(){

		if( this.cropingTool ){

			this.topCompoundObject.removeChild( this.cropingTool );
			this.cropingTool = null;

		}

	};

	p.createCropingTool = function(){

		if( this.cropingTool ){
			return;
		}

		var tool = new createjs.Shape();
		this.cropingTool = tool;
		this.cropingTool.graphics.c().f("rgba(0,0,0, 0.4)").ss(1/this.editor.getStage().scaleX).s("#fff").dc( this.width/2, this.height/2, 30/this.editor.getStage().scaleX);
		this.cropingTool.cursor = "move";
		this.topCompoundObject.addChild( this.cropingTool );

		tool.addEventListener('pressup', function( e ){

			e.stopPropagation();
			this.uncache();
			this.mainLayer.mask = this._mask;
			this.maskShape.visible = false;

			this.editor.webSocketControllers.editorBitmap.setSettings( this.objectInside.dbID, { x: this.objectInside.x, y: this.objectInside.y } );

		}.bind( this));

		tool.addEventListener('mousedown', function( e ){

			e.stopPropagation();
			this.editor.setVectorStart( e.stageX, e.stageY );

		}.bind( this ));

		tool.addEventListener('pressmove', function( e ){

			e.stopPropagation();

			var _this = this.objectInside;
			var prop = this;

			this.initMask();

			this.mainLayer.mask = null;

			if( e.nativeEvent.button == 0 && this.editor.stage.getMouseButton() != 1 ){

				this.editor.setVectorStop( e.stageX, e.stageY );
				var vec = this.editor.getMoveVector();
				this.editor.setVectorStart( e.stageX, e.stageY );

				var scaleX = 1;
				var scaleY = 1;
				var parent = _this.parent;

				while( parent ){

					scaleX *= parent.scaleX;
					scaleY *= parent.scaleY;
					parent = parent.parent;

				}

				var bounds = _this.getTransformedBounds();

				var vecX = vec.x *1/scaleX;
				var vecY = vec.y *1/scaleY;

				if( _this.rotation%180 == 0 ){

					if( bounds.x - vecX < 0 && bounds.x - vecX + _this.width > _this.parent.trueWidth ){

						_this.x -= vec.x * 1/scaleX;

						if( _this.mask )
							_this.mask.x -= vec.x * 1/scaleX;

					}

					if( bounds.y - vecY < 0 && bounds.y - vecY + _this.height > _this.parent.trueHeight ){

						_this.y -= vec.y * 1/scaleY;

						if( _this.mask )
							_this.mask.y -= vec.y * 1/scaleY;

					}

				}else {

					if( bounds.x - vecX < 0 && bounds.x - vecX + _this.height > _this.parent.trueWidth ){

						_this.x -= vec.x * 1/scaleX;

						if( _this.mask )
							_this.mask.x -= vec.x * 1/scaleX;

					}

					if( bounds.y - vecY < 0 && bounds.y - vecY + _this.width > _this.parent.trueHeight ){

						_this.y -= vec.y * 1/scaleY;

						if( _this.mask )
							_this.mask.y -= vec.y * 1/scaleY;

					}

				}

				prop.updateMask();
				this.editor.tools.updateCompoundBox();
				this.redraw()

			};

		}.bind(this));

	};


	/**
	* Metoda inicjująca event drag and drop
	*
	* @method initialize
	*
	*/
	p.initDragAndDrop = function(){

		var _this = this;
		this.addEventListener("dragover", function(e){

			e.stopPropagation();
			//_this.updateCache();
			_this.background.graphics.c().f("rgba(0,255,0, 0.1)").r(0,0, _this.width, _this.height).ss(2).s("#99d499").mt(1,1).lt( _this.width, 1).lt( _this.width-1, _this.height-1 ).lt(0, _this.height-1).cp();

		});

		this.addEventListener("dragleave", function(e){

			e.stopPropagation();
			//_this.updateCache();
			_this.background.graphics.c().f("rgba(255,255,255, 0.1)").r(0,0, _this.width, _this.height).ss(2).s("#99d499").mt(1,1).lt( _this.width, 1).lt( _this.width-1, _this.height-1 ).lt(0, _this.height-1).cp();

		});

		this.addEventListener("drop", function(e){

			_this.hitArea = null;
			e.stopPropagation();

			_this.background.visible = false;

			var fileReader = new FileReader();

			fileReader.readAsDataURL( e.dataTransfer.files[0] );

			fileReader.onload = function( freader ){

				var loadedImage = new createjs.Bitmap( freader.target.result );

				loadedImage.image.onload = function(){

	
					var smallBitmap = Thumbinator.generateThumb( loadedImage );

					var newBitmap = new Editor.Bitmap("new", smallBitmap );

					newBitmap.image.onload = function(){

						newBitmap.width = newBitmap.trueWidth = newBitmap.image.width;
						newBitmap.height = newBitmap.trueHeight = newBitmap.image.height;
						newBitmap.getBounds();
						_this.addMainChild( newBitmap );
						Editor.stage.addObject( newBitmap );
						_this.objectInside = newBitmap;
						newBitmap.setCenterReg();
						newBitmap.center();
	

						newBitmap.removeAllEventListeners();
						_this.objectInside.setFullSize();
						_this.objectInside.center();

						_this.updateMask();
						_this.initToolBox();

						$(".scroll-bar").slider('value', _this.objectInside.scaleX );

					};

				}

			};

		});

	};


	p._updateToolsBoxPosition = function(){

		var tools = $("div#proposed-position-tool");

		var toolSize = {

			width  : tools.width(),
			height : tools.height()

		};

		var pos = this.getGlobalPosition();
		var stage = this.editor.getStage();
		var bounds = this.getTransformedBounds();

		tools.css({ top: pos[1] + (bounds.height/2)*stage.scaleY + toolSize.height + 50, left: pos[0] - toolSize.width/2 });

	};


	p.setTrueWidth = function( w, blockLeftCornerPosition ){

        var widthBefore = this.width;

		this.trueWidth = w;
		this.width = w * this.scaleX;
		this.regX = w/2;

		this.object.trueWidth = this.mainObject.width = w;

		for( var i=0; i < this.object.children.length; i++ ){

			this.object.children[i].trueWidth = this.object.children[i].width = w;

		}

		if( this.mask ){

			this.mask.regX = this.regX;

		}

        if( blockLeftCornerPosition ){
            var vector = (this.width - widthBefore)/2;
            this.x += vector;
        }

	};


	p.setTrueHeight = function( h, blockLeftCornerPosition ){

        var heightBefore = this.height;

		this.trueHeight = h;
		this.height = h * this.scaleY;
		this.regY = h/2;

		this.object.trueHeight = this.object.height = h;

		for( var i=0; i < this.object.children.length; i++ ){

			this.object.children[i].trueHeight = this.object.children[i].height = h;

		}

		if( this.mask ){

			this.mask.regX = this.regX;

		}

        if( blockLeftCornerPosition ){
            var vector = (this.height - heightBefore)/2;
            this.y += vector;
        }

	};


	p.initToolBox = function(){

		this.toolbox = true;

		var _this = this;

		$("body").append("<div id='proposed-position-tool' class='proposed-tools tools-box' data-object-id='" + this.id + "'></div>");

		var layerUp = document.createElement('div');
        layerUp.className = 'button';
        layerUp.id = 'layerUp';
        //layerUp.innerHTML = 'UP';

        layerUp.addEventListener('click', function( e ){

            e.stopPropagation();

            //_this.parent.setChildIndex( _this, (_this.parent.getChildIndex( _this ))++ );

        });

		var layerDown = document.createElement('div');
		layerDown.id = 'layerDown';
        layerDown.className = 'button';
       // layerDown.innerHTML = 'Down';

        layerDown.addEventListener('click', function( e ){

            e.stopPropagation();

            //_this.parent.setChildIndex( _this, (_this.parent.getChildIndex( _this ))-- );

        });

		var tools = $("div#proposed-position-tool");
		document.getElementById('proposed-position-tool').appendChild( layerDown );
		document.getElementById('proposed-position-tool').appendChild( layerUp );

		tools.append("<div class='scroll-bar proposed'></div>");

		$(".scroll-bar").slider({

			min : 0.3,
			max : 2,
			step : 0.01,
 			animate: "slow"

		});

		$(".scroll-bar").on( 'slide', function( e ){

			// zrobie too jak zmąrdzeje - mnożenie skali sprawi płynną animację, jednak jest trudono ocenić wielkość obrazka
			// i za kazdym razem nalezy updatowac slider
			var before = $(".scroll-bar").attr('data-value');
			var after = $(".scroll-bar").slider('value');

			$(".scroll-bar").attr('data-value', $(".scroll-bar").slider('value') );

			if( before < after )
				var multiply = 1.05;
			else
				var multiply = 0.95;
			// --------------------------------------


			_this.objectInside.setScale( $(".scroll-bar").slider('value') );

			var insideWidth = _this.objectInside.width;
			var width = _this.width;

			var insideHeight = _this.objectInside.height;
			var height = _this.height;

			if( insideWidth > width ){

				if( _this.objectInside.x > insideWidth/2 )
					_this.objectInside.x = insideWidth/2;
				else if( _this.objectInside.x + insideWidth/2 < width )
					_this.objectInside.x = width - insideWidth/2;

			}
			else {

				_this.objectInside.centerX();

			}

			if( insideHeight > height ){

				if( _this.objectInside.y > insideHeight/2 )
					_this.objectInside.y = insideHeight/2;
				else if( _this.objectInside.y + insideHeight/2 < height )
					_this.objectInside.y = height - insideHeight/2;


			}
			else {

				_this.objectInside.centerY();

			}

            //_this.updateCache();

		});

		var toolSize = {

			width  : tools.width(),
			height : tools.height()

		};

		var pos = this.getGlobalPosition();
		var stage = Editor.getStage();
		var bounds = this.getTransformedBounds();

		tools.css({ top: pos[1] + (bounds.height/2)*stage.scaleY + toolSize.height + 50, left: pos[0] - toolSize.width/2 });


		this.addEventListener('resize', function( e ){

			if( e.resizeMode == 'widthLeft' ){

				_this.setTrueWidth( e.objectSettings.width, false );

			} else if( e.resizeMode == 'widthRight'){

				_this.setTrueWidth( e.objectSettings.width, true );

			}

			if( _this.updateSimpleBorder ){

				_this.updateSimpleBorder();

			}
			_this._updateShape();
			_this._updateToolsBoxPosition();

			if( _this._photoIcon ){

				_this._photoIcon.x = _this.width/2;
				_this._photoIcon.y = _this.height/2;

			}

		});


		this.addEventListener('move', function( e ){

			_this._updateToolsBoxPosition();

		});


		this.addEventListener('scale', function( e ){

			_this._updateToolsBoxPosition();

		});

		this.addEventListener('rotate', function( e ){

			_this._updateToolsBoxPosition();

		});

	};

	/*

	    _this.mainObject.addChild( newBitmap );
        Editor.stage.addObject( newBitmap );
        _this.objectInside = newBitmap;

    */

    p._cloneObject = function(){

        var object = new Editor.ProposedPosition2( this.name +"_clone", null, this.width, this.height, {

            x             : this.x,
            y             : this.y,
            rotation      : this.rotation,
            width         : this.width,
            height        : this.height,
            scaleX        : this.scaleX,
            scaleY        : this.scaleY,
            shadowBlur    : this.shadowBlur,
            shadowColor   : this.shadowColor,
            shadowOffsetX : this.shadowOffsetX,
            shadowOffsetY : this.shadowOffsetY,
            dropShadow    : this._dropShadow,
            droppedBorder : this.droppedBorder,
            displaySimpleBorder  : this.displaySimpleBorder,
            borderColor   : this.borderColor,
            borderWidth   : this.borderWidth

        });

        /*
        if( this.objectInside ){

        	var clonedBitmap = this.objectInside._cloneObject();
        	object.mainObject.addChild( clonedBitmap );
        	object.objectInside = clonedBitmap;

        }
        */

        return object;

    };


	p.HTMLoutput = function(){

		var HTML = "<li data-id='"+ this.id +"'><span class='li-button' data-id='" + this.id + "'><span class='visibility"+((this.visible)? " active" : " un-active" )+"' data-id='"+this.id+"' data-base-id='" + this.dbId + "'></span><span class='image-miniature'></span><span class='object-name'>" + this.dbId + " </span><span class='locker"+((this.mouseEnabled)? " active" : " un-active" )+"'></span><span class='remover' data-id="+this.id+">x</span></span>";

		return HTML;

	};


	p.toLayerHTML = function(){


        var _this = this;
        var Editor = this.editor;
        var html = document.createElement('li');
        html.className = 'proposedPositionLayer';

        this.layerElement = html;

        html.addEventListener('click', function( e ){

            e.stopPropagation();

            if ( $("#editorLayers li").hasClass("layerSelected") ){

                    $("#editorLayers li").removeClass("layerSelected");
            }

            $(this).addClass("layerSelected");

            var object = Editor.stage.getObjectById( this.getAttribute( 'data-local-id' ) );
            if( !(object instanceof Editor.EditableArea ) ){
                Editor.tools.setEditingObject( this.getAttribute( 'data-local-id' ) );
                Editor.tools.init();
            }

        });

        var visibility = document.createElement('span');
        visibility.className = 'objectVisibility ' + ((this.visible)? 'visible' : 'notvisible' );

        visibility.addEventListener('click', function( e ){

            e.stopPropagation();

            if( $(this).hasClass('visible') ){

                this.className = 'objectVisibility notvisible';
                _this.visible = false;

            }
            else {

                this.className = 'objectVisibility visible';
                _this.visible = true;

            }

        });

        var name = document.createElement('span');
        name.className = 'objectName noEdit';
        name.innerHTML = 'Miejsce na zdjęcie';
        name.setAttribute( 'data-object-id', this.dbID );

        name.addEventListener('dblclick', function( e ){

            e.stopPropagation();


        });

        name.addEventListener('blur', function( e ){


        });

        var miniature = document.createElement('span');
        miniature.className = 'objectMiniature';

        var remover = document.createElement('span');
        remover.className = 'objectRemove';
        remover.setAttribute('object-id', this.dbID );

        remover.addEventListener('click', function( e ){

        	//alert('usuniecie pozycji proponowanej');

        });

        html.appendChild( visibility );
        html.appendChild( name );
        html.appendChild( miniature );
        miniature.appendChild( remover );

        return html;

	};

	p.showDropingTools = function(){

		if( this.objectInside ){

			this.hideDropingToolsToSwap();
			this.border.visible = false;

		}else {

			this.addPhotoIcon.visible = true;
			this.background.visible = true;
			this.displayUnactiveBorderColor();

		}

	};

	p.hideDropingToolsToSwap = function(){

		this.addPhotoIcon.visible = false;
		this.background.visible = true;
		this.displayUnactiveBorderColor();
		this.border.visible = true;

	}

	p.removeObjectInside = function(){

		if( this.objectInside ){

			createjs.Tween.get( this.mainObject ).to({ alpha: 0}, 300, createjs.Ease.quadInOut ).call( function( e ){

			    this.mainObject.removeChild( this.objectInside );
		    	this.objectInside = null;
				this.showDropingTools();

				if( this._toolBox  ){

					$("#proposedTemplate-toolsbox").remove();

					this.toolbox = false;
					this._toolBox = null;
					this.contextMenu = null;
					this.toolbox = new Editor.ProposedPositionContextMenu( this, 'min' );

				}
					this.destroyDPIHelper();

			}.bind( this ));

		}

	}

	p.dropShadow = function( save ){

		var Editor = this.editor;

		if ( this._dropShadow == false ){

			if(this.maskFilter){
                this.mainObject.shadow=new createjs.Shadow(this.shadowColor, this.shadowOffsetX, this.shadowOffsetY, this.shadowBlur);
			}else{
                this.customShadow = new EditorShadow2( this, this.shadowBlur, this.shadowColor, this.shadowOffsetX, this.shadowOffsetY, 4 );
                this.shadowLayer.addChildAt( this.customShadow, 0 );
			}

			this._dropShadow = true;

		}

		if( save ){

			this.editor.webSocketControllers[ this.socketController ].setAttributes(

				this.dbID,
				this.editor.adminProject.format.view.getId(),
				{
					dropShadow: true
				}

			);

		}

	};
	p.unDropShadow = function( save ){

		this.shadowLayer.removeChild( this.customShadow );
		this.customShadow = null;
        this.mainObject.shadow=null;
		this._dropShadow = false;

		/*
		if( save ){

			Editor.webSocketControllers[ this.socketController ].setAttributes(

				this.dbID,
				Editor.adminProject.format.view.getId(),
				{
					dropShadow: false
				}

			);

		}
		*/

	};

	p.updateShadow = function( ){
		if(!this._dropShadow)return
		if( this.customShadow ){

			this.customShadow.updateShadow( this, this.shadowBlur, this.shadowColor, this.shadowOffsetX, this.shadowOffsetY );

		}else if(this.maskFilter){
            this.mainObject.shadow=new createjs.Shadow(this.shadowColor, this.shadowOffsetX, this.shadowOffsetY, this.shadowBlur);
        }

	};

	export { ProposedPosition2 }
