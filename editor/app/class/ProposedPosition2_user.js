import ProposedPositionContextMenu  from './tools/ProposedPositionContextMenu2_user'
import {Bitmap} from './EditorBitmap';
import {EditableArea} from './editablePlane';
import React from "react";
import ReactDOM from "react-dom";
import {store} from "../ReactSetup";
import { Provider } from 'react-redux'
import {safeImage} from "../utils";

    export function ProposedPosition2(){

    }

	var p = ProposedPosition2.prototype;
	/**
	* Inicjalizuje kadrowanie obiektu
	*
	* @method initCroping
	*/
	p.initCropping = function( event ){

		var _this = this.objectInside;
		var prop = this;
		//
		prop.cropingTool.addEventListener('pressup',  function( e ){

			var _this = prop.objectInside;

			e.stopPropagation();
			prop.uncache();
			//prop.mainLayer.mask = prop._mask;
			prop.filters = [];
			document.body.style.cursor = "auto";
			prop.initedCroping = false;

			// editorBitmapID, x, y
			Editor.webSocketControllers.editorBitmap.savePosition( _this.dbID, _this.x, _this.y );

			prop.cropingTool.addEventListener('mousedown', function( e ){

				e.stopPropagation();

			});

		});

		prop.cropingTool.addEventListener('mousedown',  function( e ){

			prop.initMask();
			prop.mainLayer.mask = null;
			Editor.setVectorStart( e.stageX, e.stageY );

		});

		prop.cropingTool.addEventListener('pressmove', function( e ){

			var _this = prop.objectInside;
			e.stopPropagation();
			if( e.nativeEvent.button == 0 && Editor.stage.getMouseButton() != 1 ){

				Editor.setVectorStop( e.stageX, e.stageY );
				var vec = Editor.getMoveVector();
				Editor.setVectorStart( e.stageX, e.stageY );

				var scaleX = 1;
				var scaleY = 1;
				var parent = _this.parent;

				while( parent ){

					scaleX *= parent.scaleX;
					scaleY *= parent.scaleY;
					parent = parent.parent;

				}

				var bounds = _this.getTransformedBounds();

				var vecX = vec.x /scaleX;
				var vecY = vec.y /scaleY;



					if( bounds.x - vecX < 0 && bounds.x - vecX + _this.width > _this.parent.trueWidth ){

						_this.x -= vecX;

						if( _this.mask )
							_this.mask.x -= vecX;

					}

					if( bounds.y - vecY < 0 && bounds.y - vecY + _this.height > _this.parent.trueHeight ){

						_this.y -= vecY;

						if( _this.mask )
							_this.mask.y -= vecY;

					}



				prop.updateMask();
				Editor.tools.updateCompoundBox();

			};

		});

	};

    p.cropingFunction = function( event ){

        var Editor = this.editor;

		event.stopPropagation();

		Editor.setVectorStop( event.stageX, event.stageY );
		var vec = Editor.getMoveVector();
		Editor.setVectorStart( event.stageX, event.stageY );

		var scaleX = 1;
		var scaleY = 1;
		var parent = this;

		while( parent ){

			scaleX *= parent.scaleX;
			scaleY *= parent.scaleY;
			parent = parent.parent;

		}

		var bounds = this.objectInside.getTransformedBounds();

		var vecX = vec.x /scaleX;
		var vecY = vec.y /scaleY;

		if( this.objectInside.rotation%180 != 90 ){

			if( bounds.x - vecX < 0 && bounds.x - vecX + this.objectInside.width > this.objectInside.parent.trueWidth ){

				this.objectInside.x -= vecX;

				if( this.objectInside.mask )
					this.objectInside.mask.x -= vecX;

			}

			if( bounds.y - vecY < 0 && bounds.y - vecY + this.objectInside.height > this.objectInside.parent.trueHeight ){

				this.objectInside.y -= vecY;

				if( this.objectInside.mask )
					this.objectInside.mask.y -= vecY;

			}

		}else {

			if( bounds.x - vecX < 0 && bounds.x - vecX + this.objectInside.height > this.objectInside.parent.trueWidth ){

				this.objectInside.x -= vecX;

				if( this.objectInside.mask )
					this.objectInside.mask.x -= vecX;

			}

			if( bounds.y - vecY < 0 && bounds.y - vecY + this.objectInside.width > this.objectInside.parent.trueHeight ){

				this.objectInside.y -= vecY;

				if( this.objectInside.mask )
					this.objectInside.mask.y -= vecY;

			}

		}

		if( this.filterStack.length ){

			this.updateFilters();

		}

		this.updateMask();

    };

    p.zoom = function(){

    	var Editor = this.editor;

    	if( !this.zoomed ){

	    	var bounds = this.getTransformedBounds();
	    	var maxSizeH = window.innerHeight*0.8 / Editor.getStage().scaleX;
			var maxSizeW = window.innerWidth*0.8 / Editor.getStage().scaleX;

	    	var scale = maxSizeH/bounds.height;

	    	if( bounds.width * scale > window.innerWidth ){

	    		scale = maxSizeW/bounds.width;

	    	}

	    	var test = Editor.stage.getMousePositionFromScreen( window.innerWidth/2, window.innerHeight/2 );

	    	this.zoomed = true;

	    	this.xZoom = this.x;
	    	this.yZoom = this.y;
            if(userType === 'advancedUser') {
                test.x-=this.parent.parent.getTransformedBounds().x
                test.y-=this.parent.parent.getTransformedBounds().y
                Editor.toolsManager.getToolsFromType('proposedPosition').components[0].tools.hideCompoundBox();
            }
			createjs.Tween.get( this ).to({ x: test.x, y : test.y , scaleX : scale, scaleY : scale }, 200, createjs.Ease.quadInOut ).call( function(){


			}.bind(this));

    	}else {

    		this.zoomed = false;

    		createjs.Tween.get( this ).to({ x: this.xZoom, y : this.yZoom , scaleX : 1, scaleY : 1 }, 200, createjs.Ease.quadInOut ).call( function(){

                if(userType === 'advancedUser'){
                    Editor.toolsManager.getToolsFromType('proposedPosition').components[0].tools.showCompoundBox();
                }

			}.bind(this));

    	}


    };

    p.focus = function( e ){

    	e.stopPropagation();

    	var Editor = this.editor;
    	//this.mainObject.uncache();

    	this.removeAllEventListeners('click');
    	this.removeAllEventListeners('pressmove');
    	this.removeAllEventListeners('pressup');
    	this.removeAllEventListeners('mouseover');
    	this.removeAllEventListeners('mouseout');

    	this.displayCropingBorderColor();

    	this.addEventListener('click', function( e ){

    		e.stopPropagation();

    	});

		Editor.stage.getBackgroundLayer().addEventListener('click', canvasClick );

    	document.body.style.cursor = "move !important";
    	var prop = this;
    	var _this = this.objectInside;

    	this.focused = true;
		this.mainLayer.mask = null;
		this.initMask();
		this.updateMask();
		if( !this.DPIHelper ){

			this.createDPIHelper();

		}

		this.calculateObjectInsideQuality( Editor.getProductDPI() );

    	var stageElem = Editor.stage.getLayer( Editor.stage.MAIN_LAYER );
    	stageElem.mouseEnabled = false;
    	//stageElem.cache(-2000,-2000, 4000,4000 );

    	$('.displayController').css( { opacity: 0 } );
    	$('.displayController').css( 'pointer-events', 'none' );

		var int = setInterval( function(){

			if( stageElem.alpha < 0.4 ) {

				clearInterval( int );
				return true;

			}else {

				stageElem.alpha -= 0.1;

			}

		}, 1000/60);

    	//Editor.stage.getLayer( MAIN_LAYER ).alpha = 0.3;
    	this.moveToToolsLayer();

    	function cropingBitmap( e ){

    		prop.cropingFunction( e );

    	}

    	this.addEventListener('removed', canvasClick );

    	this.addEventListener('mousedown', function( e ){

			Editor.setVectorStart( e.stageX, e.stageY );

    	});

    	this.addEventListener('pressmove', e=>{

			prop.cropingFunction( e );
			this.redraw()

    	});

    	this.addEventListener('pressup', function( e ){

    		e.stopPropagation();
			Editor.webSocketControllers.editorBitmap.savePosition( prop.objectInside.dbID, prop.objectInside.x, prop.objectInside.y );


    	});

		//Editor.getStage().addEventListener('stagemousemove', cropingBitmap );
		
		function canvasClick( event ){

			prop.removeEventListener('removed', canvasClick );

			e.stopPropagation();
			stageElem.mouseEnabled = true;
			Editor.getStage().removeEventListener('stagemousemove', cropingBitmap );
    		var _this = this;
    		prop.focused = false;
    		prop.backFromToolsLayer( true );
			//stageElem.uncache();
			//Editor.webSocketControllers.editorBitmap.savePosition( prop.objectInside.dbID, prop.objectInside.x, prop.objectInside.y );
			prop.displayUnactiveBorderColor();
			prop.mainLayer.mask = prop._mask;
			//prop.filters = [];
			document.body.style.cursor = "move !important";
			prop.initedCroping = false;
	    	$('.displayController').css( { opacity: 1 } );
	    	$('.displayController').css( 'pointer-events', 'auto' );
			var int2 = setInterval( function(){

				if( stageElem.alpha > 1 ) {

					clearInterval( int2 );
					return true;

				}else {

					stageElem.alpha += 0.1;

				}

			}, 1000/60);


			if( prop.zoomed ){

				prop.zoomed = false;

	    		createjs.Tween.get( prop ).to({ x: prop.xBefore, y : prop.yBefore , scaleX : 1, scaleY : 1 }, 200, createjs.Ease.quadInOut ).call( function(){



				}.bind(prop));

			}

			prop.removeAllEventListeners('click');
			prop.removeAllEventListeners('pressmove');
			prop.removeAllEventListeners('pressup');
			prop.initCurrentEvents();

			Editor.stage.getBackgroundLayer().removeEventListener('click', canvasClick );
			Editor.tools.setEditingObject( null );
			prop.calculateObjectInsideQuality( Editor.getProductDPI() );

			if( prop.filterStack.length ){

				prop.updateFilters();

			}

		}

		Editor.unfocus = canvasClick;

    }

    p.clearHelpers = function(){

		if( this.swapHelper ){

			this.swapHelper.parentNode.removeChild( this.swapHelper );
			this.swapHelper = null;

		}

    };

	p.initCurrentEvents = function(){

		var _this = this;

		this.cursor = 'text';

		this.addEventListener('resizeEnd', function( e ){

			_this.editor.webSocketControllers.proposedImage.setAttributes( _this.dbID, { bounds: _this.getBounds(),size: { height: _this.trueHeight, width: _this.trueWidth }, pos:{ x: _this.x, y:_this.y}} );

		});

		this.addEventListener('resizeCorner', function( e ){

			if( e.resizeMode == 'widthLeft' ){

				_this.setTrueWidth( e.objectSettings.width, false );

			} else if( e.resizeMode == 'widthRight'){

				_this.setTrueWidth( e.objectSettings.width, true );

			}

			if( _this.updateSimpleBorder ){

				_this.updateSimpleBorder();

			}
			_this._updateShape( true );
			_this._updateToolsBoxPosition();

			if( _this._photoIcon ){

				_this._photoIcon.x = _this.width/2;
				_this._photoIcon.y = _this.height/2;

			}

			if( _this.cropingTool ){

				_this.updateCropingTool();

			}

			if( _this.backgroundFrame ){

				_this.backgroundFrame.updateSize();

			}

			_this.updateActiveBorder();

			if( _this._toolBox ){

				_this._toolBox.reconfiguateScaleSlider();

			}

			if( _this.objectInside ){

				_this.editor.webSocketControllers.editorBitmap.setSettings( _this.objectInside.dbID, { x: _this.objectInside.x, y: _this.objectInside.y, scaleX:  _this.objectInside.scaleX, scaleY: _this.objectInside.scaleY } );

			}

			_this.updateDPIHelper();
            _this.calculateObjectInsideQuality( _this.editor.getProductDPI() );

		});

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

			if( _this.cropingTool ){

				_this.updateCropingTool();

			}

			_this.updateActiveBorder();

			if( _this._toolBox ){

				_this._toolBox.reconfiguateScaleSlider();

			}

			if( _this.backgroundFrame ){

				_this.backgroundFrame.updateSize();

			}


			if( _this.objectInside ){

				_this.editor.webSocketControllers.editorBitmap.setSettings( _this.objectInside.dbID, { x: _this.objectInside.x, y: _this.objectInside.y, scaleX:  _this.objectInside.scaleX, scaleY: _this.objectInside.scaleY } );

			}

			_this.updateDPIHelper();
            _this.calculateObjectInsideQuality( _this.editor.getProductDPI() );

		});

		this.addEventListener('rotate', function( e ){

			_this.editor.webSocketControllers.proposedImage.setAttributes( _this.dbID, { rotation: _this.rotation } );

		});

		this.addEventListener('mouseover', function( e ){

			e.stopPropagation();

			_this.displayActiveBorderColor();
			if( _this.getFirstImportantParent().proposedImagePositions.length > 1 )
				_this.displayPositionRemover();

			if( _this.objectInside && userType == 'advancedUser'){

				_this.createCropingTool();

			}

		});

		this.addEventListener('rollout', function( e ){

			e.stopPropagation();

			_this.displayUnactiveBorderColor();
			_this.removePositionRemover();
			_this.deleteCropingTool();

			var overObjects = [];

		});


		this.addEventListener('click', function( e ){

			e.stopPropagation();

			var Editor = _this.editor;
			if( userType == 'advancedUser' ){

                if( !_this.bitmapToolTarget ){
                    _this.bitmapToolTarget=document.createElement('div');
                    document.body.appendChild(_this.bitmapToolTarget);
                    ReactDOM.render( <Provider store={store}><ProposedPositionContextMenu proposedPositionInstance={_this} advanced/></Provider>, _this.bitmapToolTarget);
                }

			}else {

				Editor.tools.setEditingObject( _this.id );

				if( _this.objectInside ){

					_this.focus( e );

					var proposedImages = Editor.userProject.getCurrentView().Pages[0].ProposedTemplate.ProposedImages;

					for( var i=0; i < proposedImages.length; i++ ){

						if( proposedImages[i].order == _this.order ){

							var itemOrder = i;
							break;

						}

					}


                    if( !_this.bitmapToolTarget ){
                        _this.bitmapToolTarget=document.createElement('div');
                        document.body.appendChild(_this.bitmapToolTarget);
                        ReactDOM.render( <Provider store={store}><ProposedPositionContextMenu proposedPositionInstance={_this}/></Provider>, _this.bitmapToolTarget);
                    }

				}else {

					//console.log('wlaczyc mozliwosc zaladowania zdjecia: kliknij na zdjecie, albo wgraj nowe');

				}

			}


		});

		this.addEventListener('pressup', function( e ){

			e.stopPropagation();

			var Editor = _this.editor;

			if( _this.swapHelper ){

				_this.swapHelper.parentNode.removeChild( _this.swapHelper );
				_this.swapHelper = null;

			}

			var overObjects = [];
            Editor.getStage()._getObjectsUnderPoint( e.stageX, e.stageY, overObjects );

            var overDragableObject = false;

            if ( overObjects[0].target ) {
                if( overObjects[0].target.getFirstImportantParent() instanceof EditableArea )
                    overDragableObject = true;
            }


            if( overObjects[0] && overDragableObject){

            	var evt = new createjs.Event('swapPhoto');
            	evt.from = _this;
            	overObjects[0].dispatchEvent( evt );
                Editor.stage.stopPageDroping();

            }else {

                Editor.stage.stopPageDroping();

            }

            if( userType == 'advancedUser'){

            	Editor.webSocketControllers.proposedImage.setAttributes( _this.dbID, { pos: { x: _this.x, y: _this.y} }  );

            }

		});

		this.addEventListener('pressmove', function( e ){

			e.stopPropagation();

			var page = e.currentTarget.getFirstImportantParent();
			if( page.userPage.ProposedTemplate.imagesCount <= 1 || userType =='advancedUser'){

				return;

			}
			if( !_this.swapHelper && _this.objectInside ){
				_this.editor.setVectorStop( e.stageX, e.stageY );
				var vec = _this.editor.getMoveVector() ;

				if( Math.sqrt(Math.pow(vec.x,2)+Math.pow(vec.y,2)) > 5 ){
					var helper = document.createElement( 'div' );
					helper.style.width='100px;';
					helper.style.height='100px;';
					helper.style.backgroundImage = 'url( ' + _this.objectInside.bitmap.image.src + ' )';
					helper.className = 'swapPhotoHelper';
					document.body.appendChild( helper );

					_this.swapHelper = helper;

					var page = e.currentTarget.getFirstImportantParent();
					page.prepareImagesToSwap( _this );
				}

			}else {

				if( _this.objectInside ){

					_this.swapHelper.style.top = e.stageY + 20 + 'px';
					_this.swapHelper.style.left = e.stageX + 20 + 'px';

				}

			}

		});


		this.addEventListener('unclick', function( e ){

			e.stopPropagation();
			/*var Editor = _this.editor;
			$("#proposedTemplate-toolsbox").remove();
			_this.initedCroping = false;

			_this.toolbox = false;
			_this._toolBox = null;
			_this.contextMenu = null;*/

            if( _this.bitmapToolTarget ){
                ReactDOM.unmountComponentAtNode(_this.bitmapToolTarget)
                document.body.removeChild(_this.bitmapToolTarget)
                _this.bitmapToolTarget=null
            }

			setTimeout( function(){
				this.editor.userProject.regenerateSingleViewThumb ( _this.editor.userProject.getCurrentView()._id );
			}, 500 );


		});



        this.addEventListener('stageScroll', function(){


        	_this._updateShape( true );
        	//_this.cropingTool.graphics.c();//.f("rgba(255,0,0, 0.1)").ss( 1/Editor.getStage().scaleX ).s("#666").dc( width/2, height/2, 30/Editor.getStage().scaleX);

        });

	};


	p._updateShape = function( dontUpdateInside ){

        //this.cache( -this.width/2, -this.height/2, this.width*2, this.height*2, 2 );
		this.setBounds( 0,0, this.width, this.height );
		this.background.graphics.c().f("rgba(255,255,255, 0.4)").r( 0,0, this.width, this.height );
		this.background.setBounds( 0, 0, this.width, this.height);
		//this.border.graphics.c().ss(1/Editor.getStage().scaleX).s( this.compoundBorderColor ).mt(0,0).lt( this.width,0).lt( this.width, this.height).lt(0, this.height).cp();
		//this.border.snapToPixel = this.background.snapToPixel = true;
		this._mask.graphics.c().f("rgba(255,255,255, 0.1)").r( 0,0, this.width, this.height );

		this.backgroundHit.graphics.c().f('rgba(0,0,0,0)').r( 0, 0, this.trueWidth, this.trueHeight );
		this.backgroundHit.hitArea.graphics.c().f('rgba(255,0,0,1)').r(0,0, this.trueWidth, this.trueHeight );

		if( this.objectInside ){

			if( dontUpdateInside ){

			}else {

				if( this.objectInside.width/2 + this.objectInside.x < this.width || this.objectInside.height/2 + this.objectInside.y < this.height && this.objectInside.rotation%180 == 0 ){

					if( this.objectInside.width < this.width || this.objectInside.height < this.height )
						this.objectInside.setFullSize();

					this.positionObjectInside();
					$("#scroll-bar").slider('value', this.objectInside.scaleX );

				}else if( this.objectInside.height/2 + this.objectInside.x < this.width || this.objectInside.width/2 + this.objectInside.y < this.height && this.objectInside.rotation%180 == 90 ){
					if( this.objectInside.height < this.width || this.objectInside.width < this.height )
						this.objectInside.setFullSize();

					this.positionObjectInside();
					$("#scroll-bar").slider('value', this.objectInside.scaleX );
				}

			}


		}

		this.uncache();

	};

	p.setSettings = function( settings ){

        this.simpleBorder.visible=this.displaySimpleBorder = settings.displaySimpleBorder;

        if( settings.maskFilter ){
            var maskAsset = this.editor.userProject.findMaskById( settings.maskFilter );
            if( maskAsset ){
                this.addImageAlphaFilter( maskAsset );
            }
        }
        this.maskFilter=settings.maskFilter

		this.shadowColor = settings.shadowColor;
		this.shadowOffsetX = settings.shadowOffsetX;
		this.shadowOffsetY = settings.shadowOffsetY;
		this.shadowBlur = settings.shadowBlur;

		if( settings.dropShadow ){

			//this._dropShadow = true;
			this.dropShadow();

		}

		this.borderWidth = settings.borderWidth || 0;
		this.borderColor = settings.borderColor || 0;
       	this.updateSimpleBorder();

       	this.useBackgroundFrame = settings.backgroundFrame;

       	if( settings.backgroundFrame ){

       		if( settings.backgroundFrameID && settings.backgroundFrameID._id ){//TODO TO remove
                this.backgroundFrameID=settings.backgroundFrameID._id
				this.editor.webSocketControllers.frameObject.get( settings.backgroundFrameID._id, function( data ){

	       			this.setBackgroundFrame( data );

	       		}.bind( this ));

       		}else {
                this.backgroundFrameID=settings.backgroundFrameID
	       		this.editor.webSocketControllers.frameObject.get( settings.backgroundFrameID, function( data ){

	       			this.setBackgroundFrame( data );

	       		}.bind( this ));

       		}

		   }

		   this.effectName=settings.effectName;

	};

	p.loadImage = function( image, used ){
const addNewBitmap=()=>{
    var projectImage = Editor.userProject.getProjectImage( image.ProjectImage.uid );
    image.ProjectImage = projectImage;

    var img = safeImage();
    img.src = image.ProjectImage.getImage();

    var newBitmap = new Bitmap(

        'test',
        img,
        false,
        true,
        {
            width : image.ProjectImage.width,
            height : image.ProjectImage.height,
            trueWidth : image.ProjectImage.width,
            trueHeight : image.ProjectImage.height,
            scaleX : image.scaleX,
            scaleY : image.scaleY,
            x : image.x,
            y : image.y,
            originWidth : image.ProjectImage.trueWidth,
            originHeight : image.ProjectImage.trueHeight,
            rotation : image.rotation

        },
        null

    );
    img.onload = ()=>{

        newBitmap.projectImage = image.ProjectImage;
        newBitmap.width = image.ProjectImage.width*image.scaleX;
        newBitmap.height = image.ProjectImage.height*image.scaleY;
        newBitmap.dbID = image._id;

        _this.mainObject.addChild( newBitmap );
        Editor.stage.addObject( newBitmap );
        _this.objectInside = newBitmap;

        newBitmap.removeAllEventListeners();
        _this._updateShape();
        this.hitArea = null;
        _this.calculateObjectInsideQuality( Editor.getProductDPI() );
        _this.updateFilters();
        _this.mainObject.alpha = 0;
        createjs.Tween.get( _this.mainObject).to({ alpha: 1 }, 300, createjs.Ease.quadInOut );
        setTimeout( function(){
            _this.insideReady = true;
        }, 300);
    }
};
		var _this = this;
        var Editor = this.editor;

        if( this.maskShape ){

        	this.maskShape.parent.removeChild( this.maskShape );
        	this.maskShape = null;

        }


        if( this.objectInside ){

            createjs.Tween.get( this.objectInside ).to({ alpha: 0}, 300, createjs.Ease.quadInOut ).call(

            	function( e ){

					this.objectInside.parent.removeChild( this.objectInside );
		        	this.objectInside = null;

					addNewBitmap()

            	}.bind( this )

            );

        }else {

	        if( image instanceof Bitmap ){

	        	var newBitmap = image;
				_this.hitArea = null;
		        _this.background.visible = false;
				newBitmap.projectImage = image.ProjectImage;
		        _this.mainObject.addChild( newBitmap );
		        Editor.stage.addObject( newBitmap );
		        _this.objectInside = newBitmap;
		        newBitmap.removeAllEventListeners();
				_this._updateShape();
				this.setSettings( settings );



    			_this.calculateObjectInsideQuality( Editor.getProductDPI() );

	        }else {
				addNewBitmap();
		    }

		}

		_this.displayUnactiveBorderColor();
		_this.addPhotoIcon.visible = false;

    };
