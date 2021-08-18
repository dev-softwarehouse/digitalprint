(function(){

    function EditorRullerHelper_Vertical( initEvents ){

		Editor.Object.call( this, initEvents );
		createjs.Shape.call( this );
        
		this.position = 0;
		this.tools;
		this.width = 1;
		this.height = 10000;
		this.trueWidth = 1;
		this.trueHeight =10000;
		this.isBlocked = false;
		this.type = null;
		this.dbId;
        this.graphics.ss(1).s("red").mt( 0, -this.height/2 ).lt( 0, this.height/2 );
        this.cursor = 'pointer';
        
        this.initEvents();
        
	};

    var p = EditorRullerHelper_Vertical.prototype = $.extend( true, createjs.Shape.prototype, Editor.Object.prototype, {} );

	p.constructor = EditorRullerHelper_Vertical;

    
    p.initEvents = function(){
    
        var _this = this;
        
		this.addEventListener( 'mousedown', function(e){
                        
            e.stopPropagation(e);
			//console.log( e );
			_this.setCenterReg();
			Editor.setVectorStart( e.stageX, e.stageY );

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
				_this.y -= vec.y * 1/scaleY;


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
    
    
    Editor.EditorRullerHelper_Vertical = EditorRullerHelper_Vertical;

})();