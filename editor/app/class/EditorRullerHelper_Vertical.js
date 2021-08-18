var EditorObject = require('./EditorObject').EditorObject;
    
    //console.log( EditorObject );
    function EditorRullerHelper_Vertical( color, type ){

		EditorObject.call( this );
		
		this.shape = new createjs.Shape();

		this.type = type;
		this.width = 1;
		this.height = 10000;
		this.trueWidth = 1;
		this.trueHeight =10000;
		this.isBlocked  = false;
		this.lineType   = type || 'line';
		this.trueWidth  = 10000;
		this.trueHeight = 1;
		this.dbId;
        this.color      = color;
        this.cursor = 'col-resize';
        this.y = -this.height/2;

        if( type == 'line' ){

            this.shape.graphics.ss(1/Editor.getStage().scaleX).s( color ).mt(0,0).lt(0, this.height );

        }
        else {
        
            for( var i=0; i < this.height/12; i++){

                this.shape.graphics.ss(1/Editor.getStage().scaleX).s( color ).mt( 0, 0 + i*12 ).lt( 0, 0 + i*12 +8 );

            }
            
        }

        
        this.addChild( this.shape );
        this.initEvents();
        //this.cache( -1.5, 0, 1.5, this.height, 2 );

        this.hitArea = new createjs.Shape();
        this.hitArea.graphics.f('red').r( -1.5, 0, 3, this.height );
        //this.mouseEnabled = false;
        //this.visible = false;
        
	};

    var p = EditorRullerHelper_Vertical.prototype = $.extend( true, {}, new Object( EditorObject.prototype ) );

	p.constructor = EditorRullerHelper_Vertical;

    
    p.lookForClosestVerticalLine = function(){
        
        var closest = [];
        
        for( var i=0; i < this.parent.children.length; i++ ){
            
            if( this.parent.children[i] instanceof Editor.EditorRullerHelper_Vertical && this.parent.children[i] != this ){
                
                if( (this.parent.children[i].x-this.x < 30) && (this.parent.children[i].x-this.x > -30 )){

                    closest.push( this.parent.children[i] );
                    this.color='red';
                    this.parent.children[i].color = 'red';
                    this.graphics.c().ss(1/Editor.getStage().scaleX).s('red').mt(0,0).lt(0, this.height );
                    //this.parent.children[i].visible = true;
                    this.parent.children[i].graphics.c().ss(1/Editor.getStage().scaleX).s('red').mt(0,0).lt(0, this.height );
                    this.x = this.parent.children[i].x;
                    this.object.x = this.parent.children[i].x + this.object.regX*this.object.scaleX;

                }
                else {

                    this.parent.children[i].visible = false;
                    
                    this.color='#01aeae';
                    this.parent.children[i].color = '#01aeae';
                    this.graphics.c().ss(1/Editor.getStage().scaleX).s(this.color).mt(0,0).lt(0, this.height );
                    this.parent.children[i].graphics.c().ss(1/Editor.getStage().scaleX).s(this.parent.children[i].color).mt(0,0).lt(0, this.height );
                    
                }
                
            }
            
        }
            
    };


    p.updateShape = function(){

		this.shape.graphics.c();

        if( this.type == 'line' ){

            this.shape.graphics.ss(1/Editor.getStage().scaleX).s( this.color ).mt(0,0).lt(0, this.height );

        }
        else {
        
            for( var i=0; i < this.height/12; i++){

                this.shape.graphics.ss(1/Editor.getStage().scaleX).s( this.color ).mt( 0, 0 + i*12 ).lt( 0, 0 + i*12 +8 );

            }
            
        }

    };
    
    
    p.initEvents = function(){
    
        var _this = this;
        
		this.addEventListener( 'mousedown', function(e){
                        
            e.stopPropagation(e);
			//console.log( e );
			_this.setCenterReg();
			Editor.setVectorStart( e.stageX, e.stageY );

		});

        this.addEventListener('stageScroll', function(){

            _this.updateShape();

        });



     this.addEventListener('pressup', function(e){

            var xyPos = Editor.stage.getMousePosition(e.stageX, e.stageY);
            //console.log("************************ xyPOS **********************");
            //console.log(xyPos);
            var o = Editor.getStage().getObjectsUnderPoint(xyPos[0], xyPos[1]);

            for ( var i=0 ; i < o.length ; i++){

                if ( o[i].name == "rulerVert" ){

                    //console.log("Usuwam linie....");
                    //Editor.getStage().clear();    
                    _this.parent.removeChild( _this );                    
                }
            }

            //console.log("Vertical Helper Dropped On: ");
            //console.log(o);
        });


		this.addEventListener( 'pressmove', function(e){

			e.stopPropagation();

			var _this = e.currentTarget;
			
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

				_this.x -= vec.x * 1/scaleX;


				_this.dispatchEvent("move");


			}

		});

		this.addEventListener('pressup', function(e){
            
            /*
			e.stopPropagation();

			var o = e.currentTarget;
			var obj = Editor.stage.getObjectById( o.id );

			var transformations = {

				rotation : o.rotation,
				x : o.x,
				y : o.y,
				sX : o.scaleX,
				sY : o.scaleY,
				tw : obj.trueWidth,
				th : obj.trueHeight,
				w : obj.width,
				h : obj.height,
				rX : o.regX,
				rY : o.regY
				
			};
            */
			//_this.updateInDB( "matrix", JSON.stringify( transformations ) );	
            
		});
        
    };
    
    
    export {EditorRullerHelper_Vertical};

