(function(){

    function EditorRullerHelper_Horizontal( color, type ){

    	// inicjalizacja konstruktora
		Editor.Object.call( this, false );
		//createjs.Shape.call( this );
        
		this.shape = new createjs.Shape();
		this.type       = type;
		this.width 	    = 10000;
		this.height     = 1;
		this.trueWidth  = 10000;
		this.trueHeight = 1;
		this.isBlocked  = false;
		this.lineType   = type || 'line';
		this.trueWidth  = 10000;
		this.trueHeight = 1;
		this.dbId;
        this.color      = color;
        
        if( this.lineType == 'line' ){

            this.shape.graphics.ss(1/Editor.getStage().scaleX).s( this.color ).mt(0,0).lt(this.width,0);
            
        }
        else {
            
            for( var i=0; i < this.width/12; i++){

                this.shape.graphics.ss(1/Editor.getStage().scaleX).s( this.color ).mt( 0 + i*12, 0 ).lt( 0 + i*12 +8, 0 );

            }
            
        }
        
        this.addChild( this.shape );
        //this.graphics.ss(1).s("red").mt( -this.width/2, 0 ).lt( this.width/2, 0 );
        this.cursor = 'row-resize';
        //this.cache(0,-1.5,this.width, 1.5, 2);
        this.x = -this.width/2;
        this.snapToPixel = true;
        this.hitArea = new createjs.Shape();
        this.hitArea.graphics.f('red').r( 0, -1.5, this.width, 3 );

        this.initEvents();
        //this.mouseEnabled = false;
        //this.visible = false;
        
	};

	



    var p = EditorRullerHelper_Horizontal.prototype = $.extend( true, {}, new Object( Editor.Object.prototype ) );

	p.constructor = EditorRullerHelper_Horizontal;
    
    
    p.updateShape = function(){

		this.shape.graphics.c();

        if( this.type == 'line' ){

            this.shape.graphics.ss(1/Editor.getStage().scaleX).s( this.color ).mt(0,0).lt(this.width,0);

        }
        else {
        
            for( var i=0; i < this.width/12; i++){

                this.shape.graphics.ss(1/Editor.getStage().scaleX).s( this.color ).mt( 0 + i*12, 0 ).lt( 0 + i*12 +8, 0 );

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
            //console.log('::: Horizontal RulerHelper is clicked ::: ');
            
		});

		this.addEventListener( 'pressmove', function(e){

			e.stopPropagation();

			
            //console.log('::: Horizontal RulerHelper is clicked and dragged over the scene :::');
            
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
                
				_this.y -= vec.y * 1/scaleY;

				_this.dispatchEvent("move");
			}
				

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

        		if ( o[i].name == "rulerHor" ){

        			//console.log("Usuwam linie....");
        			//Editor.getStage().clear();	
        			_this.parent.removeChild( _this );
        		}
        	}

        	//console.log("Horizontal Helper Dropped On: ");
            //console.log(o);
        });


		this.addEventListener('pressup', function(e){
            
           // var _this = this;
            var _this = e.currentTarget;

            //console.log("::: --> Horizontal RulerHelper on PRESSUP (no more dragging) <-- :::")
    
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
    
    Editor.EditorRullerHelper_Horizontal = EditorRullerHelper_Horizontal;

})();