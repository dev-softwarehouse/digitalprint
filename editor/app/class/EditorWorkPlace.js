(function(){

    function EditorWorkPlace( initEvents ){

		Editor.Object.call( this, initEvents );
		createjs.Shape.call( this );

		this.position = 0;
		this.tools;

		this.isBlocked = false;
		this.type = null;
		this.dbId;
        

        this.initEvents();

	};

    var p = EditorWorkPlace.prototype = $.extend( true, createjs.Shape.prototype, Editor.Object.prototype, {} );

	p.constructor = EditorWorkPlace;


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


    Editor.EditorWorkPlace = EditorWorkPlace;

})();
