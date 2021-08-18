var EditComponent = require('./../../EditComponent').EditComponent;


var size = 14;

var bms = new createjs.Shape();
//ms.graphics.beginFill("black").drawRect(0,0, button_size, button_size);
bms.graphics.beginFill("black").drawRect(0,0,size,size);
bms.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
bms.regX = bms.regY = size/2;



var scaleBM = [
	{
		event : 'mousedown',
		'function' : function(e){

			e.stopPropagation();		
			var editing_id = this.id;
			var editingObject = this.objectReference;

		}
	
	},
	{
		event : 'pressmove',
		'function' : function(e){

			e.stopPropagation();

			var editing_id = this.id;
			var editingObject = this.objectReference;
			var component = e.currentTarget;
				
			if ( editingObject.borderWidth == 0 ){

				editingObject.unDropBorder();
				
			}	
			
			if( userType == 'admin'){

				document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);				
		    	document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);

			}

	    	
			var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);

			var size_Y = localCursorPosition.y * editingObject.scaleY;
			var centerPosition = component.parent.localToLocal( editingObject.width/2, ((localCursorPosition.y - editingObject.height)/2.0)+editingObject.height/2.0, editingObject.parent);
			editingObject.setHeight( size_Y );
			editingObject.setPosition( centerPosition.x  , centerPosition.y ); //e.stageY + bounds.height/2 );

			if( editingObject.mask ){
				editingObject.mask.regX = editingObject.regX;
				editingObject.mask.regY = editingObject.regY;
			}
            //Editor.webSocketControllers.productType.adminProject.view.editorObject.scale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );
			this.tools.init();


		}

	},
	{
		event : 'pressup',
		'function' : function(e){

			e.stopPropagation();
			var editing_id = this.id;
			var editingObject = this.objectReference;
			editingObject.dispatchEvent('scale');

			if( !editingObject.isInEditableArea() || (userType == 'user') ){

				editingObject.updateTransformInDB();

			}
			
            //Editor.webSocketControllers.productType.adminProject.view.editorBitmap.saveScale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );
            
		}

	}
];

export var scaleBottomMiddle = new EditComponent('right-bottom-scale', 'click', bms, 'bm', scaleBM);
