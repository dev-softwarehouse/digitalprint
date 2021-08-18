var EditComponent = require('./../../EditComponent').EditComponent;


var size = 10;

var tms = new createjs.Shape();
//tms.graphics.beginFill("black").drawRect(0,0,size,size);
tms.graphics.beginFill("black").drawRect(0,0,size,size);
tms.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
tms.regX = tms.regY = size/2;
//tms.regX = tms.regY = size/2;
tms.cursor = 'n-resize';

var resizeTM = [

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

			var size_Y = editingObject.height - localCursorPosition.y * editingObject.scaleY;
			var centerPosition = component.parent.localToLocal( editingObject.trueWidth/2, editingObject.trueHeight/2 + localCursorPosition.y/2, editingObject.parent );

			var sizeBefore = editingObject.trueWidth;

			editingObject.setTrueHeight( size_Y );

			if( userType == 'admin' ){

				document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);
		    	document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);

			}


			editingObject.setPosition( centerPosition.x , centerPosition.y ); //e.stageY + bounds.height/2 );

			if( editingObject.mask ){

				editingObject.mask.regX = editingObject.regX;
				editingObject.mask.regY = editingObject.regY;

			}

			/*
			//jezeli beda wszystkie obiekty cachowane, prawdopodobnie ten warunek trzeba bedzie usunac
			if( editingObject instanceof Editor.ProposedPosition || editingObject instanceof Editor.Text2 ){

				//editingObject.objectInside.y -= sizeBefore-size_Y;
				editingObject._updateShape();

			}
			*/

			editingObject.dispatchEvent( "stageScroll" );
			editingObject.dispatchEvent('resize');
            editingObject.needRedraw=true
			this.tools.init();

		}

	},

	{
		event : 'pressup',
		'function' : function(e){

			e.stopPropagation();
			var editing_id = this.id;
			var editingObject = this.objectReference;
			var hist = editingObject.history_tmp;
            editingObject.dispatchEvent('resizeEnd');

		}
	}

];


export var resizeTopMiddle = new EditComponent('right-bottom-resize', 'click', tms, 'tm', resizeTM);
