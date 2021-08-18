var EditComponent = require('./../../EditComponent').EditComponent;


var size = 14;

var lms = new createjs.Shape();
//lms.graphics.beginFill("black").drawRect(0,0,size,size);

lms.graphics.beginFill("black").drawRect(0,0,size,size);
lms.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
lms.regX = lms.regY = size/2;
//lms.regX = lms.regY = size/2;


var scaleLM = [

	{
		event : 'mousedown',
		'function' : function(e){

			e.stopPropagation();

			var editing_id = this.id;
			var editingObject = this.objectReference;
			var hist = editingObject.history_tmp;

		}
	
	},

	{
		event : 'pressmove',
		'function' : function(e){

			e.stopPropagation();
			var editing_id = this.id;
			var editingObject = this.objectReference;

			if ( editingObject.borderWidth == 0 ){

				editingObject.unDropBorder();
				
			}

			if( userType == 'admin'){
				document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);				
		    	document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);
		    }

	    	
			var component = e.currentTarget;
			var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);
			var size_X = ( editingObject.width - localCursorPosition.x ) * editingObject.scaleX;
			var centerPosition = component.parent.localToLocal( ( ( editingObject.width + localCursorPosition.x ))/2, editingObject.height/2, editingObject.parent);
			editingObject.setWidth( size_X );
			editingObject.setPosition( centerPosition.x , centerPosition.y ); //e.stageY + bounds.height/2 );
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
			//editingObject.updateTransformInDB();
            //Editor.webSocketControllers.productType.adminProject.view.editorBitmap.saveScale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );
            
		}

	}

];

export var scaleLeftMiddle = new EditComponent( 'right-bottom-scale', 'click', lms, 'lm', scaleLM );
