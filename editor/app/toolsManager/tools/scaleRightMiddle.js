var EditComponent = require('./../../EditComponent').EditComponent;


var size = 14;

var rms = new createjs.Shape();
//rms.graphics.beginFill("black").drawRect(0,0,size,size);

rms.graphics.beginFill("black").drawRect(0,0,size,size);
rms.graphics.mt(0,0).ss(1).s("#a8a8a8").lt(0, size).lt(size, size).lt(size,0).lt(0,0).cp();
rms.regX = rms.regY = size/2;
//rms.regX = rms.regY = size/2;


var scaleRM = [

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
			var component = e.currentTarget;

			if ( editingObject.borderWidth == 0 ){

				editingObject.unDropBorder();
				
			}
			if( userType == 'admin'){

				document.getElementById('positionSetW').value = parseInt(editingObject.height * editingObject.scaleY).toFixed(2);				
		    	document.getElementById('positionSetSZ').value = parseInt(editingObject.width * editingObject.scaleX).toFixed(2);
		    }
	    	
			
			var localCursorPosition = component.parent.globalToLocal( e.stageX, e.stageY);
			var size_X = localCursorPosition.x * editingObject.scaleX;
			var centerPosition = component.parent.localToLocal( (editingObject.width + (  localCursorPosition.x - editingObject.width ))/2, editingObject.height/2, editingObject.parent );

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
			var hist = editingObject.history_tmp;
			
			editingObject.dispatchEvent('scale');
				
            //Editor.webSocketControllers.productType.adminProject.view.editorBitmap.saveScale( editingObject.x, editingObject.y, editingObject.scaleX, editingObject.scaleY, editingObject.dbID );
            if( !editingObject.isInEditableArea() || (userType == 'user') ){

				editingObject.updateTransformInDB();

			}

            //editingObject.updateTransformInDB();
			//editingObject.saveTransformation();

		}

	}

];


export var scaleRightMiddle = new EditComponent('right-bottom-scale', 'click', rms, 'rm', scaleRM);
