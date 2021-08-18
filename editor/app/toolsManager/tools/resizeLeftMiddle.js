var EditComponent = require('./../../EditComponent').EditComponent;

var size = 10;

var lms = new createjs.Shape();
//lms.graphics.beginFill("black").drawRect(0,0,size,size);

lms.graphics.beginFill("black").drawRect(0,0,size,size);
lms.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
lms.regX = lms.regY = size/2;
lms.cursor = 'w-resize';
//lms.regX = lms.regY = size/2;


var resizeLM = [

	{
		event : 'mousedown',
		'function' : function(e){

			e.stopPropagation();

		}

	},

	{
		event : 'pressmove',
		'function' : function(e){

			e.stopPropagation();

			var editing_id = this.id;
			var editingObject = this.objectReference;
			var component = e.currentTarget;
			var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);
			var size_X = editingObject.width - ( localCursorPosition.x * editingObject.scaleX );
			var centerPosition = component.parent.localToLocal( ( ( editingObject.trueWidth + localCursorPosition.x ))/2, editingObject.trueHeight/2, editingObject.parent);

            if( editingObject.minWidth < size_X || !editingObject.minWidth ){

                editingObject.setTrueWidth( size_X );
                editingObject.setPosition( centerPosition.x , centerPosition.y ); //e.stageY + bounds.height/2 );


				if( userType == 'admin' ){

					document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);
		    		document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);

				}


                if( editingObject.mask ){

                    editingObject.mask.regX = editingObject.regX;
                    editingObject.mask.regY = editingObject.regY;

                }

                //jezeli beda wszystkie obiekty cachowane, prawdopodobnie ten warunek trzeba bedzie usunac
                /*
                if( editingObject instanceof Editor.ProposedPosition || editingObject instanceof Editor.ProposedTextPosition || editingObject instanceof Editor.Text2 ){

                    editingObject.widthUpdate = true;
                    editingObject._updateShape();

                }
                */


                // dzieki temu ze jest event bedziemy mogli to wykonac tylko raz w updace
                var resizeEvent = new createjs.Event("resize");

                resizeEvent.resizeMod = 'widthLeft';
				resizeEvent.objectSettings = {

					size_X : size_X,
					pos : centerPosition

				};
				editingObject.dispatchEvent( "stageScroll" );
				editingObject.dispatchEvent( resizeEvent );
                editingObject.needRedraw=true
                this.tools.update();

            }

		}
	},

	{
		event : 'pressup',
		'function' : function(e){

			e.stopPropagation();
			var editing_id = this.id;
			var editingObject = this.objectReference;
            editingObject.dispatchEvent('resizeEnd');

		}

	}

];

export var resizeLeftMiddle = new EditComponent( 'right-bottom-resize', 'click', lms, 'lm', resizeLM );
