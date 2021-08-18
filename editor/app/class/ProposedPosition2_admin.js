var ProposedPositionContextMenu = require('./ProposedPositionContextMenu_user').ProposedPositionContextMenu;
import {Bitmap} from './EditorBitmap';
import {EditableArea} from './editablePlane';
    
    function ProposedPosition2(){

    }

	var p = ProposedPosition2.prototype;

    /**
    * Inicjalizuje kadrowanie obiektu
    *
    * @method initCroping
    */
    p.initCropping = function( event ){

        //event.stopPropagation();

        var _this = this.objectInside;
        var prop = this;

        /*
        prop.initMask();
        prop.mainLayer.mask = null;
        Editor.setVectorStart( event.stageX, event.stageY );
        */

        prop.cropingTool.addEventListener('pressup',  function( e ){

            e.stopPropagation();
            prop.uncache();
            prop.mainLayer.mask = prop._mask;
            prop.filters = [];
            document.body.style.cursor = "auto";
            prop.initedCroping = false;
        
            prop.cropingTool.addEventListener('mousedown', function( e ){

                e.stopPropagation();

            });

        });

        prop.cropingTool.addEventListener('mousedown',  function( e ){

            e.stopPropagation();
            Editor.setVectorStart( e.stageX, e.stageY );

        });

        prop.cropingTool.addEventListener('pressmove', function( e ){
    
            e.stopPropagation();

            if( e.nativeEvent.button == 0 && Editor.stage.getMouseButton() != 1 ){

                document.body.style.cursor = "move";

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

                var vecX = vec.x *1/scaleX;
                var vecY = vec.y *1/scaleY;

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

                prop.updateMask();
                Editor.tools.updateCompoundBox();

            };

        });

    };


	p.initCurrentEvents = function(){

        var _this = this;
        //console.log( _this );
        //console.log('trzeba to sprawdzić');
        this.addEventListener('click', function( e ){

            e.stopPropagation();

                if( _this.objectInside ){

                    if( !_this.toolbox && userType == 'admin' ){

                        _this.toolbox = new ProposedPositionContextMenu( _this, 'full' );
                        //_this.initToolBox();
                        //$(".scroll-bar").slider('value', _this.objectInside.scaleX );
                        //$(".scroll-bar").attr('data-value', $(".scroll-bar").slider('value') );

                    }
                    else if( !_this.toolbox ) {

                        _this.toolbox = new ProposedPositionContextMenu( _this, 'full' );
                        //_this.initToolBox();

                    }

                }

            
                else {

                    if( !_this.toolbox ){
                        _this.toolbox = new ProposedPositionContextMenu( _this, 'min' );
                    }

                }



        });

        this.addEventListener('unclick', function( e ){

            e.stopPropagation();

            $("#proposedTemplate-toolsbox").remove();

            _this.toolbox = false;
            _this._toolBox = null;
            _this.contextMenu = null;

                
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

                Editor.webSocketControllers.editorBitmap.setSettings( _this.objectInside.dbID, { x: _this.objectInside.x, y: _this.objectInside.y, scaleX:  _this.objectInside.scaleX, scaleY: _this.objectInside.scaleY } );
                
            }

            _this.updateDPIHelper();

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

                Editor.webSocketControllers.editorBitmap.setSettings( _this.objectInside.dbID, { x: _this.objectInside.x, y: _this.objectInside.y, scaleX:  _this.objectInside.scaleX, scaleY: _this.objectInside.scaleY } );
                
            }

            _this.updateDPIHelper();

        });

	};

	
	p.loadImage = function( image, used ){
            
        var _this = this;
        
        var newBitmap = new Editor.Bitmap( 

            'test', 
            image.minUrl, 
            false, 
            true,
            {
                width  : image.width,
                height : image.height,
            }

        );

        newBitmap.img = image.imageUrl;
        newBitmap.minImg = image.miniature;
        newBitmap.collectionReference = image;


        newBitmap.width = newBitmap.trueWidth = image.width;
        newBitmap.height = newBitmap.trueHeight = image.height;
        newBitmap.regX = newBitmap.width/2;
        newBitmap.regY = newBitmap.height/2;
        
        _this.hitArea = null;
        _this.background.visible = false;

        _this.mainObject.addChild( newBitmap );
        Editor.stage.addObject( newBitmap );
        _this.objectInside = newBitmap;
        //newBitmap.mouseEnabled = false;
        
        //newBitmap.setCenterReg();
        newBitmap.center();

        newBitmap.removeAllEventListeners();
        _this.objectInside.setFullSize();
        _this.objectInside.center();
		_this._updateShape();
		//_this.mask = null;
        //_this.updateMask();

        if( this.toolbox ){

        	$("#proposedTemplate-toolsbox").remove();
        	this.toolbox = new Editor.ProposedPositionContextMenu( _this, 'full' );

        }


        if( !used ){
            this.imageKey = _this.parent.parent.addUsedPhoto( image );
        }
   
    };

    p._updateShape = function(){

        //this.cache( -this.width/2, -this.height/2, this.width*2, this.height*2, 2 );
        this.setBounds( 0,0, this.width, this.height );
        this.background.graphics.c().f("rgba(255,255,255, 0.4)").r( 0,0, this.width, this.height );
        this.background.setBounds( 0, 0, this.width, this.height);
        this.border.graphics.c().ss(1/this.editor.getStage().scaleX).s( this.compoundBorderColor ).mt(0,0).lt( this.width,0).lt( this.width, this.height).lt(0, this.height).cp();
        this.border.snapToPixel = this.background.snapToPixel = true;           
        this._mask.graphics.c().f("rgba(255,255,255, 0.1)").r( 0,0, this.width, this.height );

        this.backgroundHit.graphics.c().f('rgba(0,0,0,0)').r( 0, 0, this.trueWidth, this.trueHeight );
        this.backgroundHit.hitArea.graphics.c().f('rgba(255,0,0,1)').r(0,0, this.trueWidth, this.trueHeight );
        

        this.background.visible = true;
        /*
        if( (30/Editor.getStage().scaleX) < (this.width*0.5/2) && (30/Editor.getStage().scaleX) < (this.height*0.5/2) ){
        
            this.cropingTool.graphics.c().f("rgba(255,0,0, 0.1)").ss(1/Editor.getStage().scaleX).s("#666").dc( this.width/2, this.height/2, 30/Editor.getStage().scaleX);

        }
        else {

            this.cropingTool.graphics.c().f("rgba(255,0,0, 0.1)").ss(1/Editor.getStage().scaleX).s("#666").dc( this.width/2, this.height/2, ( ( this.height > this.width )? (this.width*0.5/2) : (this.height*0.5/2) ) );

        }
        */

        if( this.objectInside ){

            if( this.objectInside.width/2 + this.objectInside.x < this.width || this.objectInside.height/2 + this.objectInside.y < this.height  ){

                if( this.objectInside.width < this.width || this.objectInside.height < this.height )
                    this.objectInside.setFullSize();

                this.positionObjectInside();
                $("#scroll-bar").slider('value', this.objectInside.scaleX );

            }

        }
        this.uncache();
        //this.objectInside.center();
        //this.updateCache();

    };


export {ProposedPosition2};