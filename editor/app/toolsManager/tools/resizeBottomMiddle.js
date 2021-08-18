var EditComponent = require('./../../EditComponent').EditComponent;

var size = 10;

var bms = new createjs.Shape();
//ms.graphics.beginFill("black").drawRect(0,0, button_size, button_size);
bms.graphics.beginFill("black").drawRect(0,0,size,size);
bms.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
bms.regX = bms.regY = size/2;
bms.cursor = 's-resize';


var resizeBM = [
	{
		event : 'mousedown',
		'function' : function(e){

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

			var size_Y = localCursorPosition.y * editingObject.scaleY;
			var centerPosition = component.parent.localToLocal( editingObject.trueWidth/2, ((localCursorPosition.y - editingObject.trueHeight)/2.0)+editingObject.trueHeight/2.0, editingObject.parent);
			editingObject.setTrueHeight( size_Y );

			editingObject.setPosition( centerPosition.x  , centerPosition.y ); //e.stageY + bounds.height/2 );

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
			if( editingObject instanceof ProposedPosition || editingObject instanceof ProposedTextPosition || editingObject instanceof Text2 ){

				//editingObject._updateShape();

			}
			*/

			editingObject.dispatchEvent('resize');
            editingObject.needRedraw=true
			this.tools.update();

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

export var resizeBottomMiddle = new EditComponent('right-bottom-resize', 'click', bms, 'bm', resizeBM);
